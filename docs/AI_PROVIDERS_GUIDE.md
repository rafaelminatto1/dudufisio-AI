# Guia de AI Providers - DuduFisio-AI

## 📋 Visão Geral

O DuduFisio-AI utiliza uma **estratégia híbrida de IA** que combina dois providers:

- **Groq**: Inferência ultra-rápida para features de tempo real
- **Gemini**: Análise complexa e multimodal para tarefas avançadas

O sistema roteia automaticamente cada requisição para o provider mais adequado, com fallback automático para garantir confiabilidade.

## 🏗️ Arquitetura

```
┌─────────────────────────────────────────────────────────┐
│                   Application Layer                      │
│              (Componentes React)                        │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│              AI Orchestrator Service                     │
│  • Gerencia requisições                                 │
│  • Implementa cache                                     │
│  • Coleta métricas                                      │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│            AI Provider Service (Router)                  │
│  • Roteia por caso de uso                               │
│  • Seleciona modelo apropriado                          │
│  • Gerencia fallback                                    │
└──────────────┬────────────────────┬─────────────────────┘
               │                    │
               ▼                    ▼
        ┌──────────┐        ┌──────────┐
        │   Groq   │        │  Gemini  │
        │ Service  │        │ Service  │
        └──────────┘        └──────────┘
```

## 🚀 Quando Usar Cada Provider

### Use Groq Para:

✅ **Velocidade é Crítica:**
- Sugestões em tempo real durante consultas
- Autocomplete de diagnósticos
- Busca semântica rápida
- Validações instantâneas

✅ **Alto Volume de Requisições Simples:**
- Classificação de dados
- Análise de sintomas básicos
- Anotações no body map

✅ **Budget Limitado:**
- 50-70% mais barato que Gemini
- Ideal para features com muitas requisições

**Casos de Uso:**
```typescript
AIUseCase.REALTIME_SUGGESTIONS
AIUseCase.AUTOCOMPLETE
AIUseCase.QUICK_SEARCH
AIUseCase.SYMPTOM_ANALYSIS
AIUseCase.CLASSIFICATION
AIUseCase.VALIDATION
AIUseCase.BODY_MAP_ANNOTATION
```

### Use Gemini Para:

✅ **Contexto Longo:**
- Análise completa de histórico de paciente
- Múltiplas sessões de evolução
- Relatórios extensos

✅ **Multimodal:**
- Análise de imagens (body map, exames)
- OCR de documentos médicos
- Interpretação de gráficos

✅ **Qualidade Máxima:**
- Protocolos de tratamento baseados em evidências
- Notas SOAP completas
- Análise de riscos complexa

**Casos de Uso:**
```typescript
AIUseCase.PATIENT_ANALYSIS
AIUseCase.REPORT_GENERATION
AIUseCase.IMAGE_ANALYSIS
AIUseCase.TREATMENT_PROTOCOL
AIUseCase.SOAP_NOTE
AIUseCase.LONG_CONTEXT
```

## 💻 Como Usar

### Método 1: Roteamento Automático (Recomendado)

O sistema escolhe automaticamente o melhor provider:

```typescript
import { aiOrchestratorService } from '@/services/ai/aiOrchestratorService';
import { AIUseCase } from '@/services/ai/types';

// Sugestão rápida (usa Groq automaticamente)
const response = await aiOrchestratorService.generateText({
  useCase: AIUseCase.REALTIME_SUGGESTIONS,
  prompt: 'Sugerir 3 exercícios para dor lombar aguda',
  maxTokens: 200,
  temperature: 0.7,
});

console.log(response.text); // Sugestões
console.log(response.provider); // 'groq'
console.log(response.latencyMs); // ~300ms
```

### Método 2: Provider Específico

Força o uso de um provider específico:

```typescript
import { AIProvider } from '@/services/ai/types';

// Forçar Gemini para análise complexa
const response = await aiOrchestratorService.generateText({
  useCase: AIUseCase.PATIENT_ANALYSIS,
  provider: AIProvider.GEMINI, // Força Gemini
  prompt: `Analise o histórico completo do paciente...`,
  maxTokens: 2000,
});
```

### Método 3: Streaming (Tempo Real)

Para respostas progressivas:

