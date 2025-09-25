import { CalendarService } from './CalendarService';
import {
  CalendarEvent,
  CalendarResult,
  CalendarFeature,
  TimeRange,
  AvailabilitySlot,
  GoogleCalendarConfig
} from '../../../types';

// Mock Google Calendar API types (replace with actual googleapis imports in production)
interface GoogleCalendarEvent {
  id?: string;
  summary?: string;
  description?: string;
  start?: {
    dateTime?: string;
    timeZone?: string;
  };
  end?: {
    dateTime?: string;
    timeZone?: string;
  };
  location?: string;
  attendees?: Array<{
    email: string;
    displayName?: string;
    responseStatus?: string;
  }>;
  reminders?: {
    useDefault?: boolean;
    overrides?: Array<{
      method: string;
      minutes: number;
    }>;
  };
  recurrence?: string[];
  status?: string;
}

interface GoogleCalendarResponse {
  data: GoogleCalendarEvent;
}

interface GoogleAuth {
  getAccessToken(): Promise<string>;
}

interface GoogleCalendarAPI {
  events: {
    insert(params: {
      calendarId: string;
      sendUpdates?: string;
      requestBody: GoogleCalendarEvent;
    }): Promise<GoogleCalendarResponse>;

    update(params: {
      calendarId: string;
      eventId: string;
      sendUpdates?: string;
      requestBody: GoogleCalendarEvent;
    }): Promise<GoogleCalendarResponse>;

    delete(params: {
      calendarId: string;
      eventId: string;
      sendUpdates?: string;
    }): Promise<void>;

    list(params: {
      calendarId: string;
      timeMin: string;
      timeMax: string;
      maxResults?: number;
      singleEvents?: boolean;
    }): Promise<{
      data: {
        items: GoogleCalendarEvent[];
      };
    }>;

    freebusy(params: {
      requestBody: {
        timeMin: string;
        timeMax: string;
        items: Array<{ id: string }>;
      };
    }): Promise<{
      data: {
        calendars: Record<string, {
          busy: Array<{
            start: string;
            end: string;
          }>;
        }>;
      };
    }>;
  };
}

export class GoogleCalendarService extends CalendarService {
  readonly name = 'google';
  readonly supportedFeatures = [
    CalendarFeature.CREATE_EVENT,
    CalendarFeature.UPDATE_EVENT,
    CalendarFeature.DELETE_EVENT,
    CalendarFeature.REMINDERS,
    CalendarFeature.RECURRENCE,
    CalendarFeature.ATTENDEES,
    CalendarFeature.AVAILABILITY
  ];

  private auth: GoogleAuth;
  private calendar: GoogleCalendarAPI;
  private calendarId: string;

  constructor(config: GoogleCalendarConfig) {
    super(config);
    this.calendarId = config.calendarId || 'primary';

    // Initialize Google Auth and Calendar API
    this.initializeGoogleAPI(config);
  }

