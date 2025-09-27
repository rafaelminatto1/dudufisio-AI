import React, { useMemo, useState, useEffect, useCallback } from 'react';
import PageHeader from '../components/PageHeader';
import {
  Users, Calendar, Clock, Target, TrendingUp,
  AlertCircle, CheckCircle2, Activity, Heart
} from 'lucide-react';
import { useData } from "../contexts/AppContext";
import TodaysAppointments from '../components/dashboard/glance/TodaysAppointments';
import RecentActivity from '../components/dashboard/glance/RecentActivity';
import { Patient, Appointment } from '../types';
import * as patientService from '../services/patientService';
import * as appointmentService from '../services/appointmentService';
import { eventService } from '../services/eventService';
import { auditService } from '../services/auditService';

/**
 * 🩺 DASHBOARD DO FISIOTERAPEUTA
 *
 * Dashboard otimizado para fisioterapeutas com foco em:
 * - Agenda do dia e próximos atendimentos
 * - Progresso dos pacientes em tratamento
 * - Métricas clínicas e indicadores de qualidade
 * - Tarefas pendentes e alertas importantes
 */

interface TherapistMetrics {
  todayAppointments: number;
  weekAppointments: number;
  activePatients: number;
  completedTreatments: number;
  averageRecoveryTime: number;
  patientSatisfaction: number;
  pendingEvaluations: number;
  criticalAlerts: number;
}

