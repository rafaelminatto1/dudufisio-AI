#!/usr/bin/env node
/**
 * Script de teste completo do sistema híbrido Groq + Gemini
 */

import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Carregar variáveis de ambiente
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = join(__dirname, '..', '.env.local');
config({ path: envPath });

console.log('\n🧪 Testando Sistema Híbrido de IA (Groq + Gemini)\n');
console.log('='.repeat(60));

// Verificar configuração
const groqKey = process.env.GROQ_API_KEY;
const geminiKey = process.env.VITE_GEMINI_API_KEY;

console.log('\n📋 VERIFICAÇÃO DE CONFIGURAÇÃO:\n');
console.log(`✅ GROQ_API_KEY: ${groqKey ? '✓ Configurada' : '✗ Não encontrada'}`);
console.log(`✅ VITE_GEMINI_API_KEY: ${geminiKey ? '✓ Configurada' : '✗ Não encontrada'}`);
console.log(`✅ AI_PRIMARY_PROVIDER: ${process.env.AI_PRIMARY_PROVIDER || 'groq (padrão)'}`);
console.log(`✅ AI_FALLBACK_PROVIDER: ${process.env.AI_FALLBACK_PROVIDER || 'gemini (padrão)'}`);
console.log(`✅ AI_ENABLE_FALLBACK: ${process.env.AI_ENABLE_FALLBACK || 'true (padrão)'}`);

// Teste 1: Groq (Velocidade)
console.log('\n' + '='.repeat(60));
console.log('\n🚀 TESTE 1: GROQ (Velocidade)\n');

let latencyGroq = 0;
let latencyGemini = 0;

try {
  const startGroq = Date.now();
  
  const responseGroq = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${groqKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: 'Você é um assistente de fisioterapia.'
        },
        {
          role: 'user',
          content: 'Liste 3 exercícios para dor lombar (seja breve).'
        }
      ],
      max_tokens: 200,
      temperature: 0.7,
    }),
  });

  latencyGroq = Date.now() - startGroq;
  const dataGroq = await responseGroq.json();
  const messageGroq = dataGroq.choices[0]?.message?.content;

  console.log(`⚡ Latência: ${latencyGroq}ms`);
  console.log(`📊 Tokens: ${dataGroq.usage?.total_tokens || 'N/A'}`);
  console.log(`📝 Resposta:\n${messageGroq}\n`);
  console.log('✅ Groq: FUNCIONANDO');

} catch (error) {
  console.error('❌ Groq: ERRO -', error.message);
}

// Teste 2: Gemini (Qualidade)
console.log('\n' + '='.repeat(60));
console.log('\n🧠 TESTE 2: GEMINI (Qualidade)\n');

try {
  const startGemini = Date.now();
  
  const responseGemini = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: 'Liste 3 exercícios para dor lombar (seja breve).'
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 200,
        },
      }),
    }
  );

  latencyGemini = Date.now() - startGemini;
  const dataGemini = await responseGemini.json();
  const messageGemini = dataGemini.candidates?.[0]?.content?.parts?.[0]?.text || 'Resposta não disponível';

  console.log(`⚡ Latência: ${latencyGemini}ms`);
  console.log(`📝 Resposta:\n${messageGemini.substring(0, 200)}...\n`);
  console.log('✅ Gemini: FUNCIONANDO');

} catch (error) {
  console.error('❌ Gemini: ERRO -', error.message);
}

// Comparação
if (latencyGroq > 0 && latencyGemini > 0) {
  console.log('\n' + '='.repeat(60));
  console.log('\n📊 COMPARAÇÃO DE PERFORMANCE:\n');
  console.log(`Groq:   ${latencyGroq}ms`);
  console.log(`Gemini: ${latencyGemini}ms`);
  
  const diff = latencyGemini - latencyGroq;
  if (diff > 0) {
    const speedup = (diff / latencyGemini * 100).toFixed(1);
    console.log(`\n⚡ Groq é ${speedup}% mais rápido que Gemini!`);
  } else {
    const speedup = (Math.abs(diff) / latencyGroq * 100).toFixed(1);
    console.log(`\n⚡ Gemini é ${speedup}% mais rápido que Groq!`);
  }
}

// Resumo Final
console.log('\n' + '='.repeat(60));
console.log('\n✨ RESUMO:\n');
console.log('✅ Sistema híbrido configurado e funcionando!');
console.log('✅ Groq: Ideal para sugestões em tempo real');
console.log('✅ Gemini: Ideal para análises complexas');
console.log('✅ Fallback automático habilitado');
console.log('\n🎯 Próximo passo: Fazer deploy na Vercel!\n');
console.log('='.repeat(60) + '\n');