```typescript
await aiOrchestratorService.streamText(
  {
    useCase: AIUseCase.REALTIME_SUGGESTIONS,
    prompt: 'Gerar protocolo de tratamento',
  },
  {
    onStart: () => console.log('Iniciando...'),
    onChunk: (chunk) => setPartialText(prev => prev + chunk),
    onComplete: (fullText) => console.log('Completo!'),
    onError: (error) => console.error(error),
  }
);
```

### Método 4: Chat Multi-Turn

Para conversas com contexto:

```typescript
import { ChatMessage } from '@/services/ai/types';

const messages: ChatMessage[] = [
  {
    role: 'system',
    content: 'Você é um assistente de fisioterapia especializado.',
  },
  {
    role: 'user',
    content: 'Paciente com dor lombar há 3 semanas',
  },
  {
    role: 'assistant',
    content: 'Entendo. Pode descrever a intensidade da dor?',
  },
  {
    role: 'user',
    content: '7/10, piora ao se levantar',
  },
];

const response = await aiOrchestratorService.chat(messages, {
  useCase: AIUseCase.CHAT,
  maxTokens: 500,
});
```

## 📊 Monitoramento

### Ver Métricas em Tempo Real

```typescript
import { getAIMetricsCollector } from '@/lib/monitoring/aiMetrics';

const collector = getAIMetricsCollector();

// Métricas agregadas da última hora
const metrics = collector.getAggregatedMetrics(3600000);

console.log(`Total de requisições: ${metrics.providers.groq?.totalRequests}`);
console.log(`Latência média Groq: ${metrics.providers.groq?.averageLatencyMs}ms`);
console.log(`Melhoria de latência: ${metrics.comparison.groqVsGemini.latencyImprovement}%`);
console.log(`Economia de custos: ${metrics.comparison.groqVsGemini.costSavings}%`);
```

### Gerar Relatório

```typescript
const report = collector.generateReport(3600000); // última hora
console.log(report);

/*
📊 Relatório de Métricas de IA (Últimas 1h)
==================================================

GROQ:
  • Requisições: 45
  • Taxa de Sucesso: 98.0%
  • Latência Média: 320ms
  • Tokens Usados: 12,450
  • Custo Estimado: $0.0012

GEMINI:
  • Requisições: 12
  • Taxa de Sucesso: 100.0%
  • Latência Média: 1850ms
  • Tokens Usados: 28,900
  • Custo Estimado: $0.0145

COMPARAÇÃO GROQ VS GEMINI:
  • Melhoria de Latência: +82.7%
  • Economia de Custo: +68.5%
...
*/
```

## 🔧 Configuração

### Variáveis de Ambiente (.env.local)

```bash
# API Keys
GROQ_API_KEY=gsk_... # Gerada automaticamente pela integração Vercel
VITE_GEMINI_API_KEY=AIza... # Sua key do Google AI Studio

# Configuração de Providers
AI_PRIMARY_PROVIDER=groq      # Provider primário
AI_FALLBACK_PROVIDER=gemini   # Provider de fallback
AI_ENABLE_FALLBACK=true       # Habilitar fallback automático

# Cache
AI_CACHE_ENABLED=true         # Habilitar cache
AI_CACHE_TTL_SECONDS=300      # TTL do cache (5 minutos)
```

### Ajustar Roteamento

```typescript
import { getAIProviderService } from '@/services/ai/aiProviderService';

const router = getAIProviderService();

// Mudar provider primário
router.updateConfig({
  primaryProvider: AIProvider.GEMINI,
  fallbackProvider: AIProvider.GROQ,
  enableFallback: true,
});
```

## 🚨 Tratamento de Erros

### Fallback Automático

O sistema tenta automaticamente o fallback quando:
- Rate limit é excedido
- Timeout na requisição
- Erro de rede
- Provider indisponível

```typescript
try {
  const response = await aiOrchestratorService.generateText({
    useCase: AIUseCase.REALTIME_SUGGESTIONS,
    prompt: 'Sugestão de exercícios',
  });
  
  if (response.usedFallback) {
    console.warn(`Fallback: ${response.originalProvider} → ${response.provider}`);
    console.warn(`Razão: ${response.fallbackReason}`);
  }
} catch (error) {
  // Ambos providers falharam
  console.error('Todos os providers falharam:', error);
}
```

