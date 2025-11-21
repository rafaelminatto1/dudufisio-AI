# 📱 Guia Completo: Configurar Webhook do WhatsApp

## 🎯 Informações Importantes

**Token de Verificação**: `CvdPuLDBi3tbVchqQOpGHfz7IsFl14eo`

Este token já está configurado no código e deve ser usado no Facebook Developers.

## 📋 Passo a Passo Detalhado

### Passo 1: Acessar Facebook Developers

1. Acesse: https://developers.facebook.com/
2. Faça login com sua conta do Facebook
3. Se não tiver conta de desenvolvedor, crie uma

### Passo 2: Selecionar/Criar App

**Se já tem um app:**
- Clique em **"Meus Apps"** (canto superior direito)
- Selecione seu app do WhatsApp Business

**Se não tem app:**
1. Clique em **"Meus Apps"** → **"Criar App"**
2. Escolha tipo: **"Negócios"**
3. Selecione: **"WhatsApp"**
4. Preencha nome do app e email de contato
5. Clique em **"Criar App"**

### Passo 3: Configurar Webhook

1. No menu lateral esquerdo, clique em **"WhatsApp"**
2. Clique em **"Configuração"**
3. Role até a seção **"Webhooks"**
4. Clique em **"Configurar webhooks"** ou **"Editar"**

### Passo 4: Preencher Dados

**URL do Callback:**
```
https://seu-dominio.com/api/webhooks/whatsapp
```

**Para desenvolvimento local:**
```
https://seu-ngrok-url.ngrok.io/api/webhooks/whatsapp
```

**Token de Verificação:**
```
CvdPuLDBi3tbVchqQOpGHfz7IsFl14eo
```

### Passo 5: Assinar Eventos

Marque os eventos:
- ✅ **messages** - Para receber mensagens dos usuários
- ✅ **message_status** - Para receber status de entrega

### Passo 6: Verificar

1. Clique em **"Verificar e salvar"**
2. O Facebook fará uma requisição GET para sua URL
3. Se tudo estiver correto, verá: ✅ **"Webhook verificado"**

### Passo 7: Testar

1. Envie uma mensagem de teste para um número
2. O paciente responde "SIM" ou "NÃO"
3. Verifique logs do servidor
4. Verifique se o agendamento foi atualizado

## 🔧 Para Desenvolvimento Local

### Opção 1: ngrok (Recomendado)

1. **Instalar ngrok:**
   - Download: https://ngrok.com/download
   - Ou via npm: `npm install -g ngrok`

2. **Iniciar servidor:**
   ```bash
   npm run dev
   ```

3. **Em outro terminal, iniciar ngrok:**
   ```bash
   ngrok http 3000
   ```

4. **Copiar URL HTTPS:**
   ```
   https://abc123.ngrok.io
   ```

5. **Usar no webhook:**
   ```
   https://abc123.ngrok.io/api/webhooks/whatsapp
   ```

### Opção 2: localtunnel

```bash
npx localtunnel --port 3000
```

Use a URL fornecida no webhook.

## 📝 Verificação do Endpoint

O endpoint está implementado em:
- `src/app/api/webhooks/whatsapp/route.ts`

**Funcionalidades:**
- ✅ GET: Verifica webhook (retorna challenge)
- ✅ POST: Processa mensagens e confirmações

**Fluxo:**
1. Paciente recebe lembrete: "Confirme sua presença respondendo SIM ou NÃO"
2. Paciente responde "SIM" ou "NÃO"
3. Webhook recebe a mensagem
4. Sistema identifica o paciente pelo número
5. Sistema atualiza status do agendamento
6. Sistema registra a interação na tabela `whatsapp_interactions`

## ✅ Checklist de Configuração

- [ ] App do WhatsApp Business criado
- [ ] Webhook URL configurada
- [ ] Token de verificação: `CvdPuLDBi3tbVchqQOpGHfz7IsFl14eo`
- [ ] Eventos assinados: `messages`, `message_status`
- [ ] Webhook verificado com sucesso
- [ ] Teste de envio realizado
- [ ] Teste de resposta realizado

## 🧪 Testar o Webhook

### Teste 1: Verificação

1. Configure o webhook no Facebook
2. Clique em "Verificar e salvar"
3. Deve aparecer: ✅ "Webhook verificado"

### Teste 2: Envio de Mensagem

1. Use a API do WhatsApp para enviar mensagem de teste
2. Verifique se a mensagem foi enviada
3. Verifique logs do servidor

### Teste 3: Resposta do Paciente

1. Envie mensagem para um número de teste
2. Responda "SIM" ou "NÃO"
3. Verifique se o webhook recebeu
4. Verifique se o agendamento foi atualizado

## 🐛 Troubleshooting

### "Webhook verification failed"

**Causas possíveis:**
- Token incorreto
- URL inacessível
- Endpoint GET não implementado corretamente

**Solução:**
1. Verifique token no `.env.local`
2. Verifique se a URL está acessível
3. Verifique logs do servidor
4. Teste o endpoint GET manualmente

### "Webhook not receiving messages"

**Causas possíveis:**
- Eventos não assinados
- Número não verificado
- Webhook não ativo

**Solução:**
1. Verifique eventos assinados
2. Verifique número verificado no WhatsApp Business
3. Verifique status do webhook (deve estar "Ativo")

### "CORS error"

**Solução:**
- Verifique configuração do Next.js
- Verifique headers da resposta

## 📚 Recursos

- [Documentação WhatsApp Business API](https://developers.facebook.com/docs/whatsapp)
- [Guia de Webhooks](https://developers.facebook.com/docs/whatsapp/cloud-api/webhooks)
- [ngrok Documentation](https://ngrok.com/docs)

---

**💡 Dica**: Mantenha o ngrok rodando enquanto desenvolve para testar o webhook em tempo real!

