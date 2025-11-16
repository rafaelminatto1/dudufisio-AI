// Serviço de integração com Supabase para o sistema de prontuário eletrônico
import { createClient } from '@supabase/supabase-js';
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
export class SupabaseMedicalRecordsService {
    constructor() {
        this.supabase = createClient(supabaseUrl, supabaseKey);
    }
    // ============================================================================
    // DOCUMENTOS CLÍNICOS
    // ============================================================================
    async createClinicalDocument(document) {
        const { data, error } = await this.supabase
            .from('clinical_documents')
            .insert({
            patient_id: document.patientId,
            document_type: document.type,
            version: document.version,
            content: document.content,
            specialty: document.specialty || 'physiotherapy',
            is_signed: document.isSigned,
            signature_data: document.signatureData,
            signed_at: document.signedAt,
            signed_by: document.signedBy,
            status: document.status,
            created_by: document.createdBy
        })
            .select()
            .single();
        if (error)
            throw new Error(`Erro ao criar documento: ${error.message}`);
        return this.mapToClinicalDocument(data);
    }
    async getClinicalDocument(id) {
        const { data, error } = await this.supabase
            .from('clinical_documents')
            .select('*')
            .eq('id', id)
            .single();
        if (error) {
            if (error.code === 'PGRST116')
                return null;
            throw new Error(`Erro ao buscar documento: ${error.message}`);
        }
        return this.mapToClinicalDocument(data);
    }
    async getClinicalDocumentsByPatient(patientId) {
        const { data, error } = await this.supabase
            .from('clinical_documents')
            .select('*')
            .eq('patient_id', patientId)
            .order('created_at', { ascending: false });
        if (error)
            throw new Error(`Erro ao buscar documentos: ${error.message}`);
        return data.map(this.mapToClinicalDocument);
    }
    async updateClinicalDocument(id, updates) {
        const { data, error } = await this.supabase
            .from('clinical_documents')
            .update({
            content: updates.content,
            is_signed: updates.isSigned,
            signature_data: updates.signatureData,
            signed_at: updates.signedAt,
            signed_by: updates.signedBy,
            status: updates.status,
            updated_by: updates.updatedBy
        })
            .eq('id', id)
            .select()
            .single();
        if (error)
            throw new Error(`Erro ao atualizar documento: ${error.message}`);
        return this.mapToClinicalDocument(data);
    }
    async deleteClinicalDocument(id) {
        const { error } = await this.supabase
            .from('clinical_documents')
            .delete()
            .eq('id', id);
        if (error)
            throw new Error(`Erro ao deletar documento: ${error.message}`);
    }
    // ============================================================================
    // AVALIAÇÕES INICIAIS
    // ============================================================================
    async createInitialAssessment(assessment) {
        const { data, error } = await this.supabase
            .from('initial_assessments')
            .insert(assessment)
            .select()
            .single();
        if (error)
            throw new Error(`Erro ao criar avaliação: ${error.message}`);
        return data;
    }
    async getInitialAssessmentByPatient(patientId) {
        const { data, error } = await this.supabase
            .from('initial_assessments')
            .select('*')
            .eq('patient_id', patientId)
            .order('created_at', { ascending: false });
        if (error)
            throw new Error(`Erro ao buscar avaliações: ${error.message}`);
        return data;
    }
    // ============================================================================
    // EVOLUÇÕES DE SESSÃO
    // ============================================================================
    async createSessionEvolution(evolution) {
        const { data, error } = await this.supabase
            .from('session_evolutions')
            .insert(evolution)
            .select()
            .single();
        if (error)
            throw new Error(`Erro ao criar evolução: ${error.message}`);
        return data;
    }
    async getSessionEvolutionsByPatient(patientId, dateRange) {
        let query = this.supabase
            .from('session_evolutions')
            .select('*')
            .eq('patient_id', patientId)
            .order('created_at', { ascending: false });
        if (dateRange) {
            query = query
                .gte('created_at', dateRange.start.toISOString())
                .lte('created_at', dateRange.end.toISOString());
        }
        const { data, error } = await query;
        if (error)
            throw new Error(`Erro ao buscar evoluções: ${error.message}`);
        return data;
    }
    // ============================================================================
    // TEMPLATES CLÍNICOS
    // ============================================================================
    async createClinicalTemplate(template) {
        const { data, error } = await this.supabase
            .from('clinical_templates')
            .insert({
            name: template.name,
            type: template.type,
            specialty: template.specialty,
            template_schema: template.templateSchema,
            default_values: template.defaultValues,
            validation_rules: template.validationRules,
            active: template.active,
            version: template.version,
            created_by: template.createdBy
        })
            .select()
            .single();
        if (error)
            throw new Error(`Erro ao criar template: ${error.message}`);
        return this.mapToClinicalTemplate(data);
    }
    async getClinicalTemplates(type, specialty) {
        let query = this.supabase
            .from('clinical_templates')
            .select('*')
            .eq('active', true)
            .order('created_at', { ascending: false });
        if (type)
            query = query.eq('type', type);
        if (specialty)
            query = query.eq('specialty', specialty);
        const { data, error } = await query;
        if (error)
            throw new Error(`Erro ao buscar templates: ${error.message}`);
        return data.map(this.mapToClinicalTemplate);
    }
    async updateClinicalTemplate(id, updates) {
        const { data, error } = await this.supabase
            .from('clinical_templates')
            .update({
            name: updates.name,
            template_schema: updates.templateSchema,
            default_values: updates.defaultValues,
            validation_rules: updates.validationRules,
            active: updates.active
        })
            .eq('id', id)
            .select()
            .single();
        if (error)
            throw new Error(`Erro ao atualizar template: ${error.message}`);
        return this.mapToClinicalTemplate(data);
    }
    // ============================================================================
    // ASSINATURAS DIGITAIS
    // ============================================================================
    async createDigitalSignature(signature) {
        const { data, error } = await this.supabase
            .from('digital_signatures')
            .insert({
            document_id: signature.documentId,
            signature_data: signature.signatureData,
            certificate_id: signature.certificateId,
            signed_at: signature.signedAt,
            signed_by: signature.signedBy,
            verification_status: signature.verificationStatus
        })
            .select()
            .single();
        if (error)
            throw new Error(`Erro ao criar assinatura: ${error.message}`);
        return this.mapToDigitalSignature(data);
    }
    async getDigitalSignaturesByDocument(documentId) {
        const { data, error } = await this.supabase
            .from('digital_signatures')
            .select('*')
            .eq('document_id', documentId)
            .order('signed_at', { ascending: false });
        if (error)
            throw new Error(`Erro ao buscar assinaturas: ${error.message}`);
        return data.map(this.mapToDigitalSignature);
    }
    async updateSignatureVerificationStatus(id, status) {
        const { error } = await this.supabase
            .from('digital_signatures')
            .update({ verification_status: status })
            .eq('id', id);
        if (error)
            throw new Error(`Erro ao atualizar status da assinatura: ${error.message}`);
    }
    // ============================================================================
    // CERTIFICADOS DIGITAIS
    // ============================================================================
    async createDigitalCertificate(certificate) {
        const { data, error } = await this.supabase
            .from('digital_certificates')
            .insert({
            user_id: certificate.userId,
            certificate_data: certificate.certificateData,
            public_key: certificate.publicKey,
            algorithm: certificate.algorithm,
            valid_from: certificate.validFrom,
            valid_until: certificate.validUntil,
            is_active: certificate.isActive,
            created_by: certificate.createdBy
        })
            .select()
            .single();
        if (error)
            throw new Error(`Erro ao criar certificado: ${error.message}`);
        return this.mapToDigitalCertificate(data);
    }
    async getDigitalCertificatesByUser(userId) {
        const { data, error } = await this.supabase
            .from('digital_certificates')
            .select('*')
            .eq('user_id', userId)
            .eq('is_active', true)
            .order('created_at', { ascending: false });
        if (error)
            throw new Error(`Erro ao buscar certificados: ${error.message}`);
        return data.map(this.mapToDigitalCertificate);
    }
    // ============================================================================
    // AUDITORIA
    // ============================================================================
    async createAuditEntry(entry) {
        const { error } = await this.supabase
            .from('audit_trail')
            .insert(entry);
        if (error)
            throw new Error(`Erro ao criar entrada de auditoria: ${error.message}`);
    }
    async getAuditTrail(documentId) {
        const { data, error } = await this.supabase
            .from('audit_trail')
            .select('*')
            .eq('document_id', documentId)
            .order('performed_at', { ascending: false });
        if (error)
            throw new Error(`Erro ao buscar trilha de auditoria: ${error.message}`);
        return data;
    }
    // ============================================================================
    // COMPLIANCE
    // ============================================================================
    async createComplianceValidation(validation) {
        const { error } = await this.supabase
            .from('compliance_validations')
            .insert(validation);
        if (error)
            throw new Error(`Erro ao criar validação de compliance: ${error.message}`);
    }
    async getComplianceValidations(documentId) {
        const { data, error } = await this.supabase
            .from('compliance_validations')
            .select('*')
            .eq('document_id', documentId)
            .order('validated_at', { ascending: false });
        if (error)
            throw new Error(`Erro ao buscar validações de compliance: ${error.message}`);
        return data;
    }
    // ============================================================================
    // MÉTODOS AUXILIARES
    // ============================================================================
    mapToClinicalDocument(data) {
        return {
            id: data.id,
            patientId: data.patient_id,
            type: data.document_type,
            version: data.version,
            content: data.content,
            isSigned: data.is_signed,
            signedBy: data.signed_by,
            signedAt: data.signed_at ? new Date(data.signed_at) : undefined,
            createdBy: data.created_by,
            createdAt: new Date(data.created_at),
            status: data.status
        };
    }
    mapToClinicalTemplate(data) {
        return {
            id: data.id,
            name: data.name,
            type: data.type,
            specialty: data.specialty,
            schema: data.template_schema,
            templateSchema: data.template_schema,
            defaultValues: data.default_values,
            validationRules: data.validation_rules,
            active: data.active,
            version: data.version,
            createdAt: new Date(data.created_at),
            createdBy: data.created_by
        };
    }
    mapToDigitalSignature(data) {
        return {
            id: data.id,
            documentId: data.document_id,
            signature: data.signature_data || '',
            signatureData: data.signature_data,
            publicKey: data.public_key || '',
            certificateId: data.certificate_id,
            timestamp: {
                time: new Date(data.signed_at),
                authority: data.timestamp_authority || '',
                token: data.timestamp_token || ''
            },
            documentHash: data.document_hash || '',
            algorithm: data.algorithm || 'RSA-SHA256',
            signedAt: new Date(data.signed_at),
            signedBy: data.signed_by,
            verificationStatus: data.verification_status,
            createdAt: new Date(data.created_at)
        };
    }
    mapToDigitalCertificate(data) {
        return {
            id: data.id,
            userId: data.user_id,
            type: data.type || 'A1',
            serialNumber: data.serial_number || '',
            issuer: data.issuer || '',
            certificateData: data.certificate_data,
            publicKey: data.public_key,
            algorithm: data.algorithm,
            validFrom: new Date(data.valid_from),
            validUntil: new Date(data.valid_until),
            isActive: data.is_active,
            status: data.status || (data.is_active ? 'active' : 'expired'),
            createdBy: data.created_by,
            createdAt: new Date(data.created_at)
        };
    }
    // ============================================================================
    // MÉTODOS DE RELATÓRIOS
    // ============================================================================
    async generateProgressReport(patientId, dateRange) {
        // Implementar geração de relatório de progresso
        // Combinar dados de avaliações iniciais, evoluções e mapa corporal
        throw new Error('Método não implementado');
    }
    async generateDischargeReport(patientId) {
        // Implementar geração de relatório de alta
        // Combinar todos os dados do paciente para criar resumo final
        throw new Error('Método não implementado');
    }
}
