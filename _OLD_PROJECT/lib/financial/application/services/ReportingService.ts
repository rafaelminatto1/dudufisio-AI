import { Money } from '../../domain/value-objects/Money';
import { IFinancialRepository, DateRange } from '../../domain/repositories/IFinancialRepository';
import { PatientId, TransactionType, TransactionStatus } from '../../domain/entities/Transaction';
import { PackageType } from '../../domain/entities/Package';
import { PaymentMethodType } from '../../domain/value-objects/PaymentMethod';

export interface CashFlowData {
  date: string;
  revenue: number;
  expenses: number;
  netFlow: number;
  transactions: number;
  cumulativeFlow: number;
}

export interface CashFlowReport {
  period: DateRange;
  data: CashFlowData[];
  summary: {
    totalRevenue: Money;
    totalExpenses: Money;
    netCashFlow: Money;
    totalTransactions: number;
    averageDailyRevenue: Money;
    averageTransactionValue: Money;
  };
}

export interface RevenueAnalysisData {
  packageType: PackageType;
  revenue: number;
  transactionCount: number;
  averageValue: number;
  percentage: number;
}

export interface RevenueAnalysis {
  period: DateRange;
  byPackageType: RevenueAnalysisData[];
  byPaymentMethod: Array<{
    method: PaymentMethodType;
    revenue: number;
    count: number;
    percentage: number;
  }>;
  byMonth: Array<{
    month: string;
    revenue: number;
    growth: number;
  }>;
  summary: {
    totalRevenue: Money;
    totalTransactions: number;
    averageMonthlyRevenue: Money;
    growthRate: number;
  };
}

export interface PatientRevenueData {
  patientId: PatientId;
  totalRevenue: number;
  transactionCount: number;
  averageTransactionValue: number;
  lastTransactionDate: Date;
  packagesPurchased: number;
}

export interface OverdueAnalysis {
  totalOverdueAmount: Money;
  overdueTransactionCount: number;
  averageDaysOverdue: number;
  byAgeGroup: Array<{
    ageGroup: string;
    count: number;
    amount: number;
  }>;
  topOverduePatients: Array<{
    patientId: PatientId;
    amount: number;
    daysOverdue: number;
  }>;
}

export interface FinancialKPIs {
  totalRevenue: Money;
  monthlyRecurringRevenue: Money;
  averageRevenuePerPatient: Money;
  customerLifetimeValue: Money;
  churnRate: number;
  paymentSuccessRate: number;
  overdueRate: number;
  refundRate: number;
  conversionRate: number;
}

export interface ProfitabilityAnalysis {
  grossRevenue: Money;
  netRevenue: Money;
  operatingExpenses: Money;
  grossProfit: Money;
  grossMargin: number;
  netProfit: Money;
  netMargin: number;
  ebitda: Money;
  ebitdaMargin: number;
}

export class ReportingService {
  constructor(private readonly repository: IFinancialRepository) {}

  async generateCashFlowReport(period: DateRange): Promise<CashFlowReport> {
    const query = `
      WITH daily_cash_flow AS (
        SELECT 
          DATE(paid_date) as date,
          SUM(CASE 
            WHEN type IN ('package_purchase', 'single_session', 'installment') 
            AND status = 'paid' 
            THEN net_amount 
            ELSE 0 
          END) as revenue,
          SUM(CASE 
            WHEN type = 'expense' 
            AND status = 'paid' 
            THEN amount 
            ELSE 0 
          END) as expenses,
          COUNT(CASE 
            WHEN type IN ('package_purchase', 'single_session', 'installment') 
            AND status = 'paid' 
            THEN 1 
          END) as transactions
        FROM financial_transactions 
        WHERE paid_date BETWEEN $1 AND $2
        GROUP BY DATE(paid_date)
        ORDER BY date
      )
      SELECT 
        date,
        revenue,
        expenses,
        (revenue - expenses) as net_flow,
        transactions,
        SUM(revenue - expenses) OVER (ORDER BY date) as cumulative_flow
      FROM daily_cash_flow;
    `;

    const results = await this.repository.query(query, [period.start, period.end]);
    
    const data: CashFlowData[] = results.map(row => ({
      date: row.date,
      revenue: parseFloat(row.revenue) || 0,
      expenses: parseFloat(row.expenses) || 0,
      netFlow: parseFloat(row.net_flow) || 0,
      transactions: parseInt(row.transactions) || 0,
      cumulativeFlow: parseFloat(row.cumulative_flow) || 0
    }));

    const totalRevenue = data.reduce((sum, d) => sum + d.revenue, 0);
    const totalExpenses = data.reduce((sum, d) => sum + d.expenses, 0);
    const totalTransactions = data.reduce((sum, d) => sum + d.transactions, 0);
    const days = data.length || 1;

    return {
      period,
      data,
      summary: {
        totalRevenue: new Money(totalRevenue),
        totalExpenses: new Money(totalExpenses),
        netCashFlow: new Money(totalRevenue - totalExpenses),
        totalTransactions,
        averageDailyRevenue: new Money(totalRevenue / days),
        averageTransactionValue: new Money(totalTransactions > 0 ? totalRevenue / totalTransactions : 0)
      }
    };
  }

