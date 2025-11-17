import { createServerComponentClient } from '~/lib/supabase/server';

export class WaitlistService {
  static async addToWaitlist(data: any) {
    try {
      const supabase = await createServerComponentClient();
      const { data: waitlistEntry, error } = await supabase
        .from('waitlist')
        .insert(data)
        .select('*, patient:patients(*)')
        .single();
      if (error) throw error;
      return { data: waitlistEntry, error: null };
    } catch (error) {
      console.error('Error adding to waitlist:', error);
      return { data: null, error };
    }
  }

  static async getWaitlist(filters?: { status?: string; therapistId?: string }) {
    try {
      const supabase = await createServerComponentClient();
      let query = supabase.from('waitlist').select('*, patient:patients(*)');
      if (filters?.status) query = query.eq('status', filters.status);
      if (filters?.therapistId) query = query.eq('therapist_id', filters.therapistId);
      const { data, error } = await query;
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching waitlist:', error);
      return { data: null, error };
    }
  }
}

