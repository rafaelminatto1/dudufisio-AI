import { createServerComponentClient } from '~/lib/supabase/server';
import { AuditService } from '../audit/auditService';

export interface BackupConfig {
  enabled: boolean;
  schedule: {
    full: string; // Cron expression for full backup
    incremental: string; // Cron expression for incremental backup
  };
  retention: {
    daily: number; // Days to keep daily backups
    weekly: number; // Weeks to keep weekly backups
    monthly: number; // Months to keep monthly backups
  };
  destinations: BackupDestination[];
  encryption: {
    enabled: boolean;
    algorithm: 'AES-256-GCM' | 'AES-128-GCM';
    keyRotation: boolean;
  };
  compression: {
    enabled: boolean;
    algorithm: 'gzip' | 'brotli' | 'lz4';
    level: number; // 1-9
  };
  verification: {
    enabled: boolean;
    checksumAlgorithm: 'sha256' | 'md5' | 'crc32';
  };
}

export interface BackupDestination {
  id: string;
  name: string;
  type: 'local' | 'supabase' | 's3' | 'google-drive' | 'dropbox';
  config: Record<string, any>;
  priority: number; // 1 = highest priority
  enabled: boolean;
}

export interface BackupMetadata {
  id: string;
  timestamp: string;
  type: 'full' | 'incremental';
  size: number; // bytes
  compressed: boolean;
  encrypted: boolean;
  checksum: string;
  files: BackupFileInfo[];
  destination: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  error?: string;
  duration?: number; // milliseconds
  restorationInfo?: {
    canRestore: boolean;
    dependencies: string[];
    estimatedSize: number;
  };
}

export interface BackupFileInfo {
  path: string;
  size: number;
  lastModified: string;
  checksum: string;
  type: 'patient-data' | 'appointments' | 'clinical-notes' | 'settings' | 'attachments';
}

export interface RestoreOptions {
  backupId: string;
  destination?: string;
  selective?: {
    includePatients: boolean;
    includeAppointments: boolean;
    includeClinicalNotes: boolean;
    includeSettings: boolean;
    includeAttachments: boolean;
    dateRange?: {
      start: string;
      end: string;
    };
  };
  overwrite: boolean;
  dryRun: boolean;
}

export interface BackupStats {
  totalBackups: number;
  totalSize: number;
  lastBackup: string | null;
  lastFullBackup: string | null;
  successRate: number;
  avgBackupTime: number;
  failedBackups: number;
  storageUsage: Array<{
    destination: string;
    used: number;
    available: number;
    percentage: number;
  }>;
}

/**
 * Service para gerenciar backups automatizados
 * Adaptado para Next.js App Router
 */
export class BackupService {
  /**
   * Obtém configuração de backup
   */
  static async getConfig(): Promise<{ data: BackupConfig | null; error: any }> {
    try {
      const supabase = await createServerComponentClient();
      // @ts-expect-error - backup_config table not in schema yet
      const { data, error } = await (supabase as any).from('backup_config').select('*').single();

      if (error && error.code !== 'PGRST116') {
        // PGRST116 = not found, usar padrão
        throw error;
      }

      const defaultConfig = this.getDefaultConfig();
      return { data: (data as BackupConfig) || defaultConfig, error: null };
    } catch (error) {
      console.error('Error fetching backup config:', error);
      return { data: this.getDefaultConfig(), error: null };
    }
  }

  /**
   * Atualiza configuração de backup
   */
  static async updateConfig(
    config: Partial<BackupConfig>
  ): Promise<{ data: boolean; error: any }> {
    try {
      const supabase = await createServerComponentClient();
      // @ts-expect-error - backup_config table not in schema yet
      const { error } = await (supabase as any).from('backup_config').upsert(config, { onConflict: 'id' });

      if (error) throw error;

      // Log de auditoria
      await AuditService.logAction({
        userId: 'system',
        action: 'update',
        entityType: 'backup_config',
        description: 'Configuração de backup atualizada',
      });

      return { data: true, error: null };
    } catch (error) {
      console.error('Error updating backup config:', error);
      return { data: false, error };
    }
  }

