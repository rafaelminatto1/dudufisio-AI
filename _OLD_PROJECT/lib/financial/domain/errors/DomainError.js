export class DomainError extends Error {
    constructor(message, code) {
        super(message);
        this.code = code;
        this.name = 'DomainError';
    }
}
export class PaymentError extends DomainError {
    constructor(message, code) {
        super(message, code);
        this.name = 'PaymentError';
    }
}
export class ValidationError extends DomainError {
    constructor(message, field) {
        super(message);
        this.field = field;
        this.name = 'ValidationError';
    }
}
export class BusinessRuleError extends DomainError {
    constructor(message, rule) {
        super(message);
        this.rule = rule;
        this.name = 'BusinessRuleError';
    }
}
