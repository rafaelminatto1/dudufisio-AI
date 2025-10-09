# 🌐 Solução Webhook Online - WhatsApp Business API

## 🚀 **Solução Imediata - Usar Serviço Online**

### **Opção 1: webhook.site (Mais Simples)**

1. **Acesse:** https://webhook.site
2. **Copie a URL única** (ex: `https://webhook.site/abc123-def456-ghi789`)
3. **Configure no Meta Developer:**
   - URL: `https://webhook.site/abc123-def456-ghi789`
   - Token: `mu/NQ2Z92+[g`

### **Opção 2: ngrok.com (Temporário)**

1. **Acesse:** https://ngrok.com
2. **Crie conta gratuita**
3. **Baixe o ngrok**
4. **Execute:**
   ```bash
   ngrok http 5175
   ```

### **Opção 3: localtunnel (Alternativa)**

```bash
npm install -g localtunnel
lt --port 5175 --subdomain dudufisio-webhook
```

## 📋 **Configuração no Meta Developer:**

### **Passo 1: Acessar Meta Developer**
- URL: https://developers.facebook.com/apps/2479744142426362/use_cases/customize/wa-settings/

### **Passo 2: Configurar Webhook**
- **URL de callback:** `[URL_DO_SERVICO_ESCOLHIDO]`
- **Verificar token:** `mu/NQ2Z92+[g`
- **Campos do webhook:** Marque `messages`

### **Passo 3: Testar**
- Clique em "Verificar e salvar"
- Deve aparecer ✅ "Webhook verificado com sucesso"

## 🔧 **Comandos para Executar:**

### **Para ngrok:**
```bash
# Terminal 1 - Aplicação
npm run dev

# Terminal 2 - ngrok
ngrok http 5175
```

### **Para localtunnel:**
```bash
# Terminal 1 - Aplicação
npm run dev

# Terminal 2 - localtunnel
lt --port 5175 --subdomain dudufisio-webhook
```

## 📱 **URLs para Testar:**

### **webhook.site:**
- URL: `https://webhook.site/[SEU_ID]`
- Teste: `curl "https://webhook.site/[SEU_ID]?hub.mode=subscribe&hub.challenge=TESTE123&hub.verify_token=mu/NQ2Z92+[g"`

### **ngrok:**
- URL: `https://[RANDOM].ngrok.io/api/whatsapp`
- Teste: `curl "https://[RANDOM].ngrok.io/api/whatsapp?hub.mode=subscribe&hub.challenge=TESTE123&hub.verify_token=mu/NQ2Z92+[g"`

### **localtunnel:**
- URL: `https://dudufisio-webhook.loca.lt/api/whatsapp`
- Teste: `curl "https://dudufisio-webhook.loca.lt/api/whatsapp?hub.mode=subscribe&hub.challenge=TESTE123&hub.verify_token=mu/NQ2Z92+[g"`

## 🎯 **Recomendação:**

**Use o webhook.site primeiro para testar rapidamente, depois configure uma solução permanente.**

## 📞 **Próximos Passos:**

1. **Agora:** Configure no webhook.site
2. **Teste:** Configure no Meta Developer
3. **Depois:** Migre para solução permanente
