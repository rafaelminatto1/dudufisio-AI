import {
  PatientId,
  PatientDashboard,
  TreatmentTimeline,
  TimelineEvent,
  TreatmentSession,
  TreatmentProgress,
  PatientPortalSession
} from '../../types/checkin';
import { Appointment, Exercise, Message } from '../../types';

interface AppointmentService {
  getUpcoming(patientId: PatientId, days: number): Promise<Appointment[]>;
  getHistory(patientId: PatientId, limit: number): Promise<Appointment[]>;
}

interface SessionService {
  getRecent(patientId: PatientId, limit: number): Promise<TreatmentSession[]>;
  getAll(patientId: PatientId): Promise<TreatmentSession[]>;
}

interface ProgressService {
  getLatest(patientId: PatientId): Promise<TreatmentProgress>;
  getHistory(patientId: PatientId): Promise<TreatmentProgress[]>;
}

interface ExerciseService {
  getPrescribed(patientId: PatientId): Promise<Exercise[]>;
  getHistory(patientId: PatientId): Promise<ExerciseHistory[]>;
}

interface MessageService {
  getUnread(patientId: PatientId): Promise<Message[]>;
  getAll(patientId: PatientId): Promise<Message[]>;
  markAsRead(messageId: string): Promise<void>;
  sendMessage(patientId: PatientId, message: string): Promise<void>;
}

interface BodyMapService {
  getHistory(patientId: PatientId): Promise<BodyMapEntry[]>;
  getCurrent(patientId: PatientId): Promise<BodyMapEntry | null>;
}

interface ExerciseHistory {
  exerciseId: string;
  completedAt: Date;
  performance: {
    sets: number;
    reps: number;
    duration: number;
    difficulty: number;
  };
}

interface BodyMapEntry {
  id: string;
  patientId: PatientId;
  date: Date;
  painPoints: PainPoint[];
  notes: string;
}

interface PainPoint {
  x: number;
  y: number;
  intensity: number;
  type: string;
  description: string;
}

interface ProgressSummary {
  overallImprovement: number;
  painReduction: number;
  mobilityIncrease: number;
  completedExercises: number;
  adherenceRate: number;
  nextGoals: string[];
}

// Mock service implementations
class MockAppointmentService implements AppointmentService {
  async getUpcoming(patientId: PatientId, days: number): Promise<Appointment[]> {
    const appointments: Appointment[] = [];
    const now = new Date();

    // Generate mock upcoming appointments
    for (let i = 1; i <= 3; i++) {
      const appointmentDate = new Date(now);
      appointmentDate.setDate(now.getDate() + i * 7); // Weekly appointments

      appointments.push({
        id: `apt-${i}`,
        patientId,
        therapistId: 'therapist-1',
        scheduledTime: appointmentDate,
        duration: 60,
        type: i === 1 ? 'initial_evaluation' : 'therapy_session',
        status: 'scheduled',
        notes: `Upcoming ${i === 1 ? 'evaluation' : 'therapy'} session`
      });
    }

    return appointments;
  }

  async getHistory(patientId: PatientId, limit: number): Promise<Appointment[]> {
    const appointments: Appointment[] = [];
    const now = new Date();

    for (let i = 1; i <= limit; i++) {
      const appointmentDate = new Date(now);
      appointmentDate.setDate(now.getDate() - i * 7);

      appointments.push({
        id: `apt-history-${i}`,
        patientId,
        therapistId: 'therapist-1',
        scheduledTime: appointmentDate,
        duration: 60,
        type: 'therapy_session',
        status: 'completed',
        notes: `Completed therapy session ${i}`
      });
    }

    return appointments;
  }
}

class MockSessionService implements SessionService {
  async getRecent(patientId: PatientId, limit: number): Promise<TreatmentSession[]> {
    const sessions: TreatmentSession[] = [];
    const now = new Date();

    for (let i = 1; i <= limit; i++) {
      const sessionDate = new Date(now);
      sessionDate.setDate(now.getDate() - i * 7);

      sessions.push({
        id: `session-${i}`,
        patientId,
        appointmentId: `apt-history-${i}`,
        date: sessionDate,
        duration: 60,
        therapistNotes: `Session ${i} focused on mobility improvement and pain reduction`,
        exercises: [`exercise-${i * 2}`, `exercise-${i * 2 + 1}`],
        painLevel: Math.max(1, 8 - i), // Decreasing pain over time
        progressNotes: `Good progress in session ${i}`
      });
    }

    return sessions;
  }

