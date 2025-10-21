/**
 * Serviço de Sincronização de Calendários Externos
 * Suporta: Google Calendar, Outlook Calendar, iCal
 */

export interface CalendarProvider {
  id: string;
  name: string;
  type: 'google' | 'outlook' | 'ical' | 'apple';
  isConnected: boolean;
  lastSync?: Date;
  email?: string;
  calendarId?: string;
}

export interface ExternalEvent {
  id: string;
  title: string;
  description?: string;
  start: Date;
  end: Date;
  location?: string;
  attendees?: string[];
  provider: CalendarProvider['type'];
  reminders?: number[];
}

export interface SyncConfig {
  providerId: string;
  syncDirection: 'one_way' | 'two_way';
  syncFrequency: number; // em minutos
  includeReminders: boolean;
  includeAttendees: boolean;
  calendarFilter?: string[];
}

class CalendarSyncService {
  /**
   * Conecta com Google Calendar usando OAuth2
   */
  async connectGoogleCalendar(authCode: string): Promise<CalendarProvider> {
    try {
      // Em produção, usar Google OAuth2
      // const client = new google.auth.OAuth2(
      //   process.env.GOOGLE_CLIENT_ID,
      //   process.env.GOOGLE_CLIENT_SECRET,
      //   process.env.GOOGLE_REDIRECT_URI
      // );
      
      console.log('Conectando ao Google Calendar com código:', authCode);

      // Simulação de conexão
      const provider: CalendarProvider = {
        id: 'google_' + Date.now(),
        name: 'Google Calendar',
        type: 'google',
        isConnected: true,
        lastSync: new Date(),
        email: 'usuario@gmail.com',
        calendarId: 'primary'
      };

      return provider;
    } catch (error) {
      console.error('Erro ao conectar Google Calendar:', error);
      throw new Error('Falha na conexão com Google Calendar');
    }
  }

  /**
   * Conecta com Outlook Calendar usando Microsoft Graph API
   */
  async connectOutlookCalendar(authToken: string): Promise<CalendarProvider> {
    try {
      // Em produção, usar Microsoft Graph API
      // const client = Client.init({
      //   authProvider: (done) => {
      //     done(null, authToken);
      //   }
      // });

      console.log('Conectando ao Outlook Calendar com token');

      const provider: CalendarProvider = {
        id: 'outlook_' + Date.now(),
        name: 'Outlook Calendar',
        type: 'outlook',
        isConnected: true,
        lastSync: new Date(),
        email: 'usuario@outlook.com',
        calendarId: 'calendar'
      };

      return provider;
    } catch (error) {
      console.error('Erro ao conectar Outlook Calendar:', error);
      throw new Error('Falha na conexão com Outlook Calendar');
    }
  }

  /**
   * Busca URL de autorização do Google
   */
  getGoogleAuthUrl(): string {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'YOUR_CLIENT_ID';
    const redirectUri = import.meta.env.VITE_GOOGLE_REDIRECT_URI || window.location.origin + '/oauth/google/callback';
    const scope = 'https://www.googleapis.com/auth/calendar';
    
    return `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${clientId}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `response_type=code&` +
      `scope=${encodeURIComponent(scope)}&` +
      `access_type=offline&` +
      `prompt=consent`;
  }

  /**
   * Busca URL de autorização do Microsoft
   */
  getMicrosoftAuthUrl(): string {
    const clientId = import.meta.env.VITE_MICROSOFT_CLIENT_ID || 'YOUR_CLIENT_ID';
    const redirectUri = import.meta.env.VITE_MICROSOFT_REDIRECT_URI || window.location.origin + '/oauth/microsoft/callback';
    const scope = 'Calendars.ReadWrite offline_access';
    
    return `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?` +
      `client_id=${clientId}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `response_type=code&` +
      `scope=${encodeURIComponent(scope)}&` +
      `response_mode=query`;
  }

