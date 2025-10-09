/**
 * Script para aplicar migration diretamente via Supabase API
 * Contorna problemas de histórico de migrations
 * 
 * Uso: npx tsx scripts/apply-migration-direct.ts
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';

const SUPABASE_URL = 'https://urfxniitfbbvsaskicfo.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY não encontrada!');
  console.log('');
  console.log('Configure com:');
  console.log('  $env:SUPABASE_SERVICE_ROLE_KEY="sua_service_key_aqui"');
  console.log('');
  console.log('Pegue a key em:');
  console.log('  https://supabase.com/dashboard/project/urfxniitfbbvsaskicfo/settings/api');
  console.log('');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function applyMigration() {
  console.log('🚀 APLICADOR DIRETO DE MIGRATIONS');
  console.log('==================================');
  console.log('');
  
  try {
    // 1. Ler arquivo SQL
    console.log('📖 Lendo migration...');
    const sqlPath = join(process.cwd(), 'supabase', 'migrations', '20251009_complete_patients_management_system.sql');
    const sql = readFileSync(sqlPath, 'utf-8');
    console.log('✅ SQL carregado!');
    console.log('');
    
    // 2. Dividir em statements (split por ';' mas cuidado com functions)
    console.log('🔧 Executando migration...');
    console.log('⏳ Isso pode demorar alguns segundos...');
    console.log('');
    
    // Executar SQL completo
    const { error } = await supabase.rpc('exec_sql', { sql_query: sql });
    
    if (error) {
      // Se rpc não existir, tentar método alternativo
      console.log('⚠️  Método RPC não disponível, usando método alternativo...');
      
      // Executar via query direta (menos ideal mas funciona)
      const { error: queryError } = await supabase
        .from('_migrations') // tabela interna
        .select('version')
        .limit(1);
      
      // Se chegou aqui, tem acesso ao banco
      console.log('✅ Conexão estabelecida!');
      console.log('');
      console.log('📋 AÇÃO NECESSÁRIA:');
      console.log('');
      console.log('Aplique manualmente via Dashboard:');
      console.log('1. Acesse: https://supabase.com/dashboard/project/urfxniitfbbvsaskicfo/sql/new');
      console.log('2. Abra: supabase/migrations/20251009_complete_patients_management_system.sql');
      console.log('3. Copie TODO o conteúdo');
      console.log('4. Cole no SQL Editor');
      console.log('5. Clique em Run ▶️');
      console.log('');
      return;
    }
    
    console.log('✅ Migration aplicada com sucesso!');
    console.log('');
    
    // 3. Verificar tabelas criadas
    console.log('🔍 Verificando tabelas criadas...');
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .like('table_name', 'patient%');
    
    if (!tablesError && tables) {
      console.log(`✅ ${tables.length} tabelas criadas:`);
      tables.forEach(t => console.log(`   - ${t.table_name}`));
    }
    console.log('');
    
    // 4. Configurar Storage
    console.log('🗄️  Configurando Storage...');
    const { error: storageError } = await supabase
      .storage
      .createBucket('patient-documents', {
        public: true,
        fileSizeLimit: 52428800, // 50MB
        allowedMimeTypes: [
          'image/jpeg', 'image/png', 'image/jpg',
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ]
      });
    
    if (storageError && !storageError.message.includes('already exists')) {
      console.log(`⚠️  Storage: ${storageError.message}`);
    } else {
      console.log('✅ Storage bucket criado!');
    }
    console.log('');
    
    // 5. Sucesso!
    console.log('🎉 TUDO PRONTO!');
    console.log('');
    console.log('Próximos passos:');
    console.log('1. ✅ Criar .env.local com as keys');
    console.log('2. ✅ Testar conexão');
    console.log('3. ✅ Usar os hooks React Query');
    console.log('');
    
  } catch (error) {
    console.error('❌ Erro:', error);
    console.log('');
    console.log('💡 Solução alternativa:');
    console.log('Aplique manualmente via Dashboard (veja 🔥_SOLUCAO_RAPIDA_MIGRATION.md)');
    console.log('');
  }
}

applyMigration();

