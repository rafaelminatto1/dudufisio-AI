import React from 'react';
import { Calendar, Clock, DollarSign, Users, TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Appointment, Therapist, AppointmentStatus, EnrichedAppointment } from '@/shared/types';
import { cn } from '@/shared/lib/utils';
import { formatCurrencyBR } from '@/shared/lib/format';
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
  testId: string;
}

const AgendaStats: React.FC<AgendaStatsProps> = ({ appointments, therapists, className }) => {
  const normalizeStatus = (status?: string | AppointmentStatus): string =>
    (status ?? '').toString().toLowerCase();

  const typedAppointments = appointments as Array<Appointment & Partial<EnrichedAppointment>>;

  const totalAppointments = typedAppointments.length;
  const completedAppointments = typedAppointments.filter(a => ['completed', 'realizado'].includes(normalizeStatus(a.status))).length;
  const pendingAppointments = typedAppointments.filter(a => ['scheduled', 'agendado'].includes(normalizeStatus(a.status))).length;
  const cancelledAppointments = typedAppointments.filter(a => ['cancelled', 'canceled', 'cancelado'].includes(normalizeStatus(a.status))).length;
  const noShowAppointments = typedAppointments.filter(a => ['no_show', 'no-show', 'faltou'].includes(normalizeStatus(a.status))).length;

  const confirmationCounters = typedAppointments.reduce(
    (acc, app) => {
      const normalizedStatus = normalizeStatus(app.status);
      let state: 'confirmed' | 'pending' | 'cancelled' | 'rescheduled' = 'pending';

      if (app.confirmationState) {
        state = app.confirmationState;
      } else if (normalizedStatus === 'cancelled' || normalizedStatus === 'canceled') {
        state = 'cancelled';
      } else if (normalizedStatus === 'rescheduled') {
        state = 'rescheduled';
      } else if (app.confirmed) {
        state = 'confirmed';
      }

      acc[state] += 1;
      return acc;
    },
    { confirmed: 0, pending: 0, cancelled: 0, rescheduled: 0 }
  );

  const confirmableTotal = confirmationCounters.confirmed + confirmationCounters.pending + confirmationCounters.rescheduled;
  const confirmationRate = confirmableTotal > 0 ? (confirmationCounters.confirmed / confirmableTotal) * 100 : 0;
  const pendingConfirmationRate = confirmableTotal > 0 ? (confirmationCounters.pending / confirmableTotal) * 100 : 0;

  // Calcular valor total
  const totalValue = typedAppointments.reduce((sum, app) => sum + (app.value || 0), 0);
  const paidValue = typedAppointments
    .filter(a => a.paymentStatus === 'paid')
    .reduce((sum, app) => sum + (app.value || 0), 0);

  // Calcular taxa de ocupação (considerando horário de trabalho 8h-18h)
  const workingHours = 10; // 8h às 18h
  const totalSlots = therapists.length * workingHours; // Slots de 1 hora
  const occupationRate = totalSlots > 0 ? (totalAppointments / totalSlots) * 100 : 0;

  // Calcular taxa de no-show
  const noShowRate = totalAppointments > 0 ? (noShowAppointments / totalAppointments) * 100 : 0;

  // Pacientes únicos
  const uniquePatients = new Set(typedAppointments.map(a => a.patientId)).size;

  // Agendamentos por tipo
  const appointmentsByType = typedAppointments.reduce((acc, app) => {
    const type = app.type || 'Não definido';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const stats: StatCard[] = [
    {
      label: 'Total de Agendamentos',
      value: totalAppointments,
      icon: <Calendar className="w-5 h-5" />,
      color: 'text-blue-600 bg-blue-50',
      testId: 'stat-total-appointments'
    },
    {
      label: 'Taxa de Confirmação',
      value: `${confirmationRate.toFixed(1)}%`,
      icon: <CheckCircle2 className="w-5 h-5" />,
      color: 'text-teal-600 bg-teal-50',
      trend: {
        value: confirmationRate,
        isPositive: confirmationRate >= 80
      },
      testId: 'stat-confirmation-rate'
    },
    {
      label: 'Taxa de Ocupação',
      value: `${occupationRate.toFixed(1)}%`,
      icon: <TrendingUp className="w-5 h-5" />,
      color: 'text-green-600 bg-green-50',
      trend: {
        value: occupationRate,
        isPositive: occupationRate > 70
      },
      testId: 'stat-occupation-rate'
    },
    {
      label: 'Valor Total',
      value: formatCurrencyBR(totalValue),
      icon: <DollarSign className="w-5 h-5" />,
      color: 'text-emerald-600 bg-emerald-50',
      testId: 'stat-total-value'
    },
    {
      label: 'Pacientes Únicos',
      value: uniquePatients,
      icon: <Users className="w-5 h-5" />,
      color: 'text-purple-600 bg-purple-50',
      testId: 'stat-unique-patients'
    }
  ];

  return (
    <div className={cn("space-y-4", className)}>
      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card
              className="p-4 hover:shadow-lg transition-shadow cursor-pointer"
              data-testid={stat.testId}
            >
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
      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        <Card className="p-3" data-testid="stat-completed-count">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600">Concluídos</span>
            <Badge className="bg-green-100 text-green-700 border-green-200">
              {completedAppointments}
            </Badge>
          </div>
        </Card>

        <Card className="p-3" data-testid="stat-scheduled-count">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600">Agendados</span>
            <Badge className="bg-blue-100 text-blue-700 border-blue-200">
              {pendingAppointments}
            </Badge>
          </div>
        </Card>

        <Card className="p-3" data-testid="stat-cancelled-count">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600">Cancelados</span>
            <Badge className="bg-red-100 text-red-700 border-red-200">
              {cancelledAppointments}
            </Badge>
          </div>
        </Card>

        <Card className="p-3" data-testid="stat-confirmed-count">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600">Confirmados</span>
            <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
              {confirmationCounters.confirmed}
            </Badge>
          </div>
        </Card>

        <Card className="p-3" data-testid="stat-pending-confirmation-count">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600">Aguardando Confirmação</span>
            <Badge className="bg-amber-100 text-amber-700 border-amber-200">
              {confirmationCounters.pending} ({pendingConfirmationRate.toFixed(1)}%)
            </Badge>
          </div>
        </Card>

        <Card className="p-3" data-testid="stat-noshow-count">
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

        <Card className="p-3" data-testid="stat-rescheduled-count">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600">Reagendados</span>
            <Badge className="bg-sky-100 text-sky-700 border-sky-200">
              {confirmationCounters.rescheduled}
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
            {(Object.entries(appointmentsByType) as Array<[string, number]>).map(([type, count]) => (
              <div key={type} className="flex items-center justify-between">
                <span className="text-sm text-slate-700">{type}</span>
                <Badge variant="secondary">{count}</Badge>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Alerts */}
      {confirmationCounters.pending > 0 && confirmationRate < 80 && (
        <Card className="p-4 bg-amber-50 border-amber-200" data-testid="alert-pending-confirmation">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-amber-900 mb-1">Muitas sessões aguardando confirmação</div>
              <p className="text-sm text-amber-700">
                {confirmationCounters.pending} pacientes ainda não confirmaram presença. Considere enviar lembretes adicionais.
              </p>
            </div>
          </div>
        </Card>
      )}

      {noShowRate > 10 && (
        <Card className="p-4 bg-red-50 border-red-200" data-testid="alert-noshow-rate">
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
        <Card className="p-4 bg-yellow-50 border-yellow-200" data-testid="alert-low-occupation">
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

