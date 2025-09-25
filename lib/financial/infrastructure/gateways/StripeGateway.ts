import Stripe from 'stripe';
import { Money } from '../../domain/value-objects/Money';
import { TransactionStatus } from '../../domain/entities/Transaction';
import { PaymentError } from '../../domain/errors/DomainError';
import { 
  PaymentGateway, 
  PaymentRequest, 
  PaymentResult, 
  RefundResult, 
  RecurringPaymentRequest, 
  RecurringPaymentResult 
} from '../../application/services/PaymentService';

export interface StripeConfig {
  secretKey: string;
  webhookSecret?: string;
  apiVersion?: string;
}

export class StripeGateway implements PaymentGateway {
  private readonly stripe: Stripe;

  constructor(private readonly config: StripeConfig) {
    this.stripe = new Stripe(config.secretKey, {
      apiVersion: (config.apiVersion as any) || '2023-10-16'
    });
  }

  async processPayment(request: PaymentRequest): Promise<PaymentResult> {
    try {
      const amount = this.convertToStripeAmount(request.amount);
      
      // Create payment intent
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount,
        currency: request.amount.toJSON().currency.toLowerCase(),
        payment_method: request.paymentMethodId,
        confirmation_method: 'manual',
        confirm: true,
        return_url: this.getReturnUrl(),
        metadata: {
          transactionId: request.transactionId,
          patientId: request.patientId,
          ...(request.metadata || {})
        },
        description: `Payment for transaction ${request.transactionId}`,
        receipt_email: request.metadata?.patientEmail,
        setup_future_usage: request.installments && request.installments > 1 ? 'off_session' : undefined
      });

