import { useEffect, useState } from 'react';
import type { Appointment } from '../types';

const MOCK_APPOINTMENTS: Appointment[] = [
  {
    id: 'appointment-1',
    therapist: 'Dra. Ana Paula',
    date: '08/11',
    startTime: '09:30',
    location: 'Clínica Paulista • Sala 3',
    status: 'scheduled',
  },
  {
    id: 'appointment-2',
    therapist: 'Dr. Roberto Lima',
    date: '10/11',
    startTime: '14:00',
    location: 'Online • Teleconsulta',
    status: 'scheduled',
  },
];

export function useAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setAppointments(MOCK_APPOINTMENTS);
      setLoading(false);
    }, 600);

    return () => clearTimeout(timeout);
  }, []);

  return {
    appointments,
    isLoading,
  };
}

