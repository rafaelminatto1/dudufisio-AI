import { createServerComponentClient } from '~/lib/supabase/server';

export interface FinancialReport {
  period: {
    start: string;
    end: string;
  };
  revenue: {
    total: number;
    growth: number;
    forecast: number[];
    breakdown: {
      category: string;
      value: number;
      percentage: number;
    }[];
    byPaymentMethod: {
      method: string;
      transactions: number;
      total: number;
      percentage: number;
    }[];
  };
  expenses: {
    total: number;
    breakdown: {
      category: string;
      value: number;
      percentage: number;
    }[];
  };
  profitability: {
    grossProfit: number;
    netProfit: number;
    profitMargin: number;
    averageRevenuePerPatient: number;
    averageRevenuePerHour: number;
    costPerSession: number;
  };
  collections: {
    totalCollected: number;
    outstandingBalance: number;
    collectionRate: number;
    overdueAmount: number;
    byStatus: {
      status: string;
      amount: number;
      count: number;
    }[];
  };
  metrics: {
    ticketMedio: number;
    sessionsBilled: number;
    defaultRate: number;
    paymentCollection: number;
  };
  trends: {
    dailyRevenue: Array<{
      date: string;
      revenue: number;
      sessions: number;
    }>;
    monthlyComparison: Array<{
      month: string;
      revenue: number;
      growth: number;
    }>;
  };
  insights: Array<{
    type: 'trend' | 'anomaly' | 'forecast' | 'recommendation';
    title: string;
    description: string;
    impact: 'high' | 'medium' | 'low';
    actionable: boolean;
  }>;
  recommendations: string[];
}

/**
 * Service para gerenciar relatórios financeiros avançados
 * Adaptado para Next.js App Router
 */
