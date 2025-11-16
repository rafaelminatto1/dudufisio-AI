# 🚀 Planejamento de Implementação - Activity Fisioterapia Integration

> **Plano Profissional de Integração de Automações e Melhorias**  
> Sistema: DuduFisio AI  
> Data: 08/10/2025  
> Versão: 1.0.0

---

## 📋 Sumário Executivo

Este documento apresenta um **plano profissional e estruturado** para implementar as funcionalidades sugeridas no relatório da Activity Fisioterapia no sistema **DuduFisio-AI**.

### Objetivo
Transformar o DuduFisio-AI em uma **plataforma completa de gestão e automação** para clínicas de fisioterapia, incluindo:
- ✅ CRM integrado e inteligente
- ✅ WhatsApp Business API automatizado
- ✅ Follow-ups e remarketing automático
- ✅ Portal do paciente com gamificação
- ✅ IA conversacional para atendimento
- ✅ Pipeline CI/CD profissional
- ✅ Integrações de pagamento

### Cronograma Geral
- **Duração Total**: 12 semanas
- **Fases**: 4 principais
- **Entregas**: Incrementais a cada 2-3 semanas

---

## 🎯 Visão Geral das Fases

| Fase | Nome | Duração | Prioridade | Status |
|------|------|---------|------------|--------|
| **1** | CRM Integrado & Database | 3 semanas | 🔴 Crítica | ⏳ Pendente |
| **2** | WhatsApp Business API | 3 semanas | 🔴 Crítica | ⏳ Pendente |
| **3** | Automações & IA | 3 semanas | 🟡 Alta | ⏳ Pendente |
| **4** | Portal do Paciente & Avançados | 3 semanas | 🟢 Média | ⏳ Pendente |

---

## 📊 Análise do Sistema Atual

### ✅ Pontos Fortes Existentes
```
✓ Infraestrutura sólida (Supabase + Vercel)
✓ Multi-tenancy implementado
✓ Auditoria LGPD completa
✓ Soft delete configurado
✓ Prontuário eletrônico funcional
✓ Google Gemini API integrada
✓ Agendamento com Google Calendar
✓ Sistema de comunicação básico
```

### ⚠️ Gaps Identificados
```
✗ CRM baseado em dados simples (sem automação)
✗ WhatsApp manual (sem API oficial)
✗ Follow-ups não automatizados
✗ Falta portal do paciente
✗ IA não conversacional
✗ Sem gamificação
✗ Pipeline CI/CD básica
✗ Sem integração de pagamentos
```

---

## 🏗️ FASE 1: CRM Integrado & Database Evolution

### 📅 Cronograma: Semanas 1-3

### 🎯 Objetivos
1. Evoluir o sistema de leads de dados básicos para CRM completo
2. Criar tabelas e estruturas para automações
3. Implementar dashboard de métricas em tempo real
4. Preparar base para integrações futuras

### 📦 Entregas

#### 1.1 Modelagem de Dados CRM (Semana 1)

**Novas tabelas a criar:**

```sql
-- Tabela de Leads com pipeline completo
CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES clinics(id),
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(255),
  source VARCHAR(50) NOT NULL, -- 'whatsapp', 'instagram', 'google', 'facebook', 'indicacao'
  service_interest VARCHAR(100), -- 'fisioterapia_esportiva', 'atm', 'avaliacao_corrida'
  status VARCHAR(50) DEFAULT 'novo', -- 'novo', 'contatado', 'qualificado', 'agendado', 'convertido', 'perdido'
  
  -- Dados de qualificação
  pain_description TEXT,
  sport_activity VARCHAR(100),
  pain_duration VARCHAR(50),
  urgency_level VARCHAR(20), -- 'baixa', 'media', 'alta', 'urgente'
  
  -- Tracking de interações
  first_contact_at TIMESTAMPTZ DEFAULT NOW(),
  last_contact_at TIMESTAMPTZ,
  next_follow_up_at TIMESTAMPTZ,
  contact_count INTEGER DEFAULT 0,
  whatsapp_messages_sent INTEGER DEFAULT 0,
  
  -- Conversão
  converted_to_patient_id UUID REFERENCES patients(id),
  converted_at TIMESTAMPTZ,
  conversion_source VARCHAR(50),
  
  -- Remarketing
  remarketing_sequence INTEGER DEFAULT 0, -- qual mensagem da sequência
  remarketing_paused BOOLEAN DEFAULT FALSE,
  
  -- Atribuição e métricas
  campaign_id VARCHAR(100),
  ad_id VARCHAR(100),
  utm_source VARCHAR(100),
  utm_medium VARCHAR(100),
  utm_campaign VARCHAR(100),
  estimated_value DECIMAL(10,2),
  
  -- Notas e histórico
  notes TEXT[],
  tags VARCHAR(50)[],
  
  -- Auditoria
  assigned_to UUID REFERENCES unified_users(id),
  created_by UUID REFERENCES unified_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  
  CONSTRAINT leads_clinic_id_fkey FOREIGN KEY (clinic_id) REFERENCES clinics(id) ON DELETE CASCADE
);

-- Índices para performance
CREATE INDEX idx_leads_clinic_status ON leads(clinic_id, status) WHERE deleted_at IS NULL;
CREATE INDEX idx_leads_next_followup ON leads(next_follow_up_at) WHERE status NOT IN ('convertido', 'perdido');
CREATE INDEX idx_leads_phone ON leads(phone);
CREATE INDEX idx_leads_source ON leads(clinic_id, source);

-- Tabela de interações com leads
CREATE TABLE lead_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  clinic_id UUID NOT NULL REFERENCES clinics(id),
  
  interaction_type VARCHAR(50) NOT NULL, -- 'whatsapp', 'call', 'email', 'in_person', 'auto_message'
  direction VARCHAR(20), -- 'inbound', 'outbound'
  channel VARCHAR(50),
  
  -- Conteúdo
  message_content TEXT,
  message_template_id VARCHAR(100),
  
  -- Status da interação
  status VARCHAR(50), -- 'sent', 'delivered', 'read', 'replied', 'failed'
  
  -- Resposta do lead
  lead_response TEXT,
  lead_responded_at TIMESTAMPTZ,
  
  -- Agente responsável
  agent_id UUID REFERENCES unified_users(id),
  is_automated BOOLEAN DEFAULT FALSE,
  
  -- Tracking
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_lead_interactions_lead ON lead_interactions(lead_id, created_at DESC);
CREATE INDEX idx_lead_interactions_clinic ON lead_interactions(clinic_id, created_at DESC);

-- Tabela de templates de mensagens
CREATE TABLE message_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID REFERENCES clinics(id),
  
  name VARCHAR(255) NOT NULL,
  category VARCHAR(50) NOT NULL, -- 'welcome', 'follow_up', 'remarketing', 'confirmation', 'reminder'
  channel VARCHAR(50) NOT NULL, -- 'whatsapp', 'email', 'sms'
  
  -- Conteúdo
  subject VARCHAR(255), -- para emails
  body TEXT NOT NULL,
  variables JSONB, -- variáveis dinâmicas disponíveis
  
  -- Template WhatsApp (para API oficial)
  whatsapp_template_id VARCHAR(255), -- ID aprovado pela Meta
  whatsapp_template_language VARCHAR(10) DEFAULT 'pt_BR',
  whatsapp_template_components JSONB,
  
  -- Configurações
  is_active BOOLEAN DEFAULT TRUE,
  requires_approval BOOLEAN DEFAULT FALSE,
  approved_at TIMESTAMPTZ,
  
  -- Métricas
  times_used INTEGER DEFAULT 0,
  conversion_rate DECIMAL(5,2),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_templates_clinic_category ON message_templates(clinic_id, category, is_active);

-- Tabela de campanhas/automações
CREATE TABLE automation_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES clinics(id),
  
  name VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(50) NOT NULL, -- 'follow_up', 'remarketing', 'nurturing', 'reengagement'
  
  -- Configuração da sequência
  trigger_event VARCHAR(100) NOT NULL, -- 'lead_created', 'no_response', 'appointment_scheduled'
  trigger_delay_minutes INTEGER,
  
  -- Sequência de mensagens
  sequence JSONB NOT NULL, -- Array de steps com delays e templates
  
  -- Status e controle
  is_active BOOLEAN DEFAULT TRUE,
  start_date DATE,
  end_date DATE,
  
  -- Métricas
  leads_entered INTEGER DEFAULT 0,
  messages_sent INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de leads em campanhas (tracking)
CREATE TABLE campaign_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES automation_campaigns(id) ON DELETE CASCADE,
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  
  current_step INTEGER DEFAULT 0,
  status VARCHAR(50) DEFAULT 'active', -- 'active', 'completed', 'paused', 'converted', 'opted_out'
  
  entered_at TIMESTAMPTZ DEFAULT NOW(),
  next_action_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  
  UNIQUE(campaign_id, lead_id)
);

CREATE INDEX idx_campaign_leads_next_action ON campaign_leads(next_action_at) WHERE status = 'active';
```

