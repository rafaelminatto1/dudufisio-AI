import Stripe from 'stripe';
import { TransactionService } from './transactionService';
import { createServerComponentClient } from '~/lib/supabase/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-10-29.clover',
});

export class StripeService {
  static async createPaymentIntent(params: {
    amount: number;
    currency?: string;
    customerId?: string;
  }) {
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: params.amount,
        currency: params.currency || 'brl',
        customer: params.customerId,
        automatic_payment_methods: { enabled: true },
      });
      return { data: paymentIntent, error: null };
    } catch (error) {
      console.error('Error creating payment intent:', error);
      return { data: null, error };
    }
  }

  static async createCheckoutSession(params: {
    priceAmount: number;
    successUrl: string;
    cancelUrl: string;
    metadata?: Record<string, string>;
  }) {
    try {
      const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        line_items: [{
          price_data: {
            currency: 'brl',
            unit_amount: params.priceAmount,
            product_data: { name: 'Pagamento FisioFlow' },
          },
          quantity: 1,
        }],
        success_url: params.successUrl,
        cancel_url: params.cancelUrl,
        metadata: params.metadata || {},
      });
      return { data: session, error: null };
    } catch (error) {
      console.error('Error creating checkout session:', error);
      return { data: null, error };
    }
  }

  static async handleWebhook(payload: string, signature: string) {
    try {
      const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';
      const event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
      
      await this.processStripeEvent(event);
      
      return { success: true, error: null };
    } catch (error) {
      console.error('Error handling webhook:', error);
      return { success: false, error };
    }
  }

  static async processStripeEvent(event: Stripe.Event) {
    const supabase = await createServerComponentClient();

    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        
        // Buscar metadata para identificar a transação
        const transactionId = paymentIntent.metadata?.transaction_id;
        const patientId = paymentIntent.metadata?.patient_id;

        if (transactionId) {
          // Atualizar transação existente
          await supabase
            .from('payment_transactions')
            .update({
              status: 'pago',
              provider_event_id: paymentIntent.id,
            })
            .eq('id', transactionId);
        } else if (patientId) {
          // Criar nova transação
          await TransactionService.create({
            patient_id: patientId,
            event_type: 'receita',
            amount: (paymentIntent.amount / 100),
            status: 'pago',
            provider_event_id: paymentIntent.id,
            description: paymentIntent.description || 'Pagamento via Stripe',
          });
        }
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const transactionId = paymentIntent.metadata?.transaction_id;

        if (transactionId) {
          await supabase
            .from('payment_transactions')
            .update({
              status: 'falhou',
              provider_event_id: paymentIntent.id,
            })
            .eq('id', transactionId);
        }
        break;
      }

      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const patientId = session.metadata?.patient_id;
        const transactionId = session.metadata?.transaction_id;

        if (transactionId) {
          await supabase
            .from('payment_transactions')
            .update({
              status: 'pago',
              provider_event_id: session.payment_intent as string,
            })
            .eq('id', transactionId);
        } else if (patientId && session.amount_total) {
          await TransactionService.create({
            patient_id: patientId,
            event_type: 'receita',
            amount: (session.amount_total / 100),
            status: 'pago',
            provider_event_id: session.payment_intent as string,
            description: 'Pagamento via Checkout Stripe',
          });
        }
        break;
      }
    }
  }
}

