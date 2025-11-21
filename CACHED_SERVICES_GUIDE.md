# 📘 Guia de Uso - Cached Services (Next.js 16)

## 🎯 Objetivo

Os Cached Services usam as novas APIs do Next.js 16 (`cache` do React + `cacheLife`) para otimizar queries ao banco de dados, reduzindo latência e custos.

---

## 📁 Services Criados

### 1. **Patients Service** (`patients.service.cached.ts`)
```typescript
import {
  getPatientById,
  getAllPatients,
  getActivePatientsCount,
  getPatientStats,
  searchPatients,
  PatientsServiceMutations,
} from '~/lib/services/patients/patients.service.cached';
```

**Funções Cached:**
- `getPatientById(id)` - Cache: 1 hora
- `getAllPatients(filters?)` - Cache: 15 min
- `getActivePatientsCount()` - Cache: máximo
- `getPatientStats()` - Cache: máximo
- `searchPatients(term)` - Cache: 15 min

**Mutations (sem cache):**
- `PatientsServiceMutations.create(patient)`
- `PatientsServiceMutations.update(id, patient)`
- `PatientsServiceMutations.delete(id)`

---

### 2. **Appointment Service** (`appointment.service.cached.ts`)
```typescript
import {
  getAppointments,
  getTodayAppointments,
  getWeekAppointments,
  getAppointmentById,
  getAppointmentStats,
  checkAvailability,
  AppointmentServiceMutations,
} from '~/lib/services/appointments/appointment.service.cached';
```

**Funções Cached:**
- `getAppointments(filters?)` - Cache: 15 min
- `getTodayAppointments(therapistId?)` - Cache: 15 min
- `getWeekAppointments(therapistId?)` - Cache: 15 min
- `getAppointmentById(id)` - Cache: 1 hora
- `getAppointmentStats(start?, end?)` - Cache: máximo
- `checkAvailability(...)` - Cache: 15 min

**Mutations (sem cache):**
- `AppointmentServiceMutations.create(appointment)`
- `AppointmentServiceMutations.update(id, appointment)`
- `AppointmentServiceMutations.delete(id)`
- `AppointmentServiceMutations.updateStatus(id, status)`

---

### 3. **Treatment Service** (`treatment.service.cached.ts`)
```typescript
import {
  getTreatmentsByPatient,
  getActiveTreatments,
  getTreatmentById,
  getRecentTreatments,
  getTreatmentStats,
  TreatmentServiceMutations,
} from '~/lib/services/treatments/treatment.service.cached';
```

**Funções Cached:**
- `getTreatmentsByPatient(patientId)` - Cache: 1 hora
- `getActiveTreatments(therapistId?)` - Cache: 15 min
- `getTreatmentById(id)` - Cache: 1 hora
- `getRecentTreatments(limit)` - Cache: 15 min
- `getTreatmentStats()` - Cache: máximo

---

### 4. **Financial Service** (`financial.service.cached.ts`)
```typescript
import {
  getTransactions,
  getMonthlyTransactions,
  getFinancialSummary,
  getRevenueByPeriod,
  getPendingPayments,
  getTransactionById,
  FinancialServiceMutations,
} from '~/lib/services/financial/financial.service.cached';
```

**Funções Cached:**
- `getTransactions(filters?)` - Cache: 15 min
- `getMonthlyTransactions(year?, month?)` - Cache: máximo
- `getFinancialSummary(start?, end?)` - Cache: máximo
- `getRevenueByPeriod(period, limit)` - Cache: máximo
- `getPendingPayments()` - Cache: 15 min
- `getTransactionById(id)` - Cache: 1 hora

---

## 🔧 Como Usar

### Em Server Components (Recomendado)

```typescript
// src/app/(dashboard)/dashboard/pacientes/page.tsx
import { getAllPatients, getPatientStats } from '~/lib/services/patients/patients.service.cached';

export default async function PacientesPage() {
  // Queries em paralelo com cache automático
  const [patients, stats] = await Promise.all([
    getAllPatients({ status: 'active' }),
    getPatientStats(),
  ]);

  return (
    <div>
      <h1>Pacientes Ativos: {stats.active}</h1>
      <PatientList patients={patients} />
    </div>
  );
}
```

