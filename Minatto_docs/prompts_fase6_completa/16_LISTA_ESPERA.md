# Prompt 16: Lista de Espera Inteligente

## 🎯 Objetivo

Implementar sistema de lista de espera para aproveitar horários vagos por cancelamentos, inspirado no Stenci e práticas de clínicas de alto volume.

---

## 📋 Contexto

**Problema atual:**
- Cancelamentos de última hora deixam horários vazios
- Perda de receita com horários não preenchidos
- Pacientes querem antecipar sessões
- Sem sistema para gerenciar demanda

**Solução:**
- Lista de espera organizada por prioridade
- Notificação automática quando vaga abre
- Paciente confirma em até 2 horas
- Aproveitamento de 70-80% dos cancelamentos

---

## 🔧 Funcionalidades

### 1. Adicionar Paciente à Lista

**Tela de cadastro:**
```
┌─────────────────────────────────────────────┐
│  Adicionar à Lista de Espera          [X]   │
├─────────────────────────────────────────────┤
│                                             │
│  Paciente:                                  │
│  ┌─────────────────────────────────────┐   │
│  │ 🔍 Buscar paciente...               │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  Profissional preferido:                    │
│  ☑ Qualquer profissional                    │
│  ☐ Dr. Silva                                │
│  ☐ Dra. Santos                              │
│                                             │
│  Dias da semana:                            │
│  ☑ Segunda  ☑ Terça  ☑ Quarta              │
│  ☑ Quinta   ☑ Sexta  ☐ Sábado              │
│                                             │
│  Horários preferidos:                       │
│  ☑ Manhã (07h-12h)                          │
│  ☑ Tarde (12h-18h)                          │
│  ☐ Noite (18h-21h)                          │
│                                             │
│  Prioridade:                                │
│  ○ Normal                                   │
│  ● Alta (dor aguda)                         │
│  ○ Urgente (pós-cirúrgico)                  │
│                                             │
│  Observações:                               │
│  ┌─────────────────────────────────────┐   │
│  │ Paciente com dor aguda, preferência │   │
│  │ para manhã                          │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  [Cancelar]              [Adicionar]        │
└─────────────────────────────────────────────┘
```

### 2. Dashboard de Lista de Espera

**Visualização:**
```
┌──────────────────────────────────────────────────────────┐
│  Lista de Espera                                    [+]  │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  Filtros:                                                │
│  [Todos] [Alta Prioridade] [Urgente] [Aguardando > 7d]  │
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │ 🔴 URGENTE                                         │ │
│  │ Maria Silva                                        │ │
│  │ Pós-cirúrgico | Aguardando 3 dias                 │ │
│  │ Preferência: Manhã, Seg/Qua/Sex                   │ │
│  │ [Agendar Agora] [Remover] [Detalhes]              │ │
│  └────────────────────────────────────────────────────┘ │
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │ 🟠 ALTA                                            │ │
│  │ João Santos                                        │ │
│  │ Dor aguda | Aguardando 5 dias                     │ │
│  │ Preferência: Tarde, Qualquer dia                  │ │
│  │ [Agendar Agora] [Remover] [Detalhes]              │ │
│  └────────────────────────────────────────────────────┘ │
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │ 🟢 NORMAL                                          │ │
│  │ Ana Costa                                          │ │
│  │ Manutenção | Aguardando 2 dias                    │ │
│  │ Preferência: Manhã, Seg/Ter                       │ │
│  │ [Agendar Agora] [Remover] [Detalhes]              │ │
│  └────────────────────────────────────────────────────┘ │
│                                                          │
│  Total: 15 pacientes na lista                           │
│  Média de espera: 4.2 dias                              │
└──────────────────────────────────────────────────────────┘
```

### 3. Notificação Automática de Vaga

**Fluxo:**
1. Paciente cancela sessão
2. Sistema busca na lista de espera:
   - Mesmo profissional (se preferência)
   - Mesmo dia da semana
   - Mesmo horário
   - Prioridade (urgente > alta > normal)
