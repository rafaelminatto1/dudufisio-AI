/**
 * Serviço de Relatórios Clínicos
 * Gera relatórios de evolução, efetividade e adesão ao tratamento
 */

import { Patient, SoapNote } from '../../types';

export interface PatientEvolutionReport {
  patientId: string;
  patientName: string;
  period: {
    start: Date;
    end: Date;
  };
  overview: {
    totalSessions: number;
    completedSessions: number;
    missedSessions: number;
    adherenceRate: number; // 0-100
  };
  painEvolution: {
    initial: number;
    current: number;
    reduction: number;
    reductionPercentage: number;
    trend: 'improving' | 'stable' | 'worsening';
  };
  functionalEvolution: {
    initial: number;
    current: number;
    improvement: number;
    improvementPercentage: number;
  };
  goals: Array<{
    description: string;
    targetDate: Date;
    status: 'pending' | 'in_progress' | 'achieved' | 'missed';
    progress: number; // 0-100
  }>;
  metrics: Array<{
    name: string;
    initial: number;
    current: number;
    unit: string;
    change: number;
    changePercentage: number;
  }>;
  recommendations: string[];
  nextSteps: string[];
}

export interface EffectivenessReport {
  pathology: string;
  period: {
    start: Date;
    end: Date;
  };
  statistics: {
    totalPatients: number;
    activePatients: number;
    dischargedPatients: number;
    averageTreatmentDuration: number; // dias
    averageSessionsPerPatient: number;
  };
  outcomes: {
    successRate: number; // 0-100
    improvementRate: number;
    dropoutRate: number;
    averagePainReduction: number;
    averageFunctionalImprovement: number;
  };
  comparisonWithBenchmark: {
    successRate: 'above' | 'average' | 'below';
    treatmentDuration: 'shorter' | 'average' | 'longer';
    patientSatisfaction: 'higher' | 'average' | 'lower';
  };
  topProtocols: Array<{
    protocolName: string;
    patientsCount: number;
    successRate: number;
    averageDuration: number;
  }>;
  recommendations: string[];
}

export interface AdherenceReport {
  period: {
    start: Date;
    end: Date;
  };
  overall: {
    totalPatients: number;
    averageAdherence: number;
    highAdherence: number; // >= 80%
    mediumAdherence: number; // 50-79%
    lowAdherence: number; // < 50%
  };
  byTherapist: Array<{
    therapistId: string;
    therapistName: string;
    patientsCount: number;
    averageAdherence: number;
    adherenceRate: number;
  }>;
  factors: {
    positiveFactors: Array<{
      factor: string;
      impact: number; // correlação
      description: string;
    }>;
    negativeFactors: Array<{
      factor: string;
      impact: number;
      description: string;
    }>;
  };
  atRiskPatients: Array<{
    patientId: string;
    patientName: string;
    adherence: number;
    missedSessions: number;
    lastSession: Date;
    riskLevel: 'high' | 'medium' | 'low';
    suggestedActions: string[];
  }>;
  recommendations: string[];
}

export interface TreatmentProtocol {
  id: string;
  name: string;
  pathology: string;
  duration: number; // dias
  sessionsPerWeek: number;
  totalSessions: number;
  exercises: string[];
  techniques: string[];
}

class ClinicalReportService {
  /**
   * Gera relatório de evolução do paciente
   */
  async generatePatientEvolutionReport(
    patientId: string,
    startDate: Date,
    endDate: Date
  ): Promise<PatientEvolutionReport> {
    try {
      // Mock data - em produção buscar do banco
      const report: PatientEvolutionReport = {
        patientId,
        patientName: 'Maria Silva Santos',
        period: { start: startDate, end: endDate },
        overview: {
          totalSessions: 12,
          completedSessions: 10,
          missedSessions: 2,
          adherenceRate: 83.3
        },
        painEvolution: {
          initial: 8,
          current: 3,
          reduction: 5,
          reductionPercentage: 62.5,
          trend: 'improving'
        },
        functionalEvolution: {
          initial: 45,
          current: 78,
          improvement: 33,
          improvementPercentage: 73.3
        },
        goals: [
          {
            description: 'Reduzir dor para nível 3 ou menos',
            targetDate: new Date('2025-02-01'),
            status: 'achieved',
            progress: 100
          },
          {
            description: 'Retornar às atividades diárias sem limitação',
            targetDate: new Date('2025-02-15'),
            status: 'in_progress',
            progress: 75
          },
          {
            description: 'Voltar a praticar corrida',
            targetDate: new Date('2025-03-01'),
            status: 'pending',
            progress: 30
          }
        ],
        metrics: [
          {
            name: 'Amplitude de Movimento',
            initial: 45,
            current: 88,
            unit: 'graus',
            change: 43,
            changePercentage: 95.6
          },
          {
            name: 'Força Muscular',
            initial: 8,
            current: 16,
            unit: 'kg',
            change: 8,
            changePercentage: 100
          }
        ],
        recommendations: [
          'Continuar com protocolo atual por mais 2 semanas',
          'Iniciar progressão para exercícios de impacto',
          'Manter frequência de 3x por semana',
          'Incluir treino proprioceptivo'
        ],
        nextSteps: [
          'Avaliação funcional completa na próxima sessão',
          'Discussão sobre alta programada',
          'Orientações para manutenção pós-tratamento'
        ]
      };

      return report;
    } catch (error) {
      console.error('Erro ao gerar relatório de evolução:', error);
      throw new Error('Falha ao gerar relatório de evolução');
    }
  }

