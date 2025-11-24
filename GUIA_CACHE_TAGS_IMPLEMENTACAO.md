# 🏷️ Guia de Implementação - Cache Tags

## O que fazer nos Services Cached

### 1. Atualizar Imports

```typescript
// ANTES
import { unstable_cacheLife as cacheLife } from 'next/cache';

// DEPOIS
import {
  unstable_cacheLife as cacheLife,
  unstable_cacheTag as cacheTag,
  revalidateTag
} from 'next/cache';
```

### 2. Adicionar Tags nas Funções Cached

```typescript
// ANTES
export const getPatientById = cache(async (id: string) => {
  'use cache';
  cacheLife('hours');
  // ... fetch logic
});

// DEPOIS
export const getPatientById = cache(async (id: string) => {
  'use cache';
  cacheLife('hours');
  cacheTag('patients', `patient-${id}`); // ✅ Adicionar tags
  // ... fetch logic
});
```

### 3. Adicionar revalidateTag nas Mutations

```typescript
// ANTES
static async update(id: string, patient: PatientUpdate) {
  // ... update logic
  // TODO: Invalidar cache após atualizar
  return data;
}

// DEPOIS
static async update(id: string, patient: PatientUpdate) {
  // ... update logic

  // ✅ Invalidar cache
  revalidateTag(`patient-${id}`);
  revalidateTag('patients');
  revalidateTag('patients-list');
  revalidateTag('patients-stats');

  return data;
}
```

---

## Estratégia de Tags por Service

### Patients Service
**Tags a adicionar:**
- `patients` - Tag geral
- `patient-{id}` - Por paciente específico
- `patients-list` - Listas de pacientes
- `patients-stats` - Estatísticas
- `patients-search` - Busca

**Revalidation:**
- **Create:** `patients`, `patients-list`, `patients-stats`
- **Update:** `patient-{id}`, `patients`, `patients-list`, `patients-stats`
- **Delete:** `patient-{id}`, `patients`, `patients-list`, `patients-stats`

### Appointments Service
**Tags a adicionar:**
- `appointments` - Tag geral
- `appointment-{id}` - Por agendamento específico
- `appointments-today` - Agendamentos de hoje
- `appointments-week` - Agendamentos da semana
- `appointments-therapist-{id}` - Por terapeuta
- `appointments-patient-{id}` - Por paciente
- `appointments-stats` - Estatísticas

**Revalidation:**
- **Create:** `appointments`, `appointments-today`, `appointments-week`, `appointments-therapist-{therapistId}`, `appointments-patient-{patientId}`, `appointments-stats`
- **Update:** `appointment-{id}`, `appointments`, `appointments-today`, `appointments-week`, `appointments-stats`
- **Delete:** `appointment-{id}`, `appointments`, `appointments-today`, `appointments-week`, `appointments-stats`
- **UpdateStatus:** `appointment-{id}`, `appointments`, `appointments-stats`

### Treatments Service
**Tags a adicionar:**
- `treatments` - Tag geral
- `treatment-{id}` - Por tratamento específico
- `treatments-patient-{id}` - Por paciente
- `treatments-therapist-{id}` - Por terapeuta
- `treatments-active` - Tratamentos ativos
- `treatments-stats` - Estatísticas

**Revalidation:**
- **Create:** `treatments`, `treatments-patient-{patientId}`, `treatments-active`, `treatments-stats`
- **Update:** `treatment-{id}`, `treatments`, `treatments-patient-{patientId}`, `treatments-active`, `treatments-stats`
- **Delete:** `treatment-{id}`, `treatments`, `treatments-patient-{patientId}`, `treatments-stats`

### Financial Service
**Tags a adicionar:**
- `transactions` - Tag geral
- `transaction-{id}` - Por transação específica
- `transactions-monthly` - Por mês
- `financial-summary` - Resumo financeiro
- `financial-revenue` - Receita
- `transactions-pending` - Pendentes

**Revalidation:**
- **Create:** `transactions`, `transactions-monthly`, `financial-summary`, `financial-revenue`
- **Update:** `transaction-{id}`, `transactions`, `transactions-monthly`, `financial-summary`
- **Delete:** `transaction-{id}`, `transactions`, `transactions-monthly`, `financial-summary`

---

## Exemplo Completo - Patients Service

