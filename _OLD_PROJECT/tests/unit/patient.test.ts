import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PatientFormModal } from '@/components/PatientFormModal';
import { PatientList } from '@/components/pacientes/PatientList';
import { patientService } from '@/services/patientService';

// Mock do patientService
jest.mock('@/services/patientService', () => ({
  patientService: {
    createPatient: jest.fn(),
    getPatients: jest.fn(),
    updatePatient: jest.fn(),
    deletePatient: jest.fn(),
    checkDuplicateCPF: jest.fn(),
  },
}));

describe('TC001 - Validar cadastro de paciente com CPF válido', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve aceitar cadastro de paciente com CPF válido e único', async () => {
    const mockCreatePatient = patientService.createPatient as jest.MockedFunction<typeof patientService.createPatient>;
    const mockCheckDuplicateCPF = patientService.checkDuplicateCPF as jest.MockedFunction<typeof patientService.checkDuplicateCPF>;
    
    // Mock: CPF não existe no sistema
    mockCheckDuplicateCPF.mockResolvedValue(false);
    // Mock: Cadastro bem-sucedido
    mockCreatePatient.mockResolvedValue({
      id: '1',
      name: 'João Silva',
      cpf: '12345678901',
      email: 'joao@email.com',
      phone: '11999999999',
      birthDate: '1990-01-01',
      address: 'Rua Teste, 123',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01234567',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    const user = userEvent.setup();
    
    render(<PatientFormModal isOpen={true} onClose={jest.fn()} />);

    // Preencher formulário
    await user.type(screen.getByLabelText(/nome/i), 'João Silva');
    await user.type(screen.getByLabelText(/cpf/i), '12345678901');
    await user.type(screen.getByLabelText(/email/i), 'joao@email.com');
    await user.type(screen.getByLabelText(/telefone/i), '11999999999');
    await user.type(screen.getByLabelText(/data de nascimento/i), '1990-01-01');

    // Submeter formulário
    await user.click(screen.getByRole('button', { name: /cadastrar/i }));

    // Verificar se o paciente foi cadastrado
    await waitFor(() => {
      expect(mockCheckDuplicateCPF).toHaveBeenCalledWith('12345678901');
      expect(mockCreatePatient).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'João Silva',
          cpf: '12345678901',
          email: 'joao@email.com',
        })
      );
    });
  });
});

describe('TC002 - Prevenir cadastro duplicado baseado no CPF', () => {
  it('deve bloquear cadastro de paciente com CPF já existente', async () => {
    const mockCheckDuplicateCPF = patientService.checkDuplicateCPF as jest.MockedFunction<typeof patientService.checkDuplicateCPF>;
    
    // Mock: CPF já existe no sistema
    mockCheckDuplicateCPF.mockResolvedValue(true);

    const user = userEvent.setup();
    
    render(<PatientFormModal isOpen={true} onClose={jest.fn()} />);

    // Preencher formulário com CPF duplicado
    await user.type(screen.getByLabelText(/nome/i), 'João Silva');
    await user.type(screen.getByLabelText(/cpf/i), '12345678901');
    await user.type(screen.getByLabelText(/email/i), 'joao@email.com');

    // Submeter formulário
    await user.click(screen.getByRole('button', { name: /cadastrar/i }));

    // Verificar mensagem de erro
    await waitFor(() => {
      expect(screen.getByText(/cpf já cadastrado/i)).toBeInTheDocument();
    });

    // Verificar que o cadastro não foi realizado
    expect(patientService.createPatient).not.toHaveBeenCalled();
  });
});
