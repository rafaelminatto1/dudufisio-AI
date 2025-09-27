import { supabase, handleSupabaseError, subscribeToTable } from '../../lib/supabase';
import type { SupabaseRealtimePayload } from '../../types/realtime';
import type { Database } from '../../types/database';
type PatientTable = Database['public']['Tables']['patients'];
type PatientRow = PatientTable['Row'];
type PatientInsert = PatientTable['Insert'];
type PatientUpdate = PatientTable['Update'];

type PatientRealtimePayload = SupabaseRealtimePayload<PatientRow>;

export interface PatientFilters {
  status?: 'active' | 'inactive' | 'archived';
  search?: string;
  therapistId?: string;
  insuranceProvider?: string;
}

class PatientService {
  // Get all patients
  async getPatients(filters?: PatientFilters) {
    try {
      let query = supabase
        .from('patients')
        .select(`
          *,
          appointments:appointments(count),
          sessions:sessions(count)
        `);

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      if (filters?.search) {
        query = query.or(`full_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,cpf.ilike.%${filters.search}%`);
      }

      if (filters?.insuranceProvider) {
        // Align with schema: patients.insurance_info
        query = query.eq('insurance_info', filters.insuranceProvider);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      return data ?? [];
    } catch (error) {
      throw new Error(handleSupabaseError(error));
    }
  }

  // Get patient by ID
  async getPatientById(id: string) {
    try {
      const { data, error } = await supabase
        .from('patients')
        .select(`
          *,
          pain_points:pain_points(*),
          appointments:appointments(
            *,
            therapist:therapist_id(full_name, specialization),
            session:sessions(*)
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data ?? null;
    } catch (error) {
      throw new Error(handleSupabaseError(error));
    }
  }

  // Get patient by CPF
  async getPatientByCPF(cpf: string) {
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('cpf', cpf)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    } catch (error) {
      throw new Error(handleSupabaseError(error));
    }
  }

  // Create new patient
  async createPatient(patient: PatientInsert) {
    try {
      // Check if CPF already exists (only if provided)
      if (patient.cpf) {
        const existing = await this.getPatientByCPF(patient.cpf);
        if (existing) {
          throw new Error('CPF já cadastrado no sistema');
        }
      }

      const { data, error } = await supabase
        .from('patients')
        .insert(patient)
        .select()
        .single();

      if (error) throw error;
      return data ?? null;
    } catch (error) {
      throw new Error(handleSupabaseError(error));
    }
  }

  // Update patient
  async updatePatient(id: string, updates: PatientUpdate) {
    try {
      const { data, error } = await supabase
        .from('patients')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data ?? null;
    } catch (error) {
      throw new Error(handleSupabaseError(error));
    }
  }

  // Archive patient
  async archivePatient(id: string) {
    try {
      const { data, error } = await supabase
        .from('patients')
        .update({
          status: 'archived',
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data ?? null;
    } catch (error) {
      throw new Error(handleSupabaseError(error));
    }
  }

  // Delete patient (soft delete)
  async deletePatient(id: string) {
    return this.archivePatient(id);
  }

  // Get patient statistics
  async getPatientStatistics(patientId: string) {
    try {
      const [
        appointmentsResult,
        sessionsResult,
        painPointsResult,
        paymentsResult,
      ] = await Promise.all([
        // Total appointments
        supabase
          .from('appointments')
          .select('*', { count: 'exact', head: true })
          .eq('patient_id', patientId),
        
        // Completed sessions
        supabase
          .from('appointments')
          .select('*', { count: 'exact', head: true })
          .eq('patient_id', patientId)
          .eq('status', 'completed'),
        
        // Active pain points
        supabase
          .from('pain_points')
          .select('*', { count: 'exact', head: true })
          .eq('patient_id', patientId)
          .eq('status', 'active'),
        
        // Payments (align with schema: payment_transactions)
        supabase
          .from('payment_transactions')
          .select('amount, status')
          .eq('customer_id', patientId)
          .eq('status', 'completed'),
      ]);

      if (appointmentsResult.error) throw appointmentsResult.error;
      if (sessionsResult.error) throw sessionsResult.error;
      if (painPointsResult.error) throw painPointsResult.error;
      if (paymentsResult.error) throw paymentsResult.error;

      // Calculate financial balance
      const balance = paymentsResult.data?.reduce((acc: number, transaction: { amount: number }) => {
        return acc + (typeof transaction.amount === 'number' ? transaction.amount : 0);
      }, 0) ?? 0;

      return {
        totalAppointments: appointmentsResult.count ?? 0,
        completedSessions: sessionsResult.count ?? 0,
        activePainPoints: painPointsResult.count ?? 0,
        financialBalance: balance,
      };
    } catch (error) {
      throw new Error(handleSupabaseError(error));
    }
  }

  // Search patients
  async searchPatients(searchTerm: string, limit = 10) {
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('id, full_name, email, cpf, phone')
        .or(`full_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,cpf.ilike.%${searchTerm}%`)
        .limit(limit);

      if (error) throw error;
      return data ?? [];
    } catch (error) {
      throw new Error(handleSupabaseError(error));
    }
  }

  // Get patients by therapist
  async getPatientsByTherapist(therapistId: string) {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('patient_id')
        .eq('therapist_id', therapistId)
        .eq('status', 'completed');

      if (error) throw error;

      const patientIds = [...new Set((data ?? []).map((appointment: { patient_id: string }) => appointment.patient_id))];

      if (patientIds.length === 0) return [];

      const { data: patients, error: patientsError } = await supabase
        .from('patients')
        .select('*')
        .in('id', patientIds);

      if (patientsError) throw patientsError;
      return patients ?? [];
    } catch (error) {
      throw new Error(handleSupabaseError(error));
    }
  }

  // Subscribe to patient changes
  subscribeToPatientChanges(callback: (payload: PatientRealtimePayload) => void) {
    return subscribeToTable('patients', callback);
  }

  // Subscribe to specific patient changes
  subscribeToPatientById(patientId: string, callback: (payload: PatientRealtimePayload) => void) {
    return subscribeToTable('patients', callback, {
      column: 'id',
      value: patientId,
    });
  }

  // Bulk import patients
  async bulkImportPatients(patients: PatientInsert[]) {
    try {
      const { data, error } = await supabase
        .from('patients')
        .insert(patients)
        .select();

      if (error) throw error;
      return data ?? [];
    } catch (error) {
      throw new Error(handleSupabaseError(error));
    }
  }

  // Export patients to CSV
  async exportPatientsToCSV(filters?: PatientFilters) {
    try {
      const patients = await this.getPatients(filters);
      
      const headers = [
        'Nome Completo',
        'Email',
        'Telefone',
        'CPF',
        'Data de Nascimento',
        'Gênero',
        'Endereço',
        'Cidade',
        'Estado',
        'CEP',
        'Convênio',
        'Status',
      ];

      const rows = patients.map((patient) => [
        patient.full_name,
        patient.email,
        patient.phone,
        patient.cpf,
        patient.birth_date,
        patient.gender ?? '',
        `${patient.address_street ?? ''} ${patient.address_number ?? ''}`.trim(),
        patient.address_city ?? '',
        patient.address_state ?? '',
        patient.address_zip ?? '',
        patient.insurance_info ?? '',
        patient.status ?? '',
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map((row) => row.map((cell) => `"${cell ?? ''}"`).join(',')),
      ].join('\n');

      return csvContent;
    } catch (error) {
      throw new Error(handleSupabaseError(error));
    }
  }
}

export const patientService = new PatientService();
export default patientService;
