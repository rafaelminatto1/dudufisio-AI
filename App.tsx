import React from 'react';
import AppRoutes from './AppRoutes';
import { ErrorBoundary } from './components/ErrorBoundary';
import { SkipLinks } from './lib/accessibility';

/**
 * Mantido como entry point alternativo para cenários de testes/Storybook.
 * Encaminha diretamente para o roteador principal da aplicação.
 */
const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <SkipLinks />
      <AppRoutes />
    </ErrorBoundary>
  );
};

export default App;