  private initializeGoogleAPI(config: GoogleCalendarConfig): void {
    try {
      // Mock implementation - replace with actual Google API initialization
      this.auth = this.createMockAuth();
      this.calendar = this.createMockCalendarAPI();

      // In production, use actual Google APIs:
      /*
      const { GoogleAuth } = require('google-auth-library');
      const { google } = require('googleapis');

      this.auth = new GoogleAuth({
        credentials: config.serviceAccount,
        scopes: ['https://www.googleapis.com/auth/calendar']
      });

      this.calendar = google.calendar({
        version: 'v3',
        auth: this.auth
      });
      */
    } catch (error) {
      throw new Error(`Failed to initialize Google Calendar API: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async createEvent(event: CalendarEvent): Promise<CalendarResult> {
    try {
      this.validateEvent(event);

      const googleEvent = this.mapToGoogleEvent(event);

      const response = await this.calendar.events.insert({
        calendarId: this.calendarId,
        sendUpdates: 'all',
        requestBody: googleEvent
      });

      return {
        success: true,
        eventId: response.data.id!,
        retryable: false,
        providerResponse: response.data
      };
    } catch (error) {
      return this.handleGoogleError(error);
    }
  }

  async updateEvent(eventId: string, event: Partial<CalendarEvent>): Promise<CalendarResult> {
    try {
      if (!eventId) {
        throw new Error('Event ID is required for updates');
      }

      const googleEvent = this.mapToGoogleEvent(event as CalendarEvent, true);

      const response = await this.calendar.events.update({
        calendarId: this.calendarId,
        eventId,
        sendUpdates: 'all',
        requestBody: googleEvent
      });

      return {
        success: true,
        eventId: response.data.id!,
        retryable: false,
        providerResponse: response.data
      };
    } catch (error) {
      return this.handleGoogleError(error);
    }
  }

  async deleteEvent(eventId: string): Promise<CalendarResult> {
    try {
      if (!eventId) {
        throw new Error('Event ID is required for deletion');
      }

      await this.calendar.events.delete({
        calendarId: this.calendarId,
        eventId,
        sendUpdates: 'all'
      });

      return {
        success: true,
        eventId,
        retryable: false
      };
    } catch (error) {
      return this.handleGoogleError(error);
    }
  }

  async getAvailability(timeRange: TimeRange): Promise<AvailabilitySlot[]> {
    try {
      const response = await this.calendar.events.freebusy({
        requestBody: {
          timeMin: timeRange.start.toISOString(),
          timeMax: timeRange.end.toISOString(),
          items: [{ id: this.calendarId }]
        }
      });

      const busyTimes = response.data.calendars[this.calendarId]?.busy || [];
      const slots: AvailabilitySlot[] = [];

      // Convert busy times to availability slots
      for (const busyTime of busyTimes) {
        slots.push({
          start: new Date(busyTime.start),
          end: new Date(busyTime.end),
          status: 'busy'
        });
      }

      return slots;
    } catch (error) {
      console.error('Error fetching availability:', error);
      return [];
    }
  }

  private mapToGoogleEvent(event: CalendarEvent, isUpdate = false): GoogleCalendarEvent {
    const googleEvent: GoogleCalendarEvent = {};

    if (event.title !== undefined) {
      googleEvent.summary = event.title;
    }

    if (event.description !== undefined) {
      googleEvent.description = event.description;
    }

    if (event.startTime) {
      googleEvent.start = {
        dateTime: event.startTime.toISOString(),
        timeZone: event.timeZone || 'America/Sao_Paulo'
      };
    }

    if (event.endTime) {
      googleEvent.end = {
        dateTime: event.endTime.toISOString(),
        timeZone: event.timeZone || 'America/Sao_Paulo'
      };
    }

    if (event.location) {
      googleEvent.location = this.formatLocation(event.location);
    }

    if (event.attendees && event.attendees.length > 0) {
      googleEvent.attendees = event.attendees.map(attendee => ({
        email: attendee.email,
        displayName: attendee.name
      }));
    }

    if (event.reminders && event.reminders.length > 0) {
      googleEvent.reminders = {
        useDefault: false,
        overrides: event.reminders.map(reminder => ({
          method: reminder.method === 'popup' ? 'popup' : 'email',
          minutes: reminder.minutesBefore
        }))
      };
    }

    if (event.recurrence) {
      const rrule = this.generateGoogleRRule(event.recurrence);
      if (rrule) {
        googleEvent.recurrence = [rrule];
      }
    }

    if (!isUpdate) {
      googleEvent.status = 'confirmed';
    }

    return googleEvent;
  }

  private generateGoogleRRule(recurrence: any): string | null {
    if (!recurrence || recurrence.frequency !== 'weekly') {
      return null;
    }

    const dayMap = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];
    const byDay = recurrence.days?.map((day: number) => dayMap[day]).join(',');

    let rrule = 'RRULE:FREQ=WEEKLY';
    if (byDay) rrule += `;BYDAY=${byDay}`;
    if (recurrence.until) {
      const until = new Date(recurrence.until).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
      rrule += `;UNTIL=${until}`;
    }

    return rrule;
  }

  private handleGoogleError(error: unknown): CalendarResult {
    const baseError = this.handleError(error);

    // Enhance error handling for Google-specific errors
    if (error && typeof error === 'object' && 'code' in error) {
      const googleError = error as { code: number; message: string };

      switch (googleError.code) {
        case 401:
          baseError.error!.code = 'GOOGLE_AUTH_FAILED';
          baseError.error!.message = 'Google Calendar authentication failed';
          baseError.retryable = false;
          break;
        case 403:
          baseError.error!.code = 'GOOGLE_PERMISSION_DENIED';
          baseError.error!.message = 'Insufficient permissions for Google Calendar';
          baseError.retryable = false;
          break;
        case 404:
          baseError.error!.code = 'GOOGLE_CALENDAR_NOT_FOUND';
          baseError.error!.message = 'Google Calendar not found';
          baseError.retryable = false;
          break;
        case 429:
          baseError.error!.code = 'GOOGLE_RATE_LIMIT';
          baseError.error!.message = 'Google Calendar rate limit exceeded';
          baseError.retryable = true;
          break;
        default:
          baseError.error!.code = `GOOGLE_ERROR_${googleError.code}`;
          break;
      }
    }

    return baseError;
  }

  async testConnection(): Promise<CalendarResult> {
    try {
      // Test by listing upcoming events (minimal API call)
      await this.calendar.events.list({
        calendarId: this.calendarId,
        timeMin: new Date().toISOString(),
        timeMax: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
        maxResults: 1,
        singleEvents: true
      });

      return {
        success: true,
        retryable: false,
        providerResponse: { connectionTest: 'passed', calendarId: this.calendarId }
      };
    } catch (error) {
      return this.handleGoogleError(error);
    }
  }

  // Mock implementations for development (remove in production)
  private createMockAuth(): GoogleAuth {
    return {
      async getAccessToken() {
        return 'mock-access-token';
      }
    } as GoogleAuth;
  }

  private createMockCalendarAPI(): GoogleCalendarAPI {
    return {
      events: {
        async insert(params) {
          return {
            data: {
              id: `mock-event-${Date.now()}`,
              summary: params.requestBody.summary,
              status: 'confirmed'
            }
          };
        },
        async update(params) {
          return {
            data: {
              id: params.eventId,
              summary: params.requestBody.summary,
              status: 'confirmed'
            }
          };
        },
        async delete() {
          // Mock deletion
        },
        async list() {
          return {
            data: {
              items: []
            }
          };
        },
        async freebusy() {
          return {
            data: {
              calendars: {
                [this.calendarId]: {
                  busy: []
                }
              }
            }
          };
        }
      }
    } as GoogleCalendarAPI;
  }
}