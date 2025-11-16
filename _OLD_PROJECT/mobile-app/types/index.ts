export interface PatientProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  goals?: string;
  nextAppointment?: string;
}

export interface Exercise {
  id: string;
  name: string;
  description: string;
  videoUrl?: string;
  difficulty: 'iniciante' | 'intermediário' | 'avançado';
  focusArea: string;
  recommendedSets: number;
  recommendedReps: number;
}

export interface Appointment {
  id: string;
  therapist: string;
  date: string;
  startTime: string;
  location: string;
  status: 'scheduled' | 'completed' | 'cancelled';
}

export interface UserSession {
  token: string;
  refreshToken?: string;
  user: PatientProfile;
}

export type AuthCredentials = {
  email: string;
  password: string;
};

export interface ExerciseProgressPoint {
  date: string;
  completedExercises: number;
}

