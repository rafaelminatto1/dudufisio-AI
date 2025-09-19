import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ReportsPage } from '@/pages/ReportsPage';
import { reportService } from '@/services/reportService';

// Mock do reportService
jest.mock('@/services/reportService', () => ({
  reportService: {
    generateReport: jest.fn(),
    exportToPDF: jest.fn(),
    exportToCSV: jest.fn(),
  },
}));

describe('TC010 - Exportar relatórios em formato PDF e CSV', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve exportar relatório clínico em PDF', async () => {
    const mockExportToPDF = reportService.exportToPDF as jest.MockedFunction<typeof reportService.exportToPDF>;
    
    // Mock: Exportação PDF bem-sucedida
    mockExportToPDF.mockResolvedValue({
      success: true,
      filename: 'relatorio-clinico-2024-01-15.pdf',
      url: 'blob:mock-pdf-url',
    });

    const user = userEvent.setup();
    
    render(<ReportsPage />);

    // Gerar relatório clínico
    await user.click(screen.getByRole('button', { name: /gerar relatório clínico/i }));

    // Selecionar exportação em PDF
    await user.click(screen.getByRole('button', { name: /exportar pdf/i }));

    // Verificar se a exportação foi chamada
    await waitFor(() => {
      expect(mockExportToPDF).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'clinical',
          format: 'pdf',
        })
      );
    });

    // Verificar se o download foi iniciado
    expect(screen.getByText(/relatório exportado com sucesso/i)).toBeInTheDocument();
  });

  it('deve exportar relatório financeiro em CSV', async () => {
    const mockExportToCSV = reportService.exportToCSV as jest.MockedFunction<typeof reportService.exportToCSV>;
    
    // Mock: Exportação CSV bem-sucedida
    mockExportToCSV.mockResolvedValue({
      success: true,
      filename: 'relatorio-financeiro-2024-01-15.csv',
      url: 'blob:mock-csv-url',
    });

    const user = userEvent.setup();
    
    render(<ReportsPage />);

    // Gerar relatório financeiro
    await user.click(screen.getByRole('button', { name: /gerar relatório financeiro/i }));

    // Selecionar exportação em CSV
    await user.click(screen.getByRole('button', { name: /exportar csv/i }));

    // Verificar se a exportação foi chamada
    await waitFor(() => {
      expect(mockExportToCSV).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'financial',
          format: 'csv',
        })
      );
    });

    // Verificar se o download foi iniciado
    expect(screen.getByText(/relatório exportado com sucesso/i)).toBeInTheDocument();
  });
});
