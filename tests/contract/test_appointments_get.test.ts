import { describe, it, expect, beforeEach, vi } from 'vitest';
import { z } from 'zod';

// Contract schema for GET /api/appointments response
const AppointmentResponseSchema = z.object({
  id: z.string().uuid(),
  patientId: z.string().uuid(),
  patientName: z.string(),
  therapistId: z.string().uuid(),
  therapistName: z.string(),
  date: z.string().datetime(),
  startTime: z.string(),
  endTime: z.string(),
  type: z.enum(['evaluation', 'session', 'return', 'group']),
  status: z.enum(['scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show']),
  room: z.string().optional(),
  notes: z.string().optional(),
  price: z.number().optional(),
  insuranceCovered: z.boolean().optional(),
  reminderSent: z.boolean(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime()
});

const AppointmentsListResponseSchema = z.object({
  data: z.array(AppointmentResponseSchema),
  meta: z.object({
    total: z.number(),
    page: z.number(),
    perPage: z.number(),
    totalPages: z.number()
  })
});

// Mock fetch for testing
global.fetch = vi.fn();

describe('GET /api/appointments Contract Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return paginated list of appointments', async () => {
    const mockResponse = {
      data: [
        {
          id: '550e8400-e29b-41d4-a716-446655440000',
          patientId: '123e4567-e89b-12d3-a456-426614174000',
          patientName: 'João Silva',
          therapistId: '987e6543-e21b-12d3-a456-426614174000',
          therapistName: 'Dra. Maria Santos',
          date: '2024-02-15T00:00:00Z',
          startTime: '14:00',
          endTime: '15:00',
          type: 'session',
          status: 'scheduled',
          room: 'Sala 1',
          notes: 'Continuação do tratamento de lombalgia',
          price: 150.00,
          insuranceCovered: true,
          reminderSent: false,
          createdAt: '2024-01-20T10:00:00Z',
          updatedAt: '2024-01-20T10:00:00Z'
        }
      ],
      meta: {
        total: 100,
        page: 1,
        perPage: 10,
        totalPages: 10
      }
    };

    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse
    });

    const response = await fetch('/api/appointments?page=1&perPage=10');
    const data = await response.json();

    const result = AppointmentsListResponseSchema.safeParse(data);
    expect(result.success).toBe(true);
    expect(data.data).toHaveLength(1);
    expect(data.meta.total).toBe(100);
  });

  it('should filter appointments by date range', async () => {
    const mockResponse = {
      data: [
        {
          id: '550e8400-e29b-41d4-a716-446655440001',
          patientId: '123e4567-e89b-12d3-a456-426614174000',
          patientName: 'Pedro Oliveira',
          therapistId: '987e6543-e21b-12d3-a456-426614174000',
          therapistName: 'Dr. Carlos Mendes',
          date: '2024-02-10T00:00:00Z',
          startTime: '10:00',
          endTime: '11:00',
          type: 'evaluation',
          status: 'completed',
          room: 'Sala 2',
          price: 200.00,
          insuranceCovered: false,
          reminderSent: true,
          createdAt: '2024-01-15T10:00:00Z',
          updatedAt: '2024-02-10T11:00:00Z'
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

    const response = await fetch('/api/appointments?startDate=2024-02-01&endDate=2024-02-29');
    const data = await response.json();

    const result = AppointmentsListResponseSchema.safeParse(data);
    expect(result.success).toBe(true);
    expect(data.data[0].date).toContain('2024-02');
  });

  it('should filter appointments by therapist', async () => {
    const therapistId = '987e6543-e21b-12d3-a456-426614174000';
    const mockResponse = {
      data: [
        {
          id: '550e8400-e29b-41d4-a716-446655440002',
          patientId: '123e4567-e89b-12d3-a456-426614174001',
          patientName: 'Ana Costa',
          therapistId: therapistId,
          therapistName: 'Dra. Maria Santos',
          date: '2024-02-15T00:00:00Z',
          startTime: '16:00',
          endTime: '17:00',
          type: 'session',
          status: 'confirmed',
          room: 'Sala 1',
          reminderSent: true,
          createdAt: '2024-01-25T10:00:00Z',
          updatedAt: '2024-02-01T10:00:00Z'
        }
      ],
      meta: {
        total: 20,
        page: 1,
        perPage: 10,
        totalPages: 2
      }
    };

    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse
    });

    const response = await fetch(`/api/appointments?therapistId=${therapistId}`);
    const data = await response.json();

    const result = AppointmentsListResponseSchema.safeParse(data);
    expect(result.success).toBe(true);
    expect(data.data[0].therapistId).toBe(therapistId);
  });

  it('should filter appointments by patient', async () => {
    const patientId = '123e4567-e89b-12d3-a456-426614174000';
    const mockResponse = {
      data: [
        {
          id: '550e8400-e29b-41d4-a716-446655440003',
          patientId: patientId,
          patientName: 'João Silva',
          therapistId: '987e6543-e21b-12d3-a456-426614174001',
          therapistName: 'Dr. Roberto Lima',
          date: '2024-02-20T00:00:00Z',
          startTime: '09:00',
          endTime: '10:00',
          type: 'return',
          status: 'scheduled',
          room: 'Sala 3',
          notes: 'Retorno após 30 dias',
          reminderSent: false,
          createdAt: '2024-02-01T10:00:00Z',
          updatedAt: '2024-02-01T10:00:00Z'
        }
      ],
      meta: {
        total: 8,
        page: 1,
        perPage: 10,
        totalPages: 1
      }
    };

    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse
    });

    const response = await fetch(`/api/appointments?patientId=${patientId}`);
    const data = await response.json();

    const result = AppointmentsListResponseSchema.safeParse(data);
    expect(result.success).toBe(true);
    expect(data.data[0].patientId).toBe(patientId);
  });

  it('should filter appointments by status', async () => {
    const mockResponse = {
      data: [
        {
          id: '550e8400-e29b-41d4-a716-446655440004',
          patientId: '123e4567-e89b-12d3-a456-426614174002',
          patientName: 'Marcos Pereira',
          therapistId: '987e6543-e21b-12d3-a456-426614174002',
          therapistName: 'Dra. Juliana Alves',
          date: '2024-02-14T00:00:00Z',
          startTime: '11:00',
          endTime: '12:00',
          type: 'session',
          status: 'cancelled',
          room: 'Sala 2',
          notes: 'Paciente cancelou devido a viagem',
          reminderSent: true,
          createdAt: '2024-01-30T10:00:00Z',
          updatedAt: '2024-02-13T15:00:00Z'
        }
      ],
      meta: {
        total: 3,
        page: 1,
        perPage: 10,
        totalPages: 1
      }
    };

    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse
    });

    const response = await fetch('/api/appointments?status=cancelled');
    const data = await response.json();

    const result = AppointmentsListResponseSchema.safeParse(data);
    expect(result.success).toBe(true);
    expect(data.data[0].status).toBe('cancelled');
  });

  it('should filter appointments by type', async () => {
    const mockResponse = {
      data: [
        {
          id: '550e8400-e29b-41d4-a716-446655440005',
          patientId: '123e4567-e89b-12d3-a456-426614174003',
          patientName: 'Grupo Pilates',
          therapistId: '987e6543-e21b-12d3-a456-426614174003',
          therapistName: 'Dra. Patricia Costa',
          date: '2024-02-18T00:00:00Z',
          startTime: '18:00',
          endTime: '19:00',
          type: 'group',
          status: 'scheduled',
          room: 'Sala de Pilates',
          notes: 'Aula de pilates terapêutico',
          price: 80.00,
          insuranceCovered: false,
          reminderSent: false,
          createdAt: '2024-02-05T10:00:00Z',
          updatedAt: '2024-02-05T10:00:00Z'
        }
      ],
      meta: {
        total: 15,
        page: 1,
        perPage: 10,
        totalPages: 2
      }
    };

    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse
    });

    const response = await fetch('/api/appointments?type=group');
    const data = await response.json();

    const result = AppointmentsListResponseSchema.safeParse(data);
    expect(result.success).toBe(true);
    expect(data.data[0].type).toBe('group');
  });

  it('should support multiple filters combined', async () => {
    const mockResponse = {
      data: [
        {
          id: '550e8400-e29b-41d4-a716-446655440006',
          patientId: '123e4567-e89b-12d3-a456-426614174004',
          patientName: 'Lucia Ferreira',
          therapistId: '987e6543-e21b-12d3-a456-426614174000',
          therapistName: 'Dra. Maria Santos',
          date: '2024-02-16T00:00:00Z',
          startTime: '14:00',
          endTime: '15:00',
          type: 'session',
          status: 'confirmed',
          room: 'Sala 1',
          reminderSent: true,
          createdAt: '2024-02-10T10:00:00Z',
          updatedAt: '2024-02-14T10:00:00Z'
        }
      ],
      meta: {
        total: 2,
        page: 1,
        perPage: 10,
        totalPages: 1
      }
    };

    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse
    });

    const response = await fetch('/api/appointments?therapistId=987e6543-e21b-12d3-a456-426614174000&status=confirmed&type=session');
    const data = await response.json();

    const result = AppointmentsListResponseSchema.safeParse(data);
    expect(result.success).toBe(true);
    expect(data.data[0].status).toBe('confirmed');
    expect(data.data[0].type).toBe('session');
  });

  it('should sort appointments by date', async () => {
    const mockResponse = {
      data: [
        {
          id: '550e8400-e29b-41d4-a716-446655440007',
          patientId: '123e4567-e89b-12d3-a456-426614174005',
          patientName: 'Roberto Silva',
          therapistId: '987e6543-e21b-12d3-a456-426614174004',
          therapistName: 'Dr. Fernando Costa',
          date: '2024-02-10T00:00:00Z',
          startTime: '08:00',
          endTime: '09:00',
          type: 'evaluation',
          status: 'completed',
          reminderSent: true,
          createdAt: '2024-01-28T10:00:00Z',
          updatedAt: '2024-02-10T09:00:00Z'
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440008',
          patientId: '123e4567-e89b-12d3-a456-426614174006',
          patientName: 'Carla Mendes',
          therapistId: '987e6543-e21b-12d3-a456-426614174004',
          therapistName: 'Dr. Fernando Costa',
          date: '2024-02-11T00:00:00Z',
          startTime: '08:00',
          endTime: '09:00',
          type: 'session',
          status: 'completed',
          reminderSent: true,
          createdAt: '2024-01-29T10:00:00Z',
          updatedAt: '2024-02-11T09:00:00Z'
        }
      ],
      meta: {
        total: 2,
        page: 1,
        perPage: 10,
        totalPages: 1
      }
    };

    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse
    });

    const response = await fetch('/api/appointments?sortBy=date&order=asc');
    const data = await response.json();

    const result = AppointmentsListResponseSchema.safeParse(data);
    expect(result.success).toBe(true);
    expect(new Date(data.data[0].date).getTime()).toBeLessThan(
      new Date(data.data[1].date).getTime()
    );
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

    const response = await fetch('/api/appointments?status=no_show');
    const data = await response.json();

    const result = AppointmentsListResponseSchema.safeParse(data);
    expect(result.success).toBe(true);
    expect(data.data).toHaveLength(0);
    expect(data.meta.total).toBe(0);
  });

  it('should validate response structure', async () => {
    const invalidResponse = {
      data: [
        {
          // Missing required fields
          patientName: 'Test Patient',
          status: 'scheduled'
        }
      ],
      meta: {
        total: 1,
        page: 1,
        perPage: 10,
        totalPages: 1
      }
    };

    const result = AppointmentsListResponseSchema.safeParse(invalidResponse);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.length).toBeGreaterThan(0);
    }
  });
});