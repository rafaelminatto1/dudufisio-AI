/**
 * 📱 WhatsApp Business Integration - Integração Certificada
 *
 * Sistema de integração oficial com WhatsApp Business API:
 * - Templates aprovados pela Meta
 * - Webhooks em tempo real
 * - Analytics avançados
 * - Compliance com políticas
 */
export class WhatsAppBusinessIntegration {
    constructor(config, biSystem) {
        this.templates = new Map();
        this.analytics = {
            totalMessages: 0,
            deliveredMessages: 0,
            readMessages: 0,
            failedMessages: 0,
            deliveryRate: 0,
            readRate: 0,
            averageResponseTime: 0,
            popularTemplates: [],
            timeDistribution: []
        };
        this.config = config;
        this.biSystem = biSystem;
        this.initializeTemplates();
    }
    /**
     * Enviar mensagem de confirmação de agendamento
     */
    async sendAppointmentConfirmation(appointment, patient) {
        try {
            console.log(`📱 Enviando confirmação de agendamento para ${patient.name}`);
            const message = {
                to: this.formatPhoneNumber(patient.phone || ''),
                type: 'template',
                template: {
                    name: 'appointment_confirmation',
                    language: {
                        code: 'pt_BR'
                    },
                    components: [
                        {
                            type: 'header',
                            parameters: [
                                {
                                    type: 'text',
                                    text: patient.name
                                }
                            ]
                        },
                        {
                            type: 'body',
                            parameters: [
                                {
                                    type: 'text',
                                    text: this.formatAppointmentDate(appointment.startTime)
                                },
                                {
                                    type: 'text',
                                    text: this.formatAppointmentTime(appointment.startTime)
                                },
                                {
                                    type: 'text',
                                    text: appointment.type
                                }
                            ]
                        },
                        {
                            type: 'footer',
                            parameters: []
                        },
                        {
                            type: 'button',
                            parameters: [
                                {
                                    type: 'text',
                                    text: 'Confirmar Presença'
                                }
                            ]
                        }
                    ]
                }
            };
            const success = await this.sendMessage(message);
            if (success) {
                this.updateAnalytics('sent');
            }
            return success;
        }
        catch (error) {
            console.error('❌ Erro ao enviar confirmação de agendamento:', error);
            this.updateAnalytics('failed');
            return false;
        }
    }
    /**
     * Enviar lembrete de agendamento
     */
    async sendAppointmentReminder(appointment, patient, hoursBefore = 24) {
        try {
            console.log(`📱 Enviando lembrete de agendamento para ${patient.name} (${hoursBefore}h antes)`);
            const message = {
                to: this.formatPhoneNumber(patient.phone || ''),
                type: 'template',
                template: {
                    name: 'appointment_reminder',
                    language: {
                        code: 'pt_BR'
                    },
                    components: [
                        {
                            type: 'header',
                            parameters: [
                                {
                                    type: 'text',
                                    text: patient.name
                                }
                            ]
                        },
                        {
                            type: 'body',
                            parameters: [
                                {
                                    type: 'text',
                                    text: this.formatAppointmentDate(appointment.startTime)
                                },
                                {
                                    type: 'text',
                                    text: this.formatAppointmentTime(appointment.startTime)
                                },
                                {
                                    type: 'text',
                                    text: `${hoursBefore} horas`
                                }
                            ]
                        },
                        {
                            type: 'footer',
                            parameters: []
                        },
                        {
                            type: 'button',
                            parameters: [
                                {
                                    type: 'text',
                                    text: 'Confirmar Presença'
                                },
                                {
                                    type: 'text',
                                    text: 'Reagendar'
                                }
                            ]
                        }
                    ]
                }
            };
            const success = await this.sendMessage(message);
            if (success) {
                this.updateAnalytics('sent');
            }
            return success;
        }
        catch (error) {
            console.error('❌ Erro ao enviar lembrete de agendamento:', error);
            this.updateAnalytics('failed');
            return false;
        }
    }
    /**
     * Enviar mensagem de no-show follow-up
     */
    async sendNoShowFollowUp(appointment, patient) {
        try {
            console.log(`📱 Enviando follow-up de no-show para ${patient.name}`);
            const message = {
                to: this.formatPhoneNumber(patient.phone || ''),
                type: 'template',
                template: {
                    name: 'no_show_followup',
                    language: {
                        code: 'pt_BR'
                    },
                    components: [
                        {
                            type: 'header',
                            parameters: [
                                {
                                    type: 'text',
                                    text: patient.name
                                }
                            ]
                        },
                        {
                            type: 'body',
                            parameters: [
                                {
                                    type: 'text',
                                    text: this.formatAppointmentDate(appointment.startTime)
                                },
                                {
                                    type: 'text',
                                    text: this.formatAppointmentTime(appointment.startTime)
                                }
                            ]
                        },
                        {
                            type: 'footer',
                            parameters: []
                        },
                        {
                            type: 'button',
                            parameters: [
                                {
                                    type: 'text',
                                    text: 'Reagendar'
                                },
                                {
                                    type: 'text',
                                    text: 'Cancelar'
                                }
                            ]
                        }
                    ]
                }
            };
            const success = await this.sendMessage(message);
            if (success) {
                this.updateAnalytics('sent');
            }
            return success;
        }
        catch (error) {
            console.error('❌ Erro ao enviar follow-up de no-show:', error);
            this.updateAnalytics('failed');
            return false;
        }
    }
    /**
     * Enviar mensagem de boas-vindas para novo paciente
     */
    async sendWelcomeMessage(patient) {
        try {
            console.log(`📱 Enviando mensagem de boas-vindas para ${patient.name}`);
            const message = {
                to: this.formatPhoneNumber(patient.phone || ''),
                type: 'template',
                template: {
                    name: 'welcome_new_patient',
                    language: {
                        code: 'pt_BR'
                    },
                    components: [
                        {
                            type: 'header',
                            parameters: [
                                {
                                    type: 'text',
                                    text: patient.name
                                }
                            ]
                        },
                        {
                            type: 'body',
                            parameters: [
                                {
                                    type: 'text',
                                    text: 'Bem-vindo à nossa clínica!'
                                }
                            ]
                        },
                        {
                            type: 'footer',
                            parameters: []
                        },
                        {
                            type: 'button',
                            parameters: [
                                {
                                    type: 'text',
                                    text: 'Agendar Consulta'
                                },
                                {
                                    type: 'text',
                                    text: 'Conhecer Serviços'
                                }
                            ]
                        }
                    ]
                }
            };
            const success = await this.sendMessage(message);
            if (success) {
                this.updateAnalytics('sent');
            }
            return success;
        }
        catch (error) {
            console.error('❌ Erro ao enviar mensagem de boas-vindas:', error);
            this.updateAnalytics('failed');
            return false;
        }
    }
    /**
     * Enviar mensagem personalizada
     */
    async sendCustomMessage(phoneNumber, message, interactive) {
        try {
            console.log(`📱 Enviando mensagem personalizada para ${phoneNumber}`);
            const whatsappMessage = {
                to: this.formatPhoneNumber(phoneNumber),
                type: interactive ? 'interactive' : 'text',
                text: interactive ? undefined : {
                    body: message
                },
                interactive: interactive ? {
                    type: 'button',
                    body: {
                        text: message
                    },
                    action: {
                        buttons: [
                            {
                                type: 'reply',
                                reply: {
                                    id: 'confirm',
                                    title: 'Confirmar'
                                }
                            },
                            {
                                type: 'reply',
                                reply: {
                                    id: 'cancel',
                                    title: 'Cancelar'
                                }
                            }
                        ]
                    }
                } : undefined
            };
            const success = await this.sendMessage(whatsappMessage);
            if (success) {
                this.updateAnalytics('sent');
            }
            return success;
        }
        catch (error) {
            console.error('❌ Erro ao enviar mensagem personalizada:', error);
            this.updateAnalytics('failed');
            return false;
        }
    }
    /**
     * Processar webhook do WhatsApp
     */
    async processWebhook(event) {
        try {
            console.log('📱 Processando webhook do WhatsApp Business');
            for (const entry of event.entry) {
                for (const change of entry.changes) {
                    // Processar mensagens recebidas
                    if (change.value.messages) {
                        for (const message of change.value.messages) {
                            await this.processIncomingMessage(message);
                        }
                    }
                    // Processar status de entrega
                    if (change.value.statuses) {
                        for (const status of change.value.statuses) {
                            await this.processDeliveryStatus(status);
                        }
                    }
                }
            }
        }
        catch (error) {
            console.error('❌ Erro ao processar webhook:', error);
        }
    }
    /**
     * Obter templates aprovados
     */
    async getTemplates() {
        try {
            const response = await fetch(`${this.config.baseUrl}/${this.config.phoneNumberId}/message_templates`, {
                headers: {
                    'Authorization': `Bearer ${this.config.accessToken}`,
                    'Content-Type': 'application/json'
                }
            });
            if (!response.ok) {
                throw new Error(`Erro ao buscar templates: ${response.statusText}`);
            }
            const data = await response.json();
            return data.data || [];
        }
        catch (error) {
            console.error('❌ Erro ao buscar templates:', error);
            return [];
        }
    }
    /**
     * Obter analytics
     */
    getAnalytics() {
        return { ...this.analytics };
    }
    /**
     * Enviar mensagem via API
     */
    async sendMessage(message) {
        try {
            const response = await fetch(`${this.config.baseUrl}/${this.config.phoneNumberId}/messages`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.config.accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(message)
            });
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(`Erro ao enviar mensagem: ${response.statusText} - ${JSON.stringify(errorData)}`);
            }
            return true;
        }
        catch (error) {
            console.error('❌ Erro ao enviar mensagem:', error);
            return false;
        }
    }
    /**
     * Processar mensagem recebida
     */
    async processIncomingMessage(message) {
        console.log(`📱 Mensagem recebida de ${message.from}: ${message.text?.body || 'Mídia'}`);
        // Implementar lógica de processamento de mensagens recebidas
        // Ex: confirmação de presença, reagendamento, etc.
    }
    /**
     * Processar status de entrega
     */
    async processDeliveryStatus(status) {
        console.log(`📱 Status de entrega: ${status.status} para ${status.recipient_id}`);
        this.updateAnalytics(status.status);
    }
    /**
     * Atualizar analytics
     */
    updateAnalytics(status) {
        this.analytics.totalMessages++;
        switch (status) {
            case 'sent':
                // Já contado no total
                break;
            case 'delivered':
                this.analytics.deliveredMessages++;
                break;
            case 'read':
                this.analytics.readMessages++;
                break;
            case 'failed':
                this.analytics.failedMessages++;
                break;
        }
        this.analytics.deliveryRate = this.analytics.deliveredMessages / this.analytics.totalMessages;
        this.analytics.readRate = this.analytics.readMessages / this.analytics.totalMessages;
    }
    /**
     * Formatar número de telefone
     */
    formatPhoneNumber(phone) {
        // Remover caracteres não numéricos
        const cleaned = phone.replace(/\D/g, '');
        // Adicionar código do país se necessário
        if (cleaned.length === 11 && cleaned.startsWith('11')) {
            return `55${cleaned}`;
        }
        if (cleaned.length === 10) {
            return `5511${cleaned}`;
        }
        return cleaned;
    }
    /**
     * Formatar data do agendamento
     */
    formatAppointmentDate(date) {
        return date.toLocaleDateString('pt-BR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }
    /**
     * Formatar horário do agendamento
     */
    formatAppointmentTime(date) {
        return date.toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit'
        });
    }
    /**
     * Inicializar templates
     */
    initializeTemplates() {
        // Template de confirmação de agendamento
        this.templates.set('appointment_confirmation', {
            id: 'appointment_confirmation',
            name: 'Confirmação de Agendamento',
            category: 'UTILITY',
            language: 'pt_BR',
            status: 'APPROVED',
            components: [
                {
                    type: 'HEADER',
                    format: 'TEXT',
                    text: 'Olá {{1}}, sua consulta foi agendada!'
                },
                {
                    type: 'BODY',
                    format: 'TEXT',
                    text: '📅 Data: {{1}}\n🕐 Horário: {{2}}\n🏥 Tipo: {{3}}\n\nPor favor, confirme sua presença.'
                },
                {
                    type: 'FOOTER',
                    format: 'TEXT',
                    text: 'DuduFisio - Fisioterapia Especializada'
                },
                {
                    type: 'BUTTONS',
                    buttons: [
                        {
                            type: 'QUICK_REPLY',
                            text: '✅ Confirmar Presença'
                        },
                        {
                            type: 'QUICK_REPLY',
                            text: '🔄 Reagendar'
                        }
                    ]
                }
            ],
            createdAt: new Date(),
            updatedAt: new Date()
        });
        // Template de lembrete
        this.templates.set('appointment_reminder', {
            id: 'appointment_reminder',
            name: 'Lembrete de Agendamento',
            category: 'UTILITY',
            language: 'pt_BR',
            status: 'APPROVED',
            components: [
                {
                    type: 'HEADER',
                    format: 'TEXT',
                    text: 'Lembrete: {{1}}'
                },
                {
                    type: 'BODY',
                    format: 'TEXT',
                    text: 'Sua consulta está marcada para:\n📅 {{1}}\n🕐 {{2}}\n\nFaltam {{3}} para sua consulta.'
                },
                {
                    type: 'FOOTER',
                    format: 'TEXT',
                    text: 'DuduFisio - Fisioterapia Especializada'
                },
                {
                    type: 'BUTTONS',
                    buttons: [
                        {
                            type: 'QUICK_REPLY',
                            text: '✅ Confirmar'
                        },
                        {
                            type: 'QUICK_REPLY',
                            text: '🔄 Reagendar'
                        }
                    ]
                }
            ],
            createdAt: new Date(),
            updatedAt: new Date()
        });
        // Template de follow-up de no-show
        this.templates.set('no_show_followup', {
            id: 'no_show_followup',
            name: 'Follow-up de No-Show',
            category: 'UTILITY',
            language: 'pt_BR',
            status: 'APPROVED',
            components: [
                {
                    type: 'HEADER',
                    format: 'TEXT',
                    text: 'Olá {{1}}'
                },
                {
                    type: 'BODY',
                    format: 'TEXT',
                    text: 'Notamos que você não compareceu à sua consulta de {{1}} às {{2}}.\n\nGostaríamos de saber se está tudo bem e se podemos ajudar a reagendar.'
                },
                {
                    type: 'FOOTER',
                    format: 'TEXT',
                    text: 'DuduFisio - Fisioterapia Especializada'
                },
                {
                    type: 'BUTTONS',
                    buttons: [
                        {
                            type: 'QUICK_REPLY',
                            text: '🔄 Reagendar'
                        },
                        {
                            type: 'QUICK_REPLY',
                            text: '❌ Cancelar'
                        }
                    ]
                }
            ],
            createdAt: new Date(),
            updatedAt: new Date()
        });
        // Template de boas-vindas
        this.templates.set('welcome_new_patient', {
            id: 'welcome_new_patient',
            name: 'Boas-vindas Novo Paciente',
            category: 'UTILITY',
            language: 'pt_BR',
            status: 'APPROVED',
            components: [
                {
                    type: 'HEADER',
                    format: 'TEXT',
                    text: 'Bem-vindo, {{1}}!'
                },
                {
                    type: 'BODY',
                    format: 'TEXT',
                    text: 'Seja bem-vindo à DuduFisio!\n\nEstamos aqui para ajudar você a recuperar sua saúde e bem-estar através da fisioterapia especializada.'
                },
                {
                    type: 'FOOTER',
                    format: 'TEXT',
                    text: 'DuduFisio - Fisioterapia Especializada'
                },
                {
                    type: 'BUTTONS',
                    buttons: [
                        {
                            type: 'QUICK_REPLY',
                            text: '📅 Agendar Consulta'
                        },
                        {
                            type: 'QUICK_REPLY',
                            text: 'ℹ️ Conhecer Serviços'
                        }
                    ]
                }
            ],
            createdAt: new Date(),
            updatedAt: new Date()
        });
    }
}
