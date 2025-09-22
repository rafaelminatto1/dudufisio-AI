import { useState, useEffect, useCallback } from 'react';
import appointmentService, { AppointmentFilters, TimeSlot } from '../../services/supabase/appointmentService';
import type { Database } from '../../types/database';
import { format } from 'date-fns';

type Appointment = Database['public']['Tables']['appointments']['Row'];
type AppointmentInsert = Database['public']['Tables']['appointments']['Insert'];
type AppointmentUpdate = Database['public']['Tables']['appointments']['Update'];

export const useSupabaseAppointments = (filters?: AppointmentFilters) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load appointments
  const loadAppointments = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await appointmentService.getAppointments(filters);
      setAppointments(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar agendamentos');
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Initial load
  useEffect(() => {
    loadAppointments();
  }, [loadAppointments]);

  // Subscribe to real-time updates
  useEffect(() => {
    const channel = appointmentService.subscribeToAppointmentChanges((payload) => {
      // Check if appointment matches filters
      const matchesFilters = () => {
        if (!filters) return true;
        
        const appointment = payload.new || payload.old;
        
        if (filters.therapistId && appointment.therapist_id !== filters.therapistId) {
          return false;
        }
        
        if (filters.patientId && appointment.patient_id !== filters.patientId) {
          return false;
        }
        
        if (filters.status && appointment.status !== filters.status) {
          return false;
        }
        
        if (filters.startDate && appointment.appointment_date < filters.startDate) {
          return false;
        }
        
        if (filters.endDate && appointment.appointment_date > filters.endDate) {
          return false;
        }
        
        return true;
      };

      if (!matchesFilters()) return;

      if (payload.eventType === 'INSERT') {
        loadAppointments(); // Reload to get full data with relations
      } else if (payload.eventType === 'UPDATE') {
        loadAppointments(); // Reload to get updated relations
      } else if (payload.eventType === 'DELETE') {
        setAppointments(prev => prev.filter(a => a.id !== payload.old.id));
      }
    });

    return () => {
      channel.unsubscribe();
    };
  }, [filters, loadAppointments]);

  // Create appointment
  const createAppointment = useCallback(async (appointment: AppointmentInsert) => {
    try {
      const newAppointment = await appointmentService.createAppointment(appointment);
      await loadAppointments(); // Reload to get full data with relations
      return { success: true, data: newAppointment };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar agendamento';
      return { success: false, error: errorMessage };
    }
  }, [loadAppointments]);

  // Update appointment
  const updateAppointment = useCallback(async (id: string, updates: AppointmentUpdate) => {
    try {
      const updatedAppointment = await appointmentService.updateAppointment(id, updates);
      await loadAppointments(); // Reload to get updated relations
      return { success: true, data: updatedAppointment };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar agendamento';
      return { success: false, error: errorMessage };
    }
  }, [loadAppointments]);

  // Cancel appointment
  const cancelAppointment = useCallback(async (id: string, reason: string, cancelledBy: string) => {
    try {
      const cancelledAppointment = await appointmentService.cancelAppointment(id, reason, cancelledBy);
      await loadAppointments();
      return { success: true, data: cancelledAppointment };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao cancelar agendamento';
      return { success: false, error: errorMessage };
    }
  }, [loadAppointments]);

  // Complete appointment
  const completeAppointment = useCallback(async (id: string) => {
    try {
      const completedAppointment = await appointmentService.completeAppointment(id);
      await loadAppointments();
      return { success: true, data: completedAppointment };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao completar agendamento';
      return { success: false, error: errorMessage };
    }
  }, [loadAppointments]);

  // Mark as no-show
  const markAsNoShow = useCallback(async (id: string) => {
    try {
      const appointment = await appointmentService.markAsNoShow(id);
      await loadAppointments();
      return { success: true, data: appointment };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao marcar como falta';
      return { success: false, error: errorMessage };
    }
  }, [loadAppointments]);

  // Create recurring appointments
  const createRecurringAppointments = useCallback(async (
    baseAppointment: AppointmentInsert,
    recurrenceType: 'daily' | 'weekly' | 'biweekly' | 'monthly',
    occurrences: number
  ) => {
    try {
      const appointments = await appointmentService.createRecurringAppointments(
        baseAppointment,
        recurrenceType,
        occurrences
      );
      await loadAppointments();
      return { success: true, data: appointments };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar agendamentos recorrentes';
      return { success: false, error: errorMessage };
    }
  }, [loadAppointments]);

  // Get statistics
  const getStatistics = useCallback(async () => {
    try {
      const stats = await appointmentService.getAppointmentStatistics(filters);
      return { success: true, data: stats };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao obter estatísticas';
      return { success: false, error: errorMessage, data: null };
    }
  }, [filters]);

  // Refresh data
  const refresh = useCallback(() => {
    loadAppointments();
  }, [loadAppointments]);

  return {
    appointments,
    loading,
    error,
    createAppointment,
    updateAppointment,
    cancelAppointment,
    completeAppointment,
    markAsNoShow,
    createRecurringAppointments,
    getStatistics,
    refresh,
  };
};

// Hook for available time slots
export const useSupabaseTimeSlots = (
  therapistId: string | null,
  date: string | null,
  duration: number = 60
) => {
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadTimeSlots = useCallback(async () => {
    if (!therapistId || !date) {
      setTimeSlots([]);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const slots = await appointmentService.getAvailableTimeSlots(therapistId, date, duration);
      setTimeSlots(slots);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar horários disponíveis');
      setTimeSlots([]);
    } finally {
      setLoading(false);
    }
  }, [therapistId, date, duration]);

  useEffect(() => {
    loadTimeSlots();
  }, [loadTimeSlots]);

  return {
    timeSlots,
    loading,
    error,
    refresh: loadTimeSlots,
  };
};

// Hook for week view
export const useSupabaseWeekAppointments = (date: Date, therapistId?: string) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAppointments = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await appointmentService.getWeekAppointments(date, therapistId);
      setAppointments(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar agendamentos da semana');
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  }, [date, therapistId]);

  useEffect(() => {
    loadAppointments();
  }, [loadAppointments]);

  // Subscribe to real-time updates for the week
  useEffect(() => {
    const channel = appointmentService.subscribeToAppointmentChanges((_payload) => {
      loadAppointments(); // Reload on any change
    });

    return () => {
      channel.unsubscribe();
    };
  }, [loadAppointments]);

  return {
    appointments,
    loading,
    error,
    refresh: loadAppointments,
  };
};

// Hook for today's appointments
export const useSupabaseTodayAppointments = (therapistId?: string) => {
  const today = format(new Date(), 'yyyy-MM-dd');
  
  return useSupabaseAppointments({
    startDate: today,
    endDate: today,
    ...(therapistId && { therapistId }),
  });
};

// Hook for patient upcoming appointments
export const useSupabaseUpcomingAppointments = (patientId: string | null, limit = 5) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAppointments = useCallback(async () => {
    if (!patientId) {
      setAppointments([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const data = await appointmentService.getUpcomingAppointments(patientId, limit);
      setAppointments(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar próximos agendamentos');
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  }, [patientId, limit]);

  useEffect(() => {
    loadAppointments();
  }, [loadAppointments]);

  // Subscribe to patient appointment changes
  useEffect(() => {
    if (!patientId) return;

    const channel = appointmentService.subscribeToPatientAppointments(patientId, (_payload) => {
      loadAppointments();
    });

    return () => {
      channel.unsubscribe();
    };
  }, [patientId, loadAppointments]);

  return {
    appointments,
    loading,
    error,
    refresh: loadAppointments,
  };
};

export default useSupabaseAppointments;
