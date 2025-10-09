export class OfflineManager {
    constructor(config = {}) {
        this.offlineQueue = [];
        this.isOnline = navigator.onLine;
        this.syncInProgress = false;
        this.lastSyncTime = null;
        this.syncCallbacks = new Set();
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
    async initializeOfflineCapabilities() {
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
    async queueForSync(type, data, priority = 'normal') {
        const item = {
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
            this.offlineQueue = this.offlineQueue.filter(item => item.priority !== 'low').slice(-(this.config.maxQueueSize - 1));
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
    async processCheckInOffline(checkInData) {
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
                patientId: validationResult.patientId,
                appointmentId: validationResult.appointmentId,
                checkInTime: new Date(),
                method: (checkInData.photo ? 'facial_recognition' : 'manual_search'),
                deviceId: checkInData.deviceId,
                healthScreeningPassed: true,
                status: 'completed',
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
        }
        catch (error) {
            console.error('Offline check-in failed:', error);
            return {
                success: false,
                error: `Offline check-in failed: ${error}`
            };
        }
    }
    // Data caching and retrieval
    async cachePatientData(patients) {
        patients.forEach(patient => {
            this.cachedData.patients.set(patient.id, {
                ...patient,
                cachedAt: new Date()
            });
        });
        await this.saveCachedData();
        console.log(`Cached ${patients.length} patients for offline use`);
    }
    async cacheAppointmentData(appointments) {
        appointments.forEach(appointment => {
            this.cachedData.appointments.set(appointment.id, {
                ...appointment,
                cachedAt: new Date()
            });
        });
        await this.saveCachedData();
        console.log(`Cached ${appointments.length} appointments for offline use`);
    }
    async getCachedPatient(patientId) {
        const patient = this.cachedData.patients.get(patientId);
        if (patient && this.isCacheValid(patient.cachedAt)) {
            return patient;
        }
        return null;
    }
    async getCachedAppointment(appointmentId) {
        const appointment = this.cachedData.appointments.get(appointmentId);
        if (appointment && this.isCacheValid(appointment.cachedAt)) {
            return appointment;
        }
        return null;
    }
    // Synchronization
    async startSync() {
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
                }
                else {
                    item.retryCount++;
                    if (item.retryCount >= item.maxRetries) {
                        console.warn(`Item ${item.id} exceeded max retries, removing from queue`);
                        this.removeFromQueue(item.id);
                        failedCount++;
                    }
                }
            }
            catch (error) {
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
    async syncItem(item) {
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
    async syncCheckIn(data) {
        try {
            // In production, this would call the actual check-in API
            console.log('Syncing offline check-in to server:', data.offlineCheckIn.id);
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            // Update local storage to reflect sync
            await this.updateOfflineCheckInStatus(data.offlineCheckIn.id, 'synced');
            return true;
        }
        catch (error) {
            console.error('Failed to sync check-in:', error);
            return false;
        }
    }
    async syncAnalytics(data) {
        try {
            console.log('Syncing analytics event:', data.eventType);
            // In production, send to analytics service
            await new Promise(resolve => setTimeout(resolve, 500));
            return true;
        }
        catch (error) {
            console.error('Failed to sync analytics:', error);
            return false;
        }
    }
    async syncNotification(data) {
        try {
            console.log('Syncing notification:', data.type);
            // In production, send via notification service
            await new Promise(resolve => setTimeout(resolve, 300));
            return true;
        }
        catch (error) {
            console.error('Failed to sync notification:', error);
            return false;
        }
    }
    async syncProgress(data) {
        try {
            console.log('Syncing progress data:', data.patientId);
            // In production, update patient progress
            await new Promise(resolve => setTimeout(resolve, 800));
            return true;
        }
        catch (error) {
            console.error('Failed to sync progress:', error);
            return false;
        }
    }
    // Validation and utilities
    async validateOfflineCheckIn(checkInData) {
        // Check if patient exists in cache
        let patientId = null;
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
    async performOfflineFaceRecognition(photo) {
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
    async searchCachedPatients(searchCriteria) {
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
    async findPatientAppointment(patientId) {
        const today = new Date().toDateString();
        for (const appointment of this.cachedData.appointments.values()) {
            if (appointment.patientId === patientId &&
                new Date(appointment.scheduledTime).toDateString() === today) {
                return appointment;
            }
        }
        return null;
    }
    async getOfflineQueuePosition() {
        // Get current offline check-ins count
        const offlineCheckIns = await this.getOfflineCheckIns();
        return offlineCheckIns.length + 1;
    }
    async getOfflineCheckIns() {
        const stored = localStorage.getItem('offline_checkins');
        return stored ? JSON.parse(stored) : [];
    }
    async storeOfflineCheckIn(checkIn) {
        const existing = await this.getOfflineCheckIns();
        existing.push(checkIn);
        localStorage.setItem('offline_checkins', JSON.stringify(existing));
    }
    async updateOfflineCheckInStatus(checkInId, status) {
        const checkIns = await this.getOfflineCheckIns();
        const updated = checkIns.map(checkIn => checkIn.id === checkInId ? { ...checkIn, syncStatus: status } : checkIn);
        localStorage.setItem('offline_checkins', JSON.stringify(updated));
    }
    async trackOfflineAnalytics(eventType, data) {
        await this.queueForSync('analytics', {
            eventType,
            eventCategory: 'offline',
            eventData: data,
            timestamp: new Date()
        }, 'low');
    }
    // Data persistence
    async loadCachedData() {
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
        }
        catch (error) {
            console.error('Failed to load cached data:', error);
        }
    }
    async saveCachedData() {
        try {
            const data = {
                patients: Array.from(this.cachedData.patients.entries()),
                appointments: Array.from(this.cachedData.appointments.entries()),
                exercises: Array.from(this.cachedData.exercises.entries()),
                faceEncodings: Array.from(this.cachedData.faceEncodings.entries()),
                lastUpdated: this.cachedData.lastUpdated
            };
            localStorage.setItem('cached_data', JSON.stringify(data));
        }
        catch (error) {
            console.error('Failed to save cached data:', error);
        }
    }
    async loadOfflineQueue() {
        try {
            const stored = localStorage.getItem('offline_queue');
            if (stored) {
                this.offlineQueue = JSON.parse(stored).map((item) => ({
                    ...item,
                    timestamp: new Date(item.timestamp)
                }));
            }
        }
        catch (error) {
            console.error('Failed to load offline queue:', error);
        }
    }
    async saveOfflineQueue() {
        try {
            localStorage.setItem('offline_queue', JSON.stringify(this.offlineQueue));
        }
        catch (error) {
            console.error('Failed to save offline queue:', error);
        }
    }
    // Utility methods
    generateId() {
        return `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    sortQueueByPriority() {
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
    removeFromQueue(itemId) {
        this.offlineQueue = this.offlineQueue.filter(item => item.id !== itemId);
    }
    isCacheValid(cachedAt) {
        const maxAge = 24 * 60 * 60 * 1000; // 24 hours
        return Date.now() - cachedAt.getTime() < maxAge;
    }
    async compressData(data) {
        if (!this.config.compressionEnabled)
            return data;
        // Simple compression - in production use proper compression library
        return {
            compressed: true,
            data: JSON.stringify(data)
        };
    }
    async decompressData(data) {
        if (!data.compressed)
            return data;
        return JSON.parse(data.data);
    }
    startPeriodicSync() {
        setInterval(() => {
            if (this.isOnline && this.offlineQueue.length > 0) {
                this.startSync();
            }
        }, this.config.syncInterval);
    }
    // Status and notifications
    getSyncStatus() {
        return {
            isOnline: this.isOnline,
            lastSyncTime: this.lastSyncTime,
            pendingItems: this.offlineQueue.length,
            failedItems: this.offlineQueue.filter(item => item.retryCount >= item.maxRetries).length,
            syncInProgress: this.syncInProgress
        };
    }
    onStatusChange(callback) {
        this.syncCallbacks.add(callback);
        return () => this.syncCallbacks.delete(callback);
    }
    notifyStatusChange() {
        const status = this.getSyncStatus();
        this.syncCallbacks.forEach(callback => {
            try {
                callback(status);
            }
            catch (error) {
                console.error('Error in sync status callback:', error);
            }
        });
    }
    // Public API methods
    async clearCache() {
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
    async clearOfflineQueue() {
        this.offlineQueue = [];
        await this.saveOfflineQueue();
        console.log('Offline queue cleared');
    }
    async forceSync() {
        if (this.isOnline) {
            await this.startSync();
        }
        else {
            console.warn('Cannot force sync while offline');
        }
    }
    async preloadCriticalData(patientIds) {
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
    getStats() {
        const cacheSize = this.cachedData.patients.size +
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
