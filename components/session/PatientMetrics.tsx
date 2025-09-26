import React from 'react';
import { Activity, DollarSign, Calendar, TrendingUp } from 'lucide-react';
import { Patient, Appointment } from '../types';

interface PatientMetricsProps {
  patient: Patient;
  appointments: Appointment[];
  className?: string;
}

interface SessionStats {
  totalSessions: number;
  paidSessions: number;
  pendingSessions: number;
  totalValue: number;
  paidValue: number;
  treatmentDuration: number; // em dias
}

const PatientMetrics: React.FC<PatientMetricsProps> = ({ patient, appointments, className = '' }) => {
  const calculateSessionStats = (): SessionStats => {
    const patientAppointments = appointments.filter(apt => apt.patientId === patient.id);
    const completedAppointments = patientAppointments.filter(apt => apt.status === 'completed');
    
    const totalSessions = completedAppointments.length;
    const paidSessions = completedAppointments.filter(apt => apt.paymentStatus === 'paid').length;
    const pendingSessions = totalSessions - paidSessions;
    
    const totalValue = completedAppointments.reduce((sum, apt) => sum + (apt.value || 0), 0);
    const paidValue = completedAppointments
      .filter(apt => apt.paymentStatus === 'paid')
      .reduce((sum, apt) => sum + (apt.value || 0), 0);
    
    const firstSession = completedAppointments.length > 0 
      ? new Date(Math.min(...completedAppointments.map(apt => new Date(apt.startTime).getTime())))
      : null;
    
    const treatmentDuration = firstSession 
      ? Math.floor((new Date().getTime() - firstSession.getTime()) / (1000 * 60 * 60 * 24))
      : 0;

    return {
      totalSessions,
      paidSessions,
      pendingSessions,
      totalValue,
      paidValue,
      treatmentDuration
    };
  };

  const stats = calculateSessionStats();

  const MetricCard: React.FC<{
    icon: React.ElementType;
    title: string;
    value: string | number;
    subtitle?: string;
    color: string;
  }> = ({ icon: Icon, title, value, subtitle, color }) => (
    <div className="bg-white rounded-lg p-4 border border-slate-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-600">{title}</p>
          <p className="text-2xl font-bold text-slate-900">{value}</p>
          {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );

  const ProgressBar: React.FC<{
    label: string;
    current: number;
    total: number;
    color: string;
  }> = ({ label, current, total, color }) => {
    const percentage = total > 0 ? (current / total) * 100 : 0;
    
    return (
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-slate-600">{label}</span>
          <span className="font-medium text-slate-900">{current}/{total}</span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full ${color}`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
      </div>
    );
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Métricas Principais */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          icon={Activity}
          title="Sessões Realizadas"
          value={stats.totalSessions}
          subtitle="Total de atendimentos"
          color="bg-blue-500"
        />
        <MetricCard
          icon={DollarSign}
          title="Sessões Pagas"
          value={stats.paidSessions}
          subtitle={`R$ ${stats.paidValue.toFixed(2)}`}
          color="bg-green-500"
        />
        <MetricCard
          icon={Calendar}
          title="Duração do Tratamento"
          value={stats.treatmentDuration > 0 ? `${stats.treatmentDuration} dias` : 'N/A'}
          subtitle={stats.treatmentDuration > 365 ? `${Math.floor(stats.treatmentDuration / 365)} ano(s)` : ''}
          color="bg-purple-500"
        />
        <MetricCard
          icon={TrendingUp}
          title="Valor Total"
          value={`R$ ${stats.totalValue.toFixed(2)}`}
          subtitle={stats.pendingSessions > 0 ? `${stats.pendingSessions} pendente(s)` : 'Tudo pago'}
          color="bg-orange-500"
        />
      </div>

      {/* Barras de Progresso */}
      <div className="bg-white rounded-lg p-6 border border-slate-200">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Progresso do Tratamento</h3>
        <div className="space-y-4">
          <ProgressBar
            label="Sessões Pagas"
            current={stats.paidSessions}
            total={stats.totalSessions}
            color="bg-green-500"
          />
          <ProgressBar
            label="Valor Recebido"
            current={stats.paidValue}
            total={stats.totalValue}
            color="bg-blue-500"
          />
        </div>
      </div>

      {/* Resumo Financeiro */}
      {stats.totalValue > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Resumo Financeiro</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">R$ {stats.paidValue.toFixed(2)}</p>
              <p className="text-sm text-slate-600">Recebido</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">R$ {(stats.totalValue - stats.paidValue).toFixed(2)}</p>
              <p className="text-sm text-slate-600">Pendente</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientMetrics;
