import { handleSupabaseError } from '../../lib/middleware/errorHandler';
import { retryApiCall } from '../../lib/retryManager';
import { fallbackAuthService } from '../../lib/fallbackAuth';
import { User, Role } from '../../types';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import { secureLogger } from '../../lib/secureLogger';

export interface AuthState {
  user: User | null;
  session: any;
  loading: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData extends LoginCredentials {
  fullName: string;
  role: Role;
  phone?: string;
}

export interface TwoFactorSetup {
  secret: string;
  qrCode: string;
  backupCodes: string[];
}

class SupabaseAuthService {
  private async getSupabase() {
    const { supabase } = await import('../../lib/supabaseClient');
    return supabase;
  }
  private listeners: Set<(state: AuthState) => void> = new Set();
  private currentState: AuthState = {
    user: null,
    session: null,
    loading: true
  };

  constructor() {
    this.initializeAuth();
  }

  private async initializeAuth() {
    try {
      secureLogger.info('Inicializando autenticação', {
        component: 'supabaseAuthService',
        action: 'initializeAuth'
      });

      // Set a timeout for initialization to prevent infinite loading
      // Aumentado para 30 segundos para permitir que Supabase complete a verificação de sessão
      const initTimeout = setTimeout(() => {
        secureLogger.warn('Auth initialization timeout após 30s, fallback ativado', {
          component: 'supabaseAuthService'
        });
        this.switchToFallbackAuth();
      }, 30000); // 30 segundos - tempo suficiente para Supabase verificar sessão persistida

      // Fast-path: se nada responder rapidamente, finalize loading para liberar a UI do login
      const earlyFinishTimer = setTimeout(() => {
        if (this.currentState.loading && !this.currentState.user) {
          secureLogger.info('Finalizando loading cedo (200ms) para exibir login imediatamente', {
            component: 'supabaseAuthService'
          });
          this.updateState({ loading: false });
        }
      }, 200);

      try {
        // Get initial session with retry
        secureLogger.info('Verificando sessão existente...', {
          component: 'supabaseAuthService',
          action: 'initializeAuth'
        });

        const supa = await this.getSupabase();
        const { data: { session }, error: sessionError } = await retryApiCall(
          () => supa.auth.getSession(),
          'getSession',
          2 // Apenas 2 tentativas para inicialização
        );

        if (sessionError) {
          secureLogger.warn('Session error, switching to fallback auth', {
            component: 'supabaseAuthService',
            error: sessionError.message
          });
          clearTimeout(initTimeout);
          this.switchToFallbackAuth();
          return;
        }

        if (session?.user) {
          secureLogger.info('✅ Sessão encontrada e restaurada do Supabase', {
            component: 'supabaseAuthService',
            userId: session.user.id,
            email: session.user.email,
            expiresAt: session.expires_at
          });
          const user = await this.mapSupabaseUserToUser(session.user);
          this.updateState({ user, session, loading: false });
        } else {
          secureLogger.info('Nenhuma sessão ativa, exibindo login', {
            component: 'supabaseAuthService'
          });
          // Não criar usuário mock automaticamente - deixar null para mostrar tela de login
          this.updateState({ user: null, session: null, loading: false });
        }

        // Clear the timeouts since we completed successfully
        clearTimeout(initTimeout);
        clearTimeout(earlyFinishTimer);

        // Listen for auth changes
        supa.auth.onAuthStateChange(async (event, session) => {
          secureLogger.info('Auth state change', {
            component: 'supabaseAuthService',
            event
          });
          try {
            if (event === 'SIGNED_IN' && session?.user) {
              // Check if this is a new OAuth user and create profile if needed
              await this.ensureUserProfile(session.user);
              const user = await this.mapSupabaseUserToUser(session.user);
              this.updateState({ user, session, loading: false });
            } else if (event === 'SIGNED_OUT') {
              this.updateState({ user: null, session: null, loading: false });
            } else if (event === 'TOKEN_REFRESHED' && session?.user) {
              const user = await this.mapSupabaseUserToUser(session.user);
              this.updateState({ user, session, loading: false });
            }
          } catch (error) {
            secureLogger.error('Erro ao processar mudança de estado auth', error, {
              component: 'supabaseAuthService',
              action: 'onAuthStateChange'
            });
            // Don't break the app, just log the error
          }
        });

      } catch (error) {
        clearTimeout(initTimeout);
        clearTimeout(earlyFinishTimer);
        secureLogger.error('Supabase auth failed, switching to fallback', error, {
          component: 'supabaseAuthService'
        });
        this.switchToFallbackAuth();
      }
    } catch (error) {
      secureLogger.error('Auth initialization error', error, {
        component: 'supabaseAuthService'
      });
      this.switchToFallbackAuth();
    }
  }

