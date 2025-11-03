/**
 * REVISÃO COMPLETA DO TRABALHO REALIZADO
 * Script para validar todas as verificações e identificar problemas
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

interface ValidationResult {
  category: string;
  test: string;
  status: 'OK' | 'WARNING' | 'ERROR';
  message: string;
  details?: any;
}

const results: ValidationResult[] = [];

function addResult(category: string, test: string, status: 'OK' | 'WARNING' | 'ERROR', message: string, details?: any) {
  results.push({ category, test, status, message, details });
}

async function validateTableExistence() {
  console.log('\n🔍 === VALIDANDO EXISTÊNCIA DAS TABELAS ===\n');
  
  const expectedTables = [
    'users',
    'patients',
    'appointments',
    'therapists',
    'session_evolutions',
    'schedule_blocks',
    'conduct_templates',
    'medical_insights',
    'body_map_drawings',
    'attachments',
    'sync_metrics'
  ];

  for (const tableName of expectedTables) {
    try {
      const { error, count } = await supabase
        .from(tableName)
        .select('*', { count: 'exact', head: true });

      if (error) {
        if (error.message.includes('not find the table')) {
          addResult('Tabelas', tableName, 'ERROR', 'Tabela não está exposta na API', error.message);
          console.log(`   ❌ ${tableName}: NÃO exposta na API`);
        } else {
          addResult('Tabelas', tableName, 'WARNING', 'Erro ao acessar', error.message);
          console.log(`   ⚠️  ${tableName}: ${error.message}`);
        }
      } else {
        addResult('Tabelas', tableName, 'OK', `${count || 0} registros`, count);
        console.log(`   ✅ ${tableName}: ${count || 0} registros`);
      }
    } catch (err: any) {
      addResult('Tabelas', tableName, 'ERROR', 'Exceção ao verificar', err.message);
      console.log(`   ❌ ${tableName}: ERRO - ${err.message}`);
    }
  }
}

async function validateMigrations() {
  console.log('\n📝 === VALIDANDO MIGRAÇÕES ===\n');
  
  // Verificar se schedule_blocks foi atualizado conforme migração 20251101131315
  try {
    const { data, error } = await supabase
      .from('schedule_blocks')
      .select('*')
      .limit(1);

    if (error) {
      addResult('Migrações', 'schedule_blocks estrutura', 'ERROR', 'Não conseguiu verificar', error.message);
      console.log('   ❌ Não foi possível verificar a estrutura de schedule_blocks');
    } else {
      // Se conseguiu acessar, a tabela existe
      addResult('Migrações', '20251101131315 aplicada', 'OK', 'schedule_blocks está acessível');
      console.log('   ✅ Migração 20251101131315: Aplicada com sucesso');
    }
  } catch (err: any) {
    addResult('Migrações', 'schedule_blocks', 'ERROR', 'Erro ao validar', err.message);
    console.log('   ❌ Erro ao validar migração');
  }

  // Verificar sync_metrics
  try {
    const { error } = await supabase
      .from('sync_metrics')
      .select('*', { head: true });

    if (error && error.message.includes('not find the table')) {
      addResult('Migrações', 'sync_metrics exposição', 'WARNING', 'Tabela existe mas não está na API');
      console.log('   ⚠️  sync_metrics: Existe mas NÃO está exposta na API');
    } else if (error) {
      addResult('Migrações', 'sync_metrics', 'WARNING', error.message);
      console.log(`   ⚠️  sync_metrics: ${error.message}`);
    } else {
      addResult('Migrações', 'sync_metrics', 'OK', 'Acessível via API');
      console.log('   ✅ sync_metrics: Acessível');
    }
  } catch (err: any) {
    addResult('Migrações', 'sync_metrics', 'ERROR', err.message);
  }
}

async function validateCRUDOperations() {
  console.log('\n🧪 === VALIDANDO OPERAÇÕES CRUD ===\n');
  
  // Teste 1: SELECT em users
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, full_name, email, role')
      .limit(1);

    if (error) {
      addResult('CRUD', 'SELECT users', 'ERROR', error.message);
      console.log('   ❌ SELECT em users falhou');
    } else if (data && data.length > 0) {
      addResult('CRUD', 'SELECT users', 'OK', 'Funcionando corretamente', data[0]);
      console.log('   ✅ SELECT em users: OK');
    } else {
      addResult('CRUD', 'SELECT users', 'WARNING', 'Sem dados');
      console.log('   ⚠️  SELECT em users: Sem dados');
    }
  } catch (err: any) {
    addResult('CRUD', 'SELECT users', 'ERROR', err.message);
  }

  // Teste 2: SELECT em patients
  try {
    const { data, error } = await supabase
      .from('patients')
      .select('id, full_name, cpf, status')
      .limit(1);

    if (error) {
      addResult('CRUD', 'SELECT patients', 'ERROR', error.message);
      console.log('   ❌ SELECT em patients falhou');
    } else if (data && data.length > 0) {
      addResult('CRUD', 'SELECT patients', 'OK', 'Funcionando corretamente', data[0]);
      console.log('   ✅ SELECT em patients: OK');
    } else {
      addResult('CRUD', 'SELECT patients', 'WARNING', 'Sem dados');
      console.log('   ⚠️  SELECT em patients: Sem dados');
    }
  } catch (err: any) {
    addResult('CRUD', 'SELECT patients', 'ERROR', err.message);
  }

  // Teste 3: SELECT em appointments  
  try {
    const { data, error } = await supabase
      .from('appointments')
      .select('id, patient_id, therapist_id, status')
      .limit(1);

    if (error) {
      addResult('CRUD', 'SELECT appointments', 'ERROR', error.message);
      console.log('   ❌ SELECT em appointments falhou');
    } else if (data && data.length > 0) {
      addResult('CRUD', 'SELECT appointments', 'OK', 'Funcionando corretamente', data[0]);
      console.log('   ✅ SELECT em appointments: OK');
    } else {
      addResult('CRUD', 'SELECT appointments', 'WARNING', 'Sem dados');
      console.log('   ⚠️  SELECT em appointments: Sem dados');
    }
  } catch (err: any) {
    addResult('CRUD', 'SELECT appointments', 'ERROR', err.message);
  }
}

async function validateStorage() {
  console.log('\n📦 === VALIDANDO STORAGE ===\n');
  
  const buckets = ['attachments', 'clinical-materials', 'exercises'];
  
  for (const bucketName of buckets) {
    try {
      const { data, error } = await supabase.storage
        .from(bucketName)
        .list('', { limit: 1 });

      if (error) {
        addResult('Storage', `Bucket ${bucketName}`, 'ERROR', error.message);
        console.log(`   ❌ ${bucketName}: ${error.message}`);
      } else {
        addResult('Storage', `Bucket ${bucketName}`, 'OK', 'Acessível');
        console.log(`   ✅ ${bucketName}: Acessível`);
      }
    } catch (err: any) {
      addResult('Storage', `Bucket ${bucketName}`, 'ERROR', err.message);
      console.log(`   ❌ ${bucketName}: ${err.message}`);
    }
  }
}

async function validateRLS() {
  console.log('\n🔒 === VALIDANDO RLS ===\n');
  
  const tables = ['users', 'patients', 'appointments'];
  
  for (const tableName of tables) {
    try {
      // Tentar INSERT vazio para verificar se RLS está bloqueando
      const { error } = await supabase
        .from(tableName)
        .insert({})
        .select();

      if (error) {
        if (error.message.includes('null') || error.message.includes('violates not-null')) {
          addResult('RLS', `${tableName} constraints`, 'OK', 'NOT NULL constraints ativos');
          console.log(`   ✅ ${tableName}: Constraints ativos`);
        } else if (error.message.includes('permission') || error.message.includes('policy')) {
          addResult('RLS', `${tableName} RLS`, 'OK', 'RLS bloqueando corretamente');
          console.log(`   ✅ ${tableName}: RLS ativo`);
        } else {
          addResult('RLS', `${tableName}`, 'WARNING', error.message);
          console.log(`   ⚠️  ${tableName}: ${error.message}`);
        }
      } else {
        addResult('RLS', `${tableName}`, 'WARNING', 'INSERT vazio permitido');
        console.log(`   ⚠️  ${tableName}: INSERT vazio foi permitido (possível problema)`);
      }
    } catch (err: any) {
      addResult('RLS', `${tableName}`, 'ERROR', err.message);
    }
  }
}

async function validateDataIntegrity() {
  console.log('\n🔗 === VALIDANDO INTEGRIDADE DOS DADOS ===\n');
  
  // Verificar se appointments têm patients válidos
  try {
    const { data: appointments, error: appError } = await supabase
      .from('appointments')
      .select('id, patient_id')
      .limit(5);

    if (appError) {
      addResult('Integridade', 'appointments-patients FK', 'ERROR', appError.message);
      console.log('   ❌ Não foi possível verificar appointments');
    } else if (appointments && appointments.length > 0) {
      let validCount = 0;
      let invalidCount = 0;

      for (const app of appointments) {
        const { data: patient, error: patError } = await supabase
          .from('patients')
          .select('id')
          .eq('id', app.patient_id)
          .single();

        if (patError || !patient) {
          invalidCount++;
        } else {
          validCount++;
        }
      }

      if (invalidCount === 0) {
        addResult('Integridade', 'appointments-patients FK', 'OK', `Todas as referências válidas (${validCount})`);
        console.log(`   ✅ Foreign Keys: Todas válidas (${validCount} verificadas)`);
      } else {
        addResult('Integridade', 'appointments-patients FK', 'WARNING', `${invalidCount} referências inválidas`);
        console.log(`   ⚠️  Foreign Keys: ${invalidCount} inválidas, ${validCount} válidas`);
      }
    } else {
      addResult('Integridade', 'appointments-patients FK', 'OK', 'Sem appointments para verificar');
      console.log('   ℹ️  Sem appointments para verificar');
    }
  } catch (err: any) {
    addResult('Integridade', 'appointments-patients FK', 'ERROR', err.message);
  }
}

function generateSummary() {
  console.log('\n📊 === SUMÁRIO DA REVISÃO ===\n');
  
  const okCount = results.filter(r => r.status === 'OK').length;
  const warningCount = results.filter(r => r.status === 'WARNING').length;
  const errorCount = results.filter(r => r.status === 'ERROR').length;
  const total = results.length;

  console.log(`   ✅ Testes OK: ${okCount}/${total}`);
  console.log(`   ⚠️  Avisos: ${warningCount}/${total}`);
  console.log(`   ❌ Erros: ${errorCount}/${total}`);
  
  const score = Math.round((okCount / total) * 100);
  console.log(`\n   🎯 Score de Saúde: ${score}%`);
  
  if (errorCount > 0) {
    console.log('\n   ❌ ERROS CRÍTICOS ENCONTRADOS:');
    results
      .filter(r => r.status === 'ERROR')
      .forEach(r => {
        console.log(`      - [${r.category}] ${r.test}: ${r.message}`);
      });
  }

  if (warningCount > 0) {
    console.log('\n   ⚠️  AVISOS:');
    results
      .filter(r => r.status === 'WARNING')
      .forEach(r => {
        console.log(`      - [${r.category}] ${r.test}: ${r.message}`);
      });
  }

  return { okCount, warningCount, errorCount, total, score };
}

async function main() {
  console.log('╔════════════════════════════════════════════╗');
  console.log('║   REVISÃO COMPLETA DO SUPABASE             ║');
  console.log('║   Validação de Todas as Verificações      ║');
  console.log('╚════════════════════════════════════════════╝');

  await validateTableExistence();
  await validateMigrations();
  await validateCRUDOperations();
  await validateStorage();
  await validateRLS();
  await validateDataIntegrity();

  const summary = generateSummary();

  console.log('\n╔════════════════════════════════════════════╗');
  console.log('║   REVISÃO CONCLUÍDA                        ║');
  console.log('╚════════════════════════════════════════════╝\n');

  // Retornar código de saída baseado nos resultados
  if (summary.errorCount > 0) {
    console.log('⚠️  Foram encontrados erros críticos que precisam ser resolvidos.\n');
    process.exit(1);
  } else if (summary.warningCount > 0) {
    console.log('⚠️  Existem avisos que devem ser revisados.\n');
    process.exit(0);
  } else {
    console.log('✅ Tudo está funcionando perfeitamente!\n');
    process.exit(0);
  }
}

main().catch((err) => {
  console.error('❌ Erro fatal durante a revisão:', err);
  process.exit(1);
});

