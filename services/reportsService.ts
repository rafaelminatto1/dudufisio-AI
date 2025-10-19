// services/reportsService.ts
import { supabase } from '../lib/supabaseClient';
import type { Database } from '../types/database';
import type { StockValuationReport } from '../types';

// ============================================================================
// TIPOS PARA RELATÓRIOS E ANALYTICS
// ============================================================================

export interface ScheduledReport {
  id: string;
  reportName: string;
  reportType: string;
  parameters: Record<string, any>;
  scheduleType: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  scheduleTime: string;
  scheduleDay?: number;
  recipients: string[];
  format: 'pdf' | 'excel' | 'csv';
  isActive: boolean;
  lastRun?: string;
  nextRun?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReportHistory {
  id: string;
  scheduledReportId?: string;
  reportName: string;
  reportType: string;
  parameters: Record<string, any>;
  filePath?: string;
  fileSize?: number;
  recipients: string[];
  status: 'generating' | 'completed' | 'failed' | 'sent';
  errorMessage?: string;
  generatedBy?: string;
  generatedAt: string;
  sentAt?: string;
}

export interface PerformanceMetric {
  id: string;
  metricName: string;
  metricCategory: string;
  metricValue: number;
  metricUnit?: string;
  targetValue?: number;
  periodStart: string;
  periodEnd: string;
  metadata?: Record<string, any>;
  calculatedAt: string;
}

export interface ConsumptionAnalytics {
  supplyId: string;
  supplyName: string;
  category: string;
  subcategory?: string;
  brand?: string;
  unitOfMeasure: string;
  currentStock: number;
  minimumStock: number;
  maximumStock?: number;
  unitCost?: number;
  movementCount30d: number;
  totalConsumed30d: number;
  totalReceived30d: number;
  totalConsumed90d: number;
  totalReceived90d: number;
  totalConsumed365d: number;
  totalReceived365d: number;
  totalCostConsumed: number;
  totalCostReceived: number;
  stockTurnover30d: number;
  avgDailyConsumption30d: number;
  avgMonthlyConsumption90d: number;
  daysOfStockRemaining?: number;
  lastMovementDate?: string;
  supplierName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TaskCostAnalytics {
  taskId: string;
  taskTitle: string;
  taskType?: string;
  taskStatus?: string;
  taskDate: string;
  estimatedDuration?: number;
  actualDuration?: number;
  patientId?: string;
  patientName?: string;
  therapistId?: string;
  therapistName?: string;
  totalSupplyCost: number;
  suppliesUsedCount: number;
  totalQuantityUsed: number;
  avgCostPerSupply: number;
  laborCost?: number;
  overheadCost?: number;
  calculatedTotalCost?: number;
}

export interface SupplierPerformanceAnalytics {
  supplierId: string;
  supplierName: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  deliveryTimeDays: number;
  totalProducts: number;
  activeProducts: number;
  totalOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  overdueOrders: number;
  totalOrderValue: number;
  completedOrderValue: number;
  avgDeliveryDays?: number;
  onTimeDeliveryRate: number;
  performanceRating: string;
  createdAt: string;
}

export interface ReportFilters {
  startDate?: string;
  endDate?: string;
  category?: string;
  supplierId?: string;
  taskType?: string;
  patientId?: string;
  therapistId?: string;
}

// ============================================================================
// SERVIÇO DE ANALYTICS DE CONSUMO
// ============================================================================

export const getConsumptionAnalytics = async (filters?: ReportFilters): Promise<ConsumptionAnalytics[]> => {
  try {
    let query = supabase
      .from('supply_consumption_analytics')
      .select('*');

    if (filters?.category) {
      query = query.eq('category', filters.category);
    }

    if (filters?.supplierId) {
      const supplierData = await supabase.from('suppliers').select('name').eq('id', filters.supplierId).single();
      if (supplierData.data?.name) {
        query = query.eq('supplier_name', supplierData.data.name);
      }
    }

    const { data, error } = await query.order('total_consumed_30d', { ascending: false });

    if (error) throw error;
    return (data as any) || [];
  } catch (error) {
    console.error('Erro ao buscar analytics de consumo:', error);
    throw error;
  }
};

export const getConsumptionReport = async (filters: ReportFilters): Promise<ConsumptionAnalytics[]> => {
  try {
    // Use the analytics table instead of RPC function
    const { data, error } = await supabase
      .from('supply_consumption_analytics')
      .select('*')
      .gte('created_at', filters.startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      .lte('created_at', filters.endDate || new Date().toISOString());

    if (error) throw error;
    return (data as any) || [];
  } catch (error) {
    console.error('Erro ao gerar relatório de consumo:', error);
    throw error;
  }
};

// ============================================================================
// SERVIÇO DE ANALYTICS DE CUSTOS
// ============================================================================

export const getTaskCostAnalytics = async (filters?: ReportFilters): Promise<TaskCostAnalytics[]> => {
  try {
    let query = supabase
      .from('task_cost_analytics')
      .select('*');

    if (filters?.startDate) {
      query = query.gte('task_date', filters.startDate);
    }

    if (filters?.endDate) {
      query = query.lte('task_date', filters.endDate);
    }

    if (filters?.taskType) {
      query = query.eq('task_type', filters.taskType);
    }

    if (filters?.patientId) {
      query = query.eq('patient_id', filters.patientId);
    }

    if (filters?.therapistId) {
      query = query.eq('therapist_id', filters.therapistId);
    }

    const { data, error } = await query.order('task_date', { ascending: false });

    if (error) throw error;
    return (data as any) || [];
  } catch (error) {
    console.error('Erro ao buscar analytics de custos:', error);
    throw error;
  }
};

export const getCostAnalysisReport = async (filters: ReportFilters): Promise<TaskCostAnalytics[]> => {
  try {
    return await getTaskCostAnalytics(filters);
  } catch (error) {
    console.error('Erro ao gerar relatório de análise de custos:', error);
    throw error;
  }
};

// ============================================================================
// SERVIÇO DE ANALYTICS DE FORNECEDORES
// ============================================================================

export const getSupplierPerformanceAnalytics = async (): Promise<SupplierPerformanceAnalytics[]> => {
  try {
    const { data, error } = await supabase
      .from('supplier_performance_analytics')
      .select('*')
      .order('performance_rating', { ascending: false });

    if (error) throw error;
    return (data as any) || [];
  } catch (error) {
    console.error('Erro ao buscar analytics de fornecedores:', error);
    throw error;
  }
};

export const getSupplierPerformanceReport = async (supplierId?: string): Promise<SupplierPerformanceAnalytics[]> => {
  try {
    let query = supabase
      .from('supplier_performance_analytics')
      .select('*');

    if (supplierId) {
      query = query.eq('supplier_id', supplierId);
    }

    const { data, error } = await query.order('on_time_delivery_rate', { ascending: false });

    if (error) throw error;
    return (data as any) || [];
  } catch (error) {
    console.error('Erro ao gerar relatório de performance de fornecedores:', error);
    throw error;
  }
};

// ============================================================================
// SERVIÇO DE VALORIZAÇÃO DO ESTOQUE
// ============================================================================

export const getStockValuationReport = async (): Promise<StockValuationReport> => {
  try {
    const consumptionAnalytics = await getConsumptionAnalytics();
    
    const totalValue = consumptionAnalytics.reduce((sum, supply) => 
      sum + (supply.currentStock * (supply.unitCost || 0)), 0
    );

    // Breakdown por categoria
    const categoryMap = new Map<string, number>();
    consumptionAnalytics.forEach(supply => {
      const value = supply.currentStock * (supply.unitCost || 0);
      const current = categoryMap.get(supply.category) || 0;
      categoryMap.set(supply.category, current + value);
    });

    const categoryBreakdown = Array.from(categoryMap.entries())
      .map(([category, value]) => ({
        category: category as any,
        value,
        percentage: totalValue > 0 ? (value / totalValue) * 100 : 0
      }))
      .sort((a, b) => b.value - a.value);

    // Breakdown por fornecedor
    const supplierMap = new Map<string, { name: string; value: number }>();
    consumptionAnalytics.forEach(supply => {
      if (supply.supplierName) {
        const value = supply.currentStock * (supply.unitCost || 0);
        const current = supplierMap.get(supply.supplierName) || { name: supply.supplierName, value: 0 };
        supplierMap.set(supply.supplierName, {
          name: current.name,
          value: current.value + value
        });
      }
    });

    const supplierBreakdown = Array.from(supplierMap.entries())
      .map(([supplierName, data]) => ({
        supplierId: '', // Não temos ID do fornecedor aqui
        supplierName: data.name,
        value: data.value,
        percentage: totalValue > 0 ? (data.value / totalValue) * 100 : 0
      }))
      .sort((a, b) => b.value - a.value);

    return {
      totalValue,
      categoryBreakdown,
      supplierBreakdown
    };
  } catch (error) {
    console.error('Erro ao gerar relatório de valorização:', error);
    throw error;
  }
};

// ============================================================================
// SERVIÇO DE MÉTRICAS DE PERFORMANCE
// ============================================================================

export const getPerformanceMetrics = async (period?: {
  startDate?: string;
  endDate?: string;
  category?: string;
}): Promise<PerformanceMetric[]> => {
  try {
    let query = supabase
      .from('performance_metrics')
      .select('*')
      .order('calculated_at', { ascending: false });

    if (period?.startDate) {
      query = query.gte('period_start', period.startDate);
    }

    if (period?.endDate) {
      query = query.lte('period_end', period.endDate);
    }

    if (period?.category) {
      query = query.eq('metric_category', period.category);
    }

    const { data, error } = await query;

    if (error) throw error;
    return (data as any) || [];
  } catch (error) {
    console.error('Erro ao buscar métricas de performance:', error);
    throw error;
  }
};

export const calculatePerformanceMetrics = async (periodStart?: string, periodEnd?: string): Promise<number> => {
  try {
    // Use the performance metrics table instead of RPC function
    const { data, error } = await supabase
      .from('performance_metrics')
      .select('metric_value')
      .gte('period_start', periodStart || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
      .lte('period_end', periodEnd || new Date().toISOString().split('T')[0]);

    if (error) throw error;
    return data?.length || 0;
  } catch (error) {
    console.error('Erro ao calcular métricas de performance:', error);
    throw error;
  }
};

// ============================================================================
// SERVIÇO DE RELATÓRIOS AGENDADOS
// ============================================================================

export const getScheduledReports = async (): Promise<ScheduledReport[]> => {
  try {
    const { data, error } = await supabase
      .from('scheduled_reports')
      .select('*')
      .order('next_run');

    if (error) throw error;
    return (data as any) || [];
  } catch (error) {
    console.error('Erro ao buscar relatórios agendados:', error);
    throw error;
  }
};

export const createScheduledReport = async (reportData: Omit<ScheduledReport, 'id' | 'createdAt' | 'updatedAt'>): Promise<ScheduledReport> => {
  try {
    const { data, error } = await supabase
      .from('scheduled_reports')
      .insert({
        ...reportData,
        created_by: (await supabase.auth.getUser()).data.user?.id
      } as any)
      .select()
      .single();

    if (error) throw error;
    return data as any;
  } catch (error) {
    console.error('Erro ao criar relatório agendado:', error);
    throw error;
  }
};

export const updateScheduledReport = async (id: string, reportData: Partial<ScheduledReport>): Promise<ScheduledReport> => {
  try {
    const { data, error } = await supabase
      .from('scheduled_reports')
      .update({
        ...reportData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as any;
  } catch (error) {
    console.error('Erro ao atualizar relatório agendado:', error);
    throw error;
  }
};

export const deleteScheduledReport = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('scheduled_reports')
      .delete()
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error('Erro ao excluir relatório agendado:', error);
    throw error;
  }
};

// ============================================================================
// SERVIÇO DE HISTÓRICO DE RELATÓRIOS
// ============================================================================

export const getReportHistory = async (limit: number = 50): Promise<ReportHistory[]> => {
  try {
    const { data, error } = await supabase
      .from('report_history')
      .select('*')
      .order('generated_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return (data as any) || [];
  } catch (error) {
    console.error('Erro ao buscar histórico de relatórios:', error);
    throw error;
  }
};

export const createReportHistory = async (historyData: Omit<ReportHistory, 'id' | 'generatedAt'>): Promise<ReportHistory> => {
  try {
    const { data, error } = await supabase
      .from('report_history')
      .insert({
        ...historyData,
        generated_by: (await supabase.auth.getUser()).data.user?.id
      } as any)
      .select()
      .single();

    if (error) throw error;
    return data as any;
  } catch (error) {
    console.error('Erro ao criar histórico de relatório:', error);
    throw error;
  }
};

// ============================================================================
// SERVIÇO DE EXPORTAÇÃO DE RELATÓRIOS
// ============================================================================

export const exportReportToCSV = async (
  reportData: any[],
  filename: string
): Promise<string> => {
  try {
    if (reportData.length === 0) {
      throw new Error('Nenhum dado para exportar');
    }

    const headers = Object.keys(reportData[0]);
    const csvContent = [
      headers.join(','),
      ...reportData.map(row => 
        headers.map(header => {
          const value = row[header];
          // Escapar valores que contêm vírgulas ou aspas
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value || '';
        }).join(',')
      )
    ].join('\n');

    return csvContent;
  } catch (error) {
    console.error('Erro ao exportar relatório para CSV:', error);
    throw error;
  }
};

export const generateReportFilename = (reportType: string, format: string, date?: string): string => {
  const timestamp = date || new Date().toISOString().split('T')[0];
  const reportName = reportType.replace(/_/g, '-');
  return `${reportName}-${timestamp}.${format}`;
};

// ============================================================================
// FUNÇÕES AUXILIARES
// ============================================================================

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

export const formatPercentage = (value: number, decimals: number = 1): string => {
  return `${value.toFixed(decimals)}%`;
};

export const formatNumber = (value: number, decimals: number = 0): string => {
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(value);
};

export const getReportSummary = async (): Promise<{
  totalReports: number;
  activeScheduledReports: number;
  reportsGeneratedToday: number;
  lastReportGenerated?: string;
}> => {
  try {
    const [scheduledReports, reportHistory] = await Promise.all([
      getScheduledReports(),
      getReportHistory(100)
    ]);

    const today = new Date().toISOString().split('T')[0];
    const reportsGeneratedToday = reportHistory.filter(
      report => report.generatedAt.split('T')[0] === today
    ).length;

    return {
      totalReports: scheduledReports.length,
      activeScheduledReports: scheduledReports.filter(report => report.isActive).length,
      reportsGeneratedToday,
      lastReportGenerated: reportHistory[0]?.generatedAt
    };
  } catch (error) {
    console.error('Erro ao gerar resumo de relatórios:', error);
    return {
      totalReports: 0,
      activeScheduledReports: 0,
      reportsGeneratedToday: 0
    };
  }
};
