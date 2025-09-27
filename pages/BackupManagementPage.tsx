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
      action: 'BACKUP_CREATED_MANUAL',
      details: `Backup ${backup.type} criado manualmente via interface administrativa`,
      resourceId: backup.id,
      resourceType: 'backup'
    });

    console.log('✅ Backup criado via interface administrativa:', backup);
  };

  const handleConfigChanged = async (newConfig: BackupConfig) => {
    // Log da alteração de configuração
    await auditService.createLog({
      user: 'Admin',
      action: 'BACKUP_CONFIG_CHANGED',
      details: 'Configuração de backup alterada via interface administrativa',
      resourceType: 'backup-config'
    });

    console.log('⚙️ Configuração de backup alterada:', newConfig);
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
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case 'error':
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
      case 'disabled':
        return <Shield className="w-5 h-5 text-gray-400" />;
      default:
        return <Clock className="w-5 h-5 text-blue-600" />;
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
        return 'bg-green-50 border-green-200 text-green-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'disabled':
        return 'bg-gray-50 border-gray-200 text-gray-800';
      default:
        return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  return (
    <PermissionGuard permission="system:admin">
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <PageHeader
          title="Gerenciamento de Backup"
          subtitle="Administração completa do sistema de backup automatizado"
        />

        {/* System Health Alert */}
        <div className={`rounded-lg border p-4 ${getHealthStatusColor()}`}>
          <div className="flex items-start gap-3">
            {getHealthStatusIcon()}
            <div className="flex-1">
              <h3 className="font-semibold">Status do Sistema de Backup</h3>
              <p className="text-sm mt-1">{getHealthStatusText()}</p>

              {stats && (
                <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
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
                    <span className={successRate >= 90 ? 'text-green-700' : successRate >= 70 ? 'text-yellow-700' : 'text-red-700'}>
                      {successRate.toFixed(1)}%
                    </span>
                  </div>
                  <div>
                    <span className="font-medium">Status atual: </span>
                    {isBackupRunning ? (
                      <span className="text-blue-700">Backup em execução</span>
                    ) : (
                      <span className="text-green-700">Sistema disponível</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-red-800">Erro no Sistema de Backup</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
                <p className="text-xs text-red-600 mt-2">
                  Verifique as configurações e tente novamente. Se o problema persistir, contate o suporte técnico.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Quick Stats */}
        {config && stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${config.enabled ? 'bg-green-100' : 'bg-red-100'}`}>
                  <Shield className={`w-5 h-5 ${config.enabled ? 'text-green-600' : 'text-red-600'}`} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Sistema</p>
                  <p className={`text-lg font-bold ${config.enabled ? 'text-green-600' : 'text-red-600'}`}>
                    {config.enabled ? 'Ativo' : 'Inativo'}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Database className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Backups</p>
                  <p className="text-lg font-bold text-gray-900">{stats.totalBackups}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Cloud className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Destinos Ativos</p>
                  <p className="text-lg font-bold text-gray-900">
                    {config.destinations.filter(d => d.enabled).length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Settings className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Falhas Recentes</p>
                  <p className={`text-lg font-bold ${stats.failedBackups > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {stats.failedBackups}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Security and Compliance Info */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Info className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Segurança e Conformidade</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Proteção de Dados</h4>
                  <ul className="space-y-1 text-gray-600">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                      Criptografia AES-256-GCM em todos os backups
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                      Verificação de integridade com checksum SHA-256
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                      Compressão segura para otimização de espaço
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                      Auditoria completa de todas as operações
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Conformidade LGPD</h4>
                  <ul className="space-y-1 text-gray-600">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                      Dados armazenados apenas no Brasil (Supabase São Paulo)
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                      Retenção automática conforme política definida
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                      Log completo de acesso e manipulação de dados
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                      Possibilidade de exclusão completa de dados (direito ao esquecimento)
                    </li>
                  </ul>
                </div>
              </div>

              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
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
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Configurações Avançadas</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Acesso a configurações avançadas do sistema de backup
                </p>
              </div>
              <button
                onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Settings className="w-4 h-4" />
                {showAdvancedSettings ? 'Ocultar' : 'Mostrar'} Configurações
              </button>
            </div>

            {showAdvancedSettings && (
              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-yellow-800">Atenção: Configurações Avançadas</h4>
                    <p className="text-sm text-yellow-700 mt-1">
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