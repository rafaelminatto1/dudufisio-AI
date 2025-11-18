'use server';

import { z } from 'zod';
import { StripeService } from '~/lib/services/financial/stripeService';
import { TransactionService } from '~/lib/services/financial/transactionService';
import { createServerActionClient } from '~/lib/supabase/server';

const CreateCheckoutSchema = z.object({
  amount: z.number().positive(),
  patientId: z.string().uuid(),
  description: z.string().optional(),
  transactionId: z.string().uuid().optional(),
});

export async function createCheckout(
  input: z.infer<typeof CreateCheckoutSchema>
) {
  try {
    const supabase = await createServerActionClient();
    const {
      data: { session: authSession },
    } = await supabase.auth.getSession();

    if (!authSession) {
      return { error: 'Unauthorized' };
    }

    const validatedInput = CreateCheckoutSchema.safeParse(input);

    if (!validatedInput.success) {
      return { error: 'Invalid input', details: validatedInput.error.issues };
    }

    const { amount, patientId, description, transactionId } = validatedInput.data;

    // Criar transação pendente se não existir
    let transId = transactionId;
    if (!transId) {
      const transResult = await TransactionService.create({
        patient_id: patientId,
        transaction_type: 'receita',
        amount: amount.toString(),
        payment_status: 'pendente',
        description: description || 'Pagamento via Stripe',
      });

      if (transResult.error || !transResult.data) {
        return { error: 'Failed to create transaction' };
      }

      transId = transResult.data.id;
    }

    // Criar checkout session
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const sessionResult = await StripeService.createCheckoutSession({
      priceAmount: Math.round(amount * 100), // Converter para centavos
      successUrl: `${baseUrl}/dashboard/financeiro?success=true&transaction_id=${transId}`,
      cancelUrl: `${baseUrl}/dashboard/financeiro?canceled=true`,
      metadata: {
        transaction_id: transId,
        patient_id: patientId,
      },
    });

    if (sessionResult.error || !sessionResult.data) {
      return { error: 'Failed to create checkout session' };
    }

    // Atualizar transação com metadata do Stripe
    await supabase
      .from('financial_transactions')
      .update({
        external_payment_id: sessionResult.data.id,
      })
      .eq('id', transId);

    return {
      sessionId: sessionResult.data.id,
      url: sessionResult.data.url,
    };
  } catch (error) {
    console.error('Error creating checkout:', error);
    return { error: 'Internal server error' };
  }
}
