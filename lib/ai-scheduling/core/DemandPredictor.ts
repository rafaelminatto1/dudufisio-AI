/**
 * 🤖 Demand Predictor - Previsão de Demanda Inteligente
 * 
 * Sistema de IA para prever demanda de agendamentos com base em:
 * - Histórico de agendamentos
 * - Padrões sazonais
 * - Fatores externos (feriados, eventos)
 * - Comportamento de pacientes
 */

import { Appointment, Patient, WaitlistEntry } from '../../types';
import { BusinessIntelligenceSystem } from '../../analytics/BusinessIntelligenceSystem';

export interface DemandPrediction {
  date: Date;
  predictedDemand: number;
  confidence: number;
  factors: DemandFactor[];
  recommendations: string[];
  hourlyBreakdown: HourlyDemand[];
  resourceRequirements: ResourceRequirement[];
}

export interface DemandFactor {
  name: string;
  impact: number; // -1 to 1
  description: string;
  weight: number;
}

export interface HourlyDemand {
  hour: number;
  predictedAppointments: number;
  confidence: number;
  peakFactor: number;
}

export interface ResourceRequirement {
  resourceType: 'therapist' | 'room' | 'equipment';
  resourceId: string;
  requiredHours: number;
  utilizationRate: number;
  recommendations: string[];
}

export interface DemandFeatures {
  // Historical data
  historicalAppointments: number[];
  historicalNoShows: number[];
  historicalCancellations: number[];
  
  // Temporal features
  dayOfWeek: number;
  month: number;
  isHoliday: boolean;
  isWeekend: boolean;
  season: 'spring' | 'summer' | 'autumn' | 'winter';
  
  // Patient behavior
  averageBookingAdvance: number; // days
  patientRetentionRate: number;
  newPatientRate: number;
  
  // External factors
  weather: 'sunny' | 'rainy' | 'cloudy';
  events: string[];
  marketingCampaigns: boolean;
}

export class DemandPredictor {
  private biSystem: BusinessIntelligenceSystem;
  private historicalData: Appointment[] = [];
  private patientData: Patient[] = [];
  
  constructor(biSystem: BusinessIntelligenceSystem) {
    this.biSystem = biSystem;
  }

  /**
   * Prever demanda para um período específico
   */
  async predictDemand(
    startDate: Date, 
    endDate: Date,
    features?: Partial<DemandFeatures>
  ): Promise<DemandPrediction[]> {
    try {
      console.log('🔮 Iniciando previsão de demanda...');
      
      // Carregar dados históricos
      await this.loadHistoricalData(startDate, endDate);
      
      const predictions: DemandPrediction[] = [];
      const currentDate = new Date(startDate);
      
      while (currentDate <= endDate) {
        const prediction = await this.predictSingleDay(currentDate, features);
        predictions.push(prediction);
        currentDate.setDate(currentDate.getDate() + 1);
      }
      
      console.log(`✅ Previsão concluída para ${predictions.length} dias`);
      return predictions;
      
    } catch (error) {
      console.error('❌ Erro na previsão de demanda:', error);
      throw error;
    }
  }

