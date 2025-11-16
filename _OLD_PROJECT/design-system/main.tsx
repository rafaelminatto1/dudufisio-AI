import React from 'react';
import ReactDOM from 'react-dom/client';
import { ThemeProvider } from './contexts/ThemeContext';
import DesignSystemApp from './pages/DesignSystemApp';
import './styles/globals.css';

function DesignSystemMain() {
  return (
    <ThemeProvider>
      <DesignSystemApp />
    </ThemeProvider>
  );
}

// Create root and render
const root = ReactDOM.createRoot(
  document.getElementById('design-system-root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <DesignSystemMain />
  </React.StrictMode>
);