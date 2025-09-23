import { Transaction, TransactionId, TransactionStatus } from '../../domain/entities/Transaction';
import { PaymentPlan } from '../../domain/entities/PaymentPlan';
import { IFinancialRepository } from '../../domain/repositories/IFinancialRepository';
import { PaymentService, PaymentRequest } from '../services/PaymentService';
import { DomainError, PaymentError, BusinessRuleError } from '../../domain/errors/DomainError';

export interface ProcessPaymentCommand {
  transactionId: TransactionId;
  paymentMethodId?: string;
  gatewayName?: string;
  metadata?: Record<string, any>;
}

export interface ProcessPaymentResult {
  success: boolean;
  transaction?: Transaction;
  gatewayTransactionId?: string;
  status: TransactionStatus;
  error?: string;
  errorCode?: string;
}

export interface ProcessInstallmentPaymentCommand {
  paymentPlanId: string;
  installmentId: string;
  paymentMethodId?: string;
  gatewayName?: string;
  metadata?: Record<string, any>;
}

export interface ProcessInstallmentPaymentResult {
  success: boolean;
  transaction?: Transaction;
  paymentPlan?: PaymentPlan;
  gatewayTransactionId?: string;
  error?: string;
  errorCode?: string;
}

export class ProcessPaymentUseCase {
  constructor(
    private readonly repository: IFinancialRepository,
    private readonly paymentService: PaymentService
  ) {}

  async execute(command: ProcessPaymentCommand): Promise<ProcessPaymentResult> {
    try {
      // 1. Validate command
      await this.validateCommand(command);

      // 2. Get transaction
      const transaction = await this.repository.findTransactionById(command.transactionId);
      if (!transaction) {
        throw new DomainError('Transaction not found');
      }

      // 3. Validate transaction state
      if (!transaction.canBePaid()) {
        throw new BusinessRuleError(
          `Cannot process payment for transaction with status: ${transaction.getStatus()}`
        );
      }

      // 4. Prepare payment request
      const paymentRequest: PaymentRequest = {
        transactionId: transaction.getId(),
        patientId: transaction.getPatientId(),
        amount: transaction.getAmount(),
        paymentMethod: transaction.getPaymentMethod(),
        paymentMethodId: command.paymentMethodId,
        installments: transaction.getInstallments(),
        metadata: {
          ...transaction.getMetadata(),
          ...command.metadata
        }
      };

      // 5. Process payment
      const paymentResult = await this.paymentService.processPayment(
        paymentRequest,
        command.gatewayName
      );

      if (!paymentResult.success) {
        return {
          success: false,
          transaction,
          status: paymentResult.status,
          error: paymentResult.error,
          errorCode: paymentResult.errorCode
        };
      }

      // 6. Get updated transaction
      const updatedTransaction = await this.repository.findTransactionById(command.transactionId);

      return {
        success: true,
        transaction: updatedTransaction!,
        gatewayTransactionId: paymentResult.transactionId,
        status: paymentResult.status
      };

    } catch (error) {
      console.error('Error processing payment:', error);

      if (error instanceof DomainError || error instanceof PaymentError) {
        return {
          success: false,
          status: TransactionStatus.PENDING,
          error: error.message,
          errorCode: error instanceof PaymentError ? error.code : 'DOMAIN_ERROR'
        };
      }

      return {
        success: false,
        status: TransactionStatus.PENDING,
        error: 'Internal error occurred while processing payment',
        errorCode: 'INTERNAL_ERROR'
      };
    }
  }

