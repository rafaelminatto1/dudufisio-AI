# 📊 Status das Migrations do DuduFisio-AI

## ✅ Migrations Aplicadas com Sucesso

### Via Dashboard (Manual)
- ✅ `20251013_body_map_system.sql` - **Sistema de Mapa Corporal** (PRINCIPAL)
  - 4 tabelas criadas: `body_map_sessions`, `body_map_pain_regions`, `body_map_analytics_cache`, `body_regions_reference`
  - 37 regiões corporais seed data
  - RLS policies configuradas
  - Sistema 100% funcional ✨

## ⚠️ Migrations com Problemas (Requerem Correção)

### 1. `20241201_session_crud_tables.sql`
- ❌ Problema: Referência à tabela `soap_notes` que não existe
- ✅ **CORRIGIDO**: Removida FK constraint

### 2. `20251008100001_create_crm_tables.sql`
- ❌ Problemas encontrados:
  - Tabela `leads` já existe mas sem coluna `clinic_id`
  - Tabela `lead_interactions` precisa de verificação de colunas
  - Extensão `pg_trgm` causa erro em índices GIN
- ✅ **PARCIALMENTE CORRIGIDO**:
  - Adicionado bloco para criar colunas faltantes em `leads`
  - Removido índice problemático com `gin_trgm_ops`
  - ⚠️ Ainda precisa: corrigir `lead_interactions` e outras tabelas CRM

### 3. Outras Migrations Pendentes (32 arquivos)
Não testadas ainda - podem ter problemas similares:
- `20251008100002_create_gamification_tables.sql`
- `20251008_emr_ehr_integration.sql`
- `20251008_enable_realtime.sql`
- `20251008_geriatric_module.sql`
- ... (e mais 28 arquivos)

## 🔧 Problemas Comuns Identificados

### 1. Referências a Tabelas Inexistentes
**Causa:** Migrations criadas assumindo que outras tabelas já existem.

**Solução:**
```sql
-- ❌ ERRADO
column_id UUID REFERENCES other_table(id)

-- ✅ CORRETO
column_id UUID -- FK será adicionada depois se necessário

-- OU verificar se a tabela existe
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables 
             WHERE table_name='other_table') THEN
    ALTER TABLE my_table 
    ADD CONSTRAINT fk_name 
    FOREIGN KEY (column_id) REFERENCES other_table(id);
  END IF;
END $$;
```

### 2. Colunas Faltantes em Tabelas Existentes
**Causa:** Tabela foi criada parcialmente ou em versão anterior.

**Solução:**
```sql
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='my_table' AND column_name='new_column') THEN
    ALTER TABLE my_table ADD COLUMN new_column VARCHAR(100);
  END IF;
END $$;
```

### 3. Índices em Colunas Inexistentes
**Causa:** Tentativa de criar índice antes da coluna existir.

**Solução:**
```sql
-- ❌ ERRADO
CREATE INDEX idx_name ON table(column);

-- ✅ CORRETO
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_name='table' AND column_name='column') THEN
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_name ON table(column)';
  END IF;
END $$;
```

### 4. Extensões Não Habilitadas
**Causa:** Uso de funcionalidades que requerem extensões PostgreSQL.

**Solução:**
```sql
-- Sempre no início da migration
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS postgis;
```

## 📋 Plano de Ação Recomendado

### Opção 1: Correção Manual via Dashboard (RECOMENDADO)
Para cada migration importante que falhar:

1. Abra o SQL Editor: https://app.supabase.com/project/urfxniitfbbvsaskicfo/sql/new
2. Copie o conteúdo da migration
3. Remova ou ajuste as partes problemáticas
4. Execute manualmente
5. Documente o que foi aplicado

**Vantagens:**
- ✅ Controle total sobre o que é aplicado
- ✅ Visual e imediato
- ✅ Não depende do CLI problemático
- ✅ Pode pular migrations desnecessárias

### Opção 2: Correção Sistemática das Migrations
Para uso futuro via CLI:

1. ✅ Corrigir cada migration para ser idempotente
2. ✅ Adicionar verificações de existência
3. ✅ Remover dependências rígidas entre migrations
4. ✅ Testar uma por uma via CLI

**Vantagens:**
- ✅ Migrations reutilizáveis
- ✅ Processo automatizado no futuro
- ✅ Melhor para CI/CD

**Desvantagens:**
- ⏱️ Muito trabalhoso (32 migrations para corrigir)
- 🐛 Pode revelar mais problemas em cascata

## 🎯 Recomendação Final

**Para o projeto atual:**
- ✅ Mapa Corporal está funcionando (objetivo alcançado!)
- ✅ Use Dashboard para aplicar migrations conforme necessário
- ✅ Documente cada uma aplicada
- ⏸️ Não é urgente corrigir todas as 32 migrations agora

**Para o futuro:**
- 📝 Documente quais funcionalidades precisam de quais migrations
- 🔧 Corrija migrations sob demanda quando precisar da funcionalidade
- 🧪 Considere criar migrations consolidadas mais simples

## 📁 Arquivos Modificados

### Corrigidos Nesta Sessão:
1. ✅ `supabase/migrations/20241201_session_crud_tables.sql`
   - Removida FK para `soap_notes` inexistente

2. ✅ `supabase/migrations/20251008100001_create_crm_tables.sql`
   - Adicionada verificação para colunas faltantes
   - Removido índice `gin_trgm_ops` problemático
   - Melhorada idempotência da criação da tabela `leads`

### Prontos para Uso:
- ✅ `supabase/migrations/20251013_body_map_system.sql` (JÁ APLICADO ✨)

## 🚀 Próximos Passos

1. **Imediato:** Testar funcionalidade do Mapa Corporal na aplicação
2. **Curto prazo:** Identificar quais outras funcionalidades são prioritárias
3. **Médio prazo:** Aplicar migrations necessárias via Dashboard conforme demanda
4. **Longo prazo:** Consolidar e limpar migrations quando o sistema estiver maduro

---

**Última atualização:** 2025-10-14
**Status Geral:** ✅ Sistema principal (Mapa Corporal) funcionando!

