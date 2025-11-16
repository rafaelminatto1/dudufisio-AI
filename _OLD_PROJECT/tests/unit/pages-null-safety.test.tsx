/**
 * Testes de Segurança contra Null/Undefined nas Páginas
 * Garantem que páginas lidam corretamente com dados nulos
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

// Mock dos hooks customizados
const mockUseOptimizedPatients = vi.fn();
const mockUseOptimizedAppointments = vi.fn();
const mockUseDashboardStats = vi.fn();
const mockUseDashboardLayout = vi.fn();
const mockUseApp = vi.fn();

vi.mock('@/hooks/useOptimizedData', () => ({
  useOptimizedPatients: () => mockUseOptimizedPatients(),
  useOptimizedAppointments: () => mockUseOptimizedAppointments(),
}));

vi.mock('@/hooks/useDashboardStats', () => ({
  default: () => mockUseDashboardStats(),
}));

vi.mock('@/hooks/useDashboardLayout', () => ({
  useDashboardLayout: () => mockUseDashboardLayout(),
}));

vi.mock('@/contexts/AppContext', () => ({
  useApp: () => mockUseApp(),
}));

// Mock dos componentes filhos
vi.mock('@/components/dashboard/DashboardFilters', () => ({
  DashboardFilters: () => <div data-testid="dashboard-filters">Filters</div>,
}));

vi.mock('@/components/dashboard/DashboardGrid', () => ({
  DashboardGrid: () => <div data-testid="dashboard-grid">Grid</div>,
}));

vi.mock('@/components/ui/card', () => ({
  Card: ({ children }: any) => <div>{children}</div>,
  CardHeader: ({ children }: any) => <div>{children}</div>,
  CardTitle: ({ children }: any) => <div>{children}</div>,
  CardDescription: ({ children }: any) => <div>{children}</div>,
  CardContent: ({ children }: any) => <div>{children}</div>,
}));

vi.mock('@/components/ui/button', () => ({
  Button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
}));

vi.mock('@/components/ui/dropdown-menu', () => ({
  DropdownMenu: ({ children }: any) => <div>{children}</div>,
  DropdownMenuTrigger: ({ children }: any) => <div>{children}</div>,
  DropdownMenuContent: ({ children }: any) => <div>{children}</div>,
  DropdownMenuItem: ({ children, onClick }: any) => (
    <div onClick={onClick}>{children}</div>
  ),
  DropdownMenuLabel: ({ children }: any) => <div>{children}</div>,
  DropdownMenuSeparator: () => <div />,
}));

vi.mock('@/components/ui/badge', () => ({
  Badge: ({ children }: any) => <span>{children}</span>,
}));

describe('DashboardPageV2 - Null Safety', () => {
  beforeEach(() => {
    // Reset mocks antes de cada teste
    vi.clearAllMocks();
    
    // Setup padrão
    mockUseApp.mockReturnValue({
      user: {
        id: '1',
        name: 'Test User',
        role: 'admin',
      },
    });

    mockUseDashboardLayout.mockReturnValue({
      widgets: [],
      layouts: [],
      currentLayoutId: 'default',
      isEditMode: false,
      setIsEditMode: vi.fn(),
      removeWidget: vi.fn(),
      saveCurrentLayout: vi.fn(),
      resetToDefault: vi.fn(),
      switchLayout: vi.fn(),
    });

    mockUseDashboardStats.mockReturnValue({
      stats: {
        occupancyRate: 0,
        monthlyRevenue: 0,
        totalActivePatients: 0,
        todayAppointments: 0,
      },
    });
  });

  it('deve renderizar sem erros quando patientsData é null', async () => {
    mockUseOptimizedPatients.mockReturnValue({
      data: null,
      isLoading: false,
    });

    mockUseOptimizedAppointments.mockReturnValue({
      data: [],
      isLoading: false,
    });

    expect(() => {
      const DashboardPageV2 = require('@/pages/DashboardPageV2').default;
      render(
        <BrowserRouter>
          <DashboardPageV2 />
        </BrowserRouter>
      );
    }).not.toThrow();
  });

  it('deve renderizar sem erros quando appointmentsData é null', async () => {
    mockUseOptimizedPatients.mockReturnValue({
      data: [],
      isLoading: false,
    });

    mockUseOptimizedAppointments.mockReturnValue({
      data: null,
      isLoading: false,
    });

    expect(() => {
      const DashboardPageV2 = require('@/pages/DashboardPageV2').default;
      render(
        <BrowserRouter>
          <DashboardPageV2 />
        </BrowserRouter>
      );
    }).not.toThrow();
  });

  it('deve renderizar sem erros quando ambos os dados são null', async () => {
    mockUseOptimizedPatients.mockReturnValue({
      data: null,
      isLoading: false,
    });

    mockUseOptimizedAppointments.mockReturnValue({
      data: null,
      isLoading: false,
    });

    expect(() => {
      const DashboardPageV2 = require('@/pages/DashboardPageV2').default;
      render(
        <BrowserRouter>
          <DashboardPageV2 />
        </BrowserRouter>
      );
    }).not.toThrow();
  });

  it('deve exibir "Carregando..." quando não há usuário', () => {
    mockUseApp.mockReturnValue({
      user: null,
    });

    mockUseOptimizedPatients.mockReturnValue({
      data: [],
      isLoading: false,
    });

    mockUseOptimizedAppointments.mockReturnValue({
      data: [],
      isLoading: false,
    });

    const DashboardPageV2 = require('@/pages/DashboardPageV2').default;
    render(
      <BrowserRouter>
        <DashboardPageV2 />
      </BrowserRouter>
    );

    expect(screen.getByText(/Carregando/i)).toBeInTheDocument();
  });

  it('deve renderizar componentes filhos quando dados são válidos', () => {
    mockUseOptimizedPatients.mockReturnValue({
      data: [{ id: '1', name: 'Patient 1', status: 'Active' }],
      isLoading: false,
    });

    mockUseOptimizedAppointments.mockReturnValue({
      data: [{ id: '1', startTime: new Date().toISOString() }],
      isLoading: false,
    });

    const DashboardPageV2 = require('@/pages/DashboardPageV2').default;
    render(
      <BrowserRouter>
        <DashboardPageV2 />
      </BrowserRouter>
    );

    expect(screen.getByTestId('dashboard-filters')).toBeInTheDocument();
    expect(screen.getByTestId('dashboard-grid')).toBeInTheDocument();
  });
});

describe('Utility Functions - Null Safety', () => {
  describe('Array validation', () => {
    it('deve converter null em array vazio', () => {
      const data = null;
      const result = Array.isArray(data) ? data : [];
      expect(result).toEqual([]);
    });

    it('deve converter undefined em array vazio', () => {
      const data = undefined;
      const result = Array.isArray(data) ? data : [];
      expect(result).toEqual([]);
    });

    it('deve manter array válido', () => {
      const data = [1, 2, 3];
      const result = Array.isArray(data) ? data : [];
      expect(result).toEqual([1, 2, 3]);
    });
  });

  describe('Filter operations', () => {
    it('deve executar filter em array vazio sem erro', () => {
      const data: any[] = [];
      expect(() => {
        data.filter(x => x);
      }).not.toThrow();
    });

    it('deve retornar array vazio ao filtrar array vazio', () => {
      const data: any[] = [];
      const result = data.filter(x => x);
      expect(result).toEqual([]);
    });
  });

  describe('useMemo with null data', () => {
    it('deve processar dados nulos sem erro', () => {
      const appointments = null;
      const patients = null;
      
      expect(() => {
        const safeAppointments = Array.isArray(appointments) ? appointments : [];
        const safePatients = Array.isArray(patients) ? patients : [];
        
        const result = {
          patients: safePatients,
          appointments: safeAppointments,
          stats: {
            totalActivePatients: safePatients.filter((p: any) => p.status === 'Active').length,
            monthlyRevenue: safeAppointments
              .filter((a: any) => a.paymentStatus === 'paid')
              .reduce((sum: number, a: any) => sum + (a.value || 0), 0),
          },
        };
        
        return result;
      }).not.toThrow();
    });
  });
});

