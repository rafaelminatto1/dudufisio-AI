/**
 * BODY MAP SERVICE
 * Serviço para gerenciamento do mapa corporal de dor dos pacientes
 */

import { supabase } from '../lib/supabaseClient';
import type {
  BodyMapSession,
  BodyMapPainRegion,
  BodyMapAnalytics,
  BodyMapAnalyticsCache,
  BodyMapFilters,
  BodyMapComparison,
  BodyRegionReference,
} from '../types';

// ============================================================================
// MOCK DATA HELPERS (Fallback para quando Supabase falhar)
// ============================================================================

function createMockBodyMapSession(
  data: Omit<BodyMapSession, 'id' | 'createdAt' | 'updatedAt'>
): BodyMapSession {
  console.warn('⚠️ Usando mock data para body map session');
  return {
    id: `mock-session-${Date.now()}`,
    ...data,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

function getMockBodyMapHistory(patientId: string): BodyMapSession[] {
    console.warn('⚠️ Retornando histórico mock vazio. Patient ID:', patientId.substring(0, 8) + '...');
  // Retornar array vazio - o usuário pode criar novas sessões
  return [];
}

// ============================================================================
// CONSTANTES
// ============================================================================

export const PAIN_TYPES = [
  { value: 'aguda', label: 'Aguda' },
  { value: 'latejante', label: 'Latejante' },
  { value: 'queimação', label: 'Queimação' },
  { value: 'formigamento', label: 'Formigamento' },
  { value: 'cansaço', label: 'Cansaço' },
  { value: 'pontada', label: 'Pontada' },
  { value: 'pressão', label: 'Pressão' },
  { value: 'choque', label: 'Choque' },
] as const;

export const PAIN_INTENSITY_LABELS = {
  0: 'Sem dor',
  1: 'Muito leve',
  2: 'Leve',
  3: 'Leve/Moderada',
  4: 'Moderada',
  5: 'Moderada',
  6: 'Moderada/Forte',
  7: 'Forte',
  8: 'Muito forte',
  9: 'Quase insuportável',
  10: 'Insuportável',
} as const;

// ============================================================================
// CRUD - SESSÕES
// ============================================================================

/**
 * Cria uma nova sessão de mapa corporal
 */
export async function createBodyMapSession(
  data: Omit<BodyMapSession, 'id' | 'createdAt' | 'updatedAt'>
): Promise<BodyMapSession> {
  try {
    const { data: session, error } = await supabase
      .from('body_map_sessions')
      .insert({
        patient_id: data.patientId,
        session_id: data.sessionId,
        appointment_id: data.appointmentId,
        main_complaint_region: data.mainComplaintRegion,
        main_complaint_description: data.mainComplaintDescription,
        session_date: data.sessionDate.toISOString(),
        overall_pain_level: data.overallPainLevel,
        pain_free: data.painFree,
        notes: data.notes,
        created_by: data.createdBy,
      })
      .select()
      .single();

    if (error) {
      console.warn('Supabase error ao criar sessão, usando mock data:', error.message);
      return createMockBodyMapSession(data);
    }

    return mapDatabaseSessionToModel(session);
  } catch (error: any) {
    console.error('Error creating body map session:', error);
    // Fallback para mock em caso de erro
    console.warn('Usando fallback mock devido a erro');
    return createMockBodyMapSession(data);
  }
}

/**
 * Atualiza uma sessão existente
 */
export async function updateBodyMapSession(
  sessionId: string,
  updates: Partial<Omit<BodyMapSession, 'id' | 'createdAt'>>
): Promise<BodyMapSession> {
  try {
    const updateData: any = {};

    if (updates.mainComplaintRegion !== undefined) {
      updateData.main_complaint_region = updates.mainComplaintRegion;
    }
    if (updates.mainComplaintDescription !== undefined) {
      updateData.main_complaint_description = updates.mainComplaintDescription;
    }
    if (updates.sessionDate !== undefined) {
      updateData.session_date = updates.sessionDate.toISOString();
    }
    if (updates.overallPainLevel !== undefined) {
      updateData.overall_pain_level = updates.overallPainLevel;
    }
    if (updates.painFree !== undefined) {
      updateData.pain_free = updates.painFree;
    }
    if (updates.notes !== undefined) {
      updateData.notes = updates.notes;
    }

    const { data: session, error } = await supabase
      .from('body_map_sessions')
      .update(updateData)
      .eq('id', sessionId)
      .select()
      .single();

    if (error) throw error;

    return mapDatabaseSessionToModel(session);
  } catch (error) {
    console.error('Error updating body map session:', error);
    throw new Error('Falha ao atualizar sessão de mapa corporal');
  }
}

/**
 * Busca uma sessão específica com todas as regiões de dor
 */
export async function getBodyMapSession(sessionId: string): Promise<BodyMapSession | null> {
  try {
    const { data: session, error: sessionError } = await supabase
      .from('body_map_sessions')
      .select('*')
      .eq('id', sessionId)
      .is('deleted_at', null)
      .single();

    if (sessionError) throw sessionError;
    if (!session) return null;

    // Buscar regiões de dor desta sessão
    const { data: regions, error: regionsError } = await supabase
      .from('body_map_pain_regions')
      .select('*')
      .eq('body_map_session_id', sessionId)
      .is('deleted_at', null)
      .order('created_at', { ascending: true });

    if (regionsError) throw regionsError;

    const mappedSession = mapDatabaseSessionToModel(session);
    mappedSession.painRegions = (regions || []).map(mapDatabaseRegionToModel);

    return mappedSession;
  } catch (error) {
    console.error('Error fetching body map session:', error);
    throw new Error('Falha ao buscar sessão de mapa corporal');
  }
}

/**
 * Marca uma sessão como "sem dor"
 */
export async function markSessionPainFree(sessionId: string): Promise<BodyMapSession> {
  try {
    const { data: session, error } = await supabase
      .from('body_map_sessions')
      .update({
        pain_free: true,
        overall_pain_level: 0,
      })
      .eq('id', sessionId)
      .select()
      .single();

    if (error) throw error;

    // Marcar todas as regiões como resolvidas
    await supabase
      .from('body_map_pain_regions')
      .update({
        is_active: false,
        resolved_at: new Date().toISOString(),
      })
      .eq('body_map_session_id', sessionId);

    return mapDatabaseSessionToModel(session);
  } catch (error) {
    console.error('Error marking session as pain-free:', error);
    throw new Error('Falha ao marcar sessão sem dor');
  }
}

/**
 * Deleta (soft delete) uma sessão
 */
export async function deleteBodyMapSession(sessionId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('body_map_sessions')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', sessionId);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting body map session:', error);
    throw new Error('Falha ao deletar sessão');
  }
}

