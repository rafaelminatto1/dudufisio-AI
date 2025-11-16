# 🔔 Guia de Integração - Push Notifications + Agendamentos

**Data**: 05 de Novembro de 2025
**Status**: ✅ Código completo, pronto para deploy

---

## 📋 O Que Foi Implementado

### 1. Serviço de Notificações de Agendamentos
**Arquivo**: `services/notifications/appointmentNotificationService.ts`

**Funcionalidades**:
- ✅ Notificação de confirmação (ao criar agendamento)
- ✅ Lembrete 24h antes da consulta
- ✅ Lembrete 2h antes da consulta
- ✅ Notificação de cancelamento
- ✅ Notificação de reagendamento
- ✅ Sistema de agendamento automático

### 2. Tabela de Agendamento de Lembretes
**Migration**: `supabase/migrations/20251105000006_create_notification_schedules.sql`

**Estrutura**:
```sql
notification_schedules
├── id (UUID)
├── appointment_id (UUID) → appointments(id)
├── user_id (UUID) → auth.users(id)
├── scheduled_for (TIMESTAMP) - Quando enviar
├── notification_type (TEXT) - Tipo de notificação
├── sent (BOOLEAN) - Já foi enviada?
├── sent_at (TIMESTAMP) - Quando foi enviada
├── metadata (JSONB) - Dados adicionais
└── created_at, updated_at
```

### 3. Edge Function de Processamento
**Arquivo**: `supabase/functions/process-appointment-reminders/index.ts`

**Função**: Processa lembretes pendentes e envia notificações

### 4. React Hook
**Arquivo**: `hooks/useAppointmentNotifications.ts`

**API**:
```typescript
const {
  sendConfirmation,
  scheduleReminders,
  sendCancellation,
  sendUpdate,
  isProcessing,
  error
} = useAppointmentNotifications();
```

---

## 🚀 Deploy (3 Passos)

### Passo 1: Aplicar Migration

```powershell
# Windows
cd supabase
npx supabase db push

# Ou via Dashboard SQL Editor:
# https://supabase.com/dashboard/project/urfxniitfbbvsaskicfo/sql
# Cole o conteúdo de 20251105000006_create_notification_schedules.sql
```

### Passo 2: Deploy da Edge Function

```powershell
# Deploy
npx supabase functions deploy process-appointment-reminders

# Verificar
npx supabase functions list
```

### Passo 3: Configurar Cron Job (Opcional)

Para processar lembretes automaticamente a cada 5 minutos:

```sql
-- Via Dashboard SQL Editor
SELECT cron.schedule(
  'process-appointment-reminders',
  '*/5 * * * *', -- A cada 5 minutos
  $$
  SELECT net.http_post(
    url:='https://urfxniitfbbvsaskicfo.supabase.co/functions/v1/process-appointment-reminders',
    headers:=jsonb_build_object(
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
    )
  );
  $$
);
```

---

## 💻 Como Usar na Aplicação

### Exemplo 1: Ao Criar Agendamento

```typescript
import { useAppointmentNotifications } from '../hooks/useAppointmentNotifications';

function AgendaPage() {
  const { sendConfirmation, scheduleReminders } = useAppointmentNotifications();

  const handleCreateAppointment = async (appointmentData: any) => {
    try {
      // 1. Criar agendamento no banco
      const { data: appointment, error } = await supabase
        .from('appointments')
        .insert(appointmentData)
        .select('*, patient:patients(*), therapist:therapists(*)')
        .single();

      if (error) throw error;

      // 2. Enviar notificação de confirmação
      await sendConfirmation(appointment);

      // 3. Agendar lembretes (24h e 2h antes)
      await scheduleReminders(appointment);

      toast.success('Agendamento criado! Notificações enviadas ✅');
    } catch (error) {
      console.error('Error creating appointment:', error);
      toast.error('Erro ao criar agendamento');
    }
  };

  return (
    // ... JSX
  );
}
```

### Exemplo 2: Ao Cancelar Agendamento

```typescript
const { sendCancellation } = useAppointmentNotifications();

const handleCancelAppointment = async (appointment: Appointment) => {
  try {
    // 1. Atualizar status no banco
    await supabase
      .from('appointments')
      .update({ status: 'cancelled' })
      .eq('id', appointment.id);

    // 2. Enviar notificação de cancelamento
    await sendCancellation(appointment);

    toast.success('Agendamento cancelado. Paciente notificado.');
  } catch (error) {
    console.error('Error canceling appointment:', error);
    toast.error('Erro ao cancelar agendamento');
  }
};
```

### Exemplo 3: Ao Reagendar

```typescript
const { sendUpdate } = useAppointmentNotifications();

const handleRescheduleAppointment = async (
  originalAppointment: Appointment,
  newData: Partial<Appointment>
) => {
  try {
    // 1. Atualizar no banco
    const { data: updatedAppointment } = await supabase
      .from('appointments')
      .update(newData)
      .eq('id', originalAppointment.id)
      .select('*, patient:patients(*), therapist:therapists(*)')
      .single();

    // 2. Notificar mudança
    await sendUpdate(originalAppointment, updatedAppointment);

    toast.success('Agendamento reagendado. Paciente notificado.');
  } catch (error) {
    console.error('Error rescheduling:', error);
    toast.error('Erro ao reagendar');
  }
};
```

---

## 🔧 Integração Automática com Service

Se preferir integração automática, modifique o `SupabaseAgendaService`:

