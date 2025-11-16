import {
  CalendarEvent,
  CalendarResult,
  CalendarFeature,
  TimeRange,
  AvailabilitySlot,
  CalendarError,
  ProviderConfig
} from '../../../types';

export abstract class CalendarService {
  abstract readonly name: string;
  abstract readonly supportedFeatures: CalendarFeature[];

  protected config: ProviderConfig;

  constructor(config: ProviderConfig) {
    this.config = config;
  }

  abstract createEvent(event: CalendarEvent): Promise<CalendarResult>;

  abstract updateEvent(eventId: string, event: Partial<CalendarEvent>): Promise<CalendarResult>;

  abstract deleteEvent(eventId: string): Promise<CalendarResult>;

  abstract getAvailability(timeRange: TimeRange): Promise<AvailabilitySlot[]>;

  async testConnection(): Promise<CalendarResult> {
    try {
      const testEvent: CalendarEvent = {
        title: 'Test Connection - DuduFisio',
        description: 'Test event to verify calendar integration',
        startTime: new Date(Date.now() + 60000), // 1 minute from now
        endTime: new Date(Date.now() + 120000), // 2 minutes from now
        location: { name: 'Test Location' },
        attendees: [],
        reminders: [],
        metadata: { test: true }
      };

      const result = await this.createEvent(testEvent);

      if (result.success && result.eventId) {
        await this.deleteEvent(result.eventId);
      }

      return result;
    } catch (error) {
      return this.handleError(error);
    }
  }

  protected handleError(error: unknown): CalendarResult {
    const calendarError: CalendarError = {
      code: 'UNKNOWN_ERROR',
      message: 'An unexpected error occurred',
      retryable: false
    };

    if (error instanceof Error) {
      calendarError.message = error.message;
      calendarError.details = error;

      // Determine if error is retryable based on common error patterns
      const retryablePatterns = [
        'timeout',
        'network',
        'rate limit',
        'quota exceeded',
        'temporary',
        'unavailable',
        '429', // Too Many Requests
        '500', // Internal Server Error
        '502', // Bad Gateway
        '503', // Service Unavailable
        '504'  // Gateway Timeout
      ];

      calendarError.retryable = retryablePatterns.some(pattern =>
        error.message.toLowerCase().includes(pattern)
      );
    }

    return {
      success: false,
      error: calendarError,
      retryable: calendarError.retryable
    };
  }

  protected formatLocation(location: CalendarEvent['location']): string {
    if (!location.name) return '';

    if (location.address) {
      return `${location.name}, ${location.address}`;
    }

    return location.name;
  }

  protected validateEvent(event: CalendarEvent): void {
    if (!event.title?.trim()) {
      throw new Error('Event title is required');
    }

    if (!event.startTime || !event.endTime) {
      throw new Error('Start time and end time are required');
    }

    if (event.startTime >= event.endTime) {
      throw new Error('End time must be after start time');
    }

    if (event.attendees?.some(attendee => !attendee.email?.includes('@'))) {
      throw new Error('All attendees must have valid email addresses');
    }
  }

  hasFeature(feature: CalendarFeature): boolean {
    return this.supportedFeatures.includes(feature);
  }

  protected generateEventId(): string {
    return `dudufisio-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

export interface CalendarProvider {
  readonly name: string;
  readonly supportedFeatures: CalendarFeature[];

  createEvent(event: CalendarEvent): Promise<CalendarResult>;
  updateEvent(eventId: string, event: Partial<CalendarEvent>): Promise<CalendarResult>;
  deleteEvent(eventId: string): Promise<CalendarResult>;
  getAvailability(timeRange: TimeRange): Promise<AvailabilitySlot[]>;
  testConnection(): Promise<CalendarResult>;
  hasFeature(feature: CalendarFeature): boolean;
}