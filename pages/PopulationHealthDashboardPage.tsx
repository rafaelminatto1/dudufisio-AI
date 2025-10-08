import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, TrendingUp, BarChart3, MapPin, Activity, AlertCircle } from 'lucide-react';
import { populationHealthServiceSupabase } from '../services/analytics/populationHealthServiceSupabase';
import { PopulationDemographics, PopulationInsight } from '../types/populationHealthTypes';
import { toast } from 'react-toastify';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando análise populacional...</p>
        </div>
      </div>
    );
  }

  const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-white/10 rounded-lg transition"
              aria-label="Voltar"
              title="Voltar"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold mb-1">Dashboard de Saúde da População</h1>
              <p className="text-blue-100">Análise agregada e insights populacionais</p>
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
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="text-sm font-medium text-gray-600">Total de Pacientes</h3>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {demographics?.totalPatients || 0}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="p-2 bg-green-100 rounded-lg mb-2 w-fit">
              <Activity className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="text-sm font-medium text-gray-600 mb-2">Pacientes Ativos</h3>
            <p className="text-3xl font-bold text-gray-900">
              {demographics?.activePatients || 0}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="p-2 bg-purple-100 rounded-lg mb-2 w-fit">
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
            <h3 className="text-sm font-medium text-gray-600 mb-2">Idade Média</h3>
            <p className="text-3xl font-bold text-gray-900">
              {demographics?.averageAge.toFixed(0) || 0} anos
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="p-2 bg-orange-100 rounded-lg mb-2 w-fit">
              <AlertCircle className="w-5 h-5 text-orange-600" />
            </div>
            <h3 className="text-sm font-medium text-gray-600 mb-2">Insights Ativos</h3>
            <p className="text-3xl font-bold text-gray-900">
              {insights.length}
            </p>
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
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Distribuição por Faixa Etária</h2>
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
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-blue-600" />
            Insights Populacionais
          </h2>
          <div className="space-y-4">
            {insights.map((insight, idx) => (
              <div
                key={idx}
                className={`border rounded-lg p-4 ${getPriorityColor(insight.priority)}`}
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-lg">{insight.title}</h3>
                  <span className="text-xs px-2 py-1 bg-white/50 rounded">
                    {insight.category}
                  </span>
                </div>
                <p className="text-sm mb-3">{insight.description}</p>
                <div className="text-xs mb-2">
                  <strong>Pacientes Afetados:</strong> {insight.affectedPatientCount}
                </div>
                {insight.recommendations.length > 0 && (
                  <div className="mt-3">
                    <strong className="text-sm">Recomendações:</strong>
                    <ul className="mt-1 space-y-1">
                      {insight.recommendations.map((rec, i) => (
                        <li key={i} className="text-sm">• {rec}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PopulationHealthDashboardPage;

