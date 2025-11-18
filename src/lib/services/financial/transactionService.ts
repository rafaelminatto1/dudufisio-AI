import { createServerComponentClient } from '~/lib/supabase/server';
import { Database } from '~/types/database.types';

type Transaction = Database['public']['Tables']['payment_transactions']['Row'];
type TransactionInsert = Database['public']['Tables']['payment_transactions']['Insert'];

export class TransactionService {
  static async create(data: TransactionInsert) {
    try {
      const supabase = await createServerComponentClient();
      const { data: transaction, error } = await supabase
        .from('payment_transactions')
        .insert(data)
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
        .from('payment_transactions')
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
      let query = supabase.from('payment_transactions').select('event_type, amount, status');
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
        if (t.event_type === 'receita') {
          stats.totalReceita += Number(t.amount);
          if (t.status === 'pago') stats.pago += Number(t.amount);
        } else if (t.event_type === 'despesa') {
          stats.totalDespesa += Number(t.amount);
        }
        if (t.status === 'pendente') {
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

