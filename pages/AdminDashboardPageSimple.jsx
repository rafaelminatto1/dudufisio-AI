import React from 'react';
const AdminDashboardPageSimple = () => {
    const [test, setTest] = React.useState('test');
    return (<div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-slate-900 mb-2">
          Dashboard Administrativo (Teste)
        </h1>
        <p className="text-xl text-slate-600">
          Estado: {test}
        </p>
        <button onClick={() => setTest('clicked')} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded">
          Testar useState
        </button>
      </div>
    </div>);
};
export default AdminDashboardPageSimple;
