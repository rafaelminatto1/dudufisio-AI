import { supabase, handleSupabaseError, subscribeToTable } from '../../lib/supabase';
import type { Database } from '../../types/database';
import { format, addDays, startOfWeek, endOfWeek } from 'date-fns';
import { ptBR } from 'date-fns/locale';

type Appointment = Database['public']['Tables']['appointments']['Row'];
type AppointmentInsert = Database['public']['Tables']['appointments']['Insert'];
type AppointmentUpdate = Database['public']['Tables']['appointments']['Update'];

export interface AppointmentFilters {
  therapistId?: string;
  patientId?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  appointmentType?: string;
  room?: string;
}

export interface TimeSlot {
  time: string;
  available: boolean;
  reason?: string;
}

class AppointmentService {
  // Get appointments with filters
  async getAppointments(filters?: AppointmentFilters) {
    try {
      let query = supabase
        .from('appointments')
        .select(`
          *,
          patient:patient_id(full_name, email, phone),
          therapist:therapist_id(full_name, specialization),
          session:sessions(*)
        `);

      if (filters?.therapistId) {
        query = query.eq('therapist_id', filters.therapistId);
      }

      if (filters?.patientId) {
        query = query.eq('patient_id', filters.patientId);
      }

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      if (filters?.appointmentType) {
        query = query.eq('appointment_type', filters.appointmentType);
      }

      if (filters?.room) {
        query = query.eq('room', filters.room);
      }

      if (filters?.startDate && filters?.endDate) {
        query = query
          .gte('appointment_date', filters.startDate)
          .lte('appointment_date', filters.endDate);
      }

      const { data, error } = await query.order('appointment_date', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      throw new Error(handleSupabaseError(error));
    }
  }

  // Get appointment by ID
  async getAppointmentById(id: string) {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          patient:patient_id(*),
          therapist:therapist_id(*),
          session:sessions(*)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw new Error(handleSupabaseError(error));
    }
  }

  // Create appointment
  async createAppointment(appointment: AppointmentInsert) {
    try {
      // Check for conflicts
      const conflicts = await this.checkAppointmentConflict(
        appointment.therapist_id,
        appointment.appointment_date,
        appointment.start_time,
        appointment.end_time,
        appointment.room || undefined
      );

      if (conflicts.length > 0) {
        throw new Error('Horário já ocupado para este fisioterapeuta ou sala');
      }

      const { data, error } = await supabase
        .from('appointments')
        .insert(appointment)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw new Error(handleSupabaseError(error));
    }
  }

