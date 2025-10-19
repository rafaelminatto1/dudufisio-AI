/**
 * WhatsApp Scheduling Service
 * Serviço de agendamento via WhatsApp
 * DuduFisio-AI
 */

import { supabase } from '@/lib/supabaseClient';
import { getMetaWhatsAppService } from './MetaWhatsAppService';
import format from 'date-fns/format';
import addDays from 'date-fns/addDays';
import parse from 'date-fns/parse';
import { ptBR } from 'date-fns/locale';

export interface SchedulingRequest {
  phone: string;
  patientName: string;
  preferredDate?: string;
  preferredTime?: string;
  reason?: string;
}

export class WhatsAppSchedulingService {
  private whatsappService;

  constructor() {
    this.whatsappService = getMetaWhatsAppService();
  }

  /**
   * Iniciar processo de agendamento
   */
  async startSchedulingProcess(
    phone: string,
    patientName: string,
    clinicId: string
  ): Promise<void> {
    try {
      // Buscar horários disponíveis para os próximos 7 dias
      const availableSlots = await this.getAvailableSlots(clinicId, 7);

      if (availableSlots.length === 0) {
        await this.whatsappService.sendTextMessage(
          phone,
          '😔 Desculpe, não temos horários disponíveis nos próximos 7 dias.\n\n' +
          'Por favor, entre em contato pelo telefone (11) 5874-9885 para verificar outras opções.',
          clinicId
        );
        return;
      }

      // Enviar opções de horários
      const message = this.formatAvailableSlotsMessage(patientName, availableSlots);
      await this.whatsappService.sendTextMessage(phone, message, clinicId);

    } catch (error) {
      console.error('Erro ao iniciar processo de agendamento:', error);
      throw error;
    }
  }

  /**
   * Buscar horários disponíveis
   */
  private async getAvailableSlots(
    clinicId: string,
    daysAhead: number
  ): Promise<Array<{ date: string; time: string; therapist: string }>> {
    try {
      const today = new Date();
      const endDate = addDays(today, daysAhead);

      // Buscar horários já agendados
      const { data: appointments } = await supabase
        .from('appointments')
        .select('date, time')
        .eq('clinic_id', clinicId)
        .gte('date', format(today, 'yyyy-MM-dd'))
        .lte('date', format(endDate, 'yyyy-MM-dd'))
        .in('status', ['scheduled', 'confirmed']);

      // Horários padrão da clínica
      const standardHours = [
        '08:00', '09:00', '10:00', '11:00',
        '14:00', '15:00', '16:00', '17:00'
      ];

      const availableSlots: Array<{ date: string; time: string; therapist: string }> = [];

      // Gerar slots disponíveis
      for (let i = 1; i <= daysAhead; i++) {
        const date = addDays(today, i);
        const dateStr = format(date, 'yyyy-MM-dd');
        
        // Pular fins de semana
        if (date.getDay() === 0 || date.getDay() === 6) continue;

        for (const time of standardHours) {
          // Verificar se o horário está disponível
          const isBooked = appointments?.some(
            apt => apt.date === dateStr && apt.time === time
          );

          if (!isBooked) {
            availableSlots.push({
              date: dateStr,
              time,
              therapist: 'Disponível'
            });
          }
        }
      }

      return availableSlots.slice(0, 10); // Retornar apenas os 10 primeiros
    } catch (error) {
      console.error('Erro ao buscar horários disponíveis:', error);
      return [];
    }
  }

  /**
   * Formatar mensagem com horários disponíveis
   */
  private formatAvailableSlotsMessage(
    patientName: string,
    slots: Array<{ date: string; time: string; therapist: string }>
  ): string {
    let message = `📅 *Horários Disponíveis*\n\nOlá ${patientName}!\n\n`;
    message += 'Temos os seguintes horários disponíveis:\n\n';

    slots.slice(0, 5).forEach((slot, index) => {
      const date = parse(slot.date, 'yyyy-MM-dd', new Date());
      const formattedDate = format(date, "dd/MM (EEE)", { locale: ptBR });
      message += `${index + 1}️⃣ ${formattedDate} às ${slot.time}\n`;
    });

    message += '\n*Como agendar:*\n';
    message += 'Responda com o número da opção desejada (1 a 5)\n';
    message += 'Ou ligue para (11) 5874-9885 para mais opções.';

    return message;
  }

