import { Appointment, EnrichedAppointment, WaitlistEntry } from '../../types';

/**
 * Interface unificada para operações de dados da agenda
 * Permite trocar entre mock data e Supabase sem mudar os componentes
 */
export interface IAgendaDataAdapter {
  // Appointments
  getAppointments(startDate?: Date, endDate?: Date): Promise<Appointment[]>;
  getAppointmentById(id: string): Promise<Appointment | undefined>;
  saveAppointment(appointment: Appointment): Promise<Appointment>;
  deleteAppointment(id: string): Promise<void>;
  deleteAppointmentSeries(seriesId: string, fromDate: Date): Promise<void>;

  // Waitlist
  listWaitlistEntries(status?: 'waiting' | 'scheduled' | 'cancelled'): Promise<WaitlistEntry[]>;
  addWaitlistEntry(entry: Omit<WaitlistEntry, 'id' | 'createdAt' | 'updatedAt'>): Promise<WaitlistEntry>;
  updateWaitlistEntry(id: string, updates: Partial<WaitlistEntry>): Promise<WaitlistEntry | null>;
  removeWaitlistEntry(id: string): Promise<boolean>;
}

/**
 * Implementação Mock (atual)
 */
export class MockAgendaDataAdapter implements IAgendaDataAdapter {
  async getAppointments(startDate?: Date, endDate?: Date): Promise<Appointment[]> {
    // Implementação mock - será substituída pela chamada real
    const { getAppointments } = await import('../appointmentService');
    return getAppointments(startDate, endDate);
  }

  async getAppointmentById(id: string): Promise<Appointment | undefined> {
    const { getAppointmentById } = await import('../appointmentService');
    return getAppointmentById(id);
  }

  async saveAppointment(appointment: Appointment): Promise<Appointment> {
    const { saveAppointment } = await import('../appointmentService');
    return saveAppointment(appointment);
  }

  async deleteAppointment(id: string): Promise<void> {
    const { deleteAppointment } = await import('../appointmentService');
    return deleteAppointment(id);
  }

  async deleteAppointmentSeries(seriesId: string, fromDate: Date): Promise<void> {
    const { deleteAppointmentSeries } = await import('../appointmentService');
    return deleteAppointmentSeries(seriesId, fromDate);
  }

  async listWaitlistEntries(status?: 'waiting' | 'scheduled' | 'cancelled'): Promise<WaitlistEntry[]> {
    const { waitlistService } = await import('../waitlistService');
    return waitlistService.listEntries(status);
  }

  async addWaitlistEntry(entry: Omit<WaitlistEntry, 'id' | 'createdAt' | 'updatedAt'>): Promise<WaitlistEntry> {
    const { waitlistService } = await import('../waitlistService');
    return waitlistService.addEntry(entry);
  }

  async updateWaitlistEntry(id: string, updates: Partial<WaitlistEntry>): Promise<WaitlistEntry | null> {
    const { waitlistService } = await import('../waitlistService');
    return waitlistService.updateEntry(id, updates);
  }

  async removeWaitlistEntry(id: string): Promise<boolean> {
    const { waitlistService } = await import('../waitlistService');
    return waitlistService.removeEntry(id);
  }
}

/**
 * Implementação Supabase (futuro)
 * 
 * TODO: Implementar quando integrar com Supabase
 */
export class SupabaseAgendaDataAdapter implements IAgendaDataAdapter {
  async getAppointments(startDate?: Date, endDate?: Date): Promise<Appointment[]> {
    // TODO: Implementar query Supabase
    throw new Error('Not implemented yet');
  }

  async getAppointmentById(id: string): Promise<Appointment | undefined> {
    // TODO: Implementar query Supabase
    throw new Error('Not implemented yet');
  }

  async saveAppointment(appointment: Appointment): Promise<Appointment> {
    // TODO: Implementar insert/update Supabase
    throw new Error('Not implemented yet');
  }

  async deleteAppointment(id: string): Promise<void> {
    // TODO: Implementar delete Supabase
    throw new Error('Not implemented yet');
  }

  async deleteAppointmentSeries(seriesId: string, fromDate: Date): Promise<void> {
    // TODO: Implementar delete series Supabase
    throw new Error('Not implemented yet');
  }

  async listWaitlistEntries(status?: 'waiting' | 'scheduled' | 'cancelled'): Promise<WaitlistEntry[]> {
    // TODO: Implementar query Supabase
    throw new Error('Not implemented yet');
  }

  async addWaitlistEntry(entry: Omit<WaitlistEntry, 'id' | 'createdAt' | 'updatedAt'>): Promise<WaitlistEntry> {
    // TODO: Implementar insert Supabase
    throw new Error('Not implemented yet');
  }

  async updateWaitlistEntry(id: string, updates: Partial<WaitlistEntry>): Promise<WaitlistEntry | null> {
    // TODO: Implementar update Supabase
    throw new Error('Not implemented yet');
  }

  async removeWaitlistEntry(id: string): Promise<boolean> {
    // TODO: Implementar delete Supabase
    throw new Error('Not implemented yet');
  }
}

/**
 * Factory para criar o adapter apropriado
 */
export class AgendaDataAdapterFactory {
  private static adapter: IAgendaDataAdapter | null = null;

  static getAdapter(): IAgendaDataAdapter {
    if (!this.adapter) {
      // Por enquanto, sempre usar Mock
      // No futuro, verificar variável de ambiente ou configuração
      const useSupabase = false; // TODO: Mudar para true quando Supabase estiver configurado
      
      this.adapter = useSupabase 
        ? new SupabaseAgendaDataAdapter()
        : new MockAgendaDataAdapter();
    }

    return this.adapter;
  }

  static setAdapter(adapter: IAgendaDataAdapter): void {
    this.adapter = adapter;
  }
}

// Export singleton instance
export const agendaDataAdapter = AgendaDataAdapterFactory.getAdapter();

