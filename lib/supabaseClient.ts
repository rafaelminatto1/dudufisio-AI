/**
 * lib/supabaseClient.ts
 * 
 * Cliente Supabase configurado para o projeto MoocaFisio
 * Singleton compartilhado por toda a aplicação
 * 
 * ⚠️ IMPORTANTE: Este é um projeto VITE (não Next.js)
 * Use import.meta.env.VITE_* ao invés de process.env.NEXT_PUBLIC_*
 */

import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';
import { logger } from './logger';

// Validar variáveis de ambiente (VITE syntax)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error(
    'VITE_SUPABASE_URL não está definida. ' +
    'Crie o arquivo .env.local na raiz do projeto. ' +
    'Veja env.supabase.example para referência. ' +
    '⚠️ Use VITE_SUPABASE_URL (não NEXT_PUBLIC_SUPABASE_URL)'
  );
}

if (!supabaseAnonKey) {
  throw new Error(
    'VITE_SUPABASE_ANON_KEY não está definida. ' +
    'Adicione a anon key no arquivo .env.local. ' +
    'Pegue em: https://supabase.com/dashboard/project/urfxniitfbbvsaskicfo/settings/api ' +
    '⚠️ Use VITE_SUPABASE_ANON_KEY (não NEXT_PUBLIC_SUPABASE_ANON_KEY)'
  );
}

// Criar cliente Supabase
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
  db: {
    schema: 'public',
  },
  global: {
    headers: {
      'x-application-name': 'dudufisio-ai',
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
  },
});

// Log de inicialização (apenas em desenvolvimento)
if (import.meta.env.DEV) {
  logger.info('Supabase Client inicializado.', {
    context: 'supabaseClient.init',
    data: { url: supabaseUrl, keyPreview: supabaseAnonKey.substring(0, 20) + '...' },
  });
}

// Helper para verificar se está conectado
export async function checkSupabaseConnection(): Promise<boolean> {
  try {
    const { error } = await supabase.from('patients').select('count').limit(1);
    return !error;
  } catch {
    return false;
  }
}

// Helper para obter usuário atual
export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error) {
    logger.error('Erro ao buscar usuário.', { context: 'supabaseClient.getCurrentUser', data: { error } });
    return null;
  }
  
  return user;
}

// Export do tipo Database para uso em outros arquivos
export type { Database };

