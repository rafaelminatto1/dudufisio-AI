// Core Communication Interfaces and Abstractions

import {
  Message,
  DeliveryResult,
  ValidationResult,
  OptOutStatus,
  Recipient,
  ChannelCapability,
  CommunicationChannel,
  MessageId,
  DomainEvent
} from '../../../types';

/**
 * Core interface that all communication channels must implement
 */
export interface CommunicationChannelInterface {
  readonly name: string;
  readonly capabilities: ChannelCapability[];
  readonly priority: number;
  readonly maxRetries: number;

  /**
   * Send a message through this channel
   */
  send(message: Message): Promise<DeliveryResult>;

  /**
   * Get delivery status of a message
   */
  getDeliveryStatus(messageId: string): Promise<DeliveryResult>;

  /**
   * Validate if recipient can receive messages on this channel
   */
  validateRecipient(recipient: Recipient): Promise<ValidationResult>;

  /**
   * Check opt-out status for recipient
   */
  getOptOutStatus(recipient: Recipient): Promise<OptOutStatus>;

  /**
   * Test channel connectivity
   */
  testConnection(): Promise<boolean>;

  /**
   * Calculate estimated cost for message
   */
  calculateCost(message: Message): Promise<number>;

  /**
   * Check if channel supports specific capability
   */
  hasCapability(capability: ChannelCapability): boolean;
}

/**
 * Error that occurred during communication processing
 */
export class CommunicationError extends Error {
  constructor(
    public code: string,
    message: string,
    public retryable: boolean = false,
    public retryAfter?: number,
    public details?: unknown
  ) {
    super(message);
    this.name = 'CommunicationError';
  }

  static fromError(error: unknown, code = 'UNKNOWN_ERROR'): CommunicationError {
    if (error instanceof CommunicationError) {
      return error;
    }

    if (error instanceof Error) {
      return new CommunicationError(code, error.message, false, undefined, error);
    }

    return new CommunicationError(code, 'Unknown error occurred', false, undefined, error);
  }
}

/**
 * No available channel error
 */
export class NoAvailableChannelError extends CommunicationError {
  constructor(message = 'No channels available for message delivery') {
    super('NO_AVAILABLE_CHANNEL', message, false);
  }
}

/**
 * Rate limit error
 */
export class RateLimitError extends CommunicationError {
  constructor(retryAfter: number, message = 'Rate limit exceeded') {
    super('RATE_LIMIT_EXCEEDED', message, true, retryAfter);
  }
}

/**
 * Message validation error
 */
export class MessageValidationError extends CommunicationError {
  constructor(errors: string[]) {
    super('MESSAGE_VALIDATION_FAILED', `Validation failed: ${errors.join(', ')}`, false);
  }
}

/**
 * Template not found error
 */
export class TemplateNotFoundError extends CommunicationError {
  constructor(templateId: string) {
    super('TEMPLATE_NOT_FOUND', `Template ${templateId} not found`, false);
  }
}

/**
 * Recipient opted out error
 */
export class RecipientOptedOutError extends CommunicationError {
  constructor(channel: CommunicationChannel) {
    super('RECIPIENT_OPTED_OUT', `Recipient has opted out of ${channel} communications`, false);
  }
}

/**
 * Result of delivery attempt
 */
export class DeliveryResultBuilder {
  private result: Partial<DeliveryResult> = {
    success: false,
    retryable: false
  };

  static success(data: Partial<DeliveryResult> = {}): DeliveryResult {
    return new DeliveryResultBuilder()
      .setSuccess(true)
      .setChannel(data.channel!)
      .setDeliveredAt(data.deliveredAt || new Date())
      .setMessageId(data.messageId)
      .setExternalMessageId(data.externalMessageId)
      .setCost(data.cost)
      .setMetadata(data.metadata)
      .build();
  }

  static failure(error: CommunicationError, channel: CommunicationChannel): DeliveryResult {
    return new DeliveryResultBuilder()
      .setSuccess(false)
      .setChannel(channel)
      .setError(error)
      .setRetryable(error.retryable)
      .build();
  }

  setSuccess(success: boolean): this {
    this.result.success = success;
    return this;
  }

  setChannel(channel: CommunicationChannel): this {
    this.result.channel = channel;
    return this;
  }

  setMessageId(messageId?: string): this {
    this.result.messageId = messageId;
    return this;
  }

  setExternalMessageId(externalMessageId?: string): this {
    this.result.externalMessageId = externalMessageId;
    return this;
  }

  setDeliveredAt(deliveredAt?: Date): this {
    this.result.deliveredAt = deliveredAt;
    return this;
  }

  setCost(cost?: number): this {
    this.result.cost = cost;
    return this;
  }

  setError(error?: CommunicationError): this {
    this.result.error = error;
    return this;
  }

  setRetryable(retryable: boolean): this {
    this.result.retryable = retryable;
    return this;
  }

