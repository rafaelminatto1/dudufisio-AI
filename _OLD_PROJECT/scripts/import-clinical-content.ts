#!/usr/bin/env tsx
/**
 * Script: import-clinical-content.ts
 * Objetivo: Ler a pasta `materiais_clinicos` e os dados gerados em `scripts/generate-exercises.ts`
 *           para sincronizar conteúdos com as tabelas `clinical_material_categories`,
 *           `clinical_materials` e `exercises` do Supabase. Também salva os arquivos Markdown
 *           no Storage (bucket `clinical-materials`) para download.
 *
 * Uso:
 *    npx tsx scripts/import-clinical-content.ts
 *
 * Pré-requisitos:
 *  - Definir SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no `.env.local` (ou `.env`)
 *  - Executar `npm install` (o projeto já inclui `@supabase/supabase-js`)
 *
 * O script é idempotente: registros existentes (mesmo nome) são atualizados.
 */

import * as dotenv from 'dotenv';
import path from 'path';
import { promises as fs } from 'fs';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

import { EXERCISES_LIBRARY } from './generate-exercises';

type ClinicalMaterialRow = {
  id?: string;
  name: string;
  description?: string | null;
  type: string;
  category_id: string | null;
  content?: string | null;
  tags?: string[] | null;
  status?: 'draft' | 'published' | 'archived' | null;
  file_url?: string | null;
  file_type?: string | null;
  published_at?: string | null;
};

type CategoryConfig = {
  name: string;
  description: string;
  color: string;
  icon?: string;
  defaultType: string;
  defaultTags: string[];
};

type CategoryRecord = {
  id: string;
  name: string;
  description?: string | null;
  color?: string | null;
  icon?: string | null;
};

type ParsedMaterial = {
  title: string;
  summary?: string;
  axis?: string;
  content: string;
};

type ExerciseRecord = {
  id?: string;
  name: string;
  description: string;
  category: string;
  muscle_groups: string[] | null;
  body_parts: string[] | null;
  equipment: string[] | null;
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  difficulty: number;
  duration_minutes: number | null;
  repetitions: number | null;
  sets: number | null;
  rest_time: number | null;
  instructions: string[] | null;
  precautions: string[] | null;
  contraindications: string[] | null;
  benefits: string[] | null;
  tags: string[] | null;
  image_urls: string[] | null;
  video_url: string | null;
  is_active: boolean;
};

const CLINICAL_MATERIALS_DIR = path.resolve(process.cwd(), 'materiais_clinicos');
const STORAGE_BUCKET = 'clinical-materials';

const CATEGORY_MAP: Record<string, CategoryConfig> = {
  avaliacoes: {
    name: 'Avaliação e Diagnóstico',
    description: 'Escalas, instrumentos e testes validados para avaliação clínica.',
    color: '#0ea5e9',
    icon: 'ClipboardCheck',
    defaultType: 'assessment',
    defaultTags: ['avaliacao', 'diagnostico'],
  },
  biblioteca_clinica: {
    name: 'Biblioteca Clínica',
    description: 'Artigos, revisões e materiais de referência para equipe clínica.',
    color: '#6366f1',
    icon: 'BookOpenCheck',
    defaultType: 'reference',
    defaultTags: ['biblioteca', 'referencia'],
  },
  exercicios: {
    name: 'Biblioteca de Exercícios',
    description: 'Guias detalhados de execução de exercícios terapêuticos.',
    color: '#f97316',
    icon: 'Dumbbell',
    defaultType: 'exercise_guide',
    defaultTags: ['exercicio', 'rehab'],
  },
  guias_para_pacientes: {
    name: 'Guias para Pacientes',
    description: 'Materiais educativos e orientações entregues ao paciente.',
    color: '#10b981',
    icon: 'GraduationCap',
    defaultType: 'patient_education',
    defaultTags: ['educacao', 'paciente'],
  },
  protocolos: {
    name: 'Protocolos Clínicos',
    description: 'Protocolos completos para reabilitação e condutas fisioterapêuticas.',
    color: '#a855f7',
    icon: 'Workflow',
    defaultType: 'protocol',
    defaultTags: ['protocolo', 'tratamento'],
  },
};

