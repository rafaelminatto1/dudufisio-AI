# ✅ TODO: Activity Fisioterapia Integration

> **Checklist Executivo de Implementação**  
> Status: 🟡 Em Planejamento  
> Início: A definir  
> Conclusão Prevista: 12 semanas após início

---

## 📊 Progresso Geral

```
Fase 1 - CRM: ⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜ 0%
Fase 2 - WhatsApp: ⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜ 0%
Fase 3 - IA: ⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜ 0%
Fase 4 - Portal: ⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜ 0%

Progresso Total: 0/48 tarefas (0%)
```

---

## 🚀 PRÉ-REQUISITOS (Semana 0)

### Setup de Contas e Acessos
- [ ] **Meta Business Manager**
  - [ ] Criar/verificar conta Business (CNPJ)
  - [ ] Adicionar administradores
  - [ ] Configurar perfil da empresa
  
- [ ] **WhatsApp Business API**
  - [ ] Decidir provedor (Twilio recomendado)
  - [ ] Criar conta no provedor
  - [ ] Adquirir número dedicado (+55 11 9xxxx-xxxx)
  - [ ] Verificar número na Meta
  
- [ ] **Pagamentos**
  - [ ] Criar conta Stripe OU Mercado Pago
  - [ ] Configurar webhook
  - [ ] Modo teste funcionando
  
- [ ] **Infraestrutura**
  - [ ] Redis configurado (Upstash recomendado)
  - [ ] Variáveis de ambiente atualizadas
  - [ ] Backup do banco de dados atual
  
- [ ] **Documentação**
  - [ ] Ler planejamento completo
  - [ ] Ler quick start
  - [ ] Ler resumo executivo
  - [ ] Reunião de kick-off agendada

**Data limite: Antes de iniciar Fase 1**

---

## 📋 FASE 1: CRM INTEGRADO (Semanas 1-3)

### Semana 1: Database & Modelagem
- [ ] **Migrations SQL**
  - [ ] Criar migration `create_leads_table.sql`
  - [ ] Criar migration `create_lead_interactions_table.sql`
  - [ ] Criar migration `create_message_templates_table.sql`
  - [ ] Criar migration `create_automation_campaigns_table.sql`
  - [ ] Aplicar migrations em DEV
  - [ ] Validar constraints e índices
  
- [ ] **Seeds de Dados**
  - [ ] Script de seed para templates
  - [ ] Dados de teste (10 leads fake)
  - [ ] Campanhas exemplo
  
- [ ] **Testes de Integridade**
  - [ ] Validar foreign keys
  - [ ] Testar soft delete
  - [ ] Verificar performance de queries

**Responsável:** Dev Backend  
**Prazo:** Sexta semana 1

---

### Semana 2: Backend API
- [ ] **Endpoints de Leads**
  - [ ] `POST /api/crm/leads` - Criar lead
  - [ ] `GET /api/crm/leads` - Listar (com filtros)
  - [ ] `GET /api/crm/leads/:id` - Detalhes
  - [ ] `PATCH /api/crm/leads/:id` - Atualizar
  - [ ] `DELETE /api/crm/leads/:id` - Soft delete
  - [ ] `POST /api/crm/leads/:id/convert` - Converter em paciente
  
- [ ] **Endpoints de Interações**
  - [ ] `POST /api/crm/leads/:id/interactions` - Registrar interação
  - [ ] `GET /api/crm/leads/:id/interactions` - Histórico
  
- [ ] **Endpoints de Métricas**
  - [ ] `GET /api/crm/metrics/dashboard` - KPIs principais
  - [ ] `GET /api/crm/metrics/conversion` - Funil de conversão
  - [ ] `GET /api/crm/metrics/sources` - Performance por fonte
  - [ ] `GET /api/crm/pipeline` - Status do pipeline
  
- [ ] **Documentação**
  - [ ] Swagger/OpenAPI spec
  - [ ] Exemplos de requests/responses
  - [ ] Postman collection

**Responsável:** Dev Backend  
**Prazo:** Sexta semana 2

---

### Semana 3: Frontend Dashboard
- [ ] **Componentes Base**
  - [ ] `LeadsDashboard.tsx` - Dashboard principal
  - [ ] `MetricsCards.tsx` - Cards de KPIs
  - [ ] `ConversionFunnel.tsx` - Gráfico de funil
  
