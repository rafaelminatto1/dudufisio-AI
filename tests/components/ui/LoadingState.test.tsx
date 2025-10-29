/**
 * Testes para LoadingState Component
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LoadingState } from '../../../components/ui/LoadingState';

describe('LoadingState', () => {
  it('deve renderizar com mensagem padrão', () => {
    render(<LoadingState />);
    expect(screen.getByText('Carregando...')).toBeInTheDocument();
  });

  it('deve renderizar com mensagem customizada', () => {
    render(<LoadingState message="Buscando pacientes..." />);
    expect(screen.getByText('Buscando pacientes...')).toBeInTheDocument();
  });

  it('deve renderizar spinner com tamanho correto', () => {
    const { container } = render(<LoadingState size="lg" />);
    const spinner = container.querySelector('.animate-spin');
    expect(spinner).toHaveClass('w-8', 'h-8');
  });

  it('deve renderizar skeleton quando habilitado', () => {
    const { container } = render(<LoadingState skeleton skeletonLines={3} />);
    const skeletons = container.querySelectorAll('.animate-pulse > div');
    expect(skeletons).toHaveLength(3);
  });

  it('deve aplicar className customizada', () => {
    const { container } = render(<LoadingState className="my-custom-class" />);
    expect(container.firstChild).toHaveClass('my-custom-class');
  });

  it('deve renderizar spinner com tamanho pequeno', () => {
    const { container } = render(<LoadingState size="sm" />);
    const spinner = container.querySelector('.animate-spin');
    expect(spinner).toHaveClass('w-4', 'h-4');
  });

  it('deve renderizar spinner com tamanho médio por padrão', () => {
    const { container } = render(<LoadingState />);
    const spinner = container.querySelector('.animate-spin');
    expect(spinner).toHaveClass('w-6', 'h-6');
  });
});

