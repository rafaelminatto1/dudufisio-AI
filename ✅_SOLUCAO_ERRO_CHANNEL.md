# ✅ Solução para Erro "column channel does not exist"

## 🔍 Problema Identificado

A migration `20251009_create_automation_system.sql` estava tentando criar a tabela `message_templates` sem verificar se ela já existia com uma estrutura diferente.

## ✅ Correção Aplicada

Modifiquei a migration para:
1. Criar a tabela se não existir (apenas com colunas básicas)
2. Adicionar cada coluna de forma condicional (verifica se existe antes)
3. Usar valores DEFAULT temporários para colunas NOT NULL
4. Criar índices com `IF NOT EXISTS`

## 🚀 Como Aplicar Novamente

### Opção 1: Limpar e Aplicar Novamente (Recomendado se ainda não tem dados)

Se você acabou de criar as tabelas e **não tem dados importantes**, faça isso:

```sql
-- 1. Limpar tabelas criadas (se existirem)
DROP TABLE IF EXISTS message_templates CASCADE;
DROP TABLE IF EXISTS automation_rules CASCADE;
DROP TABLE IF EXISTS automation_executions CASCADE;
DROP TABLE IF EXISTS scheduled_followups CASCADE;

-- 2. Agora aplique novamente a migration corrigida
-- Copie e execute: supabase/migrations/20251009_create_automation_system.sql
```

### Opção 2: Aplicar Apenas as Correções (Se já tem dados)

Se você já tem dados na tabela `message_templates`, execute apenas este bloco SQL:

```sql
-- Adicionar colunas faltantes na tabela existente
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'message_templates' 
                   AND column_name = 'channel') THEN
        ALTER TABLE message_templates ADD COLUMN channel VARCHAR(50) NOT NULL DEFAULT 'whatsapp';
        -- Adicionar constraint depois
        ALTER TABLE message_templates ADD CONSTRAINT message_templates_channel_check 
            CHECK (channel IN ('whatsapp', 'email', 'sms'));
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'message_templates' 
                   AND column_name = 'subject') THEN
        ALTER TABLE message_templates ADD COLUMN subject VARCHAR(255);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'message_templates' 
                   AND column_name = 'content') THEN
        ALTER TABLE message_templates ADD COLUMN content TEXT NOT NULL DEFAULT '';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'message_templates' 
                   AND column_name = 'variables') THEN
        ALTER TABLE message_templates ADD COLUMN variables JSONB DEFAULT '[]'::jsonb;
    END IF;
END $$;

-- Criar índice
CREATE INDEX IF NOT EXISTS idx_message_templates_channel ON message_templates(channel);
```

## 📋 Sequência Completa de Aplicação

### **Passo 1: Limpar (APENAS SE NÃO TEM DADOS)**

```sql
DROP TABLE IF EXISTS scheduled_followups CASCADE;
DROP TABLE IF EXISTS automation_executions CASCADE;
DROP TABLE IF EXISTS automation_rules CASCADE;
DROP TABLE IF EXISTS message_templates CASCADE;
```

### **Passo 2: Aplicar a Migration Corrigida**

Copie **TODO** o conteúdo do arquivo corrigido:
```
supabase/migrations/20251009_create_automation_system.sql
```

E execute no SQL Editor do Supabase.

### **Passo 3: Verificar Sucesso**

```sql
-- Verificar colunas criadas
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'message_templates' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Deve mostrar TODAS estas colunas:
-- id, name, category, subject, content, variables, channel, is_active, created_at, updated_at

-- Verificar outras tabelas
SELECT tablename FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN (
  'message_templates',
  'automation_rules',
  'automation_executions',
  'scheduled_followups'
);
-- Deve retornar 4 tabelas
```

## 🎯 Próximo Passo

Depois de aplicar com sucesso a **Migration 2** (automation_system), continue com:

**Migration 3:** `supabase/migrations/20251009_seed_automation_defaults.sql`

Esta migration vai popular o sistema com:
- 7 templates de mensagens prontos
- 4 regras de automação pré-configuradas
- Views de analytics

## ⚠️ Importante

**A correção já foi aplicada no arquivo.** Você pode:

1. Usar a **Opção 1** se acabou de começar (limpar e reaplicar)
2. Usar a **Opção 2** se já tem dados importantes
3. Simplesmente copiar o arquivo corrigido e executar novamente

## 🔄 Resumo das Migrations CRM

### Status Atual:
- ✅ **Migration 1** (`20251009_create_leads_crm_integration.sql`) - Aplicar primeiro
- ⚠️ **Migration 2** (`20251009_create_automation_system.sql`) - **CORRIGIDA** - Aplicar agora
- ⏳ **Migration 3** (`20251009_seed_automation_defaults.sql`) - Aplicar por último

### Ordem Correta:
1. `20251009_create_leads_crm_integration.sql` ← Leads + Pipeline
2. `20251009_create_automation_system.sql` ← Automações (ARQUIVO CORRIGIDO)
3. `20251009_seed_automation_defaults.sql` ← Dados iniciais

---

**O arquivo já está corrigido! Copie o conteúdo atualizado e execute novamente no Dashboard.** 🚀

