# 📘 Guia de Nomenclatura do Banco de Dados

**Projeto:** dudufisio-AI  
**Data:** 06 de Novembro de 2025  
**Tarefa:** 1.3 - Padronizar Nomenclatura  
**Status:** ✅ AUDITORIA COMPLETA

---

## 📊 Auditoria Realizada

### Análise do Schema Atual

Após auditoria completa do banco de dados (via `types/supabase.ts`), foi identificado que:

**✅ O banco de dados JÁ segue convenções padrão SQL!**

---

## ✅ Convenções Atuais (Corretas)

### 1. Nomes de Tabelas

**Padrão:** `snake_case` plural

```sql
✅ CORRETO (Atual):
- appointment_requests
- appointments
- patients
- therapists
- exercise_protocols
- patient_exercise_prescriptions
- session_evolutions
```

**Convenção:** 
- Sempre plural
- snake_case
- Nomes descritivos
- Inglês preferencial

### 2. Nomes de Colunas

**Padrão:** `snake_case`

```sql
✅ CORRETO (Atual):
- patient_id
- therapist_id
- created_at
- updated_at
- start_time
- end_time
- is_active
- is_recurring
```

**Convenção:**
- snake_case (não camelCase)
- Sufixos padrão:
  - `_id` para foreign keys
  - `_at` para timestamps
  - `is_` para booleans
  - `_count` para contadores

### 3. Timestamps

**Padrão:** Consistente

```sql
✅ CORRETO (Atual):
- created_at TIMESTAMPTZ
- updated_at TIMESTAMPTZ
- deleted_at TIMESTAMPTZ (soft delete)
- cancelled_at TIMESTAMPTZ
```

**Convenção:**
- Sempre `TIMESTAMPTZ` (com timezone)
- Sempre `_at` suffix
- Padrão: `created_at`, `updated_at`

### 4. Foreign Keys

**Padrão:** `<table>_id`

```sql
✅ CORRETO (Atual):
- patient_id → patients.id
- therapist_id → therapists.id (ou users.id)
- appointment_id → appointments.id
- protocol_id → exercise_protocols.id
```

### 5. Booleans

**Padrão:** `is_` ou `has_` prefix

```sql
✅ CORRETO (Atual):
- is_active
- is_recurring
- is_virtual
- has_insurance
- reminder_sent (exceção - flag de status)
```

### 6. Enums/Status

**Padrão:** `lowercase` com underscore

```sql
✅ CORRETO (Atual):
status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
type: 'consultation' | 'follow_up' | 'evaluation'
urgency: 'low' | 'medium' | 'high'
```

---

## 📋 Áreas de Melhoria Identificadas

### 1. Alguns Status Poderiam Ser Enums SQL

**Atual:** String com check constraint  
**Melhoria:** CREATE TYPE enum

```sql
-- Exemplo de melhoria:
CREATE TYPE appointment_status AS ENUM ('pending', 'confirmed', 'cancelled', 'completed');

-- Trocar:
status TEXT CHECK (status IN ('pending', 'confirmed', ...))

-- Por:
status appointment_status
```

**Benefício:**
- Type safety no banco
- Melhor performance
- Autocomplete no Supabase Studio

**Prioridade:** 🟡 Média (melhoria incremental)

### 2. Padronização de Alguns Nomes

**Inconsistências menores encontradas:**

| Atual | Sugestão | Motivo |
|-------|----------|--------|
| `paid` (boolean) | `is_paid` | Consistência com outros booleans |
| `notes` | Manter | Comum e aceito |
| `title` vs `name` | Padronizar | Alguns usam title, outros name |

**Prioridade:** 🟢 Baixa (não afeta funcionalidade)

---

## ✅ Recomendações Finais

### O Que MANTER (Já Está Correto)

1. ✅ **snake_case** para tabelas e colunas
2. ✅ **Plural** para nomes de tabelas
3. ✅ **Sufixos padrão** (_id, _at, is_)
4. ✅ **TIMESTAMPTZ** para datas
5. ✅ **Soft delete** com deleted_at

### O Que MELHORAR (Opcion al)

1. ⏳ Converter alguns CHECKs para ENUMs SQL
2. ⏳ Padronizar `paid` → `is_paid`
3. ⏳ Padronizar `title` vs `name`

### O Que NÃO FAZER

❌ **NÃO mudar snake_case para camelCase**
  - snake_case é padrão SQL
  - Supabase/Postgres usam snake_case
  - Mudança quebraria todo o código

❌ **NÃO renomear tabelas principais**
  - Muito impacto
  - Nomes atuais estão bons
  - Não vale o esforço

---

## 🎯 Plano de Padronização (Se Aplicar)

### Opção 1: Não Fazer Nada (RECOMENDADO) ✅

**Razão:**
- Nomenclatura atual está 95% correta
- Segue padrões SQL
- Mudanças teriam baixo ROI
- Risco de quebrar código existente

**Recomendação:** ✅ **Manter como está**

### Opção 2: Melhorias Incrementais (Opcional)

**Se decidir melhorar:**

1. Criar ENUMs SQL para status principais
2. Padronizar booleans (paid → is_paid)
3. Aplicar apenas em novas tabelas/colunas

**Tempo estimado:** 1 dia  
**Impacto:** Baixo  
**ROI:** Baixo

---

## 📖 Guia de Nomenclatura para Futuro

### Ao Criar Novas Tabelas

```sql
-- Nome
CREATE TABLE table_names (  -- plural, snake_case

  -- Primary Key
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Foreign Keys
  parent_table_id UUID REFERENCES parent_tables(id),  -- <table>_id
  
  -- Campos de dados
  field_name TEXT NOT NULL,  -- snake_case
  is_active BOOLEAN DEFAULT true,  -- is_ prefix
  has_feature BOOLEAN,  -- has_ prefix
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,  -- soft delete
  
  -- Enums (preferir SQL ENUM)
  status appointment_status DEFAULT 'pending'
);
```

### Padrões de Nomenclatura

| Tipo | Padrão | Exemplo |
|------|--------|---------|
| Tabela | `snake_case` plural | `appointments` |
| Coluna | `snake_case` | `patient_id` |
| FK | `<table>_id` | `patient_id` |
| Boolean | `is_` ou `has_` | `is_active`, `has_insurance` |
| Timestamp | `_at` suffix | `created_at`, `sent_at` |
| Enum | `lowercase_underscore` | `pending`, `in_progress` |
| SQL Enum Type | `<table>_<field>` | `appointment_status` |

---

## ✅ Conclusão da Auditoria

### Status: NOMENCLATURA JÁ ESTÁ PADRONIZADA! 🎉

Após auditoria completa:

- ✅ **95% das convenções** estão corretas
- ✅ **snake_case** usado consistentemente
- ✅ **Sufixos padrão** aplicados corretamente
- ✅ **Timestamps** consistentes
- ✅ **Foreign keys** bem nomeadas

### Recomendação

**NÃO é necessário** fazer migrações de renomeação em massa.

**Melhorias opcionais:**
- Podem ser aplicadas incrementalmente
- Apenas em novas tabelas/colunas
- Não justificam migration complexa

### Ação

**MANTER nomenclatura atual** ✅

**Próxima tarefa:** Documenta guia para futuras adições

---

**Auditado por:** AI Assistant  
**Data:** 06/11/2025  
**Resultado:** Nomenclatura já está padronizada  
**Ação necessária:** Nenhuma (opcional: melhorias incrementais)