  private switchToFallbackAuth() {
    secureLogger.info('Supabase indisponível, aguardando login manual', {
      component: 'supabaseAuthService'
    });
    
    // Não criar usuário automático - apenas marcar que está pronto para login
    this.updateState({ user: null, session: null, loading: false });
  }

  private updateState(newState: Partial<AuthState>) {
    this.currentState = { ...this.currentState, ...newState };
    this.listeners.forEach(listener => listener(this.currentState));
  }

  private getMockUser(): User {
    // Tentar recuperar sessão mock do localStorage
    const storedMockSession = localStorage.getItem('mock_session');
    if (storedMockSession) {
      try {
        const parsed = JSON.parse(storedMockSession);
        if (parsed.expiresAt > Date.now()) {
          secureLogger.info('Sessão mock recuperada do localStorage', {
            component: 'supabaseAuthService',
            action: 'getMockUser',
            userId: parsed.user?.id
          });
          return parsed.user;
        } else {
          secureLogger.info('Sessão mock expirada, removendo', {
            component: 'supabaseAuthService'
          });
          localStorage.removeItem('mock_session');
        }
      } catch (e) {
        secureLogger.warn('Erro ao recuperar sessão mock, removendo', {
          component: 'supabaseAuthService',
          error: String(e)
        });
        localStorage.removeItem('mock_session');
      }
    }

    // Criar novo usuário mock padrão
    const mockUser: User = {
      id: 'mock-admin-1',
      email: 'admin@dudufisio.com',
      name: 'Administrador',
      role: Role.Admin,
      avatarUrl: '',
      phone: undefined,
      createdAt: new Date().toISOString()
    };

    // Persistir no localStorage com expiração de 8 horas
    const sessionData = {
      user: mockUser,
      expiresAt: Date.now() + (8 * 60 * 60 * 1000)
    };
    localStorage.setItem('mock_session', JSON.stringify(sessionData));
    secureLogger.info('Sessão mock criada e persistida', {
      component: 'supabaseAuthService',
      action: 'getMockUser',
      userId: mockUser.id,
      validFor: '8 hours'
    });

    return mockUser;
  }

  private shouldUseMockAuth(credentials: LoginCredentials): boolean {
    // ⚠️ ATUALIZAÇÃO: admin@dudufisio.com agora usa autenticação REAL no Supabase
    // Removido admin@ da lista de mock credentials
    // Use mock auth apenas para outros usuários demo (se necessário)
    const demoCredentials = [
      // 'admin@dudufisio.com', // ❌ REMOVIDO - agora usa auth real do Supabase
      'therapist@dudufisio.com',
      'terapeuta@dudufisio.com',
      'patient@dudufisio.com',
      'paciente@dudufisio.com',
      'educator@dudufisio.com'
    ];
    return demoCredentials.includes(credentials.email) && credentials.password === 'demo123456';
  }

