import { SessionEvolution, EmojiRatingValue, Patient } from '../types';
import { shouldUseSupabase, logDataSource } from '../config/supabaseTablesConfig';
import * as sessionEvolutionService from './sessionEvolutionService';

/**
 * Service dedicado para operações com sistema de feedback (ratings)
 * Abstrai lógica de avaliações com emojis
 */

// ============================================================================
// INTERFACES E TIPOS
// ============================================================================

export interface SessionRating {
  id: string;
  sessionId: string;
  patientId: string;
  patientName: string;
  sessionDate: string;
  patient_rating?: EmojiRatingValue;
  professional_rating?: EmojiRatingValue;
  rating_comment?: string;
}

export interface RatingStats {
  patientId: string;
  totalSessions: number;
  avgPatientRating: number;
  avgProfessionalRating: number;
  positiveSessions: number;
  negativeSessions: number;
  excellentSessions: number;
  poorSessions: number;
  sessionsWithComments: number;
}

export interface RatingTrend {
  patientId: string;
  lastPatientRating?: EmojiRatingValue;
  lastProfessionalRating?: EmojiRatingValue;
  prevPatientRating?: EmojiRatingValue;
  prevProfessionalRating?: EmojiRatingValue;
  patientTrend: 'improving' | 'declining' | 'stable' | 'new';
  professionalTrend: 'improving' | 'declining' | 'stable' | 'new';
}

// ============================================================================
// FUNÇÕES PRINCIPAIS
// ============================================================================

/**
 * Busca histórico de avaliações de um paciente
 */
export async function getRatings(patientId: string): Promise<SessionRating[]> {
  try {
    logDataSource('service', `getRatings(${patientId})`);
    
    const evolutions = await sessionEvolutionService.getRatingsByPatientId(patientId);
    
    return evolutions.map(ev => ({
      id: ev.id,
      sessionId: ev.sessionId,
      patientId: ev.patientId,
      patientName: '', // Será preenchido se necessário
      sessionDate: ev.sessionDate,
      patient_rating: ev.patient_rating,
      professional_rating: ev.professional_rating,
      rating_comment: ev.rating_comment,
    }));
  } catch (error) {
    console.error('Erro ao buscar ratings:', error);
    return [];
  }
}

/**
 * Busca estatísticas de avaliações de um paciente
 */
export async function getStats(patientId: string): Promise<RatingStats> {
  try {
    logDataSource('service', `getStats(${patientId})`);
    
    const stats = await sessionEvolutionService.getRatingStats(patientId);
    const ratings = await getRatings(patientId);
    
    const sessionsWithComments = ratings.filter(
      r => r.rating_comment && r.rating_comment.trim() !== ''
    ).length;
    
    return {
      patientId,
      totalSessions: stats.totalSessions,
      avgPatientRating: stats.avgPatientRating,
      avgProfessionalRating: stats.avgProfessionalRating,
      positiveSessions: stats.positiveSessions,
      negativeSessions: stats.negativeSessions,
      excellentSessions: stats.excellentSessions,
      poorSessions: stats.poorSessions,
      sessionsWithComments,
    };
  } catch (error) {
    console.error('Erro ao buscar estatísticas de ratings:', error);
    return {
      patientId,
      totalSessions: 0,
      avgPatientRating: 0,
      avgProfessionalRating: 0,
      positiveSessions: 0,
      negativeSessions: 0,
      excellentSessions: 0,
      poorSessions: 0,
      sessionsWithComments: 0,
    };
  }
}

/**
 * Busca média de avaliações em um período específico
 */
