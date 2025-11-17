export class WhatsAppService {
  private static readonly API_URL = 'https://graph.facebook.com/v18.0';
  private static readonly PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID || '';
  private static readonly ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN || '';

  static async sendMessage(params: {
    to: string;
    message: string;
    patientId?: string;
  }) {
    try {
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

      // TODO: Save to database
      return { data, error: null };
    } catch (error) {
      console.error('Error sending WhatsApp message:', error);
      return { data: null, error };
    }
  }

  static async sendAppointmentReminder(params: {
    patientId: string;
    phoneNumber: string;
    patientName: string;
    appointmentDate: string;
    appointmentTime: string;
  }) {
    const message = `Olá ${params.patientName}! 👋\n\n` +
      `Lembrete: Você tem uma consulta agendada para ${params.appointmentDate} às ${params.appointmentTime}.\n\n` +
      `Nos vemos em breve! 😊`;

    return this.sendMessage({
      to: params.phoneNumber,
      message,
      patientId: params.patientId,
    });
  }
}

