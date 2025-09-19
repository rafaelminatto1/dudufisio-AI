import { z } from 'zod';

// Transaction types
export const TransactionType = {
  PAYMENT: 'payment',
  REFUND: 'refund',
  ADJUSTMENT: 'adjustment',
  INSURANCE_CLAIM: 'insurance_claim',
  INSURANCE_PAYMENT: 'insurance_payment'
} as const;

export type TransactionTypeType = typeof TransactionType[keyof typeof TransactionType];

// Payment methods
export const PaymentMethod = {
  CASH: 'cash',
  CREDIT_CARD: 'credit_card',
  DEBIT_CARD: 'debit_card',
  PIX: 'pix',
  BANK_TRANSFER: 'bank_transfer',
  CHECK: 'check',
  INSURANCE: 'insurance',
  VOUCHER: 'voucher'
} as const;

export type PaymentMethodType = typeof PaymentMethod[keyof typeof PaymentMethod];

// Transaction status
export const TransactionStatus = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded'
} as const;

export type TransactionStatusType = typeof TransactionStatus[keyof typeof TransactionStatus];

// Insurance claim status
export const InsuranceClaimStatus = {
  DRAFT: 'draft',
  SUBMITTED: 'submitted',
  IN_REVIEW: 'in_review',
  APPROVED: 'approved',
  PARTIALLY_APPROVED: 'partially_approved',
  DENIED: 'denied',
  PAID: 'paid'
} as const;

export type InsuranceClaimStatusType = typeof InsuranceClaimStatus[keyof typeof InsuranceClaimStatus];

// Base Financial Transaction interface
export interface FinancialTransaction {
  id: string;
  
  // Transaction details
  transaction_type: TransactionTypeType;
  amount: number;
  currency: string;
  description: string;
  
  // Related entities
  patient_id: string;
  appointment_id?: string | null;
  invoice_id?: string | null;
  insurance_claim_id?: string | null;
  
  // Payment details
  payment_method?: PaymentMethodType | null;
  payment_date?: string | null;
  due_date?: string | null;
  
  // Status
  status: TransactionStatusType;
  
  // Reference numbers
  reference_number?: string | null;
  receipt_number?: string | null;
  
  // System fields
  created_at: string;
  updated_at: string;
  created_by: string;
  
  // Metadata
  notes?: string | null;
  metadata?: Record<string, any> | null;
}

// Invoice interface
export interface Invoice {
  id: string;
  
  // Invoice details
  invoice_number: string;
  patient_id: string;
  issue_date: string;
  due_date: string;
  
  // Amounts
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  paid_amount: number;
  balance: number;
  
  // Status
  status: 'draft' | 'sent' | 'paid' | 'partially_paid' | 'overdue' | 'cancelled';
  
  // Payment terms
  payment_terms: string;
  
  // System fields
  created_at: string;
  updated_at: string;
  
  // Related data
  items?: InvoiceItem[];
  transactions?: FinancialTransaction[];
}

// Invoice item interface
export interface InvoiceItem {
  id: string;
  invoice_id: string;
  
  // Item details
  description: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  
  // Related entities
  appointment_id?: string | null;
  session_id?: string | null;
  
  // Tax and discount
  tax_rate?: number | null;
  tax_amount?: number | null;
  discount_rate?: number | null;
  discount_amount?: number | null;
  
  // Metadata
  service_code?: string | null;
  notes?: string | null;
}

// Insurance claim interface
export interface InsuranceClaim {
  id: string;
  
  // Claim details
  claim_number: string;
  patient_id: string;
  insurance_provider_id: string;
  insurance_plan_id?: string | null;
  
  // Dates
  service_date: string;
  submission_date?: string | null;
  approval_date?: string | null;
  payment_date?: string | null;
  
  // Amounts
  claimed_amount: number;
  approved_amount?: number | null;
  paid_amount?: number | null;
  patient_copay?: number | null;
  deductible?: number | null;
  
  // Status
  status: InsuranceClaimStatusType;
  
  // Related entities
  appointments?: string[] | null;
  sessions?: string[] | null;
  
