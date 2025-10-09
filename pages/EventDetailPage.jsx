// pages/EventDetailPage.tsx
'use client';
import React, { useState, useEffect, useCallback } from 'react';
// FIX: Use namespace import for react-router-dom to fix module resolution issues.
import * as ReactRouterDOM from 'react-router-dom';
import { RegistrationStatus } from '../types';
import { eventService } from '../services/eventService';
import { useToast } from '../contexts/ToastContext';
import PageLoader from '../components/ui/PageLoader';
import { ChevronLeft, Users, BarChart, UserCheck } from 'lucide-react';
import EventDashboardMetrics from '../components/events/EventDashboardMetrics';
import ParticipantTable from '../components/events/ParticipantTable';
import CheckInModal from '../components/events/CheckInModal';
import { useAuth } from "../contexts/AppContext";
import EventDetailHeader from '../components/events/EventDetailHeader';
import ProviderTable from '../components/events/ProviderTable';
import EventFormModal from '../components/events/EventFormModal';
const TabButton = ({ icon: Icon, label, isActive, onClick }) => (<button onClick={onClick} className={`flex items-center whitespace-nowrap py-3 px-4 font-medium text-sm rounded-t-lg border-b-2 ${isActive ? 'border-teal-500 text-teal-600 bg-white' : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}>
        <Icon className="w-5 h-5 mr-2"/> {label}
    </button>);
const EventDetailPage = () => {
    const { id } = ReactRouterDOM.useParams();
    const { showToast } = useToast();
    const { user } = useAuth();
    const [event, setEvent] = useState(null);
    const [registrations, setRegistrations] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('participants');
    const [isCheckInModalOpen, setIsCheckInModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const fetchData = useCallback(async () => {
        if (!id)
            return;
        setIsLoading(true);
        try {
            // In a real app, you might fetch providers separately or include them in the event object
            const eventData = await eventService.getEventById(id);
            const regsData = await eventService.getRegistrationsByEventId(id);
            setEvent(eventData || null);
            setRegistrations(regsData);
        }
        catch (error) {
            showToast('Erro ao carregar detalhes do evento.', 'error');
        }
        finally {
            setIsLoading(false);
        }
    }, [id, showToast]);
    useEffect(() => {
        fetchData();
        eventService.on('events:changed', fetchData);
        return () => { eventService.off('events:changed', fetchData); };
    }, [fetchData]);
    const handleCheckIn = async (registrationId, method) => {
        if (!user)
            return false;
        try {
            await eventService.checkInParticipant(registrationId, method, user.id);
            showToast('Check-in realizado com sucesso!', 'success');
            return true;
        }
        catch (error) {
            showToast(error.message, 'error');
            return false;
        }
    };
    const handleSaveEvent = async (data) => {
        if (!user)
            return;
        try {
            await eventService.saveEvent(data, user.id);
            showToast(data.id ? 'Evento atualizado!' : 'Evento criado!', 'success');
            setIsEditModalOpen(false);
        }
        catch (error) {
            showToast('Falha ao salvar o evento.', 'error');
        }
    };
    // Handle loading state
    if (isLoading) {
        return <PageLoader />;
    }
    // Handle not found state
    if (!event) {
        return <div className="text-center p-10">Evento não encontrado.</div>;
    }
    return (<>
            <ReactRouterDOM.Link to="/events" className="inline-flex items-center text-sm font-semibold text-slate-600 hover:text-slate-800 mb-4">
                <ChevronLeft className="mr-2 h-4 w-4"/>
                Voltar para todos os eventos
            </ReactRouterDOM.Link>

            <EventDetailHeader event={event} onEdit={() => setIsEditModalOpen(true)} onCheckIn={() => setIsCheckInModalOpen(true)}/>
            
            <EventFormModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} onSave={handleSaveEvent} eventToEdit={event}/>

            <CheckInModal isOpen={isCheckInModalOpen} onClose={() => setIsCheckInModalOpen(false)} registrations={registrations.filter(r => r.status !== RegistrationStatus.Attended)} onCheckIn={handleCheckIn}/>

            <div className="mt-8 bg-white rounded-2xl shadow-sm">
                <div className="border-b border-slate-200">
                    <nav className="flex space-x-2 px-4" aria-label="Tabs">
                        <TabButton icon={BarChart} label="Dashboard" isActive={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')}/>
                        <TabButton icon={Users} label="Participantes" isActive={activeTab === 'participants'} onClick={() => setActiveTab('participants')}/>
                        {event.allowsProviders && <TabButton icon={UserCheck} label="Fisioterapeutas" isActive={activeTab === 'providers'} onClick={() => setActiveTab('providers')}/>}
                    </nav>
                </div>
                
                <div className="p-6">
                    {activeTab === 'dashboard' && (<EventDashboardMetrics event={event} registrations={registrations}/>)}
                    {activeTab === 'participants' && (<ParticipantTable registrations={registrations} onCheckIn={(regId) => handleCheckIn(regId, 'manual')}/>)}
                    {activeTab === 'providers' && event.allowsProviders && (<ProviderTable providers={event.providers}/>)}
                </div>
            </div>
        </>);
};
export default EventDetailPage;
