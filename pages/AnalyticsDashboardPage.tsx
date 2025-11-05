import React, { useMemo } from 'react';
import { useAppointments } from '../hooks/useAppointments';
import { useData } from '../contexts/AppContext';
import { Card } from '../components/ui/card';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from '@/components/charts/ChartsLazyOptimized';
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

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 p-6">
        <div className="container mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/agenda')}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Voltar
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Dashboard de Analytics</h1>
                <p className="text-sm text-slate-600">
                  Análises detalhadas do mês de {format(new Date(), 'MMMM yyyy', { locale: ptBR })}
                </p>
              </div>
            </div>
            <Button className="gap-2">
              <Download className="w-4 h-4" />
              Exportar Relatório
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto p-6 space-y-6">
        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-50">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="text-xs text-slate-600">Total</div>
                <div className="text-2xl font-bold">{metrics.total}</div>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-50">
                <Award className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <div className="text-xs text-slate-600">Concluídos</div>
                <div className="text-2xl font-bold text-green-600">{metrics.completed}</div>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-50">
                <DollarSign className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <div className="text-xs text-slate-600">Receita</div>
                <div className="text-xl font-bold text-emerald-600">
                  {formatCurrencyBR(metrics.revenue)}
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-50">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <div className="text-xs text-slate-600">Pacientes</div>
                <div className="text-2xl font-bold text-purple-600">{metrics.uniquePatients}</div>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-50">
                <TrendingUp className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <div className="text-xs text-slate-600">Ticket Médio</div>
                <div className="text-xl font-bold text-orange-600">
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

          <TabsContent value="trend" className="space-y-4">
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Últimos 30 Dias</h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={chartData.last30Days}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="consultas"
                    stroke="#3b82f6"
                    fill="#3b82f6"
                    fillOpacity={0.3}
                    name="Consultas"
                  />
                  <Area
                    yAxisId="right"
                    type="monotone"
                    dataKey="receita"
                    stroke="#10b981"
                    fill="#10b981"
                    fillOpacity={0.3}
                    name="Receita (R$)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Card>
          </TabsContent>

          <TabsContent value="types">
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Distribuição por Tipo</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={chartData.typeData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {chartData.typeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </TabsContent>

          <TabsContent value="therapists">
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Performance por Terapeuta</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData.byTherapist}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="consultas" fill="#3b82f6" name="Consultas" />
                  <Bar yAxisId="right" dataKey="receita" fill="#10b981" name="Receita (R$)" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AnalyticsDashboardPage;

