import { createServerComponentClient } from '~/lib/supabase/server';
import { Database } from '~/types/database.types';

type Appointment = Database['public']['Tables']['appointments']['Row'];
type AppointmentInsert = Database['public']['Tables']['appointments']['Insert'];
type AppointmentUpdate = Database['public']['Tables']['appointments']['Update'];

export class AppointmentService {
  static async getAppointments(filters?: {
    patientId?: string;
    therapistId?: string;
    startDate?: Date;
    endDate?: Date;
  }) {
    try {
      const supabase = createServerComponentClient();
      let query = supabase
        .from('appointments')
        .select('*, patient:patients(*), therapist:therapists(*)')
        .order('start_time', { ascending: true });

      if (filters?.patientId) query = query.eq('patient_id', filters.patientId);
      if (filters?.therapistId) query = query.eq('therapist_id', filters.therapistId);
      if (filters?.startDate) query = query.gte('start_time', filters.startDate.toISOString());
      if (filters?.endDate) query = query.lte('end_time', filters.endDate.toISOString());

      const { data, error } = await query;
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching appointments:', error);
      return { data: null, error };
    }
  }

  static async createAppointment(appointment: AppointmentInsert) {
    try {
      if (!appointment.patient_id || !appointment.therapist_id) {
        throw new Error('Patient and therapist are required');
      }
      const supabase = createServerComponentClient();
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
      const supabase = createServerComponentClient();
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

  static async cancelAppointment(id: string, reason?: string) {
    return this.updateAppointment(id, {
      status: 'cancelado',
    });
  }
}

