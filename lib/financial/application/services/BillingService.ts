import { Money } from '../../domain/value-objects/Money';
import { TaxRate, TaxCalculator } from '../../domain/value-objects/TaxRate';
import { Package, PackageType } from '../../domain/entities/Package';
import { Invoice } from '../../domain/entities/Invoice';
import { PaymentPlan } from '../../domain/entities/PaymentPlan';
import { Transaction, TransactionType, PatientId, UserId } from '../../domain/entities/Transaction';
import { IFinancialRepository } from '../../domain/repositories/IFinancialRepository';
import { BusinessRuleError, DomainError } from '../../domain/errors/DomainError';

export interface PackagePricing {
  basePrice: Money;
  discount: Money;
  taxes: Money;
  totalAmount: Money;
  sessionValue: Money;
}

export interface DiscountRule {
  type: 'percentage' | 'fixed';
  value: number;
  condition?: {
    minPackages?: number;
    packageType?: PackageType;
    isReturningPatient?: boolean;
  };
}

export class BillingService {
  private readonly packagePrices = new Map<PackageType, Money>([
    [PackageType.SESSIONS_10, new Money(800, 'BRL')],
    [PackageType.SESSIONS_20, new Money(1500, 'BRL')],
    [PackageType.MONTHLY_UNLIMITED, new Money(1200, 'BRL')],
    [PackageType.EVALUATION_ONLY, new Money(150, 'BRL')]
  ]);

  private readonly discountRules: DiscountRule[] = [
    {
      type: 'percentage',
      value: 0.1, // 10% discount
      condition: { minPackages: 3 }
    },
    {
      type: 'percentage',
      value: 0.05, // 5% discount for returning patients
      condition: { isReturningPatient: true }
    },
    {
      type: 'percentage',
      value: 0.15, // 15% discount for 20-session packages
      condition: { packageType: PackageType.SESSIONS_20 }
    }
  ];

  private readonly taxRates = [
    TaxRate.iss(0.02), // 2% ISS
    TaxRate.cofins(0.03), // 3% COFINS
    TaxRate.pis(0.0065) // 0.65% PIS
  ];

  constructor(private readonly repository: IFinancialRepository) {}

  async calculatePackagePricing(
    packageType: PackageType,
    patientId: PatientId,
    customDiscounts: DiscountRule[] = []
  ): Promise<PackagePricing> {
    const basePrice = this.getBasePrice(packageType);
    const discount = await this.calculateDiscount(packageType, patientId, customDiscounts);
    const discountedPrice = basePrice.subtract(discount);
    
    const taxCalculator = new TaxCalculator(this.taxRates);
    const taxes = taxCalculator.calculateTotalTax(discountedPrice);
    const totalAmount = discountedPrice.add(taxes);
    
    const sessionCount = this.getSessionCount(packageType);
    const sessionValue = sessionCount > 0 ? totalAmount.divide(sessionCount) : Money.zero();

    return {
      basePrice,
      discount,
      taxes,
      totalAmount,
      sessionValue
    };
  }

  async generateInvoiceForPackage(
    package: Package,
    patientId: PatientId,
    createdBy: UserId,
    dueDate?: Date
  ): Promise<Invoice> {
    const issueDate = new Date();
    const invoiceDueDate = dueDate || this.calculateDefaultDueDate();

    const lineItems = [{
      id: crypto.randomUUID(),
      description: `Pacote ${package.getTypeDisplayName()} - ${package.getTotalSessions()} sessões`,
      quantity: 1,
      unitPrice: package.getPrice(),
      totalPrice: package.getPrice(),
      metadata: {
        packageId: package.getId(),
        packageType: package.getType()
      }
    }];

    const invoice = Invoice.create({
      patientId,
      transactionIds: [package.getTransactionId()],
      issueDate,
      dueDate: invoiceDueDate,
      lineItems,
      taxes: this.taxRates,
      createdBy
    });

    await this.repository.saveInvoice(invoice);
    return invoice;
  }

  async createPaymentPlan(
    totalAmount: Money,
    installmentCount: number,
    patientId: PatientId,
    paymentMethod: any,
    createdBy: UserId,
    description?: string,
    interestRate?: number
  ): Promise<PaymentPlan> {
    const firstDueDate = new Date();
    firstDueDate.setMonth(firstDueDate.getMonth() + 1); // First installment due next month

    const paymentPlan = PaymentPlan.create({
      patientId,
      totalAmount,
      installmentCount,
      paymentMethod,
      firstDueDate,
      description,
      interestRate: interestRate || 0.02, // 2% monthly interest
      penaltyRate: 0.02, // 2% penalty
      createdBy
    });

    await this.repository.savePaymentPlan(paymentPlan);
    return paymentPlan;
  }

