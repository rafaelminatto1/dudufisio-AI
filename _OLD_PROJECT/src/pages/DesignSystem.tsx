import React from 'react';

/**
 * Design System Page
 *
 * Showcases the Monday.com inspired design system
 * 
 * Note: MondayDesignShowcase component was removed from the project
 * Use the design-system app instead: npm run design-system:dev
 */
const DesignSystem = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
      <div className="max-w-2xl bg-white rounded-lg shadow-lg p-8 text-center">
        <h1 className="text-3xl font-bold mb-4">Design System</h1>
        <p className="text-gray-600 mb-6">
          Para visualizar o Design System completo, execute:
        </p>
        <code className="bg-gray-100 px-4 py-2 rounded block mb-4">
          npm run design-system:dev
        </code>
        <p className="text-sm text-gray-500">
          O design system está disponível em /design-system
        </p>
      </div>
    </div>
  );
};

export default DesignSystem;
