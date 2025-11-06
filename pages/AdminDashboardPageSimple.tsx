import React from 'react';

const AdminDashboardPageSimple: React.FC = () => {
  const [test, setTest] = React.useState('test');
  
  return (
    <div className="min-h-screen bg-neutral-bgAlt py-3xl">
      <div className="max-w-7xl mx-auto px-md sm:px-lg lg:px-xl">
        <h1 className="text-4xl font-bold text-neutral-text mb-sm">
          Dashboard Administrativo (Teste)
        </h1>
        <p className="text-xl text-neutral-textSecondary">
          Estado: {test}
        </p>
        <button 
          onClick={() => setTest('clicked')}
          className="mt-md px-md py-sm bg-primary text-white rounded"
        >
          Testar useState
        </button>
      </div>
    </div>
  );
};

export default AdminDashboardPageSimple;
