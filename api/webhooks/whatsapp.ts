/**
 * WhatsApp Webhook API Endpoint (Node.js Serverless)
 * 
 * ⚠️ DEPRECATED: This file is deprecated in favor of Edge Function version
 * 
 * Migration date: 06/11/2025
 * New version: api/webhooks/whatsapp-edge.ts (Vercel Edge Runtime)
 * 
 * Reason for deprecation:
 * - Edge Functions are 50ms faster (0ms cold starts)
 * - 50% cheaper than Node.js serverless
 * - Better for webhooks (instant response)
 * 
 * TODO: Remove this file after validating Edge version in production
 * 
 * @deprecated Use api/webhooks/whatsapp-edge.ts instead
 * @see https://developers.facebook.com/docs/whatsapp/cloud-api/webhooks
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';

const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || 'dudufisio_webhook_verify_token_2025';

/**
 * Webhook Verification (GET)
 * O Meta envia uma requisição GET para verificar o webhook
 */
function handleVerification(req: VercelRequest, res: VercelResponse) {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  // SEGURO: Log de verificação sem expor token completo
  console.warn('Webhook verification request received');

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.warn('Webhook verified successfully');
    return res.status(200).send(challenge);
  }

  console.error('Webhook verification failed');
  return res.status(403).json({ error: 'Verification failed' });
}

/**
 * Webhook Events (POST)
 * Processa eventos recebidos do WhatsApp
 */
async function handleWebhookEvent(req: VercelRequest, res: VercelResponse) {
  try {
    // SEGURO: Log estruturado sem expor dados sensíveis do body
    console.warn('Webhook event received', { object: req.body?.object, entryCount: req.body?.entry?.length || 0 });

    const { object, entry } = req.body;

    if (object !== 'whatsapp_business_account') {
      return res.status(400).json({ error: 'Invalid object type' });
    }

    // Processar cada entrada
    for (const item of entry || []) {
      const changes = item.changes || [];

      for (const change of changes) {
        const { field, value } = change;

        if (field === 'messages') {
          await processMessage(value);
        } else if (field === 'message_template_status_update') {
          await processTemplateStatusUpdate(value);
        }
      }
    }

    // Sempre retornar 200 para o Meta
    return res.status(200).json({ success: true });

  } catch (error) {
    console.error('❌ Webhook processing error:', error);
    // Mesmo com erro, retornamos 200 para não gerar retry infinito
    return res.status(200).json({ success: false, error: String(error) });
  }
}

/**
 * Processa mensagens recebidas
 */
async function processMessage(value: any) {
  const messages = value.messages || [];
  const contacts = value.contacts || [];

  for (const message of messages) {
    const { from, id, type, timestamp } = message;
    const contact = contacts.find((c: any) => c.wa_id === from);

    // SEGURO: Log de processamento sem expor dados do contato
    console.warn('Processing WhatsApp message', {
      messageId: id,
      type,
      timestamp,
      hasContact: !!contact
    });

    // Aqui você pode implementar a lógica de resposta automática
    // Por exemplo, integrar com um chatbot ou notificar administradores

    if (type === 'text') {
      const textContent = message.text?.body;
      // SEGURO: Log sem expor conteúdo da mensagem
      console.warn('Text message received', { hasContent: !!textContent, length: textContent?.length || 0 });

      // TODO: Implementar lógica de resposta automática
      // - Verificar palavras-chave
      // - Responder com informações
      // - Criar ticket de suporte
      // - Notificar equipe
    }

    // Marcar como lida
    // await whatsappBusinessService.markAsRead(id);
  }
}

/**
 * Processa atualizações de status de template
 */
async function processTemplateStatusUpdate(value: any) {
  // SEGURO: Log estruturado de status de template
  console.warn('Template status update received');

  const { event, message_template_id, message_template_name, reason } = value;

  console.warn(`Template status: ${event}`, { 
    templateId: message_template_id,
    event 
  });

  if (reason) {
    console.warn('Template event reason:', { reason });
  }

  // TODO: Atualizar status do template no banco de dados
  // TODO: Notificar administradores se template foi rejeitado
}

/**
 * Main handler
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Log da requisição (sanitizado - não expõe query params que podem conter tokens)
  console.warn(`${req.method} /api/webhooks/whatsapp`, {
    hasQuery: !!req.query,
    contentType: req.headers['content-type']
  });

  if (req.method === 'GET') {
    return handleVerification(req, res);
  }

  if (req.method === 'POST') {
    return handleWebhookEvent(req, res);
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
