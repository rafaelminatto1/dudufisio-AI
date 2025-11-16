/**
 * AIInsightsDashboard Tests
 * Testes para o dashboard de insights com IA
 */

import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import AIInsightsDashboard from '@/features/ai-insights/AIInsightsDashboard';

// Mock do Gemini AI já está no jest.setup.js

describe('AIInsightsDashboard', () => {
  it('should render loading state initially', () => {
    render(<AIInsightsDashboard />);
    
    expect(screen.getByText(/Analisando dados com IA/i)).toBeInTheDocument();
  });

  it('should render dashboard after loading', async () => {
    render(<AIInsightsDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText(/AI Insights Dashboard/i)).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('should display metrics cards', async () => {
    render(<AIInsightsDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText(/Cancelamentos Previstos/i)).toBeInTheDocument();
      expect(screen.getByText(/Pacientes em Risco/i)).toBeInTheDocument();
      expect(screen.getByText(/Previsão de Receita/i)).toBeInTheDocument();
    });
  });

  it('should display real-time insights', async () => {
    render(<AIInsightsDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText(/Insights em Tempo Real/i)).toBeInTheDocument();
    });
  });

  it('should display predicted cancellations', async () => {
    render(<AIInsightsDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText(/Consultas com Risco de Cancelamento/i)).toBeInTheDocument();
    });
  });

  it('should display churn risk patients', async () => {
    render(<AIInsightsDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText(/Pacientes em Risco de Churn/i)).toBeInTheDocument();
    });
  });

  it('should handle insight dismissal', async () => {
    render(<AIInsightsDashboard />);
    
    await waitFor(() => {
      const dismissButtons = screen.getAllByText('×');
      expect(dismissButtons.length).toBeGreaterThan(0);
    });

    const dismissButtons = screen.getAllByText('×');
    fireEvent.click(dismissButtons[0]);

    await waitFor(() => {
      // Verificar que o insight foi removido
      expect(dismissButtons[0]).not.toBeInTheDocument();
    });
  });
});

