// =====================================================
// MERCADO PAGO PAYMENT HANDLER
// Processa pagamentos via Mercado Pago (PIX, Boleto, Cartão)
// =====================================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const MERCADOPAGO_API = 'https://api.mercadopago.com'

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const accessToken = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN')
    if (!accessToken) {
      throw new Error('Mercado Pago access token not configured')
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

    const { action, ...data } = await req.json()

    // Helper para fazer requests ao Mercado Pago
    const mpRequest = async (endpoint: string, options: any = {}) => {
      const response = await fetch(`${MERCADOPAGO_API}${endpoint}`, {
        ...options,
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          ...options.headers
        }
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(`Mercado Pago API error: ${JSON.stringify(error)}`)
      }

      return response.json()
    }

    // =====================================================
    // CREATE PIX PAYMENT
    // =====================================================
    if (action === 'create_pix') {
      const {
        payment_id,
        amount,
        description,
        payer_email,
        payer_name,
        payer_cpf
      } = data

      // Criar pagamento PIX no Mercado Pago
      const mpPayment = await mpRequest('/v1/payments', {
        method: 'POST',
        body: JSON.stringify({
          transaction_amount: amount,
          description: description || 'Consulta DuduFisio',
          payment_method_id: 'pix',
          payer: {
            email: payer_email,
            first_name: payer_name?.split(' ')[0] || 'Cliente',
            last_name: payer_name?.split(' ').slice(1).join(' ') || 'DuduFisio',
            identification: {
              type: 'CPF',
              number: payer_cpf
            }
          },
          metadata: {
            payment_id,
            source: 'dudufisio-ai'
          }
        })
      })

      // Atualizar pagamento no Supabase
      await supabaseClient
        .from('payments')
        .update({
          provider: 'mercadopago',
          provider_payment_id: mpPayment.id.toString(),
          status: 'pending',
          pix_qr_code: mpPayment.point_of_interaction?.transaction_data?.qr_code,
          pix_qr_code_url: mpPayment.point_of_interaction?.transaction_data?.qr_code_base64,
          pix_expires_at: mpPayment.date_of_expiration
        })
        .eq('id', payment_id)

      // Log da transação
      await supabaseClient
        .from('payment_transactions')
        .insert({
          payment_id,
          event_type: 'payment_created',
          provider_event_id: mpPayment.id.toString(),
          provider_response: mpPayment,
          status: 'pending'
        })

      return new Response(
        JSON.stringify({
          success: true,
          payment_id: mpPayment.id,
          qr_code: mpPayment.point_of_interaction?.transaction_data?.qr_code,
          qr_code_base64: mpPayment.point_of_interaction?.transaction_data?.qr_code_base64,
          expires_at: mpPayment.date_of_expiration
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

    // =====================================================
    // CREATE BOLETO PAYMENT
    // =====================================================
    if (action === 'create_boleto') {
      const {
        payment_id,
        amount,
        description,
        payer_email,
        payer_name,
        payer_cpf,
        payer_address
      } = data

      // Data de vencimento (3 dias)
      const dueDate = new Date()
      dueDate.setDate(dueDate.getDate() + 3)

      // Criar pagamento Boleto no Mercado Pago
      const mpPayment = await mpRequest('/v1/payments', {
        method: 'POST',
        body: JSON.stringify({
          transaction_amount: amount,
          description: description || 'Consulta DuduFisio',
          payment_method_id: 'bolbradesco', // ou 'pec' para qualquer boleto
          payer: {
            email: payer_email,
            first_name: payer_name?.split(' ')[0] || 'Cliente',
            last_name: payer_name?.split(' ').slice(1).join(' ') || 'DuduFisio',
            identification: {
              type: 'CPF',
              number: payer_cpf
            },
            address: payer_address
          },
          date_of_expiration: dueDate.toISOString(),
          metadata: {
            payment_id,
            source: 'dudufisio-ai'
          }
        })
      })

      // Atualizar pagamento no Supabase
      await supabaseClient
        .from('payments')
        .update({
          provider: 'mercadopago',
          provider_payment_id: mpPayment.id.toString(),
          status: 'pending',
          boleto_url: mpPayment.transaction_details?.external_resource_url,
          boleto_barcode: mpPayment.barcode?.content,
          boleto_expires_at: dueDate.toISOString()
        })
        .eq('id', payment_id)

      // Log da transação
      await supabaseClient
        .from('payment_transactions')
        .insert({
          payment_id,
          event_type: 'payment_created',
          provider_event_id: mpPayment.id.toString(),
          provider_response: mpPayment,
          status: 'pending'
        })

      return new Response(
        JSON.stringify({
          success: true,
          payment_id: mpPayment.id,
          boleto_url: mpPayment.transaction_details?.external_resource_url,
          barcode: mpPayment.barcode?.content,
          expires_at: dueDate.toISOString()
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

    // =====================================================
    // CREATE CREDIT CARD PAYMENT
    // =====================================================
    if (action === 'create_card_payment') {
      const {
        payment_id,
        amount,
        token, // Token do cartão gerado pelo Mercado Pago.js
        installments = 1,
        description,
        payer_email
      } = data

      // Criar pagamento com cartão
      const mpPayment = await mpRequest('/v1/payments', {
        method: 'POST',
        body: JSON.stringify({
          transaction_amount: amount,
          token,
          description: description || 'Consulta DuduFisio',
          installments,
          payment_method_id: 'visa', // Será detectado pelo token
          payer: {
            email: payer_email
          },
          metadata: {
            payment_id,
            source: 'dudufisio-ai'
          }
        })
      })

      // Atualizar pagamento no Supabase
      let status = 'processing'
      if (mpPayment.status === 'approved') status = 'succeeded'
      else if (mpPayment.status === 'rejected') status = 'failed'

      await supabaseClient.rpc('update_payment_status', {
        p_payment_id: payment_id,
        p_status: status,
        p_provider_response: mpPayment
      })

      return new Response(
        JSON.stringify({
          success: true,
          payment_id: mpPayment.id,
          status: mpPayment.status,
          status_detail: mpPayment.status_detail
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

    // =====================================================
    // CHECK PAYMENT STATUS
    // =====================================================
    if (action === 'check_status') {
      const { mp_payment_id } = data

      // Buscar pagamento no Mercado Pago
      const mpPayment = await mpRequest(`/v1/payments/${mp_payment_id}`)

      // Buscar no Supabase
      const { data: payment } = await supabaseClient
        .from('payments')
        .select('*')
        .eq('provider_payment_id', mp_payment_id.toString())
        .single()

      if (!payment) {
        throw new Error('Payment not found')
      }

      // Mapear status do Mercado Pago para nosso status
      let newStatus = payment.status
      if (mpPayment.status === 'approved') {
        newStatus = 'succeeded'
      } else if (mpPayment.status === 'rejected' || mpPayment.status === 'cancelled') {
        newStatus = 'failed'
      } else if (mpPayment.status === 'in_process') {
        newStatus = 'processing'
      } else if (mpPayment.status === 'pending') {
        newStatus = 'pending'
      }

      // Atualizar se mudou
      if (newStatus !== payment.status) {
        await supabaseClient.rpc('update_payment_status', {
          p_payment_id: payment.id,
          p_status: newStatus,
          p_provider_response: mpPayment
        })
      }

      return new Response(
        JSON.stringify({
          success: true,
          status: newStatus,
          mp_status: mpPayment.status,
          mp_status_detail: mpPayment.status_detail
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

    // =====================================================
    // REFUND
    // =====================================================
    if (action === 'refund') {
      const { payment_id, amount } = data

      // Buscar pagamento
      const { data: payment } = await supabaseClient
        .from('payments')
        .select('*')
        .eq('id', payment_id)
        .single()

      if (!payment || !payment.provider_payment_id) {
        throw new Error('Payment not found')
      }

      // Criar reembolso no Mercado Pago
      const refund = await mpRequest(`/v1/payments/${payment.provider_payment_id}/refunds`, {
        method: 'POST',
        body: JSON.stringify({
          amount: amount || undefined // undefined = reembolso total
        })
      })

      // Processar reembolso via função RPC
      await supabaseClient.rpc('process_refund', {
        p_payment_id: payment_id,
        p_amount: amount,
        p_reason: 'Reembolso solicitado'
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
