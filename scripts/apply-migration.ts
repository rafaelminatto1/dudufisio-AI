import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { readFileSync } from 'fs';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function applyMigration() {
  console.log('🔧 Aplicando migração: 20251101131315_sync_schedule_blocks_schema.sql\n');
  
  try {
    // Ler o arquivo SQL
    const migrationPath = path.join(process.cwd(), 'supabase', 'migrations', '20251101131315_sync_schedule_blocks_schema.sql');
    const sql = readFileSync(migrationPath, 'utf-8');
    
    console.log('📄 Conteúdo da migração:');
    console.log('─'.repeat(60));
    console.log(sql);
    console.log('─'.repeat(60));
    console.log('');
    
    // Dividir em comandos individuais (remover comentários e linhas vazias)
    const commands = sql
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'));
    
    console.log(`🔨 Executando ${commands.length} comandos SQL...\n`);
    
    for (let i = 0; i < commands.length; i++) {
      const command = commands[i] + ';';
      console.log(`[${i + 1}/${commands.length}] Executando: ${command.substring(0, 80)}...`);
      
      try {
        // Para comandos DDL, precisamos usar uma conexão direta
        // Como não podemos usar o cliente Supabase para DDL, vamos usar o CLI
        console.log('   ⚠️  Comando DDL - precisa ser executado via CLI\n');
      } catch (err: any) {
        console.log(`   ❌ Erro: ${err.message}`);
      }
    }
    
    console.log('\n⚠️  Esta migração precisa ser aplicada via Supabase CLI com:');
    console.log('   npx supabase db push --include-all\n');
    console.log('Ou através do Supabase Dashboard > SQL Editor');
    
  } catch (err: any) {
    console.error('❌ Erro ao aplicar migração:', err.message);
  }
}

applyMigration().catch(console.error);

