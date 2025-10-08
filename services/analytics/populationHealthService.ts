/**
 * Population Health Analytics Service
 * Serviço de Análise de Saúde da População
 */

import {
  PopulationHealthDashboard,
  PopulationDemographics,
  ConditionDistribution,
  ClinicalOutcomes,
  TreatmentEffectiveness,
  ServiceUtilization,
  RiskDistribution,
  AdherenceMetrics,
  SatisfactionQualityMetrics,
  EpidemiologicalTrends,
  PopulationInsight,
  PopulationRecommendation,
  PopulationFilters,
  AnalysisPeriod,
  CohortAnalysis,
  BenchmarkComparison,
  RealTimePopulationMetrics
} from '../../types/populationHealthTypes';
import { Patient, Appointment, SoapNote } from '../../types';

class PopulationHealthService {
  /**
   * Gera dashboard completo de saúde da população
   */
  async getPopulationHealthDashboard(
    period: AnalysisPeriod,
    filters?: PopulationFilters
  ): Promise<PopulationHealthDashboard> {
    // Em produção, buscar dados reais do banco
    const patients = await this.getFilteredPatients(filters);
    
    const demographics = await this.calculateDemographics(patients, period);
    const conditionDistribution = await this.analyzeConditionDistribution(patients);
    const clinicalOutcomes = await this.analyzeClinicalOutcomes(patients, period);
    const treatmentEffectiveness = await this.analyzeTreatmentEffectiveness(patients, period);
    const serviceUtilization = await this.analyzeServiceUtilization(period);
    const riskDistribution = await this.analyzeRiskDistribution(patients, period);
    const adherenceMetrics = await this.analyzeAdherence(patients, period);
    const satisfactionQuality = await this.analyzeSatisfactionQuality(period);
    const epidemiologicalTrends = await this.analyzeEpidemiologicalTrends(period);
    
    const insights = await this.generateInsights({
      demographics,
      clinicalOutcomes,
      treatmentEffectiveness,
      serviceUtilization,
      riskDistribution,
      adherenceMetrics
    });
    
    const recommendations = await this.generateRecommendations(insights, patients);
    
    return {
      period,
      filters: filters || {},
      summary: {
        totalPatients: patients.length,
        activePatients: patients.filter(p => p.status === 'Active').length,
        newPatients: this.countNewPatients(patients, period),
        averageAge: this.calculateAverageAge(patients),
        mostCommonConditions: this.getMostCommonConditions(patients, 5),
        overallSuccessRate: clinicalOutcomes.successRate,
        overallSatisfaction: satisfactionQuality.patientSatisfaction.averageScore
      },
      demographics,
      conditionDistribution,
      clinicalOutcomes,
      treatmentEffectiveness,
      serviceUtilization,
      riskDistribution,
      adherenceMetrics,
      satisfactionQuality,
      epidemiologicalTrends,
      insights,
      recommendations
    };
  }

