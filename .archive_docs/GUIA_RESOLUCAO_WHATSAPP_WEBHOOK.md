# 🚀 Guia de Resolução - WhatsApp Webhook Meta

## ❌ Problema Atual
Você está recebendo o erro: **"Não foi possível validar a URL de callback ou o token de verificação"**

## ✅ Solução Passo a Passo

### 1. **Verificar se o Webhook está Online**
Primeiro, vamos verificar se o endpoint está acessível:

```bash
# Teste manual no terminal
curl "https://moocafisio.com.br/api/webhooks/whatsapp"
```

**Resultado esperado**: Deve retornar erro 405 (Method Not Allowed) ou 403 (Forbidden), mas não erro de conexão.

### 2. **Verificar Configuração no Meta**
No painel do Meta Developer, certifique-se de que:

- ✅ **URL de callback**: `https://moocafisio.com.br/api/webhooks/whatsapp`
- ✅ **Verificar token**: `mu/NQ2Z92+[g`
- ✅ **Campos do webhook**: Marque pelo menos `messages`

### 3. **Testar Verificação Manualmente**

Execute este comando para simular a verificação do Meta:

```bash
curl "https://moocafisio.com.br/api/webhooks/whatsapp?hub.mode=subscribe&hub.challenge=TESTE123&hub.verify_token=mu/NQ2Z92+[g"
```

**Resultado esperado**: Deve retornar `TESTE123`

### 4. **Verificar Logs do Servidor**

Se você tem acesso aos logs do servidor (Vercel, Netlify, etc.), procure por:

```
🔍 Verificação do webhook: { mode: 'subscribe', token: 'mu/NQ2Z92+[g', ... }
✅ Webhook verificado com sucesso!
```

### 5. **Configurar Variáveis de Ambiente**

Certifique-se de que estas variáveis estão configuradas no seu provedor de hospedagem:

```env
WHATSAPP_WEBHOOK_VERIFY_TOKEN=mu/NQ2Z92+[g
WHATSAPP_ACCESS_TOKEN=EAAjPUGyZBQPoBPuHi3nmXTF8VtvqqTH1raoWFqM8ZAuZCzJZA2827TibaOuXZCVtPUpEmPT4QHNDOFRI1ZCiqZAmyTNJOX3yVuAlZBReJcXgI5OP7dtll9EUZBPt9PGRWdYsPwRQRvO4G2nCWeShzTLgPC0fwABtvfWHRyNMtXultxxPLMhuxJen6rFnPzUZALVWYWLk0ZAnGyNZBuAFC5IPcSn17xkytXwcVU8rARBOuEhQJlJHdc9TPD0tthswG8z4nxQZD
WHATSAPP_PHONE_NUMBER_ID=779431901927431
WHATSAPP_BUSINESS_ACCOUNT_ID=806225345331804
```

### 6. **Deploy das Alterações**

Se você fez alterações no código, faça o deploy:

```bash
# Para Vercel
vercel --prod

# Para Netlify
netlify deploy --prod
```

### 7. **Testar Novamente no Meta**

Após o deploy:
1. Volte ao painel do Meta Developer
2. Clique em "Verificar e salvar"
3. Aguarde alguns segundos

## 🔧 Troubleshooting Avançado

### Se ainda não funcionar:

#### Opção A: Teste Local com ngrok
```bash
# Instalar ngrok
npm install -g ngrok

# Expor porta local
ngrok http 3000

# Use a URL do ngrok no Meta temporariamente
# Ex: https://abc123.ngrok.io/api/webhooks/whatsapp
```

#### Opção B: Verificar Certificado SSL
O Meta exige HTTPS. Verifique se seu domínio tem certificado válido:
```bash
curl -I https://moocafisio.com.br
```

#### Opção C: Teste com Postman
```json
GET https://moocafisio.com.br/api/webhooks/whatsapp?hub.mode=subscribe&hub.challenge=TESTE123&hub.verify_token=mu/NQ2Z92+[g
```

## 📋 Checklist Final

- [ ] Webhook endpoint está acessível publicamente
- [ ] URL usa HTTPS (não HTTP)
- [ ] Token de verificação está correto
- [ ] Variáveis de ambiente configuradas
- [ ] Deploy realizado após alterações
- [ ] Teste manual retorna challenge correto
- [ ] Logs do servidor mostram verificação

## 🆘 Se Nada Funcionar

1. **Verifique o domínio**: `moocafisio.com.br` está funcionando?
2. **Teste com outro endpoint**: Crie um endpoint simples só para teste
3. **Contate o suporte**: Meta Developer Support
4. **Use ngrok temporariamente**: Para testar localmente

## 📞 Próximos Passos Após Sucesso

1. ✅ Webhook verificado
2. 📨 Testar recebimento de mensagens
3. 🤖 Configurar automações
4. 📊 Monitorar logs e métricas
