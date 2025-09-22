import { supabase } from '../../lib/supabase';

export interface AnalyticsEvent {
  id: string;
  userId?: string;
  sessionId: string;
  event: string;
  properties: Record<string, any>;
  timestamp: string;
  page?: string;
  userAgent?: string;
  ip?: string;
}

export interface KPIMetric {
  name: string;
  value: number;
  previousValue?: number;
  change?: number;
  changePercentage?: number;
  trend: 'up' | 'down' | 'stable';
  target?: number;
  unit?: string;
  period: string;
}

export interface AnalyticsDashboard {
  summary: {
    totalPatients: number;
    activePatients: number;
    totalAppointments: number;
    revenue: number;
    averageSessionDuration: number;
    completionRate: number;
  };
  kpis: KPIMetric[];
  charts: {
    patientGrowth: Array<{ date: string; value: number }>;
    appointmentTrends: Array<{ date: string; scheduled: number; completed: number; canceled: number }>;
    revenueAnalysis: Array<{ month: string; revenue: number; forecast: number }>;
    userEngagement: Array<{ page: string; views: number; avgTime: number }>;
  };
  insights: Array<{
    type: 'opportunity' | 'warning' | 'success';
    title: string;
    description: string;
    actionItems: string[];
  }>;
}

export interface UserBehaviorAnalysis {
  userId: string;
  sessionDuration: number;
  pagesVisited: number;
  featuresUsed: string[];
  engagementScore: number;
  satisfactionIndicators: {
    completedActions: number;
    abandonedActions: number;
    timeToComplete: number;
  };
  riskFactors: string[];
  recommendations: string[];
}

export interface BusinessIntelligence {
  clinicPerformance: {
    efficiency: number;
    patientSatisfaction: number;
    therapistUtilization: number;
    equipmentUsage: number;
  };
  predictiveAnalytics: {
    patientChurn: {
      riskLevel: 'low' | 'medium' | 'high';
      probability: number;
      factors: string[];
    };
    demandForecasting: Array<{
      period: string;
      predictedAppointments: number;
      confidence: number;
    }>;
    revenueProjection: Array<{
      month: string;
      projected: number;
      confidence: number;
    }>;
  };
  benchmarks: {
    industryAverage: Record<string, number>;
    topPerformers: Record<string, number>;
    yourPerformance: Record<string, number>;
  };
}

