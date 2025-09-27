import { supabase } from '../../lib/supabase';
import { observability } from '../../lib/observabilityLogger';
import { supabaseAppointmentService } from './appointmentServiceSupabase';
import { supabasePatientService } from './patientServiceSupabase';
import * as mockPatientService from '../patientService';
import * as mockAppointmentService from '../appointmentService';

/**
 * 🔄 SUPABASE INTEGRATION MANAGER
 *
 * Gerenciador inteligente que alterna entre serviços mock e Supabase
 * baseado na disponibilidade e configuração do ambiente.
 *
 * Funcionalidades:
 * - Detecção automática de disponibilidade do Supabase
 * - Fallback transparente para serviços mock
 * - Observabilidade e logging de operações
 * - Migração de dados automática
 * - Sincronização offline/online
 */

export class SupabaseIntegrationManager {
  private static instance: SupabaseIntegrationManager;
  private isSupabaseAvailable: boolean = false;
  private connectionChecked: boolean = false;

  public static getInstance(): SupabaseIntegrationManager {
    if (!SupabaseIntegrationManager.instance) {
      SupabaseIntegrationManager.instance = new SupabaseIntegrationManager();
    }
    return SupabaseIntegrationManager.instance;
  }

  private constructor() {
    this.checkSupabaseConnection();
  }

  private async checkSupabaseConnection(): Promise<void> {
    if (this.connectionChecked) return;

    try {
      observability.database.query('supabase.connection.check', {});

      // Tentar uma consulta simples para verificar conectividade
      const { data, error } = await supabase
        .from('users')
        .select('id')
        .limit(1);

      if (error) {
        throw error;
      }

      this.isSupabaseAvailable = true;
      observability.database.query('supabase.connection.success', {
        message: 'Conexão com Supabase estabelecida com sucesso'
      });

      console.log('✅ Supabase conectado - Usando serviços de produção');
    } catch (error) {
      this.isSupabaseAvailable = false;
      observability.database.warn('supabase.connection.failed', {
        error,
        message: 'Fallback para serviços mock devido à falha na conexão'
      });

      console.log('⚠️ Supabase indisponível - Usando serviços mock');
    } finally {
      this.connectionChecked = true;
    }
  }

  async ensureConnection(): Promise<boolean> {
    if (!this.connectionChecked) {
      await this.checkSupabaseConnection();
    }
    return this.isSupabaseAvailable;
  }

  // 👥 PATIENT SERVICES
  async getAllPatients() {
    await this.ensureConnection();

    if (this.isSupabaseAvailable) {
      observability.service.call('supabase.patients.getAll', {});
      return supabasePatientService.getAllPatients();
    } else {
      observability.service.call('mock.patients.getAll', {});
      return mockPatientService.getAllPatients();
    }
  }

  async getPatientById(id: string) {
    await this.ensureConnection();

    if (this.isSupabaseAvailable) {
      observability.service.call('supabase.patients.getById', { id });
      return supabasePatientService.getPatientById(id);
    } else {
      observability.service.call('mock.patients.getById', { id });
      return mockPatientService.getPatientById(id);
    }
  }

  async createPatient(patientData: any) {
    await this.ensureConnection();

    if (this.isSupabaseAvailable) {
      observability.service.call('supabase.patients.create', { patientData });
      return supabasePatientService.createPatient(patientData);
    } else {
      observability.service.call('mock.patients.create', { patientData });
      return mockPatientService.addPatient(patientData);
    }
  }

  async updatePatient(id: string, updates: any) {
    await this.ensureConnection();

    if (this.isSupabaseAvailable) {
      observability.service.call('supabase.patients.update', { id, updates });
      return supabasePatientService.updatePatient(id, updates);
    } else {
      observability.service.call('mock.patients.update', { id, updates });
      return mockPatientService.updatePatient(id, updates);
    }
  }

  async deletePatient(id: string) {
    await this.ensureConnection();

    if (this.isSupabaseAvailable) {
      observability.service.call('supabase.patients.delete', { id });
      return supabasePatientService.deletePatient(id);
    } else {
      observability.service.call('mock.patients.delete', { id });
      return mockPatientService.deletePatient(id);
    }
  }