  setMetadata(metadata?: Record<string, unknown>): this {
    this.result.metadata = metadata;
    return this;
  }

  build(): DeliveryResult {
    if (!this.result.channel) {
      throw new Error('Channel is required for DeliveryResult');
    }

    return this.result as DeliveryResult;
  }
}

/**
 * Message validator utility
 */
export class MessageValidator {
  static validate(message: Message): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check recipient
    if (!message.recipient) {
      errors.push('Recipient is required');
    } else {
      const recipientValidation = this.validateRecipient(message.recipient);
      errors.push(...recipientValidation.errors);
      warnings.push(...recipientValidation.warnings);
    }

    // Check content
    if (!message.content?.body?.trim()) {
      errors.push('Message body is required');
    }

    // Check content length
    if (message.content?.body && message.content.body.length > 4096) {
      warnings.push('Message body is very long and may be truncated');
    }

    // Check scheduling
    if (message.scheduledFor && message.scheduledFor < new Date()) {
      errors.push('Scheduled time cannot be in the past');
    }

    // Check expiration
    if (message.expiresAt && message.scheduledFor && message.expiresAt <= message.scheduledFor) {
      errors.push('Expiration time must be after scheduled time');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  static validateRecipient(recipient: Recipient): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!recipient.id) {
      errors.push('Recipient ID is required');
    }

    if (!recipient.name?.trim()) {
      errors.push('Recipient name is required');
    }

    // Check if at least one contact method is available
    const hasContact = recipient.phone || recipient.email || recipient.pushToken;
    if (!hasContact) {
      errors.push('Recipient must have at least one contact method (phone, email, or push token)');
    }

    // Validate phone format
    if (recipient.phone && !this.isValidPhone(recipient.phone)) {
      warnings.push('Phone number format may be invalid');
    }

    // Validate email format
    if (recipient.email && !this.isValidEmail(recipient.email)) {
      errors.push('Email format is invalid');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  private static isValidPhone(phone: string): boolean {
    // Basic phone validation - should be more comprehensive in production
    const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
    return phoneRegex.test(phone);
  }

  private static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}

/**
 * Event dispatcher for communication events
 */
export interface EventDispatcher {
  dispatch(event: DomainEvent): Promise<void>;
  subscribe(eventType: string, handler: (event: DomainEvent) => Promise<void>): void;
  unsubscribe(eventType: string, handler: (event: DomainEvent) => Promise<void>): void;
}

/**
 * Communication repository interface
 */
export interface CommunicationRepository {
  // Messages
  saveMessage(message: Message): Promise<void>;
  getMessage(messageId: MessageId): Promise<Message | null>;
  updateMessageStatus(messageId: MessageId, status: string, metadata?: Record<string, unknown>): Promise<void>;

  // Recipients
  getRecipient(recipientId: string): Promise<Recipient | null>;
  getRecipients(filter: Record<string, unknown>): Promise<Recipient[]>;

  // Opt-outs
  getOptOutStatus(recipientId: string, channel: CommunicationChannel): Promise<OptOutStatus>;
  setOptOutStatus(recipientId: string, channel: CommunicationChannel, optedOut: boolean, reason?: string): Promise<void>;

  // Analytics
  getChannelMetrics(channel: CommunicationChannel, period: { start: Date; end: Date }): Promise<any>;
  getCampaignMetrics(campaignId: string): Promise<any>;
}

/**
 * Configuration provider interface
 */
export interface ConfigurationProvider {
  get<T>(key: string, defaultValue?: T): T;
  getChannelConfig(channel: CommunicationChannel): Record<string, unknown>;
  isChannelEnabled(channel: CommunicationChannel): boolean;
}

/**
 * Logger interface for communication system
 */
export interface CommunicationLogger {
  info(message: string, metadata?: Record<string, unknown>): void;
  warn(message: string, metadata?: Record<string, unknown>): void;
  error(message: string, error?: Error, metadata?: Record<string, unknown>): void;
  debug(message: string, metadata?: Record<string, unknown>): void;
}

/**
 * Metrics collector interface
 */
export interface MetricsCollector {
  increment(metric: string, tags?: Record<string, string>): void;
  gauge(metric: string, value: number, tags?: Record<string, string>): void;
  timing(metric: string, duration: number, tags?: Record<string, string>): void;
  histogram(metric: string, value: number, tags?: Record<string, string>): void;
}

/**
 * Rate limiter interface
 */
export interface RateLimiter {
  checkLimit(key: string, limit: number, window: number): Promise<{
    allowed: boolean;
    remaining: number;
    resetTime: Date;
  }>;
}

/**
 * Feature flags interface
 */
export interface FeatureFlags {
  isEnabled(flag: string, context?: Record<string, unknown>): Promise<boolean>;
  getVariation<T>(flag: string, defaultValue: T, context?: Record<string, unknown>): Promise<T>;
}