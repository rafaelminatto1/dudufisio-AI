# 🚀 Guia de Otimização de Performance - AppRoutes.tsx

## 📋 Objetivo
Reduzir os warnings de performance de ~69ms para <16ms (60fps) no componente AppRoutes.

## 🔧 Implementação Passo a Passo

### Passo 1: Memoização de Providers

**Arquivo**: `AppRoutes.tsx` (linhas 400-430)

```typescript
// ADICIONAR import
import { useMemo, useCallback, useEffect } from 'react';

// ADICIONAR dentro do componente AppRoutes
const AppRoutes: React.FC = () => {
  const { user, loading: authLoading } = useSupabaseAuth();
  
  // Memoizar configurações de providers
  const providerConfig = useMemo(() => ({
    supabase: {
      url: import.meta.env.VITE_SUPABASE_URL,
      anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
    },
    app: {
      enableAnalytics: true,
      enableMonitoring: true,
      performanceTracking: true,
    },
    debug: {
      enableLogs: import.meta.env.DEV,
      enableProfiling: import.meta.env.DEV,
    }
  }), []);

  // Memoizar providers por role
  const getProvidersByRole = useCallback((role: Role) => {
    switch (role) {
      case 'patient':
        return PatientProviders;
      case 'partner':
        return PartnerProviders;
      default:
        return TherapistProviders;
    }
  }, []);

  // Componente memoizado para providers
  const ProviderStack = useMemo(() => {
    if (authLoading || !user) return null;
    
    const Providers = getProvidersByRole(user.role);
    return ({ children }: { children: React.ReactNode }) => (
      <Providers config={providerConfig}>
        {children}
      </Providers>
    );
  }, [user, authLoading, getProvidersByRole, providerConfig]);

  return (
    <PerformanceProfiler id="app-routes">
      {ProviderStack && (
        <ProviderStack>
          <RouterContent />
        </ProviderStack>
      )}
    </PerformanceProfiler>
  );
};
```

### Passo 2: Separar Providers por Role

**Criar novo arquivo**: `components/providers/RoleBasedProviders.tsx`

```typescript
import React, { memo } from 'react';
import { SupabaseAuthProvider } from '@/contexts/SupabaseAuthContext';
import { AppProvider } from '@/contexts/AppContext';
import { PatientProvider } from '@/contexts/PatientContext';
import { ExerciseProvider } from '@/contexts/ExerciseContext';
import { ToastProvider } from '@/contexts/ToastContext';
import { DebugProvider } from '@/contexts/DebugContext';
import { SafeOfflineProvider } from '@/contexts/SafeOfflineContext';

interface ProviderProps {
  children: React.ReactNode;
  config: any;
}

// Provider base memoizado
const BaseProviders: React.FC<ProviderProps> = memo(({ children, config }) => (
  <DebugProvider>
    <ToastProvider>
      <SafeOfflineProvider>
        {children}
      </SafeOfflineProvider>
    </ToastProvider>
  </DebugProvider>
));

// Providers para terapeutas (default)
export const TherapistProviders: React.FC<ProviderProps> = memo(({ children, config }) => (
  <BaseProviders config={config}>
    <AppProvider config={config.app}>
      <PatientProvider>
        <ExerciseProvider>
          {children}
        </ExerciseProvider>
      </PatientProvider>
    </AppProvider>
  </BaseProviders>
));

// Providers para pacientes
export const PatientProviders: React.FC<ProviderProps> = memo(({ children, config }) => (
  <BaseProviders config={config}>
    <AppProvider config={config.app}>
      <PatientProvider>
        {children}
      </PatientProvider>
    </AppProvider>
  </BaseProviders>
));

// Providers para parceiros
export const PartnerProviders: React.FC<ProviderProps> = memo(({ children, config }) => (
  <BaseProviders config={config}>
    <AppProvider config={config.app}>
      <PatientProvider>
        {children}
      </PatientProvider>
    </AppProvider>
  </BaseProviders>
));
```

### Passo 3: Lazy Loading Otimizado

**Modificar**: `AppRoutes.tsx` (Dashboard lazy loading)

```typescript
// ADICIONAR imports
import { lazy, Suspense, useState, useEffect } from 'react';

// ADICIONAR componente de preload inteligente
const usePreloadDashboard = (role: Role) => {
  const [dashboardLoaded, setDashboardLoaded] = useState(false);

  useEffect(() => {
    const preloadDashboard = async () => {
      try {
        switch (role) {
          case 'patient':
            await import('../pages/PatientPortalDashboard');
            break;
          case 'partner':
            await import('../pages/PartnerPortalDashboard');
            break;
          default:
            await import('../pages/MainDashboard');
            break;
        }
        setDashboardLoaded(true);
      } catch (error) {
        console.error('Failed to preload dashboard:', error);
      }
    };

    // Preload após 1 segundo de delay para não bloquear render inicial
    const timer = setTimeout(preloadDashboard, 1000);
    return () => clearTimeout(timer);
  }, [role]);

  return dashboardLoaded;
};

// MODIFICAR componente de rota
const AuthenticatedApp: React.FC = () => {
  const { user } = useSupabaseAuth();
  const dashboardLoaded = usePreloadDashboard(user?.role || 'therapist');

  // Lazy load com preload
  const MainDashboard = lazy(() => import('../pages/MainDashboard'));
  const PatientPortalDashboard = lazy(() => import('../pages/PatientPortalDashboard'));
  const PartnerPortalDashboard = lazy(() => import('../pages/PartnerPortalDashboard'));

  const getDashboardComponent = () => {
    switch (user?.role) {
      case 'patient':
        return PatientPortalDashboard;
      case 'partner':
        return PartnerPortalDashboard;
      default:
        return MainDashboard;
    }
  };

  const DashboardComponent = getDashboardComponent();

  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        <Route path="/*" element={<DashboardComponent />} />
      </Routes>
    </Suspense>
  );
};
```

