import { CalendarService } from './CalendarService';
import {
  CalendarEvent,
  CalendarResult,
  CalendarFeature,
  TimeRange,
  AvailabilitySlot,
  OutlookConfig
} from '../../../types';

// Mock Microsoft Graph API types (replace with actual @azure/msal-node imports in production)
interface GraphEvent {
  id?: string;
  subject?: string;
  body?: {
    contentType: 'HTML' | 'Text';
    content: string;
  };
  start?: {
    dateTime: string;
    timeZone: string;
  };
  end?: {
    dateTime: string;
    timeZone: string;
  };
  location?: {
    displayName: string;
    address?: {
      street?: string;
      city?: string;
      state?: string;
      countryOrRegion?: string;
      postalCode?: string;
    };
  };
  attendees?: Array<{
    emailAddress: {
      address: string;
      name?: string;
    };
    type: 'required' | 'optional' | 'resource';
  }>;
  isReminderOn?: boolean;
  reminderMinutesBeforeStart?: number;
  recurrence?: {
    pattern: {
      type: 'daily' | 'weekly' | 'absoluteMonthly' | 'relativeMonthly' | 'absoluteYearly' | 'relativeYearly';
      interval: number;
      daysOfWeek?: string[];
      dayOfMonth?: number;
      firstDayOfWeek?: string;
    };
    range: {
      type: 'endDate' | 'noEnd' | 'numbered';
      startDate: string;
      endDate?: string;
      numberOfOccurrences?: number;
    };
  };
}

interface GraphResponse<T> {
  value?: T[];
  '@odata.nextLink'?: string;
}

interface GraphClient {
  api(path: string): {
    post(data: GraphEvent): Promise<GraphEvent>;
    patch(data: Partial<GraphEvent>): Promise<GraphEvent>;
    delete(): Promise<void>;
    get(): Promise<GraphEvent | GraphResponse<GraphEvent>>;
  };
}

export class OutlookService extends CalendarService {
  readonly name = 'outlook';
  readonly supportedFeatures = [
    CalendarFeature.CREATE_EVENT,
    CalendarFeature.UPDATE_EVENT,
    CalendarFeature.DELETE_EVENT,
    CalendarFeature.REMINDERS,
    CalendarFeature.RECURRENCE,
    CalendarFeature.ATTENDEES,
    CalendarFeature.AVAILABILITY
  ];

  private graphClient: GraphClient;
  private calendarId: string;

  constructor(config: OutlookConfig) {
    super(config);
    this.calendarId = 'primary'; // Default calendar

    // Initialize Microsoft Graph client
    this.initializeGraphClient(config);
  }

