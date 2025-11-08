export const Config = {
  supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL ?? '',
  supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '',
  apiUrl: process.env.EXPO_PUBLIC_API_URL ?? '',
  enablePush: process.env.EXPO_PUBLIC_ENABLE_PUSH === 'true',
};

export const Screens = {
  auth: {
    login: '/(auth)/login',
    register: '/(auth)/register',
  },
  tabs: {
    home: '/(tabs)/home',
    exercises: '/(tabs)/exercises',
    schedule: '/(tabs)/schedule',
    profile: '/(tabs)/profile',
  },
} as const;

