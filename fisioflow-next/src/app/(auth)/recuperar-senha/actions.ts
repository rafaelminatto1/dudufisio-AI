'use server';

import { createServerActionClient } from '~/lib/supabase/server';

export async function resetPassword(formData: FormData) {
  const supabase = createServerActionClient();
  const email = formData.get('email') as string;

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/reset-password`,
  });

  if (error) {
    return { error: error.message };
  }

  return { success: true, message: 'Email de recuperação enviado!' };
}

