// pages/EventsListPage.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Search, Ticket, Archive } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import { Event, EventStatus } from '../types';
import { eventService } from '../services/eventService';
import { useToast } from '../contexts/ToastContext';
import { Skeleton } from '../components/ui/skeleton';
import EventCard from '../components/events/EventCard';
import EventFormModal from '../components/events/EventFormModal';
import { useAuth } from "../contexts/AppContext";

const EventsListPage: React.FC = () => {
    const [events, setEvents] = useState<Event[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<EventStatus | 'All'>('All');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [eventToEdit, setEventToEdit] = useState<Event | undefined>();
    
    const { showToast } = useToast();
    const { user } = useAuth();

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const data = await eventService.getEvents();
            setEvents(data);
        } catch (error) {
            showToast('Erro ao carregar eventos.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        
        eventService.on('events:changed', fetchData);
        
        return () => {
            eventService.off('events:changed', fetchData);
        };
    }, []);

    const { upcomingEvents, pastEvents } = useMemo(() => {
        const now = new Date();
        const filtered = events.filter(event => {
            const searchMatch = event.name.toLowerCase().includes(searchTerm.toLowerCase());
            const statusMatch = statusFilter === 'All' || event.status === statusFilter;
            return searchMatch && statusMatch;
        });

        return {
            upcomingEvents: filtered.filter(e => e.endDate >= now).sort((a,b) => a.startDate.getTime() - b.startDate.getTime()),
            pastEvents: filtered.filter(e => e.endDate < now),
        };
    }, [events, searchTerm, statusFilter]);
    
    const handleOpenModal = (event?: Event) => {
        setEventToEdit(event);
        setIsModalOpen(true);
    };

    const handleSaveEvent = async (data: Omit<Event, 'id' | 'registrations' | 'providers'> & { id?: string }) => {
        if (!user) return;
        try {
            await eventService.saveEvent(data, user.id);
            showToast(data.id ? 'Evento atualizado!' : 'Evento criado!', 'success');
            setIsModalOpen(false);
        } catch (error) {
            showToast('Falha ao salvar o evento.', 'error');
        }
    };

    const FilterButton: React.FC<{ value: EventStatus | 'All', label: string }> = ({ value, label }) => (
        <button
            onClick={() => setStatusFilter(value)}
            className={`px-md py-sm text-sm font-semibold rounded-full transition-colors ${statusFilter === value ? 'bg-teal-500 text-white' : 'bg-neutral-bgDark text-neutral-textSecondary hover:bg-neutral-bgDark'}`}
        >
            {label}
        </button>
    );

    return (
        <>
            <PageHeader
                title="Gestão de Eventos"
                subtitle="Crie e gerencie corridas, workshops e campanhas de saúde."
            >
                <button
                    onClick={() => handleOpenModal()}
                    className="inline-flex items-center justify-center rounded-lg border border-transparent bg-teal-500 px-md py-sm text-sm font-medium text-white shadow-card hover:bg-teal-600"
                >
                    <Plus className="-ml-xs mr-sm h-5 w-5" />
                    Novo Evento
                </button>
            </PageHeader>
            
            <EventFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveEvent}
                eventToEdit={eventToEdit}
            />

            <div className="mb-xl bg-white p-md rounded-cardLarge shadow-card flex flex-col sm:flex-row items-center gap-md">
                <div className="relative flex-grow w-full sm:w-auto">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-textTertiary" />
                    <input
                        type="text"
                        placeholder="Buscar por nome do evento..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-sm border border-neutral-border rounded-full"
                    />
                </div>
                <div className="flex items-center gap-sm flex-wrap">
                    <FilterButton value="All" label="Todos" />
                    <FilterButton value={EventStatus.Published} label="Publicados" />
                    <FilterButton value={EventStatus.Active} label="Ativos" />
                    <FilterButton value={EventStatus.Completed} label="Concluídos" />
                </div>
            </div>

            {isLoading ? (
                 <Skeleton className="h-96 w-full rounded-cardLarge" />
            ) : (
                <div className="space-y-10">
                    <section>
                        <h2 className="text-2xl font-bold text-neutral-text mb-md">Próximos Eventos</h2>
                        {upcomingEvents.length > 0 ? (
                             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg">
                                {upcomingEvents.map(event => (
                                    <EventCard key={event.id} event={event} onEdit={() => handleOpenModal(event)} />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center p-12 bg-white rounded-cardLarge shadow-card">
                                <Ticket className="w-12 h-12 mx-auto text-slate-300 mb-sm" />
                                <h3 className="text-lg font-semibold text-neutral-text">Nenhum próximo evento agendado.</h3>
                                <p className="text-sm text-neutral-textSecondary mt-xs">Que tal planejar o próximo? Clique em "Novo Evento" para começar.</p>
                            </div>
                        )}
                    </section>
                     <section>
                        <h2 className="text-2xl font-bold text-neutral-text mb-md">Eventos Anteriores</h2>
                        {pastEvents.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg">
                                {pastEvents.map(event => (
                                    <EventCard key={event.id} event={event} onEdit={() => handleOpenModal(event)} />
                                ))}
                            </div>
                        ) : (
                             <div className="text-center p-12 bg-white rounded-cardLarge shadow-card">
                                <Archive className="w-12 h-12 mx-auto text-slate-300 mb-sm" />
                                <h3 className="text-lg font-semibold text-neutral-text">Seu histórico de eventos está vazio.</h3>
                                <p className="text-sm text-neutral-textSecondary mt-xs">Os eventos que você realizar aparecerão aqui.</p>
                            </div>
                        )}
                    </section>
                </div>
            )}
        </>
    );
};

export default EventsListPage;