/**
 * Tipos TypeScript para Sistema de Prontuário Eletrônico Médico
 * Seguindo padrões HL7 FHIR e compliance CFM/COFFITO
 */
// ============================================================================
// ENUMS PRINCIPAIS
// ============================================================================
export var DocumentType;
(function (DocumentType) {
    DocumentType["INITIAL_ASSESSMENT"] = "initial_assessment";
    DocumentType["EVOLUTION"] = "evolution";
    DocumentType["PROGRESS_REPORT"] = "progress_report";
    DocumentType["DISCHARGE_REPORT"] = "discharge_report";
    DocumentType["DISCHARGE_SUMMARY"] = "discharge_summary";
    DocumentType["REFERRAL_LETTER"] = "referral_letter";
    DocumentType["PRESCRIPTION"] = "prescription";
    DocumentType["CERTIFICATE"] = "certificate";
})(DocumentType || (DocumentType = {}));
export var Specialty;
(function (Specialty) {
    Specialty["PHYSIOTHERAPY"] = "physiotherapy";
    Specialty["OCCUPATIONAL_THERAPY"] = "occupational_therapy";
    Specialty["SPEECH_THERAPY"] = "speech_therapy";
    Specialty["ORTHOPEDICS"] = "orthopedics";
    Specialty["NEUROLOGY"] = "neurology";
    Specialty["SPORTS_MEDICINE"] = "sports_medicine";
})(Specialty || (Specialty = {}));
export var SessionType;
(function (SessionType) {
    SessionType["INITIAL_ASSESSMENT"] = "initial_assessment";
    SessionType["FOLLOW_UP"] = "follow_up";
    SessionType["DISCHARGE"] = "discharge";
    SessionType["REEVALUATION"] = "reevaluation";
})(SessionType || (SessionType = {}));
export var PainLevel;
(function (PainLevel) {
    PainLevel[PainLevel["NONE"] = 0] = "NONE";
    PainLevel[PainLevel["MILD"] = 1] = "MILD";
    PainLevel[PainLevel["MODERATE"] = 2] = "MODERATE";
    PainLevel[PainLevel["SEVERE"] = 3] = "SEVERE";
    PainLevel[PainLevel["VERY_SEVERE"] = 4] = "VERY_SEVERE";
    PainLevel[PainLevel["WORST_POSSIBLE"] = 5] = "WORST_POSSIBLE";
})(PainLevel || (PainLevel = {}));
export var DocumentStatus;
(function (DocumentStatus) {
    DocumentStatus["DRAFT"] = "draft";
    DocumentStatus["IN_REVIEW"] = "in_review";
    DocumentStatus["SIGNED"] = "signed";
    DocumentStatus["ARCHIVED"] = "archived";
    DocumentStatus["CANCELLED"] = "cancelled";
    DocumentStatus["DELETED"] = "deleted";
})(DocumentStatus || (DocumentStatus = {}));
export var SignatureAlgorithm;
(function (SignatureAlgorithm) {
    SignatureAlgorithm["RSA_SHA256"] = "RSA-SHA256";
    SignatureAlgorithm["ECDSA_SHA256"] = "ECDSA-SHA256";
    SignatureAlgorithm["ED25519"] = "ED25519";
})(SignatureAlgorithm || (SignatureAlgorithm = {}));
export var AuditAction;
(function (AuditAction) {
    AuditAction["CREATE"] = "CREATE";
    AuditAction["UPDATE"] = "UPDATE";
    AuditAction["DELETE"] = "DELETE";
    AuditAction["VIEW"] = "VIEW";
    AuditAction["SIGN"] = "SIGN";
    AuditAction["ARCHIVE"] = "ARCHIVE";
    AuditAction["RESTORE"] = "RESTORE";
    AuditAction["EXPORT"] = "EXPORT";
    AuditAction["BACKUP_CREATED"] = "BACKUP_CREATED";
    AuditAction["BACKUP_CREATED_MANUAL"] = "BACKUP_CREATED_MANUAL";
    AuditAction["BACKUP_CONFIG_CHANGED"] = "BACKUP_CONFIG_CHANGED";
    AuditAction["VIEW_PARTNER_DASHBOARD"] = "VIEW_PARTNER_DASHBOARD";
    AuditAction["VIEW_REFERRAL_DETAILS"] = "VIEW_REFERRAL_DETAILS";
    AuditAction["CONTACT_CLINIC"] = "CONTACT_CLINIC";
})(AuditAction || (AuditAction = {}));
// ============================================================================
// TIPOS DE ERRO
// ============================================================================
export class DomainError extends Error {
    constructor(message, code, field) {
        super(message);
        this.code = code;
        this.field = field;
        this.name = 'DomainError';
    }
}
export class ValidationError extends DomainError {
    constructor(message, field) {
        super(message, 'VALIDATION_ERROR', field);
        this.name = 'ValidationError';
    }
}
export class ComplianceError extends DomainError {
    constructor(message, field) {
        super(message, 'COMPLIANCE_ERROR', field);
        this.name = 'ComplianceError';
    }
}
export class SignatureError extends DomainError {
    constructor(message, field) {
        super(message, 'SIGNATURE_ERROR', field);
        this.name = 'SignatureError';
    }
}