  private mockLogin(credentials: LoginCredentials): User {
    secureLogger.info('Login mock iniciado', {
      component: 'supabaseAuthService',
      action: 'mockLogin',
      email: credentials.email
    });

    // ⚠️ IMPORTANTE: admin@dudufisio.com foi REMOVIDO daqui
    // Agora usa autenticação REAL no Supabase
    const mockUsers: Record<string, User> = {
      // 'admin@dudufisio.com': REMOVIDO - usa auth real ✅
      'therapist@dudufisio.com': {
        id: 'mock-therapist-1',
        email: 'therapist@dudufisio.com',
        fullName: 'Dr. João Silva',
        role: Role.Therapist,
        avatarUrl: '',
        phone: undefined,
        createdAt: new Date().toISOString()
      },
      'terapeuta@dudufisio.com': {
        id: 'mock-therapist-1',
        email: 'terapeuta@dudufisio.com',
        fullName: 'Dr. João Silva',
        role: Role.Therapist,
        avatarUrl: '',
        phone: undefined,
        createdAt: new Date().toISOString()
      },
      'patient@dudufisio.com': {
        id: 'mock-patient-1',
        email: 'patient@dudufisio.com',
        fullName: 'Maria Santos',
        role: Role.Patient,
        avatarUrl: '',
        phone: undefined,
        createdAt: new Date().toISOString()
      },
      'paciente@dudufisio.com': {
        id: 'mock-patient-1',
        email: 'paciente@dudufisio.com',
        fullName: 'Maria Santos',
        role: Role.Patient,
        avatarUrl: '',
        phone: undefined,
        createdAt: new Date().toISOString()
      },
      'educator@dudufisio.com': {
        id: 'mock-educator-1',
        email: 'educator@dudufisio.com',
        fullName: 'Educador Físico',
        role: Role.Educator,
        avatarUrl: '',
        phone: undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    };

    const user = mockUsers[credentials.email];
    if (!user) {
      throw new Error('Credenciais inválidas');
    }

    // Create mock session
    const mockSession = {
      access_token: 'mock-access-token',
      refresh_token: 'mock-refresh-token',
      expires_at: Date.now() + 3600000, // 1 hour
      user: user
    };

    // Persistir sessão mock no localStorage com expiração de 8 horas
    const sessionData = {
      user: user,
      expiresAt: Date.now() + (8 * 60 * 60 * 1000)
    };
    localStorage.setItem('mock_session', JSON.stringify(sessionData));
    secureLogger.info('Login mock bem-sucedido', {
      component: 'supabaseAuthService',
      action: 'mockLogin',
      userId: user.id,
      role: user.role
    });

    // Update state with mock user and session
    this.updateState({ user, session: mockSession, loading: false });
    return user;
  }

  subscribe(listener: (state: AuthState) => void) {
    this.listeners.add(listener);
    listener(this.currentState); // Send current state immediately

    return () => {
      this.listeners.delete(listener);
    };
  }

  getState(): AuthState {
    return this.currentState;
  }

  async login(credentials: LoginCredentials): Promise<User> {
    secureLogger.info('🔐 Tentativa de login', {
      component: 'supabaseAuthService',
      action: 'login',
      email: credentials.email
    });

    try {
      // Check if we should use mock authentication for development
      if (this.shouldUseMockAuth(credentials)) {
        secureLogger.info('📋 Usando autenticação mock para credenciais demo', {
          component: 'supabaseAuthService',
          action: 'login',
          email: credentials.email
        });
        const user = this.mockLogin(credentials);
        return user;
      }

      // ✅ AUTENTICAÇÃO REAL NO SUPABASE
      // admin@dudufisio.com e outros usuários reais chegam aqui
      secureLogger.info('🔄 Tentando login REAL via Supabase', {
        component: 'supabaseAuthService',
        action: 'login',
        email: credentials.email,
        isRealAuth: true
      });
      
      const supa = await this.getSupabase();
      const { data, error } = await retryApiCall(
        () => supa.auth.signInWithPassword({
          email: credentials.email,
          password: credentials.password,
        }),
        'signInWithPassword',
        2
      );

      if (error) throw error;
      if (!data.user) throw new Error('Login falhou - usuário não retornado');
      if (!data.session) throw new Error('Login falhou - sessão não criada');

      const user = await this.mapSupabaseUserToUser(data.user);
      
      secureLogger.info('✅ Login via Supabase bem-sucedido', {
        component: 'supabaseAuthService',
        action: 'login',
        userId: user.id,
        email: user.email,
        role: user.role,
        hasSession: !!data.session,
        sessionExpiresAt: data.session.expires_at
      });
      
      return user;
    } catch (error: any) {
      secureLogger.error('❌ Login Supabase falhou', {
        component: 'supabaseAuthService',
        action: 'login',
        email: credentials.email,
        error: error.message,
        errorCode: error.code
      });

      // If Supabase fails, try fallback auth
      try {
        secureLogger.info('🔄 Tentando fallback auth', {
          component: 'supabaseAuthService',
          action: 'login'
        });
        return await fallbackAuthService.login(credentials.email, credentials.password);
      } catch (fallbackError) {
        // If fallback also fails and we have demo credentials, try mock auth
        if (this.shouldUseMockAuth(credentials)) {
          secureLogger.info('📋 Usando mock auth como último recurso', {
            component: 'supabaseAuthService',
            action: 'login',
            email: credentials.email
          });
          const user = this.mockLogin(credentials);
          return user;
        }
        
        secureLogger.error('❌ Todos os métodos de login falharam', {
          component: 'supabaseAuthService',
          action: 'login',
          email: credentials.email,
          error: error.message
        });
        
        throw new Error(handleSupabaseError(error));
      }
    }
  }

  async register(userData: RegisterData): Promise<User> {
    try {
      const supa = await this.getSupabase();
      const { data, error } = await supa.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            full_name: userData.fullName,
            role: userData.role,
            phone: userData.phone,
          }
        }
      });

