/**
 * AI Orchestrator Service - Multi-Provider Integration
 * Orquestra Groq e Gemini com fallback automático e roteamento inteligente
 */

import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import { AIProvider as LegacyAIProvider, AIResponse as LegacyAIResponse, AIQueryLog } from '../../types';
import { secureLogger } from '../../lib/secureLogger';
import { checkRateLimit as rateLimitCheck } from './rateLimiter';
import { handleError } from '../../lib/middleware/errorHandler';

// Novos imports do sistema híbrido
import { getGroqService } from './groqService';
import { getAIProviderService } from './aiProviderService';
import {
  AIProvider,
  AIUseCase,
  AIRequest,
  AIResponse,
  AIRequestStatus,
  AIStreamConfig,
  ChatMessage,
  AIError,
  AIErrorCode,
} from './types';

/**
 * Serviço Orquestrador de IA - Integra múltiplos providers
 */
export class AiOrchestratorService {
  // Gemini (legado)
  private genAI: GoogleGenerativeAI | null = null;
  private model: any = null;
  private queryHistory: AIQueryLog[] = [];

  // Novos services
  private groqService = getGroqService();
  private providerRouter = getAIProviderService();
  
  // Cache de respostas
  private responseCache = new Map<string, AIResponse>();
  private cacheEnabled = true;
  private cacheTTLSeconds = 300; // 5 minutos

  // Métricas
  private metrics = {
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    fallbackUsed: 0,
    cacheHits: 0,
  };

  constructor() {
    this.initializeGemini();
    this.logInitialization();
  }

  /**
   * Inicializa Gemini (mantém compatibilidade)
   */
  private initializeGemini() {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

    if (!apiKey || apiKey === 'your_gemini_api_key') {
      secureLogger.warn('Gemini API key not configured. Using Groq or fallback mock responses.', {
        component: 'AiOrchestratorService',
        action: 'initializeGemini'
      });
      return;
    }

    try {
      this.genAI = new GoogleGenerativeAI(apiKey);

      this.model = this.genAI.getGenerativeModel({
        model: 'gemini-pro',
        safetySettings: [
          {
            category: HarmCategory.HARM_CATEGORY_HARASSMENT,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
          },
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        },
      });

      secureLogger.info('Gemini API initialized successfully', {
        component: 'AiOrchestratorService',
        action: 'initializeGemini'
      });
    } catch (error) {
      secureLogger.error('Error initializing Gemini API', error, {
        component: 'AiOrchestratorService',
        action: 'initializeGemini'
      });
      this.genAI = null;
      this.model = null;
    }
  }

  private logInitialization() {
    const groqAvailable = process.env.GROQ_API_KEY ? '✅' : '❌';
    const geminiAvailable = this.model ? '✅' : '❌';
    
    console.log(`
🤖 AI Orchestrator Initialized
  ${groqAvailable} Groq (velocidade)
  ${geminiAvailable} Gemini (complexidade)
  🔄 Fallback: ${this.providerRouter['enableFallback'] ? 'Habilitado' : 'Desabilitado'}
    `);
  }

  // ==================== NOVOS MÉTODOS (SISTEMA HÍBRIDO) ====================

  /**
   * Gera texto usando sistema híbrido com roteamento automático
   */
  async generateText(request: AIRequest): Promise<AIResponse> {
    this.metrics.totalRequests++;
    const startTime = Date.now();

    try {
      // Verificar cache
      if (this.cacheEnabled) {
        const cached = this.getCachedResponse(request);
        if (cached) {
          this.metrics.cacheHits++;
          return cached;
        }
      }

      // Determinar provider baseado no caso de uso
      const routing = this.providerRouter.getProviderForUseCase(request.useCase);
      const provider = request.provider || routing.provider;

      // Tentar provider primário
      let response: AIResponse;
      try {
        response = await this.executeRequest(provider, request);
        this.metrics.successfulRequests++;
      } catch (error) {
        // Tentar fallback
        const fallbackProvider = this.providerRouter.getFallbackProvider(provider);
        
        secureLogger.warn(`Fallback: ${provider} → ${fallbackProvider}`, {
          component: 'AiOrchestratorService',
          error: error instanceof Error ? error.message : 'Unknown error'
        });

        response = await this.executeRequest(fallbackProvider, request);
        response.usedFallback = true;
        response.originalProvider = provider;
        response.fallbackReason = error instanceof Error ? error.message : 'Unknown error';
        this.metrics.fallbackUsed++;
      }

      // Armazenar em cache
      if (this.cacheEnabled) {
        this.cacheResponse(request, response);
      }

      // Log para histórico
      this.logQuery(
        request.prompt,
        response.text,
        response.provider
      );

      return response;
    } catch (error) {
      this.metrics.failedRequests++;
      
      handleError(error, {
        operation: 'generateText',
        severity: 'high',
        fallbackMessage: 'Erro ao gerar texto com IA',
        context: {
          useCase: request.useCase,
          provider: request.provider,
        }
      });

      throw error;
    }
  }

