# Guia de Deploy - Push Notifications com Firebase Admin SDK
**MoocaFisio** | Método Moderno e Seguro

## 🎯 Visão Geral

Este guia usa **Firebase Admin SDK** (Service Account) ao invés da Legacy Server Key. Este é o método **recomendado pelo Google** e não depende da Cloud Messaging API (Legacy).

### Vantagens deste Método
✅ **Mais seguro** - Usa OAuth 2.0 com Service Account
✅ **Moderno** - FCM v1 API (não legacy)
✅ **Não requer Server Key** - Usa apenas o arquivo JSON do Service Account
✅ **Melhor controle** - Access tokens temporários ao invés de chaves permanentes

---

## 📋 Pré-requisitos

- [x] Supabase CLI instalado (`npm install -g supabase`)
- [x] Service Account JSON disponível em `minatto/dudufisio-3831a-firebase-adminsdk-fbsvc-18616c7651.json`
- [x] Acesso ao projeto Supabase (urfxniitfbbvsaskicfo)

---

## 🚀 Opção 1: Deploy Automático (Recomendado)

### Windows (PowerShell)
```powershell
# Executar o script PowerShell
.\deploy-push-notification-function.ps1
```

### Linux/Mac (Bash)
```bash
# Dar permissão de execução
chmod +x deploy-push-notification-function.sh

# Executar o script
./deploy-push-notification-function.sh
```

O script automaticamente:
1. Verifica se o Service Account JSON existe
2. Faz login no Supabase (se necessário)
3. Linka com o projeto correto
4. Configura o secret `FIREBASE_SERVICE_ACCOUNT`
5. Faz deploy da Edge Function

---

## 🔧 Opção 2: Deploy Manual

### Passo 1: Login no Supabase
```bash
npx supabase login
```

Isso abrirá o navegador para autenticação.

### Passo 2: Linkar Projeto
```bash
npx supabase link --project-ref urfxniitfbbvsaskicfo
```

Você será solicitado a inserir a senha do banco de dados.

### Passo 3: Configurar Secret

**Windows (PowerShell)**:
```powershell
# Ler o JSON em uma linha
$json = (Get-Content minatto\dudufisio-3831a-firebase-adminsdk-fbsvc-18616c7651.json -Raw) -replace '\s+', ' '

# Configurar secret
npx supabase secrets set "FIREBASE_SERVICE_ACCOUNT=$json"
```

**Linux/Mac (Bash)**:
```bash
# Ler o JSON em uma linha
SERVICE_ACCOUNT_JSON=$(cat minatto/dudufisio-3831a-firebase-adminsdk-fbsvc-18616c7651.json | tr -d '\n' | tr -s ' ')

# Configurar secret
npx supabase secrets set FIREBASE_SERVICE_ACCOUNT="$SERVICE_ACCOUNT_JSON"
```

### Passo 4: Deploy da Edge Function
```bash
npx supabase functions deploy send-push-notification
```

Aguarde o deploy completar (~30-60 segundos).

---

## ✅ Verificar Deploy

### 1. Verificar se a função foi deployada
Acessar: https://supabase.com/dashboard/project/urfxniitfbbvsaskicfo/functions

Você deve ver a função `send-push-notification` listada.

### 2. Verificar secrets configurados
```bash
npx supabase secrets list
```

Deve retornar algo como:
```
NAME                        VALUE
FIREBASE_SERVICE_ACCOUNT    {"type":"service_account",...}
SUPABASE_URL                https://urfxniitfbbvsaskicfo.supabase.co
SUPABASE_SERVICE_ROLE_KEY   eyJ...
```

---

## 🧪 Testar a Edge Function

### Método 1: Via Supabase Dashboard

1. Acessar https://supabase.com/dashboard/project/urfxniitfbbvsaskicfo/functions/send-push-notification
2. Clicar em "Invoke"
3. Usar este JSON de teste:

```json
{
  "userId": "coloque-um-user-id-real-aqui",
  "title": "Teste de Notificação",
  "body": "Se você receber isso, está funcionando! 🎉",
  "url": "/dashboard",
  "icon": "/logo.png"
}
```

### Método 2: Via cURL

```bash
curl -i --location --request POST \
  'https://urfxniitfbbvsaskicfo.supabase.co/functions/v1/send-push-notification' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{
    "userId": "user-id-aqui",
    "title": "Teste",
    "body": "Funcionou!"
  }'
```

**Obter Anon Key**:
- Dashboard → Settings → API → `anon` `public`

### Método 3: Via Aplicação React

```typescript
import { supabase } from '@/lib/supabaseClient';

const sendTestNotification = async (userId: string) => {
  const { data, error } = await supabase.functions.invoke('send-push-notification', {
    body: {
      userId,
      title: 'Teste de Notificação',
      body: 'Push notification funcionando! 🚀',
      url: '/dashboard',
      icon: '/logo.png'
    }
  });

  if (error) {
    console.error('Erro ao enviar notificação:', error);
  } else {
    console.log('Notificação enviada:', data);
  }
};
```