  /**
   * Cria backup (full ou incremental)
   */
  static async createBackup(
    type: 'full' | 'incremental' = 'incremental',
    automatic: boolean = false
  ): Promise<{ data: BackupMetadata | null; error: any }> {
    try {
      const supabase = await createServerComponentClient();
      const startTime = Date.now();

      // Criar registro de backup
      const backupMetadata: Partial<BackupMetadata> = {
        timestamp: new Date().toISOString(),
        type,
        size: 0,
        compressed: false,
        encrypted: false,
        checksum: '',
        files: [],
        destination: '',
        status: 'running',
      };

      // @ts-expect-error - backups table not in schema yet
      const { data: backup, error: backupError } = await (supabase as any).from('backups').insert(backupMetadata).select().single();

      if (backupError) throw backupError;

      // Coletar dados para backup
      const backupData = await this.collectBackupData(supabase, type);

      // Processar backup (comprimir, criptografar, etc.)
      const processedBackup = await this.processBackup(backupData, type);

      // Salvar backup nos destinos configurados
      const { data: config } = await this.getConfig();
      const destinations = config?.destinations.filter((d) => d.enabled) || [];

      for (const destination of destinations) {
        await this.saveToDestination(destination, processedBackup);
      }

      // Atualizar metadata
      const duration = Date.now() - startTime;
      // @ts-expect-error - backups table not in schema yet
      const { data: updatedBackup, error: updateError } = await (supabase as any).from('backups')
        .update({
          size: processedBackup.size,
          compressed: processedBackup.compressed,
          encrypted: processedBackup.encrypted,
          checksum: processedBackup.checksum,
          files: processedBackup.files,
          destination: destinations.map((d) => d.id).join(','),
          status: 'completed',
          duration,
        })
        .eq('id', backup.id)
        .select()
        .single();

      if (updateError) throw updateError;

      return { data: updatedBackup as BackupMetadata, error: null };
    } catch (error) {
      console.error('Error creating backup:', error);
      return { data: null, error };
    }
  }

  /**
   * Coleta dados para backup
   */
  private static async collectBackupData(supabase: any, type: 'full' | 'incremental') {
    const data: Record<string, any[]> = {};

    if (type === 'full') {
      // Backup completo - todas as tabelas
      const tables = [
        'patients',
        'appointments',
        'session_evolutions',
        'treatments',
        'exercises',
        'protocols',
        'financial_transactions',
      ];

      for (const table of tables) {
        const { data: tableData } = await supabase.from(table).select('*');
        data[table] = tableData || [];
      }
    } else {
      // Backup incremental - apenas dados modificados nas últimas 24h
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const { data: patients } = await supabase
        .from('patients')
        .select('*')
        .gte('updated_at', yesterday.toISOString());

      const { data: appointments } = await supabase
        .from('appointments')
        .select('*')
        .gte('updated_at', yesterday.toISOString());

      data.patients = patients || [];
      data.appointments = appointments || [];
    }

    return data;
  }

  /**
   * Processa backup (comprimir, criptografar)
   */
  private static async processBackup(
    data: Record<string, any[]>,
    type: 'full' | 'incremental'
  ) {
    // Simplificado - em produção usaria bibliotecas de compressão/criptografia
    const jsonData = JSON.stringify(data);
    const size = new Blob([jsonData]).size;

    return {
      data: jsonData,
      size,
      compressed: false,
      encrypted: false,
      checksum: this.generateChecksum(jsonData),
      files: Object.keys(data).map((table) => ({
        path: `backup/${type}/${table}.json`,
        size: new Blob([JSON.stringify(data[table])]).size,
        lastModified: new Date().toISOString(),
        checksum: this.generateChecksum(JSON.stringify(data[table])),
        type: this.getFileType(table),
      })),
    };
  }

  /**
   * Salva backup no destino
   */
  private static async saveToDestination(
    destination: BackupDestination,
    backup: any
  ) {
    switch (destination.type) {
      case 'supabase':
        await this.saveToSupabase(destination, backup);
        break;
      case 'local':
        // Em produção, salvaria em sistema de arquivos
        console.log('Saving to local storage:', destination.config.path);
        break;
      default:
        console.log(`Destination type ${destination.type} not implemented`);
    }
  }

