import { createServerComponentClient } from '~/lib/supabase/server';
import { Database } from '~/types/database.types';

type Appointment = Database['public']['Tables']['appointments']['Row'];
type AppointmentInsert = Database['public']['Tables']['appointments']['Insert'];
type AppointmentUpdate = Database['public']['Tables']['appointments']['Update'];

export class AppointmentService {
  /**
   * Get all appointments with optional filters
   */
  static async getAppointments(filters?: {
    patientId?: string;
    therapistId?: string;
    status?: string;
    startDate?: Date | string;
    endDate?: Date | string;
  }) {
    try {
      const supabase = await createServerComponentClient();
      let query = supabase
        .from('appointments')
        .select('*, patient:patients(*), therapist:therapists(*)')
        .order('start_time', { ascending: true });

      if (filters?.patientId) query = query.eq('patient_id', filters.patientId);
      if (filters?.therapistId) query = query.eq('therapist_id', filters.therapistId);
      if (filters?.status) query = query.eq('status', filters.status);
      
      if (filters?.startDate) {
        const startDate = filters.startDate instanceof Date 
          ? filters.startDate.toISOString() 
          : filters.startDate;
        query = query.gte('start_time', startDate);
      }
      
      if (filters?.endDate) {
        const endDate = filters.endDate instanceof Date 
          ? filters.endDate.toISOString() 
          : filters.endDate;
        query = query.lte('end_time', endDate);
      }

      const { data, error } = await query;
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching appointments:', error);
      return { data: null, error };
    }
  }

  /**
   * Get appointment by ID
   */
  static async getById(id: string) {
    try {
      const supabase = await createServerComponentClient();
      const { data, error } = await supabase
        .from('appointments')
        .select('*, patient:patients(*), therapist:therapists(*)')
        .eq('id', id)
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching appointment:', error);
      return { data: null, error };
    }
  }

  static async createAppointment(appointment: AppointmentInsert) {
    try {
      if (!appointment.patient_id || !appointment.therapist_id) {
        throw new Error('Patient and therapist are required');
      }
      const supabase = await createServerComponentClient();
      const { data, error } = await supabase
        .from('appointments')
        .insert(appointment)
        .select()
        .single();
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error creating appointment:', error);
      return { data: null, error };
    }
  }

  static async updateAppointment(id: string, updates: AppointmentUpdate) {
    try {
      const supabase = await createServerComponentClient();
      const { data, error } = await supabase
        .from('appointments')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error updating appointment:', error);
      return { data: null, error };
    }
  }

  /**
   * Delete an appointment
   */
  static async deleteAppointment(id: string) {
    try {
      const supabase = await createServerComponentClient();
      const { error } = await supabase
        .from('appointments')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Error deleting appointment:', error);
      return { error };
    }
  }

  /**
   * Cancel an appointment
   */
  static async cancelAppointment(id: string, reason?: string) {
    return this.updateAppointment(id, {
      status: 'cancelado',
      updated_at: new Date().toISOString(),
    });
  }

  /**
   * Get appointments statistics
   */
  static async getStats(filters?: {
    therapistId?: string;
    startDate?: Date | string;
    endDate?: Date | string;
  }) {
    try {
      const supabase = await createServerComponentClient();
      
      let query = supabase
        .from('appointments')
        .select('status', { count: 'exact', head: false });

      if (filters?.therapistId) query = query.eq('therapist_id', filters.therapistId);
      if (filters?.startDate) {
        const startDate = filters.startDate instanceof Date 
          ? filters.startDate.toISOString() 
          : filters.startDate;
        query = query.gte('start_time', startDate);
      }
      if (filters?.endDate) {
        const endDate = filters.endDate instanceof Date 
          ? filters.endDate.toISOString() 
          : filters.endDate;
        query = query.lte('end_time', endDate);
      }

      const { data, error, count } = await query;

      if (error) throw error;

      const stats = {
        total: count || 0,
        agendado: data?.filter(a => a.status === 'agendado').length || 0,
        confirmado: data?.filter(a => a.status === 'confirmado').length || 0,
        concluido: data?.filter(a => a.status === 'concluido').length || 0,
        cancelado: data?.filter(a => a.status === 'cancelado').length || 0,
      };

      return { data: stats, error: null };
    } catch (error) {
      console.error('Error fetching appointment stats:', error);
      return { data: null, error };
    }
  }
}

