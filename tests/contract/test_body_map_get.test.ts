import { describe, it, expect, beforeEach, vi } from 'vitest';
import { z } from 'zod';

// Contract schema for GET /api/patients/{id}/pain-points response
const PainPointSchema = z.object({
  id: z.string().uuid(),
  patientId: z.string().uuid(),
  bodyRegion: z.enum(['head', 'neck', 'shoulder_left', 'shoulder_right', 'upper_back', 
    'lower_back', 'chest', 'abdomen', 'arm_left', 'arm_right', 'elbow_left', 
    'elbow_right', 'wrist_left', 'wrist_right', 'hand_left', 'hand_right', 
    'hip_left', 'hip_right', 'thigh_left', 'thigh_right', 'knee_left', 
    'knee_right', 'calf_left', 'calf_right', 'ankle_left', 'ankle_right', 
    'foot_left', 'foot_right']),
  intensity: z.number().min(0).max(10),
  description: z.string(),
  characteristics: z.array(z.enum(['burning', 'stabbing', 'throbbing', 'aching', 
    'sharp', 'dull', 'radiating', 'constant', 'intermittent'])),
  triggers: z.array(z.string()).optional(),
  reliefMethods: z.array(z.string()).optional(),
  frequency: z.enum(['constant', 'frequent', 'occasional', 'rare']),
  duration: z.string().optional(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime().nullable().optional(),
  notes: z.string().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime()
});

const PainPointsListResponseSchema = z.object({
  data: z.array(PainPointSchema),
  meta: z.object({
    total: z.number(),
    activePainPoints: z.number(),
    averageIntensity: z.number().optional(),
    mostAffectedRegions: z.array(z.string()).optional()
  })
});

// Mock fetch for testing
global.fetch = vi.fn();

describe('GET /api/patients/{id}/pain-points Contract Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return list of pain points for a patient', async () => {
    const patientId = '123e4567-e89b-12d3-a456-426614174000';
    const mockResponse = {
      data: [
        {
          id: '650e8400-e29b-41d4-a716-446655440000',
          patientId: patientId,
          bodyRegion: 'lower_back',
          intensity: 7,
          description: 'Dor lombar crônica com irradiação para perna direita',
          characteristics: ['aching', 'radiating', 'constant'],
          triggers: ['Ficar sentado por muito tempo', 'Levantar peso'],
          reliefMethods: ['Alongamento', 'Compressa quente'],
          frequency: 'constant',
          duration: '3 meses',
          startDate: '2023-11-15T00:00:00Z',
          endDate: null,
          notes: 'Piora ao final do dia',
          createdAt: '2024-01-15T10:00:00Z',
          updatedAt: '2024-02-10T14:30:00Z'
        },
        {
          id: '650e8400-e29b-41d4-a716-446655440001',
          patientId: patientId,
          bodyRegion: 'neck',
          intensity: 5,
          description: 'Tensão cervical',
          characteristics: ['aching', 'intermittent'],
          triggers: ['Estresse', 'Má postura'],
          reliefMethods: ['Massagem', 'Exercícios de relaxamento'],
          frequency: 'frequent',
          duration: '1 mês',
          startDate: '2024-01-10T00:00:00Z',
          endDate: null,
          notes: 'Relacionada ao trabalho no computador',
          createdAt: '2024-01-20T09:00:00Z',
          updatedAt: '2024-01-20T09:00:00Z'
        }
      ],
      meta: {
        total: 2,
        activePainPoints: 2,
        averageIntensity: 6,
        mostAffectedRegions: ['lower_back', 'neck']
      }
    };

    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse
    });

    const response = await fetch(`/api/patients/${patientId}/pain-points`);
    const data = await response.json();

    const result = PainPointsListResponseSchema.safeParse(data);
    expect(result.success).toBe(true);
    expect(data.data).toHaveLength(2);
    expect(data.meta.total).toBe(2);
    expect(data.meta.averageIntensity).toBe(6);
  });

  it('should filter pain points by active status', async () => {
    const patientId = '123e4567-e89b-12d3-a456-426614174000';
    const mockResponse = {
      data: [
        {
          id: '650e8400-e29b-41d4-a716-446655440002',
          patientId: patientId,
          bodyRegion: 'knee_right',
          intensity: 8,
          description: 'Dor no joelho após cirurgia',
          characteristics: ['sharp', 'constant'],
          triggers: ['Subir escadas', 'Agachar'],
          reliefMethods: ['Gelo', 'Elevação'],
          frequency: 'constant',
          duration: '2 semanas',
          startDate: '2024-02-01T00:00:00Z',
          endDate: null,  // Active pain point
          createdAt: '2024-02-01T10:00:00Z',
          updatedAt: '2024-02-15T10:00:00Z'
        }
      ],
      meta: {
        total: 1,
        activePainPoints: 1,
        averageIntensity: 8,
        mostAffectedRegions: ['knee_right']
      }
    };

    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse
    });

    const response = await fetch(`/api/patients/${patientId}/pain-points?active=true`);
    const data = await response.json();

    const result = PainPointsListResponseSchema.safeParse(data);
    expect(result.success).toBe(true);
    expect(data.data[0].endDate).toBeNull();
    expect(data.meta.activePainPoints).toBe(1);
  });

  it('should filter pain points by body region', async () => {
    const patientId = '123e4567-e89b-12d3-a456-426614174000';
    const mockResponse = {
      data: [
        {
          id: '650e8400-e29b-41d4-a716-446655440003',
          patientId: patientId,
          bodyRegion: 'shoulder_left',
          intensity: 6,
          description: 'Tendinite no ombro esquerdo',
          characteristics: ['burning', 'intermittent'],
          triggers: ['Movimentos acima da cabeça'],
          reliefMethods: ['Anti-inflamatório', 'Fisioterapia'],
          frequency: 'frequent',
          duration: '6 semanas',
          startDate: '2024-01-01T00:00:00Z',
          endDate: null,
          notes: 'Melhora com exercícios específicos',
          createdAt: '2024-01-01T10:00:00Z',
          updatedAt: '2024-02-10T10:00:00Z'
        }
      ],
      meta: {
        total: 1,
        activePainPoints: 1,
        averageIntensity: 6,
        mostAffectedRegions: ['shoulder_left']
      }
    };

    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse
    });

    const response = await fetch(`/api/patients/${patientId}/pain-points?bodyRegion=shoulder_left`);
    const data = await response.json();

    const result = PainPointsListResponseSchema.safeParse(data);
    expect(result.success).toBe(true);
    expect(data.data[0].bodyRegion).toBe('shoulder_left');
  });

  it('should filter pain points by intensity range', async () => {
    const patientId = '123e4567-e89b-12d3-a456-426614174000';
    const mockResponse = {
      data: [
        {
          id: '650e8400-e29b-41d4-a716-446655440004',
          patientId: patientId,
          bodyRegion: 'hip_right',
          intensity: 9,
          description: 'Dor intensa no quadril',
          characteristics: ['sharp', 'constant', 'radiating'],
          triggers: ['Caminhar', 'Ficar em pé'],
          reliefMethods: ['Medicação', 'Repouso'],
          frequency: 'constant',
          duration: '1 semana',
          startDate: '2024-02-10T00:00:00Z',
          endDate: null,
          createdAt: '2024-02-10T10:00:00Z',
          updatedAt: '2024-02-15T10:00:00Z'
        }
      ],
      meta: {
        total: 1,
        activePainPoints: 1,
        averageIntensity: 9,
        mostAffectedRegions: ['hip_right']
      }
    };

    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse
    });

    const response = await fetch(`/api/patients/${patientId}/pain-points?minIntensity=8&maxIntensity=10`);
    const data = await response.json();

    const result = PainPointsListResponseSchema.safeParse(data);
    expect(result.success).toBe(true);
    expect(data.data[0].intensity).toBeGreaterThanOrEqual(8);
  });

  it('should return pain points sorted by date', async () => {
    const patientId = '123e4567-e89b-12d3-a456-426614174000';
    const mockResponse = {
      data: [
        {
          id: '650e8400-e29b-41d4-a716-446655440005',
          patientId: patientId,
          bodyRegion: 'ankle_left',
          intensity: 4,
          description: 'Entorse leve',
          characteristics: ['aching', 'intermittent'],
          triggers: ['Corrida'],
          reliefMethods: ['Gelo', 'Bandagem'],
          frequency: 'occasional',
          duration: '3 dias',
          startDate: '2024-02-15T00:00:00Z',
          endDate: null,
          createdAt: '2024-02-15T10:00:00Z',
          updatedAt: '2024-02-15T10:00:00Z'
        },
        {
          id: '650e8400-e29b-41d4-a716-446655440006',
          patientId: patientId,
          bodyRegion: 'wrist_right',
          intensity: 3,
          description: 'Desconforto no punho',
          characteristics: ['dull', 'occasional'],
          triggers: ['Digitação prolongada'],
          reliefMethods: ['Pausas frequentes', 'Alongamento'],
          frequency: 'occasional',
          duration: '2 dias',
          startDate: '2024-02-14T00:00:00Z',
          endDate: null,
          createdAt: '2024-02-14T10:00:00Z',
          updatedAt: '2024-02-14T10:00:00Z'
        }
      ],
      meta: {
        total: 2,
        activePainPoints: 2,
        averageIntensity: 3.5,
        mostAffectedRegions: ['ankle_left', 'wrist_right']
      }
    };

    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse
    });

    const response = await fetch(`/api/patients/${patientId}/pain-points?sortBy=startDate&order=desc`);
    const data = await response.json();

    const result = PainPointsListResponseSchema.safeParse(data);
    expect(result.success).toBe(true);
    expect(new Date(data.data[0].startDate).getTime()).toBeGreaterThan(
      new Date(data.data[1].startDate).getTime()
    );
  });

  it('should include resolved pain points in history', async () => {
    const patientId = '123e4567-e89b-12d3-a456-426614174000';
    const mockResponse = {
      data: [
        {
          id: '650e8400-e29b-41d4-a716-446655440007',
          patientId: patientId,
          bodyRegion: 'elbow_right',
          intensity: 5,
          description: 'Epicondilite lateral',
          characteristics: ['burning', 'intermittent'],
          triggers: ['Movimento de preensão'],
          reliefMethods: ['Fisioterapia', 'Fortalecimento'],
          frequency: 'frequent',
          duration: '4 semanas',
          startDate: '2023-12-01T00:00:00Z',
          endDate: '2024-01-15T00:00:00Z',  // Resolved
          notes: 'Resolvido com tratamento conservador',
          createdAt: '2023-12-01T10:00:00Z',
          updatedAt: '2024-01-15T10:00:00Z'
        }
      ],
      meta: {
        total: 1,
        activePainPoints: 0,
        averageIntensity: 0,
        mostAffectedRegions: []
      }
    };

    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse
    });

    const response = await fetch(`/api/patients/${patientId}/pain-points?includeResolved=true`);
    const data = await response.json();

    const result = PainPointsListResponseSchema.safeParse(data);
    expect(result.success).toBe(true);
    expect(data.data[0].endDate).not.toBeNull();
    expect(data.meta.activePainPoints).toBe(0);
  });

  it('should handle empty pain points list', async () => {
    const patientId = '123e4567-e89b-12d3-a456-426614174001';
    const mockResponse = {
      data: [],
      meta: {
        total: 0,
        activePainPoints: 0,
        averageIntensity: 0,
        mostAffectedRegions: []
      }
    };

    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse
    });

    const response = await fetch(`/api/patients/${patientId}/pain-points`);
    const data = await response.json();

    const result = PainPointsListResponseSchema.safeParse(data);
    expect(result.success).toBe(true);
    expect(data.data).toHaveLength(0);
    expect(data.meta.total).toBe(0);
  });

  it('should handle 404 when patient not found', async () => {
    const patientId = 'non-existent-patient';

    (fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: async () => ({
        error: 'Patient not found',
        code: 'PATIENT_NOT_FOUND'
      })
    });

    const response = await fetch(`/api/patients/${patientId}/pain-points`);
    
    expect(response.ok).toBe(false);
    expect(response.status).toBe(404);
    const error = await response.json();
    expect(error.error).toBe('Patient not found');
  });

  it('should validate response structure', async () => {
    const invalidResponse = {
      data: [
        {
          // Missing required fields
          bodyRegion: 'lower_back',
          intensity: 5
        }
      ],
      meta: {
        total: 1,
        activePainPoints: 1
      }
    };

    const result = PainPointsListResponseSchema.safeParse(invalidResponse);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.length).toBeGreaterThan(0);
    }
  });

  it('should validate intensity range', async () => {
    const painPoint = {
      id: '650e8400-e29b-41d4-a716-446655440008',
      patientId: '123e4567-e89b-12d3-a456-426614174000',
      bodyRegion: 'chest',
      intensity: 11,  // Invalid: exceeds max of 10
      description: 'Test',
      characteristics: ['aching'],
      frequency: 'constant',
      startDate: '2024-02-15T00:00:00Z',
      createdAt: '2024-02-15T10:00:00Z',
      updatedAt: '2024-02-15T10:00:00Z'
    };

    const result = PainPointSchema.safeParse(painPoint);
    expect(result.success).toBe(false);
    if (!result.success) {
      const intensityError = result.error.issues.find(
        issue => issue.path.includes('intensity')
      );
      expect(intensityError).toBeDefined();
    }
  });

  it('should filter by multiple characteristics', async () => {
    const patientId = '123e4567-e89b-12d3-a456-426614174000';
    const mockResponse = {
      data: [
        {
          id: '650e8400-e29b-41d4-a716-446655440009',
          patientId: patientId,
          bodyRegion: 'upper_back',
          intensity: 6,
          description: 'Dor muscular',
          characteristics: ['burning', 'constant', 'radiating'],
          triggers: ['Má postura'],
          reliefMethods: ['Alongamento', 'Calor local'],
          frequency: 'constant',
          duration: '1 semana',
          startDate: '2024-02-10T00:00:00Z',
          endDate: null,
          createdAt: '2024-02-10T10:00:00Z',
          updatedAt: '2024-02-15T10:00:00Z'
        }
      ],
      meta: {
        total: 1,
        activePainPoints: 1,
        averageIntensity: 6,
        mostAffectedRegions: ['upper_back']
      }
    };

    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse
    });

    const response = await fetch(`/api/patients/${patientId}/pain-points?characteristics=burning,radiating`);
    const data = await response.json();

    const result = PainPointsListResponseSchema.safeParse(data);
    expect(result.success).toBe(true);
    expect(data.data[0].characteristics).toContain('burning');
    expect(data.data[0].characteristics).toContain('radiating');
  });
});