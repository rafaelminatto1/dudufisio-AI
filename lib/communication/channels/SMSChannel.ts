// SMS Communication Channel using Twilio

import { Twilio } from 'twilio';
import {
  Message,
  DeliveryResult,
  ValidationResult,
  Recipient,
  ChannelCapability
} from '../../../types';
import { BaseChannel, BaseChannelConfig } from './BaseChannel';
import {
  CommunicationError,
  CommunicationRepository,
  ConfigurationProvider,
  CommunicationLogger,
  MetricsCollector,
  RateLimiter
} from '../core/types';

/**
 * SMS Channel Configuration
 */
export interface SMSConfig extends BaseChannelConfig {
  twilioAccountSid: string;
  twilioAuthToken: string;
  twilioPhoneNumber: string;
  messagingServiceSid?: string;
  statusCallbackUrl?: string;
  maxMessageLength: number;
  enableDeliveryReceipts: boolean;
  enableLongMessages: boolean; // Allow messages longer than 160 chars
}

/**
 * Twilio Message Response
 */
interface TwilioMessageResponse {
  sid: string;
  accountSid: string;
  messagingServiceSid?: string;
  from: string;
  to: string;
  body: string;
  status: 'queued' | 'sent' | 'received' | 'delivered' | 'undelivered' | 'failed';
  errorCode?: number;
  errorMessage?: string;
  numSegments: string;
  numMedia: string;
  dateCreated: Date;
  dateUpdated: Date;
  dateSent?: Date;
  price?: string;
  priceUnit?: string;
  uri: string;
}

/**
 * SMS Communication Channel using Twilio
 */
export class SMSChannel extends BaseChannel {
  readonly name = 'sms';
  readonly capabilities = [
    ChannelCapability.TEXT,
    ChannelCapability.DELIVERY_STATUS,
    ChannelCapability.SHORT_LINKS
  ];
  readonly priority = 75; // Medium-high priority
  readonly maxRetries = 3;

  private twilioClient: Twilio;

  constructor(
    config: SMSConfig,
    repository: CommunicationRepository,
    configProvider: ConfigurationProvider,
    logger: CommunicationLogger,
    metrics: MetricsCollector,
    rateLimiter?: RateLimiter
  ) {
    super(config, repository, configProvider, logger, metrics, rateLimiter);

    this.initializeTwilioClient();
  }