  async generateRevenueAnalysis(period: DateRange): Promise<RevenueAnalysis> {
    // Revenue by package type
    const packageTypeQuery = `
      SELECT 
        pp.package_type,
        SUM(ft.net_amount) as revenue,
        COUNT(ft.id) as transaction_count
      FROM financial_transactions ft
      JOIN patient_packages pp ON ft.id = pp.transaction_id
      WHERE ft.paid_date BETWEEN $1 AND $2
        AND ft.status = 'paid'
        AND ft.type = 'package_purchase'
      GROUP BY pp.package_type
      ORDER BY revenue DESC;
    `;

    const packageResults = await this.repository.query(packageTypeQuery, [period.start, period.end]);
    const totalRevenue = packageResults.reduce((sum: number, row: any) => sum + parseFloat(row.revenue), 0);

    const byPackageType: RevenueAnalysisData[] = packageResults.map((row: any) => ({
      packageType: row.package_type as PackageType,
      revenue: parseFloat(row.revenue),
      transactionCount: parseInt(row.transaction_count),
      averageValue: parseFloat(row.revenue) / parseInt(row.transaction_count),
      percentage: (parseFloat(row.revenue) / totalRevenue) * 100
    }));

    // Revenue by payment method
    const paymentMethodQuery = `
      SELECT 
        payment_method->>'type' as method,
        SUM(net_amount) as revenue,
        COUNT(*) as count
      FROM financial_transactions
      WHERE paid_date BETWEEN $1 AND $2
        AND status = 'paid'
        AND type IN ('package_purchase', 'single_session', 'installment')
      GROUP BY payment_method->>'type'
      ORDER BY revenue DESC;
    `;

    const methodResults = await this.repository.query(paymentMethodQuery, [period.start, period.end]);
    const byPaymentMethod = methodResults.map((row: any) => ({
      method: row.method as PaymentMethodType,
      revenue: parseFloat(row.revenue),
      count: parseInt(row.count),
      percentage: (parseFloat(row.revenue) / totalRevenue) * 100
    }));

    // Revenue by month
    const monthlyQuery = `
      WITH monthly_revenue AS (
        SELECT 
          TO_CHAR(paid_date, 'YYYY-MM') as month,
          SUM(net_amount) as revenue
        FROM financial_transactions
        WHERE paid_date BETWEEN $1 AND $2
          AND status = 'paid'
          AND type IN ('package_purchase', 'single_session', 'installment')
        GROUP BY TO_CHAR(paid_date, 'YYYY-MM')
        ORDER BY month
      )
      SELECT 
        month,
        revenue,
        LAG(revenue) OVER (ORDER BY month) as prev_revenue
      FROM monthly_revenue;
    `;

    const monthlyResults = await this.repository.query(monthlyQuery, [period.start, period.end]);
    const byMonth = monthlyResults.map((row: any) => ({
      month: row.month,
      revenue: parseFloat(row.revenue),
      growth: row.prev_revenue ? 
        ((parseFloat(row.revenue) - parseFloat(row.prev_revenue)) / parseFloat(row.prev_revenue)) * 100 : 0
    }));

    const months = byMonth.length || 1;
    const averageMonthlyRevenue = totalRevenue / months;
    const growthRate = byMonth.length > 1 ? 
      byMonth.reduce((sum, m) => sum + m.growth, 0) / byMonth.length : 0;

    return {
      period,
      byPackageType,
      byPaymentMethod,
      byMonth,
      summary: {
        totalRevenue: new Money(totalRevenue),
        totalTransactions: packageResults.reduce((sum: number, row: any) => sum + parseInt(row.transaction_count), 0),
        averageMonthlyRevenue: new Money(averageMonthlyRevenue),
        growthRate
      }
    };
  }

