// WhatsApp Communication Channel using WhatsApp Business API
// Using mock for whatsapp-web.js
import { WhatsAppWebClient, LocalAuth, MessageMedia } from '../mocks/whatsapp-web-mock';
import { ChannelCapability } from '../../../types';
import { BaseChannel } from './BaseChannel';
import { CommunicationError } from '../core/types';
/**
 * WhatsApp Communication Channel
 * Supports both WhatsApp Web (whatsapp-web.js) and WhatsApp Business API
 */
export class WhatsAppChannel extends BaseChannel {
    constructor(config, repository, configProvider, logger, metrics, rateLimiter) {
        super(config, repository, configProvider, logger, metrics, rateLimiter);
        this.name = 'whatsapp';
        this.capabilities = [
            ChannelCapability.TEXT,
            ChannelCapability.IMAGES,
            ChannelCapability.DOCUMENTS,
            ChannelCapability.RICH_CONTENT,
            ChannelCapability.DELIVERY_STATUS
        ];
        this.priority = 85; // High priority
        this.maxRetries = 3;
        this.isWebClientReady = false;
        this.businessApiBaseUrl = 'https://graph.facebook.com/v18.0';
        if (config.useWebClient) {
            this.initializeWebClient();
        }
    }
    /**
     * Initialize WhatsApp Web Client
     */
    async initializeWebClient() {
        try {
            const config = this.config;
            this.webClient = new WhatsAppWebClient({
                authStrategy: new LocalAuth({
                    clientId: 'dudufisio-wa-client',
                    dataPath: config.sessionPath || './wa-session'
                }),
                puppeteer: {
                    headless: true,
                    args: ['--no-sandbox', '--disable-setuid-sandbox'],
                    ...config.puppeteerOptions
                }
            });
            this.webClient.on('ready', () => {
                this.isWebClientReady = true;
                this.logger.info('WhatsApp Web Client is ready');
                this.metrics.increment('whatsapp.web_client.ready');
            });
            this.webClient.on('auth_failure', (msg) => {
                this.logger.error('WhatsApp Web Client authentication failed', new Error(msg));
                this.metrics.increment('whatsapp.web_client.auth_failure');
            });
            this.webClient.on('disconnected', (reason) => {
                this.isWebClientReady = false;
                this.logger.warn('WhatsApp Web Client disconnected', { reason });
                this.metrics.increment('whatsapp.web_client.disconnected');
            });
            this.webClient.on('message', (message) => {
                // Handle incoming messages for webhooks/callbacks
                this.handleIncomingMessage(message);
            });
            // Initialize client (will trigger QR code scan if needed)
            await this.webClient.initialize();
        }
        catch (error) {
            this.logger.error('Failed to initialize WhatsApp Web Client', error instanceof Error ? error : new Error(String(error)));
            throw new CommunicationError('WHATSAPP_INIT_FAILED', 'Failed to initialize WhatsApp client');
        }
    }
    /**
     * Handle incoming WhatsApp messages
     */
    handleIncomingMessage(message) {
        try {
            // This would typically update delivery status or trigger webhooks
            this.logger.debug('Received WhatsApp message', {
                from: message.from,
                body: message.body?.substring(0, 100),
                type: message.type
            });
            // Could trigger status updates here
            this.metrics.increment('whatsapp.messages.received');
        }
        catch (error) {
            this.logger.error('Error handling incoming WhatsApp message', error instanceof Error ? error : new Error(String(error)));
        }
    }
    /**
     * Send message through WhatsApp
     */
    async send(message) {
        const startTime = Date.now();
        try {
            // Validate message
            const validation = this.validateMessage(message);
            if (!validation.valid) {
                throw new CommunicationError('WHATSAPP_VALIDATION_FAILED', `Validation failed: ${validation.errors.join(', ')}`);
            }
            // Check if channel is enabled
            if (!this.isEnabled()) {
                throw new CommunicationError('WHATSAPP_DISABLED', 'WhatsApp channel is disabled');
            }
            // Check rate limit
            const rateLimitOk = await this.checkRateLimit(message.recipient);
            if (!rateLimitOk) {
                throw new CommunicationError('WHATSAPP_RATE_LIMIT', 'Rate limit exceeded for WhatsApp', true, 60000);
            }
            const config = this.config;
            let result;
            if (config.useWebClient) {
                result = await this.sendViaWebClient(message);
            }
            else {
                result = await this.sendViaBusinessApi(message);
            }
            const duration = Date.now() - startTime;
            this.recordDeliveryMetrics(result.success, duration, result.cost);
            return result;
        }
        catch (error) {
            const duration = Date.now() - startTime;
            this.recordDeliveryMetrics(false, duration);
            if (error instanceof CommunicationError) {
                return this.handleError(error, { messageId: message.id });
            }
            return this.handleError(new CommunicationError('WHATSAPP_SEND_FAILED', 'Failed to send WhatsApp message', true), { messageId: message.id });
        }
    }
    /**
     * Send message via WhatsApp Web Client
     */
    async sendViaWebClient(message) {
        if (!this.webClient || !this.isWebClientReady) {
            throw new CommunicationError('WHATSAPP_WEB_NOT_READY', 'WhatsApp Web Client is not ready');
        }
        try {
            const recipient = message.recipient;
            const phoneNumber = this.formatPhoneNumber(recipient.phone);
            const content = this.prepareMessageContent(message);
            let sentMessage;
            if (message.content.attachments && message.content.attachments.length > 0) {
                // Send with media
                const attachment = message.content.attachments[0];
                const media = await MessageMedia.fromFilePath(attachment.url || attachment.path || '');
                // Note: filename property is set internally by MessageMedia
                // Send media message
                sentMessage = await this.webClient.sendMessage(phoneNumber, content.body, {
                    media,
                    caption: content.body
                });
            }
            else {
                // Send text message
                sentMessage = await this.webClient.sendMessage(phoneNumber, content.body);
            }
            return this.createSuccessResult({
                messageId: message.id,
                externalMessageId: sentMessage.id.id,
                deliveredAt: new Date(sentMessage.timestamp * 1000),
                cost: await this.calculateCost(message),
                metadata: {
                    whatsappMessageId: sentMessage.id.id,
                    remote: sentMessage.id.remote,
                    timestamp: sentMessage.timestamp,
                    method: 'web_client'
                }
            });
        }
        catch (error) {
            throw new CommunicationError('WHATSAPP_WEB_SEND_FAILED', `WhatsApp Web send failed: ${error instanceof Error ? error.message : 'Unknown error'}`, true);
        }
    }
    /**
     * Send message via WhatsApp Business API
     */
    async sendViaBusinessApi(message) {
        const config = this.config;
        if (!config.businessApiKey || !config.businessPhoneNumberId) {
            throw new CommunicationError('WHATSAPP_BUSINESS_CONFIG_MISSING', 'WhatsApp Business API configuration is missing');
        }
        try {
            const recipient = message.recipient;
            const phoneNumber = this.formatPhoneNumber(recipient.phone);
            const content = this.prepareMessageContent(message);
            const payload = {
                messaging_product: 'whatsapp',
                to: phoneNumber,
                type: 'text',
                text: {
                    body: content.body
                }
            };
            // Handle attachments
            if (message.content.attachments && message.content.attachments.length > 0) {
                const attachment = message.content.attachments[0];
                if (attachment.type?.startsWith('image/')) {
                    payload.type = 'image';
                    payload.image = {
                        link: attachment.url,
                        caption: content.body
                    };
                    delete payload.text;
                }
                else if (attachment.type?.startsWith('video/')) {
                    payload.type = 'video';
                    payload.video = {
                        link: attachment.url,
                        caption: content.body
                    };
                    delete payload.text;
                }
                else {
                    payload.type = 'document';
                    payload.document = {
                        link: attachment.url,
                        filename: attachment.filename || 'document'
                    };
                    delete payload.text;
                }
            }
            const response = await fetch(`${this.businessApiBaseUrl}/${config.businessPhoneNumberId}/messages`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${config.businessApiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new CommunicationError('WHATSAPP_BUSINESS_API_ERROR', `Business API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`, response.status >= 500 || response.status === 429);
            }
            const result = await response.json();
            const messageData = result.messages[0];
            return this.createSuccessResult({
                messageId: message.id,
                externalMessageId: messageData.id,
                deliveredAt: new Date(),
                cost: await this.calculateCost(message),
                metadata: {
                    whatsappMessageId: messageData.id,
                    businessApiResponse: result,
                    method: 'business_api'
                }
            });
        }
        catch (error) {
            if (error instanceof CommunicationError) {
                throw error;
            }
            throw new CommunicationError('WHATSAPP_BUSINESS_SEND_FAILED', `WhatsApp Business API send failed: ${error instanceof Error ? error.message : 'Unknown error'}`, true);
        }
    }
    /**
     * Get delivery status of a message
     */
    async getDeliveryStatus(messageId) {
        try {
            // This would typically query the WhatsApp Business API for message status
            // For now, return a placeholder implementation
            const config = this.config;
            if (config.useWebClient) {
                // Web client doesn't provide detailed delivery status
                return this.createSuccessResult({
                    messageId,
                    deliveredAt: new Date(),
                    metadata: { status: 'unknown', method: 'web_client' }
                });
            }
            else {
                // Business API can provide detailed status
                // Implementation would query: GET /{message-id}
                return this.createSuccessResult({
                    messageId,
                    deliveredAt: new Date(),
                    metadata: { status: 'delivered', method: 'business_api' }
                });
            }
        }
        catch (error) {
            return this.handleError(error, { messageId });
        }
    }
    /**
     * Test WhatsApp connection
     */
    async testConnection() {
        try {
            const config = this.config;
            if (config.useWebClient) {
                return this.isWebClientReady;
            }
            else {
                // Test Business API connection
                if (!config.businessApiKey || !config.businessPhoneNumberId) {
                    return false;
                }
                const response = await fetch(`${this.businessApiBaseUrl}/${config.businessPhoneNumberId}`, {
                    headers: {
                        'Authorization': `Bearer ${config.businessApiKey}`
                    }
                });
                return response.ok;
            }
        }
        catch (error) {
            this.logger.error('WhatsApp connection test failed', error instanceof Error ? error : new Error(String(error)));
            return false;
        }
    }
    /**
     * Validate recipient for WhatsApp channel
     */
    async validateRecipientForChannel(recipient) {
        const errors = [];
        const warnings = [];
        // Check if recipient has phone number
        if (!recipient.phone) {
            errors.push('WhatsApp requires a phone number');
        }
        else {
            // Validate phone number format for WhatsApp
            const phoneNumber = this.formatPhoneNumber(recipient.phone);
            if (!this.isValidWhatsAppNumber(phoneNumber)) {
                errors.push('Invalid WhatsApp phone number format');
            }
        }
        return {
            valid: errors.length === 0,
            errors,
            warnings
        };
    }
    /**
     * Validate message for WhatsApp channel
     */
    validateMessageForChannel(message) {
        const errors = [];
        const warnings = [];
        // Check message length (WhatsApp has a 4096 character limit)
        if (message.content.body && message.content.body.length > 4096) {
            errors.push('WhatsApp message body cannot exceed 4096 characters');
        }
        // Check attachments
        if (message.content.attachments && message.content.attachments.length > 1) {
            warnings.push('WhatsApp supports only one attachment per message');
        }
        if (message.content.attachments && message.content.attachments.length > 0) {
            const attachment = message.content.attachments[0];
            // Check file size (WhatsApp limits)
            if (attachment.size && attachment.size > 100 * 1024 * 1024) { // 100MB
                errors.push('WhatsApp attachment cannot exceed 100MB');
            }
            // Check supported formats
            if (attachment.type && !this.isSupportedAttachmentType(attachment.type)) {
                warnings.push(`Attachment type ${attachment.type} may not be supported on WhatsApp`);
            }
        }
        return {
            valid: errors.length === 0,
            errors,
            warnings
        };
    }
    /**
     * Calculate additional cost for WhatsApp
     */
    async calculateAdditionalCost(message) {
        let additionalCost = 0;
        // WhatsApp Business API pricing (example rates)
        const baseMessageCost = 0.005; // $0.005 per message
        // Additional cost for media messages
        if (message.content.attachments && message.content.attachments.length > 0) {
            additionalCost += 0.002; // Additional $0.002 for media
        }
        // International messages cost more
        const recipient = message.recipient;
        if (recipient.phone && !recipient.phone.startsWith('+55')) { // Not Brazil
            additionalCost += 0.01; // Additional $0.01 for international
        }
        return baseMessageCost + additionalCost;
    }
    /**
     * Format phone number for WhatsApp
     */
    formatPhoneNumber(phone) {
        // Remove all non-digit characters except +
        let formatted = phone.replace(/[^\d+]/g, '');
        // If number doesn't start with +, add +55 (Brazil) as default
        if (!formatted.startsWith('+')) {
            formatted = '+55' + formatted;
        }
        // Remove any extra + signs
        formatted = '+' + formatted.substring(1).replace(/\+/g, '');
        return formatted;
    }
    /**
     * Validate WhatsApp phone number
     */
    isValidWhatsAppNumber(phone) {
        // Basic WhatsApp number validation
        // Should start with + and have 8-15 digits after country code
        const whatsappRegex = /^\+[1-9]\d{7,14}$/;
        return whatsappRegex.test(phone);
    }
    /**
     * Check if attachment type is supported by WhatsApp
     */
    isSupportedAttachmentType(mimeType) {
        const supportedTypes = [
            // Images
            'image/jpeg', 'image/png', 'image/webp',
            // Videos
            'video/mp4', 'video/3gpp',
            // Audio
            'audio/aac', 'audio/mp4', 'audio/mpeg', 'audio/amr', 'audio/ogg',
            // Documents
            'application/pdf', 'application/vnd.ms-powerpoint', 'application/msword',
            'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'text/plain'
        ];
        return supportedTypes.includes(mimeType);
    }
}
/**
 * Default WhatsApp configuration
 */
export const defaultWhatsAppConfig = {
    enabled: true,
    maxRetries: 3,
    timeout: 30000,
    rateLimitPerMinute: 100, // WhatsApp Business API allows more
    costPerMessage: 0.005,
    testMode: false,
    useWebClient: false, // Default to Business API
    sessionPath: './wa-session'
};
