import { z } from 'zod';
// Transaction types
export const TransactionType = {
    PAYMENT: 'payment',
    REFUND: 'refund',
    ADJUSTMENT: 'adjustment',
    INSURANCE_CLAIM: 'insurance_claim',
    INSURANCE_PAYMENT: 'insurance_payment'
};
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
};
// Transaction status
export const TransactionStatus = {
    PENDING: 'pending',
    PROCESSING: 'processing',
    COMPLETED: 'completed',
    FAILED: 'failed',
    CANCELLED: 'cancelled',
    REFUNDED: 'refunded'
};
// Insurance claim status
export const InsuranceClaimStatus = {
    DRAFT: 'draft',
    SUBMITTED: 'submitted',
    IN_REVIEW: 'in_review',
    APPROVED: 'approved',
    PARTIALLY_APPROVED: 'partially_approved',
    DENIED: 'denied',
    PAID: 'paid'
};
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
        .array(z.object({
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
    }))
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
export function getTransactionTypeLabel(type) {
    const labels = {
        payment: 'Pagamento',
        refund: 'Reembolso',
        adjustment: 'Ajuste',
        insurance_claim: 'Cobrança de Convênio',
        insurance_payment: 'Pagamento de Convênio'
    };
    return labels[type];
}
export function getPaymentMethodLabel(method) {
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
export function getTransactionStatusLabel(status) {
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
export function getInsuranceClaimStatusLabel(status) {
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
export function formatCurrency(amount, currency = 'BRL') {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: currency
    }).format(amount);
}
export function calculateInvoiceTotal(items) {
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
export function calculatePaymentPlanInstallment(total, down_payment, installments) {
    const remaining = total - down_payment;
    return Math.ceil((remaining / installments) * 100) / 100; // Round up to 2 decimal places
}
export function getPaymentDueStatus(dueDate) {
    const due = new Date(dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    due.setHours(0, 0, 0, 0);
    if (due < today)
        return 'overdue';
    if (due.getTime() === today.getTime())
        return 'current';
    return 'upcoming';
}
export function calculateLateFee(amount, dueDate, feePercentage = 2, interestPerDay = 0.033) {
    const due = new Date(dueDate);
    const today = new Date();
    if (today <= due)
        return 0;
    const daysLate = Math.floor((today.getTime() - due.getTime()) / (1000 * 60 * 60 * 24));
    const fee = amount * (feePercentage / 100);
    const interest = amount * (interestPerDay / 100) * daysLate;
    return Math.round((fee + interest) * 100) / 100;
}
// Types already exported above
