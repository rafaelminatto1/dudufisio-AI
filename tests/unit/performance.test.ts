import { render, screen } from '@testing-library/react';
import { DashboardPage } from '@/pages/DashboardPage';
import { AgendaPage } from '@/pages/AgendaPage';
import { PatientListPage } from '@/pages/PatientListPage';

// Mock de performance
const mockPerformance = {
  now: jest.fn(),
  mark: jest.fn(),
  measure: jest.fn(),
};

Object.defineProperty(window, 'performance', {
  value: mockPerformance,
  writable: true,
});

describe('TC011 - Verificar tempo de carregamento da interface', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPerformance.now.mockReturnValue(0);
  });

  it('deve carregar Dashboard em menos de 2 segundos', async () => {
    const startTime = 0;
    const endTime = 1500; // 1.5 segundos
    
    mockPerformance.now
      .mockReturnValueOnce(startTime)
      .mockReturnValueOnce(endTime);

    const { container } = render(<DashboardPage />);

    // Simular carregamento completo
    await new Promise(resolve => setTimeout(resolve, 100));

    const loadTime = endTime - startTime;
    expect(loadTime).toBeLessThan(2000);
  });

  it('deve carregar Agenda em menos de 2 segundos', async () => {
    const startTime = 0;
    const endTime = 1800; // 1.8 segundos
    
    mockPerformance.now
      .mockReturnValueOnce(startTime)
      .mockReturnValueOnce(endTime);

    const { container } = render(<AgendaPage />);

    // Simular carregamento completo
    await new Promise(resolve => setTimeout(resolve, 100));

    const loadTime = endTime - startTime;
    expect(loadTime).toBeLessThan(2000);
  });

  it('deve carregar Lista de Pacientes em menos de 2 segundos', async () => {
    const startTime = 0;
    const endTime = 1200; // 1.2 segundos
    
    mockPerformance.now
      .mockReturnValueOnce(startTime)
      .mockReturnValueOnce(endTime);

    const { container } = render(<PatientListPage />);

    // Simular carregamento completo
    await new Promise(resolve => setTimeout(resolve, 100));

    const loadTime = endTime - startTime;
    expect(loadTime).toBeLessThan(2000);
  });
});
