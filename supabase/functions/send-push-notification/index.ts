/**
 * Supabase Edge Function: Send Push Notification
 * MoocaFisio - Envia notificações push via Firebase Cloud Messaging
 */

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
  icon?: string;
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

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

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

    const fcmServerKey = Deno.env.get('FCM_SERVER_KEY')
    if (!fcmServerKey) throw new Error('FCM_SERVER_KEY not configured')

    const promises = tokenData.map(async ({ token, user_id }) => {
      try {
        const response = await fetch('https://fcm.googleapis.com/fcm/send', {
          method: 'POST',
          headers: {
            'Authorization': `key=${fcmServerKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            to: token,
            notification: { title, body, icon: icon || '/logo.png', click_action: url || '/' },
            data: { ...data, url: url || '/', timestamp: new Date().toISOString() },
          }),
        })

        const result = await response.json()

        if (result.success === 1) {
          await supabaseClient
            .from('push_notification_tokens')
            .update({ last_used_at: new Date().toISOString() })
            .eq('token', token)
        }

        return { user_id, success: result.success === 1, error: result.results?.[0]?.error || null }
      } catch (error) {
        return { user_id, success: false, error: error.message }
      }
    })

    const results = await Promise.all(promises)
    const successCount = results.filter(r => r.success).length
    const failureCount = results.filter(r => !r.success).length

    return new Response(
      JSON.stringify({ success: true, sent: successCount, failed: failureCount, total: results.length, results }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
