# 🚀 Próximos Passos - Planejamento de Implementação

**Data:** 19/11/2025
**Período:** 4 semanas
**Objetivo:** Implementar todas as otimizações avançadas e testar em produção

---

## 📅 CRONOGRAMA GERAL

```
Semana 1 (19-25 Nov): Implementações Imediatas + Testes Staging
Semana 2 (26 Nov - 2 Dez): useOptimistic + Cache Tags
Semana 3 (3-9 Dez): Streaming SSR Completo + Skeletons
Semana 4 (10-16 Dez): PPR + Monitoramento + Deploy Produção
```

---

## 🎯 SEMANA 1: Implementações Imediatas (19-25 Nov)

### DIA 1: Configurações Base (1-2 horas)
- [x] ✅ Configurar Turbopack no package.json
- [x] ✅ Criar script dev:turbo
- [ ] Configurar Playwright para testes E2E
- [ ] Setup do ambiente de staging na Vercel

### DIA 2: Testes Automatizados (2-3 horas)
- [ ] Criar testes Playwright para Agenda
- [ ] Criar testes Playwright para Tratamentos
- [ ] Criar testes Playwright para Financeiro
- [ ] Criar testes de Web Vitals

### DIA 3: Deploy Staging (1-2 horas)
- [ ] Deploy para Vercel staging
- [ ] Verificar métricas no Vercel Analytics
- [ ] Testar manualmente todas as páginas
- [ ] Validar Web Vitals em produção

### DIA 4: Ajustes e Correções (2-3 horas)
- [ ] Corrigir bugs encontrados
- [ ] Otimizar cache lifetimes baseado em métricas
- [ ] Ajustar skeletons se necessário

### DIA 5: Documentação e Review (1 hora)
- [ ] Documentar descobertas
- [ ] Criar relatório de performance
- [ ] Preparar para Semana 2

**Total Semana 1:** 7-11 horas

---

## 🎯 SEMANA 2: useOptimistic + Cache Tags (26 Nov - 2 Dez)

### DIA 1: Implementar useOptimistic - AgendaCalendar (3-4 horas)
**Prioridade:** 🔥 Alta

**Tarefas:**
1. Refatorar AgendaCalendar para usar useOptimistic
2. Implementar atualização otimista de status
3. Implementar criação otimista de agendamentos
4. Implementar deleção otimista
5. Adicionar feedback visual durante pending
6. Testar todos os cenários (sucesso, erro, rollback)

**Arquivo:** `src/app/(dashboard)/dashboard/agenda/_components/agenda-calendar.tsx`

**Teste:** Playwright para validar rollback em erros

### DIA 2: useOptimistic - Outros Componentes (3-4 horas)

**Componentes:**
1. ✅ TreatmentsLayout - Status de tratamentos
2. ✅ FinancialDashboard - Status de pagamentos
3. ✅ PatientList - Edições inline

**Pattern:**
```typescript
const [optimisticData, updateOptimistic] = useOptimistic(data);
```

### DIA 3-4: Cache Tags e Revalidation (4-5 horas)
**Prioridade:** 🔥 Alta

**Implementar em:**
1. ✅ Patients Service - Tags: 'patients', 'patient-{id}'
2. ✅ Appointments Service - Tags: 'appointments', 'appointment-{id}'
3. ✅ Treatments Service - Tags: 'treatments', 'treatment-{id}'
4. ✅ Financial Service - Tags: 'transactions', 'transaction-{id}'

**Pattern:**
```typescript
export const getPatientById = cache(async (id: string) => {
  'use cache';
  cacheLife('hours');
  cacheTag('patients', `patient-${id}`);

  // ... fetch logic
});

// Em mutations:
export async function updatePatient(id: string, data: any) {
  await supabase.from('patients').update(data).eq('id', id);
  revalidateTag(`patient-${id}`);
  revalidateTag('patients');
}
```

### DIA 5: Testes e Validação (2 horas)
- [ ] Testar invalidação de cache
- [ ] Verificar que cache está sendo revalidado
- [ ] Playwright tests para cache
- [ ] Documentar cache strategy

**Total Semana 2:** 12-15 horas

---

## 🎯 SEMANA 3: Streaming SSR Completo (3-9 Dez)

