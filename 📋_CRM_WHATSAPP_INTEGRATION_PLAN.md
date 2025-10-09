# 📋 PLANO DETALHADO: CRM + WhatsApp + Supabase - Integração Unificada

## 🎯 OBJETIVO

Criar um sistema CRM completo integrado com WhatsApp Business API e Supabase, centralizando toda comunicação com pacientes em uma única plataforma.

---

## 📊 ANÁLISE DA ESTRUTURA ATUAL

### ✅ **JÁ IMPLEMENTADO**

#### **Database (Supabase)**
- ✅ Schema completo de comunicação (`20250103000001_create_communication_schema.sql`)
- ✅ Tabelas principais:
  - `communication_recipients` - Dados de contato
  - `messages` - Histórico de mensagens
  - `message_templates` - Templates reutilizáveis
  - `automation_rules` - Regras de automação
  - `communication_preferences` - Preferências do paciente
  - `message_queue_jobs` - Fila de mensagens
  - `communication_analytics` - Métricas e analytics

#### **Frontend**
- ✅ `CRMDashboardPage.tsx` - Dashboard CRM
- ✅ `CommunicationDashboard.tsx` - Dashboard de comunicação
- ✅ `WhatsAppManagementPage.tsx` - Gestão WhatsApp
- ✅ `WhatsAppMessagesPanel.tsx` - Painel de mensagens
- ✅ `WhatsappChatInterface.tsx` - Interface de chat
- ✅ `TemplateManager.tsx` - Gerenciador de templates
- ✅ `AutomationRulesManager.tsx` - Gerenciador de automações

#### **Componentes CRM**
- ✅ `LeadsKanban.tsx` - Pipeline de leads
- ✅ `LeadDetailPanel.tsx` - Detalhes do lead
- ✅ `DashboardMetrics.tsx` - Métricas do CRM
- ✅ `ConversionFunnelChart.tsx` - Funil de conversão

---

## ❌ O QUE FALTA IMPLEMENTAR

### **1. Sincronização WhatsApp ↔ Supabase**
- ❌ Webhook para receber mensagens do WhatsApp
- ❌ Serviço de sincronização bidirecional
- ❌ Atualização em tempo real via Supabase Realtime
- ❌ Parser de mensagens WhatsApp

### **2. Integração CRM ↔ Pacientes**
- ❌ Converter leads em pacientes automaticamente
- ❌ Sincronizar dados entre tabelas `leads` e `patients`
- ❌ Histórico unificado de interações
- ❌ Scoring automático de leads

### **3. Automações Inteligentes**
- ❌ Fluxos de nutrição de leads
- ❌ Follow-up automático pós-consulta
- ❌ Lembretes de retorno
- ❌ Campanha de reativação (pacientes inativos)
- ❌ Aniversariantes do mês

### **4. Interface Unificada**
- ❌ Inbox unificado (WhatsApp + Email + SMS)
- ❌ Timeline completa por paciente
- ❌ Chat em tempo real no sistema
- ❌ Notificações push no frontend

### **5. Analytics & Relatórios**
- ❌ Dashboard consolidado de comunicação
- ❌ ROI de campanhas
- ❌ Taxa de conversão Lead → Paciente
- ❌ Tempo médio de resposta
- ❌ Engajamento por canal

---

## 🏗️ ARQUITETURA DA SOLUÇÃO

```
┌─────────────────────────────────────────────────────────────┐
│                     FRONTEND (React)                        │
├─────────────────────────────────────────────────────────────┤
│  CRM Dashboard │ Communication Hub │ Patient Portal         │
│  • Leads       │ • WhatsApp Chat   │ • Timeline             │
│  • Pipeline    │ • Email           │ • Messages             │
│  • Analytics   │ • SMS             │ • Appointments         │
└────────────┬────────────────────────────────────────────────┘
             │
             │ Supabase Client (Realtime)
             ▼
┌─────────────────────────────────────────────────────────────┐
│                    SUPABASE (Backend)                        │
├─────────────────────────────────────────────────────────────┤
│  PostgreSQL Database:                                        │
│  ├─ patients                (base central)                  │
│  ├─ communication_recipients (extends patients)              │
│  ├─ messages                (histórico unificado)           │
│  ├─ message_templates       (templates)                     │
│  ├─ automation_rules        (regras)                        │
│  └─ communication_analytics (métricas)                      │
│                                                              │
│  Edge Functions:                                            │
│  ├─ whatsapp-webhook        (recebe mensagens)             │
│  ├─ whatsapp-send           (envia mensagens)              │
│  ├─ sync-patient-data       (sincroniza)                   │
│  └─ automation-engine       (executa regras)               │
│                                                              │
│  Realtime Subscriptions:                                    │
│  ├─ messages                (novas mensagens)              │
│  ├─ automation_executions   (logs)                         │
│  └─ communication_recipients (mudanças)                     │
└────────────┬────────────────────────────────────────────────┘
             │
             │ Webhooks & APIs
             ▼
┌─────────────────────────────────────────────────────────────┐
│               INTEGRAÇÕES EXTERNAS                           │
├─────────────────────────────────────────────────────────────┤
│  WhatsApp Business API  │  Twilio SMS  │  Resend Email      │
│  • Recebe mensagens     │  • Envia SMS │  • Envia emails    │
│  • Envia mensagens      │              │                    │
│  • Status delivery      │              │                    │
└─────────────────────────────────────────────────────────────┘
```