#### 1.2 Dashboard CRM (Semana 2)

**Componentes a desenvolver:**

```typescript
// components/crm/LeadsDashboard.tsx
interface LeadsDashboardProps {
  clinicId: string;
  dateRange: DateRange;
}

// Métricas principais
- Total de leads (hoje, semana, mês)
- Taxa de conversão por fonte
- Tempo médio de resposta
- Leads por estágio do funil
- Performance por agente
- ROI por canal de marketing

// components/crm/LeadsKanban.tsx
// Visualização em kanban do pipeline
Colunas: Novo → Contatado → Qualificado → Agendado → Convertido

// components/crm/LeadDetailPanel.tsx
// Painel lateral com detalhes do lead
- Timeline de interações
- Botões de ação rápida (WhatsApp, Email, Agendar)
- Notas e histórico
- Campanhas ativas
- Próximas ações
```

#### 1.3 API de CRM (Semana 2-3)

**Endpoints a criar:**

```typescript
// services/api/crm.ts

// Leads
POST   /api/crm/leads                    // Criar lead
GET    /api/crm/leads                    // Listar com filtros
GET    /api/crm/leads/:id               // Detalhes
PATCH  /api/crm/leads/:id               // Atualizar
DELETE /api/crm/leads/:id               // Soft delete
POST   /api/crm/leads/:id/convert       // Converter em paciente
POST   /api/crm/leads/:id/interactions  // Registrar interação

// Pipeline e métricas
GET    /api/crm/metrics/dashboard       // Métricas do dashboard
GET    /api/crm/metrics/conversion      // Funil de conversão
GET    /api/crm/metrics/sources         // Performance por fonte
GET    /api/crm/pipeline                // Status do pipeline

// Automações
GET    /api/crm/campaigns               // Listar campanhas
POST   /api/crm/campaigns               // Criar campanha
GET    /api/crm/campaigns/:id/metrics   // Métricas da campanha
```

#### 1.4 Integrações Preparatórias (Semana 3)

```typescript
// Preparar integrações para Fase 2
- Estrutura de webhooks
- Sistema de filas (Bull/BullMQ)
- Redis para cache e rate limiting
- Logs estruturados
```

### ✅ Critérios de Aceite - Fase 1

- [ ] Todas as tabelas CRM criadas e testadas
- [ ] Dashboard exibindo métricas em tempo real
- [ ] Interface Kanban funcional com drag-and-drop
- [ ] Leads podem ser criados, editados e convertidos
- [ ] API respondendo em < 200ms (95th percentile)
- [ ] Testes unitários para funções críticas
- [ ] Documentação de API completa

---

## 🔗 FASE 2: WhatsApp Business API Integration

### 📅 Cronograma: Semanas 4-6

### 🎯 Objetivos
1. Integrar WhatsApp Business API oficial
2. Implementar fluxos conversacionais automáticos
3. Criar templates aprovados pela Meta
4. Configurar webhooks e sistema de mensageria

### 📦 Entregas

#### 2.1 Setup WhatsApp Business API (Semana 4)

**Tarefas de configuração:**

```markdown
1. Escolha e configuração do provedor
   - **Recomendado**: Twilio ou Meta Cloud API
   - Criar conta Business verificada (CNPJ)
   - Adquirir número dedicado brasileiro (+55)
   - Configurar perfil da empresa

2. Aprovação de templates
   - Criar 10-15 templates iniciais
   - Submeter para aprovação Meta
   - Tempo de aprovação: 24-48h
   
3. Configurar webhook
   - Endpoint: /api/webhooks/whatsapp
   - Validação de token
   - Processamento de mensagens recebidas
```

**Templates a criar e aprovar:**

