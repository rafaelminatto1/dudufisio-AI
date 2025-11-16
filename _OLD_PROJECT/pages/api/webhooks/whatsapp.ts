/**
 * WhatsApp Webhook API Endpoint (Next.js Pages Router)
 * 
 * ⚠️ DEPRECATED: This file is deprecated in favor of Edge Function version
 * 
 * Migration date: 06/11/2025
 * New version: api/webhooks/whatsapp-edge.ts (Vercel Edge Runtime)
 * 
 * Reason for deprecation:
 * - Edge Functions provide better performance
 * - Lower costs
 * - This is Next.js Pages Router (we're using App Router)
 * 
 * TODO: Remove this file after validating Edge version
 * 
 * @deprecated Use api/webhooks/whatsapp-edge.ts instead
 */

import { getWhatsAppService } from '@/services/whatsapp/WhatsAppService';

/**
 * Webhook do WhatsApp Business API (Meta)
 * 
 * Este endpoint recebe:
 * 1. Verificação do webhook (GET) - Meta
 * 2. Mensagens recebidas (POST)
 * 3. Status de mensagens (POST)
 */
export default async function handler(req: any, res: any) {
  // GET - Verificação do webhook
  if (req.method === 'GET') {
    return handleWebhookVerification(req, res);
  }

  // POST - Mensagens e status
  if (req.method === 'POST') {
    return handleIncomingWebhook(req, res);
  }

  // Método não suportado
  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).json({ error: 'Method Not Allowed' });
}

/**
 * Verificação do webhook (GET)
 * Meta faz isso ao configurar o webhook
 */
function handleWebhookVerification(req: any, res: any) {
  // Token de verificação que você configurou no Meta
  const verifyToken = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || 'mu/NQ2Z92+[g';
  
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  

  // Verificar se é uma solicitação de verificação
  if (mode === 'subscribe' && token === verifyToken) {
    
    return res.status(200).send(challenge);
  }

  console.error('❌ Falha na verificação do webhook:', {
    mode,
    token,
    expectedToken: verifyToken
  });
  return res.status(403).json({ error: 'Forbidden' });
}

/**
 * Processar mensagens recebidas (POST)
 */
async function handleIncomingWebhook(req: any, res: any) {
  try {
    // Log para debug
    console.log('📨 Webhook recebido:', JSON.stringify(req.body, null, 2));

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
    console.error('❌ Erro ao processar webhook:', error);
    
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
async function handleMetaMessage(message: any, metadata: any) {
  try {
    // Obter clinic_id (você pode ter lógica específica aqui)
    const clinicId = process.env.DEFAULT_CLINIC_ID || '';

    if (!clinicId) {
      console.error('❌ CLINIC_ID não configurado');
      return;
    }

    const whatsappService = getWhatsAppService();
    
    // Extrair dados da mensagem do Meta
    const messageData = {
      from: message.from,
      to: metadata.phone_number_id,
      body: message.text?.body || message.type,
      timestamp: new Date(parseInt(message.timestamp) * 1000).toISOString(),
      id: message.id,
      type: message.type,
    };

    await whatsappService.processIncomingMessage(messageData, clinicId);

    
  } catch (error) {
    console.error('❌ Erro ao processar mensagem:', error);
    throw error;
  }
}

/**
 * Processar status de mensagem do Meta
 */
async function handleMetaStatus(status: any) {
  try {
    const whatsappService = getWhatsAppService();
    
    await whatsappService.processMessageStatus({
      id: status.id,
      status: status.status,
      timestamp: new Date(parseInt(status.timestamp) * 1000).toISOString(),
    });

    
  } catch (error) {
    console.error('❌ Erro ao processar status:', error);
    throw error;
  }
}


