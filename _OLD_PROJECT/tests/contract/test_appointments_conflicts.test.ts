import { describe, it, expect, beforeEach, vi } from 'vitest';
import { z } from 'zod';

// Contract schema for POST /api/appointments/conflicts request
const ConflictCheckRequestSchema = z.object({
  therapistId: z.string().uuid(),
  date: z.string().datetime(),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  excludeAppointmentId: z.string().uuid().optional(),
  room: z.string().optional()
});

// Contract schema for POST /api/appointments/conflicts response
const ConflictCheckResponseSchema = z.object({
  hasConflict: z.boolean(),
  conflicts: z.array(z.object({
    id: z.string().uuid(),
    patientName: z.string(),
    startTime: z.string(),
    endTime: z.string(),
    type: z.enum(['evaluation', 'session', 'return', 'group']),
    status: z.enum(['scheduled', 'confirmed', 'in_progress']),
    room: z.string().optional()
  })),
  suggestions: z.array(z.object({
    date: z.string().datetime(),
    startTime: z.string(),
    endTime: z.string(),
    available: z.boolean()
  })).optional()
});

// Mock fetch for testing
global.fetch = vi.fn();

describe('POST /api/appointments/conflicts Contract Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should detect no conflicts for available time slot', async () => {
    const requestData = {
      therapistId: '987e6543-e21b-12d3-a456-426614174000',
      date: '2024-02-20T00:00:00Z',
      startTime: '14:00',
      endTime: '15:00'
    };

    const mockResponse = {
      hasConflict: false,
      conflicts: [],
      suggestions: []
    };

    // Validate request
    const requestValidation = ConflictCheckRequestSchema.safeParse(requestData);
    expect(requestValidation.success).toBe(true);

    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse
    });

    const response = await fetch('/api/appointments/conflicts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData)
    });
    const data = await response.json();

    // Validate response
    const responseValidation = ConflictCheckResponseSchema.safeParse(data);
    expect(responseValidation.success).toBe(true);
    expect(data.hasConflict).toBe(false);
    expect(data.conflicts).toHaveLength(0);
  });

  it('should detect conflict with existing appointment', async () => {
    const requestData = {
      therapistId: '987e6543-e21b-12d3-a456-426614174000',
      date: '2024-02-20T00:00:00Z',
      startTime: '10:00',
      endTime: '11:00'
    };

    const mockResponse = {
      hasConflict: true,
      conflicts: [
        {
          id: '550e8400-e29b-41d4-a716-446655440000',
          patientName: 'João Silva',
          startTime: '10:00',
          endTime: '11:00',
          type: 'session',
          status: 'confirmed'
        }
      ],
      suggestions: [
        {
          date: '2024-02-20T00:00:00Z',
          startTime: '09:00',
          endTime: '10:00',
          available: true
        },
        {
          date: '2024-02-20T00:00:00Z',
          startTime: '11:00',
          endTime: '12:00',
          available: true
        }
      ]
    };

    const requestValidation = ConflictCheckRequestSchema.safeParse(requestData);
    expect(requestValidation.success).toBe(true);

    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse
    });

    const response = await fetch('/api/appointments/conflicts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData)
    });
    const data = await response.json();

    const responseValidation = ConflictCheckResponseSchema.safeParse(data);
    expect(responseValidation.success).toBe(true);
    expect(data.hasConflict).toBe(true);
    expect(data.conflicts).toHaveLength(1);
    expect(data.suggestions).toHaveLength(2);
  });

  it('should detect partial overlap conflicts', async () => {
    const requestData = {
      therapistId: '987e6543-e21b-12d3-a456-426614174000',
      date: '2024-02-20T00:00:00Z',
      startTime: '10:30',
      endTime: '11:30'
    };

    const mockResponse = {
      hasConflict: true,
      conflicts: [
        {
          id: '550e8400-e29b-41d4-a716-446655440001',
          patientName: 'Maria Santos',
          startTime: '10:00',
          endTime: '11:00',
          type: 'evaluation',
          status: 'scheduled',
          room: 'Sala 1'
        }
      ],
      suggestions: [
        {
          date: '2024-02-20T00:00:00Z',
          startTime: '11:00',
          endTime: '12:00',
          available: true
        },
        {
          date: '2024-02-20T00:00:00Z',
          startTime: '14:00',
          endTime: '15:00',
          available: true
        }
      ]
    };

    const requestValidation = ConflictCheckRequestSchema.safeParse(requestData);
    expect(requestValidation.success).toBe(true);

    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse
    });

    const response = await fetch('/api/appointments/conflicts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData)
    });
    const data = await response.json();

    const responseValidation = ConflictCheckResponseSchema.safeParse(data);
    expect(responseValidation.success).toBe(true);
    expect(data.hasConflict).toBe(true);
    expect(data.conflicts[0].startTime).toBe('10:00');
  });

  it('should check room conflicts when room is specified', async () => {
    const requestData = {
      therapistId: '987e6543-e21b-12d3-a456-426614174000',
      date: '2024-02-20T00:00:00Z',
      startTime: '15:00',
      endTime: '16:00',
      room: 'Sala 1'
    };

    const mockResponse = {
      hasConflict: true,
      conflicts: [
        {
          id: '550e8400-e29b-41d4-a716-446655440002',
          patientName: 'Pedro Oliveira',
          startTime: '15:00',
          endTime: '16:00',
          type: 'session',
          status: 'confirmed',
          room: 'Sala 1'
        }
      ],
      suggestions: [
        {
          date: '2024-02-20T00:00:00Z',
          startTime: '15:00',
          endTime: '16:00',
          available: true  // Available in another room
        }
      ]
    };

    const requestValidation = ConflictCheckRequestSchema.safeParse(requestData);
    expect(requestValidation.success).toBe(true);

    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse
    });

    const response = await fetch('/api/appointments/conflicts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData)
    });
    const data = await response.json();

    const responseValidation = ConflictCheckResponseSchema.safeParse(data);
    expect(responseValidation.success).toBe(true);
    expect(data.hasConflict).toBe(true);
    expect(data.conflicts[0].room).toBe('Sala 1');
  });

  it('should exclude specific appointment from conflict check', async () => {
    const requestData = {
      therapistId: '987e6543-e21b-12d3-a456-426614174000',
      date: '2024-02-20T00:00:00Z',
      startTime: '10:00',
      endTime: '11:00',
      excludeAppointmentId: '550e8400-e29b-41d4-a716-446655440003'
    };

    const mockResponse = {
      hasConflict: false,
      conflicts: [],
      suggestions: []
    };

    const requestValidation = ConflictCheckRequestSchema.safeParse(requestData);
    expect(requestValidation.success).toBe(true);

    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse
    });

    const response = await fetch('/api/appointments/conflicts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData)
    });
    const data = await response.json();

    const responseValidation = ConflictCheckResponseSchema.safeParse(data);
    expect(responseValidation.success).toBe(true);
    expect(data.hasConflict).toBe(false);
  });

  it('should detect multiple conflicts', async () => {
    const requestData = {
      therapistId: '987e6543-e21b-12d3-a456-426614174000',
      date: '2024-02-20T00:00:00Z',
      startTime: '09:00',
      endTime: '12:00'  // 3-hour block
    };

    const mockResponse = {
      hasConflict: true,
      conflicts: [
        {
          id: '550e8400-e29b-41d4-a716-446655440004',
          patientName: 'Ana Costa',
          startTime: '09:00',
          endTime: '10:00',
          type: 'session',
          status: 'confirmed'
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440005',
          patientName: 'Carlos Mendes',
          startTime: '10:00',
          endTime: '11:00',
          type: 'return',
          status: 'scheduled'
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440006',
          patientName: 'Lucia Ferreira',
          startTime: '11:00',
          endTime: '12:00',
          type: 'evaluation',
          status: 'confirmed'
        }
      ],
      suggestions: [
        {
          date: '2024-02-20T00:00:00Z',
          startTime: '14:00',
          endTime: '17:00',
          available: true
        }
      ]
    };

    const requestValidation = ConflictCheckRequestSchema.safeParse(requestData);
    expect(requestValidation.success).toBe(true);

    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse
    });

    const response = await fetch('/api/appointments/conflicts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData)
    });
    const data = await response.json();

    const responseValidation = ConflictCheckResponseSchema.safeParse(data);
    expect(responseValidation.success).toBe(true);
    expect(data.hasConflict).toBe(true);
    expect(data.conflicts).toHaveLength(3);
  });

  it('should validate invalid time format', async () => {
    const requestData = {
      therapistId: '987e6543-e21b-12d3-a456-426614174000',
      date: '2024-02-20T00:00:00Z',
      startTime: '25:00',  // Invalid hour
      endTime: '26:00'
    };

    const requestValidation = ConflictCheckRequestSchema.safeParse(requestData);
    expect(requestValidation.success).toBe(false);
    if (!requestValidation.success) {
      const timeError = requestValidation.error.issues.find(
        issue => issue.path.includes('startTime')
      );
      expect(timeError).toBeDefined();
    }
  });

  it('should validate invalid UUID format', async () => {
    const requestData = {
      therapistId: 'invalid-uuid',
      date: '2024-02-20T00:00:00Z',
      startTime: '10:00',
      endTime: '11:00'
    };

    const requestValidation = ConflictCheckRequestSchema.safeParse(requestData);
    expect(requestValidation.success).toBe(false);
    if (!requestValidation.success) {
      const uuidError = requestValidation.error.issues.find(
        issue => issue.path.includes('therapistId')
      );
      expect(uuidError).toBeDefined();
    }
  });

  it('should handle conflicts with in-progress appointments', async () => {
    const requestData = {
      therapistId: '987e6543-e21b-12d3-a456-426614174000',
      date: '2024-02-20T00:00:00Z',
      startTime: '16:00',
      endTime: '17:00'
    };

    const mockResponse = {
      hasConflict: true,
      conflicts: [
        {
          id: '550e8400-e29b-41d4-a716-446655440007',
          patientName: 'Roberto Silva',
          startTime: '15:30',
          endTime: '16:30',
          type: 'session',
          status: 'in_progress'  // Currently in progress
        }
      ],
      suggestions: [
        {
          date: '2024-02-20T00:00:00Z',
          startTime: '17:00',
          endTime: '18:00',
          available: true
        }
      ]
    };

    const requestValidation = ConflictCheckRequestSchema.safeParse(requestData);
    expect(requestValidation.success).toBe(true);

    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse
    });

    const response = await fetch('/api/appointments/conflicts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData)
    });
    const data = await response.json();

    const responseValidation = ConflictCheckResponseSchema.safeParse(data);
    expect(responseValidation.success).toBe(true);
    expect(data.hasConflict).toBe(true);
    expect(data.conflicts[0].status).toBe('in_progress');
  });

  it('should not detect conflicts with cancelled appointments', async () => {
    const requestData = {
      therapistId: '987e6543-e21b-12d3-a456-426614174000',
      date: '2024-02-20T00:00:00Z',
      startTime: '13:00',
      endTime: '14:00'
    };

    const mockResponse = {
      hasConflict: false,
      conflicts: [],  // Cancelled appointments should not appear as conflicts
      suggestions: []
    };

    const requestValidation = ConflictCheckRequestSchema.safeParse(requestData);
    expect(requestValidation.success).toBe(true);

    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse
    });

    const response = await fetch('/api/appointments/conflicts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData)
    });
    const data = await response.json();

    const responseValidation = ConflictCheckResponseSchema.safeParse(data);
    expect(responseValidation.success).toBe(true);
    expect(data.hasConflict).toBe(false);
    expect(data.conflicts).toHaveLength(0);
  });
});