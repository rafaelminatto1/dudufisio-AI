// =====================================================
// MERCADO PAGO WEBHOOK HANDLER
// Processa eventos de webhook do Mercado Pago
// =====================================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const MERCADOPAGO_API = 'https://api.mercadopago.com'

serve(async (req) => {
  try {
    const body = await req.json()

    console.log('Mercado Pago webhook received:', body)

    // Mercado Pago envia notificações em formato específico
    const { action, data, type } = body

    // Apenas processar eventos de pagamento
    if (type !== 'payment' && action !== 'payment.updated' && action !== 'payment.created') {
      console.log(`Ignoring event type: ${type}, action: ${action}`)
      return new Response(
        JSON.stringify({ received: true }),
        { headers: { 'Content-Type': 'application/json' }, status: 200 }
      )
    }

    const paymentId = data?.id
    if (!paymentId) {
      throw new Error('No payment ID in webhook')
    }

    // Inicializar Supabase
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Buscar informações do pagamento no Mercado Pago
    const accessToken = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN')
    const mpResponse = await fetch(`${MERCADOPAGO_API}/v1/payments/${paymentId}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    })

    if (!mpResponse.ok) {
      throw new Error('Failed to fetch payment from Mercado Pago')
    }

    const mpPayment = await mpResponse.json()

    // Buscar pagamento no nosso banco
    const { data: payment } = await supabaseClient
      .from('payments')
      .select('*')
      .eq('provider_payment_id', paymentId.toString())
      .single()

    if (!payment) {
      console.log(`Payment ${paymentId} not found in database`)
      return new Response(
        JSON.stringify({ received: true }),
        { headers: { 'Content-Type': 'application/json' }, status: 200 }
      )
    }

    // Mapear status do Mercado Pago para nosso sistema
    let newStatus = payment.status
    let shouldNotify = false

    switch (mpPayment.status) {
      case 'approved':
        newStatus = 'succeeded'
        shouldNotify = true
        break

      case 'rejected':
      case 'cancelled':
        newStatus = 'failed'
        shouldNotify = true
        break

      case 'in_process':
        newStatus = 'processing'
        break

      case 'pending':
        newStatus = 'pending'
        break

      case 'refunded':
        newStatus = 'refunded'
        shouldNotify = true
        break

      case 'charged_back':
        newStatus = 'refunded'
        shouldNotify = true
        break
    }

    // Atualizar status se mudou
    if (newStatus !== payment.status) {
      await supabaseClient.rpc('update_payment_status', {
        p_payment_id: payment.id,
        p_status: newStatus,
        p_provider_response: mpPayment
      })

      console.log(`Payment ${payment.id} status updated: ${payment.status} → ${newStatus}`)

      // Enviar notificação ao paciente
      if (shouldNotify) {
        let title = ''
        let message = ''
        let notificationType = 'payment_received'

        if (newStatus === 'succeeded') {
          title = 'Pagamento Confirmado'
          message = `Seu pagamento de R$ ${payment.amount.toFixed(2)} foi confirmado!`
          notificationType = 'payment_received'
        } else if (newStatus === 'failed') {
          title = 'Pagamento Falhou'
          message = 'Não foi possível processar seu pagamento. Por favor, tente novamente.'
          notificationType = 'payment_due'
        } else if (newStatus === 'refunded') {
          title = 'Reembolso Processado'
          message = `Seu reembolso de R$ ${payment.amount.toFixed(2)} foi processado.`
          notificationType = 'payment_received'
        }

        await supabaseClient.rpc('create_notification', {
          p_user_id: payment.patient_id,
          p_type: notificationType,
          p_title: title,
          p_message: message,
          p_data: { payment_id: payment.id },
          p_channels: ['in_app', 'email']
        })
      }
    }

    // Log do evento
    await supabaseClient
      .from('payment_transactions')
      .insert({
        payment_id: payment.id,
        event_type: 'webhook_received',
        provider_event_id: paymentId.toString(),
        provider_response: mpPayment,
        status: mpPayment.status
      })

    return new Response(
      JSON.stringify({ received: true }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Webhook error:', error)

    return new Response(
      JSON.stringify({
        error: error.message
      }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
