/**
 * Scheduled Export Service
 * Permite agendar exports automáticos da agenda
 */

import { EnrichedAppointment, Therapist } from '../types';
import { agendaExportService } from './agendaExportService';
import { indexedDB } from '../lib/indexedDB';

export type ExportFrequency = 'daily' | 'weekly' | 'monthly';
export type ExportFormat = 'csv' | 'excel' | 'json';

export interface ScheduledExport {
  id: string;
  name: string;
  format: ExportFormat;
  frequency: ExportFrequency;
  dayOfWeek?: number; // 0-6 for weekly
  dayOfMonth?: number; // 1-31 for monthly
  time: string; // HH:MM
  enabled: boolean;
  filters?: {
    therapistId?: string;
    status?: string[];
    paymentStatus?: string[];
  };
  emailTo?: string[];
  lastRun?: Date;
  nextRun?: Date;
  createdAt: Date;
}

class ScheduledExportService {
  private readonly STORAGE_KEY = 'scheduled-exports';

  async getScheduledExports(): Promise<ScheduledExport[]> {
    try {
      const stored = await indexedDB.get('settings', this.STORAGE_KEY);
      if (!stored || !stored.value) return [];
      
      return stored.value.map((exp: any) => ({
        ...exp,
        createdAt: new Date(exp.createdAt),
        lastRun: exp.lastRun ? new Date(exp.lastRun) : undefined,
        nextRun: exp.nextRun ? new Date(exp.nextRun) : undefined
      }));
    } catch (error) {
      console.error('Error loading scheduled exports:', error);
      return [];
    }
  }

  async createScheduledExport(export_: Omit<ScheduledExport, 'id' | 'createdAt'>): Promise<ScheduledExport> {
    const newExport: ScheduledExport = {
      ...export_,
      id: `exp-${Date.now()}`,
      createdAt: new Date(),
      nextRun: this.calculateNextRun(export_)
    };

    const exports = await this.getScheduledExports();
    exports.push(newExport);
    
    await indexedDB.set('settings', {
      key: this.STORAGE_KEY,
      value: exports,
      updatedAt: new Date()
    });

    return newExport;
  }

  async updateScheduledExport(id: string, updates: Partial<ScheduledExport>): Promise<ScheduledExport> {
    const exports = await this.getScheduledExports();
    const index = exports.findIndex(e => e.id === id);
    
    if (index === -1) throw new Error('Scheduled export not found');

    exports[index] = {
      ...exports[index],
      ...updates,
      nextRun: updates.frequency || updates.time
        ? this.calculateNextRun({ ...exports[index], ...updates })
        : exports[index].nextRun
    };

    await indexedDB.set('settings', {
      key: this.STORAGE_KEY,
      value: exports,
      updatedAt: new Date()
    });

    return exports[index];
  }

  async deleteScheduledExport(id: string): Promise<void> {
    const exports = await this.getScheduledExports();
    const filtered = exports.filter(e => e.id !== id);
    
    await indexedDB.set('settings', {
      key: this.STORAGE_KEY,
      value: filtered,
      updatedAt: new Date()
    });
  }

  async executeExport(
    exportConfig: ScheduledExport,
    appointments: EnrichedAppointment[],
    therapists: Therapist[]
  ): Promise<void> {
    // Apply filters
    let filtered = appointments;
    if (exportConfig.filters) {
      if (exportConfig.filters.therapistId) {
        filtered = filtered.filter(a => a.therapistId === exportConfig.filters!.therapistId);
      }
      if (exportConfig.filters.status) {
        filtered = filtered.filter(a => exportConfig.filters!.status!.includes(a.status));
      }
      if (exportConfig.filters.paymentStatus) {
        filtered = filtered.filter(a => exportConfig.filters!.paymentStatus!.includes(a.paymentStatus));
      }
    }

    // Execute export
    switch (exportConfig.format) {
      case 'csv':
        await agendaExportService.exportToCSV(filtered);
        break;
      case 'excel':
        await agendaExportService.exportToExcel(filtered, therapists);
        break;
      case 'json':
        await agendaExportService.exportToJSON(filtered);
        break;
    }

    // Update last run
    await this.updateScheduledExport(exportConfig.id, {
      lastRun: new Date(),
      nextRun: this.calculateNextRun(exportConfig)
    });
  }

  private calculateNextRun(exportConfig: Pick<ScheduledExport, 'frequency' | 'time' | 'dayOfWeek' | 'dayOfMonth'>): Date {
    const now = new Date();
    const [hours, minutes] = exportConfig.time.split(':').map(Number);
    const nextRun = new Date();
    nextRun.setHours(hours, minutes, 0, 0);

    switch (exportConfig.frequency) {
      case 'daily':
        if (nextRun <= now) {
          nextRun.setDate(nextRun.getDate() + 1);
        }
        break;

      case 'weekly':
        const targetDay = exportConfig.dayOfWeek ?? 1; // Default Monday
        const currentDay = nextRun.getDay();
        let daysToAdd = targetDay - currentDay;
        if (daysToAdd <= 0 || (daysToAdd === 0 && nextRun <= now)) {
          daysToAdd += 7;
        }
        nextRun.setDate(nextRun.getDate() + daysToAdd);
        break;

      case 'monthly':
        const targetDate = exportConfig.dayOfMonth ?? 1;
        nextRun.setDate(targetDate);
        if (nextRun <= now) {
          nextRun.setMonth(nextRun.getMonth() + 1);
        }
        break;
    }

    return nextRun;
  }

  async checkAndExecutePendingExports(
    appointments: EnrichedAppointment[],
    therapists: Therapist[]
  ): Promise<void> {
    const exports = await this.getScheduledExports();
    const now = new Date();

    for (const exp of exports) {
      if (exp.enabled && exp.nextRun && exp.nextRun <= now) {
        try {
          await this.executeExport(exp, appointments, therapists);
        } catch (error) {
          console.error(`Failed to execute scheduled export ${exp.id}:`, error);
        }
      }
    }
  }
}

export const scheduledExportService = new ScheduledExportService();