```typescript
// services/database/supabaseAgendaService.ts

import { appointmentNotificationService } from '../notifications/appointmentNotificationService';

export class SupabaseAgendaService {
  /**
   * Create a new appointment (with notifications)
   */
  async createAppointment(appointment: Appointment): Promise<Appointment> {
    // ... código existente de criação ...

    const createdAppointment = /* resultado da criação */;

    // Automaticamente enviar notificações
    try {
      await appointmentNotificationService.sendAppointmentConfirmation(createdAppointment);
      await appointmentNotificationService.scheduleReminders(createdAppointment);
    } catch (notificationError) {
      console.error('Error sending notifications:', notificationError);
      // Não falha a operação se notificação falhar
    }

    return createdAppointment;
  }

  /**
   * Update appointment (with notifications)
   */
  async updateAppointment(
    id: string,
    updates: Partial<Appointment>,
    originalAppointment: Appointment
  ): Promise<Appointment> {
    // ... código existente de atualização ...

    const updatedAppointment = /* resultado da atualização */;

    // Se mudou horário, notificar
    if (updates.startTime || updates.endTime) {
      try {
        await appointmentNotificationService.sendUpdateNotification(
          originalAppointment,
          updatedAppointment
        );
      } catch (notificationError) {
        console.error('Error sending update notification:', notificationError);
      }
    }

    return updatedAppointment;
  }

  /**
   * Delete/Cancel appointment (with notifications)
   */
  async deleteAppointment(id: string): Promise<void> {
    // Buscar appointment antes de deletar
    const appointment = await this.getAppointmentById(id);

    // ... código existente de deleção ...

    // Notificar cancelamento
    if (appointment) {
      try {
        await appointmentNotificationService.sendCancellationNotification(appointment);
      } catch (notificationError) {
        console.error('Error sending cancellation notification:', notificationError);
      }
    }
  }
}
```

---

## 🧪 Como Testar

### 1. Teste Manual - Confirmação

```typescript
// Console do navegador ou componente de teste
import { appointmentNotificationService } from './services/notifications/appointmentNotificationService';

const testAppointment = {
  id: 'test-123',
  patientId: 'seu-patient-id',
  patientName: 'João Silva',
  therapistId: 'therapist-id',
  therapistName: 'Dr. Maria',
  startTime: new Date(Date.now() + 2 * 60 * 60 * 1000), // Daqui 2h
  endTime: new Date(Date.now() + 3 * 60 * 60 * 1000),
  status: 'scheduled'
  // ... outros campos
};

await appointmentNotificationService.sendAppointmentConfirmation(testAppointment);
```

### 2. Teste Manual - Lembretes

```typescript
// Criar agendamento de teste para daqui 25 horas
const futureAppointment = {
  // ... dados do agendamento
  startTime: new Date(Date.now() + 25 * 60 * 60 * 1000), // 25h no futuro
};

await appointmentNotificationService.scheduleReminders(futureAppointment);

// Verificar no banco
// SELECT * FROM notification_schedules WHERE appointment_id = 'test-123';
```

### 3. Teste da Edge Function

```bash
# Via cURL
curl -i --location --request POST \
  'https://urfxniitfbbvsaskicfo.supabase.co/functions/v1/process-appointment-reminders' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json'

# Ou via Supabase Dashboard
# https://supabase.com/dashboard/project/urfxniitfbbvsaskicfo/functions/process-appointment-reminders
# Clicar em "Invoke"
```

---

## 📊 Monitoramento

### Verificar Lembretes Pendentes

```sql
SELECT
  ns.*,
  a.start_time as appointment_time,
  p.name as patient_name
FROM notification_schedules ns
JOIN appointments a ON a.id = ns.appointment_id
JOIN patients p ON p.id = a.patient_id
WHERE ns.sent = false
ORDER BY ns.scheduled_for ASC;
```

### Verificar Lembretes Enviados (Últimas 24h)

```sql
SELECT
  ns.*,
  a.start_time,
  p.name as patient_name
FROM notification_schedules ns
JOIN appointments a ON a.id = ns.appointment_id
JOIN patients p ON p.id = a.patient_id
WHERE ns.sent = true
  AND ns.sent_at > NOW() - INTERVAL '24 hours'
ORDER BY ns.sent_at DESC;
```

### Estatísticas

```sql
SELECT
  notification_type,
  COUNT(*) as total,
  COUNT(CASE WHEN sent = true THEN 1 END) as enviadas,
  COUNT(CASE WHEN sent = false THEN 1 END) as pendentes
FROM notification_schedules
GROUP BY notification_type;
```

---

## 🎯 Próximos Passos

Depois de implementar isso:

1. ✅ **Testar end-to-end** - Criar agendamento e verificar notificações
2. ✅ **Configurar Cron** - Automatizar processamento de lembretes
3. ✅ **Implementar Notification Center** - UI para visualizar notificações
4. ✅ **Adicionar Analytics** - Tracking de taxa de abertura

---

## 🐛 Troubleshooting

### Notificações não estão sendo enviadas

1. Verificar se patient tem `user_id`:
   ```sql
   SELECT id, name, user_id FROM patients WHERE id = 'patient-id';
   ```

2. Verificar se token FCM existe:
   ```sql
   SELECT * FROM push_notification_tokens WHERE user_id = 'user-id' AND enabled = true;
   ```

3. Verificar logs da Edge Function:
   ```
   Dashboard → Functions → process-appointment-reminders → Logs
   ```

### Lembretes não estão sendo agendados

1. Verificar se tabela existe:
   ```sql
   SELECT * FROM information_schema.tables WHERE table_name = 'notification_schedules';
   ```

2. Verificar RLS policies:
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'notification_schedules';
   ```

---

**🎉 Sistema de Notificações de Agendamentos pronto para uso!**
