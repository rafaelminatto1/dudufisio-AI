import { createServerComponentClient } from '~/lib/supabase/server';
import { AppointmentService } from '../appointments/appointmentService';

export class AutoSchedulingService {
  static async getAvailableSlots(params: {
    patientId: string;
    therapistId?: string;
    date?: Date;
    daysAhead?: number;
  }) {
    try {
      const supabase = await createServerComponentClient();
      const daysAhead = params.daysAhead || 30;
      const startDate = params.date || new Date();
      const availableSlots: any[] = [];

      // Simplified slot finding - TODO: Implement full logic
      for (let dayOffset = 0; dayOffset < daysAhead; dayOffset++) {
        const checkDate = new Date(startDate);
        checkDate.setDate(startDate.getDate() + dayOffset);

        // Generate slots for this day (8:00 to 18:00, every 30 minutes)
        for (let hour = 8; hour < 18; hour++) {
          for (let minute of [0, 30]) {
            const slotStart = new Date(checkDate);
            slotStart.setHours(hour, minute, 0, 0);

            const slotEnd = new Date(slotStart);
            slotEnd.setMinutes(slotEnd.getMinutes() + 60);

            availableSlots.push({
              therapistId: params.therapistId,
              startTime: slotStart.toISOString(),
              endTime: slotEnd.toISOString(),
              duration: 60,
            });
          }
        }
      }

      return { data: availableSlots.slice(0, 50), error: null };
    } catch (error) {
      console.error('Error getting available slots:', error);
      return { data: null, error };
    }
  }

  static async bookAppointment(params: {
    patientId: string;
    therapistId: string;
    startTime: string;
    endTime: string;
  }) {
    try {
      const result = await AppointmentService.createAppointment({
        patient_id: params.patientId,
        therapist_id: params.therapistId,
        start_time: params.startTime,
        end_time: params.endTime,
        status: 'agendado',
      });

      return result;
    } catch (error) {
      console.error('Error booking appointment:', error);
      return { data: null, error };
    }
  }
}

