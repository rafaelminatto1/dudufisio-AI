// Webhook Handler - Processes delivery status webhooks from communication providers
import crypto from 'crypto';
import { MessageStatus, CommunicationChannel } from '../../../types';
import { CommunicationError } from '../core/types';
/**
 * Twilio SMS Webhook Processor - DISABLED (SMS not used in Brazil)
 */
/* DISABLED - SMS/Twilio not used
class TwilioSMSProcessor implements WebhookProcessor {
  name = 'twilio_sms';
  channel: CommunicationChannel = CommunicationChannel.SMS;

  verifySignature(payload: string, signature: string, secret: string): boolean {
    if (!signature || !secret) return false;

    try {
      const expectedSignature = crypto
        .createHmac('sha1', secret)
        .update(payload)
        .digest('base64');

      return crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expectedSignature)
      );
    } catch (error) {
      return false;
    }
  }

  parseWebhook(payload: any, headers: Record<string, string>): WebhookEventData | null {
    try {
      const {
        MessageSid,
        MessageStatus,
        To,
        From,
        Body,
        ErrorCode,
        ErrorMessage,
        Price,
        PriceUnit
      } = payload;

      if (!MessageSid || !MessageStatus) return null;

      return {
        provider: 'twilio',
        event: 'status_update',
        messageId: '', // Will be resolved by external ID lookup
        externalMessageId: MessageSid,
        status: MessageStatus,
        timestamp: new Date(),
        metadata: {
          to: To,
          from: From,
          body: Body?.substring(0, 100), // Truncate for logging
          errorCode: ErrorCode,
          errorMessage: ErrorMessage,
          price: Price,
          priceUnit: PriceUnit
        },
        rawPayload: payload
      };
    } catch (error) {
      return null;
    }
  }

  mapStatus(providerStatus: string): MessageStatus {
    const statusMap: Record<string, MessageStatus> = {
      'queued': MessageStatus.Queued,
      'sent': MessageStatus.Sent,
      'delivered': MessageStatus.Delivered,
      'undelivered': MessageStatus.Failed,
      'failed': MessageStatus.Failed,
      'received': MessageStatus.Delivered
    };

    return statusMap[providerStatus] || MessageStatus.Failed;
  }
}
*/ // END DISABLED TwilioSMSProcessor
/**
 * WhatsApp Business API Webhook Processor
 */
class WhatsAppBusinessProcessor {
    constructor() {
        this.name = 'whatsapp_business';
        this.channel = CommunicationChannel.WhatsApp;
    }
    verifySignature(payload, signature, secret) {
        if (!signature || !secret)
            return false;
        try {
            const expectedSignature = 'sha256=' + crypto
                .createHmac('sha256', secret)
                .update(payload)
                .digest('hex');
            return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
        }
        catch (error) {
            return false;
        }
    }
    parseWebhook(payload, headers) {
        try {
            const entry = payload.entry?.[0];
            const changes = entry?.changes?.[0];
            const value = changes?.value;
            if (!value)
                return null;
            // Handle status updates
            if (value.statuses && value.statuses.length > 0) {
                const status = value.statuses[0];
                return {
                    provider: 'whatsapp_business',
                    event: 'status_update',
                    messageId: '', // Will be resolved by external ID lookup
                    externalMessageId: status.id,
                    status: status.status,
                    timestamp: new Date(status.timestamp * 1000),
                    metadata: {
                        recipient_id: status.recipient_id,
                        pricing: status.pricing,
                        conversation: status.conversation,
                        errors: status.errors
                    },
                    rawPayload: payload
                };
            }
            // Handle incoming messages
            if (value.messages && value.messages.length > 0) {
                const message = value.messages[0];
                return {
                    provider: 'whatsapp_business',
                    event: 'message_received',
                    messageId: '',
                    externalMessageId: message.id,
                    status: 'received',
                    timestamp: new Date(message.timestamp * 1000),
                    metadata: {
                        from: message.from,
                        type: message.type,
                        text: message.text?.body,
                        context: message.context
                    },
                    rawPayload: payload
                };
            }
            return null;
        }
        catch (error) {
            return null;
        }
    }
    mapStatus(providerStatus) {
        const statusMap = {
            'sent': MessageStatus.Sent,
            'delivered': MessageStatus.Delivered,
            'read': MessageStatus.Read,
            'failed': MessageStatus.Failed
        };
        return statusMap[providerStatus] || MessageStatus.Failed;
    }
}
/**
 * Email Provider Webhook Processor (Generic for SendGrid, Mailgun, etc.)
 */
