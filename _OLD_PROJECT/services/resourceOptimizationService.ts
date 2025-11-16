/**
 * Resource Optimization Service
 * Algoritmos inteligentes para otimizar alocação de recursos
 */

import { Resource, ResourceAllocation } from '../types/resources';
import { EnrichedAppointment } from '../types';
import { resourceService } from './resourceService';

interface OptimizationSuggestion {
  resourceId: string;
  resourceName: string;
  score: number; // 0-100
  reasons: string[];
  distance?: number; // Se houver localização
  availability: 'immediate' | 'soon' | 'later';
}

class ResourceOptimizationService {
  /**
   * Sugere melhor recurso para um agendamento
   */
  async suggestBestResource(
    appointment: EnrichedAppointment,
    resourceType: string
  ): Promise<OptimizationSuggestion[]> {
    const available = await resourceService.getAvailableResources(
      appointment.startTime,
      appointment.endTime,
      resourceType
    );

    const suggestions: OptimizationSuggestion[] = available.map(resource => {
      const score = this.calculateResourceScore(resource, appointment);
      const reasons = this.generateReasons(resource, appointment, score);

      return {
        resourceId: resource.id,
        resourceName: resource.name,
        score,
        reasons,
        availability: 'immediate'
      };
    });

    // Sort by score (highest first)
    return suggestions.sort((a, b) => b.score - a.score);
  }

  /**
   * Calcula score de adequação do recurso (0-100)
   */
  private calculateResourceScore(resource: Resource, appointment: EnrichedAppointment): number {
    let score = 50; // Base score

    // Preferir recursos menos usados (balanceamento de carga)
    const usageScore = resource.usageCount ? Math.max(0, 20 - (resource.usageCount / 10)) : 20;
    score += usageScore;

    // Bonus se tiver features relevantes
    if (resource.features && resource.features.length > 0) {
      score += Math.min(resource.features.length * 5, 20);
    }

    // Bonus se estiver disponível há muito tempo (evitar recursos ociosos)
    score += 10;

    // Ensure score is between 0-100
    return Math.min(100, Math.max(0, score));
  }

  /**
   * Gera razões humanizadas para a sugestão
   */
  private generateReasons(resource: Resource, appointment: EnrichedAppointment, score: number): string[] {
    const reasons: string[] = [];

    if (score >= 80) {
      reasons.push('Alta compatibilidade com o tipo de consulta');
    }

    if (resource.features && resource.features.length > 0) {
      reasons.push(`Equipado com: ${resource.features.join(', ')}`);
    }

    if (resource.location) {
      reasons.push(`Localização: ${resource.location}`);
    }

    if (!resource.usageCount || resource.usageCount < 5) {
      reasons.push('Recurso pouco utilizado (balance de carga)');
    }

    if (resource.capacity && resource.capacity > 1) {
      reasons.push(`Capacidade para ${resource.capacity} pessoas`);
    }

    return reasons;
  }

  /**
   * Otimiza alocação de recursos para um dia inteiro
   */
  async optimizeDailyAllocation(
    appointments: EnrichedAppointment[],
    date: Date
  ): Promise<Map<string, string>> {
    // appointmentId -> resourceId mapping
    const allocations = new Map<string, string>();

    // Group appointments by type
    const byType = appointments.reduce((acc, apt) => {
      if (!acc[apt.type]) acc[apt.type] = [];
      acc[apt.type].push(apt);
      return acc;
    }, {} as Record<string, EnrichedAppointment[]>);

    // Allocate resources by type to minimize switches
    for (const [type, apts] of Object.entries(byType)) {
      const suggestions = await this.suggestBestResource(apts[0], 'room');
      
      if (suggestions.length > 0) {
        const bestResource = suggestions[0];
        
        for (const apt of apts) {
          allocations.set(apt.id, bestResource.resourceId);
        }
      }
    }

    return allocations;
  }

  /**
   * Prevê quando um recurso precisará de manutenção
   */
  async predictMaintenanceNeeds(resourceId: string): Promise<{
    needsMaintenance: boolean;
    estimatedDate: Date | null;
    confidence: number;
    reason: string;
  }> {
    const resource = await resourceService.getResource(resourceId);
    
    if (!resource) {
      return {
        needsMaintenance: false,
        estimatedDate: null,
        confidence: 0,
        reason: 'Recurso não encontrado'
      };
    }

    // Simple heuristic: every 100 uses or 90 days
    const usageThreshold = 100;
    const daysSinceLastMaintenance = resource.maintenanceSchedule?.lastMaintenance
      ? Math.floor((Date.now() - resource.maintenanceSchedule.lastMaintenance.getTime()) / (1000 * 60 * 60 * 24))
      : 90;

    const usageBasedNeed = (resource.usageCount || 0) >= usageThreshold;
    const timeBasedNeed = daysSinceLastMaintenance >= 90;

    if (usageBasedNeed || timeBasedNeed) {
      const estimatedDate = new Date();
      estimatedDate.setDate(estimatedDate.getDate() + 7); // 1 week from now

      return {
        needsMaintenance: true,
        estimatedDate,
        confidence: usageBasedNeed && timeBasedNeed ? 90 : 70,
        reason: usageBasedNeed
          ? `Atingiu ${resource.usageCount} usos (limite: ${usageThreshold})`
          : `Sem manutenção há ${daysSinceLastMaintenance} dias`
      };
    }

    return {
      needsMaintenance: false,
      estimatedDate: null,
      confidence: 100,
      reason: 'Recurso em bom estado'
    };
  }

  /**
   * Calcula ROI de um recurso
   */
  async calculateResourceROI(resourceId: string, costBasis: number): Promise<{
    roi: number;
    totalRevenue: number;
    usageCount: number;
    revenuePerUse: number;
  }> {
    const resource = await resourceService.getResource(resourceId);
    
    if (!resource?.usageCount) {
      return {
        roi: 0,
        totalRevenue: 0,
        usageCount: 0,
        revenuePerUse: 0
      };
    }

    // Simplified: assume avg revenue per session is R$150
    const avgRevenuePerUse = 150;
    const totalRevenue = resource.usageCount * avgRevenuePerUse;
    const roi = ((totalRevenue - costBasis) / costBasis) * 100;

    return {
      roi,
      totalRevenue,
      usageCount: resource.usageCount,
      revenuePerUse: avgRevenuePerUse
    };
  }
}

export const resourceOptimizationService = new ResourceOptimizationService();

