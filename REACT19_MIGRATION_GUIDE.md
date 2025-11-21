# 🚀 Guia de Migração para React 19 Features

## 📋 O Que Mudou no React 19

React 19 traz novos hooks e APIs que melhoram significativamente a experiência do desenvolvedor e a performance:

1. **`useOptimistic`** - Atualizações otimistas de UI
2. **`use()`** - Hook para consumir Promises e Context
3. **Form Actions** - Actions nativas em formulários
4. **`useFormStatus`** - Status de formulários
5. **Melhorias em Suspense** - Mais estável e previsível

---

## 1. useOptimistic - Atualizações Instantâneas

### O Que É?
Hook que permite atualizar a UI imediatamente enquanto uma ação assíncrona está em andamento. Se a ação falhar, o React reverte automaticamente.

### Quando Usar?
- Atualizar status de items (agendamentos, tarefas, etc.)
- Adicionar/remover items de listas
- Toggle de checkboxes
- Operações CRUD com feedback instantâneo

### Exemplo Básico

```typescript
'use client';

import { useOptimistic } from 'react';

function AppointmentCard({ appointment, onUpdateStatus }) {
  const [optimisticAppointment, updateOptimisticAppointment] = useOptimistic(
    appointment,
    (current, newStatus) => ({ ...current, status: newStatus })
  );

  async function handleUpdateStatus(newStatus: string) {
    // 1. Atualiza UI imediatamente (otimista)
    updateOptimisticAppointment(newStatus);

    // 2. Faz a atualização real no servidor
    try {
      await onUpdateStatus(appointment.id, newStatus);
      // Se sucesso, mantém a mudança otimista
    } catch (error) {
      // Se erro, React reverte automaticamente para o estado anterior
      console.error('Erro:', error);
    }
  }

  return (
    <div>
      <h3>{optimisticAppointment.patient_name}</h3>
      <p>Status: {optimisticAppointment.status}</p>
      <button onClick={() => handleUpdateStatus('completed')}>
        Completar
      </button>
    </div>
  );
}
```

### Implementação no AgendaCalendar

```typescript
// src/app/(dashboard)/dashboard/agenda/_components/agenda-calendar.tsx
'use client';

import { useOptimistic, useTransition } from 'react';

export function AgendaCalendar({ initialAppointments, ...props }: AgendaCalendarProps) {
  const [isPending, startTransition] = useTransition();

  // Substituir useState por useOptimistic
  const [optimisticAppointments, updateOptimisticAppointments] = useOptimistic(
    initialAppointments,
    (state, action: { type: 'update' | 'delete' | 'add'; payload: any }) => {
      switch (action.type) {
        case 'update':
          return state.map((apt) =>
            apt.id === action.payload.id ? action.payload : apt
          );
        case 'delete':
          return state.filter((apt) => apt.id !== action.payload.id);
        case 'add':
          return [...state, action.payload];
        default:
          return state;
      }
    }
  );

  const handleSaveAppointment = async (formData: FormData) => {
    const { createAppointment, updateAppointment } = await import('../actions');

    // Criar objeto temporário para UI otimista
    const tempAppointment = {
      id: selectedAppointment?.id || `temp-${Date.now()}`,
      patient_name: formData.get('patient_id'),
      start_time: formData.get('start_time'),
      status: 'scheduled',
      // ... outros campos
    };

    startTransition(() => {
      if (selectedAppointment) {
        updateOptimisticAppointments({
          type: 'update',
          payload: tempAppointment,
        });
      } else {
        updateOptimisticAppointments({
          type: 'add',
          payload: tempAppointment,
        });
      }
    });

    // Atualização real
    let result;
    if (selectedAppointment) {
      result = await updateAppointment(selectedAppointment.id, formData);
    } else {
      result = await createAppointment(formData);
    }

    if (!result.success) {
      // React reverte automaticamente a mudança otimista
      alert(result.error);
      return;
    }

    setIsFormOpen(false);
    // Não precisa mais de window.location.reload()!
  };

  const handleDeleteAppointment = async (id: string) => {
    startTransition(() => {
      updateOptimisticAppointments({ type: 'delete', payload: { id } });
    });

    const { deleteAppointment } = await import('../actions');
    const result = await deleteAppointment(id);

    if (!result.success) {
      alert(result.error);
      // React reverte automaticamente
    }
  };

  return (
    // Usar optimisticAppointments ao invés de appointments
    <WeeklyView appointments={optimisticAppointments} />
  );
}
```

---

## 2. use() Hook - Consumir Promises

### O Que É?
Hook que permite consumir Promises e Context de forma síncrona no código.

### Quando Usar?
- Consumir dados assíncronos em Client Components
- Simplificar data fetching
- Integrar com Suspense

### Exemplo

```typescript
'use client';

import { use, Suspense } from 'react';
import { getPatientById } from '~/lib/services/patients/patients.service.cached';

// Componente que consome Promise
function PatientDetails({ patientPromise }: { patientPromise: Promise<any> }) {
  const patient = use(patientPromise); // Espera a Promise resolver

  return (
    <div>
      <h2>{patient.full_name}</h2>
      <p>{patient.email}</p>
    </div>
  );
}

// Componente pai que passa a Promise
export function PatientPage({ patientId }: { patientId: string }) {
  const patientPromise = getPatientById(patientId);

  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <PatientDetails patientPromise={patientPromise} />
    </Suspense>
  );
}
```

### Vantagens
- Código mais limpo
- Melhor integração com Suspense
- Menos useState/useEffect
- Streaming SSR automático

---

## 3. Form Actions - Formulários Nativos

