import React, { useState, useMemo } from 'react';
import { format, isSameDay, startOfDay, endOfDay, isWithinInterval } from 'date-fns';
import { ptBR } from 'date-fns/locale/pt-BR';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { EnrichedAppointment, Therapist, AppointmentStatus } from '../../types';
import { cn } from '../../lib/utils';
import { Filter, Calendar, Clock, User, Phone, DollarSign } from 'lucide-react';

interface ListViewProps {
  appointments: EnrichedAppointment[];
  therapists: Therapist[];
  selectedDate: Date;
  onAppointmentClick: (appointment: EnrichedAppointment) => void;
  onDateRangeChange: (start: Date, end: Date) => void;
}

type FilterStatus = 'all' | AppointmentStatus;
type SortBy = 'date' | 'patient' | 'therapist' | 'status';

const ListView: React.FC<ListViewProps> = ({
  appointments,
  therapists,
  selectedDate,
  onAppointmentClick,
  onDateRangeChange
}) => {
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [filterTherapist, setFilterTherapist] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortBy>('date');
  const [showFilters, setShowFilters] = useState(false);

  const filteredAndSortedAppointments = useMemo(() => {
    let filtered = [...appointments];

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(app => app.status === filterStatus);
    }

    // Filter by therapist
    if (filterTherapist !== 'all') {
      filtered = filtered.filter(app => app.therapistId === filterTherapist);
    }

    // Sort appointments
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'patient':
          return a.patientName.localeCompare(b.patientName);
        case 'therapist':
          return a.therapistName.localeCompare(b.therapistName);
        case 'status':
          return a.status.localeCompare(b.status);
        case 'date':
        default:
          return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
      }
    });

    return filtered;
  }, [appointments, filterStatus, filterTherapist, sortBy]);

  const getStatusColor = (status: AppointmentStatus) => {
    switch (status) {
      case AppointmentStatus.Scheduled:
        return 'bg-blue-100 text-blue-800';
      case AppointmentStatus.Confirmed:
        return 'bg-green-100 text-green-800';
      case AppointmentStatus.Completed:
        return 'bg-purple-100 text-purple-800';
      case AppointmentStatus.Canceled:
        return 'bg-red-100 text-red-800';
      case AppointmentStatus.NoShow:
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: AppointmentStatus) => {
    switch (status) {
      case AppointmentStatus.Scheduled:
        return 'Agendado';
      case AppointmentStatus.Confirmed:
        return 'Confirmado';
      case AppointmentStatus.Completed:
        return 'Realizado';
      case AppointmentStatus.Canceled:
        return 'Cancelado';
      case AppointmentStatus.NoShow:
        return 'Não Compareceu';
      default:
        return status;
    }
  };

  return (
    <div className="flex-1 flex flex-col space-y-4">
      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Lista de Agendamentos</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <Filter size={16} />
              Filtros
            </Button>
          </div>
        </CardHeader>

        {showFilters && (
          <CardContent className="pt-0">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-2">Status</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
                  className="w-full p-2 border border-slate-300 rounded-lg text-sm"
                >
                  <option value="all">Todos os status</option>
                  <option value={AppointmentStatus.Scheduled}>Agendado</option>
                  <option value={AppointmentStatus.Confirmed}>Confirmado</option>
                  <option value={AppointmentStatus.Completed}>Realizado</option>
                  <option value={AppointmentStatus.Canceled}>Cancelado</option>
                  <option value={AppointmentStatus.NoShow}>Não Compareceu</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 block mb-2">Fisioterapeuta</label>
                <select
                  value={filterTherapist}
                  onChange={(e) => setFilterTherapist(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg text-sm"
                >
                  <option value="all">Todos os fisioterapeutas</option>
                  {therapists.map(therapist => (
                    <option key={therapist.id} value={therapist.id}>
                      {therapist.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 block mb-2">Ordenar por</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortBy)}
                  className="w-full p-2 border border-slate-300 rounded-lg text-sm"
                >
                  <option value="date">Data e hora</option>
                  <option value="patient">Nome do paciente</option>
                  <option value="therapist">Fisioterapeuta</option>
                  <option value="status">Status</option>
                </select>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Results count */}
      <div className="text-sm text-slate-600">
        {filteredAndSortedAppointments.length} agendamento{filteredAndSortedAppointments.length !== 1 ? 's' : ''} encontrado{filteredAndSortedAppointments.length !== 1 ? 's' : ''}
      </div>

      {/* Appointments list */}
      <div className="flex-1 space-y-3 overflow-auto">
        {filteredAndSortedAppointments.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-slate-500">Nenhum agendamento encontrado com os filtros selecionados.</p>
            </CardContent>
          </Card>
        ) : (
          filteredAndSortedAppointments.map((appointment) => (
            <Card
              key={appointment.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => onAppointmentClick(appointment)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg text-slate-900">
                        {appointment.patientName}
                      </h3>
                      <Badge className={cn("text-xs", getStatusColor(appointment.status))}>
                        {getStatusLabel(appointment.status)}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-slate-600">
                      <div className="flex items-center gap-2">
                        <Calendar size={16} />
                        <span>{format(appointment.startTime, "d 'de' MMM, yyyy", { locale: ptBR })}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Clock size={16} />
                        <span>
                          {format(appointment.startTime, 'HH:mm')} - {format(appointment.endTime, 'HH:mm')}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <User size={16} />
                        <span>{appointment.therapistName}</span>
                      </div>

                      {appointment.value && (
                        <div className="flex items-center gap-2">
                          <DollarSign size={16} />
                          <span>R$ {appointment.value.toFixed(2)}</span>
                        </div>
                      )}
                    </div>

                    <div className="mt-2 text-sm text-slate-600">
                      <strong>Tipo:</strong> {appointment.type}
                      {appointment.notes && (
                        <div className="mt-1">
                          <strong>Observações:</strong> {appointment.notes}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className={cn(
                    "w-3 h-3 rounded-full flex-shrink-0 mt-2",
                    `bg-${appointment.therapistColor}-500`
                  )} />
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default ListView;