### Passo 4: Memoização de Componentes de Rota

**Criar**: `components/router/MemoizedRoutes.tsx`

```typescript
import React, { memo, useMemo } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Role } from '@/types';

interface MemoizedRoutesProps {
  role: Role;
  isAuthenticated: boolean;
}

// Componente de loading otimizado
const LoadingFallback = memo(() => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
  </div>
));

// Rotas memoizadas por role
const createRoutesForRole = (role: Role) => {
  switch (role) {
    case 'patient':
      return [
        { path: '/', element: <Navigate to="/dashboard" replace /> },
        { path: '/dashboard', element: <PatientDashboard /> },
        { path: '/exercises', element: <PatientExercises /> },
        { path: '/profile', element: <PatientProfile /> },
      ];
    case 'partner':
      return [
        { path: '/', element: <Navigate to="/dashboard" replace /> },
        { path: '/dashboard', element: <PartnerDashboard /> },
        { path: '/analytics', element: <PartnerAnalytics /> },
      ];
    default: // therapist
      return [
        { path: '/', element: <Navigate to="/dashboard" replace /> },
        { path: '/dashboard', element: <MainDashboard /> },
        { path: '/exercises', element: <ExercisesPage /> },
        { path: '/patients', element: <PatientsPage /> },
        { path: '/agenda', element: <AgendaPage /> },
        { path: '/design-system', element: <DesignSystemPage /> },
      ];
  }
};

export const MemoizedRoutes: React.FC<MemoizedRoutesProps> = memo(({ role, isAuthenticated }) => {
  const routes = useMemo(() => createRoutesForRole(role), [role]);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <Routes>
      {routes.map((route) => (
        <Route
          key={route.path}
          path={route.path}
          element={route.element}
        />
      ))}
    </Routes>
  );
});
```

### Passo 5: Otimização Final no AppRoutes Principal

**Modificar**: `AppRoutes.tsx` (versão otimizada completa)

```typescript
import React, { useMemo, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { PerformanceProfiler } from '@/lib/performanceOptimizations';
import { MemoizedRoutes } from '@/components/router/MemoizedRoutes';
import { TherapistProviders, PatientProviders, PartnerProviders } from '@/components/providers/RoleBasedProviders';

// Lazy load das páginas de auth
const LoginPage = lazy(() => import('@/pages/LoginPage'));
const RegisterPage = lazy(() => import('@/pages/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('@/pages/ForgotPasswordPage'));

// Loading otimizado
const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <p className="text-gray-600">Carregando...</p>
    </div>
  </div>
);

export const AppRoutes: React.FC = () => {
  const { user, loading } = useSupabaseAuth();

  // Memoizar configuração de providers
  const providerConfig = useMemo(() => ({
    enableAnalytics: true,
    enableMonitoring: true,
    performanceTracking: true,
  }), []);

  // Selecionar providers baseado na role
  const getProvidersByRole = useCallback((role: string) => {
    switch (role) {
      case 'patient':
        return PatientProviders;
      case 'partner':
        return PartnerProviders;
      default:
        return TherapistProviders;
    }
  }, []);

  if (loading) {
    return <LoadingFallback />;
  }

  const Providers = user ? getProvidersByRole(user.role) : React.Fragment;

  return (
    <PerformanceProfiler id="app-routes">
      <BrowserRouter>
        <Providers config={providerConfig}>
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              {/* Rotas públicas */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              
              {/* Rotas protegidas */}
              <Route 
                path="/*" 
                element={
                  user ? (
                    <MemoizedRoutes 
                      role={user.role} 
                      isAuthenticated={!!user} 
                    />
                  ) : (
                    <Navigate to="/login" replace />
                  )
                } 
              />
            </Routes>
          </Suspense>
        </Providers>
      </BrowserRouter>
    </PerformanceProfiler>
  );
};

export default AppRoutes;
```

## 📊 Resultados Esperados

### Antes da Otimização
- **Tempo de Render**: ~69ms ❌
- **FPS**: ~14fps ❌
- **Bundle Size**: Completo para todos os usuários ❌

### Depois da Otimização
- **Tempo de Render**: ~12ms ✅
- **FPS**: 60fps estável ✅
- **Bundle Size**: -40% por role ✅

## 🧪 Teste de Performance

```typescript
// Adicionar ao PerformanceProfiler
const performanceMetrics = {
  renderTime: performance.now(),
  bundleSize: await getBundleSize(),
  memoryUsage: performance.memory?.usedJSHeapSize,
};

console.log('Performance Metrics:', {
  renderTime: `${performanceMetrics.renderTime.toFixed(2)}ms`,
  bundleSize: `${(performanceMetrics.bundleSize / 1024).toFixed(2)}KB`,
  memoryUsage: `${(performanceMetrics.memoryUsage / 1024 / 1024).toFixed(2)}MB`,
});
```

## ⚠️ Pontos de Atenção

1. **Testar todos os fluxos de usuário** após implementação
2. **Verificar bundle splitting** não quebrou funcionalidades
3. **Confirmar memoização** não causou stale props
4. **Validar preload timing** não afeta UX inicial

## 📅 Cronograma Sugerido

- **Fase 1** (1-2 dias): Implementar memoização de providers
- **Fase 2** (2-3 dias): Lazy loading otimizado
- **Fase 3** (1-2 dias): Memoized routes e testes
- **Fase 4** (1 dia): Performance testing e ajustes finais

**Total estimado**: 5-8 dias para implementação completa