### DIA 1-2: Criar Skeletons Adicionais (3-4 horas)

**Novos Skeletons:**
1. ✅ `<PacientesListSkeleton />` - Lista de pacientes
2. ✅ `<ExerciseListSkeleton />` - Lista de exercícios
3. ✅ `<ProfileSkeleton />` - Perfil do usuário
4. ✅ `<SettingsSkeleton />` - Configurações
5. ✅ `<ReportSkeleton />` - Relatórios
6. ✅ `<AdminDashboardSkeleton />` - Admin dashboard

**Arquivo:** Expandir `src/components/skeletons/index.tsx`

### DIA 3-4: Implementar Streaming SSR (4-5 horas)

**Páginas a Otimizar:**
1. ✅ `/dashboard/pacientes` - Lista de pacientes
2. ✅ `/dashboard/pacientes/[id]` - Detalhes do paciente
3. ✅ `/dashboard/exercicios` - Biblioteca de exercícios
4. ✅ `/admin/users` - Gerenciamento de usuários
5. ✅ `/admin/kpis` - Dashboard de KPIs

**Pattern para cada página:**
```typescript
async function DataAsync() {
  const data = await getCachedData();
  return <Component data={data} />;
}

export default function Page() {
  return (
    <>
      <Header /> {/* Imediato */}
      <Suspense fallback={<Skeleton />}>
        <DataAsync /> {/* Streaming */}
      </Suspense>
    </>
  );
}
```

### DIA 5: Testes de Performance (2-3 horas)
- [ ] Lighthouse CI para todas as páginas
- [ ] Comparar métricas antes/depois
- [ ] Ajustar onde necessário
- [ ] Documentar resultados

**Total Semana 3:** 9-12 horas

---

## 🎯 SEMANA 4: PPR + Deploy Produção (10-16 Dez)

### DIA 1-2: Partial Prerendering (PPR) (4-5 horas)
**Prioridade:** 🟡 Média (Experimental)

**Configurar PPR:**
```typescript
// next.config.mjs
experimental: {
  ppr: 'incremental',
}

// Em páginas específicas
export const experimental_ppr = true;
```

**Páginas Candidatas:**
1. Dashboard principal
2. Landing page (se houver)
3. Páginas estáticas com seções dinâmicas

**Pattern:**
```typescript
export const experimental_ppr = true;

export default function DashboardPage() {
  return (
    <>
      <StaticHeader /> {/* Pre-renderizado */}
      <Suspense fallback={<Skeleton />}>
        <DynamicContent /> {/* Streaming */}
      </Suspense>
    </>
  );
}
```

### DIA 3: Monitoramento Avançado (2-3 horas)

**Implementar:**
1. ✅ Custom Web Vitals reporting para API
2. ✅ Cache hit/miss metrics
3. ✅ Error tracking melhorado (Sentry)
4. ✅ Performance budgets

**Criar:**
```typescript
// src/lib/monitoring/performance.ts
export function trackCacheHit(service: string, hit: boolean) {
  // Enviar para analytics
}

export function trackWebVital(metric: Metric) {
  // Enviar para API custom
  fetch('/api/analytics/vitals', {
    method: 'POST',
    body: JSON.stringify(metric),
  });
}
```

### DIA 4: Preparação para Produção (2 horas)
- [ ] Review completo do código
- [ ] Verificar todos os TODOs
- [ ] Atualizar documentação
- [ ] Criar checklist de deploy

### DIA 5: Deploy Produção (2-3 horas)
- [ ] Deploy para produção
- [ ] Monitorar métricas em tempo real
- [ ] Verificar erros no Sentry
- [ ] Validar Web Vitals
- [ ] Criar relatório final

**Total Semana 4:** 10-13 horas

---

## 📋 CHECKLISTS DETALHADOS

### ✅ Checklist: Configurar Turbopack
- [x] Adicionar script `dev:turbo` ao package.json
- [ ] Testar `npm run dev:turbo`
- [ ] Verificar hot reload (deve ser 5-10x mais rápido)
- [ ] Documentar diferenças de comportamento (se houver)
- [ ] Atualizar README com instruções

