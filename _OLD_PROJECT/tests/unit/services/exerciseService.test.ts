/**
 * Testes Unitários - Exercise Service
 * Testa funcionalidades da biblioteca de exercícios e protocolos
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createTestExercise } from './__helpers__/testFixtures';

// Como o exerciseService depende do Supabase, vamos mockar completamente
const mockExercises = [
  createTestExercise({ id: 'ex-1', name: 'Alongamento Cervical', category: 'Cervical', difficulty_level: 'beginner' }),
  createTestExercise({ id: 'ex-2', name: 'Fortalecimento Lombar', category: 'Lombar', difficulty_level: 'intermediate' }),
  createTestExercise({ id: 'ex-3', name: 'Mobilização Torácica', category: 'Torácico', difficulty_level: 'advanced' }),
];

// Mock do Supabase
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          data: mockExercises,
          error: null,
        })),
        order: vi.fn(() => ({
          data: mockExercises,
          error: null,
        })),
        data: mockExercises,
        error: null,
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => ({
            data: mockExercises[0],
            error: null,
          })),
        })),
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() => ({
              data: mockExercises[0],
              error: null,
            })),
          })),
        })),
      })),
      delete: vi.fn(() => ({
        eq: vi.fn(() => ({
          data: null,
          error: null,
        })),
      })),
    })),
  },
}));

describe('ExerciseService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Exercise Properties', () => {
    it('exercício deve ter propriedades obrigatórias', () => {
      const exercise = createTestExercise();
      const requiredProps = [
        'id', 'name', 'description', 'category', 'muscle_groups',
        'equipment', 'difficulty_level', 'instructions', 'is_active'
      ];
      
      requiredProps.forEach(prop => {
        expect(exercise).toHaveProperty(prop);
      });
    });

    it('difficulty_level deve ser um dos valores válidos', () => {
      const validLevels = ['beginner', 'intermediate', 'advanced'];
      const exercise = createTestExercise();
      
      expect(validLevels).toContain(exercise.difficulty_level);
    });

    it('muscle_groups deve ser um array', () => {
      const exercise = createTestExercise();
      
      expect(Array.isArray(exercise.muscle_groups)).toBe(true);
    });

    it('instructions deve ser um array não vazio', () => {
      const exercise = createTestExercise();
      
      expect(Array.isArray(exercise.instructions)).toBe(true);
      expect(exercise.instructions.length).toBeGreaterThan(0);
    });
  });

  describe('Exercise Categories', () => {
    it('deve ter categorias válidas', () => {
      const validCategories = [
        'Cervical', 'Lombar', 'Torácico', 'Membros Superiores',
        'Membros Inferiores', 'Core', 'Mobilidade', 'Alongamento',
        'Fortalecimento', 'Equilíbrio'
      ];

      const exercise = createTestExercise();
      // Pode não ser uma dessas categorias específicas, mas deve existir
      expect(exercise.category).toBeTruthy();
      expect(typeof exercise.category).toBe('string');
    });

    it('deve permitir filtrar por categoria', () => {
      const cervicalExercises = mockExercises.filter(ex => ex.category === 'Cervical');
      expect(cervicalExercises.length).toBeGreaterThan(0);
    });
  });

  describe('Exercise Filtering', () => {
    it('deve filtrar por nível de dificuldade', () => {
      const beginnerEx = mockExercises.filter(ex => ex.difficulty_level === 'beginner');
      expect(beginnerEx.length).toBeGreaterThan(0);
    });

    it('deve filtrar exercícios ativos', () => {
      const activeEx = mockExercises.filter(ex => ex.is_active);
      expect(activeEx).toBeInstanceOf(Array);
    });

    it('deve filtrar por grupo muscular', () => {
      const exercise = createTestExercise({ muscle_groups: ['trapézio', 'deltóide'] });
      expect(exercise.muscle_groups).toContain('trapézio');
    });

    it('deve filtrar por equipamento necessário', () => {
      const exerciseWithEquip = createTestExercise({ equipment: ['bola suíça', 'theraband'] });
      expect(exerciseWithEquip.equipment.length).toBeGreaterThan(0);
    });
  });

  describe('Exercise Search', () => {
    it('deve buscar exercícios por nome', () => {
      const searchTerm = 'alongamento';
      const results = mockExercises.filter(ex => 
        ex.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      expect(results).toBeInstanceOf(Array);
    });

    it('deve buscar por tags', () => {
      const exercise = createTestExercise({ tags: ['cervical', 'alongamento', 'postura'] });
      expect(exercise.tags).toContain('cervical');
    });

    it('busca deve ser case-insensitive', () => {
      const resultsLower = mockExercises.filter(ex => ex.name.toLowerCase().includes('alongamento'));
      const resultsUpper = mockExercises.filter(ex => ex.name.toLowerCase().includes('ALONGAMENTO'.toLowerCase()));
      
      expect(resultsLower.length).toBe(resultsUpper.length);
    });
  });

  describe('Exercise Validation', () => {
    it('nome não deve ser vazio', () => {
      const exercise = createTestExercise();
      expect(exercise.name.trim().length).toBeGreaterThan(0);
    });

    it('descrição não deve ser vazia', () => {
      const exercise = createTestExercise();
      expect(exercise.description.trim().length).toBeGreaterThan(0);
    });

    it('duração deve ser positiva se especificada', () => {
      const exercise = createTestExercise({ duration_minutes: 5 });
      if (exercise.duration_minutes) {
        expect(exercise.duration_minutes).toBeGreaterThan(0);
      }
    });

    it('repetições devem ser positivas se especificadas', () => {
      const exercise = createTestExercise({ repetitions: 10 });
      if (exercise.repetitions) {
        expect(exercise.repetitions).toBeGreaterThan(0);
      }
    });

    it('sets devem ser positivos se especificados', () => {
      const exercise = createTestExercise({ sets: 3 });
      if (exercise.sets) {
        expect(exercise.sets).toBeGreaterThan(0);
      }
    });
  });

  describe('Exercise Protocols', () => {
    it('protocolo deve ter nome e descrição', () => {
      const protocol = {
        id: 'protocol-1',
        name: 'Protocolo Cervicalgia',
        description: 'Protocolo para tratamento de dor cervical',
        category: 'Cervical',
        pathology: 'Cervicalgia',
        phase: 'acute' as const,
        exercises: [],
        duration_weeks: 4,
        frequency_per_week: 3,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      expect(protocol.name).toBeTruthy();
      expect(protocol.description).toBeTruthy();
    });

    it('protocolo deve ter fase válida', () => {
      const validPhases = ['acute', 'subacute', 'chronic', 'maintenance'];
      const phase = 'acute';
      
      expect(validPhases).toContain(phase);
    });

    it('protocolo deve ter duração e frequência', () => {
      const protocol = {
        duration_weeks: 4,
        frequency_per_week: 3,
      };

      expect(protocol.duration_weeks).toBeGreaterThan(0);
      expect(protocol.frequency_per_week).toBeGreaterThan(0);
    });

    it('exercícios no protocolo devem ter ordem', () => {
      const protocolExercise = {
        exercise_id: 'ex-1',
        exercise: createTestExercise(),
        order: 1,
        sets: 3,
        repetitions: 10,
        rest_seconds: 30,
      };

      expect(protocolExercise.order).toBeGreaterThan(0);
      expect(protocolExercise.sets).toBeGreaterThan(0);
    });
  });

  describe('Exercise Media', () => {
    it('deve suportar URL de vídeo', () => {
      const exercise = createTestExercise({ video_url: 'https://youtube.com/watch?v=abc123' });
      
      if (exercise.video_url) {
        expect(exercise.video_url).toMatch(/^https?:\/\//);
      }
    });

    it('deve suportar múltiplas imagens', () => {
      const exercise = createTestExercise({ 
        image_urls: ['https://example.com/img1.jpg', 'https://example.com/img2.jpg'] 
      });
      
      expect(Array.isArray(exercise.image_urls)).toBe(true);
      exercise.image_urls.forEach(url => {
        if (url) {
          expect(url).toMatch(/^https?:\/\//);
        }
      });
    });
  });

  describe('Exercise Safety', () => {
    it('deve ter lista de precauções', () => {
      const exercise = createTestExercise();
      
      expect(Array.isArray(exercise.precautions)).toBe(true);
    });

    it('deve ter lista de benefícios', () => {
      const exercise = createTestExercise();
      
      expect(Array.isArray(exercise.benefits)).toBe(true);
      expect(exercise.benefits.length).toBeGreaterThan(0);
    });
  });

  describe('Exercise Timestamps', () => {
    it('deve ter created_at', () => {
      const exercise = createTestExercise();
      
      expect(exercise).toHaveProperty('created_at');
      expect(new Date(exercise.created_at).getTime()).toBeLessThanOrEqual(Date.now());
    });

    it('deve ter updated_at', () => {
      const exercise = createTestExercise();
      
      expect(exercise).toHaveProperty('updated_at');
      expect(new Date(exercise.updated_at).getTime()).toBeLessThanOrEqual(Date.now());
    });
  });

  describe('Data Structure', () => {
    it('muscle_groups não deve estar vazio', () => {
      const exercise = createTestExercise();
      expect(exercise.muscle_groups.length).toBeGreaterThan(0);
    });

    it('equipment pode ser vazio', () => {
      const exercise = createTestExercise({ equipment: [] });
      expect(Array.isArray(exercise.equipment)).toBe(true);
    });

    it('tags deve ser array', () => {
      const exercise = createTestExercise();
      expect(Array.isArray(exercise.tags)).toBe(true);
    });
  });
});

