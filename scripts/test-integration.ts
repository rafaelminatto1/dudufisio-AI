/**
 * Teste de integração Vercel + Supabase
 * 
 * Uso: npx tsx scripts/test-integration.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('🔗 TESTE DE INTEGRAÇÃO VERCEL + SUPABASE');
console.log('=========================================');
console.log('');

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Variáveis de ambiente não configuradas!');
  console.log('');
  console.log('Crie .env.local com:');
  console.log('  NEXT_PUBLIC_SUPABASE_URL=...');
  console.log('  NEXT_PUBLIC_SUPABASE_ANON_KEY=...');
  process.exit(1);
}

console.log('📍 Vercel Project: dudufisio-ai');
console.log('📍 Project ID: prj_lJT0yis7pFVJASeoHaykO6A1U7kz');
console.log('📍 Team: Rafael Minatto\'s projects');
console.log('');
console.log('📍 Supabase Project: dudufisio-AI');
console.log('📍 Project Ref: urfxniitfbbvsaskicfo');
console.log('📍 Region: South America (São Paulo)');
console.log('');

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testIntegration() {
  let testsPassados = 0;
  const totalTestes = 6;
  
  // ========================================================================
  // TESTE 1: Conexão Básica
  // ========================================================================
  console.log('📡 TESTE 1: Conexão Vercel → Supabase');
  
  try {
    const { data, error } = await supabase
      .from('patients')
      .select('count')
      .limit(1);
    
    if (!error) {
      console.log('   ✅ Conexão estabelecida!');
      testsPassados++;
    } else {
      console.log(`   ❌ Erro: ${error.message}`);
    }
  } catch (err) {
    console.log(`   ❌ Exceção: ${err}`);
  }
  console.log('');
  
  // ========================================================================
  // TESTE 2: Auth Configuration
  // ========================================================================
  console.log('🔐 TESTE 2: Configuração de Auth');
  
  try {
    const { data, error } = await supabase.auth.getSession();
    
    if (!error) {
      console.log('   ✅ Auth configurado corretamente');
      testsPassados++;
    } else {
      console.log(`   ⚠️  Auth: ${error.message}`);
    }
  } catch (err) {
    console.log(`   ❌ Erro no Auth: ${err}`);
  }
  console.log('');
  
  // ========================================================================
  // TESTE 3: Storage
  // ========================================================================
  console.log('🗄️  TESTE 3: Storage');
  
  try {
    const { data: buckets, error } = await supabase.storage.listBuckets();
    
    if (!error) {
      const hasPatientDocs = buckets?.some(b => b.name === 'patient-documents');
      
      if (hasPatientDocs) {
        console.log('   ✅ Storage bucket "patient-documents" configurado');
        testsPassados++;
      } else {
        console.log('   ⚠️  Bucket "patient-documents" não encontrado');
      }
    } else {
      console.log(`   ❌ Erro: ${error.message}`);
    }
  } catch (err) {
    console.log(`   ❌ Erro no Storage: ${err}`);
  }
  console.log('');
  
  // ========================================================================
  // TESTE 4: Realtime
  // ========================================================================
  console.log('📡 TESTE 4: Realtime (WebSockets)');
  
  try {
    const channel = supabase.channel('test-integration');
    
    const subscription = channel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        console.log('   ✅ Realtime configurado e funcionando');
        testsPassados++;
        channel.unsubscribe();
      }
    });
    
    // Aguardar 2 segundos
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    if (subscription.state !== 'subscribed') {
      console.log('   ⚠️  Realtime pode não estar habilitado');
    }
  } catch (err) {
    console.log(`   ❌ Erro no Realtime: ${err}`);
  }
  console.log('');
  
  // ========================================================================
  // TESTE 5: Integration Metadata
  // ========================================================================
  console.log('🔗 TESTE 5: Metadata de Integração');
  
  try {
    const { data, error } = await supabase
      .from('integration_metadata')
      .select('*');
    
    if (!error) {
      if (data && data.length > 0) {
        console.log(`   ✅ ${data.length} integrações registradas:`);
        data.forEach(int => {
          console.log(`      - ${int.integration_name} (${int.platform})`);
        });
        testsPassados++;
      } else {
        console.log('   ⚠️  Nenhuma integração registrada (execute a migration)');
      }
    } else {
      console.log(`   ⚠️  Tabela não existe ainda (execute a migration)`);
    }
  } catch (err) {
    console.log(`   ⚠️  Migration de integração não aplicada`);
  }
  console.log('');
  
  // ========================================================================
  // TESTE 6: Environment Variables
  // ========================================================================
  console.log('⚙️  TESTE 6: Variáveis de Ambiente');
  
  const envVars = {
    'NEXT_PUBLIC_SUPABASE_URL': !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    'NEXT_PUBLIC_SUPABASE_ANON_KEY': !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    'SUPABASE_SERVICE_ROLE_KEY': !!process.env.SUPABASE_SERVICE_ROLE_KEY,
  };
  
  let envCount = 0;
  
  for (const [name, exists] of Object.entries(envVars)) {
    if (exists) {
      console.log(`   ✅ ${name}`);
      envCount++;
    } else {
      console.log(`   ⚠️  ${name} não configurada`);
    }
  }
  
  if (envCount >= 2) {
    testsPassados++;
  }
  
  console.log('');
  
  // ========================================================================
  // RESULTADO FINAL
  // ========================================================================
  console.log('═'.repeat(50));
  console.log('');
  console.log(`📊 RESULTADO: ${testsPassados}/${totalTestes} testes passaram`);
  console.log('');
  
  if (testsPassados === totalTestes) {
    console.log('🎉 INTEGRAÇÃO PERFEITA!');
    console.log('');
    console.log('✅ Vercel e Supabase estão totalmente integrados!');
    console.log('✅ Pronto para deploy em produção!');
  } else if (testsPassados >= 4) {
    console.log('✅ INTEGRAÇÃO FUNCIONAL!');
    console.log('');
    console.log('Alguns recursos opcionais não configurados.');
    console.log('O sistema funcionará normalmente.');
  } else {
    console.log('⚠️  INTEGRAÇÃO PARCIAL');
    console.log('');
    console.log('Configure:');
    console.log('1. .env.local (variáveis de ambiente)');
    console.log('2. Aplique as migrations no Supabase');
    console.log('3. Configure Storage bucket');
  }
  console.log('');
}

testIntegration().catch(err => {
  console.error('❌ Erro fatal:', err);
  process.exit(1);
});


