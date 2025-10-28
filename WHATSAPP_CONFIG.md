# 📱 Configuração WhatsApp Business - DuduFisio-AI

## 🔐 Credenciais Configuradas

### Meta/Facebook WhatsApp Business
- **Número de Telefone**: +55 11 5874-9885
- **Phone Number ID**: 779431901927431
- **Business Account ID**: 806225345331804
- **Access Token**: Configurado no `.env.local`

---

## ⚙️ PASSO 1: Adicionar Variáveis de Ambiente no Vercel

**URL**: https://vercel.com/rafael-minattos-projects/dudufisio-ai/settings/environment-variables

Adicione as seguintes variáveis (marque Production, Preview, Development):

```
VITE_WHATSAPP_ENABLED=true
WHATSAPP_API_URL=https://graph.facebook.com/v21.0
WHATSAPP_BUSINESS_ACCOUNT_ID=806225345331804
WHATSAPP_ACCESS_TOKEN=EAAjPUGyZBQPoBP1q1pmzgxHttN4s9lMo1qSjz5Itp113lTuNamYabi2ZBn50r1Rr77FsZAZCbbGvrSstZAZCfyMhNUKVxoNhYDQ58YdfjuUJwslG9SRxO90d7gvzslimdEnCevVy0zsZBEvz4uYJImsPrI1NpOBtkl0JmFFYZBMvewrkZA777kXsh4ZACgwHN7Ns1jsT8yku1qZBT3Y6TJD4CYfCWozQZBRaFk3cIfuH7Dja1WXAasBkCWUPDZBFa7YQ6qwZDZD
WHATSAPP_PHONE_NUMBER_ID=779431901927431
WHATSAPP_PHONE_NUMBER=+5511587498855
WHATSAPP_VERIFY_TOKEN=dudufisio_webhook_verify_token_2025
```

**IMPORTANTE**: Após adicionar, clique em "Save" e faça um novo deploy.

---

## 📋 PASSO 2: Configurar Webhook no Meta

1. Acesse: https://developers.facebook.com/apps
2. Selecione seu App WhatsApp Business
3. Vá em **WhatsApp** > **Configuration**
4. Em **Webhook**, clique em **Edit**
5. Adicione:
   - **Callback URL**: `https://moocafisio.com.br/api/webhooks/whatsapp`
   - **Verify Token**: `dudufisio_webhook_verify_token_2025`
6. Clique em **Verify and Save**
7. Marque os eventos:
   - ✅ `messages`
   - ✅ `message_template_status_update`

---

## 🧪 PASSO 3: Testar Envio

```bash
curl -X POST "https://graph.facebook.com/v21.0/779431901927431/messages" \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "messaging_product": "whatsapp",
    "to": "5511999999999",
    "type": "template",
    "template": {
      "name": "hello_world",
      "language": {"code": "pt_BR"}
    }
  }'
```

---

## 📂 Arquivos Criados

1. **Serviço**: `services/whatsapp/whatsappBusinessService.ts`
2. **API Webhook**: `api/webhooks/whatsapp.ts`
3. **Tipos**: `types/whatsapp.ts`

---

## 🎯 Próximos Passos

1. Adicionar variáveis no Vercel Dashboard
2. Configurar webhook no Meta
3. Criar templates de mensagem
4. Integrar com agenda (lembretes automáticos)

---

**Data**: 27 de Outubro de 2025
**Status**: ✅ Configurado
