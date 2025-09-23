import { Money } from '../value-objects/Money';
import { DomainError, BusinessRuleError } from '../errors/DomainError';
import { TransactionId, PatientId } from './Transaction';

export type PackageId = string;

export enum PackageType {
  SESSIONS_10 = 'sessions_10',
  SESSIONS_20 = 'sessions_20',
  MONTHLY_UNLIMITED = 'monthly_unlimited',
  EVALUATION_ONLY = 'evaluation_only'
}

export enum PackageStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled',
  SUSPENDED = 'suspended'
}

export class SessionCount {
  constructor(private readonly count: number) {
    if (count < 0) {
      throw new DomainError('Session count cannot be negative');
    }
  }

  static zero(): SessionCount {
    return new SessionCount(0);
  }

  static create(count: number): SessionCount {
    return new SessionCount(count);
  }

  toNumber(): number {
    return this.count;
  }

  isZero(): boolean {
    return this.count === 0;
  }

  decrement(): SessionCount {
    if (this.count === 0) {
      throw new DomainError('Cannot decrement zero session count');
    }
    return new SessionCount(this.count - 1);
  }

  add(other: SessionCount): SessionCount {
    return new SessionCount(this.count + other.count);
  }

  equals(other: SessionCount): boolean {
    return this.count === other.count;
  }
}

export interface PackageData {
  id?: PackageId;
  patientId: PatientId;
  transactionId: TransactionId;
  type: PackageType;
  totalSessions: number;
  usedSessions?: number;
  price: Money;
  purchaseDate: Date;
  expiryDate: Date;
  status?: PackageStatus;
}

export class Package {
  private constructor(
    private readonly id: PackageId,
    private readonly patientId: PatientId,
    private readonly transactionId: TransactionId,
    private readonly type: PackageType,
    private readonly totalSessions: SessionCount,
    private usedSessions: SessionCount,
    private readonly price: Money,
    private readonly purchaseDate: Date,
    private readonly expiryDate: Date,
    private status: PackageStatus,
    private readonly createdAt: Date,
    private updatedAt: Date
  ) {
    this.validate();
  }

  static create(data: PackageData): Package {
    const id = data.id || crypto.randomUUID();
    const now = new Date();
    
    return new Package(
      id,
      data.patientId,
      data.transactionId,
      data.type,
      SessionCount.create(data.totalSessions),
      SessionCount.create(data.usedSessions || 0),
      data.price,
      data.purchaseDate,
      data.expiryDate,
      data.status || PackageStatus.ACTIVE,
      now,
      now
    );
  }

  getId(): PackageId {
    return this.id;
  }

  getPatientId(): PatientId {
    return this.patientId;
  }

  getTransactionId(): TransactionId {
    return this.transactionId;
  }

  getType(): PackageType {
    return this.type;
  }

  getTotalSessions(): number {
    return this.totalSessions.toNumber();
  }

  getUsedSessions(): number {
    return this.usedSessions.toNumber();
  }

  getRemainingSessions(): number {
    return this.totalSessions.toNumber() - this.usedSessions.toNumber();
  }

  getPrice(): Money {
    return this.price;
  }

  getPurchaseDate(): Date {
    return this.purchaseDate;
  }

  getExpiryDate(): Date {
    return this.expiryDate;
  }

  getStatus(): PackageStatus {
    return this.status;
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }

  getUpdatedAt(): Date {
    return this.updatedAt;
  }

  isActive(): boolean {
    return this.status === PackageStatus.ACTIVE;
  }

  isExpired(): boolean {
    return this.status === PackageStatus.EXPIRED || new Date() > this.expiryDate;
  }

  isCancelled(): boolean {
    return this.status === PackageStatus.CANCELLED;
  }

  isSuspended(): boolean {
    return this.status === PackageStatus.SUSPENDED;
  }

  hasRemainingSessions(): boolean {
    return this.getRemainingessions() > 0;
  }

  canConsumeSession(): boolean {
    return this.isActive() && 
           this.hasRemainingSessions() && 
           !this.isExpired();
  }

  consumeSession(): void {
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

  getRemainingValue(): Money {
    if (this.totalSessions.isZero()) {
      return Money.zero(this.price.toJSON().currency);
    }

    const sessionValue = this.price.divide(this.totalSessions.toNumber());
    return sessionValue.multiply(this.getRemainingessions());
  }

  getSessionValue(): Money {
    if (this.totalSessions.isZero()) {
      return Money.zero(this.price.toJSON().currency);
    }
    return this.price.divide(this.totalSessions.toNumber());
  }

  getUsagePercentage(): number {
    if (this.totalSessions.isZero()) {
      return 0;
    }
    return (this.usedSessions.toNumber() / this.totalSessions.toNumber()) * 100;
  }

  getDaysUntilExpiry(): number {
    const now = new Date();
    if (now > this.expiryDate) {
      return 0;
    }
    const diffTime = this.expiryDate.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  getDaysSincePurchase(): number {
    const now = new Date();
    const diffTime = now.getTime() - this.purchaseDate.getTime();
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  }

  expire(): void {
    if (this.status === PackageStatus.EXPIRED) {
      return; // Already expired
    }

    if (this.status !== PackageStatus.ACTIVE) {
      throw new BusinessRuleError(`Cannot expire package with status: ${this.status}`);
    }

    this.status = PackageStatus.EXPIRED;
    this.updatedAt = new Date();
  }

  cancel(reason?: string): void {
    if (this.status === PackageStatus.CANCELLED) {
      return; // Already cancelled
    }

    if (this.status === PackageStatus.EXPIRED) {
      throw new BusinessRuleError('Cannot cancel expired package');
    }

    this.status = PackageStatus.CANCELLED;
    this.updatedAt = new Date();
  }

  suspend(reason?: string): void {
    if (!this.isActive()) {
      throw new BusinessRuleError(`Cannot suspend package with status: ${this.status}`);
    }

    this.status = PackageStatus.SUSPENDED;
    this.updatedAt = new Date();
  }

  reactivate(): void {
    if (this.status !== PackageStatus.SUSPENDED) {
      throw new BusinessRuleError(`Cannot reactivate package with status: ${this.status}`);
    }

    if (this.isExpired()) {
      throw new BusinessRuleError('Cannot reactivate expired package');
    }

    this.status = PackageStatus.ACTIVE;
    this.updatedAt = new Date();
  }

  getTypeDisplayName(): string {
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

  private validate(): void {
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

  private getRemainingessions(): number {
    return Math.max(0, this.totalSessions.toNumber() - this.usedSessions.toNumber());
  }
}