class AdvancedAnalyticsService {
  private sessionId: string;
  private eventQueue: AnalyticsEvent[] = [];
  private isOnline: boolean = navigator.onLine;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.setupEventListeners();
    this.startPeriodicFlush();
  }

  // Event Tracking
  async trackEvent(event: string, properties: Record<string, any> = {}, userId?: string): Promise<void> {
    const analyticsEvent: AnalyticsEvent = {
      id: this.generateEventId(),
      userId,
      sessionId: this.sessionId,
      event,
      properties: {
        ...properties,
        timestamp: new Date().toISOString(),
        page: window.location.pathname,
        referrer: document.referrer,
        viewport: `${window.innerWidth}x${window.innerHeight}`,
        userAgent: navigator.userAgent,
      },
      timestamp: new Date().toISOString(),
      page: window.location.pathname,
      userAgent: navigator.userAgent,
    };

    this.eventQueue.push(analyticsEvent);

    // Flush immediately for critical events
    if (this.isCriticalEvent(event)) {
      await this.flushEvents();
    }
  }

  // Page View Tracking
  async trackPageView(page: string, properties: Record<string, any> = {}): Promise<void> {
    await this.trackEvent('page_view', {
      page,
      title: document.title,
      ...properties,
    });
  }

  // User Action Tracking
  async trackUserAction(action: string, element: string, properties: Record<string, any> = {}): Promise<void> {
    await this.trackEvent('user_action', {
      action,
      element,
      ...properties,
    });
  }

  // Performance Tracking
  async trackPerformance(): Promise<void> {
    if ('performance' in window) {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const paintEntries = performance.getEntriesByType('paint');

      await this.trackEvent('performance', {
        loadTime: navigation.loadEventEnd - navigation.loadEventStart,
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        firstPaint: paintEntries.find(entry => entry.name === 'first-paint')?.startTime || 0,
        firstContentfulPaint: paintEntries.find(entry => entry.name === 'first-contentful-paint')?.startTime || 0,
        ttfb: navigation.responseStart - navigation.requestStart,
      });
    }
  }

  // Error Tracking
  async trackError(error: Error, context: Record<string, any> = {}): Promise<void> {
    await this.trackEvent('error', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      ...context,
    });
  }

  // Feature Usage Tracking
  async trackFeatureUsage(feature: string, properties: Record<string, any> = {}): Promise<void> {
    await this.trackEvent('feature_usage', {
      feature,
      ...properties,
    });
  }

  // Conversion Tracking
  async trackConversion(conversionType: string, value?: number, properties: Record<string, any> = {}): Promise<void> {
    await this.trackEvent('conversion', {
      type: conversionType,
      value,
      ...properties,
    });
  }

  // KPI Calculation
  async calculateKPIs(period: 'day' | 'week' | 'month' | 'quarter' | 'year' = 'month'): Promise<KPIMetric[]> {
    try {
      const endDate = new Date();
      const startDate = this.getStartDate(endDate, period);
      const previousStartDate = this.getStartDate(startDate, period);

      const [
        patientMetrics,
        appointmentMetrics,
        revenueMetrics,
        engagementMetrics
      ] = await Promise.all([
        this.getPatientMetrics(startDate, endDate, previousStartDate),
        this.getAppointmentMetrics(startDate, endDate, previousStartDate),
        this.getRevenueMetrics(startDate, endDate, previousStartDate),
        this.getEngagementMetrics(startDate, endDate, previousStartDate)
      ]);

      return [
        ...patientMetrics,
        ...appointmentMetrics,
        ...revenueMetrics,
        ...engagementMetrics,
      ];
    } catch (error) {
      console.error('Erro ao calcular KPIs:', error);
      return [];
    }
  }

  // Dashboard Data
  async getDashboardData(period: 'day' | 'week' | 'month' | 'quarter' = 'month'): Promise<AnalyticsDashboard> {
    try {
      const [kpis, charts, insights] = await Promise.all([
        this.calculateKPIs(period),
        this.getChartData(period),
        this.generateInsights(period),
      ]);

      const summary = {
        totalPatients: kpis.find(k => k.name === 'total_patients')?.value || 0,
        activePatients: kpis.find(k => k.name === 'active_patients')?.value || 0,
        totalAppointments: kpis.find(k => k.name === 'total_appointments')?.value || 0,
        revenue: kpis.find(k => k.name === 'revenue')?.value || 0,
        averageSessionDuration: kpis.find(k => k.name === 'avg_session_duration')?.value || 0,
        completionRate: kpis.find(k => k.name === 'completion_rate')?.value || 0,
      };

      return {
        summary,
        kpis,
        charts,
        insights,
      };
    } catch (error) {
      console.error('Erro ao gerar dashboard:', error);
      throw new Error('Falha ao gerar dados do dashboard');
    }
  }

  // User Behavior Analysis
  async analyzeUserBehavior(userId: string, period: number = 30): Promise<UserBehaviorAnalysis> {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - period);

      const { data: events, error } = await supabase
        .from('analytics_events')
        .select('*')
        .eq('user_id', userId)
        .gte('timestamp', startDate.toISOString())
        .lte('timestamp', endDate.toISOString())
        .order('timestamp', { ascending: true });

      if (error) throw error;

      return this.processUserBehavior(events || [], userId);
    } catch (error) {
      console.error('Erro na análise de comportamento:', error);
      throw new Error('Falha na análise de comportamento do usuário');
    }
  }

  // Business Intelligence
  async getBusinessIntelligence(): Promise<BusinessIntelligence> {
    try {
      const [
        clinicPerformance,
        predictiveAnalytics,
        benchmarks
      ] = await Promise.all([
        this.calculateClinicPerformance(),
        this.generatePredictiveAnalytics(),
        this.getBenchmarks()
      ]);

      return {
        clinicPerformance,
        predictiveAnalytics,
        benchmarks,
      };
    } catch (error) {
      console.error('Erro em Business Intelligence:', error);
      throw new Error('Falha ao gerar Business Intelligence');
    }
  }

  // A/B Testing
  async trackABTest(testName: string, variant: string, userId: string): Promise<void> {
    await this.trackEvent('ab_test', {
      testName,
      variant,
      userId,
    });
  }

  async getABTestResults(testName: string): Promise<{
    variants: Array<{
      name: string;
      users: number;
      conversions: number;
      conversionRate: number;
      significance: number;
    }>;
    winner?: string;
    confidence: number;
  }> {
    try {
      const { data: testEvents, error } = await supabase
        .from('analytics_events')
        .select('*')
        .eq('event', 'ab_test')
        .like('properties->testName', testName);

      if (error) throw error;

      // Processar resultados do teste A/B
      return this.processABTestResults(testEvents || []);
    } catch (error) {
      console.error('Erro ao obter resultados do teste A/B:', error);
      throw new Error('Falha ao obter resultados do teste A/B');
    }
  }

  // Private Methods
  private setupEventListeners(): void {
    // Online/Offline detection
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.flushEvents();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });

    // Before unload - flush remaining events
    window.addEventListener('beforeunload', () => {
      if (this.eventQueue.length > 0) {
        navigator.sendBeacon('/api/analytics', JSON.stringify(this.eventQueue));
      }
    });

    // Performance observer
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'largest-contentful-paint') {
            this.trackEvent('lcp', { value: entry.startTime });
          }
          if (entry.entryType === 'first-input') {
            this.trackEvent('fid', { value: (entry as any).processingStart - entry.startTime });
          }
        }
      });

      try {
        observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input'] });
      } catch (e) {
        // Browser doesn't support these entry types
      }
    }
  }

  private startPeriodicFlush(): void {
    setInterval(() => {
      if (this.eventQueue.length > 0 && this.isOnline) {
        this.flushEvents();
      }
    }, 10000); // Flush every 10 seconds
  }

  private async flushEvents(): Promise<void> {
    if (this.eventQueue.length === 0 || !this.isOnline) return;

    const eventsToFlush = [...this.eventQueue];
    this.eventQueue = [];

    try {
      const { error } = await supabase
        .from('analytics_events')
        .insert(eventsToFlush.map(event => ({
          id: event.id,
          user_id: event.userId,
          session_id: event.sessionId,
          event: event.event,
          properties: event.properties,
          timestamp: event.timestamp,
          page: event.page,
          user_agent: event.userAgent,
        })));

      if (error) {
        // Re-queue events if failed to save
        this.eventQueue.unshift(...eventsToFlush);
        throw error;
      }
    } catch (error) {
      console.error('Erro ao salvar eventos de analytics:', error);
      // Re-queue events for retry
      this.eventQueue.unshift(...eventsToFlush);
    }
  }

  private isCriticalEvent(event: string): boolean {
    const criticalEvents = ['error', 'conversion', 'user_registration', 'payment'];
    return criticalEvents.includes(event);
  }

  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateEventId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private getStartDate(date: Date, period: string): Date {
    const startDate = new Date(date);
    switch (period) {
      case 'day':
        startDate.setDate(date.getDate() - 1);
        break;
      case 'week':
        startDate.setDate(date.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(date.getMonth() - 1);
        break;
      case 'quarter':
        startDate.setMonth(date.getMonth() - 3);
        break;
      case 'year':
        startDate.setFullYear(date.getFullYear() - 1);
        break;
    }
    return startDate;
  }

  private async getPatientMetrics(startDate: Date, endDate: Date, previousStartDate: Date): Promise<KPIMetric[]> {
    // Implementar queries específicas para métricas de pacientes
    return [
      {
        name: 'total_patients',
        value: 150,
        previousValue: 140,
        change: 10,
        changePercentage: 7.14,
        trend: 'up',
        unit: 'patients',
        period: 'month'
      },
      {
        name: 'active_patients',
        value: 120,
        previousValue: 115,
        change: 5,
        changePercentage: 4.35,
        trend: 'up',
        unit: 'patients',
        period: 'month'
      }
    ];
  }

  private async getAppointmentMetrics(startDate: Date, endDate: Date, previousStartDate: Date): Promise<KPIMetric[]> {
    // Implementar queries específicas para métricas de agendamentos
    return [
      {
        name: 'total_appointments',
        value: 400,
        previousValue: 380,
        change: 20,
        changePercentage: 5.26,
        trend: 'up',
        unit: 'appointments',
        period: 'month'
      }
    ];
  }

  private async getRevenueMetrics(startDate: Date, endDate: Date, previousStartDate: Date): Promise<KPIMetric[]> {
    // Implementar queries específicas para métricas de receita
    return [
      {
        name: 'revenue',
        value: 25000,
        previousValue: 23000,
        change: 2000,
        changePercentage: 8.70,
        trend: 'up',
        unit: 'BRL',
        period: 'month'
      }
    ];
  }

  private async getEngagementMetrics(startDate: Date, endDate: Date, previousStartDate: Date): Promise<KPIMetric[]> {
    // Implementar queries específicas para métricas de engajamento
    return [
      {
        name: 'avg_session_duration',
        value: 8.5,
        previousValue: 7.8,
        change: 0.7,
        changePercentage: 8.97,
        trend: 'up',
        unit: 'minutes',
        period: 'month'
      }
    ];
  }

  private async getChartData(period: string): Promise<AnalyticsDashboard['charts']> {
    // Implementar geração de dados para gráficos
    return {
      patientGrowth: [],
      appointmentTrends: [],
      revenueAnalysis: [],
      userEngagement: [],
    };
  }

  private async generateInsights(period: string): Promise<AnalyticsDashboard['insights']> {
    // Implementar geração de insights automatizados
    return [
      {
        type: 'opportunity',
        title: 'Oportunidade de Crescimento',
        description: 'Taxa de conversão de leads aumentou 15% este mês',
        actionItems: ['Investir mais em marketing digital', 'Otimizar processo de onboarding']
      }
    ];
  }

  private processUserBehavior(events: any[], userId: string): UserBehaviorAnalysis {
    // Processar eventos do usuário para gerar análise
    return {
      userId,
      sessionDuration: 0,
      pagesVisited: 0,
      featuresUsed: [],
      engagementScore: 0,
      satisfactionIndicators: {
        completedActions: 0,
        abandonedActions: 0,
        timeToComplete: 0,
      },
      riskFactors: [],
      recommendations: [],
    };
  }

  private async calculateClinicPerformance(): Promise<BusinessIntelligence['clinicPerformance']> {
    // Calcular performance da clínica
    return {
      efficiency: 85,
      patientSatisfaction: 92,
      therapistUtilization: 78,
      equipmentUsage: 65,
    };
  }

  private async generatePredictiveAnalytics(): Promise<BusinessIntelligence['predictiveAnalytics']> {
    // Gerar analytics preditivos
    return {
      patientChurn: {
        riskLevel: 'low',
        probability: 0.15,
        factors: ['Missed appointments', 'Long gaps between sessions'],
      },
      demandForecasting: [],
      revenueProjection: [],
    };
  }

  private async getBenchmarks(): Promise<BusinessIntelligence['benchmarks']> {
    // Obter benchmarks da indústria
    return {
      industryAverage: {},
      topPerformers: {},
      yourPerformance: {},
    };
  }

  private processABTestResults(events: any[]): any {
    // Processar resultados de teste A/B
    return {
      variants: [],
      confidence: 0,
    };
  }
}

// Export singleton instance
export const advancedAnalytics = new AdvancedAnalyticsService();
export default advancedAnalytics;