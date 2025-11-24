'use server';

import { createServerComponentClient } from '~/lib/supabase/server';
import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '~/types/database.types';

/**
 * Busca sessões anteriores de um paciente
 */
export async function getPreviousSessions(
  patientId: string,
  currentSessionId?: string,
  limit = 10
) {
  const supabase = await createServerComponentClient();

  let query = (supabase as SupabaseClient<Database>)
    .from('session_evolutions')
    .select('*')
    .eq('patient_id', patientId)
    .order('session_date', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(limit);

  if (currentSessionId) {
    query = query.not('id', 'eq', currentSessionId);
  }

  const { data, error } = await query;

  if (error) {
    return { error: error.message, data: null };
  }

  return { data, error: null };
}

/**
 * Salva ou atualiza uma evolução de sessão
 */
export async function saveSessionEvolution(
  sessionId: string | null,
  data: {
    treatment_id?: string;
    appointment_id?: string;
    patient_id: string;
    therapist_id: string;
    session_number?: number;
    session_date: string;
    subjective?: string;
    objective?: string;
    assessment?: string;
    plan?: string;
    conducts?: Record<string, unknown>;
    pain_level?: number;
    auto_saved_at?: string;
  }
) {
  const supabase = await createServerComponentClient();

  if (sessionId) {
    // Atualizar
    const { data: updated, error } = await (supabase as SupabaseClient<Database>)
      .from('session_evolutions')
      .update({
        ...data,
        conducts: data.conducts as any,
        updated_at: new Date().toISOString(),
      })
      .eq('id', sessionId)
      .select()
      .single();

    if (error) {
      return { error: error.message, data: null };
    }

    return { data: updated, error: null };
  } else {
    // Criar
    const { data: created, error } = await (supabase as any)
      .from('session_evolutions')
      .insert({
        ...data,
        conducts: data.conducts as any,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      return { error: error.message, data: null };
    }

    return { data: created, error: null };
  }
}