- [ ] **Kanban de Leads**
  - [ ] `LeadsKanban.tsx` - Board principal
  - [ ] `LeadCard.tsx` - Card individual
  - [ ] Drag-and-drop funcional
  - [ ] Filtros e busca
  
- [ ] **Painel de Detalhes**
  - [ ] `LeadDetailPanel.tsx` - Painel lateral
  - [ ] Timeline de interações
  - [ ] Botões de ação rápida
  - [ ] Formulário de edição
  
- [ ] **Integração**
  - [ ] Conectar com API
  - [ ] Loading states
  - [ ] Error handling
  - [ ] Toasts de sucesso/erro
  
- [ ] **Testes E2E**
  - [ ] Criar lead
  - [ ] Mover lead no kanban
  - [ ] Converter lead em paciente
  - [ ] Filtrar e buscar

**Responsável:** Dev Frontend  
**Prazo:** Sexta semana 3

**✅ Critério de Aceite Fase 1:**
- Dashboard exibindo métricas em tempo real
- Kanban funcional com drag-and-drop
- Leads podem ser criados, editados e convertidos
- API respondendo em < 200ms (95th percentile)
- Testes E2E passando

---

## 🔗 FASE 2: WHATSAPP BUSINESS API (Semanas 4-6)

### Semana 4: Setup e Templates
- [ ] **Configuração WhatsApp**
  - [ ] Número verificado na Meta
  - [ ] Perfil da empresa configurado
  - [ ] Logo e descrição
  - [ ] Webhook URL cadastrado
  
- [ ] **Templates de Mensagens**
  - [ ] Template: Boas-vindas inicial
  - [ ] Template: Confirmação de agendamento
  - [ ] Template: Lembrete 1 dia antes
  - [ ] Template: Lembrete 2 horas antes
  - [ ] Template: Pós-consulta
  - [ ] Template: Follow-up 24h
  - [ ] Template: Follow-up 3 dias
  - [ ] Template: Follow-up 7 dias
  - [ ] Template: Preço/valores
  - [ ] Template: Endereço/localização
  - [ ] Template: Horários de atendimento
  - [ ] Template: Convênios aceitos
  - [ ] Template: Pagamento confirmado
  - [ ] Template: Remarketing (oferta especial)
  - [ ] Template: Avaliação de satisfação
  - [ ] Todos submetidos para aprovação Meta
  - [ ] Pelo menos 10 aprovados
  
- [ ] **Webhook Básico**
  - [ ] Endpoint `/api/webhooks/whatsapp`
  - [ ] Verificação de token (GET)
  - [ ] Recebimento de mensagens (POST)
  - [ ] Logs estruturados
  - [ ] Validação de assinatura

**Responsável:** Dev Backend + Marketing (templates)  
**Prazo:** Sexta semana 4

---

### Semana 5: Backend de Mensageria
- [ ] **WhatsAppService**
  - [ ] Classe `WhatsAppService`
  - [ ] Método `sendMessage()`
  - [ ] Método `sendTemplateMessage()`
  - [ ] Método `processIncomingMessage()`
  - [ ] Rate limiting (Redis)
  - [ ] Retry logic para falhas
  
- [ ] **FlowEngine**
  - [ ] Classe `ConversationFlowEngine`
  - [ ] Fluxo: Primeira vez
  - [ ] Fluxo: Paciente existente
  - [ ] Fluxo: Remarcação/cancelamento
  - [ ] Detectar intenção
  - [ ] Responder por gatilhos (preço, endereço, etc)
  
- [ ] **Sistema de Contexto**
  - [ ] Redis para armazenar estado da conversa
  - [ ] TTL de 24 horas
  - [ ] Recuperar contexto por telefone
  
- [ ] **Sistema de Filas**
  - [ ] Setup Bull/BullMQ
  - [ ] Fila: `whatsapp-outbound`
  - [ ] Fila: `whatsapp-scheduled`
  - [ ] Workers processando
  - [ ] Dashboard Bull Board (dev)
  
- [ ] **Registros**
  - [ ] Salvar todas interações em `lead_interactions`
  - [ ] Atualizar `last_contact_at` do lead
  - [ ] Incrementar `contact_count`

**Responsável:** Dev Backend  
**Prazo:** Sexta semana 5

---

### Semana 6: Automações e UI
- [ ] **Sequências de Automação**
  - [ ] Sequência: Remarketing (24h, 3d, 7d)
  - [ ] Sequência: Confirmação de agendamento
  - [ ] Sequência: Lembretes (1d, 2h)
  - [ ] Sequência: Pós-consulta (1h, 7d)
  - [ ] Triggers configurados
  - [ ] Jobs agendados corretamente
  
