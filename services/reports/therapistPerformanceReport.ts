/**
 * services/reports/therapistPerformanceReport.ts
 * 
 * Service para geração de relatório de performance do terapeuta
 */

import { surgeryService } from '@/services/supabase/surgeryService';
import { pathologyService } from '@/services/supabase/pathologyService';
import { goalsService } from '@/services/supabase/goalsService';

export interface TherapistPerformanceReport {
  therapist: {
    id: string;
    name: string;
  };
  period: {
    startDate: string;
    endDate: string;
  };
  metrics: {
    totalPatients: number;
    activePatients: number;
    totalSessions: number;
    averageSessionsPerPatient: number;
    averageAdherenceRate: number;
    averagePainReduction: number;
    averageFunctionalGain: number;
    averageGoalSuccessRate: number;
    averageSatisfaction: number;
  };
  patientBreakdown: {
    byStatus: {
      active: number;
      inactive: number;
      discharged: number;
    };
    byAgeGroup: {
      '18-30': number;
      '31-45': number;
      '46-60': number;
      '60+': number;
    };
    byGender: {
      male: number;
      female: number;
      other: number;
    };
  };
  performanceComparison: {
    vsBenchmark: {
      adherenceRate: number;
      painReduction: number;
      functionalGain: number;
      goalSuccessRate: number;
    };
    vsTeamAverage: {
      adherenceRate: number;
      painReduction: number;
      functionalGain: number;
      goalSuccessRate: number;
    };
  };
  strengths: string[];
  areasForImprovement: string[];
  generatedAt: string;
}

