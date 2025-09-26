// Resend Email Service Integration
import { Resend } from 'resend';
import { Message, DeliveryResult, Recipient } from '../../../types';

export interface ResendConfig {
  apiKey: string;
  fromEmail: string;
  fromName: string;
  enabled: boolean;
  maxRetries: number;
  timeout: number;
}

export interface ResendEmailOptions {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  from?: string;
  replyTo?: string;
  tags?: Array<{ name: string; value: string }>;
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
    contentType?: string;
  }>;
}

export class ResendService {
  private resend: Resend;
  private config: ResendConfig;

  constructor(config: ResendConfig) {
    this.config = config;
    
    if (!config.enabled) {
      throw new Error('Resend service is disabled');
    }

    if (!config.apiKey) {
      throw new Error('Resend API key is required');
    }

    this.resend = new Resend(config.apiKey);
  }

  /**
   * Send email using Resend API
   */
  async sendEmail(options: ResendEmailOptions): Promise<DeliveryResult> {
    const startTime = Date.now();

    try {
      const emailData = {
        from: options.from || `${this.config.fromName} <${this.config.fromEmail}>`,
        to: Array.isArray(options.to) ? options.to : [options.to],
        subject: options.subject,
        html: options.html,
        text: options.text,
        reply_to: options.replyTo,
        tags: options.tags,
        attachments: options.attachments,
      };

      const response = await this.resend.emails.send(emailData);

      const duration = Date.now() - startTime;

      return {
        success: true,
        messageId: response.data?.id || 'unknown',
        channel: 'email',
        deliveredAt: new Date(),
        cost: 0.0001, // Resend free tier cost
        duration,
        metadata: {
          provider: 'resend',
          response: response.data,
        },
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      
      return {
        success: false,
        messageId: 'failed',
        channel: 'email',
        deliveredAt: null,
        cost: 0,
        duration,
        error: error instanceof Error ? error.message : 'Unknown error',
        metadata: {
          provider: 'resend',
          error: error,
        },
      };
    }
  }

  /**
   * Send email from Message object
   */
  async sendMessage(message: Message): Promise<DeliveryResult> {
    const recipient = message.recipient;
    
    if (!recipient.email) {
      return {
        success: false,
        messageId: message.id,
        channel: 'email',
        deliveredAt: null,
        cost: 0,
        error: 'No email address provided',
      };
    }

    return this.sendEmail({
      to: recipient.email,
      subject: message.content.subject || 'Mensagem do DuduFisio',
      html: message.content.body,
      text: message.content.text,
      replyTo: message.replyTo,
    });
  }

  /**
   * Send welcome email
   */
  async sendWelcomeEmail(to: string, name: string): Promise<DeliveryResult> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2563eb;">Bem-vindo ao DuduFisio!</h1>
        <p>Olá ${name},</p>
        <p>Seja bem-vindo ao nosso sistema de fisioterapia inteligente!</p>
        <p>Estamos aqui para ajudar você a cuidar da sua saúde de forma mais eficiente.</p>
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Próximos passos:</h3>
          <ul>
            <li>Complete seu perfil</li>
            <li>Agende sua primeira consulta</li>
            <li>Explore nossos recursos</li>
          </ul>
        </div>
        <p>Se tiver alguma dúvida, não hesite em nos contatar!</p>
        <p>Equipe DuduFisio</p>
      </div>
    `;

    return this.sendEmail({
      to,
      subject: 'Bem-vindo ao DuduFisio!',
      html,
    });
  }

  /**
   * Send appointment reminder
   */
  async sendAppointmentReminder(
    to: string,
    appointmentDate: Date,
    patientName: string,
    therapistName: string
  ): Promise<DeliveryResult> {
    const formattedDate = appointmentDate.toLocaleString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2563eb;">Lembrete de Consulta</h1>
        <p>Olá ${patientName},</p>
        <p>Este é um lembrete da sua consulta de fisioterapia:</p>
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Detalhes da Consulta:</h3>
          <p><strong>Data e Hora:</strong> ${formattedDate}</p>
          <p><strong>Fisioterapeuta:</strong> ${therapistName}</p>
        </div>
        <p>Por favor, chegue com 10 minutos de antecedência.</p>
        <p>Se precisar reagendar, entre em contato conosco.</p>
        <p>Equipe DuduFisio</p>
      </div>
    `;

    return this.sendEmail({
      to,
      subject: `Lembrete de Consulta - ${formattedDate}`,
      html,
    });
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(to: string, resetToken: string): Promise<DeliveryResult> {
    const resetUrl = `${process.env.VITE_APP_URL}/reset-password?token=${resetToken}`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2563eb;">Redefinição de Senha</h1>
        <p>Você solicitou a redefinição da sua senha.</p>
        <p>Clique no botão abaixo para criar uma nova senha:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Redefinir Senha
          </a>
        </div>
        <p>Se você não solicitou esta redefinição, ignore este email.</p>
        <p>Este link expira em 1 hora.</p>
        <p>Equipe DuduFisio</p>
      </div>
    `;

    return this.sendEmail({
      to,
      subject: 'Redefinição de Senha - DuduFisio',
      html,
    });
  }

  /**
   * Test email service
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.sendEmail({
        to: this.config.fromEmail,
        subject: 'Teste de Conexão - DuduFisio',
        html: '<p>Teste de conexão realizado com sucesso!</p>',
      });
      return true;
    } catch (error) {
      console.error('Resend test failed:', error);
      return false;
    }
  }
}

/**
 * Create Resend service from environment variables
 */
export function createResendService(): ResendService {
  const config: ResendConfig = {
    apiKey: process.env.RESEND_API_KEY || '',
    fromEmail: process.env.EMAIL_FROM || 'noreply@moocafisio.com.br',
    fromName: process.env.EMAIL_FROM_NAME || 'DuduFisio',
    enabled: process.env.EMAIL_ENABLED === 'true',
    maxRetries: parseInt(process.env.EMAIL_MAX_RETRIES || '3'),
    timeout: parseInt(process.env.EMAIL_TIMEOUT || '30000'),
  };

  return new ResendService(config);
}
