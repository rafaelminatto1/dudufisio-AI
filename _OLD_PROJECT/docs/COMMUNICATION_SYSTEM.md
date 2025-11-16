# Sistema de Comunicação Omnichannel - DuduFisio-AI

## Visão Geral

O Sistema de Comunicação Omnichannel do DuduFisio-AI é uma solução enterprise completa para gerenciar todas as comunicações entre a clínica de fisioterapia e seus pacientes através de múltiplos canais: WhatsApp, SMS, Email e Push Notifications.

## Arquitetura

### Princípios de Design

- **Event-Driven Architecture**: Baseado em eventos com garantias de entrega
- **Channel Abstraction**: Interface unificada para todos os canais de comunicação
- **Template System**: Sistema flexível de templates com Handlebars
- **Automation Engine**: Regras automáticas baseadas em triggers e condições
- **Real-time Analytics**: Métricas e alertas em tempo real
- **Enterprise Patterns**: Observer, Strategy, Factory para escalabilidade

### Componentes Principais

```
lib/communication/
├── core/                          # Interfaces e abstrações fundamentais
│   ├── types.ts                   # Tipos e interfaces TypeScript
│   └── MessageBus.ts             # Message Bus com garantias de entrega
├── channels/                      # Implementações dos canais
│   ├── BaseChannel.ts            # Classe base abstrata
│   ├── WhatsAppChannel.ts        # WhatsApp Business API + Web Client
│   ├── SMSChannel.ts             # Twilio SMS
│   ├── EmailChannel.ts           # Nodemailer SMTP
│   └── PushChannel.ts            # Web Push API + FCM
├── templates/                     # Sistema de templates
│   └── TemplateEngine.ts         # Engine com Handlebars
├── automation/                   # Automação baseada em regras
│   └── AutomationEngine.ts       # Engine de automação
├── analytics/                    # Analytics e métricas
│   └── AnalyticsEngine.ts        # Engine de analytics
└── webhooks/                     # Handlers de webhooks
    ├── WebhookHandler.ts         # Processador de webhooks
    └── index.ts                  # Rotas Express e utilitários
```

## Funcionalidades

### 1. Message Bus (lib/communication/core/MessageBus.ts)

**Características:**
- Garantias de entrega com retry automático
- Suporte a múltiplos canais com fallback
- Rate limiting por canal e global
- Priorização de mensagens (LOW, NORMAL, HIGH, URGENT)
- Agendamento de mensagens
- Dead Letter Queue para mensagens falhadas
- Health monitoring de canais

**Exemplo de Uso:**
```typescript
const messageBus = new MessageBus({
  redisUrl: 'redis://localhost:6379',
  defaultRetryAttempts: 3,
  defaultRetryDelay: 1000,
  rateLimitGlobal: 10000
});

// Registrar canais
messageBus.registerChannel(whatsAppChannel);
messageBus.registerChannel(smsChannel);
messageBus.registerChannel(emailChannel);

// Enviar mensagem
const messageId = await messageBus.sendMessage(message, {
  preferredChannel: 'whatsapp',
  priority: MessagePriority.HIGH,
  scheduledFor: new Date(Date.now() + 3600000) // 1 hora
});
```

### 2. Canais de Comunicação

#### WhatsApp Channel (WhatsAppChannel.ts)
- **Suporte Duplo**: WhatsApp Business API e WhatsApp Web Client
- **Business API**: Para uso comercial com webhooks oficiais
- **Web Client**: Para desenvolvimento e testes usando whatsapp-web.js
- **Funcionalidades**: Texto, mídia, botões interativos, templates aprovados

#### SMS Channel (SMSChannel.ts)
- **Provider**: Twilio SMS API
- **Funcionalidades**: Mensagens de texto, delivery tracking, opt-out management
- **Rate Limiting**: Configurável por hora

#### Email Channel (EmailChannel.ts)
- **Provider**: Nodemailer com suporte SMTP
- **Funcionalidades**: HTML/texto, anexos, templates, tracking de abertura
- **Configuração**: Flexível para qualquer provedor SMTP

#### Push Notifications Channel (PushChannel.ts)
- **Web Push**: VAPID keys para navegadores
- **Mobile Push**: Firebase Cloud Messaging (FCM)
- **Funcionalidades**: Notificações rich, action buttons, scheduling

### 3. Template Engine (TemplateEngine.ts)

**Características:**
- **Engine**: Handlebars.js para templates flexíveis
- **Caching**: Cache inteligente com TTL configurável
- **Multi-format**: Suporte a texto, HTML, markdown
- **Multi-channel**: Renderização otimizada por canal
- **Helpers**: Helpers customizados (formatDate, formatCurrency, etc.)
- **Validação**: Validação de sintaxe e variáveis obrigatórias

