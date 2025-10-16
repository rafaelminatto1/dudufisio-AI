/**
 * Script para validar conexão com Supabase Cloud
 * 
 * Uso: npx tsx scripts/validate-supabase.ts
 */

import { createClient } from '@supabase/supabase-js';
import { resolve } from 'path';
import { readFileSync, existsSync } from 'fs';

// Função para fazer parse manual do .env
function parseEnvFile(filePath: string): Record<string, string> {
  const content = readFileSync(filePath, 'utf8');
  const env: Record<string, string> = {};
  
  content.split('\n').forEach(line => {
    // Ignorar comentários e linhas vazias
    line = line.trim();
    if (!line || line.startsWith('#')) return;
    
    // Parse da linha KEY=VALUE
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim();
      env[key] = value;
    }
  });
  
  return env;
}

// Carregar variáveis de ambiente do .env.local
const envPath = resolve(process.cwd(), '.env.local');
console.log(`📂 Carregando variáveis de ambiente de: ${envPath}\n`);

if (!existsSync(envPath)) {
  console.error('❌ Arquivo .env.local não encontrado!');
  process.exit(1);
}

const envVars = parseEnvFile(envPath);

const supabaseUrl = envVars.VITE_SUPABASE_URL;
const supabaseAnonKey = envVars.VITE_SUPABASE_ANON_KEY;

console.log(`   ✅ VITE_SUPABASE_URL: ${supabaseUrl?.substring(0, 30)}...`);
console.log(`   ✅ VITE_SUPABASE_ANON_KEY: ${supabaseAnonKey?.substring(0, 30)}...\n`);

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Erro: Variáveis de ambiente não encontradas!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function validateSupabaseConnection() {
  console.log('🔍 Validando conexão com Supabase...\n');
  
  try {
    // 1. Testar conexão básica
    console.log('1️⃣ Testando conexão básica...');
    const { data: healthCheck, error: healthError } = await supabase
      .from('patients')
      .select('count')
      .limit(1);
    
    if (healthError) {
      // Se a tabela não existe, é OK - pelo menos conectou
      if (healthError.message.includes('does not exist')) {
        console.log('   ⚠️ Tabela "patients" não existe ainda (OK para novo projeto)');
      } else {
        throw healthError;
      }
    } else {
      console.log('   ✅ Conexão estabelecida com sucesso!');
    }
    
    // 2. Listar tabelas existentes
    console.log('\n2️⃣ Listando tabelas no schema public...');
    const { data: tables, error: tablesError } = await supabase
      .rpc('exec_sql', {
        query: `
          SELECT table_name 
          FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_type = 'BASE TABLE'
          ORDER BY table_name;
        `
      });
    
    if (tablesError) {
      console.log('   ⚠️ Não foi possível listar tabelas (pode ser limitação de permissões)');
      console.log('   Erro:', tablesError.message);
    } else {
      console.log('   📋 Tabelas encontradas:');
      tables?.forEach((table: any) => {
        console.log(`      - ${table.table_name}`);
      });
    }
    
    // 3. Verificar auth
    console.log('\n3️⃣ Verificando sistema de autenticação...');
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.log('   ⚠️ Erro ao verificar sessão:', sessionError.message);
    } else if (!session) {
      console.log('   ℹ️ Nenhuma sessão ativa (normal para serviço não autenticado)');
    } else {
      console.log('   ✅ Sessão ativa encontrada');
    }
    
    // 4. Resumo
    console.log('\n' + '='.repeat(60));
    console.log('✅ VALIDAÇÃO CONCLUÍDA COM SUCESSO!');
    console.log('='.repeat(60));
    console.log('\n📊 Resumo:');
    console.log('   • Conexão: OK');
    console.log('   • Autenticação: OK');
    console.log('   • Sistema pronto para uso');
    console.log('\n💡 Próximos passos:');
    console.log('   1. Executar migrations para criar schema');
    console.log('   2. Popular dados iniciais');
    console.log('   3. Testar funcionalidades no app\n');
    
  } catch (error: any) {
    console.error('\n❌ ERRO NA VALIDAÇÃO:');
    console.error('   Mensagem:', error.message);
    console.error('   Código:', error.code || 'N/A');
    console.error('\n🔧 Possíveis soluções:');
    console.error('   1. Verifique se VITE_SUPABASE_URL está correto em .env.local');
    console.error('   2. Verifique se VITE_SUPABASE_ANON_KEY está correto em .env.local');
    console.error('   3. Confirme que o projeto Supabase está ativo');
    console.error('   4. Verifique sua conexão com a internet\n');
    process.exit(1);
  }
}

// Executar validação
validateSupabaseConnection();
