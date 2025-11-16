/**
 * Meta WhatsApp Service - Serviço de integração com Meta WhatsApp Business API
 * MoocaFisio-AI
 */

import axios, { AxiosInstance } from 'axios';
import type { SupabaseClient } from '@supabase/supabase-js';
import { LeadService } from '@/services/api/crm/leadService';
import { InteractionService } from '@/services/api/crm/interactionService';
import type { Lead } from '@/types/crm';
import { getSupabaseAdminClient } from '@/lib/supabaseAdminClient';
import { WhatsAppSchedulingService } from './WhatsAppSchedulingService';

type WhatsAppMessageCategory =
  | 'reminder'
  | 'confirmation'
  | 'cancellation'
  | 'reschedule'
  | 'info';

interface MessageContext {
  clinicId?: string | null;
  appointmentId?: string | null;
  patientId?: string | null;
  category?: WhatsAppMessageCategory;
  template?: string | null;
  preview?: string | null;
  metadata?: Record<string, unknown>;
  status?: string;
  sentAt?: string;
}

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

const CONFIRMATION_KEYWORDS = new Set(['SIM', 'S', 'OK', 'CONFIRMO', 'CONFIRMAR', '1', '✅']);
const CANCELLATION_KEYWORDS = new Set(['NAO', 'NÃO', 'N', 'CANCELAR', '0', '❌']);
const RESCHEDULE_KEYWORDS = new Set(['REAGENDAR', 'R', 'MUDAR', 'TROCAR', '2', '🔄']);
const SLOT_SELECTION_REGEX = /^[1-5]$/;

