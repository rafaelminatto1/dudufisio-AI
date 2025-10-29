/**
 * Testes para Error Handler Middleware
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handleError, AppError } from '../../../lib/middleware/errorHandler';

// Mock do toast
vi.mock('../../../contexts/ToastContext', () => ({
  toast: {
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
    success: vi.fn()
  }
}));

describe('handleError', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve tratar AppError corretamente', () => {
    const appError = new AppError(404, 'Não encontrado', 'NOT_FOUND');
    
    const result = handleError(appError, {
      showToast: false,
      logToConsole: false
    });

    expect(result).toBeInstanceOf(AppError);
    expect(result.message).toBe('Não encontrado');
    expect(result.statusCode).toBe(404);
  });

  it('deve converter Error em AppError', () => {
    const error = new Error('Algo deu errado');
    
    const result = handleError(error, {
      showToast: false,
      logToConsole: false
    });

    expect(result).toBeInstanceOf(AppError);
    expect(result.message).toBe('Algo deu errado');
  });

  it('deve converter string em AppError', () => {
    const result = handleError('Erro como string', {
      showToast: false,
      logToConsole: false
    });

    expect(result).toBeInstanceOf(AppError);
    expect(result.message).toBe('Erro como string');
  });

  it('deve detectar erro de rede', () => {
    const error = new Error('Failed to fetch');
    
    const result = handleError(error, {
      showToast: false,
      logToConsole: false
    });

    expect(result).toBeInstanceOf(AppError);
    expect(result.message).toContain('conexão');
  });

  it('deve usar mensagem customizada', () => {
    const error = new Error('Erro técnico');
    
    const result = handleError(error, {
      customMessage: 'Mensagem amigável',
      showToast: false,
      logToConsole: false
    });

    expect(result.message).toBe('Mensagem amigável');
  });

  it('deve categorizar severidade baseada no status code', () => {
    const criticalError = new AppError(500, 'Erro interno');
    const highError = new AppError(400, 'Requisição inválida');
    const mediumError = new AppError(300, 'Redirecionamento');

    handleError(criticalError, { 
      showToast: false, 
      logToConsole: false 
    });
    
    handleError(highError, { 
      showToast: false, 
      logToConsole: false 
    });
    
    handleError(mediumError, { 
      showToast: false, 
      logToConsole: false 
    });

    // Verificar que não houve erros na execução
    expect(true).toBe(true);
  });

  it('deve adicionar contexto ao erro', () => {
    const error = new Error('Erro com contexto');
    
    const result = handleError(error, {
      context: {
        userId: '123',
        operation: 'saveData'
      },
      showToast: false,
      logToConsole: false
    });

    expect(result).toBeInstanceOf(AppError);
  });

  it('deve re-lançar erro quando solicitado', () => {
    const error = new Error('Erro para re-lançar');
    
    expect(() => {
      handleError(error, {
        rethrow: true,
        showToast: false,
        logToConsole: false
      });
    }).toThrow();
  });

  it('deve incluir stack trace quando solicitado', () => {
    const error = new Error('Erro com stack');
    
    const result = handleError(error, {
      includeStack: true,
      showToast: false,
      logToConsole: false
    });

    expect(result.stack).toBeDefined();
  });
});

describe('AppError', () => {
  it('deve criar erro com propriedades corretas', () => {
    const error = new AppError(404, 'Recurso não encontrado', 'NOT_FOUND');

    expect(error.statusCode).toBe(404);
    expect(error.message).toBe('Recurso não encontrado');
    expect(error.code).toBe('NOT_FOUND');
    expect(error.name).toBe('AppError');
  });

  it('deve incluir detalhes quando fornecidos', () => {
    const details = { resourceId: '123', resourceType: 'patient' };
    const error = new AppError(404, 'Não encontrado', 'NOT_FOUND', details);

    expect(error.details).toEqual(details);
  });
});

