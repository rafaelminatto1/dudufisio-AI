import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Role } from '../types';
import authService, {
  AuthState,
  LoginCredentials,
  RegisterData,
  TwoFactorSetup
} from '../services/auth/supabaseAuthService';

interface AuthContextType extends AuthState {
  // Basic auth methods
  login: (credentials: LoginCredentials) => Promise<User>;
  register: (userData: RegisterData) => Promise<User>;
  logout: () => Promise<void>;

  // Password management
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;

  // Profile management
  updateProfile: (updates: Partial<User>) => Promise<User>;

  // 2FA methods
  setup2FA: () => Promise<TwoFactorSetup>;
  verify2FA: (factorId: string, code: string) => Promise<void>;
  get2FAFactors: () => Promise<any>;
  disable2FA: (factorId: string) => Promise<void>;

  // Social login
  loginWithGoogle: () => Promise<void>;
  loginWithGitHub: () => Promise<void>;

  // Permissions
  hasPermission: (permission: string) => Promise<boolean>;
  getUserRole: (userId?: string) => Promise<Role>;

  // Session management
  refreshSession: () => Promise<void>;
  isSessionExpired: () => boolean;

  // State
  isAuthenticated: boolean;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const SupabaseAuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>(authService.getState());
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Subscribe to auth state changes
    const unsubscribe = authService.subscribe((newState) => {
      setAuthState(newState);
    });

    return unsubscribe;
  }, []);

  const clearError = () => setError(null);

  const handleAuthOperation = async <T,>(
    operation: () => Promise<T>,
    successMessage?: string
  ): Promise<T> => {
    try {
      clearError();
      const result = await operation();
      if (successMessage) {
        console.log(successMessage);
      }
      return result;
    } catch (err: any) {
      const errorMessage = err.message || 'Ocorreu um erro inesperado';
      setError(errorMessage);
      throw err;
    }
  };

  const login = async (credentials: LoginCredentials): Promise<User> => {
    return handleAuthOperation(
      () => authService.login(credentials),
      'Login realizado com sucesso'
    );
  };

  const register = async (userData: RegisterData): Promise<User> => {
    return handleAuthOperation(
      () => authService.register(userData),
      'Conta criada com sucesso'
    );
  };

  const logout = async (): Promise<void> => {
    return handleAuthOperation(
      () => authService.logout(),
      'Logout realizado com sucesso'
    );
  };

  const resetPassword = async (email: string): Promise<void> => {
    return handleAuthOperation(
      () => authService.resetPassword(email),
      'Email de redefinição enviado'
    );
  };

  const updatePassword = async (newPassword: string): Promise<void> => {
    return handleAuthOperation(
      () => authService.updatePassword(newPassword),
      'Senha atualizada com sucesso'
    );
  };

  const updateProfile = async (updates: Partial<User>): Promise<User> => {
    return handleAuthOperation(
      () => authService.updateProfile(updates),
      'Perfil atualizado com sucesso'
    );
  };

  const setup2FA = async (): Promise<TwoFactorSetup> => {
    return handleAuthOperation(
      () => authService.setup2FA(),
      '2FA configurado com sucesso'
    );
  };

  const verify2FA = async (factorId: string, code: string): Promise<void> => {
    return handleAuthOperation(
      () => authService.verify2FA(factorId, code),
      '2FA verificado com sucesso'
    );
  };

  const get2FAFactors = async () => {
    return handleAuthOperation(() => authService.get2FAFactors());
  };

  const disable2FA = async (factorId: string): Promise<void> => {
    return handleAuthOperation(
      () => authService.disable2FA(factorId),
      '2FA desabilitado com sucesso'
    );
  };

  const loginWithGoogle = async (): Promise<void> => {
    return handleAuthOperation(() => authService.loginWithGoogle());
  };

  const loginWithGitHub = async (): Promise<void> => {
    return handleAuthOperation(() => authService.loginWithGitHub());
  };

  const hasPermission = async (permission: string): Promise<boolean> => {
    return handleAuthOperation(() => authService.hasPermission(permission));
  };

  const getUserRole = async (userId?: string): Promise<Role> => {
    if (userId) {
      return handleAuthOperation(() => authService.getUserRole(userId));
    }
    return authState.user?.role || Role.Patient;
  };

  const refreshSession = async (): Promise<void> => {
    return handleAuthOperation(
      () => authService.refreshSession(),
      'Sessão renovada'
    );
  };

  const isSessionExpired = (): boolean => {
    return authService.isSessionExpired();
  };

  const contextValue: AuthContextType = {
    // State
    ...authState,
    isAuthenticated: !!authState.user && !!authState.session,
    error,
    clearError,

    // Methods
    login,
    register,
    logout,
    resetPassword,
    updatePassword,
    updateProfile,
    setup2FA,
    verify2FA,
    get2FAFactors,
    disable2FA,
    loginWithGoogle,
    loginWithGitHub,
    hasPermission,
    getUserRole,
    refreshSession,
    isSessionExpired,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useSupabaseAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useSupabaseAuth must be used within a SupabaseAuthProvider');
  }
  return context;
};

// Backwards compatibility hook
export const useAuth = useSupabaseAuth;