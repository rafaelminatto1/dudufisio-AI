/**
 * Testes Unitários - Gemini Service
 * Testa funcionalidades de integração com IA do Google Gemini
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as geminiService from '@/services/geminiService';

describe('GeminiService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('generateClinicalMaterialContent', () => {
    it('deve gerar conteúdo para escala de avaliação', async () => {
      const content = await geminiService.generateClinicalMaterialContent({
        nome_material: 'Escala de Dor',
        tipo_material: 'Escala de Avaliação',
      });

      expect(content).toBeTruthy();
      expect(typeof content).toBe('string');
      expect(content.length).toBeGreaterThan(100);
    });

    it('deve gerar conteúdo para protocolo clínico', async () => {
      const content = await geminiService.generateClinicalMaterialContent({
        nome_material: 'Protocolo LCA',
        tipo_material: 'Protocolo Clínico',
      });

      expect(content).toBeTruthy();
      expect(content).toContain('Protocolo LCA');
    });

    it('deve incluir título no conteúdo', async () => {
      const materialName = 'Teste de Material';
      const content = await geminiService.generateClinicalMaterialContent({
        nome_material: materialName,
        tipo_material: 'Protocolo Clínico',
      });

      expect(content).toContain(materialName);
    });

    it('conteúdo deve estar em formato Markdown', async () => {
      const content = await geminiService.generateClinicalMaterialContent({
        nome_material: 'Teste',
        tipo_material: 'Protocolo Clínico',
      });

      // Deve ter headers markdown
      expect(content).toMatch(/#{1,3}\s+/);
    });

    it('deve ter delay de processamento', async () => {
      const start = Date.now();
      
      await geminiService.generateClinicalMaterialContent({
        nome_material: 'Teste',
        tipo_material: 'Protocolo Clínico',
      });
      
      const duration = Date.now() - start;
      expect(duration).toBeGreaterThan(900); // Pelo menos 900ms (delay de 1000ms)
    });
  });

  describe('Funções de IA', () => {
    it('generateTreatmentProtocol deve retornar string', async () => {
      const result = await geminiService.generateTreatmentProtocol();
      expect(typeof result).toBe('string');
    });

    it('generateSoapNote deve retornar string', async () => {
      const result = await geminiService.generateSoapNote();
      expect(typeof result).toBe('string');
    });

    it('analyzePainPatterns deve retornar string', async () => {
      const result = await geminiService.analyzePainPatterns();
      expect(typeof result).toBe('string');
    });

    it('generateClinicalInsights deve retornar string', async () => {
      const result = await geminiService.generateClinicalInsights();
      expect(typeof result).toBe('string');
    });

    it('generatePatientReport deve retornar string', async () => {
      const result = await geminiService.generatePatientReport();
      expect(typeof result).toBe('string');
    });

    it('generateRiskAnalysis deve retornar string', async () => {
      const result = await geminiService.generateRiskAnalysis();
      expect(typeof result).toBe('string');
    });
  });

  describe('parseProtocolForTreatmentPlan', () => {
    it('deve retornar objeto com treatmentGoals', async () => {
      const result = await geminiService.parseProtocolForTreatmentPlan();
      
      expect(result).toHaveProperty('treatmentGoals');
      expect(Array.isArray(result.treatmentGoals)).toBe(true);
    });

    it('deve retornar objeto com exercises', async () => {
      const result = await geminiService.parseProtocolForTreatmentPlan();
      
      expect(result).toHaveProperty('exercises');
      expect(Array.isArray(result.exercises)).toBe(true);
    });
  });

  describe('Content Types', () => {
    it('deve gerar tipo padrão quando não especificado', async () => {
      const content = await geminiService.generateClinicalMaterialContent({
        nome_material: 'Material Genérico',
        tipo_material: 'Outro',
      });

      expect(content).toBeTruthy();
      expect(content).toContain('Material Genérico');
    });
  });

  describe('Content Structure - Escala de Avaliação', () => {
    it('escala deve incluir descrição', async () => {
      const content = await geminiService.generateClinicalMaterialContent({
        nome_material: 'Escala Teste',
        tipo_material: 'Escala de Avaliação',
      });

      expect(content).toContain('Descrição');
    });

    it('escala deve incluir como utilizar', async () => {
      const content = await geminiService.generateClinicalMaterialContent({
        nome_material: 'Escala Teste',
        tipo_material: 'Escala de Avaliação',
      });

      expect(content).toContain('Como Utilizar');
    });

    it('escala deve incluir critérios de interpretação', async () => {
      const content = await geminiService.generateClinicalMaterialContent({
        nome_material: 'Escala Teste',
        tipo_material: 'Escala de Avaliação',
      });

      expect(content).toContain('Interpretação');
    });
  });

  describe('Content Structure - Protocolo Clínico', () => {
    it('protocolo deve incluir objetivo', async () => {
      const content = await geminiService.generateClinicalMaterialContent({
        nome_material: 'Protocolo Teste',
        tipo_material: 'Protocolo Clínico',
      });

      expect(content).toContain('Objetivo');
    });

    it('protocolo deve incluir fases', async () => {
      const content = await geminiService.generateClinicalMaterialContent({
        nome_material: 'Protocolo Teste',
        tipo_material: 'Protocolo Clínico',
      });

      expect(content).toContain('Fase');
    });

    it('protocolo deve incluir contraindicações', async () => {
      const content = await geminiService.generateClinicalMaterialContent({
        nome_material: 'Protocolo Teste',
        tipo_material: 'Protocolo Clínico',
      });

      expect(content).toContain('Contraindicações');
    });
  });
});

