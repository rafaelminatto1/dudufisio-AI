import { Money } from '../value-objects/Money';
import { DomainError, BusinessRuleError } from '../errors/DomainError';
export var PaymentPlanStatus;
(function (PaymentPlanStatus) {
    PaymentPlanStatus["ACTIVE"] = "active";
    PaymentPlanStatus["COMPLETED"] = "completed";
    PaymentPlanStatus["CANCELLED"] = "cancelled";
    PaymentPlanStatus["SUSPENDED"] = "suspended";
    PaymentPlanStatus["DEFAULTED"] = "defaulted";
})(PaymentPlanStatus || (PaymentPlanStatus = {}));
export class PaymentPlan {
    constructor(id, patientId, totalAmount, installmentCount, paymentMethod, firstDueDate, description, interestRate, penaltyRate, installments, status, createdBy, createdAt, updatedAt) {
        this.id = id;
        this.patientId = patientId;
        this.totalAmount = totalAmount;
        this.installmentCount = installmentCount;
        this.paymentMethod = paymentMethod;
        this.firstDueDate = firstDueDate;
        this.description = description;
        this.interestRate = interestRate;
        this.penaltyRate = penaltyRate;
        this.installments = installments;
        this.status = status;
        this.createdBy = createdBy;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.validate();
    }
    static create(data) {
        const id = data.id || crypto.randomUUID();
        const now = new Date();
        const installments = PaymentPlan.generateInstallments(data.totalAmount, data.installmentCount, data.firstDueDate, data.interestRate || 0);
        return new PaymentPlan(id, data.patientId, data.totalAmount, data.installmentCount, data.paymentMethod, data.firstDueDate, data.description || null, data.interestRate || 0, data.penaltyRate || 0.02, // 2% default penalty
        installments, data.status || PaymentPlanStatus.ACTIVE, data.createdBy, now, now);
    }
    static generateInstallments(totalAmount, count, firstDueDate, interestRate) {
        const installments = [];
        // Calculate installment amount with compound interest
        let installmentAmount;
        if (interestRate > 0) {
            const factor = Math.pow(1 + interestRate, count);
            const monthlyPayment = totalAmount.multiply((interestRate * factor) / (factor - 1));
            installmentAmount = monthlyPayment;
        }
        else {
            installmentAmount = totalAmount.divide(count);
        }
        for (let i = 0; i < count; i++) {
            const dueDate = new Date(firstDueDate);
            dueDate.setMonth(dueDate.getMonth() + i);
            installments.push({
                id: crypto.randomUUID(),
                installmentNumber: i + 1,
                amount: installmentAmount,
                dueDate,
                status: 'pending'
            });
        }
        return installments;
    }
    getId() {
        return this.id;
    }
    getPatientId() {
        return this.patientId;
    }
    getTotalAmount() {
        return this.totalAmount;
    }
    getInstallmentCount() {
        return this.installmentCount;
    }
    getPaymentMethod() {
        return this.paymentMethod;
    }
    getFirstDueDate() {
        return this.firstDueDate;
    }
    getDescription() {
        return this.description;
    }
    getInterestRate() {
        return this.interestRate;
    }
    getPenaltyRate() {
        return this.penaltyRate;
    }
    getInstallments() {
        return [...this.installments];
    }
    getStatus() {
        return this.status;
    }
    getCreatedAt() {
        return this.createdAt;
    }
    getUpdatedAt() {
        return this.updatedAt;
    }
    getPaidAmount() {
        return this.installments
            .filter(inst => inst.status === 'paid')
            .reduce((total, inst) => total.add(inst.amount), Money.zero(this.totalAmount.toJSON().currency));
    }
    getRemainingAmount() {
        return this.getTotalWithInterest().subtract(this.getPaidAmount());
    }
    getTotalWithInterest() {
        return this.installments.reduce((total, inst) => total.add(inst.amount), Money.zero(this.totalAmount.toJSON().currency));
    }
    getPaidInstallmentCount() {
        return this.installments.filter(inst => inst.status === 'paid').length;
    }
    getOverdueInstallmentCount() {
        return this.installments.filter(inst => inst.status === 'overdue').length;
    }
    getNextInstallment() {
        return this.installments.find(inst => inst.status === 'pending') || null;
    }
    getOverdueInstallments() {
        return this.installments.filter(inst => inst.status === 'overdue');
    }
    isActive() {
        return this.status === PaymentPlanStatus.ACTIVE;
    }
    isCompleted() {
        return this.status === PaymentPlanStatus.COMPLETED;
    }
    isCancelled() {
        return this.status === PaymentPlanStatus.CANCELLED;
    }
    isSuspended() {
        return this.status === PaymentPlanStatus.SUSPENDED;
    }
    isDefaulted() {
        return this.status === PaymentPlanStatus.DEFAULTED;
    }
    getCompletionPercentage() {
        if (this.installmentCount === 0)
            return 0;
        return (this.getPaidInstallmentCount() / this.installmentCount) * 100;
    }
    payInstallment(installmentId, paidDate, transactionId) {
        if (!this.isActive()) {
            throw new BusinessRuleError(`Cannot pay installment for ${this.status} payment plan`);
        }
        const installment = this.installments.find(inst => inst.id === installmentId);
        if (!installment) {
            throw new DomainError('Installment not found');
        }
        if (installment.status === 'paid') {
            throw new BusinessRuleError('Installment is already paid');
        }
        if (installment.status === 'cancelled') {
            throw new BusinessRuleError('Cannot pay cancelled installment');
        }
        installment.status = 'paid';
        installment.paidDate = paidDate;
        installment.transactionId = transactionId;
        this.updatedAt = new Date();
        // Check if all installments are paid
        const allPaid = this.installments.every(inst => inst.status === 'paid' || inst.status === 'cancelled');
        if (allPaid) {
            this.status = PaymentPlanStatus.COMPLETED;
        }
    }
    markInstallmentOverdue(installmentId) {
        const installment = this.installments.find(inst => inst.id === installmentId);
        if (!installment) {
            throw new DomainError('Installment not found');
        }
        if (installment.status !== 'pending') {
            return; // Only pending installments can become overdue
        }
        installment.status = 'overdue';
        this.updatedAt = new Date();
        // Check for default condition (e.g., 3 overdue installments)
        const overdueCount = this.getOverdueInstallmentCount();
        if (overdueCount >= 3) {
            this.status = PaymentPlanStatus.DEFAULTED;
        }
    }
    cancel(reason) {
        if (this.status === PaymentPlanStatus.COMPLETED) {
            throw new BusinessRuleError('Cannot cancel completed payment plan');
        }
        if (this.status === PaymentPlanStatus.CANCELLED) {
            return; // Already cancelled
        }
        // Cancel all pending installments
        this.installments
            .filter(inst => inst.status === 'pending' || inst.status === 'overdue')
            .forEach(inst => {
            inst.status = 'cancelled';
        });
        this.status = PaymentPlanStatus.CANCELLED;
        this.updatedAt = new Date();
    }
    suspend(reason) {
        if (!this.isActive()) {
            throw new BusinessRuleError(`Cannot suspend ${this.status} payment plan`);
        }
        this.status = PaymentPlanStatus.SUSPENDED;
        this.updatedAt = new Date();
    }
    reactivate() {
        if (this.status !== PaymentPlanStatus.SUSPENDED) {
            throw new BusinessRuleError(`Cannot reactivate ${this.status} payment plan`);
        }
        this.status = PaymentPlanStatus.ACTIVE;
        this.updatedAt = new Date();
    }
    calculatePenalty(installment) {
        if (installment.status !== 'overdue') {
            return Money.zero(this.totalAmount.toJSON().currency);
        }
        const now = new Date();
        const daysOverdue = Math.ceil((now.getTime() - installment.dueDate.getTime()) / (1000 * 60 * 60 * 24));
        if (daysOverdue <= 0) {
            return Money.zero(this.totalAmount.toJSON().currency);
        }
        // Simple penalty calculation: penalty rate * installment amount
        return installment.amount.multiply(this.penaltyRate);
    }
    getTotalPenalties() {
        return this.installments
            .filter(inst => inst.status === 'overdue')
            .reduce((total, inst) => {
            return total.add(this.calculatePenalty(inst));
        }, Money.zero(this.totalAmount.toJSON().currency));
    }
    toJSON() {
        return {
            id: this.id,
            patientId: this.patientId,
            totalAmount: this.totalAmount.toJSON(),
            totalWithInterest: this.getTotalWithInterest().toJSON(),
            installmentCount: this.installmentCount,
            paymentMethod: this.paymentMethod.toJSON(),
            firstDueDate: this.firstDueDate.toISOString(),
            description: this.description,
            interestRate: this.interestRate,
            penaltyRate: this.penaltyRate,
            installments: this.installments.map(inst => ({
                ...inst,
                amount: inst.amount.toJSON(),
                dueDate: inst.dueDate.toISOString(),
                paidDate: inst.paidDate?.toISOString() || null,
                penalty: this.calculatePenalty(inst).toJSON()
            })),
            status: this.status,
            paidAmount: this.getPaidAmount().toJSON(),
            remainingAmount: this.getRemainingAmount().toJSON(),
            paidInstallmentCount: this.getPaidInstallmentCount(),
            overdueInstallmentCount: this.getOverdueInstallmentCount(),
            completionPercentage: this.getCompletionPercentage(),
            totalPenalties: this.getTotalPenalties().toJSON(),
            nextInstallment: this.getNextInstallment(),
            createdBy: this.createdBy,
            createdAt: this.createdAt.toISOString(),
            updatedAt: this.updatedAt.toISOString()
        };
    }
    validate() {
        if (!this.patientId) {
            throw new DomainError('Patient ID is required');
        }
        if (!this.createdBy) {
            throw new DomainError('Created by user ID is required');
        }
        if (this.installmentCount < 1 || this.installmentCount > 12) {
            throw new DomainError('Installment count must be between 1 and 12');
        }
        if (this.totalAmount.isZero() || this.totalAmount.toNumber() < 0) {
            throw new DomainError('Total amount must be positive');
        }
        if (this.interestRate < 0 || this.interestRate > 0.5) {
            throw new DomainError('Interest rate must be between 0% and 50%');
        }
        if (this.penaltyRate < 0 || this.penaltyRate > 0.1) {
            throw new DomainError('Penalty rate must be between 0% and 10%');
        }
        if (!this.paymentMethod.supportsInstallments() && this.installmentCount > 1) {
            throw new DomainError('Payment method does not support installments');
        }
        if (this.installments.length !== this.installmentCount) {
            throw new DomainError('Installment count mismatch');
        }
    }
}