---

## 📊 Entender a Resposta

### Resposta de Sucesso
```json
{
  "success": true,
  "sent": 2,
  "failed": 0,
  "total": 2,
  "results": [
    {
      "user_id": "uuid-1",
      "success": true,
      "error": null
    },
    {
      "user_id": "uuid-2",
      "success": true,
      "error": null
    }
  ]
}
```

### Resposta com Falhas
```json
{
  "success": true,
  "sent": 1,
  "failed": 1,
  "total": 2,
  "results": [
    {
      "user_id": "uuid-1",
      "success": true,
      "error": null
    },
    {
      "user_id": "uuid-2",
      "success": false,
      "error": "NotRegistered"
    }
  ]
}
```

**Nota**: Tokens inválidos (NotRegistered, InvalidRegistration) são **automaticamente removidos** do banco.

---

## 🔍 Troubleshooting

### Erro: "FIREBASE_SERVICE_ACCOUNT not configured"
**Solução**: Repetir Passo 3 (configurar secret)

### Erro: "Failed to get access token"
**Possíveis causas**:
- JSON do Service Account está malformado
- Private key inválida
- Service Account não tem permissões no Firebase

**Solução**:
1. Verificar que o JSON está completo
2. Re-download do Service Account no Firebase Console
3. Verificar permissões do Service Account

### Erro: "403 Forbidden" ao enviar notificação
**Possíveis causas**:
- Service Account não tem permissão Firebase Messaging
- Firebase Cloud Messaging API não habilitada

**Solução**:
1. Firebase Console → Project Settings → Service Accounts
2. Verificar que o service account tem permissão "Firebase Cloud Messaging API Admin"
3. Google Cloud Console → APIs & Services → Library
4. Buscar "Firebase Cloud Messaging API" e habilitar

### Edge Function demora muito
**Solução**: Normal na primeira execução (cold start). Próximas execuções serão rápidas.

### Tokens FCM não sendo salvos
**Verificar**:
1. Migration aplicada corretamente: `SELECT * FROM push_notification_tokens;`
2. Service Worker registrado: DevTools → Application → Service Workers
3. Permissão de notificação concedida: `Notification.permission === 'granted'`

---

## 📚 Diferenças vs. Legacy API

| Aspecto | Legacy API (Antiga) | Firebase Admin SDK (Nova) |
|---------|---------------------|---------------------------|
| **Autenticação** | Server Key fixa | OAuth 2.0 com Service Account |
| **API Endpoint** | `https://fcm.googleapis.com/fcm/send` | `https://fcm.googleapis.com/v1/projects/.../messages:send` |
| **Secret** | `FCM_SERVER_KEY` | `FIREBASE_SERVICE_ACCOUNT` (JSON) |
| **Segurança** | ⚠️ Chave permanente | ✅ Access tokens temporários |
| **Recomendação Google** | ❌ Deprecated | ✅ Recomendado |

---

## 🎯 Próximos Passos

Após o deploy bem-sucedido:

1. ✅ Testar envio de notificação via Dashboard
2. ✅ Integrar com eventos da aplicação (novo agendamento, lembrete, etc.)
3. ✅ Monitorar logs da Edge Function
4. ✅ Configurar triggers automáticos (Supabase Database Webhooks)

---

## 🔗 Referências

- [Firebase Admin SDK - Node.js](https://firebase.google.com/docs/admin/setup)
- [FCM v1 API](https://firebase.google.com/docs/cloud-messaging/migrate-v1)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [Service Account Authentication](https://cloud.google.com/iam/docs/service-accounts)

---

## ✨ Como Funciona Internamente

```
┌─────────────────────────────────────────────────────────────────┐
│ Edge Function (Deno Runtime)                                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. Recebe request com userId, title, body                      │
│  2. Lê FIREBASE_SERVICE_ACCOUNT do environment                  │
│  3. Cria JWT assinado com private_key do Service Account        │
│  4. Troca JWT por Access Token OAuth (Google)                   │
│  5. Busca FCM tokens do usuário no Supabase                     │
│  6. Para cada token:                                            │
│     - Envia notificação via FCM v1 API                          │
│     - Usa Access Token como Authorization: Bearer              │
│     - Atualiza last_used_at se sucesso                          │
│     - Remove token se inválido (NotRegistered)                  │
│  7. Retorna summary (sent, failed, total, results)              │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**Bibliotecas Usadas**:
- `djwt` - Para criar e assinar JWTs
- `crypto.subtle` - Para importar private key e assinar
- `fetch` - Para comunicação com Google OAuth e FCM

---

**Desenvolvido por**: Claude (Anthropic)
**Projeto**: MoocaFisio
**Data**: 04 de Novembro de 2025
