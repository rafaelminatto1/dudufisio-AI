/**
 * Financial Service com Cache (Next.js 16)
 * Usa React cache() e Next.js cacheLife para otimizar queries financeiras
 */

import { cache } from 'react';
import { unstable_cacheLife as cacheLife } from 'next/cache';
import { createServerComponentClient } from '~/lib/supabase/server';
import { Database } from '~/types/database.types';

type Transaction = Database['public']['Tables']['payment_transactions']['Row'];
type TransactionInsert = Database['public']['Tables']['payment_transactions']['Insert'];
type TransactionUpdate = Database['public']['Tables']['payment_transactions']['Update'];

/**
 * Get transactions with filters - Cached
 * Cache: Padrão (15 min)
 */
export const getTransactions = cache(
  async (filters?: {
    startDate?: Date | string;
    endDate?: Date | string;
    type?: 'payment' | 'refund';
    status?: string;
  }) => {
    // 'use cache' // TODO: Habilitar quando Next.js suportar;
    cacheLife('default');

    const supabase = await createServerComponentClient();
    let query = supabase
      .from('payment_transactions')
      .select('*')
      .order('created_at', { ascending: false });

    if (filters?.startDate) {
      const start =
        filters.startDate instanceof Date
          ? filters.startDate.toISOString()
          : filters.startDate;
      query = query.gte('created_at', start);
    }

    if (filters?.endDate) {
      const end =
        filters.endDate instanceof Date ? filters.endDate.toISOString() : filters.endDate;
      query = query.lte('created_at', end);
    }

    if (filters?.type) {
      query = query.eq('type', filters.type);
    }

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }
);

/**
 * Get monthly transactions - Cached
 * Cache: Máximo (relatórios mensais podem esperar)
 */
export const getMonthlyTransactions = cache(
  async (year?: number, month?: number) => {
    // 'use cache' // TODO: Habilitar quando Next.js suportar;
    cacheLife('max');

    const now = new Date();
    const targetYear = year || now.getFullYear();
    const targetMonth = month || now.getMonth();

    const startOfMonth = new Date(targetYear, targetMonth, 1);
    const endOfMonth = new Date(targetYear, targetMonth + 1, 0, 23, 59, 59);

    const supabase = await createServerComponentClient();
    const { data, error } = await supabase
      .from('payment_transactions')
      .select('*')
      .gte('created_at', startOfMonth.toISOString())
      .lte('created_at', endOfMonth.toISOString())
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }
);

/**
 * Get financial summary - Cached
 * Cache: Máximo (resumo pode esperar)
 */
export const getFinancialSummary = cache(
  async (startDate?: Date, endDate?: Date) => {
    // 'use cache' // TODO: Habilitar quando Next.js suportar;
    cacheLife('max');

    const start = startDate || new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const end = endDate || new Date();

    const supabase = await createServerComponentClient();
    const { data: transactions, error } = await supabase
      .from('payment_transactions')
      .select('amount, type, status')
      .gte('created_at', start.toISOString())
      .lte('created_at', end.toISOString());

    if (error) throw error;

    const summary = (transactions || []).reduce(
      (acc, transaction) => {
        if (transaction.status === 'succeeded') {
          if (transaction.type === 'payment') {
            acc.totalRevenue += transaction.amount;
            acc.paymentsCount += 1;
          } else if (transaction.type === 'refund') {
            acc.totalRefunds += transaction.amount;
            acc.refundsCount += 1;
          }
        }
        return acc;
      },
      {
        totalRevenue: 0,
        totalRefunds: 0,
        paymentsCount: 0,
        refundsCount: 0,
      }
    );

    return {
      ...summary,
      netRevenue: summary.totalRevenue - summary.totalRefunds,
    };
  }
);

/**
 * Get revenue by period - Cached
 * Cache: Máximo
 */
export const getRevenueByPeriod = cache(
  async (period: 'day' | 'week' | 'month' | 'year', limit: number = 12) => {
    // 'use cache' // TODO: Habilitar quando Next.js suportar;
    cacheLife('max');

    const supabase = await createServerComponentClient();
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'day':
        startDate = new Date(now.getTime() - limit * 24 * 60 * 60 * 1000);
        break;
      case 'week':
        startDate = new Date(now.getTime() - limit * 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth() - limit, 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear() - limit, 0, 1);
        break;
    }

    const { data: transactions, error } = await supabase
      .from('payment_transactions')
      .select('amount, created_at, type')
      .gte('created_at', startDate.toISOString())
      .eq('status', 'succeeded')
      .eq('type', 'payment')
      .order('created_at', { ascending: true });

    if (error) throw error;

    // Group by period (simplificado - pode ser melhorado)
    return transactions || [];
  }
);

/**
 * Get pending payments - Cached
 * Cache: Padrão (pode mudar)
 */
export const getPendingPayments = cache(async () => {
  // 'use cache' // TODO: Habilitar quando Next.js suportar;
  cacheLife('default');

  const supabase = await createServerComponentClient();
  const { data, error } = await supabase
    .from('payment_transactions')
    .select('*')
    .eq('status', 'pending')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
});

/**
 * Get transaction by ID - Cached
 * Cache: Horas
 */
export const getTransactionById = cache(async (id: string) => {
  // 'use cache' // TODO: Habilitar quando Next.js suportar;
  cacheLife('hours');

  const supabase = await createServerComponentClient();
  const { data, error } = await supabase
    .from('payment_transactions')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
});

// Mutations (não cached)
export class FinancialServiceMutations {
  static async createTransaction(transaction: TransactionInsert) {
    const supabase = await createServerComponentClient();
    const { data, error } = await supabase
      .from('payment_transactions')
      .insert(transaction)
      .select()
      .single();

    if (error) throw error;

    // TODO: Invalidar cache
    // revalidateTag('transactions');
    // revalidateTag('financial-summary');

    return data;
  }

  static async updateTransaction(id: string, transaction: TransactionUpdate) {
    const supabase = await createServerComponentClient();
    const { data, error } = await supabase
      .from('payment_transactions')
      .update(transaction)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // TODO: Invalidar cache
    // revalidateTag(`transaction-${id}`);
    // revalidateTag('transactions');
    // revalidateTag('financial-summary');

    return data;
  }

  static async deleteTransaction(id: string) {
    const supabase = await createServerComponentClient();
    const { error } = await supabase.from('payment_transactions').delete().eq('id', id);

    if (error) throw error;

    // TODO: Invalidar cache
    // revalidateTag('transactions');
    // revalidateTag('financial-summary');

    return true;
  }
}
