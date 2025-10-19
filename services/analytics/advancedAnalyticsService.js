import { supabase } from '../../lib/supabaseClient';
class AdvancedAnalyticsService {
    constructor() {
        this.eventQueue = [];
        this.isOnline = navigator.onLine;
        this.sessionId = this.generateSessionId();
        this.setupEventListeners();
        this.startPeriodicFlush();
    }
    // Event Tracking
    async trackEvent(event, properties = {}, userId) {
        const analyticsEvent = {
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
    async trackPageView(page, properties = {}) {
        await this.trackEvent('page_view', {
            page,
            title: document.title,
            ...properties,
        });
    }
    // User Action Tracking
    async trackUserAction(action, element, properties = {}) {
        await this.trackEvent('user_action', {
            action,
            element,
            ...properties,
        });
    }
    // Performance Tracking
    async trackPerformance() {
        if ('performance' in window) {
            const navigation = performance.getEntriesByType('navigation')[0];
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
    async trackError(error, context = {}) {
        await this.trackEvent('error', {
            message: error.message,
            stack: error.stack,
            name: error.name,
            ...context,
        });
    }
    // Feature Usage Tracking
    async trackFeatureUsage(feature, properties = {}) {
        await this.trackEvent('feature_usage', {
            feature,
            ...properties,
        });
    }
    // Conversion Tracking
    async trackConversion(conversionType, value, properties = {}) {
        await this.trackEvent('conversion', {
            type: conversionType,
            value,
            ...properties,
        });
    }
    // KPI Calculation
    async calculateKPIs(period = 'month') {
        try {
            const endDate = new Date();
            const startDate = this.getStartDate(endDate, period);
            const previousStartDate = this.getStartDate(startDate, period);
            const [patientMetrics, appointmentMetrics, revenueMetrics, engagementMetrics] = await Promise.all([
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
        }
        catch (error) {
            console.error('Erro ao calcular KPIs:', error);
            return [];
        }
    }
    // Dashboard Data
    async getDashboardData(period = 'month') {
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
        }
        catch (error) {
            console.error('Erro ao gerar dashboard:', error);
            throw new Error('Falha ao gerar dados do dashboard');
        }
    }
    // User Behavior Analysis
    async analyzeUserBehavior(userId, period = 30) {
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
            if (error)
                throw error;
            return this.processUserBehavior(events || [], userId);
        }
        catch (error) {
            console.error('Erro na análise de comportamento:', error);
            throw new Error('Falha na análise de comportamento do usuário');
        }
    }
    // Business Intelligence
    async getBusinessIntelligence() {
        try {
            const [clinicPerformance, predictiveAnalytics, benchmarks] = await Promise.all([
                this.calculateClinicPerformance(),
                this.generatePredictiveAnalytics(),
                this.getBenchmarks()
            ]);
            return {
                clinicPerformance,
                predictiveAnalytics,
                benchmarks,
            };
        }
        catch (error) {
            console.error('Erro em Business Intelligence:', error);
            throw new Error('Falha ao gerar Business Intelligence');
        }
    }
    // A/B Testing
    async trackABTest(testName, variant, userId) {
        await this.trackEvent('ab_test', {
            testName,
            variant,
            userId,
        });
    }
    async getABTestResults(testName) {
        try {
            const { data: testEvents, error } = await supabase
                .from('analytics_events')
                .select('*')
                .eq('event', 'ab_test')
                .like('properties->testName', testName);
            if (error)
                throw error;
            // Processar resultados do teste A/B
            return this.processABTestResults(testEvents || []);
        }
        catch (error) {
            console.error('Erro ao obter resultados do teste A/B:', error);
            throw new Error('Falha ao obter resultados do teste A/B');
        }
    }
    // Private Methods
    setupEventListeners() {
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
                        this.trackEvent('fid', { value: entry.processingStart - entry.startTime });
                    }
                }
            });
            try {
                observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input'] });
            }
            catch (e) {
                // Browser doesn't support these entry types
            }
        }
    }
    startPeriodicFlush() {
        setInterval(() => {
            if (this.eventQueue.length > 0 && this.isOnline) {
                this.flushEvents();
            }
        }, 10000); // Flush every 10 seconds
    }
    async flushEvents() {
        if (this.eventQueue.length === 0 || !this.isOnline)
            return;
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
        }
        catch (error) {
            console.error('Erro ao salvar eventos de analytics:', error);
            // Re-queue events for retry
            this.eventQueue.unshift(...eventsToFlush);
        }
    }
    isCriticalEvent(event) {
        const criticalEvents = ['error', 'conversion', 'user_registration', 'payment'];
        return criticalEvents.includes(event);
    }
    generateSessionId() {
        return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
    generateEventId() {
        return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
    getStartDate(date, period) {
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
    async getPatientMetrics(startDate, endDate, previousStartDate) {
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
    async getAppointmentMetrics(startDate, endDate, previousStartDate) {
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
    async getRevenueMetrics(startDate, endDate, previousStartDate) {
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
    async getEngagementMetrics(startDate, endDate, previousStartDate) {
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
    async getChartData(period) {
        // Implementar geração de dados para gráficos
        return {
            patientGrowth: [],
            appointmentTrends: [],
            revenueAnalysis: [],
            userEngagement: [],
        };
    }
    async generateInsights(period) {
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
    processUserBehavior(events, userId) {
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
    async calculateClinicPerformance() {
        // Calcular performance da clínica
        return {
            efficiency: 85,
            patientSatisfaction: 92,
            therapistUtilization: 78,
            equipmentUsage: 65,
        };
    }
    async generatePredictiveAnalytics() {
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
    async getBenchmarks() {
        // Obter benchmarks da indústria
        return {
            industryAverage: {},
            topPerformers: {},
            yourPerformance: {},
        };
    }
    processABTestResults(events) {
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
