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

/**
 * Get OAuth2 access token for FCM v1 API
 */
async function getAccessToken(): Promise<string> {
  const serviceAccount = JSON.parse(Deno.env.get('FIREBASE_SERVICE_ACCOUNT') ?? '{}')
  
  const jwtHeader = btoa(JSON.stringify({
    alg: 'RS256',
    typ: 'JWT',
  }))

  const now = Math.floor(Date.now() / 1000)
  const jwtClaimSet = btoa(JSON.stringify({
    iss: serviceAccount.client_email,
    scope: 'https://www.googleapis.com/auth/firebase.messaging',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now,
  }))

  const signatureInput = `${jwtHeader}.${jwtClaimSet}`
  
  // Import private key
  const privateKey = await crypto.subtle.importKey(
    'pkcs8',
    str2ab(atob(serviceAccount.private_key.replace(/-----BEGIN PRIVATE KEY-----|-----END PRIVATE KEY-----|\n/g, ''))),
    {
      name: 'RSASSA-PKCS1-v1_5',
      hash: 'SHA-256',
    },
    false,
    ['sign']
  )

  // Sign JWT
  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    privateKey,
    new TextEncoder().encode(signatureInput)
  )

  const jwt = `${signatureInput}.${btoa(String.fromCharCode(...new Uint8Array(signature))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')}`

  // Exchange JWT for access token
  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }).toString(),
  })

  const tokenData = await tokenResponse.json()
  return tokenData.access_token
}

function str2ab(str: string): ArrayBuffer {
  const buf = new ArrayBuffer(str.length)
  const bufView = new Uint8Array(buf)
  for (let i = 0; i < str.length; i++) {
    bufView[i] = str.charCodeAt(i)
  }
  return buf
}

/**
 * Send push notification via FCM v1 API
 */
async function sendFCMNotification(
  token: string,
  title: string,
  body: string,
  data?: Record<string, any>,
  url?: string
): Promise<any> {
  const accessToken = await getAccessToken()
  const projectId = JSON.parse(Deno.env.get('FIREBASE_SERVICE_ACCOUNT') ?? '{}').project_id

  const response = await fetch(
    `https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: {
          token,
          notification: {
            title,
            body,
          },
          data: {
            ...data,
            url: url || '/',
          },
          webpush: {
            fcm_options: {
              link: url || '/',
            },
            notification: {
              icon: '/logo.png',
              badge: '/badge.png',
              requireInteraction: true,
            },
          },
        },
      }),
    }
  )

  return response.json()
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { userId, userIds, title, body, data, url }: PushNotificationRequest = await req.json()

    // Validate input
    if (!title || !body) {
      throw new Error('Title and body are required')
    }

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
    } else {
      throw new Error('Either userId or userIds must be provided')
    }

    const { data: tokenData, error } = await query

    if (error) throw error

    if (!tokenData || tokenData.length === 0) {
      return new Response(
        JSON.stringify({ success: true, sent: 0, message: 'No tokens found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      )
    }

    // Send notifications
    const promises = tokenData.map(({ token }) =>
      sendFCMNotification(token, title, body, data, url)
        .catch((error) => ({ error: error.message, token }))
    )

    const results = await Promise.all(promises)

    const successCount = results.filter((r) => !r.error).length
    const failureCount = results.filter((r) => r.error).length

    return new Response(
      JSON.stringify({
        success: true,
        sent: successCount,
        failed: failureCount,
        total: results.length,
        results,
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

