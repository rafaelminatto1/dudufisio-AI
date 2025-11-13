import React, { useState, useMemo } from 'react';
import format from 'date-fns/format';
import formatDistanceToNow from 'date-fns/formatDistanceToNow';
import { ptBR } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { EnrichedAppointment, Therapist, AppointmentStatus } from '@/shared/types';
import { cn } from '@/shared/utils';
import { Filter, Calendar, Clock, User, DollarSign, ArrowUpDown, ArrowUp, ArrowDown, CheckCircle2, AlertCircle, XCircle, RefreshCw } from 'lucide-react';
import Tooltip from '../ui/tooltip';
import { formatCurrencyBR, displayAppointmentType } from '@/shared/format';

interface ListViewProps {
  appointments: EnrichedAppointment[];
  therapists: Therapist[];
  onAppointmentClick: (appointment: EnrichedAppointment) => void;
}

type FilterStatus = 'all' | AppointmentStatus;
type SortBy = 'date' | 'patient' | 'therapist' | 'status' | 'value';
type SortOrder = 'asc' | 'desc';

const getTherapistColor = (color: string): string => {
  const colorMap: { [key: string]: string } = {
    purple: '#a855f7',
    emerald: '#10b981',
    blue: '#3b82f6',
    amber: '#f59e0b',
    red: '#ef4444',
    indigo: '#6366f1',
    teal: '#14b8a6',
    sky: '#0ea5e9',
    pink: '#ec4899',
    rose: '#f43f5e',
    cyan: '#06b6d4',
  };
  return colorMap[color] || '#64748b';
};

