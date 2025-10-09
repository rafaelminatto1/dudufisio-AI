import { Money } from '../value-objects/Money';
import { TaxCalculator } from '../value-objects/TaxRate';
import { DomainError } from '../errors/DomainError';
export var InvoiceStatus;
(function (InvoiceStatus) {
    InvoiceStatus["DRAFT"] = "draft";
    InvoiceStatus["ISSUED"] = "issued";
    InvoiceStatus["PAID"] = "paid";
    InvoiceStatus["CANCELLED"] = "cancelled";
    InvoiceStatus["OVERDUE"] = "overdue";
})(InvoiceStatus || (InvoiceStatus = {}));
export class Invoice {
    constructor(id, patientId, transactionIds, invoiceNumber, issueDate, dueDate, lineItems, taxCalculator, discountAmount, notes, status, createdBy, createdAt, updatedAt) {
        this.id = id;
        this.patientId = patientId;
        this.transactionIds = transactionIds;
        this.invoiceNumber = invoiceNumber;
        this.issueDate = issueDate;
        this.dueDate = dueDate;
        this.lineItems = lineItems;
        this.taxCalculator = taxCalculator;
        this.discountAmount = discountAmount;
        this.notes = notes;
        this.status = status;
        this.createdBy = createdBy;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.validate();
    }
    static create(data) {
        const id = data.id || crypto.randomUUID();
        const now = new Date();
        const currency = data.lineItems[0]?.totalPrice.toJSON().currency || 'BRL';
        return new Invoice(id, data.patientId, data.transactionIds, data.invoiceNumber || null, data.issueDate, data.dueDate, data.lineItems, new TaxCalculator(data.taxes || []), data.discountAmount || Money.zero(currency), data.notes || null, data.status || InvoiceStatus.DRAFT, data.createdBy, now, now);
    }
    getId() {
        return this.id;
    }
    getPatientId() {
        return this.patientId;
    }
    getTransactionIds() {
        return [...this.transactionIds];
    }
    getInvoiceNumber() {
        return this.invoiceNumber;
    }
    getIssueDate() {
        return this.issueDate;
    }
    getDueDate() {
        return this.dueDate;
    }
    getLineItems() {
        return [...this.lineItems];
    }
    getDiscountAmount() {
        return this.discountAmount;
    }
    getNotes() {
        return this.notes;
    }
    getStatus() {
        return this.status;
    }
    getCreatedBy() {
        return this.createdBy;
    }
    getCreatedAt() {
        return this.createdAt;
    }
    getUpdatedAt() {
        return this.updatedAt;
    }
    getSubtotal() {
        if (this.lineItems.length === 0) {
            return Money.zero();
        }
        return this.lineItems.reduce((total, item) => {
            return total.add(item.totalPrice);
        }, Money.zero(this.lineItems[0].totalPrice.toJSON().currency));
    }
    getTotalTax() {
        const subtotal = this.getSubtotal();
        const afterDiscount = subtotal.subtract(this.discountAmount);
        return this.taxCalculator.calculateTotalTax(afterDiscount);
    }
    getTaxBreakdown() {
        const subtotal = this.getSubtotal();
        const afterDiscount = subtotal.subtract(this.discountAmount);
        return this.taxCalculator.getTaxBreakdown(afterDiscount);
    }
    getTotalAmount() {
        const subtotal = this.getSubtotal();
        const afterDiscount = subtotal.subtract(this.discountAmount);
        const tax = this.getTotalTax();
        return afterDiscount.add(tax);
    }
    isDraft() {
        return this.status === InvoiceStatus.DRAFT;
    }
    isIssued() {
        return this.status === InvoiceStatus.ISSUED;
    }
    isPaid() {
        return this.status === InvoiceStatus.PAID;
    }
    isCancelled() {
        return this.status === InvoiceStatus.CANCELLED;
    }
    isOverdue() {
        return this.status === InvoiceStatus.OVERDUE ||
            (this.status === InvoiceStatus.ISSUED && this.dueDate < new Date());
    }
    canBeIssued() {
        return this.status === InvoiceStatus.DRAFT;
    }
    canBePaid() {
        return this.status === InvoiceStatus.ISSUED || this.status === InvoiceStatus.OVERDUE;
    }
    canBeCancelled() {
        return this.status === InvoiceStatus.DRAFT || this.status === InvoiceStatus.ISSUED;
    }
    issue(invoiceNumber) {
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
    markAsPaid() {
        if (!this.canBePaid()) {
            throw new DomainError(`Cannot mark invoice as paid with status: ${this.status}`);
        }
        this.status = InvoiceStatus.PAID;
        this.updatedAt = new Date();
    }
    markAsOverdue() {
        if (this.status !== InvoiceStatus.ISSUED) {
            throw new DomainError(`Cannot mark invoice as overdue with status: ${this.status}`);
        }
        this.status = InvoiceStatus.OVERDUE;
        this.updatedAt = new Date();
    }
    cancel(reason) {
        if (!this.canBeCancelled()) {
            throw new DomainError(`Cannot cancel invoice with status: ${this.status}`);
        }
        this.status = InvoiceStatus.CANCELLED;
        this.updatedAt = new Date();
    }
    getDaysOverdue() {
        if (!this.isOverdue()) {
            return 0;
        }
        const now = new Date();
        const diffTime = now.getTime() - this.dueDate.getTime();
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
    getDaysUntilDue() {
        const now = new Date();
        if (now > this.dueDate) {
            return 0;
        }
        const diffTime = this.dueDate.getTime() - now.getTime();
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
    getFormattedInvoiceNumber() {
        if (!this.invoiceNumber) {
            return 'RASCUNHO';
        }
        return this.invoiceNumber;
    }
    addLineItem(item) {
        if (this.status !== InvoiceStatus.DRAFT) {
            throw new DomainError('Cannot modify issued invoice');
        }
        const lineItem = {
            id: crypto.randomUUID(),
            ...item,
            totalPrice: item.unitPrice.multiply(item.quantity)
        };
        this.lineItems.push(lineItem);
        this.updatedAt = new Date();
    }
    removeLineItem(itemId) {
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
    validate() {
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
