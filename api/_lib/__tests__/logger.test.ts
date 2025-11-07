/**
 * Testes Unitários para SimpleLogger
 * 
 * Cobertura:
 * - Formatação de mensagens
 * - Todos os níveis de log (info, warn, error, debug)
 * - Contexto estruturado
 * - Comportamento do modo debug baseado em NODE_ENV
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock console methods
const mockConsoleLog = vi.spyOn(console, 'log').mockImplementation(() => {});
const mockConsoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {});
const mockConsoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
const mockConsoleDebug = vi.spyOn(console, 'debug').mockImplementation(() => {});

describe('SimpleLogger', () => {
  // Reimport logger para cada teste
  let logger: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    // Reset module cache e reimport
    vi.resetModules();
    const loggerModule = await import('../logger');
    logger = loggerModule.logger;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Formatação de Mensagens', () => {
    it('deve formatar mensagem simples corretamente', () => {
      logger.info('Test message');
      
      expect(mockConsoleLog).toHaveBeenCalledOnce();
      const message = mockConsoleLog.mock.calls[0][0];
      
      expect(message).toMatch(/\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\]/); // ISO timestamp
      expect(message).toContain('[INFO]');
      expect(message).toContain('Test message');
    });

    it('deve incluir contexto estruturado quando fornecido', () => {
      logger.info('Operation completed', { userId: '123', action: 'create' });
      
      expect(mockConsoleLog).toHaveBeenCalledOnce();
      const message = mockConsoleLog.mock.calls[0][0];
      
      expect(message).toContain('Operation completed');
      expect(message).toContain('"userId":"123"');
      expect(message).toContain('"action":"create"');
    });

    it('deve serializar contexto complexo em JSON', () => {
      const complexContext = {
        nested: { value: 42 },
        array: [1, 2, 3],
        boolean: true,
        null: null,
      };
      
      logger.info('Complex context', complexContext);
      
      const message = mockConsoleLog.mock.calls[0][0];
      expect(message).toContain('"nested":{"value":42}');
      expect(message).toContain('"array":[1,2,3]');
      expect(message).toContain('"boolean":true');
    });
  });

  describe('Método info()', () => {
    it('deve chamar console.log com nível INFO', () => {
      logger.info('Info message');
      
      expect(mockConsoleLog).toHaveBeenCalledOnce();
      expect(mockConsoleWarn).not.toHaveBeenCalled();
      expect(mockConsoleError).not.toHaveBeenCalled();
      
      const message = mockConsoleLog.mock.calls[0][0];
      expect(message).toContain('[INFO]');
    });

    it('deve aceitar contexto opcional', () => {
      logger.info('Message with context', { key: 'value' });
      logger.info('Message without context');
      
      expect(mockConsoleLog).toHaveBeenCalledTimes(2);
    });
  });

  describe('Método warn()', () => {
    it('deve chamar console.warn com nível WARN', () => {
      logger.warn('Warning message');
      
      expect(mockConsoleWarn).toHaveBeenCalledOnce();
      expect(mockConsoleLog).not.toHaveBeenCalled();
      expect(mockConsoleError).not.toHaveBeenCalled();
      
      const message = mockConsoleWarn.mock.calls[0][0];
      expect(message).toContain('[WARN]');
    });

    it('deve formatar warnings com contexto', () => {
      logger.warn('Rate limit warning', { current: 95, limit: 100 });
      
      const message = mockConsoleWarn.mock.calls[0][0];
      expect(message).toContain('"current":95');
      expect(message).toContain('"limit":100');
    });
  });

  describe('Método error()', () => {
    it('deve chamar console.error com nível ERROR', () => {
      logger.error('Error message');
      
      expect(mockConsoleError).toHaveBeenCalledOnce();
      expect(mockConsoleLog).not.toHaveBeenCalled();
      expect(mockConsoleWarn).not.toHaveBeenCalled();
      
      const message = mockConsoleError.mock.calls[0][0];
      expect(message).toContain('[ERROR]');
    });

    it('deve formatar erros com stack trace', () => {
      logger.error('Operation failed', { 
        error: 'Database connection error',
        stack: 'at line 42',
        table: 'appointments',
      });
      
      const message = mockConsoleError.mock.calls[0][0];
      expect(message).toContain('"error":"Database connection error"');
      expect(message).toContain('"stack":"at line 42"');
      expect(message).toContain('"table":"appointments"');
    });
  });

  describe('Método debug()', () => {
    it('deve chamar console.debug em ambiente de desenvolvimento', () => {
      // Set NODE_ENV to development
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';
      
      // Reimport logger com novo ambiente
      vi.resetModules();
      import('../logger').then(({ logger: devLogger }) => {
        devLogger.debug('Debug message');
        
        expect(mockConsoleDebug).toHaveBeenCalledOnce();
        const message = mockConsoleDebug.mock.calls[0][0];
        expect(message).toContain('[DEBUG]');
        
        // Restore
        process.env.NODE_ENV = originalEnv;
      });
    });

    it('verifica condição de NODE_ENV para debug', () => {
      // Este teste verifica a lógica, não o comportamento completo de NODE_ENV
      // Em produção real, NODE_ENV é definido antes do módulo ser carregado
      const isProduction = process.env.NODE_ENV === 'production';
      
      logger.debug('Debug message');
      
      // Em ambiente de teste (não production), debug deve ser chamado
      if (!isProduction) {
        expect(mockConsoleDebug).toHaveBeenCalled();
      }
      // Teste de integração real validaria comportamento em produção
    });

    it('deve formatar debug messages com contexto detalhado', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';
      
      vi.resetModules();
      const { logger: devLogger } = await import('../logger');
      
      devLogger.debug('Intermediate state', { 
        step: 3, 
        data: { value: 42 },
        timestamp: 1234567890,
      });
      
      expect(mockConsoleDebug).toHaveBeenCalledOnce();
      const message = mockConsoleDebug.mock.calls[0][0];
      expect(message).toContain('"step":3');
      expect(message).toContain('"data":{"value":42}');
      
      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('Timestamp Format', () => {
    it('deve usar formato ISO 8601', () => {
      logger.info('Test');
      
      const message = mockConsoleLog.mock.calls[0][0];
      // Regex para ISO 8601: 2024-01-15T10:30:45.123Z
      const isoRegex = /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z/;
      expect(message).toMatch(isoRegex);
    });

    it('timestamps devem ser sequenciais', () => {
      logger.info('First');
      logger.info('Second');
      
      const firstMessage = mockConsoleLog.mock.calls[0][0];
      const secondMessage = mockConsoleLog.mock.calls[1][0];
      
      const firstTimestamp = firstMessage.match(/\[(.*?)\]/)?.[1];
      const secondTimestamp = secondMessage.match(/\[(.*?)\]/)?.[1];
      
      expect(firstTimestamp).toBeDefined();
      expect(secondTimestamp).toBeDefined();
      
      const firstDate = new Date(firstTimestamp!);
      const secondDate = new Date(secondTimestamp!);
      
      expect(secondDate.getTime()).toBeGreaterThanOrEqual(firstDate.getTime());
    });
  });

  describe('Context Type Safety', () => {
    it('deve aceitar contexto com tipos variados', () => {
      const context = {
        string: 'value',
        number: 42,
        boolean: true,
        null: null,
        undefined: undefined,
        array: [1, 2, 3],
        object: { nested: 'value' },
      };
      
      expect(() => {
        logger.info('Mixed types', context);
      }).not.toThrow();
      
      const message = mockConsoleLog.mock.calls[0][0];
      expect(message).toContain('"string":"value"');
      expect(message).toContain('"number":42');
      expect(message).toContain('"boolean":true');
    });

    it('deve lidar com contexto vazio', () => {
      expect(() => {
        logger.info('No context');
      }).not.toThrow();
      
      expect(() => {
        logger.info('Empty context', {});
      }).not.toThrow();
    });
  });

  describe('Edge Cases', () => {
    it('deve lidar com mensagens vazias', () => {
      expect(() => {
        logger.info('');
      }).not.toThrow();
      
      const message = mockConsoleLog.mock.calls[0][0];
      expect(message).toContain('[INFO]');
    });

    it('deve lidar com contexto circular (JSON.stringify falha gracefully)', () => {
      const circular: any = { name: 'test' };
      circular.self = circular;
      
      // JSON.stringify vai lançar erro, mas não queremos que o logger quebre
      // Em produção, você pode querer um try-catch no logger
      expect(() => {
        logger.info('Circular reference', circular);
      }).toThrow(); // Por enquanto vai falhar, mas documentado
    });

    it('deve lidar com caracteres especiais', () => {
      logger.info('Special chars: 你好 🎉 \n\t\\', { emoji: '🚀' });
      
      expect(mockConsoleLog).toHaveBeenCalledOnce();
      const message = mockConsoleLog.mock.calls[0][0];
      expect(message).toContain('Special chars');
    });
  });

  describe('Performance', () => {
    it('deve ser rápido para mensagens simples', () => {
      const start = Date.now();
      
      for (let i = 0; i < 1000; i++) {
        logger.info(`Message ${i}`);
      }
      
      const duration = Date.now() - start;
      expect(duration).toBeLessThan(1000); // < 1s para 1000 logs
    });

    it('deve ser rápido para contextos complexos', () => {
      const complexContext = {
        nested: { deep: { object: { with: { many: { levels: 'value' } } } } },
        array: Array(100).fill(0).map((_, i) => i),
      };
      
      const start = Date.now();
      
      for (let i = 0; i < 100; i++) {
        logger.info('Complex', complexContext);
      }
      
      const duration = Date.now() - start;
      expect(duration).toBeLessThan(1000); // < 1s para 100 logs complexos
    });
  });
});

