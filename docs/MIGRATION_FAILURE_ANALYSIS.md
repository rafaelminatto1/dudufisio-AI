# 🚨 ANÁLISE DE FALHA NA MIGRAÇÃO

**Data:** 06 de Novembro de 2025  
**Projeto:** dudufisio-AI  
**Status:** ❌ **MIGRAÇÃO FALHOU - AÇÃO NECESSÁRIA**

---

## 📊 Resultado da Validação

```json
{
  "tests_passed": 6,
  "total_tests": 9,
  "success_rate": "66.67%",
  "final_status": "❌ MIGRATION FAILED - ROLLBACK REQUIRED"
}
```

### Interpretação

- ✅ **6 testes passaram** (66.67%)
- ❌ **3 testes falharam** (33.33%)
- ⚠️ **Status:** Rollback recomendado

---

## 🔍 Análise dos Testes

### Testes Executados (validation-queries.sql)

1. ✅/❌ Comparação de contagens - `exercise_protocols`
2. ✅/❌ Comparação de contagens - `patient_exercise_prescriptions`
3. ✅/❌ Comparação de contagens - `session_evolutions`
4. ✅/❌ Integridade referencial - `protocol_exercises`
5. ✅/❌ Integridade referencial - `prescription_exercises`
6. ✅/❌ Integridade referencial - `evolution_prescribed_exercises`
7. ✅/❌ Positions válidas - `protocol_exercises`
8. ✅/❌ Positions válidas - `prescription_exercises`
9. ✅/❌ Positions válidas - `evolution_prescribed_exercises`

### Necessário Identificar

**AÇÃO IMEDIATA:** Executar queries individuais para identificar quais testes falharam.

---

## 🔧 Investigação Detalhada

### Query para Identificar Problemas

Execute as seguintes queries no SQL Editor para diagnóstico:

#### 1. Verificar Contagens JSONB vs Junction

```sql
-- Protocols
SELECT 
  'exercise_protocols' as tabela,
  SUM(CASE WHEN exercises IS NOT NULL AND jsonb_typeof(exercises) = 'array' 
      THEN jsonb_array_length(exercises) ELSE 0 END) as jsonb_count,
  (SELECT COUNT(*) FROM protocol_exercises) as junction_count,
  CASE 
    WHEN SUM(CASE WHEN exercises IS NOT NULL AND jsonb_typeof(exercises) = 'array' 
        THEN jsonb_array_length(exercises) ELSE 0 END) = (SELECT COUNT(*) FROM protocol_exercises)
    THEN 'OK' ELSE 'FALHOU'
  END as status
FROM exercise_protocols;

-- Prescriptions
SELECT 
  'patient_exercise_prescriptions' as tabela,
  SUM(CASE WHEN exercises IS NOT NULL AND jsonb_typeof(exercises) = 'array' 
      THEN jsonb_array_length(exercises) ELSE 0 END) as jsonb_count,
  (SELECT COUNT(*) FROM prescription_exercises) as junction_count,
  CASE 
    WHEN SUM(CASE WHEN exercises IS NOT NULL AND jsonb_typeof(exercises) = 'array' 
        THEN jsonb_array_length(exercises) ELSE 0 END) = (SELECT COUNT(*) FROM prescription_exercises)
    THEN 'OK' ELSE 'FALHOU'
  END as status
FROM patient_exercise_prescriptions;

-- Evolutions
SELECT 
  'session_evolutions' as tabela,
  SUM(CASE WHEN prescribed_exercises IS NOT NULL AND jsonb_typeof(prescribed_exercises) = 'array' 
      THEN jsonb_array_length(prescribed_exercises) ELSE 0 END) as jsonb_count,
  (SELECT COUNT(*) FROM evolution_prescribed_exercises) as junction_count,
  CASE 
    WHEN SUM(CASE WHEN prescribed_exercises IS NOT NULL AND jsonb_typeof(prescribed_exercises) = 'array' 
        THEN jsonb_array_length(prescribed_exercises) ELSE 0 END) = (SELECT COUNT(*) FROM evolution_prescribed_exercises)
    THEN 'OK' ELSE 'FALHOU'
  END as status
FROM session_evolutions;
```

