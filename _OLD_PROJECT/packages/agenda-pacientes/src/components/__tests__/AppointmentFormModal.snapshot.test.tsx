import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import AppointmentFormModal from '../AppointmentFormModal';
import { AppointmentType, AppointmentStatus } from '../../types';

// Mock do ToastContext
vi.mock('../../contexts/ToastContext', () => ({
  useToast: () => ({
    showToast: vi.fn(),
  }),
}));

// Mock do Supabase
vi.mock('../../lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({ data: [], error: null })),
    })),
  },
}));

// Mock do supabaseConfig
vi.mock('../../lib/supabaseConfig', () => ({
  default: {},
}));

describe('AppointmentFormModal - Snapshot Tests', () => {
  const mockOnClose = vi.fn();
  const mockOnSave = vi.fn().mockResolvedValue(true);
  const mockPatients = [
    {
      id: 'p1',
      name: 'João Silva',
      email: 'joao@example.com',
      phone: '11999999999',
      birthDate: new Date('1990-01-01'),
      cpf: '12345678900',
      address: 'Rua Teste, 123',
      emergencyContact: '11988888888',
      status: 'active' as const,
      registrationDate: new Date(),
      lastVisit: new Date(),
      totalSessions: 0,
      nextAppointment: null,
      consentGiven: true,
      whatsappConsent: true,
      avatarUrl: 'https://i.pravatar.cc/150?u=p1',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ] as any;
  const mockTherapists = [
    {
      id: 't1',
      name: 'Dr. Pedro',
      crefito: '12345',
      email: 'pedro@example.com',
      phone: '11988888888',
      specialties: ['Ortopedia'],
      color: '#8B5CF6',
      avatarUrl: 'https://i.pravatar.cc/150?u=t1',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  it('deve renderizar modal fechado corretamente', () => {
    const { container } = render(
      <AppointmentFormModal
        isOpen={false}
        onClose={mockOnClose}
        onSave={mockOnSave}
        patients={mockPatients}
        therapists={mockTherapists}
      />
    );
    
    expect(container).toMatchSnapshot();
  });

  it('deve renderizar modal aberto com todos os campos', () => {
    const { container } = render(
      <AppointmentFormModal
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        patients={mockPatients}
        therapists={mockTherapists}
        initialData={{
          date: new Date('2024-01-15T09:00:00'),
        }}
      />
    );
    
    expect(container).toMatchSnapshot();
  });

  it('deve renderizar modal em modo de edição', () => {
    const mockAppointment = {
      id: 'app1',
      patientId: 'p1',
      patientName: 'João Silva',
      patientAvatarUrl: 'https://i.pravatar.cc/150?u=p1',
      therapistId: 't1',
      therapistName: 'Dr. Pedro',
      title: 'Consulta',
      startTime: new Date('2024-01-15T09:00:00'),
      endTime: new Date('2024-01-15T10:00:00'),
      status: AppointmentStatus.Scheduled,
      type: AppointmentType.Session,
      observations: 'Teste de observação',
      value: 120,
      paymentStatus: 'pending' as const,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const { container } = render(
      <AppointmentFormModal
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        patients={mockPatients}
        therapists={mockTherapists}
        appointmentToEdit={mockAppointment}
      />
    );
    
    expect(container).toMatchSnapshot();
  });

  it('deve renderizar loading skeleton', () => {
    const { AppointmentFormSkeleton } = require('../agenda/AppointmentFormSkeleton');
    const { container } = render(<AppointmentFormSkeleton />);
    
    expect(container).toMatchSnapshot();
  });

  it('deve renderizar modal com badge de edição', () => {
    const mockAppointment = {
      id: 'app2',
      patientId: 'p1',
      patientName: 'Maria Santos',
      patientAvatarUrl: 'https://i.pravatar.cc/150?u=p1',
      title: 'Sessão',
      startTime: new Date('2024-01-15T10:00:00'),
      endTime: new Date('2024-01-15T11:00:00'),
      status: AppointmentStatus.Scheduled,
      type: AppointmentType.Evaluation,
      value: 150,
      paymentStatus: 'paid' as const,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const { getByText } = render(
      <AppointmentFormModal
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        patients={mockPatients}
        therapists={mockTherapists}
        appointmentToEdit={mockAppointment}
      />
    );
    
    // Verificar que badge "Editando" aparece
    expect(getByText('Editando')).toBeTruthy();
  });
});

