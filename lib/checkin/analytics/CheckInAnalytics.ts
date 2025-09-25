import {
  CheckInMetrics,
  DailyMetrics,
  DateRange,
  PatientId,
  DeviceId
} from '../../../types/checkin';

interface AnalyticsEvent {
  id: string;
  eventType: string;
  eventCategory: 'checkin' | 'portal' | 'notification' | 'exercise' | 'error';
  patientId?: PatientId;
  sessionId?: string;
  deviceId?: DeviceId;
  eventData: Record<string, any>;
  userAgent?: string;
  ipAddress?: string;
  durationMs?: number;
  success: boolean;
  errorCode?: string;
  errorMessage?: string;
  createdAt: Date;
}

interface PerformanceMetrics {
  averageCheckInTime: number;
  faceRecognitionAccuracy: number;
  healthScreeningPassRate: number;
  queueEfficiency: number;
  deviceReliability: number;
}

interface UsagePatterns {
  peakHours: { hour: number; count: number }[];
  busyDays: { dayOfWeek: number; count: number }[];
  devicePreferences: { deviceType: string; count: number }[];
  methodPreferences: { method: string; count: number }[];
}

interface ErrorAnalysis {
  totalErrors: number;
  errorsByType: { errorType: string; count: number; percentage: number }[];
  errorTrends: { date: Date; errorCount: number; totalEvents: number }[];
  criticalErrors: AnalyticsEvent[];
}

interface PatientBehaviorInsights {
  averageSessionDuration: number;
  preferredCheckInMethods: string[];
  exerciseCompletionPatterns: {
    timeOfDay: { hour: number; completionRate: number }[];
    dayOfWeek: { day: number; completionRate: number }[];
  };
  portalUsagePatterns: {
    mostViewedSections: { section: string; views: number }[];
    averageSessionLength: number;
    returnUserRate: number;
  };
}

export class CheckInAnalytics {
  private events: AnalyticsEvent[] = [];
  private eventBuffer: AnalyticsEvent[] = [];
  private batchSize = 100;
  private flushInterval = 30000; // 30 seconds

  constructor() {
    this.startBatchProcessor();
  }

  // Public method to track custom events
  async trackEvent(eventData: Partial<AnalyticsEvent>): Promise<void> {
    await this.trackEventInternal(eventData);
  }

  // Event tracking methods
  async trackCheckInStarted(
    sessionId: string,
    deviceId: DeviceId,
    patientId?: PatientId,
    metadata?: Record<string, any>
  ): Promise<void> {
    await this.trackEventInternal({
      eventType: 'checkin_started',
      eventCategory: 'checkin',
      sessionId,
      deviceId,
      patientId,
      eventData: {
        timestamp: new Date().toISOString(),
        ...metadata
      },
      success: true
    });
  }

  async trackFaceRecognitionAttempt(
    sessionId: string,
    success: boolean,
    confidence?: number,
    processingTime?: number,
    errorDetails?: string
  ): Promise<void> {
    await this.trackEventInternal({
      eventType: 'face_recognition_attempt',
      eventCategory: 'checkin',
      sessionId,
      eventData: {
        confidence,
        processingTime,
        errorDetails
      },
      durationMs: processingTime,
      success,
      errorMessage: errorDetails
    });
  }

  async trackHealthScreening(
    sessionId: string,
    patientId: PatientId,
    passed: boolean,
    riskFactors: string[],
    processingTime: number
  ): Promise<void> {
    await this.trackEventInternal({
      eventType: 'health_screening',
      eventCategory: 'checkin',
      sessionId,
      patientId,
      eventData: {
        passed,
        riskFactorCount: riskFactors.length,
        riskFactors,
        screeningDuration: processingTime
      },
      durationMs: processingTime,
      success: passed
    });
  }

  async trackQueueEntry(
    sessionId: string,
    patientId: PatientId,
    queuePosition: number,
    estimatedWaitTime: number
  ): Promise<void> {
    await this.trackEventInternal({
      eventType: 'queue_entry',
      eventCategory: 'checkin',
      sessionId,
      patientId,
      eventData: {
        queuePosition,
        estimatedWaitTime,
        queueSize: queuePosition
      },
      success: true
    });
  }

