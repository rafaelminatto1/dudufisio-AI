/**
 * WhatsApp Notification Service
 * Serviço de notificações automáticas via WhatsApp
 * DuduFisio-AI
 */

import { supabase } from '@/lib/supabaseClient';
import { getMetaWhatsAppService } from './MetaWhatsAppService';
import format from 'date-fns/format';
import addDays from 'date-fns/addDays';
import subDays from 'date-fns/subDays';
import parse from 'date-fns/parse';
import { ptBR } from 'date-fns/locale';
import type { AppointmentWithPatient, PaymentWithPatient, WhatsAppMessageInsert } from '@/types';

export class WhatsAppNotificationService {
  private whatsappService;

  constructor() {
    this.whatsappService = getMetaWhatsAppService();
  }

  /**
   * Enviar lembretes de consulta para amanhã
   */
  async sendDailyReminders(clinicId: string): Promise<void> {
    try {
      const tomorrow = addDays(new Date(), 1);
      const tomorrowStr = format(tomorrow, 'yyyy-MM-dd');

      

      const { data: appointmentsData } = await supabase
        .from('appointments')
        .select(`
          id,
          date,
          time,
          patient:patients(name, phone),
          therapist:users(name)
        `)
        .eq('clinic_id', clinicId)
        .eq('date', tomorrowStr)
        .in('status', ['confirmed', 'scheduled'])
        .order('time') as { data: AppointmentWithPatient[] | null };

      const appointments = appointmentsData ?? [];

      if (appointments.length === 0) {
        
        return;
      }

      let sent = 0;
      let failed = 0;

      for (const appointment of appointments) {
        if (!appointment.patient?.phone) {
          console.warn(`⚠️  Paciente sem telefone: ${appointment.id}`);
          continue;
        }

        try {
          await this.whatsappService.sendAppointmentReminder(
            appointment.patient.phone,
            {
              patientName: appointment.patient.name,
              date: format(tomorrow, "dd/MM/yyyy (EEEE)", { locale: ptBR }),
              time: appointment.time,
              clinicAddress: 'Rua Exemplo, 123 - Centro, São Paulo - SP',
            },
            clinicId
          );

          // Registrar envio
          await this.logNotification(
            clinicId,
            appointment.patient.phone,
            'appointment_reminder',
            'sent'
          );

          sent++;
          
        } catch (error) {
          failed++;
          console.error(`❌ Erro ao enviar para ${appointment.patient.name}:`, error);
        }
      }

      
    } catch (error) {
      console.error('❌ Erro ao enviar lembretes diários:', error);
      throw error;
    }
  }

  /**
   * Enviar confirmações de presença (2 dias antes)
   */
  async sendConfirmationRequests(clinicId: string): Promise<void> {
    try {
      const targetDate = addDays(new Date(), 2);
      const targetDateStr = format(targetDate, 'yyyy-MM-dd');

      

      const { data: appointmentsData } = await supabase
        .from('appointments')
        .select(`
          id,
          date,
          time,
          patient:patients(name, phone)
        `)
        .eq('clinic_id', clinicId)
        .eq('date', targetDateStr)
        .eq('status', 'scheduled')
        .order('time') as { data: AppointmentWithPatient[] | null };

      const appointments = appointmentsData ?? [];

      if (appointments.length === 0) {
        
        return;
      }

      let sent = 0;
      let failed = 0;

      for (const appointment of appointments) {
        if (!appointment.patient?.phone) continue;

        try {
          await this.whatsappService.sendConfirmationRequest(
            appointment.patient.phone,
            {
              patientName: appointment.patient.name,
              date: format(targetDate, "dd/MM/yyyy (EEEE)", { locale: ptBR }),
              time: appointment.time,
            },
            clinicId
          );

          // Registrar envio
          await this.logNotification(
            clinicId,
            appointment.patient.phone,
            'confirmation_request',
            'sent'
          );

          sent++;
          
        } catch (error) {
          failed++;
          console.error(`❌ Erro ao enviar para ${appointment.patient.name}:`, error);
        }
      }

      
    } catch (error) {
      console.error('❌ Erro ao enviar confirmações:', error);
      throw error;
    }
  }