  /**
   * Gera relatório de efetividade por patologia
   */
  async generateEffectivenessReport(
    pathology: string,
    startDate: Date,
    endDate: Date
  ): Promise<EffectivenessReport> {
    try {
      const report: EffectivenessReport = {
        pathology,
        period: { start: startDate, end: endDate },
        statistics: {
          totalPatients: 45,
          activePatients: 28,
          dischargedPatients: 17,
          averageTreatmentDuration: 42,
          averageSessionsPerPatient: 14.5
        },
        outcomes: {
          successRate: 85.2,
          improvementRate: 92.4,
          dropoutRate: 7.6,
          averagePainReduction: 4.8,
          averageFunctionalImprovement: 65.3
        },
        comparisonWithBenchmark: {
          successRate: 'above',
          treatmentDuration: 'average',
          patientSatisfaction: 'higher'
        },
        topProtocols: [
          {
            protocolName: 'Protocolo McKenzie + Fortalecimento Core',
            patientsCount: 18,
            successRate: 88.9,
            averageDuration: 38
          },
          {
            protocolName: 'Terapia Manual + Exercícios',
            patientsCount: 15,
            successRate: 86.7,
            averageDuration: 45
          },
          {
            protocolName: 'Pilates Clínico',
            patientsCount: 12,
            successRate: 75.0,
            averageDuration: 50
          }
        ],
        recommendations: [
          'Protocolo McKenzie mostra melhor efetividade para lombalgia',
          'Considerar implementar programa de prevenção de recidivas',
          'Taxa de abandono está abaixo da média nacional',
          'Manter foco em educação do paciente'
        ]
      };

      return report;
    } catch (error) {
      console.error('Erro ao gerar relatório de efetividade:', error);
      throw new Error('Falha ao gerar relatório de efetividade');
    }
  }

  /**
   * Gera relatório de adesão ao tratamento
   */
  async generateAdherenceReport(
    startDate: Date,
    endDate: Date
  ): Promise<AdherenceReport> {
    try {
      const report: AdherenceReport = {
        period: { start: startDate, end: endDate },
        overall: {
          totalPatients: 78,
          averageAdherence: 76.5,
          highAdherence: 52,
          mediumAdherence: 18,
          lowAdherence: 8
        },
        byTherapist: [
          {
            therapistId: 'therapist_001',
            therapistName: 'Dr. Roberto Silva',
            patientsCount: 32,
            averageAdherence: 82.3,
            adherenceRate: 85.4
          },
          {
            therapistId: 'therapist_002',
            therapistName: 'Dra. Ana Costa',
            patientsCount: 28,
            averageAdherence: 75.8,
            adherenceRate: 78.2
          },
          {
            therapistId: 'therapist_003',
            therapistName: 'Dr. Carlos Mendes',
            patientsCount: 18,
            averageAdherence: 68.5,
            adherenceRate: 72.1
          }
        ],
        factors: {
          positiveFactors: [
            {
              factor: 'Agendamento Flexível',
              impact: 0.78,
              description: 'Pacientes com horários flexíveis têm 78% mais adesão'
            },
            {
              factor: 'Lembretes Automáticos',
              impact: 0.65,
              description: 'Lembretes 24h antes aumentam adesão em 65%'
            },
            {
              factor: 'Gamificação',
              impact: 0.52,
              description: 'Sistema de pontos aumenta engajamento em 52%'
            }
          ],
          negativeFactors: [
            {
              factor: 'Distância da Clínica',
              impact: -0.45,
              description: 'Pacientes com mais de 10km têm 45% menos adesão'
            },
            {
              factor: 'Complexidade do Protocolo',
              impact: -0.32,
              description: 'Protocolos com mais de 5 exercícios têm menor adesão'
            },
            {
              factor: 'Falta de Feedback',
              impact: -0.28,
              description: 'Ausência de feedback regular reduz adesão em 28%'
            }
          ]
        },
        atRiskPatients: [
          {
            patientId: 'patient_015',
            patientName: 'João Silva',
            adherence: 45.2,
            missedSessions: 6,
            lastSession: new Date('2025-01-10'),
            riskLevel: 'high',
            suggestedActions: [
              'Contato imediato via telefone',
              'Oferecer reagendamento flexível',
              'Verificar barreiras ao tratamento',
              'Considerar home care se apropriado'
            ]
          },
          {
            patientId: 'patient_032',
            patientName: 'Carla Santos',
            adherence: 58.3,
            missedSessions: 4,
            lastSession: new Date('2025-01-15'),
            riskLevel: 'medium',
            suggestedActions: [
              'Enviar mensagem de acompanhamento',
              'Reforçar importância da continuidade',
              'Verificar satisfação com tratamento'
            ]
          }
        ],
        recommendations: [
          'Implementar sistema de lembretes via WhatsApp',
          'Criar programa de incentivos para alta adesão',
          'Revisar protocolos com baixa adesão',
          'Oferecer opções de teleorientação para pacientes distantes',
          'Estabelecer follow-up proativo para pacientes em risco'
        ]
      };

      return report;
    } catch (error) {
      console.error('Erro ao gerar relatório de adesão:', error);
      throw new Error('Falha ao gerar relatório de adesão');
    }
  }

