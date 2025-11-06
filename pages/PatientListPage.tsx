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
import { H1, H2, H3, H4, Body, Small } from '../src/components/ui/Typography';

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
      <main className="min-h-screen bg-secondary-50 py-3xl" role="main">
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
      <main className="min-h-screen bg-secondary-50 py-3xl" role="main">
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
      <main className="min-h-screen bg-secondary-50 py-3xl" role="main">
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
    <main className="min-h-screen bg-neutral-bgAlt py-3xl" role="main">
      <ResponsiveContainer>
        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-md mb-mdxl">
          <div>
            <h1 className="heading-lg-responsive font-bold text-neutral-text mb-sm">
              Lista de Pacientes
            </h1>
            <p className="text-responsive text-fisio-neutral-600">
              Gerencie todos os pacientes da clínica
            </p>
          </div>
          {/* 🔧 FIX: Botão de Novo Paciente estava faltando */}
          <button
            onClick={() => navigate('/patients/new')}
            className="inline-flex items-center justify-center rounded-lg bg-primary hover:bg-fisio-primary-700 px-md py-sm text-sm font-medium text-white shadow-card transition-colors"
          >
            <svg className="w-5 h-5 mr-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Novo Paciente
          </button>
        </header>

        {/* Estatísticas com Gradientes Vibrantes - Paleta MoocaFisio */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-md mb-xl" data-testid="patient-stats">
          <Card className="bg-gradient-to-br from-fisio-primary-500 to-fisio-primary-600 text-white border-0 shadow-cardActive hover:shadow-xl transition-all duration-200" data-testid="stat-total">
            <CardContent className="p-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90 mb-1">Total de Pacientes</p>
                  <p className="text-3xl font-bold" data-testid="stat-total-value">{stats.loading ? '...' : stats.total}</p>
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-fisio-secondary-500 to-fisio-secondary-600 text-white border-0 shadow-cardActive hover:shadow-xl transition-all duration-200" data-testid="stat-active">
            <CardContent className="p-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90 mb-1">Pacientes Ativos</p>
                  <p className="text-3xl font-bold" data-testid="stat-active-value">{stats.loading ? '...' : stats.active}</p>
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-fisio-warning-500 to-fisio-warning-600 text-white border-0 shadow-cardActive hover:shadow-xl transition-all duration-200" data-testid="stat-inactive">
            <CardContent className="p-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90 mb-1">Pacientes Inativos</p>
                  <p className="text-3xl font-bold" data-testid="stat-inactive-value">{stats.loading ? '...' : stats.inactive}</p>
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-fisio-primary-400 to-fisio-primary-500 text-white border-0 shadow-cardActive hover:shadow-xl transition-all duration-200" data-testid="stat-discharged">
            <CardContent className="p-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90 mb-1">Pacientes com Alta</p>
                  <p className="text-3xl font-bold" data-testid="stat-discharged-value">{stats.loading ? '...' : stats.discharged}</p>
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
        <div className="bg-white p-md sm:p-lg rounded-cardLarge shadow-card border border-neutral-border">
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