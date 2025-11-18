# Prompt 14: Confirmações Automáticas via WhatsApp

## 🎯 Objetivo

Implementar sistema de confirmações automáticas de sessões via WhatsApp para reduzir no-shows em 30-40%, inspirado no Cliniconect e FisioOnline.

---

## 📋 Contexto

**Problema atual:**
- Pacientes esquecem das sessões agendadas
- Taxa de no-show alta (20-30%)
- Fisioterapeutas perdem tempo ligando para confirmar
- Sem sistema automatizado de lembretes

**Solução:**
- Envio automático de mensagens WhatsApp
- Confirmação direta no chat (sem links externos)
- Cancelamento/reagendamento simplificado
- Redução de 30% nas faltas (dados do Cliniconect)

---

## 🔧 Funcionalidades

### 1. Envio Automático de Lembretes

**Quando enviar:**
- 24 horas antes da sessão
- 2 horas antes da sessão (opcional)
- 1 semana antes (para sessões agendadas com antecedência)

**Conteúdo da mensagem:**
```
Olá [Nome do Paciente]! 👋

Lembrete da sua sessão de fisioterapia:

📅 Data: [Data]
🕐 Horário: [Hora]
👨‍⚕️ Profissional: [Nome do Fisioterapeuta]
📍 Local: [Endereço da Clínica]

Para confirmar, responda:
✅ SIM - Confirmar presença
❌ NÃO - Cancelar
🔄 REAGENDAR - Escolher nova data

Até breve! 💪
[Nome da Clínica]
```

### 2. Confirmação Direta no Chat

**Fluxo:**
1. Paciente recebe mensagem
2. Responde "SIM", "NÃO" ou "REAGENDAR"
3. Sistema processa resposta automaticamente
4. Atualiza status no sistema
5. Envia confirmação

**Respostas aceitas:**
- **Confirmar:** SIM, S, OK, CONFIRMO, 1, ✅
- **Cancelar:** NÃO, N, CANCELAR, 0, ❌
- **Reagendar:** REAGENDAR, R, MUDAR, 2, 🔄

### 3. Cancelamento e Reagendamento

**Se paciente cancelar:**
```
Sessão cancelada com sucesso. ❌

Horário [Data às Hora] foi liberado.

Deseja reagendar? Responda:
📅 REAGENDAR
```

**Se paciente reagendar:**
```
Vamos reagendar sua sessão! 🔄

Horários disponíveis com [Fisioterapeuta]:

1️⃣ [Data 1] às [Hora 1]
2️⃣ [Data 2] às [Hora 2]
3️⃣ [Data 3] às [Hora 3]

Responda com o número da opção desejada.
```

### 4. Dashboard para Fisioterapeuta

**Visualização:**
- Lista de sessões do dia
- Status de cada sessão:
  - ✅ Confirmada
  - ⏳ Aguardando confirmação
  - ❌ Cancelada
  - 🔄 Reagendada
- Taxa de confirmação
- Alertas de sessões não confirmadas

---

## 🛠️ Implementação Técnica

### Stack Recomendada

**API WhatsApp:**
- **Opção 1:** WhatsApp Business API (oficial)
  - Mais confiável
  - Requer aprovação do Facebook
  - Custo: ~$0.005-0.01 por mensagem
  
- **Opção 2:** Evolution API (open-source)
  - Grátis
  - Mais fácil de configurar
  - Baseado em WhatsApp Web
  - Risco de bloqueio (menor se usar número business)

- **Opção 3:** Twilio WhatsApp API
  - Fácil integração
  - Custo: ~$0.005 por mensagem
  - Documentação excelente

**Recomendação:** Evolution API para MVP, migrar para WhatsApp Business API depois

### Arquitetura

```typescript
// 1. Cron Job (Inngest ou Vercel Cron)
export const sendSessionReminders = inngest.createFunction(
  { id: "send-session-reminders" },
  { cron: "0 9,17 * * *" }, // 9h e 17h todo dia
  async ({ event, step }) => {
    // Buscar sessões que precisam de lembrete
    const sessions = await step.run("get-sessions", async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      return await supabase
        .from('sessions')
        .select('*, patient(*), professional(*)')
        .eq('status', 'scheduled')
        .gte('date', tomorrow.toISOString())
        .lte('date', tomorrow.setHours(23, 59, 59).toISOString())
        .is('reminder_sent_24h', null);
    });

    // Enviar lembretes
    await step.run("send-reminders", async () => {
      for (const session of sessions.data) {
        await sendWhatsAppReminder(session);
      }
    });
  }
);

// 2. Função para enviar WhatsApp
async function sendWhatsAppReminder(session: Session) {
  const message = `