  /**
   * Exporta eventos para formato iCal
   */
  async exportToICal(events: ExternalEvent[]): Promise<string> {
    try {
      let ical = 'BEGIN:VCALENDAR\n';
      ical += 'VERSION:2.0\n';
      ical += 'PRODID:-//DuduFisio-AI//Calendar//PT\n';
      ical += 'CALSCALE:GREGORIAN\n';

      events.forEach(event => {
        ical += 'BEGIN:VEVENT\n';
        ical += `UID:${event.id}@dudufisio.ai\n`;
        ical += `DTSTAMP:${this.formatICalDate(new Date())}\n`;
        ical += `DTSTART:${this.formatICalDate(event.start)}\n`;
        ical += `DTEND:${this.formatICalDate(event.end)}\n`;
        ical += `SUMMARY:${event.title}\n`;
        
        if (event.description) {
          ical += `DESCRIPTION:${event.description.replace(/\n/g, '\\n')}\n`;
        }
        
        if (event.location) {
          ical += `LOCATION:${event.location}\n`;
        }

        if (event.attendees && event.attendees.length > 0) {
          event.attendees.forEach(attendee => {
            ical += `ATTENDEE:mailto:${attendee}\n`;
          });
        }

        if (event.reminders && event.reminders.length > 0) {
          event.reminders.forEach(minutes => {
            ical += 'BEGIN:VALARM\n';
            ical += 'ACTION:DISPLAY\n';
            ical += `TRIGGER:-PT${minutes}M\n`;
            ical += 'END:VALARM\n';
          });
        }

        ical += 'END:VEVENT\n';
      });

      ical += 'END:VCALENDAR';
      return ical;
    } catch (error) {
      console.error('Erro ao exportar para iCal:', error);
      throw new Error('Falha ao exportar calendário');
    }
  }

  /**
   * Formata data para formato iCal
   */
  private formatICalDate(date: Date): string {
    const pad = (n: number) => n.toString().padStart(2, '0');
    
    return date.getUTCFullYear() +
      pad(date.getUTCMonth() + 1) +
      pad(date.getUTCDate()) +
      'T' +
      pad(date.getUTCHours()) +
      pad(date.getUTCMinutes()) +
      pad(date.getUTCSeconds()) +
      'Z';
  }

  /**
   * Sincroniza eventos do Google Calendar
   */
  async syncGoogleCalendar(provider: CalendarProvider, config: SyncConfig): Promise<ExternalEvent[]> {
    try {
      // Em produção, usar API do Google Calendar
      console.log('Sincronizando Google Calendar:', provider.calendarId);

      // Simulação de eventos
      const mockEvents: ExternalEvent[] = [
        {
          id: 'google_event_1',
          title: 'Consulta Dr. Silva',
          description: 'Consulta de rotina',
          start: new Date('2025-01-22T10:00:00'),
          end: new Date('2025-01-22T11:00:00'),
          location: 'Clínica Exemplo',
          provider: 'google',
          reminders: [15, 30]
        },
        {
          id: 'google_event_2',
          title: 'Reunião de Equipe',
          start: new Date('2025-01-23T14:00:00'),
          end: new Date('2025-01-23T15:00:00'),
          provider: 'google',
          reminders: [10]
        }
      ];

      return mockEvents;
    } catch (error) {
      console.error('Erro ao sincronizar Google Calendar:', error);
      throw new Error('Falha na sincronização com Google Calendar');
    }
  }

  /**
   * Sincroniza eventos do Outlook Calendar
   */
  async syncOutlookCalendar(provider: CalendarProvider, config: SyncConfig): Promise<ExternalEvent[]> {
    try {
      // Em produção, usar Microsoft Graph API
      console.log('Sincronizando Outlook Calendar:', provider.email);

      const mockEvents: ExternalEvent[] = [
        {
          id: 'outlook_event_1',
          title: 'Fisioterapia',
          start: new Date('2025-01-24T09:00:00'),
          end: new Date('2025-01-24T10:00:00'),
          provider: 'outlook',
          reminders: [30]
        }
      ];

      return mockEvents;
    } catch (error) {
      console.error('Erro ao sincronizar Outlook Calendar:', error);
      throw new Error('Falha na sincronização com Outlook Calendar');
    }
  }