```javascript
// 1. Boas-vindas inicial
{
  name: "boas_vindas_inicial",
  category: "MARKETING",
  language: "pt_BR",
  components: [
    {
      type: "BODY",
      text: "Olá! 🤗 Bem-vindo à {{1}}! Sou a assistente virtual da clínica. Para agilizar seu atendimento, me conta:\n\n1️⃣ É sua primeira vez falando conosco?\n2️⃣ Você já é nosso paciente?\n3️⃣ Quer remarcar ou cancelar consulta?\n\nResponda com o número da opção."
    }
  ],
  variables: ["nome_clinica"]
}

// 2. Confirmação de agendamento
{
  name: "confirmacao_agendamento",
  category: "UTILITY",
  language: "pt_BR",
  components: [
    {
      type: "BODY",
      text: "✅ Agendamento confirmado!\n\n📅 Data: {{1}}\n🕐 Horário: {{2}}\n👨‍⚕️ Profissional: {{3}}\n\nChegue 10 minutos antes e traga documento com foto e exames anteriores. Nos vemos em breve!"
    }
  ],
  variables: ["data", "horario", "profissional"]
}

// 3. Lembrete 1 dia antes
{
  name: "lembrete_1_dia",
  category: "UTILITY",
  language: "pt_BR",
  components: [
    {
      type: "BODY",
      text: "Olá {{1}}! Sua consulta é amanhã, {{2}} às {{3}}.\n\nConfirma presença? Digite SIM ou, se precisar remarcar, digite REMARCAR."
    }
  ],
  variables: ["nome_paciente", "data", "horario"]
}

// 4. Lembrete 2 horas antes
{
  name: "lembrete_2_horas",
  category: "UTILITY",
  language: "pt_BR",
  components: [
    {
      type: "BODY",
      text: "⏰ Sua consulta é hoje às {{1}}!\n\nJá está a caminho? Qualquer imprevisto, nos avise."
    }
  ],
  variables: ["horario"]
}

// 5. Pós-consulta
{
  name: "pos_consulta",
  category: "UTILITY",
  language: "pt_BR",
  components: [
    {
      type: "BODY",
      text: "Como foi sua consulta? 😊\n\nComo prometido, segue o link com suas orientações: {{1}}\n\nAlguma dúvida sobre o tratamento? Estou aqui para ajudar!"
    }
  ],
  variables: ["link_orientacoes"]
}

// 6-10: Follow-ups de remarketing (24h, 3 dias, 7 dias)
// 11-15: Gatilhos específicos (preço, endereço, horário, convênios)
```

#### 2.2 Backend WhatsApp (Semana 4-5)

**Estrutura de código:**

```typescript
// services/whatsapp/WhatsAppService.ts
export class WhatsAppService {
  private client: WhatsAppClient;
  private redis: Redis;
  private queue: Queue;

  // Enviar mensagem
  async sendMessage(to: string, template: string, params: any): Promise<void> {
    // Rate limiting
    // Validar opt-in
    // Enviar via API
    // Registrar em lead_interactions
  }

  // Enviar mensagem template
  async sendTemplateMessage(to: string, templateName: string, variables: string[]): Promise<void> {
    // Usar templates aprovados
  }

  // Processar mensagem recebida
  async processIncomingMessage(webhook: WhatsAppWebhook): Promise<void> {
    const { from, text, timestamp } = webhook;
    
    // 1. Identificar lead/paciente
    const lead = await this.identifyContact(from);
    
    // 2. Determinar contexto da conversa
    const context = await this.getConversationContext(lead.id);
    
    // 3. Processar com IA ou fluxo
    const response = await this.generateResponse(lead, text, context);
    
    // 4. Enviar resposta
    await this.sendMessage(from, response);
    
    // 5. Atualizar status do lead
    await this.updateLeadStatus(lead.id, text);
    
    // 6. Registrar interação
    await this.logInteraction(lead.id, 'whatsapp', 'inbound', text);
  }

  // Gerenciar contexto de conversa
  async getConversationContext(leadId: string): Promise<ConversationContext> {
    // Buscar no Redis
    // Estado atual do fluxo
    // Última interação
    // Intenção detectada
  }

  // Sistema de filas para mensagens agendadas
  async scheduleMessage(leadId: string, templateName: string, sendAt: Date): Promise<void> {
    await this.queue.add('send-whatsapp-message', {
      leadId,
      templateName,
      sendAt
    }, {
      delay: sendAt.getTime() - Date.now()
    });
  }
}

// services/whatsapp/FlowEngine.ts
export class ConversationFlowEngine {
  // Fluxo para primeira vez
  async handleFirstTimeFlow(lead: Lead, userMessage: string): Promise<string> {
    // Detectar serviço de interesse
    // Fazer perguntas de qualificação
    // Oferecer agendamento
  }

  // Fluxo para paciente existente
  async handleExistingPatientFlow(patient: Patient, userMessage: string): Promise<string> {
    // Opções: agendar, remarcar, cancelar, dúvidas
  }

  // Detectar intenção
  async detectIntent(message: string): Promise<Intent> {
    // Usar IA (Gemini) para classificar
    // Retornar: 'schedule', 'reschedule', 'info', 'price', 'location', etc.
  }

  // Responder por gatilhos
  async handleTriggers(keyword: string): Promise<string | null> {
    const triggers = {
      'preço': 'Nossos valores: fisioterapia esportiva R$ 115/sessão...',
      'endereço': 'Estamos na Rua Manuel Vieira de Sousa, 166 – Mooca...',
      'horário': 'Atendemos de segunda a sexta das 7h às 19h...',
      'convênio': 'Aceitamos Unimed, Bradesco, SulAmérica...'
    };
    return triggers[keyword.toLowerCase()] || null;
  }
}

// API webhook
// pages/api/webhooks/whatsapp.ts
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    // Verificação do webhook (Meta)
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];
    
    if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
      return res.status(200).send(challenge);
    }
    return res.status(403).end();
  }

  if (req.method === 'POST') {
    const whatsappService = new WhatsAppService();
    await whatsappService.processIncomingMessage(req.body);
    return res.status(200).json({ success: true });
  }
}
```

#### 2.3 UI de Gestão WhatsApp (Semana 5-6)

**Componentes:**

```typescript
// components/whatsapp/WhatsAppInbox.tsx
// Caixa de entrada com conversas ativas
// Responder manualmente quando necessário
// Ver histórico completo

// components/whatsapp/TemplateManager.tsx
// Gerenciar templates
// Ver status de aprovação
// Editar e criar novos

// components/whatsapp/CampaignBuilder.tsx
// Criar campanhas de automação
// Configurar sequências
// Definir triggers e delays
```

#### 2.4 Automações de Follow-up (Semana 6)

**Implementar sequências:**