  /**
   * Stream de texto com roteamento automático
   */
  async streamText(request: AIRequest, config: AIStreamConfig): Promise<void> {
    // Determinar provider
    const routing = this.providerRouter.getProviderForUseCase(request.useCase);
    const provider = request.provider || routing.provider;

    try {
      if (provider === AIProvider.GROQ) {
        await this.groqService.streamText(request, config);
      } else {
        // Gemini não tem streaming nativo na implementação atual
        // Simular streaming
        const response = await this.executeRequestGemini(request);
        config.onStart?.();
        config.onChunk(response.text);
        config.onComplete?.(response.text);
      }
    } catch (error) {
      config.onError?.(error as Error);
      throw error;
    }
  }

  /**
   * Chat com múltiplas mensagens
   */
  async chat(messages: ChatMessage[], config?: Partial<AIRequest>): Promise<AIResponse> {
    const useCase = config?.useCase || AIUseCase.CHAT;
    const routing = this.providerRouter.getProviderForUseCase(useCase);
    
    const provider = config?.provider || routing.provider;

    if (provider === AIProvider.GROQ) {
      return this.groqService.chat(messages, config);
    } else {
      // Gemini chat
      const prompt = this.messagesToPrompt(messages);
      return this.executeRequestGemini({
        prompt,
        useCase,
        ...config,
      } as AIRequest);
    }
  }

  /**
   * Executa requisição no provider especificado
   */
  private async executeRequest(provider: AIProvider, request: AIRequest): Promise<AIResponse> {
    if (provider === AIProvider.GROQ) {
      return this.groqService.generateText(request);
    } else if (provider === AIProvider.GEMINI) {
      return this.executeRequestGemini(request);
    } else {
      throw new AIError(
        `Provider não suportado: ${provider}`,
        provider,
        AIErrorCode.PROVIDER_ERROR
      );
    }
  }

  /**
   * Executa requisição no Gemini (compatibilidade)
   */
  private async executeRequestGemini(request: AIRequest): Promise<AIResponse> {
    const startTime = Date.now();

    if (!this.model) {
      throw new AIError(
        'Gemini não está configurado',
        AIProvider.GEMINI,
        AIErrorCode.AUTHENTICATION
      );
    }

    try {
      const result = await this.model.generateContent(request.prompt);
      const response = await result.response;
      const text = response.text();

      return {
        text,
        provider: AIProvider.GEMINI,
        model: 'gemini-pro',
        status: AIRequestStatus.COMPLETED,
        latencyMs: Date.now() - startTime,
        tokensUsed: {
          prompt: request.prompt.length / 4, // Estimativa
          completion: text.length / 4,
          total: (request.prompt.length + text.length) / 4,
        },
        estimatedCost: 0,
        usedFallback: false,
        timestamp: new Date(),
        requestId: `gemini_${Date.now()}`,
      };
    } catch (error) {
      throw new AIError(
        error instanceof Error ? error.message : 'Erro no Gemini',
        AIProvider.GEMINI,
        AIErrorCode.PROVIDER_ERROR,
        true,
        error as Error
      );
    }
  }

  // ==================== MÉTODOS LEGADOS (COMPATIBILIDADE) ====================

