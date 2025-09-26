import { Money } from '../../domain/value-objects/Money';
import { PaymentMethod } from '../../domain/value-objects/PaymentMethod';
import { Package, PackageType } from '../../domain/entities/Package';
import { Transaction, TransactionType, PatientId, UserId } from '../../domain/entities/Transaction';
import { IFinancialRepository } from '../../domain/repositories/IFinancialRepository';
import { BillingService } from '../services/BillingService';
import { PaymentService, PaymentRequest } from '../services/PaymentService';
import { DomainError, BusinessRuleError, PaymentError } from '../../domain/errors/DomainError';

export interface CreatePackageCommand {
  patientId: PatientId;
  packageType: PackageType;
  paymentMethod: PaymentMethod;
  paymentMethodId?: string;
  installments?: number;
  customPrice?: Money;
  discountAmount?: Money;
  notes?: string;
  createdBy: UserId;
}

export interface CreatePackageResult {
  success: boolean;
  package?: Package;
  transaction?: Transaction;
  paymentResult?: any;
  error?: string;
  errorCode?: string;
}

export class CreatePackageUseCase {
  constructor(
    private readonly repository: IFinancialRepository,
    private readonly billingService: BillingService,
    private readonly paymentService: PaymentService
  ) {}

  async execute(command: CreatePackageCommand): Promise<CreatePackageResult> {
    try {
      // 1. Validate business rules
      await this.validateCommand(command);
      await this.validatePatientEligibility(command.patientId);

      // 2. Calculate pricing
      const pricing = command.customPrice ? 
        await this.calculateCustomPricing(command) :
        await this.billingService.calculatePackagePricing(command.packageType, command.patientId);

      // 3. Create transaction
      const transaction = Transaction.create({
        patientId: command.patientId,
        type: TransactionType.PACKAGE_PURCHASE,
        amount: pricing.totalAmount,
        paymentMethod: command.paymentMethod,
        installments: command.installments || 1,
        dueDate: this.calculateDueDate(command),
        description: `Pacote ${this.getPackageDisplayName(command.packageType)}`,
        metadata: {
          packageType: command.packageType,
          basePrice: pricing.basePrice.toJSON(),
          discount: pricing.discount.toJSON(),
          taxes: pricing.taxes.toJSON(),
          sessionValue: pricing.sessionValue.toJSON(),
          notes: command.notes
        },
        createdBy: command.createdBy
      });

      // 4. Process payment if not cash
      let paymentResult;
      if (command.paymentMethod.requiresOnlineProcessing()) {
        const paymentRequest: PaymentRequest = {
          transactionId: transaction.getId(),
          patientId: command.patientId,
          amount: pricing.totalAmount,
          paymentMethod: command.paymentMethod,
          paymentMethodId: command.paymentMethodId,
          installments: command.installments,
          metadata: {
            packageType: command.packageType,
            sessionCount: this.getSessionCount(command.packageType)
          }
        };

        paymentResult = await this.paymentService.processPayment(paymentRequest);
        
        if (!paymentResult.success) {
          return {
            success: false,
            error: paymentResult.error,
            errorCode: paymentResult.errorCode
          };
        }
      } else {
        // For cash payments, mark as paid immediately
        transaction.markAsPaid(new Date());
      }

      // 5. Create package
      const package = Package.create({
        patientId: command.patientId,
        transactionId: transaction.getId(),
        type: command.packageType,
        totalSessions: this.getSessionCount(command.packageType),
        price: pricing.totalAmount,
        purchaseDate: new Date(),
        expiryDate: this.calculateExpiryDate(command.packageType)
      });

      // 6. Save everything in a transaction
      await this.repository.withTransaction(async (tx) => {
        await tx.saveTransaction(transaction);
        await tx.savePackage(package);

        // Create installment transactions if needed
        if (command.installments && command.installments > 1) {
          const installments = this.createInstallmentTransactions(
            transaction,
            command.installments,
            command.createdBy
          );
          await tx.saveInstallments(installments);
        }

        await tx.commit();
      });

      return {
        success: true,
        package,
        transaction,
        paymentResult
      };

    } catch (error) {
      console.error('Error creating package:', error);
      
      if (error instanceof DomainError || error instanceof PaymentError) {
        return {
          success: false,
          error: error.message,
          errorCode: error instanceof PaymentError ? error.code : 'DOMAIN_ERROR'
        };
      }

      return {
        success: false,
        error: 'Internal error occurred while creating package',
        errorCode: 'INTERNAL_ERROR'
      };
    }
  }

  private async validateCommand(command: CreatePackageCommand): Promise<void> {
    if (!command.patientId) {
      throw new DomainError('Patient ID is required');
    }

    if (!command.packageType) {
      throw new DomainError('Package type is required');
    }

    if (!command.paymentMethod) {
      throw new DomainError('Payment method is required');
    }

    if (!command.createdBy) {
      throw new DomainError('Created by user ID is required');
    }

    if (command.installments && command.installments > 1) {
      if (!command.paymentMethod.supportsInstallments()) {
        throw new BusinessRuleError('Selected payment method does not support installments');
      }

      if (command.installments > 12) {
        throw new BusinessRuleError('Maximum 12 installments allowed');
      }
    }

    if (command.customPrice?.isZero()) {
      throw new DomainError('Custom price must be positive');
    }

    if (command.discountAmount && command.discountAmount.toNumber() < 0) {
      throw new DomainError('Discount amount cannot be negative');
    }
  }

