# 🚀 PLANO OTIMIZADO - VERCEL PRO + SUPABASE PRO

**Status**: ✅ Fase 1 Completa | 🚀 Iniciando Fase 2
**Data**: 2025-01-17
**Stack**: Vercel Pro + Supabase Pro + Twilio (já configurado)

---

## 💎 RECURSOS PRO DISPONÍVEIS

### Vercel Pro ($20/mês) ✅
- ✅ **Cron Jobs**: Automação sem servidor externo
- ✅ **Edge Functions**: Processamento global rápido
- ✅ **Analytics**: Métricas built-in
- ✅ **Speed Insights**: Performance monitoring
- ✅ **Web Vitals**: Core Web Vitals automático
- ✅ **Unlimited Bandwidth**: Sem limite de tráfego
- ✅ **Preview Deployments**: Ilimitados
- ✅ **Team Collaboration**: Até 10 membros

### Supabase Pro ($25/mês) ✅
- ✅ **8GB Database**: Muito mais espaço
- ✅ **100GB Bandwidth**: Tráfego generoso
- ✅ **50GB File Storage**: Armazenamento de arquivos
- ✅ **Database Backups**: Diários automáticos (7 dias)
- ✅ **Log Retention**: 7 dias de logs
- ✅ **Realtime**: Websockets ilimitados
- ✅ **Edge Functions**: 2M invocations/mês
- ✅ **Custom SMTP**: Email personalizado
- ✅ **Priority Support**: Suporte premium

### Twilio (já configurado) ✅
- ✅ **Phone Auth**: Recuperação de senha por SMS
- ✅ **WhatsApp**: Pode ser usado para notificações
- ✅ **SMS**: Lembretes de consulta

---

## 📊 ECONOMIA E SIMPLIFICAÇÃO

### ❌ NÃO PRECISAMOS MAIS:

1. **~~SendGrid~~** ($15/mês) → Usar **Supabase Auth Email** (incluído)
2. **~~Firebase~~** ($25/mês) → Usar **Supabase Realtime** (incluído)
3. **~~Servidor de Cron~~** → Usar **Vercel Cron Jobs** (incluído)
4. **~~Heroku/Railway~~** → Usar **Vercel Edge Functions** (incluído)
5. **~~AWS S3~~** → Usar **Supabase Storage** (incluído)
6. **~~Sentry~~** ($26/mês) → Usar **Vercel Analytics** (incluído)

**💰 Economia Total**: ~$91/mês

**💵 Custo Real**:
- Vercel Pro: $20/mês
- Supabase Pro: $25/mês
- Twilio: ~$10/mês (pay-as-you-go)
- **Total: $55/mês** (vs $146/mês no plano anterior)

---

## 🎯 FASE 2 REDESENHADA: SISTEMA DE NOTIFICAÇÕES PRO

### Arquitetura Otimizada:

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│  VERCEL CRON JOB (diário 8h)                       │
│  └─> Busca appointments próximos                   │
│       └─> Supabase Realtime notify                 │
│            └─> Frontend recebe notificação         │
│                                                     │
│  VERCEL EDGE FUNCTION (on demand)                  │
│  └─> Email via Supabase Auth                       │
│  └─> SMS via Twilio                                │
│  └─> WhatsApp via Twilio                           │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## 📅 FASE 2: SISTEMA DE NOTIFICAÇÕES (Semana 3-4)

### ✅ Semana 3: Implementação Core

#### Dia 1-2: Tabelas e Edge Functions ✅

**1. Criar Tabela de Notificações**
```sql
-- Migration: 20250117000004_notifications_system.sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type TEXT CHECK (type IN ('appointment_reminder', 'appointment_confirmed', 'appointment_cancelled', 'message', 'system')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  data JSONB DEFAULT '{}'::jsonb,
  sent_via TEXT[] DEFAULT '{}', -- ['email', 'sms', 'push', 'whatsapp']
  scheduled_for TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id, read);
CREATE INDEX idx_notifications_scheduled ON notifications(scheduled_for) WHERE sent_at IS NULL;
```

**2. Criar Edge Function para Emails**
```typescript
// supabase/functions/send-email/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

serve(async (req) => {
  const { to, subject, html } = await req.json()

  // Usar Supabase Auth SMTP (built-in)
  const response = await fetch(`${Deno.env.get('SUPABASE_URL')}/auth/v1/mail`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email: to,
      type: 'custom',
      subject,
      html
    })
  })

  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' }
  })
})
```