```typescript
// Sequência de remarketing (leads sem resposta)
const remarketingSequence = {
  name: "Remarketing Lead Inativo",
  trigger: "no_response_24h",
  steps: [
    {
      delay: 0, // imediato ao trigger
      template: "follow_up_24h",
      variables: ["nome_lead"]
    },
    {
      delay: 72, // 3 dias depois
      template: "follow_up_3_dias",
      variables: ["nome_lead", "servico_interesse"],
      condition: "still_no_response"
    },
    {
      delay: 168, // 7 dias depois
      template: "follow_up_7_dias",
      variables: ["nome_lead"],
      condition: "still_no_response"
    }
  ]
};

// Sequência de confirmação (agendamentos)
const appointmentConfirmationSequence = {
  name: "Confirmação de Agendamento",
  trigger: "appointment_created",
  steps: [
    {
      delay: 0,
      template: "confirmacao_agendamento",
      variables: ["data", "horario", "profissional"]
    },
    {
      delay: -1440, // 1 dia antes (relativo ao agendamento)
      template: "lembrete_1_dia",
      variables: ["nome_paciente", "data", "horario"]
    },
    {
      delay: -120, // 2 horas antes
      template: "lembrete_2_horas",
      variables: ["horario"]
    }
  ]
};

// Sequência pós-consulta
const postAppointmentSequence = {
  name: "Pós-consulta",
  trigger: "appointment_completed",
  steps: [
    {
      delay: 60, // 1 hora depois
      template: "pos_consulta",
      variables: ["link_orientacoes"]
    },
    {
      delay: 10080, // 7 dias depois
      template: "avaliacao_satisfacao",
      variables: ["nome_paciente"]
    }
  ]
};
```

### ✅ Critérios de Aceite - Fase 2

- [ ] WhatsApp Business API conectada e funcional
- [ ] 15+ templates aprovados pela Meta
- [ ] Webhook recebendo mensagens corretamente
- [ ] Fluxos conversacionais respondendo automaticamente
- [ ] Sistema de filas processando mensagens agendadas
- [ ] UI de gerenciamento de conversas operacional
- [ ] 3 sequências de automação ativas (remarketing, confirmação, pós-consulta)
- [ ] Taxa de entrega > 95%
- [ ] Tempo de resposta automática < 5 segundos

---

## 🤖 FASE 3: IA Conversacional & Automações Avançadas

### 📅 Cronograma: Semanas 7-9

### 🎯 Objetivos
1. Implementar IA conversacional com Gemini API
2. Criar sistema de NLU (Natural Language Understanding)
3. Automação inteligente de agendamentos
4. Sistema de recomendações personalizadas

### 📦 Entregas

#### 3.1 IA Conversacional (Semana 7)

**Arquitetura do agente conversacional:**

```typescript
// services/ai/ConversationalAgent.ts
export class ConversationalAgent {
  private gemini: GoogleGenerativeAI;
  private conversationHistory: Map<string, Message[]>;

  constructor() {
    this.gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.conversationHistory = new Map();
  }

  // Processar mensagem com contexto
  async processMessage(leadId: string, message: string, context: LeadContext): Promise<AgentResponse> {
    // 1. Recuperar histórico
    const history = this.getHistory(leadId);

    // 2. Construir prompt com contexto
    const prompt = this.buildPrompt(message, context, history);

    // 3. Chamar Gemini
    const model = this.gemini.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent(prompt);
    const response = result.response.text();

    // 4. Extrair intenções e entidades
    const intent = await this.extractIntent(message);
    const entities = await this.extractEntities(message);

    // 5. Salvar no histórico
    this.addToHistory(leadId, { role: 'user', content: message });
    this.addToHistory(leadId, { role: 'assistant', content: response });

    return {
      message: response,
      intent,
      entities,
      suggestedActions: this.getSuggestedActions(intent, entities),
      confidence: this.calculateConfidence(intent)
    };
  }

  // Prompt system para fisioterapia
  private buildPrompt(message: string, context: LeadContext, history: Message[]): string {
    return `
Você é uma assistente virtual profissional da ${context.clinicName}, uma clínica de fisioterapia especializada em:
- Fisioterapia esportiva (lesões, dores, recuperação)
- ATM (disfunções temporomandibulares)
- Avaliação de corrida (biomecânica, pisada, performance)

CONTEXTO DO LEAD:
Nome: ${context.leadName || 'Novo lead'}
Interesse: ${context.serviceInterest || 'Não especificado'}
Interações anteriores: ${context.contactCount}
Última interação: ${context.lastContact}

HISTÓRICO DA CONVERSA:
${history.map(m => `${m.role}: ${m.content}`).join('\n')}

MENSAGEM ATUAL DO USUÁRIO:
${message}

INSTRUÇÕES:
1. Responda de forma acolhedora, profissional e empática
2. Use emojis moderadamente (1-2 por mensagem)
3. Seja objetiva e direta
4. Faça perguntas de qualificação quando apropriado
5. Ofereça agendamento quando o lead estiver qualificado
6. Use até 3 linhas por resposta
7. Se não souber algo, seja honesta e ofereça ajuda humana

DIRETRIZES ESPECÍFICAS:
- Para dores/lesões: Pergunte localização, duração, intensidade
- Para ATM: Pergunte sobre estalos, dores de cabeça, limitação
- Para corrida: Pergunte sobre quilometragem, lesões recorrentes, objetivos
- Sempre mencione que a primeira avaliação é GRATUITA
- Cite os diferenciais da clínica quando relevante

RESPONDA AGORA:
`;
  }

  // Extrair intenção (classificação)
  private async extractIntent(message: string): Promise<Intent> {
    const prompt = `
Classifique a intenção da seguinte mensagem em uma das categorias:

CATEGORIAS:
- greeting: Saudação inicial
- schedule: Quer agendar consulta
- reschedule: Quer remarcar
- cancel: Quer cancelar
- info_price: Pergunta sobre preços
- info_location: Pergunta sobre localização
- info_hours: Pergunta sobre horários
- info_insurance: Pergunta sobre convênios
- pain_sports: Relata dor/lesão esportiva
- pain_atm: Relata problema de ATM
- running_assessment: Interesse em avaliação de corrida
- question: Dúvida geral
- other: Outro

MENSAGEM: "${message}"

Responda APENAS com o nome da categoria.
`;

    const model = this.gemini.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent(prompt);
    return result.response.text().trim().toLowerCase() as Intent;
  }

  // Extrair entidades (NER)
  private async extractEntities(message: string): Promise<Entities> {
    const prompt = `
Extraia as seguintes informações da mensagem, se presentes:

EXTRAIR:
- nome: Nome da pessoa
- telefone: Número de telefone
- localizacao_dor: Onde dói
- duracao_dor: Há quanto tempo
- esporte: Qual esporte pratica
- data_preferida: Data preferida para agendamento
- horario_preferido: Horário preferido

