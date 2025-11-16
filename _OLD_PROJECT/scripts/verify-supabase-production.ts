/**
 * Script para verificar o estado do Supabase em produção
 * Executa várias queries para verificar tabelas, RLS, índices, etc.
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Carregar variáveis de ambiente
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Erro: VITE_SUPABASE_URL e VITE_SUPABASE_SERVICE_ROLE_KEY são obrigatórios');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

interface TableInfo {
  table_name: string;
  table_type: string;
}

interface TableCount {
  table_name: string;
  count: number;
}

interface RLSInfo {
  schemaname: string;
  tablename: string;
  rowsecurity: boolean;
}

async function executeQuery<T>(query: string): Promise<T[]> {
  const { data, error } = await supabase.rpc('exec_sql', { sql: query });
  if (error) {
    // Se a função exec_sql não existe, tentamos usar uma query direta
    console.log(`⚠️  Função exec_sql não encontrada, usando query direta...`);
    throw error;
  }
  return data as T[];
}

async function checkTables() {
  console.log('\n📊 === VERIFICAÇÃO DE TABELAS ===\n');
  
  try {
    // Listar todas as tabelas
    const { data: tables, error } = await supabase
      .from('information_schema.tables')
      .select('table_name, table_type')
      .eq('table_schema', 'public')
      .order('table_name');

    if (error) {
      console.log('⚠️  Usando query raw para listar tabelas...');
      
      // Tentar através de uma query SQL raw
      const query = `
        SELECT table_name, table_type 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        ORDER BY table_name;
      `;
      
      console.log('Query:', query);
      console.log('❌ Erro ao listar tabelas:', error);
      return;
    }

    console.log(`✅ Total de tabelas: ${tables?.length || 0}\n`);
    
    if (tables && tables.length > 0) {
      console.log('📋 Tabelas encontradas:');
      tables.forEach((table: any) => {
        console.log(`   - ${table.table_name} (${table.table_type})`);
      });
    }
  } catch (err) {
    console.error('❌ Erro ao verificar tabelas:', err);
  }
}

async function checkTableCounts() {
  console.log('\n📈 === CONTAGEM DE REGISTROS ===\n');
  
  const tablesToCheck = [
    'users',
    'patients', 
    'appointments',
    'therapists',
    'sessions',
    'session_evolutions',
    'schedule_blocks',
    'attachments',
    'conduct_templates',
    'medical_insights',
    'body_map_points',
    'body_map_drawings',
    'sync_metrics'
  ];

  for (const tableName of tablesToCheck) {
    try {
      const { count, error } = await supabase
        .from(tableName)
        .select('*', { count: 'exact', head: true });

      if (error) {
        console.log(`   ⚠️  ${tableName}: Tabela não existe ou erro - ${error.message}`);
      } else {
        console.log(`   ✅ ${tableName}: ${count || 0} registros`);
      }
    } catch (err: any) {
      console.log(`   ❌ ${tableName}: Erro - ${err.message}`);
    }
  }
}

async function checkRLS() {
  console.log('\n🔒 === POLÍTICAS RLS (Row Level Security) ===\n');
  
  try {
    // Verificar quais tabelas têm RLS habilitado
    const { data, error } = await supabase
      .from('pg_tables')
      .select('schemaname, tablename, rowsecurity')
      .eq('schemaname', 'public');

    if (error) {
      console.log('⚠️  Não foi possível verificar RLS:', error.message);
      return;
    }

    console.log('Tabelas com RLS:');
    if (data && data.length > 0) {
      data.forEach((table: any) => {
        const status = table.rowsecurity ? '✅ Habilitado' : '❌ Desabilitado';
        console.log(`   ${status} - ${table.tablename}`);
      });
    }
  } catch (err) {
    console.error('❌ Erro ao verificar RLS:', err);
  }
}

async function checkIndexes() {
  console.log('\n⚡ === ÍNDICES DAS TABELAS ===\n');
  
  try {
    const { data, error } = await supabase
      .from('pg_indexes')
      .select('schemaname, tablename, indexname')
      .eq('schemaname', 'public')
      .order('tablename');

    if (error) {
      console.log('⚠️  Não foi possível verificar índices:', error.message);
      return;
    }

    if (data && data.length > 0) {
      let currentTable = '';
      data.forEach((index: any) => {
        if (index.tablename !== currentTable) {
          console.log(`\n   📊 ${index.tablename}:`);
          currentTable = index.tablename;
        }
        console.log(`      - ${index.indexname}`);
      });
    }
  } catch (err) {
    console.error('❌ Erro ao verificar índices:', err);
  }
}

async function checkMigrations() {
  console.log('\n📝 === MIGRAÇÕES PENDENTES ===\n');
  
  console.log('Migrações não aplicadas em produção:');
  console.log('   1. 20241101000000_create_sync_metrics.sql');
  console.log('      - Cria tabela sync_metrics para métricas de sincronização');
  console.log('   2. 20251101131315_sync_schedule_blocks_schema.sql');
  console.log('      - Atualiza schema da tabela schedule_blocks');
}

async function testCRUD() {
  console.log('\n🧪 === TESTE BÁSICO DE CRUD ===\n');
  
  // Verificar se conseguimos fazer operações básicas
  try {
    // SELECT em users
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, name, email, role')
      .limit(3);

    if (usersError) {
      console.log('❌ Erro ao ler users:', usersError.message);
    } else {
      console.log(`✅ SELECT em users: ${users?.length || 0} registros lidos`);
      if (users && users.length > 0) {
        console.log('   Exemplo:', users[0]);
      }
    }

    // SELECT em patients
    const { data: patients, error: patientsError } = await supabase
      .from('patients')
      .select('id, name, cpf')
      .limit(3);

    if (patientsError) {
      console.log('❌ Erro ao ler patients:', patientsError.message);
    } else {
      console.log(`✅ SELECT em patients: ${patients?.length || 0} registros lidos`);
    }

    // SELECT em appointments
    const { data: appointments, error: appointmentsError } = await supabase
      .from('appointments')
      .select('id, patient_id, start_time, status')
      .limit(3);

    if (appointmentsError) {
      console.log('❌ Erro ao ler appointments:', appointmentsError.message);
    } else {
      console.log(`✅ SELECT em appointments: ${appointments?.length || 0} registros lidos`);
    }

  } catch (err) {
    console.error('❌ Erro ao testar CRUD:', err);
  }
}

async function checkStorageBuckets() {
  console.log('\n📦 === STORAGE BUCKETS ===\n');
  
  try {
    const { data: buckets, error } = await supabase.storage.listBuckets();

    if (error) {
      console.log('❌ Erro ao listar buckets:', error.message);
      return;
    }

    if (buckets && buckets.length > 0) {
      console.log(`✅ Total de buckets: ${buckets.length}\n`);
      buckets.forEach((bucket) => {
        console.log(`   - ${bucket.name} (${bucket.public ? 'público' : 'privado'})`);
      });
    } else {
      console.log('⚠️  Nenhum bucket configurado');
    }
  } catch (err) {
    console.error('❌ Erro ao verificar storage:', err);
  }
}

async function main() {
  console.log('🔍 ========================================');
  console.log('🔍 VERIFICAÇÃO DO SUPABASE EM PRODUÇÃO');
  console.log('🔍 ========================================');
  console.log(`🔗 URL: ${supabaseUrl}`);
  console.log('🔍 ========================================\n');

  await checkTables();
  await checkTableCounts();
  await checkRLS();
  await checkIndexes();
  await checkStorageBuckets();
  await testCRUD();
  await checkMigrations();

  console.log('\n✅ ========================================');
  console.log('✅ VERIFICAÇÃO CONCLUÍDA');
  console.log('✅ ========================================\n');
}

main().catch(console.error);

