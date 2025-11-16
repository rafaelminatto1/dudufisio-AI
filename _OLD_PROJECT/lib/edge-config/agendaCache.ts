import { get, getAll } from '@vercel/edge-config';
import type { Therapist, ScheduleBlock, Patient } from '../../types';

export interface CachedAgendaData {
  therapists: Therapist[];
  scheduleBlocks: ScheduleBlock[];
  commonPatients: Patient[];
  lastUpdated: string;
}

/**
 * Busca dados da agenda do Edge Config (cache global distribuído)
 * - Latência ultra-baixa (~10ms vs ~200ms do Supabase)
 * - Atualizado a cada 6 horas via Cron Job
 * - Ideal para dados que mudam pouco (terapeutas, bloqueios, pacientes frequentes)
 */
export async function getAgendaCacheData(): Promise<CachedAgendaData | null> {
  try {
    // Verificar se Edge Config está configurado
    if (!process.env.EDGE_CONFIG) {
      console.warn('[AgendaCache] EDGE_CONFIG não configurado, usando fallback');
      return null;
    }

    const data = await get<CachedAgendaData>('agenda-cache');
    
    if (!data) {
      console.warn('[AgendaCache] Nenhum dado encontrado, usando fallback');
      return null;
    }

    console.log(`[AgendaCache] Cache hit! Última atualização: ${data.lastUpdated}`);
    return data;
  } catch (error) {
    console.error('[AgendaCache] Erro ao buscar cache:', error);
    return null;
  }
}

/**
 * Busca lista de terapeutas do cache
 */
export async function getCachedTherapists(): Promise<Therapist[]> {
  const cached = await getAgendaCacheData();
  return cached?.therapists || [];
}

/**
 * Busca bloqueios de horário do cache
 */
export async function getCachedScheduleBlocks(): Promise<ScheduleBlock[]> {
  const cached = await getAgendaCacheData();
  return cached?.scheduleBlocks || [];
}

/**
 * Busca pacientes frequentes do cache
 */
export async function getCachedCommonPatients(): Promise<Patient[]> {
  const cached = await getAgendaCacheData();
  return cached?.commonPatients || [];
}

/**
 * Busca todos os dados do cache de uma vez
 */
export async function getAllCachedData() {
  try {
    if (!process.env.EDGE_CONFIG) {
      return null;
    }

    const all = await getAll();
    return all;
  } catch (error) {
    console.error('[AgendaCache] Erro ao buscar todos os dados:', error);
    return null;
  }
}

/**
 * Verifica se o cache está atualizado (menos de 6 horas)
 */
export function isCacheStale(lastUpdated: string): boolean {
  const cacheTime = new Date(lastUpdated).getTime();
  const now = Date.now();
  const sixHours = 6 * 60 * 60 * 1000;
  
  return (now - cacheTime) > sixHours;
}

/**
 * Hook para usar cache com fallback automático
 */
export async function useAgendaCache<T>(
  cacheGetter: () => Promise<T>,
  fallbackGetter: () => Promise<T>
): Promise<T> {
  try {
    const cached = await cacheGetter();
    
    if (cached && Array.isArray(cached) && cached.length > 0) {
      return cached;
    }
    
    // Fallback para Supabase se cache vazio
    console.log('[AgendaCache] Cache vazio, usando Supabase...');
    return await fallbackGetter();
  } catch (error) {
    console.error('[AgendaCache] Erro, usando fallback:', error);
    return await fallbackGetter();
  }
}

