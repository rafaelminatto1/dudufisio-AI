import { v4 as uuidv4 } from 'uuid';

type WebhookEvent = 
  | 'material.created'
  | 'material.updated'
  | 'material.deleted'
  | 'material.published'
  | 'material.archived'
  | 'comment.created'
  | 'comment.resolved'
  | 'collaborator.added'
  | 'collaborator.removed'
  | 'version.created'
  | 'share.created';

interface Webhook {
  id: string;
  url: string;
  events: WebhookEvent[];
  secret?: string;
  isActive: boolean;
  createdBy: string;
  createdAt: string;
  lastTriggeredAt?: string;
  failureCount: number;
}

interface WebhookPayload {
  event: WebhookEvent;
  timestamp: string;
  data: Record<string, any>;
  webhookId: string;
}

interface WebhookDelivery {
  id: string;
  webhookId: string;
  event: WebhookEvent;
  payload: WebhookPayload;
  status: 'pending' | 'success' | 'failed' | 'retrying';
  statusCode?: number;
  responseBody?: string;
  error?: string;
  attempts: number;
  createdAt: string;
  deliveredAt?: string;
}

class MaterialWebhookService {
  private webhooks: Webhook[] = [];
  private deliveries: WebhookDelivery[] = [];
  private maxRetries = 3;
  private retryDelays = [1000, 5000, 15000]; // ms

  // Registrar novo webhook
  async registerWebhook(
    url: string,
    events: WebhookEvent[],
    secret: string | undefined,
    createdBy: string
  ): Promise<Webhook> {
    // Validar URL
    try {
      new URL(url);
    } catch (error) {
      throw new Error('URL inválida');
    }

    const webhook: Webhook = {
      id: uuidv4(),
      url,
      events,
      secret,
      isActive: true,
      createdBy,
      createdAt: new Date().toISOString(),
      failureCount: 0,
    };

    this.webhooks.push(webhook);
    return webhook;
  }

  // Listar webhooks
  async listWebhooks(): Promise<Webhook[]> {
    return [...this.webhooks];
  }

  // Obter webhook por ID
  async getWebhook(id: string): Promise<Webhook | null> {
    return this.webhooks.find(w => w.id === id) || null;
  }

  // Atualizar webhook
  async updateWebhook(
    id: string,
    updates: Partial<Pick<Webhook, 'url' | 'events' | 'secret' | 'isActive'>>
  ): Promise<Webhook | null> {
    const index = this.webhooks.findIndex(w => w.id === id);
    if (index === -1) return null;

    this.webhooks[index] = {
      ...this.webhooks[index],
      ...updates,
    };

    return this.webhooks[index];
  }

  // Deletar webhook
  async deleteWebhook(id: string): Promise<boolean> {
    const index = this.webhooks.findIndex(w => w.id === id);
    if (index === -1) return false;

    this.webhooks.splice(index, 1);
    return true;
  }

  // Disparar evento (enviar para webhooks registrados)
  async triggerEvent(event: WebhookEvent, data: Record<string, any>): Promise<void> {
    const relevantWebhooks = this.webhooks.filter(
      w => w.isActive && w.events.includes(event)
    );

    for (const webhook of relevantWebhooks) {
      const payload: WebhookPayload = {
        event,
        timestamp: new Date().toISOString(),
        data,
        webhookId: webhook.id,
      };

      // Criar delivery
      const delivery: WebhookDelivery = {
        id: uuidv4(),
        webhookId: webhook.id,
        event,
        payload,
        status: 'pending',
        attempts: 0,
        createdAt: new Date().toISOString(),
      };

      this.deliveries.push(delivery);

      // Enviar webhook (com retry)
      this.sendWebhook(delivery, webhook);
    }
  }

