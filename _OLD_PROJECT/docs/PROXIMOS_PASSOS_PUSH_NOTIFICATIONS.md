# 🎯 Próximos Passos - Push Notifications
## MoocaFisio - Guia Rápido de Finalização

**Data:** 2025-11-04  
**Status:** 90% Completo - Faltam apenas 3 passos!

---

## ✅ O QUE JÁ FOI FEITO

- ✅ Projeto Firebase configurado (dudufisio-3831a)
- ✅ Variáveis de ambiente no `.env.local`
- ✅ Service Worker criado (`public/firebase-messaging-sw.js`)
- ✅ Serviços criados:
  - `services/push/firebaseConfig.ts`
  - `services/push/PushNotificationService.ts`
- ✅ Hook React criado (`hooks/usePushNotifications.ts`)
- ✅ Componente UI criado (`components/notifications/NotificationPermissionPrompt.tsx`)
- ✅ Edge Function criada (`supabase/functions/send-push-notification/index.ts`)
- ✅ Migration SQL criada (`supabase/migrations/20251104000003_create_push_notification_tokens.sql`)

---

## ❗ FALTAM APENAS 3 PASSOS

### PASSO 1: Obter Service Account do Firebase

1. Acesse o Firebase Console:
   ```
   https://console.firebase.google.com/project/dudufisio-3831a/settings/serviceaccounts/adminsdk
   ```

2. Clique na aba **"Service accounts"**

3. Clique no botão **"Generate new private key"**

4. Confirme clicando em **"Generate key"**

5. Salve o arquivo JSON em local seguro (ex: `firebase-service-account.json`)

6. **⚠️ NÃO FAÇA COMMIT DESTE ARQUIVO!**

---

### PASSO 2: Aplicar Migration no Supabase

Como o MCP não tem permissão DDL, você precisa aplicar manualmente:

**Opção A: Via SQL Editor (Dashboard)**

1. Acesse: https://supabase.com/dashboard/project/urfxniitfbbvsaskicfo/editor

2. Clique em **"New query"**

3. Cole o conteúdo do arquivo:
   ```
   supabase/migrations/20251104000003_create_push_notification_tokens.sql
   ```

4. Clique em **"Run"** ou pressione `Ctrl+Enter`

5. Verifique se apareceu "Success" sem erros

**Opção B: Via Supabase CLI**

```bash
# Se você tem o Supabase CLI instalado
cd C:\Users\rafal\cursor\dudufisio-ai\dudufisio-AI
supabase db push
```

---

### PASSO 3: Configurar Service Account no Supabase

**Via Dashboard (RECOMENDADO):**

1. Acesse: https://supabase.com/dashboard/project/urfxniitfbbvsaskicfo/settings/functions

2. Na seção **"Edge Function Secrets"**, clique em **"Add new secret"**

3. Preencha:
   - **Name:** `FIREBASE_SERVICE_ACCOUNT`
   - **Value:** Cole o conteúdo COMPLETO do arquivo JSON baixado no Passo 1

4. Clique em **"Save"**

**Via Supabase CLI (alternativa):**

```bash
# Substitua pelo conteúdo do seu arquivo JSON
supabase secrets set FIREBASE_SERVICE_ACCOUNT='{"type":"service_account","project_id":"dudufisio-3831a",...}'
```

---

## 🚀 DEPOIS DESTES 3 PASSOS

### 4. Deploy da Edge Function

```bash
cd C:\Users\rafal\cursor\dudufisio-ai\dudufisio-AI

# Se você tem o Supabase CLI
supabase functions deploy send-push-notification
```

### 5. Testar Localmente

```bash
npm run dev
```

Acesse: http://localhost:5173

Você verá o prompt de notificações aparecer! 🎉

---

## 📁 ESTRUTURA DOS ARQUIVOS CRIADOS

```
dudufisio-AI/
├── .env.local                           ✅ Atualizado com Firebase
├── public/
│   └── firebase-messaging-sw.js         ✅ Service Worker
├── services/
│   └── push/
│       ├── firebaseConfig.ts            ✅ Configuração Firebase
│       └── PushNotificationService.ts   ✅ Serviço principal
├── hooks/
│   └── usePushNotifications.ts          ✅ Hook React
├── components/
│   └── notifications/
│       └── NotificationPermissionPrompt.tsx  ✅ Componente UI
└── supabase/
    ├── functions/
    │   └── send-push-notification/
    │       └── index.ts                 ✅ Edge Function (FCM v1)
    └── migrations/
        └── 20251104000003_create_push_notification_tokens.sql  ✅ Migration
```

---

## 🧪 COMO TESTAR

