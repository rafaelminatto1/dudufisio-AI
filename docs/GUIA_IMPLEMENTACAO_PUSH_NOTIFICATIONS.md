# 🔔 Guia Completo de Implementação - Push Notifications
## MoocaFisio - Firebase Cloud Messaging

**Data:** 2025-11-04
**Autor:** Claude AI
**Status:** Guia de Implementação Passo a Passo

---

## 📋 PRÉ-REQUISITOS

- ✅ Firebase SDK instalado (`firebase` package)
- ✅ Conta Firebase (https://console.firebase.google.com)
- ✅ Projeto Supabase configurado
- ✅ Supabase CLI ou MCP tools

---

## PASSO 1: Configurar Projeto no Firebase Console

### 1.1 Criar Projeto Firebase

1. Acesse https://console.firebase.google.com
2. Clique em "Adicionar projeto"
3. Nome do projeto: **MoocaFisio**
4. Desative Google Analytics (opcional)
5. Clique em "Criar projeto"

### 1.2 Adicionar App Web

1. No painel do projeto, clique no ícone **</>** (Web)
2. Nome do app: **MoocaFisio Web**
3. ✅ Marque "Also set up Firebase Hosting"
4. Clique em "Registrar app"
5. **COPIE as configurações** que aparecerão:

```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "moocafisio.firebaseapp.com",
  projectId: "moocafisio",
  storageBucket: "moocafisio.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123",
  measurementId: "G-XXXXXXX"
};
```

### 1.3 Ativar Cloud Messaging

1. No menu lateral, vá em **Build → Cloud Messaging**
2. Clique em "Get Started"
3. Na aba **Cloud Messaging API (Legacy)**, clique em "Enable"

### 1.4 Gerar VAPID Key

1. Ainda em Cloud Messaging, vá para a aba **Web configuration**
2. Em **Web Push certificates**, clique em **Generate key pair**
3. **COPIE a chave gerada** (formato: `BHxxx...`)

---

## PASSO 2: Configurar Variáveis de Ambiente

### 2.1 Atualizar `.env.local`

Adicione as seguintes variáveis:

```bash
# Firebase Push Notifications
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=moocafisio.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=moocafisio
VITE_FIREBASE_STORAGE_BUCKET=moocafisio.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXX
VITE_FIREBASE_VAPID_KEY=BHxxx...
```

### 2.2 Configurar Variáveis no Vercel (Produção)

```bash
# Via Vercel CLI
vercel env add VITE_FIREBASE_API_KEY
vercel env add VITE_FIREBASE_AUTH_DOMAIN
vercel env add VITE_FIREBASE_PROJECT_ID
vercel env add VITE_FIREBASE_STORAGE_BUCKET
vercel env add VITE_FIREBASE_MESSAGING_SENDER_ID
vercel env add VITE_FIREBASE_APP_ID
vercel env add VITE_FIREBASE_MEASUREMENT_ID
vercel env add VITE_FIREBASE_VAPID_KEY
```

Ou via dashboard: https://vercel.com/dudufisio-ai/settings/environment-variables

---

## PASSO 3: Criar Arquivos de Configuração

### 3.1 `services/push/firebaseConfig.ts`

```typescript
/**
 * Firebase Configuration for Push Notifications
 * MoocaFisio
 */

import { initializeApp, FirebaseApp } from 'firebase/app';
import { getMessaging, Messaging, getToken, onMessage } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

let app: FirebaseApp | null = null;
let messaging: Messaging | null = null;

export const initializeFirebase = (): FirebaseApp => {
  if (!app) {
    app = initializeApp(firebaseConfig);
  }
  return app;
};

export const getMessagingInstance = (): Messaging | null => {
  if (typeof window === 'undefined') return null;

  if (!messaging) {
    try {
      const firebaseApp = initializeFirebase();
      messaging = getMessaging(firebaseApp);
    } catch (error) {
      console.error('Error initializing Firebase Messaging:', error);
      return null;
    }
  }
  return messaging;
};

export const requestNotificationPermission = async (): Promise<string | null> => {
  try {
    if (!('Notification' in window)) {
      console.warn('Notifications not supported');
      return null;
    }

    if (Notification.permission === 'granted') {
      return await getFCMToken();
    }

    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      return await getFCMToken();
    }
    return null;
  } catch (error) {
    console.error('Error requesting permission:', error);
    return null;
  }
};

export const getFCMToken = async (): Promise<string | null> => {
  try {
    const messagingInstance = getMessagingInstance();
    if (!messagingInstance) return null;

    const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;
    if (!vapidKey) {
      console.error('VAPID key not configured');
      return null;
    }

    const token = await getToken(messagingInstance, { vapidKey });
    return token;
  } catch (error) {
    console.error('Error getting FCM token:', error);
    return null;
  }
};

export const onForegroundMessage = (callback: (payload: any) => void): (() => void) => {
  const messagingInstance = getMessagingInstance();
  if (!messagingInstance) return () => {};

  return onMessage(messagingInstance, callback);
};
```

### 3.2 `public/firebase-messaging-sw.js`

```javascript
// Firebase Service Worker for Background Notifications
// MoocaFisio

importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Initialize Firebase in the service worker
firebase.initializeApp({
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
});

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('Background message received:', payload);

  const notificationTitle = payload.notification?.title || 'MoocaFisio';
  const notificationOptions = {
    body: payload.notification?.body || '',
    icon: '/logo.png',
    badge: '/badge.png',
    data: payload.data,
    tag: payload.data?.tag || 'default',
    requireInteraction: true,
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);
  event.notification.close();

  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Check if there's already a window open
        for (const client of clientList) {
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus();
          }
        }
        // Open new window
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});
```

**⚠️ IMPORTANTE:** Substitua `YOUR_API_KEY`, etc. pelas suas credenciais do Firebase.

### 3.3 `services/push/PushNotificationService.ts`

```typescript
/**
 * Push Notification Service
 * MoocaFisio - Gerenciamento de notificações push
 */

import { supabase } from '../supabase/client';
import {
  requestNotificationPermission,
  getFCMToken,
  onForegroundMessage,
} from './firebaseConfig';

export interface PushNotificationToken {
  id?: string;
  user_id: string;
  token: string;
  device_type?: string;
  browser?: string;
  os?: string;
  enabled: boolean;
  created_at?: string;
  updated_at?: string;
}

class PushNotificationService {
  private unsubscribeForeground: (() => void) | null = null;

  /**
   * Initialize push notifications for current user
   */
  async initialize(userId: string): Promise<boolean> {
    try {
      const token = await requestNotificationPermission();
      if (!token) {
        console.warn('Failed to get FCM token');
        return false;
      }

      // Save token to Supabase
      await this.saveToken(userId, token);

      // Setup foreground message listener
      this.setupForegroundListener();

      return true;
    } catch (error) {
      console.error('Error initializing push notifications:', error);
      return false;
    }
  }

  /**
   * Save FCM token to Supabase
   */
  async saveToken(userId: string, token: string): Promise<void> {
    try {
      const deviceInfo = this.getDeviceInfo();

      const { error } = await supabase
        .from('push_notification_tokens')
        .upsert(
          {
            user_id: userId,
            token,
            ...deviceInfo,
            enabled: true,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'token' }
        );

      if (error) throw error;

      console.log('FCM token saved successfully');
    } catch (error) {
      console.error('Error saving FCM token:', error);
      throw error;
    }
  }

  /**
   * Remove FCM token from Supabase
   */
  async removeToken(token: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('push_notification_tokens')
        .delete()
        .eq('token', token);

      if (error) throw error;

      console.log('FCM token removed successfully');
    } catch (error) {
      console.error('Error removing FCM token:', error);
      throw error;
    }
  }

  /**
   * Disable notifications for user
   */
  async disableNotifications(userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('push_notification_tokens')
        .update({ enabled: false })
        .eq('user_id', userId);

      if (error) throw error;

      console.log('Notifications disabled');
    } catch (error) {
      console.error('Error disabling notifications:', error);
      throw error;
    }
  }

  /**
   * Enable notifications for user
   */
  async enableNotifications(userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('push_notification_tokens')
        .update({ enabled: true })
        .eq('user_id', userId);

      if (error) throw error;

      console.log('Notifications enabled');
    } catch (error) {
      console.error('Error enabling notifications:', error);
      throw error;
    }
  }

  /**
   * Get user's notification tokens
   */
  async getUserTokens(userId: string): Promise<PushNotificationToken[]> {
    try {
      const { data, error } = await supabase
        .from('push_notification_tokens')
        .select('*')
        .eq('user_id', userId)
        .eq('enabled', true);

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error getting user tokens:', error);
      return [];
    }
  }

  /**
   * Setup listener for foreground messages
   */
  private setupForegroundListener(): void {
    if (this.unsubscribeForeground) {
      this.unsubscribeForeground();
    }

    this.unsubscribeForeground = onForegroundMessage((payload) => {
      console.log('Foreground message received:', payload);

      // Show notification
      if (payload.notification) {
        this.showNotification(
          payload.notification.title || 'MoocaFisio',
          {
            body: payload.notification.body,
            icon: '/logo.png',
            data: payload.data,
          }
        );
      }
    });
  }

  /**
   * Show browser notification
   */
  private showNotification(title: string, options?: NotificationOptions): void {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, options);
    }
  }

  /**
   * Get device information
   */
  private getDeviceInfo(): {
    device_type: string;
    browser: string;
    os: string;
  } {
    const ua = navigator.userAgent;

    return {
      device_type: /Mobile|Android|iPhone/i.test(ua) ? 'mobile' : 'desktop',
      browser: this.getBrowser(),
      os: this.getOS(),
    };
  }

  private getBrowser(): string {
    const ua = navigator.userAgent;
    if (ua.includes('Chrome')) return 'Chrome';
    if (ua.includes('Firefox')) return 'Firefox';
    if (ua.includes('Safari')) return 'Safari';
    if (ua.includes('Edge')) return 'Edge';
    return 'Unknown';
  }

  private getOS(): string {
    const ua = navigator.userAgent;
    if (ua.includes('Win')) return 'Windows';
    if (ua.includes('Mac')) return 'MacOS';
    if (ua.includes('Linux')) return 'Linux';
    if (ua.includes('Android')) return 'Android';
    if (ua.includes('iOS')) return 'iOS';
    return 'Unknown';
  }

  /**
   * Cleanup
   */
  cleanup(): void {
    if (this.unsubscribeForeground) {
      this.unsubscribeForeground();
      this.unsubscribeForeground = null;
    }
  }
}

export const pushNotificationService = new PushNotificationService();
```

---

## PASSO 4: Migration do Supabase

### 4.1 Criar Migration

Crie o arquivo: `supabase/migrations/20251104000003_create_push_notification_tokens.sql`

```sql
-- Migration: Push Notification Tokens Table
-- MoocaFisio - Sistema de Notificações Push

CREATE TABLE IF NOT EXISTS public.push_notification_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  device_type TEXT CHECK (device_type IN ('mobile', 'desktop')),
  browser TEXT,
  os TEXT,
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  last_used_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_push_tokens_user_id ON public.push_notification_tokens(user_id);
CREATE INDEX idx_push_tokens_enabled ON public.push_notification_tokens(enabled) WHERE enabled = true;
CREATE INDEX idx_push_tokens_token ON public.push_notification_tokens(token);

-- RLS Policies
ALTER TABLE public.push_notification_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own tokens"
  ON public.push_notification_tokens
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tokens"
  ON public.push_notification_tokens
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tokens"
  ON public.push_notification_tokens
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tokens"
  ON public.push_notification_tokens
  FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_push_tokens_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER push_tokens_updated_at
  BEFORE UPDATE ON public.push_notification_tokens
  FOR EACH ROW
  EXECUTE FUNCTION update_push_tokens_updated_at();

-- Comments
COMMENT ON TABLE public.push_notification_tokens IS 'Armazena tokens FCM para push notifications';
COMMENT ON COLUMN public.push_notification_tokens.token IS 'Firebase Cloud Messaging token';
COMMENT ON COLUMN public.push_notification_tokens.enabled IS 'Se o usuário quer receber notificações';
```

### 4.2 Aplicar Migration via MCP

Use o MCP tool do Supabase:

```typescript
// Via Claude Code MCP
mcp__supabase__apply_migration({
  project_id: 'seu-project-id',
  name: '20251104000003_create_push_notification_tokens',
  query: '... conteúdo do SQL acima ...'
})
```

---

## PASSO 5: Supabase Edge Function

### 5.1 Criar Edge Function

Crie `supabase/functions/send-push-notification/index.ts`:

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface PushNotificationRequest {
  userId?: string;
  userIds?: string[];
  title: string;
  body: string;
  data?: Record<string, any>;
  url?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { userId, userIds, title, body, data, url }: PushNotificationRequest = await req.json()

    // Initialize Supabase
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get FCM tokens
    let query = supabaseClient
      .from('push_notification_tokens')
      .select('token')
      .eq('enabled', true)

    if (userId) {
      query = query.eq('user_id', userId)
    } else if (userIds && userIds.length > 0) {
      query = query.in('user_id', userIds)
    }

    const { data: tokens, error } = await query

    if (error) throw error

    if (!tokens || tokens.length === 0) {
      return new Response(
        JSON.stringify({ success: true, sent: 0, message: 'No tokens found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      )
    }

    // Send via FCM
    const fcmServerKey = Deno.env.get('FCM_SERVER_KEY')
    if (!fcmServerKey) {
      throw new Error('FCM_SERVER_KEY not configured')
    }

    const promises = tokens.map(async ({ token }) => {
      const response = await fetch('https://fcm.googleapis.com/fcm/send', {
        method: 'POST',
        headers: {
          'Authorization': `key=${fcmServerKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: token,
          notification: {
            title,
            body,
            icon: '/logo.png',
            click_action: url || '/',
          },
          data: data || {},
        }),
      })

      return response.json()
    })

    const results = await Promise.all(promises)

    return new Response(
      JSON.stringify({
        success: true,
        sent: results.length,
        results
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
```

### 5.2 Deploy Edge Function

```bash
# Via Supabase CLI
supabase functions deploy send-push-notification

# Configurar secrets
supabase secrets set FCM_SERVER_KEY=AAAA...
```

**⚠️ Para obter FCM_SERVER_KEY:**
1. Firebase Console → Project Settings → Cloud Messaging
2. Copie o "Server key" (Legacy)

---

## PASSO 6: Componentes React

### 6.1 Hook `hooks/usePushNotifications.ts`

```typescript
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { pushNotificationService } from '../services/push/PushNotificationService';

export const usePushNotifications = () => {
  const { user } = useAuth();
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    setIsSupported('Notification' in window);
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async () => {
    if (!user) return false;

    try {
      const success = await pushNotificationService.initialize(user.id);
      if (success) {
        setPermission('granted');
        setIsInitialized(true);
      }
      return success;
    } catch (error) {
      console.error('Error requesting permission:', error);
      return false;
    }
  };

  const disable = async () => {
    if (!user) return;
    await pushNotificationService.disableNotifications(user.id);
  };

  const enable = async () => {
    if (!user) return;
    await pushNotificationService.enableNotifications(user.id);
  };

  return {
    isSupported,
    permission,
    isInitialized,
    requestPermission,
    disable,
    enable,
  };
};
```

### 6.2 Componente `components/notifications/NotificationPermissionPrompt.tsx`

```typescript
import React from 'react';
import { Bell, BellOff } from 'lucide-react';
import { usePushNotifications } from '../../hooks/usePushNotifications';

export const NotificationPermissionPrompt: React.FC = () => {
  const { isSupported, permission, requestPermission } = usePushNotifications();

  if (!isSupported) {
    return null;
  }

  if (permission === 'granted') {
    return null;
  }

  if (permission === 'denied') {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <BellOff className="w-5 h-5 text-red-600 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-semibold text-red-900">Notificações Bloqueadas</h3>
            <p className="text-sm text-red-700 mt-1">
              Você bloqueou as notificações. Para reativar, acesse as configurações do navegador.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <Bell className="w-5 h-5 text-blue-600 mt-0.5" />
        <div className="flex-1">
          <h3 className="font-semibold text-blue-900">Ative as Notificações</h3>
          <p className="text-sm text-blue-700 mt-1">
            Receba lembretes de consultas e atualizações importantes diretamente no seu navegador.
          </p>
          <button
            onClick={requestPermission}
            className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            Ativar Notificações
          </button>
        </div>
      </div>
    </div>
  );
};
```

---

## PASSO 7: Integração no App

### 7.1 Atualizar `vite.config.ts`

Adicione configuração do service worker:

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // ... outras configs
  build: {
    rollupOptions: {
      input: {
        main: './index.html',
        sw: './public/firebase-messaging-sw.js'
      }
    }
  }
})
```

### 7.2 Registrar Service Worker em `main.tsx`

```typescript
// Registrar service worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .register('/firebase-messaging-sw.js')
    .then((registration) => {
      console.log('Service Worker registered:', registration);
    })
    .catch((error) => {
      console.error('Service Worker registration failed:', error);
    });
}
```

### 7.3 Adicionar Prompt no Dashboard

```typescript
// Em DashboardPage.tsx ou similar
import { NotificationPermissionPrompt } from '../components/notifications/NotificationPermissionPrompt';

export const DashboardPage = () => {
  return (
    <div>
      <NotificationPermissionPrompt />
      {/* resto do conteúdo */}
    </div>
  );
};
```

---

## PASSO 8: Testar

### 8.1 Teste Local

1. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

2. Abra o navegador em `http://localhost:5173`

3. Clique em "Ativar Notificações"

4. Aceite a permissão quando solicitado

5. Verifique o console para ver o FCM token

### 8.2 Teste de Envio via Supabase Edge Function

```bash
curl -X POST https://seu-projeto.supabase.co/functions/v1/send-push-notification \
  -H "Authorization: Bearer SEU_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "uuid-do-usuario",
    "title": "Teste de Notificação",
    "body": "Esta é uma notificação de teste!",
    "url": "/agenda"
  }'
```

### 8.3 Teste via Firebase Console

1. Firebase Console → Cloud Messaging
2. Clique em "Send your first message"
3. Cole o FCM token obtido
4. Envie a notificação

---

## 📝 CHECKLIST FINAL

- [ ] Projeto Firebase criado
- [ ] Cloud Messaging ativado
- [ ] VAPID key gerada
- [ ] Variáveis de ambiente configuradas
- [ ] `firebaseConfig.ts` criado
- [ ] `firebase-messaging-sw.js` criado
- [ ] `PushNotificationService.ts` criado
- [ ] Migration aplicada no Supabase
- [ ] Edge Function criada e deployed
- [ ] Hook `usePushNotifications` criado
- [ ] Componente `NotificationPermissionPrompt` criado
- [ ] Service Worker registrado
- [ ] Testes realizados com sucesso

---

## 🚀 PRÓXIMOS PASSOS

Após implementação completa:

1. **Dia 4:** WhatsApp Integration
2. **Dia 5:** Notification Center UI
3. **Semana 4:** Performance & Bundle Optimization

---

## 📚 RECURSOS

- [Firebase Cloud Messaging Docs](https://firebase.google.com/docs/cloud-messaging/js/client)
- [Web Push Protocol](https://developer.mozilla.org/en-US/docs/Web/API/Push_API)
- [Service Workers API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)

---

**✅ Guia criado com sucesso! Siga os passos na ordem para implementação completa.**