  /**
   * Query legada - mantém compatibilidade
   */
  async query(prompt: string, provider?: string, userId: string = 'anonymous'): Promise<LegacyAIResponse> {
    // Check rate limit
    const rateLimit = await rateLimitCheck(userId, 'ai:query');

    if (!rateLimit.allowed) {
      const error = `Rate limit exceeded. Try again in ${rateLimit.retryAfter} seconds.`;
      secureLogger.warn('AI query rate limited', {
        component: 'AiOrchestratorService',
        action: 'query',
        userId,
        remaining: rateLimit.remaining,
        retryAfter: rateLimit.retryAfter
      });
      throw new Error(error);
    }

    // Usar novo sistema
    try {
      const response = await this.generateText({
        prompt,
        useCase: AIUseCase.GENERAL,
        provider: provider === 'gemini' ? AIProvider.GEMINI : AIProvider.GROQ,
      });

      return {
        content: response.text,
        source: response.provider,
      };
    } catch (error) {
      // Fallback para mock
      return this.getMockResponse(prompt, provider);
    }
  }

  async getQueryHistory(): Promise<AIQueryLog[]> {
    return this.queryHistory.slice(-10);
  }

  async getAvailableProviders(): Promise<LegacyAIProvider[]> {
    const providers: LegacyAIProvider[] = [];
    
    if (await this.groqService.isAvailable()) {
      providers.push('groq' as LegacyAIProvider);
    }
    if (this.model) {
      providers.push('gemini' as LegacyAIProvider);
    }
    if (providers.length === 0) {
      providers.push('mock' as LegacyAIProvider);
    }

    return providers;
  }

  async generateSoapNote(data: any): Promise<any> {
    const prompt = `
Como um assistente especializado em fisioterapia, gere uma nota SOAP completa baseada nos seguintes dados:

Subjetivo: ${data.subjective || 'Não informado'}
Objetivo: ${data.objective || 'Não informado'}
Dor (EVA): ${data.painScale !== undefined ? data.painScale + '/10' : 'Não informado'}
Pontos de Dor: ${data.painPoints && data.painPoints.length > 0 ? data.painPoints.join(', ') : 'Não informado'}

Forneça:
1. **Assessment (Avaliação)**: Análise clínica detalhada do quadro
2. **Plan (Plano)**: Plano de tratamento baseado em evidências

Retorne APENAS um objeto JSON válido no seguinte formato (sem markdown, sem texto adicional):
{
  "assessment": "texto da avaliação aqui",
  "plan": "texto do plano aqui"
}
`;

    try {
      const response = await this.generateText({
        prompt,
        useCase: AIUseCase.SOAP_NOTE,
        maxTokens: 1500,
      });

      const text = response.text.trim();
      const cleanedText = text.replace(/```json\s*|\s*```/g, '').trim();

      try {
        return JSON.parse(cleanedText);
      } catch (parseError) {
        return {
          assessment: this.extractSection(text, 'assessment') || 'Análise clínica pendente.',
          plan: this.extractSection(text, 'plan') || 'Plano de tratamento pendente.',
        };
      }
    } catch (error) {
      secureLogger.error('Error generating SOAP note', error, {
        component: 'AiOrchestratorService',
        action: 'generateSoapNote'
      });
      throw error;
    }
  }

  async getResponse(prompt: string): Promise<any> {
    const enhancedPrompt = `
${prompt}

IMPORTANTE: Retorne sua resposta como um objeto JSON válido no seguinte formato:
{
  "assessment": "texto da avaliação",
  "plan": "texto do plano",
  "alerts": [
    {
      "id": "1",
      "severity": "critical",
      "message": "mensagem do alerta",
      "recommendation": "recomendação específica"
    }
  ],
  "evidences": [
    {
      "title": "Título do estudo",
      "reference": "Autor et al., Ano"
    }
  ]
}

Certifique-se de que:
- Todos os textos estão em português brasileiro
- Os alertas têm severity: "critical", "important" ou "info"
- Inclua pelo menos 1-2 evidências científicas relevantes
- Retorne APENAS o JSON, sem markdown ou texto adicional
`;

    try {
      const response = await this.generateText({
        prompt: enhancedPrompt,
        useCase: AIUseCase.PATIENT_ANALYSIS,
        maxTokens: 2000,
      });

      const text = response.text.trim();
      const cleanedText = text.replace(/```json\s*|\s*```/g, '').trim();

      try {
        return JSON.parse(cleanedText);
      } catch (parseError) {
        return {
          assessment: this.extractSection(text, 'assessment') || 'Análise clínica baseada nos dados coletados.',
          plan: this.extractSection(text, 'plan') || 'Plano de tratamento individualizado.',
          alerts: [],
          evidences: [],
        };
      }
    } catch (error) {
      secureLogger.error('Error getting AI response', error, {
        component: 'AiOrchestratorService',
        action: 'getResponse'
      });
      throw error;
    }
  }