export async function generateTherapistPerformanceReport(
  therapistId: string,
  startDate: string,
  endDate: string
): Promise<TherapistPerformanceReport> {
  try {
    // TODO: Buscar pacientes do terapeuta do banco de dados
    // Por enquanto, usando dados mock
    const patientIds: string[] = []; // Mock

    // Buscar dados de todos os pacientes do terapeuta
    const patientsData = await Promise.all(
      patientIds.map(async (patientId) => {
        const surgeries = await surgeryService.getSurgeriesByPatient(patientId);
        const pathologies = await pathologyService.getPathologiesByPatient(patientId);
        const goals = await goalsService.getGoalsByPatient(patientId);

        const completedGoals = goals.filter(g => g.status === 'completed');
        const successRate = goals.length > 0 ? (completedGoals.length / goals.length) * 100 : 0;

        // Calcular métricas (mock - TODO: buscar dados reais)
        const adherenceRate = 85;
        const painReduction = 45;
        const functionalGain = 35;
        const sessionCount = 12;

        return {
          id: patientId,
          name: `Paciente ${patientId.slice(0, 8)}`,
          age: 45,
          gender: 'M' as const,
          status: 'active' as const,
          metrics: {
            successRate,
            adherenceRate,
            painReduction,
            functionalGain,
            sessionCount
          }
        };
      })
    );

    // Calcular métricas agregadas
    const totalPatients = patientsData.length;
    const activePatients = patientsData.filter(p => p.status === 'active').length;
    const totalSessions = patientsData.reduce((acc, p) => acc + p.metrics.sessionCount, 0);
    const averageSessionsPerPatient = totalPatients > 0 ? totalSessions / totalPatients : 0;
    const averageAdherenceRate = totalPatients > 0 
      ? patientsData.reduce((acc, p) => acc + p.metrics.adherenceRate, 0) / totalPatients 
      : 0;
    const averagePainReduction = totalPatients > 0 
      ? patientsData.reduce((acc, p) => acc + p.metrics.painReduction, 0) / totalPatients 
      : 0;
    const averageFunctionalGain = totalPatients > 0 
      ? patientsData.reduce((acc, p) => acc + p.metrics.functionalGain, 0) / totalPatients 
      : 0;
    const averageGoalSuccessRate = totalPatients > 0 
      ? patientsData.reduce((acc, p) => acc + p.metrics.successRate, 0) / totalPatients 
      : 0;
    const averageSatisfaction = 4.5; // Mock

    // Breakdown de pacientes
    const byStatus = {
      active: patientsData.filter(p => p.status === 'active').length,
      inactive: patientsData.filter(p => p.status === 'inactive').length,
      discharged: patientsData.filter(p => p.status === 'discharged').length
    };

    const byAgeGroup = {
      '18-30': patientsData.filter(p => p.age && p.age >= 18 && p.age <= 30).length,
      '31-45': patientsData.filter(p => p.age && p.age >= 31 && p.age <= 45).length,
      '46-60': patientsData.filter(p => p.age && p.age >= 46 && p.age <= 60).length,
      '60+': patientsData.filter(p => p.age && p.age > 60).length
    };

    const byGender = {
      male: patientsData.filter(p => p.gender === 'M').length,
      female: patientsData.filter(p => p.gender === 'F').length,
      other: patientsData.filter(p => p.gender !== 'M' && p.gender !== 'F').length
    };

    // Comparação com benchmarks
    const benchmarks = {
      adherenceRate: 80,
      painReduction: 40,
      functionalGain: 30,
      goalSuccessRate: 70
    };

    const vsBenchmark = {
      adherenceRate: averageAdherenceRate - benchmarks.adherenceRate,
      painReduction: averagePainReduction - benchmarks.painReduction,
      functionalGain: averageFunctionalGain - benchmarks.functionalGain,
      goalSuccessRate: averageGoalSuccessRate - benchmarks.goalSuccessRate
    };

    // Comparação com média da equipe (mock)
    const teamAverages = {
      adherenceRate: 82,
      painReduction: 42,
      functionalGain: 32,
      goalSuccessRate: 72
    };

    const vsTeamAverage = {
      adherenceRate: averageAdherenceRate - teamAverages.adherenceRate,
      painReduction: averagePainReduction - teamAverages.painReduction,
      functionalGain: averageFunctionalGain - teamAverages.functionalGain,
      goalSuccessRate: averageGoalSuccessRate - teamAverages.goalSuccessRate
    };

    // Identificar forças e áreas de melhoria
    const strengths: string[] = [];
    const areasForImprovement: string[] = [];

    if (averageAdherenceRate > benchmarks.adherenceRate) {
      strengths.push('Taxa de aderência acima da média');
    } else {
      areasForImprovement.push('Melhorar taxa de aderência dos pacientes');
    }

    if (averagePainReduction > benchmarks.painReduction) {
      strengths.push('Excelente redução de dor');
    } else {
      areasForImprovement.push('Focar em técnicas de redução de dor');
    }

    if (averageFunctionalGain > benchmarks.functionalGain) {
      strengths.push('Ganho funcional superior');
    } else {
      areasForImprovement.push('Melhorar protocolos de ganho funcional');
    }

    if (averageGoalSuccessRate > benchmarks.goalSuccessRate) {
      strengths.push('Alta taxa de sucesso de metas');
    } else {
      areasForImprovement.push('Ajustar definição e acompanhamento de metas');
    }

    // Montar relatório
    const report: TherapistPerformanceReport = {
      therapist: {
        id: therapistId,
        name: 'Terapeuta' // TODO: buscar nome real
      },
      period: {
        startDate,
        endDate
      },
      metrics: {
        totalPatients,
        activePatients,
        totalSessions,
        averageSessionsPerPatient,
        averageAdherenceRate,
        averagePainReduction,
        averageFunctionalGain,
        averageGoalSuccessRate,
        averageSatisfaction
      },
      patientBreakdown: {
        byStatus,
        byAgeGroup,
        byGender
      },
      performanceComparison: {
        vsBenchmark,
        vsTeamAverage
      },
      strengths,
      areasForImprovement,
      generatedAt: new Date().toISOString()
    };

    return report;
  } catch (error) {
    console.error('Erro ao gerar relatório de performance:', error);
    throw error;
  }
}

export async function exportTherapistPerformanceReport(
  report: TherapistPerformanceReport,
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

