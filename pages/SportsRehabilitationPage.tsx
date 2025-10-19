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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando dados do atleta...</p>
        </div>
      </div>
    );
  }

  if (!athleteProfile) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-16">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <Activity className="w-16 h-16 text-blue-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Perfil de Atleta Não Encontrado
            </h2>
            <p className="text-gray-600 mb-6">
              Este paciente ainda não possui um perfil de reabilitação esportiva.
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => navigate(-1)}
                className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
              >
                Voltar
              </button>
              <button
                onClick={handleCreateProfile}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-white/10 rounded-lg transition"
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Target className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="text-sm font-medium text-gray-600">Fase Atual</h3>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {getPhaseLabel(athleteProfile.currentPhase).split(':')[0]}
            </p>
            <p className="text-sm text-gray-600 mt-1">
              {getPhaseLabel(athleteProfile.currentPhase).split(':')[1]}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="text-sm font-medium text-gray-600">Progresso</h3>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {progression?.overallProgress || 0}%
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div
                className="bg-green-600 h-2 rounded-full transition-all"
                style={{ width: `${progression?.overallProgress || 0}%` }}
              />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Activity className="w-5 h-5 text-purple-600" />
              </div>
              <h3 className="text-sm font-medium text-gray-600">Sessões</h3>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {sessions.length}
            </p>
            <p className="text-sm text-gray-600 mt-1">Últimas 10 sessões</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Zap className="w-5 h-5 text-orange-600" />
              </div>
              <h3 className="text-sm font-medium text-gray-600">Carga Semanal</h3>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {loadData[0]?.acwr.toFixed(2) || '0.00'}
            </p>
            <p className="text-sm text-gray-600 mt-1">ACWR</p>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Perfil do Atleta */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-600" />
              Perfil do Atleta
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Esporte</span>
                <span className="font-semibold text-gray-900">
                  {getSportLabel(athleteProfile.sportType)}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Nível</span>
                <span className="font-semibold text-gray-900">
                  {athleteProfile.competitionLevel}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Anos Praticando</span>
                <span className="font-semibold text-gray-900">
                  {athleteProfile.yearsPracticing} anos
                </span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Horas/Semana</span>
                <span className="font-semibold text-gray-900">
                  {athleteProfile.hoursPerWeek}h
                </span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Lado Dominante</span>
                <span className="font-semibold text-gray-900">
                  {athleteProfile.dominantSide === 'right' ? 'Direito' : 
                   athleteProfile.dominantSide === 'left' ? 'Esquerdo' : 'Ambos'}
                </span>
              </div>
              {athleteProfile.targetReturnDate && (
                <div className="flex justify-between py-2">
                  <span className="text-gray-600">Data Alvo de Retorno</span>
                  <span className="font-semibold text-blue-600">
                    {new Date(athleteProfile.targetReturnDate).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Métricas de Desempenho */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-green-600" />
              Métricas Recentes
            </h2>
            {metrics.length > 0 ? (
              <div className="space-y-3">
                {metrics.slice(0, 5).map((metric) => (
                  <div key={metric.id} className="border-b pb-3 last:border-0">
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-sm font-medium text-gray-900">
                        {metric.metricName}
                      </span>
                      <span className="text-lg font-bold text-blue-600">
                        {metric.value} {metric.unit}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <span>{metric.metricType}</span>
                      <span>•</span>
                      <span>{new Date(metric.metricDate).toLocaleDateString('pt-BR')}</span>
                      {metric.trend && (
                        <>
                          <span>•</span>
                          <span className={
                            metric.trend === 'improving' ? 'text-green-600' :
                            metric.trend === 'declining' ? 'text-red-600' :
                            'text-gray-600'
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
              <div className="text-center py-8 text-gray-500">
                <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-30" />
                <p>Nenhuma métrica registrada</p>
              </div>
            )}
          </div>
        </div>

        {/* Últimas Sessões */}
        <div className="mt-6 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-purple-600" />
            Últimas Sessões de Treinamento
          </h2>
          {sessions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left text-sm text-gray-600">
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
                      <td className="py-3 text-sm text-gray-900">
                        {new Date(session.sessionDate).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="py-3 text-sm text-gray-900">
                        {session.sessionType}
                      </td>
                      <td className="py-3 text-sm text-gray-900">
                        {session.duration} min
                      </td>
                      <td className="py-3">
                        <span className="text-sm font-medium text-orange-600">
                          {session.perceivedExertion || '-'}/10
                        </span>
                      </td>
                      <td className="py-3">
                        <span className={`text-sm font-medium ${
                          (session.painLevel || 0) > 5 ? 'text-red-600' :
                          (session.painLevel || 0) > 3 ? 'text-orange-600' :
                          'text-green-600'
                        }`}>
                          {session.painLevel || 0}/10
                        </span>
                      </td>
                      <td className="py-3">
                        <span className="text-sm font-medium text-blue-600">
                          {session.performanceRating || '-'}/10
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="w-12 h-12 mx-auto mb-2 opacity-30" />
              <p>Nenhuma sessão registrada</p>
            </div>
          )}
        </div>

        {/* Info Banner */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-start gap-4">
            <Activity className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-semibold text-blue-900 mb-2">
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