#### 2. Verificar Registros Órfãos

```sql
-- Exercise IDs que não existem
SELECT 'protocol_exercises' as tabela, COUNT(*) as orfaos
FROM protocol_exercises pe
WHERE NOT EXISTS (SELECT 1 FROM exercises e WHERE e.id = pe.exercise_id)
UNION ALL
SELECT 'prescription_exercises', COUNT(*)
FROM prescription_exercises pe
WHERE NOT EXISTS (SELECT 1 FROM exercises e WHERE e.id = pe.exercise_id)
UNION ALL
SELECT 'evolution_prescribed_exercises', COUNT(*)
FROM evolution_prescribed_exercises epe
WHERE NOT EXISTS (SELECT 1 FROM exercises e WHERE e.id = epe.exercise_id);
```

#### 3. Verificar Positions Inválidas

```sql
SELECT 
  'protocol_exercises' as tabela,
  COUNT(*) as positions_invalidas
FROM protocol_exercises
WHERE position < 0
UNION ALL
SELECT 'prescription_exercises', COUNT(*)
FROM prescription_exercises
WHERE position < 0
UNION ALL
SELECT 'evolution_prescribed_exercises', COUNT(*)
FROM evolution_prescribed_exercises
WHERE position < 0;
```

---

## 🚨 Ações Imediatas

### Opção 1: Investigar e Corrigir (Recomendado se problema for pequeno)

1. **Executar queries de diagnóstico** acima
2. **Identificar o problema específico**
3. **Corrigir o problema** com SQL manual
4. **Re-executar validações**

### Opção 2: Rollback Completo (Recomendado se problema for complexo)

#### Passo 1: Limpar Junction Tables

```sql
-- Os dados JSONB originais ainda estão intactos!
-- Este comando apenas limpa as junction tables

BEGIN;

-- Truncar as junction tables
TRUNCATE TABLE protocol_exercises CASCADE;
TRUNCATE TABLE prescription_exercises CASCADE;
TRUNCATE TABLE evolution_prescribed_exercises CASCADE;

-- Verificar que estão vazias
SELECT 'protocol_exercises' as tabela, COUNT(*) as registros FROM protocol_exercises
UNION ALL
SELECT 'prescription_exercises', COUNT(*) FROM prescription_exercises
UNION ALL
SELECT 'evolution_prescribed_exercises', COUNT(*) FROM evolution_prescribed_exercises;

-- Se tudo estiver OK (0 registros), fazer commit
COMMIT;

-- Se algo estiver errado, fazer rollback
-- ROLLBACK;
```

#### Passo 2: Reverter Código TypeScript (se já foi deployado)

```bash
# Voltar para versão anterior sem junction tables
git checkout <commit-anterior>

# Fazer deploy da versão anterior
```

#### Passo 3: Analisar Logs

Revisar:
- Mensagens de NOTICE da migration de backfill
- Logs de erro do Supabase
- Output da validation-queries.sql

---

## 🔍 Possíveis Causas

### 1. Exercise IDs Inválidos no JSONB

**Causa:** JSONB contém exercise_ids que não existem na tabela `exercises`

**Solução:**
```sql
-- Encontrar exercise_ids órfãos no JSONB
SELECT DISTINCT ex.value->>'exercise_id' as orphan_id
FROM exercise_protocols ep,
     jsonb_array_elements(ep.exercises) as ex(value)
WHERE NOT EXISTS (
  SELECT 1 FROM exercises e 
  WHERE e.id = (ex.value->>'exercise_id')::uuid
);
```

### 2. Formato JSONB Incorreto

**Causa:** JSONB não está no formato esperado

**Exemplo de formato correto:**
```json
[
  {
    "exercise_id": "uuid-here",
    "order": 0,
    "sets": 3,
    "repetitions": 10,
    "duration_seconds": 60,
    "rest_seconds": 30
  }
]
```

### 3. Problemas de Permissão/RLS

**Causa:** Row Level Security bloqueando inserções

