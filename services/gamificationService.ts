// services/gamificationService.ts
import {
  Achievement,
  GamificationChallenge,
  GamificationProgress,
  GamificationReward,
  GamificationLeaderboardEntry,
  GamificationPointsBreakdown,
  GamificationMilestone,
  AppointmentStatus,
} from '../types';
import {
  mockAchievements,
  mockGamificationOverview,
} from '../data/mockData';
import * as appointmentService from './appointmentService';
import * as patientService from './patientService';

const POINTS_CONFIG = {
  SESSION_COMPLETED: 50,
  PAIN_LOG_ENTRY: 10,
};

const clone = <T>(value: T): T => structuredClone(value);

const calculateLevel = (points: number) => {
  let level = 1;
  let xpThreshold = 100;
  let pointsTowardsLevel = points;

  while (pointsTowardsLevel >= xpThreshold) {
    pointsTowardsLevel -= xpThreshold;
    level += 1;
    xpThreshold = Math.floor(xpThreshold * 1.35);
  }

  return {
    level,
    xpForNextLevel: xpThreshold,
    pointsTowardsLevel,
  };
};

const calculateStreak = (dates: Date[]): number => {
  if (!dates.length) return 0;

  const normalized = [...new Set(dates.map((d) => new Date(d.toDateString()).getTime()))]
    .map((timestamp) => new Date(timestamp))
    .sort((a, b) => b.getTime() - a.getTime());

  const today = new Date(new Date().toDateString());
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  const first = normalized[0];
  if (!first || (first.getTime() !== today.getTime() && first.getTime() !== yesterday.getTime())) {
    return 0;
  }

  let streak = 1;
  let last = first;

  for (let i = 1; i < normalized.length; i++) {
    const expectedPrevious = new Date(last);
    expectedPrevious.setDate(last.getDate() - 1);

    if (normalized[i].getTime() === expectedPrevious.getTime()) {
      streak += 1;
      last = normalized[i];
    } else {
      break;
    }
  }

  return streak;
};

const evaluateAchievement = (
  achievement: Achievement,
  data: {
    streak: number;
    completedSessions: number;
    level: number;
    painLogs: number;
  }
): Achievement => {
  const result = { ...achievement };

  switch (achievement.id) {
    case 'streak_7':
      result.unlocked = data.streak >= 7;
      result.progress = Math.min(1, data.streak / 7);
      break;
    case 'sessions_10':
      result.unlocked = data.completedSessions >= 10;
      result.progress = Math.min(1, data.completedSessions / 10);
      break;
    case 'pain_log_1':
      result.unlocked = data.painLogs > 0;
      result.progress = result.unlocked ? 1 : 0;
      break;
    case 'first_week':
      result.unlocked = data.completedSessions >= 5;
      result.progress = Math.min(1, data.completedSessions / 5);
      break;
    case 'level_5':
      result.unlocked = data.level >= 5;
      result.progress = Math.min(1, data.level / 5);
      break;
    case 'perfect_month':
      result.unlocked = data.streak >= 30;
      result.progress = Math.min(1, data.streak / 30);
      break;
    default:
      break;
  }

  return result;
};

const updateChallenges = (
  challenges: GamificationChallenge[],
  stats: { streak: number; painLogs: number }
): GamificationChallenge[] =>
  challenges.map((challenge) => {
    if (challenge.metric === 'streak') {
      const progress = Math.min(1, stats.streak / challenge.targetValue);
      return {
        ...challenge,
        currentValue: stats.streak,
        progressPercentage: Math.round(progress * 100),
        status: progress >= 1 ? 'completed' : challenge.status,
      };
    }

    if (challenge.metric === 'pain_logs') {
      const progress = Math.min(1, stats.painLogs / challenge.targetValue);
      return {
        ...challenge,
        currentValue: stats.painLogs,
        progressPercentage: Math.round(progress * 100),
        status: progress >= 1 ? 'completed' : challenge.status,
      };
    }

    return challenge;
  });

