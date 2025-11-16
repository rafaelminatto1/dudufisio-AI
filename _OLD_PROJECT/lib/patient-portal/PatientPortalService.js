import { AppointmentType, AppointmentStatus } from '../../types';
// Mock service implementations
class MockAppointmentService {
    async getUpcoming(patientId, days) {
        const appointments = [];
        const now = new Date();
        // Generate mock upcoming appointments
        for (let i = 1; i <= 3; i++) {
            const appointmentDate = new Date(now);
            appointmentDate.setDate(now.getDate() + i * 7); // Weekly appointments
            appointments.push({
                id: `apt-${i}`,
                patientId,
                patientName: 'Patient',
                patientAvatarUrl: '',
                therapistId: 'therapist-1',
                startTime: appointmentDate,
                endTime: new Date(appointmentDate.getTime() + 60 * 60 * 1000),
                scheduledTime: appointmentDate.toISOString(),
                duration: 60,
                title: i === 1 ? 'Avaliação' : 'Sessão',
                type: i === 1 ? AppointmentType.Evaluation : AppointmentType.Session,
                status: AppointmentStatus.Scheduled,
                value: 150,
                paymentStatus: 'pending',
                notes: `Upcoming ${i === 1 ? 'evaluation' : 'therapy'} session`
            });
        }
        return appointments;
    }
    async getHistory(patientId, limit) {
        const appointments = [];
        const now = new Date();
        for (let i = 1; i <= limit; i++) {
            const appointmentDate = new Date(now);
            appointmentDate.setDate(now.getDate() - i * 7);
            appointments.push({
                id: `apt-history-${i}`,
                patientId,
                patientName: 'Patient',
                patientAvatarUrl: '',
                therapistId: 'therapist-1',
                startTime: appointmentDate,
                endTime: new Date(appointmentDate.getTime() + 60 * 60 * 1000),
                scheduledTime: appointmentDate.toISOString(),
                duration: 60,
                title: 'Sessão',
                type: AppointmentType.Session,
                status: AppointmentStatus.Completed,
                value: 150,
                paymentStatus: 'paid',
                notes: `Completed therapy session ${i}`
            });
        }
        return appointments;
    }
}
class MockSessionService {
    async getRecent(patientId, limit) {
        const sessions = [];
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
    async getAll(patientId) {
        return this.getRecent(patientId, 20); // Return more sessions for timeline
    }
}
class MockProgressService {
    async getLatest(patientId) {
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
    async getHistory(patientId) {
        const progress = [];
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
class MockExerciseService {
    async getPrescribed(patientId) {
        return [
            {
                id: 'ex-1',
                name: 'Shoulder Stretch',
                description: 'Gentle shoulder stretching to improve range of motion',
                instructions: ['Hold for 30 seconds, repeat 3 times'],
                sets: 3,
                reps: 10,
                duration: 30,
                difficulty: 1,
                category: 'stretching',
                bodyParts: ['shoulder'],
                equipment: [],
                media: []
            },
            {
                id: 'ex-2',
                name: 'Core Strengthening',
                description: 'Plank exercise for core stability',
                instructions: ['Hold plank position, maintain straight line from head to feet'],
                sets: 3,
                reps: 1,
                difficulty: 3,
                category: 'strengthening',
                bodyParts: ['core'],
                equipment: [],
                media: []
            },
            {
                id: 'ex-3',
                name: 'Balance Training',
                description: 'Single leg stance for balance improvement',
                instructions: ['Stand on one leg, hold for specified duration'],
                sets: 3,
                reps: 1,
                difficulty: 3,
                category: 'balance',
                bodyParts: ['leg'],
                equipment: [],
                media: []
            }
        ];
    }
    async getHistory(patientId) {
        const history = [];
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
                            difficulty: (Math.floor(Math.random() * 5) + 1)
                        }
                    });
                }
            }
        }
        return history;
    }
}
class MockMessageService {
    async getUnread(patientId) {
        return [
            {
                id: 'msg-1',
                from: 'Dr. Silva',
                subject: 'Exercise Progress Review',
                content: {
                    subject: 'Exercise Progress Review',
                    body: 'Great job on your consistency with the exercises. Let\'s increase intensity next week.',
                    variables: {}
                },
                timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
                read: false
            },
            {
                id: 'msg-2',
                from: 'FisioFlow System',
                subject: 'Appointment Reminder',
                content: {
                    subject: 'Appointment Reminder',
                    body: 'You have an appointment scheduled for tomorrow at 2:00 PM.',
                    variables: {}
                },
                timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
                read: false
            }
        ];
    }
    async getAll(patientId) {
        const unread = await this.getUnread(patientId);
        const read = [
            {
                id: 'msg-3',
                from: 'Reception',
                subject: 'Payment Confirmation',
                content: {
                    subject: 'Payment Confirmation',
                    body: 'Your payment for the last session has been processed.',
                    variables: {}
                },
                timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
                read: true
            }
        ];
        return [...unread, ...read];
    }
    async markAsRead(messageId) {
        console.log(`Message ${messageId} marked as read`);
    }
    async sendMessage(patientId, message) {
        console.log(`Message sent from patient ${patientId}: ${message}`);
    }
}
class MockBodyMapService {
    async getHistory(patientId) {
        const entries = [];
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
    async getCurrent(patientId) {
        const history = await this.getHistory(patientId);
        return history[0] || null;
    }
}
export class PatientPortalService {
    constructor() {
        this.appointmentService = new MockAppointmentService();
        this.sessionService = new MockSessionService();
        this.progressService = new MockProgressService();
        this.exerciseService = new MockExerciseService();
        this.messageService = new MockMessageService();
        this.bodyMapService = new MockBodyMapService();
    }
    async getPatientDashboard(patientId) {
        const [upcomingAppointments, recentSessions, treatmentProgress, prescribedExercises, unreadMessages] = await Promise.all([
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
    async getTreatmentTimeline(patientId) {
        const [sessions, bodyMapHistory, exerciseHistory] = await Promise.all([
            this.sessionService.getAll(patientId),
            this.bodyMapService.getHistory(patientId),
            this.exerciseService.getHistory(patientId)
        ]);
        const timeline = {
            sessions: sessions.map(this.mapSessionToTimelineEvent),
            bodyMapEvents: bodyMapHistory.map(this.mapBodyMapToTimelineEvent),
            exerciseEvents: this.mapExerciseHistoryToTimelineEvents(exerciseHistory),
            sortByDate() {
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
    async getExerciseAdherence(patientId, days = 30) {
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
    async getProgressMetrics(patientId) {
        const progressHistory = await this.progressService.getHistory(patientId);
        return {
            painTrend: this.analyzePainTrend(progressHistory),
            mobilityTrend: this.analyzeMobilityTrend(progressHistory),
            functionalTrend: this.analyzeFunctionalTrend(progressHistory),
            overallImprovement: this.calculateOverallImprovement(progressHistory)
        };
    }
    summarizeProgress(progress, sessions) {
        const recentPainLevels = sessions.slice(0, 5).map(s => s.painLevel).filter(p => p !== undefined);
        const avgRecentPain = recentPainLevels.length > 0
            ? recentPainLevels.reduce((a, b) => a + b, 0) / recentPainLevels.length
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
    mapSessionToTimelineEvent(session) {
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
    mapBodyMapToTimelineEvent(bodyMap) {
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
    mapExerciseHistoryToTimelineEvents(history) {
        // Group by date and create daily exercise events
        const groupedByDate = new Map();
        history.forEach(exercise => {
            const dateKey = exercise.completedAt.toDateString();
            if (!groupedByDate.has(dateKey)) {
                groupedByDate.set(dateKey, []);
            }
            groupedByDate.get(dateKey).push(exercise);
        });
        return Array.from(groupedByDate.entries()).map(([dateStr, exercises]) => ({
            id: `exercises-${dateStr}`,
            type: 'exercise',
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
    calculateAdherenceRate(history, prescribed, days) {
        const expectedSessions = prescribed.length * days; // Simplified calculation
        const actualSessions = history.length;
        return Math.min(100, (actualSessions / expectedSessions) * 100);
    }
    calculateCompletionStreak(history) {
        // Calculate consecutive days with completed exercises
        const sortedHistory = history.sort((a, b) => b.completedAt.getTime() - a.completedAt.getTime());
        const today = new Date();
        let streak = 0;
        for (let i = 0; i < 30; i++) {
            const checkDate = new Date(today);
            checkDate.setDate(today.getDate() - i);
            const hasExerciseOnDate = sortedHistory.some(h => h.completedAt.toDateString() === checkDate.toDateString());
            if (hasExerciseOnDate) {
                streak++;
            }
            else {
                break;
            }
        }
        return streak;
    }
    calculateAveragePerformance(history) {
        if (history.length === 0)
            return 0;
        const avgDifficulty = history.reduce((sum, ex) => sum + ex.performance.difficulty, 0) / history.length;
        return (avgDifficulty / 5) * 100; // Convert to percentage
    }
    getWeeklyBreakdown(history, days) {
        const weeks = [];
        const weeksCount = Math.ceil(days / 7);
        for (let week = 0; week < weeksCount; week++) {
            const weekStart = new Date();
            weekStart.setDate(weekStart.getDate() - (week + 1) * 7);
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekStart.getDate() + 7);
            const weekExercises = history.filter(h => h.completedAt >= weekStart && h.completedAt < weekEnd);
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
    analyzePainTrend(history) {
        const painLevels = history.map(p => p.painLevel).reverse();
        return this.calculateTrend(painLevels, 'lower_is_better');
    }
    analyzeMobilityTrend(history) {
        const mobilityScores = history.map(p => p.mobilityScore).reverse();
        return this.calculateTrend(mobilityScores, 'higher_is_better');
    }
    analyzeFunctionalTrend(history) {
        const functionalScores = history.map(p => p.functionalScore).reverse();
        return this.calculateTrend(functionalScores, 'higher_is_better');
    }
    calculateTrend(values, direction) {
        if (values.length < 2) {
            return { direction: 'stable', percentage: 0, isImproving: true };
        }
        const firstValue = values[0];
        const lastValue = values[values.length - 1];
        const change = lastValue - firstValue;
        const percentage = Math.abs(change / firstValue) * 100;
        let trendDirection;
        let isImproving;
        if (Math.abs(change) < 1) {
            trendDirection = 'stable';
            isImproving = true;
        }
        else if (change > 0) {
            trendDirection = 'improving';
            isImproving = direction === 'higher_is_better';
        }
        else {
            trendDirection = 'declining';
            isImproving = direction === 'lower_is_better';
        }
        return {
            direction: trendDirection,
            percentage: Math.round(percentage),
            isImproving
        };
    }
    calculateOverallImprovement(history) {
        if (history.length === 0)
            return 0;
        const latest = history[0];
        const oldest = history[history.length - 1];
        // Weighted improvement calculation
        const painImprovement = ((oldest.painLevel - latest.painLevel) / oldest.painLevel) * 40;
        const mobilityImprovement = ((latest.mobilityScore - oldest.mobilityScore) / oldest.mobilityScore) * 30;
        const functionalImprovement = ((latest.functionalScore - oldest.functionalScore) / oldest.functionalScore) * 30;
        return Math.max(0, Math.min(100, painImprovement + mobilityImprovement + functionalImprovement));
    }
}
