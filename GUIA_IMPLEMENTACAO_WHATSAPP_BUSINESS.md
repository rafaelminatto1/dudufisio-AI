# Guia de Implementação - WhatsApp Business API
**MoocaFisio** | Data: 04 de Novembro de 2025

## 📋 Visão Geral

Este guia completa a integração WhatsApp Business API, construindo sobre a base já existente no projeto.

### O Que Já Existe ✅
- ✅ `services/whatsapp/whatsappBusinessService.ts` - Serviço principal
- ✅ `services/templates/whatsappTemplates.ts` - 15 templates pré-definidos
- ✅ Funções para envio de texto, templates e mensagens especiais
- ✅ Normalização de números (Brasil +55)
- ✅ Logging e tratamento de erros

### O Que Vamos Adicionar 🚀
- 📦 Edge Function Supabase para envio centralizado
- 💾 Tabela para gerenciar opt-in/opt-out
- 🔗 Integração com sistema de notificações
- 📚 Documentação de setup Meta Business

---

## 🏗️ Arquitetura Proposta

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React)                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌────────────────────┐         ┌──────────────────────┐       │
│  │ WhatsApp           │         │ Notification         │       │
│  │ Management Page    │         │ Service              │       │
│  └─────────┬──────────┘         └──────────┬───────────┘       │
│            │                               │                    │
│            └───────────────┬───────────────┘                    │
│                            │                                    │
│                ┌───────────▼──────────────┐                     │
│                │ Supabase Client          │                     │
│                └───────────┬──────────────┘                     │
└────────────────────────────┼────────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────────┐
│                         BACKEND                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────────┐         ┌─────────────────────────┐  │
│  │ Supabase Database    │         │ Edge Function           │  │
│  │ - whatsapp_opt_ins   │◄────────┤ send-whatsapp           │  │
│  │ - whatsapp_templates │         └──────────┬──────────────┘  │
│  │ - whatsapp_logs      │                    │                  │
│  └──────────────────────┘                    │                  │
│                                               │                  │
│                            ┌──────────────────▼──────┐           │
│                            │ Meta WhatsApp Cloud API │           │
│                            │ graph.facebook.com/v21  │           │
│                            └─────────────────────────┘           │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📅 Plano de Implementação

### FASE 1: Setup Meta Business (1-2 horas)
### FASE 2: Database & Migrations (30 minutos)
### FASE 3: Edge Function (1 hora)
### FASE 4: Integração com Notificações (1 hora)
### FASE 5: UI de Gerenciamento (2 horas)
### FASE 6: Testes e Deploy (1-2 horas)

**Total estimado**: 6-8 horas

---

## 🚀 FASE 1: Setup Meta Business

### Passo 1: Criar Conta Meta Business

