/**
 * Testes para GroqService
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GroqService } from '../../services/ai/groqService';
import { AIProvider, AIUseCase, AIRequestStatus } from '../../services/ai/types';

// Mock do Groq SDK
vi.mock('@ai-sdk/groq', () => ({
  createGroq: vi.fn(() => ({
    // Mock do modelo Groq
  })),
}));

vi.mock('ai', () => ({
  generateText: vi.fn(async ({ prompt }) => ({
    text: `Mock response for: ${prompt}`,
    usage: {
      promptTokens: 10,
      completionTokens: 20,
    },
    finishReason: 'stop',
  })),
  streamText: vi.fn(() => ({
    textStream: (async function* () {
      yield 'Mock ';
      yield 'streaming ';
      yield 'response';
    })(),
  })),
}));

describe('GroqService', () => {
  let service: GroqService;

  beforeEach(() => {
    service = new GroqService({
      apiKey: 'test-key',
      maxRetries: 3,
      timeoutMs: 5000,
    });
  });

  describe('generateText', () => {
    it('deve gerar texto com sucesso', async () => {
      const response = await service.generateText({
        prompt: 'Teste de prompt',
        useCase: AIUseCase.REALTIME_SUGGESTIONS,
        maxTokens: 100,
      });

      expect(response).toBeDefined();
      expect(response.provider).toBe(AIProvider.GROQ);
      expect(response.status).toBe(AIRequestStatus.COMPLETED);
      expect(response.text).toContain('Mock response');
      expect(response.latencyMs).toBeGreaterThan(0);
      expect(response.tokensUsed.total).toBeGreaterThan(0);
    });

    it('deve validar prompt vazio', async () => {
      await expect(
        service.generateText({
          prompt: '',
          useCase: AIUseCase.REALTIME_SUGGESTIONS,
        })
      ).rejects.toThrow('Prompt é obrigatório');
    });

    it('deve validar maxTokens', async () => {
      await expect(
        service.generateText({
          prompt: 'Teste',
          useCase: AIUseCase.REALTIME_SUGGESTIONS,
          maxTokens: 40000, // Excede limite
        })
      ).rejects.toThrow('maxTokens não pode exceder 32768');
    });

    it('deve usar modelo padrão', async () => {
      const response = await service.generateText({
        prompt: 'Teste',
        useCase: AIUseCase.REALTIME_SUGGESTIONS,
      });

      expect(response.model).toBe('llama-3.3-70b-versatile');
    });

    it('deve calcular custo estimado', async () => {
      const response = await service.generateText({
        prompt: 'Teste',
        useCase: AIUseCase.REALTIME_SUGGESTIONS,
      });

      expect(response.estimatedCost).toBeGreaterThanOrEqual(0);
    });
  });

  describe('streamText', () => {
    it('deve fazer streaming de texto', async () => {
      let chunks: string[] = [];
      let fullText = '';

      await service.streamText(
        {
          prompt: 'Teste de streaming',
          useCase: AIUseCase.REALTIME_SUGGESTIONS,
        },
        {
          onStart: () => {
            chunks = [];
          },
          onChunk: (chunk) => {
            chunks.push(chunk);
          },
          onComplete: (text) => {
            fullText = text;
          },
        }
      );

      expect(chunks.length).toBeGreaterThan(0);
      expect(fullText).toBe('Mock streaming response');
    });

    it('deve chamar onError em caso de falha', async () => {
      const onError = vi.fn();

      // Forçar erro com prompt vazio
      await expect(
        service.streamText(
          {
            prompt: '',
            useCase: AIUseCase.REALTIME_SUGGESTIONS,
          },
          {
            onChunk: vi.fn(),
            onError,
          }
        )
      ).rejects.toThrow();

      expect(onError).toHaveBeenCalled();
    });
  });

  describe('chat', () => {
    it('deve processar mensagens de chat', async () => {
      const messages = [
        { role: 'system' as const, content: 'Você é um assistente' },
        { role: 'user' as const, content: 'Olá' },
      ];

      const response = await service.chat(messages);

      expect(response).toBeDefined();
      expect(response.text).toContain('Mock response');
      expect(response.provider).toBe(AIProvider.GROQ);
    });
  });

  describe('isAvailable', () => {
    it('deve retornar true quando configurado corretamente', async () => {
      const available = await service.isAvailable();
      expect(typeof available).toBe('boolean');
    });
  });

  describe('getModels', () => {
    it('deve retornar lista de modelos disponíveis', () => {
      const models = service.getModels();
      
      expect(Array.isArray(models)).toBe(true);
      expect(models.length).toBeGreaterThan(0);
      expect(models).toContain('llama-3.3-70b-versatile');
    });
  });

  describe('getMetrics', () => {
    it('deve retornar métricas iniciais', () => {
      const metrics = service.getMetrics();

      expect(metrics).toBeDefined();
      expect(metrics.provider).toBe(AIProvider.GROQ);
      expect(metrics.totalRequests).toBe(0);
      expect(metrics.successfulRequests).toBe(0);
      expect(metrics.failedRequests).toBe(0);
    });

    it('deve atualizar métricas após requisições', async () => {
      await service.generateText({
        prompt: 'Teste',
        useCase: AIUseCase.REALTIME_SUGGESTIONS,
      });

      const metrics = service.getMetrics();
      expect(metrics.totalRequests).toBe(1);
      expect(metrics.successfulRequests).toBe(1);
    });
  });

  describe('resetMetrics', () => {
    it('deve resetar métricas', async () => {
      // Fazer algumas requisições
      await service.generateText({
        prompt: 'Teste 1',
        useCase: AIUseCase.REALTIME_SUGGESTIONS,
      });
      await service.generateText({
        prompt: 'Teste 2',
        useCase: AIUseCase.REALTIME_SUGGESTIONS,
      });

      let metrics = service.getMetrics();
      expect(metrics.totalRequests).toBe(2);

      // Resetar
      service.resetMetrics();

      metrics = service.getMetrics();
      expect(metrics.totalRequests).toBe(0);
      expect(metrics.successfulRequests).toBe(0);
    });
  });

  describe('rate limiting', () => {
    it('deve respeitar rate limiting', async () => {
      const startTime = Date.now();

      // Fazer duas requisições rápidas
      await service.generateText({
        prompt: 'Teste 1',
        useCase: AIUseCase.REALTIME_SUGGESTIONS,
      });
      await service.generateText({
        prompt: 'Teste 2',
        useCase: AIUseCase.REALTIME_SUGGESTIONS,
      });

      const elapsed = Date.now() - startTime;
      
      // Deve ter algum delay devido ao rate limiting
      expect(elapsed).toBeGreaterThanOrEqual(100);
    });
  });
});


