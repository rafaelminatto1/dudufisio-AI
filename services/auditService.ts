/**
 * Serviço de Auditoria
 * Log de todas as operações no sistema de exercícios
 */

export interface AuditLog {
  id: string;
  timestamp: Date;
  action: AuditAction;
  entityType: EntityType;
  entityId: string;
  entityName: string;
  userId: string;
  userName: string;
  changes?: {
    before?: any;
    after?: any;
  };
  metadata?: Record<string, any>;
}

export type AuditAction = 
  | 'create' 
  | 'update' 
  | 'delete' 
  | 'view' 
  | 'export' 
  | 'import'
  | 'assign'
  | 'unassign'
  | 'duplicate';

export type EntityType = 
  | 'exercise' 
  | 'category' 
  | 'protocol' 
  | 'assignment' 
  | 'template'
  | 'session';

class AuditService {
  private logs: AuditLog[] = [];
  private readonly storageKey = 'exerciseAuditLogs';
  private readonly maxLogs = 1000; // Manter últimos 1000 logs

  constructor() {
    this.loadLogs();
  }

  /**
   * Carregar logs do localStorage
   */
  private loadLogs(): void {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        this.logs = JSON.parse(stored).map((log: any) => ({
          ...log,
          timestamp: new Date(log.timestamp)
        }));
      }
    } catch (error) {
      console.error('Erro ao carregar logs de auditoria:', error);
    }
  }

  /**
   * Salvar logs no localStorage
   */
  private saveLogs(): void {
    try {
      // Manter apenas os últimos maxLogs
      if (this.logs.length > this.maxLogs) {
        this.logs = this.logs.slice(-this.maxLogs);
      }
      localStorage.setItem(this.storageKey, JSON.stringify(this.logs));
    } catch (error) {
      console.error('Erro ao salvar logs de auditoria:', error);
    }
  }

  /**
   * Registrar uma ação
   */
  log(params: {
    action: AuditAction;
    entityType: EntityType;
    entityId: string;
    entityName: string;
    userId?: string;
    userName?: string;
    changes?: { before?: any; after?: any };
    metadata?: Record<string, any>;
  }): void {
    const log: AuditLog = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      userId: params.userId || 'current-user',
      userName: params.userName || 'Usuário Atual',
      ...params
    };

    this.logs.push(log);
    this.saveLogs();

    // Log no console para debug
    console.log('🔍 Audit Log:', {
      action: log.action,
      entity: `${log.entityType}/${log.entityName}`,
      user: log.userName,
      time: log.timestamp.toLocaleTimeString()
    });
  }

  /**
   * Buscar logs por critérios
   */
  search(filters: {
    entityType?: EntityType;
    entityId?: string;
    action?: AuditAction;
    userId?: string;
    startDate?: Date;
    endDate?: Date;
  }): AuditLog[] {
    let filtered = [...this.logs];

    if (filters.entityType) {
      filtered = filtered.filter(log => log.entityType === filters.entityType);
    }

    if (filters.entityId) {
      filtered = filtered.filter(log => log.entityId === filters.entityId);
    }

    if (filters.action) {
      filtered = filtered.filter(log => log.action === filters.action);
    }

    if (filters.userId) {
      filtered = filtered.filter(log => log.userId === filters.userId);
    }

    if (filters.startDate) {
      filtered = filtered.filter(log => log.timestamp >= filters.startDate!);
    }

    if (filters.endDate) {
      filtered = filtered.filter(log => log.timestamp <= filters.endDate!);
    }

    return filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  /**
   * Buscar histórico de uma entidade específica
   */
  getEntityHistory(entityType: EntityType, entityId: string): AuditLog[] {
    return this.search({ entityType, entityId });
  }

  /**
   * Buscar ações de um usuário
   */
  getUserActivity(userId: string, limit?: number): AuditLog[] {
    const logs = this.search({ userId });
    return limit ? logs.slice(0, limit) : logs;
  }

  /**
   * Obter estatísticas de auditoria
   */
  getStats(): {
    totalLogs: number;
    byAction: Record<AuditAction, number>;
    byEntityType: Record<EntityType, number>;
    recentActivity: AuditLog[];
  } {
    const byAction = {} as Record<AuditAction, number>;
    const byEntityType = {} as Record<EntityType, number>;

    this.logs.forEach(log => {
      byAction[log.action] = (byAction[log.action] || 0) + 1;
      byEntityType[log.entityType] = (byEntityType[log.entityType] || 0) + 1;
    });

    return {
      totalLogs: this.logs.length,
      byAction,
      byEntityType,
      recentActivity: this.logs.slice(-10).reverse()
    };
  }

  /**
   * Limpar logs antigos
   */
  clearOldLogs(daysToKeep: number = 30): void {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    this.logs = this.logs.filter(log => log.timestamp >= cutoffDate);
    this.saveLogs();

    console.log(`🗑️ Logs anteriores a ${cutoffDate.toLocaleDateString()} foram removidos`);
  }

  /**
   * Exportar logs para análise
   */
  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  /**
   * Limpar todos os logs (use com cuidado!)
   */
  clearAllLogs(): void {
    if (confirm('Tem certeza que deseja limpar TODOS os logs de auditoria?')) {
      this.logs = [];
      this.saveLogs();
      console.log('🗑️ Todos os logs de auditoria foram removidos');
    }
  }
}

// Instância singleton
export const auditService = new AuditService();

// Funções de conveniência
export const logExerciseCreate = (exerciseId: string, exerciseName: string) => {
  auditService.log({
    action: 'create',
    entityType: 'exercise',
    entityId: exerciseId,
    entityName: exerciseName
  });
};

export const logExerciseUpdate = (exerciseId: string, exerciseName: string, before: any, after: any) => {
  auditService.log({
    action: 'update',
    entityType: 'exercise',
    entityId: exerciseId,
    entityName: exerciseName,
    changes: { before, after }
  });
};

export const logExerciseDelete = (exerciseId: string, exerciseName: string) => {
  auditService.log({
    action: 'delete',
    entityType: 'exercise',
    entityId: exerciseId,
    entityName: exerciseName
  });
};

export const logExerciseDuplicate = (originalId: string, newId: string, exerciseName: string) => {
  auditService.log({
    action: 'duplicate',
    entityType: 'exercise',
    entityId: newId,
    entityName: exerciseName,
    metadata: { originalId }
  });
};

export const logProtocolCreate = (protocolId: string, protocolName: string) => {
  auditService.log({
    action: 'create',
    entityType: 'protocol',
    entityId: protocolId,
    entityName: protocolName
  });
};

export const logAssignment = (assignmentId: string, patientName: string, exerciseName: string) => {
  auditService.log({
    action: 'assign',
    entityType: 'assignment',
    entityId: assignmentId,
    entityName: `${exerciseName} -> ${patientName}`,
    metadata: { patientName, exerciseName }
  });
};

export const logFinancialOperation = (operationId: string, operationType: string, amount: number | string, description?: string) => {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  const safeAmount = isNaN(numAmount) ? 0 : numAmount;
  
  auditService.log({
    action: 'financial_operation',
    entityType: 'financial' as EntityType,
    entityId: operationId,
    entityName: `${operationType} - R$ ${safeAmount.toFixed(2)}`,
    metadata: { 
      operationType, 
      amount: safeAmount,
      description,
      timestamp: new Date().toISOString()
    }
  });
};

// Export auditHelpers para compatibilidade
export const auditHelpers = {
  logExerciseCreate,
  logExerciseUpdate,
  logExerciseDelete,
  logExerciseDuplicate,
  logProtocolCreate,
  logAssignment,
  logFinancialOperation,
  auditService
};