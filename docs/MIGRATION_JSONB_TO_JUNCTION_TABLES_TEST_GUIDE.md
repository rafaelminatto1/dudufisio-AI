# Guia de Testes - Migração JSONB → Junction Tables

## 📋 Overview

Este guia detalha como testar a migração de campos JSONB de exercícios para tabelas de junção normalizadas.

**Data:** 06 de Novembro de 2025  
**Migração:** `2025-11-06_backfill_exercise_junctions.sql`

---

## 🎯 Objetivos da Migração

1. ✅ Migrar `exercise_protocols.exercises` → `protocol_exercises`
2. ✅ Migrar `patient_exercise_prescriptions.exercises` → `prescription_exercises`
3. ✅ Migrar `session_evolutions.prescribed_exercises` → `evolution_prescribed_exercises`

---

## 🔍 Pré-requisitos

### 1. Aplicar Migrations

```bash
# 1. Criar as junction tables
# Aplicar: supabase/migrations/2025-11-06_create_exercise_junction_tables.sql

# 2. Migrar os dados
# Aplicar: supabase/migrations/2025-11-06_backfill_exercise_junctions.sql
```

### 2. Verificar Logs da Migração

Após executar a migration de backfill, verificar as mensagens de NOTICE:

```
==============================================
PRE-MIGRATION COUNT
==============================================
Protocols with exercises: X
Prescriptions with exercises: Y
Evolutions with prescribed exercises: Z
==============================================

==============================================
POST-MIGRATION COUNT
==============================================
Protocol exercises migrated: A rows from B protocols
Prescription exercises migrated: C rows from D prescriptions
Evolution exercises migrated: E rows from F evolutions
==============================================
```

---

## ✅ Testes de Validação SQL

### 1. Validar Contagem de Registros

```sql
-- Comparar JSONB vs Junction Table para Protocols
SELECT 
  'exercise_protocols' as table_name,
  COUNT(*) as total_records,
  SUM(
    CASE 
      WHEN exercises IS NOT NULL AND jsonb_typeof(exercises) = 'array' 
      THEN jsonb_array_length(exercises) 
      ELSE 0 
    END
  ) as total_jsonb_exercises,
  (SELECT COUNT(*) FROM protocol_exercises) as total_junction_exercises
FROM exercise_protocols;

-- Comparar JSONB vs Junction Table para Prescriptions
SELECT 
  'patient_exercise_prescriptions' as table_name,
  COUNT(*) as total_records,
  SUM(
    CASE 
      WHEN exercises IS NOT NULL AND jsonb_typeof(exercises) = 'array' 
      THEN jsonb_array_length(exercises) 
      ELSE 0 
    END
  ) as total_jsonb_exercises,
  (SELECT COUNT(*) FROM prescription_exercises) as total_junction_exercises
FROM patient_exercise_prescriptions;

-- Comparar JSONB vs Junction Table para Evolutions
SELECT 
  'session_evolutions' as table_name,
  COUNT(*) as total_records,
  SUM(
    CASE 
      WHEN prescribed_exercises IS NOT NULL AND jsonb_typeof(prescribed_exercises) = 'array' 
      THEN jsonb_array_length(prescribed_exercises) 
      ELSE 0 
    END
  ) as total_jsonb_exercises,
  (SELECT COUNT(*) FROM evolution_prescribed_exercises) as total_junction_exercises
FROM session_evolutions;
```

**✅ Esperado:** `total_jsonb_exercises` deve ser igual a `total_junction_exercises`

### 2. Verificar Integridade dos Dados

```sql
-- Verificar se todos os exercise_ids são válidos
SELECT COUNT(*) as orphaned_exercises
FROM protocol_exercises pe
WHERE NOT EXISTS (
  SELECT 1 FROM exercises e WHERE e.id = pe.exercise_id
);
-- ✅ Esperado: 0 registros órfãos

-- Verificar se positions estão corretas (sem gaps)
SELECT 
  protocol_id,
  COUNT(*) as total_exercises,
  MIN(position) as min_position,
  MAX(position) as max_position
FROM protocol_exercises
GROUP BY protocol_id
HAVING MIN(position) < 0 OR MAX(position) >= COUNT(*);
-- ✅ Esperado: 0 registros com positions inválidas
```

### 3. Comparar Dados Específicos

