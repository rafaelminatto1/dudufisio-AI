# 🎯 Sistema CRM - Guia Completo

## 📚 Índice

1. [Visão Geral](#visão-geral)
2. [Arquitetura](#arquitetura)
3. [Funcionalidades](#funcionalidades)
4. [Como Usar](#como-usar)
5. [Integrações](#integrações)
6. [API Reference](#api-reference)

---

## 🎯 Visão Geral

O Sistema CRM (Customer Relationship Management) do DuduFisio-AI é uma solução completa para gerenciamento de leads e automação de comunicação com potenciais pacientes.

### ✨ Principais Recursos

- **Pipeline Visual** - Kanban board para acompanhamento de leads
- **Automações Inteligentes** - Regras automáticas de follow-up
- **Integração WhatsApp** - Comunicação direta com leads
- **Analytics Avançado** - Métricas de conversão e ROI
- **Lead Scoring** - Pontuação automática de leads
- **Templates de Mensagens** - Mensagens pré-configuradas personalizáveis

---

## 🏗️ Arquitetura

### Banco de Dados (Supabase)

O sistema utiliza 7 tabelas principais:

#### 1. **`leads`** - Tabela principal de leads
```sql
- id (uuid)
- clinic_id (uuid)
- name (text)
- phone (text)
- email (text)
- source (text) - whatsapp, instagram, google, etc.
- status (text) - novo, contatado, qualificado, agendado, convertido, perdido
- lead_score (integer) - 0-100
- engagement_level (text) - low, medium, high, very_high
- urgency_level (text) - baixa, media, alta, urgente
- pain_description (text)
- interested_in (text)
- preferred_schedule (jsonb)
- tags (text[])
- notes (text[])
- next_follow_up_at (timestamp)
- converted_to_patient_id (uuid)
- converted_at (timestamp)
- created_at (timestamp)
- updated_at (timestamp)
```

#### 2. **`lead_interactions`** - Histórico de interações
```sql
- id (uuid)
- lead_id (uuid)
- interaction_type (text) - call, whatsapp, email, sms
- direction (text) - inbound, outbound
- message_content (text)
- status (text) - sent, delivered, read, failed
- agent_id (uuid)
- created_at (timestamp)
```

#### 3. **`sales_pipeline`** - Pipeline de vendas customizável
```sql
- id (uuid)
- name (text)
- description (text)
- stages (jsonb) - Array de estágios
- is_default (boolean)
- is_active (boolean)
```

#### 4. **`message_templates`** - Templates de mensagens
```sql
- id (uuid)
- name (text)
- category (text) - follow_up, welcome, reminder, closing
- content (text)
- variables (text[]) - Variáveis disponíveis: {{name}}, {{phone}}
- channel (text) - whatsapp, email, sms
- is_active (boolean)
```

#### 5. **`automation_rules`** - Regras de automação
```sql
- id (uuid)
- name (text)
- trigger_type (text) - lead_created, status_change, time_based
- trigger_conditions (jsonb)
- action_type (text) - send_message, update_status, schedule_followup
- action_config (jsonb)
- template_id (uuid)
- delay_minutes (integer)
- priority (integer)
- is_active (boolean)
```

#### 6. **`automation_executions`** - Log de execuções
```sql
- id (uuid)
- rule_id (uuid)
- lead_id (uuid)
- execution_status (text) - pending, running, success, failed
- trigger_data (jsonb)
- action_result (jsonb)
- error_message (text)
- executed_at (timestamp)
- completed_at (timestamp)
```

#### 7. **`scheduled_followups`** - Follow-ups agendados
```sql
- id (uuid)
- lead_id (uuid)
- rule_id (uuid)
- scheduled_for (timestamp)
- status (text) - pending, completed, cancelled
- message (text)
- channel (text)
```

### Funções SQL

O sistema inclui 6 funções PostgreSQL:

1. **`calculate_lead_score(lead_id)`** - Calcula score do lead (0-100)
2. **`convert_lead_to_patient(lead_id)`** - Converte lead em paciente
3. **`process_automation_rules()`** - Processa todas as regras ativas
4. **`apply_message_template(template_id, variables)`** - Aplica template com variáveis
5. **`schedule_followup(lead_id, hours_delay, message, channel)`** - Agenda follow-up
6. **`get_pending_followups()`** - Lista follow-ups pendentes

### Views Analíticas

1. **`lead_conversion_metrics`** - Métricas de conversão por fonte
2. **`automation_statistics`** - Estatísticas de automações

---

## ⚙️ Funcionalidades

### 1. Gestão de Leads

#### Criar Novo Lead
```typescript
import { LeadService } from '@/services/api/crm/leadService';

const lead = await LeadService.createLead({
  name: 'João Silva',
  phone: '+5511999887766',
  email: 'joao@example.com',
  source: 'whatsapp',
  status: 'novo',
  pain_description: 'Dor nas costas há 2 semanas',
  interested_in: 'fisioterapia',
  urgency_level: 'alta'
});
```

#### Listar Leads
```typescript
const { leads, total } = await LeadService.listLeads(
  {
    clinic_id: 'clinic-uuid',
    status: 'novo',
    source: 'whatsapp',
    search: 'João'
  },
  page: 1,
  limit: 50
);
```

#### Converter Lead em Paciente
```typescript
const { patientId, lead } = await LeadService.convertLeadToPatient('lead-uuid');
```

### 2. Automações

#### Listar Templates
```typescript
import { automationService } from '@/services/crm/automationService';

const templates = await automationService.listTemplates('follow_up');
```

#### Criar Regra de Automação
```typescript
const rule = await automationService.createRule({
  name: 'Follow-up 24h - Novo Lead',
  trigger_type: 'lead_created',
  trigger_conditions: {
    status: 'novo'
  },
  action_type: 'send_message',
  action_config: {
    channel: 'whatsapp',
    mark_as_contacted: true
  },
  template_id: 'template-uuid',
  delay_minutes: 1440, // 24 horas
  priority: 8,
  is_active: true
});
```

#### Processar Automações
```typescript
const { processed_rules, total_executions } =
  await automationService.processAutomationRules();
```

### 3. Interações

#### Registrar Interação
```typescript
import { InteractionService } from '@/services/api/crm/interactionService';

const interaction = await InteractionService.createInteraction({
  lead_id: 'lead-uuid',
  interaction_type: 'whatsapp',
  direction: 'outbound',
  message_content: 'Olá! Como posso ajudá-lo?',
  status: 'sent'
});
```

#### Buscar Histórico
```typescript
const interactions = await InteractionService.getLeadInteractions(
  'lead-uuid',
  limit: 50
);
```

### 4. Métricas

#### Dashboard Metrics
```typescript
import { MetricsService } from '@/services/api/crm/metricsService';

const metrics = await MetricsService.getDashboardMetrics('clinic-uuid');
// Retorna:
// - total_leads
// - new_leads_today
// - conversion_rate
// - avg_response_time_minutes
// - leads_by_status
// - leads_by_source
```

#### Funil de Conversão
```typescript
const funnel = await MetricsService.getConversionFunnel(
  'clinic-uuid',
  '2025-01-01',
  '2025-01-31'
);
// Retorna:
// - total, contacted, qualified, scheduled, converted
// - contact_rate, qualification_rate, conversion_rate
```

---

## 📱 Como Usar

### Acessar o CRM

1. Faça login no sistema
2. No menu lateral, clique em **"CRM & WhatsApp"**
3. Você verá 4 abas principais:

#### 🗂️ Inbox
- Lista todas as conversas ativas
- Visualize mensagens não lidas
- Responda diretamente aos leads

#### 📊 Pipeline
- Kanban board com os estágios:
  - 🆕 Novo
  - 📞 Contatado
  - ✅ Qualificado
  - 📅 Agendado
  - 🎉 Convertido
  - ❌ Perdido
- Arraste e solte leads entre estágios
- Clique em um lead para ver detalhes

#### 📈 Analytics
- Métricas de conversão
- Performance por fonte
- Gráficos de tendências
- ROI por canal

#### ⚡ Automações
- Configure regras automáticas
- Crie templates de mensagens
- Visualize execuções
- Ative/desative regras

### Fluxo Típico

1. **Novo Lead chega** (WhatsApp, Instagram, Google, etc.)
   - Sistema cria automaticamente na tabela `leads`
   - Status inicial: `novo`
   - Lead score é calculado automaticamente

2. **Automação de Boas-vindas** (opcional)
   - Regra detecta novo lead
   - Envia mensagem de boas-vindas
   - Atualiza status para `contatado`

3. **Follow-up Automático 24h**
   - Após 24h sem resposta
   - Sistema agenda follow-up
   - Mensagem é enviada automaticamente

4. **Qualificação Manual**
   - Agente analisa o lead
   - Move para estágio `qualificado` no Kanban
   - Adiciona notas e tags

5. **Agendamento**
   - Lead é movido para `agendado`
   - Consulta é marcada no sistema

6. **Conversão**
   - Lead comparece à consulta
   - Sistema converte em `paciente`
   - Métricas são atualizadas

---

## 🔗 Integrações

### WhatsApp Business API

O CRM integra automaticamente com o módulo WhatsApp:

```typescript
import { whatsappCrmService } from '@/services/crm/whatsappCrmService';

// Enviar mensagem
await whatsappCrmService.sendMessage({
  to: '+5511999887766',
  message: 'Olá! Como posso ajudá-lo?',
  lead_id: 'lead-uuid'
});

// Mensagem recebida cria lead automaticamente
```

### Gemini AI (Opcional)

Análise automática de mensagens:

- **Detecção de Intenção** - Identifica interesse
- **Análise de Sentimento** - Positivo, neutro, negativo
- **Extração de Informações** - Nome, telefone, sintomas

---

## 📖 API Reference

### LeadService

| Método | Descrição |
|--------|-----------|
| `createLead(input)` | Criar novo lead |
| `listLeads(filters, page, limit)` | Listar leads com filtros |
| `getLeadById(id)` | Buscar lead por ID |
| `updateLead(id, updates)` | Atualizar lead |
| `deleteLead(id)` | Soft delete de lead |
| `convertLeadToPatient(id)` | Converter em paciente |
| `scheduleFollowUp(id, date)` | Agendar follow-up |
| `findLeadByPhone(phone, clinicId)` | Buscar por telefone |
| `countLeadsByStatus(clinicId)` | Contar por status |

### InteractionService

| Método | Descrição |
|--------|-----------|
| `createInteraction(input)` | Registrar interação |
| `getLeadInteractions(leadId, limit)` | Buscar histórico |
| `updateInteractionStatus(id, status)` | Atualizar status |
| `recordLeadResponse(id, response)` | Registrar resposta |
| `getInteractionMetrics(clinicId, from, to)` | Buscar métricas |
| `calculateAverageResponseTime(clinicId, from, to)` | Calcular tempo médio |

### automationService

| Método | Descrição |
|--------|-----------|
| `listTemplates(category?)` | Listar templates |
| `createTemplate(template)` | Criar template |
| `applyTemplate(id, variables)` | Aplicar template |
| `listRules(activeOnly?)` | Listar regras |
| `createRule(rule)` | Criar regra |
| `toggleRule(id, isActive)` | Ativar/desativar |
| `processAutomationRules()` | Processar todas as regras |
| `executeRule(ruleId, leadId)` | Executar regra manual |
| `scheduleFollowup(leadId, hours, message, channel)` | Agendar follow-up |
| `getPendingFollowups()` | Listar pendentes |

### MetricsService

| Método | Descrição |
|--------|-----------|
| `getDashboardMetrics(clinicId)` | Métricas do dashboard |
| `getConversionFunnel(clinicId, from?, to?)` | Funil de conversão |
| `getSourcePerformance(clinicId, from?, to?)` | Performance por fonte |
| `getLeadsByDay(clinicId, days)` | Leads por dia |
| `getAgentStats(clinicId, from?, to?)` | Estatísticas de agentes |
| `getRevenueMetrics(clinicId, from?, to?)` | Métricas de receita |

---

## 🎨 Componentes React

### LeadsKanban
```tsx
import { LeadsKanban } from '@/components/crm/LeadsKanban';

<LeadsKanban
  clinicId="clinic-uuid"
  onLeadClick={(lead) => console.log(lead)}
  onLeadsUpdate={() => console.log('Updated')}
/>
```

### DashboardMetrics
```tsx
import { DashboardMetrics } from '@/components/crm/DashboardMetrics';

<DashboardMetrics clinicId="clinic-uuid" />
```

### UnifiedInbox
```tsx
import { UnifiedInbox } from '@/components/crm/UnifiedInbox';

<UnifiedInbox clinicId="clinic-uuid" />
```

### CRMAnalytics
```tsx
import { CRMAnalytics } from '@/components/crm/CRMAnalytics';

<CRMAnalytics clinicId="clinic-uuid" />
```

### AutomationManager
```tsx
import { AutomationManager } from '@/components/crm/AutomationManager';

<AutomationManager clinicId="clinic-uuid" />
```

---

## 🚀 Deploy e Manutenção

### Variáveis de Ambiente

Certifique-se de ter configurado:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_WHATSAPP_API_URL=https://api.whatsapp.com
VITE_WHATSAPP_API_TOKEN=your-token
```

### Migrations Aplicadas

✅ `20251009_create_leads_crm_integration.sql`
✅ `20251009_create_automation_system.sql`
✅ `20251009_seed_automation_defaults.sql`

### Dados Seed Inclusos

- **7 Templates de Mensagens**
  - Boas-vindas - Novo Lead
  - Follow-up - 24h sem resposta
  - Follow-up - Lead Qualificado
  - Lembrete - Agendamento Pendente
  - Reengajamento - 7 dias inativo
  - Follow-up - Proposta Enviada
  - Feedback - Interesse

- **4 Regras de Automação**
  - Boas-vindas Automáticas (desabilitada)
  - Follow-up 24h - Novo Lead (ativa)
  - Follow-up Lead Qualificado (ativa)
  - Reengajamento 7 dias (ativa)

- **1 Pipeline Padrão**
  - Pipeline Fisioterapia com 7 estágios

---

## 🐛 Troubleshooting

### Leads não aparecem no Kanban

1. Verifique se `clinic_id` está correto
2. Confirme que `deleted_at IS NULL`
3. Verifique permissões RLS no Supabase

### Automações não estão executando

1. Verifique se a regra está `is_active = true`
2. Confirme que o `delay_minutes` já passou
3. Execute manualmente: `processAutomationRules()`
4. Verifique logs na tabela `automation_executions`

### Templates não aplicam variáveis

Variáveis disponíveis:
- `{{name}}` - Nome do lead
- `{{phone}}` - Telefone do lead
- `{{service}}` - Serviço de interesse

Exemplo correto:
```
Olá {{name}}! Vi que você tem interesse em {{service}}.
Podemos conversar pelo {{phone}}?
```

---

## 📊 Métricas de Sucesso

- **Taxa de Conversão**: Meta 15-25%
- **Tempo de Resposta**: < 30 minutos
- **Lead Score Médio**: 50-70 pontos
- **Engagement**: > 60% dos leads respondem

---

## 🎯 Próximos Passos

- [ ] Integração com Meta Ads
- [ ] WhatsApp Chatbot com AI
- [ ] Relatórios avançados em PDF
- [ ] Integração com Google Calendar
- [ ] Multi-agente (vários atendentes)
- [ ] Mobile App para gestão

---

## 📞 Suporte

Para dúvidas ou suporte:
- 📧 Email: suporte@dudufisio.com
- 💬 WhatsApp: +55 11 99999-9999
- 📚 Documentação: https://docs.dudufisio.com

---

**Desenvolvido com ❤️ por DuduFisio-AI Team**
