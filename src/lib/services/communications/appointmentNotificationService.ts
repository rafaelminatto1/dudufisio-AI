import { createServerComponentClient } from '~/lib/supabase/server';
import { NotificationService } from './notificationService';
import { WhatsAppService } from './whatsappService';
import { EmailService } from './emailService';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export interface NotificationSchedule {
  appointmentId: string;
  userId: string;
  scheduledFor: string;
  type: 'confirmation' | 'reminder_24h' | 'reminder_2h' | 'cancellation' | 'update';
  sent: boolean;
  metadata?: Record<string, any>;
}

/**
 * Service para notificações de agendamento
 * Adaptado para Next.js App Router
 */
export class AppointmentNotificationService {
  /**
   * Envia notificação de confirmação de agendamento
   */
  static async sendAppointmentConfirmation(params: {
    appointmentId: string;
    patientId: string;
    patientName: string;
    therapistName?: string;
    startTime: string;
    endTime: string;
  }) {
    try {
      const supabase = await createServerComponentClient();

      // Buscar dados do paciente
      const { data: patient } = await supabase
        .from('patients')
        .select('user_id, email, phone')
        .eq('id', params.patientId)
        .single();

      if (!patient?.user_id) {
        return { data: false, error: new Error('Patient not found') };
      }

      const appointmentDate = new Date(params.startTime);
      const formattedDate = format(appointmentDate, "dd/MM/yyyy", { locale: ptBR });
      const formattedTime = format(appointmentDate, "HH:mm", { locale: ptBR });

      // Criar notificação
      await NotificationService.create({
        userId: patient.user_id,
        title: '✅ Consulta Confirmada!',
        message: `Sua consulta está agendada para ${formattedDate} às ${formattedTime}${params.therapistName ? ` com ${params.therapistName}` : ''}`,
        type: 'appointment_confirmation',
        url: `/dashboard/agenda?highlight=${params.appointmentId}`,
        data: {
          appointmentId: params.appointmentId,
          patientId: params.patientId,
          startTime: params.startTime,
        },
      });

      // Enviar WhatsApp se disponível
      if (patient.phone) {
        await WhatsAppService.sendAppointmentConfirmation({
          patientId: params.patientId,
          phoneNumber: patient.phone,
          patientName: params.patientName,
          appointmentDate: formattedDate,
          appointmentTime: formattedTime,
          appointmentId: params.appointmentId,
          therapistName: params.therapistName,
        });
      }

      // Enviar Email se disponível
      if (patient.email) {
        await EmailService.sendAppointmentReminder({
          patientId: params.patientId,
          email: patient.email,
          patientName: params.patientName,
          appointmentDate: formattedDate,
          appointmentTime: formattedTime,
          appointmentId: params.appointmentId,
          therapistName: params.therapistName,
        });
      }

      // Agendar lembretes
      await this.scheduleReminders({
        appointmentId: params.appointmentId,
        userId: patient.user_id,
        startTime: params.startTime,
      });

      return { data: true, error: null };
    } catch (error) {
      console.error('Error sending appointment confirmation:', error);
      return { data: false, error };
    }
  }

  /**
   * Agenda lembretes automáticos (24h e 2h antes)
   */
  static async scheduleReminders(params: {
    appointmentId: string;
    userId: string;
    startTime: string;
  }) {
    try {
      const appointmentTime = new Date(params.startTime);
      const now = new Date();

      // Lembrete 24h antes
      const reminder24h = new Date(appointmentTime.getTime() - 24 * 60 * 60 * 1000);
      if (reminder24h > now) {
        await this.createReminderSchedule({
          appointmentId: params.appointmentId,
          userId: params.userId,
          scheduledFor: reminder24h.toISOString(),
          type: 'reminder_24h',
          sent: false,
        });
      }

      // Lembrete 2h antes
      const reminder2h = new Date(appointmentTime.getTime() - 2 * 60 * 60 * 1000);
      if (reminder2h > now) {
        await this.createReminderSchedule({
          appointmentId: params.appointmentId,
          userId: params.userId,
          scheduledFor: reminder2h.toISOString(),
          type: 'reminder_2h',
          sent: false,
        });
      }

      return { data: true, error: null };
    } catch (error) {
      console.error('Error scheduling reminders:', error);
      return { data: false, error };
    }
  }

  /**
   * Envia lembrete 24h antes
   */
  static async send24HourReminder(schedule: NotificationSchedule) {
    try {
      const supabase = await createServerComponentClient();
      
      const { data: appointment } = await supabase
        .from('appointments')
        .select('*, patient:patients(*), therapist:therapists(*)')
        .eq('id', schedule.appointmentId)
        .single();

      if (!appointment) {
        return { data: false, error: new Error('Appointment not found') };
      }

      const appointmentDate = new Date(appointment.start_time);
      const formattedDate = format(appointmentDate, "EEEE, dd 'de' MMMM", { locale: ptBR });
      const formattedTime = format(appointmentDate, "HH:mm", { locale: ptBR });

      await NotificationService.create({
        userId: schedule.userId,
        title: '🗓️ Lembrete: Consulta Amanhã',
        message: `Sua consulta está marcada para ${formattedDate} às ${formattedTime}`,
        type: 'appointment_reminder_24h',
        url: `/dashboard/agenda?highlight=${schedule.appointmentId}`,
      });

      await this.markReminderAsSent(schedule.appointmentId, 'reminder_24h');
      return { data: true, error: null };
    } catch (error) {
      console.error('Error sending 24h reminder:', error);
      return { data: false, error };
    }
  }

