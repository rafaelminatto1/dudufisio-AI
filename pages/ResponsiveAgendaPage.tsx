import React, { useState, useEffect, useMemo, useCallback } from 'react';
import format from 'date-fns/format';
import addDays from 'date-fns/addDays';
import startOfWeek from 'date-fns/startOfWeek';
import addMonths from 'date-fns/addMonths';
import subMonths from 'date-fns/subMonths';
import startOfMonth from 'date-fns/startOfMonth';
import endOfMonth from 'date-fns/endOfMonth';
import { ptBR } from 'date-fns/locale';
import {
  ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon,
  Filter, Search, List, Grid3X3, Clock, User, MapPin, Phone
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { Button } from '../components/ui/button';
import { useAppointments } from '../hooks/useAppointments';
import { EnrichedAppointment, AppointmentStatus } from '../types';
import { useToast } from '../contexts/ToastContext';
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext';
import AppointmentDetailModal from '../components/AppointmentDetailModal';
import AppointmentFormModal from '../components/AppointmentFormModal';

// Tipos de visualização otimizados para mobile
type MobileViewType = 'list' | 'day' | 'week' | 'month';

interface AgendaHeaderProps {
  currentDate: Date;
  currentView: MobileViewType;
  onViewChange: (view: MobileViewType) => void;
  onPrevious: () => void;
  onNext: () => void;
  onToday: () => void;
  onFilterClick: () => void;
  onAddClick: () => void;
}

const AgendaHeader: React.FC<AgendaHeaderProps> = ({
  currentDate,
  currentView,
  onViewChange,
  onPrevious,
  onNext,
  onToday,
  onFilterClick,
  onAddClick
}) => {
  const viewOptions = [
    { value: 'list', icon: List, label: 'Lista' },
    { value: 'day', icon: CalendarIcon, label: 'Dia' },
    { value: 'week', icon: Grid3X3, label: 'Semana' },
    { value: 'month', icon: CalendarIcon, label: 'Mês' }
  ];

  const getHeaderTitle = () => {
    switch (currentView) {
      case 'day':
        return format(currentDate, "dd 'de' MMMM, yyyy", { locale: ptBR });
      case 'week':
        const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
        const weekEnd = addDays(weekStart, 6);
        return `${format(weekStart, 'dd MMM', { locale: ptBR })} - ${format(weekEnd, 'dd MMM', { locale: ptBR })}`;
      case 'month':
        return format(currentDate, "MMMM 'de' yyyy", { locale: ptBR });
      case 'list':
        return 'Próximos Agendamentos';
      default:
        return format(currentDate, "MMMM 'de' yyyy", { locale: ptBR });
    }
  };

  return (
    <div className="bg-white border-b border-fisio-neutral-200 sticky top-0 z-10">
      {/* Header Principal */}
      <div className="px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-xl font-bold text-fisio-neutral-800">
            {getHeaderTitle()}
          </h1>
          <div className="flex items-center space-x-2">
            <button
              onClick={onFilterClick}
              className="p-2 rounded-lg hover:bg-fisio-neutral-100 transition-colors"
              aria-label="Filtros"
            >
              <Filter className="w-5 h-5 text-fisio-neutral-600" />
            </button>
            <button
              onClick={onAddClick}
              className="p-2 bg-fisio-primary-DEFAULT text-white rounded-lg hover:bg-fisio-primary-600 transition-colors"
              aria-label="Novo agendamento"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Controles de Navegação */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button
              onClick={onPrevious}
              className="p-2 rounded-lg hover:bg-fisio-neutral-100 transition-colors"
              aria-label="Anterior"
            >
              <ChevronLeft className="w-4 h-4 text-fisio-neutral-600" />
            </button>
            <button
              onClick={onToday}
              className="px-3 py-1 text-sm font-medium text-fisio-primary-DEFAULT hover:bg-fisio-primary-50 rounded-lg transition-colors"
            >
              Hoje
            </button>
            <button
              onClick={onNext}
              className="p-2 rounded-lg hover:bg-fisio-neutral-100 transition-colors"
              aria-label="Próximo"
            >
              <ChevronRight className="w-4 h-4 text-fisio-neutral-600" />
            </button>
          </div>

          {/* Seletor de Visualização - Mobile Optimizado */}
          <div className="flex bg-fisio-neutral-100 rounded-lg p-1">
            {viewOptions.map(option => (
              <button
                key={option.value}
                onClick={() => onViewChange(option.value as MobileViewType)}
                className={`
                  px-3 py-1.5 rounded-md transition-all duration-200 text-sm font-medium
                  ${currentView === option.value 
                    ? 'bg-white text-fisio-primary-DEFAULT shadow-sm' 
                    : 'text-fisio-neutral-600 hover:text-fisio-neutral-800'}
                `}
                aria-label={option.label}
              >
                <span className="hidden sm:inline">{option.label}</span>
                <option.icon className="w-4 h-4 sm:hidden" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Mini Calendário - Visível apenas em vista de lista */}
      {currentView === 'list' && (
        <div className="px-4 pb-3">
          <MiniCalendar currentDate={currentDate} onDateSelect={() => {}} />
        </div>
      )}
    </div>
  );
};

// Componente Mini Calendário para seleção rápida de datas
const MiniCalendar: React.FC<{ currentDate: Date; onDateSelect: (date: Date) => void }> = ({ 
  currentDate, 
  onDateSelect 
}) => {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
  const endDate = addDays(startOfWeek(monthEnd, { weekStartsOn: 1 }), 6);
  
  const days = [];
  let day = startDate;
  
  while (day <= endDate) {
    days.push(day);
    day = addDays(day, 1);
  }

  return (
    <div className="bg-fisio-neutral-50 rounded-lg p-3">
      <div className="grid grid-cols-7 gap-1 text-center">
        {['S', 'T', 'Q', 'Q', 'S', 'S', 'D'].map((dayName, i) => (
          <div key={i} className="text-xs font-medium text-fisio-neutral-500 py-1">
            {dayName}
          </div>
        ))}
        {days.map((day, i) => {
          const isToday = format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
          const isCurrentMonth = format(day, 'MM') === format(currentDate, 'MM');
          const isSelected = format(day, 'yyyy-MM-dd') === format(currentDate, 'yyyy-MM-dd');
          
          return (
            <button
              key={i}
              onClick={() => onDateSelect(day)}
              className={`
                p-1.5 text-xs rounded-md transition-colors
                ${isToday ? 'bg-fisio-primary-100 text-fisio-primary-700 font-bold' : ''}
                ${isSelected && !isToday ? 'bg-fisio-neutral-200 text-fisio-neutral-800' : ''}
                ${!isCurrentMonth ? 'text-fisio-neutral-400' : 'text-fisio-neutral-700'}
                ${!isToday && !isSelected ? 'hover:bg-fisio-neutral-100' : ''}
              `}
            >
              {format(day, 'd')}
            </button>
          );
        })}
      </div>
    </div>
  );
};

// Componente de Card de Agendamento para Mobile
const AppointmentCard: React.FC<{ 
  appointment: EnrichedAppointment;
  onSelect: (appointment: EnrichedAppointment) => void;
  isCompact?: boolean;
}> = ({ appointment, onSelect, isCompact = false }) => {
  const statusColors = {
    [AppointmentStatus.SCHEDULED]: 'border-fisio-neutral-300 bg-fisio-neutral-50',
    [AppointmentStatus.CONFIRMED]: 'border-fisio-primary-300 bg-fisio-primary-50',
    [AppointmentStatus.COMPLETED]: 'border-fisio-secondary-300 bg-fisio-secondary-50',
    [AppointmentStatus.CANCELLED]: 'border-fisio-error-300 bg-fisio-error-50',
    [AppointmentStatus.NO_SHOW]: 'border-fisio-warning-300 bg-fisio-warning-50',
  };

  const statusLabels = {
    [AppointmentStatus.SCHEDULED]: 'Agendado',
    [AppointmentStatus.CONFIRMED]: 'Confirmado',
    [AppointmentStatus.COMPLETED]: 'Concluído',
    [AppointmentStatus.CANCELLED]: 'Cancelado',
    [AppointmentStatus.NO_SHOW]: 'Faltou',
  };

  const statusColor = statusColors[appointment.status] || statusColors[AppointmentStatus.SCHEDULED];

  if (isCompact) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        onClick={() => onSelect(appointment)}
        className={`
          p-3 rounded-lg border-l-4 cursor-pointer transition-all
          hover:shadow-md ${statusColor}
        `}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Clock className="w-4 h-4 text-fisio-neutral-500" />
            <span className="font-medium text-fisio-neutral-800">
              {format(new Date(appointment.datetime), 'HH:mm')}
            </span>
            <span className="text-sm text-fisio-neutral-600">
              {appointment.patient?.name || 'Paciente não definido'}
            </span>
          </div>
          <span className={`
            text-xs px-2 py-1 rounded-full font-medium
            ${appointment.status === AppointmentStatus.CONFIRMED ? 'bg-fisio-primary-100 text-fisio-primary-700' :
              appointment.status === AppointmentStatus.COMPLETED ? 'bg-fisio-secondary-100 text-fisio-secondary-700' :
              'bg-fisio-neutral-100 text-fisio-neutral-700'}
          `}>
            {statusLabels[appointment.status]}
          </span>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      onClick={() => onSelect(appointment)}
      className={`
        bg-white rounded-lg shadow-sm border p-4 cursor-pointer
        transition-all hover:shadow-md ${statusColor}
      `}
    >
      {/* Header do Card */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-fisio-primary-100 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-fisio-primary-700" />
          </div>
          <div>
            <h3 className="font-semibold text-fisio-neutral-800">
              {appointment.patient?.name || 'Paciente não definido'}
            </h3>
            <p className="text-sm text-fisio-neutral-500">
              {appointment.therapist?.name || 'Terapeuta não definido'}
            </p>
          </div>
        </div>
        <span className={`
          text-xs px-3 py-1 rounded-full font-medium
          ${appointment.status === AppointmentStatus.CONFIRMED ? 'bg-fisio-primary-100 text-fisio-primary-700' :
            appointment.status === AppointmentStatus.COMPLETED ? 'bg-fisio-secondary-100 text-fisio-secondary-700' :
            appointment.status === AppointmentStatus.CANCELLED ? 'bg-fisio-error-100 text-fisio-error-700' :
            'bg-fisio-neutral-100 text-fisio-neutral-700'}
        `}>
          {statusLabels[appointment.status]}
        </span>
      </div>

      {/* Informações do Agendamento */}
      <div className="space-y-2">
        <div className="flex items-center text-sm text-fisio-neutral-600">
          <Clock className="w-4 h-4 mr-2 text-fisio-neutral-400" />
          <span className="font-medium">
            {format(new Date(appointment.datetime), "dd/MM/yyyy 'às' HH:mm")}
          </span>
          {appointment.duration && (
            <span className="ml-2 text-fisio-neutral-500">
              ({appointment.duration} min)
            </span>
          )}
        </div>

        {appointment.type && (
          <div className="flex items-center text-sm text-fisio-neutral-600">
            <MapPin className="w-4 h-4 mr-2 text-fisio-neutral-400" />
            <span>{appointment.type}</span>
          </div>
        )}

        {appointment.patient?.phone && (
          <div className="flex items-center text-sm text-fisio-neutral-600">
            <Phone className="w-4 h-4 mr-2 text-fisio-neutral-400" />
            <span>{appointment.patient.phone}</span>
          </div>
        )}

        {appointment.notes && (
          <p className="text-sm text-fisio-neutral-500 italic mt-2 line-clamp-2">
            {appointment.notes}
          </p>
        )}
      </div>

      {/* Ações Rápidas */}
      <div className="flex items-center justify-end mt-4 space-x-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            // Lógica para confirmar agendamento
          }}
          className="text-xs px-3 py-1 text-fisio-primary-600 hover:bg-fisio-primary-50 rounded-lg transition-colors"
        >
          Confirmar
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            // Lógica para editar agendamento
          }}
          className="text-xs px-3 py-1 text-fisio-neutral-600 hover:bg-fisio-neutral-100 rounded-lg transition-colors"
        >
          Editar
        </button>
      </div>
    </motion.div>
  );
};

