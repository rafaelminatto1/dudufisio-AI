import React, { useState, useEffect, useMemo, useCallback } from 'react';
import format from 'date-fns/format';
import addDays from 'date-fns/addDays';
import startOfWeek from 'date-fns/startOfWeek';
import addMonths from 'date-fns/addMonths';
import subMonths from 'date-fns/subMonths';
import startOfMonth from 'date-fns/startOfMonth';
import endOfMonth from 'date-fns/endOfMonth';
import setHours from 'date-fns/setHours';
import setMinutes from 'date-fns/setMinutes';
import { ptBR } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, ArrowLeft } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import { Button } from '../components/ui/button';
import { useAppointments } from '../hooks/useAppointments';
import { EnrichedAppointment, Appointment, AppointmentStatus, Patient, SchedulingAlert, WaitlistEntry } from '../types';
import { useToast } from '../contexts/ToastContext';
import * as appointmentService from '../services/appointmentService';
import * as patientService from '../services/patientService';
import { useData } from '../contexts/AppContext';
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext';
import { Role } from '../types';
import AppointmentDetailModal from '../components/AppointmentDetailModal';
import AppointmentFormModal from '../components/AppointmentFormModal';
import AgendaViewSelector, { AgendaViewType } from '../components/agenda/AgendaViewSelector';
import WaitlistCompactBanner from '../components/agenda/WaitlistCompactBanner';
import WaitlistModal from '../components/agenda/WaitlistModal';
import SimpleWaitlistModal from '../components/agenda/SimpleWaitlistModal';
import WaitlistManagerDialog from '../components/agenda/WaitlistManagerDialog';
import LoadingAnnouncer from '../components/ui/LoadingAnnouncer';
import WaitlistEditDialog from '../components/agenda/WaitlistEditDialog';
import ScheduleBlocksManager from '../components/agenda/ScheduleBlocksManager';
import AgendaStats from '../components/agenda/AgendaStats';
import KeyboardShortcutsHelp from '../components/agenda/KeyboardShortcutsHelp';
import AdvancedFilters, { FilterState } from '../components/agenda/AdvancedFilters';
import SmartSearch from '../components/agenda/SmartSearch';
import NotificationCenter from '../components/agenda/NotificationCenter';
import QuickAddPatientDialog from '../components/agenda/QuickAddPatientDialog';
import AgendaToolbar from '../components/agenda/AgendaToolbar';
import { waitlistService } from '../services/waitlistService';
// Removido: listActiveAlerts - não usamos mais alertas
import DailyView from '../components/agenda/DailyView';
import ImprovedWeeklyView from '../components/agenda/ImprovedWeeklyView';
import MonthlyView from '../components/agenda/MonthlyView';
import ListView from '../components/agenda/ListView';
import { useLocation, useNavigate } from 'react-router-dom';
import SessionFormPage from './SessionFormPage';
import ResponsiveContainer from '../components/ui/ResponsiveContainer';
import { useAgendaHotkeys } from '../hooks/useAgendaHotkeys';
import { useDebounce } from '../hooks/useDebounce';
import { useIsMobile } from '../hooks/useMediaQuery';
import MobileAgendaView from '../components/agenda/MobileAgendaView';