const ListView: React.FC<ListViewProps> = ({
  appointments,
  therapists,
  onAppointmentClick
}) => {
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [filterTherapist, setFilterTherapist] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortBy>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [showFilters, setShowFilters] = useState(false);

  // Toggle sort order or change sort column
  const handleSort = (column: SortBy) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

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
      let comparison = 0;
      
      switch (sortBy) {
        case 'patient':
          comparison = a.patientName.localeCompare(b.patientName);
          break;
        case 'therapist':
          comparison = a.therapistName.localeCompare(b.therapistName);
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
        case 'value':
          comparison = (a.value || 0) - (b.value || 0);
          break;
        case 'date':
        default:
          comparison = new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [appointments, filterStatus, filterTherapist, sortBy, sortOrder]);

  const getStatusColor = (status: AppointmentStatus) => {
    switch (status) {
      case AppointmentStatus.Scheduled:
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case AppointmentStatus.Completed:
        return 'bg-green-100 text-green-800 border-green-200';
      case AppointmentStatus.Canceled:
        return 'bg-red-100 text-red-800 border-red-200';
      case AppointmentStatus.NoShow:
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const getStatusLabel = (status: AppointmentStatus) => {
    switch (status) {
      case AppointmentStatus.Scheduled:
        return 'Agendado';
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

  const renderConfirmationBadge = (appointment: EnrichedAppointment) => {
    if (!appointment.confirmationState) {
      return null;
    }

    let Icon = AlertCircle;
    switch (appointment.confirmationState) {
      case 'confirmed':
        Icon = CheckCircle2;
        break;
      case 'cancelled':
        Icon = XCircle;
        break;
      case 'rescheduled':
        Icon = RefreshCw;
        break;
      case 'pending':
      default:
        Icon = AlertCircle;
        break;
    }

    return (
      <Badge
        variant="outline"
        className={cn('text-xs flex items-center gap-1', appointment.confirmationBadgeClass)}
        data-testid="appointment-confirmation-badge"
      >
        <Icon className="w-3 h-3" />
        {appointment.confirmationLabel}
      </Badge>
    );
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

      {/* Results count and sort indicators */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-slate-600">
          {filteredAndSortedAppointments.length} agendamento{filteredAndSortedAppointments.length !== 1 ? 's' : ''} encontrado{filteredAndSortedAppointments.length !== 1 ? 's' : ''}
        </div>
        
        {/* Quick sort buttons */}
        <div className="flex items-center gap-1">
          <Button
            variant={sortBy === 'date' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleSort('date')}
            className="text-xs h-7"
          >
            <Calendar className="w-3 h-3 mr-1" />
            Data
            {sortBy === 'date' && (sortOrder === 'asc' ? <ArrowUp className="w-3 h-3 ml-1" /> : <ArrowDown className="w-3 h-3 ml-1" />)}
          </Button>
          <Button
            variant={sortBy === 'patient' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleSort('patient')}
            className="text-xs h-7"
          >
            <User className="w-3 h-3 mr-1" />
            Paciente
            {sortBy === 'patient' && (sortOrder === 'asc' ? <ArrowUp className="w-3 h-3 ml-1" /> : <ArrowDown className="w-3 h-3 ml-1" />)}
          </Button>
          <Button
            variant={sortBy === 'value' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleSort('value')}
            className="text-xs h-7"
          >
            <DollarSign className="w-3 h-3 mr-1" />
            Valor
            {sortBy === 'value' && (sortOrder === 'asc' ? <ArrowUp className="w-3 h-3 ml-1" /> : <ArrowDown className="w-3 h-3 ml-1" />)}
          </Button>
        </div>
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
              className="cursor-pointer hover:shadow-lg transition-all duration-200 border-l-4"
              style={{ borderLeftColor: getTherapistColor(appointment.therapistColor) }}
              onClick={() => onAppointmentClick(appointment)}
              data-testid={`appointment-card-${appointment.id}`}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Tooltip 
                        content={`${appointment.patientName}${appointment.therapistName ? ` - ${appointment.therapistName}` : ''}`}
                        side="top"
                        delayDuration={200}
                      >
                        <h3 className="font-semibold text-base sm:text-lg text-slate-900 min-w-0">
                          <span className="truncate block">
                            {appointment.patientName.split(' ').slice(0, 2).join(' ')}
                          </span>
                        </h3>
                      </Tooltip>
                      <Badge className={cn("text-xs", getStatusColor(appointment.status))}>
                        {getStatusLabel(appointment.status)}
                      </Badge>
                      {renderConfirmationBadge(appointment)}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 text-sm text-slate-600">
                      <div className="flex items-center gap-2 min-w-0">
                        <Calendar size={16} className="flex-shrink-0" />
                        <span className="truncate">{format(appointment.startTime, "d 'de' MMM, yyyy", { locale: ptBR })}</span>
                      </div>

                      <div className="flex items-center gap-2 min-w-0">
                        <Clock size={16} className="flex-shrink-0" />
                        <span className="truncate">
                          {format(appointment.startTime, 'HH:mm')} - {format(appointment.endTime, 'HH:mm')}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 min-w-0">
                        <User size={16} className="flex-shrink-0" />
                        <span className="truncate">{appointment.therapistName}</span>
                      </div>

                      {appointment.value && (
                        <div className="flex items-center gap-2 min-w-0">
                          <DollarSign size={16} className="flex-shrink-0" />
                          <span className="truncate font-semibold text-green-600">{formatCurrencyBR(appointment.value)}</span>
                        </div>
                      )}
                    </div>

                    <div className="mt-2 text-sm text-slate-600">
                      <strong>Tipo:</strong> {displayAppointmentType(appointment.type)}
                      {appointment.notes && (
                        <div className="mt-1">
                          <strong>Observações:</strong> {appointment.notes}
                        </div>
                      )}
                      {appointment.lastReminderAt && (
                        <div
                          className="mt-1 text-xs text-slate-500"
                          data-testid="appointment-last-reminder"
                        >
                          Último lembrete {formatDistanceToNow(appointment.lastReminderAt, { locale: ptBR, addSuffix: true })}
                          {appointment.lastReminderType ? ` • ${appointment.lastReminderType.toUpperCase()}` : ''}
                        </div>
                      )}
                    </div>
                  </div>
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