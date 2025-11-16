import { WaitlistEntry, WaitlistStatus } from '../types';

// Mock data - em produção, isso viria do banco de dados
const waitlistData: WaitlistEntry[] = [
  {
    id: 'wait_1',
    patientId: 'patient_123',
    therapistId: 'therapist_1',
    preferredStartFrom: new Date('2025-09-30'),
    preferredStartTo: new Date('2025-10-07'),
    urgency: 3,
    status: 'waiting',
    notes: 'Paciente prefere manhã - dor no ombro',
    createdAt: new Date('2025-09-25'),
    updatedAt: new Date('2025-09-25')
  },
  {
    id: 'wait_2',
    patientId: 'patient_456',
    urgency: 5,
    status: 'waiting',
    notes: 'Urgente - lesão no joelho, precisa de atendimento rápido',
    createdAt: new Date('2025-09-26'),
    updatedAt: new Date('2025-09-26')
  },
  {
    id: 'wait_3',
    patientId: 'patient_789',
    therapistId: 'therapist_2',
    preferredStartFrom: new Date('2025-10-01'),
    urgency: 2,
    status: 'waiting',
    notes: 'Paciente flexível com horários',
    createdAt: new Date('2025-09-27'),
    updatedAt: new Date('2025-09-27')
  }
];

export const waitlistService = {
  // Listar entradas da lista de espera
  async listEntries(status?: WaitlistStatus): Promise<WaitlistEntry[]> {
    await new Promise(resolve => setTimeout(resolve, 200)); // Simular delay
    
    if (status) {
      return waitlistData.filter(entry => entry.status === status);
    }
    return waitlistData;
  },

  // Adicionar paciente à lista de espera
  async addEntry(entryData: Omit<WaitlistEntry, 'id' | 'createdAt' | 'updatedAt'>): Promise<WaitlistEntry> {
    await new Promise(resolve => setTimeout(resolve, 300)); // Simular delay
    
    const newEntry: WaitlistEntry = {
      ...entryData,
      id: `wait_${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    waitlistData.push(newEntry);
    return newEntry;
  },

  // Atualizar entrada da lista de espera
  async updateEntry(id: string, updates: Partial<WaitlistEntry>): Promise<WaitlistEntry | null> {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const index = waitlistData.findIndex(entry => entry.id === id);
    if (index === -1) return null;

    waitlistData[index] = {
      ...waitlistData[index],
      ...updates,
      updatedAt: new Date()
    };

    return waitlistData[index];
  },

  // Remover entrada da lista de espera
  async removeEntry(id: string): Promise<boolean> {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const index = waitlistData.findIndex(entry => entry.id === id);
    if (index === -1) return false;

    waitlistData.splice(index, 1);
    return true;
  },

  // Marcar como agendado
  async markAsScheduled(id: string): Promise<boolean> {
    const entry = await this.updateEntry(id, { status: 'scheduled' });
    return entry !== null;
  },

  // Marcar como cancelado
  async markAsCancelled(id: string): Promise<boolean> {
    const entry = await this.updateEntry(id, { status: 'cancelled' });
    return entry !== null;
  },

  // Obter estatísticas
  async getStats(): Promise<{
    total: number;
    waiting: number;
    urgent: number;
  }> {
    const entries = await this.listEntries();
    
    return {
      total: entries.length,
      waiting: entries.filter(e => e.status === 'waiting').length,
      urgent: entries.filter(e => e.status === 'waiting' && e.urgency >= 4).length
    };
  }
};
