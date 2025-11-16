/**
 * Script de suporte para preparar o ambiente Supabase.
 *
 * Responsabilidades:
 * 1. Garantir que a tabela `patients` existe e possua as colunas críticas.
 * 2. Verificar a existência das tabelas do módulo Body Map.
 * 3. Orientar o operador sobre a execução do script SQL de popular dados.
 *
 * Uso:
 *   pnpm exec tsx scripts/setup-and-populate-db.ts
 */

import { existsSync, readFileSync } from 'fs';
import { resolve } from 'path';
import { createClient } from '@supabase/supabase-js';

type PatientsStructure = {
  exists: boolean;
  hasCpf: boolean;
  hasFullName: boolean;
};

type BodyMapStatus = Record<string, boolean>;

const PROJECT_NAME = 'dudufisio-AI';
const POPULATE_FILE = '??_POPULAR_SISTEMA_COMPLETO.sql';

const log = {
  info(message: string) {
    console.log(`[info] ${message}`);
  },
  warn(message: string) {
    console.warn(`[warn] ${message}`);
  },
  error(message: string) {
    console.error(`[erro] ${message}`);
  },
  banner(title: string) {
    console.log('');
    console.log('==============================================================');
    console.log(`  ${title}`);
    console.log('==============================================================');
  },
  divider() {
    console.log('--------------------------------------------------------------');
  },
};

function parseEnvFile(filePath: string): Record<string, string> {
  const content = readFileSync(filePath, 'utf8');
  const env: Record<string, string> = {};

  for (const rawLine of content.split('\n')) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) {
      continue;
    }

    const match = line.match(/^([^=]+)=(.*)$/);
    if (!match) {
      continue;
    }

    env[match[1].trim()] = match[2].trim();
  }

  return env;
}

const envPath = resolve(process.cwd(), '.env.local');
if (!existsSync(envPath)) {
  log.error('Arquivo .env.local não encontrado. Crie-o antes de rodar este script.');
  process.exit(1);
}

const envVars = parseEnvFile(envPath);
const supabaseUrl = envVars.VITE_SUPABASE_URL;
const supabaseServiceKey = envVars.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  log.error('Variáveis de ambiente obrigatórias ausentes.');
  log.error('Configure VITE_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY em .env.local.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function tableExists(table: string): Promise<boolean> {
  const { error } = await supabase.from(table).select('id').limit(1);

  if (!error) {
    return true;
  }

  if (error.message.includes('does not exist')) {
    return false;
  }

  throw new Error(error.message);
}

async function columnExists(table: string, column: string): Promise<boolean> {
  const { error } = await supabase.from(table).select(column).limit(1);
  return !error;
}

async function checkPatientsTable(): Promise<PatientsStructure> {
  log.info('Verificando estrutura da tabela `patients`...');

  try {
    const exists = await tableExists('patients');

    if (!exists) {
      log.warn('Tabela `patients` ainda não existe. As migrations devem criá-la.');
      return { exists: false, hasCpf: false, hasFullName: false };
    }

    const hasCpf = await columnExists('patients', 'cpf');
    const hasFullName = await columnExists('patients', 'full_name');

    log.info(`Tabela encontrada. cpf: ${hasCpf ? 'ok' : 'faltando'} / full_name: ${hasFullName ? 'ok' : 'faltando'}`);

    return { exists: true, hasCpf, hasFullName };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    log.error(`Falha ao verificar a tabela \`patients\`: ${message}`);
    return { exists: false, hasCpf: false, hasFullName: false };
  }
}

