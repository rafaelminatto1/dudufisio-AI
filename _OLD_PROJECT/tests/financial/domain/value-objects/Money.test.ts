import { Money } from '../../../../lib/financial/domain/value-objects/Money';
import { DomainError } from '../../../../lib/financial/domain/errors/DomainError';

describe('Money Value Object', () => {
  describe('Construction', () => {
    it('should create money with valid amount and currency', () => {
      const money = new Money(100, 'BRL');
      expect(money.toNumber()).toBe(100);
      expect(money.toString()).toBe('BRL 100.00');
    });

    it('should create money with default currency BRL', () => {
      const money = new Money(50);
      expect(money.toString()).toBe('BRL 50.00');
    });

    it('should throw error for negative amounts', () => {
      expect(() => new Money(-100)).toThrow(DomainError);
      expect(() => new Money(-100)).toThrow('Amount cannot be negative');
    });

    it('should throw error for invalid currency', () => {
      expect(() => new Money(100, 'INVALID')).toThrow(DomainError);
      expect(() => new Money(100, 'INVALID')).toThrow('Invalid currency: INVALID');
    });

    it('should round amounts to 2 decimal places', () => {
      const money = new Money(100.999, 'BRL');
      expect(money.toNumber()).toBe(101);
    });
  });

  describe('Static Factory Methods', () => {
    it('should create zero money', () => {
      const zero = Money.zero();
      expect(zero.toNumber()).toBe(0);
      expect(zero.toString()).toBe('BRL 0.00');
    });

    it('should create zero money with specific currency', () => {
      const zero = Money.zero('USD');
      expect(zero.toString()).toBe('USD 0.00');
    });

    it('should create money from cents', () => {
      const money = Money.fromCents(10050);
      expect(money.toNumber()).toBe(100.5);
      expect(money.toString()).toBe('BRL 100.50');
    });
  });

  describe('Arithmetic Operations', () => {
    const money1 = new Money(100, 'BRL');
    const money2 = new Money(50, 'BRL');
    const moneyUsd = new Money(100, 'USD');

    it('should add money with same currency', () => {
      const result = money1.add(money2);
      expect(result.toNumber()).toBe(150);
      expect(result.toString()).toBe('BRL 150.00');
    });

    it('should subtract money with same currency', () => {
      const result = money1.subtract(money2);
      expect(result.toNumber()).toBe(50);
      expect(result.toString()).toBe('BRL 50.00');
    });

    it('should multiply money by factor', () => {
      const result = money1.multiply(2.5);
      expect(result.toNumber()).toBe(250);
      expect(result.toString()).toBe('BRL 250.00');
    });

    it('should divide money by divisor', () => {
      const result = money1.divide(4);
      expect(result.toNumber()).toBe(25);
      expect(result.toString()).toBe('BRL 25.00');
    });

    it('should throw error when adding different currencies', () => {
      expect(() => money1.add(moneyUsd)).toThrow(DomainError);
      expect(() => money1.add(moneyUsd)).toThrow('Currency mismatch: BRL vs USD');
    });

    it('should throw error when dividing by zero', () => {
      expect(() => money1.divide(0)).toThrow(DomainError);
      expect(() => money1.divide(0)).toThrow('Cannot divide by zero');
    });
  });

  describe('Comparison Operations', () => {
    const money1 = new Money(100, 'BRL');
    const money2 = new Money(100, 'BRL');
    const money3 = new Money(150, 'BRL');
    const moneyUsd = new Money(100, 'USD');

    it('should check equality correctly', () => {
      expect(money1.equals(money2)).toBe(true);
      expect(money1.equals(money3)).toBe(false);
      expect(money1.equals(moneyUsd)).toBe(false);
    });

    it('should compare amounts correctly', () => {
      expect(money3.isGreaterThan(money1)).toBe(true);
      expect(money1.isGreaterThan(money3)).toBe(false);
      expect(money1.isLessThan(money3)).toBe(true);
      expect(money3.isLessThan(money1)).toBe(false);
    });

    it('should throw error when comparing different currencies', () => {
      expect(() => money1.isGreaterThan(moneyUsd)).toThrow(DomainError);
      expect(() => money1.isLessThan(moneyUsd)).toThrow(DomainError);
    });

    it('should check if money is zero', () => {
      const zero = Money.zero();
      const nonZero = new Money(100);
      
      expect(zero.isZero()).toBe(true);
      expect(nonZero.isZero()).toBe(false);
    });
  });

  describe('Conversion Methods', () => {
    const money = new Money(123.45, 'BRL');

    it('should convert to cents', () => {
      expect(money.toCents()).toBe(12345);
    });

    it('should convert to JSON', () => {
      const json = money.toJSON();
      expect(json).toEqual({
        amount: 123.45,
        currency: 'BRL'
      });
    });

    it('should format as string', () => {
      expect(money.toString()).toBe('BRL 123.45');
    });
  });

  describe('Edge Cases', () => {
    it('should handle very small amounts', () => {
      const money = new Money(0.01, 'BRL');
      expect(money.toNumber()).toBe(0.01);
      expect(money.toCents()).toBe(1);
    });

    it('should handle large amounts', () => {
      const money = new Money(999999.99, 'BRL');
      expect(money.toNumber()).toBe(999999.99);
      expect(money.toCents()).toBe(99999999);
    });

    it('should handle floating point precision issues', () => {
      const money1 = new Money(0.1, 'BRL');
      const money2 = new Money(0.2, 'BRL');
      const result = money1.add(money2);
      
      expect(result.toNumber()).toBe(0.3);
    });
  });
});