---

## 📝 IMPLEMENTAÇÃO DETALHADA

### **FASE 1: Sincronização WhatsApp ↔ Supabase** ⏱️ 2h

#### **1.1 Criar Supabase Edge Function para Webhook**

**Arquivo**: `supabase/functions/whatsapp-webhook/index.ts`

```typescript
import { serve } from 'std/http/server.ts';
import { createClient } from '@supabase/supabase-js';

serve(async (req) => {
  // Verificar token do WhatsApp
  if (req.method === 'GET') {
    const url = new URL(req.url);
    const mode = url.searchParams.get('hub.mode');
    const token = url.searchParams.get('hub.verify_token');
    const challenge = url.searchParams.get('hub.challenge');

    if (mode === 'subscribe' && token === Deno.env.get('WHATSAPP_VERIFY_TOKEN')) {
      return new Response(challenge, { status: 200 });
    }
    return new Response('Forbidden', { status: 403 });
  }

  // Receber mensagens
  const body = await req.json();
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  for (const entry of body.entry || []) {
    for (const change of entry.changes || []) {
      const messages = change.value?.messages || [];

      for (const msg of messages) {
        // Buscar ou criar recipient
        const phone = msg.from;
        let recipient = await findOrCreateRecipient(supabase, phone);

        // Salvar mensagem recebida
        await supabase.from('messages').insert({
          recipient_id: recipient.id,
          patient_id: recipient.patient_id,
          channel: 'whatsapp',
          type: 'generic',
          status: 'delivered',
          body: msg.text?.body || msg.caption || '',
          external_message_id: msg.id,
          delivered_at: new Date(msg.timestamp * 1000),
          metadata: { ...msg, direction: 'inbound' }
        });
      }
    }
  }

  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' }
  });
});
```

#### **1.2 Criar Serviço de Envio WhatsApp**

**Arquivo**: `services/whatsapp/whatsappService.ts`

```typescript
import { supabase } from '../supabase/client';

export interface SendWhatsAppMessageParams {
  to: string;
  message: string;
  template_id?: string;
  patient_id?: string;
}

export const whatsappService = {
  async sendMessage({ to, message, template_id, patient_id }: SendWhatsAppMessageParams) {
    // 1. Chamar WhatsApp Business API
    const response = await fetch(
      `https://graph.facebook.com/v18.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: to.replace(/\D/g, ''),
          type: 'text',
          text: { body: message }
        })
      }
    );

    const data = await response.json();

    // 2. Salvar no Supabase
    const { data: messageRecord, error } = await supabase
      .from('messages')
      .insert({
        patient_id,
        template_id,
        channel: 'whatsapp',
        type: 'generic',
        status: 'sent',
        body: message,
        external_message_id: data.messages?.[0]?.id,
        sent_at: new Date(),
        metadata: { direction: 'outbound', response: data }
      })
      .select()
      .single();

    return { success: true, message_id: messageRecord?.id, whatsapp_id: data.messages?.[0]?.id };
  },

  async getConversationHistory(patient_id: string) {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('patient_id', patient_id)
      .eq('channel', 'whatsapp')
      .order('created_at', { ascending: true });

    return data || [];
  },

  async markAsRead(message_id: string) {
    await supabase
      .from('messages')
      .update({ status: 'read', read_at: new Date() })
      .eq('id', message_id);
  }
};
```

#### **1.3 Criar Hook para Realtime**

**Arquivo**: `hooks/useWhatsAppRealtime.ts`

```typescript
import { useEffect, useState } from 'react';
import { supabase } from '../services/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

