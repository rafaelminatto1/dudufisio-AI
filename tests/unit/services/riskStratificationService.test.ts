/**
 * Testes Unitários - Risk Stratification Service
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { riskStratificationServiceSupabase } from '../../../services/clinical/riskStratificationServiceSupabase';
import { supabase } from '../../../lib/supabase';

describe('RiskStratificationService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAssessments', () => {
    it('deve retornar avaliações de um paciente', async () => {
      const mockData = [
        {
          id: '1',
          patient_id: 'patient-1',
          risk_type: 'fall',
          risk_level: 'moderate',
          score: 75.5,
          confidence: 0.85,
          assessed_at: new Date().toISOString(),
        },
      ];

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn(() => Promise.resolve({ data: mockData, error: null })),
        eq: vi.fn(function() { return this; }),
        order: vi.fn(function() { return this; }),
      } as any);

      const result = await riskStratificationServiceSupabase.getAssessments('patient-1');

      expect(result).toEqual(mockData);
      expect(supabase.from).toHaveBeenCalledWith('risk_assessments');
    });

    it('deve lançar erro quando Supabase falha', async () => {
      const mockError = { message: 'Database error', code: '500' };

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn(() => Promise.resolve({ data: null, error: mockError })),
        eq: vi.fn(function() { return this; }),
        order: vi.fn(function() { return this; }),
      } as any);

      await expect(
        riskStratificationServiceSupabase.getAssessments('patient-1')
      ).rejects.toThrow();
    });

    it('deve retornar array vazio quando não há avaliações', async () => {
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn(() => Promise.resolve({ data: [], error: null })),
        eq: vi.fn(function() { return this; }),
        order: vi.fn(function() { return this; }),
      } as any);

      const result = await riskStratificationServiceSupabase.getAssessments('patient-1');

      expect(result).toEqual([]);
    });
  });

  describe('createAssessment', () => {
    it('deve criar nova avaliação com sucesso', async () => {
      const mockAssessment = {
        patient_id: 'patient-1',
        risk_type: 'fall',
        risk_level: 'moderate',
        score: 80,
        confidence: 0.9,
      };

      const mockResult = { id: '1', ...mockAssessment, created_at: new Date().toISOString() };

      vi.mocked(supabase.from).mockReturnValue({
        insert: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({ data: mockResult, error: null })),
          })),
        })),
      } as any);

      const result = await riskStratificationServiceSupabase.createAssessment(mockAssessment);

      expect(result).toEqual(mockResult);
      expect(supabase.from).toHaveBeenCalledWith('risk_assessments');
    });

    it('deve validar dados antes de criar', async () => {
      const invalidData = {
        patient_id: '',
        score: 150, // Inválido: > 100
      };

      await expect(
        riskStratificationServiceSupabase.createAssessment(invalidData as any)
      ).rejects.toThrow();
    });
  });

  describe('updateAssessment', () => {
    it('deve atualizar avaliação existente', async () => {
      const updates = {
        score: 85,
        risk_level: 'high',
      };

      const mockResult = { 
        id: '1', 
        ...updates, 
        updated_at: new Date().toISOString() 
      };

      vi.mocked(supabase.from).mockReturnValue({
        update: vi.fn(() => ({
          eq: vi.fn(() => ({
            select: vi.fn(() => ({
              single: vi.fn(() => Promise.resolve({ data: mockResult, error: null })),
            })),
          })),
        })),
      } as any);

      const result = await riskStratificationServiceSupabase.updateAssessment('1', updates);

      expect(result).toEqual(mockResult);
    });
  });

  describe('deleteAssessment', () => {
    it('deve deletar avaliação com sucesso', async () => {
      vi.mocked(supabase.from).mockReturnValue({
        delete: vi.fn(() => ({
          eq: vi.fn(() => Promise.resolve({ error: null })),
        })),
      } as any);

      await expect(
        riskStratificationServiceSupabase.deleteAssessment('1')
      ).resolves.not.toThrow();
    });

    it('deve lançar erro se avaliação não existe', async () => {
      const mockError = { message: 'Not found', code: '404' };

      vi.mocked(supabase.from).mockReturnValue({
        delete: vi.fn(() => ({
          eq: vi.fn(() => Promise.resolve({ error: mockError })),
        })),
      } as any);

      await expect(
        riskStratificationServiceSupabase.deleteAssessment('999')
      ).rejects.toThrow();
    });
  });

  describe('getPatientRiskProfile', () => {
    it('deve retornar perfil de risco completo', async () => {
      const mockProfile = {
        id: '1',
        patient_id: 'patient-1',
        overall_risk_level: 'moderate',
        highest_risks: ['fall', 'deconditioning'],
        last_assessment_date: new Date().toISOString(),
      };

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({ data: mockProfile, error: null })),
          })),
        })),
      } as any);

      const result = await riskStratificationServiceSupabase.getPatientRiskProfile('patient-1');

      expect(result).toEqual(mockProfile);
      expect(result.overall_risk_level).toBe('moderate');
      expect(result.highest_risks).toHaveLength(2);
    });
  });

  describe('getActiveAlerts', () => {
    it('deve retornar apenas alertas não resolvidos', async () => {
      const mockAlerts = [
        {
          id: '1',
          patient_id: 'patient-1',
          risk_type: 'fall',
          risk_level: 'high',
          resolved: false,
        },
        {
          id: '2',
          patient_id: 'patient-1',
          risk_type: 'deconditioning',
          risk_level: 'critical',
          resolved: false,
        },
      ];

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn(() => ({
          eq: vi.fn(function() { return this; }),
          order: vi.fn(() => Promise.resolve({ data: mockAlerts, error: null })),
        })),
      } as any);

      const result = await riskStratificationServiceSupabase.getActiveAlerts('patient-1');

      expect(result).toHaveLength(2);
      expect(result.every(alert => !alert.resolved)).toBe(true);
    });
  });
});