  // Documents
  authorization_number?: string | null;
  denial_reason?: string | null;
  
  // System fields
  created_at: string;
  updated_at: string;
  submitted_by?: string | null;
  
  // Metadata
  notes?: string | null;
  attachments?: string[] | null;
}

// Insurance provider interface
export interface InsuranceProvider {
  id: string;
  
  // Provider details
  name: string;
  code: string;
  tax_id: string;
  
  // Contact information
  phone: string;
  email?: string | null;
  website?: string | null;
  
  // Address
  address: {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zip_code: string;
  };
  
  // Contract details
  contract_number?: string | null;
  contract_start_date?: string | null;
  contract_end_date?: string | null;
  
  // Payment terms
  payment_terms_days: number;
  reimbursement_percentage?: number | null;
  
  // Status
  active: boolean;
  
  // System fields
  created_at: string;
  updated_at: string;
}

// Patient financial summary
export interface PatientFinancialSummary {
  patient_id: string;
  
  // Balance information
  total_charges: number;
  total_payments: number;
  total_adjustments: number;
  current_balance: number;
  overdue_balance: number;
  
  // Insurance information
  insurance_coverage?: {
    provider: string;
    plan: string;
    coverage_percentage: number;
    deductible_met: number;
    deductible_limit: number;
    out_of_pocket_met: number;
    out_of_pocket_limit: number;
  } | null;
  
  // Payment history
  last_payment_date?: string | null;
  last_payment_amount?: number | null;
  
  // Statistics
  average_payment_time_days: number;
  payment_compliance_rate: number;
  
  // Pending items
  pending_invoices: number;
  pending_claims: number;
  
  // Period data
  period_start?: string | null;
  period_end?: string | null;
}

// Payment plan interface
export interface PaymentPlan {
  id: string;
  
  // Plan details
  patient_id: string;
  invoice_id?: string | null;
  
  // Plan terms
  total_amount: number;
  down_payment: number;
  number_of_installments: number;
  installment_amount: number;
  
  // Schedule
  start_date: string;
  frequency: 'weekly' | 'biweekly' | 'monthly';
  
  // Status
  status: 'active' | 'completed' | 'defaulted' | 'cancelled';
  
  // Progress
  paid_installments: number;
  remaining_installments: number;
  paid_amount: number;
  remaining_amount: number;
  
  // System fields
  created_at: string;
  updated_at: string;
  approved_by?: string | null;
  
  // Installments
  installments?: PaymentPlanInstallment[];
}

// Payment plan installment
export interface PaymentPlanInstallment {
  id: string;
  payment_plan_id: string;
  
  // Installment details
  installment_number: number;
  due_date: string;
  amount: number;
  
  // Payment information
  paid_date?: string | null;
  paid_amount?: number | null;
  payment_method?: PaymentMethodType | null;
  transaction_id?: string | null;
  
  // Status
  status: 'pending' | 'paid' | 'partially_paid' | 'overdue' | 'cancelled';
  
  // System fields
  created_at: string;
  updated_at: string;
}

// Request types
export interface CreateTransactionRequest {
  transaction_type: TransactionTypeType;
  amount: number;
  description: string;
  patient_id: string;
  appointment_id?: string;
  invoice_id?: string;
  payment_method?: PaymentMethodType;
  payment_date?: string;
  reference_number?: string;
  notes?: string;
}

export interface UpdateTransactionRequest {
  status?: TransactionStatusType;
  payment_date?: string;
  payment_method?: PaymentMethodType;
  reference_number?: string;
  receipt_number?: string;
  notes?: string;
}

export interface CreateInvoiceRequest {
  patient_id: string;
  due_date: string;
  items: Array<{
    description: string;
    quantity: number;
    unit_price: number;
    appointment_id?: string;
    session_id?: string;
    tax_rate?: number;
    discount_rate?: number;
  }>;
  payment_terms?: string;
  notes?: string;
}

export interface CreateInsuranceClaimRequest {
  patient_id: string;
  insurance_provider_id: string;
  insurance_plan_id?: string;
  service_date: string;
  claimed_amount: number;
  appointments?: string[];
  sessions?: string[];
  authorization_number?: string;
  notes?: string;
}

