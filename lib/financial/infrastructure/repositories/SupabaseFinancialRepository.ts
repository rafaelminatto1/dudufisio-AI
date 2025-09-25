import { SupabaseClient } from '@supabase/supabase-js';
import { Money } from '../../domain/value-objects/Money';
import { PaymentMethod, PaymentMethodType } from '../../domain/value-objects/PaymentMethod';
import { Transaction, TransactionId, PatientId, TransactionType, TransactionStatus } from '../../domain/entities/Transaction';
import { Package, PackageId, PackageType, PackageStatus } from '../../domain/entities/Package';
import { Invoice, InvoiceId, InvoiceStatus } from '../../domain/entities/Invoice';
import { PaymentPlan, PaymentPlanId, PaymentPlanStatus } from '../../domain/entities/PaymentPlan';
import { 
  IFinancialRepository, 
  IFinancialTransaction, 
  DateRange, 
  TransactionFilters,
  PackageFilters,
  InvoiceFilters,
  PaymentPlanFilters
} from '../../domain/repositories/IFinancialRepository';
import { DomainError } from '../../domain/errors/DomainError';

interface SupabaseTransaction {
  id: string;
  patient_id: string;
  type: string;
  amount: number;
  currency: string;
  payment_method: any;
  installments: number;
  installment_number: number;
  due_date: string;
  paid_date: string | null;
  status: string;
  gateway_transaction_id: string | null;
  gateway_response: any;
  description: string | null;
  metadata: any;
  fiscal_document_number: string | null;
  tax_amount: number;
  net_amount: number;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string | null;
  version: number;
}

interface SupabasePackage {
  id: string;
  patient_id: string;
  transaction_id: string;
  package_type: string;
  total_sessions: number;
  used_sessions: number;
  remaining_sessions: number;
  purchase_date: string;
  expiry_date: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface SupabaseInvoice {
  id: string;
  patient_id: string;
  transaction_ids: string[];
  invoice_number: string | null;
  issue_date: string;
  due_date: string;
  line_items: any[];
  subtotal: number;
  discount_amount: number;
  tax_amount: number;
  total_amount: number;
  notes: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  created_by: string;
}

interface SupabasePaymentPlan {
  id: string;
  patient_id: string;
  total_amount: number;
  installment_count: number;
  payment_method: any;
  first_due_date: string;
  description: string | null;
  interest_rate: number;
  penalty_rate: number;
  installments: any[];
  status: string;
  created_at: string;
  updated_at: string;
  created_by: string;
}

export class SupabaseFinancialTransaction implements IFinancialTransaction {
  private operations: Array<() => Promise<void>> = [];

  constructor(private readonly client: SupabaseClient) {}

  async saveTransaction(transaction: Transaction): Promise<void> {
    this.operations.push(async () => {
      const data = this.transactionToSupabase(transaction);
      const { error } = await this.client
        .from('financial_transactions')
        .upsert(data);
      
      if (error) {
        throw new DomainError(`Failed to save transaction: ${error.message}`);
      }
    });
  }

  async savePackage(package: Package): Promise<void> {
    this.operations.push(async () => {
      const data = this.packageToSupabase(package);
      const { error } = await this.client
        .from('patient_packages')
        .upsert(data);
      
      if (error) {
        throw new DomainError(`Failed to save package: ${error.message}`);
      }
    });
  }

  async saveInstallments(installments: Transaction[]): Promise<void> {
    this.operations.push(async () => {
      const data = installments.map(tx => this.transactionToSupabase(tx));
      const { error } = await this.client
        .from('financial_transactions')
        .upsert(data);
      
      if (error) {
        throw new DomainError(`Failed to save installments: ${error.message}`);
      }
    });
  }

  async saveInvoice(invoice: Invoice): Promise<void> {
    this.operations.push(async () => {
      const data = this.invoiceToSupabase(invoice);
      const { error } = await this.client
        .from('invoices')
        .upsert(data);
      
      if (error) {
        throw new DomainError(`Failed to save invoice: ${error.message}`);
      }
    });
  }

  async savePaymentPlan(paymentPlan: PaymentPlan): Promise<void> {
    this.operations.push(async () => {
      const data = this.paymentPlanToSupabase(paymentPlan);
      const { error } = await this.client
        .from('payment_plans')
        .upsert(data);
      
      if (error) {
        throw new DomainError(`Failed to save payment plan: ${error.message}`);
      }
    });
  }

