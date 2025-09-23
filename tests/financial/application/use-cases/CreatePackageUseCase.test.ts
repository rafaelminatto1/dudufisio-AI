import { CreatePackageUseCase } from '../../../../lib/financial/application/use-cases/CreatePackageUseCase';
import { BillingService } from '../../../../lib/financial/application/services/BillingService';
import { PaymentService } from '../../../../lib/financial/application/services/PaymentService';
import { PackageType } from '../../../../lib/financial/domain/entities/Package';
import { PaymentMethod, PaymentMethodType } from '../../../../lib/financial/domain/value-objects/PaymentMethod';
import { Money } from '../../../../lib/financial/domain/value-objects/Money';
import { TransactionStatus } from '../../../../lib/financial/domain/entities/Transaction';
import { IFinancialRepository } from '../../../../lib/financial/domain/repositories/IFinancialRepository';

// Mock dependencies
const mockRepository: jest.Mocked<IFinancialRepository> = {
  findActivePackagesByPatient: jest.fn(),
  findTransactionsByPatient: jest.fn(),
  withTransaction: jest.fn(),
  // Add other required methods as empty mocks
  saveTransaction: jest.fn(),
  findTransactionById: jest.fn(),
  findTransactions: jest.fn(),
  updateTransaction: jest.fn(),
  deleteTransaction: jest.fn(),
  savePackage: jest.fn(),
  findPackageById: jest.fn(),
  findPackagesByPatient: jest.fn(),
  findExpiringPackages: jest.fn(),
  updatePackage: jest.fn(),
  deletePackage: jest.fn(),
  saveInvoice: jest.fn(),
  findInvoiceById: jest.fn(),
  findInvoicesByPatient: jest.fn(),
  findOverdueInvoices: jest.fn(),
  updateInvoice: jest.fn(),
  deleteInvoice: jest.fn(),
  generateInvoiceNumber: jest.fn(),
  savePaymentPlan: jest.fn(),
  findPaymentPlanById: jest.fn(),
  findPaymentPlansByPatient: jest.fn(),
  findOverduePaymentPlans: jest.fn(),
  updatePaymentPlan: jest.fn(),
  deletePaymentPlan: jest.fn(),
  getTotalRevenue: jest.fn(),
  getRevenueByPeriod: jest.fn(),
  getTopPatientsByRevenue: jest.fn(),
  getPaymentMethodStats: jest.fn(),
  getOverdueStats: jest.fn(),
  query: jest.fn()
};

const mockBillingService: jest.Mocked<BillingService> = {
  calculatePackagePricing: jest.fn(),
  generateInvoiceForPackage: jest.fn(),
  createPaymentPlan: jest.fn(),
  processRecurringBilling: jest.fn(),
  calculateRefundAmount: jest.fn(),
  issueInvoice: jest.fn(),
  markInvoiceAsOverdue: jest.fn()
} as any;

const mockPaymentService: jest.Mocked<PaymentService> = {
  processPayment: jest.fn(),
  processRefund: jest.fn(),
  getPaymentStatus: jest.fn(),
  syncPaymentStatus: jest.fn(),
  setupRecurringPayment: jest.fn(),
  processInstallmentPayment: jest.fn()
} as any;

