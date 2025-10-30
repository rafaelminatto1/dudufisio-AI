import React from 'react';
import { TrendingUp, Calendar, DollarSign, Users, AlertTriangle, Clock } from 'lucide-react';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { EnrichedAppointment, Therapist, AppointmentStatus } from '../../types';
import format from 'date-fns/format';
import { ptBR } from 'date-fns/locale';
import { displayAppointmentType, formatCurrencyBR } from '../../lib/format';

interface AgendaDashboardProps {
  appointments: EnrichedAppointment[];
  therapists: Therapist[];
  className?: string;
}

const AgendaDashboard: React.FC<AgendaDashboardProps> = ({ appointments, therapists, className }) => {
  // Calcular KPIs
  const totalAppointments = appointments.length;
  const completedAppointments = appointments.filter(a => a.status === AppointmentStatus.Completed).length;
  const totalRevenue = appointments.reduce((sum, a) => sum + (a.value || 0), 0);
  const uniquePatients = new Set(appointments.map(a => a.patientId)).size;

  // Agendamentos nas próximas 2 horas
  const now = new Date();
  const twoHoursLater = new Date(now.getTime() + 2 * 60 * 60 * 1000);
  const upcomingAppointments = appointments
    .filter(a => a.startTime >= now && a.startTime <= twoHoursLater && a.status === AppointmentStatus.Scheduled)
    .sort((a, b) => a.startTime.getTime() - b.startTime.getTime());

  // Conflitos
  const conflicts = appointments.filter(a => a.hasConflict);

  // Taxa de ocupação por horário
  const occupancyByHour = Array.from({ length: 14 }, (_, i) => {
    const hour = i + 6; // 6h às 19h
    const hourAppointments = appointments.filter(a => {
      const appHour = a.startTime.getHours();
      return appHour === hour && a.status === AppointmentStatus.Scheduled;
    });
    return {
      hour,
      count: hourAppointments.length,
      percentage: (hourAppointments.length / therapists.length) * 100
    };
  });

  // Identificar picos e vales
  const peakHour = occupancyByHour.reduce((max, curr) => 
    curr.count > max.count ? curr : max
  );
  const valleyHour = occupancyByHour.reduce((min, curr) => 
    curr.count < min.count ? curr : min
  );

  return (
    <div className={className}>
      {/* KPIs Principais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {/* Ocupação */}
        <Card className="p-4 shadow-md hover:shadow-lg transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Taxa de Ocupação</p>
              <p className="text-2xl font-bold text-slate-900">
                {therapists.length > 0 ? Math.round((totalAppointments / (therapists.length * 14)) * 100) : 0}%
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center border-2 border-blue-200">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>

        {/* Receita */}
        <Card className="p-4 shadow-md hover:shadow-lg transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Receita Prevista</p>
              <p className="text-2xl font-bold text-slate-900">
                {formatCurrencyBR(totalRevenue)}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center border-2 border-green-200">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>

        {/* Pacientes */}
        <Card className="p-4 shadow-md hover:shadow-lg transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Pacientes Únicos</p>
              <p className="text-2xl font-bold text-slate-900">{uniquePatients}</p>
            </div>
            <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center border-2 border-purple-200">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </Card>

        {/* Agendamentos */}
        <Card className="p-4 shadow-md hover:shadow-lg transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Total Hoje</p>
              <p className="text-2xl font-bold text-slate-900">{totalAppointments}</p>
            </div>
            <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center border-2 border-orange-200">
              <Calendar className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Próximos Agendamentos */}
        <Card className="p-6">
          <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-600" />
            Próximos Agendamentos (2h)
          </h3>
          {upcomingAppointments.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <p>Nenhum agendamento nas próximas 2 horas</p>
            </div>
          ) : (
            <div className="space-y-2">
              {upcomingAppointments.slice(0, 5).map(appointment => (
                <div
                  key={appointment.id}
                  className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition"
                >
                  <div>
                    <p className="font-medium text-slate-900">{appointment.patientName}</p>
                    <p className="text-sm text-slate-600">{appointment.therapistName}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-slate-900">
                      {format(appointment.startTime, 'HH:mm', { locale: ptBR })}
                    </p>
                    <Badge variant="outline" className="text-xs">
                      {displayAppointmentType(appointment.type)}
                    </Badge>
                  </div>
                </div>
              ))}
              {upcomingAppointments.length > 5 && (
                <p className="text-sm text-slate-500 text-center pt-2">
                  +{upcomingAppointments.length - 5} mais
                </p>
              )}
            </div>
          )}
        </Card>

        {/* Alertas */}
        <Card className="p-6">
          <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            Alertas Importantes
          </h3>
          <div className="space-y-2">
            {/* Conflitos */}
            {conflicts.length > 0 && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-red-900">Conflitos Detectados</p>
                    <p className="text-sm text-red-700">
                      {conflicts.length} agendamento(s) com conflitos
                    </p>
                  </div>
                  <Badge variant="destructive">{conflicts.length}</Badge>
                </div>
              </div>
            )}

            {/* Pico de ocupação */}
            {peakHour.count > 0 && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-yellow-900">Pico de Ocupação</p>
                    <p className="text-sm text-yellow-700">
                      {peakHour.hour}h - {peakHour.count} agendamento(s)
                    </p>
                  </div>
                  <Badge className="bg-yellow-100 text-yellow-700 border-yellow-300">
                        {Math.round(peakHour.percentage)}%
                  </Badge>
                </div>
              </div>
            )}

            {/* Vale de ocupação */}
            {valleyHour.count === 0 && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-green-900">Horário Disponível</p>
                    <p className="text-sm text-green-700">
                      {valleyHour.hour}h - {valleyHour.count} agendamento(s)
                    </p>
                  </div>
                  <Badge className="bg-green-100 text-green-700 border-green-300">
                        {Math.round(valleyHour.percentage)}%
                  </Badge>
                </div>
              </div>
            )}

            {conflicts.length === 0 && peakHour.count === 0 && valleyHour.count !== 0 && (
              <div className="text-center py-8 text-slate-500">
                <p>Nenhum alerta no momento</p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Gráfico de Ocupação */}
      <Card className="p-6 mt-6">
        <h3 className="font-semibold text-slate-900 mb-4">Ocupação por Horário</h3>
        <div className="space-y-2">
          {occupancyByHour.map(({ hour, count, percentage }) => (
            <div key={hour} className="flex items-center gap-3">
              <div className="w-12 text-sm text-slate-600">{hour}h</div>
              <div className="flex-1 bg-slate-200 rounded-full h-6 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(percentage, 100)}%` }}
                />
              </div>
              <div className="w-16 text-sm text-slate-900 font-medium text-right">
                {count}/{therapists.length}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default AgendaDashboard;

