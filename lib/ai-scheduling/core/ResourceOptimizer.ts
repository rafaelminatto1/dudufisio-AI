/**
 * 🎯 Resource Optimizer - Otimização Multi-Recurso
 * 
 * Sistema de IA para otimização de recursos da clínica:
 * - Alocação inteligente de salas
 * - Gestão de equipamentos
 * - Distribuição otimizada de terapeutas
 * - Minimização de conflitos
 */

import { Appointment, Patient, User } from '../../types';
import { BusinessIntelligenceSystem } from '../../analytics/BusinessIntelligenceSystem';

export interface ResourceOptimization {
  appointmentId: string;
  optimizedResources: OptimizedResource[];
  efficiency: number;
  conflicts: ResourceConflict[];
  recommendations: OptimizationRecommendation[];
  costSavings: number;
  utilizationRate: number;
}

export interface OptimizedResource {
  type: 'therapist' | 'room' | 'equipment';
  resourceId: string;
  name: string;
  startTime: Date;
  endTime: Date;
  utilization: number;
  efficiency: number;
  cost: number;
  quality: number;
}

export interface ResourceConflict {
  type: 'scheduling' | 'capacity' | 'skill' | 'equipment' | 'location';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  affectedResources: string[];
  resolution: string;
  impact: number;
}

export interface OptimizationRecommendation {
  type: 'reassign' | 'reschedule' | 'upgrade' | 'downgrade' | 'split' | 'merge';
  priority: number;
  description: string;
  expectedBenefit: number;
  implementation: string;
  cost: number;
  timeline: string;
}

export interface ResourceProfile {
  id: string;
  type: 'therapist' | 'room' | 'equipment';
  name: string;
  capacity: number;
  skills: string[];
  specialties: string[];
  availability: TimeSlot[];
  cost: number;
  quality: number;
  location: string;
  equipment: string[];
  constraints: ResourceConstraint[];
}

export interface TimeSlot {
  start: Date;
  end: Date;
  isAvailable: boolean;
  utilization: number;
}

export interface ResourceConstraint {
  type: 'time' | 'capacity' | 'skill' | 'equipment' | 'location' | 'cost';
  value: any;
  priority: number;
  description: string;
}

export interface OptimizationRequest {
  appointment: Appointment;
  patient: Patient;
  preferences: OptimizationPreferences;
  constraints: OptimizationConstraints;
  timeWindow: {
    start: Date;
    end: Date;
  };
}

export interface OptimizationPreferences {
  preferredTherapist?: string;
  preferredRoom?: string;
  preferredTime?: Date;
  maxCost?: number;
  minQuality?: number;
  priority: 'cost' | 'quality' | 'efficiency' | 'convenience';
}

export interface OptimizationConstraints {
  maxTravelTime?: number;
  requiredSkills?: string[];
  requiredEquipment?: string[];
  maxWaitTime?: number;
  budget?: number;
}

export class ResourceOptimizer {
  private biSystem: BusinessIntelligenceSystem;
  private resources: ResourceProfile[] = [];
  private optimizationHistory: ResourceOptimization[] = [];
  
  constructor(biSystem: BusinessIntelligenceSystem) {
    this.biSystem = biSystem;
    this.initializeResources();
  }

  /**
   * Otimizar recursos para um agendamento
   */
  async optimizeResources(request: OptimizationRequest): Promise<ResourceOptimization> {
    try {
      console.log(`🎯 Otimizando recursos para agendamento ${request.appointment.id}`);
      
      // Carregar recursos disponíveis
      const availableResources = await this.getAvailableResources(request);
      
      // Gerar combinações possíveis de recursos
      const combinations = this.generateResourceCombinations(availableResources, request);
      
      // Avaliar cada combinação
      const evaluations = await this.evaluateCombinations(combinations, request);
      
      // Selecionar melhor combinação
      const bestCombination = this.selectBestCombination(evaluations, request.preferences);
      
      // Identificar conflitos
      const conflicts = this.identifyConflicts(bestCombination, request);
      
      // Gerar recomendações
      const recommendations = this.generateRecommendations(bestCombination, conflicts, request);
      
      // Calcular métricas
      const efficiency = this.calculateEfficiency(bestCombination);
      const costSavings = this.calculateCostSavings(bestCombination, request);
      const utilizationRate = this.calculateUtilizationRate(bestCombination);
      
      const optimization: ResourceOptimization = {
        appointmentId: request.appointment.id,
        optimizedResources: bestCombination,
        efficiency,
        conflicts,
        recommendations,
        costSavings,
        utilizationRate
      };
      
      // Salvar histórico
      this.optimizationHistory.push(optimization);
      
      console.log(`✅ Otimização concluída com eficiência de ${(efficiency * 100).toFixed(1)}%`);
      return optimization;
      
    } catch (error) {
      console.error('❌ Erro na otimização de recursos:', error);
      throw error;
    }
  }

