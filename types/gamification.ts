export type AchievementCategory =
  | 'attendance' // Frequência e pontualidade
  | 'performance' // Performance profissional  
  | 'engagement' // Engajamento do paciente
  | 'milestone' // Marcos de tratamento
  | 'social' // Interações sociais
  | 'special'; // Conquistas especiais/raras

export type AchievementRarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  category: AchievementCategory;
  rarity: AchievementRarity;
  icon: string; // Emoji ou lucide icon name
  points: number;
  criteria: AchievementCriteria;
  unlockedBy?: string[]; // User IDs
  createdAt: Date;
}

export interface AchievementCriteria {
  type: 'count' | 'streak' | 'threshold' | 'completion' | 'rating' | 'custom';
  target: number;
  metric: string; // e.g., 'appointments', 'exercises', 'nps_score'
  comparison?: 'gte' | 'lte' | 'eq';
  timeframe?: 'day' | 'week' | 'month' | 'year' | 'all-time';
}

export interface UserAchievement {
  userId: string;
  achievementId: string;
  unlockedAt: Date;
  progress: number; // 0-100
  isNew: boolean; // Para mostrar notificação
}

export interface UserStats {
  userId: string;
  totalPoints: number;
  level: number;
  rank: string; // Bronze, Silver, Gold, Platinum
  achievements: UserAchievement[];
  streaks: UserStreak[];
  badges: string[];
  updatedAt: Date;
}

export interface UserStreak {
  type: 'daily-login' | 'appointments' | 'exercises' | 'on-time';
  current: number;
  longest: number;
  lastUpdated: Date;
}

export interface Leaderboard {
  id: string;
  name: string;
  period: 'daily' | 'weekly' | 'monthly' | 'all-time';
  category: 'points' | 'revenue' | 'appointments' | 'satisfaction' | 'custom';
  entries: LeaderboardEntry[];
  updatedAt: Date;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  userName: string;
  userRole: string;
  score: number;
  change: number; // +/- from last period
  badge?: string;
}

