import { createClient } from '@supabase/supabase-js';
import { observability } from './observabilityLogger';
import { logger } from './logger';
import type { SupabaseRealtimePayload } from '../types/realtime';
import type { Database } from '../types/database';

// Validar variáveis de ambiente (VITE syntax)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Debug em desenvolvimento
if (import.meta.env.DEV) {
  logger.debug('[SUPABASE] Verificando variáveis de ambiente...', {
    context: 'supabase.env',
    data: {
      hasUrl: Boolean(supabaseUrl),
      hasAnonKey: Boolean(supabaseAnonKey),
      envKeys: Object.keys(import.meta.env).filter(key => key.startsWith('VITE_')),
    },
  });
}


if (!supabaseUrl) {
  // Log detalhado com checklist de solução
  console.group('❌ ERRO: Variáveis de ambiente não encontradas');
  console.error('%cVITE_SUPABASE_URL não definida', 'color: red; font-weight: bold;');
  console.log('\n📋 Checklist de solução:');
  console.log('1. ✓ Arquivo .env.local existe na raiz do projeto?');
  console.log('2. ✓ Servidor foi reiniciado após criar/editar .env.local?');
  console.log('3. ✓ Variáveis usam prefixo VITE_ (não NEXT_PUBLIC_)?');
  console.log('4. ✓ Cache do Vite foi limpo? (deletar node_modules/.vite)');
  console.log('\n📚 Documentação completa: TROUBLESHOOTING.md');
  console.log('🔧 Execute: npm run check:env para diagnóstico automático');
  console.groupEnd();
  
  logger.error('[SUPABASE] VITE_SUPABASE_URL não encontrada!', { context: 'supabase.env' });
  logger.error('Verifique se o arquivo .env.local existe na raiz do projeto.', { context: 'supabase.env' });
  logger.error('Conteúdo esperado: VITE_SUPABASE_URL=https://urfxniitfbbvsaskicfo.supabase.co', { context: 'supabase.env' });
  
  throw new Error(
    'VITE_SUPABASE_URL não está definida. ' +
    'Crie o arquivo .env.local na raiz do projeto. ' +
    'Veja env.supabase.example para referência. ' +
    '⚠️ Use VITE_SUPABASE_URL (não NEXT_PUBLIC_SUPABASE_URL)'
  );
}

if (!supabaseAnonKey) {
  // Log detalhado com checklist de solução
  console.group('❌ ERRO: Variáveis de ambiente não encontradas');
  console.error('%cVITE_SUPABASE_ANON_KEY não definida', 'color: red; font-weight: bold;');
  console.log('\n📋 Checklist de solução:');
  console.log('1. ✓ Arquivo .env.local existe na raiz do projeto?');
  console.log('2. ✓ Servidor foi reiniciado após criar/editar .env.local?');
  console.log('3. ✓ Variáveis usam prefixo VITE_ (não NEXT_PUBLIC_)?');
  console.log('4. ✓ Cache do Vite foi limpo? (deletar node_modules/.vite)');
  console.log('\n🔑 Pegue sua chave em:');
  console.log('   https://supabase.com/dashboard/project/urfxniitfbbvsaskicfo/settings/api');
  console.log('\n📚 Documentação completa: TROUBLESHOOTING.md');
  console.log('🔧 Execute: npm run check:env para diagnóstico automático');
  console.groupEnd();
  
  logger.error('[SUPABASE] VITE_SUPABASE_ANON_KEY não encontrada!', { context: 'supabase.env' });
  logger.error('Verifique se o arquivo .env.local existe na raiz do projeto.', { context: 'supabase.env' });
  logger.error('Conteúdo esperado: VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...', { context: 'supabase.env' });
  
  throw new Error(
    'VITE_SUPABASE_ANON_KEY não está definida. ' +
    'Adicione a anon key no arquivo .env.local. ' +
    'Pegue em: https://supabase.com/dashboard/project/urfxniitfbbvsaskicfo/settings/api ' +
    '⚠️ Use VITE_SUPABASE_ANON_KEY (não NEXT_PUBLIC_SUPABASE_ANON_KEY)'
  );
}

// Detectar ambiente baseado na URL
const environment = supabaseUrl.includes('supabase.co') ? 'production' : 'local';

// Create Supabase client
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
  global: {
    headers: {
      'x-application-name': 'dudufisio-ai',
    },
  },
  db: {
    schema: 'public',
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// Log successful Supabase configuration
observability.config.load('supabase.config.loaded', {
  environment,
  hasValidCredentials: true,
  url: supabaseUrl
});

// Log de inicialização (apenas em desenvolvimento)
if (import.meta.env.DEV) {
  logger.info('Supabase Client inicializado (lib/supabase.ts)', {
    context: 'supabase.init',
    data: { url: supabaseUrl, environment },
  });
}

type SupabaseError = {
  message?: string;
  code?: string;
};

export const handleSupabaseError = (error: unknown): string => {
  const supabaseError = (error ?? {}) as SupabaseError;
  
  // Log errors in development mode
  if (import.meta.env.DEV) {
    observability.database.error('supabase.error', {
      error: supabaseError,
    });
  }

  const message = supabaseError.message ?? '';
  const code = supabaseError.code;

  if (message.includes('JWT')) {
    return 'Sessão expirada. Por favor, faça login novamente.';
  }

  if (message.includes('duplicate')) {
    return 'Este registro já existe.';
  }

  if (message.includes('foreign key')) {
    return 'Este registro está sendo usado em outro lugar e não pode ser removido.';
  }

  if (code === '23505') {
    return 'Registro duplicado encontrado.';
  }

  if (code === 'PGRST116') {
    return 'Você não tem permissão para realizar esta ação.';
  }

  return message || 'Ocorreu um erro ao processar sua solicitação.';
};

// Real-time subscription helper
export const subscribeToTable = <TableName extends keyof Database['public']['Tables'] & string>(
  table: TableName,
  callback: (payload: SupabaseRealtimePayload<Database['public']['Tables'][TableName]['Row']>) => void,
  filter?: { column: string; value: string }
) => {
  return supabase
    .channel(`${table}_changes`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table,
        ...(filter && { filter: `${filter.column}=eq.${filter.value}` }),
      },
      (payload) => {
        callback(payload as SupabaseRealtimePayload<Database['public']['Tables'][TableName]['Row']>);
      }
    )
    .subscribe();
};

// Batch operations helper
export const batchInsert = async <T extends Record<string, unknown>>(
  table: string,
  data: T[],
  chunkSize = 100
) => {
  const results: unknown[] = [];

  for (let i = 0; i < data.length; i += chunkSize) {
    const chunk = data.slice(i, i + chunkSize);
    const { data: insertedData, error } = await supabase
      .from(table as never)
      .insert(chunk as never)
      .select();

    if (error) throw error;
    results.push(...(insertedData ?? []));
  }

  return results;
};

// Storage helpers
export const uploadFile = async (
  bucket: string,
  path: string,
  file: File
) => {
  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) throw error;

  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(path);

  return data.publicUrl;
};

export const deleteFile = async (bucket: string, path: string) => {
  const { error } = await supabase.storage
    .from(bucket)
    .remove([path]);

  if (error) throw error;
};

// Auth helpers
export const getCurrentUser = async () => {
  const { data, error } = await supabase.auth.getUser();

  if (error) throw error;
  return data.user;
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};


