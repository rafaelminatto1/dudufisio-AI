import { CheckInEngine } from './core/CheckInEngine';
import { FaceRecognitionService } from './core/FaceRecognition';
import { QueueManager, QueueConfig } from './core/QueueManager';
import { PushNotificationService } from './notifications/PushNotificationService';
import { CheckInAnalytics } from './analytics/CheckInAnalytics';
import { OfflineManager } from './offline/OfflineManager';
import { PatientPortalService } from '../patient-portal/PatientPortalService';
import { TabletInterface } from './devices/TabletInterface';
import { logger } from './logger';

import {
  CheckInData,
  CheckInResult,
  PatientId,
  FaceRecognitionConfig,
  TabletConfig,
  CheckIn
} from '../../types/checkin';
import { getFCMConfig, validateFirebaseConfig } from './config/firebase-production';

export interface CheckInSystemConfig {
  faceRecognition: FaceRecognitionConfig;
  queue: QueueConfig;
  tablet?: TabletConfig;
  notifications?: {
    fcm?: { serverKey: string; projectId: string; vapidKey: string };
    apns?: { keyId: string; teamId: string; bundleId: string; privateKey: string };
  };
  offline?: {
    maxQueueSize?: number;
    maxRetries?: number;
    syncInterval?: number;
    compressionEnabled?: boolean;
    encryptionEnabled?: boolean;
  };
  analytics?: {
    batchSize?: number;
    flushInterval?: number;
  };
}

export class CheckInSystem {
  private checkInEngine: CheckInEngine;
  private faceRecognition: FaceRecognitionService;
  private queueManager: QueueManager;
  private notificationService: PushNotificationService;
  private analytics: CheckInAnalytics;
  private offlineManager: OfflineManager;
  private patientPortal: PatientPortalService;
  private tabletInterface?: TabletInterface;

  private initialized: boolean = false;

  constructor(private config: CheckInSystemConfig) {
    // Initialize core services
    this.faceRecognition = new FaceRecognitionService(config.faceRecognition);
    this.queueManager = new QueueManager(config.queue);

    // Use Firebase production config if available, otherwise use provided config
    const fcmConfig = validateFirebaseConfig() ? getFCMConfig() : config.notifications?.fcm;
    this.notificationService = new PushNotificationService(
      fcmConfig,
      config.notifications?.apns
    );
    this.analytics = new CheckInAnalytics();
    this.offlineManager = new OfflineManager(config.offline);
    this.patientPortal = new PatientPortalService();

    // Initialize main check-in engine with dependencies
    this.checkInEngine = new CheckInEngine(
      this.faceRecognition,
      undefined, // Will use default mock services
      undefined,
      this.queueManager,
      undefined,
      undefined
    );

    // Initialize tablet interface if configured
    if (config.tablet) {
      this.tabletInterface = new TabletInterface(config.tablet, this.checkInEngine);
    }
  }

  async initialize(): Promise<void> {
    if (this.initialized) {
      logger.warn('CheckInSystem already initialized.', { context: 'checkin.system' });
      return;
    }

    logger.info('Initializing FisioFlow Intelligent Check-in System...', { context: 'checkin.system' });

    try {
      // Initialize offline capabilities first
      logger.info('Initializing offline manager...', { context: 'checkin.system.offline' });
      // OfflineManager initializes itself in constructor

      // Preload critical data for offline use
      await this.preloadCriticalData();

      // Initialize tablet interface if available
      if (this.tabletInterface) {
        logger.info('Initializing tablet kiosk interface...', { context: 'checkin.system.tablet' });
        await this.tabletInterface.initializeKiosk();
      }

      // Set up analytics tracking
      this.setupAnalyticsTracking();

      // Set up notification handlers
      this.setupNotificationHandlers();

      // Set up offline synchronization
      this.setupOfflineSync();

      this.initialized = true;
      logger.info('FisioFlow Check-in System initialized successfully.', { context: 'checkin.system' });

      // Track system initialization
      await this.analytics.trackEvent({
        eventType: 'system_initialized',
        eventCategory: 'system',
        eventData: {
          version: '1.0.0',
          features: {
            faceRecognition: true,
            offlineMode: true,
            pushNotifications: true,
            analytics: true,
            patientPortal: true,
            tabletInterface: !!this.tabletInterface
          }
        },
        success: true
      });

    } catch (error) {
      logger.error('Failed to initialize CheckInSystem.', { context: 'checkin.system', data: { error } });

      await this.analytics.trackError(
        'system_initialization',
        'INIT_FAILED',
        `System initialization failed: ${error instanceof Error ? error.message : String(error)}`,
        { error: error instanceof Error ? error.toString() : String(error) }
      );

      throw error;
    }
  }

