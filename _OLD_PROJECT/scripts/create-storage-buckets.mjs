#!/usr/bin/env node
/**
 * Script para criar Storage Buckets faltantes no Supabase
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Carregar .env.local
dotenv.config({ path: join(__dirname, '..', '.env.local') });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Definição dos buckets necessários
const bucketsConfig = [
  {
    id: 'clinical-materials',
    name: 'clinical-materials',
    public: true,
    fileSizeLimit: 10485760, // 10MB
    allowedMimeTypes: [
      'image/jpeg',
      'image/png',
      'image/gif',
      'video/mp4',
      'video/webm',
      'application/pdf',
      'text/plain'
    ]
  },
  {
    id: 'patient-files',
    name: 'patient-files',
    public: false,
    fileSizeLimit: 104857600, // 100MB
    allowedMimeTypes: [
      'image/jpeg',
      'image/png',
      'image/gif',
      'video/mp4',
      'video/webm',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ]
  },
  {
    id: 'exercises',
    name: 'exercises',
    public: true,
    fileSizeLimit: 52428800, // 50MB
    allowedMimeTypes: [
      'image/jpeg',
      'image/png',
      'image/gif',
      'video/mp4',
      'video/webm',
      'application/pdf'
    ]
  }
];

async function main() {
  console.log('🚀 Criando Storage Buckets Faltantes');
  console.log('='.repeat(60));
  
  // Listar buckets existentes
  const { data: existingBuckets, error: listError } = await supabase.storage.listBuckets();
  
  if (listError) {
    console.error('❌ Erro ao listar buckets:', listError.message);
    return;
  }
  
  console.log(`\n📦 Buckets existentes: ${existingBuckets.length}`);
  existingBuckets.forEach(bucket => {
    console.log(`  ✅ ${bucket.name} ${bucket.public ? '(público)' : '(privado)'}`);
  });
  
  console.log('\n🔧 Criando buckets faltantes...\n');
  
  for (const config of bucketsConfig) {
    const exists = existingBuckets.some(b => b.name === config.name || b.id === config.id);
    
    if (exists) {
      console.log(`⏭️  ${config.name} - Já existe`);
      continue;
    }
    
    console.log(`📦 Criando bucket: ${config.name}...`);
    
    const { data, error } = await supabase.storage.createBucket(config.id, {
      public: config.public,
      fileSizeLimit: config.fileSizeLimit,
      allowedMimeTypes: config.allowedMimeTypes
    });
    
    if (error) {
      if (error.message.includes('already exists')) {
        console.log(`  ⏭️  ${config.name} - Já existe`);
      } else {
        console.error(`  ❌ Erro: ${error.message}`);
      }
    } else {
      console.log(`  ✅ ${config.name} - Criado com sucesso!`);
    }
  }
  
  // Verificar resultado final
  console.log('\n📊 Verificando resultado...\n');
  
  const { data: finalBuckets } = await supabase.storage.listBuckets();
  
  console.log('Storage Buckets finais:');
  finalBuckets.forEach(bucket => {
    const isNew = !existingBuckets.some(b => b.name === bucket.name);
    const marker = isNew ? '🆕' : '✅';
    console.log(`  ${marker} ${bucket.name} ${bucket.public ? '(público)' : '(privado)'}`);
  });
  
  console.log('\n' + '='.repeat(60));
  console.log('✅ STORAGE BUCKETS CONFIGURADOS COM SUCESSO!');
  console.log('='.repeat(60));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('\n❌ Erro:', error.message);
    process.exit(1);
  });

