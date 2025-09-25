// Communication Webhooks - Main Export File

// Main Webhook Handler
export { WebhookHandler, defaultWebhookConfig } from './WebhookHandler';
export type { WebhookConfig } from './WebhookHandler';

// Express route helpers for webhook endpoints
import { Router, Request, Response } from 'express';
import { WebhookHandler } from './WebhookHandler';

/**
 * Middleware to capture raw body for signature verification
 */
export function rawBodyMiddleware(req: Request, res: Response, next: Function): void {
  let rawBody = '';

  req.on('data', (chunk) => {
    rawBody += chunk;
  });

  req.on('end', () => {
    (req as any).rawBody = rawBody;
    next();
  });
}

/**
 * Create Express router with webhook endpoints
 */
export function createWebhookRouter(webhookHandler: WebhookHandler): Router {
  const router = Router();

  // Middleware to capture raw body for signature verification
  router.use('/webhooks/*', rawBodyMiddleware);

  // Twilio SMS webhooks
  router.post('/webhooks/twilio/sms/status', (req: Request, res: Response) => {
    webhookHandler.handleTwilioSMSWebhook(req, res);
  });

  // WhatsApp Business API webhooks
  router.post('/webhooks/whatsapp/status', (req: Request, res: Response) => {
    webhookHandler.handleWhatsAppWebhook(req, res);
  });

  // WhatsApp verification endpoint (required by Meta)
  router.get('/webhooks/whatsapp/status', (req: Request, res: Response) => {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    const verifyToken = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN;

    if (mode === 'subscribe' && token === verifyToken) {
      res.status(200).send(challenge);
    } else {
      res.status(403).send('Forbidden');
    }
  });

  // Email provider webhooks (SendGrid, Mailgun, etc.)
  router.post('/webhooks/email/sendgrid', (req: Request, res: Response) => {
    webhookHandler.handleEmailWebhook(req, res);
  });

  router.post('/webhooks/email/mailgun', (req: Request, res: Response) => {
    webhookHandler.handleEmailWebhook(req, res);
  });

  // Push notification webhooks (custom implementations)
  router.post('/webhooks/push/status', (req: Request, res: Response) => {
    webhookHandler.handlePushWebhook(req, res);
  });

  // Generic webhook endpoint for testing
  router.post('/webhooks/test/:provider', async (req: Request, res: Response) => {
    try {
      const provider = req.params.provider;
      const result = await webhookHandler.testWebhook(provider, req.body);

      if (result.success) {
        res.status(200).json({
          success: true,
          message: 'Webhook test successful',
          data: result.webhookData
        });
      } else {
        res.status(400).json({
          success: false,
          error: result.error
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Health check endpoint
  router.get('/webhooks/health', (req: Request, res: Response) => {
    const stats = webhookHandler.getStatistics();
    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      statistics: stats
    });
  });

  return router;
}

/**
 * Webhook event types for type safety
 */
export const WebhookEvents = {
  // Twilio SMS events
  TWILIO_SMS_QUEUED: 'twilio.sms.queued',
  TWILIO_SMS_SENT: 'twilio.sms.sent',
  TWILIO_SMS_DELIVERED: 'twilio.sms.delivered',
  TWILIO_SMS_UNDELIVERED: 'twilio.sms.undelivered',
  TWILIO_SMS_FAILED: 'twilio.sms.failed',

  // WhatsApp Business API events
  WHATSAPP_SENT: 'whatsapp.sent',
  WHATSAPP_DELIVERED: 'whatsapp.delivered',
  WHATSAPP_READ: 'whatsapp.read',
  WHATSAPP_FAILED: 'whatsapp.failed',
  WHATSAPP_MESSAGE_RECEIVED: 'whatsapp.message.received',

  // Email events
  EMAIL_DELIVERED: 'email.delivered',
  EMAIL_OPENED: 'email.opened',
  EMAIL_CLICKED: 'email.clicked',
  EMAIL_BOUNCED: 'email.bounced',
  EMAIL_DROPPED: 'email.dropped',
  EMAIL_SPAM: 'email.spam',
  EMAIL_UNSUBSCRIBED: 'email.unsubscribed',

  // Push notification events
  PUSH_DELIVERED: 'push.delivered',
  PUSH_OPENED: 'push.opened',
  PUSH_FAILED: 'push.failed',
  PUSH_EXPIRED: 'push.expired'
} as const;

/**
 * Webhook signature verification utilities
 */
export class WebhookSignatureVerifier {
  /**
   * Verify Twilio signature
   */
  static verifyTwilioSignature(
    url: string,
    params: Record<string, any>,
    signature: string,
    authToken: string
  ): boolean {
    try {
      const crypto = require('crypto');

      // Build the URL with sorted parameters
      const sortedParams = Object.keys(params)
        .sort()
        .reduce((result, key) => {
          result += key + params[key];
          return result;
        }, url);

      // Generate expected signature
      const expectedSignature = crypto
        .createHmac('sha1', authToken)
        .update(sortedParams)
        .digest('base64');

      return crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expectedSignature)
      );
    } catch (error) {
      return false;
    }
  }

  /**
   * Verify Meta (WhatsApp/Facebook) signature
   */
  static verifyMetaSignature(
    payload: string,
    signature: string,
    appSecret: string
  ): boolean {
    try {
      const crypto = require('crypto');

      const expectedSignature = 'sha256=' + crypto
        .createHmac('sha256', appSecret)
        .update(payload)
        .digest('hex');

      return crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expectedSignature)
      );
    } catch (error) {
      return false;
    }
  }

  /**
   * Verify SendGrid signature
   */
  static verifySendGridSignature(
    payload: string,
    signature: string,
    publicKey: string,
    timestamp: string
  ): boolean {
    try {
      const crypto = require('crypto');

      // SendGrid uses ECDSA verification
      const signedPayload = timestamp + payload;
      const verify = crypto.createVerify('sha256');
      verify.update(signedPayload);

      return verify.verify(publicKey, signature, 'base64');
    } catch (error) {
      return false;
    }
  }

  /**
   * Verify Mailgun signature
   */
  static verifyMailgunSignature(
    timestamp: string,
    token: string,
    signature: string,
    apiKey: string
  ): boolean {
    try {
      const crypto = require('crypto');

      const hmac = crypto.createHmac('sha256', apiKey);
      hmac.update(timestamp + token);
      const expectedSignature = hmac.digest('hex');

      return crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expectedSignature)
      );
    } catch (error) {
      return false;
    }
  }
}

