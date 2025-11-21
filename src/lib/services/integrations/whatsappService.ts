/**
 * Serviço de integração com WhatsApp
 * Suporta WhatsApp Business API e Twilio
 */

interface WhatsAppMessage {
  to: string;
  message: string;
  template?: string;
  variables?: Record<string, string>;
}

interface WhatsAppResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

export class WhatsAppService {
  private provider: 'twilio' | 'whatsapp_business' | 'mock';
  private apiKey?: string;
  private apiSecret?: string;
  private fromNumber?: string;

  constructor() {
    // Detecta provider baseado em variáveis de ambiente
    this.provider = (process.env.WHATSAPP_PROVIDER as any) || 'mock';
    this.apiKey = process.env.WHATSAPP_API_KEY;
    this.apiSecret = process.env.WHATSAPP_API_SECRET;
    this.fromNumber = process.env.WHATSAPP_FROM_NUMBER;
  }

  /**
   * Envia mensagem via WhatsApp
   */
  async sendMessage(data: WhatsAppMessage): Promise<WhatsAppResponse> {
    try {
      switch (this.provider) {
        case 'twilio':
          return await this.sendViaTwilio(data);
        case 'whatsapp_business':
          return await this.sendViaWhatsAppBusiness(data);
        case 'mock':
        default:
          return await this.sendViaMock(data);
      }
    } catch (error) {
      console.error('Erro ao enviar WhatsApp:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      };
    }
  }

  /**
   * Envia via Twilio
   */
  private async sendViaTwilio(data: WhatsAppMessage): Promise<WhatsAppResponse> {
    if (!this.apiKey || !this.apiSecret || !this.fromNumber) {
      throw new Error('Credenciais Twilio não configuradas');
    }

    // TODO: Implementar chamada real à API Twilio
    console.log('[Twilio Mock] Enviando WhatsApp:', data);
    return {
      success: true,
      messageId: `twilio-${Date.now()}`,
    };
  }

  /**
   * Envia via WhatsApp Business API
   */
  private async sendViaWhatsAppBusiness(data: WhatsAppMessage): Promise<WhatsAppResponse> {
    if (!this.apiKey) {
      throw new Error('Token WhatsApp Business não configurado');
    }

    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    if (!phoneNumberId) {
      throw new Error('WHATSAPP_PHONE_NUMBER_ID não configurado');
    }

    // Normaliza número de telefone (remove caracteres especiais)
    const toNumber = data.to.replace(/\D/g, '');
    
    try {
      const response = await fetch(
        `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            to: toNumber,
            type: 'text',
            text: { body: data.message },
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `WhatsApp API error: ${response.status} - ${JSON.stringify(errorData)}`
        );
      }

      const result = await response.json();
      
      return {
        success: true,
        messageId: result.messages?.[0]?.id || `wa-${Date.now()}`,
      };
    } catch (error) {
      console.error('Erro ao enviar WhatsApp via Business API:', error);
      throw error;
    }
  }

  /**
   * Mock para desenvolvimento
   */
  private async sendViaMock(data: WhatsAppMessage): Promise<WhatsAppResponse> {
    console.log('[WhatsApp Mock] Enviando para', data.to, ':', data.message);
    return {
      success: true,
      messageId: `mock-${Date.now()}`,
    };
  }

  /**
   * Envia template do WhatsApp Business
   */
  async sendTemplate(template: string, to: string, variables: Record<string, string>): Promise<WhatsAppResponse> {
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    if (!phoneNumberId) {
      throw new Error('WHATSAPP_PHONE_NUMBER_ID não configurado');
    }

    if (!this.apiKey) {
      throw new Error('Token WhatsApp Business não configurado');
    }

    // Normaliza número de telefone
    const toNumber = to.replace(/\D/g, '');

    try {
      // Converte variáveis para formato do WhatsApp Business API
      const components = Object.entries(variables).map(([key, value], index) => ({
        type: 'text',
        parameters: [
          {
            type: 'text',
            text: value,
          },
        ],
      }));

      const response = await fetch(
        `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            to: toNumber,
            type: 'template',
            template: {
              name: template,
              language: { code: 'pt_BR' },
              components: components.length > 0 ? [{ type: 'body', parameters: components }] : undefined,
            },
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `WhatsApp Template API error: ${response.status} - ${JSON.stringify(errorData)}`
        );
      }

      const result = await response.json();
      
      return {
        success: true,
        messageId: result.messages?.[0]?.id || `wa-template-${Date.now()}`,
      };
    } catch (error) {
      console.error('Erro ao enviar template WhatsApp:', error);
      throw error;
    }
  }
}

export const whatsappService = new WhatsAppService();
