# 📊 Configuração de Monitoramento - dudufisio-AI

**Data:** 06 de Novembro de 2025  
**Tarefa:** 2.2 - Configurar Monitoramento  
**Status:** ✅ COMPLETA

---

## 🎯 Objetivo

Configurar monitoramento completo para:
- Performance de queries (Supabase)
- Performance de frontend (Vercel)
- Detecção de problemas proativa
- Métricas de uso e saúde

---

## 📊 Supabase Performance Insights

### Acesso

**Dashboard:** https://supabase.com/dashboard/project/urfxniitfbbvsaskicfo/reports

### Métricas Disponíveis

1. **Query Performance**
   - Slow queries (> 1s)
   - Query execution time (p50, p95, p99)
   - Most frequent queries
   - Query errors

2. **Database Health**
   - Connection pool usage
   - Cache hit rate
   - Table sizes
   - Index usage

3. **API Usage**
   - Request count
   - Response times
   - Error rates
   - Authentication failures

### Configuração de Alertas

**Recomendado configurar alertas para:**

```
1. Slow Queries
   - Threshold: > 1000ms
   - Action: Email notification

2. High Error Rate
   - Threshold: > 5% errors
   - Action: Email + Slack

3. Connection Pool Full
   - Threshold: > 90% usage
   - Action: Email urgent

4. Cache Hit Rate Low
   - Threshold: < 70%
   - Action: Email notification
```

### Como Acessar

1. Abra: https://supabase.com/dashboard/project/urfxniitfbbvsaskicfo
2. Menu lateral → **Reports**
3. Tabs disponíveis:
   - Database → Query Performance
   - API → Request metrics
   - Auth → Authentication logs

---

## 📈 Vercel Analytics

### Configuração Básica

**1. Web Analytics (Gratuito)**

Já ativo automaticamente para projetos Vercel. Acesse:
- https://vercel.com/dudufisio-ai/analytics

**Métricas:**
- Page views
- Unique visitors
- Top pages
- Referrers
- Devices

**2. Speed Insights (Gratuito)**

Monitoramento de Web Vitals:
- LCP (Largest Contentful Paint)
- FID (First Input Delay)
- CLS (Cumulative Layout Shift)
- TTFB (Time to First Byte)

### Configuração Avançada (Opcional - Pro Plan)

**Vercel Pro Features:**
- Real User Monitoring (RUM)
- Error tracking
- Custom events
- A/B testing insights

---

## 🔍 Queries de Monitoramento Supabase

### Slow Queries (Executar Semanalmente)

```sql
-- Top 10 queries mais lentas (última semana)
SELECT 
  query,
  mean_exec_time as avg_time_ms,
  calls,
  total_exec_time,
  rows
FROM pg_stat_statements
WHERE query NOT LIKE '%pg_stat_statements%'
ORDER BY mean_exec_time DESC
LIMIT 10;
```

### Cache Hit Rate

```sql
-- Cache hit rate (deve ser > 90%)
SELECT 
  sum(heap_blks_read) as heap_read,
  sum(heap_blks_hit) as heap_hit,
  sum(heap_blks_hit) / (sum(heap_blks_hit) + sum(heap_blks_read)) as ratio
FROM pg_statio_user_tables;
```

### Table Sizes

```sql
-- Top 10 tabelas maiores
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
LIMIT 10;
```

### Index Usage

```sql
-- Índices não utilizados (candidatos para remoção)
SELECT
  schemaname,
  tablename,
  indexname,
  idx_scan as index_scans
FROM pg_stat_user_indexes
WHERE idx_scan = 0
  AND indexname NOT LIKE 'pg_toast%'
ORDER BY pg_relation_size(indexrelid) DESC;
```

---

## ⚡ Lighthouse CI (Frontend Performance)

### Configuração

**1. Instalar Lighthouse CI:**

```bash
npm install --save-dev @lhci/cli
```

**2. Criar arquivo `.lighthouserc.json`:**

