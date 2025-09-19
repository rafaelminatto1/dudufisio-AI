import { z } from 'zod';

// Enums for Pain Point
export const BodySide = {
  LEFT: 'left',
  RIGHT: 'right',
  BILATERAL: 'bilateral',
  CENTER: 'center'
} as const;

export type BodySideType = typeof BodySide[keyof typeof BodySide];

export const PainType = {
  ACUTE: 'acute',
  CHRONIC: 'chronic',
  INTERMITTENT: 'intermittent'
} as const;

export type PainTypeType = typeof PainType[keyof typeof PainType];

// Body regions
export const BodyRegion = {
  // Head & Neck
  HEAD: 'head',
  NECK: 'neck',
  FACE: 'face',

  // Upper Body
  SHOULDER: 'shoulder',
  UPPER_ARM: 'upper_arm',
  ELBOW: 'elbow',
  FOREARM: 'forearm',
  WRIST: 'wrist',
  HAND: 'hand',
  CHEST: 'chest',
  UPPER_BACK: 'upper_back',

  // Core & Spine
  CERVICAL_SPINE: 'cervical_spine',
  THORACIC_SPINE: 'thoracic_spine',
  LUMBAR_SPINE: 'lumbar_spine',
  LOWER_BACK: 'lower_back',
  ABDOMEN: 'abdomen',
  PELVIS: 'pelvis',

  // Lower Body
  HIP: 'hip',
  THIGH: 'thigh',
  KNEE: 'knee',
  CALF: 'calf',
  SHIN: 'shin',
  ANKLE: 'ankle',
  FOOT: 'foot'
} as const;

export type BodyRegionType = typeof BodyRegion[keyof typeof BodyRegion];

// Body region categories for organization
export const BodyRegionCategory = {
  HEAD: 'head',
  TORSO: 'torso',
  UPPER_LIMB: 'upper_limb',
  LOWER_LIMB: 'lower_limb'
} as const;

export type BodyRegionCategoryType = typeof BodyRegionCategory[keyof typeof BodyRegionCategory];

// Base PainPoint interface
export interface PainPoint {
  id: string;
  patient_id: string;
  session_id?: string | null;

  // Location & Intensity
  body_region: BodyRegionType;
  body_side: BodySideType;
  coordinates_x: number; // 0-1 normalized coordinates
  coordinates_y: number; // 0-1 normalized coordinates
  pain_intensity: number; // 0-10 scale

  // Description
  pain_description?: string | null;
  pain_type?: PainTypeType | null;
  triggers?: string | null;

  // Timeline
  date_recorded: string; // ISO date string

  // System fields
  created_at: string;
}

// Request types
export interface CreatePainPointRequest {
  session_id?: string;
  body_region: BodyRegionType;
  body_side: BodySideType;
  coordinates_x: number;
  coordinates_y: number;
  pain_intensity: number;
  pain_description?: string;
  pain_type?: PainTypeType;
  triggers?: string;
  date_recorded?: string; // Optional, defaults to today
}

export interface UpdatePainPointRequest {
  pain_intensity?: number;
  pain_description?: string;
  pain_type?: PainTypeType;
  triggers?: string;
}

// Response types
export interface PainPointDetails extends PainPoint {
  session?: {
    id: string;
    appointment_date: string;
    therapist_name: string;
  } | null;
}

export interface PainTimelineEntry {
  date: string;
  average_pain: number;
  point_count: number;
  sessions: Array<{
    session_id: string;
    therapist_name: string;
  }>;
}

export interface PainPointsResponse {
  data: PainPoint[];
  timeline: PainTimelineEntry[];
}

