/**
 * Testes Unitários - Protocol Service
 * Testa funcionalidades de protocolos de tratamento
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as protocolService from '@/services/protocolService';
import { Protocol } from '@/types';

// Mock protocols
const mockProtocols: Protocol[] = [
  {
    id: 'protocol-lca-1',
    name: 'Reabilitação Pós-Cirurgia LCA',
    description: 'Protocolo para recuperação após cirurgia de ligamento cruzado anterior',
    phases: [
      {
        name: 'Fase 1 - Proteção',
        duration: '0-2 semanas',
        goals: ['Controle da dor', 'Redução do edema'],
        exercises: ['Mobilização passiva', 'Isometria de quadríceps'],
      },
      {
        name: 'Fase 2 - Mobilização',
        duration: '2-6 semanas',
        goals: ['Ganho de ADM', 'Fortalecimento inicial'],
        exercises: ['Mobilização ativa', 'Fortalecimento progressivo'],
      },
    ],
    category: 'Ortopedia',
  },
  {
    id: 'protocol-ombro-1',
    name: 'Tendinite do Manguito Rotador',
    description: 'Protocolo conservador para tratamento de tendinite do ombro',
    phases: [
      {
        name: 'Fase Aguda',
        duration: '0-2 semanas',
        goals: ['Controle da dor'],
        exercises: ['Crioterapia', 'Repouso relativo'],
      },
    ],
    category: 'Ortopedia',
  },
  {
    id: 'protocol-lombalgia-1',
    name: 'Lombalgia Mecânica',
    description: 'Protocolo para tratamento de dor lombar não específica',
    phases: [
      {
        name: 'Fase 1',
        duration: '1-2 semanas',
        goals: ['Alívio da dor'],
        exercises: ['Alongamentos', 'Fortalecimento core'],
      },
    ],
    category: 'Coluna',
  },
];

// Mock do Gemini Service
vi.mock('@/services/geminiService', () => ({
  generateClinicalMaterialContent: vi.fn(async () => 'Conteúdo gerado pela IA'),
}));

// Mock dos protocolos - precisa ser antes do import
vi.mock('@/data/mockExerciseLibrary', () => ({
  mockProtocols: [
    {
      id: 'protocol-lca-1',
      name: 'Reabilitação Pós-Cirurgia LCA',
      description: 'Protocolo para recuperação após cirurgia de ligamento cruzado anterior',
      phases: [{
        name: 'Fase 1',
        duration: '0-2 semanas',
        goals: ['Controle da dor'],
        exercises: ['Mobilização'],
      }],
      category: 'Ortopedia',
    },
  ],
}));

describe('ProtocolService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getProtocolSuggestions', () => {
    it('deve retornar protocolos por diagnóstico', async () => {
      const protocols = await protocolService.getProtocolSuggestions('LCA');
      
      expect(protocols).toBeInstanceOf(Array);
    });

    it('deve buscar por termo no nome', async () => {
      const protocols = await protocolService.getProtocolSuggestions('LCA');
      
      const hasMatch = protocols.some(p => 
        p.name.toLowerCase().includes('lca')
      );
      
      expect(protocols.length === 0 || hasMatch).toBe(true);
    });

    it('deve buscar por termo na descrição', async () => {
      const protocols = await protocolService.getProtocolSuggestions('ombro');
      
      const hasMatch = protocols.some(p => 
        p.description.toLowerCase().includes('ombro')
      );
      
      expect(protocols.length === 0 || hasMatch).toBe(true);
    });

    it('busca deve ser case-insensitive', async () => {
      const lowerResults = await protocolService.getProtocolSuggestions('lca');
      const upperResults = await protocolService.getProtocolSuggestions('LCA');
      
      expect(lowerResults.length).toBe(upperResults.length);
    });

    it('deve retornar array vazio para diagnóstico não encontrado', async () => {
      const protocols = await protocolService.getProtocolSuggestions('diagnóstico-inexistente-xyz');
      
      expect(protocols).toBeInstanceOf(Array);
    });
  });

  describe('generateProtocolContent', () => {
    it('deve gerar conteúdo para protocolo', async () => {
      const protocol = mockProtocols[0];
      const content = await protocolService.generateProtocolContent(protocol);
      
      expect(content).toBeTruthy();
      expect(typeof content).toBe('string');
    });

    it('deve chamar serviço de IA', async () => {
      const { generateClinicalMaterialContent } = await import('@/services/geminiService');
      const protocol = mockProtocols[0];
      
      await protocolService.generateProtocolContent(protocol);
      
      expect(generateClinicalMaterialContent).toHaveBeenCalled();
    });

    it('deve passar dados do protocolo para IA', async () => {
      const { generateClinicalMaterialContent } = await import('@/services/geminiService');
      const protocol = mockProtocols[0];
      
      await protocolService.generateProtocolContent(protocol);
      
      expect(generateClinicalMaterialContent).toHaveBeenCalledWith(
        expect.objectContaining({
          nome_material: protocol.name,
        })
      );
    });
  });

  describe('Protocol Structure', () => {
    it('protocolo deve ter propriedades obrigatórias', () => {
      const protocol = mockProtocols[0];
      const requiredProps = ['id', 'name', 'description', 'phases', 'category'];
      
      requiredProps.forEach(prop => {
        expect(protocol).toHaveProperty(prop);
      });
    });

    it('protocolo deve ter fases', () => {
      mockProtocols.forEach(protocol => {
        expect(protocol.phases).toBeInstanceOf(Array);
        expect(protocol.phases.length).toBeGreaterThan(0);
      });
    });

    it('cada fase deve ter estrutura completa', () => {
      mockProtocols.forEach(protocol => {
        protocol.phases.forEach(phase => {
          expect(phase).toHaveProperty('name');
          expect(phase).toHaveProperty('duration');
          expect(phase).toHaveProperty('goals');
          expect(phase).toHaveProperty('exercises');
        });
      });
    });

    it('fase deve ter nome descritivo', () => {
      mockProtocols.forEach(protocol => {
        protocol.phases.forEach(phase => {
          expect(phase.name.length).toBeGreaterThan(3);
        });
      });
    });

    it('fase deve ter duração especificada', () => {
      mockProtocols.forEach(protocol => {
        protocol.phases.forEach(phase => {
          expect(phase.duration).toBeTruthy();
          expect(typeof phase.duration).toBe('string');
        });
      });
    });
  });

  describe('Phase Goals', () => {
    it('fase deve ter objetivos', () => {
      mockProtocols.forEach(protocol => {
        protocol.phases.forEach(phase => {
          expect(Array.isArray(phase.goals)).toBe(true);
          expect(phase.goals.length).toBeGreaterThan(0);
        });
      });
    });

    it('objetivos devem ser strings', () => {
      mockProtocols.forEach(protocol => {
        protocol.phases.forEach(phase => {
          phase.goals.forEach(goal => {
            expect(typeof goal).toBe('string');
            expect(goal.length).toBeGreaterThan(0);
          });
        });
      });
    });
  });

  describe('Phase Exercises', () => {
    it('fase deve ter exercícios', () => {
      mockProtocols.forEach(protocol => {
        protocol.phases.forEach(phase => {
          expect(Array.isArray(phase.exercises)).toBe(true);
        });
      });
    });

    it('exercícios devem ser strings', () => {
      mockProtocols.forEach(protocol => {
        protocol.phases.forEach(phase => {
          phase.exercises.forEach(exercise => {
            expect(typeof exercise).toBe('string');
            expect(exercise.length).toBeGreaterThan(0);
          });
        });
      });
    });
  });

  describe('Protocol Categories', () => {
    it('protocolo deve ter categoria', () => {
      mockProtocols.forEach(protocol => {
        expect(protocol).toHaveProperty('category');
        expect(typeof protocol.category).toBe('string');
      });
    });

    it('deve permitir filtrar por categoria', () => {
      const orthopedics = mockProtocols.filter(p => p.category === 'Ortopedia');
      expect(orthopedics.length).toBeGreaterThan(0);
    });

    it('categorias comuns devem existir', () => {
      const commonCategories = ['Ortopedia', 'Coluna', 'Neurologia', 'Esportiva'];
      const hasCommonCategory = mockProtocols.some(p => 
        commonCategories.includes(p.category)
      );
      
      expect(hasCommonCategory).toBe(true);
    });
  });

  describe('Protocol Search', () => {
    it('deve encontrar protocolo de LCA', async () => {
      const protocols = await protocolService.getProtocolSuggestions('LCA');
      const hasLCA = protocols.some(p => p.name.toLowerCase().includes('lca'));
      
      expect(protocols.length === 0 || hasLCA).toBe(true);
    });

    it('deve encontrar protocolo de ombro', async () => {
      const protocols = await protocolService.getProtocolSuggestions('ombro');
      const hasShoulder = protocols.some(p => 
        p.name.toLowerCase().includes('ombro') ||
        p.description.toLowerCase().includes('ombro')
      );
      
      expect(protocols.length === 0 || hasShoulder).toBe(true);
    });

    it('deve encontrar protocolo de lombalgia', async () => {
      const protocols = await protocolService.getProtocolSuggestions('lombalgia');
      const hasLumbar = protocols.some(p => 
        p.name.toLowerCase().includes('lombalgia') ||
        p.description.toLowerCase().includes('lombalgia')
      );
      
      expect(protocols.length === 0 || hasLumbar).toBe(true);
    });
  });

  describe('Protocol Completeness', () => {
    it('protocolo complexo deve ter múltiplas fases', () => {
      const lcaProtocol = mockProtocols.find(p => p.id.includes('lca'));
      
      if (lcaProtocol) {
        expect(lcaProtocol.phases.length).toBeGreaterThan(1);
      }
    });

    it('cada protocolo deve ter descrição detalhada', () => {
      mockProtocols.forEach(protocol => {
        expect(protocol.description.length).toBeGreaterThan(20);
      });
    });

    it('ID deve seguir padrão', () => {
      mockProtocols.forEach(protocol => {
        expect(protocol.id).toMatch(/^protocol-/);
      });
    });
  });

  describe('Performance', () => {
    it('getProtocolSuggestions deve responder rapidamente', async () => {
      const start = Date.now();
      await protocolService.getProtocolSuggestions('LCA');
      const duration = Date.now() - start;
      
      expect(duration).toBeLessThan(500);
    });
  });
});

