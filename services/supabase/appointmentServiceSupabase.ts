import { supabase } from '../../lib/supabaseClient';
import { handleSupabaseError } from '../../lib/middleware/errorHandler';
import { Appointment, AppointmentStatus, AppointmentType } from '../../types';
import { secureLogger } from '../../lib/secureLogger';

type AppointmentRow = {
  id: string;
  patient_id: string;
  therapist_id: string | null;
  created_by: string | null;
  patient_name: string;
  patient_phone: string | null;
  patient_email: string | null;
  patient_avatar_url: string | null;
  therapist_name: string | null;
  title: string;
  description: string | null;
  appointment_type: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  status: string;
  location: string | null;
  is_virtual: boolean | null;
  meeting_url: string | null;
  chief_complaint: string | null;
  notes: string | null;
  private_notes: string | null;
  is_recurring: boolean | null;
  recurrence_pattern: any | null;
  parent_appointment_id: string | null;
  cancelled_at: string | null;
  cancellation_reason: string | null;
  cancelled_by: string | null;
  confirmed_at: string | null;
  confirmation_method: string | null;
  checked_in_at: string | null;
  checked_out_at: string | null;
  payment_status: string | null;
  payment_amount: number | null;
  payment_method: string | null;
  tags: string[] | null;
  color: string | null;
  priority: number | null;
  created_at: string;
  updated_at: string;
};

type AppointmentInsert = Omit<AppointmentRow, 'id' | 'created_at' | 'updated_at'>;
type AppointmentUpdate = Partial<AppointmentInsert>;

/**
 * Service para gerenciar appointments no Supabase
 */