  async executeInstallmentPayment(command: ProcessInstallmentPaymentCommand): Promise<ProcessInstallmentPaymentResult> {
    try {
      // 1. Validate command
      if (!command.paymentPlanId || !command.installmentId) {
        throw new DomainError('Payment plan ID and installment ID are required');
      }

      // 2. Get payment plan
      const paymentPlan = await this.repository.findPaymentPlanById(command.paymentPlanId);
      if (!paymentPlan) {
        throw new DomainError('Payment plan not found');
      }

      // 3. Validate payment plan state
      if (!paymentPlan.isActive()) {
        throw new BusinessRuleError(
          `Cannot process payment for ${paymentPlan.getStatus()} payment plan`
        );
      }

      // 4. Find installment
      const installments = paymentPlan.getInstallments();
      const installment = installments.find(inst => inst.id === command.installmentId);
      if (!installment) {
        throw new DomainError('Installment not found');
      }

      if (installment.status === 'paid') {
        throw new BusinessRuleError('Installment is already paid');
      }

      if (installment.status === 'cancelled') {
        throw new BusinessRuleError('Cannot pay cancelled installment');
      }

      // 5. Process installment payment
      const paymentResult = await this.paymentService.processInstallmentPayment(
        command.paymentPlanId,
        command.installmentId,
        command.gatewayName
      );

      if (!paymentResult.success) {
        return {
          success: false,
          error: paymentResult.error,
          errorCode: paymentResult.errorCode
        };
      }

      // 6. Get updated payment plan and transaction
      const updatedPaymentPlan = await this.repository.findPaymentPlanById(command.paymentPlanId);
      const updatedInstallment = updatedPaymentPlan?.getInstallments().find(inst => inst.id === command.installmentId);
      
      let transaction;
      if (updatedInstallment?.transactionId) {
        transaction = await this.repository.findTransactionById(updatedInstallment.transactionId);
      }

      return {
        success: true,
        transaction,
        paymentPlan: updatedPaymentPlan!,
        gatewayTransactionId: paymentResult.transactionId
      };

    } catch (error) {
      console.error('Error processing installment payment:', error);

      if (error instanceof DomainError || error instanceof PaymentError) {
        return {
          success: false,
          error: error.message,
          errorCode: error instanceof PaymentError ? error.code : 'DOMAIN_ERROR'
        };
      }

      return {
        success: false,
        error: 'Internal error occurred while processing installment payment',
        errorCode: 'INTERNAL_ERROR'
      };
    }
  }

  async syncPaymentStatus(transactionId: TransactionId, gatewayName?: string): Promise<void> {
    try {
      await this.paymentService.syncPaymentStatus(transactionId, gatewayName);
    } catch (error) {
      console.error('Error syncing payment status:', error);
      // Don't throw - this is a background sync operation
    }
  }

  async retryFailedPayment(transactionId: TransactionId, gatewayName?: string): Promise<ProcessPaymentResult> {
    const transaction = await this.repository.findTransactionById(transactionId);
    if (!transaction) {
      throw new DomainError('Transaction not found');
    }

    // Only retry if transaction is in a retryable state
    if (!transaction.isPending() && !transaction.isOverdue()) {
      throw new BusinessRuleError(
        `Cannot retry payment for transaction with status: ${transaction.getStatus()}`
      );
    }

    // Reset transaction status to pending for retry
    if (transaction.isOverdue()) {
      // This would require adding a method to reset overdue status
      // For now, we'll proceed with the retry
    }

    return this.execute({
      transactionId,
      gatewayName,
      metadata: {
        isRetry: true,
        retryAttempt: (transaction.getMetadata().retryAttempt || 0) + 1
      }
    });
  }

  async processRefund(
    transactionId: TransactionId,
    refundAmount?: number,
    reason?: string,
    gatewayName?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const transaction = await this.repository.findTransactionById(transactionId);
      if (!transaction) {
        throw new DomainError('Transaction not found');
      }

      if (!transaction.canBeRefunded()) {
        throw new BusinessRuleError(
          `Cannot refund transaction with status: ${transaction.getStatus()}`
        );
      }

      const refundAmountMoney = refundAmount ? 
        new (await import('../../domain/value-objects/Money')).Money(refundAmount, transaction.getAmount().toJSON().currency) :
        undefined;

      const result = await this.paymentService.processRefund(
        transactionId,
        refundAmountMoney,
        reason,
        gatewayName
      );

      return {
        success: result.success,
        error: result.error
      };

    } catch (error) {
      console.error('Error processing refund:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Refund processing failed'
      };
    }
  }

  private async validateCommand(command: ProcessPaymentCommand): Promise<void> {
    if (!command.transactionId) {
      throw new DomainError('Transaction ID is required');
    }

    // Additional validation can be added here
    // e.g., validate payment method ID format, gateway name, etc.
  }
}