// ============================================================================
// CRUD - REGIÕES DE DOR
// ============================================================================

/**
 * Adiciona uma região de dor a uma sessão
 */
export async function addPainRegion(
  data: Omit<BodyMapPainRegion, 'id' | 'createdAt' | 'updatedAt'>
): Promise<BodyMapPainRegion> {
  try {
    const { data: region, error } = await supabase
      .from('body_map_pain_regions')
      .insert({
        body_map_session_id: data.bodyMapSessionId,
        patient_id: data.patientId,
        body_region: data.bodyRegion,
        body_side: data.bodySide,
        coordinates_x: data.coordinatesX,
        coordinates_y: data.coordinatesY,
        pain_level: data.painLevel,
        pain_types: data.painTypes,
        symptoms: data.symptoms,
        description: data.description,
        is_main_complaint: data.isMainComplaint,
        is_active: data.isActive,
      })
      .select()
      .single();

    if (error) throw error;

    // Recalcular analytics
    await recalculateAnalytics(data.patientId);

    return mapDatabaseRegionToModel(region);
  } catch (error) {
    console.error('Error adding pain region:', error);
    throw new Error('Falha ao adicionar região de dor');
  }
}

/**
 * Atualiza uma região de dor existente
 */
export async function updatePainRegion(
  regionId: string,
  updates: Partial<Omit<BodyMapPainRegion, 'id' | 'createdAt'>>
): Promise<BodyMapPainRegion> {
  try {
    const updateData: any = {};

    if (updates.bodyRegion !== undefined) updateData.body_region = updates.bodyRegion;
    if (updates.painLevel !== undefined) updateData.pain_level = updates.painLevel;
    if (updates.painTypes !== undefined) updateData.pain_types = updates.painTypes;
    if (updates.symptoms !== undefined) updateData.symptoms = updates.symptoms;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.isActive !== undefined) updateData.is_active = updates.isActive;
    if (updates.resolvedAt !== undefined) updateData.resolved_at = updates.resolvedAt.toISOString();
    if (updates.resolvedBy !== undefined) updateData.resolved_by = updates.resolvedBy;

    const { data: region, error } = await supabase
      .from('body_map_pain_regions')
      .update(updateData)
      .eq('id', regionId)
      .select()
      .single();

    if (error) throw error;

    return mapDatabaseRegionToModel(region);
  } catch (error) {
    console.error('Error updating pain region:', error);
    throw new Error('Falha ao atualizar região de dor');
  }
}

