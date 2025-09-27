import { AuditLogEntry } from '../types';
import { mockAuditLogs } from '../data/mockData';

/**
 * 🔍 SISTEMA DE AUDITORIA PROFISSIONAL
 *
 * Sistema centralizado de auditoria e logs para rastreamento
 * de todas as ações críticas realizadas no sistema
 */

export type AuditAction =
  // Authentication
  | 'LOGIN_SUCCESS' | 'LOGIN_ATTEMPT_FAILED' | 'LOGOUT' | 'AUTO_LOGOUT' | 'PASSWORD_CHANGE'
  // Patient Management
  | 'CREATE_PATIENT' | 'UPDATE_PATIENT' | 'DELETE_PATIENT' | 'VIEW_PATIENT_RECORD'
  // Appointment Management
  | 'CREATE_APPOINTMENT' | 'UPDATE_APPOINTMENT' | 'DELETE_APPOINTMENT' | 'RESCHEDULE_APPOINTMENT'
  // Financial Operations
  | 'CREATE_TRANSACTION' | 'UPDATE_TRANSACTION' | 'DELETE_TRANSACTION' | 'VIEW_FINANCIAL_REPORT'
  // Treatment Management
  | 'CREATE_TREATMENT' | 'UPDATE_TREATMENT' | 'DELETE_TREATMENT' | 'CREATE_SOAP_NOTE'
  // Security Actions
  | 'SECURITY_PASSWORD_CHANGE' | 'SECURITY_LOGIN_SUSPICIOUS' | 'SECURITY_ACCESS_DENIED'
  // System Actions
  | 'AI_QUERY' | 'SYSTEM_BACKUP' | 'SYSTEM_RESTORE' | 'ASSIGN_TASK'
  // Exports and Reports
  | 'EXPORT_DATA' | 'GENERATE_REPORT' | 'VIEW_AUDIT_LOG';

export interface CreateAuditLogParams {
  user: string;
  action: AuditAction;
  details: string;
  resourceId?: string;
  resourceType?: 'patient' | 'appointment' | 'treatment' | 'transaction' | 'user';
  metadata?: Record<string, any>;
  ipAddress?: string;
}

class AuditService {
  private static instance: AuditService;
  private logs: AuditLogEntry[] = [...mockAuditLogs];
  private listeners: Set<(log: AuditLogEntry) => void> = new Set();

  private constructor() {
    // Load existing logs from localStorage
    this.loadLogsFromStorage();
  }

  public static getInstance(): AuditService {
    if (!AuditService.instance) {
      AuditService.instance = new AuditService();
    }
    return AuditService.instance;
  }

  /**
   * Cria um novo log de auditoria
   */
  public async createLog(params: CreateAuditLogParams): Promise<AuditLogEntry> {
    const logEntry: AuditLogEntry = {
      id: this.generateId(),
      user: params.user,
      action: params.action,
      details: params.details,
      timestamp: new Date(),
      ipAddress: params.ipAddress || this.getClientIP(),
      // Additional metadata for advanced auditing
      ...(params.resourceId && { resourceId: params.resourceId }),
      ...(params.resourceType && { resourceType: params.resourceType }),
      ...(params.metadata && { metadata: params.metadata })
    };

    // Add to logs array
    this.logs.unshift(logEntry);

    // Persist to localStorage
    this.saveLogsToStorage();

    // Notify listeners
    this.notifyListeners(logEntry);

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 Audit Log:', logEntry);
    }

