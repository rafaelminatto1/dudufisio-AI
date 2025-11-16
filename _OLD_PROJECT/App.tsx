import React, { useEffect } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import AppRoutes from './AppRoutes';
import { ErrorBoundary } from './components/ErrorBoundary';
import { SkipLinks } from './components/SkipLinks';
import { queryClient } from './lib/queryClient';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import './lib/sentry'; // Inicializar Sentry
import { initPerformanceMonitoring, monitorLongTasks } from './services/performanceMonitoring';

/**
 * 🎯 App - Entry Point Principal
 *
 * Mantido como entry point alternativo para cenários de testes/Storybook.
 * Encaminha diretamente para o roteador principal da aplicação.
 *
 * Hierarquia de Providers:
 * 1. ErrorBoundary (top-level, captura tudo)
 * 2. QueryClientProvider (React Query)
 * 3. AppRoutes (contém providers específicos da aplicação)
 *
 * Nota: A hierarquia principal de providers está em AppRoutes.tsx
 * para melhor organização e testabilidade.
 *
 * ✅ FASE 5: Performance Monitoring
 * - Web Vitals (LCP, FID, CLS, FCP, TTFB, INP)
 * - Long Tasks monitoring
 * - Performance budgets tracking
 */
const App: React.FC = () => {
  // ✅ FASE 5: Inicializar Performance Monitoring
  useEffect(() => {
    // Web Vitals (lazy loaded)
    initPerformanceMonitoring();

    // Long Tasks monitoring
    monitorLongTasks();

    console.log('[App] Performance monitoring initialized');
  }, []);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <SkipLinks />
        <AppRoutes />
        {/* DevTools apenas em desenvolvimento */}
        {import.meta.env.DEV && (
          <ReactQueryDevtools initialIsOpen={false} position="bottom" />
        )}
        
        {/* Vercel Analytics e Speed Insights */}
        <Analytics />
        <SpeedInsights />
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