  /**
   * Exporta relatório para PDF
   */
  async exportToPDF(report: any, reportType: string): Promise<Blob> {
    try {
      // Em produção, usar biblioteca como jsPDF ou pdfmake
      console.log(`Exportando relatório ${reportType} para PDF`);
      
      // Simulação
      const blob = new Blob(['PDF content'], { type: 'application/pdf' });
      return blob;
    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
      throw new Error('Falha ao exportar relatório');
    }
  }

  /**
   * Exporta relatório para Excel
   */
  async exportToExcel(report: any, reportType: string): Promise<Blob> {
    try {
      // Em produção, usar biblioteca como xlsx
      console.log(`Exportando relatório ${reportType} para Excel`);
      
      const blob = new Blob(['Excel content'], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      return blob;
    } catch (error) {
      console.error('Erro ao exportar Excel:', error);
      throw new Error('Falha ao exportar relatório');
    }
  }

  /**
   * Calcula tendência de evolução
   */
  calculateTrend(values: number[]): 'improving' | 'stable' | 'worsening' {
    if (values.length < 2) return 'stable';
    
    const firstHalf = values.slice(0, Math.floor(values.length / 2));
    const secondHalf = values.slice(Math.floor(values.length / 2));
    
    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
    
    const change = ((secondAvg - firstAvg) / firstAvg) * 100;
    
    if (change > 10) return 'improving';
    if (change < -10) return 'worsening';
    return 'stable';
  }

  /**
   * Gera insights baseados em IA
   */
  async generateAIInsights(report: any): Promise<string[]> {
    try {
      // Em produção, integrar com Gemini AI
      const insights = [
        'Paciente apresenta evolução consistente e dentro do esperado',
        'Taxa de adesão está acima da média nacional (85% vs 70%)',
        'Recomenda-se manter protocolo atual por mais 2 semanas',
        'Considerar alta programada para daqui a 1 mês'
      ];
      
      return insights;
    } catch (error) {
      console.error('Erro ao gerar insights:', error);
      return [];
    }
  }

  /**
   * Compara com benchmarks da literatura
   */
  async compareWithBenchmarks(
    pathology: string,
    outcomes: any
  ): Promise<{
    comparison: 'above' | 'average' | 'below';
    benchmarkValue: number;
    actualValue: number;
    difference: number;
  }> {
    try {
      // Em produção, buscar benchmarks de banco de dados
      const benchmark = {
        lombalgia: { successRate: 75, treatmentDuration: 45 },
        cervicalgia: { successRate: 80, treatmentDuration: 35 },
        joelho: { successRate: 82, treatmentDuration: 50 }
      };

      const pathologyBenchmark = benchmark[pathology as keyof typeof benchmark] || 
        { successRate: 75, treatmentDuration: 45 };

      const difference = outcomes.successRate - pathologyBenchmark.successRate;
      
      let comparison: 'above' | 'average' | 'below';
      if (difference > 5) comparison = 'above';
      else if (difference < -5) comparison = 'below';
      else comparison = 'average';

      return {
        comparison,
        benchmarkValue: pathologyBenchmark.successRate,
        actualValue: outcomes.successRate,
        difference
      };
    } catch (error) {
      console.error('Erro ao comparar com benchmarks:', error);
      throw new Error('Falha ao comparar com benchmarks');
    }
  }
}

export const clinicalReportService = new ClinicalReportService();
