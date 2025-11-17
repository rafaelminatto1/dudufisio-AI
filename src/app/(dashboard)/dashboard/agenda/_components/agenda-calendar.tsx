'use client';

import { useState } from 'react';
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

export function AgendaCalendar({ initialAppointments, patients, therapists }: AgendaCalendarProps) {
  const [view, setView] = useState<ViewType>('weekly');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [appointments, setAppointments] = useState(initialAppointments);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [conflictWarning, setConflictWarning] = useState<any>(null);

  const handleCreateAppointment = () => {
    setSelectedAppointment(null);
    setIsFormOpen(true);
  };

  const handleEditAppointment = (appointment: any) => {
    setSelectedAppointment(appointment);
    setIsFormOpen(true);
  };

  const handleSaveAppointment = async (formData: FormData) => {
    const { createAppointment, updateAppointment } = await import('../actions');
    
    let result;
    if (selectedAppointment) {
      result = await updateAppointment(selectedAppointment.id, formData);
    } else {
      result = await createAppointment(formData);
    }

    if (!result.success) {
      if (result.conflicts) {
        setConflictWarning(result.conflicts);
        return;
      }
      alert(result.error || 'Erro ao salvar agendamento');
      return;
    }

    setIsFormOpen(false);
    setSelectedAppointment(null);
    window.location.reload(); // TODO: Usar router.refresh() quando disponível
  };

  const handleDeleteAppointment = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este agendamento?')) return;

    const { deleteAppointment } = await import('../actions');
    const result = await deleteAppointment(id);

    if (!result.success) {
      alert(result.error || 'Erro ao excluir agendamento');
      return;
    }

    setAppointments(appointments.filter((a) => a.id !== id));
  };

  const handleAppointmentMove = async (appointmentId: string, newDate: Date, newTime: string) => {
    const appointment = appointments.find((a) => a.id === appointmentId);
    if (!appointment) return;

    const [hour, minute] = newTime.split(':').map(Number);
    const endTime = new Date(newDate);
    endTime.setHours(hour + 1, minute, 0, 0);

    const formData = new FormData();
    formData.append('patient_id', appointment.patient_id);
    formData.append('therapist_id', appointment.therapist_id);
    formData.append('start_time', newDate.toISOString());
    formData.append('end_time', endTime.toISOString());
    formData.append('status', appointment.status);

    const { updateAppointment } = await import('../actions');
    const result = await updateAppointment(appointmentId, formData);

    if (!result.success) {
      if (result.conflicts) {
        setConflictWarning(result.conflicts);
      } else {
        alert(result.error || 'Erro ao mover agendamento');
      }
      return;
    }

    // Atualizar lista local
    setAppointments(
      appointments.map((a) =>
        a.id === appointmentId
          ? { ...a, start_time: newDate.toISOString(), end_time: endTime.toISOString() }
          : a
      )
    );
  };

  const renderView = () => {
    switch (view) {
      case 'daily':
        return (
          <DailyView
            date={currentDate}
            appointments={appointments}
            onAppointmentClick={handleEditAppointment}
            onSlotClick={handleCreateAppointment}
          />
        );
      case 'weekly':
        return (
          <WeeklyView
            startDate={currentDate}
            appointments={appointments}
            onAppointmentClick={handleEditAppointment}
            onSlotClick={handleCreateAppointment}
            onAppointmentMove={handleAppointmentMove}
          />
        );
      case 'monthly':
        return (
          <MonthlyView
            month={currentDate}
            appointments={appointments}
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
            appointments={appointments}
            onAppointmentClick={handleEditAppointment}
            onDelete={handleDeleteAppointment}
          />
        );
    }
  };

  return (
    <>
      <Card className="h-full">
        <div className="border-b p-4">
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <Button
                variant={view === 'daily' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setView('daily')}
              >
                <Calendar className="mr-2 h-4 w-4" />
                Diária
              </Button>
              <Button
                variant={view === 'weekly' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setView('weekly')}
              >
                <CalendarDays className="mr-2 h-4 w-4" />
                Semanal
              </Button>
              <Button
                variant={view === 'monthly' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setView('monthly')}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                Mensal
              </Button>
              <Button
                variant={view === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setView('list')}
              >
                <List className="mr-2 h-4 w-4" />
                Lista
              </Button>
            </div>
            <Button onClick={handleCreateAppointment}>Novo Agendamento</Button>
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

