/**
 * Servidor Webhook Simples para WhatsApp Business API
 * DuduFisio-AI
 */

const express = require('express');
const app = express();
const PORT = 3000;

// Middleware para parsear JSON
app.use(express.json());

// Rota do webhook WhatsApp
app.get('/api/whatsapp', (req, res) => {
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
});

// Rota POST para mensagens
app.post('/api/whatsapp', (req, res) => {
  try {
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
                console.log('✅ Mensagem processada:', message.from, message.text?.body);
              }
              
              // Processar status de mensagens
              for (const status of value.statuses || []) {
                console.log('✅ Status atualizado:', status.id, status.status);
              }
            }
          }
        }
      }
    }

    return res.status(200).json({ success: true });

  } catch (error) {
    console.error('❌ Erro ao processar webhook:', error);
    return res.status(200).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Rota de teste
app.get('/test', (req, res) => {
  res.json({ 
    message: 'Webhook server funcionando!', 
    timestamp: new Date().toISOString() 
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor webhook rodando na porta ${PORT}`);
  console.log(`📡 Webhook URL: http://localhost:${PORT}/api/whatsapp`);
  console.log(`🧪 Teste URL: http://localhost:${PORT}/test`);
});

module.exports = app;