Olá ${session.patient.name}! 👋

Lembrete da sua sessão de fisioterapia:

📅 Data: ${formatDate(session.date)}
🕐 Horário: ${formatTime(session.time)}
👨‍⚕️ Profissional: ${session.professional.name}
📍 Local: ${session.clinic.address}

Para confirmar, responda:
✅ SIM - Confirmar presença
❌ NÃO - Cancelar
🔄 REAGENDAR - Escolher nova data

Até breve! 💪
${session.clinic.name}
  `.trim();

  // Enviar via Evolution API
  await fetch('http://evolution-api:8080/message/sendText', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': process.env.EVOLUTION_API_KEY,
    },
    body: JSON.stringify({
      number: session.patient.phone,
      text: message,
    }),
  });

  // Marcar como enviado
  await supabase
    .from('sessions')
    .update({ reminder_sent_24h: new Date() })
    .eq('id', session.id);
}

// 3. Webhook para receber respostas
export async function POST(req: Request) {
  const webhook = await req.json();
  
  // Processar mensagem recebida
  if (webhook.event === 'messages.upsert') {
    const message = webhook.data.message;
    const from = message.key.remoteJid.replace('@s.whatsapp.net', '');
    const text = message.message?.conversation || '';
    
    // Buscar paciente pelo telefone
    const { data: patient } = await supabase
      .from('patients')
      .select('*, sessions(*)')
      .eq('phone', from)
      .single();
    
    if (!patient) return Response.json({ ok: true });
    
    // Buscar sessão pendente de confirmação
    const pendingSession = patient.sessions.find(
      s => s.status === 'scheduled' && !s.confirmed
    );
    
    if (!pendingSession) return Response.json({ ok: true });
    
    // Processar resposta
    const response = text.toUpperCase().trim();
    
    if (['SIM', 'S', 'OK', 'CONFIRMO', '1'].includes(response)) {
      // Confirmar sessão
      await supabase
        .from('sessions')
        .update({ confirmed: true, confirmed_at: new Date() })
        .eq('id', pendingSession.id);
      
      await sendWhatsAppMessage(from, 
        'Sessão confirmada com sucesso! ✅\n\nNos vemos em breve! 💪'
      );
    } else if (['NÃO', 'N', 'CANCELAR', '0'].includes(response)) {
      // Cancelar sessão
      await supabase
        .from('sessions')
        .update({ status: 'cancelled', cancelled_at: new Date() })
        .eq('id', pendingSession.id);
      
      await sendWhatsAppMessage(from, 
        'Sessão cancelada com sucesso. ❌\n\nDeseja reagendar? Responda: REAGENDAR'
      );
    } else if (['REAGENDAR', 'R', 'MUDAR', '2'].includes(response)) {
      // Mostrar horários disponíveis
      const availableSlots = await getAvailableSlots(
        pendingSession.professional_id
      );
      
      const options = availableSlots
        .slice(0, 3)
        .map((slot, i) => 
          `${i + 1}️⃣ ${formatDate(slot.date)} às ${formatTime(slot.time)}`
        )
        .join('\n');
      
      await sendWhatsAppMessage(from, 
        `Vamos reagendar sua sessão! 🔄\n\nHorários disponíveis:\n\n${options}\n\nResponda com o número da opção.`
      );
    }
  }
  
  return Response.json({ ok: true });
}
```

### Banco de Dados

```sql
-- Adicionar campos na tabela sessions
ALTER TABLE sessions ADD COLUMN confirmed BOOLEAN DEFAULT FALSE;
ALTER TABLE sessions ADD COLUMN confirmed_at TIMESTAMP;
ALTER TABLE sessions ADD COLUMN reminder_sent_24h TIMESTAMP;
ALTER TABLE sessions ADD COLUMN reminder_sent_2h TIMESTAMP;
ALTER TABLE sessions ADD COLUMN whatsapp_conversation_id TEXT;

-- Tabela para logs de mensagens
CREATE TABLE whatsapp_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES sessions(id),
  patient_id UUID REFERENCES patients(id),
  direction TEXT CHECK (direction IN ('outbound', 'inbound')),
  message TEXT,
  status TEXT,
  sent_at TIMESTAMP DEFAULT NOW(),
  delivered_at TIMESTAMP,
  read_at TIMESTAMP,
  replied_at TIMESTAMP
);
```

---

## 🎨 Interface no Sistema

### Tela de Agendamentos

