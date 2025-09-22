import React, { useState, useEffect, useMemo } from 'react';
import { addDays, startOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import { ScrollArea } from '../../@/components/ui/scroll-area';
import { useAppointments } from '../../hooks/useAppointments';
import { EnrichedAppointment, Patient } from '../../types';
import { useToast } from '../../contexts/ToastContext';
import { useData } from '../../contexts/AppContext';
import { useSupabaseAuth } from '../../contexts/SupabaseAuthContext';
import { Role } from '../../types';
import AppointmentDetailModal from '../AppointmentDetailModal';
import AppointmentFormModal from '../AppointmentFormModal';
import EnhancedAgendaHeader from './EnhancedAgendaHeader';
import AgendaSkeleton from './AgendaSkeleton';
import AgendaEmptyState from './AgendaEmptyState';
import DailyView from './DailyView';
import ImprovedWeeklyView from './ImprovedWeeklyView';
import MonthlyView from './MonthlyView';
import ListView from './ListView';

type AgendaViewType = 'daily' | 'weekly' | 'monthly' | 'list';

export default function EnhancedAgendaPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState<AgendaViewType>('weekly');
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<any>({});

  // Calculate date ranges based on current view
  const { startDate, endDate } = useMemo(() => {
    switch (currentView) {
      case 'daily':
        return { startDate: currentDate, endDate: currentDate };
      case 'weekly':
        const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
        return { startDate: weekStart, endDate: addDays(weekStart, 6) };
      case 'monthly':
        return { startDate: startOfMonth(currentDate), endDate: endOfMonth(currentDate) };
      case 'list':
        const listStart = startOfWeek(currentDate, { weekStartsOn: 1 });
        return { startDate: listStart, endDate: addDays(listStart, 13) }; // 2 weeks
      default:
        const defaultStart = startOfWeek(currentDate, { weekStartsOn: 1 });
        return { startDate: defaultStart, endDate: addDays(defaultStart, 6) };
    }
  }, [currentDate, currentView]);

  const { appointments, refetch } = useAppointments(startDate, endDate);
  const { therapists } = useData();
  const { user } = useSupabaseAuth();
  const [patients] = useState<Patient[]>([]);
  const { showToast } = useToast();

  // Modal states
  const [appointmentToEdit, setAppointmentToEdit] = useState<EnrichedAppointment | null>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<EnrichedAppointment | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [initialFormData, setInitialFormData] = useState<{ date: Date, therapistId: string } | undefined>();
  
  // Drag & Drop states
  const [draggedAppointmentId, setDraggedAppointmentId] = useState<string | null>(null);

  // Filter appointments based on user role and search/filters
  const filteredAppointments = useMemo(() => {
    let filtered = appointments;

    // Filter by user role
    if (user?.role === Role.Therapist) {
      filtered = filtered.filter(app => app.therapistId === user.id);
    } else if (user?.role === Role.Patient) {
      filtered = filtered.filter(app => app.patientId === user.id);
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(app => 
        app.patientName.toLowerCase().includes(query) ||
        app.type.toLowerCase().includes(query) ||
        app.therapistName.toLowerCase().includes(query)
      );
    }

    // Apply other filters
    if (filters.therapistId) {
      filtered = filtered.filter(app => app.therapistId === filters.therapistId);
    }

    return filtered;
  }, [appointments, user, searchQuery, filters]);

  // Calculate stats
  const stats = useMemo(() => {
    const appointmentCount = filteredAppointments.length;
    const patientCount = new Set(filteredAppointments.map(app => app.patientId)).size;
    const totalValue = filteredAppointments.reduce((sum, app) => sum + (app.value || 0), 0);

    return {
      appointmentCount,
      patientCount,
      totalValue
    };
  }, [filteredAppointments]);

  // Loading effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [currentView, currentDate]);

  const handleAddAppointment = () => {
    setInitialFormData({ 
      date: currentDate, 
      therapistId: therapists[0]?.id || '' 
    });
    setIsFormOpen(true);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleFilter = (newFilters: any) => {
    setFilters(newFilters);
  };

  const handleSlotClick = (date: Date, time: string, therapistId?: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    const slotDate = new Date(date);
    slotDate.setHours(hours, minutes, 0, 0);

    setInitialFormData({
      date: slotDate,
      therapistId: therapistId || therapists[0]?.id || ''
    });
    setIsFormOpen(true);
  };

  const handleAppointmentClick = (appointment: EnrichedAppointment) => {
    setSelectedAppointment(appointment);
  };

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, appointment: EnrichedAppointment) => {
    setDraggedAppointmentId(appointment.id);
    e.dataTransfer.setData('text/plain', appointment.id);
  };

  const handleDragEnd = () => {
    setDraggedAppointmentId(null);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>, targetDate: Date, _therapistId: string) => {
    e.preventDefault();
    const appointmentId = e.dataTransfer.getData('text/plain');
    const appointment = appointments.find(app => app.id === appointmentId);

    if (!appointment) return;

    // Calculate new time based on drop position
    const rect = e.currentTarget.getBoundingClientRect();
    const clickY = e.clientY - rect.top;
    const minutesFromTop = clickY / 2; // 2 pixels per minute
    const snappedMinutes = Math.floor(minutesFromTop / 30) * 30; // 30-minute slots
    const hour = 7 + Math.floor(snappedMinutes / 60);
    const minute = snappedMinutes % 60;

    const newStartTime = new Date(targetDate);
    newStartTime.setHours(hour, minute, 0, 0);

    const duration = appointment.endTime.getTime() - appointment.startTime.getTime();
    new Date(newStartTime.getTime() + duration);

    try {
      // Update appointment
      await refetch();
      showToast('Agendamento movido com sucesso!', 'success');
    } catch (error) {
      showToast('Erro ao mover agendamento', 'error');
    }
  };

  const renderView = () => {
    if (isLoading) {
      return <AgendaSkeleton viewType={currentView} therapistCount={therapists.length} />;
    }

    if (filteredAppointments.length === 0) {
      return (
        <AgendaEmptyState
          viewType={currentView}
          onAddAppointment={handleAddAppointment}
          onClearFilters={() => {
            setSearchQuery('');
            setFilters({});
          }}
          hasFilters={!!searchQuery || Object.keys(filters).length > 0}
          date={currentDate}
        />
      );
    }

    switch (currentView) {
      case 'daily':
        return (
          <DailyView
            selectedDate={currentDate}
            appointments={filteredAppointments}
            therapists={therapists}
            onSlotClick={handleSlotClick}
            onAppointmentClick={handleAppointmentClick}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            draggedAppointmentId={draggedAppointmentId}
          />
        );
      
      case 'weekly':
        return (
          <ImprovedWeeklyView
            currentDate={currentDate}
            appointments={filteredAppointments}
            therapists={therapists}
            onSlotClick={handleSlotClick}
            onAppointmentClick={handleAppointmentClick}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            draggedAppointmentId={draggedAppointmentId}
          />
        );
      
      case 'monthly':
        return (
          <MonthlyView
            currentDate={currentDate}
            appointments={filteredAppointments}
            therapists={therapists}
            onDateClick={(date) => {
              setCurrentDate(date);
              setCurrentView('daily');
            }}
            onAppointmentClick={handleAppointmentClick}
          />
        );
      
      case 'list':
        return (
          <ListView
            appointments={filteredAppointments}
            therapists={therapists}
            onAppointmentClick={handleAppointmentClick}
          />
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Enhanced Header */}
      <EnhancedAgendaHeader
        currentDate={currentDate}
        viewType={currentView}
        onDateChange={setCurrentDate}
        onViewChange={setCurrentView}
        onAddAppointment={user?.role !== Role.Patient ? handleAddAppointment : undefined}
        onSearch={handleSearch}
        onFilter={handleFilter}
        appointmentCount={stats.appointmentCount}
        patientCount={stats.patientCount}
        totalValue={stats.totalValue}
        therapists={therapists.map(t => ({
          id: t.id,
          name: t.name,
          color: t.color
        }))}
      />

      {/* Main Content with ScrollArea */}
      <ScrollArea className="flex-1 px-4 pb-4">
        <div className="space-y-4">
          {renderView()}
        </div>
      </ScrollArea>

      {/* Modals */}
      {selectedAppointment && (
        <AppointmentDetailModal
          appointment={selectedAppointment}
          isOpen={!!selectedAppointment}
          onClose={() => setSelectedAppointment(null)}
          onEdit={(appointment) => {
            setAppointmentToEdit(appointment);
            setSelectedAppointment(null);
          }}
        />
      )}

      {appointmentToEdit && (
        <AppointmentFormModal
          appointment={appointmentToEdit}
          isOpen={!!appointmentToEdit}
          onClose={() => setAppointmentToEdit(null)}
          onSave={async () => {
            await refetch();
            setAppointmentToEdit(null);
            return true;
          }}
        />
      )}

      {isFormOpen && (
        <AppointmentFormModal
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          initialData={initialFormData}
          onSave={async () => {
            await refetch();
            setIsFormOpen(false);
            return true;
          }}
          onDelete={async () => {
            await refetch();
            setIsFormOpen(false);
            return true;
          }}
          patients={patients}
          therapists={therapists}
          allAppointments={appointments}
        />
      )}
    </div>
  );
}
