/**
 * Serviço de Auditoria
 * Log de todas as operações no sistema de exercícios
 */
class AuditService {
    constructor() {
        this.logs = [];
        this.storageKey = 'exerciseAuditLogs';
        this.maxLogs = 1000; // Manter últimos 1000 logs
        this.loadLogs();
    }
    /**
     * Carregar logs do localStorage
     */
    loadLogs() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            if (stored) {
                this.logs = JSON.parse(stored).map((log) => ({
                    ...log,
                    timestamp: new Date(log.timestamp)
                }));
            }
        }
        catch (error) {
            console.error('Erro ao carregar logs de auditoria:', error);
        }
    }
    /**
     * Salvar logs no localStorage
     */
    saveLogs() {
        try {
            // Manter apenas os últimos maxLogs
            if (this.logs.length > this.maxLogs) {
                this.logs = this.logs.slice(-this.maxLogs);
            }
            localStorage.setItem(this.storageKey, JSON.stringify(this.logs));
        }
        catch (error) {
            console.error('Erro ao salvar logs de auditoria:', error);
        }
    }
    /**
     * Registrar uma ação
     */
    log(params) {
        const log = {
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
    search(filters) {
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
            filtered = filtered.filter(log => log.timestamp >= filters.startDate);
        }
        if (filters.endDate) {
            filtered = filtered.filter(log => log.timestamp <= filters.endDate);
        }
        return filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    }
    /**
     * Buscar histórico de uma entidade específica
     */
    getEntityHistory(entityType, entityId) {
        return this.search({ entityType, entityId });
    }
    /**
     * Buscar ações de um usuário
     */
    getUserActivity(userId, limit) {
        const logs = this.search({ userId });
        return limit ? logs.slice(0, limit) : logs;
    }
    /**
     * Obter estatísticas de auditoria
     */
    getStats() {
        const byAction = {};
        const byEntityType = {};
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
    clearOldLogs(daysToKeep = 30) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
        this.logs = this.logs.filter(log => log.timestamp >= cutoffDate);
        this.saveLogs();
        console.log(`🗑️ Logs anteriores a ${cutoffDate.toLocaleDateString()} foram removidos`);
    }
    /**
     * Exportar logs para análise
     */
    exportLogs() {
        return JSON.stringify(this.logs, null, 2);
    }
    /**
     * Limpar todos os logs (use com cuidado!)
     */
    clearAllLogs() {
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
export const logExerciseCreate = (exerciseId, exerciseName) => {
    auditService.log({
        action: 'create',
        entityType: 'exercise',
        entityId: exerciseId,
        entityName: exerciseName
    });
};
export const logExerciseUpdate = (exerciseId, exerciseName, before, after) => {
    auditService.log({
        action: 'update',
        entityType: 'exercise',
        entityId: exerciseId,
        entityName: exerciseName,
        changes: { before, after }
    });
};
export const logExerciseDelete = (exerciseId, exerciseName) => {
    auditService.log({
        action: 'delete',
        entityType: 'exercise',
        entityId: exerciseId,
        entityName: exerciseName
    });
};
export const logExerciseDuplicate = (originalId, newId, exerciseName) => {
    auditService.log({
        action: 'duplicate',
        entityType: 'exercise',
        entityId: newId,
        entityName: exerciseName,
        metadata: { originalId }
    });
};
export const logProtocolCreate = (protocolId, protocolName) => {
    auditService.log({
        action: 'create',
        entityType: 'protocol',
        entityId: protocolId,
        entityName: protocolName
    });
};
export const logAssignment = (assignmentId, patientName, exerciseName) => {
    auditService.log({
        action: 'assign',
        entityType: 'assignment',
        entityId: assignmentId,
        entityName: `${exerciseName} -> ${patientName}`,
        metadata: { patientName, exerciseName }
    });
};
