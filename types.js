// --- User & Auth Types ---
export var Role;
(function (Role) {
    Role["Admin"] = "Admin";
    Role["Therapist"] = "Fisioterapeuta";
    Role["Patient"] = "Paciente";
    Role["EducadorFisico"] = "EducadorFisico";
})(Role || (Role = {}));
export var AIProvider;
(function (AIProvider) {
    AIProvider["Gemini"] = "gemini";
    AIProvider["OpenAI"] = "openai";
    AIProvider["Anthropic"] = "anthropic";
    AIProvider["Groq"] = "groq";
    AIProvider["Mock"] = "mock";
})(AIProvider || (AIProvider = {}));
// --- Patient Related Types ---
export var PatientStatus;
(function (PatientStatus) {
    PatientStatus["Active"] = "Active";
    PatientStatus["Inactive"] = "Inactive";
    PatientStatus["Discharged"] = "Discharged";
})(PatientStatus || (PatientStatus = {}));
// --- Appointment & Scheduling Types ---
export var AppointmentStatus;
(function (AppointmentStatus) {
    AppointmentStatus["Scheduled"] = "Agendado";
    AppointmentStatus["Completed"] = "Realizado";
    AppointmentStatus["Canceled"] = "Cancelado";
    AppointmentStatus["NoShow"] = "Faltou";
})(AppointmentStatus || (AppointmentStatus = {}));
// Mapping for AppointmentStatus to lowercase keys for UI components
export const AppointmentStatusMap = {
    scheduled: AppointmentStatus.Scheduled,
    confirmed: AppointmentStatus.Scheduled, // Confirmed is a variant of scheduled
    completed: AppointmentStatus.Completed,
    cancelled: AppointmentStatus.Canceled,
    no_show: AppointmentStatus.NoShow
};
export var AppointmentType;
(function (AppointmentType) {
    AppointmentType["Evaluation"] = "Avalia\u00E7\u00E3o";
    AppointmentType["Session"] = "Sess\u00E3o";
    AppointmentType["Return"] = "Retorno";
    AppointmentType["Pilates"] = "Pilates";
    AppointmentType["Urgent"] = "Urgente";
    AppointmentType["Teleconsulta"] = "Teleconsulta";
})(AppointmentType || (AppointmentType = {}));
export const AppointmentTypeColors = {
    [AppointmentType.Evaluation]: 'purple',
    [AppointmentType.Session]: 'emerald',
    [AppointmentType.Return]: 'blue',
    [AppointmentType.Pilates]: 'amber',
    [AppointmentType.Urgent]: 'red',
    [AppointmentType.Teleconsulta]: 'cyan',
};
// --- Clinical Protocols Types ---
export var ProtocolCategory;
(function (ProtocolCategory) {
    ProtocolCategory["Orthopedic"] = "Ortopedia";
    ProtocolCategory["Neurological"] = "Neurologia";
    ProtocolCategory["Cardiorespiratory"] = "Cardiorrespirat\u00F3ria";
    ProtocolCategory["Pediatric"] = "Pediatria";
    ProtocolCategory["Sports"] = "Esportiva";
    ProtocolCategory["Geriatric"] = "Gerontologia";
    ProtocolCategory["Oncology"] = "Oncologia";
    ProtocolCategory["Women"] = "Sa\u00FAde da Mulher";
})(ProtocolCategory || (ProtocolCategory = {}));
export var EvidenceLevel;
(function (EvidenceLevel) {
    EvidenceLevel["IA"] = "1A";
    EvidenceLevel["IB"] = "1B";
    EvidenceLevel["IIA"] = "2A";
    EvidenceLevel["IIB"] = "2B";
    EvidenceLevel["III"] = "3";
    EvidenceLevel["IV"] = "4";
    EvidenceLevel["V"] = "5";
})(EvidenceLevel || (EvidenceLevel = {}));
export var ProtocolPhase;
(function (ProtocolPhase) {
    ProtocolPhase["Acute"] = "Aguda";
    ProtocolPhase["Subacute"] = "Subaguda";
    ProtocolPhase["Chronic"] = "Cr\u00F4nica";
    ProtocolPhase["Maintenance"] = "Manuten\u00E7\u00E3o";
})(ProtocolPhase || (ProtocolPhase = {}));
// --- Task & Project Management Types ---
export var ProjectStatus;
(function (ProjectStatus) {
    ProjectStatus["Active"] = "Ativo";
    ProjectStatus["Concluded"] = "Conclu\u00EDdo";
    ProjectStatus["Paused"] = "Pausado";
})(ProjectStatus || (ProjectStatus = {}));
export var TaskStatus;
(function (TaskStatus) {
    TaskStatus["ToDo"] = "A Fazer";
    TaskStatus["InProgress"] = "Em Andamento";
    TaskStatus["Done"] = "Conclu\u00EDdo";
})(TaskStatus || (TaskStatus = {}));
export var TaskPriority;
(function (TaskPriority) {
    TaskPriority["High"] = "Alta";
    TaskPriority["Medium"] = "M\u00E9dia";
    TaskPriority["Low"] = "Baixa";
})(TaskPriority || (TaskPriority = {}));
// --- Financial & Partnership Types ---
export var TransactionType;
(function (TransactionType) {
    TransactionType["Receita"] = "Receita";
    TransactionType["Despesa"] = "Despesa";
})(TransactionType || (TransactionType = {}));
export var ExpenseCategory;
(function (ExpenseCategory) {
    ExpenseCategory["Salaries"] = "Salaries";
    ExpenseCategory["Rent"] = "Rent";
    ExpenseCategory["Equipment"] = "Equipment";
    ExpenseCategory["Supplies"] = "Supplies";
    ExpenseCategory["Marketing"] = "Marketing";
    ExpenseCategory["Other"] = "Other";
    ExpenseCategory["Outros"] = "Outros";
    ExpenseCategory["Aluguel"] = "Aluguel";
    ExpenseCategory["Salarios"] = "Salarios";
    ExpenseCategory["Suprimentos"] = "Suprimentos";
})(ExpenseCategory || (ExpenseCategory = {}));
// --- Mentorship & Teaching Module Types ---
export var InternStatus;
(function (InternStatus) {
    InternStatus["Active"] = "Active";
    InternStatus["Inactive"] = "Inactive";
    InternStatus["Graduated"] = "Graduated";
    InternStatus["Suspended"] = "Suspended";
})(InternStatus || (InternStatus = {}));
// Status color mapping for InternStatus
export const InternStatusColorMap = {
    [InternStatus.Active]: 'bg-green-100 text-green-800',
    [InternStatus.Inactive]: 'bg-slate-100 text-slate-800',
    [InternStatus.Graduated]: 'bg-blue-100 text-blue-800',
    [InternStatus.Suspended]: 'bg-red-100 text-red-800',
};
export var CompetencyLevel;
(function (CompetencyLevel) {
    CompetencyLevel["Beginner"] = "Beginner";
    CompetencyLevel["Intermediate"] = "Intermediate";
    CompetencyLevel["Advanced"] = "Advanced";
    CompetencyLevel["Expert"] = "Expert";
})(CompetencyLevel || (CompetencyLevel = {}));
export var CompetencyCategory;
(function (CompetencyCategory) {
    CompetencyCategory["Assessment"] = "Assessment";
    CompetencyCategory["Treatment"] = "Treatment";
    CompetencyCategory["Communication"] = "Communication";
    CompetencyCategory["Documentation"] = "Documentation";
    CompetencyCategory["Research"] = "Research";
    CompetencyCategory["Management"] = "Management";
})(CompetencyCategory || (CompetencyCategory = {}));
export var ItemStatus;
(function (ItemStatus) {
    ItemStatus["Active"] = "Active";
    ItemStatus["Maintenance"] = "Maintenance";
    ItemStatus["Retired"] = "Retired";
    ItemStatus["Inactive"] = "Inactive";
    ItemStatus["OutOfStock"] = "OutOfStock";
    ItemStatus["Discontinued"] = "Discontinued";
})(ItemStatus || (ItemStatus = {}));
export var MovementType;
(function (MovementType) {
    MovementType["In"] = "In";
    MovementType["Out"] = "Out";
    MovementType["Transfer"] = "Transfer";
})(MovementType || (MovementType = {}));
// Helper functions to convert between MovementType enum and Portuguese strings
export const MovementTypeUtils = {
    toPortuguese: (type) => {
        switch (type) {
            case MovementType.In: return 'entrada';
            case MovementType.Out: return 'saida';
            case MovementType.Transfer: return 'transferencia';
            default: return type;
        }
    },
    fromPortuguese: (str) => {
        switch (str.toLowerCase()) {
            case 'entrada': return MovementType.In;
            case 'saida': return MovementType.Out;
            case 'transferencia': return MovementType.Transfer;
            default: return MovementType.In;
        }
    },
    isEntrada: (type) => type === MovementType.In,
    isSaida: (type) => type === MovementType.Out
};
export var InventoryAlertType;
(function (InventoryAlertType) {
    InventoryAlertType["LowStock"] = "LowStock";
    InventoryAlertType["OutOfStock"] = "OutOfStock";
    InventoryAlertType["Expiring"] = "Expiring";
    InventoryAlertType["Expired"] = "Expired";
})(InventoryAlertType || (InventoryAlertType = {}));
// --- Event Management Types ---
export var EventType;
(function (EventType) {
    EventType["Workshop"] = "Workshop";
    EventType["Seminar"] = "Semin\u00E1rio";
    EventType["Conference"] = "Confer\u00EAncia";
    EventType["Training"] = "Treinamento";
    EventType["Meeting"] = "Reuni\u00E3o";
    EventType["Campaign"] = "Campanha";
    EventType["Race"] = "Corrida";
    EventType["Other"] = "Outro";
})(EventType || (EventType = {}));
export var EventStatus;
(function (EventStatus) {
    EventStatus["Draft"] = "Draft";
    EventStatus["Published"] = "Published";
    EventStatus["Active"] = "Active";
    EventStatus["InProgress"] = "InProgress";
    EventStatus["Completed"] = "Completed";
    EventStatus["Cancelled"] = "Cancelled";
})(EventStatus || (EventStatus = {}));
export var RegistrationStatus;
(function (RegistrationStatus) {
    RegistrationStatus["Pending"] = "Pending";
    RegistrationStatus["Confirmed"] = "Confirmed";
    RegistrationStatus["Attended"] = "Attended";
    RegistrationStatus["Cancelled"] = "Cancelled";
})(RegistrationStatus || (RegistrationStatus = {}));
export var ProviderStatus;
(function (ProviderStatus) {
    ProviderStatus["Applied"] = "Applied";
    ProviderStatus["Confirmed"] = "Confirmed";
    ProviderStatus["Paid"] = "Paid";
    ProviderStatus["Rejected"] = "Rejected";
    ProviderStatus["Cancelled"] = "Cancelled"; // Added missing status
})(ProviderStatus || (ProviderStatus = {}));
// --- Calendar Integration Types ---
export var CalendarFeature;
(function (CalendarFeature) {
    CalendarFeature["CREATE_EVENT"] = "CREATE_EVENT";
    CalendarFeature["UPDATE_EVENT"] = "UPDATE_EVENT";
    CalendarFeature["DELETE_EVENT"] = "DELETE_EVENT";
    CalendarFeature["REMINDERS"] = "REMINDERS";
    CalendarFeature["RECURRENCE"] = "RECURRENCE";
    CalendarFeature["ATTENDEES"] = "ATTENDEES";
    CalendarFeature["AVAILABILITY"] = "AVAILABILITY";
})(CalendarFeature || (CalendarFeature = {}));
export var CommunicationChannel;
(function (CommunicationChannel) {
    CommunicationChannel["Email"] = "email";
    CommunicationChannel["SMS"] = "sms";
    CommunicationChannel["WhatsApp"] = "whatsapp";
    CommunicationChannel["Push"] = "push";
    CommunicationChannel["Voice"] = "voice";
})(CommunicationChannel || (CommunicationChannel = {}));
export var ChannelCapability;
(function (ChannelCapability) {
    // Channel types
    ChannelCapability["Email"] = "email";
    ChannelCapability["SMS"] = "sms";
    ChannelCapability["WhatsApp"] = "whatsapp";
    ChannelCapability["Push"] = "push";
    ChannelCapability["Voice"] = "voice";
    ChannelCapability["Automation"] = "automation";
    // Content capabilities
    ChannelCapability["TEXT"] = "text";
    ChannelCapability["HTML"] = "html";
    ChannelCapability["IMAGES"] = "images";
    ChannelCapability["DOCUMENTS"] = "documents";
    ChannelCapability["RICH_CONTENT"] = "rich_content";
    ChannelCapability["ATTACHMENTS"] = "attachments";
    ChannelCapability["TEMPLATES"] = "templates";
    ChannelCapability["DELIVERY_STATUS"] = "delivery_status";
    ChannelCapability["TRACKING"] = "tracking";
    ChannelCapability["SHORT_LINKS"] = "short_links";
})(ChannelCapability || (ChannelCapability = {}));
export var MessagePriority;
(function (MessagePriority) {
    MessagePriority["Low"] = "low";
    MessagePriority["Normal"] = "normal";
    MessagePriority["High"] = "high";
    MessagePriority["Critical"] = "critical";
})(MessagePriority || (MessagePriority = {}));
export var MessageStatus;
(function (MessageStatus) {
    MessageStatus["Pending"] = "pending";
    MessageStatus["Queued"] = "queued";
    MessageStatus["Processing"] = "processing";
    MessageStatus["Sending"] = "sending";
    MessageStatus["Sent"] = "sent";
    MessageStatus["Delivered"] = "delivered";
    MessageStatus["Read"] = "read";
    MessageStatus["Failed"] = "failed";
    MessageStatus["Cancelled"] = "cancelled";
    MessageStatus["RetryScheduled"] = "retry_scheduled";
})(MessageStatus || (MessageStatus = {}));
export var TemplateType;
(function (TemplateType) {
    TemplateType["Transactional"] = "transactional";
    TemplateType["Reminder"] = "reminder";
    TemplateType["Marketing"] = "marketing";
    TemplateType["FollowUp"] = "follow_up";
    TemplateType["Alert"] = "alert";
})(TemplateType || (TemplateType = {}));
export var CampaignStatus;
(function (CampaignStatus) {
    CampaignStatus["Draft"] = "draft";
    CampaignStatus["Scheduled"] = "scheduled";
    CampaignStatus["Running"] = "running";
    CampaignStatus["Paused"] = "paused";
    CampaignStatus["Completed"] = "completed";
    CampaignStatus["Cancelled"] = "cancelled";
})(CampaignStatus || (CampaignStatus = {}));
// --- Automation Types ---
export var TriggerType;
(function (TriggerType) {
    TriggerType["APPOINTMENT_CREATED"] = "APPOINTMENT_CREATED";
    TriggerType["APPOINTMENT_REMINDER"] = "APPOINTMENT_REMINDER";
    TriggerType["PAYMENT_DUE"] = "PAYMENT_DUE";
    TriggerType["TREATMENT_COMPLETED"] = "TREATMENT_COMPLETED";
    TriggerType["PATIENT_REGISTERED"] = "PATIENT_REGISTERED";
    TriggerType["FOLLOW_UP_DUE"] = "FOLLOW_UP_DUE";
})(TriggerType || (TriggerType = {}));
