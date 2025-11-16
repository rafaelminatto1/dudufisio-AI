/**
 * Componente de proteção de rotas
 * Redireciona para login se não autenticado
 */

import { ReactNode, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { isAuthenticated } from '../services/patientAuthService';

interface PatientAuthGuardProps {
  children: ReactNode;
}

export function PatientAuthGuard({ children }: PatientAuthGuardProps) {
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    if (!isAuthenticated()) {
      // Verificar se está sendo usado como remote ou standalone
      const isRemote = location.pathname.startsWith('/patient/');
      const loginPath = isRemote ? '/patient/login' : '/login';
      navigate(loginPath, { replace: true });
    }
  }, [navigate, location]);
  
  if (!isAuthenticated()) {
    return null;
  }
  
  return <>{children}</>;
}