### Teste 1: Verificar Permissão

1. Abra o app local
2. Clique em "Ativar Notificações"
3. Aceite a permissão do navegador
4. Verifique se aparece mensagem de sucesso

### Teste 2: Verificar Token no Console

Abra o DevTools (F12) → Console e procure por:
```
[Firebase] FCM token obtained: ...
[PushService] Token saved successfully
```

### Teste 3: Enviar Notificação de Teste

Use o componente `NotificationPermissionPrompt` com `showTestButton={true}`:

```tsx
<NotificationPermissionPrompt showTestButton={true} />
```

Clique em "Enviar Teste" e deve receber a notificação!

### Teste 4: Enviar via API

```bash
curl -X POST https://urfxniitfbbvsaskicfo.supabase.co/functions/v1/send-push-notification \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVyZnhuaWl0ZmJidnNhc2tpY2ZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgzMDU0NDcsImV4cCI6MjA3Mzg4MTQ0N30.1duUQHT_MjGOmMKP-b-R6A9VByGzHgj296A2UR-IXvA" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "seu-user-id-aqui",
    "title": "Teste MoocaFisio",
    "body": "Sua primeira notificação!",
    "url": "/agenda"
  }'
```

---

## 🔧 INTEGRANDO NO APP

### Adicionar no Dashboard

Edite `pages/DashboardPage.tsx` (ou qualquer página):

```tsx
import { NotificationPermissionPrompt } from '../components/notifications/NotificationPermissionPrompt';

export const DashboardPage = () => {
  return (
    <div className="p-6">
      {/* Prompt de notificações */}
      <NotificationPermissionPrompt className="mb-6" />
      
      {/* Resto do conteúdo */}
      <h1>Dashboard</h1>
      {/* ... */}
    </div>
  );
};
```

### Enviar Notificação de Agendamento

```typescript
import { pushNotificationService } from '../services/push/PushNotificationService';

// Ao criar um agendamento
const appointment = await createAppointment(...);

// Enviar notificação
await pushNotificationService.sendNotification({
  userId: appointment.patient_id,
  title: '📅 Consulta Agendada',
  body: `Sua consulta foi agendada para ${formatDate(appointment.date)}`,
  url: '/agenda',
  data: {
    type: 'appointment_created',
    appointment_id: appointment.id,
  },
});
```

---

## 📚 ARQUIVOS DE REFERÊNCIA

- **Guia completo original:** `GUIA_IMPLEMENTACAO_PUSH_NOTIFICATIONS.md`
- **Guia FCM v1 atualizado:** `FIREBASE_FCM_V1_SETUP.md`
- **Migration SQL:** `supabase/migrations/20251104000003_create_push_notification_tokens.sql`

---

## ❓ TROUBLESHOOTING

### Problema: "Notifications not supported"
**Solução:** Use HTTPS ou localhost. Notificações não funcionam em HTTP.

### Problema: "VAPID key not configured"
**Solução:** Verifique se todas as variáveis `VITE_FIREBASE_*` estão no `.env.local`

### Problema: "Service Worker registration failed"
**Solução:** 
1. Verifique se `public/firebase-messaging-sw.js` existe
2. Limpe o cache do navegador (Ctrl+Shift+Delete)
3. Desregistre service workers antigos em DevTools → Application → Service Workers

### Problema: Edge Function retorna erro
**Solução:**
1. Verifique se o secret `FIREBASE_SERVICE_ACCOUNT` está configurado
2. Verifique logs da Edge Function no Dashboard do Supabase

---

## ✅ CHECKLIST FINAL

- [ ] Service Account JSON baixado do Firebase
- [ ] Migration aplicada no Supabase
- [ ] Secret `FIREBASE_SERVICE_ACCOUNT` configurado no Supabase
- [ ] Edge Function deployed
- [ ] Teste local: Permissão concedida
- [ ] Teste local: Token salvo no Supabase
- [ ] Teste: Notificação recebida
- [ ] Componente adicionado no Dashboard

---

## 🎉 QUANDO COMPLETAR

Você terá um sistema completo de push notifications com:

- ✅ Push notifications funcionando em desktop e mobile
- ✅ Notificações em foreground e background
- ✅ Gerenciamento de dispositivos/tokens
- ✅ Edge Function para envio via API
- ✅ Interface amigável para ativar/desativar
- ✅ FCM v1 API (moderna e suportada pelo Google)

---

**🚀 Próxima feature:** WhatsApp Integration (Dia 4 do roadmap)

**Dúvidas?** Consulte os arquivos de referência ou Firebase/Supabase docs.

---

**✨ Boa sorte com a implementação! Você está quase lá!**