// Constants for calendar
const PIXELS_PER_MINUTE = 2;
const START_HOUR = 6;
export default function AgendaPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const locationState = location.state as { patientId?: string } | null;
    const [currentDate, setCurrentDate] = useState(new Date());
    const [currentView, setCurrentView] = useState<AgendaViewType>('weekly');
    const [showSessionForm, setShowSessionForm] = useState(false);
    const [selectedAppointmentForSession, setSelectedAppointmentForSession] = useState<EnrichedAppointment | null>(null);

    // Calculate date ranges based on current view
    const { startDate, endDate } = useMemo(() => {
        switch (currentView) {
            case 'daily': {
                return { startDate: currentDate, endDate: currentDate };
            }
            case 'weekly': {
                const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
                return { startDate: weekStart, endDate: addDays(weekStart, 6) };
            }
            case 'monthly': {
                return { startDate: startOfMonth(currentDate), endDate: endOfMonth(currentDate) };
            }
            case 'list': {
                const listStart = startOfWeek(currentDate, { weekStartsOn: 1 });
                return { startDate: listStart, endDate: addDays(listStart, 13) }; // 2 weeks
            }
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
    const [waitlistEntries, setWaitlistEntries] = useState<WaitlistEntry[]>([]);
    const [isWaitlistModalOpen, setIsWaitlistModalOpen] = useState(false);
    const [isWaitlistManagerOpen, setIsWaitlistManagerOpen] = useState(false);
    const [isWaitlistEditOpen, setIsWaitlistEditOpen] = useState(false);
    const [selectedWaitlistEntry, setSelectedWaitlistEntry] = useState<WaitlistEntry | null>(null);
    const [isScheduleBlocksOpen, setIsScheduleBlocksOpen] = useState(false);
    const [isKeyboardHelpOpen, setIsKeyboardHelpOpen] = useState(false);
    const [showQuickAddPatient, setShowQuickAddPatient] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const debouncedSearchQuery = useDebounce(searchQuery, 300);
    const isMobile = useIsMobile();
    const [showFilters, setShowFilters] = useState(false);
    const [advancedFilters, setAdvancedFilters] = useState<FilterState>({
        status: [],
        types: [],
        therapists: [],
        patients: [],
        paymentStatus: [],
        showConflicts: false
    });
    const { showToast } = useToast();

    // Modal states
    const [appointmentToEdit, setAppointmentToEdit] = useState<EnrichedAppointment | null>(null);
    const [selectedAppointment, setSelectedAppointment] = useState<EnrichedAppointment | null>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [initialFormData, setInitialFormData] = useState<{ date: Date; therapistId: string } | undefined>();
    const [highlightedPatientId, setHighlightedPatientId] = useState<string | null>(null);
    
    // Drag & Drop states
    const [draggedAppointmentId, setDraggedAppointmentId] = useState<string | null>(null);

    // Filter appointments based on user role, search and advanced filters
    const filteredAppointments = useMemo(() => {
        let scopedAppointments = appointments;

        if (user) {
            switch (user.role) {
                case Role.Patient:
                    scopedAppointments = scopedAppointments.filter(appointment => appointment.patientId === user.patientId);
                    break;
                case Role.EducadorFisico:
                    scopedAppointments = scopedAppointments.filter(appointment => appointment.therapistId === user.id);
                    break;
                case Role.Therapist:
                case Role.Admin:
                default:
                    break;
            }
        }

        if (highlightedPatientId) {
            scopedAppointments = scopedAppointments.filter(appointment => appointment.patientId === highlightedPatientId);
        }

        // Search filter (usando debounced query)
        if (debouncedSearchQuery) {
            const query = debouncedSearchQuery.toLowerCase();
            scopedAppointments = scopedAppointments.filter(appointment =>
                appointment.patientName.toLowerCase().includes(query) ||
                appointment.therapistName?.toLowerCase().includes(query) ||
                appointment.type.toLowerCase().includes(query)
            );
        }

        // Advanced filters
        if (advancedFilters.status.length > 0) {
            scopedAppointments = scopedAppointments.filter(appointment => 
                advancedFilters.status.includes(appointment.status)
            );
        }

        if (advancedFilters.types.length > 0) {
            scopedAppointments = scopedAppointments.filter(appointment => 
                advancedFilters.types.includes(appointment.type)
            );
        }

        if (advancedFilters.therapists.length > 0) {
            scopedAppointments = scopedAppointments.filter(appointment => 
                advancedFilters.therapists.includes(appointment.therapistId)
            );
        }

        if (advancedFilters.patients.length > 0) {
            scopedAppointments = scopedAppointments.filter(appointment => 
                advancedFilters.patients.includes(appointment.patientId)
            );
        }

        if (advancedFilters.paymentStatus.length > 0) {
            scopedAppointments = scopedAppointments.filter(appointment => 
                advancedFilters.paymentStatus.includes(appointment.paymentStatus)
            );
        }

        if (advancedFilters.showConflicts) {
            scopedAppointments = scopedAppointments.filter(appointment => appointment.hasConflict);
        }

        return scopedAppointments;
    }, [appointments, user, highlightedPatientId, debouncedSearchQuery, advancedFilters]);

    // Count conflicts
    const conflictsCount = useMemo(() => {
        return filteredAppointments.filter(a => a.hasConflict).length;
    }, [filteredAppointments]);

    const refreshWaitlist = useCallback(async () => {
        try {
            const waitlistData = await waitlistService.listEntries('waiting');
            setWaitlistEntries(waitlistData);
        } catch (error) {
            console.error('Erro ao atualizar lista de espera:', error);
        }
    }, []);

    useEffect(() => {
        const fetchInitialData = async () => {
            setIsLoadingData(true);
            try {
                const [patientData, waitlistData] = await Promise.all([
                    patientService.getAllPatients(),
                    waitlistService.listEntries('waiting'),
                ]);
                setPatients(patientData);
                setWaitlistEntries(waitlistData);
            } catch (error) {
                console.error('Erro ao carregar dados iniciais:', error);
                showToast('Falha ao carregar dados de suporte da agenda.', 'error');
            } finally {
                setIsLoadingData(false);
            }
        };
        fetchInitialData();
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
            refreshWaitlist();
            setIsFormOpen(false);
            setAppointmentToEdit(null);
            return true;
        } catch (error) {
            console.error('Erro ao salvar consulta:', error);
            showToast('Falha ao salvar a consulta.', 'error');
            return false;
        }
    };
    
    const handleDeleteAppointment = async (appointmentId: string, seriesId?: string): Promise<boolean> => {
        const appointmentToDelete = filteredAppointments.find(a => a.id === appointmentId);
        if (!appointmentToDelete) return false;
        
        // eslint-disable-next-line no-alert
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
            refreshWaitlist();
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

    const handleStartSession = useCallback((appointment: EnrichedAppointment) => {
        
        setSelectedAppointment(null); // Fecha o modal
        navigate(`/atendimento/${appointment.id}`);
    }, [navigate]);

    const handleBackToAgenda = useCallback(() => {
        setShowSessionForm(false);
        setSelectedAppointmentForSession(null);
    }, []);
    
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

        // Snap-to-grid de 30 minutos
        const minutesFromTop = dropY / PIXELS_PER_MINUTE;
        const snappedMinutes = Math.round(minutesFromTop / 30) * 30;
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
            console.error('Erro ao mover agendamento:', error);
            showToast('Falha ao mover agendamento.', 'error');
        } finally {
            setDraggedAppointmentId(null);
        }
    };

    // Funções para lista de espera
    const handleAddToWaitlist = async (entryData: Omit<WaitlistEntry, 'id' | 'createdAt' | 'updatedAt'>) => {
        await waitlistService.addEntry(entryData);
        await refreshWaitlist();
    };

    const handleViewWaitlist = () => {
        setIsWaitlistManagerOpen(true);
    };

    const handleEditWaitlistEntry = (entry: WaitlistEntry) => {
        setSelectedWaitlistEntry(entry);
        setIsWaitlistEditOpen(true);
    };

    const handleDeleteWaitlistEntry = async (entryId: string) => {
        if (window.confirm('Tem certeza que deseja remover esta entrada da lista de espera?')) {
            try {
                await waitlistService.removeEntry(entryId);
                showToast('Entrada removida com sucesso!', 'success');
                await refreshWaitlist();
            } catch (error) {
                showToast('Erro ao remover entrada', 'error');
            }
        }
    };

    const handleSavePatient = async (patientData: Omit<Patient, 'id' | 'code' | 'age' | 'bmi' | 'created_at' | 'updated_at'>): Promise<Patient> => {
        // TODO: Implementar salvamento de paciente
        const newPatient: Patient = {
            ...patientData,
            id: `patient_${Date.now()}`,
            code: `PAC-${Date.now().toString().slice(-6)}`,
            age: patientData.birthDate ? new Date().getFullYear() - new Date(patientData.birthDate).getFullYear() : undefined,
            bmi: patientData.height && patientData.weight ? (patientData.weight / ((patientData.height / 100) ** 2)) : undefined,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        return newPatient;
    };

    const handleSelectPatient = (patient: Patient) => {
        setPatients(prev => [...prev, patient]);
        setShowQuickAddPatient(false);
    };

    const handleScheduleFromWaitlist = (entry: WaitlistEntry) => {
        const patient = patients.find(p => p.id === entry.patientId);
        if (!patient) {
            showToast('Paciente não encontrado', 'error');
            return;
        }

        // Preencher dados iniciais do formulário baseado na lista de espera
        const initialData: { date: Date; therapistId: string; patientId: string } = {
            date: entry.preferredStartFrom ? new Date(entry.preferredStartFrom) : new Date(),
            therapistId: entry.therapistId || '',
            patientId: entry.patientId
        };

        setInitialFormData(initialData);
        setIsFormOpen(true);
        
        // Fechar modal da lista de espera se estiver aberto
        setIsWaitlistModalOpen(false);
        
        showToast(`Abrindo agendamento para ${patient.name}`, 'info');
    };

    const fullSelectedPatient = useMemo(() => patients.find(p => p.id === selectedAppointment?.patientId), [patients, selectedAppointment]);
    const selectedTherapistData = useMemo(() => therapists.find(t => t.id === selectedAppointment?.therapistId), [therapists, selectedAppointment]);
    const highlightedPatient = useMemo(
        () => (highlightedPatientId ? patients.find(patient => patient.id === highlightedPatientId) : null),
        [patients, highlightedPatientId]
    );

    useEffect(() => {
        if (locationState?.patientId) {
            setHighlightedPatientId(locationState.patientId);
            navigate(location.pathname, { replace: true, state: {} });
        }
    }, [locationState, location.pathname, navigate]);

    // Navigation handlers - MUST be defined before useAgendaHotkeys
    const handlePrevious = useCallback(() => {
        switch (currentView) {
            case 'daily': {
                setCurrentDate(addDays(currentDate, -1));
                break;
            }
            case 'weekly': {
                setCurrentDate(addDays(currentDate, -7));
                break;
            }
            case 'monthly': {
                setCurrentDate(subMonths(currentDate, 1));
                break;
            }
            case 'list': {
                setCurrentDate(addDays(currentDate, -14));
                break;
            }
        }
    }, [currentView, currentDate]);

    const handleNext = useCallback(() => {
        switch (currentView) {
            case 'daily': {
                setCurrentDate(addDays(currentDate, 1));
                break;
            }
            case 'weekly': {
                setCurrentDate(addDays(currentDate, 7));
                break;
            }
            case 'monthly': {
                setCurrentDate(addMonths(currentDate, 1));
                break;
            }
            case 'list': {
                setCurrentDate(addDays(currentDate, 14));
                break;
            }
        }
    }, [currentView, currentDate]);

    const handleToday = useCallback(() => {
        setCurrentDate(new Date());
    }, []);

    // Keyboard shortcuts
    useAgendaHotkeys({
        onNewAppointment: () => {
            setInitialFormData({ date: new Date(), therapistId: therapists[0]?.id || '' });
            setIsFormOpen(true);
        },
        onToday: handleToday,
        onPrevious: handlePrevious,
        onNext: handleNext,
        onCloseModal: () => {
            if (isFormOpen) setIsFormOpen(false);
            if (selectedAppointment) setSelectedAppointment(null);
            if (isWaitlistModalOpen) setIsWaitlistModalOpen(false);
            if (isWaitlistManagerOpen) setIsWaitlistManagerOpen(false);
            if (isScheduleBlocksOpen) setIsScheduleBlocksOpen(false);
        },
        onToggleFilters: () => setShowFilters(!showFilters),
        onViewWaitlist: handleViewWaitlist,
        onManageBlocks: () => setIsScheduleBlocksOpen(true),
        onShowHelp: () => setIsKeyboardHelpOpen(true),
        onViewChange: (view) => setCurrentView(view),
        enabled: !showSessionForm
    });

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
                        therapists={therapists}
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
        <main className="flex flex-col h-full bg-slate-50/50" data-testid="agenda-page" role="main">
            <LoadingAnnouncer 
                isLoading={isLoading} 
                message="Carregando agenda..."
            />
            {/* Compact Professional Header */}
            <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-slate-200/60 shadow-sm">
                <ResponsiveContainer className="py-3">
                    <div className="flex flex-col space-y-3">
                        {/* Top Row: Title and Navigation */}
                        <div className="flex items-center justify-between">
                            <div className="flex-1 flex flex-col gap-2 min-w-0">
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-2">
                                        <CalendarIcon className="w-4 h-4 text-blue-600" />
                                        <h1 className="text-base sm:text-lg font-semibold text-slate-900">Agenda</h1>
                                    </div>
                                    <div className="text-sm text-slate-600 font-medium truncate hidden sm:block">
                                        {getViewTitle()}
                                    </div>
                                </div>
                            {highlightedPatient && (
                                <div className="flex items-center justify-between rounded-md border border-sky-100 bg-sky-50 px-3 py-2 text-sm text-sky-700">
                                    <span>
                                        Mostrando agendamentos de <strong>{highlightedPatient.name}</strong>.
                                    </span>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-7 px-2 text-xs text-sky-700 hover:bg-sky-100"
                                        onClick={() => setHighlightedPatientId(null)}
                                    >
                                        Ver todos
                                    </Button>
                                </div>
                            )}
                            <WaitlistCompactBanner 
                                waitlistEntries={waitlistEntries}
                                patients={patients}
                                onAddToWaitlist={() => setIsWaitlistModalOpen(true)}
                                onViewWaitlist={handleViewWaitlist}
                                onScheduleFromWaitlist={handleScheduleFromWaitlist}
                            />

                            {/* Notification Center */}
                            <NotificationCenter />
                            
                            {/* Agenda Toolbar */}
                            <AgendaToolbar
                                onNewAppointment={() => {
                                    setInitialFormData({ date: new Date(), therapistId: therapists[0]?.id || '' });
                                    setIsFormOpen(true);
                                }}
                                onViewWaitlist={handleViewWaitlist}
                                onManageBlocks={() => setIsScheduleBlocksOpen(true)}
                                onToggleFilters={() => setShowFilters(!showFilters)}
                                onSearch={(query) => setSearchQuery(query)}
                                searchQuery={searchQuery}
                                totalAppointments={filteredAppointments.length}
                                conflictsCount={conflictsCount}
                                waitlistCount={waitlistEntries.length}
                                showFilters={showFilters}
                            />
                        </div>

                            {/* Navigation Controls */}
                            <div className="flex items-center gap-2">
                                <div className="flex items-center rounded-md border border-slate-200 bg-white">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={handlePrevious}
                                        className="touch-target p-0 hover:bg-slate-50"
                                    >
                                        <ChevronLeft className="w-3.5 h-3.5" />
                                    </Button>
                                    <div className="h-4 w-px bg-slate-200" />
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleToday}
                                        className="touch-target px-2 text-xs font-medium hover:bg-slate-50 hidden sm:block"
                                    >
                                        Hoje
                                    </Button>
                                    <div className="h-4 w-px bg-slate-200 hidden sm:block" />
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleNext}
                                        className="touch-target p-0 hover:bg-slate-50"
                                    >
                                        <ChevronRight className="w-3.5 h-3.5" />
                                    </Button>
                                </div>

                                {/* Add appointment button */}
                                {user?.role !== Role.Patient && (
                                    <Button
                                        onClick={() => {
                                            setInitialFormData({ date: new Date(), therapistId: therapists[0]?.id || '' });
                                            setIsFormOpen(true);
                                        }}
                                        size="sm"
                                        className="btn-responsive bg-blue-600 hover:bg-blue-700 text-white"
                                    >
                                        <Plus className="w-3.5 h-3.5 mr-1" />
                                        <span className="hidden sm:inline">Agendar</span>
                                        <span className="sm:hidden">Novo</span>
                                    </Button>
                                )}
                            </div>
                        </div>

                        {/* Bottom Row: View Selector and Mobile Date */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-3 border-t border-slate-200/60">
                            <AgendaViewSelector
                                currentView={currentView}
                                onViewChange={setCurrentView}
                            />
                            
                            {/* Mobile Date Display */}
                            <div className="sm:hidden flex justify-center w-full">
                                <button
                                    onClick={handleToday}
                                    className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors touch-target"
                                >
                                    {format(currentDate, 'dd/MM/yyyy', { locale: ptBR })}
                                </button>
                            </div>
                        </div>
                    </div>
                </ResponsiveContainer>

            </header>

            {/* Main content area - professional styling */}
            {/* Renderizar mobile view se for mobile */}
            {isMobile ? (
                <MobileAgendaView
                    appointments={filteredAppointments}
                    currentDate={currentDate}
                    therapists={therapists}
                    onDateChange={setCurrentDate}
                    onAppointmentClick={(appointment) => {
                        setSelectedAppointment(appointment);
                        setIsDetailOpen(true);
                    }}
                    onNewAppointment={() => {
                        setInitialFormData({ date: new Date(), therapistId: therapists[0]?.id || '' });
                        setIsFormOpen(true);
                    }}
                    onWaitlist={handleViewWaitlist}
                    onCheckIn={() => {
                        showToast('Check-in rápido em breve', 'info');
                    }}
                    onFilters={() => setShowFilters(!showFilters)}
                    onEdit={(appointment) => {
                        setAppointmentToEdit(appointment as EnrichedAppointment);
                        setIsFormOpen(true);
                    }}
                    onDelete={(appointment) => handleDeleteAppointment(appointment.id)}
                    onCall={(appointment) => {
                        if (appointment.patientPhone) {
                            window.open(`tel:${appointment.patientPhone}`);
                        }
                    }}
                    onMarkComplete={(appointment) => {
                        handleStatusChange(appointment.id, 'completed' as AppointmentStatus);
                    }}
                    onMarkPaid={(appointment) => {
                        handlePaymentChange(appointment.id, 'paid');
                    }}
                    notificationCount={notificationService.getUnreadCount()}
                />
            ) : (
                <div className="flex-1 overflow-auto bg-white">
                {showSessionForm && selectedAppointmentForSession ? (
                    <div className="h-full">
                        <div className="flex items-center justify-between p-4 border-b bg-slate-50">
                            <Button
                                onClick={handleBackToAgenda}
                                variant="outline"
                                size="sm"
                                className="flex items-center gap-2"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Voltar para Agenda
                            </Button>
                            <h2 className="text-lg font-semibold text-slate-800">
                                Formulário de Sessão - {selectedAppointmentForSession.patientName}
                            </h2>
                        </div>
                        <SessionFormPage
                            appointmentId={selectedAppointmentForSession.id}
                            onClose={handleBackToAgenda}
                        />
                    </div>
                ) : (
                    <div className="h-full px-2 pr-6">
                        {/* Agenda Stats */}
                        <div className="mb-6">
                            <AgendaStats 
                                appointments={filteredAppointments}
                                therapists={therapists}
                            />
                        </div>

                        {/* Advanced Filters */}
                        {showFilters && (
                            <div className="mb-4">
                                <AdvancedFilters
                                    therapists={therapists}
                                    patients={patients}
                                    onFilterChange={setAdvancedFilters}
                                />
                            </div>
                        )}
                        
                        {/* Calendar View */}
                        {renderView()}
                    </div>
                )}
                </div>
            )}

            <AnimatePresence>
                {selectedAppointment && (
                    <AppointmentDetailModal 
                        appointment={selectedAppointment}
                        patient={fullSelectedPatient}
                        therapist={selectedTherapistData}
                        onClose={() => setSelectedAppointment(null)}
                        onEdit={() => handleEditClick(selectedAppointment)}
                        onDelete={handleDeleteAppointment}
                        onStatusChange={handleStatusChange}
                        onPaymentStatusChange={handlePaymentStatusChange}
                        onPackagePayment={() => showToast('Funcionalidade de pacote a ser implementada.', 'info')}
                        onUpdateValue={(id, val) => { handleUpdateValue(id, val); setSelectedAppointment(null); }}
                        onStartSession={handleStartSession}
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

            {/* Modal da Lista de Espera - Usando versão simples como fallback */}
            <SimpleWaitlistModal
                isOpen={isWaitlistModalOpen}
                onClose={() => setIsWaitlistModalOpen(false)}
                onSave={handleAddToWaitlist}
                patients={patients}
                therapists={therapists}
            />

            {/* Waitlist Manager Dialog */}
            <WaitlistManagerDialog
                isOpen={isWaitlistManagerOpen}
                onClose={() => setIsWaitlistManagerOpen(false)}
                entries={waitlistEntries}
                patients={patients}
                therapists={therapists}
                onSchedule={handleScheduleFromWaitlist}
                onEdit={handleEditWaitlistEntry}
                onDelete={handleDeleteWaitlistEntry}
            />

            {/* Quick Add Patient Dialog */}
            <QuickAddPatientDialog
                isOpen={showQuickAddPatient}
                onClose={() => setShowQuickAddPatient(false)}
                onSave={handleSavePatient}
                onSelectPatient={handleSelectPatient}
            />

            {/* Waitlist Edit Dialog */}
            <WaitlistEditDialog
                isOpen={isWaitlistEditOpen}
                onClose={() => {
                    setIsWaitlistEditOpen(false);
                    setSelectedWaitlistEntry(null);
                }}
                entry={selectedWaitlistEntry}
                patients={patients}
                therapists={therapists}
                onUpdate={refreshWaitlist}
            />

            {/* Schedule Blocks Manager */}
            <ScheduleBlocksManager
                isOpen={isScheduleBlocksOpen}
                onClose={() => setIsScheduleBlocksOpen(false)}
                therapists={therapists}
                onUpdate={refetch}
            />

            {/* Keyboard Shortcuts Help */}
            <KeyboardShortcutsHelp
                isOpen={isKeyboardHelpOpen}
                onClose={() => setIsKeyboardHelpOpen(false)}
            />
        </main>
    );
}
