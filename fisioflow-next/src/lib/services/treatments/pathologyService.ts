import { createServerComponentClient } from '~/lib/supabase/server';

export class PathologyService {
  static async create(data: any) {
    try {
      const supabase = createServerComponentClient();
      const { data: pathology, error } = await supabase
        .from('pathologies')
        .insert(data)
        .select()
        .single();
      if (error) throw error;
      return { data: pathology, error: null };
    } catch (error) {
      console.error('Error creating pathology:', error);
      return { data: null, error };
    }
  }

  static async getByPatient(patientId: string) {
    try {
      const supabase = createServerComponentClient();
      const { data, error } = await supabase
        .from('pathologies')
        .select('*')
        .eq('patient_id', patientId);
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching pathologies:', error);
      return { data: null, error };
    }
  }
}

