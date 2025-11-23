'use server';

import { createServerComponentClient } from '~/lib/supabase/server';
import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '~/types/database.types';

interface PainPoint {
  id: string;
  x: number;
  y: number;
  intensity: number;
  bodyPart: string;
  side?: 'left' | 'right' | 'center';
}

interface PainMapData {
  patient_id: string;
  session_id?: string;
  view: 'front' | 'back';
  points: PainPoint[];
  created_at: string;
}

/**
 * Salva um mapa de dor
 */
export async function savePainMap(data: PainMapData) {
  const supabase = await createServerComponentClient();

  const { data: saved, error } = await (supabase as SupabaseClient<Database>)
    .from('body_pain_maps')
    .insert({
      patient_id: data.patient_id,
      session_id: data.session_id,
      view: data.view,
      points: data.points,
      created_at: data.created_at,
    })
    .select()
    .single();

  if (error) {
    return { error: error.message, data: null };
  }

  return { data: saved, error: null };
}

/**
 * Busca histórico de mapas de dor
 */
export async function getPainMapHistory(patientId: string, limit = 10) {
  const supabase = await createServerComponentClient();

  const { data, error } = await (supabase as SupabaseClient<Database>)
    .from('body_pain_maps')
    .select('*')
    .eq('patient_id', patientId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    return { error: error.message, data: null };
  }

  return { data, error: null };
}

/**
 * Exporta mapa de dor para PDF (placeholder)
 */
export async function exportPainMapToPDF(patientId: string, mapId: string) {
  // TODO: Implementar geração de PDF usando react-pdf ou similar
  return { error: 'Funcionalidade em desenvolvimento', data: null };
}