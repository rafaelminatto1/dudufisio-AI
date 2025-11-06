# ✅ Checklist de Variáveis de Ambiente

## Variáveis que DEVEM estar configuradas no Vercel:

### 🔐 Supabase (Obrigatórias)
```bash
✅ VITE_SUPABASE_URL=https://urfxniitfbbvsaskicfo.supabase.co
✅ VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 💳 Stripe (Obrigatórias para Pagamentos)
```bash
✅ VITE_STRIPE_PUBLIC_KEY=pk_live_51S6YyPCZCQgYxWnWesgbPUrf7LKXMwpF2zGAhEBu0FKT9rVvpM5YyqaExMlsOoikfd2Qwh8JmxwAiFa8F1c1YOM500jb38TAeZ

# No Supabase (via supabase secrets):
✅ STRIPE_SECRET_KEY=sk_live_51S6YyPCZCQgYxWnWe... (já configurado)
✅ STRIPE_WEBHOOK_SECRET=whsec_fUpE5rWa69haoIEkuLvIsE5dhr0mD12k (já configurado)
```

### 🔔 Notificações (Obrigatórias para CRON Jobs)
```bash
⚠️ CRON_SECRET=d4e479e543723152271f51109d43dfac28035b7151158957473552c60ae606bf
```

### 🤖 Google Gemini AI (Opcional - para features de IA)
```bash
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

### 📧 Email/SMS (Opcional - para envio de notificações)
```bash
# Twilio (SMS)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=+1234567890

# SMTP (Email)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=true
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password
EMAIL_FROM=noreply@dudufisio.com
EMAIL_FROM_NAME=DuduFisio AI
```

### 🌐 Configurações Gerais (Opcionais)
```bash
COMMUNICATION_DEFAULT_TIMEZONE=America/Sao_Paulo
COMMUNICATION_DEFAULT_LANGUAGE=pt-BR
COMMUNICATION_RETRY_ATTEMPTS=3
COMMUNICATION_RETRY_DELAY=1000
```

---

## 🎯 Prioridade de Configuração:

### 🔴 CRÍTICO (Sistema não funciona sem):
1. ✅ `VITE_SUPABASE_URL`
2. ✅ `VITE_SUPABASE_ANON_KEY`

### 🟡 IMPORTANTE (Features específicas não funcionam):
3. ⚠️ `VITE_STRIPE_PUBLIC_KEY` - Pagamentos
4. ⚠️ `CRON_SECRET` - Notificações agendadas
5. ⚠️ `VITE_GEMINI_API_KEY` - IA avançada

### 🟢 OPCIONAL (Melhorias):
6. `TWILIO_*` - SMS
7. `SMTP_*` - Email
8. Outras configs

---

## 📋 Como Verificar no Vercel:

### Via Dashboard:
1. Acesse: https://vercel.com/dudufisio-ai/settings/environment-variables
2. Verifique se todas as variáveis críticas estão presentes
3. Confirme que estão marcadas para todos os ambientes (Production, Preview, Development)

### Via CLI (se tiver instalado):
```bash
vercel env ls
```

---

## 🔍 Teste das Variáveis:

### Supabase Connection:
```javascript
// No browser console da aplicação:
console.log(import.meta.env.VITE_SUPABASE_URL);
console.log(import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Configurado' : 'Faltando');
```

### Stripe:
```javascript
console.log(import.meta.env.VITE_STRIPE_PUBLIC_KEY ? 'Configurado' : 'Faltando');
```

### CRON Secret:
```bash
# Testar endpoint de notificações:
curl -X POST https://seu-app.vercel.app/api/cron/send-reminders \
  -H "Authorization: Bearer d4e479e543723152271f51109d43dfac28035b7151158957473552c60ae606bf"
```

---

## ✅ Status Atual (Baseado nas informações fornecidas):

- ✅ Supabase URL/Key - **CONFIGURADO**
- ✅ Stripe Keys - **CONFIGURADO** (você mencionou que já modificou no dashboard)
- ⚠️ CRON_SECRET - **VERIFICAR** se está no Vercel (sabemos que precisa estar)
- ⚠️ Gemini API - **OPCIONAL** (já existe no .env.local)

---

## 🚀 Próxima Ação:

Verificar no Vercel Dashboard se:
1. `CRON_SECRET` está configurado
2. `VITE_STRIPE_PUBLIC_KEY` está configurado
3. Todas as variáveis estão marcadas para **Production**

Se alguma estiver faltando, adicionar via Dashboard:
- Settings → Environment Variables → Add New

---

## 📞 Comandos Úteis:

```bash
# Ver variáveis locais
cat .env.local

# Ver secrets do Supabase
supabase secrets list

# Build local (testa se variáveis essenciais existem)
npm run build

# Deploy manual (se auto-deploy não funcionou)
vercel --prod
```

---

🤖 Generated with [Claude Code](https://claude.com/claude-code)