3. Envia notificação para primeiro da fila
4. Paciente tem 2 horas para confirmar
5. Se não confirmar, oferece para próximo

**Mensagem WhatsApp:**
```
Boa notícia! 🎉

Uma vaga abriu:

📅 Data: Quarta-feira, 06/11
🕐 Horário: 14h00
👨‍⚕️ Profissional: Dr. Silva
📍 Local: Clínica Activity

Você tem até 16h00 (2 horas) para confirmar.

Responda:
✅ SIM - Confirmar vaga
❌ NÃO - Recusar vaga

[Nome da Clínica]
```

### 4. Confirmação de Vaga

**Se paciente confirmar:**
```
Vaga confirmada! ✅

Sua sessão está agendada:

📅 Quarta-feira, 06/11 às 14h00
👨‍⚕️ Dr. Silva

Você foi removido da lista de espera.

Nos vemos em breve! 💪
```

**Se paciente recusar:**
```
Vaga recusada. ❌

Você continua na lista de espera e será notificado quando houver novas vagas.

Deseja sair da lista? Responda: SAIR
```

**Se não responder em 2h:**
```
Tempo esgotado. ⏰

A vaga foi oferecida para outro paciente.

Você continua na lista de espera.
```

### 5. Agendamento Manual da Lista

**Ao clicar em "Agendar Agora":**
```
┌─────────────────────────────────────────────┐
│  Agendar Maria Silva                  [X]   │
├─────────────────────────────────────────────┤
│                                             │
│  Horários disponíveis:                      │
│                                             │
│  Segunda, 04/11                             │
│  ○ 08h00 - Dr. Silva                        │
│  ○ 09h00 - Dr. Silva                        │
│  ○ 10h00 - Dra. Santos                      │
│                                             │
│  Quarta, 06/11                              │
│  ● 14h00 - Dr. Silva ⭐ Match perfeito      │
│  ○ 15h00 - Dr. Silva                        │
│                                             │
│  Sexta, 08/11                               │
│  ○ 08h00 - Dr. Silva                        │
│  ○ 09h00 - Dra. Santos                      │
│                                             │
│  [Cancelar]              [Agendar]          │
└─────────────────────────────────────────────┘
```

### 6. Métricas e Analytics

**Dashboard:**
- Total de pacientes na lista
- Tempo médio de espera
- Taxa de aproveitamento de vagas
- Taxa de confirmação (% que confirmam quando notificados)
- Pacientes que saíram da lista (desistência)

---

## 🛠️ Implementação Técnica

### Banco de Dados

```sql
-- Tabela de lista de espera
CREATE TABLE waitlist (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  clinic_id UUID REFERENCES clinics(id),
  professional_id UUID REFERENCES professionals(id), -- NULL = qualquer
  priority TEXT CHECK (priority IN ('normal', 'high', 'urgent')) DEFAULT 'normal',
  preferred_days TEXT[], -- ['monday', 'wednesday', 'friday']
  preferred_times TEXT[], -- ['morning', 'afternoon']
  notes TEXT,
  added_at TIMESTAMP DEFAULT NOW(),
  notified_count INT DEFAULT 0,
  last_notified_at TIMESTAMP,
  status TEXT CHECK (status IN ('active', 'scheduled', 'removed')) DEFAULT 'active'
);

-- Tabela de notificações de vagas
CREATE TABLE waitlist_notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  waitlist_id UUID REFERENCES waitlist(id) ON DELETE CASCADE,
  session_id UUID REFERENCES sessions(id),
  notified_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP, -- 2 horas depois
  status TEXT CHECK (status IN ('pending', 'confirmed', 'rejected', 'expired')) DEFAULT 'pending',
  confirmed_at TIMESTAMP,
  rejected_at TIMESTAMP
);

-- Índices
CREATE INDEX idx_waitlist_patient ON waitlist(patient_id);
CREATE INDEX idx_waitlist_clinic ON waitlist(clinic_id);
CREATE INDEX idx_waitlist_status ON waitlist(status);
CREATE INDEX idx_waitlist_priority ON waitlist(priority);
```

