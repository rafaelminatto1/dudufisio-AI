#!/usr/bin/env node

/**
 * Script para criar usuários de teste no Supabase
 * Usa service_role_key para criar usuários com senhas definidas
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Carregar .env.local
const envPath = join(__dirname, '..', '.env.local');
try {
  const envConfig = dotenv.parse(readFileSync(envPath));
  for (const k in envConfig) {
    process.env[k] = envConfig[k];
  }
  console.log('✅ Arquivo .env.local carregado');
} catch (error) {
  console.error('❌ Erro ao carregar .env.local:', error.message);
  process.exit(1);
}

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ VITE_SUPABASE_URL ou VITE_SUPABASE_SERVICE_ROLE_KEY não configurados');
  process.exit(1);
}

// Cliente Supabase com service_role_key (permite criar usuários)
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const users = [
  {
    email: 'admin@dudufisio.com',
    password: 'DuduFisio2024!',
    user_metadata: {
      name: 'Administrador',
      role: 'Admin'
    },
    role: 'Admin',
    specialty: 'Gestão'
  },
  {
    email: 'therapist@dudufisio.com',
    password: 'demo123456',
    user_metadata: {
      name: 'Dr. Carlos Silva',
      role: 'Therapist'
    },
    role: 'Therapist',
    specialty: 'Fisioterapia Ortopédica',
    registration_number: 'CREFITO-3/123456'
  },
  {
    email: 'patient@dudufisio.com',
    password: 'demo123456',
    user_metadata: {
      name: 'Maria Santos',
      role: 'Patient'
    },
    role: 'Patient'
  },
  {
    email: 'educator@dudufisio.com',
    password: 'demo123456',
    user_metadata: {
      name: 'João Educador',
      role: 'EducadorFisico'
    },
    role: 'EducadorFisico',
    specialty: 'Educação Física',
    registration_number: 'CREF-123456'
  }
];

async function createUser(userData) {
  try {
    console.log(`\n🔄 Criando usuário: ${userData.email}...`);

    // Verificar se já existe
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const userExists = existingUsers?.users?.some(u => u.email === userData.email);
    
    if (userExists) {
      console.log(`⚠️  Usuário ${userData.email} já existe`);
      
      // Atualizar o profile
      console.log(`🔄 Atualizando profile...`);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', userData.email)
        .single();
        
      if (profiles) {
        const updateData = {
          role: userData.role,
          name: userData.user_metadata.name,
        };
        
        if (userData.specialty) updateData.specialty = userData.specialty;
        if (userData.registration_number) updateData.registration_number = userData.registration_number;
        
        const { error: updateError } = await supabase
          .from('profiles')
          .update(updateData)
          .eq('email', userData.email);
          
        if (updateError) {
          console.error(`   ❌ Erro ao atualizar profile: ${updateError.message}`);
        } else {
          console.log(`   ✅ Profile atualizado`);
        }
      }
      
      return;
    }

    // Criar usuário no Auth
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: userData.email,
      password: userData.password,
      email_confirm: true,
      user_metadata: userData.user_metadata
    });

    if (authError) {
      console.error(`   ❌ Erro ao criar usuário: ${authError.message}`);
      return;
    }

    console.log(`   ✅ Usuário criado no Auth (ID: ${authUser.user.id})`);

    // Aguardar um momento para o trigger criar o profile
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Verificar se profile foi criado pelo trigger
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authUser.user.id)
      .single();

    if (profileError || !profile) {
      console.log(`   🔄 Profile não foi criado pelo trigger, criando manualmente...`);
      
      // Criar profile manualmente
      const profileData = {
        id: authUser.user.id,
        email: userData.email,
        name: userData.user_metadata.name,
        role: userData.role,
        created_at: new Date().toISOString()
      };
      
      if (userData.specialty) profileData.specialty = userData.specialty;
      if (userData.registration_number) profileData.registration_number = userData.registration_number;
      
      const { error: insertError } = await supabase
        .from('profiles')
        .insert(profileData);

      if (insertError) {
        console.error(`   ❌ Erro ao criar profile: ${insertError.message}`);
      } else {
        console.log(`   ✅ Profile criado manualmente`);
      }
    } else {
      console.log(`   ✅ Profile já existe (criado pelo trigger)`);
      
      // Atualizar role e outros dados
      const updateData = {
        role: userData.role,
        name: userData.user_metadata.name,
      };
      
      if (userData.specialty) updateData.specialty = userData.specialty;
      if (userData.registration_number) updateData.registration_number = userData.registration_number;
      
      const { error: updateError } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', authUser.user.id);
        
      if (updateError) {
        console.error(`   ❌ Erro ao atualizar profile: ${updateError.message}`);
      } else {
        console.log(`   ✅ Profile atualizado com role e metadata`);
      }
    }

    console.log(`✅ Usuário ${userData.email} configurado com sucesso!`);
  } catch (error) {
    console.error(`❌ Erro inesperado ao criar ${userData.email}:`, error.message);
  }
}

async function main() {
  console.log('');
  console.log('='.repeat(60));
  console.log('🔐 Criando Usuários de Teste no Supabase');
  console.log('='.repeat(60));
  console.log('');
  console.log(`📍 URL: ${supabaseUrl}`);
  console.log('');

  for (const userData of users) {
    await createUser(userData);
  }

  console.log('');
  console.log('='.repeat(60));
  console.log('✅ Processo concluído!');
  console.log('='.repeat(60));
  console.log('');
  console.log('📋 Credenciais criadas:');
  console.log('');
  users.forEach(u => {
    console.log(`   ${u.email} / ${u.password} (${u.role})`);
  });
  console.log('');
  console.log('🧪 Agora você pode executar os testes E2E:');
  console.log('   npm run test:e2e');
  console.log('');
}

main().catch(console.error);



