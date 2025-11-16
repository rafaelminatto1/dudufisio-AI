import React, { useMemo } from 'react';
import { useAppointments } from '../hooks/useAppointments';
import { useData } from '../contexts/AppContext';
import { Card } from '../components/ui/card';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import {
  Calendar,
  TrendingUp,
  DollarSign,
  Users,
  Clock,
  Award,
  ArrowLeft,
  Download
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { useNavigate } from 'react-router-dom';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { formatCurrencyBR } from '../lib/format';
import {
  NivoLineChart,
  NivoBarChart,
  NivoPieChart,
  TooltipCard,
} from '../components/charts/nivo';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const AnalyticsDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { appointments } = useAppointments(
    startOfMonth(new Date()),
    endOfMonth(new Date())
  );
  const { therapists } = useData();

  // Métricas gerais
  const metrics = useMemo(() => {
    const total = appointments.length;
    const completed = appointments.filter(a => a.status === 'completed').length;
    const revenue = appointments.reduce((sum, a) => sum + (a.value || 0), 0);
    const paid = appointments
      .filter(a => a.paymentStatus === 'paid')
      .reduce((sum, a) => sum + (a.value || 0), 0);
    const uniquePatients = new Set(appointments.map(a => a.patientId)).size;

    return { total, completed, revenue, paid, uniquePatients };
  }, [appointments]);

  // Dados para gráficos
  const chartData = useMemo(() => {
    // Últimos 30 dias
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = subDays(new Date(), 29 - i);
      const dayAppts = appointments.filter(a =>
        format(a.startTime, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
      );
      
      return {
        date: format(date, 'dd/MM'),
        consultas: dayAppts.length,
        receita: dayAppts.reduce((sum, a) => sum + (a.value || 0), 0)
      };
    });

    // Por tipo
    const byType = appointments.reduce((acc, apt) => {
      const type = apt.type || 'Outros';
      if (!acc[type]) acc[type] = 0;
      acc[type]++;
      return acc;
    }, {} as Record<string, number>);

    const typeData = Object.entries(byType).map(([name, value]) => ({
      name,
      value
    }));

    // Por terapeuta
    const byTherapist = therapists.map(t => ({
      name: t.name.split(' ')[0],
      consultas: appointments.filter(a => a.therapistId === t.id).length,
      receita: appointments
        .filter(a => a.therapistId === t.id)
        .reduce((sum, a) => sum + (a.value || 0), 0)
    }));

    return { last30Days, typeData, byTherapist };
  }, [appointments, therapists]);

  const trendScale = useMemo(() => {
    const maxConsultas = Math.max(...chartData.last30Days.map((d) => d.consultas), 0);
    const maxReceita = Math.max(...chartData.last30Days.map((d) => d.receita), 0);
    if (maxReceita === 0 || maxConsultas === 0) {
      return 1;
    }
    const scale = maxReceita / maxConsultas;
    return scale === 0 ? 1 : scale;
  }, [chartData.last30Days]);

  type TrendDatum = {
    x: string;
    y: number;
    raw: {
      consultas: number;
      receita: number;
    };
    serie: 'consultas' | 'receita';
  };

  const trendSeries = useMemo(() => {
    return [
      {
        id: 'Consultas',
        color: '#3b82f6',
        data: chartData.last30Days.map<TrendDatum>((point) => ({
          x: point.date,
          y: point.consultas,
          raw: { consultas: point.consultas, receita: point.receita },
          serie: 'consultas',
        })),
      },
      {
        id: 'Receita (R$)',
        color: '#10b981',
        data: chartData.last30Days.map<TrendDatum>((point) => ({
          x: point.date,
          y: trendScale ? point.receita / trendScale : 0,
          raw: { consultas: point.consultas, receita: point.receita },
          serie: 'receita',
        })),
      },
    ];
  }, [chartData.last30Days, trendScale]);

  const pieChartData = useMemo(
    () =>
      chartData.typeData.map((entry, index) => ({
        id: entry.name,
        label: entry.name,
        value: entry.value,
        color: COLORS[index % COLORS.length],
      })),
    [chartData.typeData]
  );

  const therapistScale = useMemo(() => {
    const maxConsultas = Math.max(...chartData.byTherapist.map((d) => d.consultas), 0);
    const maxReceita = Math.max(...chartData.byTherapist.map((d) => d.receita), 0);
    if (maxReceita === 0 || maxConsultas === 0) {
      return 1;
    }
    const scale = maxReceita / maxConsultas;
    return scale === 0 ? 1 : scale;
  }, [chartData.byTherapist]);

  const therapistChartData = useMemo(
    () =>
      chartData.byTherapist.map((item) => ({
        name: item.name,
        consultas: item.consultas,
        receita: therapistScale ? item.receita / therapistScale : 0,
        receitaReal: item.receita,
      })),
    [chartData.byTherapist, therapistScale]
  );

  return (
    <div className="min-h-screen bg-neutral-bgAlt">
      {/* Header */}
      <div className="bg-white border-b border-neutral-border p-lg">
        <div className="container mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-md">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/agenda')}
                className="gap-sm"
              >
                <ArrowLeft className="w-4 h-4" />
                Voltar
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-neutral-text">Dashboard de Analytics</h1>
                <p className="text-sm text-neutral-textSecondary">
                  Análises detalhadas do mês de {format(new Date(), 'MMMM yyyy', { locale: ptBR })}
                </p>
              </div>
            </div>
            <Button className="gap-sm">
              <Download className="w-4 h-4" />
              Exportar Relatório
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto p-lg space-y-xl">
        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-md">
          <Card className="p-md">
            <div className="flex items-center gap-md">
              <div className="p-sm rounded-lg bg-primary-light">
                <Calendar className="w-5 h-5 text-primary" />
              </div>
              <div>
                <div className="text-xs text-neutral-textSecondary">Total</div>
                <div className="text-2xl font-bold">{metrics.total}</div>
              </div>
            </div>
          </Card>

          <Card className="p-md">
            <div className="flex items-center gap-md">
              <div className="p-sm rounded-lg bg-success-light">
                <Award className="w-5 h-5 text-success" />
              </div>
              <div>
                <div className="text-xs text-neutral-textSecondary">Concluídos</div>
                <div className="text-2xl font-bold text-success">{metrics.completed}</div>
              </div>
            </div>
          </Card>

          <Card className="p-md">
            <div className="flex items-center gap-md">
              <div className="p-sm rounded-lg bg-emerald-50">
                <DollarSign className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <div className="text-xs text-neutral-textSecondary">Receita</div>
                <div className="text-xl font-bold text-emerald-600">
                  {formatCurrencyBR(metrics.revenue)}
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-md">
            <div className="flex items-center gap-md">
              <div className="p-sm rounded-lg bg-purple-50">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <div className="text-xs text-neutral-textSecondary">Pacientes</div>
                <div className="text-2xl font-bold text-purple-600">{metrics.uniquePatients}</div>
              </div>
            </div>
          </Card>

          <Card className="p-md">
            <div className="flex items-center gap-md">
              <div className="p-sm rounded-lg bg-warning-light">
                <TrendingUp className="w-5 h-5 text-warning" />
              </div>
              <div>
                <div className="text-xs text-neutral-textSecondary">Ticket Médio</div>
                <div className="text-xl font-bold text-warning">
                  {formatCurrencyBR(metrics.revenue / metrics.total || 0)}
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Charts */}
        <Tabs defaultValue="trend" className="w-full">
          <TabsList>
            <TabsTrigger value="trend">Tendência</TabsTrigger>
            <TabsTrigger value="types">Por Tipo</TabsTrigger>
            <TabsTrigger value="therapists">Por Terapeuta</TabsTrigger>
          </TabsList>

          <TabsContent value="trend" className="space-y-md">
            <Card className="p-lg">
              <h3 className="font-semibold mb-md">Últimos 30 Dias</h3>
              <NivoLineChart<TrendDatum>
                height={300}
                data={trendSeries}
                curve="monotoneX"
                margin={{ top: 24, right: 60, bottom: 48, left: 60 }}
                xScale={{ type: 'point' }}
                yScale={{ type: 'linear', min: 0, stacked: false }}
                axisBottom={{
                  tickPadding: 10,
                  tickRotation: -30,
                }}
                axisLeft={{
                  tickPadding: 8,
                  legend: 'Consultas',
                  legendOffset: -48,
                  legendPosition: 'middle',
                }}
                axisRight={{
                  tickPadding: 8,
                  legend: 'Receita (R$)',
                  legendPosition: 'middle',
                  legendOffset: 48,
                  format: (value) => formatCurrencyBR(Number(value) * trendScale),
                }}
                colors={['#3b82f6', '#10b981']}
                enableArea
                areaOpacity={0.2}
                pointSize={8}
                pointColor={{ from: 'color' }}
                pointBorderWidth={2}
                pointBorderColor={{ from: 'serieColor' }}
                legends={[
                  {
                    anchor: 'bottom',
                    direction: 'row',
                    translateY: 36,
                    itemWidth: 160,
                    itemHeight: 16,
                    itemsSpacing: 16,
                    symbolSize: 14,
                    symbolShape: 'circle',
                  },
                ]}
                sliceTooltip={({ slice }) => (
                  <TooltipCard
                    title={slice.points[0]?.data.xFormatted}
                    rows={slice.points.map((point) => {
                      const datum = point.data as TrendDatum;
                      const isConsultas = datum.serie === 'consultas';
                      return {
                        id: point.id,
                        label: isConsultas ? 'Consultas' : 'Receita',
                        value: isConsultas
                          ? datum.raw.consultas
                          : formatCurrencyBR(datum.raw.receita),
                        color: point.serieColor,
                      };
                    })}
                  />
                )}
              />
            </Card>
          </TabsContent>

          <TabsContent value="types">
            <Card className="p-lg">
              <h3 className="font-semibold mb-md">Distribuição por Tipo</h3>
              <NivoPieChart
                height={300}
                data={pieChartData}
                colors={{ datum: 'data.color' }}
                enableArcLinkLabels={false}
                arcLabelsRadiusOffset={0.6}
                arcLinkLabelsSkipAngle={12}
                arcLabel={(datum) => `${datum.value}`}
                tooltip={({ datum }) => (
                  <TooltipCard
                    title={datum.label}
                    rows={[
                      {
                        id: String(datum.id),
                        label: 'Quantidade',
                        value: datum.value,
                        color: datum.color as string,
                      },
                    ]}
                  />
                )}
              />
            </Card>
          </TabsContent>

          <TabsContent value="therapists">
            <Card className="p-lg">
              <h3 className="font-semibold mb-md">Performance por Terapeuta</h3>
              <NivoBarChart
                height={300}
                data={therapistChartData}
                keys={['consultas', 'receita']}
                indexBy="name"
                groupMode="grouped"
                padding={0.4}
                colors={({ id }) => (id === 'consultas' ? '#3b82f6' : '#10b981')}
                axisBottom={{
                  tickPadding: 10,
                }}
                axisLeft={{
                  tickPadding: 8,
                  legend: 'Consultas',
                  legendOffset: -48,
                  legendPosition: 'middle',
                }}
                axisRight={{
                  tickPadding: 8,
                  legend: 'Receita (R$)',
                  legendPosition: 'middle',
                  legendOffset: 48,
                  format: (value) => formatCurrencyBR(Number(value) * therapistScale),
                }}
                legends={[
                  {
                    dataFrom: 'keys',
                    anchor: 'bottom',
                    direction: 'row',
                    translateY: 36,
                    itemWidth: 140,
                    itemHeight: 16,
                    itemsSpacing: 16,
                    symbolSize: 14,
                    symbolShape: 'circle',
                  },
                ]}
                tooltip={({ indexValue, data }) => {
                  const datum = data as (typeof therapistChartData)[number];
                  return (
                    <TooltipCard
                      title={indexValue}
                      rows={[
                        {
                          id: 'consultas',
                          label: 'Consultas',
                          value: datum.consultas,
                          color: '#3b82f6',
                        },
                        {
                          id: 'receita',
                          label: 'Receita',
                          value: formatCurrencyBR(datum.receitaReal),
                          color: '#10b981',
                        },
                      ]}
                    />
                  );
                }}
              />
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AnalyticsDashboardPage;

