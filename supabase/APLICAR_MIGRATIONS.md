# 🚀 Como Aplicar as Migrations do Sistema de Evolução

## ⚡ Opção 1: Via Supabase Dashboard (Mais Fácil)

### Passo a Passo:

1. **Acesse o Supabase Dashboard:**
   - Vá em: https://app.supabase.com
   - Selecione seu projeto DuduFisio-AI

2. **Abra o SQL Editor:**
   - Menu lateral → **SQL Editor**
   - Clique em **"New query"**

3. **Aplique a Migration 1 - session_evolutions:**
   - Copie todo o conteúdo de: `20251022_session_evolutions.sql`
   - Cole no editor SQL
   - Clique **"Run"**
   - ✅ Deve mostrar: "Success. No rows returned"

4. **Aplique a Migration 2 - conduct_templates:**
   - Nova query
   - Copie todo o conteúdo de: `20251022_conduct_templates.sql`
   - Cole no editor
   - Clique **"Run"**
   - ✅ Deve mostrar: "Success. No rows returned"

5. **Aplique a Migration 3 - medical_insights:**
   - Nova query
   - Copie todo o conteúdo de: `20251022_medical_insights.sql`
   - Cole no editor
   - Clique **"Run"**
   - ✅ Deve mostrar: "Success. No rows returned"

---

## 🔧 Opção 2: Via SQL Editor Direto

### Copiar e Colar o SQL Completo:

**Migration 1 - session_evolutions:**
```
Arquivo: supabase/migrations/20251022_session_evolutions.sql
Copiar todo o conteúdo e executar
```

**Migration 2 - conduct_templates:**
```
Arquivo: supabase/migrations/20251022_conduct_templates.sql
Copiar todo o conteúdo e executar
```

**Migration 3 - medical_insights:**
```
Arquivo: supabase/migrations/20251022_medical_insights.sql
Copiar todo o conteúdo e executar
```

---

## ✅ Verificar se Aplicou Corretamente

Após aplicar as 3 migrations, execute este SQL no **SQL Editor**:

```sql
-- Verificar tabelas criadas
SELECT 
  table_name,
  table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN (
    'session_evolutions', 
    'conduct_templates', 
    'medical_insights'
  )
ORDER BY table_name;
```

**Resultado esperado:**
```
table_name            | table_type
----------------------|------------
conduct_templates     | BASE TABLE
medical_insights      | BASE TABLE
session_evolutions    | BASE TABLE
```

Se aparecer as 3 tabelas: ✅ **Migrations aplicadas com sucesso!**

---

## 🔍 Verificações Adicionais

### Verificar Colunas das Tabelas:

```sql
-- Ver estrutura de session_evolutions
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'session_evolutions';

-- Ver estrutura de conduct_templates
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'conduct_templates';

-- Ver estrutura de medical_insights
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'medical_insights';
```

### Verificar Índices:

```sql
-- Ver índices criados
SELECT 
  tablename, 
  indexname
FROM pg_indexes 
WHERE tablename IN (
  'session_evolutions', 
  'conduct_templates', 
  'medical_insights'
)
ORDER BY tablename, indexname;
```

### Verificar RLS (Row Level Security):

```sql
-- Ver políticas de segurança
SELECT 
  tablename, 
  policyname,
  cmd,
  qual
FROM pg_policies 
WHERE tablename IN (
  'session_evolutions', 
  'conduct_templates', 
  'medical_insights'
)
ORDER BY tablename, policyname;
```

---

## 🎯 Após Aplicar Migrations

### 1. Ativar Supabase no Sistema

Edite: `config/supabaseTablesConfig.ts`

```typescript
// Linha 16:
export const USE_SUPABASE = true; // ✅ Ativar

// Linha 19:
export const MOCK_FALLBACK = true; // ✅ Manter como fallback

// Linha 25:
export const FORCE_MOCK_MODE = false; // ✅ Desativar mock forçado
```

### 2. Verificar Indicador

- Acesse qualquer página do sistema
- Veja badge no canto inferior direito
- Deve mostrar: 🟢 **Supabase Conectado**

### 3. Testar Criação de Dados

```sql
-- Testar inserção em session_evolutions
INSERT INTO session_evolutions (
  session_id,
  patient_id,
  session_number,
  session_date,
  therapist_name,
  subjective,
  pain_level
) VALUES (
  (SELECT id FROM appointments LIMIT 1),
  (SELECT id FROM patients LIMIT 1),
  1,
  NOW(),
  'Teste',
  'Teste de inserção',
  5
);

-- Verificar se inseriu
SELECT COUNT(*) FROM session_evolutions;
```

