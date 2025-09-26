// Communication Channels - Main Export File

// Base channel
export { BaseChannel, defaultBaseChannelConfig } from './BaseChannel';
export type { BaseChannelConfig } from './BaseChannel';

// WhatsApp Channel
export { WhatsAppChannel, defaultWhatsAppConfig } from './WhatsAppChannel';
export type { WhatsAppConfig } from './WhatsAppChannel';

// SMS Channel
export { SMSChannel, defaultSMSConfig } from './SMSChannel';
export type { SMSConfig } from './SMSChannel';

// Email Channel
export { EmailChannel, defaultEmailConfig } from './EmailChannel';
export type { EmailConfig } from './EmailChannel';

// Resend Email Channel
export { ResendEmailChannel } from './ResendEmailChannel';
export type { ResendEmailConfig } from './ResendEmailChannel';

// Push Notification Channel
export { PushChannel, defaultPushConfig } from './PushChannel';
export type { PushConfig } from './PushChannel';

// Channel factory and registry
import { CommunicationChannelInterface } from '../core/types';
import { BaseChannelConfig } from './BaseChannel';
import { WhatsAppChannel, WhatsAppConfig } from './WhatsAppChannel';
import { SMSChannel, SMSConfig } from './SMSChannel';
import { EmailChannel, EmailConfig } from './EmailChannel';
import { ResendEmailChannel, ResendEmailConfig } from './ResendEmailChannel';
import { PushChannel, PushConfig } from './PushChannel';

/**
 * Channel configuration union type
 */
export type ChannelConfig = WhatsAppConfig | SMSConfig | EmailConfig | ResendEmailConfig | PushConfig;

/**
 * Channel factory for creating channel instances
 */
export class ChannelFactory {
  private static channels = new Map<string, any>();

  /**
   * Register a channel class
   */
  static register(name: string, channelClass: any): void {
    this.channels.set(name, channelClass);
  }

  /**
   * Create a channel instance
   */
  static create(
    name: string,
    config: ChannelConfig,
    dependencies: {
      repository: any;
      configProvider: any;
      logger: any;
      metrics: any;
      rateLimiter?: any;
    }
  ): CommunicationChannelInterface {
    const ChannelClass = this.channels.get(name);

    if (!ChannelClass) {
      throw new Error(`Channel ${name} is not registered`);
    }

    return new ChannelClass(
      config,
      dependencies.repository,
      dependencies.configProvider,
      dependencies.logger,
      dependencies.metrics,
      dependencies.rateLimiter
    );
  }

  /**
   * Get list of registered channels
   */
  static getRegisteredChannels(): string[] {
    return Array.from(this.channels.keys());
  }

  /**
   * Check if channel is registered
   */
  static isRegistered(name: string): boolean {
    return this.channels.has(name);
  }
}

// Register all available channels
ChannelFactory.register('whatsapp', WhatsAppChannel);
ChannelFactory.register('sms', SMSChannel);
ChannelFactory.register('email', EmailChannel);
ChannelFactory.register('resend-email', ResendEmailChannel);
ChannelFactory.register('push', PushChannel);

/**
 * Default configurations for all channels
 */
export const defaultChannelConfigs = {
  whatsapp: {
    enabled: true,
    maxRetries: 3,
    timeout: 30000,
    rateLimitPerMinute: 100,
    costPerMessage: 0.005,
    testMode: false,
    useWebClient: false,
    sessionPath: './wa-session'
  } as WhatsAppConfig,

  sms: {
    enabled: true,
    maxRetries: 3,
    timeout: 30000,
    rateLimitPerMinute: 100,
    costPerMessage: 0.0075,
    testMode: false,
    twilioAccountSid: '',
    twilioAuthToken: '',
    twilioPhoneNumber: '',
    maxMessageLength: 1600,
    enableDeliveryReceipts: true,
    enableLongMessages: true
  } as SMSConfig,

  email: {
    enabled: true,
    maxRetries: 3,
    timeout: 30000,
    rateLimitPerMinute: 100,
    costPerMessage: 0.0001,
    testMode: false,
    smtp: {
      host: '',
      port: 587,
      secure: false,
      auth: {
        user: '',
        pass: ''
      },
      tls: {
        rejectUnauthorized: false
      }
    },
    from: {
      name: 'DuduFisio',
      email: 'noreply@dudufisio.com'
    },
    maxAttachmentSize: 10 * 1024 * 1024,
    enableTracking: true,
    enableBounceHandling: true
  } as EmailConfig,

  push: {
    enabled: true,
    maxRetries: 2,
    timeout: 15000,
    rateLimitPerMinute: 200,
    costPerMessage: 0.0001,
    testMode: false,
    vapid: {
      publicKey: '',
      privateKey: '',
      subject: 'mailto:admin@dudufisio.com'
    },
    ttl: 24 * 60 * 60,
    urgency: 'normal' as const,
    maxPayloadSize: 4096,
    enableBadging: true,
    enableActions: true,
    defaultIcon: '/icons/icon-192x192.png',
    defaultBadge: '/icons/badge-72x72.png'
  } as PushConfig
};

