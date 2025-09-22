// services/eventService.ts
import { Event, EventRegistration, RegistrationStatus, EventProvider, ProviderStatus } from '../types';
import { mockEvents, mockEventRegistrations } from '../data/mockData';

type Listener = (...args: any[]) => void;

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

class EventService {
  private events: Record<string, Listener[]> = {};
  
  // Using mutable copies to simulate a database
  private eventsData: Event[] = [...mockEvents];
  private registrationsData: EventRegistration[] = [...mockEventRegistrations];

  // --- Event Emitter Methods ---
  on(eventName: string, listener: Listener) {
    if (!this.events[eventName]) {
      this.events[eventName] = [];
    }
    this.events[eventName].push(listener);
  }

  off(eventName: string, listener: Listener) {
    if (!this.events[eventName]) return;
    this.events[eventName] = this.events[eventName].filter(l => l !== listener);
  }

  emit(eventName: string, ...args: any[]) {
    if (!this.events[eventName]) return;
    this.events[eventName].forEach(listener => listener(...args));
  }
  
  // --- Data Access Methods ---

  async getEvents(): Promise<Event[]> {
    await delay(300);
    return [...this.eventsData].sort((a, b) => b.startDate.getTime() - a.startDate.getTime());
  }
  
  async getEventById(id: string): Promise<Event | undefined> {
    await delay(200);
    // Deep copy to avoid direct mutation issues with registrations/providers array
    const event = this.eventsData.find(e => e.id === id);
    return event ? JSON.parse(JSON.stringify(event)) : undefined;
  }
  
  async getRegistrationsByEventId(eventId: string): Promise<EventRegistration[]> {
    await delay(200);
    return this.registrationsData.filter(r => r.eventId === eventId);
  }

  async saveEvent(eventData: Omit<Event, 'id' | 'registrations' | 'providers'> & { id?: string }, organizerId: string): Promise<Event> {
    await delay(400);
    if (eventData.id) {
        const index = this.eventsData.findIndex(e => e.id === eventData.id);
        if (index > -1) {
            const updatedEvent: Event = {
                ...this.eventsData[index],
                ...eventData,
                id: this.eventsData[index].id, // Ensure id is preserved
                registrations: this.eventsData[index].registrations,
                providers: this.eventsData[index].providers,
            };
            this.eventsData[index] = updatedEvent;
            this.emit('events:changed');
            return updatedEvent;
        }
        throw new Error("Event not found");
    } else {
        const newEvent: Event = {
            ...eventData,
            id: `event_${Date.now()}`,
            registrations: [],
            providers: [],
            organizerId,
        };
        this.eventsData.unshift(newEvent);
        this.emit('events:changed');
        return newEvent;
    }
  }

  async checkInParticipant(registrationId: string, method: 'qr' | 'manual', checkedInBy: string): Promise<EventRegistration> {
    await delay(500);
    const regIndex = this.registrationsData.findIndex(r => r.id === registrationId);
    if (regIndex === -1) {
        throw new Error("Inscrição não encontrada.");
    }

    const registration = this.registrationsData[regIndex];
    if (!registration) {
        throw new Error("Inscrição não encontrada.");
    }
    if (registration.status === RegistrationStatus.Attended) {
        throw new Error("Participante já fez check-in.");
    }
    
    const updatedRegistration: EventRegistration = {
        ...registration,
        status: RegistrationStatus.Attended,
        checkedInAt: new Date(),
        checkedInBy: checkedInBy,
    };
    this.registrationsData[regIndex] = updatedRegistration;

    // Also update the event's registration array for consistency
    const eventIndex = this.eventsData.findIndex(e => e.id === registration.eventId);
    if (eventIndex > -1) {
        const event = this.eventsData[eventIndex];
        if (event) {
            const eventRegIndex = event.registrations.findIndex(r => r.id === registrationId);
            if (eventRegIndex > -1) {
                event.registrations[eventRegIndex] = updatedRegistration;
            } else {
                event.registrations.push(updatedRegistration);
            }
        }
    }
    
    this.emit('events:changed');
    return updatedRegistration;
  }

  async confirmProvider(providerId: string): Promise<EventProvider> {
    await delay(500);
    
    for (const event of this.eventsData) {
        const providerIndex = event.providers.findIndex(p => p.id === providerId);
        if (providerIndex > -1) {
            const provider = event.providers[providerIndex];
            if (provider) {
                if (provider.status !== ProviderStatus.Applied) {
                    throw new Error("Apenas inscrições com status 'Inscrito' podem ser confirmadas.");
                }
                provider.status = ProviderStatus.Confirmed;
                this.emit('events:changed');
                return provider;
            }
        }
    }
    
    throw new Error("Prestador de serviço não encontrado.");
  }

  async payProvider(providerId: string): Promise<EventProvider> {
    await delay(500);
    
    for (const event of this.eventsData) {
        const providerIndex = event.providers.findIndex(p => p.id === providerId);
        if (providerIndex > -1) {
            const provider = event.providers[providerIndex];
            if (provider) {
                if (provider.status !== ProviderStatus.Confirmed) {
                    throw new Error("Apenas prestadores confirmados podem receber pagamento.");
                }
                provider.status = ProviderStatus.Paid;
                this.emit('events:changed');
                return provider;
            }
        }
    }
    
    throw new Error("Prestador de serviço não encontrado.");
  }
}

export const eventService = new EventService();