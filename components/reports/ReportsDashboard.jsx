// components/reports/ReportsDashboard.tsx
import React, { useState } from 'react';
import { usePerformanceMetrics, useReportSummary, useStockValuationReport } from '../../hooks/useReports';
import { BarChart3, TrendingUp, DollarSign, Package, Download, RefreshCw, FileText, PieChart, LineChart } from 'lucide-react';
const ReportsDashboard = ({ onNavigateToReports, onNavigateToAnalytics }) => {
    const [selectedPeriod, setSelectedPeriod] = useState('30d');
    const { metrics, loading: metricsLoading, calculateMetrics } = usePerformanceMetrics();
    const { summary, loading: summaryLoading } = useReportSummary();
    const { report: valuationReport, loading: valuationLoading } = useStockValuationReport();
    const formatCurrency = (value) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    };
    const formatPercentage = (value) => {
        return `${value.toFixed(1)}%`;
    };
    const formatNumber = (value) => {
        return new Intl.NumberFormat('pt-BR').format(value);
    };
    const getPeriodLabel = (period) => {
        const labels = {
            '7d': 'Últimos 7 dias',
            '30d': 'Últimos 30 dias',
            '90d': 'Últimos 90 dias',
            '1y': 'Último ano'
        };
        return labels[period] || period;
    };
    const getMetricValue = (metricName) => {
        const metric = metrics.find(m => m.metric_name === metricName);
        return metric?.metric_value || 0;
    };
    const getMetricUnit = (metricName) => {
        const metric = metrics.find(m => m.metric_name === metricName);
        return metric?.metric_unit || '';
    };
    const handleRecalculateMetrics = async () => {
        try {
            await calculateMetrics();
        }
        catch (error) {
            console.error('Erro ao recalcular métricas:', error);
        }
    };
    return (<div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Relatórios e Analytics</h2>
          <p className="text-gray-600">Análise completa de performance e métricas</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <select value={selectedPeriod} onChange={(e) => setSelectedPeriod(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
            <option value="7d">Últimos 7 dias</option>
            <option value="30d">Últimos 30 dias</option>
            <option value="90d">Últimos 90 dias</option>
            <option value="1y">Último ano</option>
          </select>
          
          <button onClick={handleRecalculateMetrics} className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <RefreshCw className="h-4 w-4 mr-2"/>
            Atualizar
          </button>
          
          <button onClick={onNavigateToReports} className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
            <Download className="h-4 w-4 mr-2"/>
            Exportar
          </button>
        </div>
      </div>

      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Valor do Estoque</p>
              <p className="text-2xl font-bold text-gray-900">
                {valuationLoading ? '...' : formatCurrency(valuationReport?.totalValue || 0)}
              </p>
            </div>
            <DollarSign className="h-8 w-8 text-green-600"/>
          </div>
          <div className="mt-4">
            <span className="text-xs text-gray-500">
              {getPeriodLabel(selectedPeriod)}
            </span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Taxa de Giro</p>
              <p className="text-2xl font-bold text-gray-900">
                {metricsLoading ? '...' : `${formatNumber(getMetricValue('stock_turnover_rate'))}x`}
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-blue-600"/>
          </div>
          <div className="mt-4">
            <span className="text-xs text-gray-500">Por mês</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Custo Médio por Procedimento</p>
              <p className="text-2xl font-bold text-gray-900">
                {metricsLoading ? '...' : formatCurrency(getMetricValue('avg_cost_per_procedure'))}
              </p>
            </div>
            <BarChart3 className="h-8 w-8 text-purple-600"/>
          </div>
          <div className="mt-4">
            <span className="text-xs text-gray-500">Últimos 30 dias</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Eficiência de Uso</p>
              <p className="text-2xl font-bold text-gray-900">
                {metricsLoading ? '...' : formatPercentage(getMetricValue('supply_utilization_efficiency'))}
              </p>
            </div>
            <Package className="h-8 w-8 text-orange-600"/>
          </div>
          <div className="mt-4">
            <span className="text-xs text-gray-500">Insumos utilizados</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribuição por Categoria */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Valor por Categoria</h3>
            <PieChart className="h-5 w-5 text-gray-400"/>
          </div>
          
          {valuationLoading ? (<div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>) : (<div className="space-y-3">
              {valuationReport?.categoryBreakdown?.slice(0, 5).map((item, index) => (<div key={item.category} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full mr-3 ${index === 0 ? 'bg-blue-500' :
                    index === 1 ? 'bg-green-500' :
                        index === 2 ? 'bg-yellow-500' :
                            index === 3 ? 'bg-red-500' : 'bg-purple-500'}`}/>
                    <span className="text-sm font-medium text-gray-900">
                      {item.category.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {formatCurrency(item.value)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatPercentage(item.percentage)}
                    </p>
                  </div>
                </div>))}
            </div>)}
        </div>

        {/* Performance de Fornecedores */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Performance de Fornecedores</h3>
            <BarChart3 className="h-5 w-5 text-gray-400"/>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-green-500 mr-3"/>
                <span className="text-sm font-medium text-gray-900">Entrega no Prazo</span>
              </div>
              <span className="text-sm font-bold text-green-600">
                {formatPercentage(getMetricValue('on_time_delivery_rate'))}
              </span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-blue-500 mr-3"/>
                <span className="text-sm font-medium text-gray-900">Tempo Médio de Entrega</span>
              </div>
              <span className="text-sm font-bold text-blue-600">
                {formatNumber(getMetricValue('avg_delivery_days'))} dias
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Consumo Diário */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Consumo de Insumos</h3>
          <LineChart className="h-5 w-5 text-gray-400"/>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-2xl font-bold text-blue-600">
              {formatNumber(getMetricValue('avg_daily_consumption'))}
            </p>
            <p className="text-sm text-blue-700">Unidades/dia</p>
          </div>
          
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-2xl font-bold text-green-600">
              {formatNumber(getMetricValue('avg_daily_consumption') * 30)}
            </p>
            <p className="text-sm text-green-700">Unidades/mês</p>
          </div>
          
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <p className="text-2xl font-bold text-purple-600">
              {formatCurrency(getMetricValue('avg_daily_consumption') * 30 * 5)} {/* assumindo custo médio de R$ 5 */}
            </p>
            <p className="text-sm text-purple-700">Custo mensal estimado</p>
          </div>
        </div>
      </div>

      {/* Resumo de Relatórios */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Relatórios Agendados</h3>
          <FileText className="h-5 w-5 text-gray-400"/>
        </div>
        
        {summaryLoading ? (<div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>) : (<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-gray-900">{summary.totalReports}</p>
              <p className="text-sm text-gray-600">Total de Relatórios</p>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">{summary.activeScheduledReports}</p>
              <p className="text-sm text-green-700">Ativos</p>
            </div>
            
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">{summary.reportsGeneratedToday}</p>
              <p className="text-sm text-blue-700">Gerados Hoje</p>
            </div>
            
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <p className="text-sm font-bold text-purple-600">
                {summary.lastReportGenerated
                ? new Date(summary.lastReportGenerated).toLocaleDateString('pt-BR')
                : 'Nunca'}
              </p>
              <p className="text-sm text-purple-700">Última Geração</p>
            </div>
          </div>)}
      </div>

      {/* Ações Rápidas */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Ações Rápidas</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button onClick={onNavigateToReports} className="flex items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <Download className="h-6 w-6 text-blue-600 mr-2"/>
            <span className="text-sm font-medium text-gray-900">Exportar Relatórios</span>
          </button>
          
          <button onClick={onNavigateToAnalytics} className="flex items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <BarChart3 className="h-6 w-6 text-green-600 mr-2"/>
            <span className="text-sm font-medium text-gray-900">Analytics Detalhados</span>
          </button>
          
          <button onClick={handleRecalculateMetrics} className="flex items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <RefreshCw className="h-6 w-6 text-orange-600 mr-2"/>
            <span className="text-sm font-medium text-gray-900">Atualizar Métricas</span>
          </button>
        </div>
      </div>
    </div>);
};
export default ReportsDashboard;
