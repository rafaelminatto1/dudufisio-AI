/**
 * Serviço de integração com Email
 * Suporta Resend e SendGrid
 */

interface EmailMessage {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  from?: string;
  replyTo?: string;
}

interface EmailResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

export class EmailService {
  private provider: 'resend' | 'sendgrid' | 'mock';
  private apiKey?: string;
  private fromEmail?: string;

  constructor() {
    this.provider = (process.env.EMAIL_PROVIDER as any) || 'mock';
    this.apiKey = process.env.EMAIL_API_KEY;
    this.fromEmail = process.env.EMAIL_FROM || 'noreply@dudufisio.com';
  }

  /**
   * Envia email
   */
  async sendEmail(data: EmailMessage): Promise<EmailResponse> {
    try {
      switch (this.provider) {
        case 'resend':
          return await this.sendViaResend(data);
        case 'sendgrid':
          return await this.sendViaSendGrid(data);
        case 'mock':
        default:
          return await this.sendViaMock(data);
      }
    } catch (error) {
      console.error('Erro ao enviar email:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      };
    }
  }

  /**
   * Envia via Resend
   */
  private async sendViaResend(data: EmailMessage): Promise<EmailResponse> {
    if (!this.apiKey) {
      throw new Error('API Key Resend não configurada');
    }

    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: data.from || this.fromEmail,
          to: Array.isArray(data.to) ? data.to : [data.to],
          subject: data.subject,
          html: data.html,
          text: data.text,
          reply_to: data.replyTo,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `Resend API error: ${response.status} - ${JSON.stringify(errorData)}`
        );
      }

      const result = await response.json();
      
      return {
        success: true,
        messageId: result.id || `resend-${Date.now()}`,
      };
    } catch (error) {
      console.error('Erro ao enviar email via Resend:', error);
      throw error;
    }
  }

  /**
   * Envia via SendGrid
   */
  private async sendViaSendGrid(data: EmailMessage): Promise<EmailResponse> {
    if (!this.apiKey) {
      throw new Error('API Key SendGrid não configurada');
    }

    // TODO: Implementar chamada real à API SendGrid
    console.log('[SendGrid Mock] Enviando email:', data);
    return {
      success: true,
      messageId: `sendgrid-${Date.now()}`,
    };
  }

  /**
   * Mock para desenvolvimento
   */
  private async sendViaMock(data: EmailMessage): Promise<EmailResponse> {
    console.log('[Email Mock] Enviando para', data.to, ':', data.subject);
    return {
      success: true,
      messageId: `mock-${Date.now()}`,
    };
  }

  /**
   * Envia email de template
   */
  async sendTemplate(
    template: string,
    to: string,
    variables: Record<string, string>
  ): Promise<EmailResponse> {
    // TODO: Implementar sistema de templates
    const html = `Template: ${template}\n\n${JSON.stringify(variables, null, 2)}`;
    return this.sendEmail({
      to,
      subject: `[Template] ${template}`,
      html,
    });
  }
}

export const emailService = new EmailService();
