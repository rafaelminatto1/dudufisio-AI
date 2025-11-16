import { supabase } from '../../lib/supabaseClient';
import { handleSupabaseError } from '../../lib/middleware/errorHandler';
import { Patient, PatientStatus } from '../../types';
import type { SupabaseRealtimePayload } from '../../types/realtime';
import type { Database } from '../../types/database';
import type { RealtimeChannel } from '@supabase/supabase-js';

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

type ListParams = {
  q?: string;
  status?: PatientStatus;
  sort?: 'name' | 'created_at' | 'updated_at';
  dir?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
};

export interface PatientStatistics {
  totalAppointments: number;
  completedSessions: number;
  activePainPoints: number;
  financialBalance: number;
}

class SupabasePatientService {
  // Expor instância para casos legados que acessam diretamente
  public supabase = supabase;
  private useViews = true;
  private mapRowToPatient(row: PatientRow): Patient {
    const status = (row.status || 'active').toLowerCase();

    const mapStatus = (): PatientStatus => {
      const statusLower = status.toLowerCase();
      if (statusLower.includes('inactive') || statusLower.includes('archived')) {
        return PatientStatus.Inactive;
      } else if (statusLower.includes('discharged')) {
        return PatientStatus.Discharged;
      } else {
        return PatientStatus.Active;
      }
    };

    // Parse JSONB fields safely
    const address = (row.address as any) || {};
    const emergencyContact = (row.emergency_contact as any) || {};

    return {
      id: row.id,
      name: row.full_name ?? row.name ?? '',
      cpf: row.cpf ?? '',
      birthDate: row.birth_date ?? '',
      phone: row.phone ?? '',
      email: row.email ?? '',
      emergencyContact: {
        name: emergencyContact.name ?? '',
        phone: emergencyContact.phone ?? '',
      },
      address: {
        street: address.street ?? '',
        city: address.city ?? '',
        state: address.state ?? '',
        zip: address.zipcode ?? address.zip ?? '',
        number: address.number ?? '',
        complement: address.complement ?? '',
        neighborhood: address.neighborhood ?? '',
      },
      status: mapStatus(),
      lastVisit: row.updated_at ?? row.created_at ?? new Date().toISOString(),
      registrationDate: row.created_at ?? new Date().toISOString(),
      avatarUrl: '',
      consentGiven: true,
      whatsappConsent: 'opt-out',
      allergies: row.allergies?.join(', '),
      medicalAlerts: row.notes,
      surgeries: undefined,
      conditions: row.chronic_conditions?.map(c => ({ name: c, date: '', description: '' })) || [],
      attachments: undefined,
      trackedMetrics: undefined,
      communicationLogs: undefined,
      painPoints: undefined,
      blood_type: row.blood_type,
      insurance: row.health_insurance,
      insuranceType: row.health_insurance ? 'private' : 'none' as any,
      tags: row.tags,
      observations: row.notes,
    };
  }

