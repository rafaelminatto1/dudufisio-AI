# 🚀 EXECUTAR MIGRATIONS AGORA - Guia Simplificado

**Projeto:** urfxniitfbbvsaskicfo  
**Método:** Console do Supabase (Mais Fácil)  
**Tempo:** 10 minutos  

---

## ⚡ MÉTODO RÁPIDO (RECOMENDADO)

### 1️⃣ Abrir SQL Editor do Supabase

**URL direta:**
```
https://supabase.com/dashboard/project/urfxniitfbbvsaskicfo/sql/new
```

---

### 2️⃣ Executar Migration 1: Sistema de Risco

#### Copiar este SQL:

**Arquivo:** `supabase/migrations/20251008_risk_stratification_system.sql`

**Passos:**
1. Abrir o arquivo no seu editor
2. Selecionar TODO o conteúdo (Ctrl+A)
3. Copiar (Ctrl+C)
4. Colar no SQL Editor do Supabase
5. Clicar em **"Run"** (botão verde no canto inferior direito)
6. Aguardar mensagem de sucesso

**Resultado esperado:**
```
✅ Query executed successfully
✅ 9 tabelas criadas (risk_assessments, risk_factors, etc.)
✅ 4 enums criados
✅ 3 views criadas
✅ 2 functions criadas
✅ 2 triggers criados
```

---

### 3️⃣ Executar Migration 2: Reabilitação Esportiva

**Arquivo:** `supabase/migrations/20251008_sports_rehabilitation_system.sql`

**Passos:**
1. **Nova Query** no SQL Editor (clicar em "+ New Query")
2. Abrir o arquivo no seu editor
3. Selecionar TODO o conteúdo (Ctrl+A)
4. Copiar (Ctrl+C)
5. Colar no SQL Editor do Supabase
6. Clicar em **"Run"**
7. Aguardar mensagem de sucesso

**Resultado esperado:**
```
✅ Query executed successfully
✅ 20 tabelas criadas (athlete_profiles, injury_history, etc.)
✅ 5 enums criados
✅ 2 views criadas
✅ 1 function criada (calculate_acwr)
```

---

### 4️⃣ Verificar Sucesso

Executar esta query no SQL Editor:

```sql
-- Verificar TODAS as tabelas criadas
SELECT 
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public' 
  AND (
    table_name LIKE 'risk_%' 
    OR table_name LIKE '%athlete%'
    OR table_name LIKE '%sport%'
    OR table_name LIKE 'return_to%'
    OR table_name LIKE '%wellness%'
    OR table_name LIKE 'load_monitoring'
    OR table_name LIKE 'injury_history'
    OR table_name LIKE 'functional_tests'
    OR table_name LIKE 'strength_tests'
    OR table_name LIKE 'rom_%'
    OR table_name LIKE 'psychological_%'
    OR table_name LIKE 'performance_%'
    OR table_name LIKE '%_goals'
    OR table_name LIKE '%_phases'
    OR table_name LIKE '%_criteria'
    OR table_name LIKE '%_sessions'
  )
ORDER BY table_name;
```

**Deve retornar 29 linhas (29 tabelas)**

---

## ✅ VERIFICAÇÃO RÁPIDA

Execute cada query abaixo para confirmar:

### Tabelas de Risco (9 tabelas):
```sql
SELECT COUNT(*) as risk_tables
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name LIKE 'risk_%';
-- Resultado esperado: 9
```

### Tabelas de Reabilitação (20 tabelas):
```sql
SELECT COUNT(*) as sports_tables
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND (
    table_name LIKE '%athlete%'
    OR table_name LIKE '%sport%'
    OR table_name LIKE 'return_to%'
    OR table_name LIKE '%wellness%'
    OR table_name LIKE 'load_monitoring'
    OR table_name IN ('injury_history', 'functional_tests', 'strength_tests')
  );
-- Resultado esperado: 20
```

### Enums Criados (13):
```sql
SELECT typname 
FROM pg_type 
WHERE typtype = 'e' 
  AND (
    typname LIKE 'risk_%'
    OR typname LIKE 'sport_%'
    OR typname LIKE 'rehab_%'
    OR typname LIKE 'clearance_%'
    OR typname LIKE 'competition_%'
  )
ORDER BY typname;
-- Deve listar 13 enums
```

### Views (4):
```sql
SELECT viewname 
FROM pg_views 
WHERE schemaname = 'public'
  AND (
    viewname LIKE '%risk%'
    OR viewname LIKE '%athlete%'
  )
ORDER BY viewname;
-- Deve listar 4 views
```

---

## 🎉 SUCESSO!

Se todas as verificações passaram:

```
✅ Migrations aplicadas com sucesso!
✅ 29 tabelas criadas
✅ Sistema pronto para uso
✅ Próximo passo: Conectar o frontend
```

---

## 🔄 PRÓXIMO PASSO: Conectar Frontend

### 1. Criar/Atualizar `.env.local`:

```env
VITE_SUPABASE_URL=https://urfxniitfbbvsaskicfo.supabase.co
VITE_SUPABASE_ANON_KEY=sua_anon_key_aqui
```

**Para obter a ANON_KEY:**
```
https://supabase.com/dashboard/project/urfxniitfbbvsaskicfo/settings/api
```

### 2. Testar Sistema:

```bash
npm run dev
# Acessar: http://localhost:5173/risk-stratification/1
```

---

## 📞 ALTERNATIVA: Se preferir CLI

**Obter Access Token Correto:**

1. Acessar: https://supabase.com/dashboard/account/tokens
2. Criar novo token (formato: `sbp_...`)
3. Copiar o token
4. Usar no CLI:

```bash
$env:SUPABASE_ACCESS_TOKEN = "sbp_seu_token_aqui"
npx supabase link --project-ref urfxniitfbbvsaskicfo
npx supabase db push
```

---

**⚡ Use o método do Console (mais fácil e rápido)! ⚡**

**URL:** https://supabase.com/dashboard/project/urfxniitfbbvsaskicfo/sql/new