```sql
-- Pegar um protocolo de exemplo e comparar JSONB vs Junction
WITH sample_protocol AS (
  SELECT id FROM exercise_protocols 
  WHERE exercises IS NOT NULL 
  AND jsonb_array_length(exercises) > 0 
  LIMIT 1
)
SELECT 
  'JSONB' as source,
  jsonb_array_length(ep.exercises) as total_exercises,
  ep.exercises
FROM exercise_protocols ep, sample_protocol sp
WHERE ep.id = sp.id
UNION ALL
SELECT 
  'Junction' as source,
  COUNT(*)::int as total_exercises,
  jsonb_agg(
    jsonb_build_object(
      'exercise_id', pe.exercise_id,
      'position', pe.position,
      'sets', pe.sets,
      'reps', pe.reps
    ) ORDER BY pe.position
  ) as exercises
FROM protocol_exercises pe, sample_protocol sp
WHERE pe.protocol_id = sp.id
GROUP BY pe.protocol_id;
```

---

## 🧪 Testes de Funcionalidade (TypeScript)

### 1. Testar ExerciseRepository.findProtocols()

```typescript
import { exerciseRepository } from '@/services/repositories/ExerciseRepository';

async function testFindProtocols() {
  try {
    const protocols = await exerciseRepository.findProtocols();
    
    console.log('✅ Total protocols:', protocols.length);
    
    if (protocols.length > 0) {
      const firstProtocol = protocols[0];
      console.log('Protocol:', firstProtocol.name);
      console.log('Exercises:', firstProtocol.exercises?.length || 0);
      
      if (firstProtocol.exercises && firstProtocol.exercises.length > 0) {
        console.log('First exercise:', firstProtocol.exercises[0]);
        console.log('✅ Protocol exercises loaded successfully');
      }
    }
  } catch (error) {
    console.error('❌ Error:', error);
  }
}
```

### 2. Testar SessionEvolutionService

```typescript
import { sessionEvolutionService } from '@/services/domain/SessionEvolutionService';

async function testSessionEvolution() {
  try {
    // Buscar uma evolução existente
    const evolutions = await sessionEvolutionService.findMany();
    
    console.log('✅ Total evolutions:', evolutions.length);
    
    if (evolutions.length > 0) {
      const firstEvolution = evolutions[0];
      console.log('Evolution ID:', firstEvolution.id);
      console.log('Prescribed exercises:', firstEvolution.prescribedExercises?.length || 0);
      
      if (firstEvolution.prescribedExercises && firstEvolution.prescribedExercises.length > 0) {
        console.log('First prescribed exercise:', firstEvolution.prescribedExercises[0]);
        console.log('✅ Prescribed exercises loaded successfully');
      }
    }
  } catch (error) {
    console.error('❌ Error:', error);
  }
}
```

### 3. Testar ExercisePrescriptionService

```typescript
import { exercisePrescriptionService } from '@/services/domain/ExercisePrescriptionService';

async function testPrescriptionService() {
  try {
    // Buscar prescrições ativas
    const prescriptions = await exercisePrescriptionService.findMany({ 
      status: 'active' 
    });
    
    console.log('✅ Total active prescriptions:', prescriptions.length);
    
    if (prescriptions.length > 0) {
      const firstPrescription = prescriptions[0];
      console.log('Prescription:', firstPrescription.title);
      console.log('Exercises:', firstPrescription.prescription_exercises?.length || 0);
      
      if (firstPrescription.prescription_exercises && firstPrescription.prescription_exercises.length > 0) {
        console.log('First exercise:', firstPrescription.prescription_exercises[0]);
        console.log('✅ Prescription exercises loaded successfully');
      }
    }
  } catch (error) {
    console.error('❌ Error:', error);
  }
}
```

### 4. Testar CRUD Completo

```typescript
// Criar uma nova prescrição com exercícios
async function testCreatePrescription() {
  try {
    const newPrescription = await exercisePrescriptionService.create({
      patientId: 'patient-uuid',
      therapistId: 'therapist-uuid',
      title: 'Teste de Migração',
      description: 'Prescrição criada para testar junction tables',
      startDate: new Date(),
      frequencyPerWeek: 3,
      exercises: [
        {
          exerciseId: 'exercise-uuid-1',
          position: 0,
          sets: 3,
          reps: 10,
          intensity: 'moderate',
        },
        {
          exerciseId: 'exercise-uuid-2',
          position: 1,
          sets: 2,
          reps: 15,
          intensity: 'light',
        },
      ],
    });
    
    console.log('✅ Prescription created:', newPrescription.id);
    console.log('Exercises saved:', newPrescription.prescription_exercises?.length);
    
    // Atualizar
    const updated = await exercisePrescriptionService.update(newPrescription.id, {
      title: 'Teste Atualizado',
      exercises: [
        {
          exerciseId: 'exercise-uuid-1',
          position: 0,
          sets: 4,
          reps: 12,
        },
      ],
    });
    
    console.log('✅ Prescription updated');
    console.log('Updated exercises:', updated.prescription_exercises?.length);
    
    // Deletar (soft delete)
    await exercisePrescriptionService.delete(newPrescription.id);
    console.log('✅ Prescription deleted');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}
```

