import { CalendarFactory } from './CalendarFactory';
// Mock Queue implementation (replace with Bull, BullMQ, or similar in production)
class MockQueue {
    constructor(name, config) {
        this.jobs = new Map();
        this.processors = new Map();
        this.config = config;
    }
    async add(jobType, data, options = {}) {
        const jobId = `${jobType}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const job = {
            id: jobId,
            type: jobType,
            appointmentId: data.appointmentId,
            patientEmail: data.patientEmail,
            providerPreference: data.providerPreference,
            metadata: data.metadata || {},
            attempts: 0,
            priority: options.priority || 5,
            createdAt: new Date(),
            scheduledFor: options.delay ? new Date(Date.now() + options.delay) : new Date()
        };
        this.jobs.set(jobId, job);
        // Schedule processing
        const delay = Math.max(0, (job.scheduledFor?.getTime() || 0) - Date.now());
        setTimeout(() => this.processJob(jobId), delay);
        return jobId;
    }
    process(jobType, processor) {
        this.processors.set(jobType, processor);
    }
    async processJob(jobId) {
        const job = this.jobs.get(jobId);
        if (!job)
            return;
        const processor = this.processors.get(job.type);
        if (!processor) {
            console.error(`No processor found for job type: ${job.type}`);
            return;
        }
        try {
            job.attempts++;
            const result = await processor(job);
            if (result.success) {
                console.log(`Job ${jobId} completed successfully in ${result.duration}ms`);
                this.jobs.delete(jobId);
            }
            else if (result.retryable && job.attempts < 3) {
                // Retry with exponential backoff
                const delay = Math.pow(2, job.attempts) * 1000;
                job.scheduledFor = new Date(Date.now() + delay);
                console.warn(`Job ${jobId} failed, retrying in ${delay}ms (attempt ${job.attempts})`);
                setTimeout(() => this.processJob(jobId), delay);
            }
            else {
                console.error(`Job ${jobId} failed permanently:`, result.error);
                this.jobs.delete(jobId);
            }
        }
        catch (error) {
            console.error(`Error processing job ${jobId}:`, error);
            this.jobs.delete(jobId);
        }
    }
    getJobStats() {
        const jobs = Array.from(this.jobs.values());
        return {
            pending: jobs.filter(j => j.attempts === 0).length,
            processing: jobs.filter(j => j.attempts > 0).length,
            completed: 0, // Would track completed jobs if we kept them
            failed: 0 // Would track failed jobs if we kept them
        };
    }
}
export class CalendarQueue {
    constructor(config) {
        this.queue = new MockQueue('calendar-operations', config);
        this.retryPolicy = {
            maxAttempts: 3,
            backoffStrategy: 'exponential',
            baseDelay: 1000,
            maxDelay: 30000
        };
        this.setupProcessors();
    }
    async addCalendarInvite(appointment) {
        const patient = await this.getPatientById(appointment.patientId);
        const preferences = await this.getCalendarPreferences(appointment.patientId);
        return await this.queue.add('send-invite', {
            appointmentId: appointment.id,
            patientEmail: patient?.email,
            providerPreference: preferences?.preferredProvider || 'ics',
            metadata: {
                appointmentTitle: appointment.title,
                appointmentType: appointment.type,
                patientName: appointment.patientName,
                therapistId: appointment.therapistId
            }
        }, {
            delay: 0,
            priority: appointment.type === 'Urgente' ? 1 : 5
        });
    }
    async updateCalendarInvite(appointmentId, changes) {
        const integration = await this.getCalendarIntegration(appointmentId);
        return await this.queue.add('update-invite', {
            appointmentId,
            metadata: {
                externalEventId: integration?.externalEventId,
                changes,
                provider: integration?.provider
            }
        }, {
            priority: 3
        });
    }
    async cancelCalendarInvite(appointmentId) {
        const integration = await this.getCalendarIntegration(appointmentId);
        return await this.queue.add('cancel-invite', {
            appointmentId,
            metadata: {
                externalEventId: integration?.externalEventId,
                provider: integration?.provider
            }
        }, {
            priority: 2
        });
    }
    async syncAvailability(therapistId, timeRange) {
        return await this.queue.add('sync-availability', {
            appointmentId: '', // Not applicable for availability sync
            metadata: {
                therapistId,
                timeRange
            }
        }, {
            priority: 4,
            delay: 5000 // Small delay to batch requests
        });
    }
    setupProcessors() {
        this.queue.process('send-invite', this.processSendInvite.bind(this));
        this.queue.process('update-invite', this.processUpdateInvite.bind(this));
        this.queue.process('cancel-invite', this.processCancelInvite.bind(this));
        this.queue.process('sync-availability', this.processSyncAvailability.bind(this));
    }
    async processSendInvite(job) {
        const startTime = Date.now();
        try {
            const appointment = await this.getAppointmentById(job.appointmentId);
            if (!appointment) {
                throw new Error(`Appointment ${job.appointmentId} not found`);
            }
            const patient = await this.getPatientById(appointment.patientId);
            if (!patient?.email) {
                throw new Error(`Patient email not found for appointment ${job.appointmentId}`);
            }
            const preferences = await this.getCalendarPreferences(appointment.patientId);
            const provider = job.providerPreference || preferences?.preferredProvider || 'ics';
            // Get calendar service
            const calendarService = CalendarFactory.create(provider, await this.getProviderConfig(provider));
            // Create calendar event
            const calendarEvent = this.mapAppointmentToCalendarEvent(appointment, patient);
            const result = await calendarService.createEvent(calendarEvent);
            if (result.success) {
                // Save integration record
                await this.saveCalendarIntegration({
                    appointmentId: appointment.id,
                    patientId: appointment.patientId,
                    provider,
                    externalEventId: result.eventId,
                    status: 'sent',
                    attempts: job.attempts,
                    metadata: { jobId: job.id }
                });
                return {
                    success: true,
                    eventId: result.eventId,
                    retryable: false,
                    duration: Date.now() - startTime
                };
            }
            else {
                return {
                    success: false,
                    error: result.error?.message || 'Unknown error',
                    retryable: result.retryable,
                    duration: Date.now() - startTime
                };
            }
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                retryable: true,
                duration: Date.now() - startTime
            };
        }
    }
    async processUpdateInvite(job) {
        const startTime = Date.now();
        try {
            const { externalEventId, provider, changes } = job.metadata;
            if (!externalEventId || !provider) {
                throw new Error('Missing external event ID or provider information');
            }
            const calendarService = CalendarFactory.create(provider, await this.getProviderConfig(provider));
            // Convert appointment changes to calendar event changes
            const eventChanges = this.mapAppointmentChangesToCalendarEvent(changes);
            const result = await calendarService.updateEvent(externalEventId, eventChanges);
            if (result.success) {
                await this.updateCalendarIntegrationStatus(job.appointmentId, 'sent', job.attempts);
                return {
                    success: true,
                    eventId: result.eventId,
                    retryable: false,
                    duration: Date.now() - startTime
                };
            }
            else {
                return {
                    success: false,
                    error: result.error?.message || 'Unknown error',
                    retryable: result.retryable,
                    duration: Date.now() - startTime
                };
            }
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                retryable: true,
                duration: Date.now() - startTime
            };
        }
    }
    async processCancelInvite(job) {
        const startTime = Date.now();
        try {
            const { externalEventId, provider } = job.metadata;
            if (!externalEventId || !provider) {
                throw new Error('Missing external event ID or provider information');
            }
            const calendarService = CalendarFactory.create(provider, await this.getProviderConfig(provider));
            const result = await calendarService.deleteEvent(externalEventId);
            if (result.success) {
                await this.updateCalendarIntegrationStatus(job.appointmentId, 'cancelled', job.attempts);
                return {
                    success: true,
                    retryable: false,
                    duration: Date.now() - startTime
                };
            }
            else {
                return {
                    success: false,
                    error: result.error?.message || 'Unknown error',
                    retryable: result.retryable,
                    duration: Date.now() - startTime
                };
            }
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                retryable: true,
                duration: Date.now() - startTime
            };
        }
    }
    async processSyncAvailability(job) {
        const startTime = Date.now();
        try {
            const { therapistId, timeRange } = job.metadata;
            // This would sync therapist availability with external calendars
            // Implementation depends on your specific requirements
            return {
                success: true,
                retryable: false,
                duration: Date.now() - startTime
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                retryable: true,
                duration: Date.now() - startTime
            };
        }
    }
    // Helper methods (these would integrate with your existing services)
    async getAppointmentById(id) {
        // Mock implementation - replace with actual data service
        return null;
    }
    async getPatientById(id) {
        // Mock implementation - replace with actual data service
        return null;
    }
    async getCalendarPreferences(patientId) {
        // Mock implementation - replace with actual data service
        return null;
    }
    async getCalendarIntegration(appointmentId) {
        // Mock implementation - replace with actual data service
        return null;
    }
    async getProviderConfig(provider) {
        // Mock implementation - replace with actual config service
        return {};
    }
    async saveCalendarIntegration(integration) {
        // Mock implementation - replace with actual data service
    }
    async updateCalendarIntegrationStatus(appointmentId, status, attempts) {
        // Mock implementation - replace with actual data service
    }
    mapAppointmentToCalendarEvent(appointment, patient) {
        return {
            title: appointment.title,
            description: `Consulta de ${appointment.type}\nPaciente: ${appointment.patientName}`,
            startTime: appointment.startTime,
            endTime: appointment.endTime,
            location: { name: 'DuduFisio - Clínica de Fisioterapia' },
            attendees: [{ email: patient.email, name: patient.name }],
            reminders: [
                { method: 'email', minutesBefore: 24 * 60 }, // 1 day before
                { method: 'email', minutesBefore: 60 } // 1 hour before
            ],
            metadata: {
                appointmentId: appointment.id,
                appointmentType: appointment.type,
                patientId: appointment.patientId
            }
        };
    }
    mapAppointmentChangesToCalendarEvent(changes) {
        const eventChanges = {};
        if (changes.title)
            eventChanges.title = changes.title;
        if (changes.startTime)
            eventChanges.startTime = changes.startTime;
        if (changes.endTime)
            eventChanges.endTime = changes.endTime;
        if (changes.observations) {
            eventChanges.description = `${eventChanges.description || ''}\n\nObservações: ${changes.observations}`;
        }
        return eventChanges;
    }
    getQueueStats() {
        return this.queue.getJobStats();
    }
}
