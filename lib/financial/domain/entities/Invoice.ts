import { Money } from '../value-objects/Money';
import { TaxRate, TaxCalculator } from '../value-objects/TaxRate';
import { DomainError } from '../errors/DomainError';
import { TransactionId, PatientId, UserId } from './Transaction';

export type InvoiceId = string;

export enum InvoiceStatus {
  DRAFT = 'draft',
  ISSUED = 'issued',
  PAID = 'paid',
  CANCELLED = 'cancelled',
  OVERDUE = 'overdue'
}

export interface InvoiceLineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: Money;
  totalPrice: Money;
  metadata?: Record<string, any>;
}

export interface InvoiceData {
  id?: InvoiceId;
  patientId: PatientId;
  transactionIds: TransactionId[];
  invoiceNumber?: string;
  issueDate: Date;
  dueDate: Date;
  lineItems: InvoiceLineItem[];
  taxes?: TaxRate[];
  discountAmount?: Money;
  notes?: string;
  status?: InvoiceStatus;
  createdBy: UserId;
}

export class Invoice {
  private constructor(
    private readonly id: InvoiceId,
    private readonly patientId: PatientId,
    private readonly transactionIds: TransactionId[],
    private invoiceNumber: string | null,
    private readonly issueDate: Date,
    private readonly dueDate: Date,
    private readonly lineItems: InvoiceLineItem[],
    private readonly taxCalculator: TaxCalculator,
    private readonly discountAmount: Money,
    private readonly notes: string | null,
    private status: InvoiceStatus,
    private readonly createdBy: UserId,
    private readonly createdAt: Date,
    private updatedAt: Date
  ) {
    this.validate();
  }

  static create(data: InvoiceData): Invoice {
    const id = data.id || crypto.randomUUID();
    const now = new Date();
    const currency = data.lineItems[0]?.totalPrice.toJSON().currency || 'BRL';
    
    return new Invoice(
      id,
      data.patientId,
      data.transactionIds,
      data.invoiceNumber || null,
      data.issueDate,
      data.dueDate,
      data.lineItems,
      new TaxCalculator(data.taxes || []),
      data.discountAmount || Money.zero(currency),
      data.notes || null,
      data.status || InvoiceStatus.DRAFT,
      data.createdBy,
      now,
      now
    );
  }

  getId(): InvoiceId {
    return this.id;
  }

  getPatientId(): PatientId {
    return this.patientId;
  }

  getTransactionIds(): TransactionId[] {
    return [...this.transactionIds];
  }

  getInvoiceNumber(): string | null {
    return this.invoiceNumber;
  }

  getIssueDate(): Date {
    return this.issueDate;
  }

  getDueDate(): Date {
    return this.dueDate;
  }

  getLineItems(): InvoiceLineItem[] {
    return [...this.lineItems];
  }

  getDiscountAmount(): Money {
    return this.discountAmount;
  }

  getNotes(): string | null {
    return this.notes;
  }

  getStatus(): InvoiceStatus {
    return this.status;
  }

  getCreatedBy(): UserId {
    return this.createdBy;
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }

  getUpdatedAt(): Date {
    return this.updatedAt;
  }

  getSubtotal(): Money {
    if (this.lineItems.length === 0) {
      return Money.zero();
    }

    return this.lineItems.reduce((total, item) => {
      return total.add(item.totalPrice);
    }, Money.zero(this.lineItems[0].totalPrice.toJSON().currency));
  }

  getTotalTax(): Money {
    const subtotal = this.getSubtotal();
    const afterDiscount = subtotal.subtract(this.discountAmount);
    return this.taxCalculator.calculateTotalTax(afterDiscount);
  }

  getTaxBreakdown(): Array<{type: string, amount: Money, rate: number}> {
    const subtotal = this.getSubtotal();
    const afterDiscount = subtotal.subtract(this.discountAmount);
    return this.taxCalculator.getTaxBreakdown(afterDiscount);
  }

  getTotalAmount(): Money {
    const subtotal = this.getSubtotal();
    const afterDiscount = subtotal.subtract(this.discountAmount);
    const tax = this.getTotalTax();
    return afterDiscount.add(tax);
  }

  isDraft(): boolean {
    return this.status === InvoiceStatus.DRAFT;
  }

  isIssued(): boolean {
    return this.status === InvoiceStatus.ISSUED;
  }

  isPaid(): boolean {
    return this.status === InvoiceStatus.PAID;
  }

  isCancelled(): boolean {
    return this.status === InvoiceStatus.CANCELLED;
  }

  isOverdue(): boolean {
    return this.status === InvoiceStatus.OVERDUE || 
           (this.status === InvoiceStatus.ISSUED && this.dueDate < new Date());
  }

  canBeIssued(): boolean {
    return this.status === InvoiceStatus.DRAFT;
  }

  canBePaid(): boolean {
    return this.status === InvoiceStatus.ISSUED || this.status === InvoiceStatus.OVERDUE;
  }

