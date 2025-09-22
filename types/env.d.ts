// Environment variable type declarations for Vite
// This fixes "Property comes from an index signature" errors

interface ImportMetaEnv {
  // Supabase Configuration
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;

  // Next.js Legacy Support (some components still reference these)
  readonly NEXT_PUBLIC_SUPABASE_URL: string;
  readonly NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
  readonly NEXT_PUBLIC_WEBSOCKET_URL: string;

  // AI Services
  readonly VITE_GEMINI_API_KEY: string;
  readonly VITE_OPENAI_API_KEY: string;

  // Authentication
  readonly NEXTAUTH_SECRET: string;
  readonly NEXTAUTH_URL: string;

  // Cloud Services - AWS
  readonly AWS_ACCESS_KEY_ID: string;
  readonly AWS_SECRET_ACCESS_KEY: string;
  readonly AWS_REGION: string;
  readonly AWS_S3_BACKUP_BUCKET: string;

  // Cloud Services - GCP
  readonly GCP_PROJECT_ID: string;
  readonly GCP_STORAGE_BUCKET: string;

  // WebRTC/Communication
  readonly TURN_USERNAME: string;
  readonly TURN_PASSWORD: string;

  // External Services
  readonly REDIS_URL: string;
  readonly TSA_URL: string;
  readonly BACKUP_ENCRYPTION_KEY: string;

  // Payment Providers
  readonly VITE_MERCADOPAGO_ACCESS_TOKEN: string;
  readonly VITE_MERCADOPAGO_PUBLIC_KEY: string;
  readonly VITE_STRIPE_PUBLISHABLE_KEY: string;
  readonly VITE_STRIPE_SECRET_KEY: string;
  readonly VITE_ASAAS_API_KEY: string;
  readonly VITE_ASAAS_ENVIRONMENT: string;
  readonly VITE_PIX_KEY: string;

  // Development/Runtime
  readonly NODE_ENV: 'development' | 'production' | 'test';

  // User-specific properties (from user context)
  readonly name?: string;
  readonly phone?: string;
  readonly role?: string;
  readonly avatar_url?: string;
  readonly pixKey?: string;
  readonly resource?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Global process.env for Node.js environments
declare namespace NodeJS {
  interface ProcessEnv extends ImportMetaEnv {
    NEXT_PUBLIC_SUPABASE_URL: string;
    NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
    NEXT_PUBLIC_WEBSOCKET_URL: string;
    AWS_ACCESS_KEY_ID: string;
    AWS_SECRET_ACCESS_KEY: string;
    AWS_REGION: string;
    AWS_S3_BACKUP_BUCKET: string;
    GCP_PROJECT_ID: string;
    GCP_STORAGE_BUCKET: string;
    TSA_URL: string;
    BACKUP_ENCRYPTION_KEY: string;
    TURN_USERNAME: string;
    TURN_PASSWORD: string;
  }
}

// Export for use in modules
export interface EnvironmentConfig {
  supabase: {
    url: string;
    anonKey: string;
  };
  ai: {
    geminiApiKey?: string;
    openaiApiKey?: string;
  };
  auth: {
    secret?: string;
    url?: string;
  };
  payment?: {
    mercadopago?: {
      accessToken?: string;
      publicKey?: string;
    };
    stripe?: {
      publishableKey?: string;
      secretKey?: string;
    };
    asaas?: {
      apiKey?: string;
      environment?: string;
    };
    pix?: {
      key?: string;
    };
  };
  aws?: {
    accessKeyId?: string;
    secretAccessKey?: string;
    region?: string;
    s3BackupBucket?: string;
  };
  gcp?: {
    projectId?: string;
    storageBucket?: string;
  };
  webrtc?: {
    turnUsername?: string;
    turnPassword?: string;
  };
  external?: {
    redisUrl?: string;
    tsaUrl?: string;
    backupEncryptionKey?: string;
  };
  isDevelopment: boolean;
  isProduction: boolean;
}