  async processRecurringBilling(): Promise<void> {
    // Find all active payment plans with due installments
    const overduePaymentPlans = await this.repository.findOverduePaymentPlans();
    
    for (const paymentPlan of overduePaymentPlans) {
      const overdueInstallments = paymentPlan.getOverdueInstallments();
      
      for (const installment of overdueInstallments) {
        try {
          // Mark installment as overdue and calculate penalties
          paymentPlan.markInstallmentOverdue(installment.id);
          await this.repository.updatePaymentPlan(paymentPlan);
          
          // Create overdue transaction
          const overdueTransaction = Transaction.create({
            patientId: paymentPlan.getPatientId(),
            type: TransactionType.INSTALLMENT,
            amount: installment.amount,
            paymentMethod: paymentPlan.getPaymentMethod(),
            installments: paymentPlan.getInstallmentCount(),
            installmentNumber: installment.installmentNumber,
            dueDate: installment.dueDate,
            status: 'overdue' as any,
            description: `Parcela ${installment.installmentNumber}/${paymentPlan.getInstallmentCount()} - ${paymentPlan.getDescription() || 'Plano de Pagamento'}`,
            metadata: {
              paymentPlanId: paymentPlan.getId(),
              installmentId: installment.id,
              penalty: paymentPlan.calculatePenalty(installment).toJSON()
            },
            createdBy: 'system' as UserId
          });

          await this.repository.saveTransaction(overdueTransaction);
        } catch (error) {
          console.error(`Error processing overdue installment ${installment.id}:`, error);
        }
      }
    }
  }

  async calculateRefundAmount(packageId: PackageId, refundDate: Date): Promise<Money> {
    const package = await this.repository.findPackageById(packageId);
    if (!package) {
      throw new DomainError('Package not found');
    }

    if (!package.isActive()) {
      throw new BusinessRuleError('Cannot calculate refund for inactive package');
    }

    // Calculate refund based on remaining sessions
    const remainingValue = package.getRemainingValue();
    
    // Apply refund policy (e.g., 10% retention fee)
    const retentionFee = remainingValue.multiply(0.1);
    const refundAmount = remainingValue.subtract(retentionFee);

    return refundAmount;
  }

  async issueInvoice(invoiceId: InvoiceId): Promise<Invoice> {
    const invoice = await this.repository.findInvoiceById(invoiceId);
    if (!invoice) {
      throw new DomainError('Invoice not found');
    }

    if (!invoice.canBeIssued()) {
      throw new BusinessRuleError(`Cannot issue invoice with status: ${invoice.getStatus()}`);
    }

    const invoiceNumber = await this.repository.generateInvoiceNumber();
    invoice.issue(invoiceNumber);
    
    await this.repository.updateInvoice(invoice);
    return invoice;
  }

  async markInvoiceAsOverdue(): Promise<void> {
    const overdueInvoices = await this.repository.findOverdueInvoices();
    
    for (const invoice of overdueInvoices) {
      if (invoice.canBePaid() && invoice.getDaysOverdue() > 0) {
        invoice.markAsOverdue();
        await this.repository.updateInvoice(invoice);
      }
    }
  }

  private getBasePrice(packageType: PackageType): Money {
    const price = this.packagePrices.get(packageType);
    if (!price) {
      throw new DomainError(`Price not configured for package type: ${packageType}`);
    }
    return price;
  }

  private async calculateDiscount(
    packageType: PackageType,
    patientId: PatientId,
    customDiscounts: DiscountRule[]
  ): Promise<Money> {
    const basePrice = this.getBasePrice(packageType);
    let totalDiscountRate = 0;

    // Check patient history for discount eligibility
    const patientPackages = await this.repository.findPackagesByPatient(patientId);
    const isReturningPatient = patientPackages.length > 0;

    // Apply discount rules
    const allRules = [...this.discountRules, ...customDiscounts];
    
    for (const rule of allRules) {
      if (this.isDiscountApplicable(rule, packageType, patientPackages.length, isReturningPatient)) {
        if (rule.type === 'percentage') {
          totalDiscountRate += rule.value;
        } else if (rule.type === 'fixed') {
          // Fixed discounts would need different handling
          // For now, convert to percentage based on base price
          totalDiscountRate += rule.value / basePrice.toNumber();
        }
      }
    }

    // Cap total discount at 50%
    totalDiscountRate = Math.min(totalDiscountRate, 0.5);

    return basePrice.multiply(totalDiscountRate);
  }

  private isDiscountApplicable(
    rule: DiscountRule,
    packageType: PackageType,
    packageCount: number,
    isReturningPatient: boolean
  ): boolean {
    if (!rule.condition) return true;

    if (rule.condition.minPackages && packageCount < rule.condition.minPackages) {
      return false;
    }

    if (rule.condition.packageType && rule.condition.packageType !== packageType) {
      return false;
    }

    if (rule.condition.isReturningPatient !== undefined && 
        rule.condition.isReturningPatient !== isReturningPatient) {
      return false;
    }

    return true;
  }

  private getSessionCount(packageType: PackageType): number {
    switch (packageType) {
      case PackageType.SESSIONS_10:
        return 10;
      case PackageType.SESSIONS_20:
        return 20;
      case PackageType.MONTHLY_UNLIMITED:
        return 30; // Assume 30 sessions for unlimited monthly
      case PackageType.EVALUATION_ONLY:
        return 1;
      default:
        return 0;
    }
  }

  private calculateDefaultDueDate(): Date {
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30); // 30 days from now
    return dueDate;
  }
}
