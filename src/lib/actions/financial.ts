'use server';

import { z } from 'zod';
import { TransactionService } from '~/lib/services/financial/transactionService';
import { createServerActionClient } from '~/lib/supabase/server';

const CreateTransactionSchema = z.object({
  patient_id: z.string().uuid(),
  transaction_type: z.enum(['receita', 'despesa']),
  amount: z.string(),
  payment_status: z.enum(['pendente', 'pago', 'cancelado']),
  payment_method: z.enum([
    'dinheiro',
    'pix',
    'cartao_debito',
    'cartao_credito',
    'transferencia',
    'stripe',
  ]),
  description: z.string().optional(),
});

export async function createTransaction(
  input: z.infer<typeof CreateTransactionSchema>
) {
  try {
    const supabase = await createServerActionClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return { error: 'Unauthorized' };
    }

    const validatedInput = CreateTransactionSchema.safeParse(input);

    if (!validatedInput.success) {
      return { error: 'Invalid input', details: validatedInput.error.issues };
    }

    const result = await TransactionService.create(validatedInput.data);

    if (result.error) {
      return { error: 'Failed to create transaction' };
    }

    return result;
  } catch (error) {
    console.error('Error creating transaction:', error);
    return { error: 'Internal server error' };
  }
}

const GetTransactionsSchema = z.object({
  patientId: z.string().uuid().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export async function getTransactions(
  input: z.infer<typeof GetTransactionsSchema>
) {
  try {
    const supabase = await createServerActionClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return { error: 'Unauthorized' };
    }

    const validatedInput = GetTransactionsSchema.safeParse(input);

    if (!validatedInput.success) {
      return { error: 'Invalid input', details: validatedInput.error.issues };
    }

    const result = await TransactionService.getAll(validatedInput.data);

    if (result.error) {
      return { error: 'Failed to fetch transactions' };
    }

    return result;
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return { error: 'Internal server error' };
  }
}