**Adicionar coluna "Confirmação":**
```
| Paciente | Data | Hora | Profissional | Confirmação |
|----------|------|------|--------------|-------------|
| João     | 05/11| 14h  | Dr. Silva    | ✅ Confirmado|
| Maria    | 05/11| 15h  | Dr. Silva    | ⏳ Pendente  |
| Pedro    | 05/11| 16h  | Dr. Silva    | ❌ Cancelado |
```

### Card de Sessão

```typescript
<SessionCard>
  <PatientInfo>
    <Avatar src={patient.photo} />
    <Name>{patient.name}</Name>
  </PatientInfo>
  
  <SessionDetails>
    <DateTime>{formatDateTime(session.date)}</DateTime>
    <Professional>{session.professional.name}</Professional>
  </SessionDetails>
  
  <ConfirmationStatus>
    {session.confirmed ? (
      <Badge variant="success">
        <CheckIcon /> Confirmado
      </Badge>
    ) : (
      <Badge variant="warning">
        <ClockIcon /> Aguardando confirmação
      </Badge>
    )}
  </ConfirmationStatus>
  
  <Actions>
    <Button onClick={() => resendReminder(session.id)}>
      Reenviar Lembrete
    </Button>
  </Actions>
</SessionCard>
```

---

## 📊 Métricas e Analytics

### Dashboard de Confirmações

**Widgets:**
1. **Taxa de Confirmação:**
   - Confirmadas / Total de sessões
   - Meta: > 80%

2. **Taxa de No-Show:**
   - Não compareceram / Total
   - Meta: < 10%

3. **Tempo Médio de Resposta:**
   - Tempo entre envio e confirmação
   - Meta: < 2 horas

4. **Gráfico de Tendência:**
   - Evolução mensal da taxa de confirmação

---

## ✅ Critérios de Sucesso

1. ✅ Lembretes enviados automaticamente 24h antes
2. ✅ Pacientes conseguem confirmar via WhatsApp
3. ✅ Pacientes conseguem cancelar via WhatsApp
4. ✅ Pacientes conseguem reagendar via WhatsApp
5. ✅ Sistema atualiza status automaticamente
6. ✅ Fisioterapeuta vê status de confirmação
7. ✅ Taxa de no-show reduz em 20-30%
8. ✅ Tempo de resposta < 1 segundo

---

## 🚀 Plano de Implementação

### Fase 1: MVP (2-3 semanas)
- ✅ Integração com Evolution API
- ✅ Envio automático de lembretes 24h antes
- ✅ Confirmação via WhatsApp (SIM/NÃO)
- ✅ Atualização de status no sistema
- ✅ Dashboard básico

### Fase 2: Melhorias (1-2 semanas)
- ✅ Cancelamento via WhatsApp
- ✅ Reagendamento via WhatsApp
- ✅ Lembrete 2h antes
- ✅ Analytics detalhado

### Fase 3: Avançado (1-2 semanas)
- ✅ Migração para WhatsApp Business API
- ✅ Templates aprovados pelo Facebook
- ✅ Respostas rápidas (quick replies)
- ✅ Integração com chatbot

---

## 💰 Custos Estimados

### Evolution API (Open-Source)
- **Setup:** Grátis
- **Hospedagem:** $5-10/mês (VPS)
- **Mensagens:** Grátis (limitado pelo WhatsApp)
- **Total:** ~$10/mês

### WhatsApp Business API (Oficial)
- **Setup:** Grátis
- **Mensagens:** $0.005-0.01 por mensagem
- **100 clínicas x 20 sessões/dia x 30 dias = 60k mensagens/mês**
- **Custo:** $300-600/mês

### Twilio WhatsApp
- **Setup:** Grátis
- **Mensagens:** $0.005 por mensagem
- **60k mensagens/mês = $300/mês**

**Recomendação:** Começar com Evolution API (grátis), migrar para oficial quando escalar

---

## 🎯 Próximos Passos

1. ✅ Instalar Evolution API em VPS
2. ✅ Configurar webhook no Supabase
3. ✅ Criar função de envio de lembretes
4. ✅ Criar função de processamento de respostas
5. ✅ Adicionar campos no banco de dados
6. ✅ Criar interface de confirmações
7. ✅ Testar com pacientes reais
8. ✅ Monitorar métricas por 1 mês
9. ✅ Iterar baseado em feedback

---

## 📚 Recursos

- [Evolution API Docs](https://doc.evolution-api.com/)
- [WhatsApp Business API](https://developers.facebook.com/docs/whatsapp)
- [Twilio WhatsApp](https://www.twilio.com/whatsapp)
- [Inngest Docs](https://www.inngest.com/docs)

---

**Tempo estimado:** 4-6 semanas  
**Prioridade:** 🔴 CRÍTICA  
**Impacto:** Redução de 30% em no-shows = Aumento de 30% na receita