function slugify(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function ensureEnv(): Promise<{ supabaseUrl: string; supabaseKey: string }> {
  const envPath = path.resolve(process.cwd(), '.env.local');
  dotenv.config({ path: envPath });
  dotenv.config(); // fallback

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY devem estar definidos em .env.local ou .env');
  }

  return { supabaseUrl, supabaseKey };
}

async function ensureBucket(client: SupabaseClient): Promise<void> {
  const { data: buckets, error } = await client.storage.listBuckets();
  if (error) {
    throw new Error(`Erro ao listar buckets: ${error.message}`);
  }

  const exists = buckets?.some((bucket) => bucket.name === STORAGE_BUCKET);
  if (!exists) {
    const { error: createError } = await client.storage.createBucket(STORAGE_BUCKET, {
      public: true,
      fileSizeLimit: 10 * 1024 * 1024,
      allowedMimeTypes: ['text/markdown', 'application/pdf', 'text/plain'],
    });
    if (createError) {
      throw new Error(`Erro ao criar bucket ${STORAGE_BUCKET}: ${createError.message}`);
    }
    console.log(`📦 Bucket "${STORAGE_BUCKET}" criado com sucesso.`);
  }
}

async function ensureCategory(
  client: SupabaseClient,
  folder: string,
): Promise<CategoryRecord> {
  const config = CATEGORY_MAP[folder];
  if (!config) {
    throw new Error(`Categoria não mapeada para pasta: ${folder}`);
  }

  const { data: existing, error: fetchError } = await client
    .from('clinical_material_categories')
    .select('id, name, description, color, icon')
    .eq('name', config.name)
    .maybeSingle();

  if (fetchError && fetchError.code !== 'PGRST116') {
    throw fetchError;
  }

  if (existing) {
    return existing;
  }

  const { data, error } = await client
    .from('clinical_material_categories')
    .insert({
      name: config.name,
      description: config.description,
      color: config.color,
      icon: config.icon,
    })
    .select('id, name, description, color, icon')
    .single();

  if (error) {
    throw error;
  }

  console.log(`🗂️  Categoria criada: ${config.name}`);
  return data!;
}

