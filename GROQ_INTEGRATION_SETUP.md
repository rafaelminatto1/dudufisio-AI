# 🚀 Como Instalar a Integração Groq no Vercel

## Passo 1: Acesse o Marketplace da Vercel

1. Acesse seu dashboard da Vercel: https://vercel.com/dashboard
2. Selecione o projeto **dudufisio-AI**
3. Na barra lateral, clique em **"Integrations"** ou acesse diretamente: https://vercel.com/marketplace

## Passo 2: Encontre e Instale Groq

1. Busque por **"Groq"** no marketplace
2. Ou acesse diretamente: https://vercel.com/marketplace/groq
3. Clique em **"Install"** ou **"Add Integration"**

## Passo 3: Configure a Integração

1. Selecione o projeto **dudufisio-AI** para instalar a integração
2. A Vercel irá:
   - Criar automaticamente uma conta Groq (ou vincular existente)
   - Gerar uma `GROQ_API_KEY`
   - Adicionar a key automaticamente nas variáveis de ambiente

3. Confirme a instalação

## Passo 4: Verifique as Variáveis de Ambiente

1. Acesse: **Settings** → **Environment Variables**
2. Verifique se `GROQ_API_KEY` foi criada
3. Se não foi criada automaticamente, você precisará:
   - Acessar https://console.groq.com
   - Criar uma API key
   - Adicionar manualmente em **Environment Variables**:
     ```
     Nome: GROQ_API_KEY
     Value: gsk_...
     ```

## Passo 5: Configure Variáveis Adicionais

Adicione as seguintes variáveis em **Environment Variables**:

```bash
# Configuração de AI Providers
AI_PRIMARY_PROVIDER=groq
AI_FALLBACK_PROVIDER=gemini
AI_ENABLE_FALLBACK=true

# Cache de Respostas
AI_CACHE_ENABLED=true
AI_CACHE_TTL_SECONDS=300
```

## Passo 6: Faça o Deploy

1. As mudanças nas variáveis de ambiente requerem um novo deploy
2. Você pode:
   - **Opção A**: Fazer um commit e push (deploy automático)
   - **Opção B**: Fazer "Redeploy" manual no dashboard da Vercel

## Passo 7: Verifique a Instalação

### Via Dashboard

1. Acesse seu app: `https://seu-projeto.vercel.app/system-health`
2. Verifique o status do Groq e Gemini no dashboard

### Via Código

```typescript
import { aiOrchestratorService } from '@/services/ai/aiOrchestratorService';

// Verificar providers
const groqOk = await aiOrchestratorService.isGroqConfigured();
const geminiOk = aiOrchestratorService.isGeminiConfigured();

console.log('Groq:', groqOk ? '✅' : '❌');
console.log('Gemini:', geminiOk ? '✅' : '❌');
```

### Via Console do Browser

```javascript
// Abra o console (F12)
const { aiOrchestratorService } = await import('./services/ai/aiOrchestratorService.js');
const metrics = aiOrchestratorService.getMetrics();
console.log(metrics);
```

## Passo 8: Teste a Integração

### Teste Rápido

```typescript
import { aiOrchestratorService } from '@/services/ai/aiOrchestratorService';
import { AIUseCase } from '@/services/ai/types';

// Teste com Groq (velocidade)
const response = await aiOrchestratorService.generateText({
  useCase: AIUseCase.REALTIME_SUGGESTIONS,
  prompt: 'Sugerir 3 exercícios para dor lombar',
  maxTokens: 200,
});

console.log('Provider usado:', response.provider); // Deve ser 'groq'
console.log('Latência:', response.latencyMs, 'ms'); // Deve ser ~300ms
console.log('Resposta:', response.text);
```

## 🎯 Planos do Groq

### Free Tier
- **Requisições**: Generoso (varia por modelo)
- **Modelos**: Todos os modelos disponíveis
- **Rate Limits**: ~30 req/min
- **Custo**: $0

### Paid Plans
Consulte os preços atuais em: https://console.groq.com/settings/billing

Preços estimados (podem variar):
- **Llama 3.3 70B**: ~$0.05-0.10 por 1M tokens
- **Llama 3.1 8B**: ~$0.02-0.05 por 1M tokens

## 🔍 Troubleshooting

### Groq não está disponível

**Problema**: `groqOk = false`

**Soluções**:
1. Verificar se `GROQ_API_KEY` está definida:
   ```bash
   # No terminal
   echo $GROQ_API_KEY
   ```

2. Verificar se a key é válida em: https://console.groq.com

3. Fazer redeploy após adicionar a key

### Erro "Rate Limit Exceeded"

**Problema**: Muitas requisições em curto período

**Soluções**:
1. O sistema usa fallback automático para Gemini
2. Aumentar plano no Groq se necessário
3. Verificar métricas para identificar uso excessivo

### Latência Alta

**Problema**: Groq está lento

**Soluções**:
1. Verificar se está realmente usando Groq:
   ```typescript
   console.log(response.provider); // Deve ser 'groq'
   ```

2. Verificar se não está usando fallback:
   ```typescript
   console.log(response.usedFallback); // Deve ser false
   ```

3. Verificar latência nas métricas:
   ```typescript
   const metrics = getAIMetricsCollector().getAggregatedMetrics();
   console.log('Latência Groq:', metrics.providers.groq?.averageLatencyMs);
   ```

### Fallback sempre ativo

**Problema**: Sempre cai para Gemini

**Possíveis causas**:
1. `GROQ_API_KEY` inválida ou expirada
2. Rate limit excedido
3. Groq temporariamente indisponível

**Como verificar**:
```typescript
const metrics = aiOrchestratorService.getMetrics();
console.log('Fallbacks:', metrics.fallbackUsed);
console.log('Taxa de fallback:', metrics.routing.totalDecisions);
```

## 📚 Recursos Adicionais

- **Groq Documentation**: https://console.groq.com/docs
- **Groq Playground**: https://console.groq.com/playground
- **Groq Pricing**: https://console.groq.com/settings/billing
- **Vercel Integration**: https://vercel.com/marketplace/groq

## ✅ Checklist de Instalação

- [ ] Groq instalado no Vercel Marketplace
- [ ] `GROQ_API_KEY` configurada em Environment Variables
- [ ] Variáveis `AI_PRIMARY_PROVIDER`, `AI_FALLBACK_PROVIDER`, `AI_ENABLE_FALLBACK` adicionadas
- [ ] Deploy realizado
- [ ] Groq status = ✅ em `/system-health`
- [ ] Teste de requisição funcionando
- [ ] Latência < 500ms em testes
- [ ] Fallback funcionando (testar removendo key temporariamente)

## 🎉 Pronto!

Sua integração Groq está funcionando! Agora você tem:

- ⚡ Respostas até 70% mais rápidas
- 💰 Custos 50-60% menores
- 🔄 Fallback automático para Gemini
- 📊 Métricas em tempo real

Consulte o [AI_PROVIDERS_GUIDE.md](./docs/AI_PROVIDERS_GUIDE.md) para exemplos de uso avançados.

