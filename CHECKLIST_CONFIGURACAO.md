# ✅ Checklist de Configuração - Sistema de Autenticação e Calendários

## 🎯 Status Geral

- [x] **Código implementado** (100%)
- [x] **Deployment realizado** (READY)
- [ ] **Configuração do Supabase** (Pendente)
- [ ] **Configuração do Vercel** (Pendente)
- [ ] **Testes realizados** (Pendente)

---

## 📋 Checklist Detalhado

### 1️⃣ Verificação do Deployment

- [x] **Deploy no Vercel realizado**
  - [x] Build concluído com sucesso
  - [x] Site acessível em: https://moocafisio.com.br
  - [x] Edge Functions deployadas
  - [x] Cron Jobs configurados

**Comandos:**
```bash
# Verificar deployment
npm run check:deployment
```

---

### 2️⃣ Configuração do Supabase Dashboard

#### 2.1 Google OAuth
- [ ] **Habilitar Google OAuth**
  - [ ] Acessar: https://supabase.com/dashboard/project/[PROJECT_ID]/auth/providers
  - [ ] Clicar em "Google"
  - [ ] Habilitar o provider
  - [ ] Adicionar Client ID do Google Cloud Console
  - [ ] Adicionar Client Secret do Google Cloud Console
  - [ ] Configurar Redirect URL: `https://[PROJECT_ID].supabase.co/auth/v1/callback`

**Como obter credenciais do Google:**
1. Acessar: https://console.cloud.google.com
2. Criar/Selecionar projeto
3. Ir em "APIs & Services" > "Credentials"
4. Criar credenciais OAuth 2.0
5. Adicionar URI de redirecionamento autorizado
6. Copiar Client ID e Client Secret

#### 2.2 Apple Sign-In
- [ ] **Habilitar Apple Sign-In**
  - [ ] Acessar: https://supabase.com/dashboard/project/[PROJECT_ID]/auth/providers
  - [ ] Clicar em "Apple"
  - [ ] Habilitar o provider
  - [ ] Adicionar Client ID do Apple Developer
  - [ ] Adicionar Client Secret do Apple Developer
  - [ ] Configurar Redirect URL: `https://[PROJECT_ID].supabase.co/auth/v1/callback`

**Como obter credenciais do Apple:**
1. Acessar: https://developer.apple.com
2. Ir em "Certificates, Identifiers & Profiles"
3. Criar um Service ID
4. Configurar Sign In with Apple
5. Gerar Client Secret
6. Copiar Client ID e Client Secret

#### 2.3 Twilio para SMS OTP
- [ ] **Configurar Twilio**
  - [ ] Acessar: https://supabase.com/dashboard/project/[PROJECT_ID]/settings/auth
  - [ ] Role até "Phone Auth"
  - [ ] Adicionar Twilio Account SID
  - [ ] Adicionar Twilio Auth Token
  - [ ] Adicionar Twilio Phone Number

**Como obter credenciais do Twilio:**
1. Acessar: https://www.twilio.com
2. Criar conta ou fazer login
3. Ir em "Console" > "Account"
4. Copiar Account SID e Auth Token
5. Ir em "Phone Numbers" > "Manage" > "Buy a number"
6. Copiar o número de telefone

#### 2.4 Executar Migrations
- [ ] **Executar migrations no banco de dados**
  - [ ] Acessar: https://supabase.com/dashboard/project/[PROJECT_ID]/sql/new
  - [ ] Executar migration: `supabase/migrations/20250118000000_create_calendar_links.sql`
  - [ ] Executar migration: `supabase/migrations/20250118000001_calendar_automation.sql`

**Ou via CLI:**
```bash
npx supabase db push
```

---

### 3️⃣ Configuração do Vercel

#### 3.1 Adicionar CRON_SECRET
- [ ] **Adicionar variável CRON_SECRET**
  - [ ] Acessar: https://vercel.com/rafael-minattos-projects/dudufisio-ai/settings/environment-variables
  - [ ] Clicar em "Add New"
  - [ ] Nome: `CRON_SECRET`
  - [ ] Valor: (gerar com `npm run generate:cron-secret`)
  - [ ] Ambiente: Production, Preview, Development
  - [ ] Clicar em "Save"

**Comando para gerar CRON_SECRET:**
```bash
npm run generate:cron-secret
```

#### 3.2 Verificar Edge Functions
- [ ] **Verificar Edge Functions ativas**
  - [ ] Acessar: https://vercel.com/rafael-minattos-projects/dudufisio-ai/functions
  - [ ] Confirmar que `api/calendar/[appointmentId].ts` está ativa
  - [ ] Confirmar que `api/cron/send-reminders.ts` está ativa
  - [ ] Confirmar que `api/cron/cleanup-old-links.ts` está ativa
  - [ ] Confirmar que `api/cron/sync-calendar-access.ts` está ativa

