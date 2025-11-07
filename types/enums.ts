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
  Salaries = 'Salários',
  Rent = 'Aluguel',
  Utilities = 'Utilidades',
  Supplies = 'Suprimentos',
  Marketing = 'Marketing',
  Other = 'Outro',
}

// --- Intern & Education Enums ---

export enum InternStatus {
  Pending = 'Pendente',
  Approved = 'Aprovado',
  Rejected = 'Rejeitado',
  Active = 'Ativo',
  Graduated = 'Graduado',
}

export enum CompetencyLevel {
  Beginner = 'Iniciante',
  Intermediate = 'Intermediário',
  Advanced = 'Avançado',
  Expert = 'Especialista',
}

export enum CompetencyCategory {
  Assessment = 'Avaliação',
  Treatment = 'Tratamento',
  Communication = 'Comunicação',
  Documentation = 'Documentação',
  Professionalism = 'Profissionalismo',
}

// --- Inventory Enums ---

export enum ItemStatus {
  Available = 'Disponível',
  LowStock = 'Estoque Baixo',
  OutOfStock = 'Fora de Estoque',
  OnOrder = 'Em Pedido',
}

export enum InventoryAlertType {
  LowStock = 'Estoque Baixo',
  OutOfStock = 'Fora de Estoque',
  Expiring = 'Expirando',
  Expired = 'Expirado',
}

// --- Events & Partnerships Enums ---

export enum EventType {
  Workshop = 'Workshop',
  Training = 'Treinamento',
  Conference = 'Conferência',
  Webinar = 'Webinar',
  SocialEvent = 'Evento Social',
}

export enum EventStatus {
  Scheduled = 'Agendado',
  InProgress = 'Em Andamento',
  Completed = 'Concluído',
  Cancelled = 'Cancelado',
}

export enum RegistrationStatus {
  Pending = 'Pendente',
  Confirmed = 'Confirmado',
  Cancelled = 'Cancelado',
}

export enum ProviderStatus {
  Active = 'Ativo',
  Inactive = 'Inativo',
  Suspended = 'Suspenso',
}

// --- Calendar Enums ---

export enum CalendarFeature {
  WeekView = 'Visão Semanal',
  MonthView = 'Visão Mensal',
  DayView = 'Visão Diária',
  AgendaView = 'Visão de Agenda',
  ConflictDetection = 'Detecção de Conflitos',
  RecurringEvents = 'Eventos Recorrentes',
  Reminders = 'Lembretes',
  MultipleCalendars = 'Múltiplos Calendários',
  ColorCoding = 'Codificação por Cores',
  DragAndDrop = 'Arrastar e Soltar',
}

// --- Communication Enums ---

export enum CommunicationChannel {
  WhatsApp = 'WhatsApp',
  Email = 'E-mail',
  SMS = 'SMS',
  Phone = 'Telefone',
  InPerson = 'Presencial',
}

export enum ChannelCapability {
  TextMessage = 'Mensagem de Texto',
  RichMedia = 'Mídia Rica',
  VoiceCall = 'Chamada de Voz',
  VideoCall = 'Chamada de Vídeo',
  FileAttachment = 'Anexo de Arquivo',
  ReadReceipts = 'Confirmação de Leitura',
  Encryption = 'Criptografia',
}

export enum MessagePriority {
  Low = 'Baixa',
  Normal = 'Normal',
  High = 'Alta',
  Urgent = 'Urgente',
}

export enum MessageStatus {
  Draft = 'Rascunho',
  Scheduled = 'Agendado',
  Sent = 'Enviado',
  Delivered = 'Entregue',
  Read = 'Lido',
  Failed = 'Falhou',
  Cancelled = 'Cancelado',
}

// --- Templates & Campaigns Enums ---

export enum TemplateType {
  Appointment = 'Agendamento',
  Reminder = 'Lembrete',
  Welcome = 'Boas-vindas',
  FollowUp = 'Acompanhamento',
  Promotional = 'Promocional',
  Educational = 'Educacional',
  Survey = 'Pesquisa',
  Alert = 'Alerta',
  Custom = 'Personalizado',
}

export enum CampaignStatus {
  Draft = 'Rascunho',
  Scheduled = 'Agendado',
  InProgress = 'Em Andamento',
  Completed = 'Concluído',
  Paused = 'Pausado',
  Cancelled = 'Cancelado',
}

// --- Automation Enums ---

export enum TriggerType {
  AppointmentCreated = 'Agendamento Criado',
  AppointmentCancelled = 'Agendamento Cancelado',
  AppointmentCompleted = 'Agendamento Concluído',
  PatientRegistered = 'Paciente Registrado',
  PaymentReceived = 'Pagamento Recebido',
  PaymentOverdue = 'Pagamento Atrasado',
  BirthdayReminder = 'Lembrete de Aniversário',
  FollowUpDue = 'Acompanhamento Devido',
  Custom = 'Personalizado',
}