/**
 * Marca uma região de dor como resolvida
 */
export async function resolvePainRegion(regionId: string, resolvedBy: string): Promise<BodyMapPainRegion> {
  try {
    const { data: region, error } = await supabase
      .from('body_map_pain_regions')
      .update({
        is_active: false,
        resolved_at: new Date().toISOString(),
        resolved_by: resolvedBy,
      })
      .eq('id', regionId)
      .select()
      .single();

    if (error) throw error;

    // Buscar patientId para recalcular analytics
    const { data: regionData } = await supabase
      .from('body_map_pain_regions')
      .select('patient_id')
      .eq('id', regionId)
      .single();

    if (regionData) {
      await recalculateAnalytics(regionData.patient_id);
    }

    return mapDatabaseRegionToModel(region);
  } catch (error) {
    console.error('Error resolving pain region:', error);
    throw new Error('Falha ao resolver região de dor');
  }
}

/**
 * Remove (soft delete) uma região de dor
 */
export async function removePainRegion(regionId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('body_map_pain_regions')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', regionId);

    if (error) throw error;
  } catch (error) {
    console.error('Error removing pain region:', error);
    throw new Error('Falha ao remover região de dor');
  }
}

// ============================================================================
// CONSULTAS E HISTÓRICO
// ============================================================================

/**
 * Busca histórico completo de sessões de um paciente
 */
export async function getPatientBodyMapHistory(
  patientId: string,
  filters?: BodyMapFilters
): Promise<BodyMapSession[]> {
  try {
    let query = supabase
      .from('body_map_sessions')
      .select(`
        *,
        pain_regions:body_map_pain_regions(*)
      `)
      .eq('patient_id', patientId)
      .is('deleted_at', null)
      .order('session_date', { ascending: false });

    if (filters?.startDate) {
      query = query.gte('session_date', filters.startDate.toISOString());
    }
    if (filters?.endDate) {
      query = query.lte('session_date', filters.endDate.toISOString());
    }
    if (filters?.includePainFree === false) {
      query = query.eq('pain_free', false);
    }

    const { data, error } = await query;

    if (error) {
      console.warn('Supabase error ao buscar histórico, retornando mock data:', error.message);
      return getMockBodyMapHistory(patientId);
    }

    return (data || []).map((session: any) => {
      const mapped = mapDatabaseSessionToModel(session);
      mapped.painRegions = (session.pain_regions || [])
        .filter((r: any) => !r.deleted_at)
        .filter((r: any) => {
          if (filters?.onlyActiveRegions && !r.is_active) return false;
          if (filters?.bodyRegion && r.body_region !== filters.bodyRegion) return false;
          if (filters?.minPainLevel !== undefined && r.pain_level < filters.minPainLevel) return false;
          if (filters?.maxPainLevel !== undefined && r.pain_level > filters.maxPainLevel) return false;
          return true;
        })
        .map(mapDatabaseRegionToModel);
      return mapped;
    });
  } catch (error: any) {
    console.error('Error fetching patient body map history:', error);
    // Fallback para mock em caso de erro
    console.warn('Usando fallback mock devido a erro');
    return getMockBodyMapHistory(patientId);
  }
}

