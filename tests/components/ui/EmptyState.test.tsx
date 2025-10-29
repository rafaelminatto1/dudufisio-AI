/**
 * Testes para EmptyState Component
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { EmptyState, EmptyPatientsState, EmptySearchState } from '../../../components/ui/EmptyState';

describe('EmptyState', () => {
  it('deve renderizar com título', () => {
    render(<EmptyState title="Nenhum resultado" />);
    expect(screen.getByText('Nenhum resultado')).toBeInTheDocument();
  });

  it('deve renderizar com descrição', () => {
    render(<EmptyState title="Vazio" description="Adicione itens" />);
    expect(screen.getByText('Adicione itens')).toBeInTheDocument();
  });

  it('deve renderizar botão de ação', () => {
    const onAction = vi.fn();
    render(
      <EmptyState 
        title="Vazio" 
        actionText="Adicionar" 
        onAction={onAction} 
      />
    );
    
    const button = screen.getByText('Adicionar');
    expect(button).toBeInTheDocument();
    
    fireEvent.click(button);
    expect(onAction).toHaveBeenCalledTimes(1);
  });

  it('deve renderizar ícone padrão baseado no tipo', () => {
    const { container } = render(<EmptyState title="Vazio" type="users" />);
    // Verifica se há um ícone SVG renderizado
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('deve renderizar ícone customizado', () => {
    const CustomIcon = <div data-testid="custom-icon">Ícone</div>;
    render(<EmptyState title="Vazio" icon={CustomIcon} />);
    expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
  });

  it('deve aplicar className customizada', () => {
    const { container } = render(<EmptyState title="Vazio" className="my-empty-class" />);
    expect(container.firstChild).toHaveClass('my-empty-class');
  });
});

describe('EmptyPatientsState', () => {
  it('deve renderizar mensagem específica para pacientes', () => {
    render(<EmptyPatientsState />);
    expect(screen.getByText('Nenhum paciente cadastrado')).toBeInTheDocument();
  });

  it('deve chamar onCreatePatient quando botão é clicado', () => {
    const onCreatePatient = vi.fn();
    render(<EmptyPatientsState onCreatePatient={onCreatePatient} />);
    
    const button = screen.getByText('Cadastrar primeiro paciente');
    fireEvent.click(button);
    
    expect(onCreatePatient).toHaveBeenCalledTimes(1);
  });
});

describe('EmptySearchState', () => {
  it('deve renderizar mensagem de busca vazia', () => {
    render(<EmptySearchState />);
    expect(screen.getByText('Nenhum resultado encontrado')).toBeInTheDocument();
  });

  it('deve mostrar termo de busca', () => {
    render(<EmptySearchState searchTerm="João" />);
    expect(screen.getByText(/Não encontramos resultados para "João"/i)).toBeInTheDocument();
  });
});

