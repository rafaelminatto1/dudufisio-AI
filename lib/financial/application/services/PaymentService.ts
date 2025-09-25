import { Money } from '../../domain/value-objects/Money';
import { PaymentMethod, PaymentMethodType } from '../../domain/value-objects/PaymentMethod';
import { Transaction, TransactionId, PatientId, UserId, TransactionStatus } from '../../domain/entities/Transaction';
import { PaymentPlan, PaymentPlanId } from '../../domain/entities/PaymentPlan';
import { IFinancialRepository } from '../../domain/repositories/IFinancialRepository';
import { PaymentError, DomainError, BusinessRuleError } from '../../domain/errors/DomainError';

export interface PaymentGateway {
  processPayment(request: PaymentRequest): Promise<PaymentResult>;
  refundPayment(transactionId: string, amount?: Money): Promise<RefundResult>;
  getTransactionStatus(transactionId: string): Promise<TransactionStatus>;
  createRecurringPayment(request: RecurringPaymentRequest): Promise<RecurringPaymentResult>;
}

export interface PaymentRequest {
  transactionId: TransactionId;
  patientId: PatientId;
  amount: Money;
  paymentMethod: PaymentMethod;
  paymentMethodId?: string;
  installments?: number;
  metadata?: Record<string, any>;
}

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  status: TransactionStatus;
  gatewayResponse?: Record<string, any>;
  error?: string;
  errorCode?: string;
}

export interface RefundResult {
  success: boolean;
  refundId?: string;
  refundAmount: Money;
  gatewayResponse?: Record<string, any>;
  error?: string;
}

export interface RecurringPaymentRequest {
  paymentPlanId: PaymentPlanId;
  paymentMethod: PaymentMethod;
  paymentMethodId?: string;
  metadata?: Record<string, any>;
}

export interface RecurringPaymentResult {
  success: boolean;
  subscriptionId?: string;
  gatewayResponse?: Record<string, any>;
  error?: string;
}

export interface PaymentServiceConfig {
  defaultGateway: string;
  gatewayConfig: Record<string, any>;
  retryAttempts: number;
  retryDelayMs: number;
}

export class PaymentService {
  private readonly gateways = new Map<string, PaymentGateway>();
  private readonly config: PaymentServiceConfig;

  constructor(
    private readonly repository: IFinancialRepository,
    config: Partial<PaymentServiceConfig> = {}
  ) {
    this.config = {
      defaultGateway: 'stripe',
      gatewayConfig: {},
      retryAttempts: 3,
      retryDelayMs: 1000,
      ...config
    };
  }

  registerGateway(name: string, gateway: PaymentGateway): void {
    this.gateways.set(name, gateway);
  }

  async processPayment(request: PaymentRequest, gatewayName?: string): Promise<PaymentResult> {
    const gateway = this.getGateway(gatewayName);
    
    // Validate payment request
    await this.validatePaymentRequest(request);
    
    // Get the transaction
    const transaction = await this.repository.findTransactionById(request.transactionId);
    if (!transaction) {
      throw new DomainError('Transaction not found');
    }

    if (!transaction.canBePaid()) {
      throw new BusinessRuleError(`Cannot process payment for transaction with status: ${transaction.getStatus()}`);
    }

    try {
      // Process payment with retry logic
      const result = await this.processPaymentWithRetry(gateway, request);
      
      if (result.success) {
        // Update transaction status
        transaction.markAsPaid(
          new Date(),
          result.transactionId,
          result.gatewayResponse
        );
        await this.repository.updateTransaction(transaction);
      }

      return result;
    } catch (error) {
      // Log error and return failure result
      console.error('Payment processing failed:', error);
      return {
        success: false,
        status: TransactionStatus.PENDING,
        error: error instanceof Error ? error.message : 'Payment processing failed',
        errorCode: error instanceof PaymentError ? error.code : 'PAYMENT_ERROR'
      };
    }
  }

