/**
 * Serviço de IA usando Groq
 * Provider focado em velocidade e baixa latência
 */

import { createGroq } from '@ai-sdk/groq';
import { generateText, streamText } from 'ai';
import {
  AIProvider,
  AIModel,
  AIRequest,
  AIResponse,
  AIRequestStatus,
  IAIService,
  AIMetrics,
  AIStreamConfig,
  ChatMessage,
  AIError,
  AIErrorCode,
} from './types';

/**
 * Configuração do Groq
 */
interface GroqConfig {
  apiKey: string;
  defaultModel: AIModel;
  maxRetries: number;
  timeoutMs: number;
}

/**
 * Serviço Groq para inferência rápida de IA
 */
export class GroqService implements IAIService {
  readonly provider = AIProvider.GROQ;
  readonly defaultModel = AIModel.GROQ_LLAMA_70B;

  private groq: ReturnType<typeof createGroq>;
  private config: GroqConfig;
  private metrics: AIMetrics;
  private requestCount: number = 0;
  private lastRequestTime: number = 0;

  constructor(config?: Partial<GroqConfig>) {
    // Configuração padrão
    this.config = {
      apiKey: process.env.GROQ_API_KEY || '',
      defaultModel: AIModel.GROQ_LLAMA_70B,
      maxRetries: 3,
      timeoutMs: 30000,
      ...config,
    };

    if (!this.config.apiKey) {
      console.warn('⚠️ GROQ_API_KEY não configurada. Groq não estará disponível.');
    }

    // Inicializar cliente Groq
    this.groq = createGroq({
      apiKey: this.config.apiKey,
    });

    // Inicializar métricas
    this.metrics = this.initializeMetrics();
  }

  /**
   * Gera texto usando Groq
   */
  async generateText(request: AIRequest): Promise<AIResponse> {
    const startTime = Date.now();
    const requestId = this.generateRequestId();

    try {
      // Validações
      this.validateRequest(request);
      await this.checkRateLimit();

      // Determinar modelo
      const model = this.getModel(request.model);

      // Preparar prompt
      const fullPrompt = this.buildPrompt(request);

      // Fazer requisição ao Groq
      const result = await generateText({
        model: this.groq(model),
        prompt: fullPrompt,
        maxTokens: request.maxTokens || 1000,
        temperature: request.temperature || 0.7,
        topP: request.topP || 1,
        stopSequences: request.stopSequences,
      });

      // Calcular métricas
      const latencyMs = Date.now() - startTime;
      const tokensUsed = {
        prompt: result.usage?.promptTokens || 0,
        completion: result.usage?.completionTokens || 0,
        total: (result.usage?.promptTokens || 0) + (result.usage?.completionTokens || 0),
      };

      // Atualizar métricas
      this.updateMetrics(true, latencyMs, tokensUsed.total);

      // Construir resposta
      const response: AIResponse = {
        text: result.text,
        provider: AIProvider.GROQ,
        model,
        status: AIRequestStatus.COMPLETED,
        latencyMs,
        tokensUsed,
        estimatedCost: this.calculateCost(tokensUsed),
        usedFallback: false,
        timestamp: new Date(),
        requestId,
        metadata: {
          finishReason: result.finishReason,
          ...request.metadata,
        },
      };

      return response;
    } catch (error) {
      // Atualizar métricas de erro
      this.updateMetrics(false, Date.now() - startTime, 0);

      // Tratar erro
      throw this.handleError(error, requestId);
    }
  }

  /**
   * Stream de texto usando Groq
   */
  async streamText(request: AIRequest, config: AIStreamConfig): Promise<void> {
    const startTime = Date.now();
    const requestId = this.generateRequestId();

    try {
      // Validações
      this.validateRequest(request);
      await this.checkRateLimit();

      // Determinar modelo
      const model = this.getModel(request.model);

      // Preparar prompt
      const fullPrompt = this.buildPrompt(request);

      // Iniciar callback
      config.onStart?.();

      // Stream do Groq
      const result = streamText({
        model: this.groq(model),
        prompt: fullPrompt,
        maxTokens: request.maxTokens || 1000,
        temperature: request.temperature || 0.7,
        topP: request.topP || 1,
      });

      let fullText = '';

      // Processar chunks
      for await (const chunk of result.textStream) {
        fullText += chunk;
        config.onChunk(chunk);
      }

      // Finalizar
      config.onComplete?.(fullText);

      // Atualizar métricas
      const latencyMs = Date.now() - startTime;
      this.updateMetrics(true, latencyMs, fullText.length / 4); // Estimativa de tokens
    } catch (error) {
      config.onError?.(error as Error);
      this.updateMetrics(false, Date.now() - startTime, 0);
      throw this.handleError(error, requestId);
    }
  }

  /**
   * Chat usando Groq
   */
  async chat(messages: ChatMessage[], config?: Partial<AIRequest>): Promise<AIResponse> {
    // Converter mensagens para prompt
    const prompt = this.messagesToPrompt(messages);

    // Criar requisição
    const request: AIRequest = {
      prompt,
      useCase: config?.useCase || 'chat' as any,
      maxTokens: config?.maxTokens || 1000,
      temperature: config?.temperature || 0.7,
      model: config?.model,
      metadata: config?.metadata,
    };

    return this.generateText(request);
  }

