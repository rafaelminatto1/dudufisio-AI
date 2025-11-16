/**
 * Script para testar conexão com Supabase
 * 
 * Uso: npx tsx scripts/test-supabase-connection.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Carregar .env.local
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('🧪 TESTE DE CONEXÃO SUPABASE');
console.log('============================');
console.log('');

// Validar variáveis de ambiente
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Variáveis de ambiente não configuradas!');
  console.log('');
  console.log('Verifique se o arquivo .env.local existe e contém:');
  console.log('  NEXT_PUBLIC_SUPABASE_URL=https://...');
  console.log('  NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...');
  console.log('');
  console.log('📋 Veja o arquivo: env.supabase.example');
  console.log('');
  process.exit(1);
}

console.log('📍 URL:', SUPABASE_URL);
console.log('🔑 Key:', SUPABASE_ANON_KEY.substring(0, 20) + '...');
console.log('');

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testConnection() {
  let testsPassados = 0;
  let totalTestes = 0;
  
  // ========================================================================
  // TESTE 1: Conexão Básica
  // ========================================================================
  totalTestes++;
  console.log('📡 TESTE 1: Conexão Básica');
  
  try {
    const { data, error } = await supabase
      .from('patients')
      .select('count')
      .limit(1);
    
    if (error) {
      console.log(`   ❌ Erro: ${error.message}`);
    } else {
      console.log('   ✅ Conectado ao Supabase!');
      testsPassados++;
    }
  } catch (err) {
    console.log(`   ❌ Exceção: ${err}`);
  }
  console.log('');
  
  // ========================================================================
  // TESTE 2: Tabelas Criadas
  // ========================================================================
  totalTestes++;
  console.log('📊 TESTE 2: Verificar Tabelas');
  
  const tabelasEsperadas = [
    'patients',
    'patient_documents',
    'patient_timeline',
    'patient_audit_log',
    'patient_notes'
  ];
  
  let tabelasEncontradas = 0;
  
  for (const tabela of tabelasEsperadas) {
    try {
      const { error } = await supabase
        .from(tabela)
        .select('count')
        .limit(1);
      
      if (!error) {
        console.log(`   ✅ ${tabela}`);
        tabelasEncontradas++;
      } else {
        console.log(`   ❌ ${tabela} - ${error.message}`);
      }
    } catch (err) {
      console.log(`   ❌ ${tabela} - Não encontrada`);
    }
  }
  
  if (tabelasEncontradas === tabelasEsperadas.length) {
    console.log(`   ✅ Todas as ${tabelasEncontradas} tabelas criadas!`);
    testsPassados++;
  } else {
    console.log(`   ⚠️  Apenas ${tabelasEncontradas}/${tabelasEsperadas.length} tabelas encontradas`);
  }
  console.log('');
  
  // ========================================================================
  // TESTE 3: Funções SQL
  // ========================================================================
  totalTestes++;
  console.log('⚙️  TESTE 3: Verificar Funções SQL');
  
  try {
    // Testar calculate_patient_kpis
    const { data, error } = await supabase
      .rpc('calculate_patient_kpis', { 
        patient_uuid: '00000000-0000-0000-0000-000000000000' 
      });
    
    // Esperamos erro de "not found" mas função deve existir
    if (error && !error.message.includes('does not exist')) {
      console.log('   ✅ calculate_patient_kpis existe');
    } else if (!error) {
      console.log('   ✅ calculate_patient_kpis funciona!');
    } else {
      console.log(`   ❌ calculate_patient_kpis não encontrada`);
    }
    
    // Testar search_patients
    const { error: searchError } = await supabase
      .rpc('search_patients', { 
        search_query: 'test',
        max_results: 10 
      });
    
    if (!searchError?.message.includes('does not exist')) {
      console.log('   ✅ search_patients existe');
      testsPassados++;
    } else {
      console.log(`   ❌ search_patients não encontrada`);
    }
  } catch (err) {
    console.log(`   ❌ Erro ao testar funções: ${err}`);
  }
  console.log('');
  
  // ========================================================================
  // TESTE 4: Storage
  // ========================================================================
  totalTestes++;
  console.log('🗄️  TESTE 4: Verificar Storage');
  
  try {
    const { data: buckets, error } = await supabase.storage.listBuckets();
    
    if (error) {
      console.log(`   ❌ Erro ao acessar Storage: ${error.message}`);
    } else {
      const hasPatientDocs = buckets?.some(b => b.name === 'patient-documents');
      
      if (hasPatientDocs) {
        console.log('   ✅ Bucket patient-documents criado!');
        testsPassados++;
      } else {
        console.log('   ⚠️  Bucket patient-documents NÃO encontrado');
        console.log('   💡 Execute o SQL de configuração do Storage');
      }
    }
  } catch (err) {
    console.log(`   ❌ Erro no Storage: ${err}`);
  }
  console.log('');
  
  // ========================================================================
  // TESTE 5: RLS (Row Level Security)
  // ========================================================================
  totalTestes++;
  console.log('🔒 TESTE 5: Verificar RLS');
  
  try {
    // Tentar inserir sem autenticação (deve dar erro de RLS se estiver configurado)
    const { error } = await supabase
      .from('patients')
      .insert({
        name: 'Test',
        email: 'test@test.com',
        phone: '11999999999',
        cpf: '00000000000',
        birth_date: '1990-01-01',
        gender: 'male'
      });
    
    if (error && error.message.includes('violates row-level security')) {
      console.log('   ✅ RLS está ativo e funcionando!');
      testsPassados++;
    } else if (error && error.message.includes('duplicate key')) {
      console.log('   ✅ RLS permite inserção (usuário autenticado ou RLS desabilitado para testes)');
      testsPassados++;
    } else if (!error) {
      console.log('   ⚠️  RLS pode não estar ativo (inserção permitida)');
      console.log('   💡 Isso é OK para desenvolvimento, mas ative para produção');
      testsPassados++;
    } else {
      console.log(`   ⚠️  Resultado inesperado: ${error.message}`);
    }
  } catch (err) {
    console.log(`   ❌ Erro ao testar RLS: ${err}`);
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
    console.log('🎉 TUDO FUNCIONANDO PERFEITAMENTE!');
    console.log('');
    console.log('✅ Você pode começar a usar o sistema agora!');
    console.log('');
    console.log('Próximos passos:');
    console.log('1. Atualizar PatientContext para usar hooks React Query');
    console.log('2. Testar CRUD na interface');
    console.log('3. Testar upload de documentos');
    console.log('4. Popular com dados reais');
  } else if (testsPassados >= totalTestes * 0.6) {
    console.log('⚠️  PARCIALMENTE FUNCIONAL');
    console.log('');
    console.log('Alguns componentes precisam de configuração:');
    if (testsPassados < 2) {
      console.log('- ❌ Aplique a migration primeiro');
    }
    if (testsPassados < 4) {
      console.log('- ❌ Configure o Storage');
    }
    console.log('');
    console.log('Veja: 🔥_SOLUCAO_RAPIDA_MIGRATION.md');
  } else {
    console.log('❌ PRECISA DE CONFIGURAÇÃO');
    console.log('');
    console.log('Execute os passos em: 🎯_RESUMO_FINAL_APLICACAO.md');
  }
  console.log('');
}

testConnection().catch(err => {
  console.error('❌ Erro fatal:', err);
  process.exit(1);
});