export interface CreatePaymentPlanRequest {
  patient_id: string;
  invoice_id?: string;
  total_amount: number;
  down_payment: number;
  number_of_installments: number;
  start_date: string;
  frequency: 'weekly' | 'biweekly' | 'monthly';
  notes?: string;
}

// Validation schemas
export const createTransactionSchema = z.object({
  transaction_type: z.enum(['payment', 'refund', 'adjustment', 'insurance_claim', 'insurance_payment']),
  
  amount: z
    .number()
    .positive('Valor deve ser positivo')
    .multipleOf(0.01, 'Valor deve ter no máximo 2 casas decimais'),
  
  description: z
    .string()
    .min(3, 'Descrição deve ter pelo menos 3 caracteres')
    .max(500, 'Descrição deve ter no máximo 500 caracteres'),
  
  patient_id: z.string().uuid('ID do paciente deve ser um UUID válido'),
  
  appointment_id: z.string().uuid('ID do agendamento deve ser um UUID válido').optional(),
  
  invoice_id: z.string().uuid('ID da fatura deve ser um UUID válido').optional(),
  
  payment_method: z
    .enum(['cash', 'credit_card', 'debit_card', 'pix', 'bank_transfer', 'check', 'insurance', 'voucher'])
    .optional(),
  
  payment_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data deve estar no formato YYYY-MM-DD')
    .optional(),
  
  reference_number: z
    .string()
    .max(100, 'Número de referência deve ter no máximo 100 caracteres')
    .optional(),
  
  notes: z
    .string()
    .max(1000, 'Notas devem ter no máximo 1000 caracteres')
    .optional()
});

export const createInvoiceSchema = z.object({
  patient_id: z.string().uuid('ID do paciente deve ser um UUID válido'),
  
  due_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data de vencimento deve estar no formato YYYY-MM-DD'),
  
  items: z
    .array(
      z.object({
        description: z
          .string()
          .min(3, 'Descrição do item deve ter pelo menos 3 caracteres')
          .max(200, 'Descrição do item deve ter no máximo 200 caracteres'),
        
        quantity: z
          .number()
          .positive('Quantidade deve ser positiva')
          .int('Quantidade deve ser um número inteiro'),
        
        unit_price: z
          .number()
          .positive('Preço unitário deve ser positivo')
          .multipleOf(0.01, 'Preço deve ter no máximo 2 casas decimais'),
        
        appointment_id: z.string().uuid().optional(),
        session_id: z.string().uuid().optional(),
        
        tax_rate: z
          .number()
          .min(0, 'Taxa não pode ser negativa')
          .max(100, 'Taxa não pode ser maior que 100%')
          .optional(),
        
        discount_rate: z
          .number()
          .min(0, 'Desconto não pode ser negativo')
          .max(100, 'Desconto não pode ser maior que 100%')
          .optional()
      })
    )
    .min(1, 'Fatura deve ter pelo menos um item'),
  
  payment_terms: z
    .string()
    .max(500, 'Termos de pagamento devem ter no máximo 500 caracteres')
    .optional(),
  
  notes: z
    .string()
    .max(1000, 'Notas devem ter no máximo 1000 caracteres')
    .optional()
});

export const createPaymentPlanSchema = z.object({
  patient_id: z.string().uuid('ID do paciente deve ser um UUID válido'),
  
  invoice_id: z.string().uuid('ID da fatura deve ser um UUID válido').optional(),
  
  total_amount: z
    .number()
    .positive('Valor total deve ser positivo')
    .multipleOf(0.01, 'Valor deve ter no máximo 2 casas decimais'),
  
  down_payment: z
    .number()
    .min(0, 'Entrada não pode ser negativa')
    .multipleOf(0.01, 'Valor deve ter no máximo 2 casas decimais'),
  
  number_of_installments: z
    .number()
    .min(1, 'Deve ter pelo menos 1 parcela')
    .max(48, 'Máximo de 48 parcelas')
    .int('Número de parcelas deve ser inteiro'),
  
  start_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data de início deve estar no formato YYYY-MM-DD'),
  
  frequency: z.enum(['weekly', 'biweekly', 'monthly']),
  
  notes: z
    .string()
    .max(1000, 'Notas devem ter no máximo 1000 caracteres')
    .optional()
});

