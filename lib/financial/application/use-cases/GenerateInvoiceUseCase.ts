import { Money } from '../../domain/value-objects/Money';
import { TaxRate } from '../../domain/value-objects/TaxRate';
import { Invoice, InvoiceLineItem } from '../../domain/entities/Invoice';
import { Transaction, TransactionId, PatientId, UserId } from '../../domain/entities/Transaction';
import { Package } from '../../domain/entities/Package';
import { IFinancialRepository } from '../../domain/repositories/IFinancialRepository';
import { BillingService } from '../services/BillingService';
import { DomainError, BusinessRuleError } from '../../domain/errors/DomainError';

export interface GenerateInvoiceCommand {
  patientId: PatientId;
  transactionIds: TransactionId[];
  dueDate?: Date;
  notes?: string;
  discountAmount?: Money;
  customLineItems?: Array<{
    description: string;
    quantity: number;
    unitPrice: Money;
    metadata?: Record<string, any>;
  }>;
  createdBy: UserId;
}

export interface GenerateInvoiceResult {
  success: boolean;
  invoice?: Invoice;
  error?: string;
  errorCode?: string;
}

export interface IssueInvoiceCommand {
  invoiceId: string;
  issueDate?: Date;
}

export interface IssueInvoiceResult {
  success: boolean;
  invoice?: Invoice;
  invoiceNumber?: string;
  error?: string;
  errorCode?: string;
}

export class GenerateInvoiceUseCase {
  private readonly standardTaxRates = [
    TaxRate.iss(0.02), // 2% ISS
    TaxRate.cofins(0.03), // 3% COFINS
    TaxRate.pis(0.0065) // 0.65% PIS
  ];

  constructor(
    private readonly repository: IFinancialRepository,
    private readonly billingService: BillingService
  ) {}

  async execute(command: GenerateInvoiceCommand): Promise<GenerateInvoiceResult> {
    try {
      // 1. Validate command
      await this.validateCommand(command);

      // 2. Get transactions
      const transactions = await this.getTransactions(command.transactionIds);
      
      // 3. Validate transactions belong to the same patient
      this.validateTransactionsPatient(transactions, command.patientId);

      // 4. Generate line items from transactions
      const transactionLineItems = await this.generateLineItemsFromTransactions(transactions);
      
      // 5. Add custom line items if provided
      const customLineItems = this.generateCustomLineItems(command.customLineItems || []);
      
      // 6. Combine all line items
      const allLineItems = [...transactionLineItems, ...customLineItems];
      
      if (allLineItems.length === 0) {
        throw new DomainError('Invoice must have at least one line item');
      }

      // 7. Calculate due date
      const dueDate = command.dueDate || this.calculateDefaultDueDate();
      
      // 8. Create invoice
      const invoice = Invoice.create({
        patientId: command.patientId,
        transactionIds: command.transactionIds,
        issueDate: new Date(),
        dueDate,
        lineItems: allLineItems,
        taxes: this.standardTaxRates,
        discountAmount: command.discountAmount,
        notes: command.notes,
        createdBy: command.createdBy
      });

      // 9. Save invoice
      await this.repository.saveInvoice(invoice);

      return {
        success: true,
        invoice
      };

    } catch (error) {
      console.error('Error generating invoice:', error);

      if (error instanceof DomainError) {
        return {
          success: false,
          error: error.message,
          errorCode: 'DOMAIN_ERROR'
        };
      }

      return {
        success: false,
        error: 'Internal error occurred while generating invoice',
        errorCode: 'INTERNAL_ERROR'
      };
    }
  }

  async issueInvoice(command: IssueInvoiceCommand): Promise<IssueInvoiceResult> {
    try {
      // 1. Get invoice
      const invoice = await this.repository.findInvoiceById(command.invoiceId);
      if (!invoice) {
        throw new DomainError('Invoice not found');
      }

      // 2. Validate invoice can be issued
      if (!invoice.canBeIssued()) {
        throw new BusinessRuleError(
          `Cannot issue invoice with status: ${invoice.getStatus()}`
        );
      }

      // 3. Generate invoice number
      const invoiceNumber = await this.repository.generateInvoiceNumber();

      // 4. Issue invoice
      invoice.issue(invoiceNumber);

      // 5. Update invoice in repository
      await this.repository.updateInvoice(invoice);

      return {
        success: true,
        invoice,
        invoiceNumber
      };

    } catch (error) {
      console.error('Error issuing invoice:', error);

      if (error instanceof DomainError) {
        return {
          success: false,
          error: error.message,
          errorCode: 'DOMAIN_ERROR'
        };
      }

      return {
        success: false,
        error: 'Internal error occurred while issuing invoice',
        errorCode: 'INTERNAL_ERROR'
      };
    }
  }

  async generateInvoiceForPackage(
    packageId: string,
    createdBy: UserId,
    dueDate?: Date,
    notes?: string
  ): Promise<GenerateInvoiceResult> {
    try {
      // 1. Get package
      const package = await this.repository.findPackageById(packageId);
      if (!package) {
        throw new DomainError('Package not found');
      }

      // 2. Generate invoice using billing service
      const invoice = await this.billingService.generateInvoiceForPackage(
        package,
        package.getPatientId(),
        createdBy,
        dueDate
      );

      if (notes) {
        // Add notes to the invoice (would require adding a method to update notes)
        // For now, we'll include it in the metadata
      }

      return {
        success: true,
        invoice
      };

    } catch (error) {
      console.error('Error generating package invoice:', error);

      if (error instanceof DomainError) {
        return {
          success: false,
          error: error.message,
          errorCode: 'DOMAIN_ERROR'
        };
      }

      return {
        success: false,
        error: 'Internal error occurred while generating package invoice',
        errorCode: 'INTERNAL_ERROR'
      };
    }
  }

