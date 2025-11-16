# 🚀 Guia Rápido: Como Usar MCP Supabase

## ⚡ Começar Agora (30 segundos)

### 1. Teste se está funcionando

Pergunte ao Claude:
```
"Liste todas as tabelas do meu banco Supabase"
```

Se funcionar, você verá a lista de tabelas! ✅

---

## 📊 Comandos Úteis

### **Consultas Básicas**

```
"Mostre os últimos 10 leads criados"
"Quantos pacientes temos cadastrados?"
"Mostre leads com status 'novo'"
"Liste pacientes criados hoje"
```

### **Análises e Estatísticas**

```
"Qual a taxa de conversão de leads esse mês?"
"Mostre distribuição de leads por fonte"
"Quantas mensagens foram enviadas hoje?"
"Analise performance de conversão por canal"
```

### **Criação e Modificação**

```
"Crie uma tabela de logs de automação"
"Adicione índice na coluna phone da tabela leads"
"Crie uma view de leads ativos"
"Otimize a tabela messages"
```

### **Automações**

```
"Crie trigger para notificar leads urgentes"
"Configure RLS na tabela leads"
"Crie função para calcular score de lead"
"Automatize atualização de timestamps"
```

---

## 🎯 Casos de Uso Reais

### **Caso 1: Análise de CRM**
```
Claude, me mostre:
1. Total de leads por status
2. Taxa de conversão dos últimos 30 dias
3. Leads que precisam de follow-up hoje
```

### **Caso 2: Otimização**
```
Claude, analise a tabela 'leads' e sugira:
1. Índices para melhorar performance
2. Queries lentas que podem ser otimizadas
3. Campos que podem ser indexados
```

### **Caso 3: Debugging**
```
Claude, investigue por que:
1. A conversão de leads caiu essa semana
2. Algumas mensagens não estão sendo entregues
3. O score de leads está sempre em 0
```

### **Caso 4: Relatórios**
```
Claude, gere um relatório com:
1. Top 5 fontes de leads
2. Tempo médio de conversão
3. Leads perdidos e motivos
4. Performance do WhatsApp
```

---

## 💡 Dicas Pro

### **✅ Faça Isso**

1. **Seja Específico**
   ```
   ❌ "Mostre leads"
   ✅ "Mostre leads com urgência alta criados nos últimos 3 dias"
   ```

2. **Peça Contexto**
   ```
   ❌ "Crie índice"
   ✅ "Analise queries lentas e sugira índices apropriados"
   ```

3. **Use Análises**
   ```
   ❌ "Mostre dados"
   ✅ "Analise tendências de conversão e explique padrões"
   ```

### **❌ Evite Isso**

1. Não peça alterações destrutivas sem backup
2. Não execute queries em produção sem testar
3. Não remova índices sem analisar impacto

---

## 🔧 Troubleshooting

### **Problema: MCP não responde**

```bash
# Recarregue o Claude Code
Ctrl+Shift+P > "Developer: Reload Window"
```

### **Problema: Erro de conexão**

```bash
# Verifique se o Supabase está online
curl https://urfxniitfbbvsaskicfo.supabase.co/rest/v1/
```

### **Problema: Sem permissão**

```bash
# Verifique a Service Role Key no settings.local.json
```

---

## 📚 Recursos Úteis

### **Documentação Supabase**
- [Supabase Docs](https://supabase.com/docs)
- [SQL Reference](https://supabase.com/docs/guides/database/overview)
- [RLS Policies](https://supabase.com/docs/guides/auth/row-level-security)

### **Exemplos de Queries**

```sql
-- Top leads por score
SELECT name, lead_score, engagement_level
FROM leads
WHERE deleted_at IS NULL
ORDER BY lead_score DESC
LIMIT 10;

-- Conversão por fonte
SELECT 
  source,
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE status = 'won') as converted,
  ROUND(COUNT(*) FILTER (WHERE status = 'won')::NUMERIC / COUNT(*) * 100, 2) as conversion_rate
FROM leads
WHERE deleted_at IS NULL
GROUP BY source
ORDER BY conversion_rate DESC;

-- Leads que precisam follow-up
SELECT id, name, phone, next_followup_at
FROM leads
WHERE next_followup_at <= NOW()
  AND status NOT IN ('won', 'lost')
  AND deleted_at IS NULL
ORDER BY next_followup_at ASC;
```

---

## 🎉 Próximos Passos

Agora que o MCP está configurado:

1. ✅ **Explore o banco de dados**
   ```
   "Mostre estrutura completa do banco"
   ```

2. ✅ **Analise dados existentes**
   ```
   "Analise padrões de conversão"
   ```

3. ✅ **Otimize performance**
   ```
   "Sugira otimizações de índices"
   ```

4. ✅ **Crie automações**
   ```
   "Configure triggers para leads urgentes"
   ```

5. ✅ **Gere relatórios**
   ```
   "Crie dashboard de métricas CRM"
   ```

---

## 🆘 Ajuda Rápida

### **Como fazer X?**

| O que você quer | Comando |
|-----------------|---------|
| Ver tabelas | "Liste todas as tabelas" |
| Contar registros | "Quantos leads existem?" |
| Filtrar dados | "Mostre leads novos" |
| Criar tabela | "Crie tabela de logs" |
| Otimizar | "Analise e otimize tabela X" |
| Relatório | "Gere relatório de conversão" |
| Debugar | "Investigue problema em X" |

---

**🚀 Pronto! Agora você tem superpoderes de banco de dados via Claude!**

**Status:** ✅ MCP Ativo e Funcionando  
**Última atualização:** 14 de outubro de 2025