export function useWhatsAppRealtime(patient_id?: string) {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let channel: RealtimeChannel;

    const setupRealtime = async () => {
      // Buscar histórico inicial
      const { data } = await supabase
        .from('messages')
        .select('*')
        .eq('channel', 'whatsapp')
        .eq('patient_id', patient_id || '')
        .order('created_at', { ascending: true });

      setMessages(data || []);
      setLoading(false);

      // Subscribe para novas mensagens
      channel = supabase
        .channel(`whatsapp:${patient_id}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `patient_id=eq.${patient_id}`
          },
          (payload) => {
            setMessages((prev) => [...prev, payload.new]);
          }
        )
        .subscribe();
    };

    if (patient_id) {
      setupRealtime();
    }

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [patient_id]);

  return { messages, loading };
}
```

---

### **FASE 2: Integração CRM ↔ Pacientes** ⏱️ 3h

#### **2.1 Criar Migration para Tabela de Leads**

**Arquivo**: `supabase/migrations/20251009_create_leads_table.sql`

```sql
-- Tabela de Leads (prospects que ainda não são pacientes)
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Dados básicos
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(20),
  source VARCHAR(100), -- whatsapp, website, referral, etc

  -- Status do lead
  status VARCHAR(50) DEFAULT 'new' CHECK (status IN (
    'new', 'contacted', 'qualified', 'proposal_sent',
    'negotiation', 'won', 'lost'
  )),
  stage VARCHAR(50) DEFAULT 'lead',

  -- Scoring
  lead_score INTEGER DEFAULT 0 CHECK (lead_score BETWEEN 0 AND 100),
  engagement_level VARCHAR(20) DEFAULT 'cold' CHECK (engagement_level IN ('hot', 'warm', 'cold')),

  -- Relacionamento
  assigned_to UUID REFERENCES auth.users(id),
  converted_patient_id UUID REFERENCES patients(id),
  converted_at TIMESTAMP WITH TIME ZONE,

  -- Interesse
  interested_in TEXT,
  pain_points TEXT[],
  budget_range VARCHAR(50),
  urgency VARCHAR(20) CHECK (urgency IN ('high', 'medium', 'low')),

  -- Tracking
  first_contact_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_contact_at TIMESTAMP WITH TIME ZONE,
  next_followup_at TIMESTAMP WITH TIME ZONE,

  -- Metadata
  metadata JSONB DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  notes TEXT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_phone ON leads(phone);
CREATE INDEX idx_leads_email ON leads(email);
CREATE INDEX idx_leads_assigned_to ON leads(assigned_to);
CREATE INDEX idx_leads_next_followup ON leads(next_followup_at);

-- RLS
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view leads assigned to them" ON leads
  FOR SELECT USING (assigned_to = auth.uid());

CREATE POLICY "Admins can manage all leads" ON leads
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Função para converter lead em paciente
CREATE OR REPLACE FUNCTION convert_lead_to_patient(
  lead_id_param UUID
)
RETURNS UUID AS $$
DECLARE
  new_patient_id UUID;
  lead_record RECORD;
BEGIN
  -- Buscar lead
  SELECT * INTO lead_record FROM leads WHERE id = lead_id_param;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Lead not found';
  END IF;

  -- Criar paciente
  INSERT INTO patients (name, email, phone, source, metadata)
  VALUES (
    lead_record.name,
    lead_record.email,
    lead_record.phone,
    lead_record.source,
    jsonb_build_object(
      'converted_from_lead_id', lead_record.id,
      'lead_score', lead_record.lead_score,
      'original_notes', lead_record.notes
    )
  )
  RETURNING id INTO new_patient_id;

  -- Criar recipient de comunicação
  INSERT INTO communication_recipients (
    patient_id, name, email, phone, preferred_channel, metadata
  )
  VALUES (
    new_patient_id,
    lead_record.name,
    lead_record.email,
    lead_record.phone,
    'whatsapp',
    jsonb_build_object('lead_id', lead_record.id)
  );

  -- Atualizar lead
  UPDATE leads
  SET
    status = 'won',
    converted_patient_id = new_patient_id,
    converted_at = NOW()
  WHERE id = lead_id_param;

  -- Transferir mensagens
  UPDATE messages
  SET patient_id = new_patient_id
  WHERE patient_id IS NULL
    AND recipient_id IN (
      SELECT id FROM communication_recipients
      WHERE phone = lead_record.phone OR email = lead_record.email
    );

  RETURN new_patient_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

#### **2.2 Serviço de Gestão de Leads**

**Arquivo**: `services/crm/leadService.ts`

```typescript
import { supabase } from '../supabase/client';

export interface Lead {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  status: string;
  lead_score: number;
  engagement_level: 'hot' | 'warm' | 'cold';
  source?: string;
  interested_in?: string;
  next_followup_at?: Date;
}

export const leadService = {
  async createLeadFromWhatsApp(phone: string, name: string, message: string) {
    const { data: lead, error } = await supabase
      .from('leads')
      .insert({
        name,
        phone,
        source: 'whatsapp',
        status: 'new',
        lead_score: 50, // Score inicial
        engagement_level: 'warm',
        notes: `Primeira mensagem: ${message}`,
        first_contact_at: new Date()
      })
      .select()
      .single();

    if (error) throw error;

    // Criar recipient
    await supabase.from('communication_recipients').insert({
      name,
      phone,
      preferred_channel: 'whatsapp',
      metadata: { lead_id: lead.id }
    });

    return lead;
  },

  async convertToPatient(lead_id: string) {
    const { data, error } = await supabase.rpc('convert_lead_to_patient', {
      lead_id_param: lead_id
    });

    if (error) throw error;
    return data; // patient_id
  },

  async updateLeadScore(lead_id: string) {
    // Calcular score baseado em:
    // - Número de interações
    // - Tempo desde último contato
    // - Engajamento com mensagens
    // - Preenchimento de informações

    const { data: messages } = await supabase
      .from('messages')
      .select('*')
      .eq('metadata->lead_id', lead_id);

    let score = 0;

    // +10 pontos por cada mensagem recebida (max 30)
    score += Math.min(messages?.length || 0 * 10, 30);

    // +20 se respondeu nas últimas 24h
    const lastMessage = messages?.[messages.length - 1];
    if (lastMessage &&
        new Date(lastMessage.created_at).getTime() > Date.now() - 24 * 60 * 60 * 1000) {
      score += 20;
    }

    // +20 se tem email preenchido
    const { data: lead } = await supabase
      .from('leads')
      .select('email, interested_in')
      .eq('id', lead_id)
      .single();

    if (lead?.email) score += 20;
    if (lead?.interested_in) score += 15;

    // Atualizar
    await supabase
      .from('leads')
      .update({
        lead_score: Math.min(score, 100),
        engagement_level: score >= 70 ? 'hot' : score >= 40 ? 'warm' : 'cold'
      })
      .eq('id', lead_id);
  },

  async getLeadsByStage() {
    const { data, error } = await supabase
      .from('leads')
      .select('*, assigned_to(name)')
      .order('lead_score', { ascending: false });

    if (error) throw error;

    // Agrupar por status
    const grouped = {
      new: data?.filter(l => l.status === 'new') || [],
      contacted: data?.filter(l => l.status === 'contacted') || [],
      qualified: data?.filter(l => l.status === 'qualified') || [],
      negotiation: data?.filter(l => l.status === 'negotiation') || [],
      won: data?.filter(l => l.status === 'won') || [],
      lost: data?.filter(l => l.status === 'lost') || []
    };

    return grouped;
  }
};
```

---

### **FASE 3: Automações Inteligentes** ⏱️ 2h

#### **3.1 Criar Regras de Automação Padrão**

**Arquivo**: `scripts/seed-automation-rules.ts`

```typescript
import { supabase } from '../services/supabase/client';

const defaultAutomationRules = [
  {
    name: 'Boas-vindas para novos leads',
    description: 'Envia mensagem automática quando um lead entra em contato pela primeira vez',
    trigger_type: 'patient',
    trigger_config: {
      event: 'lead_created',
      source: 'whatsapp'
    },
    conditions: [],
    actions: [
      {
        type: 'send_message',
        delay_minutes: 0,
        template_id: 'welcome_lead',
        channel: 'whatsapp',
        message: `Olá {{name}}! 👋

Obrigado por entrar em contato com {{clinic.name}}!

Somos especialistas em fisioterapia e estamos aqui para ajudá-lo a recuperar sua saúde e bem-estar.

Como podemos te ajudar hoje?

Responda esta mensagem e já vamos conversar! 😊`
      }
    ],
    priority: 10,
    is_active: true
  },

  {
    name: 'Lembrete de consulta (1 dia antes)',
    description: 'Envia lembrete automático 24h antes da consulta',
    trigger_type: 'appointment',
    trigger_config: {
      event: 'appointment_scheduled',
      time_before_hours: 24
    },
    conditions: [
      {
        field: 'appointment.status',
        operator: 'equals',
        value: 'confirmed'
      }
    ],
    actions: [
      {
        type: 'send_message',
        template_id: 'appointment_reminder',
        channel: 'whatsapp'
      }
    ],
    priority: 8,
    is_active: true
  },

  {
    name: 'Follow-up pós-consulta',
    description: 'Pergunta sobre a experiência 24h após a consulta',
    trigger_type: 'appointment',
    trigger_config: {
      event: 'appointment_completed',
      time_after_hours: 24
    },
    actions: [
      {
        type: 'send_message',
        channel: 'whatsapp',
        message: `Olá {{patient.name}}!

Como foi sua consulta ontem com {{appointment.therapist}}?

Gostaríamos de saber sua opinião para melhorarmos sempre! 📊

De 0 a 10, como você avalia seu atendimento?`
      }
    ],
    priority: 5,
    is_active: true
  },

  {
    name: 'Reativação de pacientes inativos',
    description: 'Envia mensagem para pacientes sem consulta há 60 dias',
    trigger_type: 'system',
    trigger_config: {
      schedule: 'daily',
      condition: 'last_appointment_days_ago > 60'
    },
    actions: [
      {
        type: 'send_message',
        channel: 'whatsapp',
        message: `Olá {{patient.name}}! 😊

Sentimos sua falta aqui na {{clinic.name}}!

Como você está? Gostaria de agendar uma consulta de retorno?

Estamos com novos horários disponíveis! 📅`
      }
    ],
    priority: 3,
    is_active: false // Desativado por padrão
  },

  {
    name: 'Aniversariantes do mês',
    description: 'Parabeniza pacientes no aniversário',
    trigger_type: 'patient',
    trigger_config: {
      event: 'birthday',
      time: '09:00'
    },
    actions: [
      {
        type: 'send_message',
        channel: 'whatsapp',
        message: `🎉 Parabéns, {{patient.name}}! 🎂

Toda a equipe da {{clinic.name}} deseja um feliz aniversário!

Que este novo ano seja repleto de saúde e alegria! 🎈✨`
      }
    ],
    priority: 2,
    is_active: true
  }
];

export async function seedAutomationRules() {
  for (const rule of defaultAutomationRules) {
    await supabase.from('automation_rules').upsert(rule);
  }
  console.log('✅ Regras de automação criadas com sucesso!');
}
```

---

### **FASE 4: Interface Unificada** ⏱️ 4h

#### **4.1 Página de CRM Unificado**

**Arquivo**: `pages/UnifiedCRMPage.tsx`

```typescript
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Card } from '../components/ui/card';
import { MessageSquare, Users, TrendingUp, Settings } from 'lucide-react';

// Importar componentes
import { LeadsKanban } from '../components/crm/LeadsKanban';
import { UnifiedInbox } from '../components/crm/UnifiedInbox';
import { CRMAnalytics } from '../components/crm/CRMAnalytics';
import { AutomationManager } from '../components/crm/AutomationManager';

export const UnifiedCRMPage: React.FC = () => {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">CRM + WhatsApp Integrado</h1>
        <p className="text-gray-600">
          Gerencie leads, pacientes e toda comunicação em um só lugar
        </p>
      </div>

      <Tabs defaultValue="inbox" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="inbox">
            <MessageSquare className="w-4 h-4 mr-2" />
            Inbox
          </TabsTrigger>
          <TabsTrigger value="leads">
            <Users className="w-4 h-4 mr-2" />
            Pipeline
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <TrendingUp className="w-4 h-4 mr-2" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="automation">
            <Settings className="w-4 h-4 mr-2" />
            Automações
          </TabsTrigger>
        </TabsList>

        <TabsContent value="inbox">
          <UnifiedInbox />
        </TabsContent>

        <TabsContent value="leads">
          <LeadsKanban />
        </TabsContent>

        <TabsContent value="analytics">
          <CRMAnalytics />
        </TabsContent>

        <TabsContent value="automation">
          <AutomationManager />
        </TabsContent>
      </Tabs>
    </div>
  );
};
```

#### **4.2 Inbox Unificado**

**Arquivo**: `components/crm/UnifiedInbox.tsx`

```typescript
import React, { useState } from 'react';
import { useWhatsAppRealtime } from '../../hooks/useWhatsAppRealtime';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Avatar } from '../ui/avatar';
import { Send, Phone, Mail, MessageSquare } from 'lucide-react';
import { whatsappService } from '../../services/whatsapp/whatsappService';

