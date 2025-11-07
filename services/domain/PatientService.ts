/**
 * PatientService - Lógica de negócio para pacientes
 * Usa PatientRepository para acesso ao banco
 * Contém validações, transformações e regras de negócio
 */

import { patientRepository, type PatientFilters } from '../repositories/PatientRepository';
import type { Patient, PatientStatus } from '@/types';
import type { Database } from '@/types/supabase';
import { eventService } from '../eventService';
import { secureLogger } from '@/lib/secureLogger';
import { withSupabaseQuery, withSupabaseMutation } from '@/lib/supabase/errorHandler';

type PatientRow = Database['public']['Tables']['patients']['Row'];
type PatientInsert = Database['public']['Tables']['patients']['Insert'];

export class PatientService {
  /**
   * Busca todos os pacientes com filtros opcionais
   */
  async getAll(filters?: PatientFilters): Promise<Patient[]> {
    return withSupabaseQuery(
      async () => {
        const patients = await patientRepository.findMany(filters);
        return patients.map(p => this.transformToPatient(p));
      },
      {
        operation: 'getAll',
        fallbackMessage: 'Erro ao buscar pacientes',
      }
    );
  }

  /**
   * Busca paciente por ID
   */
  async getById(id: string): Promise<Patient | null> {
    return withSupabaseQuery(
      async () => {
        const patient = await patientRepository.findById(id);
        return patient ? this.transformToPatient(patient) : null;
      },
      {
        operation: 'getById',
        fallbackMessage: 'Erro ao buscar paciente',
      }
    );
  }

  /**
   * Busca paciente por ID com dados relacionados
   */
  async getByIdWithDetails(id: string): Promise<Patient | null> {
    return withSupabaseQuery(
      async () => {
        const patient = await patientRepository.findByIdWithDetails(id);
        return patient ? this.transformToPatient(patient as any) : null;
      },
      {
        operation: 'getByIdWithDetails',
        fallbackMessage: 'Erro ao buscar detalhes do paciente',
      }
    );
  }

  /**
   * Busca textual por nome, CPF ou email
   */
  async search(query: string, options?: { limit?: number }): Promise<Patient[]> {
    return withSupabaseQuery(
      async () => {
        const patients = await patientRepository.search(query, options);
        return patients.map(p => this.transformToPatient(p));
      },
      {
        operation: 'search',
        fallbackMessage: 'Erro ao buscar pacientes',
      }
    );
  }

  /**
   * Busca pacientes recentes
   */
  async getRecent(limit: number = 5): Promise<Patient[]> {
    return withSupabaseQuery(
      async () => {
        const patients = await patientRepository.findRecent(limit);
        return patients.map(p => this.transformToPatient(p));
      },
      {
        operation: 'getRecent',
        fallbackMessage: 'Erro ao buscar pacientes recentes',
      }
    );
  }

  /**
   * Busca pacientes ativos
   */
  async getActive(): Promise<Patient[]> {
    return withSupabaseQuery(
      async () => {
        const patients = await patientRepository.findActive();
        return patients.map(p => this.transformToPatient(p));
      },
      {
        operation: 'getActive',
        fallbackMessage: 'Erro ao buscar pacientes ativos',
      }
    );
  }

  /**
   * Cria ou atualiza um paciente
   */
  async save(patientData: Patient): Promise<Patient> {
    return withSupabaseMutation(
      async () => {
        // Validações de negócio
        this.validatePatient(patientData);

        // Verificar duplicação de CPF
        if (patientData.cpf) {
          const cpfExists = await patientRepository.cpfExists(
            patientData.cpf,
            patientData.id
          );
          if (cpfExists) {
            throw new Error('CPF já cadastrado');
          }
        }

        // Verificar duplicação de email
        if (patientData.email) {
          const emailExists = await patientRepository.emailExists(
            patientData.email,
            patientData.id
          );
          if (emailExists) {
            throw new Error('Email já cadastrado');
          }
        }

        // Transformar para formato do DB
        const dbData = this.transformToDbFormat(patientData);

        let savedPatient: PatientRow;

        if (patientData.id) {
          // Update
          savedPatient = await patientRepository.update(patientData.id, dbData);
          secureLogger.info('Paciente atualizado', { patientId: patientData.id });
        } else {
          // Create
          savedPatient = await patientRepository.create(dbData);
          secureLogger.info('Paciente criado', { patientId: savedPatient.id });
        }

        // Emitir evento para invalidar cache
        eventService.emit('patients:changed');

        return this.transformToPatient(savedPatient);
      },
      {
        operation: 'save',
        fallbackMessage: 'Erro ao salvar paciente',
      }
    );
  }

  /**
   * Deleta um paciente
   */
  async delete(id: string): Promise<void> {
    return withSupabaseMutation(
      async () => {
        await patientRepository.delete(id);
        secureLogger.info('Paciente deletado', { patientId: id });
        eventService.emit('patients:changed');
      },
      {
        operation: 'delete',
        fallbackMessage: 'Erro ao deletar paciente',
      }
    );
  }

