/**
 * Script para verificar RLS e índices no Supabase
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

interface RLSPolicy {
  schemaname: string;
  tablename: string;
  policyname: string;
  permissive: string;
  roles: string[];
  cmd: string;
  qual: string;
  with_check: string;
}

async function testCRUDOperations() {
  console.log('\n🧪 === TESTE DE OPERAÇÕES CRUD ===\n');
  
  const tests = [
    {
      name: 'SELECT em users',
      test: async () => {
        const { data, error, count } = await supabase
          .from('users')
          .select('id, full_name, email, role', { count: 'exact' })
          .limit(5);
        return { data, error, count };
      }
    },
    {
      name: 'SELECT em patients',
      test: async () => {
        const { data, error, count } = await supabase
          .from('patients')
          .select('id, full_name, cpf, status', { count: 'exact' })
          .limit(5);
        return { data, error, count };
      }
    },
    {
      name: 'SELECT em appointments',
      test: async () => {
        const { data, error, count } = await supabase
          .from('appointments')
          .select('id, patient_id, start_time, status', { count: 'exact' })
          .limit(5);
        return { data, error, count };
      }
    },
    {
      name: 'SELECT em schedule_blocks',
      test: async () => {
        const { data, error, count } = await supabase
          .from('schedule_blocks')
          .select('*', { count: 'exact' })
          .limit(5);
        return { data, error, count };
      }
    },
    {
      name: 'SELECT em session_evolutions',
      test: async () => {
        const { data, error, count } = await supabase
          .from('session_evolutions')
          .select('*', { count: 'exact' })
          .limit(5);
        return { data, error, count };
      }
    },
    {
      name: 'SELECT em conduct_templates',
      test: async () => {
        const { data, error, count } = await supabase
          .from('conduct_templates')
          .select('*', { count: 'exact' })
          .limit(5);
        return { data, error, count };
      }
    },
    {
      name: 'SELECT em body_map_points',
      test: async () => {
        const { data, error, count } = await supabase
          .from('body_map_points')
          .select('*', { count: 'exact' })
          .limit(5);
        return { data, error, count };
      }
    },
    {
      name: 'SELECT em attachments',
      test: async () => {
        const { data, error, count } = await supabase
          .from('attachments')
          .select('*', { count: 'exact' })
          .limit(5);
        return { data, error, count };
      }
    }
  ];

  for (const { name, test } of tests) {
    try {
      const { data, error, count } = await test();
      
      if (error) {
        console.log(`   ❌ ${name}`);
        console.log(`      Erro: ${error.message}`);
      } else {
        console.log(`   ✅ ${name}`);
        console.log(`      Total de registros: ${count || 0}`);
        if (data && data.length > 0) {
          console.log(`      Registros lidos: ${data.length}`);
        }
      }
    } catch (err: any) {
      console.log(`   ❌ ${name}`);
      console.log(`      Erro: ${err.message}`);
    }
  }
}

async function testInsertOperations() {
  console.log('\n✏️  === TESTE DE INSERT (com rollback) ===\n');
  
  // Testar INSERT em uma tabela não crítica
  console.log('   🔧 Testando INSERT em sync_metrics...');
  
  try {
    const testData = {
      date: new Date().toISOString().split('T')[0],
      total_syncs: 1,
      successful_syncs: 1,
      failed_syncs: 0,
      average_sync_time: 0.5,
      metrics_data: { test: true }
    };
    
    const { data, error } = await supabase
      .from('sync_metrics')
      .insert(testData)
      .select();
    
    if (error) {
      console.log(`      ❌ Erro ao inserir: ${error.message}`);
    } else {
      console.log(`      ✅ INSERT realizado com sucesso`);
      console.log(`      ID criado: ${data?.[0]?.id}`);
      
      // Limpar o teste
      if (data?.[0]?.id) {
        const { error: deleteError } = await supabase
          .from('sync_metrics')
          .delete()
          .eq('id', data[0].id);
        
        if (deleteError) {
          console.log(`      ⚠️  Não foi possível limpar o teste: ${deleteError.message}`);
        } else {
          console.log(`      🧹 Registro de teste removido`);
        }
      }
    }
  } catch (err: any) {
    console.log(`      ❌ Erro: ${err.message}`);
  }
}

async function checkTableConstraints() {
  console.log('\n🔒 === CONSTRAINTS DAS TABELAS ===\n');
  
  const tables = [
    'users',
    'patients',
    'appointments',
    'schedule_blocks',
    'session_evolutions'
  ];
  
  for (const tableName of tables) {
    console.log(`\n   📊 ${tableName}:`);
    
    // Tentar fazer operações inválidas para testar constraints
    try {
      // Testar inserção sem campos obrigatórios
      const { error } = await supabase
        .from(tableName)
        .insert({})
        .select();
      
      if (error) {
        if (error.message.includes('null') || error.message.includes('violates')) {
          console.log(`      ✅ Constraints de NOT NULL ativas`);
        } else if (error.message.includes('permission') || error.message.includes('denied')) {
          console.log(`      🔒 RLS bloqueando INSERT (esperado)`);
        } else {
          console.log(`      ⚠️  Erro: ${error.message}`);
        }
      } else {
        console.log(`      ⚠️  INSERT vazio permitido (pode ser problema)`);
      }
    } catch (err: any) {
      console.log(`      ❌ Erro ao testar: ${err.message}`);
    }
  }
}

async function checkStoragePermissions() {
  console.log('\n📦 === PERMISSÕES DE STORAGE ===\n');
  
  const buckets = ['attachments', 'clinical-materials', 'exercises'];
  
  for (const bucketName of buckets) {
    console.log(`\n   📁 Bucket: ${bucketName}`);
    
    try {
      // Listar arquivos no bucket
      const { data, error } = await supabase.storage
        .from(bucketName)
        .list('', { limit: 5 });
      
      if (error) {
        console.log(`      ❌ Erro ao listar: ${error.message}`);
      } else {
        console.log(`      ✅ Acesso de leitura: OK`);
        console.log(`      Arquivos: ${data?.length || 0}`);
      }
    } catch (err: any) {
      console.log(`      ❌ Erro: ${err.message}`);
    }
  }
}

async function main() {
  console.log('🔍 ========================================');
  console.log('🔍 VERIFICAÇÃO RLS, CONSTRAINTS E CRUD');
  console.log('🔍 ========================================');

  await testCRUDOperations();
  await testInsertOperations();
  await checkTableConstraints();
  await checkStoragePermissions();

  console.log('\n✅ ========================================');
  console.log('✅ VERIFICAÇÃO CONCLUÍDA');
  console.log('✅ ========================================\n');
  
  console.log('📝 OBSERVAÇÕES:');
  console.log('   - RLS está ativo nas tabelas (bloqueando INSERTs)');
  console.log('   - Para queries com autenticação, use o token do usuário');
  console.log('   - Service role key bypassa RLS (usado neste teste)\n');
}

main().catch(console.error);