export async function getAverageByPeriod(
  patientId: string,
  startDate: Date,
  endDate: Date
): Promise<{ patient: number; professional: number; total: number }> {
  try {
    logDataSource('service', `getAverageByPeriod(${patientId})`);
    
    const ratings = await sessionEvolutionService.getRatingsByPeriod(
      patientId,
      startDate,
      endDate
    );
    
    const patientRatings = ratings
      .map(r => r.patient_rating)
      .filter((r): r is number => r !== undefined && r !== null);
    
    const professionalRatings = ratings
      .map(r => r.professional_rating)
      .filter((r): r is number => r !== undefined && r !== null);
    
    return {
      patient: patientRatings.length > 0
        ? patientRatings.reduce((a, b) => a + b, 0) / patientRatings.length
        : 0,
      professional: professionalRatings.length > 0
        ? professionalRatings.reduce((a, b) => a + b, 0) / professionalRatings.length
        : 0,
      total: ratings.length,
    };
  } catch (error) {
    console.error('Erro ao calcular média por período:', error);
    return { patient: 0, professional: 0, total: 0 };
  }
}

/**
 * Busca últimas N avaliações de todos os pacientes
 */
export async function getRecentRatings(limit: number = 10): Promise<SessionRating[]> {
  try {
    logDataSource('service', `getRecentRatings(${limit})`);
    
    const evolutions = await sessionEvolutionService.getRecentRatings(limit);
    
    return evolutions.map(ev => ({
      id: ev.id,
      sessionId: ev.sessionId,
      patientId: ev.patientId,
      patientName: '', // Será preenchido se necessário
      sessionDate: ev.sessionDate,
      patient_rating: ev.patient_rating,
      professional_rating: ev.professional_rating,
      rating_comment: ev.rating_comment,
    }));
  } catch (error) {
    console.error('Erro ao buscar avaliações recentes:', error);
    return [];
  }
}

/**
 * Analisa tendência das avaliações de um paciente
 */
export async function getRatingTrend(patientId: string): Promise<RatingTrend | null> {
  try {
    logDataSource('service', `getRatingTrend(${patientId})`);
    
    const ratings = await getRatings(patientId);
    
    if (ratings.length === 0) {
      return null;
    }
    
    const lastRating = ratings[0]; // Já vem ordenado por data desc
    const prevRating = ratings.length > 1 ? ratings[1] : null;
    
    const getPatientTrend = (): RatingTrend['patientTrend'] => {
      if (!lastRating.patient_rating) return 'new';
      if (!prevRating || !prevRating.patient_rating) return 'new';
      if (lastRating.patient_rating > prevRating.patient_rating) return 'improving';
      if (lastRating.patient_rating < prevRating.patient_rating) return 'declining';
      return 'stable';
    };
    
    const getProfessionalTrend = (): RatingTrend['professionalTrend'] => {
      if (!lastRating.professional_rating) return 'new';
      if (!prevRating || !prevRating.professional_rating) return 'new';
      if (lastRating.professional_rating > prevRating.professional_rating) return 'improving';
      if (lastRating.professional_rating < prevRating.professional_rating) return 'declining';
      return 'stable';
    };
    
    return {
      patientId,
      lastPatientRating: lastRating.patient_rating,
      lastProfessionalRating: lastRating.professional_rating,
      prevPatientRating: prevRating?.patient_rating,
      prevProfessionalRating: prevRating?.professional_rating,
      patientTrend: getPatientTrend(),
      professionalTrend: getProfessionalTrend(),
    };
  } catch (error) {
    console.error('Erro ao analisar tendência de ratings:', error);
    return null;
  }
}

/**
 * Calcula média geral de todas as avaliações do sistema
 */