  async trackCheckInCompleted(
    sessionId: string,
    patientId: PatientId,
    totalDuration: number,
    method: string,
    success: boolean
  ): Promise<void> {
    await this.trackEventInternal({
      eventType: 'checkin_completed',
      eventCategory: 'checkin',
      sessionId,
      patientId,
      eventData: {
        method,
        totalDuration,
        steps: ['welcome', 'identification', 'health_screening', 'confirmation']
      },
      durationMs: totalDuration,
      success
    });
  }

  async trackPortalAccess(
    patientId: PatientId,
    sessionId: string,
    loginMethod: string,
    deviceInfo: Record<string, any>
  ): Promise<void> {
    await this.trackEventInternal({
      eventType: 'portal_access',
      eventCategory: 'portal',
      patientId,
      sessionId,
      eventData: {
        loginMethod,
        deviceInfo,
        userAgent: deviceInfo.userAgent,
        platform: deviceInfo.platform
      },
      success: true
    });
  }

  async trackPortalPageView(
    patientId: PatientId,
    sessionId: string,
    pageName: string,
    timeSpent: number
  ): Promise<void> {
    await this.trackEventInternal({
      eventType: 'portal_page_view',
      eventCategory: 'portal',
      patientId,
      sessionId,
      eventData: {
        pageName,
        timeSpent
      },
      durationMs: timeSpent,
      success: true
    });
  }

  async trackExerciseCompletion(
    patientId: PatientId,
    exerciseId: string,
    completionData: {
      duration: number;
      difficulty: number;
      performance: number;
      device: string;
    }
  ): Promise<void> {
    await this.trackEventInternal({
      eventType: 'exercise_completed',
      eventCategory: 'exercise',
      patientId,
      eventData: {
        exerciseId,
        ...completionData
      },
      durationMs: completionData.duration * 1000, // Convert to ms
      success: true
    });
  }

  async trackNotificationSent(
    patientId: PatientId,
    notificationType: string,
    deviceTokens: string[],
    success: boolean,
    deliveryTime?: number
  ): Promise<void> {
    await this.trackEventInternal({
      eventType: 'notification_sent',
      eventCategory: 'notification',
      patientId,
      eventData: {
        notificationType,
        deviceCount: deviceTokens.length,
        deliveryTime
      },
      durationMs: deliveryTime,
      success
    });
  }

  async trackError(
    eventType: string,
    errorCode: string,
    errorMessage: string,
    context: Record<string, any>
  ): Promise<void> {
    await this.trackEventInternal({
      eventType: `error_${eventType}`,
      eventCategory: 'error',
      eventData: {
        context,
        severity: this.classifyErrorSeverity(errorCode),
        stackTrace: context.stackTrace
      },
      success: false,
      errorCode,
      errorMessage
    });
  }

  // Analytics query methods
  async getCheckInMetrics(period: DateRange): Promise<CheckInMetrics> {
    const events = this.getEventsInPeriod(period);
    const checkInEvents = events.filter(e => e.eventCategory === 'checkin');

    const totalCheckIns = checkInEvents.filter(e => e.eventType === 'checkin_completed').length;
    const faceRecognitionCount = checkInEvents.filter(
      e => e.eventType === 'face_recognition_attempt' && e.success
    ).length;

    const confidenceValues = checkInEvents
      .filter(e => e.eventType === 'face_recognition_attempt' && e.eventData.confidence)
      .map(e => e.eventData.confidence);
    const avgConfidence = confidenceValues.length > 0
      ? confidenceValues.reduce((a, b) => a + b, 0) / confidenceValues.length
      : 0;

    const failedCheckIns = checkInEvents.filter(
      e => e.eventType === 'checkin_completed' && !e.success
    ).length;

    const durations = checkInEvents
      .filter(e => e.eventType === 'checkin_completed' && e.durationMs)
      .map(e => e.durationMs!);
    const avgCheckInDuration = durations.length > 0
      ? durations.reduce((a, b) => a + b, 0) / durations.length / 1000 // Convert to seconds
      : 0;

    return {
      totalCheckIns,
      faceRecognitionCount,
      avgConfidence,
      failedCheckIns,
      avgCheckInDuration,
      dailyBreakdown: await this.getDailyBreakdown(period)
    };
  }