MENSAGEM: "${message}"

Responda em JSON. Se algo não estiver presente, use null.
Exemplo: {"nome": "João", "telefone": null, "localizacao_dor": "joelho", ...}
`;

    const model = this.gemini.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent(prompt);
    const jsonText = result.response.text();
    
    try {
      return JSON.parse(jsonText);
    } catch {
      return {};
    }
  }

  // Sugerir ações para o agente humano
  private getSuggestedActions(intent: Intent, entities: Entities): string[] {
    const actions: string[] = [];

    if (intent === 'schedule' && entities.data_preferida) {
      actions.push('Abrir agenda para agendamento');
    }

    if (intent === 'pain_sports' || intent === 'pain_atm') {
      actions.push('Criar prontuário preliminar');
      actions.push('Marcar como lead quente');
    }

    if (entities.nome && entities.telefone) {
      actions.push('Atualizar informações do lead');
    }

    return actions;
  }

  // Calcular confiança da IA
  private calculateConfidence(intent: Intent): number {
    // Implementar lógica baseada em histórico de acertos
    return 0.85; // placeholder
  }
}
```

#### 3.2 Automação Inteligente de Agendamentos (Semana 8)

```typescript
// services/ai/SmartScheduler.ts
export class SmartScheduler {
  // Sugerir melhores horários baseado em:
  // - Preferências do lead
  // - Disponibilidade da agenda
  // - Taxa de conversão por horário
  // - Distância geográfica (se disponível)
  async suggestAppointmentSlots(
    leadId: string,
    preferences: SchedulePreferences
  ): Promise<AppointmentSlot[]> {
    const lead = await this.getLeadData(leadId);
    
    // Buscar slots disponíveis
    const availableSlots = await this.getAvailableSlots(
      preferences.serviceType,
      preferences.dateRange
    );

    // Aplicar ML para ranquear
    const rankedSlots = await this.rankSlots(availableSlots, lead);

    return rankedSlots.slice(0, 3); // Top 3
  }

  // Detectar urgência e priorizar
  async detectUrgency(leadData: Lead): Promise<UrgencyLevel> {
    const prompt = `
Analise o seguinte caso e classifique a urgência:

Descrição da dor: ${leadData.pain_description}
Duração: ${leadData.pain_duration}
Atividade: ${leadData.sport_activity}

Classifique como: baixa, media, alta, urgente

Critérios:
- urgente: Dor aguda, limitação severa, risco de lesão grave
- alta: Dor moderada a forte, impacta atividades diárias
- media: Desconforto, impacta performance esportiva
- baixa: Preventivo, otimização de performance

Responda apenas com o nível.
`;

    const model = this.gemini.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent(prompt);
    return result.response.text().trim().toLowerCase() as UrgencyLevel;
  }

  // Auto-agendamento com confirmação
  async autoSchedule(leadId: string, slotId: string): Promise<Appointment> {
    // 1. Validar disponibilidade
    // 2. Criar agendamento
    // 3. Enviar confirmação WhatsApp
    // 4. Adicionar ao Google Calendar
    // 5. Criar lembretes automáticos
    // 6. Atualizar status do lead
  }
}
```

#### 3.3 Sistema de Recomendações (Semana 9)

```typescript
// services/ai/RecommendationEngine.ts
export class RecommendationEngine {
  // Recomendar protocolo de tratamento
  async recommendProtocol(patientData: PatientData): Promise<Protocol> {
    const prompt = `
Baseado nos dados do paciente, sugira um protocolo de tratamento:

DADOS DO PACIENTE:
- Condição: ${patientData.condition}
- Idade: ${patientData.age}
- Nível de atividade: ${patientData.activityLevel}
- Histórico: ${patientData.medicalHistory}
- Objetivos: ${patientData.goals}

Sugira:
1. Número de sessões recomendadas
2. Frequência (vezes por semana)
3. Técnicas a utilizar
4. Exercícios domiciliares
5. Prazo estimado de recuperação
6. Cuidados e contraindicações

Formate em JSON estruturado.
`;

    // Processar com Gemini
    // Retornar protocolo estruturado
  }

  // Recomendar próxima ação para lead
  async recommendNextAction(leadId: string): Promise<Action> {
    const lead = await this.getLeadWithHistory(leadId);

    // Analisar:
    // - Tempo desde último contato
    // - Respostas anteriores
    // - Estágio do funil
    // - Perfil comportamental

    // Retornar: "Enviar follow-up", "Ligar", "Aguardar resposta", etc.
  }

  // Scoring de leads (predição de conversão)
  async scoreLeads(leads: Lead[]): Promise<LeadScore[]> {
    // ML model para prever probabilidade de conversão
    // Fatores:
    // - Urgência da dor
    // - Número de interações
    // - Tempo de resposta
    // - Fonte do lead
    // - Serviço de interesse
    
    // Retornar score 0-100 para cada lead
  }
}
```

### ✅ Critérios de Aceite - Fase 3

- [ ] IA conversacional respondendo naturalmente
- [ ] Taxa de resposta correta > 85%
- [ ] Detecção de intenção com acurácia > 90%
- [ ] Agendamento inteligente sugerindo slots relevantes
- [ ] Sistema de scoring classificando leads
- [ ] Recomendações de protocolo geradas automaticamente
- [ ] Handoff humano funcionando quando IA não tem confiança

---

## 📱 FASE 4: Portal do Paciente & Funcionalidades Avançadas

### 📅 Cronograma: Semanas 10-12

### 🎯 Objetivos
1. Desenvolver portal web/app para pacientes
2. Implementar gamificação
3. Integrar pagamentos online
4. Sistema de telemedicina básico

### 📦 Entregas

#### 4.1 Portal do Paciente (Semana 10-11)

**Funcionalidades:**

```typescript
// Autenticação
- Login com telefone/email + SMS OTP
- Cadastro simplificado

// Dashboard do paciente
- Próximas consultas
- Histórico de atendimentos
- Plano de tratamento atual
- Exercícios domiciliares
- Documentos (prontuários, exames)

// Agendamento self-service
- Ver horários disponíveis
- Agendar consultas
- Remarcar/cancelar (até 24h antes)
- Receber confirmações

// Exercícios e protocolo
- Vídeos demonstrativos
- Descrições passo a passo
- Marcar como concluído
- Registrar feedback (dor, dificuldade)

// Evolução e métricas
- Gráficos de progresso
- Fotos de evolução (body map)
- Escalas de dor (VAS)
- Amplitude de movimento

// Comunicação
- Chat com fisioterapeuta
- Enviar fotos/vídeos
- Receber orientações
```

