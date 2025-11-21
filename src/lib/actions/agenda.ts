'use server';

import { createServerComponentClient } from '~/lib/supabase/server';

/**
 * Busca profissionais/fisioterapeutas
 */
export async function getTherapists() {
  const supabase = await createServerComponentClient();

  const { data, error } = await supabase
    .from('therapists')
    .select('*')
    .eq('status', 'active')
    .order('full_name', { ascending: true });

  if (error) {
    return { error: error.message, data: null };
  }

  return { data, error: null };
}

/**
 * Busca recursos (salas, equipamentos)
 */
export async function getResources() {
  const supabase = await createServerComponentClient();

  // Se não existir tabela resources, retorna vazio
  const { data, error } = await supabase
    .from('resources')
    .select('*')
    .eq('status', 'active')
    .order('name', { ascending: true });

  if (error) {
    // Tabela pode não existir ainda
    return { data: [], error: null };
  }

  return { data, error: null };
}

/**
 * Busca agendamentos com filtros
 */
export async function getAppointments(filters: {
  startDate?: string;
  endDate?: string;
  therapistId?: string;
  resourceId?: string;
  status?: string;
}) {
  const supabase = await createServerComponentClient();

  let query = supabase
    .from('appointments')
    .select(`
      *,
      patients:patient_id (
        full_name,
        phone,
        email
      ),
      therapists:therapist_id (
        full_name
      )
    `)
    .order('start_time', { ascending: true });

  if (filters.startDate) {
    query = query.gte('start_time', filters.startDate);
  }

  if (filters.endDate) {
    query = query.lte('start_time', filters.endDate);
  }

  if (filters.therapistId) {
    query = query.eq('therapist_id', filters.therapistId);
  }

  if (filters.resourceId) {
    query = query.eq('resource_id', filters.resourceId);
  }

  if (filters.status) {
    query = query.eq('status', filters.status);
  }

  const { data, error } = await query;

  if (error) {
    return { error: error.message, data: null };
  }

  return { data, error: null };
}

