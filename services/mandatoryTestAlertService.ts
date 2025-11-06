import { MandatoryTestAlert, AssessmentTestConfig, Pathology } from '../types';
import * as patientService from './patientService';
import * as pathologyService from './pathologyService';
import * as sessionEvolutionService from './sessionEvolutionService';
import { logDataSource } from '../config/supabaseTablesConfig';
import { secureLogger } from '../lib/secureLogger';

/**
 * Service para gerenciamento de alertas de testes obrigatórios
 * Sistema de 3 níveis: crítico, importante e leve
 * Crítico = bloqueia salvamento
 * Importante = aviso destacado mas permite salvar
 * Leve = apenas notificação
 * MODO HÍBRIDO: Usa dados do Supabase/Mock conforme disponibilidade
 */

// ============================================================================
// ALERT GENERATION
// ============================================================================

/**
 * Gera alertas de testes obrigatórios para uma sessão
 */
export async function generateMandatoryTestAlerts(
  patientId: string,
  sessionNumber: number
): Promise<MandatoryTestAlert[]> {
  try {
    const patient = await patientService.getPatientById(patientId);
    if (!patient) {
      throw new Error(`Paciente ${patientId} não encontrado`);
    }

    const alerts: MandatoryTestAlert[] = [];

    // Verificar alertas de configurações de teste
    const configAlerts = await generateAlertsFromTestConfigs(patient.id, sessionNumber);
    alerts.push(...configAlerts);

    // Verificar alertas baseados em patologias
    const pathologyAlerts = await generateAlertsFromPathologies(patient.id);
    alerts.push(...pathologyAlerts);

    return alerts.sort((a, b) => {
      // Ordenar por severidade
      const severityOrder = { critical: 3, important: 2, low: 1 };
      return severityOrder[b.severity] - severityOrder[a.severity];
    });
  } catch (error) {
    secureLogger.error('Erro ao gerar alertas de testes obrigatórios', error, {
      component: 'mandatoryTestAlertService',
      action: 'generateMandatoryTestAlerts',
      patientId
    });
    return [];
  }
}

/**
 * Gera alertas baseados nas configurações de teste do paciente
 */
async function generateAlertsFromTestConfigs(
  patientId: string,
  sessionNumber: number
): Promise<MandatoryTestAlert[]> {
  try {
    const patient = await patientService.getPatientById(patientId);
    if (!patient?.testConfigs) return [];

    const alerts: MandatoryTestAlert[] = [];

    for (const config of patient.testConfigs) {
      if (!config.isMandatory) continue;

      // Verificar se teste é obrigatório nesta sessão
      const isRequired = checkIfTestIsRequired(config, sessionNumber);
      
      if (isRequired) {
        const alert: MandatoryTestAlert = {
          id: `alert_config_${config.id}`,
          testConfigId: config.id,
          testName: config.testName,
          testType: config.testType,
          severity: determineSeverityFromConfig(config),
          reason: `Teste configurado como obrigatório a cada ${config.frequencySessions} sessão(ões)`,
          message: `⚠️ ${config.testName} deve ser realizado nesta sessão`,
          dueAt: new Date().toISOString(),
          isCompleted: false,
          canSkip: !config.isMandatory,
        };
        alerts.push(alert);
      }
    }

    return alerts;
  } catch (error) {
    secureLogger.error('Erro ao gerar alertas de configuração', error, {
      component: 'mandatoryTestAlertService',
      action: 'generateAlertsFromTestConfigs',
      patientId
    });
    return [];
  }
}

/**
 * Gera alertas baseados nas patologias do paciente
 */
async function generateAlertsFromPathologies(patientId: string): Promise<MandatoryTestAlert[]> {
  try {
    const pathologies = await pathologyService.getActivePathologies(patientId);
    const alerts: MandatoryTestAlert[] = [];

    for (const pathology of pathologies) {
      const pathologyAlerts = createAlertsForPathology(pathology);
      alerts.push(...pathologyAlerts);
    }

    return alerts;
  } catch (error) {
    secureLogger.error('Erro ao gerar alertas de patologias', error, {
      component: 'mandatoryTestAlertService',
      action: 'generateAlertsFromPathologies',
      patientId
    });
    return [];
  }
}

/**
 * Cria alertas específicos para uma patologia
 */