### O Que É?
Nova API para lidar com submissões de formulários de forma mais simples.

### Exemplo Antes (React 18)

```typescript
'use client';

function PatientForm() {
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPending(true);

    const formData = new FormData(e.target as HTMLFormElement);
    await createPatient(formData);

    setIsPending(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="name" required />
      <button disabled={isPending}>
        {isPending ? 'Salvando...' : 'Salvar'}
      </button>
    </form>
  );
}
```

### Exemplo Depois (React 19)

```typescript
'use client';

import { useTransition } from 'react';

function PatientForm({ onSubmit }: { onSubmit: (formData: FormData) => Promise<void> }) {
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (formData: FormData) => {
    startTransition(async () => {
      await onSubmit(formData);
    });
  };

  return (
    <form action={handleSubmit}>
      <input name="name" required />
      <button disabled={isPending}>
        {isPending ? 'Salvando...' : 'Salvar'}
      </button>
    </form>
  );
}
```

### Com useFormStatus

```typescript
'use client';

import { useFormStatus } from 'react-dom';

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button type="submit" disabled={pending}>
      {pending ? 'Salvando...' : 'Salvar'}
    </button>
  );
}

function PatientForm({ onSubmit }: { onSubmit: (formData: FormData) => Promise<void> }) {
  return (
    <form action={onSubmit}>
      <input name="name" required />
      <SubmitButton />
    </form>
  );
}
```

---

## 4. Checklist de Migração

### Componentes Prioritários para Migrar

#### Alta Prioridade
- [x] Criar exemplos de useOptimistic
- [ ] AgendaCalendar - useOptimistic para status de agendamentos
- [ ] TreatmentsLayout - useOptimistic para status de tratamentos
- [ ] FinancialDashboard - useOptimistic para pagamentos
- [ ] AppointmentFormModal - Form Actions

#### Média Prioridade
- [ ] PatientList - useOptimistic para edições inline
- [ ] ExerciseList - useOptimistic para reordenação
- [ ] PackagesManager - Form Actions

#### Baixa Prioridade
- [ ] Settings forms - Form Actions
- [ ] Profile forms - Form Actions

---

## 5. Padrões e Boas Práticas

### Padrão 1: Estado Otimista Complexo

```typescript
type Action =
  | { type: 'add'; payload: Item }
  | { type: 'update'; id: string; payload: Partial<Item> }
  | { type: 'delete'; id: string }
  | { type: 'reorder'; from: number; to: number };

const [optimisticItems, updateOptimisticItems] = useOptimistic(
  items,
  (state, action: Action) => {
    switch (action.type) {
      case 'add':
        return [...state, action.payload];
      case 'update':
        return state.map((item) =>
          item.id === action.id ? { ...item, ...action.payload } : item
        );
      case 'delete':
        return state.filter((item) => item.id !== action.id);
      case 'reorder':
        const newState = [...state];
        const [removed] = newState.splice(action.from, 1);
        newState.splice(action.to, 0, removed);
        return newState;
      default:
        return state;
    }
  }
);
```

### Padrão 2: Combinar useOptimistic com useTransition

```typescript
const [isPending, startTransition] = useTransition();
const [optimisticData, updateOptimisticData] = useOptimistic(data);

const handleUpdate = async (newData: any) => {
  startTransition(() => {
    // Atualização otimista
    updateOptimisticData(newData);
  });

  try {
    // Atualização real
    await updateData(newData);
  } catch (error) {
    // React reverte automaticamente
    console.error(error);
  }
};
```

### Padrão 3: Validação antes de Otimista

```typescript
const handleUpdate = async (newData: any) => {
  // Validação client-side antes de otimista
  const validation = validateData(newData);
  if (!validation.success) {
    alert(validation.error);
    return;
  }

  // Se válido, atualiza otimista
  startTransition(() => {
    updateOptimisticData(newData);
  });

  // Atualização servidor
  const result = await updateData(newData);
  if (!result.success) {
    // React reverte automaticamente
    alert(result.error);
  }
};
```

---

## 6. Benefícios Esperados

### Performance
- ⚡ **UI instantânea** - Sem delay em atualizações
- ⚡ **Menos re-renders** - useOptimistic otimiza renders
- ⚡ **Streaming melhor** - use() integra com Suspense

### Developer Experience
- 🚀 **Menos código** - Form Actions simplificam formulários
- 🚀 **Menos bugs** - Rollback automático em erros
- 🚀 **Melhor DX** - APIs mais intuitivas

### User Experience
- 💫 **Feedback instantâneo** - UI atualiza imediatamente
- 💫 **Menos frustração** - Não espera servidor para feedback
- 💫 **Mais confiável** - Reverte automaticamente em erros

---

## 7. Exemplos Completos

Veja os exemplos completos em:
- [src/components/examples/react19-useOptimistic-example.tsx](src/components/examples/react19-useOptimistic-example.tsx)

---

## 8. Próximos Passos

1. **Semana 1**: Migrar AgendaCalendar para useOptimistic
2. **Semana 2**: Migrar formulários para Form Actions
3. **Semana 3**: Implementar use() em data fetching
4. **Semana 4**: Revisar e otimizar

---

## 📚 Recursos

- [React 19 Blog Post](https://react.dev/blog/2024/12/05/react-19)
- [useOptimistic Docs](https://react.dev/reference/react/useOptimistic)
- [use() Hook Docs](https://react.dev/reference/react/use)
- [Form Actions Docs](https://react.dev/reference/react-dom/components/form)

---

**Criado em:** 19/11/2025
**Versão:** 1.0
