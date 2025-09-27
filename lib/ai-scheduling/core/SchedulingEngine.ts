/**
 * 🎯 Scheduling Engine - Motor Principal de Agendamento Inteligente
 * 
 * Sistema central que coordena todas as funcionalidades de IA:
 * - Previsão de demanda
 * - Predição de no-show
 * - Otimização de recursos
 * - Integração com WhatsApp Business
 * - Prompts especializados
 */

import { Appointment, Patient, User } from '../../types';
import { BusinessIntelligenceSystem } from '../../analytics/BusinessIntelligenceSystem';
import { DemandPredictor, DemandPrediction } from './DemandPredictor';
import { NoShowPredictor, NoShowPrediction } from './NoShowPredictor';
import { ResourceOptimizer, ResourceOptimization, OptimizationRequest } from './ResourceOptimizer';
import { AIPromptManager } from './AIPromptManager';

export interface SmartSchedulingRequest {
  patient: Patient;
  appointmentType: string;
  preferredDate?: Date;
  preferredTime?: Date;
  duration: number;
  preferences: {
    preferredTherapist?: string;
    preferredRoom?: string;
    maxCost?: number;
    minQuality?: number;
    priority: 'cost' | 'quality' | 'efficiency' | 'convenience';
  };
  constraints: {
    maxTravelTime?: number;
    requiredSkills?: string[];
    requiredEquipment?: string[];
    maxWaitTime?: number;
    budget?: number;
  };
}

export interface SmartSchedulingResponse {
  appointment: Appointment;
  predictions: {
    demand: DemandPrediction;
    noShow: NoShowPrediction;
  };
  optimization: ResourceOptimization;
  aiInsights: AIInsight[];
  recommendations: SchedulingRecommendation[];
  confidence: number;
  alternatives: AlternativeScheduling[];
}

export interface AIInsight {
  type: 'demand' | 'no_show' | 'resource' | 'clinical' | 'financial';
  title: string;
  description: string;
  impact: 'positive' | 'negative' | 'neutral';
  confidence: number;
  actionable: boolean;
  priority: 'low' | 'medium' | 'high';
}

export interface SchedulingRecommendation {
  type: 'timing' | 'resource' | 'communication' | 'preparation' | 'follow_up';
  title: string;
  description: string;
  priority: number;
  expectedBenefit: number;
  implementation: string;
  cost: number;
  timeline: string;
}

export interface AlternativeScheduling {
  appointment: Appointment;
  score: number;
  reasons: string[];
  tradeOffs: string[];
}

export interface SchedulingMetrics {
  totalAppointments: number;
  successfulSchedules: number;
  averageConfidence: number;
  averageEfficiency: number;
  costSavings: number;
  noShowPrevention: number;
  resourceUtilization: number;
  patientSatisfaction: number;
}

export class SchedulingEngine {
  private biSystem: BusinessIntelligenceSystem;
  private demandPredictor: DemandPredictor;
  private noShowPredictor: NoShowPredictor;
  private resourceOptimizer: ResourceOptimizer;
  private promptManager: AIPromptManager;
  
  private metrics: SchedulingMetrics = {
    totalAppointments: 0,
    successfulSchedules: 0,
    averageConfidence: 0,
    averageEfficiency: 0,
    costSavings: 0,
    noShowPrevention: 0,
    resourceUtilization: 0,
    patientSatisfaction: 0
  };

  constructor(biSystem: BusinessIntelligenceSystem) {
    this.biSystem = biSystem;
    this.demandPredictor = new DemandPredictor(biSystem);
    this.noShowPredictor = new NoShowPredictor(biSystem);
    this.resourceOptimizer = new ResourceOptimizer(biSystem);
    this.promptManager = new AIPromptManager();
  }

