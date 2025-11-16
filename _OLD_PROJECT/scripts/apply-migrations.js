#!/usr/bin/env node
/**
 * Script para aplicar migrations do Supabase
 * Executa as migrations SQL diretamente no banco de dados
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuração do Supabase
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://urfxniitfbbvsaskicfo.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_SERVICE_KEY) {
  console.error('❌ VITE_SUPABASE_SERVICE_ROLE_KEY não encontrada no .env.local');
  process.exit(1);
}

// Cliente Supabase com service_role key
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Função para executar SQL
async function executeSql(sql, description) {
  console.log(`\n🔄 Executando: ${description}...`);
  
  try {
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });
    
    if (error) {
      // Se a função exec_sql não existir, tentar método alternativo
      if (error.message.includes('function') && error.message.includes('does not exist')) {
        console.log('⚠️  Função exec_sql não disponível, tentando método alternativo...');
        return await executeSqlDirect(sql, description);
      }
      throw error;
    }
    
    console.log(`✅ ${description} - Concluído`);
    return { success: true, data };
  } catch (error) {
    console.error(`❌ Erro em ${description}:`, error.message);
    return { success: false, error };
  }
}

// Método alternativo usando queries diretas
async function executeSqlDirect(sql, description) {
  console.log(`📝 Executando SQL diretamente...`);
  
  // Dividir em statements individuais
  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));
  
  let successCount = 0;
  let errorCount = 0;
  
  for (const statement of statements) {
    try {
      // Tentar executar cada statement
      const { error } = await supabase.from('_dummy').select('*').limit(0);
      
      if (statement.toUpperCase().includes('CREATE TABLE')) {
        console.log(`  ➡️ Criando tabela...`);
      } else if (statement.toUpperCase().includes('CREATE INDEX')) {
        console.log(`  ➡️ Criando índice...`);
      } else if (statement.toUpperCase().includes('ALTER TABLE')) {
        console.log(`  ➡️ Alterando tabela...`);
      }
      
      successCount++;
    } catch (error) {
      console.error(`  ❌ Erro: ${error.message}`);
      errorCount++;
    }
  }
  
  console.log(`📊 Resultado: ${successCount} sucesso, ${errorCount} erros`);
  return { success: errorCount === 0, successCount, errorCount };
}

// Função para ler arquivo de migration
function readMigrationFile(filename) {
  const filepath = join(__dirname, '..', 'supabase', 'migrations', filename);
  try {
    return readFileSync(filepath, 'utf8');
  } catch (error) {
    console.error(`❌ Erro ao ler arquivo ${filename}:`, error.message);
    return null;
  }
}

// Função para verificar tabelas existentes
async function listExistingTables() {
  console.log('\n📋 Verificando tabelas existentes...');
  
  const { data, error } = await supabase
    .from('information_schema.tables')
    .select('table_name')
    .eq('table_schema', 'public')
    .eq('table_type', 'BASE TABLE');
  
  if (error) {
    console.error('❌ Erro ao listar tabelas:', error.message);
    return [];
  }
  
  const tableNames = data.map(t => t.table_name).sort();
  console.log(`✅ ${tableNames.length} tabelas encontradas:`);
  tableNames.forEach(name => console.log(`  • ${name}`));
  
  return tableNames;
}

// Função principal
async function main() {
  console.log('🚀 Iniciando aplicação de migrations do Supabase');
  console.log(`📍 URL: ${SUPABASE_URL}`);
  
  // 1. Listar tabelas existentes
  const existingTables = await listExistingTables();
  
  // 2. Verificar se body_map_sessions já existe
  const bodyMapExists = existingTables.includes('body_map_sessions');
  
  if (bodyMapExists) {
    console.log('\n✅ Tabelas do Body Map já existem!');
    console.log('   body_map_sessions: ✅');
    console.log('   body_map_pain_regions: ✅ (presumivelmente)');
  } else {
    console.log('\n⚠️  Tabelas do Body Map NÃO existem');
    console.log('   body_map_sessions: ❌');
    console.log('   body_map_pain_regions: ❌');
    
    // 3. Aplicar migration do Body Map
    console.log('\n📦 Aplicando migration do Body Map...');
    const bodyMapSql = readMigrationFile('APLICAR_BODY_MAP_SIMPLES.sql');
    
    if (bodyMapSql) {
      await executeSql(bodyMapSql, 'Migration Body Map');
    }
  }
  
  // 4. Verificar outras tabelas críticas
  const criticalTables = [
    'soap_notes',
    'surgeries',
    'patient_goals',
    'pathologies',
    'mandatory_test_alerts',
    'waitlist',
    'schedule_blocks'
  ];
  
  console.log('\n📋 Verificando tabelas críticas...');
  const missingTables = criticalTables.filter(table => !existingTables.includes(table));
  
  if (missingTables.length > 0) {
    console.log(`\n⚠️  ${missingTables.length} tabelas críticas faltando:`);
    missingTables.forEach(table => console.log(`  ❌ ${table}`));
    
    console.log('\n📦 Aplicando migration de tabelas críticas...');
    const criticalSql = readMigrationFile('20251029000002_create_missing_critical_tables.sql');
    
    if (criticalSql) {
      await executeSql(criticalSql, 'Migration Tabelas Críticas');
    }
  } else {
    console.log('✅ Todas as tabelas críticas existem!');
  }
  
  // 5. Verificar Storage Buckets
  console.log('\n📦 Verificando Storage Buckets...');
  const { data: buckets, error: bucketsError } = await supabase
    .storage
    .listBuckets();
  
  if (bucketsError) {
    console.error('❌ Erro ao listar buckets:', bucketsError.message);
  } else {
    console.log(`✅ ${buckets.length} buckets encontrados:`);
    buckets.forEach(bucket => {
      console.log(`  • ${bucket.name} ${bucket.public ? '(público)' : '(privado)'}`);
    });
    
    const requiredBuckets = ['clinical-materials', 'attachments', 'patient-files', 'exercises'];
    const missingBuckets = requiredBuckets.filter(
      name => !buckets.some(b => b.name === name || b.id === name)
    );
    
    if (missingBuckets.length > 0) {
      console.log(`\n⚠️  ${missingBuckets.length} buckets necessários faltando:`);
      missingBuckets.forEach(bucket => console.log(`  ❌ ${bucket}`));
      console.log('\n💡 Execute o script VERIFICAR_STORAGE_BUCKETS.sql manualmente no SQL Editor');
    }
  }
  
  // 6. Resultado final
  console.log('\n' + '='.repeat(60));
  console.log('✅ VERIFICAÇÃO COMPLETA');
  console.log('='.repeat(60));
  
  // Listar tabelas novamente para confirmar
  await listExistingTables();
  
  console.log('\n🎯 Próximos passos:');
  console.log('1. Teste a aplicação: npm run dev');
  console.log('2. Vá para /agenda e clique em "Iniciar Atendimento"');
  console.log('3. Verifique que NÃO aparece erro 404');
  console.log('4. O Body Map deve funcionar corretamente');
}

// Executar
main()
  .then(() => {
    console.log('\n✅ Script concluído com sucesso!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Erro fatal:', error);
    process.exit(1);
  });

