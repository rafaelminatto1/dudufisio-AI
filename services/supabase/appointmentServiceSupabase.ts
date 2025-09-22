import { supabase, handleSupabaseError } from '../../lib/supabase';
import { Appointment, AppointmentStatus, AppointmentType } from '../../types';
import type { Database } from '../../types/database';

type AppointmentRow = Database['public']['Tables']['appointments']['Row'];
type AppointmentInsert = Database['public']['Tables']['appointments']['Insert'];
type AppointmentUpdate = Database['public']['Tables']['appointments']['Update'];

class SupabaseAppointmentService {
  private mapRowToAppointment(row: AppointmentRow): Appointment {
    return {
      id: row.id,
      patientId: row.patient_id,
      patientName: '', // Will be populated by join queries
      patientAvatarUrl: '', // Will be populated by join queries
      therapistId: row.therapist_id,
      startTime: new Date(row.start_time),
      endTime: new Date(row.end_time),
      title: `${row.appointment_type} - ${row.patient_id.substring(0, 8)}`, // Generate title from type
      type: row.appointment_type as AppointmentType,
      status: (row.status || 'Agendado') as AppointmentStatus,
      value: row.price || 0,
      paymentStatus: 'pending' as const,
      observations: row.notes || undefined,
      sessionNumber: undefined,
      totalSessions: undefined,
    };
  }

  private mapAppointmentToInsert(appointment: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>): AppointmentInsert {
    return {
      patient_id: appointment.patientId,
      therapist_id: appointment.therapistId,
      appointment_date: appointment.startTime.toISOString().split('T')[0],
      start_time: appointment.startTime.toISOString().split('T')[1].slice(0, 8),
      end_time: appointment.endTime.toISOString().split('T')[1].slice(0, 8),
      appointment_type: appointment.type,
      status: appointment.status || 'Agendado',
      price: appointment.value || null,
      notes: appointment.observations || null,
      chief_complaint: null,
      is_online: false,
      room: null,
    };
  }

  private mapAppointmentToUpdate(appointment: Partial<Appointment>): AppointmentUpdate {
    const update: AppointmentUpdate = {};

    if (appointment.patientId) update.patient_id = appointment.patientId;
    if (appointment.therapistId) update.therapist_id = appointment.therapistId;
    if (appointment.startTime) {
      update.appointment_date = appointment.startTime.toISOString().split('T')[0];
      update.start_time = appointment.startTime.toISOString().split('T')[1].slice(0, 8);
    }
    if (appointment.endTime) {
      update.end_time = appointment.endTime.toISOString().split('T')[1].slice(0, 8);
    }
    if (appointment.status) update.status = appointment.status;
    if (appointment.type) update.appointment_type = appointment.type;
    if (appointment.value !== undefined) update.price = appointment.value;
    if (appointment.observations !== undefined) update.notes = appointment.observations || null;

    update.updated_at = new Date().toISOString();

    return update;
  }