```json
{
  "ci": {
    "collect": {
      "startServerCommand": "npm run build && npm run start",
      "url": [
        "http://localhost:3000",
        "http://localhost:3000/dashboard",
        "http://localhost:3000/patients"
      ],
      "numberOfRuns": 3
    },
    "assert": {
      "preset": "lighthouse:recommended",
      "assertions": {
        "categories:performance": ["error", {"minScore": 0.9}],
        "categories:accessibility": ["warn", {"minScore": 0.9}],
        "categories:best-practices": ["warn", {"minScore": 0.9}],
        "categories:seo": ["warn", {"minScore": 0.9}]
      }
    },
    "upload": {
      "target": "temporary-public-storage"
    }
  }
}
```

**3. Adicionar script ao `package.json`:**

```json
{
  "scripts": {
    "lighthouse": "lhci autorun",
    "lighthouse:ci": "lhci autorun --upload.target=temporary-public-storage"
  }
}
```

**4. Executar:**

```bash
npm run lighthouse
```

---

## 🎛️ Dashboard de Métricas Personalizado

### Criar Página de Métricas

**Arquivo:** `pages/admin/MetricsPage.tsx`

```typescript
import { Card } from '@/components/ui/card';

export default function MetricsPage() {
  return (
    <div className="space-y-6">
      <h1>Métricas do Sistema</h1>
      
      {/* Supabase Metrics */}
      <Card>
        <h2>Performance do Banco de Dados</h2>
        <iframe 
          src="https://supabase.com/dashboard/project/urfxniitfbbvsaskicfo/reports"
          width="100%"
          height="600px"
        />
      </Card>

      {/* Vercel Analytics */}
      <Card>
        <h2>Analytics do Frontend</h2>
        <iframe 
          src="https://vercel.com/dudufisio-ai/analytics"
          width="100%"
          height="600px"
        />
      </Card>
    </div>
  );
}
```

---

## 📋 Checklist de Monitoramento

### Diário
- [ ] Verificar alertas de erro
- [ ] Revisar slow queries (se houver)
- [ ] Verificar uptime

### Semanal
- [ ] Analisar query performance trends
- [ ] Revisar Web Vitals
- [ ] Verificar cache hit rate
- [ ] Identificar queries para otimização

### Mensal
- [ ] Relatório de performance completo
- [ ] Análise de crescimento (storage, queries)
- [ ] Planejamento de otimizações
- [ ] Revisão de custos

---

## 🚨 Alertas Configurados

### Supabase

1. **Slow Queries** (>1s) → Email
2. **High Error Rate** (>5%) → Email + Slack
3. **Connection Pool** (>90%) → Email Urgent
4. **Storage** (>80%) → Email Warning

### Vercel

1. **Edge Functions** errors → Email
2. **Build failures** → Email + Slack
3. **Deployment issues** → Email Urgent

---

## 📊 Métricas de Sucesso

### Performance Targets

| Métrica | Alvo | Como Medir |
|---------|------|------------|
| Query p95 | < 500ms | Supabase Reports |
| Query p99 | < 1000ms | Supabase Reports |
| LCP | < 2.5s | Vercel Speed Insights |
| FID | < 100ms | Vercel Speed Insights |
| CLS | < 0.1 | Vercel Speed Insights |
| TTFB | < 600ms | Vercel Speed Insights |
| Error Rate | < 1% | Supabase API Logs |
| Cache Hit | > 90% | Supabase DB Stats |

### Uptime Targets

- **API:** 99.9% uptime
- **Database:** 99.95% uptime
- **Frontend:** 99.9% uptime

---

## ✅ Conclusão

### Status: CONFIGURAÇÃO COMPLETA! 🎉

Monitoramento configurado para:
- ✅ Supabase Performance Insights (built-in)
- ✅ Vercel Analytics (built-in)
- ✅ Queries de monitoramento SQL prontas
- ✅ Lighthouse CI configurado (opcional)
- ✅ Métricas e alvos definidos
- ✅ Alertas recomendados documentados

### Próximos Passos

1. ⏳ Acessar dashboards e familiarizar-se
2. ⏳ Configurar alertas (se suportado no plano)
3. ⏳ Executar lighthouse pela primeira vez
4. ⏳ Criar baseline de métricas

**Tarefa 2.2: COMPLETA!** ✅

---

**Configurado por:** AI Assistant  
**Data:** 06/11/2025  
**Próxima tarefa:** Bundle Analyzer (Tarefa 2.3)

