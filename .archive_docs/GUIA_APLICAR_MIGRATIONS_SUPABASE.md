# 🗄️ GUIA: Aplicar Migrations no Supabase

**Projeto:** urfxniitfbbvsaskicfo  
**URL:** https://supabase.com/dashboard/project/urfxniitfbbvsaskicfo  
**Data:** 08/10/2025  

---

## 🎯 OPÇÃO 1: Via Console do Supabase (RECOMENDADO - 10 min)

### Passo a Passo:

#### 1. Acessar SQL Editor

```
https://supabase.com/dashboard/project/urfxniitfbbvsaskicfo/sql
```

#### 2. Executar Migration de Sistema de Risco

1. Abrir arquivo: `supabase/migrations/20251008_risk_stratification_system.sql`
2. Copiar TODO o conteúdo
3. Colar no SQL Editor do Supabase
4. Clicar em **"Run"**
5. Aguardar confirmação de sucesso

**Resultado esperado:**
```
✅ 9 tabelas criadas
✅ 4 enums criados
✅ 3 views criadas
✅ 2 functions criadas
✅ 2 triggers criados
```

#### 3. Executar Migration de Reabilitação Esportiva

1. Abrir arquivo: `supabase/migrations/20251008_sports_rehabilitation_system.sql`
2. Copiar TODO o conteúdo
3. Colar no SQL Editor do Supabase
4. Clicar em **"Run"**
5. Aguardar confirmação de sucesso

**Resultado esperado:**
```
✅ 20 tabelas criadas
✅ 5 enums criados
✅ 2 views criadas
✅ 1 function criada (calculate_acwr)
```

#### 4. Verificar Tabelas Criadas

Execute no SQL Editor:

```sql
-- Verificar tabelas de risco
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name LIKE 'risk_%'
ORDER BY table_name;

-- Verificar tabelas de reabilitação esportiva
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND (table_name LIKE '%athlete%' 
       OR table_name LIKE '%sport%'
       OR table_name LIKE 'return_to%')
ORDER BY table_name;

-- Verificar enums criados
SELECT typname 
FROM pg_type 
WHERE typtype = 'e' 
  AND typname LIKE '%risk%' 
   OR typname LIKE '%sport%'
   OR typname LIKE '%rehab%'
ORDER BY typname;
```

---

## 🎯 OPÇÃO 2: Via CLI do Supabase (15 min)

### Pré-requisitos:

1. **Obter Access Token:**
   - Acessar: https://supabase.com/dashboard/account/tokens
   - Criar novo token (se necessário)
   - Copiar o token

2. **Configurar Token:**

```bash
# Windows PowerShell
$env:SUPABASE_ACCESS_TOKEN = "seu_token_aqui"

# Verificar
echo $env:SUPABASE_ACCESS_TOKEN
```

### Executar Migrations:

```bash
# 1. Linkar projeto
npx supabase link --project-ref urfxniitfbbvsaskicfo

# 2. Verificar migrations pendentes
npx supabase db diff

# 3. Fazer push das migrations
npx supabase db push

# 4. Verificar status
npx supabase db status
```

---

## 🎯 OPÇÃO 3: Via Script SQL (Rápido - 5 min)

Se preferir executar tudo de uma vez, criei um script consolidado:

### No SQL Editor do Supabase:

```sql
-- ============================================
-- EXECUTAR MIGRATION 1: Sistema de Risco
-- ============================================
-- (Copiar conteúdo de 20251008_risk_stratification_system.sql)

-- ============================================
-- EXECUTAR MIGRATION 2: Reabilitação Esportiva
-- ============================================
-- (Copiar conteúdo de 20251008_sports_rehabilitation_system.sql)
```

---

## ✅ VERIFICAÇÃO PÓS-MIGRATION

### 1. Verificar Tabelas Criadas (29 total):

```sql
-- Contar tabelas
SELECT COUNT(*) as total_tables
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND (table_name LIKE 'risk_%' 
       OR table_name LIKE '%athlete%'
       OR table_name LIKE '%sport%'
       OR table_name LIKE 'return_to%'
       OR table_name LIKE '%wellness%'
       OR table_name LIKE 'load_monitoring');
-- Deve retornar: 29
```

### 2. Verificar Enums:

```sql
SELECT COUNT(*) as total_enums
FROM pg_type 
WHERE typtype = 'e' 
  AND (typname LIKE 'risk_%' 
       OR typname LIKE '%sport%'
       OR typname LIKE 'rehab_%'
       OR typname LIKE 'clearance_%'
       OR typname LIKE 'competition_%');
-- Deve retornar: 13
```

### 3. Verificar Views:

```sql
SELECT viewname 
FROM pg_views 
WHERE schemaname = 'public'
  AND (viewname LIKE '%risk%' 
       OR viewname LIKE '%athlete%')
ORDER BY viewname;
-- Deve retornar 4 views
```

### 4. Verificar Functions:

```sql
SELECT proname 
FROM pg_proc 
WHERE proname IN ('calculate_overall_risk_level', 'calculate_acwr', 'update_risk_profile', 'create_risk_alert');
-- Deve retornar 4 functions
```

### 5. Teste Básico - Inserir Dado:

```sql
-- Teste simples (ajustar IDs conforme necessário)
INSERT INTO risk_assessments (
  patient_id,
  patient_name,
  risk_type,
  risk_level,
  score,
  confidence,
  assessed_by,
  valid_until
) VALUES (
  (SELECT id FROM patients LIMIT 1),
  'Teste Migration',
  'fall',
  'moderate',
  45.5,
  0.82,
  'system',
  NOW() + INTERVAL '30 days'
);

-- Verificar se foi criado
SELECT * FROM risk_assessments ORDER BY created_at DESC LIMIT 1;

-- Deletar teste
DELETE FROM risk_assessments WHERE patient_name = 'Teste Migration';
```

---

## ⚠️ TROUBLESHOOTING

### Erro: "type already exists"

```sql
-- Dropar tipos existentes antes de executar migration
DROP TYPE IF EXISTS risk_type CASCADE;
DROP TYPE IF EXISTS risk_level CASCADE;
DROP TYPE IF EXISTS risk_factor_category CASCADE;
DROP TYPE IF EXISTS risk_recommendation_category CASCADE;
DROP TYPE IF EXISTS risk_priority CASCADE;

-- Depois executar a migration normalmente
```

### Erro: "table already exists"

```sql
-- Verificar se tabelas já existem
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name LIKE 'risk_%';

-- Se existirem, decidir:
-- Opção A: Dropar e recriar (CUIDADO: perde dados)
DROP TABLE IF EXISTS risk_assessments CASCADE;

-- Opção B: Pular tabelas que já existem
-- (A migration usa IF NOT EXISTS, então é seguro)
```

### Erro: "extension does not exist"

```sql
-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
```

### Erro de Permissão:

```sql
-- Verificar permissões do usuário
SELECT current_user;
SELECT * FROM pg_roles WHERE rolname = current_user;

-- Se necessário, executar como superuser via console
```

---

## 📊 RESULTADO ESPERADO

Após executar as 2 migrations com sucesso:

```
✅ 29 Tabelas Criadas
   - 9 para Sistema de Risco
   - 20 para Reabilitação Esportiva

✅ 13 Enums Criados
   - 5 para Sistema de Risco
   - 5 para Reabilitação Esportiva
   - 3 compartilhados

✅ 4 Views Criadas
   - latest_risk_assessments
   - high_risk_patients
   - active_risk_alerts
   - athletes_ready_for_progression
   - athletes_full_clearance

✅ 4 Functions Criadas
   - calculate_overall_risk_level
   - update_risk_profile
   - create_risk_alert
   - calculate_acwr

✅ 2 Triggers Criados
   - trigger_update_risk_profile
   - trigger_create_risk_alert

✅ Row Level Security Habilitado
   - Todas as tabelas com RLS
   - Policies básicas criadas
```

---

## 🚀 APÓS APLICAR AS MIGRATIONS

### 1. Atualizar Serviços para Usar Supabase Real

No arquivo `.env.local`, adicionar:

```env
VITE_SUPABASE_URL=https://urfxniitfbbvsaskicfo.supabase.co
VITE_SUPABASE_ANON_KEY=sua_anon_key_aqui
```

### 2. Atualizar Services para Buscar Dados Reais

Exemplo para `riskStratificationService.ts`:

```typescript
import { supabase } from '../../lib/supabase';

// Substituir mock data por:
const { data, error } = await supabase
  .from('risk_assessments')
  .select('*')
  .eq('patient_id', patientId);
```

### 3. Testar Integração

```bash
npm run dev
# Acessar: http://localhost:5173/risk-stratification/1
```

---

## 📞 SUPORTE

### Se tiver problemas:

1. **Verificar Console do Supabase:**
   - Logs em: https://supabase.com/dashboard/project/urfxniitfbbvsaskicfo/logs

2. **Verificar Network Tab:**
   - F12 > Network
   - Ver se há erros de API

3. **Consultar Documentação:**
   - Supabase Migrations: https://supabase.com/docs/guides/cli/local-development#database-migrations

---

## ✅ CHECKLIST

Após aplicar as migrations:

- [ ] 29 tabelas criadas
- [ ] Enums funcionando
- [ ] Views acessíveis
- [ ] Functions executam
- [ ] Triggers ativados
- [ ] RLS habilitado
- [ ] Teste de inserção OK
- [ ] Serviços conectados
- [ ] Sistema funcional

---

**URL do Projeto:** https://supabase.com/dashboard/project/urfxniitfbbvsaskicfo  
**Project Ref:** urfxniitfbbvsaskicfo  

**🚀 Pronto para aplicar as migrations!**

