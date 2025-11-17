import { createServerComponentClient } from '~/lib/supabase/server';
import { v4 as uuidv4 } from 'uuid';

export type RecurrenceFrequency = 'daily' | 'weekly' | 'monthly';

export interface RecurrencePattern {
  frequency: RecurrenceFrequency;
  interval: number;
  endDate?: string;
  occurrences?: number;
}

export class RecurrenceService {
  static async createRecurringAppointments(
    baseAppointment: any,
    pattern: RecurrencePattern
  ) {
    try {
      const supabase = await createServerComponentClient();
      const recurrenceGroupId = uuidv4();
      const dates = this.generateRecurrenceDates(new Date(baseAppointment.start_time), pattern);
      
      if (dates.length === 0 || dates.length > 100) {
        throw new Error('Invalid number of occurrences');
      }

      const appointments = dates.map((date) => ({
        ...baseAppointment,
        start_time: date.toISOString(),
        end_time: new Date(date.getTime() + 3600000).toISOString(),
        is_recurring: true,
        recurrence_group_id: recurrenceGroupId,
      }));

      const { data, error } = await supabase
        .from('appointments')
        .insert(appointments)
        .select();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error creating recurring appointments:', error);
      return { data: null, error };
    }
  }

  private static generateRecurrenceDates(startDate: Date, pattern: RecurrencePattern): Date[] {
    const dates: Date[] = [];
    let currentDate = new Date(startDate);
    const maxOccurrences = pattern.occurrences || 52;
    const endDate = pattern.endDate ? new Date(pattern.endDate) : null;

    for (let i = 0; i < maxOccurrences; i++) {
      if (endDate && currentDate > endDate) break;
      dates.push(new Date(currentDate));

      switch (pattern.frequency) {
        case 'daily':
          currentDate.setDate(currentDate.getDate() + pattern.interval);
          break;
        case 'weekly':
          currentDate.setDate(currentDate.getDate() + 7 * pattern.interval);
          break;
        case 'monthly':
          currentDate.setMonth(currentDate.getMonth() + pattern.interval);
          break;
      }
    }
    return dates;
  }
}

