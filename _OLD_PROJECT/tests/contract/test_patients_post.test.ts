import { describe, it, expect, beforeEach } from '@jest/globals';

// Mock API service that doesn't exist yet - THIS TEST MUST FAIL
import { createPatient } from '@/services/patientService';
import type { CreatePatientRequest, Patient } from '@/types/patient';

describe('Contract Test: POST /api/patients', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
  });

  it('should create a new patient with valid data', async () => {
    // Arrange
    const newPatientData: CreatePatientRequest = {
      full_name: 'João Silva',
      cpf: '12345678901',
      birth_date: '1985-05-15',
      phone: '+55 11 99999-9999',
      email: 'joao.silva@email.com',
      address: 'Rua das Flores, 123',
      profession: 'Engenheiro',
      marital_status: 'married',
      emergency_contact_name: 'Maria Silva',
      emergency_contact_phone: '+55 11 88888-8888',
      general_notes: 'Paciente com histórico de lesão no joelho'
    };

    const expectedResponse: Patient = {
      id: expect.any(String),
      full_name: 'João Silva',
      cpf: '12345678901',
      birth_date: '1985-05-15',
      phone: '+55 11 99999-9999',
      email: 'joao.silva@email.com',
      address: 'Rua das Flores, 123',
      profession: 'Engenheiro',
      marital_status: 'married',
      emergency_contact_name: 'Maria Silva',
      emergency_contact_phone: '+55 11 88888-8888',
      general_notes: 'Paciente com histórico de lesão no joelho',
      photo_url: null,
      active: true,
      created_at: expect.any(String),
      updated_at: expect.any(String)
    };

    // Act & Assert - THIS WILL FAIL because createPatient doesn't exist yet
    const result = await createPatient(newPatientData);
    expect(result).toEqual(expectedResponse);
  });

  it('should validate required fields', async () => {
    // Arrange
    const invalidPatientData = {
      // Missing required fields: full_name, cpf, birth_date, phone
      email: 'invalid@email.com'
    } as CreatePatientRequest;

    // Act & Assert - THIS WILL FAIL because validation doesn't exist yet
    await expect(createPatient(invalidPatientData)).rejects.toThrow('Validation error');
  });

  it('should validate CPF format', async () => {
    // Arrange
    const invalidCpfData: CreatePatientRequest = {
      full_name: 'Test User',
      cpf: '123456789', // Invalid CPF
      birth_date: '1990-01-01',
      phone: '+55 11 99999-9999'
    };

    // Act & Assert - THIS WILL FAIL because CPF validation doesn't exist yet
    await expect(createPatient(invalidCpfData)).rejects.toThrow('Invalid CPF format');
  });

  it('should prevent duplicate CPF', async () => {
    // Arrange
    const duplicatePatientData: CreatePatientRequest = {
      full_name: 'Another User',
      cpf: '12345678901', // Same CPF as previous test
      birth_date: '1990-01-01',
      phone: '+55 11 77777-7777'
    };

    // Act & Assert - THIS WILL FAIL because duplicate checking doesn't exist yet
    await expect(createPatient(duplicatePatientData)).rejects.toThrow('CPF already exists');
  });

  it('should validate Brazilian phone format', async () => {
    // Arrange
    const invalidPhoneData: CreatePatientRequest = {
      full_name: 'Test User',
      cpf: '98765432101',
      birth_date: '1990-01-01',
      phone: '123456789' // Invalid phone format
    };

    // Act & Assert - THIS WILL FAIL because phone validation doesn't exist yet
    await expect(createPatient(invalidPhoneData)).rejects.toThrow('Invalid phone format');
  });
});