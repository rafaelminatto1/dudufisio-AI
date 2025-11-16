import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/shared/components/ui/card';
import Section from '@/shared/components/layout/Section';
import StatsCard from '@/shared/components/ui/StatsCard';
import ResponsiveContainer from '@/components/ui/ResponsiveContainer';
import { PatientTable } from '@/components/patients/PatientTable';
import { usePatient } from '@/contexts/PatientContext';
import LoadingState from '@/components/ui/LoadingState';
import ErrorState from '@/components/ui/ErrorState';
import EmptyState from '@/components/ui/EmptyState';
import { handleError } from '@/lib/middleware/errorHandler';
import { H1, Body, Small, NumericValue } from '@/shared/components/ui/Typography';
import { Users, UserCheck, UserX, CheckCircle2 } from 'lucide-react';

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
      <Section variant="white" paddingY="5xl">
        <ResponsiveContainer>
          <LoadingState
            message="Carregando lista de pacientes..."
            size="lg"
          />
        </ResponsiveContainer>
      </Section>
    );
  }

  if (error && patients.length === 0) {
    return (
      <Section variant="white" paddingY="5xl">
        <ResponsiveContainer>
          <ErrorState
            error={error}
            onRetry={handleRetry}
            title="Erro ao carregar pacientes"
            message="Não foi possível carregar a lista de pacientes. Tente novamente."
          />
        </ResponsiveContainer>
      </Section>
    );
  }

  if (!isLoading && patients.length === 0) {
    return (
      <Section variant="white" paddingY="5xl">
        <ResponsiveContainer>
          <EmptyState
            type="users"
            title="Nenhum paciente cadastrado"
            description="Comece adicionando seu primeiro paciente para gerenciar consultas e tratamentos."
            actionText="Cadastrar primeiro paciente"
            onAction={() => navigate('/patients/new')}
          />
        </ResponsiveContainer>
      </Section>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header Section */}
      <Section variant="white" paddingY="lg">
        <ResponsiveContainer>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <H1>Lista de Pacientes</H1>
              <Body className="text-neutral-textSecondary mt-sm">
                Gerencie todos os pacientes da clínica
              </Body>
            </div>
          </div>
        </ResponsiveContainer>
      </Section>

      {/* Stats Section */}
      <Section variant="gray" paddingY="lg">
        <ResponsiveContainer>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-lg">
            <StatsCard
              title="Total de Pacientes"
              value={stats.loading ? '...' : stats.total}
              icon={Users}
              variant="primary"
              caption="Todos os pacientes"
            />
            <StatsCard
              title="Pacientes Ativos"
              value={stats.loading ? '...' : stats.active}
              icon={UserCheck}
              variant="success"
              caption="Em tratamento"
            />
            <StatsCard
              title="Pacientes Inativos"
              value={stats.loading ? '...' : stats.inactive}
              icon={UserX}
              variant="warning"
              caption="Temporariamente inativos"
            />
            <StatsCard
              title="Pacientes com Alta"
              value={stats.loading ? '...' : stats.discharged}
              icon={CheckCircle2}
              variant="info"
              caption="Tratamento concluído"
            />
          </div>
        </ResponsiveContainer>
      </Section>

      {/* Table Section */}
      <Section variant="white" paddingY="lg">
        <ResponsiveContainer>
          <Card>
            <CardContent className="p-lg">
              <PatientTable
                patients={patients}
                loading={isLoading}
                onRowClick={handleViewPatient}
              />
            </CardContent>
          </Card>
        </ResponsiveContainer>
      </Section>
    </div>
  );
};

export default PatientListPage;