import { createServerComponentClient } from '~/lib/supabase/server';

export class PatientGoalsService {
  static async create(data: any) {
    try {
      const supabase = createServerComponentClient();
      const { data: goal, error } = await supabase
        .from('patient_goals')
        .insert(data)
        .select()
        .single();
      if (error) throw error;
      return { data: goal, error: null };
    } catch (error) {
      console.error('Error creating goal:', error);
      return { data: null, error };
    }
  }

  static async getByPatient(patientId: string) {
    try {
      const supabase = createServerComponentClient();
      const { data, error } = await supabase
        .from('patient_goals')
        .select('*')
        .eq('patient_id', patientId);
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching goals:', error);
      return { data: null, error };
    }
  }
}

