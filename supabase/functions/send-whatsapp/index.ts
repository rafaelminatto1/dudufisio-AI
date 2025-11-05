/**
 * Supabase Edge Function: Send WhatsApp Message
 * MoocaFisio - Envia mensagens via Meta WhatsApp Business API
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface WhatsAppMessageRequest {
  patientId?: string;
  patientIds?: string[];
  phoneNumber?: string;
  type: 'text' | 'template';
  message?: string;
  templateName?: string;
  templateVariables?: string[];
  languageCode?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const {
      patientId,
      patientIds,
      phoneNumber,
      type,
      message,
      templateName,
      templateVariables = [],
      languageCode = 'pt_BR'
    }: WhatsAppMessageRequest = await req.json()

    // Validações
    if (!type) {
      return new Response(
        JSON.stringify({ error: 'Type is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    if (type === 'text' && !message) {
      return new Response(
        JSON.stringify({ error: 'Message is required for text type' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    if (type === 'template' && !templateName) {
      return new Response(
        JSON.stringify({ error: 'Template name is required for template type' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // WhatsApp config from environment
    const whatsappApiUrl = Deno.env.get('WHATSAPP_API_URL')
    const phoneNumberId = Deno.env.get('WHATSAPP_PHONE_NUMBER_ID')
    const accessToken = Deno.env.get('WHATSAPP_ACCESS_TOKEN')

    if (!whatsappApiUrl || !phoneNumberId || !accessToken) {
      throw new Error('WhatsApp configuration missing')
    }

    // Conectar ao Supabase
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Buscar pacientes com opt-in ativo
    let query = supabaseClient
      .from('whatsapp_preferences')
      .select('patient_id, phone_number')
      .eq('opted_in', true)

    if (phoneNumber) {
      // Envio direto para número
      query = query.eq('phone_number', phoneNumber)
    } else if (patientId) {
      query = query.eq('patient_id', patientId)
    } else if (patientIds && patientIds.length > 0) {
      query = query.in('patient_id', patientIds)
    } else {
      return new Response(
        JSON.stringify({ error: 'patientId, patientIds, or phoneNumber is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    const { data: preferences, error: prefsError } = await query

    if (prefsError) throw new Error(`Failed to fetch preferences: ${prefsError.message}`)

    if (!preferences || preferences.length === 0) {
      return new Response(
        JSON.stringify({ success: true, sent: 0, message: 'No opted-in recipients found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      )
    }

    // Enviar mensagens
    const promises = preferences.map(async ({ patient_id, phone_number }) => {
      try {
        // Normalizar número (adicionar +55 se necessário)
        const normalizedPhone = phone_number.replace(/\D/g, '')
        const to = normalizedPhone.startsWith('55') ? normalizedPhone : `55${normalizedPhone}`

        // Construir payload
        let payload: any = {
          messaging_product: 'whatsapp',
          to,
        }

        if (type === 'text') {
          payload.type = 'text'
          payload.text = { body: message }
        } else if (type === 'template') {
          payload.type = 'template'
          payload.template = {
            name: templateName,
            language: { code: languageCode },
          }

          if (templateVariables.length > 0) {
            payload.template.components = [
              {
                type: 'body',
                parameters: templateVariables.map(v => ({
                  type: 'text',
                  text: v
                }))
              }
            ]
          }
        }

        // Enviar via Meta API
        const response = await fetch(
          `${whatsappApiUrl}/${phoneNumberId}/messages`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
          }
        )

        const result = await response.json()

        // Log no banco
        await supabaseClient.from('whatsapp_messages_log').insert({
          patient_id,
          phone_number: to,
          message_type: type,
          template_id: type === 'template' ? templateName : null,
          message_content: type === 'text' ? message : JSON.stringify(payload),
          status: response.ok ? 'sent' : 'failed',
          whatsapp_message_id: result.messages?.[0]?.id,
          error_message: response.ok ? null : result.error?.message,
          sent_at: response.ok ? new Date().toISOString() : null,
        })

        return {
          patient_id,
          phone_number: to,
          success: response.ok,
          whatsapp_message_id: result.messages?.[0]?.id,
          error: response.ok ? null : result.error?.message
        }
      } catch (error) {
        return { patient_id, phone_number, success: false, error: error.message }
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
    console.error('Error sending WhatsApp:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
