import { useState, useEffect, useCallback } from 'react';
import { User } from '@supabase/supabase-js';
import authService, { UserProfile, LoginCredentials, SignUpData } from '../../services/auth/authService';
import { supabase } from '../../lib/supabase';

export interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
}

export const useSupabaseAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    profile: null,
    loading: true,
    error: null,
  });

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      try {
        const user = await authService.getCurrentUser();
        if (user) {
          const profile = await authService.getUserProfile(user.id);
          setAuthState({
            user,
            profile,
            loading: false,
            error: null,
          });
        } else {
          setAuthState({
            user: null,
            profile: null,
            loading: false,
            error: null,
          });
        }
      } catch (error) {
        setAuthState({
          user: null,
          profile: null,
          loading: false,
          error: error instanceof Error ? error.message : 'Erro ao carregar autenticação',
        });
      }
    };

    initAuth();

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const profile = await authService.getUserProfile(session.user.id);
        setAuthState({
          user: session.user,
          profile,
          loading: false,
          error: null,
        });
      } else {
        setAuthState({
          user: null,
          profile: null,
          loading: false,
          error: null,
        });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Sign in
  const signIn = useCallback(async (credentials: LoginCredentials) => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const { user, profile } = await authService.signIn(credentials);
      setAuthState({
        user,
        profile,
        loading: false,
        error: null,
      });
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao fazer login';
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
      return { success: false, error: errorMessage };
    }
  }, []);

  // Sign up
  const signUp = useCallback(async (data: SignUpData) => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const { user, profile } = await authService.signUp(data);
      setAuthState({
        user,
        profile,
        loading: false,
        error: null,
      });
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao criar conta';
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
      return { success: false, error: errorMessage };
    }
  }, []);

  // Sign out
  const signOut = useCallback(async () => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      await authService.signOut();
      setAuthState({
        user: null,
        profile: null,
        loading: false,
        error: null,
      });
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao sair';
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
      return { success: false, error: errorMessage };
    }
  }, []);

  // Update profile
  const updateProfile = useCallback(async (updates: Partial<UserProfile>) => {
    if (!authState.user) {
      return { success: false, error: 'Usuário não autenticado' };
    }

    setAuthState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const updatedProfile = await authService.updateProfile(authState.user.id, updates);
      setAuthState(prev => ({
        ...prev,
        profile: updatedProfile,
        loading: false,
        error: null,
      }));
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao atualizar perfil';
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
      return { success: false, error: errorMessage };
    }
  }, [authState.user]);

  // Reset password
  const resetPassword = useCallback(async (email: string) => {
    try {
      await authService.resetPassword(email);
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao resetar senha';
      return { success: false, error: errorMessage };
    }
  }, []);

  // Update password
  const updatePassword = useCallback(async (newPassword: string) => {
    try {
      await authService.updatePassword(newPassword);
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao atualizar senha';
      return { success: false, error: errorMessage };
    }
  }, []);

  // Check if user has role
  const hasRole = useCallback((requiredRoles: string[]) => {
    if (!authState.profile) return false;
    return requiredRoles.includes(authState.profile.role);
  }, [authState.profile]);

  // Check if user is authenticated
  const isAuthenticated = useCallback(() => {
    return !!authState.user;
  }, [authState.user]);

  return {
    ...authState,
    signIn,
    signUp,
    signOut,
    updateProfile,
    resetPassword,
    updatePassword,
    hasRole,
    isAuthenticated,
  };
};

export default useSupabaseAuth;
