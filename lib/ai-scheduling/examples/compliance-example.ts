/**
 * 🔒 Exemplo de Uso - Sistema de Compliance LGPD/COFFITO
 * 
 * Este arquivo demonstra como usar o sistema de compliance integrado
 * com o sistema de agendamento IA.
 */

import {
  createAISchedulingService,
  SmartSchedulingRequest,
  PromptRequest
} from '../index';
import { createComplianceManager } from '../../compliance';
import { AppointmentType } from '../../../types';

// Exemplo de configuração com compliance habilitado
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

const aiConfig = {
  enableDemandPrediction: true,
  enableNoShowPrediction: true,
  enableResourceOptimization: true,
  enablePrompts: true,
  enableCompliance: true, // Habilitar compliance
  cacheEnabled: true,
  cacheTTL: 30,
  maxConcurrentRequests: 10,
  fallbackToHeuristic: true,
  performanceMonitoring: true
};

// Criar instâncias dos serviços
const aiSchedulingService = createAISchedulingService(biSystem, aiConfig);
const complianceManager = createComplianceManager();

/**
 * Exemplo 1: Agendamento com verificação de compliance
 */
export async function exemploAgendamentoComCompliance() {
  
  
  const request: SmartSchedulingRequest = {
    patient: {
      id: 'patient_123',
      name: 'João Silva',
      cpf: '123.456.789-00',
      birthDate: '1989-01-15',
      age: 35,
      phone: '11999999999',
      email: 'joao@email.com',
      emergencyContact: {
        name: 'Maria Silva',
        phone: '11988888888'
      },
      address: {
        street: 'Rua das Flores, 123',
        city: 'São Paulo',
        state: 'SP',
        zip: '01234-567'
      },
      status: 'Active' as any,
      lastVisit: '2024-01-10',
      registrationDate: '2023-01-15',
      gender: 'M',
      insuranceType: 'private',
      avatarUrl: 'https://i.pravatar.cc/150?u=patient_123',
      consentGiven: true,
      whatsappConsent: 'opt-in' as const
    },
    appointmentType: AppointmentType.Evaluation,
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
    // 1. Registrar consentimento LGPD primeiro
    
    const lgpdService = complianceManager.getLGPDService();
    
    const consent = await lgpdService.registerConsent('patient_123', {
      consentType: 'data_processing',
      purpose: 'Prestação de serviços de saúde e agendamento',
      legalBasis: 'consent',
      granted: true,
      grantedAt: new Date(),
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 ano
      version: '1.0',
      ipAddress: '192.168.1.1',
      userAgent: 'Mozilla/5.0...',
      consentText: 'Consentimento para processamento de dados pessoais para prestação de serviços de saúde',
      dataController: 'DuduFisio - Fisioterapia Especializada',
      dataProcessor: 'DuduFisio - Fisioterapia Especializada',
      retentionPeriod: 2555 // 7 anos
    });
    
    
    
    // 2. Registrar supervisão COFFITO
    
    const coffitoService = complianceManager.getCOFFITOService();
    
    const supervision = await coffitoService.registerSupervision(
      'supervisor_1',
      'therapist_1',
      {
        type: 'clinical',
        level: 'direct',
        frequency: 'weekly',
        requirements: ['Supervisão direta para avaliações'],
        startDate: new Date(),
        isActive: true,
        notes: 'Supervisão para terapeuta em treinamento'
      }
    );
    
    
    
    // 3. Agendar consulta (compliance será verificado automaticamente)
    
    const response = await aiSchedulingService.scheduleAppointment(request);
    
    
    
    
    
    return response;
    
  } catch (error) {
    console.error('❌ Erro no agendamento com compliance:', error);
    throw error;
  }
}

/**
 * Exemplo 2: Processamento de prompt com compliance
 */
