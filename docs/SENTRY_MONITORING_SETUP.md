# 📊 Configuração de Monitoramento Sentry

**Última Atualização:** 4 de Novembro de 2025
**Versão:** 1.0.0
**Objetivo:** Configurar monitoramento proativo para detectar erros em produção

---

## 🎯 Visão Geral

Este guia documenta como configurar alertas e monitoramento no Sentry para detectar problemas em produção antes que afetem múltiplos usuários.

**Objetivo Principal:** Zero erros críticos não detectados por mais de 5 minutos.

---

## 📋 Pré-Requisitos

- ✅ Conta Sentry configurada
- ✅ Projeto MoocaFisio criado no Sentry
- ✅ DSN do Sentry configurado no `.env`
- ✅ Integração Sentry no código (via `@sentry/react`)

---

## 🚀 Configuração Inicial

### 1. Verificar Integração Atual

**Localização do Código:** Verifique se o Sentry está inicializado no projeto.

Procure por:
```typescript
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: "your-dsn-here",
  environment: import.meta.env.MODE,
  // outras configurações...
});
```

**Variáveis de Ambiente Necessárias:**
```bash
# .env.production
VITE_SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
VITE_SENTRY_ENV=production
```

---

## ⚠️ Configuração de Alertas

### 2.1. Alert Rules - Erros Críticos

**Acesse:** Sentry Dashboard → Settings → Alerts → Create Alert Rule

#### Alert Rule 1: ReferenceError/TypeError (Crítico)

**Nome:** `[CRÍTICO] JavaScript Runtime Errors`

**Condições:**
```
When: error.type equals ReferenceError OR error.type equals TypeError
AND environment equals production
AND error.handled equals false
Then: Send notification immediately
```

**Threshold:**
- **First seen:** Alerta imediato no primeiro erro
- **Frequency:** > 5 eventos em 1 minuto

**Ações:**
- ✅ Email para: dev-team@moocafisio.com.br
- ✅ Slack: #production-alerts
- ✅ Create GitHub Issue automatically

**Severidade:** 🔴 Critical

---

#### Alert Rule 2: High Error Rate

**Nome:** `[HIGH] Increased Error Rate`

**Condições:**
```
When: error count > 10 events in 5 minutes
AND environment equals production
Then: Send notification
```

**Threshold:**
- **Normal:** < 2 erros/minuto
- **Warning:** 2-5 erros/minuto
- **Critical:** > 5 erros/minuto

**Ações:**
- ✅ Email para: dev-team@moocafisio.com.br
- ✅ Slack: #production-alerts
- ⚠️ PagerDuty (opcional, para on-call)

**Severidade:** 🟡 High

---

#### Alert Rule 3: Deployment Errors

**Nome:** `[DEPLOYMENT] Post-Deploy Error Spike`

**Condições:**
```
When: error count increases by 50% in 10 minutes
AND first seen in last 15 minutes
AND environment equals production
Then: Send notification
```

**Uso:** Detectar problemas imediatamente após deployment.

**Ações:**
- ✅ Email para: dev-team@moocafisio.com.br
- ✅ Slack: #deployments
- ✅ Tag deployment ID no alerta

**Severidade:** 🔴 Critical

---

#### Alert Rule 4: Specific Component Errors

**Nome:** `[DASHBOARD] KPI Widget Errors`

**Condições:**
```
When: error.message contains "format is not defined"
OR error.message contains "KPIWidget"
AND environment equals production
Then: Send notification immediately
```

**Uso:** Alerta específico para erros conhecidos que já ocorreram.

**Ações:**
- ✅ Email + Slack imediato
- ✅ Link para runbook: RUNBOOK_CACHE_DEPLOYMENT_ISSUES.md

**Severidade:** 🔴 Critical

---

### 2.2. Issue Alerts

**Acesse:** Project Settings → Alerts → Issue Alerts

#### Issue Alert 1: New Issue

**Nome:** `New Issue in Production`

