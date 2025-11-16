import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  console.log('🔍 Verificando tabela sync_metrics...\n');
  
  // Tentar fazer SELECT
  const { data, error, count } = await supabase
    .from('sync_metrics')
    .select('*', { count: 'exact', head: true });

  if (error) {
    console.log('❌ Tabela sync_metrics NÃO existe');
    console.log('   Erro:', error.message);
    console.log('\n✅ Pode aplicar a migração 20241101000000_create_sync_metrics.sql\n');
  } else {
    console.log('✅ Tabela sync_metrics JÁ existe');
    console.log(`   Registros: ${count || 0}`);
    console.log('\n⚠️  SKIP: Migração 20241101000000_create_sync_metrics.sql já foi aplicada\n');
  }

  // Verificar schedule_blocks
  console.log('🔍 Verificando tabela schedule_blocks...\n');
  
  const { data: sbData, error: sbError } = await supabase
    .from('schedule_blocks')
    .select('*')
    .limit(1);

  if (sbError) {
    console.log('❌ Erro ao acessar schedule_blocks:', sbError.message);
  } else {
    console.log('✅ Tabela schedule_blocks existe');
    console.log('   Estrutura atual:', sbData && sbData.length > 0 ? Object.keys(sbData[0]) : 'vazia');
    console.log('\n✅ Pode aplicar a migração 20251101131315_sync_schedule_blocks_schema.sql\n');
  }
}

main().catch(console.error);