### Erros Customizados

```typescript
import { AIError, AIErrorCode } from '@/services/ai/types';

try {
  const response = await aiOrchestratorService.generateText(request);
} catch (error) {
  if (error instanceof AIError) {
    switch (error.code) {
      case AIErrorCode.RATE_LIMIT:
        // Mostrar mensagem de rate limit
        break;
      case AIErrorCode.AUTHENTICATION:
        // Problema com API key
        break;
      case AIErrorCode.TIMEOUT:
        // Timeout - pode tentar novamente
        if (error.retryable) {
          // Retry logic
        }
        break;
    }
  }
}
```

## 📈 Melhores Práticas

### 1. Use o Caso de Uso Correto

```typescript
// ❌ Errado - usa Gemini desnecessariamente
const response = await aiOrchestratorService.generateText({
  useCase: AIUseCase.PATIENT_ANALYSIS, // Gemini
  prompt: 'Sugerir exercício rápido',  // Tarefa simples
  maxTokens: 100,
});

// ✅ Correto - usa Groq para velocidade
const response = await aiOrchestratorService.generateText({
  useCase: AIUseCase.REALTIME_SUGGESTIONS, // Groq
  prompt: 'Sugerir exercício rápido',
  maxTokens: 100,
});
```

### 2. Otimize Prompts

```typescript
// ❌ Prompt verboso
const prompt = `
Por favor, eu gostaria que você, como um especialista em fisioterapia,
pudesse analisar cuidadosamente e com atenção aos detalhes o seguinte
caso clínico que vou apresentar agora...
`;

// ✅ Prompt direto e eficiente
const prompt = `
Paciente: 45 anos, dor lombar há 3 semanas, EVA 7/10.
Análise clínica e recomendações de tratamento.
`;
```

### 3. Use Cache Quando Possível

Perguntas repetidas são servidas do cache:

```typescript
// Primeira vez: ~300ms, vai para Groq
const r1 = await aiOrchestratorService.generateText({
  useCase: AIUseCase.CLASSIFICATION,
  prompt: 'Classificar dor lombar como aguda ou crônica',
});

// Segunda vez (dentro de 5 min): ~5ms, vem do cache
const r2 = await aiOrchestratorService.generateText({
  useCase: AIUseCase.CLASSIFICATION,
  prompt: 'Classificar dor lombar como aguda ou crônica',
});
```

### 4. Monitore Custos

```typescript
const metrics = getAIMetricsCollector().getAggregatedMetrics();
const totalCost = 
  (metrics.providers.groq?.estimatedCostUSD || 0) +
  (metrics.providers.gemini?.estimatedCostUSD || 0);

if (totalCost > 10) { // $10 por hora
  console.warn('⚠️ Custo de IA alto!');
  // Implementar throttling ou alertas
}
```

## 🐛 Debugging

### Logs Detalhados

```typescript
// Habilitar logs detalhados
localStorage.setItem('logLevel', 'debug');

// Ver decisões de roteamento
const router = getAIProviderService();
const stats = router.getRoutingStats();
console.log(stats);
```

### Ver Histórico de Requisições

```typescript
const history = await aiOrchestratorService.getQueryHistory();
history.forEach(query => {
  console.log(`[${query.provider}] ${query.prompt} → ${query.response}`);
});
```

## 🔗 Links Úteis

- [Groq Documentation](https://console.groq.com/docs)
- [Gemini API Documentation](https://ai.google.dev/docs)
- [Vercel AI SDK](https://sdk.vercel.ai)
- [System Health Dashboard](http://localhost:5173/system-health)

## 📞 Suporte

Problemas ou dúvidas sobre os AI providers? Verifique:

1. **Métricas no Dashboard**: `/system-health`
2. **Logs no Console**: Pressione F12
3. **Status dos Providers**:
   ```typescript
   const isGroqOk = await aiOrchestratorService.isGroqConfigured();
   const isGeminiOk = aiOrchestratorService.isGeminiConfigured();
   ```

---

**Última atualização**: ${new Date().toLocaleDateString('pt-BR')}

