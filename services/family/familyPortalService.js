/**
 * Family Portal Service
 * Serviço para Portal de Família/Cuidadores
 */
import { ConsentStatus, AccessLevel } from '../../types/familyPortalTypes';
class FamilyPortalService {
    /**
     * Obtém dashboard da família
     */
    async getFamilyDashboard(familyMemberId, patientId) {
        // Verificar permissões
        const familyMember = await this.getFamilyMember(familyMemberId);
        if (!familyMember || familyMember.patientId !== patientId) {
            throw new Error('Acesso não autorizado');
        }
        if (!familyMember.isActive || familyMember.consentStatus !== ConsentStatus.Approved) {
            throw new Error('Consentimento não aprovado ou expirado');
        }
        // Buscar dados do paciente
        const patient = await this.getPatientData(patientId);
        // Buscar progresso
        const progressSummary = await this.getProgressSummary(patientId, familyMember.permissions);
        // Buscar métricas principais
        const keyMetrics = await this.getKeyMetrics(patientId, familyMember.permissions);
        // Buscar próximas sessões
        const upcomingAppointments = await this.getUpcomingAppointments(patientId, familyMember.permissions);
        // Buscar atualizações
        const recentUpdates = await this.getRecentUpdates(patientId, familyMemberId);
        // Buscar mensagens
        const messages = await this.getMessages(familyMemberId);
        // Buscar alertas
        const alerts = await this.getAlerts(familyMemberId);
        // Buscar documentos
        const documents = await this.getAvailableDocuments(patientId, familyMember.permissions);
        return {
            patient: {
                id: patient.id,
                name: patient.name,
                age: this.calculateAge(patient.birthDate),
                avatarUrl: patient.avatarUrl,
                condition: patient.conditions?.[0]?.name || 'Em tratamento',
                treatmentPhase: 'Fase Intermediária' // mock
            },
            familyMember,
            permissions: familyMember.permissions,
            progressSummary,
            keyMetrics,
            upcomingAppointments,
            recentUpdates,
            unreadMessages: messages.filter(m => !m.readAt).length,
            recentMessages: messages.slice(0, 5),
            alerts,
            availableDocuments: documents
        };
    }
    /**
     * Cria solicitação de acesso familiar
     */
    async createAccessRequest(patientId, requestData) {
        const request = {
            id: `req-${Date.now()}`,
            patientId,
            requestedBy: {
                name: requestData.name,
                email: requestData.email,
                phone: requestData.phone,
                cpf: requestData.cpf,
                relationship: requestData.relationship,
                relationshipDetails: requestData.relationshipDetails
            },
            requestedAccessLevel: requestData.requestedAccessLevel,
            requestedPermissions: this.getDefaultPermissions(requestData.requestedAccessLevel),
            reason: requestData.reason,
            status: 'pending',
            requestedAt: new Date(),
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 dias
            patientNotified: false
        };
        // Notificar paciente
        await this.notifyPatientOfAccessRequest(patientId, request);
        return request;
    }
    /**
     * Aprova solicitação de acesso
     */
    async approveAccessRequest(requestId, patientId, customPermissions) {
        const request = await this.getAccessRequest(requestId);
        if (request.status !== 'pending') {
            throw new Error('Solicitação já foi processada');
        }
        // Criar membro da família
        const familyMember = {
            id: `family-${Date.now()}`,
            patientId,
            name: request.requestedBy.name,
            email: request.requestedBy.email,
            phone: request.requestedBy.phone,
            cpf: request.requestedBy.cpf,
            relationship: request.requestedBy.relationship,
            relationshipDetails: request.requestedBy.relationshipDetails,
            isPrimaryContact: false,
            accessLevel: request.requestedAccessLevel,
            permissions: {
                ...this.getDefaultPermissions(request.requestedAccessLevel),
                ...customPermissions
            },
            consentStatus: ConsentStatus.Approved,
            consentGivenBy: patientId,
            consentGivenAt: new Date(),
            isActive: true,
            isVerified: false,
            preferredLanguage: 'pt-BR',
            preferredContact: 'email',
            notificationPreferences: {
                appointments: true,
                progress: true,
                alerts: true,
                messages: true
            },
            createdAt: new Date(),
            updatedAt: new Date()
        };
        // Criar consentimento formal
        await this.createFormalConsent(familyMember, patientId);
        // Atualizar request
        request.status = 'approved';
        request.decidedBy = patientId;
        request.decidedAt = new Date();
        // Notificar família
        await this.notifyFamilyMemberOfApproval(familyMember);
        return familyMember;
    }
    /**
     * Cria atualização de progresso para família
     */
    async createProgressUpdate(patientId, therapistId, updateData) {
        // Buscar membros da família com permissão
        const familyMembers = await this.getFamilyMembersWithProgressPermission(patientId);
        const update = {
            id: `update-${Date.now()}`,
            patientId,
            familyMemberIds: familyMembers.map(f => f.id),
            title: updateData.title,
            summary: updateData.summary,
            details: updateData.details,
            metrics: updateData.metrics || [],
            nextSteps: updateData.nextSteps || [],
            goals: updateData.goals || [],
            allowFeedback: true,
            createdBy: therapistId,
            createdAt: new Date(),
            publishedAt: new Date(),
            viewedBy: []
        };
        // Notificar membros da família
        await this.notifyFamilyMembersOfUpdate(familyMembers, update);
        return update;
    }
    /**
     * Envia mensagem de família para terapeuta
     */
    async sendMessageToTherapist(familyMemberId, therapistId, messageData) {
        const familyMember = await this.getFamilyMember(familyMemberId);
        if (!familyMember.permissions.contactTherapist) {
            throw new Error('Sem permissão para contatar terapeuta');
        }
        const message = {
            id: `msg-${Date.now()}`,
            patientId: familyMember.patientId,
            senderId: familyMemberId,
            senderType: 'family',
            recipientId: therapistId,
            recipientType: 'therapist',
            subject: messageData.subject,
            message: messageData.message,
            priority: messageData.priority || 'normal',
            status: 'sent',
            sentAt: new Date(),
            requiresResponse: messageData.priority === 'urgent',
            archived: false
        };
        // Notificar terapeuta
        await this.notifyTherapistOfMessage(therapistId, message);
        return message;
    }
    /**
     * Revoga acesso familiar
     */
    async revokeAccess(familyMemberId, patientId, reason) {
        const familyMember = await this.getFamilyMember(familyMemberId);
        if (familyMember.patientId !== patientId) {
            throw new Error('Acesso não autorizado');
        }
        // Atualizar status
        familyMember.isActive = false;
        familyMember.consentStatus = ConsentStatus.Revoked;
        familyMember.updatedAt = new Date();
        // Registrar revogação no consentimento
        // await this.updateConsent(...)
        // Notificar membro da família
        await this.notifyFamilyMemberOfRevocation(familyMember, reason);
        // Log de auditoria
        await this.logAccessChange(familyMemberId, 'revoked', reason);
    }
    // Helper methods (mock implementations)
    async getFamilyMember(id) {
        // Mock - em produção viria do banco
        return {
            id,
            patientId: 'patient-1',
            name: 'Maria Silva',
            email: 'maria@email.com',
            phone: '(11) 98765-4321',
            relationship: 'spouse',
            isPrimaryContact: true,
            accessLevel: AccessLevel.ViewProgress,
            permissions: this.getDefaultPermissions(AccessLevel.ViewProgress),
            consentStatus: ConsentStatus.Approved,
            consentGivenBy: 'patient-1',
            consentGivenAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            isActive: true,
            isVerified: true,
            verifiedAt: new Date(Date.now() - 29 * 24 * 60 * 60 * 1000),
            preferredLanguage: 'pt-BR',
            preferredContact: 'email',
            notificationPreferences: {
                appointments: true,
                progress: true,
                alerts: true,
                messages: true
            },
            createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            updatedAt: new Date()
        };
    }
    async getPatientData(patientId) {
        // Mock - em produção viria do banco
        return {
            id: patientId,
            name: 'João Silva',
            cpf: '123.456.789-00',
            birthDate: '1980-05-15',
            phone: '(11) 98765-4321',
            email: 'joao@email.com',
            emergencyContact: { name: 'Maria Silva', phone: '(11) 98765-1234' },
            address: {
                street: 'Rua Exemplo, 123',
                city: 'São Paulo',
                state: 'SP',
                zip: '01234-567'
            },
            status: 'Active',
            lastVisit: new Date().toISOString().split('T')[0],
            registrationDate: '2024-01-15',
            avatarUrl: 'https://i.pravatar.cc/150?u=joao',
            consentGiven: true,
            whatsappConsent: 'opt-in',
            conditions: [
                { name: 'Lombalgia Crônica', date: '2024-01-15' }
            ]
        };
    }
    getDefaultPermissions(accessLevel) {
        const basePermissions = {
            viewMedicalHistory: false,
            viewTreatmentPlan: false,
            viewProgress: false,
            viewAppointments: false,
            viewFinancial: false,
            viewDocuments: false,
            receiveProgressUpdates: false,
            receiveAppointmentReminders: false,
            receiveAlerts: false,
            contactTherapist: false,
            viewMessages: false,
            requestAppointments: false,
            cancelAppointments: false
        };
        switch (accessLevel) {
            case AccessLevel.ViewOnly:
                return {
                    ...basePermissions,
                    viewAppointments: true
                };
            case AccessLevel.ViewProgress:
                return {
                    ...basePermissions,
                    viewProgress: true,
                    viewAppointments: true,
                    receiveProgressUpdates: true,
                    receiveAppointmentReminders: true
                };
            case AccessLevel.ViewCommunicate:
                return {
                    ...basePermissions,
                    viewProgress: true,
                    viewAppointments: true,
                    viewDocuments: true,
                    receiveProgressUpdates: true,
                    receiveAppointmentReminders: true,
                    receiveAlerts: true,
                    contactTherapist: true,
                    viewMessages: true
                };
            case AccessLevel.Full:
                return {
                    ...basePermissions,
                    viewMedicalHistory: true,
                    viewTreatmentPlan: true,
                    viewProgress: true,
                    viewAppointments: true,
                    viewFinancial: true,
                    viewDocuments: true,
                    receiveProgressUpdates: true,
                    receiveAppointmentReminders: true,
                    receiveAlerts: true,
                    contactTherapist: true,
                    viewMessages: true,
                    requestAppointments: true,
                    cancelAppointments: false // Ainda requer confirmação do paciente
                };
            default:
                return basePermissions;
        }
    }
    async getProgressSummary(patientId, permissions) {
        if (!permissions.viewProgress) {
            return null;
        }
        return {
            overallProgress: 65,
            treatmentStartDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
            estimatedEndDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
            sessionsCompleted: 8,
            totalSessions: 16,
            lastSessionDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            nextSessionDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
        };
    }
    async getKeyMetrics(patientId, permissions) {
        if (!permissions.viewProgress) {
            return [];
        }
        return [
            {
                metric: 'Nível de Dor',
                currentValue: 3,
                changeFromBaseline: -4,
                trend: 'improving',
                unit: '/10'
            },
            {
                metric: 'Amplitude de Movimento',
                currentValue: 85,
                changeFromBaseline: 25,
                trend: 'improving',
                unit: 'graus'
            },
            {
                metric: 'Força Muscular',
                currentValue: 4,
                changeFromBaseline: 2,
                trend: 'improving',
                unit: '/5'
            }
        ];
    }
    async getUpcomingAppointments(patientId, permissions) {
        if (!permissions.viewAppointments) {
            return [];
        }
        return [
            {
                date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
                type: 'Sessão de Fisioterapia',
                therapist: 'Dr. João Silva',
                location: 'Clínica DuduFisio',
                confirmed: true
            },
            {
                date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
                type: 'Avaliação de Progresso',
                therapist: 'Dr. João Silva',
                location: 'Clínica DuduFisio',
                confirmed: false
            }
        ];
    }
    async getRecentUpdates(patientId, familyMemberId) {
        // Mock data
        return [
            {
                id: 'update-1',
                patientId,
                familyMemberIds: [familyMemberId],
                title: 'Excelente Progresso na Última Semana',
                summary: 'O paciente demonstrou melhora significativa na amplitude de movimento e redução da dor.',
                details: 'Durante as últimas 3 sessões, observamos progresso consistente...',
                metrics: [
                    {
                        metric: 'Nível de Dor',
                        previousValue: 5,
                        currentValue: 3,
                        change: -2,
                        unit: '/10',
                        interpretation: 'Redução significativa de 40%'
                    }
                ],
                nextSteps: [
                    'Continuar exercícios domiciliares',
                    'Aumentar intensidade dos exercícios de fortalecimento',
                    'Avaliar retorno às atividades normais'
                ],
                goals: [
                    {
                        goal: 'Reduzir dor para nível 2/10',
                        status: 'in_progress',
                        progress: 75
                    }
                ],
                allowFeedback: true,
                createdBy: 'therapist-1',
                createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
                publishedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
                viewedBy: []
            }
        ];
    }
    async getMessages(familyMemberId) {
        return [];
    }
    async getAlerts(familyMemberId) {
        return [
            {
                type: 'appointment',
                message: 'Próxima sessão agendada para 11/10/2025 às 10:00',
                date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
                read: false
            },
            {
                type: 'achievement',
                message: 'Meta de redução de dor alcançada! 🎉',
                date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
                read: false
            }
        ];
    }
    async getAvailableDocuments(patientId, permissions) {
        if (!permissions.viewDocuments) {
            return [];
        }
        return [
            {
                id: 'doc-1',
                name: 'Plano de Tratamento',
                type: 'PDF',
                date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                url: '/documents/plano-tratamento.pdf'
            }
        ];
    }
    // Notification helpers
    async notifyPatientOfAccessRequest(patientId, request) {
        // Implementar notificação real
        console.log(`Notificando paciente ${patientId} sobre solicitação de acesso`);
    }
    async notifyFamilyMemberOfApproval(familyMember) {
        console.log(`Notificando ${familyMember.email} sobre aprovação de acesso`);
    }
    async notifyFamilyMembersOfUpdate(members, update) {
        console.log(`Notificando ${members.length} familiares sobre atualização`);
    }
    async notifyTherapistOfMessage(therapistId, message) {
        console.log(`Notificando terapeuta ${therapistId} sobre nova mensagem`);
    }
    async notifyFamilyMemberOfRevocation(familyMember, reason) {
        console.log(`Notificando ${familyMember.email} sobre revogação de acesso`);
    }
    // Data helpers
    calculateAge(birthDate) {
        const today = new Date();
        const birth = new Date(birthDate);
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        return age;
    }
    async getFamilyMembersWithProgressPermission(patientId) {
        // Mock - buscar do banco
        return [];
    }
    async getAccessRequest(requestId) {
        // Mock
        return {};
    }
    async createFormalConsent(familyMember, patientId) {
        // Criar documento de consentimento formal
    }
    async logAccessChange(familyMemberId, action, reason) {
        // Log de auditoria
        console.log(`Access change logged: ${action} - ${reason}`);
    }
}
export const familyPortalService = new FamilyPortalService();
