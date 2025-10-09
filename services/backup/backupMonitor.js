/**
 * 🔍 BACKUP MONITOR - DUDUFISIO-AI
 *
 * Sistema de monitoramento e alertas para o sistema de backup.
 * Monitora saúde, performance e gera alertas automáticos.
 */
import { backupService } from './backupService';
import { enhancedNotificationService } from '../notificationService';
import { auditService } from '../auditService';
class BackupMonitorService {
    constructor() {
        this.alerts = [];
        this.isMonitoring = false;
        this.monitorTimer = null;
        this.healthHistory = [];
        this.config = this.getDefaultConfig();
        this.loadAlerts();
        this.startMonitoring();
    }
    static getInstance() {
        if (!BackupMonitorService.instance) {
            BackupMonitorService.instance = new BackupMonitorService();
        }
        return BackupMonitorService.instance;
    }
    /**
     * 🔧 CONFIGURAÇÃO DO MONITOR
     */
    getDefaultConfig() {
        return {
            enabled: true,
            checkInterval: 15, // 15 minutos
            alertThresholds: {
                maxBackupAge: 24, // 24 horas
                minSuccessRate: 85, // 85%
                maxBackupTime: 10 * 60 * 1000, // 10 minutos
                maxStorageUsage: 90, // 90%
                maxFailureStreak: 3 // 3 falhas consecutivas
            },
            notifications: {
                email: true,
                push: true,
                inApp: true,
                critical: true
            }
        };
    }
    getConfig() {
        return { ...this.config };
    }
    async updateConfig(newConfig) {
        try {
            this.config = { ...this.config, ...newConfig };
            localStorage.setItem('backup-monitor-config', JSON.stringify(this.config));
            if (newConfig.enabled !== undefined || newConfig.checkInterval) {
                this.restartMonitoring();
            }
            await auditService.createLog({
                user: 'System',
                action: 'BACKUP_MONITOR_CONFIG_UPDATE',
                details: 'Configuração do monitor de backup atualizada',
                resourceType: 'backup-monitor'
            });
            return true;
        }
        catch (error) {
            console.error('❌ Erro ao atualizar configuração do monitor:', error);
            return false;
        }
    }
    /**
     * 🔍 MONITORAMENTO PRINCIPAL
     */
    startMonitoring() {
        if (!this.config.enabled || this.isMonitoring) {
            return;
        }
        this.isMonitoring = true;
        console.log('🔍 Monitor de backup iniciado');
        // Primeira verificação imediata
        this.performHealthCheck();
        // Configurar verificações periódicas
        this.monitorTimer = setInterval(() => {
            this.performHealthCheck();
        }, this.config.checkInterval * 60 * 1000);
    }
    stopMonitoring() {
        if (this.monitorTimer) {
            clearInterval(this.monitorTimer);
            this.monitorTimer = null;
        }
        this.isMonitoring = false;
        console.log('⏹️ Monitor de backup parado');
    }
    restartMonitoring() {
        this.stopMonitoring();
        if (this.config.enabled) {
            this.startMonitoring();
        }
    }
    /**
     * 🏥 VERIFICAÇÃO DE SAÚDE
     */
    async performHealthCheck() {
        try {
            console.log('🔍 Executando verificação de saúde do backup...');
            const stats = backupService.getBackupStats();
            const config = backupService.getConfig();
            const history = backupService.getBackupHistory();
            const health = this.calculateHealthMetrics(stats, history);
            this.healthHistory.push(health);
            // Manter apenas os últimos 100 registros
            if (this.healthHistory.length > 100) {
                this.healthHistory = this.healthHistory.slice(-100);
            }
            // Verificar problemas e gerar alertas
            await this.checkForIssues(health, stats, config);
            // Auto-resolver alertas quando aplicável
            await this.autoResolveAlerts(health);
            console.log(`✅ Verificação concluída - Status: ${health.overallHealth}`);
        }
        catch (error) {
            console.error('❌ Erro na verificação de saúde:', error);
            await this.createAlert({
                type: 'error',
                title: 'Erro no Monitor de Backup',
                message: 'Falha ao executar verificação de saúde do sistema de backup',
                severity: 'medium',
                autoResolve: false
            });
        }
    }
    calculateHealthMetrics(stats, history) {
        const now = new Date();
        const lastBackup = history
            .filter(b => b.status === 'completed')
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
        const lastBackupAge = lastBackup ?
            (now.getTime() - new Date(lastBackup.timestamp).getTime()) / (1000 * 60 * 60) : // horas
            Infinity;
        // Calcular streak de falhas
        const recentBackups = history
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            .slice(0, 10);
        let failureStreak = 0;
        for (const backup of recentBackups) {
            if (backup.status === 'failed') {
                failureStreak++;
            }
            else if (backup.status === 'completed') {
                break;
            }
        }
        // Calcular uso de armazenamento médio
        const avgStorageUsage = stats.storageUsage.length > 0 ?
            stats.storageUsage.reduce((sum, storage) => sum + storage.percentage, 0) / stats.storageUsage.length :
            0;
        // Determinar saúde geral
        let overallHealth = 'healthy';
        const issues = [];
        const recommendations = [];
        // Verificar idade do último backup
        if (lastBackupAge > this.config.alertThresholds.maxBackupAge) {
            overallHealth = 'critical';
            issues.push(`Último backup há ${lastBackupAge.toFixed(1)} horas`);
            recommendations.push('Execute um backup manual imediatamente');
        }
        // Verificar taxa de sucesso
        if (stats.successRate < this.config.alertThresholds.minSuccessRate) {
            if (overallHealth !== 'critical')
                overallHealth = 'warning';
            issues.push(`Taxa de sucesso baixa: ${stats.successRate.toFixed(1)}%`);
            recommendations.push('Verifique as configurações de backup e destinos');
        }
        // Verificar streak de falhas
        if (failureStreak >= this.config.alertThresholds.maxFailureStreak) {
            overallHealth = 'critical';
            issues.push(`${failureStreak} falhas consecutivas`);
            recommendations.push('Investigue as causas das falhas e corrija os problemas');
        }
        // Verificar uso de armazenamento
        if (avgStorageUsage > this.config.alertThresholds.maxStorageUsage) {
            if (overallHealth !== 'critical')
                overallHealth = 'warning';
            issues.push(`Uso de armazenamento alto: ${avgStorageUsage.toFixed(1)}%`);
            recommendations.push('Limpe backups antigos ou adicione mais espaço de armazenamento');
        }
        // Verificar tempo médio de backup
        if (stats.avgBackupTime > this.config.alertThresholds.maxBackupTime) {
            if (overallHealth === 'healthy')
                overallHealth = 'warning';
            issues.push('Tempo de backup acima do esperado');
            recommendations.push('Otimize as configurações de compressão e destinos');
        }
        return {
            overallHealth,
            lastBackupAge,
            successRate: stats.successRate,
            averageBackupTime: stats.avgBackupTime,
            storageUsage: avgStorageUsage,
            failureStreak,
            uptime: this.calculateUptime(),
            issues,
            recommendations
        };
    }
    calculateUptime() {
        // Calcular uptime baseado no histórico de saúde
        if (this.healthHistory.length === 0)
            return 100;
        const healthyChecks = this.healthHistory.filter(h => h.overallHealth === 'healthy').length;
        return (healthyChecks / this.healthHistory.length) * 100;
    }
    /**
     * 🚨 SISTEMA DE ALERTAS
     */
    async checkForIssues(health, stats, config) {
        const { alertThresholds } = this.config;
        // Alerta: Backup muito antigo
        if (health.lastBackupAge > alertThresholds.maxBackupAge) {
            await this.createAlert({
                type: 'error',
                title: 'Backup Desatualizado',
                message: `O último backup foi executado há ${health.lastBackupAge.toFixed(1)} horas. Execute um backup imediatamente.`,
                severity: 'critical',
                autoResolve: true,
                actions: [
                    {
                        id: 'create-backup',
                        label: 'Criar Backup Agora',
                        action: async () => {
                            await backupService.createBackup('incremental', false);
                        }
                    }
                ]
            });
        }
        // Alerta: Taxa de sucesso baixa
        if (health.successRate < alertThresholds.minSuccessRate) {
            await this.createAlert({
                type: 'warning',
                title: 'Taxa de Sucesso Baixa',
                message: `A taxa de sucesso dos backups está em ${health.successRate.toFixed(1)}%. Verifique as configurações.`,
                severity: 'medium',
                autoResolve: true
            });
        }
        // Alerta: Falhas consecutivas
        if (health.failureStreak >= alertThresholds.maxFailureStreak) {
            await this.createAlert({
                type: 'error',
                title: 'Múltiplas Falhas Consecutivas',
                message: `${health.failureStreak} backups falharam consecutivamente. Ação imediata necessária.`,
                severity: 'critical',
                autoResolve: true
            });
        }
        // Alerta: Uso de armazenamento alto
        if (health.storageUsage > alertThresholds.maxStorageUsage) {
            await this.createAlert({
                type: 'warning',
                title: 'Armazenamento Quase Cheio',
                message: `O armazenamento está ${health.storageUsage.toFixed(1)}% cheio. Considere limpar backups antigos.`,
                severity: 'medium',
                autoResolve: true,
                actions: [
                    {
                        id: 'cleanup-old-backups',
                        label: 'Limpar Backups Antigos',
                        action: async () => {
                            // Implementar limpeza manual se necessário
                            console.log('🧹 Iniciando limpeza manual de backups antigos...');
                        }
                    }
                ]
            });
        }
        // Alerta: Sistema desabilitado
        if (!config.enabled) {
            await this.createAlert({
                type: 'warning',
                title: 'Sistema de Backup Desabilitado',
                message: 'O sistema de backup automático está desabilitado. Seus dados não estão sendo protegidos.',
                severity: 'high',
                autoResolve: false
            });
        }
    }
    async createAlert(alertData) {
        const alert = {
            id: this.generateAlertId(),
            timestamp: new Date().toISOString(),
            resolved: false,
            ...alertData
        };
        // Verificar se já existe alerta similar não resolvido
        const existingSimilar = this.alerts.find(a => !a.resolved &&
            a.title === alert.title &&
            a.type === alert.type);
        if (existingSimilar) {
            console.log(`⚠️ Alerta similar já existe: ${alert.title}`);
            return;
        }
        this.alerts.push(alert);
        this.saveAlerts();
        console.log(`🚨 Novo alerta criado: ${alert.title} (${alert.severity})`);
        // Enviar notificações
        await this.sendAlertNotifications(alert);
        // Log de auditoria
        await auditService.createLog({
            user: 'System',
            action: 'BACKUP_ALERT_CREATED',
            details: `Alerta de backup criado: ${alert.title}`,
            resourceId: alert.id,
            resourceType: 'backup-alert'
        });
    }
    async sendAlertNotifications(alert) {
        const { notifications } = this.config;
        // Sempre notificar para alertas críticos
        const shouldNotify = notifications.critical || alert.severity !== 'critical';
        if (!shouldNotify)
            return;
        // Notificação in-app
        if (notifications.inApp) {
            enhancedNotificationService.sendInAppNotification('system', {
                title: `🚨 ${alert.title}`,
                body: alert.message,
                data: {
                    type: 'backup-alert',
                    alertId: alert.id,
                    severity: alert.severity
                }
            });
        }
        // Notificação push
        if (notifications.push) {
            enhancedNotificationService.sendPushNotification('system', {
                title: `🚨 Alerta de Backup: ${alert.title}`,
                body: alert.message,
                icon: '/icon-192x192.png',
                badge: '/badge-72x72.png',
                data: {
                    type: 'backup-alert',
                    alertId: alert.id,
                    severity: alert.severity,
                    actionUrl: '/admin/backup'
                },
                actions: [
                    {
                        action: 'view',
                        title: 'Ver Detalhes',
                        icon: '/icon-view.png'
                    },
                    {
                        action: 'dismiss',
                        title: 'Dispensar',
                        icon: '/icon-close.png'
                    }
                ],
                requireInteraction: alert.severity === 'critical',
                tag: `backup-alert-${alert.severity}`
            });
        }
    }
    async autoResolveAlerts(health) {
        const alertsToResolve = this.alerts.filter(alert => !alert.resolved && alert.autoResolve);
        for (const alert of alertsToResolve) {
            let shouldResolve = false;
            // Verificar condições de auto-resolução baseadas no tipo de alerta
            if (alert.title.includes('Backup Desatualizado') && health.lastBackupAge <= this.config.alertThresholds.maxBackupAge) {
                shouldResolve = true;
            }
            else if (alert.title.includes('Taxa de Sucesso Baixa') && health.successRate >= this.config.alertThresholds.minSuccessRate) {
                shouldResolve = true;
            }
            else if (alert.title.includes('Falhas Consecutivas') && health.failureStreak < this.config.alertThresholds.maxFailureStreak) {
                shouldResolve = true;
            }
            else if (alert.title.includes('Armazenamento') && health.storageUsage <= this.config.alertThresholds.maxStorageUsage) {
                shouldResolve = true;
            }
            if (shouldResolve) {
                alert.resolved = true;
                console.log(`✅ Alerta auto-resolvido: ${alert.title}`);
                await auditService.createLog({
                    user: 'System',
                    action: 'BACKUP_ALERT_RESOLVED',
                    details: `Alerta de backup auto-resolvido: ${alert.title}`,
                    resourceId: alert.id,
                    resourceType: 'backup-alert'
                });
            }
        }
        this.saveAlerts();
    }
    /**
     * 📊 MÉTODOS PÚBLICOS
     */
    getCurrentHealth() {
        return this.healthHistory.length > 0 ?
            this.healthHistory[this.healthHistory.length - 1] :
            null;
    }
    getHealthHistory(days = 7) {
        const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
        return this.healthHistory.filter(h => new Date(h.issues.length > 0 ? Date.now() : Date.now()) >= cutoffDate);
    }
    getActiveAlerts() {
        return this.alerts.filter(alert => !alert.resolved);
    }
    getAllAlerts(limit = 50) {
        return this.alerts
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            .slice(0, limit);
    }
    async resolveAlert(alertId) {
        const alert = this.alerts.find(a => a.id === alertId);
        if (!alert || alert.resolved) {
            return false;
        }
        alert.resolved = true;
        this.saveAlerts();
        await auditService.createLog({
            user: 'Manual',
            action: 'BACKUP_ALERT_RESOLVED_MANUAL',
            details: `Alerta de backup resolvido manualmente: ${alert.title}`,
            resourceId: alert.id,
            resourceType: 'backup-alert'
        });
        console.log(`✅ Alerta resolvido manualmente: ${alert.title}`);
        return true;
    }
    async executeAlertAction(alertId, actionId) {
        const alert = this.alerts.find(a => a.id === alertId);
        if (!alert || !alert.actions) {
            return false;
        }
        const action = alert.actions.find(a => a.id === actionId);
        if (!action) {
            return false;
        }
        try {
            await action.action();
            await auditService.createLog({
                user: 'Manual',
                action: 'BACKUP_ALERT_ACTION_EXECUTED',
                details: `Ação de alerta executada: ${action.label} para ${alert.title}`,
                resourceId: alert.id,
                resourceType: 'backup-alert'
            });
            console.log(`⚡ Ação de alerta executada: ${action.label}`);
            return true;
        }
        catch (error) {
            console.error('❌ Erro ao executar ação de alerta:', error);
            return false;
        }
    }
    isMonitoringActive() {
        return this.isMonitoring;
    }
    async runHealthCheckNow() {
        await this.performHealthCheck();
        return this.getCurrentHealth();
    }
    /**
     * 🛠️ UTILITÁRIOS
     */
    generateAlertId() {
        return `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    loadAlerts() {
        try {
            const stored = localStorage.getItem('backup-alerts');
            this.alerts = stored ? JSON.parse(stored) : [];
        }
        catch (error) {
            console.error('❌ Erro ao carregar alertas:', error);
            this.alerts = [];
        }
    }
    saveAlerts() {
        try {
            localStorage.setItem('backup-alerts', JSON.stringify(this.alerts));
        }
        catch (error) {
            console.error('❌ Erro ao salvar alertas:', error);
        }
    }
    destroy() {
        this.stopMonitoring();
        console.log('🔍 Monitor de backup destruído');
    }
}
// Instância singleton
export const backupMonitor = BackupMonitorService.getInstance();
export default backupMonitor;