/**
 * Busca a última sessão de um paciente
 */
export async function getLatestBodyMapSession(patientId: string): Promise<BodyMapSession | null> {
  try {
    const { data, error } = await supabase
      .from('body_map_sessions')
      .select(`
        *,
        pain_regions:body_map_pain_regions(*)
      `)
      .eq('patient_id', patientId)
      .is('deleted_at', null)
      .order('session_date', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // No rows found
      throw error;
    }

    const mapped = mapDatabaseSessionToModel(data);
    mapped.painRegions = (data.pain_regions || [])
      .filter((r: any) => !r.deleted_at)
      .map(mapDatabaseRegionToModel);

    return mapped;
  } catch (error) {
    console.error('Error fetching latest session:', error);
    return null;
  }
}

// ============================================================================
// ANALYTICS
// ============================================================================

/**
 * Calcula analytics completos do mapa corporal para um paciente
 */
export async function getBodyMapAnalytics(
  patientId: string,
  period?: { start: Date; end: Date }
): Promise<BodyMapAnalytics> {
  try {
    // Buscar sessões no período
    const sessions = await getPatientBodyMapHistory(patientId, {
      patientId,
      startDate: period?.start,
      endDate: period?.end,
    });

    if (sessions.length === 0) {
      return {
        patientId,
        period: period || { start: new Date(), end: new Date() },
        painTrend: [],
        regionFrequency: {},
        mainComplaintProgress: [],
        heatmapData: [],
        painTypeDistribution: {},
        totalSessions: 0,
        painFreeSessions: 0,
        activeRegions: 0,
        resolvedRegions: 0,
        averagePainLevel: 0,
        improvementPercent: 0,
      };
    }

    // Calcular tendência de dor
    const painTrend = sessions.map(session => ({
      date: session.sessionDate,
      averagePain: session.painRegions
        ? session.painRegions.reduce((sum, r) => sum + r.painLevel, 0) / session.painRegions.length || 0
        : 0,
      activeRegions: session.painRegions?.filter(r => r.isActive).length || 0,
      painFreeSession: session.painFree,
    }));

    // Calcular frequência por região
    const regionFrequency: Record<string, number> = {};
    sessions.forEach(session => {
      session.painRegions?.forEach(region => {
        regionFrequency[region.bodyRegion] = (regionFrequency[region.bodyRegion] || 0) + 1;
      });
    });

    // Progresso da queixa principal
    const mainComplaintProgress = sessions
      .filter(s => s.painRegions?.some(r => r.isMainComplaint))
      .map(session => {
        const mainRegion = session.painRegions!.find(r => r.isMainComplaint)!;
        return {
          date: session.sessionDate,
          painLevel: mainRegion.painLevel,
          status: mainRegion.isActive ? 'active' : 'resolved',
        };
      });

    // Dados para heatmap
    const regionStats: Record<string, { count: number; totalPain: number }> = {};
    sessions.forEach(session => {
      session.painRegions?.forEach(region => {
        if (!regionStats[region.bodyRegion]) {
          regionStats[region.bodyRegion] = { count: 0, totalPain: 0 };
        }
        regionStats[region.bodyRegion].count++;
        regionStats[region.bodyRegion].totalPain += region.painLevel;
      });
    });

    const heatmapData = Object.entries(regionStats).map(([region, stats]) => ({
      region,
      frequency: stats.count,
      avgPainLevel: stats.totalPain / stats.count,
    }));

    // Distribuição de tipos de dor
    const painTypeDistribution: Record<string, number> = {};
    sessions.forEach(session => {
      session.painRegions?.forEach(region => {
        region.painTypes.forEach(type => {
          painTypeDistribution[type] = (painTypeDistribution[type] || 0) + 1;
        });
      });
    });

    // Métricas resumidas
    const allRegions = sessions.flatMap(s => s.painRegions || []);
    const activeRegions = allRegions.filter(r => r.isActive).length;
    const resolvedRegions = allRegions.filter(r => !r.isActive && r.resolvedAt).length;
    const averagePainLevel =
      allRegions.length > 0
        ? allRegions.reduce((sum, r) => sum + r.painLevel, 0) / allRegions.length
        : 0;

    // Calcular melhoria percentual
    const firstSession = sessions[sessions.length - 1];
    const lastSession = sessions[0];
    const firstAvg = firstSession.painRegions
      ? firstSession.painRegions.reduce((sum, r) => sum + r.painLevel, 0) / firstSession.painRegions.length
      : 0;
    const lastAvg = lastSession.painRegions
      ? lastSession.painRegions.reduce((sum, r) => sum + r.painLevel, 0) / lastSession.painRegions.length
      : 0;
    const improvementPercent = firstAvg > 0 ? ((firstAvg - lastAvg) / firstAvg) * 100 : 0;

    return {
      patientId,
      period: period || {
        start: sessions[sessions.length - 1].sessionDate,
        end: sessions[0].sessionDate,
      },
      painTrend,
      regionFrequency,
      mainComplaintProgress,
      heatmapData,
      painTypeDistribution,
      totalSessions: sessions.length,
      painFreeSessions: sessions.filter(s => s.painFree).length,
      activeRegions,
      resolvedRegions,
      averagePainLevel,
      improvementPercent,
    };
  } catch (error) {
    console.error('Error calculating analytics:', error);
    throw new Error('Falha ao calcular analytics do mapa corporal');
  }
}