      return this.mapPaymentIntentToResult(paymentIntent);

    } catch (error) {
      console.error('Stripe payment processing failed:', error);
      return this.handleStripeError(error);
    }
  }

  async refundPayment(transactionId: string, amount?: Money): Promise<RefundResult> {
    try {
      const refundData: Stripe.RefundCreateParams = {
        payment_intent: transactionId,
        reason: 'requested_by_customer',
        metadata: {
          refundedAt: new Date().toISOString()
        }
      };

      if (amount) {
        refundData.amount = this.convertToStripeAmount(amount);
      }

      const refund = await this.stripe.refunds.create(refundData);

      return {
        success: refund.status === 'succeeded',
        refundId: refund.id,
        refundAmount: amount || this.convertFromStripeAmount(refund.amount, refund.currency),
        gatewayResponse: refund
      };

    } catch (error) {
      console.error('Stripe refund failed:', error);
      return {
        success: false,
        refundAmount: amount || Money.zero(),
        error: this.getErrorMessage(error),
        gatewayResponse: error
      };
    }
  }

  async getTransactionStatus(transactionId: string): Promise<TransactionStatus> {
    try {
      const paymentIntent = await this.stripe.paymentIntents.retrieve(transactionId);
      return this.mapStripeStatusToTransactionStatus(paymentIntent.status);

    } catch (error) {
      console.error('Failed to get Stripe transaction status:', error);
      return TransactionStatus.PENDING;
    }
  }

  async createRecurringPayment(request: RecurringPaymentRequest): Promise<RecurringPaymentResult> {
    try {
      // Create a customer if not exists
      const customer = await this.stripe.customers.create({
        metadata: {
          patientId: request.metadata?.patientId,
          paymentPlanId: request.paymentPlanId
        }
      });

      // Attach payment method to customer
      if (request.paymentMethodId) {
        await this.stripe.paymentMethods.attach(request.paymentMethodId, {
          customer: customer.id
        });

        // Set as default payment method
        await this.stripe.customers.update(customer.id, {
          invoice_settings: {
            default_payment_method: request.paymentMethodId
          }
        });
      }

      // Create subscription for recurring payments
      // Note: This is a simplified implementation
      // In practice, you'd need to create products and prices in Stripe
      const subscription = await this.stripe.subscriptions.create({
        customer: customer.id,
        items: [{
          price_data: {
            currency: 'brl',
            product_data: {
              name: 'Payment Plan Installments'
            },
            unit_amount: 100, // This should be calculated from payment plan
            recurring: {
              interval: 'month'
            }
          }
        }],
        metadata: {
          paymentPlanId: request.paymentPlanId,
          patientId: request.metadata?.patientId || ''
        }
      });

      return {
        success: true,
        subscriptionId: subscription.id,
        gatewayResponse: subscription
      };

    } catch (error) {
      console.error('Failed to create Stripe recurring payment:', error);
      return {
        success: false,
        error: this.getErrorMessage(error),
        gatewayResponse: error
      };
    }
  }

  async handleWebhook(payload: string, signature: string): Promise<void> {
    if (!this.config.webhookSecret) {
      throw new PaymentError('Webhook secret not configured');
    }

    try {
      const event = this.stripe.webhooks.constructEvent(
        payload,
        signature,
        this.config.webhookSecret
      );

      switch (event.type) {
        case 'payment_intent.succeeded':
          await this.handlePaymentSucceeded(event.data.object as Stripe.PaymentIntent);
          break;
        
        case 'payment_intent.payment_failed':
          await this.handlePaymentFailed(event.data.object as Stripe.PaymentIntent);
          break;
        
        case 'invoice.payment_succeeded':
          await this.handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice);
          break;
        
        case 'invoice.payment_failed':
          await this.handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
          break;
        
        default:
          console.log(`Unhandled Stripe webhook event: ${event.type}`);
      }

    } catch (error) {
      console.error('Stripe webhook handling failed:', error);
      throw new PaymentError('Webhook processing failed');
    }
  }

  async createPaymentMethod(cardToken: string, customerId?: string): Promise<string> {
    try {
      const paymentMethod = await this.stripe.paymentMethods.create({
        type: 'card',
        card: { token: cardToken }
      });

      if (customerId) {
        await this.stripe.paymentMethods.attach(paymentMethod.id, {
          customer: customerId
        });
      }

      return paymentMethod.id;

    } catch (error) {
      console.error('Failed to create Stripe payment method:', error);
      throw new PaymentError('Failed to create payment method');
    }
  }

  async createCustomer(patientId: string, email?: string, name?: string): Promise<string> {
    try {
      const customer = await this.stripe.customers.create({
        email,
        name,
        metadata: {
          patientId
        }
      });

      return customer.id;

    } catch (error) {
      console.error('Failed to create Stripe customer:', error);
      throw new PaymentError('Failed to create customer');
    }
  }

  private convertToStripeAmount(money: Money): number {
    // Stripe expects amounts in cents
    return money.toCents();
  }

  private convertFromStripeAmount(amount: number, currency: string): Money {
    return Money.fromCents(amount, currency.toUpperCase());
  }

  private mapPaymentIntentToResult(paymentIntent: Stripe.PaymentIntent): PaymentResult {
    const status = this.mapStripeStatusToTransactionStatus(paymentIntent.status);
    
    return {
      success: status === TransactionStatus.PAID,
      transactionId: paymentIntent.id,
      status,
      gatewayResponse: paymentIntent
    };
  }

  private mapStripeStatusToTransactionStatus(stripeStatus: string): TransactionStatus {
    switch (stripeStatus) {
      case 'succeeded':
        return TransactionStatus.PAID;
      case 'canceled':
        return TransactionStatus.CANCELLED;
      case 'processing':
      case 'requires_payment_method':
      case 'requires_confirmation':
      case 'requires_action':
        return TransactionStatus.PENDING;
      default:
        return TransactionStatus.PENDING;
    }
  }

  private handleStripeError(error: any): PaymentResult {
    let errorMessage = 'Payment processing failed';
    let errorCode = 'PAYMENT_ERROR';

    if (error.type === 'StripeCardError') {
      errorCode = this.mapStripeErrorCode(error.code);
      errorMessage = error.message;
    } else if (error.type === 'StripeInvalidRequestError') {
      errorCode = 'INVALID_REQUEST';
      errorMessage = 'Invalid payment request';
    } else if (error.type === 'StripeAPIError') {
      errorCode = 'GATEWAY_ERROR';
      errorMessage = 'Payment gateway error';
    } else if (error.type === 'StripeConnectionError') {
      errorCode = 'CONNECTION_ERROR';
      errorMessage = 'Connection to payment gateway failed';
    }

    return {
      success: false,
      status: TransactionStatus.PENDING,
      error: errorMessage,
      errorCode,
      gatewayResponse: error
    };
  }

  private mapStripeErrorCode(stripeCode: string): string {
    const codeMap: Record<string, string> = {
      'insufficient_funds': 'INSUFFICIENT_FUNDS',
      'card_declined': 'CARD_DECLINED',
      'expired_card': 'EXPIRED_CARD',
      'incorrect_cvc': 'INVALID_CVC',
      'processing_error': 'PROCESSING_ERROR',
      'card_not_supported': 'CARD_NOT_SUPPORTED'
    };

    return codeMap[stripeCode] || 'PAYMENT_ERROR';
  }

  private getErrorMessage(error: any): string {
    if (error?.message) {
      return error.message;
    }
    return 'Unknown payment error';
  }

  private getReturnUrl(): string {
    // This should be configurable based on your application
    return process.env.STRIPE_RETURN_URL || 'https://your-app.com/payment/return';
  }

  private async handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    // This would typically update your database
    // For now, just log the event
    console.log(`Payment succeeded: ${paymentIntent.id}`);
    
    // You could emit an event here to update the transaction status
    // this.eventBus.emit('payment.succeeded', {
    //   transactionId: paymentIntent.metadata.transactionId,
    //   gatewayTransactionId: paymentIntent.id
    // });
  }

  private async handlePaymentFailed(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    console.log(`Payment failed: ${paymentIntent.id}`);
    
    // You could emit an event here to update the transaction status
    // this.eventBus.emit('payment.failed', {
    //   transactionId: paymentIntent.metadata.transactionId,
    //   gatewayTransactionId: paymentIntent.id,
    //   error: paymentIntent.last_payment_error?.message
    // });
  }

  private async handleInvoicePaymentSucceeded(invoice: Stripe.Invoice): Promise<void> {
    console.log(`Invoice payment succeeded: ${invoice.id}`);
    
    // Handle recurring payment success
    // this.eventBus.emit('recurring_payment.succeeded', {
    //   subscriptionId: invoice.subscription,
    //   invoiceId: invoice.id,
    //   paymentPlanId: invoice.metadata?.paymentPlanId
    // });
  }

  private async handleInvoicePaymentFailed(invoice: Stripe.Invoice): Promise<void> {
    console.log(`Invoice payment failed: ${invoice.id}`);
    
    // Handle recurring payment failure
    // this.eventBus.emit('recurring_payment.failed', {
    //   subscriptionId: invoice.subscription,
    //   invoiceId: invoice.id,
    //   paymentPlanId: invoice.metadata?.paymentPlanId
    // });
  }
}
