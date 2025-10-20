/**
 * Script para aplicar a migration de assessment_compliance_log
 * Usando a API do Supabase
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Carregar variáveis de ambiente
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variáveis de ambiente não encontradas!');
  console.error('Certifique-se de que VITE_SUPABASE_URL e VITE_SUPABASE_SERVICE_ROLE_KEY estão definidas em .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyMigration() {
  console.log('🚀 Aplicando migration: assessment_compliance_log\n');

  try {
    // Ler o arquivo SQL
    const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '20250125_assessment_compliance_log.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf-8');

    console.log('📄 Migration lida com sucesso');
    console.log(`📏 Tamanho: ${migrationSQL.length} caracteres\n`);

    // Aplicar a migration usando RPC (se disponível) ou executar diretamente
    console.log('⚙️  Aplicando migration...\n');

    // Dividir em comandos individuais
    const commands = migrationSQL
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'));

    console.log(`📝 Executando ${commands.length} comandos SQL...\n`);

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < commands.length; i++) {
      const command = commands[i];
      
      // Pular comentários e comandos vazios
      if (!command || command.startsWith('--') || command === '\n') {
        continue;
      }

      try {
        const { error } = await supabase.rpc('exec_sql', { sql: command });
        
        if (error) {
          // Se o RPC não existir, tentar executar diretamente
          console.log(`⚠️  Comando ${i + 1}/${commands.length}: ${error.message}`);
          errorCount++;
        } else {
          console.log(`✅ Comando ${i + 1}/${commands.length} executado`);
          successCount++;
        }
      } catch (err) {
        console.log(`⚠️  Comando ${i + 1}/${commands.length}: ${err.message}`);
        errorCount++;
      }
    }

    console.log('\n📊 Resumo:');
    console.log(`   ✅ Sucesso: ${successCount}`);
    console.log(`   ❌ Erros: ${errorCount}`);

    if (errorCount === 0) {
      console.log('\n🎉 Migration aplicada com sucesso!');
    } else if (successCount > 0) {
      console.log('\n⚠️  Migration aplicada com alguns avisos');
    } else {
      console.log('\n❌ Erro ao aplicar migration');
      console.log('\n💡 Dica: Aplique a migration manualmente no Supabase Dashboard:');
      console.log('   1. Acesse: https://supabase.com/dashboard/project/urfxniitfbbvsaskicfo/sql');
      console.log('   2. Copie o conteúdo de supabase/migrations/20250125_assessment_compliance_log.sql');
      console.log('   3. Cole no SQL Editor');
      console.log('   4. Execute');
    }

  } catch (error) {
    console.error('\n❌ Erro ao aplicar migration:', error.message);
    console.error('\n💡 Solução alternativa:');
    console.error('   Aplique a migration manualmente no Supabase Dashboard');
    console.error('   https://supabase.com/dashboard/project/urfxniitfbbvsaskicfo/sql');
    process.exit(1);
  }
}

// Executar
applyMigration();