  /**
   * Otimizar múltiplos agendamentos simultaneamente
   */
  async optimizeMultipleAppointments(
    requests: OptimizationRequest[]
  ): Promise<ResourceOptimization[]> {
    try {
      console.log(`🎯 Otimizando ${requests.length} agendamentos simultaneamente`);
      
      // Ordenar por prioridade e urgência
      const sortedRequests = this.sortRequestsByPriority(requests);
      
      const optimizations: ResourceOptimization[] = [];
      const usedResources = new Set<string>();
      
      for (const request of sortedRequests) {
        // Filtrar recursos já utilizados
        const availableResources = await this.getAvailableResources(request, usedResources);
        
        if (availableResources.length === 0) {
          console.warn(`⚠️ Nenhum recurso disponível para agendamento ${request.appointment.id}`);
          continue;
        }
        
        // Otimizar agendamento individual
        const optimization = await this.optimizeResources({
          ...request,
          constraints: {
            ...request.constraints,
            usedResources: Array.from(usedResources)
          }
        });
        
        optimizations.push(optimization);
        
        // Marcar recursos como utilizados
        optimization.optimizedResources.forEach(resource => {
          usedResources.add(resource.resourceId);
        });
      }
      
      console.log(`✅ Otimização em lote concluída para ${optimizations.length} agendamentos`);
      return optimizations;
      
    } catch (error) {
      console.error('❌ Erro na otimização em lote:', error);
      throw error;
    }
  }

  /**
   * Obter recursos disponíveis
   */
  private async getAvailableResources(
    request: OptimizationRequest,
    usedResources?: Set<string>
  ): Promise<ResourceProfile[]> {
    const available = this.resources.filter(resource => {
      // Verificar se não está sendo usado
      if (usedResources && usedResources.has(resource.id)) {
        return false;
      }
      
      // Verificar disponibilidade no horário
      const isAvailable = this.isResourceAvailable(resource, request.timeWindow);
      if (!isAvailable) return false;
      
      // Verificar habilidades necessárias
      if (request.constraints.requiredSkills) {
        const hasRequiredSkills = request.constraints.requiredSkills.every(skill =>
          resource.skills.includes(skill)
        );
        if (!hasRequiredSkills) return false;
      }
      
      // Verificar equipamentos necessários
      if (request.constraints.requiredEquipment) {
        const hasRequiredEquipment = request.constraints.requiredEquipment.every(equipment =>
          resource.equipment.includes(equipment)
        );
        if (!hasRequiredEquipment) return false;
      }
      
      return true;
    });
    
    return available;
  }

  /**
   * Gerar combinações possíveis de recursos
   */
  private generateResourceCombinations(
    availableResources: ResourceProfile[],
    request: OptimizationRequest
  ): ResourceProfile[][] {
    const combinations: ResourceProfile[][] = [];
    
    // Separar recursos por tipo
    const therapists = availableResources.filter(r => r.type === 'therapist');
    const rooms = availableResources.filter(r => r.type === 'room');
    const equipment = availableResources.filter(r => r.type === 'equipment');
    
    // Gerar combinações válidas
    for (const therapist of therapists) {
      for (const room of rooms) {
        // Verificar compatibilidade sala-terapeuta
        if (!this.isCompatible(therapist, room)) continue;
        
        // Encontrar equipamentos necessários
        const requiredEquipment = this.getRequiredEquipment(request);
        const availableEquipment = equipment.filter(eq => 
          requiredEquipment.includes(eq.id)
        );
        
        if (availableEquipment.length < requiredEquipment.length) continue;
        
        // Criar combinação
        const combination = [therapist, room, ...availableEquipment];
        combinations.push(combination);
      }
    }
    
    return combinations;
  }

