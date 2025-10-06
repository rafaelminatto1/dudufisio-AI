/**
 * 📊 ADVANCED REPORTS PAGE - DUDUFISIO-AI
 *
 * Dashboard completo de relatórios avançados com Business Intelligence,
 * analytics preditivos e sistemas de compliance integrados.
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useReporting, useFinancialReports, useClinicalReports, useOperationalReports, useComplianceReports } from '../hooks/useReporting';
import PermissionGuard, { IfPermission } from '../components/auth/PermissionGuard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import {
  FileText, TrendingUp, BarChart3, PieChart, LineChart, Users, Calendar,
  Download, RefreshCw, Filter, Search, Plus, Eye, Trash2, Clock,
  AlertTriangle, CheckCircle, Target, Zap, Brain, Activity, Shield,
  DollarSign, Settings, Export, Mail, Globe, FileSpreadsheet,
  BookOpen, Award, Heart, Lightbulb, Star, ArrowUpRight, ArrowDownRight,
  Gauge, Layers, Database, Bot, Sparkles, Archive, ChevronRight
} from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, LineChart as RechartsLineChart, Line, PieChart as RechartsPieChart, Cell, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

interface ReportGenerationModal {
  isOpen: boolean;
  templateId: string | null;
}

interface DateRange {
  start: string;
  end: string;
}

const AdvancedReportsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [dateRange, setDateRange] = useState<DateRange>({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  const [reportModal, setReportModal] = useState<ReportGenerationModal>({
    isOpen: false,
    templateId: null
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  // Main reporting hook
  const {
    templates,
    reports,
    biMetrics,
    complianceReport,
    predictiveAnalytics,
    isLoading,
    isGenerating,
    error,
    generateReport,
    deleteReport,
    exportReport,
    refreshData
  } = useReporting();

  // Specialized hooks
  const financialReports = useFinancialReports();
  const clinicalReports = useClinicalReports();
  const operationalReports = useOperationalReports();
  const complianceReports = useComplianceReports();

  useEffect(() => {
    refreshData();
  }, [dateRange]);

  const handleGenerateReport = useCallback(async (templateId: string, parameters: Record<string, any>) => {
    try {
      await generateReport(templateId, parameters);
      setReportModal({ isOpen: false, templateId: null });
    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
    }
  }, [generateReport]);

  const handleExportReport = async (reportId: string, format: string) => {
    try {
      const downloadUrl = await exportReport(reportId, format);
      window.open(downloadUrl, '_blank');
    } catch (error) {
      console.error('Erro ao exportar relatório:', error);
    }
  };

  // 🚀 Filtros memoizados para melhor performance
  const filteredTemplates = useMemo(() => {
    return templates.filter(template => {
      const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           template.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = filterCategory === 'all' || template.category === filterCategory;
      return matchesSearch && matchesCategory;
    });
  }, [templates, searchTerm, filterCategory]);

  const filteredReports = useMemo(() => {
    return reports.filter(report => {
      const template = templates.find(t => t.id === report.templateId);
      const matchesSearch = report.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = filterCategory === 'all' || template?.category === filterCategory;
      return matchesSearch && matchesCategory;
    });
  }, [reports, templates, searchTerm, filterCategory]);

  const getMetricChangeIcon = (changeType?: 'positive' | 'negative' | 'neutral') => {
    switch (changeType) {
      case 'positive':
        return <ArrowUpRight className="w-4 h-4 text-green-600" />;
      case 'negative':
        return <ArrowDownRight className="w-4 h-4 text-red-600" />;
      default:
        return <div className="w-4 h-4 rounded-full bg-gray-400" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'financial':
        return <DollarSign className="w-5 h-5 text-green-600" />;
      case 'clinical':
        return <Heart className="w-5 h-5 text-red-600" />;
      case 'operational':
        return <Settings className="w-5 h-5 text-blue-600" />;
      case 'compliance':
        return <Shield className="w-5 h-5 text-purple-600" />;
      default:
        return <FileText className="w-5 h-5 text-gray-600" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'financial':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'clinical':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'operational':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'compliance':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  if (isLoading && !biMetrics) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="flex items-center gap-3">
          <BarChart3 className="w-8 h-8 animate-pulse text-sky-600" />
          <div>
            <div className="text-lg font-semibold text-gray-900">Carregando relatórios...</div>
            <div className="text-sm text-gray-600">Preparando dashboard de BI</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <PermissionGuard permission="reports:read">
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <BarChart3 className="w-8 h-8 text-sky-600" />
              Relatórios Avançados
            </h1>
            <p className="text-gray-600 mt-1">
              Business Intelligence, Analytics e Compliance em tempo real
            </p>
          </div>

          <div className="flex items-center gap-3 mt-4 lg:mt-0">
            {/* Date Range Selector */}
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
              />
              <span className="text-gray-400">até</span>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
              />
            </div>

            <button
              onClick={refreshData}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              Atualizar
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <span className="text-red-800 font-medium">Erro:</span>
              <span className="text-red-700">{error}</span>
            </div>
          </div>
        )}

        {/* Business Intelligence Summary Cards */}
        {biMetrics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 border border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-700">Receita Total</p>
                  <p className="text-2xl font-bold text-green-900">
                    R$ {biMetrics.revenue.total.toLocaleString()}
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    <ArrowUpRight className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-green-700">+{biMetrics.revenue.growth}%</span>
                  </div>
                </div>
                <DollarSign className="w-8 h-8 text-green-600" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-700">Pacientes Ativos</p>
                  <p className="text-2xl font-bold text-blue-900">{biMetrics.patients.total}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <Users className="w-4 h-4 text-blue-600" />
                    <span className="text-sm text-blue-700">{biMetrics.patients.retention}% retenção</span>
                  </div>
                </div>
                <Users className="w-8 h-8 text-blue-600" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6 border border-purple-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-700">Taxa de Sucesso</p>
                  <p className="text-2xl font-bold text-purple-900">{biMetrics.clinical.outcomeSuccess}%</p>
                  <div className="flex items-center gap-1 mt-1">
                    <Target className="w-4 h-4 text-purple-600" />
                    <span className="text-sm text-purple-700">{biMetrics.clinical.averageTreatmentTime} dias média</span>
                  </div>
                </div>
                <Heart className="w-8 h-8 text-purple-600" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-6 border border-orange-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-700">Eficiência Operacional</p>
                  <p className="text-2xl font-bold text-orange-900">{biMetrics.operations.efficiency}%</p>
                  <div className="flex items-center gap-1 mt-1">
                    <Zap className="w-4 h-4 text-orange-600" />
                    <span className="text-sm text-orange-700">{biMetrics.operations.utilization}% ocupação</span>
                  </div>
                </div>
                <Activity className="w-8 h-8 text-orange-600" />
              </div>
            </div>
          </div>
        )}

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="reports">Relatórios</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="compliance">Compliance</TabsTrigger>
            <TabsTrigger value="predictive">Preditivo</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Recent Reports */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-500" />
                  Relatórios Recentes
                </h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {reports.slice(0, 5).map((report: any) => (
                    <div key={report.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center gap-3">
                        {getCategoryIcon(templates.find(t => t.id === report.templateId)?.category || '')}
                        <div>
                          <h4 className="font-medium text-gray-900">{report.title}</h4>
                          <p className="text-sm text-gray-600">
                            Gerado em {new Date(report.generatedAt).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          report.status === 'completed' ? 'bg-green-100 text-green-700' :
                          report.status === 'generating' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {report.status === 'completed' ? 'Concluído' :
                           report.status === 'generating' ? 'Gerando' : 'Erro'}
                        </span>
                        {report.status === 'completed' && (
                          <button
                            onClick={() => handleExportReport(report.id, 'pdf')}
                            className="text-sky-600 hover:text-sky-700"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Analytics */}
            {biMetrics && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Revenue Forecast Chart */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                  <div className="p-6 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Projeção de Receita</h3>
                  </div>
                  <div className="p-6">
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={biMetrics.revenue.forecast.map((value, index) => ({
                        month: `Mês ${index + 1}`,
                        projected: value,
                        current: index === 0 ? biMetrics.revenue.total : undefined
                      }))}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip formatter={(value) => [`R$ ${Number(value).toLocaleString()}`, 'Projeção']} />
                        <Area type="monotone" dataKey="projected" stroke="#0ea5e9" fill="#0ea5e9" fillOpacity={0.3} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Patient Risk Segments */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                  <div className="p-6 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Segmentação de Risco</h3>
                  </div>
                  <div className="p-6">
                    <ResponsiveContainer width="100%" height={300}>
                      <RechartsPieChart>
                        <Pie
                          data={biMetrics.patients.riskSegments}
                          dataKey="count"
                          nameKey="segment"
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          label={({ segment, percentage }) => `${segment}: ${percentage}%`}
                        >
                          {biMetrics.patients.riskSegments.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={index === 0 ? '#10b981' : index === 1 ? '#f59e0b' : '#ef4444'} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          {/* Templates Tab */}
          <TabsContent value="templates" className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Templates de Relatórios</h3>
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Buscar templates..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                      />
                    </div>
                    <select
                      value={filterCategory}
                      onChange={(e) => setFilterCategory(e.target.value)}
                      className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                    >
                      <option value="all">Todas as Categorias</option>
                      <option value="financial">Financeiros</option>
                      <option value="clinical">Clínicos</option>
                      <option value="operational">Operacionais</option>
                      <option value="compliance">Compliance</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredTemplates.map((template: any) => (
                    <div key={template.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          {getCategoryIcon(template.category)}
                          <div>
                            <h4 className="font-semibold text-gray-900">{template.name}</h4>
                            <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(template.category)}`}>
                              {template.category}
                            </span>
                          </div>
                        </div>
                      </div>

                      <p className="text-gray-600 text-sm mb-4">{template.description}</p>

                      <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                        <span>Tipo: {template.type}</span>
                        <span>Freq: {template.frequency}</span>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => setReportModal({ isOpen: true, templateId: template.id })}
                          disabled={isGenerating}
                          className="flex-1 bg-sky-600 text-white px-4 py-2 rounded-lg hover:bg-sky-700 transition-colors disabled:opacity-50 text-sm"
                        >
                          Gerar Relatório
                        </button>
                        <button className="text-gray-400 hover:text-gray-600 p-2">
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Relatórios Gerados</h3>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-600">
                      {reports.length} relatórios disponíveis
                    </span>
                  </div>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Relatório
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Categoria
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Gerado em
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredReports.map((report: any) => {
                      const template = templates.find(t => t.id === report.templateId);
                      return (
                        <tr key={report.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              {template && getCategoryIcon(template.category)}
                              <div>
                                <div className="text-sm font-medium text-gray-900">{report.title}</div>
                                <div className="text-sm text-gray-500">{template?.name}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {template && (
                              <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(template.category)}`}>
                                {template.category}
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(report.generatedAt).toLocaleDateString('pt-BR')} às{' '}
                            {new Date(report.generatedAt).toLocaleTimeString('pt-BR', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                              report.status === 'completed' ? 'bg-green-100 text-green-800' :
                              report.status === 'generating' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {report.status === 'completed' ? 'Concluído' :
                               report.status === 'generating' ? 'Gerando' : 'Erro'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center gap-2">
                              {report.status === 'completed' && (
                                <>
                                  <button
                                    onClick={() => handleExportReport(report.id, 'pdf')}
                                    className="text-sky-600 hover:text-sky-700"
                                    title="Baixar PDF"
                                  >
                                    <Download className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleExportReport(report.id, 'excel')}
                                    className="text-green-600 hover:text-green-700"
                                    title="Baixar Excel"
                                  >
                                    <FileSpreadsheet className="w-4 h-4" />
                                  </button>
                                </>
                              )}
                              <IfPermission permission="reports:delete">
                                <button
                                  onClick={() => deleteReport(report.id)}
                                  className="text-red-600 hover:text-red-700"
                                  title="Deletar"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </IfPermission>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            {biMetrics && (
              <>
                {/* Financial Analytics */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                  <div className="p-6 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-green-600" />
                      Analytics Financeiro
                    </h3>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-green-600">
                          R$ {biMetrics.financial.averageRevenuePatientsHour.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-600">Receita/Hora</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-blue-600">
                          {biMetrics.financial.profitMargin}%
                        </div>
                        <div className="text-sm text-gray-600">Margem de Lucro</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-purple-600">
                          {biMetrics.financial.paymentCollection}%
                        </div>
                        <div className="text-sm text-gray-600">Taxa de Cobrança</div>
                      </div>
                    </div>

                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={biMetrics.revenue.breakdown}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="category" />
                        <YAxis />
                        <Tooltip formatter={(value) => [`R$ ${Number(value).toLocaleString()}`, 'Receita']} />
                        <Bar dataKey="value" fill="#10b981" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Operational Analytics */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                  <div className="p-6 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <Activity className="w-5 h-5 text-blue-600" />
                      Analytics Operacional
                    </h3>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-sky-600">
                          {biMetrics.operations.utilization}%
                        </div>
                        <div className="text-sm text-gray-600">Taxa de Utilização</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-orange-600">
                          {biMetrics.operations.waitTime} min
                        </div>
                        <div className="text-sm text-gray-600">Tempo de Espera</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-red-600">
                          {biMetrics.operations.noShowRate}%
                        </div>
                        <div className="text-sm text-gray-600">Taxa No-Show</div>
                      </div>
                    </div>

                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={biMetrics.operations.staffProductivity}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="therapist" />
                        <YAxis />
                        <Tooltip formatter={(value) => [`${value}%`, 'Produtividade']} />
                        <Bar dataKey="productivity" fill="#0ea5e9" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </>
            )}
          </TabsContent>

          {/* Compliance Tab */}
          <TabsContent value="compliance" className="space-y-6">
            {complianceReport && (
              <div className="space-y-6">
                {/* Compliance Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">COFFITO</h3>
                      <Shield className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Registros Válidos</span>
                        <span className="font-semibold">{complianceReport.cfft.registrations.valid}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Taxa de Conformidade</span>
                        <span className="font-semibold text-green-600">{complianceReport.cfft.ceeRate}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">LGPD</h3>
                      <Shield className="w-6 h-6 text-purple-600" />
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Processamentos Válidos</span>
                        <span className="font-semibold">{complianceReport.lgpd.dataProcessing.lawful}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Consentimentos Ativos</span>
                        <span className="font-semibold text-green-600">{complianceReport.lgpd.consentManagement.valid}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">Qualidade</h3>
                      <Award className="w-6 h-6 text-yellow-600" />
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Aderência Protocolos</span>
                        <span className="font-semibold text-green-600">{complianceReport.quality.protocolAdherence}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Qualidade Docs</span>
                        <span className="font-semibold text-blue-600">{complianceReport.quality.documentationQuality}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          {/* Predictive Tab */}
          <TabsContent value="predictive" className="space-y-6">
            {predictiveAnalytics && (
              <div className="space-y-6">
                {/* Demand Forecast */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                  <div className="p-6 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <Brain className="w-5 h-5 text-purple-600" />
                      Previsão de Demanda
                      <span className="text-sm font-normal text-gray-600">
                        (Confiança: {Math.round(predictiveAnalytics.demandForecast.confidence * 100)}%)
                      </span>
                    </h3>
                  </div>
                  <div className="p-6">
                    <ResponsiveContainer width="100%" height={300}>
                      <RechartsLineChart data={predictiveAnalytics.demandForecast.nextWeek.map((value, index) => ({
                        day: `Dia ${index + 1}`,
                        demand: value
                      }))}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="day" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="demand" stroke="#8b5cf6" strokeWidth={2} />
                      </RechartsLineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Financial Projections */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                  <div className="p-6 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-green-600" />
                      Projeções Financeiras
                    </h3>
                  </div>
                  <div className="p-6">
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={predictiveAnalytics.financialProjection.revenueForcast}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip formatter={(value) => [`R$ ${Number(value).toLocaleString()}`, 'Projeção']} />
                        <Area type="monotone" dataKey="projected" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Patient Risk Predictions */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                  <div className="p-6 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-orange-600" />
                      Predições de Risco de Pacientes
                    </h3>
                  </div>
                  <div className="p-6">
                    <div className="space-y-4">
                      {predictiveAnalytics.patientRisk.dropoutPrediction.map((prediction, index) => (
                        <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                          <div>
                            <div className="font-medium text-gray-900">Paciente {prediction.patientId}</div>
                            <div className="text-sm text-gray-600">
                              Fatores: {prediction.factors.join(', ')}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`text-lg font-bold ${
                              prediction.risk > 0.7 ? 'text-red-600' :
                              prediction.risk > 0.4 ? 'text-yellow-600' : 'text-green-600'
                            }`}>
                              {Math.round(prediction.risk * 100)}%
                            </div>
                            <div className="text-xs text-gray-500">Risco de Abandono</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Report Generation Modal */}
        {reportModal.isOpen && reportModal.templateId && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Gerar Relatório
              </h3>
              <p className="text-gray-600 mb-6">
                Configurar parâmetros para o relatório selecionado.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => handleGenerateReport(reportModal.templateId!, {
                    dateRange: dateRange,
                    includeForecasts: true
                  })}
                  disabled={isGenerating}
                  className="flex-1 bg-sky-600 text-white px-4 py-2 rounded-lg hover:bg-sky-700 transition-colors disabled:opacity-50"
                >
                  {isGenerating ? 'Gerando...' : 'Gerar'}
                </button>
                <button
                  onClick={() => setReportModal({ isOpen: false, templateId: null })}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </PermissionGuard>
  );
};

export default AdvancedReportsPage;