  /**
   * Processar seleção de horário
   */
  async processSlotSelection(
    phone: string,
    selection: string,
    clinicId: string
  ): Promise<void> {
    try {
      const slotNumber = parseInt(selection);
      
      if (isNaN(slotNumber) || slotNumber < 1 || slotNumber > 5) {
        await this.whatsappService.sendTextMessage(
          phone,
          '❌ Opção inválida. Por favor, responda com um número de 1 a 5.',
          clinicId
        );
        return;
      }

      // Buscar horários disponíveis novamente
      const availableSlots = await this.getAvailableSlots(clinicId, 7);
      const selectedSlot = availableSlots[slotNumber - 1];

      if (!selectedSlot) {
        await this.whatsappService.sendTextMessage(
          phone,
          '❌ Desculpe, esse horário não está mais disponível.\n\n' +
          'Digite *AGENDAR* para ver novos horários disponíveis.',
          clinicId
        );
        return;
      }

      // Criar agendamento provisório
      await this.createProvisionalAppointment(phone, selectedSlot, clinicId);

      // Enviar confirmação
      const date = parse(selectedSlot.date, 'yyyy-MM-dd', new Date());
      const formattedDate = format(date, "dd/MM/yyyy (EEEE)", { locale: ptBR });
      
      await this.whatsappService.sendTextMessage(
        phone,
        `✅ *Agendamento Solicitado!*\n\n` +
        `📅 Data: ${formattedDate}\n` +
        `🕐 Horário: ${selectedSlot.time}\n\n` +
        `Sua solicitação foi enviada para nossa equipe.\n` +
        `Em breve entraremos em contato para confirmar! 📞\n\n` +
        `Obrigado! 😊`,
        clinicId
      );

      // Notificar equipe
      await this.notifyStaff(phone, selectedSlot, clinicId);

    } catch (error) {
      console.error('Erro ao processar seleção de horário:', error);
      throw error;
    }
  }

  /**
   * Criar agendamento provisório
   */
  private async createProvisionalAppointment(
    phone: string,
    slot: { date: string; time: string },
    clinicId: string
  ): Promise<void> {
    try {
      // Buscar ou criar paciente
      const patient = await this.findOrCreatePatient(phone, clinicId);

      // Criar agendamento com status "pendente"
      const { error } = await supabase
        .from('appointments')
        .insert({
          clinic_id: clinicId,
          patient_id: patient.id,
          date: slot.date,
          time: slot.time,
          status: 'pending',
          type: 'consultation',
          notes: 'Agendado via WhatsApp - Aguardando confirmação da equipe',
          created_via: 'whatsapp',
        } as any);

      if (error) throw error;

      
    } catch (error) {
      console.error('Erro ao criar agendamento provisório:', error);
      throw error;
    }
  }

  /**
   * Encontrar ou criar paciente
   */
  private async findOrCreatePatient(phone: string, clinicId: string): Promise<any> {
    try {
      // Buscar paciente existente
      const { data: existingPatient } = await supabase
        .from('patients')
        .select('*')
        .eq('clinic_id', clinicId)
        .eq('phone', phone)
        .single();

      if (existingPatient) {
        return existingPatient;
      }

      // Criar novo paciente
      const { data: newPatient, error } = await supabase
        .from('patients')
        .insert({
          clinic_id: clinicId,
          name: `Paciente WhatsApp ${phone}`,
          phone: phone,
          email: '',
          status: 'active',
          notes: 'Cadastrado via WhatsApp',
        })
        .select()
        .single();

      if (error) throw error;

      return newPatient;
    } catch (error) {
      console.error('Erro ao buscar/criar paciente:', error);
      throw error;
    }
  }