  /**
   * Avaliar combinações de recursos
   */
  private async evaluateCombinations(
    combinations: ResourceProfile[][],
    request: OptimizationRequest
  ): Promise<Array<{
    combination: ResourceProfile[];
    score: number;
    metrics: {
      cost: number;
      quality: number;
      efficiency: number;
      convenience: number;
    };
  }>> {
    const evaluations = [];
    
    for (const combination of combinations) {
      const metrics = await this.calculateCombinationMetrics(combination, request);
      const score = this.calculateCombinationScore(metrics, request.preferences);
      
      evaluations.push({
        combination,
        score,
        metrics
      });
    }
    
    return evaluations.sort((a, b) => b.score - a.score);
  }

  /**
   * Calcular métricas de uma combinação
   */
  private async calculateCombinationMetrics(
    combination: ResourceProfile[],
    request: OptimizationRequest
  ): Promise<{
    cost: number;
    quality: number;
    efficiency: number;
    convenience: number;
  }> {
    const therapist = combination.find(r => r.type === 'therapist');
    const room = combination.find(r => r.type === 'room');
    const equipment = combination.filter(r => r.type === 'equipment');
    
    // Calcular custo total
    const cost = (therapist?.cost || 0) + 
                 (room?.cost || 0) + 
                 equipment.reduce((sum, eq) => sum + eq.cost, 0);
    
    // Calcular qualidade média
    const quality = (therapist?.quality || 0 + 
                    room?.quality || 0 + 
                    equipment.reduce((sum, eq) => sum + eq.quality, 0)) / 
                   (therapist ? 1 : 0 + room ? 1 : 0 + equipment.length);
    
    // Calcular eficiência
    const efficiency = this.calculateResourceEfficiency(combination, request);
    
    // Calcular conveniência
    const convenience = this.calculateConvenience(combination, request);
    
    return { cost, quality, efficiency, convenience };
  }

  /**
   * Calcular score de uma combinação
   */
  private calculateCombinationScore(
    metrics: { cost: number; quality: number; efficiency: number; convenience: number },
    preferences: OptimizationPreferences
  ): number {
    let score = 0;
    
    switch (preferences.priority) {
      case 'cost':
        score = (1 - metrics.cost / 1000) * 0.4 + // Normalizar custo
                metrics.quality * 0.2 +
                metrics.efficiency * 0.2 +
                metrics.convenience * 0.2;
        break;
      case 'quality':
        score = metrics.quality * 0.5 +
                (1 - metrics.cost / 1000) * 0.2 +
                metrics.efficiency * 0.2 +
                metrics.convenience * 0.1;
        break;
      case 'efficiency':
        score = metrics.efficiency * 0.5 +
                metrics.quality * 0.2 +
                (1 - metrics.cost / 1000) * 0.2 +
                metrics.convenience * 0.1;
        break;
      case 'convenience':
        score = metrics.convenience * 0.4 +
                metrics.quality * 0.3 +
                metrics.efficiency * 0.2 +
                (1 - metrics.cost / 1000) * 0.1;
        break;
    }
    
    return Math.max(0, Math.min(1, score));
  }

  /**
   * Selecionar melhor combinação
   */
  private selectBestCombination(
    evaluations: Array<{
      combination: ResourceProfile[];
      score: number;
      metrics: { cost: number; quality: number; efficiency: number; convenience: number };
    }>,
    preferences: OptimizationPreferences
  ): OptimizedResource[] {
    if (evaluations.length === 0) {
      throw new Error('Nenhuma combinação de recursos encontrada');
    }
    
    const best = evaluations[0];
    
    // Converter para OptimizedResource
    return best.combination.map(resource => ({
      type: resource.type,
      resourceId: resource.id,
      name: resource.name,
      startTime: new Date(), // Será definido pelo agendamento
      endTime: new Date(), // Será definido pelo agendamento
      utilization: 0.8, // Será calculado
      efficiency: best.metrics.efficiency,
      cost: resource.cost,
      quality: resource.quality
    }));
  }

  /**
   * Identificar conflitos de recursos
   */
  private identifyConflicts(
    resources: OptimizedResource[],
    request: OptimizationRequest
  ): ResourceConflict[] {
    const conflicts: ResourceConflict[] = [];
    
    // Verificar conflitos de horário
    const schedulingConflicts = this.checkSchedulingConflicts(resources, request);
    conflicts.push(...schedulingConflicts);
    
    // Verificar conflitos de capacidade
    const capacityConflicts = this.checkCapacityConflicts(resources, request);
    conflicts.push(...capacityConflicts);
    
    // Verificar conflitos de habilidades
    const skillConflicts = this.checkSkillConflicts(resources, request);
    conflicts.push(...skillConflicts);
    
    // Verificar conflitos de equipamentos
    const equipmentConflicts = this.checkEquipmentConflicts(resources, request);
    conflicts.push(...equipmentConflicts);
    
    return conflicts;
  }

