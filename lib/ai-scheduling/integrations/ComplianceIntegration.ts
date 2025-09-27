/**
 * 🔒 Compliance Integration - Integração de Conformidade com Sistema de IA
 * 
 * Integração entre o sistema de agendamento IA e compliance LGPD/COFFITO:
 * - Verificação automática de conformidade
 * - Consent management integrado
 * - Audit logging automático
 * - Alertas de compliance
 */

import { ComplianceManager, ComplianceStatus, ComplianceAlert } from '../../compliance';
import { SmartSchedulingRequest, SmartSchedulingResponse } from '../core/SchedulingEngine';
import { PromptRequest, PromptResponse } from '../core/AIPromptManager';

export interface ComplianceIntegrationConfig {
  enableLGPD: boolean;
  enableCOFFITO: boolean;
  autoConsentCheck: boolean;
  autoAuditLogging: boolean;
  realTimeMonitoring: boolean;
  alertThreshold: number;
}

export interface ComplianceCheckResult {
  isCompliant: boolean;
  violations: string[];
  requiredActions: string[];
  consentStatus: {
    hasValidConsent: boolean;
    consentTypes: string[];
    missingConsents: string[];
  };
  coffitoStatus: {
    isCompliant: boolean;
    violations: string[];
    recommendations: string[];
  };
  alerts: ComplianceAlert[];
}

export class ComplianceIntegration {
  private complianceManager: ComplianceManager;
  private config: ComplianceIntegrationConfig;
  private isMonitoring: boolean = false;

  constructor(config: Partial<ComplianceIntegrationConfig> = {}) {
    this.complianceManager = new ComplianceManager();
    this.config = {
      enableLGPD: true,
      enableCOFFITO: true,
      autoConsentCheck: true,
      autoAuditLogging: true,
      realTimeMonitoring: true,
      alertThreshold: 80,
      ...config
    };
  }

  /**
   * Verificar conformidade antes do agendamento
   */
  async checkSchedulingCompliance(
    request: SmartSchedulingRequest
  ): Promise<ComplianceCheckResult> {
    try {
      console.log(`🔒 Verificando conformidade para agendamento de ${request.patient.name}`);
      
      const violations: string[] = [];
      const requiredActions: string[] = [];
      const alerts: ComplianceAlert[] = [];
      
      // Verificar consentimentos LGPD
      let consentStatus = {
        hasValidConsent: true,
        consentTypes: [],
        missingConsents: []
      };
      
      if (this.config.enableLGPD && this.config.autoConsentCheck) {
        consentStatus = await this.checkLGPDConsent(request.patient.id);
        
        if (!consentStatus.hasValidConsent) {
          violations.push('Consentimento LGPD necessário');
          requiredActions.push('Obter consentimento do paciente');
          
          alerts.push(await this.createComplianceAlert({
            type: 'lgpd',
            severity: 'high',
            title: 'Consentimento LGPD Necessário',
            description: `Paciente ${request.patient.name} não possui consentimento válido para processamento de dados`,
            affectedEntities: [request.patient.id],
            requiredActions: ['Obter consentimento para processamento de dados']
          }));
        }
      }
      
      // Verificar conformidade COFFITO
      let coffitoStatus = {
        isCompliant: true,
        violations: [],
        recommendations: []
      };
      
      if (this.config.enableCOFFITO) {
        coffitoStatus = await this.checkCOFFITOCompliance(request);
        
        if (!coffitoStatus.isCompliant) {
          violations.push('Violações COFFITO detectadas');
          requiredActions.push('Corrigir violações de conformidade COFFITO');
          
          alerts.push(await this.createComplianceAlert({
            type: 'coffito',
            severity: 'medium',
            title: 'Violações COFFITO Detectadas',
            description: 'Agendamento não está em conformidade com diretrizes COFFITO',
            affectedEntities: [request.patient.id],
            requiredActions: coffitoStatus.recommendations
          }));
        }
      }
      
      const isCompliant = violations.length === 0;
      
      // Log de auditoria se habilitado
      if (this.config.autoAuditLogging) {
        await this.logComplianceCheck(request, isCompliant, violations);
      }
      
      console.log(`✅ Verificação de conformidade concluída: ${isCompliant ? 'Conforme' : 'Não conforme'}`);
      
      return {
        isCompliant,
        violations,
        requiredActions,
        consentStatus,
        coffitoStatus,
        alerts
      };
      
    } catch (error) {
      console.error('❌ Erro na verificação de conformidade:', error);
      throw error;
    }
  }