### Função de Busca na Lista

```typescript
// utils/waitlist.ts
export async function findMatchingPatients(
  session: Session
): Promise<WaitlistEntry[]> {
  const dayOfWeek = getDayOfWeek(session.date); // 'monday', 'tuesday', etc.
  const timeOfDay = getTimeOfDay(session.time); // 'morning', 'afternoon', 'evening'

  const { data } = await supabase
    .from('waitlist')
    .select('*, patient(*)')
    .eq('clinic_id', session.clinic_id)
    .eq('status', 'active')
    .or(`professional_id.is.null,professional_id.eq.${session.professional_id}`)
    .contains('preferred_days', [dayOfWeek])
    .contains('preferred_times', [timeOfDay])
    .order('priority', { ascending: false }) // urgent > high > normal
    .order('added_at', { ascending: true }); // FIFO dentro da mesma prioridade

  return data || [];
}
```

### Função de Notificação

```typescript
// app/api/sessions/[id]/cancel/route.ts
export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  // Buscar sessão
  const { data: session } = await supabase
    .from('sessions')
    .select('*')
    .eq('id', id)
    .single();

  // Cancelar sessão
  await supabase
    .from('sessions')
    .update({ status: 'cancelled', cancelled_at: new Date() })
    .eq('id', id);

  // Buscar pacientes na lista de espera
  const matches = await findMatchingPatients(session);

  if (matches.length === 0) {
    return Response.json({ message: 'Sessão cancelada. Nenhum paciente na lista de espera.' });
  }

  // Notificar primeiro da fila
  const firstMatch = matches[0];

  // Criar notificação
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 2);

  const { data: notification } = await supabase
    .from('waitlist_notifications')
    .insert({
      waitlist_id: firstMatch.id,
      session_id: session.id,
      expires_at: expiresAt,
    })
    .select()
    .single();

  // Enviar WhatsApp
  await sendWhatsAppNotification(firstMatch, session, expiresAt);

  // Atualizar contadores
  await supabase
    .from('waitlist')
    .update({
      notified_count: firstMatch.notified_count + 1,
      last_notified_at: new Date(),
    })
    .eq('id', firstMatch.id);

  return Response.json({ message: 'Paciente notificado', notification });
}
```

### Webhook de Resposta

```typescript
// app/api/webhooks/whatsapp/route.ts
export async function POST(req: Request) {
  const webhook = await req.json();

  if (webhook.event === 'messages.upsert') {
    const message = webhook.data.message;
    const from = message.key.remoteJid.replace('@s.whatsapp.net', '');
    const text = message.message?.conversation || '';

    // Buscar notificação pendente
    const { data: notification } = await supabase
      .from('waitlist_notifications')
      .select('*, waitlist(*, patient(*))')
      .eq('waitlist.patient.phone', from)
      .eq('status', 'pending')
      .single();

    if (!notification) return Response.json({ ok: true });

    const response = text.toUpperCase().trim();

    if (['SIM', 'S', 'OK', 'CONFIRMO', '1'].includes(response)) {
      // Confirmar vaga
      await supabase
        .from('waitlist_notifications')
        .update({ status: 'confirmed', confirmed_at: new Date() })
        .eq('id', notification.id);

      // Atualizar sessão
      await supabase
        .from('sessions')
        .update({
          patient_id: notification.waitlist.patient_id,
          status: 'scheduled',
          confirmed: true,
        })
        .eq('id', notification.session_id);

      // Remover da lista de espera
      await supabase
        .from('waitlist')
        .update({ status: 'scheduled' })
        .eq('id', notification.waitlist_id);

      await sendWhatsAppMessage(from, 'Vaga confirmada! ✅\n\n...');
    } else if (['NÃO', 'N', 'RECUSAR', '0'].includes(response)) {
      // Recusar vaga
      await supabase
        .from('waitlist_notifications')
        .update({ status: 'rejected', rejected_at: new Date() })
        .eq('id', notification.id);

      await sendWhatsAppMessage(from, 'Vaga recusada. ❌\n\n...');

      // Notificar próximo da fila
      await notifyNextInLine(notification.session_id);
    }
  }

  return Response.json({ ok: true });
}
```

