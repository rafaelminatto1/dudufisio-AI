# 🎯 Comandos MCP para CRM WhatsApp

## 📱 Gerenciamento de Leads

### **Consultas Rápidas**

```
"Mostre leads criados hoje"
"Quantos leads novos temos?"
"Liste leads com urgência alta"
"Mostre leads que precisam follow-up"
"Quais leads têm score acima de 70?"
```

### **Análise de Pipeline**

```
"Mostre distribuição de leads por status"
"Quantos leads em cada etapa do funil?"
"Qual o tempo médio em cada status?"
"Leads que estão parados há mais de 3 dias"
```

### **Análise de Conversão**

```
"Taxa de conversão dos últimos 30 dias"
"Qual fonte tem melhor conversão?"
"Tempo médio até conversão por fonte"
"Leads convertidos essa semana"
```

---

## 💬 WhatsApp e Mensagens

### **Estatísticas de Mensagens**

```
"Quantas mensagens foram enviadas hoje?"
"Taxa de entrega de mensagens WhatsApp"
"Mensagens não lidas por lead"
"Tempo médio de resposta"
```

### **Análise de Conversas**

```
"Conversas ativas nas últimas 24h"
"Leads que responderam hoje"
"Mensagens enviadas por hora (hoje)"
"Taxa de abertura de mensagens"
```

### **Performance WhatsApp**

```
"Custo por mensagem (se usando API paga)"
"Volume de mensagens por dia (última semana)"
"Horários com mais interação"
"Taxa de resposta por período"
```

---

## 📊 Automações e Templates

### **Templates de Mensagem**

```
"Liste todos os templates ativos"
"Qual template tem melhor conversão?"
"Templates mais usados esse mês"
"Crie template de boas-vindas otimizado"
```

### **Regras de Automação**

```
"Mostre regras de automação ativas"
"Quantas automações foram executadas hoje?"
"Taxa de sucesso das automações"
"Leads em campanhas ativas"
```

### **Follow-ups Automáticos**

```
"Quantos follow-ups agendados para hoje?"
"Follow-ups pendentes por lead"
"Taxa de resposta após follow-up"
"Otimize horário de follow-ups"
```

---

## 🔥 Leads Quentes (Hot Leads)

### **Identificação**

```
"Mostre top 10 hot leads"
"Leads com engagement 'hot' não contatados"
"Score médio dos hot leads"
"Leads quentes criados hoje"
```

### **Priorização**

```
"Ordene leads por prioridade de atendimento"
"Leads urgentes com alta probabilidade de conversão"
"Quais leads atender primeiro?"
"Leads quentes sem interação há 24h"
```

---

## 💰 Análise de ROI e Custos

### **Custos de Aquisição**

```
"Custo por lead por fonte"
"CAC (Custo de Aquisição de Cliente) por canal"
"ROI de cada fonte de lead"
"Investimento vs conversão por campanha"
```

### **Valor do Lead**

```
"Valor médio estimado por lead"
"Leads com maior valor potencial"
"Lifetime value estimado"
"Receita gerada por fonte"
```

---

## 🔍 Debugging e Otimização

### **Identificar Problemas**

```
"Por que a conversão caiu essa semana?"
"Leads perdidos: principais motivos"
"Gargalos no funil de conversão"
"Etapas com maior taxa de abandono"
```

### **Otimizações Sugeridas**

```
"Sugira otimizações para aumentar conversão"
"Qual o melhor horário para enviar mensagens?"
"Melhore a sequência de follow-up"
"Otimize templates baseado em performance"
```

### **Performance do Sistema**

```
"Queries lentas na tabela leads"
"Índices que devem ser criados"
"Otimize tabela de interações"
"Analise uso de storage"
```

---

## 📈 Relatórios Executivos

### **Dashboard Diário**

```
Claude, gere relatório diário com:
1. Novos leads (hoje)
2. Conversões (hoje)
3. Follow-ups realizados
4. Taxa de resposta WhatsApp
5. Hot leads para contatar
```

### **Relatório Semanal**

```
Claude, analise a semana:
1. Performance por fonte
2. Taxa de conversão geral
3. Tempo médio de conversão
4. Leads perdidos e motivos
5. Recomendações de melhoria
```

### **Relatório Mensal**

```
Claude, relatório executivo mensal:
1. Total de leads vs conversões
2. ROI por canal
3. Tendências de conversão
4. Previsão próximo mês
5. Ações recomendadas
```

