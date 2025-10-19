/* eslint-disable no-unused-vars */
import {
  CheckInData,
  CheckInResult,
  PatientId
} from '../../../types/checkin';
import { logger } from '../../logger';

interface OfflineQueueItem {
  id: string;
  type: 'checkin' | 'analytics' | 'notification' | 'progress';
  data: unknown;
  timestamp: Date;
  retryCount: number;
  maxRetries: number;
  priority: 'low' | 'normal' | 'high' | 'critical';
}

type StoredCheckIn = Record<string, unknown> & { id?: string; syncStatus?: string };
type SyncStatusCallback = (syncStatus: SyncStatus) => void;

interface SyncStatus {
  isOnline: boolean;
  lastSyncTime: Date | null;
  pendingItems: number;
  failedItems: number;
  syncInProgress: boolean;
}

interface OfflineConfig {
  maxQueueSize: number;
  maxRetries: number;
  syncInterval: number;
  compressionEnabled: boolean;
  encryptionEnabled: boolean;
}

interface CachedData {
  patients: Map<PatientId, unknown>;
  appointments: Map<string, unknown>;
  exercises: Map<string, unknown>;
  faceEncodings: Map<PatientId, unknown>;
  lastUpdated: Date;
}

export class OfflineManager {
  private offlineQueue: OfflineQueueItem[] = [];
  private isOnline: boolean = navigator.onLine;
  private syncInProgress: boolean = false;
  private lastSyncTime: Date | null = null;
  private cachedData: CachedData;
  private config: OfflineConfig;
  private syncCallbacks = new Set<SyncStatusCallback>();

  constructor(config: Partial<OfflineConfig> = {}) {
    this.config = {
      maxQueueSize: 1000,
      maxRetries: 3,
      syncInterval: 30000, // 30 seconds
      compressionEnabled: true,
      encryptionEnabled: true,
      ...config
    };

    this.cachedData = {
      patients: new Map(),
      appointments: new Map(),
      exercises: new Map(),
      faceEncodings: new Map(),
      lastUpdated: new Date()
    };

    this.initializeOfflineCapabilities();
  }

  private async initializeOfflineCapabilities(): Promise<void> {
    // Set up network status listeners
    window.addEventListener('online', () => {
      logger.info('Network connection restored.', { context: 'checkin.offline' });
      this.isOnline = true;
      this.startSync();
    });

    window.addEventListener('offline', () => {
      logger.warn('Network connection lost - switching to offline mode.', { context: 'checkin.offline' });
      this.isOnline = false;
    });

    // Load cached data from IndexedDB
    await this.loadCachedData();

    // Load offline queue from localStorage
    await this.loadOfflineQueue();

    // Start periodic sync
    this.startPeriodicSync();

    logger.info('Offline manager initialized.', { context: 'checkin.offline' });
  }

  // Offline queue management
  async queueForSync(
    type: OfflineQueueItem['type'],
    data: unknown,
    priority: OfflineQueueItem['priority'] = 'normal'
  ): Promise<string> {
    const item: OfflineQueueItem = {
      id: this.generateId(),
      type,
      data: this.config.compressionEnabled ? await this.compressData(data) : data,
      timestamp: new Date(),
      retryCount: 0,
      maxRetries: this.config.maxRetries,
      priority
    };

    // Check queue size limit
    if (this.offlineQueue.length >= this.config.maxQueueSize) {
      // Remove oldest low priority items
      this.offlineQueue = this.offlineQueue.filter(
        item => item.priority !== 'low'
      ).slice(-(this.config.maxQueueSize - 1));
    }

    this.offlineQueue.push(item);
    this.sortQueueByPriority();

    await this.saveOfflineQueue();

    logger.debug(`Queued ${type} item for sync: ${item.id}`, {
      context: 'checkin.offline.queue',
      data: { type, id: item.id },
    });

    // Try to sync immediately if online
    if (this.isOnline && !this.syncInProgress) {
      this.startSync();
    }

    return item.id;
  }