const normalizeKeyword = (value: string): string =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toUpperCase();

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
  private supabaseAdmin: SupabaseClient | null = null;

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

  private getSupabaseAdmin(): SupabaseClient | null {
    if (this.supabaseAdmin) {
      return this.supabaseAdmin;
    }

    this.supabaseAdmin = getSupabaseAdminClient();
    return this.supabaseAdmin;
  }

  private async logMessage(
    payload: {
      direction: 'outbound' | 'inbound';
      body: string;
      whatsappMessageId?: string | null;
      deliveredAt?: string | null;
      readAt?: string | null;
      repliedAt?: string | null;
      messageType?: WhatsAppMessageCategory;
      status?: string;
      channel?: string;
      sentAt?: string;
    } & MessageContext
  ): Promise<void> {
    const client = this.getSupabaseAdmin();
    if (!client) {
      return;
    }

    const {
      direction,
      body,
      whatsappMessageId,
      deliveredAt,
      readAt,
      repliedAt,
      clinicId = null,
      appointmentId = null,
      patientId = null,
      category,
      template = null,
      preview,
      metadata,
      status,
      sentAt,
      channel,
      messageType: explicitMessageType,
    } = payload;

    const messageType = category ?? explicitMessageType ?? 'info';
    const normalizedStatus =
      status ?? (direction === 'outbound' ? 'sent' : 'processed');
    const sentAtIso = sentAt ?? new Date().toISOString();

    const payloadData: Record<string, unknown> = {
      ...(metadata ?? {}),
      preview: preview ?? body.slice(0, 140),
    };

    if (template) {
      payloadData.template = template;
    }

    try {
      await client.from('whatsapp_messages').insert({
        clinic_id: clinicId,
        appointment_id: appointmentId,
        patient_id: patientId,
        direction,
        channel: channel ?? 'whatsapp',
        message_type: messageType,
        message: body,
        message_id: whatsappMessageId ?? null,
        status: normalizedStatus,
        payload: payloadData,
        sent_at: sentAtIso,
        delivered_at: deliveredAt ?? null,
        read_at: readAt ?? null,
        replied_at: repliedAt ?? null,
      });
    } catch (error) {
      console.error('Erro ao registrar mensagem no log do WhatsApp:', error);
    }
  }

  private buildReminderMessage({
    patientName,
    dateFormatted,
    timeFormatted,
    therapistName,
    clinicAddress,
    clinicName,
    reminderType,
  }: {
    patientName: string;
    dateFormatted: string;
    timeFormatted: string;
    therapistName?: string;
    clinicAddress?: string;
    clinicName?: string;
    reminderType?: '7d' | '24h' | '2h';
  }): string {
    const clinicLabel = clinicName ?? 'Sua equipe DuduFisio';
    const addressLabel = clinicAddress ?? 'Clínica DuduFisio';

    let opening = 'Lembrete da sua sessão de fisioterapia:';
    if (reminderType === '7d') {
      opening = 'Falta 1 semana para a sua sessão de fisioterapia:';
    } else if (reminderType === '2h') {
      opening = 'Faltam 2 horas para a sua sessão de fisioterapia:';
    }

    return `Olá ${patientName}! 👋

${opening}

📅 Data: ${dateFormatted}
🕐 Horário: ${timeFormatted}
👨‍⚕️ Profissional: ${therapistName ?? 'Fisioterapeuta da equipe'}
📍 Local: ${addressLabel}

Para confirmar, responda:
✅ SIM - Confirmar presença
❌ NÃO - Cancelar
🔄 REAGENDAR - Escolher nova data

Até breve! 💪
${clinicLabel}`;
  }

  private buildConfirmationPrompt({
    patientName,
    dateFormatted,
    timeFormatted,
    clinicName,
  }: {
    patientName: string;
    dateFormatted: string;
    timeFormatted: string;
    clinicName?: string;
  }): string {
    const clinicLabel = clinicName ?? 'Clínica DuduFisio';
    return `📱 *Confirmação de Presença*

Olá ${patientName}! 👋

Confirme sua presença na sessão:
📅 ${dateFormatted}
🕐 ${timeFormatted}

Responda:
✅ *SIM* para confirmar
❌ *NÃO* para cancelar
🔄 *REAGENDAR* para escolher outro horário

${clinicLabel}`;
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
    clinicId?: string,
    context: MessageContext = {}
  ): Promise<string> {
    if (!this.isConfigured()) {
      throw new Error('Meta WhatsApp Service não configurado');
    }

    try {
      // Formatar número (remover caracteres especiais)
      const formattedTo = to.replace(/\D/g, '');
      const resolvedClinicId = context.clinicId ?? clinicId ?? 'default-clinic';

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
        const lead = await LeadService.findLeadByPhone(to, resolvedClinicId);
        if (lead) {
          await InteractionService.createInteraction({
            lead_id: lead.id,
            clinic_id: resolvedClinicId,
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

      await this.logMessage({
        direction: 'outbound',
        body: message,
        clinicId: context.clinicId ?? clinicId ?? null,
        appointmentId: context.appointmentId ?? null,
        patientId: context.patientId ?? null,
        category: context.category ?? 'info',
        template: context.template ?? null,
        preview: context.preview ?? message.slice(0, 140),
        whatsappMessageId: messageId,
        metadata: {
          phone: formattedTo,
          ...(context.metadata ?? {}),
        },
        status: context.status ?? 'sent',
        sentAt: context.sentAt ?? new Date().toISOString(),
      });

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
      const rawBody = message.text?.body ?? '';
      const trimmedBody = rawBody.trim();
      const normalizedBody = normalizeKeyword(trimmedBody);
      const timestampIso = message.timestamp
        ? new Date(Number(message.timestamp) * 1000).toISOString()
        : new Date().toISOString();
      const sanitizedPhone = from.replace(/\D/g, '');

      const isSlotSelection = SLOT_SELECTION_REGEX.test(normalizedBody);
      const isConfirmation = CONFIRMATION_KEYWORDS.has(normalizedBody);
      const isCancellation = CANCELLATION_KEYWORDS.has(normalizedBody);
      const isReschedule = RESCHEDULE_KEYWORDS.has(normalizedBody);

      let messageCategory: WhatsAppMessageCategory = 'info';
      if (isConfirmation) {
        messageCategory = 'confirmation';
      } else if (isCancellation) {
        messageCategory = 'cancellation';
      } else if (isReschedule || isSlotSelection) {
        messageCategory = 'reschedule';
      }

      const client = this.getSupabaseAdmin();

      let patientRecord: { id: string; name: string | null; clinic_id: string | null } | null = null;
      let appointmentRecord: { id: string; start_time: string; status: string | null; therapist_id: string | null } | null = null;

      if (client) {
        const phoneCandidates = new Set<string>();
        if (sanitizedPhone) {
          phoneCandidates.add(sanitizedPhone);
          phoneCandidates.add(`+${sanitizedPhone}`);
        }

        let patientQuery = client
          .from('patients')
          .select('id, name, clinic_id')
          .eq('clinic_id', clinicId)
          .limit(1);

        if (phoneCandidates.size > 0) {
          patientQuery = patientQuery.or(
            Array.from(phoneCandidates)
              .map(value => `phone.eq.${value}`)
              .join(',')
          );
        }

        const { data: patientData } = await patientQuery.maybeSingle();
        patientRecord = patientData ?? null;

        if (patientRecord) {
          const timeThreshold = new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString();
          const { data: appointmentData } = await client
            .from('appointments')
            .select('id, start_time, status, therapist_id')
            .eq('patient_id', patientRecord.id)
            .in('status', ['scheduled', 'confirmed', 'rescheduled'])
            .gte('start_time', timeThreshold)
            .order('start_time', { ascending: true })
            .limit(1)
            .maybeSingle();

          appointmentRecord = appointmentData ?? null;
        }
      }

      const resolvedClinicId = patientRecord?.clinic_id ?? clinicId;

      let lead: Lead | null = null;
      try {
        lead = await LeadService.findLeadByPhone(from, resolvedClinicId);
        if (!lead && sanitizedPhone) {
          lead = await LeadService.findLeadByPhone(sanitizedPhone, resolvedClinicId);
        }
        if (!lead) {
          lead = await LeadService.createLead({
            clinic_id: resolvedClinicId,
            name: patientRecord?.name ?? from,
            phone: sanitizedPhone || from,
            source: 'whatsapp',
            urgency_level: 'media',
          });
        }
      } catch (leadError) {
        console.error('Erro ao garantir lead para WhatsApp:', leadError);
      }

      await this.logMessage({
        direction: 'inbound',
        body: rawBody,
        clinicId: resolvedClinicId,
        appointmentId: appointmentRecord?.id ?? null,
        patientId: patientRecord?.id ?? null,
        whatsappMessageId: message.id,
        category: messageCategory,
        status: 'processed',
        sentAt: timestampIso,
        repliedAt: timestampIso,
        metadata: {
          phone: from,
          sanitized_phone: sanitizedPhone,
          meta: metadata,
          lead_id: lead?.id,
        },
      });

      if (lead) {
        await InteractionService.createInteraction({
          lead_id: lead.id,
          clinic_id: resolvedClinicId,
          interaction_type: 'whatsapp',
          direction: 'inbound',
          message_content: rawBody,
          status: 'received',
          is_automated: false,
          metadata: {
            message_id: message.id,
            timestamp: message.timestamp,
            type: message.type,
          },
        });
      }

      if (!client) {
        return;
      }

      if (isConfirmation && appointmentRecord) {
        const nowIso = new Date().toISOString();

        await client
          .from('appointments')
          .update({
            status: 'confirmed',
            confirmed: true,
            confirmed_at: nowIso,
            whatsapp_conversation_id: message.id,
          })
          .eq('id', appointmentRecord.id);

        await this.sendTextMessage(
          from,
          'Sessão confirmada com sucesso! ✅\n\nNos vemos em breve! 💪',
          resolvedClinicId,
          {
            clinicId: resolvedClinicId,
            appointmentId: appointmentRecord.id,
            patientId: patientRecord?.id ?? null,
            category: 'confirmation',
            metadata: {
              source: 'whatsapp_auto_confirmation',
            },
          }
        );

        return;
      }

      if (isCancellation && appointmentRecord) {
        const nowIso = new Date().toISOString();
        const sessionDate = new Date(appointmentRecord.start_time);
        const dateStr = sessionDate.toLocaleDateString('pt-BR');
        const timeStr = sessionDate.toLocaleTimeString('pt-BR', {
          hour: '2-digit',
          minute: '2-digit',
        });

        await client
          .from('appointments')
          .update({
            status: 'cancelled',
            cancelled_at: nowIso,
            cancelled_by: 'patient',
            cancellation_reason: 'cancelled_via_whatsapp',
            confirmed: false,
            confirmed_at: null,
            whatsapp_conversation_id: message.id,
          })
          .eq('id', appointmentRecord.id);

        await this.sendTextMessage(
          from,
          `Sessão cancelada com sucesso. ❌\n\nHorário ${dateStr} às ${timeStr} foi liberado.\n\nDeseja reagendar? Responda: REAGENDAR`,
          resolvedClinicId,
          {
            clinicId: resolvedClinicId,
            appointmentId: appointmentRecord.id,
            patientId: patientRecord?.id ?? null,
            category: 'cancellation',
            metadata: {
              source: 'whatsapp_auto_cancellation',
            },
          }
        );

        return;
      }

      if (isReschedule) {
        if (appointmentRecord) {
          await client
            .from('appointments')
            .update({
              status: 'rescheduled',
              confirmed: false,
              confirmed_at: null,
              whatsapp_conversation_id: message.id,
            })
            .eq('id', appointmentRecord.id);
        }

        try {
          const schedulingService = new WhatsAppSchedulingService();
          await schedulingService.startSchedulingProcess(
            from,
            patientRecord?.name ?? from,
            resolvedClinicId
          );
        } catch (scheduleError) {
          console.error('Erro ao iniciar reagendamento via WhatsApp:', scheduleError);
          await this.sendTextMessage(
            from,
            'Não consegui localizar horários disponíveis agora. Nossa equipe entrará em contato para reagendar. 😊',
            resolvedClinicId,
            {
              clinicId: resolvedClinicId,
              appointmentId: appointmentRecord?.id ?? null,
              patientId: patientRecord?.id ?? null,
              category: 'reschedule',
              metadata: {
                source: 'whatsapp_auto_reschedule_fallback',
              },
            }
          );
        }

        return;
      }

      if (isSlotSelection) {
        try {
          const schedulingService = new WhatsAppSchedulingService();
          await schedulingService.processSlotSelection(
            from,
            trimmedBody,
            resolvedClinicId
          );
        } catch (slotError) {
          console.error('Erro ao processar seleção de horário via WhatsApp:', slotError);
          await this.sendTextMessage(
            from,
            'Ops! Não consegui processar sua escolha. Digite *REAGENDAR* para receber as opções novamente.',
            resolvedClinicId,
            {
              clinicId: resolvedClinicId,
              appointmentId: appointmentRecord?.id ?? null,
              patientId: patientRecord?.id ?? null,
              category: 'reschedule',
              metadata: {
                source: 'whatsapp_slot_selection_error',
              },
            }
          );
        }

        return;
      }

      // 3. Verificar automação por palavra-chave
      try {
        const { getWhatsAppAutomation } = await import('./WhatsAppAutomation');
        const automation = getWhatsAppAutomation();

        const autoResponse = await automation.processKeywordAutomation(
          rawBody,
          from,
          resolvedClinicId
        );

        if (autoResponse) {
          await this.sendTextMessage(from, autoResponse, resolvedClinicId);
          return;
        }
      } catch (err) {
        console.error('Erro ao processar automação:', err);
      }

      // 4. Processar com FlowEngine (se disponível)
      try {
        const { ConversationFlowEngine } = await import('./ConversationFlowEngine');
        const flowEngine = new ConversationFlowEngine(resolvedClinicId);
        const response = await flowEngine.processMessage(lead, rawBody);

        if (response) {
          await this.sendTextMessage(from, response, resolvedClinicId);
        }
      } catch (err) {
        console.error('FlowEngine não disponível ou erro ao processar:', err);
        // Enviar resposta padrão
        await this.sendTextMessage(
          from,
          'Olá! Recebemos sua mensagem e em breve retornaremos o contato. 😊\n\n' +
          'Digite *AJUDA* para ver o menu de opções.\n\n' +
          'Horário de atendimento: Segunda a Sexta, 8h às 18h.',
          resolvedClinicId
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
      const client = this.getSupabaseAdmin();
      if (!client) {
        return;
      }

      const timestampIso = status.timestamp
        ? new Date(Number(status.timestamp) * 1000).toISOString()
        : new Date().toISOString();

      const normalizedStatus: 'pending' | 'sent' | 'delivered' | 'read' | 'failed' | 'processed' =
        status.status === 'failed'
          ? 'failed'
          : status.status === 'delivered'
            ? 'delivered'
            : status.status === 'read'
              ? 'read'
              : 'sent';

      const updates: Record<string, unknown> = {
        status: normalizedStatus,
        updated_at: timestampIso,
      };

      if (normalizedStatus === 'sent') {
        updates.sent_at = timestampIso;
      }

      if (normalizedStatus === 'delivered') {
        updates.delivered_at = timestampIso;
      }

      if (normalizedStatus === 'read') {
        updates.read_at = timestampIso;
      }

      await client
        .from('whatsapp_messages')
        .update(updates)
        .eq('message_id', status.id);

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
      clinicAddress?: string;
      clinicName?: string;
      therapistName?: string;
      reminderType?: '7d' | '24h' | '2h';
    },
    clinicId?: string,
    context: MessageContext = {}
  ): Promise<string> {
    const message = this.buildReminderMessage({
      patientName: appointmentData.patientName,
      dateFormatted: appointmentData.date,
      timeFormatted: appointmentData.time,
      therapistName: appointmentData.therapistName,
      clinicAddress: appointmentData.clinicAddress,
      clinicName: appointmentData.clinicName,
      reminderType: appointmentData.reminderType,
    });

    return this.sendTextMessage(to, message, clinicId, {
      ...context,
      category: context.category ?? 'reminder',
      preview: context.preview ?? message.slice(0, 140),
      metadata: {
        ...(context.metadata ?? {}),
        reminder_type: appointmentData.reminderType ?? 'custom',
      },
    });
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
      clinicName?: string;
    },
    clinicId?: string,
    context: MessageContext = {}
  ): Promise<string> {
    const message = this.buildConfirmationPrompt({
      patientName: appointmentData.patientName,
      dateFormatted: appointmentData.date,
      timeFormatted: appointmentData.time,
      clinicName: appointmentData.clinicName,
    });

    return this.sendTextMessage(to, message, clinicId, {
      ...context,
      category: context.category ?? 'confirmation',
      preview: context.preview ?? message.slice(0, 140),
    });
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

