/**
 * Testes Unitários - Evaluation Service
 * Testa funcionalidades de avaliação de exercícios de pacientes
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as evaluationService from '@/services/evaluationService';
import { ExerciseEvaluation } from '@/types';
import { clearStorage } from './__helpers__/testFixtures';

// Mock do sessionStorage
const sessionStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock,
  writable: true,
});

describe('EvaluationService', () => {
  beforeEach(() => {
    clearStorage();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getEvaluationsByPatientId', () => {
    it('deve retornar array vazio para novo paciente', async () => {
      const evaluations = await evaluationService.getEvaluationsByPatientId('new-patient');
      
      expect(evaluations).toBeInstanceOf(Array);
      expect(evaluations).toHaveLength(0);
    });

    it('deve filtrar avaliações por paciente', async () => {
      // Criar avaliações de teste
      await evaluationService.addEvaluation({
        patientId: 'patient-1',
        exerciseId: 'ex-1',
        exerciseName: 'Alongamento',
        painBefore: 7,
        painAfter: 4,
        difficulty: 3,
        notes: 'Teste',
      });

      await evaluationService.addEvaluation({
        patientId: 'patient-2',
        exerciseId: 'ex-1',
        exerciseName: 'Alongamento',
        painBefore: 5,
        painAfter: 3,
        difficulty: 2,
        notes: 'Teste',
      });

      const patient1Evals = await evaluationService.getEvaluationsByPatientId('patient-1');
      
      expect(patient1Evals.length).toBeGreaterThan(0);
      patient1Evals.forEach(evaluation => {
        expect(evaluation.patientId).toBe('patient-1');
      });
    });

    it('cada avaliação deve ter propriedades obrigatórias', async () => {
      await evaluationService.addEvaluation({
        patientId: 'patient-1',
        exerciseId: 'ex-1',
        exerciseName: 'Teste',
        painBefore: 5,
        painAfter: 3,
        difficulty: 2,
        notes: '',
      });

      const evaluations = await evaluationService.getEvaluationsByPatientId('patient-1');
      const requiredProps = ['id', 'date', 'patientId', 'exerciseId', 'painBefore', 'painAfter', 'difficulty'];
      
      evaluations.forEach(evaluation => {
        requiredProps.forEach(prop => {
          expect(evaluation).toHaveProperty(prop);
        });
      });
    });
  });

  describe('addEvaluation', () => {
    it('deve criar nova avaliação', async () => {
      const evalData = {
        patientId: 'patient-1',
        exerciseId: 'ex-1',
        exerciseName: 'Alongamento Cervical',
        painBefore: 7,
        painAfter: 4,
        difficulty: 3,
        notes: 'Paciente executou bem',
      };

      const evaluation = await evaluationService.addEvaluation(evalData);
      
      expect(evaluation).toHaveProperty('id');
      expect(evaluation).toHaveProperty('date');
      expect(evaluation.patientId).toBe(evalData.patientId);
      expect(evaluation.exerciseId).toBe(evalData.exerciseId);
    });

    it('deve gerar ID único', async () => {
      const evalData = {
        patientId: 'patient-1',
        exerciseId: 'ex-1',
        exerciseName: 'Teste',
        painBefore: 5,
        painAfter: 3,
        difficulty: 2,
        notes: '',
      };

      const eval1 = await evaluationService.addEvaluation(evalData);
      const eval2 = await evaluationService.addEvaluation(evalData);
      
      expect(eval1.id).not.toBe(eval2.id);
    });

    it('deve definir data automaticamente', async () => {
      const evaluation = await evaluationService.addEvaluation({
        patientId: 'patient-1',
        exerciseId: 'ex-1',
        exerciseName: 'Teste',
        painBefore: 5,
        painAfter: 3,
        difficulty: 2,
        notes: '',
      });

      expect(evaluation.date).toBeInstanceOf(Date);
      expect(evaluation.date.getTime()).toBeLessThanOrEqual(Date.now());
    });

    it('deve salvar no sessionStorage', async () => {
      await evaluationService.addEvaluation({
        patientId: 'patient-1',
        exerciseId: 'ex-1',
        exerciseName: 'Teste',
        painBefore: 5,
        painAfter: 3,
        difficulty: 2,
        notes: '',
      });

      const stored = sessionStorage.getItem('fisioflow_evaluations');
      expect(stored).toBeTruthy();
      
      if (stored) {
        const evals = JSON.parse(stored);
        expect(evals).toBeInstanceOf(Array);
        expect(evals.length).toBeGreaterThan(0);
      }
    });

    it('deve substituir avaliação do mesmo exercício no mesmo dia', async () => {
      const evalData1 = {
        patientId: 'patient-1',
        exerciseId: 'ex-1',
        exerciseName: 'Teste',
        painBefore: 7,
        painAfter: 5,
        difficulty: 3,
        notes: 'Primeira avaliação',
      };

      const evalData2 = {
        patientId: 'patient-1',
        exerciseId: 'ex-1',
        exerciseName: 'Teste',
        painBefore: 6,
        painAfter: 3,
        difficulty: 2,
        notes: 'Segunda avaliação',
      };

      await evaluationService.addEvaluation(evalData1);
      await evaluationService.addEvaluation(evalData2);

      const evaluations = await evaluationService.getEvaluationsByPatientId('patient-1');
      const exEvaluations = evaluations.filter(e => e.exerciseId === 'ex-1');
      
      // Deve ter apenas 1 avaliação (a mais recente)
      expect(exEvaluations.length).toBe(1);
      expect(exEvaluations[0].notes).toBe('Segunda avaliação');
    });
  });

  describe('Pain Scale', () => {
    it('painBefore deve ser entre 0-10', async () => {
      const evaluation = await evaluationService.addEvaluation({
        patientId: 'patient-1',
        exerciseId: 'ex-1',
        exerciseName: 'Teste',
        painBefore: 7,
        painAfter: 3,
        difficulty: 2,
        notes: '',
      });

      expect(evaluation.painBefore).toBeGreaterThanOrEqual(0);
      expect(evaluation.painBefore).toBeLessThanOrEqual(10);
    });

    it('painAfter deve ser entre 0-10', async () => {
      const evaluation = await evaluationService.addEvaluation({
        patientId: 'patient-1',
        exerciseId: 'ex-1',
        exerciseName: 'Teste',
        painBefore: 7,
        painAfter: 3,
        difficulty: 2,
        notes: '',
      });

      expect(evaluation.painAfter).toBeGreaterThanOrEqual(0);
      expect(evaluation.painAfter).toBeLessThanOrEqual(10);
    });

    it('difficulty deve ser entre 1-5', async () => {
      const evaluation = await evaluationService.addEvaluation({
        patientId: 'patient-1',
        exerciseId: 'ex-1',
        exerciseName: 'Teste',
        painBefore: 5,
        painAfter: 3,
        difficulty: 3,
        notes: '',
      });

      expect(evaluation.difficulty).toBeGreaterThanOrEqual(1);
      expect(evaluation.difficulty).toBeLessThanOrEqual(5);
    });
  });

  describe('Data Persistence', () => {
    it('avaliações devem persistir no sessionStorage', async () => {
      await evaluationService.addEvaluation({
        patientId: 'patient-1',
        exerciseId: 'ex-1',
        exerciseName: 'Teste',
        painBefore: 5,
        painAfter: 3,
        difficulty: 2,
        notes: 'Persistência',
      });

      const stored = sessionStorage.getItem('fisioflow_evaluations');
      expect(stored).toBeTruthy();
    });

    it('deve carregar avaliações do sessionStorage', async () => {
      const testEval = {
        id: 'test-123',
        date: new Date().toISOString(),
        patientId: 'patient-1',
        exerciseId: 'ex-1',
        exerciseName: 'Teste',
        painBefore: 5,
        painAfter: 3,
        difficulty: 2,
        notes: '',
      };

      sessionStorage.setItem('fisioflow_evaluations', JSON.stringify([testEval]));
      
      const evaluations = await evaluationService.getEvaluationsByPatientId('patient-1');
      expect(evaluations.length).toBeGreaterThan(0);
    });
  });

  describe('Performance', () => {
    it('getEvaluationsByPatientId deve responder rapidamente', async () => {
      const start = Date.now();
      await evaluationService.getEvaluationsByPatientId('patient-1');
      const duration = Date.now() - start;
      
      expect(duration).toBeLessThan(400);
    });

    it('addEvaluation deve ser eficiente', async () => {
      const start = Date.now();
      await evaluationService.addEvaluation({
        patientId: 'patient-1',
        exerciseId: 'ex-1',
        exerciseName: 'Teste',
        painBefore: 5,
        painAfter: 3,
        difficulty: 2,
        notes: '',
      });
      const duration = Date.now() - start;
      
      expect(duration).toBeLessThan(500);
    });
  });
});

