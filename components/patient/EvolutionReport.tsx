import React, { useState, useEffect } from 'react';
import { Calendar, Download, FileText, BarChart3, LineChart as LineChartIcon, TrendingUp, FileSpreadsheet, Share2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart
} from '@/components/charts/ChartsLazyOptimized';
import type { EvolutionReportData, AssessmentStatistics } from '../../types';
import { generateEvolutionReport } from '../../services/patientTrackingService';
import { 
  exportAssessmentsToExcel,
  exportStatisticsToExcel,
  exportReportToPDF,
  copyReportToClipboard
} from '../../utils/exportUtils';
import format from 'date-fns/format';
import parseISO from 'date-fns/parseISO';
import subMonths from 'date-fns/subMonths';
import subWeeks from 'date-fns/subWeeks';
import { ptBR } from 'date-fns/locale';

interface EvolutionReportProps {
  patientId: string;
  patientName?: string;
}

type ChartType = 'line' | 'bar' | 'composed';
type PeriodType = '1week' | '1month' | '3months' | '6months' | 'all' | 'custom';

export const EvolutionReport: React.FC<EvolutionReportProps> = ({ patientId, patientName = 'Paciente' }) => {
  const [reportData, setReportData] = useState<EvolutionReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [period, setPeriod] = useState<PeriodType>('1month');
  const [customDates, setCustomDates] = useState({
    start: format(subMonths(new Date(), 1), 'yyyy-MM-dd'),
    end: format(new Date(), 'yyyy-MM-dd')
  });
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([]);
  const [chartType, setChartType] = useState<ChartType>('line');

  useEffect(() => {
    loadReport();
  }, [patientId, period, customDates]);

  const loadReport = async () => {
    try {
      setLoading(true);
      
      let startDate: string;
      let endDate: string = format(new Date(), 'yyyy-MM-dd');

      switch (period) {
        case '1week':
          startDate = format(subWeeks(new Date(), 1), 'yyyy-MM-dd');
          break;
        case '1month':
          startDate = format(subMonths(new Date(), 1), 'yyyy-MM-dd');
          break;
        case '3months':
          startDate = format(subMonths(new Date(), 3), 'yyyy-MM-dd');
          break;
        case '6months':
          startDate = format(subMonths(new Date(), 6), 'yyyy-MM-dd');
          break;
        case 'all':
          startDate = '2000-01-01';
          break;
        case 'custom':
          startDate = customDates.start;
          endDate = customDates.end;
          break;
      }

      const data = await generateEvolutionReport(patientId, startDate, endDate);
      setReportData(data);

      // Selecionar todas as métricas por padrão
      if (selectedMetrics.length === 0 && data.statistics.length > 0) {
        setSelectedMetrics(data.statistics.map(s => s.fieldName));
      }
    } catch (error) {
      console.error('Erro ao carregar relatório:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleMetric = (fieldName: string) => {
    if (selectedMetrics.includes(fieldName)) {
      setSelectedMetrics(selectedMetrics.filter(m => m !== fieldName));
    } else {
      setSelectedMetrics([...selectedMetrics, fieldName]);
    }
  };

  const handleExportPDF = async () => {
    if (!reportData) return;
    
    try {
      setExporting(true);
      exportReportToPDF(reportData, patientName);
    } catch (error: any) {
      alert(error.message || 'Erro ao exportar PDF');
    } finally {
      setExporting(false);
    }
  };

  const handleExportExcel = async () => {
    if (!reportData) return;
    
    try {
      setExporting(true);
      exportAssessmentsToExcel(reportData, patientName);
    } catch (error: any) {
      alert(error.message || 'Erro ao exportar Excel');
    } finally {
      setExporting(false);
    }
  };

  const handleExportStatistics = async () => {
    if (!reportData) return;
    
    try {
      setExporting(true);
      exportStatisticsToExcel(reportData.statistics, patientName);
    } catch (error: any) {
      alert(error.message || 'Erro ao exportar estatísticas');
    } finally {
      setExporting(false);
    }
  };

  const handleCopyToClipboard = async () => {
    if (!reportData) return;
    
    try {
      await copyReportToClipboard(reportData);
      alert('Dados copiados para a área de transferência!');
    } catch (error: any) {
      alert(error.message || 'Erro ao copiar dados');
    }
  };

  // Agrupar dados do gráfico por métrica
  const getChartDataByMetric = () => {
    if (!reportData) return {};

    const grouped: Record<string, any[]> = {};
    
    reportData.assessments.forEach(assessment => {
      if (!grouped[assessment.fieldName]) {
        grouped[assessment.fieldName] = [];
      }
      grouped[assessment.fieldName].push({
        date: format(parseISO(assessment.date), 'dd/MM'),
        value: assessment.value,
        sessionNumber: assessment.sessionNumber,
        timing: assessment.timing
      });
    });

    return grouped;
  };

  // Preparar dados combinados para o gráfico
  const prepareCombinedChartData = () => {
    if (!reportData) return [];

    const chartDataByMetric = getChartDataByMetric();
    const allDates = [...new Set(reportData.assessments.map(a => format(parseISO(a.date), 'dd/MM')))];

    return allDates.map(date => {
      const dataPoint: any = { date };
      
      selectedMetrics.forEach(metric => {
        const metricData = chartDataByMetric[metric] || [];
        const point = metricData.find(d => d.date === date);
        dataPoint[metric] = point?.value;
      });

      return dataPoint;
    });
  };

  const getColorForMetric = (index: number) => {
    const colors = [
      '#3b82f6', // blue
      '#10b981', // green
      '#f59e0b', // amber
      '#ef4444', // red
      '#8b5cf6', // purple
      '#06b6d4', // cyan
      '#f97316', // orange
      '#84cc16'  // lime
    ];
    return colors[index % colors.length];
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
            <p className="text-slate-600">Gerando relatório de evolução...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!reportData) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center">
            <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600">Erro ao carregar relatório</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const chartDataByMetric = getChartDataByMetric();
  const combinedChartData = prepareCombinedChartData();

  return (
    <div className="space-y-6">
      {/* Header com controles */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Relatório de Evolução
            </CardTitle>
            <div className="flex items-center gap-2 flex-wrap">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleExportPDF}
                disabled={exporting || !reportData}
              >
                <FileText className="w-4 h-4 mr-2" />
                {exporting ? 'Exportando...' : 'PDF'}
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleExportExcel}
                disabled={exporting || !reportData}
              >
                <FileSpreadsheet className="w-4 h-4 mr-2" />
                Excel (Dados)
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleExportStatistics}
                disabled={exporting || !reportData}
              >
                <Download className="w-4 h-4 mr-2" />
                Excel (Stats)
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleCopyToClipboard}
                disabled={exporting || !reportData}
              >
                <Share2 className="w-4 h-4 mr-2" />
                Copiar
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Seleção de Período */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Período
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                { value: '1week', label: '1 Semana' },
                { value: '1month', label: '1 Mês' },
                { value: '3months', label: '3 Meses' },
                { value: '6months', label: '6 Meses' },
                { value: 'all', label: 'Tudo' },
                { value: 'custom', label: 'Personalizado' }
              ].map(opt => (
                <Button
                  key={opt.value}
                  variant={period === opt.value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPeriod(opt.value as PeriodType)}
                >
                  {opt.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Datas Personalizadas */}
          {period === 'custom' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="custom-date-start" className="block text-sm font-medium text-slate-700 mb-2">
                  Data Inicial
                </label>
                <input
                  id="custom-date-start"
                  type="date"
                  value={customDates.start}
                  onChange={(e) => setCustomDates({ ...customDates, start: e.target.value })}
                  className="w-full border border-slate-300 rounded-md px-3 py-2"
                />
              </div>
              <div>
                <label htmlFor="custom-date-end" className="block text-sm font-medium text-slate-700 mb-2">
                  Data Final
                </label>
                <input
                  id="custom-date-end"
                  type="date"
                  value={customDates.end}
                  onChange={(e) => setCustomDates({ ...customDates, end: e.target.value })}
                  className="w-full border border-slate-300 rounded-md px-3 py-2"
                />
              </div>
            </div>
          )}

          {/* Seleção de Tipo de Gráfico */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Tipo de Gráfico
            </label>
            <div className="flex gap-2">
              <Button
                variant={chartType === 'line' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setChartType('line')}
              >
                <LineChartIcon className="w-4 h-4 mr-2" />
                Linha
              </Button>
              <Button
                variant={chartType === 'bar' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setChartType('bar')}
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Barra
              </Button>
              <Button
                variant={chartType === 'composed' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setChartType('composed')}
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                Composto
              </Button>
            </div>
          </div>

          {/* Seleção de Métricas */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Métricas Exibidas
            </label>
            <div className="flex flex-wrap gap-2">
              {reportData.statistics.map(stat => (
                <Badge
                  key={stat.fieldName}
                  variant={selectedMetrics.includes(stat.fieldName) ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => toggleMetric(stat.fieldName)}
                >
                  {stat.fieldName}
                  {stat.unit && ` (${stat.unit})`}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resumo Estatístico */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Calendar className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <p className="text-3xl font-bold text-slate-900">{reportData.totalSessions}</p>
              <p className="text-sm text-slate-600">Sessões no Período</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Activity className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <p className="text-3xl font-bold text-slate-900">{reportData.statistics.length}</p>
              <p className="text-sm text-slate-600">Métricas Monitoradas</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <FileText className="w-8 h-8 text-purple-500 mx-auto mb-2" />
              <p className="text-3xl font-bold text-slate-900">{reportData.observations.length}</p>
              <p className="text-sm text-slate-600">Observações Registradas</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico Principal */}
      {selectedMetrics.length > 0 && combinedChartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Evolução das Métricas</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              {chartType === 'line' && (
                <LineChart data={combinedChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  {selectedMetrics.map((metric, idx) => (
                    <Line
                      key={metric}
                      type="monotone"
                      dataKey={metric}
                      stroke={getColorForMetric(idx)}
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      name={metric}
                    />
                  ))}
                </LineChart>
              )}
              {chartType === 'bar' && (
                <BarChart data={combinedChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  {selectedMetrics.map((metric, idx) => (
                    <Bar
                      key={metric}
                      dataKey={metric}
                      fill={getColorForMetric(idx)}
                      name={metric}
                    />
                  ))}
                </BarChart>
              )}
              {chartType === 'composed' && (
                <ComposedChart data={combinedChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  {selectedMetrics.map((metric, idx) => (
                    <React.Fragment key={metric}>
                      <Line
                        type="monotone"
                        dataKey={metric}
                        stroke={getColorForMetric(idx)}
                        strokeWidth={2}
                        name={metric}
                      />
                      <Bar
                        dataKey={metric}
                        fill={getColorForMetric(idx)}
                        fillOpacity={0.3}
                      />
                    </React.Fragment>
                  ))}
                </ComposedChart>
              )}
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Tabela de Estatísticas */}
      <Card>
        <CardHeader>
          <CardTitle>Estatísticas Detalhadas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Métrica</th>
                  <th className="text-center py-3 px-4 font-semibold text-slate-700">Média</th>
                  <th className="text-center py-3 px-4 font-semibold text-slate-700">Mín</th>
                  <th className="text-center py-3 px-4 font-semibold text-slate-700">Máx</th>
                  <th className="text-center py-3 px-4 font-semibold text-slate-700">Último</th>
                  <th className="text-center py-3 px-4 font-semibold text-slate-700">Variação</th>
                  <th className="text-center py-3 px-4 font-semibold text-slate-700">Tendência</th>
                </tr>
              </thead>
              <tbody>
                {reportData.statistics.map(stat => (
                  <tr key={stat.fieldName} className="border-b hover:bg-slate-50">
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium text-slate-900">{stat.fieldName}</p>
                        {stat.unit && (
                          <p className="text-xs text-slate-500">{stat.unit}</p>
                        )}
                      </div>
                    </td>
                    <td className="text-center py-3 px-4 text-slate-900">
                      {stat.average}
                    </td>
                    <td className="text-center py-3 px-4 text-slate-900">
                      {stat.min}
                    </td>
                    <td className="text-center py-3 px-4 text-slate-900">
                      {stat.max}
                    </td>
                    <td className="text-center py-3 px-4 font-semibold text-slate-900">
                      {stat.latest}
                    </td>
                    <td className="text-center py-3 px-4">
                      <span className={`font-semibold ${
                        stat.percentChange > 0 
                          ? 'text-green-600' 
                          : stat.percentChange < 0 
                          ? 'text-red-600' 
                          : 'text-slate-600'
                      }`}>
                        {stat.percentChange > 0 ? '+' : ''}{stat.percentChange}%
                      </span>
                    </td>
                    <td className="text-center py-3 px-4">
                      <Badge 
                        variant={
                          stat.trend === 'improving' ? 'default' :
                          stat.trend === 'declining' ? 'destructive' :
                          'secondary'
                        }
                      >
                        {stat.trend === 'improving' && 'Melhorando'}
                        {stat.trend === 'stable' && 'Estável'}
                        {stat.trend === 'declining' && 'Piorando'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EvolutionReport;

