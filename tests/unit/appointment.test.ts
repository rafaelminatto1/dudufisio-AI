import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AppointmentFormModal } from '@/components/AppointmentFormModal';
import { appointmentService } from '@/services/appointmentService';
import { conflictDetection } from '@/services/scheduling/conflictDetection';

// Mock dos serviços
jest.mock('@/services/appointmentService', () => ({
  appointmentService: {
    createAppointment: jest.fn(),
    getAppointments: jest.fn(),
    updateAppointment: jest.fn(),
    deleteAppointment: jest.fn(),
  },
}));

jest.mock('@/services/scheduling/conflictDetection', () => ({
  conflictDetection: {
    checkConflicts: jest.fn(),
  },
}));

describe('TC005 - Verificar prevenção automática de conflitos em agendamentos', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve impedir agendamentos duplos para mesmo paciente, fisioterapeuta ou sala', async () => {
    const mockCheckConflicts = conflictDetection.checkConflicts as jest.MockedFunction<typeof conflictDetection.checkConflicts>;
    const mockCreateAppointment = appointmentService.createAppointment as jest.MockedFunction<typeof appointmentService.createAppointment>;
    
    // Mock: Primeiro agendamento bem-sucedido
    mockCheckConflicts.mockResolvedValueOnce({ hasConflict: false, conflicts: [] });
    mockCreateAppointment.mockResolvedValueOnce({
      id: '1',
      patientId: '1',
      therapistId: '1',
      startTime: '2024-01-15T09:00:00Z',
      endTime: '2024-01-15T10:00:00Z',
      status: 'scheduled',
    });

    const user = userEvent.setup();
    
    render(<AppointmentFormModal isOpen={true} onClose={jest.fn()} />);

    // Primeiro agendamento
    await user.selectOptions(screen.getByLabelText(/paciente/i), '1');
    await user.selectOptions(screen.getByLabelText(/fisioterapeuta/i), '1');
    await user.type(screen.getByLabelText(/data/i), '2024-01-15');
    await user.type(screen.getByLabelText(/hora início/i), '09:00');
    await user.type(screen.getByLabelText(/hora fim/i), '10:00');

    await user.click(screen.getByRole('button', { name: /agendar/i }));

    await waitFor(() => {
      expect(mockCreateAppointment).toHaveBeenCalled();
    });

    // Segundo agendamento com conflito
    mockCheckConflicts.mockResolvedValueOnce({
      hasConflict: true,
      conflicts: ['Conflito de horário com fisioterapeuta'],
    });

    // Tentar agendar no mesmo horário
    await user.selectOptions(screen.getByLabelText(/paciente/i), '2');
    await user.selectOptions(screen.getByLabelText(/fisioterapeuta/i), '1');
    await user.type(screen.getByLabelText(/data/i), '2024-01-15');
    await user.type(screen.getByLabelText(/hora início/i), '09:00');
    await user.type(screen.getByLabelText(/hora fim/i), '10:00');

    await user.click(screen.getByRole('button', { name: /agendar/i }));

    // Verificar mensagem de conflito
    await waitFor(() => {
      expect(screen.getByText(/conflito de horário/i)).toBeInTheDocument();
    });

    // Verificar que o segundo agendamento não foi criado
    expect(mockCreateAppointment).toHaveBeenCalledTimes(1);
  });
});

describe('TC006 - Testar funcionalidade de agendamento recorrente', () => {
  it('deve permitir criar agendamentos recorrentes', async () => {
    const mockCreateAppointment = appointmentService.createAppointment as jest.MockedFunction<typeof appointmentService.createAppointment>;
    
    // Mock: Criação de agendamentos recorrentes
    mockCreateAppointment.mockResolvedValue({
      id: '1',
      patientId: '1',
      therapistId: '1',
      startTime: '2024-01-15T09:00:00Z',
      endTime: '2024-01-15T10:00:00Z',
      status: 'scheduled',
      recurrence: {
        type: 'weekly',
        interval: 1,
        endDate: '2024-02-15',
      },
    });

    const user = userEvent.setup();
    
    render(<AppointmentFormModal isOpen={true} onClose={jest.fn()} />);

    // Preencher dados básicos
    await user.selectOptions(screen.getByLabelText(/paciente/i), '1');
    await user.selectOptions(screen.getByLabelText(/fisioterapeuta/i), '1');
    await user.type(screen.getByLabelText(/data/i), '2024-01-15');
    await user.type(screen.getByLabelText(/hora início/i), '09:00');
    await user.type(screen.getByLabelText(/hora fim/i), '10:00');

    // Ativar recorrência
    await user.click(screen.getByLabelText(/agendamento recorrente/i));
    await user.selectOptions(screen.getByLabelText(/tipo de recorrência/i), 'weekly');
    await user.type(screen.getByLabelText(/data fim/i), '2024-02-15');

    await user.click(screen.getByRole('button', { name: /agendar/i }));

    // Verificar se o agendamento foi criado com recorrência
    await waitFor(() => {
      expect(mockCreateAppointment).toHaveBeenCalledWith(
        expect.objectContaining({
          recurrence: {
            type: 'weekly',
            interval: 1,
            endDate: '2024-02-15',
          },
        })
      );
    });
  });
});
