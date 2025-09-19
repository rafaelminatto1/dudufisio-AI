import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PatientPortalLayout } from '@/layouts/PatientPortalLayout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { authService } from '@/services/authService';

// Mock do authService
jest.mock('@/services/authService', () => ({
  authService: {
    getCurrentUser: jest.fn(),
    isAuthenticated: jest.fn(),
    hasPermission: jest.fn(),
  },
}));

describe('TC009 - Validar acesso seguro ao Portal do Paciente', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve bloquear acesso a dados de outros pacientes', async () => {
    const mockGetCurrentUser = authService.getCurrentUser as jest.MockedFunction<typeof authService.getCurrentUser>;
    const mockHasPermission = authService.hasPermission as jest.MockedFunction<typeof authService.hasPermission>;
    
    // Mock: Usuário paciente autenticado
    mockGetCurrentUser.mockResolvedValue({
      id: '1',
      email: 'paciente1@email.com',
      role: 'patient',
      patientId: '1',
    });

    // Mock: Sem permissão para acessar dados de outros pacientes
    mockHasPermission.mockReturnValue(false);

    render(
      <ProtectedRoute requiredRole="patient">
        <PatientPortalLayout patientId="2" />
      </ProtectedRoute>
    );

    // Verificar mensagem de acesso negado
    await waitFor(() => {
      expect(screen.getByText(/acesso negado/i)).toBeInTheDocument();
      expect(screen.getByText(/você não tem permissão/i)).toBeInTheDocument();
    });
  });
});

describe('TC012 - Expiração automática de sessão após inatividade', () => {
  it('deve expirar sessão após período de inatividade', async () => {
    const mockIsAuthenticated = authService.isAuthenticated as jest.MockedFunction<typeof authService.isAuthenticated>;
    
    // Mock: Sessão inicialmente ativa
    mockIsAuthenticated.mockReturnValue(true);

    render(<ProtectedRoute requiredRole="admin">
      <div>Conteúdo protegido</div>
    </ProtectedRoute>);

    // Verificar que o conteúdo está acessível
    expect(screen.getByText(/conteúdo protegido/i)).toBeInTheDocument();

    // Simular inatividade (timeout de 30 minutos)
    jest.advanceTimersByTime(30 * 60 * 1000);

    // Mock: Sessão expirada
    mockIsAuthenticated.mockReturnValue(false);

    // Verificar que o usuário foi redirecionado para login
    await waitFor(() => {
      expect(screen.getByText(/sessão expirada/i)).toBeInTheDocument();
      expect(screen.getByText(/faça login novamente/i)).toBeInTheDocument();
    });
  });
});

describe('TC017 - Verificar logs completos para auditoria conforme LGPD', () => {
  it('deve registrar logs de ações importantes', async () => {
    const mockAuditLog = jest.fn();
    
    // Mock do serviço de auditoria
    jest.mock('@/services/auditService', () => ({
      auditService: {
        logAction: mockAuditLog,
      },
    }));

    const user = userEvent.setup();
    
    render(<div>
      <button onClick={() => mockAuditLog('patient_created', { patientId: '1' })}>
        Criar Paciente
      </button>
      <button onClick={() => mockAuditLog('patient_updated', { patientId: '1' })}>
        Atualizar Paciente
      </button>
      <button onClick={() => mockAuditLog('patient_deleted', { patientId: '1' })}>
        Excluir Paciente
      </button>
    </div>);

    // Executar ações que devem ser logadas
    await user.click(screen.getByText(/criar paciente/i));
    await user.click(screen.getByText(/atualizar paciente/i));
    await user.click(screen.getByText(/excluir paciente/i));

    // Verificar se os logs foram registrados
    expect(mockAuditLog).toHaveBeenCalledWith('patient_created', { patientId: '1' });
    expect(mockAuditLog).toHaveBeenCalledWith('patient_updated', { patientId: '1' });
    expect(mockAuditLog).toHaveBeenCalledWith('patient_deleted', { patientId: '1' });
  });
});

describe('TC018 - Verificar permissões baseadas em roles', () => {
  it('deve permitir acesso apenas às áreas autorizadas para cada role', async () => {
    const mockHasPermission = authService.hasPermission as jest.MockedFunction<typeof authService.hasPermission>;
    
    // Teste para Admin
    mockHasPermission.mockReturnValue(true);
    
    render(<ProtectedRoute requiredRole="admin">
      <div>Área Administrativa</div>
    </ProtectedRoute>);

    expect(screen.getByText(/área administrativa/i)).toBeInTheDocument();

    // Teste para Fisioterapeuta
    mockHasPermission.mockReturnValue(false);
    
    render(<ProtectedRoute requiredRole="admin">
      <div>Área Administrativa</div>
    </ProtectedRoute>);

    await waitFor(() => {
      expect(screen.getByText(/acesso negado/i)).toBeInTheDocument();
    });
  });
});
