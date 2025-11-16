/**
 * Script para verificar usuário administrador no Supabase
 * Uso: node scripts/verify-admin-user.js
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVyZnhuaWl0ZmJidnNhc2tpY2ZvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODMwNTQ0NywiZXhwIjoyMDczODgxNDQ3fQ.hCnWP5UjAywrkCX1hnHQviu9R3J56y2VZdLI1tKhgWg';

// Criar cliente com service_role para acesso administrativo
const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function verifyAdminUser() {
  console.log('🔍 Verificando usuário administrador...\n');

  const email = 'rafael.minatto@yahoo.com.br';

  try {
    // Buscar usuário na tabela public.users
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email);

    if (error) {
      throw error;
    }

    if (!data || data.length === 0) {
      console.log('❌ Usuário não encontrado na tabela public.users');
      return;
    }

    const user = data[0];

    console.log('✅ Usuário encontrado!\n');
    console.log('📋 Informações do Usuário:');
    console.log('   ID:', user.id);
    console.log('   Auth ID:', user.auth_id);
    console.log('   Email:', user.email);
    console.log('   Nome:', user.full_name);
    console.log('   Role:', user.role);
    console.log('   Status:', user.status);
    console.log('   Ativo:', user.is_active);
    console.log('   Email Verificado:', user.email_verified);
    console.log('   Permissões:', JSON.stringify(user.permissions, null, 2));
    console.log('   Criado em:', user.created_at);
    console.log('   Último login:', user.last_login_at || 'Nunca');

    if (user.role === 'admin') {
      console.log('\n🎉 VERIFICAÇÃO COMPLETA!');
      console.log('✅ Usuário tem privilégios de ADMINISTRADOR!');
    } else {
      console.log('\n⚠️  ATENÇÃO: Usuário não tem role de admin!');
      console.log('   Role atual:', user.role);
    }

  } catch (error) {
    console.error('\n❌ Erro ao verificar usuário:', error.message);
    console.error('Detalhes:', error);
    process.exit(1);
  }
}

// Executar
verifyAdminUser()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Erro fatal:', error);
    process.exit(1);
  });

