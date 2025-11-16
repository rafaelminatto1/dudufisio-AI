import React from 'react';
import { TrendingUp, DollarSign, Users, Target, Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';
import { PatientWithMonitoringMetrics } from '../../types';

export interface AdvancedInsights {
  patientLifetimeValue: {
    average: number;
    total: number;
    currency: string;
  };
  churnRate: {
    monthly: number;
    quarterly: number;
    trend: 'improving' | 'stable' | 'worsening';
  };
  nps: {
    score: number; // -100 to 100
    promoters: number;
    passives: number;
    detractors: number;
  };
  averageTreatmentDuration: {
    days: number;
    byPathology: { pathology: string; avgDays: number }[];
  };
  recoveryRate: {
    percentage: number;
    improved: number;
    stable: number;
    worsened: number;
  };
}

interface InsightsDashboardProps {
  insights: AdvancedInsights;
  patients: PatientWithMonitoringMetrics[];
}

export const InsightsDashboard: React.FC<InsightsDashboardProps> = ({
  insights,
  patients,
}) => {
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving':
        return <TrendingUp className="w-4 h-4 text-green-600 rotate-180" />;
      case 'worsening':
        return <TrendingUp className="w-4 h-4 text-red-600" />;
      default:
        return <span className="text-slate-400">→</span>;
    }
  };

  const getNPSColor = (score: number) => {
    if (score >= 50) return 'text-green-600';
    if (score >= 0) return 'text-amber-600';
    return 'text-red-600';
  };

  const getNPSLabel = (score: number) => {
    if (score >= 70) return 'Excelente';
    if (score >= 50) return 'Muito Bom';
    if (score >= 30) return 'Bom';
    if (score >= 0) return 'Regular';
    return 'Precisa Melhorar';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
          <TrendingUp className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900">Insights Avançados</h2>
          <p className="text-sm text-slate-600">Métricas estratégicas do negócio</p>
        </div>
      </div>

      {/* Grid de Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Patient Lifetime Value */}
        <Card className="border-2 border-blue-100">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold text-slate-700">
                Valor Médio por Paciente (LTV)
              </CardTitle>
              <DollarSign className="w-5 h-5 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-blue-600 mb-1">
              {insights.patientLifetimeValue.currency} {insights.patientLifetimeValue.average.toLocaleString('pt-BR')}
            </p>
            <p className="text-xs text-slate-600 mb-3">
              Total: {insights.patientLifetimeValue.currency} {insights.patientLifetimeValue.total.toLocaleString('pt-BR')}
            </p>
            <div className="bg-blue-50 rounded p-2 text-xs text-blue-800">
              💡 Receita média por paciente durante o tratamento completo
            </div>
          </CardContent>
        </Card>

        {/* Churn Rate */}
        <Card className="border-2 border-amber-100">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold text-slate-700">
                Taxa de Abandono (Churn)
              </CardTitle>
              <Users className="w-5 h-5 text-amber-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-2 mb-1">
              <p className="text-3xl font-bold text-amber-600">
                {insights.churnRate.monthly.toFixed(1)}%
              </p>
              <div className="mb-1">
                {getTrendIcon(insights.churnRate.trend)}
              </div>
            </div>
            <p className="text-xs text-slate-600 mb-3">
              Mensal • Trimestral: {insights.churnRate.quarterly.toFixed(1)}%
            </p>
            <div className="bg-amber-50 rounded p-2 text-xs text-amber-800">
              {insights.churnRate.trend === 'improving' 
                ? '✅ Tendência de melhoria' 
                : insights.churnRate.trend === 'worsening'
                ? '⚠️ Tendência de piora'
                : '📊 Churn estável'}
            </div>
          </CardContent>
        </Card>

        {/* NPS */}
        <Card className="border-2 border-green-100">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold text-slate-700">
                Net Promoter Score (NPS)
              </CardTitle>
              <Star className="w-5 h-5 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-2 mb-1">
              <p className={`text-3xl font-bold ${getNPSColor(insights.nps.score)}`}>
                {insights.nps.score > 0 ? '+' : ''}{insights.nps.score}
              </p>
              <Badge variant="outline" className="mb-1.5 bg-green-50 text-green-700 border-green-200">
                {getNPSLabel(insights.nps.score)}
              </Badge>
            </div>
            
            <div className="space-y-1 mb-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600">Promotores</span>
                <span className="font-semibold text-green-600">{insights.nps.promoters}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600">Neutros</span>
                <span className="font-semibold text-amber-600">{insights.nps.passives}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600">Detratores</span>
                <span className="font-semibold text-red-600">{insights.nps.detractors}</span>
              </div>
            </div>

            <div className="bg-green-50 rounded p-2 text-xs text-green-800">
              💡 Satisfação geral dos pacientes
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Métricas Secundárias */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Duração de Tratamento */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <Target className="w-4 h-4 text-purple-600" />
              Tempo Médio de Tratamento
            </CardTitle>
            <CardDescription className="text-xs">Por patologia</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <p className="text-2xl font-bold text-purple-600 mb-1">
                {insights.averageTreatmentDuration.days} dias
              </p>
              <p className="text-xs text-slate-600">Média geral</p>
            </div>

            <div className="space-y-2">
              {insights.averageTreatmentDuration.byPathology.slice(0, 5).map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs">
                  <span className="text-slate-700 truncate mr-2">{item.pathology}</span>
                  <span className="font-semibold text-slate-900">{item.avgDays} dias</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Taxa de Recuperação */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-600" />
              Taxa de Recuperação
            </CardTitle>
            <CardDescription className="text-xs">Evolução clínica positiva</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <p className="text-2xl font-bold text-green-600 mb-1">
                {insights.recoveryRate.percentage.toFixed(1)}%
              </p>
              <p className="text-xs text-slate-600">Pacientes melhorando</p>
            </div>

            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-slate-600">Melhoraram</span>
                  <span className="font-semibold text-green-600">{insights.recoveryRate.improved}</span>
                </div>
                <Progress 
                  value={(insights.recoveryRate.improved / patients.length) * 100} 
                  className="h-1.5 bg-slate-100"
                />
              </div>

              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-slate-600">Estáveis</span>
                  <span className="font-semibold text-amber-600">{insights.recoveryRate.stable}</span>
                </div>
                <Progress 
                  value={(insights.recoveryRate.stable / patients.length) * 100} 
                  className="h-1.5 bg-slate-100"
                />
              </div>

              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-slate-600">Pioraram</span>
                  <span className="font-semibold text-red-600">{insights.recoveryRate.worsened}</span>
                </div>
                <Progress 
                  value={(insights.recoveryRate.worsened / patients.length) * 100} 
                  className="h-1.5 bg-slate-100"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};