  private initializeGraphClient(config: OutlookConfig): void {
    try {
      // Mock implementation - replace with actual Microsoft Graph client
      this.graphClient = this.createMockGraphClient();

      // In production, use actual Microsoft Graph SDK:
      /*
      const { Client } = require('@azure/msal-node');
      const { AuthenticationProvider } = require('@microsoft/microsoft-graph-client');

      const clientApp = new Client({
        auth: {
          clientId: config.clientId,
          clientSecret: config.clientSecret,
          authority: `https://login.microsoftonline.com/${config.tenantId}`
        }
      });

      this.graphClient = Client.initWithMiddleware({
        authProvider: new AuthenticationProvider(clientApp)
      });
      */
    } catch (error) {
      throw new Error(`Failed to initialize Microsoft Graph client: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async createEvent(event: CalendarEvent): Promise<CalendarResult> {
    try {
      this.validateEvent(event);

      const graphEvent = this.mapToGraphEvent(event);

      const response = await this.graphClient
        .api(`/me/calendars/${this.calendarId}/events`)
        .post(graphEvent);

      return {
        success: true,
        eventId: response.id!,
        retryable: false,
        providerResponse: response
      };
    } catch (error) {
      return this.handleGraphError(error);
    }
  }

  async updateEvent(eventId: string, event: Partial<CalendarEvent>): Promise<CalendarResult> {
    try {
      if (!eventId) {
        throw new Error('Event ID is required for updates');
      }

      const graphEvent = this.mapToGraphEvent(event as CalendarEvent, true);

      const response = await this.graphClient
        .api(`/me/calendars/${this.calendarId}/events/${eventId}`)
        .patch(graphEvent);

      return {
        success: true,
        eventId: response.id!,
        retryable: false,
        providerResponse: response
      };
    } catch (error) {
      return this.handleGraphError(error);
    }
  }

  async deleteEvent(eventId: string): Promise<CalendarResult> {
    try {
      if (!eventId) {
        throw new Error('Event ID is required for deletion');
      }

      await this.graphClient
        .api(`/me/calendars/${this.calendarId}/events/${eventId}`)
        .delete();

      return {
        success: true,
        eventId,
        retryable: false
      };
    } catch (error) {
      return this.handleGraphError(error);
    }
  }

  async getAvailability(timeRange: TimeRange): Promise<AvailabilitySlot[]> {
    try {
      // Microsoft Graph free/busy API would be called here
      // const response = await this.graphClient
      //   .api('/me/calendar/getSchedule')
      //   .post({
      //     schedules: ['me'],
      //     startTime: {
      //       dateTime: timeRange.start.toISOString(),
      //       timeZone: timeRange.timeZone || 'America/Sao_Paulo'
      //     },
      //     endTime: {
      //       dateTime: timeRange.end.toISOString(),
      //       timeZone: timeRange.timeZone || 'America/Sao_Paulo'
      //     },
      //     availabilityViewInterval: 60 // 60-minute intervals
      //   });

      // Process response to create availability slots
      const slots: AvailabilitySlot[] = [];

      // This would process the actual response from Microsoft Graph
      // For now, return empty array
      return slots;
    } catch (error) {
      console.error('Error fetching availability from Outlook:', error);
      return [];
    }
  }

  private mapToGraphEvent(event: CalendarEvent, isUpdate = false): GraphEvent {
    const graphEvent: GraphEvent = {};

    if (event.title !== undefined) {
      graphEvent.subject = event.title;
    }

    if (event.description !== undefined) {
      graphEvent.body = {
        contentType: 'Text',
        content: event.description
      };
    }

    if (event.startTime) {
      graphEvent.start = {
        dateTime: event.startTime.toISOString(),
        timeZone: event.timeZone || 'America/Sao_Paulo'
      };
    }

    if (event.endTime) {
      graphEvent.end = {
        dateTime: event.endTime.toISOString(),
        timeZone: event.timeZone || 'America/Sao_Paulo'
      };
    }

    if (event.location) {
      graphEvent.location = {
        displayName: this.formatLocation(event.location)
      };
    }

    if (event.attendees && event.attendees.length > 0) {
      graphEvent.attendees = event.attendees.map(attendee => ({
        emailAddress: {
          address: attendee.email,
          name: attendee.name
        },
        type: attendee.required !== false ? 'required' : 'optional'
      }));
    }

    if (event.reminders && event.reminders.length > 0) {
      // Microsoft Graph supports only one reminder per event
      const firstReminder = event.reminders[0];
      graphEvent.isReminderOn = true;
      graphEvent.reminderMinutesBeforeStart = firstReminder.minutesBefore;
    }

    if (event.recurrence) {
      const recurrence = this.generateGraphRecurrence(event.recurrence);
      if (recurrence) {
        graphEvent.recurrence = recurrence;
      }
    }

    return graphEvent;
  }

  private generateGraphRecurrence(recurrence: any): GraphEvent['recurrence'] | null {
    if (!recurrence || recurrence.frequency !== 'weekly') {
      return null;
    }

    const dayMap: Record<number, string> = {
      0: 'sunday',
      1: 'monday',
      2: 'tuesday',
      3: 'wednesday',
      4: 'thursday',
      5: 'friday',
      6: 'saturday'
    };

    const daysOfWeek = recurrence.days?.map((day: number) => dayMap[day]).filter(Boolean);

    if (!daysOfWeek || daysOfWeek.length === 0) {
      return null;
    }

    return {
      pattern: {
        type: 'weekly',
        interval: 1,
        daysOfWeek
      },
      range: {
        type: recurrence.until ? 'endDate' : 'noEnd',
        startDate: new Date().toISOString().split('T')[0],
        endDate: recurrence.until ? new Date(recurrence.until).toISOString().split('T')[0] : undefined
      }
    };
  }

  private handleGraphError(error: unknown): CalendarResult {
    const baseError = this.handleError(error);

    // Enhance error handling for Microsoft Graph-specific errors
    if (error && typeof error === 'object' && 'code' in error) {
      const graphError = error as { code: string; message: string };

      switch (graphError.code) {
        case 'InvalidAuthenticationToken':
          baseError.error!.code = 'OUTLOOK_AUTH_FAILED';
          baseError.error!.message = 'Outlook authentication failed';
          baseError.retryable = false;
          break;
        case 'Forbidden':
          baseError.error!.code = 'OUTLOOK_PERMISSION_DENIED';
          baseError.error!.message = 'Insufficient permissions for Outlook Calendar';
          baseError.retryable = false;
          break;
        case 'NotFound':
          baseError.error!.code = 'OUTLOOK_CALENDAR_NOT_FOUND';
          baseError.error!.message = 'Outlook Calendar not found';
          baseError.retryable = false;
          break;
        case 'TooManyRequests':
          baseError.error!.code = 'OUTLOOK_RATE_LIMIT';
          baseError.error!.message = 'Outlook Calendar rate limit exceeded';
          baseError.retryable = true;
          break;
        default:
          baseError.error!.code = `OUTLOOK_ERROR_${graphError.code}`;
          break;
      }
    }

    return baseError;
  }

  async testConnection(): Promise<CalendarResult> {
    try {
      // Test by getting user's calendar information
      await this.graphClient.api('/me/calendar').get();

      return {
        success: true,
        retryable: false,
        providerResponse: { connectionTest: 'passed', calendarId: this.calendarId }
      };
    } catch (error) {
      return this.handleGraphError(error);
    }
  }

  // Mock implementation for development (remove in production)
  private createMockGraphClient(): GraphClient {
    return {
      api: (path: string) => ({
        async post(data: GraphEvent) {
          return {
            id: `outlook-event-${Date.now()}`,
            subject: data.subject,
            ...data
          };
        },
        async patch(data: Partial<GraphEvent>) {
          return {
            id: path.split('/').pop(),
            ...data
          } as GraphEvent;
        },
        async delete() {
          // Mock deletion
        },
        async get() {
          if (path === '/me/calendar') {
            return { id: 'primary', name: 'Calendar' };
          }
          return { value: [] };
        }
      })
    };
  }
}