/**
 * Webhook retry utilities
 */
export class WebhookRetryManager {
  private retryQueues = new Map<string, Array<{
    url: string;
    payload: any;
    headers: Record<string, string>;
    attempt: number;
    maxAttempts: number;
    nextRetryAt: Date;
  }>>();

  /**
   * Add webhook to retry queue
   */
  addToRetryQueue(
    webhookId: string,
    url: string,
    payload: any,
    headers: Record<string, string> = {},
    maxAttempts = 3
  ): void {
    if (!this.retryQueues.has(webhookId)) {
      this.retryQueues.set(webhookId, []);
    }

    const queue = this.retryQueues.get(webhookId)!;
    const nextRetryAt = new Date(Date.now() + this.calculateRetryDelay(1));

    queue.push({
      url,
      payload,
      headers,
      attempt: 1,
      maxAttempts,
      nextRetryAt
    });
  }

  /**
   * Process retry queues
   */
  async processRetryQueues(): Promise<void> {
    const now = new Date();

    for (const [webhookId, queue] of this.retryQueues.entries()) {
      const readyItems = queue.filter(item => item.nextRetryAt <= now);

      for (const item of readyItems) {
        try {
          await this.retryWebhookDelivery(item);

          // Remove from queue on success
          const index = queue.indexOf(item);
          if (index > -1) {
            queue.splice(index, 1);
          }
        } catch (error) {
          // Update retry info
          item.attempt++;

          if (item.attempt >= item.maxAttempts) {
            // Remove from queue after max attempts
            const index = queue.indexOf(item);
            if (index > -1) {
              queue.splice(index, 1);
            }
          } else {
            // Schedule next retry
            item.nextRetryAt = new Date(Date.now() + this.calculateRetryDelay(item.attempt));
          }
        }
      }

      // Clean up empty queues
      if (queue.length === 0) {
        this.retryQueues.delete(webhookId);
      }
    }
  }

  /**
   * Calculate retry delay with exponential backoff
   */
  private calculateRetryDelay(attempt: number): number {
    const baseDelay = 1000; // 1 second
    const maxDelay = 300000; // 5 minutes

    const delay = Math.min(baseDelay * Math.pow(2, attempt - 1), maxDelay);

    // Add jitter to prevent thundering herd
    const jitter = Math.random() * 0.1 * delay;

    return delay + jitter;
  }

  /**
   * Retry webhook delivery
   */
  private async retryWebhookDelivery(item: {
    url: string;
    payload: any;
    headers: Record<string, string>;
    attempt: number;
  }): Promise<void> {
    const response = await fetch(item.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...item.headers
      },
      body: JSON.stringify(item.payload),
      timeout: 30000
    });

    if (!response.ok) {
      throw new Error(`Webhook retry failed: ${response.status} ${response.statusText}`);
    }
  }

  /**
   * Get retry queue statistics
   */
  getRetryStats(): {
    totalQueues: number;
    totalPendingRetries: number;
    averageAttempts: number;
  } {
    const totalQueues = this.retryQueues.size;
    const totalPendingRetries = Array.from(this.retryQueues.values())
      .reduce((sum, queue) => sum + queue.length, 0);

    const totalAttempts = Array.from(this.retryQueues.values())
      .flat()
      .reduce((sum, item) => sum + item.attempt, 0);

    const averageAttempts = totalPendingRetries > 0 ? totalAttempts / totalPendingRetries : 0;

    return {
      totalQueues,
      totalPendingRetries,
      averageAttempts
    };
  }
}

