/**
 * Script para aplicar migration do App de Pacientes diretamente
 * MoocaFisio - Usa Supabase SDK
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';
import * as dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Erro: Variáveis VITE_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY não configuradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function applyMigration() {
  console.log('🚀 Aplicando Migration do App para Pacientes...\n');
  
  try {
    // Ler arquivo SQL
    const migrationPath = join(process.cwd(), 'APLICAR_MIGRATIONS_APP_PACIENTES.sql');
    const sql = readFileSync(migrationPath, 'utf-8');
    
    console.log('📄 Migration carregada:', migrationPath);
    console.log('📊 Tamanho:', sql.length, 'caracteres');
    console.log('📋 Linhas:', sql.split('\n').length);
    console.log('');
    
    // Dividir SQL em statements (por ponto-e-vírgula)
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));
    
    console.log(`🔧 Total de statements SQL: ${statements.length}\n`);
    
    // Executar cada statement
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ';';
      const preview = statement.substring(0, 80).replace(/\s+/g, ' ');
      
      try {
        const { error } = await supabase.rpc('exec_sql', { sql_query: statement });
        
        if (error) {
          console.log(`❌ Statement ${i + 1}/${statements.length}: ERRO`);
          console.log(`   ${preview}...`);
          console.log(`   Erro: ${error.message}\n`);
          errorCount++;
        } else {
          console.log(`✅ Statement ${i + 1}/${statements.length}: OK`);
          successCount++;
        }
      } catch (err) {
        console.log(`❌ Statement ${i + 1}/${statements.length}: EXCEÇÃO`);
        console.log(`   ${preview}...`);
        console.log(`   Erro: ${err}\n`);
        errorCount++;
      }
    }
    
    console.log('\n════════════════════════════════════════');
    console.log(`✅ Sucesso: ${successCount} statements`);
    console.log(`❌ Erros: ${errorCount} statements`);
    console.log('════════════════════════════════════════\n');
    
    if (errorCount === 0) {
      console.log('🎉 Migration aplicada com SUCESSO!\n');
      console.log('Próximos passos:');
      console.log('  1. npm run seed:patient');
      console.log('  2. npm run start:patient-app');
      console.log('  3. Acesse: http://localhost:5173/patient/login\n');
    } else {
      console.log('⚠️ Migration aplicada COM ERROS.');
      console.log('   Alguns statements falharam.\n');
      console.log('Tente aplicar manualmente no Dashboard:');
      console.log('  https://supabase.com/dashboard\n');
    }
    
  } catch (error) {
    console.error('❌ Erro fatal ao aplicar migration:', error);
    process.exit(1);
  }
}

// Executar
applyMigration();

