/**
 * Family Portal Types
 * Tipos para Portal de Família/Cuidadores
 */

// Tipos de relacionamento
export enum FamilyRelationship {
  Parent = 'parent',
  Spouse = 'spouse',
  Child = 'child',
  Sibling = 'sibling',
  Caregiver = 'caregiver',
  Guardian = 'guardian',
  Other = 'other'
}

// Níveis de acesso
export enum AccessLevel {
  ViewOnly = 'view_only',              // Apenas visualização
  ViewProgress = 'view_progress',      // Ver progresso e relatórios
  ViewCommunicate = 'view_communicate', // Ver + comunicar com terapeuta
  Full = 'full'                        // Acesso completo (exceto modificações)
}

// Status de consentimento
export enum ConsentStatus {
  Pending = 'pending',
  Approved = 'approved',
  Denied = 'denied',
  Revoked = 'revoked',
  Expired = 'expired'
}

// Membro da família com acesso
export interface FamilyMember {
  id: string;
  patientId: string;
  
  // Informações pessoais
  name: string;
  email: string;
  phone: string;
  cpf?: string;
  
  // Relacionamento
  relationship: FamilyRelationship;
  relationshipDetails?: string;
  isPrimaryContact: boolean;
  
  // Acesso
  accessLevel: AccessLevel;
  permissions: FamilyPermissions;
  
  // Consentimento
  consentStatus: ConsentStatus;
  consentGivenBy: string; // ID do paciente
  consentGivenAt?: Date;
  consentExpiresAt?: Date;
  consentDocument?: string;
  
  // Status
  isActive: boolean;
  isVerified: boolean;
  verifiedAt?: Date;
  
  // Preferências
  preferredLanguage: string;
  preferredContact: 'email' | 'sms' | 'whatsapp' | 'phone';
  notificationPreferences: {
    appointments: boolean;
    progress: boolean;
    alerts: boolean;
    messages: boolean;
  };
  
  // Metadados
  createdAt: Date;
  updatedAt: Date;
  lastAccessAt?: Date;
}

// Permissões específicas
export interface FamilyPermissions {
  viewMedicalHistory: boolean;
  viewTreatmentPlan: boolean;
  viewProgress: boolean;
  viewAppointments: boolean;
  viewFinancial: boolean;
  viewDocuments: boolean;
  
  receiveProgressUpdates: boolean;
  receiveAppointmentReminders: boolean;
  receiveAlerts: boolean;
  
  contactTherapist: boolean;
  viewMessages: boolean;
  
  requestAppointments: boolean;
  cancelAppointments: boolean;
}

// Consentimento para acesso familiar
export interface FamilyAccessConsent {
  id: string;
  patientId: string;
  familyMemberId: string;
  
  // Consentimento
  consentType: 'full_access' | 'limited_access' | 'emergency_only';
  accessLevel: AccessLevel;
  permissions: FamilyPermissions;
  
  // Documentação
  consentForm: string;
  signedDocument?: string;
  witnessName?: string;
  witnessSignature?: string;
  
  // Validade
  grantedDate: Date;
  expiresDate?: Date;
  autoRenew: boolean;
  
  // Status
  status: ConsentStatus;
  revokedDate?: Date;
  revokedReason?: string;
  
  // Auditoria
  ipAddress: string;
  userAgent: string;
  geolocation?: {
    lat: number;
    lng: number;
  };
  
  createdAt: Date;
  updatedAt: Date;
}

// Atualização de progresso para família
export interface ProgressUpdate {
  id: string;
  patientId: string;
  familyMemberIds: string[]; // Quem pode ver
  
  // Conteúdo
  title: string;
  summary: string;
  details?: string;
  
  // Métricas
  metrics: {
    metric: string;
    previousValue: number;
    currentValue: number;
    change: number;
    unit: string;
    interpretation: string;
  }[];
  
  // Contexto
  treatmentPhase?: string;
  sessionsCompleted?: number;
  totalSessions?: number;
  
  // Próximos passos
  nextSteps: string[];
  goals: {
    goal: string;
    status: 'achieved' | 'in_progress' | 'not_started';
    progress: number; // 0-100
  }[];
  
