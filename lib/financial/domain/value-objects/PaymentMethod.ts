import { DomainError } from '../errors/DomainError';

export enum PaymentMethodType {
  CREDIT_CARD = 'credit_card',
  DEBIT_CARD = 'debit_card',
  PIX = 'pix',
  BANK_SLIP = 'bank_slip',
  CASH = 'cash',
  BANK_TRANSFER = 'bank_transfer'
}

export interface PaymentMethodData {
  type: PaymentMethodType;
  cardBrand?: string;
  lastFourDigits?: string;
  expiryMonth?: number;
  expiryYear?: number;
  holderName?: string;
  gatewayPaymentMethodId?: string;
  metadata?: Record<string, any>;
}

export class PaymentMethod {
  private constructor(
    private readonly type: PaymentMethodType,
    private readonly cardBrand?: string,
    private readonly lastFourDigits?: string,
    private readonly expiryMonth?: number,
    private readonly expiryYear?: number,
    private readonly holderName?: string,
    private readonly gatewayPaymentMethodId?: string,
    private readonly metadata?: Record<string, any>
  ) {
    this.validate();
  }

  static create(data: PaymentMethodData): PaymentMethod {
    return new PaymentMethod(
      data.type,
      data.cardBrand,
      data.lastFourDigits,
      data.expiryMonth,
      data.expiryYear,
      data.holderName,
      data.gatewayPaymentMethodId,
      data.metadata
    );
  }

  static creditCard(
    cardBrand: string,
    lastFourDigits: string,
    expiryMonth: number,
    expiryYear: number,
    holderName: string,
    gatewayPaymentMethodId?: string
  ): PaymentMethod {
    return new PaymentMethod(
      PaymentMethodType.CREDIT_CARD,
      cardBrand,
      lastFourDigits,
      expiryMonth,
      expiryYear,
      holderName,
      gatewayPaymentMethodId
    );
  }

  static pix(): PaymentMethod {
    return new PaymentMethod(PaymentMethodType.PIX);
  }

  static cash(): PaymentMethod {
    return new PaymentMethod(PaymentMethodType.CASH);
  }

  static bankSlip(): PaymentMethod {
    return new PaymentMethod(PaymentMethodType.BANK_SLIP);
  }

  getType(): PaymentMethodType {
    return this.type;
  }

  getCardBrand(): string | undefined {
    return this.cardBrand;
  }

  getLastFourDigits(): string | undefined {
    return this.lastFourDigits;
  }

  getDisplayName(): string {
    switch (this.type) {
      case PaymentMethodType.CREDIT_CARD:
        return `${this.cardBrand} ****${this.lastFourDigits}`;
      case PaymentMethodType.DEBIT_CARD:
        return `Débito ${this.cardBrand} ****${this.lastFourDigits}`;
      case PaymentMethodType.PIX:
        return 'PIX';
      case PaymentMethodType.BANK_SLIP:
        return 'Boleto Bancário';
      case PaymentMethodType.CASH:
        return 'Dinheiro';
      case PaymentMethodType.BANK_TRANSFER:
        return 'Transferência Bancária';
      default:
        return 'Método não especificado';
    }
  }

  isCard(): boolean {
    return this.type === PaymentMethodType.CREDIT_CARD || this.type === PaymentMethodType.DEBIT_CARD;
  }

  isExpired(): boolean {
    if (!this.isCard() || !this.expiryMonth || !this.expiryYear) {
      return false;
    }

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    return this.expiryYear < currentYear || 
           (this.expiryYear === currentYear && this.expiryMonth < currentMonth);
  }

  supportsInstallments(): boolean {
    return this.type === PaymentMethodType.CREDIT_CARD;
  }

  requiresOnlineProcessing(): boolean {
    return this.type !== PaymentMethodType.CASH;
  }

  toJSON() {
    return {
      type: this.type,
      cardBrand: this.cardBrand,
      lastFourDigits: this.lastFourDigits,
      expiryMonth: this.expiryMonth,
      expiryYear: this.expiryYear,
      holderName: this.holderName,
      gatewayPaymentMethodId: this.gatewayPaymentMethodId,
      metadata: this.metadata
    };
  }

  private validate(): void {
    if (this.isCard()) {
      if (!this.cardBrand || !this.lastFourDigits || !this.holderName) {
        throw new DomainError('Card payment method requires brand, last four digits, and holder name');
      }
      
      if (!this.expiryMonth || !this.expiryYear) {
        throw new DomainError('Card payment method requires expiry date');
      }

      if (this.expiryMonth < 1 || this.expiryMonth > 12) {
        throw new DomainError('Invalid expiry month');
      }

      if (this.lastFourDigits.length !== 4 || !/^\d{4}$/.test(this.lastFourDigits)) {
        throw new DomainError('Last four digits must be exactly 4 numeric characters');
      }

      if (this.isExpired()) {
        throw new DomainError('Payment method is expired');
      }
    }
  }
}
