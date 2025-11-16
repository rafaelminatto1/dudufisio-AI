import { Money } from '../value-objects/Money';
import { PaymentMethod } from '../value-objects/PaymentMethod';
import { DomainError, BusinessRuleError } from '../errors/DomainError';

export type TransactionId = string;
export type PatientId = string;
export type UserId = string;

export enum TransactionType {
  PACKAGE_PURCHASE = 'package_purchase',
  SINGLE_SESSION = 'single_session',
  INSTALLMENT = 'installment',
  REFUND = 'refund',
  ADJUSTMENT = 'adjustment',
  EXPENSE = 'expense'
}

export enum TransactionStatus {
  PENDING = 'pending',
  PAID = 'paid',
  OVERDUE = 'overdue',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded'
}

export interface TransactionData {
  id?: TransactionId;
  patientId: PatientId;
  type: TransactionType;
  amount: Money;
  paymentMethod: PaymentMethod;
  installments?: number;
  installmentNumber?: number;
  dueDate: Date;
  paidDate?: Date;
  status?: TransactionStatus;
  gatewayTransactionId?: string;
  gatewayResponse?: Record<string, any>;
  description?: string;
  metadata?: Record<string, any>;
  fiscalDocumentNumber?: string;
  taxAmount?: Money;
  createdBy: UserId;
  updatedBy?: UserId;
}

export class Transaction {
  private constructor(
    private readonly id: TransactionId,
    private readonly patientId: PatientId,
    private readonly type: TransactionType,
    private readonly amount: Money,
    private readonly paymentMethod: PaymentMethod,
    private readonly installments: number,
    private readonly installmentNumber: number,
    private readonly dueDate: Date,
    private paidDate: Date | null,
    private status: TransactionStatus,
    private gatewayTransactionId: string | null,
    private gatewayResponse: Record<string, any> | null,
    private readonly description: string | null,
    private readonly metadata: Record<string, any>,
    private fiscalDocumentNumber: string | null,
    private readonly taxAmount: Money,
    private readonly createdBy: UserId,
    private updatedBy: UserId | null,
    private readonly createdAt: Date,
    private updatedAt: Date,
    private version: number
  ) {
    this.validate();
  }

  static create(data: TransactionData): Transaction {
    const id = data.id || crypto.randomUUID();
    const now = new Date();
    
    return new Transaction(
      id,
      data.patientId,
      data.type,
      data.amount,
      data.paymentMethod,
      data.installments || 1,
      data.installmentNumber || 1,
      data.dueDate,
      data.paidDate || null,
      data.status || TransactionStatus.PENDING,
      data.gatewayTransactionId || null,
      data.gatewayResponse || null,
      data.description || null,
      data.metadata || {},
      data.fiscalDocumentNumber || null,
      data.taxAmount || Money.zero(data.amount.toJSON().currency),
      data.createdBy,
      data.updatedBy || null,
      now,
      now,
      1
    );
  }

  getId(): TransactionId {
    return this.id;
  }

  getPatientId(): PatientId {
    return this.patientId;
  }

  getType(): TransactionType {
    return this.type;
  }

  getAmount(): Money {
    return this.amount;
  }

  getNetAmount(): Money {
    return this.amount.subtract(this.taxAmount);
  }

  getTaxAmount(): Money {
    return this.taxAmount;
  }

  getPaymentMethod(): PaymentMethod {
    return this.paymentMethod;
  }

  getInstallments(): number {
    return this.installments;
  }

  getInstallmentNumber(): number {
    return this.installmentNumber;
  }

  getDueDate(): Date {
    return this.dueDate;
  }

  getPaidDate(): Date | null {
    return this.paidDate;
  }

  getStatus(): TransactionStatus {
    return this.status;
  }

  getDescription(): string | null {
    return this.description;
  }

  getMetadata(): Record<string, any> {
    return { ...this.metadata };
  }

  getFiscalDocumentNumber(): string | null {
    return this.fiscalDocumentNumber;
  }

  getGatewayTransactionId(): string | null {
    return this.gatewayTransactionId;
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }

  getUpdatedAt(): Date {
    return this.updatedAt;
  }

  getVersion(): number {
    return this.version;
  }

  isPaid(): boolean {
    return this.status === TransactionStatus.PAID;
  }

  isPending(): boolean {
    return this.status === TransactionStatus.PENDING;
  }

  isOverdue(): boolean {
    return this.status === TransactionStatus.OVERDUE || 
           (this.status === TransactionStatus.PENDING && this.dueDate < new Date());
  }

  isCancelled(): boolean {
    return this.status === TransactionStatus.CANCELLED;
  }

  isRefunded(): boolean {
    return this.status === TransactionStatus.REFUNDED;
  }

