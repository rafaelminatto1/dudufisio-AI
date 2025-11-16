#!/usr/bin/env node
/**
 * Script para verificar o estado do banco de dados Supabase
 * Verifica tabelas existentes e fornece instruções para aplicar migrations
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Carregar .env.local
dotenv.config({ path: join(__dirname, '..', '.env.local') });

// Configuração do Supabase
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Credenciais do Supabase não encontradas no .env.local');
  process.exit(1);
}

// Cliente Supabase
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Função para listar tabelas usando query SQL
async function listTables() {
  const { data, error } = await supabase
    .rpc('exec_query', {
      query: `
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
          AND table_type = 'BASE TABLE'
        ORDER BY table_name;
      `
    });
  
  if (error) {
    // Método alternativo - tentar listar algumas tabelas conhecidas
    console.log('⚠️  Não foi possível listar tabelas via RPC');
    return null;
  }
  
  return data.map(row => row.table_name);
}

// Função para verificar se uma tabela existe
async function tableExists(tableName) {
  try {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .limit(0);
    
    return !error || !error.message.includes('does not exist');
  } catch (error) {
    return false;
  }
}

async function main() {
  console.log('🔍 AUDITORIA DO BANCO DE DADOS SUPABASE');
  console.log('='.repeat(60));
  console.log(`📍 URL: ${SUPABASE_URL}`);
  console.log('');
  
  // Tabelas críticas que devem existir
  const criticalTables = {
    'Core': ['users', 'patients', 'appointments', 'therapists'],
    'Body Map (CRÍTICO)': ['body_map_sessions', 'body_map_pain_regions'],
    'Sessões': ['soap_notes', 'session_evolutions'],
    'Saúde': ['surgeries', 'patient_goals', 'pathologies', 'mandatory_test_alerts'],
    'Agenda': ['waitlist', 'schedule_blocks'],
  };
  
  console.log('📋 Verificando tabelas críticas...\n');
  
  const missingTables = [];
  let bodyMapMissing = false;
  
  for (const [category, tables] of Object.entries(criticalTables)) {
    console.log(`\n${category}:`);
    
    for (const table of tables) {
      const exists = await tableExists(table);
      const status = exists ? '✅' : '❌';
      console.log(`  ${status} ${table}`);
      
      if (!exists) {
        missingTables.push(table);
        if (table === 'body_map_sessions' || table === 'body_map_pain_regions') {
          bodyMapMissing = true;
        }
      }
    }
  }
  
  // Verificar Storage Buckets
  console.log('\n\n📦 Verificando Storage Buckets...\n');
  
  try {
    const { data: buckets, error } = await supabase.storage.listBuckets();
    
    if (error) {
      console.log('⚠️  Não foi possível listar buckets:', error.message);
    } else {
      const requiredBuckets = ['clinical-materials', 'attachments', 'patient-files', 'exercises'];
      
      console.log('Storage Buckets:');
      for (const bucketName of requiredBuckets) {
        const exists = buckets.some(b => b.name === bucketName || b.id === bucketName);
        const status = exists ? '✅' : '❌';
        console.log(`  ${status} ${bucketName}`);
      }
    }
  } catch (error) {
    console.log('⚠️  Erro ao verificar buckets:', error.message);
  }
  
  // Resumo e instruções
  console.log('\n\n' + '='.repeat(60));
  console.log('📊 RESUMO DA AUDITORIA');
  console.log('='.repeat(60));
  
  if (missingTables.length === 0) {
    console.log('\n✅ TODAS AS TABELAS CRÍTICAS EXISTEM!');
    console.log('   O banco de dados está completo.');
  } else {
    console.log(`\n⚠️  ${missingTables.length} TABELAS FALTANDO:`);
    missingTables.forEach(table => console.log(`   ❌ ${table}`));
  }
  
  // Instruções específicas
  console.log('\n' + '='.repeat(60));
  console.log('🚀 PRÓXIMOS PASSOS');
  console.log('='.repeat(60));
  
  if (bodyMapMissing) {
    console.log('\n⚠️  CRÍTICO: Tabelas do Body Map estão faltando!');
    console.log('   Isso causa o erro 404 no modal de evolução.\n');
    console.log('📝 COMO CORRIGIR:');
    console.log('   1. Acesse: https://supabase.com/dashboard/project/urfxniitfbbvsaskicfo/editor');
    console.log('   2. Clique em "SQL Editor"');
    console.log('   3. Copie o conteúdo do arquivo:');
    console.log('      supabase/migrations/APLICAR_BODY_MAP_SIMPLES.sql');
    console.log('   4. Cole no SQL Editor');
    console.log('   5. Clique em "Run" (Ctrl+Enter)');
    console.log('   6. Aguarde "Success" ✅\n');
  }
  
  if (missingTables.length > 2) {
    console.log('\n💡 OUTRAS TABELAS FALTANTES:');
    console.log('   Para criar todas as tabelas críticas:');
    console.log('   1. Acesse o SQL Editor do Supabase');
    console.log('   2. Execute o arquivo:');
    console.log('      supabase/migrations/20251029000002_create_missing_critical_tables.sql\n');
  }
  
  console.log('\n📌 ARQUIVOS DE MIGRATION DISPONÍVEIS:');
  console.log('   • APLICAR_BODY_MAP_SIMPLES.sql - Body Map (CRÍTICO)');
  console.log('   • 20251029000002_create_missing_critical_tables.sql - Outras tabelas');
  console.log('   • VERIFICAR_STORAGE_BUCKETS.sql - Storage buckets');
  console.log('   • GUIA_COMPLETO_AUDITORIA.md - Guia completo');
  
  console.log('\n✅ TESTE APÓS APLICAR:');
  console.log('   1. npm run dev');
  console.log('   2. Vá para /agenda');
  console.log('   3. Clique em "Iniciar Atendimento"');
  console.log('   4. Verifique que NÃO aparece erro 404');
  console.log('');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('\n❌ Erro:', error.message);
    process.exit(1);
  });

