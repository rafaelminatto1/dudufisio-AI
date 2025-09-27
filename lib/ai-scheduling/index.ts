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

// Types
export type {
  DemandPrediction,
  DemandFactor,
  HourlyDemand,
  ResourceRequirement,
  DemandFeatures
} from './core/DemandPredictor';

export type {
  NoShowPrediction,
  RiskFactor,
  PreventionStrategy,
  NoShowFeatures,
  NoShowModel
} from './core/NoShowPredictor';

export type {
  ResourceOptimization,
  OptimizedResource,
  ResourceConflict,
  OptimizationRecommendation,
  ResourceProfile,
  TimeSlot,
  ResourceConstraint,
  OptimizationRequest,
  OptimizationPreferences,
  OptimizationConstraints
} from './core/ResourceOptimizer';

export type {
  SmartSchedulingRequest,
  SmartSchedulingResponse,
  AIInsight,
  SchedulingRecommendation,
  AlternativeScheduling,
  SchedulingMetrics
} from './core/SchedulingEngine';

export type {
  PromptRequest,
  PromptResponse,
  PromptContext,
  PromptPreferences,
  PromptMetadata,
  PromptType
} from './core/AIPromptManager';

export type {
  AISchedulingConfig,
  SchedulingMetrics as AISchedulingMetrics,
  CacheEntry
} from './services/AISchedulingService';

export type {
  ComplianceIntegrationConfig,
  ComplianceCheckResult
} from './integrations/ComplianceIntegration';

export type {
  WhatsAppBusinessConfig,
  WhatsAppTemplate,
  WhatsAppTemplateComponent,
  WhatsAppButton,
  WhatsAppMessage,
  WhatsAppMessageComponent,
  WhatsAppWebhookEvent,
  WhatsAppAnalytics
} from './integrations/WhatsAppBusinessIntegration';

// Factory Functions
export function createAISchedulingService(
  biSystem: any,
  config?: Partial<AISchedulingConfig>
): AISchedulingService {
  return new AISchedulingService(biSystem, config);
}

export function createWhatsAppBusinessIntegration(
  config: WhatsAppBusinessConfig,
  biSystem: any
): WhatsAppBusinessIntegration {
  return new WhatsAppBusinessIntegration(config, biSystem);
}

// Utility Functions
export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.length === 11 && cleaned.startsWith('11')) {
    return `55${cleaned}`;
  }
  
  if (cleaned.length === 10) {
    return `5511${cleaned}`;
  }
  
  return cleaned;
}

export function calculateAppointmentDuration(
  appointmentType: string,
  complexity: 'low' | 'medium' | 'high' = 'medium'
): number {
  const baseDurations = {
    'evaluation': 60,
    'session': 45,
    'return': 30,
    'group': 60
  };
  
  const baseDuration = baseDurations[appointmentType as keyof typeof baseDurations] || 45;
  const complexityMultiplier = { low: 0.8, medium: 1.0, high: 1.2 };
  
  return Math.round(baseDuration * complexityMultiplier[complexity]);
}

export function generateAppointmentId(): string {
  return `app_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function validateAppointmentData(appointment: any): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
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
} as const;

export const APPOINTMENT_STATUS = {
  SCHEDULED: 'scheduled',
  CONFIRMED: 'confirmed',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  NO_SHOW: 'no_show'
} as const;

export const RISK_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
} as const;

export const PRIORITY_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent'
} as const;

export const PROMPT_TYPES = {
  CLINICAL_ANALYSIS: 'clinical_analysis',
  EXERCISE_PRESCRIPTION: 'exercise_prescription',
  EVOLUTION_REPORT: 'evolution_report',
  DIFFERENTIAL_DIAGNOSIS: 'differential_diagnosis',
  TREATMENT_PROTOCOLS: 'treatment_protocols',
  EFFECTIVENESS_ANALYSIS: 'effectiveness_analysis',
  STUDENT_EDUCATION: 'student_education',
  PATIENT_COMMUNICATION: 'patient_communication'
} as const;

export const WHATSAPP_TEMPLATE_CATEGORIES = {
  AUTHENTICATION: 'AUTHENTICATION',
  MARKETING: 'MARKETING',
  UTILITY: 'UTILITY'
} as const;

export const WHATSAPP_MESSAGE_TYPES = {
  TEXT: 'text',
  TEMPLATE: 'template',
  INTERACTIVE: 'interactive'
} as const;

export const WHATSAPP_BUTTON_TYPES = {
  QUICK_REPLY: 'QUICK_REPLY',
  URL: 'URL',
  PHONE_NUMBER: 'PHONE_NUMBER'
} as const;

export const WHATSAPP_STATUS_TYPES = {
  SENT: 'sent',
  DELIVERED: 'delivered',
  READ: 'read',
  FAILED: 'failed'
} as const;

// Default Configurations
export const DEFAULT_AI_SCHEDULING_CONFIG: AISchedulingConfig = {
  enableDemandPrediction: true,
  enableNoShowPrediction: true,
  enableResourceOptimization: true,
  enablePrompts: true,
  cacheEnabled: true,
  cacheTTL: 30,
  maxConcurrentRequests: 10,
  fallbackToHeuristic: true,
  performanceMonitoring: true
};

export const DEFAULT_WHATSAPP_CONFIG: Partial<WhatsAppBusinessConfig> = {
  apiVersion: 'v18.0',
  baseUrl: 'https://graph.facebook.com/v18.0'
};

// Error Types
export class AISchedulingError extends Error {
  constructor(
    message: string,
    public code: string,
    public context?: any
  ) {
    super(message);
    this.name = 'AISchedulingError';
  }
}

export class WhatsAppBusinessError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode?: number,
    public context?: any
  ) {
    super(message);
    this.name = 'WhatsAppBusinessError';
  }
}

export class PromptProcessingError extends Error {
  constructor(
    message: string,
    public promptType: string,
    public context?: any
  ) {
    super(message);
    this.name = 'PromptProcessingError';
  }
}

// Version
export const VERSION = '1.0.0';
export const BUILD_DATE = new Date().toISOString();
