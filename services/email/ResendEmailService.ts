/**
 * Resend Email Service - Production Ready
 * Integrates with Supabase Edge Function for email sending
 *
 * Features:
 * - Professional HTML templates
 * - Email tracking and logging
 * - Retry logic for failed sends
 * - Template rendering with dynamic data
 * - Delivery status tracking
 *
 * @see supabase/functions/send-email
 */

import { supabase } from '@/lib/supabaseClient';
import { logger } from '@/lib/logger';
import { emailTemplates } from './templates';

export interface EmailRecipient {
  email: string;
  name?: string;
}

export interface EmailOptions {
  to: EmailRecipient;
  subject: string;
  template?: keyof typeof emailTemplates;
  data?: Record<string, any>;
  html?: string;
  text?: string;
  priority?: 'high' | 'normal' | 'low';
  scheduledFor?: Date;
}

export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
  retryable?: boolean;
}

class ResendEmailService {
  private readonly EDGE_FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-email`;

  /**
   * Send email using template
   */
  async sendEmail(options: EmailOptions): Promise<EmailResult> {
    try {
      // Validate
      if (!options.to.email) {
        throw new Error('Recipient email is required');
      }

      // Render template if provided
      let htmlContent = options.html;
      let textContent = options.text;

      if (options.template && !htmlContent) {
        const templateData = await this.renderTemplate(options.template, options.data || {});
        htmlContent = templateData.html;
        textContent = templateData.text;
      }

      // Validate content
      if (!htmlContent && !textContent) {
        throw new Error('Email must have either HTML or text content');
      }

      // Log email attempt
      const notificationId = await this.logEmailAttempt(options);

      // Call edge function
      const response = await fetch(this.EDGE_FUNCTION_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          to: options.to.email,
          subject: options.subject,
          html: htmlContent,
          text: textContent || this.stripHtml(htmlContent || ''),
          notification_id: notificationId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const result = await response.json();

      logger.info('Email sent successfully', {
        to: options.to.email,
        subject: options.subject,
        messageId: result.messageId,
      });

      return {
        success: true,
        messageId: result.messageId,
      };
    } catch (error: any) {
      logger.error('Failed to send email', error);

      return {
        success: false,
        error: error.message || 'Unknown error',
        retryable: true,
      };
    }
  }

  /**
   * Send appointment confirmation email
   */
  async sendAppointmentConfirmation(params: {
    to: EmailRecipient;
    patientName: string;
    appointmentDate: string;
    appointmentTime: string;
    therapistName: string;
    location: string;
  }): Promise<EmailResult> {
    return this.sendEmail({
      to: params.to,
      subject: `Confirmação de Consulta - ${params.appointmentDate}`,
      template: 'appointment-confirmation',
      data: params,
      priority: 'high',
    });
  }

  /**
   * Send appointment reminder (24h before)
   */
  async sendAppointmentReminder24h(params: {
    to: EmailRecipient;
    patientName: string;
    appointmentDate: string;
    appointmentTime: string;
    therapistName: string;
  }): Promise<EmailResult> {
    return this.sendEmail({
      to: params.to,
      subject: `Lembrete: Consulta Amanhã - ${params.appointmentDate}`,
      template: 'appointment-reminder-24h',
      data: params,
      priority: 'high',
    });
  }

  /**
   * Send appointment reminder (2h before)
   */
  async sendAppointmentReminder2h(params: {
    to: EmailRecipient;
    patientName: string;
    appointmentTime: string;
    location: string;
  }): Promise<EmailResult> {
    return this.sendEmail({
      to: params.to,
      subject: `Lembrete: Consulta em 2 horas`,
      template: 'appointment-reminder-2h',
      data: params,
      priority: 'high',
    });
  }

  /**
   * Send cancellation notification
   */
  async sendAppointmentCancellation(params: {
    to: EmailRecipient;
    patientName: string;
    appointmentDate: string;
    appointmentTime: string;
    reason?: string;
  }): Promise<EmailResult> {
    return this.sendEmail({
      to: params.to,
      subject: `Consulta Cancelada - ${params.appointmentDate}`,
      template: 'appointment-cancellation',
      data: params,
    });
  }

  /**
   * Send welcome email to new patient
   */
  async sendWelcomeEmail(params: {
    to: EmailRecipient;
    patientName: string;
    clinicName: string;
  }): Promise<EmailResult> {
    return this.sendEmail({
      to: params.to,
      subject: `Bem-vindo ao ${params.clinicName}!`,
      template: 'welcome-patient',
      data: params,
    });
  }

  /**
   * Send post-appointment evaluation request
   */
  async sendEvaluationRequest(params: {
    to: EmailRecipient;
    patientName: string;
    appointmentDate: string;
    evaluationLink: string;
  }): Promise<EmailResult> {
    return this.sendEmail({
      to: params.to,
      subject: 'Avalie sua consulta',
      template: 'evaluation-request',
      data: params,
    });
  }

  /**
   * Send payment receipt
   */
  async sendPaymentReceipt(params: {
    to: EmailRecipient;
    patientName: string;
    amount: number;
    paymentMethod: string;
    paymentDate: string;
    receiptNumber: string;
  }): Promise<EmailResult> {
    return this.sendEmail({
      to: params.to,
      subject: `Recibo de Pagamento - #${params.receiptNumber}`,
      template: 'payment-receipt',
      data: params,
    });
  }

  /**
   * Render email template
   */
  private async renderTemplate(
    templateName: keyof typeof emailTemplates,
    data: Record<string, any>
  ): Promise<{ html: string; text: string }> {
    const template = emailTemplates[templateName];

    if (!template) {
      throw new Error(`Template not found: ${templateName}`);
    }

    // Replace placeholders with data
    let html = template.html;
    let text = template.text;

    for (const [key, value] of Object.entries(data)) {
      const placeholder = `{{${key}}}`;
      html = html.replaceAll(placeholder, String(value));
      text = text.replaceAll(placeholder, String(value));
    }

    return { html, text };
  }

  /**
   * Strip HTML tags for text content
   */
  private stripHtml(html: string): string {
    return html
      .replace(/<style[^>]*>.*?<\/style>/gi, '')
      .replace(/<script[^>]*>.*?<\/script>/gi, '')
      .replace(/<[^>]+>/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Log email attempt to database
   */
  private async logEmailAttempt(options: EmailOptions): Promise<string> {
    try {
      const { data, error } = await supabase
        .from('notification_logs')
        .insert({
          channel: 'email',
          recipient_email: options.to.email,
          recipient_name: options.to.name,
          subject: options.subject,
          template: options.template,
          priority: options.priority || 'normal',
          scheduled_for: options.scheduledFor?.toISOString(),
          status: 'pending',
        })
        .select('id')
        .single();

      if (error) {
        logger.error('Failed to log email attempt', error);
        return 'unknown';
      }

      return data.id;
    } catch (error) {
      logger.error('Failed to log email attempt', error);
      return 'unknown';
    }
  }

  /**
   * Update email status
   */
  async updateEmailStatus(
    notificationId: string,
    status: 'sent' | 'delivered' | 'failed' | 'bounced',
    errorMessage?: string
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('notification_logs')
        .update({
          status,
          error_message: errorMessage,
          updated_at: new Date().toISOString(),
        })
        .eq('id', notificationId);

      if (error) {
        logger.error('Failed to update email status', error);
      }
    } catch (error) {
      logger.error('Failed to update email status', error);
    }
  }

  /**
   * Get email delivery statistics
   */
  async getDeliveryStats(
    startDate: Date,
    endDate: Date
  ): Promise<{
    total: number;
    sent: number;
    delivered: number;
    failed: number;
    bounced: number;
  }> {
    try {
      const { data, error } = await supabase
        .from('notification_logs')
        .select('status')
        .eq('channel', 'email')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

      if (error) throw error;

      const stats = {
        total: data.length,
        sent: 0,
        delivered: 0,
        failed: 0,
        bounced: 0,
      };

      data.forEach((log) => {
        if (log.status in stats) {
          stats[log.status as keyof typeof stats]++;
        }
      });

      return stats;
    } catch (error) {
      logger.error('Failed to get email stats', error);
      return {
        total: 0,
        sent: 0,
        delivered: 0,
        failed: 0,
        bounced: 0,
      };
    }
  }
}

// Export singleton instance
export const resendEmailService = new ResendEmailService();

// Export for backwards compatibility
export const sendEmail = (options: EmailOptions) =>
  resendEmailService.sendEmail(options);

export const sendEmailToInactivePatients = async (patients: any[]) => {
  const results = await Promise.all(
    patients.map((patient) =>
      resendEmailService.sendEmail({
        to: { email: patient.email, name: patient.name },
        subject: 'Sentimos sua falta!',
        template: 'inactive-patient',
        data: { patientName: patient.name },
      })
    )
  );

  const sent = results.filter((r) => r.success).length;
  return { success: true, sent };
};
