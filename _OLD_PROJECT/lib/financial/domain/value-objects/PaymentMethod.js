import { DomainError } from '../errors/DomainError';
export var PaymentMethodType;
(function (PaymentMethodType) {
    PaymentMethodType["CREDIT_CARD"] = "credit_card";
    PaymentMethodType["DEBIT_CARD"] = "debit_card";
    PaymentMethodType["PIX"] = "pix";
    PaymentMethodType["BANK_SLIP"] = "bank_slip";
    PaymentMethodType["CASH"] = "cash";
    PaymentMethodType["BANK_TRANSFER"] = "bank_transfer";
})(PaymentMethodType || (PaymentMethodType = {}));
export class PaymentMethod {
    constructor(type, cardBrand, lastFourDigits, expiryMonth, expiryYear, holderName, gatewayPaymentMethodId, metadata) {
        this.type = type;
        this.cardBrand = cardBrand;
        this.lastFourDigits = lastFourDigits;
        this.expiryMonth = expiryMonth;
        this.expiryYear = expiryYear;
        this.holderName = holderName;
        this.gatewayPaymentMethodId = gatewayPaymentMethodId;
        this.metadata = metadata;
        this.validate();
    }
    static create(data) {
        return new PaymentMethod(data.type, data.cardBrand, data.lastFourDigits, data.expiryMonth, data.expiryYear, data.holderName, data.gatewayPaymentMethodId, data.metadata);
    }
    static creditCard(cardBrand, lastFourDigits, expiryMonth, expiryYear, holderName, gatewayPaymentMethodId) {
        return new PaymentMethod(PaymentMethodType.CREDIT_CARD, cardBrand, lastFourDigits, expiryMonth, expiryYear, holderName, gatewayPaymentMethodId);
    }
    static pix() {
        return new PaymentMethod(PaymentMethodType.PIX);
    }
    static cash() {
        return new PaymentMethod(PaymentMethodType.CASH);
    }
    static bankSlip() {
        return new PaymentMethod(PaymentMethodType.BANK_SLIP);
    }
    getType() {
        return this.type;
    }
    getCardBrand() {
        return this.cardBrand;
    }
    getLastFourDigits() {
        return this.lastFourDigits;
    }
    getDisplayName() {
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
    isCard() {
        return this.type === PaymentMethodType.CREDIT_CARD || this.type === PaymentMethodType.DEBIT_CARD;
    }
    isExpired() {
        if (!this.isCard() || !this.expiryMonth || !this.expiryYear) {
            return false;
        }
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth() + 1;
        return this.expiryYear < currentYear ||
            (this.expiryYear === currentYear && this.expiryMonth < currentMonth);
    }
    supportsInstallments() {
        return this.type === PaymentMethodType.CREDIT_CARD;
    }
    requiresOnlineProcessing() {
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
    validate() {
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