  /**
   * Verifica se o serviço está disponível
   */
  async isAvailable(): Promise<boolean> {
    if (!this.config.apiKey) {
      return false;
    }

    try {
      // Fazer requisição simples para testar
      await generateText({
        model: this.groq(this.defaultModel),
        prompt: 'test',
        maxTokens: 5,
      });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Retorna modelos disponíveis
   */
  getModels(): AIModel[] {
    return [
      AIModel.GROQ_LLAMA_70B,
      AIModel.GROQ_LLAMA_8B,
      AIModel.GROQ_MIXTRAL,
    ];
  }

  /**
   * Retorna métricas do serviço
   */
  getMetrics(): AIMetrics {
    return { ...this.metrics };
  }

  /**
   * Reseta métricas
   */
  resetMetrics(): void {
    this.metrics = this.initializeMetrics();
  }

  // ==================== MÉTODOS PRIVADOS ====================

  private validateRequest(request: AIRequest): void {
    if (!request.prompt || request.prompt.trim().length === 0) {
      throw new AIError(
        'Prompt é obrigatório',
        AIProvider.GROQ,
        AIErrorCode.INVALID_REQUEST
      );
    }

    if (request.maxTokens && request.maxTokens > 32768) {
      throw new AIError(
        'maxTokens não pode exceder 32768',
        AIProvider.GROQ,
        AIErrorCode.INVALID_REQUEST
      );
    }
  }

  private async checkRateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;

    // Rate limit simples: máximo 10 req/s
    if (timeSinceLastRequest < 100) {
      await new Promise(resolve => setTimeout(resolve, 100 - timeSinceLastRequest));
    }

    this.lastRequestTime = Date.now();
    this.requestCount++;
  }

  private getModel(requestedModel?: AIModel): string {
    if (requestedModel) {
      const availableModels = this.getModels();
      if (availableModels.includes(requestedModel)) {
        return requestedModel;
      }
    }
    return this.defaultModel;
  }

  private buildPrompt(request: AIRequest): string {
    let prompt = '';

    // Adicionar system prompt se existir
    if (request.systemPrompt) {
      prompt += `Sistema: ${request.systemPrompt}\n\n`;
    }

    // Adicionar contexto se existir
    if (request.context && request.context.length > 0) {
      prompt += `Contexto:\n${request.context.join('\n')}\n\n`;
    }

    // Adicionar prompt principal
    prompt += request.prompt;

    return prompt;
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

  private calculateCost(tokensUsed: { prompt: number; completion: number }): number {
    // Preços Groq (estimativa, verificar preços atuais)
    // Llama 3.3 70B: ~$0.10 por 1M tokens
    const costPerMillionTokens = 0.10;
    const totalTokens = tokensUsed.prompt + tokensUsed.completion;
    return (totalTokens / 1_000_000) * costPerMillionTokens;
  }

  private updateMetrics(
    success: boolean,
    latencyMs: number,
    tokensUsed: number
  ): void {
    this.metrics.totalRequests++;

    if (success) {
      this.metrics.successfulRequests++;
      
      // Atualizar latência
      const totalLatency = this.metrics.averageLatencyMs * (this.metrics.successfulRequests - 1);
      this.metrics.averageLatencyMs = (totalLatency + latencyMs) / this.metrics.successfulRequests;
      this.metrics.minLatencyMs = Math.min(this.metrics.minLatencyMs, latencyMs);
      this.metrics.maxLatencyMs = Math.max(this.metrics.maxLatencyMs, latencyMs);

      // Atualizar tokens
      this.metrics.totalTokensUsed += tokensUsed;
      this.metrics.estimatedCostUSD += this.calculateCost({
        prompt: tokensUsed / 2,
        completion: tokensUsed / 2,
      });
    } else {
      this.metrics.failedRequests++;
    }

    this.metrics.periodEnd = new Date();
  }

  private handleError(error: any, requestId: string): AIError {
    let code = AIErrorCode.UNKNOWN;
    let retryable = false;
    let message = 'Erro desconhecido no Groq';

    if (error?.message?.includes('rate limit')) {
      code = AIErrorCode.RATE_LIMIT;
      retryable = true;
      message = 'Rate limit excedido no Groq';
    } else if (error?.message?.includes('authentication') || error?.message?.includes('api key')) {
      code = AIErrorCode.AUTHENTICATION;
      message = 'Erro de autenticação no Groq';
    } else if (error?.message?.includes('timeout')) {
      code = AIErrorCode.TIMEOUT;
      retryable = true;
      message = 'Timeout na requisição ao Groq';
    } else if (error?.message?.includes('model')) {
      code = AIErrorCode.MODEL_UNAVAILABLE;
      message = 'Modelo não disponível no Groq';
    } else if (error?.message) {
      message = error.message;
    }

    console.error(`❌ Groq Error [${requestId}]:`, message, error);

    return new AIError(message, AIProvider.GROQ, code, retryable, error);
  }

  private generateRequestId(): string {
    return `groq_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  }

  private initializeMetrics(): AIMetrics {
    return {
      provider: AIProvider.GROQ,
      model: this.defaultModel,
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      fallbackRequests: 0,
      averageLatencyMs: 0,
      minLatencyMs: Infinity,
      maxLatencyMs: 0,
      totalTokensUsed: 0,
      promptTokens: 0,
      completionTokens: 0,
      estimatedCostUSD: 0,
      periodStart: new Date(),
      periodEnd: new Date(),
    };
  }
}

// Instância singleton
let groqServiceInstance: GroqService | null = null;

/**
 * Retorna instância singleton do GroqService
 */
export function getGroqService(): GroqService {
  if (!groqServiceInstance) {
    groqServiceInstance = new GroqService();
  }
  return groqServiceInstance;
}

export default GroqService;