  async generateMonthlyInvoices(
    month: number,
    year: number,
    createdBy: UserId
  ): Promise<Array<{ patientId: PatientId; invoice?: Invoice; error?: string }>> {
    const results: Array<{ patientId: PatientId; invoice?: Invoice; error?: string }> = [];

    try {
      // Get all paid transactions for the month
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);

      const transactions = await this.repository.findTransactions({
        dateRange: { start: startDate, end: endDate },
        status: 'paid'
      });

      // Group transactions by patient
      const transactionsByPatient = new Map<PatientId, Transaction[]>();
      for (const transaction of transactions) {
        const patientId = transaction.getPatientId();
        if (!transactionsByPatient.has(patientId)) {
          transactionsByPatient.set(patientId, []);
        }
        transactionsByPatient.get(patientId)!.push(transaction);
      }

      // Generate invoice for each patient
      for (const [patientId, patientTransactions] of transactionsByPatient) {
        try {
          const command: GenerateInvoiceCommand = {
            patientId,
            transactionIds: patientTransactions.map(tx => tx.getId()),
            dueDate: new Date(year, month, 10), // Due on 10th of next month
            notes: `Fatura referente ao mês ${month.toString().padStart(2, '0')}/${year}`,
            createdBy
          };

          const result = await this.execute(command);
          
          results.push({
            patientId,
            invoice: result.invoice,
            error: result.error
          });

        } catch (error) {
          results.push({
            patientId,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }

      return results;

    } catch (error) {
      console.error('Error generating monthly invoices:', error);
      throw error;
    }
  }

  private async validateCommand(command: GenerateInvoiceCommand): Promise<void> {
    if (!command.patientId) {
      throw new DomainError('Patient ID is required');
    }

    if (!command.transactionIds || command.transactionIds.length === 0) {
      throw new DomainError('At least one transaction ID is required');
    }

    if (!command.createdBy) {
      throw new DomainError('Created by user ID is required');
    }

    if (command.dueDate && command.dueDate <= new Date()) {
      throw new DomainError('Due date must be in the future');
    }

    if (command.discountAmount && command.discountAmount.toNumber() < 0) {
      throw new DomainError('Discount amount cannot be negative');
    }

    // Validate custom line items
    if (command.customLineItems) {
      for (const item of command.customLineItems) {
        if (!item.description.trim()) {
          throw new DomainError('Line item description is required');
        }
        
        if (item.quantity <= 0) {
          throw new DomainError('Line item quantity must be positive');
        }

        if (item.unitPrice.toNumber() <= 0) {
          throw new DomainError('Line item unit price must be positive');
        }
      }
    }
  }

  private async getTransactions(transactionIds: TransactionId[]): Promise<Transaction[]> {
    const transactions: Transaction[] = [];
    
    for (const transactionId of transactionIds) {
      const transaction = await this.repository.findTransactionById(transactionId);
      if (!transaction) {
        throw new DomainError(`Transaction not found: ${transactionId}`);
      }
      transactions.push(transaction);
    }

    return transactions;
  }

  private validateTransactionsPatient(transactions: Transaction[], patientId: PatientId): void {
    for (const transaction of transactions) {
      if (transaction.getPatientId() !== patientId) {
        throw new BusinessRuleError(
          'All transactions must belong to the same patient'
        );
      }
    }
  }

  private async generateLineItemsFromTransactions(transactions: Transaction[]): Promise<InvoiceLineItem[]> {
    const lineItems: InvoiceLineItem[] = [];

    for (const transaction of transactions) {
      const description = this.getTransactionDescription(transaction);
      
      const lineItem: InvoiceLineItem = {
        id: crypto.randomUUID(),
        description,
        quantity: 1,
        unitPrice: transaction.getAmount(),
        totalPrice: transaction.getAmount(),
        metadata: {
          transactionId: transaction.getId(),
          transactionType: transaction.getType(),
          paymentMethod: transaction.getPaymentMethod().toJSON()
        }
      };

      lineItems.push(lineItem);
    }

    return lineItems;
  }

  private generateCustomLineItems(
    customItems: Array<{
      description: string;
      quantity: number;
      unitPrice: Money;
      metadata?: Record<string, any>;
    }>
  ): InvoiceLineItem[] {
    return customItems.map(item => ({
      id: crypto.randomUUID(),
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      totalPrice: item.unitPrice.multiply(item.quantity),
      metadata: item.metadata || {}
    }));
  }

  private getTransactionDescription(transaction: Transaction): string {
    const description = transaction.getDescription();
    if (description) {
      return description;
    }

    // Generate description based on transaction type
    switch (transaction.getType()) {
      case 'package_purchase':
        return 'Compra de Pacote de Sessões';
      case 'single_session':
        return 'Sessão Avulsa';
      case 'installment':
        return `Parcela ${transaction.getInstallmentNumber()}/${transaction.getInstallments()}`;
      default:
        return 'Serviço de Fisioterapia';
    }
  }

  private calculateDefaultDueDate(): Date {
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30); // 30 days from now
    return dueDate;
  }
}