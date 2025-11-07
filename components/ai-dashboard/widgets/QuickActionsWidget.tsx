/**
 * Quick Actions Widget
 * Fast access to common AI-powered actions
 */

import React from 'react';
import {
  Sparkles,
  TrendingDown,
  BarChart3,
  FileText,
  Brain,
  Zap,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const quickActions = [
  {
    id: 'churn',
    title: 'Análise de Churn',
    description: 'Identificar pacientes em risco',
    icon: TrendingDown,
    color: 'orange',
    action: () => console.log('Navigate to churn analysis'),
  },
  {
    id: 'bi',
    title: 'BI Insights',
    description: 'Visualizar relatório completo',
    icon: BarChart3,
    color: 'blue',
    action: () => console.log('Navigate to BI'),
  },
  {
    id: 'treatment',
    title: 'Gerar Plano',
    description: 'Criar plano com IA',
    icon: FileText,
    color: 'purple',
    action: () => console.log('Open treatment generator'),
  },
  {
    id: 'predict',
    title: 'Previsões',
    description: 'Ver projeções futuras',
    icon: Brain,
    color: 'green',
    action: () => console.log('Show predictions'),
  },
];

const colorMap = {
  orange: {
    bg: 'bg-orange-50',
    hover: 'hover:bg-orange-100',
    border: 'border-orange-200',
    icon: 'text-orange-600',
  },
  blue: {
    bg: 'bg-blue-50',
    hover: 'hover:bg-blue-100',
    border: 'border-blue-200',
    icon: 'text-blue-600',
  },
  purple: {
    bg: 'bg-purple-50',
    hover: 'hover:bg-purple-100',
    border: 'border-purple-200',
    icon: 'text-purple-600',
  },
  green: {
    bg: 'bg-green-50',
    hover: 'hover:bg-green-100',
    border: 'border-green-200',
    icon: 'text-green-600',
  },
};

export function QuickActionsWidget() {
  return (
    <Card className="border-indigo-200 bg-gradient-to-br from-white to-indigo-50/30">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-indigo-600" />
          <CardTitle className="text-lg">Ações Rápidas</CardTitle>
        </div>
        <CardDescription>Acesso rápido aos recursos de IA</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {quickActions.map((action) => {
            const colors = colorMap[action.color as keyof typeof colorMap];
            const Icon = action.icon;

            return (
              <button
                key={action.id}
                onClick={action.action}
                className={`p-4 rounded-lg border-2 ${colors.border} ${colors.bg} ${colors.hover} transition-all hover:scale-105 text-left group`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className={`p-2 bg-white rounded-lg shadow-sm ${colors.border} border`}>
                    <Icon className={`w-5 h-5 ${colors.icon}`} />
                  </div>
                  <Sparkles className={`w-4 h-4 ${colors.icon} opacity-0 group-hover:opacity-100 transition-opacity`} />
                </div>
                <h4 className="font-semibold text-slate-900 mb-1">
                  {action.title}
                </h4>
                <p className="text-xs text-slate-600">
                  {action.description}
                </p>
              </button>
            );
          })}
        </div>

        {/* AI Status */}
        <div className="mt-4 p-3 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg border border-purple-200">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <p className="text-sm font-medium text-slate-700">
              IA Online - Gemini Pro
            </p>
          </div>
          <p className="text-xs text-slate-600 mt-1">
            Todos os modelos operacionais e prontos para uso
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
