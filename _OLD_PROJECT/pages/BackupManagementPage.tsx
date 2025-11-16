/**
 * 🔄 BACKUP MANAGEMENT PAGE - DUDUFISIO-AI
 *
 * Página administrativa para gerenciamento completo do sistema de backup.
 * Integra com o BackupDashboard e fornece controles avançados.
 */

import React, { useState } from 'react';
import PageHeader from '../components/PageHeader';
import PermissionGuard, { IfPermission } from '../components/auth/PermissionGuard';
import BackupDashboard from '../components/backup/BackupDashboard';
import useBackup from '../hooks/useBackup';
import { auditService } from '../services/auditService';
import {
  Shield, AlertTriangle, Info, CheckCircle2,
  Clock, Settings, Database, Cloud
} from 'lucide-react';
import type { BackupMetadata, BackupConfig } from '../services/backup/backupService';

const BackupManagementPage: React.FC = () => {
  const {
    config,
    stats,
    isBackupRunning,
    lastBackupDate,
    successRate,
    error,
    isLoading
  } = useBackup(true);

  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);

  const handleBackupCreated = async (backup: BackupMetadata) => {
    // Log da criação de backup
    await auditService.createLog({
      user: 'Admin',
      action: 'BACKUP_CREATED' as any,
      details: `Backup ${backup.type} criado manualmente via interface administrativa`,
      resourceId: backup.id,
      resourceType: 'backup'
    });

    
  };

  const handleConfigChanged = async (newConfig: BackupConfig) => {
    // Log da alteração de configuração
    await auditService.createLog({
      user: 'Admin',
      action: 'UPDATE' as any,
      details: 'Configuração de backup alterada via interface administrativa',
      resourceType: 'backup-config'
    });

    
  };

  const getSystemHealthStatus = () => {
    if (isLoading) return 'loading';
    if (error) return 'error';
    if (!config?.enabled) return 'disabled';
    if (successRate < 80) return 'warning';
    return 'healthy';
  };

  const getHealthStatusIcon = () => {
    const status = getSystemHealthStatus();
    switch (status) {
      case 'healthy':
        return <CheckCircle2 className="w-5 h-5 text-success" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-warning" />;
      case 'error':
        return <AlertTriangle className="w-5 h-5 text-error" />;
      case 'disabled':
        return <Shield className="w-5 h-5 text-neutral-textTertiary" />;
      default:
        return <Clock className="w-5 h-5 text-primary" />;
    }
  };

  const getHealthStatusText = () => {
    const status = getSystemHealthStatus();
    switch (status) {
      case 'healthy':
        return 'Sistema funcionando normalmente';
      case 'warning':
        return 'Sistema com alguns problemas';
      case 'error':
        return 'Sistema com problemas críticos';
      case 'disabled':
        return 'Sistema de backup desabilitado';
      default:
        return 'Verificando status do sistema...';
    }
  };

  const getHealthStatusColor = () => {
    const status = getSystemHealthStatus();
    switch (status) {
      case 'healthy':
        return 'bg-success-light border-success text-success';
      case 'warning':
        return 'bg-warning-light border-yellow-200 text-yellow-800';
      case 'error':
        return 'bg-error-light border-error text-error';
      case 'disabled':
        return 'bg-neutral-bgAlt border-neutral-border text-gray-800';
      default:
        return 'bg-primary-light border-primary text-blue-800';
    }
  };

  return (
    <PermissionGuard permission="system:admin">
      <div className="p-lg max-w-7xl mx-auto space-y-xl">
        <PageHeader
          title="Gerenciamento de Backup"
          subtitle="Administração completa do sistema de backup automatizado"
        />

        {/* System Health Alert */}
        <div className={`rounded-lg border p-md ${getHealthStatusColor()}`}>
          <div className="flex items-start gap-md">
            {getHealthStatusIcon()}
            <div className="flex-1">
              <h3 className="font-semibold">Status do Sistema de Backup</h3>
              <p className="text-sm mt-xs">{getHealthStatusText()}</p>

              {stats && (
                <div className="mt-sm grid grid-cols-1 md:grid-cols-3 gap-md text-sm">
                  <div>
                    <span className="font-medium">Última execução: </span>
                    {lastBackupDate ? (
                      <span>{lastBackupDate.toLocaleString('pt-BR')}</span>
                    ) : (
                      <span className="text-gray-500">Nunca</span>
                    )}
                  </div>
                  <div>
                    <span className="font-medium">Taxa de sucesso: </span>
                    <span className={successRate >= 90 ? 'text-success' : successRate >= 70 ? 'text-yellow-700' : 'text-error'}>
                      {successRate.toFixed(1)}%
                    </span>
                  </div>
                  <div>
                    <span className="font-medium">Status atual: </span>
                    {isBackupRunning ? (
                      <span className="text-primary">Backup em execução</span>
                    ) : (
                      <span className="text-success">Sistema disponível</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-error-light border border-error rounded-lg p-md">
            <div className="flex items-start gap-md">
              <AlertTriangle className="w-5 h-5 text-error mt-0.5" />
              <div>
                <h3 className="font-semibold text-error">Erro no Sistema de Backup</h3>
                <p className="text-sm text-error mt-xs">{error}</p>
                <p className="text-xs text-error mt-sm">
                  Verifique as configurações e tente novamente. Se o problema persistir, contate o suporte técnico.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Quick Stats */}
        {config && stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-md">
            <div className="bg-white rounded-lg shadow-card border border-neutral-border p-md">
              <div className="flex items-center gap-md">
                <div className={`p-sm rounded-lg ${config.enabled ? 'bg-success-light' : 'bg-error-light'}`}>
                  <Shield className={`w-5 h-5 ${config.enabled ? 'text-success' : 'text-error'}`} />
                </div>
                <div>
                  <p className="text-sm font-medium text-neutral-textSecondary">Sistema</p>
                  <p className={`text-lg font-bold ${config.enabled ? 'text-success' : 'text-error'}`}>
                    {config.enabled ? 'Ativo' : 'Inativo'}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-card border border-neutral-border p-md">
              <div className="flex items-center gap-md">
                <div className="p-sm bg-primary-light rounded-lg">
                  <Database className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-neutral-textSecondary">Total Backups</p>
                  <p className="text-lg font-bold text-neutral-text">{stats.totalBackups}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-card border border-neutral-border p-md">
              <div className="flex items-center gap-md">
                <div className="p-sm bg-purple-100 rounded-lg">
                  <Cloud className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-neutral-textSecondary">Destinos Ativos</p>
                  <p className="text-lg font-bold text-neutral-text">
                    {config.destinations.filter(d => d.enabled).length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-card border border-neutral-border p-md">
              <div className="flex items-center gap-md">
                <div className="p-sm bg-warning-light rounded-lg">
                  <Settings className="w-5 h-5 text-warning" />
                </div>
                <div>
                  <p className="text-sm font-medium text-neutral-textSecondary">Falhas Recentes</p>
                  <p className={`text-lg font-bold ${stats.failedBackups > 0 ? 'text-error' : 'text-success'}`}>
                    {stats.failedBackups}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Security and Compliance Info */}
        <div className="bg-white rounded-lg shadow-card border border-neutral-border p-lg">
          <div className="flex items-start gap-md">
            <div className="p-md bg-primary-light rounded-lg">
              <Info className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-neutral-text mb-sm">Segurança e Conformidade</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-lg text-sm">
                <div>
                  <h4 className="font-medium text-neutral-text mb-sm">Proteção de Dados</h4>
                  <ul className="space-y-1 text-neutral-textSecondary">
                    <li className="flex items-center gap-sm">
                      <CheckCircle2 className="w-4 h-4 text-success" />
                      Criptografia AES-256-GCM em todos os backups
                    </li>
                    <li className="flex items-center gap-sm">
                      <CheckCircle2 className="w-4 h-4 text-success" />
                      Verificação de integridade com checksum SHA-256
                    </li>
                    <li className="flex items-center gap-sm">
                      <CheckCircle2 className="w-4 h-4 text-success" />
                      Compressão segura para otimização de espaço
                    </li>
                    <li className="flex items-center gap-sm">
                      <CheckCircle2 className="w-4 h-4 text-success" />
                      Auditoria completa de todas as operações
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium text-neutral-text mb-sm">Conformidade LGPD</h4>
                  <ul className="space-y-1 text-neutral-textSecondary">
                    <li className="flex items-center gap-sm">
                      <CheckCircle2 className="w-4 h-4 text-success" />
                      Dados armazenados apenas no Brasil (Supabase São Paulo)
                    </li>
                    <li className="flex items-center gap-sm">
                      <CheckCircle2 className="w-4 h-4 text-success" />
                      Retenção automática conforme política definida
                    </li>
                    <li className="flex items-center gap-sm">
                      <CheckCircle2 className="w-4 h-4 text-success" />
                      Log completo de acesso e manipulação de dados
                    </li>
                    <li className="flex items-center gap-sm">
                      <CheckCircle2 className="w-4 h-4 text-success" />
                      Possibilidade de exclusão completa de dados (direito ao esquecimento)
                    </li>
                  </ul>
                </div>
              </div>

              <div className="mt-md p-md bg-primary-light rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Importante:</strong> Todos os backups seguem as melhores práticas de segurança e estão
                  em conformidade com a LGPD. Os dados são mantidos seguros e acessíveis apenas para usuários autorizados.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Advanced Settings Toggle */}
        <IfPermission permission="system:admin:advanced">
          <div className="bg-white rounded-lg shadow-card border border-neutral-border p-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-neutral-text">Configurações Avançadas</h3>
                <p className="text-sm text-neutral-textSecondary mt-xs">
                  Acesso a configurações avançadas do sistema de backup
                </p>
              </div>
              <button
                onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
                className="flex items-center gap-sm px-md py-sm border border-gray-300 rounded-lg hover:bg-neutral-bgAlt transition-colors"
              >
                <Settings className="w-4 h-4" />
                {showAdvancedSettings ? 'Ocultar' : 'Mostrar'} Configurações
              </button>
            </div>

            {showAdvancedSettings && (
              <div className="mt-xl p-md bg-warning-light border border-yellow-200 rounded-lg">
                <div className="flex items-start gap-md">
                  <AlertTriangle className="w-5 h-5 text-warning mt-0.5" />
                  <div>
                    <h4 className="font-medium text-yellow-800">Atenção: Configurações Avançadas</h4>
                    <p className="text-sm text-yellow-700 mt-xs">
                      As configurações avançadas podem afetar significativamente o comportamento do sistema de backup.
                      Altere apenas se souber exatamente o que está fazendo. Recomendamos fazer backup antes de alterar configurações críticas.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </IfPermission>

        {/* Main Backup Dashboard */}
        <BackupDashboard
          onBackupCreated={handleBackupCreated}
          onConfigChanged={handleConfigChanged}
        />
      </div>
    </PermissionGuard>
  );
};

export default BackupManagementPage;