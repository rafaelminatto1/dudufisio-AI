import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Activity,
  Target,
  TrendingUp,
  Heart,
  Zap,
  Calendar,
  BarChart3,
  AlertCircle,
  CheckCircle2,
  Play
} from 'lucide-react';
import { sportsRehabServiceSupabase } from '../services/sports/sportsRehabServiceSupabase';
import { 
  AthleteProfile, 
  PerformanceMetric, 
  LoadMonitoring,
  RehabProgression,
  SportTrainingSession 
} from '../types/sportsRehabTypes';
import { toast } from 'react-toastify';
import { supabase } from '../lib/supabaseClient';

export const SportsRehabilitationPage: React.FC = () => {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [athleteProfile, setAthleteProfile] = useState<AthleteProfile | null>(null);
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [loadData, setLoadData] = useState<LoadMonitoring[]>([]);
  const [progression, setProgression] = useState<RehabProgression | null>(null);
  const [sessions, setSessions] = useState<SportTrainingSession[]>([]);
  const [patientName, setPatientName] = useState('');

  useEffect(() => {
    if (patientId) {
      loadAthleteData();
    }
  }, [patientId]);

  const loadAthleteData = async () => {
    try {
      setLoading(true);

      if (!patientId) {
        toast.error('ID do paciente não fornecido');
        return;
      }

      // Buscar nome do paciente
      const { data: patientData } = await supabase
        .from('patients')
        .select('full_name')
        .eq('id', patientId)
        .single();

      if (patientData) {
        setPatientName(patientData.full_name);
      }

      // Buscar perfil do atleta
      const profile = await sportsRehabServiceSupabase.getAthleteProfile(patientId);
      setAthleteProfile(profile);

      if (profile) {
        // Buscar métricas
        const performanceMetrics = await sportsRehabServiceSupabase.getPerformanceMetrics(profile.id);
        setMetrics(performanceMetrics);

        // Buscar cargas
        const loads = await sportsRehabServiceSupabase.getLoadMonitoring(profile.id, 8);
        setLoadData(loads);

        // Buscar progressão
        const prog = await sportsRehabServiceSupabase.getRehabProgression(profile.id);
        setProgression(prog);

        // Buscar sessões
        const trainingSessions = await sportsRehabServiceSupabase.getTrainingSessions(profile.id, 10);
        setSessions(trainingSessions);
      }
    } catch (error) {
      console.error('Erro ao carregar dados do atleta:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProfile = async () => {
    if (!patientId) return;

    try {
      const newProfile = await sportsRehabServiceSupabase.upsertAthleteProfile({
        patientId,
        sportType: 'soccer',
        position: 'Midfielder',
        competitionLevel: 'amateur',
        yearsPracticing: 5,
        hoursPerWeek: 10,
        competitionFrequency: 'Semanal',
        dominantSide: 'right',
        currentPhase: 'phase1_acute',
      });

      setAthleteProfile(newProfile);
      toast.success('Perfil de atleta criado com sucesso!');
    } catch (error) {
      console.error('Erro ao criar perfil:', error);
      toast.error('Erro ao criar perfil');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-bgAlt flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-md"></div>
          <p className="text-neutral-textSecondary">Carregando dados do atleta...</p>
        </div>
      </div>
    );
  }

  if (!athleteProfile) {
    return (
      <div className="min-h-screen bg-neutral-bgAlt">
        <div className="max-w-4xl mx-auto px-md py-16">
          <div className="bg-white rounded-lg shadow-cardActive p-xl text-center">
            <Activity className="w-16 h-16 text-blue-500 mx-auto mb-md" />
            <h2 className="text-2xl font-bold text-neutral-text mb-sm">
              Perfil de Atleta Não Encontrado
            </h2>
            <p className="text-neutral-textSecondary mb-xl">
              Este paciente ainda não possui um perfil de reabilitação esportiva.
            </p>
            <div className="flex gap-md justify-center">
              <button
                onClick={() => navigate(-1)}
                className="px-lg py-sm bg-neutral-bgDark text-gray-700 rounded-lg hover:bg-gray-200 transition"
              >
                Voltar
              </button>
              <button
                onClick={handleCreateProfile}
                className="px-lg py-sm bg-primary text-white rounded-lg hover:bg-primary-hover transition"
              >
                Criar Perfil de Atleta
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const getPhaseLabel = (phase: string) => {
    const phases: Record<string, string> = {
      phase1_acute: 'Fase 1: Aguda',
      phase2_intermediate: 'Fase 2: Intermediária',
      phase3_advanced: 'Fase 3: Avançada',
      phase4_sport: 'Fase 4: Específica do Esporte',
      phase5_rtp: 'Fase 5: Retorno ao Esporte',
    };
    return phases[phase] || phase;
  };

  const getSportLabel = (sport: string) => {
    const sports: Record<string, string> = {
      soccer: 'Futebol',
      basketball: 'Basquete',
      volleyball: 'Vôlei',
      tennis: 'Tênis',
      running: 'Corrida',
      swimming: 'Natação',
      cycling: 'Ciclismo',
      martial_arts: 'Artes Marciais',
      gymnastics: 'Ginástica',
      crossfit: 'CrossFit',
      weight_lifting: 'Musculação',
      other: 'Outro',
    };
    return sports[sport] || sport;
  };

  return (
    <div className="min-h-screen bg-neutral-bgAlt">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-cardActive">
        <div className="max-w-7xl mx-auto px-md sm:px-lg lg:px-xl py-3xl">
          <div className="flex items-center gap-md">
            <button
              onClick={() => navigate(-1)}
              className="p-sm hover:bg-white/10 rounded-lg transition"
              aria-label="Voltar"
              title="Voltar"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-1">
                Reabilitação Esportiva
              </h1>
              <p className="text-blue-100">
                {patientName || 'Atleta'} • {getSportLabel(athleteProfile.sportType)}
                {athleteProfile.position && ` • ${athleteProfile.position}`}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-md sm:px-lg lg:px-xl py-3xl">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-lg mb-mdxl">
          <div className="bg-white rounded-lg shadow-cardHover p-lg">
            <div className="flex items-center gap-md mb-sm">
              <div className="p-sm bg-primary-light rounded-lg">
                <Target className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-sm font-medium text-neutral-textSecondary">Fase Atual</h3>
            </div>
            <p className="text-2xl font-bold text-neutral-text">
              {getPhaseLabel(athleteProfile.currentPhase).split(':')[0]}
            </p>
            <p className="text-sm text-neutral-textSecondary mt-xs">
              {getPhaseLabel(athleteProfile.currentPhase).split(':')[1]}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-cardHover p-lg">
            <div className="flex items-center gap-md mb-sm">
              <div className="p-sm bg-success-light rounded-lg">
                <TrendingUp className="w-5 h-5 text-success" />
              </div>
              <h3 className="text-sm font-medium text-neutral-textSecondary">Progresso</h3>
            </div>
            <p className="text-2xl font-bold text-neutral-text">
              {progression?.overallProgress || 0}%
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-sm">
              <div
                className="bg-green-600 h-2 rounded-full transition-all"
                style={{ width: `${progression?.overallProgress || 0}%` }}
              />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-cardHover p-lg">
            <div className="flex items-center gap-md mb-sm">
              <div className="p-sm bg-purple-100 rounded-lg">
                <Activity className="w-5 h-5 text-purple-600" />
              </div>
              <h3 className="text-sm font-medium text-neutral-textSecondary">Sessões</h3>
            </div>
            <p className="text-2xl font-bold text-neutral-text">
              {sessions.length}
            </p>
            <p className="text-sm text-neutral-textSecondary mt-xs">Últimas 10 sessões</p>
          </div>

          <div className="bg-white rounded-lg shadow-cardHover p-lg">
            <div className="flex items-center gap-md mb-sm">
              <div className="p-sm bg-warning-light rounded-lg">
                <Zap className="w-5 h-5 text-warning" />
              </div>
              <h3 className="text-sm font-medium text-neutral-textSecondary">Carga Semanal</h3>
            </div>
            <p className="text-2xl font-bold text-neutral-text">
              {loadData[0]?.acwr.toFixed(2) || '0.00'}
            </p>
            <p className="text-sm text-neutral-textSecondary mt-xs">ACWR</p>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg">
          {/* Perfil do Atleta */}
          <div className="bg-white rounded-lg shadow-cardHover p-lg">
            <h2 className="text-xl font-bold text-neutral-text mb-md flex items-center gap-sm">
              <Activity className="w-5 h-5 text-primary" />
              Perfil do Atleta
            </h2>
            <div className="space-y-sm">
              <div className="flex justify-between py-sm border-b">
                <span className="text-neutral-textSecondary">Esporte</span>
                <span className="font-semibold text-neutral-text">
                  {getSportLabel(athleteProfile.sportType)}
                </span>
              </div>
              <div className="flex justify-between py-sm border-b">
                <span className="text-neutral-textSecondary">Nível</span>
                <span className="font-semibold text-neutral-text">
                  {athleteProfile.competitionLevel}
                </span>
              </div>
              <div className="flex justify-between py-sm border-b">
                <span className="text-neutral-textSecondary">Anos Praticando</span>
                <span className="font-semibold text-neutral-text">
                  {athleteProfile.yearsPracticing} anos
                </span>
              </div>
              <div className="flex justify-between py-sm border-b">
                <span className="text-neutral-textSecondary">Horas/Semana</span>
                <span className="font-semibold text-neutral-text">
                  {athleteProfile.hoursPerWeek}h
                </span>
              </div>
              <div className="flex justify-between py-sm border-b">
                <span className="text-neutral-textSecondary">Lado Dominante</span>
                <span className="font-semibold text-neutral-text">
                  {athleteProfile.dominantSide === 'right' ? 'Direito' : 
                   athleteProfile.dominantSide === 'left' ? 'Esquerdo' : 'Ambos'}
                </span>
              </div>
              {athleteProfile.targetReturnDate && (
                <div className="flex justify-between py-sm">
                  <span className="text-neutral-textSecondary">Data Alvo de Retorno</span>
                  <span className="font-semibold text-primary">
                    {new Date(athleteProfile.targetReturnDate).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Métricas de Desempenho */}
          <div className="bg-white rounded-lg shadow-cardHover p-lg">
            <h2 className="text-xl font-bold text-neutral-text mb-md flex items-center gap-sm">
              <BarChart3 className="w-5 h-5 text-success" />
              Métricas Recentes
            </h2>
            {metrics.length > 0 ? (
              <div className="space-y-sm">
                {metrics.slice(0, 5).map((metric) => (
                  <div key={metric.id} className="border-b pb-3 last:border-0">
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-sm font-medium text-neutral-text">
                        {metric.metricName}
                      </span>
                      <span className="text-lg font-bold text-primary">
                        {metric.value} {metric.unit}
                      </span>
                    </div>
                    <div className="flex items-center gap-sm text-xs text-neutral-textSecondary">
                      <span>{metric.metricType}</span>
                      <span>•</span>
                      <span>{new Date(metric.metricDate).toLocaleDateString('pt-BR')}</span>
                      {metric.trend && (
                        <>
                          <span>•</span>
                          <span className={
                            metric.trend === 'improving' ? 'text-success' :
                            metric.trend === 'declining' ? 'text-error' :
                            'text-neutral-textSecondary'
                          }>
                            {metric.trend === 'improving' ? '↗ Melhorando' :
                             metric.trend === 'declining' ? '↘ Declinando' :
                             '→ Estável'}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-3xl text-gray-500">
                <BarChart3 className="w-12 h-12 mx-auto mb-sm opacity-30" />
                <p>Nenhuma métrica registrada</p>
              </div>
            )}
          </div>
        </div>

        {/* Últimas Sessões */}
        <div className="mt-xl bg-white rounded-lg shadow-cardHover p-lg">
          <h2 className="text-xl font-bold text-neutral-text mb-md flex items-center gap-sm">
            <Calendar className="w-5 h-5 text-purple-600" />
            Últimas Sessões de Treinamento
          </h2>
          {sessions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left text-sm text-neutral-textSecondary">
                    <th className="pb-3 font-medium">Data</th>
                    <th className="pb-3 font-medium">Tipo</th>
                    <th className="pb-3 font-medium">Duração</th>
                    <th className="pb-3 font-medium">Esforço</th>
                    <th className="pb-3 font-medium">Dor</th>
                    <th className="pb-3 font-medium">Performance</th>
                  </tr>
                </thead>
                <tbody>
                  {sessions.slice(0, 5).map((session) => (
                    <tr key={session.id} className="border-b last:border-0">
                      <td className="py-3 text-sm text-neutral-text">
                        {new Date(session.sessionDate).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="py-3 text-sm text-neutral-text">
                        {session.sessionType}
                      </td>
                      <td className="py-3 text-sm text-neutral-text">
                        {session.duration} min
                      </td>
                      <td className="py-3">
                        <span className="text-sm font-medium text-warning">
                          {session.perceivedExertion || '-'}/10
                        </span>
                      </td>
                      <td className="py-3">
                        <span className={`text-sm font-medium ${
                          (session.painLevel || 0) > 5 ? 'text-error' :
                          (session.painLevel || 0) > 3 ? 'text-warning' :
                          'text-success'
                        }`}>
                          {session.painLevel || 0}/10
                        </span>
                      </td>
                      <td className="py-3">
                        <span className="text-sm font-medium text-primary">
                          {session.performanceRating || '-'}/10
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-3xl text-gray-500">
              <Calendar className="w-12 h-12 mx-auto mb-sm opacity-30" />
              <p>Nenhuma sessão registrada</p>
            </div>
          )}
        </div>

        {/* Info Banner */}
        <div className="mt-xl bg-primary-light border border-primary rounded-lg p-lg">
          <div className="flex items-start gap-md">
            <Activity className="w-6 h-6 text-primary flex-shrink-0 mt-xs" />
            <div>
              <h3 className="text-lg font-semibold text-blue-900 mb-sm">
                Sobre a Reabilitação Esportiva
              </h3>
              <p className="text-blue-800 text-sm">
                O programa de reabilitação esportiva é estruturado em 5 fases progressivas, 
                desde a fase aguda até o retorno completo ao esporte. Cada fase possui critérios 
                específicos de progressão baseados em testes funcionais, métricas de desempenho 
                e monitoramento de carga de treinamento (ACWR).
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SportsRehabilitationPage;

