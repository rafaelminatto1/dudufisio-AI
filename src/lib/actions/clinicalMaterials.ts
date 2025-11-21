'use server';

import { createServerComponentClient } from '~/lib/supabase/server';

interface MaterialFilters {
  specialty?: string;
  category?: string;
  search?: string;
}

/**
 * Busca materiais clínicos
 */
export async function getClinicalMaterials(filters: MaterialFilters = {}) {
  const supabase = await createServerComponentClient();

  let query = supabase
    .from('clinical_materials')
    .select('*')
    .order('name', { ascending: true });

  if (filters.specialty) {
    query = query.eq('specialty', filters.specialty);
  }

  if (filters.category) {
    query = query.eq('category', filters.category);
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

