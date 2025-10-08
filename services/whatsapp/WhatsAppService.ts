/**
 * WhatsApp Service - Serviço de integração com WhatsApp Business API
 * Activity Fisioterapia Integration - Fase 2
 */

import axios, { AxiosInstance } from 'axios';
import { LeadService } from '@/services/api/crm/leadService';
import { InteractionService } from '@/services/api/crm/interactionService';
import type { Lead } from '@/types/crm';

export interface WhatsAppMessage {
  to: string;
  from?: string;
  body?: string;
  template?: {
    name: string;
    language: string;
    components: any[];
  };
}

export interface WhatsAppWebhook {
  from: string;
  to: string;
  body: string;
  timestamp: string;
  id: string;
  type: string;
}

export interface WhatsAppStatus {
  id: string;
  status: 'sent' | 'delivered' | 'read' | 'failed';
  timestamp: string;
}

export class WhatsAppService {
  private client: AxiosInstance;
  private accountSid: string;
  private authToken: string;
  private whatsappNumber: string;

  constructor() {
    this.accountSid = process.env.TWILIO_ACCOUNT_SID || '';
    this.authToken = process.env.TWILIO_AUTH_TOKEN || '';
    this.whatsappNumber = process.env.TWILIO_WHATSAPP_NUMBER || '';

    if (!this.accountSid || !this.authToken) {
      console.warn('⚠️  Twilio credentials not configured');
    }

    this.client = axios.create({
      baseURL: `https://api.twilio.com/2010-04-01/Accounts/${this.accountSid}`,
      auth: {
        username: this.accountSid,
        password: this.authToken,
      },
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
  }

  /**
   * Verificar se serviço está configurado
   */
  isConfigured(): boolean {
    return Boolean(this.accountSid && this.authToken && this.whatsappNumber);
  }

  /**
   * Enviar mensagem de texto
   */
  async sendMessage(to: string, message: string, clinicId: string): Promise<string> {
    if (!this.isConfigured()) {
      throw new Error('WhatsApp Service não está configurado');
    }

    try {
      // Normalizar número
      const normalizedTo = this.normalizePhoneNumber(to);

      // Enviar via Twilio
      const response = await this.client.post('/Messages.json', new URLSearchParams({
        From: `whatsapp:${this.whatsappNumber}`,
        To: `whatsapp:${normalizedTo}`,
        Body: message,
      }));

      const messageId = response.data.sid;

      // Registrar interação
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

      return messageId;
    } catch (error: any) {
      console.error('Erro ao enviar mensagem WhatsApp:', error);
      throw new Error(`Falha ao enviar mensagem: ${error.message}`);
    }
  }

  /**
   * Enviar mensagem template (aprovado pela Meta)
   */
  async sendTemplateMessage(
    to: string,
    templateName: string,
    variables: string[],
    clinicId: string,
    language = 'pt_BR'
  ): Promise<string> {
    if (!this.isConfigured()) {
      throw new Error('WhatsApp Service não está configurado');
    }

    try {
      const normalizedTo = this.normalizePhoneNumber(to);

      // Construir body da mensagem para Twilio
      // Nota: Twilio usa ContentSid para templates aprovados
      const response = await this.client.post('/Messages.json', new URLSearchParams({
        From: `whatsapp:${this.whatsappNumber}`,
        To: `whatsapp:${normalizedTo}`,
        ContentSid: templateName, // Usar ContentSid do template aprovado
        ContentVariables: JSON.stringify(variables),
      }));

      const messageId = response.data.sid;

      // Registrar interação
      const lead = await LeadService.findLeadByPhone(to, clinicId);
      if (lead) {
        await InteractionService.createInteraction({
          lead_id: lead.id,
          clinic_id: clinicId,
          interaction_type: 'whatsapp',
          direction: 'outbound',
          message_template_name: templateName,
          status: 'sent',
          is_automated: true,
          metadata: { message_id: messageId, variables },
        });
      }

      return messageId;
    } catch (error: any) {
      console.error('Erro ao enviar template WhatsApp:', error);
      throw new Error(`Falha ao enviar template: ${error.message}`);
    }
  }

  /**
   * Processar mensagem recebida (webhook)
   */
  async processIncomingMessage(
    webhook: WhatsAppWebhook,
    clinicId: string
  ): Promise<void> {
    try {
      const from = webhook.from.replace('whatsapp:', '');
      const message = webhook.body;

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
        message_content: message,
        status: 'received',
        is_automated: false,
        metadata: { webhook_id: webhook.id, timestamp: webhook.timestamp },
      });

      // 3. Processar com FlowEngine (se disponível)
      try {
        const { ConversationFlowEngine } = await import('./ConversationFlowEngine');
        const flowEngine = new ConversationFlowEngine(clinicId);
        const response = await flowEngine.processMessage(lead, message);
        
        if (response) {
          await this.sendMessage(from, response, clinicId);
        }
      } catch (err) {
        console.error('FlowEngine não disponível ou erro ao processar:', err);
        // Enviar resposta padrão
        await this.sendMessage(
          from,
          'Olá! Recebemos sua mensagem e em breve retornaremos o contato. 😊',
          clinicId
        );
      }

    } catch (error) {
      console.error('Erro ao processar mensagem recebida:', error);
      throw error;
    }
  }

