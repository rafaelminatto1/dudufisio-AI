import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { addMinutes, format, parseISO, isWithinInterval } from 'date-fns';

// Mock Supabase client
const mockSupabaseClient = {
  from: vi.fn(() => ({
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    neq: vi.fn().mockReturnThis(),
    gte: vi.fn().mockReturnThis(),
    lte: vi.fn().mockReturnThis(),
    or: vi.fn().mockReturnThis(),
    and: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn()
  })),
  rpc: vi.fn()
};

vi.mock('@supabase/auth-helpers-react', () => ({
  useSupabaseClient: () => mockSupabaseClient
}));

// Helper function to check time overlap
function hasTimeOverlap(
  start1: string,
  end1: string,
  start2: string,
  end2: string
): boolean {
  const s1 = parseISO(`2024-02-20T${start1}:00`);
  const e1 = parseISO(`2024-02-20T${end1}:00`);
  const s2 = parseISO(`2024-02-20T${start2}:00`);
  const e2 = parseISO(`2024-02-20T${end2}:00`);
  
  return (s1 < e2 && s2 < e1);
}

describe('Appointment Scheduling Conflicts Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Basic Conflict Detection', () => {
    it('should detect exact time overlap conflict', async () => {
      const existingAppointment = {
        id: 'apt-existing',
        therapist_id: 'therapist-1',
        patient_id: 'patient-1',
        date: '2024-02-20',
        startTime: '14:00',
        endTime: '15:00',
        room: 'Sala 1',
        status: 'confirmed'
      };

      const newAppointment = {
        therapist_id: 'therapist-1',
        patient_id: 'patient-2',
        date: '2024-02-20',
        startTime: '14:00',
        endTime: '15:00',
        room: 'Sala 2'
      };

      // Mock query for existing appointments
      const conflictQuery = mockSupabaseClient.from('appointments');
      conflictQuery.select.mockReturnThis();
      conflictQuery.eq.mockReturnThis();
      conflictQuery.neq.mockReturnThis();
      conflictQuery.and.mockResolvedValueOnce({
        data: [existingAppointment],
        error: null
      });

      // Check for conflicts
      const result = await conflictQuery
        .select('*')
        .eq('therapist_id', newAppointment.therapist_id)
        .eq('date', newAppointment.date)
        .neq('status', 'cancelled');

      const hasConflict = result.data.some(apt => 
        hasTimeOverlap(
          newAppointment.startTime,
          newAppointment.endTime,
          apt.startTime,
          apt.endTime
        )
      );

      expect(hasConflict).toBe(true);
      expect(result.data).toHaveLength(1);
    });

    it('should detect partial overlap at start', async () => {
      const existingAppointment = {
        id: 'apt-1',
        therapist_id: 'therapist-1',
        date: '2024-02-20',
        startTime: '14:00',
        endTime: '15:00',
        status: 'confirmed'
      };

      const newAppointment = {
        therapist_id: 'therapist-1',
        date: '2024-02-20',
        startTime: '13:30',
        endTime: '14:30'
      };

      const conflictQuery = mockSupabaseClient.from('appointments');
      conflictQuery.select.mockReturnThis();
      conflictQuery.eq.mockReturnThis();
      conflictQuery.neq.mockReturnThis();
      conflictQuery.and.mockResolvedValueOnce({
        data: [existingAppointment],
        error: null
      });

      const result = await conflictQuery
        .select('*')
        .eq('therapist_id', newAppointment.therapist_id)
        .eq('date', newAppointment.date)
        .neq('status', 'cancelled');

      const hasConflict = result.data.some(apt => 
        hasTimeOverlap(
          newAppointment.startTime,
          newAppointment.endTime,
          apt.startTime,
          apt.endTime
        )
      );

      expect(hasConflict).toBe(true);
    });

    it('should detect partial overlap at end', async () => {
      const existingAppointment = {
        id: 'apt-1',
        therapist_id: 'therapist-1',
        date: '2024-02-20',
        startTime: '14:00',
        endTime: '15:00',
        status: 'scheduled'
      };

      const newAppointment = {
        therapist_id: 'therapist-1',
        date: '2024-02-20',
        startTime: '14:30',
        endTime: '15:30'
      };

      const conflictQuery = mockSupabaseClient.from('appointments');
      conflictQuery.select.mockReturnThis();
      conflictQuery.eq.mockReturnThis();
      conflictQuery.neq.mockReturnThis();
      conflictQuery.and.mockResolvedValueOnce({
        data: [existingAppointment],
        error: null
      });

      const result = await conflictQuery
        .select('*')
        .eq('therapist_id', newAppointment.therapist_id)
        .eq('date', newAppointment.date)
        .neq('status', 'cancelled');

      const hasConflict = result.data.some(apt => 
        hasTimeOverlap(
          newAppointment.startTime,
          newAppointment.endTime,
          apt.startTime,
          apt.endTime
        )
      );

      expect(hasConflict).toBe(true);
    });

    it('should detect appointment completely contained within another', async () => {
      const existingAppointment = {
        id: 'apt-1',
        therapist_id: 'therapist-1',
        date: '2024-02-20',
        startTime: '14:00',
        endTime: '16:00',
        status: 'confirmed'
      };

      const newAppointment = {
        therapist_id: 'therapist-1',
        date: '2024-02-20',
        startTime: '14:30',
        endTime: '15:30'
      };

      const conflictQuery = mockSupabaseClient.from('appointments');
      conflictQuery.select.mockReturnThis();
      conflictQuery.eq.mockReturnThis();
      conflictQuery.neq.mockReturnThis();
      conflictQuery.and.mockResolvedValueOnce({
        data: [existingAppointment],
        error: null
      });

      const result = await conflictQuery
        .select('*')
        .eq('therapist_id', newAppointment.therapist_id)
        .eq('date', newAppointment.date)
        .neq('status', 'cancelled');

      const hasConflict = result.data.some(apt => 
        hasTimeOverlap(
          newAppointment.startTime,
          newAppointment.endTime,
          apt.startTime,
          apt.endTime
        )
      );

      expect(hasConflict).toBe(true);
    });

    it('should not detect conflict with adjacent appointments', async () => {
      const existingAppointments = [
        {
          id: 'apt-1',
          therapist_id: 'therapist-1',
          date: '2024-02-20',
          startTime: '14:00',
          endTime: '15:00',
          status: 'confirmed'
        },
        {
          id: 'apt-2',
          therapist_id: 'therapist-1',
          date: '2024-02-20',
          startTime: '16:00',
          endTime: '17:00',
          status: 'confirmed'
        }
      ];

      const newAppointment = {
        therapist_id: 'therapist-1',
        date: '2024-02-20',
        startTime: '15:00',
        endTime: '16:00'
      };

      const conflictQuery = mockSupabaseClient.from('appointments');
      conflictQuery.select.mockReturnThis();
      conflictQuery.eq.mockReturnThis();
      conflictQuery.neq.mockReturnThis();
      conflictQuery.and.mockResolvedValueOnce({
        data: existingAppointments,
        error: null
      });

      const result = await conflictQuery
        .select('*')
        .eq('therapist_id', newAppointment.therapist_id)
        .eq('date', newAppointment.date)
        .neq('status', 'cancelled');

      const hasConflict = result.data.some(apt => 
        hasTimeOverlap(
          newAppointment.startTime,
          newAppointment.endTime,
          apt.startTime,
          apt.endTime
        )
      );

      expect(hasConflict).toBe(false);
    });
  });

  describe('Room Conflicts', () => {
    it('should detect room conflict even with different therapists', async () => {
      const existingAppointment = {
        id: 'apt-1',
        therapist_id: 'therapist-1',
        patient_id: 'patient-1',
        date: '2024-02-20',
        startTime: '14:00',
        endTime: '15:00',
        room: 'Sala 1',
        status: 'confirmed'
      };

      const newAppointment = {
        therapist_id: 'therapist-2',  // Different therapist
        patient_id: 'patient-2',
        date: '2024-02-20',
        startTime: '14:30',
        endTime: '15:30',
        room: 'Sala 1'  // Same room
      };

      const roomConflictQuery = mockSupabaseClient.from('appointments');
      roomConflictQuery.select.mockReturnThis();
      roomConflictQuery.eq.mockReturnThis();
      roomConflictQuery.neq.mockReturnThis();
      roomConflictQuery.and.mockResolvedValueOnce({
        data: [existingAppointment],
        error: null
      });

      const result = await roomConflictQuery
        .select('*')
        .eq('room', newAppointment.room)
        .eq('date', newAppointment.date)
        .neq('status', 'cancelled');

      const hasRoomConflict = result.data.some(apt => 
        hasTimeOverlap(
          newAppointment.startTime,
          newAppointment.endTime,
          apt.startTime,
          apt.endTime
        )
      );

      expect(hasRoomConflict).toBe(true);
    });

    it('should allow same time slot in different rooms', async () => {
      const existingAppointment = {
        id: 'apt-1',
        therapist_id: 'therapist-1',
        date: '2024-02-20',
        startTime: '14:00',
        endTime: '15:00',
        room: 'Sala 1',
        status: 'confirmed'
      };

      const newAppointment = {
        therapist_id: 'therapist-2',
        date: '2024-02-20',
        startTime: '14:00',
        endTime: '15:00',
        room: 'Sala 2'  // Different room
      };

      const roomConflictQuery = mockSupabaseClient.from('appointments');
      roomConflictQuery.select.mockReturnThis();
      roomConflictQuery.eq.mockReturnThis();
      roomConflictQuery.neq.mockReturnThis();
      roomConflictQuery.and.mockResolvedValueOnce({
        data: [],  // No conflicts in Sala 2
        error: null
      });

      const result = await roomConflictQuery
        .select('*')
        .eq('room', newAppointment.room)
        .eq('date', newAppointment.date)
        .neq('status', 'cancelled');

      expect(result.data).toHaveLength(0);
    });
  });

  describe('Patient Conflicts', () => {
    it('should detect patient double-booking', async () => {
      const existingAppointment = {
        id: 'apt-1',
        therapist_id: 'therapist-1',
        patient_id: 'patient-1',
        date: '2024-02-20',
        startTime: '14:00',
        endTime: '15:00',
        status: 'confirmed'
      };

      const newAppointment = {
        therapist_id: 'therapist-2',  // Different therapist
        patient_id: 'patient-1',  // Same patient
        date: '2024-02-20',
        startTime: '14:30',
        endTime: '15:30'
      };

      const patientConflictQuery = mockSupabaseClient.from('appointments');
      patientConflictQuery.select.mockReturnThis();
      patientConflictQuery.eq.mockReturnThis();
      patientConflictQuery.neq.mockReturnThis();
      patientConflictQuery.and.mockResolvedValueOnce({
        data: [existingAppointment],
        error: null
      });

      const result = await patientConflictQuery
        .select('*')
        .eq('patient_id', newAppointment.patient_id)
        .eq('date', newAppointment.date)
        .neq('status', 'cancelled');

      const hasPatientConflict = result.data.some(apt => 
        hasTimeOverlap(
          newAppointment.startTime,
          newAppointment.endTime,
          apt.startTime,
          apt.endTime
        )
      );

      expect(hasPatientConflict).toBe(true);
    });

    it('should allow back-to-back appointments for same patient', async () => {
      const existingAppointment = {
        id: 'apt-1',
        therapist_id: 'therapist-1',
        patient_id: 'patient-1',
        date: '2024-02-20',
        startTime: '14:00',
        endTime: '15:00',
        status: 'confirmed'
      };

      const newAppointment = {
        therapist_id: 'therapist-2',
        patient_id: 'patient-1',
        date: '2024-02-20',
        startTime: '15:00',  // Starts exactly when previous ends
        endTime: '16:00'
      };

      const patientConflictQuery = mockSupabaseClient.from('appointments');
      patientConflictQuery.select.mockReturnThis();
      patientConflictQuery.eq.mockReturnThis();
      patientConflictQuery.neq.mockReturnThis();
      patientConflictQuery.and.mockResolvedValueOnce({
        data: [existingAppointment],
        error: null
      });

      const result = await patientConflictQuery
        .select('*')
        .eq('patient_id', newAppointment.patient_id)
        .eq('date', newAppointment.date)
        .neq('status', 'cancelled');

      const hasPatientConflict = result.data.some(apt => 
        hasTimeOverlap(
          newAppointment.startTime,
          newAppointment.endTime,
          apt.startTime,
          apt.endTime
        )
      );

      expect(hasPatientConflict).toBe(false);
    });
  });

  describe('Status-based Conflict Rules', () => {
    it('should not conflict with cancelled appointments', async () => {
      const cancelledAppointment = {
        id: 'apt-cancelled',
        therapist_id: 'therapist-1',
        date: '2024-02-20',
        startTime: '14:00',
        endTime: '15:00',
        status: 'cancelled'
      };

      const newAppointment = {
        therapist_id: 'therapist-1',
        date: '2024-02-20',
        startTime: '14:00',
        endTime: '15:00'
      };

      const conflictQuery = mockSupabaseClient.from('appointments');
      conflictQuery.select.mockReturnThis();
      conflictQuery.eq.mockReturnThis();
      conflictQuery.neq.mockReturnThis();
      conflictQuery.and.mockResolvedValueOnce({
        data: [],  // Cancelled appointments are filtered out
        error: null
      });

      const result = await conflictQuery
        .select('*')
        .eq('therapist_id', newAppointment.therapist_id)
        .eq('date', newAppointment.date)
        .neq('status', 'cancelled');

      expect(result.data).toHaveLength(0);
    });

    it('should conflict with in-progress appointments', async () => {
      const inProgressAppointment = {
        id: 'apt-progress',
        therapist_id: 'therapist-1',
        date: '2024-02-20',
        startTime: '14:00',
        endTime: '15:00',
        status: 'in_progress'
      };

      const newAppointment = {
        therapist_id: 'therapist-1',
        date: '2024-02-20',
        startTime: '14:30',
        endTime: '15:30'
      };

      const conflictQuery = mockSupabaseClient.from('appointments');
      conflictQuery.select.mockReturnThis();
      conflictQuery.eq.mockReturnThis();
      conflictQuery.neq.mockReturnThis();
      conflictQuery.and.mockResolvedValueOnce({
        data: [inProgressAppointment],
        error: null
      });

      const result = await conflictQuery
        .select('*')
        .eq('therapist_id', newAppointment.therapist_id)
        .eq('date', newAppointment.date)
        .neq('status', 'cancelled');

      const hasConflict = result.data.some(apt => 
        hasTimeOverlap(
          newAppointment.startTime,
          newAppointment.endTime,
          apt.startTime,
          apt.endTime
        )
      );

      expect(hasConflict).toBe(true);
    });
  });

  describe('Bulk Scheduling Conflicts', () => {
    it('should detect conflicts when scheduling recurring appointments', async () => {
      const recurringAppointments = [
        {
          therapist_id: 'therapist-1',
          patient_id: 'patient-1',
          date: '2024-02-20',
          startTime: '14:00',
          endTime: '15:00'
        },
        {
          therapist_id: 'therapist-1',
          patient_id: 'patient-1',
          date: '2024-02-27',
          startTime: '14:00',
          endTime: '15:00'
        },
        {
          therapist_id: 'therapist-1',
          patient_id: 'patient-1',
          date: '2024-03-05',
          startTime: '14:00',
          endTime: '15:00'
        }
      ];

      const existingAppointments = [
        {
          id: 'apt-existing',
          therapist_id: 'therapist-1',
          patient_id: 'patient-2',
          date: '2024-02-27',
          startTime: '14:00',
          endTime: '15:00',
          status: 'confirmed'
        }
      ];

      // Check each recurring appointment for conflicts
      const conflictResults = [];
      for (const appointment of recurringAppointments) {
        const conflictQuery = mockSupabaseClient.from('appointments');
        conflictQuery.select.mockReturnThis();
        conflictQuery.eq.mockReturnThis();
        conflictQuery.neq.mockReturnThis();
        
        // Mock different results based on date
        if (appointment.date === '2024-02-27') {
          conflictQuery.and.mockResolvedValueOnce({
            data: existingAppointments,
            error: null
          });
        } else {
          conflictQuery.and.mockResolvedValueOnce({
            data: [],
            error: null
          });
        }

        const result = await conflictQuery
          .select('*')
          .eq('therapist_id', appointment.therapist_id)
          .eq('date', appointment.date)
          .neq('status', 'cancelled');

        const hasConflict = result.data.some(apt => 
          hasTimeOverlap(
            appointment.startTime,
            appointment.endTime,
            apt.startTime,
            apt.endTime
          )
        );

        conflictResults.push({
          date: appointment.date,
          hasConflict
        });
      }

      expect(conflictResults[0].hasConflict).toBe(false); // 2024-02-20
      expect(conflictResults[1].hasConflict).toBe(true);  // 2024-02-27 (conflict)
      expect(conflictResults[2].hasConflict).toBe(false); // 2024-03-05
    });

    it('should suggest alternative time slots for conflicts', async () => {
      const requestedAppointment = {
        therapist_id: 'therapist-1',
        date: '2024-02-20',
        startTime: '14:00',
        endTime: '15:00',
        duration: 60  // minutes
      };

      const existingAppointments = [
        {
          id: 'apt-1',
          therapist_id: 'therapist-1',
          date: '2024-02-20',
          startTime: '09:00',
          endTime: '10:00',
          status: 'confirmed'
        },
        {
          id: 'apt-2',
          therapist_id: 'therapist-1',
          date: '2024-02-20',
          startTime: '14:00',
          endTime: '15:00',
          status: 'confirmed'
        },
        {
          id: 'apt-3',
          therapist_id: 'therapist-1',
          date: '2024-02-20',
          startTime: '16:00',
          endTime: '17:00',
          status: 'confirmed'
        }
      ];

      // Get therapist's schedule for the day
      const scheduleQuery = mockSupabaseClient.from('appointments');
      scheduleQuery.select.mockReturnThis();
      scheduleQuery.eq.mockReturnThis();
      scheduleQuery.neq.mockReturnThis();
      scheduleQuery.order.mockResolvedValueOnce({
        data: existingAppointments,
        error: null
      });

      const result = await scheduleQuery
        .select('*')
        .eq('therapist_id', requestedAppointment.therapist_id)
        .eq('date', requestedAppointment.date)
        .neq('status', 'cancelled')
        .order('startTime');

      // Find available slots
      const workingHours = { start: '08:00', end: '18:00' };
      const availableSlots = [];
      
      // Check slot before first appointment
      if (result.data[0].startTime > workingHours.start) {
        availableSlots.push({
          startTime: workingHours.start,
          endTime: result.data[0].startTime
        });
      }

      // Check slots between appointments
      for (let i = 0; i < result.data.length - 1; i++) {
        const gap = {
          startTime: result.data[i].endTime,
          endTime: result.data[i + 1].startTime
        };
        
        // Calculate gap duration in minutes
        const gapStart = parseISO(`2024-02-20T${gap.startTime}:00`);
        const gapEnd = parseISO(`2024-02-20T${gap.endTime}:00`);
        const gapDuration = (gapEnd.getTime() - gapStart.getTime()) / (1000 * 60);
        
        if (gapDuration >= requestedAppointment.duration) {
          availableSlots.push(gap);
        }
      }

      // Check slot after last appointment
      const lastAppointment = result.data[result.data.length - 1];
      if (lastAppointment.endTime < workingHours.end) {
        availableSlots.push({
          startTime: lastAppointment.endTime,
          endTime: workingHours.end
        });
      }

      expect(availableSlots).toHaveLength(3);
      expect(availableSlots[0].startTime).toBe('10:00');
      expect(availableSlots[0].endTime).toBe('14:00');
      expect(availableSlots[1].startTime).toBe('15:00');
      expect(availableSlots[1].endTime).toBe('16:00');
    });
  });

  describe('Conflict Resolution', () => {
    it('should reschedule appointment to resolve conflict', async () => {
      const conflictingAppointment = {
        id: 'apt-conflict',
        therapist_id: 'therapist-1',
        patient_id: 'patient-1',
        date: '2024-02-20',
        startTime: '14:00',
        endTime: '15:00',
        status: 'scheduled'
      };

      const newTimeSlot = {
        date: '2024-02-20',
        startTime: '16:00',
        endTime: '17:00'
      };

      // Check new slot availability
      const availabilityQuery = mockSupabaseClient.from('appointments');
      availabilityQuery.select.mockReturnThis();
      availabilityQuery.eq.mockReturnThis();
      availabilityQuery.neq.mockReturnThis();
      availabilityQuery.and.mockResolvedValueOnce({
        data: [],  // No conflicts in new slot
        error: null
      });

      const availabilityCheck = await availabilityQuery
        .select('*')
        .eq('therapist_id', conflictingAppointment.therapist_id)
        .eq('date', newTimeSlot.date)
        .neq('status', 'cancelled');

      const isAvailable = !availabilityCheck.data.some(apt => 
        hasTimeOverlap(
          newTimeSlot.startTime,
          newTimeSlot.endTime,
          apt.startTime,
          apt.endTime
        )
      );

      expect(isAvailable).toBe(true);

      // Update appointment to new time
      if (isAvailable) {
        const updateQuery = mockSupabaseClient.from('appointments');
        updateQuery.update.mockReturnThis();
        updateQuery.eq.mockResolvedValueOnce({
          data: {
            ...conflictingAppointment,
            ...newTimeSlot,
            rescheduled: true,
            rescheduled_at: new Date().toISOString()
          },
          error: null
        });

        const result = await updateQuery
          .update({
            ...newTimeSlot,
            rescheduled: true,
            rescheduled_at: new Date().toISOString()
          })
          .eq('id', conflictingAppointment.id);

        expect(result.data.startTime).toBe('16:00');
        expect(result.data.rescheduled).toBe(true);
      }
    });

    it('should swap appointments to resolve conflicts', async () => {
      const appointment1 = {
        id: 'apt-1',
        therapist_id: 'therapist-1',
        patient_id: 'patient-1',
        date: '2024-02-20',
        startTime: '14:00',
        endTime: '15:00',
        room: 'Sala 1',
        status: 'scheduled'
      };

      const appointment2 = {
        id: 'apt-2',
        therapist_id: 'therapist-2',
        patient_id: 'patient-2',
        date: '2024-02-20',
        startTime: '15:00',
        endTime: '16:00',
        room: 'Sala 2',
        status: 'scheduled'
      };

      // Swap logic: appointment1 needs Sala 2 at 14:00, appointment2 can use Sala 1
      const swapUpdates = [
        { id: 'apt-1', room: 'Sala 2' },
        { id: 'apt-2', room: 'Sala 1' }
      ];

      // Begin transaction (simulated)
      const updates = [];
      for (const update of swapUpdates) {
        const updateQuery = mockSupabaseClient.from('appointments');
        updateQuery.update.mockReturnThis();
        updateQuery.eq.mockResolvedValueOnce({
          data: { ...update },
          error: null
        });

        const result = await updateQuery
          .update({ room: update.room })
          .eq('id', update.id);

        updates.push(result.data);
      }

      expect(updates[0].room).toBe('Sala 2');
      expect(updates[1].room).toBe('Sala 1');
    });
  });

  describe('Complex Scheduling Scenarios', () => {
    it('should handle group session scheduling with multiple patients', async () => {
      const groupSession = {
        therapist_id: 'therapist-1',
        date: '2024-02-20',
        startTime: '18:00',
        endTime: '19:00',
        type: 'group',
        room: 'Sala de Pilates',
        maxPatients: 6,
        patients: [
          'patient-1',
          'patient-2',
          'patient-3',
          'patient-4'
        ]
      };

      // Check room availability
      const roomQuery = mockSupabaseClient.from('appointments');
      roomQuery.select.mockReturnThis();
      roomQuery.eq.mockReturnThis();
      roomQuery.neq.mockReturnThis();
      roomQuery.and.mockResolvedValueOnce({
        data: [],
        error: null
      });

      const roomAvailable = await roomQuery
        .select('*')
        .eq('room', groupSession.room)
        .eq('date', groupSession.date)
        .neq('status', 'cancelled');

      // Check each patient's availability
      const patientConflicts = [];
      for (const patientId of groupSession.patients) {
        const patientQuery = mockSupabaseClient.from('appointments');
        patientQuery.select.mockReturnThis();
        patientQuery.eq.mockReturnThis();
        patientQuery.neq.mockReturnThis();
        patientQuery.and.mockResolvedValueOnce({
          data: [],
          error: null
        });

        const result = await patientQuery
          .select('*')
          .eq('patient_id', patientId)
          .eq('date', groupSession.date)
          .neq('status', 'cancelled');

        const hasConflict = result.data.some(apt => 
          hasTimeOverlap(
            groupSession.startTime,
            groupSession.endTime,
            apt.startTime,
            apt.endTime
          )
        );

        if (hasConflict) {
          patientConflicts.push(patientId);
        }
      }

      expect(roomAvailable.data).toHaveLength(0);
      expect(patientConflicts).toHaveLength(0);
      expect(groupSession.patients.length).toBeLessThanOrEqual(groupSession.maxPatients);
    });

    it('should handle buffer time between appointments', async () => {
      const bufferTime = 15; // minutes
      const existingAppointment = {
        id: 'apt-1',
        therapist_id: 'therapist-1',
        date: '2024-02-20',
        startTime: '14:00',
        endTime: '15:00',
        status: 'confirmed'
      };

      const newAppointment = {
        therapist_id: 'therapist-1',
        date: '2024-02-20',
        startTime: '15:00',  // Immediately after
        endTime: '16:00'
      };

      // Calculate actual available time with buffer
      const existingEndWithBuffer = format(
        addMinutes(parseISO(`2024-02-20T${existingAppointment.endTime}:00`), bufferTime),
        'HH:mm'
      );

      const hasBufferConflict = newAppointment.startTime < existingEndWithBuffer;

      expect(hasBufferConflict).toBe(true);
      expect(existingEndWithBuffer).toBe('15:15');

      // Suggest adjusted time
      const adjustedAppointment = {
        ...newAppointment,
        startTime: existingEndWithBuffer,
        endTime: format(
          addMinutes(parseISO(`2024-02-20T${existingEndWithBuffer}:00`), 60),
          'HH:mm'
        )
      };

      expect(adjustedAppointment.startTime).toBe('15:15');
      expect(adjustedAppointment.endTime).toBe('16:15');
    });

    it('should validate working hours constraints', async () => {
      const workingHours = {
        monday: { start: '08:00', end: '18:00' },
        tuesday: { start: '08:00', end: '18:00' },
        wednesday: { start: '08:00', end: '20:00' },  // Extended hours
        thursday: { start: '08:00', end: '18:00' },
        friday: { start: '08:00', end: '17:00' },
        saturday: { start: '08:00', end: '12:00' },
        sunday: null  // Closed
      };

      const appointments = [
        {
          date: '2024-02-19',  // Monday
          startTime: '07:00',
          endTime: '08:00',
          valid: false  // Before working hours
        },
        {
          date: '2024-02-21',  // Wednesday
          startTime: '19:00',
          endTime: '20:00',
          valid: true  // Within extended hours
        },
        {
          date: '2024-02-24',  // Saturday
          startTime: '11:00',
          endTime: '12:00',
          valid: true  // Within Saturday hours
        },
        {
          date: '2024-02-25',  // Sunday
          startTime: '10:00',
          endTime: '11:00',
          valid: false  // Closed on Sunday
        }
      ];

      for (const apt of appointments) {
        const dayOfWeek = format(parseISO(apt.date), 'EEEE').toLowerCase();
        const hours = workingHours[dayOfWeek as keyof typeof workingHours];
        
        let isValid = false;
        if (hours) {
          isValid = apt.startTime >= hours.start && apt.endTime <= hours.end;
        }

        expect(isValid).toBe(apt.valid);
      }
    });
  });
});