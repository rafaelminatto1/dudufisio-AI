/**
 * Script para aplicar seeds no Supabase
 * Executa os arquivos SQL da pasta supabase/seeds em ordem
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { readFileSync, readdirSync } from 'fs';

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

interface SeedFile {
  filename: string;
  number: number;
  fullPath: string;
}

async function executeSQLFile(filepath: string, filename: string): Promise<boolean> {
  try {
    console.log(`\n📄 Executando: ${filename}`);
    
    const sql = readFileSync(filepath, 'utf-8');
    
    // Remover comentários de linha (--) mas preservar os que estão em strings
    const cleanedSQL = sql
      .split('\n')
      .filter(line => !line.trim().startsWith('--') || line.includes("'"))
      .join('\n');
    
    // Supabase não suporta execução de SQL complexo via client diretamente
    // Vamos usar a abordagem de executar via migration ou informar o usuário
    console.log(`   ⚠️  Arquivo SQL precisa ser executado manualmente ou via migration`);
    console.log(`   📋 Caminho: ${filepath}`);
    console.log(`   💡 Sugestão: Copiar conteúdo e executar no SQL Editor do Supabase`);
    console.log(`      URL: ${supabaseUrl.replace('.supabase.co', '.supabase.co/project/_/sql')}`);
    
    return false;
  } catch (error: any) {
    console.error(`   ❌ Erro ao processar ${filename}:`, error.message);
    return false;
  }
}

async function applySeedsViaCLI() {
  console.log('\n🔧 Aplicando seeds via Supabase CLI...\n');
  
  const seedsPath = path.join(process.cwd(), 'supabase', 'seeds');
  
  try {
    const files = readdirSync(seedsPath);
    const seedFiles: SeedFile[] = files
      .filter(f => f.endsWith('.sql'))
      .map(f => {
        const match = f.match(/^(\d+)_/);
        return {
          filename: f,
          number: match ? parseInt(match[1]) : 999,
          fullPath: path.join(seedsPath, f)
        };
      })
      .sort((a, b) => a.number - b.number);

    if (seedFiles.length === 0) {
      console.log('⚠️  Nenhum arquivo seed encontrado em supabase/seeds/');
      return;
    }

    console.log(`📋 Encontrados ${seedFiles.length} arquivos seed:\n`);
    seedFiles.forEach(f => {
      console.log(`   ${f.number}. ${f.filename}`);
    });

    console.log('\n⚠️  IMPORTANTE: Seeds devem ser aplicados via Supabase CLI ou Dashboard');
    console.log('\n📖 Opções para aplicar os seeds:\n');
    
    console.log('Opção 1: Via Supabase CLI (Recomendado)');
    console.log('   npx supabase db push --include-all');
    console.log('');
    
    console.log('Opção 2: Manualmente via Dashboard');
    for (const seedFile of seedFiles) {
      console.log(`   • Abrir: ${seedFile.fullPath}`);
      console.log(`     Copiar conteúdo e executar no SQL Editor`);
    }
    console.log('');
    
    console.log('Opção 3: Executar individualmente');
    console.log('   Para cada arquivo, execute:');
    console.log('   psql -h [host] -U postgres -d postgres -f supabase/seeds/[arquivo].sql');
    console.log('');

  } catch (error: any) {
    console.error('❌ Erro ao listar seeds:', error.message);
  }
}

async function checkSeedResults() {
  console.log('\n🔍 === VERIFICANDO RESULTADO DOS SEEDS ===\n');

  // Verificar therapists
  try {
    const { count: therapistsCount, error: therapistsError } = await supabase
      .from('therapists')
      .select('*', { count: 'exact', head: true });

    if (therapistsError) {
      console.log('   ⚠️  Erro ao verificar therapists:', therapistsError.message);
    } else {
      console.log(`   ✅ Therapists: ${therapistsCount || 0} registros`);
    }
  } catch (err: any) {
    console.log('   ❌ Erro ao verificar therapists:', err.message);
  }

  // Verificar conduct_templates
  try {
    const { count: templatesCount, error: templatesError } = await supabase
      .from('conduct_templates')
      .select('*', { count: 'exact', head: true });

    if (templatesError) {
      console.log('   ⚠️  Erro ao verificar conduct_templates:', templatesError.message);
    } else {
      console.log(`   ✅ Conduct Templates: ${templatesCount || 0} registros`);
    }
  } catch (err: any) {
    console.log('   ❌ Erro ao verificar conduct_templates:', err.message);
  }

  // Listar therapists criados
  try {
    const { data: therapists, error } = await supabase
      .from('therapists')
      .select(`
        id,
        license_number,
        specialties,
        user_id,
        users!therapists_user_id_fkey(full_name)
      `)
      .limit(10);

    if (!error && therapists && therapists.length > 0) {
      console.log('\n📋 Therapists cadastrados:');
      therapists.forEach((t: any, index) => {
        console.log(`   ${index + 1}. ${t.users?.full_name || 'Sem nome'}`);
        console.log(`      CREFITO: ${t.license_number}`);
        console.log(`      Especialidades: ${t.specialties?.join(', ') || 'Nenhuma'}`);
      });
    }
  } catch (err: any) {
    console.log('   ℹ️  Não foi possível listar therapists detalhadamente');
  }

  // Listar templates criados
  try {
    const { data: templates, error } = await supabase
      .from('conduct_templates')
      .select('name, description, times_used')
      .eq('is_template', true)
      .order('name')
      .limit(10);

    if (!error && templates && templates.length > 0) {
      console.log('\n📋 Templates de conduta cadastrados:');
      templates.forEach((t: any, index) => {
        console.log(`   ${index + 1}. ${t.name}`);
        console.log(`      ${t.description}`);
        console.log(`      Usado: ${t.times_used} vezes`);
      });
    }
  } catch (err: any) {
    console.log('   ℹ️  Não foi possível listar templates detalhadamente');
  }
}

async function main() {
  console.log('╔════════════════════════════════════════════╗');
  console.log('║   APLICAR SEEDS NO SUPABASE                ║');
  console.log('╚════════════════════════════════════════════╝');
  console.log(`🔗 URL: ${supabaseUrl}\n`);

  // Aplicar seeds
  await applySeedsViaCLI();

  // Verificar resultados
  await checkSeedResults();

  console.log('\n╔════════════════════════════════════════════╗');
  console.log('║   PROCESSO CONCLUÍDO                       ║');
  console.log('╚════════════════════════════════════════════╝\n');
  
  console.log('📝 Próximos passos:');
  console.log('   1. Aplicar os seeds via uma das opções acima');
  console.log('   2. Executar: npx tsx scripts/revisao-completa.ts');
  console.log('   3. Verificar se os dados foram criados corretamente\n');
}

main().catch(console.error);

