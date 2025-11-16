# 📊 Configuração do Sentry para MCP Server

Este guia explica como configurar e usar o monitoramento Sentry no servidor MCP do DuduFisio-AI.

## 🎯 O que o Sentry Monitora

### 1. **Performance de Ferramentas (Tools)**
Cada chamada de ferramenta MCP é rastreada como uma transação:
```typescript
const transaction = Sentry.startTransaction({
  op: "mcp.tool",
  name: `MCP Tool: ${toolName}`,
});
```

**Métricas coletadas:**
- ⏱️ Tempo de execução de cada ferramenta
- 📊 Distribuição de latência (P50, P75, P95, P99)
- 🔢 Taxa de requisições por segundo (RPS)
- ❌ Taxa de erro por ferramenta

### 2. **Erros e Exceções**
Todos os erros são automaticamente capturados:
```typescript
Sentry.captureException(error, {
  tags: { tool: toolName },
  contexts: { tool: { name, arguments } }
});
```

**Informações capturadas:**
- Stack trace completo
- Contexto da ferramenta (nome, argumentos)
- Ambiente e versão
- User agent e cliente MCP

### 3. **Breadcrumbs (Rastro de Eventos)**
Cada ação importante deixa um "rastro de migalhas":
```typescript
Sentry.addBreadcrumb({
  category: "mcp.tool",
  message: `Tool ${name} executed successfully`,
  level: "info",
});
```

Útil para entender a sequência de eventos antes de um erro.

## 📈 Acessando o Dashboard

### URL do Dashboard MCP
```
https://sentry.io/orgredirect/organizations/:orgslug/insights/ai/mcp/
```

### Widgets Disponíveis

#### 1. **Traffic Widget**
- Requisições MCP ao longo do tempo
- Taxa de erro
- Releases (versões) deployadas

#### 2. **Traffic by Client**
Mostra quais clientes estão conectando:
- `cursor-vscode` - Cursor IDE
- `claude-desktop` - Claude Desktop
- `custom-client` - Clientes personalizados

#### 3. **Transport Distribution**
Distribuição de protocolos usados:
- `stdio` - Standard I/O (padrão)
- `http` - HTTP/SSE
- `custom` - Transporte personalizado

#### 4. **Most Used Tools**
Ferramentas mais chamadas pelos usuários.

**Exemplo de dados:**
| Tool | Requests | % Total |
|------|----------|---------|
| list_patients | 1,234 | 35% |
| search_patient | 892 | 25% |
| analyze_patient_progress | 567 | 16% |

#### 5. **Slowest Tools**
Ferramentas com maior tempo de resposta.

**Exemplo:**
| Tool | Avg Duration | P95 |
|------|-------------|-----|
| generate_patient_report | 2.3s | 4.1s |
| analyze_patient_progress | 1.8s | 3.2s |
| suggest_treatment_protocol | 1.5s | 2.8s |

#### 6. **Most Failing Tools**
Ferramentas com maior taxa de erro.

**Exemplo:**
| Tool | Error Rate | Total Errors |
|------|-----------|--------------|
| create_appointment | 5.2% | 23 |
| get_patient_details | 2.1% | 12 |

## 🔧 Configurações Avançadas

### 1. Ajustar Taxa de Amostragem

No `server.ts`, ajuste `tracesSampleRate`:

```typescript
Sentry.init({
  dsn: "...",
  tracesSampleRate: 0.1, // 10% das requisições (melhor para produção)
});
```

**Recomendações:**
- **Desenvolvimento**: `1.0` (100%) - Captura tudo
- **Staging**: `0.5` (50%) - Equilíbrio entre dados e custo
- **Produção**: `0.1` (10%) - Economiza recursos

### 2. Filtrar Dados Sensíveis

Use `beforeSend` para sanitizar dados:

```typescript
Sentry.init({
  dsn: "...",
  sendDefaultPii: false, // Desabilita captura de PII
  beforeSend(event, hint) {
    // Remover CPF dos breadcrumbs
    if (event.breadcrumbs) {
      event.breadcrumbs = event.breadcrumbs.map(crumb => {
        if (crumb.data?.cpf) {
          crumb.data.cpf = "***REDACTED***";
        }
        return crumb;
      });
    }
    return event;
  },
});
```

### 3. Tags Customizadas

Adicione tags para facilitar filtragem:

