import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import ResponsiveContainer from '@/components/ui/ResponsiveContainer';
import { PatientTable } from '@/components/patients/PatientTable';
import { usePatient } from '@/contexts/PatientContext';
import LoadingState from '@/components/ui/LoadingState';
import ErrorState from '@/components/ui/ErrorState';
import EmptyState from '@/components/ui/EmptyState';
import { handleError } from '@/lib/middleware/errorHandler';
import { H1, Body, Small, NumericValue } from '@/components/ui/Typography';

const PatientListPage: React.FC = () => {
  const navigate = useNavigate();
  const { patients, isLoading, error, getAllPatients } = usePatient();
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    discharged: 0,
    loading: true
  });
  const [retryCount, setRetryCount] = useState(0);

  const handleViewPatient = (patient: { id: string }) => navigate(`/patients/${patient.id}`);

  const handleRetry = useCallback(async () => {
    try {
      setRetryCount(prev => prev + 1);
      await getAllPatients();
    } catch (err) {
      handleError(err, {
        operation: 'retryLoadPatients',
        severity: 'medium',
        fallbackMessage: 'Erro ao tentar carregar pacientes novamente',
        context: { 
          retryCount: retryCount + 1,
          component: 'PatientListPage'
        }
      });
    }
  }, [getAllPatients, retryCount]);

  // Calcular estatísticas baseado nos pacientes do contexto
  useEffect(() => {
    const calculateStats = () => {
      const total = patients.length;
      const active = patients.filter(p => p.status === 'Active').length;
      const inactive = patients.filter(p => p.status === 'Inactive').length;
      const discharged = patients.filter(p => p.status === 'Discharged').length;
      
      setStats({
        total,
        active,
        inactive,
        discharged,
        loading: isLoading
      });
    };

    calculateStats();
  }, [patients, isLoading]);

  // Mostrar estados de loading/erro
  if (isLoading && patients.length === 0) {
    return (
      <main className="min-h-screen bg-fisio-neutral-50 py-8" role="main">
        <ResponsiveContainer>
          <LoadingState 
            message="Carregando lista de pacientes..." 
            size="lg"
          />
        </ResponsiveContainer>
      </main>
    );
  }

  if (error && patients.length === 0) {
    return (
      <main className="min-h-screen bg-fisio-neutral-50 py-8" role="main">
        <ResponsiveContainer>
          <ErrorState 
            error={error}
            onRetry={handleRetry}
            title="Erro ao carregar pacientes"
            message="Não foi possível carregar a lista de pacientes. Tente novamente."
          />
        </ResponsiveContainer>
      </main>
    );
  }

  if (!isLoading && patients.length === 0) {
    return (
      <main className="min-h-screen bg-fisio-neutral-50 py-8" role="main">
        <ResponsiveContainer>
          <EmptyState 
            type="users"
            title="Nenhum paciente cadastrado"
            description="Comece adicionando seu primeiro paciente para gerenciar consultas e tratamentos."
            actionText="Cadastrar primeiro paciente"
            onAction={() => navigate('/patients/new')}
          />
        </ResponsiveContainer>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-fisio-neutral-50 py-8" role="main">
      <ResponsiveContainer>
        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 space-y-2 sm:space-y-0">
          <div>
            <H1 className="mb-2">
              Lista de Pacientes
            </H1>
            <Body>
              Gerencie todos os pacientes da clínica
            </Body>
          </div>
          {/* Botão agora fica na toolbar do PatientTable */}
        </header>

        {/* Estatísticas com Gradientes Vibrantes - Paleta FisioFlow */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-fisio-primary-500 to-fisio-primary-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <Small className="opacity-90 mb-2 text-white">Total de Pacientes</Small>
                  <NumericValue className="text-white">{stats.loading ? '...' : stats.total}</NumericValue>
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-fisio-secondary-500 to-fisio-secondary-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <Small className="opacity-90 mb-2 text-white">Pacientes Ativos</Small>
                  <NumericValue className="text-white">{stats.loading ? '...' : stats.active}</NumericValue>
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-fisio-warning-500 to-fisio-warning-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <Small className="opacity-90 mb-2 text-white">Pacientes Inativos</Small>
                  <NumericValue className="text-white">{stats.loading ? '...' : stats.inactive}</NumericValue>
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-fisio-primary-400 to-fisio-primary-500 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <Small className="opacity-90 mb-2 text-white">Pacientes com Alta</Small>
                  <NumericValue className="text-white">{stats.loading ? '...' : stats.discharged}</NumericValue>
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Data Table (Supabase + shadcn) */}
        <div className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-gray-100">
          <PatientTable 
            patients={patients}
            loading={isLoading}
            onRowClick={handleViewPatient}
          />
        </div>
      </ResponsiveContainer>
    </main>
  );
};

export default PatientListPage;