### ✅ Checklist: Implementar useOptimistic
- [ ] Identificar todos os componentes que precisam
- [ ] Refatorar AgendaCalendar primeiro
- [ ] Adicionar testes Playwright
- [ ] Testar cenários de erro
- [ ] Validar rollback automático
- [ ] Documentar padrão usado

### ✅ Checklist: Cache Tags
- [ ] Adicionar tags em todos os cached services
- [ ] Implementar revalidateTag em mutations
- [ ] Testar invalidação funciona
- [ ] Criar helper function para tags
- [ ] Documentar estratégia de tags

### ✅ Checklist: Streaming SSR
- [ ] Criar skeletons para todas as páginas
- [ ] Refatorar páginas para streaming
- [ ] Testar loading states
- [ ] Verificar hydration errors
- [ ] Medir impacto no FCP/LCP

### ✅ Checklist: Testes Playwright
- [ ] Configurar Playwright
- [ ] Criar testes de navegação
- [ ] Criar testes de formulários
- [ ] Criar testes de Web Vitals
- [ ] Configurar CI/CD

### ✅ Checklist: Deploy Staging
- [ ] Criar ambiente staging na Vercel
- [ ] Configurar variáveis de ambiente
- [ ] Deploy automático de branches
- [ ] Verificar Vercel Analytics
- [ ] Testar em dispositivos móveis

### ✅ Checklist: PPR
- [ ] Ler documentação do Next.js PPR
- [ ] Habilitar experimentalmente
- [ ] Testar em páginas específicas
- [ ] Medir impacto
- [ ] Decidir se vale a pena (ainda experimental)

### ✅ Checklist: Deploy Produção
- [ ] Review de segurança
- [ ] Backup do banco de dados
- [ ] Testar em staging
- [ ] Deploy gradual (canary)
- [ ] Monitorar métricas
- [ ] Rollback plan preparado

---

## 🔧 IMPLEMENTAÇÕES DETALHADAS

### 1. Configurar Turbopack no package.json

**Arquivo:** `package.json`

```json
{
  "scripts": {
    "dev": "next dev",
    "dev:turbo": "next dev --turbo",
    "build": "next build",
    "build:turbo": "next build --turbo",
    "start": "next start"
  }
}
```

**Uso:**
```bash
npm run dev:turbo  # 5-10x mais rápido
```

**Verificar:**
- Hot reload deve ser instantâneo
- Build incremental mais rápido
- Pode ter pequenas diferenças de comportamento

---

### 2. Implementar useOptimistic no AgendaCalendar

**Arquivo:** `src/app/(dashboard)/dashboard/agenda/_components/agenda-calendar.tsx`

**Mudanças principais:**

