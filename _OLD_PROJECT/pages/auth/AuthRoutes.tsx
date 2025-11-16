import React, { Suspense, lazy, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Lazy load para reduzir bundle inicial
const LoginPage = lazy(() => import('./LoginPage'));
const RegisterPage = lazy(() => import('../RegisterPage'));
const ForgotPasswordPage = lazy(() => import('../ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('../ResetPasswordPage'));
const TwoFactorSetupPage = lazy(() => import('./TwoFactorSetupPage'));

const runWhenIdle = (cb: () => void) => {
  if (typeof (window as any).requestIdleCallback === 'function') {
    (window as any).requestIdleCallback(cb, { timeout: 1500 });
  } else {
    setTimeout(cb, 0);
  }
};

interface AuthRoutesProps {
  onSuccess?: () => void;
  show2FASetup?: boolean;
  onBack2FA?: () => void;
  onComplete2FA?: () => void;
}

const LoadingScreen = () => (
  <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
    <div className="text-center">
      <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-indigo-600" />
      <p className="text-gray-600">Carregando...</p>
    </div>
  </div>
);

const AuthRoutes: React.FC<AuthRoutesProps> = ({
  onSuccess,
  show2FASetup = false,
  onBack2FA,
  onComplete2FA
}) => {
  // Prefetch em idle das rotas de auth comuns
  useEffect(() => {
    runWhenIdle(() => {
      import('../RegisterPage');
      import('../ForgotPasswordPage');
      import('../ResetPasswordPage');
      import('./TwoFactorSetupPage');
    });
  }, []);
  // Se está no setup de 2FA, mostrar só essa página
  if (show2FASetup) {
    return (
      <TwoFactorSetupPage
        onComplete={onComplete2FA || (() => {})}
        onBack={onBack2FA || (() => {})}
      />
    );
  }

  return (
    <Suspense fallback={<LoadingScreen />}>
      <Routes>
        <Route path="/login" element={<LoginPage onSuccess={onSuccess} />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/2fa-setup" element={
          <TwoFactorSetupPage
            onComplete={onComplete2FA || (() => {})}
            onBack={onBack2FA || (() => {})}
          />
        } />
        {/* Redirect qualquer rota não autenticada para login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Suspense>
  );
};

export default AuthRoutes;