**Solução:**
```sql
-- Temporariamente desabilitar RLS para debug
ALTER TABLE protocol_exercises DISABLE ROW LEVEL SECURITY;
ALTER TABLE prescription_exercises DISABLE ROW LEVEL SECURITY;
ALTER TABLE evolution_prescribed_exercises DISABLE ROW LEVEL SECURITY;

-- Re-executar backfill

-- Re-habilitar RLS
ALTER TABLE protocol_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescription_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE evolution_prescribed_exercises ENABLE ROW LEVEL SECURITY;
```

### 4. Dados JSONB Vazios ou Nulos

**Causa:** Registros com JSONB null/empty não foram considerados

**Verificar:**
```sql
-- Quantos registros têm JSONB válido?
SELECT 
  COUNT(*) as total,
  COUNT(CASE WHEN exercises IS NOT NULL THEN 1 END) as com_exercises,
  COUNT(CASE WHEN exercises IS NOT NULL AND jsonb_array_length(exercises) > 0 THEN 1 END) as com_exercises_populado
FROM exercise_protocols;
```

---

## 📋 Plano de Correção

### Fase 1: Diagnóstico (15 min)

1. ✅ Executar queries de diagnóstico
2. ✅ Identificar qual(is) teste(s) falhou(falharam)
3. ✅ Identificar a causa raiz
4. ✅ Documentar findings

### Fase 2: Decisão (5 min)

**SE** problema for simples (ex: alguns registros órfãos):
- ➡️ Seguir com correção manual

**SE** problema for complexo (ex: formato JSONB errado):
- ➡️ Fazer rollback completo
- ➡️ Corrigir migration
- ➡️ Re-aplicar

### Fase 3: Ação (15-30 min)

**Opção A - Correção:**
- Executar SQL de correção
- Re-validar
- Documentar

**Opção B - Rollback:**
- Limpar junction tables
- Reverter código
- Analisar problema
- Corrigir migration
- Re-aplicar quando pronto

---

## 📝 Próximos Passos Imediatos

### AGORA (Próximos 5 minutos)

1. **Executar diagnóstico completo** no SQL Editor
2. **Documentar resultados** neste arquivo
3. **Decidir:** Corrigir ou fazer Rollback?

### Informações Necessárias

Para tomar a decisão correta, precisamos saber:

- [ ] Quantas contagens não batem?
- [ ] Quantos registros órfãos existem?
- [ ] Quantas positions inválidas?
- [ ] Qual a diferença numérica?
- [ ] O problema afeta todas as tabelas ou apenas algumas?

### Template de Resposta

```
DIAGNÓSTICO COMPLETO:

1. Contagens:
   - exercise_protocols: JSONB=___ | Junction=___ | Diferença=___
   - prescriptions: JSONB=___ | Junction=___ | Diferença=___
   - evolutions: JSONB=___ | Junction=___ | Diferença=___

2. Órfãos:
   - protocol_exercises: ___
   - prescription_exercises: ___
   - evolution_prescribed_exercises: ___

3. Positions Inválidas:
   - protocol_exercises: ___
   - prescription_exercises: ___
   - evolution_prescribed_exercises: ___

DECISÃO: [ ] Corrigir | [ ] Rollback
```

---

## ⚠️ Importante

### Dados JSONB Estão Seguros

- ✅ Os campos JSONB originais **NÃO foram removidos**
- ✅ Nenhum dado foi perdido
- ✅ Rollback é seguro e simples
- ✅ Podemos limpar e re-executar quantas vezes necessário

### Não Entre em Pânico

- ✅ Este é um processo controlado
- ✅ Temos backup (esperamos!)
- ✅ Temos plano de rollback
- ✅ Temos documentação completa

---

## 📞 Contatos

**Dashboard Supabase:** https://supabase.com/dashboard/project/urfxniitfbbvsaskicfo  
**SQL Editor:** https://supabase.com/dashboard/project/urfxniitfbbvsaskicfo/sql/new

---

**Status:** ⏳ Aguardando diagnóstico detalhado  
**Data:** 06/11/2025  
**Próxima ação:** Executar queries de diagnóstico e preencher template acima

