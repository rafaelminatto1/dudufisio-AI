/**
 * lib/supabaseClient.ts
 * 
 * Cliente Supabase configurado para o projeto DuduFisio-AI
 * Singleton compartilhado por toda a aplicação
 */

import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

// Validar variáveis de ambiente
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error(
    'NEXT_PUBLIC_SUPABASE_URL não está definida. ' +
    'Crie o arquivo .env.local na raiz do projeto. ' +
    'Veja env.supabase.example para referência.'
  );
}

if (!supabaseAnonKey) {
  throw new Error(
    'NEXT_PUBLIC_SUPABASE_ANON_KEY não está definida. ' +
    'Adicione a anon key no arquivo .env.local. ' +
    'Pegue em: https://supabase.com/dashboard/project/urfxniitfbbvsaskicfo/settings/api'
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
    },
  },
});

// Log de inicialização (apenas em desenvolvimento)
if (process.env.NODE_ENV === 'development') {
  console.log('✅ Supabase Client inicializado');
  console.log('📍 URL:', supabaseUrl);
  console.log('🔑 Key:', supabaseAnonKey.substring(0, 20) + '...');
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
    console.error('Erro ao buscar usuário:', error);
    return null;
  }
  
  return user;
}

// Export do tipo Database para uso em outros arquivos
export type { Database };

