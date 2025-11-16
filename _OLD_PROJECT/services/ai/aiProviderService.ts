/**
 * Serviço de roteamento de AI providers
 * Decide automaticamente qual provider usar baseado no caso de uso
 */

import {
  AIProvider,
  AIModel,
  AIUseCase,
  ProviderRoutingResult,
} from './types';

/**
 * Configuração de roteamento por caso de uso
 */
const USE_CASE_ROUTING: Record<AIUseCase, AIProvider> = {
  // Casos de uso GROQ (velocidade/tempo real)
  [AIUseCase.REALTIME_SUGGESTIONS]: AIProvider.GROQ,
  [AIUseCase.AUTOCOMPLETE]: AIProvider.GROQ,
  [AIUseCase.QUICK_SEARCH]: AIProvider.GROQ,
  [AIUseCase.SYMPTOM_ANALYSIS]: AIProvider.GROQ,
  [AIUseCase.CLASSIFICATION]: AIProvider.GROQ,
  [AIUseCase.VALIDATION]: AIProvider.GROQ,
  [AIUseCase.BODY_MAP_ANNOTATION]: AIProvider.GROQ,
  
  // Casos de uso GEMINI (complexidade/multimodal)
  [AIUseCase.PATIENT_ANALYSIS]: AIProvider.GEMINI,
  [AIUseCase.REPORT_GENERATION]: AIProvider.GEMINI,
  [AIUseCase.IMAGE_ANALYSIS]: AIProvider.GEMINI,
  [AIUseCase.TREATMENT_PROTOCOL]: AIProvider.GEMINI,
  [AIUseCase.SOAP_NOTE]: AIProvider.GEMINI,
  [AIUseCase.LONG_CONTEXT]: AIProvider.GEMINI,
  
  // Casos neutros (usa provider primário)
  [AIUseCase.GENERAL]: AIProvider.GROQ,
  [AIUseCase.CHAT]: AIProvider.GROQ,
};

/**
 * Modelos recomendados por provider e tipo de tarefa
 */
const MODEL_RECOMMENDATIONS: Record<AIProvider, Record<string, AIModel>> = {
  [AIProvider.GROQ]: {
    fast: AIModel.GROQ_LLAMA_8B,
    balanced: AIModel.GROQ_LLAMA_70B,
    quality: AIModel.GROQ_LLAMA_70B,
  },
  [AIProvider.GEMINI]: {
    fast: AIModel.GEMINI_FLASH,
    balanced: AIModel.GEMINI_PRO,
    quality: AIModel.GEMINI_PRO,
  },
  [AIProvider.AUTO]: {
    fast: AIModel.GROQ_LLAMA_8B,
    balanced: AIModel.GROQ_LLAMA_70B,
    quality: AIModel.GEMINI_PRO,
  },
};

/**
 * Classe de serviço para roteamento de AI providers
 */
export class AIProviderService {
  private primaryProvider: AIProvider;
  private fallbackProvider: AIProvider;
  private enableFallback: boolean;
  private routingDecisions: ProviderRoutingResult[] = [];

  constructor(config?: {
    primaryProvider?: AIProvider;
    fallbackProvider?: AIProvider;
    enableFallback?: boolean;
  }) {
    this.primaryProvider = config?.primaryProvider || AIProvider.GROQ;
    this.fallbackProvider = config?.fallbackProvider || AIProvider.GEMINI;
    this.enableFallback = config?.enableFallback ?? true;
  }

  /**
   * Determina qual provider usar baseado no caso de uso
   */
  getProviderForUseCase(useCase: AIUseCase): ProviderRoutingResult {
    // Obter provider recomendado
    const recommendedProvider = USE_CASE_ROUTING[useCase] || this.primaryProvider;
    
    // Selecionar modelo apropriado
    const model = this.getRecommendedModel(recommendedProvider, useCase);
    
    // Calcular confiança da decisão
    const confidence = this.calculateConfidence(useCase, recommendedProvider);
    
    // Gerar razão da decisão
    const reason = this.getRoutingReason(useCase, recommendedProvider);
    
    const result: ProviderRoutingResult = {
      provider: recommendedProvider,
      model,
      reason,
      confidence,
    };

    // Registrar decisão
    this.routingDecisions.push(result);
    
    console.log(`🔀 AI Router: ${useCase} → ${recommendedProvider} (${model}) - ${reason}`);
    
    return result;
  }