export async function getGlobalAverageRating(): Promise<{
  patient: number;
  professional: number;
  total: number;
}> {
  try {
    logDataSource('service', 'getGlobalAverageRating()');
    
    const recentRatings = await sessionEvolutionService.getRecentRatings(100);
    
    const patientRatings = recentRatings
      .map(r => r.patient_rating)
      .filter((r): r is number => r !== undefined && r !== null);
    
    const professionalRatings = recentRatings
      .map(r => r.professional_rating)
      .filter((r): r is number => r !== undefined && r !== null);
    
    return {
      patient: patientRatings.length > 0
        ? patientRatings.reduce((a, b) => a + b, 0) / patientRatings.length
        : 0,
      professional: professionalRatings.length > 0
        ? professionalRatings.reduce((a, b) => a + b, 0) / professionalRatings.length
        : 0,
      total: recentRatings.length,
    };
  } catch (error) {
    console.error('Erro ao calcular média global:', error);
    return { patient: 0, professional: 0, total: 0 };
  }
}

/**
 * Identifica pacientes com baixa satisfação
 */
export async function getPatientsWithLowSatisfaction(
  threshold: number = 2.5
): Promise<Array<{ patientId: string; avgRating: number; lastRating?: EmojiRatingValue }>> {
  try {
    logDataSource('service', `getPatientsWithLowSatisfaction(threshold: ${threshold})`);
    
    // Buscar todos os ratings recentes
    const recentRatings = await sessionEvolutionService.getRecentRatings(200);
    
    // Agrupar por paciente
    const patientRatingsMap = new Map<string, EmojiRatingValue[]>();
    
    recentRatings.forEach(rating => {
      if (rating.patient_rating) {
        if (!patientRatingsMap.has(rating.patientId)) {
          patientRatingsMap.set(rating.patientId, []);
        }
        patientRatingsMap.get(rating.patientId)!.push(rating.patient_rating);
      }
    });
    
    // Calcular médias e filtrar baixa satisfação
    const lowSatisfactionPatients: Array<{
      patientId: string;
      avgRating: number;
      lastRating?: EmojiRatingValue;
    }> = [];
    
    patientRatingsMap.forEach((ratings, patientId) => {
      const avgRating = ratings.reduce((a, b) => a + b, 0) / ratings.length;
      if (avgRating <= threshold) {
        lowSatisfactionPatients.push({
          patientId,
          avgRating,
          lastRating: ratings[0],
        });
      }
    });
    
    return lowSatisfactionPatients.sort((a, b) => a.avgRating - b.avgRating);
  } catch (error) {
    console.error('Erro ao identificar pacientes com baixa satisfação:', error);
    return [];
  }
}

/**
 * Calcula taxa de resposta (quantos % das sessões têm avaliação)
 */
export async function getResponseRate(patientId: string): Promise<number> {
  try {
    logDataSource('service', `getResponseRate(${patientId})`);
    
    const allSessions = await sessionEvolutionService.getEvolutionsByPatientId(patientId);
    const ratedSessions = allSessions.filter(
      s => s.patient_rating || s.professional_rating
    );
    
    if (allSessions.length === 0) return 0;
    
    return (ratedSessions.length / allSessions.length) * 100;
  } catch (error) {
    console.error('Erro ao calcular taxa de resposta:', error);
    return 0;
  }
}

// ============================================================================
// FUNÇÕES AUXILIARES
// ============================================================================

/**
 * Formata média de rating para exibição
 */
export function formatAverageRating(avg: number): string {
  if (avg === 0) return 'Sem avaliações';
  return avg.toFixed(1);
}

/**
 * Retorna descrição textual da tendência
 */
export function getTrendDescription(trend: RatingTrend['patientTrend']): string {
  switch (trend) {
    case 'improving':
      return 'Melhorando';
    case 'declining':
      return 'Piorando';
    case 'stable':
      return 'Estável';
    case 'new':
      return 'Primeira avaliação';
    default:
      return 'Desconhecido';
  }
}

/**
 * Retorna cor da tendência
 */
export function getTrendColor(trend: RatingTrend['patientTrend']): string {
  switch (trend) {
    case 'improving':
      return 'text-green-600';
    case 'declining':
      return 'text-red-600';
    case 'stable':
      return 'text-blue-600';
    case 'new':
      return 'text-gray-600';
    default:
      return 'text-gray-400';
  }
}