1. Acessar [Meta Business Suite](https://business.facebook.com/)
2. Criar conta comercial
3. Verificar empresa (documentos necessários)

### Passo 2: Configurar WhatsApp Business API

1. Acessar [Meta Developers](https://developers.facebook.com/)
2. Criar novo App
   - Tipo: Business
   - Nome: MoocaFisio
   - Categoria: Healthcare

3. Adicionar produto WhatsApp
   - Selecionar "WhatsApp" nos produtos
   - Configurar perfil comercial

### Passo 3: Obter Credenciais

No painel do app, obter:
- **Phone Number ID** (ID do número de telefone)
- **WhatsApp Business Account ID**
- **Access Token** (permanente)

### Passo 4: Registrar Número de Telefone

1. Adicionar número brasileiro
2. Verificar por SMS
3. Configurar perfil:
   - Nome: MoocaFisio
   - Categoria: Saúde e Medicina
   - Descrição: Clínica de Fisioterapia
   - Endereço e horários

### Passo 5: Configurar Variáveis de Ambiente

Adicionar no `.env.local`:

```bash
# WhatsApp Business API - Meta Cloud API
VITE_WHATSAPP_ENABLED=true
WHATSAPP_API_URL=https://graph.facebook.com/v21.0
WHATSAPP_PHONE_NUMBER_ID=seu-phone-number-id
WHATSAPP_ACCESS_TOKEN=seu-access-token-permanente
WHATSAPP_BUSINESS_ACCOUNT_ID=seu-business-account-id

# Webhook para receber mensagens (opcional)
WHATSAPP_WEBHOOK_VERIFY_TOKEN=moocafisio_webhook_2025
```

### Passo 6: Aprovar Templates

Templates precisam ser aprovados pela Meta antes de usar em produção.

**Processo de aprovação**:
1. Acessar Meta Business Suite → WhatsApp Manager
2. Ir em Message Templates
3. Criar novo template:
   - Nome: `lembrete_consulta_24h`
   - Categoria: `UTILITY`
   - Idioma: Português (Brasil)
   - Corpo da mensagem:
   ```
   Olá {{1}}!

   Sua consulta é amanhã:
   📅 {{2}} às {{3}}

   Confirma presença?
   Digite SIM ou, se precisar remarcar, digite REMARCAR.
   ```
   - Submeter para aprovação

**Tempo de aprovação**: 1-24 horas

**Templates prioritários** (criar nesta ordem):
1. ✅ `lembrete_consulta_24h` - UTILITY
2. ✅ `confirmacao_agendamento` - UTILITY
3. ✅ `lembrete_consulta_2h` - UTILITY
4. ✅ `cancelamento_consulta` - UTILITY
5. ✅ `boas_vindas_paciente` - MARKETING

---

## 🗄️ FASE 2: Database & Migrations

### Migration 1: Tabela de Opt-In/Opt-Out

```sql
-- supabase/migrations/00X_create_whatsapp_preferences.sql

-- Tabela para gerenciar preferências de WhatsApp
CREATE TABLE IF NOT EXISTS public.whatsapp_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
  phone_number TEXT NOT NULL,
  opted_in BOOLEAN DEFAULT true NOT NULL,
  opted_in_at TIMESTAMPTZ,
  opted_out_at TIMESTAMPTZ,
  opt_out_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- Garantir um registro por paciente
  UNIQUE(patient_id),
  -- Garantir um registro por número
  UNIQUE(phone_number)
);

-- Índices
CREATE INDEX idx_whatsapp_prefs_patient ON public.whatsapp_preferences(patient_id);
CREATE INDEX idx_whatsapp_prefs_phone ON public.whatsapp_preferences(phone_number);
CREATE INDEX idx_whatsapp_prefs_opted_in ON public.whatsapp_preferences(opted_in) WHERE opted_in = true;

-- RLS
ALTER TABLE public.whatsapp_preferences ENABLE ROW LEVEL SECURITY;

-- Políticas
CREATE POLICY "Staff can view all preferences"
  ON public.whatsapp_preferences
  FOR SELECT
  USING (auth.jwt() ->> 'role' IN ('admin', 'therapist'));

CREATE POLICY "Staff can insert preferences"
  ON public.whatsapp_preferences
  FOR INSERT
  WITH CHECK (auth.jwt() ->> 'role' IN ('admin', 'therapist'));

CREATE POLICY "Staff can update preferences"
  ON public.whatsapp_preferences
  FOR UPDATE
  USING (auth.jwt() ->> 'role' IN ('admin', 'therapist'));

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_whatsapp_prefs_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER whatsapp_prefs_updated_at
  BEFORE UPDATE ON public.whatsapp_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_whatsapp_prefs_updated_at();

-- Comentários
COMMENT ON TABLE public.whatsapp_preferences IS 'Preferências de opt-in/opt-out para WhatsApp';
COMMENT ON COLUMN public.whatsapp_preferences.opted_in IS 'Se o paciente quer receber mensagens no WhatsApp';
COMMENT ON COLUMN public.whatsapp_preferences.opt_out_reason IS 'Motivo do opt-out (se fornecido)';
```

### Migration 2: Tabela de Log de Mensagens

```sql
-- supabase/migrations/00X_create_whatsapp_logs.sql

-- Tabela para log de mensagens enviadas
CREATE TABLE IF NOT EXISTS public.whatsapp_messages_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES public.patients(id) ON DELETE SET NULL,
  phone_number TEXT NOT NULL,
  message_type TEXT NOT NULL, -- 'text', 'template', 'reminder', etc.
  template_id TEXT,
  message_content TEXT,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'sent', 'delivered', 'read', 'failed'
  whatsapp_message_id TEXT, -- ID retornado pela Meta API
  error_message TEXT,
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Índices
CREATE INDEX idx_whatsapp_logs_patient ON public.whatsapp_messages_log(patient_id);
CREATE INDEX idx_whatsapp_logs_phone ON public.whatsapp_messages_log(phone_number);
CREATE INDEX idx_whatsapp_logs_status ON public.whatsapp_messages_log(status);
CREATE INDEX idx_whatsapp_logs_created ON public.whatsapp_messages_log(created_at DESC);

-- RLS
ALTER TABLE public.whatsapp_messages_log ENABLE ROW LEVEL SECURITY;

-- Políticas
CREATE POLICY "Staff can view all logs"
  ON public.whatsapp_messages_log
  FOR SELECT
  USING (auth.jwt() ->> 'role' IN ('admin', 'therapist'));

CREATE POLICY "Staff can insert logs"
  ON public.whatsapp_messages_log
  FOR INSERT
  WITH CHECK (auth.jwt() ->> 'role' IN ('admin', 'therapist'));

-- Comentários
COMMENT ON TABLE public.whatsapp_messages_log IS 'Log de todas mensagens WhatsApp enviadas';
```

---

## 🔧 FASE 3: Edge Function

### Arquivo: `supabase/functions/send-whatsapp/index.ts`

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface WhatsAppMessageRequest {
  patientId?: string;
  patientIds?: string[];
  phoneNumber?: string; // Para casos onde não há patient_id
  type: 'text' | 'template';
  message?: string; // Para type: 'text'
  templateName?: string; // Para type: 'template'
  templateVariables?: string[]; // Para type: 'template'
  languageCode?: string; // Padrão: 'pt_BR'
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const {
      patientId,
      patientIds,
      phoneNumber,
      type,
      message,
      templateName,
      templateVariables = [],
      languageCode = 'pt_BR'
    }: WhatsAppMessageRequest = await req.json()

    // Validações
    if (!type) {
      return new Response(
        JSON.stringify({ error: 'Type is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    if (type === 'text' && !message) {
      return new Response(
        JSON.stringify({ error: 'Message is required for text type' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    if (type === 'template' && !templateName) {
      return new Response(
        JSON.stringify({ error: 'Template name is required for template type' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // WhatsApp config from environment
    const whatsappApiUrl = Deno.env.get('WHATSAPP_API_URL')
    const phoneNumberId = Deno.env.get('WHATSAPP_PHONE_NUMBER_ID')
    const accessToken = Deno.env.get('WHATSAPP_ACCESS_TOKEN')

    if (!whatsappApiUrl || !phoneNumberId || !accessToken) {
      throw new Error('WhatsApp configuration missing')
    }

    // Conectar ao Supabase
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Buscar pacientes com opt-in ativo
    let query = supabaseClient
      .from('whatsapp_preferences')
      .select('patient_id, phone_number')
      .eq('opted_in', true)

    if (phoneNumber) {
      // Envio direto para número
      query = query.eq('phone_number', phoneNumber)
    } else if (patientId) {
      query = query.eq('patient_id', patientId)
    } else if (patientIds && patientIds.length > 0) {
      query = query.in('patient_id', patientIds)
    } else {
      return new Response(
        JSON.stringify({ error: 'patientId, patientIds, or phoneNumber is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    const { data: preferences, error: prefsError } = await query

    if (prefsError) throw new Error(`Failed to fetch preferences: ${prefsError.message}`)

    if (!preferences || preferences.length === 0) {
      return new Response(
        JSON.stringify({ success: true, sent: 0, message: 'No opted-in recipients found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      )
    }

    // Enviar mensagens
    const promises = preferences.map(async ({ patient_id, phone_number }) => {
      try {
        // Normalizar número
        const normalizedPhone = phone_number.replace(/\D/g, '')
        const to = normalizedPhone.startsWith('55') ? normalizedPhone : `55${normalizedPhone}`

        // Construir payload
        let payload: any = {
          messaging_product: 'whatsapp',
          to,
        }

        if (type === 'text') {
          payload.type = 'text'
          payload.text = { body: message }
        } else if (type === 'template') {
          payload.type = 'template'
          payload.template = {
            name: templateName,
            language: { code: languageCode },
          }

          if (templateVariables.length > 0) {
            payload.template.components = [
              {
                type: 'body',
                parameters: templateVariables.map(v => ({
                  type: 'text',
                  text: v
                }))
              }
            ]
          }
        }

        // Enviar via Meta API
        const response = await fetch(
          `${whatsappApiUrl}/${phoneNumberId}/messages`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
          }
        )

        const result = await response.json()

        // Log no banco
        await supabaseClient.from('whatsapp_messages_log').insert({
          patient_id,
          phone_number: to,
          message_type: type,
          template_id: type === 'template' ? templateName : null,
          message_content: type === 'text' ? message : JSON.stringify(payload),
          status: response.ok ? 'sent' : 'failed',
          whatsapp_message_id: result.messages?.[0]?.id,
          error_message: response.ok ? null : result.error?.message,
          sent_at: response.ok ? new Date().toISOString() : null,
        })

        return {
          patient_id,
          phone_number: to,
          success: response.ok,
          whatsapp_message_id: result.messages?.[0]?.id,
          error: response.ok ? null : result.error?.message
        }
      } catch (error) {
        return { patient_id, phone_number, success: false, error: error.message }
      }
    })

    const results = await Promise.all(promises)
    const successCount = results.filter(r => r.success).length
    const failureCount = results.filter(r => !r.success).length

    return new Response(
      JSON.stringify({
        success: true,
        sent: successCount,
        failed: failureCount,
        total: results.length,
        results
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  } catch (error) {
    console.error('Error sending WhatsApp:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
```

---

## 📝 FASE 4: Documentação de Deploy

### Deploy da Edge Function

```bash
# 1. Deploy
npx supabase functions deploy send-whatsapp

# 2. Configurar secrets
npx supabase secrets set WHATSAPP_API_URL="https://graph.facebook.com/v21.0"
npx supabase secrets set WHATSAPP_PHONE_NUMBER_ID="seu-phone-number-id"
npx supabase secrets set WHATSAPP_ACCESS_TOKEN="seu-access-token"
```

---

## 🧪 FASE 5: Testes

### Teste 1: Envio de Texto Simples

```typescript
const { data, error } = await supabase.functions.invoke('send-whatsapp', {
  body: {
    phoneNumber: '+5511999998888',
    type: 'text',
    message: 'Teste de mensagem do MoocaFisio!'
  }
});
```

### Teste 2: Envio de Template

```typescript
const { data, error } = await supabase.functions.invoke('send-whatsapp', {
  body: {
    patientId: 'uuid-do-paciente',
    type: 'template',
    templateName: 'lembrete_consulta_24h',
    templateVariables: ['João', '05/11/2025', '14:00']
  }
});
```

---

## 📋 Checklist Final

### Meta Business
- [ ] Conta Meta Business criada
- [ ] App criado no Meta Developers
- [ ] WhatsApp Business API configurado
- [ ] Número verificado
- [ ] Templates aprovados (mínimo 3)

### Backend
- [ ] Migrations aplicadas
- [ ] Edge Function deployed
- [ ] Secrets configurados
- [ ] Testes bem-sucedidos

### Frontend
- [ ] Página de gerenciamento de WhatsApp
- [ ] Sistema de opt-in/opt-out
- [ ] Integração com notificações

---

## 🎯 Próximos Passos

Depois de completar esta implementação:
1. Integrar com sistema de agendamentos automáticos
2. Criar dashboard de métricas WhatsApp
3. Implementar chatbot simples
4. Adicionar templates de remarketing

---

**Desenvolvido por**: Claude (Anthropic)
**Projeto**: MoocaFisio
**Data**: 04 de Novembro de 2025
**Tempo Estimado**: 6-8 horas
