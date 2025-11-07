/**
 * AppointmentService - Lógica de negócio para agendamentos
 * Usa AppointmentRepository para acesso ao banco
 * Contém validações, transformações e regras de negócio
 */

import { appointmentRepository, type AppointmentFilters } from '../repositories/AppointmentRepository';
import type { Appointment } from '@/types';
import { AppointmentStatus, AppointmentType } from '@/types';
import type { Database } from '@/types/supabase';
import { eventService } from '../eventService';
import { secureLogger } from '@/lib/secureLogger';
import { withSupabaseQuery, withSupabaseMutation } from '@/lib/supabase/errorHandler';

type AppointmentRow = Database['public']['Tables']['appointments']['Row'];
type AppointmentInsert = Database['public']['Tables']['appointments']['Insert'];

export class AppointmentService {
  /**
   * Busca appointments por intervalo de datas
   */
  async getAppointments(startDate?: Date, endDate?: Date): Promise<Appointment[]> {
    return withSupabaseQuery(
      async () => {
        const filters: AppointmentFilters = {};

        if (startDate) {
          filters.startDate = startDate.toISOString();
        }
        if (endDate) {
          filters.endDate = endDate.toISOString();
        }

        const appointments = await appointmentRepository.findMany(filters);
        return appointments.map(apt => this.transformToAppointment(apt));
      },
      {
        operation: 'getAppointments',
        fallbackMessage: 'Erro ao buscar agendamentos',
      }
    );
  }

  /**
   * Busca appointments com dados relacionados (paciente, terapeuta)
   */
  async getAppointmentsWithDetails(startDate?: Date, endDate?: Date): Promise<Appointment[]> {
    return withSupabaseQuery(
      async () => {
        const filters: AppointmentFilters = {};

        if (startDate) {
          filters.startDate = startDate.toISOString();
        }
        if (endDate) {
          filters.endDate = endDate.toISOString();
        }

        const appointments = await appointmentRepository.findManyWithRelations(filters);
        
        return appointments.map(apt => {
          const base = this.transformToAppointment(apt);
          
          // Adicionar dados relacionados
          if (apt.patient) {
            base.patientName = apt.patient.name;
            base.patientPhone = apt.patient.phone;
            base.patientAvatarUrl = apt.patient.avatar_url || undefined;
            base.patientMedicalAlerts = apt.patient.medical_alerts || undefined;
          }
          
          if (apt.therapist) {
            base.therapistName = apt.therapist.name;
            base.therapistColor = apt.therapist.color || undefined;
          }

          return base;
        });
      },
      {
        operation: 'getAppointmentsWithDetails',
        fallbackMessage: 'Erro ao buscar agendamentos detalhados',
      }
    );
  }

  /**
   * Busca appointment por ID
   */
  async getAppointmentById(id: string): Promise<Appointment | null> {
    return withSupabaseQuery(
      async () => {
        const appointment = await appointmentRepository.findById(id);
        return appointment ? this.transformToAppointment(appointment) : null;
      },
      {
        operation: 'getAppointmentById',
        fallbackMessage: 'Erro ao buscar agendamento',
      }
    );
  }

  /**
   * Busca appointments de um paciente
   */
  async getAppointmentsByPatientId(patientId: string): Promise<Appointment[]> {
    return withSupabaseQuery(
      async () => {
        const appointments = await appointmentRepository.findByPatientId(patientId);
        return appointments.map(apt => this.transformToAppointment(apt));
      },
      {
        operation: 'getAppointmentsByPatientId',
        fallbackMessage: 'Erro ao buscar agendamentos do paciente',
      }
    );
  }

  /**
   * Cria ou atualiza um appointment
   */
  async saveAppointment(appointmentData: Appointment): Promise<Appointment> {
    return withSupabaseMutation(
      async () => {
        // Validações de negócio
        this.validateAppointment(appointmentData);

        // Validar therapistId se fornecido
        if (appointmentData.therapistId) {
          const isValidUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
          if (!isValidUUID.test(appointmentData.therapistId)) {
            secureLogger.warn('TherapistId inválido detectado', {
              component: 'AppointmentService',
              invalidId: appointmentData.therapistId,
            });
            appointmentData.therapistId = undefined;
          }
        }

        // Verificar conflito de horário
        if (appointmentData.therapistId) {
          const hasConflict = await appointmentRepository.hasConflict(
            appointmentData.therapistId,
            appointmentData.startTime,
            appointmentData.endTime,
            appointmentData.id // Excluir o próprio appointment se for update
          );

          if (hasConflict) {
            throw new Error('Conflito de horário: terapeuta já possui agendamento neste período');
          }
        }

        // Transformar para formato do DB
        const dbData = this.transformToDbFormat(appointmentData);

        let savedAppointment: AppointmentRow;

        if (appointmentData.id) {
          // Update
          savedAppointment = await appointmentRepository.update(appointmentData.id, dbData);
          secureLogger.info('Appointment atualizado', { appointmentId: appointmentData.id });
        } else {
          // Create
          savedAppointment = await appointmentRepository.create(dbData);
          secureLogger.info('Appointment criado', { appointmentId: savedAppointment.id });
        }

        // Emitir evento para invalidar cache
        eventService.emit('appointments:changed');

        return this.transformToAppointment(savedAppointment);
      },
      {
        operation: 'saveAppointment',
        fallbackMessage: 'Erro ao salvar agendamento',
      }
    );
  }

