/**
 * 🔄 SISTEMA DE FALLBACK PARA AUTENTICAÇÃO
 * 
 * Quando o Supabase não estiver disponível, usa autenticação mock
 * para permitir que a aplicação continue funcionando
 */

import { User, Role } from '../types';
import { logger } from './logger';

interface FallbackAuthState {
  user: User | null;
  session: any;
  loading: boolean;
}

class FallbackAuthService {
  private listeners: Set<(state: FallbackAuthState) => void> = new Set();
  private currentState: FallbackAuthState = {
    user: null,
    session: null,
    loading: true
  };

  constructor() {
    this.initializeFallbackAuth();
  }

  private async initializeFallbackAuth() {
    try {
      logger.info('[FALLBACK] Inicializando autenticação de fallback');
      
      // Aguardar um pouco para dar chance ao Supabase
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Verificar se há sessão mock salva
      const mockSession = this.getMockSession();
      
      if (mockSession) {
        this.updateState({
          user: mockSession.user,
          session: mockSession.session,
          loading: false
        });
        logger.info('[FALLBACK] Sessão mock restaurada');
      } else {
        // Criar usuário mock padrão
        const mockUser = this.createMockUser();
        this.updateState({
          user: mockUser,
          session: null,
          loading: false
        });
        logger.info('[FALLBACK] Usuário mock criado');
      }
    } catch (error) {
      logger.error('[FALLBACK] Erro na inicialização:', error);
      this.updateState({
        user: null,
        session: null,
        loading: false
      });
    }
  }

  private getMockSession(): { user: User; session: any } | null {
    try {
      const stored = localStorage.getItem('fallback_session');
      if (!stored) return null;

      const parsed = JSON.parse(stored);
      if (parsed.expiresAt && parsed.expiresAt > Date.now()) {
        return parsed;
      } else {
        localStorage.removeItem('fallback_session');
        return null;
      }
    } catch {
      return null;
    }
  }

  private createMockUser(): User {
    return {
      id: 'fallback-admin-1',
      email: 'admin@dudufisio.com',
      name: 'Administrador (Modo Offline)',
      role: Role.Admin,
      avatarUrl: '',
      phone: undefined,
      createdAt: new Date().toISOString(),
      emailVerified: true,
      mfaEnabled: false
    };
  }

  private updateState(newState: Partial<FallbackAuthState>) {
    this.currentState = { ...this.currentState, ...newState };
    this.listeners.forEach(listener => listener(this.currentState));
  }

  subscribe(listener: (state: FallbackAuthState) => void) {
    this.listeners.add(listener);
    listener(this.currentState);
    return () => this.listeners.delete(listener);
  }

  getState(): FallbackAuthState {
    return this.currentState;
  }

  async login(email: string, password: string): Promise<User> {
    // Simular delay de rede
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Verificar credenciais mock
    const mockUsers: Record<string, User> = {
      'admin@dudufisio.com': {
        id: 'fallback-admin-1',
        email: 'admin@dudufisio.com',
        name: 'Administrador (Modo Offline)',
        role: Role.Admin,
        avatarUrl: '',
        phone: undefined,
        createdAt: new Date().toISOString(),
        emailVerified: true,
        mfaEnabled: false
      },
      'therapist@dudufisio.com': {
        id: 'fallback-therapist-1',
        email: 'therapist@dudufisio.com',
        name: 'Fisioterapeuta (Modo Offline)',
        role: Role.Therapist,
        avatarUrl: '',
        phone: undefined,
        createdAt: new Date().toISOString(),
        emailVerified: true,
        mfaEnabled: false
      },
      'patient@dudufisio.com': {
        id: 'fallback-patient-1',
        email: 'patient@dudufisio.com',
        name: 'Paciente (Modo Offline)',
        role: Role.Patient,
        avatarUrl: '',
        phone: undefined,
        createdAt: new Date().toISOString(),
        emailVerified: true,
        mfaEnabled: false
      }
    };

    const user = mockUsers[email];
    if (!user || password !== 'demo123456') {
      throw new Error('Credenciais inválidas');
    }

    // Criar sessão mock
    const mockSession = {
      access_token: 'fallback-token',
      refresh_token: 'fallback-refresh',
      expires_at: Date.now() + 3600000, // 1 hora
      user: user
    };

    // Salvar sessão
    const sessionData = {
      user,
      session: mockSession,
      expiresAt: Date.now() + (8 * 60 * 60 * 1000) // 8 horas
    };
    localStorage.setItem('fallback_session', JSON.stringify(sessionData));

    this.updateState({ user, session: mockSession, loading: false });
    
    logger.info('[FALLBACK] Login realizado com sucesso');
    return user;
  }

  async logout(): Promise<void> {
    localStorage.removeItem('fallback_session');
    this.updateState({ user: null, session: null, loading: false });
    logger.info('[FALLBACK] Logout realizado');
  }

  async register(userData: any): Promise<User> {
    throw new Error('Registro não disponível em modo offline');
  }

  async resetPassword(email: string): Promise<void> {
    throw new Error('Redefinição de senha não disponível em modo offline');
  }

  async updatePassword(newPassword: string): Promise<void> {
    throw new Error('Atualização de senha não disponível em modo offline');
  }

  async updateProfile(updates: Partial<User>): Promise<User> {
    if (!this.currentState.user) {
      throw new Error('Usuário não autenticado');
    }

    const updatedUser = { ...this.currentState.user, ...updates };
    this.updateState({ user: updatedUser });
    
    logger.info('[FALLBACK] Perfil atualizado');
    return updatedUser;
  }

  // Métodos 2FA não disponíveis em modo offline
  async setup2FA(): Promise<any> {
    throw new Error('2FA não disponível em modo offline');
  }

  async verify2FA(factorId: string, code: string): Promise<void> {
    throw new Error('2FA não disponível em modo offline');
  }

  async get2FAFactors() {
    throw new Error('2FA não disponível em modo offline');
  }

  async disable2FA(factorId: string): Promise<void> {
    throw new Error('2FA não disponível em modo offline');
  }

  // Social login não disponível em modo offline
  async loginWithGoogle(): Promise<void> {
    throw new Error('Login social não disponível em modo offline');
  }

  async loginWithGitHub(): Promise<void> {
    throw new Error('Login social não disponível em modo offline');
  }

  async loginWithApple(): Promise<void> {
    throw new Error('Login social não disponível em modo offline');
  }

  async hasPermission(permission: string): Promise<boolean> {
    // Em modo offline, admin tem todas as permissões
    return this.currentState.user?.role === Role.Admin;
  }

  async getUserRole(userId?: string): Promise<Role> {
    return this.currentState.user?.role || Role.Patient;
  }

  async refreshSession(): Promise<void> {
    // Em modo offline, não há refresh necessário
    logger.info('[FALLBACK] Refresh de sessão ignorado (modo offline)');
  }

  isSessionExpired(): boolean {
    return false; // Sessões mock não expiram
  }
}

// Instância global do serviço de fallback
export const fallbackAuthService = new FallbackAuthService();
export default fallbackAuthService;