- [ ] **UI de Gerenciamento**
  - [ ] `WhatsAppInbox.tsx` - Caixa de entrada
  - [ ] `ConversationThread.tsx` - Thread de mensagens
  - [ ] `TemplateManager.tsx` - Gerenciar templates
  - [ ] `CampaignBuilder.tsx` - Criar campanhas
  - [ ] Responder manualmente
  - [ ] Ver status de mensagens (enviada, lida, etc)
  
- [ ] **Dashboard WhatsApp**
  - [ ] Mensagens enviadas/recebidas
  - [ ] Taxa de resposta
  - [ ] Tempo médio de resposta
  - [ ] Templates mais usados
  
- [ ] **Testes Completos**
  - [ ] Fluxo de primeira vez (E2E)
  - [ ] Fluxo de remarcação (E2E)
  - [ ] Lembretes automáticos
  - [ ] Follow-up de remarketing
  - [ ] Resposta a gatilhos

**Responsável:** Dev Full-stack  
**Prazo:** Sexta semana 6

**✅ Critério de Aceite Fase 2:**
- WhatsApp Business API conectada e funcional
- 15+ templates aprovados pela Meta
- Webhook recebendo e processando mensagens
- Fluxos conversacionais respondendo automaticamente
- Sistema de filas processando jobs agendados
- 3 sequências de automação ativas
- Taxa de entrega > 95%

---

## 🤖 FASE 3: IA CONVERSACIONAL (Semanas 7-9)

### Semana 7: Agente Conversacional
- [ ] **ConversationalAgent**
  - [ ] Classe `ConversationalAgent`
  - [ ] Integração com Gemini API
  - [ ] Histórico de conversas (Redis)
  - [ ] Método `processMessage()`
  - [ ] Prompts otimizados para fisioterapia
  
- [ ] **NLU - Natural Language Understanding**
  - [ ] Método `extractIntent()` - Classificação
  - [ ] Método `extractEntities()` - NER
  - [ ] Método `calculateConfidence()` - Score
  - [ ] Método `getSuggestedActions()`
  
- [ ] **Intenções Suportadas**
  - [ ] greeting - Saudação
  - [ ] schedule - Agendar
  - [ ] reschedule - Remarcar
  - [ ] cancel - Cancelar
  - [ ] info_price - Preços
  - [ ] info_location - Localização
  - [ ] info_hours - Horários
  - [ ] info_insurance - Convênios
  - [ ] pain_sports - Dor esportiva
  - [ ] pain_atm - ATM
  - [ ] running_assessment - Avaliação de corrida
  - [ ] question - Dúvida geral
  
- [ ] **Qualidade**
  - [ ] Dataset de teste (50+ exemplos)
  - [ ] Taxa de acerto > 85%
  - [ ] Fallback para humano quando confiança < 70%
  - [ ] Logs de todas interações IA

**Responsável:** Dev Backend + IA  
**Prazo:** Sexta semana 7

---

### Semana 8: Smart Scheduler
- [ ] **SmartScheduler**
  - [ ] Classe `SmartScheduler`
  - [ ] Método `suggestAppointmentSlots()`
  - [ ] Método `detectUrgency()`
  - [ ] Método `autoSchedule()`
  - [ ] Método `rankSlots()`
  
- [ ] **Lógica de Ranking**
  - [ ] Preferências do lead
  - [ ] Disponibilidade da agenda
  - [ ] Taxa de conversão por horário
  - [ ] Distância (se disponível)
  - [ ] Urgência do caso
  
- [ ] **Detecção de Urgência**
  - [ ] Prompt específico para urgência
  - [ ] Classificação: baixa, media, alta, urgente
  - [ ] Priorização na fila
  
- [ ] **Integração**
  - [ ] Conectar com Google Calendar existente
  - [ ] Criar evento automaticamente
  - [ ] Enviar convite
  - [ ] Atualizar status do lead

**Responsável:** Dev Backend + IA  
**Prazo:** Sexta semana 8

---

### Semana 9: Recomendações
- [ ] **RecommendationEngine**
  - [ ] Classe `RecommendationEngine`
  - [ ] Método `recommendProtocol()`
  - [ ] Método `recommendNextAction()`
  - [ ] Método `scoreLeads()`
  
