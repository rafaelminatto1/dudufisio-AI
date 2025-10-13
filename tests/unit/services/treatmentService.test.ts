/**
 * Testes Unitários - Treatment Service
 * Testa funcionalidades de planos de tratamento
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as treatmentService from '@/services/treatmentService';
import { TreatmentPlan, ExercisePrescription } from '@/types';

// Mock data
const mockExercisePrescriptions: ExercisePrescription[] = [
  {
    id: 'ex-1',
    treatmentPlanId: 'plan-1',
    exerciseName: 'Alongamento Cervical',
    sets: 3,
    repetitions: 10,
    resistanceLevel: 'Leve',
    progressionCriteria: 'Aumentar para 15 reps',
  },
  {
    id: 'ex-2',
    treatmentPlanId: 'plan-1',
    exerciseName: 'Fortalecimento Ombro',
    sets: 3,
    repetitions: 12,
    resistanceLevel: 'Moderado',
    progressionCriteria: 'Adicionar theraband',
  },
];

const mockTreatmentPlans: TreatmentPlan[] = [
  {
    id: 'plan-1',
    patientId: 'patient-1',
    diagnosis: 'Tendinite do Supraespinhal',
    treatmentGoals: ['Reduzir dor', 'Recuperar amplitude de movimento'],
    exercises: mockExercisePrescriptions,
  },
];

vi.mock('@/services/mockDb', () => ({
  db: {
    getTreatmentPlans: vi.fn(() => mockTreatmentPlans),
    getExercisePrescriptions: vi.fn(() => mockExercisePrescriptions),
    updateTreatmentPlan: vi.fn(),
    setExercisePrescriptionsForPlan: vi.fn(),
  },
}));

vi.mock('@/services/eventService', () => ({
  eventService: {
    emit: vi.fn(),
  },
}));

describe('TreatmentService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getPlanByPatientId', () => {
    it('deve retornar plano de tratamento do paciente', async () => {
      const plan = await treatmentService.getPlanByPatientId('patient-1');
      
      expect(plan).toBeTruthy();
      expect(plan?.patientId).toBe('patient-1');
    });

    it('deve incluir exercícios no plano', async () => {
      const plan = await treatmentService.getPlanByPatientId('patient-1');
      
      expect(plan?.exercises).toBeInstanceOf(Array);
      expect(plan?.exercises.length).toBeGreaterThan(0);
    });

    it('deve retornar undefined para paciente sem plano', async () => {
      const plan = await treatmentService.getPlanByPatientId('patient-sem-plano');
      
      expect(plan).toBeUndefined();
    });

    it('plano deve ter diagnóstico', async () => {
      const plan = await treatmentService.getPlanByPatientId('patient-1');
      
      expect(plan).toHaveProperty('diagnosis');
      expect(typeof plan?.diagnosis).toBe('string');
    });

    it('plano deve ter objetivos de tratamento', async () => {
      const plan = await treatmentService.getPlanByPatientId('patient-1');
      
      expect(plan).toHaveProperty('treatmentGoals');
      expect(Array.isArray(plan?.treatmentGoals)).toBe(true);
      expect(plan?.treatmentGoals.length).toBeGreaterThan(0);
    });
  });

  describe('getExercisesByPlanId', () => {
    it('deve retornar exercícios de um plano', async () => {
      const exercises = await treatmentService.getExercisesByPlanId('plan-1');
      
      expect(exercises).toBeInstanceOf(Array);
      expect(exercises.length).toBeGreaterThan(0);
    });

    it('exercícios devem pertencer ao plano correto', async () => {
      const exercises = await treatmentService.getExercisesByPlanId('plan-1');
      
      exercises.forEach(ex => {
        expect(ex.treatmentPlanId).toBe('plan-1');
      });
    });

    it('deve retornar array vazio para plano sem exercícios', async () => {
      const exercises = await treatmentService.getExercisesByPlanId('plan-inexistente');
      
      expect(exercises).toBeInstanceOf(Array);
      expect(exercises).toHaveLength(0);
    });

    it('cada exercício deve ter propriedades obrigatórias', async () => {
      const exercises = await treatmentService.getExercisesByPlanId('plan-1');
      const requiredProps = ['id', 'treatmentPlanId', 'exerciseName', 'sets', 'repetitions'];
      
      exercises.forEach(ex => {
        requiredProps.forEach(prop => {
          expect(ex).toHaveProperty(prop);
        });
      });
    });
  });

  describe('updatePlan', () => {
    it('deve atualizar objetivos do plano', async () => {
      const updates = {
        treatmentGoals: ['Novo objetivo 1', 'Novo objetivo 2'],
      };

      const updatedPlan = await treatmentService.updatePlan('patient-1', updates);
      
      expect(updatedPlan.treatmentGoals).toEqual(updates.treatmentGoals);
    });

    it('deve atualizar exercícios do plano', async () => {
      const updates = {
        exercises: [
          {
            exerciseName: 'Novo Exercício',
            sets: 2,
            repetitions: 15,
          },
        ],
      };

      const updatedPlan = await treatmentService.updatePlan('patient-1', updates);
      
      expect(updatedPlan.exercises.length).toBeGreaterThan(0);
    });

    it('deve emitir evento ao atualizar', async () => {
      const { eventService } = await import('@/services/eventService');
      
      await treatmentService.updatePlan('patient-1', {
        treatmentGoals: ['Teste'],
      });
      
      expect(eventService.emit).toHaveBeenCalledWith('treatmentPlans:changed');
    });

    it('deve falhar para paciente inexistente', async () => {
      await expect(
        treatmentService.updatePlan('patient-inexistente', { treatmentGoals: ['Teste'] })
      ).rejects.toThrow('Plano de tratamento não encontrado');
    });

    it('deve manter dados não atualizados', async () => {
      const originalPlan = await treatmentService.getPlanByPatientId('patient-1');
      
      const updatedPlan = await treatmentService.updatePlan('patient-1', {
        treatmentGoals: ['Novo objetivo'],
      });
      
      expect(updatedPlan.patientId).toBe(originalPlan?.patientId);
      expect(updatedPlan.diagnosis).toBe(originalPlan?.diagnosis);
    });
  });

  describe('Exercise Prescriptions', () => {
    it('prescrição deve ter sets e repetitions', () => {
      const ex = mockExercisePrescriptions[0];
      expect(ex).toHaveProperty('sets');
      expect(ex).toHaveProperty('repetitions');
      expect(ex.sets).toBeGreaterThan(0);
      expect(ex.repetitions).toBeGreaterThan(0);
    });

    it('prescrição deve ter nível de resistência', () => {
      const ex = mockExercisePrescriptions[0];
      expect(ex).toHaveProperty('resistanceLevel');
      expect(typeof ex.resistanceLevel).toBe('string');
    });

    it('prescrição deve ter critérios de progressão', () => {
      const ex = mockExercisePrescriptions[0];
      expect(ex).toHaveProperty('progressionCriteria');
      expect(typeof ex.progressionCriteria).toBe('string');
    });

    it('exercícios devem ter IDs únicos', () => {
      const ids = mockExercisePrescriptions.map(ex => ex.id);
      const uniqueIds = new Set(ids);
      
      expect(uniqueIds.size).toBe(ids.length);
    });
  });

  describe('Treatment Goals', () => {
    it('objetivos devem ser array de strings', () => {
      const plan = mockTreatmentPlans[0];
      expect(Array.isArray(plan.treatmentGoals)).toBe(true);
      
      plan.treatmentGoals.forEach(goal => {
        expect(typeof goal).toBe('string');
      });
    });

    it('deve ter pelo menos um objetivo', () => {
      const plan = mockTreatmentPlans[0];
      expect(plan.treatmentGoals.length).toBeGreaterThan(0);
    });

    it('objetivos devem ser específicos', () => {
      const plan = mockTreatmentPlans[0];
      
      plan.treatmentGoals.forEach(goal => {
        expect(goal.length).toBeGreaterThan(5);
      });
    });
  });

  describe('Performance', () => {
    it('getPlanByPatientId deve responder rapidamente', async () => {
      const start = Date.now();
      await treatmentService.getPlanByPatientId('patient-1');
      const duration = Date.now() - start;
      
      expect(duration).toBeLessThan(800);
    });

    it('getExercisesByPlanId deve ser eficiente', async () => {
      const start = Date.now();
      await treatmentService.getExercisesByPlanId('plan-1');
      const duration = Date.now() - start;
      
      expect(duration).toBeLessThan(500);
    });

    it('updatePlan deve processar rapidamente', async () => {
      const start = Date.now();
      await treatmentService.updatePlan('patient-1', { treatmentGoals: ['Teste'] });
      const duration = Date.now() - start;
      
      expect(duration).toBeLessThan(600);
    });
  });
});