  async processRefund(
    transactionId: TransactionId,
    refundAmount?: Money,
    reason?: string,
    gatewayName?: string
  ): Promise<RefundResult> {
    const gateway = this.getGateway(gatewayName);
    
    const transaction = await this.repository.findTransactionById(transactionId);
    if (!transaction) {
      throw new DomainError('Transaction not found');
    }

    if (!transaction.canBeRefunded()) {
      throw new BusinessRuleError(`Cannot refund transaction with status: ${transaction.getStatus()}`);
    }

    const actualRefundAmount = refundAmount || transaction.getAmount();
    if (actualRefundAmount.isGreaterThan(transaction.getAmount())) {
      throw new BusinessRuleError('Refund amount cannot be greater than transaction amount');
    }

    try {
      const gatewayTransactionId = transaction.getGatewayTransactionId();
      if (!gatewayTransactionId) {
        throw new PaymentError('No gateway transaction ID found for refund');
      }

      const result = await gateway.refundPayment(gatewayTransactionId, actualRefundAmount);
      
      if (result.success) {
        // Update transaction status
        transaction.refund(actualRefundAmount, reason);
        await this.repository.updateTransaction(transaction);
      }

      return result;
    } catch (error) {
      console.error('Refund processing failed:', error);
      return {
        success: false,
        refundAmount: actualRefundAmount,
        error: error instanceof Error ? error.message : 'Refund processing failed'
      };
    }
  }

  async setupRecurringPayment(
    paymentPlanId: PaymentPlanId,
    paymentMethodId: string,
    gatewayName?: string
  ): Promise<RecurringPaymentResult> {
    const gateway = this.getGateway(gatewayName);
    
    const paymentPlan = await this.repository.findPaymentPlanById(paymentPlanId);
    if (!paymentPlan) {
      throw new DomainError('Payment plan not found');
    }

    if (!paymentPlan.isActive()) {
      throw new BusinessRuleError(`Cannot setup recurring payment for ${paymentPlan.getStatus()} payment plan`);
    }

    try {
      const request: RecurringPaymentRequest = {
        paymentPlanId,
        paymentMethod: paymentPlan.getPaymentMethod(),
        paymentMethodId,
        metadata: {
          patientId: paymentPlan.getPatientId(),
          totalAmount: paymentPlan.getTotalAmount().toJSON(),
          installmentCount: paymentPlan.getInstallmentCount()
        }
      };

      return await gateway.createRecurringPayment(request);
    } catch (error) {
      console.error('Recurring payment setup failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Recurring payment setup failed'
      };
    }
  }

  async processInstallmentPayment(
    paymentPlanId: PaymentPlanId,
    installmentId: string,
    gatewayName?: string
  ): Promise<PaymentResult> {
    const paymentPlan = await this.repository.findPaymentPlanById(paymentPlanId);
    if (!paymentPlan) {
      throw new DomainError('Payment plan not found');
    }

    const installments = paymentPlan.getInstallments();
    const installment = installments.find(inst => inst.id === installmentId);
    if (!installment) {
      throw new DomainError('Installment not found');
    }

    if (installment.status === 'paid') {
      throw new BusinessRuleError('Installment is already paid');
    }

    // Create transaction for this installment
    const transaction = Transaction.create({
      patientId: paymentPlan.getPatientId(),
      type: 'installment' as any,
      amount: installment.amount,
      paymentMethod: paymentPlan.getPaymentMethod(),
      installments: paymentPlan.getInstallmentCount(),
      installmentNumber: installment.installmentNumber,
      dueDate: installment.dueDate,
      description: `Parcela ${installment.installmentNumber}/${paymentPlan.getInstallmentCount()}`,
      metadata: {
        paymentPlanId,
        installmentId
      },
      createdBy: 'system' as UserId
    });

    await this.repository.saveTransaction(transaction);

    // Process payment
    const paymentRequest: PaymentRequest = {
      transactionId: transaction.getId(),
      patientId: paymentPlan.getPatientId(),
      amount: installment.amount,
      paymentMethod: paymentPlan.getPaymentMethod(),
      metadata: {
        paymentPlanId,
        installmentId,
        installmentNumber: installment.installmentNumber
      }
    };

    const result = await this.processPayment(paymentRequest, gatewayName);

    if (result.success) {
      // Update payment plan
      paymentPlan.payInstallment(installmentId, new Date(), transaction.getId());
      await this.repository.updatePaymentPlan(paymentPlan);
    }

    return result;
  }

