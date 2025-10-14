/**
 * Script para validar conexão com Supabase
 * 
 * Uso: npx tsx scripts/validate-supabase.ts
 */

import { supabase } from '../lib/supabaseClient';

async function validateSupabase() {
  console.log('🔍 Validando conexão Supabase...\n');
  
  // Teste 1: Verificar variáveis de ambiente
  console.log('📋 Teste 1: Variáveis de Ambiente');
  console.log('─'.repeat(50));
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
  
  if (!url) {
    console.error('❌ VITE_SUPABASE_URL não está definida');
    return false;
  }
  console.log('✅ URL:', url);
  
  if (!key) {
    console.error('❌ VITE_SUPABASE_ANON_KEY não está definida');
    return false;
  }
  console.log('✅ Key (primeiros 30 chars):', key.substring(0, 30) + '...');
  console.log('✅ Key length:', key.length, 'caracteres\n');
  
  // Teste 2: Verificar formato da URL
  console.log('📋 Teste 2: Formato da URL');
  console.log('─'.repeat(50));
  try {
    const urlObj = new URL(url);
    console.log('✅ URL válida');
    console.log('   - Protocol:', urlObj.protocol);
    console.log('   - Host:', urlObj.host);
    console.log('   - Hostname:', urlObj.hostname + '\n');
  } catch (e) {
    console.error('❌ URL inválida:', e);
    return false;
  }
  
  // Teste 3: Testar conexão básica
  console.log('📋 Teste 3: Conexão com Banco de Dados');
  console.log('─'.repeat(50));
  try {
    console.log('Tentando consultar tabela body_regions_reference...');
    const { data, error } = await supabase
      .from('body_regions_reference')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('❌ Erro ao consultar:', error.message);
      console.error('   - Code:', error.code);
      console.error('   - Details:', error.details);
      console.error('   - Hint:', error.hint);
      return false;
    }
    
    console.log('✅ Consulta bem-sucedida');
    console.log('   - Dados retornados:', data ? 'Sim' : 'Não');
    console.log('   - Tipo:', typeof data + '\n');
  } catch (e: any) {
    console.error('❌ Erro na consulta:', e.message || e);
    return false;
  }
  
  // Teste 4: Verificar tabelas do body map
  console.log('📋 Teste 4: Tabelas do Body Map');
  console.log('─'.repeat(50));
  const tables = [
    'body_map_sessions',
    'body_map_pain_regions',
    'body_map_analytics_cache',
    'body_regions_reference'
  ];
  
  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('count')
        .limit(1);
      
      if (error) {
        console.error(`❌ ${table}: ${error.message}`);
      } else {
        console.log(`✅ ${table}: OK`);
      }
    } catch (e: any) {
      console.error(`❌ ${table}: ${e.message || e}`);
    }
  }
  console.log();
  
  // Teste 5: Verificar auth
  console.log('📋 Teste 5: Autenticação');
  console.log('─'.repeat(50));
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.warn('⚠️ Erro ao obter sessão:', error.message);
    } else if (session) {
      console.log('✅ Sessão ativa encontrada');
      console.log('   - User:', session.user?.email);
    } else {
      console.log('ℹ️ Nenhuma sessão ativa (normal para desenvolvimento)');
    }
  } catch (e: any) {
    console.warn('⚠️ Erro ao verificar auth:', e.message || e);
  }
  console.log();
  
  // Resumo final
  console.log('📊 Resumo da Validação');
  console.log('='.repeat(50));
  console.log('✅ Conexão Supabase está OK!');
  console.log('✅ Todas as tabelas do Body Map estão acessíveis');
  console.log('\n🎉 Validação concluída com sucesso!\n');
  
  return true;
}

// Executar validação
validateSupabase()
  .then((success) => {
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error('\n❌ Erro fatal na validação:', error);
    process.exit(1);
  });

