import React from 'react';

/**
 * Monday Design Showcase - Placeholder
 * 
 * Este componente foi reorganizado.
 * Use o design-system dedicado em /design-system
 */
const MondayDesignShowcase: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl p-12">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
              Design System MoocaFisio
            </h1>
            <p className="text-xl text-gray-600">
              Sistema de design inspirado no Monday.com
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <div className="bg-blue-50 p-6 rounded-lg">
              <h2 className="text-2xl font-bold mb-4">🎨 Design System</h2>
              <p className="text-gray-700 mb-4">
                Execute o design system dedicado para ver todos os componentes:
              </p>
              <code className="bg-white px-4 py-2 rounded block text-sm font-mono">
                npm run design-system:dev
              </code>
            </div>

            <div className="bg-green-50 p-6 rounded-lg">
              <h2 className="text-2xl font-bold mb-4">📚 Componentes</h2>
              <ul className="space-y-2 text-gray-700">
                <li>• Buttons e Forms</li>
                <li>• Cards e Layouts</li>
                <li>• Typography</li>
                <li>• Colors e Spacing</li>
                <li>• Icons e Badges</li>
              </ul>
            </div>
          </div>

          <div className="bg-indigo-50 p-6 rounded-lg">
            <h3 className="text-xl font-bold mb-3">🚀 Acesso Rápido</h3>
            <p className="text-gray-700">
              O design system completo está disponível em:
              <strong className="ml-2">/design-system</strong>
            </p>
            <p className="text-sm text-gray-600 mt-2">
              Veja também: <code className="bg-white px-2 py-1 rounded">npm run storybook</code>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MondayDesignShowcase;