  canBePaid(): boolean {
    return this.status === TransactionStatus.PENDING || this.status === TransactionStatus.OVERDUE;
  }

  canBeCancelled(): boolean {
    return this.status === TransactionStatus.PENDING;
  }

  canBeRefunded(): boolean {
    return this.status === TransactionStatus.PAID;
  }

  markAsPaid(paidDate: Date, gatewayTransactionId?: string, gatewayResponse?: Record<string, any>): void {
    if (!this.canBePaid()) {
      throw new BusinessRuleError(`Cannot mark transaction as paid. Current status: ${this.status}`);
    }

    this.status = TransactionStatus.PAID;
    this.paidDate = paidDate;
    this.updatedAt = new Date();
    this.version++;

    if (gatewayTransactionId) {
      this.gatewayTransactionId = gatewayTransactionId;
    }

    if (gatewayResponse) {
      this.gatewayResponse = gatewayResponse;
    }
  }

  markAsOverdue(): void {
    if (this.status !== TransactionStatus.PENDING) {
      throw new BusinessRuleError(`Cannot mark transaction as overdue. Current status: ${this.status}`);
    }

    this.status = TransactionStatus.OVERDUE;
    this.updatedAt = new Date();
    this.version++;
  }

  cancel(reason?: string): void {
    if (!this.canBeCancelled()) {
      throw new BusinessRuleError(`Cannot cancel transaction. Current status: ${this.status}`);
    }

    this.status = TransactionStatus.CANCELLED;
    this.updatedAt = new Date();
    this.version++;

    if (reason) {
      this.metadata.cancellationReason = reason;
    }
  }

  refund(refundAmount?: Money, reason?: string): void {
    if (!this.canBeRefunded()) {
      throw new BusinessRuleError(`Cannot refund transaction. Current status: ${this.status}`);
    }

    if (refundAmount?.isGreaterThan(this.amount)) {
      throw new BusinessRuleError('Refund amount cannot be greater than transaction amount');
    }

    this.status = TransactionStatus.REFUNDED;
    this.updatedAt = new Date();
    this.version++;

    this.metadata.refundAmount = refundAmount?.toJSON() || this.amount.toJSON();
    if (reason) {
      this.metadata.refundReason = reason;
    }
  }

  setFiscalDocumentNumber(documentNumber: string): void {
    if (!documentNumber.trim()) {
      throw new DomainError('Fiscal document number cannot be empty');
    }

    this.fiscalDocumentNumber = documentNumber;
    this.updatedAt = new Date();
    this.version++;
  }

  updateGatewayResponse(response: Record<string, any>): void {
    this.gatewayResponse = { ...this.gatewayResponse, ...response };
    this.updatedAt = new Date();
    this.version++;
  }

  getDaysOverdue(): number {
    if (!this.isOverdue()) {
      return 0;
    }

    const now = new Date();
    const diffTime = now.getTime() - this.dueDate.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  getInstallmentDescription(): string {
    if (this.installments === 1) {
      return 'À vista';
    }
    return `${this.installmentNumber}/${this.installments}`;
  }

  toJSON() {
    return {
      id: this.id,
      patientId: this.patientId,
      type: this.type,
      amount: this.amount.toJSON(),
      netAmount: this.getNetAmount().toJSON(),
      taxAmount: this.taxAmount.toJSON(),
      paymentMethod: this.paymentMethod.toJSON(),
      installments: this.installments,
      installmentNumber: this.installmentNumber,
      dueDate: this.dueDate.toISOString(),
      paidDate: this.paidDate?.toISOString() || null,
      status: this.status,
      gatewayTransactionId: this.gatewayTransactionId,
      gatewayResponse: this.gatewayResponse,
      description: this.description,
      metadata: this.metadata,
      fiscalDocumentNumber: this.fiscalDocumentNumber,
      createdBy: this.createdBy,
      updatedBy: this.updatedBy,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
      version: this.version
    };
  }

  private validate(): void {
    if (!this.patientId) {
      throw new DomainError('Patient ID is required');
    }

    if (!this.createdBy) {
      throw new DomainError('Created by user ID is required');
    }

    if (this.installments < 1 || this.installments > 12) {
      throw new DomainError('Installments must be between 1 and 12');
    }

    if (this.installmentNumber < 1 || this.installmentNumber > this.installments) {
      throw new DomainError('Invalid installment number');
    }

    if (this.amount.isZero() || this.amount.toNumber() < 0) {
      throw new DomainError('Transaction amount must be positive');
    }

    if (this.dueDate < new Date('2020-01-01')) {
      throw new DomainError('Due date cannot be in the past');
    }

    // Validate installment payment method
    if (this.installments > 1 && !this.paymentMethod.supportsInstallments()) {
      throw new DomainError('Payment method does not support installments');
    }
  }
}
