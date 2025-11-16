/**
 * Script de Monitoramento de Saúde do Supabase com Log Local
 * Gera relatórios JSON e logs para acompanhamento
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { writeFileSync, existsSync, mkdirSync } from 'fs';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Erro: VITE_SUPABASE_URL e VITE_SUPABASE_SERVICE_ROLE_KEY são obrigatórios');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

interface HealthMetrics {
  timestamp: string;
  score: number;
  status: 'healthy' | 'warning' | 'critical';
  tables: {
    [key: string]: {
      accessible: boolean;
      count: number;
      error?: string;
    };
  };
  storage: {
    [key: string]: {
      accessible: boolean;
      error?: string;
    };
  };
  integrity: {
    total_checks: number;
    valid: number;
    invalid: number;
    percentage: number;
  };
  issues: string[];
  summary: string;
}

async function checkTableHealth(tableName: string): Promise<{ accessible: boolean; count: number; error?: string }> {
  try {
    const { count, error } = await supabase
      .from(tableName)
      .select('*', { count: 'exact', head: true });

    if (error) {
      return { accessible: false, count: 0, error: error.message };
    }

    return { accessible: true, count: count || 0 };
  } catch (err: any) {
    return { accessible: false, count: 0, error: err.message };
  }
}

async function checkStorageHealth(bucketName: string): Promise<{ accessible: boolean; error?: string }> {
  try {
    const { error } = await supabase.storage
      .from(bucketName)
      .list('', { limit: 1 });

    if (error) {
      return { accessible: false, error: error.message };
    }

    return { accessible: true };
  } catch (err: any) {
    return { accessible: false, error: err.message };
  }
}

async function checkDataIntegrity(): Promise<{ total: number; valid: number; invalid: number }> {
  let total = 0;
  let valid = 0;
  let invalid = 0;

  try {
    // Verificar appointments com patient_id válido
    const { data: appointments } = await supabase
      .from('appointments')
      .select('id, patient_id')
      .limit(100);

    if (appointments) {
      for (const app of appointments) {
        total++;
        const { data: patient } = await supabase
          .from('patients')
          .select('id')
          .eq('id', app.patient_id)
          .single();

        if (patient) {
          valid++;
        } else {
          invalid++;
        }
      }
    }
  } catch (err: any) {
    // Erro ao verificar integridade
  }

  return { total, valid, invalid };
}

async function performHealthCheck(): Promise<HealthMetrics> {
  const timestamp = new Date().toISOString();
  const metrics: HealthMetrics = {
    timestamp,
    score: 100,
    status: 'healthy',
    tables: {},
    storage: {},
    integrity: {
      total_checks: 0,
      valid: 0,
      invalid: 0,
      percentage: 100
    },
    issues: [],
    summary: ''
  };

  console.log('\n🔍 === MONITORAMENTO DE SAÚDE DO SUPABASE ===\n');

  // Verificar tabelas
  const tables = [
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

  console.log('📊 Verificando tabelas...\n');
  for (const table of tables) {
    const result = await checkTableHealth(table);
    metrics.tables[table] = result;

    if (!result.accessible) {
      metrics.score -= 5;
      metrics.issues.push(`Tabela ${table} não acessível: ${result.error}`);
      console.log(`   ❌ ${table}: Não acessível`);
    } else {
      console.log(`   ✅ ${table}: ${result.count} registros`);
    }
  }

  // Verificar storage
  const buckets = ['attachments', 'clinical-materials', 'exercises'];
  
  console.log('\n📦 Verificando storage buckets...\n');
  for (const bucket of buckets) {
    const result = await checkStorageHealth(bucket);
    metrics.storage[bucket] = result;

    if (!result.accessible) {
      metrics.score -= 5;
      metrics.issues.push(`Bucket ${bucket} não acessível: ${result.error}`);
      console.log(`   ❌ ${bucket}: Não acessível`);
    } else {
      console.log(`   ✅ ${bucket}: Acessível`);
    }
  }

  // Verificar integridade
  console.log('\n🔗 Verificando integridade de dados...\n');
  const integrity = await checkDataIntegrity();
  metrics.integrity = {
    total_checks: integrity.total,
    valid: integrity.valid,
    invalid: integrity.invalid,
    percentage: integrity.total > 0 ? Math.round((integrity.valid / integrity.total) * 100) : 100
  };

  if (integrity.invalid > 0) {
    metrics.score -= Math.min(20, integrity.invalid * 5);
    metrics.issues.push(`${integrity.invalid} registros com foreign keys inválidas`);
    console.log(`   ⚠️  ${integrity.invalid} registros com FKs inválidas`);
  } else {
    console.log(`   ✅ Integridade: 100% (${integrity.valid}/${integrity.total})`);
  }

  // Determinar status
  if (metrics.score >= 95) {
    metrics.status = 'healthy';
    metrics.summary = '✅ Sistema saudável e operacional';
  } else if (metrics.score >= 80) {
    metrics.status = 'warning';
    metrics.summary = '⚠️  Sistema com avisos, mas operacional';
  } else {
    metrics.status = 'critical';
    metrics.summary = '❌ Sistema com problemas críticos';
  }

  return metrics;
}

function saveMetrics(metrics: HealthMetrics) {
  // Criar diretório de logs se não existir
  const logsDir = path.join(process.cwd(), 'logs');
  if (!existsSync(logsDir)) {
    mkdirSync(logsDir, { recursive: true });
  }

  // Salvar JSON completo
  const date = new Date();
  const filename = `health-check-${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}_${String(date.getHours()).padStart(2, '0')}-${String(date.getMinutes()).padStart(2, '0')}.json`;
  const filepath = path.join(logsDir, filename);
  
  writeFileSync(filepath, JSON.stringify(metrics, null, 2), 'utf-8');
  console.log(`\n💾 Relatório salvo: ${filepath}`);

  // Salvar sumário em arquivo de texto
  const summaryFile = path.join(logsDir, 'latest-health-check.txt');
  const summaryContent = `
╔════════════════════════════════════════════╗
║   MONITORAMENTO DE SAÚDE - SUPABASE        ║
╚════════════════════════════════════════════╝

Data/Hora: ${new Date().toLocaleString('pt-BR')}
Score: ${metrics.score}%
Status: ${metrics.status.toUpperCase()}

${metrics.summary}

PROBLEMAS IDENTIFICADOS:
${metrics.issues.length > 0 ? metrics.issues.map(issue => `• ${issue}`).join('\n') : '• Nenhum problema identificado'}

TABELAS:
${Object.entries(metrics.tables).map(([name, data]) => 
  `• ${name}: ${data.accessible ? `✅ ${data.count} registros` : `❌ ${data.error}`}`
).join('\n')}

STORAGE:
${Object.entries(metrics.storage).map(([name, data]) => 
  `• ${name}: ${data.accessible ? '✅ Acessível' : `❌ ${data.error}`}`
).join('\n')}

INTEGRIDADE:
• Total verificado: ${metrics.integrity.total_checks}
• Válidos: ${metrics.integrity.valid}
• Inválidos: ${metrics.integrity.invalid}
• Percentual: ${metrics.integrity.percentage}%

Próxima verificação recomendada: ${new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR')}
`;

  writeFileSync(summaryFile, summaryContent, 'utf-8');
  console.log(`💾 Sumário salvo: ${summaryFile}\n`);
}

async function main() {
  console.log('╔════════════════════════════════════════════╗');
  console.log('║   MONITOR DE SAÚDE DO SUPABASE             ║');
  console.log('╚════════════════════════════════════════════╝');
  console.log(`🔗 URL: ${supabaseUrl}`);

  // Executar verificação
  const metrics = await performHealthCheck();

  // Salvar logs
  saveMetrics(metrics);

  // Exibir resultado
  console.log('\n╔════════════════════════════════════════════╗');
  console.log('║   RESULTADO FINAL                          ║');
  console.log('╚════════════════════════════════════════════╝\n');
  
  console.log(`📊 Score: ${metrics.score}%`);
  console.log(`🎯 Status: ${metrics.status.toUpperCase()}`);
  console.log(`📝 ${metrics.summary}\n`);

  if (metrics.issues.length > 0) {
    console.log('⚠️  Problemas encontrados:');
    metrics.issues.forEach(issue => console.log(`   • ${issue}`));
    console.log('');
  }

  console.log('📁 Logs salvos em: ./logs/\n');

  // Código de saída baseado no status
  if (metrics.status === 'critical') {
    process.exit(1);
  } else if (metrics.status === 'warning') {
    process.exit(0);
  } else {
    process.exit(0);
  }
}

main().catch((err) => {
  console.error('❌ Erro fatal:', err);
  process.exit(1);
});

