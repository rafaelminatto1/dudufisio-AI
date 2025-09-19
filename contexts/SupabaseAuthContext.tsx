import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';
import authService, { UserProfile, LoginCredentials, SignUpData } from '../services/auth/authService';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
  signIn: (credentials: LoginCredentials) => Promise<{ success: boolean; error?: string }>;
  signUp: (data: SignUpData) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ success: boolean; error?: string }>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  updatePassword: (newPassword: string) => Promise<{ success: boolean; error?: string }>;
  hasRole: (roles: string[]) => boolean;
  isAuthenticated: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const SupabaseAuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      try {
        const currentUser = await authService.getCurrentUser();
        if (currentUser) {
          const userProfile = await authService.getUserProfile(currentUser.id);
          setUser(currentUser);
          setProfile(userProfile);
        }
      } catch (err) {
        console.error('Error initializing auth:', err);
        setError(err instanceof Error ? err.message : 'Erro ao carregar autenticação');
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    // Subscribe to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const userProfile = await authService.getUserProfile(session.user.id);
        setUser(session.user);
        setProfile(userProfile);
        setError(null);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setProfile(null);
        setError(null);
        navigate('/login');
      } else if (event === 'TOKEN_REFRESHED' && session?.user) {
        setUser(session.user);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  const signIn = async (credentials: LoginCredentials) => {
    setLoading(true);
    setError(null);
    
    try {
      const { user, profile } = await authService.signIn(credentials);
      setUser(user);
      setProfile(profile);
      
      // Redirect based on role
      if (profile.role === 'patient') {
        navigate('/patient-portal');
      } else {
        navigate('/dashboard');
      }
      
      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao fazer login';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (data: SignUpData) => {
    setLoading(true);
    setError(null);
    
    try {
      const { user, profile } = await authService.signUp(data);
      setUser(user);
      setProfile(profile);
      navigate('/dashboard');
      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar conta';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    setError(null);
    
    try {
      await authService.signOut();
      setUser(null);
      setProfile(null);
      navigate('/login');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao sair';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) {
      return { success: false, error: 'Usuário não autenticado' };
    }

    setLoading(true);
    setError(null);
    
    try {
      const updatedProfile = await authService.updateProfile(user.id, updates);
      setProfile(updatedProfile);
      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar perfil';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await authService.resetPassword(email);
      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao resetar senha';
      return { success: false, error: errorMessage };
    }
  };

  const updatePassword = async (newPassword: string) => {
    try {
      await authService.updatePassword(newPassword);
      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar senha';
      return { success: false, error: errorMessage };
    }
  };

  const hasRole = (roles: string[]) => {
    if (!profile) return false;
    return roles.includes(profile.role);
  };

  const isAuthenticated = () => {
    return !!user && !!profile;
  };

  const value = {
    user,
    profile,
    loading,
    error,
    signIn,
    signUp,
    signOut,
    updateProfile,
    resetPassword,
    updatePassword,
    hasRole,
    isAuthenticated,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default SupabaseAuthProvider;