  // Update appointment
  async updateAppointment(id: string, updates: AppointmentUpdate) {
    try {
      // If updating time/date, check for conflicts
      if (updates.appointment_date || updates.start_time || updates.end_time || updates.therapist_id) {
        const current = await this.getAppointmentById(id);
        
        const conflicts = await this.checkAppointmentConflict(
          updates.therapist_id || current.therapist_id,
          updates.appointment_date || current.appointment_date,
          updates.start_time || current.start_time,
          updates.end_time || current.end_time,
          updates.room || current.room || undefined,
          id
        );

        if (conflicts.length > 0) {
          throw new Error('Horário já ocupado para este fisioterapeuta ou sala');
        }
      }

      const { data, error } = await supabase
        .from('appointments')
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

  // Cancel appointment
  async cancelAppointment(id: string, reason: string, cancelledBy: string) {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .update({
          status: 'cancelled',
          cancellation_reason: reason,
          cancelled_by: cancelledBy,
          cancelled_at: new Date().toISOString(),
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

  // Mark appointment as completed
  async completeAppointment(id: string) {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .update({
          status: 'completed',
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

  // Mark appointment as no-show
  async markAsNoShow(id: string) {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .update({
          status: 'no_show',
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

  // Check appointment conflicts
  async checkAppointmentConflict(
    therapistId: string,
    date: string,
    startTime: string,
    endTime: string,
    room?: string,
    excludeId?: string
  ) {
    try {
      const { data, error } = await supabase.rpc('check_appointment_conflict', {
        p_therapist_id: therapistId,
        p_date: date,
        p_start_time: startTime,
        p_end_time: endTime,
        p_room: room || null,
        p_exclude_id: excludeId || null,
      });

      if (error) throw error;
      return data || [];
    } catch (error) {
      throw new Error(handleSupabaseError(error));
    }
  }

  // Get available time slots
  async getAvailableTimeSlots(
    therapistId: string,
    date: string,
    duration: number = 60
  ): Promise<TimeSlot[]> {
    try {
      // Get all appointments for the therapist on the given date
      const { data: appointments, error } = await supabase
        .from('appointments')
        .select('start_time, end_time')
        .eq('therapist_id', therapistId)
        .eq('appointment_date', date)
        .not('status', 'in', '(cancelled,no_show)');

      if (error) throw error;

      // Generate all possible time slots (8:00 to 18:00, every 30 minutes)
      const slots: TimeSlot[] = [];
      const startHour = 8;
      const endHour = 18;
      const slotInterval = 30;

      for (let hour = startHour; hour < endHour; hour++) {
        for (let minute = 0; minute < 60; minute += slotInterval) {
          const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:00`;
          const endTime = this.addMinutes(time, duration);

          // Check if this slot conflicts with any existing appointment
          const hasConflict = appointments?.some(apt => {
            return (
              (time >= apt.start_time && time < apt.end_time) ||
              (endTime > apt.start_time && endTime <= apt.end_time) ||
              (time <= apt.start_time && endTime >= apt.end_time)
            );
          });

          slots.push({
            time,
            available: !hasConflict,
            reason: hasConflict ? 'Horário ocupado' : undefined,
          });
        }
      }

      return slots;
    } catch (error) {
      throw new Error(handleSupabaseError(error));
    }
  }

  // Get week appointments
  async getWeekAppointments(date: Date, therapistId?: string) {
    try {
      const weekStart = startOfWeek(date, { locale: ptBR });
      const weekEnd = endOfWeek(date, { locale: ptBR });

      const filters: AppointmentFilters = {
        startDate: format(weekStart, 'yyyy-MM-dd'),
        endDate: format(weekEnd, 'yyyy-MM-dd'),
      };

      if (therapistId) {
        filters.therapistId = therapistId;
      }

      return await this.getAppointments(filters);
    } catch (error) {
      throw new Error(handleSupabaseError(error));
    }
  }

  // Get today's appointments
  async getTodayAppointments(therapistId?: string) {
    try {
      const today = format(new Date(), 'yyyy-MM-dd');
      
      const filters: AppointmentFilters = {
        startDate: today,
        endDate: today,
      };

      if (therapistId) {
        filters.therapistId = therapistId;
      }

      return await this.getAppointments(filters);
    } catch (error) {
      throw new Error(handleSupabaseError(error));
    }
  }

  // Get upcoming appointments for patient
  async getUpcomingAppointments(patientId: string, limit = 5) {
    try {
      const today = format(new Date(), 'yyyy-MM-dd');
      
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          therapist:therapist_id(full_name, specialization)
        `)
        .eq('patient_id', patientId)
        .gte('appointment_date', today)
        .eq('status', 'scheduled')
        .order('appointment_date', { ascending: true })
        .order('start_time', { ascending: true })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      throw new Error(handleSupabaseError(error));
    }
  }

  // Create recurring appointments
  async createRecurringAppointments(
    baseAppointment: AppointmentInsert,
    recurrenceType: 'daily' | 'weekly' | 'biweekly' | 'monthly',
    occurrences: number
  ) {
    try {
      const appointments: AppointmentInsert[] = [];
      let currentDate = new Date(baseAppointment.appointment_date);

      for (let i = 0; i < occurrences; i++) {
        if (i > 0) {
          switch (recurrenceType) {
            case 'daily':
              currentDate = addDays(currentDate, 1);
              break;
            case 'weekly':
              currentDate = addDays(currentDate, 7);
              break;
            case 'biweekly':
              currentDate = addDays(currentDate, 14);
              break;
            case 'monthly':
              currentDate.setMonth(currentDate.getMonth() + 1);
              break;
          }
        }

        appointments.push({
          ...baseAppointment,
          appointment_date: format(currentDate, 'yyyy-MM-dd'),
        });
      }

      // Check for conflicts for all appointments
      const conflicts = [];
      for (const apt of appointments) {
        const conflictCheck = await this.checkAppointmentConflict(
          apt.therapist_id,
          apt.appointment_date,
          apt.start_time,
          apt.end_time,
          apt.room || undefined
        );
        
        if (conflictCheck.length > 0) {
          conflicts.push({
            date: apt.appointment_date,
            conflicts: conflictCheck,
          });
        }
      }

      if (conflicts.length > 0) {
        throw new Error(`Conflitos encontrados em ${conflicts.length} datas`);
      }

      // Create all appointments
      const { data, error } = await supabase
        .from('appointments')
        .insert(appointments)
        .select();

      if (error) throw error;
      return data || [];
    } catch (error) {
      throw new Error(handleSupabaseError(error));
    }
  }

  // Subscribe to appointment changes
  subscribeToAppointmentChanges(callback: (payload: any) => void) {
    return subscribeToTable('appointments', callback);
  }

  // Subscribe to therapist appointments
  subscribeToTherapistAppointments(therapistId: string, callback: (payload: any) => void) {
    return subscribeToTable('appointments', callback, {
      column: 'therapist_id',
      value: therapistId,
    });
  }

  // Subscribe to patient appointments
  subscribeToPatientAppointments(patientId: string, callback: (payload: any) => void) {
    return subscribeToTable('appointments', callback, {
      column: 'patient_id',
      value: patientId,
    });
  }

  // Helper function to add minutes to time
  private addMinutes(time: string, minutes: number): string {
    const [hours, mins] = time.split(':').map(Number);
    const totalMinutes = hours * 60 + mins + minutes;
    const newHours = Math.floor(totalMinutes / 60);
    const newMinutes = totalMinutes % 60;
    return `${newHours.toString().padStart(2, '0')}:${newMinutes.toString().padStart(2, '0')}:00`;
  }

  // Get appointment statistics
  async getAppointmentStatistics(filters?: AppointmentFilters) {
    try {
      const appointments = await this.getAppointments(filters);
      
      const stats = {
        total: appointments.length,
        scheduled: appointments.filter(a => a.status === 'scheduled').length,
        confirmed: appointments.filter(a => a.status === 'confirmed').length,
        completed: appointments.filter(a => a.status === 'completed').length,
        cancelled: appointments.filter(a => a.status === 'cancelled').length,
        noShow: appointments.filter(a => a.status === 'no_show').length,
        byType: {
          evaluation: appointments.filter(a => a.appointment_type === 'evaluation').length,
          session: appointments.filter(a => a.appointment_type === 'session').length,
          return: appointments.filter(a => a.appointment_type === 'return').length,
          group: appointments.filter(a => a.appointment_type === 'group').length,
        },
      };

      return stats;
    } catch (error) {
      throw new Error(handleSupabaseError(error));
    }
  }
}

export const appointmentService = new AppointmentService();
export default appointmentService;
