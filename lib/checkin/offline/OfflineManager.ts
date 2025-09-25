import {
  CheckInData,
  CheckInResult,
  PatientId,
  DeviceId
} from '../../../types/checkin';

interface OfflineQueueItem {
  id: string;
  type: 'checkin' | 'analytics' | 'notification' | 'progress';
  data: any;
  timestamp: Date;
  retryCount: number;
  maxRetries: number;
  priority: 'low' | 'normal' | 'high' | 'critical';
}

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
  patients: Map<PatientId, any>;
  appointments: Map<string, any>;
  exercises: Map<string, any>;
  faceEncodings: Map<PatientId, any>;
  lastUpdated: Date;
}

export class OfflineManager {
  private offlineQueue: OfflineQueueItem[] = [];
  private isOnline: boolean = navigator.onLine;
  private syncInProgress: boolean = false;
  private lastSyncTime: Date | null = null;
  private cachedData: CachedData;
  private config: OfflineConfig;
  private syncCallbacks = new Set<(status: SyncStatus) => void>();

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
      console.log('Network connection restored');
      this.isOnline = true;
      this.startSync();
    });

    window.addEventListener('offline', () => {
      console.log('Network connection lost - switching to offline mode');
      this.isOnline = false;
    });

    // Load cached data from IndexedDB
    await this.loadCachedData();

    // Load offline queue from localStorage
    await this.loadOfflineQueue();

    // Start periodic sync
    this.startPeriodicSync();

    console.log('Offline manager initialized');
  }

  // Offline queue management
  async queueForSync(
    type: OfflineQueueItem['type'],
    data: any,
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

    console.log(`Queued ${type} item for sync: ${item.id}`);

    // Try to sync immediately if online
    if (this.isOnline && !this.syncInProgress) {
      this.startSync();
    }

    return item.id;
  }

  async processCheckInOffline(checkInData: CheckInData): Promise<CheckInResult> {
    try {
      console.log('Processing check-in in offline mode');

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
        patientId: validationResult.patientId!,
        appointmentId: validationResult.appointmentId!,
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
      console.error('Offline check-in failed:', error);
      return {
        success: false,
        error: `Offline check-in failed: ${error}`
      };
    }
  }

  // Data caching and retrieval
  async cachePatientData(patients: any[]): Promise<void> {
    patients.forEach(patient => {
      this.cachedData.patients.set(patient.id, {
        ...patient,
        cachedAt: new Date()
      });
    });

    await this.saveCachedData();
    console.log(`Cached ${patients.length} patients for offline use`);
  }

  async cacheAppointmentData(appointments: any[]): Promise<void> {
    appointments.forEach(appointment => {
      this.cachedData.appointments.set(appointment.id, {
        ...appointment,
        cachedAt: new Date()
      });
    });

    await this.saveCachedData();
    console.log(`Cached ${appointments.length} appointments for offline use`);
  }

  async getCachedPatient(patientId: PatientId): Promise<any | null> {
    const patient = this.cachedData.patients.get(patientId);
    if (patient && this.isCacheValid(patient.cachedAt)) {
      return patient;
    }
    return null;
  }

  async getCachedAppointment(appointmentId: string): Promise<any | null> {
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

    console.log(`Starting sync with ${this.offlineQueue.length} items`);

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
            console.warn(`Item ${item.id} exceeded max retries, removing from queue`);
            this.removeFromQueue(item.id);
            failedCount++;
          }
        }
      } catch (error) {
        console.error(`Failed to sync item ${item.id}:`, error);
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

    console.log(`Sync completed: ${syncedCount} synced, ${failedCount} failed`);
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
        console.warn(`Unknown sync item type: ${item.type}`);
        return false;
    }
  }

  private async syncCheckIn(data: any): Promise<boolean> {
    try {
      // In production, this would call the actual check-in API
      console.log('Syncing offline check-in to server:', data.offlineCheckIn.id);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Update local storage to reflect sync
      await this.updateOfflineCheckInStatus(data.offlineCheckIn.id, 'synced');

      return true;
    } catch (error) {
      console.error('Failed to sync check-in:', error);
      return false;
    }
  }

  private async syncAnalytics(data: any): Promise<boolean> {
    try {
      console.log('Syncing analytics event:', data.eventType);
      // In production, send to analytics service
      await new Promise(resolve => setTimeout(resolve, 500));
      return true;
    } catch (error) {
      console.error('Failed to sync analytics:', error);
      return false;
    }
  }

  private async syncNotification(data: any): Promise<boolean> {
    try {
      console.log('Syncing notification:', data.type);
      // In production, send via notification service
      await new Promise(resolve => setTimeout(resolve, 300));
      return true;
    } catch (error) {
      console.error('Failed to sync notification:', error);
      return false;
    }
  }

  private async syncProgress(data: any): Promise<boolean> {
    try {
      console.log('Syncing progress data:', data.patientId);
      // In production, update patient progress
      await new Promise(resolve => setTimeout(resolve, 800));
      return true;
    } catch (error) {
      console.error('Failed to sync progress:', error);
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

  private async performOfflineFaceRecognition(photo: ImageData): Promise<PatientId | null> {
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

  private async searchCachedPatients(searchCriteria: any): Promise<PatientId | null> {
    for (const [patientId, patient] of this.cachedData.patients.entries()) {
      if (searchCriteria.name && patient.name?.toLowerCase().includes(searchCriteria.name.toLowerCase())) {
        return patientId;
      }
      if (searchCriteria.phoneNumber && patient.phoneNumber === searchCriteria.phoneNumber) {
        return patientId;
      }
    }
    return null;
  }

  private async findPatientAppointment(patientId: PatientId): Promise<any | null> {
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

  private async getOfflineCheckIns(): Promise<any[]> {
    const stored = localStorage.getItem('offline_checkins');
    return stored ? JSON.parse(stored) : [];
  }

  private async storeOfflineCheckIn(checkIn: any): Promise<void> {
    const existing = await this.getOfflineCheckIns();
    existing.push(checkIn);
    localStorage.setItem('offline_checkins', JSON.stringify(existing));
  }

  private async updateOfflineCheckInStatus(checkInId: string, status: string): Promise<void> {
    const checkIns = await this.getOfflineCheckIns();
    const updated = checkIns.map(checkIn =>
      checkIn.id === checkInId ? { ...checkIn, syncStatus: status } : checkIn
    );
    localStorage.setItem('offline_checkins', JSON.stringify(updated));
  }

  private async trackOfflineAnalytics(eventType: string, data: any): Promise<void> {
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
      console.error('Failed to load cached data:', error);
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
      console.error('Failed to save cached data:', error);
    }
  }

  private async loadOfflineQueue(): Promise<void> {
    try {
      const stored = localStorage.getItem('offline_queue');
      if (stored) {
        this.offlineQueue = JSON.parse(stored).map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp)
        }));
      }
    } catch (error) {
      console.error('Failed to load offline queue:', error);
    }
  }

  private async saveOfflineQueue(): Promise<void> {
    try {
      localStorage.setItem('offline_queue', JSON.stringify(this.offlineQueue));
    } catch (error) {
      console.error('Failed to save offline queue:', error);
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

  private async compressData(data: any): Promise<any> {
    if (!this.config.compressionEnabled) return data;

    // Simple compression - in production use proper compression library
    return {
      compressed: true,
      data: JSON.stringify(data)
    };
  }

  private async decompressData(data: any): Promise<any> {
    if (!data.compressed) return data;
    return JSON.parse(data.data);
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

  onStatusChange(callback: (status: SyncStatus) => void): () => void {
    this.syncCallbacks.add(callback);
    return () => this.syncCallbacks.delete(callback);
  }

  private notifyStatusChange(): void {
    const status = this.getSyncStatus();
    this.syncCallbacks.forEach(callback => {
      try {
        callback(status);
      } catch (error) {
        console.error('Error in sync status callback:', error);
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
    console.log('Cache cleared');
  }

  async clearOfflineQueue(): Promise<void> {
    this.offlineQueue = [];
    await this.saveOfflineQueue();
    console.log('Offline queue cleared');
  }

  async forceSync(): Promise<void> {
    if (this.isOnline) {
      await this.startSync();
    } else {
      console.warn('Cannot force sync while offline');
    }
  }

  async preloadCriticalData(patientIds: PatientId[]): Promise<void> {
    console.log(`Preloading critical data for ${patientIds.length} patients`);

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

    console.log('Critical data preloaded successfully');
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