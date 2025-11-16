/**
 * Script para aplicar migration da base de conhecimento
 * Lê o arquivo SQL e executa no Supabase
 */

import './load-env';

import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Precisa de service role para DDL
);

async function applyMigration() {
  console.log('🚀 Aplicando migration da base de conhecimento\n');
  
  // Ler arquivo SQL
  const migrationPath = path.join(
    process.cwd(),
    'supabase',
    'migrations',
    '20250115000001_create_knowledge_base.sql'
  );
  
  if (!fs.existsSync(migrationPath)) {
    console.error('❌ Arquivo de migration não encontrado:', migrationPath);
    process.exit(1);
  }
  
  console.log('📄 Lendo migration:', migrationPath);
  const sql = fs.readFileSync(migrationPath, 'utf-8');
  
  console.log('📊 Tamanho do SQL:', sql.length, 'caracteres\n');
  
  // Executar SQL
  console.log('⚙️ Executando migration...\n');
  
  try {
    // Supabase client não executa DDL diretamente
    // Precisamos usar a API REST do Supabase
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/rpc/exec_sql`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY!,
          'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY!}`,
        },
        body: JSON.stringify({ query: sql }),
      }
    );
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`HTTP ${response.status}: ${error}`);
    }
    
    console.log('✅ Migration aplicada com sucesso!\n');
    
    // Verificar se tabela foi criada
    const { data, error } = await supabase
      .from('knowledge_base')
      .select('count')
      .limit(1);
    
    if (error) {
      console.log('⚠️ Não foi possível verificar tabela:', error.message);
    } else {
      console.log('✅ Tabela knowledge_base confirmada!');
    }
    
    // Verificar extensão pgvector
    const { data: extensions } = await supabase
      .from('pg_available_extensions')
      .select('name, installed_version')
      .eq('name', 'vector')
      .single();
    
    if (extensions) {
      console.log('✅ Extensão pgvector instalada:', extensions.installed_version);
    }
    
    console.log('\n🎉 Setup completo!');
    console.log('\nPróximos passos:');
    console.log('  1. Execute: npm run populate-knowledge-base');
    console.log('  2. Teste a interface de chat');
    
  } catch (error) {
    console.error('❌ Erro ao aplicar migration:', error);
    console.log('\n💡 Alternativa:');
    console.log('  1. Acesse o Supabase Dashboard');
    console.log('  2. Vá em SQL Editor');
    console.log('  3. Cole o conteúdo de:', migrationPath);
    console.log('  4. Execute o SQL');
    process.exit(1);
  }
}

applyMigration();