  /**
   * Gerar recomendações de otimização
   */
  private generateRecommendations(
    resources: OptimizedResource[],
    conflicts: ResourceConflict[],
    request: OptimizationRequest
  ): OptimizationRecommendation[] {
    const recommendations: OptimizationRecommendation[] = [];
    
    // Recomendações baseadas em conflitos
    conflicts.forEach(conflict => {
      switch (conflict.type) {
        case 'scheduling':
          recommendations.push({
            type: 'reschedule',
            priority: 1,
            description: 'Reagendar para evitar conflito de horário',
            expectedBenefit: 0.8,
            implementation: 'Sugerir horários alternativos',
            cost: 0,
            timeline: 'Imediato'
          });
          break;
        case 'capacity':
          recommendations.push({
            type: 'split',
            priority: 2,
            description: 'Dividir agendamento em múltiplas sessões',
            expectedBenefit: 0.6,
            implementation: 'Criar agendamentos menores',
            cost: 0,
            timeline: '24h'
          });
          break;
        case 'skill':
          recommendations.push({
            type: 'upgrade',
            priority: 1,
            description: 'Atribuir terapeuta com habilidades adequadas',
            expectedBenefit: 0.9,
            implementation: 'Buscar terapeuta especializado',
            cost: 100,
            timeline: 'Imediato'
          });
          break;
        case 'equipment':
          recommendations.push({
            type: 'upgrade',
            priority: 2,
            description: 'Alocar equipamentos necessários',
            expectedBenefit: 0.7,
            implementation: 'Reservar equipamentos específicos',
            cost: 50,
            timeline: '2h'
          });
          break;
      }
    });
    
    // Recomendações baseadas na eficiência
    const avgEfficiency = resources.reduce((sum, r) => sum + r.efficiency, 0) / resources.length;
    if (avgEfficiency < 0.7) {
      recommendations.push({
        type: 'reassign',
        priority: 3,
        description: 'Reatribuir recursos para melhor eficiência',
        expectedBenefit: 0.5,
        implementation: 'Reavaliar alocação de recursos',
        cost: 0,
        timeline: '1h'
      });
    }
    
    return recommendations.sort((a, b) => a.priority - b.priority);
  }

  /**
   * Calcular eficiência geral
   */
  private calculateEfficiency(resources: OptimizedResource[]): number {
    if (resources.length === 0) return 0;
    return resources.reduce((sum, r) => sum + r.efficiency, 0) / resources.length;
  }

  /**
   * Calcular economia de custos
   */
  private calculateCostSavings(
    resources: OptimizedResource[],
    request: OptimizationRequest
  ): number {
    const totalCost = resources.reduce((sum, r) => sum + r.cost, 0);
    const maxCost = request.preferences.maxCost || totalCost;
    return Math.max(0, maxCost - totalCost);
  }

  /**
   * Calcular taxa de utilização
   */
  private calculateUtilizationRate(resources: OptimizedResource[]): number {
    if (resources.length === 0) return 0;
    return resources.reduce((sum, r) => sum + r.utilization, 0) / resources.length;
  }

