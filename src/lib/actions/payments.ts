'use server';

import { createServerComponentClient } from '~/lib/supabase/server';
import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '~/types/database.types';

/**
 * Cria um pagamento/transação financeira
 */
export async function createPayment(data: {
  patient_id?: string;
  patient_name?: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  payment_method: string;
  description?: string;
  due_date: string;
  status: 'pending' | 'completed' | 'cancelled';
}) {
  const supabase = await createServerComponentClient();

  const { data: created, error } = await (supabase as SupabaseClient<Database>)
    .from('financial_transactions')
    .insert({
      patient_id: data.patient_id || null,
      amount: data.amount,
      type: data.type,
      category: data.category,
      payment_method: data.payment_method,
      description: data.description,
      due_date: data.due_date,
      status: data.status,
      created_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    return { error: error.message, data: null };
  }

  return { data: created, error: null };
}

/**
 * Busca transações financeiras
 */
export async function getFinancialTransactions(filters: {
  startDate?: string;
  endDate?: string;
  type?: 'income' | 'expense';
  status?: string;
  patientId?: string;
}) {
  const supabase = await createServerComponentClient();

  let query = supabase
    .from('financial_transactions')
    .select(`
      *,
      patients:patient_id (
        full_name
      )
    `)
    .order('created_at', { ascending: false });

  if (filters.startDate) {
    query = query.gte('created_at', filters.startDate);
  }

  if (filters.endDate) {
    query = query.lte('created_at', filters.endDate);
  }

  if (filters.type) {
    query = query.eq('type', filters.type);
  }

  if (filters.status) {
    query = query.eq('status', filters.status);
  }

  if (filters.patientId) {
    query = query.eq('patient_id', filters.patientId);
  }

  const { data, error } = await query;

  if (error) {
    return { error: error.message, data: null };
  }

  return { data, error: null };
}

/**
 * Gera relatório de fluxo de caixa
 */
export async function getCashFlowReport(startDate: string, endDate: string) {
  const supabase = await createServerComponentClient();

  const { data: transactions, error } = await (supabase as SupabaseClient<Database>)
    .from('financial_transactions')
    .select('*')
    .eq('status', 'completed')
    .gte('created_at', startDate)
    .lte('created_at', endDate)
    .order('created_at', { ascending: true });

  if (error) {
    return { error: error.message, data: null };
  }

  const income = (transactions || [])
    .filter((t: Database['public']['Tables']['financial_transactions']['Row']) => t.type === 'income')
    .reduce((sum: number, t: Database['public']['Tables']['financial_transactions']['Row']) => sum + (t.amount || 0), 0);

  const expenses = (transactions || [])
    .filter((t: Database['public']['Tables']['financial_transactions']['Row']) => t.type === 'expense')
    .reduce((sum: number, t: Database['public']['Tables']['financial_transactions']['Row']) => sum + (t.amount || 0), 0);

  const balance = income - expenses;

  return {
    data: {
      income,
      expenses,
      balance,
      transactions: transactions || [],
      period: { startDate, endDate },
    },
    error: null,
  };
}