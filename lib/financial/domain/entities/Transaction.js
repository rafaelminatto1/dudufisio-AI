import { Money } from '../value-objects/Money';
import { DomainError, BusinessRuleError } from '../errors/DomainError';
export var TransactionType;
(function (TransactionType) {
    TransactionType["PACKAGE_PURCHASE"] = "package_purchase";
    TransactionType["SINGLE_SESSION"] = "single_session";
    TransactionType["INSTALLMENT"] = "installment";
    TransactionType["REFUND"] = "refund";
    TransactionType["ADJUSTMENT"] = "adjustment";
    TransactionType["EXPENSE"] = "expense";
})(TransactionType || (TransactionType = {}));
export var TransactionStatus;
(function (TransactionStatus) {
    TransactionStatus["PENDING"] = "pending";
    TransactionStatus["PAID"] = "paid";
    TransactionStatus["OVERDUE"] = "overdue";
    TransactionStatus["CANCELLED"] = "cancelled";
    TransactionStatus["REFUNDED"] = "refunded";
})(TransactionStatus || (TransactionStatus = {}));
export class Transaction {
    constructor(id, patientId, type, amount, paymentMethod, installments, installmentNumber, dueDate, paidDate, status, gatewayTransactionId, gatewayResponse, description, metadata, fiscalDocumentNumber, taxAmount, createdBy, updatedBy, createdAt, updatedAt, version) {
        this.id = id;
        this.patientId = patientId;
        this.type = type;
        this.amount = amount;
        this.paymentMethod = paymentMethod;
        this.installments = installments;
        this.installmentNumber = installmentNumber;
        this.dueDate = dueDate;
        this.paidDate = paidDate;
        this.status = status;
        this.gatewayTransactionId = gatewayTransactionId;
        this.gatewayResponse = gatewayResponse;
        this.description = description;
        this.metadata = metadata;
        this.fiscalDocumentNumber = fiscalDocumentNumber;
        this.taxAmount = taxAmount;
        this.createdBy = createdBy;
        this.updatedBy = updatedBy;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.version = version;
        this.validate();
    }
    static create(data) {
        const id = data.id || crypto.randomUUID();
        const now = new Date();
        const installments = data.installments ?? 1;
        const installmentNumber = data.installmentNumber ?? 1;
        const taxAmount = data.taxAmount ?? Money.zero(data.amount.toJSON().currency);
        return new Transaction(id, data.patientId, data.type, data.amount, data.paymentMethod, installments, installmentNumber, data.dueDate, data.paidDate || null, data.status || TransactionStatus.PENDING, data.gatewayTransactionId || null, data.gatewayResponse || null, data.description || null, data.metadata || {}, data.fiscalDocumentNumber || null, taxAmount, data.createdBy, data.updatedBy || null, now, now, 1);
    }
    getId() {
        return this.id;
    }
    getPatientId() {
        return this.patientId;
    }
    getType() {
        return this.type;
    }
    getAmount() {
        return this.amount;
    }
    getNetAmount() {
        return this.amount.subtract(this.taxAmount);
    }
    getTaxAmount() {
        return this.taxAmount;
    }
    getPaymentMethod() {
        return this.paymentMethod;
    }
    getInstallments() {
        return this.installments;
    }
    getInstallmentNumber() {
        return this.installmentNumber;
    }
    getDueDate() {
        return this.dueDate;
    }
    getPaidDate() {
        return this.paidDate;
    }
    getStatus() {
        return this.status;
    }
    getDescription() {
        return this.description;
    }
    getMetadata() {
        return { ...this.metadata };
    }
    getFiscalDocumentNumber() {
        return this.fiscalDocumentNumber;
    }
    getGatewayTransactionId() {
        return this.gatewayTransactionId;
    }
    getGatewayResponse() {
        return this.gatewayResponse;
    }
    getCreatedAt() {
        return this.createdAt;
    }
    getUpdatedAt() {
        return this.updatedAt;
    }
    getVersion() {
        return this.version;
    }
    isPaid() {
        return this.status === TransactionStatus.PAID;
    }
    isPending() {
        return this.status === TransactionStatus.PENDING;
    }
    isOverdue() {
        return this.status === TransactionStatus.OVERDUE ||
            (this.status === TransactionStatus.PENDING && this.dueDate < new Date());
    }
    isCancelled() {
        return this.status === TransactionStatus.CANCELLED;
    }
    isRefunded() {
        return this.status === TransactionStatus.REFUNDED;
    }
    canBePaid() {
        return this.status === TransactionStatus.PENDING || this.status === TransactionStatus.OVERDUE;
    }
    canBeCancelled() {
        return this.status === TransactionStatus.PENDING;
    }
    canBeRefunded() {
        return this.status === TransactionStatus.PAID;
    }
    markAsPaid(paidDate, gatewayTransactionId, gatewayResponse) {
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
    markAsOverdue() {
        if (this.status !== TransactionStatus.PENDING) {
            throw new BusinessRuleError(`Cannot mark transaction as overdue. Current status: ${this.status}`);
        }
        this.status = TransactionStatus.OVERDUE;
        this.updatedAt = new Date();
        this.version++;
    }
    cancel(reason) {
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
    refund(refundAmount, reason) {
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
    setFiscalDocumentNumber(documentNumber) {
        if (!documentNumber.trim()) {
            throw new DomainError('Fiscal document number cannot be empty');
        }
        this.fiscalDocumentNumber = documentNumber;
        this.updatedAt = new Date();
        this.version++;
    }
    updateGatewayResponse(response) {
        this.gatewayResponse = { ...this.gatewayResponse, ...response };
        this.metadata.gatewayResponse = {
            ...this.metadata.gatewayResponse,
            ...response
        };
        this.updatedAt = new Date();
        this.version++;
    }
    getDaysOverdue() {
        if (!this.isOverdue()) {
            return 0;
        }
        const now = new Date();
        const diffTime = now.getTime() - this.dueDate.getTime();
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
    getInstallmentDescription() {
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
    validate() {
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
