import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { InventoryDashboard } from '@/components/inventory/InventoryDashboard';
import { inventoryService } from '@/services/inventoryService';

// Mock do inventoryService
jest.mock('@/services/inventoryService', () => ({
  inventoryService: {
    createItem: jest.fn(),
    updateItem: jest.fn(),
    getItems: jest.fn(),
    checkStockLevel: jest.fn(),
    createMovement: jest.fn(),
  },
}));

describe('TC014 - Gestão de controle de estoque com alertas', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve gerar alerta quando estoque atinge nível mínimo', async () => {
    const mockCheckStockLevel = inventoryService.checkStockLevel as jest.MockedFunction<typeof inventoryService.checkStockLevel>;
    const mockCreateItem = inventoryService.createItem as jest.MockedFunction<typeof inventoryService.createItem>;
    const mockCreateMovement = inventoryService.createMovement as jest.MockedFunction<typeof inventoryService.createMovement>;
    
    // Mock: Item criado com nível mínimo
    mockCreateItem.mockResolvedValue({
      id: '1',
      name: 'Bandagem Elástica',
      category: 'Consumíveis',
      currentStock: 5,
      minStock: 10,
      unit: 'unidade',
      createdAt: new Date().toISOString(),
    });

    // Mock: Verificação de estoque baixo
    mockCheckStockLevel.mockResolvedValue({
      itemId: '1',
      currentStock: 5,
      minStock: 10,
      isLowStock: true,
      alertLevel: 'critical',
    });

    // Mock: Movimentação registrada
    mockCreateMovement.mockResolvedValue({
      id: '1',
      itemId: '1',
      type: 'out',
      quantity: 3,
      reason: 'Uso clínico',
      createdAt: new Date().toISOString(),
    });

    const user = userEvent.setup();
    
    render(<InventoryDashboard />);

    // Cadastrar item com estoque mínimo
    await user.click(screen.getByRole('button', { name: /adicionar item/i }));
    
    await user.type(screen.getByLabelText(/nome do item/i), 'Bandagem Elástica');
    await user.type(screen.getByLabelText(/estoque atual/i), '5');
    await user.type(screen.getByLabelText(/estoque mínimo/i), '10');
    
    await user.click(screen.getByRole('button', { name: /salvar/i }));

    // Registrar saída que deixa estoque baixo
    await user.click(screen.getByRole('button', { name: /registrar saída/i }));
    
    await user.selectOptions(screen.getByLabelText(/item/i), '1');
    await user.type(screen.getByLabelText(/quantidade/i), '3');
    await user.type(screen.getByLabelText(/motivo/i), 'Uso clínico');
    
    await user.click(screen.getByRole('button', { name: /confirmar/i }));

    // Verificar se o alerta foi gerado
    await waitFor(() => {
      expect(screen.getByText(/estoque baixo/i)).toBeInTheDocument();
      expect(screen.getByText(/bandagem elástica/i)).toBeInTheDocument();
      expect(screen.getByText(/estoque crítico/i)).toBeInTheDocument();
    });

    // Verificar se a movimentação foi registrada
    expect(mockCreateMovement).toHaveBeenCalledWith(
      expect.objectContaining({
        itemId: '1',
        type: 'out',
        quantity: 3,
        reason: 'Uso clínico',
      })
    );
  });
});
