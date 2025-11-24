// src/lib/utils/permission_review.ts
import { createClient } from '@supabase/supabase-js';

interface PermissionReviewResult {
  success: boolean;
  message: string;
  usersToReview?: Array<{ userId: string; email: string; issues: string[] }>;
  error?: string;
}

export async function reviewUserPermissions(): Promise<PermissionReviewResult> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Credenciais do Supabase não configuradas');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 1. Buscar todos os perfis de usuário
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles') // Assumindo uma tabela 'profiles' com user_id, email, role
      .select('user_id, email, role');

    if (profilesError) {
      console.error('[reviewUserPermissions] Erro ao buscar perfis:', profilesError.message);
      return { success: false, message: 'Erro ao buscar perfis de usuário.' };
    }

    const usersToReview: Array<{ userId: string; email: string; issues: string[] }> = [];

    for (const profile of profiles || []) {
      const issues: string[] = [];

      // Exemplo de regra: Administradores não devem ter role de Paciente
      if (profile.role === 'Administrador' && profile.role === 'Paciente') {
        issues.push('Administrador com role de Paciente.');
      }

      // Exemplo de regra: Verificar se o usuário ainda está ativo no Auth
      const { data: authUser, error: authUserError } = await supabase.auth.admin.getUserById(profile.user_id);
      const userAsAny = authUser.user as any;
      if (authUserError || !userAsAny || (userAsAny.banned_until && userAsAny.banned_until !== 'none')) {
        issues.push('Usuário inativo ou não encontrado no Supabase Auth.');
      }

      // TODO: Adicionar mais regras de verificação de permissões aqui
      // Ex: Verificar se as permissões de RLS estão alinhadas com a role
      // Ex: Verificar se há permissões órfãs ou excessivas

      if (issues.length > 0) {
        usersToReview.push({ userId: profile.user_id, email: profile.email, issues: issues });
      }
    }

    if (usersToReview.length > 0) {
      console.warn(`[reviewUserPermissions] Encontrados ${usersToReview.length} usuários com potenciais problemas de permissão.`);
    } else {
      console.log('[reviewUserPermissions] Nenhuma inconsistência de permissão encontrada.');
    }

    return {
      success: true,
      message: 'Revisão de permissões concluída.',
      usersToReview: usersToReview,
    };
  } catch (error) {
    console.error('[reviewUserPermissions] Erro fatal:', error);
    return {
      success: false,
      message: 'Ocorreu um erro inesperado ao revisar permissões de usuário.',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