  /**
   * Notificar equipe sobre novo agendamento
   */
  private async notifyStaff(
    phone: string,
    slot: { date: string; time: string },
    clinicId: string
  ): Promise<void> {
    try {
      // Buscar admins e terapeutas da clínica
      const { data: staff } = await supabase
        .from('users')
        .select('id, name, email, notification_preferences')
        .eq('clinic_id', clinicId)
        .in('role', ['admin', 'therapist']);

      if (staff?.length === 0) return;

      const date = parse(slot.date, 'yyyy-MM-dd', new Date());
      const formattedDate = format(date, "dd/MM/yyyy", { locale: ptBR });

      // Criar notificação
      const { error } = await supabase
        .from('notifications')
        .insert(
          staff.map(member => ({
            user_id: member.id,
            clinic_id: clinicId,
            type: 'appointment_request',
            title: 'Nova Solicitação de Agendamento via WhatsApp',
            message: `Paciente: ${phone}\nData: ${formattedDate}\nHorário: ${slot.time}`,
            priority: 'high',
            is_read: false,
          }))
        );

      if (error) throw error;

      
    } catch (error) {
      console.error('Erro ao notificar equipe:', error);
    }
  }

  /**
   * Confirmar agendamento
   */
  async confirmAppointment(
    appointmentId: string,
    therapistId: string,
    clinicId: string
  ): Promise<void> {
    try {
      // Atualizar agendamento
      const { data: appointment, error } = await supabase
        .from('appointments')
        .update({
          status: 'confirmed',
          therapist_id: therapistId,
          confirmed_at: new Date().toISOString(),
        } as any)
        .eq('id', appointmentId)
        .select(`
          *,
          patient:patients(name, phone),
          therapist:users(name)
        `)
        .single();

      if (error) throw error;

      // Enviar confirmação para o paciente
      if (appointment.patient?.phone) {
        await this.whatsappService.sendAppointmentNotification(
          appointment.patient.phone,
          {
            patientName: appointment.patient.name,
            date: format(parse(appointment.date, 'yyyy-MM-dd', new Date()), 'dd/MM/yyyy'),
            time: appointment.time,
            therapistName: appointment.therapist?.name || 'Profissional',
          },
          clinicId
        );
      }

      
    } catch (error) {
      console.error('Erro ao confirmar agendamento:', error);
      throw error;
    }
  }

  /**
   * Cancelar agendamento
   */
  async cancelAppointment(
    appointmentId: string,
    reason: string,
    clinicId: string
  ): Promise<void> {
    try {
      // Buscar dados do agendamento
      const { data: appointment } = await supabase
        .from('appointments')
        .select(`
          *,
          patient:patients(name, phone)
        `)
        .eq('id', appointmentId)
        .single();

      if (!appointment) throw new Error('Agendamento não encontrado');

      // Atualizar status
      const { error } = await supabase
        .from('appointments')
        .update({
          status: 'cancelled',
          cancellation_reason: reason,
          cancelled_at: new Date().toISOString(),
        } as any)
        .eq('id', appointmentId);

      if (error) throw error;

      // Notificar paciente
      if (appointment.patient?.phone) {
        await this.whatsappService.sendTextMessage(
          appointment.patient.phone,
          `❌ *Agendamento Cancelado*\n\n` +
          `Olá ${appointment.patient.name},\n\n` +
          `Seu agendamento para ${appointment.date} às ${appointment.time} foi cancelado.\n\n` +
          `Motivo: ${reason}\n\n` +
          `Para reagendar, digite *AGENDAR* ou entre em contato pelo telefone (11) 5874-9885.\n\n` +
          `Desculpe o transtorno!`,
          clinicId
        );
      }

      
    } catch (error) {
      console.error('Erro ao cancelar agendamento:', error);
      throw error;
    }
  }
}

// Singleton instance
let schedulingServiceInstance: WhatsAppSchedulingService | null = null;

export const getWhatsAppSchedulingService = (): WhatsAppSchedulingService => {
  if (!schedulingServiceInstance) {
    schedulingServiceInstance = new WhatsAppSchedulingService();
  }
  return schedulingServiceInstance;
};

