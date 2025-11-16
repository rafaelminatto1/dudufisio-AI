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
  <div className="bg-white rounded-lg shadow-card border border-neutral-border p-lg">
    <div className="flex items-center">
      <div className={`p-sm ${iconBgColor} rounded-lg`}>
        <Icon className={`w-6 h-6 ${iconColor}`} />
      </div>
      <div className="ml-4">
        <p className="text-sm font-medium text-neutral-textSecondary">{label}</p>
        <p className="text-2xl font-bold text-neutral-text">{value}</p>
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
  <div className="flex items-center justify-between p-md bg-neutral-bgAlt rounded-lg">
    <div>
      <p className="font-medium text-neutral-text">{patientName}</p>
      <p className="text-sm text-neutral-textSecondary">{service}</p>
    </div>
    <span className="text-sm text-primary font-medium">{time}</span>
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
    className={`p-md ${bgColor} border ${borderColor} rounded-lg ${hoverColor} transition-colors`}
  >
    <Icon className={`w-6 h-6 ${textColor} mx-auto mb-sm`} />
    <p className={`text-sm font-medium ${textColor}`}>{label}</p>
  </button>
));
ActionButton.displayName = 'ActionButton';

const SimpleDashboard: React.FC<SimpleDashboardProps> = ({ user, onLogout }) => {
  return (
    <div className="min-h-screen bg-neutral-bgAlt">
      {/* Header */}
      <header className="bg-white shadow-card border-b border-neutral-border">
        <div className="max-w-7xl mx-auto px-md sm:px-lg lg:px-xl">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-neutral-text">
                Fisio<span className="text-sky-500">Flow</span>
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <User className="w-5 h-5 text-neutral-textTertiary" />
                <span className="text-sm font-medium text-neutral-text">{user.name}</span>
                <span className="text-xs text-neutral-textSecondary bg-neutral-bgDark px-sm py-1 rounded-full">
                  {user.role}
                </span>
              </div>
              <button
                onClick={onLogout}
                className="flex items-center space-x-2 text-neutral-textSecondary hover:text-neutral-text transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm">Sair</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-md sm:px-lg lg:px-xl py-3xl">
        {/* Welcome Section */}
        <div className="mb-mdxl">
          <h2 className="text-3xl font-bold text-neutral-text mb-sm">
            Bem-vindo, {user.name}! 👋
          </h2>
          <p className="text-neutral-textSecondary">
            Aqui está um resumo do seu dia na clínica.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-lg mb-mdxl">
          <StatCard
            icon={Calendar}
            iconBgColor="bg-primary-light"
            iconColor="text-primary"
            label="Consultas Hoje"
            value={12}
          />
          <StatCard
            icon={Users}
            iconBgColor="bg-success-light"
            iconColor="text-success"
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
            iconBgColor="bg-warning-light"
            iconColor="text-warning"
            label="Taxa de Sucesso"
            value="94%"
          />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg">
          <div className="bg-white rounded-lg shadow-card border border-neutral-border p-lg">
            <h3 className="text-lg font-semibold text-neutral-text mb-md">
              Próximas Consultas
            </h3>
            <div className="space-y-sm">
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

          <div className="bg-white rounded-lg shadow-card border border-neutral-border p-lg">
            <h3 className="text-lg font-semibold text-neutral-text mb-md">
              Ações Rápidas
            </h3>
            <div className="grid grid-cols-2 gap-md">
              <ActionButton
                icon={Calendar}
                label="Nova Consulta"
                bgColor="bg-primary-light"
                borderColor="border-sky-200"
                hoverColor="hover:bg-primary-light"
                textColor="text-primary"
              />
              <ActionButton
                icon={Users}
                label="Novo Paciente"
                bgColor="bg-success-light"
                borderColor="border-success"
                hoverColor="hover:bg-success-light"
                textColor="text-success"
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
                bgColor="bg-warning-light"
                borderColor="border-warning"
                hoverColor="hover:bg-warning-light"
                textColor="text-warning"
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SimpleDashboard;