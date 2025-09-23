import Stripe from 'stripe';
import { StripeGateway } from '../../../../lib/financial/infrastructure/gateways/StripeGateway';
import { Money } from '../../../../lib/financial/domain/value-objects/Money';
import { PaymentMethod } from '../../../../lib/financial/domain/value-objects/PaymentMethod';
import { TransactionStatus } from '../../../../lib/financial/domain/entities/Transaction';

// Mock Stripe
jest.mock('stripe');

const mockStripe = {
  paymentIntents: {
    create: jest.fn(),
    retrieve: jest.fn()
  },
  refunds: {
    create: jest.fn()
  },
  customers: {
    create: jest.fn(),
    update: jest.fn()
  },
  paymentMethods: {
    create: jest.fn(),
    attach: jest.fn()
  },
  subscriptions: {
    create: jest.fn()
  },
  webhooks: {
    constructEvent: jest.fn()
  }
} as unknown as jest.Mocked<Stripe>;

(Stripe as jest.MockedClass<typeof Stripe>).mockImplementation(() => mockStripe);

describe('StripeGateway', () => {
  let gateway: StripeGateway;
  
  const config = {
    secretKey: 'sk_test_123',
    webhookSecret: 'whsec_123'
  };

  beforeEach(() => {
    gateway = new StripeGateway(config);
    jest.clearAllMocks();
  });

  describe('Payment Processing', () => {
    const paymentRequest = {
      transactionId: 'tx-123',
      patientId: 'patient-123',
      amount: new Money(100, 'BRL'),
      paymentMethod: PaymentMethod.creditCard('visa', '1234', 12, 2025, 'John Doe'),
      paymentMethodId: 'pm_123',
      metadata: {
        patientEmail: 'patient@example.com'
      }
    };

    it('should process payment successfully', async () => {
      const mockPaymentIntent: Partial<Stripe.PaymentIntent> = {
        id: 'pi_123',
        status: 'succeeded',
        amount: 10000,
        currency: 'brl',
        metadata: {
          transactionId: 'tx-123',
          patientId: 'patient-123'
        }
      };

      mockStripe.paymentIntents.create.mockResolvedValue(mockPaymentIntent as Stripe.PaymentIntent);

      const result = await gateway.processPayment(paymentRequest);

      expect(result.success).toBe(true);
      expect(result.transactionId).toBe('pi_123');
      expect(result.status).toBe(TransactionStatus.PAID);

      expect(mockStripe.paymentIntents.create).toHaveBeenCalledWith({
        amount: 10000, // 100 BRL in cents
        currency: 'brl',
        payment_method: 'pm_123',
        confirmation_method: 'manual',
        confirm: true,
        return_url: expect.any(String),
        metadata: {
          transactionId: 'tx-123',
          patientId: 'patient-123',
          patientEmail: 'patient@example.com'
        },
        description: 'Payment for transaction tx-123',
        receipt_email: 'patient@example.com',
        setup_future_usage: undefined
      });
    });

    it('should handle payment with installments', async () => {
      const installmentRequest = {
        ...paymentRequest,
        installments: 3
      };

      const mockPaymentIntent: Partial<Stripe.PaymentIntent> = {
        id: 'pi_123',
        status: 'succeeded',
        amount: 10000,
        currency: 'brl'
      };

      mockStripe.paymentIntents.create.mockResolvedValue(mockPaymentIntent as Stripe.PaymentIntent);

      const result = await gateway.processPayment(installmentRequest);

      expect(result.success).toBe(true);
      expect(mockStripe.paymentIntents.create).toHaveBeenCalledWith(
        expect.objectContaining({
          setup_future_usage: 'off_session'
        })
      );
    });

    it('should handle payment failure', async () => {
      const stripeError = new Error('Your card was declined.');
      (stripeError as any).type = 'StripeCardError';
      (stripeError as any).code = 'card_declined';

      mockStripe.paymentIntents.create.mockRejectedValue(stripeError);

      const result = await gateway.processPayment(paymentRequest);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Your card was declined.');
      expect(result.errorCode).toBe('CARD_DECLINED');
      expect(result.status).toBe(TransactionStatus.PENDING);
    });

    it('should map Stripe statuses correctly', async () => {
      const testCases = [
        { stripeStatus: 'succeeded', expectedStatus: TransactionStatus.PAID },
        { stripeStatus: 'canceled', expectedStatus: TransactionStatus.CANCELLED },
        { stripeStatus: 'processing', expectedStatus: TransactionStatus.PENDING },
        { stripeStatus: 'requires_payment_method', expectedStatus: TransactionStatus.PENDING }
      ];

      for (const testCase of testCases) {
        const mockPaymentIntent: Partial<Stripe.PaymentIntent> = {
          id: 'pi_123',
          status: testCase.stripeStatus as Stripe.PaymentIntent.Status,
          amount: 10000,
          currency: 'brl'
        };

        mockStripe.paymentIntents.create.mockResolvedValue(mockPaymentIntent as Stripe.PaymentIntent);

        const result = await gateway.processPayment(paymentRequest);
        expect(result.status).toBe(testCase.expectedStatus);
      }
    });
  });

  describe('Refund Processing', () => {
    it('should process refund successfully', async () => {
      const mockRefund: Partial<Stripe.Refund> = {
        id: 'rf_123',
        status: 'succeeded',
        amount: 5000,
        currency: 'brl'
      };

      mockStripe.refunds.create.mockResolvedValue(mockRefund as Stripe.Refund);

      const result = await gateway.refundPayment('pi_123', new Money(50, 'BRL'));

      expect(result.success).toBe(true);
      expect(result.refundId).toBe('rf_123');
      expect(result.refundAmount.equals(new Money(50, 'BRL'))).toBe(true);

      expect(mockStripe.refunds.create).toHaveBeenCalledWith({
        payment_intent: 'pi_123',
        amount: 5000,
        reason: 'requested_by_customer',
        metadata: {
          refundedAt: expect.any(String)
        }
      });
    });

    it('should process full refund when amount not specified', async () => {
      const mockRefund: Partial<Stripe.Refund> = {
        id: 'rf_123',
        status: 'succeeded',
        amount: 10000,
        currency: 'brl'
      };

      mockStripe.refunds.create.mockResolvedValue(mockRefund as Stripe.Refund);

      const result = await gateway.refundPayment('pi_123');

      expect(result.success).toBe(true);
      expect(mockStripe.refunds.create).toHaveBeenCalledWith({
        payment_intent: 'pi_123',
        reason: 'requested_by_customer',
        metadata: {
          refundedAt: expect.any(String)
        }
      });
    });

    it('should handle refund failure', async () => {
      const stripeError = new Error('Refund failed');
      mockStripe.refunds.create.mockRejectedValue(stripeError);

      const result = await gateway.refundPayment('pi_123', new Money(50, 'BRL'));

      expect(result.success).toBe(false);
      expect(result.error).toBe('Refund failed');
      expect(result.refundAmount.equals(new Money(50, 'BRL'))).toBe(true);
    });
  });

  describe('Transaction Status Retrieval', () => {
    it('should retrieve transaction status successfully', async () => {
      const mockPaymentIntent: Partial<Stripe.PaymentIntent> = {
        id: 'pi_123',
        status: 'succeeded'
      };

      mockStripe.paymentIntents.retrieve.mockResolvedValue(mockPaymentIntent as Stripe.PaymentIntent);

      const status = await gateway.getTransactionStatus('pi_123');

      expect(status).toBe(TransactionStatus.PAID);
      expect(mockStripe.paymentIntents.retrieve).toHaveBeenCalledWith('pi_123');
    });

    it('should handle retrieval failure', async () => {
      mockStripe.paymentIntents.retrieve.mockRejectedValue(new Error('Not found'));

      const status = await gateway.getTransactionStatus('pi_123');

      expect(status).toBe(TransactionStatus.PENDING);
    });
  });

  describe('Recurring Payments', () => {
    const recurringRequest = {
      paymentPlanId: 'plan-123',
      paymentMethod: PaymentMethod.creditCard('visa', '1234', 12, 2025, 'John Doe'),
      paymentMethodId: 'pm_123',
      metadata: {
        patientId: 'patient-123'
      }
    };

    it('should create recurring payment successfully', async () => {
      const mockCustomer: Partial<Stripe.Customer> = {
        id: 'cus_123'
      };

      const mockSubscription: Partial<Stripe.Subscription> = {
        id: 'sub_123',
        status: 'active'
      };

      mockStripe.customers.create.mockResolvedValue(mockCustomer as Stripe.Customer);
      mockStripe.paymentMethods.attach.mockResolvedValue({} as Stripe.PaymentMethod);
      mockStripe.customers.update.mockResolvedValue({} as Stripe.Customer);
      mockStripe.subscriptions.create.mockResolvedValue(mockSubscription as Stripe.Subscription);

      const result = await gateway.createRecurringPayment(recurringRequest);

      expect(result.success).toBe(true);
      expect(result.subscriptionId).toBe('sub_123');

      expect(mockStripe.customers.create).toHaveBeenCalled();
      expect(mockStripe.paymentMethods.attach).toHaveBeenCalledWith('pm_123', {
        customer: 'cus_123'
      });
      expect(mockStripe.subscriptions.create).toHaveBeenCalled();
    });

    it('should handle recurring payment creation failure', async () => {
      mockStripe.customers.create.mockRejectedValue(new Error('Customer creation failed'));

      const result = await gateway.createRecurringPayment(recurringRequest);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Customer creation failed');
    });
  });

  describe('Webhook Handling', () => {
    const webhookPayload = JSON.stringify({
      type: 'payment_intent.succeeded',
      data: {
        object: {
          id: 'pi_123',
          status: 'succeeded',
          metadata: {
            transactionId: 'tx-123'
          }
        }
      }
    });

    const webhookSignature = 'test_signature';

    it('should handle payment_intent.succeeded webhook', async () => {
      const mockEvent = {
        type: 'payment_intent.succeeded',
        data: {
          object: {
            id: 'pi_123',
            status: 'succeeded',
            metadata: {
              transactionId: 'tx-123'
            }
          }
        }
      };

      mockStripe.webhooks.constructEvent.mockReturnValue(mockEvent as Stripe.Event);

      // Mock console.log to verify the webhook was processed
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      await gateway.handleWebhook(webhookPayload, webhookSignature);

      expect(mockStripe.webhooks.constructEvent).toHaveBeenCalledWith(
        webhookPayload,
        webhookSignature,
        'whsec_123'
      );

      expect(consoleSpy).toHaveBeenCalledWith('Payment succeeded: pi_123');

      consoleSpy.mockRestore();
    });

    it('should handle invalid webhook signature', async () => {
      mockStripe.webhooks.constructEvent.mockImplementation(() => {
        throw new Error('Invalid signature');
      });

      await expect(
        gateway.handleWebhook(webhookPayload, 'invalid_signature')
      ).rejects.toThrow('Webhook processing failed');
    });

    it('should handle unrecognized webhook events', async () => {
      const mockEvent = {
        type: 'unknown.event',
        data: { object: {} }
      };

      mockStripe.webhooks.constructEvent.mockReturnValue(mockEvent as Stripe.Event);

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      await gateway.handleWebhook(webhookPayload, webhookSignature);

      expect(consoleSpy).toHaveBeenCalledWith('Unhandled Stripe webhook event: unknown.event');

      consoleSpy.mockRestore();
    });
  });

  describe('Payment Method Creation', () => {
    it('should create payment method successfully', async () => {
      const mockPaymentMethod: Partial<Stripe.PaymentMethod> = {
        id: 'pm_123',
        type: 'card'
      };

      mockStripe.paymentMethods.create.mockResolvedValue(mockPaymentMethod as Stripe.PaymentMethod);

      const paymentMethodId = await gateway.createPaymentMethod('tok_123');

      expect(paymentMethodId).toBe('pm_123');
      expect(mockStripe.paymentMethods.create).toHaveBeenCalledWith({
        type: 'card',
        card: { token: 'tok_123' }
      });
    });

    it('should attach payment method to customer', async () => {
      const mockPaymentMethod: Partial<Stripe.PaymentMethod> = {
        id: 'pm_123',
        type: 'card'
      };

      mockStripe.paymentMethods.create.mockResolvedValue(mockPaymentMethod as Stripe.PaymentMethod);
      mockStripe.paymentMethods.attach.mockResolvedValue({} as Stripe.PaymentMethod);

      const paymentMethodId = await gateway.createPaymentMethod('tok_123', 'cus_123');

      expect(paymentMethodId).toBe('pm_123');
      expect(mockStripe.paymentMethods.attach).toHaveBeenCalledWith('pm_123', {
        customer: 'cus_123'
      });
    });
  });

  describe('Customer Creation', () => {
    it('should create customer successfully', async () => {
      const mockCustomer: Partial<Stripe.Customer> = {
        id: 'cus_123'
      };

      mockStripe.customers.create.mockResolvedValue(mockCustomer as Stripe.Customer);

      const customerId = await gateway.createCustomer('patient-123', 'test@example.com', 'John Doe');

      expect(customerId).toBe('cus_123');
      expect(mockStripe.customers.create).toHaveBeenCalledWith({
        email: 'test@example.com',
        name: 'John Doe',
        metadata: {
          patientId: 'patient-123'
        }
      });
    });
  });

  describe('Error Handling', () => {
    const paymentRequest = {
      transactionId: 'tx-123',
      patientId: 'patient-123',
      amount: new Money(100, 'BRL'),
      paymentMethod: PaymentMethod.creditCard('visa', '1234', 12, 2025, 'John Doe'),
      paymentMethodId: 'pm_123'
    };

    it('should handle StripeCardError', async () => {
      const stripeError = new Error('Insufficient funds');
      (stripeError as any).type = 'StripeCardError';
      (stripeError as any).code = 'insufficient_funds';

      mockStripe.paymentIntents.create.mockRejectedValue(stripeError);

      const result = await gateway.processPayment(paymentRequest);

      expect(result.success).toBe(false);
      expect(result.errorCode).toBe('INSUFFICIENT_FUNDS');
    });

    it('should handle StripeInvalidRequestError', async () => {
      const stripeError = new Error('Invalid request');
      (stripeError as any).type = 'StripeInvalidRequestError';

      mockStripe.paymentIntents.create.mockRejectedValue(stripeError);

      const result = await gateway.processPayment(paymentRequest);

      expect(result.success).toBe(false);
      expect(result.errorCode).toBe('INVALID_REQUEST');
    });

    it('should handle StripeAPIError', async () => {
      const stripeError = new Error('API error');
      (stripeError as any).type = 'StripeAPIError';

      mockStripe.paymentIntents.create.mockRejectedValue(stripeError);

      const result = await gateway.processPayment(paymentRequest);

      expect(result.success).toBe(false);
      expect(result.errorCode).toBe('GATEWAY_ERROR');
    });

    it('should handle StripeConnectionError', async () => {
      const stripeError = new Error('Connection failed');
      (stripeError as any).type = 'StripeConnectionError';

      mockStripe.paymentIntents.create.mockRejectedValue(stripeError);

      const result = await gateway.processPayment(paymentRequest);

      expect(result.success).toBe(false);
      expect(result.errorCode).toBe('CONNECTION_ERROR');
    });
  });
});