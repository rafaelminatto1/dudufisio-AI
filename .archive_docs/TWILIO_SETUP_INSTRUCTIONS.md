# 🔧 CONFIGURAÇÃO TWILIO - INSTRUÇÕES DETALHADAS

## 📋 **PASSO A PASSO COMPLETO**

### **PASSO 1: CRIAR CONTA NO TWILIO**

1. **Acesse**: https://console.twilio.com/
2. **Clique**: "Sign up for free"
3. **Preencha**:
   - Email: seu email
   - Senha: senha segura
   - Nome: Rafael Minatto
   - Telefone: seu número (para verificação)
4. **Verifique** seu telefone via SMS
5. **Complete** o perfil da empresa

### **PASSO 2: CONFIGURAR WHATSAPP SANDBOX**

1. **No Dashboard do Twilio**:
   - Vá para **"Messaging"** → **"Try it out"** → **"Send a WhatsApp message"**
   - Clique **"Set up WhatsApp sandbox"**

2. **Anote as informações**:
   - **Sandbox Number**: Ex: `+1 415 523 8886`
   - **Join Code**: Ex: `join <código>`

3. **Teste o Sandbox**:
   - Envie o código para o número via WhatsApp
   - Deve receber confirmação

### **PASSO 3: OBTER CREDENCIAIS**

No Dashboard do Twilio, copie:

1. **Account SID**: `ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
2. **Auth Token**: `xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
3. **WhatsApp Sandbox Number**: `+14155238886`

### **PASSO 4: ATUALIZAR .env.local**

Adicione estas linhas ao seu `.env.local`:

```env
# ===== TWILIO WHATSAPP + SMS =====
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_PHONE_NUMBER=+14155238886
TWILIO_WHATSAPP_SANDBOX_NUMBER=+14155238886
TWILIO_WHATSAPP_SANDBOX_CODE=join <código>

# ===== CONFIGURAÇÕES WHATSAPP =====
WHATSAPP_USE_WEB_CLIENT=false
WHATSAPP_ENABLED=true
WHATSAPP_MAX_RETRIES=3
WHATSAPP_TIMEOUT=30000
WHATSAPP_RATE_LIMIT=100

# ===== CONFIGURAÇÕES SMS =====
SMS_ENABLED=true
SMS_MAX_RETRIES=3
SMS_TIMEOUT=30000
SMS_RATE_LIMIT=100
SMS_MAX_LENGTH=1600
SMS_ENABLE_DELIVERY_RECEIPTS=true
SMS_ENABLE_LONG_MESSAGES=true
```

### **PASSO 5: TESTAR CONFIGURAÇÃO**

1. **Instalar dependências** (se necessário):
```bash
npm install twilio
```

2. **Testar WhatsApp**:
```bash
npm run dev
```

3. **Verificar logs** no console para erros

### **PASSO 6: CONFIGURAR WEBHOOK (Opcional)**

Para receber status de entrega:

1. **No Twilio Console**:
   - Vá para **"Messaging"** → **"Settings"** → **"Webhooks"**
   - **Status Callback URL**: `https://moocafisio.com.br/webhooks/twilio/sms/status`

2. **Adicionar ao .env.local**:
```env
TWILIO_STATUS_CALLBACK_URL=https://moocafisio.com.br/webhooks/twilio/sms/status
```

## 💰 **CUSTOS DO TWILIO**

### **WhatsApp Sandbox (Gratuito)**
- ✅ **Gratuito** para desenvolvimento
- ✅ **1.000 mensagens/mês** gratuitas
- ⚠️ **Limitado** ao sandbox

### **WhatsApp Produção**
- 💰 **$0.005** por mensagem (R$ 0,025)
- 💰 **$1.00** por número (R$ 5,00/mês)

### **SMS**
- 💰 **$0.0075** por mensagem (R$ 0,037)
- 💰 **$1.00** por número (R$ 5,00/mês)

## 🚀 **PRÓXIMOS PASSOS**

1. **Configure** as credenciais no `.env.local`
2. **Teste** o sandbox
3. **Migre** para produção quando necessário
4. **Configure** webhooks para status

## 🔍 **VERIFICAÇÃO**

Após configurar, teste com:

```bash
# Verificar se as variáveis estão carregadas
npm run dev

# Procurar no console por:
# ✅ "Twilio WhatsApp configured successfully"
# ✅ "SMS channel initialized"
```

## 📞 **SUPORTE**

- **Twilio Docs**: https://www.twilio.com/docs/whatsapp
- **WhatsApp Business**: https://business.whatsapp.com/
- **Suporte Twilio**: https://support.twilio.com/

---

**Próximo passo**: Configure as credenciais e me avise quando estiver pronto para testar! 🚀