  /**
   * Verificar conformidade para processamento de prompt
   */
  async checkPromptCompliance(
    request: PromptRequest
  ): Promise<ComplianceCheckResult> {
    try {
      console.log(`🔒 Verificando conformidade para prompt ${request.type}`);
      
      const violations: string[] = [];
      const requiredActions: string[] = [];
      const alerts: ComplianceAlert[] = [];
      
      // Verificar se o prompt envolve dados pessoais
      const involvesPersonalData = this.checkIfPromptInvolvesPersonalData(request);
      
      if (involvesPersonalData && this.config.enableLGPD) {
        // Verificar consentimento para processamento de dados pessoais
        const hasConsent = await this.checkDataProcessingConsent(request.context.patient?.id);
        
        if (!hasConsent) {
          violations.push('Consentimento necessário para processamento de dados pessoais');
          requiredActions.push('Obter consentimento do paciente');
          
          alerts.push(await this.createComplianceAlert({
            type: 'lgpd',
            severity: 'high',
            title: 'Consentimento Necessário para IA',
            description: 'Processamento de dados pessoais por IA requer consentimento específico',
            affectedEntities: [request.context.patient?.id || 'unknown'],
            requiredActions: ['Obter consentimento para processamento por IA']
          }));
        }
      }
      
      // Verificar conformidade COFFITO para prompts clínicos
      if (this.isClinicalPrompt(request.type) && this.config.enableCOFFITO) {
        const coffitoCompliance = await this.checkCOFFITOPromptCompliance(request);
        
        if (!coffitoCompliance.isCompliant) {
          violations.push('Prompt não está em conformidade com COFFITO');
          requiredActions.push('Ajustar prompt para conformidade COFFITO');
        }
      }
      
      const isCompliant = violations.length === 0;
      
      // Log de auditoria
      if (this.config.autoAuditLogging) {
        await this.logPromptComplianceCheck(request, isCompliant, violations);
      }
      
      return {
        isCompliant,
        violations,
        requiredActions,
        consentStatus: {
          hasValidConsent: !involvesPersonalData || (involvesPersonalData && await this.checkDataProcessingConsent(request.context.patient?.id)),
          consentTypes: involvesPersonalData ? ['data_processing'] : [],
          missingConsents: involvesPersonalData && !await this.checkDataProcessingConsent(request.context.patient?.id) ? ['data_processing'] : []
        },
        coffitoStatus: {
          isCompliant: !this.isClinicalPrompt(request.type) || await this.checkCOFFITOPromptCompliance(request).then(r => r.isCompliant),
          violations: [],
          recommendations: []
        },
        alerts
      };
      
    } catch (error) {
      console.error('❌ Erro na verificação de conformidade de prompt:', error);
      throw error;
    }
  }

  /**
   * Monitorar conformidade em tempo real
   */
  async startRealTimeMonitoring(): Promise<void> {
    if (this.isMonitoring) {
      console.log('⚠️ Monitoramento em tempo real já está ativo');
      return;
    }
    
    console.log('🔍 Iniciando monitoramento de conformidade em tempo real');
    this.isMonitoring = true;
    
    // Verificar conformidade a cada 5 minutos
    const monitoringInterval = setInterval(async () => {
      if (!this.isMonitoring) {
        clearInterval(monitoringInterval);
        return;
      }
      
      try {
        const checkResult = await this.complianceManager.performRealTimeComplianceCheck();
        
        if (!checkResult.isCompliant) {
          console.warn('⚠️ Violações de conformidade detectadas:', checkResult.violations);
          
          // Notificar stakeholders
          await this.notifyComplianceViolations(checkResult.violations, checkResult.alerts);
        }
        
      } catch (error) {
        console.error('❌ Erro no monitoramento em tempo real:', error);
      }
    }, 5 * 60 * 1000); // 5 minutos
  }

  /**
   * Parar monitoramento em tempo real
   */
  async stopRealTimeMonitoring(): Promise<void> {
    console.log('🛑 Parando monitoramento de conformidade em tempo real');
    this.isMonitoring = false;
  }

  /**
   * Obter status de conformidade
   */
  async getComplianceStatus(): Promise<ComplianceStatus> {
    return await this.complianceManager.getComplianceStatus();
  }

  /**
   * Obter dashboard de conformidade
   */
  async getComplianceDashboard() {
    return await this.complianceManager.getComplianceDashboard();
  }

