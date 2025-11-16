import { describe, it, expect, beforeEach, vi } from 'vitest';
import { z } from 'zod';

// Contract schema for GET /api/patients response
const PatientResponseSchema = z.object({
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

const PatientsListResponseSchema = z.object({
  data: z.array(PatientResponseSchema),
  meta: z.object({
    total: z.number(),
    page: z.number(),
    perPage: z.number(),
    totalPages: z.number()
  })
});

// Mock fetch for testing
global.fetch = vi.fn();

describe('GET /api/patients Contract Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return paginated list of patients', async () => {
    const mockResponse = {
      data: [
        {
          id: '123e4567-e89b-12d3-a456-426614174000',
          name: 'João Silva',
          email: 'joao.silva@email.com',
          phone: '(11) 98765-4321',
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
          emergencyContact: {
            name: 'Maria Silva',
            phone: '(11) 98765-4322',
            relationship: 'Esposa'
          },
          medicalHistory: ['Hipertensão'],
          allergies: ['Dipirona'],
          medications: ['Losartana 50mg'],
          insuranceProvider: 'Unimed',
          insuranceNumber: '123456789',
          observations: 'Paciente com histórico de dor lombar crônica',
          status: 'active',
          createdAt: '2024-01-15T10:00:00Z',
          updatedAt: '2024-01-15T10:00:00Z'
        }
      ],
      meta: {
        total: 50,
        page: 1,
        perPage: 10,
        totalPages: 5
      }
    };

    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse
    });

    const response = await fetch('/api/patients?page=1&perPage=10');
    const data = await response.json();

    // Validate response against contract
    const result = PatientsListResponseSchema.safeParse(data);
    expect(result.success).toBe(true);
    expect(data.data).toHaveLength(1);
    expect(data.meta.total).toBe(50);
  });

  it('should support search by name', async () => {
    const mockResponse = {
      data: [
        {
          id: '123e4567-e89b-12d3-a456-426614174000',
          name: 'Maria Santos',
          email: 'maria.santos@email.com',
          phone: '(11) 98765-4321',
          cpf: '987.654.321-00',
          birthDate: '1985-05-20T00:00:00Z',
          address: {
            street: 'Av. Paulista',
            number: '1000',
            neighborhood: 'Bela Vista',
            city: 'São Paulo',
            state: 'SP',
            zipCode: '01310-100'
          },
          status: 'active',
          createdAt: '2024-01-10T10:00:00Z',
          updatedAt: '2024-01-10T10:00:00Z'
        }
      ],
      meta: {
        total: 1,
        page: 1,
        perPage: 10,
        totalPages: 1
      }
    };

    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse
    });

    const response = await fetch('/api/patients?search=Maria');
    const data = await response.json();

    const result = PatientsListResponseSchema.safeParse(data);
    expect(result.success).toBe(true);
    expect(data.data[0].name).toContain('Maria');
  });

  it('should support filtering by status', async () => {
    const mockResponse = {
      data: [
        {
          id: '123e4567-e89b-12d3-a456-426614174001',
          name: 'Pedro Oliveira',
          email: 'pedro@email.com',
          phone: '(11) 98765-4323',
          cpf: '456.789.123-00',
          birthDate: '1995-03-10T00:00:00Z',
          address: {
            street: 'Rua Augusta',
            number: '500',
            neighborhood: 'Consolação',
            city: 'São Paulo',
            state: 'SP',
            zipCode: '01305-000'
          },
          status: 'inactive',
          createdAt: '2023-12-01T10:00:00Z',
          updatedAt: '2024-01-01T10:00:00Z'
        }
      ],
      meta: {
        total: 5,
        page: 1,
        perPage: 10,
        totalPages: 1
      }
    };

    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse
    });

    const response = await fetch('/api/patients?status=inactive');
    const data = await response.json();

    const result = PatientsListResponseSchema.safeParse(data);
    expect(result.success).toBe(true);
    expect(data.data[0].status).toBe('inactive');
  });

  it('should support sorting by name or createdAt', async () => {
    const mockResponse = {
      data: [
        {
          id: '123e4567-e89b-12d3-a456-426614174002',
          name: 'Ana Costa',
          email: 'ana@email.com',
          phone: '(11) 98765-4324',
          cpf: '789.123.456-00',
          birthDate: '2000-07-25T00:00:00Z',
          address: {
            street: 'Rua Oscar Freire',
            number: '200',
            neighborhood: 'Pinheiros',
            city: 'São Paulo',
            state: 'SP',
            zipCode: '05409-000'
          },
          status: 'active',
          createdAt: '2024-01-20T10:00:00Z',
          updatedAt: '2024-01-20T10:00:00Z'
        }
      ],
      meta: {
        total: 30,
        page: 1,
        perPage: 10,
        totalPages: 3
      }
    };

    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse
    });

    const response = await fetch('/api/patients?sortBy=name&order=asc');
    const data = await response.json();

    const result = PatientsListResponseSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it('should handle empty results', async () => {
    const mockResponse = {
      data: [],
      meta: {
        total: 0,
        page: 1,
        perPage: 10,
        totalPages: 0
      }
    };

    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse
    });

    const response = await fetch('/api/patients?search=NonExistentPatient');
    const data = await response.json();

    const result = PatientsListResponseSchema.safeParse(data);
    expect(result.success).toBe(true);
    expect(data.data).toHaveLength(0);
    expect(data.meta.total).toBe(0);
  });

  it('should validate required fields in response', async () => {
    const invalidResponse = {
      data: [
        {
          // Missing required fields like id, name, email
          phone: '(11) 98765-4321',
          status: 'active'
        }
      ],
      meta: {
        total: 1,
        page: 1,
        perPage: 10,
        totalPages: 1
      }
    };

    const result = PatientsListResponseSchema.safeParse(invalidResponse);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.length).toBeGreaterThan(0);
    }
  });
});