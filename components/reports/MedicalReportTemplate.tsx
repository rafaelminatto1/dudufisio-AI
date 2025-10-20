/**
 * MedicalReportTemplate - Template profissional de relatório médico
 * Gera relatórios em formato profissional para envio a médicos
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { Download, FileText, Calendar, User, Activity } from 'lucide-react';
import { Patient } from '../../types';
import format from 'date-fns/format';
import { ptBR } from 'date-fns/locale';

export interface MedicalReportData {
  patient: Patient;
  period: {
    start: Date;
    end: Date;
  };
  summary: {
    totalSessions: number;
    painReduction?: number;     // %
    functionalGain?: number;    // %
    compliance: number;        // %
  };
  keyMetrics: Array<{
    name: string;
    initial: number;
    current: number;
    change: number;
    unit: string;
    status: 'improved' | 'stable' | 'declined';
  }>;
  charts?: Array<{
    title: string;
    type: string;
  }>;
  clinicalNotes: string;
  recommendations: string;
  format?: 'professional' | 'detailed' | 'summary';
  includeCharts?: boolean;
  includeComparisons?: boolean;
  language?: 'pt-BR' | 'en-US';
}

interface MedicalReportTemplateProps {
  data: MedicalReportData;
  onExport?: (format: 'pdf' | 'docx') => void;
}

export const MedicalReportTemplate: React.FC<MedicalReportTemplateProps> = ({
  data,
  onExport
}) => {
  const {
    patient,
    period,
    summary,
    keyMetrics,
    charts,
    clinicalNotes,
    recommendations,
    format = 'professional',
    includeCharts = true,
    includeComparisons = true,
    language = 'pt-BR'
  } = data;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'improved': return 'bg-green-100 text-green-700 border-green-200';
      case 'declined': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'improved': return 'Melhorou';
      case 'declined': return 'Piorou';
      default: return 'Estável';
    }
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <Card>
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold text-slate-900 mb-2">
                Relatório de Evolução - Fisioterapia
              </CardTitle>
              <div className="flex items-center gap-4 text-sm text-slate-600">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {format(period.start, 'dd/MM/yyyy', { locale: ptBR })} - {format(period.end, 'dd/MM/yyyy', { locale: ptBR })}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Activity className="w-4 h-4" />
                  <span>{summary.totalSessions} sessões</span>
                </div>
              </div>
            </div>
            {onExport && (
              <div className="flex gap-2">
                <Button onClick={() => onExport('pdf')} variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  PDF
                </Button>
                <Button onClick={() => onExport('docx')} variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Word
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {/* Dados do Paciente */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div>
              <div className="text-xs text-slate-600 mb-1">Paciente</div>
              <div className="font-medium text-slate-900">{patient.name}</div>
            </div>
            <div>
              <div className="text-xs text-slate-600 mb-1">Idade</div>
              <div className="font-medium text-slate-900">
                {patient.age || 'N/A'} anos
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-600 mb-1">Diagnóstico Principal</div>
              <div className="font-medium text-slate-900">
                {patient.main_diagnosis || patient.main_pathology || 'N/A'}
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-600 mb-1">Médico Solicitante</div>
              <div className="font-medium text-slate-900">
                {patient.referring_doctor || 'N/A'}
              </div>
            </div>
          </div>

          <Separator className="my-6" />

          {/* Resumo Executivo */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              Resumo Executivo
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="text-xs text-slate-600 mb-1">Taxa de Conformidade</div>
                <div className="text-3xl font-bold text-green-600">{summary.compliance}%</div>
                <div className="text-xs text-slate-500 mt-1">
                  {summary.totalSessions} sessões realizadas
                </div>
              </div>
              {summary.painReduction !== undefined && (
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="text-xs text-slate-600 mb-1">Redução de Dor</div>
                  <div className="text-3xl font-bold text-blue-600">{summary.painReduction}%</div>
                  <div className="text-xs text-slate-500 mt-1">
                    Melhora significativa
                  </div>
                </div>
              )}
              {summary.functionalGain !== undefined && (
                <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <div className="text-xs text-slate-600 mb-1">Ganho Funcional</div>
                  <div className="text-3xl font-bold text-purple-600">{summary.functionalGain}%</div>
                  <div className="text-xs text-slate-500 mt-1">
                    Melhora na função
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Evolução Clínica - Tabela */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              Evolução Clínica - Métricas Principais
            </h3>
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">
                      Métrica
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-slate-700 uppercase">
                      Inicial
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-slate-700 uppercase">
                      Atual
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-slate-700 uppercase">
                      Variação
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-slate-700 uppercase">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {keyMetrics.map((metric, index) => (
                    <tr key={index} className="hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-900">{metric.name}</div>
                        <div className="text-xs text-slate-500">{metric.unit}</div>
                      </td>
                      <td className="px-4 py-3 text-center text-sm text-slate-600">
                        {metric.initial}
                      </td>
                      <td className="px-4 py-3 text-center text-sm text-slate-900 font-medium">
                        {metric.current}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`text-sm font-medium ${
                          metric.change > 0 ? 'text-green-600' : 
                          metric.change < 0 ? 'text-red-600' : 'text-slate-600'
                        }`}>
                          {metric.change > 0 ? '+' : ''}{metric.change.toFixed(1)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Badge className={getStatusColor(metric.status)}>
                          {getStatusLabel(metric.status)}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Gráficos */}
          {includeCharts && charts && charts.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">
                Gráficos de Evolução
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {charts.map((chart, index) => (
                  <div
                    key={index}
                    className="p-4 border rounded-lg bg-slate-50"
                  >
                    <div className="text-sm font-medium text-slate-900 mb-2">
                      {chart.title}
                    </div>
                    <div className="text-xs text-slate-500">
                      Tipo: {chart.type}
                    </div>
                    <div className="mt-2 text-xs text-slate-400 italic">
                      [Gráfico será renderizado aqui]
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Observações Clínicas */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              Observações Clínicas
            </h3>
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
              <p className="text-sm text-slate-700 whitespace-pre-wrap">
                {clinicalNotes}
              </p>
            </div>
          </div>

          {/* Recomendações */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              Recomendações
            </h3>
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-slate-700 whitespace-pre-wrap">
                {recommendations}
              </p>
            </div>
          </div>

          {/* Rodapé */}
          <Separator className="my-6" />
          <div className="text-xs text-slate-500 text-center">
            <p>Relatório gerado em {format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</p>
            <p className="mt-1">
              Este relatório foi gerado automaticamente pelo sistema DuduFisio-AI
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MedicalReportTemplate;