// Componente Principal da Página de Agenda Responsiva
export default function ResponsiveAgendaPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState<MobileViewType>('list');
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<EnrichedAppointment | null>(null);
  const { user } = useSupabaseAuth();
  const { showToast } = useToast();

  // Calcular intervalo de datas baseado na visualização atual
  const { startDate, endDate } = useMemo(() => {
    switch (currentView) {
      case 'day':
        return { startDate: currentDate, endDate: currentDate };
      case 'week':
        const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
        return { startDate: weekStart, endDate: addDays(weekStart, 6) };
      case 'month':
        return { startDate: startOfMonth(currentDate), endDate: endOfMonth(currentDate) };
      case 'list':
        // Vista de lista mostra próximos 14 dias
        return { startDate: new Date(), endDate: addDays(new Date(), 14) };
      default:
        return { startDate: currentDate, endDate: currentDate };
    }
  }, [currentDate, currentView]);

  const { appointments, refetch } = useAppointments(startDate, endDate);

  // Navegação entre períodos
  const handlePrevious = () => {
    switch (currentView) {
      case 'day':
        setCurrentDate(prev => addDays(prev, -1));
        break;
      case 'week':
        setCurrentDate(prev => addDays(prev, -7));
        break;
      case 'month':
        setCurrentDate(prev => subMonths(prev, 1));
        break;
    }
  };

  const handleNext = () => {
    switch (currentView) {
      case 'day':
        setCurrentDate(prev => addDays(prev, 1));
        break;
      case 'week':
        setCurrentDate(prev => addDays(prev, 7));
        break;
      case 'month':
        setCurrentDate(prev => addMonths(prev, 1));
        break;
    }
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Filtrar agendamentos baseado na busca
  const filteredAppointments = useMemo(() => {
    if (!searchQuery) return appointments;
    
    return appointments.filter(appointment => 
      appointment.patient?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      appointment.therapist?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      appointment.type?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [appointments, searchQuery]);

  // Agrupar agendamentos por dia para visualização em lista
  const groupedAppointments = useMemo(() => {
    const groups: { [key: string]: EnrichedAppointment[] } = {};
    
    filteredAppointments.forEach(appointment => {
      const dateKey = format(new Date(appointment.datetime), 'yyyy-MM-dd');
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(appointment);
    });

    // Ordenar por horário dentro de cada grupo
    Object.keys(groups).forEach(key => {
      groups[key].sort((a, b) => 
        new Date(a.datetime).getTime() - new Date(b.datetime).getTime()
      );
    });

    return groups;
  }, [filteredAppointments]);

  // Detectar se é mobile
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Renderizar visualização baseada no tipo selecionado
  const renderView = () => {
    switch (currentView) {
      case 'list':
        return (
          <div className="space-y-6">
            {Object.keys(groupedAppointments).sort().map(dateKey => {
              const date = new Date(dateKey);
              const isToday = format(date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
              
              return (
                <div key={dateKey}>
                  <div className={`
                    sticky top-0 z-5 px-4 py-2 mb-3
                    ${isToday ? 'bg-fisio-primary-50' : 'bg-fisio-neutral-50'}
                  `}>
                    <h3 className={`
                      text-sm font-semibold uppercase tracking-wider
                      ${isToday ? 'text-fisio-primary-700' : 'text-fisio-neutral-600'}
                    `}>
                      {isToday ? 'Hoje • ' : ''}
                      {format(date, "EEEE, dd 'de' MMMM", { locale: ptBR })}
                    </h3>
                  </div>
                  <div className="px-4 space-y-3">
                    <AnimatePresence>
                      {groupedAppointments[dateKey].map(appointment => (
                        <AppointmentCard
                          key={appointment.id}
                          appointment={appointment}
                          onSelect={setSelectedAppointment}
                        />
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              );
            })}
            {Object.keys(groupedAppointments).length === 0 && (
              <div className="text-center py-12 px-4">
                <CalendarIcon className="w-12 h-12 text-fisio-neutral-300 mx-auto mb-4" />
                <p className="text-fisio-neutral-500">Nenhum agendamento encontrado</p>
                <button
                  onClick={() => setIsFormOpen(true)}
                  className="mt-4 px-4 py-2 bg-fisio-primary-DEFAULT text-white rounded-lg hover:bg-fisio-primary-600 transition-colors"
                >
                  Criar Novo Agendamento
                </button>
              </div>
            )}
          </div>
        );

      case 'day':
        // Visualização diária compacta para mobile
        const dayAppointments = filteredAppointments.filter(apt => 
          format(new Date(apt.datetime), 'yyyy-MM-dd') === format(currentDate, 'yyyy-MM-dd')
        );

        return (
          <div className="px-4 py-4 space-y-3">
            <AnimatePresence>
              {dayAppointments.map(appointment => (
                <AppointmentCard
                  key={appointment.id}
                  appointment={appointment}
                  onSelect={setSelectedAppointment}
                  isCompact={isMobile}
                />
              ))}
            </AnimatePresence>
            {dayAppointments.length === 0 && (
              <div className="text-center py-12">
                <CalendarIcon className="w-12 h-12 text-fisio-neutral-300 mx-auto mb-4" />
                <p className="text-fisio-neutral-500">Nenhum agendamento para hoje</p>
              </div>
            )}
          </div>
        );

      case 'week':
      case 'month':
        // Para semana e mês, usar visualização em lista no mobile
        if (isMobile) {
          return renderView(); // Recursão para renderizar como lista
        }
        // Desktop mantém visualização tradicional (não implementada aqui)
        return (
          <div className="p-4 text-center">
            <p className="text-fisio-neutral-500">
              Visualização {currentView === 'week' ? 'semanal' : 'mensal'} disponível apenas em desktop
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-full bg-fisio-neutral-50">
      {/* Header da Agenda */}
      <AgendaHeader
        currentDate={currentDate}
        currentView={currentView}
        onViewChange={setCurrentView}
        onPrevious={handlePrevious}
        onNext={handleNext}
        onToday={handleToday}
        onFilterClick={() => setShowFilters(!showFilters)}
        onAddClick={() => setIsFormOpen(true)}
      />

      {/* Barra de Busca e Filtros */}
      {showFilters && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="bg-white border-b border-fisio-neutral-200 px-4 py-3"
        >
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-fisio-neutral-400" />
            <input
              type="text"
              placeholder="Buscar por paciente, terapeuta ou tipo..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-fisio-neutral-50 border border-fisio-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-fisio-primary-500"
            />
          </div>
          {/* Adicionar mais filtros aqui se necessário */}
        </motion.div>
      )}

      {/* Área de Conteúdo */}
      <div className="flex-1 overflow-y-auto">
        {renderView()}
      </div>

      {/* Modal de Detalhes do Agendamento */}
      {selectedAppointment && (
        <AppointmentDetailModal
          appointment={selectedAppointment}
          isOpen={!!selectedAppointment}
          onClose={() => setSelectedAppointment(null)}
        />
      )}

      {/* Modal de Formulário de Agendamento */}
      <AppointmentFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={async () => {
          await refetch();
          showToast('Agendamento criado com sucesso!', 'success');
        }}
      />
    </div>
  );
}