describe('CreatePackageUseCase', () => {
  let useCase: CreatePackageUseCase;
  let mockTransaction: any;

  beforeEach(() => {
    useCase = new CreatePackageUseCase(mockRepository, mockBillingService, mockPaymentService);
    
    // Setup mock transaction
    mockTransaction = {
      saveTransaction: jest.fn(),
      savePackage: jest.fn(),
      saveInstallments: jest.fn(),
      commit: jest.fn(),
      rollback: jest.fn()
    };
    
    jest.clearAllMocks();
  });

  const validCommand = {
    patientId: 'patient-123',
    packageType: PackageType.SESSIONS_10,
    paymentMethod: PaymentMethod.creditCard('visa', '1234', 12, 2025, 'John Doe'),
    createdBy: 'user-123'
  };

  describe('Successful Package Creation', () => {
    beforeEach(() => {
      // Mock successful pricing calculation
      mockBillingService.calculatePackagePricing.mockResolvedValue({
        basePrice: new Money(800, 'BRL'),
        discount: new Money(0, 'BRL'),
        taxes: new Money(40, 'BRL'),
        totalAmount: new Money(840, 'BRL'),
        sessionValue: new Money(84, 'BRL')
      });

      // Mock successful payment processing
      mockPaymentService.processPayment.mockResolvedValue({
        success: true,
        transactionId: 'gateway-123',
        status: TransactionStatus.PAID
      });

      // Mock no existing packages or overdue transactions
      mockRepository.findActivePackagesByPatient.mockResolvedValue([]);
      mockRepository.findTransactionsByPatient.mockResolvedValue([]);

      // Mock transaction wrapper
      mockRepository.withTransaction.mockImplementation(async (callback) => {
        return await callback(mockTransaction);
      });
    });

    it('should create package successfully with credit card payment', async () => {
      const result = await useCase.execute(validCommand);

      expect(result.success).toBe(true);
      expect(result.package).toBeDefined();
      expect(result.transaction).toBeDefined();
      expect(result.paymentResult?.success).toBe(true);

      // Verify pricing calculation was called
      expect(mockBillingService.calculatePackagePricing).toHaveBeenCalledWith(
        PackageType.SESSIONS_10,
        'patient-123'
      );

      // Verify payment processing was called
      expect(mockPaymentService.processPayment).toHaveBeenCalled();

      // Verify database operations
      expect(mockTransaction.saveTransaction).toHaveBeenCalled();
      expect(mockTransaction.savePackage).toHaveBeenCalled();
      expect(mockTransaction.commit).toHaveBeenCalled();
    });

    it('should create package successfully with cash payment', async () => {
      const cashCommand = {
        ...validCommand,
        paymentMethod: PaymentMethod.cash()
      };

      const result = await useCase.execute(cashCommand);

      expect(result.success).toBe(true);
      
      // Payment service should not be called for cash payments
      expect(mockPaymentService.processPayment).not.toHaveBeenCalled();
      
      // Transaction should be marked as paid immediately
      expect(mockTransaction.saveTransaction).toHaveBeenCalled();
    });

    it('should create package with installments', async () => {
      const installmentCommand = {
        ...validCommand,
        installments: 3
      };

      const result = await useCase.execute(installmentCommand);

      expect(result.success).toBe(true);
      
      // Should create additional installment transactions
      expect(mockTransaction.saveInstallments).toHaveBeenCalled();
      
      const installmentTransactions = mockTransaction.saveInstallments.mock.calls[0][0];
      expect(installmentTransactions).toHaveLength(2); // 3 total - 1 original = 2 additional
    });

    it('should apply custom pricing when provided', async () => {
      const customCommand = {
        ...validCommand,
        customPrice: new Money(1000, 'BRL'),
        discountAmount: new Money(100, 'BRL')
      };

      const result = await useCase.execute(customCommand);

      expect(result.success).toBe(true);
      
      // Should not call billing service for standard pricing
      expect(mockBillingService.calculatePackagePricing).not.toHaveBeenCalled();
    });
  });

  describe('Validation Errors', () => {
    it('should reject command with missing patient ID', async () => {
      const invalidCommand = { ...validCommand, patientId: '' };

      const result = await useCase.execute(invalidCommand);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Patient ID is required');
    });

    it('should reject command with missing package type', async () => {
      const invalidCommand = { ...validCommand, packageType: undefined as any };

      const result = await useCase.execute(invalidCommand);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Package type is required');
    });

    it('should reject command with invalid installments for payment method', async () => {
      const invalidCommand = {
        ...validCommand,
        paymentMethod: PaymentMethod.pix(), // PIX doesn't support installments
        installments: 3
      };

      const result = await useCase.execute(invalidCommand);

      expect(result.success).toBe(false);
      expect(result.error).toContain('does not support installments');
    });

    it('should reject command with too many installments', async () => {
      const invalidCommand = {
        ...validCommand,
        installments: 15
      };

      const result = await useCase.execute(invalidCommand);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Maximum 12 installments allowed');
    });
  });

  describe('Business Rule Validation', () => {
    it('should reject when patient has active package with remaining sessions', async () => {
      const activePackage = {
        hasRemainingSessions: () => true,
        getRemainingSessions: () => 5
      };

      mockRepository.findActivePackagesByPatient.mockResolvedValue([activePackage as any]);

      const result = await useCase.execute(validCommand);

      expect(result.success).toBe(false);
      expect(result.error).toContain('already has an active package');
    });

    it('should reject when patient has overdue payments', async () => {
      const overdueTransaction = {
        getAmount: () => new Money(200, 'BRL')
      };

      mockRepository.findActivePackagesByPatient.mockResolvedValue([]);
      mockRepository.findTransactionsByPatient.mockResolvedValue([overdueTransaction as any]);

      const result = await useCase.execute(validCommand);

      expect(result.success).toBe(false);
      expect(result.error).toContain('overdue payments');
    });

    it('should allow package creation when active package has no remaining sessions', async () => {
      const expiredPackage = {
        hasRemainingSessions: () => false,
        getRemainingSessions: () => 0
      };

      mockRepository.findActivePackagesByPatient.mockResolvedValue([expiredPackage as any]);
      mockRepository.findTransactionsByPatient.mockResolvedValue([]);
      
      // Setup successful mocks
      mockBillingService.calculatePackagePricing.mockResolvedValue({
        basePrice: new Money(800, 'BRL'),
        discount: new Money(0, 'BRL'),
        taxes: new Money(40, 'BRL'),
        totalAmount: new Money(840, 'BRL'),
        sessionValue: new Money(84, 'BRL')
      });

      mockPaymentService.processPayment.mockResolvedValue({
        success: true,
        transactionId: 'gateway-123',
        status: TransactionStatus.PAID
      });

      mockRepository.withTransaction.mockImplementation(async (callback) => {
        return await callback(mockTransaction);
      });

      const result = await useCase.execute(validCommand);

      expect(result.success).toBe(true);
    });
  });

  describe('Payment Processing Failures', () => {
    beforeEach(() => {
      mockRepository.findActivePackagesByPatient.mockResolvedValue([]);
      mockRepository.findTransactionsByPatient.mockResolvedValue([]);
      
      mockBillingService.calculatePackagePricing.mockResolvedValue({
        basePrice: new Money(800, 'BRL'),
        discount: new Money(0, 'BRL'),
        taxes: new Money(40, 'BRL'),
        totalAmount: new Money(840, 'BRL'),
        sessionValue: new Money(84, 'BRL')
      });
    });

    it('should handle payment processing failure', async () => {
      mockPaymentService.processPayment.mockResolvedValue({
        success: false,
        status: TransactionStatus.PENDING,
        error: 'Insufficient funds',
        errorCode: 'INSUFFICIENT_FUNDS'
      });

      const result = await useCase.execute(validCommand);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Insufficient funds');
      expect(result.errorCode).toBe('INSUFFICIENT_FUNDS');

      // Should not save to database when payment fails
      expect(mockTransaction.saveTransaction).not.toHaveBeenCalled();
      expect(mockTransaction.savePackage).not.toHaveBeenCalled();
    });

    it('should handle payment service exceptions', async () => {
      mockPaymentService.processPayment.mockRejectedValue(
        new Error('Payment gateway timeout')
      );

      const result = await useCase.execute(validCommand);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Internal error occurred');
    });
  });

  describe('Database Transaction Handling', () => {
    beforeEach(() => {
      mockRepository.findActivePackagesByPatient.mockResolvedValue([]);
      mockRepository.findTransactionsByPatient.mockResolvedValue([]);
      
      mockBillingService.calculatePackagePricing.mockResolvedValue({
        basePrice: new Money(800, 'BRL'),
        discount: new Money(0, 'BRL'),
        taxes: new Money(40, 'BRL'),
        totalAmount: new Money(840, 'BRL'),
        sessionValue: new Money(84, 'BRL')
      });

      mockPaymentService.processPayment.mockResolvedValue({
        success: true,
        transactionId: 'gateway-123',
        status: TransactionStatus.PAID
      });
    });

    it('should rollback transaction on database error', async () => {
      mockTransaction.saveTransaction.mockRejectedValue(new Error('Database error'));
      
      mockRepository.withTransaction.mockImplementation(async (callback) => {
        try {
          return await callback(mockTransaction);
        } catch (error) {
          await mockTransaction.rollback();
          throw error;
        }
      });

      const result = await useCase.execute(validCommand);

      expect(result.success).toBe(false);
      expect(mockTransaction.rollback).toHaveBeenCalled();
    });

    it('should commit transaction on success', async () => {
      mockRepository.withTransaction.mockImplementation(async (callback) => {
        return await callback(mockTransaction);
      });

      const result = await useCase.execute(validCommand);

      expect(result.success).toBe(true);
      expect(mockTransaction.commit).toHaveBeenCalled();
    });
  });

  describe('Package Expiry Calculation', () => {
    it('should set correct expiry date for session packages', async () => {
      mockRepository.findActivePackagesByPatient.mockResolvedValue([]);
      mockRepository.findTransactionsByPatient.mockResolvedValue([]);
      
      mockBillingService.calculatePackagePricing.mockResolvedValue({
        basePrice: new Money(800, 'BRL'),
        discount: new Money(0, 'BRL'),
        taxes: new Money(40, 'BRL'),
        totalAmount: new Money(840, 'BRL'),
        sessionValue: new Money(84, 'BRL')
      });

      mockPaymentService.processPayment.mockResolvedValue({
        success: true,
        transactionId: 'gateway-123',
        status: TransactionStatus.PAID
      });

      mockRepository.withTransaction.mockImplementation(async (callback) => {
        return await callback(mockTransaction);
      });

      const result = await useCase.execute(validCommand);

      expect(result.success).toBe(true);
      expect(result.package).toBeDefined();

      // Session packages should expire in 6 months
      const sixMonthsFromNow = new Date();
      sixMonthsFromNow.setMonth(sixMonthsFromNow.getMonth() + 6);
      
      const packageExpiryDate = result.package!.getExpiryDate();
      expect(packageExpiryDate.getMonth()).toBe(sixMonthsFromNow.getMonth());
    });

    it('should set correct expiry date for monthly unlimited packages', async () => {
      const monthlyCommand = {
        ...validCommand,
        packageType: PackageType.MONTHLY_UNLIMITED
      };

      mockRepository.findActivePackagesByPatient.mockResolvedValue([]);
      mockRepository.findTransactionsByPatient.mockResolvedValue([]);
      
      mockBillingService.calculatePackagePricing.mockResolvedValue({
        basePrice: new Money(1200, 'BRL'),
        discount: new Money(0, 'BRL'),
        taxes: new Money(60, 'BRL'),
        totalAmount: new Money(1260, 'BRL'),
        sessionValue: new Money(42, 'BRL')
      });

      mockPaymentService.processPayment.mockResolvedValue({
        success: true,
        transactionId: 'gateway-123',
        status: TransactionStatus.PAID
      });

      mockRepository.withTransaction.mockImplementation(async (callback) => {
        return await callback(mockTransaction);
      });

      const result = await useCase.execute(monthlyCommand);

      expect(result.success).toBe(true);
      
      // Monthly packages should expire in 1 month
      const oneMonthFromNow = new Date();
      oneMonthFromNow.setMonth(oneMonthFromNow.getMonth() + 1);
      
      const packageExpiryDate = result.package!.getExpiryDate();
      expect(packageExpiryDate.getMonth()).toBe(oneMonthFromNow.getMonth());
    });
  });
});