  /**
   * Prever demanda para um único dia
   */
  private async predictSingleDay(
    date: Date, 
    features?: Partial<DemandFeatures>
  ): Promise<DemandPrediction> {
    // Extrair features do dia
    const dayFeatures = await this.extractDayFeatures(date, features);
    
    // Calcular demanda baseada em múltiplos fatores
    const baseDemand = this.calculateBaseDemand(dayFeatures);
    const seasonalAdjustment = this.calculateSeasonalAdjustment(dayFeatures);
    const trendAdjustment = this.calculateTrendAdjustment(dayFeatures);
    const externalFactors = this.calculateExternalFactors(dayFeatures);
    
    // Combinar todos os fatores
    const predictedDemand = Math.max(0, 
      baseDemand * seasonalAdjustment * trendAdjustment * externalFactors
    );
    
    // Calcular confiança baseada na qualidade dos dados
    const confidence = this.calculateConfidence(dayFeatures);
    
    // Gerar breakdown por hora
    const hourlyBreakdown = this.generateHourlyBreakdown(predictedDemand, dayFeatures);
    
    // Calcular requisitos de recursos
    const resourceRequirements = this.calculateResourceRequirements(predictedDemand, hourlyBreakdown);
    
    // Identificar fatores de influência
    const factors = this.identifyInfluencingFactors(dayFeatures);
    
    // Gerar recomendações
    const recommendations = this.generateRecommendations(predictedDemand, factors, hourlyBreakdown);
    
    return {
      date: new Date(date),
      predictedDemand: Math.round(predictedDemand),
      confidence,
      factors,
      recommendations,
      hourlyBreakdown,
      resourceRequirements
    };
  }

  /**
   * Extrair features específicas do dia
   */
  private async extractDayFeatures(
    date: Date, 
    customFeatures?: Partial<DemandFeatures>
  ): Promise<DemandFeatures> {
    const dayOfWeek = date.getDay();
    const month = date.getMonth() + 1;
    
    // Dados históricos para o mesmo dia da semana
    const historicalSameDay = this.historicalData.filter(app => 
      app.startTime.getDay() === dayOfWeek
    );
    
    // Dados históricos para o mesmo mês
    const historicalSameMonth = this.historicalData.filter(app => 
      app.startTime.getMonth() === date.getMonth()
    );
    
    // Calcular métricas de comportamento
    const avgBookingAdvance = this.calculateAverageBookingAdvance();
    const retentionRate = this.calculatePatientRetentionRate();
    const newPatientRate = this.calculateNewPatientRate();
    
    return {
      // Historical data
      historicalAppointments: historicalSameDay.map(app => 1),
      historicalNoShows: historicalSameDay.filter(app => app.status === 'no_show').map(() => 1),
      historicalCancellations: historicalSameDay.filter(app => app.status === 'cancelled').map(() => 1),
      
      // Temporal features
      dayOfWeek,
      month,
      isHoliday: await this.isHoliday(date),
      isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
      season: this.getSeason(month),
      
      // Patient behavior
      averageBookingAdvance: avgBookingAdvance,
      patientRetentionRate: retentionRate,
      newPatientRate: newPatientRate,
      
      // External factors
      weather: await this.getWeatherPrediction(date),
      events: await this.getLocalEvents(date),
      marketingCampaigns: await this.hasActiveMarketingCampaigns(date),
      
      // Merge custom features
      ...customFeatures
    };
  }

  /**
   * Calcular demanda base
   */
  private calculateBaseDemand(features: DemandFeatures): number {
    const historicalAvg = features.historicalAppointments.length > 0 
      ? features.historicalAppointments.reduce((sum, val) => sum + val, 0) / features.historicalAppointments.length
      : 5; // Default para clínicas novas
    
    // Ajustar baseado no dia da semana
    const dayOfWeekMultiplier = this.getDayOfWeekMultiplier(features.dayOfWeek);
    
    return historicalAvg * dayOfWeekMultiplier;
  }

  /**
   * Calcular ajuste sazonal
   */
  private calculateSeasonalAdjustment(features: DemandFeatures): number {
    const seasonalMultipliers = {
      spring: 1.1,  // Primavera: aumento de atividades físicas
      summer: 0.9,  // Verão: férias, menos agendamentos
      autumn: 1.0,  // Outono: normal
      winter: 1.2   // Inverno: mais lesões, mais agendamentos
    };
    
    return seasonalMultipliers[features.season] || 1.0;
  }