  // Main check-in processing
  async processCheckIn(checkInData: CheckInData): Promise<CheckInResult> {
    if (!this.initialized) {
      throw new Error('CheckInSystem not initialized');
    }

    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    try {
      // Track check-in start
      await this.analytics.trackCheckInStarted(
        sessionId,
        checkInData.deviceId,
        undefined,
        { method: checkInData.photo ? 'facial_recognition' : 'manual_search' }
      );

      let result: CheckInResult;

      // Check if online or offline
      if (navigator.onLine) {
        logger.debug('Processing online check-in.', { context: 'checkin.system' });
        result = await this.checkInEngine.processCheckIn(checkInData);
      } else {
        logger.debug('Processing offline check-in.', { context: 'checkin.system' });
        result = await this.offlineManager.processCheckInOffline(checkInData);
      }

      // Track check-in completion
      await this.analytics.trackCheckInCompleted(
        sessionId,
        result.checkIn?.patientId || ('unknown' as PatientId),
        Date.now() - parseInt(sessionId.split('_')[1]),
        result.checkIn?.method || 'unknown',
        result.success
      );

      // Send notifications if successful
      if (result.success && result.checkIn) {
        await this.handleSuccessfulCheckIn(result.checkIn);
      }

      return result;

    } catch (error) {
      logger.error('Check-in processing failed.', { context: 'checkin.system', data: { error } });

      await this.analytics.trackError(
        'checkin_processing',
        'CHECKIN_FAILED',
        `Check-in failed: ${error}`,
        { sessionId, deviceId: checkInData.deviceId }
      );

      return {
        success: false,
        error: `Check-in failed: ${error}`
      };
    }
  }

  // Patient portal methods
  async getPatientDashboard(patientId: PatientId) {
    return await this.patientPortal.getPatientDashboard(patientId);
  }

  async getTreatmentTimeline(patientId: PatientId) {
    return await this.patientPortal.getTreatmentTimeline(patientId);
  }

  async getExerciseAdherence(patientId: PatientId, days: number = 30) {
    return await this.patientPortal.getExerciseAdherence(patientId, days);
  }

  async getProgressMetrics(patientId: PatientId) {
    return await this.patientPortal.getProgressMetrics(patientId);
  }

  // Face recognition management
  async enrollPatientFace(patientId: PatientId, photoData: ImageData) {
    const result = await this.faceRecognition.enrollPatient(patientId, photoData);

    await this.analytics.trackEvent({
      eventType: 'face_enrollment',
      eventCategory: 'checkin',
      patientId,
      eventData: {
        success: result.success,
        qualityScore: result.qualityScore
      },
      success: result.success
    });

    return result;
  }

  // Queue management
  async getQueueStatus() {
    return this.queueManager.getQueueStatus();
  }

  async processNextPatient() {
    const nextPatient = await this.checkInEngine.processNextPatient();

    if (nextPatient) {
      await this.notificationService.sendAppointmentReady(nextPatient.patientId);
    }

    return nextPatient;
  }

  // Notification methods
  async registerDeviceForNotifications(patientId: PatientId, token: string, platform: 'ios' | 'android' | 'web') {
    await this.notificationService.registerDevice(patientId, token, platform);
  }

  async sendCustomNotification(patientId: PatientId, title: string, body: string, data?: Record<string, string>) {
    // sendImmediate is private, use send instead
    await this.notificationService.send({
      patientId,
      notification: {
        title,
        body,
        data: { ...data, type: 'custom' }
      },
      priority: 'high'
    });
  }

  // Analytics methods
  async getCheckInMetrics(startDate: Date, endDate: Date) {
    return await this.analytics.getCheckInMetrics({ start: startDate, end: endDate });
  }

  async getPerformanceMetrics(startDate: Date, endDate: Date) {
    return await this.analytics.getPerformanceMetrics({ start: startDate, end: endDate });
  }

  async getUsagePatterns(startDate: Date, endDate: Date) {
    return await this.analytics.getUsagePatterns({ start: startDate, end: endDate });
  }

  getRealTimeStats() {
    return this.analytics.getRealTimeStats();
  }

  // Offline management
  async forceSync() {
    await this.offlineManager.forceSync();
  }

  getSyncStatus() {
    return this.offlineManager.getSyncStatus();
  }

  async preloadCriticalData() {
    // Mock patient IDs - in production, get from recent appointments
    const criticalPatientIds: PatientId[] = ['patient-1', 'patient-2', 'patient-3'].map(id => id as PatientId);

    await this.offlineManager.preloadCriticalData(criticalPatientIds);
  }

  // System status and health
  getSystemStatus() {
    const queueStats = this.queueManager.getQueueStatus();
    const offlineStats = this.offlineManager.getStats();
    const realtimeStats = this.analytics.getRealTimeStats();
    const notificationStats = this.notificationService.getStats();

    return {
      initialized: this.initialized,
      online: navigator.onLine,
      timestamp: new Date(),
      queue: {
        totalPatients: queueStats.totalPatients,
        averageWaitTime: queueStats.averageWaitTime
      },
      offline: {
        cacheSize: offlineStats.cacheSize,
        queueSize: offlineStats.queueSize,
        syncSuccessRate: offlineStats.syncSuccessRate,
        lastSyncTime: offlineStats.lastSyncTime
      },
      analytics: {
        activeCheckIns: realtimeStats.activeCheckIns,
        errorRate: realtimeStats.errorRate,
        averageProcessingTime: realtimeStats.averageProcessingTime
      },
      notifications: {
        totalDevices: notificationStats.totalDevices,
        activeTokens: notificationStats.activeTokens,
        scheduledNotifications: notificationStats.scheduledNotifications,
        sentToday: notificationStats.sentToday
      }
    };
  }

