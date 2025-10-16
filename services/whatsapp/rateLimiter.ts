/**
 * 🚦 Rate Limiter - Controle de taxa de mensagens WhatsApp
 * Evita spam, reduz custos e melhora engajamento
 */

import { supabase } from '../../lib/supabaseClient';
import { whatsappCrmService } from '../crm/whatsappCrmService';

export interface RateLimitConfig {
  maxMessagesPerHour: number;
  maxMessagesPerDay: number;
  minIntervalMinutes: number; // Intervalo mínimo entre mensagens para mesmo número
  priorityByScore: boolean; // Priorizar leads com maior score
}

export interface RateLimitResult {
  allowed: boolean;
  reason?: string;
  retryAfter?: Date;
  currentCount?: number;
  limit?: number;
}

export interface MessageQueueItem {
  id?: string;
  recipient: string;
  message: string;
  lead_id?: string;
  patient_id?: string;
  priority: number;
  scheduled_for: Date;
  status: 'pending' | 'processing' | 'sent' | 'failed';
  created_at?: Date;
  retry_count?: number;
}

/**
 * Configuração padrão
 */
const DEFAULT_CONFIG: RateLimitConfig = {
  maxMessagesPerHour: 30, // 30 mensagens/hora
  maxMessagesPerDay: 200, // 200 mensagens/dia
  minIntervalMinutes: 120, // 2 horas entre mensagens para mesmo número
  priorityByScore: true
};

/**
 * Rate Limiter Service
 */
export class RateLimiterService {
  private config: RateLimitConfig;

