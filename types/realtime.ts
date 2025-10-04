import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

export type SupabaseRealtimePayload<T extends Record<string, any>> = RealtimePostgresChangesPayload<T>;

