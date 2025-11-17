import { createClient } from '~/lib/supabase/server';
import type { Database } from '~/types/database.types';

type Patient = Database['public']['Tables']['patients']['Row'];
type PatientInsert = Database['public']['Tables']['patients']['Insert'];
type PatientUpdate = Database['public']['Tables']['patients']['Update'];

export class PatientsService {
  private supabase = createClient();

  async getAll(filters?: { status?: string; search?: string }) {
    let query = this.supabase
      .from('patients')
      .select('*, user:users(*)');

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    if (filters?.search) {
      query = query.or(`full_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,phone.ilike.%${filters.search}%`);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  async getById(id: string) {
    const { data, error } = await this.supabase
      .from('patients')
      .select('*, user:users(*)')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  async create(patient: PatientInsert) {
    const { data, error } = await this.supabase
      .from('patients')
      .insert(patient)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async update(id: string, updates: PatientUpdate) {
    const { data, error } = await this.supabase
      .from('patients')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async delete(id: string) {
    const { error } = await this.supabase
      .from('patients')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  async getStats() {
    const { data: totalCount } = await this.supabase
      .from('patients')
      .select('id', { count: 'exact', head: true });

    const { data: activeCount } = await this.supabase
      .from('patients')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'ativo');

    return {
      total: totalCount || 0,
      active: activeCount || 0,
    };
  }
}