  async commit(): Promise<void> {
    for (const operation of this.operations) {
      await operation();
    }
    this.operations = [];
  }

  async rollback(): Promise<void> {
    // In a real implementation, you'd need to track operations for rollback
    // For now, just clear the operations
    this.operations = [];
  }

  private transactionToSupabase(transaction: Transaction): Partial<SupabaseTransaction> {
    const json = transaction.toJSON();
    return {
      id: json.id,
      patient_id: json.patientId,
      type: json.type,
      amount: json.amount.amount,
      currency: json.amount.currency,
      payment_method: json.paymentMethod,
      installments: json.installments,
      installment_number: json.installmentNumber,
      due_date: json.dueDate,
      paid_date: json.paidDate,
      status: json.status,
      gateway_transaction_id: json.gatewayTransactionId,
      gateway_response: json.gatewayResponse,
      description: json.description,
      metadata: json.metadata,
      fiscal_document_number: json.fiscalDocumentNumber,
      tax_amount: json.taxAmount.amount,
      net_amount: json.netAmount.amount,
      created_by: json.createdBy,
      updated_by: json.updatedBy,
      version: json.version
    };
  }

  private packageToSupabase(package: Package): Partial<SupabasePackage> {
    const json = package.toJSON();
    return {
      id: json.id,
      patient_id: json.patientId,
      transaction_id: json.transactionId,
      package_type: json.type,
      total_sessions: json.totalSessions,
      used_sessions: json.usedSessions,
      purchase_date: json.purchaseDate,
      expiry_date: json.expiryDate,
      status: json.status
    };
  }

  private invoiceToSupabase(invoice: Invoice): Partial<SupabaseInvoice> {
    const json = invoice.toJSON();
    return {
      id: json.id,
      patient_id: json.patientId,
      transaction_ids: json.transactionIds,
      invoice_number: json.invoiceNumber,
      issue_date: json.issueDate,
      due_date: json.dueDate,
      line_items: json.lineItems,
      subtotal: json.subtotal.amount,
      discount_amount: json.discountAmount.amount,
      tax_amount: json.totalTax.amount,
      total_amount: json.totalAmount.amount,
      notes: json.notes,
      status: json.status,
      created_by: json.createdBy
    };
  }

  private paymentPlanToSupabase(paymentPlan: PaymentPlan): Partial<SupabasePaymentPlan> {
    const json = paymentPlan.toJSON();
    return {
      id: json.id,
      patient_id: json.patientId,
      total_amount: json.totalAmount.amount,
      installment_count: json.installmentCount,
      payment_method: json.paymentMethod,
      first_due_date: json.firstDueDate,
      description: json.description,
      interest_rate: json.interestRate,
      penalty_rate: json.penaltyRate,
      installments: json.installments,
      status: json.status,
      created_by: json.createdBy
    };
  }
}

export class SupabaseFinancialRepository implements IFinancialRepository {
  constructor(private readonly client: SupabaseClient) {}

  // Transaction operations
  async saveTransaction(transaction: Transaction): Promise<void> {
    const data = this.transactionToSupabase(transaction);
    const { error } = await this.client
      .from('financial_transactions')
      .upsert(data);
    
    if (error) {
      throw new DomainError(`Failed to save transaction: ${error.message}`);
    }
  }

  async findTransactionById(id: TransactionId): Promise<Transaction | null> {
    const { data, error } = await this.client
      .from('financial_transactions')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new DomainError(`Failed to find transaction: ${error.message}`);
    }

    return data ? this.supabaseToTransaction(data) : null;
  }

  async findTransactionsByPatient(patientId: PatientId, filters?: TransactionFilters): Promise<Transaction[]> {
    let query = this.client
      .from('financial_transactions')
      .select('*')
      .eq('patient_id', patientId);

    query = this.applyTransactionFilters(query, filters);

    const { data, error } = await query;

    if (error) {
      throw new DomainError(`Failed to find transactions: ${error.message}`);
    }

    return (data || []).map(row => this.supabaseToTransaction(row));
  }

