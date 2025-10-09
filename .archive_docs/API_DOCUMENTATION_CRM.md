# 📖 API Documentation - CRM

> **Documentação completa da API do CRM**  
> Activity Fisioterapia Integration

---

## 🎯 Base URL

```
Development: http://localhost:3000
Production: https://your-domain.com
```

---

## 🔐 Autenticação

Todas as requisições devem incluir token de autenticação do Supabase:

```javascript
headers: {
  'Authorization': 'Bearer YOUR_SUPABASE_TOKEN',
  'Content-Type': 'application/json'
}
```

---

## 📋 LEADS

### POST /api/crm/leads
Criar novo lead

**Request:**
```json
{
  "clinic_id": "uuid",
  "name": "João Silva",
  "phone": "+5511999999999",
  "email": "joao@example.com",
  "source": "whatsapp",
  "service_interest": "fisioterapia_esportiva",
  "pain_description": "Dor no joelho há 2 semanas",
  "urgency_level": "alta"
}
```

**Response:**
```json
{
  "id": "uuid",
  "clinic_id": "uuid",
  "name": "João Silva",
  "phone": "+5511999999999",
  "status": "novo",
  "urgency_level": "alta",
  "created_at": "2025-10-08T10:00:00Z"
}
```

### GET /api/crm/leads
Listar leads com filtros

**Query Parameters:**
```
clinic_id: string (obrigatório)
status: novo|contatado|qualificado|agendado|convertido|perdido
source: whatsapp|instagram|google|facebook|indicacao
urgency_level: baixa|media|alta|urgente
assigned_to: uuid
date_from: ISO date
date_to: ISO date
search: string
page: number (default: 1)
limit: number (default: 50)
```

**Response:**
```json
{
  "leads": [...],
  "total": 150,
  "page": 1,
  "limit": 50
}
```

### GET /api/crm/leads/:id
Buscar lead específico

**Response:**
```json
{
  "id": "uuid",
  "name": "João Silva",
  "phone": "+5511999999999",
  "status": "qualificado",
  "interactions": [...],
  ...
}
```

### PATCH /api/crm/leads/:id
Atualizar lead

**Request:**
```json
{
  "status": "qualificado",
  "urgency_level": "alta",
  "notes": ["Lead muito interessado"]
}
```

### DELETE /api/crm/leads/:id
Soft delete de lead

### POST /api/crm/leads/:id/convert
Converter lead em paciente

**Response:**
```json
{
  "patientId": "uuid",
  "lead": {...}
}
```

---

## 💬 INTERACTIONS

### POST /api/crm/interactions
Registrar interação

**Request:**
```json
{
  "lead_id": "uuid",
  "clinic_id": "uuid",
  "interaction_type": "whatsapp",
  "direction": "outbound",
  "message_content": "Olá! Como posso ajudar?",
  "is_automated": false
}
```

### GET /api/crm/leads/:id/interactions
Buscar histórico de interações

**Response:**
```json
{
  "interactions": [
    {
      "id": "uuid",
      "interaction_type": "whatsapp",
      "direction": "inbound",
      "message_content": "Estou com dor no joelho",
      "detected_intent": "pain_sports",
      "created_at": "2025-10-08T10:00:00Z"
    }
  ]
}
```

---

## 📊 METRICS

### GET /api/crm/metrics/dashboard
Métricas do dashboard

**Query:**
```
clinic_id: uuid (obrigatório)
```

**Response:**
```json
{
  "total_leads": 150,
  "new_leads_today": 5,
  "new_leads_week": 25,
  "leads_by_status": {
    "novo": 30,
    "contatado": 40,
    "qualificado": 35,
    "agendado": 20,
    "convertido": 20,
    "perdido": 5
  },
  "conversion_rate": 25.5,
  "avg_response_time_minutes": 15,
  "urgent_leads": 8,
  "leads_needing_followup": 12
}
```

### GET /api/crm/metrics/funnel
Funil de conversão

**Query:**
```
clinic_id: uuid
date_from: ISO date (opcional)
date_to: ISO date (opcional)
```

