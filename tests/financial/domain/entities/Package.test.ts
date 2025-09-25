import { Package, PackageType, PackageStatus, SessionCount } from '../../../../lib/financial/domain/entities/Package';
import { Money } from '../../../../lib/financial/domain/value-objects/Money';
import { DomainError, BusinessRuleError } from '../../../../lib/financial/domain/errors/DomainError';

describe('Package Entity', () => {
  const validPackageData = {
    patientId: 'patient-123',
    transactionId: 'transaction-123',
    type: PackageType.SESSIONS_10,
    totalSessions: 10,
    price: new Money(800, 'BRL'),
    purchaseDate: new Date('2024-01-01'),
    expiryDate: new Date('2024-07-01')
  };

  describe('SessionCount Value Object', () => {
    it('should create session count with valid number', () => {
      const count = SessionCount.create(10);
      expect(count.toNumber()).toBe(10);
      expect(count.isZero()).toBe(false);
    });

    it('should create zero session count', () => {
      const zero = SessionCount.zero();
      expect(zero.toNumber()).toBe(0);
      expect(zero.isZero()).toBe(true);
    });

    it('should throw error for negative session count', () => {
      expect(() => SessionCount.create(-1)).toThrow(DomainError);
    });

    it('should decrement session count', () => {
      const count = SessionCount.create(5);
      const decremented = count.decrement();
      expect(decremented.toNumber()).toBe(4);
    });

    it('should throw error when decrementing zero', () => {
      const zero = SessionCount.zero();
      expect(() => zero.decrement()).toThrow(DomainError);
    });

    it('should add session counts', () => {
      const count1 = SessionCount.create(5);
      const count2 = SessionCount.create(3);
      const result = count1.add(count2);
      expect(result.toNumber()).toBe(8);
    });

    it('should check equality', () => {
      const count1 = SessionCount.create(5);
      const count2 = SessionCount.create(5);
      const count3 = SessionCount.create(3);
      
      expect(count1.equals(count2)).toBe(true);
      expect(count1.equals(count3)).toBe(false);
    });
  });

  describe('Package Creation', () => {
    it('should create package with valid data', () => {
      const package = Package.create(validPackageData);
      
      expect(package.getPatientId()).toBe('patient-123');
      expect(package.getTransactionId()).toBe('transaction-123');
      expect(package.getType()).toBe(PackageType.SESSIONS_10);
      expect(package.getTotalSessions()).toBe(10);
      expect(package.getUsedSessions()).toBe(0);
      expect(package.getRemainingSessions()).toBe(10);
      expect(package.getStatus()).toBe(PackageStatus.ACTIVE);
    });

    it('should create package with used sessions', () => {
      const packageData = {
        ...validPackageData,
        usedSessions: 3
      };
      
      const package = Package.create(packageData);
      
      expect(package.getUsedSessions()).toBe(3);
      expect(package.getRemainingSessions()).toBe(7);
    });

    it('should generate unique ID if not provided', () => {
      const package1 = Package.create(validPackageData);
      const package2 = Package.create(validPackageData);
      
      expect(package1.getId()).not.toBe(package2.getId());
    });
  });

  describe('Validation', () => {
    it('should throw error for missing patient ID', () => {
      const invalidData = { ...validPackageData, patientId: '' };
      expect(() => Package.create(invalidData)).toThrow(DomainError);
    });

    it('should throw error for missing transaction ID', () => {
      const invalidData = { ...validPackageData, transactionId: '' };
      expect(() => Package.create(invalidData)).toThrow(DomainError);
    });

    it('should throw error for zero total sessions', () => {
      const invalidData = { ...validPackageData, totalSessions: 0 };
      expect(() => Package.create(invalidData)).toThrow(DomainError);
    });

    it('should throw error for negative total sessions', () => {
      const invalidData = { ...validPackageData, totalSessions: -1 };
      expect(() => Package.create(invalidData)).toThrow(DomainError);
    });

    it('should throw error when used sessions exceed total', () => {
      const invalidData = { ...validPackageData, usedSessions: 15 };
      expect(() => Package.create(invalidData)).toThrow(DomainError);
    });

    it('should throw error when expiry date is before purchase date', () => {
      const invalidData = {
        ...validPackageData,
        purchaseDate: new Date('2024-07-01'),
        expiryDate: new Date('2024-01-01')
      };
      expect(() => Package.create(invalidData)).toThrow(DomainError);
    });

    it('should throw error for zero price', () => {
      const invalidData = { ...validPackageData, price: Money.zero() };
      expect(() => Package.create(invalidData)).toThrow(DomainError);
    });
  });

  describe('Session Consumption', () => {
    let package: Package;

    beforeEach(() => {
      package = Package.create(validPackageData);
    });

    it('should consume session when conditions are met', () => {
      expect(package.canConsumeSession()).toBe(true);
      
      package.consumeSession();
      
      expect(package.getUsedSessions()).toBe(1);
      expect(package.getRemainingSessions()).toBe(9);
    });

    it('should throw error when no sessions remaining', () => {
      // Consume all sessions
      for (let i = 0; i < 10; i++) {
        package.consumeSession();
      }
      
      expect(package.hasRemainingSessions()).toBe(false);
      expect(() => package.consumeSession()).toThrow(BusinessRuleError);
    });

    it('should throw error when package is expired', () => {
      package.expire();
      
      expect(() => package.consumeSession()).toThrow(BusinessRuleError);
    });

    it('should auto-expire package when all sessions consumed', () => {
      // Consume all sessions
      for (let i = 0; i < 10; i++) {
        package.consumeSession();
      }
      
      expect(package.getStatus()).toBe(PackageStatus.EXPIRED);
    });
  });

  describe('Status Management', () => {
    let package: Package;

    beforeEach(() => {
      package = Package.create(validPackageData);
    });

    it('should expire active package', () => {
      expect(package.isActive()).toBe(true);
      
      package.expire();
      
      expect(package.getStatus()).toBe(PackageStatus.EXPIRED);
      expect(package.isExpired()).toBe(true);
    });

    it('should cancel active package', () => {
      const reason = 'Patient request';
      
      package.cancel(reason);
      
      expect(package.getStatus()).toBe(PackageStatus.CANCELLED);
      expect(package.isCancelled()).toBe(true);
    });

    it('should suspend active package', () => {
      const reason = 'Payment issue';
      
      package.suspend(reason);
      
      expect(package.getStatus()).toBe(PackageStatus.SUSPENDED);
      expect(package.isSuspended()).toBe(true);
    });

    it('should reactivate suspended package', () => {
      package.suspend();
      
      package.reactivate();
      
      expect(package.getStatus()).toBe(PackageStatus.ACTIVE);
      expect(package.isActive()).toBe(true);
    });

    it('should not allow reactivation of expired package', () => {
      // Create package with past expiry date
      const expiredPackage = Package.create({
        ...validPackageData,
        expiryDate: new Date('2023-01-01')
      });
      
      expiredPackage.suspend();
      
      expect(() => expiredPackage.reactivate()).toThrow(BusinessRuleError);
    });

    it('should not allow cancellation of expired package', () => {
      package.expire();
      
      expect(() => package.cancel()).toThrow(BusinessRuleError);
    });
  });

  describe('Financial Calculations', () => {
    let package: Package;

    beforeEach(() => {
      package = Package.create(validPackageData);
    });

    it('should calculate session value correctly', () => {
      const sessionValue = package.getSessionValue();
      expect(sessionValue.equals(new Money(80, 'BRL'))).toBe(true); // 800 / 10
    });

    it('should calculate remaining value correctly', () => {
      package.consumeSession(); // Use 1 session
      
      const remainingValue = package.getRemainingValue();
      expect(remainingValue.equals(new Money(720, 'BRL'))).toBe(true); // 80 * 9
    });

    it('should return zero remaining value when all sessions used', () => {
      // Use all sessions
      for (let i = 0; i < 10; i++) {
        package.consumeSession();
      }
      
      const remainingValue = package.getRemainingValue();
      expect(remainingValue.equals(Money.zero('BRL'))).toBe(true);
    });

    it('should calculate usage percentage correctly', () => {
      expect(package.getUsagePercentage()).toBe(0);
      
      package.consumeSession();
      expect(package.getUsagePercentage()).toBe(10);
      
      // Use 5 more sessions (6 total)
      for (let i = 0; i < 5; i++) {
        package.consumeSession();
      }
      expect(package.getUsagePercentage()).toBe(60);
    });
  });

  describe('Date Calculations', () => {
    let package: Package;

    beforeEach(() => {
      // Create package with known dates for testing
      const purchaseDate = new Date('2024-01-01');
      const expiryDate = new Date('2024-07-01');
      
      package = Package.create({
        ...validPackageData,
        purchaseDate,
        expiryDate
      });
    });

    it('should calculate days since purchase correctly', () => {
      // Mock current date
      const originalNow = Date.now;
      Date.now = jest.fn(() => new Date('2024-01-15').getTime());
      
      expect(package.getDaysSincePurchase()).toBe(14);
      
      Date.now = originalNow;
    });

    it('should calculate days until expiry correctly', () => {
      // Mock current date
      const originalNow = Date.now;
      Date.now = jest.fn(() => new Date('2024-06-15').getTime());
      
      expect(package.getDaysUntilExpiry()).toBe(16);
      
      Date.now = originalNow;
    });

    it('should return 0 days until expiry when expired', () => {
      // Mock current date to after expiry
      const originalNow = Date.now;
      Date.now = jest.fn(() => new Date('2024-08-01').getTime());
      
      expect(package.getDaysUntilExpiry()).toBe(0);
      
      Date.now = originalNow;
    });

    it('should detect expiry based on current date', () => {
      // Mock current date to after expiry
      const originalNow = Date.now;
      Date.now = jest.fn(() => new Date('2024-08-01').getTime());
      
      expect(package.isExpired()).toBe(true);
      
      Date.now = originalNow;
    });
  });

  describe('Display Methods', () => {
    it('should return correct display names for package types', () => {
      const package10 = Package.create({ ...validPackageData, type: PackageType.SESSIONS_10 });
      expect(package10.getTypeDisplayName()).toBe('10 Sessões');
      
      const package20 = Package.create({ ...validPackageData, type: PackageType.SESSIONS_20 });
      expect(package20.getTypeDisplayName()).toBe('20 Sessões');
      
      const unlimited = Package.create({ ...validPackageData, type: PackageType.MONTHLY_UNLIMITED });
      expect(unlimited.getTypeDisplayName()).toBe('Ilimitado Mensal');
      
      const evaluation = Package.create({ ...validPackageData, type: PackageType.EVALUATION_ONLY });
      expect(evaluation.getTypeDisplayName()).toBe('Apenas Avaliação');
    });
  });

  describe('Serialization', () => {
    it('should serialize to JSON correctly', () => {
      const package = Package.create(validPackageData);
      const json = package.toJSON();
      
      expect(json).toMatchObject({
        id: expect.any(String),
        patientId: 'patient-123',
        transactionId: 'transaction-123',
        type: PackageType.SESSIONS_10,
        typeDisplayName: '10 Sessões',
        totalSessions: 10,
        usedSessions: 0,
        remainingSessions: 10,
        price: { amount: 800, currency: 'BRL' },
        status: PackageStatus.ACTIVE,
        usagePercentage: 0
      });
      
      expect(json.purchaseDate).toMatch(/^\d{4}-\d{2}-\d{2}T/);
      expect(json.expiryDate).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    });
  });
});
