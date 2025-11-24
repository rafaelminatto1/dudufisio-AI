/**
 * Patients Service com Cache (Next.js 15)
 * Usa React cache() para otimizar queries frequentes
 * 
 * NOTA: unstable_cacheLife é uma API experimental do Next.js que pode não estar
 * disponível ou funcionar no Next.js 15. O cache real é fornecido pelo React cache().
 * Se cacheLife não estiver funcionando, o React cache() ainda fornecerá cache por request.
 */

import { cache } from 'react';
import { unstable_cacheLife as cacheLife } from 'next/cache';
import { createServerComponentClient } from '~/lib/supabase/server';
import type { Database } from '~/types/database.types';

type Patient = Database['public']['Tables']['patients']['Row'];
type PatientInsert = Database['public']['Tables']['patients']['Insert'];
type PatientUpdate = Database['public']['Tables']['patients']['Update'];

/**
 * Get patient by ID - Cached
 * Cache: 1 hora (dados de paciente mudam pouco)
 */
export const getPatientById = cache(async (id: string) => {
  // 'use cache' - Disponível apenas no Next.js 16+
  // cacheLife é experimental e pode não estar funcionando no Next.js 15
  // O cache real é fornecido pelo React cache() acima
  try {
    cacheLife('hours'); // Cache por 1 hora (API experimental)
  } catch (e) {
    // Ignora se a API não estiver disponível
  }

  const supabase = await createServerComponentClient();
  const { data, error } = await supabase
    .from('patients')
    .select('*, user:users(*)')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
});

/**
 * Get all patients - Cached com filtros
 * Cache: Padrão (15 min) pois pode ter filtros diferentes
 */
export const getAllPatients = cache(
  async (filters?: { status?: string; search?: string }) => {
    // 'use cache' - Disponível apenas no Next.js 16+
    try {
      cacheLife('default'); // Cache por 15 min (API experimental)
    } catch (e) {
      // Ignora se a API não estiver disponível
    }

    const supabase = await createServerComponentClient();
    let query = supabase
      .from('patients')
      .select('*, user:users(*)');

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    if (filters?.search) {
      query = query.or(
        `full_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,phone.ilike.%${filters.search}%`
      );
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }
);

/**
 * Get active patients count - Cached
 * Cache: Máximo (pode esperar) - usado para dashboards
 */
export const getActivePatientsCount = cache(async () => {
  // 'use cache' - Disponível apenas no Next.js 16+
  try {
    cacheLife('max'); // Cache máximo (API experimental)
  } catch (e) {
    // Ignora se a API não estiver disponível
  }

  const supabase = await createServerComponentClient();
  const { count, error } = await supabase
    .from('patients')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active');

  if (error) throw error;
  return count || 0;
});

/**
 * Get patient statistics - Cached
 * Cache: Máximo - estatísticas podem esperar
 */
export const getPatientStats = cache(async () => {
  // 'use cache' - Disponível apenas no Next.js 16+
  try {
    cacheLife('max'); // Cache máximo (API experimental)
  } catch (e) {
    // Ignora se a API não estiver disponível
  }

  const supabase = await createServerComponentClient();

  const [activeResult, inactiveResult, totalResult] = await Promise.all([
    supabase
      .from('patients')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active'),
    supabase
      .from('patients')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'inactive'),
    supabase
      .from('patients')
      .select('*', { count: 'exact', head: true }),
  ]);

  return {
    active: activeResult.count || 0,
    inactive: inactiveResult.count || 0,
    total: totalResult.count || 0,
  };
});

/**
 * Search patients - Cached com debounce natural
 * Cache: Curto (5 min) pois busca pode mudar frequentemente
 */
export const searchPatients = cache(async (searchTerm: string) => {
  // 'use cache' - Disponível apenas no Next.js 16+
  try {
    cacheLife('default'); // Cache por 15 min (API experimental)
  } catch (e) {
    // Ignora se a API não estiver disponível
  }

  const supabase = await createServerComponentClient();
  const { data, error } = await supabase
    .from('patients')
    .select('id, full_name, email, phone, status')
    .or(
      `full_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%`
    )
    .limit(10);

  if (error) throw error;
  return data || [];
});

// Mutations (não cached) - usar com revalidateTag
export class PatientsServiceMutations {
  static async create(patient: PatientInsert) {
    const supabase = await createServerComponentClient();
    const { data, error } = await supabase
      .from('patients')
      .insert(patient)
      .select()
      .single();

    if (error) throw error;

    // TODO: Invalidar cache após criar
    // revalidateTag('patients');

    return data;
  }

  static async update(id: string, patient: PatientUpdate) {
    const supabase = await createServerComponentClient();
    const { data, error } = await supabase
      .from('patients')
      .update(patient)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // TODO: Invalidar cache após atualizar
    // revalidateTag(`patient-${id}`);
    // revalidateTag('patients');

    return data;
  }

  static async delete(id: string) {
    const supabase = await createServerComponentClient();
    const { error } = await supabase
      .from('patients')
      .delete()
      .eq('id', id);

    if (error) throw error;

    // TODO: Invalidar cache após deletar
    // revalidateTag('patients');

    return true;
  }
}
