import React from 'react';
import AppRoutes from './AppRoutes';
import { ClerkWrapper } from './components/auth/ClerkWrapper';

const App: React.FC = () => {
  return (
    <ClerkWrapper>
      <AppRoutes />
    </ClerkWrapper>
  );
};

export default App;