  // Anexos
  attachments?: {
    type: 'image' | 'video' | 'document';
    url: string;
    description: string;
  }[];
  
  // Feedback
  allowFeedback: boolean;
  feedback?: {
    familyMemberId: string;
    comment: string;
    rating?: number;
    createdAt: Date;
  }[];
  
  // Metadados
  createdBy: string; // ID do terapeuta
  createdAt: Date;
  publishedAt?: Date;
  viewedBy: {
    familyMemberId: string;
    viewedAt: Date;
  }[];
}

// Mensagem entre família e terapeuta
export interface FamilyMessage {
  id: string;
  patientId: string;
  
  // Participantes
  senderId: string;
  senderType: 'family' | 'therapist' | 'system';
  recipientId: string;
  recipientType: 'family' | 'therapist';
  
  // Conteúdo
  subject: string;
  message: string;
  priority: 'normal' | 'urgent';
  
  // Thread
  threadId?: string;
  replyTo?: string;
  
  // Anexos
  attachments?: {
    name: string;
    url: string;
    type: string;
    size: number;
  }[];
  
  // Status
  status: 'sent' | 'delivered' | 'read';
  sentAt: Date;
  deliveredAt?: Date;
  readAt?: Date;
  
  // Resposta
  requiresResponse: boolean;
  respondedAt?: Date;
  
  // Arquivamento
  archived: boolean;
  archivedAt?: Date;
}

// Dashboard da família
export interface FamilyDashboard {
  patient: {
    id: string;
    name: string;
    age: number;
    avatarUrl: string;
    condition: string;
    treatmentPhase: string;
  };
  
  // Acesso
  familyMember: FamilyMember;
  permissions: FamilyPermissions;
  
  // Resumo de progresso
  progressSummary: {
    overallProgress: number; // 0-100
    treatmentStartDate: Date;
    estimatedEndDate?: Date;
    sessionsCompleted: number;
    totalSessions: number;
    lastSessionDate?: Date;
    nextSessionDate?: Date;
  };
  
  // Métricas principais
  keyMetrics: {
    metric: string;
    currentValue: number;
    changeFromBaseline: number;
    trend: 'improving' | 'stable' | 'declining';
    unit: string;
  }[];
  
  // Próximas sessões
  upcomingAppointments: {
    date: Date;
    type: string;
    therapist: string;
    location: string;
    confirmed: boolean;
  }[];
  
  // Atualizações recentes
  recentUpdates: ProgressUpdate[];
  
  // Mensagens
  unreadMessages: number;
  recentMessages: FamilyMessage[];
  
  // Alertas
  alerts: {
    type: 'appointment' | 'progress' | 'concern' | 'achievement';
    message: string;
    date: Date;
    read: boolean;
  }[];
  
  // Documentos
  availableDocuments: {
    id: string;
    name: string;
    type: string;
    date: Date;
    url: string;
  }[];
}

// Relatório para família
export interface FamilyProgressReport {
  id: string;
  patientId: string;
  familyMemberId: string;
  
  // Período
  period: {
    start: Date;
    end: Date;
  };
  
  // Conteúdo
  title: string;
  summary: string;
  
  sections: {
    title: string;
    content: string;
    highlights: string[];
    concerns?: string[];
    charts?: {
      type: string;
      data: any;
      title: string;
    }[];
  }[];
  
  // Progresso
  achievements: {
    achievement: string;
    date: Date;
    significance: 'major' | 'minor';
  }[];
  
  goals: {
    goal: string;
    status: 'achieved' | 'on_track' | 'needs_attention' | 'not_started';
    progress: number;
    expectedCompletion?: Date;
  }[];
  
  // Métricas
  metrics: {
    metric: string;
    baseline: number;
    current: number;
    change: number;
    target?: number;
    unit: string;
  }[];
  
  // Próximos passos
  nextSteps: string[];
  recommendations: string[];
  
  // Anexos
  attachments?: {
    type: string;
    url: string;
    description: string;
  }[];
  
  // Metadados
  generatedAt: Date;
  generatedBy: string;
  approvedBy?: string;
  viewedAt?: Date;
  
  fileUrl?: string;
}

// Solicitação de acesso familiar
export interface FamilyAccessRequest {
  id: string;
  patientId: string;
  
