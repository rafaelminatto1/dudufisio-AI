import { createServerComponentClient } from '~/lib/supabase/server';

export class PackageService {
  static async create(data: any) {
    try {
      const supabase = createServerComponentClient();
      const { data: pkg, error } = await supabase
        .from('patient_packages')
        .insert(data)
        .select()
        .single();
      if (error) throw error;
      return { data: pkg, error: null };
    } catch (error) {
      console.error('Error creating package:', error);
      return { data: null, error };
    }
  }

  static async getByPatient(patientId: string) {
    try {
      const supabase = createServerComponentClient();
      const { data, error } = await supabase
        .from('patient_packages')
        .select('*')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching packages:', error);
      return { data: null, error };
    }
  }

  static async useSession(packageId: string) {
    try {
      const supabase = createServerComponentClient();
      const { data, error } = await supabase
        .from('patient_packages')
        .select('*')
        .eq('id', packageId)
        .single();
      
      if (error) throw error;
      if (!data || data.used_sessions >= data.total_sessions) {
        throw new Error('Package has no remaining sessions');
      }

      const { data: updated, error: updateError } = await supabase
        .from('patient_packages')
        .update({ used_sessions: data.used_sessions + 1 })
        .eq('id', packageId)
        .select()
        .single();

      if (updateError) throw updateError;
      return { data: updated, error: null };
    } catch (error) {
      console.error('Error using session:', error);
      return { data: null, error };
    }
  }
}