// Helper functions
export function getTransactionTypeLabel(type: TransactionTypeType): string {
  const labels = {
    payment: 'Pagamento',
    refund: 'Reembolso',
    adjustment: 'Ajuste',
    insurance_claim: 'Cobrança de Convênio',
    insurance_payment: 'Pagamento de Convênio'
  };
  return labels[type];
}

export function getPaymentMethodLabel(method: PaymentMethodType): string {
  const labels = {
    cash: 'Dinheiro',
    credit_card: 'Cartão de Crédito',
    debit_card: 'Cartão de Débito',
    pix: 'PIX',
    bank_transfer: 'Transferência Bancária',
    check: 'Cheque',
    insurance: 'Convênio',
    voucher: 'Voucher'
  };
  return labels[method];
}

export function getTransactionStatusLabel(status: TransactionStatusType): string {
  const labels = {
    pending: 'Pendente',
    processing: 'Processando',
    completed: 'Concluído',
    failed: 'Falhou',
    cancelled: 'Cancelado',
    refunded: 'Reembolsado'
  };
  return labels[status];
}

export function getInsuranceClaimStatusLabel(status: InsuranceClaimStatusType): string {
  const labels = {
    draft: 'Rascunho',
    submitted: 'Enviado',
    in_review: 'Em Análise',
    approved: 'Aprovado',
    partially_approved: 'Parcialmente Aprovado',
    denied: 'Negado',
    paid: 'Pago'
  };
  return labels[status];
}

export function formatCurrency(amount: number, currency: string = 'BRL'): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: currency
  }).format(amount);
}

export function calculateInvoiceTotal(items: InvoiceItem[]): {
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  total: number;
} {
  let subtotal = 0;
  let tax_amount = 0;
  let discount_amount = 0;

  for (const item of items) {
    subtotal += item.total_price;
    tax_amount += item.tax_amount || 0;
    discount_amount += item.discount_amount || 0;
  }

  const total = subtotal + tax_amount - discount_amount;

  return {
    subtotal,
    tax_amount,
    discount_amount,
    total
  };
}

export function calculatePaymentPlanInstallment(
  total: number,
  down_payment: number,
  installments: number
): number {
  const remaining = total - down_payment;
  return Math.ceil((remaining / installments) * 100) / 100; // Round up to 2 decimal places
}

export function getPaymentDueStatus(dueDate: string): 'current' | 'overdue' | 'upcoming' {
  const due = new Date(dueDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);

  if (due < today) return 'overdue';
  if (due.getTime() === today.getTime()) return 'current';
  return 'upcoming';
}

export function calculateLateFee(
  amount: number,
  dueDate: string,
  feePercentage: number = 2,
  interestPerDay: number = 0.033
): number {
  const due = new Date(dueDate);
  const today = new Date();
  
  if (today <= due) return 0;
  
  const daysLate = Math.floor((today.getTime() - due.getTime()) / (1000 * 60 * 60 * 24));
  const fee = amount * (feePercentage / 100);
  const interest = amount * (interestPerDay / 100) * daysLate;
  
  return Math.round((fee + interest) * 100) / 100;
}

// Financial metrics
export interface FinancialMetrics {
  period: {
    start_date: string;
    end_date: string;
  };
  revenue: {
    gross_revenue: number;
    net_revenue: number;
    insurance_revenue: number;
    private_revenue: number;
  };
  receivables: {
    total_receivables: number;
    overdue_receivables: number;
    average_collection_period: number;
  };
  performance: {
    collection_rate: number;
    cancellation_rate: number;
    discount_rate: number;
  };
  top_services: Array<{
    service: string;
    revenue: number;
    count: number;
  }>;
  payment_methods_distribution: Array<{
    method: PaymentMethodType;
    amount: number;
    percentage: number;
  }>;
}

// Export types for external use
export type {
  TransactionTypeType,
  PaymentMethodType,
  TransactionStatusType,
  InsuranceClaimStatusType
};