  /**
   * Cria evento em calendário externo
   */
  async createExternalEvent(provider: CalendarProvider, event: ExternalEvent): Promise<string> {
    try {
      console.log(`Criando evento em ${provider.type}:`, event.title);

      // Em produção, fazer requisição à API apropriada
      const eventId = `${provider.type}_${Date.now()}`;
      
      return eventId;
    } catch (error) {
      console.error('Erro ao criar evento externo:', error);
      throw new Error('Falha ao criar evento no calendário externo');
    }
  }

  /**
   * Atualiza evento em calendário externo
   */
  async updateExternalEvent(provider: CalendarProvider, eventId: string, event: Partial<ExternalEvent>): Promise<void> {
    try {
      console.log(`Atualizando evento ${eventId} em ${provider.type}`);

      // Em produção, fazer requisição à API apropriada
    } catch (error) {
      console.error('Erro ao atualizar evento externo:', error);
      throw new Error('Falha ao atualizar evento no calendário externo');
    }
  }

  /**
   * Deleta evento de calendário externo
   */
  async deleteExternalEvent(provider: CalendarProvider, eventId: string): Promise<void> {
    try {
      console.log(`Deletando evento ${eventId} de ${provider.type}`);

      // Em produção, fazer requisição à API apropriada
    } catch (error) {
      console.error('Erro ao deletar evento externo:', error);
      throw new Error('Falha ao deletar evento do calendário externo');
    }
  }

  /**
   * Busca provedores conectados do usuário
   */
  async getConnectedProviders(userId: string): Promise<CalendarProvider[]> {
    try {
      // Simulação de provedores conectados
      const providers: CalendarProvider[] = [
        {
          id: 'google_123',
          name: 'Google Calendar',
          type: 'google',
          isConnected: true,
          lastSync: new Date(),
          email: 'usuario@gmail.com',
          calendarId: 'primary'
        }
      ];

      return providers;
    } catch (error) {
      console.error('Erro ao buscar provedores:', error);
      throw new Error('Falha ao carregar provedores de calendário');
    }
  }

  /**
   * Desconecta provedor de calendário
   */
  async disconnectProvider(providerId: string): Promise<void> {
    try {
      console.log('Desconectando provedor:', providerId);

      // Em produção, revogar tokens e limpar dados
    } catch (error) {
      console.error('Erro ao desconectar provedor:', error);
      throw new Error('Falha ao desconectar calendário');
    }
  }

  /**
   * Configura webhook para sincronização automática
   */
  async setupWebhook(provider: CalendarProvider, webhookUrl: string): Promise<string> {
    try {
      console.log(`Configurando webhook para ${provider.type}:`, webhookUrl);

      // Em produção, configurar webhook na API apropriada
      const webhookId = `webhook_${Date.now()}`;
      
      return webhookId;
    } catch (error) {
      console.error('Erro ao configurar webhook:', error);
      throw new Error('Falha ao configurar sincronização automática');
    }
  }

  /**
   * Download de arquivo iCal
   */
  downloadICalFile(content: string, filename: string = 'calendario.ics'): void {
    const blob = new Blob([content], { type: 'text/calendar' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  /**
   * Verifica status de sincronização
   */
  async checkSyncStatus(providerId: string): Promise<{
    isActive: boolean;
    lastSync: Date | null;
    nextSync: Date | null;
    errorCount: number;
  }> {
    try {
      return {
        isActive: true,
        lastSync: new Date(),
        nextSync: new Date(Date.now() + 15 * 60 * 1000), // 15 minutos
        errorCount: 0
      };
    } catch (error) {
      console.error('Erro ao verificar status:', error);
      throw new Error('Falha ao verificar status de sincronização');
    }
  }
}

export const calendarSyncService = new CalendarSyncService();
