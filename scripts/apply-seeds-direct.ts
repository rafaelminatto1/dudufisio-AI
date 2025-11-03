/**
 * Script para aplicar seeds diretamente no Supabase via API
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { readFileSync } from 'fs';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Erro: Variáveis de ambiente não encontradas');
  process.exit(1);
}

// Extrair informações da URL do Supabase
const projectRef = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];

if (!projectRef) {
  console.error('❌ Erro: Não foi possível extrair project ref da URL');
  process.exit(1);
}

async function executeSQLDirect(filename: string): Promise<boolean> {
  try {
    console.log(`\n📄 Executando: ${filename}`);
    
    const filepath = path.join(process.cwd(), 'supabase', 'seeds', filename);
    const sql = readFileSync(filepath, 'utf-8');
    
    // Usar a API REST do Supabase para executar SQL
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
      },
      body: JSON.stringify({ query: sql })
    });

    if (!response.ok) {
      const error = await response.text();
      console.log(`   ❌ Erro: ${error}`);
      
      // Sugerir alternativa
      console.log(`\n   💡 Alternativa: Copie o SQL e execute no Dashboard`);
      console.log(`   📋 Arquivo: ${filepath}`);
      console.log(`   🔗 SQL Editor: ${supabaseUrl.replace('.supabase.co', '.supabase.co/project/_/sql')}`);
      
      return false;
    }

    console.log(`   ✅ Executado com sucesso!`);
    return true;
  } catch (error: any) {
    console.error(`   ❌ Erro ao executar ${filename}:`, error.message);
    return false;
  }
}

async function main() {
  console.log('╔════════════════════════════════════════════╗');
  console.log('║   APLICAR SEEDS DIRETAMENTE                ║');
  console.log('╚════════════════════════════════════════════╝');
  console.log(`🔗 URL: ${supabaseUrl}\n`);

  const seeds = [
    '003_therapists_demo.sql',
    '004_conduct_templates_demo.sql'
  ];

  let successCount = 0;
  let failCount = 0;

  for (const seed of seeds) {
    const success = await executeSQLDirect(seed);
    if (success) {
      successCount++;
    } else {
      failCount++;
    }
  }

  console.log('\n╔════════════════════════════════════════════╗');
  console.log('║   RESULTADO                                ║');
  console.log('╚════════════════════════════════════════════╝\n');
  
  console.log(`✅ Sucesso: ${successCount}/${seeds.length}`);
  console.log(`❌ Falhas: ${failCount}/${seeds.length}\n`);

  if (failCount > 0) {
    console.log('⚠️  Como a API não suporta SQL complexo, você pode:');
    console.log('\n1. Usar o SQL Editor do Supabase Dashboard:');
    console.log(`   ${supabaseUrl.replace('.supabase.co', '.supabase.co/project/_/sql')}`);
    console.log('\n2. Copiar o conteúdo dos arquivos:');
    seeds.forEach(seed => {
      console.log(`   • supabase/seeds/${seed}`);
    });
    console.log('\n3. Executar cada arquivo no SQL Editor\n');
  }
}

main().catch(console.error);

