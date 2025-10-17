#!/usr/bin/env node

/**
 * Script para Sincronizar Usuários do Auth para Tabela Users
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

console.log('🔄 Sincronizando usuários do Auth para tabela users...\n');

async function syncUsers() {
  try {
    // Buscar todos os usuários do Auth
    const { data: authData, error: authError } = await supabase.auth.admin.listUsers();

    if (authError) {
      throw new Error(`Erro ao buscar usuários do Auth: ${authError.message}`);
    }

    console.log(`📋 Encontrados ${authData.users.length} usuário(s) no Auth`);

    let synced = 0;
    let skipped = 0;
    let errors = 0;

    for (const authUser of authData.users) {
      try {
        // Verificar se já existe na tabela users
        const { data: existingUser } = await supabase
          .from('users')
          .select('id')
          .eq('auth_id', authUser.id)
          .single();

        if (existingUser) {
          console.log(`⏭️  Pulando ${authUser.email || authUser.phone} (já existe)`);
          skipped++;
          continue;
        }

        // Criar na tabela users
        const { data: newUser, error: insertError } = await supabase
          .from('users')
          .insert({
            auth_id: authUser.id,
            email: authUser.email,
            phone: authUser.phone,
            full_name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'Usuário',
            role: authUser.user_metadata?.role || 'patient',
            notification_preferences: {
              email: true,
              sms: true,
              whatsapp: false,
              push: true,
              appointment_reminder_24h: true,
              appointment_reminder_2h: true,
              appointment_confirmed: true,
              appointment_cancelled: true,
              payment_received: true,
              payment_due: true,
              marketing: false,
              system: true
            }
          })
          .select()
          .single();

        if (insertError) {
          console.error(`❌ Erro ao criar ${authUser.email || authUser.phone}:`, insertError.message);
          errors++;
          continue;
        }

        console.log(`✅ Criado ${authUser.email || authUser.phone} → ID: ${newUser.id}`);
        synced++;

      } catch (userError) {
        console.error(`❌ Erro ao processar usuário:`, userError.message);
        errors++;
      }
    }

    console.log('\n═══════════════════════════════════════════════════');
    console.log('🎉 SINCRONIZAÇÃO COMPLETA!');
    console.log('═══════════════════════════════════════════════════');
    console.log(`✅ Sincronizados: ${synced}`);
    console.log(`⏭️  Pulados: ${skipped}`);
    console.log(`❌ Erros: ${errors}`);
    console.log('');

    if (synced > 0 || skipped > 0) {
      console.log('🚀 Próximo passo:');
      console.log('   Execute: node scripts/test-notifications.js');
      console.log('');
    }

  } catch (error) {
    console.error('\n❌ ERRO:');
    console.error(error.message);
    process.exit(1);
  }
}

syncUsers();
