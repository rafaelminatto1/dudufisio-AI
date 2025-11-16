/**
 * Entidade de Domínio: ClinicalDocument
 * Representa um documento clínico com versionamento e assinatura digital
 * Seguindo padrões de Domain-Driven Design
 */
import { DocumentType, DocumentStatus, DomainError, SignatureError } from '../../../../types/medical-records';
export class ClinicalDocument {
    constructor(id, patientId, type, content, version, createdBy, createdAt, signature, status = DocumentStatus.DRAFT) {
        this.id = id;
        this.patientId = patientId;
        this.type = type;
        this.content = content;
        this.version = version;
        this.createdBy = createdBy;
        this.createdAt = createdAt;
        this.signature = signature;
        this.status = status;
        this.validateInvariants();
    }
    /**
     * Cria um novo documento clínico
     */
    static create(patientId, type, content, createdBy) {
        const id = this.generateId();
        const now = new Date();
        return new ClinicalDocument(id, patientId, type, content, 1, createdBy, now);
    }
    /**
     * Atualiza o conteúdo do documento
     * Só é permitido se o documento não estiver assinado
     */
    updateContent(newContent, updatedBy) {
        if (this.isSigned()) {
            throw new SignatureError('Cannot update signed document', 'content');
        }
        if (this.status === DocumentStatus.ARCHIVED) {
            throw new DomainError('Cannot update archived document', 'ARCHIVED_DOCUMENT_ERROR', 'status');
        }
        // Validar integridade do novo conteúdo
        this.validateContent(newContent);
        return new ClinicalDocument(this.id, this.patientId, this.type, newContent, this.version + 1, this.createdBy, this.createdAt, undefined, // Reset signature on update
        DocumentStatus.DRAFT);
    }
    /**
     * Assina o documento digitalmente
     */
    sign(signature) {
        if (this.isSigned()) {
            throw new SignatureError('Document already signed', 'signature');
        }
        if (this.status !== DocumentStatus.DRAFT) {
            throw new DomainError('Only draft documents can be signed', 'INVALID_STATUS_ERROR', 'status');
        }
        // Validar assinatura
        this.validateSignature(signature);
        return new ClinicalDocument(this.id, this.patientId, this.type, this.content, this.version, this.createdBy, this.createdAt, signature, DocumentStatus.SIGNED);
    }
    /**
     * Verifica se o documento está assinado
     */
    isSigned() {
        return this.signature !== undefined;
    }
    /**
     * Verifica a integridade do documento
     */
    validateIntegrity() {
        if (!this.signature) {
            return true; // Documentos não assinados são considerados íntegros
        }
        // Verificar se o hash do conteúdo atual corresponde ao hash da assinatura
        const currentHash = this.generateContentHash();
        return currentHash === this.signature.documentHash;
    }
    /**
     * Obtém o conteúdo do documento
     */
    getContent() {
        return { ...this.content };
    }
    /**
     * Obtém a assinatura digital
     */
    getSignature() {
        return this.signature ? { ...this.signature } : undefined;
    }
    /**
     * Obtém o status do documento
     */
    getStatus() {
        return this.status;
    }
    /**
     * Arquivar o documento
     */
    archive() {
        if (!this.isSigned()) {
            throw new DomainError('Only signed documents can be archived', 'ARCHIVE_ERROR', 'status');
        }
        return new ClinicalDocument(this.id, this.patientId, this.type, this.content, this.version, this.createdBy, this.createdAt, this.signature, DocumentStatus.ARCHIVED);
    }
    /**
     * Marcar como deletado (soft delete)
     */
    delete() {
        return new ClinicalDocument(this.id, this.patientId, this.type, this.content, this.version, this.createdBy, this.createdAt, this.signature, DocumentStatus.DELETED);
    }
    /**
     * Verifica se o documento requer assinatura
     */
    requiresSignature() {
        return [
            DocumentType.INITIAL_ASSESSMENT,
            DocumentType.DISCHARGE_SUMMARY,
            DocumentType.REFERRAL_LETTER,
            DocumentType.PROGRESS_REPORT
        ].includes(this.type);
    }
    /**
     * Obtém metadados do documento
     */
    getMetadata() {
        return {
            id: this.id,
            patientId: this.patientId,
            type: this.type,
            version: this.version,
            createdBy: this.createdBy,
            createdAt: this.createdAt,
            isSigned: this.isSigned(),
            status: this.status,
            requiresSignature: this.requiresSignature(),
            contentHash: this.generateContentHash()
        };
    }
    /**
     * Gera hash do conteúdo do documento
     */
    generateContentHash() {
        const contentString = JSON.stringify(this.content);
        // Usar crypto-js para gerar hash SHA-256
        const crypto = require('crypto-js');
        return crypto.SHA256(contentString).toString();
    }
    /**
     * Valida as invariantes do documento
     */
    validateInvariants() {
        if (!this.id) {
            throw new DomainError('Document ID is required', 'INVALID_ID_ERROR', 'id');
        }
        if (!this.patientId) {
            throw new DomainError('Patient ID is required', 'INVALID_PATIENT_ID_ERROR', 'patientId');
        }
        if (!this.type) {
            throw new DomainError('Document type is required', 'INVALID_TYPE_ERROR', 'type');
        }
        if (!this.content) {
            throw new DomainError('Document content is required', 'INVALID_CONTENT_ERROR', 'content');
        }
        if (this.version < 1) {
            throw new DomainError('Version must be greater than 0', 'INVALID_VERSION_ERROR', 'version');
        }
        if (!this.createdBy) {
            throw new DomainError('Created by is required', 'INVALID_CREATED_BY_ERROR', 'createdBy');
        }
        if (!this.createdAt) {
            throw new DomainError('Created at is required', 'INVALID_CREATED_AT_ERROR', 'createdAt');
        }
    }
    /**
     * Valida o conteúdo do documento
     */
    validateContent(content) {
        if (!content) {
            throw new DomainError('Content is required', 'INVALID_CONTENT_ERROR', 'content');
        }
        if (!content.data) {
            throw new DomainError('Content data is required', 'INVALID_CONTENT_DATA_ERROR', 'content.data');
        }
        if (!content.metadata) {
            throw new DomainError('Content metadata is required', 'INVALID_CONTENT_METADATA_ERROR', 'content.metadata');
        }
        if (content.version !== this.version + 1) {
            throw new DomainError('Content version must match document version', 'VERSION_MISMATCH_ERROR', 'content.version');
        }
    }
    /**
     * Valida a assinatura digital
     */
    validateSignature(signature) {
        if (!signature) {
            throw new SignatureError('Signature is required', 'signature');
        }
        if (!signature.signature) {
            throw new SignatureError('Signature data is required', 'signature.signature');
        }
        if (!signature.publicKey) {
            throw new SignatureError('Public key is required', 'signature.publicKey');
        }
        if (!signature.timestamp) {
            throw new SignatureError('Timestamp is required', 'signature.timestamp');
        }
        if (!signature.documentHash) {
            throw new SignatureError('Document hash is required', 'signature.documentHash');
        }
        // Verificar se o hash da assinatura corresponde ao hash atual do documento
        const currentHash = this.generateContentHash();
        if (signature.documentHash !== currentHash) {
            throw new SignatureError('Signature hash does not match document content', 'signature.documentHash');
        }
    }
    /**
     * Gera um ID único para o documento
     */
    static generateId() {
        // Usar crypto para gerar UUID v4
        const crypto = require('crypto');
        return crypto.randomUUID();
    }
    /**
     * Reconstrói o documento a partir dos dados persistidos
     */
    static fromPersistence(data) {
        return new ClinicalDocument(data.id, data.patientId, data.type, data.content, data.version, data.createdBy, data.createdAt, data.signature, data.status || DocumentStatus.DRAFT);
    }
    /**
     * Converte o documento para dados de persistência
     */
    toPersistence() {
        return {
            id: this.id,
            patientId: this.patientId,
            type: this.type,
            content: this.content,
            version: this.version,
            createdBy: this.createdBy,
            createdAt: this.createdAt,
            signature: this.signature,
            status: this.status
        };
    }
}
