/**
 * Tipos TypeScript para o sistema CRM
 * Activity Fisioterapia Integration
 */

export type LeadStatus = 'novo' | 'contatado' | 'qualificado' | 'agendado' | 'convertido' | 'perdido';

export type LeadSource = 'whatsapp' | 'instagram' | 'google' | 'facebook' | 'indicacao' | 'website' | 'outros';

export type UrgencyLevel = 'baixa' | 'media' | 'alta' | 'urgente';

export type InteractionType = 'whatsapp' | 'call' | 'email' | 'sms' | 'in_person' | 'auto_message';

export type InteractionDirection = 'inbound' | 'outbound';

export type InteractionStatus = 'sent' | 'delivered' | 'read' | 'replied' | 'failed' | 'bounced';

export type DetectedIntent =
  | 'greeting'
  | 'schedule'
  | 'reschedule'
  | 'cancel'
  | 'info_price'
  | 'info_location'
  | 'info_hours'
  | 'info_insurance'
  | 'pain_sports'
  | 'pain_atm'
  | 'running_assessment'
  | 'question'
  | 'other';

export type DetectedSentiment = 'positive' | 'neutral' | 'negative';

export interface Lead {
  id: string;
  clinic_id: string;
  
  // Informações básicas
  name: string;
  phone: string;
  email?: string;
  
  // Origem e classificação
  source: LeadSource;
  service_interest?: string;
  status: LeadStatus;
  
  // Dados de qualificação
  pain_description?: string;
  sport_activity?: string;
  pain_duration?: string;
  pain_location?: string;
  urgency_level: UrgencyLevel;
  
  // Tracking de interações
  first_contact_at: string;
  last_contact_at?: string;
  next_follow_up_at?: string;
  contact_count: number;
  whatsapp_messages_sent: number;
  whatsapp_messages_received: number;
  
  // Conversão
  converted_to_patient_id?: string;
  converted_at?: string;
  conversion_source?: string;
  
  // Remarketing
  remarketing_sequence: number;
  remarketing_paused: boolean;
  last_remarketing_at?: string;
  
  // Atribuição e métricas de marketing
  campaign_id?: string;
  ad_id?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  estimated_value?: number;
  
  // Notas e tags
  notes?: string[];
  tags?: string[];
  
  // Auditoria
  assigned_to?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

export interface LeadInteraction {
  id: string;
  lead_id: string;
  clinic_id: string;
  
  // Tipo de interação
  interaction_type: InteractionType;
  direction: InteractionDirection;
  channel?: string;
  
  // Conteúdo da mensagem
  message_content?: string;
  message_template_id?: string;
  message_template_name?: string;
  
  // Status da interação
  status?: InteractionStatus;
  status_updated_at?: string;
  
  // Resposta do lead
  lead_response?: string;
  lead_responded_at?: string;
  
  // Detecção automática (IA)
  detected_intent?: DetectedIntent;
  detected_sentiment?: DetectedSentiment;
  ai_confidence?: number;
  
  // Agente responsável
  agent_id?: string;
  is_automated: boolean;
  
  // Metadados
  metadata?: Record<string, any>;
  
  // Tracking
  created_at: string;
}

export interface MessageTemplate {
  id: string;
  clinic_id?: string;
  
  // Identificação
  name: string;
  description?: string;
  category: 'welcome' | 'follow_up' | 'remarketing' | 'confirmation' | 'reminder' | 'info' | 'automation';
  channel: 'whatsapp' | 'email' | 'sms' | 'all';
  
  // Conteúdo
  subject?: string;
  body: string;
  variables?: string[];
  
  // Template WhatsApp Business API (Meta)
  whatsapp_template_id?: string;
  whatsapp_template_language: string;
  whatsapp_template_status?: 'pending' | 'approved' | 'rejected' | 'draft';
  whatsapp_template_components?: Record<string, any>;
  
  // Configurações
  is_active: boolean;
  requires_approval: boolean;
  approved_at?: string;
  approved_by?: string;
  
  // Métricas de uso
  times_used: number;
  last_used_at?: string;
  conversion_rate?: number;
  avg_response_time?: number;
  
  // Auditoria
  created_by?: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

export interface AutomationCampaign {
  id: string;
  clinic_id: string;
  
  // Identificação
  name: string;
  description?: string;
  type: 'follow_up' | 'remarketing' | 'nurturing' | 'reengagement' | 'confirmation';
  
  // Configuração do gatilho
  trigger_event: string;
  trigger_conditions?: Record<string, any>;
  trigger_delay_minutes: number;
  
  // Sequência de mensagens
  sequence: CampaignStep[];
  
  // Status e controle
  is_active: boolean;
  start_date?: string;
  end_date?: string;
  max_leads?: number;
  
  // Segmentação
  target_sources?: LeadSource[];
  target_services?: string[];
  target_urgency?: UrgencyLevel[];
  
  // Métricas
  leads_entered: number;
  leads_active: number;
  leads_completed: number;
  messages_sent: number;
  conversions: number;
  conversion_rate?: number;
  
  // Auditoria
  created_by?: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

export interface CampaignStep {
  step: number;
  delay_minutes: number;
  template_id: string;
  conditions?: Record<string, any>;
}

export interface CampaignLead {
  id: string;
  campaign_id: string;
  lead_id: string;
  
  // Controle de progresso
  current_step: number;
  status: 'active' | 'paused' | 'completed' | 'converted' | 'opted_out' | 'failed';
  
  // Datas importantes
  entered_at: string;
  next_action_at?: string;
  completed_at?: string;
  
  // Resultados
  messages_sent: number;
  messages_delivered: number;
  messages_read: number;
  lead_responded: boolean;
  converted: boolean;
  
  // Metadados
  metadata?: Record<string, any>;
}

// Métricas e Dashboard
export interface DashboardMetrics {
  // Leads
  total_leads: number;
  new_leads_today: number;
  new_leads_week: number;
  new_leads_month: number;
  
  // Por status
  leads_by_status: Record<LeadStatus, number>;
  
  // Conversão
  conversion_rate: number;
  converted_this_month: number;
  
  // Tempo de resposta
  avg_response_time_minutes: number;
  
  // Urgência
  urgent_leads: number;
  high_urgency_leads: number;
  
  // Follow-up
  leads_needing_followup: number;
  
  // Por fonte
  leads_by_source: Record<LeadSource, number>;
}

export interface ConversionFunnel {
  total: number;
  contacted: number;
  qualified: number;
  scheduled: number;
  converted: number;
  
  // Taxas de conversão entre etapas
  contact_rate: number;
  qualification_rate: number;
  schedule_rate: number;
  conversion_rate: number;
}

export interface SourcePerformance {
  source: LeadSource;
  total_leads: number;
  converted_leads: number;
  conversion_rate: number;
  avg_value: number;
  total_value: number;
}

