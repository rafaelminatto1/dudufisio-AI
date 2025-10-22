# Migrations Supabase - Sistema de Evolução de Sessão

## 📋 Migrations Disponíveis

### 1. `20251022_session_evolutions.sql`
**Tabela:** `session_evolutions`

Armazena evoluções completas de cada sessão de atendimento.

**Campos principais:**
- Dados SOAP (subjective, objective, assessment, plan)
- Testes realizados (JSONB array)
- Métricas rápidas (dor, satisfação)
- Metadata (duração, tags, notas)

**RLS:** Habilitado com políticas para terapeutas e admin

---

### 2. `20251022_conduct_templates.sql`
**Tabela:** `conduct_templates`

Templates de conduta salvos para replicação rápida.

**Campos principais:**
- Nome e descrição do template
- Dados SOAP para replicar
- Testes incluídos
- Contador de uso
- Referência à sessão origem

**RLS:** Habilitado - criador e admin podem editar/deletar

---

### 3. `20251022_medical_insights.sql`
**Tabela:** `medical_insights`

Cache de insights médicos gerados automaticamente.

**Campos principais:**
- Tipo de insight (pain_reduction, milestone, etc)
- Título e descrição
- Dados estruturados (JSONB)
- Texto sugerido para laudo

**Bonus:** Inclui view `patient_insights_summary` para agregação

---

## 🚀 Como Aplicar as Migrations

### Opção 1: Via Supabase Dashboard (Recomendado)

1. Acesse o **Supabase Dashboard** do seu projeto
2. Vá em **SQL Editor**
3. Clique em **"New query"**
4. Copie o conteúdo de cada arquivo `.sql`
5. Cole no editor
6. Clique em **"Run"**
7. Repita para os 3 arquivos

### Opção 2: Via Supabase CLI

```bash
# 1. session_evolutions
npx supabase db push supabase/migrations/20251022_session_evolutions.sql

# 2. conduct_templates
npx supabase db push supabase/migrations/20251022_conduct_templates.sql

# 3. medical_insights
npx supabase db push supabase/migrations/20251022_medical_insights.sql
```

### Opção 3: Via MCP Supabase Tool

Se você tem o MCP Supabase configurado:

```typescript
// Executar cada migration
await mcp_supabase_apply_migration({
  name: "session_evolutions",
  query: "... conteúdo do SQL ..."
});
```

---

## ✅ Verificar se Aplicou Corretamente

Após aplicar as migrations, verifique:

```sql
-- Ver tabelas criadas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('session_evolutions', 'conduct_templates', 'medical_insights');

-- Ver índices criados
SELECT indexname 
FROM pg_indexes 
WHERE tablename IN ('session_evolutions', 'conduct_templates', 'medical_insights');

-- Ver políticas RLS
SELECT tablename, policyname 
FROM pg_policies 
WHERE tablename IN ('session_evolutions', 'conduct_templates', 'medical_insights');
```

---

## 🔧 Configuração do Sistema

Após aplicar as migrations, configure o sistema:

### 1. Habilitar Supabase

Arquivo: `config/supabaseTablesConfig.ts`

```typescript
export const USE_SUPABASE = true; // ✅ Ativar
export const MOCK_FALLBACK = true; // ✅ Manter ativo como fallback
```

### 2. Testar Conexão

1. Acesse `/session-evolution-settings`
2. Veja o indicador no canto da tela
3. Deve mostrar: 🟢 **Supabase Conectado**

---

## 📊 Dados de Exemplo (Opcional)

Para popular dados de exemplo no Supabase:

```sql
-- Exemplo de evolução de sessão
INSERT INTO session_evolutions (
  session_id,
  patient_id,
  session_number,
  session_date,
  therapist_id,
  therapist_name,
  subjective,
  objective,
  assessment,
  plan,
  tests_performed,
  pain_level
) VALUES (
  (SELECT id FROM appointments LIMIT 1),
  (SELECT id FROM patients LIMIT 1),
  1,
  NOW(),
  (SELECT id FROM users WHERE role = 'Fisioterapeuta' LIMIT 1),
  'Dr. Roberto Silva',
  'Paciente relata dor no joelho direito, intensidade 7/10',
  'ROM: 60° flexão, edema leve, força quadríceps 4/5',
  'Evolução positiva, paciente respondendo ao tratamento',
  'Mobilização patelar, fortalecimento quadríceps 3x15',
  '[{"id":"test_1","testName":"Amplitude joelho","testType":"amplitude","value":60,"unit":"graus","side":"right","assessedAt":"2025-10-22T10:00:00Z"}]'::jsonb,
  7
);

-- Exemplo de template de conduta
INSERT INTO conduct_templates (
  patient_id,
  name,
  description,
  subjective,
  plan,
  is_template,
  times_used
) VALUES (
  (SELECT id FROM patients LIMIT 1),
  'Conduta Padrão - Lesão LCA',
  'Template padrão para reabilitação de LCA',
  'Paciente relata dor leve, amplitude melhorando',
  'Fortalecimento quadríceps, propriocepção, crioterapia',
  true,
  0
);
```

---

## ⚠️ Importante

### Ordem de Aplicação
1. **Primeiro:** `session_evolutions.sql`
2. **Depois:** `conduct_templates.sql` (depende de session_evolutions)
3. **Por último:** `medical_insights.sql`

### Rollback (Se Necessário)
```sql
-- Remover tabelas (CUIDADO!)
DROP TABLE IF EXISTS medical_insights CASCADE;
DROP TABLE IF EXISTS conduct_templates CASCADE;
DROP TABLE IF EXISTS session_evolutions CASCADE;
DROP VIEW IF EXISTS patient_insights_summary;
```

### Backup
Sempre faça backup antes de aplicar migrations em produção!

```bash
# Backup via Supabase CLI
npx supabase db dump -f backup_antes_evolutions.sql
```

---

## 🎯 Estratégia de Dados

O sistema usa **estratégia híbrida**:

### Usar JSONB Existente (Já Funciona):
- ✅ `patients.surgeries` - cirurgias
- ✅ `patients.goals` - objetivos
- ✅ `patients.pathologies` - patologias

### Usar Tabelas Novas (Melhor Performance):
- ✅ `session_evolutions` - evoluções de sessão
- ✅ `conduct_templates` - templates de conduta
- ✅ `medical_insights` - insights médicos

**Vantagem:** Não precisa migrar dados existentes, usa o que já funciona!

---

## 📝 Próximos Passos Após Migrations

1. ✅ Aplicar as 3 migrations
2. ✅ Verificar tabelas criadas
3. ✅ Testar inserção de dados
4. ✅ Configurar `USE_SUPABASE = true`
5. ✅ Testar no sistema
6. ✅ Popular dados de exemplo (opcional)
7. ✅ Limpar dados mock quando não precisar mais

---

**Migrations prontas para uso!** 🚀

*Data: 22/10/2025*

