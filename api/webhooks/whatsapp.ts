/**
 * WhatsApp Webhook API Endpoint
 * Recebe eventos do Meta/Facebook WhatsApp Business API
 *
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

  console.log('🔍 Webhook verification request:', { mode, token, challenge });

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('✅ Webhook verified successfully');
    return res.status(200).send(challenge);
  }

  console.error('❌ Webhook verification failed');
  return res.status(403).json({ error: 'Verification failed' });
}

/**
 * Webhook Events (POST)
 * Processa eventos recebidos do WhatsApp
 */
async function handleWebhookEvent(req: VercelRequest, res: VercelResponse) {
  try {
    console.log('📨 Received webhook event:', JSON.stringify(req.body, null, 2));

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

    console.log('📩 Processing message:', {
      from,
      id,
      type,
      timestamp,
      contact: contact?.profile?.name
    });

    // Aqui você pode implementar a lógica de resposta automática
    // Por exemplo, integrar com um chatbot ou notificar administradores

    if (type === 'text') {
      const textContent = message.text?.body;
      console.log('💬 Text message received:', textContent);

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
  console.log('📝 Template status update:', value);

  const { event, message_template_id, message_template_name, reason } = value;

  console.log(`Template ${message_template_name} (${message_template_id}): ${event}`);

  if (reason) {
    console.log('Reason:', reason);
  }

  // TODO: Atualizar status do template no banco de dados
  // TODO: Notificar administradores se template foi rejeitado
}

/**
 * Main handler
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Log da requisição (sanitizado)
  console.log(`${req.method} /api/webhooks/whatsapp`, {
    query: req.query,
    headers: {
      'content-type': req.headers['content-type'],
      'user-agent': req.headers['user-agent']
    }
  });

  if (req.method === 'GET') {
    return handleVerification(req, res);
  }

  if (req.method === 'POST') {
    return handleWebhookEvent(req, res);
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
