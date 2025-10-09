/**
 * Mock types for whatsapp-web.js library
 * Since the library is not installed, we provide type definitions
 */
export class WhatsAppWebClient {
    constructor(options) { }
    async initialize() { }
    async getState() {
        return 'CONNECTED';
    }
    async sendMessage(chatId, content, options) {
        return {
            id: { id: `msg_${Date.now()}` },
            body: content,
            timestamp: Date.now()
        };
    }
    on(event, callback) { }
    async destroy() { }
}
export class LocalAuth {
    constructor(options) { }
}
export class MessageMedia {
    constructor(mimetype, data, filename) { }
    static async fromFilePath(filePath) {
        return new MessageMedia('image/png', '', filePath);
    }
}
export default {
    Client: WhatsAppWebClient,
    LocalAuth,
    MessageMedia
};