export class FinancialReportService {
  /**
   * Gera relatório financeiro completo
   */
  static async generateFinancialReport(params: {
    startDate: string;
    endDate: string;
    includeForecasts?: boolean;
    includeTrends?: boolean;
  }): Promise<{ data: FinancialReport | null; error: any }> {
    try {
      const supabase = await createServerComponentClient();

      // Buscar transações financeiras
      const { data: transactions, error: transactionsError } = await supabase
        .from('financial_transactions')
        .select('*')
        .gte('created_at', params.startDate)
        .lte('created_at', params.endDate)
        .order('created_at', { ascending: true });

      if (transactionsError) throw transactionsError;

      // Buscar agendamentos para calcular receita
      const { data: appointments, error: appointmentsError } = await supabase
        .from('appointments')
        .select('*, patient:patients(*)')
        .gte('start_time', params.startDate)
        .lte('start_time', params.endDate)
        .eq('status', 'concluido');

      if (appointmentsError) throw appointmentsError;

      // Calcular receita total
      const revenueTransactions = (transactions || []).filter(
        t => t.transaction_type === 'receita'
      );
      const totalRevenue = revenueTransactions.reduce(
        (sum, t) => sum + (t.amount || 0),
        0
      );

      // Calcular receita por método de pagamento
      const revenueByMethod = this.calculateRevenueByPaymentMethod(
        revenueTransactions
      );

      // Calcular receita por categoria
      const revenueByCategory = this.calculateRevenueByCategory(
        revenueTransactions
      );

      // Calcular despesas
      const expenseTransactions = (transactions || []).filter(
        t => t.transaction_type === 'despesa'
      );
      const totalExpenses = expenseTransactions.reduce(
        (sum, t) => sum + (t.amount || 0),
        0
      );

      // Calcular métricas de lucratividade
      const grossProfit = totalRevenue - totalExpenses;
      const profitMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;
      const sessionsBilled = appointments?.length || 0;
      const ticketMedio = sessionsBilled > 0 ? totalRevenue / sessionsBilled : 0;

      // Calcular receita por hora (simplificado)
      const averageRevenuePerHour = this.calculateAverageRevenuePerHour(
        appointments || [],
        totalRevenue
      );

      // Calcular receita por paciente
      const uniquePatients = new Set(
        (appointments || []).map(a => a.patient_id)
      ).size;
      const averageRevenuePerPatient =
        uniquePatients > 0 ? totalRevenue / uniquePatients : 0;

      // Calcular inadimplência
      const collections = await this.calculateCollections(supabase, params);

      // Calcular crescimento (comparar com período anterior)
      const previousPeriodRevenue = await this.getPreviousPeriodRevenue(
        supabase,
        params.startDate,
        params.endDate
      );
      const growth =
        previousPeriodRevenue > 0
          ? ((totalRevenue - previousPeriodRevenue) / previousPeriodRevenue) * 100
          : 0;

      // Gerar tendências
      const trends = params.includeTrends
        ? await this.generateTrends(supabase, params)
        : {
            dailyRevenue: [],
            monthlyComparison: [],
          };

      // Gerar previsões
      const forecast = params.includeForecasts
        ? this.generateForecast(totalRevenue, growth)
        : [];

      // Gerar insights
      const insights = this.generateInsights(
        totalRevenue,
        growth,
        profitMargin,
        collections.collectionRate
      );

      // Gerar recomendações
      const recommendations = this.generateRecommendations(
        profitMargin,
        collections.defaultRate,
        growth
      );

      const report: FinancialReport = {
        period: {
          start: params.startDate,
          end: params.endDate,
        },
        revenue: {
          total: totalRevenue,
          growth: Math.round(growth * 100) / 100,
          forecast,
          breakdown: revenueByCategory,
          byPaymentMethod: revenueByMethod,
        },
        expenses: {
          total: totalExpenses,
          breakdown: this.calculateExpensesByCategory(expenseTransactions),
        },
        profitability: {
          grossProfit,
          netProfit: grossProfit, // Simplificado - em produção calcularia impostos
          profitMargin: Math.round(profitMargin * 100) / 100,
          averageRevenuePerPatient: Math.round(averageRevenuePerPatient * 100) / 100,
          averageRevenuePerHour: Math.round(averageRevenuePerHour * 100) / 100,
          costPerSession: sessionsBilled > 0 ? totalExpenses / sessionsBilled : 0,
        },
        collections,
        metrics: {
          ticketMedio: Math.round(ticketMedio * 100) / 100,
          sessionsBilled,
          defaultRate: collections.defaultRate,
          paymentCollection: collections.collectionRate,
        },
        trends,
        insights,
        recommendations,
      };

      return { data: report, error: null };
    } catch (error) {
      console.error('Error generating financial report:', error);
      return { data: null, error };
    }
  }

  /**
   * Calcula receita por método de pagamento
   */
  private static calculateRevenueByPaymentMethod(transactions: any[]) {
    const byMethod: Record<string, { transactions: number; total: number }> = {};

    transactions.forEach(t => {
      const method = t.payment_method || 'outros';
      if (!byMethod[method]) {
        byMethod[method] = { transactions: 0, total: 0 };
      }
      byMethod[method].transactions++;
      byMethod[method].total += t.amount || 0;
    });

    const total = transactions.reduce((sum, t) => sum + (t.amount || 0), 0);

    return Object.entries(byMethod).map(([method, data]) => ({
      method,
      transactions: data.transactions,
      total: data.total,
      percentage: total > 0 ? (data.total / total) * 100 : 0,
    }));
  }

  /**
   * Calcula receita por categoria
   */
  private static calculateRevenueByCategory(transactions: any[]) {
    const byCategory: Record<string, number> = {};

    transactions.forEach(t => {
      const category = t.category || 'outros';
      byCategory[category] = (byCategory[category] || 0) + (t.amount || 0);
    });

    const total = transactions.reduce((sum, t) => sum + (t.amount || 0), 0);

    return Object.entries(byCategory).map(([category, value]) => ({
      category,
      value,
      percentage: total > 0 ? (value / total) * 100 : 0,
    }));
  }

