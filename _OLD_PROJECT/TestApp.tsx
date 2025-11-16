import React from 'react';

const TestApp: React.FC = () => {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-blue-600">
        Teste de React - DuduFisio-AI
      </h1>
      <p className="mt-4 text-gray-600">
        Se você está vendo esta mensagem, o React está funcionando corretamente!
      </p>
      <div className="mt-4 p-4 bg-green-100 border border-green-400 rounded">
        <p className="text-green-700">
          ✅ Aplicação carregada com sucesso!
        </p>
      </div>
    </div>
  );
};

export default TestApp;
