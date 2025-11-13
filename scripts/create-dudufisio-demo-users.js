#!/usr/bin/env node

/**
 * Script rápido para criar contas demo no Supabase
 * Utiliza a service_role_key definida em .env.local
 *
 * Perfis criados:
 *  - admin@dudufisio.com      (Admin)
 *  - therapist@dudufisio.com  (Therapist)
 *  - intern@dudufisio.com     (Intern)
 *  - patient@dudufisio.com    (Patient)
 */

import { createClient } from '@supabase/supabase-js';
import crypto from 'node:crypto';
import dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const envPath = join(__dirname, '..', '.env.local');

try {
  const envConfig = dotenv.parse(readFileSync(envPath));
  for (const key of Object.keys(envConfig)) {
    process.env[key] = envConfig[key];
  }
  console.log('✅ .env.local carregado');
} catch (error) {
  console.error('❌ Não foi possível ler .env.local:', error.message);
  process.exit(1);
}

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variáveis VITE_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY ausentes');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const USERS = [
  {
    email: 'admin@dudufisio.com',
    password: 'demo123456',
    name: 'Administrador Demo',
    role: 'Admin',
    metadata: {
      full_name: 'Administrador Demo',
      role: 'Admin',
    },
    specialty: 'Gestão',
  },
  {
    email: 'therapist@dudufisio.com',
    password: 'demo123456',
    name: 'Dr. Carlos Silva',
    role: 'Therapist',
    metadata: {
      full_name: 'Dr. Carlos Silva',
      role: 'Therapist',
    },
    specialty: 'Fisioterapia Ortopédica',
    registration_number: 'CREFITO-3/654321',
  },
  {
    email: 'intern@dudufisio.com',
    password: 'demo123456',
    name: 'Estagiário Demo',
    role: 'Intern',
    metadata: {
      full_name: 'Estagiário Demo',
      role: 'Intern',
    },
  },
  {
    email: 'patient@dudufisio.com',
    password: 'demo123456',
    name: 'Maria Santos',
    role: 'Patient',
    metadata: {
      full_name: 'Maria Santos',
      role: 'Patient',
    },
  },
];

async function ensureAppUser(userId, payload) {
  const now = new Date().toISOString();
  const dbRole =
    payload.role.toLowerCase() === 'intern' ? 'therapist' : payload.role.toLowerCase();

  const baseRecord = {
    id: crypto.randomUUID(),
    auth_id: userId,
    email: payload.email,
    full_name: payload.name,
    role: dbRole,
    is_active: true,
    created_at: now,
    updated_at: now,
  };

  if (payload.phone) baseRecord.phone = payload.phone;

  const { data: existing, error: fetchError } = await supabase
    .from('users')
    .select('id')
    .eq('auth_id', userId)
    .maybeSingle();

  if (fetchError && fetchError.code !== 'PGRST116') {
    console.error(`   ❌ Erro ao buscar tabela users: ${fetchError.message}`);
    return null;
  }

  if (!existing) {
    const { error: insertError, data } = await supabase
      .from('users')
      .insert(baseRecord)
      .select('id')
      .single();

    if (insertError) {
      console.error(`   ❌ Erro ao criar registro em users: ${insertError.message}`);
      return null;
    }

    console.log('   ✅ Registro criado em public.users');
    return data?.id;
  }

  const { error: updateError } = await supabase
    .from('users')
    .update({
      email: payload.email,
      full_name: payload.name,
      role: dbRole,
      role: dbRole,
      is_active: true,
      updated_at: now,
    })
    .eq('auth_id', userId);

  if (updateError) {
    console.error(`   ❌ Erro ao atualizar public.users: ${updateError.message}`);
  } else {
    console.log('   ✅ Registro em public.users atualizado');
  }

  return existing.id;
}

async function upsertUser(userPayload) {
  console.log(`\n🔄 Garantindo usuário ${userPayload.email}`);

  const { data: listUsers, error: listError } = await supabase.auth.admin.listUsers();
  if (listError) {
    console.error(`   ❌ Não foi possível listar usuários: ${listError.message}`);
    return;
  }

  const existing = listUsers?.users?.find((user) => user.email === userPayload.email);

  if (existing) {
    console.log('   ℹ️  Usuário já existe, atualizando metadata/profile');

    await ensureAppUser(existing.id, userPayload);

    const { error: metadataError } = await supabase.auth.admin.updateUserById(existing.id, {
      user_metadata: userPayload.metadata,
    });

    if (metadataError) {
      console.error(`   ❌ Erro ao atualizar metadata: ${metadataError.message}`);
    } else {
      console.log('   ✅ Metadata atualizada');
    }
    return;
  }

  const { data: created, error: createError } = await supabase.auth.admin.createUser({
    email: userPayload.email,
    password: userPayload.password,
    email_confirm: true,
    user_metadata: userPayload.metadata,
  });

  if (createError) {
    console.error(`   ❌ Falha ao criar usuário: ${createError.message}`);
    return;
  }

  console.log(`   ✅ Usuário criado (id: ${created.user.id})`);

  await new Promise((resolve) => setTimeout(resolve, 1500));
  await ensureAppUser(created.user.id, userPayload);
}

async function main() {
  console.log('\n' + '='.repeat(60));
  console.log('🚀 Criando usuários demo (domínio dudufisio.com)');
  console.log('='.repeat(60));
  console.log(`🔗 Supabase: ${supabaseUrl}`);

  for (const payload of USERS) {
    // eslint-disable-next-line no-await-in-loop
    await upsertUser(payload);
  }

  console.log('\n✅ Concluído!');
  console.log('Credenciais disponíveis:');
  USERS.forEach((user) => {
    console.log(` • ${user.email} / ${user.password} (${user.role})`);
  });
  console.log('');
}

main().catch((error) => {
  console.error('❌ Erro inesperado:', error.message);
  process.exitCode = 1;
});


