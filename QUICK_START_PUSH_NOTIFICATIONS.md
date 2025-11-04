# ⚡ Quick Start - Push Notifications
## 3 Passos em 15 Minutos

---

## 🎯 OBJETIVO

Concluir a implementação de Push Notifications no MoocaFisio.

**Progresso atual:** 90% → **Meta:** 100%

---

## 📋 PASSO 1: Service Account do Firebase (5 minutos)

### 1.1 Abrir Firebase Console

🔗 **Link direto:** https://console.firebase.google.com/project/dudufisio-3831a/settings/serviceaccounts/adminsdk

### 1.2 Gerar Chave

1. Na aba **"Service accounts"**
2. Role até encontrar **"Firebase Admin SDK"**
3. Clique no botão **"Generate new private key"** (botão azul/roxo)
4. Confirme clicando em **"Generate key"**

### 1.3 Salvar Arquivo

- Será baixado um arquivo JSON (ex: `dudufisio-3831a-firebase-adminsdk-xxxxx.json`)
- **Guarde este arquivo!** Você vai usar no Passo 3
- ⚠️ **NUNCA faça commit deste arquivo no Git!**

```
✅ CHECKPOINT 1: Arquivo JSON baixado e salvo
```

---

## 📋 PASSO 2: Criar Tabela no Supabase (3 minutos)

### 2.1 Abrir SQL Editor

🔗 **Link direto:** https://supabase.com/dashboard/project/urfxniitfbbvsaskicfo/sql/new

### 2.2 Copiar SQL

Abra o arquivo no seu projeto:
```
supabase/migrations/20251104000003_create_push_notification_tokens.sql
```

### 2.3 Executar SQL

1. Selecione todo o conteúdo do arquivo (Ctrl+A)
2. Copie (Ctrl+C)
3. Cole no SQL Editor do Supabase (Ctrl+V)
4. Clique em **"Run"** (ou pressione Ctrl+Enter)

### 2.4 Verificar Sucesso

Você deve ver:
```
Success. No rows returned
```

### 2.5 Confirmar Tabela Criada

1. Na sidebar esquerda, clique em **"Table Editor"**
2. Procure por **"push_notification_tokens"**
3. Deve aparecer a tabela com as colunas: id, user_id, token, device_type, etc.

```
✅ CHECKPOINT 2: Tabela push_notification_tokens criada
```

---

## 📋 PASSO 3: Configurar Secret no Supabase (5 minutos)

### 3.1 Abrir Configurações

🔗 **Link direto:** https://supabase.com/dashboard/project/urfxniitfbbvsaskicfo/settings/functions

### 3.2 Adicionar Secret

1. Role até **"Edge Function Secrets"**
2. Clique em **"Add new secret"**

### 3.3 Preencher Dados

**Name (campo de cima):**
```
FIREBASE_SERVICE_ACCOUNT
```

**Value (campo de baixo):**
1. Abra o arquivo JSON baixado no Passo 1
2. Copie **TODO o conteúdo** (deve começar com `{` e terminar com `}`)
3. Cole no campo Value

Deve ficar algo assim (resumido):
```json
{"type":"service_account","project_id":"dudufisio-3831a","private_key_id":"...","private_key":"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n","client_email":"firebase-adminsdk-...@dudufisio-3831a.iam.gserviceaccount.com",...}
```

4. Clique em **"Add secret"** ou **"Save"**

### 3.4 Verificar

O secret deve aparecer na lista:
```
FIREBASE_SERVICE_ACCOUNT  •••••••••••••••  [Edit] [Delete]
```

```
✅ CHECKPOINT 3: Secret configurado no Supabase
```

---

## 📋 PASSO 4 (OPCIONAL): Deploy Edge Function (2 minutos)

### Opção A: Via Supabase CLI (se instalado)

```bash
cd C:\Users\rafal\cursor\dudufisio-ai\dudufisio-AI
supabase functions deploy send-push-notification
```

### Opção B: Via Dashboard

1. Acesse: https://supabase.com/dashboard/project/urfxniitfbbvsaskicfo/functions
2. Clique em **"Create a new function"** ou **"Deploy function"**
3. Faça upload do arquivo `supabase/functions/send-push-notification/index.ts`

```
✅ CHECKPOINT 4: Edge Function deployed
```

---

## 🎉 TESTE FINAL

### Teste 1: Iniciar Servidor Local

```bash
cd C:\Users\rafal\cursor\dudufisio-ai\dudufisio-AI
npm run dev
```

### Teste 2: Abrir Navegador

Acesse: http://localhost:5173

### Teste 3: Fazer Login

Use as credenciais:
```
Email: admin@moocafisio.com.br
Password: MoocaFisio2024!
```

### Teste 4: Ver Prompt de Notificações

Você deve ver uma caixa azul com:
```
🔔 Ative as Notificações
Receba lembretes de consultas e atualizações importantes...
[Ativar Notificações]
```

### Teste 5: Ativar Notificações

1. Clique em **"Ativar Notificações"**
2. O navegador vai solicitar permissão
3. Clique em **"Permitir"** ou **"Allow"**

