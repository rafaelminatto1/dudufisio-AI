/**
 * Página de Dashboard do Paciente
 * MoocaFisio - App para Pacientes
 */

import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { getStats, StatsResponse } from '../services/patientStatsService';
import { getPatientData } from '../services/patientAuthService';
import PatientLayout from '../components/PatientLayout';
import Card from '../components/ui/Card';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ProgressChart from '../components/ProgressChart';
import { Activity, Calendar, TrendingUp, Target, ChevronRight } from 'lucide-react';
import { formatLongDate, calculatePercentage } from '../lib/utils';

export default function PatientDashboardPage() {
  const [data, setData] = useState<StatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const location = useLocation();
  
  const patient = getPatientData();
  const isRemote = location.pathname.startsWith('/patient/');
  const basePath = isRemote ? '/patient' : '';
  
  useEffect(() => {
    loadStats();
  }, []);
  
  const loadStats = async () => {
    try {
      setLoading(true);
      const statsData = await getStats();
      setData(statsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) {
    return (
      <PatientLayout>
        <div className="flex items-center justify-center py-2xl">
          <LoadingSpinner size="lg" />
        </div>
      </PatientLayout>
    );
  }
  
  if (error || !data) {
    return (
      <PatientLayout>
        <Card>
          <div className="text-center py-xl">
            <p className="text-body text-error mb-md">{error || 'Erro ao carregar dados'}</p>
            <button
              onClick={loadStats}
              className="text-primary hover:underline"
            >
              Tentar novamente
            </button>
          </div>
        </Card>
      </PatientLayout>
    );
  }
  
  const completionRate = calculatePercentage(
    data.stats.exercisesCompleted,
    data.stats.exercisesTotal
  );
  
  return (
    <PatientLayout>
      {/* Welcome Section */}
      <div className="mb-xl">
        <h1 className="text-h2 text-neutral-text mb-sm">
          Olá, {patient?.name?.split(' ')[0] || 'Paciente'}! 👋
        </h1>
        <p className="text-body text-neutral-textSecondary">
          Veja seu progresso e continue se recuperando
        </p>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-lg mb-xl">
        {/* Exercícios de Hoje */}
        <Card>
          <div className="flex items-start justify-between mb-md">
            <div className="flex items-center gap-md">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Activity className="w-6 h-6 text-primary" />
              </div>
            </div>
            <div className="text-right">
              <p className="text-small text-neutral-textSecondary mb-xs">
                Hoje
              </p>
              <p className="text-h1 text-primary font-bold">
                {data.stats.exercisesCompleted}
              </p>
            </div>
          </div>
          <p className="text-small text-neutral-textSecondary mb-xs">
            Exercícios Concluídos
          </p>
          <div className="flex items-center justify-between">
            <p className="text-body text-neutral-text font-medium">
              {data.stats.exercisesToday} restantes
            </p>
            <div className="text-small font-medium text-primary">
              {data.stats.exercisesTotal > 0 ? completionRate : 0}%
            </div>
          </div>
          <div className="w-full bg-neutral-bgAlt rounded-full h-2 mt-sm">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-500"
              style={{ width: `${completionRate}%` }}
            />
          </div>
        </Card>
        
        {/* Sequência */}
        <Card>
          <div className="flex items-start justify-between mb-md">
            <div className="flex items-center gap-md">
              <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center">
                <Target className="w-6 h-6 text-secondary" />
              </div>
            </div>
            <div className="text-right">
              <p className="text-small text-neutral-textSecondary mb-xs">
                Sequência Atual
              </p>
              <p className="text-h1 text-secondary font-bold">
                {data.stats.currentStreak}
              </p>
            </div>
          </div>
          <p className="text-small text-neutral-textSecondary mb-xs">
            Dias consecutivos
          </p>
          <div className="flex items-center justify-between">
            <p className="text-body text-neutral-text font-medium">
              Recorde: {data.stats.longestStreak} dias
            </p>
            <TrendingUp className="w-5 h-5 text-secondary" />
          </div>
        </Card>
        
        {/* Sessões */}
        <Card>
          <div className="flex items-start justify-between mb-md">
            <div className="flex items-center gap-md">
              <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-success" />
              </div>
            </div>
            <div className="text-right">
              <p className="text-small text-neutral-textSecondary mb-xs">
                Sessões
              </p>
              <p className="text-h1 text-success font-bold">
                {data.stats.totalSessions}
              </p>
            </div>
          </div>
          <p className="text-small text-neutral-textSecondary mb-xs">
            Sessões realizadas
          </p>
          <div className="flex items-center justify-between">
            <p className="text-body text-neutral-text font-medium">
              Presença: {data.stats.sessionsAttendanceRate.toFixed(0)}%
            </p>
            <div className="text-small font-medium text-success">
              Excelente!
            </div>
          </div>
        </Card>
      </div>
      
      {/* Próxima Sessão */}
      {data.nextSession && (
        <Card className="mb-xl bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-md">
              <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-small text-neutral-textSecondary mb-xs">
                  Próxima Sessão
                </p>
                <p className="text-h4 text-neutral-text font-semibold">
                  {formatLongDate(data.nextSession.date)}
                </p>
                <p className="text-body text-neutral-textSecondary">
                  às {data.nextSession.time}
                  {data.nextSession.therapist && ` com ${data.nextSession.therapist.name}`}
                </p>
              </div>
            </div>
            <ChevronRight className="w-6 h-6 text-primary" />
          </div>
        </Card>
      )}
      
      {/* Gráfico de Progresso */}
      <Card className="mb-xl">
        <div className="flex items-center justify-between mb-lg">
          <div>
            <h2 className="text-h3 text-neutral-text font-semibold mb-xs">
              Seu Progresso
            </h2>
            <p className="text-small text-neutral-textSecondary">
              Exercícios completados nos últimos 30 dias
            </p>
          </div>
        </div>
        <ProgressChart data={data.progressData} />
      </Card>
      
      {/* Call to Action */}
      <Link to={`${basePath}/exercises`}>
        <Card hoverable className="bg-gradient-to-r from-primary to-primary-dark text-white border-0">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-h4 font-semibold mb-sm">
                Ver Meus Exercícios
              </h3>
              <p className="text-body opacity-90">
                {data.stats.exercisesToday > 0
                  ? `Você ainda tem ${data.stats.exercisesToday} exercício${data.stats.exercisesToday > 1 ? 's' : ''} para fazer hoje`
                  : 'Parabéns! Você completou todos os exercícios de hoje 🎉'
                }
              </p>
            </div>
            <ChevronRight className="w-8 h-8" />
          </div>
        </Card>
      </Link>
    </PatientLayout>
  );
}

