# ✅ Migrations CRM Prontas para Aplicar

## 🎯 Status

**TODAS as migrations foram corrigidas e estão prontas para aplicação!**

## 📝 Migrations Corrigidas

### 1️⃣ **20251009_create_leads_crm_integration.sql**
✅ Corrigido: `uuid_generate_v4()` → `gen_random_uuid()`

**Cria:**
- Tabela `leads` - Sistema de gestão de leads
- Tabela `lead_interactions` - Histórico de interações
- Tabela `sales_pipeline` - Pipeline de vendas
- Funções `calculate_lead_score()` - Score automático
- Funções `convert_lead_to_patient()` - Conversão de lead
- Índices e RLS Policies

### 2️⃣ **20251009_create_automation_system.sql**
✅ Sem alterações necessárias

**Cria:**
- Tabela `message_templates` - Templates de mensagens
- Tabela `automation_rules` - Regras de automação
- Tabela `automation_executions` - Log de execuções
- Tabela `scheduled_followups` - Follow-ups agendados
- Funções para processar automações
- RLS Policies

### 3️⃣ **20251009_seed_automation_defaults.sql**
✅ Corrigido: Removido `COMMIT` final

**Popula:**
- 7 templates de mensagens padrão
- 4 regras de automação pré-configuradas
- View `automation_statistics`

---

## 🚀 Como Aplicar

### Opção 1: Via CLI do Supabase (Recomendado)

```bash
supabase db push
```

**Problema atual:** Timeout de conexão com o banco Supabase. Possíveis soluções:
- Verificar conexão com internet
- Verificar credenciais no arquivo `.env` ou `supabase/.env`
- Tentar novamente em alguns minutos

---

### Opção 2: Via Dashboard do Supabase (Alternativa)

1. **Acesse:** https://supabase.com/dashboard/project/urfxniitfbbvsaskicfo/sql/new

2. **Aplique as migrations na ordem:**

   **Passo 1:** Execute o conteúdo de:
   ```
   supabase/migrations/20251009_create_leads_crm_integration.sql
   ```

   **Passo 2:** Execute o conteúdo de:
   ```
   supabase/migrations/20251009_create_automation_system.sql
   ```

   **Passo 3:** Execute o conteúdo de:
   ```
   supabase/migrations/20251009_seed_automation_defaults.sql
   ```

3. **Verificar sucesso:** Execute para confirmar:
   ```sql
   SELECT COUNT(*) FROM leads;
   SELECT COUNT(*) FROM message_templates;
   SELECT COUNT(*) FROM automation_rules;
   ```

---

## 📊 O Que Será Criado

### Tabelas
- ✅ `leads` - Gestão de prospects
- ✅ `lead_interactions` - Histórico completo
- ✅ `sales_pipeline` - Pipeline customizável
- ✅ `message_templates` - Templates de mensagens
- ✅ `automation_rules` - Regras de automação
- ✅ `automation_executions` - Log de execuções
- ✅ `scheduled_followups` - Follow-ups agendados

### Funções SQL
- ✅ `calculate_lead_score()` - Calcula score do lead
- ✅ `convert_lead_to_patient()` - Converte lead em paciente
- ✅ `process_automation_rules()` - Processa automações
- ✅ `apply_message_template()` - Aplica templates
- ✅ `schedule_followup()` - Agenda follow-up
- ✅ `get_pending_followups()` - Lista follow-ups pendentes

### Views
- ✅ `lead_conversion_metrics` - Métricas de conversão
- ✅ `automation_statistics` - Estatísticas de automações

### Índices (15 índices criados)
- Performance otimizada para queries frequentes

### RLS Policies
- Segurança configurada para todas as tabelas

---

## 🎨 Pipeline Padrão Criado

**Pipeline Fisioterapia:**
1. 🆕 Novo Lead
2. 📞 Contato Inicial
3. ✅ Qualificado
4. 📋 Proposta Enviada
5. 💬 Negociação
6. 🎉 Ganho
7. ❌ Perdido

---

## 📬 Templates de Mensagens Criados

1. **Boas-vindas - Novo Lead**
2. **Follow-up - 24h sem resposta**
3. **Follow-up - Lead Qualificado**
4. **Lembrete - Agendamento Pendente**
5. **Reengajamento - 7 dias inativo**
6. **Follow-up - Proposta Enviada**
7. **Feedback - Interesse**

---

## 🤖 Regras de Automação Criadas

1. **Follow-up 24h - Novo Lead** (Ativa - Prioridade 8)
   - Envia mensagem após 24h sem resposta

2. **Follow-up Lead Qualificado** (Ativa - Prioridade 7)
   - Envia proposta para leads qualificados há 3+ dias

3. **Reengajamento 7 dias** (Ativa - Prioridade 5)
   - Tenta reengajar leads inativos há 7+ dias

4. **Boas-vindas Automáticas** (Desabilitada - Prioridade 10)
   - Envia boas-vindas automáticas (requer webhook)

---

## 🔍 Verificação Pós-Aplicação

Execute estes comandos SQL para verificar se tudo foi criado corretamente:

```sql
-- Verificar tabelas
SELECT tablename FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('leads', 'lead_interactions', 'sales_pipeline', 'message_templates', 'automation_rules');

-- Verificar functions
SELECT proname FROM pg_proc 
WHERE proname IN ('calculate_lead_score', 'convert_lead_to_patient', 'process_automation_rules');

-- Verificar dados seed
SELECT COUNT(*) as total_templates FROM message_templates;
SELECT COUNT(*) as total_rules FROM automation_rules;
SELECT name FROM sales_pipeline WHERE is_default = true;
```

---

## ⚠️ Dependências

Estas migrations dependem de tabelas existentes:
- ✅ `patients` - Para conversão de leads
- ✅ `messages` - Para histórico de comunicação
- ✅ `communication_recipients` - Para sincronização
- ✅ `auth.users` - Para atribuição e permissões

**Nota:** Se alguma dessas tabelas não existir, adapte as migrations conforme necessário.

---

## 🎉 Próximos Passos

Após aplicar as migrations:

1. ✅ Verificar se todas as tabelas foram criadas
2. ✅ Testar funções SQL manualmente
3. ✅ Configurar chamadas das funções no frontend
4. ✅ Implementar webhook para boas-vindas automáticas
5. ✅ Criar job cron para processar automações

---

## 📞 Suporte

**Problemas de conexão?**
- Verifique o status do Supabase: https://status.supabase.com
- Verifique suas credenciais
- Use o Dashboard como alternativa

**Erros durante aplicação?**
- Leia a mensagem de erro completa
- Verifique se as dependências existem
- Execute as migrations uma a uma pelo Dashboard

