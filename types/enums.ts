// =============================================================================
// ENUMS CENTRALIZADOS
// =============================================================================
// Este arquivo contém todos os enums do sistema sem dependências do React
// para evitar problemas de importação circular e ordem de carregamento
// =============================================================================

// --- User & Auth Enums ---

export enum Role {
  Admin = 'admin',
  Therapist = 'therapist',
  Patient = 'patient',
  Educator = 'educator',
  Partner = 'partner',
  Manager = 'manager',
  Receptionist = 'receptionist',
}

export enum AIProvider {
  Gemini = 'gemini',
  OpenAI = 'openai',
  Anthropic = 'anthropic',
  Groq = 'groq',
  Mock = 'mock'
}

// --- Patient Related Enums ---

export enum PatientStatus {
  Active = 'Active',
  Inactive = 'Inactive',
  Discharged = 'Discharged',
}

// --- Appointment & Scheduling Enums ---

export enum AppointmentStatus {
  Scheduled = 'Agendado',
  Confirmed = 'Confirmado',
  InProgress = 'Em Andamento',
  Completed = 'Realizado',
  Canceled = 'Cancelado',
  Cancelled = 'Cancelado', // Alias para Canceled
  NoShow = 'Faltou'
}

export enum AppointmentType {
    Evaluation = 'Avaliação',
    Session = 'Sessão',
    Return = 'Retorno',
    Pilates = 'Pilates',
    Urgent = 'Urgente',
    Teleconsulta = 'Teleconsulta',
}

// --- Clinical Protocols Enums ---

export enum ProtocolCategory {
  Orthopedic = 'Ortopedia',
  Neurological = 'Neurologia',
  Cardiorespiratory = 'Cardiorrespiratória',
  Pediatric = 'Pediatria',
  Sports = 'Esportiva',
  Geriatric = 'Gerontologia',
  Oncology = 'Oncologia',
  Women = 'Saúde da Mulher',
}

export enum EvidenceLevel {
  IA = '1A',
  IB = '1B',
  IIA = '2A',
  IIB = '2B',
  III = '3',
  IV = '4',
  V = '5',
}

export enum ProtocolPhase {
  Acute = 'Aguda',
  Subacute = 'Subaguda',
  Chronic = 'Crônica',
  Maintenance = 'Manutenção',
}

// --- Task & Project Management Enums ---

export enum ProjectStatus {
  Active = 'Ativo',
  Concluded = 'Concluído',
  Paused = 'Pausado',
}

export enum TaskStatus {
  ToDo = 'A Fazer',
  InProgress = 'Em Andamento',
  Done = 'Concluído',
}

export enum TaskPriority {
  High = 'Alta',
  Medium = 'Média',
  Low = 'Baixa',
}

// --- Financial Enums ---

export enum TransactionType {
  Receita = 'Receita',
  Despesa = 'Despesa',
}

export enum ExpenseCategory {
  Salaries = 'Salaries',
  Rent = 'Rent',
  Equipment = 'Equipment',
  Supplies = 'Supplies',
  Marketing = 'Marketing',
  Other = 'Other',
  Outros = 'Outros', // Portuguese compatibility
  Aluguel = 'Aluguel', // Portuguese for Rent
  Salarios = 'Salarios', // Portuguese for Salaries
  Suprimentos = 'Suprimentos', // Portuguese for Supplies
}

// --- Intern & Education Enums ---

export enum InternStatus {
  Active = 'Active',
  Inactive = 'Inactive',
  Graduated = 'Graduated',
  Suspended = 'Suspended'
}

export enum CompetencyLevel {
  Beginner = 'Beginner',
  Intermediate = 'Intermediate',
  Advanced = 'Advanced',
  Expert = 'Expert'
}

export enum CompetencyCategory {
  Assessment = 'Assessment',
  Treatment = 'Treatment',
  Communication = 'Communication',
  Documentation = 'Documentation',
  Research = 'Research',
  Management = 'Management'
}

// --- Inventory Enums ---

export enum ItemStatus {
  Active = 'Active',
  Maintenance = 'Maintenance',
  Retired = 'Retired',
  Inactive = 'Inactive',
  OutOfStock = 'OutOfStock',
  Discontinued = 'Discontinued'
}

