'use server';

import { createServerActionClient } from '~/lib/supabase/server';

export async function resetPassword(
  prevState: { message: string; error: string; success: boolean },
  formData: FormData
) {
  const supabase = await createServerActionClient();
  const email = formData.get('email') as string;

  if (!email) {
    return { success: false, message: '', error: 'Email é obrigatório' };
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/reset-password`,
  });

  if (error) {
    return { success: false, message: '', error: error.message };
  }

  return { success: true, message: 'Email de recuperação enviado!', error: '' };
}

