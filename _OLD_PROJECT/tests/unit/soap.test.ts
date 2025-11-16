import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NewSoapNoteModal } from '@/components/NewSoapNoteModal';
import { soapNoteService } from '@/services/soapNoteService';

// Mock do soapNoteService
jest.mock('@/services/soapNoteService', () => ({
  soapNoteService: {
    createSoapNote: jest.fn(),
    updateSoapNote: jest.fn(),
    getSoapNotes: jest.fn(),
    getSoapNoteHistory: jest.fn(),
    autoSave: jest.fn(),
  },
}));

// Mock do auto-save
jest.useFakeTimers();

describe('TC007 - Salvar notas SOAP automaticamente e manter histórico de versões', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('deve salvar automaticamente notas SOAP e manter histórico', async () => {
    const mockAutoSave = soapNoteService.autoSave as jest.MockedFunction<typeof soapNoteService.autoSave>;
    const mockGetSoapNoteHistory = soapNoteService.getSoapNoteHistory as jest.MockedFunction<typeof soapNoteService.getSoapNoteHistory>;
    
    // Mock: Auto-save bem-sucedido
    mockAutoSave.mockResolvedValue({
      id: '1',
      patientId: '1',
      subjective: 'Paciente relata melhora da dor',
      objective: 'Amplitude de movimento aumentada',
      assessment: 'Evolução positiva',
      plan: 'Continuar exercícios',
      version: 1,
      createdAt: new Date().toISOString(),
    });

    // Mock: Histórico de versões
    mockGetSoapNoteHistory.mockResolvedValue([
      {
        id: '1',
        version: 1,
        subjective: 'Paciente relata melhora da dor',
        objective: 'Amplitude de movimento aumentada',
        assessment: 'Evolução positiva',
        plan: 'Continuar exercícios',
        createdAt: new Date().toISOString(),
      },
      {
        id: '1',
        version: 2,
        subjective: 'Paciente relata melhora significativa da dor',
        objective: 'Amplitude de movimento aumentada em 20%',
        assessment: 'Evolução muito positiva',
        plan: 'Continuar exercícios e adicionar alongamentos',
        createdAt: new Date().toISOString(),
      },
    ]);

    const user = userEvent.setup();
    
    render(<NewSoapNoteModal isOpen={true} onClose={jest.fn()} patientId="1" />);

    // Inserir texto na seção Subjetivo
    const subjectiveField = screen.getByLabelText(/subjetivo/i);
    await user.type(subjectiveField, 'Paciente relata melhora da dor');

    // Avançar timer para trigger do auto-save (assumindo 2 segundos)
    jest.advanceTimersByTime(2000);

    // Verificar se auto-save foi chamado
    await waitFor(() => {
      expect(mockAutoSave).toHaveBeenCalledWith(
        '1',
        expect.objectContaining({
          subjective: 'Paciente relata melhora da dor',
        })
      );
    });

    // Modificar a nota
    await user.clear(subjectiveField);
    await user.type(subjectiveField, 'Paciente relata melhora significativa da dor');

    // Avançar timer novamente
    jest.advanceTimersByTime(2000);

    // Verificar se nova versão foi salva
    await waitFor(() => {
      expect(mockAutoSave).toHaveBeenCalledTimes(2);
    });

    // Verificar histórico de versões
    await user.click(screen.getByText(/histórico de versões/i));
    
    await waitFor(() => {
      expect(mockGetSoapNoteHistory).toHaveBeenCalledWith('1');
      expect(screen.getByText(/versão 1/i)).toBeInTheDocument();
      expect(screen.getByText(/versão 2/i)).toBeInTheDocument();
    });
  });
});