  /**
   * Agendar consulta com IA avançada
   */
  async scheduleAppointment(request: SmartSchedulingRequest): Promise<SmartSchedulingResponse> {
    try {
      console.log(`🎯 Iniciando agendamento inteligente para ${request.patient.name}`);
      
      // 1. Prever demanda para o período
      const demandPrediction = await this.predictDemand(request);
      
      // 2. Criar agendamento base
      const baseAppointment = await this.createBaseAppointment(request);
      
      // 3. Prever no-show
      const noShowPrediction = await this.predictNoShow(baseAppointment, request.patient);
      
      // 4. Otimizar recursos
      const optimization = await this.optimizeResources(baseAppointment, request);
      
      // 5. Gerar insights de IA
      const aiInsights = await this.generateAIInsights(
        demandPrediction, 
        noShowPrediction, 
        optimization, 
        request
      );
      
      // 6. Gerar recomendações
      const recommendations = await this.generateRecommendations(
        demandPrediction,
        noShowPrediction,
        optimization,
        aiInsights,
        request
      );
      
      // 7. Calcular confiança geral
      const confidence = this.calculateOverallConfidence(
        demandPrediction,
        noShowPrediction,
        optimization
      );
      
      // 8. Gerar alternativas
      const alternatives = await this.generateAlternatives(request, baseAppointment);
      
      // 9. Atualizar métricas
      this.updateMetrics(confidence, optimization);
      
      const response: SmartSchedulingResponse = {
        appointment: baseAppointment,
        predictions: {
          demand: demandPrediction,
          noShow: noShowPrediction
        },
        optimization,
        aiInsights,
        recommendations,
        confidence,
        alternatives
      };
      
      console.log(`✅ Agendamento inteligente concluído com confiança de ${(confidence * 100).toFixed(1)}%`);
      return response;
      
    } catch (error) {
      console.error('❌ Erro no agendamento inteligente:', error);
      throw error;
    }
  }

  /**
   * Agendar múltiplas consultas otimizadas
   */
  async scheduleMultipleAppointments(
    requests: SmartSchedulingRequest[]
  ): Promise<SmartSchedulingResponse[]> {
    try {
      console.log(`🎯 Agendando ${requests.length} consultas em lote`);
      
      // Ordenar por prioridade e urgência
      const sortedRequests = this.sortRequestsByPriority(requests);
      
      const responses: SmartSchedulingResponse[] = [];
      const usedResources = new Set<string>();
      
      for (const request of sortedRequests) {
        try {
          // Filtrar recursos já utilizados
          const filteredRequest = this.filterUsedResources(request, usedResources);
          
          // Agendar consulta individual
          const response = await this.scheduleAppointment(filteredRequest);
          responses.push(response);
          
          // Marcar recursos como utilizados
          response.optimization.optimizedResources.forEach(resource => {
            usedResources.add(resource.resourceId);
          });
          
        } catch (error) {
          console.warn(`⚠️ Erro ao agendar consulta para ${request.patient.name}:`, error);
          // Continuar com próximas consultas
        }
      }
      
      console.log(`✅ Agendamento em lote concluído: ${responses.length}/${requests.length} sucessos`);
      return responses;
      
    } catch (error) {
      console.error('❌ Erro no agendamento em lote:', error);
      throw error;
    }
  }

  /**
   * Otimizar agendamentos existentes
   */
  async optimizeExistingAppointments(
    appointmentIds: string[]
  ): Promise<ResourceOptimization[]> {
    try {
      console.log(`🎯 Otimizando ${appointmentIds.length} agendamentos existentes`);
      
      const optimizations: ResourceOptimization[] = [];
      
      for (const appointmentId of appointmentIds) {
        try {
          // Buscar agendamento
          const appointment = await this.getAppointmentById(appointmentId);
          if (!appointment) continue;
          
          // Buscar paciente
          const patient = await this.getPatientById(appointment.patientId);
          if (!patient) continue;
          
          // Criar request de otimização
          const request: OptimizationRequest = {
            appointment,
            patient,
            preferences: {
              priority: 'efficiency'
            },
            constraints: {},
            timeWindow: {
              start: new Date(appointment.startTime),
              end: new Date(appointment.endTime)
            }
          };
          
          // Otimizar recursos
          const optimization = await this.resourceOptimizer.optimizeResources(request);
          optimizations.push(optimization);
          
        } catch (error) {
          console.warn(`⚠️ Erro ao otimizar agendamento ${appointmentId}:`, error);
        }
      }
      
      console.log(`✅ Otimização concluída: ${optimizations.length}/${appointmentIds.length} sucessos`);
      return optimizations;
      
    } catch (error) {
      console.error('❌ Erro na otimização de agendamentos:', error);
      throw error;
    }
  }

