import { createServerComponentClient } from '~/lib/supabase/server';

type Package = {
  id: string;
  package_id: string;
  patient_id: string;
  purchase_date: string;
  sessions_remaining: number;
  status: string | null;
  patient: {
    id: string;
    full_name: string;
  } | null;
  package: {
    name: string;
    price: number;
    sessions_count: number;
  } | null;
  created_at: string | null;
  expires_at: string | null;
};

export class PackageService {
  static async create(data: any): Promise<{ data: Package | null; error: { message: string } | null }> {
    try {
      const supabase = await createServerComponentClient();
      // patient_package_purchases table not in schema yet
      const { data: pkg, error } = await (supabase as any)
        .from('patient_package_purchases')
        .insert(data)
        .select(`
          id,
          package_id,
          patient_id,
          purchase_date,
          sessions_remaining,
          status,
          created_at,
          expires_at,
          patient:patients(id, full_name),
          package:financial_packages(name, price, sessions_count)
        `)
        .single();
      if (error) throw error;
      return { data: pkg as Package, error: null };
    } catch (error) {
      console.error('Error creating package:', error);
      return { data: null, error: { message: error instanceof Error ? error.message : 'Unknown error' } };
    }
  }

  static async getByPatient(patientId: string) {
    try {
      const supabase = await createServerComponentClient();
      // patient_package_purchases table not in schema yet
      const { data, error } = await (supabase as any)
        .from('patient_package_purchases')
        .select(`
          id,
          package_id,
          patient_id,
          purchase_date,
          sessions_remaining,
          status,
          created_at,
          expires_at,
          patient:patients(id, full_name),
          package:financial_packages(name, price, sessions_count)
        `)
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return { data: data as Package[], error: null };
    } catch (error) {
      console.error('Error fetching packages:', error);
      return { data: null, error: { message: error instanceof Error ? error.message : 'Unknown error' } };
    }
  }

  static async useSession(packageId: string) {
    try {
      const supabase = await createServerComponentClient();
      // patient_package_purchases table not in schema yet
      const { data, error } = await (supabase as any)
        .from('patient_package_purchases')
        .select('*')
        .eq('id', packageId)
        .single();
      
      if (error) throw error;
      if (!data || data.sessions_remaining <= 0) {
        throw new Error('Package has no remaining sessions');
      }
      // patient_package_purchases table not in schema yet
      const { data: updated, error: updateError } = await (supabase as any)
        .from('patient_package_purchases')
        .update({ sessions_remaining: data.sessions_remaining - 1 })
        .eq('id', packageId)
        .select()
        .single();

      if (updateError) throw updateError;
      return { data: updated, error: null };
    } catch (error) {
      console.error('Error using session:', error);
      return { data: null, error: { message: error instanceof Error ? error.message : 'Unknown error' } };
    }
  }
}

