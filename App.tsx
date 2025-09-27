import React from 'react';
import AppRoutes from './AppRoutes';

/**
 * Mantido como entry point alternativo para cenários de testes/Storybook.
 * Encaminha diretamente para o roteador principal da aplicação.
 */
const App: React.FC = () => {
  return <AppRoutes />;
};

export default App;