  /**
   * Calcular ajuste de tendência
   */
  private calculateTrendAdjustment(features: DemandFeatures): number {
    // Analisar tendência dos últimos 30 dias
    const recentData = this.historicalData.filter(app => 
      app.startTime >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    );
    
    if (recentData.length < 7) return 1.0; // Dados insuficientes
    
    // Calcular tendência linear simples
    const appointmentsByDay = this.groupAppointmentsByDay(recentData);
    const trend = this.calculateLinearTrend(appointmentsByDay);
    
    return 1 + (trend * 0.1); // Aplicar 10% da tendência
  }

  /**
   * Calcular fatores externos
   */
  private calculateExternalFactors(features: DemandFeatures): number {
    let multiplier = 1.0;
    
    // Feriados
    if (features.isHoliday) {
      multiplier *= 0.3; // Redução significativa em feriados
    }
    
    // Fins de semana
    if (features.isWeekend) {
      multiplier *= 0.7; // Redução em fins de semana
    }
    
    // Clima
    if (features.weather === 'rainy') {
      multiplier *= 1.1; // Aumento em dias chuvosos (mais lesões)
    }
    
    // Eventos locais
    if (features.events.length > 0) {
      multiplier *= 0.8; // Redução durante eventos
    }
    
    // Campanhas de marketing
    if (features.marketingCampaigns) {
      multiplier *= 1.3; // Aumento com marketing ativo
    }
    
    return multiplier;
  }

  /**
   * Calcular confiança da previsão
   */
  private calculateConfidence(features: DemandFeatures): number {
    let confidence = 0.5; // Base
    
    // Mais dados históricos = maior confiança
    if (features.historicalAppointments.length > 10) {
      confidence += 0.2;
    }
    
    // Padrões consistentes = maior confiança
    const variance = this.calculateVariance(features.historicalAppointments);
    if (variance < 2) {
      confidence += 0.2;
    }
    
    // Fatores externos conhecidos = maior confiança
    if (features.isHoliday !== undefined && features.weather !== undefined) {
      confidence += 0.1;
    }
    
    return Math.min(0.95, confidence);
  }

  /**
   * Gerar breakdown por hora
   */
  private generateHourlyBreakdown(
    totalDemand: number, 
    features: DemandFeatures
  ): HourlyDemand[] {
    const hourlyPattern = this.getHourlyPattern(features.dayOfWeek);
    const hourlyBreakdown: HourlyDemand[] = [];
    
    for (let hour = 8; hour <= 18; hour++) {
      const baseAppointments = totalDemand * hourlyPattern[hour] || 0;
      const peakFactor = this.calculatePeakFactor(hour, features);
      const predictedAppointments = Math.round(baseAppointments * peakFactor);
      
      hourlyBreakdown.push({
        hour,
        predictedAppointments,
        confidence: features.historicalAppointments.length > 5 ? 0.8 : 0.6,
        peakFactor
      });
    }
    
    return hourlyBreakdown;
  }

  /**
   * Calcular requisitos de recursos
   */
  private calculateResourceRequirements(
    totalDemand: number, 
    hourlyBreakdown: HourlyDemand[]
  ): ResourceRequirement[] {
    const requirements: ResourceRequirement[] = [];
    
    // Calcular terapeutas necessários
    const maxHourlyDemand = Math.max(...hourlyBreakdown.map(h => h.predictedAppointments));
    const therapistsNeeded = Math.ceil(maxHourlyDemand / 3); // 3 pacientes por terapeuta
    
    requirements.push({
      resourceType: 'therapist',
      resourceId: 'all',
      requiredHours: 10, // 8h às 18h
      utilizationRate: totalDemand / (therapistsNeeded * 10),
      recommendations: therapistsNeeded > 2 
        ? ['Considerar contratar terapeuta adicional', 'Otimizar horários de trabalho']
        : ['Recursos adequados para demanda prevista']
    });
    
    // Calcular salas necessárias
    const roomsNeeded = Math.ceil(maxHourlyDemand / 2); // 2 pacientes por sala
    
    requirements.push({
      resourceType: 'room',
      resourceId: 'all',
      requiredHours: 10,
      utilizationRate: totalDemand / (roomsNeeded * 10),
      recommendations: roomsNeeded > 3
        ? ['Considerar alugar sala adicional', 'Otimizar uso de espaços']
        : ['Salas suficientes para demanda prevista']
    });
    
    return requirements;
  }

