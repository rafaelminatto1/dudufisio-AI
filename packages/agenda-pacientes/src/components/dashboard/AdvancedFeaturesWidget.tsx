import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Activity, Users, Brain, TrendingUp, CheckCircle } from 'lucide-react';

export const AdvancedFeaturesWidget: React.FC = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: TrendingUp,
      title: 'Saúde Populacional',
      description: 'Analytics e insights agregados',
      color: 'from-blue-500 to-cyan-500',
      route: '/population-health',
      badge: 'Analytics',
    },
    {
      icon: CheckCircle,
      title: 'Garantia de Qualidade',
      description: 'Métricas e compliance',
      color: 'from-green-500 to-emerald-500',
      route: '/quality-assurance',
      badge: 'Compliance',
    },
  ];

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">Recursos Avançados</h2>
        <span className="text-xs bg-purple-100 text-purple-700 px-3 py-1 rounded-full font-medium">
          NOVO
        </span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {features.map((feature, idx) => {
          const Icon = feature.icon;
          return (
            <button
              key={idx}
              onClick={() => navigate(feature.route)}
              className={`p-5 rounded-lg bg-gradient-to-br ${feature.color} text-white hover:shadow-lg transition-all transform hover:-translate-y-1`}
            >
              <div className="flex items-start gap-3 mb-3">
                <Icon className="w-6 h-6 flex-shrink-0" />
                <div className="text-left flex-1">
                  <h3 className="font-bold text-lg mb-1">{feature.title}</h3>
                  <p className="text-sm opacity-90">{feature.description}</p>
                </div>
              </div>
              <div className="flex justify-end">
                <span className="text-xs bg-white/20 px-3 py-1 rounded-full">
                  {feature.badge}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
        <p className="text-sm text-purple-900">
          <strong>💡 Novidade:</strong> Explore nossos novos recursos de IA e analytics para 
          decisões clínicas mais inteligentes e gestão de qualidade aprimorada!
        </p>
      </div>
    </div>
  );
};

export default AdvancedFeaturesWidget;