class EmailProviderProcessor {
    constructor() {
        this.name = 'email_provider';
        this.channel = CommunicationChannel.Email;
    }
    verifySignature(payload, signature, secret) {
        if (!signature || !secret)
            return false;
        try {
            // Generic HMAC verification - adjust based on provider
            const expectedSignature = crypto
                .createHmac('sha256', secret)
                .update(payload)
                .digest('hex');
            return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
        }
        catch (error) {
            return false;
        }
    }
    parseWebhook(payload, headers) {
        try {
            // Handle different email provider formats
            if (Array.isArray(payload)) {
                // SendGrid format
                const event = payload[0];
                if (!event)
                    return null;
                return {
                    provider: 'sendgrid',
                    event: event.event,
                    messageId: '',
                    externalMessageId: event.sg_message_id || event.smtp_id,
                    status: event.event,
                    timestamp: new Date(event.timestamp * 1000),
                    metadata: {
                        email: event.email,
                        reason: event.reason,
                        response: event.response,
                        ip: event.ip,
                        useragent: event.useragent,
                        url: event.url
                    },
                    rawPayload: payload
                };
            }
            else {
                // Mailgun or other single-event format
                return {
                    provider: 'mailgun',
                    event: payload.event,
                    messageId: '',
                    externalMessageId: payload['message-id'],
                    status: payload.event,
                    timestamp: new Date(payload.timestamp * 1000),
                    metadata: {
                        recipient: payload.recipient,
                        reason: payload.reason,
                        description: payload.description,
                        code: payload.code
                    },
                    rawPayload: payload
                };
            }
        }
        catch (error) {
            return null;
        }
    }
    mapStatus(providerStatus) {
        const statusMap = {
            'delivered': MessageStatus.Delivered,
            'opened': MessageStatus.Read,
            'clicked': MessageStatus.Read,
            'bounced': MessageStatus.Failed,
            'dropped': MessageStatus.Failed,
            'spam': MessageStatus.Failed,
            'unsubscribed': MessageStatus.Failed,
            'rejected': MessageStatus.Failed
        };
        return statusMap[providerStatus] || MessageStatus.Failed;
    }
}
/**
 * Push Notification Webhook Processor
 */
class PushNotificationProcessor {
    constructor() {
        this.name = 'push_notification';
        this.channel = CommunicationChannel.Push;
    }
    verifySignature(payload, signature, secret) {
        // Push notifications typically don't have webhooks
        // This would be for custom implementations or specific providers
        return true;
    }
    parseWebhook(payload, headers) {
        // Custom push notification webhook format
        try {
            return {
                provider: 'push_service',
                event: payload.event || 'status_update',
                messageId: payload.messageId || '',
                externalMessageId: payload.notificationId || '',
                status: payload.status || 'delivered',
                timestamp: new Date(payload.timestamp || Date.now()),
                metadata: {
                    deviceId: payload.deviceId,
                    platform: payload.platform,
                    appVersion: payload.appVersion
                },
                rawPayload: payload
            };
        }
        catch (error) {
            return null;
        }
    }
    mapStatus(providerStatus) {
        const statusMap = {
            'delivered': MessageStatus.Delivered,
            'opened': MessageStatus.Read,
            'failed': MessageStatus.Failed,
            'expired': MessageStatus.Failed
        };
        return statusMap[providerStatus] || MessageStatus.Delivered;
    }
}
/**
 * Main Webhook Handler
 */