---

## 🚀 Automações Inteligentes

### **Criar Automações**

```
"Crie trigger: notificar quando lead urgente chega"
"Automatize follow-up para leads sem resposta 24h"
"Configure remarketing para leads inativos"
"Crie sequência de nutrição automática"
```

### **Otimizar Automações**

```
"Analise performance das automações"
"Qual automação tem melhor resultado?"
"Otimize horários de envio automático"
"Melhore taxa de resposta das automações"
```

---

## 🎯 Casos de Uso Específicos

### **Caso 1: Lead Novo Chegou**
```
Claude, o que fazer com lead ID abc123?
1. Calcule score
2. Defina prioridade
3. Sugira primeira mensagem
4. Agende follow-up ideal
```

### **Caso 2: Lead Parado no Funil**
```
Claude, lead xyz789 está parado há 5 dias:
1. Analise histórico de interações
2. Identifique objeções
3. Sugira abordagem de reativação
4. Crie mensagem personalizada
```

### **Caso 3: Conversão Baixa**
```
Claude, conversão caiu 40% essa semana:
1. Compare com semana anterior
2. Identifique mudanças
3. Analise leads perdidos
4. Sugira correções imediatas
```

### **Caso 4: Escalar Operação**
```
Claude, preciso dobrar conversões:
1. Analise gargalos atuais
2. Sugira otimizações
3. Estime recursos necessários
4. Projete resultados
```

---

## 💡 Queries SQL Prontas

### **Dashboard Principal**
```sql
-- Dashboard completo
SELECT 
  COUNT(*) as total_leads,
  COUNT(*) FILTER (WHERE status = 'new') as novos,
  COUNT(*) FILTER (WHERE status = 'won') as convertidos,
  COUNT(*) FILTER (WHERE engagement_level = 'hot') as hot_leads,
  ROUND(COUNT(*) FILTER (WHERE status = 'won')::NUMERIC / NULLIF(COUNT(*), 0) * 100, 2) as conversion_rate
FROM leads
WHERE created_at >= CURRENT_DATE;
```

### **Hot Leads Prioritários**
```sql
-- Top leads para contatar agora
SELECT 
  id,
  name,
  phone,
  lead_score,
  urgency,
  source,
  created_at
FROM leads
WHERE engagement_level = 'hot'
  AND status NOT IN ('won', 'lost')
  AND deleted_at IS NULL
ORDER BY 
  urgency DESC,
  lead_score DESC,
  created_at ASC
LIMIT 10;
```

### **Performance por Fonte**
```sql
-- ROI por canal
SELECT 
  source,
  COUNT(*) as total_leads,
  COUNT(*) FILTER (WHERE status = 'won') as converted,
  ROUND(AVG(lead_score), 1) as avg_score,
  ROUND(COUNT(*) FILTER (WHERE status = 'won')::NUMERIC / NULLIF(COUNT(*), 0) * 100, 2) as conversion_rate
FROM leads
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
  AND deleted_at IS NULL
GROUP BY source
ORDER BY conversion_rate DESC;
```

---

## 🔔 Alertas e Monitoramento

### **Criar Alertas**

```
"Alerte-me quando lead com urgência alta chegar"
"Notifique se conversão cair abaixo de 15%"
"Avise quando hot lead não for respondido em 2h"
"Alerta se WhatsApp parar de enviar"
```

### **Monitoramento Contínuo**

```
"Monitore taxa de conversão em tempo real"
"Acompanhe volume de mensagens por hora"
"Rastreie leads por status continuamente"
"Alerte sobre anomalias no funil"
```

---

## 🎉 Comandos Rápidos do Dia a Dia

| Situação | Comando |
|----------|---------|
| Começar o dia | "Dashboard de hoje" |
| Priorizar trabalho | "Top 10 leads para contatar" |
| Meio do dia | "Performance até agora" |
| Problema | "Por que X não está funcionando?" |
| Fim do dia | "Resumo do dia" |
| Planejamento | "Previsão para amanhã" |
| Otimização | "Como melhorar conversão?" |
| Análise | "Tendências da semana" |

---

**🚀 Use esses comandos para extrair máximo valor do MCP Supabase!**

**Lembre-se:** O Claude entende contexto, então seja específico e conversacional!

**Status:** ✅ Pronto para uso  
**Atualizado:** 14 de outubro de 2025

