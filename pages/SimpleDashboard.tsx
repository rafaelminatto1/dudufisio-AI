import React from 'react';
import { User, LogOut, Calendar, Users, Activity, BarChart3 } from 'lucide-react';

interface SimpleDashboardProps {
  user: any;
  onLogout: () => void;
}

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
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600">Consultas Hoje</p>
                <p className="text-2xl font-bold text-slate-900">12</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600">Pacientes Ativos</p>
                <p className="text-2xl font-bold text-slate-900">156</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Activity className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600">Sessões Concluídas</p>
                <p className="text-2xl font-bold text-slate-900">8</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <BarChart3 className="w-6 h-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600">Taxa de Sucesso</p>
                <p className="text-2xl font-bold text-slate-900">94%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              Próximas Consultas
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div>
                  <p className="font-medium text-slate-900">Ana Silva</p>
                  <p className="text-sm text-slate-600">Fisioterapia - Joelho</p>
                </div>
                <span className="text-sm text-sky-600 font-medium">09:00</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div>
                  <p className="font-medium text-slate-900">Carlos Santos</p>
                  <p className="text-sm text-slate-600">Reabilitação - Ombro</p>
                </div>
                <span className="text-sm text-sky-600 font-medium">10:30</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div>
                  <p className="font-medium text-slate-900">Maria Oliveira</p>
                  <p className="text-sm text-slate-600">Avaliação Inicial</p>
                </div>
                <span className="text-sm text-sky-600 font-medium">14:00</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              Ações Rápidas
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <button className="p-4 bg-sky-50 border border-sky-200 rounded-lg hover:bg-sky-100 transition-colors">
                <Calendar className="w-6 h-6 text-sky-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-sky-700">Nova Consulta</p>
              </button>
              <button className="p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors">
                <Users className="w-6 h-6 text-green-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-green-700">Novo Paciente</p>
              </button>
              <button className="p-4 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors">
                <Activity className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-purple-700">Registrar Sessão</p>
              </button>
              <button className="p-4 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 transition-colors">
                <BarChart3 className="w-6 h-6 text-orange-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-orange-700">Relatórios</p>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SimpleDashboard;