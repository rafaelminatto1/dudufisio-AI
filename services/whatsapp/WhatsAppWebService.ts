/**
 * WhatsApp Web Service - Número Fixo da Clínica
 * DuduFisio-AI - Integração WhatsApp Business com CRM
 *
 * TEMPORARIAMENTE DESABILITADO - Causa erro no Vite build
 *
 * Para reativar, descomente o código e instale: npm install whatsapp-web.js
 */

export class WhatsAppWebService {
  private isReady = false;
  private reconnectAttempts = 0;
  private readonly maxReconnectAttempts = 5;
  private messageQueue: Array<{to: string, message: string, resolve: Function, reject: Function}> = [];
  private isProcessingQueue = false;

  constructor() {
    
  }

  async start(): Promise<void> {
    
  }

  async sendMessage(to: string, message: string): Promise<{
    success: boolean;
    messageId?: string;
    error?: string;
  }> {
    return {
      success: false,
      error: 'WhatsApp Web Service está desabilitado'
    };
  }

  async sendMediaMessage(
    to: string,
    mediaUrl: string,
    caption?: string
  ): Promise<{ success: boolean; error?: string }> {
    return {
      success: false,
      error: 'WhatsApp Web Service está desabilitado'
    };
  }

  isConnected(): boolean {
    return false;
  }

  getInfo() {
    return null;
  }

  getStats() {
    return {
      connected: false,
      queueSize: 0,
      reconnectAttempts: 0
    };
  }

  async stop(): Promise<void> {
    
  }
}

// Singleton instance
let whatsappWebInstance: WhatsAppWebService | null = null;

export function getWhatsAppWebService(): WhatsAppWebService {
  if (!whatsappWebInstance) {
    whatsappWebInstance = new WhatsAppWebService();
  }
  return whatsappWebInstance;
}

export default getWhatsAppWebService;
