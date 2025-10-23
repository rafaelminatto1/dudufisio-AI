import { supabase } from '../../lib/supabaseClient';
import { handleSupabaseError } from '../../lib/middleware/errorHandler';
import { retryApiCall } from '../../lib/retryManager';
import { fallbackAuthService } from '../../lib/fallbackAuth';
import { User, Role } from '../../types';
import type { User as SupabaseUser } from '@supabase/supabase-js';

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
  name: string;
  role: Role;
  phone?: string;
}

export interface TwoFactorSetup {
  secret: string;
  qrCode: string;
  backupCodes: string[];
}

class SupabaseAuthService {
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
      console.log('🔄 Inicializando autenticação...');

      // Set a timeout for initialization to prevent infinite loading
      const initTimeout = setTimeout(() => {
        console.warn('⚠️ Auth initialization timeout, falling back to fallback auth');
        this.switchToFallbackAuth();
      }, 8000); // Aumentado para 8 segundos

      try {
        // Get initial session with retry
        const { data: { session }, error: sessionError } = await retryApiCall(
          () => supabase.auth.getSession(),
          'getSession',
          2 // Apenas 2 tentativas para inicialização
        );

        if (sessionError) {
          console.warn('⚠️ Session error, switching to fallback auth:', sessionError.message);
          clearTimeout(initTimeout);
          this.switchToFallbackAuth();
          return;
        }

        if (session?.user) {
          console.log('✅ Usuário autenticado via Supabase');
          const user = await this.mapSupabaseUserToUser(session.user);
          this.updateState({ user, session, loading: false });
        } else {
          console.log('🔄 Nenhuma sessão ativa, redirecionando para login');
          // Não criar usuário mock automaticamente - deixar null para mostrar tela de login
          this.updateState({ user: null, session: null, loading: false });
        }

        // Clear the timeout since we completed successfully
        clearTimeout(initTimeout);

        // Listen for auth changes
        supabase.auth.onAuthStateChange(async (event, session) => {
          console.log('🔄 Auth state change:', event);
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
            console.error('Error handling auth state change:', error);
            // Don't break the app, just log the error
          }
        });

      } catch (error) {
        clearTimeout(initTimeout);
        console.error('❌ Supabase auth failed, switching to fallback:', error);
        this.switchToFallbackAuth();
      }
    } catch (error) {
      console.error('❌ Auth initialization error:', error);
      this.switchToFallbackAuth();
    }
  }

  private switchToFallbackAuth() {
    console.log('🔄 Supabase indisponível, aguardando login manual');
    
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
          
          return parsed.user;
        } else {
          
          localStorage.removeItem('mock_session');
        }
      } catch (e) {
        console.warn('⚠️ Erro ao recuperar sessão mock, removendo:', e);
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
    console.log('💾 Sessão mock persistida no localStorage (válida por 8h)');

    return mockUser;
  }

  private shouldUseMockAuth(credentials: LoginCredentials): boolean {
    // Use mock auth for demo credentials
    const demoCredentials = [
      'admin@dudufisio.com',
      'therapist@dudufisio.com',
      'patient@dudufisio.com',
      'educator@dudufisio.com'
    ];
    return demoCredentials.includes(credentials.email) && credentials.password === 'demo123456';
  }

  private mockLogin(credentials: LoginCredentials): User {
    
    
    const mockUsers: Record<string, User> = {
      'admin@dudufisio.com': {
        id: 'mock-admin-1',
        email: 'admin@dudufisio.com',
        name: 'Administrador',
        role: Role.Admin,
        avatarUrl: '',
        phone: undefined,
        createdAt: new Date().toISOString()
      },
      'therapist@dudufisio.com': {
        id: 'mock-therapist-1',
        email: 'therapist@dudufisio.com',
        name: 'Fisioterapeuta',
        role: Role.Therapist,
        avatarUrl: '',
        phone: undefined,
        createdAt: new Date().toISOString()
      },
      'patient@dudufisio.com': {
        id: 'mock-patient-1',
        email: 'patient@dudufisio.com',
        name: 'Paciente',
        role: Role.Patient,
        avatarUrl: '',
        phone: undefined,
        createdAt: new Date().toISOString()
      },
      'educator@dudufisio.com': {
        id: 'mock-educator-1',
        email: 'educator@dudufisio.com',
        name: 'Educador Físico',
        role: Role.EducadorFisico,
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
    try {
      // Check if we should use mock authentication for development
      if (this.shouldUseMockAuth(credentials)) {
        return this.mockLogin(credentials);
      }

      // Try Supabase first with retry
      const { data, error } = await retryApiCall(
        () => supabase.auth.signInWithPassword({
          email: credentials.email,
          password: credentials.password,
        }),
        'signInWithPassword',
        2
      );

      if (error) throw error;
      if (!data.user) throw new Error('Login falhou');

      const user = await this.mapSupabaseUserToUser(data.user);
      return user;
    } catch (error: any) {
      console.warn('⚠️ Supabase login failed, trying fallback auth:', error);
      
      // If Supabase fails, try fallback auth
      try {
        return await fallbackAuthService.login(credentials.email, credentials.password);
      } catch (fallbackError) {
        // If fallback also fails and we have demo credentials, try mock auth
        if (this.shouldUseMockAuth(credentials)) {
          return this.mockLogin(credentials);
        }
        throw new Error(handleSupabaseError(error));
      }
    }
  }

  async register(userData: RegisterData): Promise<User> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            name: userData.name,
            role: userData.role,
            phone: userData.phone,
          }
        }
      });

      if (error) throw error;
      if (!data.user) throw new Error('Registro falhou');

      // Create user profile in our custom table
      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert({
          id: data.user.id,
          email: userData.email,
          name: userData.name,
          role: userData.role,
          phone: userData.phone,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        } as any);

      if (profileError) {
        console.error('Profile creation error:', profileError);
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
      
      
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error: any) {
      throw new Error(handleSupabaseError(error));
    }
  }

  async resetPassword(email: string): Promise<void> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
    } catch (error: any) {
      throw new Error(handleSupabaseError(error));
    }
  }

  async updatePassword(newPassword: string): Promise<void> {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      if (error) throw error;
    } catch (error: any) {
      throw new Error(handleSupabaseError(error));
    }
  }

  async updateProfile(updates: Partial<User>): Promise<User> {
    try {
      const { data: { user: authUser }, error: authError } = await supabase.auth.updateUser({
        data: {
          name: updates.name,
          phone: updates.phone,
        }
      });

      if (authError) throw authError;
      if (!authUser) throw new Error('Usuário não encontrado');

      // Update profile in our custom table
      const { error: profileError } = await supabase
        .from('user_profiles')
        .update({
          name: updates.name,
          phone: updates.phone,
          updated_at: new Date().toISOString(),
        })
        .eq('id', authUser.id);

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
      const { data, error } = await supabase.auth.mfa.enroll({
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
      const { error } = await supabase.auth.mfa.challengeAndVerify({
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
      const { data, error } = await supabase.auth.mfa.listFactors();
      if (error) throw error;
      return data;
    } catch (error: any) {
      throw new Error(handleSupabaseError(error));
    }
  }

  async disable2FA(factorId: string): Promise<void> {
    try {
      const { error } = await supabase.auth.mfa.unenroll({ factorId });
      if (error) throw error;
    } catch (error: any) {
      throw new Error(handleSupabaseError(error));
    }
  }

  // Role and permission helpers
  async getUserRole(userId: string): Promise<Role> {
    try {
      const { data, error } = await supabase
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
      const { data: existingProfile } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('id', supabaseUser.id)
        .single();

      if (!existingProfile) {
        
        
        // Create profile for OAuth user
        const { error: profileError } = await supabase
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
          console.error('Error creating OAuth user profile:', profileError);
          // Don't throw here as the user was authenticated successfully
        } else {
          
        }
      }
    } catch (error) {
      console.error('Error ensuring user profile:', error);
      // Don't throw here as the user was authenticated successfully
    }
  }

  private async mapSupabaseUserToUser(supabaseUser: SupabaseUser): Promise<User> {
    try {
      // Try to get additional user data from our profiles table
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', supabaseUser.id)
        .single();

      return {
        id: supabaseUser.id,
        email: supabaseUser.email || '',
        name: profile?.name || supabaseUser.user_metadata?.['name'] || 'Usuário',
        role: profile?.role || supabaseUser.user_metadata?.['role'] || Role.Patient,
        phone: profile?.phone || supabaseUser.user_metadata?.['phone'] || '',
        avatarUrl: profile?.avatar_url || supabaseUser.user_metadata?.['avatar_url'] || '',
        emailVerified: !!supabaseUser.email_confirmed_at,
        createdAt: supabaseUser.created_at,
        lastSignIn: supabaseUser.last_sign_in_at,
        mfaEnabled: supabaseUser.factors && supabaseUser.factors.length > 0,
      };
    } catch (error) {
      console.error('Error mapping user:', error);
      // Fallback to basic user data
      return {
        id: supabaseUser.id,
        email: supabaseUser.email || '',
        name: supabaseUser.user_metadata?.['name'] || 'Usuário',
        role: supabaseUser.user_metadata?.['role'] || Role.Patient,
        phone: supabaseUser.user_metadata?.['phone'] || '',
        avatarUrl: supabaseUser.user_metadata?.['avatar_url'] || '',
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
      const { error } = await supabase.auth.signInWithOAuth({
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
      const { error } = await supabase.auth.signInWithOAuth({
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
      const { error } = await supabase.auth.signInWithOAuth({
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
      const { error } = await supabase.auth.refreshSession();
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