function parseMaterialMarkdown(content: string): ParsedMaterial {
  const titleMatch = content.match(/^#\s+(.+)$/m);
  const summaryMatch = content.match(/\*\*Resumo:\*\*\s*(.+)/i);
  const axisMatch = content.match(/\*\*Eixo:\*\*\s*(.+)/i);

  return {
    title: titleMatch ? titleMatch[1].trim() : 'Material sem título',
    summary: summaryMatch ? summaryMatch[1].trim() : undefined,
    axis: axisMatch ? axisMatch[1].trim() : undefined,
    content,
  };
}

async function uploadMaterialFile(
  client: SupabaseClient,
  filePath: string,
  storagePath: string,
): Promise<string | null> {
  const buffer = await fs.readFile(filePath);
  const { error: uploadError } = await client.storage
    .from(STORAGE_BUCKET)
    .upload(storagePath, buffer, {
      contentType: 'text/plain',
      upsert: true,
    });

  if (uploadError) {
    throw uploadError;
  }

  const { data } = client.storage.from(STORAGE_BUCKET).getPublicUrl(storagePath);
  return data?.publicUrl ?? null;
}

async function upsertMaterial(
  client: SupabaseClient,
  payload: ClinicalMaterialRow,
): Promise<void> {
  const { data: existing, error: fetchError } = await client
    .from('clinical_materials')
    .select('id')
    .eq('name', payload.name)
    .limit(1)
    .maybeSingle();

  if (fetchError && fetchError.code !== 'PGRST116') {
    throw fetchError;
  }

  if (existing?.id) {
    const { error } = await client
      .from('clinical_materials')
      .update({
        description: payload.description ?? null,
        type: payload.type,
        category_id: payload.category_id,
        content: payload.content ?? null,
        tags: payload.tags ?? null,
        status: payload.status ?? 'published',
        file_url: payload.file_url ?? null,
        file_type: payload.file_type ?? null,
        published_at: payload.published_at ?? null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', existing.id);

    if (error) {
      throw error;
    }
  } else {
    const { error } = await client.from('clinical_materials').insert({
      name: payload.name,
      description: payload.description ?? null,
      type: payload.type,
      category_id: payload.category_id,
      content: payload.content ?? null,
      tags: payload.tags ?? null,
      status: payload.status ?? 'published',
      file_url: payload.file_url ?? null,
      file_type: payload.file_type ?? null,
      published_at: payload.published_at ?? new Date().toISOString(),
    });

    if (error) {
      throw error;
    }
  }
}

function mapExerciseDifficulty(value: string): 'beginner' | 'intermediate' | 'advanced' {
  const normalized = value.toLowerCase();
  if (normalized.startsWith('avanc')) return 'advanced';
  if (normalized.startsWith('inter')) return 'intermediate';
  return 'beginner';
}

function parseDurationToMinutes(value?: string): number | null {
  if (!value) return null;
  const minutesMatch = value.match(/(\d+)\s*(min|mins|minutos|minuto)/i);
  if (minutesMatch) {
    return Number(minutesMatch[1]);
  }
  return null;
}

function extractRepetitions(value?: string): number | null {
  if (!value) return null;
  const match = value.match(/(\d+)/);
  return match ? Number(match[1]) : null;
}

async function upsertExercise(client: SupabaseClient, exercise: ExerciseRecord): Promise<void> {
  const { data: existing, error: fetchError } = await client
    .from('exercises')
    .select('id')
    .eq('name', exercise.name)
    .limit(1)
    .maybeSingle();

  if (fetchError && fetchError.code !== 'PGRST116') {
    throw fetchError;
  }

  if (existing?.id) {
    const { error } = await client
      .from('exercises')
      .update({
        description: exercise.description,
        category: exercise.category,
        muscle_groups: exercise.muscle_groups,
        body_parts: exercise.body_parts,
        equipment: exercise.equipment,
        difficulty_level: exercise.difficulty_level,
        difficulty: exercise.difficulty,
        duration_minutes: exercise.duration_minutes,
        repetitions: exercise.repetitions,
        sets: exercise.sets,
        rest_time: exercise.rest_time,
        instructions: exercise.instructions,
        precautions: exercise.precautions,
        contraindications: exercise.contraindications,
        benefits: exercise.benefits,
        tags: exercise.tags,
        image_urls: exercise.image_urls,
        video_url: exercise.video_url,
        is_active: exercise.is_active,
        updated_at: new Date().toISOString(),
      })
      .eq('id', existing.id);

    if (error) {
      throw error;
    }
  } else {
    const { error } = await client.from('exercises').insert({
      name: exercise.name,
      description: exercise.description,
      category: exercise.category,
      muscle_groups: exercise.muscle_groups,
      body_parts: exercise.body_parts,
      equipment: exercise.equipment,
      difficulty_level: exercise.difficulty_level,
      difficulty: exercise.difficulty,
      duration_minutes: exercise.duration_minutes,
      repetitions: exercise.repetitions,
      sets: exercise.sets,
      rest_time: exercise.rest_time,
      instructions: exercise.instructions,
      precautions: exercise.precautions,
      contraindications: exercise.contraindications,
      benefits: exercise.benefits,
      tags: exercise.tags,
      image_urls: exercise.image_urls,
      video_url: exercise.video_url,
      is_active: exercise.is_active,
    });

    if (error) {
      throw error;
    }
  }
}

async function importClinicalMaterials(client: SupabaseClient): Promise<void> {
  const entries: Array<{ folder: string; file: string }> = [];

  const folders = await fs.readdir(CLINICAL_MATERIALS_DIR);
  for (const folder of folders) {
    const folderPath = path.join(CLINICAL_MATERIALS_DIR, folder);
    const stat = await fs.stat(folderPath);
    if (!stat.isDirectory() || !CATEGORY_MAP[folder]) {
      continue;
    }

    const files = await fs.readdir(folderPath);
    for (const file of files) {
      if (!file.endsWith('.md')) continue;
      entries.push({ folder, file: path.join(folderPath, file) });
    }
  }

  if (entries.length === 0) {
    console.warn('⚠️  Nenhum arquivo Markdown encontrado em materiais_clinicos/.');
    return;
  }

  await ensureBucket(client);

  console.log(`\n📚 Importando ${entries.length} materiais clínicos...`);

  for (const { folder, file } of entries) {
    const config = CATEGORY_MAP[folder];
    const category = await ensureCategory(client, folder);
    const markdown = await fs.readFile(file, 'utf8');
    const parsed = parseMaterialMarkdown(markdown);
    const storagePath = `${folder}/${slugify(parsed.title)}.md`;
    const fileUrl = await uploadMaterialFile(client, file, storagePath);

    const payload: ClinicalMaterialRow = {
      name: parsed.title,
      description: parsed.summary ?? config.description,
      type: config.defaultType,
      category_id: category.id,
      content: markdown,
      tags: [
        ...(config.defaultTags || []),
        ...(parsed.axis ? [slugify(parsed.axis)] : []),
      ],
      status: 'published',
      file_url: fileUrl,
      file_type: 'markdown',
      published_at: new Date().toISOString(),
    };

    await upsertMaterial(client, payload);
    console.log(`   • ${parsed.title}`);
  }
}

async function importExercises(client: SupabaseClient): Promise<void> {
  if (!EXERCISES_LIBRARY || EXERCISES_LIBRARY.length === 0) {
    console.warn('\n⚠️  Nenhum exercício encontrado em EXERCISES_LIBRARY.');
    return;
  }

  console.log(`\n💪 Importando ${EXERCISES_LIBRARY.length} exercícios terapêuticos...`);

  for (const exercise of EXERCISES_LIBRARY) {
    const difficultyLevel = mapExerciseDifficulty(exercise.difficulty);
    const repetitions = extractRepetitions(exercise.repetitions);
    const durationMinutes = parseDurationToMinutes(exercise.duration);

    const record: ExerciseRecord = {
      name: exercise.name,
      description: exercise.description,
      category: exercise.category,
      muscle_groups: exercise.musclesWorked || null,
      body_parts: exercise.bodyParts || null,
      equipment: exercise.equipment || null,
      difficulty_level: difficultyLevel,
      difficulty: difficultyLevel === 'advanced' ? 3 : difficultyLevel === 'intermediate' ? 2 : 1,
      duration_minutes: durationMinutes,
      repetitions: repetitions,
      sets: exercise.sets ?? null,
      rest_time: null,
      instructions: exercise.instructions?.map((step) => step.text) ?? null,
      precautions: exercise.precautions ?? null,
      contraindications: exercise.contraindications ?? null,
      benefits: exercise.benefits ?? null,
      tags: exercise.tags ?? null,
      image_urls: exercise.images?.map((img) => img.url).filter(Boolean) ?? null,
      video_url: exercise.videos?.[0]?.url ?? null,
      is_active: true,
    };

    await upsertExercise(client, record);
    console.log(`   • ${exercise.name}`);
  }
}

async function main(): Promise<void> {
  const { supabaseUrl, supabaseKey } = await ensureEnv();
  const client = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false },
  });

  console.log('🔄 Iniciando importação de conteúdo clínico...');

  await importClinicalMaterials(client);
  await importExercises(client);

  console.log('\n✅ Importação concluída com sucesso!');
}

main().catch((error) => {
  console.error('\n❌ Erro ao importar conteúdo clínico:', error);
  process.exit(1);
});


