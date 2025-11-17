import { NextRequest, NextResponse } from 'next/server';
import { StripeService } from '~/lib/services/financial/stripeService';
import { TransactionService } from '~/lib/services/financial/transactionService';
import { createServerComponentClient } from '~/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerComponentClient();
    const {
      data: { session: authSession },
    } = await supabase.auth.getSession();

    if (!authSession) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { amount, patientId, description, transactionId } = body;

    if (!amount || !patientId) {
      return NextResponse.json(
        { error: 'Amount and patientId are required' },
        { status: 400 }
      );
    }

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
        return NextResponse.json(
          { error: 'Failed to create transaction' },
          { status: 500 }
        );
      }

      transId = transResult.data.id;
    }

    // Criar checkout session
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const sessionResult = await StripeService.createCheckoutSession({
      priceAmount: Math.round(Number(amount) * 100), // Converter para centavos
      successUrl: `${baseUrl}/dashboard/financeiro?success=true&transaction_id=${transId}`,
      cancelUrl: `${baseUrl}/dashboard/financeiro?canceled=true`,
      metadata: {
        transaction_id: transId,
        patient_id: patientId,
      },
    });

    if (sessionResult.error || !sessionResult.data) {
      return NextResponse.json(
        { error: 'Failed to create checkout session' },
        { status: 500 }
      );
    }

    // Atualizar transação com metadata do Stripe
    await supabase
      .from('financial_transactions')
      .update({
        external_payment_id: sessionResult.data.id,
      })
      .eq('id', transId);

    return NextResponse.json({
      sessionId: sessionResult.data.id,
      url: sessionResult.data.url,
    });
  } catch (error) {
    console.error('Error creating checkout:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

