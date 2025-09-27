/**
 * 🔄 BACKUP DASHBOARD - DUDUFISIO-AI
 *
 * Interface completa para gerenciamento do sistema de backup automatizado.
 * Permite configurar, monitorar e gerenciar backups de forma intuitiva.
 */

import React, { useState, useEffect } from 'react';
import {
  HardDrive, Clock, Settings, Shield, Download, Upload,
  AlertTriangle, CheckCircle2, Play, Pause, RotateCcw,
  Calendar, Database, Zap, Archive, Trash2, Eye,
  TrendingUp, Server, Cloud, Smartphone, RefreshCw
} from 'lucide-react';
import { backupService } from '../../services/backup/backupService';
import type {
  BackupConfig,
  BackupMetadata,
  BackupStats,
  RestoreOptions
} from '../../services/backup/backupService';

interface BackupDashboardProps {
  onBackupCreated?: (backup: BackupMetadata) => void;
  onConfigChanged?: (config: BackupConfig) => void;
}

const BackupDashboard: React.FC<BackupDashboardProps> = ({
  onBackupCreated,
  onConfigChanged
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'history' | 'settings' | 'restore'>('overview');
  const [config, setConfig] = useState<BackupConfig | null>(null);
  const [stats, setStats] = useState<BackupStats | null>(null);
  const [history, setHistory] = useState<BackupMetadata[]>([]);
  const [currentBackup, setCurrentBackup] = useState<BackupMetadata | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados para modais e ações
  const [showCreateBackup, setShowCreateBackup] = useState(false);
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [selectedBackup, setSelectedBackup] = useState<BackupMetadata | null>(null);
  const [isTestingSystem, setIsTestingSystem] = useState(false);

  useEffect(() => {
    loadDashboardData();

    // Atualizar dados a cada 30 segundos
    const interval = setInterval(loadDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      setError(null);

      const [currentConfig, currentStats, backupHistory, runningBackup] = await Promise.all([
        Promise.resolve(backupService.getConfig()),
        Promise.resolve(backupService.getBackupStats()),
        Promise.resolve(backupService.getBackupHistory()),
        Promise.resolve(backupService.getCurrentBackup())
      ]);

      setConfig(currentConfig);
      setStats(currentStats);
      setHistory(backupHistory);
      setCurrentBackup(runningBackup);

    } catch (err) {
      console.error('❌ Erro ao carregar dados do dashboard:', err);
      setError('Erro ao carregar dados do backup');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateBackup = async (type: 'full' | 'incremental') => {
    try {
      setError(null);
      const backup = await backupService.createBackup(type, false);

      if (backup) {
        onBackupCreated?.(backup);
        await loadDashboardData();
        setShowCreateBackup(false);
      }
    } catch (err) {
      console.error('❌ Erro ao criar backup:', err);
      setError('Erro ao criar backup');
    }
  };

  const handleTestSystem = async () => {
    try {
      setIsTestingSystem(true);
      setError(null);

      const success = await backupService.testBackupSystem();

      if (success) {
        alert('✅ Sistema de backup funcionando corretamente!');
      } else {
        alert('❌ Sistema de backup apresentou problemas. Verifique as configurações.');
      }

      await loadDashboardData();
    } catch (err) {
      console.error('❌ Erro no teste do sistema:', err);
      setError('Erro ao testar sistema de backup');
    } finally {
      setIsTestingSystem(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(2)} ${units[unitIndex]}`;
  };

  const formatDuration = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  };

  const getStatusIcon = (status: BackupMetadata['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-4 h-4 text-green-600" />;
      case 'running':
        return <RefreshCw className="w-4 h-4 text-blue-600 animate-spin" />;
      case 'failed':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: BackupMetadata['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'running':
        return 'bg-blue-100 text-blue-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="flex items-center gap-3">
          <RefreshCw className="w-6 h-6 animate-spin text-sky-600" />
          <span className="text-lg text-gray-600">Carregando sistema de backup...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-sky-100 rounded-lg">
              <HardDrive className="w-8 h-8 text-sky-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Sistema de Backup</h1>
              <p className="text-gray-600">Gerencie backups automáticos e restaurações</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleTestSystem}
              disabled={isTestingSystem}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
            >
              {isTestingSystem ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Zap className="w-4 h-4" />
              )}
              Testar Sistema
            </button>

            <button
              onClick={() => setShowCreateBackup(true)}
              className="flex items-center gap-2 px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors"
            >
              <Upload className="w-4 h-4" />
              Criar Backup
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <span className="text-red-800">{error}</span>
            </div>
          </div>
        )}
      </div>

      {/* Status Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <Archive className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total de Backups</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalBackups}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Database className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tamanho Total</p>
                <p className="text-2xl font-bold text-gray-900">{formatFileSize(stats.totalSize)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Taxa de Sucesso</p>
                <p className="text-2xl font-bold text-gray-900">{stats.successRate.toFixed(1)}%</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Último Backup</p>
                <p className="text-sm font-bold text-gray-900">
                  {stats.lastBackup ?
                    new Date(stats.lastBackup).toLocaleDateString('pt-BR') :
                    'Nunca'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Current Backup Status */}
      {currentBackup && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <RefreshCw className="w-6 h-6 text-blue-600 animate-spin" />
              <div>
                <h3 className="font-semibold text-gray-900">Backup em Andamento</h3>
                <p className="text-gray-600">
                  {currentBackup.type === 'full' ? 'Backup Completo' : 'Backup Incremental'} - {currentBackup.id}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Iniciado em</p>
              <p className="font-medium">{new Date(currentBackup.timestamp).toLocaleString('pt-BR')}</p>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'overview', label: 'Visão Geral', icon: TrendingUp },
              { id: 'history', label: 'Histórico', icon: Calendar },
              { id: 'settings', label: 'Configurações', icon: Settings },
              { id: 'restore', label: 'Restauração', icon: RotateCcw }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-sky-500 text-sky-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Storage Usage */}
              {stats?.storageUsage && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Uso de Armazenamento</h3>
                  <div className="space-y-4">
                    {stats.storageUsage.map((usage, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-gray-900">{usage.destination}</span>
                          <span className="text-sm text-gray-600">
                            {formatFileSize(usage.used)} / {formatFileSize(usage.available)}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-sky-600 h-2 rounded-full"
                            style={{ width: `${Math.min(usage.percentage, 100)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent Activity */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Atividade Recente</h3>
                <div className="space-y-3">
                  {history.slice(0, 5).map((backup) => (
                    <div key={backup.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(backup.status)}
                        <div>
                          <p className="font-medium text-gray-900">
                            {backup.type === 'full' ? 'Backup Completo' : 'Backup Incremental'}
                          </p>
                          <p className="text-sm text-gray-600">
                            {new Date(backup.timestamp).toLocaleString('pt-BR')}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">{formatFileSize(backup.size)}</p>
                        {backup.duration && (
                          <p className="text-xs text-gray-500">{formatDuration(backup.duration)}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* History Tab */}
          {activeTab === 'history' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Histórico de Backups</h3>
                <button
                  onClick={loadDashboardData}
                  className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  <RefreshCw className="w-4 h-4" />
                  Atualizar
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tipo
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Data/Hora
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tamanho
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Duração
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {history.map((backup) => (
                      <tr key={backup.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(backup.status)}`}>
                            {getStatusIcon(backup.status)}
                            {backup.status === 'completed' ? 'Concluído' :
                             backup.status === 'running' ? 'Executando' :
                             backup.status === 'failed' ? 'Falhou' : 'Pendente'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {backup.type === 'full' ? 'Completo' : 'Incremental'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(backup.timestamp).toLocaleString('pt-BR')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatFileSize(backup.size)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {backup.duration ? formatDuration(backup.duration) : '—'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => {
                                setSelectedBackup(backup);
                                setShowRestoreModal(true);
                              }}
                              disabled={backup.status !== 'completed'}
                              className="text-sky-600 hover:text-sky-900 disabled:text-gray-400 disabled:cursor-not-allowed"
                              title="Restaurar"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                            <button
                              className="text-gray-600 hover:text-gray-900"
                              title="Detalhes"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              className="text-red-600 hover:text-red-900"
                              title="Excluir"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && config && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Configurações de Backup</h3>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-yellow-800">Configurações Avançadas</h4>
                    <p className="text-sm text-yellow-700 mt-1">
                      As configurações de backup são gerenciadas automaticamente pelo sistema.
                      Alterações podem afetar a segurança e integridade dos dados.
                    </p>
                  </div>
                </div>
              </div>

              {/* Status do Sistema */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Status do Sistema</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Backup Automático</span>
                      <span className={`text-sm font-medium ${config.enabled ? 'text-green-600' : 'text-red-600'}`}>
                        {config.enabled ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Criptografia</span>
                      <span className={`text-sm font-medium ${config.encryption.enabled ? 'text-green-600' : 'text-red-600'}`}>
                        {config.encryption.enabled ? 'Habilitada' : 'Desabilitada'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Compressão</span>
                      <span className={`text-sm font-medium ${config.compression.enabled ? 'text-green-600' : 'text-red-600'}`}>
                        {config.compression.enabled ? 'Habilitada' : 'Desabilitada'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Retenção de Dados</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Backups Diários</span>
                      <span className="text-sm font-medium text-gray-900">{config.retention.daily} dias</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Backups Semanais</span>
                      <span className="text-sm font-medium text-gray-900">{config.retention.weekly} semanas</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Backups Mensais</span>
                      <span className="text-sm font-medium text-gray-900">{config.retention.monthly} meses</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Destinos de Backup */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Destinos de Backup</h4>
                <div className="space-y-3">
                  {config.destinations.map((destination, index) => (
                    <div key={destination.id} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {destination.type === 'local' ? (
                            <HardDrive className="w-5 h-5 text-gray-600" />
                          ) : destination.type === 'supabase' ? (
                            <Cloud className="w-5 h-5 text-blue-600" />
                          ) : (
                            <Server className="w-5 h-5 text-purple-600" />
                          )}
                          <div>
                            <p className="font-medium text-gray-900">{destination.name}</p>
                            <p className="text-sm text-gray-600">Prioridade: {destination.priority}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-medium ${destination.enabled ? 'text-green-600' : 'text-red-600'}`}>
                            {destination.enabled ? 'Ativo' : 'Inativo'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Restore Tab */}
          {activeTab === 'restore' && (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-800">Atenção: Restauração de Dados</h4>
                    <p className="text-sm text-blue-700 mt-1">
                      A restauração pode sobrescrever dados existentes. Sempre faça um backup antes de restaurar.
                      Recomendamos testar a restauração em um ambiente de teste primeiro.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Backups Disponíveis para Restauração</h3>

                <div className="space-y-3">
                  {history
                    .filter(backup => backup.status === 'completed')
                    .slice(0, 10)
                    .map((backup) => (
                      <div key={backup.id} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="p-2 bg-white rounded">
                              {backup.type === 'full' ? (
                                <Database className="w-5 h-5 text-blue-600" />
                              ) : (
                                <Archive className="w-5 h-5 text-green-600" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">
                                {backup.type === 'full' ? 'Backup Completo' : 'Backup Incremental'}
                              </p>
                              <p className="text-sm text-gray-600">
                                {new Date(backup.timestamp).toLocaleString('pt-BR')} • {formatFileSize(backup.size)}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              setSelectedBackup(backup);
                              setShowRestoreModal(true);
                            }}
                            className="flex items-center gap-2 px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors"
                          >
                            <Download className="w-4 h-4" />
                            Restaurar
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal Create Backup */}
      {showCreateBackup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Criar Novo Backup</h3>

              <div className="space-y-4">
                <button
                  onClick={() => handleCreateBackup('incremental')}
                  className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-sky-300 hover:bg-sky-50 transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <Archive className="w-6 h-6 text-green-600" />
                    <div>
                      <p className="font-medium text-gray-900">Backup Incremental</p>
                      <p className="text-sm text-gray-600">Backup apenas dos dados alterados recentemente</p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => handleCreateBackup('full')}
                  className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-sky-300 hover:bg-sky-50 transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <Database className="w-6 h-6 text-blue-600" />
                    <div>
                      <p className="font-medium text-gray-900">Backup Completo</p>
                      <p className="text-sm text-gray-600">Backup completo de todos os dados do sistema</p>
                    </div>
                  </div>
                </button>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowCreateBackup(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Restore Backup */}
      {showRestoreModal && selectedBackup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 max-h-96 overflow-y-auto">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Restaurar Backup</h3>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div>
                    <p className="text-sm text-yellow-800">
                      Esta ação irá sobrescrever os dados atuais. Certifique-se de que deseja continuar.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Backup selecionado:</p>
                  <p className="font-medium text-gray-900">
                    {selectedBackup.type === 'full' ? 'Backup Completo' : 'Backup Incremental'} -
                    {new Date(selectedBackup.timestamp).toLocaleString('pt-BR')}
                  </p>
                </div>

                <div className="text-sm text-gray-600">
                  <p>Tamanho: {formatFileSize(selectedBackup.size)}</p>
                  {selectedBackup.duration && (
                    <p>Duração do backup: {formatDuration(selectedBackup.duration)}</p>
                  )}
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowRestoreModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={async () => {
                    try {
                      const restoreOptions: RestoreOptions = {
                        backupId: selectedBackup.id,
                        overwrite: true,
                        dryRun: false
                      };

                      await backupService.restoreBackup(restoreOptions);
                      alert('✅ Backup restaurado com sucesso!');
                      setShowRestoreModal(false);
                      await loadDashboardData();
                    } catch (err) {
                      console.error('❌ Erro na restauração:', err);
                      alert('❌ Erro ao restaurar backup. Verifique os logs.');
                    }
                  }}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Confirmar Restauração
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BackupDashboard;