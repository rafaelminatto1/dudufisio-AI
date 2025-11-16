import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { KanbanPage } from '@/pages/KanbanPage';
import { taskService } from '@/services/taskService';

// Mock do taskService
jest.mock('@/services/taskService', () => ({
  taskService: {
    createTask: jest.fn(),
    updateTask: jest.fn(),
    deleteTask: jest.fn(),
    moveTask: jest.fn(),
    getTasks: jest.fn(),
  },
}));

describe('TC015 - Funcionamento do sistema de tarefas Kanban', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve criar, mover e excluir tarefas no quadro Kanban', async () => {
    const mockCreateTask = taskService.createTask as jest.MockedFunction<typeof taskService.createTask>;
    const mockMoveTask = taskService.moveTask as jest.MockedFunction<typeof taskService.moveTask>;
    const mockUpdateTask = taskService.updateTask as jest.MockedFunction<typeof taskService.updateTask>;
    const mockDeleteTask = taskService.deleteTask as jest.MockedFunction<typeof taskService.deleteTask>;
    
    // Mock: Criação de tarefa
    mockCreateTask.mockResolvedValue({
      id: '1',
      title: 'Nova Tarefa',
      description: 'Descrição da tarefa',
      status: 'todo',
      priority: 'medium',
      assignee: '1',
      createdAt: new Date().toISOString(),
    });

    // Mock: Movimentação de tarefa
    mockMoveTask.mockResolvedValue({
      id: '1',
      status: 'in_progress',
      updatedAt: new Date().toISOString(),
    });

    // Mock: Atualização de tarefa
    mockUpdateTask.mockResolvedValue({
      id: '1',
      title: 'Tarefa Atualizada',
      description: 'Nova descrição',
      status: 'in_progress',
      priority: 'high',
      updatedAt: new Date().toISOString(),
    });

    // Mock: Exclusão de tarefa
    mockDeleteTask.mockResolvedValue({ success: true });

    const user = userEvent.setup();
    
    render(<KanbanPage />);

    // 1. Criar nova tarefa
    await user.click(screen.getByRole('button', { name: /nova tarefa/i }));
    
    await user.type(screen.getByLabelText(/título/i), 'Nova Tarefa');
    await user.type(screen.getByLabelText(/descrição/i), 'Descrição da tarefa');
    await user.selectOptions(screen.getByLabelText(/prioridade/i), 'medium');
    
    await user.click(screen.getByRole('button', { name: /criar/i }));

    // Verificar se a tarefa foi criada
    await waitFor(() => {
      expect(mockCreateTask).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Nova Tarefa',
          description: 'Descrição da tarefa',
          priority: 'medium',
        })
      );
    });

    // 2. Mover tarefa entre colunas
    const taskCard = screen.getByText('Nova Tarefa');
    const inProgressColumn = screen.getByTestId('in-progress-column');
    
    await user.dragAndDrop(taskCard, inProgressColumn);

    // Verificar se a tarefa foi movida
    await waitFor(() => {
      expect(mockMoveTask).toHaveBeenCalledWith('1', 'in_progress');
    });

    // 3. Editar tarefa
    await user.click(screen.getByRole('button', { name: /editar/i }));
    
    await user.clear(screen.getByLabelText(/título/i));
    await user.type(screen.getByLabelText(/título/i), 'Tarefa Atualizada');
    await user.clear(screen.getByLabelText(/descrição/i));
    await user.type(screen.getByLabelText(/descrição/i), 'Nova descrição');
    await user.selectOptions(screen.getByLabelText(/prioridade/i), 'high');
    
    await user.click(screen.getByRole('button', { name: /salvar/i }));

    // Verificar se a tarefa foi atualizada
    await waitFor(() => {
      expect(mockUpdateTask).toHaveBeenCalledWith('1', 
        expect.objectContaining({
          title: 'Tarefa Atualizada',
          description: 'Nova descrição',
          priority: 'high',
        })
      );
    });

    // 4. Excluir tarefa
    await user.click(screen.getByRole('button', { name: /excluir/i }));
    await user.click(screen.getByRole('button', { name: /confirmar exclusão/i }));

    // Verificar se a tarefa foi excluída
    await waitFor(() => {
      expect(mockDeleteTask).toHaveBeenCalledWith('1');
    });
  });
});
