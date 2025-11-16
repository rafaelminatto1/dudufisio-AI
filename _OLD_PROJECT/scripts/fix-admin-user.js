/**
 * Script para corrigir e criar registro do usuário admin na tabela public.users
 * Uso: node scripts/fix-admin-user.js
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

async function fixAdminUser() {
  console.log('🔧 Corrigindo usuário administrador...\n');

  const email = 'rafael.minatto@yahoo.com.br';
  const fullName = 'Rafael Minatto';

  try {
    // 1. Buscar usuário no auth.users
    console.log('📧 Buscando usuário no auth.users:', email);
    
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
    
    if (listError) {
      throw listError;
    }

    const authUser = users.find(u => u.email === email);
    
    if (!authUser) {
      console.error('❌ Usuário não encontrado no auth.users');
      process.exit(1);
    }

    console.log('✅ Usuário encontrado no auth.users!');
    console.log('   ID:', authUser.id);
    console.log('   Email:', authUser.email);

    // 2. Verificar se existe na tabela public.users
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .maybeSingle();

    if (checkError && checkError.code !== 'PGRST116') {
      throw checkError;
    }

    if (existingUser) {
      console.log('\n⚠️  Usuário já existe na tabela public.users. Atualizando...');
      
      // Atualizar usuário existente
      const { error: updateError } = await supabase
        .from('users')
        .update({
          auth_id: authUser.id,
          role: 'admin',
          status: 'active',
          is_active: true,
          email_verified: true,
          email_verified_at: new Date().toISOString(),
          full_name: fullName,
          permissions: ['*']
        })
        .eq('email', email);

      if (updateError) {
        throw updateError;
      }

      console.log('✅ Usuário atualizado com sucesso!');
      
    } else {
      console.log('\n📝 Criando registro na tabela public.users...');
      
      // Criar novo registro
      const { data: newUser, error: insertError } = await supabase
        .from('users')
        .insert({
          auth_id: authUser.id,
          email: email,
          full_name: fullName,
          role: 'admin',
          status: 'active',
          is_active: true,
          email_verified: true,
          email_verified_at: new Date().toISOString(),
          permissions: ['*']
        })
        .select()
        .single();

      if (insertError) {
        throw insertError;
      }

      console.log('✅ Registro criado com sucesso!');
      console.log('   User ID:', newUser.id);
    }

    // 3. Verificar resultado final
    console.log('\n🔍 Verificando resultado...');
    
    const { data: finalUser, error: finalError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (finalError) {
      throw finalError;
    }

    console.log('\n✅ SUCESSO! Usuário configurado corretamente!');
    console.log('\n📋 Informações Finais:');
    console.log('   ID:', finalUser.id);
    console.log('   Auth ID:', finalUser.auth_id);
    console.log('   Email:', finalUser.email);
    console.log('   Nome:', finalUser.full_name);
    console.log('   Role:', finalUser.role);
    console.log('   Status:', finalUser.status);
    console.log('   Ativo:', finalUser.is_active);
    console.log('   Permissões:', finalUser.permissions);

    console.log('\n🎉 Processo concluído!');
    console.log('\n📋 Credenciais de Login:');
    console.log('   Email:', email);
    console.log('   Senha: Yukari30@');
    console.log('\n🔐 Você tem privilégios de ADMINISTRADOR completos!');

  } catch (error) {
    console.error('\n❌ Erro ao corrigir usuário:', error.message);
    console.error('Detalhes:', error);
    process.exit(1);
  }
}

// Executar
fixAdminUser()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Erro fatal:', error);
    process.exit(1);
  });

