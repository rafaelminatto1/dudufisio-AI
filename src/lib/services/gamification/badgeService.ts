import { createServerComponentClient } from '~/lib/supabase/server';

export class BadgeService {
  static async awardBadge(params: { patientId: string; badgeId: string }) {
    try {
      const supabase = await createServerComponentClient();
      // patient_badges table not in schema yet
      const { data: existing } = await (supabase as any)
        .from('patient_badges')
        .select('*')
        .eq('patient_id', params.patientId)
        .eq('badge_id', params.badgeId)
        .single();

      if (existing) {
        return { data: existing, error: null };
      }
      // patient_badges table not in schema yet
      const { data, error } = await (supabase as any)
        .from('patient_badges')
        .insert({
          patient_id: params.patientId,
          badge_id: params.badgeId,
        })
        .select('*, badge:badges(*)')
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error awarding badge:', error);
      return { data: null, error };
    }
  }

  static async getPatientBadges(patientId: string) {
    try {
      const supabase = await createServerComponentClient();
      // patient_badges table not in schema yet
      const { data, error } = await (supabase as any)
        .from('patient_badges')
        .select('*, badge:badges(*)')
        .eq('patient_id', patientId)
        .order('awarded_at', { ascending: false});

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching patient badges:', error);
      return { data: null, error };
    }
  }
}

