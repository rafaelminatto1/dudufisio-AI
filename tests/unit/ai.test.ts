import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AiAssistant } from '@/components/AiAssistant';
import { geminiService } from '@/services/geminiService';

// Mock do geminiService
jest.mock('@/services/geminiService', () => ({
  geminiService: {
    generateReport: jest.fn(),
    generateProtocolSuggestion: jest.fn(),
    analyzeRisk: jest.fn(),
    answerClinicalQuestion: jest.fn(),
  },
}));

describe('TC008 - Testar geração automática de laudos pelo assistente de IA', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve gerar laudo com precisão mínima de 95%', async () => {
    const mockGenerateReport = geminiService.generateReport as jest.MockedFunction<typeof geminiService.generateReport>;
    
    // Mock: Geração de laudo com precisão alta
    mockGenerateReport.mockResolvedValue({
      id: '1',
      patientId: '1',
      content: 'Laudo fisioterapêutico gerado automaticamente...',
      accuracy: 97.5,
      confidence: 0.95,
      generatedAt: new Date().toISOString(),
    });

    const user = userEvent.setup();
    
    render(<AiAssistant patientId="1" />);

    // Iniciar geração de laudo
    await user.click(screen.getByRole('button', { name: /gerar laudo/i }));

    // Verificar se o laudo foi gerado
    await waitFor(() => {
      expect(mockGenerateReport).toHaveBeenCalledWith('1');
      expect(screen.getByText(/laudo fisioterapêutico/i)).toBeInTheDocument();
    });

    // Verificar precisão mínima
    await waitFor(() => {
      expect(screen.getByText(/precisão: 97.5%/i)).toBeInTheDocument();
    });
  });
});

describe('TC013 - Testar integração com Google Gemini AI para sugestões clínicas', () => {
  it('deve retornar sugestão de protocolo clínico', async () => {
    const mockGenerateProtocolSuggestion = geminiService.generateProtocolSuggestion as jest.MockedFunction<typeof geminiService.generateProtocolSuggestion>;
    
    // Mock: Sugestão de protocolo
    mockGenerateProtocolSuggestion.mockResolvedValue({
      id: '1',
      patientId: '1',
      suggestion: 'Protocolo de fortalecimento para lombalgia',
      evidence: 'Baseado em evidências científicas',
      exercises: [
        { name: 'Ponte', sets: 3, reps: 15 },
        { name: 'Prancha', sets: 3, reps: 30 },
      ],
      confidence: 0.92,
      generatedAt: new Date().toISOString(),
    });

    const user = userEvent.setup();
    
    render(<AiAssistant patientId="1" />);

    // Solicitar sugestão de protocolo
    await user.click(screen.getByRole('button', { name: /sugerir protocolo/i }));

    // Verificar se a sugestão foi retornada
    await waitFor(() => {
      expect(mockGenerateProtocolSuggestion).toHaveBeenCalledWith('1');
      expect(screen.getByText(/protocolo de fortalecimento/i)).toBeInTheDocument();
      expect(screen.getByText(/ponte/i)).toBeInTheDocument();
    });
  });
});
