import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import ResponsiveContainer from '@/components/ui/ResponsiveContainer';
import PatientTable from '@/components/patients/PatientTable';

const PatientListPage: React.FC = () => {
  const navigate = useNavigate();
  const handleViewPatient = (patient: { id: string }) => navigate(`/patients/${patient.id}`);

  return (
    <main className="min-h-screen bg-slate-50 py-8" role="main">
      <ResponsiveContainer>
        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="heading-lg-responsive font-bold text-slate-900 mb-2">
              Lista de Pacientes
            </h1>
            <p className="text-responsive text-slate-600">
              Gerencie todos os pacientes da clínica
            </p>
          </div>
          {/* Botão agora fica na toolbar do PatientTable */}
        </header>

        {/* Estatísticas (totais simples - agora contadas na tabela real) */}
        <div className="grid-1-2-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="text-xl sm:text-2xl font-bold text-sky-600">—</div>
              <div className="text-xs sm:text-sm text-slate-600">Total de Pacientes</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-xl sm:text-2xl font-bold text-green-600">—</div>
              <div className="text-xs sm:text-sm text-slate-600">Pacientes Ativos</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-xl sm:text-2xl font-bold text-orange-600">—</div>
              <div className="text-xs sm:text-sm text-slate-600">Pacientes Inativos</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-xl sm:text-2xl font-bold text-purple-600">—</div>
              <div className="text-xs sm:text-sm text-slate-600">Pacientes com Alta</div>
            </CardContent>
          </Card>
        </div>

        {/* Data Table (Supabase + shadcn) */}
        <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm">
          <PatientTable onView={handleViewPatient} />
        </div>
      </ResponsiveContainer>
    </main>
  );
};

export default PatientListPage;