// Communication Automation - Main Export File
// Core Automation Engine
export { AutomationEngine, defaultAutomationEngineConfig } from './AutomationEngine';
/**
 * Built-in Automation Rules for common physiotherapy clinic scenarios
 */
export const BUILT_IN_AUTOMATION_RULES = {
    // Appointment Confirmation Rule
    'appointment_confirmation_auto': {
        id: 'appointment_confirmation_auto',
        name: 'Confirmação Automática de Consulta',
        description: 'Envia confirmação automática quando uma consulta é agendada',
        trigger: {
            type: 'appointment',
            events: ['appointment.created'],
            timing: {
                delay: 300000, // 5 minutes delay
                timeOfDay: [8, 20] // Only between 8 AM and 8 PM
            }
        },
        conditions: [
            {
                field: 'appointment.status',
                operator: 'equals',
                value: 'scheduled',
                type: 'string'
            },
            {
                field: 'patient.communicationPreferences.enableAppointmentNotifications',
                operator: 'equals',
                value: true,
                type: 'boolean'
            }
        ],
        conditionOperator: 'AND',
        actions: [
            {
                type: 'send_message',
                parameters: {
                    templateId: 'appointment_confirmation',
                    channels: ['email', 'whatsapp'],
                    priority: 7
                }
            },
            {
                type: 'log_event',
                parameters: {
                    level: 'info',
                    message: 'Appointment confirmation sent automatically',
                    data: {
                        appointmentId: '{{appointment.id}}',
                        patientId: '{{patient.id}}'
                    }
                }
            }
        ],
        isActive: true,
        priority: 5,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    // Appointment Reminder Rule (24h before)
    'appointment_reminder_24h': {
        id: 'appointment_reminder_24h',
        name: 'Lembrete de Consulta - 24h',
        description: 'Envia lembrete 24 horas antes da consulta',
        trigger: {
            type: 'appointment',
            events: ['appointment.reminder_24h'],
            timing: {
                timeOfDay: [9, 18] // Business hours only
            }
        },
        conditions: [
            {
                field: 'appointment.status',
                operator: 'equals',
                value: 'scheduled',
                type: 'string'
            },
            {
                field: 'appointment.date',
                operator: 'date_after',
                value: new Date().toISOString(),
                type: 'date'
            }
        ],
        conditionOperator: 'AND',
        actions: [
            {
                type: 'send_message',
                parameters: {
                    templateId: 'appointment_reminder',
                    channels: ['whatsapp', 'sms'],
                    priority: 8
                }
            }
        ],
        isActive: true,
        priority: 8,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    // No-show Follow-up Rule
    'no_show_followup': {
        id: 'no_show_followup',
        name: 'Follow-up de Falta',
        description: 'Envia mensagem de follow-up quando paciente falta à consulta',
        trigger: {
            type: 'appointment',
            events: ['appointment.no_show'],
            timing: {
                delay: 3600000, // 1 hour after appointment time
                timeOfDay: [8, 20]
            }
        },
        conditions: [
            {
                field: 'appointment.status',
                operator: 'equals',
                value: 'no_show',
                type: 'string'
            }
        ],
        conditionOperator: 'AND',
        actions: [
            {
                type: 'schedule_message',
                parameters: {
                    templateId: 'no_show_followup',
                    channels: ['email', 'whatsapp'],
                    delay: 1800000, // 30 minutes delay
                    priority: 6
                }
            },
            {
                type: 'update_patient',
                parameters: {
                    fields: {
                        'metadata.noShowCount': '{{patient.metadata.noShowCount + 1}}',
                        'metadata.lastNoShow': '{{appointment.date}}'
                    }
                }
            }
        ],
        isActive: true,
        priority: 6,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    // Welcome New Patient Rule
    'welcome_new_patient': {
        id: 'welcome_new_patient',
        name: 'Boas-vindas Novo Paciente',
        description: 'Envia mensagem de boas-vindas para novos pacientes',
        trigger: {
            type: 'patient',
            events: ['patient.created'],
            timing: {
                delay: 600000, // 10 minutes delay
                timeOfDay: [8, 20]
            }
        },
        conditions: [
            {
                field: 'patient.isNew',
                operator: 'equals',
                value: true,
                type: 'boolean'
            }
        ],
        conditionOperator: 'AND',
        actions: [
            {
                type: 'send_message',
                parameters: {
                    templateId: 'welcome_new_patient',
                    channels: ['email', 'whatsapp'],
                    priority: 5
                }
            },
            {
                type: 'schedule_message',
                parameters: {
                    templateId: 'first_appointment_tips',
                    channels: ['email'],
                    delay: 86400000, // 24 hours later
                    priority: 3
                }
            }
        ],
        isActive: true,
        priority: 5,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    // Payment Overdue Reminder
    'payment_overdue_reminder': {
        id: 'payment_overdue_reminder',
        name: 'Lembrete de Pagamento em Atraso',
        description: 'Envia lembrete para pagamentos em atraso',
        trigger: {
            type: 'payment',
            events: ['payment.overdue'],
            timing: {
                timeOfDay: [9, 17] // Business hours
            }
        },
        conditions: [
            {
                field: 'payment.status',
                operator: 'equals',
                value: 'overdue',
                type: 'string'
            },
            {
                field: 'payment.amount',
                operator: 'greater_than',
                value: 0,
                type: 'number'
            }
        ],
        conditionOperator: 'AND',
        actions: [
            {
                type: 'conditional',
                parameters: {
                    condition: {
                        field: 'payment.daysOverdue',
                        operator: 'less_than_or_equal',
                        value: 7,
                        type: 'number'
                    },
                    trueActions: [
                        {
                            type: 'send_message',
                            parameters: {
                                templateId: 'payment_reminder_gentle',
                                channels: ['email', 'whatsapp'],
                                priority: 6
                            }
                        }
                    ],
                    falseActions: [
                        {
                            type: 'send_message',
                            parameters: {
                                templateId: 'payment_reminder_urgent',
                                channels: ['email', 'whatsapp', 'sms'],
                                priority: 8
                            }
                        }
                    ]
                }
            }
        ],
        isActive: true,
        priority: 7,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    // Birthday Wishes
    'birthday_wishes': {
        id: 'birthday_wishes',
        name: 'Parabéns de Aniversário',
        description: 'Envia mensagem de parabéns no aniversário do paciente',
        trigger: {
            type: 'system',
            events: ['system.daily_cron'],
            timing: {
                timeOfDay: [10, 11] // 10-11 AM
            }
        },
        conditions: [
            {
                field: 'patient.birthDate',
                operator: 'day_of_month',
                value: new Date().getDate(),
                type: 'number'
            },
            {
                field: 'patient.communicationPreferences.enableBirthdayMessages',
                operator: 'equals',
                value: true,
                type: 'boolean'
            }
        ],
        conditionOperator: 'AND',
        actions: [
            {
                type: 'send_message',
                parameters: {
                    templateId: 'birthday_wishes',
                    channels: ['whatsapp', 'email'],
                    priority: 3
                }
            }
        ],
        isActive: true,
        priority: 3,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    // Treatment Completion Follow-up
    'treatment_completion_followup': {
        id: 'treatment_completion_followup',
        name: 'Follow-up Fim de Tratamento',
        description: 'Envia pesquisa de satisfação após conclusão do tratamento',
        trigger: {
            type: 'appointment',
            events: ['treatment.completed'],
            timing: {
                delay: 86400000, // 24 hours delay
                timeOfDay: [9, 18]
            }
        },
        conditions: [
            {
                field: 'treatment.status',
                operator: 'equals',
                value: 'completed',
                type: 'string'
            },
            {
                field: 'treatment.sessionsCompleted',
                operator: 'greater_than',
                value: 0,
                type: 'number'
            }
        ],
        conditionOperator: 'AND',
        actions: [
            {
                type: 'send_message',
                parameters: {
                    templateId: 'treatment_completion_survey',
                    channels: ['email', 'whatsapp'],
                    priority: 4
                }
            },
            {
                type: 'schedule_message',
                parameters: {
                    templateId: 'maintenance_tips',
                    channels: ['email'],
                    delay: 604800000, // 1 week later
                    priority: 2
                }
            }
        ],
        isActive: true,
        priority: 4,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    }
};
/**
 * Automation Rule Builder - Helper class for creating automation rules
 */
export class AutomationRuleBuilder {
    constructor() {
        this.rule = {
            conditions: [],
            actions: [],
            isActive: true,
            priority: 5
        };
    }
    /**
     * Set basic rule information
     */
    setBasicInfo(id, name, description) {
        this.rule.id = id;
        this.rule.name = name;
        this.rule.description = description;
        return this;
    }
    /**
     * Set trigger configuration
     */
    setTrigger(trigger) {
        this.rule.trigger = trigger;
        return this;
    }
    /**
     * Add condition to rule
     */
    addCondition(condition) {
        if (!this.rule.conditions)
            this.rule.conditions = [];
        this.rule.conditions.push(condition);
        return this;
    }
    /**
     * Set condition operator (AND/OR)
     */
    setConditionOperator(operator) {
        this.rule.conditionOperator = operator;
        return this;
    }
    /**
     * Add action to rule
     */
    addAction(action) {
        if (!this.rule.actions)
            this.rule.actions = [];
        this.rule.actions.push(action);
        return this;
    }
    /**
     * Set rule priority
     */
    setPriority(priority) {
        this.rule.priority = priority;
        return this;
    }
    /**
     * Set rule active status
     */
    setActive(active) {
        this.rule.isActive = active;
        return this;
    }
    /**
     * Build the automation rule
     */
    build() {
        if (!this.rule.id)
            throw new Error('Rule ID is required');
        if (!this.rule.name)
            throw new Error('Rule name is required');
        if (!this.rule.trigger)
            throw new Error('Rule trigger is required');
        if (!this.rule.actions || this.rule.actions.length === 0) {
            throw new Error('At least one action is required');
        }
        return {
            ...this.rule,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
    }
    /**
     * Create a quick appointment confirmation rule
     */
    static createAppointmentConfirmationRule(channels = ['email', 'whatsapp'], delayMinutes = 5) {
        return new AutomationRuleBuilder()
            .setBasicInfo('appointment_confirmation_custom', 'Confirmação de Consulta Personalizada', 'Confirmação automática personalizada de consultas')
            .setTrigger({
            type: 'appointment',
            events: ['appointment.created'],
            timing: {
                delay: delayMinutes * 60000,
                timeOfDay: [8, 20]
            }
        })
            .addCondition({
            field: 'appointment.status',
            operator: 'equals',
            value: 'scheduled',
            type: 'string'
        })
            .addAction({
            type: 'send_message',
            parameters: {
                templateId: 'appointment_confirmation',
                channels,
                priority: 7
            }
        })
            .setPriority(7)
            .build();
    }
    /**
     * Create a quick reminder rule
     */
    static createReminderRule(hoursBeforeAppointment, channels = ['whatsapp', 'sms']) {
        return new AutomationRuleBuilder()
            .setBasicInfo(`appointment_reminder_${hoursBeforeAppointment}h`, `Lembrete ${hoursBeforeAppointment}h antes`, `Lembrete automático ${hoursBeforeAppointment} horas antes da consulta`)
            .setTrigger({
            type: 'appointment',
            events: [`appointment.reminder_${hoursBeforeAppointment}h`],
            timing: {
                timeOfDay: [8, 20]
            }
        })
            .addCondition({
            field: 'appointment.status',
            operator: 'equals',
            value: 'scheduled',
            type: 'string'
        })
            .addAction({
            type: 'send_message',
            parameters: {
                templateId: 'appointment_reminder',
                channels,
                priority: 8
            }
        })
            .setPriority(8)
            .build();
    }
}
/**
 * Trigger Templates - Common trigger configurations
 */
export const triggerTemplates = {
    appointment: {
        created: {
            type: 'appointment',
            events: ['appointment.created'],
            timing: { delay: 300000, timeOfDay: [8, 20] }
        },
        reminder24h: {
            type: 'appointment',
            events: ['appointment.reminder_24h'],
            timing: { timeOfDay: [9, 18] }
        },
        reminder2h: {
            type: 'appointment',
            events: ['appointment.reminder_2h'],
            timing: { timeOfDay: [8, 20] }
        },
        cancelled: {
            type: 'appointment',
            events: ['appointment.cancelled'],
            timing: { delay: 0, timeOfDay: [8, 20] }
        },
        noShow: {
            type: 'appointment',
            events: ['appointment.no_show'],
            timing: { delay: 3600000, timeOfDay: [8, 20] }
        }
    },
    patient: {
        created: {
            type: 'patient',
            events: ['patient.created'],
            timing: { delay: 600000, timeOfDay: [8, 20] }
        },
        updated: {
            type: 'patient',
            events: ['patient.updated'],
            timing: { delay: 0 }
        }
    },
    payment: {
        overdue: {
            type: 'payment',
            events: ['payment.overdue'],
            timing: { timeOfDay: [9, 17] }
        },
        received: {
            type: 'payment',
            events: ['payment.received'],
            timing: { delay: 0 }
        }
    },
    system: {
        dailyCron: {
            type: 'system',
            events: ['system.daily_cron'],
            timing: { timeOfDay: [9, 10] }
        },
        weeklyCron: {
            type: 'system',
            events: ['system.weekly_cron'],
            timing: { timeOfDay: [10, 11], daysOfWeek: [1] } // Monday
        }
    }
};
/**
 * Action Templates - Common action configurations
 */
export const actionTemplates = {
    sendMessage: (templateId, channels, priority = 5) => ({
        type: 'send_message',
        parameters: {
            templateId,
            channels,
            priority
        }
    }),
    scheduleMessage: (templateId, channels, delayMs, priority = 5) => ({
        type: 'schedule_message',
        parameters: {
            templateId,
            channels,
            delay: delayMs,
            priority
        }
    }),
    updatePatient: (fields) => ({
        type: 'update_patient',
        parameters: { fields }
    }),
    logEvent: (message, level = 'info', data = {}) => ({
        type: 'log_event',
        parameters: { level, message, data }
    }),
    webhook: (url, payload, method = 'POST') => ({
        type: 'webhook',
        parameters: {
            url,
            method,
            headers: { 'Content-Type': 'application/json' },
            body: payload
        }
    })
};
/**
 * Condition Templates - Common condition configurations
 */
export const conditionTemplates = {
    appointmentStatus: (status) => ({
        field: 'appointment.status',
        operator: 'equals',
        value: status,
        type: 'string'
    }),
    patientOptIn: (preference) => ({
        field: `patient.communicationPreferences.${preference}`,
        operator: 'equals',
        value: true,
        type: 'boolean'
    }),
    appointmentInFuture: () => ({
        field: 'appointment.date',
        operator: 'date_after',
        value: new Date().toISOString(),
        type: 'date'
    }),
    businessHours: () => ({
        field: 'event.timestamp',
        operator: 'time_of_day_after',
        value: '08:00',
        type: 'time'
    }),
    paymentAmount: (amount, operator = 'greater_than') => ({
        field: 'payment.amount',
        operator: operator,
        value: amount,
        type: 'number'
    })
};
/**
 * Rule Validation Utilities
 */
export class AutomationRuleValidator {
    /**
     * Validate automation rule structure
     */
    static validateRule(rule) {
        const errors = [];
        const warnings = [];
        // Basic validation
        if (!rule.id)
            errors.push('Rule ID is required');
        if (!rule.name)
            errors.push('Rule name is required');
        if (!rule.trigger)
            errors.push('Rule trigger is required');
        if (!rule.actions || rule.actions.length === 0)
            errors.push('At least one action is required');
        // ID format validation
        if (rule.id && !/^[a-z0-9_]+$/.test(rule.id)) {
            errors.push('Rule ID must contain only lowercase letters, numbers, and underscores');
        }
        // Trigger validation
        if (rule.trigger) {
            if (!rule.trigger.type)
                errors.push('Trigger type is required');
            if (!rule.trigger.events || rule.trigger.events.length === 0) {
                errors.push('At least one trigger event is required');
            }
            // Timing validation
            if (rule.trigger.timing) {
                const { timeOfDay, daysOfWeek } = rule.trigger.timing;
                if (timeOfDay && (timeOfDay[0] < 0 || timeOfDay[0] > 23 || timeOfDay[1] < 0 || timeOfDay[1] > 23)) {
                    errors.push('Time of day must be between 0 and 23');
                }
                if (daysOfWeek?.some(day => day < 0 || day > 6)) {
                    errors.push('Days of week must be between 0 (Sunday) and 6 (Saturday)');
                }
            }
        }
        // Actions validation
        if (rule.actions) {
            rule.actions.forEach((action, index) => {
                if (!action.type) {
                    errors.push(`Action ${index + 1}: type is required`);
                }
                if (action.type === 'send_message' || action.type === 'schedule_message') {
                    const params = action.parameters;
                    if (!params.templateId) {
                        errors.push(`Action ${index + 1}: templateId is required for message actions`);
                    }
                    if (!params.channels || !Array.isArray(params.channels) || params.channels.length === 0) {
                        errors.push(`Action ${index + 1}: at least one channel is required for message actions`);
                    }
                }
            });
        }
        // Priority validation
        if (rule.priority && (rule.priority < 1 || rule.priority > 10)) {
            warnings.push('Priority should be between 1 and 10');
        }
        return {
            valid: errors.length === 0,
            errors,
            warnings
        };
    }
    /**
     * Check for potential rule conflicts
     */
    static checkRuleConflicts(rules) {
        const conflicts = [];
        // Check for duplicate triggers
        const triggerGroups = new Map();
        rules.forEach(rule => {
            const triggerKey = `${rule.trigger.type}:${rule.trigger.events.join(',')}`;
            if (!triggerGroups.has(triggerKey)) {
                triggerGroups.set(triggerKey, []);
            }
            triggerGroups.get(triggerKey).push(rule.id);
        });
        triggerGroups.forEach((ruleIds, triggerKey) => {
            if (ruleIds.length > 1) {
                conflicts.push({
                    ruleIds,
                    type: 'duplicate_trigger',
                    description: `Multiple rules have the same trigger: ${triggerKey}`
                });
            }
        });
        // Check for excessive message sending
        const messageRules = rules.filter(rule => rule.actions.some(action => action.type === 'send_message' || action.type === 'schedule_message'));
        if (messageRules.length > 10) {
            conflicts.push({
                ruleIds: messageRules.map(r => r.id),
                type: 'excessive_messaging',
                description: 'Too many rules sending messages - may cause spam'
            });
        }
        return { conflicts };
    }
}
/**
 * Helper function to create a complete automation setup for a clinic
 */
export function createClinicAutomationSetup() {
    return [
        BUILT_IN_AUTOMATION_RULES.appointment_confirmation_auto,
        BUILT_IN_AUTOMATION_RULES.appointment_reminder_24h,
        BUILT_IN_AUTOMATION_RULES.welcome_new_patient,
        BUILT_IN_AUTOMATION_RULES.no_show_followup,
        BUILT_IN_AUTOMATION_RULES.treatment_completion_followup
    ];
}
/**
 * Helper function to create automation rules for different clinic sizes
 */
export function createAutomationForClinicSize(size) {
    switch (size) {
        case 'small':
            return [
                BUILT_IN_AUTOMATION_RULES.appointment_confirmation_auto,
                BUILT_IN_AUTOMATION_RULES.appointment_reminder_24h,
                BUILT_IN_AUTOMATION_RULES.welcome_new_patient
            ];
        case 'medium':
            return [
                BUILT_IN_AUTOMATION_RULES.appointment_confirmation_auto,
                BUILT_IN_AUTOMATION_RULES.appointment_reminder_24h,
                BUILT_IN_AUTOMATION_RULES.welcome_new_patient,
                BUILT_IN_AUTOMATION_RULES.no_show_followup,
                BUILT_IN_AUTOMATION_RULES.payment_overdue_reminder
            ];
        case 'large':
            return Object.values(BUILT_IN_AUTOMATION_RULES);
        default:
            return createClinicAutomationSetup();
    }
}
