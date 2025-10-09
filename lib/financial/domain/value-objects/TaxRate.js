import { DomainError } from '../errors/DomainError';
import { Money } from './Money';
export var TaxType;
(function (TaxType) {
    TaxType["ISS"] = "iss";
    TaxType["COFINS"] = "cofins";
    TaxType["PIS"] = "pis";
    TaxType["CSLL"] = "csll";
    TaxType["IRPJ"] = "irpj";
    TaxType["ICMS"] = "icms";
    TaxType["IPI"] = "ipi";
})(TaxType || (TaxType = {}));
export class TaxRate {
    constructor(type, rate, description, isActive = true) {
        this.type = type;
        this.rate = rate;
        this.description = description;
        this.isActive = isActive;
        this.validate();
    }
    static create(data) {
        return new TaxRate(data.type, data.rate, data.description, data.isActive ?? true);
    }
    static iss(rate) {
        return new TaxRate(TaxType.ISS, rate, 'Imposto Sobre Serviços');
    }
    static cofins(rate) {
        return new TaxRate(TaxType.COFINS, rate, 'Contribuição para o Financiamento da Seguridade Social');
    }
    static pis(rate) {
        return new TaxRate(TaxType.PIS, rate, 'Programa de Integração Social');
    }
    getType() {
        return this.type;
    }
    getRate() {
        return this.rate;
    }
    getPercentage() {
        return this.rate * 100;
    }
    getDescription() {
        return this.description || this.getDefaultDescription();
    }
    isActiveRate() {
        return this.isActive;
    }
    calculateTax(baseAmount) {
        if (!this.isActive) {
            return Money.zero(baseAmount.toJSON().currency);
        }
        return baseAmount.multiply(this.rate);
    }
    calculateNetAmount(grossAmount) {
        const taxAmount = this.calculateTax(grossAmount);
        return grossAmount.subtract(taxAmount);
    }
    calculateGrossAmount(netAmount) {
        const divisor = 1 - this.rate;
        if (divisor <= 0) {
            throw new DomainError('Tax rate cannot be 100% or higher for gross calculation');
        }
        return netAmount.divide(divisor);
    }
    equals(other) {
        return this.type === other.type &&
            this.rate === other.rate &&
            this.isActive === other.isActive;
    }
    toString() {
        return `${this.getDescription()}: ${this.getPercentage().toFixed(2)}%`;
    }
    toJSON() {
        return {
            type: this.type,
            rate: this.rate,
            percentage: this.getPercentage(),
            description: this.getDescription(),
            isActive: this.isActive
        };
    }
    validate() {
        if (this.rate < 0) {
            throw new DomainError('Tax rate cannot be negative');
        }
        if (this.rate >= 1) {
            throw new DomainError('Tax rate cannot be 100% or higher');
        }
        // Validate specific tax type ranges
        switch (this.type) {
            case TaxType.ISS:
                if (this.rate > 0.05) { // ISS max 5%
                    throw new DomainError('ISS rate cannot exceed 5%');
                }
                break;
            case TaxType.COFINS:
                if (this.rate > 0.076) { // COFINS max 7.6%
                    throw new DomainError('COFINS rate cannot exceed 7.6%');
                }
                break;
            case TaxType.PIS:
                if (this.rate > 0.0165) { // PIS max 1.65%
                    throw new DomainError('PIS rate cannot exceed 1.65%');
                }
                break;
        }
    }
    getDefaultDescription() {
        switch (this.type) {
            case TaxType.ISS:
                return 'Imposto Sobre Serviços';
            case TaxType.COFINS:
                return 'Contribuição para o Financiamento da Seguridade Social';
            case TaxType.PIS:
                return 'Programa de Integração Social';
            case TaxType.CSLL:
                return 'Contribuição Social sobre o Lucro Líquido';
            case TaxType.IRPJ:
                return 'Imposto de Renda Pessoa Jurídica';
            case TaxType.ICMS:
                return 'Imposto sobre Circulação de Mercadorias e Serviços';
            case TaxType.IPI:
                return 'Imposto sobre Produtos Industrializados';
            default:
                return 'Imposto';
        }
    }
}
export class TaxCalculator {
    constructor(taxes = []) {
        this.taxes = [];
        this.taxes = taxes.filter(tax => tax.isActiveRate());
    }
    addTax(tax) {
        if (tax.isActiveRate()) {
            this.taxes.push(tax);
        }
    }
    calculateTotalTax(baseAmount) {
        return this.taxes.reduce((total, tax) => {
            return total.add(tax.calculateTax(baseAmount));
        }, Money.zero(baseAmount.toJSON().currency));
    }
    calculateNetAmount(grossAmount) {
        const totalTax = this.calculateTotalTax(grossAmount);
        return grossAmount.subtract(totalTax);
    }
    getTaxBreakdown(baseAmount) {
        return this.taxes.map(tax => ({
            type: tax.getType(),
            amount: tax.calculateTax(baseAmount),
            rate: tax.getRate()
        }));
    }
    getTotalTaxRate() {
        return this.taxes.reduce((total, tax) => total + tax.getRate(), 0);
    }
}