  /**
   * Atualiza status do paciente
   */
  async updateStatus(id: string, status: PatientStatus): Promise<Patient> {
    return withSupabaseMutation(
      async () => {
        const patient = await patientRepository.updateStatus(id, status);
        eventService.emit('patients:changed');
        return this.transformToPatient(patient);
      },
      {
        operation: 'updateStatus',
        fallbackMessage: 'Erro ao atualizar status do paciente',
      }
    );
  }

  /**
   * Valida dados do paciente
   */
  private validatePatient(patient: Patient): void {
    if (!patient.name || patient.name.trim().length < 3) {
      throw new Error('Nome do paciente é obrigatório (mínimo 3 caracteres)');
    }

    if (patient.cpf && !this.isValidCPF(patient.cpf)) {
      throw new Error('CPF inválido');
    }

    if (patient.email && !this.isValidEmail(patient.email)) {
      throw new Error('Email inválido');
    }

    if (patient.phone && patient.phone.trim().length < 10) {
      throw new Error('Telefone inválido');
    }
  }

  /**
   * Valida CPF
   */
  private isValidCPF(cpf: string): boolean {
    const cleanCpf = cpf.replace(/\D/g, '');
    
    if (cleanCpf.length !== 11) return false;
    if (/^(\d)\1+$/.test(cleanCpf)) return false; // Todos dígitos iguais

    // Validação completa do CPF
    let sum = 0;
    let remainder;

    for (let i = 1; i <= 9; i++) {
      sum += parseInt(cleanCpf.substring(i - 1, i)) * (11 - i);
    }

    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cleanCpf.substring(9, 10))) return false;

    sum = 0;
    for (let i = 1; i <= 10; i++) {
      sum += parseInt(cleanCpf.substring(i - 1, i)) * (12 - i);
    }

    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cleanCpf.substring(10, 11))) return false;

    return true;
  }

  /**
   * Valida email
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Transforma PatientRow do DB para Patient da aplicação
   */
  private transformToPatient(row: PatientRow): Patient {
    const address = (row.address as any) || {};
    const emergencyContact = (row.emergency_contact as any) || {};

    return {
      id: row.id,
      name: row.full_name || row.name || '',
      cpf: row.cpf || '',
      birthDate: row.birth_date || '',
      phone: row.phone || '',
      email: row.email || '',
      emergencyContact: {
        name: emergencyContact.name || '',
        phone: emergencyContact.phone || '',
      },
      address: {
        street: address.street || '',
        city: address.city || '',
        state: address.state || '',
        zip: address.zipcode || address.zip || '',
        number: address.number || '',
        complement: address.complement || '',
        neighborhood: address.neighborhood || '',
      },
      status: this.mapStatus(row.status),
      lastVisit: row.updated_at || row.created_at || new Date().toISOString(),
      registrationDate: row.created_at || new Date().toISOString(),
      avatarUrl: row.avatar_url || '',
      consentGiven: true,
      whatsappConsent: 'opt-out',
      allergies: row.allergies?.join(', '),
      medicalAlerts: row.notes,
      conditions: row.chronic_conditions?.map(c => ({ 
        name: c, 
        date: '', 
        description: '' 
      })) || [],
    };
  }

  /**
   * Mapeia status do DB para enum da aplicação
   */
  private mapStatus(status: string | null): PatientStatus {
    const statusLower = (status || 'active').toLowerCase();
    
    if (statusLower.includes('inactive') || statusLower.includes('archived')) {
      return 'Inactive' as PatientStatus;
    } else if (statusLower.includes('discharged')) {
      return 'Discharged' as PatientStatus;
    }
    
    return 'Active' as PatientStatus;
  }

  /**
   * Transforma Patient da aplicação para formato do DB
   */
  private transformToDbFormat(patient: Patient): Partial<PatientInsert> {
    return {
      name: patient.name,
      full_name: patient.name,
      cpf: patient.cpf?.replace(/\D/g, '') || null,
      birth_date: patient.birthDate || null,
      phone: patient.phone || null,
      email: patient.email || null,
      emergency_contact: patient.emergencyContact ? {
        name: patient.emergencyContact.name,
        phone: patient.emergencyContact.phone,
      } : null,
      address: patient.address ? {
        street: patient.address.street,
        city: patient.address.city,
        state: patient.address.state,
        zipcode: patient.address.zip,
        number: patient.address.number,
        complement: patient.address.complement,
        neighborhood: patient.address.neighborhood,
      } : null,
      status: patient.status,
      notes: patient.medicalAlerts || null,
      allergies: patient.allergies ? patient.allergies.split(',').map(a => a.trim()) : null,
      chronic_conditions: patient.conditions?.map(c => c.name) || null,
      avatar_url: patient.avatarUrl || null,
    };
  }
}

// Singleton instance
export const patientService = new PatientService();

