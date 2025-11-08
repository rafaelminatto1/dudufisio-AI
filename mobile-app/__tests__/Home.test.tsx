import { render, screen } from '@testing-library/react-native';
import React from 'react';

jest.mock('../hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: '1', name: 'João', email: 'joao@example.com' },
  }),
}));

jest.mock('../hooks/useAppointments', () => ({
  useAppointments: () => ({
    appointments: [
      {
        id: '1',
        therapist: 'Dra. Ana Paula',
        date: '08/11',
        startTime: '09:30',
        location: 'Clínica Paulista',
        status: 'scheduled',
      },
    ],
  }),
}));

import HomeScreen from '../app/(tabs)/home';

describe('HomeScreen', () => {
  it('exibe saudação e consultas', () => {
    render(<HomeScreen />);
    expect(screen.getByText(/Olá, João/)).toBeTruthy();
    expect(screen.getByText(/Dra. Ana Paula/)).toBeTruthy();
  });
});

