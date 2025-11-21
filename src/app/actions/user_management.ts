// src/app/actions/user_management.ts
"use server";

import { createClient } from '@supabase/supabase-js';

interface CreateUserAccountResult {
  success: boolean;
  message: string;
  userId?: string;
  error?: string;
}

export async function createUserAccount(
  email: string,
  password?: string, // Senha opcional para provedores de terceiros
  role: 'Fisioterapeuta' | 'Administrador' | 'Paciente' = 'Paciente'
): Promise<CreateUserAccountResult> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Credenciais do Supabase não configuradas');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 1. Criar usuário no Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true, // Envia e-mail de confirmação
    });

    if (authError) {
      console.error('[createUserAccount] Erro ao criar usuário no Supabase Auth:', authError.message);
      return { success: false, message: 'Erro ao criar conta de usuário.' };
    }

    if (!authData.user) {
      return { success: false, message: 'Usuário não retornado após criação.' };
    }

    const userId = authData.user.id;

    // 2. Inserir perfil do usuário na tabela 'profiles' (ou similar)
    const { error: profileError } = await supabase
      .from('profiles') // Assumindo uma tabela 'profiles' para dados adicionais do usuário
      .insert({ user_id: userId, email: email, role: role });

    if (profileError) {
      console.error('[createUserAccount] Erro ao criar perfil do usuário:', profileError.message);
      // TODO: Considerar reverter a criação do usuário no Auth se o perfil falhar
      return { success: false, message: 'Erro ao criar perfil do usuário.' };
    }

    // TODO: Enviar credenciais de acesso ou link de ativação/boas-vindas (e-mail/WhatsApp)

    return {
      success: true,
      message: `Conta de usuário para ${email} criada com sucesso como ${role}.`,
      userId: userId,
    };
  } catch (error) {
    console.error('[createUserAccount] Erro fatal:', error);
    return {
      success: false,
      message: 'Ocorreu um erro inesperado ao criar a conta de usuário.',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

interface DeactivateUserAccountResult {
  success: boolean;
  message: string;
  error?: string;
}

export async function deactivateUserAccount(userId: string): Promise<DeactivateUserAccountResult> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Credenciais do Supabase não configuradas');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 1. Desativar o usuário no Supabase Auth
    const { error: authError } = await supabase.auth.admin.updateUserById(
      userId,
      {
        ban_duration: '1h', // Banir por um curto período para desativar, ou usar 'permanently'
        // ou simplesmente remover o usuário: await supabase.auth.admin.deleteUser(userId);
      }
    );

    if (authError) {
      console.error('[deactivateUserAccount] Erro ao desativar usuário no Supabase Auth:', authError.message);
      return { success: false, message: 'Erro ao desativar conta de usuário.' };
    }

    // 2. Opcional: Atualizar o status do perfil na tabela 'profiles'
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ status: 'inactive' }) // Assumindo um campo 'status' na tabela 'profiles'
      .eq('user_id', userId);

    if (profileError) {
      console.warn('[deactivateUserAccount] Erro ao atualizar status do perfil:', profileError.message);
      // Não é um erro crítico para a desativação, mas deve ser logado
    }

    // TODO: Revogar todas as permissões associadas ao usuário (via RLS ou outras tabelas)
    // TODO: Arquivar dados do usuário ou transferir a propriedade de dados

    return {
      success: true,
      message: `Conta de usuário ${userId} desativada com sucesso.`,
    };
  } catch (error) {
    console.error('[deactivateUserAccount] Erro fatal:', error);
    return {
      success: false,
      message: 'Ocorreu um erro inesperado ao desativar a conta de usuário.',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

interface LogAuditActivityResult {
  success: boolean;
  message: string;
  error?: string;
}

export async function logAuditActivity(
  userId: string,
  activityType: string,
  details: Record<string, any>
): Promise<LogAuditActivityResult> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Credenciais do Supabase não configuradas');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Assumindo uma tabela 'audit_logs' no Supabase
    const { error: insertError } = await (supabase as any)
      .from('audit_logs')
      .insert({
        user_id: userId,
        activity_type: activityType,
        details: details,
        timestamp: new Date().toISOString(),
      });

    if (insertError) {
      console.error('[logAuditActivity] Erro ao registrar atividade de auditoria:', insertError.message);
      return { success: false, message: 'Erro ao registrar atividade de auditoria.' };
    }

    console.log(`[logAuditActivity] Atividade de auditoria registrada para ${userId}: ${activityType}`);
    return { success: true, message: 'Atividade de auditoria registrada com sucesso.' };
  } catch (error) {
    console.error('[logAuditActivity] Erro fatal:', error);
    return {
      success: false,
      message: 'Ocorreu um erro inesperado ao registrar a atividade de auditoria.',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
