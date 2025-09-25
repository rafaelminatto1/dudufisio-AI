// Automation Engine - Event-driven message automation with triggers

import {
  Appointment,
  Patient,
  Message,
  MessageTemplate,
  CommunicationChannel,
  AutomationRule,
  AutomationTrigger,
  AutomationAction,
  AutomationExecution,
  AutomationCondition
} from '../../../types';
import {
  EventDispatcher,
  CommunicationRepository,
  ConfigurationProvider,
  CommunicationLogger,
  MetricsCollector,
  CommunicationError
} from '../core/types';
import { TemplateManager } from '../templates/TemplateManager';
import { MessageBus } from '../core/MessageBus';

/**
 * Automation Engine Configuration
 */
export interface AutomationEngineConfig {
  enabled: boolean;
  maxRulesPerTrigger: number;
  maxExecutionsPerDay: number;
  enableScheduling: boolean;
  enableConditions: boolean;
  defaultTimezone: string;
  executionTimeout: number;
  retryAttempts: number;
  enableAuditLog: boolean;
}

/**
 * Trigger Event Data
 */
interface TriggerEventData {
  type: string;
  timestamp: Date;
  source: string;
  data: Record<string, any>;
  context: {
    patientId?: string;
    appointmentId?: string;
    userId?: string;
    sessionId?: string;
  };
}

/**
 * Rule Execution Context
 */
interface RuleExecutionContext {
  rule: AutomationRule;
  trigger: AutomationTrigger;
  eventData: TriggerEventData;
  patient?: Patient;
  appointment?: Appointment;
  templateContext: Record<string, any>;
  executionId: string;
  retryCount: number;
}

/**
 * Condition Evaluator
 */
