import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, TrendingUp, BarChart3, MapPin, Activity, AlertCircle } from 'lucide-react';
import { populationHealthServiceSupabase } from '../services/analytics/populationHealthServiceSupabase';
import { PopulationDemographics, PopulationInsight } from '../types/populationHealthTypes';
import { toast } from 'react-toastify';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from '@/components/charts/ChartsLazyOptimized';

export const PopulationHealthDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [demographics, setDemographics] = useState<PopulationDemographics | null>(null);
  const [insights, setInsights] = useState<PopulationInsight[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await populationHealthServiceSupabase.getDashboardData();
      setDemographics(data.demographics);
      setInsights(data.insights);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-bgAlt flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-md"></div>
          <p className="text-neutral-textSecondary">Carregando análise populacional...</p>
        </div>
      </div>
    );
  }

  const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-error-light text-error border-error';
      case 'medium': return 'bg-warning-light text-warning border-warning';
      default: return 'bg-primary-light text-blue-800 border-primary';
    }
  };

  return (
    <div className="min-h-screen bg-neutral-bgAlt">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-cardActive">
        <div className="max-w-7xl mx-auto px-md sm:px-lg lg:px-xl py-3xl">
          <div className="flex items-center gap-md">
            <button
              onClick={() => navigate(-1)}
              className="p-sm hover:bg-white/10 rounded-lg transition"
              aria-label="Voltar"
              title="Voltar"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-1">Dashboard de Saúde da População</h1>
              <p className="text-blue-100">Análise agregada e insights para tomada de decisão estratégica</p>
              <div className="mt-3 flex flex-wrap gap-sm">
                <span className="bg-white/20 px-md py-1 rounded-full text-sm">
                  📊 Análise Demográfica
                </span>
                <span className="bg-white/20 px-md py-1 rounded-full text-sm">
                  🎯 Insights Clínicos
                </span>
                <span className="bg-white/20 px-md py-1 rounded-full text-sm">
                  💡 Recomendações Ações
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Value Proposition Banner */}
      <div className="bg-primary-light border-l-4 border-blue-400 p-md mb-xl">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-start gap-md">
            <div className="p-sm bg-primary-light rounded-lg">
              <BarChart3 className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-blue-900 mb-1">Para que serve este dashboard?</h3>
              <p className="text-blue-800 text-sm">
                Este dashboard analisa <strong>toda sua população de pacientes</strong> para identificar padrões, 
                riscos e oportunidades. Use os insights para:
              </p>
              <ul className="text-blue-800 text-sm mt-sm space-y-1">
                <li>• <strong>Identificar grupos de risco</strong> e criar programas preventivos</li>
                <li>• <strong>Otimizar recursos</strong> baseado na demanda real</li>
                <li>• <strong>Melhorar adesão</strong> ao tratamento</li>
                <li>• <strong>Expandir serviços</strong> com dados concretos</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-md sm:px-lg lg:px-xl py-3xl">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-lg mb-mdxl">
          <div className="bg-white rounded-lg shadow-cardHover p-lg">
            <div className="flex items-center gap-md mb-sm">
              <div className="p-sm bg-primary-light rounded-lg">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-sm font-medium text-neutral-textSecondary">Total de Pacientes</h3>
            </div>
            <p className="text-3xl font-bold text-neutral-text">
              {demographics?.totalPatients || 0}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-cardHover p-lg">
            <div className="p-sm bg-success-light rounded-lg mb-sm w-fit">
              <Activity className="w-5 h-5 text-success" />
            </div>
            <h3 className="text-sm font-medium text-neutral-textSecondary mb-sm">Pacientes Ativos</h3>
            <p className="text-3xl font-bold text-neutral-text">
              {demographics?.activePatients || 0}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-cardHover p-lg">
            <div className="p-sm bg-purple-100 rounded-lg mb-sm w-fit">
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
            <h3 className="text-sm font-medium text-neutral-textSecondary mb-sm">Idade Média</h3>
            <p className="text-3xl font-bold text-neutral-text">
              {demographics?.averageAge.toFixed(0) || 0} anos
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-cardHover p-lg">
            <div className="p-sm bg-warning-light rounded-lg mb-sm w-fit">
              <AlertCircle className="w-5 h-5 text-warning" />
            </div>
            <h3 className="text-sm font-medium text-neutral-textSecondary mb-sm">Insights Ativos</h3>
            <p className="text-3xl font-bold text-neutral-text">
              {insights.length}
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-cardHover p-lg mb-mdxl">
          <h2 className="text-xl font-bold text-neutral-text mb-md flex items-center gap-sm">
            <Activity className="w-5 h-5 text-success" />
            Ações Rápidas Baseadas nos Dados
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
            <div className="bg-primary-light border border-primary rounded-lg p-md">
              <h3 className="font-semibold text-blue-900 mb-sm">📋 Criar Programa Preventivo</h3>
              <p className="text-blue-800 text-sm mb-md">Baseado nos insights de risco, crie programas específicos para grupos identificados</p>
              <button className="bg-primary text-white px-md py-1 rounded text-sm hover:bg-primary-hover transition">
                Ver Recomendações
              </button>
            </div>
            <div className="bg-success-light border border-success rounded-lg p-md">
              <h3 className="font-semibold text-green-900 mb-sm">📊 Analisar Demanda</h3>
              <p className="text-success text-sm mb-md">Use os dados demográficos para otimizar horários e serviços</p>
              <button className="bg-green-600 text-white px-md py-1 rounded text-sm hover:bg-green-700 transition">
                Ver Análise
              </button>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-md">
              <h3 className="font-semibold text-purple-900 mb-sm">🎯 Melhorar Adesão</h3>
              <p className="text-purple-800 text-sm mb-md">Implemente estratégias baseadas nos padrões de abandono identificados</p>
              <button className="bg-purple-600 text-white px-md py-1 rounded text-sm hover:bg-purple-700 transition">
                Ver Estratégias
              </button>
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg mb-mdxl">
          {/* Distribuição por Gênero */}
          <div className="bg-white rounded-lg shadow-cardHover p-lg">
            <h2 className="text-xl font-bold text-neutral-text mb-md">Distribuição por Gênero</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={demographics?.genderDistribution || []}
                    dataKey="count"
                    nameKey="gender"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={(entry) => `${entry.gender}: ${entry.percentage.toFixed(1)}%`}
                  >
                    {demographics?.genderDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Distribuição por Idade */}
          <div className="bg-white rounded-lg shadow-cardHover p-lg">
            <h2 className="text-xl font-bold text-neutral-text mb-md">Distribuição por Faixa Etária</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={demographics?.ageDistribution || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="ageRange" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Insights */}
        <div className="bg-white rounded-lg shadow-cardHover p-lg">
          <div className="flex items-center justify-between mb-xl">
            <h2 className="text-xl font-bold text-neutral-text flex items-center gap-sm">
              <AlertCircle className="w-5 h-5 text-primary" />
              Insights Populacionais
            </h2>
            <div className="text-sm text-neutral-textSecondary">
              {insights.length} insights identificados
            </div>
          </div>
          
          {insights.length === 0 ? (
            <div className="text-center py-3xl">
              <div className="text-neutral-textTertiary mb-sm">
                <AlertCircle className="w-12 h-12 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-neutral-text mb-sm">Nenhum insight disponível</h3>
              <p className="text-neutral-textSecondary">Adicione mais pacientes e dados para gerar insights automáticos</p>
            </div>
          ) : (
            <div className="space-y-md">
              {insights.map((insight, idx) => (
                <div
                  key={idx}
                  className={`border rounded-lg p-5 ${getPriorityColor(insight.priority)} hover:shadow-cardHover transition-shadow`}
                >
                  <div className="flex items-start justify-between mb-md">
                    <div className="flex-1">
                      <div className="flex items-center gap-sm mb-1">
                        <h3 className="font-semibold text-lg">{insight.title}</h3>
                        <span className={`text-xs px-sm py-1 rounded-full ${
                          insight.priority === 'high' ? 'bg-error-light text-error' :
                          insight.priority === 'medium' ? 'bg-warning-light text-warning' :
                          'bg-primary-light text-blue-800'
                        }`}>
                          {insight.priority === 'high' ? '🔴 Alta' : 
                           insight.priority === 'medium' ? '🟡 Média' : '🔵 Baixa'} Prioridade
                        </span>
                      </div>
                      <div className="flex items-center gap-md text-sm text-neutral-textSecondary mb-sm">
                        <span className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {insight.affectedPatientCount} pacientes
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {insight.category}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-sm mb-md leading-relaxed">{insight.description}</p>
                  
                  {insight.recommendations && insight.recommendations.length > 0 && (
                    <div className="bg-white/60 rounded-lg p-md mt-md">
                      <strong className="text-sm font-medium block mb-sm">💡 Ações Recomendadas:</strong>
                      <ul className="space-y-1">
                        {insight.recommendations.slice(0, 3).map((rec, i) => (
                          <li key={i} className="text-sm flex items-start gap-sm">
                            <span className="text-primary mt-xs">→</span>
                            <span>{rec}</span>
                          </li>
                        ))}
                        {insight.recommendations.length > 3 && (
                          <li className="text-xs text-neutral-textSecondary mt-sm">
                            +{insight.recommendations.length - 3} outras recomendações...
                          </li>
                        )}
                      </ul>
                    </div>
                  )}
                  
                  {insight.evidence && (
                    <div className="mt-3 pt-3 border-t border-white/30">
                      <div className="flex items-center gap-sm text-xs text-neutral-textSecondary">
                        <span>📊 {insight.evidence.source}</span>
                        <span>•</span>
                        <span>Confiança: {Math.round((insight.evidence.confidence || 0) * 100)}%</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PopulationHealthDashboardPage;

