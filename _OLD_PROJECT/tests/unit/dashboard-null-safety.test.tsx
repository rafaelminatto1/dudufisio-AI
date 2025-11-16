/**
 * Testes de Segurança contra Null/Undefined no Dashboard
 * Garantem que componentes lidam corretamente com dados nulos
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RevenueWidget } from '@/components/dashboard/widgets/RevenueWidget';
import { PatientFlowWidget } from '@/components/dashboard/widgets/PatientFlowWidget';
import { AppointmentsWidget } from '@/components/dashboard/widgets/AppointmentsWidget';

// Mock do Recharts para evitar erros de renderização
vi.mock('recharts', () => ({
  LineChart: ({ children }: any) => <div data-testid="line-chart">{children}</div>,
  Line: () => null,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
  ResponsiveContainer: ({ children }: any) => <div>{children}</div>,
  PieChart: ({ children }: any) => <div data-testid="pie-chart">{children}</div>,
  Pie: () => null,
  Cell: () => null,
  Legend: () => null,
}));

// Mock do ScrollArea
vi.mock('@/components/ui/scroll-area', () => ({
  ScrollArea: ({ children }: any) => <div>{children}</div>,
}));

// Mock dos componentes UI
vi.mock('@/components/ui/avatar', () => ({
  Avatar: ({ children }: any) => <div>{children}</div>,
  AvatarImage: () => null,
  AvatarFallback: ({ children }: any) => <div>{children}</div>,
}));

vi.mock('@/components/ui/badge', () => ({
  Badge: ({ children }: any) => <span>{children}</span>,
}));

describe('Dashboard Widgets - Null Safety', () => {
  describe('RevenueWidget', () => {
    it('deve renderizar sem erros quando appointments é null', () => {
      expect(() => {
        render(<RevenueWidget appointments={null as any} />);
      }).not.toThrow();
    });

    it('deve renderizar sem erros quando appointments é undefined', () => {
      expect(() => {
        render(<RevenueWidget appointments={undefined as any} />);
      }).not.toThrow();
    });

    it('deve renderizar sem erros quando appointments é array vazio', () => {
      const { container } = render(<RevenueWidget appointments={[]} />);
      expect(container).toBeTruthy();
    });

    it('deve exibir receita R$ 0 quando não há dados', () => {
      render(<RevenueWidget appointments={[]} />);
      expect(screen.getByText(/R\$/)).toBeInTheDocument();
    });

    it('deve renderizar chart com dados válidos', () => {
      const mockAppointments = [
        {
          id: '1',
          startTime: new Date().toISOString(),
          paymentStatus: 'paid',
          value: 100,
        },
      ];
      
      const { getByTestId } = render(<RevenueWidget appointments={mockAppointments as any} />);
      expect(getByTestId('line-chart')).toBeInTheDocument();
    });
  });

  describe('PatientFlowWidget', () => {
    it('deve renderizar sem erros quando patients é null', () => {
      expect(() => {
        render(<PatientFlowWidget patients={null as any} />);
      }).not.toThrow();
    });

    it('deve renderizar sem erros quando patients é undefined', () => {
      expect(() => {
        render(<PatientFlowWidget patients={undefined as any} />);
      }).not.toThrow();
    });

    it('deve renderizar sem erros quando patients é array vazio', () => {
      const { container } = render(<PatientFlowWidget patients={[]} />);
      expect(container).toBeTruthy();
    });

    it('deve exibir 0 novos pacientes quando não há dados', () => {
      render(<PatientFlowWidget patients={[]} />);
      expect(screen.getByText('0')).toBeInTheDocument();
    });

    it('deve renderizar chart com dados válidos', () => {
      const mockPatients = [
        {
          id: '1',
          registrationDate: new Date().toISOString(),
          status: 'Active',
        },
      ];
      
      const { getByTestId } = render(<PatientFlowWidget patients={mockPatients as any} />);
      expect(getByTestId('pie-chart')).toBeInTheDocument();
    });
  });

  describe('AppointmentsWidget', () => {
    it('deve renderizar sem erros quando appointments é null', () => {
      expect(() => {
        render(<AppointmentsWidget appointments={null as any} />);
      }).not.toThrow();
    });

    it('deve renderizar sem erros quando appointments é undefined', () => {
      expect(() => {
        render(<AppointmentsWidget appointments={undefined as any} />);
      }).not.toThrow();
    });

    it('deve renderizar sem erros quando appointments é array vazio', () => {
      const { container } = render(<AppointmentsWidget appointments={[]} />);
      expect(container).toBeTruthy();
    });

    it('deve exibir mensagem de "Nenhum agendamento" quando não há dados', () => {
      render(<AppointmentsWidget appointments={[]} />);
      expect(screen.getByText(/Nenhum agendamento/i)).toBeInTheDocument();
    });

    it('deve renderizar lista com agendamentos válidos', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const mockAppointments = [
        {
          id: '1',
          startTime: tomorrow.toISOString(),
          patientName: 'João Silva',
          type: 'Fisioterapia',
        },
      ];
      
      render(<AppointmentsWidget appointments={mockAppointments as any} />);
      expect(screen.getByText('João Silva')).toBeInTheDocument();
    });

    it('não deve renderizar agendamentos passados', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      const mockAppointments = [
        {
          id: '1',
          startTime: yesterday.toISOString(),
          patientName: 'João Silva',
          type: 'Fisioterapia',
        },
      ];
      
      render(<AppointmentsWidget appointments={mockAppointments as any} />);
      expect(screen.queryByText('João Silva')).not.toBeInTheDocument();
    });
  });

  describe('Array.isArray validation pattern', () => {
    it('deve retornar array vazio quando data é null', () => {
      const data = null;
      const safeArray = Array.isArray(data) ? data : [];
      expect(safeArray).toEqual([]);
      expect(Array.isArray(safeArray)).toBe(true);
    });

    it('deve retornar array vazio quando data é undefined', () => {
      const data = undefined;
      const safeArray = Array.isArray(data) ? data : [];
      expect(safeArray).toEqual([]);
      expect(Array.isArray(safeArray)).toBe(true);
    });

    it('deve retornar array vazio quando data é objeto', () => {
      const data = { foo: 'bar' };
      const safeArray = Array.isArray(data) ? data : [];
      expect(safeArray).toEqual([]);
      expect(Array.isArray(safeArray)).toBe(true);
    });

    it('deve retornar array original quando data é array válido', () => {
      const data = [1, 2, 3];
      const safeArray = Array.isArray(data) ? data : [];
      expect(safeArray).toEqual([1, 2, 3]);
      expect(Array.isArray(safeArray)).toBe(true);
    });

    it('deve permitir operações de array sem erros', () => {
      const data = null;
      const safeArray = Array.isArray(data) ? data : [];
      
      expect(() => {
        safeArray.filter(x => x);
        safeArray.map(x => x);
        safeArray.reduce((a, b) => a + b, 0);
      }).not.toThrow();
    });
  });
});

