interface ProfessionalLocation {
  city: string;
  state: string;
  neighborhood: string;
  distance?: number;
}

interface ProfessionalPricing {
  sessionPrice: number;
  acceptsInsurance: boolean;
  insuranceProviders?: string[];
}

interface ProfessionalAvailability {
  nextAvailable: string;
  responseTime: string;
  acceptsEmergency: boolean;
}

interface ProfessionalStats {
  totalPatients: number;
  successRate: number;
  completedSessions: number;
  averageImprovement: number;
}

export interface MarketplaceProfessional {
  id: string;
  name: string;
  avatar: string;
  specialty: string[];
  crefito: string;
  verified: boolean;
  rating: number;
  totalReviews: number;
  experienceYears: number;
  bio: string;
  location: ProfessionalLocation;
  pricing: ProfessionalPricing;
  availability: ProfessionalAvailability;
  stats: ProfessionalStats;
  badges: string[];
  matchScore?: number;
}

export async function fetchProfessionals(): Promise<MarketplaceProfessional[]> {
  return Promise.resolve([
    {
      id: 'PROF-001',
      name: 'Dra. Ana Paula Silva',
      avatar: 'https://i.pravatar.cc/150?u=prof001',
      specialty: ['Ortopedia', 'Esporte', 'RPG'],
      crefito: 'CREFITO-3/123456-F',
      verified: true,
      rating: 4.9,
      totalReviews: 247,
      experienceYears: 12,
      bio: 'Especialista em reabilitação ortopédica e fisioterapia esportiva. Formação em RPG e Pilates Clínico.',
      location: {
        city: 'São Paulo',
        state: 'SP',
        neighborhood: 'Jardim Paulista',
        distance: 2.3,
      },
      pricing: {
        sessionPrice: 250,
        acceptsInsurance: true,
        insuranceProviders: ['Unimed', 'Bradesco Saúde', 'SulAmérica'],
      },
      availability: {
        nextAvailable: new Date('2025-11-08T14:00:00').toISOString(),
        responseTime: '< 2h',
        acceptsEmergency: true,
      },
      stats: {
        totalPatients: 456,
        successRate: 94,
        completedSessions: 2341,
        averageImprovement: 87,
      },
      badges: ['Top Rated', 'Quick Response', 'Verified Pro'],
      matchScore: 98,
    },
    {
      id: 'PROF-002',
      name: 'Dr. Roberto Lima',
      avatar: 'https://i.pravatar.cc/150?u=prof002',
      specialty: ['Neurologia', 'Geriátrica'],
      crefito: 'CREFITO-3/234567-F',
      verified: true,
      rating: 4.8,
      totalReviews: 189,
      experienceYears: 15,
      bio: 'Especialista em reabilitação neurológica e fisioterapia geriátrica. PhD em Neurociências.',
      location: {
        city: 'São Paulo',
        state: 'SP',
        neighborhood: 'Vila Mariana',
        distance: 4.1,
      },
      pricing: {
        sessionPrice: 280,
        acceptsInsurance: true,
        insuranceProviders: ['Unimed', 'Amil'],
      },
      availability: {
        nextAvailable: new Date('2025-11-09T10:00:00').toISOString(),
        responseTime: '< 4h',
        acceptsEmergency: false,
      },
      stats: {
        totalPatients: 312,
        successRate: 92,
        completedSessions: 1876,
        averageImprovement: 85,
      },
      badges: ['PhD Certified', 'Top Rated'],
      matchScore: 85,
    },
  ]);
}

