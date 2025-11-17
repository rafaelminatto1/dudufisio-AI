export class EmailService {
  private static readonly API_URL = process.env.EMAIL_PROVIDER === 'sendgrid'
    ? 'https://api.sendgrid.com/v3/mail/send'
    : 'https://api.resend.com/emails';
  private static readonly API_KEY = process.env.EMAIL_API_KEY || '';
  private static readonly FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@fisioflow.com';

  static async sendEmail(params: {
    to: string;
    subject: string;
    htmlBody: string;
    patientId?: string;
  }) {
    try {
      const response = await fetch(this.API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: this.FROM_EMAIL,
          to: params.to,
          subject: params.subject,
          html: params.htmlBody,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to send email');

      // TODO: Save to database
      return { data, error: null };
    } catch (error) {
      console.error('Error sending email:', error);
      return { data: null, error };
    }
  }

  static async sendWelcomeEmail(params: {
    patientId: string;
    email: string;
    name: string;
  }) {
    const html = `
      <h1>Bem-vindo ao FisioFlow, ${params.name}!</h1>
      <p>Estamos felizes em tê-lo conosco.</p>
    `;

    return this.sendEmail({
      to: params.email,
      subject: 'Bem-vindo ao FisioFlow',
      htmlBody: html,
      patientId: params.patientId,
    });
  }
}

