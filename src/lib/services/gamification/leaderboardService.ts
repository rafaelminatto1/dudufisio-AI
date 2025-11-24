import { createServerComponentClient } from '~/lib/supabase/server';
import { Database } from '~/types/database.types';

type Patient = Database['public']['Tables']['patients']['Row'];

export interface LeaderboardEntry {
  rank: number;
  patientId: string;
  patientName: string;
  score: number;
  level: number;
  badge?: string;
  change?: number;
}

export interface Leaderboard {
  id: string;
  name: string;
  period: 'daily' | 'weekly' | 'monthly' | 'all-time';
  category: 'points' | 'sessions' | 'exercises' | 'streak';
  entries: LeaderboardEntry[];
  updatedAt: Date;
}

/**
 * Service para gerenciar rankings e leaderboards
 * Adaptado para Next.js App Router
 */
export class LeaderboardService {
  /**
   * Gera leaderboard de pontos XP
   */
  static async generatePointsLeaderboard(
    period: Leaderboard['period'] = 'all-time',
    limit: number = 100
  ) {
    try {
      const supabase = await createServerComponentClient();
      
      // Calcular período
      const dateFilter = this.getDateFilter(period);

      const { data: patients, error } = await supabase
        .from('patients')
        .select('id, full_name, xp_points, level')
        .order('xp_points', { ascending: false })
        .limit(limit);
      if (error) throw error;

      const entries: LeaderboardEntry[] = (patients || []).map((patient, index: number) => ({
        rank: index + 1,
        patientId: patient.id,
        patientName: patient.full_name || 'Nome não informado',
        score: (patient.xp_points as number) || 0,
        level: (patient.level as number) || 1,
        badge: index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : undefined,
      }));

      const leaderboard: Leaderboard = {
        id: `points-${period}-${Date.now()}`,
        name: `Ranking de Pontos - ${this.getPeriodLabel(period)}`,
        period,
        category: 'points',
        entries,
        updatedAt: new Date(),
      };

      return { data: leaderboard, error: null };
    } catch (error) {
      console.error('Error generating points leaderboard:', error);
      return { data: null, error };
    }
  }

  /**
   * Gera leaderboard de sessões completadas
   */
  static async generateSessionsLeaderboard(
    period: Leaderboard['period'] = 'monthly',
    limit: number = 100
  ) {
    try {
      const supabase = await createServerComponentClient();
      const dateFilter = this.getDateFilter(period);

      // Contar sessões por paciente
      let query = supabase
        .from('appointments')
        .select('patient_id, patients!inner(full_name, xp_points, level)')
        .eq('status', 'concluido');

      if (dateFilter) {
        query = query.gte('start_time', dateFilter.toISOString());
      }

      const { data: appointments, error } = await query;
      if (error) throw error;

      // Agrupar por paciente
      const sessionCounts = new Map<string, { count: number; patient: any }>();
      
      (appointments || []).forEach((apt: any) => {
        const patientId = apt.patient_id;
        const patient = apt.patients;
        
        if (!sessionCounts.has(patientId)) {
          sessionCounts.set(patientId, { count: 0, patient });
        }
        sessionCounts.get(patientId)!.count++;
      });

      // Converter para array e ordenar
      const entries: LeaderboardEntry[] = Array.from(sessionCounts.entries())
        .map(([patientId, data], index) => ({
          rank: index + 1,
          patientId,
          patientName: data.patient.full_name,
          score: data.count,
          level: data.patient.level || 1,
          badge: index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : undefined,
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
        .map((entry, index) => ({ ...entry, rank: index + 1 }));

      const leaderboard: Leaderboard = {
        id: `sessions-${period}-${Date.now()}`,
        name: `Ranking de Sessões - ${this.getPeriodLabel(period)}`,
        period,
        category: 'sessions',
        entries,
        updatedAt: new Date(),
      };

      return { data: leaderboard, error: null };
    } catch (error) {
      console.error('Error generating sessions leaderboard:', error);
      return { data: null, error };
    }
  }

  /**
   * Gera leaderboard customizado
   */
  static async generateCustomLeaderboard(
    name: string,
    category: Leaderboard['category'],
    entries: Omit<LeaderboardEntry, 'rank' | 'badge'>[],
    period: Leaderboard['period'] = 'monthly'
  ) {
    try {
      // Ordenar e atribuir ranks
      const sortedEntries = entries.sort((a, b) => b.score - a.score);
      const rankedEntries: LeaderboardEntry[] = sortedEntries.map((entry, index) => ({
        ...entry,
        rank: index + 1,
        badge: index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : undefined,
      }));

      const leaderboard: Leaderboard = {
        id: `custom-${category}-${Date.now()}`,
        name,
        period,
        category,
        entries: rankedEntries,
        updatedAt: new Date(),
      };

      return { data: leaderboard, error: null };
    } catch (error) {
      console.error('Error generating custom leaderboard:', error);
      return { data: null, error };
    }
  }

  /**
   * Obtém posição de um paciente no ranking
   */
  static async getPatientRank(patientId: string, category: Leaderboard['category'] = 'points') {
    try {
      const supabase = await createServerComponentClient();
      
      if (category === 'points') {
        const { data: patients, error } = await supabase
          .from('patients')
          .select('id, xp_points')
          .order('xp_points', { ascending: false });

        if (error) throw error;

        const rank = (patients || []).findIndex((p) => p.id === patientId) + 1;
        return { data: rank || null, error: null };
      }

      // Outras categorias podem ser implementadas aqui
      return { data: null, error: null };
    } catch (error) {
      console.error('Error getting patient rank:', error);
      return { data: null, error };
    }
  }

  /**
   * Obtém filtro de data baseado no período
   */
  private static getDateFilter(period: Leaderboard['period']): Date | null {
    const now = new Date();
    
    switch (period) {
      case 'daily':
        return new Date(now.getFullYear(), now.getMonth(), now.getDate());
      case 'weekly':
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay());
        return weekStart;
      case 'monthly':
        return new Date(now.getFullYear(), now.getMonth(), 1);
      case 'all-time':
        return null;
      default:
        return null;
    }
  }

  /**
   * Obtém label do período
   */
  private static getPeriodLabel(period: Leaderboard['period']): string {
    const labels = {
      daily: 'Hoje',
      weekly: 'Esta Semana',
      monthly: 'Este Mês',
      'all-time': 'Todos os Tempos',
    };
    return labels[period];
  }
}

