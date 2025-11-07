/**
 * Supabase Client otimizado para Vercel Serverless Functions
 * 
 * Cliente configurado especificamente para uso em Edge Functions e Node.js Functions,
 * sem dependências de browser e otimizado para ambientes stateless.
 * 
 * Características:
 * - Usa process.env (compatível com Node.js e Edge Runtime)
 * - Sem persistência de sessão (adequado para stateless functions)
 * - Auto-refresh de token desabilitado (não necessário em serverless)
 * - Suporta variáveis de ambiente Vite e Next.js automaticamente
 * 
 * Variáveis de ambiente necessárias:
 * - VITE_SUPABASE_URL ou NEXT_PUBLIC_SUPABASE_URL: URL do projeto Supabase
 * - VITE_SUPABASE_ANON_KEY ou NEXT_PUBLIC_SUPABASE_ANON_KEY: Chave anon pública
 * 
 * @example
 * ```typescript
 * // Em uma Edge Function ou API Route
 * import { supabase } from '../_lib/supabaseClient';
 * 
 * export default async function handler(req: Request) {
 *   const { data, error } = await supabase
 *     .from('appointments')
 *     .select('*')
 *     .eq('status', 'active')
 *     .order('start_time', { ascending: true });
 *   
 *   if (error) throw error;
 *   return Response.json(data);
 * }
 * ```
 * 
 * @example
 * ```typescript
 * // Operações de escrita
 * const { data, error } = await supabase
 *   .from('patients')
 *   .insert({ name: 'João Silva', phone: '11999999999' })
 *   .select()
 *   .single();
 * ```
 * 
 * @see {@link https://supabase.com/docs/reference/javascript/introduction}
 * @see {@link https://vercel.com/docs/functions/edge-functions}
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error(
    '❌ Variável de ambiente SUPABASE_URL não configurada.\n' +
    '\n' +
    '📋 Ação necessária:\n' +
    '  1. Adicione VITE_SUPABASE_URL ou NEXT_PUBLIC_SUPABASE_URL no arquivo .env\n' +
    '  2. Ou configure nas variáveis de ambiente da Vercel\n' +
    '\n' +
    '🔗 Onde encontrar:\n' +
    '  Supabase Dashboard → Settings → API → Project URL\n' +
    '  https://supabase.com/dashboard/project/YOUR_PROJECT/settings/api\n' +
    '\n' +
    '💡 Exemplo:\n' +
    '  VITE_SUPABASE_URL=https://xyzcompany.supabase.co'
  );
}

if (!supabaseKey) {
  throw new Error(
    '❌ Variável de ambiente SUPABASE_ANON_KEY não configurada.\n' +
    '\n' +
    '📋 Ação necessária:\n' +
    '  1. Adicione VITE_SUPABASE_ANON_KEY ou NEXT_PUBLIC_SUPABASE_ANON_KEY no arquivo .env\n' +
    '  2. Ou configure nas variáveis de ambiente da Vercel\n' +
    '\n' +
    '🔗 Onde encontrar:\n' +
    '  Supabase Dashboard → Settings → API → Project API keys → anon/public\n' +
    '  https://supabase.com/dashboard/project/YOUR_PROJECT/settings/api\n' +
    '\n' +
    '⚠️  IMPORTANTE:\n' +
    '  Use a chave ANON (pública), NÃO a SERVICE_ROLE key (secreta)\n' +
    '\n' +
    '💡 Exemplo:\n' +
    '  VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
  );
}

/**
 * Instância configurada do Supabase Client para APIs serverless
 * 
 * Configurações:
 * - persistSession: false - Não mantém sessão entre requests (stateless)
 * - autoRefreshToken: false - Não tenta renovar tokens automaticamente
 * 
 * @public
 */
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false, // APIs serverless não precisam de sessão persistente
    autoRefreshToken: false,
  },
});