  // ==================== MÉTODOS AUXILIARES ====================

  private getCachedResponse(request: AIRequest): AIResponse | null {
    const key = this.generateCacheKey(request);
    const cached = this.responseCache.get(key);

    if (cached) {
      const age = Date.now() - cached.timestamp.getTime();
      if (age < this.cacheTTLSeconds * 1000) {
        console.log(`💾 Cache hit: ${key.substring(0, 20)}...`);
        return { ...cached, metadata: { ...cached.metadata, fromCache: true } };
      } else {
        this.responseCache.delete(key);
      }
    }

    return null;
  }

  private cacheResponse(request: AIRequest, response: AIResponse): void {
    const key = this.generateCacheKey(request);
    this.responseCache.set(key, response);

    // Limitar tamanho do cache
    if (this.responseCache.size > 100) {
      const firstKey = this.responseCache.keys().next().value;
      this.responseCache.delete(firstKey);
    }
  }

  private generateCacheKey(request: AIRequest): string {
    return `${request.useCase}_${request.prompt.substring(0, 50)}`;
  }

  private messagesToPrompt(messages: ChatMessage[]): string {
    return messages
      .map(msg => {
        const role = msg.role === 'system' ? 'Sistema' : 
                     msg.role === 'user' ? 'Usuário' : 'Assistente';
        return `${role}: ${msg.content}`;
      })
      .join('\n\n');
  }

  private getMockResponse(prompt: string, provider?: string): LegacyAIResponse {
    return {
      content: `Mock AI response for: ${prompt.slice(0, 50)}...`,
      source: provider || 'mock',
    };
  }

  private logQuery(prompt: string, response: string, source: string) {
    this.queryHistory.push({
      id: `${Date.now()}-${Math.random()}`,
      prompt: prompt.slice(0, 100) + '...',
      response: response.slice(0, 200) + '...',
      timestamp: new Date(),
      provider: source as LegacyAIProvider,
    });

    if (this.queryHistory.length > 50) {
      this.queryHistory = this.queryHistory.slice(-50);
    }
  }

  private extractSection(text: string, section: string): string | null {
    const patterns = [
      new RegExp(`"${section}":\\s*"([^"]*)"`, 'i'),
      new RegExp(`${section}:\\s*([^\\n]*?)(?:\\n|$)`, 'i'),
      new RegExp(`\\*\\*${section}\\*\\*:\\s*([^\\n]*?)(?:\\n|$)`, 'i'),
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }

    return null;
  }

  // ==================== STATUS E MÉTRICAS ====================

  isGeminiConfigured(): boolean {
    return this.model !== null;
  }

  async isGroqConfigured(): Promise<boolean> {
    return this.groqService.isAvailable();
  }

  getCurrentProvider(): string {
    return this.model ? 'gemini+groq' : 'groq';
  }

  getMetrics() {
    return {
      ...this.metrics,
      groq: this.groqService.getMetrics(),
      routing: this.providerRouter.getRoutingStats(),
      cacheSize: this.responseCache.size,
    };
  }

  resetMetrics(): void {
    this.metrics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      fallbackUsed: 0,
      cacheHits: 0,
    };
    this.groqService.resetMetrics();
    this.providerRouter.resetStats();
  }

  setCacheEnabled(enabled: boolean): void {
    this.cacheEnabled = enabled;
    if (!enabled) {
      this.responseCache.clear();
    }
  }
}

export const aiOrchestratorService = new AiOrchestratorService();