  async getPerformanceMetrics(period: DateRange): Promise<PerformanceMetrics> {
    const events = this.getEventsInPeriod(period);

    // Average check-in time
    const checkInTimes = events
      .filter(e => e.eventType === 'checkin_completed' && e.durationMs)
      .map(e => e.durationMs! / 1000);
    const averageCheckInTime = checkInTimes.length > 0
      ? checkInTimes.reduce((a, b) => a + b, 0) / checkInTimes.length
      : 0;

    // Face recognition accuracy
    const faceRecognitionEvents = events.filter(e => e.eventType === 'face_recognition_attempt');
    const faceRecognitionSuccesses = faceRecognitionEvents.filter(e => e.success).length;
    const faceRecognitionAccuracy = faceRecognitionEvents.length > 0
      ? (faceRecognitionSuccesses / faceRecognitionEvents.length) * 100
      : 0;

    // Health screening pass rate
    const healthScreeningEvents = events.filter(e => e.eventType === 'health_screening');
    const healthScreeningPassed = healthScreeningEvents.filter(e => e.success).length;
    const healthScreeningPassRate = healthScreeningEvents.length > 0
      ? (healthScreeningPassed / healthScreeningEvents.length) * 100
      : 0;

    // Queue efficiency (mock calculation)
    const queueEvents = events.filter(e => e.eventType === 'queue_entry');
    const totalEstimatedWait = queueEvents.reduce((sum, e) => sum + (e.eventData.estimatedWaitTime || 0), 0);
    const queueEfficiency = queueEvents.length > 0
      ? Math.max(0, 100 - (totalEstimatedWait / queueEvents.length / 60) * 10) // Penalize long waits
      : 100;

    // Device reliability
    const totalEvents = events.length;
    const errorEvents = events.filter(e => e.eventCategory === 'error').length;
    const deviceReliability = totalEvents > 0
      ? ((totalEvents - errorEvents) / totalEvents) * 100
      : 100;

    return {
      averageCheckInTime,
      faceRecognitionAccuracy,
      healthScreeningPassRate,
      queueEfficiency,
      deviceReliability
    };
  }

