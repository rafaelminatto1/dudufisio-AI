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
      appointment_requests: {
        Row: {
          alternative_dates: Json | null
          appointment_id: string | null
          approved_date: string | null
          created_at: string | null
          id: string
          patient_id: string
          preferred_date: string
          preferred_time_slot: string | null
          reason: string
          responded_at: string | null
          responded_by: string | null
          response_message: string | null
          status: string | null
          therapist_id: string
          updated_at: string | null
          urgency: string | null
        }
        Insert: {
          alternative_dates?: Json | null
          appointment_id?: string | null
          approved_date?: string | null
          created_at?: string | null
          id?: string
          patient_id: string
          preferred_date: string
          preferred_time_slot?: string | null
          reason: string
          responded_at?: string | null
          responded_by?: string | null
          response_message?: string | null
          status?: string | null
          therapist_id: string
          updated_at?: string | null
          urgency?: string | null
        }
        Update: {
          alternative_dates?: Json | null
          appointment_id?: string | null
          approved_date?: string | null
          created_at?: string | null
          id?: string
          patient_id?: string
          preferred_date?: string
          preferred_time_slot?: string | null
          reason?: string
          responded_at?: string | null
          responded_by?: string | null
          response_message?: string | null
          status?: string | null
          therapist_id?: string
          updated_at?: string | null
          urgency?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "appointment_requests_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: true
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointment_requests_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patient_insights_summary"
            referencedColumns: ["patient_id"]
          },
          {
            foreignKeyName: "appointment_requests_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointment_requests_therapist_id_fkey"
            columns: ["therapist_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      appointments: {
        Row: {
          appointment_type: string | null
          confirmation_status: string | null
          created_at: string | null
          created_by: string | null
          deleted_at: string | null
          duration_minutes: number | null
          end_time: string
          id: string
          is_confirmed: boolean | null
          is_recurring: boolean | null
          notes: string | null
          patient_id: string
          payment_status: string | null
          recurrence_rule: string | null
          start_time: string
          status: string | null
          tags: string[] | null
          therapist_id: string
          title: string | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          appointment_type?: string | null
          confirmation_status?: string | null
          created_at?: string | null
          created_by?: string | null
          deleted_at?: string | null
          duration_minutes?: number | null
          end_time: string
          id?: string
          is_confirmed?: boolean | null
          is_recurring?: boolean | null
          notes?: string | null
          patient_id: string
          payment_status?: string | null
          recurrence_rule?: string | null
          start_time: string
          status?: string | null
          tags?: string[] | null
          therapist_id: string
          title?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          appointment_type?: string | null
          confirmation_status?: string | null
          created_at?: string | null
          created_by?: string | null
          deleted_at?: string | null
          duration_minutes?: number | null
          end_time?: string
          id?: string
          is_confirmed?: boolean | null
          is_recurring?: boolean | null
          notes?: string | null
          patient_id?: string
          payment_status?: string | null
          recurrence_rule?: string | null
          start_time?: string
          status?: string | null
          tags?: string[] | null
          therapist_id?: string
          title?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
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
            referencedRelation: "patient_insights_summary"
            referencedColumns: ["patient_id"]
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
            referencedRelation: "therapists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_log: {
        Row: {
          action: string
          created_at: string | null
          details: string | null
          entity: string | null
          entity_id: string | null
          id: string
          ip_address: unknown | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          details?: string | null
          entity?: string | null
          entity_id?: string | null
          id?: string
          ip_address?: unknown | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          details?: string | null
          entity?: string | null
          entity_id?: string | null
          id?: string
          ip_address?: unknown | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      body_part_templates: {
        Row: {
          body_part: string
          created_at: string
          id: string
          template_name: string
          template_type: string
          updated_at: string
        }
        Insert: {
          body_part: string
          created_at?: string
          id?: string
          template_name: string
          template_type: string
          updated_at?: string
        }
        Update: {
          body_part?: string
          created_at?: string
          id?: string
          template_name?: string
          template_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      clinic_services: {
        Row: {
          category: string | null
          clinic_id: string
          created_at: string | null
          description: string | null
          duration_minutes: number
          id: string
          is_active: boolean | null
          name: string
          price: number
          service_code: string | null
          tags: string[] | null
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          clinic_id: string
          created_at?: string | null
          description?: string | null
          duration_minutes: number
          id?: string
          is_active?: boolean | null
          name: string
          price: number
          service_code?: string | null
          tags?: string[] | null
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          clinic_id?: string
          created_at?: string | null
          description?: string | null
          duration_minutes?: number
          id?: string
          is_active?: boolean | null
          name?: string
          price?: number
          service_code?: string | null
          tags?: string[] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clinic_services_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      clinics: {
        Row: {
          address: string | null
          clinic_hours: Json | null
          clinic_settings: Json | null
          cnpj: string | null
          created_at: string | null
          created_by: string | null
          deleted_at: string | null
          email: string | null
          id: string
          is_active: boolean | null
          logo_url: string | null
          name: string
          owner_id: string | null
          phone: string | null
          primary_color: string | null
          secondary_color: string | null
          slug: string
          updated_at: string | null
          website: string | null
        }
        Insert: {
          address?: string | null
          clinic_hours?: Json | null
          clinic_settings?: Json | null
          cnpj?: string | null
          created_at?: string | null
          created_by?: string | null
          deleted_at?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          name: string
          owner_id?: string | null
          phone?: string | null
          primary_color?: string | null
          secondary_color?: string | null
          slug: string
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          address?: string | null
          clinic_hours?: Json | null
          clinic_settings?: Json | null
          cnpj?: string | null
          created_at?: string | null
          created_by?: string | null
          deleted_at?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          name?: string
          owner_id?: string | null
          phone?: string | null
          primary_color?: string | null
          secondary_color?: string | null
          slug?: string
          updated_at?: string | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clinics_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinics_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      conduct_templates: {
        Row: {
          body_part: string
          created_at: string
          description: string | null
          id: string
          is_public: boolean
          name: string
          owner_id: string | null
          tags: string[] | null
          updated_at: string
        }
        Insert: {
          body_part: string
          created_at?: string
          description?: string | null
          id?: string
          is_public?: boolean
          name: string
          owner_id?: string | null
          tags?: string[] | null
          updated_at?: string
        }
        Update: {
          body_part?: string
          created_at?: string
          description?: string | null
          id?: string
          is_public?: boolean
          name?: string
          owner_id?: string | null
          tags?: string[] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "conduct_templates_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      consents: {
        Row: {
          consent_date: string | null
          consent_text: string | null
          created_at: string | null
          deleted_at: string | null
          id: string
          patient_id: string
          signature_data: Json | null
          status: string | null
          template_id: string | null
          updated_at: string | null
          version: number | null
        }
        Insert: {
          consent_date?: string | null
          consent_text?: string | null
          created_at?: string | null
          deleted_at?: string | null
          id?: string
          patient_id: string
          signature_data?: Json | null
          status?: string | null
          template_id?: string | null
          updated_at?: string | null
          version?: number | null
        }
        Update: {
          consent_date?: string | null
          consent_text?: string | null
          created_at?: string | null
          deleted_at?: string | null
          id?: string
          patient_id?: string
          signature_data?: Json | null
          status?: string | null
          template_id?: string | null
          updated_at?: string | null
          version?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "consents_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patient_insights_summary"
            referencedColumns: ["patient_id"]
          },
          {
            foreignKeyName: "consents_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      document_templates: {
        Row: {
          category: string | null
          content: string
          created_at: string | null
          created_by: string | null
          id: string
          is_public: boolean | null
          last_used: string | null
          tags: string[] | null
          title: string
          updated_at: string | null
          usage_count: number | null
        }
        Insert: {
          category?: string | null
          content: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_public?: boolean | null
          last_used?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
          usage_count?: number | null
        }
        Update: {
          category?: string | null
          content?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_public?: boolean | null
          last_used?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          usage_count?: number | null
        }
        Relationships: []
      }
      documents: {
        Row: {
          created_at: string | null
          document_template_id: string | null
          document_type: string
          file_path: string | null
          file_size: number | null
          id: string
          patient_id: string
          storage_path: string | null
          title: string
          updated_at: string | null
          uploaded_by: string | null
        }
        Insert: {
          created_at?: string | null
          document_template_id?: string | null
          document_type: string
          file_path?: string | null
          file_size?: number | null
          id?: string
          patient_id: string
          storage_path?: string | null
          title: string
          updated_at?: string | null
          uploaded_by?: string | null
        }
        Update: {
          created_at?: string | null
          document_template_id?: string | null
          document_type?: string
          file_path?: string | null
          file_size?: number | null
          id?: string
          patient_id?: string
          storage_path?: string | null
          title?: string
          updated_at?: string | null
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "documents_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patient_insights_summary"
            referencedColumns: ["patient_id"]
          },
          {
            foreignKeyName: "documents_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          created_at: string
          data: Json | null
          id: string
          name: string
          processed_at: string | null
          status: string
        }
        Insert: {
          created_at?: string
          data?: Json | null
          id?: string
          name: string
          processed_at?: string | null
          status?: string
        }
        Update: {
          created_at?: string
          data?: Json | null
          id?: string
          name?: string
          processed_at?: string | null
          status?: string
        }
        Relationships: []
      }
      exercise_protocols: {
        Row: {
          body_part: string
          created_at: string
          description: string | null
          difficulty: string | null
          id: string
          is_public: boolean
          name: string
          owner_id: string | null
          tags: string[] | null
          updated_at: string
        }
        Insert: {
          body_part: string
          created_at?: string
          description?: string | null
          difficulty?: string | null
          id?: string
          is_public?: boolean
          name: string
          owner_id?: string | null
          tags?: string[] | null
          updated_at?: string
        }
        Update: {
          body_part?: string
          created_at?: string
          description?: string | null
          difficulty?: string | null
          id?: string
          is_public?: boolean
          name?: string
          owner_id?: string | null
          tags?: string[] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "exercise_protocols_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      exercises: {
        Row: {
          body_part: string
          created_at: string
          description: string | null
          difficulty: string | null
          equipment: string | null
          id: string
          instructions: string | null
          is_public: boolean
          name: string
          owner_id: string | null
          tags: string[] | null
          updated_at: string
          video_url: string | null
        }
        Insert: {
          body_part: string
          created_at?: string
          description?: string | null
          difficulty?: string | null
          equipment?: string | null
          id?: string
          instructions?: string | null
          is_public?: boolean
          name: string
          owner_id?: string | null
          tags?: string[] | null
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          body_part?: string
          created_at?: string
          description?: string | null
          difficulty?: string | null
          equipment?: string | null
          id?: string
          instructions?: string | null
          is_public?: boolean
          name?: string
          owner_id?: string | null
          tags?: string[] | null
          updated_at?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "exercises_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      exercises_library: {
        Row: {
          body_part: string | null
          category: string | null
          created_at: string | null
          description: string | null
          difficulty: string | null
          equipment_needed: string | null
          id: string
          instructions: string | null
          is_public: boolean | null
          last_updated_by: string | null
          media_url: string | null
          name: string
          owner_id: string | null
          related_exercises: string[] | null
          tags: string[] | null
          updated_at: string | null
        }
        Insert: {
          body_part?: string | null
          category?: string | null
          created_at?: string | null
          description?: string | null
          difficulty?: string | null
          equipment_needed?: string | null
          id?: string
          instructions?: string | null
          is_public?: boolean | null
          last_updated_by?: string | null
          media_url?: string | null
          name: string
          owner_id?: string | null
          related_exercises?: string[] | null
          tags?: string[] | null
          updated_at?: string | null
        }
        Update: {
          body_part?: string | null
          category?: string | null
          created_at?: string | null
          description?: string | null
          difficulty?: string | null
          equipment_needed?: string | null
          id?: string
          instructions?: string | null
          is_public?: boolean | null
          last_updated_by?: string | null
          media_url?: string | null
          name?: string
          owner_id?: string | null
          related_exercises?: string[] | null
          tags?: string[] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      financial_goals: {
        Row: {
          created_at: string | null
          current_amount: number | null
          description: string | null
          end_date: string | null
          id: string
          name: string
          start_date: string | null
          status: string | null
          target_amount: number
          target_type: string
        }
        Insert: {
          created_at?: string | null
          current_amount?: number | null
          description?: string | null
          end_date?: string | null
          id?: string
          name: string
          start_date?: string | null
          status?: string | null
          target_amount: number
          target_type: string
        }
        Update: {
          created_at?: string | null
          current_amount?: number | null
          description?: string | null
          end_date?: string | null
          id?: string
          name?: string
          start_date?: string | null
          status?: string | null
          target_amount?: number
          target_type?: string
        }
        Relationships: []
      }
      financial_packages: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          price: number
          sessions_count: number
          updated_at: string | null
          validity_days: number | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          price: number
          sessions_count: number
          updated_at?: string | null
          validity_days?: number | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          price?: number
          sessions_count?: number
          updated_at?: string | null
          validity_days?: number | null
        }
        Relationships: []
      }
      inventory_items: {
        Row: {
          barcode: string | null
          category: string | null
          created_at: string | null
          description: string | null
          id: string
          last_restock_date: string | null
          location: string | null
          name: string
          quantity: number
          reorder_level: number | null
          supplier: string | null
          unit_price: number | null
          updated_at: string | null
        }
        Insert: {
          barcode?: string | null
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          last_restock_date?: string | null
          location?: string | null
          name: string
          quantity: number
          reorder_level?: number | null
          supplier?: string | null
          unit_price?: number | null
          updated_at?: string | null
        }
        Update: {
          barcode?: string | null
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          last_restock_date?: string | null
          location?: string | null
          name?: string
          quantity?: number
          reorder_level?: number | null
          supplier?: string | null
          unit_price?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      knowledge_base: {
        Row: {
          category: string | null
          content: string
          created_at: string | null
          embedding: string | null
          id: string
          last_updated_by: string | null
          owner_id: string | null
          tags: string[] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          content: string
          created_at?: string | null
          embedding?: string | null
          id?: string
          last_updated_by?: string | null
          owner_id?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          content?: string
          created_at?: string | null
          embedding?: string | null
          id?: string
          last_updated_by?: string | null
          owner_id?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      materials_library: {
        Row: {
          author: string | null
          category: string
          created_at: string
          description: string | null
          download_count: number
          file_type: string
          file_url: string
          id: string
          is_public: boolean
          owner_id: string | null
          tags: string[] | null
          thumbnail_url: string | null
          title: string
          updated_at: string
          version: string | null
        }
        Insert: {
          author?: string | null
          category: string
          created_at?: string
          description?: string | null
          download_count?: number
          file_type: string
          file_url: string
          id?: string
          is_public?: boolean
          owner_id?: string | null
          tags?: string[] | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string
          version?: string | null
        }
        Update: {
          author?: string | null
          category?: string
          created_at?: string
          description?: string | null
          download_count?: number
          file_type?: string
          file_url?: string
          id?: string
          is_public?: boolean
          owner_id?: string | null
          tags?: string[] | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
          version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "materials_library_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      message_queue: {
        Row: {
          attempts: number
          channel: string
          created_at: string
          data: Json
          id: string
          last_attempt_at: string | null
          name: string
          processed_at: string | null
          status: string
        }
        Insert: {
          attempts?: number
          channel: string
          created_at?: string
          data: Json
          id?: string
          last_attempt_at?: string | null
          name: string
          processed_at?: string | null
          status?: string
        }
        Update: {
          attempts?: number
          channel?: string
          created_at?: string
          data?: Json
          id?: string
          last_attempt_at?: string | null
          name?: string
          processed_at?: string | null
          status?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string
          created_at: string
          id: string
          is_read: boolean
          recipient_id: string
          sender_id: string
          subject: string | null
          thread_id: string | null
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_read?: boolean
          recipient_id: string
          sender_id: string
          subject?: string | null
          thread_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_read?: boolean
          recipient_id?: string
          sender_id?: string
          subject?: string | null
          thread_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      migrations: {
        Row: {
          executed_at: string | null
          id: number
          name: string
        }
        Insert: {
          executed_at?: string | null
          id: number
          name: string
        }
        Update: {
          executed_at?: string | null
          id?: number
          name?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          channels: string[] | null
          created_at: string | null
          data: Json | null
          id: string
          is_read: boolean | null
          message: string
          read_at: string | null
          scheduled_for: string | null
          status: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          channels?: string[] | null
          created_at?: string | null
          data?: Json | null
          id?: string
          is_read?: boolean | null
          message: string
          read_at?: string | null
          scheduled_for?: string | null
          status?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          channels?: string[] | null
          created_at?: string | null
          data?: Json | null
          id?: string
          is_read?: boolean | null
          message?: string
          read_at?: string | null
          scheduled_for?: string | null
          status?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      patient_access_codes: {
        Row: {
          code: string
          created_at: string
          created_by: string | null
          expires_at: string
          id: string
          is_used: boolean
          patient_id: string
          used_at: string | null
        }
        Insert: {
          code: string
          created_at?: string
          created_by?: string | null
          expires_at: string
          id?: string
          is_used?: boolean
          patient_id: string
          used_at?: string | null
        }
        Update: {
          code?: string
          created_at?: string
          created_by?: string | null
          expires_at?: string
          id?: string
          is_used?: boolean
          patient_id?: string
          used_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "patient_access_codes_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_access_codes_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patient_insights_summary"
            referencedColumns: ["patient_id"]
          },
          {
            foreignKeyName: "patient_access_codes_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      patient_exercise_adherence: {
        Row: {
          adherence_percent: number | null
          completed_at: string | null
          created_at: string
          id: string
          notes: string | null
          patient_id: string
          prescription_exercise_id: string
          sets_completed: number | null
          updated_at: string
        }
        Insert: {
          adherence_percent?: number | null
          completed_at?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          patient_id: string
          prescription_exercise_id: string
          sets_completed?: number | null
          updated_at?: string
        }
        Update: {
          adherence_percent?: number | null
          completed_at?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          patient_id?: string
          prescription_exercise_id?: string
          sets_completed?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "patient_exercise_adherence_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patient_insights_summary"
            referencedColumns: ["patient_id"]
          },
          {
            foreignKeyName: "patient_exercise_adherence_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_exercise_adherence_prescription_exercise_id_fkey"
            columns: ["prescription_exercise_id"]
            isOneToOne: false
            referencedRelation: "prescription_exercises"
            referencedColumns: ["id"]
          },
        ]
      }
      patient_exercise_prescriptions: {
        Row: {
          created_at: string
          end_date: string | null
          id: string
          notes: string | null
          patient_id: string
          start_date: string
          status: string
          therapist_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string
          end_date?: string | null
          id?: string
          notes?: string | null
          patient_id: string
          start_date: string
          status?: string
          therapist_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string
          end_date?: string | null
          id?: string
          notes?: string | null
          patient_id?: string
          start_date?: string
          status?: string
          therapist_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "patient_exercise_prescriptions_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patient_insights_summary"
            referencedColumns: ["patient_id"]
          },
          {
            foreignKeyName: "patient_exercise_prescriptions_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_exercise_prescriptions_therapist_id_fkey"
            columns: ["therapist_id"]
            isOneToOne: false
            referencedRelation: "therapists"
            referencedColumns: ["id"]
          },
        ]
      }
      patient_feedback: {
        Row: {
          appointment_id: string | null
          comments: string | null
          created_at: string | null
          id: string
          patient_id: string
          rating: number
          therapist_id: string | null
        }
        Insert: {
          appointment_id?: string | null
          comments?: string | null
          created_at?: string | null
          id?: string
          patient_id: string
          rating: number
          therapist_id?: string | null
        }
        Update: {
          appointment_id?: string | null
          comments?: string | null
          created_at?: string | null
          id?: string
          patient_id?: string
          rating?: number
          therapist_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "patient_feedback_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_feedback_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patient_insights_summary"
            referencedColumns: ["patient_id"]
          },
          {
            foreignKeyName: "patient_feedback_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_feedback_therapist_id_fkey"
            columns: ["therapist_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      patient_goals: {
        Row: {
          created_at: string | null
          description: string | null
          end_date: string | null
          id: string
          is_active: boolean | null
          name: string
          patient_id: string
          start_date: string | null
          status: string | null
          target_value: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          patient_id: string
          start_date?: string | null
          status?: string | null
          target_value?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          patient_id?: string
          start_date?: string | null
          status?: string | null
          target_value?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "patient_goals_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patient_insights_summary"
            referencedColumns: ["patient_id"]
          },
          {
            foreignKeyName: "patient_goals_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      patient_package_purchases: {
        Row: {
          created_at: string | null
          expires_at: string | null
          id: string
          package_id: string
          patient_id: string
          purchase_date: string
          sessions_remaining: number
          status: string | null
        }
        Insert: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          package_id: string
          patient_id: string
          purchase_date: string
          sessions_remaining: number
          status?: string | null
        }
        Update: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          package_id?: string
          patient_id?: string
          purchase_date?: string
          sessions_remaining?: number
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "patient_package_purchases_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "financial_packages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_package_purchases_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patient_insights_summary"
            referencedColumns: ["patient_id"]
          },
          {
            foreignKeyName: "patient_package_purchases_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      patients: {
        Row: {
          address: Json | null
          allergies: string[] | null
          assigned_therapist_id: string | null
          birth_date: string | null
          blood_type: string | null
          chronic_conditions: string[] | null
          cpf: string | null
          created_at: string | null
          created_by: string | null
          current_medications: string[] | null
          deleted_at: string | null
          email: string | null
          emergency_contact: Json | null
          full_name: string
          gender: string | null
          health_insurance: string | null
          how_found_us: string | null
          id: string
          insurance_number: string | null
          notes: string | null
          payment_method: string | null
          phone: string
          referral_source: string | null
          status: string | null
          tags: string[] | null
          updated_at: string | null
          updated_by: string | null
          user_id: string | null
        }
        Insert: {
          address?: Json | null
          allergies?: string[] | null
          assigned_therapist_id?: string | null
          birth_date?: string | null
          blood_type?: string | null
          chronic_conditions?: string[] | null
          cpf?: string | null
          created_at?: string | null
          created_by?: string | null
          current_medications?: string[] | null
          deleted_at?: string | null
          email?: string | null
          emergency_contact?: Json | null
          full_name: string
          gender?: string | null
          health_insurance?: string | null
          how_found_us?: string | null
          id?: string
          insurance_number?: string | null
          notes?: string | null
          payment_method?: string | null
          phone: string
          referral_source?: string | null
          status?: string | null
          tags?: string[] | null
          updated_at?: string | null
          updated_by?: string | null
          user_id?: string | null
        }
        Update: {
          address?: Json | null
          allergies?: string[] | null
          assigned_therapist_id?: string | null
          birth_date?: string | null
          blood_type?: string | null
          chronic_conditions?: string[] | null
          cpf?: string | null
          created_at?: string | null
          created_by?: string | null
          current_medications?: string[] | null
          deleted_at?: string | null
          email?: string | null
          emergency_contact?: Json | null
          full_name?: string
          gender?: string | null
          health_insurance?: string | null
          how_found_us?: string | null
          id?: string
          insurance_number?: string | null
          notes?: string | null
          payment_method?: string | null
          phone?: string
          referral_source?: string | null
          status?: string | null
          tags?: string[] | null
          updated_at?: string | null
          updated_by?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "patients_assigned_therapist_id_fkey"
            columns: ["assigned_therapist_id"]
            isOneToOne: false
            referencedRelation: "therapists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patients_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patients_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patients_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_settings: {
        Row: {
          accept_boleto: boolean | null
          accept_cash: boolean | null
          accept_credit_card: boolean | null
          accept_debit_card: boolean | null
          accept_pix: boolean | null
          boleto_expires_days: number | null
          created_at: string | null
          id: string
          mercadopago_access_token: string | null
          mercadopago_enabled: boolean | null
          mercadopago_public_key: string | null
          notify_on_payment: boolean | null
          notify_on_refund: boolean | null
          pix_key: string | null
          pix_key_type: string | null
          stripe_enabled: boolean | null
          stripe_public_key: string | null
          stripe_secret_key: string | null
          updated_at: string | null
        }
        Insert: {
          accept_boleto?: boolean | null
          accept_cash?: boolean | null
          accept_credit_card?: boolean | null
          accept_debit_card?: boolean | null
          accept_pix?: boolean | null
          boleto_expires_days?: number | null
          created_at?: string | null
          id?: string
          mercadopago_access_token?: string | null
          mercadopago_enabled?: boolean | null
          mercadopago_public_key?: string | null
          notify_on_payment?: boolean | null
          notify_on_refund?: boolean | null
          pix_key?: string | null
          pix_key_type?: string | null
          stripe_enabled?: boolean | null
          stripe_public_key?: string | null
          stripe_secret_key?: string | null
          updated_at?: string | null
        }
        Update: {
          accept_boleto?: boolean | null
          accept_cash?: boolean | null
          accept_credit_card?: boolean | null
          accept_debit_card?: boolean | null
          accept_pix?: boolean | null
          boleto_expires_days?: number | null
          created_at?: string | null
          id?: string
          mercadopago_access_token?: string | null
          mercadopago_enabled?: boolean | null
          mercadopago_public_key?: string | null
          notify_on_payment?: boolean | null
          notify_on_refund?: boolean | null
          pix_key?: string | null
          pix_key_type?: string | null
          stripe_enabled?: boolean | null
          stripe_public_key?: string | null
          stripe_secret_key?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      payment_transactions: {
        Row: {
          amount: number | null
          created_at: string | null
          error_message: string | null
          event_type: string
          id: string
          payment_id: string | null
          provider_event_id: string | null
          provider_response: Json | null
          status: string | null
        }
        Insert: {
          amount?: number | null
          created_at?: string | null
          error_message?: string | null
          event_type: string
          id?: string
          payment_id?: string | null
          provider_event_id?: string | null
          provider_response?: Json | null
          status?: string | null
        }
        Update: {
          amount?: number | null
          created_at?: string | null
          error_message?: string | null
          event_type?: string
          id?: string
          payment_id?: string | null
          provider_event_id?: string | null
          provider_response?: Json | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_transactions_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          appointment_id: string | null
          boleto_barcode: string | null
          boleto_expires_at: string | null
          boleto_url: string | null
          created_at: string | null
          currency: string | null
          description: string | null
          id: string
          metadata: Json | null
          paid_at: string | null
          patient_id: string | null
          payment_method: string
          pix_expires_at: string | null
          pix_qr_code: string | null
          pix_qr_code_url: string | null
          provider: string | null
          provider_customer_id: string | null
          provider_payment_id: string | null
          refunded_amount: number | null
          refunded_at: string | null
          status: string
          stripe_customer_id: string | null
          stripe_payment_intent_id: string | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          appointment_id?: string | null
          boleto_barcode?: string | null
          boleto_expires_at?: string | null
          boleto_url?: string | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          id?: string
          metadata?: Json | null
          paid_at?: string | null
          patient_id?: string | null
          payment_method: string
          pix_expires_at?: string | null
          pix_qr_code?: string | null
          pix_qr_code_url?: string | null
          provider?: string | null
          provider_customer_id?: string | null
          provider_payment_id?: string | null
          refunded_amount?: number | null
          refunded_at?: string | null
          status?: string
          stripe_customer_id?: string | null
          stripe_payment_intent_id?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          appointment_id?: string | null
          boleto_barcode?: string | null
          boleto_expires_at?: string | null
          boleto_url?: string | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          id?: string
          metadata?: Json | null
          paid_at?: string | null
          patient_id?: string | null
          payment_method?: string
          pix_expires_at?: string | null
          pix_qr_code?: string | null
          pix_qr_code_url?: string | null
          provider?: string | null
          provider_customer_id?: string | null
          provider_payment_id?: string | null
          refunded_amount?: number | null
          refunded_at?: string | null
          status?: string
          stripe_customer_id?: string | null
          stripe_payment_intent_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      prescribed_exercises: {
        Row: {
          created_at: string | null
          exercise_id: string
          id: string
          patient_id: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          exercise_id: string
          id?: string
          patient_id: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          exercise_id?: string
          id?: string
          patient_id?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "prescribed_exercises_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises_library"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prescribed_exercises_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patient_insights_summary"
            referencedColumns: ["patient_id"]
          },
          {
            foreignKeyName: "prescribed_exercises_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      prescription_exercises: {
        Row: {
          adherence_target_percent: number | null
          created_at: string
          exercise_id: string
          frequency_per_week: number | null
          hold_time_seconds: number | null
          id: string
          intensity: string | null
          notes: string | null
          position: number
          prescription_id: string
          reps: number | null
          rest_time_seconds: number | null
          sets: number | null
          updated_at: string | null
        }
        Insert: {
          adherence_target_percent?: number | null
          created_at?: string
          exercise_id: string
          frequency_per_week?: number | null
          hold_time_seconds?: number | null
          id?: string
          intensity?: string | null
          notes?: string | null
          position?: number
          prescription_id: string
          reps?: number | null
          rest_time_seconds?: number | null
          sets?: number | null
          updated_at?: string | null
        }
        Update: {
          adherence_target_percent?: number | null
          created_at?: string
          exercise_id?: string
          frequency_per_week?: number | null
          hold_time_seconds?: number | null
          id?: string
          intensity?: string | null
          notes?: string | null
          position?: number
          prescription_id?: string
          reps?: number | null
          rest_time_seconds?: number | null
          sets?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "prescription_exercises_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prescription_exercises_prescription_id_fkey"
            columns: ["prescription_id"]
            isOneToOne: false
            referencedRelation: "patient_exercise_prescriptions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prescription_exercises_prescription_id_fkey"
            columns: ["prescription_id"]
            isOneToOne: false
            referencedRelation: "v_active_prescriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      protocol_exercises: {
        Row: {
          created_at: string
          exercise_id: string
          frequency_per_week: number | null
          hold_time_seconds: number | null
          id: string
          intensity: string | null
          notes: string | null
          position: number
          protocol_id: string
          reps: number | null
          rest_time_seconds: number | null
          sets: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string
          exercise_id: string
          frequency_per_week?: number | null
          hold_time_seconds?: number | null
          id?: string
          intensity?: string | null
          notes?: string | null
          position?: number
          protocol_id: string
          reps?: number | null
          rest_time_seconds?: number | null
          sets?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string
          exercise_id?: string
          frequency_per_week?: number | null
          hold_time_seconds?: number | null
          id?: string
          intensity?: string | null
          notes?: string | null
          position?: number
          protocol_id?: string
          reps?: number | null
          rest_time_seconds?: number | null
          sets?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "protocol_exercises_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "protocol_exercises_protocol_id_fkey"
            columns: ["protocol_id"]
            isOneToOne: false
            referencedRelation: "exercise_protocols"
            referencedColumns: ["id"]
          },
        ]
      }
      purchase_approvals: {
        Row: {
          approval_level: number
          approved_at: string | null
          approver_id: string | null
          comments: string | null
          created_at: string | null
          id: string
          purchase_order_id: string
          status: string | null
        }
        Insert: {
          approval_level: number
          approved_at?: string | null
          approver_id?: string | null
          comments?: string | null
          created_at?: string | null
          id?: string
          purchase_order_id: string
          status?: string | null
        }
        Update: {
          approval_level?: number
          approved_at?: string | null
          approver_id?: string | null
          comments?: string | null
          created_at?: string | null
          id?: string
          purchase_order_id?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "purchase_approvals_purchase_order_id_fkey"
            columns: ["purchase_order_id"]
            isOneToOne: false
            referencedRelation: "purchase_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      purchase_order_items: {
        Row: {
          created_at: string | null
          id: string
          purchase_order_id: string
          quantity_received: number | null
          quantity_requested: number
          supply_id: string | null
          total_cost: number | null
          unit_cost: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          purchase_order_id: string
          quantity_received?: number | null
          quantity_requested: number
          supply_id?: string | null
          total_cost?: number | null
          unit_cost?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          purchase_order_id?: string
          quantity_received?: number | null
          quantity_requested?: number
          supply_id?: string | null
          total_cost?: number | null
          unit_cost?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "purchase_order_items_purchase_order_id_fkey"
            columns: ["purchase_order_id"]
            isOneToOne: false
            referencedRelation: "purchase_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_order_items_supply_id_fkey"
            columns: ["supply_id"]
            isOneToOne: false
            referencedRelation: "supplies"
            referencedColumns: ["id"]
          },
        ]
      }
      purchase_orders: {
        Row: {
          approved_by: string | null
          created_at: string | null
          expected_delivery: string | null
          id: string
          is_auto_generated: boolean | null
          notes: string | null
          order_date: string | null
          order_number: string
          received_date: string | null
          requested_by: string | null
          status: string | null
          supplier_id: string | null
          total_amount: number | null
          updated_at: string | null
        }
        Insert: {
          approved_by?: string | null
          created_at?: string | null
          expected_delivery?: string | null
          id?: string
          is_auto_generated?: boolean | null
          notes?: string | null
          order_date?: string | null
          order_number: string
          received_date?: string | null
          requested_by?: string | null
          status?: string | null
          supplier_id?: string | null
          total_amount?: number | null
          updated_at?: string | null
        }
        Update: {
          approved_by?: string | null
          created_at?: string | null
          expected_delivery?: string | null
          id?: string
          is_auto_generated?: boolean | null
          notes?: string | null
          order_date?: string | null
          order_number?: string
          received_date?: string | null
          requested_by?: string | null
          status?: string | null
          supplier_id?: string | null
          total_amount?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "purchase_orders_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      push_notification_tokens: {
        Row: {
          browser: string | null
          created_at: string
          device_type: string | null
          enabled: boolean
          id: string
          last_used_at: string | null
          os: string | null
          token: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          browser?: string | null
          created_at?: string
          device_type?: string | null
          enabled?: boolean
          id?: string
          last_used_at?: string | null
          os?: string | null
          token: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          browser?: string | null
          created_at?: string
          device_type?: string | null
          enabled?: boolean
          id?: string
          last_used_at?: string | null
          os?: string | null
          token?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      schedule_blocks: {
        Row: {
          block_type: string | null
          created_at: string | null
          description: string | null
          end_time: string
          id: string
          is_active: boolean | null
          start_time: string
          therapist_id: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          block_type?: string | null
          created_at?: string | null
          description?: string | null
          end_time: string
          id?: string
          is_active?: boolean | null
          start_time: string
          therapist_id?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          block_type?: string | null
          created_at?: string | null
          description?: string | null
          end_time?: string
          id?: string
          is_active?: boolean | null
          start_time?: string
          therapist_id?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "schedule_blocks_therapist_id_fkey"
            columns: ["therapist_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      session_evolutions: {
        Row: {
          assessment: string | null
          conducts: Json | null
          created_at: string | null
          created_by: string | null
          duration: number | null
          id: string
          notes: string | null
          objective: string | null
          pain_level: number | null
          patient_id: string | null
          plan: string | null
          plan_general_notes: string | null
          prescribed_exercises: Json | null
          progress_photos: Json | null
          satisfaction_level: number | null
          session_date: string
          session_id: string | null
          session_number: number
          session_timer: Json | null
          subjective: string | null
          tags: string[] | null
          tests_performed: Json | null
          therapist_id: string | null
          therapist_name: string | null
          updated_at: string | null
        }
        Insert: {
          assessment?: string | null
          conducts?: Json | null
          created_at?: string | null
          created_by?: string | null
          duration?: number | null
          id?: string
          notes?: string | null
          objective?: string | null
          pain_level?: number | null
          patient_id?: string | null
          plan?: string | null
          plan_general_notes?: string | null
          prescribed_exercises?: Json | null
          progress_photos?: Json | null
          satisfaction_level?: number | null
          session_date: string
          session_id?: string | null
          session_number: number
          session_timer?: Json | null
          subjective?: string | null
          tags?: string[] | null
          tests_performed?: Json | null
          therapist_id?: string | null
          therapist_name?: string | null
          updated_at?: string | null
        }
        Update: {
          assessment?: string | null
          conducts?: Json | null
          created_at?: string | null
          created_by?: string | null
          duration?: number | null
          id?: string
          notes?: string | null
          objective?: string | null
          pain_level?: number | null
          patient_id?: string | null
          plan?: string | null
          plan_general_notes?: string | null
          prescribed_exercises?: Json | null
          progress_photos?: Json | null
          satisfaction_level?: number | null
          session_date?: string
          session_id?: string | null
          session_number?: number
          session_timer?: Json | null
          subjective?: string | null
          tags?: string[] | null
          tests_performed?: Json | null
          therapist_id?: string | null
          therapist_name?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "session_evolutions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "session_evolutions_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patient_insights_summary"
            referencedColumns: ["patient_id"]
          },
          {
            foreignKeyName: "session_evolutions_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "session_evolutions_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "session_evolutions_therapist_id_fkey"
            columns: ["therapist_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      soap_notes: {
        Row: {
          appointment_id: string | null
          assessment: string | null
          created_at: string | null
          date: string
          deleted_at: string | null
          id: string
          notes: string | null
          objective: string | null
          patient_id: string
          plan: string | null
          session_number: number
          subjective: string | null
          tags: string[] | null
          therapist_id: string | null
          updated_at: string | null
        }
        Insert: {
          appointment_id?: string | null
          assessment?: string | null
          created_at?: string | null
          date?: string
          deleted_at?: string | null
          id?: string
          notes?: string | null
          objective?: string | null
          patient_id: string
          plan?: string | null
          session_number: number
          subjective?: string | null
          tags?: string[] | null
          therapist_id?: string | null
          updated_at?: string | null
        }
        Update: {
          appointment_id?: string | null
          assessment?: string | null
          created_at?: string | null
          date?: string
          deleted_at?: string | null
          id?: string
          notes?: string | null
          objective?: string | null
          patient_id?: string
          plan?: string | null
          session_number?: number
          subjective?: string | null
          tags?: string[] | null
          therapist_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "soap_notes_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "soap_notes_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patient_insights_summary"
            referencedColumns: ["patient_id"]
          },
          {
            foreignKeyName: "soap_notes_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "soap_notes_therapist_id_fkey"
            columns: ["therapist_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_movements: {
        Row: {
          created_at: string | null
          id: string
          moved_by: string | null
          movement_type: string
          patient_id: string | null
          quantity: number
          reason: string | null
          reference_document: string | null
          supply_id: string
          task_id: string | null
          total_cost: number | null
          unit_cost: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          moved_by?: string | null
          movement_type: string
          patient_id?: string | null
          quantity: number
          reason?: string | null
          reference_document?: string | null
          supply_id: string
          task_id?: string | null
          total_cost?: number | null
          unit_cost?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          moved_by?: string | null
          movement_type?: string
          patient_id?: string | null
          quantity?: number
          reason?: string | null
          reference_document?: string | null
          supply_id?: string
          task_id?: string | null
          total_cost?: number | null
          unit_cost?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "stock_movements_supply_id_fkey"
            columns: ["supply_id"]
            isOneToOne: false
            referencedRelation: "supplies"
            referencedColumns: ["id"]
          },
        ]
      }
      suppliers: {
        Row: {
          address: string | null
          cnpj: string | null
          contact_person: string | null
          created_at: string | null
          delivery_time_days: number | null
          email: string | null
          id: string
          is_active: boolean | null
          name: string
          payment_terms: string | null
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          cnpj?: string | null
          contact_person?: string | null
          created_at?: string | null
          delivery_time_days?: number | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          payment_terms?: string | null
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          cnpj?: string | null
          contact_person?: string | null
          created_at?: string | null
          delivery_time_days?: number | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          payment_terms?: string | null
          phone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      supplies: {
        Row: {
          barcode: string | null
          brand: string | null
          category: string
          created_at: string | null
          created_by: string | null
          current_stock: number | null
          description: string | null
          expiration_date: string | null
          id: string
          is_active: boolean | null
          maximum_stock: number | null
          minimum_stock: number | null
          model: string | null
          name: string
          requires_prescription: boolean | null
          storage_location: string | null
          subcategory: string | null
          supplier_id: string | null
          unit_cost: number | null
          unit_of_measure: string
          updated_at: string | null
        }
        Insert: {
          barcode?: string | null
          brand?: string | null
          category: string
          created_at?: string | null
          created_by?: string | null
          current_stock?: number | null
          description?: string | null
          expiration_date?: string | null
          id?: string
          is_active?: boolean | null
          maximum_stock?: number | null
          minimum_stock?: number | null
          model?: string | null
          name: string
          requires_prescription?: boolean | null
          storage_location?: string | null
          subcategory?: string | null
          supplier_id?: string | null
          unit_cost?: number | null
          unit_of_measure?: string
          updated_at?: string | null
        }
        Update: {
          barcode?: string | null
          brand?: string | null
          category?: string
          created_at?: string | null
          created_by?: string | null
          current_stock?: number | null
          description?: string | null
          expiration_date?: string | null
          id?: string
          is_active?: boolean | null
          maximum_stock?: number | null
          minimum_stock?: number | null
          model?: string | null
          name?: string
          requires_prescription?: boolean | null
          storage_location?: string | null
          subcategory?: string | null
          supplier_id?: string | null
          unit_cost?: number | null
          unit_of_measure?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "supplies_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      supply_alerts: {
        Row: {
          alert_type: string
          created_at: string | null
          id: string
          is_read: boolean | null
          is_resolved: boolean | null
          message: string
          resolved_at: string | null
          resolved_by: string | null
          severity: string | null
          supply_id: string | null
        }
        Insert: {
          alert_type: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          is_resolved?: boolean | null
          message: string
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string | null
          supply_id?: string | null
        }
        Update: {
          alert_type?: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          is_resolved?: boolean | null
          message?: string
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string | null
          supply_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "supply_alerts_supply_id_fkey"
            columns: ["supply_id"]
            isOneToOne: false
            referencedRelation: "supplies"
            referencedColumns: ["id"]
          },
        ]
      }
      supply_batches: {
        Row: {
          batch_number: string
          expiration_date: string
          id: string
          manufacturer: string | null
          manufacturing_date: string | null
          quality_certificate_url: string | null
          quantity_received: number
          quantity_remaining: number
          received_at: string | null
          received_by: string | null
          status: string | null
          storage_conditions: string | null
          supplier_id: string | null
          supply_id: string
          unit_cost: number | null
        }
        Insert: {
          batch_number: string
          expiration_date: string
          id?: string
          manufacturer?: string | null
          manufacturing_date?: string | null
          quality_certificate_url?: string | null
          quantity_received: number
          quantity_remaining: number
          received_at?: string | null
          received_by?: string | null
          status?: string | null
          storage_conditions?: string | null
          supplier_id?: string | null
          supply_id: string
          unit_cost?: number | null
        }
        Update: {
          batch_number?: string
          expiration_date?: string
          id?: string
          manufacturer?: string | null
          manufacturing_date?: string | null
          quality_certificate_url?: string | null
          quantity_received?: number
          quantity_remaining?: number
          received_at?: string | null
          received_by?: string | null
          status?: string | null
          storage_conditions?: string | null
          supplier_id?: string | null
          supply_id?: string
          unit_cost?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "supply_batches_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supply_batches_supply_id_fkey"
            columns: ["supply_id"]
            isOneToOne: false
            referencedRelation: "supplies"
            referencedColumns: ["id"]
          },
        ]
      }
      surgeries: {
        Row: {
          complications: string | null
          created_at: string | null
          deleted_at: string | null
          description: string | null
          hospital_name: string | null
          id: string
          is_active: boolean | null
          patient_id: string
          recovery_notes: string | null
          surgeon_name: string | null
          surgery_date: string
          surgery_name: string
          surgery_type: string | null
          updated_at: string | null
        }
        Insert: {
          complications?: string | null
          created_at?: string | null
          deleted_at?: string | null
          description?: string | null
          hospital_name?: string | null
          id?: string
          is_active?: boolean | null
          patient_id: string
          recovery_notes?: string | null
          surgeon_name?: string | null
          surgery_date: string
          surgery_name: string
          surgery_type?: string | null
          updated_at?: string | null
        }
        Update: {
          complications?: string | null
          created_at?: string | null
          deleted_at?: string | null
          description?: string | null
          hospital_name?: string | null
          id?: string
          is_active?: boolean | null
          patient_id?: string
          recovery_notes?: string | null
          surgeon_name?: string | null
          surgery_date?: string
          surgery_name?: string
          surgery_type?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "surgeries_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patient_insights_summary"
            referencedColumns: ["patient_id"]
          },
          {
            foreignKeyName: "surgeries_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      task_supplies_used: {
        Row: {
          id: string
          notes: string | null
          patient_id: string | null
          quantity_used: number
          supply_id: string | null
          task_id: string
          total_cost: number | null
          unit_cost: number | null
          usage_date: string | null
          used_by: string | null
        }
        Insert: {
          id?: string
          notes?: string | null
          patient_id?: string | null
          quantity_used: number
          supply_id?: string | null
          task_id: string
          total_cost?: number | null
          unit_cost?: number | null
          usage_date?: string | null
          used_by?: string | null
        }
        Update: {
          id?: string
          notes?: string | null
          patient_id?: string | null
          quantity_used?: number
          supply_id?: string | null
          task_id?: string
          total_cost?: number | null
          unit_cost?: number | null
          usage_date?: string | null
          used_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "task_supplies_used_supply_id_fkey"
            columns: ["supply_id"]
            isOneToOne: false
            referencedRelation: "supplies"
            referencedColumns: ["id"]
          },
        ]
      }
      task_type_supply_templates: {
        Row: {
          created_at: string | null
          created_by: string | null
          default_quantity: number | null
          id: string
          is_required: boolean | null
          supply_id: string | null
          task_type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          default_quantity?: number | null
          id?: string
          is_required?: boolean | null
          supply_id?: string | null
          task_type: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          default_quantity?: number | null
          id?: string
          is_required?: boolean | null
          supply_id?: string | null
          task_type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "task_type_supply_templates_supply_id_fkey"
            columns: ["supply_id"]
            isOneToOne: false
            referencedRelation: "supplies"
            referencedColumns: ["id"]
          },
        ]
      }
      teleconsultas: {
        Row: {
          appointment_id: string | null
          connection_quality: string | null
          created_at: string | null
          duration_minutes: number | null
          ended_at: string | null
          id: string
          jwt_token: string | null
          metadata: Json | null
          moderator_password: string | null
          participant_password: string | null
          patient_feedback: string | null
          patient_id: string | null
          patient_joined_at: string | null
          patient_rating: number | null
          recording_duration: number | null
          recording_url: string | null
          room_name: string
          scheduled_end: string
          scheduled_start: string
          started_at: string | null
          status: string
          therapist_id: string | null
          therapist_joined_at: string | null
          therapist_notes: string | null
          updated_at: string | null
        }
        Insert: {
          appointment_id?: string | null
          connection_quality?: string | null
          created_at?: string | null
          duration_minutes?: number | null
          ended_at?: string | null
          id?: string
          jwt_token?: string | null
          metadata?: Json | null
          moderator_password?: string | null
          participant_password?: string | null
          patient_feedback?: string | null
          patient_id?: string | null
          patient_joined_at?: string | null
          patient_rating?: number | null
          recording_duration?: number | null
          recording_url?: string | null
          room_name: string
          scheduled_end: string
          scheduled_start: string
          started_at?: string | null
          status?: string
          therapist_id?: string | null
          therapist_joined_at?: string | null
          therapist_notes?: string | null
          updated_at?: string | null
        }
        Update: {
          appointment_id?: string | null
          connection_quality?: string | null
          created_at?: string | null
          duration_minutes?: number | null
          ended_at?: string | null
          id?: string
          jwt_token?: string | null
          metadata?: Json | null
          moderator_password?: string | null
          participant_password?: string | null
          patient_feedback?: string | null
          patient_id?: string | null
          patient_joined_at?: string | null
          patient_rating?: number | null
          recording_duration?: number | null
          recording_url?: string | null
          room_name?: string
          scheduled_end?: string
          scheduled_start?: string
          started_at?: string | null
          status?: string
          therapist_id?: string | null
          therapist_joined_at?: string | null
          therapist_notes?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "teleconsultas_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teleconsultas_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teleconsultas_therapist_id_fkey"
            columns: ["therapist_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      template_exercises: {
        Row: {
          created_at: string
          exercise_id: string
          frequency_per_week: number | null
          hold_time_seconds: number | null
          id: string
          intensity: string | null
          notes: string | null
          position: number
          reps: number | null
          rest_time_seconds: number | null
          sets: number | null
          template_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string
          exercise_id: string
          frequency_per_week?: number | null
          hold_time_seconds?: number | null
          id?: string
          intensity?: string | null
          notes?: string | null
          position?: number
          reps?: number | null
          rest_time_seconds?: number | null
          sets?: number | null
          template_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string
          exercise_id?: string
          frequency_per_week?: number | null
          hold_time_seconds?: number | null
          id?: string
          intensity?: string | null
          notes?: string | null
          position?: number
          reps?: number | null
          rest_time_seconds?: number | null
          sets?: number | null
          template_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "template_exercises_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "template_exercises_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "conduct_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      therapists: {
        Row: {
          appointment_duration: number | null
          bio: string | null
          color_code: string | null
          created_at: string | null
          deleted_at: string | null
          id: string
          is_accepting_patients: boolean | null
          license_number: string
          license_type: string | null
          specialties: string[] | null
          updated_at: string | null
          user_id: string
          working_hours: Json | null
        }
        Insert: {
          appointment_duration?: number | null
          bio?: string | null
          color_code?: string | null
          created_at?: string | null
          deleted_at?: string | null
          id?: string
          is_accepting_patients?: boolean | null
          license_number: string
          license_type?: string | null
          specialties?: string[] | null
          updated_at?: string | null
          user_id: string
          working_hours?: Json | null
        }
        Update: {
          appointment_duration?: number | null
          bio?: string | null
          color_code?: string | null
          created_at?: string | null
          deleted_at?: string | null
          id?: string
          is_accepting_patients?: boolean | null
          license_number?: string
          license_type?: string | null
          specialties?: string[] | null
          updated_at?: string | null
          user_id?: string
          working_hours?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "therapists_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_actions: {
        Row: {
          action_type: string
          created_at: string | null
          id: string
          metadata: Json | null
          target_id: string
          user_id: string | null
        }
        Insert: {
          action_type: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          target_id: string
          user_id?: string | null
        }
        Update: {
          action_type?: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          target_id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      users: {
        Row: {
          auth_id: string | null
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          created_by: string | null
          deleted_at: string | null
          deleted_by: string | null
          email: string
          email_verified: boolean | null
          email_verified_at: string | null
          failed_login_attempts: number | null
          full_name: string
          id: string
          is_active: boolean | null
          last_activity_at: string | null
          last_ip_address: unknown
          last_login_at: string | null
          locked_until: string | null
          notification_preferences: Json | null
          permissions: Json | null
          phone: string | null
          profile_settings: Json | null
          role: Database["public"]["Enums"]["user_role"] | null
          status: Database["public"]["Enums"]["user_status"] | null
          two_factor_enabled: boolean | null
          two_factor_secret: string | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          auth_id?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          email: string
          email_verified?: boolean | null
          email_verified_at?: string | null
          failed_login_attempts?: number | null
          full_name: string
          id?: string
          is_active?: boolean | null
          last_activity_at?: string | null
          last_ip_address?: unknown
          last_login_at?: string | null
          locked_until?: string | null
          notification_preferences?: Json | null
          permissions?: Json | null
          phone?: string | null
          profile_settings?: Json | null
          role?: Database["public"]["Enums"]["user_role"] | null
          status?: Database["public"]["Enums"]["user_status"] | null
          two_factor_enabled?: boolean | null
          two_factor_secret?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          auth_id?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          email?: string
          email_verified?: boolean | null
          email_verified_at?: string | null
          failed_login_attempts?: number | null
          full_name?: string
          id?: string
          is_active?: boolean | null
          last_activity_at?: string | null
          last_ip_address?: unknown
          last_login_at?: string | null
          locked_until?: string | null
          notification_preferences?: Json | null
          permissions?: Json | null
          phone?: string | null
          profile_settings?: Json | null
          role?: Database["public"]["Enums"]["user_role"] | null
          status?: Database["public"]["Enums"]["user_status"] | null
          two_factor_enabled?: boolean | null
          two_factor_secret?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "users_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "users_deleted_by_fkey"
            columns: ["deleted_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "users_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      waitlist: {
        Row: {
          contact_attempts: number | null
          created_at: string | null
          deleted_at: string | null
          id: string
          last_contact_date: string | null
          notes: string | null
          patient_id: string
          preferred_days: string[] | null
          preferred_start_from: string | null
          preferred_start_to: string | null
          preferred_times: string[] | null
          priority: string | null
          status: string | null
          therapist_id: string | null
          updated_at: string | null
        }
        Insert: {
          contact_attempts?: number | null
          created_at?: string | null
          deleted_at?: string | null
          id?: string
          last_contact_date?: string | null
          notes?: string | null
          patient_id: string
          preferred_days?: string[] | null
          preferred_start_from?: string | null
          preferred_start_to?: string | null
          preferred_times?: string[] | null
          priority?: string | null
          status?: string | null
          therapist_id?: string | null
          updated_at?: string | null
        }
        Update: {
          contact_attempts?: number | null
          created_at?: string | null
          deleted_at?: string | null
          id?: string
          last_contact_date?: string | null
          notes?: string | null
          patient_id?: string
          preferred_days?: string[] | null
          preferred_start_from?: string | null
          preferred_start_to?: string | null
          preferred_times?: string[] | null
          priority?: string | null
          status?: string | null
          therapist_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "waitlist_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patient_insights_summary"
            referencedColumns: ["patient_id"]
          },
          {
            foreignKeyName: "waitlist_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "waitlist_therapist_id_fkey"
            columns: ["therapist_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_messages_log: {
        Row: {
          created_at: string
          delivered_at: string | null
          error_message: string | null
          id: string
          message_content: string | null
          message_type: string
          patient_id: string | null
          phone_number: string
          read_at: string | null
          sent_at: string | null
          status: string
          template_id: string | null
          whatsapp_message_id: string | null
        }
        Insert: {
          created_at?: string
          delivered_at?: string | null
          error_message?: string | null
          id?: string
          message_content?: string | null
          message_type: string
          patient_id?: string | null
          phone_number: string
          read_at?: string | null
          sent_at?: string | null
          status?: string
          template_id?: string | null
          whatsapp_message_id?: string | null
        }
        Update: {
          created_at?: string
          delivered_at?: string | null
          error_message?: string | null
          id?: string
          message_content?: string | null
          message_type?: string
          patient_id?: string | null
          phone_number?: string
          read_at?: string | null
          sent_at?: string | null
          status?: string
          template_id?: string | null
          whatsapp_message_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_messages_log_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patient_insights_summary"
            referencedColumns: ["patient_id"]
          },
          {
            foreignKeyName: "whatsapp_messages_log_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_preferences: {
        Row: {
          created_at: string
          id: string
          opt_out_reason: string | null
          opted_in: boolean
          opted_in_at: string | null
          opted_out_at: string | null
          patient_id: string | null
          phone_number: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          opt_out_reason?: string | null
          opted_in?: boolean
          opted_in_at?: string | null
          opted_out_at?: string | null
          patient_id?: string | null
          phone_number: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          opt_out_reason?: string | null
          opted_in?: boolean
          opted_in_at?: string | null
          opted_out_at?: string | null
          patient_id?: string | null
          phone_number?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_preferences_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: true
            referencedRelation: "patient_insights_summary"
            referencedColumns: ["patient_id"]
          },
          {
            foreignKeyName: "whatsapp_preferences_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: true
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      patient_insights_summary: {
        Row: {
          cancelled_appointments: number | null
          completed_appointments: number | null
          email: string | null
          last_appointment_date: string | null
          patient_id: string | null
          patient_name: string | null
          phone: string | null
          registration_date: string | null
          total_appointments: number | null
          total_sessions: number | null
        }
        Relationships: []
      }
      v_active_prescriptions: {
        Row: {
          created_at: string | null
          end_date: string | null
          id: string | null
          notes: string | null
          patient_id: string | null
          patient_name: string | null
          start_date: string | null
          status: string | null
          therapist_id: string | null
          therapist_name: string | null
          updated_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "patient_exercise_prescriptions_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patient_insights_summary"
            referencedColumns: ["patient_id"]
          },
          {
            foreignKeyName: "patient_exercise_prescriptions_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_exercise_prescriptions_therapist_id_fkey"
            columns: ["therapist_id"]
            isOneToOne: false
            referencedRelation: "therapists"
            referencedColumns: ["id"]
          },
        ]
      }
      v_financial_monthly_summary: {
        Row: {
          avg_amount: number | null
          month: string | null
          total_amount: number | null
          transaction_count: number | null
          transaction_type: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      cancel_teleconsulta: {
        Args: {
          p_reason?: string
          p_teleconsulta_id: string
          p_user_id: string
        }
        Returns: boolean
      }
      check_appointment_conflict: {
        Args: {
          p_appointment_id?: string
          p_end_time: string
          p_start_time: string
          p_therapist_id: string
        }
        Returns: boolean
      }
      clean_old_push_tokens: { Args: never; Returns: undefined }
      cleanup_old_notifications: { Args: never; Returns: number }
      complete_notification_task: {
        Args: { message_id: number; queue_name?: string }
        Returns: boolean
      }
      create_notification: {
        Args: {
          p_channels?: string[]
          p_data?: Json
          p_message: string
          p_scheduled_for?: string
          p_title: string
          p_type: string
          p_user_id: string
        }
        Returns: string
      }
      create_patient_access_code: {
        Args: {
          p_created_by?: string
          p_expires_in_days?: number
          p_patient_id: string
        }
        Returns: {
          code: string
          expires_at: string
        }[]
      }
      create_payment: {
        Args: {
          p_amount: number
          p_appointment_id: string
          p_description?: string
          p_metadata?: Json
          p_patient_id: string
          p_payment_method: string
        }
        Returns: string
      }
      create_teleconsulta: {
        Args: {
          p_appointment_id: string
          p_patient_id: string
          p_scheduled_end: string
          p_scheduled_start: string
          p_therapist_id: string
        }
        Returns: {
          moderator_password: string
          participant_password: string
          room_name: string
          teleconsulta_id: string
        }[]
      }
      end_teleconsulta: {
        Args: {
          p_connection_quality?: string
          p_teleconsulta_id: string
          p_therapist_notes?: string
        }
        Returns: boolean
      }
      generate_access_code: { Args: never; Returns: string }
      get_exercise_statistics: {
        Args: never
        Returns: {
          by_category: Json
          by_difficulty: Json
          most_used_exercises: Json
          total_exercises: number
        }[]
      }
      get_financial_summary: {
        Args: {
          p_end_date: string
          p_start_date: string
          p_therapist_id?: string
        }
        Returns: {
          net_profit: number
          total_expenses: number
          total_revenue: number
          transaction_count: number
        }[]
      }
      get_therapist_availability: {
        Args: { p_date: string; p_therapist_id: string }
        Returns: {
          is_available: boolean
          slot_end: string
          slot_start: string
        }[]
      }
      get_unread_count: { Args: { p_user_id: string }; Returns: number }
      get_user_messages: {
        Args: { p_folder?: string; p_limit?: number }
        Returns: {
          created_at: string
          id: string
          is_reply: boolean
          message: string
          message_type: string
          priority: string
          read_at: string
          recipient_name: string
          sender_name: string
          status: string
          subject: string
          thread_id: string
        }[]
      }
      get_user_role: { Args: never; Returns: string }
      get_user_teleconsultas: {
        Args: { p_limit?: number; p_status?: string; p_user_id: string }
        Returns: {
          duration_minutes: number
          id: string
          patient_name: string
          patient_rating: number
          room_name: string
          scheduled_end: string
          scheduled_start: string
          status: string
          therapist_name: string
        }[]
      }
      has_permission: {
        Args: { permission: string; user_id: string }
        Returns: boolean
      }
      hybrid_search_knowledge:
        | {
            Args: {
              embedding_vector: string
              limit_count?: number
              search_query: string
              semantic_weight?: number
              text_weight?: number
            }
            Returns: {
              category: string
              combined_score: number
              content: string
              id: string
              tags: Json
              title: string
            }[]
          }
        | {
            Args: { search_query: string }
            Returns: {
              content: string
              id: string
              similarity: number
              title: string
            }[]
          }
      increment_material_download: {
        Args: { p_material_id: string }
        Returns: undefined
      }
      increment_template_usage: {
        Args: { template_id: string }
        Returns: undefined
      }
      invoke_process_appointment_reminders: { Args: never; Returns: undefined }
      is_admin: { Args: never; Returns: boolean }
      is_staff: { Args: never; Returns: boolean }
      is_therapist: { Args: never; Returns: boolean }
      mark_all_notifications_read: {
        Args: { p_user_id: string }
        Returns: number
      }
      mark_message_read: { Args: { p_message_id: string }; Returns: boolean }
      mark_notification_read: {
        Args: { p_notification_id: string; p_user_id: string }
        Returns: boolean
      }
      process_refund: {
        Args: { p_amount?: number; p_payment_id: string; p_reason?: string }
        Returns: boolean
      }
      read_notification_tasks: {
        Args: {
          batch_size?: number
          queue_name?: string
          visibility_timeout?: number
        }
        Returns: Json[]
      }
      request_appointment: {
        Args: {
          p_alternative_dates?: Json
          p_preferred_date: string
          p_preferred_time_slot: string
          p_reason: string
          p_therapist_id: string
          p_urgency?: string
        }
        Returns: string
      }
      respond_appointment_request: {
        Args: {
          p_approved: boolean
          p_approved_date?: string
          p_request_id: string
          p_response_message?: string
        }
        Returns: string
      }
      search_knowledge:
        | {
            Args: {
              filter_type?: string
              match_count?: number
              match_threshold?: number
              query_embedding: string
            }
            Returns: {
              content: string
              id: string
              metadata: Json
              similarity: number
              source_title: string
            }[]
          }
        | {
            Args: { limit_count?: number; search_query: string }
            Returns: {
              category: string
              content: string
              id: string
              rank: number
              tags: Json
              title: string
            }[]
          }
        | {
            Args: {
              match_threshold?: number
              max_results?: number
              query_text: string
            }
            Returns: {
              category: string
              content: string
              id: string
              similarity: number
              tags: string[]
              title: string
            }[]
          }
        | {
            Args: { search_query: string }
            Returns: {
              content: string
              id: string
              similarity: number
              title: string
            }[]
          }
      send_patient_message: {
        Args: {
          p_message: string
          p_message_type?: string
          p_priority?: string
          p_recipient_id: string
          p_subject: string
          p_thread_id?: string
        }
        Returns: string
      }
      soft_delete_user: { Args: { user_id: string }; Returns: undefined }
      start_teleconsulta: {
        Args: {
          p_teleconsulta_id: string
          p_user_id: string
          p_user_type: string
        }
        Returns: boolean
      }
      update_patient_stats: {
        Args: { p_patient_id: string }
        Returns: undefined
      }
      update_payment_status: {
        Args: {
          p_payment_id: string
          p_provider_response?: Json
          p_status: string
        }
        Returns: boolean
      }
      update_whatsapp_message_status: {
        Args: {
          p_status: string
          p_timestamp?: string
          p_whatsapp_message_id: string
        }
        Returns: undefined
      }
      validate_access_code: {
        Args: { p_access_code: string }
        Returns: {
          code_id: string
          is_valid: boolean
          patient_id: string
          patient_name: string
        }[]
      }
    }
    Enums: {
      user_role:
        | "admin"
        | "manager"
        | "therapist"
        | "receptionist"
        | "patient"
        | "partner"
        | "educator"
      user_status: "active" | "inactive" | "suspended" | "pending_verification"
    }
    CompositeTypes: {
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
    Enums: {
      user_role: [
        "admin",
        "manager",
        "therapist",
        "receptionist",
        "patient",
        "partner",
        "educator",
      ],
      user_status: ["active", "inactive", "suspended", "pending_verification"],
    },
  },
} as const