  async processCheckInOffline(checkInData: CheckInData): Promise<CheckInResult> {
    try {
      logger.debug('Processing check-in in offline mode.', { context: 'checkin.offline' });

      // Validate cached data availability
      const validationResult = await this.validateOfflineCheckIn(checkInData);
      if (!validationResult.valid) {
        return {
          success: false,
          error: validationResult.error
        };
      }

      // Generate offline check-in ID
      const offlineCheckInId = `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Create offline check-in record
      const offlineCheckIn = {
        id: offlineCheckInId,
        patientId: (validationResult.patientId || 'unknown') as PatientId,
        appointmentId: (validationResult.appointmentId || 'unknown'),
        checkInTime: new Date(),
        method: (checkInData.photo ? 'facial_recognition' : 'manual_search') as 'facial_recognition' | 'manual_search' | 'qr_code' | 'phone_number',
        deviceId: checkInData.deviceId,
        healthScreeningPassed: true,
        status: 'completed' as 'completed' | 'failed' | 'cancelled' | 'requires_review',
        isOffline: true,
        queuePosition: await this.getOfflineQueuePosition(),
        estimatedWaitTime: 15, // Default offline estimate
        additionalData: checkInData.metadata
      };

      // Store offline check-in locally
      await this.storeOfflineCheckIn(offlineCheckIn);

      // Queue for sync when online
      await this.queueForSync('checkin', {
        checkInData,
        offlineCheckIn
      }, 'high');

      // Update local analytics
      await this.trackOfflineAnalytics('checkin_completed', {
        offline: true,
        patientId: offlineCheckIn.patientId,
        method: offlineCheckIn.method
      });

      return {
        success: true,
        checkIn: offlineCheckIn
      };

    } catch (error) {
      logger.error('Offline check-in failed.', { context: 'checkin.offline', data: { error } });
      return {
        success: false,
        error: `Offline check-in failed: ${error}`
      };
    }
  }

  // Data caching and retrieval
  async cachePatientData(patients: unknown[]): Promise<void> {
    patients.forEach(patient => {
      this.cachedData.patients.set(patient.id, {
        ...patient,
        cachedAt: new Date()
      });
    });

    await this.saveCachedData();
    logger.info(`Cached ${patients.length} patients for offline use.`, {
      context: 'checkin.offline.cache',
      data: { count: patients.length },
    });
  }

  async cacheAppointmentData(appointments: unknown[]): Promise<void> {
    appointments.forEach(appointment => {
      this.cachedData.appointments.set(appointment.id, {
        ...appointment,
        cachedAt: new Date()
      });
    });

    await this.saveCachedData();
    logger.info(`Cached ${appointments.length} appointments for offline use.`, {
      context: 'checkin.offline.cache',
      data: { count: appointments.length },
    });
  }

  async getCachedPatient(patientId: PatientId): Promise<unknown | null> {
    const patient = this.cachedData.patients.get(patientId);
    if (patient && this.isCacheValid(patient.cachedAt)) {
      return patient;
    }
    return null;
  }

  async getCachedAppointment(appointmentId: string): Promise<unknown | null> {
    const appointment = this.cachedData.appointments.get(appointmentId);
    if (appointment && this.isCacheValid(appointment.cachedAt)) {
      return appointment;
    }
    return null;
  }

  // Synchronization
  async startSync(): Promise<void> {
    if (this.syncInProgress || !this.isOnline) {
      return;
    }

    this.syncInProgress = true;
    this.notifyStatusChange();

    logger.info(`Starting sync with ${this.offlineQueue.length} items.`, {
      context: 'checkin.offline.sync',
      data: { total: this.offlineQueue.length },
    });

    let syncedCount = 0;
    let failedCount = 0;

    const itemsToSync = [...this.offlineQueue].slice(0, 50); // Process in batches

    for (const item of itemsToSync) {
      try {
        const success = await this.syncItem(item);
        if (success) {
          this.removeFromQueue(item.id);
          syncedCount++;
        } else {
          item.retryCount++;
          if (item.retryCount >= item.maxRetries) {
        logger.warn(`Item ${item.id} exceeded max retries, removing from queue.`, {
          context: 'checkin.offline.sync',
          data: { itemId: item.id },
        });
            this.removeFromQueue(item.id);
            failedCount++;
          }
        }
      } catch (error) {
        logger.error(`Failed to sync item ${item.id}.`, {
          context: 'checkin.offline.sync',
          data: { itemId: item.id, error },
        });
        item.retryCount++;
        if (item.retryCount >= item.maxRetries) {
          this.removeFromQueue(item.id);
          failedCount++;
        }
      }
    }

    await this.saveOfflineQueue();
    this.lastSyncTime = new Date();
    this.syncInProgress = false;

    logger.info(`Sync completed: ${syncedCount} synced, ${failedCount} failed.`, {
      context: 'checkin.offline.sync',
      data: { syncedCount, failedCount },
    });
    this.notifyStatusChange();
  }

  private async syncItem(item: OfflineQueueItem): Promise<boolean> {
    const data = this.config.compressionEnabled
      ? await this.decompressData(item.data)
      : item.data;

    switch (item.type) {
      case 'checkin':
        return await this.syncCheckIn(data);
      case 'analytics':
        return await this.syncAnalytics(data);
      case 'notification':
        return await this.syncNotification(data);
      case 'progress':
        return await this.syncProgress(data);
      default:
        logger.warn(`Unknown sync item type: ${item.type}`, {
          context: 'checkin.offline.sync',
          data: { type: item.type },
        });
        return false;
    }
  }

  private async syncCheckIn(data: { offlineCheckIn: { id: string } }): Promise<boolean> {
    try {
      // In production, this would call the actual check-in API
      logger.debug('Syncing offline check-in to server.', { context: 'checkin.offline.sync', data: { id: data.offlineCheckIn.id } });

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Update local storage to reflect sync
      await this.updateOfflineCheckInStatus(data.offlineCheckIn.id, 'synced');

      return true;
    } catch (error) {
      logger.error('Failed to sync check-in.', { context: 'checkin.offline.sync', data: { error } });
      return false;
    }
  }

  private async syncAnalytics(data: { eventType: string; [key: string]: unknown }): Promise<boolean> {
    try {
      logger.debug('Syncing analytics event.', { context: 'checkin.offline.sync', data: { eventType: data.eventType } });
      // In production, send to analytics service
      await new Promise(resolve => setTimeout(resolve, 500));
      return true;
    } catch (error) {
      logger.error('Failed to sync analytics.', { context: 'checkin.offline.sync', data: { error } });
      return false;
    }
  }

  private async syncNotification(data: unknown): Promise<boolean> {
    try {
      logger.debug('Syncing notification.', { context: 'checkin.offline.sync', data: { type: data.type } });
      // In production, send via notification service
      await new Promise(resolve => setTimeout(resolve, 300));
      return true;
    } catch (error) {
      logger.error('Failed to sync notification.', { context: 'checkin.offline.sync', data: { error } });
      return false;
    }
  }

  private async syncProgress(data: unknown): Promise<boolean> {
    try {
      logger.debug('Syncing progress data.', { context: 'checkin.offline.sync', data: { patientId: data.patientId } });
      // In production, update patient progress
      await new Promise(resolve => setTimeout(resolve, 800));
      return true;
    } catch (error) {
      logger.error('Failed to sync progress.', { context: 'checkin.offline.sync', data: { error } });
      return false;
    }
  }

  // Validation and utilities
  private async validateOfflineCheckIn(checkInData: CheckInData): Promise<{
    valid: boolean;
    error?: string;
    patientId?: PatientId;
    appointmentId?: string;
  }> {
    // Check if patient exists in cache
    let patientId: PatientId | null = null;

    if (checkInData.photo) {
      // Mock facial recognition with cached data
      patientId = await this.performOfflineFaceRecognition(checkInData.photo);
    }

    if (!patientId && checkInData.searchCriteria) {
      // Search in cached patient data
      patientId = await this.searchCachedPatients(checkInData.searchCriteria);
    }

    if (!patientId) {
      return { valid: false, error: 'Patient not found in offline cache' };
    }

    // Check for appointment
    const appointment = await this.findPatientAppointment(patientId);
    if (!appointment) {
      return { valid: false, error: 'No appointment found for today' };
    }

    return {
      valid: true,
      patientId,
      appointmentId: appointment.id
    };
  }

  private async performOfflineFaceRecognition(_photo: ImageData): Promise<PatientId | null> {
    void _photo;
    // Mock offline face recognition using cached encodings
    const cachedEncodings = Array.from(this.cachedData.faceEncodings.entries());

    if (cachedEncodings.length === 0) {
      return null;
    }

    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 500));

    // Return first patient as mock recognition result
    return cachedEncodings[0][0];
  }

  private async searchCachedPatients(searchCriteria: unknown): Promise<PatientId | null> {
    const criteria = searchCriteria as { name?: string; phoneNumber?: string };

    for (const [patientId, patient] of this.cachedData.patients.entries()) {
      const record = patient as { name?: string; phoneNumber?: string };

      if (criteria.name && record.name?.toLowerCase().includes(criteria.name.toLowerCase())) {
        return patientId;
      }
      if (criteria.phoneNumber && record.phoneNumber === criteria.phoneNumber) {
        return patientId;
      }
    }
    return null;
  }

  private async findPatientAppointment(patientId: PatientId): Promise<unknown | null> {
    const today = new Date().toDateString();

    for (const appointment of this.cachedData.appointments.values()) {
      if (appointment.patientId === patientId &&
          new Date(appointment.scheduledTime).toDateString() === today) {
        return appointment;
      }
    }
    return null;
  }

  private async getOfflineQueuePosition(): Promise<number> {
    // Get current offline check-ins count
    const offlineCheckIns = await this.getOfflineCheckIns();
    return offlineCheckIns.length + 1;
  }

  private async getOfflineCheckIns(): Promise<StoredCheckIn[]> {
    const stored = localStorage.getItem('offline_checkins');
    return stored ? (JSON.parse(stored) as StoredCheckIn[]) : [];
  }

  private async storeOfflineCheckIn(checkIn: unknown): Promise<void> {
    const existing = await this.getOfflineCheckIns();
    existing.push(checkIn as StoredCheckIn);
    localStorage.setItem('offline_checkins', JSON.stringify(existing));
  }

  private async updateOfflineCheckInStatus(checkInId: string, status: string): Promise<void> {
    const checkIns = await this.getOfflineCheckIns();
    const updated = checkIns.map(checkIn =>
      checkIn.id === checkInId ? { ...checkIn, syncStatus: status } : checkIn
    );
    localStorage.setItem('offline_checkins', JSON.stringify(updated));
  }

  private async trackOfflineAnalytics(eventType: string, data: unknown): Promise<void> {
    await this.queueForSync('analytics', {
      eventType,
      eventCategory: 'offline',
      eventData: data,
      timestamp: new Date()
    }, 'low');
  }

  // Data persistence
  private async loadCachedData(): Promise<void> {
    try {
      const stored = localStorage.getItem('cached_data');
      if (stored) {
        const data = JSON.parse(stored);
        this.cachedData = {
          patients: new Map(data.patients || []),
          appointments: new Map(data.appointments || []),
          exercises: new Map(data.exercises || []),
          faceEncodings: new Map(data.faceEncodings || []),
          lastUpdated: new Date(data.lastUpdated || Date.now())
        };
      }
    } catch (error) {
      logger.error('Failed to load cached data.', { context: 'checkin.offline.storage', data: { error } });
    }
  }

  private async saveCachedData(): Promise<void> {
    try {
      const data = {
        patients: Array.from(this.cachedData.patients.entries()),
        appointments: Array.from(this.cachedData.appointments.entries()),
        exercises: Array.from(this.cachedData.exercises.entries()),
        faceEncodings: Array.from(this.cachedData.faceEncodings.entries()),
        lastUpdated: this.cachedData.lastUpdated
      };
      localStorage.setItem('cached_data', JSON.stringify(data));
    } catch (error) {
      logger.error('Failed to save cached data.', { context: 'checkin.offline.storage', data: { error } });
    }
  }

  private async loadOfflineQueue(): Promise<void> {
    try {
      const stored = localStorage.getItem('offline_queue');
      if (stored) {
        this.offlineQueue = JSON.parse(stored).map((item: unknown) => ({
          ...item,
          timestamp: new Date(item.timestamp)
        }));
      }
    } catch (error) {
      logger.error('Failed to load offline queue.', { context: 'checkin.offline.queue', data: { error } });
    }
  }

  private async saveOfflineQueue(): Promise<void> {
    try {
      localStorage.setItem('offline_queue', JSON.stringify(this.offlineQueue));
    } catch (error) {
      logger.error('Failed to save offline queue.', { context: 'checkin.offline.queue', data: { error } });
    }
  }

  // Utility methods
  private generateId(): string {
    return `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private sortQueueByPriority(): void {
    const priorityOrder = { critical: 4, high: 3, normal: 2, low: 1 };
    this.offlineQueue.sort((a, b) => {
      const aPriority = priorityOrder[a.priority];
      const bPriority = priorityOrder[b.priority];
      if (aPriority !== bPriority) {
        return bPriority - aPriority;
      }
      return a.timestamp.getTime() - b.timestamp.getTime();
    });
  }

  private removeFromQueue(itemId: string): void {
    this.offlineQueue = this.offlineQueue.filter(item => item.id !== itemId);
  }

  private isCacheValid(cachedAt: Date): boolean {
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours
    return Date.now() - cachedAt.getTime() < maxAge;
  }

  private async compressData(data: unknown): Promise<{ compressed: true; data: string } | unknown> {
    if (!this.config.compressionEnabled) return data;

    // Simple compression - in production use proper compression library
    return {
      compressed: true,
      data: JSON.stringify(data)
    };
  }

  private async decompressData(data: unknown): Promise<unknown> {
    const maybe = data as { compressed?: boolean; data?: string };
    if (!maybe?.compressed) return data;
    return JSON.parse(maybe.data ?? 'null');
  }

  private startPeriodicSync(): void {
    setInterval(() => {
      if (this.isOnline && this.offlineQueue.length > 0) {
        this.startSync();
      }
    }, this.config.syncInterval);
  }

  // Status and notifications
  getSyncStatus(): SyncStatus {
    return {
      isOnline: this.isOnline,
      lastSyncTime: this.lastSyncTime,
      pendingItems: this.offlineQueue.length,
      failedItems: this.offlineQueue.filter(item => item.retryCount >= item.maxRetries).length,
      syncInProgress: this.syncInProgress
    };
  }

  onStatusChange(callback: SyncStatusCallback): () => void {
    this.syncCallbacks.add(callback);
    return () => this.syncCallbacks.delete(callback);
  }

  private notifyStatusChange(): void {
    const status = this.getSyncStatus();
    this.syncCallbacks.forEach(callback => {
      try {
        callback(status);
      } catch (error) {
        logger.error('Error in sync status callback.', { context: 'checkin.offline.sync', data: { error } });
      }
    });
  }

  // Public API methods
  async clearCache(): Promise<void> {
    this.cachedData = {
      patients: new Map(),
      appointments: new Map(),
      exercises: new Map(),
      faceEncodings: new Map(),
      lastUpdated: new Date()
    };
    await this.saveCachedData();
    logger.info('Offline cache cleared.', { context: 'checkin.offline.cache' });
  }

  async clearOfflineQueue(): Promise<void> {
    this.offlineQueue = [];
    await this.saveOfflineQueue();
    logger.info('Offline queue cleared.', { context: 'checkin.offline.queue' });
  }

  async forceSync(): Promise<void> {
    if (this.isOnline) {
      await this.startSync();
    } else {
      logger.warn('Cannot force sync while offline.', { context: 'checkin.offline.sync' });
    }
  }

  async preloadCriticalData(patientIds: PatientId[]): Promise<void> {
    logger.info(`Preloading critical data for ${patientIds.length} patients.`, {
      context: 'checkin.offline.cache',
      data: { count: patientIds.length },
    });

    // In production, this would fetch from API
    const mockPatients = patientIds.map(id => ({
      id,
      name: `Patient ${id}`,
      phoneNumber: '+5511999999999',
      dateOfBirth: '1990-01-01'
    }));

    const mockAppointments = patientIds.map(id => ({
      id: `apt-${id}`,
      patientId: id,
      scheduledTime: new Date(),
      type: 'therapy_session',
      status: 'scheduled'
    }));

    await this.cachePatientData(mockPatients);
    await this.cacheAppointmentData(mockAppointments);

    logger.info('Critical data preloaded successfully.', { context: 'checkin.offline.cache' });
  }

  getStats(): {
    cacheSize: number;
    queueSize: number;
    cacheHitRate: number;
    syncSuccessRate: number;
    lastSyncTime: Date | null;
  } {
    const cacheSize =
      this.cachedData.patients.size +
      this.cachedData.appointments.size +
      this.cachedData.exercises.size +
      this.cachedData.faceEncodings.size;

    return {
      cacheSize,
      queueSize: this.offlineQueue.length,
      cacheHitRate: 85, // Mock percentage
      syncSuccessRate: 92, // Mock percentage
      lastSyncTime: this.lastSyncTime
    };
  }
}
