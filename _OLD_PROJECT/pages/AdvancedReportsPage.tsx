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
  DollarSign, Settings, Mail, Globe, FileSpreadsheet,
  BookOpen, Award, Heart, Lightbulb, Star, ArrowUpRight, ArrowDownRight,
  Gauge, Layers, Database, Bot, Sparkles, Archive, ChevronRight
} from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, LineChart as RechartsLineChart, Line, PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from '@/components/charts/ChartsLazyOptimized';

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
      if (format === 'pdf') {
        // Use the simple PDF service for PDF generation
        const report = reports.find(r => r.id === reportId);
        if (report) {
          const { SimplePDFService } = await import('../services/simplePdfService');
          await SimplePDFService.generateReportPDF(report);
          return;
        }
      }
      
      // For other formats, use the original method
      const downloadUrl = await exportReport(reportId, format);
      
      // Create a temporary link element for download
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `relatorio_${reportId}_${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up the URL after a delay
      setTimeout(() => {
        URL.revokeObjectURL(downloadUrl);
      }, 1000);
      
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
        return <ArrowUpRight className="w-4 h-4 text-success" />;
      case 'negative':
        return <ArrowDownRight className="w-4 h-4 text-error" />;
      default:
        return <div className="w-4 h-4 rounded-full bg-gray-400" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'financial':
        return <DollarSign className="w-5 h-5 text-success" />;
      case 'clinical':
        return <Heart className="w-5 h-5 text-error" />;
      case 'operational':
        return <Settings className="w-5 h-5 text-primary" />;
      case 'compliance':
        return <Shield className="w-5 h-5 text-purple-600" />;
      default:
        return <FileText className="w-5 h-5 text-neutral-textSecondary" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'financial':
        return 'bg-success-light text-success border-success';
      case 'clinical':
        return 'bg-error-light text-error border-error';
      case 'operational':
        return 'bg-primary-light text-primary border-primary';
      case 'compliance':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      default:
        return 'bg-neutral-bgAlt text-gray-700 border-neutral-border';
    }
  };

  if (isLoading && !biMetrics) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="flex items-center gap-md">
          <BarChart3 className="w-8 h-8 animate-pulse text-primary" />
          <div>
            <div className="text-lg font-semibold text-neutral-text">Carregando relatórios...</div>
            <div className="text-sm text-neutral-textSecondary">Preparando dashboard de BI</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <PermissionGuard permission="reports:read">
      <div className="p-lg max-w-7xl mx-auto space-y-xl">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-neutral-text flex items-center gap-md">
              <BarChart3 className="w-8 h-8 text-primary" />
              Relatórios Avançados
            </h1>
            <p className="text-neutral-textSecondary mt-xs">
              Business Intelligence, Analytics e Compliance em tempo real
            </p>
          </div>

          <div className="flex items-center gap-md mt-md lg:mt-0">
            {/* Date Range Selector */}
            <div className="flex items-center gap-sm">
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                className="border border-gray-300 rounded-lg px-md py-sm text-sm"
              />
              <span className="text-neutral-textTertiary">até</span>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                className="border border-gray-300 rounded-lg px-md py-sm text-sm"
              />
            </div>

            <button
              onClick={refreshData}
              disabled={isLoading}
              className="flex items-center gap-sm px-md py-sm bg-primary-hover text-white rounded-lg hover:bg-primary-hover transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              Atualizar
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-error-light border border-error rounded-lg p-md">
            <div className="flex items-center gap-sm">
              <AlertTriangle className="w-5 h-5 text-error" />
              <span className="text-error font-medium">Erro:</span>
              <span className="text-error">{error}</span>
            </div>
          </div>
        )}

        {/* Business Intelligence Summary Cards */}
        {biMetrics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-lg">
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-lg border border-success">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-success">Receita Total</p>
                  <p className="text-2xl font-bold text-green-900">
                    R$ {biMetrics.revenue.total.toLocaleString()}
                  </p>
                  <div className="flex items-center gap-1 mt-xs">
                    <ArrowUpRight className="w-4 h-4 text-success" />
                    <span className="text-sm text-success">+{biMetrics.revenue.growth}%</span>
                  </div>
                </div>
                <DollarSign className="w-8 h-8 text-success" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-lg border border-primary">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-primary">Pacientes Ativos</p>
                  <p className="text-2xl font-bold text-blue-900">{biMetrics.patients.total}</p>
                  <div className="flex items-center gap-1 mt-xs">
                    <Users className="w-4 h-4 text-primary" />
                    <span className="text-sm text-primary">{biMetrics.patients.retention}% retenção</span>
                  </div>
                </div>
                <Users className="w-8 h-8 text-primary" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-lg border border-purple-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-700">Taxa de Sucesso</p>
                  <p className="text-2xl font-bold text-purple-900">{biMetrics.clinical.outcomeSuccess}%</p>
                  <div className="flex items-center gap-1 mt-xs">
                    <Target className="w-4 h-4 text-purple-600" />
                    <span className="text-sm text-purple-700">{biMetrics.clinical.averageTreatmentTime} dias média</span>
                  </div>
                </div>
                <Heart className="w-8 h-8 text-purple-600" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-lg border border-warning">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-warning">Eficiência Operacional</p>
                  <p className="text-2xl font-bold text-orange-900">{biMetrics.operations.efficiency}%</p>
                  <div className="flex items-center gap-1 mt-xs">
                    <Zap className="w-4 h-4 text-warning" />
                    <span className="text-sm text-warning">{biMetrics.operations.utilization}% ocupação</span>
                  </div>
                </div>
                <Activity className="w-8 h-8 text-warning" />
              </div>
            </div>
          </div>
        )}

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-xl">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="reports">Relatórios</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="compliance">Compliance</TabsTrigger>
            <TabsTrigger value="predictive">Preditivo</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-xl">
            {/* Recent Reports */}
            <div className="bg-white rounded-lg shadow-card border border-neutral-border">
              <div className="p-lg border-b border-neutral-border">
                <h3 className="text-lg font-semibold text-neutral-text flex items-center gap-sm">
                  <Clock className="w-5 h-5 text-blue-500" />
                  Relatórios Recentes
                </h3>
              </div>
              <div className="p-lg">
                <div className="space-y-md">
                  {reports.slice(0, 5).map((report: any) => (
                    <div key={report.id} className="flex items-center justify-between p-md border border-neutral-border rounded-lg">
                      <div className="flex items-center gap-md">
                        {getCategoryIcon(templates.find(t => t.id === report.templateId)?.category || '')}
                        <div>
                          <h4 className="font-medium text-neutral-text">{report.title}</h4>
                          <p className="text-sm text-neutral-textSecondary">
                            Gerado em {new Date(report.generatedAt).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-sm">
                        <span className={`px-sm py-1 rounded-full text-xs font-medium ${
                          report.status === 'completed' ? 'bg-success-light text-success' :
                          report.status === 'generating' ? 'bg-warning-light text-yellow-700' :
                          'bg-error-light text-error'
                        }`}>
                          {report.status === 'completed' ? 'Concluído' :
                           report.status === 'generating' ? 'Gerando' : 'Erro'}
                        </span>
                        {report.status === 'completed' && (
                          <button
                            onClick={() => handleExportReport(report.id, 'pdf')}
                            className="text-primary hover:text-primary"
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
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg">
                {/* Revenue Forecast Chart */}
                <div className="bg-white rounded-lg shadow-card border border-neutral-border">
                  <div className="p-lg border-b border-neutral-border">
                    <h3 className="text-lg font-semibold text-neutral-text">Projeção de Receita</h3>
                  </div>
                  <div className="p-lg">
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
                <div className="bg-white rounded-lg shadow-card border border-neutral-border">
                  <div className="p-lg border-b border-neutral-border">
                    <h3 className="text-lg font-semibold text-neutral-text">Segmentação de Risco</h3>
                  </div>
                  <div className="p-lg">
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
          <TabsContent value="templates" className="space-y-xl">
            <div className="bg-white rounded-lg shadow-card border border-neutral-border">
              <div className="p-lg border-b border-neutral-border">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-neutral-text">Templates de Relatórios</h3>
                  <div className="flex items-center gap-md">
                    <div className="relative">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-textTertiary" />
                      <input
                        type="text"
                        placeholder="Buscar templates..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-sm border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                      />
                    </div>
                    <select
                      value={filterCategory}
                      onChange={(e) => setFilterCategory(e.target.value)}
                      className="border border-gray-300 rounded-lg px-md py-sm text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
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
              <div className="p-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg">
                  {filteredTemplates.map((template: any) => (
                    <div key={template.id} className="border border-neutral-border rounded-lg p-lg hover:shadow-cardHover transition-shadow">
                      <div className="flex items-start justify-between mb-md">
                        <div className="flex items-center gap-md">
                          {getCategoryIcon(template.category)}
                          <div>
                            <h4 className="font-semibold text-neutral-text">{template.name}</h4>
                            <span className={`inline-block px-sm py-1 rounded-full text-xs font-medium ${getCategoryColor(template.category)}`}>
                              {template.category}
                            </span>
                          </div>
                        </div>
                      </div>

                      <p className="text-neutral-textSecondary text-sm mb-md">{template.description}</p>

                      <div className="flex items-center justify-between text-xs text-gray-500 mb-md">
                        <span>Tipo: {template.type}</span>
                        <span>Freq: {template.frequency}</span>
                      </div>

                      <div className="flex gap-sm">
                        <button
                          onClick={() => setReportModal({ isOpen: true, templateId: template.id })}
                          disabled={isGenerating}
                          className="flex-1 bg-primary-hover text-white px-md py-sm rounded-lg hover:bg-primary-hover transition-colors disabled:opacity-50 text-sm"
                        >
                          Gerar Relatório
                        </button>
                        <button className="text-neutral-textTertiary hover:text-neutral-textSecondary p-sm">
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
          <TabsContent value="reports" className="space-y-xl">
            <div className="bg-white rounded-lg shadow-card border border-neutral-border">
              <div className="p-lg border-b border-neutral-border">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-neutral-text">Relatórios Gerados</h3>
                  <div className="flex items-center gap-md">
                    <span className="text-sm text-neutral-textSecondary">
                      {reports.length} relatórios disponíveis
                    </span>
                  </div>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-neutral-bgAlt">
                    <tr>
                      <th className="px-lg py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Relatório
                      </th>
                      <th className="px-lg py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Categoria
                      </th>
                      <th className="px-lg py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Gerado em
                      </th>
                      <th className="px-lg py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-lg py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredReports.map((report: any) => {
                      const template = templates.find(t => t.id === report.templateId);
                      return (
                        <tr key={report.id} className="hover:bg-neutral-bgAlt">
                          <td className="px-lg py-md whitespace-nowrap">
                            <div className="flex items-center gap-md">
                              {template && getCategoryIcon(template.category)}
                              <div>
                                <div className="text-sm font-medium text-neutral-text">{report.title}</div>
                                <div className="text-sm text-gray-500">{template?.name}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-lg py-md whitespace-nowrap">
                            {template && (
                              <span className={`inline-flex px-sm py-1 text-xs font-medium rounded-full ${getCategoryColor(template.category)}`}>
                                {template.category}
                              </span>
                            )}
                          </td>
                          <td className="px-lg py-md whitespace-nowrap text-sm text-gray-500">
                            {new Date(report.generatedAt).toLocaleDateString('pt-BR')} às{' '}
                            {new Date(report.generatedAt).toLocaleTimeString('pt-BR', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </td>
                          <td className="px-lg py-md whitespace-nowrap">
                            <span className={`inline-flex px-sm py-1 text-xs font-medium rounded-full ${
                              report.status === 'completed' ? 'bg-success-light text-success' :
                              report.status === 'generating' ? 'bg-warning-light text-yellow-800' :
                              'bg-error-light text-error'
                            }`}>
                              {report.status === 'completed' ? 'Concluído' :
                               report.status === 'generating' ? 'Gerando' : 'Erro'}
                            </span>
                          </td>
                          <td className="px-lg py-md whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center gap-sm">
                              {report.status === 'completed' && (
                                <>
                                  <button
                                    onClick={() => handleExportReport(report.id, 'pdf')}
                                    className="text-primary hover:text-primary"
                                    title="Baixar PDF"
                                  >
                                    <Download className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleExportReport(report.id, 'excel')}
                                    className="text-success hover:text-success"
                                    title="Baixar Excel"
                                  >
                                    <FileSpreadsheet className="w-4 h-4" />
                                  </button>
                                </>
                              )}
                              <IfPermission permission="reports:delete">
                                <button
                                  onClick={() => deleteReport(report.id)}
                                  className="text-error hover:text-error"
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
          <TabsContent value="analytics" className="space-y-xl">
            {biMetrics && (
              <>
                {/* Financial Analytics */}
                <div className="bg-white rounded-lg shadow-card border border-neutral-border">
                  <div className="p-lg border-b border-neutral-border">
                    <h3 className="text-lg font-semibold text-neutral-text flex items-center gap-sm">
                      <DollarSign className="w-5 h-5 text-success" />
                      Analytics Financeiro
                    </h3>
                  </div>
                  <div className="p-lg">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-lg mb-xl">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-success">
                          R$ {biMetrics.financial.averageRevenuePatientsHour.toLocaleString()}
                        </div>
                        <div className="text-sm text-neutral-textSecondary">Receita/Hora</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-primary">
                          {biMetrics.financial.profitMargin}%
                        </div>
                        <div className="text-sm text-neutral-textSecondary">Margem de Lucro</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-purple-600">
                          {biMetrics.financial.paymentCollection}%
                        </div>
                        <div className="text-sm text-neutral-textSecondary">Taxa de Cobrança</div>
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
                <div className="bg-white rounded-lg shadow-card border border-neutral-border">
                  <div className="p-lg border-b border-neutral-border">
                    <h3 className="text-lg font-semibold text-neutral-text flex items-center gap-sm">
                      <Activity className="w-5 h-5 text-primary" />
                      Analytics Operacional
                    </h3>
                  </div>
                  <div className="p-lg">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-lg mb-xl">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-primary">
                          {biMetrics.operations.utilization}%
                        </div>
                        <div className="text-sm text-neutral-textSecondary">Taxa de Utilização</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-warning">
                          {biMetrics.operations.waitTime} min
                        </div>
                        <div className="text-sm text-neutral-textSecondary">Tempo de Espera</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-error">
                          {biMetrics.operations.noShowRate}%
                        </div>
                        <div className="text-sm text-neutral-textSecondary">Taxa No-Show</div>
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
          <TabsContent value="compliance" className="space-y-xl">
            {complianceReport && (
              <div className="space-y-xl">
                {/* Compliance Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-lg">
                  <div className="bg-white rounded-lg shadow-card border border-neutral-border p-lg">
                    <div className="flex items-center justify-between mb-md">
                      <h3 className="text-lg font-semibold text-neutral-text">COFFITO</h3>
                      <Shield className="w-6 h-6 text-primary" />
                    </div>
                    <div className="space-y-sm">
                      <div className="flex justify-between">
                        <span className="text-sm text-neutral-textSecondary">Registros Válidos</span>
                        <span className="font-semibold">{complianceReport.cfft.registrations.valid}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-neutral-textSecondary">Taxa de Conformidade</span>
                        <span className="font-semibold text-success">{complianceReport.cfft.ceeRate}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow-card border border-neutral-border p-lg">
                    <div className="flex items-center justify-between mb-md">
                      <h3 className="text-lg font-semibold text-neutral-text">LGPD</h3>
                      <Shield className="w-6 h-6 text-purple-600" />
                    </div>
                    <div className="space-y-sm">
                      <div className="flex justify-between">
                        <span className="text-sm text-neutral-textSecondary">Processamentos Válidos</span>
                        <span className="font-semibold">{complianceReport.lgpd.dataProcessing.lawful}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-neutral-textSecondary">Consentimentos Ativos</span>
                        <span className="font-semibold text-success">{complianceReport.lgpd.consentManagement.valid}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow-card border border-neutral-border p-lg">
                    <div className="flex items-center justify-between mb-md">
                      <h3 className="text-lg font-semibold text-neutral-text">Qualidade</h3>
                      <Award className="w-6 h-6 text-warning" />
                    </div>
                    <div className="space-y-sm">
                      <div className="flex justify-between">
                        <span className="text-sm text-neutral-textSecondary">Aderência Protocolos</span>
                        <span className="font-semibold text-success">{complianceReport.quality.protocolAdherence}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-neutral-textSecondary">Qualidade Docs</span>
                        <span className="font-semibold text-primary">{complianceReport.quality.documentationQuality}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          {/* Predictive Tab */}
          <TabsContent value="predictive" className="space-y-xl">
            {predictiveAnalytics && (
              <div className="space-y-xl">
                {/* Demand Forecast */}
                <div className="bg-white rounded-lg shadow-card border border-neutral-border">
                  <div className="p-lg border-b border-neutral-border">
                    <h3 className="text-lg font-semibold text-neutral-text flex items-center gap-sm">
                      <Brain className="w-5 h-5 text-purple-600" />
                      Previsão de Demanda
                      <span className="text-sm font-normal text-neutral-textSecondary">
                        (Confiança: {Math.round(predictiveAnalytics.demandForecast.confidence * 100)}%)
                      </span>
                    </h3>
                  </div>
                  <div className="p-lg">
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
                <div className="bg-white rounded-lg shadow-card border border-neutral-border">
                  <div className="p-lg border-b border-neutral-border">
                    <h3 className="text-lg font-semibold text-neutral-text flex items-center gap-sm">
                      <TrendingUp className="w-5 h-5 text-success" />
                      Projeções Financeiras
                    </h3>
                  </div>
                  <div className="p-lg">
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
                <div className="bg-white rounded-lg shadow-card border border-neutral-border">
                  <div className="p-lg border-b border-neutral-border">
                    <h3 className="text-lg font-semibold text-neutral-text flex items-center gap-sm">
                      <AlertTriangle className="w-5 h-5 text-warning" />
                      Predições de Risco de Pacientes
                    </h3>
                  </div>
                  <div className="p-lg">
                    <div className="space-y-md">
                      {predictiveAnalytics.patientRisk.dropoutPrediction.map((prediction, index) => (
                        <div key={index} className="flex items-center justify-between p-md border border-neutral-border rounded-lg">
                          <div>
                            <div className="font-medium text-neutral-text">Paciente {prediction.patientId}</div>
                            <div className="text-sm text-neutral-textSecondary">
                              Fatores: {prediction.factors.join(', ')}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`text-lg font-bold ${
                              prediction.risk > 0.7 ? 'text-error' :
                              prediction.risk > 0.4 ? 'text-warning' : 'text-success'
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
            <div className="bg-white rounded-lg p-lg w-full max-w-md">
              <h3 className="text-lg font-semibold text-neutral-text mb-md">
                Gerar Relatório
              </h3>
              <p className="text-neutral-textSecondary mb-xl">
                Configurar parâmetros para o relatório selecionado.
              </p>
              <div className="flex gap-md">
                <button
                  onClick={() => handleGenerateReport(reportModal.templateId!, {
                    dateRange: dateRange,
                    includeForecasts: true
                  })}
                  disabled={isGenerating}
                  className="flex-1 bg-primary-hover text-white px-md py-sm rounded-lg hover:bg-primary-hover transition-colors disabled:opacity-50"
                >
                  {isGenerating ? 'Gerando...' : 'Gerar'}
                </button>
                <button
                  onClick={() => setReportModal({ isOpen: false, templateId: null })}
                  className="px-md py-sm border border-gray-300 rounded-lg hover:bg-neutral-bgAlt transition-colors"
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