/**
 * Busca analytics em cache
 */
export async function getBodyMapAnalyticsCache(
  patientId: string
): Promise<BodyMapAnalyticsCache | null> {
  try {
    const { data, error } = await supabase
      .from('body_map_analytics_cache')
      .select('*')
      .eq('patient_id', patientId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }

    return {
      id: data.id,
      patientId: data.patient_id,
      totalSessions: data.total_sessions,
      painFreeSessions: data.pain_free_sessions,
      activePainRegions: data.active_pain_regions,
      resolvedPainRegions: data.resolved_pain_regions,
      painTrend: data.pain_trend,
      averagePainLevel: data.average_pain_level,
      lastSessionDate: new Date(data.last_session_date),
      daysSinceLastSession: data.days_since_last_session,
      mainComplaintInitialPain: data.main_complaint_initial_pain,
      mainComplaintCurrentPain: data.main_complaint_current_pain,
      mainComplaintImprovementPercent: data.main_complaint_improvement_percent,
      lastCalculatedAt: new Date(data.last_calculated_at),
    };
  } catch (error) {
    console.error('Error fetching analytics cache:', error);
    return null;
  }
}

/**
 * Recalcula analytics (chama função do banco)
 */
export async function recalculateAnalytics(patientId: string): Promise<void> {
  try {
    const { error } = await supabase.rpc('recalculate_body_map_analytics', {
      p_patient_id: patientId,
    });

    if (error) throw error;
  } catch (error) {
    console.error('Error recalculating analytics:', error);
    // Não lançar erro - isso é executado em background
  }
}

// ============================================================================
// COMPARAÇÃO ENTRE SESSÕES
// ============================================================================

/**
 * Compara duas sessões (primeira vs atual)
 */