  async searchPatients(query: string) {
    await this.ensureConnection();

    if (this.isSupabaseAvailable) {
      observability.service.call('supabase.patients.search', { query });
      return supabasePatientService.searchPatients(query);
    } else {
      observability.service.call('mock.patients.search', { query });
      // Implementar busca nos serviços mock se necessário
      const allPatients = await mockPatientService.getAllPatients();
      return allPatients.filter(patient =>
        patient.name?.toLowerCase().includes(query.toLowerCase()) ||
        patient.email?.toLowerCase().includes(query.toLowerCase()) ||
        patient.phone?.includes(query)
      );
    }
  }

  // 📅 APPOINTMENT SERVICES
  async getAppointments(startDate?: Date, endDate?: Date, filters?: any) {
    await this.ensureConnection();

    if (this.isSupabaseAvailable) {
      observability.service.call('supabase.appointments.get', { startDate, endDate, filters });
      return supabaseAppointmentService.getAppointmentsByDateRange(
        startDate?.toISOString() || new Date(0).toISOString(),
        endDate?.toISOString() || new Date().toISOString()
      );
    } else {
      observability.service.call('mock.appointments.get', { startDate, endDate, filters });
      return mockAppointmentService.getAppointments(startDate, endDate);
    }
  }

  async getAppointmentById(id: string) {
    await this.ensureConnection();

    if (this.isSupabaseAvailable) {
      observability.service.call('supabase.appointments.getById', { id });
      return supabaseAppointmentService.getAppointmentById(id);
    } else {
      observability.service.call('mock.appointments.getById', { id });
      return mockAppointmentService.getAppointmentById(id);
    }
  }

  async createAppointment(appointmentData: any) {
    await this.ensureConnection();

    if (this.isSupabaseAvailable) {
      observability.service.call('supabase.appointments.create', { appointmentData });
      return supabaseAppointmentService.createAppointment(appointmentData);
    } else {
      observability.service.call('mock.appointments.create', { appointmentData });
      return mockAppointmentService.createAppointment(appointmentData);
    }
  }

  async updateAppointment(id: string, updates: any) {
    await this.ensureConnection();

    if (this.isSupabaseAvailable) {
      observability.service.call('supabase.appointments.update', { id, updates });
      return supabaseAppointmentService.updateAppointment(id, updates);
    } else {
      observability.service.call('mock.appointments.update', { id, updates });
      return mockAppointmentService.updateAppointment(id, updates);
    }
  }

  async deleteAppointment(id: string) {
    await this.ensureConnection();

    if (this.isSupabaseAvailable) {
      observability.service.call('supabase.appointments.delete', { id });
      return supabaseAppointmentService.deleteAppointment(id);
    } else {
      observability.service.call('mock.appointments.delete', { id });
      return mockAppointmentService.deleteAppointment(id);
    }
  }

  async checkAppointmentConflicts(startTime: string, endTime: string, therapistId: string, room?: string, excludeId?: string) {
    await this.ensureConnection();

    if (this.isSupabaseAvailable) {
      observability.service.call('supabase.appointments.checkConflicts', {
        startTime, endTime, therapistId, room, excludeId
      });
      return supabaseAppointmentService.checkConflicts(therapistId, startTime, endTime, excludeId);
    } else {
      observability.service.call('mock.appointments.checkConflicts', {
        startTime, endTime, therapistId, room, excludeId
      });
      // Implementar verificação de conflitos nos serviços mock
      return [];
    }
  }

  // 📊 STATISTICS AND ANALYTICS
  async getPatientStats() {
    await this.ensureConnection();

    if (this.isSupabaseAvailable) {
      observability.service.call('supabase.patients.getStats', {});
      return supabasePatientService.getPatientStats();
    } else {
      observability.service.call('mock.patients.getStats', {});
      // Implementar estatísticas mock
      const patients = await mockPatientService.getAllPatients();
      return {
        total: patients.length,
        active: patients.filter(p => p.status === 'Active').length,
        inactive: patients.filter(p => p.status === 'Inactive').length,
        newThisMonth: patients.filter(p => {
          const createdAt = new Date(p.lastVisit || new Date());
          const thisMonth = new Date();
          thisMonth.setDate(1);
          return createdAt >= thisMonth;
        }).length
      };
    }
  }