**Exemplo de Template:**
```handlebars
{{! Lembrete de Consulta }}
Olá {{patient.name}},

Você tem uma consulta agendada:

📅 Data: {{formatDate appointment.date "DD/MM/YYYY"}}
🕐 Horário: {{appointment.time}}
👨‍⚕️ Fisioterapeuta: {{appointment.therapist}}

{{#if appointment.isFirstTime}}
⚠️ Primeira consulta - chegue 15 minutos antes.
{{/if}}

{{#unless patient.hasInsurance}}
💳 Lembre-se de trazer forma de pagamento.
{{/unless}}

Atenciosamente,
{{clinic.name}}
```

### 4. Automation Engine (AutomationEngine.ts)

**Características:**
- **Triggers**: Eventos do sistema (consulta agendada, pagamento em atraso, etc.)
- **Condições**: Lógica condicional flexível com operadores
- **Ações**: Envio de mensagens, webhooks, integrações
- **Priorização**: Execução baseada em prioridade das regras
- **Scheduling**: Ações com delay configurável

**Exemplo de Regra:**
```typescript
const reminderRule: AutomationRule = {
  id: 'appointment_24h_reminder',
  name: 'Lembrete 24h antes da consulta',
  trigger: {
    type: 'appointment_reminder',
    conditions: [
      {
        field: 'appointment.hoursUntil',
        operator: 'equals',
        value: '24',
        type: 'number'
      },
      {
        field: 'patient.allowReminders',
        operator: 'equals',
        value: 'true',
        type: 'boolean'
      }
    ]
  },
  actions: [
    {
      type: 'send_message',
      channel: 'whatsapp',
      templateId: 'appointment_reminder_template',
      delay: 0,
      config: {
        fallbackChannels: ['sms', 'email']
      }
    }
  ],
  priority: 5,
  isActive: true
};
```

### 5. Analytics Engine (AnalyticsEngine.ts)

**Métricas Coletadas:**
- **Delivery Metrics**: Taxa de entrega por canal
- **Engagement**: Taxa de abertura, cliques, respostas
- **Performance**: Tempo médio de entrega, latência
- **Costs**: Custo por mensagem e canal
- **Volume**: Mensagens enviadas/recebidas por período
- **Cohort Analysis**: Análise de retenção de pacientes
- **Predictive**: Tendências e previsões

**Dashboard Data:**
```typescript
const dashboardData = await analyticsEngine.getDashboardData({
  timeRange: '7d',
  channels: ['whatsapp', 'sms', 'email'],
  groupBy: 'day'
});

// Retorna: métricas consolidadas, séries temporais, alertas
```

### 6. Webhook System

**Providers Suportados:**
- **Twilio**: Status de SMS e delivery reports
- **WhatsApp Business**: Status de mensagens e mensagens recebidas
- **SendGrid/Mailgun**: Events de email (entrega, abertura, clique)
- **Custom**: Webhooks personalizados para integrações

**Segurança:**
- Verificação de assinatura para todos os providers
- Rate limiting e IP allowlist
- Retry automático com exponential backoff
- Sanitização de logs para proteção de dados

## Schema do Banco de Dados (Supabase)

### Tabelas Principais

#### communication_messages
```sql
CREATE TABLE communication_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type VARCHAR(50) NOT NULL,
  priority communication_priority DEFAULT 'normal',
  status delivery_status DEFAULT 'pending',
  channel communication_channel NOT NULL,
  template_id UUID REFERENCES communication_templates(id),
  recipient_data JSONB NOT NULL,
  content JSONB NOT NULL,
  scheduled_for TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### communication_templates
```sql
CREATE TABLE communication_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  type template_type NOT NULL,
  channels communication_channel[] NOT NULL,
  subject TEXT,
  content TEXT NOT NULL,
  variables TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### automation_rules
```sql
CREATE TABLE automation_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  trigger_type trigger_type NOT NULL,
  trigger_conditions JSONB DEFAULT '[]',
  actions JSONB NOT NULL,
  priority INTEGER DEFAULT 5,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Row Level Security (RLS)

Todas as tabelas possuem políticas RLS baseadas em:
- Organização do usuário
- Permissões por role
- Isolamento de dados por tenant

## Interface de Usuário

### Componentes React

#### 1. CommunicationDashboard.tsx
- **Overview**: Métricas consolidadas em cards
- **Charts**: Gráficos de volume, performance e custos
- **Real-time**: Atualizações automáticas a cada 30 segundos
- **Alerts**: Notificações de problemas e métricas anômalas
- **Filters**: Filtros por canal, período e tipo de mensagem

#### 2. TemplateManager.tsx
- **CRUD**: Criação, edição e exclusão de templates
- **Preview**: Visualização com dados de exemplo
- **Variables**: Inserção assistida de variáveis
- **Validation**: Validação de sintaxe em tempo real
- **Multi-channel**: Configuração por canal

#### 3. AutomationRulesManager.tsx
- **Rule Builder**: Interface visual para criação de regras
- **Condition Editor**: Editor de condições com validação
- **Action Configuration**: Configuração de ações e delays
- **Testing**: Simulação de execução de regras
- **Monitoring**: Status e histórico de execuções

#### 4. CommunicationSettings.tsx
- **Channel Config**: Configuração de credenciais por canal
- **Rate Limits**: Configuração de limites por canal
- **General Settings**: Configurações globais do sistema
- **Health Status**: Status de conectividade dos canais
- **Test Connections**: Teste de configurações

## Configuração

### Variáveis de Ambiente

```env
# WhatsApp Business API
WHATSAPP_BUSINESS_API_TOKEN=your_token
WHATSAPP_PHONE_NUMBER_ID=your_phone_id
WHATSAPP_WEBHOOK_VERIFY_TOKEN=your_verify_token
WHATSAPP_USE_WEB_CLIENT=true

