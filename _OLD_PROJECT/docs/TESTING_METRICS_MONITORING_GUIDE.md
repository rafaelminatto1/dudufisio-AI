
# 🧪 Guia Completo: Testes, Métricas, Monitoramento e Performance

> **Documentação Consolidada**
> 
> Versão: 1.0
> 
> Data: Novembro 2024

---

## 📋 Índice

1. [Testes](#-testes)
2. [Métricas](#-métricas)
3. [Monitoramento](#-monitoramento)
4. [Performance](#-performance)

---

# 🧪 TESTES

## Visão Geral

Infraestrutura completa de testes:
- ✅ **Vitest** - Testes unitários e integração
- ✅ **Playwright** - Testes E2E
- ✅ **Testing Library** - Testes de componentes React
- ✅ **73+ testes** unitários existentes
- ✅ **70+ testes** E2E existentes

---

## Testes Unitários (Vitest)

### Comandos

```bash
# Executar todos os testes
npm run test:unit

# Watch mode (re-executa ao salvar)
npm run test:unit:watch

# Interface gráfica
npm run test:unit:ui

# Com coverage
npm run test:unit:coverage
```

### Estrutura

```
tests/unit/
├── contexts/
│   └── SafeOfflineContext.test.tsx          ✅ 13 testes
├── components/
│   └── UnifiedOfflineIndicator.test.tsx     ✅ 10 testes
├── hooks/
│   └── useOnlineStatus.test.ts              ✅ 12 testes
├── lib/
│   └── serviceWorker.test.ts                ✅ 15 testes
└── services/
    └── (outros serviços...)                 ✅ 50+ testes
```

### Testes do Sistema Offline

#### SafeOfflineContext (13 cenários)
```typescript
// tests/unit/contexts/SafeOfflineContext.test.tsx

✅ Provider fornece valores padrão
✅ Detecta mudança para offline
✅ Detecta mudança para online e sincroniza
✅ Registra e remove listeners de eventos
✅ Trata erros sem quebrar
✅ Executa sync quando método é chamado
✅ Retenta itens falhos
✅ Limpa fila quando clearQueue é chamado
✅ useSafeOffline retorna padrões fora do provider
✅ useSafeOffline funciona dentro do provider
✅ useOfflineStrict lança erro fora do provider
✅ Calcula pendingCount corretamente
✅ Calcula failedCount corretamente
```

#### UnifiedOfflineIndicator (10 cenários)
```typescript
// tests/unit/components/UnifiedOfflineIndicator.test.tsx

✅ Não renderiza quando online e sem itens
✅ Renderiza indicador offline quando desconectado
✅ Mostra contador de itens pendentes
✅ Mostra indicador de sincronização
✅ Mostra indicador de falha
✅ Botão Sincronizar funciona
✅ Botão Retentar funciona
✅ Botão Dispensar oculta notificação
✅ Roles ARIA corretos
✅ Respeita diferentes posições
```

### Executar Testes

```bash
# Todos os testes unitários
npm run test:unit

# Com coverage (objetivo: >85%)
npm run test:unit:coverage

# Ver report HTML
open coverage/index.html
```

---

## Testes de Integração

### syncQueue (7 cenários)

```typescript
// tests/integration/offline/syncQueue.test.ts

✅ Enfileira ação offline
✅ Cria item com propriedades corretas
✅ Processa fila quando online
✅ Não processa quando offline
✅ Marca item como failed após max retries
✅ Faz retry com backoff exponencial
✅ Retenta item falho
✅ Limpa itens antigos
✅ Notifica listeners
```

### Executar

```bash
npm run test:integration
```

---

## Testes E2E (Playwright)

### Fluxo Offline Completo (5 cenários)

```typescript
// tests/e2e/offline-sync-flow.spec.ts

✅ Criar agendamento offline e sincronizar ao voltar online
✅ Mostrar contador de itens pendentes
✅ Mostrar item falho e permitir retentar
✅ Processar múltiplas ações em ordem
✅ Roles ARIA corretos
✅ Navegação por teclado
✅ Conexão instável (vai e volta)
✅ Permitir dispensar notificações
```

### Executar

```bash
# Todos os testes E2E
npm run test:e2e

# Com interface gráfica
npm run test:e2e:ui

# Modo headed (ver navegador)
npm run test:e2e:headed

# Apenas testes offline
npx playwright test tests/e2e/offline-sync-flow.spec.ts
```

---

# 📊 MÉTRICAS

## Sistema de Métricas

### Collector (syncMetrics.ts)

**Métricas Coletadas**:
- Total de syncs
- Syncs bem-sucedidos
- Syncs falhados
- Tempo médio de sync
- Itens por tipo de ação
- Taxa de sucesso

**Uso**:
```typescript
import { syncMetricsCollector } from '@/lib/metrics/syncMetrics';

// Registrar início
syncMetricsCollector.recordSyncStart(itemId, 'create-appointment');

// Registrar sucesso
syncMetricsCollector.recordSyncSuccess(itemId);

// Registrar falha
syncMetricsCollector.recordSyncFailure(itemId, error);

// Obter métricas
const metrics = syncMetricsCollector.getMetrics(queueSize);
console.log(`Taxa de sucesso: ${metrics.successRate}%`);
```

---

### Storage (metricsStorage.ts)

**Funcionalidades**:
- Salvar snapshots em IndexedDB
- Upload batch para Supabase
- Cleanup automático
- Agregação por período

**Uso**:
```typescript
import { metricsStorage } from '@/lib/metrics/metricsStorage';

// Salvar snapshot
await metricsStorage.saveSnapshot(metrics);

// Upload batch
await metricsStorage.uploadBatch();

// Iniciar upload automático (a cada 1h)
metricsStorage.startAutomaticUpload();

// Obter métricas agregadas
const aggregated = await metricsStorage.getAggregatedMetrics(
  startDate,
  endDate
);
```

---

### Dashboard

**Rota**: `/admin/sync-metrics` (a adicionar)

**Features**:
- Cards com métricas principais
- Taxa de sucesso com barra de progresso
- Distribuição por tipo de ação
- Botão de export JSON
- Auto-refresh a cada 30s

**Componente**:
```typescript
import SyncMetricsDashboard from '@/components/admin/SyncMetricsDashboard';

<SyncMetricsDashboard />
```

---

### Tabela Supabase

```sql
-- Tabela criada em:
-- supabase/migrations/20241101000000_create_sync_metrics.sql

SELECT * FROM sync_metrics
ORDER BY date DESC
LIMIT 30;
```

---

# 🔍 MONITORAMENTO

## Sentry Integration

### Erros de Sync

```typescript
import { captureSyncError } from '@/lib/monitoring/sentrySync';

// Capturar erro com contexto rico
captureSyncError(error, item, queueSize);
```

**Contexto Enviado**:
- Tags: `sync_action`, `queue_size`, `retry_count`
- Contexto: item details, queue status
- Fingerprint: para agrupar erros similares

---

### Performance Transactions

```typescript
import { startSyncTransaction } from '@/lib/monitoring/sentrySync';

const transaction = startSyncTransaction(itemId, 'create-appointment');

// ... processar sync ...

transaction?.finish();
```

---

### Breadcrumbs

```typescript
import { addOfflineBreadcrumb } from '@/lib/monitoring/sentrySync';

addOfflineBreadcrumb('user_created_appointment', {
  patientId: 'p-123',
  offline: true,
});
```

---

## Health Check

**Endpoint**: `/health` (Supabase Edge Function)

**Resposta**:
```json
{
  "status": "healthy",
  "timestamp": "2024-11-01T10:00:00Z",
  "checks": {
    "database": "up",
    "version": "1.0.0"
  }
}
```

**Deploy**:
```bash
supabase functions deploy health-check
```

---

## Alertas Sentry

### Configuração (Dashboard Sentry)

1. **Alta taxa de falha**
   - Condição: `sync_error > 10 em 1h`
   - Severidade: High
   - Notificação: Email + Slack

2. **Fila crescente**
   - Condição: `queue_size > 50 por 30min`
   - Severidade: Medium
   - Notificação: Email

3. **Erros críticos**
   - Condição: `useOffline errors`
   - Severidade: Critical
   - Notificação: Email + Slack + PagerDuty

---

## Uptime Monitoring (Checkly)

### Checks Configurados

**Arquivo**: `checkly/offline-indicator.spec.ts`

**Frequência**: A cada 5 minutos

**Validações**:
- ✅ Indicador offline funciona
- ✅ Service worker registra
- ✅ Sincronização após reconexão

---

# ⚡ PERFORMANCE

## Bundle Size Tracking

### Script Automático

```bash
# Executar após build
npm run build  # Já inclui tracking automático
```

**Funcionalidades**:
- Captura tamanho de todos os bundles
- Compara com build anterior
- Alerta se crescimento > 5%
- Salva histórico em `build-stats/bundle-history.json`

**Histórico**:
```json
{
  "builds": [
    {
      "date": "2024-11-01T10:00:00Z",
      "commit": "abc123",
      "bundles": {
        "vendor-react.js": "150KB",
        "index.js": "200KB"
      },
      "total": "430KB",
      "totalBytes": 440320
    }
  ]
}
```

---

## Web Vitals

### Métricas Trackeadas

- **FCP** (First Contentful Paint) - Objetivo: <1.8s
- **LCP** (Largest Contentful Paint) - Objetivo: <2.5s
- **TTI** (Time to Interactive) - Objetivo: <3.8s
- **CLS** (Cumulative Layout Shift) - Objetivo: <0.1
- **FID** (First Input Delay) - Objetivo: <100ms
- **INP** (Interaction to Next Paint) - Objetivo: <200ms

### Inicialização

```typescript
// Já integrado em index.tsx
import { initWebVitalsTracking } from '@/lib/analytics/webVitalsTracker';

initWebVitalsTracking();
```

### Visualização

- **Vercel Analytics**: Dashboard automático
- **Console**: Logs em produção
- **Sentry**: Performance transactions

---

## Performance Budget

### Arquivo: `.performance-budget.json`

```json
{
  "budgets": [
    {
      "name": "Total Bundle Size",
      "limit": "500KB",
      "limitBytes": 512000
    },
    {
      "name": "Time to Interactive",
      "limit": "3.8s",
      "limitMs": 3800
    }
  ]
}
```

### Validação

```bash
npm run check:performance
```

**Falha CI se budget excedido**

---

## Lighthouse CI

### Configuração: `.lighthouserc.json`

**Scores Mínimos**:
- Performance: 90
- Accessibility: 95
- Best Practices: 90
- SEO: 85

### Executar

```bash
# Local
npm run lighthouse

# CI (automático no GitHub Actions)
# Configurado em .github/workflows/ci.yml
```

---

# 📚 GUIA DE USO

## Para Desenvolvedores

### Escrever Testes para Novo Componente

```typescript
// tests/unit/components/MeuComponente.test.tsx

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import MeuComponente from '@/components/MeuComponente';

describe('MeuComponente', () => {
  it('deve renderizar corretamente', () => {
    render(<MeuComponente />);
    expect(screen.getByText('Texto esperado')).toBeInTheDocument();
  });
});
```

### Adicionar Métrica Customizada

```typescript
import { syncMetricsCollector } from '@/lib/metrics/syncMetrics';

// No início da operação
syncMetricsCollector.recordSyncStart(id, 'minha-acao');

try {
  // ... processar ...
  syncMetricsCollector.recordSyncSuccess(id);
} catch (error) {
  syncMetricsCollector.recordSyncFailure(id, error);
}
```

### Configurar Alerta

1. Acessar [Sentry Dashboard](https://sentry.io)
2. Alerts > Create Alert Rule
3. Configurar condições e notificações
4. Salvar

---

## Para QA

### Executar Suite Completa

```bash
# Todos os testes
npm run test:all

# Com coverage e E2E
npm run test:full
```

### Testar Offline Manualmente

1. Build e preview
   ```bash
   npm run build
   npm run start
   ```

2. Abrir DevTools (F12)
3. Network tab > Offline
4. Executar ações
5. Verificar indicadores
6. Voltar online
7. Verificar sincronização

---

## Para DevOps

### CI/CD Pipeline

**.github/workflows/ci.yml** (exemplo)
```yaml
- name: Run Tests
  run: npm run test:all

- name: Check Performance Budget
  run: npm run check:performance

- name: Lighthouse CI
  run: npx lhci autorun
```

### Deploy Checklist

- [ ] `npm run test:all` passou
- [ ] `npm run check:performance` passou
- [ ] Lighthouse scores > 90
- [ ] Sentry configurado
- [ ] Health check respondendo

---

# 📊 DASHBOARDS

## Métricas de Sync

**URL**: `/admin/sync-metrics`

**Informações**:
- Total de syncs
- Taxa de sucesso
- Tempo médio
- Distribuição por tipo
- Status da fila

## Vercel Analytics

**URL**: Vercel Dashboard > Analytics

**Métricas**:
- Web Vitals
- Pageviews
- Top pages
- User flow

## Sentry

**URL**: [sentry.io](https://sentry.io)

**Informações**:
- Errors e exceptions
- Performance transactions
- Session replays
- Alertas configurados

---

# 🎯 KPIs e Metas

## Testes

| Métrica | Meta | Atual |
|---------|------|-------|
| Cobertura Unitária | >85% | ~75% |
| Cobertura E2E | 100% fluxos críticos | ✅ |
| Testes Passando | 100% | ✅ |

## Métricas

| Métrica | Meta | Como Medir |
|---------|------|------------|
| Taxa Sucesso Sync | >95% | Dashboard métricas |
| Tempo Médio Sync | <2s | Dashboard métricas |
| Itens na Fila | <10 | UnifiedOfflineIndicator |

## Monitoramento

| Métrica | Meta | Ferramenta |
|---------|------|------------|
| Uptime | >99.9% | Checkly |
| MTTR | <30min | Sentry |
| Error Rate | <0.1% | Sentry |

## Performance

| Métrica | Meta | Ferramenta |
|---------|------|------------|
| Bundle Size | <500KB | track-bundle-size.ts |
| LCP | <2.5s | Lighthouse/Vercel |
| TTI | <3.8s | Lighthouse |
| CLS | <0.1 | Web Vitals |

---

# 🔧 Troubleshooting

## Testes Falhando

```bash
# Limpar cache
npm run test:unit -- --clearCache

# Re-instalar dependências
rm -rf node_modules
npm install

# Verificar setup
cat tests/setup.ts
```

## Métricas Não Coletando

```typescript
// Verificar no console
import { syncMetricsCollector } from '@/lib/metrics/syncMetrics';
console.log(syncMetricsCollector.getMetrics());
```

## Lighthouse Falhando

```bash
# Build otimizado
npm run build

# Preview
npm run start

# Executar Lighthouse manualmente
npx lighthouse http://localhost:4173 --view
```

---

# 📚 Recursos

## Documentação Externa

- [Vitest](https://vitest.dev/)
- [Playwright](https://playwright.dev/)
- [Testing Library](https://testing-library.com/)
- [Sentry](https://docs.sentry.io/)
- [Lighthouse](https://github.com/GoogleChrome/lighthouse)
- [Web Vitals](https://web.dev/vitals/)

## Documentação Interna

- [OFFLINE_ARCHITECTURE.md](./OFFLINE_ARCHITECTURE.md) - Arquitetura offline
- [RESUMO_CORRECOES.md](../RESUMO_CORRECOES.md) - Resumo de correções
- [REVISAO_DETALHADA.md](../REVISAO_DETALHADA.md) - Revisão de código

---

# ✅ Checklist Rápido

## Antes de Fazer PR

- [ ] Testes unitários criados
- [ ] Testes passando (`npm run test:unit`)
- [ ] Coverage adequado (>80%)
- [ ] Testes E2E para fluxos críticos
- [ ] Lighthouse score > 90
- [ ] Bundle size dentro do budget

## Antes de Deploy

- [ ] Todos os testes passando
- [ ] Performance budget OK
- [ ] Sentry configurado
- [ ] Health check deployado
- [ ] Alertas configurados
- [ ] Documentação atualizada

---

**Última Atualização**: Novembro 2024
**Mantenedor**: Equipe DuduFisio-AI

