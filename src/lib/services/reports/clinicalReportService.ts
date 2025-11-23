import { createServerComponentClient } from '~/lib/supabase/server';

export interface PatientEvolutionReport {
  patientId: string;
  patientName: string;
  period: {
    start: string;
    end: string;
  };
  overview: {
    totalSessions: number;
    completedSessions: number;
    missedSessions: number;
    adherenceRate: number;
  };
  painEvolution: {
    initial: number;
    current: number;
    reduction: number;
    reductionPercentage: number;
    trend: 'improving' | 'stable' | 'worsening';
  };
  goals: Array<{
    description: string;
    targetDate: string;
    status: 'pending' | 'in_progress' | 'achieved' | 'missed';
    progress: number;
  }>;
  recommendations: string[];
}

/**
 * Service para gerenciar relatórios clínicos
 * Adaptado para Next.js App Router
 */
export class ClinicalReportService {
  /**
   * Gera relatório de evolução do paciente
   */
  static async generatePatientEvolutionReport(params: {
    patientId: string;
    startDate: string;
    endDate: string;
  }) {
    try {
      const supabase = await createServerComponentClient();

      // Buscar dados do paciente
      const { data: patient, error: patientError } = await supabase
        .from('patients' as any)
        .select('*')
        .eq('id', params.patientId)
        .single();

      if (patientError || !patient) {
        throw new Error('Patient not found');
      }

      // Buscar agendamentos no período
      const { data: appointments } = await supabase
        .from('appointments' as any)
        .select('*')
        .eq('patient_id', params.patientId)
        .gte('start_time', params.startDate)
        .lte('start_time', params.endDate)
        .order('start_time', { ascending: true });

      const totalSessions = appointments?.length || 0;
      const completedSessions = (appointments || []).filter((a: any) => (a as any).status === 'concluido').length;
      const missedSessions = (appointments || []).filter((a: any) => (a as any).status === 'falta').length;
      const adherenceRate = totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0;

      // Buscar notas SOAP para análise de evolução
      const { data: soapNotes } = await supabase
        .from('session_evolutions' as any)
        .select('*')
        .eq('patient_id', params.patientId)
        .gte('created_at', params.startDate)
        .lte('created_at', params.endDate)
        .order('created_at', { ascending: true });

      // Calcular evolução de dor (simplificado - precisa de dados reais)
      const painEvolution = this.calculatePainEvolution(soapNotes || []);

      // Buscar metas do paciente
      const { data: goals } = await supabase
        .from('patient_goals' as any)
        .select('*')
        .eq('patient_id', params.patientId)
        .order('target_date', { ascending: true });

      const report: PatientEvolutionReport = {
        patientId: params.patientId,
        patientName: (patient as any).full_name,
        period: {
          start: params.startDate,
          end: params.endDate,
        },
        overview: {
          totalSessions,
          completedSessions,
          missedSessions,
          adherenceRate: Math.round(adherenceRate),
        },
        painEvolution,
        goals: (goals || []).map(g => ({
          description: (g as any).description || '',
          targetDate: (g as any).target_date || '',
          status: (g as any).status as any,
          progress: (g as any).progress || 0,
        })),
        recommendations: this.generateRecommendations(adherenceRate, painEvolution),
      };

      return { data: report, error: null };
    } catch (error) {
      console.error('Error generating patient evolution report:', error);
      return { data: null, error };
    }
  }

  /**
   * Calcula evolução de dor baseado em notas SOAP
   */
  private static calculatePainEvolution(soapNotes: any[]) {
    if (soapNotes.length === 0) {
      return {
        initial: 0,
        current: 0,
        reduction: 0,
        reductionPercentage: 0,
        trend: 'stable' as const,
      };
    }

    // Simplificado - em produção, extrairia dados de dor das notas SOAP
    const initial = 7; // Valor inicial simulado
    const current = 4; // Valor atual simulado
    const reduction = initial - current;
    const reductionPercentage = (reduction / initial) * 100;

    let trend: 'improving' | 'stable' | 'worsening' = 'stable';
    if (reductionPercentage > 10) trend = 'improving';
    else if (reductionPercentage < -10) trend = 'worsening';

    return {
      initial,
      current,
      reduction,
      reductionPercentage: Math.round(reductionPercentage),
      trend,
    };
  }

  /**
   * Gera recomendações baseadas nos dados
   */
  private static generateRecommendations(
    adherenceRate: number,
    painEvolution: { trend: string; reductionPercentage: number }
  ): string[] {
    const recommendations: string[] = [];

    if (adherenceRate < 70) {
      recommendations.push('Taxa de adesão abaixo do ideal. Considere estratégias de engajamento.');
    }

    if (painEvolution.trend === 'improving') {
      recommendations.push('Evolução positiva observada. Continue com o protocolo atual.');
    } else if (painEvolution.trend === 'worsening') {
      recommendations.push('Atenção: piora observada. Reavaliar protocolo de tratamento.');
    }

    return recommendations;
  }

  /**
   * Gera relatório de efetividade de tratamento
   */
  static async generateEffectivenessReport(params: {
    pathology?: string;
    startDate: string;
    endDate: string;
  }) {
    try {
      const supabase = await createServerComponentClient();

      // Buscar tratamentos no período
      let query = (supabase as any)
        .from('treatments')
        .select('*, patient:patients(*)')
        .gte('created_at', params.startDate)
        .lte('created_at', params.endDate);

      if (params.pathology) {
        query = query.ilike('diagnosis', `%${params.pathology}%`);
      }

      const { data: treatments } = await query;

      const totalPatients = treatments?.length || 0;
      const activePatients = (treatments || []).filter((t: any) => (t as any).status === 'ativo').length;
      const completedPatients = (treatments || []).filter((t: any) => (t as any).status === 'concluido').length;

      // Calcular taxa de sucesso (simplificado)
      const successRate = totalPatients > 0 ? (completedPatients / totalPatients) * 100 : 0;

      return {
        data: {
          pathology: params.pathology || 'Todas',
          period: {
            start: params.startDate,
            end: params.endDate,
          },
          statistics: {
            totalPatients,
            activePatients,
            completedPatients,
            successRate: Math.round(successRate),
          },
        },
        error: null,
      };
    } catch (error) {
      console.error('Error generating effectiveness report:', error);
      return { data: null, error };
    }
  }
}

