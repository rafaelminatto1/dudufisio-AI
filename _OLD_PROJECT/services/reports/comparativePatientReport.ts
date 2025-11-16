/**
 * services/reports/comparativePatientReport.ts
 * 
 * Service para geração de relatório comparativo entre pacientes
 */

import { surgeryService } from '@/services/supabase/surgeryService';
import { pathologyService } from '@/services/supabase/pathologyService';
import { goalsService } from '@/services/supabase/goalsService';

export interface ComparativePatientReport {
  period: {
    startDate: string;
    endDate: string;
  };
  patients: {
    id: string;
    name: string;
    age?: number;
    gender?: string;
    metrics: {
      surgeryCount: number;
      pathologyCount: number;
      activeGoals: number;
      completedGoals: number;
      successRate: number;
      adherenceRate: number;
      painReduction: number;
      functionalGain: number;
      sessionCount: number;
    };
  }[];
  averages: {
    surgeryCount: number;
    pathologyCount: number;
    activeGoals: number;
    completedGoals: number;
    successRate: number;
    adherenceRate: number;
    painReduction: number;
    functionalGain: number;
    sessionCount: number;
  };
  comparisons: {
    bestPerformer: {
      id: string;
      name: string;
      metric: string;
      value: number;
    };
    worstPerformer: {
      id: string;
      name: string;
      metric: string;
      value: number;
    };
    outliers: {
      id: string;
      name: string;
      metric: string;
      value: number;
      type: 'above' | 'below';
    }[];
  };
  generatedAt: string;
}

export async function generateComparativePatientReport(
  patientIds: string[],
  startDate: string,
  endDate: string
): Promise<ComparativePatientReport> {
  try {
    // Buscar dados de todos os pacientes
    const patientsData = await Promise.all(
      patientIds.map(async (patientId) => {
        const surgeries = await surgeryService.getSurgeriesByPatient(patientId);
        const pathologies = await pathologyService.getPathologiesByPatient(patientId);
        const goals = await goalsService.getGoalsByPatient(patientId);

        // Filtrar dados do período
        const surgeriesInPeriod = surgeries.filter(s => 
          new Date(s.date) >= new Date(startDate) && new Date(s.date) <= new Date(endDate)
        );

        const pathologiesInPeriod = pathologies.filter(p => 
          new Date(p.diagnosisDate) >= new Date(startDate) && new Date(p.diagnosisDate) <= new Date(endDate)
        );

        const goalsInPeriod = goals.filter(g => 
          g.createdAt && new Date(g.createdAt) >= new Date(startDate) && new Date(g.createdAt) <= new Date(endDate)
        );

        const completedGoals = goalsInPeriod.filter(g => g.status === 'completed');
        const activeGoals = goalsInPeriod.filter(g => g.status === 'active');

        // Calcular métricas (mock - TODO: buscar dados reais)
        const successRate = goalsInPeriod.length > 0 ? (completedGoals.length / goalsInPeriod.length) * 100 : 0;
        const adherenceRate = 85; // Mock
        const painReduction = 45; // Mock
        const functionalGain = 35; // Mock
        const sessionCount = 12; // Mock

        return {
          id: patientId,
          name: `Paciente ${patientId.slice(0, 8)}`, // TODO: buscar nome real
          age: 45,
          gender: 'M',
          metrics: {
            surgeryCount: surgeriesInPeriod.length,
            pathologyCount: pathologiesInPeriod.length,
            activeGoals: activeGoals.length,
            completedGoals: completedGoals.length,
            successRate,
            adherenceRate,
            painReduction,
            functionalGain,
            sessionCount
          }
        };
      })
    );

    // Calcular médias
    const averages = {
      surgeryCount: patientsData.reduce((acc, p) => acc + p.metrics.surgeryCount, 0) / patientsData.length,
      pathologyCount: patientsData.reduce((acc, p) => acc + p.metrics.pathologyCount, 0) / patientsData.length,
      activeGoals: patientsData.reduce((acc, p) => acc + p.metrics.activeGoals, 0) / patientsData.length,
      completedGoals: patientsData.reduce((acc, p) => acc + p.metrics.completedGoals, 0) / patientsData.length,
      successRate: patientsData.reduce((acc, p) => acc + p.metrics.successRate, 0) / patientsData.length,
      adherenceRate: patientsData.reduce((acc, p) => acc + p.metrics.adherenceRate, 0) / patientsData.length,
      painReduction: patientsData.reduce((acc, p) => acc + p.metrics.painReduction, 0) / patientsData.length,
      functionalGain: patientsData.reduce((acc, p) => acc + p.metrics.functionalGain, 0) / patientsData.length,
      sessionCount: patientsData.reduce((acc, p) => acc + p.metrics.sessionCount, 0) / patientsData.length
    };

    // Identificar melhores e piores desempenhos
    const bestSuccessRate = patientsData.reduce((best, current) => 
      current.metrics.successRate > best.metrics.successRate ? current : best
    );

    const worstSuccessRate = patientsData.reduce((worst, current) => 
      current.metrics.successRate < worst.metrics.successRate ? current : worst
    );

    // Identificar outliers (acima ou abaixo de 2 desvios padrão)
    const successRates = patientsData.map(p => p.metrics.successRate);
    const mean = successRates.reduce((acc, val) => acc + val, 0) / successRates.length;
    const variance = successRates.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / successRates.length;
    const stdDev = Math.sqrt(variance);

    const outliers = patientsData
      .filter(p => Math.abs(p.metrics.successRate - mean) > 2 * stdDev)
      .map(p => ({
        id: p.id,
        name: p.name,
        metric: 'Taxa de Sucesso',
        value: p.metrics.successRate,
        type: p.metrics.successRate > mean ? 'above' as const : 'below' as const
      }));

    // Montar relatório
    const report: ComparativePatientReport = {
      period: {
        startDate,
        endDate
      },
      patients: patientsData,
      averages,
      comparisons: {
        bestPerformer: {
          id: bestSuccessRate.id,
          name: bestSuccessRate.name,
          metric: 'Taxa de Sucesso',
          value: bestSuccessRate.metrics.successRate
        },
        worstPerformer: {
          id: worstSuccessRate.id,
          name: worstSuccessRate.name,
          metric: 'Taxa de Sucesso',
          value: worstSuccessRate.metrics.successRate
        },
        outliers
      },
      generatedAt: new Date().toISOString()
    };

    return report;
  } catch (error) {
    console.error('Erro ao gerar relatório comparativo:', error);
    throw error;
  }
}

export async function exportComparativePatientReport(
  report: ComparativePatientReport,
  format: 'pdf' | 'excel' | 'json'
): Promise<Blob | string> {
  switch (format) {
    case 'json':
      return JSON.stringify(report, null, 2);
    
    case 'pdf':
      // TODO: Implementar geração de PDF
      throw new Error('Export PDF ainda não implementado');
    
    case 'excel':
      // TODO: Implementar geração de Excel
      throw new Error('Export Excel ainda não implementado');
    
    default:
      throw new Error(`Formato ${format} não suportado`);
  }
}

