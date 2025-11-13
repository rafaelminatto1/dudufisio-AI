import { Database } from './database-generated';

// Tipos do Supabase (schema real)
export type SupabasePatient = Database['public']['Tables']['patients']['Row'];
export type SupabaseUser = Database['public']['Tables']['users']['Row'];
export type SupabaseAppointment = Database['public']['Tables']['appointments']['Row'];
export type SupabaseBodyPoint = Database['public']['Tables']['body_points']['Row'];
export type SupabaseExercise = Database['public']['Tables']['exercises']['Row'];

// Tipos da aplicação (customizados)
export interface Patient {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  birthDate: string | null;
  userId: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  createdBy: string | null;
}

export interface User {
  id: string;
  email: string;
  fullName: string | null;
  role: string | null;
  isActive: boolean | null;
  permissions: any | null;
  profileSettings: any | null;
  createdAt: string | null;
  updatedAt: string | null;
  lastLoginAt: string | null;
}

export interface BodyPoint {
  id: string;
  patientId: string | null;
  bodySide: string | null;
  painLevel: number | null;
  notes: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface Exercise {
  id: string;
  name: string;
  description: string | null;
  category: string;
  difficultyLevel: string | null;
  benefits: string[] | null;
  contraindications: string[] | null;
  instructions: string | null;
  videoUrl: string | null;
  imageUrl: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  createdBy: string | null;
}

// Mapeadores: Supabase -> Aplicação
export function mapSupabasePatientToPatient(supabasePatient: SupabasePatient): Patient {
  return {
    id: supabasePatient.id,
    name: supabasePatient.name,
    phone: supabasePatient.phone,
    email: supabasePatient.email,
    birthDate: supabasePatient.birth_date,
    userId: supabasePatient.user_id,
    createdAt: supabasePatient.created_at,
    updatedAt: supabasePatient.updated_at,
    createdBy: supabasePatient.created_by,
  };
}

export function mapSupabaseUserToUser(supabaseUser: SupabaseUser): User {
  return {
    id: supabaseUser.id,
    email: supabaseUser.email,
    fullName: supabaseUser.full_name,
    role: supabaseUser.role,
    isActive: supabaseUser.is_active,
    permissions: supabaseUser.permissions,
    profileSettings: supabaseUser.profile_settings,
    createdAt: supabaseUser.created_at,
    updatedAt: supabaseUser.updated_at,
    lastLoginAt: supabaseUser.last_login_at,
  };
}

export function mapSupabaseBodyPointToBodyPoint(supabaseBodyPoint: SupabaseBodyPoint): BodyPoint {
  return {
    id: supabaseBodyPoint.id,
    patientId: supabaseBodyPoint.patient_id,
    bodySide: supabaseBodyPoint.body_side,
    painLevel: supabaseBodyPoint.pain_level,
    notes: (supabaseBodyPoint as any).notes || null, // Field may not exist in current schema
    createdAt: supabaseBodyPoint.created_at,
    updatedAt: supabaseBodyPoint.updated_at,
  };
}

export function mapSupabaseExerciseToExercise(supabaseExercise: SupabaseExercise): Exercise {
  return {
    id: supabaseExercise.id,
    name: supabaseExercise.name,
    description: supabaseExercise.description,
    category: supabaseExercise.category,
    difficultyLevel: supabaseExercise.difficulty_level,
    benefits: supabaseExercise.benefits as string[] | null,
    contraindications: supabaseExercise.contraindications as string[] | null,
    instructions: Array.isArray(supabaseExercise.instructions)
      ? supabaseExercise.instructions.join('\n')
      : supabaseExercise.instructions ?? null,
    videoUrl: supabaseExercise.video_url ?? null,
    imageUrl:
      Array.isArray(supabaseExercise.image_urls) && supabaseExercise.image_urls.length > 0
        ? supabaseExercise.image_urls[0] ?? null
        : null,
    createdAt: supabaseExercise.created_at,
    updatedAt: supabaseExercise.updated_at,
    createdBy: supabaseExercise.created_by,
  };
}

// Mapeadores: Aplicação -> Supabase (para inserts/updates)
export function mapPatientToSupabaseInsert(patient: Partial<Patient>): Database['public']['Tables']['patients']['Insert'] {
  return {
    id: patient.id,
    name: patient.name || '',
    phone: patient.phone,
    email: patient.email,
    birth_date: patient.birthDate,
    user_id: patient.userId,
    created_by: patient.createdBy,
  };
}

export function mapPatientToSupabaseUpdate(patient: Partial<Patient>): Database['public']['Tables']['patients']['Update'] {
  return {
    name: patient.name,
    phone: patient.phone,
    email: patient.email,
    birth_date: patient.birthDate,
    updated_at: new Date().toISOString(),
  };
}

export function mapUserToSupabaseInsert(user: Partial<User>): Database['public']['Tables']['users']['Insert'] {
  return {
    id: user.id,
    email: user.email || '',
    full_name: user.fullName,
    role: user.role,
    is_active: user.isActive,
    permissions: user.permissions,
    profile_settings: user.profileSettings,
  };
}

export function mapUserToSupabaseUpdate(user: Partial<User>): Database['public']['Tables']['users']['Update'] {
  return {
    full_name: user.fullName,
    role: user.role,
    is_active: user.isActive,
    permissions: user.permissions,
    profile_settings: user.profileSettings,
    updated_at: new Date().toISOString(),
  };
}

// Utilitários para conversão em lote
export function mapSupabasePatientsToPatients(supabasePatients: SupabasePatient[]): Patient[] {
  return supabasePatients.map(mapSupabasePatientToPatient);
}

export function mapSupabaseUsersToUsers(supabaseUsers: SupabaseUser[]): User[] {
  return supabaseUsers.map(mapSupabaseUserToUser);
}

export function mapSupabaseBodyPointsToBodyPoints(supabaseBodyPoints: SupabaseBodyPoint[]): BodyPoint[] {
  return supabaseBodyPoints.map(mapSupabaseBodyPointToBodyPoint);
}

export function mapSupabaseExercisesToExercises(supabaseExercises: SupabaseExercise[]): Exercise[] {
  return supabaseExercises.map(mapSupabaseExerciseToExercise);
}

// Tipos de resposta para APIs
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  success: boolean;
}

export function createApiResponse<T>(data: T | null, error: string | null = null): ApiResponse<T> {
  return {
    data,
    error,
    success: error === null,
  };
}

// Utilitários para validação de dados
export function isValidPatient(patient: any): patient is Patient {
  return (
    typeof patient === 'object' &&
    patient !== null &&
    typeof patient.id === 'string' &&
    typeof patient.name === 'string'
  );
}

export function isValidUser(user: any): user is User {
  return (
    typeof user === 'object' &&
    user !== null &&
    typeof user.id === 'string' &&
    typeof user.email === 'string'
  );
}
