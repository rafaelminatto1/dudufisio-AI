import { DomainError } from '../errors/DomainError';

export class Money {
  private static readonly VALID_CURRENCIES = ['BRL', 'USD', 'EUR'];
  private static readonly PRECISION = 2;

  constructor(
    private readonly amount: number,
    private readonly currency: string = 'BRL'
  ) {
    if (amount < 0) {
      throw new DomainError('Amount cannot be negative');
    }
    if (!this.isValidCurrency(currency)) {
      throw new DomainError(`Invalid currency: ${currency}`);
    }
    // Ensure precision for financial calculations
    this.amount = Math.round(amount * Math.pow(10, Money.PRECISION)) / Math.pow(10, Money.PRECISION);
  }

  static zero(currency: string = 'BRL'): Money {
    return new Money(0, currency);
  }

  static fromCents(cents: number, currency: string = 'BRL'): Money {
    return new Money(cents / 100, currency);
  }

  add(other: Money): Money {
    this.ensureSameCurrency(other);
    return new Money(this.amount + other.amount, this.currency);
  }

  subtract(other: Money): Money {
    this.ensureSameCurrency(other);
    return new Money(this.amount - other.amount, this.currency);
  }

  multiply(factor: number): Money {
    return new Money(this.amount * factor, this.currency);
  }

  divide(divisor: number): Money {
    if (divisor === 0) {
      throw new DomainError('Cannot divide by zero');
    }
    return new Money(this.amount / divisor, this.currency);
  }

  equals(other: Money): boolean {
    return this.amount === other.amount && this.currency === other.currency;
  }

  isGreaterThan(other: Money): boolean {
    this.ensureSameCurrency(other);
    return this.amount > other.amount;
  }

  isLessThan(other: Money): boolean {
    this.ensureSameCurrency(other);
    return this.amount < other.amount;
  }

  isZero(): boolean {
    return this.amount === 0;
  }

  toNumber(): number {
    return this.amount;
  }

  toCents(): number {
    return Math.round(this.amount * 100);
  }

  toString(): string {
    return `${this.currency} ${this.amount.toFixed(Money.PRECISION)}`;
  }

  toJSON() {
    return {
      amount: this.amount,
      currency: this.currency
    };
  }

  private isValidCurrency(currency: string): boolean {
    return Money.VALID_CURRENCIES.includes(currency);
  }

  private ensureSameCurrency(other: Money): void {
    if (this.currency !== other.currency) {
      throw new DomainError(`Currency mismatch: ${this.currency} vs ${other.currency}`);
    }
  }
}
