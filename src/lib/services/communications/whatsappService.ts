import { createServerComponentClient } from '~/lib/supabase/server';

export class WhatsAppService {
  private static readonly API_URL = 'https://graph.facebook.com/v18.0';
  private static readonly PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID || '';
  private static readonly ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN || '';

  /**
   * Send a text message
   */
  static async sendMessage(params: {
    to: string;
    message: string;
    patientId?: string;
    appointmentId?: string;
  }) {
    try {
      if (!this.PHONE_NUMBER_ID || !this.ACCESS_TOKEN) {
        throw new Error('WhatsApp credentials not configured');
      }

      const response = await fetch(
        `${this.API_URL}/${this.PHONE_NUMBER_ID}/messages`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.ACCESS_TOKEN}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            to: params.to,
            type: 'text',
            text: { body: params.message },
          }),
        }
      );

      const data = await response.json();
      if (!response.ok) throw new Error(data.error?.message || 'Failed to send message');

      // Save to database
      await this.logMessage({
        direction: 'outbound',
        to: params.to,
        body: params.message,
        whatsappMessageId: data.messages?.[0]?.id,
        patientId: params.patientId,
        appointmentId: params.appointmentId,
        status: 'sent',
      });

      return { data, error: null };
    } catch (error) {
      console.error('Error sending WhatsApp message:', error);
      return { data: null, error };
    }
  }

  /**
   * Send a template message
   */
  static async sendTemplateMessage(params: {
    to: string;
    templateName: string;
    languageCode?: string;
    components?: any[];
    patientId?: string;
    appointmentId?: string;
  }) {
    try {
      if (!this.PHONE_NUMBER_ID || !this.ACCESS_TOKEN) {
        throw new Error('WhatsApp credentials not configured');
      }

      const response = await fetch(
        `${this.API_URL}/${this.PHONE_NUMBER_ID}/messages`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.ACCESS_TOKEN}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            to: params.to,
            type: 'template',
            template: {
              name: params.templateName,
              language: {
                code: params.languageCode || 'pt_BR',
              },
              components: params.components || [],
            },
          }),
        }
      );

      const data = await response.json();
      if (!response.ok) throw new Error(data.error?.message || 'Failed to send template');

      // Save to database
      await this.logMessage({
        direction: 'outbound',
        to: params.to,
        body: `Template: ${params.templateName}`,
        whatsappMessageId: data.messages?.[0]?.id,
        patientId: params.patientId,
        appointmentId: params.appointmentId,
        status: 'sent',
        template: params.templateName,
      });

      return { data, error: null };
    } catch (error) {
      console.error('Error sending WhatsApp template:', error);
      return { data: null, error };
    }
  }

  /**
   * Send appointment reminder
   */
  static async sendAppointmentReminder(params: {
    patientId: string;
    phoneNumber: string;
    patientName: string;
    appointmentDate: string;
    appointmentTime: string;
    appointmentId: string;
  }) {
    const message = `Olá ${params.patientName}! 👋\n\n` +
      `Lembrete: Você tem uma consulta agendada para ${params.appointmentDate} às ${params.appointmentTime}.\n\n` +
      `Nos vemos em breve! 😊`;

    return this.sendMessage({
      to: params.phoneNumber,
      message,
      patientId: params.patientId,
      appointmentId: params.appointmentId,
    });
  }

  /**
   * Send appointment confirmation
   */
  static async sendAppointmentConfirmation(params: {
    patientId: string;
    phoneNumber: string;
    patientName: string;
    appointmentDate: string;
    appointmentTime: string;
    appointmentId: string;
    therapistName?: string;
  }) {
    const message = `✅ *Consulta Confirmada*\n\n` +
      `Olá ${params.patientName}!\n\n` +
      `Sua consulta foi confirmada:\n` +
      `📅 Data: ${params.appointmentDate}\n` +
      `🕐 Horário: ${params.appointmentTime}\n` +
      (params.therapistName ? `👨‍⚕️ Profissional: ${params.therapistName}\n` : '') +
      `\nNos vemos em breve! 😊`;

    return this.sendMessage({
      to: params.phoneNumber,
      message,
      patientId: params.patientId,
      appointmentId: params.appointmentId,
    });
  }

  /**
   * Send appointment cancellation
   */
  static async sendAppointmentCancellation(params: {
    patientId: string;
    phoneNumber: string;
    patientName: string;
    appointmentDate: string;
    appointmentTime: string;
    appointmentId: string;
    reason?: string;
  }) {
    const message = `❌ *Consulta Cancelada*\n\n` +
      `Olá ${params.patientName}!\n\n` +
      `Sua consulta de ${params.appointmentDate} às ${params.appointmentTime} foi cancelada.\n` +
      (params.reason ? `Motivo: ${params.reason}\n` : '') +
      `\nPara reagendar, entre em contato conosco.`;

    return this.sendMessage({
      to: params.phoneNumber,
      message,
      patientId: params.patientId,
      appointmentId: params.appointmentId,
    });
  }

  /**
   * Log message to database
   */
  private static async logMessage(params: {
    direction: 'outbound' | 'inbound';
    to: string;
    body: string;
    whatsappMessageId?: string;
    patientId?: string;
    appointmentId?: string;
    status?: string;
    template?: string;
  }) {
    try {
      const supabase = await createServerComponentClient();
      await supabase.from('whatsapp_messages_log').insert({
        phone_number: params.to,
        message_content: params.body,
        whatsapp_message_id: params.whatsappMessageId,
        patient_id: params.patientId,
        status: params.status || 'sent',
        template_id: params.template,
        message_type: params.direction,
      });
    } catch (error) {
      console.error('Error logging WhatsApp message:', error);
      // Don't throw - logging is not critical
    }
  }
}