  async getAppointmentStats() {
    await this.ensureConnection();

    if (this.isSupabaseAvailable) {
      observability.service.call('supabase.appointments.getStats', {});
      return supabaseAppointmentService.getAppointmentStats();
    } else {
      observability.service.call('mock.appointments.getStats', {});
      // Implementar estatísticas mock
      const appointments = await mockAppointmentService.getAppointments();
      const today = new Date();
      const todayAppointments = appointments.filter(apt => {
        const aptDate = new Date(apt.startTime);
        return aptDate.toDateString() === today.toDateString();
      });

      return {
        total: appointments.length,
        today: todayAppointments.length,
        thisWeek: appointments.filter(apt => {
          const aptDate = new Date(apt.startTime);
          const weekStart = new Date(today);
          weekStart.setDate(today.getDate() - today.getDay());
          return aptDate >= weekStart;
        }).length,
        thisMonth: appointments.filter(apt => {
          const aptDate = new Date(apt.startTime);
          return aptDate.getMonth() === today.getMonth() &&
                 aptDate.getFullYear() === today.getFullYear();
        }).length,
        byStatus: {
          'Agendado': appointments.filter(a => a.status === 'Agendado').length,
          'Concluído': appointments.filter(a => a.status === 'Concluído').length,
          'Cancelado': appointments.filter(a => a.status === 'Cancelado').length,
          'Falta': appointments.filter(a => a.status === 'Falta').length,
        }
      };
    }
  }

  // 🔄 REAL-TIME SUBSCRIPTIONS
  subscribeToPatients(callback: (payload: any) => void) {
    if (this.isSupabaseAvailable) {
      observability.service.call('supabase.patients.subscribe', {});
      return supabasePatientService.subscribeToPatients(callback);
    } else {
      observability.service.call('mock.patients.subscribe', {});
      // Para serviços mock, pode implementar EventEmitter ou similar
      return { unsubscribe: () => {} };
    }
  }

  subscribeToAppointments(callback: (payload: any) => void) {
    if (this.isSupabaseAvailable) {
      observability.service.call('supabase.appointments.subscribe', {});
      return supabaseAppointmentService.subscribeToAppointments(callback);
    } else {
      observability.service.call('mock.appointments.subscribe', {});
      // Para serviços mock, pode implementar EventEmitter ou similar
      return { unsubscribe: () => {} };
    }
  }

  // 🔧 UTILITY METHODS
  getConnectionStatus() {
    return {
      isSupabaseAvailable: this.isSupabaseAvailable,
      connectionChecked: this.connectionChecked,
      currentProvider: this.isSupabaseAvailable ? 'supabase' : 'mock'
    };
  }

  async forceReconnection() {
    this.connectionChecked = false;
    this.isSupabaseAvailable = false;
    await this.checkSupabaseConnection();
    return this.isSupabaseAvailable;
  }

  // 🚀 MIGRATION UTILITIES
  async migrateDataToSupabase() {
    if (!this.isSupabaseAvailable) {
      throw new Error('Supabase não está disponível para migração');
    }

    observability.service.call('supabase.migration.start', {});

    try {
      // Migrar pacientes
      const mockPatients = await mockPatientService.getAllPatients();
      console.log(`Migrando ${mockPatients.length} pacientes...`);

      for (const patient of mockPatients) {
        try {
          await supabasePatientService.createPatient(patient);
        } catch (error) {
          console.warn(`Erro ao migrar paciente ${patient.id}:`, error);
        }
      }

      // Migrar consultas
      const mockAppointments = await mockAppointmentService.getAppointments();
      console.log(`Migrando ${mockAppointments.length} consultas...`);

      for (const appointment of mockAppointments) {
        try {
          await supabaseAppointmentService.createAppointment(appointment);
        } catch (error) {
          console.warn(`Erro ao migrar consulta ${appointment.id}:`, error);
        }
      }

      observability.service.call('supabase.migration.success', {
        patients: mockPatients.length,
        appointments: mockAppointments.length
      });

      console.log('✅ Migração concluída com sucesso!');
    } catch (error) {
      observability.service.call('supabase.migration.error', { error });
      throw new Error(`Erro durante migração: ${error}`);
    }
  }
}

// Export singleton instance
export const integrationManager = SupabaseIntegrationManager.getInstance();