async function adjustPatientsTable(): Promise<void> {
  log.info('Ajustando colunas e índices da tabela `patients`...');

  const statements: Array<{ sql: string; description: string }> = [
    {
      description: 'Adicionar coluna cpf',
      sql: "ALTER TABLE patients ADD COLUMN IF NOT EXISTS cpf TEXT UNIQUE",
    },
    {
      description: 'Adicionar coluna full_name',
      sql: "ALTER TABLE patients ADD COLUMN IF NOT EXISTS full_name TEXT",
    },
    {
      description: 'Copiar dados de `name` para `full_name` quando disponível',
      sql: "UPDATE patients SET full_name = name WHERE full_name IS NULL AND name IS NOT NULL",
    },
    {
      description: 'Criar índice para CPF',
      sql: 'CREATE INDEX IF NOT EXISTS idx_patients_cpf ON patients(cpf)',
    },
    {
      description: 'Adicionar comentários às colunas',
      sql: [
        "COMMENT ON COLUMN patients.cpf IS 'CPF do paciente (formato: 123.456.789-01)'",
        "COMMENT ON COLUMN patients.full_name IS 'Nome completo do paciente'",
      ].join(';\n'),
    },
  ];

  for (const { sql, description } of statements) {
    const { error } = await supabase.rpc('exec_sql', { query: sql });

    if (error) {
      log.error(`${description}: ${error.message}`);
    } else {
      log.info(`${description}: concluído`);
    }
  }
}

async function checkBodyMapTables(): Promise<BodyMapStatus> {
  log.info('Verificando tabelas do módulo Body Map...');

  const tables = [
    'body_map_sessions',
    'body_map_pain_regions',
    'body_map_analytics_cache',
    'body_regions_reference',
  ];

  const status: BodyMapStatus = {};

  for (const table of tables) {
    try {
      const exists = await tableExists(table);
      status[table] = exists;
      log.info(`${table}: ${exists ? 'ok' : 'faltando'}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      log.error(`${table}: erro ao consultar (${message})`);
      status[table] = false;
    }
  }

  return status;
}

function ensurePopulateScript(): boolean {
  log.info(`Verificando existência do arquivo ${POPULATE_FILE}...`);

  const populateScriptPath = resolve(process.cwd(), POPULATE_FILE);

  if (!existsSync(populateScriptPath)) {
    log.error(`Arquivo ${POPULATE_FILE} não encontrado na raiz do projeto.`);
    return false;
  }

  const fileContent = readFileSync(populateScriptPath, 'utf8');

  if (!fileContent.trim()) {
    log.error(`Arquivo ${POPULATE_FILE} está vazio. Revise o conteúdo antes de executar.`);
    return false;
  }

  log.info('Arquivo de popular dados localizado. Execute-o manualmente no Supabase SQL Editor.');
  return true;
}

async function main() {
  log.banner('SUPABASE • SETUP E POPULAÇÃO');
  log.info(`Projeto: ${PROJECT_NAME}`);
  log.info(`URL: ${supabaseUrl}`);
  log.divider();

  const patientsStructure = await checkPatientsTable();
  const bodyMapTables = await checkBodyMapTables();

  if (patientsStructure.exists && (!patientsStructure.hasCpf || !patientsStructure.hasFullName)) {
    await adjustPatientsTable();
    log.divider();
  }

  const missingBodyMapTables = Object.entries(bodyMapTables).filter(([, exists]) => !exists);

  if (missingBodyMapTables.length > 0) {
    log.warn('Algumas tabelas do Body Map não foram encontradas.');
    log.warn('Execute as migrations correspondentes no Supabase Dashboard na seguinte ordem:');
    log.warn('  - supabase/migrations/20251013_body_map_system.sql');
    log.warn('  - supabase/migrations/20251014_fix_rls_body_map.sql');
    log.divider();
  }

  const hasPopulateScript = ensurePopulateScript();
  if (hasPopulateScript) {
    log.info('Siga os passos:');
    log.info('  1. Abra o SQL Editor do projeto no Supabase.');
    log.info(`  2. Cole o conteúdo de ${POPULATE_FILE}.`);
    log.info('  3. Execute o script (Ctrl+Enter) e valide os dados.');
  }

  log.divider();
  log.banner('RESUMO');
  log.info(`Tabela patients: ${patientsStructure.exists ? 'ok' : 'não encontrada'}`);
  log.info(`Coluna cpf: ${patientsStructure.hasCpf ? 'ok' : 'faltando'}`);
  log.info(`Coluna full_name: ${patientsStructure.hasFullName ? 'ok' : 'faltando'}`);
  log.info(
    `Tabelas Body Map: ${
      missingBodyMapTables.length === 0 ? 'ok' : `faltando (${missingBodyMapTables.map(([name]) => name).join(', ')})`
    }`,
  );
  log.divider();
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  log.error(`Erro inesperado: ${message}`);
  process.exitCode = 1;
});
