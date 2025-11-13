/**
 * WhatsApp Automation Service
 * Sistema de automação para WhatsApp
 * MoocaFisio-AI
 */

import { getMetaWhatsAppService } from './MetaWhatsAppService';
import { supabase } from '@/lib/supabaseClient';
import { format } from 'date-fns';

export interface AutomationRule {
  id: string;
  clinic_id: string;
  trigger_type: 'keyword' | 'time_based' | 'event_based';
  trigger_value: string;
  action_type: 'send_message' | 'create_appointment' | 'notify_staff';
  action_data: any;
  is_active: boolean;
}

interface AppointmentWithPatient {
  id: string;
  date: string;
  time: string;
  patient: {
    name: string;
    phone: string;
  } | null;
  therapist?: {
    name: string;
  } | null;
}

export class WhatsAppAutomation {
  private whatsappService;

  constructor() {
    this.whatsappService = getMetaWhatsAppService();
  }

  /**
   * Processar automação baseada em palavras-chave
   */
  async processKeywordAutomation(
    message: string,
    phone: string,
    clinicId: string
  ): Promise<string | null> {
    const messageLower = message.toLowerCase().trim();

    // Automações padrão
    const automations: Record<string, string> = {
      // Saudações
      'oi': '👋 Olá! Bem-vindo à nossa clínica. Como posso ajudá-lo?\n\n' +
            'Você pode:\n' +
            '📅 Digitar *AGENDAR* para marcar uma consulta\n' +
            '📍 Digitar *LOCALIZAÇÃO* para ver nosso endereço\n' +
            '🕐 Digitar *HORÁRIO* para ver nosso horário de atendimento\n' +
            '💰 Digitar *PREÇOS* para informações sobre valores',
      
      'olá': '👋 Olá! Bem-vindo à nossa clínica. Como posso ajudá-lo?\n\n' +
             'Você pode:\n' +
             '📅 Digitar *AGENDAR* para marcar uma consulta\n' +
             '📍 Digitar *LOCALIZAÇÃO* para ver nosso endereço\n' +
             '🕐 Digitar *HORÁRIO* para ver nosso horário de atendimento\n' +
             '💰 Digitar *PREÇOS* para informações sobre valores',
      
      'ola': '👋 Olá! Bem-vindo à nossa clínica. Como posso ajudá-lo?\n\n' +
             'Você pode:\n' +
             '📅 Digitar *AGENDAR* para marcar uma consulta\n' +
             '📍 Digitar *LOCALIZAÇÃO* para ver nosso endereço\n' +
             '🕐 Digitar *HORÁRIO* para ver nosso horário de atendimento\n' +
             '💰 Digitar *PREÇOS* para informações sobre valores',

      // Agendamento
      'agendar': '📅 *Agendamento de Consulta*\n\n' +
                 'Ótimo! Vou te ajudar a agendar sua consulta.\n\n' +
                 'Por favor, me informe:\n' +
                 '1️⃣ Seu nome completo\n' +
                 '2️⃣ Data preferencial (ex: 10/10/2025)\n' +
                 '3️⃣ Período preferencial (manhã/tarde)\n\n' +
                 'Ou ligue para (11) 5874-9885 para falar diretamente com nossa recepção.',

      'marcar': '📅 *Agendamento de Consulta*\n\n' +
                'Ótimo! Vou te ajudar a agendar sua consulta.\n\n' +
                'Por favor, me informe:\n' +
                '1️⃣ Seu nome completo\n' +
                '2️⃣ Data preferencial (ex: 10/10/2025)\n' +
                '3️⃣ Período preferencial (manhã/tarde)\n\n' +
                'Ou ligue para (11) 5874-9885 para falar diretamente com nossa recepção.',

      // Localização
      'localização': '📍 *Nossa Localização*\n\n' +
                     'Estamos localizados em:\n' +
                     'Rua Exemplo, 123 - Centro\n' +
                     'São Paulo - SP\n\n' +
                     '🅿️ Estacionamento disponível\n' +
                     '♿ Acessível para cadeirantes\n\n' +
                     '🗺️ https://maps.google.com/?q=Mooca+Fisio',
      
      'localizacao': '📍 *Nossa Localização*\n\n' +
                     'Estamos localizados em:\n' +
                     'Rua Exemplo, 123 - Centro\n' +
                     'São Paulo - SP\n\n' +
                     '🅿️ Estacionamento disponível\n' +
                     '♿ Acessível para cadeirantes\n\n' +
                     '🗺️ https://maps.google.com/?q=Mooca+Fisio',

      'endereco': '📍 *Nossa Localização*\n\n' +
                  'Estamos localizados em:\n' +
                  'Rua Exemplo, 123 - Centro\n' +
                  'São Paulo - SP\n\n' +
                  '🅿️ Estacionamento disponível\n' +
                  '♿ Acessível para cadeirantes\n\n' +
                  '🗺️ https://maps.google.com/?q=Mooca+Fisio',
      
      'endereço': '📍 *Nossa Localização*\n\n' +
                  'Estamos localizados em:\n' +
                  'Rua Exemplo, 123 - Centro\n' +
                  'São Paulo - SP\n\n' +
                  '🅿️ Estacionamento disponível\n' +
                  '♿ Acessível para cadeirantes\n\n' +
                  '🗺️ https://maps.google.com/?q=Mooca+Fisio',

      // Horário
      'horário': '🕐 *Horário de Atendimento*\n\n' +
                 'Segunda a Sexta: 8h às 18h\n' +
                 'Sábado: 8h às 12h\n' +
                 'Domingo: Fechado\n\n' +
                 '📞 Telefone: (11) 5874-9885',
      
      'horario': '🕐 *Horário de Atendimento*\n\n' +
                 'Segunda a Sexta: 8h às 18h\n' +
                 'Sábado: 8h às 12h\n' +
                 'Domingo: Fechado\n\n' +
                 '📞 Telefone: (11) 5874-9885',

      // Preços
      'preços': '💰 *Informações sobre Valores*\n\n' +
                'Os valores das consultas variam de acordo com o tipo de tratamento.\n\n' +
                'Para informações detalhadas sobre preços, entre em contato:\n' +
                '📞 (11) 5874-9885\n' +
                '📧 contato@moocafisio.com.br\n\n' +
                'Aceitamos diversos convênios! 🏥',
      
      'precos': '💰 *Informações sobre Valores*\n\n' +
                'Os valores das consultas variam de acordo com o tipo de tratamento.\n\n' +
                'Para informações detalhadas sobre preços, entre em contato:\n' +
                '📞 (11) 5874-9885\n' +
                '📧 contato@moocafisio.com.br\n\n' +
                'Aceitamos diversos convênios! 🏥',

      'valor': '💰 *Informações sobre Valores*\n\n' +
               'Os valores das consultas variam de acordo com o tipo de tratamento.\n\n' +
               'Para informações detalhadas sobre preços, entre em contato:\n' +
               '📞 (11) 5874-9885\n' +
               '📧 contato@moocafisio.com.br\n\n' +
               'Aceitamos diversos convênios! 🏥',

      // Convênios
      'convenio': '🏥 *Convênios Aceitos*\n\n' +
                  'Trabalhamos com os principais convênios:\n' +
                  '✅ Unimed\n' +
                  '✅ Bradesco Saúde\n' +
                  '✅ SulAmérica\n' +
                  '✅ Amil\n' +
                  '✅ Porto Seguro\n\n' +
                  'Para confirmar cobertura, entre em contato:\n' +
                  '📞 (11) 5874-9885',
      
      'convênio': '🏥 *Convênios Aceitos*\n\n' +
                  'Trabalhamos com os principais convênios:\n' +
                  '✅ Unimed\n' +
                  '✅ Bradesco Saúde\n' +
                  '✅ SulAmérica\n' +
                  '✅ Amil\n' +
                  '✅ Porto Seguro\n\n' +
                  'Para confirmar cobertura, entre em contato:\n' +
                  '📞 (11) 5874-9885',

      // Ajuda
      'ajuda': '❓ *Menu de Ajuda*\n\n' +
               'Palavras-chave disponíveis:\n\n' +
               '📅 *AGENDAR* - Marcar consulta\n' +
               '📍 *LOCALIZAÇÃO* - Ver endereço\n' +
               '🕐 *HORÁRIO* - Horário de atendimento\n' +
               '💰 *PREÇOS* - Informações sobre valores\n' +
               '🏥 *CONVÊNIO* - Convênios aceitos\n' +
               '📞 *CONTATO* - Formas de contato\n\n' +
               'Como posso ajudá-lo?',
      
      'menu': '❓ *Menu de Ajuda*\n\n' +
              'Palavras-chave disponíveis:\n\n' +
              '📅 *AGENDAR* - Marcar consulta\n' +
              '📍 *LOCALIZAÇÃO* - Ver endereço\n' +
              '🕐 *HORÁRIO* - Horário de atendimento\n' +
              '💰 *PREÇOS* - Informações sobre valores\n' +
              '🏥 *CONVÊNIO* - Convênios aceitos\n' +
              '📞 *CONTATO* - Formas de contato\n\n' +
              'Como posso ajudá-lo?',

      // Contato
      'contato': '📞 *Formas de Contato*\n\n' +
                 'Entre em contato conosco:\n\n' +
                 '📱 WhatsApp: (11) 5874-9885\n' +
                 '📞 Telefone: (11) 5874-9885\n' +
                 '📧 Email: contato@moocafisio.com.br\n\n' +
                 'Horário de atendimento:\n' +
                 'Segunda a Sexta: 8h às 18h\n' +
                 'Sábado: 8h às 12h',

      // Confirmação
      'sim': '✅ Confirmado! Obrigado pela confirmação.',
      'confirmo': '✅ Confirmado! Obrigado pela confirmação.',
      
      'não': '❌ Entendido. Se precisar reagendar, entre em contato conosco.',
      'nao': '❌ Entendido. Se precisar reagendar, entre em contato conosco.',
    };

    // Buscar resposta automática
    if (automations[messageLower]) {
      return automations[messageLower];
    }

    // Buscar automações personalizadas no banco de dados
      try {
        const { data: customAutomations } = await (supabase as any)
          .from('whatsapp_automations')
          .select('*')
          .eq('clinic_id', clinicId)
          .eq('trigger_type', 'keyword')
        .eq('is_active', true) as { data: AutomationRule[] | null };

      if (customAutomations) {
        for (const automation of customAutomations) {
          if (messageLower.includes(automation.trigger_value.toLowerCase())) {
            return automation.action_data.message;
          }
        }
      }
    } catch (error) {
      console.error('Erro ao buscar automações personalizadas:', error);
    }

    return null;
  }

