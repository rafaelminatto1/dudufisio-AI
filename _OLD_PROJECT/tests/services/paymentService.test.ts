/**
 * 🧪 TESTES - PAYMENT SERVICE
 *
 * Testes de integração para o serviço de pagamentos
 * corrigido conforme RELATORIO_IMPLEMENTACAO_PLANO_ERROS.md (Fase 1)
 *
 * Execute com: npm test tests/services/paymentService.test.ts
 */

import { supabase } from '../../lib/supabaseClient';
import paymentService from '../../services/paymentService';
import { Payment, PaymentStatus, PaymentMethod } from '../../services/paymentService';

describe('PaymentService Integration Tests', () => {
  let testPaymentId: string | null = null;
  let testPatientId: string = 'test-patient-' + Date.now();

  beforeAll(async () => {
    // Verify Supabase connection
    const { error } = await supabase.from('payments').select('count').limit(1);
    if (error) {
      console.error('Failed to connect to Supabase payments table:', error);
      throw new Error('Supabase connection failed. Ensure payments table exists.');
    }
  });

  afterEach(async () => {
    // Cleanup test payment
    if (testPaymentId) {
      try {
        await supabase.from('payments').delete().eq('id', testPaymentId);
        testPaymentId = null;
      } catch (error) {
        console.warn('Failed to cleanup test payment:', error);
      }
    }
  });

  describe('createPayment', () => {
    it('should create a new payment with PIX method', async () => {
      const paymentData = {
        patient_id: testPatientId,
        amount: 150.00,
        payment_method: 'pix' as PaymentMethod,
        description: 'Consulta de Fisioterapia',
      };

      const payment = await paymentService.createPayment(paymentData);
      testPaymentId = payment.id;

      expect(payment).toBeDefined();
      expect(payment.patient_id).toBe(testPatientId);
      expect(payment.amount).toBe(150.00);
      expect(payment.payment_method).toBe('pix');
      expect(payment.status).toBe('pending');
      expect(payment.description).toBe('Consulta de Fisioterapia');
    });

    it('should create payment with credit card method', async () => {
      const paymentData = {
        patient_id: testPatientId,
        amount: 200.00,
        payment_method: 'credit_card' as PaymentMethod,
        description: 'Pacote de 4 sessões',
        installments: 2,
      };

      const payment = await paymentService.createPayment(paymentData);
      testPaymentId = payment.id;

      expect(payment.payment_method).toBe('credit_card');
      expect(payment.installments).toBe(2);
    });

    it('should create payment with metadata', async () => {
      const paymentData = {
        patient_id: testPatientId,
        amount: 100.00,
        payment_method: 'boleto' as PaymentMethod,
        description: 'Pagamento de teste',
        metadata: {
          appointment_id: 'apt-123',
          therapist_id: 'therapist-456',
        },
      };

      const payment = await paymentService.createPayment(paymentData);
      testPaymentId = payment.id;

      expect(payment.metadata).toBeDefined();
      expect(payment.metadata).toHaveProperty('appointment_id', 'apt-123');
    });
  });

  describe('getPaymentById', () => {
    beforeEach(async () => {
      const paymentData = {
        patient_id: testPatientId,
        amount: 150.00,
        payment_method: 'pix' as PaymentMethod,
        description: 'Test Payment',
      };
      const payment = await paymentService.createPayment(paymentData);
      testPaymentId = payment.id;
    });

    it('should retrieve payment by ID', async () => {
      const payment = await paymentService.getPaymentById(testPaymentId!);

      expect(payment).not.toBeNull();
      expect(payment?.id).toBe(testPaymentId);
      expect(payment?.patient_id).toBe(testPatientId);
    });

    it('should return null for non-existent payment', async () => {
      const payment = await paymentService.getPaymentById('00000000-0000-0000-0000-000000000000');
      expect(payment).toBeNull();
    });
  });

  describe('getPaymentsByPatient', () => {
    beforeEach(async () => {
      // Create multiple payments for same patient
      const payment1Data = {
        patient_id: testPatientId,
        amount: 100.00,
        payment_method: 'pix' as PaymentMethod,
        description: 'Payment 1',
      };
      const payment2Data = {
        patient_id: testPatientId,
        amount: 200.00,
        payment_method: 'credit_card' as PaymentMethod,
        description: 'Payment 2',
      };

      const p1 = await paymentService.createPayment(payment1Data);
      const p2 = await paymentService.createPayment(payment2Data);

      testPaymentId = p2.id; // Will cleanup in afterEach
    });

    it('should retrieve all payments for a patient', async () => {
      const payments = await paymentService.getPaymentsByPatient(testPatientId);

      expect(Array.isArray(payments)).toBe(true);
      expect(payments.length).toBeGreaterThanOrEqual(2);
      expect(payments.every(p => p.patient_id === testPatientId)).toBe(true);
    });

    it('should order payments by creation date descending', async () => {
      const payments = await paymentService.getPaymentsByPatient(testPatientId);

      for (let i = 0; i < payments.length - 1; i++) {
        const current = new Date(payments[i].created_at!);
        const next = new Date(payments[i + 1].created_at!);
        expect(current >= next).toBe(true);
      }
    });
  });

  describe('updatePaymentStatus', () => {
    beforeEach(async () => {
      const paymentData = {
        patient_id: testPatientId,
        amount: 150.00,
        payment_method: 'pix' as PaymentMethod,
        description: 'Test Payment',
      };
      const payment = await paymentService.createPayment(paymentData);
      testPaymentId = payment.id;
    });

    it('should update payment status to paid', async () => {
      const updated = await paymentService.updatePaymentStatus(
        testPaymentId!,
        'paid',
        'txn-123456'
      );

      expect(updated.status).toBe('paid');
      expect(updated.transaction_id).toBe('txn-123456');
      expect(updated.paid_at).toBeDefined();
    });

    it('should update payment status to failed', async () => {
      const updated = await paymentService.updatePaymentStatus(
        testPaymentId!,
        'failed'
      );

      expect(updated.status).toBe('failed');
      expect(updated.paid_at).toBeNull();
    });

    it('should update payment status to cancelled', async () => {
      const updated = await paymentService.updatePaymentStatus(
        testPaymentId!,
        'cancelled'
      );

      expect(updated.status).toBe('cancelled');
    });
  });

  describe('processRefund', () => {
    beforeEach(async () => {
      const paymentData = {
        patient_id: testPatientId,
        amount: 150.00,
        payment_method: 'credit_card' as PaymentMethod,
        description: 'Payment to refund',
      };
      const payment = await paymentService.createPayment(paymentData);
      testPaymentId = payment.id;

      // Mark as paid first
      await paymentService.updatePaymentStatus(testPaymentId!, 'paid', 'txn-paid');
    });

    it('should process full refund', async () => {
      const refunded = await paymentService.processRefund(testPaymentId!, 150.00);

      expect(refunded.status).toBe('refunded');
      expect(refunded.refunded_at).toBeDefined();
      expect(refunded.refunded_amount).toBe(150.00);
    });

    it('should process partial refund', async () => {
      const refunded = await paymentService.processRefund(testPaymentId!, 75.00);

      expect(refunded.refunded_amount).toBe(75.00);
      expect(refunded.refunded_amount).toBeLessThan(refunded.amount);
    });

    it('should not refund more than payment amount', async () => {
      await expect(
        paymentService.processRefund(testPaymentId!, 200.00)
      ).rejects.toThrow();
    });
  });

  describe('getPaymentStats', () => {
    beforeEach(async () => {
      // Create payments with different statuses
      const payments = [
        { amount: 100, status: 'paid' as PaymentStatus },
        { amount: 150, status: 'paid' as PaymentStatus },
        { amount: 200, status: 'pending' as PaymentStatus },
        { amount: 50, status: 'failed' as PaymentStatus },
      ];

      for (const p of payments) {
        const paymentData = {
          patient_id: testPatientId,
          amount: p.amount,
          payment_method: 'pix' as PaymentMethod,
          description: `Test ${p.status}`,
        };
        const created = await paymentService.createPayment(paymentData);
        if (p.status !== 'pending') {
          await paymentService.updatePaymentStatus(created.id, p.status);
        }
        if (payments.indexOf(p) === payments.length - 1) {
          testPaymentId = created.id; // Last one for cleanup
        }
      }
    });

    it('should calculate correct stats', async () => {
      const stats = await paymentService.getPaymentStats(testPatientId);

      expect(stats.total_paid).toBeGreaterThanOrEqual(250); // 100 + 150
      expect(stats.total_pending).toBeGreaterThanOrEqual(200);
      expect(stats.payment_count).toBeGreaterThanOrEqual(4);
    });

    it('should have valid stat structure', async () => {
      const stats = await paymentService.getPaymentStats(testPatientId);

      expect(typeof stats.total_paid).toBe('number');
      expect(typeof stats.total_pending).toBe('number');
      expect(typeof stats.total_failed).toBe('number');
      expect(typeof stats.payment_count).toBe('number');
      expect(typeof stats.average_payment).toBe('number');
    });
  });

  describe('Payment Methods', () => {
    const paymentMethods: PaymentMethod[] = ['pix', 'credit_card', 'debit_card', 'boleto', 'cash'];

    paymentMethods.forEach(method => {
      it(`should create payment with ${method} method`, async () => {
        const paymentData = {
          patient_id: testPatientId,
          amount: 100.00,
          payment_method: method,
          description: `Test ${method}`,
        };

        const payment = await paymentService.createPayment(paymentData);
        testPaymentId = payment.id;

        expect(payment.payment_method).toBe(method);
      });
    });
  });

  describe('Payment Status Transitions', () => {
    beforeEach(async () => {
      const paymentData = {
        patient_id: testPatientId,
        amount: 150.00,
        payment_method: 'pix' as PaymentMethod,
        description: 'Status transition test',
      };
      const payment = await paymentService.createPayment(paymentData);
      testPaymentId = payment.id;
    });

    it('should transition from pending to paid', async () => {
      let payment = await paymentService.getPaymentById(testPaymentId!);
      expect(payment?.status).toBe('pending');

      payment = await paymentService.updatePaymentStatus(testPaymentId!, 'paid');
      expect(payment.status).toBe('paid');
    });

    it('should transition from pending to failed', async () => {
      let payment = await paymentService.getPaymentById(testPaymentId!);
      expect(payment?.status).toBe('pending');

      payment = await paymentService.updatePaymentStatus(testPaymentId!, 'failed');
      expect(payment.status).toBe('failed');
    });

    it('should transition from paid to refunded', async () => {
      await paymentService.updatePaymentStatus(testPaymentId!, 'paid', 'txn-123');

      const refunded = await paymentService.processRefund(testPaymentId!, 150.00);
      expect(refunded.status).toBe('refunded');
    });
  });

  describe('Data Integrity', () => {
    it('should store amounts with correct precision', async () => {
      const paymentData = {
        patient_id: testPatientId,
        amount: 123.45,
        payment_method: 'pix' as PaymentMethod,
        description: 'Precision test',
      };

      const payment = await paymentService.createPayment(paymentData);
      testPaymentId = payment.id;

      expect(payment.amount).toBe(123.45);
    });

    it('should maintain timestamps correctly', async () => {
      const before = new Date();

      const paymentData = {
        patient_id: testPatientId,
        amount: 100.00,
        payment_method: 'pix' as PaymentMethod,
        description: 'Timestamp test',
      };

      const payment = await paymentService.createPayment(paymentData);
      testPaymentId = payment.id;

      const after = new Date();

      const createdAt = new Date(payment.created_at!);
      expect(createdAt >= before).toBe(true);
      expect(createdAt <= after).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid payment ID', async () => {
      await expect(
        paymentService.getPaymentById('invalid-id')
      ).rejects.toThrow();
    });

    it('should handle missing required fields', async () => {
      const invalidData = {
        patient_id: '',
        amount: 0,
        payment_method: 'pix' as PaymentMethod,
        description: '',
      } as any;

      await expect(
        paymentService.createPayment(invalidData)
      ).rejects.toThrow();
    });

    it('should handle refund on non-paid payment', async () => {
      const paymentData = {
        patient_id: testPatientId,
        amount: 100.00,
        payment_method: 'pix' as PaymentMethod,
        description: 'Pending payment',
      };

      const payment = await paymentService.createPayment(paymentData);
      testPaymentId = payment.id;

      await expect(
        paymentService.processRefund(testPaymentId!, 50.00)
      ).rejects.toThrow();
    });
  });
});
