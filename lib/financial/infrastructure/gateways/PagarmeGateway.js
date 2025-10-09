import { Money } from '../../domain/value-objects/Money';
import { TransactionStatus } from '../../domain/entities/Transaction';
import { PaymentError } from '../../domain/errors/DomainError';
export class PagarmeGateway {
    constructor(config) {
        this.config = config;
        this.baseUrl = config.baseUrl || 'https://api.pagar.me/core/v5';
        this.headers = {
            'Authorization': `Bearer ${config.apiKey}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        };
    }
    async processPayment(request) {
        try {
            const paymentData = this.buildPaymentData(request);
            const response = await this.makeRequest('POST', '/transactions', paymentData);
            if (!response.ok) {
                const error = await response.json();
                throw new PaymentError(error.message || 'Payment processing failed', error.code);
            }
            const transaction = await response.json();
            return {
                success: this.isSuccessfulStatus(transaction.status),
                transactionId: transaction.id,
                status: this.mapPagarmeStatusToTransactionStatus(transaction.status),
                gatewayResponse: transaction
            };
        }
        catch (error) {
            console.error('Pagar.me payment processing failed:', error);
            return this.handlePagarmeError(error);
        }
    }
    async refundPayment(transactionId, amount) {
        try {
            const refundData = {
                transaction_id: transactionId
            };
            if (amount) {
                refundData.amount = amount.toCents();
            }
            const response = await this.makeRequest('POST', '/transactions/refund', refundData);
            if (!response.ok) {
                const error = await response.json();
                throw new PaymentError(error.message || 'Refund processing failed');
            }
            const refund = await response.json();
            return {
                success: refund.status === 'refunded',
                refundId: refund.id,
                refundAmount: amount || Money.fromCents(refund.amount),
                gatewayResponse: refund
            };
        }
        catch (error) {
            console.error('Pagar.me refund failed:', error);
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
            const response = await this.makeRequest('GET', `/transactions/${transactionId}`);
            if (!response.ok) {
                throw new PaymentError('Failed to get transaction status');
            }
            const transaction = await response.json();
            return this.mapPagarmeStatusToTransactionStatus(transaction.status);
        }
        catch (error) {
            console.error('Failed to get Pagar.me transaction status:', error);
            return TransactionStatus.PENDING;
        }
    }
    async createRecurringPayment(request) {
        try {
            // First, create a customer
            const customer = await this.createCustomer(request.metadata?.patientId || '');
            // Create a plan
            const plan = await this.createPlan(request);
            // Create subscription
            const subscriptionData = {
                customer_id: customer.id,
                plan_id: plan.id,
                payment_method: request.paymentMethod.toJSON(),
                metadata: request.metadata
            };
            const response = await this.makeRequest('POST', '/subscriptions', subscriptionData);
            if (!response.ok) {
                const error = await response.json();
                throw new PaymentError(error.message || 'Failed to create subscription');
            }
            const subscription = await response.json();
            return {
                success: subscription.status === 'active',
                subscriptionId: subscription.id,
                gatewayResponse: subscription
            };
        }
        catch (error) {
            console.error('Failed to create Pagar.me recurring payment:', error);
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
            // Verify webhook signature
            if (!this.verifyWebhookSignature(payload, signature)) {
                throw new PaymentError('Invalid webhook signature');
            }
            const event = JSON.parse(payload);
            switch (event.type) {
                case 'transaction.paid':
                    await this.handleTransactionPaid(event.data);
                    break;
                case 'transaction.refused':
                    await this.handleTransactionRefused(event.data);
                    break;
                case 'subscription.paid':
                    await this.handleSubscriptionPaid(event.data);
                    break;
                case 'subscription.payment_failed':
                    await this.handleSubscriptionPaymentFailed(event.data);
                    break;
                default:
                    console.log(`Unhandled Pagar.me webhook event: ${event.type}`);
            }
        }
        catch (error) {
            console.error('Pagar.me webhook handling failed:', error);
            throw new PaymentError('Webhook processing failed');
        }
    }
    async createBankSlip(request) {
        try {
            const bankSlipData = {
                amount: request.amount.toCents(),
                currency: request.amount.toJSON().currency,
                payment_method: 'boleto',
                boleto: {
                    instructions: 'Pagar até o vencimento',
                    due_at: this.calculateBankSlipDueDate(),
                    document_number: this.generateDocumentNumber(),
                    type: 'dm'
                },
                customer: {
                    name: request.metadata?.customerName || 'Cliente',
                    email: request.metadata?.customerEmail,
                    document: request.metadata?.customerDocument,
                    type: 'individual'
                },
                metadata: {
                    transactionId: request.transactionId,
                    patientId: request.patientId,
                    ...(request.metadata || {})
                }
            };
            const response = await this.makeRequest('POST', '/transactions', bankSlipData);
            if (!response.ok) {
                const error = await response.json();
                throw new PaymentError(error.message || 'Bank slip creation failed');
            }
            const transaction = await response.json();
            return {
                success: true,
                transactionId: transaction.id,
                status: this.mapPagarmeStatusToTransactionStatus(transaction.status),
                gatewayResponse: transaction
            };
        }
        catch (error) {
            console.error('Pagar.me bank slip creation failed:', error);
            return this.handlePagarmeError(error);
        }
    }
    async createPixPayment(request) {
        try {
            const pixData = {
                amount: request.amount.toCents(),
                currency: request.amount.toJSON().currency,
                payment_method: 'pix',
                pix: {
                    expires_in: 3600 // 1 hour expiration
                },
                customer: {
                    name: request.metadata?.customerName || 'Cliente',
                    email: request.metadata?.customerEmail,
                    document: request.metadata?.customerDocument,
                    type: 'individual'
                },
                metadata: {
                    transactionId: request.transactionId,
                    patientId: request.patientId,
                    ...(request.metadata || {})
                }
            };
            const response = await this.makeRequest('POST', '/transactions', pixData);
            if (!response.ok) {
                const error = await response.json();
                throw new PaymentError(error.message || 'PIX payment creation failed');
            }
            const transaction = await response.json();
            return {
                success: true,
                transactionId: transaction.id,
                status: this.mapPagarmeStatusToTransactionStatus(transaction.status),
                gatewayResponse: transaction
            };
        }
        catch (error) {
            console.error('Pagar.me PIX payment creation failed:', error);
            return this.handlePagarmeError(error);
        }
    }
    buildPaymentData(request) {
        const baseData = {
            amount: request.amount.toCents(),
            currency: request.amount.toJSON().currency,
            metadata: {
                transactionId: request.transactionId,
                patientId: request.patientId,
                ...(request.metadata || {})
            }
        };
        const paymentMethod = request.paymentMethod.toJSON();
        switch (paymentMethod.type) {
            case 'credit_card':
                return {
                    ...baseData,
                    payment_method: 'credit_card',
                    credit_card: {
                        installments: request.installments || 1,
                        statement_descriptor: 'FISIOTERAPIA',
                        card: {
                            token: request.paymentMethodId
                        }
                    }
                };
            case 'debit_card':
                return {
                    ...baseData,
                    payment_method: 'debit_card',
                    debit_card: {
                        card: {
                            token: request.paymentMethodId
                        }
                    }
                };
            case 'pix':
                return this.createPixPayment(request);
            case 'bank_slip':
                return this.createBankSlip(request);
            default:
                throw new PaymentError(`Unsupported payment method: ${paymentMethod.type}`);
        }
    }
    async createCustomer(patientId) {
        const customerData = {
            name: 'Cliente',
            email: 'cliente@email.com',
            document: '00000000000',
            type: 'individual',
            metadata: {
                patientId
            }
        };
        const response = await this.makeRequest('POST', '/customers', customerData);
        if (!response.ok) {
            throw new PaymentError('Failed to create customer');
        }
        return response.json();
    }
    async createPlan(request) {
        const planData = {
            name: 'Payment Plan',
            amount: 10000, // This should come from the payment plan
            days: 30,
            payment_methods: ['credit_card'],
            metadata: {
                paymentPlanId: request.paymentPlanId
            }
        };
        const response = await this.makeRequest('POST', '/plans', planData);
        if (!response.ok) {
            throw new PaymentError('Failed to create plan');
        }
        return response.json();
    }
    async makeRequest(method, endpoint, data) {
        const url = `${this.baseUrl}${endpoint}`;
        const options = {
            method,
            headers: this.headers
        };
        if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
            options.body = JSON.stringify(data);
        }
        return fetch(url, options);
    }
    mapPagarmeStatusToTransactionStatus(pagarmeStatus) {
        switch (pagarmeStatus) {
            case 'paid':
                return TransactionStatus.PAID;
            case 'refused':
            case 'canceled':
                return TransactionStatus.CANCELLED;
            case 'refunded':
                return TransactionStatus.REFUNDED;
            case 'pending':
            case 'processing':
            case 'authorized':
            case 'waiting_payment':
                return TransactionStatus.PENDING;
            default:
                return TransactionStatus.PENDING;
        }
    }
    isSuccessfulStatus(status) {
        return status === 'paid' || status === 'authorized';
    }
    handlePagarmeError(error) {
        let errorMessage = 'Payment processing failed';
        let errorCode = 'PAYMENT_ERROR';
        if (error instanceof PaymentError) {
            errorMessage = error.message;
            errorCode = error.code || 'PAYMENT_ERROR';
        }
        else if (error?.message) {
            errorMessage = error.message;
        }
        return {
            success: false,
            status: TransactionStatus.PENDING,
            error: errorMessage,
            errorCode,
            gatewayResponse: error
        };
    }
    getErrorMessage(error) {
        if (error?.message) {
            return error.message;
        }
        return 'Unknown payment error';
    }
    verifyWebhookSignature(payload, signature) {
        // Implement webhook signature verification
        // This is a simplified version - implement proper HMAC verification
        return true;
    }
    calculateBankSlipDueDate() {
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 3); // 3 days from now
        return dueDate.toISOString();
    }
    generateDocumentNumber() {
        return Date.now().toString();
    }
    async handleTransactionPaid(data) {
        console.log(`Pagar.me transaction paid: ${data.id}`);
        // Emit event to update transaction status
        // this.eventBus.emit('payment.succeeded', {
        //   transactionId: data.metadata?.transactionId,
        //   gatewayTransactionId: data.id
        // });
    }
    async handleTransactionRefused(data) {
        console.log(`Pagar.me transaction refused: ${data.id}`);
        // Emit event to update transaction status
        // this.eventBus.emit('payment.failed', {
        //   transactionId: data.metadata?.transactionId,
        //   gatewayTransactionId: data.id,
        //   error: data.refuse_reason
        // });
    }
    async handleSubscriptionPaid(data) {
        console.log(`Pagar.me subscription paid: ${data.id}`);
        // Handle recurring payment success
        // this.eventBus.emit('recurring_payment.succeeded', {
        //   subscriptionId: data.id,
        //   paymentPlanId: data.metadata?.paymentPlanId
        // });
    }
    async handleSubscriptionPaymentFailed(data) {
        console.log(`Pagar.me subscription payment failed: ${data.id}`);
        // Handle recurring payment failure
        // this.eventBus.emit('recurring_payment.failed', {
        //   subscriptionId: data.id,
        //   paymentPlanId: data.metadata?.paymentPlanId
        // });
    }
}
