import React from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import AppRoutes from './AppRoutes';
import { ErrorBoundary } from './components/ErrorBoundary';
import { SkipLinks } from './components/SkipLinks';
import { queryClient } from './lib/queryClient';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import './lib/sentry'; // Inicializar Sentry

/**
 * Mantido como entry point alternativo para cenários de testes/Storybook.
 * Encaminha diretamente para o roteador principal da aplicação.
 * 
 * Agora com React Query para cache e otimização de API calls
 */
const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <SkipLinks />
        <AppRoutes />
        {/* DevTools apenas em desenvolvimento */}
        {import.meta.env.DEV && (
          <ReactQueryDevtools initialIsOpen={false} position="bottom-right" />
        )}
        
        {/* Vercel Analytics e Speed Insights */}
        <Analytics />
        <SpeedInsights />
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