const refreshRewards = (
  rewards: GamificationReward[],
  totalPoints: number
): GamificationReward[] =>
  rewards.map((reward) => ({
    ...reward,
    unlocked: reward.unlocked || totalPoints >= reward.pointsRequired,
  }));

const updateLeaderboard = (
  leaderboard: GamificationLeaderboardEntry[],
  patientId: string,
  totalPoints: number,
  level: number,
  streak: number,
): GamificationLeaderboardEntry[] => {
  const updated = leaderboard.map((entry) =>
    entry.patientId === patientId
      ? { ...entry, points: totalPoints, level, streak }
      : entry
  );

  return updated
    .sort((a, b) => b.points - a.points)
    .map((entry, index) => ({ ...entry, position: index + 1 }));
};

export const getGamificationProgress = async (patientId: string): Promise<GamificationProgress> => {
  const [appointments, patient] = await Promise.all([
    appointmentService.getAppointmentsByPatientId(patientId),
    patientService.getPatientById(patientId),
  ]);

  const base = clone(mockGamificationOverview);

  const painPoints = patient?.painPoints ?? [];
  const completedSessions = appointments.filter((a) => a.status === AppointmentStatus.Completed);

  const sessionPoints = completedSessions.length * POINTS_CONFIG.SESSION_COMPLETED;
  const painLogPoints = painPoints.length * POINTS_CONFIG.PAIN_LOG_ENTRY;
  const exercisesPoints = base.pointsBreakdown.find((b) => b.id === 'exercises')?.points ?? 0;
  const challengeBonus = base.pointsBreakdown.find((b) => b.id === 'challenges')?.points ?? 0;

  const pointsBreakdown: GamificationPointsBreakdown[] = [
    { id: 'sessions', label: 'Sessões concluídas', points: sessionPoints },
    { id: 'pain_logs', label: 'Registros de dor', points: painLogPoints },
    { id: 'exercises', label: 'Exercícios completos', points: exercisesPoints },
    { id: 'challenges', label: 'Bônus de desafios', points: challengeBonus },
  ];

  const totalPoints = pointsBreakdown.reduce((sum, item) => sum + item.points, 0);
  const { level, xpForNextLevel, pointsTowardsLevel } = calculateLevel(totalPoints);

  const streak = calculateStreak([
    ...painPoints.map((log) => new Date(log.date)),
    ...completedSessions.map((appt) => new Date(appt.startTime)),
  ]);

  const achievements: Achievement[] = mockAchievements.map((achievement) =>
    evaluateAchievement(achievement, {
      streak,
      completedSessions: completedSessions.length,
      level,
      painLogs: painPoints.length,
    })
  );

  const activeChallenges = updateChallenges(base.activeChallenges, {
    streak,
    painLogs: painPoints.length,
  });

  const availableRewards = refreshRewards(base.availableRewards, totalPoints);
  const unlockedRewards = refreshRewards(base.unlockedRewards, totalPoints);

  const leaderboard = updateLeaderboard(
    base.leaderboard,
    patientId,
    totalPoints,
    level,
    streak
  );

  const nextMilestone: GamificationMilestone = {
    ...base.nextMilestone,
    pointsRemaining: Math.max(0, base.nextMilestone.targetPoints - totalPoints),
  };

  const recentActivities = [
    ...completedSessions.slice(0, 2).map((appt) => ({
      label: 'Sessão concluída',
      timestamp: new Date(appt.startTime),
      points: POINTS_CONFIG.SESSION_COMPLETED,
    })),
    ...painPoints.slice(0, 3).map((log) => ({
      label: 'Registro de dor adicionado',
      timestamp: new Date(log.date),
      points: POINTS_CONFIG.PAIN_LOG_ENTRY,
    })),
    ...base.recentActivities,
  ]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 5);

  return {
    points: totalPoints,
    level,
    xpForNextLevel,
    pointsTowardsLevel,
    streak,
    achievements,
    pointsBreakdown,
    activeChallenges,
    completedChallenges: base.completedChallenges,
    availableRewards,
    unlockedRewards,
    leaderboard,
    nextMilestone,
    recentActivities,
  };
};
