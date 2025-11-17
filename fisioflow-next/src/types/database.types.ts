/**
 * Tipos TypeScript para Supabase Database
 * Versão funcional sem referências circulares
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

// Helper types
type BaseRow = {
  id: string;
  created_at: string;
  updated_at?: string;
};

type MakeInsert<T> = Omit<T, 'id' | 'created_at' | 'updated_at'> & {
  id?: string;
  created_at?: string;
  updated_at?: string;
};

type MakeUpdate<T> = Partial<MakeInsert<T>>;

// Table Row Types
type UsersRow = BaseRow & {
  email: string;
  full_name: string;
  role: 'admin' | 'fisioterapeuta' | 'recepcionista' | 'financeiro' | 'paciente';
  avatar_url: string | null;
  phone: string | null;
  is_active: boolean;
};

type PatientsRow = BaseRow & {
  user_id: string | null;
  full_name: string;
  email: string | null;
  phone: string;
  status: 'ativo' | 'inativo' | 'aguardando' | 'alta';
  xp_points: number;
  level: number;
};

type TherapistsRow = BaseRow & {
  user_id: string;
  crefito: string;
  is_active: boolean;
};

type AppointmentsRow = BaseRow & {
  patient_id: string;
  therapist_id: string;
  start_time: string;
  end_time: string;
  status: 'agendado' | 'confirmado' | 'em_atendimento' | 'concluido' | 'cancelado' | 'falta';
};

type TreatmentsRow = BaseRow & {
  patient_id: string;
  therapist_id: string;
  diagnosis: string;
  status: 'ativo' | 'pausado' | 'concluido' | 'cancelado';
};

type SessionEvolutionsRow = BaseRow & {
  treatment_id: string;
  patient_id: string;
  therapist_id: string;
  subjective: string | null;
  objective: string | null;
  assessment: string | null;
  plan: string | null;
};

type FinancialTransactionsRow = BaseRow & {
  patient_id: string | null;
  transaction_type: 'receita' | 'despesa' | 'estorno';
  amount: number;
  payment_status: 'pendente' | 'pago' | 'parcial' | 'cancelado' | 'estornado';
};

type PatientPackagesRow = BaseRow & {
  patient_id: string;
  total_sessions: number;
  used_sessions: number;
  status: 'ativo' | 'expirado' | 'esgotado' | 'cancelado';
};

type GamificationPointsRow = {
  id: string;
  patient_id: string;
  points_earned: number;
  points_type: 'sessao' | 'meta' | 'exercicio' | 'feedback' | 'sem_faltas' | 'bonus' | 'outros';
  created_at: string;
};

type BadgesRow = {
  id: string;
  name: string;
  slug: string;
  rarity: 'comum' | 'raro' | 'epico' | 'lendario';
  is_active: boolean;
  created_at: string;
};

type WhatsAppMessagesRow = {
  id: string;
  patient_id: string | null;
  phone_number: string;
  message: string;
  status: 'pending' | 'sent' | 'delivered' | 'read' | 'failed';
  created_at: string;
};

type NotificationsRow = {
  id: string;
  user_id: string;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
};

// Database Interface
export interface Database {
  public: {
    Tables: {
      users: {
        Row: UsersRow;
        Insert: MakeInsert<UsersRow>;
        Update: MakeUpdate<UsersRow>;
      };
      patients: {
        Row: PatientsRow;
        Insert: MakeInsert<PatientsRow>;
        Update: MakeUpdate<PatientsRow>;
      };
      therapists: {
        Row: TherapistsRow;
        Insert: MakeInsert<TherapistsRow>;
        Update: MakeUpdate<TherapistsRow>;
      };
      appointments: {
        Row: AppointmentsRow;
        Insert: MakeInsert<AppointmentsRow>;
        Update: MakeUpdate<AppointmentsRow>;
      };
      treatments: {
        Row: TreatmentsRow;
        Insert: MakeInsert<TreatmentsRow>;
        Update: MakeUpdate<TreatmentsRow>;
      };
      session_evolutions: {
        Row: SessionEvolutionsRow;
        Insert: MakeInsert<SessionEvolutionsRow>;
        Update: MakeUpdate<SessionEvolutionsRow>;
      };
      financial_transactions: {
        Row: FinancialTransactionsRow;
        Insert: MakeInsert<FinancialTransactionsRow>;
        Update: MakeUpdate<FinancialTransactionsRow>;
      };
      patient_packages: {
        Row: PatientPackagesRow;
        Insert: MakeInsert<PatientPackagesRow>;
        Update: MakeUpdate<PatientPackagesRow>;
      };
      gamification_points: {
        Row: GamificationPointsRow;
        Insert: Omit<GamificationPointsRow, 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<GamificationPointsRow>;
      };
      badges: {
        Row: BadgesRow;
        Insert: Omit<BadgesRow, 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<BadgesRow>;
      };
      whatsapp_messages: {
        Row: WhatsAppMessagesRow;
        Insert: Omit<WhatsAppMessagesRow, 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<WhatsAppMessagesRow>;
      };
      notifications: {
        Row: NotificationsRow;
        Insert: Omit<NotificationsRow, 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<NotificationsRow>;
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
  };
}