// Componente de Métrica Profissional
const MetricCard: React.FC<{
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ComponentType<any>;
  trend?: { value: number; positive: boolean };
  alert?: boolean;
}> = ({ title, value, subtitle, icon: Icon, trend, alert }) => (
  <div className={`bg-white rounded-xl shadow-sm border p-6 transition-all hover:shadow-md ${alert ? 'border-orange-200 bg-orange-50' : 'border-slate-200'}`}>
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-lg ${alert ? 'bg-orange-100' : 'bg-sky-100'}`}>
            <Icon className={`w-5 h-5 ${alert ? 'text-orange-600' : 'text-sky-600'}`} />
          </div>
          <div>
            <p className={`text-sm font-medium ${alert ? 'text-orange-800' : 'text-slate-600'}`}>{title}</p>
            <p className={`text-2xl font-bold ${alert ? 'text-orange-900' : 'text-slate-900'}`}>{value}</p>
            {subtitle && (
              <p className={`text-xs ${alert ? 'text-orange-600' : 'text-slate-500'}`}>{subtitle}</p>
            )}
          </div>
        </div>
      </div>
      {trend && (
        <div className={`text-sm font-medium ${trend.positive ? 'text-green-600' : 'text-red-600'}`}>
          {trend.positive ? '+' : ''}{trend.value}%
        </div>
      )}
    </div>
  </div>
);

// Componente de Progresso de Paciente
const PatientProgressCard: React.FC<{
  patient: Patient;
  progress: number;
  nextSession: string;
  status: 'on-track' | 'needs-attention' | 'excellent';
}> = ({ patient, progress, nextSession, status }) => {
  const statusConfig = {
    'excellent': { color: 'text-green-600', bg: 'bg-green-100', label: 'Excelente' },
    'on-track': { color: 'text-sky-600', bg: 'bg-sky-100', label: 'No Cronograma' },
    'needs-attention': { color: 'text-orange-600', bg: 'bg-orange-100', label: 'Requer Atenção' }
  };

  const config = statusConfig[status];

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-4 hover:shadow-sm transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <img
            src={patient.avatarUrl}
            alt={patient.name}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div>
            <p className="font-medium text-slate-900">{patient.name}</p>
            <p className="text-sm text-slate-500">{patient.conditions[0]?.name || 'Condição não informada'}</p>
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${config.bg} ${config.color}`}>
          {config.label}
        </span>
      </div>

      <div className="mb-3">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-slate-600">Progresso</span>
          <span className="font-medium">{progress}%</span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all ${status === 'excellent' ? 'bg-green-500' : status === 'on-track' ? 'bg-sky-500' : 'bg-orange-500'}`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between text-sm">
        <span className="text-slate-500">Próxima sessão:</span>
        <span className="font-medium text-slate-700">{nextSession}</span>
      </div>
    </div>
  );
};

const TherapistDashboard: React.FC = () => {
  const { therapists, user } = useData();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Log de auditoria para acesso ao dashboard
  useEffect(() => {
    auditService.createLog({
      user: user?.name || 'Current User',
      action: 'VIEW_PATIENT_RECORD',
      details: 'Acessou dashboard do fisioterapeuta',
      resourceType: 'user'
    });
  }, [user]);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const [patientsData, appointmentsData] = await Promise.all([
        patientService.getAllPatients(),
        appointmentService.getAppointments(thirtyDaysAgo, new Date())
      ]);

      setPatients(patientsData);
      setAppointments(appointmentsData);
    } catch (error) {
      console.error("Failed to fetch therapist dashboard data", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();

    const handleDataChange = () => fetchData();
    eventService.on('patients:changed', handleDataChange);
    eventService.on('appointments:changed', handleDataChange);

    return () => {
      eventService.off('patients:changed', handleDataChange);
      eventService.off('appointments:changed', handleDataChange);
    };
  }, [fetchData]);

  // Cálculo das métricas específicas do fisioterapeuta
  const metrics = useMemo((): TherapistMetrics => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());

    const todayAppointments = appointments.filter(apt =>
      apt.startTime.split('T')[0] === todayStr
    ).length;

    const weekAppointments = appointments.filter(apt =>
      new Date(apt.startTime) >= weekStart
    ).length;

    const activePatients = patients.filter(p => p.status === 'Active').length;

    return {
      todayAppointments,
      weekAppointments,
      activePatients,
      completedTreatments: Math.floor(activePatients * 0.75), // Estimativa
      averageRecoveryTime: 6.2, // Semanas
      patientSatisfaction: 9.4,
      pendingEvaluations: Math.floor(activePatients * 0.15),
      criticalAlerts: Math.floor(activePatients * 0.05)
    };
  }, [appointments, patients]);

  // Pacientes com progresso simulado
  const patientsWithProgress = useMemo(() => {
    return patients
      .filter(p => p.status === 'Active')
      .slice(0, 6)
      .map(patient => ({
        patient,
        progress: Math.floor(Math.random() * 100),
        nextSession: new Date(Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR'),
        status: (['excellent', 'on-track', 'needs-attention'] as const)[Math.floor(Math.random() * 3)]
      }));
  }, [patients]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Dashboard Clínico"
        subtitle="Visão especializada para fisioterapeutas com foco no cuidado e progresso dos pacientes."
      />

      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Consultas Hoje"
          value={metrics.todayAppointments}
          icon={Calendar}
          trend={{ value: 12, positive: true }}
        />

        <MetricCard
          title="Pacientes Ativos"
          value={metrics.activePatients}
          subtitle="Em tratamento"
          icon={Users}
          trend={{ value: 8, positive: true }}
        />

        <MetricCard
          title="Satisfação (NPS)"
          value={`${metrics.patientSatisfaction}/10`}
          subtitle="Baseado em 24 avaliações"
          icon={Heart}
          trend={{ value: 3, positive: true }}
        />

        <MetricCard
          title="Alertas Pendentes"
          value={metrics.criticalAlerts}
          subtitle="Requerem atenção"
          icon={AlertCircle}
          alert={metrics.criticalAlerts > 0}
        />
      </div>

      {/* Métricas Secundárias */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard
          title="Tratamentos Concluídos"
          value={metrics.completedTreatments}
          subtitle="Últimos 30 dias"
          icon={CheckCircle2}
        />

        <MetricCard
          title="Tempo Médio Recuperação"
          value={`${metrics.averageRecoveryTime} sem`}
          subtitle="Por paciente"
          icon={TrendingUp}
        />

        <MetricCard
          title="Avaliações Pendentes"
          value={metrics.pendingEvaluations}
          subtitle="Para esta semana"
          icon={Target}
          alert={metrics.pendingEvaluations > 3}
        />
      </div>

      {/* Conteúdo Principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Coluna Esquerda - Agenda e Atividades */}
        <div className="lg:col-span-2 space-y-8">
          {/* Consultas de Hoje */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <TodaysAppointments
              appointments={appointments.filter(apt =>
                apt.startTime.split('T')[0] === new Date().toISOString().split('T')[0]
              )}
              patients={patients}
              therapists={therapists}
            />
          </div>

          {/* Progresso dos Pacientes */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                <Activity className="w-5 h-5 text-sky-600" />
                Progresso dos Pacientes
              </h3>
              <button className="text-sm text-sky-600 hover:text-sky-700 font-medium">
                Ver todos
              </button>
            </div>
            <div className="grid gap-4">
              {patientsWithProgress.map(({ patient, progress, nextSession, status }) => (
                <PatientProgressCard
                  key={patient.id}
                  patient={patient}
                  progress={progress}
                  nextSession={nextSession}
                  status={status}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Coluna Direita - Atividades Recentes */}
        <div className="space-y-8">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <RecentActivity />
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Ações Rápidas</h3>
            <div className="space-y-3">
              <button className="w-full p-3 bg-sky-50 text-sky-700 rounded-lg text-left hover:bg-sky-100 transition-colors">
                📋 Nova Avaliação
              </button>
              <button className="w-full p-3 bg-green-50 text-green-700 rounded-lg text-left hover:bg-green-100 transition-colors">
                📝 Registrar Evolução
              </button>
              <button className="w-full p-3 bg-purple-50 text-purple-700 rounded-lg text-left hover:bg-purple-100 transition-colors">
                📊 Gerar Relatório
              </button>
              <button className="w-full p-3 bg-orange-50 text-orange-700 rounded-lg text-left hover:bg-orange-100 transition-colors">
                🔔 Enviar Lembrete
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TherapistDashboard;