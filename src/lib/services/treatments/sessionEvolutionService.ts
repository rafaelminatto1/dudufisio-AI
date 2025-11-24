import { createServerComponentClient } from '~/lib/supabase/server';
import { Database } from '~/types/database.types';
import { unstable_cacheTag as cacheTag, unstable_noStore as noStore } from 'next/cache';

type SessionEvolution = Database['public']['Tables']['session_evolutions']['Row'];
type SessionEvolutionInsert = Database['public']['Tables']['session_evolutions']['Insert'];

export class SessionEvolutionService {
  static async createEvolution(data: SessionEvolutionInsert) {
    try {
      const supabase = await createServerComponentClient();
      const { data: evolution, error } = await supabase
        .from('session_evolutions')
        .insert(data)
        .select()
        .single();
      if (error) throw error;
      return { data: evolution, error: null };
    } catch (error) {
      console.error('Error creating evolution:', error);
      return { data: null, error };
    }
  }

  static async getEvolutionsByTreatment(treatmentId: string) {
    // 'use cache' // TODO: Habilitar quando Next.js suportar;
    cacheTag('evolutions');
    cacheTag(`evolutions:treatment:${treatmentId}`);

    try {
      const supabase = await createServerComponentClient();
      const { data, error } = await supabase
        .from('session_evolutions')
        .select('*')
        .eq('treatment_id', treatmentId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching evolutions:', error);
      return { data: null, error };
    }
  }

  static async updateEvolution(id: string, updates: any) {
    try {
      const supabase = await createServerComponentClient();
      const { data, error } = await supabase
        .from('session_evolutions')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error updating evolution:', error);
      return { data: null, error };
    }
  }
}