  /**
   * Envia lembrete 2h antes
   */
  static async send2HourReminder(schedule: NotificationSchedule) {
    try {
      const supabase = await createServerComponentClient();
      
      const { data: appointment } = await supabase
        .from('appointments')
        .select('*, patient:patients(*)')
        .eq('id', schedule.appointmentId)
        .single();

      if (!appointment) {
        return { data: false, error: new Error('Appointment not found') };
      }

      const appointmentDate = new Date(appointment.start_time);
      const formattedTime = format(appointmentDate, "HH:mm", { locale: ptBR });

      await NotificationService.create({
        userId: schedule.userId,
        title: '⏰ Consulta em 2 Horas!',
        message: `Não esqueça da sua consulta às ${formattedTime}. Lembre-se de trazer seus documentos.`,
        type: 'appointment_reminder_2h',
        url: `/dashboard/agenda?highlight=${schedule.appointmentId}`,
      });

      await this.markReminderAsSent(schedule.appointmentId, 'reminder_2h');
      return { data: true, error: null };
    } catch (error) {
      console.error('Error sending 2h reminder:', error);
      return { data: false, error };
    }
  }

  /**
   * Notifica cancelamento de agendamento
   */
  static async sendCancellationNotification(params: {
    appointmentId: string;
    patientId: string;
    patientName: string;
    startTime: string;
    reason?: string;
  }) {
    try {
      const supabase = await createServerComponentClient();
      
      const { data: patient } = await supabase
        .from('patients')
        .select('user_id, email, phone')
        .eq('id', params.patientId)
        .single();

      if (!patient?.user_id) {
        return { data: false, error: new Error('Patient not found') };
      }

      const appointmentDate = new Date(params.startTime);
      const formattedDate = format(appointmentDate, "dd/MM/yyyy", { locale: ptBR });
      const formattedTime = format(appointmentDate, "HH:mm", { locale: ptBR });

      await NotificationService.create({
        userId: patient.user_id,
        title: '❌ Consulta Cancelada',
        message: `Sua consulta do dia ${formattedDate} às ${formattedTime} foi cancelada.${params.reason ? ` Motivo: ${params.reason}` : ''} Entre em contato para reagendar.`,
        type: 'appointment_cancellation',
        url: '/dashboard/agenda',
      });

      // Enviar WhatsApp
      if (patient.phone) {
        await WhatsAppService.sendAppointmentCancellation({
          patientId: params.patientId,
          phoneNumber: patient.phone,
          patientName: params.patientName,
          appointmentDate: formattedDate,
          appointmentTime: formattedTime,
          appointmentId: params.appointmentId,
          reason: params.reason,
        });
      }

      // Cancelar lembretes pendentes
      await this.cancelPendingReminders(params.appointmentId);

      return { data: true, error: null };
    } catch (error) {
      console.error('Error sending cancellation notification:', error);
      return { data: false, error };
    }
  }

  /**
   * Cria agendamento de lembrete no banco
   */
  private static async createReminderSchedule(schedule: NotificationSchedule) {
    try {
      const supabase = await createServerComponentClient();
      await supabase.from('notifications').insert({
        user_id: schedule.userId,
        scheduled_for: schedule.scheduledFor,
        type: schedule.type,
        data: schedule.metadata,
        message: '', // Add a default value for message
        title: '', // Add a default value for title
      });
    } catch (error) {
      console.error('Error creating reminder schedule:', error);
    }
  }

  /**
   * Marca lembrete como enviado
   */
  private static async markReminderAsSent(appointmentId: string, type: string) {
    try {
      const supabase = await createServerComponentClient();
      await supabase
        .from('notifications')
        .update({
          is_read: true,
          read_at: new Date().toISOString(),
        })
        .eq('data->>appointmentId', appointmentId)
        .eq('type', type);
    } catch (error) {
      console.error('Error marking reminder as sent:', error);
    }
  }

  /**
   * Cancela lembretes pendentes
   */
  private static async cancelPendingReminders(appointmentId: string) {
    try {
      const supabase = await createServerComponentClient();
      await supabase
        .from('notifications')
        .delete()
        .eq('data->>appointmentId', appointmentId)
        .eq('is_read', false);
    } catch (error) {
      console.error('Error canceling pending reminders:', error);
    }
  }

  /**
   * Busca lembretes pendentes que devem ser enviados
   */
  static async getPendingReminders() {
    try {
      const supabase = await createServerComponentClient();
      const now = new Date().toISOString();
      
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('is_read', false)
        .lte('scheduled_for', now)
        .order('scheduled_for', { ascending: true });

      if (error) throw error;

      return {
        data: (data || []).map((item: any) => ({
          appointmentId: item.data.appointmentId,
          userId: item.user_id,
          scheduledFor: item.scheduled_for,
          type: item.type,
          sent: item.is_read,
          metadata: item.data,
        })),
        error: null,
      };
    } catch (error) {
      console.error('Error fetching pending reminders:', error);
      return { data: null, error };
    }
  }
}