  async getAll(patientId: PatientId): Promise<TreatmentSession[]> {
    return this.getRecent(patientId, 20); // Return more sessions for timeline
  }
}

class MockProgressService implements ProgressService {
  async getLatest(patientId: PatientId): Promise<TreatmentProgress> {
    return {
      patientId,
      date: new Date(),
      painLevel: 3,
      mobilityScore: 75,
      functionalScore: 80,
      goals: [
        { description: 'Reduce morning stiffness', achieved: true },
        { description: 'Walk 30 minutes without pain', achieved: false },
        { description: 'Return to sports activities', achieved: false }
      ],
      notes: 'Significant improvement in pain management and mobility'
    };
  }

  async getHistory(patientId: PatientId): Promise<TreatmentProgress[]> {
    const progress: TreatmentProgress[] = [];
    const now = new Date();

    for (let i = 0; i < 10; i++) {
      const date = new Date(now);
      date.setDate(now.getDate() - i * 14); // Bi-weekly progress

      progress.push({
        patientId,
        date,
        painLevel: Math.max(1, 8 - Math.floor(i / 2)),
        mobilityScore: Math.min(100, 40 + i * 7),
        functionalScore: Math.min(100, 35 + i * 8),
        goals: [],
        notes: `Progress update ${i + 1}`
      });
    }

    return progress;
  }
}

class MockExerciseService implements ExerciseService {
  async getPrescribed(patientId: PatientId): Promise<Exercise[]> {
    return [
      {
        id: 'ex-1',
        name: 'Shoulder Stretch',
        description: 'Gentle shoulder stretching to improve range of motion',
        instructions: 'Hold for 30 seconds, repeat 3 times',
        frequency: 'daily',
        sets: 3,
        reps: 10,
        duration: 30,
        difficulty: 'easy'
      },
      {
        id: 'ex-2',
        name: 'Core Strengthening',
        description: 'Plank exercise for core stability',
        instructions: 'Hold plank position, maintain straight line from head to feet',
        frequency: 'daily',
        sets: 3,
        reps: 1,
        duration: 45,
        difficulty: 'medium'
      },
      {
        id: 'ex-3',
        name: 'Balance Training',
        description: 'Single leg stance for balance improvement',
        instructions: 'Stand on one leg, hold for specified duration',
        frequency: '3x per week',
        sets: 3,
        reps: 1,
        duration: 60,
        difficulty: 'medium'
      }
    ];
  }

  async getHistory(patientId: PatientId): Promise<ExerciseHistory[]> {
    const history: ExerciseHistory[] = [];
    const exercises = ['ex-1', 'ex-2', 'ex-3'];
    const now = new Date();

    for (let day = 1; day <= 14; day++) {
      for (const exerciseId of exercises) {
        if (Math.random() > 0.3) { // 70% completion rate
          const date = new Date(now);
          date.setDate(now.getDate() - day);

          history.push({
            exerciseId,
            completedAt: date,
            performance: {
              sets: 3,
              reps: 10,
              duration: 30 + Math.random() * 30,
              difficulty: Math.floor(Math.random() * 5) + 1
            }
          });
        }
      }
    }

    return history;
  }
}

class MockMessageService implements MessageService {
  async getUnread(patientId: PatientId): Promise<Message[]> {
    return [
      {
        id: 'msg-1',
        from: 'Dr. Silva',
        subject: 'Exercise Progress Review',
        content: 'Great job on your consistency with the exercises. Let\'s increase intensity next week.',
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        read: false,
        type: 'therapist_message'
      },
      {
        id: 'msg-2',
        from: 'FisioFlow System',
        subject: 'Appointment Reminder',
        content: 'You have an appointment scheduled for tomorrow at 2:00 PM.',
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        read: false,
        type: 'system_reminder'
      }
    ];
  }