  private mapViewRowToPatient(row: any): Patient {
    const name = row.nome_completo ?? row.full_name ?? row.name ?? ''
    const birth = row.data_nascimento ?? row.birth_date ?? ''
    const phone = row.telefone_contato ?? row.phone ?? ''
    const created = row.criado_em ?? row.created_at ?? new Date().toISOString()
    const updated = row.atualizado_em ?? row.updated_at ?? created

    return {
      id: row.id,
      name,
      cpf: row.cpf ?? '',
      birthDate: birth,
      phone,
      email: row.email ?? '',
      emergencyContact: { name: '', phone: '' },
      address: { street: '', city: '', state: '', zip: '' },
      status: PatientStatus.Active,
      lastVisit: updated,
      registrationDate: created,
      avatarUrl: '',
      consentGiven: true,
      whatsappConsent: 'opt-out',
      allergies: undefined,
      medicalAlerts: undefined,
      surgeries: undefined,
      conditions: [],
      attachments: undefined,
      trackedMetrics: undefined,
      communicationLogs: undefined,
      painPoints: undefined,
      blood_type: undefined,
      insurance: undefined as any,
      insuranceType: 'none' as any,
      tags: undefined,
      observations: undefined,
    }
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

    // Build address JSONB
    const addressJson = patient.address ? {
      street: patient.address.street || '',
      number: patient.address.number || '',
      complement: patient.address.complement || '',
      neighborhood: patient.address.neighborhood || '',
      city: patient.address.city || '',
      state: patient.address.state || '',
      zipcode: patient.address.zip || '',
    } : {};

    // Build emergency contact JSONB
    const emergencyContactJson = patient.emergencyContact ? {
      name: patient.emergencyContact.name || '',
      phone: patient.emergencyContact.phone || '',
      relationship: '',
    } : {};

    return {
      full_name: patient.name,
      email: sanitizeNullableString(patient.email),
      phone: sanitizeNullableString(patient.phone) || '',
      birth_date: sanitizeNullableString(patient.birthDate),
      cpf: sanitizeNullableString(patient.cpf),
      gender: patient.gender as any,
      address: addressJson as any,
      emergency_contact: emergencyContactJson as any,
      blood_type: patient.blood_type,
      allergies: patient.allergies ? patient.allergies.split(',').map(a => a.trim()) : null,
      chronic_conditions: patient.conditions?.map(c => c.name) || null,
      health_insurance: patient.insurance as any,
      notes: sanitizeNullableString(patient.medicalAlerts || patient.observations),
      tags: patient.tags || null,
      status: this.mapPatientStatus(patient.status) as any,
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
    }
    if (patient.email !== undefined) update.email = sanitizeNullableString(patient.email);
    if (patient.phone !== undefined) update.phone = sanitizeNullableString(patient.phone);
    if (patient.birthDate !== undefined) {
      update.birth_date = sanitizeNullableString(patient.birthDate);
    }
    if (patient.cpf !== undefined) update.cpf = sanitizeNullableString(patient.cpf);
    if (patient.gender !== undefined) update.gender = patient.gender as any;
    if (patient.blood_type !== undefined) update.blood_type = patient.blood_type;
    if (patient.address !== undefined) {
      update.address = {
        street: patient.address.street || '',
        number: patient.address.number || '',
        complement: patient.address.complement || '',
        neighborhood: patient.address.neighborhood || '',
        city: patient.address.city || '',
        state: patient.address.state || '',
        zipcode: patient.address.zip || '',
      } as any;
    }
    if (patient.emergencyContact !== undefined) {
      update.emergency_contact = {
        name: patient.emergencyContact.name || '',
        phone: patient.emergencyContact.phone || '',
        relationship: '',
      } as any;
    }
    if (patient.allergies !== undefined) {
      update.allergies = patient.allergies.split(',').map(a => a.trim()) as any;
    }
    if (patient.conditions !== undefined) {
      update.chronic_conditions = patient.conditions.map(c => c.name) as any;
    }
    if (patient.insurance !== undefined || patient.insuranceType !== undefined) {
      update.health_insurance = (patient.insurance || patient.insuranceType) as any;
    }
    if (patient.medicalAlerts !== undefined || patient.observations !== undefined) {
      update.notes = sanitizeNullableString(patient.medicalAlerts || patient.observations);
    }
    if (patient.tags !== undefined) {
      update.tags = patient.tags as any;
    }
    if (patient.status !== undefined) {
      update.status = this.mapPatientStatus(patient.status) as any;
    }

    return update;
  }

