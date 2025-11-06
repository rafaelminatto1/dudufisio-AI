# 🚀 Guia: Aplicar Migrações Manualmente no Supabase

**Status**: ✅ Projeto linkado | ⏳ Migrações pendentes
**Projeto**: `urfxniitfbbvsaskicfo.supabase.co`
**Data**: 2025-01-17

---

## ⚠️ Situação Atual

O Supabase CLI foi linkado com sucesso ao projeto remoto, mas encontramos problemas ao aplicar as migrações via CLI devido a:

1. **Docker com problemas de I/O**: O sistema de arquivos do Docker está apresentando erros
2. **Muitas migrações pendentes**: 45+ migrações locais não aplicadas
3. **Conflitos potenciais**: Algumas migrações antigas tentam modificar tabelas que podem não existir

**Solução**: Aplicar as 3 migrações principais manualmente via Supabase Dashboard.

---

## 📋 Migrações a Aplicar

### 1. **20250117000001_auth_setup.sql** - Sistema de Autenticação
- **Arquivo**: `supabase/migrations/20250117000001_auth_setup.sql`
- **Propósito**: Criar tabela `users` completa com autenticação, roles e permissões
- **Tabelas**: `users`
- **Tipos**: `user_role`, `user_status`
- **Funções**: `handle_new_user`, `update_last_login`, `soft_delete_user`, `has_permission`
- **RLS**: Policies completas para admin, therapist, patient

### 2. **20250117000002_core_tables.sql** - Tabelas Core
- **Arquivo**: `supabase/migrations/20250117000002_core_tables.sql`
- **Propósito**: Criar tabelas de pacientes, terapeutas e agendamentos
- **Tabelas**: `therapists`, `patients`, `appointments`
- **Funções**: `check_appointment_conflict`, `get_therapist_availability`
- **RLS**: Policies para cada role

### 3. **20250117000003_exercises_and_financials.sql** - Exercícios e Financeiro
- **Arquivo**: `supabase/migrations/20250117000003_exercises_and_financials.sql`
- **Propósito**: Criar sistema de exercícios e transações financeiras
- **Tabelas**: `exercises`, `exercise_protocols`, `patient_exercise_prescriptions`, `financial_transactions`, `expense_categories`
- **Funções**: `get_financial_summary`, `get_exercise_statistics`
- **Views**: `v_financial_monthly_summary`, `v_active_prescriptions`
- **RLS**: Policies completas

---

## 🎯 Passo a Passo: Aplicação Manual

### Passo 1: Acessar Supabase Dashboard

1. Abra https://supabase.com/dashboard
2. Faça login
3. Selecione o projeto **DuduFisio-AI** (`urfxniitfbbvsaskicfo`)

### Passo 2: Abrir SQL Editor

1. No menu lateral esquerdo, clique em **SQL Editor**
2. Clique em **+ New query** para criar uma nova query

### Passo 3: Aplicar Migração 001 (Auth Setup)

1. Abra o arquivo `supabase/migrations/20250117000001_auth_setup.sql`
2. **Copie TODO o conteúdo** do arquivo
3. Cole no SQL Editor do Supabase
4. Clique em **Run** ou pressione `Ctrl+Enter`
5. ✅ Aguarde a confirmação de sucesso

**⚠️ IMPORTANTE**: Se der erro de "extension already exists" ou "type already exists", **ignore** - isso é normal se a extensão ou tipo já existir.

**⚠️ DROP TABLE**: A migração faz `DROP TABLE IF EXISTS users CASCADE`. Isso vai **deletar a tabela users existente**. Se você já tem dados importantes na tabela `users`, faça um backup primeiro!

```sql
-- Para fazer backup da tabela users:
CREATE TABLE users_backup AS SELECT * FROM users;
```

### Passo 4: Aplicar Migração 002 (Core Tables)

1. Abra o arquivo `supabase/migrations/20250117000002_core_tables.sql`
2. **Copie TODO o conteúdo** do arquivo
3. Cole no SQL Editor (nova query)
4. Clique em **Run**
5. ✅ Aguarde a confirmação

**⚠️ DROP TABLE**: Esta migração faz `DROP TABLE IF EXISTS patients CASCADE` e `DROP TABLE IF EXISTS appointments CASCADE`. Faça backup se necessário!

```sql
-- Backup de patients e appointments:
CREATE TABLE patients_backup AS SELECT * FROM patients;
CREATE TABLE appointments_backup AS SELECT * FROM appointments;
```

### Passo 5: Aplicar Migração 003 (Exercises & Financial)

1. Abra o arquivo `supabase/migrations/20250117000003_exercises_and_financials.sql`
2. **Copie TODO o conteúdo** do arquivo
3. Cole no SQL Editor (nova query)
4. Clique em **Run**
5. ✅ Aguarde a confirmação

**✅ Esta migração é segura** - usa `CREATE TABLE IF NOT EXISTS` e não deleta nada.

---

## ✅ Verificação Pós-Migração

Após aplicar as 3 migrações, execute estas queries para verificar:

### 1. Verificar Tabelas Criadas

