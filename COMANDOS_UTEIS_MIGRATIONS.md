# 🛠️ Comandos Úteis para Gerenciar Migrations

## 📋 Supabase CLI

### Verificar Status das Migrations
```powershell
# Ver lista de migrations e seu status
npx supabase migration list

# Ver diff entre local e remoto
npx supabase db diff

# Ver status com mais detalhes
npx supabase migration list --debug
```

### Aplicar Migrations
```powershell
# Aplicar todas as migrations pendentes
npx supabase db push

# Aplicar incluindo migrations antigas (out of order)
npx supabase db push --include-all

# Aplicar com debug ativo
npx supabase db push --debug

# Aplicar uma migration específica via psql (alternativa)
psql $DB_URL -f supabase/migrations/nome_da_migration.sql
```

### Criar Nova Migration
```powershell
# Criar migration vazia
npx supabase migration new nome_da_migration

# Criar migration a partir de diff
npx supabase db diff -f nome_da_migration

# Criar migration de schema atual
npx supabase db dump -f nome_da_migration --schema public
```

### Reparar Histórico
```powershell
# Marcar migration como aplicada (sem executar)
npx supabase migration repair --status applied 20251013_migration

# Marcar como revertida (para reaplicar)
npx supabase migration repair --status reverted 20251013_migration

# Ver ajuda do repair
npx supabase migration repair --help
```

### Pull/Push do Banco
```powershell
# Baixar schema do banco remoto
npx supabase db pull

# Resetar banco local
npx supabase db reset

# Resetar e aplicar todas as migrations
npx supabase db reset --force
```

## 🗄️ Queries SQL Úteis

### Investigação de Schema

```sql
-- ============================================
-- TABELAS
-- ============================================

-- Listar todas as tabelas
SELECT 
  schemaname,
  tablename,
  tableowner
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- Ver detalhes de uma tabela específica
SELECT 
  column_name,
  data_type,
  character_maximum_length,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'sua_tabela'
ORDER BY ordinal_position;

-- Ver tamanho das tabelas
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;


-- ============================================
-- COLUNAS
-- ============================================

-- Encontrar tabelas com uma coluna específica
SELECT 
  table_name,
  column_name,
  data_type
FROM information_schema.columns
WHERE column_name = 'nome_da_coluna'
  AND table_schema = 'public';

-- Ver todas as colunas UUID (útil para FKs)
SELECT 
  table_name,
  column_name
FROM information_schema.columns
WHERE data_type = 'uuid'
  AND table_schema = 'public'
ORDER BY table_name, column_name;


-- ============================================
-- ÍNDICES
-- ============================================

-- Ver todos os índices
SELECT 
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- Ver índices de uma tabela específica
SELECT 
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'sua_tabela';

-- Ver índices não utilizados (performance)
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_scan as scans,
  pg_size_pretty(pg_relation_size(indexrelid)) as size
FROM pg_stat_user_indexes
WHERE idx_scan = 0
  AND schemaname = 'public'
ORDER BY pg_relation_size(indexrelid) DESC;


-- ============================================
-- CONSTRAINTS (Restrições)
-- ============================================

-- Ver todas as constraints
SELECT 
  tc.table_name,
  tc.constraint_name,
  tc.constraint_type,
  kcu.column_name
FROM information_schema.table_constraints tc
LEFT JOIN information_schema.key_column_usage kcu
  ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_schema = 'public'
ORDER BY tc.table_name, tc.constraint_type;

-- Ver apenas Foreign Keys
SELECT 
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public';

-- Ver Check Constraints
SELECT 
  tc.table_name,
  tc.constraint_name,
  cc.check_clause
FROM information_schema.table_constraints tc
JOIN information_schema.check_constraints cc
  ON tc.constraint_name = cc.constraint_name
WHERE tc.constraint_type = 'CHECK'
  AND tc.table_schema = 'public';


-- ============================================
-- FUNÇÕES
-- ============================================

-- Listar todas as funções
SELECT 
  n.nspname as schema,
  p.proname as name,
  pg_get_function_identity_arguments(p.oid) as arguments
FROM pg_proc p
LEFT JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
ORDER BY name;

-- Ver código de uma função
SELECT pg_get_functiondef(oid)
FROM pg_proc
WHERE proname = 'nome_da_funcao';


-- ============================================
-- VIEWS
-- ============================================

-- Listar todas as views
SELECT 
  schemaname,
  viewname,
  viewowner
FROM pg_views
WHERE schemaname = 'public'
ORDER BY viewname;

-- Ver definição de uma view
SELECT definition
FROM pg_views
WHERE viewname = 'nome_da_view';


-- ============================================
-- TRIGGERS
-- ============================================

-- Listar todos os triggers
SELECT 
  event_object_table AS table_name,
  trigger_name,
  event_manipulation AS event,
  action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;


-- ============================================
-- EXTENSÕES
-- ============================================

-- Ver extensões instaladas
SELECT * FROM pg_extension;

-- Habilitar extensões úteis
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS postgis;


-- ============================================
-- RLS (ROW LEVEL SECURITY)
-- ============================================

-- Ver tabelas com RLS habilitado
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND rowsecurity = true;

-- Ver políticas RLS
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;


-- ============================================
-- MIGRATIONS (Histórico Supabase)
-- ============================================

-- Ver histórico de migrations aplicadas
SELECT * FROM supabase_migrations.schema_migrations
ORDER BY version;

-- Ver última migration aplicada
SELECT * FROM supabase_migrations.schema_migrations
ORDER BY version DESC
LIMIT 1;
```

