import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield, CheckCircle, XCircle, AlertTriangle, FileText, TrendingUp } from 'lucide-react';
import { qualityAssuranceServiceSupabase } from '../services/quality/qualityAssuranceServiceSupabase';
import { QualityMetric, AuditLogEntry } from '../types/qualityAssuranceTypes';
import { toast } from 'react-toastify';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';

export const QualityAssuranceDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<QualityMetric[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [complianceReport, setComplianceReport] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      const endDate = new Date();
      const startDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);

      const [qualityMetrics, logs, compliance] = await Promise.all([
        qualityAssuranceServiceSupabase.getQualityMetrics(startDate, endDate),
        qualityAssuranceServiceSupabase.getAuditLogs(startDate, endDate),
        qualityAssuranceServiceSupabase.getComplianceReport(startDate, endDate),
      ]);

      setMetrics(qualityMetrics);
      setAuditLogs(logs);
      setComplianceReport(compliance);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dashboard');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'text-green-600 bg-green-100';
      case 'good': return 'text-blue-600 bg-blue-100';
      case 'fair': return 'text-orange-600 bg-orange-100';
      case 'poor': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'excellent':
      case 'good':
        return <CheckCircle className="w-5 h-5" />;
      case 'fair':
        return <AlertTriangle className="w-5 h-5" />;
      case 'poor':
        return <XCircle className="w-5 h-5" />;
      default:
        return <Shield className="w-5 h-5" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando métricas de qualidade...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-teal-600 text-white shadow-lg">
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
              <h1 className="text-3xl font-bold mb-1">Garantia de Qualidade</h1>
              <p className="text-green-100">Métricas, compliance e auditoria</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Compliance Overview */}
        {complianceReport && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-green-600" />
              Visão Geral de Compliance
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Compliance Geral</p>
                <p className="text-3xl font-bold text-green-600">
                  {complianceReport.overallCompliance.toFixed(1)}%
                </p>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Total de Verificações</p>
                <p className="text-3xl font-bold text-blue-600">
                  {complianceReport.totalChecks}
                </p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Padrões Ativos</p>
                <p className="text-3xl font-bold text-purple-600">
                  {complianceReport.byStandard.length}
                </p>
              </div>
              <div className="p-4 bg-orange-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Período</p>
                <p className="text-sm font-bold text-orange-600">
                  90 dias
                </p>
              </div>
            </div>

            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={complianceReport.byStandard}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="standard" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="passedChecks" fill="#10b981" name="Aprovados" />
                  <Bar dataKey="failedChecks" fill="#ef4444" name="Reprovados" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Métricas de Qualidade */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            Métricas de Qualidade
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {metrics.map((metric) => (
              <div key={metric.metricId} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">{metric.metricName}</h3>
                    <p className="text-xs text-gray-600">{metric.category}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(metric.status)}`}>
                    {getStatusIcon(metric.status)}
                    {metric.status}
                  </span>
                </div>

                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-3xl font-bold text-gray-900">
                      {metric.currentValue.toFixed(1)}
                      <span className="text-sm text-gray-600 ml-1">{metric.unit}</span>
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      Meta: {metric.targetValue} {metric.unit}
                    </p>
                  </div>
                  
                  <div className="text-right">
                    <p className={`text-sm font-medium ${
                      metric.currentValue >= metric.targetValue ? 'text-green-600' : 'text-orange-600'
                    }`}>
                      {metric.currentValue >= metric.targetValue ? '✓ Meta atingida' : '⚠ Abaixo da meta'}
                    </p>
                  </div>
                </div>

                <div className="mt-3 bg-gray-100 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      metric.currentValue >= metric.targetValue ? 'bg-green-600' : 'bg-orange-500'
                    }`}
                    data-width={Math.min(100, (metric.currentValue / metric.targetValue) * 100)}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Audit Logs */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-gray-600" />
            Registros de Auditoria Recentes
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b text-left text-sm text-gray-600">
                  <th className="pb-3 font-medium">Data/Hora</th>
                  <th className="pb-3 font-medium">Ação</th>
                  <th className="pb-3 font-medium">Usuário</th>
                  <th className="pb-3 font-medium">Tipo</th>
                  <th className="pb-3 font-medium">Resultado</th>
                </tr>
              </thead>
              <tbody>
                {auditLogs.slice(0, 10).map((log) => (
                  <tr key={log.entryId} className="border-b last:border-0">
                    <td className="py-3 text-sm text-gray-900">
                      {new Date(log.timestamp).toLocaleString('pt-BR')}
                    </td>
                    <td className="py-3 text-sm font-medium text-gray-900">
                      {log.action}
                    </td>
                    <td className="py-3 text-sm text-gray-900">{log.userName}</td>
                    <td className="py-3 text-sm text-gray-600">{log.entityType}</td>
                    <td className="py-3">
                      <span className={`text-xs px-2 py-1 rounded ${
                        log.result === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {log.result}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QualityAssuranceDashboardPage;

