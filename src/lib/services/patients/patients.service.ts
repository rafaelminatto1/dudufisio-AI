import { createServerComponentClient } from '~/lib/supabase/server';
import type { Database } from '~/types/database.types';
import { unstable_cacheTag as cacheTag, unstable_noStore as noStore } from 'next/cache';

type Patient = Database['public']['Tables']['patients']['Row'];
type PatientInsert = Database['public']['Tables']['patients']['Insert'];
type PatientUpdate = Database['public']['Tables']['patients']['Update'];

export class PatientsService {
  async getAll(filters?: { status?: string; search?: string }) {
    // 'use cache' // TODO: Habilitar quando Next.js suportar;
    cacheTag('patients');

    const supabase = await createServerComponentClient();
    let query = supabase
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
    // 'use cache' // TODO: Habilitar quando Next.js suportar;
    cacheTag('patients');
    cacheTag(`patients:${id}`);

    const supabase = await createServerComponentClient();
    const { data, error } = await supabase
      .from('patients')
      .select('*, user:users(*)')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  async create(patient: PatientInsert) {
    const supabase = await createServerComponentClient();
    const { data, error } = await supabase
      .from('patients')
      .insert(patient)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async update(id: string, updates: PatientUpdate) {
    const supabase = await createServerComponentClient();
    const { data, error } = await supabase
      .from('patients')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async delete(id: string) {
    const supabase = await createServerComponentClient();
    const { error } = await supabase
      .from('patients')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  async getStats() {
    // 'use cache' // TODO: Habilitar quando Next.js suportar;
    cacheTag('patients:stats');

    const supabase = await createServerComponentClient();
    const { count: totalCount } = await supabase
      .from('patients')
      .select('id', { count: 'exact', head: true });

    const { count: activeCount } = await supabase
      .from('patients')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'ativo');

    return {
      total: totalCount || 0,
      active: activeCount || 0,
    };
  }
}

