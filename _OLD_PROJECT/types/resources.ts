export type ResourceType = 'room' | 'equipment' | 'material';
export type ResourceStatus = 'available' | 'in-use' | 'maintenance' | 'unavailable';

export interface Resource {
  id: string;
  name: string;
  type: ResourceType;
  status: ResourceStatus;
  description?: string;
  capacity?: number;
  location?: string;
  features?: string[];
  image?: string;
  assignedTo?: string; // Therapist ID
  maintenanceSchedule?: {
    lastMaintenance: Date;
    nextMaintenance: Date;
  };
  usageCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ResourceAllocation {
  id: string;
  resourceId: string;
  appointmentId?: string;
  therapistId?: string;
  startTime: Date;
  endTime: Date;
  purpose: string;
  notes?: string;
  createdAt: Date;
}

export const defaultResources: Omit<Resource, 'id' | 'createdAt' | 'updatedAt' | 'usageCount'>[] = [
  // Salas
  {
    name: 'Sala 1 - Fisioterapia',
    type: 'room',
    status: 'available',
    description: 'Sala principal de fisioterapia motora',
    capacity: 1,
    location: 'Térreo',
    features: ['Maca', 'Espelho', 'Ar Condicionado']
  },
  {
    name: 'Sala 2 - Pilates',
    type: 'room',
    status: 'available',
    description: 'Sala equipada para pilates',
    capacity: 2,
    location: 'Térreo',
    features: ['Reformer', 'Cadillac', 'Bolas', 'Ar Condicionado']
  },
  {
    name: 'Sala 3 - Avaliação',
    type: 'room',
    status: 'available',
    description: 'Sala para avaliações e consultas',
    capacity: 1,
    location: '1º Andar',
    features: ['Mesa', 'Cadeiras', 'Computador']
  },
  // Equipamentos
  {
    name: 'Ultrassom Terapêutico',
    type: 'equipment',
    status: 'available',
    description: 'Equipamento de ultrassom para tratamento',
    location: 'Sala 1'
  },
  {
    name: 'TENS (Estimulação Elétrica)',
    type: 'equipment',
    status: 'available',
    description: 'Aparelho de eletroestimulação',
    location: 'Sala 1'
  },
  {
    name: 'Laser Terapêutico',
    type: 'equipment',
    status: 'available',
    description: 'Laser de baixa potência',
    location: 'Sala 1'
  },
  {
    name: 'Reformer (Pilates)',
    type: 'equipment',
    status: 'available',
    description: 'Equipamento principal de pilates',
    location: 'Sala 2'
  },
  // Materiais
  {
    name: 'Bolas Suíças',
    type: 'material',
    status: 'available',
    description: 'Conjunto de bolas terapêuticas',
    location: 'Sala 2'
  },
  {
    name: 'Faixas Elásticas',
    type: 'material',
    status: 'available',
    description: 'Kit de faixas de resistência',
    location: 'Sala 1'
  },
  {
    name: 'Pesos e Halteres',
    type: 'material',
    status: 'available',
    description: 'Conjunto de pesos para fortalecimento',
    location: 'Sala 1'
  }
];

