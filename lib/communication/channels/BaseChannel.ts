// Base Communication Channel - Abstract implementation with common functionality

import {
  Message,
  DeliveryResult,
  ValidationResult,
  OptOutStatus,
  Recipient,
  ChannelCapability,
  CommunicationChannel
} from '../../../types';
import {
  CommunicationChannelInterface,
  CommunicationError,
  DeliveryResultBuilder,
  MessageValidator,
  CommunicationRepository,
  ConfigurationProvider,
  CommunicationLogger,
  MetricsCollector,
  RateLimiter
} from '../core/types';

/**
 * Base configuration for all channels
 */
export interface BaseChannelConfig {
  enabled: boolean;
  maxRetries: number;
  timeout: number;
  rateLimitPerMinute?: number;
  costPerMessage?: number;
  testMode?: boolean;
}

/**
 * Abstract base class for all communication channels
 * Provides common functionality and enforces consistent patterns
 */
export abstract class BaseChannel implements CommunicationChannelInterface {
  abstract readonly name: string;
  abstract readonly capabilities: ChannelCapability[];
  abstract readonly priority: number;
  abstract readonly maxRetries: number;

  protected config: BaseChannelConfig;
  protected repository: CommunicationRepository;
  protected configProvider: ConfigurationProvider;
  protected logger: CommunicationLogger;
  protected metrics: MetricsCollector;
  protected rateLimiter?: RateLimiter;

  constructor(
    config: BaseChannelConfig,
    repository: CommunicationRepository,
    configProvider: ConfigurationProvider,
    logger: CommunicationLogger,
    metrics: MetricsCollector,
    rateLimiter?: RateLimiter
  ) {
    this.config = config;
    this.repository = repository;
    this.configProvider = configProvider;
    this.logger = logger;
    this.metrics = metrics;
    this.rateLimiter = rateLimiter;
  }

  /**
   * Send a message through this channel (implemented by subclasses)
   */
  abstract send(message: Message): Promise<DeliveryResult>;

  /**
   * Get delivery status of a message (implemented by subclasses)
   */
  abstract getDeliveryStatus(messageId: string): Promise<DeliveryResult>;

  /**
   * Test channel connectivity (implemented by subclasses)
   */
  abstract testConnection(): Promise<boolean>;

  /**
   * Validate if recipient can receive messages on this channel
   */
  async validateRecipient(recipient: Recipient): Promise<ValidationResult> {
    const startTime = Date.now();

    try {
      // Basic validation using MessageValidator
      const baseValidation = MessageValidator.validateRecipient(recipient);

      if (!baseValidation.valid) {
        this.metrics.timing(`channel.${this.name}.validation_time`, Date.now() - startTime);
        this.metrics.increment(`channel.${this.name}.validation.failed`);
        return baseValidation;
      }

      // Channel-specific validation
      const channelValidation = await this.validateRecipientForChannel(recipient);

      const result: ValidationResult = {
        valid: baseValidation.valid && channelValidation.valid,
        errors: [...baseValidation.errors, ...channelValidation.errors],
        warnings: [...baseValidation.warnings, ...channelValidation.warnings]
      };

      this.metrics.timing(`channel.${this.name}.validation_time`, Date.now() - startTime);
      this.metrics.increment(`channel.${this.name}.validation.${result.valid ? 'success' : 'failed'}`);

      return result;
    } catch (error) {
      this.metrics.timing(`channel.${this.name}.validation_error_time`, Date.now() - startTime);
      this.metrics.increment(`channel.${this.name}.validation.error`);

      this.logger.error('Recipient validation failed', error instanceof Error ? error : new Error(String(error)), {
        channel: this.name,
        recipientId: recipient.id
      });

      return {
        valid: false,
        errors: ['Validation failed due to system error'],
        warnings: []
      };
    }
  }

  /**
   * Channel-specific recipient validation (implemented by subclasses)
   */
  protected abstract validateRecipientForChannel(recipient: Recipient): Promise<ValidationResult>;

  /**
   * Check opt-out status for recipient
   */
  async getOptOutStatus(recipient: Recipient): Promise<OptOutStatus> {
    try {
      const status = await this.repository.getOptOutStatus(recipient.id, this.name as CommunicationChannel);

      this.metrics.increment(`channel.${this.name}.opt_out_check`);

      return status;
    } catch (error) {
      this.logger.error('Failed to check opt-out status', error instanceof Error ? error : new Error(String(error)), {
        channel: this.name,
        recipientId: recipient.id
      });

      // Default to not opted out if we can't check
      return {
        optedOut: false,
        timestamp: new Date(),
        reason: undefined
      };
    }
  }

  /**
   * Calculate estimated cost for message
   */
  async calculateCost(message: Message): Promise<number> {
    try {
      const baseCost = this.config.costPerMessage || 0;
      const additionalCost = await this.calculateAdditionalCost(message);

      const totalCost = baseCost + additionalCost;

      this.metrics.gauge(`channel.${this.name}.cost_per_message`, totalCost);

      return totalCost;
    } catch (error) {
      this.logger.warn('Cost calculation failed, using base cost', {
        channel: this.name,
        messageId: message.id,
        error: error instanceof Error ? error.message : String(error)
      });

      return this.config.costPerMessage || 0;
    }
  }

  /**
   * Calculate additional cost based on message content (implemented by subclasses)
   */
  protected async calculateAdditionalCost(message: Message): Promise<number> {
    // Base implementation returns 0, subclasses can override
    return 0;
  }

  /**
   * Check if channel supports specific capability
   */
  hasCapability(capability: ChannelCapability): boolean {
    return this.capabilities.includes(capability);
  }

