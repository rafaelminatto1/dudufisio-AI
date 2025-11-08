import { supabase } from './supabase';
import type { AuthCredentials, UserSession } from '../types';

export async function signIn(credentials: AuthCredentials): Promise<UserSession> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: credentials.email,
    password: credentials.password,
  });

  if (error || !data.session) {
    throw new Error(error?.message ?? 'Não foi possível autenticar');
  }

  return {
    token: data.session.access_token,
    refreshToken: data.session.refresh_token ?? undefined,
    user: {
      id: data.user.id,
      name: data.user.user_metadata?.name ?? data.user.email ?? 'Paciente',
      email: data.user.email ?? credentials.email,
      avatarUrl: data.user.user_metadata?.avatar_url,
    },
  };
}

export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw new Error(error.message);
  }
}