export const ACHIEVEMENT_TEMPLATES: Omit<Achievement, 'id' | 'createdAt' | 'unlockedBy'>[] = [
  // TERAPEUTAS
  {
    name: '🏆 Centurião',
    description: 'Complete 100 consultas',
    category: 'performance',
    rarity: 'epic',
    icon: '🏆',
    points: 500,
    criteria: { type: 'count', target: 100, metric: 'appointments' }
  },
  {
    name: '⭐ 5 Estrelas',
    description: 'Mantenha NPS médio acima de 9.0',
    category: 'performance',
    rarity: 'legendary',
    icon: '⭐',
    points: 1000,
    criteria: { type: 'threshold', target: 9, metric: 'nps_average', comparison: 'gte' }
  },
  {
    name: '🔥 Sequência Perfeita',
    description: '30 dias consecutivos trabalhando',
    category: 'attendance',
    rarity: 'rare',
    icon: '🔥',
    points: 300,
    criteria: { type: 'streak', target: 30, metric: 'work_days' }
  },
  {
    name: '💰 Faturador',
    description: 'Gere R$ 50.000 em um mês',
    category: 'performance',
    rarity: 'epic',
    icon: '💰',
    points: 750,
    criteria: { type: 'threshold', target: 50000, metric: 'monthly_revenue', comparison: 'gte', timeframe: 'month' }
  },
  {
    name: '⏰ Pontual',
    description: '50 consultas sem atrasos',
    category: 'attendance',
    rarity: 'common',
    icon: '⏰',
    points: 100,
    criteria: { type: 'count', target: 50, metric: 'on_time_appointments' }
  },

  // PACIENTES
  {
    name: '💪 Dedicado',
    description: 'Complete 10 sessões',
    category: 'milestone',
    rarity: 'common',
    icon: '💪',
    points: 100,
    criteria: { type: 'count', target: 10, metric: 'completed_sessions' }
  },
  {
    name: '🎯 Assíduo',
    description: '30 dias sem faltas',
    category: 'attendance',
    rarity: 'rare',
    icon: '🎯',
    points: 250,
    criteria: { type: 'streak', target: 30, metric: 'no_show_free' }
  },
  {
    name: '🏃 Maratonista',
    description: 'Complete 100 exercícios',
    category: 'engagement',
    rarity: 'epic',
    icon: '🏃',
    points: 500,
    criteria: { type: 'count', target: 100, metric: 'exercises_completed' }
  },
  {
    name: '🌟 Progresso Exemplar',
    description: 'Evolução de 90% ou mais',
    category: 'milestone',
    rarity: 'legendary',
    icon: '🌟',
    points: 1000,
    criteria: { type: 'threshold', target: 90, metric: 'treatment_progress', comparison: 'gte' }
  },
  {
    name: '📅 Sempre Presente',
    description: 'Zero faltas em 3 meses',
    category: 'attendance',
    rarity: 'epic',
    icon: '📅',
    points: 600,
    criteria: { type: 'count', target: 0, metric: 'no_shows', comparison: 'eq', timeframe: 'month' }
  },

  // CLÍNICA/EQUIPE
  {
    name: '🎉 Marco de Ouro',
    description: '1000 consultas realizadas',
    category: 'milestone',
    rarity: 'legendary',
    icon: '🎉',
    points: 5000,
    criteria: { type: 'count', target: 1000, metric: 'total_appointments' }
  },
  {
    name: '👥 Equipe Unida',
    description: 'Todos terapeutas com NPS > 8.5',
    category: 'performance',
    rarity: 'epic',
    icon: '👥',
    points: 2000,
    criteria: { type: 'custom', target: 1, metric: 'team_nps_excellence' }
  },
  {
    name: '📈 Crescimento',
    description: '50% mais pacientes que mês anterior',
    category: 'milestone',
    rarity: 'rare',
    icon: '📈',
    points: 400,
    criteria: { type: 'threshold', target: 50, metric: 'patient_growth', comparison: 'gte', timeframe: 'month' }
  }
];

export const RANK_LEVELS = [
  { level: 1, name: 'Bronze', minPoints: 0, color: '#cd7f32', icon: '🥉' },
  { level: 2, name: 'Prata', minPoints: 1000, color: '#c0c0c0', icon: '🥈' },
  { level: 3, name: 'Ouro', minPoints: 3000, color: '#ffd700', icon: '🥇' },
  { level: 4, name: 'Platina', minPoints: 7000, color: '#e5e4e2', icon: '💎' },
  { level: 5, name: 'Diamante', minPoints: 15000, color: '#b9f2ff', icon: '💠' },
  { level: 6, name: 'Mestre', minPoints: 30000, color: '#ff6ec7', icon: '👑' }
];

export function getRankByPoints(points: number): typeof RANK_LEVELS[0] {
  for (let i = RANK_LEVELS.length - 1; i >= 0; i--) {
    if (points >= RANK_LEVELS[i].minPoints) {
      return RANK_LEVELS[i];
    }
  }
  return RANK_LEVELS[0];
}

export function getProgressToNextRank(points: number): {
  current: typeof RANK_LEVELS[0];
  next: typeof RANK_LEVELS[0] | null;
  progress: number; // 0-100
} {
  const current = getRankByPoints(points);
  const currentIndex = RANK_LEVELS.findIndex(r => r.level === current.level);
  const next = currentIndex < RANK_LEVELS.length - 1 ? RANK_LEVELS[currentIndex + 1] : null;

  if (!next) {
    return { current, next: null, progress: 100 };
  }

  const pointsInCurrentRank = points - current.minPoints;
  const pointsNeededForNext = next.minPoints - current.minPoints;
  const progress = Math.min(100, (pointsInCurrentRank / pointsNeededForNext) * 100);

  return { current, next, progress };
}