  /**
   * Protected helper methods for subclasses
   */

  /**
   * Validate message content for this channel
   */
  protected validateMessage(message: Message): ValidationResult {
    const validation = MessageValidator.validate(message);

    // Add channel-specific validations
    const channelValidation = this.validateMessageForChannel(message);

    return {
      valid: validation.valid && channelValidation.valid,
      errors: [...validation.errors, ...channelValidation.errors],
      warnings: [...validation.warnings, ...channelValidation.warnings]
    };
  }

  /**
   * Channel-specific message validation (implemented by subclasses)
   */
  protected abstract validateMessageForChannel(message: Message): ValidationResult;

  /**
   * Check rate limit before sending
   */
  protected async checkRateLimit(recipient: Recipient): Promise<boolean> {
    if (!this.rateLimiter || !this.config.rateLimitPerMinute) {
      return true; // No rate limiting configured
    }

    const key = `${this.name}:${recipient.id}`;
    const limit = this.config.rateLimitPerMinute;
    const window = 60; // 1 minute in seconds

    try {
      const result = await this.rateLimiter.checkLimit(key, limit, window);

      this.metrics.gauge(`channel.${this.name}.rate_limit.remaining`, result.remaining);

      if (!result.allowed) {
        this.logger.warn('Rate limit exceeded', {
          channel: this.name,
          recipientId: recipient.id,
          remaining: result.remaining,
          resetTime: result.resetTime
        });
      }

      return result.allowed;
    } catch (error) {
      this.logger.error('Rate limit check failed', error instanceof Error ? error : new Error(String(error)), {
        channel: this.name,
        recipientId: recipient.id
      });

      // Allow if rate limit check fails
      return true;
    }
  }

  /**
   * Handle common errors and convert to standardized format
   */
  protected handleError(error: unknown, context?: Record<string, unknown>): DeliveryResult {
    const communicationError = CommunicationError.fromError(error);

    // Log error with context
    this.logger.error(`Channel ${this.name} error`, communicationError, {
      channel: this.name,
      ...context
    });

    // Record metrics
    this.metrics.increment(`channel.${this.name}.errors.${communicationError.code}`);

    return DeliveryResultBuilder.failure(communicationError, this.name as CommunicationChannel);
  }

  /**
   * Create successful delivery result
   */
  protected createSuccessResult(data: Partial<DeliveryResult> = {}): DeliveryResult {
    return DeliveryResultBuilder.success({
      channel: this.name as CommunicationChannel,
      deliveredAt: new Date(),
      ...data
    });
  }

  /**
   * Format location for display (utility method)
   */
  protected formatLocation(location: any): string {
    if (typeof location === 'string') {
      return location;
    }

    if (location && typeof location === 'object') {
      const parts = [];
      if (location.name) parts.push(location.name);
      if (location.address) {
        if (typeof location.address === 'string') {
          parts.push(location.address);
        } else {
          const addressParts = [];
          if (location.address.street) addressParts.push(location.address.street);
          if (location.address.city) addressParts.push(location.address.city);
          if (location.address.state) addressParts.push(location.address.state);
          if (addressParts.length > 0) {
            parts.push(addressParts.join(', '));
          }
        }
      }
      return parts.join(' - ');
    }

    return '';
  }

  /**
   * Check if channel is in test mode
   */
  protected isTestMode(): boolean {
    return this.config.testMode || false;
  }

  /**
   * Get channel-specific configuration
   */
  protected getChannelConfig(): Record<string, unknown> {
    return this.configProvider.getChannelConfig(this.name as CommunicationChannel);
  }

  /**
   * Check if channel is enabled
   */
  protected isEnabled(): boolean {
    return this.config.enabled && this.configProvider.isChannelEnabled(this.name as CommunicationChannel);
  }

  /**
   * Record delivery metrics
   */
  protected recordDeliveryMetrics(success: boolean, duration: number, cost?: number): void {
    this.metrics.timing(`channel.${this.name}.delivery_time`, duration);
    this.metrics.increment(`channel.${this.name}.deliveries.${success ? 'success' : 'failure'}`);

    if (cost !== undefined) {
      this.metrics.gauge(`channel.${this.name}.delivery_cost`, cost);
    }
  }

  /**
   * Prepare message content for channel (utility for subclasses)
   */
  protected prepareMessageContent(message: Message): {
    subject?: string;
    body: string;
    html?: string;
    attachments?: any[];
  } {
    return {
      subject: message.content.subject,
      body: message.content.body || '',
      html: message.content.html,
      attachments: message.content.attachments
    };
  }

  /**
   * Generate tracking ID for message
   */
  protected generateTrackingId(messageId: string): string {
    return `${this.name}-${messageId}-${Date.now()}`;
  }

  /**
   * Sanitize recipient data for logging (remove sensitive info)
   */
  protected sanitizeRecipientForLogging(recipient: Recipient): Record<string, unknown> {
    return {
      id: recipient.id,
      name: recipient.name,
      hasEmail: !!recipient.email,
      hasPhone: !!recipient.phone,
      hasPushToken: !!recipient.pushToken
    };
  }

  /**
   * Get timeout for requests
   */
  protected getTimeout(): number {
    return this.config.timeout || 30000; // 30 seconds default
  }
}

/**
 * Default base channel configuration
 */
export const defaultBaseChannelConfig: BaseChannelConfig = {
  enabled: true,
  maxRetries: 3,
  timeout: 30000, // 30 seconds
  rateLimitPerMinute: 60,
  costPerMessage: 0,
  testMode: false
};