  /**
   * Initialize Twilio client
   */
  private initializeTwilioClient(): void {
    const config = this.config as SMSConfig;

    if (!config.twilioAccountSid || !config.twilioAuthToken) {
      throw new CommunicationError('SMS_CONFIG_MISSING', 'Twilio credentials are required for SMS channel');
    }

    try {
      this.twilioClient = new Twilio(config.twilioAccountSid, config.twilioAuthToken);

      this.logger.info('Twilio SMS client initialized', {
        accountSid: config.twilioAccountSid.substring(0, 10) + '...',
        fromNumber: config.twilioPhoneNumber
      });
    } catch (error) {
      throw new CommunicationError(
        'SMS_INIT_FAILED',
        `Failed to initialize Twilio client: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Send SMS message
   */
  async send(message: Message): Promise<DeliveryResult> {
    const startTime = Date.now();

    try {
      // Validate message
      const validation = this.validateMessage(message);
      if (!validation.valid) {
        throw new CommunicationError('SMS_VALIDATION_FAILED', `Validation failed: ${validation.errors.join(', ')}`);
      }

      // Check if channel is enabled
      if (!this.isEnabled()) {
        throw new CommunicationError('SMS_DISABLED', 'SMS channel is disabled');
      }

      // Check rate limit
      const rateLimitOk = await this.checkRateLimit(message.recipient);
      if (!rateLimitOk) {
        throw new CommunicationError('SMS_RATE_LIMIT', 'Rate limit exceeded for SMS', true, 60000);
      }

      const recipient = message.recipient;
      const config = this.config as SMSConfig;
      const content = this.prepareMessageContent(message);

      // Prepare SMS parameters
      const smsParams: any = {
        to: this.formatPhoneNumber(recipient.phone!),
        body: this.prepareSMSBody(content.body, config),
      };

      // Use messaging service or from number
      if (config.messagingServiceSid) {
        smsParams.messagingServiceSid = config.messagingServiceSid;
      } else {
        smsParams.from = config.twilioPhoneNumber;
      }

      // Add status callback if configured
      if (config.statusCallbackUrl) {
        smsParams.statusCallback = config.statusCallbackUrl;
      }

      // Send message via Twilio
      const twilioResponse = await this.twilioClient.messages.create(smsParams);

      const cost = this.calculateTwilioCost(twilioResponse);
      const duration = Date.now() - startTime;

      this.recordDeliveryMetrics(true, duration, cost);

      this.logger.info('SMS sent successfully', {
        messageId: message.id,
        twilioSid: twilioResponse.sid,
        to: recipient.phone,
        segments: twilioResponse.numSegments,
        cost: cost
      });

      return this.createSuccessResult({
        messageId: message.id,
        externalMessageId: twilioResponse.sid,
        deliveredAt: twilioResponse.dateSent || new Date(),
        cost,
        metadata: {
          twilioSid: twilioResponse.sid,
          twilioStatus: twilioResponse.status,
          numSegments: twilioResponse.numSegments,
          from: twilioResponse.from,
          to: twilioResponse.to,
          provider: 'twilio'
        }
      });
    } catch (error) {
      const duration = Date.now() - startTime;
      this.recordDeliveryMetrics(false, duration);

      if (error instanceof CommunicationError) {
        return this.handleError(error, { messageId: message.id });
      }

      // Handle Twilio-specific errors
      if (error && typeof error === 'object' && 'code' in error) {
        const twilioError = error as { code: number; message: string; status?: number };
        return this.handleTwilioError(twilioError, message.id);
      }

      return this.handleError(
        new CommunicationError('SMS_SEND_FAILED', 'Failed to send SMS message', true),
        { messageId: message.id }
      );
    }
  }

  /**
   * Get delivery status of an SMS message
   */
  async getDeliveryStatus(messageId: string): Promise<DeliveryResult> {
    try {
      // In a real implementation, you would:
      // 1. Look up the Twilio SID from your database using messageId
      // 2. Query Twilio API for current status

      // For now, return a placeholder
      // const twilioSid = await this.repository.getTwilioSid(messageId);
      // const message = await this.twilioClient.messages(twilioSid).fetch();

      return this.createSuccessResult({
        messageId,
        deliveredAt: new Date(),
        metadata: { status: 'delivered' }
      });
    } catch (error) {
      return this.handleError(error, { messageId });
    }
  }

  /**
   * Test SMS connection
   */
  async testConnection(): Promise<boolean> {
    try {
      const config = this.config as SMSConfig;

      // Test by fetching account information
      const account = await this.twilioClient.api.accounts(config.twilioAccountSid).fetch();

      this.logger.info('SMS connection test successful', {
        accountSid: account.sid,
        status: account.status
      });

      return account.status === 'active';
    } catch (error) {
      this.logger.error('SMS connection test failed', error instanceof Error ? error : new Error(String(error)));
      return false;
    }
  }

  /**
   * Validate recipient for SMS channel
   */
  protected async validateRecipientForChannel(recipient: Recipient): Promise<ValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check if recipient has phone number
    if (!recipient.phone) {
      errors.push('SMS requires a phone number');
    } else {
      // Validate phone number format
      const phoneNumber = this.formatPhoneNumber(recipient.phone);
      if (!this.isValidSMSNumber(phoneNumber)) {
        errors.push('Invalid SMS phone number format');
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Validate message for SMS channel
   */
  protected validateMessageForChannel(message: Message): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const config = this.config as SMSConfig;

    // Check message length
    if (message.content.body && message.content.body.length > config.maxMessageLength) {
      if (config.enableLongMessages) {
        const segments = Math.ceil(message.content.body.length / 160);
        warnings.push(`Message will be sent as ${segments} SMS segments`);
      } else {
        errors.push(`SMS message cannot exceed ${config.maxMessageLength} characters`);
      }
    }

    // SMS doesn't support HTML
    if (message.content.html) {
      warnings.push('HTML content will be ignored for SMS');
    }

    // SMS doesn't support attachments
    if (message.content.attachments && message.content.attachments.length > 0) {
      errors.push('SMS does not support attachments');
    }

    // Check for subject (not supported in SMS)
    if (message.content.subject) {
      warnings.push('Subject line will be ignored for SMS');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Calculate additional cost for SMS
   */
  protected async calculateAdditionalCost(message: Message): Promise<number> {
    const config = this.config as SMSConfig;
    let cost = 0;

    // Base SMS cost (Twilio pricing example)
    const baseCost = 0.0075; // $0.0075 per SMS segment

    // Calculate number of segments
    const segments = Math.ceil((message.content.body?.length || 0) / 160);
    cost = baseCost * segments;

    // International SMS costs more
    const recipient = message.recipient;
    if (recipient.phone && !this.isDomesticNumber(recipient.phone)) {
      cost *= 3; // International SMS typically costs 3x more
    }

    return cost;
  }

  /**
   * Prepare SMS body content
   */
  private prepareSMSBody(body: string, config: SMSConfig): string {
    if (!body) return '';

    // Strip HTML tags if present
    const cleanBody = body.replace(/<[^>]*>/g, '');

    // Handle long messages
    if (cleanBody.length > config.maxMessageLength) {
      if (config.enableLongMessages) {
        // Twilio will automatically split into segments
        return cleanBody;
      } else {
        // Truncate to maximum length
        return cleanBody.substring(0, config.maxMessageLength - 3) + '...';
      }
    }

    return cleanBody;
  }

  /**
   * Format phone number for SMS
   */
  private formatPhoneNumber(phone: string): string {
    // Remove all non-digit characters except +
    let formatted = phone.replace(/[^\d+]/g, '');

    // If number doesn't start with +, add +55 (Brazil) as default
    if (!formatted.startsWith('+')) {
      formatted = '+55' + formatted;
    }

    return formatted;
  }

  /**
   * Validate SMS phone number
   */
  private isValidSMSNumber(phone: string): boolean {
    // E.164 format validation
    const e164Regex = /^\+[1-9]\d{1,14}$/;
    return e164Regex.test(phone);
  }

  /**
   * Check if number is domestic (Brazil)
   */
  private isDomesticNumber(phone: string): boolean {
    const formatted = this.formatPhoneNumber(phone);
    return formatted.startsWith('+55');
  }

  /**
   * Calculate cost from Twilio response
   */
  private calculateTwilioCost(response: TwilioMessageResponse): number {
    if (response.price && response.priceUnit) {
      // Convert price string to number
      const price = parseFloat(response.price);
      return Math.abs(price); // Twilio returns negative prices
    }

    // Fallback to calculated cost
    const segments = parseInt(response.numSegments) || 1;
    const baseCost = 0.0075;
    return baseCost * segments;
  }

  /**
   * Handle Twilio-specific errors
   */
  private handleTwilioError(error: { code: number; message: string; status?: number }, messageId: string): DeliveryResult {
    let communicationError: CommunicationError;

    switch (error.code) {
      case 21211:
        communicationError = new CommunicationError('SMS_INVALID_NUMBER', 'Invalid phone number', false);
        break;
      case 21408:
        communicationError = new CommunicationError('SMS_PERMISSION_DENIED', 'Permission denied to send SMS', false);
        break;
      case 21610:
        communicationError = new CommunicationError('SMS_UNSUBSCRIBED', 'Number has unsubscribed from SMS', false);
        break;
      case 30001:
        communicationError = new CommunicationError('SMS_QUEUE_OVERFLOW', 'Message queue is full', true, 30000);
        break;
      case 30003:
        communicationError = new CommunicationError('SMS_UNREACHABLE', 'Phone number unreachable', false);
        break;
      case 30005:
        communicationError = new CommunicationError('SMS_UNKNOWN_DESTINATION', 'Unknown destination', false);
        break;
      case 30006:
        communicationError = new CommunicationError('SMS_LANDLINE_UNREACHABLE', 'Landline or unreachable carrier', false);
        break;
      case 30008:
        communicationError = new CommunicationError('SMS_UNKNOWN_ERROR', 'Unknown error', true);
        break;
      case 30034:
        communicationError = new CommunicationError('SMS_INVALID_MESSAGE', 'Invalid message body', false);
        break;
      case 63016:
        communicationError = new CommunicationError('SMS_NUMBER_NOT_OWNED', 'The From phone number is not owned by your account', false);
        break;
      default:
        communicationError = new CommunicationError(
          'SMS_TWILIO_ERROR',
          `Twilio error ${error.code}: ${error.message}`,
          error.status ? error.status >= 500 : true
        );
        break;
    }

    return this.handleError(communicationError, { messageId, twilioError: error });
  }

  /**
   * Process SMS status webhook (to be called by webhook endpoint)
   */
  async processStatusWebhook(webhookData: any): Promise<void> {
    try {
      const { MessageSid, MessageStatus, To, From, Body, ErrorCode, ErrorMessage } = webhookData;

      this.logger.info('Received SMS status webhook', {
        twilioSid: MessageSid,
        status: MessageStatus,
        to: To,
        errorCode: ErrorCode
      });

      // Update message status in repository
      // const messageId = await this.repository.getMessageIdByTwilioSid(MessageSid);
      // if (messageId) {
      //   await this.repository.updateMessageStatus(messageId, MessageStatus, {
      //     twilioStatus: MessageStatus,
      //     updatedAt: new Date(),
      //     errorCode: ErrorCode,
      //     errorMessage: ErrorMessage
      //   });
      // }

      this.metrics.increment(`sms.webhook.status.${MessageStatus}`);

      if (ErrorCode) {
        this.metrics.increment('sms.webhook.errors');
        this.logger.warn('SMS delivery error reported by webhook', {
          twilioSid: MessageSid,
          errorCode: ErrorCode,
          errorMessage: ErrorMessage
        });
      }
    } catch (error) {
      this.logger.error('Error processing SMS status webhook', error instanceof Error ? error : new Error(String(error)), {
        webhookData
      });
    }
  }
}

/**
 * Default SMS configuration
 */
export const defaultSMSConfig: SMSConfig = {
  enabled: true,
  maxRetries: 3,
  timeout: 30000,
  rateLimitPerMinute: 100,
  costPerMessage: 0.0075,
  testMode: false,
  twilioAccountSid: '',
  twilioAuthToken: '',
  twilioPhoneNumber: '',
  maxMessageLength: 1600, // Allow long messages
  enableDeliveryReceipts: true,
  enableLongMessages: true
};