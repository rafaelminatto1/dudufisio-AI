/**
 * Script para verificar a estrutura das tabelas principais
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTableStructure(tableName: string) {
  console.log(`\n📋 === ESTRUTURA: ${tableName} ===\n`);
  
  try {
    // Pegar um registro de exemplo para ver as colunas
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .limit(1);

    if (error) {
      console.log(`❌ Erro: ${error.message}`);
      return;
    }

    if (data && data.length > 0) {
      console.log('✅ Colunas encontradas:');
      Object.keys(data[0]).forEach(col => {
        const value = data[0][col];
        const type = value === null ? 'null' : typeof value;
        console.log(`   - ${col} (${type})`);
      });
      
      console.log('\n📄 Exemplo de registro:');
      console.log(JSON.stringify(data[0], null, 2));
    } else {
      console.log('⚠️  Tabela vazia, não é possível inferir estrutura');
    }
  } catch (err: any) {
    console.error(`❌ Erro ao verificar ${tableName}:`, err.message);
  }
}

async function main() {
  console.log('🔍 ========================================');
  console.log('🔍 VERIFICANDO ESTRUTURA DAS TABELAS');
  console.log('🔍 ========================================');

  const tables = [
    'users',
    'patients',
    'appointments',
    'therapists',
    'sessions',
    'session_evolutions',
    'schedule_blocks',
    'conduct_templates'
  ];

  for (const table of tables) {
    await checkTableStructure(table);
  }

  console.log('\n✅ ========================================');
  console.log('✅ VERIFICAÇÃO CONCLUÍDA');
  console.log('✅ ========================================\n');
}

main().catch(console.error);

