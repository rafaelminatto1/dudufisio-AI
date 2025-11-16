import { DomainError } from '../errors/DomainError';
export class Money {
    constructor(amount, currency = 'BRL') {
        this.amount = amount;
        this.currency = currency;
        if (amount < 0) {
            throw new DomainError('Amount cannot be negative');
        }
        if (!this.isValidCurrency(currency)) {
            throw new DomainError(`Invalid currency: ${currency}`);
        }
        // Ensure precision for financial calculations
        this.amount = Math.round(amount * Math.pow(10, Money.PRECISION)) / Math.pow(10, Money.PRECISION);
    }
    static zero(currency = 'BRL') {
        return new Money(0, currency);
    }
    static fromCents(cents, currency = 'BRL') {
        return new Money(cents / 100, currency);
    }
    add(other) {
        this.ensureSameCurrency(other);
        return new Money(this.amount + other.amount, this.currency);
    }
    subtract(other) {
        this.ensureSameCurrency(other);
        return new Money(this.amount - other.amount, this.currency);
    }
    multiply(factor) {
        return new Money(this.amount * factor, this.currency);
    }
    divide(divisor) {
        if (divisor === 0) {
            throw new DomainError('Cannot divide by zero');
        }
        return new Money(this.amount / divisor, this.currency);
    }
    equals(other) {
        return this.amount === other.amount && this.currency === other.currency;
    }
    isGreaterThan(other) {
        this.ensureSameCurrency(other);
        return this.amount > other.amount;
    }
    isLessThan(other) {
        this.ensureSameCurrency(other);
        return this.amount < other.amount;
    }
    isZero() {
        return this.amount === 0;
    }
    toNumber() {
        return this.amount;
    }
    toCents() {
        return Math.round(this.amount * 100);
    }
    toString() {
        return `${this.currency} ${this.amount.toFixed(Money.PRECISION)}`;
    }
    toJSON() {
        return {
            amount: this.amount,
            currency: this.currency
        };
    }
    isValidCurrency(currency) {
        return Money.VALID_CURRENCIES.includes(currency);
    }
    ensureSameCurrency(other) {
        if (this.currency !== other.currency) {
            throw new DomainError(`Currency mismatch: ${this.currency} vs ${other.currency}`);
        }
    }
}
Money.VALID_CURRENCIES = ['BRL', 'USD', 'EUR'];
Money.PRECISION = 2;