#### 3.3 Verificar Cron Jobs
- [ ] **Verificar Cron Jobs configurados**
  - [ ] Acessar: https://vercel.com/rafael-minattos-projects/dudufisio-ai/crons
  - [ ] Confirmar que "send-reminders" está ativo (8h e 20h)
  - [ ] Confirmar que "cleanup-old-links" está ativo (3h)
  - [ ] Confirmar que "sync-calendar-access" está ativo (15 min)

---

### 4️⃣ Testes de Funcionalidade

#### 4.1 Autenticação
- [ ] **Testar Login com Google**
  - [ ] Acessar: https://moocafisio.com.br/login
  - [ ] Clicar em "Continuar com Google"
  - [ ] Autorizar acesso
  - [ ] Verificar redirecionamento para dashboard

- [ ] **Testar Login com Apple**
  - [ ] Clicar em "Apple"
  - [ ] Fazer login com Apple ID
  - [ ] Verificar redirecionamento para dashboard

- [ ] **Testar OTP via Email**
  - [ ] Clicar na tab "Login sem senha"
  - [ ] Digitar email
  - [ ] Clicar em "Enviar código"
  - [ ] Verificar email
  - [ ] Digitar código recebido
  - [ ] Verificar login

- [ ] **Testar OTP via SMS**
  - [ ] Mudar para "Telefone"
  - [ ] Digitar número (+5511999999999)
  - [ ] Clicar em "Enviar código"
  - [ ] Verificar SMS
  - [ ] Digitar código recebido
  - [ ] Verificar login

#### 4.2 Calendários
- [ ] **Testar Geração de .ics**
  - [ ] Criar um agendamento
  - [ ] Acessar: `https://moocafisio.com.br/api/calendar/[APPOINTMENT_ID].ics`
  - [ ] Verificar download do arquivo .ics

- [ ] **Testar Adição ao Google Calendar**
  - [ ] Abrir arquivo .ics
  - [ ] Ou usar link direto do Google Calendar
  - [ ] Verificar adição ao calendário

- [ ] **Testar Adição ao Apple Calendar**
  - [ ] Abrir arquivo .ics no iPhone/Mac
  - [ ] Verificar adição ao calendário

- [ ] **Testar Badges de Status**
  - [ ] Criar agendamento
  - [ ] Verificar badge "Pendente"
  - [ ] Enviar convite
  - [ ] Verificar badge "Enviado"
  - [ ] Acessar link
  - [ ] Verificar badge "Acessado"

#### 4.3 Automação
- [ ] **Testar Trigger de Auto-geração**
  - [ ] Criar novo agendamento
  - [ ] Verificar no Supabase se link foi gerado automaticamente
  - [ ] Confirmar entrada na tabela `calendar_links`

- [ ] **Testar Lembretes Automáticos**
  - [ ] Aguardar horário configurado (8h ou 20h)
  - [ ] Ou testar manualmente: `https://moocafisio.com.br/api/cron/send-reminders`
  - [ ] Verificar envio de mensagens

- [ ] **Testar Realtime Updates**
  - [ ] Abrir site em duas abas
  - [ ] Criar agendamento em uma aba
  - [ ] Verificar atualização automática na outra aba

---

### 5️⃣ Monitoramento

#### 5.1 Vercel Analytics
- [ ] **Verificar métricas**
  - [ ] Acessar: https://vercel.com/rafael-minattos-projects/dudufisio-ai/analytics
  - [ ] Verificar performance
  - [ ] Verificar uso de Edge Functions
  - [ ] Verificar execução de Cron Jobs

#### 5.2 Supabase Dashboard
- [ ] **Verificar métricas**
  - [ ] Acessar: https://supabase.com/dashboard/project/[PROJECT_ID]
  - [ ] Verificar uso de Auth
  - [ ] Verificar queries do banco
  - [ ] Verificar Realtime connections

---

## 🚀 Comandos Úteis

### Setup Completo
```bash
# Executar setup completo
npm run setup:complete
```

### Setup Individual
```bash
# Setup de autenticação
npm run setup:auth

# Verificar deployment
npm run check:deployment

# Testar calendários
npm run test:calendar

# Gerar CRON_SECRET
npm run generate:cron-secret
```

---

## 📊 Progresso

**Total:** 45 tarefas  
**Concluídas:** 5 tarefas  
**Pendentes:** 40 tarefas  
**Progresso:** 11%

---

## 📞 Suporte

### Documentação
- `PROXIMOS_PASSOS.md` - Guia de configuração
- `RESUMO_IMPLEMENTACAO_FINAL.md` - Resumo da implementação
- `RESUMO_EXECUTIVO.md` - Resumo executivo
- `scripts/README.md` - Documentação dos scripts

### Links Úteis
- [Supabase Dashboard](https://supabase.com/dashboard)
- [Vercel Dashboard](https://vercel.com/dashboard)
- [Google Cloud Console](https://console.cloud.google.com)
- [Apple Developer](https://developer.apple.com)
- [Twilio Console](https://www.twilio.com/console)

---

**Última atualização:** 18 de Janeiro de 2025  
**Status:** ⏳ Configuração em andamento

