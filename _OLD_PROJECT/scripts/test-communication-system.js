#!/usr/bin/env node

/**
 * Teste específico do sistema de comunicação com Redis funcionando
 * DuduFisio-AI - Sistema de Comunicação Omnichannel
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 DuduFisio-AI - Teste do Sistema de Comunicação\n');

function loadEnvironmentVariables() {
  const envPath = path.join(process.cwd(), '.env.local');

  if (!fs.existsSync(envPath)) {
    console.log('❌ Arquivo .env.local não encontrado');
    return {};
  }

  const envContent = fs.readFileSync(envPath, 'utf8');
  const envVars = {};

  envContent.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && !key.startsWith('#')) {
      envVars[key.trim()] = valueParts.join('=').trim().replace(/"/g, '');
    }
  });

  return envVars;
}

async function testUpstashRedis(envVars) {
  const url = envVars.UPSTASH_REDIS_REST_URL || envVars.KV_REST_API_URL;
  const token = envVars.UPSTASH_REDIS_REST_TOKEN || envVars.KV_REST_API_TOKEN;

  if (!url || !token) {
    return { success: false, error: 'Variáveis de ambiente não configuradas' };
  }

  try {
    // Teste básico de ping
    const response = await fetch(`${url}/ping`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.ok) {
      const result = await response.text();
      return {
        success: true,
        message: `Redis respondeu: ${result}`,
        details: {
          url: url.replace(/\/\/.*@/, '//***@'),
          hasToken: !!token
        }
      };
    } else {
      return {
        success: false,
        error: `HTTP ${response.status}: ${response.statusText}`
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

async function testCommunicationCore() {
  console.log('🔍 Testando componentes do sistema de comunicação...');

  const results = [];

  // 1. Verificar se arquivos principais existem
  const coreFiles = [
    'lib/communication/core/MessageBus.ts',
    'lib/communication/core/types.ts',
    'lib/communication/channels/WhatsAppChannel.ts',
    'lib/communication/channels/SMSChannel.ts',
    'lib/communication/channels/EmailChannel.ts',
    'lib/communication/templates/TemplateEngine.ts',
    'lib/communication/automation/AutomationEngine.ts'
  ];

  let filesExist = 0;
  coreFiles.forEach(file => {
    const filePath = path.join(process.cwd(), file);
    if (fs.existsSync(filePath)) {
      filesExist++;
      console.log(`   ✅ ${file}`);
    } else {
      console.log(`   ❌ ${file} - Não encontrado`);
    }
  });

  results.push({
    name: 'Arquivos do Sistema',
    success: filesExist === coreFiles.length,
    message: `${filesExist}/${coreFiles.length} arquivos encontrados`
  });

  // 2. Verificar se migrations existem
  const migrationPath = path.join(process.cwd(), 'supabase/migrations');
  const migrationFiles = fs.existsSync(migrationPath)
    ? fs.readdirSync(migrationPath).filter(f => f.includes('communication'))
    : [];

  results.push({
    name: 'Migrations do DB',
    success: migrationFiles.length > 0,
    message: `${migrationFiles.length} migrations de comunicação encontradas`
  });

  // 3. Verificar se componentes React existem
  const componentPath = path.join(process.cwd(), 'components/communication');
  const componentFiles = fs.existsSync(componentPath)
    ? fs.readdirSync(componentPath).filter(f => f.endsWith('.tsx'))
    : [];

  results.push({
    name: 'Componentes React',
    success: componentFiles.length > 0,
    message: `${componentFiles.length} componentes encontrados`
  });

  return results;
}

async function main() {
  console.log('Iniciando testes do sistema de comunicação...\n');

  // 1. Carregar variáveis de ambiente
  const envVars = loadEnvironmentVariables();
  if (Object.keys(envVars).length === 0) {
    return;
  }

  // 2. Testar Redis
  console.log('🔴 Testando Redis (Upstash)...');
  const redisResult = await testUpstashRedis(envVars);

  if (redisResult.success) {
    console.log(`   ✅ ${redisResult.message}`);
  } else {
    console.log(`   ❌ ${redisResult.error}`);
  }

  // 3. Testar componentes do sistema
  const coreResults = await testCommunicationCore();

  // 4. Resumo geral
  console.log('\n📊 RESUMO DO SISTEMA DE COMUNICAÇÃO');
  console.log('=' .repeat(50));

  const allResults = [redisResult, ...coreResults];
  const successful = allResults.filter(r => r.success).length;
  const total = allResults.length;

  console.log(`\n🎯 Status: ${successful}/${total} componentes funcionando`);

  if (redisResult.success) {
    console.log('\n✅ REDIS FUNCIONANDO - Sistema pronto para usar!');
    console.log('\n🚀 Próximos passos:');
    console.log('1. 📧 Configure Resend quando domínio estiver pronto');
    console.log('2. 📱 Configure WhatsApp Business API');
    console.log('3. 📞 Configure Twilio SMS');
    console.log('4. 🧪 Execute testes de integração completos');
    console.log('5. 🚀 Deploy para produção');

    console.log('\n📝 Para usar o sistema agora:');
    console.log('```javascript');
    console.log('import { MessageBus } from "./lib/communication/core/MessageBus";');
    console.log('const bus = new MessageBus();');
    console.log('await bus.sendMessage({...});');
    console.log('```');
  } else {
    console.log('\n⚠️  Redis não está respondendo - verifique configuração');
  }

  console.log('\n📖 Documentação: docs/COMMUNICATION_SYSTEM.md');
}

// Executar script
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { testUpstashRedis, testCommunicationCore };