  /**
   * Retorna o provider de fallback
   */
  getFallbackProvider(currentProvider: AIProvider): AIProvider {
    if (!this.enableFallback) {
      throw new Error('Fallback desabilitado');
    }

    // Se atual é Groq, fallback para Gemini
    if (currentProvider === AIProvider.GROQ) {
      return AIProvider.GEMINI;
    }
    
    // Se atual é Gemini, fallback para Groq
    if (currentProvider === AIProvider.GEMINI) {
      return AIProvider.GROQ;
    }
    
    // Default: usar fallback configurado
    return this.fallbackProvider;
  }

  /**
   * Verifica se um provider específico está disponível para um caso de uso
   */
  isProviderSuitableForUseCase(provider: AIProvider, useCase: AIUseCase): boolean {
    // Casos que requerem multimodal (só Gemini)
    const multimodalCases = [
      AIUseCase.IMAGE_ANALYSIS,
    ];
    
    if (multimodalCases.includes(useCase) && provider === AIProvider.GROQ) {
      return false;
    }

    // Casos que requerem contexto muito longo (preferência Gemini)
    const longContextCases = [
      AIUseCase.LONG_CONTEXT,
      AIUseCase.PATIENT_ANALYSIS,
    ];
    
    if (longContextCases.includes(useCase) && provider === AIProvider.GROQ) {
      // Groq pode lidar, mas não é ideal
      return true;
    }

    return true;
  }

  /**
   * Seleciona o melhor modelo para um provider e caso de uso
   */
  getRecommendedModel(provider: AIProvider, useCase: AIUseCase): AIModel {
    // Determinar prioridade (velocidade vs qualidade)
    let priority: 'fast' | 'balanced' | 'quality' = 'balanced';

    // Casos que priorizam velocidade
    const fastCases = [
      AIUseCase.REALTIME_SUGGESTIONS,
      AIUseCase.AUTOCOMPLETE,
      AIUseCase.QUICK_SEARCH,
    ];
    
    // Casos que priorizam qualidade
    const qualityCases = [
      AIUseCase.PATIENT_ANALYSIS,
      AIUseCase.REPORT_GENERATION,
      AIUseCase.TREATMENT_PROTOCOL,
      AIUseCase.SOAP_NOTE,
    ];

    if (fastCases.includes(useCase)) {
      priority = 'fast';
    } else if (qualityCases.includes(useCase)) {
      priority = 'quality';
    }

    return MODEL_RECOMMENDATIONS[provider][priority];
  }

  /**
   * Calcula confiança da decisão de roteamento (0-1)
   */
  private calculateConfidence(useCase: AIUseCase, provider: AIProvider): number {
    const recommendedProvider = USE_CASE_ROUTING[useCase];
    
    // Alta confiança se estamos usando o provider recomendado
    if (provider === recommendedProvider) {
      return 0.95;
    }
    
    // Média confiança se é um caso neutro
    if (useCase === AIUseCase.GENERAL || useCase === AIUseCase.CHAT) {
      return 0.7;
    }
    
    // Baixa confiança se estamos usando provider não recomendado
    return 0.5;
  }