  // Enviar webhook com retry
  private async sendWebhook(delivery: WebhookDelivery, webhook: Webhook): Promise<void> {
    try {
      const response = await this.makeWebhookRequest(webhook, delivery.payload);

      if (response.ok) {
        delivery.status = 'success';
        delivery.statusCode = response.status;
        delivery.responseBody = await response.text();
        delivery.deliveredAt = new Date().toISOString();
        
        webhook.lastTriggeredAt = new Date().toISOString();
        webhook.failureCount = 0;
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      delivery.attempts++;
      delivery.error = error instanceof Error ? error.message : 'Erro desconhecido';

      if (delivery.attempts < this.maxRetries) {
        delivery.status = 'retrying';
        const delay = this.retryDelays[delivery.attempts - 1] || 15000;
        
        // Agendar retry
        setTimeout(() => {
          this.sendWebhook(delivery, webhook);
        }, delay);
      } else {
        delivery.status = 'failed';
        webhook.failureCount++;

        // Desativar webhook após muitas falhas consecutivas
        if (webhook.failureCount >= 10) {
          webhook.isActive = false;
          console.warn(`Webhook ${webhook.id} desativado após ${webhook.failureCount} falhas consecutivas`);
        }
      }
    }
  }

  // Fazer requisição HTTP para o webhook
  private async makeWebhookRequest(webhook: Webhook, payload: WebhookPayload): Promise<Response> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'User-Agent': 'DuduFisio-Webhook/1.0',
    };

    // Adicionar signature se houver secret
    if (webhook.secret) {
      const signature = await this.generateSignature(payload, webhook.secret);
      headers['X-Webhook-Signature'] = signature;
    }

    return fetch(webhook.url, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });
  }

  // Gerar assinatura HMAC
  private async generateSignature(payload: WebhookPayload, secret: string): Promise<string> {
    // Em produção, usar crypto.subtle ou biblioteca como crypto-js
    // Por enquanto, retornar um hash simples
    const data = JSON.stringify(payload);
    return btoa(`${secret}:${data}`); // Base64 simplificado
  }

  // Obter histórico de entregas
  async getDeliveryHistory(webhookId?: string, limit: number = 50): Promise<WebhookDelivery[]> {
    let deliveries = [...this.deliveries];

    if (webhookId) {
      deliveries = deliveries.filter(d => d.webhookId === webhookId);
    }

    return deliveries
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  }

  // Reenviar delivery falhada
  async retryDelivery(deliveryId: string): Promise<boolean> {
    const delivery = this.deliveries.find(d => d.id === deliveryId);
    if (!delivery) return false;

    const webhook = await this.getWebhook(delivery.webhookId);
    if (!webhook?.isActive) return false;

    delivery.status = 'pending';
    delivery.attempts = 0;
    delivery.error = undefined;

    this.sendWebhook(delivery, webhook);
    return true;
  }

  // Obter estatísticas
  async getWebhookStatistics(webhookId: string): Promise<{
    totalDeliveries: number;
    successfulDeliveries: number;
    failedDeliveries: number;
    pendingDeliveries: number;
    successRate: number;
    averageResponseTime: number;
  }> {
    const deliveries = this.deliveries.filter(d => d.webhookId === webhookId);

    const totalDeliveries = deliveries.length;
    const successfulDeliveries = deliveries.filter(d => d.status === 'success').length;
    const failedDeliveries = deliveries.filter(d => d.status === 'failed').length;
    const pendingDeliveries = deliveries.filter(d => d.status === 'pending' || d.status === 'retrying').length;

    const successRate = totalDeliveries > 0
      ? (successfulDeliveries / totalDeliveries) * 100
      : 0;

    // Calcular tempo médio de resposta
    const successfulWithTime = deliveries.filter(d => d.status === 'success' && d.deliveredAt);
    const totalTime = successfulWithTime.reduce((sum, d) => {
      const created = new Date(d.createdAt).getTime();
      const delivered = new Date(d.deliveredAt!).getTime();
      return sum + (delivered - created);
    }, 0);

    const averageResponseTime = successfulWithTime.length > 0
      ? totalTime / successfulWithTime.length
      : 0;

    return {
      totalDeliveries,
      successfulDeliveries,
      failedDeliveries,
      pendingDeliveries,
      successRate,
      averageResponseTime,
    };
  }

  // Testar webhook
  async testWebhook(webhookId: string): Promise<boolean> {
    const webhook = await this.getWebhook(webhookId);
    if (!webhook) return false;

    await this.triggerEvent('material.created', {
      test: true,
      message: 'Este é um evento de teste',
      timestamp: new Date().toISOString(),
    });

    return true;
  }

  // Limpar entregas antigas
  async pruneOldDeliveries(days: number = 30): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const oldCount = this.deliveries.length;
    this.deliveries = this.deliveries.filter(
      d => new Date(d.createdAt) >= cutoffDate
    );

    return oldCount - this.deliveries.length;
  }
}

export const materialWebhookService = new MaterialWebhookService();
export default materialWebhookService;

