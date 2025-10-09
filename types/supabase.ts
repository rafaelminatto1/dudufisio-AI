/**
 * types/supabase.ts
 * 
 * Tipos TypeScript gerados automaticamente do schema Supabase
 * 
 * Para regenerar após mudanças no schema:
 * npx supabase gen types typescript --project-id urfxniitfbbvsaskicfo > types/supabase.ts
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      patients: {
        Row: {
          id: string
          code: string
          name: string
          email: string
          phone: string
          phone2: string | null
          cpf: string
          rg: string | null
          birth_date: string
          age: number
          gender: string
          marital_status: string | null
          occupation: string | null
          avatar_url: string | null
          address: Json
          emergency_contact: Json
          blood_type: string | null
          height: number | null
          weight: number | null
          bmi: number | null
          medical_history: Json
          conditions: Json
          main_diagnosis: string | null
          referring_doctor: string | null
          referring_doctor_crm: string | null
          status: string
          registration_date: string
          first_appointment_date: string | null
          last_appointment_date: string | null
          session_progress: Json
          treatment_metrics: Json
          insurance: Json
          financial_info: Json
          observations: string | null
          internal_notes: string | null
          preferred_days_of_week: string[] | null
          preferred_time_slots: string[] | null
          has_consent_form: boolean
          has_data_privacy_consent: boolean
          tags: string[] | null
          created_by: string | null
          created_at: string
          updated_by: string | null
          updated_at: string
          deleted_at: string | null
          search_vector: unknown | null
        }
        Insert: {
          id?: string
          code?: string
          name: string
          email: string
          phone: string
          phone2?: string | null
          cpf: string
          rg?: string | null
          birth_date: string
          gender: string
          marital_status?: string | null
          occupation?: string | null
          avatar_url?: string | null
          address?: Json
          emergency_contact?: Json
          blood_type?: string | null
          height?: number | null
          weight?: number | null
          medical_history?: Json
          conditions?: Json
          main_diagnosis?: string | null
          referring_doctor?: string | null
          referring_doctor_crm?: string | null
          status?: string
          registration_date?: string
          first_appointment_date?: string | null
          last_appointment_date?: string | null
          session_progress?: Json
          treatment_metrics?: Json
          insurance?: Json
          financial_info?: Json
          observations?: string | null
          internal_notes?: string | null
          preferred_days_of_week?: string[] | null
          preferred_time_slots?: string[] | null
          has_consent_form?: boolean
          has_data_privacy_consent?: boolean
          tags?: string[] | null
          created_by?: string | null
          created_at?: string
          updated_by?: string | null
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          name?: string
          email?: string
          phone?: string
          phone2?: string | null
          status?: string
          observations?: string | null
          internal_notes?: string | null
          updated_by?: string | null
          updated_at?: string
        }
      }
      patient_documents: {
        Row: {
          id: string
          patient_id: string
          document_type: string
          title: string
          description: string | null
          file_name: string
          file_url: string
          file_size: number | null
          file_type: string | null
          document_date: string | null
          uploaded_by: string | null
          uploaded_at: string
          category: string | null
          tags: string[] | null
          deleted_at: string | null
        }
        Insert: {
          id?: string
          patient_id: string
          document_type: string
          title: string
          description?: string | null
          file_name: string
          file_url: string
          file_size?: number | null
          file_type?: string | null
          document_date?: string | null
          uploaded_by?: string | null
          uploaded_at?: string
          category?: string | null
          tags?: string[] | null
        }
      }
      patient_timeline: {
        Row: {
          id: string
          patient_id: string
          event_type: string
          title: string
          description: string | null
          related_appointment_id: string | null
          related_session_id: string | null
          related_document_id: string | null
          related_user_id: string | null
          event_date: string
          created_by: string | null
          metadata: Json
          importance: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          patient_id: string
          event_type: string
          title: string
          description?: string | null
          related_appointment_id?: string | null
          related_session_id?: string | null
          related_document_id?: string | null
          related_user_id?: string | null
          event_date?: string
          created_by?: string | null
          metadata?: Json
          importance?: string
        }
      }
      patient_notes: {
        Row: {
          id: string
          patient_id: string
          note_type: string
          title: string | null
          content: string
          is_important: boolean
          is_alert: boolean
          is_private: boolean
          is_pinned: boolean
          reminder_date: string | null
          reminder_completed: boolean
          created_by: string | null
          created_at: string
          updated_at: string | null
          deleted_at: string | null
        }
        Insert: {
          id?: string
          patient_id: string
          note_type?: string
          title?: string | null
          content: string
          is_important?: boolean
          is_alert?: boolean
          is_private?: boolean
          is_pinned?: boolean
          reminder_date?: string | null
          reminder_completed?: boolean
          created_by?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      patients_with_kpis: {
        Row: {
          // Mesmos campos de patients
          id: string
          name: string
          email: string
          // ... etc
          kpis: Json
        }
      }
      active_patients_summary: {
        Row: {
          id: string
          code: string
          name: string
          email: string
          phone: string
          status: string
          age: number
          main_diagnosis: string | null
          last_activity: string | null
          documents_count: number
          alerts_count: number
        }
      }
    }
    Functions: {
      search_patients: {
        Args: {
          search_query: string
          max_results?: number
        }
        Returns: {
          patient: Database['public']['Tables']['patients']['Row']
          rank: number
        }[]
      }
      calculate_patient_kpis: {
        Args: {
          patient_uuid: string
        }
        Returns: Json
      }
      get_patient_summary: {
        Args: {
          patient_uuid: string
        }
        Returns: Json
      }
      generate_patient_code: {
        Args: Record<string, never>
        Returns: string
      }
    }
  }
}
