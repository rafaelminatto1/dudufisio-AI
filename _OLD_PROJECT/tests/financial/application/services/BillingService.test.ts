import { BillingService } from '../../../../lib/financial/application/services/BillingService';
import { PackageType } from '../../../../lib/financial/domain/entities/Package';
import { Money } from '../../../../lib/financial/domain/value-objects/Money';
import { IFinancialRepository } from '../../../../lib/financial/domain/repositories/IFinancialRepository';

// Mock repository
const mockRepository: jest.Mocked<IFinancialRepository> = {
  findPackagesByPatient: jest.fn(),
  findTransactionsByPatient: jest.fn(),
  saveInvoice: jest.fn(),
  generateInvoiceNumber: jest.fn(),
  // Add other required methods as empty mocks
  saveTransaction: jest.fn(),
  findTransactionById: jest.fn(),
  findTransactions: jest.fn(),
  updateTransaction: jest.fn(),
  deleteTransaction: jest.fn(),
  savePackage: jest.fn(),
  findPackageById: jest.fn(),
  findActivePackagesByPatient: jest.fn(),
  findExpiringPackages: jest.fn(),
  updatePackage: jest.fn(),
  deletePackage: jest.fn(),
  findInvoiceById: jest.fn(),
  findInvoicesByPatient: jest.fn(),
  findOverdueInvoices: jest.fn(),
  updateInvoice: jest.fn(),
  deleteInvoice: jest.fn(),
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
  withTransaction: jest.fn(),
  query: jest.fn()
};

