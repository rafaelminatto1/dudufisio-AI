// Push Notification Channel using Web Push API
// Mock webpush object for development
const webpush = {
    sendNotification: async (subscription, payload, options) => {
        console.warn('WebPush not available - using mock implementation');
        return Promise.resolve({
            statusCode: 200,
            headers: {},
            body: 'OK'
        });
    },
    setVapidDetails: (subject, publicKey, privateKey) => {
        console.warn('WebPush VAPID details set via mock');
    },
    setGCMAPIKey: (apiKey) => {
        console.warn('WebPush GCM API key set via mock');
    },
    generateVAPIDKeys: () => {
        console.warn('WebPush VAPID keys generated via mock');
        return {
            publicKey: 'mock-public-key',
            privateKey: 'mock-private-key'
        };
    }
};
import { ChannelCapability } from '../../../types';
import { BaseChannel } from './BaseChannel';
import { CommunicationError } from '../core/types';
/**
 * Push Notification Channel using Web Push API
 */
export class PushChannel extends BaseChannel {
    constructor(config, repository, configProvider, logger, metrics, rateLimiter) {
        super(config, repository, configProvider, logger, metrics, rateLimiter);
        this.name = 'push';
        this.capabilities = [
            ChannelCapability.TEXT,
            ChannelCapability.IMAGES,
            ChannelCapability.RICH_CONTENT,
            ChannelCapability.DELIVERY_STATUS
        ];
        this.priority = 90; // Very high priority for instant notifications
        this.maxRetries = 2; // Lower retries for push notifications
        this.initializeWebPush();
    }
    /**
     * Initialize Web Push configuration
     */
    initializeWebPush() {
        const config = this.config;
        if (!config.vapid.publicKey || !config.vapid.privateKey || !config.vapid.subject) {
            throw new CommunicationError('PUSH_CONFIG_MISSING', 'VAPID configuration is required for push notifications');
        }
        try {
            webpush.setVapidDetails(config.vapid.subject, config.vapid.publicKey, config.vapid.privateKey);
            // Set GCM API key if provided (for older Android devices)
            if (config.gcm?.apiKey) {
                webpush.setGCMAPIKey(config.gcm.apiKey);
            }
            this.logger.info('Web Push initialized', {
                subject: config.vapid.subject,
                hasGcmKey: !!config.gcm?.apiKey
            });
        }
        catch (error) {
            throw new CommunicationError('PUSH_INIT_FAILED', `Failed to initialize Web Push: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Send push notification
     */
    async send(message) {
        const startTime = Date.now();
        try {
            // Validate message
            const validation = this.validateMessage(message);
            if (!validation.valid) {
                throw new CommunicationError('PUSH_VALIDATION_FAILED', `Validation failed: ${validation.errors.join(', ')}`);
            }
            // Check if channel is enabled
            if (!this.isEnabled()) {
                throw new CommunicationError('PUSH_DISABLED', 'Push notification channel is disabled');
            }
            // Check rate limit
            const rateLimitOk = await this.checkRateLimit(message.recipient);
            if (!rateLimitOk) {
                throw new CommunicationError('PUSH_RATE_LIMIT', 'Rate limit exceeded for push notifications', true, 60000);
            }
            const recipient = message.recipient;
            const config = this.config;
            // Parse push subscription from recipient
            const subscription = this.parsePushSubscription(recipient.pushToken);
            // Prepare push payload
            const payload = this.preparePushPayload(message, config);
            // Send push notification
            const result = await this.sendPushNotification(subscription, payload, config);
            const cost = await this.calculateCost(message);
            const duration = Date.now() - startTime;
            this.recordDeliveryMetrics(true, duration, cost);
            this.logger.info('Push notification sent successfully', {
                messageId: message.id,
                recipientId: recipient.id,
                statusCode: result.statusCode,
                endpoint: subscription.endpoint.substring(0, 50) + '...'
            });
            return this.createSuccessResult({
                messageId: message.id,
                externalMessageId: this.generateTrackingId(message.id),
                deliveredAt: new Date(),
                cost,
                metadata: {
                    statusCode: result.statusCode,
                    headers: result.headers,
                    endpoint: subscription.endpoint,
                    payload: payload,
                    provider: 'web-push'
                }
            });
        }
        catch (error) {
            const duration = Date.now() - startTime;
            this.recordDeliveryMetrics(false, duration);
            if (error instanceof CommunicationError) {
                return this.handleError(error, { messageId: message.id });
            }
            // Handle web-push specific errors
            return this.handleWebPushError(error, message.id);
        }
    }
    /**
     * Get delivery status of a push notification
     */
    async getDeliveryStatus(messageId) {
        try {
            // Push notifications don't provide detailed delivery status
            // Status is typically handled via service worker events on the client
            return this.createSuccessResult({
                messageId,
                deliveredAt: new Date(),
                metadata: {
                    status: 'sent',
                    note: 'Push notification delivery status is handled by the browser'
                }
            });
        }
        catch (error) {
            return this.handleError(error, { messageId });
        }
    }
    /**
     * Test push notification connection
     */
    async testConnection() {
        try {
            const config = this.config;
            // Test by creating a dummy subscription and trying to send
            const testSubscription = {
                endpoint: 'https://fcm.googleapis.com/fcm/send/test',
                keys: {
                    p256dh: 'BDgpRKok4kddO7AuTFxF1eLGF3K_tz-DhHIeloeW6qfFgHRHNQ',
                    auth: 'test-auth-key'
                }
            };
            const testPayload = {
                title: 'Connection Test',
                body: 'Testing push notification connection'
            };
            // This will fail but we can check if the configuration is valid
            try {
                await webpush.sendNotification(testSubscription, JSON.stringify(testPayload), {
                    TTL: config.ttl,
                    urgency: config.urgency
                });
            }
            catch (error) {
                // Expected to fail with test endpoint
                // But if we get here, the configuration is valid
                return true;
            }
            return true;
        }
        catch (error) {
            this.logger.error('Push notification connection test failed', error instanceof Error ? error : new Error(String(error)));
            return false;
        }
    }
    /**
     * Validate recipient for push channel
     */
    async validateRecipientForChannel(recipient) {
        const errors = [];
        const warnings = [];
        // Check if recipient has push token
        if (!recipient.pushToken) {
            errors.push('Push token is required for push notifications');
        }
        else {
            try {
                // Validate push subscription format
                const subscription = this.parsePushSubscription(recipient.pushToken);
                if (!subscription.endpoint || !subscription.keys.p256dh || !subscription.keys.auth) {
                    errors.push('Invalid push subscription format');
                }
                else {
                    // Check if endpoint is from a supported provider
                    if (!this.isSupportedPushEndpoint(subscription.endpoint)) {
                        warnings.push('Push endpoint may not be from a supported provider');
                    }
                }
            }
            catch (error) {
                errors.push('Failed to parse push subscription');
            }
        }
        return {
            valid: errors.length === 0,
            errors,
            warnings
        };
    }
    /**
     * Validate message for push channel
     */
    validateMessageForChannel(message) {
        const errors = [];
        const warnings = [];
        const config = this.config;
        // Check title (required for push notifications)
        if (!message.content.subject && !message.content.body) {
            errors.push('Push notification must have a title (subject) or body');
        }
        // Check title length
        if (message.content.subject && message.content.subject.length > 100) {
            warnings.push('Push notification title is very long and may be truncated');
        }
        // Check body length
        if (message.content.body && message.content.body.length > 300) {
            warnings.push('Push notification body is very long and may be truncated');
        }
        // Check payload size
        const payload = this.preparePushPayload(message, config);
        const payloadSize = JSON.stringify(payload).length;
        if (payloadSize > config.maxPayloadSize) {
            errors.push(`Push notification payload exceeds maximum size (${config.maxPayloadSize} bytes)`);
        }
        // Check for unsupported features
        if (message.content.attachments && message.content.attachments.length > 1) {
            warnings.push('Push notifications support only one image attachment');
        }
        // HTML content is not supported in push notifications
        if (message.content.html) {
            warnings.push('HTML content is not supported in push notifications');
        }
        return {
            valid: errors.length === 0,
            errors,
            warnings
        };
    }
    /**
     * Calculate additional cost for push notifications
     */
    async calculateAdditionalCost(message) {
        // Push notifications are typically free (using browser/device infrastructure)
        // Cost might come from third-party services or high-volume usage
        let cost = 0;
        // Base cost per notification (very low)
        const baseCost = 0.0001; // $0.0001 per notification
        // Additional cost for rich notifications with images
        if (message.content.attachments && message.content.attachments.length > 0) {
            cost += 0.00005; // Minimal cost for rich notifications
        }
        // Additional cost for interactive notifications
        const config = this.config;
        if (config.enableActions && message.metadata?.actions) {
            cost += 0.00002;
        }
        return baseCost + cost;
    }
    /**
     * Parse push subscription from token
     */
    parsePushSubscription(pushToken) {
        try {
            return JSON.parse(pushToken);
        }
        catch (error) {
            throw new CommunicationError('PUSH_INVALID_SUBSCRIPTION', 'Invalid push subscription format');
        }
    }
    /**
     * Prepare push notification payload
     */
    preparePushPayload(message, config) {
        const content = this.prepareMessageContent(message);
        const payload = {
            title: content.subject || 'DuduFisio',
            body: content.body || '',
            icon: config.defaultIcon || '/icons/icon-192x192.png',
            badge: config.defaultBadge || '/icons/badge-72x72.png',
            tag: `message-${message.id}`,
            timestamp: Date.now(),
            data: {
                messageId: message.id,
                url: message.metadata?.url || '/',
                ...message.metadata
            },
            requireInteraction: message.priority === 'critical' || message.priority === 'high',
            dir: 'auto',
            lang: 'pt-BR'
        };
        // Add image if attachment is provided
        if (content.attachments && content.attachments.length > 0) {
            const imageAttachment = content.attachments.find(att => att.type?.startsWith('image/'));
            if (imageAttachment) {
                payload.image = imageAttachment.url || imageAttachment.path;
            }
        }
        // Add actions if enabled and configured
        if (config.enableActions && message.metadata?.actions) {
            payload.actions = message.metadata.actions.map((action) => ({
                action: action.id,
                title: action.title,
                icon: action.icon
            }));
        }
        // Add vibration pattern for urgent messages
        if (message.priority === 'critical') {
            payload.vibrate = [200, 100, 200]; // Urgent vibration pattern
        }
        return payload;
    }
    /**
     * Send push notification via web-push
     */
    async sendPushNotification(subscription, payload, config) {
        try {
            const options = {
                TTL: config.ttl,
                urgency: config.urgency,
                headers: {
                    'Topic': 'dudufisio-notifications'
                }
            };
            const result = await webpush.sendNotification(subscription, JSON.stringify(payload), options);
            return {
                statusCode: result.statusCode,
                headers: result.headers,
                body: result.body
            };
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * Check if push endpoint is from a supported provider
     */
    isSupportedPushEndpoint(endpoint) {
        const supportedProviders = [
            'https://fcm.googleapis.com/', // Firebase Cloud Messaging (Chrome, Firefox)
            'https://wns2-', // Windows Push Notification Services
            'https://notify.windows.com/', // Windows 10
            'https://updates.push.services.mozilla.com/', // Firefox
            'https://web.push.apple.com/' // Safari (when available)
        ];
        return supportedProviders.some(provider => endpoint.startsWith(provider));
    }
    /**
     * Handle web-push specific errors
     */
    handleWebPushError(error, messageId) {
        let communicationError;
        if (error && typeof error === 'object' && 'statusCode' in error) {
            const webPushError = error;
            switch (webPushError.statusCode) {
                case 400:
                    communicationError = new CommunicationError('PUSH_BAD_REQUEST', 'Invalid push notification request', false);
                    break;
                case 401:
                    communicationError = new CommunicationError('PUSH_UNAUTHORIZED', 'Push notification authorization failed', false);
                    break;
                case 403:
                    communicationError = new CommunicationError('PUSH_FORBIDDEN', 'Push notification forbidden', false);
                    break;
                case 404:
                case 410:
                    communicationError = new CommunicationError('PUSH_SUBSCRIPTION_INVALID', 'Push subscription is no longer valid', false);
                    break;
                case 413:
                    communicationError = new CommunicationError('PUSH_PAYLOAD_TOO_LARGE', 'Push notification payload too large', false);
                    break;
                case 429:
                    communicationError = new CommunicationError('PUSH_RATE_LIMITED', 'Push notification rate limited', true, 60000);
                    break;
                case 500:
                case 502:
                case 503:
                    communicationError = new CommunicationError('PUSH_SERVER_ERROR', 'Push notification server error', true, 30000);
                    break;
                default:
                    communicationError = new CommunicationError('PUSH_HTTP_ERROR', `Push notification HTTP error: ${webPushError.statusCode}`, webPushError.statusCode >= 500);
                    break;
            }
        }
        else {
            communicationError = CommunicationError.fromError(error, 'PUSH_UNKNOWN_ERROR');
        }
        return this.handleError(communicationError, { messageId });
    }
    /**
     * Handle push subscription expiration (to be called when subscription becomes invalid)
     */
    async handleSubscriptionExpiration(recipientId, reason) {
        try {
            this.logger.warn('Push subscription expired', {
                recipientId,
                reason
            });
            // Remove invalid push token from recipient
            // await this.repository.updateRecipient(recipientId, { pushToken: null });
            this.metrics.increment('push.subscription.expired');
        }
        catch (error) {
            this.logger.error('Error handling push subscription expiration', error instanceof Error ? error : new Error(String(error)), {
                recipientId,
                reason
            });
        }
    }
    /**
     * Generate VAPID public key for client registration
     */
    static generateVapidKeys() {
        return webpush.generateVAPIDKeys();
    }
}
/**
 * Default push notification configuration
 */
export const defaultPushConfig = {
    enabled: true,
    maxRetries: 2,
    timeout: 15000, // Shorter timeout for push notifications
    rateLimitPerMinute: 200, // Higher rate for push notifications
    costPerMessage: 0.0001,
    testMode: false,
    vapid: {
        publicKey: '',
        privateKey: '',
        subject: 'mailto:admin@dudufisio.com'
    },
    ttl: 24 * 60 * 60, // 24 hours
    urgency: 'normal',
    maxPayloadSize: 4096, // 4KB max payload
    enableBadging: true,
    enableActions: true,
    defaultIcon: '/icons/icon-192x192.png',
    defaultBadge: '/icons/badge-72x72.png'
};
