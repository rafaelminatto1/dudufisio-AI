import { supabase, handleSupabaseError } from '../../lib/supabase';
import { Patient, PatientStatus } from '../../types';
import type { SupabaseRealtimePayload } from '../../types/realtime';
import type { Database } from '../../types/database';

type PatientRow = Database['public']['Tables']['patients']['Row'];
type PatientInsert = Database['public']['Tables']['patients']['Insert'];
type PatientUpdate = Database['public']['Tables']['patients']['Update'];

const sanitizeNullableString = (value: string | null | undefined): string | null => {
  if (typeof value !== 'string') {
    return value ?? null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

class SupabasePatientService {
  private mapRowToPatient(row: PatientRow): Patient {
    const status = (row.status || 'active').toLowerCase();

    const mapStatus = (): PatientStatus => {
      switch (status) {
        case 'inactive':
          return PatientStatus.Inactive;
        case 'discharged':
          return PatientStatus.Discharged;
        default:
          return PatientStatus.Active;
      }
    };

    return {
      id: row.id,
      name: row.name ?? row.full_name ?? '',
      cpf: row.cpf ?? '',
      birthDate: row.birth_date ?? row.date_of_birth ?? '',
      phone: row.phone ?? '',
      email: row.email ?? '',
      emergencyContact: {
        name: row.emergency_contact_name ?? '',
        phone: row.emergency_contact_phone ?? '',
      },
      address: {
        street: row.address_street ?? row.address ?? '',
        city: row.address_city ?? '',
        state: row.address_state ?? '',
        zip: row.address_zip ?? '',
      },
      status: mapStatus(),
      lastVisit: row.updated_at ?? row.created_at ?? new Date().toISOString(),
      registrationDate: row.created_at ?? new Date().toISOString(),
      avatarUrl: '',
      consentGiven: true,
      whatsappConsent: 'opt-out',
      allergies: undefined,
      medicalAlerts: row.medical_history ?? undefined,
      surgeries: undefined,
      conditions: undefined,
      attachments: undefined,
      trackedMetrics: undefined,
      communicationLogs: undefined,
      painPoints: undefined,
    };
  }

  private mapPatientStatus(status: PatientStatus | undefined): string | null {
    if (!status) return null;
    switch (status) {
      case PatientStatus.Inactive:
        return 'inactive';
      case PatientStatus.Discharged:
        return 'discharged';
      case PatientStatus.Active:
      default:
        return 'active';
    }
  }

  private mapPatientToInsert(patient: Omit<Patient, 'id'>): PatientInsert {
    const createdAt = patient.registrationDate ?? new Date().toISOString();
    const updatedAt = patient.lastVisit ?? createdAt;

    return {
      full_name: patient.name,
      name: patient.name,
      email: sanitizeNullableString(patient.email),
      phone: sanitizeNullableString(patient.phone),
      birth_date: sanitizeNullableString(patient.birthDate),
      date_of_birth: sanitizeNullableString(patient.birthDate),
      cpf: sanitizeNullableString(patient.cpf),
      address_street: sanitizeNullableString(patient.address?.street),
      address_number: null,
      address_city: sanitizeNullableString(patient.address?.city),
      address_state: sanitizeNullableString(patient.address?.state),
      address_zip: sanitizeNullableString(patient.address?.zip),
      emergency_contact_name: sanitizeNullableString(patient.emergencyContact?.name),
      emergency_contact_phone: sanitizeNullableString(patient.emergencyContact?.phone),
      medical_history: sanitizeNullableString(patient.medicalAlerts),
      status: this.mapPatientStatus(patient.status),
      created_at: createdAt,
      updated_at: updatedAt,
    };
  }

  private mapPatientToUpdate(patient: Partial<Patient>): PatientUpdate {
    const update: PatientUpdate = {
      updated_at: new Date().toISOString(),
    };

    if (patient.name !== undefined) {
      update.full_name = patient.name;
      update.name = patient.name;
    }
    if (patient.email !== undefined) update.email = sanitizeNullableString(patient.email);
    if (patient.phone !== undefined) update.phone = sanitizeNullableString(patient.phone);
    if (patient.birthDate !== undefined) {
      const value = sanitizeNullableString(patient.birthDate);
      update.birth_date = value;
      update.date_of_birth = value;
    }
    if (patient.cpf !== undefined) update.cpf = sanitizeNullableString(patient.cpf);
    if (patient.address !== undefined) {
      update.address_street = sanitizeNullableString(patient.address?.street);
      update.address_city = sanitizeNullableString(patient.address?.city);
      update.address_state = sanitizeNullableString(patient.address?.state);
      update.address_zip = sanitizeNullableString(patient.address?.zip);
    }
    if (patient.emergencyContact !== undefined) {
      update.emergency_contact_name = sanitizeNullableString(patient.emergencyContact?.name);
      update.emergency_contact_phone = sanitizeNullableString(patient.emergencyContact?.phone);
    }
    if (patient.medicalAlerts !== undefined) {
      update.medical_history = sanitizeNullableString(patient.medicalAlerts);
    }
    if (patient.status !== undefined) {
      update.status = this.mapPatientStatus(patient.status);
    }

    return update;
  }

  async getAllPatients(): Promise<Patient[]> {
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data ?? []).map(this.mapRowToPatient.bind(this));
    } catch (error: unknown) {
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
    } catch (error: unknown) {
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

      return (data ?? []).map(this.mapRowToPatient.bind(this));
    } catch (error: unknown) {
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

      return (data ?? []).map(this.mapRowToPatient.bind(this));
    } catch (error: unknown) {
      throw new Error(handleSupabaseError(error));
    }
  }

  async createPatient(patientData: Omit<Patient, 'id' | 'lastVisit' | 'registrationDate'>): Promise<Patient> {
    try {
      const insertData = this.mapPatientToInsert({
        ...patientData,
        lastVisit: patientData.lastVisit ?? new Date().toISOString(),
        registrationDate: patientData.registrationDate ?? new Date().toISOString(),
      });

      const { data, error } = await supabase
        .from('patients')
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;

      return this.mapRowToPatient(data);
    } catch (error: unknown) {
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
    } catch (error: unknown) {
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
    } catch (error: unknown) {
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

      return (data ?? []).map(this.mapRowToPatient.bind(this));
    } catch (error: unknown) {
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
        total: totalResult.count ?? 0,
        active: activeResult.count ?? 0,
        inactive: inactiveResult.count ?? 0,
        newThisMonth: newThisMonthResult.count ?? 0,
      };
    } catch (error: unknown) {
      throw new Error(handleSupabaseError(error));
    }
  }

  // Real-time subscriptions
  subscribeToPatients(callback: (payload: SupabaseRealtimePayload<PatientRow> & { patient: Patient | null }) => void) {
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
          const enrichedPayload: SupabaseRealtimePayload<PatientRow> & { patient: Patient | null } = {
            ...(payload as SupabaseRealtimePayload<PatientRow>),
            patient: payload.new ? this.mapRowToPatient(payload.new as PatientRow) : null,
          };

          callback(enrichedPayload);
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
    } catch (error: unknown) {
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
    } catch (error: unknown) {
      throw new Error(handleSupabaseError(error));
    }
  }
}

// Export singleton instance
export const supabasePatientService = new SupabasePatientService();
export default supabasePatientService;