  // Solicitante
  requestedBy: {
    name: string;
    email: string;
    phone: string;
    cpf?: string;
    relationship: FamilyRelationship;
    relationshipDetails?: string;
  };
  
  // Acesso solicitado
  requestedAccessLevel: AccessLevel;
  requestedPermissions: Partial<FamilyPermissions>;
  reason: string;
  
  // Documentação
  identificationDocument?: string;
  authorizationLetter?: string;
  
  // Status
  status: 'pending' | 'approved' | 'denied' | 'expired';
  
  // Decisão
  decidedBy?: string; // ID do paciente ou representante legal
  decidedAt?: Date;
  decisionNotes?: string;
  
  // Datas
  requestedAt: Date;
  expiresAt: Date;
  
  // Notificações
  patientNotified: boolean;
  notifiedAt?: Date;
}

// Histórico de acesso familiar
export interface FamilyAccessLog {
  id: string;
  familyMemberId: string;
  patientId: string;
  
  // Ação
  action: 'view_profile' | 'view_progress' | 'view_appointment' | 'view_document' | 
          'send_message' | 'request_appointment' | 'view_financial' | 'export_report';
  
  resourceType?: string;
  resourceId?: string;
  
  // Detalhes
  details?: string;
  
  // Contexto
  ipAddress: string;
  userAgent: string;
  location?: string;
  
  // Timestamp
  accessedAt: Date;
}

// Configurações de privacidade do paciente
export interface PatientPrivacySettings {
  patientId: string;
  
  // Controle de acesso familiar
  allowFamilyAccess: boolean;
  requireExplicitConsent: boolean;
  
  // Permissões padrão
  defaultAccessLevel: AccessLevel;
  defaultPermissions: FamilyPermissions;
  
  // Restrições
  maxFamilyMembers: number;
  accessExpirationDays?: number;
  requirePeriodicRenewal: boolean;
  renewalPeriodDays?: number;
  
  // Categorias sensíveis
  restrictSensitiveInfo: {
    mentalHealthInfo: boolean;
    substanceAbuseHistory: boolean;
    hivStatus: boolean;
    geneticInfo: boolean;
    reproductiveHealth: boolean;
  };
  
  // Notificações
  notifyOnFamilyAccess: boolean;
  notifyOnAccessRequest: boolean;
  notifyMethod: 'email' | 'sms' | 'both';
  
  updatedAt: Date;
}

// Notificação para família
export interface FamilyNotification {
  id: string;
  familyMemberId: string;
  patientId: string;
  
  type: 'appointment_reminder' | 'progress_update' | 'alert' | 'message' | 
        'document_available' | 'milestone_achieved' | 'concern_raised';
  
  title: string;
  message: string;
  
  // Dados relacionados
  relatedEntityType?: 'appointment' | 'update' | 'document' | 'message';
  relatedEntityId?: string;
  
  priority: 'low' | 'normal' | 'high' | 'urgent';
  
  // Status
  sent: boolean;
  sentAt?: Date;
  delivered: boolean;
  deliveredAt?: Date;
  read: boolean;
  readAt?: Date;
  
  // Ações
  actionRequired: boolean;
  actionUrl?: string;
  actionLabel?: string;
  actionCompleted: boolean;
  
  // Expiração
  expiresAt?: Date;
  
  createdAt: Date;
}

// Analytics de engajamento familiar
export interface FamilyEngagementMetrics {
  patientId: string;
  period: {
    start: Date;
    end: Date;
  };
  
  // Acesso
  totalFamilyMembers: number;
  activeFamilyMembers: number;
  
  accessMetrics: {
    totalLogins: number;
    uniqueVisitors: number;
    averageSessionDuration: number; // minutos
    averagePageViews: number;
  };
  
  // Engajamento
  progressUpdatesViewed: number;
  messagesExchanged: number;
  documentsDownloaded: number;
  
  // Interações
  mostViewedSections: {
    section: string;
    views: number;
  }[];
  
  // Comunicação
  messageResponseRate: number; // 0-1
  averageResponseTime: number; // horas
  
  // Satisfação
  satisfactionRating?: number; // 1-10
  feedback: {
    positive: number;
    neutral: number;
    negative: number;
  };
}

