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
      therapistId: row.therapist_id,
      startTime: row.start_time,
      endTime: row.end_time,
      title: row.title,
      description: row.description || '',
      status: row.status as AppointmentStatus,
      type: row.type as AppointmentType,
      location: row.location || '',
      notes: row.notes || '',
      recurrenceRule: row.recurrence_rule || undefined,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  private mapAppointmentToInsert(appointment: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>): AppointmentInsert {
    return {
      patient_id: appointment.patientId,
      therapist_id: appointment.therapistId,
      start_time: appointment.startTime,
      end_time: appointment.endTime,
      title: appointment.title,
      description: appointment.description || null,
      status: appointment.status,
      type: appointment.type,
      location: appointment.location || null,
      notes: appointment.notes || null,
      recurrence_rule: appointment.recurrenceRule || null,
    };
  }

  private mapAppointmentToUpdate(appointment: Partial<Appointment>): AppointmentUpdate {
    const update: AppointmentUpdate = {};

    if (appointment.patientId) update.patient_id = appointment.patientId;
    if (appointment.therapistId) update.therapist_id = appointment.therapistId;
    if (appointment.startTime) update.start_time = appointment.startTime;
    if (appointment.endTime) update.end_time = appointment.endTime;
    if (appointment.title) update.title = appointment.title;
    if (appointment.description !== undefined) update.description = appointment.description || null;
    if (appointment.status) update.status = appointment.status;
    if (appointment.type) update.type = appointment.type;
    if (appointment.location !== undefined) update.location = appointment.location || null;
    if (appointment.notes !== undefined) update.notes = appointment.notes || null;
    if (appointment.recurrenceRule !== undefined) update.recurrence_rule = appointment.recurrenceRule || null;

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
        .neq('status', AppointmentStatus.Cancelled)
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
        .in('status', [AppointmentStatus.Scheduled, AppointmentStatus.Confirmed])
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
        confirmedResult,
        inProgressResult,
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
          .eq('status', AppointmentStatus.Confirmed),
        supabase.from('appointments').select('id', { count: 'exact', head: true })
          .eq('status', AppointmentStatus.InProgress),
        supabase.from('appointments').select('id', { count: 'exact', head: true })
          .eq('status', AppointmentStatus.Completed),
        supabase.from('appointments').select('id', { count: 'exact', head: true })
          .eq('status', AppointmentStatus.Cancelled),
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
          [AppointmentStatus.Confirmed]: confirmedResult.count || 0,
          [AppointmentStatus.InProgress]: inProgressResult.count || 0,
          [AppointmentStatus.Completed]: completedResult.count || 0,
          [AppointmentStatus.Cancelled]: cancelledResult.count || 0,
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