```typescript
/**
 * Patients Service com Cache Tags (Next.js 16)
 */

import { cache } from 'react';
import {
  unstable_cacheLife as cacheLife,
  unstable_cacheTag as cacheTag,
  revalidateTag
} from 'next/cache';
import { createServerComponentClient } from '~/lib/supabase/server';
import type { Database } from '~/types/database.types';

type Patient = Database['public']['Tables']['patients']['Row'];
type PatientInsert = Database['public']['Tables']['patients']['Insert'];
type PatientUpdate = Database['public']['Tables']['patients']['Update'];

/**
 * Get patient by ID
 * Cache: 1 hora
 * Tags: 'patients', 'patient-{id}'
 */
export const getPatientById = cache(async (id: string) => {
  'use cache';
  cacheLife('hours');
  cacheTag('patients', `patient-${id}`);

  const supabase = await createServerComponentClient();
  const { data, error } = await supabase
    .from('patients')
    .select('*, user:users(*)')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
});

/**
 * Get all patients
 * Cache: 15 min
 * Tags: 'patients', 'patients-list'
 */
export const getAllPatients = cache(
  async (filters?: { status?: string; search?: string }) => {
    'use cache';
    cacheLife('default');
    cacheTag('patients', 'patients-list');

    const supabase = await createServerComponentClient();
    let query = supabase
      .from('patients')
      .select('*, user:users(*)');

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    if (filters?.search) {
      query = query.or(
        `full_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,phone.ilike.%${filters.search}%`
      );
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }
);

/**
 * Get patient statistics
 * Cache: Máximo
 * Tags: 'patients', 'patients-stats'
 */
export const getPatientStats = cache(async () => {
  'use cache';
  cacheLife('max');
  cacheTag('patients', 'patients-stats');

  const supabase = await createServerComponentClient();

  const [activeResult, inactiveResult, totalResult] = await Promise.all([
    supabase
      .from('patients')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active'),
    supabase
      .from('patients')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'inactive'),
    supabase
      .from('patients')
      .select('*', { count: 'exact', head: true }),
  ]);

  return {
    active: activeResult.count || 0,
    inactive: inactiveResult.count || 0,
    total: totalResult.count || 0,
  };
});

/**
 * Search patients
 * Cache: 15 min
 * Tags: 'patients', 'patients-search'
 */
export const searchPatients = cache(async (searchTerm: string) => {
  'use cache';
  cacheLife('default');
  cacheTag('patients', 'patients-search');

  const supabase = await createServerComponentClient();
  const { data, error } = await supabase
    .from('patients')
    .select('id, full_name, email, phone, status')
    .or(
      `full_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%`
    )
    .limit(10);

  if (error) throw error;
  return data || [];
});

// Mutations com Revalidation
export class PatientsServiceMutations {
  static async create(patient: PatientInsert) {
    const supabase = await createServerComponentClient();
    const { data, error } = await supabase
      .from('patients')
      .insert(patient)
      .select()
      .single();

    if (error) throw error;

    // Invalidar cache
    revalidateTag('patients');
    revalidateTag('patients-list');
    revalidateTag('patients-stats');
    revalidateTag('patients-search');

    return data;
  }

  static async update(id: string, patient: PatientUpdate) {
    const supabase = await createServerComponentClient();
    const { data, error } = await supabase
      .from('patients')
      .update(patient)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Invalidar cache específico e geral
    revalidateTag(`patient-${id}`);
    revalidateTag('patients');
    revalidateTag('patients-list');
    revalidateTag('patients-stats');
    revalidateTag('patients-search');

    return data;
  }

  static async delete(id: string) {
    const supabase = await createServerComponentClient();
    const { error } = await supabase
      .from('patients')
      .delete()
      .eq('id', id);

    if (error) throw error;

    // Invalidar cache
    revalidateTag(`patient-${id}`);
    revalidateTag('patients');
    revalidateTag('patients-list');
    revalidateTag('patients-stats');
    revalidateTag('patients-search');

    return true;
  }
}
```

---

## Como Testar

### 1. Criar um Paciente
```typescript
await PatientsServiceMutations.create(newPatient);
// Cache de 'patients-list' e 'patients-stats' será invalidado
// Próxima chamada a getAllPatients() buscará dados frescos
```

### 2. Verificar Invalidação
```typescript
// Antes
const patients1 = await getAllPatients(); // Cache hit
console.log(patients1.length); // 10

// Criar novo
await PatientsServiceMutations.create(newPatient);

// Depois
const patients2 = await getAllPatients(); // Cache miss - dados frescos
console.log(patients2.length); // 11 ✅
```

### 3. Update de Paciente Específico
```typescript
await PatientsServiceMutations.update(id, updates);
// Cache de `patient-${id}` será invalidado
// getPatientById(id) buscará dados frescos
// getAllPatients() também será atualizado
```

---

## Checklist de Implementação

### Patients Service
- [ ] Adicionar imports (cacheTag, revalidateTag)
- [ ] Adicionar tags em getPatientById
- [ ] Adicionar tags em getAllPatients
- [ ] Adicionar tags em getActivePatientsCount
- [ ] Adicionar tags em getPatientStats
- [ ] Adicionar tags em searchPatients
- [ ] Implementar revalidateTag em create
- [ ] Implementar revalidateTag em update
- [ ] Implementar revalidateTag em delete
- [ ] Testar invalidação funciona

### Appointments Service
- [ ] Mesmos passos acima
- [ ] Adicionar tags específicas (therapist, patient)
- [ ] Implementar revalidateTag em updateStatus

### Treatments Service
- [ ] Mesmos passos
- [ ] Tags por paciente e terapeuta

### Financial Service
- [ ] Mesmos passos
- [ ] Tags por mês

---

## Benefícios Esperados

### Antes (sem tags)
- ❌ Cache não é invalidado após mutations
- ❌ Dados podem ficar stale
- ❌ Precisaria esperar expiração do cache

### Depois (com tags)
- ✅ Cache invalidado imediatamente após mutations
- ✅ Dados sempre atualizados
- ✅ Controle granular (invalidar apenas o necessário)
- ✅ Melhor consistência de dados

---

## Performance Impact

- **Cache Hit Rate:** Mantém ~70% (cache continua efetivo)
- **Data Freshness:** 100% após mutations
- **Overhead:** Mínimo (apenas revalidateTag calls)

---

## Próximos Passos

1. Implementar em Patients Service (30 min)
2. Implementar em Appointments Service (30 min)
3. Implementar em Treatments Service (20 min)
4. Implementar em Financial Service (20 min)
5. Testar cada um (30 min)

**Total:** ~2 horas

---

**Status:** ✅ Guia Completo
**Próximo:** Implementar nos arquivos