**3. Criar Edge Function para SMS/WhatsApp**
```typescript
// supabase/functions/send-sms/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const twilioClient = {
  accountSid: Deno.env.get('TWILIO_ACCOUNT_SID'),
  authToken: Deno.env.get('TWILIO_AUTH_TOKEN'),
  phoneNumber: Deno.env.get('TWILIO_PHONE_NUMBER')
}

serve(async (req) => {
  const { to, message, channel } = await req.json() // channel: 'sms' | 'whatsapp'

  const body = new URLSearchParams({
    From: channel === 'whatsapp' ? `whatsapp:${twilioClient.phoneNumber}` : twilioClient.phoneNumber!,
    To: channel === 'whatsapp' ? `whatsapp:${to}` : to,
    Body: message
  })

  const response = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${twilioClient.accountSid}/Messages.json`,
    {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + btoa(`${twilioClient.accountSid}:${twilioClient.authToken}`),
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body
    }
  )

  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' }
  })
})
```

#### Dia 3: Vercel Cron Job

**4. Criar Cron Job no Vercel**
```typescript
// api/cron/appointment-reminders.ts
import { createClient } from '@supabase/supabase-js'

export const config = {
  runtime: 'edge',
}

export default async function handler(req: Request) {
  // Verificar secret do cron
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 })
  }

  const supabase = createClient(
    process.env.VITE_SUPABASE_URL!,
    process.env.VITE_SUPABASE_SERVICE_ROLE_KEY!
  )

  // Buscar appointments nas próximas 24h que não têm reminder
  const tomorrow = new Date()
  tomorrow.setHours(tomorrow.getHours() + 24)

  const { data: appointments } = await supabase
    .from('appointments')
    .select(`
      *,
      patient:patients(full_name, email, phone),
      therapist:therapists(user_id)
    `)
    .gte('start_time', new Date().toISOString())
    .lte('start_time', tomorrow.toISOString())
    .eq('status', 'scheduled')
    .is('reminder_sent', false)

  // Para cada appointment, criar notificação e enviar
  for (const apt of appointments || []) {
    // Criar notificação no banco
    await supabase.from('notifications').insert({
      user_id: apt.patient.user_id,
      type: 'appointment_reminder',
      title: 'Lembrete de Consulta',
      message: `Sua consulta com ${apt.therapist.name} é amanhã às ${new Date(apt.start_time).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`,
      data: { appointment_id: apt.id }
    })

    // Enviar email via Supabase Function
    await supabase.functions.invoke('send-email', {
      body: {
        to: apt.patient.email,
        subject: 'Lembrete de Consulta - DuduFisio',
        html: `
          <h1>Olá ${apt.patient.full_name}!</h1>
          <p>Lembramos que você tem uma consulta agendada:</p>
          <p><strong>Data:</strong> ${new Date(apt.start_time).toLocaleDateString('pt-BR')}</p>
          <p><strong>Hora:</strong> ${new Date(apt.start_time).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
          <p><strong>Terapeuta:</strong> ${apt.therapist.name}</p>
        `
      }
    })

    // Enviar SMS se o paciente tiver telefone
    if (apt.patient.phone) {
      await supabase.functions.invoke('send-sms', {
        body: {
          to: apt.patient.phone,
          message: `Lembrete: Consulta amanhã às ${new Date(apt.start_time).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} com ${apt.therapist.name}. DuduFisio`,
          channel: 'sms'
        }
      })
    }

    // Marcar reminder como enviado
    await supabase
      .from('appointments')
      .update({ reminder_sent: true })
      .eq('id', apt.id)
  }

  return new Response(JSON.stringify({ success: true, processed: appointments?.length || 0 }), {
    headers: { 'Content-Type': 'application/json' }
  })
}
```

**5. Configurar Cron no vercel.json**
```json
{
  "crons": [
    {
      "path": "/api/cron/appointment-reminders",
      "schedule": "0 8 * * *"
    },
    {
      "path": "/api/cron/daily-summary",
      "schedule": "0 20 * * *"
    }
  ]
}
```

#### Dia 4: Notificações em Tempo Real

**6. Componente Bell de Notificações**
```typescript
// components/NotificationBell.tsx
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Bell } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export function NotificationBell() {
  const [unreadCount, setUnreadCount] = useState(0)
  const [notifications, setNotifications] = useState([])

  useEffect(() => {
    // Buscar notificações não lidas
    fetchUnread()

    // Subscrever a novas notificações em tempo real
    const channel = supabase
      .channel('notifications')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${user.id}`
      }, (payload) => {
        setNotifications(prev => [payload.new, ...prev])
        setUnreadCount(prev => prev + 1)

        // Toast notification
        toast({
          title: payload.new.title,
          description: payload.new.message
        })
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const fetchUnread = async () => {
    const { data, count } = await supabase
      .from('notifications')
      .select('*', { count: 'exact' })
      .eq('read', false)
      .order('created_at', { ascending: false })

    setNotifications(data || [])
    setUnreadCount(count || 0)
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0">
              {unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-2">
          <h3 className="font-semibold">Notificações</h3>
          {notifications.map(notif => (
            <div key={notif.id} className={`p-2 rounded ${!notif.read ? 'bg-blue-50' : ''}`}>
              <div className="font-medium">{notif.title}</div>
              <div className="text-sm text-gray-600">{notif.message}</div>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}
```

#### Dia 5: Templates e Testes

**7. Template Engine**
```typescript
// lib/emailTemplates.ts
export const templates = {
  appointmentReminder: (data) => `
    <!DOCTYPE html>
    <html>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #3b82f6;">Lembrete de Consulta</h1>
        <p>Olá ${data.patientName}!</p>
        <p>Você tem uma consulta agendada:</p>
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>📅 Data:</strong> ${data.date}</p>
          <p><strong>🕐 Horário:</strong> ${data.time}</p>
          <p><strong>👨‍⚕️ Profissional:</strong> ${data.therapistName}</p>
          <p><strong>📍 Local:</strong> ${data.location}</p>
        </div>
        <p>Em caso de impedimento, entre em contato para reagendar.</p>
        <p style="color: #6b7280; font-size: 12px; margin-top: 40px;">
          DuduFisio - Gestão Inteligente de Fisioterapia
        </p>
      </body>
    </html>
  `,

  appointmentConfirmed: (data) => `...`,
  appointmentCancelled: (data) => `...`,
  welcomePatient: (data) => `...`,
  passwordReset: (data) => `...`
}
```

---

### ✅ Semana 4: Features Avançadas

#### Dia 1-2: Preferências de Notificação

**8. Tabela de Preferências**
```sql
-- Adicionar à tabela users
ALTER TABLE users ADD COLUMN IF NOT EXISTS notification_preferences JSONB DEFAULT '{
  "email": true,
  "sms": true,
  "whatsapp": false,
  "push": true,
  "appointment_reminder_24h": true,
  "appointment_reminder_2h": true,
  "marketing": false,
  "system": true
}'::jsonb;
```

**9. Página de Configurações**
```typescript
// pages/NotificationSettingsPage.tsx
import { Switch } from '@/components/ui/switch'

export function NotificationSettingsPage() {
  const [preferences, setPreferences] = useState({})

  const updatePreference = async (key, value) => {
    await supabase
      .from('users')
      .update({
        notification_preferences: {
          ...preferences,
          [key]: value
        }
      })
      .eq('id', user.id)
  }

  return (
    <div className="space-y-6">
      <h1>Preferências de Notificação</h1>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-medium">Email</div>
            <div className="text-sm text-gray-600">Receber notificações por email</div>
          </div>
          <Switch
            checked={preferences.email}
            onCheckedChange={(v) => updatePreference('email', v)}
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <div className="font-medium">SMS</div>
            <div className="text-sm text-gray-600">Receber notificações por SMS</div>
          </div>
          <Switch
            checked={preferences.sms}
            onCheckedChange={(v) => updatePreference('sms', v)}
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <div className="font-medium">WhatsApp</div>
            <div className="text-sm text-gray-600">Receber notificações por WhatsApp</div>
          </div>
          <Switch
            checked={preferences.whatsapp}
            onCheckedChange={(v) => updatePreference('whatsapp', v)}
          />
        </div>
      </div>
    </div>
  )
}
```

#### Dia 3-4: Analytics e Métricas

**10. Dashboard de Notificações**
```typescript
// components/NotificationAnalytics.tsx
import { useQuery } from '@tanstack/react-query'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'

export function NotificationAnalytics() {
  const { data: stats } = useQuery({
    queryKey: ['notification-stats'],
    queryFn: async () => {
      const { data } = await supabase
        .from('notifications')
        .select('type, sent_via, created_at')
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())

      // Agrupar por tipo e canal
      const byType = data?.reduce((acc, n) => {
        acc[n.type] = (acc[n.type] || 0) + 1
        return acc
      }, {})

      const byChannel = data?.reduce((acc, n) => {
        n.sent_via?.forEach(channel => {
          acc[channel] = (acc[channel] || 0) + 1
        })
        return acc
      }, {})

      return { byType, byChannel }
    }
  })

  return (
    <div className="grid grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Notificações por Tipo (30 dias)</CardTitle>
        </CardHeader>
        <CardContent>
          <BarChart width={400} height={300} data={Object.entries(stats?.byType || {}).map(([k, v]) => ({ name: k, value: v }))}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#3b82f6" />
          </BarChart>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notificações por Canal</CardTitle>
        </CardHeader>
        <CardContent>
          <BarChart width={400} height={300} data={Object.entries(stats?.byChannel || {}).map(([k, v]) => ({ name: k, value: v }))}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#10b981" />
          </BarChart>
        </CardContent>
      </Card>
    </div>
  )
}
```

#### Dia 5: Testes e Documentação

**11. Testes E2E**
```typescript
// tests/e2e/notifications.spec.ts
import { test, expect } from '@playwright/test'

test('should send appointment reminder', async ({ page }) => {
  // Login como admin
  await page.goto('/login')
  await page.fill('[name=email]', 'admin@dudufisio.com')
  await page.fill('[name=password]', 'password')
  await page.click('button[type=submit]')

  // Criar appointment para amanhã
  await page.goto('/agenda')
  await page.click('text=Novo Agendamento')
  // ... preencher form

  // Disparar cron job manualmente
  await page.goto('/api/cron/appointment-reminders?secret=' + process.env.CRON_SECRET)

  // Verificar que notificação foi criada
  await page.goto('/notificacoes')
  await expect(page.locator('text=Lembrete de Consulta')).toBeVisible()
})
```

---

## 📦 ARQUIVOS A CRIAR

### Migrations SQL:
1. ✅ `supabase/migrations/20250117000004_notifications_system.sql`

### Edge Functions (Supabase):
2. ✅ `supabase/functions/send-email/index.ts`
3. ✅ `supabase/functions/send-sms/index.ts`

### API Routes (Vercel):
4. ✅ `api/cron/appointment-reminders.ts`
5. ✅ `api/cron/daily-summary.ts`

### Components:
6. ✅ `components/NotificationBell.tsx`
7. ✅ `components/NotificationList.tsx`
8. ✅ `components/NotificationAnalytics.tsx`

### Pages:
9. ✅ `pages/NotificationSettingsPage.tsx`

### Libs:
10. ✅ `lib/emailTemplates.ts`
11. ✅ `lib/notificationService.ts`

### Config:
12. ✅ `vercel.json` (atualizar com crons)

### Tests:
13. ✅ `tests/e2e/notifications.spec.ts`

---

## 🎯 DELIVERABLES FASE 2

### Funcionalidades:
- ✅ Email automático via Supabase Auth SMTP
- ✅ SMS via Twilio (já configurado)
- ✅ WhatsApp via Twilio
- ✅ Notificações em tempo real (Supabase Realtime)
- ✅ Bell icon com contador
- ✅ Centro de notificações
- ✅ Preferências por usuário
- ✅ Templates profissionais
- ✅ Cron jobs automáticos (Vercel)
- ✅ Analytics de notificações
- ✅ Testes E2E

### Métricas de Sucesso:
- ✅ 99% de entrega de emails
- ✅ < 2s latência para notificações em tempo real
- ✅ 0 custos adicionais (tudo incluído no Pro)
- ✅ 60% redução em no-shows

---

## 🚀 PRÓXIMAS FASES OTIMIZADAS

### Fase 3: Integrações (Semanas 5-6)
- Pagamentos (Stripe + Mercado Pago)
- Calendário (Google Calendar sync)
- Teleconsulta (Daily.co ou Jitsi)

### Fase 4: Advanced (Semanas 7-8)
- IA Avançada (Gemini)
- Portal do Paciente
- Relatórios automáticos

### Fase 5: Mobile & UX (Semanas 9-10)
- PWA otimizado
- Dark mode
- Onboarding tour

### Fase 6: Polish (Semanas 11-12)
- Testes completos
- Performance optimization
- Launch preparation

---

**Criado em**: 2025-01-17
**Versão**: 2.0 Pro
**Status**: 🚀 PRONTO PARA IMPLEMENTAÇÃO
**Economia**: $91/mês vs plano anterior
