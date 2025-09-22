

import React from 'react';
import AppRoutes from './AppRoutes';
import { DebugProvider } from './contexts/DebugContext';
import { AppProvider } from './contexts/AppContext';
import { DataProvider } from './contexts/DataContext';
import { SupabaseAuthProvider } from './contexts/SupabaseAuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { ThemeProvider } from './design-system/ThemeProvider';
import ToastContainer from './components/ui/Toast';

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <DebugProvider>
        <SupabaseAuthProvider>
          <AppProvider>
            <DataProvider>
              <ToastProvider>
                <AppRoutes />
                <ToastContainer />
              </ToastProvider>
            </DataProvider>
          </AppProvider>
        </SupabaseAuthProvider>
      </DebugProvider>
    </ThemeProvider>
  );
};

export default App;