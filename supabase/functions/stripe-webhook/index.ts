// =====================================================
// STRIPE WEBHOOK HANDLER
// Processa eventos de webhook do Stripe
// =====================================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@14.11.0?target=deno'

serve(async (req) => {
  try {
    const signature = req.headers.get('stripe-signature')
    if (!signature) {
      throw new Error('No signature provided')
    }

    // Inicializar Stripe
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
      httpClient: Stripe.createFetchHttpClient(),
    })

    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')
    if (!webhookSecret) {
      throw new Error('Webhook secret not configured')
    }

    // Verificar e construir evento
    const body = await req.text()
    const event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      webhookSecret
    )

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

    console.log(`Processing event: ${event.type}`)

    // =====================================================
    // PAYMENT INTENT SUCCEEDED
    // =====================================================
    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object as Stripe.PaymentIntent

      // Buscar pagamento
      const { data: payment } = await supabaseClient
        .from('payments')
        .select('*')
        .eq('provider_payment_id', paymentIntent.id)
        .single()

      if (payment) {
        // Atualizar status
        await supabaseClient.rpc('update_payment_status', {
          p_payment_id: payment.id,
          p_status: 'succeeded',
          p_provider_response: paymentIntent
        })

        // Enviar notificação ao paciente
        await supabaseClient.rpc('create_notification', {
          p_user_id: payment.patient_id,
          p_type: 'payment_received',
          p_title: 'Pagamento Confirmado',
          p_message: `Seu pagamento de R$ ${(payment.amount).toFixed(2)} foi confirmado!`,
          p_data: { payment_id: payment.id },
          p_channels: ['in_app', 'email']
        })

        console.log(`Payment ${payment.id} succeeded`)
      }
    }

    // =====================================================
    // PAYMENT INTENT FAILED
    // =====================================================
    if (event.type === 'payment_intent.payment_failed') {
      const paymentIntent = event.data.object as Stripe.PaymentIntent

      // Buscar pagamento
      const { data: payment } = await supabaseClient
        .from('payments')
        .select('*')
        .eq('provider_payment_id', paymentIntent.id)
        .single()

      if (payment) {
        // Atualizar status
        await supabaseClient.rpc('update_payment_status', {
          p_payment_id: payment.id,
          p_status: 'failed',
          p_provider_response: paymentIntent
        })

        // Enviar notificação ao paciente
        await supabaseClient.rpc('create_notification', {
          p_user_id: payment.patient_id,
          p_type: 'payment_due',
          p_title: 'Pagamento Falhou',
          p_message: `Não foi possível processar seu pagamento. Por favor, tente novamente.`,
          p_data: { payment_id: payment.id },
          p_channels: ['in_app', 'email']
        })

        console.log(`Payment ${payment.id} failed`)
      }
    }

    // =====================================================
    // PAYMENT INTENT CANCELED
    // =====================================================
    if (event.type === 'payment_intent.canceled') {
      const paymentIntent = event.data.object as Stripe.PaymentIntent

      const { data: payment } = await supabaseClient
        .from('payments')
        .select('*')
        .eq('provider_payment_id', paymentIntent.id)
        .single()

      if (payment) {
        await supabaseClient.rpc('update_payment_status', {
          p_payment_id: payment.id,
          p_status: 'canceled',
          p_provider_response: paymentIntent
        })

        console.log(`Payment ${payment.id} canceled`)
      }
    }

    // =====================================================
    // CHARGE REFUNDED
    // =====================================================
    if (event.type === 'charge.refunded') {
      const charge = event.data.object as Stripe.Charge

      // Buscar pagamento pelo payment_intent
      const { data: payment } = await supabaseClient
        .from('payments')
        .select('*')
        .eq('provider_payment_id', charge.payment_intent)
        .single()

      if (payment) {
        const refundAmount = charge.amount_refunded / 100 // Converter de centavos

        await supabaseClient.rpc('process_refund', {
          p_payment_id: payment.id,
          p_amount: refundAmount,
          p_reason: 'Refunded via Stripe'
        })

        // Notificar paciente
        await supabaseClient.rpc('create_notification', {
          p_user_id: payment.patient_id,
          p_type: 'payment_received',
          p_title: 'Reembolso Processado',
          p_message: `Seu reembolso de R$ ${refundAmount.toFixed(2)} foi processado.`,
          p_data: { payment_id: payment.id },
          p_channels: ['in_app', 'email']
        })

        console.log(`Payment ${payment.id} refunded: ${refundAmount}`)
      }
    }

    // Log todos os eventos
    await supabaseClient
      .from('payment_transactions')
      .insert({
        payment_id: null, // Pode não ter pagamento associado ainda
        event_type: 'webhook_received',
        provider_event_id: event.id,
        provider_response: event,
        status: event.type
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
