'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Badge } from '~/components/ui/badge';
import { Users, Calendar, DollarSign, TrendingUp, AlertCircle } from 'lucide-react';
import { formatCurrency } from '~/lib/utils';
import { getExecutiveKPIs } from '~/lib/actions/reports';

interface KPIs {
  active_patients: number;
  appointment_occupancy: number;
  monthly_revenue: number;
  no_show_rate: number;
  nps_score: number;
  active_treatments: number;
  completed_sessions_today: number;
}

export function ExecutiveDashboard() {
  const [kpis, setKpis] = useState<KPIs | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadKPIs();
  }, []);

  const loadKPIs = async () => {
    setLoading(true);
    try {
      const result = await getExecutiveKPIs();
      if (result.data) {
        // Ajustar monthly_revenue se vier como objeto
        const kpisData = result.data as any;
        const adjustedKpis: KPIs = {
          ...kpisData,
          monthly_revenue: typeof kpisData.monthly_revenue === 'object' 
            ? (kpisData.monthly_revenue?.amount || 0)
            : (kpisData.monthly_revenue || 0),
        };
        setKpis(adjustedKpis);
      }
    } catch (error) {
      console.error('Erro ao carregar KPIs:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Carregando...</div>;
  }

  if (!kpis) {
    return <div className="text-center py-8">Erro ao carregar dados</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pacientes Ativos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis.active_patients}</div>
            <p className="text-xs text-muted-foreground">
              Em tratamento
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ocupação da Agenda</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis.appointment_occupancy}%</div>
            <p className="text-xs text-muted-foreground">
              Taxa de ocupação
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Mensal</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(kpis.monthly_revenue)}</div>
            <p className="text-xs text-muted-foreground">
              Últimos 30 dias
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de No-Show</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis.no_show_rate}%</div>
            <p className="text-xs text-muted-foreground">
              Faltas sem aviso
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">NPS Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{kpis.nps_score}</div>
            <Badge variant={kpis.nps_score >= 50 ? 'default' : kpis.nps_score >= 0 ? 'secondary' : 'destructive'}>
              {kpis.nps_score >= 50 ? 'Excelente' : kpis.nps_score >= 0 ? 'Bom' : 'Precisa Melhorar'}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Tratamentos Ativos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{kpis.active_treatments}</div>
            <p className="text-xs text-muted-foreground">
              Em andamento
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Sessões Hoje</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{kpis.completed_sessions_today}</div>
            <p className="text-xs text-muted-foreground">
              Concluídas
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

