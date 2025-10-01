import { createClient } from '@supabase/supabase-js';
import { observability } from './observabilityLogger';
import type { SupabaseRealtimePayload } from '../types/realtime';
import type { Database } from '../types/database';

// Use Supabase local credentials for development
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'http://127.0.0.1:54321';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

// Check if we have valid Supabase credentials (local or production)
const hasValidCredentials = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseAnonKey !== 'your_anon_key_here' &&
  (supabaseUrl.includes('supabase.co') || supabaseUrl.includes('127.0.0.1') || supabaseUrl.includes('localhost'))
);

if (!hasValidCredentials) {
  observability.security.warn('supabase.credentials.missing', {
    message: 'Supabase credentials not configuradas. Usando modo de desenvolvimento.',
  });
}

// Use mock values for development if real credentials are not available
const finalSupabaseUrl = hasValidCredentials ? supabaseUrl : 'https://mock.supabase.local';
const finalSupabaseAnonKey = hasValidCredentials
  ? supabaseAnonKey
  : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vY2siLCJyb2xlIjoiYW5vbiIsImlhdCI6MTY0NTE5MjgwMCwiZXhwIjoxOTYwNzY4ODAwfQ.mock';

// Create Supabase client with mock mode handling
export const supabase = createClient<Database>(finalSupabaseUrl, finalSupabaseAnonKey, {
  auth: {
    autoRefreshToken: hasValidCredentials,
    persistSession: hasValidCredentials,
    detectSessionInUrl: hasValidCredentials,
  },
  global: {
    headers: {
      'x-application-name': 'dudufisio-ai',
    },
  },
  db: {
    schema: 'public',
  },
  realtime: hasValidCredentials ? {
    params: {
      eventsPerSecond: 10,
    },
  } : undefined,
});

// Log successful Supabase configuration
if (hasValidCredentials) {
  observability.config.load('supabase.config.loaded', {
    environment: supabaseUrl.includes('127.0.0.1') || supabaseUrl.includes('localhost') ? 'local' : 'production',
    hasValidCredentials: true,
    url: supabaseUrl
  });
}

type SupabaseError = {
  message?: string;
  code?: string;
};

export const handleSupabaseError = (error: unknown) => {
  const supabaseError = (error ?? {}) as SupabaseError;
  
  // Only log errors in development mode and when not in mock mode
  if (hasValidCredentials || import.meta.env.DEV) {
    observability.database.error('supabase.error', {
      error: supabaseError,
    });
  }

  const message = supabaseError.message ?? '';
  const code = supabaseError.code;

  // Handle mock mode errors silently
  if (message.includes('Mock mode') || message.includes('mock.supabase.local')) {
    return null; // Don't show error messages for mock mode
  }

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