  /**
   * Calcula demografia da população
   */
  private async calculateDemographics(
    patients: Patient[],
    period: AnalysisPeriod
  ): Promise<PopulationDemographics> {
    const total = patients.length;
    
    // Distribuição por idade
    const ageRanges = [
      '0-17', '18-25', '26-35', '36-45', '46-55', '56-65', '66-75', '76+'
    ];
    
    const ageDistribution = ageRanges.map(range => {
      const [min, max] = range.includes('+') 
        ? [parseInt(range), 999] 
        : range.split('-').map(Number);
      
      const count = patients.filter(p => {
        const age = this.calculateAge(p.birthDate);
        return age >= min && age <= max;
      }).length;
      
      return {
        range,
        count,
        percentage: (count / total) * 100
      };
    });
    
    // Distribuição por gênero
    const genderDistribution = [
      { gender: 'M' as const, count: 0, percentage: 0 },
      { gender: 'F' as const, count: 0, percentage: 0 },
      { gender: 'other' as const, count: 0, percentage: 0 }
    ];
    
    patients.forEach(p => {
      const genderEntry = genderDistribution.find(g => g.gender === p.gender);
      if (genderEntry) {
        genderEntry.count++;
      }
    });
    
    genderDistribution.forEach(g => {
      g.percentage = (g.count / total) * 100;
    });
    
    // Distribuição geográfica
    const cityMap = new Map<string, number>();
    patients.forEach(p => {
      const key = `${p.address.city},${p.address.state}`;
      cityMap.set(key, (cityMap.get(key) || 0) + 1);
    });
    
    const geographicDistribution = Array.from(cityMap.entries())
      .map(([key, count]) => {
        const [city, state] = key.split(',');
        return {
          city,
          state,
          count,
          percentage: (count / total) * 100
        };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
    
    // Distribuição por tipo de convênio
    const insuranceMap = new Map<string, number>();
    patients.forEach(p => {
      const type = p.insuranceType || 'none';
      insuranceMap.set(type, (insuranceMap.get(type) || 0) + 1);
    });
    
    const insuranceDistribution = Array.from(insuranceMap.entries())
      .map(([type, count]) => ({
        type: type as any,
        count,
        percentage: (count / total) * 100
      }));
    
    return {
      totalPatients: total,
      activePatients: patients.filter(p => p.status === 'Active').length,
      newPatients: this.countNewPatients(patients, period),
      inactivePatients: patients.filter(p => p.status === 'Inactive').length,
      ageDistribution,
      genderDistribution,
      geographicDistribution,
      insuranceDistribution
    };
  }

  /**
   * Analisa distribuição de condições
   */
  private async analyzeConditionDistribution(
    patients: Patient[]
  ): Promise<ConditionDistribution[]> {
    const conditionMap = new Map<string, {
      count: number;
      totalDuration: number;
      totalSessions: number;
      successes: number;
      comorbidities: Map<string, number>;
    }>();
    
    patients.forEach(p => {
      if (!p.conditions) return;
      
      p.conditions.forEach(c => {
        const existing = conditionMap.get(c.name) || {
          count: 0,
          totalDuration: 0,
          totalSessions: 0,
          successes: 0,
          comorbidities: new Map()
        };
        
        existing.count++;
        // Mock data - em produção viria do banco
        existing.totalDuration += 60; // dias
        existing.totalSessions += 12;
        existing.successes += Math.random() > 0.2 ? 1 : 0;
        
        // Comorbidades
        p.conditions?.forEach(other => {
          if (other.name !== c.name) {
            existing.comorbidities.set(
              other.name,
              (existing.comorbidities.get(other.name) || 0) + 1
            );
          }
        });
        
        conditionMap.set(c.name, existing);
      });
    });
    
    const total = patients.length;
    
    return Array.from(conditionMap.entries())
      .map(([condition, data]) => ({
        condition,
        count: data.count,
        percentage: (data.count / total) * 100,
        averageTreatmentDuration: data.totalDuration / data.count,
        averageSessionsRequired: data.totalSessions / data.count,
        successRate: data.successes / data.count,
        comorbidities: Array.from(data.comorbidities.entries())
          .map(([cond, count]) => ({
            condition: cond,
            cooccurrenceRate: count / data.count
          }))
          .sort((a, b) => b.cooccurrenceRate - a.cooccurrenceRate)
          .slice(0, 5)
      }))
      .sort((a, b) => b.count - a.count);
  }

  /**
   * Analisa outcomes clínicos
   */
  private async analyzeClinicalOutcomes(
    patients: Patient[],
    period: AnalysisPeriod
  ): Promise<ClinicalOutcomes> {
    // Mock data - em produção viria do banco com dados reais
    return {
      period,
      overallImprovement: [
        {
          metric: 'Amplitude de Movimento',
          averageChange: 25.5,
          unit: 'graus',
          clinicallySignificantRate: 0.78
        },
        {
          metric: 'Força Muscular',
          averageChange: 15.3,
          unit: '%',
          clinicallySignificantRate: 0.72
        },
        {
          metric: 'Funcionalidade (FIM)',
          averageChange: 18.7,
          unit: 'pontos',
          clinicallySignificantRate: 0.81
        }
      ],
      successRate: 0.82,
      completionRate: 0.75,
      dropoutRate: 0.18,
      painReduction: {
        averageInitialPain: 7.2,
        averageFinalPain: 2.8,
        averageReduction: 4.4,
        percentageReduction: 61.1
      },
      functionalImprovement: [
        {
          metric: 'Escala de Barthel',
          baselineAverage: 65.3,
          finalAverage: 88.7,
          improvement: 23.4,
          percentImproved: 85.2
        },
        {
          metric: 'SF-36 Physical Function',
          baselineAverage: 42.1,
          finalAverage: 68.9,
          improvement: 26.8,
          percentImproved: 79.3
        }
      ],
      qualityOfLife: [
        {
          metric: 'EQ-5D',
          preScore: 0.62,
          postScore: 0.84,
          change: 0.22
        },
        {
          metric: 'WHOQOL-BREF',
          preScore: 58.3,
          postScore: 76.8,
          change: 18.5
        }
      ]
    };
  }

  /**
   * Analisa efetividade de tratamentos
   */
  private async analyzeTreatmentEffectiveness(
    patients: Patient[],
    period: AnalysisPeriod
  ): Promise<TreatmentEffectiveness[]> {
    // Mock data - tipos comuns de tratamento
    const treatmentTypes = [
      'Fisioterapia Ortopédica',
      'Fisioterapia Neurológica',
      'Fisioterapia Respiratória',
      'Fisioterapia Esportiva',
      'Pilates Terapêutico'
    ];
    
    return treatmentTypes.map(type => ({
      treatmentType: type,
      patientstreated: Math.floor(Math.random() * 100) + 50,
      outcomes: {
        successRate: 0.75 + Math.random() * 0.2,
        averageImprovement: 60 + Math.random() * 30,
        completionRate: 0.7 + Math.random() * 0.25,
        dropoutRate: 0.1 + Math.random() * 0.15,
        patientSatisfaction: 8 + Math.random() * 2
      },
      timeline: {
        averageDuration: 45 + Math.floor(Math.random() * 30),
        medianDuration: 42 + Math.floor(Math.random() * 25),
        averageSessions: 10 + Math.floor(Math.random() * 10)
      },
      costEffectiveness: {
        averageCostPerSession: 150 + Math.random() * 100,
        totalCostPerPatient: 1800 + Math.random() * 1200,
        costPerSuccessfulOutcome: 2400 + Math.random() * 1500
      },
      patientCharacteristics: {
        averageAge: 35 + Math.floor(Math.random() * 30),
        genderDistribution: {
          'M': 45 + Math.random() * 20,
          'F': 45 + Math.random() * 20
        },
        severityDistribution: {
          'Leve': 30 + Math.random() * 20,
          'Moderada': 40 + Math.random() * 20,
          'Grave': 20 + Math.random() * 15
        }
      }
    }));
  }

  /**
   * Analisa utilização de serviços
   */
  private async analyzeServiceUtilization(
    period: AnalysisPeriod
  ): Promise<ServiceUtilization> {
    // Mock data
    return {
      period,
      appointmentMetrics: {
        totalScheduled: 1250,
        totalCompleted: 980,
        totalCancelled: 180,
        totalNoShows: 90,
        attendanceRate: 0.784,
        cancellationRate: 0.144,
        noShowRate: 0.072
      },
      capacityUtilization: {
        totalCapacity: 2000, // horas
        usedCapacity: 1650,
        utilizationRate: 0.825,
        peakHours: [
          { hour: 9, utilizationRate: 0.92 },
          { hour: 10, utilizationRate: 0.95 },
          { hour: 14, utilizationRate: 0.88 },
          { hour: 15, utilizationRate: 0.90 }
        ],
        peakDays: [
          { day: 'Segunda', utilizationRate: 0.88 },
          { day: 'Terça', utilizationRate: 0.92 },
          { day: 'Quarta', utilizationRate: 0.87 },
          { day: 'Quinta', utilizationRate: 0.85 },
          { day: 'Sexta', utilizationRate: 0.78 }
        ]
      },
      serviceTypes: [
        { type: 'Avaliação', count: 250, percentage: 20, averageDuration: 60, revenue: 25000 },
        { type: 'Sessão', count: 730, percentage: 58.4, averageDuration: 50, revenue: 109500 },
        { type: 'Retorno', count: 180, percentage: 14.4, averageDuration: 40, revenue: 18000 },
        { type: 'Pilates', count: 90, percentage: 7.2, averageDuration: 60, revenue: 13500 }
      ],
      therapistUtilization: [
        {
          therapistId: '1',
          therapistName: 'Dr. João Silva',
          hoursWorked: 160,
          patientsServed: 85,
          utilizationRate: 0.89,
          patientSatisfaction: 9.2
        },
        {
          therapistId: '2',
          therapistName: 'Dra. Maria Santos',
          hoursWorked: 152,
          patientsServed: 78,
          utilizationRate: 0.84,
          patientSatisfaction: 9.5
        }
      ]
    };
  }

  /**
   * Analisa distribuição de risco
   */
  private async analyzeRiskDistribution(
    patients: Patient[],
    period: AnalysisPeriod
  ): Promise<RiskDistribution> {
    // Mock data
    return {
      period,
      byRiskType: [
        {
          riskType: 'Queda',
          lowRisk: 120,
          moderateRisk: 45,
          highRisk: 18,
          criticalRisk: 5,
          totalAssessed: 188
        },
        {
          riskType: 'Abandono',
          lowRisk: 95,
          moderateRisk: 62,
          highRisk: 28,
          criticalRisk: 10,
          totalAssessed: 195
        },
        {
          riskType: 'No-Show',
          lowRisk: 140,
          moderateRisk: 38,
          highRisk: 15,
          criticalRisk: 4,
          totalAssessed: 197
        }
      ],
      byCondition: [
        {
          condition: 'Lombalgia',
          averageRiskScore: 35.2,
          highRiskPercentage: 12.5,
          commonRiskFactors: ['Sedentarismo', 'Sobrepeso', 'Trabalho sedentário']
        },
        {
          condition: 'Gonalgia',
          averageRiskScore: 42.8,
          highRiskPercentage: 18.3,
          commonRiskFactors: ['Idade avançada', 'Obesidade', 'Histórico de trauma']
        }
      ],
      trends: this.generateRiskTrends(period),
      interventionImpact: [
        {
          riskType: 'Queda',
          patientsIntervened: 23,
          averageRiskReduction: 28.5,
          successRate: 0.87
        },
        {
          riskType: 'Abandono',
          patientsIntervened: 38,
          averageRiskReduction: 22.3,
          successRate: 0.79
        }
      ]
    };
  }

  /**
   * Analisa adesão ao tratamento
   */
  private async analyzeAdherence(
    patients: Patient[],
    period: AnalysisPeriod
  ): Promise<AdherenceMetrics> {
    return {
      period,
      overallAdherence: {
        averageAttendanceRate: 0.812,
        completionRate: 0.748,
        onTimeCompletionRate: 0.682
      },
      byTreatmentType: [
        {
          treatmentType: 'Fisioterapia Ortopédica',
          adherenceRate: 0.825,
          dropoutRate: 0.145,
          averageSessionsAttended: 10.2,
          averageSessionsPlanned: 12.0
        },
        {
          treatmentType: 'Pilates Terapêutico',
          adherenceRate: 0.892,
          dropoutRate: 0.088,
          averageSessionsAttended: 14.5,
          averageSessionsPlanned: 16.0
        }
      ],
      byDemographic: [
        {
          demographic: 'Faixa Etária',
          category: '18-35',
          adherenceRate: 0.765,
          count: 95
        },
        {
          demographic: 'Faixa Etária',
          category: '36-55',
          adherenceRate: 0.842,
          count: 128
        },
        {
          demographic: 'Faixa Etária',
          category: '56+',
          adherenceRate: 0.798,
          count: 77
        }
      ],
      adherenceFactors: [
        {
          factor: 'Distância da clínica',
          positiveImpact: false,
          effectSize: -0.32,
          significance: 0.001
        },
        {
          factor: 'Satisfação com atendimento',
          positiveImpact: true,
          effectSize: 0.58,
          significance: 0.0001
        }
      ],
      trends: this.generateAdherenceTrends(period)
    };
  }

  /**
   * Analisa satisfação e qualidade
   */
  private async analyzeSatisfactionQuality(
    period: AnalysisPeriod
  ): Promise<SatisfactionQualityMetrics> {
    return {
      period,
      patientSatisfaction: {
        averageScore: 8.7,
        nps: 68,
        responseRate: 0.72,
        byDimension: [
          {
            dimension: 'Atendimento',
            averageScore: 9.1,
            trend: 'improving'
          },
          {
            dimension: 'Instalações',
            averageScore: 8.5,
            trend: 'stable'
          },
          {
            dimension: 'Resultados',
            averageScore: 8.9,
            trend: 'improving'
          },
          {
            dimension: 'Comunicação',
            averageScore: 8.3,
            trend: 'stable'
          }
        ],
        distribution: [
          { score: 10, count: 142, percentage: 39.4 },
          { score: 9, count: 98, percentage: 27.2 },
          { score: 8, count: 78, percentage: 21.7 },
          { score: 7, count: 28, percentage: 7.8 },
          { score: 6, count: 14, percentage: 3.9 }
        ]
      },
      qualityIndicators: [
        {
          indicator: 'Tempo Médio de Espera',
          value: 8.5,
          target: 10,
          unit: 'minutos',
          status: 'excellent',
          trend: 'improving'
        },
        {
          indicator: 'Taxa de Complicações',
          value: 0.5,
          target: 1.0,
          unit: '%',
          status: 'excellent',
          trend: 'stable'
        }
      ],
      complaintAnalysis: {
        totalComplaints: 12,
        complaintRate: 4.8,
        byCategory: [
          {
            category: 'Agendamento',
            count: 5,
            percentage: 41.7,
            resolutionRate: 1.0,
            averageResolutionTime: 2.4
          },
          {
            category: 'Atendimento',
            count: 4,
            percentage: 33.3,
            resolutionRate: 0.75,
            averageResolutionTime: 5.8
          },
          {
            category: 'Instalações',
            count: 3,
            percentage: 25.0,
            resolutionRate: 1.0,
            averageResolutionTime: 7.2
          }
        ],
        trends: []
      }
    };
  }

  /**
   * Analisa tendências epidemiológicas
   */
  private async analyzeEpidemiologicalTrends(
    period: AnalysisPeriod
  ): Promise<EpidemiologicalTrends> {
    return {
      period,
      incidenceTrends: [
        {
          condition: 'Lombalgia',
          timeSeriesData: this.generateTimeSeriesData(period, 'Lombalgia'),
          seasonality: this.generateSeasonality('Lombalgia'),
          predictions: []
        }
      ],
      outbreakDetection: [],
      comorbidityNetworks: [
        {
          condition: 'Lombalgia',
          relatedConditions: [
            {
              condition: 'Obesidade',
              cooccurrenceRate: 0.42,
              relativeRisk: 2.3
            },
            {
              condition: 'Sedentarismo',
              cooccurrenceRate: 0.58,
              relativeRisk: 3.1
            }
          ]
        }
      ]
    };
  }

  /**
   * Gera insights da população
   */
  private async generateInsights(data: any): Promise<PopulationInsight[]> {
    const insights: PopulationInsight[] = [];
    
    // Insight sobre taxa de sucesso
    if (data.clinicalOutcomes.successRate > 0.8) {
      insights.push({
        id: `insight-${Date.now()}-1`,
        type: 'positive',
        category: 'clinical_outcomes' as any,
        title: 'Excelente Taxa de Sucesso',
        description: 'A taxa de sucesso dos tratamentos está acima da média nacional',
        metrics: [
          {
            name: 'Taxa de Sucesso',
            value: data.clinicalOutcomes.successRate * 100,
            trend: 'up'
          }
        ],
        impact: 'high',
        confidence: 0.92,
        generatedAt: new Date()
      });
    }
    
    // Insight sobre utilização
    if (data.serviceUtilization.capacityUtilization.utilizationRate > 0.85) {
      insights.push({
        id: `insight-${Date.now()}-2`,
        type: 'alert',
        category: 'service_utilization' as any,
        title: 'Alta Utilização de Capacidade',
        description: 'A taxa de utilização está próxima do limite. Considere expandir a capacidade.',
        metrics: [
          {
            name: 'Taxa de Utilização',
            value: data.serviceUtilization.capacityUtilization.utilizationRate * 100,
            trend: 'up'
          }
        ],
        impact: 'high',
        confidence: 0.88,
        generatedAt: new Date()
      });
    }
    
    return insights;
  }

  /**
   * Gera recomendações para a população
   */
  private async generateRecommendations(
    insights: PopulationInsight[],
    patients: Patient[]
  ): Promise<PopulationRecommendation[]> {
    const recommendations: PopulationRecommendation[] = [];
    
    // Recomendação baseada em insights
    const utilizationInsight = insights.find(i => i.category === 'service_utilization');
    if (utilizationInsight) {
      recommendations.push({
        id: `rec-${Date.now()}-1`,
        priority: 'high',
        category: 'Capacidade',
        title: 'Expandir Capacidade de Atendimento',
        description: 'Adicionar horários ou profissionais para atender a demanda',
        rationale: 'Taxa de utilização acima de 85% indica necessidade de expansão',
        targetPopulation: {
          description: 'Todos os pacientes',
          size: patients.length,
          criteria: {}
        },
        expectedImpact: [
          {
            metric: 'Taxa de Utilização',
            expectedChange: -15,
            timeframe: '3 meses',
            confidence: 0.75
          },
          {
            metric: 'Tempo de Espera',
            expectedChange: -30,
            timeframe: '2 meses',
            confidence: 0.82
          }
        ],
        implementation: {
          steps: [
            'Analisar horários de pico',
            'Contratar profissional adicional ou aumentar horas',
            'Redistribuir pacientes em horários de menor demanda',
            'Monitorar impacto por 3 meses'
          ],
          resources: ['1 profissional adicional', 'Sistema de agendamento'],
          estimatedCost: 15000,
          estimatedTime: '2-3 meses'
        },
        success_metrics: [
          {
            metric: 'Taxa de Utilização',
            target: 75,
            unit: '%'
          },
          {
            metric: 'Satisfação do Paciente',
            target: 9.0,
            unit: 'score'
          }
        ]
      });
    }
    
    return recommendations;
  }

  // Helper methods
  
  private async getFilteredPatients(filters?: PopulationFilters): Promise<Patient[]> {
    // Mock data - em produção viria do banco
    const mockPatients: Patient[] = [];
    for (let i = 0; i < 200; i++) {
      mockPatients.push({
        id: `patient-${i}`,
        name: `Paciente ${i}`,
        cpf: `000.000.000-${i.toString().padStart(2, '0')}`,
        birthDate: new Date(1950 + Math.floor(Math.random() * 50), 0, 1).toISOString().split('T')[0],
        phone: '(11) 98765-4321',
        email: `patient${i}@email.com`,
        emergencyContact: { name: 'Contato', phone: '(11) 12345-6789' },
        address: {
          street: 'Rua Exemplo',
          city: ['São Paulo', 'Rio de Janeiro', 'Belo Horizonte'][Math.floor(Math.random() * 3)],
          state: 'SP',
          zip: '01234-567'
        },
        status: Math.random() > 0.2 ? 'Active' as any : 'Inactive' as any,
        lastVisit: new Date().toISOString().split('T')[0],
        registrationDate: new Date(2023, Math.floor(Math.random() * 12), 1).toISOString().split('T')[0],
        avatarUrl: `https://i.pravatar.cc/150?u=${i}`,
        consentGiven: true,
        whatsappConsent: 'opt-in',
        gender: Math.random() > 0.5 ? 'M' : 'F',
        insuranceType: ['private', 'public', 'none'][Math.floor(Math.random() * 3)] as any,
        conditions: [
          { name: ['Lombalgia', 'Gonalgia', 'Cervicalgia', 'Tendinite'][Math.floor(Math.random() * 4)], date: '2024-01-01' }
        ]
      });
    }
    return mockPatients;
  }

  private calculateAge(birthDate: string): number {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  }

  private calculateAverageAge(patients: Patient[]): number {
    const sum = patients.reduce((acc, p) => acc + this.calculateAge(p.birthDate), 0);
    return sum / patients.length;
  }

  private countNewPatients(patients: Patient[], period: AnalysisPeriod): number {
    return patients.filter(p => {
      const regDate = new Date(p.registrationDate);
      return regDate >= period.start && regDate <= period.end;
    }).length;
  }

  private getMostCommonConditions(patients: Patient[], top: number): string[] {
    const conditionMap = new Map<string, number>();
    
    patients.forEach(p => {
      p.conditions?.forEach(c => {
        conditionMap.set(c.name, (conditionMap.get(c.name) || 0) + 1);
      });
    });
    
    return Array.from(conditionMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, top)
      .map(([name]) => name);
  }

  private generateRiskTrends(period: AnalysisPeriod): any[] {
    const trends = [];
    const days = Math.floor((period.end.getTime() - period.start.getTime()) / (1000 * 60 * 60 * 24));
    
    for (let i = 0; i < Math.min(days, 30); i++) {
      const date = new Date(period.start);
      date.setDate(date.getDate() + i);
      
      trends.push({
        date,
        lowRisk: 100 + Math.floor(Math.random() * 20),
        moderateRisk: 40 + Math.floor(Math.random() * 10),
        highRisk: 15 + Math.floor(Math.random() * 5),
        criticalRisk: 3 + Math.floor(Math.random() * 3)
      });
    }
    
    return trends;
  }

  private generateAdherenceTrends(period: AnalysisPeriod): any[] {
    const trends = [];
    const weeks = 12;
    
    for (let i = 0; i < weeks; i++) {
      const date = new Date(period.start);
      date.setDate(date.getDate() + (i * 7));
      
      trends.push({
        date,
        adherenceRate: 0.75 + Math.random() * 0.15,
        dropoutRate: 0.10 + Math.random() * 0.10
      });
    }
    
    return trends;
  }

  private generateTimeSeriesData(period: AnalysisPeriod, condition: string): any[] {
    const data = [];
    const months = 12;
    
    for (let i = 0; i < months; i++) {
      const date = new Date(period.start);
      date.setMonth(date.getMonth() - (months - i));
      
      data.push({
        date,
        newCases: 15 + Math.floor(Math.random() * 10),
        prevalence: 120 + Math.floor(Math.random() * 30),
        incidenceRate: 2.5 + Math.random()
      });
    }
    
    return data;
  }

  private generateSeasonality(condition: string): any[] {
    const months = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    
    return months.map((month, index) => ({
      month,
      averageIncidence: 20 + Math.floor(Math.random() * 15),
      peakSeason: index >= 5 && index <= 8 // Inverno
    }));
  }
}

export const populationHealthService = new PopulationHealthService();

