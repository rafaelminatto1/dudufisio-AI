import { createServerComponentClient } from '~/lib/supabase/server';
import { BackupService } from './backupService';
import { NotificationService } from '../communications/notificationService';

export interface BackupAlert {
  id: string;
  type: 'warning' | 'error' | 'info' | 'success';
  title: string;
  message: string;
  timestamp: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  resolved: boolean;
}

export interface BackupHealthMetrics {
  overallHealth: 'healthy' | 'warning' | 'critical';
  lastBackupAge: number; // horas
  successRate: number; // 0-100
  averageBackupTime: number; // ms
  storageUsage: number; // 0-100 percentage
  failureStreak: number; // consecutive failures
  uptime: number; // percentage
  issues: string[];
  recommendations: string[];
}

/**
 * Service para monitorar saúde e performance do sistema de backup
 * Adaptado para Next.js App Router
 */
export class BackupMonitorService {
  /**
   * Verifica saúde do sistema de backup
   */
  static async checkBackupHealth(): Promise<{
    data: BackupHealthMetrics | null;
    error: any;
  }> {
    try {
      const { data: stats, error: statsError } = await BackupService.getBackupStats();
      if (statsError || !stats) {
        throw new Error('Failed to fetch backup stats');
      }

      const backupsResult = await BackupService.listBackups(10);
      const recentBackups = backupsResult?.data || [];

      const lastBackup = recentBackups[0];
      const lastBackupAge = lastBackup
        ? (Date.now() - new Date(lastBackup.timestamp).getTime()) / (1000 * 60 * 60)
        : Infinity;

      const failureStreak = this.calculateFailureStreak(recentBackups);
      const issues: string[] = [];
      const recommendations: string[] = [];

      // Verificar problemas
      if (lastBackupAge > 24) {
        issues.push('Último backup há mais de 24 horas');
        recommendations.push('Executar backup manual imediatamente');
      }

      if (stats.successRate < 90) {
        issues.push(`Taxa de sucesso baixa: ${stats.successRate}%`);
        recommendations.push('Revisar configuração de backup');
      }

      if (failureStreak >= 3) {
        issues.push(`${failureStreak} backups falharam consecutivamente`);
        recommendations.push('Investigar causa das falhas');
      }

      let overallHealth: 'healthy' | 'warning' | 'critical' = 'healthy';
      if (issues.length > 0) {
        overallHealth = failureStreak >= 3 || lastBackupAge > 48 ? 'critical' : 'warning';
      }

      const metrics: BackupHealthMetrics = {
        overallHealth,
        lastBackupAge: Math.round(lastBackupAge * 100) / 100,
        successRate: stats.successRate,
        averageBackupTime: stats.avgBackupTime,
        storageUsage: 0, // Seria calculado baseado no storage real
        failureStreak,
        uptime: stats.successRate,
        issues,
        recommendations,
      };

      return { data: metrics, error: null };
    } catch (error) {
      console.error('Error checking backup health:', error);
      return { data: null, error };
    }
  }

  /**
   * Calcula sequência de falhas
   */
  private static calculateFailureStreak(backups: any[]): number {
    let streak = 0;
    for (const backup of backups) {
      if (backup.status === 'failed') {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  }

  /**
   * Gera alertas baseados na saúde do backup
   */
  static async generateAlerts(): Promise<{ data: BackupAlert[]; error: any }> {
    try {
      const { data: health, error: healthError } = await this.checkBackupHealth();
      if (healthError || !health) {
        throw new Error('Failed to check backup health');
      }

      const alerts: BackupAlert[] = [];

      if (health.overallHealth === 'critical') {
        alerts.push({
          id: `alert-${Date.now()}`,
          type: 'error',
          title: 'Sistema de Backup Crítico',
          message: `Múltiplos problemas detectados: ${health.issues.join(', ')}`,
          timestamp: new Date().toISOString(),
          severity: 'critical',
          resolved: false,
        });
      } else if (health.overallHealth === 'warning') {
        alerts.push({
          id: `alert-${Date.now()}`,
          type: 'warning',
          title: 'Atenção: Sistema de Backup',
          message: health.issues.join('; '),
          timestamp: new Date().toISOString(),
          severity: 'medium',
          resolved: false,
        });
      }

      if (health.lastBackupAge > 12) {
        alerts.push({
          id: `alert-age-${Date.now()}`,
          type: 'warning',
          title: 'Backup Atrasado',
          message: `Último backup há ${Math.round(health.lastBackupAge)} horas`,
          timestamp: new Date().toISOString(),
          severity: 'medium',
          resolved: false,
        });
      }

      return { data: alerts, error: null };
    } catch (error) {
      console.error('Error generating alerts:', error);
      return { data: [], error };
    }
  }

  /**
   * Envia notificações de alerta
   */
  static async sendAlertNotifications(userId: string) {
    try {
      const alertsResult = await this.generateAlerts();
      for (const alert of alertsResult?.data || []) {
        await NotificationService.create({
          userId,
          title: alert.title,
          message: alert.message,
          type: 'system',
          icon: alert.type === 'error' ? '⚠️' : 'ℹ️',
        });
      }

      return { data: true, error: null };
    } catch (error) {
      console.error('Error sending alert notifications:', error);
      return { data: false, error };
    }
  }
}