      if (error) throw error;
      if (!data.user) throw new Error('Registro falhou');

      // Create user profile in our custom table
      const { error: profileError } = await supa
        .from('user_profiles')
        .insert({
          id: data.user.id,
          email: userData.email,
          full_name: userData.fullName,
          role: userData.role,
          phone: userData.phone,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        } as any);

      if (profileError) {
        secureLogger.error('Erro ao criar perfil do usuário', profileError, {
          component: 'supabaseAuthService',
          action: 'register'
        });
        // Don't throw here as the user was created successfully
      }

      const user = await this.mapSupabaseUserToUser(data.user);
      return user;
    } catch (error: any) {
      throw new Error(handleSupabaseError(error));
    }
  }

  async logout(): Promise<void> {
    try {
      // Limpar sessão mock do localStorage
      localStorage.removeItem('mock_session');
      secureLogger.info('Logout executado', {
        component: 'supabaseAuthService',
        action: 'logout'
      });

      const supa = await this.getSupabase();
      const { error } = await supa.auth.signOut();
      if (error) throw error;
    } catch (error: any) {
      throw new Error(handleSupabaseError(error));
    }
  }

  async resetPassword(email: string): Promise<void> {
    try {
      const supa = await this.getSupabase();
      const { error } = await supa.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
    } catch (error: any) {
      throw new Error(handleSupabaseError(error));
    }
  }

  async updatePassword(newPassword: string): Promise<void> {
    try {
      const supa = await this.getSupabase();
      const { error } = await supa.auth.updateUser({
        password: newPassword
      });
      if (error) throw error;
    } catch (error: any) {
      throw new Error(handleSupabaseError(error));
    }
  }

  async updateProfile(updates: Partial<User>): Promise<User> {
    try {
      const supa = await this.getSupabase();
      const { data: { user: authUser }, error: authError } = await supa.auth.updateUser({
        data: {
          full_name: updates.fullName,
          phone: updates.phone,
        }
      });

      if (authError) throw authError;
      if (!authUser) throw new Error('Usuário não encontrado');

      // Update profile in our custom table
      const { error: profileError } = await supa
        .from('users')
        .update({
          full_name: updates.fullName,
          phone: updates.phone,
          updated_at: new Date().toISOString(),
        })
        .eq('auth_id', authUser.id);

      if (profileError) throw profileError;

      const user = await this.mapSupabaseUserToUser(authUser);
      return user;
    } catch (error: any) {
      throw new Error(handleSupabaseError(error));
    }
  }

  // 2FA Methods
  async setup2FA(): Promise<TwoFactorSetup> {
    try {
      const supa = await this.getSupabase();
      const { data, error } = await supa.auth.mfa.enroll({
        factorType: 'totp'
      });

      if (error) throw error;

      return {
        secret: data.totp.secret,
        qrCode: data.totp.qr_code,
        backupCodes: [] // Generate backup codes if needed
      };
    } catch (error: any) {
      throw new Error(handleSupabaseError(error));
    }
  }

  async verify2FA(factorId: string, code: string): Promise<void> {
    try {
      const supa = await this.getSupabase();
      const { error } = await supa.auth.mfa.challengeAndVerify({
        factorId,
        code
      });
      if (error) throw error;
    } catch (error: any) {
      throw new Error(handleSupabaseError(error));
    }
  }

  async get2FAFactors() {
    try {
      const supa = await this.getSupabase();
      const { data, error } = await supa.auth.mfa.listFactors();
      if (error) throw error;
      return data;
    } catch (error: any) {
      throw new Error(handleSupabaseError(error));
    }
  }

  async disable2FA(factorId: string): Promise<void> {
    try {
      const supa = await this.getSupabase();
      const { error } = await supa.auth.mfa.unenroll({ factorId });
      if (error) throw error;
    } catch (error: any) {
      throw new Error(handleSupabaseError(error));
    }
  }

  // Role and permission helpers
  async getUserRole(userId: string): Promise<Role> {
    try {
      const supa = await this.getSupabase();
      const { data, error } = await supa
        .from('user_profiles')
        .select('role')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return data.role as Role;
    } catch (error: any) {
      throw new Error(handleSupabaseError(error));
    }
  }

  async hasPermission(permission: string): Promise<boolean> {
    const user = this.currentState.user;
    if (!user) return false;

    // Define role-based permissions
    const rolePermissions: Record<Role, string[]> = {
      [Role.Admin]: ['*'], // Admin has all permissions
      [Role.Therapist]: [
        'patients:read',
        'patients:write',
        'appointments:read',
        'appointments:write',
        'treatments:read',
        'treatments:write',
        'reports:read',
        'reports:write'
      ],
      [Role.Patient]: [
        'profile:read',
        'profile:write',
        'appointments:read',
        'exercises:read',
        'progress:read'
      ],
      [Role.EducadorFisico]: [
        'clients:read',
        'clients:write',
        'exercises:read',
        'exercises:write',
        'programs:read',
        'programs:write'
      ]
    };

    const userPermissions = rolePermissions[user.role] || [];
    return userPermissions.includes('*') || userPermissions.includes(permission);
  }

  // Ensure user profile exists (especially for OAuth users)
  private async ensureUserProfile(supabaseUser: SupabaseUser): Promise<void> {
    try {
      // Check if profile already exists
      const supa = await this.getSupabase();
      const { data: existingProfile } = await supa
        .from('user_profiles')
        .select('id')
        .eq('id', supabaseUser.id)
        .single();

      if (!existingProfile) {
        secureLogger.info('Criando perfil para usuário OAuth', {
          component: 'supabaseAuthService',
          action: 'ensureUserProfile',
          userId: supabaseUser.id
        });

        // Create profile for OAuth user
        const { error: profileError } = await supa
          .from('user_profiles')
          .insert({
            id: supabaseUser.id,
            email: supabaseUser.email || '',
            name: supabaseUser.user_metadata?.['name'] || 
                  supabaseUser.user_metadata?.['full_name'] || 
                  supabaseUser.user_metadata?.['user_name'] ||
                  'Usuário',
            role: supabaseUser.user_metadata?.['role'] || Role.Patient,
            phone: supabaseUser.user_metadata?.['phone'] || '',
            avatar_url: supabaseUser.user_metadata?.['avatar_url'] || 
                       supabaseUser.user_metadata?.['picture'] ||
                       supabaseUser.user_metadata?.['avatar_url'] ||
                       '',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          } as any);

        if (profileError) {
          secureLogger.error('Erro ao criar perfil OAuth', profileError, {
            component: 'supabaseAuthService',
            action: 'ensureUserProfile',
            userId: supabaseUser.id
          });
          // Don't throw here as the user was authenticated successfully
        } else {
          secureLogger.info('Perfil OAuth criado com sucesso', {
            component: 'supabaseAuthService',
            action: 'ensureUserProfile',
            userId: supabaseUser.id
          });
        }
      }
    } catch (error) {
      secureLogger.error('Erro ao garantir perfil do usuário', error, {
        component: 'supabaseAuthService',
        action: 'ensureUserProfile'
      });
      // Don't throw here as the user was authenticated successfully
    }
  }

  private async mapSupabaseUserToUser(supabaseUser: SupabaseUser): Promise<User> {
    try {
      // Try to get additional user data from our users table
      const supa = await this.getSupabase();
      const { data: profile } = await supa
        .from('users')
        .select('*')
        .eq('auth_id', supabaseUser.id)
        .single();

      return {
        id: supabaseUser.id,
        fullName: profile?.full_name || supabaseUser.user_metadata?.['full_name'] || supabaseUser.email?.split('@')[0] || 'Usuário',
        email: supabaseUser.email || '',
        role: (profile?.role as Role) || supabaseUser.user_metadata?.['role'] || Role.Patient,
        phone: profile?.phone || supabaseUser.user_metadata?.['phone'] || '',
        avatarUrl: profile?.avatar_url || supabaseUser.user_metadata?.['avatar_url'] || `https://api.dicebear.com/7.x/avataaars/svg?seed=${supabaseUser.email}`,
        emailVerified: !!supabaseUser.email_confirmed_at,
        createdAt: supabaseUser.created_at,
        lastSignIn: supabaseUser.last_sign_in_at,
        mfaEnabled: profile?.two_factor_enabled || (supabaseUser.factors && supabaseUser.factors.length > 0),
      };
    } catch (error) {
      secureLogger.error('Erro ao mapear usuário', error, {
        component: 'supabaseAuthService',
        action: 'mapSupabaseUserToUser',
        userId: supabaseUser.id
      });
      // Fallback to basic user data
      return {
        id: supabaseUser.id,
        fullName: supabaseUser.user_metadata?.['full_name'] || supabaseUser.email?.split('@')[0] || 'Usuário',
        email: supabaseUser.email || '',
        role: supabaseUser.user_metadata?.['role'] || Role.Patient,
        phone: supabaseUser.user_metadata?.['phone'] || '',
        avatarUrl: supabaseUser.user_metadata?.['avatar_url'] || `https://api.dicebear.com/7.x/avataaars/svg?seed=${supabaseUser.email}`,
        emailVerified: !!supabaseUser.email_confirmed_at,
        createdAt: supabaseUser.created_at,
        lastSignIn: supabaseUser.last_sign_in_at,
        mfaEnabled: false,
      };
    }
  }

  // Social login methods
  async loginWithGoogle(): Promise<void> {
    try {
      const supa = await this.getSupabase();
      const { error } = await supa.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        }
      });
      if (error) throw error;
    } catch (error: any) {
      throw new Error(handleSupabaseError(error));
    }
  }

  async loginWithGitHub(): Promise<void> {
    try {
      const supa = await this.getSupabase();
      const { error } = await supa.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          scopes: 'user:email',
        }
      });
      if (error) throw error;
    } catch (error: any) {
      throw new Error(handleSupabaseError(error));
    }
  }

  async loginWithApple(): Promise<void> {
    try {
      const supa = await this.getSupabase();
      const { error } = await supa.auth.signInWithOAuth({
        provider: 'apple',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          scopes: 'name email',
        }
      });
      if (error) throw error;
    } catch (error: any) {
      throw new Error(handleSupabaseError(error));
    }
  }

  // Session management
  async refreshSession(): Promise<void> {
    try {
      const supa = await this.getSupabase();
      const { error } = await supa.auth.refreshSession();
      if (error) throw error;
    } catch (error: any) {
      throw new Error(handleSupabaseError(error));
    }
  }

  isSessionExpired(): boolean {
    const session = this.currentState.session;
    if (!session) return true;

    const expiresAt = new Date(session.expires_at * 1000);
    return expiresAt <= new Date();
  }

  // Mock authentication methods for development - removed duplicate

}

// Create singleton instance
export const authService = new SupabaseAuthService();
export default authService;