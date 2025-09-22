import { supabase, handleSupabaseError } from '../../lib/supabase';
import { User, Role } from '../../types';
import type { AuthError, AuthResponse, User as SupabaseUser } from '@supabase/supabase-js';

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
      // Get initial session
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        const user = await this.mapSupabaseUserToUser(session.user);
        this.updateState({ user, session, loading: false });
      } else {
        this.updateState({ user: null, session: null, loading: false });
      }

      // Listen for auth changes
      supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          const user = await this.mapSupabaseUserToUser(session.user);
          this.updateState({ user, session, loading: false });
        } else if (event === 'SIGNED_OUT') {
          this.updateState({ user: null, session: null, loading: false });
        } else if (event === 'TOKEN_REFRESHED' && session?.user) {
          const user = await this.mapSupabaseUserToUser(session.user);
          this.updateState({ user, session, loading: false });
        }
      });
    } catch (error) {
      console.error('Auth initialization error:', error);
      this.updateState({ user: null, session: null, loading: false });
    }
  }

  private updateState(newState: Partial<AuthState>) {
    this.currentState = { ...this.currentState, ...newState };
    this.listeners.forEach(listener => listener(this.currentState));
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

      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (error) throw error;
      if (!data.user) throw new Error('Login falhou');

      const user = await this.mapSupabaseUserToUser(data.user);
      return user;
    } catch (error: any) {
      // If Supabase fails and we have demo credentials, try mock auth
      if (this.shouldUseMockAuth(credentials)) {
        return this.mockLogin(credentials);
      }
      throw new Error(handleSupabaseError(error));
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
        });

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
        name: profile?.name || supabaseUser.user_metadata?.name || 'Usuário',
        role: profile?.role || supabaseUser.user_metadata?.role || Role.Patient,
        phone: profile?.phone || supabaseUser.user_metadata?.phone || '',
        avatarUrl: profile?.avatar_url || supabaseUser.user_metadata?.avatar_url || '',
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
        name: supabaseUser.user_metadata?.name || 'Usuário',
        role: supabaseUser.user_metadata?.role || Role.Patient,
        phone: supabaseUser.user_metadata?.phone || '',
        avatarUrl: supabaseUser.user_metadata?.avatar_url || '',
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
          redirectTo: `${window.location.origin}/dashboard`
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
          redirectTo: `${window.location.origin}/dashboard`
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

  // Mock authentication methods for development
  private shouldUseMockAuth(credentials: LoginCredentials): boolean {
    const demoEmails = [
      'admin@dudufisio.com',
      'therapist@dudufisio.com',
      'patient@dudufisio.com',
      'educator@dudufisio.com'
    ];

    // Check if using demo credentials or if Supabase is not properly configured
    const isUsingDemoCredentials = demoEmails.includes(credentials.email) &&
                                   credentials.password === 'demo123456';

    const supabaseNotConfigured = !import.meta.env.VITE_SUPABASE_ANON_KEY ||
                                  import.meta.env.VITE_SUPABASE_ANON_KEY === 'your_anon_key_here';

    return isUsingDemoCredentials || supabaseNotConfigured;
  }

  private async mockLogin(credentials: LoginCredentials): Promise<User> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Mock user data based on email
    const mockUserData = {
      'admin@dudufisio.com': {
        id: 'user_admin',
        name: 'Admin',
        email: 'admin@dudufisio.com',
        role: 'Admin' as const,
        avatarUrl: 'https://i.pravatar.cc/150?u=user_admin',
        phone: '(11) 98765-4321'
      },
      'therapist@dudufisio.com': {
        id: 'user_1',
        name: 'Dr. Roberto',
        email: 'therapist@dudufisio.com',
        role: 'Therapist' as const,
        avatarUrl: 'https://i.pravatar.cc/150?u=user_1',
        phone: '(11) 91234-5678'
      },
      'patient@dudufisio.com': {
        id: 'user_patient_1',
        name: 'Ana Beatriz Costa',
        email: 'patient@dudufisio.com',
        role: 'Patient' as const,
        avatarUrl: 'https://picsum.photos/id/1027/200/200',
        patientId: '1',
        phone: '(11) 98765-4321'
      },
      'educator@dudufisio.com': {
        id: 'user_educator_1',
        name: 'Dra. Juliana',
        email: 'educator@dudufisio.com',
        role: 'EducadorFisico' as const,
        avatarUrl: 'https://i.pravatar.cc/150?u=user_educator_1',
        phone: '(11) 91111-2222'
      }
    };

    const user = mockUserData[credentials.email as keyof typeof mockUserData];

    if (!user) {
      throw new Error('Credenciais inválidas');
    }

    // Create mock session
    const mockSession = {
      access_token: 'mock_access_token',
      expires_at: Math.floor(Date.now() / 1000) + 3600,
      user: { id: user.id, email: user.email }
    };

    // Update state
    this.updateState({
      user: user as User,
      session: mockSession,
      loading: false
    });

    console.log('🎭 Mock authentication successful for:', user.email);
    return user as User;
  }
}

// Create singleton instance
export const authService = new SupabaseAuthService();
export default authService;