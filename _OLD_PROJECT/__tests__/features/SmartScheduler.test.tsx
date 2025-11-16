/**
 * SmartScheduler Tests
 * Testes para o agendamento inteligente
 */

import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import SmartScheduler from '@/features/smart-scheduling/SmartScheduler';

describe('SmartScheduler', () => {
  it('should render loading state initially', () => {
    render(<SmartScheduler />);
    
    expect(screen.getByText(/Analisando agenda e gerando otimizações/i)).toBeInTheDocument();
  });

  it('should render scheduler after loading', async () => {
    render(<SmartScheduler />);
    
    await waitFor(() => {
      expect(screen.getByText(/Agendamento Inteligente/i)).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('should display date selector', async () => {
    render(<SmartScheduler />);
    
    await waitFor(() => {
      const dateInput = screen.getByDisplayValue(/2025-11/i);
      expect(dateInput).toBeInTheDocument();
    });
  });

  it('should display optimization card', async () => {
    render(<SmartScheduler />);
    
    await waitFor(() => {
      expect(screen.getByText(/Otimização Inteligente/i)).toBeInTheDocument();
      expect(screen.getByText(/Taxa de Ocupação/i)).toBeInTheDocument();
    });
  });

  it('should display smart suggestions', async () => {
    render(<SmartScheduler />);
    
    await waitFor(() => {
      expect(screen.getByText(/Sugestões Inteligentes/i)).toBeInTheDocument();
    });
  });

  it('should display gap analysis', async () => {
    render(<SmartScheduler />);
    
    await waitFor(() => {
      expect(screen.getByText(/Análise de Horários Vazios/i)).toBeInTheDocument();
    });
  });

  it('should display impact metrics', async () => {
    render(<SmartScheduler />);
    
    await waitFor(() => {
      expect(screen.getByText(/Impacto do Agendamento Inteligente/i)).toBeInTheDocument();
      expect(screen.getByText(/\+25%/i)).toBeInTheDocument();
      expect(screen.getByText(/-40%/i)).toBeInTheDocument();
    });
  });

  it('should handle refresh button click', async () => {
    render(<SmartScheduler />);
    
    await waitFor(() => {
      const refreshButton = screen.getByText(/Atualizar/i);
      expect(refreshButton).toBeInTheDocument();
      
      fireEvent.click(refreshButton);
    });
  });

  it('should handle apply optimization', async () => {
    render(<SmartScheduler />);
    
    await waitFor(() => {
      const applyButton = screen.getByText(/Aplicar/i);
      expect(applyButton).toBeInTheDocument();
      
      fireEvent.click(applyButton);
    });
  });
});

