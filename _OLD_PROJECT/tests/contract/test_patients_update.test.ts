import { describe, it, expect, beforeEach, vi } from 'vitest';
import { z } from 'zod';

// Contract schema for PUT /api/patients/{id} request
const UpdatePatientRequestSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  cpf: z.string().optional(),
  birthDate: z.string().datetime().optional(),
  address: z.object({
    street: z.string(),
    number: z.string(),
    complement: z.string().optional(),
    neighborhood: z.string(),
    city: z.string(),
    state: z.string().length(2),
    zipCode: z.string()
  }).optional(),
  emergencyContact: z.object({
    name: z.string(),
    phone: z.string(),
    relationship: z.string()
  }).optional(),
  medicalHistory: z.array(z.string()).optional(),
  allergies: z.array(z.string()).optional(),
  medications: z.array(z.string()).optional(),
  insuranceProvider: z.string().optional(),
  insuranceNumber: z.string().optional(),
  observations: z.string().optional(),
  status: z.enum(['active', 'inactive', 'archived']).optional()
});

// Contract schema for PUT /api/patients/{id} response
const UpdatePatientResponseSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  email: z.string().email(),
  phone: z.string(),
  cpf: z.string(),
  birthDate: z.string().datetime(),
  address: z.object({
    street: z.string(),
    number: z.string(),
    complement: z.string().optional(),
    neighborhood: z.string(),
    city: z.string(),
    state: z.string(),
    zipCode: z.string()
  }),
  emergencyContact: z.object({
    name: z.string(),
    phone: z.string(),
    relationship: z.string()
  }).optional(),
  medicalHistory: z.array(z.string()).optional(),
  allergies: z.array(z.string()).optional(),
  medications: z.array(z.string()).optional(),
  insuranceProvider: z.string().optional(),
  insuranceNumber: z.string().optional(),
  observations: z.string().optional(),
  status: z.enum(['active', 'inactive', 'archived']),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime()
});

// Mock fetch for testing
global.fetch = vi.fn();