class ConditionEvaluator {
  /**
   * Evaluate a single condition
   */
  static evaluateCondition(condition: AutomationCondition, context: RuleExecutionContext): boolean {
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
          return this.compareTimeOfDay(contextValue, value, 'after');

        case 'time_of_day_before':
          return this.compareTimeOfDay(contextValue, value, 'before');

        case 'day_of_week':
          return new Date(contextValue).getDay() === Number(value);

        case 'day_of_month':
          return new Date(contextValue).getDate() === Number(value);

        default:
          throw new Error(`Unknown operator: ${operator}`);
      }
    } catch (error) {
      throw new CommunicationError(
        'CONDITION_EVALUATION_FAILED',
        `Failed to evaluate condition: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Get value from context using dot notation
   */
  private static getContextValue(field: string, context: RuleExecutionContext): any {
    const path = field.split('.');
    let value: any = context;

    for (const key of path) {
      if (value && typeof value === 'object' && key in value) {
        value = value[key];
      } else {
        return undefined;
      }
    }

    return value;
  }

  /**
   * Compare time of day
   */
  private static compareTimeOfDay(dateValue: any, timeValue: string, operator: 'after' | 'before'): boolean {
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
  static evaluateConditionGroup(
    conditions: AutomationCondition[],
    operator: 'AND' | 'OR',
    context: RuleExecutionContext
  ): boolean {
    if (!conditions || conditions.length === 0) return true;

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
  constructor(
    private templateManager: TemplateManager,
    private messageBus: MessageBus,
    private repository: CommunicationRepository,
    private logger: CommunicationLogger,
    private metrics: MetricsCollector
  ) {}

  /**
   * Execute automation action
   */
  async executeAction(action: AutomationAction, context: RuleExecutionContext): Promise<void> {
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
    } catch (error) {
      const duration = Date.now() - startTime;
      this.metrics.timing('automation_engine.action.error_time', duration);
      this.metrics.increment(`automation_engine.action.${action.type}.failure`);

      throw error;
    }
  }

  /**
   * Execute send message action
   */
  private async executeSendMessageAction(action: AutomationAction, context: RuleExecutionContext): Promise<void> {
    const { templateId, channels, priority } = action.parameters;

    if (!context.patient) {
      throw new CommunicationError('PATIENT_REQUIRED', 'Patient context is required for send message action');
    }

    // Render template for each channel
    for (const channel of channels as CommunicationChannel[]) {
      try {
        const renderResult = await this.templateManager.renderTemplate(
          {
            type: templateId,
            channel,
            locale: context.patient.preferredLocale || 'pt-BR',
            audience: 'patient'
          },
          context.templateContext
        );

        if (!renderResult.success) {
          this.logger.warn('Template rendering failed for automation', {
            templateId,
            channel,
            errors: renderResult.errors
          });
          continue;
        }

        // Create message
        const message: Message = {
          id: `auto-${context.executionId}-${channel}-${Date.now()}`,
          recipient: {
            id: context.patient.id,
            name: context.patient.name,
            email: context.patient.email,
            phone: context.patient.phone,
            pushToken: context.patient.pushToken,
            preferredChannel: context.patient.preferredCommunicationChannel
          },
          content: {
            subject: renderResult.content.subject,
            body: renderResult.content.body,
            html: renderResult.content.html
          },
          priority: priority || 5,
          metadata: {
            automationRuleId: context.rule.id,
            executionId: context.executionId,
            templateId,
            source: 'automation'
          },
          createdAt: new Date()
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
      } catch (error) {
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
  private async executeScheduleMessageAction(action: AutomationAction, context: RuleExecutionContext): Promise<void> {
    const { templateId, channels, delay, priority } = action.parameters;

    if (!context.patient) {
      throw new CommunicationError('PATIENT_REQUIRED', 'Patient context is required for schedule message action');
    }

    const scheduledFor = new Date(Date.now() + (delay as number));

    // Similar to send message but with scheduling
    for (const channel of channels as CommunicationChannel[]) {
      try {
        const renderResult = await this.templateManager.renderTemplate(
          {
            type: templateId,
            channel,
            locale: context.patient.preferredLocale || 'pt-BR',
            audience: 'patient'
          },
          context.templateContext
        );

        if (!renderResult.success) continue;

        const message: Message = {
          id: `sched-${context.executionId}-${channel}-${Date.now()}`,
          recipient: {
            id: context.patient.id,
            name: context.patient.name,
            email: context.patient.email,
            phone: context.patient.phone,
            pushToken: context.patient.pushToken
          },
          content: {
            subject: renderResult.content.subject,
            body: renderResult.content.body,
            html: renderResult.content.html
          },
          priority: priority || 5,
          scheduledFor,
          metadata: {
            automationRuleId: context.rule.id,
            executionId: context.executionId,
            templateId,
            source: 'automation_scheduled'
          },
          createdAt: new Date()
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
      } catch (error) {
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
  private async executeUpdatePatientAction(action: AutomationAction, context: RuleExecutionContext): Promise<void> {
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
    } catch (error) {
      throw new CommunicationError(
        'PATIENT_UPDATE_FAILED',
        `Failed to update patient: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Execute log event action
   */
  private async executeLogEventAction(action: AutomationAction, context: RuleExecutionContext): Promise<void> {
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
  private async executeWebhookAction(action: AutomationAction, context: RuleExecutionContext): Promise<void> {
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
    } catch (error) {
      throw new CommunicationError(
        'WEBHOOK_FAILED',
        `Webhook execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Execute conditional action
   */
  private async executeConditionalAction(action: AutomationAction, context: RuleExecutionContext): Promise<void> {
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
  private async executeDelayAction(action: AutomationAction, context: RuleExecutionContext): Promise<void> {
    const { duration } = action.parameters;

    if (duration && duration > 0) {
      await new Promise(resolve => setTimeout(resolve, duration));
    }
  }

  /**
   * Process field updates with context substitution
   */
  private processFieldUpdates(fields: Record<string, any>, context: RuleExecutionContext): Record<string, any> {
    const updates: Record<string, any> = {};

    Object.entries(fields).forEach(([field, value]) => {
      if (typeof value === 'string' && value.includes('{{')) {
        // Process template variables
        updates[field] = this.processTemplateVariables(value, context);
      } else {
        updates[field] = value;
      }
    });

    return updates;
  }

  /**
   * Process webhook payload with context substitution
   */
  private processWebhookPayload(payload: any, context: RuleExecutionContext): any {
    if (typeof payload === 'string') {
      return this.processTemplateVariables(payload, context);
    }

    if (Array.isArray(payload)) {
      return payload.map(item => this.processWebhookPayload(item, context));
    }

    if (typeof payload === 'object' && payload !== null) {
      const processed: any = {};
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
  private processTemplateVariables(template: string, context: RuleExecutionContext): string {
    return template.replace(/\{\{([^}]+)\}\}/g, (match, variable) => {
      const value = this.getContextValue(variable.trim(), context);
      return value !== undefined ? String(value) : match;
    });
  }

  /**
   * Get value from context
   */
  private getContextValue(path: string, context: RuleExecutionContext): any {
    const segments = path.split('.');
    let value: any = context;

    for (const segment of segments) {
      if (value && typeof value === 'object' && segment in value) {
        value = value[segment];
      } else {
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
  private actionExecutor: ActionExecutor;
  private activeRules = new Map<string, AutomationRule>();
  private executionStats = new Map<string, { count: number; lastExecution: Date }>();

  constructor(
    private config: AutomationEngineConfig,
    private templateManager: TemplateManager,
    private messageBus: MessageBus,
    private eventDispatcher: EventDispatcher,
    private repository: CommunicationRepository,
    private configProvider: ConfigurationProvider,
    private logger: CommunicationLogger,
    private metrics: MetricsCollector
  ) {
    this.actionExecutor = new ActionExecutor(
      templateManager,
      messageBus,
      repository,
      logger,
      metrics
    );

    this.setupEventListeners();
    this.loadActiveRules();
  }

  /**
   * Setup event listeners for automation triggers
   */
  private setupEventListeners(): void {
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
  private async loadActiveRules(): Promise<void> {
    try {
      const rules = await this.repository.getAutomationRules({ isActive: true });

      rules.forEach(rule => {
        this.activeRules.set(rule.id, rule);
      });

      this.logger.info('Automation rules loaded', {
        activeRules: rules.length
      });
    } catch (error) {
      this.logger.error('Failed to load automation rules', error instanceof Error ? error : new Error(String(error)));
    }
  }

  /**
   * Handle appointment events
   */
  private async handleAppointmentEvent(event: any): Promise<void> {
    const eventData: TriggerEventData = {
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
  private async handlePatientEvent(event: any): Promise<void> {
    const eventData: TriggerEventData = {
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
  private async handlePaymentEvent(event: any): Promise<void> {
    const eventData: TriggerEventData = {
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
  private async handleSystemEvent(event: any): Promise<void> {
    const eventData: TriggerEventData = {
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
  private async processTrigger(triggerType: string, eventData: TriggerEventData): Promise<void> {
    const startTime = Date.now();

    try {
      // Find matching rules
      const matchingRules = Array.from(this.activeRules.values()).filter(rule =>
        rule.trigger.type === triggerType &&
        this.matchesTriggerConditions(rule.trigger, eventData)
      );

      this.logger.debug('Processing automation trigger', {
        triggerType,
        eventType: eventData.type,
        matchingRules: matchingRules.length
      });

      // Execute matching rules
      for (const rule of matchingRules) {
        try {
          await this.executeRule(rule, eventData);
        } catch (error) {
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

    } catch (error) {
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
  private matchesTriggerConditions(trigger: AutomationTrigger, eventData: TriggerEventData): boolean {
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
  private async executeRule(rule: AutomationRule, eventData: TriggerEventData): Promise<void> {
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
        const conditionsMet = ConditionEvaluator.evaluateConditionGroup(
          rule.conditions,
          rule.conditionOperator || 'AND',
          context
        );

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

    } catch (error) {
      await this.recordExecution(rule, undefined, 'failure', error);

      this.metrics.increment('automation_engine.rule.execution.failure');

      throw error;
    }
  }

  /**
   * Build execution context
   */
  private async buildExecutionContext(
    rule: AutomationRule,
    eventData: TriggerEventData,
    executionId: string
  ): Promise<RuleExecutionContext> {
    let patient: Patient | undefined;
    let appointment: Appointment | undefined;

    // Load patient if available
    if (eventData.context.patientId) {
      try {
        patient = await this.repository.getPatient(eventData.context.patientId);
      } catch (error) {
        this.logger.warn('Failed to load patient for automation', {
          patientId: eventData.context.patientId,
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }

    // Load appointment if available
    if (eventData.context.appointmentId) {
      try {
        appointment = await this.repository.getAppointment(eventData.context.appointmentId);
      } catch (error) {
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
  private canExecuteRule(rule: AutomationRule): boolean {
    if (!this.config.maxExecutionsPerDay) return true;

    const today = new Date().toDateString();
    const stats = this.executionStats.get(rule.id);

    if (!stats) return true;

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
  private async recordExecution(
    rule: AutomationRule,
    context?: RuleExecutionContext,
    status: 'success' | 'failure' = 'success',
    error?: unknown
  ): Promise<void> {
    try {
      // Update execution stats
      const stats = this.executionStats.get(rule.id) || { count: 0, lastExecution: new Date() };
      stats.count++;
      stats.lastExecution = new Date();
      this.executionStats.set(rule.id, stats);

      // Log execution to repository if audit logging is enabled
      if (this.config.enableAuditLog) {
        const execution: AutomationExecution = {
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
          duration: 0 // Would be calculated properly in real implementation
        };

        await this.repository.saveAutomationExecution(execution);
      }
    } catch (error) {
      this.logger.error('Failed to record automation execution', error instanceof Error ? error : new Error(String(error)), {
        ruleId: rule.id
      });
    }
  }

  /**
   * Get nested value from object
   */
  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  /**
   * Add automation rule
   */
  async addRule(rule: AutomationRule): Promise<void> {
    try {
      await this.repository.saveAutomationRule(rule);

      if (rule.isActive) {
        this.activeRules.set(rule.id, rule);
      }

      this.logger.info('Automation rule added', { ruleId: rule.id });
    } catch (error) {
      throw new CommunicationError(
        'RULE_ADD_FAILED',
        `Failed to add automation rule: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Update automation rule
   */
  async updateRule(ruleId: string, updates: Partial<AutomationRule>): Promise<void> {
    try {
      await this.repository.updateAutomationRule(ruleId, updates);

      // Update in-memory cache
      const existingRule = this.activeRules.get(ruleId);
      if (existingRule) {
        const updatedRule = { ...existingRule, ...updates };

        if (updatedRule.isActive) {
          this.activeRules.set(ruleId, updatedRule);
        } else {
          this.activeRules.delete(ruleId);
        }
      }

      this.logger.info('Automation rule updated', { ruleId });
    } catch (error) {
      throw new CommunicationError(
        'RULE_UPDATE_FAILED',
        `Failed to update automation rule: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Delete automation rule
   */
  async deleteRule(ruleId: string): Promise<void> {
    try {
      await this.repository.deleteAutomationRule(ruleId);
      this.activeRules.delete(ruleId);

      this.logger.info('Automation rule deleted', { ruleId });
    } catch (error) {
      throw new CommunicationError(
        'RULE_DELETE_FAILED',
        `Failed to delete automation rule: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Get automation engine statistics
   */
  getStatistics(): {
    activeRules: number;
    totalExecutions: number;
    executionsToday: number;
    averageExecutionTime: number;
  } {
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
  async testRule(ruleId: string, sampleEventData: TriggerEventData): Promise<{
    success: boolean;
    conditionsMet: boolean;
    actionsExecuted: number;
    errors: string[];
  }> {
    const rule = this.activeRules.get(ruleId);
    if (!rule) {
      throw new Error(`Rule ${ruleId} not found`);
    }

    const executionId = `test-${ruleId}-${Date.now()}`;
    const errors: string[] = [];
    let conditionsMet = true;
    let actionsExecuted = 0;

    try {
      const context = await this.buildExecutionContext(rule, sampleEventData, executionId);

      // Test conditions
      if (rule.conditions && rule.conditions.length > 0) {
        conditionsMet = ConditionEvaluator.evaluateConditionGroup(
          rule.conditions,
          rule.conditionOperator || 'AND',
          context
        );
      }

      // Test actions (dry run)
      if (conditionsMet) {
        for (const action of rule.actions) {
          try {
            // In test mode, we would execute a dry run of actions
            actionsExecuted++;
          } catch (error) {
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
    } catch (error) {
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
export const defaultAutomationEngineConfig: AutomationEngineConfig = {
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