import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, TrendingUp, BarChart3, MapPin, Activity, AlertCircle } from 'lucide-react';
import { populationHealthServiceSupabase } from '../services/analytics/populationHealthServiceSupabase';
import { toast } from 'react-toastify';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
export const PopulationHealthDashboardPage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [demographics, setDemographics] = useState(null);
    const [insights, setInsights] = useState([]);
    useEffect(() => {
        loadData();
    }, []);
    const loadData = async () => {
        try {
            setLoading(true);
            const data = await populationHealthServiceSupabase.getDashboardData();
            setDemographics(data.demographics);
            setInsights(data.insights);
        }
        catch (error) {
            console.error('Erro ao carregar dados:', error);
            toast.error('Erro ao carregar dashboard');
        }
        finally {
            setLoading(false);
        }
    };
    if (loading) {
        return (<div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando análise populacional...</p>
        </div>
      </div>);
    }
    const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];
    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'high': return 'bg-red-100 text-red-800 border-red-200';
            case 'medium': return 'bg-orange-100 text-orange-800 border-orange-200';
            default: return 'bg-blue-100 text-blue-800 border-blue-200';
        }
    };
    return (<div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/10 rounded-lg transition" aria-label="Voltar" title="Voltar">
              <ArrowLeft className="w-5 h-5"/>
            </button>
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-1">Dashboard de Saúde da População</h1>
              <p className="text-blue-100">Análise agregada e insights para tomada de decisão estratégica</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="bg-white/20 px-3 py-1 rounded-full text-sm">
                  📊 Análise Demográfica
                </span>
                <span className="bg-white/20 px-3 py-1 rounded-full text-sm">
                  🎯 Insights Clínicos
                </span>
                <span className="bg-white/20 px-3 py-1 rounded-full text-sm">
                  💡 Recomendações Ações
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Value Proposition Banner */}
      <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BarChart3 className="w-5 h-5 text-blue-600"/>
            </div>
            <div>
              <h3 className="font-semibold text-blue-900 mb-1">Para que serve este dashboard?</h3>
              <p className="text-blue-800 text-sm">
                Este dashboard analisa <strong>toda sua população de pacientes</strong> para identificar padrões, 
                riscos e oportunidades. Use os insights para:
              </p>
              <ul className="text-blue-800 text-sm mt-2 space-y-1">
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="w-5 h-5 text-blue-600"/>
              </div>
              <h3 className="text-sm font-medium text-gray-600">Total de Pacientes</h3>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {demographics?.totalPatients || 0}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="p-2 bg-green-100 rounded-lg mb-2 w-fit">
              <Activity className="w-5 h-5 text-green-600"/>
            </div>
            <h3 className="text-sm font-medium text-gray-600 mb-2">Pacientes Ativos</h3>
            <p className="text-3xl font-bold text-gray-900">
              {demographics?.activePatients || 0}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="p-2 bg-purple-100 rounded-lg mb-2 w-fit">
              <TrendingUp className="w-5 h-5 text-purple-600"/>
            </div>
            <h3 className="text-sm font-medium text-gray-600 mb-2">Idade Média</h3>
            <p className="text-3xl font-bold text-gray-900">
              {demographics?.averageAge.toFixed(0) || 0} anos
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="p-2 bg-orange-100 rounded-lg mb-2 w-fit">
              <AlertCircle className="w-5 h-5 text-orange-600"/>
            </div>
            <h3 className="text-sm font-medium text-gray-600 mb-2">Insights Ativos</h3>
            <p className="text-3xl font-bold text-gray-900">
              {insights.length}
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-green-600"/>
            Ações Rápidas Baseadas nos Dados
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">📋 Criar Programa Preventivo</h3>
              <p className="text-blue-800 text-sm mb-3">Baseado nos insights de risco, crie programas específicos para grupos identificados</p>
              <button className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition">
                Ver Recomendações
              </button>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-semibold text-green-900 mb-2">📊 Analisar Demanda</h3>
              <p className="text-green-800 text-sm mb-3">Use os dados demográficos para otimizar horários e serviços</p>
              <button className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition">
                Ver Análise
              </button>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h3 className="font-semibold text-purple-900 mb-2">🎯 Melhorar Adesão</h3>
              <p className="text-purple-800 text-sm mb-3">Implemente estratégias baseadas nos padrões de abandono identificados</p>
              <button className="bg-purple-600 text-white px-3 py-1 rounded text-sm hover:bg-purple-700 transition">
                Ver Estratégias
              </button>
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Distribuição por Gênero */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Distribuição por Gênero</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={demographics?.genderDistribution || []} dataKey="count" nameKey="gender" cx="50%" cy="50%" outerRadius={100} label={(entry) => `${entry.gender}: ${entry.percentage.toFixed(1)}%`}>
                    {demographics?.genderDistribution.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]}/>))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Distribuição por Idade */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Distribuição por Faixa Etária</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={demographics?.ageDistribution || []}>
                  <CartesianGrid strokeDasharray="3 3"/>
                  <XAxis dataKey="ageRange"/>
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3b82f6"/>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Insights */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-blue-600"/>
              Insights Populacionais
            </h2>
            <div className="text-sm text-gray-600">
              {insights.length} insights identificados
            </div>
          </div>
          
          {insights.length === 0 ? (<div className="text-center py-8">
              <div className="text-gray-400 mb-2">
                <AlertCircle className="w-12 h-12 mx-auto"/>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum insight disponível</h3>
              <p className="text-gray-600">Adicione mais pacientes e dados para gerar insights automáticos</p>
            </div>) : (<div className="space-y-4">
              {insights.map((insight, idx) => (<div key={idx} className={`border rounded-lg p-5 ${getPriorityColor(insight.priority)} hover:shadow-md transition-shadow`}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-lg">{insight.title}</h3>
                        <span className={`text-xs px-2 py-1 rounded-full ${insight.priority === 'high' ? 'bg-red-100 text-red-800' :
                    insight.priority === 'medium' ? 'bg-orange-100 text-orange-800' :
                        'bg-blue-100 text-blue-800'}`}>
                          {insight.priority === 'high' ? '🔴 Alta' :
                    insight.priority === 'medium' ? '🟡 Média' : '🔵 Baixa'} Prioridade
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                        <span className="flex items-center gap-1">
                          <Users className="w-4 h-4"/>
                          {insight.affectedPatientCount} pacientes
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4"/>
                          {insight.category}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-sm mb-4 leading-relaxed">{insight.description}</p>
                  
                  {insight.recommendations && insight.recommendations.length > 0 && (<div className="bg-white/60 rounded-lg p-3 mt-4">
                      <strong className="text-sm font-medium block mb-2">💡 Ações Recomendadas:</strong>
                      <ul className="space-y-1">
                        {insight.recommendations.slice(0, 3).map((rec, i) => (<li key={i} className="text-sm flex items-start gap-2">
                            <span className="text-blue-600 mt-1">→</span>
                            <span>{rec}</span>
                          </li>))}
                        {insight.recommendations.length > 3 && (<li className="text-xs text-gray-600 mt-2">
                            +{insight.recommendations.length - 3} outras recomendações...
                          </li>)}
                      </ul>
                    </div>)}
                  
                  {insight.evidence && (<div className="mt-3 pt-3 border-t border-white/30">
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <span>📊 {insight.evidence.source}</span>
                        <span>•</span>
                        <span>Confiança: {Math.round((insight.evidence.confidence || 0) * 100)}%</span>
                      </div>
                    </div>)}
                </div>))}
            </div>)}
        </div>
      </div>
    </div>);
};
export default PopulationHealthDashboardPage;