- [ ] **Lead Scoring**
  - [ ] Fatores de scoring definidos
  - [ ] Modelo de ML ou regras
  - [ ] Score 0-100 para cada lead
  - [ ] Classificação: frio, morno, quente, urgente
  
- [ ] **Recomendação de Protocolos**
  - [ ] Prompt para Gemini
  - [ ] Dados estruturados (JSON)
  - [ ] Validação de saída
  - [ ] Integração com prontuário
  
- [ ] **Dashboard de IA**
  - [ ] Métricas de performance da IA
  - [ ] Taxa de acerto por intenção
  - [ ] Leads mais qualificados
  - [ ] Recomendações geradas

**Responsável:** Dev Backend + IA  
**Prazo:** Sexta semana 9

**✅ Critério de Aceite Fase 3:**
- IA conversacional respondendo naturalmente
- Taxa de resposta correta > 85%
- Detecção de intenção com acurácia > 90%
- Agendamento inteligente sugerindo slots relevantes
- Sistema de scoring classificando leads
- Recomendações de protocolo geradas
- Handoff para humano quando confiança baixa

---

## 📱 FASE 4: PORTAL DO PACIENTE (Semanas 10-12)

### Semana 10: Portal Base
- [ ] **Autenticação**
  - [ ] Login com telefone + SMS OTP
  - [ ] Login com email + password
  - [ ] Cadastro simplificado
  - [ ] Recuperação de senha
  
- [ ] **Dashboard Paciente**
  - [ ] Próximas consultas
  - [ ] Histórico de atendimentos
  - [ ] Plano de tratamento atual
  - [ ] Documentos disponíveis
  
- [ ] **Agendamento Self-Service**
  - [ ] Ver horários disponíveis
  - [ ] Agendar consulta
  - [ ] Remarcar (até 24h antes)
  - [ ] Cancelar
  - [ ] Confirmação automática
  
- [ ] **Tratamento e Exercícios**
  - [ ] Ver protocolo atual
  - [ ] Lista de exercícios
  - [ ] Vídeos demonstrativos
  - [ ] Marcar como concluído
  - [ ] Registrar feedback (dor, dificuldade)

**Responsável:** Dev Frontend  
**Prazo:** Sexta semana 10

---

### Semana 11: Gamificação
- [ ] **Tabelas Database**
  - [ ] `gamification_points`
  - [ ] `gamification_achievements`
  - [ ] `patient_achievements`
  - [ ] Seeds de conquistas
  
- [ ] **Sistema de Pontos**
  - [ ] Regras de pontuação definidas
  - [ ] Eventos que geram pontos
  - [ ] Triggers no backend
  - [ ] API de pontos
  
- [ ] **Conquistas**
  - [ ] 10+ conquistas criadas
  - [ ] Ícones/badges
  - [ ] Descrições motivacionais
  - [ ] Lógica de unlock
  
- [ ] **Recompensas**
  - [ ] 5+ recompensas definidas
  - [ ] Sistema de resgate
  - [ ] Aprovação manual (admin)
  
- [ ] **UI Gamificação**
  - [ ] Dashboard de pontos
  - [ ] Badges conquistados
  - [ ] Barra de progresso de nível
  - [ ] Loja de recompensas
  - [ ] Ranking (opcional)
  - [ ] Notificações de conquista

**Responsável:** Dev Full-stack  
**Prazo:** Sexta semana 11

---

### Semana 12: Pagamentos e Finalização
- [ ] **Integração Pagamentos**
  - [ ] Stripe OU Mercado Pago configurado
  - [ ] Método `createPaymentLink()`
  - [ ] Método `createPixPayment()`
  - [ ] Webhook de confirmação
  - [ ] Retry logic
  
- [ ] **Fluxo de Pagamento**
  - [ ] Link enviado após agendamento
  - [ ] Página de checkout
  - [ ] Confirmação visual
  - [ ] Nota fiscal (se aplicável)
  
- [ ] **UI de Pagamento**
  - [ ] Histórico de pagamentos
  - [ ] Status de cada pagamento
  - [ ] Métodos salvos (opcional)
  
- [ ] **Telemedicina Básica** (Opcional)
  - [ ] Integração com Twilio Video
  - [ ] Link de vídeo automático
  - [ ] Sala de espera virtual
  
- [ ] **Testes Finais**
  - [ ] Fluxo completo: Agendamento → Pagamento → Confirmação
  - [ ] Testes de carga (100+ usuários simultâneos)
  - [ ] Testes de segurança (OWASP Top 10)
  - [ ] Testes de acessibilidade (WCAG 2.1)
  
