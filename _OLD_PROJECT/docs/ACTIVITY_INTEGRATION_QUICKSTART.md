# ⚡ Quick Start - Activity Fisioterapia Integration

> **Guia Rápido de Início**  
> Versão executiva do planejamento completo

---

## 🎯 Visão Geral em 30 Segundos

Implementar **automação completa de CRM, WhatsApp e IA** no DuduFisio-AI em **12 semanas**, dividido em **4 fases**.

**Resultado esperado:**
- ✅ 30% mais conversões
- ✅ Respostas automáticas em < 5 segundos
- ✅ 85% de confirmação de consultas
- ✅ Portal do paciente com gamificação

---

## 📅 Cronograma Resumido

| Fase | Duração | Entregas Principais |
|------|---------|---------------------|
| **1. CRM** | 3 semanas | Dashboard CRM + API completa |
| **2. WhatsApp** | 3 semanas | WhatsApp Business API + Automações |
| **3. IA** | 3 semanas | IA Conversacional + Agendamento Inteligente |
| **4. Portal** | 3 semanas | Portal do Paciente + Gamificação + Pagamentos |

---

## 🚀 Como Começar HOJE

### Passo 1: Leia a Documentação Completa
```bash
# Ver planejamento completo
cat docs/PLANEJAMENTO_ACTIVITY_FISIOTERAPIA_INTEGRADO.md
```

### Passo 2: Setup de Contas e Ferramentas

**Obrigatórios:**
```bash
# 1. Número WhatsApp dedicado
- Comprar número novo (recomendado)
- OU usar existente (não recomendado)

# 2. Criar conta Twilio
https://www.twilio.com/try-twilio
- Verificar CNPJ
- Adicionar créditos (R$ 100 inicial)

# 3. Meta Business Manager
https://business.facebook.com/
- Verificar empresa
- Adicionar número ao WhatsApp Business

# 4. Configurar .env.local
cp .env.example .env.local
```

**Variáveis de ambiente necessárias:**
```bash
# WhatsApp / Twilio
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxx
TWILIO_WHATSAPP_NUMBER=+5511999999999
WHATSAPP_VERIFY_TOKEN=seu_token_secreto_aqui

# Gemini API (já tem)
GEMINI_API_KEY=xxxxxxxxxxxxx

# Pagamentos (Stripe)
STRIPE_SECRET_KEY=sk_live_xxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx

# Redis (Upstash ou local)
REDIS_URL=redis://localhost:6379
# OU
UPSTASH_REDIS_URL=https://xxxxx.upstash.io
UPSTASH_REDIS_TOKEN=xxxxxxxxxxxxx

# Supabase (já tem)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxxxxxxxxxxxx
SUPABASE_SERVICE_ROLE_KEY=xxxxxxxxxxxxx
```

### Passo 3: Aplicar Migrations da Fase 1

```bash
# Backup do banco ANTES!
npx supabase db dump -f backup_$(date +%Y%m%d).sql

# Aplicar migrations
npx supabase db push

# OU manualmente
psql $DATABASE_URL -f supabase/migrations/20251008100001_create_crm_tables.sql
```

### Passo 4: Instalar Dependências Novas

```bash
npm install --save \
  twilio \
  bull bullmq \
  ioredis \
  stripe \
  @google/generative-ai \
  date-fns \
  zod
```

---

## 📋 Checklist Semanal

### ✅ Semana 1 (CRM - Database)
- [ ] Aplicar migrations CRM
- [ ] Seeds de dados de teste
- [ ] Validar integridade de dados
- [ ] Criar primeira API endpoint (GET /api/crm/leads)
- [ ] Testar criação de lead via Postman

### ✅ Semana 2 (CRM - Backend)
- [ ] Completar API de leads (CRUD)
- [ ] API de interações
- [ ] API de métricas
- [ ] Testes unitários
- [ ] Documentação Swagger/OpenAPI

### ✅ Semana 3 (CRM - Frontend)
- [ ] Dashboard com métricas
- [ ] Kanban de leads
- [ ] Painel de detalhes do lead
- [ ] Filtros e busca
- [ ] Integração completa

### ✅ Semana 4 (WhatsApp - Setup)
- [ ] Conta Twilio ativa
- [ ] Número verificado
- [ ] 15 templates criados
- [ ] Templates submetidos para aprovação
- [ ] Webhook básico funcionando

### ✅ Semana 5 (WhatsApp - Backend)
- [ ] WhatsAppService completo
- [ ] FlowEngine implementado
- [ ] Redis para contexto
- [ ] Bull para filas
- [ ] Rate limiting

### ✅ Semana 6 (WhatsApp - Automações)
- [ ] 3 sequências ativas (remarketing, confirmação, pós-consulta)
- [ ] UI de gerenciamento
- [ ] Dashboard de mensagens
- [ ] Testes de fluxo completo

### ✅ Semana 7 (IA - Conversacional)
- [ ] ConversationalAgent com Gemini
- [ ] Detecção de intenções
- [ ] Extração de entidades
- [ ] Histórico de conversas
- [ ] Taxa de acerto > 85%

### ✅ Semana 8 (IA - Smart Scheduling)
- [ ] Agendamento inteligente
- [ ] Detecção de urgência
- [ ] Sugestão de horários
- [ ] Auto-agendamento

### ✅ Semana 9 (IA - Recomendações)
- [ ] Lead scoring
- [ ] Recomendação de protocolos
- [ ] Dashboard de IA
- [ ] Métricas de performance