  /**
   * Identificar fatores de influência
   */
  private identifyInfluencingFactors(features: DemandFeatures): DemandFactor[] {
    const factors: DemandFactor[] = [];
    
    // Fator sazonal
    factors.push({
      name: 'Sazonalidade',
      impact: this.getSeasonalImpact(features.season),
      description: `Período de ${features.season}`,
      weight: 0.3
    });
    
    // Fator dia da semana
    factors.push({
      name: 'Dia da Semana',
      impact: this.getDayOfWeekImpact(features.dayOfWeek),
      description: this.getDayName(features.dayOfWeek),
      weight: 0.4
    });
    
    // Fator feriado
    if (features.isHoliday) {
      factors.push({
        name: 'Feriado',
        impact: -0.7,
        description: 'Dia feriado - redução esperada',
        weight: 0.2
      });
    }
    
    // Fator clima
    if (features.weather === 'rainy') {
      factors.push({
        name: 'Clima',
        impact: 0.1,
        description: 'Dia chuvoso - possível aumento',
        weight: 0.1
      });
    }
    
    return factors;
  }

  /**
   * Gerar recomendações
   */
  private generateRecommendations(
    predictedDemand: number, 
    factors: DemandFactor[], 
    hourlyBreakdown: HourlyDemand[]
  ): string[] {
    const recommendations: string[] = [];
    
    // Recomendações baseadas na demanda
    if (predictedDemand > 20) {
      recommendations.push('Alta demanda prevista - preparar equipe adicional');
      recommendations.push('Considerar estender horário de atendimento');
    } else if (predictedDemand < 5) {
      recommendations.push('Baixa demanda prevista - oportunidade para treinamentos');
      recommendations.push('Considerar campanha de marketing');
    }
    
    // Recomendações baseadas em picos horários
    const peakHours = hourlyBreakdown.filter(h => h.peakFactor > 1.5);
    if (peakHours.length > 0) {
      recommendations.push(`Picos de demanda previstos: ${peakHours.map(h => `${h.hour}h`).join(', ')}`);
    }
    
    // Recomendações baseadas em fatores
    const negativeFactors = factors.filter(f => f.impact < -0.3);
    if (negativeFactors.length > 0) {
      recommendations.push('Fatores negativos identificados - considerar estratégias de mitigação');
    }
    
    return recommendations;
  }

  // Métodos auxiliares
  private async loadHistoricalData(startDate: Date, endDate: Date): Promise<void> {
    // Implementar carregamento de dados históricos
    // Por enquanto, usar dados mock
    this.historicalData = [];
  }

  private getDayOfWeekMultiplier(dayOfWeek: number): number {
    const multipliers = [0.3, 1.2, 1.1, 1.0, 1.1, 0.8, 0.4]; // Dom-Sab
    return multipliers[dayOfWeek] || 1.0;
  }

  private getSeason(month: number): 'spring' | 'summer' | 'autumn' | 'winter' {
    if (month >= 3 && month <= 5) return 'spring';
    if (month >= 6 && month <= 8) return 'summer';
    if (month >= 9 && month <= 11) return 'autumn';
    return 'winter';
  }