export enum InventoryAlertType {
    LowStock = 'LowStock',
    OutOfStock = 'OutOfStock',
    Expiring = 'Expiring',
    Expired = 'Expired',
    OverdueOrder = 'OverdueOrder',
    HighConsumption = 'HighConsumption',
    LowTurnover = 'LowTurnover',
    PriceChange = 'PriceChange',
    SupplierDelay = 'SupplierDelay'
}

// --- Events & Partnerships Enums ---

export enum EventType {
  Workshop = 'Workshop',
  Seminar = 'Seminário',
  Conference = 'Conferência',
  Training = 'Treinamento',
  Meeting = 'Reunião',
  Campaign = 'Campanha',
  Race = 'Corrida',
  Other = 'Outro'
}

export enum EventStatus {
  Draft = 'Draft',
  Published = 'Published',
  Active = 'Active',
  InProgress = 'InProgress',
  Completed = 'Completed',
  Cancelled = 'Cancelled'
}

export enum RegistrationStatus {
  Pending = 'Pending',
  Confirmed = 'Confirmed',
  Attended = 'Attended',
  Cancelled = 'Cancelled'
}

export enum ProviderStatus {
  Applied = 'Applied',
  Confirmed = 'Confirmed',
  Paid = 'Paid',
  Rejected = 'Rejected',
  Cancelled = 'Cancelled'
}

// --- Calendar Enums ---

export enum CalendarFeature {
  CREATE_EVENT = 'CREATE_EVENT',
  UPDATE_EVENT = 'UPDATE_EVENT',
  DELETE_EVENT = 'DELETE_EVENT',
  REMINDERS = 'REMINDERS',
  RECURRENCE = 'RECURRENCE',
  ATTENDEES = 'ATTENDEES',
  AVAILABILITY = 'AVAILABILITY'
}

// --- Communication Enums ---

export enum CommunicationChannel {
  Email = 'email',
  SMS = 'sms',
  WhatsApp = 'whatsapp',
  Push = 'push',
  Voice = 'voice'
}

export enum ChannelCapability {
  // Channel types
  Email = 'email',
  SMS = 'sms',
  WhatsApp = 'whatsapp',
  Push = 'push',
  Voice = 'voice',
  Automation = 'automation',

  // Content capabilities
  TEXT = 'text',
  HTML = 'html',
  IMAGES = 'images',
  DOCUMENTS = 'documents',
  RICH_CONTENT = 'rich_content',
  ATTACHMENTS = 'attachments',
  TEMPLATES = 'templates',
  DELIVERY_STATUS = 'delivery_status',
  TRACKING = 'tracking',
  SHORT_LINKS = 'short_links'
}

export enum MessagePriority {
  Low = 'low',
  Normal = 'normal',
  High = 'high',
  Critical = 'critical'
}

export enum MessageStatus {
  Pending = 'pending',
  Queued = 'queued',
  Processing = 'processing',
  Sending = 'sending',
  Sent = 'sent',
  Delivered = 'delivered',
  Read = 'read',
  Failed = 'failed',
  Cancelled = 'cancelled',
  RetryScheduled = 'retry_scheduled'
}

// --- Templates & Campaigns Enums ---

export enum TemplateType {
  Transactional = 'transactional',
  Reminder = 'reminder',
  Marketing = 'marketing',
  FollowUp = 'follow_up',
  Alert = 'alert'
}

export enum CampaignStatus {
  Draft = 'draft',
  Scheduled = 'scheduled',
  Running = 'running',
  Paused = 'paused',
  Completed = 'completed',
  Cancelled = 'cancelled'
}

// --- Automation Enums ---

export enum TriggerType {
  APPOINTMENT_CREATED = 'APPOINTMENT_CREATED',
  APPOINTMENT_REMINDER = 'APPOINTMENT_REMINDER',
  PAYMENT_DUE = 'PAYMENT_DUE',
  TREATMENT_COMPLETED = 'TREATMENT_COMPLETED',
  PATIENT_REGISTERED = 'PATIENT_REGISTERED',
  FOLLOW_UP_DUE = 'FOLLOW_UP_DUE'
}