  /**
   * Gera razão para a decisão de roteamento
   */
  private getRoutingReason(useCase: AIUseCase, provider: AIProvider): string {
    const reasons: Record<AIProvider, Record<string, string>> = {
      [AIProvider.GROQ]: {
        [AIUseCase.REALTIME_SUGGESTIONS]: 'Baixa latência para sugestões em tempo real',
        [AIUseCase.AUTOCOMPLETE]: 'Resposta instantânea para autocomplete',
        [AIUseCase.QUICK_SEARCH]: 'Busca rápida com processamento eficiente',
        [AIUseCase.SYMPTOM_ANALYSIS]: 'Análise rápida de sintomas simples',
        [AIUseCase.CLASSIFICATION]: 'Classificação rápida e eficiente',
        [AIUseCase.VALIDATION]: 'Validação instantânea',
        [AIUseCase.BODY_MAP_ANNOTATION]: 'Anotações rápidas no body map',
        [AIUseCase.GENERAL]: 'Uso geral com boa performance',
        [AIUseCase.CHAT]: 'Chat interativo com baixa latência',
      },
      [AIProvider.GEMINI]: {
        [AIUseCase.PATIENT_ANALYSIS]: 'Análise profunda com contexto extenso',
        [AIUseCase.REPORT_GENERATION]: 'Geração de relatórios complexos',
        [AIUseCase.IMAGE_ANALYSIS]: 'Capacidade multimodal para imagens',
        [AIUseCase.TREATMENT_PROTOCOL]: 'Protocolos detalhados baseados em evidências',
        [AIUseCase.SOAP_NOTE]: 'Notas clínicas estruturadas e completas',
        [AIUseCase.LONG_CONTEXT]: 'Suporte a contexto muito longo (1M tokens)',
        [AIUseCase.GENERAL]: 'Uso geral com alta qualidade',
        [AIUseCase.CHAT]: 'Chat com respostas elaboradas',
      },
      [AIProvider.AUTO]: {},
    };

    return reasons[provider]?.[useCase] || `Provider padrão para ${useCase}`;
  }

  /**
   * Retorna estatísticas de roteamento
   */
  getRoutingStats() {
    const stats = {
      totalDecisions: this.routingDecisions.length,
      byProvider: {} as Record<AIProvider, number>,
      byUseCase: {} as Record<AIUseCase, number>,
      averageConfidence: 0,
    };

    // Contar por provider
    this.routingDecisions.forEach(decision => {
      stats.byProvider[decision.provider] = (stats.byProvider[decision.provider] || 0) + 1;
    });

    // Calcular confiança média
    if (this.routingDecisions.length > 0) {
      const totalConfidence = this.routingDecisions.reduce(
        (sum, d) => sum + d.confidence,
        0
      );
      stats.averageConfidence = totalConfidence / this.routingDecisions.length;
    }

    return stats;
  }

  /**
   * Reseta estatísticas de roteamento
   */
  resetStats(): void {
    this.routingDecisions = [];
  }

  /**
   * Atualiza configuração do serviço
   */
  updateConfig(config: {
    primaryProvider?: AIProvider;
    fallbackProvider?: AIProvider;
    enableFallback?: boolean;
  }): void {
    if (config.primaryProvider) {
      this.primaryProvider = config.primaryProvider;
      console.log(`✅ Provider primário atualizado: ${config.primaryProvider}`);
    }
    if (config.fallbackProvider) {
      this.fallbackProvider = config.fallbackProvider;
      console.log(`✅ Provider de fallback atualizado: ${config.fallbackProvider}`);
    }
    if (config.enableFallback !== undefined) {
      this.enableFallback = config.enableFallback;
      console.log(`✅ Fallback ${config.enableFallback ? 'habilitado' : 'desabilitado'}`);
    }
  }
}

// Instância singleton
let aiProviderServiceInstance: AIProviderService | null = null;

/**
 * Retorna instância singleton do AIProviderService
 */
export function getAIProviderService(): AIProviderService {
  if (!aiProviderServiceInstance) {
    aiProviderServiceInstance = new AIProviderService({
      primaryProvider: (process.env.AI_PRIMARY_PROVIDER as AIProvider) || AIProvider.GROQ,
      fallbackProvider: (process.env.AI_FALLBACK_PROVIDER as AIProvider) || AIProvider.GEMINI,
      enableFallback: process.env.AI_ENABLE_FALLBACK !== 'false',
    });
  }
  return aiProviderServiceInstance;
}

export default AIProviderService;