```typescript
'use client';

import { useOptimistic, useTransition } from 'react';

export function AgendaCalendar({ initialAppointments, patients, therapists }) {
  const [isPending, startTransition] = useTransition();

  // Substituir useState por useOptimistic
  const [optimisticAppointments, updateOptimisticAppointments] = useOptimistic(
    initialAppointments,
    (state, action: {
      type: 'create' | 'update' | 'delete';
      appointment?: any;
      id?: string;
    }) => {
      switch (action.type) {
        case 'create':
          return [...state, action.appointment];
        case 'update':
          return state.map(apt =>
            apt.id === action.appointment.id ? action.appointment : apt
          );
        case 'delete':
          return state.filter(apt => apt.id !== action.id);
        default:
          return state;
      }
    }
  );

  const handleSaveAppointment = async (formData: FormData) => {
    const tempAppointment = {
      id: selectedAppointment?.id || `temp-${Date.now()}`,
      patient_id: formData.get('patient_id'),
      start_time: formData.get('start_time'),
      end_time: formData.get('end_time'),
      status: 'scheduled',
      // ... outros campos
    };

    // 1. Atualização otimista (UI instantânea)
    startTransition(() => {
      if (selectedAppointment) {
        updateOptimisticAppointments({
          type: 'update',
          appointment: tempAppointment
        });
      } else {
        updateOptimisticAppointments({
          type: 'create',
          appointment: tempAppointment
        });
      }
    });

    // 2. Fechar modal imediatamente (melhor UX)
    setIsFormOpen(false);

    // 3. Atualização real no servidor
    try {
      const { createAppointment, updateAppointment } = await import('../actions');

      let result;
      if (selectedAppointment) {
        result = await updateAppointment(selectedAppointment.id, formData);
      } else {
        result = await createAppointment(formData);
      }

      if (!result.success) {
        // React reverte automaticamente a mudança otimista
        alert(result.error || 'Erro ao salvar agendamento');
      }
    } catch (error) {
      // React reverte automaticamente em caso de erro
      console.error('Erro:', error);
      alert('Erro ao salvar agendamento');
    }
  };

  const handleDeleteAppointment = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir?')) return;

    // 1. Atualização otimista (remove da UI imediatamente)
    startTransition(() => {
      updateOptimisticAppointments({ type: 'delete', id });
    });

    // 2. Deleção real
    try {
      const { deleteAppointment } = await import('../actions');
      const result = await deleteAppointment(id);

      if (!result.success) {
        // React reverte automaticamente
        alert(result.error || 'Erro ao excluir');
      }
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao excluir agendamento');
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    const appointment = optimisticAppointments.find(a => a.id === id);
    if (!appointment) return;

    // 1. Atualização otimista
    startTransition(() => {
      updateOptimisticAppointments({
        type: 'update',
        appointment: { ...appointment, status: newStatus }
      });
    });

    // 2. Atualização real
    try {
      const { updateAppointmentStatus } = await import('../actions');
      const result = await updateAppointmentStatus(id, newStatus);

      if (!result.success) {
        alert(result.error);
      }
    } catch (error) {
      console.error('Erro:', error);
    }
  };

  return (
    <div className={isPending ? 'opacity-70 pointer-events-none' : ''}>
      {/* Usar optimisticAppointments em todos os lugares */}
      <WeeklyView
        appointments={optimisticAppointments}
        onEdit={handleEditAppointment}
        onDelete={handleDeleteAppointment}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
}
```

**Benefícios:**
- ✅ UI atualiza instantaneamente
- ✅ Não precisa mais de `window.location.reload()`
- ✅ Rollback automático em erros
- ✅ Melhor UX com feedback imediato

---

### 3. Adicionar Cache Tags

**Atualizar Services Cached:**

```typescript
// src/lib/services/patients/patients.service.cached.ts
import { unstable_cacheTag as cacheTag } from 'next/cache';
import { revalidateTag } from 'next/cache';

export const getPatientById = cache(async (id: string) => {
  'use cache';
  cacheLife('hours');
  cacheTag('patients', `patient-${id}`); // Adicionar tags

  const supabase = await createServerComponentClient();
  const { data, error } = await supabase
    .from('patients')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
});

// Mutations com revalidation
export class PatientsServiceMutations {
  static async update(id: string, patient: PatientUpdate) {
    const supabase = await createServerComponentClient();
    const { data, error } = await supabase
      .from('patients')
      .update(patient)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Invalidar cache específico
    revalidateTag(`patient-${id}`);
    revalidateTag('patients'); // Lista de pacientes

    return data;
  }

  static async create(patient: PatientInsert) {
    // ... insert logic

    // Invalidar apenas lista
    revalidateTag('patients');

    return data;
  }

  static async delete(id: string) {
    // ... delete logic

    // Invalidar ambos
    revalidateTag(`patient-${id}`);
    revalidateTag('patients');

    return true;
  }
}
```

**Fazer o mesmo para:**
- Appointments Service
- Treatments Service
- Financial Service

---

### 4. Criar Skeletons Adicionais

**Expandir:** `src/components/skeletons/index.tsx`

```typescript
// Adicionar novos skeletons

export function PacientesListSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <Card key={i}>
          <CardHeader>
            <div className="flex items-center space-x-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-[180px]" />
                <Skeleton className="h-3 w-[140px]" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-full mb-2" />
            <Skeleton className="h-6 w-[120px]" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function ExerciseListSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="border rounded-lg p-4">
          <div className="flex items-start space-x-4">
            <Skeleton className="h-20 w-20 rounded" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-[200px]" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-[80%]" />
              <div className="flex gap-2 mt-2">
                <Skeleton className="h-6 w-16 rounded-full" />
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function AdminDashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-4 w-[120px]" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-[100px]" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Chart */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-[200px]" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>

      {/* Table */}
      <TableSkeleton rows={8} columns={5} />
    </div>
  );
}
```

