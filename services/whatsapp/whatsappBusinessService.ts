/**
 * WhatsApp Business API Service
 * Meta/Facebook Cloud API Integration
 *
 * @see https://developers.facebook.com/docs/whatsapp/cloud-api
 */

interface WhatsAppConfig {
  apiUrl: string;
  phoneNumberId: string;
  accessToken: string;
  businessAccountId: string;
}

interface SendMessageParams {
  to: string;
  type: 'text' | 'template' | 'image' | 'document' | 'video';
  content: any;
}

interface AppointmentReminderData {
  patientName: string;
  appointmentDate: string;
  appointmentTime: string;
  therapistName: string;
  clinicName?: string;
  clinicAddress?: string;
}

class WhatsAppBusinessService {
  private config: WhatsAppConfig;

  constructor() {
    this.config = {
      apiUrl: import.meta.env.WHATSAPP_API_URL || 'https://graph.facebook.com/v21.0',
      phoneNumberId: import.meta.env.WHATSAPP_PHONE_NUMBER_ID || '',
      accessToken: import.meta.env.WHATSAPP_ACCESS_TOKEN || '',
      businessAccountId: import.meta.env.WHATSAPP_BUSINESS_ACCOUNT_ID || ''
    };
  }

  /**
   * Verifica se o serviço está configurado
   */
  isConfigured(): boolean {
    return !!(
      this.config.phoneNumberId &&
      this.config.accessToken &&
      import.meta.env.VITE_WHATSAPP_ENABLED === 'true'
    );
  }

  /**
   * Envia uma mensagem de texto simples
   */
  async sendTextMessage(to: string, text: string): Promise<any> {
    if (!this.isConfigured()) {
      console.warn('⚠️ WhatsApp not configured. Skipping message send.');
      return null;
    }

    const url = `${this.config.apiUrl}/${this.config.phoneNumberId}/messages`;

    const payload = {
      messaging_product: 'whatsapp',
      to: this.normalizePhoneNumber(to),
      type: 'text',
      text: {
        body: text
      }
    };

    return this.makeRequest(url, payload);
  }

  /**
   * Envia um template aprovado pelo Meta
   */
  async sendTemplate(
    to: string,
    templateName: string,
    languageCode: string = 'pt_BR',
    components?: any[]
  ): Promise<any> {
    if (!this.isConfigured()) {
      console.warn('⚠️ WhatsApp not configured. Skipping template send.');
      return null;
    }

    const url = `${this.config.apiUrl}/${this.config.phoneNumberId}/messages`;

    const payload = {
      messaging_product: 'whatsapp',
      to: this.normalizePhoneNumber(to),
      type: 'template',
      template: {
        name: templateName,
        language: {
          code: languageCode
        },
        ...(components && { components })
      }
    };

    return this.makeRequest(url, payload);
  }

  /**
   * Envia lembrete de consulta
   */
  async sendAppointmentReminder(
    to: string,
    data: AppointmentReminderData
  ): Promise<any> {
    const text = `
🏥 *Lembrete de Consulta - ${data.clinicName || 'DuduFisio'}*

Olá ${data.patientName}! 👋

Você tem uma consulta agendada:

📅 *Data:* ${data.appointmentDate}
🕐 *Horário:* ${data.appointmentTime}
👨‍⚕️ *Profissional:* ${data.therapistName}
${data.clinicAddress ? `📍 *Local:* ${data.clinicAddress}` : ''}

Por favor, chegue com 10 minutos de antecedência.

Em caso de imprevistos, entre em contato conosco.

Até breve! 😊
    `.trim();

    return this.sendTextMessage(to, text);
  }

  /**
   * Envia confirmação de agendamento
   */
  async sendAppointmentConfirmation(
    to: string,
    data: Omit<AppointmentReminderData, 'clinicName' | 'clinicAddress'>
  ): Promise<any> {
    const text = `
✅ *Agendamento Confirmado*

Olá ${data.patientName}!

Sua consulta foi agendada com sucesso:

📅 *Data:* ${data.appointmentDate}
🕐 *Horário:* ${data.appointmentTime}
👨‍⚕️ *Profissional:* ${data.therapistName}

Você receberá um lembrete 24h antes da consulta.

Obrigado! 😊
    `.trim();

    return this.sendTextMessage(to, text);
  }

  /**
   * Envia mensagem de boas-vindas
   */
  async sendWelcomeMessage(to: string, patientName: string): Promise<any> {
    const text = `
👋 Olá ${patientName}, bem-vindo(a) ao DuduFisio!

Estamos felizes em tê-lo(a) conosco.

Você pode usar este WhatsApp para:
• Agendar consultas
• Tirar dúvidas
• Receber lembretes
• Acompanhar seu tratamento

Como podemos ajudá-lo(a) hoje? 😊
    `.trim();

    return this.sendTextMessage(to, text);
  }

  /**
   * Envia notificação de cancelamento
   */
  async sendAppointmentCancellation(
    to: string,
    patientName: string,
    appointmentDate: string,
    appointmentTime: string,
    reason?: string
  ): Promise<any> {
    const text = `
❌ *Consulta Cancelada*

Olá ${data.patientName},

Informamos que sua consulta foi cancelada:

📅 *Data:* ${appointmentDate}
🕐 *Horário:* ${appointmentTime}
${reason ? `\n📝 *Motivo:* ${reason}` : ''}

Para reagendar, entre em contato conosco.

Desculpe o transtorno.
    `.trim();

    return this.sendTextMessage(to, text);
  }

  /**
   * Marca mensagem como lida
   */
  async markAsRead(messageId: string): Promise<any> {
    if (!this.isConfigured()) {
      return null;
    }

    const url = `${this.config.apiUrl}/${this.config.phoneNumberId}/messages`;

    const payload = {
      messaging_product: 'whatsapp',
      status: 'read',
      message_id: messageId
    };

    return this.makeRequest(url, payload);
  }

  /**
   * Normaliza número de telefone para formato WhatsApp
   * Remove caracteres especiais e garante código do país
   */
  private normalizePhoneNumber(phone: string): string {
    // Remove tudo que não é número
    let normalized = phone.replace(/\D/g, '');

    // Se não começa com 55 (Brasil), adiciona
    if (!normalized.startsWith('55')) {
      normalized = '55' + normalized;
    }

    return normalized;
  }

  /**
   * Faz requisição HTTP para API do WhatsApp
   */
  private async makeRequest(url: string, payload: any): Promise<any> {
    try {
      console.log('📤 Sending WhatsApp request:', { url, payload: { ...payload, to: '***' } });

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('❌ WhatsApp API error:', data);
        throw new Error(data.error?.message || 'WhatsApp API request failed');
      }

      console.log('✅ WhatsApp message sent:', data);
      return data;

    } catch (error) {
      console.error('❌ WhatsApp service error:', error);
      throw error;
    }
  }
}

// Singleton instance
export const whatsappBusinessService = new WhatsAppBusinessService();
export default whatsappBusinessService;
