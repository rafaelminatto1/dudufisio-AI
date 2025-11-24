/**
 * Script para criar usuário de teste no Supabase
 * Executa: npx tsx scripts/create-test-user.ts
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// Carregar variáveis de ambiente do .env.local
function loadEnv() {
  try {
    const envPath = resolve(process.cwd(), '.env.local');
    const envContent = readFileSync(envPath, 'utf-8');
    const envVars: Record<string, string> = {};
    
    envContent.split('\n').forEach((line) => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        if (key && valueParts.length > 0) {
          envVars[key.trim()] = valueParts.join('=').trim();
        }
      }
    });
    
    Object.assign(process.env, envVars);
  } catch (error) {
    console.warn('⚠️  Não foi possível carregar .env.local, usando variáveis de ambiente do sistema');
  }
}

loadEnv();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Erro: Credenciais do Supabase não encontradas!');
  console.error('Verifique se o arquivo .env.local existe e contém:');
  console.error('  - NEXT_PUBLIC_SUPABASE_URL');
  console.error('  - SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface UserToCreate {
  email: string;
  password: string;
  name: string;
  role: string;
}

const usersToCreate: UserToCreate[] = [
  {
    email: 'admin@dudufisio.com',
    password: 'demo123456',
    name: 'Administrador',
    role: 'Admin',
  },
];

async function createUser(user: UserToCreate) {
  console.log(`\n📧 Criando usuário: ${user.email}...`);

  try {
    // 1. Criar usuário no Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: user.email,
      password: user.password,
      email_confirm: true,
      user_metadata: {
        name: user.name,
        role: user.role,
      },
    });

    if (authError) {
      // Se o usuário já existe, tentar atualizar
      if (authError.message.includes('already registered') || authError.message.includes('already exists')) {
        console.log(`⚠️  Usuário ${user.email} já existe. Buscando usuário existente...`);
        
        const { data: users, error: listError } = await supabase.auth.admin.listUsers();
        
        if (listError) {
          throw listError;
        }

        const existingUser = users.users.find(u => u.email === user.email);
        
        if (!existingUser) {
          throw new Error('Usuário não encontrado após verificação');
        }

        console.log(`✅ Usuário encontrado! ID: ${existingUser.id}`);
        console.log(`   Email: ${existingUser.email}`);
        console.log(`   Email confirmado: ${existingUser.email_confirmed_at ? 'Sim' : 'Não'}`);
        
        // Atualizar senha e confirmar email
        const { error: updateError } = await supabase.auth.admin.updateUserById(
          existingUser.id,
          {
            password: user.password,
            email_confirm: true,
            user_metadata: {
              name: user.name,
              role: user.role,
            },
          }
        );

        if (updateError) {
          throw updateError;
        }

        console.log(`✅ Usuário atualizado com sucesso!`);
        return { success: true, userId: existingUser.id, user: existingUser };
      } else {
        throw authError;
      }
    }

    if (!authData.user) {
      throw new Error('Usuário não retornado após criação');
    }

    console.log(`✅ Usuário criado com sucesso!`);
    console.log(`   ID: ${authData.user.id}`);
    console.log(`   Email: ${authData.user.email}`);

    // 2. Criar/atualizar perfil na tabela profiles
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: authData.user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'id',
      });

    if (profileError) {
      console.warn(`⚠️  Aviso: Erro ao criar/atualizar perfil: ${profileError.message}`);
      console.warn(`   O usuário foi criado no Auth, mas o perfil pode precisar ser criado manualmente.`);
    } else {
      console.log(`✅ Perfil criado/atualizado na tabela profiles`);
    }

    return { success: true, userId: authData.user.id, user: authData.user };
  } catch (error: any) {
    console.error(`❌ Erro ao criar usuário ${user.email}:`, error.message);
    return { success: false, error: error.message };
  }
}

async function main() {
  console.log('🚀 Iniciando criação de usuários de teste...\n');
  console.log(`📡 Conectando ao Supabase: ${supabaseUrl?.substring(0, 30)}...`);

  const results = [];

  for (const user of usersToCreate) {
    const result = await createUser(user);
    results.push({ user: user.email, ...result });
  }

  console.log('\n📊 Resumo:');
  console.log('─'.repeat(50));
  
  results.forEach((result) => {
    if (result.success) {
      console.log(`✅ ${result.user}: Criado/Atualizado com sucesso`);
    } else {
      console.log(`❌ ${result.user}: ${result.error}`);
    }
  });

  console.log('\n✅ Processo concluído!');
  console.log('\n📝 Próximos passos:');
  console.log('   1. Faça login no sistema com:');
  console.log(`      Email: ${usersToCreate[0].email}`);
  console.log(`      Senha: ${usersToCreate[0].password}`);
  console.log('   2. Teste as funcionalidades do sistema');
}

main().catch((error) => {
  console.error('❌ Erro fatal:', error);
  process.exit(1);
});