  /**
   * Processar status de mensagem (webhook de status)
   */
  async processMessageStatus(status: WhatsAppStatus): Promise<void> {
    try {
      // Buscar interação pelo message_id
      // Atualizar status na tabela lead_interactions
      console.log('Status de mensagem recebido:', status);
    } catch (error) {
      console.error('Erro ao processar status:', error);
    }
  }

  /**
   * Agendar mensagem (usar com sistema de filas)
   */
  async scheduleMessage(
    to: string,
    message: string,
    scheduledAt: Date,
    clinicId: string
  ): Promise<void> {
    // Implementação com Bull/BullMQ
    // Por enquanto, placeholder
    console.log(`Mensagem agendada para ${to} em ${scheduledAt}`);
    
    // TODO: Adicionar à fila de mensagens
  }

  /**
   * Normalizar número de telefone para formato E.164
   */
  private normalizePhoneNumber(phone: string): string {
    // Remover caracteres especiais
    let normalized = phone.replace(/\D/g, '');

    // Adicionar código do país se necessário (Brasil = 55)
    if (normalized.length === 11 || normalized.length === 10) {
      normalized = `55${normalized}`;
    }

    // Adicionar + no início
    if (!normalized.startsWith('+')) {
      normalized = `+${normalized}`;
    }

    return normalized;
  }

  /**
   * Verificar se número está registrado no WhatsApp
   */
  async isWhatsAppNumber(phone: string): Promise<boolean> {
    // Implementação futura: verificar via API
    // Por enquanto, assumir que sim
    return true;
  }

  /**
   * Obter histórico de mensagens com um número
   */
  async getMessageHistory(phone: string, limit = 50): Promise<any[]> {
    if (!this.isConfigured()) {
      return [];
    }

    try {
      const normalizedPhone = this.normalizePhoneNumber(phone);
      
      const response = await this.client.get('/Messages.json', {
        params: {
          To: `whatsapp:${normalizedPhone}`,
          Limit: limit,
        },
      });

      return response.data.messages || [];
    } catch (error) {
      console.error('Erro ao buscar histórico:', error);
      return [];
    }
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
    if (!this.isConfigured()) {
      return { sent: 0, delivered: 0, read: 0, failed: 0 };
    }

    try {
      const response = await this.client.get('/Messages.json', {
        params: {
          DateSent: `>=${dateFrom}`,
          DateSent: `<=${dateTo}`,
        },
      });

      const messages = response.data.messages || [];
      
      const metrics = {
        sent: 0,
        delivered: 0,
        read: 0,
        failed: 0,
      };

      messages.forEach((msg: any) => {
        switch (msg.status) {
          case 'sent':
            metrics.sent++;
            break;
          case 'delivered':
            metrics.delivered++;
            break;
          case 'read':
            metrics.read++;
            break;
          case 'failed':
          case 'undelivered':
            metrics.failed++;
            break;
        }
      });

      return metrics;
    } catch (error) {
      console.error('Erro ao buscar métricas:', error);
      return { sent: 0, delivered: 0, read: 0, failed: 0 };
    }
  }
}

// Singleton instance
let whatsAppServiceInstance: WhatsAppService | null = null;

export const getWhatsAppService = (): WhatsAppService => {
  if (!whatsAppServiceInstance) {
    whatsAppServiceInstance = new WhatsAppService();
  }
  return whatsAppServiceInstance;
};

