/**
 * Testes para ErrorState Component
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ErrorState } from '../../../components/ui/ErrorState';

describe('ErrorState', () => {
  it('deve renderizar com título padrão', () => {
    render(<ErrorState />);
    expect(screen.getByText('Ops! Algo deu errado')).toBeInTheDocument();
  });

  it('deve renderizar com título customizado', () => {
    render(<ErrorState title="Erro ao carregar dados" />);
    expect(screen.getByText('Erro ao carregar dados')).toBeInTheDocument();
  });

  it('deve renderizar mensagem de erro string', () => {
    render(<ErrorState error="Erro de conexão" />);
    expect(screen.getByText('Erro de conexão')).toBeInTheDocument();
  });

  it('deve renderizar mensagem de Error object', () => {
    const error = new Error('Falha na operação');
    render(<ErrorState error={error} />);
    expect(screen.getByText('Falha na operação')).toBeInTheDocument();
  });

  it('deve chamar onRetry quando botão é clicado', () => {
    const onRetry = vi.fn();
    render(<ErrorState onRetry={onRetry} />);
    
    const retryButton = screen.getByText('Tentar novamente');
    fireEvent.click(retryButton);
    
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('deve chamar onGoBack quando botão é clicado', () => {
    const onGoBack = vi.fn();
    render(<ErrorState onGoBack={onGoBack} />);
    
    const backButton = screen.getByText('Voltar');
    fireEvent.click(backButton);
    
    expect(onGoBack).toHaveBeenCalledTimes(1);
  });

  it('deve chamar onGoHome quando botão é clicado', () => {
    const onGoHome = vi.fn();
    render(<ErrorState onGoHome={onGoHome} />);
    
    const homeButton = screen.getByText('Ir para início');
    fireEvent.click(homeButton);
    
    expect(onGoHome).toHaveBeenCalledTimes(1);
  });

  it('deve mostrar sugestão para erro de rede', () => {
    render(<ErrorState error="Failed to fetch" />);
    expect(screen.getByText(/Problema de conexão/i)).toBeInTheDocument();
    expect(screen.getByText(/Verifique sua internet/i)).toBeInTheDocument();
  });

  it('deve mostrar sugestão para erro de autenticação', () => {
    render(<ErrorState error="JWT expirado" />);
    expect(screen.getByText(/Sessão expirada/i)).toBeInTheDocument();
  });

  it('não deve mostrar detalhes técnicos em produção', () => {
    const error = new Error('Test error');
    error.stack = 'Stack trace here';
    
    const { container } = render(<ErrorState error={error} showDetails={false} />);
    expect(container.querySelector('details')).not.toBeInTheDocument();
  });

  it('deve aplicar className customizada', () => {
    const { container } = render(<ErrorState className="my-error-class" />);
    expect(container.firstChild).toHaveClass('my-error-class');
  });
});