  /**
   * Calcula despesas por categoria
   */
  private static calculateExpensesByCategory(transactions: any[]) {
    const byCategory: Record<string, number> = {};

    transactions.forEach(t => {
      const category = t.category || 'outros';
      byCategory[category] = (byCategory[category] || 0) + (t.amount || 0);
    });

    const total = transactions.reduce((sum, t) => sum + (t.amount || 0), 0);

    return Object.entries(byCategory).map(([category, value]) => ({
      category,
      value,
      percentage: total > 0 ? (value / total) * 100 : 0,
    }));
  }

  /**
   * Calcula receita média por hora
   */
  private static calculateAverageRevenuePerHour(
    appointments: any[],
    totalRevenue: number
  ): number {
    if (appointments.length === 0) return 0;

    // Agrupar por hora do dia
    const hourlyRevenue: Record<number, number> = {};
    const hourlySessions: Record<number, number> = {};

    appointments.forEach(apt => {
      const hour = new Date(apt.start_time).getHours();
      hourlyRevenue[hour] = (hourlyRevenue[hour] || 0) + (apt.price || 0);
      hourlySessions[hour] = (hourlySessions[hour] || 0) + 1;
    });

    // Calcular média
    const hours = Object.keys(hourlyRevenue).length;
    return hours > 0 ? totalRevenue / hours : 0;
  }

  /**
   * Calcula métricas de cobrança
   */
  private static async calculateCollections(
    supabase: any,
    params: { startDate: string; endDate: string }
  ) {
    // Buscar transações pendentes
    const { data: pendingTransactions } = await supabase
      .from('financial_transactions')
      .select('*')
      .gte('created_at', params.startDate)
      .lte('created_at', params.endDate)
      .in('status', ['pendente', 'atrasado']);

    const totalCollected = 0; // Seria calculado das transações pagas
    const outstandingBalance = (pendingTransactions || []).reduce(
      (sum: number, t: any) => sum + (t.amount || 0),
      0
    );
    const overdueAmount = (pendingTransactions || [])
      .filter((t: any) => t.status === 'atrasado')
      .reduce((sum: number, t: any) => sum + (t.amount || 0), 0);

    const totalBilled = totalCollected + outstandingBalance;
    const collectionRate = totalBilled > 0 ? (totalCollected / totalBilled) * 100 : 100;
    const defaultRate = totalBilled > 0 ? (outstandingBalance / totalBilled) * 100 : 0;

    return {
      totalCollected,
      outstandingBalance,
      collectionRate: Math.round(collectionRate * 100) / 100,
      overdueAmount,
      defaultRate: Math.round(defaultRate * 100) / 100,
      byStatus: [
        { status: 'pago', amount: totalCollected, count: 0 },
        { status: 'pendente', amount: outstandingBalance - overdueAmount, count: 0 },
        { status: 'atrasado', amount: overdueAmount, count: 0 },
      ],
    };
  }