---

### 5. Testes Playwright

**Criar:** `e2e/agenda.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('Agenda - Performance Tests', () => {
  test('should load agenda page with good Web Vitals', async ({ page }) => {
    // Monitorar Web Vitals
    const vitals: any[] = [];

    await page.evaluateOnNewDocument(() => {
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          (window as any).vitals = (window as any).vitals || [];
          (window as any).vitals.push({
            name: entry.name,
            value: entry.value,
          });
        }
      }).observe({ entryTypes: ['paint', 'largest-contentful-paint'] });
    });

    // Navegar para agenda
    await page.goto('/dashboard/agenda');

    // Verificar que página carregou
    await expect(page.locator('h1')).toContainText('Agenda');

    // Aguardar conteúdo dinâmico
    await page.waitForSelector('[data-testid="agenda-calendar"]', {
      timeout: 5000,
    });

    // Obter Web Vitals
    const pageVitals = await page.evaluate(() => (window as any).vitals);

    // Verificar FCP < 1.8s
    const fcp = pageVitals.find((v: any) => v.name === 'first-contentful-paint');
    expect(fcp.value).toBeLessThan(1800);

    // Verificar LCP < 2.5s
    const lcp = pageVitals.find((v: any) => v.name === 'largest-contentful-paint');
    expect(lcp.value).toBeLessThan(2500);
  });

  test('should update appointment status optimistically', async ({ page }) => {
    await page.goto('/dashboard/agenda');

    // Encontrar primeiro agendamento
    const appointment = page.locator('[data-testid="appointment-card"]').first();

    // Clicar em "Completar"
    await appointment.locator('button', { hasText: 'Completar' }).click();

    // Verificar que UI atualizou imediatamente (< 100ms)
    const startTime = Date.now();
    await expect(appointment.locator('[data-status="completed"]')).toBeVisible();
    const updateTime = Date.now() - startTime;

    expect(updateTime).toBeLessThan(100); // UI otimista deve ser instantânea
  });
});

test.describe('Agenda - useOptimistic Tests', () => {
  test('should rollback on error', async ({ page, context }) => {
    // Simular erro de rede
    await context.route('**/api/**', (route) => {
      route.abort('failed');
    });

    await page.goto('/dashboard/agenda');

    const appointment = page.locator('[data-testid="appointment-card"]').first();
    const originalStatus = await appointment.getAttribute('data-status');

    // Tentar atualizar
    await appointment.locator('button', { hasText: 'Completar' }).click();

    // Verificar que voltou ao estado original após erro
    await page.waitForTimeout(1000);
    const currentStatus = await appointment.getAttribute('data-status');

    expect(currentStatus).toBe(originalStatus); // Deve ter revertido
  });
});
```

---

## 📊 MÉTRICAS DE SUCESSO

### Semana 1
- [ ] Turbopack configurado e funcionando
- [ ] Testes Playwright criados e passando
- [ ] Deploy staging bem-sucedido
- [ ] Métricas baseline capturadas

### Semana 2
- [ ] useOptimistic em AgendaCalendar funcionando
- [ ] Cache tags implementados em todos os services
- [ ] Invalidação de cache testada e funcionando
- [ ] UI instantânea sem reloads

### Semana 3
- [ ] 6+ novos skeletons criados
- [ ] 5+ páginas com Streaming SSR
- [ ] FCP reduzido em 30-40% nas novas páginas
- [ ] LCP reduzido em 20-30%

### Semana 4
- [ ] PPR testado (se estável)
- [ ] Monitoramento avançado implementado
- [ ] Deploy produção bem-sucedido
- [ ] Relatório final com métricas

---

## 🚀 COMO COMEÇAR

### Agora Mesmo (15 min)
```bash
# 1. Configurar Turbopack
npm run dev:turbo

# 2. Testar se está mais rápido
# Deve ver: "✓ Turbopack (Experimental)"
```

### Hoje (2-3 horas)
1. Implementar useOptimistic no AgendaCalendar
2. Testar manualmente
3. Criar PR para review

### Esta Semana
1. Configurar Playwright
2. Deploy para staging
3. Começar cache tags

---

**Pronto para começar?** Me diga qual etapa você quer que eu implemente primeiro! 🚀
