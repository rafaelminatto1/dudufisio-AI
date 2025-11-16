import { createClient } from '@supabase/supabase-js';
import { Config } from '../constants/Config';

const FALLBACK_URL = 'https://example.supabase.co';
const FALLBACK_KEY = 'public-anon-key';

const supabaseUrl = Config.supabaseUrl || FALLBACK_URL;
const supabaseAnonKey = Config.supabaseAnonKey || FALLBACK_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