export async function compareBodyMapSessions(
  patientId: string
): Promise<BodyMapComparison | null> {
  try {
    const sessions = await getPatientBodyMapHistory(patientId);

    if (sessions.length < 2) return null;

    const firstSession = sessions[sessions.length - 1];
    const lastSession = sessions[0];

    const firstRegions = firstSession.painRegions || [];
    const lastRegions = lastSession.painRegions || [];

    // Identificar melhorias
    const improvements: string[] = [];
    firstRegions.forEach(firstR => {
      const lastR = lastRegions.find(r => r.bodyRegion === firstR.bodyRegion);
      if (lastR && lastR.painLevel < firstR.painLevel) {
        improvements.push(
          `${firstR.bodyRegion}: ${firstR.painLevel} → ${lastR.painLevel} (-${firstR.painLevel - lastR.painLevel})`
        );
      }
    });

    // Identificar pioras
    const worsenings: string[] = [];
    firstRegions.forEach(firstR => {
      const lastR = lastRegions.find(r => r.bodyRegion === firstR.bodyRegion);
      if (lastR && lastR.painLevel > firstR.painLevel) {
        worsenings.push(
          `${firstR.bodyRegion}: ${firstR.painLevel} → ${lastR.painLevel} (+${lastR.painLevel - firstR.painLevel})`
        );
      }
    });

    // Novas regiões de dor
    const newRegions = lastRegions
      .filter(lastR => !firstRegions.some(firstR => firstR.bodyRegion === lastR.bodyRegion))
      .map(r => r.bodyRegion);

    // Regiões resolvidas
    const resolvedRegions = firstRegions
      .filter(firstR => !lastRegions.some(lastR => lastR.bodyRegion === firstR.bodyRegion && lastR.isActive))
      .map(r => r.bodyRegion);

    // Mudança geral
    const firstAvg = firstRegions.reduce((sum, r) => sum + r.painLevel, 0) / firstRegions.length || 0;
    const lastAvg = lastRegions.reduce((sum, r) => sum + r.painLevel, 0) / lastRegions.length || 0;
    const overallChange = firstAvg > 0 ? ((firstAvg - lastAvg) / firstAvg) * 100 : 0;

    return {
      firstSession,
      lastSession,
      improvements,
      worsenings,
      newRegions,
      resolvedRegions,
      overallChange,
    };
  } catch (error) {
    console.error('Error comparing sessions:', error);
    throw new Error('Falha ao comparar sessões');
  }
}

// ============================================================================
// REFERÊNCIAS DE REGIÕES
// ============================================================================

/**
 * Busca todas as regiões corporais de referência
 */
export async function getBodyRegionsReference(): Promise<BodyRegionReference[]> {
  try {
    const { data, error } = await supabase
      .from('body_regions_reference')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) throw error;

    return (data || []).map((region: any) => ({
      id: region.id,
      regionKey: region.region_key,
      regionNamePt: region.region_name_pt,
      regionNameEn: region.region_name_en,
      bodySide: region.body_side,
      parentRegion: region.parent_region,
      sortOrder: region.sort_order,
    }));
  } catch (error) {
    console.error('Error fetching body regions reference:', error);
    return [];
  }
}

// ============================================================================
// HELPERS / MAPPERS
// ============================================================================

/**
 * Converte dados do banco para modelo BodyMapSession
 */
function mapDatabaseSessionToModel(data: any): BodyMapSession {
  return {
    id: data.id,
    patientId: data.patient_id,
    sessionId: data.session_id,
    appointmentId: data.appointment_id,
    mainComplaintRegion: data.main_complaint_region,
    mainComplaintDescription: data.main_complaint_description,
    sessionDate: new Date(data.session_date),
    overallPainLevel: data.overall_pain_level,
    painFree: data.pain_free,
    notes: data.notes,
    createdBy: data.created_by,
    createdAt: new Date(data.created_at),
    updatedAt: data.updated_at ? new Date(data.updated_at) : undefined,
    deletedAt: data.deleted_at ? new Date(data.deleted_at) : undefined,
  };
}

/**
 * Converte dados do banco para modelo BodyMapPainRegion
 */
function mapDatabaseRegionToModel(data: any): BodyMapPainRegion {
  return {
    id: data.id,
    bodyMapSessionId: data.body_map_session_id,
    patientId: data.patient_id,
    bodyRegion: data.body_region,
    bodySide: data.body_side,
    coordinatesX: data.coordinates_x,
    coordinatesY: data.coordinates_y,
    painLevel: data.pain_level,
    painTypes: data.pain_types || [],
    symptoms: data.symptoms || [],
    description: data.description,
    isMainComplaint: data.is_main_complaint,
    isActive: data.is_active,
    resolvedAt: data.resolved_at ? new Date(data.resolved_at) : undefined,
    resolvedBy: data.resolved_by,
    createdAt: new Date(data.created_at),
    updatedAt: data.updated_at ? new Date(data.updated_at) : undefined,
    deletedAt: data.deleted_at ? new Date(data.deleted_at) : undefined,
  };
}