  async getPaymentStatus(transactionId: TransactionId, gatewayName?: string): Promise<TransactionStatus> {
    const gateway = this.getGateway(gatewayName);
    
    const transaction = await this.repository.findTransactionById(transactionId);
    if (!transaction) {
      throw new DomainError('Transaction not found');
    }

    const gatewayTransactionId = transaction.getGatewayTransactionId();
    if (!gatewayTransactionId) {
      return transaction.getStatus();
    }

    try {
      return await gateway.getTransactionStatus(gatewayTransactionId);
    } catch (error) {
      console.error('Failed to get payment status:', error);
      return transaction.getStatus();
    }
  }

  async syncPaymentStatus(transactionId: TransactionId, gatewayName?: string): Promise<void> {
    const status = await this.getPaymentStatus(transactionId, gatewayName);
    
    const transaction = await this.repository.findTransactionById(transactionId);
    if (!transaction) {
      throw new DomainError('Transaction not found');
    }

    if (transaction.getStatus() !== status) {
      // Update transaction status based on gateway response
      switch (status) {
        case TransactionStatus.PAID:
          if (transaction.canBePaid()) {
            transaction.markAsPaid(new Date());
            await this.repository.updateTransaction(transaction);
          }
          break;
        case TransactionStatus.CANCELLED:
          if (transaction.canBeCancelled()) {
            transaction.cancel('Cancelled by gateway');
            await this.repository.updateTransaction(transaction);
          }
          break;
        case TransactionStatus.REFUNDED:
          if (transaction.canBeRefunded()) {
            transaction.refund(undefined, 'Refunded by gateway');
            await this.repository.updateTransaction(transaction);
          }
          break;
      }
    }
  }

  private getGateway(gatewayName?: string): PaymentGateway {
    const name = gatewayName || this.config.defaultGateway;
    const gateway = this.gateways.get(name);
    
    if (!gateway) {
      throw new PaymentError(`Payment gateway '${name}' not found`);
    }
    
    return gateway;
  }

  private async validatePaymentRequest(request: PaymentRequest): Promise<void> {
    if (!request.transactionId) {
      throw new DomainError('Transaction ID is required');
    }

    if (!request.patientId) {
      throw new DomainError('Patient ID is required');
    }

    if (request.amount.isZero() || request.amount.toNumber() < 0) {
      throw new DomainError('Payment amount must be positive');
    }

    if (request.paymentMethod.isExpired()) {
      throw new PaymentError('Payment method is expired');
    }

    if (request.installments && request.installments > 1) {
      if (!request.paymentMethod.supportsInstallments()) {
        throw new PaymentError('Payment method does not support installments');
      }
    }
  }

  private async processPaymentWithRetry(
    gateway: PaymentGateway,
    request: PaymentRequest
  ): Promise<PaymentResult> {
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= this.config.retryAttempts; attempt++) {
      try {
        const result = await gateway.processPayment(request);
        
        if (result.success) {
          return result;
        }
        
        // If payment failed but it's not a retryable error, return immediately
        if (this.isNonRetryableError(result.errorCode)) {
          return result;
        }
        
        lastError = new PaymentError(result.error || 'Payment failed', result.errorCode);
        
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        
        // If it's a non-retryable error, return immediately
        if (error instanceof PaymentError && this.isNonRetryableError(error.code)) {
          throw error;
        }
      }
      
      // Wait before retry (exponential backoff)
      if (attempt < this.config.retryAttempts) {
        await this.delay(this.config.retryDelayMs * Math.pow(2, attempt - 1));
      }
    }
    
    throw lastError || new PaymentError('Payment processing failed after retries');
  }

  private isNonRetryableError(errorCode?: string): boolean {
    const nonRetryableCodes = [
      'INSUFFICIENT_FUNDS',
      'INVALID_CARD',
      'EXPIRED_CARD',
      'INVALID_CVC',
      'BLOCKED_CARD',
      'INVALID_AMOUNT'
    ];
    
    return errorCode ? nonRetryableCodes.includes(errorCode) : false;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
