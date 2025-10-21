import { supabase } from '../lib/supabase';

export interface Educator {
  id: string;
  name: string;
  email: string;
  phone: string;
  specialties: string[];
  licenseNumber: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReferredPatient {
  id: string;
  patientId: string;
  educatorId: string;
  referralDate: Date;
  status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  notes?: string;
  patient: {
    id: string;
    name: string;
    email: string;
    phone: string;
    age: number;
    conditions: string[];
  };
  progress: {
    currentSession: number;
    totalSessions: number;
    lastSessionDate?: Date;
    nextSessionDate?: Date;
    adherence: number; // 0-100%
    painLevel: number; // 0-10
    functionalScore: number; // 0-100
  };
}

export interface EducatorPerformance {
  educatorId: string;
  educatorName: string;
  totalPatients: number;
  activePatients: number;
  completedPatients: number;
  averageAdherence: number;
  averagePainReduction: number;
  averageFunctionalImprovement: number;
  totalSessions: number;
  completionRate: number;
  patientSatisfaction: number;
}

class EducatorService {
  /**
   * Busca pacientes encaminhados para um educador específico
   */
  async getReferredPatients(educatorId: string): Promise<ReferredPatient[]> {
    try {
      // Simulação de dados - em produção, isso viria do Supabase
      const mockPatients: ReferredPatient[] = [
        {
          id: 'ref_001',
          patientId: 'patient_001',
          educatorId: educatorId,
          referralDate: new Date('2025-01-15'),
          status: 'in_progress',
          priority: 'high',
          notes: 'Paciente com lombalgia crônica, necessita exercícios de fortalecimento',
          patient: {
            id: 'patient_001',
            name: 'Maria Silva Santos',
            email: 'maria.silva@email.com',
            phone: '(11) 99999-1111',
            age: 45,
            conditions: ['Lombalgia', 'Hérnia de disco L4-L5']
          },
          progress: {
            currentSession: 8,
            totalSessions: 12,
            lastSessionDate: new Date('2025-01-20'),
            nextSessionDate: new Date('2025-01-23'),
            adherence: 85,
            painLevel: 4,
            functionalScore: 75
          }
        },
        {
          id: 'ref_002',
          patientId: 'patient_002',
          educatorId: educatorId,
          referralDate: new Date('2025-01-18'),
          status: 'accepted',
          priority: 'medium',
          notes: 'Pós-operatório de artroscopia no joelho direito',
          patient: {
            id: 'patient_002',
            name: 'João Carlos Oliveira',
            email: 'joao.carlos@email.com',
            phone: '(11) 99999-2222',
            age: 38,
            conditions: ['Pós-artroscopia joelho', 'Lesão menisco']
          },
          progress: {
            currentSession: 3,
            totalSessions: 16,
            lastSessionDate: new Date('2025-01-21'),
            nextSessionDate: new Date('2025-01-24'),
            adherence: 92,
            painLevel: 3,
            functionalScore: 60
          }
        },
        {
          id: 'ref_003',
          patientId: 'patient_003',
          educatorId: educatorId,
          referralDate: new Date('2025-01-20'),
          status: 'pending',
          priority: 'low',
          notes: 'Prevenção de lesões para atleta de corrida',
          patient: {
            id: 'patient_003',
            name: 'Ana Beatriz Costa',
            email: 'ana.beatriz@email.com',
            phone: '(11) 99999-3333',
            age: 28,
            conditions: ['Prevenção lesões', 'Corrida de rua']
          },
          progress: {
            currentSession: 0,
            totalSessions: 8,
            adherence: 0,
            painLevel: 2,
            functionalScore: 90
          }
        }
      ];

      return mockPatients.filter(patient => patient.educatorId === educatorId);
    } catch (error) {
      console.error('Erro ao buscar pacientes encaminhados:', error);
      throw new Error('Falha ao carregar pacientes encaminhados');
    }
  }

