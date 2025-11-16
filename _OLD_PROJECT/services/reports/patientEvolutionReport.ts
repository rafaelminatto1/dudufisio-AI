/**
 * services/reports/patientEvolutionReport.ts
 * 
 * Service para geração de relatório de evolução do paciente
 */

import { surgeryService } from '@/services/supabase/surgeryService';
import { pathologyService } from '@/services/supabase/pathologyService';
import { goalsService } from '@/services/supabase/goalsService';
import { assessmentTestService } from '@/services/supabase/assessmentTestService';
import { predictionService } from '@/services/ai/predictionService';

export interface PatientEvolutionReport {
  patient: {
    id: string;
    name: string;
    code?: string;
    age?: number;
    gender?: string;
  };
  period: {
    startDate: string;
    endDate: string;
    durationDays: number;
  };
  surgeries: {
    count: number;
    latest?: any;
    list: any[];
  };
  pathologies: {
    active: any[];
    resolved: any[];
    total: number;
  };
  goals: {
    completed: any[];
    active: any[];
    total: number;
    successRate: number;
  };
  assessments: {
    tests: any[];
    total: number;
    overdue: number;
  };
  clinical: {
    adherenceRate: number;
    painReduction: number;
    functionalGain: number;
    sessionCount: number;
  };
  predictions: {
    dischargeDate?: string;
    recidiveRisk?: number;
    satisfaction?: number;
  };
  recommendations: string[];
  generatedAt: string;
}

export async function generatePatientEvolutionReport(
  patientId: string,
  startDate: string,
  endDate: string
): Promise<PatientEvolutionReport> {
  try {
    // Buscar dados do paciente
    const surgeries = await surgeryService.getSurgeriesByPatient(patientId);
    const pathologies = await pathologyService.getPathologiesByPatient(patientId);
    const goals = await goalsService.getGoalsByPatient(patientId);
    const testConfigs = await assessmentTestService.getTestConfigsByPatient(patientId);

    // Calcular período
    const durationDays = Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24));

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

    // Calcular métricas clínicas (mock - TODO: buscar dados reais)
    const adherenceRate = 85;
    const painReduction = 45;
    const functionalGain = 35;
    const sessionCount = 12;

    // Gerar predições
    const latestSurgery = surgeries[0];
    const activePathologies = pathologies.filter(p => p.status === 'active');
    const activeGoals = goals.filter(g => g.status === 'active');

    let predictions: any = {};
    let recommendations: string[] = [];

    if (latestSurgery) {
      predictions = await predictionService.predictDischargeDate(
        latestSurgery,
        activePathologies,
        activeGoals,
        sessionCount
      );

      const recidiveRisk = await predictionService.predictRecidiveRisk(
        latestSurgery,
        activePathologies,
        adherenceRate,
        painReduction
      );

      const satisfaction = await predictionService.predictSatisfaction(
        painReduction,
        functionalGain,
        adherenceRate,
        goals.filter(g => g.status === 'completed').length
      );

      predictions.recidiveRisk = recidiveRisk;
      predictions.satisfaction = satisfaction;

      recommendations = await predictionService.generateRecommendations(
        latestSurgery,
        activePathologies,
        activeGoals,
        adherenceRate,
        5
      );
    }

    // Calcular taxa de sucesso de metas
    const completedGoals = goals.filter(g => g.status === 'completed');
    const successRate = goals.length > 0 ? (completedGoals.length / goals.length) * 100 : 0;

    // Testes em atraso
    const overdueTests = testConfigs.filter(t => 
      t.nextDueDate && new Date(t.nextDueDate) < new Date()
    );

    // Montar relatório
    const report: PatientEvolutionReport = {
      patient: {
        id: patientId,
        name: 'Paciente', // TODO: buscar nome real
        code: 'PAC-000001',
        age: 45,
        gender: 'M'
      },
      period: {
        startDate,
        endDate,
        durationDays
      },
      surgeries: {
        count: surgeriesInPeriod.length,
        latest: surgeries[0],
        list: surgeriesInPeriod
      },
      pathologies: {
        active: pathologies.filter(p => p.status === 'active'),
        resolved: pathologies.filter(p => p.status === 'resolved'),
        total: pathologies.length
      },
      goals: {
        completed: completedGoals,
        active: activeGoals,
        total: goals.length,
        successRate
      },
      assessments: {
        tests: testConfigs,
        total: testConfigs.length,
        overdue: overdueTests.length
      },
      clinical: {
        adherenceRate,
        painReduction,
        functionalGain,
        sessionCount
      },
      predictions: {
        dischargeDate: predictions.predictedDischargeDate,
        recidiveRisk: predictions.recidiveRisk?.risk,
        satisfaction: predictions.satisfaction?.score
      },
      recommendations: recommendations.map(r => r.text),
      generatedAt: new Date().toISOString()
    };

    return report;
  } catch (error) {
    console.error('Erro ao gerar relatório de evolução:', error);
    throw error;
  }
}

export async function exportPatientEvolutionReport(
  report: PatientEvolutionReport,
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

