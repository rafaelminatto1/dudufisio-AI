export class DomainError extends Error {
  constructor(message: string, public readonly code?: string) {
    super(message);
    this.name = 'DomainError';
  }
}

export class PaymentError extends DomainError {
  constructor(message: string, code?: string) {
    super(message, code);
    this.name = 'PaymentError';
  }
}

export class ValidationError extends DomainError {
  constructor(message: string, public readonly field?: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class BusinessRuleError extends DomainError {
  constructor(message: string, public readonly rule?: string) {
    super(message);
    this.name = 'BusinessRuleError';
  }
}