- [ ] **Deploy em Produção**
  - [ ] Checklist de pré-deploy
  - [ ] Backup do banco
  - [ ] Deploy em horário de baixo tráfego
  - [ ] Monitoramento ativo
  - [ ] Rollback plan pronto

**Responsável:** Dev Full-stack + DevOps  
**Prazo:** Sexta semana 12

**✅ Critério de Aceite Fase 4:**
- Portal do paciente acessível via web/mobile
- Pacientes conseguem agendar autonomamente
- Sistema de gamificação registrando pontos
- Pelo menos 3 recompensas resgatáveis
- Pagamentos via PIX/cartão funcionando
- Confirmação automática por WhatsApp
- Taxa de conclusão de pagamento > 80%

---

## 🔧 TAREFAS COMPLEMENTARES (Paralelo)

### CI/CD
- [ ] Consolidar workflows GitHub Actions
- [ ] Configurar Dependabot
- [ ] Security scans (Snyk, Trivy)
- [ ] E2E tests no pipeline
- [ ] Notificações Slack/Discord

### Documentação
- [ ] API Reference completa (Swagger)
- [ ] Guias de usuário atualizados
- [ ] Runbooks para operações
- [ ] Troubleshooting guide
- [ ] Vídeos tutoriais

### Treinamento
- [ ] Onboarding da equipe
- [ ] Workshop CRM
- [ ] Treinamento WhatsApp
- [ ] Uso da IA
- [ ] Dashboard de métricas

---

## 📊 MÉTRICAS DE ACOMPANHAMENTO

### Semanais
- [ ] Burndown chart atualizado
- [ ] Retrospectiva de sprint
- [ ] Demo para stakeholders
- [ ] Ajustes de backlog

### Mensais
- [ ] Review de KPIs
- [ ] Análise de ROI parcial
- [ ] Ajustes de prioridade
- [ ] Relatório executivo

---

## 🎉 CONCLUSÃO E GO-LIVE

### Pré-Launch Checklist
- [ ] Todas as 4 fases concluídas
- [ ] Testes E2E passando (100%)
- [ ] Testes de carga OK
- [ ] Security audit aprovado
- [ ] Documentação completa
- [ ] Treinamento realizado
- [ ] Backup do banco
- [ ] Rollback plan documentado
- [ ] Monitoramento configurado
- [ ] Suporte 24/7 escalado

### Go-Live
- [ ] Deploy em produção
- [ ] Smoke tests
- [ ] Monitoramento ativo (primeiras 24h)
- [ ] Comunicação aos usuários
- [ ] Coleta de feedback

### Pós-Launch (Primeiros 30 dias)
- [ ] Acompanhamento diário de métricas
- [ ] Ajustes baseados em feedback
- [ ] Otimizações de performance
- [ ] Documentação de lições aprendidas
- [ ] Celebração com a equipe! 🎉

---

## 📞 CONTATOS E RESPONSÁVEIS

### Equipe
- **Dev Backend:** [Nome]
- **Dev Frontend:** [Nome]
- **Dev IA/ML:** [Nome]
- **Designer UX:** [Nome]
- **QA:** [Nome]
- **DevOps:** [Nome]
- **Gerente de Projeto:** [Nome]

### Stakeholders
- **Product Owner:** [Nome]
- **Tech Lead:** [Nome]
- **Business Owner:** [Nome]

### Reuniões
- **Daily:** Todos os dias às [horário]
- **Sprint Review:** Sextas às [horário]
- **Retrospectiva:** Sextas às [horário]
- **Demo Stakeholders:** Última sexta do sprint

---

**Última atualização:** 08/10/2025  
**Próxima revisão:** Após conclusão de cada fase  
**Status geral:** 🟡 Em Planejamento

---

*Para mais detalhes, consulte:*
- [`docs/PLANEJAMENTO_ACTIVITY_FISIOTERAPIA_INTEGRADO.md`](docs/PLANEJAMENTO_ACTIVITY_FISIOTERAPIA_INTEGRADO.md)
- [`docs/ACTIVITY_INTEGRATION_QUICKSTART.md`](docs/ACTIVITY_INTEGRATION_QUICKSTART.md)
- [`docs/ACTIVITY_INTEGRATION_EXECUTIVE_SUMMARY.md`](docs/ACTIVITY_INTEGRATION_EXECUTIVE_SUMMARY.md)