  async findTransactions(filters: TransactionFilters): Promise<Transaction[]> {
    let query = this.client
      .from('financial_transactions')
      .select('*');

    query = this.applyTransactionFilters(query, filters);

    const { data, error } = await query;

    if (error) {
      throw new DomainError(`Failed to find transactions: ${error.message}`);
    }

    return (data || []).map(row => this.supabaseToTransaction(row));
  }

  async updateTransaction(transaction: Transaction): Promise<void> {
    const data = this.transactionToSupabase(transaction);
    data.updated_at = new Date().toISOString();
    
    const { error } = await this.client
      .from('financial_transactions')
      .update(data)
      .eq('id', transaction.getId());

    if (error) {
      throw new DomainError(`Failed to update transaction: ${error.message}`);
    }
  }

  async deleteTransaction(id: TransactionId): Promise<void> {
    const { error } = await this.client
      .from('financial_transactions')
      .delete()
      .eq('id', id);

    if (error) {
      throw new DomainError(`Failed to delete transaction: ${error.message}`);
    }
  }

  // Package operations
  async savePackage(package: Package): Promise<void> {
    const data = this.packageToSupabase(package);
    const { error } = await this.client
      .from('patient_packages')
      .upsert(data);
    
    if (error) {
      throw new DomainError(`Failed to save package: ${error.message}`);
    }
  }

  async findPackageById(id: PackageId): Promise<Package | null> {
    const { data, error } = await this.client
      .from('patient_packages')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new DomainError(`Failed to find package: ${error.message}`);
    }

