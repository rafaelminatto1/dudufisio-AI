import { AIProvider, KnowledgeBaseEntry } from '../../types';

export type AIConsultationCategory =
  | 'exercise_suggestion'
  | 'patient_progress'
  | 'differential_diagnosis'
  | 'discharge_report'
  | 'patient_question'
  | 'knowledge_update'
  | 'other';

export interface AIQueryContext {
  category?: AIConsultationCategory;
  therapistId?: string;
  patientId?: string;
  preferredProvider?: AIProvider;
  skipKnowledgeBase?: boolean;
  cacheTtlMs?: number;
  metadata?: Record<string, string>;
}

export interface CachePolicyConfig {
  defaultTtlMs: number;
  ttlByCategory: Partial<Record<AIConsultationCategory, number>>;
}

export interface PremiumAccountUsage {
  today: number;
  thisMonth: number;
  lastResetAt: number;
  monthReference: string; // format YYYY-MM to control monthly reset
}

export interface PremiumAccount {
  id: string;
  label: string;
  provider: AIProvider;
  accountEmail: string;
  dailyLimit: number;
  monthlyLimit: number;
  cooldownMinutes: number;
  usage: PremiumAccountUsage;
  status: 'active' | 'cooldown' | 'exhausted';
  cooldownUntil?: number;
  notes?: string;
}

export interface ProviderUsageSnapshot {
  accountId: string;
  provider: AIProvider;
  requests: number;
  failures: number;
  lastUsedAt?: number;
}

export interface OrchestratorMetrics {
  totalQueries: number;
  knowledgeHits: number;
  cacheHits: number;
  providerUsage: Record<string, ProviderUsageSnapshot>;
  lastRotationIndex: number;
  lastMetricsResetAt: Date;
}

export interface ContributionRequest {
  title: string;
  type: KnowledgeBaseEntry['type'];
  content: string;
  tags: string[];
  authorId: string;
  reviewerId?: string;
  notes?: string;
}

export interface ContributionSubmission extends ContributionRequest {
  id: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: Date;
  reviewedAt?: Date;
  reviewNotes?: string;
}