**Response:**
```json
{
  "total": 100,
  "contacted": 80,
  "qualified": 50,
  "scheduled": 30,
  "converted": 20,
  "contact_rate": 80,
  "qualification_rate": 50,
  "schedule_rate": 30,
  "conversion_rate": 20
}
```

### GET /api/crm/metrics/sources
Performance por fonte

**Response:**
```json
{
  "sources": [
    {
      "source": "whatsapp",
      "total_leads": 80,
      "converted_leads": 25,
      "conversion_rate": 31.25,
      "avg_value": 500,
      "total_value": 12500
    }
  ]
}
```

---

## 🤖 WHATSAPP

### POST /api/whatsapp/send
Enviar mensagem

**Request:**
```json
{
  "to": "+5511999999999",
  "message": "Olá! Como posso ajudar?",
  "clinic_id": "uuid"
}
```

### POST /api/whatsapp/send-template
Enviar template

**Request:**
```json
{
  "to": "+5511999999999",
  "template_name": "confirmacao_agendamento",
  "variables": ["15/10/2025", "14:00", "Dr. Eduardo"],
  "clinic_id": "uuid"
}
```

### POST /api/webhooks/whatsapp
Webhook (Meta/Twilio chama automaticamente)

---

## 🎮 GAMIFICATION

### GET /api/gamification/balance/:patientId
Saldo de pontos

**Response:**
```json
{
  "balance": 1250
}
```

### GET /api/gamification/level/:patientId
Nível do paciente

**Response:**
```json
{
  "level_name": "Prata",
  "level_number": 3,
  "current_points": 1250,
  "points_to_next": 750
}
```

### POST /api/gamification/points
Adicionar pontos

**Request:**
```json
{
  "patient_id": "uuid",
  "points": 50,
  "reason": "Consulta realizada",
  "category": "attendance"
}
```

### POST /api/gamification/redeem
Resgatar recompensa

**Request:**
```json
{
  "patient_id": "uuid",
  "reward_id": "uuid"
}
```

---

## 💳 PAYMENT

### POST /api/payment/create-link
Criar link de pagamento

**Request:**
```json
{
  "appointment_id": "uuid"
}
```

**Response:**
```json
{
  "url": "https://checkout.stripe.com/...",
  "payment_id": "pi_xxxxx",
  "expires_at": "2025-10-09T10:00:00Z"
}
```

### POST /api/payment/create-pix
Criar pagamento PIX

**Request:**
```json
{
  "appointment_id": "uuid",
  "value": 115.00
}
```

**Response:**
```json
{
  "qr_code": "https://...",
  "qr_code_base64": "data:image/png;base64,...",
  "copy_paste_code": "00020126580014br.gov.bcb.pix...",
  "payment_id": "pix_xxxxx",
  "expires_at": "2025-10-08T10:30:00Z"
}
```

### POST /api/webhooks/payment
Webhook de confirmação (Stripe/MP chama)

---

## 🧠 AI

### POST /api/ai/process-message
Processar mensagem com IA

**Request:**
```json
{
  "lead_id": "uuid",
  "message": "Estou com dor no joelho há 2 semanas",
  "context": {
    "name": "João",
    "status": "novo"
  }
}
```

**Response:**
```json
{
  "message": "Entendo, João. Dor no joelho pode ter várias causas...",
  "intent": "pain_sports",
  "entities": {
    "localizacao_dor": "joelho",
    "duracao_dor": "2 semanas"
  },
  "suggestedActions": [
    "Criar prontuário preliminar",
    "Marcar como lead quente"
  ],
  "confidence": 0.85
}
```

### POST /api/ai/suggest-slots
Sugerir horários inteligentes

**Request:**
```json
{
  "lead_id": "uuid",
  "service_type": "fisioterapia_esportiva",
  "date_range": {
    "from": "2025-10-08",
    "to": "2025-10-22"
  }
}
```

**Response:**
```json
{
  "slots": [
    {
      "date": "2025-10-09",
      "time": "14:00",
      "score": 85,
      "reasons": ["Alta taxa de confirmação", "Horário popular"]
    }
  ]
}
```

