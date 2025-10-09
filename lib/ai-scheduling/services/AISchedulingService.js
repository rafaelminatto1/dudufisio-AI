/**
 * 🤖 AI Scheduling Service - Serviço Principal de IA para Agendamento
 *
 * Serviço central que integra todas as funcionalidades de IA:
 * - Coordenação entre componentes
 * - Cache inteligente
 * - Otimização de performance
 * - Monitoramento e métricas
 */
import { SchedulingEngine } from '../core/SchedulingEngine';
import { AIPromptManager } from '../core/AIPromptManager';
import { DemandPredictor } from '../core/DemandPredictor';
import { NoShowPredictor } from '../core/NoShowPredictor';
import { ResourceOptimizer } from '../core/ResourceOptimizer';
import { ComplianceIntegration } from '../integrations/ComplianceIntegration';
export class AISchedulingService {
    constructor(biSystem, config = {}) {
        this.cache = new Map();
        this.activeRequests = new Set();
        this.biSystem = biSystem;
        this.config = {
            enableDemandPrediction: true,
            enableNoShowPrediction: true,
            enableResourceOptimization: true,
            enablePrompts: true,
            enableCompliance: true,
            cacheEnabled: true,
            cacheTTL: 30, // 30 minutos
            maxConcurrentRequests: 10,
            fallbackToHeuristic: true,
            performanceMonitoring: true,
            ...config
        };
        // Inicializar componentes
        this.schedulingEngine = new SchedulingEngine(biSystem);
        this.promptManager = new AIPromptManager();
        this.demandPredictor = new DemandPredictor(biSystem);
        this.noShowPredictor = new NoShowPredictor(biSystem);
        this.resourceOptimizer = new ResourceOptimizer(biSystem);
        this.complianceIntegration = new ComplianceIntegration({
            enableLGPD: this.config.enableCompliance,
            enableCOFFITO: this.config.enableCompliance,
            autoConsentCheck: true,
            autoAuditLogging: true,
            realTimeMonitoring: true
        });
        // Inicializar métricas
        this.metrics = {
            totalRequests: 0,
            successfulRequests: 0,
            averageResponseTime: 0,
            cacheHitRate: 0,
            errorRate: 0,
            costSavings: 0,
            noShowPrevention: 0,
            resourceEfficiency: 0,
            patientSatisfaction: 0,
            lastUpdated: new Date()
        };
        // Iniciar limpeza de cache
        this.startCacheCleanup();
    }
    /**
     * Agendar consulta com IA avançada
     */
    async scheduleAppointment(request) {
        const requestId = this.generateRequestId();
        const startTime = Date.now();
        try {
            console.log(`🤖 Iniciando agendamento IA (${requestId}) para ${request.patient.name}`);
            // Verificar limite de requisições concorrentes
            if (this.activeRequests.size >= this.config.maxConcurrentRequests) {
                throw new Error('Limite de requisições concorrentes excedido');
            }
            this.activeRequests.add(requestId);
            this.metrics.totalRequests++;
            // Verificar compliance se habilitado
            if (this.config.enableCompliance) {
                const complianceCheck = await this.complianceIntegration.checkSchedulingCompliance(request);
                if (!complianceCheck.isCompliant) {
                    console.warn(`⚠️ Violações de compliance detectadas (${requestId}):`, complianceCheck.violations);
                    // Se há violações críticas, bloquear agendamento
                    if (complianceCheck.violations.some(v => v.includes('Consentimento LGPD necessário'))) {
                        throw new Error('Agendamento bloqueado: Consentimento LGPD necessário');
                    }
                }
            }
            // Verificar cache
            const cacheKey = this.generateCacheKey('schedule', request);
            let response;
            if (this.config.cacheEnabled) {
                const cachedResponse = this.getFromCache(cacheKey);
                if (cachedResponse) {
                    console.log(`📦 Resposta obtida do cache (${requestId})`);
                    this.metrics.cacheHitRate =
                        (this.metrics.cacheHitRate * (this.metrics.totalRequests - 1) + 1) /
                            this.metrics.totalRequests;
                    return cachedResponse;
                }
            }
            // Processar agendamento
            response = await this.processSchedulingRequest(request);
            // Salvar no cache
            if (this.config.cacheEnabled) {
                this.saveToCache(cacheKey, response);
            }
            // Atualizar métricas
            const responseTime = Date.now() - startTime;
            this.updateMetrics(responseTime, true, response);
            console.log(`✅ Agendamento IA concluído (${requestId}) em ${responseTime}ms`);
            return response;
        }
        catch (error) {
            console.error(`❌ Erro no agendamento IA (${requestId}):`, error);
            // Fallback para heurística se habilitado
            if (this.config.fallbackToHeuristic) {
                console.log(`🔄 Tentando fallback heurístico (${requestId})`);
                try {
                    const fallbackResponse = await this.fallbackToHeuristic(request);
                    this.updateMetrics(Date.now() - startTime, true, fallbackResponse);
                    return fallbackResponse;
                }
                catch (fallbackError) {
                    console.error(`❌ Erro no fallback heurístico (${requestId}):`, fallbackError);
                }
            }
            this.updateMetrics(Date.now() - startTime, false);
            throw error;
        }
        finally {
            this.activeRequests.delete(requestId);
        }
    }
    /**
     * Processar múltiplos agendamentos
     */
    async scheduleMultipleAppointments(requests) {
        console.log(`🤖 Processando ${requests.length} agendamentos em lote`);
        const responses = [];
        const batchSize = Math.min(5, this.config.maxConcurrentRequests); // Processar em lotes
        for (let i = 0; i < requests.length; i += batchSize) {
            const batch = requests.slice(i, i + batchSize);
            const batchPromises = batch.map(request => this.scheduleAppointment(request).catch(error => {
                console.warn(`⚠️ Erro no agendamento de ${request.patient.name}:`, error);
                return null;
            }));
            const batchResponses = await Promise.all(batchPromises);
            responses.push(...batchResponses.filter(response => response !== null));
        }
        console.log(`✅ Processamento em lote concluído: ${responses.length}/${requests.length} sucessos`);
        return responses;
    }
    /**
     * Processar prompt especializado
     */
    async processPrompt(request) {
        const requestId = this.generateRequestId();
        const startTime = Date.now();
        try {
            console.log(`🧠 Processando prompt ${request.type} (${requestId})`);
            this.metrics.totalRequests++;
            // Verificar compliance se habilitado
            if (this.config.enableCompliance) {
                const complianceCheck = await this.complianceIntegration.checkPromptCompliance(request);
                if (!complianceCheck.isCompliant) {
                    console.warn(`⚠️ Violações de compliance detectadas para prompt (${requestId}):`, complianceCheck.violations);
                    // Se há violações críticas, bloquear processamento
                    if (complianceCheck.violations.some(v => v.includes('Consentimento necessário'))) {
                        throw new Error('Processamento de prompt bloqueado: Consentimento necessário');
                    }
                }
            }
            // Verificar cache
            const cacheKey = this.generateCacheKey('prompt', request);
            let response;
            if (this.config.cacheEnabled) {
                const cachedResponse = this.getFromCache(cacheKey);
                if (cachedResponse) {
                    console.log(`📦 Prompt obtido do cache (${requestId})`);
                    this.metrics.cacheHitRate =
                        (this.metrics.cacheHitRate * (this.metrics.totalRequests - 1) + 1) /
                            this.metrics.totalRequests;
                    return cachedResponse;
                }
            }
            // Processar prompt
            response = await this.promptManager.processPrompt(request);
            // Salvar no cache
            if (this.config.cacheEnabled) {
                this.saveToCache(cacheKey, response);
            }
            // Atualizar métricas
            const responseTime = Date.now() - startTime;
            this.updateMetrics(responseTime, true);
            console.log(`✅ Prompt processado (${requestId}) em ${responseTime}ms`);
            return response;
        }
        catch (error) {
            console.error(`❌ Erro no processamento de prompt (${requestId}):`, error);
            this.updateMetrics(Date.now() - startTime, false);
            throw error;
        }
    }
    /**
     * Obter métricas de performance
     */
    getMetrics() {
        return { ...this.metrics };
    }
    /**
     * Obter estatísticas de cache
     */
    getCacheStats() {
        const entries = Array.from(this.cache.values()).map(entry => ({
            key: entry.key,
            age: Date.now() - entry.timestamp.getTime(),
            hits: entry.hits,
            ttl: entry.ttl
        }));
        return {
            size: this.cache.size,
            hitRate: this.metrics.cacheHitRate,
            entries
        };
    }
    /**
     * Limpar cache
     */
    clearCache() {
        this.cache.clear();
        console.log('🗑️ Cache limpo');
    }
    /**
     * Atualizar configuração
     */
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
        console.log('⚙️ Configuração atualizada:', newConfig);
    }
    /**
     * Obter integração de compliance
     */
    getComplianceIntegration() {
        return this.complianceIntegration;
    }
    /**
     * Iniciar monitoramento de compliance
     */
    async startComplianceMonitoring() {
        if (this.config.enableCompliance) {
            await this.complianceIntegration.startRealTimeMonitoring();
        }
    }
    /**
     * Parar monitoramento de compliance
     */
    async stopComplianceMonitoring() {
        await this.complianceIntegration.stopRealTimeMonitoring();
    }
    /**
     * Obter status de compliance
     */
    async getComplianceStatus() {
        if (this.config.enableCompliance) {
            return await this.complianceIntegration.getComplianceStatus();
        }
        return null;
    }
    /**
     * Obter dashboard de compliance
     */
    async getComplianceDashboard() {
        if (this.config.enableCompliance) {
            return await this.complianceIntegration.getComplianceDashboard();
        }
        return null;
    }
    /**
     * Processar requisição de agendamento
     */
    async processSchedulingRequest(request) {
        // Usar o motor de agendamento
        return await this.schedulingEngine.scheduleAppointment(request);
    }
    /**
     * Fallback para heurística
     */
    async fallbackToHeuristic(request) {
        // Implementar fallback heurístico simples
        const appointment = {
            id: `app_${Date.now()}`,
            patientId: request.patient.id,
            patientName: request.patient.name,
            patientAvatarUrl: request.patient.avatarUrl || `https://i.pravatar.cc/150?u=${request.patient.id}`,
            therapistId: request.preferences.preferredTherapist || 'therapist_1',
            title: `Consulta de ${request.appointmentType}`,
            startTime: request.preferredTime || new Date(),
            endTime: new Date((request.preferredTime || new Date()).getTime() + request.duration * 60 * 1000),
            status: 'Agendado',
            type: request.appointmentType,
            value: 120,
            paymentStatus: 'pending',
            observations: '',
            recurrenceRule: { frequency: 'weekly', days: [], until: '' },
            seriesId: '',
            createdAt: new Date(),
            updatedAt: new Date(),
            created_by: ''
        };
        return {
            appointment,
            predictions: {
                demand: {
                    date: new Date(),
                    predictedDemand: 10,
                    confidence: 0.5,
                    factors: [],
                    recommendations: [],
                    hourlyBreakdown: [],
                    resourceRequirements: []
                },
                noShow: {
                    appointmentId: appointment.id,
                    patientId: request.patient.id,
                    probability: 0.15,
                    confidence: 0.5,
                    riskLevel: 'low',
                    factors: [],
                    recommendations: [],
                    urgency: 'low',
                    lastUpdated: new Date()
                }
            },
            optimization: {
                appointmentId: appointment.id,
                optimizedResources: [],
                efficiency: 0.7,
                conflicts: [],
                recommendations: [],
                costSavings: 0,
                utilizationRate: 0.7
            },
            aiInsights: [],
            recommendations: [],
            confidence: 0.6,
            alternatives: []
        };
    }
    /**
     * Gerar ID único para requisição
     */
    generateRequestId() {
        return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    /**
     * Gerar chave de cache
     */
    generateCacheKey(type, data) {
        const dataString = JSON.stringify(data, Object.keys(data).sort());
        return `${type}_${Buffer.from(dataString).toString('base64').substr(0, 32)}`;
    }
    /**
     * Obter dados do cache
     */
    getFromCache(key) {
        const entry = this.cache.get(key);
        if (!entry)
            return null;
        // Verificar se expirou
        if (Date.now() - entry.timestamp.getTime() > entry.ttl * 60 * 1000) {
            this.cache.delete(key);
            return null;
        }
        // Incrementar hits
        entry.hits++;
        return entry.data;
    }
    /**
     * Salvar dados no cache
     */
    saveToCache(key, data) {
        this.cache.set(key, {
            key,
            data,
            timestamp: new Date(),
            ttl: this.config.cacheTTL,
            hits: 0
        });
    }
    /**
     * Atualizar métricas
     */
    updateMetrics(responseTime, success, response) {
        this.metrics.successfulRequests += success ? 1 : 0;
        this.metrics.averageResponseTime =
            (this.metrics.averageResponseTime * (this.metrics.totalRequests - 1) + responseTime) /
                this.metrics.totalRequests;
        this.metrics.errorRate =
            (this.metrics.totalRequests - this.metrics.successfulRequests) / this.metrics.totalRequests;
        if (response) {
            this.metrics.costSavings += response.optimization.costSavings;
            this.metrics.resourceEfficiency =
                (this.metrics.resourceEfficiency * (this.metrics.successfulRequests - 1) + response.optimization.efficiency) /
                    this.metrics.successfulRequests;
        }
        this.metrics.lastUpdated = new Date();
    }
    /**
     * Iniciar limpeza automática de cache
     */
    startCacheCleanup() {
        setInterval(() => {
            const now = Date.now();
            let cleaned = 0;
            for (const [key, entry] of this.cache.entries()) {
                if (now - entry.timestamp.getTime() > entry.ttl * 60 * 1000) {
                    this.cache.delete(key);
                    cleaned++;
                }
            }
            if (cleaned > 0) {
                console.log(`🧹 Cache limpo: ${cleaned} entradas removidas`);
            }
        }, 5 * 60 * 1000); // A cada 5 minutos
    }
}