```typescript
Sentry.setTag("clinic_id", "clinic-123");
Sentry.setTag("environment", "production");
Sentry.setTag("region", "us-east-1");
```

### 4. Contexto do Usuário

Rastreie qual terapeuta está usando:

```typescript
Sentry.setUser({
  id: "therapist-456",
  username: "Dr. Roberto",
  email: "roberto@clinic.com",
});
```

## 📊 Métricas Importantes

### 1. **Error Rate Threshold**
Defina alertas quando taxa de erro > 5%:

```javascript
// No Sentry Dashboard > Alerts > Create Alert
if (error_rate > 5%) {
  send_alert_to("dev-team@email.com");
}
```

### 2. **Latency P95**
Alerte se 95% das requisições > 3s:

```javascript
if (p95_latency > 3000ms) {
  send_alert_to("performance-team@email.com");
}
```

### 3. **Availability**
Monitore se servidor está respondendo:

```javascript
if (uptime < 99.5%) {
  send_alert_to("ops-team@email.com");
}
```

## 🔍 Queries Úteis

### 1. Buscar Erros Específicos

```python
# No Sentry Search Bar
is:unresolved tool:list_patients
```

### 2. Performance de Ferramenta Específica

```python
transaction.op:mcp.tool transaction:"MCP Tool: analyze_patient_progress"
```

### 3. Erros por Período

```python
is:unresolved age:-24h
```

## 🎨 Visualizações Customizadas

### 1. Criar Widget de Taxa de Sucesso

```sql
SELECT count() WHERE transaction.op = 'mcp.tool' AND transaction.status = 'ok'
```

### 2. Latência Média por Ferramenta

```sql
SELECT avg(transaction.duration) BY transaction.name
WHERE transaction.op = 'mcp.tool'
```

### 3. Top Erros da Semana

```sql
SELECT count() BY error.type
WHERE timestamp > now() - 7d
GROUP BY error.type
ORDER BY count() DESC
```

## 🚨 Alertas Recomendados

### 1. **Alta Taxa de Erro**
```yaml
Condition: Error rate > 5% for 5 minutes
Severity: Critical
Action: Email + Slack
```

### 2. **Latência Elevada**
```yaml
Condition: P95 latency > 5s for 10 minutes
Severity: Warning
Action: Email
```

### 3. **Servidor Offline**
```yaml
Condition: No events for 5 minutes
Severity: Critical
Action: PagerDuty
```

## 📱 Integrações

### Slack
Receba alertas no Slack:
```
Sentry > Settings > Integrations > Slack
Configure webhook: https://hooks.slack.com/...
```

### Jira
Crie issues automaticamente:
```
Sentry > Settings > Integrations > Jira
Connect Jira project: DUDUFISIO
```

### GitHub
Link issues com PRs:
```
Sentry > Settings > Integrations > GitHub
Connect repository: dudufisio-ai/dudufisio-AI
```

## 🔒 Segurança e Privacidade

### ⚠️ IMPORTANTE: PII (Informações Pessoais)

O servidor está configurado com `sendDefaultPii: true`, o que significa que:
- ✅ **Vantagem**: Debug mais fácil com argumentos completos
- ❌ **Risco**: Pode enviar CPF, nomes, emails para Sentry

**Para Produção, considere:**

```typescript
Sentry.init({
  sendDefaultPii: false, // Desabilitar PII
  beforeSend(event, hint) {
    // Sanitizar campos sensíveis
    if (event.contexts?.tool?.arguments) {
      const args = event.contexts.tool.arguments;
      if (args.cpf) args.cpf = "***";
      if (args.email) args.email = "***";
    }
    return event;
  },
});
```

## 📚 Recursos Adicionais

- [Sentry MCP Documentation](https://docs.sentry.io/product/insights/ai/mcp/)
- [Sentry Node.js SDK](https://docs.sentry.io/platforms/node/)
- [MCP Specification](https://github.com/modelcontextprotocol/specification)

## 💡 Dicas

1. **Use Tags Estrategicamente**: Facilita filtragem e busca
2. **Configure Alertas Gradualmente**: Comece com alertas críticos
3. **Revise Semanalmente**: Analise tendências e padrões
4. **Documente Incidentes**: Use Sentry Issues para documentar resoluções

---

**Última atualização:** Janeiro 2025

**Dúvidas?** Consulte a [documentação oficial do Sentry](https://docs.sentry.io)

