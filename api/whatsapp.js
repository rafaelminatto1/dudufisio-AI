/**
 * WhatsApp Webhook API Endpoint
 * DuduFisio-AI - Meta WhatsApp Business API Integration
 * Vercel Function
 */

export default async function handler(req, res) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // GET - Verificação do webhook
  if (req.method === 'GET') {
    return handleWebhookVerification(req, res);
  }

  // POST - Mensagens e status
  if (req.method === 'POST') {
    return handleIncomingWebhook(req, res);
  }

  // OPTIONS - CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Método não suportado
  res.setHeader('Allow', ['GET', 'POST', 'OPTIONS']);
  return res.status(405).json({ error: 'Method Not Allowed' });
}

/**
 * Verificação do webhook (GET)
 * Meta faz isso ao configurar o webhook
 */
function handleWebhookVerification(req, res) {
  // Token de verificação que você configurou no Meta
  const verifyToken = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || 'mu/NQ2Z92+[g';
  
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  const { logger } = require('../lib/logger');
  logger.info('🔍 Verificação do webhook:', { data: {
    mode,
    token,
    expectedToken: verifyToken,
    challenge
  } });

  // Verificar se é uma solicitação de verificação
  if (mode === 'subscribe' && token === verifyToken) {
    logger.info('✅ Webhook verificado com sucesso!');
    return res.status(200).send(challenge);
  }

  logger.error('❌ Falha na verificação do webhook:', { data: {
    mode,
    token,
    expectedToken: verifyToken
  } });
  return res.status(403).json({ error: 'Forbidden' });
}

/**
 * Processar mensagens recebidas (POST)
 */
async function handleIncomingWebhook(req, res) {
  try {
    // Log para debug
    const { logger } = require('../lib/logger');
    logger.info('📨 Webhook recebido:', { data: req.body });

    // Meta envia no formato JSON
    const webhookData = req.body;

    // Verificar se é um webhook do Meta
    if (webhookData.object === 'whatsapp_business_account') {
      // Processar entrada do webhook
      for (const entry of webhookData.entry || []) {
        for (const change of entry.changes || []) {
          if (change.field === 'messages') {
            for (const value of change.value || []) {
              // Processar mensagens recebidas
              for (const message of value.messages || []) {
                await handleMetaMessage(message, value.metadata);
              }
              
              // Processar status de mensagens
              for (const status of value.statuses || []) {
                await handleMetaStatus(status);
              }
            }
          }
        }
      }
    }

    return res.status(200).json({ success: true });

  } catch (error) {
    const { logger } = require('../lib/logger');
    logger.error('❌ Erro ao processar webhook:', { data: error });
    
    // Sempre retornar 200 para não fazer Meta retentar
    return res.status(200).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
}

/**
 * Processar mensagem recebida do Meta
 */
async function handleMetaMessage(message, metadata) {
  try {
    const { logger } = require('../lib/logger');
    logger.info('✅ Mensagem recebida:', { data: { from: message.from, body: message.text?.body } });
    
    // Importar serviço WhatsApp
    const { getMetaWhatsAppService } = require('../services/whatsapp/MetaWhatsAppService');
    const whatsappService = getMetaWhatsAppService();
    
    // Obter clinic_id (pode vir do metadata ou configuração)
    const clinicId = process.env.DEFAULT_CLINIC_ID || '1';
    
    // Processar mensagem
    await whatsappService.processIncomingMessage(message, metadata, clinicId);
    
    logger.info('✅ Mensagem processada com sucesso');
  } catch (error) {
    const { logger } = require('../lib/logger');
    logger.error('❌ Erro ao processar mensagem:', { data: error });
  }
}

/**
 * Processar status de mensagem do Meta
 */
async function handleMetaStatus(status) {
  try {
    const { logger } = require('../lib/logger');
    logger.info('✅ Status recebido:', { data: { id: status.id, status: status.status } });
    
    // Importar serviço WhatsApp
    const { getMetaWhatsAppService } = require('../services/whatsapp/MetaWhatsAppService');
    const whatsappService = getMetaWhatsAppService();
    
    // Processar status
    await whatsappService.processMessageStatus(status);
    
    logger.info('✅ Status atualizado com sucesso');
  } catch (error) {
    const { logger } = require('../lib/logger');
    logger.error('❌ Erro ao processar status:', { data: error });
  }
}