```sql
SELECT
  table_name,
  table_type
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN (
    'users',
    'therapists',
    'patients',
    'appointments',
    'exercises',
    'exercise_protocols',
    'patient_exercise_prescriptions',
    'financial_transactions',
    'expense_categories'
  )
ORDER BY table_name;
```

**Resultado Esperado**: 9 tabelas

### 2. Verificar Funções Criadas

```sql
SELECT
  routine_name,
  routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN (
    'handle_new_user',
    'update_last_login',
    'soft_delete_user',
    'has_permission',
    'check_appointment_conflict',
    'get_therapist_availability',
    'get_financial_summary',
    'get_exercise_statistics',
    'update_updated_at_column',
    'update_patient_activity'
  )
ORDER BY routine_name;
```

**Resultado Esperado**: 10 funções

### 3. Verificar RLS Habilitado

```sql
SELECT
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'users',
    'therapists',
    'patients',
    'appointments',
    'exercises',
    'exercise_protocols',
    'patient_exercise_prescriptions',
    'financial_transactions',
    'expense_categories'
  )
ORDER BY tablename;
```

**Resultado Esperado**: `rowsecurity = true` para todas as tabelas

### 4. Verificar Policies

```sql
SELECT
  tablename,
  policyname,
  roles
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

**Resultado Esperado**: 20+ policies

### 5. Verificar Indexes

```sql
SELECT
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN (
    'users',
    'therapists',
    'patients',
    'appointments',
    'exercises',
    'financial_transactions'
  )
ORDER BY tablename, indexname;
```

**Resultado Esperado**: 40+ indexes

---

## 🧪 Testes Rápidos

### Teste 1: Criar Usuário de Teste

```sql
-- Inserir usuário de teste
INSERT INTO users (email, full_name, role, status, is_active)
VALUES (
  'teste@dudufisio.com',
  'Usuário Teste',
  'patient',
  'active',
  TRUE
)
RETURNING *;
```

### Teste 2: Criar Paciente de Teste

```sql
-- Inserir paciente de teste
INSERT INTO patients (full_name, email, phone, cpf, birth_date, status)
VALUES (
  'João Silva',
  'joao@email.com',
  '11987654321',
  '123.456.789-00',
  '1990-01-01',
  'active'
)
RETURNING *;
```

### Teste 3: Consultar Categorias de Despesas

```sql
-- Verificar categorias pré-inseridas
SELECT * FROM expense_categories
ORDER BY name;
```

**Resultado Esperado**: 8 categorias (Aluguel, Equipamentos, Salários, etc.)

---

## 🔧 Troubleshooting

### Erro: "extension already exists"

```
NOTICE (42710): extension "uuid-ossp" already exists, skipping
```

✅ **Isso é NORMAL** - ignore e continue.

### Erro: "type already exists"

```
ERROR (42710): type "user_role" already exists
```

❌ **Solução**: Remova ou comente a linha `CREATE TYPE` da migração:

```sql
-- CREATE TYPE user_role AS ENUM (...);  -- Comentar esta linha
```

### Erro: "relation does not exist"

```
ERROR: relation "assessments" does not exist
```

❌ **Solução**: Esta migração depende de outra. Pule-a e aplique apenas as 3 migrações principais (001, 002, 003).

### Erro: "permission denied for schema"

```
ERROR: permission denied for schema public
```

❌ **Solução**: Você precisa estar usando um usuário com permissões de admin. No Supabase Dashboard, use a opção "Run as service role".

---

## 📊 Resultado Final

Após aplicar as 3 migrações, você terá:

| Recurso | Quantidade |
|---------|------------|
| **Tabelas** | 9 (users, therapists, patients, appointments, exercises, etc.) |
| **Funções SQL** | 10 (auth, business logic) |
| **Views** | 2 (financial_monthly_summary, active_prescriptions) |
| **Policies RLS** | 20+ (segurança por role) |
| **Indexes** | 40+ (performance) |
| **Triggers** | 8 (automação) |
| **Tipos Enum** | 2 (user_role, user_status) |

---

## 🎉 Próximos Passos

Depois de aplicar as migrações com sucesso:

1. ✅ Verificar que todas as tabelas foram criadas
2. ✅ Verificar RLS policies
3. ✅ Testar autenticação no frontend
4. ✅ Testar CRUD de pacientes
5. ✅ Testar CRUD de appointments
6. 🚀 Iniciar [Fase 2: Sistema de Notificações](PLANO_ACAO_MASTER.md)

---

## 📞 Precisa de Ajuda?

Se encontrar problemas:

1. Leia a seção **Troubleshooting** acima
2. Verifique os logs de erro no Supabase Dashboard
3. Consulte [FASE_1_SEMANA_2_COMPLETA.md](FASE_1_SEMANA_2_COMPLETA.md) para detalhes técnicos
4. Revise [PLANO_ACAO_MASTER.md](PLANO_ACAO_MASTER.md) para contexto geral

---

**Status Final**: ⏳ Aguardando aplicação manual das migrações
**Última Atualização**: 2025-01-17
**Versão**: 1.0.0