  canBeCancelled(): boolean {
    return this.status === InvoiceStatus.DRAFT || this.status === InvoiceStatus.ISSUED;
  }

  issue(invoiceNumber: string): void {
    if (!this.canBeIssued()) {
      throw new DomainError(`Cannot issue invoice with status: ${this.status}`);
    }

    if (!invoiceNumber.trim()) {
      throw new DomainError('Invoice number is required');
    }

    this.invoiceNumber = invoiceNumber;
    this.status = InvoiceStatus.ISSUED;
    this.updatedAt = new Date();
  }

  markAsPaid(): void {
    if (!this.canBePaid()) {
      throw new DomainError(`Cannot mark invoice as paid with status: ${this.status}`);
    }

    this.status = InvoiceStatus.PAID;
    this.updatedAt = new Date();
  }

  markAsOverdue(): void {
    if (this.status !== InvoiceStatus.ISSUED) {
      throw new DomainError(`Cannot mark invoice as overdue with status: ${this.status}`);
    }

    this.status = InvoiceStatus.OVERDUE;
    this.updatedAt = new Date();
  }

  cancel(reason?: string): void {
    if (!this.canBeCancelled()) {
      throw new DomainError(`Cannot cancel invoice with status: ${this.status}`);
    }

    this.status = InvoiceStatus.CANCELLED;
    this.updatedAt = new Date();
  }

  getDaysOverdue(): number {
    if (!this.isOverdue()) {
      return 0;
    }

    const now = new Date();
    const diffTime = now.getTime() - this.dueDate.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  getDaysUntilDue(): number {
    const now = new Date();
    if (now > this.dueDate) {
      return 0;
    }
    const diffTime = this.dueDate.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  getFormattedInvoiceNumber(): string {
    if (!this.invoiceNumber) {
      return 'RASCUNHO';
    }
    return this.invoiceNumber;
  }

  addLineItem(item: Omit<InvoiceLineItem, 'id' | 'totalPrice'>): void {
    if (this.status !== InvoiceStatus.DRAFT) {
      throw new DomainError('Cannot modify issued invoice');
    }

    const lineItem: InvoiceLineItem = {
      id: crypto.randomUUID(),
      ...item,
      totalPrice: item.unitPrice.multiply(item.quantity)
    };

    this.lineItems.push(lineItem);
    this.updatedAt = new Date();
  }

  removeLineItem(itemId: string): void {
    if (this.status !== InvoiceStatus.DRAFT) {
      throw new DomainError('Cannot modify issued invoice');
    }

    const index = this.lineItems.findIndex(item => item.id === itemId);
    if (index === -1) {
      throw new DomainError('Line item not found');
    }

    this.lineItems.splice(index, 1);
    this.updatedAt = new Date();
  }

  toJSON() {
    return {
      id: this.id,
      patientId: this.patientId,
      transactionIds: this.transactionIds,
      invoiceNumber: this.invoiceNumber,
      formattedInvoiceNumber: this.getFormattedInvoiceNumber(),
      issueDate: this.issueDate.toISOString(),
      dueDate: this.dueDate.toISOString(),
      lineItems: this.lineItems,
      subtotal: this.getSubtotal().toJSON(),
      discountAmount: this.discountAmount.toJSON(),
      totalTax: this.getTotalTax().toJSON(),
      taxBreakdown: this.getTaxBreakdown(),
      totalAmount: this.getTotalAmount().toJSON(),
      notes: this.notes,
      status: this.status,
      daysOverdue: this.getDaysOverdue(),
      daysUntilDue: this.getDaysUntilDue(),
      createdBy: this.createdBy,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString()
    };
  }

  private validate(): void {
    if (!this.patientId) {
      throw new DomainError('Patient ID is required');
    }

    if (this.transactionIds.length === 0) {
      throw new DomainError('At least one transaction ID is required');
    }

    if (this.lineItems.length === 0) {
      throw new DomainError('At least one line item is required');
    }

    if (this.dueDate <= this.issueDate) {
      throw new DomainError('Due date must be after issue date');
    }

    if (!this.createdBy) {
      throw new DomainError('Created by user ID is required');
    }

    // Validate line items
    for (const item of this.lineItems) {
      if (!item.description.trim()) {
        throw new DomainError('Line item description is required');
      }
      
      if (item.quantity <= 0) {
        throw new DomainError('Line item quantity must be positive');
      }

      if (item.unitPrice.toNumber() <= 0) {
        throw new DomainError('Line item unit price must be positive');
      }

      const expectedTotal = item.unitPrice.multiply(item.quantity);
      if (!item.totalPrice.equals(expectedTotal)) {
        throw new DomainError('Line item total price is incorrect');
      }
    }

    // Validate discount amount
    const subtotal = this.getSubtotal();
    if (this.discountAmount.isGreaterThan(subtotal)) {
      throw new DomainError('Discount amount cannot be greater than subtotal');
    }
  }
}
