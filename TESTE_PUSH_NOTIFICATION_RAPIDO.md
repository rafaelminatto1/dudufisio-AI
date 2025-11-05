# 🔔 Teste Rápido - Push Notifications
**MoocaFisio** | 05 de Novembro de 2025

---

## ✅ Deploy Concluído!

A Edge Function `send-push-notification` foi **deployed com sucesso**!

```
✅ Secret configurado: FIREBASE_SERVICE_ACCOUNT_JSON
✅ Edge Function deployed: send-push-notification
✅ Dashboard URL: https://supabase.com/dashboard/project/urfxniitfbbvsaskicfo/functions
```

---

## 🧪 Como Testar (2 opções)

### Opção 1: Testar Via Aplicação (Recomendado)

**Passo 1: Iniciar a aplicação**
```bash
npm run dev
```

**Passo 2: Abrir no navegador**
```
http://localhost:5173
```

**Passo 3: Fazer login**
- Usar suas credenciais do Supabase
- Você verá um prompt para permitir notificações

**Passo 4: Permitir notificações**
- Clicar em "Permitir" quando o navegador pedir permissão
- O token será automaticamente salvo no banco

**Passo 5: Ver o token no banco**
Abra o Supabase Dashboard → SQL Editor:
```sql
SELECT
  id,
  user_id,
  token,
  device_type,
  created_at
FROM public.push_notification_tokens
ORDER BY created_at DESC
LIMIT 5;
```

**Passo 6: Enviar notificação de teste**
Vá para: https://supabase.com/dashboard/project/urfxniitfbbvsaskicfo/functions/send-push-notification

Use este JSON (substitua `SEU_TOKEN_AQUI` pelo token do passo 5):
```json
{
  "tokens": ["SEU_TOKEN_AQUI"],
  "notification": {
    "title": "🎉 MoocaFisio Push Notifications!",
    "body": "Se você viu esta notificação, tudo está funcionando perfeitamente! 🚀",
    "icon": "/logo.png"
  }
}
```

---

### Opção 2: Testar Via Dashboard (Se já tiver tokens)

**Passo 1: Verificar se há tokens no banco**

Acesse: https://supabase.com/dashboard/project/urfxniitfbbvsaskicfo/editor

Navegue até `push_notification_tokens` e veja se há algum registro.

**Passo 2: Copiar um token**

**Passo 3: Testar a Edge Function**

Acesse: https://supabase.com/dashboard/project/urfxniitfbbvsaskicfo/functions/send-push-notification

Clique em **"Test send-push-notification"**

Use este JSON de teste:
```json
{
  "tokens": ["COLE_O_TOKEN_AQUI"],
  "notification": {
    "title": "🎉 Teste MoocaFisio!",
    "body": "Push Notification funcionando! 🚀",
    "icon": "/logo.png",
    "badge": "/badge.png",
    "tag": "test-notification",
    "requireInteraction": false
  },
  "data": {
    "type": "test",
    "timestamp": "2025-11-05T00:00:00Z",
    "url": "/dashboard"
  }
}
```

**Resultado esperado**:
```json
{
  "success": true,
  "sent": 1,
  "failed": 0,
  "results": [
    {
      "token": "seu-token...",
      "success": true,
      "messageId": "projects/dudufisio-3831a/messages/..."
    }
  ]
}
```

---

## 📋 Checklist de Teste

- [ ] Aplicação rodando (`npm run dev`)
- [ ] Login realizado
- [ ] Permissão de notificação concedida no navegador
- [ ] Token aparece no banco de dados
- [ ] Teste da Edge Function via Dashboard
- [ ] Notificação recebida no navegador
- [ ] Notificação aparece mesmo com aba fechada (se navegador aberto)

---

## 🔍 Troubleshooting

### Erro: "No tokens provided"
**Solução**: Certifique-se de que o JSON inclui o campo `tokens` como array.

### Erro: "Invalid Firebase token"
**Solução**: O token pode ter expirado. Gere um novo token:
1. Limpe os dados do site no navegador
2. Faça login novamente
3. Permita notificações novamente

### Erro: "Service Worker not registered"
**Solução**:
1. Verifique se `firebase-messaging-sw.js` existe na pasta `public/`
2. Abra DevTools → Application → Service Workers
3. Veja se o Service Worker está registrado
4. Se não, clique em "Update" ou recarregue a página

### Notificação não aparece
**Possíveis causas**:
1. **Permissão bloqueada**: Verifique permissões do navegador
2. **Navegador não suporta**: Use Chrome, Edge ou Firefox
3. **HTTPS necessário**: Push notifications só funcionam em HTTPS (ou localhost)
4. **Token inválido**: Gere um novo token

---

## 🎯 Próximos Passos Após Teste Bem-Sucedido

### 1. Integrar com Agendamentos
Enviar notificações automáticas:
- Confirmação de agendamento
- Lembrete 24h antes
- Lembrete 2h antes

### 2. Adicionar Ações nas Notificações
```typescript
{
  "notification": {
    "title": "Consulta em 2 horas",
    "body": "Sua consulta com Dr. João às 14:00",
    "actions": [
      { "action": "confirm", "title": "✅ Confirmar" },
      { "action": "reschedule", "title": "📅 Reagendar" }
    ]
  }
}
```

### 3. Criar Dashboard de Notificações Enviadas
Ver histórico de notificações push enviadas.

### 4. Implementar Rich Notifications
- Imagens
- Ícones personalizados
- Sons customizados

---

## 📊 Status Atual

```
✅ Firebase configurado
✅ Service Worker implementado
✅ Edge Function deployed
✅ Secret configurado
⏳ Aguardando teste final
```

**Próxima tarefa após teste**: Notification Center (centro unificado de notificações)

---

## 🔗 Links Úteis

- **Edge Function Dashboard**: https://supabase.com/dashboard/project/urfxniitfbbvsaskicfo/functions/send-push-notification
- **Firebase Console**: https://console.firebase.google.com/project/dudufisio-3831a
- **Supabase Database**: https://supabase.com/dashboard/project/urfxniitfbbvsaskicfo/editor
- **Logs da Edge Function**: https://supabase.com/dashboard/project/urfxniitfbbvsaskicfo/logs/edge-functions

---

**Desenvolvido por**: Claude (Anthropic)
**Status**: ✅ PRONTO PARA TESTE
**Tempo de Deploy**: ~5 minutos

🚀 **Boa sorte com o teste!**
