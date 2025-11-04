import React from 'react';
import { Calendar, Clock, DollarSign, Users, TrendingUp, AlertCircle } from 'lucide-react';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Appointment, Therapist, AppointmentStatus } from '../../types';
import { cn } from '../../lib/utils';
import { formatCurrencyBR } from '../../lib/format';
import { motion } from 'framer-motion';

interface AgendaStatsProps {
  appointments: Appointment[];
  therapists: Therapist[];
  className?: string;
}

interface StatCard {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color: string;
}

const AgendaStats: React.FC<AgendaStatsProps> = ({ appointments, therapists, className }) => {
  // Calcular métricas
  const totalAppointments = appointments.length;
  const completedAppointments = appointments.filter(a => a.status === AppointmentStatus.Completed).length;
  const pendingAppointments = appointments.filter(a => a.status === AppointmentStatus.Scheduled).length;
  const cancelledAppointments = appointments.filter(a => a.status === AppointmentStatus.Canceled).length;
  const noShowAppointments = appointments.filter(a => a.status === AppointmentStatus.NoShow).length;

  // Calcular valor total
  const totalValue = appointments.reduce((sum, app) => sum + (app.value || 0), 0);
  const paidValue = appointments
    .filter(a => a.paymentStatus === 'paid')
    .reduce((sum, app) => sum + (app.value || 0), 0);

  // Calcular taxa de ocupação (considerando horário de trabalho 8h-18h)
  const workingHours = 10; // 8h às 18h
  const totalSlots = therapists.length * workingHours; // Slots de 1 hora
  const occupationRate = totalSlots > 0 ? (totalAppointments / totalSlots) * 100 : 0;

  // Calcular taxa de no-show
  const noShowRate = totalAppointments > 0 ? (noShowAppointments / totalAppointments) * 100 : 0;

  // Pacientes únicos
  const uniquePatients = new Set(appointments.map(a => a.patientId)).size;

  // Agendamentos por tipo
  const appointmentsByType = appointments.reduce((acc, app) => {
    const type = app.type || 'Não definido';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const stats: StatCard[] = [
    {
      label: 'Total de Agendamentos',
      value: totalAppointments,
      icon: <Calendar className="w-5 h-5" />,
      color: 'text-blue-600 bg-blue-50'
    },
    {
      label: 'Taxa de Ocupação',
      value: `${occupationRate.toFixed(1)}%`,
      icon: <TrendingUp className="w-5 h-5" />,
      color: 'text-green-600 bg-green-50',
      trend: {
        value: occupationRate,
        isPositive: occupationRate > 70
      }
    },
    {
      label: 'Valor Total',
      value: formatCurrencyBR(totalValue),
      icon: <DollarSign className="w-5 h-5" />,
      color: 'text-emerald-600 bg-emerald-50'
    },
    {
      label: 'Pacientes Únicos',
      value: uniquePatients,
      icon: <Users className="w-5 h-5" />,
      color: 'text-purple-600 bg-purple-50'
    }
  ];

  return (
    <div className={cn("space-y-4", className)}>
      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="p-4 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm text-slate-600 mb-1">{stat.label}</p>
                  <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                  {stat.trend && (
                    <div className="flex items-center gap-1 mt-2">
                      <TrendingUp 
                        className={cn(
                          "w-3 h-3",
                          stat.trend.isPositive ? "text-green-600" : "text-red-600"
                        )}
                      />
                      <span className={cn(
                        "text-xs font-medium",
                        stat.trend.isPositive ? "text-green-600" : "text-red-600"
                      )}>
                        {stat.trend.isPositive ? 'Bom' : 'Atenção'}
                      </span>
                    </div>
                  )}
                </div>
                <div className={cn("p-2 rounded-lg", stat.color)}>
                  {stat.icon}
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="p-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600">Concluídos</span>
            <Badge className="bg-green-100 text-green-700 border-green-200">
              {completedAppointments}
            </Badge>
          </div>
        </Card>

        <Card className="p-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600">Agendados</span>
            <Badge className="bg-blue-100 text-blue-700 border-blue-200">
              {pendingAppointments}
            </Badge>
          </div>
        </Card>

        <Card className="p-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600">Cancelados</span>
            <Badge className="bg-red-100 text-red-700 border-red-200">
              {cancelledAppointments}
            </Badge>
          </div>
        </Card>

        <Card className="p-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600">Faltas</span>
            <Badge className={cn(
              "border",
              noShowRate > 10 
                ? "bg-red-100 text-red-700 border-red-200" 
                : "bg-orange-100 text-orange-700 border-orange-200"
            )}>
              {noShowAppointments} ({noShowRate.toFixed(1)}%)
            </Badge>
          </div>
        </Card>
      </div>

      {/* Payment Status */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <DollarSign className="w-4 h-4 text-slate-600" />
          <h3 className="font-semibold text-slate-900">Status de Pagamento</h3>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-green-50 rounded-lg">
            <div className="text-xs text-green-600 mb-1">Pago</div>
            <div className="text-lg font-bold text-green-700">
              {formatCurrencyBR(paidValue)}
            </div>
          </div>
          <div className="p-3 bg-orange-50 rounded-lg">
            <div className="text-xs text-orange-600 mb-1">Pendente</div>
            <div className="text-lg font-bold text-orange-700">
              {formatCurrencyBR(totalValue - paidValue)}
            </div>
          </div>
        </div>
      </Card>

      {/* Appointments by Type */}
      {Object.keys(appointmentsByType).length > 0 && (
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-4 h-4 text-slate-600" />
            <h3 className="font-semibold text-slate-900">Agendamentos por Tipo</h3>
          </div>
          <div className="space-y-2">
            {Object.entries(appointmentsByType).map(([type, count]) => (
              <div key={type} className="flex items-center justify-between">
                <span className="text-sm text-slate-700">{type}</span>
                <Badge variant="secondary">{count}</Badge>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Alerts */}
      {noShowRate > 10 && (
        <Card className="p-4 bg-red-50 border-red-200">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-red-900 mb-1">Taxa de Faltas Alta</div>
              <p className="text-sm text-red-700">
                A taxa de no-show está em {noShowRate.toFixed(1)}%. Considere implementar lembretes ou confirmação de presença.
              </p>
            </div>
          </div>
        </Card>
      )}

      {occupationRate < 50 && (
        <Card className="p-4 bg-yellow-50 border-yellow-200">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-yellow-900 mb-1">Ocupação Baixa</div>
              <p className="text-sm text-yellow-700">
                A taxa de ocupação está em {occupationRate.toFixed(1)}%. Considere promover horários disponíveis.
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default AgendaStats;