  async getTopPatientsByRevenue(limit: number = 10, period?: DateRange): Promise<PatientRevenueData[]> {
    const whereClause = period ? 
      'WHERE ft.paid_date BETWEEN $2 AND $3 AND ft.status = \'paid\'' : 
      'WHERE ft.status = \'paid\'';
    
    const params = period ? [limit, period.start, period.end] : [limit];

    const query = `
      SELECT 
        ft.patient_id,
        SUM(ft.net_amount) as total_revenue,
        COUNT(ft.id) as transaction_count,
        AVG(ft.net_amount) as average_transaction_value,
        MAX(ft.paid_date) as last_transaction_date,
        COUNT(DISTINCT pp.id) as packages_purchased
      FROM financial_transactions ft
      LEFT JOIN patient_packages pp ON ft.id = pp.transaction_id
      ${whereClause}
      GROUP BY ft.patient_id
      ORDER BY total_revenue DESC
      LIMIT $1;
    `;

    const results = await this.repository.query(query, params);

    return results.map((row: any) => ({
      patientId: row.patient_id,
      totalRevenue: parseFloat(row.total_revenue),
      transactionCount: parseInt(row.transaction_count),
      averageTransactionValue: parseFloat(row.average_transaction_value),
      lastTransactionDate: new Date(row.last_transaction_date),
      packagesPurchased: parseInt(row.packages_purchased) || 0
    }));
  }

  async generateOverdueAnalysis(): Promise<OverdueAnalysis> {
    const overdueQuery = `
      SELECT 
        patient_id,
        net_amount,
        EXTRACT(DAY FROM NOW() - due_date) as days_overdue
      FROM financial_transactions
      WHERE status IN ('overdue', 'pending')
        AND due_date < NOW()
      ORDER BY net_amount DESC;
    `;

    const results = await this.repository.query(overdueQuery, []);
    
    const totalOverdueAmount = results.reduce((sum: number, row: any) => sum + parseFloat(row.net_amount), 0);
    const overdueTransactionCount = results.length;
    const averageDaysOverdue = results.length > 0 ? 
      results.reduce((sum: number, row: any) => sum + parseInt(row.days_overdue), 0) / results.length : 0;

    // Group by age
    const byAgeGroup = [
      { ageGroup: '1-30 days', count: 0, amount: 0 },
      { ageGroup: '31-60 days', count: 0, amount: 0 },
      { ageGroup: '61-90 days', count: 0, amount: 0 },
      { ageGroup: '90+ days', count: 0, amount: 0 }
    ];

    results.forEach((row: any) => {
      const days = parseInt(row.days_overdue);
      const amount = parseFloat(row.net_amount);
      
      if (days <= 30) {
        byAgeGroup[0].count++;
        byAgeGroup[0].amount += amount;
      } else if (days <= 60) {
        byAgeGroup[1].count++;
        byAgeGroup[1].amount += amount;
      } else if (days <= 90) {
        byAgeGroup[2].count++;
        byAgeGroup[2].amount += amount;
      } else {
        byAgeGroup[3].count++;
        byAgeGroup[3].amount += amount;
      }
    });

    // Top overdue patients
    const topOverduePatients = results
      .slice(0, 10)
      .map((row: any) => ({
        patientId: row.patient_id,
        amount: parseFloat(row.net_amount),
        daysOverdue: parseInt(row.days_overdue)
      }));

    return {
      totalOverdueAmount: new Money(totalOverdueAmount),
      overdueTransactionCount,
      averageDaysOverdue,
      byAgeGroup,
      topOverduePatients
    };
  }