  // Métodos auxiliares
  private initializeResources(): void {
    // Inicializar recursos básicos
    this.resources = [
      // Terapeutas
      {
        id: 'therapist_1',
        type: 'therapist',
        name: 'Dr. João Silva',
        capacity: 1,
        skills: ['fisioterapia', 'reabilitação', 'pilates'],
        specialties: ['ortopedia', 'neurologia'],
        availability: [],
        cost: 150,
        quality: 0.9,
        location: 'sala_1',
        equipment: ['macas', 'equipamentos_pilates'],
        constraints: []
      },
      {
        id: 'therapist_2',
        type: 'therapist',
        name: 'Dra. Maria Santos',
        capacity: 1,
        skills: ['fisioterapia', 'hidroterapia', 'acupuntura'],
        specialties: ['reumatologia', 'geriatria'],
        availability: [],
        cost: 180,
        quality: 0.95,
        location: 'sala_2',
        equipment: ['piscina', 'equipamentos_hidro'],
        constraints: []
      },
      
      // Salas
      {
        id: 'room_1',
        type: 'room',
        name: 'Sala de Fisioterapia 1',
        capacity: 2,
        skills: [],
        specialties: [],
        availability: [],
        cost: 50,
        quality: 0.8,
        location: 'andar_1',
        equipment: ['macas', 'equipamentos_basicos'],
        constraints: []
      },
      {
        id: 'room_2',
        type: 'room',
        name: 'Sala de Hidroterapia',
        capacity: 4,
        skills: [],
        specialties: [],
        availability: [],
        cost: 80,
        quality: 0.9,
        location: 'andar_1',
        equipment: ['piscina', 'equipamentos_hidro'],
        constraints: []
      },
      
      // Equipamentos
      {
        id: 'equipment_1',
        type: 'equipment',
        name: 'Maca de Fisioterapia',
        capacity: 1,
        skills: [],
        specialties: [],
        availability: [],
        cost: 20,
        quality: 0.8,
        location: 'sala_1',
        equipment: [],
        constraints: []
      },
      {
        id: 'equipment_2',
        type: 'equipment',
        name: 'Equipamentos de Pilates',
        capacity: 1,
        skills: [],
        specialties: [],
        availability: [],
        cost: 30,
        quality: 0.9,
        location: 'sala_1',
        equipment: [],
        constraints: []
      }
    ];
  }

  private isResourceAvailable(resource: ResourceProfile, timeWindow: { start: Date; end: Date }): boolean {
    // Implementar verificação de disponibilidade
    return true;
  }

  private isCompatible(therapist: ResourceProfile, room: ResourceProfile): boolean {
    // Verificar se terapeuta e sala são compatíveis
    return therapist.location === room.id || room.equipment.some(eq => 
      therapist.equipment.includes(eq)
    );
  }

  private getRequiredEquipment(request: OptimizationRequest): string[] {
    // Determinar equipamentos necessários baseado no tipo de agendamento
    const equipmentMap: { [key: string]: string[] } = {
      'evaluation': ['equipment_1'],
      'session': ['equipment_1', 'equipment_2'],
      'return': ['equipment_1'],
      'group': ['equipment_2']
    };
    
    return equipmentMap[request.appointment.type] || [];
  }

  private calculateResourceEfficiency(combination: ResourceProfile[], request: OptimizationRequest): number {
    // Calcular eficiência baseada na utilização e qualidade dos recursos
    const avgQuality = combination.reduce((sum, r) => sum + r.quality, 0) / combination.length;
    const avgUtilization = combination.reduce((sum, r) => sum + r.capacity, 0) / combination.length;
    return (avgQuality + avgUtilization) / 2;
  }

  private calculateConvenience(combination: ResourceProfile[], request: OptimizationRequest): number {
    // Calcular conveniência baseada na localização e preferências
    let convenience = 0.5; // Base
    
    // Preferência de terapeuta
    if (request.preferences.preferredTherapist) {
      const hasPreferredTherapist = combination.some(r => 
        r.type === 'therapist' && r.id === request.preferences.preferredTherapist
      );
      if (hasPreferredTherapist) convenience += 0.3;
    }
    
    // Preferência de sala
    if (request.preferences.preferredRoom) {
      const hasPreferredRoom = combination.some(r => 
        r.type === 'room' && r.id === request.preferences.preferredRoom
      );
      if (hasPreferredRoom) convenience += 0.2;
    }
    
    return Math.min(1, convenience);
  }

  private sortRequestsByPriority(requests: OptimizationRequest[]): OptimizationRequest[] {
    return requests.sort((a, b) => {
      // Ordenar por urgência, depois por prioridade de preferência
      const urgencyOrder = { cost: 1, efficiency: 2, quality: 3, convenience: 4 };
      return urgencyOrder[a.preferences.priority] - urgencyOrder[b.preferences.priority];
    });
  }

  private checkSchedulingConflicts(resources: OptimizedResource[], request: OptimizationRequest): ResourceConflict[] {
    // Implementar verificação de conflitos de horário
    return [];
  }

  private checkCapacityConflicts(resources: OptimizedResource[], request: OptimizationRequest): ResourceConflict[] {
    // Implementar verificação de conflitos de capacidade
    return [];
  }

  private checkSkillConflicts(resources: OptimizedResource[], request: OptimizationRequest): ResourceConflict[] {
    // Implementar verificação de conflitos de habilidades
    return [];
  }

  private checkEquipmentConflicts(resources: OptimizedResource[], request: OptimizationRequest): ResourceConflict[] {
    // Implementar verificação de conflitos de equipamentos
    return [];
  }
}
