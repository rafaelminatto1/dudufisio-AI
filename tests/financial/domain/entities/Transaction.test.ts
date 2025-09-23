import { Transaction, TransactionType, TransactionStatus } from '../../../../lib/financial/domain/entities/Transaction';
import { Money } from '../../../../lib/financial/domain/value-objects/Money';
import { PaymentMethod, PaymentMethodType } from '../../../../lib/financial/domain/value-objects/PaymentMethod';
import { DomainError, BusinessRuleError } from '../../../../lib/financial/domain/errors/DomainError';

describe('Transaction Entity', () => {
  const mockPaymentMethod = PaymentMethod.creditCard(
    'visa',
    '1234',
    12,
    2025,
    'John Doe',
    'pm_123'
  );

  const validTransactionData = {
    patientId: 'patient-123',
    type: TransactionType.PACKAGE_PURCHASE,
    amount: new Money(100, 'BRL'),
    paymentMethod: mockPaymentMethod,
    dueDate: new Date('2024-12-31'),
    createdBy: 'user-123'
  };

  describe('Creation', () => {
    it('should create transaction with valid data', () => {
      const transaction = Transaction.create(validTransactionData);
      
      expect(transaction.getPatientId()).toBe('patient-123');
      expect(transaction.getType()).toBe(TransactionType.PACKAGE_PURCHASE);
      expect(transaction.getAmount().equals(new Money(100, 'BRL'))).toBe(true);
      expect(transaction.getStatus()).toBe(TransactionStatus.PENDING);
      expect(transaction.getInstallments()).toBe(1);
      expect(transaction.getInstallmentNumber()).toBe(1);
    });

    it('should create transaction with installments', () => {
      const transactionData = {
        ...validTransactionData,
        installments: 3,
        installmentNumber: 2
      };
      
      const transaction = Transaction.create(transactionData);
      
      expect(transaction.getInstallments()).toBe(3);
      expect(transaction.getInstallmentNumber()).toBe(2);
      expect(transaction.getInstallmentDescription()).toBe('2/3');
    });

    it('should generate unique ID if not provided', () => {
      const transaction1 = Transaction.create(validTransactionData);
      const transaction2 = Transaction.create(validTransactionData);
      
      expect(transaction1.getId()).not.toBe(transaction2.getId());
    });

    it('should use provided ID', () => {
      const transactionData = {
        ...validTransactionData,
        id: 'custom-id'
      };
      
      const transaction = Transaction.create(transactionData);
      expect(transaction.getId()).toBe('custom-id');
    });
  });

  describe('Validation', () => {
    it('should throw error for missing patient ID', () => {
      const invalidData = { ...validTransactionData, patientId: '' };
      expect(() => Transaction.create(invalidData)).toThrow(DomainError);
    });

    it('should throw error for missing created by', () => {
      const invalidData = { ...validTransactionData, createdBy: '' };
      expect(() => Transaction.create(invalidData)).toThrow(DomainError);
    });

    it('should throw error for invalid installments', () => {
      const invalidData = { ...validTransactionData, installments: 0 };
      expect(() => Transaction.create(invalidData)).toThrow(DomainError);
      
      const invalidData2 = { ...validTransactionData, installments: 15 };
      expect(() => Transaction.create(invalidData2)).toThrow(DomainError);
    });

    it('should throw error for invalid installment number', () => {
      const invalidData = {
        ...validTransactionData,
        installments: 3,
        installmentNumber: 5
      };
      expect(() => Transaction.create(invalidData)).toThrow(DomainError);
    });

    it('should throw error for zero amount', () => {
      const invalidData = {
        ...validTransactionData,
        amount: Money.zero()
      };
      expect(() => Transaction.create(invalidData)).toThrow(DomainError);
    });

    it('should throw error for installments with unsupported payment method', () => {
      const pixPayment = PaymentMethod.pix();
      const invalidData = {
        ...validTransactionData,
        paymentMethod: pixPayment,
        installments: 3
      };
      expect(() => Transaction.create(invalidData)).toThrow(DomainError);
    });
  });

  describe('Status Management', () => {
    let transaction: Transaction;

    beforeEach(() => {
      transaction = Transaction.create(validTransactionData);
    });

    it('should mark transaction as paid', () => {
      const paidDate = new Date();
      const gatewayId = 'gateway-123';
      const gatewayResponse = { status: 'success' };

      expect(transaction.canBePaid()).toBe(true);
      
      transaction.markAsPaid(paidDate, gatewayId, gatewayResponse);
      
      expect(transaction.getStatus()).toBe(TransactionStatus.PAID);
      expect(transaction.getPaidDate()).toEqual(paidDate);
      expect(transaction.getGatewayTransactionId()).toBe(gatewayId);
      expect(transaction.isPaid()).toBe(true);
    });

    it('should mark transaction as overdue', () => {
      expect(transaction.canBePaid()).toBe(true);
      
      transaction.markAsOverdue();
      
      expect(transaction.getStatus()).toBe(TransactionStatus.OVERDUE);
      expect(transaction.isOverdue()).toBe(true);
    });

    it('should cancel transaction', () => {
      const reason = 'Customer request';
      
      expect(transaction.canBeCancelled()).toBe(true);
      
      transaction.cancel(reason);
      
      expect(transaction.getStatus()).toBe(TransactionStatus.CANCELLED);
      expect(transaction.isCancelled()).toBe(true);
      expect(transaction.getMetadata().cancellationReason).toBe(reason);
    });

    it('should refund transaction', () => {
      // First mark as paid
      transaction.markAsPaid(new Date());
      
      const refundAmount = new Money(50, 'BRL');
      const reason = 'Partial refund';
      
      expect(transaction.canBeRefunded()).toBe(true);
      
      transaction.refund(refundAmount, reason);
      
      expect(transaction.getStatus()).toBe(TransactionStatus.REFUNDED);
      expect(transaction.isRefunded()).toBe(true);
      expect(transaction.getMetadata().refundAmount).toEqual(refundAmount.toJSON());
      expect(transaction.getMetadata().refundReason).toBe(reason);
    });

    it('should not allow invalid status transitions', () => {
      // Cancel transaction first
      transaction.cancel();
      
      // Should not be able to mark cancelled transaction as paid
      expect(() => transaction.markAsPaid(new Date())).toThrow(BusinessRuleError);
    });

    it('should not allow refund amount greater than transaction amount', () => {
      transaction.markAsPaid(new Date());
      
      const refundAmount = new Money(200, 'BRL'); // Greater than transaction amount
      
      expect(() => transaction.refund(refundAmount)).toThrow(BusinessRuleError);
    });
  });

  describe('Business Logic', () => {
    it('should calculate net amount correctly', () => {
      const transactionData = {
        ...validTransactionData,
        amount: new Money(100, 'BRL'),
        taxAmount: new Money(10, 'BRL')
      };
      
      const transaction = Transaction.create(transactionData);
      
      expect(transaction.getNetAmount().equals(new Money(90, 'BRL'))).toBe(true);
    });

    it('should calculate days overdue correctly', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 5);
      
      const transactionData = {
        ...validTransactionData,
        dueDate: pastDate
      };
      
      const transaction = Transaction.create(transactionData);
      transaction.markAsOverdue();
      
      expect(transaction.getDaysOverdue()).toBeGreaterThanOrEqual(5);
    });

    it('should return correct installment description', () => {
      const singleInstallment = Transaction.create(validTransactionData);
      expect(singleInstallment.getInstallmentDescription()).toBe('À vista');
      
      const multipleInstallments = Transaction.create({
        ...validTransactionData,
        installments: 3,
        installmentNumber: 2
      });
      expect(multipleInstallments.getInstallmentDescription()).toBe('2/3');
    });

    it('should set fiscal document number', () => {
      const transaction = Transaction.create(validTransactionData);
      const documentNumber = 'NF-123456';
      
      transaction.setFiscalDocumentNumber(documentNumber);
      
      expect(transaction.getFiscalDocumentNumber()).toBe(documentNumber);
    });

    it('should update gateway response', () => {
      const transaction = Transaction.create(validTransactionData);
      const response = { status: 'processing', id: 'gw-123' };
      
      transaction.updateGatewayResponse(response);
      
      expect(transaction.getMetadata()).toMatchObject({
        ...transaction.getMetadata(),
        ...response
      });
    });
  });

  describe('Serialization', () => {
    it('should serialize to JSON correctly', () => {
      const transaction = Transaction.create(validTransactionData);
      const json = transaction.toJSON();
      
      expect(json).toMatchObject({
        id: expect.any(String),
        patientId: 'patient-123',
        type: TransactionType.PACKAGE_PURCHASE,
        amount: { amount: 100, currency: 'BRL' },
        paymentMethod: expect.any(Object),
        installments: 1,
        installmentNumber: 1,
        status: TransactionStatus.PENDING,
        createdBy: 'user-123',
        version: 1
      });
      
      expect(json.dueDate).toMatch(/^\d{4}-\d{2}-\d{2}T/);
      expect(json.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    });
  });

  describe('Version Control', () => {
    it('should increment version on updates', () => {
      const transaction = Transaction.create(validTransactionData);
      const initialVersion = transaction.getVersion();
      
      transaction.markAsPaid(new Date());
      
      expect(transaction.getVersion()).toBe(initialVersion + 1);
    });
  });
});