  /**
   * Obter métricas de performance
   */
  getMetrics(): SchedulingMetrics {
    return { ...this.metrics };
  }

  /**
   * Prever demanda para o período
   */
  private async predictDemand(request: SmartSchedulingRequest): Promise<DemandPrediction> {
    const startDate = request.preferredDate || new Date();
    const endDate = new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 dias
    
    const predictions = await this.demandPredictor.predictDemand(startDate, endDate);
    return predictions[0] || this.createDefaultDemandPrediction();
  }

  /**
   * Prever no-show
   */
  private async predictNoShow(appointment: Appointment, patient: Patient): Promise<NoShowPrediction> {
    return await this.noShowPredictor.predictNoShow(appointment.id, patient.id, appointment);
  }

  /**
   * Otimizar recursos
   */
  private async optimizeResources(
    appointment: Appointment, 
    request: SmartSchedulingRequest
  ): Promise<ResourceOptimization> {
    const optimizationRequest: OptimizationRequest = {
      appointment,
      patient: request.patient,
      preferences: {
        preferredTherapist: request.preferences.preferredTherapist,
        preferredRoom: request.preferences.preferredRoom,
        maxCost: request.preferences.maxCost,
        minQuality: request.preferences.minQuality,
        priority: request.preferences.priority
      },
      constraints: request.constraints,
      timeWindow: {
        start: new Date(appointment.startTime),
        end: new Date(appointment.endTime)
      }
    };
    
    return await this.resourceOptimizer.optimizeResources(optimizationRequest);
  }

  /**
   * Criar agendamento base
   */
  private async createBaseAppointment(request: SmartSchedulingRequest): Promise<Appointment> {
    const startTime = request.preferredTime || new Date();
    const endTime = new Date(startTime.getTime() + request.duration * 60 * 1000);
    
    return {
      id: `app_${Date.now()}`,
      patientId: request.patient.id,
      patientName: request.patient.name,
      patientAvatarUrl: request.patient.avatarUrl || `https://i.pravatar.cc/150?u=${request.patient.id}`,
      therapistId: '', // Será definido pela otimização
      title: `Consulta de ${request.appointmentType}`,
      startTime,
      endTime,
      status: 'scheduled',
      type: request.appointmentType as any,
      value: 120, // Será calculado
      paymentStatus: 'pending',
      observations: '',
      recurrenceRule: { frequency: 'weekly', days: [], until: '' },
      seriesId: '',
      createdAt: new Date(),
      updatedAt: new Date(),
      created_by: ''
    };
  }

