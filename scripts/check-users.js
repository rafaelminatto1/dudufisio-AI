#!/usr/bin/env node

/**
 * Script para verificar usuários existentes
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

console.log('🔍 Verificando usuários existentes...\n');

async function checkUsers() {
  try {
    // Buscar usuários na tabela
    const { data: users, error } = await supabase
      .from('users')
      .select('id, auth_id, email, full_name, role, created_at')
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('❌ Erro ao buscar usuários:', error.message);
      console.log('\nℹ️  Possível causa: Tabela users pode não existir ou ter RLS ativo');
      console.log('   Verificando Auth users...\n');

      // Tentar buscar usuários do Auth
      const { data: authData } = await supabase.auth.admin.listUsers();

      if (authData.users.length > 0) {
        console.log(`✅ Encontrados ${authData.users.length} usuário(s) no Auth:\n`);
        authData.users.forEach((user, i) => {
          console.log(`${i + 1}. ${user.email || user.phone || 'Sem email/phone'}`);
          console.log(`   ID: ${user.id}`);
          console.log(`   Criado: ${new Date(user.created_at).toLocaleString('pt-BR')}`);
          console.log('');
        });

        console.log('💡 Dica: Use um desses usuários para testar notificações');
        console.log('   Anote o email e faça login no frontend primeiro');
      } else {
        console.log('⚠️  Nenhum usuário encontrado no Auth');
        console.log('   Crie um usuário fazendo signup no frontend primeiro');
      }

      return;
    }

    if (!users || users.length === 0) {
      console.log('⚠️  Nenhum usuário encontrado na tabela users');
      console.log('   Verificando Auth...\n');

      const { data: authData } = await supabase.auth.admin.listUsers();

      if (authData.users.length > 0) {
        console.log(`ℹ️  Encontrados ${authData.users.length} usuário(s) no Auth, mas não na tabela users`);
        console.log('   Isso pode indicar que o trigger não está funcionando');
      }

      return;
    }

    console.log(`✅ Encontrados ${users.length} usuário(s):\n`);

    users.forEach((user, i) => {
      console.log(`${i + 1}. ${user.full_name || 'Sem nome'} (${user.email || 'Sem email'})`);
      console.log(`   ID: ${user.id}`);
      console.log(`   Auth ID: ${user.auth_id || 'N/A'}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Criado: ${new Date(user.created_at).toLocaleString('pt-BR')}`);
      console.log('');
    });

    console.log('✅ Use um desses usuários para testar notificações!');
    console.log(`   Execute: node scripts/test-notifications.js`);

  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

checkUsers();
