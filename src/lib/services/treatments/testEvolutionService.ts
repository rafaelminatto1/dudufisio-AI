import { createServerComponentClient } from '~/lib/supabase/server';

export class TestEvolutionService {
  static async create(data: any) {
    try {
      const supabase = await createServerComponentClient();
      const { data: testResult, error } = await supabase
        .from('test_results' as any)
        .insert(data)
        .select()
        .single();
      if (error) throw error;
      return { data: testResult, error: null };
    } catch (error) {
      console.error('Error creating test result:', error);
      return { data: null, error };
    }
  }

  static async getByPatient(patientId: string) {
    try {
      const supabase = await createServerComponentClient();
      const { data, error } = await supabase
        .from('test_results' as any)
        .select('*')
        .eq('patient_id', patientId)
        .order('test_date', { ascending: false });
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching test results:', error);
      return { data: null, error };
    }
  }
}