  /**
   * Atribui um paciente a um educador
   */
  async assignPatientToEducator(patientId: string, educatorId: string, notes?: string): Promise<ReferredPatient> {
    try {
      const newReferral: ReferredPatient = {
        id: `ref_${Date.now()}`,
        patientId,
        educatorId,
        referralDate: new Date(),
        status: 'pending',
        priority: 'medium',
        notes,
        patient: {
          id: patientId,
          name: 'Paciente Novo',
          email: 'paciente@email.com',
          phone: '(11) 99999-0000',
          age: 35,
          conditions: ['Condição não especificada']
        },
        progress: {
          currentSession: 0,
          totalSessions: 12,
          adherence: 0,
          painLevel: 5,
          functionalScore: 50
        }
      };

      // Em produção, salvar no Supabase
      return newReferral;
    } catch (error) {
      console.error('Erro ao atribuir paciente ao educador:', error);
      throw new Error('Falha ao atribuir paciente');
    }
  }

  /**
   * Busca performance de um educador específico
   */
  async getEducatorPerformance(educatorId: string): Promise<EducatorPerformance> {
    try {
      const mockPerformance: EducatorPerformance = {
        educatorId,
        educatorName: 'Dr. Roberto Educador',
        totalPatients: 24,
        activePatients: 18,
        completedPatients: 6,
        averageAdherence: 87.5,
        averagePainReduction: 3.2,
        averageFunctionalImprovement: 25.8,
        totalSessions: 156,
        completionRate: 78.5,
        patientSatisfaction: 9.2
      };

      return mockPerformance;
    } catch (error) {
      console.error('Erro ao buscar performance do educador:', error);
      throw new Error('Falha ao carregar performance');
    }
  }

  /**
   * Atualiza progresso de um paciente
   */
  async updatePatientProgress(referralId: string, progress: Partial<ReferredPatient['progress']>): Promise<void> {
    try {
      // Em produção, atualizar no Supabase
      console.log(`Atualizando progresso do encaminhamento ${referralId}:`, progress);
      
      // Simular delay da API
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error('Erro ao atualizar progresso:', error);
      throw new Error('Falha ao atualizar progresso');
    }
  }

  /**
   * Busca todos os educadores ativos
   */
  async getActiveEducators(): Promise<Educator[]> {
    try {
      const mockEducators: Educator[] = [
        {
          id: 'educator_001',
          name: 'Dr. Roberto Educador',
          email: 'roberto.educador@clinica.com',
          phone: '(11) 99999-0001',
          specialties: ['Fisioterapia Esportiva', 'Pilates'],
          licenseNumber: 'CREFITO-123456',
          isActive: true,
          createdAt: new Date('2024-01-15'),
          updatedAt: new Date('2025-01-20')
        },
        {
          id: 'educator_002',
          name: 'Dra. Maria Educadora',
          email: 'maria.educadora@clinica.com',
          phone: '(11) 99999-0002',
          specialties: ['Fisioterapia Traumato-Ortopédica', 'RPG'],
          licenseNumber: 'CREFITO-789012',
          isActive: true,
          createdAt: new Date('2024-02-10'),
          updatedAt: new Date('2025-01-18')
        }
      ];

      return mockEducators.filter(educator => educator.isActive);
    } catch (error) {
      console.error('Erro ao buscar educadores:', error);
      throw new Error('Falha ao carregar educadores');
    }
  }

  /**
   * Busca estatísticas gerais dos educadores
   */
  async getEducatorStats(): Promise<{
    totalEducators: number;
    activeEducators: number;
    totalPatients: number;
    averagePerformance: number;
  }> {
    try {
      return {
        totalEducators: 5,
        activeEducators: 3,
        totalPatients: 47,
        averagePerformance: 84.2
      };
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      throw new Error('Falha ao carregar estatísticas');
    }
  }
}

export const educatorService = new EducatorService();