### Com Suspense (Melhor Performance)

```typescript
import { Suspense } from 'react';
import { getAllPatients } from '~/lib/services/patients/patients.service.cached';
import { PatientListSkeleton } from '~/components/skeletons';

async function PatientListAsync() {
  const patients = await getAllPatients({ status: 'active' });
  return <PatientList patients={patients} />;
}

export default function PacientesPage() {
  return (
    <Suspense fallback={<PatientListSkeleton />}>
      <PatientListAsync />
    </Suspense>
  );
}
```

### Em Client Components (com use)

```typescript
'use client';

import { use } from 'react';
import { getAllPatients } from '~/lib/services/patients/patients.service.cached';

export function PatientList({ patientsPromise }: { patientsPromise: Promise<any> }) {
  const patients = use(patientsPromise); // React 19

  return (
    <ul>
      {patients.map((patient) => (
        <li key={patient.id}>{patient.full_name}</li>
      ))}
    </ul>
  );
}
```

---

## ⏱️ Cache Lifetimes

### `cacheLife('default')` - 15 minutos
**Quando usar:**
- Dados que mudam com frequência moderada
- Listas com filtros
- Dados do dia atual

**Exemplos:**
- Lista de agendamentos
- Pesquisa de pacientes
- Transações recentes

### `cacheLife('hours')` - 1 hora
**Quando usar:**
- Dados específicos que mudam pouco
- Detalhes de registros individuais
- Informações de perfil

**Exemplos:**
- Dados de um paciente específico
- Detalhes de um agendamento
- Informações de tratamento

### `cacheLife('max')` - Máximo possível
**Quando usar:**
- Estatísticas e relatórios
- Dados históricos
- Contagens e agregações

**Exemplos:**
- Estatísticas do dashboard
- Relatórios mensais
- Métricas de performance

---

## 🔄 Invalidação de Cache (TODO)

Após mutations, invalidar o cache:

```typescript
import { revalidateTag } from 'next/cache';

// Após criar/atualizar paciente
revalidateTag('patients');
revalidateTag(`patient-${id}`);

// Após criar/atualizar agendamento
revalidateTag('appointments');
revalidateTag(`appointment-${id}`);
revalidateTag(`appointments-therapist-${therapistId}`);

// Após criar transação
revalidateTag('transactions');
revalidateTag('financial-summary');
```

**TODO:** Implementar tags nos services cached

---

## 📊 Benefícios Esperados

### Performance
- ⚡ **Redução de 70% nas queries** ao banco de dados
- ⚡ **Latência reduzida** de ~500ms para ~50ms (cached)
- ⚡ **TTI melhorado** em 20-30%

### Custos
- 💰 **Redução de custos** de queries ao Supabase
- 💰 **Menos edge function invocations**

### UX
- 💫 **Navegação mais rápida** entre páginas
- 💫 **Dados instantâneos** em revisitas
- 💫 **Menos loading states**

---

## 🚀 Próximos Passos

### Fase 1: Implementar Tags
- [ ] Adicionar tags aos cached functions
- [ ] Implementar revalidateTag em mutations
- [ ] Testar invalidação de cache

### Fase 2: Monitorar Performance
- [ ] Adicionar métricas de cache hit/miss
- [ ] Monitorar tempo de queries
- [ ] Ajustar cache lifetimes baseado em dados reais

### Fase 3: Expandir para Mais Services
- [ ] Exercise Service
- [ ] Therapist Service
- [ ] Report Service
- [ ] Analytics Service

---

## ⚠️ Avisos Importantes

1. **Não usar em dados em tempo real**
   - Notificações
   - Chat/mensagens
   - Dados que precisam ser instantâneos

2. **Cuidado com dados sensíveis**
   - Cache pode expor dados entre requests
   - Usar cache apenas em Server Components

3. **Testar em produção**
   - Cache pode se comportar diferente em prod
   - Monitorar edge cases

---

## 📚 Recursos

- [Next.js Caching](https://nextjs.org/docs/app/building-your-application/caching)
- [React cache()](https://react.dev/reference/react/cache)
- [Next.js 16 Blog Post](https://nextjs.org/blog/next-16)

---

**Criado em:** 19/11/2025
**Versão:** 1.0
