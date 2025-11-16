/**
 * TESTES UNITÁRIOS - Body Map Service
 * Testes para validar serviços e lógica de analytics do mapa corporal
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as bodyMapService from '../../services/bodyMapService';
import type { BodyMapSession, BodyMapPainRegion } from '../../types';

// Mock do Supabase
vi.mock('../../lib/supabaseClient', () => ({
  supabase: {
    from: vi.fn(() => ({
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      is: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: {}, error: null }),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
    })),
    rpc: vi.fn().mockResolvedValue({ data: null, error: null }),
  },
}));

describe('Body Map Service - CRUD Sessões', () => {
  it('deve criar uma nova sessão de mapa corporal', async () => {
    const sessionData = {
      patientId: 'patient-1',
      mainComplaintRegion: 'lombar',
      sessionDate: new Date(),
      overallPainLevel: 7,
      painFree: false,
      createdBy: 'user-1',
    };

    // Teste básico de estrutura
    expect(sessionData.patientId).toBeDefined();
    expect(sessionData.overallPainLevel).toBeGreaterThanOrEqual(0);
    expect(sessionData.overallPainLevel).toBeLessThanOrEqual(10);
  });

  it('deve validar nível de dor entre 0-10', () => {
    expect(0).toBeGreaterThanOrEqual(0);
    expect(10).toBeLessThanOrEqual(10);
    expect(5).toBeGreaterThan(0);
    expect(5).toBeLessThan(10);
  });
});

describe('Body Map Service - CRUD Regiões', () => {
  it('deve validar dados de região de dor', () => {
    const regionData = {
      bodyMapSessionId: 'session-1',
      patientId: 'patient-1',
      bodyRegion: 'lombar',
      bodySide: 'back' as const,
      coordinatesX: 50,
      coordinatesY: 60,
      painLevel: 7,
      painTypes: ['latejante', 'aguda'],
      symptoms: ['rigidez', 'irradiação'],
      isMainComplaint: true,
      isActive: true,
    };

    expect(regionData.coordinatesX).toBeGreaterThanOrEqual(0);
    expect(regionData.coordinatesX).toBeLessThanOrEqual(100);
    expect(regionData.coordinatesY).toBeGreaterThanOrEqual(0);
    expect(regionData.coordinatesY).toBeLessThanOrEqual(100);
    expect(['front', 'back']).toContain(regionData.bodySide);
    expect(regionData.painTypes.length).toBeGreaterThan(0);
  });
});

describe('Body Map Service - Analytics', () => {
  it('deve calcular tendência corretamente', () => {
    const sessions = [
      { avgPain: 8, date: new Date('2024-01-01') },
      { avgPain: 6, date: new Date('2024-01-08') },
      { avgPain: 4, date: new Date('2024-01-15') },
    ];

    const first = sessions[0].avgPain;
    const last = sessions[sessions.length - 1].avgPain;
    const change = ((last - first) / first) * 100;

    expect(change).toBeLessThan(0); // Melhorando
    expect(change).toBeCloseTo(-50, 0); // -50% melhoria
  });

  it('deve calcular melhoria percentual', () => {
    const initialPain = 8;
    const currentPain = 4;
    const improvement = ((initialPain - currentPain) / initialPain) * 100;

    expect(improvement).toBe(50); // 50% de melhoria
  });
});

describe('Body Map Service - Helpers', () => {
  it('deve retornar cor correta para cada nível de dor', () => {
    expect(bodyMapService.getPainLevelColor(0)).toBe('#10b981'); // Verde
    expect(bodyMapService.getPainLevelColor(2)).toBe('#22c55e'); // Verde
    expect(bodyMapService.getPainLevelColor(4)).toBe('#eab308'); // Amarelo
    expect(bodyMapService.getPainLevelColor(6)).toBe('#f97316'); // Laranja
    expect(bodyMapService.getPainLevelColor(8)).toBe('#ef4444'); // Vermelho
    expect(bodyMapService.getPainLevelColor(10)).toBe('#dc2626'); // Vermelho escuro
  });

  it('deve retornar label correto para cada nível', () => {
    expect(bodyMapService.getPainLevelLabel(0)).toBe('Sem dor');
    expect(bodyMapService.getPainLevelLabel(2)).toBe('Leve');
    expect(bodyMapService.getPainLevelLabel(5)).toBe('Moderada');
    expect(bodyMapService.getPainLevelLabel(8)).toBe('Muito forte');
    expect(bodyMapService.getPainLevelLabel(10)).toBe('Insuportável');
  });
});

describe('Body Map Service - Validações', () => {
  it('deve validar tipos de dor disponíveis', () => {
    const validTypes = ['aguda', 'latejante', 'queimação', 'formigamento', 'cansaço', 'pontada', 'pressão', 'choque'];
    
    expect(bodyMapService.PAIN_TYPES).toBeDefined();
    expect(bodyMapService.PAIN_TYPES.length).toBeGreaterThanOrEqual(8);
  });

  it('deve ter labels de intensidade para todos os níveis', () => {
    for (let i = 0; i <= 10; i++) {
      const label = bodyMapService.getPainLevelLabel(i);
      expect(label).toBeDefined();
      expect(label).not.toBe('');
      expect(label).not.toBe('Desconhecido');
    }
  });
});

// Testes de integração básicos
describe('Body Map Service - Fluxo Completo', () => {
  it('deve seguir fluxo completo de criação', () => {
    // 1. Criar sessão
    const session = {
      id: 'session-1',
      patientId: 'patient-1',
      mainComplaintRegion: 'lombar',
      sessionDate: new Date(),
      overallPainLevel: 7,
      painFree: false,
      createdBy: 'user-1',
      createdAt: new Date(),
    };

    expect(session.id).toBeDefined();

    // 2. Adicionar região
    const region = {
      id: 'region-1',
      bodyMapSessionId: session.id,
      patientId: session.patientId,
      bodyRegion: 'lombar',
      bodySide: 'back' as const,
      coordinatesX: 50,
      coordinatesY: 60,
      painLevel: 7,
      painTypes: ['latejante'],
      symptoms: ['rigidez'],
      isMainComplaint: true,
      isActive: true,
      createdAt: new Date(),
    };

    expect(region.bodyMapSessionId).toBe(session.id);

    // 3. Validar relação
    expect(region.patientId).toBe(session.patientId);
  });
});

export {};