  private async validatePatientEligibility(patientId: PatientId): Promise<void> {
    // Check for active packages
    const activePackages = await this.repository.findActivePackagesByPatient(patientId);
    
    // Business rule: Only one active package per patient
    if (activePackages.length > 0) {
      const activePackage = activePackages[0];
      if (activePackage.hasRemainingSessions()) {
        throw new BusinessRuleError(
          `Patient already has an active package with ${activePackage.getRemainingSessions()} remaining sessions`
        );
      }
    }

    // Check for overdue payments
    const overdueTransactions = await this.repository.findTransactionsByPatient(patientId, {
      status: 'overdue'
    });

    if (overdueTransactions.length > 0) {
      const totalOverdue = overdueTransactions.reduce(
        (sum, tx) => sum.add(tx.getAmount()),
        Money.zero()
      );
      
      throw new BusinessRuleError(
        `Patient has overdue payments totaling ${totalOverdue.toString()}. Please settle before purchasing new package.`
      );
    }
  }

  private async calculateCustomPricing(command: CreatePackageCommand): Promise<any> {
    const basePrice = command.customPrice!;
    const discount = command.discountAmount || Money.zero(basePrice.toJSON().currency);
    const discountedPrice = basePrice.subtract(discount);
    
    // Apply standard taxes
    const pricing = await this.billingService.calculatePackagePricing(
      command.packageType, 
      command.patientId
    );
    
    // Use custom base price but standard tax calculation
    const taxRate = pricing.taxes.toNumber() / pricing.basePrice.toNumber();
    const taxes = discountedPrice.multiply(taxRate);
    const totalAmount = discountedPrice.add(taxes);
    
    const sessionCount = this.getSessionCount(command.packageType);
    const sessionValue = sessionCount > 0 ? totalAmount.divide(sessionCount) : Money.zero();

    return {
      basePrice,
      discount,
      taxes,
      totalAmount,
      sessionValue
    };
  }

  private calculateDueDate(command: CreatePackageCommand): Date {
    const dueDate = new Date();
    
    if (command.paymentMethod.getType() === 'bank_slip') {
      // Bank slips typically have 3 days to pay
      dueDate.setDate(dueDate.getDate() + 3);
    } else if (command.installments && command.installments > 1) {
      // First installment due in 30 days for installment plans
      dueDate.setDate(dueDate.getDate() + 30);
    } else {
      // Immediate payment for other methods
      dueDate.setHours(dueDate.getHours() + 1);
    }
    
    return dueDate;
  }

  private calculateExpiryDate(packageType: PackageType): Date {
    const expiryDate = new Date();
    
    switch (packageType) {
      case PackageType.SESSIONS_10:
      case PackageType.SESSIONS_20:
        // Session packages expire in 6 months
        expiryDate.setMonth(expiryDate.getMonth() + 6);
        break;
      case PackageType.MONTHLY_UNLIMITED:
        // Monthly packages expire in 1 month
        expiryDate.setMonth(expiryDate.getMonth() + 1);
        break;
      case PackageType.EVALUATION_ONLY:
        // Evaluation packages expire in 30 days
        expiryDate.setDate(expiryDate.getDate() + 30);
        break;
      default:
        // Default 3 months
        expiryDate.setMonth(expiryDate.getMonth() + 3);
    }
    
    return expiryDate;
  }

  private getSessionCount(packageType: PackageType): number {
    switch (packageType) {
      case PackageType.SESSIONS_10:
        return 10;
      case PackageType.SESSIONS_20:
        return 20;
      case PackageType.MONTHLY_UNLIMITED:
        return 30; // Estimate for unlimited
      case PackageType.EVALUATION_ONLY:
        return 1;
      default:
        return 0;
    }
  }

  private getPackageDisplayName(packageType: PackageType): string {
    switch (packageType) {
      case PackageType.SESSIONS_10:
        return '10 Sessões';
      case PackageType.SESSIONS_20:
        return '20 Sessões';
      case PackageType.MONTHLY_UNLIMITED:
        return 'Ilimitado Mensal';
      case PackageType.EVALUATION_ONLY:
        return 'Apenas Avaliação';
      default:
        return 'Pacote';
    }
  }

  private createInstallmentTransactions(
    originalTransaction: Transaction,
    installmentCount: number,
    createdBy: UserId
  ): Transaction[] {
    const installments: Transaction[] = [];
    const installmentAmount = originalTransaction.getAmount().divide(installmentCount);
    
    for (let i = 2; i <= installmentCount; i++) { // Start from 2 since first is the original
      const dueDate = new Date();
      dueDate.setMonth(dueDate.getMonth() + (i - 1));
      
      const installmentTransaction = Transaction.create({
        patientId: originalTransaction.getPatientId(),
        type: TransactionType.INSTALLMENT,
        amount: installmentAmount,
        paymentMethod: originalTransaction.getPaymentMethod(),
        installments: installmentCount,
        installmentNumber: i,
        dueDate,
        description: `Parcela ${i}/${installmentCount} - ${originalTransaction.getDescription()}`,
        metadata: {
          ...originalTransaction.getMetadata(),
          originalTransactionId: originalTransaction.getId(),
          installmentOf: originalTransaction.getId()
        },
        createdBy
      });
      
      installments.push(installmentTransaction);
    }
    
    return installments;
  }
}
