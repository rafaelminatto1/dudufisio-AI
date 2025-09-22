import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if we have valid Supabase credentials
const hasValidCredentials = supabaseUrl &&
  supabaseAnonKey &&
  supabaseAnonKey !== 'your_anon_key_here' &&
  supabaseUrl.includes('supabase.co');

if (!hasValidCredentials) {
  console.warn('⚠️ Supabase credentials not configured. Using development mode.');
}

// Use dummy values for development if real credentials are not available
const finalSupabaseUrl = hasValidCredentials ? supabaseUrl : 'https://dummy.supabase.co';
const finalSupabaseAnonKey = hasValidCredentials ? supabaseAnonKey : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR1bW15Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2NDUxOTI4MDAsImV4cCI6MTk2MDc2ODgwMH0.dummy';

export const supabase = createClient<Database>(finalSupabaseUrl, finalSupabaseAnonKey, {
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

// Helper functions for common operations
export const handleSupabaseError = (error: any) => {
  console.error('Supabase error:', error);
  
  if (error?.message?.includes('JWT')) {
    return 'Sessão expirada. Por favor, faça login novamente.';
  }
  
  if (error?.message?.includes('duplicate')) {
    return 'Este registro já existe.';
  }
  
  if (error?.message?.includes('foreign key')) {
    return 'Este registro está sendo usado em outro lugar e não pode ser removido.';
  }
  
  if (error?.code === '23505') {
    return 'Registro duplicado encontrado.';
  }
  
  if (error?.code === 'PGRST116') {
    return 'Você não tem permissão para realizar esta ação.';
  }
  
  return error?.message || 'Ocorreu um erro ao processar sua solicitação.';
};

// Real-time subscription helper
export const subscribeToTable = (
  table: string,
  callback: (payload: any) => void,
  filter?: { column: string; value: string }
) => {
  const channel = supabase
    .channel(`${table}_changes`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table,
        ...(filter && { filter: `${filter.column}=eq.${filter.value}` }),
      },
      callback
    )
    .subscribe();

  return channel;
};

// Batch operations helper
export const batchInsert = async <T extends Record<string, any>>(
  table: string,
  data: T[],
  chunkSize = 100
) => {
  const results = [];
  
  for (let i = 0; i < data.length; i += chunkSize) {
    const chunk = data.slice(i, i + chunkSize);
    const { data: insertedData, error } = await supabase
      .from(table)
      .insert(chunk)
      .select();
    
    if (error) throw error;
    results.push(...(insertedData || []));
  }
  
  return results;
};

// Storage helpers
export const uploadFile = async (
  bucket: string,
  path: string,
  file: File
) => {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) throw error;
  
  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(path);
  
  return publicUrl;
};

export const deleteFile = async (bucket: string, path: string) => {
  const { error } = await supabase.storage
    .from(bucket)
    .remove([path]);
  
  if (error) throw error;
};

// Auth helpers
export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error) throw error;
  return user;
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};
