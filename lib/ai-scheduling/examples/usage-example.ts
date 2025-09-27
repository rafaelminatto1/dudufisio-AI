/**
 * 📚 Exemplo de Uso - Sistema de Agendamento Inteligente
 * 
 * Este arquivo demonstra como usar o sistema de IA para agendamento
 * com todas as funcionalidades implementadas.
 */

import {
  createAISchedulingService,
  createWhatsAppBusinessIntegration,
  SmartSchedulingRequest,
  PromptRequest,
  WhatsAppBusinessConfig,
  AISchedulingConfig,
  APPOINTMENT_TYPES,
  PROMPT_TYPES
} from '../index';

// Exemplo de configuração
const biSystem = {
  // Mock do BusinessIntelligenceSystem
  predictNoShow: async (id: string) => ({
    appointmentId: id,
    patientId: 'patient_123',
    probability: 0.15,
    confidence: 0.8,
    riskLevel: 'low' as const,
    factors: [],
    recommendations: [],
    urgency: 'low' as const,
    lastUpdated: new Date()
  })
};

// Configuração do WhatsApp Business
const whatsappConfig: WhatsAppBusinessConfig = {
  businessAccountId: 'your_business_account_id',
  phoneNumberId: 'your_phone_number_id',
  accessToken: 'your_access_token',
  webhookVerifyToken: 'your_webhook_verify_token',
  apiVersion: 'v18.0',
  baseUrl: 'https://graph.facebook.com/v18.0'
};

// Configuração do AI Scheduling
const aiConfig: Partial<AISchedulingConfig> = {
  enableDemandPrediction: true,
  enableNoShowPrediction: true,
  enableResourceOptimization: true,
  enablePrompts: true,
  cacheEnabled: true,
  cacheTTL: 30,
  maxConcurrentRequests: 10,
  fallbackToHeuristic: true,
  performanceMonitoring: true
};

// Criar instâncias dos serviços
const aiSchedulingService = createAISchedulingService(biSystem, aiConfig);
const whatsappIntegration = createWhatsAppBusinessIntegration(whatsappConfig, biSystem);

/**
 * Exemplo 1: Agendar consulta com IA
 */
export async function exemploAgendamentoIA() {
  console.log('🎯 Exemplo 1: Agendamento com IA');
  
  const request: SmartSchedulingRequest = {
    patient: {
      id: 'patient_123',
      name: 'João Silva',
      age: 35,
      phone: '11999999999',
      email: 'joao@email.com',
      address: {
        street: 'Rua das Flores, 123',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01234-567'
      },
      gender: 'male',
      insuranceType: 'private',
      avatarUrl: 'https://i.pravatar.cc/150?u=patient_123'
    },
    appointmentType: APPOINTMENT_TYPES.EVALUATION,
    preferredDate: new Date('2024-01-15'),
    preferredTime: new Date('2024-01-15T14:00:00'),
    duration: 60,
    preferences: {
      preferredTherapist: 'therapist_1',
      preferredRoom: 'room_1',
      maxCost: 200,
      minQuality: 0.8,
      priority: 'quality'
    },
    constraints: {
      maxTravelTime: 30,
      requiredSkills: ['fisioterapia', 'reabilitação'],
      requiredEquipment: ['macas', 'equipamentos_basicos'],
      maxWaitTime: 15,
      budget: 200
    }
  };
  
  try {
    const response = await aiSchedulingService.scheduleAppointment(request);
    
    console.log('✅ Agendamento realizado com sucesso!');
    console.log('📅 Agendamento:', response.appointment);
    console.log('🔮 Previsão de demanda:', response.predictions.demand);
    console.log('🚫 Previsão de no-show:', response.predictions.noShow);
    console.log('🎯 Otimização de recursos:', response.optimization);
    console.log('💡 Insights de IA:', response.aiInsights);
    console.log('📋 Recomendações:', response.recommendations);
    console.log('🎯 Confiança geral:', response.confidence);
    console.log('🔄 Alternativas:', response.alternatives);
    
    return response;
    
  } catch (error) {
    console.error('❌ Erro no agendamento:', error);
    throw error;
  }
}

/**
 * Exemplo 2: Processar prompt especializado
 */
