/**
 * Carrega variáveis de ambiente do .env.local
 * Para ser importado no início de cada script
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// Carregar .env.local
config({ path: resolve(process.cwd(), '.env.local') });

// Também carregar .env como fallback
config();

// Validar variáveis críticas
const requiredEnvVars = [
  'GEMINI_API_KEY',
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
];

const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('❌ Variáveis de ambiente faltando:', missingVars.join(', '));
  console.error('   Verifique seu arquivo .env.local');
  process.exit(1);
}

console.log('✅ Variáveis de ambiente carregadas com sucesso');

