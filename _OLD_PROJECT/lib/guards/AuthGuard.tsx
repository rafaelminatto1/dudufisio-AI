/**
 * AuthGuard - Proteção de Autenticação
 * 
 * Componente que protege rotas que requerem autenticação.
 * Redireciona para /login se usuário não estiver autenticado.
 * 
 * Baseado em BUSINESS_RULES.md (RN-020 a RN-022)
 */

import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface AuthGuardProps {
  children: React.ReactNode;
  redirectTo?: string;
  fallback?: React.ReactNode;
}

/**
 * AuthGuard Component
 * 
 * Uso:
 * ```tsx
 * <AuthGuard>
 *   <ProtectedPage />
 * </AuthGuard>
 * ```
 */
export function AuthGuard({ 
  children, 
  redirectTo = '/login',
  fallback 
}: AuthGuardProps) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    if (!loading && !user) {
      // Salva a rota atual para redirecionar após login
      const returnUrl = location.pathname + location.search;
      navigate(redirectTo, { 
        state: { from: returnUrl },
        replace: true 
      });
    }
  }, [user, loading, navigate, redirectTo, location]);
  
  // Mostra loading enquanto verifica autenticação
  if (loading) {
    return fallback || (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  // Se não autenticado, não renderiza nada (vai redirecionar)
  if (!user) {
    return null;
  }
  
  // Se autenticado, renderiza children
  return <>{children}</>;
}

/**
 * Hook para verificar autenticação programaticamente
 */
export function useAuthGuard() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  
  const requireAuth = (redirectTo: string = '/login') => {
    if (!loading && !user) {
      navigate(redirectTo, { replace: true });
      return false;
    }
    return true;
  };
  
  return {
    isAuthenticated: !!user,
    isLoading: loading,
    requireAuth,
  };
}

export default AuthGuard;

