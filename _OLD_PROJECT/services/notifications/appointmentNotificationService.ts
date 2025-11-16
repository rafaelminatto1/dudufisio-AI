/**
 * Appointment Notification Service
 * MoocaFisio - Integra Push Notifications com Sistema de Agendamentos
 *
 * Funcionalidades:
 * - Envia notificação de confirmação ao criar agendamento
 * - Agenda lembretes 24h antes
 * - Agenda lembretes 2h antes
 * - Notifica cancelamentos
 * - Notifica alterações
 */

import { supabase } from '../../lib/supabaseClient';
import type { Appointment } from '../../types';
import { sendOmniNotification } from './omniNotificationService';

export interface NotificationSchedule {
  appointmentId: string;
  userId: string;
  scheduledFor: Date;
  type: 'confirmation' | 'reminder_24h' | 'reminder_2h' | 'cancellation' | 'update';
  sent: boolean;
  metadata?: Record<string, any>;
}

export class AppointmentNotificationService {
  /**
   * Envia notificação de confirmação de agendamento
   */
  async sendAppointmentConfirmation(appointment: Appointment): Promise<boolean> {
    try {
      console.log('[AppointmentNotification] Sending confirmation for appointment:', appointment.id);

      const { data: patient } = await supabase
        .from('patients')
        .select('user_id, name, phone')
        .eq('id', appointment.patientId)
        .single();

      if (!patient?.user_id) {
        console.warn('[AppointmentNotification] Patient has no user_id, skipping notification');
        return false;
      }

      const appointmentDate = new Date(appointment.startTime);
      const formattedDate = appointmentDate.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
      const formattedTime = appointmentDate.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit'
      });

      const omniResult = await sendOmniNotification({
        target: {
          userId: patient.user_id,
          patientId: appointment.patientId,
        },
        title: '✅ Consulta Confirmada!',
        body: `Sua consulta está agendada para ${formattedDate} às ${formattedTime}${appointment.therapistName ? ` com ${appointment.therapistName}` : ''}`,
        url: `/agenda?highlight=${appointment.id}`,
        icon: '/logo.png',
        data: {
          type: 'appointment_confirmation',
          appointmentId: appointment.id,
          patientId: appointment.patientId,
          therapistId: appointment.therapistId,
          startTime: appointment.startTime.toISOString(),
          createdAt: new Date().toISOString()
        },
        sms: {
          message: `MoocaFisio: sua consulta está confirmada para ${formattedDate} às ${formattedTime}${appointment.therapistName ? ` com ${appointment.therapistName}` : ''}.`,
        },
        whatsapp: {
          message: `Olá${appointment.patientName ? ` ${appointment.patientName}` : ''}! Sua consulta está confirmada para ${formattedDate} às ${formattedTime}${appointment.therapistName ? ` com ${appointment.therapistName}` : ''}. Qualquer mudança, é só responder por aqui.`,
        },
        channels: {
          push: true,
          sms: true,
          whatsapp: true,
        },
      });

      const pushSuccess = omniResult.push?.success ?? false;
      const fallbackSuccess =
        (omniResult.sms?.success ?? false) || (omniResult.whatsapp?.success ?? false);

      if (!pushSuccess && !fallbackSuccess) {
        console.error('[AppointmentNotification] Falha ao enviar confirmação em todos os canais', omniResult);
        return false;
      }

