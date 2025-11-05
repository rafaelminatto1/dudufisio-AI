/**
 * Supabase Edge Function: Send Push Notification
 * MoocaFisio - Envia notificações push via Firebase Cloud Messaging v1 API
 * Usa Firebase Admin SDK (Service Account) - Método moderno e seguro
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { create, getNumericDate } from 'https://deno.land/x/djwt@v2.8/mod.ts'

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
  icon?: string;
}

interface ServiceAccount {
  type: string;
  project_id: string;
  private_key_id: string;
  private_key: string;
  client_email: string;
  client_id: string;
  auth_uri: string;
  token_uri: string;
  auth_provider_x509_cert_url: string;
  client_x509_cert_url: string;
}

/**
 * Cria um JWT assinado com a private key do service account
 */
async function createServiceAccountJWT(serviceAccount: ServiceAccount): Promise<string> {
  const now = Math.floor(Date.now() / 1000);

  const payload = {
    iss: serviceAccount.client_email,
    sub: serviceAccount.client_email,
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600, // 1 hora
    scope: 'https://www.googleapis.com/auth/firebase.messaging',
  };

  // Importar a private key
  const privateKey = await crypto.subtle.importKey(
    'pkcs8',
    pemToArrayBuffer(serviceAccount.private_key),
    {
      name: 'RSASSA-PKCS1-v1_5',
      hash: 'SHA-256',
    },
    false,
    ['sign']
  );

  // Criar JWT
  const jwt = await create(
    { alg: 'RS256', typ: 'JWT' },
    payload,
    privateKey
  );

  return jwt;
}

/**
 * Converte PEM string para ArrayBuffer
 */
function pemToArrayBuffer(pem: string): ArrayBuffer {
  const pemContents = pem
    .replace('-----BEGIN PRIVATE KEY-----', '')
    .replace('-----END PRIVATE KEY-----', '')
    .replace(/\s/g, '');

  const binaryString = atob(pemContents);
  const bytes = new Uint8Array(binaryString.length);

  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  return bytes.buffer;
}

/**
 * Obtém access token OAuth 2.0 do Google
 */
async function getAccessToken(serviceAccount: ServiceAccount): Promise<string> {
  const jwt = await createServiceAccountJWT(serviceAccount);

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }).toString(),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to get access token: ${error}`);
  }

  const data = await response.json();
  return data.access_token;
}

/**
 * Envia notificação usando FCM v1 API
 */
async function sendFCMNotification(
  accessToken: string,
  projectId: string,
  fcmToken: string,
  title: string,
  body: string,
  data?: Record<string, any>,
  url?: string,
  icon?: string
): Promise<{ success: boolean; error?: string }> {
  const message = {
    message: {
      token: fcmToken,
      notification: {
        title,
        body,
        image: icon,
      },
      webpush: {
        notification: {
          icon: icon || '/logo.png',
          click_action: url || '/',
        },
        fcm_options: {
          link: url || '/',
        },
        data: {
          ...data,
          url: url || '/',
          timestamp: new Date().toISOString(),
        },
      },
    },
  };

  const response = await fetch(
    `https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    return {
      success: false,
      error: error.error?.message || 'Unknown error'
    };
  }

  return { success: true };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { userId, userIds, title, body, data, url, icon }: PushNotificationRequest = await req.json()

    if (!title || !body) {
      return new Response(
        JSON.stringify({ error: 'Title and body are required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Parse service account do environment
    const serviceAccountJson = Deno.env.get('FIREBASE_SERVICE_ACCOUNT')
    if (!serviceAccountJson) {
      throw new Error('FIREBASE_SERVICE_ACCOUNT not configured')
    }

    const serviceAccount: ServiceAccount = JSON.parse(serviceAccountJson)

    // Obter access token OAuth
    const accessToken = await getAccessToken(serviceAccount)

    // Conectar ao Supabase
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Buscar tokens FCM
    let query = supabaseClient
      .from('push_notification_tokens')
      .select('token, user_id')
      .eq('enabled', true)

    if (userId) {
      query = query.eq('user_id', userId)
    } else if (userIds && userIds.length > 0) {
      query = query.in('user_id', userIds)
    }

    const { data: tokenData, error: tokenError } = await query

    if (tokenError) throw new Error(`Failed to fetch tokens: ${tokenError.message}`)

    if (!tokenData || tokenData.length === 0) {
      return new Response(
        JSON.stringify({ success: true, sent: 0, message: 'No tokens found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      )
    }

    // Enviar notificações
    const promises = tokenData.map(async ({ token, user_id }) => {
      try {
        const result = await sendFCMNotification(
          accessToken,
          serviceAccount.project_id,
          token,
          title,
          body,
          data,
          url,
          icon
        )

        if (result.success) {
          // Atualizar last_used_at
          await supabaseClient
            .from('push_notification_tokens')
            .update({ last_used_at: new Date().toISOString() })
            .eq('token', token)
        } else if (result.error?.includes('NotRegistered') || result.error?.includes('InvalidRegistration')) {
          // Remover token inválido
          await supabaseClient
            .from('push_notification_tokens')
            .delete()
            .eq('token', token)
        }

        return { user_id, success: result.success, error: result.error || null }
      } catch (error) {
        return { user_id, success: false, error: error.message }
      }
    })

    const results = await Promise.all(promises)
    const successCount = results.filter(r => r.success).length
    const failureCount = results.filter(r => !r.success).length

    return new Response(
      JSON.stringify({
        success: true,
        sent: successCount,
        failed: failureCount,
        total: results.length,
        results
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  } catch (error) {
    console.error('Error sending push notification:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
