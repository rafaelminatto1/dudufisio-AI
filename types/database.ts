export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      appointments: {
        Row: {
          appointment_date: string
          appointment_type: string
          cancellation_reason: string | null
          cancelled_at: string | null
          cancelled_by: string | null
          chief_complaint: string | null
          created_at: string | null
          created_by: string | null
          end_time: string
          id: string
          metadata: Json | null
          payment_status: string | null
          insurance_authorization: string | null
          insurance_covered: boolean | null
          is_online: boolean | null
          notes: string | null
          online_link: string | null
          recurrence_rule: Json | null
          recurrence_template_id: string | null
          series_id: string | null
          patient_id: string
          price: number | null
          reminder_sent: boolean | null
          reminder_sent_at: string | null
          room: string | null
          start_time: string
          status: string | null
          therapist_id: string
          updated_at: string | null
        }
        Insert: {
          appointment_date: string
          appointment_type: string
          cancellation_reason?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          chief_complaint?: string | null
          created_at?: string | null
          created_by?: string | null
          end_time: string
          id?: string
          metadata?: Json | null
          payment_status?: string | null
          insurance_authorization?: string | null
          insurance_covered?: boolean | null
          is_online?: boolean | null
          notes?: string | null
          online_link?: string | null
          recurrence_rule?: Json | null
          recurrence_template_id?: string | null
          series_id?: string | null
          patient_id: string
          price?: number | null
          reminder_sent?: boolean | null
          reminder_sent_at?: string | null
          room?: string | null
          start_time: string
          status?: string | null
          therapist_id: string
          updated_at?: string | null
        }
        Update: {
          appointment_date?: string
          appointment_type?: string
          cancellation_reason?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          chief_complaint?: string | null
          created_at?: string | null
          created_by?: string | null
          end_time?: string
          id?: string
          metadata?: Json | null
          payment_status?: string | null
          insurance_authorization?: string | null
          insurance_covered?: boolean | null
          is_online?: boolean | null
          notes?: string | null
          online_link?: string | null
          recurrence_rule?: Json | null
          recurrence_template_id?: string | null
          series_id?: string | null
          patient_id?: string
          price?: number | null
          reminder_sent?: boolean | null
          reminder_sent_at?: string | null
          room?: string | null
          start_time?: string
          status?: string | null
          therapist_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "appointments_cancelled_by_fkey"
            columns: ["cancelled_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_therapist_id_fkey"
            columns: ["therapist_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      patients: {
        Row: {
          id: string
          full_name: string
          email: string | null
          phone: string | null
          birth_date: string | null
          address: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          medical_history: string | null
          insurance_info: string | null
          created_at: string | null
          updated_at: string | null
          cpf: string | null
          gender: string | null
          address_street: string | null
          address_number: string | null
          address_city: string | null
          address_state: string | null
          address_zip: string | null
          status: string | null
          therapist_id: string | null
          name: string | null
          date_of_birth: string | null
        }
        Insert: {
          id?: string
          full_name: string
          email?: string | null
          phone?: string | null
          birth_date?: string | null
          address?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          medical_history?: string | null
          insurance_info?: string | null
          created_at?: string | null
          updated_at?: string | null
          cpf?: string | null
          gender?: string | null
          address_street?: string | null
          address_number?: string | null
          address_city?: string | null
          address_state?: string | null
          address_zip?: string | null
          status?: string | null
          therapist_id?: string | null
          name?: string | null
          date_of_birth?: string | null
        }
        Update: {
          id?: string
          full_name?: string
          email?: string | null
          phone?: string | null
          birth_date?: string | null
          address?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          medical_history?: string | null
          insurance_info?: string | null
          created_at?: string | null
          updated_at?: string | null
          cpf?: string | null
          gender?: string | null
          address_street?: string | null
          address_number?: string | null
          address_city?: string | null
          address_state?: string | null
          address_zip?: string | null
          status?: string | null
          therapist_id?: string | null
          name?: string | null
          date_of_birth?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "patients_therapist_id_fkey"
            columns: ["therapist_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      pain_points: {
        Row: {
          id: string
          patient_id: string
          pain_level_before: number | null
          pain_level_after: number | null
          location: string | null
          description: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          patient_id: string
          pain_level_before?: number | null
          pain_level_after?: number | null
          location?: string | null
          description?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          patient_id?: string
          pain_level_before?: number | null
          pain_level_after?: number | null
          location?: string | null
          description?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pain_points_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          }
        ]
      }
      sessions: {
        Row: {
          id: string
          appointment_id: string
          patient_id: string
          therapist_id: string
          session_date: string
          procedures_performed: string | null
          pain_level_before: number | null
          pain_level_after: number | null
          notes: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          appointment_id: string
          patient_id: string
          therapist_id: string
          session_date: string
          procedures_performed?: string | null
          pain_level_before?: number | null
          pain_level_after?: number | null
          notes?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          appointment_id?: string
          patient_id?: string
          therapist_id?: string
          session_date?: string
          procedures_performed?: string | null
          pain_level_before?: number | null
          pain_level_after?: number | null
          notes?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sessions_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sessions_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sessions_therapist_id_fkey"
            columns: ["therapist_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      user_profiles: {
        Row: {
          id: string
          email: string
          name: string
          role: string
          phone: string | null
          avatar_url: string | null
          preferences: Json | null
          metadata: Json | null
          specialization: string | null
          professional_id: string | null
          active: boolean | null
          last_login_at: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id: string
          email: string
          name: string
          role: string
          phone?: string | null
          avatar_url?: string | null
          preferences?: Json | null
          metadata?: Json | null
          specialization?: string | null
          professional_id?: string | null
          active?: boolean | null
          last_login_at?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          email?: string
          name?: string
          role?: string
          phone?: string | null
          avatar_url?: string | null
          preferences?: Json | null
          metadata?: Json | null
          specialization?: string | null
          professional_id?: string | null
          active?: boolean | null
          last_login_at?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      ai_analyses: {
        Row: {
          id: string
          patient_id: string
          analysis_type: string
          result: unknown
          metadata: unknown | null
          created_at: string | null
        }
        Insert: {
          id?: string
          patient_id: string
          analysis_type: string
          result: unknown
          metadata?: unknown | null
          created_at?: string | null
        }
        Update: {
          id?: string
          patient_id?: string
          analysis_type?: string
          result?: unknown
          metadata?: unknown | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_analyses_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          }
        ]
      }
      analytics_events: {
        Row: {
          id: string
          user_id: string | null
          session_id: string
          event: string
          properties: unknown
          timestamp: string
          page: string | null
          user_agent: string | null
        }
        Insert: {
          id: string
          user_id?: string | null
          session_id: string
          event: string
          properties: unknown
          timestamp: string
          page?: string | null
          user_agent?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          session_id?: string
          event?: string
          properties?: unknown
          timestamp?: string
          page?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "analytics_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      users: {
        Row: {
          id: string
          email: string
          full_name: string
          phone: string | null
          role: string
          specialization: string | null
          professional_id: string | null
          active: boolean | null
          avatar_url: string | null
          preferences: Json | null
          metadata: Json | null
          last_login_at: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id: string
          email: string
          full_name: string
          phone?: string | null
          role: string
          specialization?: string | null
          professional_id?: string | null
          active?: boolean | null
          avatar_url?: string | null
          preferences?: Json | null
          metadata?: Json | null
          last_login_at?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          phone?: string | null
          role?: string
          specialization?: string | null
          professional_id?: string | null
          active?: boolean | null
          avatar_url?: string | null
          preferences?: Json | null
          metadata?: Json | null
          last_login_at?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      data_processing_purposes: {
        Row: {
          id: string
          name: string
          description: string
          legal_basis: string
          data_types: string[]
          retention_period: string
          required: boolean
          third_parties: string[] | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          name: string
          description: string
          legal_basis: string
          data_types: string[]
          retention_period: string
          required: boolean
          third_parties?: string[] | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          description?: string
          legal_basis?: string
          data_types?: string[]
          retention_period?: string
          required?: boolean
          third_parties?: string[] | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      user_consents: {
        Row: {
          id: string
          user_id: string
          purpose_id: string
          granted: boolean
          granted_at: string
          revoked_at: string | null
          ip_address: string
          user_agent: string
          consent_method: string
          consent_text: string
          version: string
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          purpose_id: string
          granted?: boolean
          granted_at: string
          revoked_at?: string | null
          ip_address: string
          user_agent: string
          consent_method: string
          consent_text: string
          version: string
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          purpose_id?: string
          granted?: boolean
          granted_at?: string
          revoked_at?: string | null
          ip_address?: string
          user_agent?: string
          consent_method?: string
          consent_text?: string
          version?: string
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_consents_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_consents_purpose_id_fkey"
            columns: ["purpose_id"]
            isOneToOne: false
            referencedRelation: "data_processing_purposes"
            referencedColumns: ["id"]
          }
        ]
      }
      audit_trail: {
        Row: {
          id: string
          user_id: string
          action: string
          entity_type: string
          entity_id: string
          previous_data: Json | null
          new_data: Json | null
          timestamp: string
          ip_address: string
          user_agent: string
          session_id: string
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          action: string
          entity_type: string
          entity_id: string
          previous_data?: Json | null
          new_data?: Json | null
          timestamp: string
          ip_address: string
          user_agent: string
          session_id: string
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          action?: string
          entity_type?: string
          entity_id?: string
          previous_data?: Json | null
          new_data?: Json | null
          timestamp?: string
          ip_address?: string
          user_agent?: string
          session_id?: string
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_trail_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      data_portability_requests: {
        Row: {
          id: string
          user_id: string
          request_type: string
          status: string
          requested_at: string
          completed_at: string | null
          format: string
          download_url: string | null
          expires_at: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          request_type: string
          status: string
          requested_at: string
          completed_at?: string | null
          format: string
          download_url?: string | null
          expires_at?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          request_type?: string
          status?: string
          requested_at?: string
          completed_at?: string | null
          format?: string
          download_url?: string | null
          expires_at?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "data_portability_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      payment_transactions: {
        Row: {
          id: string
          customer_id: string
          appointment_id: string | null
          amount: number
          currency: string
          description: string
          status: string
          payment_method_id: string | null
          provider_transaction_id: string | null
          metadata: Json | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          customer_id: string
          appointment_id?: string | null
          amount: number
          currency: string
          description: string
          status: string
          payment_method_id?: string | null
          provider_transaction_id?: string | null
          metadata?: Json | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          customer_id?: string
          appointment_id?: string | null
          amount?: number
          currency?: string
          description?: string
          status?: string
          payment_method_id?: string | null
          provider_transaction_id?: string | null
          metadata?: Json | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_transactions_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_transactions_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          }
        ]
      }
      payment_methods: {
        Row: {
          id: string
          user_id: string
          type: string
          provider: string
          details: Json
          is_default: boolean
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          type: string
          provider: string
          details: Json
          is_default?: boolean
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          type?: string
          provider?: string
          details?: Json
          is_default?: boolean
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_methods_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      subscriptions: {
        Row: {
          id: string
          customer_id: string
          plan_id: string
          status: string
          current_period_start: string
          current_period_end: string
          canceled_at: string | null
          metadata: Json | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          customer_id: string
          plan_id: string
          status: string
          current_period_start: string
          current_period_end: string
          canceled_at?: string | null
          metadata?: Json | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          customer_id?: string
          plan_id?: string
          status?: string
          current_period_start?: string
          current_period_end?: string
          canceled_at?: string | null
          metadata?: Json | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      invoices: {
        Row: {
          id: string
          customer_id: string
          subscription_id: string | null
          amount: number
          currency: string
          status: string
          items: Json
          due_date: string
          paid_at: string | null
          metadata: Json | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          customer_id: string
          subscription_id?: string | null
          amount: number
          currency: string
          status: string
          items: Json
          due_date: string
          paid_at?: string | null
          metadata?: Json | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          customer_id?: string
          subscription_id?: string | null
          amount?: number
          currency?: string
          status?: string
          items?: Json
          due_date?: string
          paid_at?: string | null
          metadata?: Json | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          }
        ]
      }
      treatment_sessions: {
        Row: {
          id: string
          appointment_id: string
          patient_id: string
          therapist_id: string
          session_date: string
          procedures_performed: string | null
          pain_level_before: number | null
          pain_level_after: number | null
          objectives: string | null
          results: string | null
          next_session_goals: string | null
          notes: string | null
          duration_minutes: number | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          appointment_id: string
          patient_id: string
          therapist_id: string
          session_date: string
          procedures_performed?: string | null
          pain_level_before?: number | null
          pain_level_after?: number | null
          objectives?: string | null
          results?: string | null
          next_session_goals?: string | null
          notes?: string | null
          duration_minutes?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          appointment_id?: string
          patient_id?: string
          therapist_id?: string
          session_date?: string
          procedures_performed?: string | null
          pain_level_before?: number | null
          pain_level_after?: number | null
          objectives?: string | null
          results?: string | null
          next_session_goals?: string | null
          notes?: string | null
          duration_minutes?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "treatment_sessions_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "treatment_sessions_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "treatment_sessions_therapist_id_fkey"
            columns: ["therapist_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      clinical_notes: {
        Row: {
          id: string
          patient_id: string
          therapist_id: string
          session_id: string | null
          note_type: string
          content: string
          tags: string[] | null
          is_private: boolean
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          patient_id: string
          therapist_id: string
          session_id?: string | null
          note_type: string
          content: string
          tags?: string[] | null
          is_private?: boolean
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          patient_id?: string
          therapist_id?: string
          session_id?: string | null
          note_type?: string
          content?: string
          tags?: string[] | null
          is_private?: boolean
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clinical_notes_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinical_notes_therapist_id_fkey"
            columns: ["therapist_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinical_notes_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "treatment_sessions"
            referencedColumns: ["id"]
          }
        ]
      }
      progress_metrics: {
        Row: {
          id: string
          patient_id: string
          session_id: string | null
          metric_name: string
          metric_value: number
          metric_unit: string
          baseline_value: number | null
          target_value: number | null
          measurement_date: string
          notes: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          patient_id: string
          session_id?: string | null
          metric_name: string
          metric_value: number
          metric_unit: string
          baseline_value?: number | null
          target_value?: number | null
          measurement_date: string
          notes?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          patient_id?: string
          session_id?: string | null
          metric_name?: string
          metric_value?: number
          metric_unit?: string
          baseline_value?: number | null
          target_value?: number | null
          measurement_date?: string
          notes?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "progress_metrics_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "progress_metrics_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "treatment_sessions"
            referencedColumns: ["id"]
          }
        ]
      }
      performance_metrics: {
        Row: {
          id: string
          metric_name: string
          metric_value: number
          metric_unit: string
          timestamp: string
          user_id: string | null
          session_id: string | null
          page_url: string | null
          user_agent: string | null
          metadata: Json | null
          created_at: string | null
        }
        Insert: {
          id?: string
          metric_name: string
          metric_value: number
          metric_unit: string
          timestamp: string
          user_id?: string | null
          session_id?: string | null
          page_url?: string | null
          user_agent?: string | null
          metadata?: Json | null
          created_at?: string | null
        }
        Update: {
          id?: string
          metric_name?: string
          metric_value?: number
          metric_unit?: string
          timestamp?: string
          user_id?: string | null
          session_id?: string | null
          page_url?: string | null
          user_agent?: string | null
          metadata?: Json | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "performance_metrics_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      error_logs: {
        Row: {
          id: string
          error_message: string
          error_stack: string | null
          error_code: string | null
          severity: string
          timestamp: string
          user_id: string | null
          session_id: string | null
          page_url: string | null
          user_agent: string | null
          component_name: string | null
          metadata: Json | null
          resolved: boolean
          resolved_at: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          error_message: string
          error_stack?: string | null
          error_code?: string | null
          severity: string
          timestamp: string
          user_id?: string | null
          session_id?: string | null
          page_url?: string | null
          user_agent?: string | null
          component_name?: string | null
          metadata?: Json | null
          resolved?: boolean
          resolved_at?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          error_message?: string
          error_stack?: string | null
          error_code?: string | null
          severity?: string
          timestamp?: string
          user_id?: string | null
          session_id?: string | null
          page_url?: string | null
          user_agent?: string | null
          component_name?: string | null
          metadata?: Json | null
          resolved?: boolean
          resolved_at?: string | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "error_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      user_analytics: {
        Row: {
          id: string
          user_id: string
          session_id: string
          event_name: string
          event_properties: Json | null
          page_url: string | null
          referrer: string | null
          timestamp: string
          user_agent: string | null
          ip_address: string | null
          country: string | null
          city: string | null
          device_type: string | null
          browser: string | null
          os: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          session_id: string
          event_name: string
          event_properties?: Json | null
          page_url?: string | null
          referrer?: string | null
          timestamp: string
          user_agent?: string | null
          ip_address?: string | null
          country?: string | null
          city?: string | null
          device_type?: string | null
          browser?: string | null
          os?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          session_id?: string
          event_name?: string
          event_properties?: Json | null
          page_url?: string | null
          referrer?: string | null
          timestamp?: string
          user_agent?: string | null
          ip_address?: string | null
          country?: string | null
          city?: string | null
          device_type?: string | null
          browser?: string | null
          os?: string | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_analytics_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      [_ in never]: never
    }
    Functions: {
      calculate_age: {
        Args: { birth_date: string }
        Returns: number
      }
      check_appointment_conflict: {
        Args: {
          p_date: string
          p_end_time: string
          p_exclude_id?: string
          p_room?: string
          p_start_time: string
          p_therapist_id: string
        }
        Returns: {
          conflicting_appointment_id: string
        }[]
      }
      generate_invoice_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
    }
    Enums: {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      [_ in never]: never
    }
    CompositeTypes: {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const