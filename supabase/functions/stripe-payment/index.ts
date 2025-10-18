// =====================================================
// STRIPE PAYMENT HANDLER
// Processa pagamentos via Stripe
// =====================================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@14.11.0?target=deno'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Inicializar Stripe
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
      httpClient: Stripe.createFetchHttpClient(),
    })

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

    const { action, ...data } = await req.json()

    // =====================================================
    // CREATE PAYMENT INTENT
    // =====================================================
    if (action === 'create_payment_intent') {
      const { amount, currency = 'usd', payment_id, customer_email } = data

      // Criar Payment Intent no Stripe
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Converter para centavos
        currency: currency.toLowerCase(),
        metadata: {
          payment_id,
          source: 'dudufisio-ai'
        },
        receipt_email: customer_email,
        automatic_payment_methods: {
          enabled: true,
        },
      })

      // Atualizar pagamento no Supabase
      await supabaseClient
        .from('payments')
        .update({
          provider: 'stripe',
          provider_payment_id: paymentIntent.id,
          status: 'processing'
        })
        .eq('id', payment_id)

      // Log da transação
      await supabaseClient
        .from('payment_transactions')
        .insert({
          payment_id,
          event_type: 'payment_processing',
          provider_event_id: paymentIntent.id,
          provider_response: paymentIntent,
          status: 'processing'
        })

      return new Response(
        JSON.stringify({
          success: true,
          client_secret: paymentIntent.client_secret,
          payment_intent_id: paymentIntent.id
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

    // =====================================================
    // CONFIRM PAYMENT
    // =====================================================
    if (action === 'confirm_payment') {
      const { payment_intent_id } = data

      // Buscar Payment Intent
      const paymentIntent = await stripe.paymentIntents.retrieve(payment_intent_id)

      // Buscar pagamento no Supabase
      const { data: payment } = await supabaseClient
        .from('payments')
        .select('*')
        .eq('provider_payment_id', payment_intent_id)
        .single()

      if (!payment) {
        throw new Error('Payment not found')
      }

      // Atualizar status baseado no Payment Intent
      let newStatus = 'processing'
      if (paymentIntent.status === 'succeeded') {
        newStatus = 'succeeded'
      } else if (paymentIntent.status === 'canceled' || paymentIntent.status === 'failed') {
        newStatus = 'failed'
      }

      // Atualizar via função RPC
      await supabaseClient.rpc('update_payment_status', {
        p_payment_id: payment.id,
        p_status: newStatus,
        p_provider_response: paymentIntent
      })

      return new Response(
        JSON.stringify({
          success: true,
          status: newStatus,
          payment_intent: paymentIntent
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

    // =====================================================
    // REFUND PAYMENT
    // =====================================================
    if (action === 'refund') {
      const { payment_id, amount, reason } = data

      // Buscar pagamento
      const { data: payment } = await supabaseClient
        .from('payments')
        .select('*')
        .eq('id', payment_id)
        .single()

      if (!payment || !payment.provider_payment_id) {
        throw new Error('Payment not found')
      }

      // Criar reembolso no Stripe
      const refund = await stripe.refunds.create({
        payment_intent: payment.provider_payment_id,
        amount: amount ? Math.round(amount * 100) : undefined,
        reason: reason || 'requested_by_customer',
        metadata: {
          payment_id,
          source: 'dudufisio-ai'
        }
      })

      // Processar reembolso via função RPC
      await supabaseClient.rpc('process_refund', {
        p_payment_id: payment_id,
        p_amount: amount,
        p_reason: reason
      })

      return new Response(
        JSON.stringify({
          success: true,
          refund
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

    // =====================================================
    // CREATE CUSTOMER
    // =====================================================
    if (action === 'create_customer') {
      const { email, name, patient_id } = data

      const customer = await stripe.customers.create({
        email,
        name,
        metadata: {
          patient_id,
          source: 'dudufisio-ai'
        }
      })

      // Salvar customer ID no usuário
      await supabaseClient
        .from('users')
        .update({
          metadata: {
            stripe_customer_id: customer.id
          }
        })
        .eq('id', patient_id)

      return new Response(
        JSON.stringify({
          success: true,
          customer_id: customer.id
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

    // Ação não reconhecida
    throw new Error(`Unknown action: ${action}`)

  } catch (error) {
    console.error('Error:', error)

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
