/**
 * Meta WhatsApp Service - Serviço de integração com Meta WhatsApp Business API
 * DuduFisio-AI
 */

import axios, { AxiosInstance } from 'axios';
import { LeadService } from '@/services/api/crm/leadService';
import { InteractionService } from '@/services/api/crm/interactionService';
import type { Lead } from '@/types/crm';

export interface MetaWhatsAppMessage {
  to: string;
  type: 'text' | 'template' | 'image' | 'document';
  text?: {
    body: string;
  };
  template?: {
    name: string;
    language: {
      code: string;
    };
    components: any[];
  };
}

export interface MetaWebhookMessage {
  from: string;
  id: string;
  timestamp: string;
  type: 'text' | 'image' | 'document' | 'audio' | 'video';
  text?: {
    body: string;
  };
}

export interface MetaWebhookStatus {
  id: string;
  status: 'sent' | 'delivered' | 'read' | 'failed';
  timestamp: string;
  recipient_id: string;
}

export class MetaWhatsAppService {
  private client: AxiosInstance;
  private phoneNumberId: string;
  private accessToken: string;
  private businessAccountId: string;

  constructor() {
    this.phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID || '';
    this.accessToken = process.env.WHATSAPP_ACCESS_TOKEN || '';
    this.businessAccountId = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID || '';

    if (!this.phoneNumberId || !this.accessToken) {
      console.warn('⚠️  Meta WhatsApp credentials not configured');
    }

    this.client = axios.create({
      baseURL: 'https://graph.facebook.com/v18.0',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Verificar se serviço está configurado
   */
  isConfigured(): boolean {
    return Boolean(this.phoneNumberId && this.accessToken);
  }

  /**
   * Enviar mensagem de texto simples
   */
  async sendTextMessage(
    to: string,
    message: string,
    clinicId: string
  ): Promise<string> {
    if (!this.isConfigured()) {
      throw new Error('Meta WhatsApp Service não configurado');
    }

    try {
      // Formatar número (remover caracteres especiais)
      const formattedTo = to.replace(/\D/g, '');

      const response = await this.client.post(
        `/${this.phoneNumberId}/messages`,
        {
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: formattedTo,
          type: 'text',
          text: {
            body: message,
          },
        }
      );

      const messageId = response.data.messages[0].id;

      // Registrar interação no CRM
      try {
        const lead = await LeadService.findLeadByPhone(to, clinicId);
        if (lead) {
          await InteractionService.createInteraction({
            lead_id: lead.id,
            clinic_id: clinicId,
            interaction_type: 'whatsapp',
            direction: 'outbound',
            message_content: message,
            status: 'sent',
            is_automated: false,
            metadata: { message_id: messageId },
          });
        }
      } catch (err) {
        console.error('Erro ao registrar interação:', err);
      }

      
      return messageId;

    } catch (error: any) {
      console.error('Erro ao enviar mensagem:', error.response?.data || error.message);
      throw new Error(`Falha ao enviar mensagem: ${error.message}`);
    }
  }

  /**
   * Enviar mensagem de template aprovado
   */
  async sendTemplateMessage(
    to: string,
    templateName: string,
    components: any[],
    clinicId: string,
    language = 'pt_BR'
  ): Promise<string> {
    if (!this.isConfigured()) {
      throw new Error('Meta WhatsApp Service não configurado');
    }

    try {
      const formattedTo = to.replace(/\D/g, '');

      const response = await this.client.post(
        `/${this.phoneNumberId}/messages`,
        {
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: formattedTo,
          type: 'template',
          template: {
            name: templateName,
            language: {
              code: language,
            },
            components: components,
          },
        }
      );

      const messageId = response.data.messages[0].id;
      
      return messageId;

    } catch (error: any) {
      console.error('Erro ao enviar template:', error.response?.data || error.message);
      throw new Error(`Falha ao enviar template: ${error.message}`);
    }
  }

  /**
   * Processar mensagem recebida do webhook
   */
  async processIncomingMessage(
    message: MetaWebhookMessage,
    metadata: any,
    clinicId: string
  ): Promise<void> {
    try {
      const from = message.from;
      const messageBody = message.text?.body || '';

      

      // 1. Identificar ou criar lead
      let lead = await LeadService.findLeadByPhone(from, clinicId);
      
      if (!lead) {
        // Criar novo lead
        lead = await LeadService.createLead({
          clinic_id: clinicId,
          name: from, // Será atualizado depois
          phone: from,
          source: 'whatsapp',
          status: 'novo',
          urgency_level: 'media',
        });

        
      }

      // 2. Registrar interação
      await InteractionService.createInteraction({
        lead_id: lead.id,
        clinic_id: clinicId,
        interaction_type: 'whatsapp',
        direction: 'inbound',
        message_content: messageBody,
        status: 'received',
        is_automated: false,
        metadata: {
          message_id: message.id,
          timestamp: message.timestamp,
          type: message.type,
        },
      });

      // 3. Verificar automação por palavra-chave
      try {
        const { getWhatsAppAutomation } = await import('./WhatsAppAutomation');
        const automation = getWhatsAppAutomation();
        
        const autoResponse = await automation.processKeywordAutomation(
          messageBody,
          from,
          clinicId
        );
        
        if (autoResponse) {
          await this.sendTextMessage(from, autoResponse, clinicId);
          return;
        }
      } catch (err) {
        console.error('Erro ao processar automação:', err);
      }

      // 4. Processar com FlowEngine (se disponível)
      try {
        const { ConversationFlowEngine } = await import('./ConversationFlowEngine');
        const flowEngine = new ConversationFlowEngine(clinicId);
        const response = await flowEngine.processMessage(lead, messageBody);
        
        if (response) {
          await this.sendTextMessage(from, response, clinicId);
        }
      } catch (err) {
        console.error('FlowEngine não disponível ou erro ao processar:', err);
        // Enviar resposta padrão
        await this.sendTextMessage(
          from,
          'Olá! Recebemos sua mensagem e em breve retornaremos o contato. 😊\n\n' +
          'Digite *AJUDA* para ver o menu de opções.\n\n' +
          'Horário de atendimento: Segunda a Sexta, 8h às 18h.',
          clinicId
        );
      }

    } catch (error) {
      console.error('❌ Erro ao processar mensagem recebida:', error);
      throw error;
    }
  }

  /**
   * Processar status de mensagem do webhook
   */
  async processMessageStatus(status: MetaWebhookStatus): Promise<void> {
    try {
      

      // Atualizar status no banco de dados
      // Implementar quando necessário

    } catch (error) {
      console.error('❌ Erro ao processar status:', error);
      throw error;
    }
  }

  /**
   * Enviar notificação de agendamento
   */
  async sendAppointmentNotification(
    to: string,
    appointmentData: {
      patientName: string;
      date: string;
      time: string;
      therapistName: string;
    },
    clinicId: string
  ): Promise<string> {
    const message = `🗓️ *Confirmação de Agendamento*\n\n` +
      `Olá ${appointmentData.patientName}!\n\n` +
      `Seu atendimento está confirmado para:\n` +
      `📅 Data: ${appointmentData.date}\n` +
      `🕐 Horário: ${appointmentData.time}\n` +
      `👨‍⚕️ Profissional: ${appointmentData.therapistName}\n\n` +
      `Em caso de imprevistos, entre em contato conosco com antecedência.\n\n` +
      `Até breve! 😊`;

    return this.sendTextMessage(to, message, clinicId);
  }

  /**
   * Enviar lembrete de consulta
   */
  async sendAppointmentReminder(
    to: string,
    appointmentData: {
      patientName: string;
      date: string;
      time: string;
      clinicAddress: string;
    },
    clinicId: string
  ): Promise<string> {
    const message = `⏰ *Lembrete de Consulta*\n\n` +
      `Olá ${appointmentData.patientName}!\n\n` +
      `Lembramos que você tem consulta amanhã:\n` +
      `📅 ${appointmentData.date}\n` +
      `🕐 ${appointmentData.time}\n\n` +
      `📍 Local: ${appointmentData.clinicAddress}\n\n` +
      `Aguardamos você! 🌟`;

    return this.sendTextMessage(to, message, clinicId);
  }

  /**
   * Enviar mensagem de confirmação de presença
   */
  async sendConfirmationRequest(
    to: string,
    appointmentData: {
      patientName: string;
      date: string;
      time: string;
    },
    clinicId: string
  ): Promise<string> {
    const message = `📱 *Confirmação de Presença*\n\n` +
      `Olá ${appointmentData.patientName}!\n\n` +
      `Por favor, confirme sua presença na consulta:\n` +
      `📅 ${appointmentData.date}\n` +
      `🕐 ${appointmentData.time}\n\n` +
      `Responda:\n` +
      `✅ *SIM* para confirmar\n` +
      `❌ *NÃO* para cancelar\n\n` +
      `Aguardamos seu retorno!`;

    return this.sendTextMessage(to, message, clinicId);
  }

  /**
   * Obter histórico de mensagens
   */
  async getMessageHistory(phone: string, limit = 50): Promise<any[]> {
    // Implementar quando necessário
    return [];
  }

  /**
   * Obter métricas de WhatsApp
   */
  async getMetrics(dateFrom: string, dateTo: string): Promise<{
    sent: number;
    delivered: number;
    read: number;
    failed: number;
  }> {
    // Implementar quando necessário
    return { sent: 0, delivered: 0, read: 0, failed: 0 };
  }

  /**
   * Marcar mensagem como lida
   */
  async markAsRead(messageId: string): Promise<void> {
    if (!this.isConfigured()) {
      throw new Error('Meta WhatsApp Service não configurado');
    }

    try {
      await this.client.post(`/${this.phoneNumberId}/messages`, {
        messaging_product: 'whatsapp',
        status: 'read',
        message_id: messageId,
      });

      
    } catch (error: any) {
      console.error('Erro ao marcar mensagem como lida:', error.response?.data || error.message);
    }
  }
}

// Singleton instance
let metaWhatsAppServiceInstance: MetaWhatsAppService | null = null;

export const getMetaWhatsAppService = (): MetaWhatsAppService => {
  if (!metaWhatsAppServiceInstance) {
    metaWhatsAppServiceInstance = new MetaWhatsAppService();
  }
  return metaWhatsAppServiceInstance;
};

