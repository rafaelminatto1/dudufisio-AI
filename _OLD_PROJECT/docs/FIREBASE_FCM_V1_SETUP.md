# 🔔 Firebase Cloud Messaging v1 API - Setup Atualizado
## MoocaFisio - Push Notifications

**Data:** 2025-11-04  
**Status:** Configuração Moderna (FCM v1 API)

---

## ✅ O QUE VOCÊ JÁ COMPLETOU

- [x] Projeto Firebase criado (dudufisio-3831a)
- [x] App Web registrado
- [x] VAPID Key gerada
- [x] Credenciais Firebase configuradas no `.env.local`

---

## 🚨 MUDANÇA IMPORTANTE

A **Cloud Messaging API (Legacy)** foi descontinuada pelo Firebase. Estamos usando a **FCM v1 API** (moderna).

### Diferenças:
- ❌ Legacy: Usava "Server Key" simples
- ✅ v1 API: Usa OAuth2 com Service Account

---

## 📋 PRÓXIMOS PASSOS

### PASSO 1.5: Obter Service Account Key

1. Acesse o Firebase Console:
   ```
   https://console.firebase.google.com/project/dudufisio-3831a/settings/serviceaccounts/adminsdk
   ```

2. Na aba **Service Accounts**:
   - Clique em **Generate new private key**
   - Confirme clicando em **Generate key**
   - Salve o arquivo JSON (ex: `firebase-service-account.json`)

3. **⚠️ IMPORTANTE:** 
   - NÃO faça commit deste arquivo!
   - Guarde-o em local seguro
   - Você usará o conteúdo no próximo passo

### PASSO 1.6: Configurar Service Account no Supabase

Você precisa adicionar o conteúdo do Service Account como secret no Supabase:

**Opção A: Via Supabase CLI**
```bash
# Navegue até o diretório do projeto
cd C:\Users\rafal\cursor\dudufisio-ai\dudufisio-AI

# Configure o secret (cole o JSON inteiro quando solicitado)
supabase secrets set FIREBASE_SERVICE_ACCOUNT='{"type":"service_account","project_id":"dudufisio-3831a",...}'
```

**Opção B: Via Dashboard Supabase**
1. Acesse: https://supabase.com/dashboard/project/urfxniitfbbvsaskicfo/settings/functions
2. Na seção **Secrets**, adicione:
   - Key: `FIREBASE_SERVICE_ACCOUNT`
   - Value: Cole o conteúdo COMPLETO do arquivo JSON

---

## PASSO 2: Atualizar firebase-messaging-sw.js

Como o Service Worker não pode usar variáveis de ambiente do Vite, precisamos uma abordagem diferente:

### Opção 1: Hardcode no SW (RECOMENDADO para começar)

Edite `public/firebase-messaging-sw.js` e substitua pelas suas credenciais:

```javascript
firebase.initializeApp({
  apiKey: "AIzaSyA8mZG9Ev6qmUQDqkpenDtX0OmNKlHh8qs",
  authDomain: "dudufisio-3831a.firebaseapp.com",
  projectId: "dudufisio-3831a",
  storageBucket: "dudufisio-3831a.firebasestorage.app",
  messagingSenderId: "823218682207",
  appId: "1:823218682207:web:617dde917df6ee9c725eea"
});
```

### Opção 2: Geração Dinâmica via Build Script (AVANÇADO)

Criar um script que gera o SW durante o build.

---

## PASSO 3: Continuar Implementação

Agora você pode seguir o guia original a partir do **PASSO 2** (Configurar Variáveis de Ambiente), mas com estas modificações:

### ✅ Arquivos já criados:
- ✅ `.env.local` - Atualizado com suas credenciais
- ✅ `supabase/functions/send-push-notification/index.ts` - Versão FCM v1

### 📝 Próximos arquivos a criar:
1. `services/push/firebaseConfig.ts` (do guia original)
2. `services/push/PushNotificationService.ts` (do guia original)
3. `hooks/usePushNotifications.ts` (do guia original)
4. `components/notifications/NotificationPermissionPrompt.tsx` (do guia original)
5. `public/firebase-messaging-sw.js` (atualizar com suas credenciais)

---

## PASSO 4: Aplicar Migration no Supabase

Você pode usar o MCP tool do Supabase para criar a tabela:

```typescript
// Via Cursor/Claude MCP
mcp_supabase_apply_migration({
  name: "create_push_notification_tokens",
  query: `... SQL do guia original PASSO 4.1 ...`
})
```

---

## PASSO 5: Deploy Edge Function

Após configurar o `FIREBASE_SERVICE_ACCOUNT` secret:

```bash
supabase functions deploy send-push-notification
```

---

## 🔧 TESTANDO

### Teste 1: Verificar VAPID Key
```bash
# No console do navegador (após implementar firebaseConfig.ts):
import { getFCMToken } from './services/push/firebaseConfig'
const token = await getFCMToken()
console.log('FCM Token:', token)
```

### Teste 2: Enviar notificação via Edge Function
```bash
curl -X POST https://urfxniitfbbvsaskicfo.supabase.co/functions/v1/send-push-notification \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVyZnhuaWl0ZmJidnNhc2tpY2ZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgzMDU0NDcsImV4cCI6MjA3Mzg4MTQ0N30.1duUQHT_MjGOmMKP-b-R6A9VByGzHgj296A2UR-IXvA" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "seu-user-id",
    "title": "Teste MoocaFisio",
    "body": "Notificação de teste!",
    "url": "/agenda"
  }'
```

---

## 📚 RECURSOS

- [Firebase FCM v1 API](https://firebase.google.com/docs/cloud-messaging/migrate-v1)
- [Service Account Authentication](https://firebase.google.com/docs/cloud-messaging/auth-server)
- [Supabase Edge Functions Secrets](https://supabase.com/docs/guides/functions/secrets)

---

## ❓ FAQ

**Q: Por que não usar a API Legacy?**  
A: Google descontinuou em junho de 2024. A v1 API é mais segura e moderna.

**Q: O que fazer com o arquivo Service Account JSON?**  
A: Nunca faça commit! Use apenas como secret no Supabase.

**Q: Preciso configurar no Vercel também?**  
A: Não para a Edge Function (roda no Supabase). Mas precisa das variáveis VITE_FIREBASE_* no Vercel para o frontend.

---

**✅ Quando completar o Passo 1.6, você pode continuar com o guia original!**