  /**
   * Enviar lembretes de retorno (pacientes sem consulta há 30+ dias)
   */
  async sendReturnReminders(clinicId: string): Promise<void> {
    try {
      const thirtyDaysAgo = subDays(new Date(), 30);
      const thirtyDaysAgoStr = format(thirtyDaysAgo, 'yyyy-MM-dd');

      

      const { data: inactivePatientsData } = await supabase
        .from('patients')
        .select(`
          id,
          name,
          phone,
          last_appointment:appointments(date)
        `)
        .eq('clinic_id', clinicId)
        .eq('status', 'active')
        .lt('last_appointment.date', thirtyDaysAgoStr)
        .limit(50) as { data: Array<{
          id: string;
          name: string;
          phone: string;
          last_appointment: { date: string } | null;
        }> | null };

      const inactivePatients = inactivePatientsData ?? [];

      if (inactivePatients.length === 0) {
        
        return;
      }

      let sent = 0;
      let failed = 0;

      for (const patient of inactivePatients) {
        if (!patient.phone) continue;

        try {
          await this.whatsappService.sendTextMessage(
            patient.phone,
            `👋 *Olá ${patient.name}!*\n\n` +
            `Sentimos sua falta! 💙\n\n` +
            `Já faz algum tempo desde sua última consulta.\n` +
            `Como você está se sentindo?\n\n` +
            `Se precisar de atendimento, estamos aqui para ajudar!\n` +
            `Digite *AGENDAR* para marcar uma nova consulta.\n\n` +
            `📞 (11) 5874-9885`,
            clinicId
          );

          await this.logNotification(
            clinicId,
            patient.phone,
            'return_reminder',
            'sent'
          );

          sent++;
          
        } catch (error) {
          failed++;
          console.error(`❌ Erro ao enviar para ${patient.name}:`, error);
        }
      }

      
    } catch (error) {
      console.error('❌ Erro ao enviar lembretes de retorno:', error);
      throw error;
    }
  }

  /**
   * Enviar notificação de pagamento pendente
   */
  async sendPaymentReminders(clinicId: string): Promise<void> {
    try {
      

      const { data: pendingPaymentsData } = await supabase
        .from('financial_transactions')
        .select(`
          id,
          amount,
          due_date,
          patient:patients(name, phone)
        `)
        .eq('clinic_id', clinicId)
        .eq('status', 'pending')
        .lte('due_date', format(new Date(), 'yyyy-MM-dd'))
        .limit(50) as { data: PaymentWithPatient[] | null };

      const pendingPayments = pendingPaymentsData ?? [];

      if (pendingPayments.length === 0) {
        
        return;
      }

      let sent = 0;
      let failed = 0;

      for (const payment of pendingPayments) {
        if (!payment.patient?.phone) continue;

        try {
          await this.whatsappService.sendTextMessage(
            payment.patient.phone,
            `💰 *Lembrete de Pagamento*\n\n` +
            `Olá ${payment.patient.name},\n\n` +
            `Verificamos que há um pagamento pendente:\n` +
            `Valor: R$ ${payment.amount.toFixed(2)}\n` +
            `Vencimento: ${format(parse(payment.due_date, 'yyyy-MM-dd', new Date()), 'dd/MM/yyyy')}\n\n` +
            `Para regularizar, entre em contato:\n` +
            `📞 (11) 5874-9885\n\n` +
            `Obrigado!`,
            clinicId
          );

          await this.logNotification(
            clinicId,
            payment.patient.phone,
            'payment_reminder',
            'sent'
          );

          sent++;
        } catch (error) {
          failed++;
          console.error(`❌ Erro ao enviar lembrete de pagamento:`, error);
        }
      }

      
    } catch (error) {
      console.error('❌ Erro ao enviar lembretes de pagamento:', error);
      throw error;
    }
  }

  /**
   * Registrar notificação enviada
   */
  private async logNotification(
    clinicId: string,
    phone: string,
    type: string,
    status: string
  ): Promise<void> {
    try {
      const messageData: WhatsAppMessageInsert = {
        clinic_id: clinicId,
        phone: phone,
        direction: 'outbound',
        message_type: 'notification',
        content: `Notificação automática: ${type}`,
        status: status,
        sent_at: new Date().toISOString(),
        metadata: { notification_type: type },
      };
      
      await (supabase as any)
        .from('whatsapp_messages')
        .insert(messageData as any);
    } catch (error) {
      console.error('Erro ao registrar notificação:', error);
    }
  }

  /**
   * Executar todas as notificações diárias
   */
  async runDailyNotifications(clinicId: string): Promise<void> {
    

    try {
      // 1. Lembretes de consulta (1 dia antes)
      await this.sendDailyReminders(clinicId);

      // 2. Confirmações de presença (2 dias antes)
      await this.sendConfirmationRequests(clinicId);

      // 3. Lembretes de retorno (pacientes inativos)
      await this.sendReturnReminders(clinicId);

      // 4. Lembretes de pagamento
      await this.sendPaymentReminders(clinicId);

      
    } catch (error) {
      console.error('❌ Erro ao executar notificações diárias:', error);
      throw error;
    }
  }
}

// Singleton instance
let notificationServiceInstance: WhatsAppNotificationService | null = null;

export const getWhatsAppNotificationService = (): WhatsAppNotificationService => {
  if (!notificationServiceInstance) {
    notificationServiceInstance = new WhatsAppNotificationService();
  }
  return notificationServiceInstance;
};

