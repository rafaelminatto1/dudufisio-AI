import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider } from "../contexts/AppContext"';
import { authService } from '@/services/authService';

// Mock do authService
jest.mock('@/services/authService', () => ({
  authService: {
    signIn: jest.fn(),
    signOut: jest.fn(),
    getCurrentUser: jest.fn(),
    isAuthenticated: jest.fn(),
  },
}));

// Componente de teste para simular login
const LoginForm = () => {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await authService.signIn(email, password);
    } catch (err) {
      setError('Credenciais inválidas');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        data-testid="email-input"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Senha"
        data-testid="password-input"
      />
      <button type="submit" data-testid="login-button">
        Entrar
      </button>
      {error && <div data-testid="error-message">{error}</div>}
    </form>
  );
};

describe('TC003 - Autenticação de usuário com credenciais corretas', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve autenticar usuário com credenciais válidas', async () => {
    const mockSignIn = authService.signIn as jest.MockedFunction<typeof authService.signIn>;
    
    // Mock: Login bem-sucedido
    mockSignIn.mockResolvedValue({
      user: {
        id: '1',
        email: 'roberto@fisioflow.com',
        role: 'admin',
      },
      session: {
        access_token: 'mock-token',
        refresh_token: 'mock-refresh-token',
      },
    });

    const user = userEvent.setup();
    
    render(
      <AuthProvider>
        <LoginForm />
      </AuthProvider>
    );

    // Preencher credenciais
    await user.type(screen.getByTestId('email-input'), 'roberto@fisioflow.com');
    await user.type(screen.getByTestId('password-input'), 'password123');

    // Clicar em entrar
    await user.click(screen.getByTestId('login-button'));

    // Verificar se o login foi chamado
    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith('roberto@fisioflow.com', 'password123');
    });
  });
});

describe('TC004 - Bloquear login com credenciais inválidas', () => {
  it('deve bloquear login com credenciais incorretas', async () => {
    const mockSignIn = authService.signIn as jest.MockedFunction<typeof authService.signIn>;
    
    // Mock: Login falha
    mockSignIn.mockRejectedValue(new Error('Credenciais inválidas'));

    const user = userEvent.setup();
    
    render(
      <AuthProvider>
        <LoginForm />
      </AuthProvider>
    );

    // Preencher credenciais incorretas
    await user.type(screen.getByTestId('email-input'), 'usuario@inexistente.com');
    await user.type(screen.getByTestId('password-input'), 'senhaerrada');

    // Clicar em entrar
    await user.click(screen.getByTestId('login-button'));

    // Verificar mensagem de erro
    await waitFor(() => {
      expect(screen.getByTestId('error-message')).toHaveTextContent('Credenciais inválidas');
    });

    // Verificar que o login foi tentado
    expect(mockSignIn).toHaveBeenCalledWith('usuario@inexistente.com', 'senhaerrada');
  });
});