function createAlertsForPathology(pathology: Pathology): MandatoryTestAlert[] {
  const alerts: MandatoryTestAlert[] = [];
  const pathologyName = pathology.name.toLowerCase();

  // Lesão de LCA - CRÍTICO
  if (pathologyName.includes('lca') || pathologyName.includes('ligamento cruzado anterior')) {
    alerts.push({
      id: `alert_pathology_${pathology.id}_rom`,
      testConfigId: pathology.id,
      testName: 'Amplitude de movimento do joelho',
      testType: 'amplitude',
      severity: 'critical',
      reason: 'Pós-operatório de LCA requer monitoramento rigoroso da amplitude',
      message: '🚨 OBRIGATÓRIO: Medição de amplitude do joelho em toda sessão pós-op LCA',
      dueAt: new Date().toISOString(),
      isCompleted: false,
      canSkip: false,
    });
    
    alerts.push({
      id: `alert_pathology_${pathology.id}_lachman`,
      testConfigId: pathology.id,
      testName: 'Teste de Lachman',
      testType: 'functional',
      severity: 'important',
      reason: 'Avaliar estabilidade do joelho',
      message: '⚠️ Recomendado: Teste de Lachman para verificar estabilidade',
      dueAt: new Date().toISOString(),
      isCompleted: false,
      canSkip: true,
    });
  }

  // Menisco
  if (pathologyName.includes('menisco')) {
    alerts.push({
      id: `alert_pathology_${pathology.id}_rom`,
      testConfigId: pathology.id,
      testName: 'Amplitude de movimento do joelho',
      testType: 'amplitude',
      severity: 'important',
      reason: 'Lesão de menisco requer acompanhamento de mobilidade',
      message: '⚠️ Importante: Avaliar amplitude de movimento do joelho',
      dueAt: new Date().toISOString(),
      isCompleted: false,
      canSkip: true,
    });
  }

  // AVC
  if (pathologyName.includes('avc') || pathologyName.includes('acidente vascular')) {
    alerts.push({
      id: `alert_pathology_${pathology.id}_ashworth`,
      testConfigId: pathology.id,
      testName: 'Escala de Ashworth Modificada',
      testType: 'functional',
      severity: 'critical',
      reason: 'Monitoramento de espasticidade é essencial no pós-AVC',
      message: '🚨 OBRIGATÓRIO: Avaliar espasticidade com Escala de Ashworth',
      dueAt: new Date().toISOString(),
      isCompleted: false,
      canSkip: false,
    });
  }

  // Fratura
  if (pathologyName.includes('fratura')) {
    alerts.push({
      id: `alert_pathology_${pathology.id}_rom`,
      testConfigId: pathology.id,
      testName: 'Amplitude de movimento',
      testType: 'amplitude',
      severity: 'important',
      reason: 'Monitorar recuperação pós-fratura',
      message: '⚠️ Importante: Avaliar amplitude de movimento na região afetada',
      dueAt: new Date().toISOString(),
      isCompleted: false,
      canSkip: true,
    });
  }

  return alerts;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Verifica se teste é obrigatório nesta sessão
 */
function checkIfTestIsRequired(config: AssessmentTestConfig, sessionNumber: number): boolean {
  if (!config.frequencySessions) return false;
  
  // Verifica se é múltiplo da frequência
  return sessionNumber % config.frequencySessions === 0;
}

/**
 * Determina severidade baseado na configuração
 */
function determineSeverityFromConfig(config: AssessmentTestConfig): MandatoryTestAlert['severity'] {
  // Se tem nota indicando criticidade
  if (config.notes?.toLowerCase().includes('crítico')) {
    return 'critical';
  }
  if (config.notes?.toLowerCase().includes('importante')) {
    return 'important';
  }
  
  // Por padrão, testes obrigatórios são importantes
  return config.isMandatory ? 'important' : 'low';
}

/**
 * Verifica se todos os alertas críticos foram completados
 */
export async function checkCriticalAlertsCompleted(
  patientId: string,
  sessionId: string,
  sessionNumber: number
): Promise<{
  allCompleted: boolean;
  pendingCritical: MandatoryTestAlert[];
  pendingImportant: MandatoryTestAlert[];
}> {
  try {
    const alerts = await generateMandatoryTestAlerts(patientId, sessionNumber);
    const session = await sessionEvolutionService.getSessionEvolution(sessionId);
    
    if (!session) {
      return {
        allCompleted: false,
        pendingCritical: alerts.filter(a => a.severity === 'critical'),
        pendingImportant: alerts.filter(a => a.severity === 'important'),
      };
    }

    // Marcar alertas como completados se teste foi realizado
    const updatedAlerts = alerts.map(alert => ({
      ...alert,
      isCompleted: session.testsPerformed.some(test =>
        test.testName.toLowerCase() === alert.testName.toLowerCase()
      ),
      completedAt: session.testsPerformed.find(test =>
        test.testName.toLowerCase() === alert.testName.toLowerCase()
      )?.assessedAt,
    }));

    const pendingCritical = updatedAlerts.filter(
      a => a.severity === 'critical' && !a.isCompleted
    );
    const pendingImportant = updatedAlerts.filter(
      a => a.severity === 'important' && !a.isCompleted
    );

    return {
      allCompleted: pendingCritical.length === 0,
      pendingCritical,
      pendingImportant,
    };
  } catch (error) {
    secureLogger.error('Erro ao verificar alertas críticos', error, {
      component: 'mandatoryTestAlertService',
      action: 'checkCriticalAlertsCompleted',
      patientId,
      sessionId
    });
    return {
      allCompleted: false,
      pendingCritical: [],
      pendingImportant: [],
    };
  }
}

/**
 * Formata mensagem de alerta para exibição
 */
export function formatAlertMessage(alert: MandatoryTestAlert): {
  icon: string;
  color: string;
  bgColor: string;
  borderColor: string;
  title: string;
  canBypass: boolean;
} {
  const severityConfig = {
    critical: {
      icon: '🚨',
      color: 'text-red-800',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-300',
      title: 'TESTE OBRIGATÓRIO',
      canBypass: false,
    },
    important: {
      icon: '⚠️',
      color: 'text-orange-800',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-300',
      title: 'TESTE RECOMENDADO',
      canBypass: true,
    },
    low: {
      icon: 'ℹ️',
      color: 'text-blue-800',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-300',
      title: 'SUGESTÃO DE TESTE',
      canBypass: true,
    },
  };

  return severityConfig[alert.severity];
}

/**
 * Registra exceção (quando profissional pula teste obrigatório)
 */
export async function logTestException(
  patientId: string,
  sessionId: string,
  alert: MandatoryTestAlert,
  reason: string,
  userId: string
): Promise<void> {
  try {
    // Em produção, salvar no banco de dados/auditoria
    secureLogger.warn('Exceção de teste obrigatório registrada', {
      component: 'mandatoryTestAlertService',
      action: 'logTestException',
      patientId,
      sessionId,
      testName: alert.testName,
      severity: alert.severity,
      userId,
      timestamp: new Date().toISOString()
    });

    // Aqui você poderia adicionar ao sistema de auditoria
    // await auditService.logException(...)
  } catch (error) {
    secureLogger.error('Erro ao registrar exceção de teste', error, {
      component: 'mandatoryTestAlertService',
      action: 'logTestException',
      patientId,
      sessionId
    });
    throw error;
  }
}

/**
 * Busca histórico de alertas do paciente
 */
export async function getAlertHistory(
  patientId: string,
  limit = 50
): Promise<Array<{
  sessionNumber: number;
  sessionDate: string;
  alerts: MandatoryTestAlert[];
  completedCount: number;
  pendingCount: number;
}>> {
  try {
    const sessions = await sessionEvolutionService.getEvolutionsByPatientId(patientId);
    const history = [];

    for (const session of sessions.slice(-limit)) {
      const alerts = await generateMandatoryTestAlerts(patientId, session.sessionNumber);
      
      const completed = alerts.filter(alert =>
        session.testsPerformed.some(test =>
          test.testName.toLowerCase() === alert.testName.toLowerCase()
        )
      );

      history.push({
        sessionNumber: session.sessionNumber,
        sessionDate: session.sessionDate,
        alerts,
        completedCount: completed.length,
        pendingCount: alerts.length - completed.length,
      });
    }

    return history;
  } catch (error) {
    secureLogger.error('Erro ao buscar histórico de alertas', error, {
      component: 'mandatoryTestAlertService',
      action: 'getAlertHistory',
      patientId
    });
    return [];
  }
}

/**
 * Calcula taxa de compliance (cumprimento) de testes obrigatórios
 */
export async function calculateComplianceRate(patientId: string): Promise<{
  totalAlerts: number;
  completedAlerts: number;
  complianceRate: number; // 0-100
  criticalCompliance: number;
  importantCompliance: number;
}> {
  try {
    const history = await getAlertHistory(patientId);
    
    let totalAlerts = 0;
    let completedAlerts = 0;
    let totalCritical = 0;
    let completedCritical = 0;
    let totalImportant = 0;
    let completedImportant = 0;

    history.forEach(h => {
      totalAlerts += h.alerts.length;
      completedAlerts += h.completedCount;

      h.alerts.forEach(alert => {
        if (alert.severity === 'critical') {
          totalCritical++;
          if (alert.isCompleted) completedCritical++;
        } else if (alert.severity === 'important') {
          totalImportant++;
          if (alert.isCompleted) completedImportant++;
        }
      });
    });

    return {
      totalAlerts,
      completedAlerts,
      complianceRate: totalAlerts > 0 ? (completedAlerts / totalAlerts) * 100 : 100,
      criticalCompliance: totalCritical > 0 ? (completedCritical / totalCritical) * 100 : 100,
      importantCompliance: totalImportant > 0 ? (completedImportant / totalImportant) * 100 : 100,
    };
  } catch (error) {
    secureLogger.error('Erro ao calcular taxa de compliance', error, {
      component: 'mandatoryTestAlertService',
      action: 'calculateComplianceRate',
      patientId
    });
    return {
      totalAlerts: 0,
      completedAlerts: 0,
      complianceRate: 0,
      criticalCompliance: 0,
      importantCompliance: 0,
    };
  }
}

