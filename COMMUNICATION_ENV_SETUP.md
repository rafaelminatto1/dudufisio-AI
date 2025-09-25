# 🔧 CONFIGURAÇÃO DE VARIÁVEIS DE AMBIENTE - Sistema de Comunicação

## 📋 **PASSO A PASSO PARA CRIAR .env.local**

### **Passo 1: Criar o arquivo**
```bash
cp .env.example .env.local
# ou
touch .env.local
```

### **Passo 2: Copiar o conteúdo abaixo para .env.local**

```env
# ===========================================
# DUDUFISIO-AI - SISTEMA DE COMUNICAÇÃO OMNICHANNEL
# ===========================================

# ===== WHATSAPP WEB CLIENT (Gratuito) =====
WHATSAPP_USE_WEB_CLIENT=true
WHATSAPP_SESSION_PATH=./wa-session
WHATSAPP_ENABLED=true
WHATSAPP_MAX_RETRIES=3
WHATSAPP_TIMEOUT=30000
WHATSAPP_RATE_LIMIT=100

# ===== TWILIO SMS (Pago por uso) =====
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_PHONE_NUMBER=+5511999999999
TWILIO_MESSAGING_SERVICE_SID=
TWILIO_STATUS_CALLBACK_URL=https://seu-dominio.vercel.app/webhooks/twilio/sms/status
SMS_ENABLED=true
SMS_MAX_RETRIES=3
SMS_TIMEOUT=30000
SMS_RATE_LIMIT=100
SMS_MAX_LENGTH=1600
SMS_ENABLE_DELIVERY_RECEIPTS=true
SMS_ENABLE_LONG_MESSAGES=true

# ===== RESEND EMAIL (Gratuito até 100k/mês) =====
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
EMAIL_FROM=noreply@seudominio.com
EMAIL_FROM_NAME=DuduFisio
EMAIL_ENABLED=true
EMAIL_MAX_RETRIES=3
EMAIL_TIMEOUT=30000
EMAIL_RATE_LIMIT=100

# ===== CONFIGURAÇÕES GERAIS DO SISTEMA =====
COMMUNICATION_RETRY_ATTEMPTS=3
COMMUNICATION_RATE_LIMIT_GLOBAL=10000
COMMUNICATION_ENABLE_ANALYTICS=true
COMMUNICATION_DEFAULT_TIMEOUT=30000
COMMUNICATION_DEFAULT_RETRIES=3

# ===== REDIS (Para Message Bus) =====
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=
REDIS_DB=0

# ===== SUPABASE (Sistema principal) =====
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# ===== PUSH NOTIFICATIONS (Opcional) =====
VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=
VAPID_SUBJECT=mailto:admin@seudominio.com
FCM_SERVER_KEY=

# ===== CONFIGURAÇÕES DE AMBIENTE =====
NODE_ENV=development
VITE_APP_ENV=development
VITE_APP_URL=http://localhost:5173

# ===== LOGS E DEBUG =====
COMMUNICATION_DEBUG=true
COMMUNICATION_LOG_LEVEL=info
COMMUNICATION_ENABLE_METRICS=true
```

## 🎯 **VARIÁVEIS QUE VOCÊ PRECISA SUBSTITUIR**

### **🔵 WhatsApp Web Client (Já configurado - Gratuito)**
```env
WHATSAPP_USE_WEB_CLIENT=true  # ✅ Já correto
```

### **🟡 Twilio SMS (Você precisa configurar)**
```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx  # ⚠️ Substituir
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx     # ⚠️ Substituir
TWILIO_PHONE_NUMBER=+5511999999999                     # ⚠️ Substituir
```

### **🟢 Resend Email (Você precisa configurar)**
```env
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx     # ⚠️ Substituir
EMAIL_FROM=noreply@seudominio.com                      # ⚠️ Substituir pelo seu domínio
```

### **🔴 Supabase (Já deve ter)**
```env
VITE_SUPABASE_URL=https://your-project.supabase.co     # ⚠️ Substituir
VITE_SUPABASE_ANON_KEY=your-anon-key                   # ⚠️ Substituir
```

## 📝 **INSTRUÇÕES DETALHADAS**

### **1. WhatsApp Web Client**
- ✅ **Já configurado** - Não precisa fazer nada
- Na primeira execução, aparecerá um QR Code no console
- Escaneie com seu WhatsApp pessoal

### **2. Twilio SMS**
1. Acesse: https://console.twilio.com/
2. Crie conta ou faça login
3. No Dashboard, copie:
   - `Account SID` → `TWILIO_ACCOUNT_SID`
   - `Auth Token` → `TWILIO_AUTH_TOKEN`
4. Compre um número SMS brasileiro
5. Substitua `TWILIO_PHONE_NUMBER` pelo número comprado

### **3. Resend Email**
1. Acesse: https://resend.com/
2. Crie conta e conecte com Vercel
3. Configure seu domínio DNS
4. Copie `API Key` → `RESEND_API_KEY`
5. Substitua `EMAIL_FROM` pelo seu domínio

### **4. Supabase**
1. Use suas credenciais existentes
2. Substitua as variáveis `VITE_SUPABASE_*`

## ✅ **VERIFICAÇÃO**

Após configurar, teste com:
```bash
npm run dev
```

Procure no console por:
- ✅ "WhatsApp Web Client initialized"
- ✅ "Twilio SMS Channel ready"
- ✅ "Resend Email Channel ready"

## 🚨 **IMPORTANTE**

- **NUNCA** commite o arquivo `.env.local` no Git
- Use `.env.example` como template
- Mantenha as credenciais seguras
- Teste cada canal individualmente

---

**Próximo passo**: Configure as credenciais e me avise quando estiver pronto para eu implementar as mudanças no código! 🚀
