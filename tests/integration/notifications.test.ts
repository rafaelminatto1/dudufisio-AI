import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NotificationCenterPage } from '@/pages/NotificationCenterPage';
import { notificationService } from '@/services/notificationService';

// Mock do notificationService
jest.mock('@/services/notificationService', () => ({
  notificationService: {
    sendNotification: jest.fn(),
    getNotifications: jest.fn(),
    markAsRead: jest.fn(),
    scheduleReminder: jest.fn(),
  },
}));

describe('TC016 - Testar envio automático de notificações para lembretes de agendamento', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve enviar notificação de lembrete antes do agendamento', async () => {
    const mockScheduleReminder = notificationService.scheduleReminder as jest.MockedFunction<typeof notificationService.scheduleReminder>;
    
    // Mock: Agendamento criado com notificação
    const appointment = {
      id: '1',
      patientId: '1',
      therapistId: '1',
      startTime: '2024-01-15T09:00:00Z',
      endTime: '2024-01-15T10:00:00Z',
      patient: {
        name: 'João Silva',
        phone: '11999999999',
        email: 'joao@email.com',
      },
    };

    // Mock: Notificação agendada
    mockScheduleReminder.mockResolvedValue({
      id: '1',
      appointmentId: '1',
      scheduledFor: '2024-01-15T08:30:00Z',
      status: 'scheduled',
    });

    const user = userEvent.setup();
    
    render(<NotificationCenterPage />);

    // Criar agendamento com notificação
    await user.click(screen.getByRole('button', { name: /criar agendamento/i }));
    
    // Preencher dados do agendamento
    await user.type(screen.getByLabelText(/paciente/i), 'João Silva');
    await user.type(screen.getByLabelText(/data/i), '2024-01-15');
    await user.type(screen.getByLabelText(/hora/i), '09:00');
    
    // Ativar notificação
    await user.click(screen.getByLabelText(/enviar lembrete/i));
    
    // Salvar agendamento
    await user.click(screen.getByRole('button', { name: /salvar/i }));

    // Verificar se a notificação foi agendada
    await waitFor(() => {
      expect(mockScheduleReminder).toHaveBeenCalledWith(
        expect.objectContaining({
          appointmentId: '1',
          patientPhone: '11999999999',
          reminderTime: '2024-01-15T08:30:00Z',
        })
      );
    });

    // Verificar confirmação
    expect(screen.getByText(/lembrete agendado com sucesso/i)).toBeInTheDocument();
  });
});