### ✅ Semana 10 (Portal - Base)
- [ ] Autenticação (SMS OTP)
- [ ] Dashboard do paciente
- [ ] Agendamento self-service
- [ ] Visualização de tratamento

### ✅ Semana 11 (Portal - Gamificação)
- [ ] Sistema de pontos
- [ ] Conquistas
- [ ] Recompensas
- [ ] Ranking (opcional)

### ✅ Semana 12 (Portal - Pagamentos)
- [ ] Integração Stripe/MercadoPago
- [ ] Link de pagamento automático
- [ ] Webhook de confirmação
- [ ] Testes completos
- [ ] Deploy em produção 🚀

---

## 🔑 Comandos Essenciais

### Development
```bash
# Desenvolvimento local
npm run dev

# Build
npm run build

# Preview production
npm run start

# Type check
npm run type-check

# Lint
npm run lint

# Tests
npm test
npm run test:e2e
```

### Database
```bash
# Ver status
npx supabase status

# Migrations
npx supabase migration list
npx supabase db push
npx supabase db reset  # CUIDADO!

# Backup
npx supabase db dump -f backup.sql

# Restore
psql $DATABASE_URL < backup.sql
```

### WhatsApp
```bash
# Testar webhook
curl -X POST https://seu-dominio.com/api/webhooks/whatsapp \
  -H "Content-Type: application/json" \
  -d '{"from": "+5511999999999", "body": "Olá"}'

# Ver logs do Twilio
npx twilio api:core:messages:list --limit 10
```

### Redis (Filas)
```bash
# Verificar filas
redis-cli KEYS "bull:*"

# Ver jobs pendentes
redis-cli LLEN "bull:whatsapp-queue:wait"

# Limpar filas (desenvolvimento)
redis-cli FLUSHDB
```

---

## 📊 Métricas Para Acompanhar

### Diárias
- Novos leads
- Mensagens enviadas/recebidas (WhatsApp)
- Agendamentos criados
- Taxa de resposta

### Semanais
- Taxa de conversão por fonte
- Tempo médio de resposta
- Taxa de confirmação de consultas
- Receita por canal

### Mensais
- NPS (Net Promoter Score)
- Taxa de retenção
- Lifetime Value (LTV)
- CAC (Custo de Aquisição)
- ROI por canal

---

## ⚠️ Troubleshooting Rápido

### Problema: WhatsApp não recebe mensagens
```bash
# 1. Verificar webhook
curl https://seu-dominio.com/api/webhooks/whatsapp?hub.mode=subscribe&hub.verify_token=SEU_TOKEN&hub.challenge=test

# 2. Verificar logs Twilio
# Dashboard > Monitor > Logs > Errors

# 3. Testar rate limiting
# Redis: verificar se não está bloqueado
```

### Problema: Templates rejeitados
```
Causa comum: Variáveis dinâmicas não permitidas
Solução: Usar apenas variáveis pré-aprovadas pela Meta
Documentação: https://developers.facebook.com/docs/whatsapp/message-templates/guidelines
```

### Problema: Gemini API lenta
```bash
# 1. Implementar cache
# Redis: cachear respostas por 1 hora

# 2. Rate limiting
# Limitar a 10 requests/segundo

# 3. Fallback
# Se timeout > 5s, usar resposta padrão
```

### Problema: Filas não processando
```bash
# 1. Verificar Bull dashboard
npm install -g bull-repl
bull-repl

# 2. Restart workers
pm2 restart workers

# 3. Limpar filas travadas
npm run queue:clean
```

---

## 🎓 Recursos de Aprendizado

### Documentação Oficial
- [WhatsApp Business API](https://developers.facebook.com/docs/whatsapp)
- [Twilio WhatsApp](https://www.twilio.com/docs/whatsapp)
- [Google Gemini](https://ai.google.dev/docs)
- [Stripe](https://stripe.com/docs)
- [Supabase](https://supabase.com/docs)
- [Bull](https://github.com/OptimalBits/bull)

### Tutoriais Recomendados
- [Building a WhatsApp Bot with Node.js](https://www.twilio.com/blog/build-whatsapp-chatbot-nodejs)
- [AI Chatbots with Gemini](https://ai.google.dev/tutorials/node_quickstart)
- [Stripe Payment Integration](https://stripe.com/docs/payments/quickstart)

---

## 🆘 Precisa de Ajuda?

### Documentação do Projeto
```bash
# Planejamento completo
docs/PLANEJAMENTO_ACTIVITY_FISIOTERAPIA_INTEGRADO.md

# Índice geral
docs/INDEX.md

# Arquitetura
docs/VISUAL_ARCHITECTURE.md

# Workflows
docs/SYSTEM_WORKFLOWS_WIREFRAMES.md
```

### Suporte
1. Consultar documentação acima
2. Ver issues no GitHub
3. Revisar logs de erro
4. Contatar equipe técnica

---

## 🎉 Próximo Passo

**Está pronto?** Comece pela **Fase 1 - Semana 1**:

1. Aplicar migrations CRM
2. Criar primeira tabela de leads
3. Fazer seed de dados de teste
4. Criar primeiro endpoint API

```bash
# Comando para começar AGORA
git checkout -b feature/crm-phase1
```

**Boa sorte! 🚀**

---

*Última atualização: 08/10/2025*  
*Versão: 1.0.0*  
*Para mais detalhes: `PLANEJAMENTO_ACTIVITY_FISIOTERAPIA_INTEGRADO.md`*

