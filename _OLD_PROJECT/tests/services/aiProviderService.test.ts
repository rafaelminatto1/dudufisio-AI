/**
 * Testes para AIProviderService (Router)
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { AIProviderService } from '../../services/ai/aiProviderService';
import { AIProvider, AIUseCase, AIModel } from '../../services/ai/types';

describe('AIProviderService', () => {
  let service: AIProviderService;

  beforeEach(() => {
    service = new AIProviderService({
      primaryProvider: AIProvider.GROQ,
      fallbackProvider: AIProvider.GEMINI,
      enableFallback: true,
    });
  });

  describe('getProviderForUseCase', () => {
    it('deve rotear casos de tempo real para Groq', () => {
      const cases = [
        AIUseCase.REALTIME_SUGGESTIONS,
        AIUseCase.AUTOCOMPLETE,
        AIUseCase.QUICK_SEARCH,
        AIUseCase.SYMPTOM_ANALYSIS,
      ];

      cases.forEach(useCase => {
        const result = service.getProviderForUseCase(useCase);
        expect(result.provider).toBe(AIProvider.GROQ);
        expect(result.confidence).toBeGreaterThan(0.8);
      });
    });

    it('deve rotear casos complexos para Gemini', () => {
      const cases = [
        AIUseCase.PATIENT_ANALYSIS,
        AIUseCase.REPORT_GENERATION,
        AIUseCase.TREATMENT_PROTOCOL,
        AIUseCase.SOAP_NOTE,
      ];

      cases.forEach(useCase => {
        const result = service.getProviderForUseCase(useCase);
        expect(result.provider).toBe(AIProvider.GEMINI);
        expect(result.confidence).toBeGreaterThan(0.8);
      });
    });

    it('deve incluir razão da decisão', () => {
      const result = service.getProviderForUseCase(AIUseCase.REALTIME_SUGGESTIONS);
      
      expect(result.reason).toBeDefined();
      expect(result.reason.length).toBeGreaterThan(0);
      expect(result.reason).toContain('latência');
    });

    it('deve selecionar modelo apropriado', () => {
      const resultGroq = service.getProviderForUseCase(AIUseCase.REALTIME_SUGGESTIONS);
      const resultGemini = service.getProviderForUseCase(AIUseCase.PATIENT_ANALYSIS);

      expect(resultGroq.model).toContain('llama');
      expect(resultGemini.model).toContain('gemini');
    });
  });

  describe('getFallbackProvider', () => {
    it('deve retornar Gemini como fallback para Groq', () => {
      const fallback = service.getFallbackProvider(AIProvider.GROQ);
      expect(fallback).toBe(AIProvider.GEMINI);
    });

    it('deve retornar Groq como fallback para Gemini', () => {
      const fallback = service.getFallbackProvider(AIProvider.GEMINI);
      expect(fallback).toBe(AIProvider.GROQ);
    });

    it('deve lançar erro se fallback está desabilitado', () => {
      const serviceNoFallback = new AIProviderService({
        enableFallback: false,
      });

      expect(() => {
        serviceNoFallback.getFallbackProvider(AIProvider.GROQ);
      }).toThrow('Fallback desabilitado');
    });
  });

  describe('isProviderSuitableForUseCase', () => {
    it('deve rejeitar Groq para análise de imagem', () => {
      const suitable = service.isProviderSuitableForUseCase(
        AIProvider.GROQ,
        AIUseCase.IMAGE_ANALYSIS
      );
      expect(suitable).toBe(false);
    });

    it('deve aceitar Gemini para análise de imagem', () => {
      const suitable = service.isProviderSuitableForUseCase(
        AIProvider.GEMINI,
        AIUseCase.IMAGE_ANALYSIS
      );
      expect(suitable).toBe(true);
    });

    it('deve aceitar ambos para casos gerais', () => {
      const suitableGroq = service.isProviderSuitableForUseCase(
        AIProvider.GROQ,
        AIUseCase.GENERAL
      );
      const suitableGemini = service.isProviderSuitableForUseCase(
        AIProvider.GEMINI,
        AIUseCase.GENERAL
      );

      expect(suitableGroq).toBe(true);
      expect(suitableGemini).toBe(true);
    });
  });

  describe('getRecommendedModel', () => {
    it('deve recomendar modelo rápido para casos de velocidade', () => {
      const model = service.getRecommendedModel(
        AIProvider.GROQ,
        AIUseCase.AUTOCOMPLETE
      );

      // Deve ser um modelo rápido (8B)
      expect(model).toBe(AIModel.GROQ_LLAMA_8B);
    });

    it('deve recomendar modelo de qualidade para análises', () => {
      const model = service.getRecommendedModel(
        AIProvider.GROQ,
        AIUseCase.PATIENT_ANALYSIS
      );

      // Deve ser um modelo de qualidade (70B)
      expect(model).toBe(AIModel.GROQ_LLAMA_70B);
    });

    it('deve recomendar modelo balanceado para casos gerais', () => {
      const model = service.getRecommendedModel(
        AIProvider.GROQ,
        AIUseCase.GENERAL
      );

      expect(model).toBeDefined();
      expect([
        AIModel.GROQ_LLAMA_70B,
        AIModel.GROQ_LLAMA_8B,
      ]).toContain(model);
    });
  });

  describe('getRoutingStats', () => {
    it('deve retornar estatísticas vazias inicialmente', () => {
      const stats = service.getRoutingStats();

      expect(stats.totalDecisions).toBe(0);
      expect(stats.averageConfidence).toBe(0);
    });

    it('deve acumular estatísticas de roteamento', () => {
      // Fazer algumas decisões
      service.getProviderForUseCase(AIUseCase.REALTIME_SUGGESTIONS);
      service.getProviderForUseCase(AIUseCase.PATIENT_ANALYSIS);
      service.getProviderForUseCase(AIUseCase.QUICK_SEARCH);

      const stats = service.getRoutingStats();

      expect(stats.totalDecisions).toBe(3);
      expect(stats.byProvider[AIProvider.GROQ]).toBeGreaterThan(0);
      expect(stats.byProvider[AIProvider.GEMINI]).toBeGreaterThan(0);
      expect(stats.averageConfidence).toBeGreaterThan(0);
    });
  });

  describe('resetStats', () => {
    it('deve resetar estatísticas', () => {
      // Fazer algumas decisões
      service.getProviderForUseCase(AIUseCase.REALTIME_SUGGESTIONS);
      service.getProviderForUseCase(AIUseCase.PATIENT_ANALYSIS);

      let stats = service.getRoutingStats();
      expect(stats.totalDecisions).toBe(2);

      // Resetar
      service.resetStats();

      stats = service.getRoutingStats();
      expect(stats.totalDecisions).toBe(0);
      expect(Object.keys(stats.byProvider).length).toBe(0);
    });
  });

  describe('updateConfig', () => {
    it('deve atualizar provider primário', () => {
      service.updateConfig({
        primaryProvider: AIProvider.GEMINI,
      });

      // Casos gerais devem usar o novo provider primário
      const result = service.getProviderForUseCase(AIUseCase.GENERAL);
      expect(result.provider).toBe(AIProvider.GEMINI);
    });

    it('deve atualizar fallback provider', () => {
      service.updateConfig({
        fallbackProvider: AIProvider.GROQ,
      });

      const fallback = service.getFallbackProvider(AIProvider.GEMINI);
      expect(fallback).toBe(AIProvider.GROQ);
    });

    it('deve habilitar/desabilitar fallback', () => {
      service.updateConfig({
        enableFallback: false,
      });

      expect(() => {
        service.getFallbackProvider(AIProvider.GROQ);
      }).toThrow();

      service.updateConfig({
        enableFallback: true,
      });

      expect(() => {
        service.getFallbackProvider(AIProvider.GROQ);
      }).not.toThrow();
    });
  });

  describe('routing consistency', () => {
    it('deve rotear consistentemente o mesmo caso de uso', () => {
      const results = Array(5).fill(null).map(() => 
        service.getProviderForUseCase(AIUseCase.REALTIME_SUGGESTIONS)
      );

      const providers = results.map(r => r.provider);
      const models = results.map(r => r.model);

      // Todos devem ter o mesmo provider e modelo
      expect(new Set(providers).size).toBe(1);
      expect(new Set(models).size).toBe(1);
    });
  });

  describe('performance', () => {
    it('deve rotear rapidamente', () => {
      const startTime = Date.now();

      // Fazer 1000 decisões de roteamento
      for (let i = 0; i < 1000; i++) {
        service.getProviderForUseCase(AIUseCase.REALTIME_SUGGESTIONS);
      }

      const elapsed = Date.now() - startTime;

      // Deve ser muito rápido (< 100ms para 1000 decisões)
      expect(elapsed).toBeLessThan(100);
    });
  });
});


