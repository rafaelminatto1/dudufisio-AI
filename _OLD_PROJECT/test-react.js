// Teste simples para verificar se o React está funcionando
import React from 'react';
import { createRoot } from 'react-dom/client';

console.log('React version:', React.version);
console.log('React object:', React);
console.log('useState available:', typeof React.useState);

// Teste básico de useState
const TestComponent = () => {
  const [state, setState] = React.useState('test');
  return React.createElement('div', null, state);
};

console.log('Test component created successfully');