      console.log('[AppointmentNotification] Confirmation sent successfully');
      return true;
    } catch (error) {
      console.error('[AppointmentNotification] Error in sendAppointmentConfirmation:', error);
      return false;
    }
  }

  /**
   * Agenda lembretes automáticos (24h e 2h antes)
   */
  async scheduleReminders(appointment: Appointment): Promise<boolean> {
    try {
      console.log('[AppointmentNotification] Scheduling reminders for appointment:', appointment.id);

      const { data: patient } = await supabase
        .from('patients')
        .select('user_id')
        .eq('id', appointment.patientId)
        .single();

      if (!patient?.user_id) {
        console.warn('[AppointmentNotification] Patient has no user_id, skipping reminders');
        return false;
      }

      const appointmentTime = new Date(appointment.startTime);
      const now = new Date();

      // Lembrete 24h antes
      const reminder24h = new Date(appointmentTime.getTime() - 24 * 60 * 60 * 1000);
      if (reminder24h > now) {
        await this.createReminderSchedule({
          appointmentId: appointment.id,
          userId: patient.user_id,
          scheduledFor: reminder24h,
          type: 'reminder_24h',
          sent: false,
          metadata: {
            patientName: appointment.patientName,
            therapistName: appointment.therapistName,
            startTime: appointment.startTime.toISOString()
          }
        });
      }

      // Lembrete 2h antes
      const reminder2h = new Date(appointmentTime.getTime() - 2 * 60 * 60 * 1000);
      if (reminder2h > now) {
        await this.createReminderSchedule({
          appointmentId: appointment.id,
          userId: patient.user_id,
          scheduledFor: reminder2h,
          type: 'reminder_2h',
          sent: false,
          metadata: {
            patientName: appointment.patientName,
            therapistName: appointment.therapistName,
            startTime: appointment.startTime.toISOString()
          }
        });
      }

      console.log('[AppointmentNotification] Reminders scheduled successfully');
      return true;
    } catch (error) {
      console.error('[AppointmentNotification] Error in scheduleReminders:', error);
      return false;
    }
  }

  /**
   * Envia lembrete 24h antes
   */
  async send24HourReminder(schedule: NotificationSchedule): Promise<boolean> {
    try {
      const { data: appointment } = await supabase
        .from('appointments')
        .select(`
          *,
          patient:patients(name, user_id),
          therapist:therapists(name)
        `)
        .eq('id', schedule.appointmentId)
        .single();

      if (!appointment) {
        console.warn('[AppointmentNotification] Appointment not found:', schedule.appointmentId);
        return false;
      }

      const appointmentDate = new Date(appointment.start_time);
      const formattedDate = appointmentDate.toLocaleDateString('pt-BR', {
        weekday: 'long',
        day: '2-digit',
        month: 'long'
      });
      const formattedTime = appointmentDate.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit'
      });

      const { error } = await supabase.functions.invoke('send-push-notification', {
        body: {
          userId: schedule.userId,
          title: '🗓️ Lembrete: Consulta Amanhã',
          body: `Sua consulta está marcada para ${formattedDate} às ${formattedTime}${appointment.therapist?.name ? ` com ${appointment.therapist.name}` : ''}`,
          url: `/agenda?highlight=${schedule.appointmentId}`,
          icon: '/logo.png',
          data: {
            type: 'appointment_reminder_24h',
            appointmentId: schedule.appointmentId,
            startTime: appointment.start_time
          }
        }
      });

      if (error) {
        console.error('[AppointmentNotification] Error sending 24h reminder:', error);
        return false;
      }

      await this.markReminderAsSent(schedule.appointmentId, 'reminder_24h');
      return true;
    } catch (error) {
      console.error('[AppointmentNotification] Error in send24HourReminder:', error);
      return false;
    }
  }

  /**
   * Envia lembrete 2h antes
   */
  async send2HourReminder(schedule: NotificationSchedule): Promise<boolean> {
    try {
      const { data: appointment } = await supabase
        .from('appointments')
        .select(`
          *,
          patient:patients(name, user_id),
          therapist:therapists(name)
        `)
        .eq('id', schedule.appointmentId)
        .single();

      if (!appointment) {
        console.warn('[AppointmentNotification] Appointment not found:', schedule.appointmentId);
        return false;
      }

      const appointmentDate = new Date(appointment.start_time);
      const formattedTime = appointmentDate.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit'
      });

      const { error } = await supabase.functions.invoke('send-push-notification', {
        body: {
          userId: schedule.userId,
          title: '⏰ Consulta em 2 Horas!',
          body: `Não esqueça da sua consulta às ${formattedTime}. Lembre-se de trazer seus documentos.`,
          url: `/agenda?highlight=${schedule.appointmentId}`,
          icon: '/logo.png',
          data: {
            type: 'appointment_reminder_2h',
            appointmentId: schedule.appointmentId,
            startTime: appointment.start_time,
            urgent: true
          }
        }
      });

      if (error) {
        console.error('[AppointmentNotification] Error sending 2h reminder:', error);
        return false;
      }

      await this.markReminderAsSent(schedule.appointmentId, 'reminder_2h');
      return true;
    } catch (error) {
      console.error('[AppointmentNotification] Error in send2HourReminder:', error);
      return false;
    }
  }

  /**
   * Notifica cancelamento de agendamento
   */
  async sendCancellationNotification(appointment: Appointment): Promise<boolean> {
    try {
      const { data: patient } = await supabase
        .from('patients')
        .select('user_id, name')
        .eq('id', appointment.patientId)
        .single();

      if (!patient?.user_id) {
        return false;
      }

      const appointmentDate = new Date(appointment.startTime);
      const formattedDate = appointmentDate.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
      const formattedTime = appointmentDate.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit'
      });

      const { error } = await supabase.functions.invoke('send-push-notification', {
        body: {
          userId: patient.user_id,
          title: '❌ Consulta Cancelada',
          body: `Sua consulta do dia ${formattedDate} às ${formattedTime} foi cancelada. Entre em contato para reagendar.`,
          url: '/agenda',
          icon: '/logo.png',
          data: {
            type: 'appointment_cancellation',
            appointmentId: appointment.id,
            originalStartTime: appointment.startTime.toISOString()
          }
        }
      });

      if (error) {
        console.error('[AppointmentNotification] Error sending cancellation:', error);
        return false;
      }

      // Remove lembretes pendentes
      await this.cancelPendingReminders(appointment.id);
      return true;
    } catch (error) {
      console.error('[AppointmentNotification] Error in sendCancellationNotification:', error);
      return false;
    }
  }

  /**
   * Notifica alteração de agendamento
   */
  async sendUpdateNotification(
    originalAppointment: Appointment,
    updatedAppointment: Appointment
  ): Promise<boolean> {
    try {
      const { data: patient } = await supabase
        .from('patients')
        .select('user_id, name')
        .eq('id', updatedAppointment.patientId)
        .single();

      if (!patient?.user_id) {
        return false;
      }

      const newDate = new Date(updatedAppointment.startTime);
      const formattedDate = newDate.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
      const formattedTime = newDate.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit'
      });

      const { error } = await supabase.functions.invoke('send-push-notification', {
        body: {
          userId: patient.user_id,
          title: '🔄 Consulta Reagendada',
          body: `Sua consulta foi reagendada para ${formattedDate} às ${formattedTime}${updatedAppointment.therapistName ? ` com ${updatedAppointment.therapistName}` : ''}`,
          url: `/agenda?highlight=${updatedAppointment.id}`,
          icon: '/logo.png',
          data: {
            type: 'appointment_update',
            appointmentId: updatedAppointment.id,
            oldStartTime: originalAppointment.startTime.toISOString(),
            newStartTime: updatedAppointment.startTime.toISOString()
          }
        }
      });

      if (error) {
        console.error('[AppointmentNotification] Error sending update:', error);
        return false;
      }

      // Cancela lembretes antigos e agenda novos
      await this.cancelPendingReminders(updatedAppointment.id);
      await this.scheduleReminders(updatedAppointment);
      return true;
    } catch (error) {
      console.error('[AppointmentNotification] Error in sendUpdateNotification:', error);
      return false;
    }
  }

  // ========== MÉTODOS AUXILIARES ==========

  /**
   * Cria agendamento de lembrete no banco
   */
  private async createReminderSchedule(schedule: NotificationSchedule): Promise<void> {
    const { error } = await supabase
      .from('notification_schedules')
      .insert({
        appointment_id: schedule.appointmentId,
        user_id: schedule.userId,
        scheduled_for: schedule.scheduledFor.toISOString(),
        notification_type: schedule.type,
        sent: schedule.sent,
        metadata: schedule.metadata
      });

    if (error) {
      console.error('[AppointmentNotification] Error creating reminder schedule:', error);
      throw error;
    }
  }

  /**
   * Marca lembrete como enviado
   */
  private async markReminderAsSent(appointmentId: string, type: string): Promise<void> {
    const { error } = await supabase
      .from('notification_schedules')
      .update({
        sent: true,
        sent_at: new Date().toISOString()
      })
      .eq('appointment_id', appointmentId)
      .eq('notification_type', type);

    if (error) {
      console.error('[AppointmentNotification] Error marking reminder as sent:', error);
    }
  }

  /**
   * Cancela lembretes pendentes de um agendamento
   */
  private async cancelPendingReminders(appointmentId: string): Promise<void> {
    const { error } = await supabase
      .from('notification_schedules')
      .delete()
      .eq('appointment_id', appointmentId)
      .eq('sent', false);

    if (error) {
      console.error('[AppointmentNotification] Error canceling pending reminders:', error);
    }
  }

  /**
   * Busca lembretes pendentes que devem ser enviados agora
   */
  async getPendingReminders(): Promise<NotificationSchedule[]> {
    try {
      const now = new Date();
      const { data, error } = await supabase
        .from('notification_schedules')
        .select('*')
        .eq('sent', false)
        .lte('scheduled_for', now.toISOString())
        .order('scheduled_for', { ascending: true });

      if (error) {
        console.error('[AppointmentNotification] Error fetching pending reminders:', error);
        return [];
      }

      return (data || []).map((item: any) => ({
        appointmentId: item.appointment_id,
        userId: item.user_id,
        scheduledFor: new Date(item.scheduled_for),
        type: item.notification_type,
        sent: item.sent,
        metadata: item.metadata
      }));
    } catch (error) {
      console.error('[AppointmentNotification] Error in getPendingReminders:', error);
      return [];
    }
  }
}

// Export singleton instance
export const appointmentNotificationService = new AppointmentNotificationService();
