import { Money } from '../../domain/value-objects/Money';
import { PaymentMethod } from '../../domain/value-objects/PaymentMethod';
import { Transaction } from '../../domain/entities/Transaction';
import { Package } from '../../domain/entities/Package';
import { Invoice } from '../../domain/entities/Invoice';
import { PaymentPlan } from '../../domain/entities/PaymentPlan';
import { DomainError } from '../../domain/errors/DomainError';
export class SupabaseFinancialTransaction {
    constructor(client) {
        this.client = client;
        this.operations = [];
    }
    async saveTransaction(transaction) {
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
    async savePackage(pkg) {
        this.operations.push(async () => {
            const data = this.packageToSupabase(pkg);
            const { error } = await this.client
                .from('patient_packages')
                .upsert(data);
            if (error) {
                throw new DomainError(`Failed to save package: ${error.message}`);
            }
        });
    }
    async saveInstallments(installments) {
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
    async saveInvoice(invoice) {
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
    async savePaymentPlan(paymentPlan) {
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
    async commit() {
        for (const operation of this.operations) {
            await operation();
        }
        this.operations = [];
    }
    async rollback() {
        // In a real implementation, you'd need to track operations for rollback
        // For now, just clear the operations
        this.operations = [];
    }
    transactionToSupabase(transaction) {
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
    packageToSupabase(pkg) {
        const json = pkg.toJSON();
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
    invoiceToSupabase(invoice) {
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
    paymentPlanToSupabase(paymentPlan) {
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
export class SupabaseFinancialRepository {
    constructor(client) {
        this.client = client;
    }
    // Transaction operations
    async saveTransaction(transaction) {
        const data = this.transactionToSupabase(transaction);
        const { error } = await this.client
            .from('financial_transactions')
            .upsert(data);
        if (error) {
            throw new DomainError(`Failed to save transaction: ${error.message}`);
        }
    }
    async findTransactionById(id) {
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
    async findTransactionsByPatient(patientId, filters) {
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
    async findTransactions(filters) {
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
    async updateTransaction(transaction) {
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
    async deleteTransaction(id) {
        const { error } = await this.client
            .from('financial_transactions')
            .delete()
            .eq('id', id);
        if (error) {
            throw new DomainError(`Failed to delete transaction: ${error.message}`);
        }
    }
    // Package operations
    async savePackage(pkg) {
        const data = this.packageToSupabase(pkg);
        const { error } = await this.client
            .from('patient_packages')
            .upsert(data);
        if (error) {
            throw new DomainError(`Failed to save package: ${error.message}`);
        }
    }
    async findPackageById(id) {
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
    async findPackagesByPatient(patientId, filters) {
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
    async findActivePackagesByPatient(patientId) {
        return this.findPackagesByPatient(patientId, { status: 'active' });
    }
    async findExpiringPackages(daysUntilExpiry) {
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
    async updatePackage(pkg) {
        const data = this.packageToSupabase(pkg);
        data.updated_at = new Date().toISOString();
        const { error } = await this.client
            .from('patient_packages')
            .update(data)
            .eq('id', pkg.getId());
        if (error) {
            throw new DomainError(`Failed to update package: ${error.message}`);
        }
    }
    async deletePackage(id) {
        const { error } = await this.client
            .from('patient_packages')
            .delete()
            .eq('id', id);
        if (error) {
            throw new DomainError(`Failed to delete package: ${error.message}`);
        }
    }
    // Invoice operations
    async saveInvoice(invoice) {
        const data = this.invoiceToSupabase(invoice);
        const { error } = await this.client
            .from('invoices')
            .upsert(data);
        if (error) {
            throw new DomainError(`Failed to save invoice: ${error.message}`);
        }
    }
    async findInvoiceById(id) {
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
    async findInvoicesByPatient(patientId, filters) {
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
    async findOverdueInvoices() {
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
    async updateInvoice(invoice) {
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
    async deleteInvoice(id) {
        const { error } = await this.client
            .from('invoices')
            .delete()
            .eq('id', id);
        if (error) {
            throw new DomainError(`Failed to delete invoice: ${error.message}`);
        }
    }
    async generateInvoiceNumber() {
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
    async savePaymentPlan(paymentPlan) {
        const data = this.paymentPlanToSupabase(paymentPlan);
        const { error } = await this.client
            .from('payment_plans')
            .upsert(data);
        if (error) {
            throw new DomainError(`Failed to save payment plan: ${error.message}`);
        }
    }
    async findPaymentPlanById(id) {
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
    async findPaymentPlansByPatient(patientId, filters) {
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
    async findOverduePaymentPlans() {
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
    async updatePaymentPlan(paymentPlan) {
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
    async deletePaymentPlan(id) {
        const { error } = await this.client
            .from('payment_plans')
            .delete()
            .eq('id', id);
        if (error) {
            throw new DomainError(`Failed to delete payment plan: ${error.message}`);
        }
    }
    // Analytics and reporting
    async getTotalRevenue(period) {
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
    async getRevenueByPeriod(period, groupBy) {
        let dateFormat;
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
    async getTopPatientsByRevenue(limit, period) {
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
        const patientRevenue = new Map();
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
    async getPaymentMethodStats(period) {
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
        const methodStats = new Map();
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
    async getOverdueStats() {
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
    async withTransaction(callback) {
        const tx = new SupabaseFinancialTransaction(this.client);
        try {
            const result = await callback(tx);
            await tx.commit();
            return result;
        }
        catch (error) {
            await tx.rollback();
            throw error;
        }
    }
    // Raw query support
    async query(sql, params) {
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
    transactionToSupabase(transaction) {
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
    supabaseToTransaction(data) {
        const paymentMethod = PaymentMethod.create(data.payment_method);
        return Transaction.create({
            id: data.id,
            patientId: data.patient_id,
            type: data.type,
            amount: new Money(data.amount, data.currency),
            paymentMethod,
            installments: data.installments,
            installmentNumber: data.installment_number,
            dueDate: new Date(data.due_date),
            paidDate: data.paid_date ? new Date(data.paid_date) : undefined,
            status: data.status,
            gatewayTransactionId: data.gateway_transaction_id ?? undefined,
            gatewayResponse: data.gateway_response ?? undefined,
            description: data.description ?? undefined,
            metadata: data.metadata || {},
            fiscalDocumentNumber: data.fiscal_document_number ?? undefined,
            taxAmount: new Money(data.tax_amount, data.currency),
            createdBy: data.created_by,
            updatedBy: data.updated_by ?? undefined
        });
    }
    packageToSupabase(pkg) {
        const json = pkg.toJSON();
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
    supabaseToPackage(data) {
        // This would need the price from the related transaction
        // For now, we'll create a placeholder
        const price = new Money(0); // Would need to join with transaction
        return Package.create({
            id: data.id,
            patientId: data.patient_id,
            transactionId: data.transaction_id,
            type: data.package_type,
            totalSessions: data.total_sessions,
            usedSessions: data.used_sessions,
            price,
            purchaseDate: new Date(data.purchase_date),
            expiryDate: new Date(data.expiry_date),
            status: data.status
        });
    }
    invoiceToSupabase(invoice) {
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
    supabaseToInvoice(data) {
        return Invoice.create({
            id: data.id,
            patientId: data.patient_id,
            transactionIds: data.transaction_ids,
            invoiceNumber: data.invoice_number ?? undefined,
            issueDate: new Date(data.issue_date),
            dueDate: new Date(data.due_date),
            lineItems: data.line_items,
            discountAmount: new Money(data.discount_amount),
            notes: data.notes ?? undefined,
            status: data.status,
            createdBy: data.created_by
        });
    }
    paymentPlanToSupabase(paymentPlan) {
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
    supabaseToPaymentPlan(data) {
        const paymentMethod = PaymentMethod.create(data.payment_method);
        return PaymentPlan.create({
            id: data.id,
            patientId: data.patient_id,
            totalAmount: new Money(data.total_amount),
            installmentCount: data.installment_count,
            paymentMethod,
            firstDueDate: new Date(data.first_due_date),
            description: data.description ?? undefined,
            interestRate: data.interest_rate,
            penaltyRate: data.penalty_rate,
            status: data.status,
            createdBy: data.created_by
        });
    }
    // Filter application helpers
    applyTransactionFilters(query, filters) {
        if (!filters)
            return query;
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
    applyPackageFilters(query, filters) {
        if (!filters)
            return query;
        if (filters.status) {
            query = query.eq('status', filters.status);
        }
        if (filters.type) {
            query = query.eq('package_type', filters.type);
        }
        if (filters.hasRemainingSessions !== undefined) {
            if (filters.hasRemainingSessions) {
                query = query.gt('remaining_sessions', 0);
            }
            else {
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
    applyInvoiceFilters(query, filters) {
        if (!filters)
            return query;
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
    applyPaymentPlanFilters(query, filters) {
        if (!filters)
            return query;
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