  async getAll(patientId: PatientId): Promise<Message[]> {
    const unread = await this.getUnread(patientId);
    const read: Message[] = [
      {
        id: 'msg-3',
        from: 'Reception',
        subject: 'Payment Confirmation',
        content: 'Your payment for the last session has been processed.',
        timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        read: true,
        type: 'administrative'
      }
    ];

    return [...unread, ...read];
  }

  async markAsRead(messageId: string): Promise<void> {
    console.log(`Message ${messageId} marked as read`);
  }

  async sendMessage(patientId: PatientId, message: string): Promise<void> {
    console.log(`Message sent from patient ${patientId}: ${message}`);
  }
}

class MockBodyMapService implements BodyMapService {
  async getHistory(patientId: PatientId): Promise<BodyMapEntry[]> {
    const entries: BodyMapEntry[] = [];
    const now = new Date();

    for (let i = 0; i < 5; i++) {
      const date = new Date(now);
      date.setDate(now.getDate() - i * 14);

      entries.push({
        id: `bodymap-${i}`,
        patientId,
        date,
        painPoints: [
          { x: 150, y: 200, intensity: Math.max(1, 8 - i), type: 'sharp', description: 'Lower back pain' },
          { x: 200, y: 150, intensity: Math.max(1, 6 - i), type: 'dull', description: 'Shoulder tension' }
        ],
        notes: `Body map assessment ${i + 1}`
      });
    }

    return entries;
  }

  async getCurrent(patientId: PatientId): Promise<BodyMapEntry | null> {
    const history = await this.getHistory(patientId);
    return history[0] || null;
  }
}

export class PatientPortalService {
  private appointmentService = new MockAppointmentService();
  private sessionService = new MockSessionService();
  private progressService = new MockProgressService();
  private exerciseService = new MockExerciseService();
  private messageService = new MockMessageService();
  private bodyMapService = new MockBodyMapService();

  async getPatientDashboard(patientId: PatientId): Promise<PatientDashboard> {
    const [
      upcomingAppointments,
      recentSessions,
      treatmentProgress,
      prescribedExercises,
      unreadMessages
    ] = await Promise.all([
      this.appointmentService.getUpcoming(patientId, 30),
      this.sessionService.getRecent(patientId, 10),
      this.progressService.getLatest(patientId),
      this.exerciseService.getPrescribed(patientId),
      this.messageService.getUnread(patientId)
    ]);

    return {
      upcomingAppointments,
      recentSessions,
      treatmentProgress,
      prescribedExercises,
      unreadMessages,
      nextAppointment: upcomingAppointments[0],
      progressSummary: this.summarizeProgress(treatmentProgress, recentSessions)
    };
  }

  async getTreatmentTimeline(patientId: PatientId): Promise<TreatmentTimeline> {
    const [
      sessions,
      bodyMapHistory,
      exerciseHistory
    ] = await Promise.all([
      this.sessionService.getAll(patientId),
      this.bodyMapService.getHistory(patientId),
      this.exerciseService.getHistory(patientId)
    ]);

    const timeline: TreatmentTimeline = {
      sessions: sessions.map(this.mapSessionToTimelineEvent),
      bodyMapEvents: bodyMapHistory.map(this.mapBodyMapToTimelineEvent),
      exerciseEvents: this.mapExerciseHistoryToTimelineEvents(exerciseHistory),

      sortByDate(): TreatmentTimeline {
        const allEvents = [
          ...this.sessions,
          ...this.bodyMapEvents,
          ...this.exerciseEvents
        ].sort((a, b) => b.date.getTime() - a.date.getTime());

        return {
          sessions: allEvents.filter(e => e.type === 'session'),
          bodyMapEvents: allEvents.filter(e => e.type === 'body_map'),
          exerciseEvents: allEvents.filter(e => e.type === 'exercise'),
          sortByDate: this.sortByDate
        };
      }
    };

    return timeline.sortByDate();
  }

  async getExerciseAdherence(patientId: PatientId, days: number = 30): Promise<ExerciseAdherence> {
    const exerciseHistory = await this.exerciseService.getHistory(patientId);
    const prescribedExercises = await this.exerciseService.getPrescribed(patientId);

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const recentHistory = exerciseHistory.filter(h => h.completedAt >= cutoffDate);

    const adherenceRate = this.calculateAdherenceRate(recentHistory, prescribedExercises, days);
    const completionStreak = this.calculateCompletionStreak(recentHistory);

    return {
      adherenceRate,
      completionStreak,
      totalSessions: recentHistory.length,
      averagePerformance: this.calculateAveragePerformance(recentHistory),
      weeklyBreakdown: this.getWeeklyBreakdown(recentHistory, days)
    };
  }

