import { createServerComponentClient } from '~/lib/supabase/server';
import { Database } from '~/types/database.types';

type Transaction = Database['public']['Tables']['financial_transactions']['Row'];
type TransactionInsert = Database['public']['Tables']['financial_transactions']['Insert'];

export class TransactionService {
  static async create(input: {
    patient_id: string;
    transaction_type: 'receita' | 'despesa';
    amount: string;
    payment_status: 'pendente' | 'pago' | 'cancelado';
    payment_method: 'dinheiro' | 'pix' | 'cartao_debito' | 'cartao_credito' | 'transferencia' | 'stripe' | string;
    description?: string;
  }) {
    try {
      const supabase = await createServerComponentClient();
      const { data: transaction, error } = await supabase
        .from('financial_transactions')
        .insert({
          patient_id: input.patient_id,
          transaction_type: input.transaction_type,
          amount: parseFloat(input.amount),
          payment_status: input.payment_status,
          payment_method: input.payment_method,
          description: input.description,
          category: 'outro', // Default category
        } as TransactionInsert)
        .select()
        .single();
      if (error) throw error;
      return { data: transaction, error: null };
    } catch (error) {
      console.error('Error creating transaction:', error);
      return { data: null, error };
    }
  }

  static async getAll(filters?: {
    patientId?: string;
    startDate?: string;
    endDate?: string;
  }) {
    try {
      const supabase = await createServerComponentClient();
      let query = supabase
        .from('financial_transactions')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (filters?.patientId) query = query.eq('patient_id', filters.patientId);
      if (filters?.startDate) query = query.gte('created_at', filters.startDate);
      if (filters?.endDate) query = query.lte('created_at', filters.endDate);
      
      const { data, error } = await query;
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching transactions:', error);
      return { data: null, error };
    }
  }

  static async getStats(startDate?: string, endDate?: string) {
    try {
      const supabase = await createServerComponentClient();
      let query = supabase.from('financial_transactions').select('transaction_type, amount, payment_status');
      if (startDate) query = query.gte('created_at', startDate);
      if (endDate) query = query.lte('created_at', endDate);
      
      const { data, error } = await query;
      if (error) throw error;
      
      const stats = {
        totalReceita: 0,
        totalDespesa: 0,
        pago: 0,
        pendente: 0,
      };
      
      data?.forEach(t => {
        if (t.transaction_type === 'receita') {
          stats.totalReceita += Number(t.amount);
          if (t.payment_status === 'pago') stats.pago += Number(t.amount);
        } else if (t.transaction_type === 'despesa') {
          stats.totalDespesa += Number(t.amount);
        }
        if (t.payment_status === 'pendente') {
          stats.pendente += Number(t.amount);
        }
      });
      
      return { data: stats, error: null };
    } catch (error) {
      console.error('Error fetching stats:', error);
      return { data: null, error };
    }
  }
}

