import { supabase } from '../../lib/supabase';
class LGPDComplianceService {
    constructor() {
        // Finalidades de tratamento predefinidas
        this.DEFAULT_PURPOSES = [
            {
                id: 'medical_treatment',
                name: 'Tratamento Médico',
                description: 'Processamento de dados para prestação de serviços de fisioterapia',
                legalBasis: 'vital_interests',
                dataTypes: ['health_data', 'personal_identification', 'contact_info'],
                retentionPeriod: 'P20Y', // 20 anos conforme CFM
                required: true,
            },
            {
                id: 'appointment_scheduling',
                name: 'Agendamento de Consultas',
                description: 'Organização e gestão de horários de atendimento',
                legalBasis: 'contract',
                dataTypes: ['personal_identification', 'contact_info', 'schedule_preferences'],
                retentionPeriod: 'P5Y',
                required: true,
            },
            {
                id: 'payment_processing',
                name: 'Processamento de Pagamentos',
                description: 'Cobrança e processamento de valores pelos serviços prestados',
                legalBasis: 'contract',
                dataTypes: ['financial_data', 'personal_identification'],
                retentionPeriod: 'P5Y',
                required: true,
            },
            {
                id: 'marketing_communication',
                name: 'Comunicação de Marketing',
                description: 'Envio de informações sobre novos serviços e promoções',
                legalBasis: 'consent',
                dataTypes: ['contact_info', 'preferences'],
                retentionPeriod: 'P2Y',
                required: false,
            },
            {
                id: 'service_improvement',
                name: 'Melhoria de Serviços',
                description: 'Análise de uso para aprimoramento da plataforma',
                legalBasis: 'legitimate_interests',
                dataTypes: ['usage_data', 'anonymized_health_data'],
                retentionPeriod: 'P3Y',
                required: false,
            },
            {
                id: 'research_statistics',
                name: 'Pesquisa e Estatísticas',
                description: 'Estudos científicos e estatísticas anonimizadas',
                legalBasis: 'consent',
                dataTypes: ['anonymized_health_data', 'demographic_data'],
                retentionPeriod: 'P10Y',
                required: false,
            },
        ];
    }
    async initializePurposes() {
        try {
            for (const purpose of this.DEFAULT_PURPOSES) {
                const { error } = await supabase
                    .from('data_processing_purposes')
                    .upsert(purpose, { onConflict: 'id' });
                if (error)
                    throw error;
            }
        }
        catch (error) {
            console.error('Erro ao inicializar finalidades:', error);
            throw new Error('Falha ao configurar finalidades de tratamento');
        }
    }
    // Gestão de Consentimento
    async requestConsent(userId, purposes, metadata) {
        try {
            const consents = [];
            for (const purposeId of purposes) {
                const purpose = this.DEFAULT_PURPOSES.find(p => p.id === purposeId);
                if (!purpose)
                    continue;
                const consent = {
                    id: this.generateId(),
                    userId,
                    purposeId,
                    granted: false, // Será atualizado quando o usuário aceitar
                    grantedAt: new Date().toISOString(),
                    ipAddress: metadata.ipAddress,
                    userAgent: metadata.userAgent,
                    consentMethod: 'explicit',
                    consentText: this.generateConsentText(purpose),
                    version: '1.0',
                };
                const { error } = await supabase
                    .from('user_consents')
                    .insert(consent);
                if (error)
                    throw error;
                consents.push(consent);
                // Registrar no audit trail
                await this.logAuditTrail({
                    userId,
                    action: 'consent_requested',
                    entityType: 'consent',
                    entityId: consent.id,
                    newData: consent,
                    ...metadata,
                    timestamp: new Date().toISOString(),
                });
            }
            return consents;
        }
        catch (error) {
            console.error('Erro ao solicitar consentimento:', error);
            throw new Error('Falha ao processar solicitação de consentimento');
        }
    }
    async grantConsent(consentId, userId, metadata) {
        try {
            const { data: existingConsent, error: fetchError } = await supabase
                .from('user_consents')
                .select('*')
                .eq('id', consentId)
                .eq('user_id', userId)
                .single();
            if (fetchError)
                throw fetchError;
            const { error: updateError } = await supabase
                .from('user_consents')
                .update({
                granted: true,
                granted_at: new Date().toISOString(),
                ip_address: metadata.ipAddress,
                user_agent: metadata.userAgent,
            })
                .eq('id', consentId);
            if (updateError)
                throw updateError;
            // Registrar no audit trail
            await this.logAuditTrail({
                userId,
                action: 'consent_granted',
                entityType: 'consent',
                entityId: consentId,
                previousData: existingConsent,
                newData: { ...existingConsent, granted: true },
                ipAddress: metadata.ipAddress,
                userAgent: metadata.userAgent,
                sessionId: metadata.sessionId,
                timestamp: new Date().toISOString(),
            });
        }
        catch (error) {
            console.error('Erro ao conceder consentimento:', error);
            throw new Error('Falha ao conceder consentimento');
        }
    }
    async revokeConsent(consentId, userId, metadata) {
        try {
            const { data: existingConsent, error: fetchError } = await supabase
                .from('user_consents')
                .select('*')
                .eq('id', consentId)
                .eq('user_id', userId)
                .single();
            if (fetchError || !existingConsent)
                throw fetchError || new Error('Consent not found');
            const { error: updateError } = await supabase
                .from('user_consents')
                .update({
                granted: false,
                revoked_at: new Date().toISOString(),
            })
                .eq('id', consentId);
            if (updateError)
                throw updateError;
            // Registrar no audit trail
            await this.logAuditTrail({
                userId,
                action: 'consent_revoked',
                entityType: 'consent',
                entityId: consentId,
                previousData: existingConsent,
                newData: { ...existingConsent, granted: false, revokedAt: new Date().toISOString() },
                ipAddress: metadata.ipAddress,
                userAgent: metadata.userAgent,
                sessionId: metadata.sessionId,
                timestamp: new Date().toISOString(),
            });
            // Processar revogação (deletar dados se necessário)
            await this.processConsentRevocation(userId, existingConsent.purpose_id);
        }
        catch (error) {
            console.error('Erro ao revogar consentimento:', error);
            throw new Error('Falha ao revogar consentimento');
        }
    }
    // Portabilidade de Dados
    async requestDataPortability(userId, requestType, format = 'json') {
        try {
            const request = {
                id: this.generateId(),
                userId,
                requestType,
                status: 'pending',
                requestedAt: new Date().toISOString(),
                format,
            };
            const { error } = await supabase
                .from('data_portability_requests')
                .insert({
                id: request.id,
                user_id: request.userId,
                request_type: request.requestType,
                status: request.status,
                requested_at: request.requestedAt,
                format: request.format,
            });
            if (error)
                throw error;
            // Processar em background
            this.processDataPortabilityRequest(request.id);
            return request;
        }
        catch (error) {
            console.error('Erro ao solicitar portabilidade:', error);
            throw new Error('Falha ao processar solicitação de portabilidade');
        }
    }
    async getUserData(userId) {
        try {
            // Coletar todos os dados do usuário
            const [{ data: profile }, { data: appointments }, { data: treatments }, { data: payments }, { data: consents },] = await Promise.all([
                supabase.from('user_profiles').select('*').eq('id', userId),
                supabase.from('appointments').select('*').eq('patient_id', userId),
                supabase.from('treatment_sessions').select('*').eq('patient_id', userId),
                supabase.from('payment_transactions').select('*').eq('customer_id', userId),
                supabase.from('user_consents').select('*').eq('user_id', userId),
            ]);
            return {
                profile: profile?.[0],
                appointments: appointments || [],
                treatments: treatments || [],
                payments: payments || [],
                consents: consents || [],
                exportedAt: new Date().toISOString(),
                format: 'LGPD_COMPLIANT_EXPORT_V1',
            };
        }
        catch (error) {
            console.error('Erro ao coletar dados do usuário:', error);
            throw new Error('Falha ao coletar dados do usuário');
        }
    }
    // Direito ao Esquecimento
    async requestDataDeletion(userId) {
        try {
            // Verificar se pode deletar (considerando obrigações legais)
            const canDelete = await this.canDeleteUserData(userId);
            if (!canDelete.allowed) {
                throw new Error(`Não é possível deletar os dados: ${canDelete.reason}`);
            }
            // Anonimizar dados obrigatórios, deletar opcionais
            await this.anonymizeUserData(userId);
            // Registrar no audit trail
            await this.logAuditTrail({
                userId,
                action: 'data_deletion_completed',
                entityType: 'user',
                entityId: userId,
                newData: { deletedAt: new Date().toISOString() },
                ipAddress: '',
                userAgent: 'SYSTEM',
                sessionId: 'SYSTEM',
                timestamp: new Date().toISOString(),
            });
        }
        catch (error) {
            console.error('Erro ao deletar dados:', error);
            throw new Error('Falha ao processar exclusão de dados');
        }
    }
    // Audit Trail
    async logAuditTrail(entry) {
        try {
            const auditEntry = {
                id: this.generateId(),
                ...entry,
            };
            const { error } = await supabase
                .from('audit_trail')
                .insert({
                id: auditEntry.id,
                user_id: auditEntry.userId,
                action: auditEntry.action,
                entity_type: auditEntry.entityType,
                entity_id: auditEntry.entityId,
                previous_data: auditEntry.previousData,
                new_data: auditEntry.newData,
                timestamp: auditEntry.timestamp,
                ip_address: auditEntry.ipAddress,
                user_agent: auditEntry.userAgent,
                session_id: auditEntry.sessionId,
            });
            if (error)
                throw error;
        }
        catch (error) {
            console.error('Erro ao registrar audit trail:', error);
            // Não propagar erro para não interromper operação principal
        }
    }
    // Relatórios de Conformidade
    async generateComplianceReport(startDate, endDate) {
        try {
            const [{ data: consents }, { data: requests }, { data: auditEntries },] = await Promise.all([
                supabase
                    .from('user_consents')
                    .select('*')
                    .gte('granted_at', startDate)
                    .lte('granted_at', endDate),
                supabase
                    .from('data_portability_requests')
                    .select('*')
                    .gte('requested_at', startDate)
                    .lte('requested_at', endDate),
                supabase
                    .from('audit_trail')
                    .select('*')
                    .gte('timestamp', startDate)
                    .lte('timestamp', endDate),
            ]);
            return {
                consentMetrics: this.analyzeConsentMetrics(consents || []),
                portabilityRequests: this.analyzePortabilityRequests(requests || []),
                auditSummary: this.analyzeAuditTrail(auditEntries || []),
                riskAssessment: await this.performRiskAssessment(),
            };
        }
        catch (error) {
            console.error('Erro ao gerar relatório de conformidade:', error);
            throw new Error('Falha ao gerar relatório de conformidade');
        }
    }
    // Métodos privados
    generateConsentText(purpose) {
        return `
Eu autorizo o tratamento dos meus dados pessoais para a finalidade de "${purpose.name}".

Descrição: ${purpose.description}

Base Legal: ${this.getLegalBasisDescription(purpose.legalBasis)}
Tipos de Dados: ${purpose.dataTypes.join(', ')}
Período de Retenção: ${this.getRetentionDescription(purpose.retentionPeriod)}

Esta autorização pode ser revogada a qualquer momento através das configurações da minha conta.
    `.trim();
    }
    getLegalBasisDescription(basis) {
        const descriptions = {
            consent: 'Consentimento do titular',
            contract: 'Execução de contrato',
            legal_obligation: 'Cumprimento de obrigação legal',
            vital_interests: 'Proteção da vida ou integridade física',
            public_task: 'Exercício regular de direitos',
            legitimate_interests: 'Interesse legítimo do controlador',
        };
        return descriptions[basis] || basis;
    }
    getRetentionDescription(period) {
        // Converter ISO 8601 duration para texto legível
        const years = period.match(/P(\d+)Y/)?.[1];
        if (years)
            return `${years} anos`;
        return period;
    }
    async processConsentRevocation(userId, purposeId) {
        // Implementar lógica específica de revogação por finalidade
        switch (purposeId) {
            case 'marketing_communication':
                // Remover de listas de marketing
                await this.removeFromMarketing(userId);
                break;
            case 'service_improvement':
                // Anonimizar dados de uso
                await this.anonymizeUsageData(userId);
                break;
            // Outros casos...
        }
    }
    async processDataPortabilityRequest(requestId) {
        // Processar em background (implementar worker)
        setTimeout(async () => {
            try {
                const { data: request } = await supabase
                    .from('data_portability_requests')
                    .select('*')
                    .eq('id', requestId)
                    .single();
                if (!request)
                    return;
                const userData = await this.getUserData(request.user_id);
                const exportUrl = await this.generateExportFile(userData, request.format);
                await supabase
                    .from('data_portability_requests')
                    .update({
                    status: 'completed',
                    completed_at: new Date().toISOString(),
                    download_url: exportUrl,
                    expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 dias
                })
                    .eq('id', requestId);
            }
            catch (error) {
                console.error('Erro ao processar portabilidade:', error);
                await supabase
                    .from('data_portability_requests')
                    .update({ status: 'rejected' })
                    .eq('id', requestId);
            }
        }, 1000);
    }
    async canDeleteUserData(userId) {
        // Verificar obrigações legais
        const { data: activeAppointments } = await supabase
            .from('appointments')
            .select('*')
            .eq('patient_id', userId)
            .gte('start_time', new Date().toISOString());
        if (activeAppointments && activeAppointments.length > 0) {
            return {
                allowed: false,
                reason: 'Existem consultas agendadas. Cancele ou complete antes de solicitar exclusão.',
            };
        }
        // Verificar período de retenção médica (20 anos)
        const { data: recentTreatments } = await supabase
            .from('treatment_sessions')
            .select('*')
            .eq('patient_id', userId)
            .gte('session_date', new Date(Date.now() - 20 * 365 * 24 * 60 * 60 * 1000).toISOString());
        if (recentTreatments && recentTreatments.length > 0) {
            return {
                allowed: false,
                reason: 'Dados médicos devem ser mantidos por 20 anos conforme CFM. Dados serão anonimizados.',
            };
        }
        return { allowed: true };
    }
    async anonymizeUserData(userId) {
        // Anonimizar dados mantendo conformidade médica
        const anonymizedData = {
            name: `PACIENTE_ANONIMIZADO_${this.generateId().slice(0, 8)}`,
            email: `anonimizado_${this.generateId().slice(0, 8)}@exemplo.com`,
            phone: 'ANONIMIZADO',
            cpf: 'ANONIMIZADO',
            date_of_birth: null,
            address: null,
            deleted_at: new Date().toISOString(),
        };
        await supabase
            .from('user_profiles')
            .update(anonymizedData)
            .eq('id', userId);
    }
    async removeFromMarketing(userId) {
        // Implementar remoção de marketing
    }
    async anonymizeUsageData(userId) {
        // Implementar anonimização de dados de uso
    }
    async generateExportFile(userData, format) {
        // Implementar geração de arquivo (JSON, CSV, PDF)
        return 'https://example.com/export.json';
    }
    analyzeConsentMetrics(consents) {
        return {
            total: consents.length,
            granted: consents.filter(c => c.granted).length,
            revoked: consents.filter(c => c.revoked_at).length,
            byPurpose: this.groupBy(consents, 'purpose_id'),
        };
    }
    analyzePortabilityRequests(requests) {
        return {
            total: requests.length,
            byType: this.groupBy(requests, 'request_type'),
            byStatus: this.groupBy(requests, 'status'),
            averageProcessingTime: this.calculateAverageProcessingTime(requests),
        };
    }
    analyzeAuditTrail(entries) {
        return {
            total: entries.length,
            byAction: this.groupBy(entries, 'action'),
            byEntity: this.groupBy(entries, 'entity_type'),
            securityEvents: entries.filter(e => e.action.includes('security')).length,
        };
    }
    async performRiskAssessment() {
        return {
            overallRisk: 'LOW',
            dataBreaches: 0,
            complianceIssues: [],
            recommendations: [
                'Manter backups atualizados',
                'Revisar políticas de retenção',
                'Treinar equipe em LGPD',
            ],
        };
    }
    groupBy(array, key) {
        return array.reduce((groups, item) => {
            const group = item[key];
            groups[group] = (groups[group] || 0) + 1;
            return groups;
        }, {});
    }
    calculateAverageProcessingTime(requests) {
        const completed = requests.filter(r => r.completed_at);
        if (completed.length === 0)
            return 0;
        const totalTime = completed.reduce((sum, request) => {
            const start = new Date(request.requested_at).getTime();
            const end = new Date(request.completed_at).getTime();
            return sum + (end - start);
        }, 0);
        return totalTime / completed.length / (1000 * 60 * 60); // Horas
    }
    generateId() {
        return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
}
// Export singleton instance
export const lgpdService = new LGPDComplianceService();
export default lgpdService;
