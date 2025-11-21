import { createServerComponentClient } from '~/lib/supabase/server';

interface NotificationPreferences {
  whatsapp: boolean;
  sms: boolean;
  email: boolean;
}

/**
 * Serviço para envio de notificações de agendamento
 */
export class AppointmentNotificationService {
  private supabase;

  constructor() {
    this.supabase = null as any;
  }

  private async getSupabase() {
    if (!this.supabase) {
      this.supabase = await createServerComponentClient();
    }
    return this.supabase;
  }

  /**
   * Envia lembretes 24h antes do agendamento
   */
  async sendReminders24hBefore() {
    const supabase = await this.getSupabase();
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStart = new Date(tomorrow.setHours(0, 0, 0, 0));
    const tomorrowEnd = new Date(tomorrow.setHours(23, 59, 59, 999));

    // Busca agendamentos de amanhã
    const { data: appointments, error } = await supabase
      .from('appointments')
      .select(`
        *,
        patients:patient_id (*)
      `)
      .eq('status', 'scheduled')
      .gte('start_time', tomorrowStart.toISOString())
      .lte('start_time', tomorrowEnd.toISOString())
      .is('reminder_sent', null);

    if (error || !appointments) {
      return { error: error?.message || 'Erro ao buscar agendamentos', sent: 0 };
    }

    let sent = 0;
    for (const appointment of appointments) {
      const patient = (appointment as any).patients;
      if (!patient) continue;

      // Envia notificações conforme preferências
      const preferences = await this.getNotificationPreferences(patient.id);

      if (preferences.whatsapp && patient.phone) {
        await this.sendWhatsAppReminder(patient.phone, appointment);
      }

      if (preferences.sms && patient.phone) {
        await this.sendSMSReminder(patient.phone, appointment);
      }

      if (preferences.email && patient.email) {
        await this.sendEmailReminder(patient.email, appointment);
      }

      // Marca como enviado
      await supabase
        .from('appointments')
        .update({ reminder_sent: new Date().toISOString() })
        .eq('id', appointment.id);

      sent++;
    }

    return { error: null, sent };
  }

  /**
   * Envia mensagem de aniversário
   */
  async sendBirthdayMessages() {
    const supabase = await this.getSupabase();
    const today = new Date();
    const month = today.getMonth() + 1;
    const day = today.getDate();

    // Busca pacientes com aniversário hoje
    const { data: patients, error } = await supabase
      .from('patients')
      .select('*')
      .eq('status', 'active')
      .not('birth_date', 'is', null);

    if (error || !patients) {
      return { error: error?.message || 'Erro ao buscar pacientes', sent: 0 };
    }

    const todayBirthdays = patients.filter((patient) => {
      if (!patient.birth_date) return false;
      const birthDate = new Date(patient.birth_date);
      return birthDate.getMonth() + 1 === month && birthDate.getDate() === day;
    });

    let sent = 0;
    for (const patient of todayBirthdays) {
      const preferences = await this.getNotificationPreferences(patient.id);

      if (preferences.whatsapp && patient.phone) {
        await this.sendWhatsAppBirthday(patient.phone, patient);
      }

      if (preferences.email && patient.email) {
        await this.sendEmailBirthday(patient.email, patient);
      }

      sent++;
    }

    return { error: null, sent };
  }

  /**
   * Busca preferências de notificação do paciente
   */
  private async getNotificationPreferences(patientId: string): Promise<NotificationPreferences> {
    // TODO: Buscar do banco quando tabela existir
    // Por enquanto, retorna padrão
    return {
      whatsapp: true,
      sms: false,
      email: true,
    };
  }

  /**
   * Envia lembrete via WhatsApp
   */
  private async sendWhatsAppReminder(phone: string, appointment: any) {
    const { whatsappService } = await import('~/lib/services/integrations/whatsappService');
    const message = `Olá! Lembrete: Você tem uma consulta agendada para amanhã às ${new Date(appointment.start_time).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}. Confirme sua presença respondendo SIM ou NÃO.`;
    await whatsappService.sendMessage({ to: phone, message });
  }

  /**
   * Envia lembrete via SMS
   */
  private async sendSMSReminder(phone: string, appointment: any) {
    // TODO: Integrar com Twilio
    const message = `Lembrete: Consulta agendada para amanhã às ${new Date(appointment.start_time).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}.`;
    console.log(`[SMS] Enviando para ${phone}: ${message}`);
    // await smsService.send(phone, message);
  }

  /**
   * Envia lembrete via Email
   */
  private async sendEmailReminder(email: string, appointment: any) {
    const { emailService } = await import('~/lib/services/integrations/emailService');
    const subject = 'Lembrete de Consulta';
    const html = `
      <h2>Lembrete de Consulta</h2>
      <p>Você tem uma consulta agendada para amanhã às ${new Date(appointment.start_time).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}.</p>
      <p>Por favor, confirme sua presença.</p>
    `;
    await emailService.sendEmail({ to: email, subject, html });
  }

  /**
   * Envia mensagem de aniversário via WhatsApp
   */
  private async sendWhatsAppBirthday(phone: string, patient: any) {
    const { whatsappService } = await import('~/lib/services/integrations/whatsappService');
    const message = `🎉 Feliz Aniversário, ${patient.full_name}! Desejamos um dia especial e muita saúde! 🎂`;
    await whatsappService.sendMessage({ to: phone, message });
  }

  /**
   * Envia mensagem de aniversário via Email
   */
  private async sendEmailBirthday(email: string, patient: any) {
    const { emailService } = await import('~/lib/services/integrations/emailService');
    const subject = 'Feliz Aniversário!';
    const html = `
      <h2>🎉 Feliz Aniversário, ${patient.full_name}!</h2>
      <p>Desejamos um dia especial e muita saúde!</p>
      <p>Equipe DuduFisio</p>
    `;
    await emailService.sendEmail({ to: email, subject, html });
  }
}