  /**
   * Gerar insights de IA
   */
  private async generateAIInsights(
    demandPrediction: DemandPrediction,
    noShowPrediction: NoShowPrediction,
    optimization: ResourceOptimization,
    request: SmartSchedulingRequest
  ): Promise<AIInsight[]> {
    const insights: AIInsight[] = [];
    
    // Insight de demanda
    if (demandPrediction.predictedDemand > 15) {
      insights.push({
        type: 'demand',
        title: 'Alta Demanda Prevista',
        description: `Demanda de ${demandPrediction.predictedDemand} consultas prevista para este período`,
        impact: 'negative',
        confidence: demandPrediction.confidence,
        actionable: true,
        priority: 'high'
      });
    }
    
    // Insight de no-show
    if (noShowPrediction.probability > 0.6) {
      insights.push({
        type: 'no_show',
        title: 'Alto Risco de Falta',
        description: `${(noShowPrediction.probability * 100).toFixed(1)}% de chance de o paciente faltar`,
        impact: 'negative',
        confidence: noShowPrediction.confidence,
        actionable: true,
        priority: 'high'
      });
    }
    
    // Insight de recursos
    if (optimization.efficiency < 0.7) {
      insights.push({
        type: 'resource',
        title: 'Baixa Eficiência de Recursos',
        description: `Eficiência de ${(optimization.efficiency * 100).toFixed(1)}% pode ser melhorada`,
        impact: 'negative',
        confidence: 0.8,
        actionable: true,
        priority: 'medium'
      });
    }
    
    // Insight clínico
    if (request.appointmentType === 'evaluation') {
      insights.push({
        type: 'clinical',
        title: 'Primeira Consulta',
        description: 'Paciente em primeira consulta - preparar avaliação completa',
        impact: 'positive',
        confidence: 1.0,
        actionable: true,
        priority: 'medium'
      });
    }
    
    // Insight financeiro
    if (optimization.costSavings > 50) {
      insights.push({
        type: 'financial',
        title: 'Economia de Custos',
        description: `R$ ${optimization.costSavings.toFixed(2)} em economia de custos`,
        impact: 'positive',
        confidence: 0.9,
        actionable: false,
        priority: 'low'
      });
    }
    
    return insights;
  }

  /**
   * Gerar recomendações
   */
  private async generateRecommendations(
    demandPrediction: DemandPrediction,
    noShowPrediction: NoShowPrediction,
    optimization: ResourceOptimization,
    insights: AIInsight[],
    request: SmartSchedulingRequest
  ): Promise<SchedulingRecommendation[]> {
    const recommendations: SchedulingRecommendation[] = [];
    
    // Recomendações baseadas em no-show
    if (noShowPrediction.probability > 0.5) {
      recommendations.push({
        type: 'communication',
        title: 'Enviar Lembrete Personalizado',
        description: 'Enviar lembrete via WhatsApp com informações específicas',
        priority: 1,
        expectedBenefit: 0.8,
        implementation: 'Usar template personalizado baseado no perfil do paciente',
        cost: 0,
        timeline: 'Imediato'
      });
      
      recommendations.push({
        type: 'preparation',
        title: 'Preparar Estratégia de Follow-up',
        description: 'Preparar plano de follow-up caso o paciente falte',
        priority: 2,
        expectedBenefit: 0.6,
        implementation: 'Criar sequência de mensagens automáticas',
        cost: 0,
        timeline: '2h'
      });
    }
    
    // Recomendações baseadas em demanda
    if (demandPrediction.predictedDemand > 15) {
      recommendations.push({
        type: 'timing',
        title: 'Considerar Horário Alternativo',
        description: 'Sugerir horários com menor demanda',
        priority: 2,
        expectedBenefit: 0.7,
        implementation: 'Mostrar horários disponíveis com menor concorrência',
        cost: 0,
        timeline: 'Imediato'
      });
    }
    
    // Recomendações baseadas em recursos
    if (optimization.efficiency < 0.7) {
      recommendations.push({
        type: 'resource',
        title: 'Otimizar Alocação de Recursos',
        description: 'Reavaliar alocação de terapeutas e salas',
        priority: 3,
        expectedBenefit: 0.5,
        implementation: 'Usar algoritmo de otimização avançado',
        cost: 0,
        timeline: '1h'
      });
    }
    
    // Recomendações baseadas em insights
    insights.forEach(insight => {
      if (insight.actionable && insight.priority === 'high') {
        recommendations.push({
          type: 'preparation',
          title: `Ação para ${insight.title}`,
          description: insight.description,
          priority: 1,
          expectedBenefit: 0.8,
          implementation: 'Implementar ação específica baseada no insight',
          cost: 0,
          timeline: 'Imediato'
        });
      }
    });
    
    return recommendations.sort((a, b) => a.priority - b.priority);
  }