  constructor(config: Partial<RateLimitConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Verificar se pode enviar mensagem
   */
  async canSendMessage(
    recipient: string,
    leadId?: string
  ): Promise<RateLimitResult> {
    // 1. Verificar intervalo mínimo para este número
    const lastMessage = await this.getLastMessageTime(recipient);
    if (lastMessage) {
      const minutesSinceLastMessage = 
        (Date.now() - lastMessage.getTime()) / (1000 * 60);

      if (minutesSinceLastMessage < this.config.minIntervalMinutes) {
        const retryAfter = new Date(
          lastMessage.getTime() + this.config.minIntervalMinutes * 60 * 1000
        );

        return {
          allowed: false,
          reason: `Aguardar ${this.config.minIntervalMinutes} minutos entre mensagens para este número`,
          retryAfter,
          currentCount: 0,
          limit: 0
        };
      }
    }

    // 2. Verificar limite por hora
    const messagesLastHour = await this.getMessageCount('hour');
    if (messagesLastHour >= this.config.maxMessagesPerHour) {
      const retryAfter = new Date();
      retryAfter.setHours(retryAfter.getHours() + 1);
      retryAfter.setMinutes(0);
      retryAfter.setSeconds(0);

      return {
        allowed: false,
        reason: 'Limite de mensagens por hora atingido',
        retryAfter,
        currentCount: messagesLastHour,
        limit: this.config.maxMessagesPerHour
      };
    }

    // 3. Verificar limite por dia
    const messagesLastDay = await this.getMessageCount('day');
    if (messagesLastDay >= this.config.maxMessagesPerDay) {
      const retryAfter = new Date();
      retryAfter.setDate(retryAfter.getDate() + 1);
      retryAfter.setHours(8); // Próximo dia às 8h
      retryAfter.setMinutes(0);
      retryAfter.setSeconds(0);

      return {
        allowed: false,
        reason: 'Limite de mensagens por dia atingido',
        retryAfter,
        currentCount: messagesLastDay,
        limit: this.config.maxMessagesPerDay
      };
    }

    // Tudo OK
    return {
      allowed: true,
      currentCount: messagesLastHour,
      limit: this.config.maxMessagesPerHour
    };
  }

  /**
   * Adicionar mensagem à fila
   */
  async queueMessage(item: Omit<MessageQueueItem, 'id' | 'created_at'>): Promise<string> {
    const { data, error } = await supabase
      .from('whatsapp_message_queue')
      .insert({
        recipient: item.recipient,
        message: item.message,
        lead_id: item.lead_id,
        patient_id: item.patient_id,
        priority: item.priority,
        scheduled_for: item.scheduled_for.toISOString(),
        status: item.status || 'pending',
        retry_count: item.retry_count || 0
      })
      .select('id')
      .single();

    if (error) {
      console.error('Erro ao adicionar à fila:', error);
      throw error;
    }

    return data.id;
  }

  /**
   * Buscar próximas mensagens a enviar
   */
  async getNextMessages(limit: number = 10): Promise<MessageQueueItem[]> {
    const { data, error } = await supabase
      .from('whatsapp_message_queue')
      .select('*')
      .eq('status', 'pending')
      .lte('scheduled_for', new Date().toISOString())
      .order('priority', { ascending: false })
      .order('scheduled_for', { ascending: true })
      .limit(limit);

    if (error) {
      console.error('Erro ao buscar fila:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Marcar mensagem como enviada
   */
  async markAsSent(queueId: string): Promise<void> {
    await supabase
      .from('whatsapp_message_queue')
      .update({
        status: 'sent',
        sent_at: new Date().toISOString()
      })
      .eq('id', queueId);
  }

  /**
   * Marcar mensagem como falha e reagendar
   */
  async markAsFailed(queueId: string, error: string): Promise<void> {
    const { data: item } = await supabase
      .from('whatsapp_message_queue')
      .select('retry_count')
      .eq('id', queueId)
      .single();

    const retryCount = (item?.retry_count || 0) + 1;
    const maxRetries = 3;

    if (retryCount >= maxRetries) {
      // Falha definitiva
      await supabase
        .from('whatsapp_message_queue')
        .update({
          status: 'failed',
          error_message: error,
          failed_at: new Date().toISOString()
        })
        .eq('id', queueId);
    } else {
      // Reagendar com exponential backoff
      const delayMinutes = Math.pow(2, retryCount) * 5; // 10min, 20min, 40min
      const nextTry = new Date();
      nextTry.setMinutes(nextTry.getMinutes() + delayMinutes);

      await supabase
        .from('whatsapp_message_queue')
        .update({
          status: 'pending',
          retry_count: retryCount,
          scheduled_for: nextTry.toISOString(),
          error_message: error
        })
        .eq('id', queueId);
    }
  }

  /**
   * Calcular prioridade baseada em lead score
   */
  async calculatePriority(leadId?: string): Promise<number> {
    if (!leadId || !this.config.priorityByScore) {
      return 50; // Prioridade média padrão
    }

    const { data: lead } = await supabase
      .from('leads')
      .select('lead_score, status, urgency_level')
      .eq('id', leadId)
      .single();

    if (!lead) return 50;

    let priority = lead.lead_score || 50;

    // Boost por urgência
    if (lead.urgency_level === 'alta') priority += 20;
    else if (lead.urgency_level === 'media') priority += 10;

    // Boost por status
    if (lead.status === 'qualified') priority += 15;
    else if (lead.status === 'proposal_sent') priority += 10;

    // Normalizar entre 0-100
    return Math.min(100, Math.max(0, priority));
  }

  /**
   * Enviar ou enfileirar mensagem
   */
  async sendOrQueue(
    recipient: string,
    message: string,
    leadId?: string,
    patientId?: string,
    immediate: boolean = false
  ): Promise<{
    queued: boolean;
    queueId?: string;
    canSend: boolean;
    reason?: string;
  }> {
    // Verificar se pode enviar
    const rateLimitCheck = await this.canSendMessage(recipient, leadId);

    if (rateLimitCheck.allowed && immediate) {
      return { queued: false, canSend: true };
    }

    // Enfileirar
    const priority = await this.calculatePriority(leadId);
    const scheduledFor = rateLimitCheck.retryAfter || new Date();

    const queueId = await this.queueMessage({
      recipient,
      message,
      lead_id: leadId,
      patient_id: patientId,
      priority,
      scheduled_for: scheduledFor,
      status: 'pending'
    });

    return {
      queued: true,
      queueId,
      canSend: rateLimitCheck.allowed,
      reason: rateLimitCheck.reason
    };
  }

  /**
   * Processar fila de mensagens
   */
  async processQueue(maxMessages: number = 10): Promise<{
    processed: number;
    sent: number;
    failed: number;
  }> {
    const messages = await this.getNextMessages(maxMessages);
    let sent = 0;
    let failed = 0;

    for (const msg of messages) {
      try {
        // Verificar rate limit novamente antes de enviar
        const canSend = await this.canSendMessage(msg.recipient, msg.lead_id);
        
        if (!canSend.allowed) {
          // Reagendar
          if (msg.id && canSend.retryAfter) {
            await supabase
              .from('whatsapp_message_queue')
              .update({ scheduled_for: canSend.retryAfter.toISOString() })
              .eq('id', msg.id);
          }
          continue;
        }

        // Enviar via serviço de WhatsApp
        const result = await whatsappCrmService.sendMessage({
          to: msg.recipient,
          message: msg.message,
          lead_id: msg.lead_id,
          patient_id: msg.patient_id
        });

        if (result.success && msg.id) {
          await this.markAsSent(msg.id);
          sent++;
        } else if (msg.id) {
          await this.markAsFailed(msg.id, result.error || 'Erro desconhecido');
          failed++;
        }
      } catch (error: any) {
        if (msg.id) {
          await this.markAsFailed(msg.id, error.message);
        }
        failed++;
      }
    }

    return {
      processed: messages.length,
      sent,
      failed
    };
  }

  /**
   * Limpar fila (mensagens antigas)
   */
  async cleanQueue(daysOld: number = 7): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const { data, error } = await supabase
      .from('whatsapp_message_queue')
      .delete()
      .in('status', ['sent', 'failed'])
      .lt('created_at', cutoffDate.toISOString())
      .select('id');

    if (error) {
      console.error('Erro ao limpar fila:', error);
      return 0;
    }

    return data?.length || 0;
  }

  /**
   * Estatísticas da fila
   */
  async getQueueStats(): Promise<{
    pending: number;
    processing: number;
    sent_today: number;
    failed_today: number;
    avg_wait_minutes: number;
  }> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { data } = await supabase
      .from('whatsapp_message_queue')
      .select('status, created_at, sent_at')
      .gte('created_at', today.toISOString());

    const stats = {
      pending: 0,
      processing: 0,
      sent_today: 0,
      failed_today: 0,
      avg_wait_minutes: 0
    };

    let totalWaitTime = 0;
    let sentCount = 0;

    (data || []).forEach((item: any) => {
      switch (item.status) {
        case 'pending':
          stats.pending++;
          break;
        case 'processing':
          stats.processing++;
          break;
        case 'sent':
          stats.sent_today++;
          if (item.sent_at) {
            const waitTime = new Date(item.sent_at).getTime() - new Date(item.created_at).getTime();
            totalWaitTime += waitTime;
            sentCount++;
          }
          break;
        case 'failed':
          stats.failed_today++;
          break;
      }
    });

    if (sentCount > 0) {
      stats.avg_wait_minutes = Math.round((totalWaitTime / sentCount) / (1000 * 60));
    }

    return stats;
  }

  // ===== HELPERS PRIVADOS =====

  /**
   * Buscar última mensagem enviada para um número
   */
  private async getLastMessageTime(recipient: string): Promise<Date | null> {
    const { data } = await supabase
      .from('messages')
      .select('sent_at')
      .eq('channel', 'whatsapp')
      .or(`recipient_id.phone.eq.${recipient},metadata->to.eq.${recipient}`)
      .order('sent_at', { ascending: false })
      .limit(1)
      .single();

    return data?.sent_at ? new Date(data.sent_at) : null;
  }

  /**
   * Contar mensagens enviadas em período
   */
  private async getMessageCount(period: 'hour' | 'day'): Promise<number> {
    const now = new Date();
    const startTime = new Date(now);

    if (period === 'hour') {
      startTime.setHours(startTime.getHours() - 1);
    } else {
      startTime.setHours(0, 0, 0, 0);
    }

    const { count, error } = await supabase
      .from('messages')
      .select('id', { count: 'exact', head: true })
      .eq('channel', 'whatsapp')
      .eq('status', 'sent')
      .gte('sent_at', startTime.toISOString());

    if (error) {
      console.error('Erro ao contar mensagens:', error);
      return 0;
    }

    return count || 0;
  }
}

// Singleton instance
let rateLimiterInstance: RateLimiterService | null = null;

export const getRateLimiter = (config?: Partial<RateLimitConfig>): RateLimiterService => {
  if (!rateLimiterInstance) {
    rateLimiterInstance = new RateLimiterService(config);
  }
  return rateLimiterInstance;
};

export default getRateLimiter;