  async getUsagePatterns(period: DateRange): Promise<UsagePatterns> {
    const events = this.getEventsInPeriod(period);

    // Peak hours analysis
    const hourCounts = new Array(24).fill(0);
    events.forEach(event => {
      const hour = event.createdAt.getHours();
      hourCounts[hour]++;
    });
    const peakHours = hourCounts
      .map((count, hour) => ({ hour, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);

    // Busy days analysis
    const dayCounts = new Array(7).fill(0);
    events.forEach(event => {
      const dayOfWeek = event.createdAt.getDay();
      dayCounts[dayOfWeek]++;
    });
    const busyDays = dayCounts
      .map((count, dayOfWeek) => ({ dayOfWeek, count }))
      .sort((a, b) => b.count - a.count);

    // Device preferences
    const deviceCounts = new Map<string, number>();
    events.forEach(event => {
      if (event.deviceId) {
        const deviceType = event.deviceId.toString().startsWith('tablet') ? 'tablet' : 'mobile';
        deviceCounts.set(deviceType, (deviceCounts.get(deviceType) || 0) + 1);
      }
    });
    const devicePreferences = Array.from(deviceCounts.entries())
      .map(([deviceType, count]) => ({ deviceType, count }))
      .sort((a, b) => b.count - a.count);

    // Method preferences
    const methodCounts = new Map<string, number>();
    events.filter(e => e.eventType === 'checkin_completed').forEach(event => {
      const method = event.eventData.method || 'unknown';
      methodCounts.set(method, (methodCounts.get(method) || 0) + 1);
    });
    const methodPreferences = Array.from(methodCounts.entries())
      .map(([method, count]) => ({ method, count }))
      .sort((a, b) => b.count - a.count);

    return {
      peakHours,
      busyDays,
      devicePreferences,
      methodPreferences
    };
  }

  async getErrorAnalysis(period: DateRange): Promise<ErrorAnalysis> {
    const events = this.getEventsInPeriod(period);
    const errorEvents = events.filter(e => e.eventCategory === 'error');

    const totalErrors = errorEvents.length;

    // Group errors by type
    const errorTypeCounts = new Map<string, number>();
    errorEvents.forEach(event => {
      const errorType = event.errorCode || 'unknown';
      errorTypeCounts.set(errorType, (errorTypeCounts.get(errorType) || 0) + 1);
    });

    const errorsByType = Array.from(errorTypeCounts.entries())
      .map(([errorType, count]) => ({
        errorType,
        count,
        percentage: (count / totalErrors) * 100
      }))
      .sort((a, b) => b.count - a.count);

    // Error trends over time
    const errorTrends = this.calculateErrorTrends(events, period);

    // Critical errors
    const criticalErrors = errorEvents
      .filter(e => this.classifyErrorSeverity(e.errorCode || '') === 'critical')
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 10);

    return {
      totalErrors,
      errorsByType,
      errorTrends,
      criticalErrors
    };
  }

  async getPatientBehaviorInsights(period: DateRange): Promise<PatientBehaviorInsights> {
    const events = this.getEventsInPeriod(period);

    // Average session duration
    const sessionDurations = events
      .filter(e => e.eventType === 'checkin_completed' && e.durationMs)
      .map(e => e.durationMs! / 1000);
    const averageSessionDuration = sessionDurations.length > 0
      ? sessionDurations.reduce((a, b) => a + b, 0) / sessionDurations.length
      : 0;

    // Preferred check-in methods
    const methodCounts = new Map<string, number>();
    events.filter(e => e.eventType === 'checkin_completed').forEach(event => {
      const method = event.eventData.method || 'unknown';
      methodCounts.set(method, (methodCounts.get(method) || 0) + 1);
    });
    const preferredCheckInMethods = Array.from(methodCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([method]) => method);

    // Exercise completion patterns
    const exerciseEvents = events.filter(e => e.eventType === 'exercise_completed');
    const hourlyCompletions = this.calculateHourlyPattern(exerciseEvents);
    const dailyCompletions = this.calculateDailyPattern(exerciseEvents);

    // Portal usage patterns
    const portalEvents = events.filter(e => e.eventCategory === 'portal');
    const sectionViews = new Map<string, number>();
    const sessionLengths: number[] = [];

    portalEvents.forEach(event => {
      if (event.eventType === 'portal_page_view') {
        const section = event.eventData.pageName || 'unknown';
        sectionViews.set(section, (sectionViews.get(section) || 0) + 1);

        if (event.durationMs) {
          sessionLengths.push(event.durationMs / 1000);
        }
      }
    });

    const mostViewedSections = Array.from(sectionViews.entries())
      .map(([section, views]) => ({ section, views }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 5);

    const averageSessionLength = sessionLengths.length > 0
      ? sessionLengths.reduce((a, b) => a + b, 0) / sessionLengths.length
      : 0;

    // Calculate return user rate (simplified)
    const uniqueUsers = new Set(portalEvents.map(e => e.patientId).filter(Boolean));
    const returnSessions = portalEvents.filter(e => e.eventType === 'portal_access').length;
    const returnUserRate = uniqueUsers.size > 0
      ? (returnSessions / uniqueUsers.size) * 100
      : 0;

    return {
      averageSessionDuration,
      preferredCheckInMethods,
      exerciseCompletionPatterns: {
        timeOfDay: hourlyCompletions,
        dayOfWeek: dailyCompletions
      },
      portalUsagePatterns: {
        mostViewedSections,
        averageSessionLength,
        returnUserRate
      }
    };
  }

  // Real-time metrics
  getRealTimeStats(): {
    activeCheckIns: number;
    queueLength: number;
    errorRate: number;
    averageProcessingTime: number;
  } {
    const recentEvents = this.events.filter(
      e => e.createdAt > new Date(Date.now() - 5 * 60 * 1000) // Last 5 minutes
    );

    const activeCheckIns = recentEvents.filter(
      e => e.eventType === 'checkin_started'
    ).length - recentEvents.filter(
      e => e.eventType === 'checkin_completed'
    ).length;

    const queueEvents = recentEvents.filter(e => e.eventType === 'queue_entry');
    const queueLength = queueEvents.length;

    const totalRecentEvents = recentEvents.length;
    const errorEvents = recentEvents.filter(e => e.eventCategory === 'error').length;
    const errorRate = totalRecentEvents > 0 ? (errorEvents / totalRecentEvents) * 100 : 0;

    const processingTimes = recentEvents
      .filter(e => e.durationMs)
      .map(e => e.durationMs!);
    const averageProcessingTime = processingTimes.length > 0
      ? processingTimes.reduce((a, b) => a + b, 0) / processingTimes.length
      : 0;

    return {
      activeCheckIns: Math.max(0, activeCheckIns),
      queueLength,
      errorRate,
      averageProcessingTime
    };
  }

  // Private helper methods
  private async trackEventInternal(eventData: Partial<AnalyticsEvent>): Promise<void> {
    const event: AnalyticsEvent = {
      id: this.generateEventId(),
      createdAt: new Date(),
      ...eventData
    } as AnalyticsEvent;

    this.eventBuffer.push(event);

    // Flush immediately for errors
    if (event.eventCategory === 'error') {
      await this.flushEventBuffer();
    }
  }

  private generateEventId(): string {
    return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getEventsInPeriod(period: DateRange): AnalyticsEvent[] {
    return this.events.filter(
      event => event.createdAt >= period.start && event.createdAt <= period.end
    );
  }

  private async getDailyBreakdown(period: DateRange): Promise<DailyMetrics[]> {
    const dailyMap = new Map<string, {
      totalCheckIns: number;
      faceRecognitionCount: number;
      confidenceValues: number[];
      failedCheckIns: number;
      durations: number[];
    }>();

    const events = this.getEventsInPeriod(period);

    events.forEach(event => {
      const dateKey = event.createdAt.toDateString();

      if (!dailyMap.has(dateKey)) {
        dailyMap.set(dateKey, {
          totalCheckIns: 0,
          faceRecognitionCount: 0,
          confidenceValues: [],
          failedCheckIns: 0,
          durations: []
        });
      }

      const dayData = dailyMap.get(dateKey)!;

      if (event.eventType === 'checkin_completed') {
        dayData.totalCheckIns++;
        if (!event.success) {
          dayData.failedCheckIns++;
        }
        if (event.durationMs) {
          dayData.durations.push(event.durationMs / 1000);
        }
      }

      if (event.eventType === 'face_recognition_attempt' && event.success) {
        dayData.faceRecognitionCount++;
        if (event.eventData.confidence) {
          dayData.confidenceValues.push(event.eventData.confidence);
        }
      }
    });

    return Array.from(dailyMap.entries()).map(([dateStr, data]) => ({
      date: new Date(dateStr),
      totalCheckIns: data.totalCheckIns,
      faceRecognitionCount: data.faceRecognitionCount,
      avgConfidence: data.confidenceValues.length > 0
        ? data.confidenceValues.reduce((a, b) => a + b, 0) / data.confidenceValues.length
        : 0,
      failedCheckIns: data.failedCheckIns,
      avgCheckInDuration: data.durations.length > 0
        ? data.durations.reduce((a, b) => a + b, 0) / data.durations.length
        : 0
    })).sort((a, b) => a.date.getTime() - b.date.getTime());
  }

  private calculateErrorTrends(events: AnalyticsEvent[], period: DateRange): { date: Date; errorCount: number; totalEvents: number }[] {
    const dailyMap = new Map<string, { errorCount: number; totalEvents: number }>();

    events.forEach(event => {
      const dateKey = event.createdAt.toDateString();

      if (!dailyMap.has(dateKey)) {
        dailyMap.set(dateKey, { errorCount: 0, totalEvents: 0 });
      }

      const dayData = dailyMap.get(dateKey)!;
      dayData.totalEvents++;

      if (event.eventCategory === 'error') {
        dayData.errorCount++;
      }
    });

    return Array.from(dailyMap.entries())
      .map(([dateStr, data]) => ({
        date: new Date(dateStr),
        errorCount: data.errorCount,
        totalEvents: data.totalEvents
      }))
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  }

  private calculateHourlyPattern(events: AnalyticsEvent[]): { hour: number; completionRate: number }[] {
    const hourlyData = new Array(24).fill(0).map(() => ({ attempts: 0, successes: 0 }));

    events.forEach(event => {
      const hour = event.createdAt.getHours();
      hourlyData[hour].attempts++;
      if (event.success) {
        hourlyData[hour].successes++;
      }
    });

    return hourlyData.map((data, hour) => ({
      hour,
      completionRate: data.attempts > 0 ? (data.successes / data.attempts) * 100 : 0
    }));
  }

  private calculateDailyPattern(events: AnalyticsEvent[]): { day: number; completionRate: number }[] {
    const dailyData = new Array(7).fill(0).map(() => ({ attempts: 0, successes: 0 }));

    events.forEach(event => {
      const day = event.createdAt.getDay();
      dailyData[day].attempts++;
      if (event.success) {
        dailyData[day].successes++;
      }
    });

    return dailyData.map((data, day) => ({
      day,
      completionRate: data.attempts > 0 ? (data.successes / data.attempts) * 100 : 0
    }));
  }

  private classifyErrorSeverity(errorCode: string): 'low' | 'medium' | 'high' | 'critical' {
    const criticalCodes = ['SYSTEM_FAILURE', 'DATA_CORRUPTION', 'SECURITY_BREACH'];
    const highCodes = ['FACE_RECOGNITION_FAILED', 'HEALTH_SCREENING_ERROR', 'QUEUE_OVERFLOW'];
    const mediumCodes = ['DEVICE_ERROR', 'NETWORK_TIMEOUT', 'VALIDATION_FAILED'];

    if (criticalCodes.some(code => errorCode.includes(code))) return 'critical';
    if (highCodes.some(code => errorCode.includes(code))) return 'high';
    if (mediumCodes.some(code => errorCode.includes(code))) return 'medium';
    return 'low';
  }

  private startBatchProcessor(): void {
    setInterval(async () => {
      if (this.eventBuffer.length >= this.batchSize) {
        await this.flushEventBuffer();
      }
    }, this.flushInterval);
  }

  private async flushEventBuffer(): Promise<void> {
    if (this.eventBuffer.length === 0) return;

    const eventsToFlush = [...this.eventBuffer];
    this.eventBuffer = [];

    try {
      // In production, these would be sent to a database or analytics service
      this.events.push(...eventsToFlush);

      // Keep only recent events in memory (last 24 hours)
      const cutoffTime = new Date(Date.now() - 24 * 60 * 60 * 1000);
      this.events = this.events.filter(event => event.createdAt > cutoffTime);

      console.log(`Flushed ${eventsToFlush.length} analytics events`);
    } catch (error) {
      console.error('Failed to flush analytics events:', error);
      // Re-add events to buffer for retry
      this.eventBuffer.unshift(...eventsToFlush);
    }
  }

  // Export data for external analytics tools
  async exportData(period: DateRange, format: 'json' | 'csv' = 'json'): Promise<string> {
    const events = this.getEventsInPeriod(period);

    if (format === 'csv') {
      const headers = [
        'id', 'eventType', 'eventCategory', 'patientId', 'sessionId',
        'deviceId', 'success', 'durationMs', 'errorCode', 'createdAt'
      ];

      const csvLines = [
        headers.join(','),
        ...events.map(event => [
          event.id,
          event.eventType,
          event.eventCategory,
          event.patientId || '',
          event.sessionId || '',
          event.deviceId || '',
          event.success,
          event.durationMs || '',
          event.errorCode || '',
          event.createdAt.toISOString()
        ].join(','))
      ];

      return csvLines.join('\n');
    }

    return JSON.stringify(events, null, 2);
  }

  // Clear old data
  async clearOldData(daysToKeep: number = 90): Promise<number> {
    const cutoffTime = new Date(Date.now() - daysToKeep * 24 * 60 * 60 * 1000);
    const initialCount = this.events.length;

    this.events = this.events.filter(event => event.createdAt > cutoffTime);

    const removedCount = initialCount - this.events.length;
    console.log(`Removed ${removedCount} old analytics events`);

    return removedCount;
  }
}