  async getProgressMetrics(patientId: PatientId): Promise<ProgressMetrics> {
    const progressHistory = await this.progressService.getHistory(patientId);

    return {
      painTrend: this.analyzePainTrend(progressHistory),
      mobilityTrend: this.analyzeMobilityTrend(progressHistory),
      functionalTrend: this.analyzeFunctionalTrend(progressHistory),
      overallImprovement: this.calculateOverallImprovement(progressHistory)
    };
  }

  private summarizeProgress(progress: TreatmentProgress, sessions: TreatmentSession[]): ProgressSummary {
    const recentPainLevels = sessions.slice(0, 5).map(s => s.painLevel).filter(p => p !== undefined);
    const avgRecentPain = recentPainLevels.length > 0
      ? recentPainLevels.reduce((a, b) => a + b!, 0) / recentPainLevels.length
      : 5;

    return {
      overallImprovement: Math.min(100, (10 - progress.painLevel) * 10),
      painReduction: Math.max(0, (8 - avgRecentPain) / 8 * 100),
      mobilityIncrease: progress.mobilityScore,
      completedExercises: sessions.length,
      adherenceRate: 85, // Mock adherence rate
      nextGoals: progress.goals.filter(g => !g.achieved).map(g => g.description).slice(0, 3)
    };
  }

  private mapSessionToTimelineEvent(session: TreatmentSession): TimelineEvent {
    return {
      id: session.id,
      type: 'session',
      date: session.date,
      title: 'Therapy Session',
      description: session.therapistNotes || 'Therapy session completed',
      metadata: {
        duration: session.duration,
        painLevel: session.painLevel,
        exercises: session.exercises
      }
    };
  }

  private mapBodyMapToTimelineEvent(bodyMap: BodyMapEntry): TimelineEvent {
    return {
      id: bodyMap.id,
      type: 'body_map',
      date: bodyMap.date,
      title: 'Body Map Assessment',
      description: bodyMap.notes || 'Pain assessment completed',
      metadata: {
        painPoints: bodyMap.painPoints.length,
        maxIntensity: Math.max(...bodyMap.painPoints.map(p => p.intensity))
      }
    };
  }

  private mapExerciseHistoryToTimelineEvents(history: ExerciseHistory[]): TimelineEvent[] {
    // Group by date and create daily exercise events
    const groupedByDate = new Map<string, ExerciseHistory[]>();

    history.forEach(exercise => {
      const dateKey = exercise.completedAt.toDateString();
      if (!groupedByDate.has(dateKey)) {
        groupedByDate.set(dateKey, []);
      }
      groupedByDate.get(dateKey)!.push(exercise);
    });

    return Array.from(groupedByDate.entries()).map(([dateStr, exercises]) => ({
      id: `exercises-${dateStr}`,
      type: 'exercise' as const,
      date: new Date(dateStr),
      title: 'Exercise Session',
      description: `Completed ${exercises.length} exercises`,
      metadata: {
        exerciseCount: exercises.length,
        totalDuration: exercises.reduce((sum, ex) => sum + ex.performance.duration, 0),
        averageDifficulty: exercises.reduce((sum, ex) => sum + ex.performance.difficulty, 0) / exercises.length
      }
    }));
  }

  private calculateAdherenceRate(history: ExerciseHistory[], prescribed: Exercise[], days: number): number {
    const expectedSessions = prescribed.length * days; // Simplified calculation
    const actualSessions = history.length;
    return Math.min(100, (actualSessions / expectedSessions) * 100);
  }

  private calculateCompletionStreak(history: ExerciseHistory[]): number {
    // Calculate consecutive days with completed exercises
    const sortedHistory = history.sort((a, b) => b.completedAt.getTime() - a.completedAt.getTime());
    const today = new Date();
    let streak = 0;

    for (let i = 0; i < 30; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);

      const hasExerciseOnDate = sortedHistory.some(h =>
        h.completedAt.toDateString() === checkDate.toDateString()
      );

      if (hasExerciseOnDate) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  }