    return logEntry;
  }

  /**
   * Busca logs com filtros
   */
  public getLogs(filters?: {
    user?: string;
    action?: string;
    dateFrom?: Date;
    dateTo?: Date;
    resourceType?: string;
  }): AuditLogEntry[] {
    let filteredLogs = [...this.logs];

    if (filters) {
      if (filters.user) {
        filteredLogs = filteredLogs.filter(log =>
          log.user.toLowerCase().includes(filters.user!.toLowerCase()) ||
          log.details.toLowerCase().includes(filters.user!.toLowerCase())
        );
      }

      if (filters.action && filters.action !== 'All') {
        filteredLogs = filteredLogs.filter(log => log.action === filters.action);
      }

      if (filters.dateFrom) {
        filteredLogs = filteredLogs.filter(log => log.timestamp >= filters.dateFrom!);
      }

      if (filters.dateTo) {
        filteredLogs = filteredLogs.filter(log => log.timestamp <= filters.dateTo!);
      }

      if (filters.resourceType) {
        filteredLogs = filteredLogs.filter(log =>
          (log as any).resourceType === filters.resourceType
        );
      }
    }

    return filteredLogs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  /**
   * Obtém estatísticas de auditoria
   */
  public getStats() {
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const last7Days = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const recentLogs = this.logs.filter(log => log.timestamp >= last24Hours);
    const weeklyLogs = this.logs.filter(log => log.timestamp >= last7Days);

    const actionCounts = this.logs.reduce((acc, log) => {
      acc[log.action] = (acc[log.action] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const userCounts = this.logs.reduce((acc, log) => {
      acc[log.user] = (acc[log.user] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalLogs: this.logs.length,
      last24Hours: recentLogs.length,
      last7Days: weeklyLogs.length,
      topActions: Object.entries(actionCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([action, count]) => ({ action, count })),
      topUsers: Object.entries(userCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([user, count]) => ({ user, count })),
      securityEvents: this.logs.filter(log =>
        log.action.includes('SECURITY') ||
        log.action.includes('FAILED') ||
        log.action === 'AUTO_LOGOUT'
      ).length
    };
  }

  /**
   * Adiciona listener para novos logs
   */
  public addListener(callback: (log: AuditLogEntry) => void): void {
    this.listeners.add(callback);
  }

  /**
   * Remove listener
   */
  public removeListener(callback: (log: AuditLogEntry) => void): void {
    this.listeners.delete(callback);
  }

  /**
   * Limpa logs antigos (manter apenas últimos 30 dias)
   */
  public cleanupOldLogs(daysToKeep: number = 30): number {
    const cutoffDate = new Date(Date.now() - daysToKeep * 24 * 60 * 60 * 1000);
    const initialCount = this.logs.length;

    this.logs = this.logs.filter(log => log.timestamp >= cutoffDate);
    this.saveLogsToStorage();

    const removedCount = initialCount - this.logs.length;

    if (removedCount > 0) {
      this.createLog({
        user: 'System',
        action: 'SYSTEM_BACKUP',
        details: `Limpeza automática removeu ${removedCount} logs antigos (>${daysToKeep} dias)`
      });
    }

    return removedCount;
  }

  // Private methods
  private generateId(): string {
    return `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getClientIP(): string {
    // In a real implementation, this would get the actual client IP
    return '127.0.0.1';
  }

  private notifyListeners(log: AuditLogEntry): void {
    this.listeners.forEach(callback => {
      try {
        callback(log);
      } catch (error) {
        console.error('Error notifying audit log listener:', error);
      }
    });
  }

  private saveLogsToStorage(): void {
    try {
      // Keep only last 1000 logs in localStorage to prevent storage bloat
      const logsToSave = this.logs.slice(0, 1000);
      localStorage.setItem('auditLogs', JSON.stringify(logsToSave));
    } catch (error) {
      console.error('Failed to save audit logs to storage:', error);
    }
  }

  private loadLogsFromStorage(): void {
    try {
      const storedLogs = localStorage.getItem('auditLogs');
      if (storedLogs) {
        const parsed = JSON.parse(storedLogs);
        // Merge with mock data, avoiding duplicates
        const existingIds = new Set(this.logs.map(log => log.id));
        const newLogs = parsed.filter((log: AuditLogEntry) => !existingIds.has(log.id));

        // Convert timestamp strings back to Date objects
        newLogs.forEach((log: AuditLogEntry) => {
          log.timestamp = new Date(log.timestamp);
        });

        this.logs = [...newLogs, ...this.logs];
      }
    } catch (error) {
      console.error('Failed to load audit logs from storage:', error);
    }
  }
}

// Export singleton instance
export const auditService = AuditService.getInstance();

// Helper functions for common audit operations
export const auditHelpers = {
  /**
   * Log de autenticação
   */
  logAuth: (user: string, success: boolean, details?: string) => {
    return auditService.createLog({
      user,
      action: success ? 'LOGIN_SUCCESS' : 'LOGIN_ATTEMPT_FAILED',
      details: details || (success ? 'Login realizado com sucesso' : 'Tentativa de login falhou'),
      resourceType: 'user'
    });
  },

  /**
   * Log de operações em pacientes
   */
  logPatientOperation: (user: string, action: 'CREATE_PATIENT' | 'UPDATE_PATIENT' | 'DELETE_PATIENT' | 'VIEW_PATIENT_RECORD', patientId: string, patientName: string, details?: string) => {
    const actionMap = {
      CREATE_PATIENT: 'Criou novo paciente',
      UPDATE_PATIENT: 'Atualizou informações do paciente',
      DELETE_PATIENT: 'Excluiu paciente',
      VIEW_PATIENT_RECORD: 'Visualizou prontuário do paciente'
    };

    return auditService.createLog({
      user,
      action,
      details: details || `${actionMap[action]}: ${patientName} (ID: ${patientId})`,
      resourceId: patientId,
      resourceType: 'patient'
    });
  },

  /**
   * Log de operações financeiras
   */
  logFinancialOperation: (user: string, action: 'CREATE_TRANSACTION' | 'UPDATE_TRANSACTION' | 'DELETE_TRANSACTION', transactionId: string, amount: number, details?: string) => {
    const actionMap = {
      CREATE_TRANSACTION: 'Criou nova transação',
      UPDATE_TRANSACTION: 'Atualizou transação',
      DELETE_TRANSACTION: 'Excluiu transação'
    };

    return auditService.createLog({
      user,
      action,
      details: details || `${actionMap[action]}: R$ ${amount.toFixed(2)} (ID: ${transactionId})`,
      resourceId: transactionId,
      resourceType: 'transaction',
      metadata: { amount }
    });
  },

  /**
   * Log de operações em consultas
   */
  logAppointmentOperation: (user: string, action: 'CREATE_APPOINTMENT' | 'UPDATE_APPOINTMENT' | 'DELETE_APPOINTMENT' | 'RESCHEDULE_APPOINTMENT', appointmentId: string, patientName: string, details?: string) => {
    const actionMap = {
      CREATE_APPOINTMENT: 'Criou novo agendamento',
      UPDATE_APPOINTMENT: 'Atualizou agendamento',
      DELETE_APPOINTMENT: 'Excluiu agendamento',
      RESCHEDULE_APPOINTMENT: 'Reagendou consulta'
    };

    return auditService.createLog({
      user,
      action,
      details: details || `${actionMap[action]} para ${patientName} (ID: ${appointmentId})`,
      resourceId: appointmentId,
      resourceType: 'appointment'
    });
  }
};