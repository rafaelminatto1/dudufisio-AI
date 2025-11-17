'use server';

import { createServerActionClient } from '~/lib/supabase/server';
import { redirect } from 'next/navigation';

export async function login(formData: { email: string; password: string }) {
  const supabase = await createServerActionClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email: formData.email,
    password: formData.password,
  });

  if (error) {
    return { error: error.message };
  }

  return { success: true, data };
}