export async function exemploPromptEspecializado() {
  console.log('🧠 Exemplo 2: Prompt Especializado');
  
  const request: PromptRequest = {
    type: PROMPT_TYPES.CLINICAL_ANALYSIS,
    context: {
      patient: {
        id: 'patient_123',
        name: 'João Silva',
        age: 35
      } as any,
      clinicalData: {
        condition: 'Dor lombar crônica',
        symptoms: ['Dor na região lombar', 'Rigidez matinal', 'Dificuldade para sentar'],
        history: 'Paciente com histórico de dor lombar há 6 meses'
      }
    },
    data: {
      mainComplaint: 'Dor lombar crônica',
      painLevel: 7,
      functionalLimitations: ['Sentar por longos períodos', 'Levantar pesos']
    },
    preferences: {
      language: 'pt',
      detailLevel: 'advanced',
      format: 'structured',
      includeEvidence: true,
      includeRecommendations: true
    }
  };
  
  try {
    const response = await aiSchedulingService.processPrompt(request);
    
    console.log('✅ Prompt processado com sucesso!');
    console.log('📝 Conteúdo:', response.content);
    console.log('🎯 Confiança:', response.confidence);
    console.log('🧠 Raciocínio:', response.reasoning);
    console.log('💡 Sugestões:', response.suggestions);
    console.log('📊 Metadados:', response.metadata);
    
    return response;
    
  } catch (error) {
    console.error('❌ Erro no processamento de prompt:', error);
    throw error;
  }
}

/**
 * Exemplo 3: Integração WhatsApp Business
 */
export async function exemploWhatsAppBusiness() {
  console.log('📱 Exemplo 3: WhatsApp Business');
  
  const appointment = {
    id: 'app_123',
    patientId: 'patient_123',
    patientName: 'João Silva',
    startTime: new Date('2024-01-15T14:00:00'),
    endTime: new Date('2024-01-15T15:00:00'),
    type: APPOINTMENT_TYPES.EVALUATION,
    status: 'scheduled' as const,
    value: 150,
    paymentStatus: 'pending' as const,
    observations: '',
    recurrenceRule: { frequency: 'weekly' as const, days: [], until: '' },
    seriesId: '',
    createdAt: new Date(),
    updatedAt: new Date(),
    created_by: 'therapist_1'
  };
  
  const patient = {
    id: 'patient_123',
    name: 'João Silva',
    phone: '11999999999',
    email: 'joao@email.com'
  };
  
  try {
    // Enviar confirmação de agendamento
    const confirmationSent = await whatsappIntegration.sendAppointmentConfirmation(
      appointment as any,
      patient as any
    );
    
    if (confirmationSent) {
      console.log('✅ Confirmação de agendamento enviada via WhatsApp');
    }
    
    // Enviar lembrete (24h antes)
    const reminderSent = await whatsappIntegration.sendAppointmentReminder(
      appointment as any,
      patient as any,
      24
    );
    
    if (reminderSent) {
      console.log('✅ Lembrete de agendamento enviado via WhatsApp');
    }
    
    // Enviar mensagem personalizada
    const customMessageSent = await whatsappIntegration.sendCustomMessage(
      patient.phone,
      'Olá! Como posso ajudá-lo hoje?',
      true // interactive
    );
    
    if (customMessageSent) {
      console.log('✅ Mensagem personalizada enviada via WhatsApp');
    }
    
    // Obter analytics
    const analytics = whatsappIntegration.getAnalytics();
    console.log('📊 Analytics do WhatsApp:', analytics);
    
    return {
      confirmationSent,
      reminderSent,
      customMessageSent,
      analytics
    };
    
  } catch (error) {
    console.error('❌ Erro na integração WhatsApp:', error);
    throw error;
  }
}

/**
 * Exemplo 4: Agendamento em lote
 */
