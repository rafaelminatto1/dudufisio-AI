/**
 * WhatsApp Web Service - Número Fixo da Clínica
 * DuduFisio-AI - Integração WhatsApp Business com CRM
 * 
 * Usa whatsapp-web.js para automação gratuita com número business
 * Economia de 60-70% vs WhatsApp Business API
 */

import { Client, LocalAuth, Message } from 'whatsapp-web.js';
import qrcode from 'qrcode-terminal';
import { whatsappCrmService } from '../crm/whatsappCrmService';

export class WhatsAppWebService {
  private client: Client;
  private isReady = false;
  private reconnectAttempts = 0;
  private readonly maxReconnectAttempts = 5;
  private messageQueue: Array<{to: string, message: string, resolve: Function, reject: Function}> = [];
  private isProcessingQueue = false;

  constructor() {
    console.log('🚀 Inicializando WhatsApp Web Service...');
    
    this.client = new Client({
      authStrategy: new LocalAuth({
        dataPath: './whatsapp-session'
      }),
      puppeteer: {
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--single-process',
          '--disable-gpu'
        ]
      },
      webVersionCache: {
        type: 'remote',
        remotePath: 'https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2412.54.html'
      }
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    // QR Code para primeira autenticação
    this.client.on('qr', (qr) => {
      console.log('');
      console.log('═══════════════════════════════════════════════════════');
      console.log('📱 QR CODE PARA AUTENTICAÇÃO WHATSAPP');
      console.log('═══════════════════════════════════════════════════════');
      console.log('');
      console.log('⚠️  IMPORTANTE: Use o WhatsApp BUSINESS do número fixo da clínica!');
      console.log('');
      qrcode.generate(qr, { small: true });
      console.log('');
      console.log('📱 Como escanear:');
      console.log('   1. Abra o WhatsApp Business no celular');
      console.log('   2. Toque em Mais opções (⋮) > Aparelhos conectados');
      console.log('   3. Toque em Conectar um aparelho');
      console.log('   4. Aponte a câmera para o QR Code acima');
      console.log('');
      console.log('═══════════════════════════════════════════════════════');
    });

    // Conexão estabelecida
    this.client.on('ready', () => {
      this.isReady = true;
      this.reconnectAttempts = 0;
      
      const info = this.client.info;
      console.log('');
      console.log('═══════════════════════════════════════════════════════');
      console.log('✅ WHATSAPP WEB CONECTADO COM SUCESSO!');
      console.log('═══════════════════════════════════════════════════════');
      console.log(`📱 Número: ${info?.wid?.user}`);
      console.log(`👤 Nome: ${info?.pushname}`);
      console.log(`📲 Plataforma: ${info?.platform}`);
      console.log('🤖 Sistema CRM agora recebe e envia mensagens automaticamente');
      console.log('💰 Custo por mensagem: R$ 0,00 (GRÁTIS!)');
      console.log('📊 Mensagens ilimitadas');
      console.log('═══════════════════════════════════════════════════════');
      console.log('');

      // Processar fila de mensagens pendentes
      this.processMessageQueue();
    });

    // Autenticação bem-sucedida
    this.client.on('authenticated', () => {
      console.log('✅ Autenticação bem-sucedida!');
      console.log('💾 Sessão salva em: ./whatsapp-session/');
      console.log('ℹ️  Próximas inicializações não precisarão de QR Code');
    });

    // Erro de autenticação
    this.client.on('auth_failure', (msg) => {
      console.error('');
      console.error('═══════════════════════════════════════════════════════');
      console.error('❌ FALHA NA AUTENTICAÇÃO');
      console.error('═══════════════════════════════════════════════════════');
      console.error('Mensagem:', msg);
      console.error('');
      console.error('💡 SOLUÇÃO:');
      console.error('   1. Remova a pasta: rm -rf whatsapp-session/');
      console.error('   2. Reinicie o serviço: npm run start:whatsapp');
      console.error('   3. Escaneie o QR Code novamente');
      console.error('═══════════════════════════════════════════════════════');
      console.error('');
    });

    // Desconectado
    this.client.on('disconnected', (reason) => {
      console.warn('');
      console.warn('═══════════════════════════════════════════════════════');
      console.warn('⚠️  WHATSAPP DESCONECTADO');
      console.warn('═══════════════════════════════════════════════════════');
      console.warn('Motivo:', reason);
      console.warn('═══════════════════════════════════════════════════════');
      console.warn('');
      
      this.isReady = false;
      this.handleReconnect();
    });

    // Mensagem recebida
    this.client.on('message', async (msg) => {
      await this.handleIncomingMessage(msg);
    });

    // Confirmação de mensagem (ACK)
    this.client.on('message_ack', (msg, ack) => {
      // ack: 0 = erro, 1 = pendente, 2 = servidor, 3 = entregue, 4 = lida
      const ackStatus = ['erro', 'pendente', 'servidor', 'entregue', 'lida'][ack];
      
      if (ack === 3) {
        console.log(`✅ Mensagem entregue: ${msg.id._serialized.substring(0, 20)}...`);
      } else if (ack === 4) {
        console.log(`👁️  Mensagem lida: ${msg.id._serialized.substring(0, 20)}...`);
      }
    });

    // Erro geral
    this.client.on('error', (error) => {
      console.error('❌ Erro no cliente WhatsApp:', error);
    });

    // Estado de carregamento
    this.client.on('loading_screen', (percent, message) => {
      console.log(`⏳ Carregando: ${percent}% - ${message}`);
    });
  }

  /**
   * Processar mensagem recebida e integrar com CRM
   */
  private async handleIncomingMessage(msg: Message) {
    try {
      // Ignorar mensagens de grupo e de si mesmo
      if (msg.fromMe || msg.from.includes('@g.us')) {
        return;
      }

      const contact = await msg.getContact();
      const phone = contact.number;
      const name = contact.pushname || contact.name || phone;
      const messageBody = msg.body;

      console.log('');
      console.log('📨 ═══════════════════════════════════════════════════════');
      console.log(`   Nova mensagem de ${name} (${phone})`);
      console.log(`   "${messageBody.substring(0, 50)}${messageBody.length > 50 ? '...' : ''}"`);
      console.log('═══════════════════════════════════════════════════════');

      // Processar no CRM
      const result = await whatsappCrmService.processIncomingMessage({
        from: phone,
        name,
        text: messageBody,
        timestamp: msg.timestamp,
        message_id: msg.id._serialized
      });

      if (result.isNew && result.type === 'lead') {
        console.log(`✨ Novo lead criado! ID: ${result.id}`);
        
        // Aguardar 2 segundos antes de enviar boas-vindas
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Enviar mensagem de boas-vindas
        await this.sendWelcomeMessage(phone, name);
      } else if (result.type === 'lead') {
        console.log(`📝 Interação adicionada ao lead: ${result.id}`);
      } else if (result.type === 'patient') {
        console.log(`💬 Mensagem registrada para paciente: ${result.id}`);
      }

      console.log('✅ Mensagem processada com sucesso!');
      console.log('');

    } catch (error) {
      console.error('❌ Erro ao processar mensagem:', error);
    }
  }

  /**
   * Enviar mensagem de boas-vindas para novo lead
   */
  private async sendWelcomeMessage(phone: string, name: string) {
    const firstName = name.split(' ')[0];
    
    const message = `Olá ${firstName}! 👋

Bem-vindo à DuduFisio! Sou o assistente virtual da clínica.

Para agilizar seu atendimento, me conte:
1️⃣ É sua primeira vez?
2️⃣ Você já é nosso paciente?
3️⃣ Quer agendar uma consulta?

Responda com o número da opção ou descreva sua necessidade. 😊`;

    try {
      await this.sendMessage(phone, message);
      console.log('✅ Boas-vindas enviadas com sucesso!');
    } catch (error) {
      console.error('❌ Erro ao enviar boas-vindas:', error);
    }
  }

  /**
   * Tentar reconectar após desconexão
   */
  private async handleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('');
      console.error('═══════════════════════════════════════════════════════');
      console.error('❌ MÁXIMO DE TENTATIVAS DE RECONEXÃO ATINGIDO');
      console.error('═══════════════════════════════════════════════════════');
      console.error(`Tentativas: ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
      console.error('');
      console.error('💡 SOLUÇÃO:');
      console.error('   1. Reinicie o serviço manualmente');
      console.error('   2. Verifique sua conexão com internet');
      console.error('   3. Se persistir, remova a sessão e reconecte');
      console.error('═══════════════════════════════════════════════════════');
      console.error('');
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
    
    console.log('');
    console.log(`🔄 Tentando reconectar (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
    console.log(`⏱️  Aguardando ${delay/1000}s antes de tentar...`);
    console.log('');
    
    setTimeout(() => {
      console.log('🔌 Iniciando reconexão...');
      this.client.initialize();
    }, delay);
  }

  /**
   * Processar fila de mensagens pendentes
   */
  private async processMessageQueue() {
    if (this.isProcessingQueue || this.messageQueue.length === 0) {
      return;
    }

    this.isProcessingQueue = true;

    while (this.messageQueue.length > 0 && this.isReady) {
      const item = this.messageQueue.shift();
      if (item) {
        try {
          const result = await this._sendMessageDirect(item.to, item.message);
          item.resolve(result);
        } catch (error) {
          item.reject(error);
        }
        // Rate limiting: aguardar 1 segundo entre mensagens
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    this.isProcessingQueue = false;
  }

  /**
   * Enviar mensagem diretamente (método interno)
   */
  private async _sendMessageDirect(to: string, message: string): Promise<{
    success: boolean;
    messageId?: string;
    error?: string;
  }> {
    try {
      if (!this.isReady) {
        throw new Error('WhatsApp não está conectado');
      }

      // Formatar número para padrão WhatsApp
      const cleanNumber = to.replace(/\D/g, '');
      const chatId = cleanNumber.includes('@c.us') ? cleanNumber : `${cleanNumber}@c.us`;
      
      const sentMsg = await this.client.sendMessage(chatId, message);
      
      console.log(`📤 Mensagem enviada para ${to}`);
      
      return {
        success: true,
        messageId: sentMsg.id._serialized
      };
      
    } catch (error: any) {
      console.error('❌ Erro ao enviar mensagem:', error);
      return {
        success: false,
        error: error.message || 'Erro desconhecido'
      };
    }
  }

  /**
   * Inicializar cliente WhatsApp
   */
  async start(): Promise<void> {
    console.log('');
    console.log('═══════════════════════════════════════════════════════');
    console.log('🚀 INICIANDO WHATSAPP WEB SERVICE');
    console.log('═══════════════════════════════════════════════════════');
    console.log('📱 DuduFisio-AI - Integração WhatsApp + CRM');
    console.log('💰 Solução econômica: R$ 0 por mensagem');
    console.log('═══════════════════════════════════════════════════════');
    console.log('');
    
    await this.client.initialize();
  }

  /**
   * Enviar mensagem (API pública)
   */
  async sendMessage(to: string, message: string): Promise<{
    success: boolean;
    messageId?: string;
    error?: string;
  }> {
    if (!this.isReady) {
      // Adicionar à fila se não estiver conectado
      console.log('⏳ WhatsApp não conectado. Adicionando mensagem à fila...');
      
      return new Promise((resolve, reject) => {
        this.messageQueue.push({ to, message, resolve, reject });
        
        // Timeout de 2 minutos
        setTimeout(() => {
          reject(new Error('Timeout: WhatsApp não conectou em 2 minutos'));
        }, 120000);
      });
    }

    return this._sendMessageDirect(to, message);
  }

  /**
   * Enviar mensagem com mídia
   */
  async sendMediaMessage(
    to: string, 
    mediaUrl: string, 
    caption?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      if (!this.isReady) {
        throw new Error('WhatsApp não está conectado');
      }

      const cleanNumber = to.replace(/\D/g, '');
      const chatId = cleanNumber.includes('@c.us') ? cleanNumber : `${cleanNumber}@c.us`;
      
      const media = await this.client.sendMessage(chatId, mediaUrl, {
        caption: caption || ''
      });
      
      console.log(`📷 Mídia enviada para ${to}`);
      
      return { success: true };
      
    } catch (error: any) {
      console.error('❌ Erro ao enviar mídia:', error);
      return {
        success: false,
        error: error.message || 'Erro desconhecido'
      };
    }
  }

  /**
   * Verificar se está conectado
   */
  isConnected(): boolean {
    return this.isReady;
  }

  /**
   * Obter informações do cliente
   */
  getInfo() {
    if (!this.isReady) return null;
    return this.client.info;
  }

  /**
   * Obter estatísticas
   */
  getStats() {
    return {
      connected: this.isReady,
      queueSize: this.messageQueue.length,
      reconnectAttempts: this.reconnectAttempts
    };
  }

  /**
   * Desligar cliente
   */
  async stop(): Promise<void> {
    console.log('');
    console.log('═══════════════════════════════════════════════════════');
    console.log('🛑 DESLIGANDO WHATSAPP WEB SERVICE');
    console.log('═══════════════════════════════════════════════════════');
    console.log('');
    
    await this.client.destroy();
    this.isReady = false;
    
    console.log('✅ Serviço desligado com sucesso');
    console.log('💾 Sessão preservada em: ./whatsapp-session/');
    console.log('');
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
