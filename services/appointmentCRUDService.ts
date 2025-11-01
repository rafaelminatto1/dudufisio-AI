import { supabase } from '@/lib/supabaseClient';
import { Appointment } from '@/types';

export class AppointmentCRUDService {
  /**
   * Get all appointments with optional filters
   */
  static async getAll(filters?: {
    status?: string;
    type?: string;
    therapistId?: string;
    patientId?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<Appointment[]> {
    let query = supabase
      .from('appointments')
      .select('*')
      .order('start_time', { ascending: true });

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    if (filters?.type) {
      query = query.eq('type', filters.type);
    }

    if (filters?.therapistId) {
      query = query.eq('therapist_id', filters.therapistId);
    }

    if (filters?.patientId) {
      query = query.eq('patient_id', filters.patientId);
    }

    if (filters?.startDate) {
      query = query.gte('start_time', filters.startDate);
    }

    if (filters?.endDate) {
      query = query.lte('start_time', filters.endDate);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  }

  /**
   * Get appointment by ID
   */
  static async getById(id: string): Promise<Appointment | null> {
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Create a new appointment
   */
  static async create(appointment: Partial<Appointment>): Promise<Appointment> {
    const { data, error } = await supabase
      .from('appointments')
      .insert([appointment])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Update an appointment
   */
  static async update(id: string, appointment: Partial<Appointment>): Promise<Appointment> {
    const { data, error } = await supabase
      .from('appointments')
      .update(appointment)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Delete an appointment
   */
  static async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('appointments')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  /**
   * Confirm appointment
   */
  static async confirm(id: string): Promise<Appointment> {
    return this.update(id, { status: 'Confirmado' as any });
  }

  /**
   * Cancel appointment
   */
  static async cancel(id: string, reason?: string): Promise<Appointment> {
    return this.update(id, {
      status: 'Cancelado' as any,
      cancellationReason: reason,
    });
  }

  /**
   * Get appointments for today
   */
  static async getToday(): Promise<Appointment[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .gte('start_time', today.toISOString())
      .lt('start_time', tomorrow.toISOString())
      .order('start_time', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  /**
   * Get upcoming appointments
   */
  static async getUpcoming(limit: number = 10): Promise<Appointment[]> {
    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .gte('start_time', now)
      .order('start_time', { ascending: true })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }

  /**
   * Get appointment statistics
   */
  static async getStatistics(startDate?: string, endDate?: string) {
    let query = supabase
      .from('appointments')
      .select('status, type, count(*)', { count: 'exact' });

    if (startDate) {
      query = query.gte('start_time', startDate);
    }

    if (endDate) {
      query = query.lte('start_time', endDate);
    }

    const { data, error } = await query;

    if (error) throw error;

    return {
      byStatus: data?.reduce((acc: any, row: any) => {
        acc[row.status] = row.count || 0;
        return acc;
      }, {}),
      byType: data?.reduce((acc: any, row: any) => {
        acc[row.type] = (acc[row.type] || 0) + (row.count || 0);
        return acc;
      }, {}),
    };
  }
}