class SupabaseAppointmentService {
  /**
   * Mapeia um registro do Supabase para o tipo Appointment
   */
  private mapRowToAppointment(row: AppointmentRow): Appointment {
    return {
      id: row.id,
      patientId: row.patient_id,
      patient_id: row.patient_id,
      therapistId: row.therapist_id || undefined,
      therapist_id: row.therapist_id || undefined,
      user_id: row.created_by || undefined,

      // Patient info
      patientName: row.patient_name,
      full_name: row.patient_name,
      patientPhone: row.patient_phone || undefined,
      phone: row.patient_phone || undefined,
      email: row.patient_email || undefined,
      patientAvatarUrl: row.patient_avatar_url || '',

      // Therapist info
      therapistName: row.therapist_name || undefined,

      // Appointment details
      title: row.title,
      description: row.description || undefined,
      type: row.appointment_type as AppointmentType,
      appointment_type: row.appointment_type,

      // Date & Time
      startTime: new Date(row.start_time),
      endTime: new Date(row.end_time),
      duration: row.duration_minutes,
      duration_minutes: row.duration_minutes,

      // Status
      status: this.mapStatusFromDB(row.status),

      // Location
      location: row.location || undefined,
      is_virtual: row.is_virtual || undefined,
      meetingUrl: row.meeting_url || undefined,

      // Clinical
      chiefComplaint: row.chief_complaint || undefined,
      notes: row.notes || undefined,
      privateNotes: row.private_notes || undefined,

      // Recurrence
      isRecurring: row.is_recurring || undefined,
      recurrencePattern: row.recurrence_pattern || undefined,
      parentAppointmentId: row.parent_appointment_id || undefined,

      // Cancellation
      cancelledAt: row.cancelled_at || undefined,
      cancellationReason: row.cancellation_reason || undefined,
      cancelledBy: row.cancelled_by || undefined,

      // Confirmation
      confirmedAt: row.confirmed_at || undefined,
      confirmationMethod: row.confirmation_method || undefined,

      // Check-in/out
      checkedInAt: row.checked_in_at || undefined,
      checkedOutAt: row.checked_out_at || undefined,

      // Payment
      paymentStatus: (row.payment_status as 'paid' | 'pending' | undefined) || 'pending',
      paymentAmount: row.payment_amount || undefined,
      paymentMethod: row.payment_method || undefined,
      value: row.payment_amount ?? 0, // Mapear payment_amount para value

      // Metadata
      tags: row.tags || undefined,
      color: row.color || undefined,
      priority: row.priority || undefined,

      // Timestamps
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  /**
   * Mapeia AppointmentStatus enum para string do banco
   */
  private mapStatusToDB(status: AppointmentStatus): string {
    const statusMap: Record<AppointmentStatus, string> = {
      [AppointmentStatus.Scheduled]: 'scheduled',
      [AppointmentStatus.Confirmed]: 'confirmed',
      [AppointmentStatus.InProgress]: 'in_progress',
      [AppointmentStatus.Completed]: 'completed',
      [AppointmentStatus.Canceled]: 'cancelled',
      [AppointmentStatus.NoShow]: 'no_show',
      [AppointmentStatus.Rescheduled]: 'rescheduled',
    };
    return statusMap[status] || 'scheduled';
  }

  /**
   * Mapeia string do banco para AppointmentStatus enum
   */
  private mapStatusFromDB(status: string): AppointmentStatus {
    const statusMap: Record<string, AppointmentStatus> = {
      'scheduled': AppointmentStatus.Scheduled,
      'confirmed': AppointmentStatus.Confirmed,
      'in_progress': AppointmentStatus.InProgress,
      'completed': AppointmentStatus.Completed,
      'cancelled': AppointmentStatus.Canceled,
      'no_show': AppointmentStatus.NoShow,
      'rescheduled': AppointmentStatus.Rescheduled,
    };
    return statusMap[status] || AppointmentStatus.Scheduled;
  }

  /**
   * Mapeia Appointment para insert no banco
   */
  private mapAppointmentToInsert(appointment: Partial<Appointment>): Partial<AppointmentInsert> {
    const insert: Partial<AppointmentInsert> = {};

    if (appointment.patientId) insert.patient_id = appointment.patientId;
    if (appointment.therapistId) insert.therapist_id = appointment.therapistId;
    if (appointment.user_id) insert.created_by = appointment.user_id;

    if (appointment.patientName) insert.patient_name = appointment.patientName;
    if (appointment.patientPhone) insert.patient_phone = appointment.patientPhone;
    if (appointment.email) insert.patient_email = appointment.email;
    if (appointment.patientAvatarUrl) insert.patient_avatar_url = appointment.patientAvatarUrl;

    if (appointment.therapistName) insert.therapist_name = appointment.therapistName;

    if (appointment.title) insert.title = appointment.title;
    if (appointment.description) insert.description = appointment.description;
    if (appointment.type) insert.appointment_type = String(appointment.type); // Converter enum para string

    if (appointment.startTime) insert.start_time = appointment.startTime.toISOString();
    if (appointment.endTime) insert.end_time = appointment.endTime.toISOString();
    if (appointment.duration) insert.duration_minutes = appointment.duration;

    if (appointment.status) insert.status = this.mapStatusToDB(appointment.status);

    if (appointment.location) insert.location = appointment.location;
    if (appointment.is_virtual !== undefined) insert.is_virtual = appointment.is_virtual;
    if (appointment.meetingUrl) insert.meeting_url = appointment.meetingUrl;

    if (appointment.chiefComplaint) insert.chief_complaint = appointment.chiefComplaint;
    if (appointment.notes) insert.notes = appointment.notes;
    if (appointment.privateNotes) insert.private_notes = appointment.privateNotes;

    if (appointment.isRecurring !== undefined) insert.is_recurring = appointment.isRecurring;
    if (appointment.recurrencePattern) insert.recurrence_pattern = appointment.recurrencePattern;
    if (appointment.parentAppointmentId) insert.parent_appointment_id = appointment.parentAppointmentId;

    if (appointment.cancelledAt) insert.cancelled_at = appointment.cancelledAt;
    if (appointment.cancellation_reason) insert.cancellation_reason = appointment.cancellation_reason;
    if (appointment.cancelledBy) insert.cancelled_by = appointment.cancelledBy;

    if (appointment.confirmedAt) insert.confirmed_at = appointment.confirmedAt;
    if (appointment.confirmationMethod) insert.confirmation_method = appointment.confirmationMethod;

    if (appointment.checkedInAt) insert.checked_in_at = appointment.checkedInAt;
    if (appointment.checkedOutAt) insert.checked_out_at = appointment.checkedOutAt;

    // Sempre definir payment_status (não pode ser null)
    insert.payment_status = appointment.paymentStatus || 'pending';
    // Mapear tanto value quanto paymentAmount para payment_amount
    if (appointment.value !== undefined) insert.payment_amount = appointment.value;
    else if (appointment.paymentAmount !== undefined) insert.payment_amount = appointment.paymentAmount;
    if (appointment.paymentMethod) insert.payment_method = appointment.paymentMethod;

    if (appointment.tags) insert.tags = appointment.tags;
    if (appointment.color) insert.color = appointment.color;
    if (appointment.priority) insert.priority = appointment.priority;

    return insert;
  }

  /**
   * Busca todos os appointments
   */
  async getAllAppointments(): Promise<Appointment[]> {
    try {
      secureLogger.info('Buscando todos os appointments', {
        component: 'appointmentServiceSupabase',
        action: 'getAllAppointments'
      });

      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .order('start_time', { ascending: true });

      if (error) throw error;

      return (data ?? []).map(this.mapRowToAppointment.bind(this));
    } catch (error: unknown) {
      secureLogger.error('Erro ao buscar appointments', {
        component: 'appointmentServiceSupabase',
        error
      });
      throw new Error(handleSupabaseError(error));
    }
  }

  /**
   * Busca appointments por range de datas
   */
  async getAppointmentsByDateRange(startDate: Date, endDate: Date): Promise<Appointment[]> {
    try {
      secureLogger.info('Buscando appointments por range de datas', {
        component: 'appointmentServiceSupabase',
        action: 'getAppointmentsByDateRange',
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      });

      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .gte('start_time', startDate.toISOString())
        .lte('start_time', endDate.toISOString())
        .order('start_time', { ascending: true });

      if (error) throw error;

      return (data ?? []).map(this.mapRowToAppointment.bind(this));
    } catch (error: unknown) {
      secureLogger.error('Erro ao buscar appointments por range', {
        component: 'appointmentServiceSupabase',
        error
      });
      throw new Error(handleSupabaseError(error));
    }
  }

  /**
   * Busca appointment por ID
   */
  async getAppointmentById(id: string): Promise<Appointment | null> {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      if (!data) return null;

      return this.mapRowToAppointment(data);
    } catch (error: unknown) {
      secureLogger.error('Erro ao buscar appointment por ID', {
        component: 'appointmentServiceSupabase',
        appointmentId: id,
        error
      });
      throw new Error(handleSupabaseError(error));
    }
  }

  /**
   * Busca appointments por paciente
   */
  async getAppointmentsByPatientId(patientId: string): Promise<Appointment[]> {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('patient_id', patientId)
        .order('start_time', { ascending: false });

      if (error) throw error;

      return (data ?? []).map(this.mapRowToAppointment.bind(this));
    } catch (error: unknown) {
      secureLogger.error('Erro ao buscar appointments por paciente', {
        component: 'appointmentServiceSupabase',
        patientId,
        error
      });
      throw new Error(handleSupabaseError(error));
    }
  }