### POST /api/ai/score-leads
Fazer scoring de leads

**Request:**
```json
{
  "clinic_id": "uuid",
  "lead_ids": ["uuid1", "uuid2"] // opcional
}
```

**Response:**
```json
{
  "scores": [
    {
      "lead_id": "uuid1",
      "score": 85,
      "level": "hot",
      "factors": {
        "urgency": 30,
        "engagement": 25,
        "timing": 20,
        "fit": 10
      },
      "recommended_actions": [
        "Contatar imediatamente",
        "Oferecer agendamento urgente"
      ]
    }
  ]
}
```

---

## 🔄 AUTOMATION

### GET /api/automation/campaigns
Listar campanhas

**Query:**
```
clinic_id: uuid
```

### POST /api/automation/campaigns
Criar campanha

**Request:**
```json
{
  "clinic_id": "uuid",
  "name": "Remarketing - Lead Inativo",
  "type": "remarketing",
  "trigger_event": "no_response_24h",
  "sequence": [
    {
      "step": 1,
      "delay_minutes": 0,
      "template_id": "follow_up_24h",
      "variables": ["nome_lead"]
    }
  ]
}
```

### GET /api/automation/campaigns/:id/metrics
Métricas da campanha

**Response:**
```json
{
  "campaign_name": "Remarketing",
  "total_leads": 50,
  "active": 20,
  "completed": 25,
  "converted": 5,
  "conversion_rate": 10,
  "total_messages_sent": 75
}
```

---

## 📝 EXEMPLOS DE USO

### Criar e Gerenciar Lead
```typescript
// 1. Criar lead
const lead = await LeadService.createLead({
  clinic_id: 'uuid',
  name: 'Maria Santos',
  phone: '+5511988887777',
  source: 'instagram',
  service_interest: 'atm',
  urgency_level: 'alta',
});

// 2. Listar leads qualificados
const { leads } = await LeadService.listLeads({
  clinic_id: 'uuid',
  status: 'qualificado',
  urgency_level: 'alta',
});

// 3. Converter em paciente
const { patientId } = await LeadService.convertLeadToPatient(lead.id);
```

### Usar IA
```typescript
// Processar mensagem
const agent = getConversationalAgent();
const response = await agent.processMessage(
  leadId,
  'Estou com dor no ombro',
  { name: 'João', status: 'novo' }
);

console.log(response.message); // Resposta da IA
console.log(response.intent); // pain_sports
```

### Enviar WhatsApp
```typescript
const whatsapp = getWhatsAppService();

// Mensagem simples
await whatsapp.sendMessage(
  '+5511999999999',
  'Olá! Sua consulta foi confirmada.',
  clinicId
);

// Template aprovado
await whatsapp.sendTemplateMessage(
  '+5511999999999',
  'confirmacao_agendamento',
  ['15/10/2025', '14:00', 'Dr. Eduardo'],
  clinicId
);
```

---

## 🔢 CÓDIGOS DE STATUS

```
200: Sucesso
201: Criado
400: Requisição inválida
401: Não autorizado
403: Sem permissão
404: Não encontrado
500: Erro interno do servidor
```

---

## 📊 RATE LIMITS

```
API Geral: 1000 requests/hora
WhatsApp: 100 mensagens/hora (Twilio free tier)
IA (Gemini): 60 requests/minuto
```

---

## 🛠️ SDKs e Clients

### TypeScript/JavaScript
```typescript
import { LeadService } from '@/services/api/crm/leadService';
import { InteractionService } from '@/services/api/crm/interactionService';
import { MetricsService } from '@/services/api/crm/metricsService';
import { getWhatsAppService } from '@/services/whatsapp/WhatsAppService';
import { getConversationalAgent } from '@/services/ai/ConversationalAgent';
import { GamificationService } from '@/services/gamification/GamificationService';
```

---

**Documentação completa em:** [`docs/ACTIVITY_INTEGRATION_README.md`](docs/ACTIVITY_INTEGRATION_README.md)

