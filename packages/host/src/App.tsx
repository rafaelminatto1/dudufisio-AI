import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AuthRoutes from './pages/auth/AuthRoutes';

// Lazy load remote microfrontends
const AgendaPage = lazy(() => import('agendaPacientes/AgendaPage'));
const PatientListPage = lazy(() => import('agendaPacientes/PatientListPage'));
const PatientDetailPage = lazy(() => import('agendaPacientes/PatientDetailPage'));
const AcompanhamentoPage = lazy(() => import('tratamentos/AcompanhamentoPage'));
const FinancialDashboardPage = lazy(() => import('financeiro/FinancialDashboardPage'));

// Configure React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <p className="text-gray-600">Carregando...</p>
    </div>
  </div>
);

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          {/* Auth routes */}
          <Route path="/auth/*" element={<AuthRoutes />} />
          
          {/* Agenda & Pacientes (Remote 1) */}
          <Route path="/agenda" element={<AgendaPage />} />
          <Route path="/patients" element={<PatientListPage />} />
          <Route path="/patients/:id" element={<PatientDetailPage />} />
          
          {/* Tratamentos (Remote 2) */}
          <Route path="/acompanhamento" element={<AcompanhamentoPage />} />
          
          {/* Financeiro (Remote 3) */}
          <Route path="/financial" element={<FinancialDashboardPage />} />
          
          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/auth/login" replace />} />
        </Routes>
      </Suspense>
    </QueryClientProvider>
  );
}

export default App;