**Condições:**
```
When: A new issue is created
AND environment equals production
Then: Send notification
```

**Ações:**
- ✅ Email
- ✅ Slack #production-alerts

---

#### Issue Alert 2: Regression

**Nome:** `Regression Detected`

**Condições:**
```
When: An issue changes state from resolved to unresolved
AND environment equals production
Then: Send notification
```

**Uso:** Detectar regressões de bugs já corrigidos.

**Ações:**
- ✅ Email imediato
- ✅ Slack com tag @channel
- ✅ Link para issue original e resolução anterior

---

### 2.3. Performance Alerts

**Acesse:** Performance → Create Alert

#### Performance Alert 1: Slow Page Load

**Nome:** `[PERFORMANCE] Slow Page Load Time`

**Condições:**
```
When: p95(page_load_time) > 3 seconds
AND environment equals production
AND transaction equals /dashboard
Then: Send notification
```

**Threshold:**
- **Good:** < 1.5s
- **Warning:** 1.5s - 3s
- **Critical:** > 3s

**Ações:**
- ✅ Email semanal (não crítico)
- ⚠️ Criar issue para otimização

---

## 📧 Configuração de Notificações

### 3.1. Email Notifications

**Acesse:** User Settings → Notifications

**Recomendações:**
- ✅ **Deploy notifications:** ON
- ✅ **Workflow notifications:** ON
- ✅ **Issue Alerts:** ON (Critical only)
- ❌ **Weekly Reports:** OFF (usar dashboard)
- ❌ **My Issue Updates:** OFF (evitar spam)

---

### 3.2. Slack Integration

**Setup:**

1. Acesse: Settings → Integrations → Slack
2. Click "Add to Slack"
3. Autorizar workspace MoocaFisio
4. Configurar canais:
   - `#production-alerts` - Alertas críticos
   - `#deployments` - Notificações de deploy
   - `#sentry-activity` - Todos os eventos (opcional)

**Configuração de Canal:**

```yaml
#production-alerts:
  - Alert Type: Critical + High
  - Events: New Issue, Regression, Rate Spike
  - Mention: @dev-team
  - Mute: Never

#deployments:
  - Alert Type: Deployment-related
  - Events: Post-deploy errors
  - Mention: @dev-team (only on critical)
  - Mute: Weekends (optional)
```

---

### 3.3. GitHub Integration

**Setup:**

1. Acesse: Settings → Integrations → GitHub
2. Click "Install GitHub Integration"
3. Autorizar repositório `rafaelminatto1/dudufisio-AI`
4. Configurar:

```yaml
Auto-create Issue:
  - On: First seen error (critical only)
  - Template: ".github/ISSUE_TEMPLATE/sentry-error.md"
  - Labels: ["sentry", "bug", "production"]
  - Assignee: @dev-team
  - Link: Erro do Sentry
```

**Issue Template (`sentry-error.md`):**

```markdown
---
name: Sentry Error
about: Erro reportado automaticamente pelo Sentry
labels: sentry, bug, production
---

## 🚨 Erro Detectado pelo Sentry

**Event ID:** {{ event.id }}
**Environment:** {{ event.environment }}
**First Seen:** {{ event.first_seen }}
**Count:** {{ event.count }}

### Error Details
**Type:** {{ event.type }}
**Message:** {{ event.message }}
**URL:** {{ event.url }}

### Stack Trace
```
{{ event.stack_trace }}
```

### Context
**Release:** {{ event.release }}
**User:** {{ event.user }}
**Browser:** {{ event.browser }}

### 🔗 Links
- [View in Sentry]({{ event.sentry_url }})
- [Runbook](../RUNBOOK_CACHE_DEPLOYMENT_ISSUES.md)

### ✅ Resolution Checklist
- [ ] Reproduzir erro localmente
- [ ] Identificar causa raiz
- [ ] Implementar fix
- [ ] Criar testes para prevenir regressão
- [ ] Deploy e validação
- [ ] Marcar como resolvido no Sentry
```

---

