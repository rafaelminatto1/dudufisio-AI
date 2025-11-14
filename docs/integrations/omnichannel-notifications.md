# Notificações Omnicanal

## Regra Operacional (sem SMS)
- ⚠️ A partir de novembro/2025 **o canal SMS foi desativado** por decisão do cliente.
- Nenhuma função, script ou IA assistente pode propor, habilitar ou alterar código para enviar SMS.
- Os canais oficiais são apenas **Push Web/App**, **WhatsApp Business** e **E-mail/Resend**.
- Caso algum fluxo ainda referencie SMS, ele deve ser tratado como mock/desligado e documentado.

## Visão Geral
- `services/notifications/omniNotificationService.ts` centraliza o disparo de notificações por **push**, **WhatsApp** e **e-mail** (sem SMS).
- `push_notification_tokens` agora recebe tokens móveis (Expo/FCM) via app React Native.
- A edge function `process-appointment-reminders` entrega lembretes com fallback automático apenas via WhatsApp/e-mail quando o push não for possível.

## Como usar (frontend web)
```ts
import { sendOmniNotification } from '@/services/notifications/omniNotificationService';

await sendOmniNotification({
  target: { userId, patientId },
  title: 'Título push',
  body: 'Mensagem principal',
  data: { custom: 'payload' },
  whatsapp: { message: 'Mensagem amigável para WhatsApp' },
  email: {
    subject: 'Resumo da consulta',
    html: '<p>Conteúdo rico</p>',
  },
  channels: { push: true, whatsapp: true, email: true },
});
```

## Mobile (Expo)
- `mobile-app/services/notification.service.ts` registra o token do dispositivo após login (`registerPushTokenForUser`).
- Tela Home dispara o registro assim que o usuário autentica.

## Edge Functions Atualizadas
- `process-appointment-reminders`: usa fallback WhatsApp/e-mail ao detectar ausência de tokens ou falha no push.
- `send-whatsapp` e `send-email` continuam responsáveis por validar opt-in e registrar logs.

## Requisitos
- Configurar credenciais **WhatsApp Business** e **Firebase FCM** nas variáveis do projeto Supabase.
- Garantir que pacientes tenham `phone` válido (formato nacional ou internacional) e opt-in no `whatsapp_preferences`.

