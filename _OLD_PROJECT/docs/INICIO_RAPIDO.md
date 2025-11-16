# 🚀 Início Rápido - Sistema de Autenticação e Calendários

## ✅ Status Atual

- ✅ **Código:** 100% Implementado
- ✅ **Deployment:** READY (https://moocafisio.com.br)
- ✅ **Documentação:** 7 arquivos criados
- ✅ **Scripts:** 4 scripts de utilidade
- ⏳ **Configuração:** Pendente (você está aqui!)

---

## 🎯 Próximos Passos (30 minutos)

### 1️⃣ Gerar CRON_SECRET (2 minutos)

```bash
npm run generate:cron-secret
```

Copie a chave gerada e adicione no Vercel:
- URL: https://vercel.com/rafael-minattos-projects/dudufisio-ai/settings/environment-variables
- Nome: `CRON_SECRET`
- Valor: (cole a chave gerada)
- Ambientes: Production, Preview, Development

---

### 2️⃣ Configurar Supabase (15 minutos)

#### Google OAuth
1. Acesse: https://supabase.com/dashboard/project/[PROJECT_ID]/auth/providers
2. Clique em "Google"
3. Habilite e adicione:
   - Client ID (do Google Cloud Console)
   - Client Secret (do Google Cloud Console)
   - Redirect URL: `https://[PROJECT_ID].supabase.co/auth/v1/callback`

#### Apple Sign-In
1. Na mesma página, clique em "Apple"
2. Habilite e adicione:
   - Client ID (do Apple Developer)
   - Client Secret (do Apple Developer)
   - Redirect URL: `https://[PROJECT_ID].supabase.co/auth/v1/callback`

#### Habilitar Phone Auth (SMS OTP)
1. Acesse: https://supabase.com/dashboard/project/[PROJECT_ID]/settings/auth
2. Role até "Phone Auth"
3. Habilite "Enable Phone Auth"
4. **Nota:** Twilio já está integrado no Supabase Pro (50k MAUs inclusos)

#### Executar Migrations
1. Acesse: https://supabase.com/dashboard/project/[PROJECT_ID]/sql/new
2. Execute os arquivos SQL:
   - `supabase/migrations/20250118000000_create_calendar_links.sql`
   - `supabase/migrations/20250118000001_calendar_automation.sql`

---

### 3️⃣ Testar Funcionalidades (10 minutos)

```bash
# Verificar deployment
npm run check:deployment

# Testar calendários
npm run test:calendar

# Setup completo
npm run setup:complete
```

#### Testes Manuais
1. **Login com Google:**
   - https://moocafisio.com.br/login
   - Clique em "Continuar com Google"
   - Autorize e verifique redirecionamento

2. **Login com Apple:**
   - Clique em "Apple"
   - Faça login com Apple ID
   - Verifique redirecionamento

3. **OTP via Email:**
   - Tab "Login sem senha"
   - Digite email
   - Verifique código no email
   - Digite código e faça login

4. **Geração de .ics:**
   - Crie um agendamento
   - Acesse: `https://moocafisio.com.br/api/calendar/[APPOINTMENT_ID].ics`
   - Verifique download do arquivo

---

## 📋 Checklist Rápido

- [ ] Gerar CRON_SECRET
- [ ] Adicionar CRON_SECRET no Vercel
- [ ] Configurar Google OAuth no Supabase
- [ ] Configurar Apple Sign-In no Supabase
- [ ] Habilitar Phone Auth no Supabase
- [ ] Executar migrations no Supabase
- [ ] Testar login com Google
- [ ] Testar login com Apple
- [ ] Testar OTP via Email
- [ ] Testar OTP via SMS
- [ ] Testar geração de .ics
- [ ] Testar adição ao Google Calendar
- [ ] Testar adição ao Apple Calendar

---

## 🛠️ Comandos Úteis

### Setup e Configuração
```bash
# Setup completo (recomendado)
npm run setup:complete

# Setup individual
npm run setup:auth              # Assistente de configuração
npm run check:deployment        # Verificar deployment
npm run test:calendar           # Testar calendários
npm run generate:cron-secret    # Gerar CRON_SECRET
```

### Desenvolvimento
```bash
npm run dev                     # Servidor de desenvolvimento
npm run build                   # Build de produção
npm run start                   # Preview do build
```

---

## 📚 Documentação Completa

1. **INICIO_RAPIDO.md** - Este arquivo (você está aqui!)
2. **CHECKLIST_CONFIGURACAO.md** - Checklist detalhado
3. **PROXIMOS_PASSOS.md** - Instruções passo a passo
4. **RESUMO_FINAL_COMPLETO.md** - Resumo completo
5. **RESUMO_EXECUTIVO.md** - Resumo executivo
6. **RESUMO_IMPLEMENTACAO_FINAL.md** - Resumo da implementação
7. **IMPLEMENTACAO_AUTENTICACAO_CALENDARIO.md** - Guia completo
8. **scripts/README.md** - Documentação dos scripts

---

## 🆘 Precisa de Ajuda?

### Erro: "Cannot find module"
```bash
npm install
```

### Erro: "ENOTFOUND"
Verifique sua conexão com a internet

### Erro: "ECONNREFUSED"
O site pode estar offline ou em manutenção

### Erro no Login
Verifique se os providers OAuth estão configurados no Supabase

### Erro no OTP
Verifique se Phone Auth está habilitado no Supabase

---

## 🎉 Pronto!

Após seguir os passos acima, seu sistema estará 100% funcional!

**Tempo estimado:** 30 minutos  
**Dificuldade:** Fácil  
**Resultado:** Sistema completo de autenticação e calendários

---

## 📞 Links Úteis

- [Supabase Dashboard](https://supabase.com/dashboard)
- [Vercel Dashboard](https://vercel.com/dashboard)
- [Google Cloud Console](https://console.cloud.google.com)
- [Apple Developer](https://developer.apple.com)
- [Supabase Phone Auth](https://supabase.com/docs/guides/auth/phone-login)

---

**Desenvolvido com ❤️ para DuduFisio-AI**  
**Data:** 18 de Janeiro de 2025  
**Versão:** 1.0.0  
**Status:** ✅ Pronto para Configuração

