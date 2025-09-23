import { Transaction, TransactionId, PatientId } from '../entities/Transaction';
import { Package, PackageId } from '../entities/Package';
import { Invoice, InvoiceId } from '../entities/Invoice';
import { PaymentPlan, PaymentPlanId } from '../entities/PaymentPlan';

export interface DateRange {
  start: Date;
  end: Date;
}

export interface TransactionFilters {
  patientId?: PatientId;
  status?: string;
  type?: string;
  dateRange?: DateRange;
  paymentMethod?: string;
  minAmount?: number;
  maxAmount?: number;
  limit?: number;
  offset?: number;
}

export interface PackageFilters {
  patientId?: PatientId;
  status?: string;
  type?: string;
  expiryDateRange?: DateRange;
  hasRemainingSessions?: boolean;
  limit?: number;
  offset?: number;
}

export interface InvoiceFilters {
  patientId?: PatientId;
  status?: string;
  dateRange?: DateRange;
  overdueOnly?: boolean;
  limit?: number;
  offset?: number;
}

export interface PaymentPlanFilters {
  patientId?: PatientId;
  status?: string;
  overdueOnly?: boolean;
  limit?: number;
  offset?: number;
}

export interface IFinancialTransaction {
  saveTransaction(transaction: Transaction): Promise<void>;
  savePackage(package: Package): Promise<void>;
  saveInstallments(installments: Transaction[]): Promise<void>;
  saveInvoice(invoice: Invoice): Promise<void>;
  savePaymentPlan(paymentPlan: PaymentPlan): Promise<void>;
  commit(): Promise<void>;
  rollback(): Promise<void>;
}

export interface IFinancialRepository {
  // Transaction operations
  saveTransaction(transaction: Transaction): Promise<void>;
  findTransactionById(id: TransactionId): Promise<Transaction | null>;
  findTransactionsByPatient(patientId: PatientId, filters?: TransactionFilters): Promise<Transaction[]>;
  findTransactions(filters: TransactionFilters): Promise<Transaction[]>;
  updateTransaction(transaction: Transaction): Promise<void>;
  deleteTransaction(id: TransactionId): Promise<void>;

  // Package operations
  savePackage(package: Package): Promise<void>;
  findPackageById(id: PackageId): Promise<Package | null>;
  findPackagesByPatient(patientId: PatientId, filters?: PackageFilters): Promise<Package[]>;
  findActivePackagesByPatient(patientId: PatientId): Promise<Package[]>;
  findExpiringPackages(daysUntilExpiry: number): Promise<Package[]>;
  updatePackage(package: Package): Promise<void>;
  deletePackage(id: PackageId): Promise<void>;

  // Invoice operations
  saveInvoice(invoice: Invoice): Promise<void>;
  findInvoiceById(id: InvoiceId): Promise<Invoice | null>;
  findInvoicesByPatient(patientId: PatientId, filters?: InvoiceFilters): Promise<Invoice[]>;
  findOverdueInvoices(): Promise<Invoice[]>;
  updateInvoice(invoice: Invoice): Promise<void>;
  deleteInvoice(id: InvoiceId): Promise<void>;
  generateInvoiceNumber(): Promise<string>;

  // Payment Plan operations
  savePaymentPlan(paymentPlan: PaymentPlan): Promise<void>;
  findPaymentPlanById(id: PaymentPlanId): Promise<PaymentPlan | null>;
  findPaymentPlansByPatient(patientId: PatientId, filters?: PaymentPlanFilters): Promise<PaymentPlan[]>;
  findOverduePaymentPlans(): Promise<PaymentPlan[]>;
  updatePaymentPlan(paymentPlan: PaymentPlan): Promise<void>;
  deletePaymentPlan(id: PaymentPlanId): Promise<void>;

  // Analytics and reporting
  getTotalRevenue(period: DateRange): Promise<number>;
  getRevenueByPeriod(period: DateRange, groupBy: 'day' | 'week' | 'month'): Promise<Array<{date: string, revenue: number}>>;
  getTopPatientsByRevenue(limit: number, period?: DateRange): Promise<Array<{patientId: PatientId, revenue: number}>>;
  getPaymentMethodStats(period?: DateRange): Promise<Array<{method: string, count: number, revenue: number}>>;
  getOverdueStats(): Promise<{count: number, totalAmount: number, averageDaysOverdue: number}>;
  
  // Transaction support
  withTransaction<T>(callback: (tx: IFinancialTransaction) => Promise<T>): Promise<T>;

  // Raw query support for complex analytics
  query(sql: string, params: any[]): Promise<any[]>;
}