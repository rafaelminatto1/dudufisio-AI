import React, { useState, useEffect, useMemo } from 'react';
import { format, addDays, startOfWeek, addMonths, subMonths, startOfMonth, endOfMonth, setHours, setMinutes } from 'date-fns';
import { ptBR } from 'date-fns/locale/pt-BR';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import { useAppointments } from '../hooks/useAppointments';
import { EnrichedAppointment, Appointment, AppointmentStatus, Patient } from '../types';
import { useToast } from '../contexts/ToastContext';
import * as appointmentService from '../services/appointmentService';
import * as patientService from '../services/patientService';
import { useData } from '@/contexts/AppContext';
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext';
import { Role } from '../types';
import AppointmentDetailModal from '../components/AppointmentDetailModal';
import AppointmentFormModal from '../components/AppointmentFormModal';
import AgendaViewSelector, { AgendaViewType } from '../components/agenda/AgendaViewSelector';
import DailyView from '../components/agenda/DailyView';
import ImprovedWeeklyView from '../components/agenda/ImprovedWeeklyView';
import MonthlyView from '../components/agenda/MonthlyView';
import ListView from '../components/agenda/ListView';

// Constants for calendar
const PIXELS_PER_MINUTE = 2;
const START_HOUR = 6;

export default function AgendaPage() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [currentView, setCurrentView] = useState<AgendaViewType>('weekly');

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
    const [patients, setPatients] = useState<Patient[]>([]);
    const [, setIsLoadingData] = useState(true);
    const { showToast } = useToast();

    // Modal states
    const [appointmentToEdit, setAppointmentToEdit] = useState<EnrichedAppointment | null>(null);
    const [selectedAppointment, setSelectedAppointment] = useState<EnrichedAppointment | null>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [initialFormData, setInitialFormData] = useState<{ date: Date, therapistId: string } | undefined>();
    
    // Drag & Drop states
    const [draggedAppointmentId, setDraggedAppointmentId] = useState<string | null>(null);

    // Filter appointments based on user role
    const filteredAppointments = useMemo(() => {
        if (!user) return appointments;

        switch (user.role) {
            case Role.Patient:
                // Patients only see their own appointments
                return appointments.filter(appointment => appointment.patientId === user.patientId);

            case Role.EducadorFisico:
                // Educators only see appointments with their clients
                return appointments.filter(appointment => appointment.therapistId === user.id);

            case Role.Therapist:
            case Role.Admin:
            default:
                // Therapists and Admins see all appointments
                return appointments;
        }
    }, [appointments, user]);

    useEffect(() => {
        const fetchPatientsData = async () => {
            setIsLoadingData(true);
            try {
                const patientData = await patientService.getAllPatients();
                setPatients(patientData);
            } catch (error) {
                showToast('Falha ao carregar a lista de pacientes.', 'error');
            } finally {
                setIsLoadingData(false);
            }
        };
        fetchPatientsData();
    }, [showToast]);

    const handleSlotClick = (day: Date, time: string, therapistId: string) => {
        const [hour = '0', minute = '0'] = time.split(':');
        const clickedDate = setMinutes(setHours(day, parseInt(hour, 10)), parseInt(minute, 10));
        
        setInitialFormData({ date: clickedDate, therapistId });
        setAppointmentToEdit(null);
        setIsFormOpen(true);
    };
    
    const handleAppointmentClick = (appointment: EnrichedAppointment) => {
        setSelectedAppointment(appointment);
    };

    const handleEditClick = (appointment: EnrichedAppointment) => {
        setSelectedAppointment(null);
        setAppointmentToEdit(appointment);
        setInitialFormData(undefined);
        setIsFormOpen(true);
    };
    
    const handleSaveAppointment = async (appointmentData: Appointment): Promise<boolean> => {
        try {
            await appointmentService.saveAppointment(appointmentData);
            showToast('Consulta salva com sucesso!', 'success');
            refetch();
            setIsFormOpen(false);
            setAppointmentToEdit(null);
            return true;
        } catch (error) {
            showToast('Falha ao salvar a consulta.', 'error');
            return false;
        }
    };
    
    const handleDeleteAppointment = async (appointmentId: string, seriesId?: string): Promise<boolean> => {
        const appointmentToDelete = filteredAppointments.find(a => a.id === appointmentId);
        if (!appointmentToDelete) return false;
        
        const confirmed = window.confirm(seriesId ? 'Excluir esta e todas as futuras ocorrências?' : 'Tem certeza que deseja excluir este agendamento?');
        if (!confirmed) return false;
  
        try {
            if (seriesId) {
                await appointmentService.deleteAppointmentSeries(seriesId, appointmentToDelete.startTime);
            } else {
                await appointmentService.deleteAppointment(appointmentId);
            }
            showToast('Agendamento(s) removido(s) com sucesso!', 'success');
            refetch();
            setIsFormOpen(false);
            setAppointmentToEdit(null);
            setSelectedAppointment(null);
            return true;
        } catch {
            showToast('Falha ao remover agendamento(s).', 'error');
            return false;
        }
    };

    const handleStatusChange = async (appointment: Appointment, newStatus: AppointmentStatus) => {
        try {
            await appointmentService.saveAppointment({ ...appointment, status: newStatus });
            showToast('Status atualizado com sucesso!', 'success');
            refetch();
        } catch { showToast('Falha ao atualizar status.', 'error'); }
    };
  
    const handlePaymentStatusChange = async (appointment: Appointment, newStatus: 'paid' | 'pending') => {
        try {
            await appointmentService.saveAppointment({ ...appointment, paymentStatus: newStatus });
            showToast('Status do pagamento atualizado!', 'success');
            refetch();
        } catch { showToast('Falha ao atualizar pagamento.', 'error'); }
    };
    
    const handleUpdateValue = async (appointmentId: string, newValue: number) => {
        const appointment = filteredAppointments.find(a => a.id === appointmentId);
        if (appointment) {
            try {
                await appointmentService.saveAppointment({ ...appointment, value: newValue });
                showToast('Valor atualizado com sucesso!', 'success');
                refetch();
            } catch { showToast('Falha ao atualizar o valor.', 'error'); }
        }
    };
    
    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, appointment: EnrichedAppointment) => {
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData("application/json", JSON.stringify(appointment));
        setDraggedAppointmentId(appointment.id);
    };

    const handleDragEnd = () => setDraggedAppointmentId(null);
    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => e.preventDefault();
    
    const handleDrop = async (e: React.DragEvent<HTMLDivElement>, day: Date, therapistId: string) => {
        e.preventDefault();
        const appointmentData = JSON.parse(e.dataTransfer.getData("application/json")) as EnrichedAppointment;
        const columnEl = e.currentTarget;
        const rect = columnEl.getBoundingClientRect();
        const dropY = e.clientY - rect.top;

        const minutesFromTop = dropY / PIXELS_PER_MINUTE;
        const snappedMinutes = Math.round(minutesFromTop / 15) * 15;
        const newHour = START_HOUR + Math.floor(snappedMinutes / 60);
        const newMinute = snappedMinutes % 60;

        const newStartTime = setMinutes(setHours(day, newHour), newMinute);
        
        const duration = new Date(appointmentData.endTime).getTime() - new Date(appointmentData.startTime).getTime();
        const newEndTime = new Date(newStartTime.getTime() + duration);
        
        const updatedAppointment: Appointment = { ...appointmentData, startTime: newStartTime, endTime: newEndTime, therapistId };
        
        try {
            await appointmentService.saveAppointment(updatedAppointment);
            showToast('Agendamento movido!', 'success');
            refetch();
        } catch (error) {
            showToast('Falha ao mover agendamento.', 'error');
        } finally {
            setDraggedAppointmentId(null);
        }
    };

    const fullSelectedPatient = useMemo(() => patients.find(p => p.id === selectedAppointment?.patientId), [patients, selectedAppointment]);
    const selectedTherapistData = useMemo(() => therapists.find(t => t.id === selectedAppointment?.therapistId), [therapists, selectedAppointment]);

    // Navigation handlers
    const handlePrevious = () => {
        switch (currentView) {
            case 'daily':
                setCurrentDate(addDays(currentDate, -1));
                break;
            case 'weekly':
                setCurrentDate(addDays(currentDate, -7));
                break;
            case 'monthly':
                setCurrentDate(subMonths(currentDate, 1));
                break;
            case 'list':
                setCurrentDate(addDays(currentDate, -14));
                break;
        }
    };

    const handleNext = () => {
        switch (currentView) {
            case 'daily':
                setCurrentDate(addDays(currentDate, 1));
                break;
            case 'weekly':
                setCurrentDate(addDays(currentDate, 7));
                break;
            case 'monthly':
                setCurrentDate(addMonths(currentDate, 1));
                break;
            case 'list':
                setCurrentDate(addDays(currentDate, 14));
                break;
        }
    };

    const handleToday = () => {
        setCurrentDate(new Date());
    };

    const handleDateClick = (date: Date) => {
        setCurrentDate(date);
        if (currentView === 'monthly') {
            setCurrentView('daily');
        }
    };

    const getViewTitle = () => {
        switch (currentView) {
            case 'daily':
                return format(currentDate, "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR });
            case 'weekly':
                const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
                const weekEnd = addDays(weekStart, 6);
                return `${format(weekStart, "d 'de' MMMM", { locale: ptBR })} - ${format(weekEnd, "d 'de' MMMM yyyy", { locale: ptBR })}`;
            case 'monthly':
                return format(currentDate, "MMMM 'de' yyyy", { locale: ptBR });
            case 'list':
                return 'Lista de Agendamentos';
            default:
                return 'Agenda';
        }
    };

    const renderView = () => {
        const commonProps = {
            appointments: filteredAppointments,
            filteredAppointments,
            therapists,
            onAppointmentClick: handleAppointmentClick,
            onDragStart: handleDragStart,
            onDragEnd: handleDragEnd,
            onDragOver: handleDragOver,
            draggedAppointmentId
        };

        switch (currentView) {
            case 'daily':
                return (
                    <DailyView
                        {...commonProps}
                        selectedDate={currentDate}
                        onSlotClick={handleSlotClick}
                        onDrop={handleDrop}
                    />
                );
            case 'weekly':
                return (
                    <ImprovedWeeklyView
                        {...commonProps}
                        currentDate={currentDate}
                        onSlotClick={handleSlotClick}
                        onDrop={handleDrop}
                        onEdit={handleEditClick}
                        onDelete={(id) => handleDeleteAppointment(id)}
                        onStatusChange={handleStatusChange}
                        onPaymentStatusChange={handlePaymentStatusChange}
                    />
                );
            case 'monthly':
                return (
                    <MonthlyView
                        currentDate={currentDate}
                        appointments={filteredAppointments}
                        onDateClick={handleDateClick}
                        onPrevMonth={() => setCurrentDate(subMonths(currentDate, 1))}
                        onNextMonth={() => setCurrentDate(addMonths(currentDate, 1))}
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
        <div className="flex flex-col h-full bg-slate-50">
            <header className="p-4 bg-white rounded-t-2xl shadow-sm border-b z-20">
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center">
                        <div>
                            <h1 className="text-xl font-bold text-slate-800">Agenda da Clínica</h1>
                            <p className="text-sm text-slate-500">{getViewTitle()}</p>
                        </div>
                        <div className="flex items-center gap-2 mt-2 sm:mt-0">
                            <button onClick={handlePrevious} className="p-2 rounded-lg hover:bg-slate-100"><ChevronLeft size={20} /></button>
                            <button onClick={handleToday} className="px-4 py-2 text-sm font-semibold bg-white border border-slate-300 rounded-lg hover:bg-slate-50">Hoje</button>
                            <button onClick={handleNext} className="p-2 rounded-lg hover:bg-slate-100"><ChevronRight size={20} /></button>
                            {user?.role !== Role.Patient && (
                                <button onClick={() => { setInitialFormData({ date: new Date(), therapistId: therapists[0]?.id || '' }); setIsFormOpen(true); }} className="ml-4 px-4 py-2 text-sm font-medium text-white bg-sky-500 rounded-lg hover:bg-sky-600 flex items-center shadow-sm"><Plus size={16} className="mr-2"/>Agendar</button>
                            )}
                        </div>
                    </div>

                    <AgendaViewSelector
                        currentView={currentView}
                        onViewChange={setCurrentView}
                    />
                </div>
            </header>

            <div className="flex-1 flex flex-col overflow-hidden bg-white rounded-b-2xl shadow-sm p-4">
                {renderView()}
            </div>

            <AnimatePresence>
                {selectedAppointment && (
                    <AppointmentDetailModal 
                        appointment={selectedAppointment}
                        patient={fullSelectedPatient}
                        therapist={selectedTherapistData}
                        onClose={() => setSelectedAppointment(null)}
                        onEdit={() => handleEditClick(selectedAppointment)}
                        onDelete={handleDeleteAppointment}
                        onStatusChange={(app, status) => { handleStatusChange(app, status); setSelectedAppointment(null); }}
                        onPaymentStatusChange={(app, status) => { handlePaymentStatusChange(app, status); setSelectedAppointment(null); }}
                        onPackagePayment={() => showToast('Funcionalidade de pacote a ser implementada.', 'info')}
                        onUpdateValue={(id, val) => { handleUpdateValue(id, val); setSelectedAppointment(null); }}
                    />
                )}
                {isFormOpen && (
                    <AppointmentFormModal 
                        isOpen={isFormOpen}
                        onClose={() => { setIsFormOpen(false); setAppointmentToEdit(null); }}
                        onSave={handleSaveAppointment}
                        onDelete={handleDeleteAppointment}
                        appointmentToEdit={appointmentToEdit as Appointment || undefined}
                        initialData={initialFormData}
                        patients={patients}
                        therapists={therapists}
                        allAppointments={filteredAppointments}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}