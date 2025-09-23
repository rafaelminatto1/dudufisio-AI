import { supabase, handleSupabaseError } from '../../lib/supabase';
import { Patient, PatientStatus } from '../../types';
import type { Database } from '../../types/database';

type PatientRow = Database['public']['Tables']['patients']['Row'];
type PatientInsert = Database['public']['Tables']['patients']['Insert'];
type PatientUpdate = Database['public']['Tables']['patients']['Update'];

class SupabasePatientService {
  private mapRowToPatient(row: PatientRow): Patient {
    return {
      id: row.id,
      user_id: null, // Campo não existe no schema atual
      full_name: row.full_name,
      email: row.email,
      phone: row.phone || '',
      birth_date: row.birth_date || row.date_of_birth || '',
      cpf: row.cpf || '',
      address: row.address,
      profession: null, // Campo não existe no schema atual
      marital_status: null, // Campo não existe no schema atual
      emergency_contact_name: row.emergency_contact_name,
      emergency_contact_phone: row.emergency_contact_phone,
      photo_url: null, // Campo não existe no schema atual
      general_notes: row.medical_history, // Usando medical_history como general_notes
      active: row.status === 'active', // Convertendo status para boolean
      created_at: row.created_at || '',
      updated_at: row.updated_at || '',
      created_by: row.therapist_id || '', // Usando therapist_id como created_by
    };
  }

  private mapPatientToInsert(patient: Omit<Patient, 'id' | 'created_at' | 'updated_at'>): PatientInsert {
    return {
      full_name: patient.full_name,
      email: patient.email || null,
      phone: patient.phone || null,
      birth_date: patient.birth_date || null,
      cpf: patient.cpf || null,
      address: patient.address || null,
      emergency_contact_name: patient.emergency_contact_name || null,
      emergency_contact_phone: patient.emergency_contact_phone || null,
      medical_history: patient.general_notes || null, // Mapeando general_notes para medical_history
      status: patient.active ? 'active' : 'inactive', // Convertendo boolean para string
      therapist_id: patient.created_by || null, // Usando created_by como therapist_id
    };
  }

  private mapPatientToUpdate(patient: Partial<Patient>): PatientUpdate {
    const update: PatientUpdate = {};

    if (patient.full_name) update.full_name = patient.full_name;
    if (patient.email !== undefined) update.email = patient.email || null;
    if (patient.phone !== undefined) update.phone = patient.phone || null;
    if (patient.birth_date !== undefined) update.birth_date = patient.birth_date || null;
    if (patient.cpf !== undefined) update.cpf = patient.cpf || null;
    if (patient.address !== undefined) update.address = patient.address || null;
    if (patient.emergency_contact_name !== undefined) update.emergency_contact_name = patient.emergency_contact_name || null;
    if (patient.emergency_contact_phone !== undefined) update.emergency_contact_phone = patient.emergency_contact_phone || null;
    if (patient.general_notes !== undefined) update.medical_history = patient.general_notes || null;
    if (patient.active !== undefined) update.status = patient.active ? 'active' : 'inactive';
    if (patient.created_by !== undefined) update.therapist_id = patient.created_by || null;

    update.updated_at = new Date().toISOString();

    return update;
  }

  async getAllPatients(): Promise<Patient[]> {
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map(this.mapRowToPatient);
    } catch (error: any) {
      throw new Error(handleSupabaseError(error));
    }
  }

  async getPatientById(id: string): Promise<Patient | null> {
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null; // Not found
        throw error;
      }

      return data ? this.mapRowToPatient(data) : null;
    } catch (error: any) {
      throw new Error(handleSupabaseError(error));
    }
  }

  async getPatientsByTherapist(therapistId: string): Promise<Patient[]> {
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('therapist_id', therapistId)
        .order('name', { ascending: true });

      if (error) throw error;

      return (data || []).map(this.mapRowToPatient);
    } catch (error: any) {
      throw new Error(handleSupabaseError(error));
    }
  }

  async searchPatients(query: string): Promise<Patient[]> {
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .or(`name.ilike.%${query}%,email.ilike.%${query}%,phone.ilike.%${query}%,cpf.ilike.%${query}%`)
        .order('name', { ascending: true });

      if (error) throw error;

      return (data || []).map(this.mapRowToPatient);
    } catch (error: any) {
      throw new Error(handleSupabaseError(error));
    }
  }

  async createPatient(patientData: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>): Promise<Patient> {
    try {
      const insertData = this.mapPatientToInsert(patientData);

      const { data, error } = await supabase
        .from('patients')
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;

      return this.mapRowToPatient(data);
    } catch (error: any) {
      throw new Error(handleSupabaseError(error));
    }
  }

  async updatePatient(id: string, updates: Partial<Patient>): Promise<Patient> {
    try {
      const updateData = this.mapPatientToUpdate(updates);

      const { data, error } = await supabase
        .from('patients')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return this.mapRowToPatient(data);
    } catch (error: any) {
      throw new Error(handleSupabaseError(error));
    }
  }

  async deletePatient(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('patients')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error: any) {
      throw new Error(handleSupabaseError(error));
    }
  }

  async getPatientsByStatus(status: PatientStatus): Promise<Patient[]> {
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('status', status)
        .order('name', { ascending: true });

      if (error) throw error;

      return (data || []).map(this.mapRowToPatient);
    } catch (error: any) {
      throw new Error(handleSupabaseError(error));
    }
  }

  async getPatientStats(): Promise<{
    total: number;
    active: number;
    inactive: number;
    newThisMonth: number;
  }> {
    try {
      const currentMonth = new Date();
      currentMonth.setDate(1);
      currentMonth.setHours(0, 0, 0, 0);

      const [totalResult, activeResult, inactiveResult, newThisMonthResult] = await Promise.all([
        supabase.from('patients').select('id', { count: 'exact', head: true }),
        supabase.from('patients').select('id', { count: 'exact', head: true }).eq('status', PatientStatus.Active),
        supabase.from('patients').select('id', { count: 'exact', head: true }).eq('status', PatientStatus.Inactive),
        supabase.from('patients').select('id', { count: 'exact', head: true }).gte('created_at', currentMonth.toISOString())
      ]);

      return {
        total: totalResult.count || 0,
        active: activeResult.count || 0,
        inactive: inactiveResult.count || 0,
        newThisMonth: newThisMonthResult.count || 0,
      };
    } catch (error: any) {
      throw new Error(handleSupabaseError(error));
    }
  }

  // Real-time subscriptions
  subscribeToPatients(callback: (payload: any) => void) {
    return supabase
      .channel('patients_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'patients',
        },
        (payload) => {
          let patient = null;
          if (payload.new) {
            patient = this.mapRowToPatient(payload.new as PatientRow);
          }
          callback({
            ...payload,
            patient,
          });
        }
      )
      .subscribe();
  }

  async linkPatientToUser(patientId: string, userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('patients')
        .update({ user_id: userId })
        .eq('id', patientId);

      if (error) throw error;
    } catch (error: any) {
      throw new Error(handleSupabaseError(error));
    }
  }

  async unlinkPatientFromUser(patientId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('patients')
        .update({ user_id: null })
        .eq('id', patientId);

      if (error) throw error;
    } catch (error: any) {
      throw new Error(handleSupabaseError(error));
    }
  }
}

// Export singleton instance
export const supabasePatientService = new SupabasePatientService();
export default supabasePatientService;