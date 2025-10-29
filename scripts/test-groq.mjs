#!/usr/bin/env node
/**
 * Script de teste para verificar integração com Groq
 */

import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Carregar variáveis de ambiente
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = join(__dirname, '..', '.env.local');
config({ path: envPath });

console.log('\n🧪 Testando integração Groq...\n');

// Verificar se a API key está configurada
const apiKey = process.env.GROQ_API_KEY;

if (!apiKey) {
  console.error('❌ GROQ_API_KEY não encontrada em .env.local');
  process.exit(1);
}

console.log('✅ GROQ_API_KEY encontrada:', apiKey.substring(0, 20) + '...');

// Testar conexão com Groq
try {
  console.log('\n📡 Fazendo requisição de teste para Groq...');
  
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'user',
          content: 'Responda apenas: "Groq funcionando!"'
        }
      ],
      max_tokens: 50,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`HTTP ${response.status}: ${error}`);
  }

  const data = await response.json();
  const message = data.choices[0]?.message?.content;

  console.log('\n✅ Resposta do Groq:', message);
  console.log('\n📊 Detalhes da requisição:');
  console.log('   Modelo:', data.model);
  console.log('   Tokens usados:', data.usage?.total_tokens || 'N/A');
  console.log('   Tempo de resposta: ~' + (Date.now() - Date.now()) + 'ms');
  
  console.log('\n✨ Groq está funcionando perfeitamente!\n');
  
} catch (error) {
  console.error('\n❌ Erro ao testar Groq:', error.message);
  console.error('\nPossíveis causas:');
  console.error('  1. API key inválida ou expirada');
  console.error('  2. Problema de conexão de rede');
  console.error('  3. Rate limit excedido');
  console.error('\nVerifique: https://console.groq.com\n');
  process.exit(1);
}

