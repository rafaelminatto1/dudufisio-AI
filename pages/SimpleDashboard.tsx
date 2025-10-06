import React, { memo, useCallback } from 'react';
import { User, LogOut, Calendar, Users, Activity, BarChart3, LucideIcon } from 'lucide-react';

interface SimpleDashboardProps {
  user: any;
  onLogout: () => void;
}

// 🚀 Componente memoizado para StatCard
interface StatCardProps {
  icon: LucideIcon;
  iconBgColor: string;
  iconColor: string;
  label: string;
  value: string | number;
}

const StatCard = memo<StatCardProps>(({ icon: Icon, iconBgColor, iconColor, label, value }) => (
  <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
    <div className="flex items-center">
      <div className={`p-2 ${iconBgColor} rounded-lg`}>
        <Icon className={`w-6 h-6 ${iconColor}`} />
      </div>
      <div className="ml-4">
        <p className="text-sm font-medium text-slate-600">{label}</p>
        <p className="text-2xl font-bold text-slate-900">{value}</p>
      </div>
    </div>
  </div>
));
StatCard.displayName = 'StatCard';

// 🚀 Componente memoizado para AppointmentItem
interface AppointmentItemProps {
  patientName: string;
  service: string;
  time: string;
}

const AppointmentItem = memo<AppointmentItemProps>(({ patientName, service, time }) => (
  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
    <div>
      <p className="font-medium text-slate-900">{patientName}</p>
      <p className="text-sm text-slate-600">{service}</p>
    </div>
    <span className="text-sm text-sky-600 font-medium">{time}</span>
  </div>
));
AppointmentItem.displayName = 'AppointmentItem';

// 🚀 Componente memoizado para ActionButton
interface ActionButtonProps {
  icon: LucideIcon;
  label: string;
  bgColor: string;
  borderColor: string;
  hoverColor: string;
  textColor: string;
  onClick?: () => void;
}

const ActionButton = memo<ActionButtonProps>(({ icon: Icon, label, bgColor, borderColor, hoverColor, textColor, onClick }) => (
  <button
    onClick={onClick}
    className={`p-4 ${bgColor} border ${borderColor} rounded-lg ${hoverColor} transition-colors`}
  >
    <Icon className={`w-6 h-6 ${textColor} mx-auto mb-2`} />
    <p className={`text-sm font-medium ${textColor}`}>{label}</p>
  </button>
));
ActionButton.displayName = 'ActionButton';

const SimpleDashboard: React.FC<SimpleDashboardProps> = ({ user, onLogout }) => {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-slate-900">
                Fisio<span className="text-sky-500">Flow</span>
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <User className="w-5 h-5 text-slate-400" />
                <span className="text-sm font-medium text-slate-700">{user.name}</span>
                <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
                  {user.role}
                </span>
              </div>
              <button
                onClick={onLogout}
                className="flex items-center space-x-2 text-slate-500 hover:text-slate-700 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm">Sair</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-slate-900 mb-2">
            Bem-vindo, {user.name}! 👋
          </h2>
          <p className="text-slate-600">
            Aqui está um resumo do seu dia na clínica.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={Calendar}
            iconBgColor="bg-blue-100"
            iconColor="text-blue-600"
            label="Consultas Hoje"
            value={12}
          />
          <StatCard
            icon={Users}
            iconBgColor="bg-green-100"
            iconColor="text-green-600"
            label="Pacientes Ativos"
            value={156}
          />
          <StatCard
            icon={Activity}
            iconBgColor="bg-purple-100"
            iconColor="text-purple-600"
            label="Sessões Concluídas"
            value={8}
          />
          <StatCard
            icon={BarChart3}
            iconBgColor="bg-orange-100"
            iconColor="text-orange-600"
            label="Taxa de Sucesso"
            value="94%"
          />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              Próximas Consultas
            </h3>
            <div className="space-y-3">
              <AppointmentItem
                patientName="Ana Silva"
                service="Fisioterapia - Joelho"
                time="09:00"
              />
              <AppointmentItem
                patientName="Carlos Santos"
                service="Reabilitação - Ombro"
                time="10:30"
              />
              <AppointmentItem
                patientName="Maria Oliveira"
                service="Avaliação Inicial"
                time="14:00"
              />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              Ações Rápidas
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <ActionButton
                icon={Calendar}
                label="Nova Consulta"
                bgColor="bg-sky-50"
                borderColor="border-sky-200"
                hoverColor="hover:bg-sky-100"
                textColor="text-sky-600"
              />
              <ActionButton
                icon={Users}
                label="Novo Paciente"
                bgColor="bg-green-50"
                borderColor="border-green-200"
                hoverColor="hover:bg-green-100"
                textColor="text-green-600"
              />
              <ActionButton
                icon={Activity}
                label="Registrar Sessão"
                bgColor="bg-purple-50"
                borderColor="border-purple-200"
                hoverColor="hover:bg-purple-100"
                textColor="text-purple-600"
              />
              <ActionButton
                icon={BarChart3}
                label="Relatórios"
                bgColor="bg-orange-50"
                borderColor="border-orange-200"
                hoverColor="hover:bg-orange-100"
                textColor="text-orange-600"
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SimpleDashboard;