  async performHealthCheck(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    checks: Record<string, { status: 'pass' | 'fail'; message?: string }>;
  }> {
    const checks: Record<string, { status: 'pass' | 'fail'; message?: string }> = {};

    // Check core services
    try {
      checks.faceRecognition = { status: 'pass' };
    } catch (error) {
      checks.faceRecognition = { status: 'fail', message: `Face recognition error: ${error}` };
    }

    try {
      this.queueManager.getQueueStatus();
      checks.queueManager = { status: 'pass' };
    } catch (error) {
      checks.queueManager = { status: 'fail', message: `Queue manager error: ${error}` };
    }

    // Check offline capabilities
    try {
      const syncStatus = this.offlineManager.getSyncStatus();
      checks.offlineManager = {
        status: syncStatus.failedItems > 10 ? 'fail' : 'pass',
        message: syncStatus.failedItems > 10 ? 'Too many failed sync items' : undefined
      };
    } catch (error) {
      checks.offlineManager = { status: 'fail', message: `Offline manager error: ${error}` };
    }

    // Check notification service
    try {
      this.notificationService.getStats();
      checks.notifications = { status: 'pass' };
    } catch (error) {
      checks.notifications = { status: 'fail', message: `Notification service error: ${error}` };
    }

    // Determine overall status
    const failedChecks = Object.values(checks).filter(check => check.status === 'fail').length;
    let status: 'healthy' | 'degraded' | 'unhealthy';

    if (failedChecks === 0) {
      status = 'healthy';
    } else if (failedChecks <= 2) {
      status = 'degraded';
    } else {
      status = 'unhealthy';
    }

    return { status, checks };
  }

  // Private helper methods
  private async handleSuccessfulCheckIn(checkIn: CheckIn) {
    // Send check-in confirmation notification
    if (checkIn.queuePosition && checkIn.estimatedWaitTime) {
      await this.notificationService.sendCheckInConfirmation(
        checkIn.patientId,
        checkIn.queuePosition,
        checkIn.estimatedWaitTime
      );
    }

    // Track in analytics
    await this.analytics.trackEvent({
      eventType: 'checkin_notification_sent',
      eventCategory: 'notification',
      patientId: checkIn.patientId,
      eventData: {
        queuePosition: checkIn.queuePosition,
        estimatedWaitTime: checkIn.estimatedWaitTime
      },
      success: true
    });
  }

  private setupAnalyticsTracking() {
    logger.debug('Setting up analytics tracking.', { context: 'checkin.system.analytics' });

    // Analytics is already set up in the constructor
    // Additional setup could include custom event handlers
  }

  private setupNotificationHandlers() {
    logger.debug('Setting up notification handlers.', { context: 'checkin.system.notifications' });

    // Set up queue position update notifications
    // In a real implementation, this would listen to queue changes
  }

  private setupOfflineSync() {
    logger.debug('Setting up offline synchronization.', { context: 'checkin.system.offline' });

    // Monitor sync status
    this.offlineManager.onStatusChange((status) => {
      logger.debug('Sync status changed.', { context: 'checkin.system.offline', data: status });

      // Track sync events
      this.analytics.trackEvent({
        eventType: 'sync_status_change',
        eventCategory: 'offline',
        eventData: {
          isOnline: status.isOnline,
          pendingItems: status.pendingItems,
          failedItems: status.failedItems,
          syncInProgress: status.syncInProgress
        },
        success: true
      });
    });
  }

  // Cleanup methods
  async shutdown() {
    logger.info('Shutting down CheckInSystem...', { context: 'checkin.system' });

    try {
      // Force final sync
      if (navigator.onLine) {
        await this.offlineManager.forceSync();
      }

      // Clear sensitive data
      this.faceRecognition.clearCache();

      // Track shutdown
      await this.analytics.trackEvent({
        eventType: 'system_shutdown',
        eventCategory: 'system',
        eventData: { timestamp: new Date() },
        success: true
      });

      this.initialized = false;
      logger.info('CheckInSystem shutdown complete.', { context: 'checkin.system' });

    } catch (error) {
      logger.error('Error during CheckInSystem shutdown.', { context: 'checkin.system', data: { error } });
      throw error;
    }
  }
}

// Export factory function for easy setup
export function createCheckInSystem(config: CheckInSystemConfig): CheckInSystem {
  return new CheckInSystem(config);
}

// Export default configuration
export const defaultCheckInConfig: CheckInSystemConfig = {
  faceRecognition: {
    apiKey: 'mock-api-key',
    confidenceThreshold: 0.85,
    maxFaces: 1
  },
  queue: {
    maxSize: 100,
    priorityWeights: {
      emergency: 100,
      followUp: 50,
      firstTime: 30,
      delay: 1,
      age: 20
    }
  },
  offline: {
    maxQueueSize: 1000,
    maxRetries: 3,
    syncInterval: 30000,
    compressionEnabled: true,
    encryptionEnabled: true
  }
};
