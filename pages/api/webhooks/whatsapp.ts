/**
 * WhatsApp Webhook API Endpoint
 * Activity Fisioterapia Integration - Fase 2
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { getWhatsAppService } from '@/services/whatsapp/WhatsAppService';

/**
 * Webhook do WhatsApp Business API (Twilio)
 * 
 * Este endpoint recebe:
 * 1. Verificação do webhook (GET) - Meta/Twilio
 * 2. Mensagens recebidas (POST)
 * 3. Status de mensagens (POST)
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
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
 * Meta/Twilio fazem isso ao configurar o webhook
 */
function handleWebhookVerification(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN || 'dudufisio_verify_token';
  
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  // Verificar se é uma solicitação de verificação
  if (mode === 'subscribe' && token === verifyToken) {
    console.log('✅ Webhook verificado com sucesso!');
    return res.status(200).send(challenge);
  }

  console.error('❌ Falha na verificação do webhook');
  return res.status(403).json({ error: 'Forbidden' });
}

/**
 * Processar mensagens recebidas (POST)
 */
async function handleIncomingWebhook(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // Log para debug
    console.log('📨 Webhook recebido:', JSON.stringify(req.body, null, 2));

    // Twilio envia no formato application/x-www-form-urlencoded
    const webhookData = req.body;

    // Extrair informações da mensagem Twilio
    const messageData = {
      from: webhookData.From?.replace('whatsapp:', '') || '',
      to: webhookData.To?.replace('whatsapp:', '') || '',
      body: webhookData.Body || '',
      timestamp: new Date().toISOString(),
      id: webhookData.MessageSid || webhookData.SmsMessageSid || '',
      type: webhookData.MessageType || 'text',
      status: webhookData.SmsStatus || webhookData.MessageStatus,
    };

    // Se é atualização de status de mensagem
    if (messageData.status && !messageData.body) {
      await handleMessageStatus(messageData);
      return res.status(200).json({ success: true, type: 'status_update' });
    }

    // Se é mensagem recebida
    if (messageData.body && messageData.from) {
      await handleIncomingMessage(messageData);
      return res.status(200).json({ success: true, type: 'message_received' });
    }

    // Webhook desconhecido
    console.warn('⚠️  Webhook desconhecido:', webhookData);
    return res.status(200).json({ success: true, type: 'unknown' });

  } catch (error) {
    console.error('❌ Erro ao processar webhook:', error);
    
    // Sempre retornar 200 para não fazer Twilio retentar
    return res.status(200).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
}

/**
 * Processar mensagem recebida
 */
async function handleIncomingMessage(messageData: any) {
  try {
    // Obter clinic_id (você pode ter lógica específica aqui)
    // Por enquanto, usar o primeiro ou padrão
    const clinicId = process.env.DEFAULT_CLINIC_ID || '';

    if (!clinicId) {
      console.error('❌ CLINIC_ID não configurado');
      return;
    }

    const whatsappService = getWhatsAppService();
    
    await whatsappService.processIncomingMessage(
      {
        from: messageData.from,
        to: messageData.to,
        body: messageData.body,
        timestamp: messageData.timestamp,
        id: messageData.id,
        type: messageData.type,
      },
      clinicId
    );

    console.log('✅ Mensagem processada:', messageData.from);
  } catch (error) {
    console.error('❌ Erro ao processar mensagem:', error);
    throw error;
  }
}

/**
 * Processar atualização de status
 */
async function handleMessageStatus(statusData: any) {
  try {
    const whatsappService = getWhatsAppService();
    
    await whatsappService.processMessageStatus({
      id: statusData.id,
      status: statusData.status,
      timestamp: statusData.timestamp,
    });

    console.log('✅ Status atualizado:', statusData.id, statusData.status);
  } catch (error) {
    console.error('❌ Erro ao processar status:', error);
    throw error;
  }
}

