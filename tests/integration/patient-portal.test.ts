import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PatientPortalLayout } from '@/layouts/PatientPortalLayout';
import { communicationService } from '@/services/communicationService';

// Mock do communicationService
jest.mock('@/services/communicationService', () => ({
  communicationService: {
    sendMessage: jest.fn(),
    getMessages: jest.fn(),
    markAsRead: jest.fn(),
  },
}));

describe('TC020 - Testar comunicação segura via Portal do Paciente', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve permitir comunicação segura entre paciente e clínica', async () => {
    const mockSendMessage = communicationService.sendMessage as jest.MockedFunction<typeof communicationService.sendMessage>;
    const mockGetMessages = communicationService.getMessages as jest.MockedFunction<typeof communicationService.getMessages>;
    
    // Mock: Mensagem enviada com sucesso
    mockSendMessage.mockResolvedValue({
      id: '1',
      from: 'patient',
      to: 'clinic',
      message: 'Gostaria de reagendar minha consulta',
      timestamp: new Date().toISOString(),
      status: 'sent',
    });

    // Mock: Histórico de mensagens
    mockGetMessages.mockResolvedValue([
      {
        id: '1',
        from: 'patient',
        to: 'clinic',
        message: 'Gostaria de reagendar minha consulta',
        timestamp: '2024-01-15T10:00:00Z',
        status: 'sent',
      },
      {
        id: '2',
        from: 'clinic',
        to: 'patient',
        message: 'Claro! Qual horário seria melhor para você?',
        timestamp: '2024-01-15T10:30:00Z',
        status: 'read',
      },
    ]);

    const user = userEvent.setup();
    
    render(<PatientPortalLayout patientId="1" />);

    // Acessar área de comunicação
    await user.click(screen.getByRole('button', { name: /mensagens/i }));

    // Verificar se o histórico de mensagens foi carregado
    await waitFor(() => {
      expect(mockGetMessages).toHaveBeenCalledWith('1');
      expect(screen.getByText(/gostaria de reagendar/i)).toBeInTheDocument();
      expect(screen.getByText(/qual horário seria melhor/i)).toBeInTheDocument();
    });

    // Enviar nova mensagem
    const messageInput = screen.getByPlaceholderText(/digite sua mensagem/i);
    await user.type(messageInput, 'Posso agendar para terça-feira às 14h?');
    
    await user.click(screen.getByRole('button', { name: /enviar/i }));

    // Verificar se a mensagem foi enviada
    await waitFor(() => {
      expect(mockSendMessage).toHaveBeenCalledWith(
        '1',
        'clinic',
        'Posso agendar para terça-feira às 14h?'
      );
    });

    // Verificar confirmação de envio
    expect(screen.getByText(/mensagem enviada com sucesso/i)).toBeInTheDocument();
  });
});