Se retornar `1`: ✅ **Tabela funcionando!**

---

## 🗄️ Popular Dados de Exemplo (Opcional)

### Exemplos Realistas:

```sql
-- Exemplo: Evolução de sessão pós-op LCA
INSERT INTO session_evolutions (
  patient_id,
  session_number,
  session_date,
  therapist_name,
  subjective,
  objective,
  assessment,
  plan,
  tests_performed,
  pain_level
) VALUES (
  (SELECT id FROM patients WHERE name LIKE '%João%' LIMIT 1),
  1,
  NOW() - INTERVAL '7 days',
  'Dr. Roberto Silva',
  'Paciente relata dor leve no joelho direito, melhora progressiva',
  'ROM joelho: 85° flexão, sem edema, força quadríceps 4/5',
  'Evolução positiva, boa resposta ao tratamento proposto',
  'Mobilização patelar, fortalecimento quadríceps 3x15, propriocepção',
  '[
    {"id":"test_1","testName":"Amplitude joelho","testType":"amplitude","value":85,"unit":"graus","side":"right","assessedAt":"2025-10-15T10:00:00Z"},
    {"id":"test_2","testName":"Escala de dor (EVA)","testType":"pain","value":3,"unit":"pontos","assessedAt":"2025-10-15T10:00:00Z"}
  ]'::jsonb,
  3
);

-- Exemplo: Template de conduta
INSERT INTO conduct_templates (
  patient_id,
  name,
  description,
  plan,
  is_template,
  times_used
) VALUES (
  (SELECT id FROM patients LIMIT 1),
  'Protocolo Pós-op LCA - Fase 1',
  'Conduta padrão para primeiras 4 semanas pós-operatório',
  'Mobilização patelar, drenagem linfática, exercícios isométricos quadríceps, crioterapia 15min',
  true,
  0
);

-- Exemplo: Insight médico
INSERT INTO medical_insights (
  patient_id,
  type,
  title,
  description,
  data,
  severity,
  suggested_text
) VALUES (
  (SELECT id FROM patients LIMIT 1),
  'pain_reduction',
  'Redução Significativa da Dor',
  'Paciente apresentou redução de 6 pontos na escala de dor',
  '{"metric":"Dor (EVA)","initialValue":9,"currentValue":3,"improvement":6,"percentImprovement":66.7,"sessions":5}'::jsonb,
  'success',
  'O paciente apresentou evolução positiva quanto ao quadro álgico, com redução de 6 pontos na Escala Visual Analógica (EVA), passando de 9/10 na avaliação inicial para 3/10 na sessão mais recente.'
);
```

---

## ⚠️ Troubleshooting

### Erro: "relation already exists"
**Solução:** Tabela já foi criada antes. Pode ignorar ou fazer:
```sql
DROP TABLE IF EXISTS session_evolutions CASCADE;
-- E aplicar migration novamente
```

### Erro: "permission denied"
**Solução:** Verificar se você tem permissão de Admin no projeto Supabase

### Erro: "function uuid_generate_v4 does not exist"
**Solução:** Ativar extensão UUID:
```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

### Migrations não aparecem
**Solução:** Migrations manuais não aparecem na lista de migrations do Supabase. São aplicadas diretamente via SQL Editor.

---

## 📋 Checklist de Aplicação

- [ ] Acessar Supabase Dashboard
- [ ] Abrir SQL Editor
- [ ] Aplicar migration 1 (session_evolutions)
- [ ] Aplicar migration 2 (conduct_templates)
- [ ] Aplicar migration 3 (medical_insights)
- [ ] Verificar tabelas criadas
- [ ] Verificar índices criados
- [ ] Verificar RLS habilitado
- [ ] Testar inserção de dados
- [ ] Ativar `USE_SUPABASE = true` no código
- [ ] Verificar indicador 🟢 Supabase

---

## 🎯 Resultado Final

**Após aplicar as 3 migrations, você terá:**

✅ **3 tabelas novas:**
- `session_evolutions` (evoluções de sessão)
- `conduct_templates` (templates de conduta)
- `medical_insights` (insights médicos)

✅ **Índices para performance**
✅ **RLS (segurança) habilitado**
✅ **Triggers de updated_at**
✅ **Políticas de acesso configuradas**
✅ **View de resumo** (patient_insights_summary)

**Sistema estará pronto para usar dados reais do Supabase!** 🚀

---

*Última atualização: 22/10/2025*