  /**
   * Obtém receita do período anterior
   */
  private static async getPreviousPeriodRevenue(
    supabase: any,
    startDate: string,
    endDate: string
  ): Promise<number> {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const periodDays = Math.ceil(
      (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
    );

    const previousStart = new Date(start);
    previousStart.setDate(previousStart.getDate() - periodDays);
    const previousEnd = new Date(start);

    const { data: transactions } = await supabase
      .from('financial_transactions')
      .select('amount')
      .gte('created_at', previousStart.toISOString())
      .lt('created_at', previousEnd.toISOString())
      .eq('transaction_type', 'receita');

    return (transactions || []).reduce((sum: number, t: any) => sum + (t.amount || 0), 0);
  }

  /**
   * Gera tendências de receita
   */
  private static async generateTrends(
    supabase: any,
    params: { startDate: string; endDate: string }
  ) {
    // Receita diária
    const { data: dailyTransactions } = await supabase
      .from('financial_transactions')
      .select('created_at, amount')
      .gte('created_at', params.startDate)
      .lte('created_at', params.endDate)
      .eq('transaction_type', 'receita')
      .order('created_at', { ascending: true });

    const dailyRevenue: Record<string, { revenue: number; sessions: number }> = {};

    (dailyTransactions || []).forEach((t: any) => {
      const date = new Date(t.created_at).toISOString().split('T')[0];
      if (!dailyRevenue[date]) {
        dailyRevenue[date] = { revenue: 0, sessions: 0 };
      }
      dailyRevenue[date].revenue += t.amount || 0;
      dailyRevenue[date].sessions += 1;
    });

    const dailyRevenueArray = Object.entries(dailyRevenue).map(([date, data]) => ({
      date,
      revenue: data.revenue,
      sessions: data.sessions,
    }));

    // Comparação mensal (simplificado)
    const monthlyComparison = [
      { month: 'Mês Anterior', revenue: 0, growth: 0 },
      { month: 'Mês Atual', revenue: 0, growth: 0 },
    ];

    return {
      dailyRevenue: dailyRevenueArray,
      monthlyComparison,
    };
  }

  /**
   * Gera previsão de receita
   */
  private static generateForecast(currentRevenue: number, growth: number): number[] {
    const forecast: number[] = [];
    let projected = currentRevenue;

    for (let i = 0; i < 3; i++) {
      projected = projected * (1 + growth / 100);
      forecast.push(Math.round(projected));
    }

    return forecast;
  }

  /**
   * Gera insights financeiros
   */
  private static generateInsights(
    revenue: number,
    growth: number,
    profitMargin: number,
    collectionRate: number
  ) {
    const insights: FinancialReport['insights'] = [];

    if (growth > 10) {
      insights.push({
        type: 'trend',
        title: 'Crescimento Sustentado',
        description: `Receita cresceu ${growth.toFixed(1)}% em relação ao período anterior`,
        impact: 'high',
        actionable: false,
      });
    }

    if (profitMargin < 30) {
      insights.push({
        type: 'recommendation',
        title: 'Margem de Lucro Baixa',
        description: `Margem de lucro de ${profitMargin.toFixed(1)}% está abaixo do ideal`,
        impact: 'high',
        actionable: true,
      });
    }

    if (collectionRate < 90) {
      insights.push({
        type: 'anomaly',
        title: 'Taxa de Cobrança Baixa',
        description: `Taxa de cobrança de ${collectionRate.toFixed(1)}% precisa de atenção`,
        impact: 'medium',
        actionable: true,
      });
    }

    return insights;
  }

  /**
   * Gera recomendações financeiras
   */
  private static generateRecommendations(
    profitMargin: number,
    defaultRate: number,
    growth: number
  ): string[] {
    const recommendations: string[] = [];

    if (profitMargin < 30) {
      recommendations.push('Revisar custos operacionais e otimizar despesas');
      recommendations.push('Aumentar eficiência operacional para melhorar margem');
    }

    if (defaultRate > 5) {
      recommendations.push('Implementar estratégias de cobrança mais eficazes');
      recommendations.push('Revisar políticas de pagamento e inadimplência');
    }

    if (growth > 15) {
      recommendations.push('Considerar expansão de capacidade para atender demanda crescente');
      recommendations.push('Investir em marketing para manter crescimento');
    }

    if (recommendations.length === 0) {
      recommendations.push('Manter práticas atuais - indicadores financeiros saudáveis');
    }

    return recommendations;
  }

  /**
   * Gera DRE (Demonstrativo de Resultado do Exercício)
   */
  static async generateDRE(params: {
    startDate: string;
    endDate: string;
  }): Promise<{ data: any | null; error: any }> {
    try {
      const { data: report, error } = await this.generateFinancialReport({
        ...params,
        includeForecasts: false,
        includeTrends: false,
      });

      if (error) throw error;

      const dre = {
        receita: {
          total: report?.revenue.total || 0,
          detalhamento: report?.revenue.breakdown || [],
        },
        despesas: {
          total: report?.expenses.total || 0,
          detalhamento: report?.expenses.breakdown || [],
        },
        resultado: {
          bruto: report?.profitability.grossProfit || 0,
          liquido: report?.profitability.netProfit || 0,
          margem: report?.profitability.profitMargin || 0,
        },
      };

      return { data: dre, error: null };
    } catch (error) {
      console.error('Error generating DRE:', error);
      return { data: null, error };
    }
  }
}
