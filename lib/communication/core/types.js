// Core Communication Interfaces and Abstractions
/**
 * Error that occurred during communication processing
 */
export class CommunicationError extends Error {
    constructor(code, message, retryable = false, retryAfter, details) {
        super(message);
        this.code = code;
        this.retryable = retryable;
        this.retryAfter = retryAfter;
        this.details = details;
        this.name = 'CommunicationError';
    }
    static fromError(error, code = 'UNKNOWN_ERROR') {
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
    constructor(retryAfter, message = 'Rate limit exceeded') {
        super('RATE_LIMIT_EXCEEDED', message, true, retryAfter);
    }
}
/**
 * Message validation error
 */
export class MessageValidationError extends CommunicationError {
    constructor(errors) {
        super('MESSAGE_VALIDATION_FAILED', `Validation failed: ${errors.join(', ')}`, false);
    }
}
/**
 * Template not found error
 */
export class TemplateNotFoundError extends CommunicationError {
    constructor(templateId) {
        super('TEMPLATE_NOT_FOUND', `Template ${templateId} not found`, false);
    }
}
/**
 * Recipient opted out error
 */
export class RecipientOptedOutError extends CommunicationError {
    constructor(channel) {
        super('RECIPIENT_OPTED_OUT', `Recipient has opted out of ${channel} communications`, false);
    }
}
/**
 * Result of delivery attempt
 */
export class DeliveryResultBuilder {
    constructor() {
        this.result = {
            success: false,
            retryable: false
        };
    }
    static success(data = {}) {
        return new DeliveryResultBuilder()
            .setSuccess(true)
            .setChannel(data.channel)
            .setDeliveredAt(data.deliveredAt || new Date())
            .setMessageId(data.messageId)
            .setExternalMessageId(data.externalMessageId)
            .setCost(data.cost)
            .setMetadata(data.metadata)
            .build();
    }
    static failure(error, channel) {
        return new DeliveryResultBuilder()
            .setSuccess(false)
            .setChannel(channel)
            .setError(error)
            .setRetryable(error.retryable)
            .build();
    }
    setSuccess(success) {
        this.result.success = success;
        return this;
    }
    setChannel(channel) {
        this.result.channel = channel;
        return this;
    }
    setMessageId(messageId) {
        this.result.messageId = messageId;
        return this;
    }
    setExternalMessageId(externalMessageId) {
        this.result.externalMessageId = externalMessageId;
        return this;
    }
    setDeliveredAt(deliveredAt) {
        this.result.deliveredAt = deliveredAt;
        return this;
    }
    setCost(cost) {
        this.result.cost = cost;
        return this;
    }
    setError(error) {
        this.result.error = error;
        return this;
    }
    setRetryable(retryable) {
        this.result.retryable = retryable;
        return this;
    }
    setMetadata(metadata) {
        this.result.metadata = metadata;
        return this;
    }
    build() {
        if (!this.result.channel) {
            throw new Error('Channel is required for DeliveryResult');
        }
        return this.result;
    }
}
/**
 * Message validator utility
 */
export class MessageValidator {
    static validate(message) {
        const errors = [];
        const warnings = [];
        // Check recipient
        if (!message.recipient) {
            errors.push('Recipient is required');
        }
        else {
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
    static validateRecipient(recipient) {
        const errors = [];
        const warnings = [];
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
    static isValidPhone(phone) {
        // Basic phone validation - should be more comprehensive in production
        const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
        return phoneRegex.test(phone);
    }
    static isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
}
