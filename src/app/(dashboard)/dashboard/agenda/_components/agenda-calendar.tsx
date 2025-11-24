'use client';

import { useState, useOptimistic, useTransition } from 'react';
import { Calendar, CalendarDays, List, Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '~/components/ui/button';
import { Card } from '~/components/ui/card';
import { DailyView } from './daily-view';
import { WeeklyView } from './weekly-view';
import { MonthlyView } from './monthly-view';
import { ListView } from './list-view';
import { AppointmentFormModal } from './appointment-form-modal';
import { ConflictWarningDialog } from './conflict-warning-dialog';

export type ViewType = 'daily' | 'weekly' | 'monthly' | 'list';

interface AgendaCalendarProps {
  initialAppointments: any[];
  patients: any[];
  therapists: any[];
}

type OptimisticAction =
  | { type: 'create'; appointment: any }
  | { type: 'update'; appointment: any }
  | { type: 'delete'; id: string }
  | { type: 'move'; id: string; startTime: string; endTime: string };

export function AgendaCalendar({ initialAppointments, patients, therapists }: AgendaCalendarProps) {
  const [view, setView] = useState<ViewType>('weekly');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [conflictWarning, setConflictWarning] = useState<any>(null);
  const [isPending, startTransition] = useTransition();

  // React 19 useOptimistic - Atualização instantânea de UI
  const [optimisticAppointments, updateOptimisticAppointments] = useOptimistic(
    initialAppointments,
    (state: any[], action: OptimisticAction) => {
      switch (action.type) {
        case 'create':
          return [...state, action.appointment];
        case 'update':
          return state.map((apt) =>
            apt.id === action.appointment.id ? action.appointment : apt
          );
        case 'delete':
          return state.filter((apt) => apt.id !== action.id);
        case 'move':
          return state.map((apt) =>
            apt.id === action.id
              ? { ...apt, start_time: action.startTime, end_time: action.endTime }
              : apt
          );
        default:
          return state;
      }
    }
  );

  const handleCreateAppointment = () => {
    setSelectedAppointment(null);
    setIsFormOpen(true);
  };

  const handleEditAppointment = (appointment: any) => {
    setSelectedAppointment(appointment);
    setIsFormOpen(true);
  };

  const handleSaveAppointment = async (formData: FormData) => {
    // Criar objeto temporário para atualização otimista
    const tempAppointment = {
      id: selectedAppointment?.id || `temp-${Date.now()}`,
      patient_id: formData.get('patient_id') as string,
      therapist_id: formData.get('therapist_id') as string,
      start_time: formData.get('start_time') as string,
      end_time: formData.get('end_time') as string,
      status: formData.get('status') as string || 'scheduled',
      notes: formData.get('notes') as string,
    };

    // 1. Atualização otimista - UI atualiza IMEDIATAMENTE
    startTransition(() => {
      if (selectedAppointment) {
        updateOptimisticAppointments({
          type: 'update',
          appointment: tempAppointment,
        });
      } else {
        updateOptimisticAppointments({
          type: 'create',
          appointment: tempAppointment,
        });
      }
    });

    // 2. Fechar modal imediatamente (melhor UX)
    setIsFormOpen(false);
    setSelectedAppointment(null);

    // 3. Atualização real no servidor
    try {
      const { createAppointment, updateAppointment } = await import('../actions');

      let result;
      if (selectedAppointment) {
        result = await updateAppointment(selectedAppointment.id, formData);
      } else {
        result = await createAppointment(formData);
      }

      if (!result.success) {
        // React reverte automaticamente a mudança otimista
        if (result.conflicts) {
          setConflictWarning(result.conflicts);
        } else {
          alert(result.error || 'Erro ao salvar agendamento');
        }
        return;
      }

      // Sucesso! A mudança otimista permanece
    } catch (error) {
      // React reverte automaticamente em caso de erro
      console.error('Erro ao salvar agendamento:', error);
      alert('Erro ao salvar agendamento');
    }
  };

  const handleDeleteAppointment = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este agendamento?')) return;

    // 1. Atualização otimista - Remove da UI IMEDIATAMENTE
    startTransition(() => {
      updateOptimisticAppointments({ type: 'delete', id });
    });

    // 2. Deleção real no servidor
    try {
      const { deleteAppointment } = await import('../actions');
      const result = await deleteAppointment(id);

      if (!result.success) {
        // React reverte automaticamente
        alert(result.error || 'Erro ao excluir agendamento');
      }
    } catch (error) {
      console.error('Erro ao excluir:', error);
      alert('Erro ao excluir agendamento');
    }
  };

  const handleAppointmentMove = async (appointmentId: string, newDate: Date, newTime: string) => {
    const appointment = optimisticAppointments.find((a) => a.id === appointmentId);
    if (!appointment) return;

    const [hour, minute] = newTime.split(':').map(Number);
    const endTime = new Date(newDate);
    endTime.setHours(hour + 1, minute, 0, 0);

    const startTimeISO = newDate.toISOString();
    const endTimeISO = endTime.toISOString();

    // 1. Atualização otimista - Move IMEDIATAMENTE
    startTransition(() => {
      updateOptimisticAppointments({
        type: 'move',
        id: appointmentId,
        startTime: startTimeISO,
        endTime: endTimeISO,
      });
    });

    // 2. Atualização real no servidor
    try {
      const formData = new FormData();
      formData.append('patient_id', appointment.patient_id);
      formData.append('therapist_id', appointment.therapist_id);
      formData.append('start_time', startTimeISO);
      formData.append('end_time', endTimeISO);
      formData.append('status', appointment.status);

      const { updateAppointment } = await import('../actions');
      const result = await updateAppointment(appointmentId, formData);

      if (!result.success) {
        // React reverte automaticamente
        if (result.conflicts) {
          setConflictWarning(result.conflicts);
        } else {
          alert(result.error || 'Erro ao mover agendamento');
        }
      }
    } catch (error) {
      console.error('Erro ao mover:', error);
      alert('Erro ao mover agendamento');
    }
  };

  const renderView = () => {
    switch (view) {
      case 'daily':
        return (
          <DailyView
            date={currentDate}
            appointments={optimisticAppointments}
            onAppointmentClick={handleEditAppointment}
            onSlotClick={handleCreateAppointment}
          />
        );
      case 'weekly':
        return (
          <WeeklyView
            startDate={currentDate}
            appointments={optimisticAppointments}
            onAppointmentClick={handleEditAppointment}
            onSlotClick={handleCreateAppointment}
            onAppointmentMove={handleAppointmentMove}
          />
        );
      case 'monthly':
        return (
          <MonthlyView
            month={currentDate}
            appointments={optimisticAppointments}
            onAppointmentClick={handleEditAppointment}
            onDateClick={(date) => {
              setCurrentDate(date);
              setView('daily');
            }}
          />
        );
      case 'list':
        return (
          <ListView
            appointments={optimisticAppointments}
            onAppointmentClick={handleEditAppointment}
            onDelete={handleDeleteAppointment}
          />
        );
    }
  };

  return (
    <>
      <Card className={`h-full ${isPending ? 'opacity-70' : 'opacity-100'} transition-opacity`}>
        <div className="border-b p-4">
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <Button
                variant={view === 'daily' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setView('daily')}
                disabled={isPending}
              >
                <Calendar className="mr-2 h-4 w-4" />
                Diária
              </Button>
              <Button
                variant={view === 'weekly' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setView('weekly')}
                disabled={isPending}
              >
                <CalendarDays className="mr-2 h-4 w-4" />
                Semanal
              </Button>
              <Button
                variant={view === 'monthly' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setView('monthly')}
                disabled={isPending}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                Mensal
              </Button>
              <Button
                variant={view === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setView('list')}
                disabled={isPending}
              >
                <List className="mr-2 h-4 w-4" />
                Lista
              </Button>
            </div>
            <Button onClick={handleCreateAppointment} disabled={isPending}>
              {isPending ? 'Salvando...' : 'Novo Agendamento'}
            </Button>
          </div>
        </div>
        <div className="h-[calc(100vh-300px)] overflow-auto">{renderView()}</div>
      </Card>

      <AppointmentFormModal
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        appointment={selectedAppointment}
        patients={patients}
        therapists={therapists}
        onSave={handleSaveAppointment}
        onConflict={setConflictWarning}
      />

      {conflictWarning && (
        <ConflictWarningDialog
          open={!!conflictWarning}
          onOpenChange={() => setConflictWarning(null)}
          conflicts={conflictWarning}
        />
      )}
    </>
  );
}

