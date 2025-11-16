import React, { useState, useMemo } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { EnrichedAppointment, Therapist } from '../../types';
import { format, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from '@/components/charts/ChartsLazyOptimized';
import {
  Calendar,
  DollarSign,
  Users,
  Clock,
  TrendingUp,
  Award
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface TherapistComparisonViewProps {
  appointments: EnrichedAppointment[];
  therapists: Therapist[];
  selectedDate: Date;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const TherapistComparisonView: React.FC<TherapistComparisonViewProps> = ({
  appointments,
  therapists,
  selectedDate
}) => {
  const [selectedTherapist, setSelectedTherapist] = useState<string | 'all'>('all');
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');

  const weekStart = startOfWeek(selectedDate, { locale: ptBR });
  const weekEnd = endOfWeek(selectedDate, { locale: ptBR });

  // Calculate stats per therapist
  const therapistStats = useMemo(() => {
    return therapists.map(therapist => {
      const therapistAppts = appointments.filter(apt => apt.therapistId === therapist.id);
      const completedAppts = therapistAppts.filter(apt => apt.status === 'completed');
      const totalRevenue = completedAppts.reduce((sum, apt) => sum + apt.value, 0);
      const avgDuration = therapistAppts.length > 0
        ? therapistAppts.reduce((sum, apt) => {
            return sum + (apt.endTime.getTime() - apt.startTime.getTime()) / 60000;
          }, 0) / therapistAppts.length
        : 0;
      
      const uniquePatients = new Set(therapistAppts.map(apt => apt.patientId)).size;
      const occupationRate = therapistAppts.length > 0
        ? (completedAppts.length / therapistAppts.length) * 100
        : 0;

      return {
        therapist,
        totalAppointments: therapistAppts.length,
        completedAppointments: completedAppts.length,
        canceledAppointments: therapistAppts.filter(apt => apt.status === 'canceled').length,
        totalRevenue,
        avgRevenue: therapistAppts.length > 0 ? totalRevenue / therapistAppts.length : 0,
        uniquePatients,
        avgDuration: Math.round(avgDuration),
        occupationRate: Math.round(occupationRate)
      };
    });
  }, [appointments, therapists]);

  // Daily distribution chart data
  const dailyDistributionData = useMemo(() => {
    const days = eachDayOfInterval({ start: weekStart, end: weekEnd });
    
    return days.map(day => {
      const dayData: any = {
        date: format(day, 'EEE', { locale: ptBR }),
        fullDate: format(day, 'dd/MM')
      };

      therapists.forEach(therapist => {
        const count = appointments.filter(apt =>
          apt.therapistId === therapist.id &&
          format(apt.startTime, 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd')
        ).length;
        dayData[therapist.name] = count;
      });

      return dayData;
    });
  }, [appointments, therapists, weekStart, weekEnd]);

  // Revenue comparison data
  const revenueComparisonData = therapistStats.map(stat => ({
    name: stat.therapist.name.split(' ')[0],
    revenue: stat.totalRevenue,
    appointments: stat.totalAppointments
  }));

  // Appointment type distribution
  const appointmentTypeData = useMemo(() => {
    const types: Record<string, number> = {};
    
    const filteredAppts = selectedTherapist === 'all'
      ? appointments
      : appointments.filter(apt => apt.therapistId === selectedTherapist);

    filteredAppts.forEach(apt => {
      types[apt.type] = (types[apt.type] || 0) + 1;
    });

    return Object.entries(types).map(([type, count]) => ({
      name: type,
      value: count
    }));
  }, [appointments, selectedTherapist]);

  const selectedTherapistData = selectedTherapist !== 'all'
    ? therapistStats.find(s => s.therapist.id === selectedTherapist)
    : null;

  return (
    <div className="space-y-6">
      {/* Therapist Selector */}
      <Card className="p-4">
        <div className="flex items-center gap-2 overflow-x-auto">
          <Button
            variant={selectedTherapist === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedTherapist('all')}
          >
            Todos
          </Button>
          {therapists.map(therapist => (
            <Button
              key={therapist.id}
              variant={selectedTherapist === therapist.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedTherapist(therapist.id)}
              className="whitespace-nowrap"
            >
              {therapist.name}
            </Button>
          ))}
        </div>
      </Card>

      {/* Stats Overview */}
      {selectedTherapist === 'all' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              <Badge variant="secondary">Total</Badge>
            </div>
            <p className="text-2xl font-bold text-slate-900">
              {therapistStats.reduce((sum, s) => sum + s.totalAppointments, 0)}
            </p>
            <p className="text-sm text-slate-600">Consultas</p>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              <Badge variant="secondary">Receita</Badge>
            </div>
            <p className="text-2xl font-bold text-green-600">
              {formatCurrencyBR(therapistStats.reduce((sum, s) => sum + s.totalRevenue, 0))}
            </p>
            <p className="text-sm text-slate-600">Faturamento</p>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-5 h-5 text-purple-600" />
              <Badge variant="secondary">Pacientes</Badge>
            </div>
            <p className="text-2xl font-bold text-purple-600">
              {therapistStats.reduce((sum, s) => sum + s.uniquePatients, 0)}
            </p>
            <p className="text-sm text-slate-600">Únicos</p>
          </Card>
        </div>
      ) : selectedTherapistData && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              <span className="text-xs text-slate-600">Consultas</span>
            </div>
            <p className="text-xl font-bold">{selectedTherapistData.totalAppointments}</p>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-green-600" />
              <span className="text-xs text-slate-600">Receita</span>
            </div>
            <p className="text-xl font-bold text-green-600">
              {formatCurrencyBR(selectedTherapistData.totalRevenue)}
            </p>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-purple-600" />
              <span className="text-xs text-slate-600">Pacientes</span>
            </div>
            <p className="text-xl font-bold">{selectedTherapistData.uniquePatients}</p>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-orange-600" />
              <span className="text-xs text-slate-600">Taxa</span>
            </div>
            <p className="text-xl font-bold">{selectedTherapistData.occupationRate}%</p>
          </Card>
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Distribution */}
        <Card className="p-6">
          <h3 className="font-semibold text-lg mb-4">Distribuição Semanal</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dailyDistributionData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              {therapists.map((therapist, index) => (
                <Bar
                  key={therapist.id}
                  dataKey={therapist.name}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Revenue Comparison */}
        <Card className="p-6">
          <h3 className="font-semibold text-lg mb-4">Comparação de Receita</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={revenueComparisonData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" />
              <Tooltip formatter={(value: any) => formatCurrencyBR(value)} />
              <Bar dataKey="revenue" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Appointment Types Distribution */}
        <Card className="p-6">
          <h3 className="font-semibold text-lg mb-4">Tipos de Consulta</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={appointmentTypeData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {appointmentTypeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        {/* Performance Ranking */}
        <Card className="p-6">
          <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-yellow-500" />
            Ranking de Performance
          </h3>
          <div className="space-y-3">
            {therapistStats
              .sort((a, b) => b.totalRevenue - a.totalRevenue)
              .map((stat, index) => (
                <div
                  key={stat.therapist.id}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-lg",
                    index === 0 && "bg-yellow-50 border border-yellow-200",
                    index === 1 && "bg-slate-50 border border-slate-200",
                    index === 2 && "bg-orange-50 border border-orange-200",
                    index > 2 && "bg-white border border-slate-100"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center font-bold",
                      index === 0 && "bg-yellow-400 text-white",
                      index === 1 && "bg-slate-400 text-white",
                      index === 2 && "bg-orange-400 text-white",
                      index > 2 && "bg-slate-200 text-slate-600"
                    )}>
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{stat.therapist.name}</p>
                      <p className="text-xs text-slate-600">
                        {stat.totalAppointments} consultas • {stat.uniquePatients} pacientes
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">
                      {formatCurrencyBR(stat.totalRevenue)}
                    </p>
                    <p className="text-xs text-slate-600">
                      {stat.occupationRate}% ocupação
                    </p>
                  </div>
                </div>
              ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default TherapistComparisonView;