/**
 * Obtém cor baseada no nível de dor
 */
export function getPainLevelColor(painLevel: number): string {
  if (painLevel === 0) return '#10b981'; // green-500
  if (painLevel <= 2) return '#22c55e'; // green-500
  if (painLevel <= 4) return '#eab308'; // yellow-500
  if (painLevel <= 6) return '#f97316'; // orange-500
  if (painLevel <= 8) return '#ef4444'; // red-500
  return '#dc2626'; // red-600
}

/**
 * Obtém label descritivo do nível de dor
 */
export function getPainLevelLabel(painLevel: number): string {
  return PAIN_INTENSITY_LABELS[painLevel as keyof typeof PAIN_INTENSITY_LABELS] || 'Desconhecido';
}

// ============================================================================
// BODYPOINT API - WRAPPER FUNCTIONS (COMPATIBILIDADE COM useBodyMapPro)
// ============================================================================
// Estas funções fornecem uma interface simplificada BodyPoint que é
// traduzida para a API BodyMapPainRegion mais completa internamente.

import type { BodyPoint } from '../types';

/**
 * Busca todos os pontos de dor de um paciente (wrapper para getPatientBodyMapHistory)
 * Converte BodyMapPainRegion → BodyPoint para compatibilidade
 */
export async function getBodyPointsByPatientId(patientId: string): Promise<BodyPoint[]> {
  try {
    const sessions = await getPatientBodyMapHistory(patientId);
    const allRegions = sessions.flatMap(s => s.painRegions || []);

    // Converter BodyMapPainRegion → BodyPoint
    return allRegions.map(region => ({
      id: region.id,
      patientId: region.patientId,
      coordinates: {
        x: region.coordinatesX,
        y: region.coordinatesY,
      },
      bodySide: region.bodySide,
      painLevel: region.painLevel,
      painType: region.isActive ? 'constant' : 'intermittent', // Aproximação
      bodyRegion: region.bodyRegion as any, // Cast para tipo compatível
      description: region.description || '',
      symptoms: region.symptoms || [],
      createdAt: region.createdAt,
      updatedAt: region.updatedAt || region.createdAt,
      createdBy: '', // Não disponível em BodyMapPainRegion
      sessionId: region.bodyMapSessionId,
    }));
  } catch (error) {
    console.error('Error fetching body points:', error);
    return [];
  }
}

/**
 * Adiciona um novo ponto de dor (wrapper para addPainRegion)
 * Converte BodyPoint → BodyMapPainRegion
 */
export async function addBodyPoint(
  point: Omit<BodyPoint, 'id' | 'createdAt' | 'updatedAt'>
): Promise<BodyPoint> {
  try {
    // Se não tem sessionId, criar uma sessão nova
    let sessionId = point.sessionId;
    if (!sessionId) {
      const session = await createBodyMapSession({
        patientId: point.patientId,
        sessionId: undefined,
        appointmentId: undefined,
        mainComplaintRegion: point.bodyRegion,
        mainComplaintDescription: point.description,
        sessionDate: new Date(),
        overallPainLevel: point.painLevel,
        painFree: false,
        notes: '',
        createdBy: point.createdBy,
      });
      sessionId = session.id;
    }

    // Converter BodyPoint → BodyMapPainRegion
    const region = await addPainRegion({
      bodyMapSessionId: sessionId,
      patientId: point.patientId,
      bodyRegion: point.bodyRegion,
      bodySide: point.bodySide,
      coordinatesX: point.coordinates.x,
      coordinatesY: point.coordinates.y,
      painLevel: point.painLevel,
      painTypes: [point.painType], // Array de 1 item
      symptoms: point.symptoms,
      description: point.description,
      isMainComplaint: false,
      isActive: true,
    });

    // Converter de volta para BodyPoint
    return {
      id: region.id,
      patientId: region.patientId,
      coordinates: {
        x: region.coordinatesX,
        y: region.coordinatesY,
      },
      bodySide: region.bodySide,
      painLevel: region.painLevel,
      painType: point.painType,
      bodyRegion: region.bodyRegion as any,
      description: region.description || '',
      symptoms: region.symptoms || [],
      createdAt: region.createdAt,
      updatedAt: region.updatedAt || region.createdAt,
      createdBy: point.createdBy,
      sessionId: region.bodyMapSessionId,
    };
  } catch (error) {
    console.error('Error adding body point:', error);
    throw new Error('Falha ao adicionar ponto de dor');
  }
}

