import React, { useState } from 'react';
import { Sparkles, FileText, TrendingUp, Webhook, BarChart3, Settings } from 'lucide-react';
import MaterialAnalyticsDashboard from '../components/clinical-materials/MaterialAnalyticsDashboard';
import WebhookManager from '../components/clinical-materials/WebhookManager';

export const AdvancedMaterialsDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'analytics' | 'webhooks' | 'settings'>('analytics');

  const tabs = [
    {
      id: 'analytics',
      name: 'Analytics',
      icon: <TrendingUp className="w-5 h-5" />,
      description: 'Métricas e estatísticas de uso dos materiais',
    },
    {
      id: 'webhooks',
      name: 'Webhooks',
      icon: <Webhook className="w-5 h-5" />,
      description: 'Integrações e notificações automáticas',
    },
    {
      id: 'settings',
      name: 'Configurações',
      icon: <Settings className="w-5 h-5" />,
      description: 'Configurações gerais do sistema',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3 mb-2">
            <Sparkles className="w-8 h-8 text-emerald-600" />
            Dashboard Avançado de Materiais
          </h1>
          <p className="text-gray-600">
            Gerencie, analise e otimize seus materiais clínicos com ferramentas avançadas
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <QuickStat
            title="Funcionalidades"
            value="12"
            subtitle="Recursos implementados"
            icon={<Sparkles className="w-6 h-6" />}
            color="emerald"
          />
          <QuickStat
            title="Templates"
            value="3"
            subtitle="Modelos pré-definidos"
            icon={<FileText className="w-6 h-6" />}
            color="blue"
          />
          <QuickStat
            title="IA Integrada"
            value="✓"
            subtitle="Gemini API ativo"
            icon={<Sparkles className="w-6 h-6" />}
            color="purple"
          />
          <QuickStat
            title="Exportação"
            value="4"
            subtitle="Formatos disponíveis"
            icon={<BarChart3 className="w-6 h-6" />}
            color="orange"
          />
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-md mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex-1 px-6 py-4 text-center font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'border-b-2 border-emerald-600 text-emerald-600 bg-emerald-50'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex flex-col items-center gap-2">
                    {tab.icon}
                    <span>{tab.name}</span>
                  </div>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-xl shadow-md p-6">
          {activeTab === 'analytics' && <MaterialAnalyticsDashboard />}
          {activeTab === 'webhooks' && <WebhookManager />}
          {activeTab === 'settings' && <SettingsPanel />}
        </div>

        {/* Features Overview */}
        <div className="mt-8 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-8">
          <h2 className="text-2xl font-bold text-emerald-900 mb-6">
            🎉 Funcionalidades Implementadas
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              title="Templates"
              description="Sistema completo de modelos pré-definidos para criação rápida de materiais"
              status="completed"
            />
            <FeatureCard
              title="Versionamento"
              description="Histórico completo com diff e possibilidade de restauração"
              status="completed"
            />
            <FeatureCard
              title="Colaboração"
              description="Sistema de permissões e colaboradores com roles diferentes"
              status="completed"
            />
            <FeatureCard
              title="Comentários"
              description="Sistema de comentários com replies, menções e resolução"
              status="completed"
            />
            <FeatureCard
              title="Analytics"
              description="Métricas detalhadas de visualizações, edições e compartilhamentos"
              status="completed"
            />
            <FeatureCard
              title="Exportação"
              description="Exportação para PDF, Word, Excel, Markdown e HTML"
              status="completed"
            />
            <FeatureCard
              title="IA Avançada"
              description="Geração automática de conteúdo com Google Gemini"
              status="completed"
            />
            <FeatureCard
              title="Webhooks"
              description="Sistema de notificações automáticas para integrações"
              status="completed"
            />
            <FeatureCard
              title="Dashboard"
              description="Visualização consolidada de métricas e estatísticas"
              status="completed"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

interface QuickStatProps {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ReactNode;
  color: 'emerald' | 'blue' | 'purple' | 'orange';
}

const QuickStat: React.FC<QuickStatProps> = ({ title, value, subtitle, icon, color }) => {
  const colorClasses = {
    emerald: 'from-emerald-50 to-emerald-100 text-emerald-700 bg-emerald-600',
    blue: 'from-blue-50 to-blue-100 text-blue-700 bg-blue-600',
    purple: 'from-purple-50 to-purple-100 text-purple-700 bg-purple-600',
    orange: 'from-orange-50 to-orange-100 text-orange-700 bg-orange-600',
  };

  return (
    <div className={`bg-gradient-to-br ${colorClasses[color]} rounded-lg p-6`}>
      <div className={`p-3 rounded-lg bg-white/50 inline-flex mb-4 ${colorClasses[color].split(' ')[2]}`}>
        {icon}
      </div>
      <div className="text-3xl font-bold mb-1">{value}</div>
      <div className="text-sm font-medium mb-1">{title}</div>
      <div className="text-xs opacity-75">{subtitle}</div>
    </div>
  );
};

interface FeatureCardProps {
  title: string;
  description: string;
  status: 'completed' | 'in_progress' | 'planned';
}

const FeatureCard: React.FC<FeatureCardProps> = ({ title, description, status }) => {
  const statusColors = {
    completed: 'bg-green-500',
    in_progress: 'bg-yellow-500',
    planned: 'bg-gray-400',
  };

  const statusLabels = {
    completed: 'Implementado',
    in_progress: 'Em progresso',
    planned: 'Planejado',
  };

  return (
    <div className="bg-white rounded-lg p-4 shadow-md">
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-semibold text-gray-900">{title}</h3>
        <span className={`w-3 h-3 rounded-full ${statusColors[status]}`} title={statusLabels[status]} />
      </div>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  );
};

const SettingsPanel: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Configurações Gerais</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900">Versionamento Automático</h4>
              <p className="text-sm text-gray-600">Criar versão automaticamente a cada edição</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900">Notificações de Comentários</h4>
              <p className="text-sm text-gray-600">Receber notificações quando for mencionado</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900">Analytics Detalhado</h4>
              <p className="text-sm text-gray-600">Rastrear visualizações e interações detalhadas</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900">Assistente de IA</h4>
              <p className="text-sm text-gray-600">Habilitar sugestões de IA no editor</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedMaterialsDashboard;