  /**
   * Enviar lembretes de consulta automaticamente
   */
  async sendAutomatedReminders(clinicId: string): Promise<void> {
    try {
      // Buscar consultas para amanhã
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = format(tomorrow, 'yyyy-MM-dd');

      const { data: appointmentsData } = await supabase
        .from('appointments')
        .select(`
          id,
          date,
          time,
          patient:patients(name, phone),
          therapist:users(name)
        `)
        .eq('clinic_id', clinicId)
        .eq('date', tomorrowStr)
        .eq('status', 'confirmed') as { data: AppointmentWithPatient[] | null };

      const appointments = appointmentsData ?? [];

      if (appointments.length === 0) {
        
        return;
      }

      for (const appointment of appointments) {
        if (!appointment.patient?.phone) continue;

        await this.whatsappService.sendAppointmentReminder(
          appointment.patient.phone,
          {
            patientName: appointment.patient.name,
            date: tomorrowStr,
            time: appointment.time,
            clinicAddress: 'Rua Exemplo, 123 - Centro, São Paulo - SP',
          },
          clinicId
        );

        
      }

    } catch (error) {
      console.error('Erro ao enviar lembretes automáticos:', error);
    }
  }

  /**
   * Enviar solicitações de confirmação
   */
  async sendConfirmationRequests(clinicId: string): Promise<void> {
    try {
      // Buscar consultas para daqui a 2 dias
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + 2);
      const targetDateStr = format(targetDate, 'yyyy-MM-dd');

      const { data: appointmentsData } = await supabase
        .from('appointments')
        .select(`
          id,
          date,
          time,
          patient:patients(name, phone)
        `)
        .eq('clinic_id', clinicId)
        .eq('date', targetDateStr)
        .eq('status', 'scheduled') as { data: AppointmentWithPatient[] | null };

      const appointments = appointmentsData ?? [];

      if (appointments.length === 0) {
        
        return;
      }

      for (const appointment of appointments) {
        if (!appointment.patient?.phone) continue;

        await this.whatsappService.sendConfirmationRequest(
          appointment.patient.phone,
          {
            patientName: appointment.patient.name,
            date: targetDateStr,
            time: appointment.time,
          },
          clinicId
        );

        
      }

    } catch (error) {
      console.error('Erro ao enviar confirmações automáticas:', error);
    }
  }

  /**
   * Processar resposta de confirmação
   */
  async processConfirmationResponse(
    message: string,
    phone: string,
    clinicId: string
  ): Promise<void> {
    const messageLower = message.toLowerCase().trim();
    
    if (messageLower === 'sim' || messageLower === 'confirmo') {
      // Atualizar status da consulta
      try {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowStr = format(tomorrow, 'yyyy-MM-dd');

        // Primeiro, buscar o paciente pelo telefone
        const { data: patient } = await supabase
          .from('patients')
          .select('id')
          .eq('phone', phone)
          .eq('clinic_id', clinicId)
          .single();

        if (patient) {
          // Atualizar o agendamento
          await supabase
            .from('appointments')
            .update({ status: 'confirmed' })
            .eq('clinic_id', clinicId)
            .eq('patient_id', patient.id)
            .eq('date', tomorrowStr);
        }
        
      } catch (error) {
        console.error('Erro ao confirmar consulta:', error);
      }
    }
  }
}

// Singleton instance
let automationInstance: WhatsAppAutomation | null = null;

export const getWhatsAppAutomation = (): WhatsAppAutomation => {
  if (!automationInstance) {
    automationInstance = new WhatsAppAutomation();
  }
  return automationInstance;
};

