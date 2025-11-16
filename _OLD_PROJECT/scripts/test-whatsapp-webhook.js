/**
 * Script de Teste do Webhook WhatsApp
 * DuduFisio-AI
 */

const https = require('https');
const http = require('http');

// Configurações
const WEBHOOK_URL = 'https://moocafisio.com.br/api/webhooks/whatsapp';
const VERIFY_TOKEN = 'mu/NQ2Z92+[g';
const PHONE_NUMBER_ID = '779431901927431';

/**
 * Teste de verificação do webhook
 */
async function testWebhookVerification() {
  console.log('🔍 Testando verificação do webhook...');
  
  const testChallenge = 'test_challenge_123';
  const verificationUrl = `${WEBHOOK_URL}?hub.mode=subscribe&hub.challenge=${testChallenge}&hub.verify_token=${VERIFY_TOKEN}`;
  
  try {
    const response = await fetch(verificationUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    const responseText = await response.text();
    
    if (response.ok && responseText === testChallenge) {
      console.log('✅ Verificação do webhook funcionando corretamente!');
      return true;
    } else {
      console.log('❌ Falha na verificação:', response.status, responseText);
      return false;
    }
  } catch (error) {
    console.error('❌ Erro ao testar verificação:', error.message);
    return false;
  }
}

/**
 * Teste de webhook com dados simulados do Meta
 */
async function testWebhookMessage() {
  console.log('📨 Testando recebimento de mensagem...');
  
  const testMessage = {
    object: 'whatsapp_business_account',
    entry: [
      {
        id: 'ENTRY_ID',
        changes: [
          {
            value: {
              messaging_product: 'whatsapp',
              metadata: {
                display_phone_number: '+551158749885',
                phone_number_id: PHONE_NUMBER_ID
              },
              messages: [
                {
                  from: '5511999999999',
                  id: 'wamid.test123',
                  timestamp: Math.floor(Date.now() / 1000).toString(),
                  text: {
                    body: 'Olá, teste do webhook!'
                  },
                  type: 'text'
                }
              ]
            },
            field: 'messages'
          }
        ]
      }
    ]
  };
  
  try {
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testMessage)
    });
    
    const responseData = await response.json();
    
    if (response.ok) {
      console.log('✅ Mensagem processada com sucesso!');
      console.log('📄 Resposta:', responseData);
      return true;
    } else {
      console.log('❌ Falha no processamento:', response.status, responseData);
      return false;
    }
  } catch (error) {
    console.error('❌ Erro ao testar mensagem:', error.message);
    return false;
  }
}

/**
 * Função principal de teste
 */
async function runTests() {
  console.log('🚀 Iniciando testes do webhook WhatsApp...\n');
  
  // Teste 1: Verificação
  const verificationTest = await testWebhookVerification();
  console.log('');
  
  // Teste 2: Mensagem (apenas se verificação passou)
  if (verificationTest) {
    await testWebhookMessage();
  }
  
  console.log('\n🏁 Testes concluídos!');
}

// Executar testes se chamado diretamente
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = {
  testWebhookVerification,
  testWebhookMessage,
  runTests
};