**Estrutura de páginas:**

```
/patient-portal
  /login
  /dashboard
  /appointments
    /schedule
    /reschedule/:id
  /treatment
    /current-plan
    /exercises
    /exercises/:id
  /progress
    /evolution
    /photos
    /metrics
  /documents
  /profile
  /payment
```

#### 4.2 Gamificação (Semana 11)

**Sistema de pontos e conquistas:**

```typescript
// database: Tabelas
CREATE TABLE gamification_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id),
  points INTEGER NOT NULL,
  reason VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE gamification_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  icon VARCHAR(255),
  points_required INTEGER,
  category VARCHAR(50) -- 'attendance', 'exercises', 'engagement', 'milestones'
);

CREATE TABLE patient_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id),
  achievement_id UUID NOT NULL REFERENCES gamification_achievements(id),
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(patient_id, achievement_id)
);

// Regras de pontuação
const pointsRules = {
  attendance: {
    firstAppointment: 50,
    consecutiveAppointments: 20,
    noMissedAppointments: 100, // por mês
  },
  exercises: {
    completeExercise: 10,
    allDailyExercises: 30,
    weekStreak: 100,
  },
  engagement: {
    provideFeedback: 15,
    uploadProgressPhoto: 25,
    writeReview: 50,
  },
  referral: {
    referFriend: 200,
    friendSchedules: 300,
  }
};

// Conquistas
const achievements = [
  {
    name: "Primeira Consulta",
    description: "Completou sua primeira sessão",
    icon: "🎯",
    points: 0,
    trigger: "first_appointment"
  },
  {
    name: "Semana Completa",
    description: "Completou todos os exercícios por 7 dias",
    icon: "🔥",
    points: 100,
    trigger: "week_streak_exercises"
  },
  {
    name: "Mestre da Recuperação",
    description: "Completou 20 sessões de tratamento",
    icon: "🏆",
    points: 500,
    trigger: "20_appointments"
  },
  {
    name: "Embaixador",
    description: "Indicou 3 amigos que agendaram",
    icon: "⭐",
    points: 1000,
    trigger: "3_referrals"
  }
];

// Recompensas
const rewards = [
  {
    pointsCost: 500,
    reward: "10% de desconto na próxima sessão",
    type: "discount"
  },
  {
    pointsCost: 1000,
    reward: "Sessão de avaliação gratuita",
    type: "free_session"
  },
  {
    pointsCost: 2000,
    reward: "Kit de exercícios em casa",
    type: "physical_item"
  }
];
```

**UI de gamificação:**

```typescript
// components/patient/GamificationDashboard.tsx
- Pontos totais
- Nível atual (Bronze, Prata, Ouro, Platina)
- Barra de progresso para próximo nível
- Conquistas desbloqueadas (badges)
- Ranking semanal/mensal (opcional)
- Recompensas disponíveis para resgate
```

#### 4.3 Pagamentos Online (Semana 12)

**Integração Stripe ou Mercado Pago:**

```typescript
// services/payment/PaymentService.ts
export class PaymentService {
  private stripe: Stripe;

  // Criar link de pagamento
  async createPaymentLink(appointmentId: string): Promise<string> {
    const appointment = await this.getAppointment(appointmentId);
    
    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card', 'boleto', 'pix'],
      line_items: [{
        price_data: {
          currency: 'brl',
          product_data: {
            name: `Consulta - ${appointment.service}`,
            description: `${appointment.date} às ${appointment.time}`,
          },
          unit_amount: appointment.price * 100, // centavos
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/payment/cancel`,
      metadata: {
        appointmentId,
        patientId: appointment.patientId,
      }
    });

    return session.url;
  }

  // Webhook para confirmar pagamento
  async handleWebhook(event: Stripe.Event): Promise<void> {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const appointmentId = session.metadata.appointmentId;

      // Marcar consulta como paga
      await this.markAsPaid(appointmentId);

      // Enviar confirmação por WhatsApp
      await this.sendPaymentConfirmation(appointmentId);
    }
  }

  // Pagamento via PIX
  async createPixPayment(appointmentId: string): Promise<PixPayment> {
    // Gerar QR Code PIX
    // Retornar imagem e código copia-e-cola
    // Polling para confirmar pagamento
  }
}

// Enviar link de pagamento após agendamento
async function onAppointmentCreated(appointmentId: string) {
  const paymentService = new PaymentService();
  const paymentLink = await paymentService.createPaymentLink(appointmentId);

  const whatsappService = new WhatsAppService();
  await whatsappService.sendTemplateMessage(
    appointment.patient.phone,
    'payment_link',
    [paymentLink, appointment.price.toString()]
  );
}
```

#### 4.4 Telemedicina (Básico) (Semana 12)

```typescript
// Integração com Twilio Video ou similar
// Funcionalidades:
- Agendar teleconsulta
- Link de vídeo automático
- Gravação (opcional, com consentimento)
- Chat durante a consulta
- Compartilhamento de tela (para mostrar exercícios)

// Não coberto neste planejamento:
// Implementação completa de telemedicina requer análise separada
// por questões de compliance e regulamentação CFM
```

### ✅ Critérios de Aceite - Fase 4

- [ ] Portal do paciente acessível via web/mobile
- [ ] Pacientes conseguem agendar consultas autonomamente
- [ ] Sistema de gamificação registrando pontos e conquistas
- [ ] Pelo menos 3 recompensas resgatáveis
- [ ] Pagamentos via PIX/cartão funcionando
- [ ] Confirmação automática de pagamento por WhatsApp
- [ ] Webhook de pagamentos integrado
- [ ] Taxa de conclusão de pagamento > 80%

---

## 🔧 COMPLEMENTAR: Melhorias na Pipeline CI/CD

### Objetivo
Profissionalizar o processo de desenvolvimento e deploy

### Entregas (Paralelo às outras fases)

#### Consolidação de Workflows

```yaml
# .github/workflows/main.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  quality-checks:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Lint
        run: npm run lint
      
      - name: Type check
        run: npm run type-check
      
      - name: Unit tests
        run: npm test
      
      - name: Security audit
        run: npm audit --audit-level=high
        continue-on-error: false
      
      - name: Build
        run: npm run build

  security-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Run Snyk security scan
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
        with:
          args: --severity-threshold=high
      
      - name: Run Trivy vulnerability scanner
        uses: aquasecurity/trivy-action@master
        with:
          scan-type: 'fs'
          scan-ref: '.'
          format: 'sarif'
          output: 'trivy-results.sarif'

  e2e-tests:
    runs-on: ubuntu-latest
    needs: quality-checks
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Install Playwright
        run: npx playwright install --with-deps
      
      - name: Run E2E tests
        run: npm run test:e2e
        env:
          CI: true
      
      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/

  deploy-staging:
    runs-on: ubuntu-latest
    needs: [quality-checks, security-scan, e2e-tests]
    if: github.ref == 'refs/heads/develop'
    steps:
      - name: Deploy to Vercel (Staging)
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          scope: staging

  deploy-production:
    runs-on: ubuntu-latest
    needs: [quality-checks, security-scan, e2e-tests]
    if: github.ref == 'refs/heads/main'
    steps:
      - name: Deploy to Vercel (Production)
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
      
      - name: Notify team on Slack
        uses: 8398a7/action-slack@v3
        with:
          status: ${{ job.status }}
          text: 'Deploy to production completed!'
          webhook_url: ${{ secrets.SLACK_WEBHOOK }}
        if: always()

  dependabot:
    runs-on: ubuntu-latest
    steps:
      - name: Enable Dependabot
        run: echo "Dependabot configured via .github/dependabot.yml"
