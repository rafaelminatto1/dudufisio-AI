import { createServerComponentClient } from '~/lib/supabase/server';

export class EmailService {
  private static readonly API_URL = process.env.EMAIL_PROVIDER === 'sendgrid'
    ? 'https://api.sendgrid.com/v3/mail/send'
    : 'https://api.resend.com/emails';
  private static readonly API_KEY = process.env.EMAIL_API_KEY || '';
  private static readonly FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@fisioflow.com';
  private static readonly FROM_NAME = process.env.FROM_NAME || 'FisioFlow';

  /**
   * Send email
   */
  static async sendEmail(params: {
    to: string | string[];
    subject: string;
    htmlBody?: string;
    textBody?: string;
    patientId?: string;
    appointmentId?: string;
    attachments?: Array<{
      filename: string;
      content: string;
      type?: string;
    }>;
  }) {
    try {
      if (!this.API_KEY) {
        throw new Error('Email API key not configured');
      }

      const recipients = Array.isArray(params.to) ? params.to : [params.to];
      const body = this.EMAIL_PROVIDER === 'sendgrid'
        ? this.buildSendGridBody(params, recipients)
        : this.buildResendBody(params, recipients);

      const response = await fetch(this.API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to send email');

      // Save to database
      await this.logEmail({
        to: recipients.join(', '),
        subject: params.subject,
        body: params.htmlBody || params.textBody || '',
        patientId: params.patientId,
        appointmentId: params.appointmentId,
        status: 'sent',
        messageId: data.id || data.message_id,
      });

      return { data, error: null };
    } catch (error) {
      console.error('Error sending email:', error);
      return { data: null, error };
    }
  }

  /**
   * Send welcome email
   */
  static async sendWelcomeEmail(params: {
    patientId: string;
    email: string;
    name: string;
  }) {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #4F46E5; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9fafb; }
            .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Bem-vindo ao FisioFlow!</h1>
            </div>
            <div class="content">
              <p>Olá ${params.name},</p>
              <p>Estamos muito felizes em tê-lo conosco! 🎉</p>
              <p>O FisioFlow é um sistema completo de gestão para clínicas de fisioterapia, e estamos aqui para ajudar você a ter o melhor atendimento possível.</p>
              <p>Se tiver alguma dúvida, não hesite em nos contatar.</p>
              <p>Bem-vindo e boa recuperação!</p>
            </div>
            <div class="footer">
              <p>FisioFlow - Sistema de Gestão para Fisioterapia</p>
            </div>
          </div>
        </body>
      </html>
    `;

    return this.sendEmail({
      to: params.email,
      subject: 'Bem-vindo ao FisioFlow',
      htmlBody: html,
      patientId: params.patientId,
    });
  }

  /**
   * Send appointment reminder email
   */
  static async sendAppointmentReminder(params: {
    patientId: string;
    email: string;
    patientName: string;
    appointmentDate: string;
    appointmentTime: string;
    appointmentId: string;
    therapistName?: string;
  }) {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #10B981; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9fafb; }
            .appointment-info { background: white; padding: 15px; border-radius: 8px; margin: 15px 0; }
            .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📅 Lembrete de Consulta</h1>
            </div>
            <div class="content">
              <p>Olá ${params.patientName},</p>
              <p>Este é um lembrete de que você tem uma consulta agendada:</p>
              <div class="appointment-info">
                <p><strong>Data:</strong> ${params.appointmentDate}</p>
                <p><strong>Horário:</strong> ${params.appointmentTime}</p>
                ${params.therapistName ? `<p><strong>Profissional:</strong> ${params.therapistName}</p>` : ''}
              </div>
              <p>Nos vemos em breve! 😊</p>
            </div>
            <div class="footer">
              <p>FisioFlow - Sistema de Gestão para Fisioterapia</p>
            </div>
          </div>
        </body>
      </html>
    `;

    return this.sendEmail({
      to: params.email,
      subject: `Lembrete: Consulta em ${params.appointmentDate}`,
      htmlBody: html,
      patientId: params.patientId,
      appointmentId: params.appointmentId,
    });
  }

  /**
   * Build SendGrid request body
   */
  private static buildSendGridBody(params: any, recipients: string[]) {
    return {
      personalizations: recipients.map(to => ({ to: [{ email: to }] })),
      from: {
        email: this.FROM_EMAIL,
        name: this.FROM_NAME,
      },
      subject: params.subject,
      content: [
        params.htmlBody && { type: 'text/html', value: params.htmlBody },
        params.textBody && { type: 'text/plain', value: params.textBody },
      ].filter(Boolean),
      attachments: params.attachments?.map((att: any) => ({
        content: att.content,
        filename: att.filename,
        type: att.type || 'application/pdf',
        disposition: 'attachment',
      })),
    };
  }

  /**
   * Build Resend request body
   */
  private static buildResendBody(params: any, recipients: string[]) {
    return {
      from: `${this.FROM_NAME} <${this.FROM_EMAIL}>`,
      to: recipients,
      subject: params.subject,
      html: params.htmlBody,
      text: params.textBody,
      attachments: params.attachments?.map((att: any) => ({
        filename: att.filename,
        content: att.content,
      })),
    };
  }

  /**
   * Get email provider
   */
  private static get EMAIL_PROVIDER() {
    return process.env.EMAIL_PROVIDER || 'resend';
  }

  /**
   * Log email to database
   */
  private static async logEmail(params: {
    to: string;
    subject: string;
    body: string;
    patientId?: string;
    appointmentId?: string;
    status: string;
    messageId?: string;
  }) {
    try {
      // TODO: This is a temporary fix. The `messages` table is not a good fit for logging emails.
      // A dedicated table for email logs should be created.
      const supabase = await createServerComponentClient();
      await supabase.from('messages').insert({
        recipient_id: params.to, // Assuming `to` is a user ID
        sender_id: 'system', // Placeholder
        subject: params.subject,
        content: params.body,
      });
    } catch (error) {
      console.error('Error logging email:', error);
      // Don't throw - logging is not critical
    }
  }
}

