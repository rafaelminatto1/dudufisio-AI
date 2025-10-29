// services/alertingService.ts
import { PatientWithMonitoringMetrics, Patient, Appointment } from '../types';

export type AlertType = 
  | 'high_risk' 
  | 'consecutive_misses' 
  | 'pain_worsening' 
  | 'prolonged_inactivity'
  | 'attendance_goal_not_met';

export type AlertSeverity = 'critical' | 'warning' | 'info';

export interface Alert {
  id: string;
  type: AlertType;
  severity: AlertSeverity;
  patientId: string;
  patientName: string;
  title: string;
  message: string;
  actionRequired: string;
  createdAt: string;
  isRead: boolean;
  metadata?: Record<string, any>;
}

/**
 * Gera alertas inteligentes baseado nos dados dos pacientes
 */
export function generateAlerts(
  patientsWithMetrics: PatientWithMonitoringMetrics[]
): Alert[] {
  const alerts: Alert[] = [];
  const now = new Date().toISOString();

  patientsWithMetrics.forEach(patient => {
    // Alerta 1: Paciente em Alto Risco
    if (patient.riskLevel === 'high') {
      alerts.push({
        id: `${patient.id}-high-risk-${Date.now()}`,
        type: 'high_risk',
        severity: 'critical',
        patientId: patient.id,
        patientName: patient.name,
        title: '🚨 Paciente em Alto Risco',
        message: `${patient.name} está em alto risco de abandono. ${patient.riskReasons.join(', ')}.`,
        actionRequired: 'Contate o paciente urgentemente',
        createdAt: now,
        isRead: false,
        metadata: {
          riskReasons: patient.riskReasons,
          attendanceRate: patient.attendanceRate,
        },
      });
    }

    // Alerta 2: Faltas Consecutivas (2+)
    if (patient.consecutiveMisses >= 2) {
      alerts.push({
        id: `${patient.id}-consecutive-misses-${Date.now()}`,
        type: 'consecutive_misses',
        severity: patient.consecutiveMisses >= 3 ? 'critical' : 'warning',
        patientId: patient.id,
        patientName: patient.name,
        title: `⚠️ ${patient.consecutiveMisses} Faltas Consecutivas`,
        message: `${patient.name} faltou ${patient.consecutiveMisses} sessões seguidas.`,
        actionRequired: 'Verificar motivo e reagendar',
        createdAt: now,
        isRead: false,
        metadata: {
          consecutiveMisses: patient.consecutiveMisses,
        },
      });
    }

    // Alerta 3: Piora Súbita de Dor (>3 pontos)
    if (patient.painTrend === 'worsening' && patient.averagePainLevel >= 6) {
      alerts.push({
        id: `${patient.id}-pain-worsening-${Date.now()}`,
        type: 'pain_worsening',
        severity: 'warning',
        patientId: patient.id,
        patientName: patient.name,
        title: '📈 Piora de Dor Detectada',
        message: `${patient.name} apresenta piora no nível de dor (atual: ${patient.averagePainLevel.toFixed(1)}).`,
        actionRequired: 'Revisar tratamento e protocolo',
        createdAt: now,
        isRead: false,
        metadata: {
          painLevel: patient.averagePainLevel,
          painTrend: patient.painTrend,
        },
      });
    }

    // Alerta 4: Inatividade Prolongada (30+ dias)
    if (patient.daysSinceLastSession >= 30) {
      alerts.push({
        id: `${patient.id}-prolonged-inactivity-${Date.now()}`,
        type: 'prolonged_inactivity',
        severity: patient.daysSinceLastSession >= 60 ? 'critical' : 'warning',
        patientId: patient.id,
        patientName: patient.name,
        title: '⏰ Inatividade Prolongada',
        message: `${patient.name} está há ${patient.daysSinceLastSession} dias sem sessão.`,
        actionRequired: 'Entrar em contato para reengajamento',
        createdAt: now,
        isRead: false,
        metadata: {
          daysSinceLastSession: patient.daysSinceLastSession,
        },
      });
    }

    // Alerta 5: Meta de Presença Não Atingida (<75%)
    if (patient.attendanceRate < 75 && patient.totalSessions >= 5) {
      alerts.push({
        id: `${patient.id}-attendance-goal-${Date.now()}`,
        type: 'attendance_goal_not_met',
        severity: 'info',
        patientId: patient.id,
        patientName: patient.name,
        title: '📊 Meta de Presença Não Atingida',
        message: `${patient.name} tem taxa de presença de ${patient.attendanceRate.toFixed(1)}% (meta: 75%).`,
        actionRequired: 'Conversar sobre compromisso com tratamento',
        createdAt: now,
        isRead: false,
        metadata: {
          attendanceRate: patient.attendanceRate,
          goalRate: 75,
        },
      });
    }
  });

  // Ordenar por severidade (critical > warning > info)
  return alerts.sort((a, b) => {
    const severityOrder = { critical: 3, warning: 2, info: 1 };
    return severityOrder[b.severity] - severityOrder[a.severity];
  });
}