  async calculateFinancialKPIs(period: DateRange): Promise<FinancialKPIs> {
    const queries = {
      revenue: `
        SELECT SUM(net_amount) as total_revenue
        FROM financial_transactions
        WHERE paid_date BETWEEN $1 AND $2
          AND status = 'paid'
          AND type IN ('package_purchase', 'single_session', 'installment')
      `,
      mrr: `
        SELECT SUM(amount) as mrr
        FROM financial_transactions
        WHERE type = 'installment'
          AND status = 'paid'
          AND paid_date BETWEEN $1 AND $2
      `,
      patients: `
        SELECT 
          COUNT(DISTINCT patient_id) as total_patients,
          AVG(patient_revenue) as avg_revenue_per_patient
        FROM (
          SELECT 
            patient_id,
            SUM(net_amount) as patient_revenue
          FROM financial_transactions
          WHERE paid_date BETWEEN $1 AND $2
            AND status = 'paid'
          GROUP BY patient_id
        ) patient_totals
      `,
      success_rate: `
        SELECT 
          COUNT(CASE WHEN status = 'paid' THEN 1 END) as paid_count,
          COUNT(*) as total_count
        FROM financial_transactions
        WHERE created_at BETWEEN $1 AND $2
          AND type IN ('package_purchase', 'single_session', 'installment')
      `,
      overdue_rate: `
        SELECT 
          COUNT(CASE WHEN status IN ('overdue', 'pending') AND due_date < NOW() THEN 1 END) as overdue_count,
          COUNT(*) as total_count
        FROM financial_transactions
        WHERE created_at BETWEEN $1 AND $2
      `,
      refund_rate: `
        SELECT 
          COUNT(CASE WHEN status = 'refunded' THEN 1 END) as refunded_count,
          COUNT(CASE WHEN status = 'paid' THEN 1 END) as paid_count
        FROM financial_transactions
        WHERE created_at BETWEEN $1 AND $2
      `
    };

    const params = [period.start, period.end];
    const results = await Promise.all([
      this.repository.query(queries.revenue, params),
      this.repository.query(queries.mrr, params),
      this.repository.query(queries.patients, params),
      this.repository.query(queries.success_rate, params),
      this.repository.query(queries.overdue_rate, params),
      this.repository.query(queries.refund_rate, params)
    ]);

    const [revenueResult, mrrResult, patientsResult, successResult, overdueResult, refundResult] = results;

    const totalRevenue = parseFloat(revenueResult[0]?.total_revenue) || 0;
    const mrr = parseFloat(mrrResult[0]?.mrr) || 0;
    const totalPatients = parseInt(patientsResult[0]?.total_patients) || 1;
    const avgRevenuePerPatient = parseFloat(patientsResult[0]?.avg_revenue_per_patient) || 0;
    
    const paidCount = parseInt(successResult[0]?.paid_count) || 0;
    const totalTransactions = parseInt(successResult[0]?.total_count) || 1;
    const paymentSuccessRate = (paidCount / totalTransactions) * 100;
    
    const overdueCount = parseInt(overdueResult[0]?.overdue_count) || 0;
    const totalOverdueCheck = parseInt(overdueResult[0]?.total_count) || 1;
    const overdueRate = (overdueCount / totalOverdueCheck) * 100;
    
    const refundedCount = parseInt(refundResult[0]?.refunded_count) || 0;
    const paidForRefundRate = parseInt(refundResult[0]?.paid_count) || 1;
    const refundRate = (refundedCount / paidForRefundRate) * 100;

    // Estimate CLV as average revenue per patient * estimated lifetime (24 months)
    const customerLifetimeValue = avgRevenuePerPatient * 2; // Simplified calculation

    return {
      totalRevenue: new Money(totalRevenue),
      monthlyRecurringRevenue: new Money(mrr),
      averageRevenuePerPatient: new Money(avgRevenuePerPatient),
      customerLifetimeValue: new Money(customerLifetimeValue),
      churnRate: 0, // Would need more complex calculation with historical data
      paymentSuccessRate,
      overdueRate,
      refundRate,
      conversionRate: 0 // Would need lead/prospect data
    };
  }

  async generateProfitabilityAnalysis(period: DateRange): Promise<ProfitabilityAnalysis> {
    const query = `
      SELECT 
        SUM(CASE WHEN type IN ('package_purchase', 'single_session', 'installment') AND status = 'paid' THEN amount ELSE 0 END) as gross_revenue,
        SUM(CASE WHEN type IN ('package_purchase', 'single_session', 'installment') AND status = 'paid' THEN net_amount ELSE 0 END) as net_revenue,
        SUM(CASE WHEN type = 'expense' AND status = 'paid' THEN amount ELSE 0 END) as operating_expenses,
        SUM(CASE WHEN type IN ('package_purchase', 'single_session', 'installment') AND status = 'paid' THEN tax_amount ELSE 0 END) as total_taxes
      FROM financial_transactions
      WHERE paid_date BETWEEN $1 AND $2;
    `;

    const result = await this.repository.query(query, [period.start, period.end]);
    const data = result[0] || {};

    const grossRevenue = parseFloat(data.gross_revenue) || 0;
    const netRevenue = parseFloat(data.net_revenue) || 0;
    const operatingExpenses = parseFloat(data.operating_expenses) || 0;
    const totalTaxes = parseFloat(data.total_taxes) || 0;

    const grossProfit = grossRevenue - operatingExpenses;
    const grossMargin = grossRevenue > 0 ? (grossProfit / grossRevenue) * 100 : 0;
    
    const netProfit = netRevenue - operatingExpenses;
    const netMargin = netRevenue > 0 ? (netProfit / netRevenue) * 100 : 0;
    
    // EBITDA simplified as net profit (since we don't track depreciation, etc.)
    const ebitda = netProfit;
    const ebitdaMargin = netRevenue > 0 ? (ebitda / netRevenue) * 100 : 0;

    return {
      grossRevenue: new Money(grossRevenue),
      netRevenue: new Money(netRevenue),
      operatingExpenses: new Money(operatingExpenses),
      grossProfit: new Money(grossProfit),
      grossMargin,
      netProfit: new Money(netProfit),
      netMargin,
      ebitda: new Money(ebitda),
      ebitdaMargin
    };
  }
}