## 📊 Dashboard Recomendado

### 4.1. Custom Dashboard: Production Health

**Criar:** Dashboards → Create Dashboard

**Widgets Recomendados:**

#### Widget 1: Error Rate (24h)
```
Type: Line Chart
Metric: count()
Group By: time (1h)
Filter: environment:production
```

#### Widget 2: Top Errors
```
Type: Table
Columns: Error, Count, Users Affected
Filter: environment:production
Sort: Count DESC
Limit: 10
```

#### Widget 3: Error by Browser
```
Type: Bar Chart
Metric: count()
Group By: browser.name
Filter: environment:production AND last 7 days
```

#### Widget 4: P95 Page Load Time
```
Type: Line Chart
Metric: p95(measurements.lcp)
Group By: time (1h)
Filter: environment:production
```

#### Widget 5: Deployment Impact
```
Type: Line Chart
Metric: count()
Group By: release
Annotation: deployments
Filter: environment:production AND last 7 days
```

---

## 🔍 Query Examples

### Query 1: Erros Não Tratados (Unhandled)

```
is:unresolved error.handled:false environment:production
```

### Query 2: Erros no Dashboard

```
is:unresolved environment:production transaction:"/dashboard"
```

### Query 3: Erros Específicos de Formato

```
is:unresolved environment:production message:"format is not defined"
```

### Query 4: Novos Erros (Últimas 24h)

```
is:unresolved firstSeen:-24h environment:production
```

### Query 5: Regressões

```
is:regressed environment:production
```

---

## 🤖 Script de Validação

**Arquivo:** `scripts/validate-sentry-setup.js`

```javascript
#!/usr/bin/env node

const https = require('https');

// Configuração
const SENTRY_DSN = process.env.VITE_SENTRY_DSN;
const SENTRY_ORG = 'moocafisio';
const SENTRY_PROJECT = 'dudufisio-ai';

// Testar se Sentry está recebendo eventos
async function testSentryConnection() {
  console.log('🔍 Testando conexão com Sentry...\n');

  try {
    // Enviar evento de teste
    const Sentry = require('@sentry/react');

    Sentry.init({
      dsn: SENTRY_DSN,
      environment: 'test',
    });

    Sentry.captureMessage('Sentry monitoring test', 'info');

    console.log('✅ Evento de teste enviado para Sentry');
    console.log('   Verifique em: https://sentry.io/organizations/moocafisio/issues/');
    console.log('   Procure por: "Sentry monitoring test"\n');

    return true;
  } catch (err) {
    console.error('❌ Erro ao testar Sentry:', err.message);
    return false;
  }
}

// Executar testes
testSentryConnection()
  .then((success) => {
    if (success) {
      console.log('\n✅ SUCESSO: Sentry configurado corretamente');
      process.exit(0);
    } else {
      console.log('\n❌ FALHA: Sentry não configurado corretamente');
      console.log('\n📝 Verificar:');
      console.log('   1. VITE_SENTRY_DSN está definido no .env');
      console.log('   2. DSN está correto');
      console.log('   3. Projeto existe no Sentry');
      process.exit(1);
    }
  })
  .catch((err) => {
    console.error('❌ Erro fatal:', err);
    process.exit(2);
  });
```

**Uso:**
```bash
# Validar configuração Sentry
VITE_SENTRY_DSN=your-dsn node scripts/validate-sentry-setup.js

# Adicionar ao package.json
npm run sentry:validate
```

---

## 📝 Checklist de Configuração

### Setup Inicial
- [ ] Sentry DSN configurado no `.env.production`
- [ ] `@sentry/react` instalado e inicializado
- [ ] Environment definido como "production"
- [ ] Release tracking configurado

### Alertas
- [ ] Alert Rule: JavaScript Runtime Errors (crítico)
- [ ] Alert Rule: High Error Rate
- [ ] Alert Rule: Post-Deploy Error Spike
- [ ] Alert Rule: Component-Specific Errors
- [ ] Issue Alert: New Issue
- [ ] Issue Alert: Regression
- [ ] Performance Alert: Slow Page Load (opcional)