  /**
   * Busca appointments por terapeuta
   */
  async getAppointmentsByTherapistId(therapistId: string): Promise<Appointment[]> {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('therapist_id', therapistId)
        .order('start_time', { ascending: true});

      if (error) throw error;

      return (data ?? []).map(this.mapRowToAppointment.bind(this));
    } catch (error: unknown) {
      secureLogger.error('Erro ao buscar appointments por terapeuta', {
        component: 'appointmentServiceSupabase',
        therapistId,
        error
      });
      throw new Error(handleSupabaseError(error));
    }
  }

  /**
   * Cria um novo appointment
   */
  async createAppointment(appointment: Partial<Appointment>): Promise<Appointment> {
    try {
      secureLogger.info('Criando novo appointment', {
        component: 'appointmentServiceSupabase',
        action: 'createAppointment',
        patientId: appointment.patientId,
        startTime: appointment.startTime?.toISOString()
      });

      const insertData = this.mapAppointmentToInsert(appointment);

      const { data, error } = await supabase
        .from('appointments')
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;

      secureLogger.info('Appointment criado com sucesso', {
        component: 'appointmentServiceSupabase',
        appointmentId: data.id
      });

      return this.mapRowToAppointment(data);
    } catch (error: unknown) {
      secureLogger.error('Erro ao criar appointment', {
        component: 'appointmentServiceSupabase',
        error
      });
      throw new Error(handleSupabaseError(error));
    }
  }

  /**
   * Atualiza um appointment
   */
  async updateAppointment(id: string, updates: Partial<Appointment>): Promise<Appointment> {
    try {
      secureLogger.info('Atualizando appointment', {
        component: 'appointmentServiceSupabase',
        action: 'updateAppointment',
        appointmentId: id
      });

      const updateData = this.mapAppointmentToInsert(updates);

      const { data, error } = await supabase
        .from('appointments')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      secureLogger.info('Appointment atualizado com sucesso', {
        component: 'appointmentServiceSupabase',
        appointmentId: id
      });

      return this.mapRowToAppointment(data);
    } catch (error: unknown) {
      secureLogger.error('Erro ao atualizar appointment', {
        component: 'appointmentServiceSupabase',
        appointmentId: id,
        error
      });
      throw new Error(handleSupabaseError(error));
    }
  }

  /**
   * Cancela um appointment
   */
  async cancelAppointment(id: string, reason: string, cancelledBy?: string): Promise<Appointment> {
    try {
      secureLogger.info('Cancelando appointment', {
        component: 'appointmentServiceSupabase',
        action: 'cancelAppointment',
        appointmentId: id
      });

      const { data, error } = await supabase
        .from('appointments')
        .update({
          status: 'cancelled',
          cancelled_at: new Date().toISOString(),
          cancellation_reason: reason,
          cancelled_by: cancelledBy || null
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      secureLogger.info('Appointment cancelado com sucesso', {
        component: 'appointmentServiceSupabase',
        appointmentId: id
      });

      return this.mapRowToAppointment(data);
    } catch (error: unknown) {
      secureLogger.error('Erro ao cancelar appointment', {
        component: 'appointmentServiceSupabase',
        appointmentId: id,
        error
      });
      throw new Error(handleSupabaseError(error));
    }
  }

  /**
   * Deleta um appointment
   */
  async deleteAppointment(id: string): Promise<void> {
    try {
      secureLogger.info('Deletando appointment', {
        component: 'appointmentServiceSupabase',
        action: 'deleteAppointment',
        appointmentId: id
      });

      const { error } = await supabase
        .from('appointments')
        .delete()
        .eq('id', id);

      if (error) throw error;

      secureLogger.info('Appointment deletado com sucesso', {
        component: 'appointmentServiceSupabase',
        appointmentId: id
      });
    } catch (error: unknown) {
      secureLogger.error('Erro ao deletar appointment', {
        component: 'appointmentServiceSupabase',
        appointmentId: id,
        error
      });
      throw new Error(handleSupabaseError(error));
    }
  }
}

export const supabaseAppointmentService = new SupabaseAppointmentService();
