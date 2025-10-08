# 📱 CONFIGURAÇÃO WHATSAPP BUSINESS API - META

## ✅ PASSO 1: Criar o arquivo .env.local

Crie manualmente o arquivo `.env.local` na raiz do projeto e copie o conteúdo abaixo:

```env
# ===========================================
# DUDUFISIO-AI - WHATSAPP BUSINESS API META
# ===========================================

# ===== WHATSAPP BUSINESS API (Meta/Facebook) =====
WHATSAPP_USE_WEB_CLIENT=false
WHATSAPP_ENABLED=true

# ✅ Token de acesso da Meta (já fornecido)
WHATSAPP_BUSINESS_API_TOKEN=EAAjPUGyZBQPoBPifgnBbgl54ZBZCnV5wI8lMXSNkWn3ZAqEMz4GOjMg7ZCDZCMSZA8nh2S3DQdWBQDJ7A5SAqml8psmaOUZCUviZCpZARTCeMiL5QtRVJ1U5c9rI6TY7bq9gthnwpzecBCBR62FdovuHDdkZBMZA9Jh31LBUYVqTMIcabywcHfuiTwkWUB474l5LuRfAVA9jPZAtASZCXAyhZA1sGKFa90DlYadU1aTqbTiaJIq7ST5dmQdQbjLm7rPemCQ4MIZD

# ⚠️ VOCÊ PRECISA OBTER ESTE ID NO PAINEL DA META
# Vá em: https://developers.facebook.com/apps/
# Selecione seu app > WhatsApp > API Setup
# Copie o "Phone Number ID" (não é o número do telefone, é um ID longo)
WHATSAPP_PHONE_NUMBER_ID=SEU_PHONE_NUMBER_ID_AQUI

# ✅ Token de verificação do webhook (você define este)
WHATSAPP_WEBHOOK_VERIFY_TOKEN=dudufisio_webhook_verify_2024

# Configurações adicionais
WHATSAPP_MAX_RETRIES=3
WHATSAPP_TIMEOUT=30000
WHATSAPP_RATE_LIMIT=100

# Número do WhatsApp (formato internacional)
WHATSAPP_NUMBER=+5511958749885

# ===== SUPABASE (necessário) =====
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# ===== RESEND EMAIL (opcional) =====
RESEND_API_KEY=
EMAIL_FROM=noreply@seudominio.com
EMAIL_FROM_NAME=DuduFisio
EMAIL_ENABLED=false

# ===== OUTRAS CONFIGURAÇÕES =====
SMS_ENABLED=false
NODE_ENV=development
VITE_APP_ENV=development
VITE_APP_URL=http://localhost:5173
DEFAULT_CLINIC_ID=
COMMUNICATION_DEBUG=true
```

---

## 🔑 PASSO 2: Obter o Phone Number ID

### **Acesse o painel da Meta:**

1. Vá para: https://developers.facebook.com/apps/
2. Faça login com sua conta
3. Selecione seu aplicativo WhatsApp
4. No menu lateral, clique em **"WhatsApp"** > **"API Setup"**
5. Você verá:
   - ✅ **Access Token**: Você já tem!
   - ⚠️ **Phone Number ID**: Copie este número (é um ID longo, tipo: `123456789012345`)
   - **Test Phone Number**: O número que você vai usar (`+5511958749885`)

6. Cole o **Phone Number ID** no arquivo `.env.local`:
   ```env
   WHATSAPP_PHONE_NUMBER_ID=123456789012345
   ```

---

## 🔗 PASSO 3: Configurar Webhook no Meta

### **3.1 - Deploy seu app primeiro (ou use ngrok para testar localmente)**

#### **Opção A: Deploy no Vercel (Produção)**
```bash
# Faça push para o GitHub
git add .
git commit -m "feat: configurar WhatsApp Business API"
git push

# Deploy no Vercel (automático se conectado)
# URL exemplo: https://dudufisio-ai.vercel.app
```

#### **Opção B: Teste local com ngrok**
```bash
# Instalar ngrok (se não tiver)
npm install -g ngrok

# Iniciar o app
npm run dev

# Em outro terminal, expor localmente
ngrok http 5173

# Copie a URL: https://xxxx-xxx-xxx-xxx.ngrok.io
```