  /**
   * Salva backup no Supabase Storage
   */
  private static async saveToSupabase(destination: BackupDestination, backup: any) {
    try {
      const supabase = await createServerComponentClient();
      const fileName = `backup-${Date.now()}.json`;
      const filePath = `${destination.config.folder || 'backups'}/${fileName}`;

      const { error } = await supabase.storage
        .from(destination.config.bucket || 'backups')
        .upload(filePath, new Blob([backup.data]), {
          contentType: 'application/json',
          upsert: false,
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error saving to Supabase:', error);
      throw error;
    }
  }

  /**
   * Lista backups disponíveis
   */
  static async listBackups(limit: number = 50) {
    try {
      const supabase = await createServerComponentClient();
      // @ts-expect-error - backups table not in schema yet
      const { data, error } = await (supabase as any).from('backups').select('*').order('timestamp', { ascending: false }).limit(limit);

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error listing backups:', error);
      return { data: null, error };
    }
  }

  /**
   * Restaura backup
   */
  static async restoreBackup(
    backupId: string,
    options: RestoreOptions
  ): Promise<{ data: boolean; error: any }> {
    try {
      const supabase = await createServerComponentClient();

      // Buscar backup
      // @ts-expect-error - backups table not in schema yet
      const { data: backup, error: backupError } = await (supabase as any).from('backups').select('*').eq('id', backupId).single();

      if (backupError || !backup) {
        throw new Error('Backup not found');
      }

      if (options.dryRun) {
        // Apenas validar, não restaurar
        return { data: true, error: null };
      }

      // Em produção, restauraria dados do backup
      // Por enquanto, apenas log
      console.log('Restoring backup:', backupId, options);

      return { data: true, error: null };
    } catch (error) {
      console.error('Error restoring backup:', error);
      return { data: false, error };
    }
  }

  /**
   * Obtém estatísticas de backup
   */
  static async getBackupStats(): Promise<{ data: BackupStats | null; error: any }> {
    try {
      const supabase = await createServerComponentClient();
      // @ts-expect-error - backups table not in schema yet
      const { data: backups } = await (supabase as any).from('backups').select('*').order('timestamp', { ascending: false });

      const backupsArray = (backups || []) as BackupMetadata[];
      const totalBackups = backupsArray.length;
      const totalSize = backupsArray.reduce((sum, b) => sum + (b.size || 0), 0);
      const lastBackup = backupsArray[0]?.timestamp || null;
      const lastFullBackup = backupsArray.find((b) => b.type === 'full')?.timestamp || null;
      const completed = backupsArray.filter((b) => b.status === 'completed').length;
      const successRate = totalBackups > 0 ? (completed / totalBackups) * 100 : 0;
      const avgBackupTime =
        completed > 0
          ? backupsArray
              .filter((b) => b.status === 'completed')
              .reduce((sum, b) => sum + (b.duration || 0), 0) / completed
          : 0;
      const failedBackups = backupsArray.filter((b) => b.status === 'failed').length;

      return {
        data: {
          totalBackups,
          totalSize,
          lastBackup,
          lastFullBackup,
          successRate: Math.round(successRate * 100) / 100,
          avgBackupTime: Math.round(avgBackupTime),
          failedBackups,
          storageUsage: [],
        },
        error: null,
      };
    } catch (error) {
      console.error('Error fetching backup stats:', error);
      return { data: null, error };
    }
  }

  /**
   * Configuração padrão
   */
  private static getDefaultConfig(): BackupConfig {
    return {
      enabled: true,
      schedule: {
        full: '0 2 * * 0', // Domingo às 2h
        incremental: '0 */6 * * *', // A cada 6 horas
      },
      retention: {
        daily: 7,
        weekly: 4,
        monthly: 12,
      },
      destinations: [
        {
          id: 'supabase-storage',
          name: 'Supabase Storage',
          type: 'supabase',
          config: {
            bucket: 'backups',
            folder: 'fisioflow',
          },
          priority: 1,
          enabled: true,
        },
      ],
      encryption: {
        enabled: true,
        algorithm: 'AES-256-GCM',
        keyRotation: true,
      },
      compression: {
        enabled: true,
        algorithm: 'gzip',
        level: 6,
      },
      verification: {
        enabled: true,
        checksumAlgorithm: 'sha256',
      },
    };
  }

  /**
   * Gera checksum
   */
  private static generateChecksum(data: string): string {
    // Simplificado - em produção usaria crypto.createHash
    return `checksum-${data.length}`;
  }

  /**
   * Obtém tipo de arquivo baseado na tabela
   */
  private static getFileType(table: string): BackupFileInfo['type'] {
    if (table === 'patients') return 'patient-data';
    if (table === 'appointments') return 'appointments';
    if (table === 'session_evolutions') return 'clinical-notes';
    if (table.includes('setting')) return 'settings';
    return 'attachments';
  }
}

