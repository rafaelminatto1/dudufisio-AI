/**
 * Script para criar usuário administrador no Supabase
 * Uso: node scripts/create-admin-user.js
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVyZnhuaWl0ZmJidnNhc2tpY2ZvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODMwNTQ0NywiZXhwIjoyMDczODgxNDQ3fQ.hCnWP5UjAywrkCX1hnHQviu9R3J56y2VZdLI1tKhgWg';

if (!supabaseUrl) {
  console.error('❌ VITE_SUPABASE_URL não encontrada no .env.local');
  process.exit(1);
}

// Criar cliente com service_role para acesso administrativo
const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createAdminUser() {
  console.log('🚀 Criando usuário administrador...\n');

  const email = 'rafael.minatto@yahoo.com.br';
  const password = 'Yukari30@';
  const fullName = 'Rafael Minatto';

  try {
    // 1. Criar usuário no Supabase Auth
    console.log('📧 Criando usuário:', email);
    
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
        role: 'admin'
      }
    });

    if (authError) {
      // Se o usuário já existe, tentar atualizar
      if (authError.message.includes('already registered')) {
        console.log('⚠️  Usuário já existe. Tentando atualizar...');
        
        // Buscar o usuário existente
        const { data: users, error: listError } = await supabase.auth.admin.listUsers();
        
        if (listError) {
          throw listError;
        }

        const existingUser = users.users.find(u => u.email === email);
        
        if (!existingUser) {
          throw new Error('Usuário não encontrado após verificação');
        }

        // Atualizar senha e metadados
        const { data: updateData, error: updateError } = await supabase.auth.admin.updateUserById(
          existingUser.id,
          {
            password: password,
            email_confirm: true,
            user_metadata: {
              full_name: fullName,
              role: 'admin'
            }
          }
        );

        if (updateError) {
          throw updateError;
        }

        console.log('✅ Usuário atualizado com sucesso!');
        console.log('   ID:', existingUser.id);
        
        // Atualizar role na tabela public.users
        const { error: roleError } = await supabase
          .from('users')
          .update({
            role: 'admin',
            status: 'active',
            is_active: true,
            email_verified: true,
            email_verified_at: new Date().toISOString(),
            full_name: fullName,
            permissions: ['*']
          })
          .eq('auth_id', existingUser.id);

        if (roleError) {
          console.warn('⚠️  Aviso ao atualizar role:', roleError.message);
        } else {
          console.log('✅ Role de administrador configurado!');
        }

      } else {
        throw authError;
      }
    } else {
      console.log('✅ Usuário criado com sucesso!');
      console.log('   ID:', authData.user.id);
      console.log('   Email:', authData.user.email);
      
      // Aguardar 2 segundos para o trigger processar
      console.log('\n⏳ Aguardando trigger processar...');
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Verificar se o role foi configurado corretamente
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('auth_id', authData.user.id)
        .single();

      if (userError) {
        console.warn('⚠️  Aviso ao verificar role:', userError.message);
      } else {
        console.log('✅ Role verificado:', userData.role);
        console.log('   Permissões:', userData.permissions);
      }
    }

    console.log('\n🎉 Processo concluído!');
    console.log('\n📋 Credenciais de Login:');
    console.log('   Email:', email);
    console.log('   Senha:', password);
    console.log('\n🔐 Você tem privilégios de ADMINISTRADOR completos!');
    
  } catch (error) {
    console.error('\n❌ Erro ao criar usuário:', error.message);
    console.error('Detalhes:', error);
    process.exit(1);
  }
}

// Executar
createAdminUser()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Erro fatal:', error);
    process.exit(1);
  });