### **3.2 - Configurar Webhook no Meta**

1. No painel da Meta: **WhatsApp** > **Configuration**
2. Na seção **Webhook**, clique em **Edit**
3. Configure:
   - **Callback URL**: 
     - Produção: `https://seu-dominio.vercel.app/api/webhooks/whatsapp`
     - Local: `https://xxxx-xxx.ngrok.io/api/webhooks/whatsapp`
   - **Verify Token**: `dudufisio_webhook_verify_2024`
     (mesmo valor do `.env.local`)

4. Clique **"Verify and Save"**
5. Na seção **Webhook Fields**, marque:
   - ✅ `messages`
   - ✅ `message_status`
   - ✅ `messaging_postbacks`

---

## 🧪 PASSO 4: Testar a Configuração

### **4.1 - Verificar se o app está rodando**
```bash
npm run dev
```

### **4.2 - Verificar logs**
Abra o console do navegador e procure por:
- ✅ `"WhatsApp Business API configured"`
- ✅ `"Using Phone Number ID: 123..."`

### **4.3 - Enviar mensagem de teste**
1. Acesse a página de WhatsApp no app
2. Tente enviar uma mensagem
3. Verifique os logs no console

### **4.4 - Testar webhook**
No painel da Meta:
1. Vá em **WhatsApp** > **API Setup**
2. Use a ferramenta **"Send Test Message"**
3. Digite seu número de telefone
4. Clique em **Send Message**
5. Você deve receber uma mensagem no WhatsApp!

---

## 📊 PASSO 5: Monitorar e Verificar

### **Verificar no painel da Meta:**
- **Analytics**: Quantas mensagens foram enviadas
- **Message Templates**: Templates aprovados pela Meta
- **Phone Numbers**: Status do número

### **Verificar nos logs do app:**
```bash
# Logs do webhook
tail -f logs/whatsapp-webhook.log

# Ou no console do navegador (F12)
```

---

## ⚠️ IMPORTANTE: Limitações do Token Temporário

O token que você forneceu é **TEMPORÁRIO** e expira em **24 horas**.

### **Para gerar um token permanente:**

1. No painel da Meta: **WhatsApp** > **API Setup**
2. Clique em **"Generate New Token"**
3. Selecione:
   - **Token Expiration**: `Never Expire`
   - **Permissions**: Todas as permissões de WhatsApp
4. Copie o novo token
5. Atualize no `.env.local`:
   ```env
   WHATSAPP_BUSINESS_API_TOKEN=SEU_TOKEN_PERMANENTE_AQUI
   ```

---

## 🎯 RESUMO DAS AÇÕES

- [x] Token de acesso da Meta fornecido
- [ ] Criar arquivo `.env.local` com configurações
- [ ] Obter **Phone Number ID** no painel da Meta
- [ ] Configurar **Webhook** no painel da Meta
- [ ] Testar envio de mensagem
- [ ] Gerar **token permanente** (depois de testar)

---

## 🆘 PROBLEMAS COMUNS

### **1. "Phone Number ID not configured"**
**Solução**: Verifique se você copiou o ID correto do painel da Meta

### **2. "Webhook verification failed"**
**Solução**: Verifique se o `WHATSAPP_WEBHOOK_VERIFY_TOKEN` está igual no `.env.local` e no painel da Meta

### **3. "Token expired"**
**Solução**: Gere um token permanente no painel da Meta

### **4. "Message not sent"**
**Solução**: 
- Verifique se o número está no formato internacional (+5511...)
- Verifique se o número está verificado no painel da Meta
- Veja os logs de erro no console

---

## 📞 PRÓXIMOS PASSOS

1. Crie o arquivo `.env.local` com o conteúdo acima
2. Obtenha o **Phone Number ID** no painel da Meta
3. Inicie o app: `npm run dev`
4. Me avise quando estiver pronto para testar! 🚀

---

## 🔗 LINKS ÚTEIS

- **Painel Meta Developers**: https://developers.facebook.com/apps/
- **Documentação WhatsApp Business API**: https://developers.facebook.com/docs/whatsapp/
- **Suporte Meta**: https://developers.facebook.com/support/
- **Status da API**: https://status.fb.com/

---

**Dúvidas? Me chame que eu ajudo! 😊**


