'use server';

import { createServerComponentClient } from '~/lib/supabase/server';
import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '~/types/database.types';

interface ExerciseFilters {
  category?: string;
  difficulty?: string;
  search?: string;
}

/**
 * Busca exercícios da biblioteca
 */
export async function getExercises(filters: ExerciseFilters = {}) {
  const supabase = await createServerComponentClient();

  let query = (supabase as SupabaseClient<Database>)
    .from('exercises_library')
    .select('*')
    .order('name', { ascending: true });

  if (filters.category) {
    query = query.eq('category', filters.category);
  }

  if (filters.difficulty) {
    query = query.eq('difficulty', filters.difficulty);
  }

  if (filters.search) {
    query = query.ilike('name', `%${filters.search}%`);
  }

  const { data, error } = await query;

  if (error) {
    return { error: error.message, data: null };
  }

  return { data, error: null };
}

/**
 * Prescreve exercício para paciente
 */
export async function prescribeExercise(data: {
  patient_id: string;
  exercise_id: string;
  sets?: number;
  reps?: number;
  frequency_per_week?: number;
  duration_seconds?: number;
  instructions?: string;
  start_date?: string;
  end_date?: string;
  prescribed_by?: string;
}) {
  const supabase = await createServerComponentClient();

  // Busca usuário autenticado para prescribed_by
  const { data: { user } } = await supabase.auth.getUser();
  const prescribedBy = data.prescribed_by || user?.id || null;

  // Busca dados do exercício
  const { data: exercise, error: exerciseError } = await (supabase as SupabaseClient<Database>)
    .from('exercises_library')
    .select('name')
    .eq('id', data.exercise_id)
    .single();

  if (exerciseError || !exercise) {
    return { error: 'Exercício não encontrado', data: null };
  }

  const insertData: any = {
    patient_id: data.patient_id,
    exercise_name: exercise.name,
    exercise_video_id: data.exercise_id,
    sets: data.sets,
    reps: data.reps,
    frequency_per_week: data.frequency_per_week,
    duration_seconds: data.duration_seconds,
    instructions: data.instructions,
    start_date: data.start_date || new Date().toISOString(),
    end_date: data.end_date,
    is_active: true,
  };

  if (prescribedBy) {
    insertData.prescribed_by = prescribedBy;
  }

  const { data: prescribed, error } = await (supabase as SupabaseClient<Database>)
    .from('patient_exercises')
    .insert(insertData)
    .select()
    .single();

  if (error) {
    return { error: error.message, data: null };
  }

  return { data: prescribed, error: null };
}