/**
 * Filtra alertas por tipo
 */
export function filterAlertsByType(alerts: Alert[], type: AlertType): Alert[] {
  return alerts.filter(alert => alert.type === type);
}

/**
 * Filtra alertas por severidade
 */
export function filterAlertsBySeverity(alerts: Alert[], severity: AlertSeverity): Alert[] {
  return alerts.filter(alert => alert.severity === severity);
}

/**
 * Conta alertas não lidos
 */
export function countUnreadAlerts(alerts: Alert[]): number {
  return alerts.filter(alert => !alert.isRead).length;
}

/**
 * Marca alerta como lido
 */
export function markAlertAsRead(alerts: Alert[], alertId: string): Alert[] {
  return alerts.map(alert =>
    alert.id === alertId ? { ...alert, isRead: true } : alert
  );
}

/**
 * Marca todos os alertas como lidos
 */
export function markAllAlertsAsRead(alerts: Alert[]): Alert[] {
  return alerts.map(alert => ({ ...alert, isRead: true }));
}

/**
 * Obtém resumo de alertas
 */
export function getAlertsSummary(alerts: Alert[]): {
  total: number;
  unread: number;
  critical: number;
  warning: number;
  info: number;
  byType: Record<AlertType, number>;
} {
  const summary = {
    total: alerts.length,
    unread: countUnreadAlerts(alerts),
    critical: alerts.filter(a => a.severity === 'critical').length,
    warning: alerts.filter(a => a.severity === 'warning').length,
    info: alerts.filter(a => a.severity === 'info').length,
    byType: {
      high_risk: 0,
      consecutive_misses: 0,
      pain_worsening: 0,
      prolonged_inactivity: 0,
      attendance_goal_not_met: 0,
    } as Record<AlertType, number>,
  };

  alerts.forEach(alert => {
    summary.byType[alert.type]++;
  });

  return summary;
}

/**
 * Gera mensagem de notificação para diferentes canais
 */
export function generateNotificationMessage(
  alert: Alert,
  channel: 'in-app' | 'email' | 'whatsapp' | 'push'
): string {
  const templates = {
    'in-app': `${alert.title}\n${alert.message}\n\n💡 ${alert.actionRequired}`,
    
    'email': `
      <h2>${alert.title}</h2>
      <p>${alert.message}</p>
      <p><strong>Ação Requerida:</strong> ${alert.actionRequired}</p>
      <p><small>Alerta gerado em: ${new Date(alert.createdAt).toLocaleString('pt-BR')}</small></p>
    `,
    
    'whatsapp': `*${alert.title}*\n\n${alert.message}\n\n_${alert.actionRequired}_`,
    
    'push': `${alert.title}: ${alert.message}`,
  };

  return templates[channel];
}

/**
 * Verifica se deve enviar notificação (throttling para não spammar)
 */
export function shouldSendNotification(
  alert: Alert,
  lastSentAlerts: Map<string, string>
): boolean {
  const key = `${alert.patientId}-${alert.type}`;
  const lastSent = lastSentAlerts.get(key);

  if (!lastSent) return true;

  // Não enviar se já enviou nas últimas 24 horas
  const hoursSinceLastSent = 
    (Date.now() - new Date(lastSent).getTime()) / (1000 * 60 * 60);

  return hoursSinceLastSent >= 24;
}