  // Métodos auxiliares
  private async checkLGPDConsent(patientId: string): Promise<{
    hasValidConsent: boolean;
    consentTypes: string[];
    missingConsents: string[];
  }> {
    const lgpdService = this.complianceManager.getLGPDService();
    
    const requiredConsents = ['data_processing', 'marketing', 'research'];
    const consentTypes: string[] = [];
    const missingConsents: string[] = [];
    
    for (const consentType of requiredConsents) {
      const hasConsent = await lgpdService.hasValidConsent(patientId, consentType, 'healthcare_provision');
      
      if (hasConsent) {
        consentTypes.push(consentType);
      } else {
        missingConsents.push(consentType);
      }
    }
    
    return {
      hasValidConsent: missingConsents.length === 0,
      consentTypes,
      missingConsents
    };
  }

  private async checkDataProcessingConsent(patientId?: string): Promise<boolean> {
    if (!patientId) return false;
    
    const lgpdService = this.complianceManager.getLGPDService();
    return await lgpdService.hasValidConsent(patientId, 'data_processing', 'ai_processing');
  }

  private async checkCOFFITOCompliance(request: SmartSchedulingRequest): Promise<{
    isCompliant: boolean;
    violations: string[];
    recommendations: string[];
  }> {
    const coffitoService = this.complianceManager.getCOFFITOService();
    
    // Verificar conformidade para agendamento
    const compliance = await coffitoService.checkCompliance(
      'therapist_1', // ID do terapeuta
      'appointment_scheduling',
      {
        patient: request.patient,
        appointmentType: request.appointmentType,
        preferences: request.preferences
      }
    );
    
    return {
      isCompliant: compliance.isCompliant,
      violations: compliance.violations,
      recommendations: compliance.recommendations
    };
  }

  private async checkCOFFITOPromptCompliance(request: PromptRequest): Promise<{
    isCompliant: boolean;
    violations: string[];
    recommendations: string[];
  }> {
    const coffitoService = this.complianceManager.getCOFFITOService();
    
    // Verificar conformidade para prompt clínico
    const compliance = await coffitoService.checkCompliance(
      'therapist_1',
      'clinical_prompt',
      {
        promptType: request.type,
        context: request.context,
        data: request.data
      }
    );
    
    return {
      isCompliant: compliance.isCompliant,
      violations: compliance.violations,
      recommendations: compliance.recommendations
    };
  }

  private checkIfPromptInvolvesPersonalData(request: PromptRequest): boolean {
    // Verificar se o prompt envolve dados pessoais
    const clinicalPrompts = [
      'clinical_analysis',
      'exercise_prescription',
      'evolution_report',
      'differential_diagnosis',
      'treatment_protocols',
      'effectiveness_analysis',
      'patient_communication'
    ];
    
    return clinicalPrompts.includes(request.type) && !!request.context.patient;
  }

  private isClinicalPrompt(promptType: string): boolean {
    const clinicalPrompts = [
      'clinical_analysis',
      'exercise_prescription',
      'evolution_report',
      'differential_diagnosis',
      'treatment_protocols',
      'effectiveness_analysis'
    ];
    
    return clinicalPrompts.includes(promptType);
  }

  private async createComplianceAlert(alertData: Omit<ComplianceAlert, 'id' | 'createdAt' | 'updatedAt'>): Promise<ComplianceAlert> {
    return await this.complianceManager.createAlert(alertData);
  }

  private async logComplianceCheck(
    request: SmartSchedulingRequest,
    isCompliant: boolean,
    violations: string[]
  ): Promise<void> {
    const lgpdService = this.complianceManager.getLGPDService();
    
    await lgpdService.logDataAccess(
      request.patient.id,
      'system',
      'appointment_scheduling',
      'compliance_check',
      'Verificação de conformidade para agendamento',
      'system',
      'compliance_integration'
    );
  }

  private async logPromptComplianceCheck(
    request: PromptRequest,
    isCompliant: boolean,
    violations: string[]
  ): Promise<void> {
    const lgpdService = this.complianceManager.getLGPDService();
    
    if (request.context.patient?.id) {
      await lgpdService.logDataAccess(
        request.context.patient.id,
        'system',
        'ai_prompt',
        'compliance_check',
        `Verificação de conformidade para prompt ${request.type}`,
        'system',
        'compliance_integration'
      );
    }
  }

  private async notifyComplianceViolations(
    violations: string[],
    alerts: ComplianceAlert[]
  ): Promise<void> {
    console.log('📧 Notificando violações de conformidade:', violations);
    
    // Implementar notificação real (email, Slack, etc.)
    for (const alert of alerts) {
      console.log(`🚨 Alerta: ${alert.title} - ${alert.description}`);
    }
  }
}