  async getAllPatients(): Promise<Patient[]> {
    try {
      if (this.useViews) {
        const { data, error } = await supabase
          .from('paciente_registros')
          .select('*')
          .order('criado_em', { ascending: false })
        if (!error && data) return (data ?? []).map(this.mapViewRowToPatient.bind(this))
      }
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

  async list(params: ListParams = {}): Promise<{ patients: Patient[]; total: number }> {
    try {
      const {
        q,
        status,
        sort = 'created_at',
        dir = 'desc',
        limit = 20,
        offset = 0,
      } = params;

      if (this.useViews) {
        let vq = (supabase as any)
          .from('paciente_registros')
          .select('*', { count: 'exact' })
          .order(sort === 'created_at' ? 'criado_em' : sort, { ascending: dir === 'asc' })
        if (q && q.trim()) {
          const term = q.trim()
          vq = vq.or(
            `nome_completo.ilike.%${term}%,email.ilike.%${term}%,telefone_contato.ilike.%${term}%`
          )
        }
        const { data, error, count } = await (vq as any).range(offset, offset + limit - 1)
        if (!error && data) {
          return { patients: (data ?? []).map(this.mapViewRowToPatient.bind(this)), total: count ?? (data?.length ?? 0) }
        }
      }
      let query = (supabase as any)
        .from('patients')
        .select('*', { count: 'exact' })
        .order(sort, { ascending: dir === 'asc' });

      if (q && q.trim()) {
        const term = q.trim();
        query = query.or(
          `full_name.ilike.%${term}%,email.ilike.%${term}%,phone.ilike.%${term}%`
        );
      }

      if (status) {
        // Muitos schemas usam string; se não existir, não filtra
        query = (query as any).eq('status', status as any);
      }

      const { data, error, count } = await (query as any).range(offset, offset + limit - 1);
      if (error) throw error;

      return {
        patients: (data ?? []).map(this.mapRowToPatient.bind(this)),
        total: count ?? (data?.length ?? 0),
      };
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
      const { data, error } = await (supabase as any)
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
      // Sanitizar query para evitar caracteres problemáticos
      const sanitizedQuery = query.trim().replace(/[%_]/g, '\\$&');
      
      if (sanitizedQuery.length < 2) {
        return [];
      }
      
      if (this.useViews) {
        const { data, error } = await supabase
          .from('paciente_registros')
          .select('*')
          .or(`nome_completo.ilike.%${sanitizedQuery}%,email.ilike.%${sanitizedQuery}%,telefone_contato.ilike.%${sanitizedQuery}%,cpf.ilike.%${sanitizedQuery}%`)
          .order('nome_completo', { ascending: true })
          .limit(50)
        if (!error && data) return (data ?? []).map(this.mapViewRowToPatient.bind(this))
      }
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .or(`full_name.ilike.%${sanitizedQuery}%,email.ilike.%${sanitizedQuery}%,phone.ilike.%${sanitizedQuery}%,cpf.ilike.%${sanitizedQuery}%`)
        .order('full_name', { ascending: true })
        .limit(50);

      if (error) {
        console.error('Supabase search error:', error);
        throw error;
      }

      return (data ?? []).map(this.mapRowToPatient.bind(this));
    } catch (error: unknown) {
      const errorMsg = handleSupabaseError(error);
      console.error('Erro detalhado em searchPatients:', { query, error, errorMsg });
      throw new Error(errorMsg);
    }
  }

  async createPatient(patientData: Omit<Patient, 'id' | 'lastVisit' | 'registrationDate'>): Promise<Patient> {
    try {
      const insertData = this.mapPatientToInsert({
        ...patientData,
        lastVisit: new Date().toISOString(),
        registrationDate: new Date().toISOString(),
        id: ''
      } as any);

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

  async archivePatient(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('patients')
        .update({ status: 'inactive' as any, updated_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
    } catch (error: unknown) {
      throw new Error(handleSupabaseError(error));
    }
  }

  async restorePatient(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('patients')
        .update({ status: 'active' as any, updated_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
    } catch (error: unknown) {
      throw new Error(handleSupabaseError(error));
    }
  }

  async getPatientsByStatus(status: PatientStatus): Promise<Patient[]> {
    try {
      const { data, error } = await (supabase as any)
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
        (supabase as any).from('patients').select('id', { count: 'exact', head: true }),
        (supabase as any).from('patients').select('id', { count: 'exact', head: true }).eq('status', PatientStatus.Active),
        (supabase as any).from('patients').select('id', { count: 'exact', head: true }).eq('status', PatientStatus.Inactive),
        (supabase as any).from('patients').select('id', { count: 'exact', head: true }).gte('created_at', currentMonth.toISOString())
      ] as any);

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

  async getPatientStatistics(patientId: string): Promise<PatientStatistics> {
    try {
      const [
        appointmentsResult,
        completedSessionsResult,
        activePainPointsResult,
        financialTransactionsResult,
      ] = await Promise.all([
        (supabase as any)
          .from('appointments')
          .select('id', { count: 'exact', head: true })
          .eq('patient_id', patientId),
        (supabase as any)
          .from('sessions')
          .select('id', { count: 'exact', head: true })
          .eq('patient_id', patientId)
          .eq('status', 'completed'),
        (supabase as any)
          .from('body_map_pain_regions')
          .select('id', { count: 'exact', head: true })
          .eq('patient_id', patientId)
          .is('deleted_at', null)
          .eq('is_active', true),
        supabase
          .from('financial_transactions')
          .select('amount, transaction_type, type')
          .eq('patient_id', patientId),
      ]);

      const totalAppointments = appointmentsResult?.count ?? 0;
      const completedSessions = completedSessionsResult?.count ?? 0;
      const activePainPoints = activePainPointsResult?.count ?? 0;

      const financialBalance =
        financialTransactionsResult?.data?.reduce((acc: number, transaction: Database['public']['Tables']['financial_transactions']['Row']) => {
          const amount = transaction.amount ?? 0;
          const normalizedType = (transaction.transaction_type ?? transaction.type ?? '').toLowerCase();
          const isCredit =
            normalizedType.includes('receita') ||
            normalizedType.includes('credit') ||
            normalizedType.includes('income');
          const isDebit =
            normalizedType.includes('despesa') ||
            normalizedType.includes('debit') ||
            normalizedType.includes('expense');

          if (isCredit) return acc + amount;
          if (isDebit) return acc - amount;
          return acc + amount;
        }, 0) ?? 0;

      return {
        totalAppointments,
        completedSessions,
        activePainPoints,
        financialBalance,
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

  subscribeToPatientById(
    patientId: string,
    callback: (payload: SupabaseRealtimePayload<PatientRow> & { patient: Patient | null }) => void
  ): RealtimeChannel {
    return supabase
      .channel(`patient_changes_${patientId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'patients',
          filter: `id=eq.${patientId}`,
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
        .update({ user_id: userId } as any)
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
        .update({ user_id: null } as any)
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