export async function exemploAgendamentoLote() {
  console.log('🎯 Exemplo 4: Agendamento em Lote');
  
  const requests: SmartSchedulingRequest[] = [
    {
      patient: {
        id: 'patient_1',
        name: 'Maria Santos',
        age: 28,
        phone: '11999999999'
      } as any,
      appointmentType: APPOINTMENT_TYPES.SESSION,
      duration: 45,
      preferences: { priority: 'efficiency' },
      constraints: {}
    },
    {
      patient: {
        id: 'patient_2',
        name: 'Pedro Oliveira',
        age: 42,
        phone: '11999999998'
      } as any,
      appointmentType: APPOINTMENT_TYPES.RETURN,
      duration: 30,
      preferences: { priority: 'cost' },
      constraints: {}
    },
    {
      patient: {
        id: 'patient_3',
        name: 'Ana Costa',
        age: 55,
        phone: '11999999997'
      } as any,
      appointmentType: APPOINTMENT_TYPES.EVALUATION,
      duration: 60,
      preferences: { priority: 'quality' },
      constraints: {}
    }
  ];
  
  try {
    const responses = await aiSchedulingService.scheduleMultipleAppointments(requests);
    
    console.log(`✅ ${responses.length} agendamentos processados em lote`);
    
    responses.forEach((response, index) => {
      console.log(`📅 Agendamento ${index + 1}:`, {
        paciente: response.appointment.patientName,
        tipo: response.appointment.type,
        confiança: response.confidence,
        eficiência: response.optimization.efficiency
      });
    });
    
    return responses;
    
  } catch (error) {
    console.error('❌ Erro no agendamento em lote:', error);
    throw error;
  }
}

/**
 * Exemplo 5: Monitoramento e métricas
 */
export async function exemploMonitoramento() {
  console.log('📊 Exemplo 5: Monitoramento e Métricas');
  
  try {
    // Obter métricas do AI Scheduling
    const aiMetrics = aiSchedulingService.getMetrics();
    console.log('🤖 Métricas do AI Scheduling:', aiMetrics);
    
    // Obter estatísticas de cache
    const cacheStats = aiSchedulingService.getCacheStats();
    console.log('💾 Estatísticas de Cache:', cacheStats);
    
    // Obter analytics do WhatsApp
    const whatsappAnalytics = whatsappIntegration.getAnalytics();
    console.log('📱 Analytics do WhatsApp:', whatsappAnalytics);
    
    return {
      aiMetrics,
      cacheStats,
      whatsappAnalytics
    };
    
  } catch (error) {
    console.error('❌ Erro no monitoramento:', error);
    throw error;
  }
}

/**
 * Exemplo 6: Processamento de webhook WhatsApp
 */
export async function exemploWebhookWhatsApp() {
  console.log('🔗 Exemplo 6: Webhook WhatsApp');
  
  const webhookEvent = {
    object: 'whatsapp_business_account',
    entry: [
      {
        id: 'entry_123',
        changes: [
          {
            value: {
              messaging_product: 'whatsapp',
              metadata: {
                display_phone_number: '5511999999999',
                phone_number_id: 'phone_number_123'
              },
              contacts: [
                {
                  profile: {
                    name: 'João Silva'
                  },
                  wa_id: '5511999999999'
                }
              ],
              messages: [
                {
                  from: '5511999999999',
                  id: 'message_123',
                  timestamp: '1640995200',
                  type: 'text',
                  text: {
                    body: 'Olá, gostaria de agendar uma consulta'
                  }
                }
              ]
            },
            field: 'messages'
          }
        ]
      }
    ]
  };
  
  try {
    await whatsappIntegration.processWebhook(webhookEvent);
    console.log('✅ Webhook processado com sucesso');
    
  } catch (error) {
    console.error('❌ Erro no processamento de webhook:', error);
    throw error;
  }
}

/**
 * Função principal para executar todos os exemplos
 */
export async function executarTodosExemplos() {
  console.log('🚀 Iniciando todos os exemplos do Sistema de Agendamento Inteligente');
  console.log('=' .repeat(80));
  
  try {
    // Exemplo 1: Agendamento com IA
    await exemploAgendamentoIA();
    console.log('\n' + '-'.repeat(40) + '\n');
    
    // Exemplo 2: Prompt especializado
    await exemploPromptEspecializado();
    console.log('\n' + '-'.repeat(40) + '\n');
    
    // Exemplo 3: WhatsApp Business
    await exemploWhatsAppBusiness();
    console.log('\n' + '-'.repeat(40) + '\n');
    
    // Exemplo 4: Agendamento em lote
    await exemploAgendamentoLote();
    console.log('\n' + '-'.repeat(40) + '\n');
    
    // Exemplo 5: Monitoramento
    await exemploMonitoramento();
    console.log('\n' + '-'.repeat(40) + '\n');
    
    // Exemplo 6: Webhook WhatsApp
    await exemploWebhookWhatsApp();
    
    console.log('\n' + '='.repeat(80));
    console.log('✅ Todos os exemplos executados com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro na execução dos exemplos:', error);
    throw error;
  }
}

// Executar exemplos se este arquivo for executado diretamente
if (require.main === module) {
  executarTodosExemplos().catch(console.error);
}