export async function exemploPromptComCompliance() {
  
  
  const request: PromptRequest = {
    type: 'clinical_analysis',
    context: {
      patient: {
        id: 'patient_123',
        name: 'João Silva',
        age: 35
      } as any,
      clinicalData: {
        condition: 'Dor lombar crônica',
        symptoms: ['Dor na região lombar', 'Rigidez matinal'],
        history: 'Paciente com histórico de dor lombar há 6 meses'
      }
    },
    data: {
      mainComplaint: 'Dor lombar crônica',
      painLevel: 7,
      functionalLimitations: ['Sentar por longos períodos']
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
    // Verificar se há consentimento para processamento de dados pessoais
    
    const lgpdService = complianceManager.getLGPDService();
    
    const hasConsent = await lgpdService.hasValidConsent(
      'patient_123',
      'data_processing',
      'ai_processing'
    );
    
    if (!hasConsent) {
      
      await lgpdService.registerConsent('patient_123', {
        consentType: 'data_processing',
        purpose: 'Processamento de dados pessoais por IA para análise clínica',
        legalBasis: 'consent',
        granted: true,
        grantedAt: new Date(),
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        version: '1.0',
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0...',
        consentText: 'Consentimento para processamento de dados pessoais por IA',
        dataController: 'DuduFisio - Fisioterapia Especializada',
        dataProcessor: 'DuduFisio - Fisioterapia Especializada',
        retentionPeriod: 2555
      });
    }
    
    // Processar prompt (compliance será verificado automaticamente)
    
    const response = await aiSchedulingService.processPrompt(request);
    
    
    
    
    
    return response;
    
  } catch (error) {
    console.error('❌ Erro no processamento de prompt com compliance:', error);
    throw error;
  }
}

/**
 * Exemplo 3: Monitoramento de compliance em tempo real
 */
export async function exemploMonitoramentoCompliance() {
  
  
  try {
    // Iniciar monitoramento de compliance
    
    await aiSchedulingService.startComplianceMonitoring();
    
    // Obter status de compliance
    
    const status = await aiSchedulingService.getComplianceStatus();
    
    if (status) {
      
    }
    
    // Obter dashboard de compliance
    
    const dashboard = await aiSchedulingService.getComplianceDashboard();
    
    if (dashboard) {
      
    }
    
    // Simular algumas operações para testar monitoramento
    
    
    // Aguardar um pouco para ver o monitoramento em ação
    await new Promise(resolve => setTimeout(resolve, 10000));
    
    // Parar monitoramento
    
    await aiSchedulingService.stopComplianceMonitoring();
    
    
    
  } catch (error) {
    console.error('❌ Erro no monitoramento de compliance:', error);
    throw error;
  }
}

/**
 * Exemplo 4: Relatório de conformidade
 */
export async function exemploRelatorioConformidade() {
  
  
  try {
    const period = {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 dias
      end: new Date()
    };
    
    // Gerar relatório LGPD
    
    const lgpdService = complianceManager.getLGPDService();
    const lgpdReport = await lgpdService.getComplianceReport(period);
    
    
    
    // Gerar relatório COFFITO
    
    const coffitoService = complianceManager.getCOFFITOService();
    const coffitoReport = await coffitoService.getComplianceReport('therapist_1', period);
    
    
    
    // Gerar relatório combinado
    
    const combinedReport = await complianceManager.generateComplianceReport(
      'combined',
      period,
      'system'
    );
    
    
    
    return {
      lgpdReport,
      coffitoReport,
      combinedReport
    };
    
  } catch (error) {
    console.error('❌ Erro na geração de relatórios:', error);
    throw error;
  }
}

/**
 * Exemplo 5: Gestão de alertas de compliance
 */
export async function exemploGestaoAlertas() {
  
  
  try {
    // Criar alerta de compliance
    
    const alert = await complianceManager.createAlert({
      type: 'lgpd',
      severity: 'high',
      title: 'Consentimento Expirado',
      description: 'Paciente possui consentimento expirado que requer renovação',
      affectedEntities: ['patient_123'],
      requiredActions: ['Renovar consentimento LGPD'],
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 dias
      isResolved: false
    });
    
    
    
    // Listar alertas ativos
    
    const dashboard = await complianceManager.getComplianceDashboard();
    
    if (dashboard) {
      
      dashboard.alerts.forEach((alert: { title: string; severity: string; type: string }) => {
        console.log(`- ${alert.title}: ${alert.severity} (${alert.type})`);
      });
    }
    
    // Resolver alerta
    
    const resolved = await complianceManager.resolveAlert(
      alert.id,
      'admin',
      'Consentimento renovado com sucesso'
    );
    
    if (resolved) {
      
    }
    
    return {
      alert,
      resolved
    };
    
  } catch (error) {
    console.error('❌ Erro na gestão de alertas:', error);
    throw error;
  }
}

/**
 * Função principal para executar todos os exemplos de compliance
 */
export async function executarExemplosCompliance() {
  
  console.log('=' .repeat(80));
  
  try {
    // Exemplo 1: Agendamento com compliance
    await exemploAgendamentoComCompliance();
    console.log('\n' + '-'.repeat(40) + '\n');
    
    // Exemplo 2: Prompt com compliance
    await exemploPromptComCompliance();
    console.log('\n' + '-'.repeat(40) + '\n');
    
    // Exemplo 3: Monitoramento
    await exemploMonitoramentoCompliance();
    console.log('\n' + '-'.repeat(40) + '\n');
    
    // Exemplo 4: Relatórios
    await exemploRelatorioConformidade();
    console.log('\n' + '-'.repeat(40) + '\n');
    
    // Exemplo 5: Gestão de alertas
    await exemploGestaoAlertas();
    
    console.log('\n' + '='.repeat(80));
    
    
  } catch (error) {
    console.error('❌ Erro na execução dos exemplos de compliance:', error);
    throw error;
  }
}

// Executar exemplos se este arquivo for executado diretamente
if (require.main === module) {
  executarExemplosCompliance().catch(console.error);
}
