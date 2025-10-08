/**
 * WhatsApp Webhook API Endpoint
 * DuduFisio-AI - Meta WhatsApp Business API Integration
 */

/**
 * Webhook do WhatsApp Business API (Meta)
 * 
 * Este endpoint recebe:
 * 1. Verificação do webhook (GET) - Meta
 * 2. Mensagens recebidas (POST)
 * 3. Status de mensagens (POST)
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

  console.log('🔍 Verificação do webhook:', {
    mode,
    token,
    expectedToken: verifyToken,
    challenge
  });

  // Verificar se é uma solicitação de verificação
  if (mode === 'subscribe' && token === verifyToken) {
    console.log('✅ Webhook verificado com sucesso!');
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
async function handleIncomingWebhook(req, res) {
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
async function handleMetaMessage(message, metadata) {
  try {
    console.log('✅ Mensagem processada:', message.from, message.text?.body);
    // Aqui você pode integrar com o seu sistema de mensagens
  } catch (error) {
    console.error('❌ Erro ao processar mensagem:', error);
  }
}

/**
 * Processar status de mensagem do Meta
 */
async function handleMetaStatus(status) {
  try {
    console.log('✅ Status atualizado:', status.id, status.status);
    // Aqui você pode atualizar o status no seu sistema
  } catch (error) {
    console.error('❌ Erro ao processar status:', error);
  }
}
