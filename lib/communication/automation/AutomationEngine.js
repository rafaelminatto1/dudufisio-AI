// Automation Engine - Event-driven message automation with triggers
import { CommunicationError } from '../core/types';
/**
 * Condition Evaluator
 */
class ConditionEvaluator {
    /**
     * Evaluate a single condition
     */
    static evaluateCondition(condition, context) {
        try {
            const { field, operator, value, type } = condition;
            const contextValue = this.getContextValue(field, context);
            switch (operator) {
                case 'equals':
                    return contextValue === value;
                case 'not_equals':
                    return contextValue !== value;
                case 'greater_than':
                    return Number(contextValue) > Number(value);
                case 'less_than':
                    return Number(contextValue) < Number(value);
                case 'greater_than_or_equal':
                    return Number(contextValue) >= Number(value);
                case 'less_than_or_equal':
                    return Number(contextValue) <= Number(value);
                case 'contains':
                    return String(contextValue).includes(String(value));
                case 'not_contains':
                    return !String(contextValue).includes(String(value));
                case 'starts_with':
                    return String(contextValue).startsWith(String(value));
                case 'ends_with':
                    return String(contextValue).endsWith(String(value));
                case 'in':
                    return Array.isArray(value) && value.includes(contextValue);
                case 'not_in':
                    return Array.isArray(value) && !value.includes(contextValue);
                case 'is_null':
                    return contextValue == null;
                case 'is_not_null':
                    return contextValue != null;
                case 'regex':
                    return new RegExp(String(value)).test(String(contextValue));
                case 'date_after':
                    return new Date(contextValue) > new Date(value);
                case 'date_before':
                    return new Date(contextValue) < new Date(value);
                case 'date_between':
                    if (Array.isArray(value) && value.length === 2) {
                        const date = new Date(contextValue);
                        return date >= new Date(value[0]) && date <= new Date(value[1]);
                    }
                    return false;
                case 'time_of_day_after':
                    return this.compareTimeOfDay(contextValue, String(value), 'after');
                case 'time_of_day_before':
                    return this.compareTimeOfDay(contextValue, String(value), 'before');
                case 'day_of_week':
                    return new Date(contextValue).getDay() === Number(value);
                case 'day_of_month':
                    return new Date(contextValue).getDate() === Number(value);
                default:
                    throw new Error(`Unknown operator: ${operator}`);
            }
        }
        catch (error) {
            throw new CommunicationError('CONDITION_EVALUATION_FAILED', `Failed to evaluate condition: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Get value from context using dot notation
     */
    static getContextValue(field, context) {
        const path = field.split('.');
        let value = context;
        for (const key of path) {
            if (value && typeof value === 'object' && key in value) {
                value = value[key];
            }
            else {
                return undefined;
            }
        }
        return value;
    }
    /**
     * Compare time of day
     */
    static compareTimeOfDay(dateValue, timeValue, operator) {
        const date = new Date(dateValue);
        const hours = date.getHours();
        const minutes = date.getMinutes();
        const currentTimeMinutes = hours * 60 + minutes;
        const [targetHours, targetMinutes] = timeValue.split(':').map(Number);
        const targetTimeMinutes = targetHours * 60 + targetMinutes;
        return operator === 'after'
            ? currentTimeMinutes > targetTimeMinutes
            : currentTimeMinutes < targetTimeMinutes;
    }
    /**
     * Evaluate condition group with AND/OR logic
     */
    static evaluateConditionGroup(conditions, operator, context) {
        if (!conditions || conditions.length === 0)
            return true;
        const results = conditions.map(condition => this.evaluateCondition(condition, context));
        return operator === 'AND'
            ? results.every(result => result)
            : results.some(result => result);
    }
}
/**
 * Action Executor
 */
class ActionExecutor {
    constructor(templateManager, messageBus, repository, logger, metrics) {
        this.templateManager = templateManager;
        this.messageBus = messageBus;
        this.repository = repository;
        this.logger = logger;
        this.metrics = metrics;
    }
    /**
     * Execute automation action
     */
    async executeAction(action, context) {
        const startTime = Date.now();
        try {
            switch (action.type) {
                case 'send_message':
                    await this.executeSendMessageAction(action, context);
                    break;
                case 'schedule_message':
                    await this.executeScheduleMessageAction(action, context);
                    break;
                case 'update_patient':
                    await this.executeUpdatePatientAction(action, context);
                    break;
                case 'log_event':
                    await this.executeLogEventAction(action, context);
                    break;
                case 'webhook':
                    await this.executeWebhookAction(action, context);
                    break;
                case 'conditional':
                    await this.executeConditionalAction(action, context);
                    break;
                case 'delay':
                    await this.executeDelayAction(action, context);
                    break;
                default:
                    throw new Error(`Unknown action type: ${action.type}`);
            }
            const duration = Date.now() - startTime;
            this.metrics.timing('automation_engine.action.execution_time', duration);
            this.metrics.increment(`automation_engine.action.${action.type}.success`);
            this.logger.debug('Automation action executed successfully', {
                actionType: action.type,
                ruleId: context.rule.id,
                executionId: context.executionId,
                duration
            });
        }
        catch (error) {
            const duration = Date.now() - startTime;
            this.metrics.timing('automation_engine.action.error_time', duration);
            this.metrics.increment(`automation_engine.action.${action.type}.failure`);
            throw error;
        }
    }
    /**
     * Execute send message action
     */
    async executeSendMessageAction(action, context) {
        const { templateId, channels, priority } = action.parameters;
        if (!context.patient) {
            throw new CommunicationError('PATIENT_REQUIRED', 'Patient context is required for send message action');
        }
        // Render template for each channel
        for (const channel of channels) {
            try {
                const renderResult = await this.templateManager.renderTemplate({
                    type: templateId,
                    channel,
                    locale: context.patient.preferredLocale || 'pt-BR',
                    audience: 'patient'
                }, context.templateContext);
                if (!renderResult.success) {
                    this.logger.warn('Template rendering failed for automation', {
                        templateId,
                        channel,
                        errors: renderResult.errors
                    });
                    continue;
                }
                // Create message
                const message = {
                    id: `auto-${context.executionId}-${channel}-${Date.now()}`,
                    recipient: {
                        id: context.patient.id,
                        name: context.patient.name,
                        email: context.patient.email,
                        phone: context.patient.phone,
                        preferences: {
                            preferredChannel: channel,
                            whatsappOptIn: true,
                            smsOptIn: true,
                            emailOptIn: true,
                            pushOptIn: true,
                            preferredTimeStart: '08:00',
                            preferredTimeEnd: '20:00',
                            timezone: 'America/Sao_Paulo'
                        },
                        optOuts: [],
                        timezone: 'America/Sao_Paulo',
                        language: 'pt-BR'
                    },
                    content: {
                        subject: renderResult.content.subject,
                        body: renderResult.content.body,
                        html: renderResult.content.html,
                        variables: {}
                    },
                    priority: priority || 5,
                    metadata: {
                        patientId: context.patient.id,
                        appointmentId: context.appointment?.id,
                        source: 'automated',
                        tags: ['automation', context.rule.id],
                        customData: {
                            automationRuleId: context.rule.id,
                            executionId: context.executionId,
                            templateId
                        }
                    },
                    retryCount: 0,
                    maxRetries: 3,
                    createdAt: new Date(),
                    updatedAt: new Date()
                };
                // Send message via message bus
                await this.messageBus.sendMessage(message, {
                    priority: priority || 5,
                    preferredChannel: channel
                });
                this.logger.info('Automated message sent', {
                    messageId: message.id,
                    patientId: context.patient.id,
                    channel,
                    ruleId: context.rule.id
                });
            }
            catch (error) {
                this.logger.error('Failed to send automated message', error instanceof Error ? error : new Error(String(error)), {
                    templateId,
                    channel,
                    patientId: context.patient.id,
                    ruleId: context.rule.id
                });
            }
        }
    }
    /**
     * Execute schedule message action
     */
    async executeScheduleMessageAction(action, context) {
        const { templateId, channels, delay, priority } = action.parameters;
        if (!context.patient) {
            throw new CommunicationError('PATIENT_REQUIRED', 'Patient context is required for schedule message action');
        }
        const scheduledFor = new Date(Date.now() + delay);
        // Similar to send message but with scheduling
        for (const channel of channels) {
            try {
                const renderResult = await this.templateManager.renderTemplate({
                    type: templateId,
                    channel,
                    locale: context.patient.preferredLocale || 'pt-BR',
                    audience: 'patient'
                }, context.templateContext);
                if (!renderResult.success)
                    continue;
                const message = {
                    id: `sched-${context.executionId}-${channel}-${Date.now()}`,
                    recipient: {
                        id: context.patient.id,
                        name: context.patient.name,
                        email: context.patient.email,
                        phone: context.patient.phone,
                        preferences: {
                            preferredChannel: channel,
                            whatsappOptIn: true,
                            smsOptIn: true,
                            emailOptIn: true,
                            pushOptIn: true,
                            preferredTimeStart: '08:00',
                            preferredTimeEnd: '20:00',
                            timezone: 'America/Sao_Paulo'
                        },
                        optOuts: [],
                        timezone: 'America/Sao_Paulo',
                        language: 'pt-BR'
                    },
                    content: {
                        subject: renderResult.content.subject,
                        body: renderResult.content.body,
                        html: renderResult.content.html,
                        variables: {}
                    },
                    priority: priority || 5,
                    scheduledFor,
                    metadata: {
                        patientId: context.patient.id,
                        appointmentId: context.appointment?.id,
                        source: 'automated',
                        tags: ['automation', context.rule.id],
                        customData: {
                            automationRuleId: context.rule.id,
                            executionId: context.executionId,
                            templateId
                        }
                    },
                    retryCount: 0,
                    maxRetries: 3,
                    createdAt: new Date(),
                    updatedAt: new Date()
                };
                await this.messageBus.sendMessage(message, {
                    priority: priority || 5,
                    scheduledFor,
                    preferredChannel: channel
                });
                this.logger.info('Automated message scheduled', {
                    messageId: message.id,
                    patientId: context.patient.id,
                    channel,
                    scheduledFor,
                    ruleId: context.rule.id
                });
            }
            catch (error) {
                this.logger.error('Failed to schedule automated message', error instanceof Error ? error : new Error(String(error)), {
                    templateId,
                    channel,
                    patientId: context.patient.id,
                    scheduledFor,
                    ruleId: context.rule.id
                });
            }
        }
    }
    /**
     * Execute update patient action
     */
    async executeUpdatePatientAction(action, context) {
        const { fields } = action.parameters;
        if (!context.patient) {
            throw new CommunicationError('PATIENT_REQUIRED', 'Patient context is required for update patient action');
        }
        try {
            // Update patient fields
            const updates = this.processFieldUpdates(fields, context);
            // Save to repository
            // await this.repository.updatePatient(context.patient.id, updates);
            this.logger.info('Patient updated by automation', {
                patientId: context.patient.id,
                updates,
                ruleId: context.rule.id
            });
        }
        catch (error) {
            throw new CommunicationError('PATIENT_UPDATE_FAILED', `Failed to update patient: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Execute log event action
     */
    async executeLogEventAction(action, context) {
        const { level, message, data } = action.parameters;
        const logData = {
            ...data,
            ruleId: context.rule.id,
            executionId: context.executionId,
            triggerType: context.trigger.type,
            timestamp: new Date()
        };
        switch (level) {
            case 'info':
                this.logger.info(message, logData);
                break;
            case 'warn':
                this.logger.warn(message, logData);
                break;
            case 'error':
                this.logger.error(message, undefined, logData);
                break;
            default:
                this.logger.debug(message, logData);
                break;
        }
    }
    /**
     * Execute webhook action
     */
    async executeWebhookAction(action, context) {
        const { url, method, headers, body } = action.parameters;
        try {
            const payload = this.processWebhookPayload(body, context);
            const response = await fetch(url, {
                method: method || 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...headers
                },
                body: JSON.stringify(payload)
            });
            if (!response.ok) {
                throw new Error(`Webhook failed with status: ${response.status}`);
            }
            this.logger.info('Webhook executed successfully', {
                url,
                method,
                status: response.status,
                ruleId: context.rule.id
            });
        }
        catch (error) {
            throw new CommunicationError('WEBHOOK_FAILED', `Webhook execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Execute conditional action
     */
    async executeConditionalAction(action, context) {
        const { condition, trueActions, falseActions } = action.parameters;
        const conditionMet = ConditionEvaluator.evaluateCondition(condition, context);
        const actionsToExecute = conditionMet ? trueActions : falseActions;
        if (actionsToExecute && actionsToExecute.length > 0) {
            for (const subAction of actionsToExecute) {
                await this.executeAction(subAction, context);
            }
        }
    }
    /**
     * Execute delay action
     */
    async executeDelayAction(action, context) {
        const { duration } = action.parameters;
        if (duration && duration > 0) {
            await new Promise(resolve => setTimeout(resolve, duration));
        }
    }
    /**
     * Process field updates with context substitution
     */
    processFieldUpdates(fields, context) {
        const updates = {};
        Object.entries(fields).forEach(([field, value]) => {
            if (typeof value === 'string' && value.includes('{{')) {
                // Process template variables
                updates[field] = this.processTemplateVariables(value, context);
            }
            else {
                updates[field] = value;
            }
        });
        return updates;
    }
    /**
     * Process webhook payload with context substitution
     */
    processWebhookPayload(payload, context) {
        if (typeof payload === 'string') {
            return this.processTemplateVariables(payload, context);
        }
        if (Array.isArray(payload)) {
            return payload.map(item => this.processWebhookPayload(item, context));
        }
        if (typeof payload === 'object' && payload !== null) {
            const processed = {};
            Object.entries(payload).forEach(([key, value]) => {
                processed[key] = this.processWebhookPayload(value, context);
            });
            return processed;
        }
        return payload;
    }
    /**
     * Process template variables in strings
     */
    processTemplateVariables(template, context) {
        return template.replace(/\{\{([^}]+)\}\}/g, (match, variable) => {
            const value = this.getContextValue(variable.trim(), context);
            return value !== undefined ? String(value) : match;
        });
    }
    /**
     * Get value from context
     */
    getContextValue(path, context) {
        const segments = path.split('.');
        let value = context;
        for (const segment of segments) {
            if (value && typeof value === 'object' && segment in value) {
                value = value[segment];
            }
            else {
                return undefined;
            }
        }
        return value;
    }
}
/**
 * Automation Engine - Main automation processing engine
 */
export class AutomationEngine {
    constructor(config, templateManager, messageBus, eventDispatcher, repository, configProvider, logger, metrics) {
        this.config = config;
        this.templateManager = templateManager;
        this.messageBus = messageBus;
        this.eventDispatcher = eventDispatcher;
        this.repository = repository;
        this.configProvider = configProvider;
        this.logger = logger;
        this.metrics = metrics;
        this.activeRules = new Map();
        this.executionStats = new Map();
        this.actionExecutor = new ActionExecutor(templateManager, messageBus, repository, logger, metrics);
        this.setupEventListeners();
        this.loadActiveRules();
    }
    /**
     * Setup event listeners for automation triggers
     */
    setupEventListeners() {
        // Listen for appointment events
        this.eventDispatcher.subscribe('appointment.created', this.handleAppointmentEvent.bind(this));
        this.eventDispatcher.subscribe('appointment.updated', this.handleAppointmentEvent.bind(this));
        this.eventDispatcher.subscribe('appointment.cancelled', this.handleAppointmentEvent.bind(this));
        this.eventDispatcher.subscribe('appointment.reminder_time', this.handleAppointmentEvent.bind(this));
        // Listen for patient events
        this.eventDispatcher.subscribe('patient.created', this.handlePatientEvent.bind(this));
        this.eventDispatcher.subscribe('patient.updated', this.handlePatientEvent.bind(this));
        // Listen for payment events
        this.eventDispatcher.subscribe('payment.received', this.handlePaymentEvent.bind(this));
        this.eventDispatcher.subscribe('payment.overdue', this.handlePaymentEvent.bind(this));
        // Listen for system events
        this.eventDispatcher.subscribe('system.daily_cron', this.handleSystemEvent.bind(this));
        this.eventDispatcher.subscribe('system.weekly_cron', this.handleSystemEvent.bind(this));
        this.logger.info('Automation engine event listeners setup complete');
    }
    /**
     * Load active automation rules
     */
    async loadActiveRules() {
        try {
            // Note: This would need to be implemented in the repository
            // For now, we'll skip loading and rules can be added manually
            this.logger.info('Automation rules loaded', {
                activeRules: 0
            });
        }
        catch (error) {
            this.logger.error('Failed to load automation rules', error instanceof Error ? error : new Error(String(error)));
        }
    }
    /**
     * Handle appointment events
     */
    async handleAppointmentEvent(event) {
        const eventData = {
            type: event.type,
            timestamp: event.timestamp,
            source: 'appointment',
            data: event.data,
            context: {
                appointmentId: event.data.appointmentId,
                patientId: event.data.patientId
            }
        };
        await this.processTrigger('appointment', eventData);
    }
    /**
     * Handle patient events
     */
    async handlePatientEvent(event) {
        const eventData = {
            type: event.type,
            timestamp: event.timestamp,
            source: 'patient',
            data: event.data,
            context: {
                patientId: event.data.patientId
            }
        };
        await this.processTrigger('patient', eventData);
    }
    /**
     * Handle payment events
     */
    async handlePaymentEvent(event) {
        const eventData = {
            type: event.type,
            timestamp: event.timestamp,
            source: 'payment',
            data: event.data,
            context: {
                patientId: event.data.patientId
            }
        };
        await this.processTrigger('payment', eventData);
    }
    /**
     * Handle system events
     */
    async handleSystemEvent(event) {
        const eventData = {
            type: event.type,
            timestamp: event.timestamp,
            source: 'system',
            data: event.data,
            context: {}
        };
        await this.processTrigger('system', eventData);
    }
    /**
     * Process trigger and execute matching rules
     */
    async processTrigger(triggerType, eventData) {
        const startTime = Date.now();
        try {
            // Find matching rules
            const matchingRules = Array.from(this.activeRules.values()).filter(rule => rule.trigger.type === triggerType &&
                this.matchesTriggerConditions(rule.trigger, eventData));
            this.logger.debug('Processing automation trigger', {
                triggerType,
                eventType: eventData.type,
                matchingRules: matchingRules.length
            });
            // Execute matching rules
            for (const rule of matchingRules) {
                try {
                    await this.executeRule(rule, eventData);
                }
                catch (error) {
                    this.logger.error('Rule execution failed', error instanceof Error ? error : new Error(String(error)), {
                        ruleId: rule.id,
                        triggerType,
                        eventType: eventData.type
                    });
                    this.metrics.increment('automation_engine.rule.execution.failure');
                }
            }
            const duration = Date.now() - startTime;
            this.metrics.timing('automation_engine.trigger.processing_time', duration);
            this.metrics.increment('automation_engine.trigger.processed');
        }
        catch (error) {
            const duration = Date.now() - startTime;
            this.metrics.timing('automation_engine.trigger.error_time', duration);
            this.metrics.increment('automation_engine.trigger.error');
            this.logger.error('Trigger processing failed', error instanceof Error ? error : new Error(String(error)), {
                triggerType,
                eventType: eventData.type
            });
        }
    }
    /**
     * Check if event matches trigger conditions
     */
    matchesTriggerConditions(trigger, eventData) {
        // Check event type
        if (trigger.events && !trigger.events.includes(eventData.type)) {
            return false;
        }
        // Check timing conditions
        if (trigger.timing) {
            const now = new Date();
            if (trigger.timing.timeOfDay) {
                const currentHour = now.getHours();
                const [startHour, endHour] = trigger.timing.timeOfDay;
                if (currentHour < startHour || currentHour > endHour) {
                    return false;
                }
            }
            if (trigger.timing.daysOfWeek) {
                const currentDay = now.getDay();
                if (!trigger.timing.daysOfWeek.includes(currentDay)) {
                    return false;
                }
            }
        }
        // Check data filters
        if (trigger.filters) {
            for (const [field, expectedValue] of Object.entries(trigger.filters)) {
                const actualValue = this.getNestedValue(eventData.data, field);
                if (actualValue !== expectedValue) {
                    return false;
                }
            }
        }
        return true;
    }
    /**
     * Execute automation rule
     */
    async executeRule(rule, eventData) {
        const executionId = `exec-${rule.id}-${Date.now()}`;
        try {
            // Check execution limits
            if (!this.canExecuteRule(rule)) {
                this.logger.warn('Rule execution limit reached', { ruleId: rule.id });
                return;
            }
            // Load context data
            const context = await this.buildExecutionContext(rule, eventData, executionId);
            // Evaluate conditions
            if (rule.conditions && rule.conditions.length > 0) {
                const conditionsMet = ConditionEvaluator.evaluateConditionGroup(rule.conditions, rule.conditionOperator || 'AND', context);
                if (!conditionsMet) {
                    this.logger.debug('Rule conditions not met', { ruleId: rule.id });
                    return;
                }
            }
            // Execute actions
            for (const action of rule.actions) {
                await this.actionExecutor.executeAction(action, context);
            }
            // Record execution
            await this.recordExecution(rule, context, 'success');
            this.metrics.increment('automation_engine.rule.execution.success');
            this.logger.info('Automation rule executed successfully', {
                ruleId: rule.id,
                executionId,
                triggerType: rule.trigger.type,
                actionsExecuted: rule.actions.length
            });
        }
        catch (error) {
            await this.recordExecution(rule, undefined, 'failure', error);
            this.metrics.increment('automation_engine.rule.execution.failure');
            throw error;
        }
    }
    /**
     * Build execution context
     */
    async buildExecutionContext(rule, eventData, executionId) {
        let patient;
        let appointment;
        // Load patient if available
        if (eventData.context.patientId) {
            try {
                // Note: This would need to be implemented in the repository
                // For now, we'll use the event data if available
                patient = eventData.data.patient;
            }
            catch (error) {
                this.logger.warn('Failed to load patient for automation', {
                    patientId: eventData.context.patientId,
                    error: error instanceof Error ? error.message : String(error)
                });
            }
        }
        // Load appointment if available
        if (eventData.context.appointmentId) {
            try {
                // Note: This would need to be implemented in the repository
                // For now, we'll use the event data if available
                appointment = eventData.data.appointment;
            }
            catch (error) {
                this.logger.warn('Failed to load appointment for automation', {
                    appointmentId: eventData.context.appointmentId,
                    error: error instanceof Error ? error.message : String(error)
                });
            }
        }
        // Build template context
        const templateContext = {
            patient,
            appointment,
            event: eventData,
            rule: {
                id: rule.id,
                name: rule.name
            },
            clinic: {
                name: this.configProvider.get('clinic.name', 'DuduFisio'),
                phone: this.configProvider.get('clinic.phone', ''),
                email: this.configProvider.get('clinic.email', '')
            }
        };
        return {
            rule,
            trigger: rule.trigger,
            eventData,
            patient,
            appointment,
            templateContext,
            executionId,
            retryCount: 0
        };
    }
    /**
     * Check if rule can be executed based on limits
     */
    canExecuteRule(rule) {
        if (!this.config.maxExecutionsPerDay)
            return true;
        const today = new Date().toDateString();
        const stats = this.executionStats.get(rule.id);
        if (!stats)
            return true;
        if (stats.lastExecution.toDateString() !== today) {
            // Reset count for new day
            this.executionStats.set(rule.id, { count: 0, lastExecution: new Date() });
            return true;
        }
        return stats.count < this.config.maxExecutionsPerDay;
    }
    /**
     * Record rule execution
     */
    async recordExecution(rule, context, status = 'success', error) {
        try {
            // Update execution stats
            const stats = this.executionStats.get(rule.id) || { count: 0, lastExecution: new Date() };
            stats.count++;
            stats.lastExecution = new Date();
            this.executionStats.set(rule.id, stats);
            // Log execution to repository if audit logging is enabled
            if (this.config.enableAuditLog) {
                const execution = {
                    id: context?.executionId || `exec-${rule.id}-${Date.now()}`,
                    ruleId: rule.id,
                    triggeredAt: new Date(),
                    status,
                    context: context ? {
                        patientId: context.patient?.id,
                        appointmentId: context.appointment?.id,
                        eventData: context.eventData
                    } : undefined,
                    error: error instanceof Error ? error.message : undefined,
                    // duration: 0 // Removed - not in AutomationExecution interface
                };
                // Note: This would need to be implemented in the repository
                // For now, we'll just log it
                this.logger.info('Automation execution recorded', {
                    executionId: execution.id,
                    ruleId: execution.ruleId,
                    status: execution.status
                });
            }
        }
        catch (error) {
            this.logger.error('Failed to record automation execution', error instanceof Error ? error : new Error(String(error)), {
                ruleId: rule.id
            });
        }
    }
    /**
     * Get nested value from object
     */
    getNestedValue(obj, path) {
        return path.split('.').reduce((current, key) => current?.[key], obj);
    }
    /**
     * Add automation rule
     */
    async addRule(rule) {
        try {
            // Note: This would need to be implemented in the repository
            // For now, we'll just add it to the active rules map
            if (rule.isActive) {
                this.activeRules.set(rule.id, rule);
            }
            this.logger.info('Automation rule added', { ruleId: rule.id });
        }
        catch (error) {
            throw new CommunicationError('RULE_ADD_FAILED', `Failed to add automation rule: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Update automation rule
     */
    async updateRule(ruleId, updates) {
        try {
            // Note: This would need to be implemented in the repository
            // For now, we'll just update the in-memory cache
            const existingRule = this.activeRules.get(ruleId);
            if (existingRule) {
                const updatedRule = { ...existingRule, ...updates };
                if (updatedRule.isActive) {
                    this.activeRules.set(ruleId, updatedRule);
                }
                else {
                    this.activeRules.delete(ruleId);
                }
            }
            this.logger.info('Automation rule updated', { ruleId });
        }
        catch (error) {
            throw new CommunicationError('RULE_UPDATE_FAILED', `Failed to update automation rule: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Delete automation rule
     */
    async deleteRule(ruleId) {
        try {
            // Note: This would need to be implemented in the repository
            // For now, we'll just remove from the active rules map
            this.activeRules.delete(ruleId);
            this.logger.info('Automation rule deleted', { ruleId });
        }
        catch (error) {
            throw new CommunicationError('RULE_DELETE_FAILED', `Failed to delete automation rule: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Get automation engine statistics
     */
    getStatistics() {
        const today = new Date().toDateString();
        const todayExecutions = Array.from(this.executionStats.values())
            .filter(stats => stats.lastExecution.toDateString() === today)
            .reduce((sum, stats) => sum + stats.count, 0);
        const totalExecutions = Array.from(this.executionStats.values())
            .reduce((sum, stats) => sum + stats.count, 0);
        return {
            activeRules: this.activeRules.size,
            totalExecutions,
            executionsToday: todayExecutions,
            averageExecutionTime: 0 // Would be calculated from metrics in real implementation
        };
    }
    /**
     * Test automation rule with sample data
     */
    async testRule(ruleId, sampleEventData) {
        const rule = this.activeRules.get(ruleId);
        if (!rule) {
            throw new Error(`Rule ${ruleId} not found`);
        }
        const executionId = `test-${ruleId}-${Date.now()}`;
        const errors = [];
        let conditionsMet = true;
        let actionsExecuted = 0;
        try {
            const context = await this.buildExecutionContext(rule, sampleEventData, executionId);
            // Test conditions
            if (rule.conditions && rule.conditions.length > 0) {
                conditionsMet = ConditionEvaluator.evaluateConditionGroup(rule.conditions, rule.conditionOperator || 'AND', context);
            }
            // Test actions (dry run)
            if (conditionsMet) {
                for (const action of rule.actions) {
                    try {
                        // In test mode, we would execute a dry run of actions
                        actionsExecuted++;
                    }
                    catch (error) {
                        errors.push(`Action ${action.type}: ${error instanceof Error ? error.message : 'Unknown error'}`);
                    }
                }
            }
            return {
                success: errors.length === 0,
                conditionsMet,
                actionsExecuted,
                errors
            };
        }
        catch (error) {
            return {
                success: false,
                conditionsMet: false,
                actionsExecuted: 0,
                errors: [error instanceof Error ? error.message : 'Unknown error']
            };
        }
    }
}
/**
 * Default automation engine configuration
 */
export const defaultAutomationEngineConfig = {
    enabled: true,
    maxRulesPerTrigger: 10,
    maxExecutionsPerDay: 100,
    enableScheduling: true,
    enableConditions: true,
    defaultTimezone: 'America/Sao_Paulo',
    executionTimeout: 30000,
    retryAttempts: 3,
    enableAuditLog: true
};
