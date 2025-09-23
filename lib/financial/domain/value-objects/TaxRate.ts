import { DomainError } from '../errors/DomainError';
import { Money } from './Money';

export enum TaxType {
  ISS = 'iss', // Imposto Sobre Serviços
  COFINS = 'cofins',
  PIS = 'pis',
  CSLL = 'csll',
  IRPJ = 'irpj',
  ICMS = 'icms',
  IPI = 'ipi'
}

export interface TaxRateData {
  type: TaxType;
  rate: number; // Percentage as decimal (e.g., 0.05 for 5%)
  description?: string;
  isActive?: boolean;
}

export class TaxRate {
  private constructor(
    private readonly type: TaxType,
    private readonly rate: number,
    private readonly description?: string,
    private readonly isActive: boolean = true
  ) {
    this.validate();
  }

  static create(data: TaxRateData): TaxRate {
    return new TaxRate(
      data.type,
      data.rate,
      data.description,
      data.isActive ?? true
    );
  }

  static iss(rate: number): TaxRate {
    return new TaxRate(TaxType.ISS, rate, 'Imposto Sobre Serviços');
  }

  static cofins(rate: number): TaxRate {
    return new TaxRate(TaxType.COFINS, rate, 'Contribuição para o Financiamento da Seguridade Social');
  }

  static pis(rate: number): TaxRate {
    return new TaxRate(TaxType.PIS, rate, 'Programa de Integração Social');
  }

  getType(): TaxType {
    return this.type;
  }

  getRate(): number {
    return this.rate;
  }

  getPercentage(): number {
    return this.rate * 100;
  }

  getDescription(): string {
    return this.description || this.getDefaultDescription();
  }

  isActiveRate(): boolean {
    return this.isActive;
  }

  calculateTax(baseAmount: Money): Money {
    if (!this.isActive) {
      return Money.zero(baseAmount.toJSON().currency);
    }
    return baseAmount.multiply(this.rate);
  }

  calculateNetAmount(grossAmount: Money): Money {
    const taxAmount = this.calculateTax(grossAmount);
    return grossAmount.subtract(taxAmount);
  }

  calculateGrossAmount(netAmount: Money): Money {
    const divisor = 1 - this.rate;
    if (divisor <= 0) {
      throw new DomainError('Tax rate cannot be 100% or higher for gross calculation');
    }
    return netAmount.divide(divisor);
  }

  equals(other: TaxRate): boolean {
    return this.type === other.type && 
           this.rate === other.rate && 
           this.isActive === other.isActive;
  }

  toString(): string {
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

  private validate(): void {
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

  private getDefaultDescription(): string {
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
  private taxes: TaxRate[] = [];

  constructor(taxes: TaxRate[] = []) {
    this.taxes = taxes.filter(tax => tax.isActiveRate());
  }

  addTax(tax: TaxRate): void {
    if (tax.isActiveRate()) {
      this.taxes.push(tax);
    }
  }

  calculateTotalTax(baseAmount: Money): Money {
    return this.taxes.reduce((total, tax) => {
      return total.add(tax.calculateTax(baseAmount));
    }, Money.zero(baseAmount.toJSON().currency));
  }

  calculateNetAmount(grossAmount: Money): Money {
    const totalTax = this.calculateTotalTax(grossAmount);
    return grossAmount.subtract(totalTax);
  }

  getTaxBreakdown(baseAmount: Money): Array<{type: TaxType, amount: Money, rate: number}> {
    return this.taxes.map(tax => ({
      type: tax.getType(),
      amount: tax.calculateTax(baseAmount),
      rate: tax.getRate()
    }));
  }

  getTotalTaxRate(): number {
    return this.taxes.reduce((total, tax) => total + tax.getRate(), 0);
  }
}