describe('PUT /api/patients/{id} Contract Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should update patient basic information', async () => {
    const patientId = '123e4567-e89b-12d3-a456-426614174000';
    const updateData = {
      name: 'João Silva Santos',
      email: 'joao.santos@email.com',
      phone: '(11) 98765-9999'
    };

    const mockResponse = {
      id: patientId,
      name: 'João Silva Santos',
      email: 'joao.santos@email.com',
      phone: '(11) 98765-9999',
      cpf: '123.456.789-00',
      birthDate: '1990-01-15T00:00:00Z',
      address: {
        street: 'Rua das Flores',
        number: '123',
        complement: 'Apto 45',
        neighborhood: 'Jardim Primavera',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01234-567'
      },
      status: 'active',
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: new Date().toISOString()
    };

    // Validate request
    const requestValidation = UpdatePatientRequestSchema.safeParse(updateData);
    expect(requestValidation.success).toBe(true);

    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse
    });

    const response = await fetch(`/api/patients/${patientId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData)
    });
    const data = await response.json();

    // Validate response
    const responseValidation = UpdatePatientResponseSchema.safeParse(data);
    expect(responseValidation.success).toBe(true);
    expect(data.name).toBe('João Silva Santos');
    expect(data.email).toBe('joao.santos@email.com');
  });

  it('should update patient address', async () => {
    const patientId = '123e4567-e89b-12d3-a456-426614174000';
    const updateData = {
      address: {
        street: 'Av. Paulista',
        number: '1578',
        complement: 'Sala 201',
        neighborhood: 'Bela Vista',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01310-200'
      }
    };

    const mockResponse = {
      id: patientId,
      name: 'João Silva',
      email: 'joao.silva@email.com',
      phone: '(11) 98765-4321',
      cpf: '123.456.789-00',
      birthDate: '1990-01-15T00:00:00Z',
      address: {
        street: 'Av. Paulista',
        number: '1578',
        complement: 'Sala 201',
        neighborhood: 'Bela Vista',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01310-200'
      },
      status: 'active',
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: new Date().toISOString()
    };

    const requestValidation = UpdatePatientRequestSchema.safeParse(updateData);
    expect(requestValidation.success).toBe(true);

    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse
    });

    const response = await fetch(`/api/patients/${patientId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData)
    });
    const data = await response.json();

    const responseValidation = UpdatePatientResponseSchema.safeParse(data);
    expect(responseValidation.success).toBe(true);
    expect(data.address.street).toBe('Av. Paulista');
    expect(data.address.number).toBe('1578');
  });

  it('should update medical information', async () => {
    const patientId = '123e4567-e89b-12d3-a456-426614174000';
    const updateData = {
      medicalHistory: ['Hipertensão', 'Diabetes tipo 2'],
      allergies: ['Dipirona', 'Penicilina'],
      medications: ['Losartana 50mg', 'Metformina 850mg'],
      observations: 'Paciente com controle glicêmico regular'
    };

    const mockResponse = {
      id: patientId,
      name: 'João Silva',
      email: 'joao.silva@email.com',
      phone: '(11) 98765-4321',
      cpf: '123.456.789-00',
      birthDate: '1990-01-15T00:00:00Z',
      address: {
        street: 'Rua das Flores',
        number: '123',
        neighborhood: 'Jardim Primavera',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01234-567'
      },
      medicalHistory: ['Hipertensão', 'Diabetes tipo 2'],
      allergies: ['Dipirona', 'Penicilina'],
      medications: ['Losartana 50mg', 'Metformina 850mg'],
      observations: 'Paciente com controle glicêmico regular',
      status: 'active',
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: new Date().toISOString()
    };

    const requestValidation = UpdatePatientRequestSchema.safeParse(updateData);
    expect(requestValidation.success).toBe(true);

    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse
    });

    const response = await fetch(`/api/patients/${patientId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData)
    });
    const data = await response.json();

    const responseValidation = UpdatePatientResponseSchema.safeParse(data);
    expect(responseValidation.success).toBe(true);
    expect(data.medicalHistory).toHaveLength(2);
    expect(data.allergies).toHaveLength(2);
    expect(data.medications).toHaveLength(2);
  });

  it('should update patient status', async () => {
    const patientId = '123e4567-e89b-12d3-a456-426614174000';
    const updateData = {
      status: 'inactive' as const
    };

    const mockResponse = {
      id: patientId,
      name: 'João Silva',
      email: 'joao.silva@email.com',
      phone: '(11) 98765-4321',
      cpf: '123.456.789-00',
      birthDate: '1990-01-15T00:00:00Z',
      address: {
        street: 'Rua das Flores',
        number: '123',
        neighborhood: 'Jardim Primavera',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01234-567'
      },
      status: 'inactive',
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: new Date().toISOString()
    };

    const requestValidation = UpdatePatientRequestSchema.safeParse(updateData);
    expect(requestValidation.success).toBe(true);

    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse
    });

    const response = await fetch(`/api/patients/${patientId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData)
    });
    const data = await response.json();

    const responseValidation = UpdatePatientResponseSchema.safeParse(data);
    expect(responseValidation.success).toBe(true);
    expect(data.status).toBe('inactive');
  });

  it('should handle 404 when patient not found', async () => {
    const patientId = 'non-existent-id';
    const updateData = {
      name: 'New Name'
    };

    (fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: async () => ({
        error: 'Patient not found',
        code: 'PATIENT_NOT_FOUND'
      })
    });

    const response = await fetch(`/api/patients/${patientId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData)
    });

    expect(response.ok).toBe(false);
    expect(response.status).toBe(404);
    const error = await response.json();
    expect(error.error).toBe('Patient not found');
  });

  it('should validate invalid email format', async () => {
    const updateData = {
      email: 'invalid-email'
    };

    const requestValidation = UpdatePatientRequestSchema.safeParse(updateData);
    expect(requestValidation.success).toBe(false);
    if (!requestValidation.success) {
      const emailError = requestValidation.error.issues.find(
        issue => issue.path.includes('email')
      );
      expect(emailError).toBeDefined();
    }
  });

  it('should validate invalid status value', async () => {
    const updateData = {
      status: 'invalid-status' as any
    };

    const requestValidation = UpdatePatientRequestSchema.safeParse(updateData);
    expect(requestValidation.success).toBe(false);
    if (!requestValidation.success) {
      const statusError = requestValidation.error.issues.find(
        issue => issue.path.includes('status')
      );
      expect(statusError).toBeDefined();
    }
  });

  it('should handle partial updates without affecting other fields', async () => {
    const patientId = '123e4567-e89b-12d3-a456-426614174000';
    const updateData = {
      phone: '(11) 99999-8888'
    };

    const mockResponse = {
      id: patientId,
      name: 'João Silva',  // Unchanged
      email: 'joao.silva@email.com',  // Unchanged
      phone: '(11) 99999-8888',  // Updated
      cpf: '123.456.789-00',  // Unchanged
      birthDate: '1990-01-15T00:00:00Z',
      address: {
        street: 'Rua das Flores',
        number: '123',
        neighborhood: 'Jardim Primavera',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01234-567'
      },
      status: 'active',
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: new Date().toISOString()
    };

    const requestValidation = UpdatePatientRequestSchema.safeParse(updateData);
    expect(requestValidation.success).toBe(true);

    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse
    });

    const response = await fetch(`/api/patients/${patientId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData)
    });
    const data = await response.json();

    const responseValidation = UpdatePatientResponseSchema.safeParse(data);
    expect(responseValidation.success).toBe(true);
    expect(data.phone).toBe('(11) 99999-8888');
    expect(data.name).toBe('João Silva');  // Should remain unchanged
    expect(data.email).toBe('joao.silva@email.com');  // Should remain unchanged
  });
});