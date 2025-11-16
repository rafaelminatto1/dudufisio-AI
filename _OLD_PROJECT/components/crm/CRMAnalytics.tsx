/**
 * 📊 CRM Analytics - Analytics Dashboard for Lead Performance
 */

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import {
  Users,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  XCircle,
  Phone,
  Mail,
  MessageSquare,
  Target,
  DollarSign
} from 'lucide-react';
import { leadService } from '../../services/crm/leadService';
import { whatsappCrmService } from '../../services/crm/whatsappCrmService';

export default function CRMAnalytics() {
  const [stats, setStats] = useState<any>(null);
  const [conversionMetrics, setConversionMetrics] = useState<any>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);

      // Get conversion stats
      const convStats = await whatsappCrmService.getConversionStats(30);
      setStats(convStats);

      // Get conversion metrics by source
      const metrics = await leadService.getConversionMetrics();
      setConversionMetrics(metrics);
    } catch (error) {
      console.error('Erro ao carregar analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-gray-500">Carregando analytics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total de Leads</CardDescription>
            <CardTitle className="text-3xl">{stats?.total_leads || 0}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Users className="w-4 h-4" />
              <span>Últimos 30 dias</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Leads Convertidos</CardDescription>
            <CardTitle className="text-3xl">{stats?.converted_leads || 0}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm text-green-600">
              <CheckCircle className="w-4 h-4" />
              <span>Sucesso!</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Taxa de Conversão</CardDescription>
            <CardTitle className="text-3xl">{stats?.conversion_rate.toFixed(1)}%</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm text-blue-600">
              {stats?.conversion_rate >= 15 ? (
                <>
                  <TrendingUp className="w-4 h-4" />
                  <span>Acima da média</span>
                </>
              ) : (
                <>
                  <TrendingDown className="w-4 h-4" />
                  <span>Abaixo da média</span>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Tempo Médio</CardDescription>
            <CardTitle className="text-3xl">{stats?.avg_days_to_convert.toFixed(1)}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="w-4 h-4" />
              <span>dias para converter</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Conversion by Source */}
      <Card>
        <CardHeader>
          <CardTitle>Leads por Fonte</CardTitle>
          <CardDescription>Distribuição de leads por canal de aquisição</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(stats?.leads_by_source || {})
              .sort(([, a], [, b]) => (b as number) - (a as number))
              .map(([source, count]) => {
                const percentage = stats?.total_leads > 0
                  ? ((count as number / stats.total_leads) * 100).toFixed(1)
                  : 0;

                return (
                  <div key={source} className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-2 h-2 rounded-full bg-blue-500" />
                      <span className="font-medium capitalize">{source}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-48 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-600 w-12 text-right">
                        {count as number}
                      </span>
                      <Badge variant="outline" className="w-14 justify-center">
                        {percentage}%
                      </Badge>
                    </div>
                  </div>
                );
              })}
          </div>
        </CardContent>
      </Card>

      {/* Conversion Metrics by Source */}
      {conversionMetrics.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Métricas de Conversão por Fonte</CardTitle>
            <CardDescription>Performance detalhada de cada canal</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Fonte</th>
                    <th className="text-right py-3 px-4">Total Leads</th>
                    <th className="text-right py-3 px-4">Convertidos</th>
                    <th className="text-right py-3 px-4">Taxa</th>
                    <th className="text-right py-3 px-4">Tempo Médio</th>
                  </tr>
                </thead>
                <tbody>
                  {conversionMetrics.map((metric: any) => (
                    <tr key={metric.source} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <span className="font-medium capitalize">{metric.source}</span>
                      </td>
                      <td className="text-right py-3 px-4">{metric.total_leads}</td>
                      <td className="text-right py-3 px-4 text-green-600 font-semibold">
                        {metric.converted_leads}
                      </td>
                      <td className="text-right py-3 px-4">
                        <Badge
                          variant="outline"
                          className={
                            metric.conversion_rate >= 20
                              ? 'bg-green-50 text-green-700 border-green-300'
                              : metric.conversion_rate >= 10
                              ? 'bg-yellow-50 text-yellow-700 border-yellow-300'
                              : 'bg-red-50 text-red-700 border-red-300'
                          }
                        >
                          {metric.conversion_rate.toFixed(1)}%
                        </Badge>
                      </td>
                      <td className="text-right py-3 px-4 text-gray-600">
                        {metric.avg_days_to_convert.toFixed(1)} dias
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Channel Performance */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="w-5 h-5 text-blue-600" />
              Telefone
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Contatos</span>
                <span className="font-semibold">
                  {stats?.leads_by_source?.phone || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Taxa</span>
                <Badge variant="outline">15%</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-green-600" />
              WhatsApp
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Contatos</span>
                <span className="font-semibold">
                  {stats?.leads_by_source?.whatsapp || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Taxa</span>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
                  22%
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-purple-600" />
              Website
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Contatos</span>
                <span className="font-semibold">
                  {stats?.leads_by_source?.website || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Taxa</span>
                <Badge variant="outline">18%</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Insights & Recommendations */}
      <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-600" />
            Insights & Recomendações
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {stats?.conversion_rate < 15 && (
            <div className="flex items-start gap-3 bg-white p-3 rounded-lg">
              <TrendingUp className="w-5 h-5 text-orange-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-gray-900">
                  Taxa de conversão abaixo da média
                </h4>
                <p className="text-sm text-gray-600">
                  Considere melhorar o follow-up e qualificação dos leads. Meta: 18-22%
                </p>
              </div>
            </div>
          )}

          {stats?.avg_days_to_convert > 10 && (
            <div className="flex items-start gap-3 bg-white p-3 rounded-lg">
              <Clock className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-gray-900">
                  Ciclo de conversão longo
                </h4>
                <p className="text-sm text-gray-600">
                  Leads levam {stats.avg_days_to_convert.toFixed(0)} dias para converter. Considere automações de follow-up.
                </p>
              </div>
            </div>
          )}

          <div className="flex items-start gap-3 bg-white p-3 rounded-lg">
            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
            <div>
              <h4 className="font-semibold text-gray-900">
                WhatsApp como melhor canal
              </h4>
              <p className="text-sm text-gray-600">
                WhatsApp tem a melhor taxa de conversão. Foque investimentos neste canal.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
