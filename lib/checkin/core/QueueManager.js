class PriorityQueue {
    constructor(compareFn) {
        this.compareFn = compareFn;
        this.items = [];
    }
    enqueue(item) {
        this.items.push(item);
        this.items.sort(this.compareFn);
    }
    dequeue() {
        return this.items.shift();
    }
    peek() {
        return this.items[0];
    }
    getPosition(item) {
        return this.items.indexOf(item) + 1;
    }
    remove(item) {
        const index = this.items.indexOf(item);
        if (index > -1) {
            this.items.splice(index, 1);
            return true;
        }
        return false;
    }
    size() {
        return this.items.length;
    }
    toArray() {
        return [...this.items];
    }
}
export class QueuePositionImpl {
    constructor(position, estimatedWaitTime) {
        this.position = position;
        this.estimatedWaitTime = estimatedWaitTime;
    }
}
class WaitTimePredictor {
    constructor(historicalData = []) {
        this.historicalData = historicalData;
    }
    async predict(position, estimatedDuration) {
        if (position <= 1)
            return 0;
        // Base calculation: sum of estimated durations for patients ahead
        let totalWaitTime = 0;
        // Add buffer for processing between patients (5 minutes)
        const processingBuffer = 5;
        // Calculate based on position and average session duration
        const avgSessionDuration = this.getAverageSessionDuration();
        totalWaitTime = (position - 1) * (avgSessionDuration + processingBuffer);
        // Apply day-of-week and time-of-day adjustments
        const timeAdjustment = this.getTimeAdjustmentFactor();
        totalWaitTime *= timeAdjustment;
        // Add random variation (±20%)
        const variation = 0.8 + (Math.random() * 0.4);
        totalWaitTime *= variation;
        return Math.round(totalWaitTime);
    }
    getAverageSessionDuration() {
        if (this.historicalData.length === 0)
            return 30; // Default 30 minutes
        const totalDuration = this.historicalData.reduce((sum, session) => sum + session.duration, 0);
        return totalDuration / this.historicalData.length;
    }
    getTimeAdjustmentFactor() {
        const now = new Date();
        const hour = now.getHours();
        const dayOfWeek = now.getDay();
        // Peak hours adjustment
        if (hour >= 9 && hour <= 11)
            return 1.2; // Morning rush
        if (hour >= 14 && hour <= 16)
            return 1.15; // Afternoon rush
        if (hour >= 18 && hour <= 19)
            return 1.1; // Evening appointments
        // Weekend adjustment
        if (dayOfWeek === 0 || dayOfWeek === 6)
            return 0.9; // Less busy on weekends
        return 1.0;
    }
}
export class QueueManager {
    constructor(config) {
        this.config = config;
        this.queue = new PriorityQueue((a, b) => this.calculatePriority(b) - this.calculatePriority(a));
        this.waitTimePredictor = new WaitTimePredictor(config.historicalData);
    }
    async addToQueue(checkIn) {
        const entry = {
            checkIn,
            priority: this.calculatePriority(checkIn),
            estimatedDuration: await this.estimateSessionDuration(checkIn),
            addedAt: new Date()
        };
        this.queue.enqueue(entry);
        const position = this.queue.getPosition(entry);
        const estimatedWaitTime = await this.waitTimePredictor.predict(position, entry.estimatedDuration);
        // Update check-in with queue information
        checkIn.queuePosition = position;
        checkIn.estimatedWaitTime = estimatedWaitTime;
        // Notify patient about position
        await this.notifyPatientPosition(checkIn.patientId, position, estimatedWaitTime);
        return new QueuePositionImpl(position, estimatedWaitTime);
    }
    async removeFromQueue(patientId) {
        const entry = this.queue.toArray().find(e => e.checkIn.patientId === patientId);
        if (entry) {
            const removed = this.queue.remove(entry);
            if (removed) {
                await this.updateQueuePositions();
                return true;
            }
        }
        return false;
    }
    async getNext() {
        const entry = this.queue.dequeue();
        if (entry) {
            await this.updateQueuePositions();
            return entry.checkIn;
        }
        return null;
    }
    getQueueStatus() {
        const entries = this.queue.toArray();
        return {
            totalPatients: entries.length,
            averageWaitTime: this.calculateAverageWaitTime(entries),
            nextPatient: entries[0]?.checkIn || null,
            queue: entries.map((entry, index) => ({
                position: index + 1,
                patientId: entry.checkIn.patientId,
                estimatedWaitTime: entry.estimatedDuration,
                priority: entry.priority,
                checkInTime: entry.checkIn.checkInTime
            }))
        };
    }
    calculatePriority(checkIn) {
        const weights = this.config.priorityWeights;
        let priority = 0;
        const checkInData = 'checkIn' in checkIn ? checkIn.checkIn : checkIn;
        // Priority by appointment type
        if (checkInData.additionalData?.appointmentType === 'emergency') {
            priority += weights.emergency;
        }
        else if (checkInData.additionalData?.appointmentType === 'follow_up') {
            priority += weights.followUp;
        }
        else if (checkInData.additionalData?.isFirstTime) {
            priority += weights.firstTime;
        }
        // Priority by delay
        const scheduledTime = checkInData.additionalData?.scheduledTime;
        if (scheduledTime) {
            const delay = Date.now() - new Date(scheduledTime).getTime();
            if (delay > 0) {
                const delayMinutes = delay / (1000 * 60);
                priority += Math.min(delayMinutes * weights.delay, weights.delay * 30);
            }
        }
        // Priority by age (elderly patients first)
        const patientAge = checkInData.additionalData?.patientAge;
        if (patientAge && patientAge >= 65) {
            priority += weights.age;
        }
        // Priority by special needs
        if (checkInData.additionalData?.hasSpecialNeeds) {
            priority += 50;
        }
        // Time-based priority (longer waiting = higher priority)
        const waitingTime = Date.now() - checkInData.checkInTime.getTime();
        const waitingMinutes = waitingTime / (1000 * 60);
        priority += waitingMinutes * 0.5; // 0.5 points per minute
        return priority;
    }
    async estimateSessionDuration(checkIn) {
        // Base duration by appointment type
        let duration = 30; // Default 30 minutes
        switch (checkIn.additionalData?.appointmentType) {
            case 'initial_evaluation':
                duration = 60;
                break;
            case 'follow_up':
                duration = 30;
                break;
            case 'therapy_session':
                duration = 45;
                break;
            case 'group_session':
                duration = 60;
                break;
            case 'emergency':
                duration = 20;
                break;
        }
        // Adjust for patient history
        if (checkIn.additionalData?.isFirstTime) {
            duration += 15; // First-time patients take longer
        }
        // Adjust for complexity
        const complexity = checkIn.additionalData?.treatmentComplexity;
        if (complexity === 'high') {
            duration += 20;
        }
        else if (complexity === 'low') {
            duration -= 10;
        }
        return Math.max(duration, 15); // Minimum 15 minutes
    }
    async notifyPatientPosition(patientId, position, estimatedWaitTime) {
        // Mock notification - in production, this would send push notification or SMS
        console.log(`Notifying patient ${patientId}: Position ${position}, estimated wait: ${estimatedWaitTime} minutes`);
    }
    async updateQueuePositions() {
        const entries = this.queue.toArray();
        for (let i = 0; i < entries.length; i++) {
            const entry = entries[i];
            const newPosition = i + 1;
            const newEstimatedWaitTime = await this.waitTimePredictor.predict(newPosition, entry.estimatedDuration);
            entry.checkIn.queuePosition = newPosition;
            entry.checkIn.estimatedWaitTime = newEstimatedWaitTime;
            // Notify patient of updated position
            await this.notifyPatientPosition(entry.checkIn.patientId, newPosition, newEstimatedWaitTime);
        }
    }
    calculateAverageWaitTime(entries) {
        if (entries.length === 0)
            return 0;
        const totalWaitTime = entries.reduce((sum, entry, index) => {
            return sum + (entry.estimatedDuration * index);
        }, 0);
        return Math.round(totalWaitTime / entries.length);
    }
    async processNextPatient() {
        const nextCheckIn = await this.getNext();
        if (nextCheckIn) {
            // Mark as being processed
            nextCheckIn.status = 'completed';
            // Update estimated durations based on actual processing time
            this.updateEstimationModel(nextCheckIn);
            return nextCheckIn;
        }
        return null;
    }
    updateEstimationModel(checkIn) {
        // Update the wait time predictor with actual data
        const actualDuration = checkIn.additionalData?.actualDuration;
        if (actualDuration) {
            // In production, this would update the ML model or statistical model
            console.log(`Updating estimation model: predicted vs actual duration`);
        }
    }
    getQueueLength() {
        return this.queue.size();
    }
    clear() {
        while (this.queue.size() > 0) {
            this.queue.dequeue();
        }
    }
}