  /**
   * Deleta um appointment
   */
  async deleteAppointment(id: string): Promise<void> {
    return withSupabaseMutation(
      async () => {
        await appointmentRepository.delete(id);
        secureLogger.info('Appointment deletado', { appointmentId: id });
        eventService.emit('appointments:changed');
      },
      {
        operation: 'deleteAppointment',
        fallbackMessage: 'Erro ao deletar agendamento',
      }
    );
  }

  /**
   * Marca appointment como completado
   */
  async markAsCompleted(id: string): Promise<Appointment> {
    return withSupabaseMutation(
      async () => {
        const appointment = await appointmentRepository.markAsCompleted(id);
        eventService.emit('appointments:changed');
        return this.transformToAppointment(appointment);
      },
      {
        operation: 'markAsCompleted',
        fallbackMessage: 'Erro ao marcar agendamento como completado',
      }
    );
  }

  /**
   * Marca appointment como cancelado
   */
  async markAsCancelled(id: string, reason?: string): Promise<Appointment> {
    return withSupabaseMutation(
      async () => {
        const appointment = await appointmentRepository.markAsCancelled(id, reason);
        eventService.emit('appointments:changed');
        return this.transformToAppointment(appointment);
      },
      {
        operation: 'markAsCancelled',
        fallbackMessage: 'Erro ao cancelar agendamento',
      }
    );
  }

  /**
   * Busca appointments de hoje
   */
  async getTodayAppointments(therapistId?: string): Promise<Appointment[]> {
    return withSupabaseQuery(
      async () => {
        const appointments = await appointmentRepository.findToday(therapistId);
        return appointments.map(apt => this.transformToAppointment(apt));
      },
      {
        operation: 'getTodayAppointments',
        fallbackMessage: 'Erro ao buscar agendamentos de hoje',
      }
    );
  }

  /**
   * Busca próximo appointment do paciente
   */
  async getNextAppointmentByPatient(patientId: string): Promise<Appointment | null> {
    return withSupabaseQuery(
      async () => {
        const appointment = await appointmentRepository.findNextByPatient(patientId);
        return appointment ? this.transformToAppointment(appointment) : null;
      },
      {
        operation: 'getNextAppointmentByPatient',
        fallbackMessage: 'Erro ao buscar próximo agendamento do paciente',
      }
    );
  }

  /**
   * Valida dados do appointment (lógica de negócio)
   */
  private validateAppointment(appointment: Appointment): void {
    if (!appointment.patientId) {
      throw new Error('Paciente é obrigatório');
    }

    if (!appointment.startTime || !appointment.endTime) {
      throw new Error('Horários são obrigatórios');
    }

    const start = new Date(appointment.startTime);
    const end = new Date(appointment.endTime);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new Error('Horários inválidos');
    }

    if (end <= start) {
      throw new Error('Horário de fim deve ser após o início');
    }

    // Validar duração máxima (ex: 4 horas)
    const durationHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    if (durationHours > 4) {
      throw new Error('Duração máxima de 4 horas excedida');
    }

    // Validar horário de trabalho (8h - 20h)
    const startHour = start.getHours();
    const endHour = end.getHours();
    if (startHour < 7 || endHour > 21) {
      throw new Error('Horário de trabalho: 7h às 21h');
    }
  }

  /**
   * Transforma AppointmentRow do DB para Appointment da aplicação
   */
  private transformToAppointment(row: AppointmentRow): Appointment {
    return {
      id: row.id,
      patientId: row.patient_id,
      patient_id: row.patient_id,
      patientName: row.patient_name || '',
      therapistId: row.therapist_id || undefined,
      therapist_id: row.therapist_id || undefined,
      startTime: row.start_time,
      endTime: row.end_time,
      status: (row.status as AppointmentStatus) || AppointmentStatus.Scheduled,
      type: (row.type as AppointmentType) || AppointmentType.Session,
      value: row.value ?? 0,
      notes: row.notes || '',
      room: row.room || undefined,
      duration: row.duration || undefined,
      isRecurring: row.is_recurring || false,
      recurrenceRule: row.recurrence_rule || undefined,
      parentAppointmentId: row.parent_appointment_id || undefined,
      createdAt: row.created_at || new Date().toISOString(),
      updatedAt: row.updated_at || new Date().toISOString(),
    };
  }

  /**
   * Transforma Appointment da aplicação para formato do DB
   */
  private transformToDbFormat(appointment: Appointment): Partial<AppointmentInsert> {
    return {
      patient_id: appointment.patientId,
      patient_name: appointment.patientName,
      therapist_id: appointment.therapistId || null,
      start_time: appointment.startTime,
      end_time: appointment.endTime,
      status: appointment.status,
      type: appointment.type,
      value: appointment.value,
      notes: appointment.notes,
      room: appointment.room || null,
      duration: appointment.duration || null,
      is_recurring: appointment.isRecurring || false,
      recurrence_rule: appointment.recurrenceRule || null,
      parent_appointment_id: appointment.parentAppointmentId || null,
    };
  }

  /**
   * Busca slots disponíveis para agendamento
   */
  async getAvailableSlots(
    therapistId: string,
    date: Date,
    slotDuration: number = 60
  ): Promise<{ start: Date; end: Date }[]> {
    return withSupabaseQuery(
      async () => {
        return appointmentRepository.findAvailableSlots(therapistId, date, slotDuration);
      },
      {
        operation: 'getAvailableSlots',
        fallbackMessage: 'Erro ao buscar slots disponíveis',
      }
    );
  }
}

// Singleton instance
export const appointmentService = new AppointmentService();