  async getAllAppointments(): Promise<Appointment[]> {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .order('start_time', { ascending: true });

      if (error) throw error;

      return (data || []).map(this.mapRowToAppointment);
    } catch (error: any) {
      throw new Error(handleSupabaseError(error));
    }
  }

  async getAppointmentById(id: string): Promise<Appointment | null> {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
      }

      return data ? this.mapRowToAppointment(data) : null;
    } catch (error: any) {
      throw new Error(handleSupabaseError(error));
    }
  }

  async getAppointmentsByDateRange(startDate: string, endDate: string): Promise<Appointment[]> {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .gte('start_time', startDate)
        .lte('start_time', endDate)
        .order('start_time', { ascending: true });

      if (error) throw error;

      return (data || []).map(this.mapRowToAppointment);
    } catch (error: any) {
      throw new Error(handleSupabaseError(error));
    }
  }

  async getAppointmentsByTherapist(therapistId: string, startDate?: string, endDate?: string): Promise<Appointment[]> {
    try {
      let query = supabase
        .from('appointments')
        .select('*')
        .eq('therapist_id', therapistId);

      if (startDate) {
        query = query.gte('start_time', startDate);
      }

      if (endDate) {
        query = query.lte('start_time', endDate);
      }

      const { data, error } = await query.order('start_time', { ascending: true });

      if (error) throw error;

      return (data || []).map(this.mapRowToAppointment);
    } catch (error: any) {
      throw new Error(handleSupabaseError(error));
    }
  }

  async getAppointmentsByPatient(patientId: string, startDate?: string, endDate?: string): Promise<Appointment[]> {
    try {
      let query = supabase
        .from('appointments')
        .select('*')
        .eq('patient_id', patientId);

      if (startDate) {
        query = query.gte('start_time', startDate);
      }

      if (endDate) {
        query = query.lte('start_time', endDate);
      }

      const { data, error } = await query.order('start_time', { ascending: true });

      if (error) throw error;

      return (data || []).map(this.mapRowToAppointment);
    } catch (error: any) {
      throw new Error(handleSupabaseError(error));
    }
  }

  async getAppointmentsByStatus(status: AppointmentStatus): Promise<Appointment[]> {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('status', status)
        .order('start_time', { ascending: true });

      if (error) throw error;

      return (data || []).map(this.mapRowToAppointment);
    } catch (error: any) {
      throw new Error(handleSupabaseError(error));
    }
  }

  async createAppointment(appointmentData: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>): Promise<Appointment> {
    try {
      // Check for conflicts before creating
      const conflicts = await this.checkConflicts(
        appointmentData.therapistId,
        appointmentData.startTime,
        appointmentData.endTime
      );

      if (conflicts.length > 0) {
        throw new Error('Conflito de horário detectado. Já existe um agendamento neste horário.');
      }

      const insertData = this.mapAppointmentToInsert(appointmentData);

      const { data, error } = await supabase
        .from('appointments')
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;

      return this.mapRowToAppointment(data);
    } catch (error: any) {
      throw new Error(handleSupabaseError(error));
    }
  }

  async updateAppointment(id: string, updates: Partial<Appointment>): Promise<Appointment> {
    try {
      // Check for conflicts if time or therapist is being updated
      if (updates.startTime || updates.endTime || updates.therapistId) {
        const current = await this.getAppointmentById(id);
        if (!current) throw new Error('Agendamento não encontrado');

        const therapistId = updates.therapistId || current.therapistId;
        const startTime = updates.startTime || current.startTime;
        const endTime = updates.endTime || current.endTime;

        const conflicts = await this.checkConflicts(therapistId, startTime, endTime, id);
        if (conflicts.length > 0) {
          throw new Error('Conflito de horário detectado. Já existe um agendamento neste horário.');
        }
      }

      const updateData = this.mapAppointmentToUpdate(updates);

      const { data, error } = await supabase
        .from('appointments')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return this.mapRowToAppointment(data);
    } catch (error: any) {
      throw new Error(handleSupabaseError(error));
    }
  }

  async deleteAppointment(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('appointments')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error: any) {
      throw new Error(handleSupabaseError(error));
    }
  }

  async checkConflicts(therapistId: string, startTime: string, endTime: string, excludeId?: string): Promise<Appointment[]> {
    try {
      let query = supabase
        .from('appointments')
        .select('*')
        .eq('therapist_id', therapistId)
        .neq('status', AppointmentStatus.Canceled)
        .or(`and(start_time.lt.${endTime},end_time.gt.${startTime})`);

      if (excludeId) {
        query = query.neq('id', excludeId);
      }

      const { data, error } = await query;

      if (error) throw error;

      return (data || []).map(this.mapRowToAppointment);
    } catch (error: any) {
      throw new Error(handleSupabaseError(error));
    }
  }

  async getUpcomingAppointments(limit: number = 10): Promise<Appointment[]> {
    try {
      const now = new Date().toISOString();

      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .gte('start_time', now)
        .in('status', [AppointmentStatus.Scheduled])
        .order('start_time', { ascending: true })
        .limit(limit);

      if (error) throw error;

      return (data || []).map(this.mapRowToAppointment);
    } catch (error: any) {
      throw new Error(handleSupabaseError(error));
    }
  }

  async getTodayAppointments(): Promise<Appointment[]> {
    try {
      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString();
      const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1).toISOString();

      return this.getAppointmentsByDateRange(startOfDay, endOfDay);
    } catch (error: any) {
      throw new Error(handleSupabaseError(error));
    }
  }

  async getAppointmentStats(): Promise<{
    total: number;
    today: number;
    thisWeek: number;
    thisMonth: number;
    byStatus: Record<AppointmentStatus, number>;
  }> {
    try {
      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
      const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).toISOString();

      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      startOfWeek.setHours(0, 0, 0, 0);

      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

      const [
        totalResult,
        todayResult,
        thisWeekResult,
        thisMonthResult,
        scheduledResult,
        completedResult,
        cancelledResult,
        noShowResult
      ] = await Promise.all([
        supabase.from('appointments').select('id', { count: 'exact', head: true }),
        supabase.from('appointments').select('id', { count: 'exact', head: true })
          .gte('start_time', startOfDay).lt('start_time', endOfDay),
        supabase.from('appointments').select('id', { count: 'exact', head: true })
          .gte('start_time', startOfWeek.toISOString()),
        supabase.from('appointments').select('id', { count: 'exact', head: true })
          .gte('start_time', startOfMonth),
        supabase.from('appointments').select('id', { count: 'exact', head: true })
          .eq('status', AppointmentStatus.Scheduled),
        supabase.from('appointments').select('id', { count: 'exact', head: true })
          .eq('status', AppointmentStatus.Completed),
        supabase.from('appointments').select('id', { count: 'exact', head: true })
          .eq('status', AppointmentStatus.Canceled),
        supabase.from('appointments').select('id', { count: 'exact', head: true })
          .eq('status', AppointmentStatus.NoShow)
      ]);

      return {
        total: totalResult.count || 0,
        today: todayResult.count || 0,
        thisWeek: thisWeekResult.count || 0,
        thisMonth: thisMonthResult.count || 0,
        byStatus: {
          [AppointmentStatus.Scheduled]: scheduledResult.count || 0,
          [AppointmentStatus.Completed]: completedResult.count || 0,
          [AppointmentStatus.Canceled]: cancelledResult.count || 0,
          [AppointmentStatus.NoShow]: noShowResult.count || 0,
        }
      };
    } catch (error: any) {
      throw new Error(handleSupabaseError(error));
    }
  }

  // Real-time subscriptions
  subscribeToAppointments(callback: (payload: any) => void) {
    return supabase
      .channel('appointments_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'appointments',
        },
        (payload) => {
          let appointment = null;
          if (payload.new) {
            appointment = this.mapRowToAppointment(payload.new as AppointmentRow);
          }
          callback({
            ...payload,
            appointment,
          });
        }
      )
      .subscribe();
  }

  subscribeToTherapistAppointments(therapistId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`therapist_${therapistId}_appointments`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'appointments',
          filter: `therapist_id=eq.${therapistId}`,
        },
        (payload) => {
          let appointment = null;
          if (payload.new) {
            appointment = this.mapRowToAppointment(payload.new as AppointmentRow);
          }
          callback({
            ...payload,
            appointment,
          });
        }
      )
      .subscribe();
  }

  subscribeToPatientAppointments(patientId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`patient_${patientId}_appointments`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'appointments',
          filter: `patient_id=eq.${patientId}`,
        },
        (payload) => {
          let appointment = null;
          if (payload.new) {
            appointment = this.mapRowToAppointment(payload.new as AppointmentRow);
          }
          callback({
            ...payload,
            appointment,
          });
        }
      )
      .subscribe();
  }
}

// Export singleton instance
export const supabaseAppointmentService = new SupabaseAppointmentService();
export default supabaseAppointmentService;