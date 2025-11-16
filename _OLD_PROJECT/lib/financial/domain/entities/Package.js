import { Money } from '../value-objects/Money';
import { DomainError, BusinessRuleError } from '../errors/DomainError';
export var PackageType;
(function (PackageType) {
    PackageType["SESSIONS_10"] = "sessions_10";
    PackageType["SESSIONS_20"] = "sessions_20";
    PackageType["MONTHLY_UNLIMITED"] = "monthly_unlimited";
    PackageType["EVALUATION_ONLY"] = "evaluation_only";
})(PackageType || (PackageType = {}));
export var PackageStatus;
(function (PackageStatus) {
    PackageStatus["ACTIVE"] = "active";
    PackageStatus["EXPIRED"] = "expired";
    PackageStatus["CANCELLED"] = "cancelled";
    PackageStatus["SUSPENDED"] = "suspended";
})(PackageStatus || (PackageStatus = {}));
export class SessionCount {
    constructor(count) {
        this.count = count;
        if (count < 0) {
            throw new DomainError('Session count cannot be negative');
        }
    }
    static zero() {
        return new SessionCount(0);
    }
    static create(count) {
        return new SessionCount(count);
    }
    toNumber() {
        return this.count;
    }
    isZero() {
        return this.count === 0;
    }
    decrement() {
        if (this.count === 0) {
            throw new DomainError('Cannot decrement zero session count');
        }
        return new SessionCount(this.count - 1);
    }
    add(other) {
        return new SessionCount(this.count + other.count);
    }
    equals(other) {
        return this.count === other.count;
    }
}
export class Package {
    constructor(id, patientId, transactionId, type, totalSessions, usedSessions, price, purchaseDate, expiryDate, status, createdAt, updatedAt) {
        this.id = id;
        this.patientId = patientId;
        this.transactionId = transactionId;
        this.type = type;
        this.totalSessions = totalSessions;
        this.usedSessions = usedSessions;
        this.price = price;
        this.purchaseDate = purchaseDate;
        this.expiryDate = expiryDate;
        this.status = status;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.validate();
    }
    static create(data) {
        const id = data.id || crypto.randomUUID();
        const now = new Date();
        return new Package(id, data.patientId, data.transactionId, data.type, SessionCount.create(data.totalSessions), SessionCount.create(data.usedSessions || 0), data.price, data.purchaseDate, data.expiryDate, data.status || PackageStatus.ACTIVE, now, now);
    }
    getId() {
        return this.id;
    }
    getPatientId() {
        return this.patientId;
    }
    getTransactionId() {
        return this.transactionId;
    }
    getType() {
        return this.type;
    }
    getTotalSessions() {
        return this.totalSessions.toNumber();
    }
    getUsedSessions() {
        return this.usedSessions.toNumber();
    }
    getRemainingSessions() {
        return this.totalSessions.toNumber() - this.usedSessions.toNumber();
    }
    getPrice() {
        return this.price;
    }
    getPurchaseDate() {
        return this.purchaseDate;
    }
    getExpiryDate() {
        return this.expiryDate;
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
    isActive() {
        return this.status === PackageStatus.ACTIVE;
    }
    isExpired() {
        return this.status === PackageStatus.EXPIRED || new Date() > this.expiryDate;
    }
    isCancelled() {
        return this.status === PackageStatus.CANCELLED;
    }
    isSuspended() {
        return this.status === PackageStatus.SUSPENDED;
    }
    hasRemainingSessions() {
        return this.getRemainingessions() > 0;
    }
    canConsumeSession() {
        return this.isActive() &&
            this.hasRemainingSessions() &&
            !this.isExpired();
    }
    consumeSession() {
        if (!this.canConsumeSession()) {
            if (!this.isActive()) {
                throw new BusinessRuleError(`Cannot consume session from ${this.status} package`);
            }
            if (this.isExpired()) {
                throw new BusinessRuleError('Package has expired');
            }
            if (!this.hasRemainingSessions()) {
                throw new BusinessRuleError('No sessions remaining in package');
            }
        }
        this.usedSessions = this.usedSessions.add(SessionCount.create(1));
        this.updatedAt = new Date();
        // Auto-expire if no sessions remaining
        if (!this.hasRemainingSessions()) {
            this.status = PackageStatus.EXPIRED;
        }
    }
    getRemainingValue() {
        if (this.totalSessions.isZero()) {
            return Money.zero(this.price.toJSON().currency);
        }
        const sessionValue = this.price.divide(this.totalSessions.toNumber());
        return sessionValue.multiply(this.getRemainingessions());
    }
    getSessionValue() {
        if (this.totalSessions.isZero()) {
            return Money.zero(this.price.toJSON().currency);
        }
        return this.price.divide(this.totalSessions.toNumber());
    }
    getUsagePercentage() {
        if (this.totalSessions.isZero()) {
            return 0;
        }
        return (this.usedSessions.toNumber() / this.totalSessions.toNumber()) * 100;
    }
    getDaysUntilExpiry() {
        const nowMs = Date.now();
        const expiryMs = this.expiryDate.getTime();
        if (nowMs > expiryMs) {
            return 0;
        }
        const diffTime = expiryMs - nowMs;
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
    getDaysSincePurchase() {
        const nowMs = Date.now();
        const diffTime = nowMs - this.purchaseDate.getTime();
        return Math.floor(diffTime / (1000 * 60 * 60 * 24));
    }
    expire() {
        if (this.status === PackageStatus.EXPIRED) {
            return; // Already expired
        }
        if (this.status !== PackageStatus.ACTIVE) {
            throw new BusinessRuleError(`Cannot expire package with status: ${this.status}`);
        }
        this.status = PackageStatus.EXPIRED;
        this.updatedAt = new Date();
    }
    cancel(reason) {
        if (this.status === PackageStatus.CANCELLED) {
            return; // Already cancelled
        }
        if (this.status === PackageStatus.EXPIRED) {
            throw new BusinessRuleError('Cannot cancel expired package');
        }
        this.status = PackageStatus.CANCELLED;
        this.updatedAt = new Date();
    }
    suspend(reason) {
        if (!this.isActive()) {
            throw new BusinessRuleError(`Cannot suspend package with status: ${this.status}`);
        }
        this.status = PackageStatus.SUSPENDED;
        this.updatedAt = new Date();
    }
    reactivate() {
        if (this.status !== PackageStatus.SUSPENDED) {
            throw new BusinessRuleError(`Cannot reactivate package with status: ${this.status}`);
        }
        if (this.isExpired()) {
            throw new BusinessRuleError('Cannot reactivate expired package');
        }
        this.status = PackageStatus.ACTIVE;
        this.updatedAt = new Date();
    }
    getTypeDisplayName() {
        switch (this.type) {
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
    toJSON() {
        return {
            id: this.id,
            patientId: this.patientId,
            transactionId: this.transactionId,
            type: this.type,
            typeDisplayName: this.getTypeDisplayName(),
            totalSessions: this.totalSessions.toNumber(),
            usedSessions: this.usedSessions.toNumber(),
            remainingSessions: this.getRemainingessions(),
            price: this.price.toJSON(),
            remainingValue: this.getRemainingValue().toJSON(),
            sessionValue: this.getSessionValue().toJSON(),
            purchaseDate: this.purchaseDate.toISOString(),
            expiryDate: this.expiryDate.toISOString(),
            status: this.status,
            usagePercentage: this.getUsagePercentage(),
            daysUntilExpiry: this.getDaysUntilExpiry(),
            daysSincePurchase: this.getDaysSincePurchase(),
            createdAt: this.createdAt.toISOString(),
            updatedAt: this.updatedAt.toISOString()
        };
    }
    validate() {
        if (!this.patientId) {
            throw new DomainError('Patient ID is required');
        }
        if (!this.transactionId) {
            throw new DomainError('Transaction ID is required');
        }
        if (this.totalSessions.toNumber() <= 0) {
            throw new DomainError('Total sessions must be positive');
        }
        if (this.usedSessions.toNumber() > this.totalSessions.toNumber()) {
            throw new DomainError('Used sessions cannot exceed total sessions');
        }
        if (this.expiryDate <= this.purchaseDate) {
            throw new DomainError('Expiry date must be after purchase date');
        }
        if (this.price.isZero() || this.price.toNumber() < 0) {
            throw new DomainError('Package price must be positive');
        }
    }
    getRemainingessions() {
        return Math.max(0, this.totalSessions.toNumber() - this.usedSessions.toNumber());
    }
}