### Cron Job para Expirar Notificações

```typescript
// inngest/functions.ts
export const expireWaitlistNotifications = inngest.createFunction(
  { id: "expire-waitlist-notifications" },
  { cron: "*/15 * * * *" }, // A cada 15 minutos
  async ({ event, step }) => {
    // Buscar notificações expiradas
    const { data: expired } = await step.run("find-expired", async () => {
      return await supabase
        .from('waitlist_notifications')
        .select('*')
        .eq('status', 'pending')
        .lt('expires_at', new Date().toISOString());
    });

    // Marcar como expiradas
    await step.run("mark-expired", async () => {
      for (const notification of expired) {
        await supabase
          .from('waitlist_notifications')
          .update({ status: 'expired' })
          .eq('id', notification.id);

        // Notificar próximo da fila
        await notifyNextInLine(notification.session_id);
      }
    });
  }
);
```

---

## 📊 Métricas

**Dashboard de Analytics:**
```typescript
export function WaitlistAnalytics() {
  const [stats, setStats] = useState({
    totalInList: 0,
    avgWaitTime: 0,
    utilizationRate: 0,
    confirmationRate: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      // Total na lista
      const { count: totalInList } = await supabase
        .from('waitlist')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      // Tempo médio de espera
      const { data: waitTimes } = await supabase
        .from('waitlist')
        .select('added_at')
        .eq('status', 'active');

      const avgWaitTime = waitTimes.reduce((sum, w) => {
        const days = (new Date().getTime() - new Date(w.added_at).getTime()) / (1000 * 60 * 60 * 24);
        return sum + days;
      }, 0) / waitTimes.length;

      // Taxa de aproveitamento
      const { count: totalNotifications } = await supabase
        .from('waitlist_notifications')
        .select('*', { count: 'exact', head: true });

      const { count: confirmedNotifications } = await supabase
        .from('waitlist_notifications')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'confirmed');

      const confirmationRate = (confirmedNotifications / totalNotifications) * 100;

      setStats({
        totalInList,
        avgWaitTime: Math.round(avgWaitTime * 10) / 10,
        utilizationRate: confirmationRate,
        confirmationRate,
      });
    };

    fetchStats();
  }, []);

  return (
    <div className="grid grid-cols-4 gap-4">
      <Card>
        <CardHeader>Total na Lista</CardHeader>
        <CardContent>
          <div className="text-4xl font-bold">{stats.totalInList}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>Tempo Médio de Espera</CardHeader>
        <CardContent>
          <div className="text-4xl font-bold">{stats.avgWaitTime} dias</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>Taxa de Aproveitamento</CardHeader>
        <CardContent>
          <div className="text-4xl font-bold">{stats.utilizationRate}%</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>Taxa de Confirmação</CardHeader>
        <CardContent>
          <div className="text-4xl font-bold">{stats.confirmationRate}%</div>
        </CardContent>
      </Card>
    </div>
  );
}
```

---

## ✅ Critérios de Sucesso

1. ✅ Pacientes podem ser adicionados à lista
2. ✅ Priorização funciona (urgente > alta > normal)
3. ✅ Notificação automática ao cancelar sessão
4. ✅ Paciente confirma/recusa via WhatsApp
5. ✅ Timeout de 2 horas funciona
6. ✅ Próximo da fila é notificado se primeiro não confirmar
7. ✅ Dashboard mostra métricas
8. ✅ Taxa de aproveitamento > 70%

---

## 🚀 Plano de Implementação

**Tempo:** 2-3 semanas  
**Prioridade:** 🟡 ALTA

---

**Impacto:** Aproveitamento de 70-80% dos cancelamentos = +15-20% de receita
