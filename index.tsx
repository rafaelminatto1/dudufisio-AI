
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

console.log('🚀 Starting React application...');

const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error('❌ Root element not found!');
} else {
  console.log('✅ Root element found, creating React app...');

  try {
    const root = createRoot(rootElement);
    root.render(<App />);
    console.log('🎉 React application rendered successfully!');
  } catch (error) {
    console.error('💥 Error rendering React app:', error);
  }
}