// Body region metadata
export interface BodyRegionInfo {
  id: BodyRegionType;
  name: string;
  category: BodyRegionCategoryType;
  coordinates: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

// Validation schemas
export const createPainPointSchema = z.object({
  session_id: z.string().uuid('ID da sessão deve ser um UUID válido').optional(),

  body_region: z.enum([
    'head', 'neck', 'face', 'shoulder', 'upper_arm', 'elbow', 'forearm', 'wrist', 'hand',
    'chest', 'upper_back', 'cervical_spine', 'thoracic_spine', 'lumbar_spine', 'lower_back',
    'abdomen', 'pelvis', 'hip', 'thigh', 'knee', 'calf', 'shin', 'ankle', 'foot'
  ], { errorMap: () => ({ message: 'Região corporal inválida' }) }),

  body_side: z.enum(['left', 'right', 'bilateral', 'center'], {
    errorMap: () => ({ message: 'Lado do corpo deve ser: esquerdo, direito, bilateral ou centro' })
  }),

  coordinates_x: z
    .number()
    .min(0, 'Coordenada X deve estar entre 0 e 1')
    .max(1, 'Coordenada X deve estar entre 0 e 1'),

  coordinates_y: z
    .number()
    .min(0, 'Coordenada Y deve estar entre 0 e 1')
    .max(1, 'Coordenada Y deve estar entre 0 e 1'),

  pain_intensity: z
    .number()
    .min(0, 'Intensidade da dor deve estar entre 0 e 10')
    .max(10, 'Intensidade da dor deve estar entre 0 e 10')
    .int('Intensidade da dor deve ser um número inteiro'),

  pain_description: z
    .string()
    .max(1000, 'Descrição da dor deve ter no máximo 1000 caracteres')
    .optional(),

  pain_type: z.enum(['acute', 'chronic', 'intermittent']).optional(),

  triggers: z
    .string()
    .max(500, 'Gatilhos devem ter no máximo 500 caracteres')
    .optional(),

  date_recorded: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data deve estar no formato YYYY-MM-DD')
    .optional()
});

export const updatePainPointSchema = z.object({
  pain_intensity: z
    .number()
    .min(0, 'Intensidade da dor deve estar entre 0 e 10')
    .max(10, 'Intensidade da dor deve estar entre 0 e 10')
    .int('Intensidade da dor deve ser um número inteiro')
    .optional(),

  pain_description: z
    .string()
    .max(1000, 'Descrição da dor deve ter no máximo 1000 caracteres')
    .optional(),

  pain_type: z.enum(['acute', 'chronic', 'intermittent']).optional(),

  triggers: z
    .string()
    .max(500, 'Gatilhos devem ter no máximo 500 caracteres')
    .optional()
});

// Body region definitions with metadata
export const BODY_REGIONS: Record<BodyRegionType, BodyRegionInfo> = {
  // Head & Neck
  head: {
    id: 'head',
    name: 'Cabeça',
    category: 'head',
    coordinates: { x: 0.45, y: 0.05, width: 0.1, height: 0.1 }
  },
  neck: {
    id: 'neck',
    name: 'Pescoço',
    category: 'head',
    coordinates: { x: 0.47, y: 0.15, width: 0.06, height: 0.05 }
  },
  face: {
    id: 'face',
    name: 'Face',
    category: 'head',
    coordinates: { x: 0.46, y: 0.06, width: 0.08, height: 0.08 }
  },

  // Upper Body
  shoulder: {
    id: 'shoulder',
    name: 'Ombro',
    category: 'upper_limb',
    coordinates: { x: 0.35, y: 0.2, width: 0.3, height: 0.08 }
  },
  upper_arm: {
    id: 'upper_arm',
    name: 'Braço',
    category: 'upper_limb',
    coordinates: { x: 0.25, y: 0.28, width: 0.5, height: 0.15 }
  },
  elbow: {
    id: 'elbow',
    name: 'Cotovelo',
    category: 'upper_limb',
    coordinates: { x: 0.2, y: 0.43, width: 0.6, height: 0.05 }
  },
  forearm: {
    id: 'forearm',
    name: 'Antebraço',
    category: 'upper_limb',
    coordinates: { x: 0.22, y: 0.48, width: 0.56, height: 0.12 }
  },
  wrist: {
    id: 'wrist',
    name: 'Punho',
    category: 'upper_limb',
    coordinates: { x: 0.18, y: 0.6, width: 0.64, height: 0.04 }
  },
  hand: {
    id: 'hand',
    name: 'Mão',
    category: 'upper_limb',
    coordinates: { x: 0.15, y: 0.64, width: 0.7, height: 0.08 }
  },
  chest: {
    id: 'chest',
    name: 'Peito',
    category: 'torso',
    coordinates: { x: 0.4, y: 0.25, width: 0.2, height: 0.15 }
  },
  upper_back: {
    id: 'upper_back',
    name: 'Costas Superiores',
    category: 'torso',
    coordinates: { x: 0.4, y: 0.25, width: 0.2, height: 0.15 }
  },

  // Spine
  cervical_spine: {
    id: 'cervical_spine',
    name: 'Coluna Cervical',
    category: 'torso',
    coordinates: { x: 0.48, y: 0.15, width: 0.04, height: 0.1 }
  },
  thoracic_spine: {
    id: 'thoracic_spine',
    name: 'Coluna Torácica',
    category: 'torso',
    coordinates: { x: 0.48, y: 0.25, width: 0.04, height: 0.2 }
  },
  lumbar_spine: {
    id: 'lumbar_spine',
    name: 'Coluna Lombar',
    category: 'torso',
    coordinates: { x: 0.48, y: 0.45, width: 0.04, height: 0.1 }
  },
  lower_back: {
    id: 'lower_back',
    name: 'Lombar',
    category: 'torso',
    coordinates: { x: 0.42, y: 0.45, width: 0.16, height: 0.1 }
  },
  abdomen: {
    id: 'abdomen',
    name: 'Abdômen',
    category: 'torso',
    coordinates: { x: 0.42, y: 0.4, width: 0.16, height: 0.15 }
  },
  pelvis: {
    id: 'pelvis',
    name: 'Pelve',
    category: 'torso',
    coordinates: { x: 0.43, y: 0.55, width: 0.14, height: 0.08 }
  },

  // Lower Body
  hip: {
    id: 'hip',
    name: 'Quadril',
    category: 'lower_limb',
    coordinates: { x: 0.4, y: 0.55, width: 0.2, height: 0.08 }
  },
  thigh: {
    id: 'thigh',
    name: 'Coxa',
    category: 'lower_limb',
    coordinates: { x: 0.35, y: 0.63, width: 0.3, height: 0.15 }
  },
  knee: {
    id: 'knee',
    name: 'Joelho',
    category: 'lower_limb',
    coordinates: { x: 0.37, y: 0.78, width: 0.26, height: 0.05 }
  },
  calf: {
    id: 'calf',
    name: 'Panturrilha',
    category: 'lower_limb',
    coordinates: { x: 0.38, y: 0.83, width: 0.24, height: 0.1 }
  },
  shin: {
    id: 'shin',
    name: 'Canela',
    category: 'lower_limb',
    coordinates: { x: 0.39, y: 0.83, width: 0.22, height: 0.1 }
  },
  ankle: {
    id: 'ankle',
    name: 'Tornozelo',
    category: 'lower_limb',
    coordinates: { x: 0.4, y: 0.93, width: 0.2, height: 0.03 }
  },
  foot: {
    id: 'foot',
    name: 'Pé',
    category: 'lower_limb',
    coordinates: { x: 0.38, y: 0.96, width: 0.24, height: 0.04 }
  }
};

// Helper functions
export function getPainIntensityColor(intensity: number): string {
  if (intensity <= 2) return '#22c55e'; // Green
  if (intensity <= 5) return '#f59e0b'; // Yellow
  if (intensity <= 8) return '#f97316'; // Orange
  return '#ef4444'; // Red
}

export function getPainIntensityLabel(intensity: number): string {
  if (intensity === 0) return 'Sem dor';
  if (intensity <= 2) return 'Dor leve';
  if (intensity <= 5) return 'Dor moderada';
  if (intensity <= 8) return 'Dor intensa';
  return 'Dor muito intensa';
}

export function getPainTypeLabel(type: PainTypeType): string {
  const labels = {
    acute: 'Aguda',
    chronic: 'Crônica',
    intermittent: 'Intermitente'
  };
  return labels[type];
}

export function getBodySideLabel(side: BodySideType): string {
  const labels = {
    left: 'Esquerdo',
    right: 'Direito',
    bilateral: 'Bilateral',
    center: 'Centro'
  };
  return labels[side];
}

export function getBodyRegionsByCategory(category: BodyRegionCategoryType): BodyRegionInfo[] {
  return Object.values(BODY_REGIONS).filter(region => region.category === category);
}

export function calculatePainTrend(timeline: PainTimelineEntry[]): 'improving' | 'worsening' | 'stable' | 'insufficient_data' {
  if (timeline.length < 2) return 'insufficient_data';

  const recent = timeline.slice(-7); // Last 7 entries
  const older = timeline.slice(-14, -7); // Previous 7 entries

  if (older.length === 0) return 'insufficient_data';

  const recentAvg = recent.reduce((sum, entry) => sum + entry.average_pain, 0) / recent.length;
  const olderAvg = older.reduce((sum, entry) => sum + entry.average_pain, 0) / older.length;

  const difference = recentAvg - olderAvg;

  if (Math.abs(difference) < 0.5) return 'stable';
  return difference < 0 ? 'improving' : 'worsening';
}