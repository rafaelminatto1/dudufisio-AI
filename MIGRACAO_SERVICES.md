# Migração de Services do _OLD_PROJECT

Data: 2025-01-XX

## ✅ Services Migrados

### 1. AppointmentService (Melhorado)
**Arquivo:** `src/lib/services/appointments/appointmentService.ts`

**Melhorias adicionadas:**
- ✅ Filtro por status
- ✅ Método `getById()` para buscar agendamento único
- ✅ Método `deleteAppointment()` para deletar agendamentos
- ✅ Método `getStats()` para estatísticas de agendamentos
- ✅ Suporte para Date ou string em filtros de data
- ✅ Melhor tratamento de erros

**Funcionalidades:**
```typescript
// Buscar agendamentos com filtros
AppointmentService.getAppointments({
  patientId?: string;
  therapistId?: string;
  status?: string;
  startDate?: Date | string;
  endDate?: Date | string;
})

// Buscar por ID
AppointmentService.getById(id: string)

// Criar agendamento
AppointmentService.createAppointment(data: AppointmentInsert)

// Atualizar agendamento
AppointmentService.updateAppointment(id: string, updates: AppointmentUpdate)

// Deletar agendamento
AppointmentService.deleteAppointment(id: string)

// Cancelar agendamento
AppointmentService.cancelAppointment(id: string, reason?: string)

// Estatísticas
AppointmentService.getStats(filters?: {...})
```

### 2. SOAPNoteService (Novo)
**Arquivo:** `src/lib/services/treatments/soapNoteService.ts`

**Funcionalidades:**
- ✅ Criar nota SOAP (evolução de sessão)
- ✅ Buscar notas por tratamento
- ✅ Buscar notas por paciente
- ✅ Buscar nota por ID
- ✅ Atualizar nota SOAP
- ✅ Deletar nota SOAP

### 3. AnalyticsService (Novo)
**Arquivo:** `src/lib/services/analytics/analyticsService.ts`

**Funcionalidades:**
- ✅ Estatísticas do dashboard (appointments, patients, financial)
- ✅ Tendência de agendamentos (últimos N dias)
- ✅ Tendência de receita (últimos N dias)
- ✅ Métricas agrupadas por período (hoje, semana, mês, ano)

**Uso:**
```typescript
// Estatísticas do dashboard
AnalyticsService.getDashboardStats()

// Tendência de agendamentos
AnalyticsService.getAppointmentsTrend(days: number)

// Tendência de receita
AnalyticsService.getRevenueTrend(days: number)
```

### 4. ClinicalMaterialService (Novo)
**Arquivo:** `src/lib/services/clinical/clinicalMaterialService.ts`

**Funcionalidades:**
- ✅ Gestão de categorias de materiais
- ✅ Buscar materiais por categoria
- ✅ Busca avançada de materiais (query, tags, status)
- ✅ CRUD completo de materiais
- ✅ Estatísticas de materiais

**Uso:**
```typescript
// Buscar categorias
ClinicalMaterialService.getCategories()

// Buscar materiais por categoria
ClinicalMaterialService.getMaterialsByCategory(categoryId: string)

// Buscar materiais
ClinicalMaterialService.searchMaterials({
  query?: string;
  categoryId?: string;
  tags?: string[];
  status?: 'draft' | 'published' | 'archived';
  limit?: number;
  offset?: number;
})

// CRUD
ClinicalMaterialService.getById(id: string)
ClinicalMaterialService.create(data: MaterialCreateData)
ClinicalMaterialService.update(id: string, updates: Partial<MaterialCreateData>)
ClinicalMaterialService.delete(id: string)
ClinicalMaterialService.getStats()
```

**Uso:**
```typescript
// Criar nota SOAP
SOAPNoteService.create({
  treatment_id: string;
  patient_id: string;
  therapist_id: string;
  subjective?: string;
  objective?: string;
  assessment?: string;
  plan?: string;
})

// Buscar por tratamento
SOAPNoteService.getByTreatment(treatmentId: string)

// Buscar por paciente
SOAPNoteService.getByPatient(patientId: string)

// Buscar por ID
SOAPNoteService.getById(id: string)

// Atualizar
SOAPNoteService.update(id: string, updates: Partial<SOAPNoteData>)

// Deletar
SOAPNoteService.delete(id: string)
```

