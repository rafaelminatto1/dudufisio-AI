# 📱 Como Configurar Webhook do WhatsApp Business API

## 🎯 Objetivo

Configurar o webhook para receber confirmações de agendamentos via WhatsApp (respostas SIM/NÃO dos pacientes).

## 📋 Passo a Passo

### 1. Acesse o Facebook Developers

👉 https://developers.facebook.com/

### 2. Selecione seu App do WhatsApp Business

1. No menu superior, clique em **"Meus Apps"**
2. Selecione seu app do WhatsApp Business
3. Se não tiver um app, crie um novo:
   - Clique em **"Criar App"**
   - Escolha **"Negócios"** → **"WhatsApp"**

### 3. Configure o Webhook

1. No menu lateral esquerdo, vá em **"WhatsApp"** → **"Configuração"**
2. Role até a seção **"Webhooks"**
3. Clique em **"Configurar webhooks"** ou **"Editar"**

### 4. Preencha os Dados do Webhook

**URL do Callback:**
```
https://seu-dominio.com/api/webhooks/whatsapp
```

**⚠️ IMPORTANTE**: 
- Para desenvolvimento local, use um túnel (ngrok, localtunnel, etc.)
- Para produção, use seu domínio real

**Token de Verificação:**
```
CvdPuLDBi3tbVchqQOpGHfz7IsFl14eo
```

Este é o token que você configurou no `.env.local` como `WHATSAPP_WEBHOOK_VERIFY_TOKEN`.

### 5. Assinar Eventos

Marque os seguintes eventos:

- ✅ **messages** - Receber mensagens dos usuários
- ✅ **message_status** - Status de entrega das mensagens

### 6. Verificar Webhook

1. Clique em **"Verificar e salvar"**
2. O Facebook vai fazer uma requisição GET para sua URL
3. Se tudo estiver correto, verá uma mensagem de sucesso

### 7. Testar o Webhook

**Opção 1: Teste Manual**

1. No Facebook Developers, vá em **"WhatsApp"** → **"Configuração"**
2. Role até **"Webhooks"**
3. Clique em **"Testar"** ao lado do webhook
4. Verifique se recebe a requisição no seu servidor

**Opção 2: Teste Real**

1. Envie uma mensagem de teste para um número
2. O paciente responde "SIM" ou "NÃO"
3. Verifique se o webhook recebe e processa a resposta

## 🔧 Para Desenvolvimento Local

### Usando ngrok:

1. Instale ngrok: https://ngrok.com/
2. Inicie seu servidor: `npm run dev`
3. Em outro terminal, execute:
   ```bash
   ngrok http 3000
   ```
4. Copie a URL HTTPS (ex: `https://abc123.ngrok.io`)
5. Use esta URL no webhook: `https://abc123.ngrok.io/api/webhooks/whatsapp`

### Usando localtunnel:

```bash
npx localtunnel --port 3000
```

## 📝 Verificação do Código

O webhook está implementado em:
- `src/app/api/webhooks/whatsapp/route.ts`

**Funcionalidades:**
- ✅ GET: Verificação do webhook (requerido pelo Facebook)
- ✅ POST: Recebe mensagens e processa confirmações SIM/NÃO
- ✅ Atualiza status de agendamentos automaticamente
- ✅ Registra interações na tabela `whatsapp_interactions`

## 🧪 Testar Localmente

### 1. Inicie o servidor:
```bash
npm run dev
```

### 2. Configure ngrok:
```bash
ngrok http 3000
```

### 3. Use a URL do ngrok no webhook do Facebook

### 4. Teste enviando uma mensagem:
- Envie mensagem de teste via WhatsApp Business API
- O paciente responde "SIM" ou "NÃO"
- Verifique logs do servidor para ver se o webhook foi chamado

## ✅ Checklist

- [ ] App do WhatsApp Business criado/configurado
- [ ] Webhook URL configurada (produção ou ngrok)
- [ ] Token de verificação configurado: `CvdPuLDBi3tbVchqQOpGHfz7IsFl14eo`
- [ ] Eventos assinados: `messages`, `message_status`
- [ ] Webhook verificado com sucesso
- [ ] Teste manual realizado
- [ ] Teste real realizado

## 🐛 Problemas Comuns

### "Webhook verification failed"
- ✅ Verifique se o token está correto no `.env.local`
- ✅ Verifique se a URL está acessível
- ✅ Verifique se o endpoint GET está retornando o challenge

### "Webhook not receiving messages"
- ✅ Verifique se os eventos estão assinados
- ✅ Verifique se o número está verificado no WhatsApp Business
- ✅ Verifique logs do servidor

### "CORS error"
- ✅ Verifique se o Next.js está configurado corretamente
- ✅ Verifique se a URL do webhook está correta

## 📚 Documentação

- [WhatsApp Business API - Webhooks](https://developers.facebook.com/docs/whatsapp/cloud-api/webhooks)
- [Facebook Developers](https://developers.facebook.com/)

---

**💡 Dica**: Mantenha o ngrok rodando enquanto desenvolve localmente!