### Teste 6: Verificar Sucesso

Você deve ver:
```
✅ Notificações Ativadas!
Você receberá lembretes e atualizações importantes.
```

### Teste 7: Verificar Console (DevTools)

Pressione F12 → Console

Procure por:
```
[Firebase] FCM token obtained: ...
[PushService] Token saved successfully
```

### Teste 8: Verificar Banco de Dados

1. Acesse: https://supabase.com/dashboard/project/urfxniitfbbvsaskicfo/editor
2. Abra a tabela **push_notification_tokens**
3. Deve ter 1 registro com:
   - user_id: (seu user id)
   - token: (string longa do FCM)
   - device_type: "desktop" ou "mobile"
   - enabled: true

```
✅ TESTE COMPLETO: Push Notifications funcionando! 🎉
```

---

## 🚀 PRÓXIMO: INTEGRAR NO APP

### Adicionar Prompt no Dashboard

Edite: `pages/DashboardPage.tsx`

Adicione no topo dos imports:
```tsx
import { NotificationPermissionPrompt } from '../components/notifications/NotificationPermissionPrompt';
```

Adicione no JSX (início do return):
```tsx
<NotificationPermissionPrompt className="mb-6" />
```

### Exemplo Completo:

```tsx
import React from 'react';
import { NotificationPermissionPrompt } from '../components/notifications/NotificationPermissionPrompt';

export const DashboardPage: React.FC = () => {
  return (
    <div className="p-6">
      {/* Prompt de Push Notifications */}
      <NotificationPermissionPrompt className="mb-6" />
      
      {/* Resto do dashboard */}
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      {/* ... seu conteúdo atual ... */}
    </div>
  );
};
```

---

## 📤 ENVIAR NOTIFICAÇÃO DE TESTE

### Via Código

```typescript
import { pushNotificationService } from '../services/push/PushNotificationService';

const sendTestNotification = async () => {
  await pushNotificationService.sendNotification({
    userId: 'user-id-aqui',
    title: '🎉 Teste',
    body: 'Sua primeira notificação!',
    url: '/dashboard',
  });
};
```

### Via API (curl)

```bash
curl -X POST https://urfxniitfbbvsaskicfo.supabase.co/functions/v1/send-push-notification \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVyZnhuaWl0ZmJidnNhc2tpY2ZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgzMDU0NDcsImV4cCI6MjA3Mzg4MTQ0N30.1duUQHT_MjGOmMKP-b-R6A9VByGzHgj296A2UR-IXvA" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "seu-user-id",
    "title": "Teste MoocaFisio",
    "body": "Esta é uma notificação de teste!",
    "url": "/agenda"
  }'
```

---

## 🐛 TROUBLESHOOTING RÁPIDO

### Problema: "Notifications not supported"
**Causa:** HTTP ao invés de HTTPS  
**Solução:** Use `localhost` ou HTTPS

### Problema: Não apareceu a caixa de permissão
**Causa:** Já foi negada antes  
**Solução:** 
1. Clique no cadeado na barra de endereço
2. Em "Notificações", mude para "Permitir"
3. Recarregue a página (F5)

### Problema: Token não foi salvo
**Causa:** Tabela não criada ou RLS bloqueando  
**Solução:** Verifique se completou o Passo 2 corretamente

### Problema: Edge Function retorna erro
**Causa:** Secret não configurado  
**Solução:** Verifique se completou o Passo 3 corretamente

### Problema: Service Worker não registra
**Causa:** Arquivo não encontrado  
**Solução:** Verifique se `public/firebase-messaging-sw.js` existe

---

## ✅ CHECKLIST FINAL

- [ ] Passo 1: Service Account JSON baixado
- [ ] Passo 2: Tabela criada no Supabase
- [ ] Passo 3: Secret configurado no Supabase
- [ ] Passo 4: Edge Function deployed (opcional)
- [ ] Teste: Permissão concedida
- [ ] Teste: Token salvo no banco
- [ ] Teste: Console sem erros
- [ ] Integração: Componente adicionado no Dashboard

---

## 🎊 PARABÉNS!

Você agora tem um **sistema completo de Push Notifications**!

### O que você conquistou:

✅ Push notifications em tempo real  
✅ Suporte a múltiplos dispositivos  
✅ Notificações em foreground e background  
✅ Sistema moderno com FCM v1 API  
✅ Segurança com RLS e OAuth2  
✅ Interface amigável para usuários  

### Próximos passos:

1. **Integrar com Agenda** - Enviar lembretes de consultas
2. **Notificações Personalizadas** - Por tipo de evento
3. **Dashboard** - Visualizar histórico de notificações
4. **WhatsApp** - Integração com WhatsApp Business API

---

## 📞 PRECISA DE AJUDA?

Consulte os guias detalhados:
- `PROXIMOS_PASSOS_PUSH_NOTIFICATIONS.md` - Instruções detalhadas
- `RESUMO_IMPLEMENTACAO.md` - Visão geral da arquitetura
- `FIREBASE_FCM_V1_SETUP.md` - Detalhes sobre FCM v1

---

**🚀 Agora é só aproveitar seu novo sistema de notificações!**

