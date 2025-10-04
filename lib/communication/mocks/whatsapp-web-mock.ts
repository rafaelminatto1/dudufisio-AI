/**
 * Mock types for whatsapp-web.js library
 * Since the library is not installed, we provide type definitions
 */

export class WhatsAppWebClient {
  constructor(options: any) {}

  async initialize(): Promise<void> {}

  async getState(): Promise<string> {
    return 'CONNECTED';
  }

  async sendMessage(chatId: string, content: string, options?: any): Promise<any> {
    return {
      id: { id: `msg_${Date.now()}` },
      body: content,
      timestamp: Date.now()
    };
  }

  on(event: string, callback: Function): void {}

  async destroy(): Promise<void> {}
}

export class LocalAuth {
  constructor(options?: any) {}
}

export class MessageMedia {
  constructor(mimetype: string, data: string, filename?: string) {}

  static async fromFilePath(filePath: string): Promise<MessageMedia> {
    return new MessageMedia('image/png', '', filePath);
  }
}

export default {
  Client: WhatsAppWebClient,
  LocalAuth,
  MessageMedia
};
