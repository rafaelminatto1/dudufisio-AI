import { NextRequest, NextResponse } from 'next/server';
import { StripeService } from '~/lib/services/financial/stripeService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      console.warn('[StripeWebhook] Missing signature in request headers.');
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
    }

    console.log('[StripeWebhook] Received webhook. Attempting to handle...');
    const result = await StripeService.handleWebhook(body, signature);

    if (!result.success) {
      console.error(`[StripeWebhook] Failed to process webhook: ${result.error}`);
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    console.log('[StripeWebhook] Webhook processed successfully.');
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('[StripeWebhook] Fatal error during webhook processing:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