/**
 * Atualiza um ponto de dor existente (wrapper para updatePainRegion)
 */
export async function updateBodyPoint(
  pointId: string,
  updates: Partial<Omit<BodyPoint, 'id' | 'createdAt'>>
): Promise<BodyPoint> {
  try {
    // Converter BodyPoint updates → BodyMapPainRegion updates
    const regionUpdates: Partial<Omit<import('../types').BodyMapPainRegion, 'id' | 'createdAt'>> = {};

    if (updates.bodyRegion) regionUpdates.bodyRegion = updates.bodyRegion;
    if (updates.painLevel !== undefined) regionUpdates.painLevel = updates.painLevel;
    if (updates.description) regionUpdates.description = updates.description;
    if (updates.symptoms) regionUpdates.symptoms = updates.symptoms;
    if (updates.coordinates) {
      regionUpdates.coordinatesX = updates.coordinates.x;
      regionUpdates.coordinatesY = updates.coordinates.y;
    }
    if (updates.painType) {
      regionUpdates.painTypes = [updates.painType];
    }

    const region = await updatePainRegion(pointId, regionUpdates);

    // Converter de volta para BodyPoint
    return {
      id: region.id,
      patientId: region.patientId,
      coordinates: {
        x: region.coordinatesX,
        y: region.coordinatesY,
      },
      bodySide: region.bodySide,
      painLevel: region.painLevel,
      painType: region.painTypes[0] as any || 'constant',
      bodyRegion: region.bodyRegion as any,
      description: region.description || '',
      symptoms: region.symptoms || [],
      createdAt: region.createdAt,
      updatedAt: region.updatedAt || region.createdAt,
      createdBy: '',
      sessionId: region.bodyMapSessionId,
    };
  } catch (error) {
    console.error('Error updating body point:', error);
    throw new Error('Falha ao atualizar ponto de dor');
  }
}

/**
 * Remove um ponto de dor (wrapper para removePainRegion)
 */
export async function deleteBodyPoint(pointId: string): Promise<void> {
  try {
    await removePainRegion(pointId);
  } catch (error) {
    console.error('Error deleting body point:', error);
    throw new Error('Falha ao remover ponto de dor');
  }
}

// ============================================================================
// COMPATIBILIDADE - FUNÇÕES LEGACY
// ============================================================================

/**
 * Salva uma sessão de body map (wrapper para criar ou atualizar)
 * @deprecated Use createBodyMapSession ou updateBodyMapSession diretamente
 */
export async function saveBodyMapSession(
  data: Omit<BodyMapSession, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }
): Promise<BodyMapSession> {
  try {
    // Se tem ID, atualizar sessão existente
    if (data.id) {
      const { id, ...updates } = data;
      return await updateBodyMapSession(id, updates);
    }
    
    // Caso contrário, criar nova sessão
    const { id, ...createData } = data;
    return await createBodyMapSession(createData);
  } catch (error) {
    console.error('Error saving body map session:', error);
    throw new Error('Falha ao salvar sessão de mapa corporal');
  }
}

/**
 * Busca sessões de um paciente (alias para getPatientBodyMapHistory)
 * @deprecated Use getPatientBodyMapHistory diretamente
 */
export async function getSessionsByPatient(
  patientId: string,
  filters?: BodyMapFilters
): Promise<BodyMapSession[]> {
  return getPatientBodyMapHistory(patientId, filters);
}