  private getHourlyPattern(dayOfWeek: number): Record<number, number> {
    // Padrões típicos de agendamento por dia da semana
    const patterns = {
      0: {}, // Domingo - fechado
      1: { 8: 0.1, 9: 0.15, 10: 0.2, 11: 0.15, 14: 0.15, 15: 0.15, 16: 0.1 }, // Segunda
      2: { 8: 0.1, 9: 0.15, 10: 0.2, 11: 0.15, 14: 0.15, 15: 0.15, 16: 0.1 }, // Terça
      3: { 8: 0.1, 9: 0.15, 10: 0.2, 11: 0.15, 14: 0.15, 15: 0.15, 16: 0.1 }, // Quarta
      4: { 8: 0.1, 9: 0.15, 10: 0.2, 11: 0.15, 14: 0.15, 15: 0.15, 16: 0.1 }, // Quinta
      5: { 8: 0.1, 9: 0.15, 10: 0.2, 11: 0.15, 14: 0.15, 15: 0.15, 16: 0.1 }, // Sexta
      6: { 9: 0.2, 10: 0.3, 11: 0.3, 14: 0.2 } // Sábado
    };
    
    return patterns[dayOfWeek as keyof typeof patterns] || {};
  }

  private calculatePeakFactor(hour: number, features: DemandFeatures): number {
    let factor = 1.0;
    
    // Horário de almoço
    if (hour >= 12 && hour <= 13) {
      factor *= 0.3;
    }
    
    // Fim de semana
    if (features.isWeekend) {
      if (hour < 9 || hour > 15) {
        factor *= 0.5;
      }
    }
    
    return factor;
  }

  private calculateVariance(data: number[]): number {
    if (data.length === 0) return 0;
    const mean = data.reduce((sum, val) => sum + val, 0) / data.length;
    const variance = data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / data.length;
    return Math.sqrt(variance);
  }

  private calculateLinearTrend(data: number[]): number {
    if (data.length < 2) return 0;
    const n = data.length;
    const x = Array.from({ length: n }, (_, i) => i);
    const sumX = x.reduce((sum, val) => sum + val, 0);
    const sumY = data.reduce((sum, val) => sum + val, 0);
    const sumXY = x.reduce((sum, val, i) => sum + val * data[i], 0);
    const sumXX = x.reduce((sum, val) => sum + val * val, 0);
    
    return (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  }

  private groupAppointmentsByDay(appointments: Appointment[]): number[] {
    const grouped: { [key: string]: number } = {};
    appointments.forEach(app => {
      const dateKey = app.startTime.toISOString().split('T')[0];
      grouped[dateKey] = (grouped[dateKey] || 0) + 1;
    });
    return Object.values(grouped);
  }

  private calculateAverageBookingAdvance(): number {
    // Implementar cálculo baseado em dados históricos
    return 7; // 7 dias em média
  }

  private calculatePatientRetentionRate(): number {
    // Implementar cálculo baseado em dados históricos
    return 0.8; // 80% de retenção
  }

  private calculateNewPatientRate(): number {
    // Implementar cálculo baseado em dados históricos
    return 0.2; // 20% de novos pacientes
  }

  private async isHoliday(date: Date): Promise<boolean> {
    // Implementar verificação de feriados
    return false;
  }

  private async getWeatherPrediction(date: Date): Promise<'sunny' | 'rainy' | 'cloudy'> {
    // Implementar previsão do tempo
    return 'sunny';
  }

  private async getLocalEvents(date: Date): Promise<string[]> {
    // Implementar busca de eventos locais
    return [];
  }

  private async hasActiveMarketingCampaigns(date: Date): Promise<boolean> {
    // Implementar verificação de campanhas ativas
    return false;
  }

  private getSeasonalImpact(season: string): number {
    const impacts = {
      spring: 0.1,
      summer: -0.1,
      autumn: 0.0,
      winter: 0.2
    };
    return impacts[season as keyof typeof impacts] || 0;
  }

  private getDayOfWeekImpact(dayOfWeek: number): number {
    const impacts = [0, 0.2, 0.1, 0.0, 0.1, -0.2, -0.6];
    return impacts[dayOfWeek] || 0;
  }

  private getDayName(dayOfWeek: number): string {
    const names = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    return names[dayOfWeek] || 'Desconhecido';
  }
}