### 3. PatientsService (Novo)
**Arquivo:** `src/lib/services/patients/patients.service.ts`

**Funcionalidades:**
- ✅ Listar pacientes com filtros
- ✅ Buscar paciente por ID
- ✅ Criar paciente
- ✅ Atualizar paciente
- ✅ Deletar paciente
- ✅ Estatísticas de pacientes

## 📋 Services Prioritários para Migração Futura

### Alta Prioridade

#### Agenda
- [ ] `agendaExportService.ts` - Exportação de agenda (PDF, Excel)
- [ ] `appointmentTemplateService.ts` - Templates de agendamento
- [ ] `availabilityService.ts` - Gestão de disponibilidade
- [ ] `calendarSyncService.ts` - Sincronização com calendários externos

#### Clínico
- [ ] `clinicalMaterialService.ts` - Materiais clínicos (biblioteca)
- [ ] `clinicalContentService.ts` - Conteúdo clínico
- [ ] `bodyMapService.ts` - Mapa corporal interativo
- [ ] `exerciseLibraryService.ts` - Biblioteca de exercícios

#### Comunicação
- [ ] `whatsapp/` - Integração WhatsApp completa (já existe básico)
- [ ] `email/` - Serviços de email avançados
- [ ] `notifications/` - Sistema de notificações push

### Média Prioridade

#### Analytics
- [ ] `analytics/` - Sistema completo de analytics e BI
- [ ] `dashboardService.ts` - Dashboard com métricas

#### Financeiro
- [ ] `financialService.ts` - Serviços financeiros avançados
- [ ] `payment/` - Processamento de pagamentos

#### Gamificação
- [ ] `gamification/` - Sistema completo (já existe básico)
- [ ] `leaderboardService.ts` - Ranking de pacientes

### Baixa Prioridade

- [ ] `protocolService.ts` - Protocolos de tratamento
- [ ] `reportService.ts` - Relatórios
- [ ] `videoLibraryService.ts` - Biblioteca de vídeos
- [ ] `aiSchedulingService.ts` - Agendamento inteligente com IA

## 🔧 Adaptações Necessárias

### Padrões de Migração

1. **Substituir imports:**
   ```typescript
   // Antigo (Vite)
   import { supabase } from '@/lib/supabaseClient';
   
   // Novo (Next.js)
   import { createServerComponentClient } from '~/lib/supabase/server';
   ```

2. **Remover referências a `import.meta.env`:**
   ```typescript
   // Antigo
   import.meta.env.VITE_SUPABASE_URL
   
   // Novo
   process.env.NEXT_PUBLIC_SUPABASE_URL
   ```

3. **Adaptar para Server Components:**
   - Usar `createServerComponentClient()` para Server Components
   - Usar `createServerActionClient()` para Server Actions
   - Usar `createClient()` para Client Components

4. **Remover dependências de React Router:**
   - Substituir `useNavigate()` por `useRouter()` do Next.js
   - Adaptar rotas para App Router

5. **Tipos do Database:**
   - Usar tipos gerados do Supabase: `Database['public']['Tables']['table_name']['Row']`
   - Remover tipos manuais quando possível

## 📝 Próximos Passos

1. ✅ Melhorar AppointmentService - **CONCLUÍDO**
2. ✅ Criar SOAPNoteService - **CONCLUÍDO**
3. ✅ Criar AnalyticsService - **CONCLUÍDO**
4. ✅ Migrar ClinicalMaterialService - **CONCLUÍDO**
5. ⏳ Adicionar componentes shadcn/ui (form, calendar) quando necessário
6. ⏳ Adaptar componentes do _OLD_PROJECT para Next.js App Router
7. ⏳ Migrar services de comunicação avançados (WhatsApp, Email)

## 🎯 Status Geral

- **Services Migrados:** 5/100+
- **Progresso:** ~5%
- **Próxima Prioridade:** Adaptar componentes do _OLD_PROJECT e services de comunicação

