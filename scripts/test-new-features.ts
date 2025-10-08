/**
 * Test Script for New Features
 * Script para testar as novas funcionalidades implementadas
 */

import { supabase } from '../lib/supabase';

async function testDatabaseConnectivity() {
  console.log('🔍 Testando conectividade com Supabase...');
  
  try {
    const { data, error } = await supabase.from('patients').select('count').limit(1);
    
    if (error) {
      console.error('❌ Erro de conexão:', error.message);
      return false;
    }
    
    console.log('✅ Conexão com Supabase OK!');
    return true;
  } catch (error) {
    console.error('❌ Erro:', error);
    return false;
  }
}

async function testRiskTables() {
  console.log('\n🔍 Testando tabelas de Risk Stratification...');
  
  const tables = [
    'risk_assessments',
    'risk_factors',
    'risk_recommendations',
    'risk_profiles',
    'risk_alerts',
  ];

  for (const table of tables) {
    try {
      const { error } = await supabase.from(table as any).select('count').limit(1);
      
      if (error) {
        console.log(`❌ Tabela ${table}: ${error.message}`);
      } else {
        console.log(`✅ Tabela ${table}: OK`);
      }
    } catch (error) {
      console.log(`❌ Tabela ${table}: Erro`);
    }
  }
}

async function testSportsTables() {
  console.log('\n🔍 Testando tabelas de Sports Rehabilitation...');
  
  const tables = [
    'athlete_profiles',
    'return_to_sport_criteria',
    'functional_tests',
    'performance_metrics',
    'load_monitoring',
  ];

  for (const table of tables) {
    try {
      const { error } = await supabase.from(table as any).select('count').limit(1);
      
      if (error) {
        console.log(`❌ Tabela ${table}: ${error.message}`);
      } else {
        console.log(`✅ Tabela ${table}: OK`);
      }
    } catch (error) {
      console.log(`❌ Tabela ${table}: Erro`);
    }
  }
}

async function runAllTests() {
  console.log('🚀 Iniciando testes das novas funcionalidades...\n');
  console.log('═'.repeat(60));
  
  const connected = await testDatabaseConnectivity();
  
  if (!connected) {
    console.log('\n❌ Não foi possível conectar ao Supabase.');
    console.log('   Verifique suas credenciais no .env.local');
    return;
  }
  
  await testRiskTables();
  await testSportsTables();
  
  console.log('\n' + '═'.repeat(60));
  console.log('\n✅ Testes concluídos!');
  console.log('\n💡 Próximo passo: Testar as páginas no navegador');
  console.log('   Execute: npm run dev');
  console.log('   Acesse: http://localhost:5173/population-health');
}

// Executar testes
runAllTests().catch(console.error);

export { runAllTests, testDatabaseConnectivity, testRiskTables, testSportsTables };