# Twilio SMS
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890

# SMTP Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password

# Push Notifications
VAPID_PUBLIC_KEY=your_vapid_public_key
VAPID_PRIVATE_KEY=your_vapid_private_key
FCM_SERVER_KEY=your_fcm_server_key

# System Settings
COMMUNICATION_RETRY_ATTEMPTS=3
COMMUNICATION_RATE_LIMIT_GLOBAL=10000
COMMUNICATION_ENABLE_ANALYTICS=true
```

### Instalação

```bash
# Instalar dependências
npm install

# Executar migrações do Supabase
supabase db push

# Configurar variáveis de ambiente
cp .env.example .env.local
# Editar .env.local com suas credenciais

# Iniciar servidor de desenvolvimento
npm run dev
```

## Testes

### Suíte de Testes

```bash
# Executar todos os testes
npm test

# Testes específicos do sistema de comunicação
npm test tests/communication/

# Testes com coverage
npm run test:coverage
```

### Testes Implementados

- **MessageBus.test.ts**: Testes do message bus e delivery
- **TemplateEngine.test.ts**: Testes de renderização e templates
- **AutomationEngine.test.ts**: Testes de regras e automação
- **Integration.test.ts**: Testes de integração entre componentes

## Monitoramento e Alertas

### Métricas Importantes

1. **Delivery Rate**: Taxa de entrega por canal
2. **Response Time**: Tempo médio de processamento
3. **Error Rate**: Taxa de erro por canal
4. **Queue Size**: Tamanho das filas de processamento
5. **Cost per Channel**: Custo médio por canal

### Alertas Automáticos

- Taxa de entrega abaixo de 95%
- Tempo de resposta acima de 5 segundos
- Filas com mais de 1000 mensagens pendentes
- Canais offline por mais de 5 minutos
- Custo mensal acima do orçamento

## Segurança

### Proteções Implementadas

1. **Webhook Security**: Verificação de assinatura
2. **Rate Limiting**: Proteção contra spam
3. **Data Sanitization**: Limpeza de logs sensíveis
4. **Opt-out Management**: Respeito às preferências
5. **Encryption**: Dados sensíveis criptografados
6. **RLS**: Row Level Security no Supabase

### Compliance

- **LGPD**: Proteção de dados pessoais
- **Opt-out**: Mecanismos de descadastro
- **Data Retention**: Políticas de retenção
- **Audit Trail**: Log de todas as operações

## Roadmap

### Próximas Funcionalidades

1. **AI Integration**: Templates inteligentes com IA
2. **Advanced Analytics**: Machine learning para insights
3. **Multi-tenant**: Suporte a múltiplas organizações
4. **API Gateway**: API externa para integrações
5. **Mobile App**: App móvel para gestão
6. **Voice Messages**: Suporte a mensagens de voz
7. **Chatbot**: Bot inteligente para atendimento

### Melhorias Planejadas

1. **Performance**: Otimizações de cache e banco
2. **Scalability**: Horizontal scaling com clusters
3. **Monitoring**: Dashboard de monitoramento avançado
4. **Testing**: Cobertura de testes 100%
5. **Documentation**: Documentação interativa

## Contribuição

### Guidelines

1. Seguir padrões TypeScript strict
2. Testes obrigatórios para novas funcionalidades
3. Documentação atualizada
4. Code review obrigatório
5. Semantic versioning

### Estrutura de Commits

```
feat(communication): add WhatsApp Business API support
fix(templates): resolve Handlebars compilation issue
docs(readme): update installation instructions
test(automation): add unit tests for rule engine
```

## Suporte

Para dúvidas e suporte técnico:

1. **Issues**: GitHub Issues para bugs e features
2. **Documentation**: Esta documentação para referência
3. **Tests**: Exemplos nos arquivos de teste
4. **Code Comments**: Comentários inline no código

---

**Desenvolvido para DuduFisio-AI**
Sistema de Comunicação Omnichannel Enterprise
Versão 1.0 - Janeiro 2025