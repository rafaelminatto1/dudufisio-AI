import React from 'react';

const App: React.FC = () => {
  console.log('🚀 App component rendering...');

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          DuduFisio-AI - Teste Local
        </h1>
        <p className="text-gray-600 mb-4">
          Aplicação carregada com sucesso!
        </p>
        <div className="text-sm text-gray-500">
          React está funcionando normalmente.
        </div>
      </div>
    </div>
  );
};

export default App;