  /**
   * Calcular confiança geral
   */
  private calculateOverallConfidence(
    demandPrediction: DemandPrediction,
    noShowPrediction: NoShowPrediction,
    optimization: ResourceOptimization
  ): number {
    const demandConfidence = demandPrediction.confidence;
    const noShowConfidence = noShowPrediction.confidence;
    const optimizationConfidence = optimization.efficiency;
    
    return (demandConfidence + noShowConfidence + optimizationConfidence) / 3;
  }

  /**
   * Gerar alternativas
   */
  private async generateAlternatives(
    request: SmartSchedulingRequest,
    baseAppointment: Appointment
  ): Promise<AlternativeScheduling[]> {
    const alternatives: AlternativeScheduling[] = [];
    
    // Alternativa 1: Horário diferente
    const altTime = new Date(baseAppointment.startTime);
    altTime.setHours(altTime.getHours() + 2);
    const altAppointment1 = { ...baseAppointment, startTime: altTime };
    alternatives.push({
      appointment: altAppointment1,
      score: 0.8,
      reasons: ['Horário com menor demanda', 'Melhor disponibilidade de recursos'],
      tradeOffs: ['Pode ser menos conveniente para o paciente']
    });
    
    // Alternativa 2: Terapeuta diferente
    const altAppointment2 = { ...baseAppointment };
    alternatives.push({
      appointment: altAppointment2,
      score: 0.7,
      reasons: ['Terapeuta especializado disponível', 'Menor custo'],
      tradeOffs: ['Pode não ser a preferência do paciente']
    });
    
    return alternatives.sort((a, b) => b.score - a.score);
  }

  /**
   * Atualizar métricas
   */
  private updateMetrics(confidence: number, optimization: ResourceOptimization): void {
    this.metrics.totalAppointments++;
    this.metrics.successfulSchedules++;
    this.metrics.averageConfidence = 
      (this.metrics.averageConfidence * (this.metrics.totalAppointments - 1) + confidence) / 
      this.metrics.totalAppointments;
    this.metrics.averageEfficiency = 
      (this.metrics.averageEfficiency * (this.metrics.totalAppointments - 1) + optimization.efficiency) / 
      this.metrics.totalAppointments;
    this.metrics.costSavings += optimization.costSavings;
    this.metrics.resourceUtilization = 
      (this.metrics.resourceUtilization * (this.metrics.totalAppointments - 1) + optimization.utilizationRate) / 
      this.metrics.totalAppointments;
  }

  // Métodos auxiliares
  private createDefaultDemandPrediction(): DemandPrediction {
    return {
      date: new Date(),
      predictedDemand: 10,
      confidence: 0.5,
      factors: [],
      recommendations: [],
      hourlyBreakdown: [],
      resourceRequirements: []
    };
  }

  private sortRequestsByPriority(requests: SmartSchedulingRequest[]): SmartSchedulingRequest[] {
    return requests.sort((a, b) => {
      const priorityOrder = { cost: 1, efficiency: 2, quality: 3, convenience: 4 };
      return priorityOrder[a.preferences.priority] - priorityOrder[b.preferences.priority];
    });
  }

  private filterUsedResources(
    request: SmartSchedulingRequest, 
    usedResources: Set<string>
  ): SmartSchedulingRequest {
    // Filtrar recursos já utilizados das preferências
    return {
      ...request,
      preferences: {
        ...request.preferences,
        preferredTherapist: usedResources.has(request.preferences.preferredTherapist || '') 
          ? undefined 
          : request.preferences.preferredTherapist,
        preferredRoom: usedResources.has(request.preferences.preferredRoom || '') 
          ? undefined 
          : request.preferences.preferredRoom
      }
    };
  }

  private async getAppointmentById(id: string): Promise<Appointment | null> {
    // Implementar busca de agendamento
    return null;
  }

  private async getPatientById(id: string): Promise<Patient | null> {
    // Implementar busca de paciente
    return null;
  }
}