```

#### Dependabot Configuration

```yaml
# .github/dependabot.yml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
      day: "monday"
      time: "09:00"
    open-pull-requests-limit: 10
    reviewers:
      - "tech-team"
    labels:
      - "dependencies"
      - "automated"
    commit-message:
      prefix: "chore"
      include: "scope"
```

#### Notificações

```typescript
// Integrar com Slack, Discord ou Telegram
// Notificar sobre:
- Deploy bem-sucedido
- Falhas no pipeline
- Pull requests pendentes
- Vulnerabilidades encontradas
- Dependências desatualizadas
```

---

## 📊 Métricas de Sucesso

### KPIs Principais

| Métrica | Meta | Medição |
|---------|------|---------|
| **Taxa de conversão de leads** | > 30% | Leads convertidos / Total de leads |
| **Tempo médio de resposta** | < 5 min | Tempo até primeira resposta |
| **Taxa de agendamento via WhatsApp** | > 60% | Agendamentos WhatsApp / Total |
| **Taxa de confirmação de consulta** | > 85% | Consultas confirmadas / Total |
| **Taxa de no-show** | < 10% | Faltas / Total de consultas |
| **Satisfação do paciente (NPS)** | > 70 | Pesquisa pós-consulta |
| **Engajamento portal** | > 50% | Pacientes ativos / Total |
| **Taxa de conclusão de exercícios** | > 70% | Exercícios feitos / Prescritos |
| **ROI de marketing** | > 3x | Receita / Investimento marketing |
| **Tempo de carregamento** | < 2s | Core Web Vitals |

### Dashboard de Métricas

```typescript
// components/admin/MetricsDashboard.tsx
// Visão consolidada de:
- Leads gerados (hoje, semana, mês)
- Conversões por canal
- Performance de campanhas
- Taxa de resposta WhatsApp
- Agendamentos por serviço
- Receita por serviço
- Pacientes ativos
- Taxa de retenção
- NPS médio
- Desempenho por profissional
```

---

## 💰 Estimativa de Custos

### Custos Mensais Recorrentes

| Serviço | Custo Mensal | Observações |
|---------|-------------|-------------|
| **WhatsApp Business API** (Twilio) | R$ 200-500 | Baseado no volume de mensagens |
| **Supabase Pro** | R$ 125 | Inclui banco + auth + storage |
| **Vercel Pro** | R$ 100 | Deploy e hosting |
| **Google Gemini API** | R$ 0-200 | Pay-as-you-go |
| **Redis Cloud** | R$ 0-50 | Tier gratuito + overages |
| **Stripe/Mercado Pago** | 3-5% | Por transação |
| **Monitoramento (Sentry)** | R$ 0-50 | Tier gratuito OK inicialmente |
| **SMS (OTP)** | R$ 50-100 | Backup para WhatsApp |
| **CDN/Storage adicional** | R$ 20-50 | Imagens, vídeos |
| **TOTAL** | **R$ 495 - R$ 1.175** | Escalável com uso |

### Custos de Setup (One-time)

| Item | Custo | Observações |
|------|-------|-------------|
| **Número WhatsApp dedicado** | R$ 0-100 | Varia por operadora |
| **Verificação Meta Business** | R$ 0 | Gratuito |
| **Desenvolvimento** | - | Interno ou freelance |
| **Testes** | R$ 0 | Usando ferramentas open-source |
| **TOTAL Setup** | **R$ 0 - R$ 100** | Mínimo |

---

## ⚠️ Riscos e Mitigações

| Risco | Impacto | Probabilidade | Mitigação |
|-------|---------|---------------|-----------|
| **WhatsApp API - Rejeição de templates** | Alto | Média | Seguir guidelines Meta rigorosamente |
| **WhatsApp API - Ban por spam** | Crítico | Baixa | Rate limiting, opt-in obrigatório |
| **Supabase downtime** | Alto | Baixa | Backup diário, plano de contingência |
| **Gemini API - Custo elevado** | Médio | Média | Cache de respostas, rate limiting |
| **Gemini API - Respostas inadequadas** | Alto | Média | Review humano, prompts validados |
| **LGPD - Não conformidade** | Crítico | Baixa | Auditoria, consentimento explícito |
| **Baixa adoção do portal** | Médio | Média | Gamificação, onboarding guiado |
| **Integração pagamento - Falhas** | Alto | Baixa | Webhooks redundantes, retry logic |
| **Escalabilidade** | Médio | Média | Arquitetura serverless, monitoramento |

---

## 📚 Documentação e Treinamento

### Documentação Técnica
- [ ] API Reference completa
- [ ] Guia de contribuição
- [ ] Diagramas de arquitetura atualizados
- [ ] Runbooks para operações
- [ ] Troubleshooting guide

### Documentação de Usuário
- [ ] Manual do administrador
- [ ] Manual do fisioterapeuta
- [ ] Manual do paciente (portal)
- [ ] FAQ automatizado
- [ ] Vídeos tutoriais

### Treinamento
- [ ] Sessões de onboarding para equipe
- [ ] Workshop de uso do CRM
- [ ] Treinamento WhatsApp API
- [ ] Uso da IA conversacional
- [ ] Dashboard de métricas

---

## 🗓️ Cronograma Detalhado

### Fase 1: CRM (Semanas 1-3)

**Semana 1 - Database & Modelagem**
- Seg-Ter: Criar tabelas CRM (leads, interactions, templates, campaigns)
- Qua-Qui: Implementar migrations e seeds
- Sex: Testes e validação de integridade

**Semana 2 - Backend & API**
- Seg-Ter: Endpoints de leads e interações
- Qua-Qui: Endpoints de métricas e pipeline
- Sex: Testes de API e documentação

**Semana 3 - Frontend Dashboard**
- Seg-Ter: Componentes do dashboard
- Qua-Qui: Kanban e painel de lead
- Sex: Integração e testes E2E

### Fase 2: WhatsApp API (Semanas 4-6)

**Semana 4 - Setup e Templates**
- Seg: Configurar conta WhatsApp Business
- Ter-Qua: Criar e submeter 15 templates
- Qui-Sex: Implementar webhook básico

**Semana 5 - Backend de Mensageria**
- Seg-Ter: WhatsAppService completo
- Qua-Qui: FlowEngine e detecção de intenções
- Sex: Sistema de filas (Bull)

**Semana 6 - Automações e UI**
- Seg-Ter: Sequências de automação
- Qua-Qui: UI de gerenciamento WhatsApp
- Sex: Testes e ajustes finais

### Fase 3: IA Conversacional (Semanas 7-9)

**Semana 7 - Agente Conversacional**
- Seg-Ter: ConversationalAgent com Gemini
- Qua-Qui: Extração de intenções e entidades
- Sex: Testes de qualidade de resposta

**Semana 8 - Smart Scheduler**
- Seg-Ter: Agendamento inteligente
- Qua-Qui: Detecção de urgência
- Sex: Integração com agenda existente

**Semana 9 - Recomendações**
- Seg-Ter: Recomendação de protocolos
- Qua-Qui: Lead scoring
- Sex: Dashboard de IA

### Fase 4: Portal do Paciente (Semanas 10-12)

**Semana 10 - Portal Base**
- Seg-Ter: Autenticação e dashboard
- Qua-Qui: Agendamento self-service
- Sex: Visualização de tratamento

**Semana 11 - Gamificação**
- Seg-Ter: Sistema de pontos
- Qua-Qui: Conquistas e recompensas
- Sex: UI de gamificação

**Semana 12 - Pagamentos e Ajustes**
- Seg-Ter: Integração Stripe/Mercado Pago
- Qua-Qui: Telemedicina básica (opcional)
- Sex: Testes finais e deploy

---

## ✅ Checklist de Implementação

### Pré-Requisitos
- [ ] Acesso admin ao Supabase
- [ ] Credenciais Google Gemini API
- [ ] Conta Meta Business verificada
- [ ] Conta Twilio ou provedor WhatsApp
- [ ] Número de telefone dedicado
- [ ] Conta Stripe ou Mercado Pago
- [ ] Redis configurado
- [ ] Vercel Pro (recomendado)

### Fase 1 - CRM
- [ ] Migrations aplicadas
- [ ] Seeds de dados de teste
- [ ] API de leads funcionando
- [ ] Dashboard exibindo métricas
- [ ] Kanban operacional
- [ ] Testes E2E passando

### Fase 2 - WhatsApp
- [ ] Conta WhatsApp Business ativa
- [ ] Templates aprovados (mínimo 10)
- [ ] Webhook recebendo mensagens
- [ ] Fluxos conversacionais respondendo
- [ ] Filas processando jobs
- [ ] UI de gerenciamento operacional
- [ ] Automações ativas

### Fase 3 - IA
- [ ] Agente conversacional funcionando
- [ ] Taxa de resposta correta > 85%
- [ ] Agendamento inteligente operacional
- [ ] Lead scoring implementado
- [ ] Recomendações sendo geradas

### Fase 4 - Portal
- [ ] Portal acessível
- [ ] Autenticação funcionando
- [ ] Agendamento self-service OK
- [ ] Gamificação ativa
- [ ] Pagamentos processando
- [ ] Confirmações automáticas enviadas

### CI/CD
- [ ] Workflows consolidados
- [ ] Dependabot ativo
- [ ] Security scans rodando
- [ ] E2E tests no pipeline
- [ ] Notificações configuradas

### Documentação
- [ ] API documentada
- [ ] Guias de usuário criados
- [ ] Treinamento realizado
- [ ] Runbooks prontos

---

## 🎯 Próximos Passos Imediatos

### Semana 1 - Kick-off
1. **Reunião de alinhamento**
   - Apresentar este plano
   - Definir responsáveis
   - Ajustar prioridades

2. **Setup de ambiente**
   - Criar branches (develop, staging, main)
   - Configurar variáveis de ambiente
   - Setup de projetos (Twilio, Stripe, etc.)

3. **Iniciar Fase 1**
   - Criar primeira migration (tabela leads)
   - Setup do projeto no Supabase
   - Primeiro commit

---

## 📞 Suporte e Contatos

### Ferramentas Utilizadas
- **Supabase**: https://supabase.com/docs
- **WhatsApp Business API**: https://developers.facebook.com/docs/whatsapp
- **Twilio**: https://www.twilio.com/docs/whatsapp
- **Google Gemini**: https://ai.google.dev/docs
- **Stripe**: https://stripe.com/docs
- **Mercado Pago**: https://www.mercadopago.com.br/developers

### Comunidades
- Stack Overflow
- Discord Supabase
- Reddit /r/webdev

---

## 🎉 Conclusão

Este planejamento transforma o **DuduFisio-AI** em uma plataforma completa e profissional de gestão para clínicas de fisioterapia, incorporando as melhores práticas sugeridas no relatório da Activity Fisioterapia.

### Destaques
✅ **Cronograma realista**: 12 semanas divididas em 4 fases  
✅ **Entregas incrementais**: Valor entregue a cada 2-3 semanas  
✅ **Arquitetura escalável**: Preparada para crescimento  
✅ **Custos controlados**: R$ 500-1.200/mês  
✅ **ROI projetado**: > 3x em 6 meses  

### Impacto Esperado
- **30% de aumento na taxa de conversão**
- **50% de redução no tempo de resposta**
- **85% de taxa de confirmação de consultas**
- **70% de engajamento no portal do paciente**
- **NPS > 70**

---

**Pronto para começar?** 🚀

Revise este documento com sua equipe e ajuste conforme necessário. Quando estiver pronto, podemos iniciar a **Fase 1 - CRM Integration**!

---

*Documento criado em: 08/10/2025*  
*Versão: 1.0.0*  
*Status: ✅ Aprovado para implementação*  
*Próxima revisão: Após conclusão da Fase 1*

