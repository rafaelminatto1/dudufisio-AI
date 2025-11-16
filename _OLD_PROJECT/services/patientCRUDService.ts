import { supabase } from '@/lib/supabaseClient';
import { Patient, PatientInput, PatientUpdate, PatientFilters } from '@/types';

export class PatientCRUDService {
  /**
   * Get all patients with optional filters
   */
  static async getAll(filters?: PatientFilters): Promise<Patient[]> {
    let query = supabase
      .from('patients')
      .select('*')
      .order('created_at', { ascending: false });

    // Apply filters
    if (filters?.status) {
      if (Array.isArray(filters.status)) {
        query = query.in('status', filters.status);
      } else {
        query = query.eq('status', filters.status);
      }
    }

    if (filters?.search) {
      query = query.or(
        `name.ilike.%${filters.search}%,cpf.ilike.%${filters.search}%,email.ilike.%${filters.search}%`
      );
    }

    if (filters?.therapistId) {
      query = query.eq('therapist_id', filters.therapistId);
    }

    if (filters?.registrationDateFrom) {
      query = query.gte('registration_date', filters.registrationDateFrom);
    }

    if (filters?.registrationDateTo) {
      query = query.lte('registration_date', filters.registrationDateTo);
    }

    if (filters?.hasAlerts) {
      query = query.not('medical_alerts', 'is', null);
    }

    if (filters?.tags && filters.tags.length > 0) {
      query = query.contains('tags', filters.tags);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  }

  /**
   * Get patient by ID
   */
  static async getById(id: string): Promise<Patient | null> {
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Create a new patient
   */
  static async create(patient: PatientInput): Promise<Patient> {
    const { data, error } = await supabase
      .from('patients')
      .insert([patient])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Update a patient
   */
  static async update(id: string, patient: PatientUpdate): Promise<Patient> {
    const { data, error } = await supabase
      .from('patients')
      .update(patient)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Delete a patient (soft delete)
   */
  static async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('patients')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;
  }

  /**
   * Hard delete a patient (permanent)
   */
  static async hardDelete(id: string): Promise<void> {
    const { error } = await supabase
      .from('patients')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  /**
   * Bulk update patients
   */
  static async bulkUpdate(ids: string[], updates: PatientUpdate): Promise<void> {
    const { error } = await supabase
      .from('patients')
      .update(updates)
      .in('id', ids);

    if (error) throw error;
  }

  /**
   * Bulk delete patients
   */
  static async bulkDelete(ids: string[]): Promise<void> {
    const { error } = await supabase
      .from('patients')
      .update({ deleted_at: new Date().toISOString() })
      .in('id', ids);

    if (error) throw error;
  }

  /**
   * Search patients
   */
  static async search(query: string, limit: number = 10): Promise<Patient[]> {
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .or(`name.ilike.%${query}%,cpf.ilike.%${query}%,email.ilike.%${query}%,phone.ilike.%${query}%`)
      .limit(limit);

    if (error) throw error;
    return data || [];
  }

  /**
   * Get patients with upcoming appointments
   */
  static async getWithUpcomingAppointments(): Promise<Patient[]> {
    const { data, error } = await supabase
      .from('patients')
      .select(`
        *,
        appointments!inner (
          id,
          start_time,
          end_time,
          status
        )
      `)
      .gte('appointments.start_time', new Date().toISOString())
      .order('appointments.start_time', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  /**
   * Get patient statistics
   */
  static async getStatistics() {
    const { data, error } = await supabase
      .from('patients')
      .select('status, count(*)', { count: 'exact' });

    if (error) throw error;

    const stats = {
      total: 0,
      active: 0,
      inactive: 0,
      discharged: 0,
    };

    if (data) {
      data.forEach((row: any) => {
        stats.total += row.count || 0;
        if (row.status === 'Active') stats.active = row.count || 0;
        if (row.status === 'Inactive') stats.inactive = row.count || 0;
        if (row.status === 'Discharged') stats.discharged = row.count || 0;
      });
    }

    return stats;
  }
}

