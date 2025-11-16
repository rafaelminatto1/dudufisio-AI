# 🚀 Guia Prático: Como Aplicar Migrations no DuduFisio-AI

## 📌 Quando Usar Este Guia

Use este guia quando precisar aplicar migrations que estão falhando via CLI do Supabase.

## ✅ Método Recomendado: SQL Editor do Dashboard

### Passo a Passo

#### 1. Acesse o SQL Editor
```
https://app.supabase.com/project/urfxniitfbbvsaskicfo/sql/new
```

#### 2. Identifique a Migration Necessária
Veja a lista completa em `MIGRATIONS_STATUS.md` ou:
```powershell
ls supabase/migrations/
```

#### 3. Abra o Arquivo da Migration
- Navegue até: `supabase/migrations/[nome-da-migration].sql`
- Copie todo o conteúdo (Ctrl+A, Ctrl+C)

#### 4. Cole no SQL Editor
- Cole no editor do Supabase (Ctrl+V)

#### 5. Revise o Código (IMPORTANTE!)

Procure e corrija se necessário:

**❌ Problemas Comuns:**

```sql
-- Referência a tabela inexistente
CREATE TABLE my_table (
  other_id UUID REFERENCES other_table(id)  -- ❌ other_table pode não existir
);

-- Índice em coluna inexistente  
CREATE INDEX idx_name ON table(column);  -- ❌ column pode não existir

-- Constraint em tabela existente
ALTER TABLE table ADD CONSTRAINT ...  -- ❌ constraint pode já existir
```

**✅ Soluções:**

```sql
-- 1. Remover FKs problemáticas temporariamente
other_id UUID  -- Sem REFERENCES

-- 2. Sempre usar IF NOT EXISTS
CREATE TABLE IF NOT EXISTS my_table (...);
CREATE INDEX IF NOT EXISTS idx_name ON table(column);

-- 3. Verificar existência antes de criar constraint
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'constraint_name') THEN
    ALTER TABLE table ADD CONSTRAINT constraint_name ...;
  END IF;
END $$;
```

#### 6. Execute a Migration
- Clique em **"Run"** (ou pressione Ctrl+Enter)
- Aguarde a mensagem: **"Success. No rows returned"** ou **"Success. X rows returned"**

#### 7. Verifique se Funcionou

```sql
-- Ver tabelas criadas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE '%search_term%';

-- Ver colunas de uma tabela
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'your_table_name';

-- Ver índices criados
SELECT indexname 
FROM pg_indexes 
WHERE tablename = 'your_table_name';
```

#### 8. Documente
Adicione ao `MIGRATIONS_STATUS.md`:
```markdown
- ✅ `YYYYMMDD_nome_da_migration.sql` - Aplicada em DD/MM/YYYY
  - Descrição do que foi aplicado
  - Modificações necessárias (se houver)
```

## 🔧 Troubleshooting

### Erro: "relation already exists"
**Solução:** A tabela já existe. Você pode:
1. Pular essa parte da migration
2. Adicionar `CREATE TABLE IF NOT EXISTS`
3. Ou verificar se a tabela tem todas as colunas necessárias

### Erro: "column does not exist"
**Solução:** Adicionar a coluna antes de criar índice:
```sql
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='table' AND column_name='column') THEN
    ALTER TABLE table ADD COLUMN column TYPE;
  END IF;
END $$;
```

### Erro: "constraint already exists"
**Solução:** Verificar antes de adicionar:
```sql
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'name') THEN
    ALTER TABLE table ADD CONSTRAINT name ...;
  END IF;
END $$;
```

### Erro: "function does not exist"
**Solução:** Criar a função primeiro ou usar `CREATE OR REPLACE FUNCTION`.

### Erro: "operator class does not exist"
**Solução:** Habilitar a extensão necessária:
```sql
CREATE EXTENSION IF NOT EXISTS pg_trgm;  -- Para busca textual
CREATE EXTENSION IF NOT EXISTS postgis;  -- Para dados geográficos
```

## 📋 Checklist de Aplicação

Antes de executar qualquer migration:

- [ ] Li o código da migration completamente
- [ ] Identifiquei possíveis problemas (FKs, colunas inexistentes)
- [ ] Adicionei `IF NOT EXISTS` onde necessário
- [ ] Removi ou ajustei FKs para tabelas inexistentes
- [ ] Verifiquei se extensões necessárias estão habilitadas
- [ ] Testei em ambiente de desenvolvimento primeiro (se possível)
- [ ] Documentei as mudanças em `MIGRATIONS_STATUS.md`

## 🎯 Migrations Prioritárias

### Já Aplicadas ✅
1. **Sistema de Mapa Corporal** - `20251013_body_map_system.sql`
   - Status: ✅ Funcionando!

### Alta Prioridade (Aplicar se necessário)
1. **Base Tables** - `20241231000000_create_base_tables.sql`
2. **User Profiles** - `20241231000001_create_user_profiles.sql`
3. **Calendar Integration** - `20250102000000_create_calendar_integration_schema.sql`
4. **Medical Records** - `20250103000000_create_medical_records_schema.sql`

### Média Prioridade
1. **CRM Tables** - `20251008100001_create_crm_tables.sql` (Parcialmente corrigida)
2. **Exercises & Protocols** - `20250927000002_create_exercises_and_protocols_tables.sql`
3. **Analytics** - `20250927000001_create_analytics_and_financial_tables.sql`

### Baixa Prioridade (Funcionalidades Avançadas)
1. **Gamification** - `20251008100002_create_gamification_tables.sql`
2. **WhatsApp Automations** - `20251008_whatsapp_automations.sql`
3. **Wearables Integration** - `20251008_wearables_integration.sql`
4. **Predictive Analytics** - `20251008_predictive_analytics_system.sql`

## 💡 Dicas

1. **Sempre faça backup antes de aplicar migrations em produção**
2. **Teste uma migration por vez**
3. **Leia o código antes de executar** - entenda o que será criado
4. **Use transações quando possível** (BEGIN; ... COMMIT; ou ROLLBACK;)
5. **Documente tudo** - você vai agradecer depois!

## 🚨 Situações de Emergência

### Reverter uma Migration Aplicada

```sql
-- 1. Identificar tabelas criadas
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY created_at DESC LIMIT 10;

-- 2. Fazer backup dos dados (se houver)
CREATE TABLE backup_table AS SELECT * FROM original_table;

-- 3. Remover tabelas (CUIDADO!)
DROP TABLE IF EXISTS table_name CASCADE;

-- 4. Remover funções
DROP FUNCTION IF EXISTS function_name CASCADE;

-- 5. Remover views
DROP VIEW IF EXISTS view_name CASCADE;
```

## 📞 Contatos e Recursos

- **Dashboard Supabase:** https://app.supabase.com/project/urfxniitfbbvsaskicfo
- **Documentação PostgreSQL:** https://www.postgresql.org/docs/
- **Documentação Supabase:** https://supabase.com/docs
- **Status das Migrations:** Ver `MIGRATIONS_STATUS.md`

---

**Última atualização:** 2025-10-14
**Versão:** 1.0

