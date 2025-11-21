/**
 * Treatment Service com Cache (Next.js 16)
 * Usa React cache() e Next.js cacheLife para otimizar queries de tratamentos
 */

import { cache } from 'react';
import { unstable_cacheLife as cacheLife } from 'next/cache';
import { createServerComponentClient } from '~/lib/supabase/server';
import { Database } from '~/types/database.types';

type Treatment = Database['public']['Tables']['patient_exercise_prescriptions']['Row'];
type TreatmentInsert = Database['public']['Tables']['patient_exercise_prescriptions']['Insert'];
type TreatmentUpdate = Database['public']['Tables']['patient_exercise_prescriptions']['Update'];

/**
 * Get treatments by patient - Cached
 * Cache: Horas (tratamentos mudam pouco)
 */
export const getTreatmentsByPatient = cache(async (patientId: string) => {
  // 'use cache' // TODO: Habilitar quando Next.js suportar;
  cacheLife('hours');

  const supabase = await createServerComponentClient();
  const { data, error } = await supabase
    .from('patient_exercise_prescriptions')
    .select('*')
    .eq('patient_id', patientId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
});

/**
 * Get active treatments - Cached
 * Cache: Padrão (15 min)
 */
export const getActiveTreatments = cache(async (therapistId?: string) => {
  // 'use cache' // TODO: Habilitar quando Next.js suportar;
  cacheLife('default');

  const supabase = await createServerComponentClient();
  let query = supabase
    .from('patient_exercise_prescriptions')
    .select('*, patient:patients(*)')
    .eq('status', 'active')
    .order('created_at', { ascending: false });

  if (therapistId) {
    query = query.eq('therapist_id', therapistId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
});

/**
 * Get treatment by ID - Cached
 * Cache: Horas
 */
export const getTreatmentById = cache(async (id: string) => {
  // 'use cache' // TODO: Habilitar quando Next.js suportar;
  cacheLife('hours');

  const supabase = await createServerComponentClient();
  const { data, error } = await supabase
    .from('patient_exercise_prescriptions')
    .select('*, patient:patients(*), therapist:therapists(*)')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
});

/**
 * Get recent treatments - Cached
 * Cache: Padrão
 */
export const getRecentTreatments = cache(async (limit: number = 10) => {
  // 'use cache' // TODO: Habilitar quando Next.js suportar;
  cacheLife('default');

  const supabase = await createServerComponentClient();
  const { data, error } = await supabase
    .from('patient_exercise_prescriptions')
    .select('*, patient:patients(*)')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data || [];
});

/**
 * Get treatment statistics - Cached
 * Cache: Máximo
 */
export const getTreatmentStats = cache(async () => {
  // 'use cache' // TODO: Habilitar quando Next.js suportar;
  cacheLife('max');

  const supabase = await createServerComponentClient();

  const [activeResult, completedResult, totalResult] = await Promise.all([
    supabase
      .from('patient_exercise_prescriptions')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active'),
    supabase
      .from('patient_exercise_prescriptions')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'completed'),
    supabase
      .from('patient_exercise_prescriptions')
      .select('*', { count: 'exact', head: true }),
  ]);

  return {
    active: activeResult.count || 0,
    completed: completedResult.count || 0,
    total: totalResult.count || 0,
    completionRate:
      totalResult.count && completedResult.count
        ? (completedResult.count / totalResult.count) * 100
        : 0,
  };
});

// Mutations (não cached)
export class TreatmentServiceMutations {
  static async create(treatment: TreatmentInsert) {
    const supabase = await createServerComponentClient();
    const { data, error } = await supabase
      .from('patient_exercise_prescriptions')
      .insert(treatment)
      .select()
      .single();

    if (error) throw error;

    // TODO: Invalidar cache
    // revalidateTag('treatments');
    // revalidateTag(`treatments-patient-${treatment.patient_id}`);

    return data;
  }

  static async update(id: string, treatment: TreatmentUpdate) {
    const supabase = await createServerComponentClient();
    const { data, error } = await supabase
      .from('patient_exercise_prescriptions')
      .update(treatment)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // TODO: Invalidar cache
    // revalidateTag(`treatment-${id}`);
    // revalidateTag('treatments');

    return data;
  }

  static async delete(id: string) {
    const supabase = await createServerComponentClient();
    const { error } = await supabase
      .from('patient_exercise_prescriptions')
      .delete()
      .eq('id', id);

    if (error) throw error;

    // TODO: Invalidar cache
    // revalidateTag('treatments');

    return true;
  }
}
