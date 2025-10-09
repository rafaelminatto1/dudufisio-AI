import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Activity, Users, Brain, TrendingUp } from 'lucide-react';
export const QuickActionsCard = ({ patientId, patientName }) => {
    const navigate = useNavigate();
    const actions = [
        {
            icon: Shield,
            title: 'Estratificação de Risco',
            description: 'Avaliar riscos clínicos',
            color: 'blue',
            route: `/risk-stratification/${patientId}`,
        },
        {
            icon: Activity,
            title: 'Reabilitação Esportiva',
            description: 'Acompanhamento de atletas',
            color: 'green',
            route: `/sports-rehab/${patientId}`,
        },
        {
            icon: Users,
            title: 'Portal da Família',
            description: 'Gerenciar acesso familiar',
            color: 'purple',
            route: `/family-portal/${patientId}`,
        },
        {
            icon: Brain,
            title: 'Análise Preditiva',
            description: 'Predições com IA',
            color: 'indigo',
            route: `/predictive-analytics/${patientId}`,
        },
    ];
    const colorClasses = {
        blue: 'bg-blue-100 text-blue-600 hover:bg-blue-200',
        green: 'bg-green-100 text-green-600 hover:bg-green-200',
        purple: 'bg-purple-100 text-purple-600 hover:bg-purple-200',
        indigo: 'bg-indigo-100 text-indigo-600 hover:bg-indigo-200',
    };
    return (<div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
        <TrendingUp className="w-5 h-5 text-blue-600"/>
        Ações Rápidas - {patientName}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {actions.map((action, idx) => {
            const Icon = action.icon;
            return (<button key={idx} onClick={() => navigate(action.route)} className={`p-4 rounded-lg text-left transition ${colorClasses[action.color]}`}>
              <div className="flex items-start gap-3">
                <Icon className="w-6 h-6 flex-shrink-0 mt-0.5"/>
                <div>
                  <h3 className="font-semibold mb-1">{action.title}</h3>
                  <p className="text-sm opacity-80">{action.description}</p>
                </div>
              </div>
            </button>);
        })}
      </div>
    </div>);
};
export default QuickActionsCard;