export class WebhookHandler {
    constructor(config, repository, configProvider, logger, metrics, eventDispatcher) {
        this.config = config;
        this.repository = repository;
        this.configProvider = configProvider;
        this.logger = logger;
        this.metrics = metrics;
        this.eventDispatcher = eventDispatcher;
        this.processors = new Map();
        this.requestCounts = new Map();
        this.initializeProcessors();
    }
    /**
     * Initialize webhook processors
     */
    initializeProcessors() {
        // SMS/Twilio disabled - not used in Brazil
        // this.processors.set('twilio_sms', new TwilioSMSProcessor());
        this.processors.set('whatsapp_business', new WhatsAppBusinessProcessor());
        this.processors.set('email_provider', new EmailProviderProcessor());
        this.processors.set('push_notification', new PushNotificationProcessor());
        this.logger.info('Webhook processors initialized', {
            processors: Array.from(this.processors.keys())
        });
    }
    /**
     * Handle incoming webhook for Twilio SMS - DISABLED
     */
    // SMS/Twilio disabled - not used in Brazil
    // async handleTwilioSMSWebhook(req: Request, res: Response): Promise<void> {
    //   await this.processWebhook('twilio_sms', req, res);
    // }
    /**
     * Handle incoming webhook for WhatsApp Business API
     */
    async handleWhatsAppWebhook(req, res) {
        await this.processWebhook('whatsapp_business', req, res);
    }
    /**
     * Handle incoming webhook for Email providers
     */
    async handleEmailWebhook(req, res) {
        await this.processWebhook('email_provider', req, res);
    }
    /**
     * Handle incoming webhook for Push notifications
     */
    async handlePushWebhook(req, res) {
        await this.processWebhook('push_notification', req, res);
    }
    /**
     * Generic webhook processor
     */
    async processWebhook(processorName, req, res) {
        const startTime = Date.now();
        let webhookData = null;
        try {
            // Check if webhooks are enabled
            if (!this.config.enabled) {
                res.status(503).json({ error: 'Webhooks are disabled' });
                return;
            }
            // Rate limiting
            const clientIp = req.ip || 'unknown';
            if (!this.checkRateLimit(clientIp)) {
                res.status(429).json({ error: 'Rate limit exceeded' });
                this.metrics.increment('webhook.rate_limited');
                return;
            }
            // Get processor
            const processor = this.processors.get(processorName);
            if (!processor) {
                res.status(404).json({ error: 'Webhook processor not found' });
                return;
            }
            // Extract payload and headers
            const payload = req.body;
            const headers = req.headers;
            // Verify signature if required
            if (this.config.verifySignatures) {
                const signature = headers['x-signature'] || headers['x-twilio-signature'] ||
                    headers['x-hub-signature-256'] || headers['authorization'];
                const secret = this.getWebhookSecret(processorName);
                if (signature && secret) {
                    const rawBody = req.rawBody || JSON.stringify(payload);
                    const isValid = processor.verifySignature(rawBody, signature, secret);
                    if (!isValid) {
                        res.status(401).json({ error: 'Invalid signature' });
                        this.metrics.increment('webhook.signature_invalid');
                        return;
                    }
                }
            }
            // Parse webhook data
            webhookData = processor.parseWebhook(payload, headers);
            if (!webhookData) {
                res.status(400).json({ error: 'Invalid webhook payload' });
                this.metrics.increment('webhook.payload_invalid');
                return;
            }
            // Process the webhook
            await this.processWebhookEvent(webhookData, processor);
            // Log successful processing
            const duration = Date.now() - startTime;
            this.metrics.timing('webhook.processing_time', duration);
            this.metrics.increment(`webhook.${processorName}.success`);
            this.logger.info('Webhook processed successfully', {
                provider: webhookData.provider,
                event: webhookData.event,
                externalMessageId: webhookData.externalMessageId,
                duration
            });
            res.status(200).json({ success: true, messageId: webhookData.messageId });
        }
        catch (error) {
            const duration = Date.now() - startTime;
            this.metrics.timing('webhook.error_time', duration);
            this.metrics.increment(`webhook.${processorName}.error`);
            this.logger.error('Webhook processing failed', error instanceof Error ? error : new Error(String(error)), {
                provider: webhookData?.provider,
                event: webhookData?.event,
                externalMessageId: webhookData?.externalMessageId
            });
            res.status(500).json({ error: 'Webhook processing failed' });
        }
    }
    /**
     * Process webhook event and update message status
     */
    async processWebhookEvent(webhookData, processor) {
        try {
            // Find message by external ID
            const message = await this.repository.getMessageByExternalId(webhookData.externalMessageId);
            if (!message) {
                this.logger.warn('Message not found for webhook', {
                    externalMessageId: webhookData.externalMessageId,
                    provider: webhookData.provider
                });
                return;
            }
            // Map provider status to our status
            const newStatus = processor.mapStatus(webhookData.status);
            // Update message status
            const updateData = {
                status: newStatus,
                updatedAt: new Date()
            };
            // Set appropriate timestamp based on status
            switch (newStatus) {
                case 'sent':
                    updateData.sentAt = webhookData.timestamp;
                    break;
                case 'delivered':
                    updateData.deliveredAt = webhookData.timestamp;
                    break;
                case 'read':
                    updateData.readAt = webhookData.timestamp;
                    break;
                case 'failed':
                    updateData.failedAt = webhookData.timestamp;
                    updateData.errorCode = webhookData.metadata.errorCode || 'WEBHOOK_FAILURE';
                    updateData.errorMessage = webhookData.metadata.errorMessage || webhookData.metadata.reason;
                    break;
            }
            // Add webhook metadata
            updateData.metadata = {
                ...message.metadata,
                webhookData: {
                    provider: webhookData.provider,
                    event: webhookData.event,
                    timestamp: webhookData.timestamp,
                    providerStatus: webhookData.status,
                    providerMetadata: webhookData.metadata
                }
            };
            await this.repository.updateMessage(message.id, updateData);
            // Record delivery attempt if applicable
            if (newStatus === 'delivered' || newStatus === 'failed') {
                await this.repository.recordDeliveryAttempt({
                    messageId: message.id,
                    channel: processor.channel,
                    attemptNumber: (message.retryCount || 0) + 1,
                    success: newStatus === 'delivered',
                    statusCode: webhookData.metadata.code || '200',
                    responseMessage: webhookData.metadata.response || 'Webhook status update',
                    externalId: webhookData.externalMessageId,
                    cost: webhookData.metadata.price ? parseFloat(webhookData.metadata.price) : 0,
                    metadata: webhookData.metadata
                });
            }
            // Dispatch event for other systems
            await this.eventDispatcher.dispatch({
                type: `message.${newStatus}`,
                timestamp: webhookData.timestamp,
                data: {
                    messageId: message.id,
                    externalMessageId: webhookData.externalMessageId,
                    channel: processor.channel,
                    provider: webhookData.provider,
                    status: newStatus,
                    metadata: webhookData.metadata
                }
            });
            // Update analytics
            await this.updateAnalytics(processor.channel, message.type || 'unknown', newStatus);
            this.logger.debug('Message status updated from webhook', {
                messageId: message.id,
                oldStatus: message.status,
                newStatus,
                provider: webhookData.provider,
                channel: processor.channel
            });
        }
        catch (error) {
            throw new CommunicationError('WEBHOOK_PROCESSING_FAILED', `Failed to process webhook event: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Check rate limit for incoming webhooks
     */
    checkRateLimit(clientIp) {
        const now = Date.now();
        const windowStart = Math.floor(now / 60000) * 60000; // 1-minute window
        const key = `${clientIp}:${windowStart}`;
        const current = this.requestCounts.get(key);
        if (!current) {
            this.requestCounts.set(key, { count: 1, resetTime: windowStart + 60000 });
            return true;
        }
        if (now > current.resetTime) {
            this.requestCounts.set(key, { count: 1, resetTime: windowStart + 60000 });
            return true;
        }
        if (current.count >= this.config.rateLimitPerMinute) {
            return false;
        }
        current.count++;
        return true;
    }
    /**
     * Get webhook secret for provider
     */
    getWebhookSecret(processorName) {
        const configKey = `webhook.${processorName}.secret`;
        return this.configProvider.get(configKey, '');
    }
    /**
     * Update analytics based on webhook event
     */
    async updateAnalytics(channel, messageType, status) {
        try {
            const today = new Date().toISOString().split('T')[0];
            // This would update the communication_analytics table
            // Implementation depends on your analytics strategy
            this.metrics.increment(`analytics.${channel}.${messageType}.${status}`);
        }
        catch (error) {
            this.logger.warn('Failed to update analytics from webhook', {
                channel,
                messageType,
                status,
                error: error instanceof Error ? error.message : String(error)
            });
        }
    }
    /**
     * Get webhook handler statistics
     */
    getStatistics() {
        const now = Date.now();
        const requestsInLastMinute = Array.from(this.requestCounts.values())
            .filter(entry => now < entry.resetTime)
            .reduce((sum, entry) => sum + entry.count, 0);
        return {
            processorsRegistered: this.processors.size,
            requestsInLastMinute,
            enabledProviders: this.config.supportedProviders
        };
    }
    /**
     * Manually trigger webhook processing (for testing)
     */
    async testWebhook(processorName, testPayload) {
        try {
            const processor = this.processors.get(processorName);
            if (!processor) {
                return { success: false, error: 'Processor not found' };
            }
            const webhookData = processor.parseWebhook(testPayload, {});
            if (!webhookData) {
                return { success: false, error: 'Failed to parse webhook payload' };
            }
            // In test mode, don't actually update the database
            return { success: true, webhookData };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }
    /**
     * Register custom webhook processor
     */
    registerProcessor(name, processor) {
        this.processors.set(name, processor);
        this.logger.info('Custom webhook processor registered', { name });
    }
    /**
     * Clean up old rate limit entries
     */
    cleanupRateLimitEntries() {
        const now = Date.now();
        for (const [key, entry] of this.requestCounts.entries()) {
            if (now > entry.resetTime) {
                this.requestCounts.delete(key);
            }
        }
    }
}
/**
 * Default webhook configuration
 */
export const defaultWebhookConfig = {
    enabled: true,
    verifySignatures: true,
    timeout: 30000,
    maxRetries: 3,
    supportedProviders: ['whatsapp_business', 'sendgrid', 'mailgun'], // 'twilio' removed - SMS not used
    enableLogging: true,
    rateLimitPerMinute: 100
};