export const UnifiedInbox: React.FC = () => {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messageText, setMessageText] = useState('');
  const { messages, loading } = useWhatsAppRealtime(selectedConversation || undefined);

  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedConversation) return;

    await whatsappService.sendMessage({
      to: selectedConversation,
      message: messageText,
      patient_id: selectedConversation
    });

    setMessageText('');
  };

  return (
    <div className="grid grid-cols-3 gap-4 h-[700px]">
      {/* Lista de conversas */}
      <Card className="col-span-1 p-4 overflow-y-auto">
        <h3 className="font-semibold mb-4">Conversas</h3>
        {/* Lista de contatos */}
        <ConversationList onSelect={setSelectedConversation} />
      </Card>

      {/* Área de chat */}
      <Card className="col-span-2 p-0 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Header */}
            <div className="border-b p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar>
                  <div className="bg-blue-500 w-full h-full flex items-center justify-center text-white">
                    <MessageSquare />
                  </div>
                </Avatar>
                <div>
                  <p className="font-semibold">Nome do Paciente</p>
                  <p className="text-sm text-gray-500">Online</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="icon">
                  <Phone className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Mensagens */}
            <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
              {messages.map((msg) => (
                <MessageBubble key={msg.id} message={msg} />
              ))}
            </div>

            {/* Input */}
            <div className="border-t p-4 flex gap-2">
              <Input
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Digite sua mensagem..."
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              />
              <Button onClick={handleSendMessage}>
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            Selecione uma conversa para começar
          </div>
        )}
      </Card>
    </div>
  );
};
```

---

## 🚀 PLANO DE EXECUÇÃO

### **Cronograma Estimado: 12 horas**

| Fase | Descrição | Tempo | Status |
|------|-----------|-------|--------|
| 1 | Sincronização WhatsApp ↔ Supabase | 2h | ⏳ |
| 2 | Integração CRM ↔ Pacientes | 3h | ⏳ |
| 3 | Automações Inteligentes | 2h | ⏳ |
| 4 | Interface Unificada | 4h | ⏳ |
| 5 | Testes e Ajustes | 1h | ⏳ |

### **Ordem de Implementação**

1. ✅ Criar migration da tabela `leads`
2. ✅ Implementar `leadService.ts`
3. ✅ Criar Edge Function `whatsapp-webhook`
4. ✅ Implementar `whatsappService.ts`
5. ✅ Criar hook `useWhatsAppRealtime`
6. ✅ Seed de automações padrão
7. ✅ Componente `UnifiedInbox`
8. ✅ Página `UnifiedCRMPage`
9. ✅ Testes integrados
10. ✅ Deploy e configuração final

---

## ✅ CHECKLIST DE VALIDAÇÃO

### **Backend**
- [ ] Webhook WhatsApp recebe mensagens
- [ ] Mensagens são salvas no Supabase
- [ ] Envio de mensagens funciona
- [ ] Conversão Lead → Paciente funciona
- [ ] Automações são executadas
- [ ] Realtime Subscriptions funcionam

### **Frontend**
- [ ] Inbox mostra conversas em tempo real
- [ ] Envio de mensagens funciona
- [ ] Kanban de leads funciona
- [ ] Conversão de lead para paciente
- [ ] Analytics carregam corretamente
- [ ] Notificações aparecem

### **Integração**
- [ ] WhatsApp Business API configurada
- [ ] Webhook URL configurada no Meta
- [ ] Variáveis de ambiente configuradas
- [ ] RLS policies testadas
- [ ] Performance otimizada

---

## 🎯 RESULTADO ESPERADO

### **Para o Usuário**
✅ Inbox unificado com WhatsApp, Email e SMS
✅ Chat em tempo real dentro do sistema
✅ Pipeline visual de leads (kanban)
✅ Conversão automática de leads em pacientes
✅ Histórico completo de interações
✅ Automações inteligentes funcionando
✅ Analytics detalhados de comunicação
✅ Gestão centralizada em uma única base

### **Benefícios**
- 🚀 **Produtividade**: Tudo em um só lugar
- 💰 **Conversão**: Lead scoring automático
- ⚡ **Velocidade**: Respostas mais rápidas
- 📊 **Insights**: Métricas em tempo real
- 🤖 **Automação**: Menos trabalho manual
- 💾 **Dados**: Base unificada no Supabase

---

**Pronto para implementar? Vamos começar!** 🚀
