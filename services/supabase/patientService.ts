import { supabase, handleSupabaseError, subscribeToTable } from '../../lib/supabase';
import type { Database } from '../../types/database';

type Patient = Database['public']['Tables']['patients']['Row'];
type PatientInsert = Database['public']['Tables']['patients']['Insert'];
type PatientUpdate = Database['public']['Tables']['patients']['Update'];

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
        query = query.eq('insurance_provider', filters.insuranceProvider);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
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
      return data;
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
      // Check if CPF already exists
      const existing = await this.getPatientByCPF(patient.cpf);
      if (existing) {
        throw new Error('CPF já cadastrado no sistema');
      }

      const { data, error } = await supabase
        .from('patients')
        .insert(patient)
        .select()
        .single();

      if (error) throw error;
      return data;
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
      return data;
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
      return data;
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
        financialResult,
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
        
        // Financial balance
        supabase
          .from('financial_transactions')
          .select('amount, transaction_type')
          .eq('patient_id', patientId)
          .eq('status', 'completed'),
      ]);

      if (appointmentsResult.error) throw appointmentsResult.error;
      if (sessionsResult.error) throw sessionsResult.error;
      if (painPointsResult.error) throw painPointsResult.error;
      if (financialResult.error) throw financialResult.error;

      // Calculate financial balance
      const balance = financialResult.data?.reduce((acc, transaction) => {
        if (transaction.transaction_type === 'payment') {
          return acc + transaction.amount;
        } else if (transaction.transaction_type === 'refund') {
          return acc - transaction.amount;
        }
        return acc;
      }, 0) || 0;

      return {
        totalAppointments: appointmentsResult.count || 0,
        completedSessions: sessionsResult.count || 0,
        activePainPoints: painPointsResult.count || 0,
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
      return data || [];
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

      const patientIds = [...new Set(data?.map(a => a.patient_id) || [])];

      if (patientIds.length === 0) return [];

      const { data: patients, error: patientsError } = await supabase
        .from('patients')
        .select('*')
        .in('id', patientIds);

      if (patientsError) throw patientsError;
      return patients || [];
    } catch (error) {
      throw new Error(handleSupabaseError(error));
    }
  }

  // Subscribe to patient changes
  subscribeToPatientChanges(callback: (payload: any) => void) {
    return subscribeToTable('patients', callback);
  }

  // Subscribe to specific patient changes
  subscribeToPatientById(patientId: string, callback: (payload: any) => void) {
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
      return data || [];
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

      const rows = patients.map(patient => [
        patient.full_name,
        patient.email,
        patient.phone,
        patient.cpf,
        patient.birth_date,
        patient.gender || '',
        `${patient.address_street || ''} ${patient.address_number || ''}`,
        patient.address_city || '',
        patient.address_state || '',
        patient.address_zip_code || '',
        patient.insurance_provider || '',
        patient.status,
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
      ].join('\n');

      return csvContent;
    } catch (error) {
      throw new Error(handleSupabaseError(error));
    }
  }
}

export const patientService = new PatientService();
export default patientService;