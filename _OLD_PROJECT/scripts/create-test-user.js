#!/usr/bin/env node

/**
 * Script para Criar Usuário de Teste
 *
 * Cria um usuário completo para testar o sistema de notificações
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Erro: VITE_SUPABASE_URL ou VITE_SUPABASE_SERVICE_ROLE_KEY não configurados');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

console.log('👤 Criando usuário de teste...\n');

async function createTestUser() {
  try {
    // Dados do usuário de teste
    const testEmail = 'teste@dudufisio.com';
    const testPassword = 'Teste123!@#';
    const testPhone = '+5511999999999';

    console.log('📋 Verificando se usuário já existe...');

    // Verificar se já existe
    const { data: existingAuth } = await supabase.auth.admin.listUsers();
    const existingUser = existingAuth.users.find(u => u.email === testEmail);

    let authUser;

    if (existingUser) {
      console.log('✅ Usuário de autenticação já existe');
      authUser = existingUser;
    } else {
      // Criar usuário no Auth
      console.log('📋 Criando usuário no Supabase Auth...');
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: testEmail,
        password: testPassword,
        phone: testPhone,
        email_confirm: true,
        phone_confirm: true,
        user_metadata: {
          full_name: 'Usuário de Teste',
        }
      });

      if (authError) {
        throw new Error(`Erro ao criar usuário Auth: ${authError.message}`);
      }

      authUser = authData.user;
      console.log(`✅ Usuário Auth criado: ${authUser.id}`);
    }

    // Verificar se existe na tabela users
    console.log('📋 Verificando tabela users...');
    const { data: dbUser, error: checkError } = await supabase
      .from('users')
      .select('*')
      .eq('auth_id', authUser.id)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Erro ao verificar users:', checkError);
    }

    if (dbUser) {
      console.log('✅ Usuário já existe na tabela users');
      console.log(`   ID: ${dbUser.id}`);
      console.log(`   Nome: ${dbUser.full_name}`);
      console.log(`   Email: ${dbUser.email}`);
    } else {
      // Criar na tabela users
      console.log('📋 Criando registro na tabela users...');
      const { data: newUser, error: insertError } = await supabase
        .from('users')
        .insert({
          auth_id: authUser.id,
          email: testEmail,
          full_name: 'Usuário de Teste',
          phone: testPhone,
          role: 'patient',
          notification_preferences: {
            email: true,
            sms: true,
            whatsapp: true,
            push: true,
            appointment_reminder_24h: true,
            appointment_reminder_2h: true,
            appointment_confirmed: true,
            appointment_cancelled: true,
            payment_received: true,
            payment_due: true,
            marketing: true,
            system: true
          }
        })
        .select()
        .single();

      if (insertError) {
        throw new Error(`Erro ao criar user: ${insertError.message}`);
      }

      console.log(`✅ Usuário criado na tabela users: ${newUser.id}`);
    }

    // Buscar usuário final
    const { data: finalUser, error: finalError } = await supabase
      .from('users')
      .select('*')
      .eq('auth_id', authUser.id)
      .single();

    if (finalError) {
      throw new Error(`Erro ao buscar usuário final: ${finalError.message}`);
    }

    console.log('\n═══════════════════════════════════════════════════');
    console.log('🎉 USUÁRIO DE TESTE CRIADO COM SUCESSO!');
    console.log('═══════════════════════════════════════════════════');
    console.log('');
    console.log('📧 Email:', testEmail);
    console.log('🔑 Senha:', testPassword);
    console.log('📱 Telefone:', testPhone);
    console.log('🆔 User ID:', finalUser.id);
    console.log('🔐 Auth ID:', authUser.id);
    console.log('👤 Nome:', finalUser.full_name);
    console.log('📊 Role:', finalUser.role);
    console.log('');
    console.log('✅ Preferências de notificação:');
    console.log('   Email:', finalUser.notification_preferences?.email ? '✓' : '✗');
    console.log('   SMS:', finalUser.notification_preferences?.sms ? '✓' : '✗');
    console.log('   WhatsApp:', finalUser.notification_preferences?.whatsapp ? '✓' : '✗');
    console.log('   Push:', finalUser.notification_preferences?.push ? '✓' : '✗');
    console.log('');
    console.log('🚀 Próximos passos:');
    console.log('   1. Execute: node scripts/test-notifications.js');
    console.log('   2. Ou faça login no frontend com:');
    console.log(`      Email: ${testEmail}`);
    console.log(`      Senha: ${testPassword}`);
    console.log('');

    return finalUser;

  } catch (error) {
    console.error('\n❌ ERRO:');
    console.error(error.message);
    console.error('\nStack trace:');
    console.error(error.stack);
    process.exit(1);
  }
}

createTestUser();