    return data ? this.supabaseToPackage(data) : null;
  }

  async findPackagesByPatient(patientId: PatientId, filters?: PackageFilters): Promise<Package[]> {
    let query = this.client
      .from('patient_packages')
      .select('*')
      .eq('patient_id', patientId);

    query = this.applyPackageFilters(query, filters);

    const { data, error } = await query;

    if (error) {
      throw new DomainError(`Failed to find packages: ${error.message}`);
    }

    return (data || []).map(row => this.supabaseToPackage(row));
  }

  async findActivePackagesByPatient(patientId: PatientId): Promise<Package[]> {
    return this.findPackagesByPatient(patientId, { status: 'active' });
  }

  async findExpiringPackages(daysUntilExpiry: number): Promise<Package[]> {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + daysUntilExpiry);

    const { data, error } = await this.client
      .from('patient_packages')
      .select('*')
      .eq('status', 'active')
      .lte('expiry_date', expiryDate.toISOString());

    if (error) {
      throw new DomainError(`Failed to find expiring packages: ${error.message}`);
    }

    return (data || []).map(row => this.supabaseToPackage(row));
  }

  async updatePackage(package: Package): Promise<void> {
    const data = this.packageToSupabase(package);
    data.updated_at = new Date().toISOString();
    
    const { error } = await this.client
      .from('patient_packages')
      .update(data)
      .eq('id', package.getId());

    if (error) {
      throw new DomainError(`Failed to update package: ${error.message}`);
    }
  }

  async deletePackage(id: PackageId): Promise<void> {
    const { error } = await this.client
      .from('patient_packages')
      .delete()
      .eq('id', id);

    if (error) {
      throw new DomainError(`Failed to delete package: ${error.message}`);
    }
  }

  // Invoice operations
  async saveInvoice(invoice: Invoice): Promise<void> {
    const data = this.invoiceToSupabase(invoice);
    const { error } = await this.client
      .from('invoices')
      .upsert(data);
    
    if (error) {
      throw new DomainError(`Failed to save invoice: ${error.message}`);
    }
  }

  async findInvoiceById(id: InvoiceId): Promise<Invoice | null> {
    const { data, error } = await this.client
      .from('invoices')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new DomainError(`Failed to find invoice: ${error.message}`);
    }

    return data ? this.supabaseToInvoice(data) : null;
  }

  async findInvoicesByPatient(patientId: PatientId, filters?: InvoiceFilters): Promise<Invoice[]> {
    let query = this.client
      .from('invoices')
      .select('*')
      .eq('patient_id', patientId);

    query = this.applyInvoiceFilters(query, filters);

    const { data, error } = await query;

    if (error) {
      throw new DomainError(`Failed to find invoices: ${error.message}`);
    }

    return (data || []).map(row => this.supabaseToInvoice(row));
  }

  async findOverdueInvoices(): Promise<Invoice[]> {
    const { data, error } = await this.client
      .from('invoices')
      .select('*')
      .in('status', ['issued', 'overdue'])
      .lt('due_date', new Date().toISOString());

    if (error) {
      throw new DomainError(`Failed to find overdue invoices: ${error.message}`);
    }

    return (data || []).map(row => this.supabaseToInvoice(row));
  }

  async updateInvoice(invoice: Invoice): Promise<void> {
    const data = this.invoiceToSupabase(invoice);
    data.updated_at = new Date().toISOString();
    
    const { error } = await this.client
      .from('invoices')
      .update(data)
      .eq('id', invoice.getId());

    if (error) {
      throw new DomainError(`Failed to update invoice: ${error.message}`);
    }
  }

  async deleteInvoice(id: InvoiceId): Promise<void> {
    const { error } = await this.client
      .from('invoices')
      .delete()
      .eq('id', id);

    if (error) {
      throw new DomainError(`Failed to delete invoice: ${error.message}`);
    }
  }

  async generateInvoiceNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const { data, error } = await this.client
      .from('invoices')
      .select('invoice_number')
      .not('invoice_number', 'is', null)
      .like('invoice_number', `${year}%`)
      .order('invoice_number', { ascending: false })
      .limit(1);

    if (error) {
      throw new DomainError(`Failed to generate invoice number: ${error.message}`);
    }

    let nextNumber = 1;
    if (data && data.length > 0) {
      const lastNumber = data[0].invoice_number;
      const match = lastNumber.match(/(\d+)$/);
      if (match) {
        nextNumber = parseInt(match[1]) + 1;
      }
    }

    return `${year}${nextNumber.toString().padStart(6, '0')}`;
  }

  // Payment Plan operations
  async savePaymentPlan(paymentPlan: PaymentPlan): Promise<void> {
    const data = this.paymentPlanToSupabase(paymentPlan);
    const { error } = await this.client
      .from('payment_plans')
      .upsert(data);
    
    if (error) {
      throw new DomainError(`Failed to save payment plan: ${error.message}`);
    }
  }

  async findPaymentPlanById(id: PaymentPlanId): Promise<PaymentPlan | null> {
    const { data, error } = await this.client
      .from('payment_plans')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new DomainError(`Failed to find payment plan: ${error.message}`);
    }

    return data ? this.supabaseToPaymentPlan(data) : null;
  }

  async findPaymentPlansByPatient(patientId: PatientId, filters?: PaymentPlanFilters): Promise<PaymentPlan[]> {
    let query = this.client
      .from('payment_plans')
      .select('*')
      .eq('patient_id', patientId);

    query = this.applyPaymentPlanFilters(query, filters);

    const { data, error } = await query;

    if (error) {
      throw new DomainError(`Failed to find payment plans: ${error.message}`);
    }

    return (data || []).map(row => this.supabaseToPaymentPlan(row));
  }

  async findOverduePaymentPlans(): Promise<PaymentPlan[]> {
    const { data, error } = await this.client
      .from('payment_plans')
      .select('*')
      .eq('status', 'active');

    if (error) {
      throw new DomainError(`Failed to find overdue payment plans: ${error.message}`);
    }

    const paymentPlans = (data || []).map(row => this.supabaseToPaymentPlan(row));
    
    // Filter for plans with overdue installments
    return paymentPlans.filter(plan => plan.getOverdueInstallmentCount() > 0);
  }

  async updatePaymentPlan(paymentPlan: PaymentPlan): Promise<void> {
    const data = this.paymentPlanToSupabase(paymentPlan);
    data.updated_at = new Date().toISOString();
    
    const { error } = await this.client
      .from('payment_plans')
      .update(data)
      .eq('id', paymentPlan.getId());

    if (error) {
      throw new DomainError(`Failed to update payment plan: ${error.message}`);
    }
  }

  async deletePaymentPlan(id: PaymentPlanId): Promise<void> {
    const { error } = await this.client
      .from('payment_plans')
      .delete()
      .eq('id', id);

    if (error) {
      throw new DomainError(`Failed to delete payment plan: ${error.message}`);
    }
  }

  // Analytics and reporting
  async getTotalRevenue(period: DateRange): Promise<number> {
    const { data, error } = await this.client
      .from('financial_transactions')
      .select('net_amount')
      .eq('status', 'paid')
      .in('type', ['package_purchase', 'single_session', 'installment'])
      .gte('paid_date', period.start.toISOString())
      .lte('paid_date', period.end.toISOString());

    if (error) {
      throw new DomainError(`Failed to get total revenue: ${error.message}`);
    }

    return (data || []).reduce((sum, row) => sum + row.net_amount, 0);
  }

  async getRevenueByPeriod(
    period: DateRange, 
    groupBy: 'day' | 'week' | 'month'
  ): Promise<Array<{date: string, revenue: number}>> {
    let dateFormat: string;
    switch (groupBy) {
      case 'day':
        dateFormat = 'YYYY-MM-DD';
        break;
      case 'week':
        dateFormat = 'YYYY-"W"WW';
        break;
      case 'month':
        dateFormat = 'YYYY-MM';
        break;
    }

    const { data, error } = await this.client.rpc('get_revenue_by_period', {
      start_date: period.start.toISOString(),
      end_date: period.end.toISOString(),
      date_format: dateFormat
    });

    if (error) {
      throw new DomainError(`Failed to get revenue by period: ${error.message}`);
    }

    return data || [];
  }

  async getTopPatientsByRevenue(limit: number, period?: DateRange): Promise<Array<{patientId: PatientId, revenue: number}>> {
    let query = this.client
      .from('financial_transactions')
      .select('patient_id, net_amount')
      .eq('status', 'paid')
      .in('type', ['package_purchase', 'single_session', 'installment']);

    if (period) {
      query = query
        .gte('paid_date', period.start.toISOString())
        .lte('paid_date', period.end.toISOString());
    }

    const { data, error } = await query;

    if (error) {
      throw new DomainError(`Failed to get top patients: ${error.message}`);
    }

    // Group by patient and sum revenue
    const patientRevenue = new Map<PatientId, number>();
    (data || []).forEach(row => {
      const current = patientRevenue.get(row.patient_id) || 0;
      patientRevenue.set(row.patient_id, current + row.net_amount);
    });

    // Sort and limit
    return Array.from(patientRevenue.entries())
      .map(([patientId, revenue]) => ({ patientId, revenue }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, limit);
  }

  async getPaymentMethodStats(period?: DateRange): Promise<Array<{method: string, count: number, revenue: number}>> {
    let query = this.client
      .from('financial_transactions')
      .select('payment_method, net_amount')
      .eq('status', 'paid')
      .in('type', ['package_purchase', 'single_session', 'installment']);

    if (period) {
      query = query
        .gte('paid_date', period.start.toISOString())
        .lte('paid_date', period.end.toISOString());
    }

    const { data, error } = await query;

    if (error) {
      throw new DomainError(`Failed to get payment method stats: ${error.message}`);
    }

    // Group by payment method
    const methodStats = new Map<string, {count: number, revenue: number}>();
    (data || []).forEach(row => {
      const method = row.payment_method?.type || 'unknown';
      const current = methodStats.get(method) || { count: 0, revenue: 0 };
      methodStats.set(method, {
        count: current.count + 1,
        revenue: current.revenue + row.net_amount
      });
    });

    return Array.from(methodStats.entries()).map(([method, stats]) => ({
      method,
      ...stats
    }));
  }

  async getOverdueStats(): Promise<{count: number, totalAmount: number, averageDaysOverdue: number}> {
    const { data, error } = await this.client
      .from('financial_transactions')
      .select('net_amount, due_date')
      .in('status', ['overdue', 'pending'])
      .lt('due_date', new Date().toISOString());

    if (error) {
      throw new DomainError(`Failed to get overdue stats: ${error.message}`);
    }

    const now = new Date();
    let totalAmount = 0;
    let totalDaysOverdue = 0;
    const count = data?.length || 0;

    (data || []).forEach(row => {
      totalAmount += row.net_amount;
      const dueDate = new Date(row.due_date);
      const daysOverdue = Math.ceil((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
      totalDaysOverdue += daysOverdue;
    });

    return {
      count,
      totalAmount,
      averageDaysOverdue: count > 0 ? totalDaysOverdue / count : 0
    };
  }

  // Transaction support
  async withTransaction<T>(callback: (tx: IFinancialTransaction) => Promise<T>): Promise<T> {
    const tx = new SupabaseFinancialTransaction(this.client);
    
    try {
      const result = await callback(tx);
      await tx.commit();
      return result;
    } catch (error) {
      await tx.rollback();
      throw error;
    }
  }

  // Raw query support
  async query(sql: string, params: any[]): Promise<any[]> {
    // Note: Supabase doesn't support raw SQL directly from client
    // This would need to be implemented as a stored procedure or function
    const { data, error } = await this.client.rpc('execute_query', {
      query_sql: sql,
      query_params: params
    });

    if (error) {
      throw new DomainError(`Query failed: ${error.message}`);
    }

    return data || [];
  }

  // Helper methods for data conversion
  private transactionToSupabase(transaction: Transaction): Partial<SupabaseTransaction> {
    const json = transaction.toJSON();
    return {
      id: json.id,
      patient_id: json.patientId,
      type: json.type,
      amount: json.amount.amount,
      currency: json.amount.currency,
      payment_method: json.paymentMethod,
      installments: json.installments,
      installment_number: json.installmentNumber,
      due_date: json.dueDate,
      paid_date: json.paidDate,
      status: json.status,
      gateway_transaction_id: json.gatewayTransactionId,
      gateway_response: json.gatewayResponse,
      description: json.description,
      metadata: json.metadata,
      fiscal_document_number: json.fiscalDocumentNumber,
      tax_amount: json.taxAmount.amount,
      net_amount: json.netAmount.amount,
      created_by: json.createdBy,
      updated_by: json.updatedBy,
      version: json.version
    };
  }

  private supabaseToTransaction(data: SupabaseTransaction): Transaction {
    const paymentMethod = PaymentMethod.create(data.payment_method);
    
    return Transaction.create({
      id: data.id,
      patientId: data.patient_id,
      type: data.type as TransactionType,
      amount: new Money(data.amount, data.currency),
      paymentMethod,
      installments: data.installments,
      installmentNumber: data.installment_number,
      dueDate: new Date(data.due_date),
      paidDate: data.paid_date ? new Date(data.paid_date) : undefined,
      status: data.status as TransactionStatus,
      gatewayTransactionId: data.gateway_transaction_id,
      gatewayResponse: data.gateway_response,
      description: data.description,
      metadata: data.metadata || {},
      fiscalDocumentNumber: data.fiscal_document_number,
      taxAmount: new Money(data.tax_amount, data.currency),
      createdBy: data.created_by,
      updatedBy: data.updated_by
    });
  }

  private packageToSupabase(package: Package): Partial<SupabasePackage> {
    const json = package.toJSON();
    return {
      id: json.id,
      patient_id: json.patientId,
      transaction_id: json.transactionId,
      package_type: json.type,
      total_sessions: json.totalSessions,
      used_sessions: json.usedSessions,
      purchase_date: json.purchaseDate,
      expiry_date: json.expiryDate,
      status: json.status
    };
  }

  private supabaseToPackage(data: SupabasePackage): Package {
    // This would need the price from the related transaction
    // For now, we'll create a placeholder
    const price = new Money(0); // Would need to join with transaction

    return Package.create({
      id: data.id,
      patientId: data.patient_id,
      transactionId: data.transaction_id,
      type: data.package_type as PackageType,
      totalSessions: data.total_sessions,
      usedSessions: data.used_sessions,
      price,
      purchaseDate: new Date(data.purchase_date),
      expiryDate: new Date(data.expiry_date),
      status: data.status as PackageStatus
    });
  }

  private invoiceToSupabase(invoice: Invoice): Partial<SupabaseInvoice> {
    const json = invoice.toJSON();
    return {
      id: json.id,
      patient_id: json.patientId,
      transaction_ids: json.transactionIds,
      invoice_number: json.invoiceNumber,
      issue_date: json.issueDate,
      due_date: json.dueDate,
      line_items: json.lineItems,
      subtotal: json.subtotal.amount,
      discount_amount: json.discountAmount.amount,
      tax_amount: json.totalTax.amount,
      total_amount: json.totalAmount.amount,
      notes: json.notes,
      status: json.status,
      created_by: json.createdBy
    };
  }

  private supabaseToInvoice(data: SupabaseInvoice): Invoice {
    return Invoice.create({
      id: data.id,
      patientId: data.patient_id,
      transactionIds: data.transaction_ids,
      invoiceNumber: data.invoice_number,
      issueDate: new Date(data.issue_date),
      dueDate: new Date(data.due_date),
      lineItems: data.line_items,
      discountAmount: new Money(data.discount_amount),
      notes: data.notes,
      status: data.status as InvoiceStatus,
      createdBy: data.created_by
    });
  }

  private paymentPlanToSupabase(paymentPlan: PaymentPlan): Partial<SupabasePaymentPlan> {
    const json = paymentPlan.toJSON();
    return {
      id: json.id,
      patient_id: json.patientId,
      total_amount: json.totalAmount.amount,
      installment_count: json.installmentCount,
      payment_method: json.paymentMethod,
      first_due_date: json.firstDueDate,
      description: json.description,
      interest_rate: json.interestRate,
      penalty_rate: json.penaltyRate,
      installments: json.installments,
      status: json.status,
      created_by: json.createdBy
    };
  }

  private supabaseToPaymentPlan(data: SupabasePaymentPlan): PaymentPlan {
    const paymentMethod = PaymentMethod.create(data.payment_method);
    
    return PaymentPlan.create({
      id: data.id,
      patientId: data.patient_id,
      totalAmount: new Money(data.total_amount),
      installmentCount: data.installment_count,
      paymentMethod,
      firstDueDate: new Date(data.first_due_date),
      description: data.description,
      interestRate: data.interest_rate,
      penaltyRate: data.penalty_rate,
      status: data.status as PaymentPlanStatus,
      createdBy: data.created_by
    });
  }

  // Filter application helpers
  private applyTransactionFilters(query: any, filters?: TransactionFilters): any {
    if (!filters) return query;

    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    if (filters.type) {
      query = query.eq('type', filters.type);
    }

    if (filters.dateRange) {
      query = query
        .gte('created_at', filters.dateRange.start.toISOString())
        .lte('created_at', filters.dateRange.end.toISOString());
    }

    if (filters.minAmount) {
      query = query.gte('amount', filters.minAmount);
    }

    if (filters.maxAmount) {
      query = query.lte('amount', filters.maxAmount);
    }

    if (filters.limit) {
      query = query.limit(filters.limit);
    }

    if (filters.offset) {
      query = query.range(filters.offset, (filters.offset + (filters.limit || 50)) - 1);
    }

    return query.order('created_at', { ascending: false });
  }

  private applyPackageFilters(query: any, filters?: PackageFilters): any {
    if (!filters) return query;

    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    if (filters.type) {
      query = query.eq('package_type', filters.type);
    }

    if (filters.hasRemainingSessions !== undefined) {
      if (filters.hasRemainingSessions) {
        query = query.gt('remaining_sessions', 0);
      } else {
        query = query.eq('remaining_sessions', 0);
      }
    }

    if (filters.expiryDateRange) {
      query = query
        .gte('expiry_date', filters.expiryDateRange.start.toISOString())
        .lte('expiry_date', filters.expiryDateRange.end.toISOString());
    }

    if (filters.limit) {
      query = query.limit(filters.limit);
    }

    if (filters.offset) {
      query = query.range(filters.offset, (filters.offset + (filters.limit || 50)) - 1);
    }

    return query.order('created_at', { ascending: false });
  }

  private applyInvoiceFilters(query: any, filters?: InvoiceFilters): any {
    if (!filters) return query;

    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    if (filters.overdueOnly) {
      query = query
        .in('status', ['issued', 'overdue'])
        .lt('due_date', new Date().toISOString());
    }

    if (filters.dateRange) {
      query = query
        .gte('issue_date', filters.dateRange.start.toISOString())
        .lte('issue_date', filters.dateRange.end.toISOString());
    }

    if (filters.limit) {
      query = query.limit(filters.limit);
    }

    if (filters.offset) {
      query = query.range(filters.offset, (filters.offset + (filters.limit || 50)) - 1);
    }

    return query.order('created_at', { ascending: false });
  }

  private applyPaymentPlanFilters(query: any, filters?: PaymentPlanFilters): any {
    if (!filters) return query;

    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    if (filters.limit) {
      query = query.limit(filters.limit);
    }

    if (filters.offset) {
      query = query.range(filters.offset, (filters.offset + (filters.limit || 50)) - 1);
    }

    return query.order('created_at', { ascending: false });
  }
}