describe('BillingService', () => {
  let billingService: BillingService;

  beforeEach(() => {
    billingService = new BillingService(mockRepository);
    jest.clearAllMocks();
  });

  describe('Package Pricing Calculation', () => {
    it('should calculate pricing for 10-session package', async () => {
      // Mock no existing packages (new patient)
      mockRepository.findPackagesByPatient.mockResolvedValue([]);

      const pricing = await billingService.calculatePackagePricing(
        PackageType.SESSIONS_10,
        'patient-123'
      );

      expect(pricing.basePrice.equals(new Money(800, 'BRL'))).toBe(true);
      expect(pricing.sessionValue.toNumber()).toBeGreaterThan(0);
      expect(pricing.totalAmount.toNumber()).toBeGreaterThan(pricing.basePrice.toNumber());
    });

    it('should calculate pricing for 20-session package', async () => {
      mockRepository.findPackagesByPatient.mockResolvedValue([]);

      const pricing = await billingService.calculatePackagePricing(
        PackageType.SESSIONS_20,
        'patient-123'
      );

      expect(pricing.basePrice.equals(new Money(1500, 'BRL'))).toBe(true);
      // Should have 15% discount for 20-session packages
      expect(pricing.discount.toNumber()).toBeGreaterThan(0);
    });

    it('should apply returning patient discount', async () => {
      // Mock existing packages (returning patient)
      const existingPackages = [
        { id: 'pkg-1', type: PackageType.SESSIONS_10 }
      ];
      mockRepository.findPackagesByPatient.mockResolvedValue(existingPackages as any);

      const pricing = await billingService.calculatePackagePricing(
        PackageType.SESSIONS_10,
        'patient-123'
      );

      // Should have 5% returning patient discount
      expect(pricing.discount.toNumber()).toBeGreaterThan(0);
    });

    it('should apply multiple discounts correctly', async () => {
      // Mock patient with multiple packages (returning + bulk discount)
      const existingPackages = [
        { id: 'pkg-1', type: PackageType.SESSIONS_10 },
        { id: 'pkg-2', type: PackageType.SESSIONS_10 },
        { id: 'pkg-3', type: PackageType.SESSIONS_10 }
      ];
      mockRepository.findPackagesByPatient.mockResolvedValue(existingPackages as any);

      const pricing = await billingService.calculatePackagePricing(
        PackageType.SESSIONS_20, // 15% discount
        'patient-123'
      );

      // Should have returning patient (5%) + bulk (10%) + 20-session (15%) discounts
      // But capped at 50%
      expect(pricing.discount.toNumber()).toBeGreaterThan(0);
      const discountPercentage = pricing.discount.toNumber() / pricing.basePrice.toNumber();
      expect(discountPercentage).toBeLessThanOrEqual(0.5); // Max 50% discount
    });

    it('should calculate taxes correctly', async () => {
      mockRepository.findPackagesByPatient.mockResolvedValue([]);

      const pricing = await billingService.calculatePackagePricing(
        PackageType.SESSIONS_10,
        'patient-123'
      );

      // Should have ISS (2%) + COFINS (3%) + PIS (0.65%) = 5.65% total tax
      const expectedTaxRate = 0.02 + 0.03 + 0.0065;
      const discountedPrice = pricing.basePrice.subtract(pricing.discount);
      const expectedTax = discountedPrice.multiply(expectedTaxRate);
      
      expect(pricing.taxes.toNumber()).toBeCloseTo(expectedTax.toNumber(), 2);
    });
  });

  describe('Invoice Generation', () => {
    it('should generate invoice for package', async () => {
      const mockPackage = {
        getId: () => 'package-123',
        getPatientId: () => 'patient-123',
        getTransactionId: () => 'transaction-123',
        getTypeDisplayName: () => '10 Sessões',
        getTotalSessions: () => 10,
        getPrice: () => new Money(800, 'BRL')
      };

      mockRepository.generateInvoiceNumber.mockResolvedValue('2024000001');

      const invoice = await billingService.generateInvoiceForPackage(
        mockPackage as any,
        'patient-123',
        'user-123'
      );

      expect(mockRepository.saveInvoice).toHaveBeenCalledWith(invoice);
      expect(invoice.getPatientId()).toBe('patient-123');
      expect(invoice.getLineItems()).toHaveLength(1);
      expect(invoice.getLineItems()[0].description).toContain('10 Sessões');
    });

    it('should generate invoice with custom due date', async () => {
      const mockPackage = {
        getId: () => 'package-123',
        getPatientId: () => 'patient-123',
        getTransactionId: () => 'transaction-123',
        getTypeDisplayName: () => '10 Sessões',
        getTotalSessions: () => 10,
        getPrice: () => new Money(800, 'BRL')
      };

      const customDueDate = new Date('2024-12-31');
      mockRepository.generateInvoiceNumber.mockResolvedValue('2024000001');

      const invoice = await billingService.generateInvoiceForPackage(
        mockPackage as any,
        'patient-123',
        'user-123',
        customDueDate
      );

      expect(invoice.getDueDate()).toEqual(customDueDate);
    });
  });

  describe('Payment Plan Creation', () => {
    it('should create payment plan with correct installments', async () => {
      const totalAmount = new Money(1200, 'BRL');
      const installmentCount = 3;
      const paymentMethod = { supportsInstallments: () => true } as any;

      const paymentPlan = await billingService.createPaymentPlan(
        totalAmount,
        installmentCount,
        'patient-123',
        paymentMethod,
        'user-123',
        'Test payment plan'
      );

      expect(mockRepository.savePaymentPlan).toHaveBeenCalledWith(paymentPlan);
      expect(paymentPlan.getInstallmentCount()).toBe(3);
      expect(paymentPlan.getTotalAmount().equals(totalAmount)).toBe(true);
    });

    it('should create payment plan with interest rate', async () => {
      const totalAmount = new Money(1000, 'BRL');
      const paymentMethod = { supportsInstallments: () => true } as any;

      const paymentPlan = await billingService.createPaymentPlan(
        totalAmount,
        6,
        'patient-123',
        paymentMethod,
        'user-123',
        'Test payment plan',
        0.03 // 3% monthly interest
      );

      expect(paymentPlan.getInterestRate()).toBe(0.03);
      // Total with interest should be higher than original amount
      expect(paymentPlan.getTotalWithInterest().isGreaterThan(totalAmount)).toBe(true);
    });
  });

  describe('Recurring Billing', () => {
    it('should process overdue payment plans', async () => {
      const mockPaymentPlan = {
        getId: () => 'plan-123',
        getPatientId: () => 'patient-123',
        getPaymentMethod: () => ({ type: 'credit_card' }),
        getInstallmentCount: () => 3,
        getDescription: () => 'Test Plan',
        getOverdueInstallments: () => [
          {
            id: 'inst-1',
            installmentNumber: 1,
            amount: new Money(400, 'BRL'),
            dueDate: new Date('2024-01-01'),
            status: 'pending'
          }
        ],
        markInstallmentOverdue: jest.fn(),
        calculatePenalty: jest.fn().mockReturnValue(new Money(20, 'BRL'))
      };

      mockRepository.findOverduePaymentPlans.mockResolvedValue([mockPaymentPlan as any]);

      await billingService.processRecurringBilling();

      expect(mockPaymentPlan.markInstallmentOverdue).toHaveBeenCalledWith('inst-1');
      expect(mockRepository.updatePaymentPlan).toHaveBeenCalledWith(mockPaymentPlan);
      expect(mockRepository.saveTransaction).toHaveBeenCalled();
    });
  });

  describe('Refund Calculation', () => {
    it('should calculate refund amount based on remaining sessions', async () => {
      const mockPackage = {
        getId: () => 'package-123',
        isActive: () => true,
        getRemainingValue: () => new Money(400, 'BRL') // 50% remaining
      };

      mockRepository.findPackageById.mockResolvedValue(mockPackage as any);

      const refundAmount = await billingService.calculateRefundAmount('package-123', new Date());

      // Should be remaining value minus 10% retention fee
      const expectedRefund = new Money(360, 'BRL'); // 400 - (400 * 0.1)
      expect(refundAmount.equals(expectedRefund)).toBe(true);
    });

    it('should throw error for inactive package refund', async () => {
      const mockPackage = {
        getId: () => 'package-123',
        isActive: () => false
      };

      mockRepository.findPackageById.mockResolvedValue(mockPackage as any);

      await expect(
        billingService.calculateRefundAmount('package-123', new Date())
      ).rejects.toThrow('Cannot calculate refund for inactive package');
    });
  });

  describe('Invoice Issuing', () => {
    it('should issue draft invoice', async () => {
      const mockInvoice = {
        getId: () => 'invoice-123',
        getStatus: () => 'draft',
        canBeIssued: () => true,
        issue: jest.fn()
      };

      mockRepository.findInvoiceById.mockResolvedValue(mockInvoice as any);
      mockRepository.generateInvoiceNumber.mockResolvedValue('2024000001');

      const issuedInvoice = await billingService.issueInvoice('invoice-123');

      expect(mockInvoice.issue).toHaveBeenCalledWith('2024000001');
      expect(mockRepository.updateInvoice).toHaveBeenCalledWith(mockInvoice);
    });

    it('should throw error when trying to issue non-draft invoice', async () => {
      const mockInvoice = {
        getId: () => 'invoice-123',
        getStatus: () => 'issued',
        canBeIssued: () => false
      };

      mockRepository.findInvoiceById.mockResolvedValue(mockInvoice as any);

      await expect(
        billingService.issueInvoice('invoice-123')
      ).rejects.toThrow('Cannot issue invoice with status: issued');
    });
  });

  describe('Overdue Processing', () => {
    it('should mark overdue invoices', async () => {
      const mockInvoice = {
        getId: () => 'invoice-123',
        canBePaid: () => true,
        getDaysOverdue: () => 5,
        markAsOverdue: jest.fn()
      };

      mockRepository.findOverdueInvoices.mockResolvedValue([mockInvoice as any]);

      await billingService.markInvoiceAsOverdue();

      expect(mockInvoice.markAsOverdue).toHaveBeenCalled();
      expect(mockRepository.updateInvoice).toHaveBeenCalledWith(mockInvoice);
    });

    it('should not mark invoices that are not overdue', async () => {
      const mockInvoice = {
        getId: () => 'invoice-123',
        canBePaid: () => true,
        getDaysOverdue: () => 0, // Not overdue yet
        markAsOverdue: jest.fn()
      };

      mockRepository.findOverdueInvoices.mockResolvedValue([mockInvoice as any]);

      await billingService.markInvoiceAsOverdue();

      expect(mockInvoice.markAsOverdue).not.toHaveBeenCalled();
    });
  });
});
