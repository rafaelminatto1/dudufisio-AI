/**
 * 🤖 AI Scheduling System - Sistema de Agendamento Inteligente
 *
 * Exportações principais do sistema de IA para agendamento:
 * - Componentes core
 * - Serviços
 * - Integrações
 * - Tipos e interfaces
 */
// Core Components
export { DemandPredictor } from './core/DemandPredictor';
export { NoShowPredictor } from './core/NoShowPredictor';
export { ResourceOptimizer } from './core/ResourceOptimizer';
export { SchedulingEngine } from './core/SchedulingEngine';
export { AIPromptManager } from './core/AIPromptManager';
// Services
export { AISchedulingService } from './services/AISchedulingService';
// Integrations
export { WhatsAppBusinessIntegration } from './integrations/WhatsAppBusinessIntegration';
export { ComplianceIntegration } from './integrations/ComplianceIntegration';
// Import classes for factory functions
import { AISchedulingService } from './services/AISchedulingService';
import { WhatsAppBusinessIntegration } from './integrations/WhatsAppBusinessIntegration';
// Factory Functions
export function createAISchedulingService(biSystem, config) {
    return new AISchedulingService(biSystem, config);
}
export function createWhatsAppBusinessIntegration(config, biSystem) {
    return new WhatsAppBusinessIntegration(config, biSystem);
}
// Utility Functions
export function formatPhoneNumber(phone) {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 11 && cleaned.startsWith('11')) {
        return `55${cleaned}`;
    }
    if (cleaned.length === 10) {
        return `5511${cleaned}`;
    }
    return cleaned;
}
export function calculateAppointmentDuration(appointmentType, complexity = 'medium') {
    const baseDurations = {
        'evaluation': 60,
        'session': 45,
        'return': 30,
        'group': 60
    };
    const baseDuration = baseDurations[appointmentType] || 45;
    const complexityMultiplier = { low: 0.8, medium: 1.0, high: 1.2 };
    return Math.round(baseDuration * complexityMultiplier[complexity]);
}
export function generateAppointmentId() {
    return `app_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
export function validateAppointmentData(appointment) {
    const errors = [];
    if (!appointment.patientId) {
        errors.push('ID do paciente é obrigatório');
    }
    if (!appointment.startTime) {
        errors.push('Horário de início é obrigatório');
    }
    if (!appointment.endTime) {
        errors.push('Horário de fim é obrigatório');
    }
    if (appointment.startTime && appointment.endTime) {
        const start = new Date(appointment.startTime);
        const end = new Date(appointment.endTime);
        if (start >= end) {
            errors.push('Horário de início deve ser anterior ao horário de fim');
        }
    }
    if (!appointment.type) {
        errors.push('Tipo de agendamento é obrigatório');
    }
    return {
        isValid: errors.length === 0,
        errors
    };
}
// Constants
export const APPOINTMENT_TYPES = {
    EVALUATION: 'evaluation',
    SESSION: 'session',
    RETURN: 'return',
    GROUP: 'group'
};
export const APPOINTMENT_STATUS = {
    SCHEDULED: 'scheduled',
    CONFIRMED: 'confirmed',
    IN_PROGRESS: 'in_progress',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled',
    NO_SHOW: 'no_show'
};
export const RISK_LEVELS = {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
    CRITICAL: 'critical'
};
export const PRIORITY_LEVELS = {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
    URGENT: 'urgent'
};
export const PROMPT_TYPES = {
    CLINICAL_ANALYSIS: 'clinical_analysis',
    EXERCISE_PRESCRIPTION: 'exercise_prescription',
    EVOLUTION_REPORT: 'evolution_report',
    DIFFERENTIAL_DIAGNOSIS: 'differential_diagnosis',
    TREATMENT_PROTOCOLS: 'treatment_protocols',
    EFFECTIVENESS_ANALYSIS: 'effectiveness_analysis',
    STUDENT_EDUCATION: 'student_education',
    PATIENT_COMMUNICATION: 'patient_communication'
};
export const WHATSAPP_TEMPLATE_CATEGORIES = {
    AUTHENTICATION: 'AUTHENTICATION',
    MARKETING: 'MARKETING',
    UTILITY: 'UTILITY'
};
export const WHATSAPP_MESSAGE_TYPES = {
    TEXT: 'text',
    TEMPLATE: 'template',
    INTERACTIVE: 'interactive'
};
export const WHATSAPP_BUTTON_TYPES = {
    QUICK_REPLY: 'QUICK_REPLY',
    URL: 'URL',
    PHONE_NUMBER: 'PHONE_NUMBER'
};
export const WHATSAPP_STATUS_TYPES = {
    SENT: 'sent',
    DELIVERED: 'delivered',
    READ: 'read',
    FAILED: 'failed'
};
// Default Configurations
export const DEFAULT_AI_SCHEDULING_CONFIG = {
    enableDemandPrediction: true,
    enableNoShowPrediction: true,
    enableResourceOptimization: true,
    enablePrompts: true,
    enableCompliance: true,
    cacheEnabled: true,
    cacheTTL: 30,
    maxConcurrentRequests: 10,
    fallbackToHeuristic: true,
    performanceMonitoring: true
};
export const DEFAULT_WHATSAPP_CONFIG = {
    apiVersion: 'v18.0',
    baseUrl: 'https://graph.facebook.com/v18.0'
};
// Error Types
export class AISchedulingError extends Error {
    constructor(message, code, context) {
        super(message);
        this.code = code;
        this.context = context;
        this.name = 'AISchedulingError';
    }
}
export class WhatsAppBusinessError extends Error {
    constructor(message, code, statusCode, context) {
        super(message);
        this.code = code;
        this.statusCode = statusCode;
        this.context = context;
        this.name = 'WhatsAppBusinessError';
    }
}
export class PromptProcessingError extends Error {
    constructor(message, promptType, context) {
        super(message);
        this.promptType = promptType;
        this.context = context;
        this.name = 'PromptProcessingError';
    }
}
// Version
export const VERSION = '1.0.0';
export const BUILD_DATE = new Date().toISOString();
