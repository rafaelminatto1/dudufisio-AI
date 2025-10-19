/**
 * Mock do WhatsApp Web Service para desenvolvimento
 * Evita erros de build do Vite com whatsapp-web.js
 */

export class WhatsAppWebService {
  private isReady = false;

  constructor() {
    console.log('🚀 WhatsApp Web Service (MOCK) - Desenvolvimento');
    this.isReady = false;
  }

  async initialize(): Promise<void> {
    
    return Promise.resolve();
  }

  async sendMessage(to: string, message: string): Promise<any> {
    
    return Promise.resolve({ success: false, mock: true });
  }

  async sendTemplateMessage(to: string, templateName: string, params: any[]): Promise<any> {
    
    return Promise.resolve({ success: false, mock: true });
  }

  async sendMediaMessage(to: string, mediaUrl: string, caption: string): Promise<any> {
    
    return Promise.resolve({ success: false, mock: true });
  }

  getStatus(): { isReady: boolean; isAuthenticated: boolean } {
    return {
      isReady: this.isReady,
      isAuthenticated: false
    };
  }

  async disconnect(): Promise<void> {
    
    return Promise.resolve();
  }
}