## 🔧 Utilitários PostgreSQL

### Backup e Restore

```powershell
# Fazer backup completo
pg_dump $DATABASE_URL > backup_$(Get-Date -Format "yyyy-MM-dd").sql

# Fazer backup apenas do schema (sem dados)
pg_dump $DATABASE_URL --schema-only > schema_backup.sql

# Fazer backup de uma tabela específica
pg_dump $DATABASE_URL --table=nome_tabela > tabela_backup.sql

# Restore completo
psql $DATABASE_URL < backup_file.sql

# Restore apenas de uma tabela
psql $DATABASE_URL -c "TRUNCATE TABLE nome_tabela;"
psql $DATABASE_URL < tabela_backup.sql
```

### Conexão Direta

```powershell
# Conectar ao banco via psql
psql "postgresql://postgres.urfxniitfbbvsaskicfo:SENHA@aws-1-sa-east-1.pooler.supabase.com:6543/postgres"

# Ou com variável de ambiente
$env:DATABASE_URL = "postgresql://..."
psql $env:DATABASE_URL

# Executar query inline
psql $DATABASE_URL -c "SELECT COUNT(*) FROM sua_tabela;"

# Executar arquivo SQL
psql $DATABASE_URL -f minha_query.sql
```

## 🐛 Debugging

### Verificar Problemas Comuns

```sql
-- Verificar se coluna existe antes de usar
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='sua_tabela' AND column_name='sua_coluna'
  ) THEN
    RAISE NOTICE 'Coluna existe!';
  ELSE
    RAISE NOTICE 'Coluna NÃO existe!';
  END IF;
END $$;

-- Verificar se tabela existe
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name='sua_tabela'
  ) THEN
    RAISE NOTICE 'Tabela existe!';
  ELSE
    RAISE NOTICE 'Tabela NÃO existe!';
  END IF;
END $$;

-- Verificar se constraint existe
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'nome_constraint'
  ) THEN
    RAISE NOTICE 'Constraint existe!';
  ELSE
    RAISE NOTICE 'Constraint NÃO existe!';
  END IF;
END $$;
```

### Logs e Erros

```sql
-- Ver logs de queries lentas (se habilitado)
SELECT * FROM pg_stat_statements
ORDER BY total_exec_time DESC
LIMIT 20;

-- Ver conexões ativas
SELECT 
  pid,
  usename,
  application_name,
  client_addr,
  state,
  query
FROM pg_stat_activity
WHERE state != 'idle';

-- Matar conexão travada
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE pid = 12345;
```

## 📊 Performance

```sql
-- Ver tabelas que precisam de VACUUM
SELECT 
  schemaname,
  tablename,
  n_dead_tup,
  n_live_tup,
  round(n_dead_tup::float / nullif(n_live_tup, 0) * 100, 2) as dead_ratio
FROM pg_stat_user_tables
WHERE n_dead_tup > 100
ORDER BY n_dead_tup DESC;

-- Executar VACUUM em uma tabela
VACUUM ANALYZE sua_tabela;

-- Ver estatísticas de uso de índices
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_scan,
  idx_tup_read,
  idx_tup_fetch
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;
```

## 🔐 Segurança

```sql
-- Ver usuários e roles
SELECT * FROM pg_roles;

-- Ver permissões de uma tabela
SELECT 
  grantee,
  privilege_type
FROM information_schema.role_table_grants
WHERE table_name = 'sua_tabela';

-- Conceder permissões
GRANT SELECT, INSERT, UPDATE ON sua_tabela TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;
```

---

**💡 Dica:** Salve os comandos que você usa com frequência em um arquivo `.sql` para reutilização rápida!

**Última atualização:** 2025-10-14