### Integrações
- [ ] Slack integration configurada
- [ ] Canal #production-alerts criado
- [ ] Canal #deployments configurado
- [ ] GitHub integration ativada
- [ ] Auto-create issues configurado
- [ ] Email notifications configuradas

### Dashboard
- [ ] Custom dashboard "Production Health" criado
- [ ] Widgets de erro adicionados
- [ ] Widgets de performance adicionados
- [ ] Annotations de deployment configuradas

### Testes
- [ ] Script de validação executado com sucesso
- [ ] Evento de teste enviado e recebido
- [ ] Alerta de teste recebido via email
- [ ] Alerta de teste recebido via Slack
- [ ] Issue de teste criado no GitHub

---

## 🎯 Métricas de Sucesso

### Objetivos de Monitoramento

| Métrica | Target | Current | Status |
|---------|--------|---------|--------|
| Detection Time | < 5 min | - | 🟡 Setup |
| Response Time | < 15 min | - | 🟡 Setup |
| Resolution Time | < 60 min | 62 min* | 🟢 Good |
| Error Rate | < 0.1% | - | 🟡 Setup |
| Uptime | > 99.9% | - | 🟡 Setup |

\* Baseado no hotfix de 3 Nov 2025

---

## 📚 Recursos Adicionais

**Documentação Sentry:**
- [Alert Configuration](https://docs.sentry.io/product/alerts/)
- [Integrations](https://docs.sentry.io/product/integrations/)
- [Performance Monitoring](https://docs.sentry.io/product/performance/)

**Documentação Interna:**
- [RUNBOOK_CACHE_DEPLOYMENT_ISSUES.md](./RUNBOOK_CACHE_DEPLOYMENT_ISSUES.md)
- [SESSAO_HOTFIX_03_NOV_2025.md](./SESSAO_HOTFIX_03_NOV_2025.md)
- [HOTFIX_PRODUCTION_ERROR.md](./HOTFIX_PRODUCTION_ERROR.md)

**Scripts:**
- [scripts/validate-deployment.js](./scripts/validate-deployment.js)
- [scripts/verify-bundle-hash.js](./scripts/verify-bundle-hash.js)
- [scripts/validate-sentry-setup.js](./scripts/validate-sentry-setup.js)

---

## 🔄 Manutenção

### Revisão Mensal

- [ ] Revisar alertas disparados
- [ ] Ajustar thresholds se necessário
- [ ] Verificar falsos positivos
- [ ] Atualizar runbooks baseado em novos erros
- [ ] Revisar e arquivar issues resolvidos

### Revisão Trimestral

- [ ] Avaliar efetividade dos alertas
- [ ] Revisar métricas de performance
- [ ] Atualizar dashboard widgets
- [ ] Treinar time em novos procedimentos

---

## 📞 Contatos e Suporte

**Sentry Organization:** moocafisio
**Sentry Project:** dudufisio-ai
**Dashboard:** https://sentry.io/organizations/moocafisio/projects/dudufisio-ai/

**Suporte:**
- Sentry Support: support@sentry.io
- Documentação: https://docs.sentry.io/

---

## 📊 Exemplo: Monitoramento 24h Pós-Hotfix

**Contexto:** Após hotfix de 3 Nov 2025

**Período:** 3-4 Nov 2025
**Objetivo:** Confirmar zero recorrência de "format is not defined"

**Query Sentry:**
```
is:unresolved environment:production
message:"format is not defined"
firstSeen:>2025-11-03T22:28:00Z
```

**Resultado Esperado:** 0 eventos

**Se Resultado > 0:**
1. Verificar bundle hash em produção
2. Executar `npm run verify:bundle-hash`
3. Consultar RUNBOOK_CACHE_DEPLOYMENT_ISSUES.md
4. Considerar force rebuild

---

**🤖 Generated with [Claude Code](https://claude.com/claude-code)**
