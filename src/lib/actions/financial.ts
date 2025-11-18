'use server';

import { z } from 'zod';
import { TransactionService, type Transaction } from '~/lib/services/financial/transactionService';
import { createServerActionClient } from '~/lib/supabase/server';
import { PackageService } from '~/lib/services/financial/packageService';

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
): Promise<{ data: Transaction | null; error: { message: string; details?: any } | null }> {
  try {
    const supabase = await createServerActionClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return { data: null, error: { message: 'Unauthorized' } };
    }

    const validatedInput = CreateTransactionSchema.safeParse(input);

    if (!validatedInput.success) {
      return { data: null, error: { message: 'Invalid input', details: validatedInput.error.issues } };
    }

    const result = await TransactionService.create(validatedInput.data);

    if (result.error) {
      return { data: null, error: { message: 'Failed to create transaction' } };
    }

    return result;
  } catch (error) {
    console.error('Error creating transaction:', error);
    return { data: null, error: { message: 'Internal server error' } };
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

const CreatePackageSchema = z.object({
  patient_id: z.string().uuid(),
  package_id: z.string().uuid(),
  purchase_date: z.string().datetime(),
  sessions_remaining: z.number().int().positive(),
  status: z.enum(['active', 'inactive', 'completed']),
});

export async function createPackage(
  input: z.infer<typeof CreatePackageSchema>
) {
  try {
    const supabase = await createServerActionClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return { error: 'Unauthorized' };
    }

    const validatedInput = CreatePackageSchema.safeParse(input);

    if (!validatedInput.success) {
      return { error: 'Invalid input', details: validatedInput.error.issues };
    }

    const result = await PackageService.create(validatedInput.data);

    if (result.error) {
      return { error: 'Failed to create package' };
    }

    return result;
  } catch (error) {
    console.error('Error creating package:', error);
    return { error: 'Internal server error' };
  }
}

const GetPackagesSchema = z.object({
  patientId: z.string().uuid().optional(),
});

type Package = {
  id: string;
  package_id: string;
  patient_id: string;
  purchase_date: string;
  sessions_remaining: number;
  status: string | null;
  patient: {
    id: string;
    full_name: string;
  } | null;
  package: {
    name: string;
    price: number;
    sessions_count: number;
  } | null;
  created_at: string | null;
  expires_at: string | null;
};

export async function getPackages(
  input: z.infer<typeof GetPackagesSchema>
): Promise<{ data: Package[] | null; error: { message: string; details?: any } | null }> {
  try {
    const supabase = await createServerActionClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return { data: null, error: { message: 'Unauthorized' } };
    }

    const validatedInput = GetPackagesSchema.safeParse(input);

    if (!validatedInput.success) {
      return { data: null, error: { message: 'Invalid input', details: validatedInput.error.issues } };
    }

    const { patientId } = validatedInput.data;

    if (patientId) {
      const result = await PackageService.getByPatient(patientId);
      if (result.error) {
        return { data: null, error: { message: 'Failed to fetch packages' } };
      }
      return result;
    }

    // Se não houver patientId, buscar todos com join em patients
    const { data, error } = await supabase
      .from('patient_package_purchases')
      .select(`
        id,
        package_id,
        patient_id,
        purchase_date,
        sessions_remaining,
        status,
        created_at,
        expires_at,
        patient:patients(id, full_name),
        package:financial_packages(name, price, sessions_count)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      return { data: null, error: { message: 'Failed to fetch packages' } };
    }

    return { data };
  } catch (error) {
    console.error('Error fetching packages:', error);
    return { data: null, error: { message: 'Internal server error' } };
  }
}