  private calculateAveragePerformance(history: ExerciseHistory[]): number {
    if (history.length === 0) return 0;

    const avgDifficulty = history.reduce((sum, ex) => sum + ex.performance.difficulty, 0) / history.length;
    return (avgDifficulty / 5) * 100; // Convert to percentage
  }

  private getWeeklyBreakdown(history: ExerciseHistory[], days: number): WeeklyExerciseData[] {
    const weeks: WeeklyExerciseData[] = [];
    const weeksCount = Math.ceil(days / 7);

    for (let week = 0; week < weeksCount; week++) {
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - (week + 1) * 7);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 7);

      const weekExercises = history.filter(h =>
        h.completedAt >= weekStart && h.completedAt < weekEnd
      );

      weeks.push({
        weekNumber: weeksCount - week,
        startDate: weekStart,
        endDate: weekEnd,
        sessionsCompleted: weekExercises.length,
        totalDuration: weekExercises.reduce((sum, ex) => sum + ex.performance.duration, 0),
        adherenceRate: Math.min(100, (weekExercises.length / 21) * 100) // Assuming 3 exercises daily
      });
    }

    return weeks;
  }

  private analyzePainTrend(history: TreatmentProgress[]): TrendAnalysis {
    const painLevels = history.map(p => p.painLevel).reverse();
    return this.calculateTrend(painLevels, 'lower_is_better');
  }

  private analyzeMobilityTrend(history: TreatmentProgress[]): TrendAnalysis {
    const mobilityScores = history.map(p => p.mobilityScore).reverse();
    return this.calculateTrend(mobilityScores, 'higher_is_better');
  }

  private analyzeFunctionalTrend(history: TreatmentProgress[]): TrendAnalysis {
    const functionalScores = history.map(p => p.functionalScore).reverse();
    return this.calculateTrend(functionalScores, 'higher_is_better');
  }

  private calculateTrend(values: number[], direction: 'higher_is_better' | 'lower_is_better'): TrendAnalysis {
    if (values.length < 2) {
      return { direction: 'stable', percentage: 0, isImproving: true };
    }

    const firstValue = values[0];
    const lastValue = values[values.length - 1];
    const change = lastValue - firstValue;
    const percentage = Math.abs(change / firstValue) * 100;

    let trendDirection: 'improving' | 'declining' | 'stable';
    let isImproving: boolean;

    if (Math.abs(change) < 1) {
      trendDirection = 'stable';
      isImproving = true;
    } else if (change > 0) {
      trendDirection = 'improving';
      isImproving = direction === 'higher_is_better';
    } else {
      trendDirection = 'declining';
      isImproving = direction === 'lower_is_better';
    }

    return {
      direction: trendDirection,
      percentage: Math.round(percentage),
      isImproving
    };
  }

  private calculateOverallImprovement(history: TreatmentProgress[]): number {
    if (history.length === 0) return 0;

    const latest = history[0];
    const oldest = history[history.length - 1];

    // Weighted improvement calculation
    const painImprovement = ((oldest.painLevel - latest.painLevel) / oldest.painLevel) * 40;
    const mobilityImprovement = ((latest.mobilityScore - oldest.mobilityScore) / oldest.mobilityScore) * 30;
    const functionalImprovement = ((latest.functionalScore - oldest.functionalScore) / oldest.functionalScore) * 30;

    return Math.max(0, Math.min(100, painImprovement + mobilityImprovement + functionalImprovement));
  }
}

// Additional interfaces for the service
interface ExerciseAdherence {
  adherenceRate: number;
  completionStreak: number;
  totalSessions: number;
  averagePerformance: number;
  weeklyBreakdown: WeeklyExerciseData[];
}

interface WeeklyExerciseData {
  weekNumber: number;
  startDate: Date;
  endDate: Date;
  sessionsCompleted: number;
  totalDuration: number;
  adherenceRate: number;
}

interface ProgressMetrics {
  painTrend: TrendAnalysis;
  mobilityTrend: TrendAnalysis;
  functionalTrend: TrendAnalysis;
  overallImprovement: number;
}

interface TrendAnalysis {
  direction: 'improving' | 'declining' | 'stable';
  percentage: number;
  isImproving: boolean;
}