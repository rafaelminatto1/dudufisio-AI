import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';

const mockProfessionals = [
  {
    id: 'PROF-TEST-1',
    name: 'Dra. Teste',
    avatar: '',
    specialty: ['Ortopedia'],
    crefito: 'CREFITO-3/999999-F',
    verified: true,
    rating: 4.9,
    totalReviews: 100,
    experienceYears: 10,
    bio: 'Bio mock',
    location: {
      city: 'São Paulo',
      state: 'SP',
      neighborhood: 'Centro',
      distance: 1.2,
    },
    pricing: {
      sessionPrice: 200,
      acceptsInsurance: true,
      insuranceProviders: ['Unimed'],
    },
    availability: {
      nextAvailable: new Date('2025-11-10T10:00:00').toISOString(),
      responseTime: '< 2h',
      acceptsEmergency: true,
    },
    stats: {
      totalPatients: 120,
      successRate: 95,
      completedSessions: 800,
      averageImprovement: 88,
    },
    badges: ['Top Rated'],
    matchScore: 99,
  },
];

vi.mock('../../services/marketplaceService', () => ({
  fetchProfessionals: () => Promise.resolve(mockProfessionals),
}));

import { ProfessionalMarketplace } from '../../features/marketplace/ProfessionalMarketplace';

describe('ProfessionalMarketplace', () => {
  it('exibe profissionais carregados da API', async () => {
    render(<ProfessionalMarketplace />);

    await waitFor(() => {
      expect(screen.getByText('Dra. Teste')).toBeInTheDocument();
    });
    expect(screen.getByText(/CREFITO-3\/999999-F/)).toBeInTheDocument();
    expect(screen.getByText(/200/)).toBeInTheDocument();
  });
});

