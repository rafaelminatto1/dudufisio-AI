import { createServerComponentClient } from '~/lib/supabase/server';
import { Database } from '~/types/database.types';

export type ReportCategory = 'financial' | 'clinical' | 'operational' | 'compliance' | 'custom';
export type ReportType = 'summary' | 'detailed' | 'analytical' | 'comparative';
export type ExportFormat = 'pdf' | 'excel' | 'csv' | 'json';

export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  category: ReportCategory;
  type: ReportType;
  parameters: Record<string, any>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ReportData {
  summary: {
    totalRecords: number;
    dateRange: {
      start: string;
      end: string;
    };
    keyMetrics: Array<{
      label: string;
      value: number;
      unit?: string;
      change?: number;
    }>;
  };
  sections: Array<{
    id: string;
    title: string;
    type: 'metrics' | 'chart' | 'table' | 'text';
    content: any;
  }>;
}

export interface GeneratedReport {
  id: string;
  template_id: string;
  title: string;
  parameters: Record<string, any>;
  data: ReportData;
  generated_at: string;
  generated_by: string;
  status: 'generating' | 'completed' | 'failed';
}

/**
 * Service para gerenciar relatórios gerais
 * Adaptado para Next.js App Router
 */
export class ReportService {
  /**
   * Lista todos os templates de relatório
   */
  static async getReportTemplates(category?: ReportCategory) {
    try {
      const supabase = await createServerComponentClient();
      let query = supabase
        .from('report_templates')
        .select('*')
        .eq('is_active', true)
        .order('name', { ascending: true });

      if (category) {
        query = query.eq('category', category);
      }

      const { data, error } = await query;
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching report templates:', error);
      return { data: null, error };
    }
  }

  /**
   * Gera um relatório baseado em template
   */
  static async generateReport(params: {
    templateId: string;
    parameters: Record<string, any>;
    userId: string;
  }) {
    try {
      const supabase = await createServerComponentClient();
      
      // Buscar template
      const { data: template, error: templateError } = await supabase
        .from('report_templates')
        .select('*')
        .eq('id', params.templateId)
        .single();

      if (templateError || !template) {
        throw new Error('Template not found');
      }

      // Gerar dados do relatório baseado no tipo
      const reportData = await this.generateReportData(template, params.parameters);

      // Salvar relatório gerado
      const { data: report, error: reportError } = await supabase
        .from('generated_reports')
        .insert({
          template_id: params.templateId,
          title: template.name,
          parameters: params.parameters,
          data: reportData,
          generated_by: params.userId,
          status: 'completed',
        })
        .select()
        .single();

      if (reportError) throw reportError;

      return { data: report, error: null };
    } catch (error) {
      console.error('Error generating report:', error);
      return { data: null, error };
    }
  }

  /**
   * Gera dados do relatório baseado no template
   */
  private static async generateReportData(
    template: any,
    parameters: Record<string, any>
  ): Promise<ReportData> {
    const startDate = parameters.startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const endDate = parameters.endDate || new Date().toISOString();

    // Baseado na categoria, buscar dados apropriados
    switch (template.category) {
      case 'financial':
        return await this.generateFinancialData(startDate, endDate);
      case 'clinical':
        return await this.generateClinicalData(startDate, endDate, parameters);
      case 'operational':
        return await this.generateOperationalData(startDate, endDate);
      default:
        return this.generateDefaultData(startDate, endDate);
    }
  }

  /**
   * Gera dados financeiros
   */
  private static async generateFinancialData(startDate: string, endDate: string): Promise<ReportData> {
    const supabase = await createServerComponentClient();
    
    const { data: transactions } = await supabase
      .from('financial_transactions')
      .select('*')
      .gte('created_at', startDate)
      .lte('created_at', endDate)
      .eq('transaction_type', 'receita');

    const totalRevenue = (transactions || []).reduce((sum, t) => sum + (t.amount || 0), 0);

    return {
      summary: {
        totalRecords: transactions?.length || 0,
        dateRange: { start: startDate, end: endDate },
        keyMetrics: [
          { label: 'Receita Total', value: totalRevenue, unit: 'R$' },
          { label: 'Transações', value: transactions?.length || 0 },
        ],
      },
      sections: [],
    };
  }

  /**
   * Gera dados clínicos
   */
  private static async generateClinicalData(
    startDate: string,
    endDate: string,
    parameters: Record<string, any>
  ): Promise<ReportData> {
    const supabase = await createServerComponentClient();
    
    const { data: appointments } = await supabase
      .from('appointments')
      .select('*')
      .gte('start_time', startDate)
      .lte('start_time', endDate);

    const completed = (appointments || []).filter(a => a.status === 'concluido').length;

    return {
      summary: {
        totalRecords: appointments?.length || 0,
        dateRange: { start: startDate, end: endDate },
        keyMetrics: [
          { label: 'Sessões Agendadas', value: appointments?.length || 0 },
          { label: 'Sessões Concluídas', value: completed },
        ],
      },
      sections: [],
    };
  }

  /**
   * Gera dados operacionais
   */
  private static async generateOperationalData(startDate: string, endDate: string): Promise<ReportData> {
    return {
      summary: {
        totalRecords: 0,
        dateRange: { start: startDate, end: endDate },
        keyMetrics: [],
      },
      sections: [],
    };
  }

  /**
   * Gera dados padrão
   */
  private static generateDefaultData(startDate: string, endDate: string): ReportData {
    return {
      summary: {
        totalRecords: 0,
        dateRange: { start: startDate, end: endDate },
        keyMetrics: [],
      },
      sections: [],
    };
  }

  /**
   * Exporta relatório para formato específico
   */
  static async exportReport(reportId: string, format: ExportFormat) {
    try {
      const supabase = await createServerComponentClient();
      const { data: report, error } = await supabase
        .from('generated_reports')
        .select('*')
        .eq('id', reportId)
        .single();

      if (error || !report) {
        throw new Error('Report not found');
      }

      // Aqui seria implementada a lógica de exportação
      // Por enquanto, retorna os dados
      return { data: { report, format }, error: null };
    } catch (error) {
      console.error('Error exporting report:', error);
      return { data: null, error };
    }
  }

  /**
   * Lista relatórios gerados
   */
  static async getGeneratedReports(filters?: {
    templateId?: string;
    userId?: string;
    startDate?: string;
    endDate?: string;
  }) {
    try {
      const supabase = await createServerComponentClient();
      let query = supabase
        .from('generated_reports')
        .select('*')
        .order('generated_at', { ascending: false });

      if (filters?.templateId) {
        query = query.eq('template_id', filters.templateId);
      }

      if (filters?.userId) {
        query = query.eq('generated_by', filters.userId);
      }

      if (filters?.startDate) {
        query = query.gte('generated_at', filters.startDate);
      }

      if (filters?.endDate) {
        query = query.lte('generated_at', filters.endDate);
      }

      const { data, error } = await query;
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching generated reports:', error);
      return { data: null, error };
    }
  }
}