/**
 * Channel priority order (higher number = higher priority)
 */
export const channelPriorities = {
  push: 90,    // Highest priority - instant notifications
  whatsapp: 85, // High priority - widely used
  sms: 75,     // Medium-high priority - reliable
  email: 60    // Medium priority - asynchronous
};

/**
 * Helper function to get channel by priority
 */
export function getChannelsByPriority(): string[] {
  return Object.entries(channelPriorities)
    .sort(([, a], [, b]) => b - a)
    .map(([channel]) => channel);
}

/**
 * Helper function to validate channel configuration
 */
export function validateChannelConfig(name: string, config: ChannelConfig): {
  valid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Common validations
  if (!config.enabled && config.enabled !== false) {
    warnings.push('Channel enabled status not specified, defaulting to true');
  }

  if (config.maxRetries && (config.maxRetries < 0 || config.maxRetries > 10)) {
    warnings.push('Max retries should be between 0 and 10');
  }

  if (config.timeout && config.timeout < 1000) {
    warnings.push('Timeout should be at least 1000ms');
  }

  // Channel-specific validations
  switch (name) {
    case 'whatsapp':
      const whatsappConfig = config as WhatsAppConfig;
      if (whatsappConfig.useWebClient) {
        if (!whatsappConfig.sessionPath) {
          warnings.push('Session path not specified for WhatsApp Web client');
        }
      } else {
        if (!whatsappConfig.businessApiKey) {
          errors.push('Business API key required for WhatsApp Business API');
        }
        if (!whatsappConfig.businessPhoneNumberId) {
          errors.push('Business phone number ID required for WhatsApp Business API');
        }
      }
      break;

    case 'sms':
      const smsConfig = config as SMSConfig;
      if (!smsConfig.twilioAccountSid) {
        errors.push('Twilio Account SID is required for SMS');
      }
      if (!smsConfig.twilioAuthToken) {
        errors.push('Twilio Auth Token is required for SMS');
      }
      if (!smsConfig.twilioPhoneNumber) {
        errors.push('Twilio Phone Number is required for SMS');
      }
      break;

    case 'email':
      const emailConfig = config as EmailConfig;
      if (!emailConfig.smtp.host) {
        errors.push('SMTP host is required for email');
      }
      if (!emailConfig.smtp.auth.user) {
        errors.push('SMTP username is required for email');
      }
      if (!emailConfig.smtp.auth.pass) {
        errors.push('SMTP password is required for email');
      }
      if (!emailConfig.from.email) {
        errors.push('From email address is required');
      }
      break;

    case 'push':
      const pushConfig = config as PushConfig;
      if (!pushConfig.vapid.publicKey) {
        errors.push('VAPID public key is required for push notifications');
      }
      if (!pushConfig.vapid.privateKey) {
        errors.push('VAPID private key is required for push notifications');
      }
      if (!pushConfig.vapid.subject) {
        errors.push('VAPID subject is required for push notifications');
      }
      break;

    default:
      warnings.push(`Unknown channel type: ${name}`);
      break;
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Helper function to get required environment variables for each channel
 */
export function getRequiredEnvironmentVariables(channelName: string): string[] {
  switch (channelName) {
    case 'whatsapp':
      return [
        'WHATSAPP_BUSINESS_API_KEY',
        'WHATSAPP_BUSINESS_PHONE_NUMBER_ID',
        'WHATSAPP_WEBHOOK_VERIFY_TOKEN'
      ];
    case 'sms':
      return [
        'TWILIO_ACCOUNT_SID',
        'TWILIO_AUTH_TOKEN',
        'TWILIO_PHONE_NUMBER'
      ];
    case 'email':
      return [
        'EMAIL_HOST',
        'EMAIL_PORT',
        'EMAIL_USER',
        'EMAIL_PASS',
        'EMAIL_FROM_NAME',
        'EMAIL_FROM_ADDRESS'
      ];
    case 'push':
      return [
        'VAPID_PUBLIC_KEY',
        'VAPID_PRIVATE_KEY',
        'VAPID_SUBJECT'
      ];
    default:
      return [];
  }
}

/**
 * Helper function to create channel configuration from environment variables
 */
export function createChannelConfigFromEnv(channelName: string): ChannelConfig {
  const baseConfig = {
    enabled: process.env[`${channelName.toUpperCase()}_ENABLED`] !== 'false',
    maxRetries: parseInt(process.env[`${channelName.toUpperCase()}_MAX_RETRIES`] || '3'),
    timeout: parseInt(process.env[`${channelName.toUpperCase()}_TIMEOUT`] || '30000'),
    rateLimitPerMinute: parseInt(process.env[`${channelName.toUpperCase()}_RATE_LIMIT`] || '100'),
    testMode: process.env.NODE_ENV !== 'production'
  };

  switch (channelName) {
    case 'whatsapp':
      return {
        ...baseConfig,
        businessApiKey: process.env.WHATSAPP_BUSINESS_API_KEY,
        businessPhoneNumberId: process.env.WHATSAPP_BUSINESS_PHONE_NUMBER_ID,
        webhookVerifyToken: process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN,
        useWebClient: process.env.WHATSAPP_USE_WEB_CLIENT === 'true',
        sessionPath: process.env.WHATSAPP_SESSION_PATH || './wa-session',
        costPerMessage: 0.005
      } as WhatsAppConfig;

    case 'sms':
      return {
        ...baseConfig,
        twilioAccountSid: process.env.TWILIO_ACCOUNT_SID || '',
        twilioAuthToken: process.env.TWILIO_AUTH_TOKEN || '',
        twilioPhoneNumber: process.env.TWILIO_PHONE_NUMBER || '',
        messagingServiceSid: process.env.TWILIO_MESSAGING_SERVICE_SID,
        statusCallbackUrl: process.env.TWILIO_STATUS_CALLBACK_URL,
        maxMessageLength: parseInt(process.env.SMS_MAX_LENGTH || '1600'),
        enableDeliveryReceipts: process.env.SMS_ENABLE_DELIVERY_RECEIPTS !== 'false',
        enableLongMessages: process.env.SMS_ENABLE_LONG_MESSAGES !== 'false',
        costPerMessage: 0.0075
      } as SMSConfig;

    case 'email':
      return {
        ...baseConfig,
        smtp: {
          host: process.env.EMAIL_HOST || '',
          port: parseInt(process.env.EMAIL_PORT || '587'),
          secure: process.env.EMAIL_SECURE === 'true',
          auth: {
            user: process.env.EMAIL_USER || '',
            pass: process.env.EMAIL_PASS || ''
          },
          tls: {
            rejectUnauthorized: process.env.EMAIL_TLS_REJECT_UNAUTHORIZED !== 'false'
          }
        },
        from: {
          name: process.env.EMAIL_FROM_NAME || 'DuduFisio',
          email: process.env.EMAIL_FROM_ADDRESS || 'noreply@dudufisio.com'
        },
        replyTo: process.env.EMAIL_REPLY_TO,
        maxAttachmentSize: parseInt(process.env.EMAIL_MAX_ATTACHMENT_SIZE || '10485760'), // 10MB
        enableTracking: process.env.EMAIL_ENABLE_TRACKING !== 'false',
        enableBounceHandling: process.env.EMAIL_ENABLE_BOUNCE_HANDLING !== 'false',
        trackingPixelUrl: process.env.EMAIL_TRACKING_PIXEL_URL,
        unsubscribeUrl: process.env.EMAIL_UNSUBSCRIBE_URL,
        costPerMessage: 0.0001
      } as EmailConfig;

    case 'resend-email':
      return {
        ...baseConfig,
        apiKey: process.env.RESEND_API_KEY || '',
        fromEmail: process.env.EMAIL_FROM || 'noreply@moocafisio.com.br',
        fromName: process.env.EMAIL_FROM_NAME || 'DuduFisio',
        replyTo: process.env.EMAIL_REPLY_TO,
        maxAttachmentSize: parseInt(process.env.EMAIL_MAX_ATTACHMENT_SIZE || '10485760'), // 10MB
        enableTracking: process.env.EMAIL_ENABLE_TRACKING !== 'false',
        enableBounceHandling: process.env.EMAIL_ENABLE_BOUNCE_HANDLING !== 'false',
        trackingPixelUrl: process.env.EMAIL_TRACKING_PIXEL_URL,
        unsubscribeUrl: process.env.EMAIL_UNSUBSCRIBE_URL,
        costPerMessage: 0.0001
      } as ResendEmailConfig;

    case 'push':
      return {
        ...baseConfig,
        vapid: {
          publicKey: process.env.VAPID_PUBLIC_KEY || '',
          privateKey: process.env.VAPID_PRIVATE_KEY || '',
          subject: process.env.VAPID_SUBJECT || 'mailto:admin@dudufisio.com'
        },
        gcm: process.env.GCM_API_KEY ? {
          apiKey: process.env.GCM_API_KEY
        } : undefined,
        ttl: parseInt(process.env.PUSH_TTL || '86400'), // 24 hours
        urgency: (process.env.PUSH_URGENCY as any) || 'normal',
        maxPayloadSize: parseInt(process.env.PUSH_MAX_PAYLOAD_SIZE || '4096'),
        enableBadging: process.env.PUSH_ENABLE_BADGING !== 'false',
        enableActions: process.env.PUSH_ENABLE_ACTIONS !== 'false',
        defaultIcon: process.env.PUSH_DEFAULT_ICON || '/icons/icon-192x192.png',
        defaultBadge: process.env.PUSH_DEFAULT_BADGE || '/icons/badge-72x72.png',
        costPerMessage: 0.0001
      } as PushConfig;

    default:
      throw new Error(`Unknown channel: ${channelName}`);
  }
}