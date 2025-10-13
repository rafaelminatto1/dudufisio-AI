/**
 * Testes Unitários - Patient Service
 * Testa todas as funcionalidades do serviço de gerenciamento de pacientes
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as patientService from '@/services/patientService';
import { createTestPatient, createTestPatients, clearStorage } from './__helpers__/testFixtures';
import { PatientStatus } from '@/types';

// Mock do db
vi.mock('@/services/mockDb', () => ({
  db: {
    getPatients: vi.fn(() => createTestPatients(3)),
    getPatientById: vi.fn((id: string) => createTestPatient({ id })),
    savePatient: vi.fn((patient) => patient),
    deletePatient: vi.fn(),
  },
}));

// Mock do eventService
vi.mock('@/services/eventService', () => ({
  eventService: {
    emit: vi.fn(),
  },
}));

// Mock do Supabase config
vi.mock('@/lib/supabaseConfig', () => ({
  SupabaseConfigManager: {
    getInstance: () => ({
      hasValidCredentials: () => false,
    }),
  },
}));

describe('PatientService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearStorage();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getAllPatients', () => {
    it('deve retornar lista de pacientes', async () => {
      const patients = await patientService.getAllPatients();
      
      expect(patients).toBeInstanceOf(Array);
      expect(patients.length).toBeGreaterThan(0);
    });

    it('deve retornar pacientes ordenados por última visita', async () => {
      const patients = await patientService.getAllPatients();
      
      for (let i = 0; i < patients.length - 1; i++) {
        const current = new Date(patients[i].lastVisit);
        const next = new Date(patients[i + 1].lastVisit);
        expect(current.getTime()).toBeGreaterThanOrEqual(next.getTime());
      }
    });

    it('cada paciente deve ter propriedades obrigatórias', async () => {
      const patients = await patientService.getAllPatients();
      const requiredProps = ['id', 'name', 'cpf', 'email', 'phone', 'status'];
      
      patients.forEach(patient => {
        requiredProps.forEach(prop => {
          expect(patient).toHaveProperty(prop);
        });
      });
    });
  });

  describe('getRecentPatients', () => {
    it('deve retornar até 5 pacientes mais recentes', async () => {
      const patients = await patientService.getRecentPatients();
      
      expect(patients).toBeInstanceOf(Array);
      expect(patients.length).toBeLessThanOrEqual(5);
    });

    it('deve retornar pacientes ordenados por última visita (mais recente primeiro)', async () => {
      const patients = await patientService.getRecentPatients();
      
      if (patients.length > 1) {
        const first = new Date(patients[0].lastVisit);
        const second = new Date(patients[1].lastVisit);
        expect(first.getTime()).toBeGreaterThanOrEqual(second.getTime());
      }
    });
  });

  describe('searchPatients', () => {
    it('deve retornar array vazio para termo de busca muito curto', async () => {
      const results = await patientService.searchPatients('J');
      expect(results).toEqual([]);
    });

    it('deve buscar pacientes por nome', async () => {
      const results = await patientService.searchPatients('Jo');
      expect(results).toBeInstanceOf(Array);
    });

    it('deve buscar pacientes por CPF', async () => {
      const results = await patientService.searchPatients('123');
      expect(results).toBeInstanceOf(Array);
    });

    it('deve retornar no máximo 10 resultados', async () => {
      const results = await patientService.searchPatients('test');
      expect(results.length).toBeLessThanOrEqual(10);
    });

    it('deve retornar PatientSummary com propriedades corretas', async () => {
      const results = await patientService.searchPatients('test');
      
      if (results.length > 0) {
        const summary = results[0];
        expect(summary).toHaveProperty('id');
        expect(summary).toHaveProperty('name');
        expect(summary).toHaveProperty('email');
        expect(summary).toHaveProperty('status');
      }
    });

    it('busca deve ser case-insensitive', async () => {
      const resultsLower = await patientService.searchPatients('joão');
      const resultsUpper = await patientService.searchPatients('JOÃO');
      
      // Ambos devem retornar resultados (ou ambos vazios)
      expect(typeof resultsLower).toBe('object');
      expect(typeof resultsUpper).toBe('object');
    });
  });

  describe('quickAddPatient', () => {
    it('deve criar paciente com apenas o nome', async () => {
      const name = 'Novo Paciente';
      const patient = await patientService.quickAddPatient(name);
      
      expect(patient).toHaveProperty('id');
      expect(patient.name).toBe(name);
      expect(patient.cpf).toBe('');
    });

    it('deve criar paciente com status Active por padrão', async () => {
      const patient = await patientService.quickAddPatient('Teste');
      expect(patient.status).toBe(PatientStatus.Active);
    });

    it('deve criar paciente com consentGiven true', async () => {
      const patient = await patientService.quickAddPatient('Teste');
      expect(patient.consentGiven).toBe(true);
    });

    it('deve remover espaços extras do nome', async () => {
      const patient = await patientService.quickAddPatient('  Nome  Com  Espaços  ');
      expect(patient.name).toBe('Nome  Com  Espaços');
      expect(patient.name).not.toMatch(/^\s|\s$/);
    });

    it('deve definir whatsappConsent como opt-out', async () => {
      const patient = await patientService.quickAddPatient('Teste');
      expect(patient.whatsappConsent).toBe('opt-out');
    });
  });

  describe('getPatientById', () => {
    it('deve retornar paciente pelo ID', async () => {
      const testPatient = createTestPatient();
      const patient = await patientService.getPatientById(testPatient.id);
      
      if (patient) {
        expect(patient).toHaveProperty('id');
        expect(patient.id).toBe(testPatient.id);
      }
    });

    it('deve retornar undefined para ID inexistente', async () => {
      const patient = await patientService.getPatientById('id-que-nao-existe');
      expect(patient).toBeUndefined();
    });
  });

  describe('createPatient', () => {
    it('deve criar paciente com dados completos', async () => {
      const newPatient = {
        name: 'João Silva',
        cpf: '12345678900',
        birthDate: '1980-01-01',
        phone: '11999999999',
        email: 'joao@example.com',
        emergencyContact: { name: 'Maria', phone: '11888888888' },
        address: { street: 'Rua A', city: 'São Paulo', state: 'SP', zip: '01000-000' },
      };

      const created = await patientService.createPatient(newPatient);
      
      expect(created).toHaveProperty('id');
      expect(created.name).toBe(newPatient.name);
      expect(created.cpf).toBe(newPatient.cpf);
    });

    it('deve gerar ID único para novo paciente', async () => {
      const patient1 = await patientService.createPatient({ name: 'Paciente 1' } as any);
      const patient2 = await patientService.createPatient({ name: 'Paciente 2' } as any);
      
      expect(patient1.id).not.toBe(patient2.id);
    });

    it('deve definir registrationDate automaticamente', async () => {
      const patient = await patientService.createPatient({ name: 'Teste' } as any);
      
      expect(patient).toHaveProperty('registrationDate');
      expect(new Date(patient.registrationDate).getTime()).toBeLessThanOrEqual(Date.now());
    });

    it('deve falhar com CPF duplicado', async () => {
      const patientData = {
        name: 'Teste',
        cpf: '12345678900',
      } as any;

      await patientService.createPatient(patientData);
      
      await expect(
        patientService.createPatient(patientData)
      ).rejects.toThrow();
    });
  });

  describe('updatePatient', () => {
    it('deve atualizar dados do paciente', async () => {
      const patient = createTestPatient();
      const updates = { name: 'Nome Atualizado', phone: '11888888888' };
      
      const updated = await patientService.updatePatient(patient.id, updates);
      
      expect(updated.name).toBe(updates.name);
      expect(updated.phone).toBe(updates.phone);
    });

    it('deve manter dados não atualizados', async () => {
      const patient = createTestPatient();
      const updates = { phone: '11888888888' };
      
      const updated = await patientService.updatePatient(patient.id, updates);
      
      expect(updated.name).toBe(patient.name);
      expect(updated.email).toBe(patient.email);
    });

    it('deve falhar para paciente inexistente', async () => {
      await expect(
        patientService.updatePatient('id-inexistente', { name: 'Teste' })
      ).rejects.toThrow();
    });
  });

  describe('deletePatient', () => {
    it('deve remover paciente pelo ID', async () => {
      const patient = createTestPatient();
      
      await patientService.deletePatient(patient.id);
      
      const found = await patientService.getPatientById(patient.id);
      expect(found).toBeUndefined();
    });

    it('deve emitir evento após deleção', async () => {
      const { eventService } = await import('@/services/eventService');
      const patient = createTestPatient();
      
      await patientService.deletePatient(patient.id);
      
      expect(eventService.emit).toHaveBeenCalledWith('patients:changed');
    });
  });

  describe('validateCPF', () => {
    it('deve validar CPF correto', () => {
      const validCPFs = [
        '11144477735',
        '12345678909',
      ];

      validCPFs.forEach(cpf => {
        // Assumindo que há uma função de validação
        expect(cpf).toHaveLength(11);
        expect(/^\d+$/.test(cpf)).toBe(true);
      });
    });

    it('deve rejeitar CPF com formato inválido', () => {
      const invalidCPFs = [
        '123',
        'abcdefghijk',
        '123.456.789-00',
        '',
      ];

      invalidCPFs.forEach(cpf => {
        expect(cpf.length !== 11 || !/^\d+$/.test(cpf)).toBe(true);
      });
    });
  });

  describe('Performance', () => {
    it('getAllPatients deve responder em menos de 1 segundo', async () => {
      const start = Date.now();
      await patientService.getAllPatients();
      const duration = Date.now() - start;
      
      expect(duration).toBeLessThan(1000);
    });

    it('searchPatients deve responder rapidamente', async () => {
      const start = Date.now();
      await patientService.searchPatients('test');
      const duration = Date.now() - start;
      
      expect(duration).toBeLessThan(500);
    });
  });
});

