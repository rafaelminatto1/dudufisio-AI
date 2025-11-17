import { createServerComponentClient } from '~/lib/supabase/server';

export class SurgeryService {
  static async createSurgery(data: any) {
    try {
      const supabase = createServerComponentClient();
      const { data: surgery, error } = await supabase
        .from('surgeries')
        .insert(data)
        .select()
        .single();
      if (error) throw error;
      return { data: surgery, error: null };
    } catch (error) {
      console.error('Error creating surgery:', error);
      return { data: null, error };
    }
  }

  static async getPatientSurgeries(patientId: string) {
    try {
      const supabase = createServerComponentClient();
      const { data, error } = await supabase
        .from('surgeries')
        .select('*')
        .eq('patient_id', patientId)
        .order('surgery_date', { ascending: false });
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching surgeries:', error);
      return { data: null, error };
    }
  }
}

