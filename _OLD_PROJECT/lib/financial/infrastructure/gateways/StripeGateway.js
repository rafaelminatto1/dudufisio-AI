import Stripe from 'stripe';
import { Money } from '../../domain/value-objects/Money';
import { TransactionStatus } from '../../domain/entities/Transaction';
import { PaymentError } from '../../domain/errors/DomainError';
export class StripeGateway {
    constructor(config) {
        this.config = config;
        this.stripe = new Stripe(config.secretKey, {
            apiVersion: config.apiVersion || '2023-10-16'
        });
    }
    async processPayment(request) {
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
        }
        catch (error) {
            console.error('Stripe payment processing failed:', error);
            return this.handleStripeError(error);
        }
    }
    async refundPayment(transactionId, amount) {
        try {
            const refundData = {
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
        }
        catch (error) {
            console.error('Stripe refund failed:', error);
            return {
                success: false,
                refundAmount: amount || Money.zero(),
                error: this.getErrorMessage(error),
                gatewayResponse: error
            };
        }
    }
    async getTransactionStatus(transactionId) {
        try {
            const paymentIntent = await this.stripe.paymentIntents.retrieve(transactionId);
            return this.mapStripeStatusToTransactionStatus(paymentIntent.status);
        }
        catch (error) {
            console.error('Failed to get Stripe transaction status:', error);
            return TransactionStatus.PENDING;
        }
    }
    async createRecurringPayment(request) {
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
                            product: customer.default_source || 'prod_default',
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
        }
        catch (error) {
            console.error('Failed to create Stripe recurring payment:', error);
            return {
                success: false,
                error: this.getErrorMessage(error),
                gatewayResponse: error
            };
        }
    }
    async handleWebhook(payload, signature) {
        if (!this.config.webhookSecret) {
            throw new PaymentError('Webhook secret not configured');
        }
        try {
            const event = this.stripe.webhooks.constructEvent(payload, signature, this.config.webhookSecret);
            switch (event.type) {
                case 'payment_intent.succeeded':
                    await this.handlePaymentSucceeded(event.data.object);
                    break;
                case 'payment_intent.payment_failed':
                    await this.handlePaymentFailed(event.data.object);
                    break;
                case 'invoice.payment_succeeded':
                    await this.handleInvoicePaymentSucceeded(event.data.object);
                    break;
                case 'invoice.payment_failed':
                    await this.handleInvoicePaymentFailed(event.data.object);
                    break;
                default:
                    console.log(`Unhandled Stripe webhook event: ${event.type}`);
            }
        }
        catch (error) {
            console.error('Stripe webhook handling failed:', error);
            throw new PaymentError('Webhook processing failed');
        }
    }
    async createPaymentMethod(cardToken, customerId) {
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
        }
        catch (error) {
            console.error('Failed to create Stripe payment method:', error);
            throw new PaymentError('Failed to create payment method');
        }
    }
    async createCustomer(patientId, email, name) {
        try {
            const customer = await this.stripe.customers.create({
                email,
                name,
                metadata: {
                    patientId
                }
            });
            return customer.id;
        }
        catch (error) {
            console.error('Failed to create Stripe customer:', error);
            throw new PaymentError('Failed to create customer');
        }
    }
    convertToStripeAmount(money) {
        // Stripe expects amounts in cents
        return money.toCents();
    }
    convertFromStripeAmount(amount, currency) {
        return Money.fromCents(amount, currency.toUpperCase());
    }
    mapPaymentIntentToResult(paymentIntent) {
        const status = this.mapStripeStatusToTransactionStatus(paymentIntent.status);
        return {
            success: status === TransactionStatus.PAID,
            transactionId: paymentIntent.id,
            status,
            gatewayResponse: paymentIntent
        };
    }
    mapStripeStatusToTransactionStatus(stripeStatus) {
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
    handleStripeError(error) {
        let errorMessage = 'Payment processing failed';
        let errorCode = 'PAYMENT_ERROR';
        if (error.type === 'StripeCardError') {
            errorCode = this.mapStripeErrorCode(error.code);
            errorMessage = error.message;
        }
        else if (error.type === 'StripeInvalidRequestError') {
            errorCode = 'INVALID_REQUEST';
            errorMessage = 'Invalid payment request';
        }
        else if (error.type === 'StripeAPIError') {
            errorCode = 'GATEWAY_ERROR';
            errorMessage = 'Payment gateway error';
        }
        else if (error.type === 'StripeConnectionError') {
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
    mapStripeErrorCode(stripeCode) {
        const codeMap = {
            'insufficient_funds': 'INSUFFICIENT_FUNDS',
            'card_declined': 'CARD_DECLINED',
            'expired_card': 'EXPIRED_CARD',
            'incorrect_cvc': 'INVALID_CVC',
            'processing_error': 'PROCESSING_ERROR',
            'card_not_supported': 'CARD_NOT_SUPPORTED'
        };
        return codeMap[stripeCode] || 'PAYMENT_ERROR';
    }
    getErrorMessage(error) {
        if (error?.message) {
            return error.message;
        }
        return 'Unknown payment error';
    }
    getReturnUrl() {
        // This should be configurable based on your application
        return process.env.STRIPE_RETURN_URL || 'https://your-app.com/payment/return';
    }
    async handlePaymentSucceeded(paymentIntent) {
        // This would typically update your database
        // For now, just log the event
        console.log(`Payment succeeded: ${paymentIntent.id}`);
        // You could emit an event here to update the transaction status
        // this.eventBus.emit('payment.succeeded', {
        //   transactionId: paymentIntent.metadata.transactionId,
        //   gatewayTransactionId: paymentIntent.id
        // });
    }
    async handlePaymentFailed(paymentIntent) {
        console.log(`Payment failed: ${paymentIntent.id}`);
        // You could emit an event here to update the transaction status
        // this.eventBus.emit('payment.failed', {
        //   transactionId: paymentIntent.metadata.transactionId,
        //   gatewayTransactionId: paymentIntent.id,
        //   error: paymentIntent.last_payment_error?.message
        // });
    }
    async handleInvoicePaymentSucceeded(invoice) {
        console.log(`Invoice payment succeeded: ${invoice.id}`);
        // Handle recurring payment success
        // this.eventBus.emit('recurring_payment.succeeded', {
        //   subscriptionId: invoice.subscription,
        //   invoiceId: invoice.id,
        //   paymentPlanId: invoice.metadata?.paymentPlanId
        // });
    }
    async handleInvoicePaymentFailed(invoice) {
        console.log(`Invoice payment failed: ${invoice.id}`);
        // Handle recurring payment failure
        // this.eventBus.emit('recurring_payment.failed', {
        //   subscriptionId: invoice.subscription,
        //   invoiceId: invoice.id,
        //   paymentPlanId: invoice.metadata?.paymentPlanId
        // });
    }
}