---

## 🎨 Testes de UI

### 1. Página de Protocolos

- [ ] Listar protocolos
- [ ] Ver detalhes de um protocolo (exercícios devem aparecer)
- [ ] Criar novo protocolo com exercícios
- [ ] Editar protocolo existente (adicionar/remover exercícios)
- [ ] Deletar protocolo

### 2. Página de Prescrições

- [ ] Listar prescrições do paciente
- [ ] Criar nova prescrição baseada em protocolo
- [ ] Criar prescrição customizada
- [ ] Editar prescrição (alterar exercícios)
- [ ] Completar/Pausar/Cancelar prescrição

### 3. Página de Evoluções

- [ ] Criar nova evolução com exercícios prescritos
- [ ] Visualizar evolução existente (exercícios devem aparecer)
- [ ] Marcar exercícios como realizados
- [ ] Adicionar dor/notas aos exercícios realizados
- [ ] Editar evolução

---

## ⚠️ Problemas Conhecidos e Soluções

### Problema 1: Tipos do Supabase não incluem junction tables

**Solução:**
```bash
npx supabase gen types typescript --project-id urfxniitfbbvsaskicfo > types/supabase.ts
```

### Problema 2: Campos JSONB ainda aparecem nas queries

**Causa:** Os campos JSONB ainda existem nas tabelas (não foram removidos)  
**Solução:** Após validação completa, executar migration de cleanup

### Problema 3: Performance lenta em queries com JOIN

**Solução:** Verificar se os índices foram criados corretamente:
```sql
-- Verificar índices
SELECT 
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename IN ('protocol_exercises', 'prescription_exercises', 'evolution_prescribed_exercises');
```

---

## 📊 Métricas de Sucesso

### ✅ Critérios de Aceitação

- [ ] **Contagem de registros:** JSONB count = Junction table count
- [ ] **Integridade referencial:** Todos exercise_ids são válidos
- [ ] **Positions corretas:** Sem gaps ou valores negativos
- [ ] **Dados idênticos:** Sample comparison mostra dados iguais
- [ ] **Funcionalidade TypeScript:** Todos os services funcionam
- [ ] **UI funcional:** CRUD completo funciona na interface
- [ ] **Performance:** Queries com JOIN < 500ms (p95)
- [ ] **Zero erros:** Nenhum erro em produção após 48h

### 📈 Rollback Plan

Se algo der errado:

1. **Não deletar campos JSONB ainda** (migration de cleanup não foi aplicada)
2. **Reverter código TypeScript** para versão anterior
3. **Deletar registros das junction tables:**
   ```sql
   TRUNCATE TABLE protocol_exercises, prescription_exercises, evolution_prescribed_exercises CASCADE;
   ```
4. **Analisar logs e corrigir problemas**
5. **Re-executar migration de backfill** após correções

---

## ✅ Checklist Final

Antes de aplicar a migration de cleanup (remover JSONB):

- [ ] Todos os testes SQL passaram
- [ ] Todos os testes TypeScript passaram
- [ ] Testes de UI passaram
- [ ] Performance está aceitável
- [ ] Backup do banco de dados foi feito
- [ ] Stakeholders foram notificados
- [ ] Período de observação de 48h completado sem erros
- [ ] Aprovação formal para remover campos JSONB

---

## 📝 Notas

- **Backup recomendado:** Antes de aplicar qualquer migration
- **Período de testes:** Mínimo 48h em produção antes de remover JSONB
- **Monitoramento:** Verificar logs de erro e performance queries
- **Documentação:** Atualizar documentação da API após validação

---

## 🚀 Próximos Passos

Após validação completa:

1. ✅ Aplicar migration de cleanup: `2025-11-06_remove_exercise_jsonb_fields.sql`
2. ✅ Atualizar documentação da API
3. ✅ Comunicar mudanças ao time
4. ✅ Monitorar por mais 1 semana
5. ✅ Celebrar! 🎉

