/**
 * PatientContext Tests
 * Testes completos para o contexto de pacientes
 */

import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react';
import { PatientProvider, usePatient } from '@/contexts/PatientContext';

describe('PatientContext', () => {
  // Wrapper para os hooks
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <PatientProvider>{children}</PatientProvider>
  );

  beforeEach(() => {
    localStorage.clear();
  });

  describe('Initialization', () => {
    it('should initialize with mock patients', () => {
      const { result } = renderHook(() => usePatient(), { wrapper });
      
      expect(result.current.patients).toBeDefined();
      expect(result.current.patients.length).toBeGreaterThan(0);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should load patients from localStorage if available', () => {
      const mockPatients = [
        {
          id: 'TEST-001',
          code: 'PAC-TEST',
          name: 'Test Patient',
          email: 'test@test.com',
          cpf: '000.000.000-00',
          // ... outros campos mínimos
        },
      ];

      localStorage.setItem('dudufisio_patients', JSON.stringify({
        version: '1.0.0',
        patients: mockPatients,
        lastUpdated: new Date().toISOString(),
      }));

      const { result } = renderHook(() => usePatient(), { wrapper });
      
      expect(result.current.patients[0].id).toBe('TEST-001');
    });
  });

  describe('createPatient', () => {
    it('should create a new patient successfully', async () => {
      const { result } = renderHook(() => usePatient(), { wrapper });
      
      const newPatient = {
        name: 'João Silva',
        email: 'joao@test.com',
        phone: '(11) 99999-9999',
        cpf: '111.111.111-11',
        birthDate: '1990-01-01',
        gender: 'male' as const,
        street: 'Rua Teste',
        number: '123',
        neighborhood: 'Centro',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01234-567',
        emergencyName: 'Maria Silva',
        emergencyRelationship: 'Esposa',
        emergencyPhone: '(11) 98888-8888',
        status: 'Active' as const,
        insuranceType: 'particular' as const,
      };

      let createdPatient;
      await act(async () => {
        createdPatient = await result.current.createPatient(newPatient);
      });

      expect(createdPatient).toBeDefined();
      expect(createdPatient.name).toBe('João Silva');
      expect(result.current.patients).toContainEqual(
        expect.objectContaining({ name: 'João Silva' })
      );
    });

    it('should reject duplicate CPF', async () => {
      const { result } = renderHook(() => usePatient(), { wrapper });
      
      const patient1 = {
        name: 'Patient 1',
        email: 'patient1@test.com',
        phone: '(11) 99999-0001',
        cpf: '222.222.222-22',
        birthDate: '1990-01-01',
        gender: 'male' as const,
        street: 'Rua Teste',
        number: '123',
        neighborhood: 'Centro',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01234-567',
        emergencyName: 'Emergency',
        emergencyRelationship: 'Familiar',
        emergencyPhone: '(11) 98888-8888',
        status: 'Active' as const,
        insuranceType: 'particular' as const,
      };

      await act(async () => {
        await result.current.createPatient(patient1);
      });

      const patient2 = { ...patient1, name: 'Patient 2', email: 'patient2@test.com' };

      await expect(
        act(async () => {
          await result.current.createPatient(patient2);
        })
      ).rejects.toThrow('CPF já cadastrado');
    });

    it('should reject duplicate email', async () => {
      const { result } = renderHook(() => usePatient(), { wrapper });
      
      const patient1 = {
        name: 'Patient 1',
        email: 'same@test.com',
        phone: '(11) 99999-0001',
        cpf: '333.333.333-33',
        birthDate: '1990-01-01',
        gender: 'male' as const,
        street: 'Rua Teste',
        number: '123',
        neighborhood: 'Centro',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01234-567',
        emergencyName: 'Emergency',
        emergencyRelationship: 'Familiar',
        emergencyPhone: '(11) 98888-8888',
        status: 'Active' as const,
        insuranceType: 'particular' as const,
      };

      await act(async () => {
        await result.current.createPatient(patient1);
      });

      const patient2 = { ...patient1, name: 'Patient 2', cpf: '444.444.444-44' };

      await expect(
        act(async () => {
          await result.current.createPatient(patient2);
        })
      ).rejects.toThrow('Email já cadastrado');
    });
  });

  describe('updatePatient', () => {
    it('should update patient successfully', async () => {
      const { result } = renderHook(() => usePatient(), { wrapper });
      
      // Pegar primeiro paciente mock
      const patientId = result.current.patients[0].id;

      await act(async () => {
        await result.current.updatePatient(patientId, {
          name: 'Updated Name',
        });
      });

      const updatedPatient = result.current.patients.find(p => p.id === patientId);
      expect(updatedPatient?.name).toBe('Updated Name');
    });

    it('should throw error for non-existent patient', async () => {
      const { result } = renderHook(() => usePatient(), { wrapper });

      await expect(
        act(async () => {
          await result.current.updatePatient('NON-EXISTENT', { name: 'Test' });
        })
      ).rejects.toThrow('Paciente não encontrado');
    });
  });

  describe('deletePatient', () => {
    it('should delete patient successfully', async () => {
      const { result } = renderHook(() => usePatient(), { wrapper });
      
      const patientId = result.current.patients[0].id;
      const initialCount = result.current.patients.length;

      await act(async () => {
        await result.current.deletePatient(patientId);
      });

      expect(result.current.patients.length).toBe(initialCount - 1);
      expect(result.current.patients.find(p => p.id === patientId)).toBeUndefined();
    });
  });

  describe('searchPatients', () => {
    it('should search by name', () => {
      const { result } = renderHook(() => usePatient(), { wrapper });
      
      const results = result.current.searchPatients('João');
      
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].name).toContain('João');
    });

    it('should search by email', () => {
      const { result } = renderHook(() => usePatient(), { wrapper });
      
      const results = result.current.searchPatients('email.com');
      
      expect(results.length).toBeGreaterThan(0);
    });

    it('should return all patients when query is empty', () => {
      const { result } = renderHook(() => usePatient(), { wrapper });
      
      const results = result.current.searchPatients('');
      
      expect(results.length).toBe(result.current.patients.length);
    });
  });

  describe('filterPatients', () => {
    it('should filter by status', () => {
      const { result } = renderHook(() => usePatient(), { wrapper });
      
      const filtered = result.current.filterPatients({ status: ['Active'] });
      
      expect(filtered.every(p => p.status === 'Active')).toBe(true);
    });

    it('should filter by gender', () => {
      const { result } = renderHook(() => usePatient(), { wrapper });
      
      const filtered = result.current.filterPatients({ gender: ['male'] });
      
      expect(filtered.every(p => p.gender === 'male')).toBe(true);
    });

    it('should filter by age range', () => {
      const { result } = renderHook(() => usePatient(), { wrapper });
      
      const filtered = result.current.filterPatients({ minAge: 30, maxAge: 50 });
      
      expect(filtered.every(p => p.age >= 30 && p.age <= 50)).toBe(true);
    });
  });

  describe('validation', () => {
    it('should validate unique CPF', () => {
      const { result } = renderHook(() => usePatient(), { wrapper });
      
      const firstPatient = result.current.patients[0];
      
      expect(result.current.validateUniqueCPF(firstPatient.cpf)).toBe(false);
      expect(result.current.validateUniqueCPF('999.999.999-99')).toBe(true);
    });

    it('should validate unique email', () => {
      const { result } = renderHook(() => usePatient(), { wrapper });
      
      const firstPatient = result.current.patients[0];
      
      expect(result.current.validateUniqueEmail(firstPatient.email)).toBe(false);
      expect(result.current.validateUniqueEmail('unique@test.com')).toBe(true);
    });
  });

  describe('localStorage persistence', () => {
    it('should persist patients to localStorage on change', async () => {
      const { result } = renderHook(() => usePatient(), { wrapper });
      
      const newPatient = {
        name: 'Persist Test',
        email: 'persist@test.com',
        phone: '(11) 99999-9999',
        cpf: '555.555.555-55',
        birthDate: '1990-01-01',
        gender: 'male' as const,
        street: 'Rua Teste',
        number: '123',
        neighborhood: 'Centro',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01234-567',
        emergencyName: 'Emergency',
        emergencyRelationship: 'Familiar',
        emergencyPhone: '(11) 98888-8888',
        status: 'Active' as const,
        insuranceType: 'particular' as const,
      };

      await act(async () => {
        await result.current.createPatient(newPatient);
      });

      await waitFor(() => {
        const stored = localStorage.getItem('dudufisio_patients');
        expect(stored).toBeDefined();
        
        if (stored) {
          const data = JSON.parse(stored);
          expect(data.patients.some((p: any) => p.name === 'Persist Test')).toBe(true);
        }
      });
    });
  });
});

