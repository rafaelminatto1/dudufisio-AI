# Configuração WhatsApp Business API - DuduFisio-AI

## Informações da Conta

### Dados da API
- **Callback URL**: `https://moocafisio.com.br/api/webhooks/whatsapp`
- **Verification Token**: `mu/NQ2Z92+[g`
- **Access Token**: `EAAjPUGyZBQPoBPuHi3nmXTF8VtvqqTH1raoWFqM8ZAuZCzJZA2827TibaOuXZCVtPUpEmPT4QHNDOFRI1ZCiqZAmyTNJOX3yVuAlZBReJcXgI5OP7dtll9EUZBPt9PGRWdYsPwRQRvO4G2nCWeShzTLgPC0fwABtvfWHRyNMtXultxxPLMhuxJen6rFnPzUZALVWYWLk0ZAnGyNZBuAFC5IPcSn17xkytXwcVU8rARBOuEhQJlJHdc9TPD0tthswG8z4nxQZD`
- **User Token**: `EAAjPUGyZBQPoBPgACvhxobttE4Wfy7IeZBdOkdeuzZAWPVr8ZBYP9AwOKKaOxQU6AabmsUJW5mOFxN2edmwaFQPaUbtsn9SZCJAUOnKaDBC0zlonlNSfZBVkJnm7oX91ThRhAApHyUdvc86mN8n4ApTzrRwKoiZBiDbuW0gUqZBZAaw8xOC7ChFCN3eILpWhk3rPMGwZDZD`

### IDs da Conta
- **Phone Number ID**: `779431901927431`
- **Business Account ID**: `806225345331804`
- **Phone Number**: `+55 11 5874 9885`

## Variáveis de Ambiente

Adicione estas variáveis ao seu arquivo `.env.local`:

```env
# WhatsApp Business API Configuration
WHATSAPP_WEBHOOK_VERIFY_TOKEN=mu/NQ2Z92+[g
WHATSAPP_ACCESS_TOKEN=EAAjPUGyZBQPoBPuHi3nmXTF8VtvqqTH1raoWFqM8ZAuZCzJZA2827TibaOuXZCVtPUpEmPT4QHNDOFRI1ZCiqZAmyTNJOX3yVuAlZBReJcXgI5OP7dtll9EUZBPt9PGRWdYsPwRQRvO4G2nCWeShzTLgPC0fwABtvfWHRyNMtXultxxPLMhuxJen6rFnPzUZALVWYWLk0ZAnGyNZBuAFC5IPcSn17xkytXwcVU8rARBOuEhQJlJHdc9TPD0tthswG8z4nxQZD
WHATSAPP_PHONE_NUMBER_ID=779431901927431
WHATSAPP_BUSINESS_ACCOUNT_ID=806225345331804
WHATSAPP_USER_TOKEN=EAAjPUGyZBQPoBPgACvhxobttE4Wfy7IeZBdOkdeuzZAWPVr8ZBYP9AwOKKaOxQU6AabmsUJW5mOFxN2edmwaFQPaUbtsn9SZCJAUOnKaDBC0zlonlNSfZBVkJnm7oX91ThRhAApHyUdvc86mN8n4ApTzrRwKoiZBiDbuW0gUqZBZAaw8xOC7ChFCN3eILpWhk3rPMGwZDZD

# Configurações da Clínica
DEFAULT_CLINIC_ID=1
```

## Configuração no Meta

### 1. Webhook Configuration
- **Callback URL**: `https://moocafisio.com.br/api/webhooks/whatsapp`
- **Verify Token**: `mu/NQ2Z92+[g`
- **Webhook Fields**: `messages`

### 2. Permissions
Certifique-se de que os seguintes campos estão marcados:
- ✅ `messages`
- ✅ `message_deliveries` (opcional)
- ✅ `message_reads` (opcional)

## Teste da Configuração

### 1. Verificar Webhook
O Meta enviará uma requisição GET para verificar o webhook:
```
GET https://moocafisio.com.br/api/webhooks/whatsapp?hub.mode=subscribe&hub.challenge=CHALLENGE_STRING&hub.verify_token=mu/NQ2Z92+[g
```

### 2. Enviar Mensagem de Teste
Após a verificação, você pode enviar uma mensagem para o número `+55 11 5874 9885` para testar o recebimento.

## Troubleshooting

### Erro de Verificação
Se a verificação falhar:
1. Verifique se o webhook está acessível publicamente
2. Confirme se o token está correto
3. Verifique os logs do servidor

### Logs do Webhook
O webhook registra todas as interações nos logs do console:
- ✅ Sucesso na verificação
- 📨 Mensagens recebidas
- ❌ Erros de processamento

## Próximos Passos

1. **Deploy**: Faça o deploy da aplicação para `moocafisio.com.br`
2. **Teste**: Envie uma mensagem para testar
3. **Monitoramento**: Acompanhe os logs para verificar funcionamento
4. **Integração**: Configure o serviço WhatsApp no sistema
