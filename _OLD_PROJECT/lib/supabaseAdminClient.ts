import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let cachedClient: SupabaseClient | null = null;

const resolveEnv = (key: string): string | undefined => {
  if (typeof process === 'undefined') {
    return undefined;
  }
  return (
    process.env[key] ??
    (globalThis as unknown as { [key: string]: string | undefined })[key]
  );
};

export const getSupabaseAdminClient = (): SupabaseClient | null => {
  if (typeof window !== 'undefined') {
    return null;
  }

  if (cachedClient) {
    return cachedClient;
  }

  const url =
    resolveEnv('SUPABASE_URL') ??
    resolveEnv('VITE_SUPABASE_URL') ??
    resolveEnv('NEXT_PUBLIC_SUPABASE_URL');
  const serviceRoleKey =
    resolveEnv('SUPABASE_SERVICE_ROLE_KEY') ??
    resolveEnv('VITE_SUPABASE_SERVICE_ROLE_KEY');

  if (!url || !serviceRoleKey) {
    console.warn(
      '⚠️  Supabase admin client não configurado. Defina SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY.'
    );
    return null;
  }

  cachedClient = createClient(url, serviceRoleKey, {
    auth: {
      persistSession: false,
    },
    global: {
      headers: {
        'X-Client-Info': 'dudufisio-admin-client',
      },
    },
  });

  return cachedClient;
};

