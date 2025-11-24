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

  // Tabela body_map_sessions tem estrutura diferente
  // Ajustar para usar a estrutura correta da tabela
  const insertData: any = {
    patient_id: data.patient_id,
    session_date: data.created_at || new Date().toISOString(),
    session_number: 1, // Default, pode ser ajustado
  };

  if (data.session_id) {
    insertData.appointment_id = data.session_id;
  }

  const { data: saved, error } = await (supabase as SupabaseClient<Database>)
    .from('body_map_sessions')
    .insert(insertData)
    .select()
    .single();

  if (error) {
    return { error: error.message, data: null };
  }

  // Salvar pontos de dor em body_map_pain_regions
  if (data.points && data.points.length > 0 && saved) {
    const regionsData = data.points.map((point) => ({
      session_id: saved.id,
      body_region: point.bodyPart,
      body_side: point.side || 'center',
      intensity: point.intensity,
      x_coordinate: point.x,
      y_coordinate: point.y,
      region_id: point.id, // Usar o ID do ponto como region_id
    } as any));

    await (supabase as SupabaseClient<Database>)
      .from('body_map_pain_regions')
      .insert(regionsData);
  }

  return { data: saved, error: null };
}

/**
 * Busca histórico de mapas de dor
 */
export async function getPainMapHistory(patientId: string, limit = 10) {
  const supabase = await createServerComponentClient();

  const { data, error } = await (supabase as SupabaseClient<Database>)
    .from('body_map_sessions')
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