/**
 * Webhook testing utilities
 */
export class WebhookTester {
  /**
   * Generate test webhook payload for Twilio SMS
   */
  static generateTwilioSMSPayload(messageId: string, status = 'delivered'): any {
    return {
      MessageSid: `SM${messageId}`,
      MessageStatus: status,
      To: '+5511999999999',
      From: '+5511888888888',
      Body: 'Test message',
      NumSegments: '1',
      Price: '-0.0075',
      PriceUnit: 'USD'
    };
  }

  /**
   * Generate test webhook payload for WhatsApp Business
   */
  static generateWhatsAppPayload(messageId: string, status = 'delivered'): any {
    return {
      object: 'whatsapp_business_account',
      entry: [{
        id: '123456789',
        changes: [{
          value: {
            messaging_product: 'whatsapp',
            metadata: {
              display_phone_number: '5511999999999',
              phone_number_id: '123456789'
            },
            statuses: [{
              id: messageId,
              status: status,
              timestamp: Math.floor(Date.now() / 1000),
              recipient_id: '5511888888888'
            }]
          },
          field: 'messages'
        }]
      }]
    };
  }

  /**
   * Generate test webhook payload for SendGrid
   */
  static generateSendGridPayload(messageId: string, event = 'delivered'): any {
    return [{
      sg_message_id: messageId,
      event: event,
      email: 'test@example.com',
      timestamp: Math.floor(Date.now() / 1000),
      smtp_id: `<${messageId}@sendgrid.com>`,
      category: ['test'],
      ip: '192.168.1.1',
      useragent: 'Mozilla/5.0'
    }];
  }

  /**
   * Generate test webhook payload for Mailgun
   */
  static generateMailgunPayload(messageId: string, event = 'delivered'): any {
    return {
      'message-id': messageId,
      event: event,
      recipient: 'test@example.com',
      timestamp: Math.floor(Date.now() / 1000),
      signature: 'test-signature',
      token: 'test-token'
    };
  }
}

/**
 * Default webhook endpoints configuration
 */
export const defaultWebhookEndpoints = {
  twilio: {
    sms: '/webhooks/twilio/sms/status',
    voice: '/webhooks/twilio/voice/status'
  },
  whatsapp: {
    status: '/webhooks/whatsapp/status',
    verification: '/webhooks/whatsapp/status' // GET endpoint for verification
  },
  email: {
    sendgrid: '/webhooks/email/sendgrid',
    mailgun: '/webhooks/email/mailgun'
  },
  push: {
    status: '/webhooks/push/status'
  },
  test: '/webhooks/test/:provider',
  health: '/webhooks/health'
};

/**
 * Webhook security best practices
 */
export const WebhookSecurity = {
  /**
   * Validate webhook source IP
   */
  validateSourceIP(req: Request, allowedIPs: string[]): boolean {
    const clientIP = req.ip || req.connection.remoteAddress || '';
    return allowedIPs.includes(clientIP);
  },

  /**
   * Check if request is within time window (prevents replay attacks)
   */
  validateTimestamp(timestamp: number, windowMinutes = 5): boolean {
    const now = Math.floor(Date.now() / 1000);
    const diff = Math.abs(now - timestamp);
    return diff <= (windowMinutes * 60);
  },

  /**
   * Sanitize webhook payload for logging
   */
  sanitizePayload(payload: any): any {
    const sanitized = { ...payload };

    // Remove sensitive fields
    const sensitiveFields = [
      'password', 'token', 'key', 'secret', 'auth',
      'credit_card', 'ssn', 'phone', 'email'
    ];

    function sanitizeObject(obj: any): any {
      if (typeof obj !== 'object' || obj === null) return obj;

      const sanitized: any = Array.isArray(obj) ? [] : {};

      for (const [key, value] of Object.entries(obj)) {
        const lowerKey = key.toLowerCase();
        const isSensitive = sensitiveFields.some(field => lowerKey.includes(field));

        if (isSensitive && typeof value === 'string') {
          sanitized[key] = '***REDACTED***';
        } else if (typeof value === 'object') {
          sanitized[key] = sanitizeObject(value);
        } else {
          sanitized[key] = value;
        }
      }

      return sanitized;
    }

    return sanitizeObject(sanitized);
  }
};