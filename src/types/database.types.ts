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
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointment_requests_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointment_requests_responded_by_fkey"
            columns: ["responded_by"]
            isOneToOne: false
            referencedRelation: "users"
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
          cancellation_reason: string | null
          cancelled_at: string | null
          cancelled_by: string | null
          checked_in_at: string | null
          checked_out_at: string | null
          created_at: string | null
          created_by: string | null
          deleted_at: string | null
          description: string | null
          duration: number | null
          end_time: string
          id: string
          is_recurring: boolean | null
          is_virtual: boolean | null
          meeting_id: string | null
          meeting_url: string | null
          notes: string | null
          paid: boolean | null
          parent_appointment_id: string | null
          patient_id: string
          patient_notes: string | null
          payment_id: string | null
          price: number | null
          recurrence_rule: Json | null
          reminder_sent: boolean | null
          reminder_sent_at: string | null
          start_time: string
          status: string | null
          therapist_id: string | null
          title: string | null
          type: string | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          cancellation_reason?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          checked_in_at?: string | null
          checked_out_at?: string | null
          created_at?: string | null
          created_by?: string | null
          deleted_at?: string | null
          description?: string | null
          duration?: number | null
          end_time: string
          id?: string
          is_recurring?: boolean | null
          is_virtual?: boolean | null
          meeting_id?: string | null
          meeting_url?: string | null
          notes?: string | null
          paid?: boolean | null
          parent_appointment_id?: string | null
          patient_id: string
          patient_notes?: string | null
          payment_id?: string | null
          price?: number | null
          recurrence_rule?: Json | null
          reminder_sent?: boolean | null
          reminder_sent_at?: string | null
          start_time: string
          status?: string | null
          therapist_id?: string | null
          title?: string | null
          type?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          cancellation_reason?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          checked_in_at?: string | null
          checked_out_at?: string | null
          created_at?: string | null
          created_by?: string | null
          deleted_at?: string | null
          description?: string | null
          duration?: number | null
          end_time?: string
          id?: string
          is_recurring?: boolean | null
          is_virtual?: boolean | null
          meeting_id?: string | null
          meeting_url?: string | null
          notes?: string | null
          paid?: boolean | null
          parent_appointment_id?: string | null
          patient_id?: string
          patient_notes?: string | null
          payment_id?: string | null
          price?: number | null
          recurrence_rule?: Json | null
          reminder_sent?: boolean | null
          reminder_sent_at?: string | null
          start_time?: string
          status?: string | null
          therapist_id?: string | null
          title?: string | null
          type?: string | null
          updated_at?: string | null
          updated_by?: string | null
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
            foreignKeyName: "appointments_parent_appointment_id_fkey"
            columns: ["parent_appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_therapist_id_fkey"
            columns: ["therapist_id"]
            isOneToOne: false
            referencedRelation: "users"
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
      attachments: {
        Row: {
          created_at: string
          id: string
          mime_type: string
          name: string
          patient_id: string | null
          session_id: string | null
          size: number
          storage_path: string
          type: string
          updated_at: string
          uploaded_at: string
          uploaded_by: string | null
          url: string
        }
        Insert: {
          created_at?: string
          id?: string
          mime_type: string
          name: string
          patient_id?: string | null
          session_id?: string | null
          size: number
          storage_path: string
          type: string
          updated_at?: string
          uploaded_at?: string
          uploaded_by?: string | null
          url: string
        }
        Update: {
          created_at?: string
          id?: string
          mime_type?: string
          name?: string
          patient_id?: string | null
          session_id?: string | null
          size?: number
          storage_path?: string
          type?: string
          updated_at?: string
          uploaded_at?: string
          uploaded_by?: string | null
          url?: string
        }
        Relationships: []
      }
      auto_replenishment_rules: {
        Row: {
          auto_approve_limit: number | null
          created_at: string | null
          created_by: string | null
          economic_order_quantity: number
          id: string
          is_enabled: boolean | null
          max_stock_level: number | null
          preferred_supplier_id: string | null
          reorder_point: number
          supply_id: string | null
          updated_at: string | null
        }
        Insert: {
          auto_approve_limit?: number | null
          created_at?: string | null
          created_by?: string | null
          economic_order_quantity: number
          id?: string
          is_enabled?: boolean | null
          max_stock_level?: number | null
          preferred_supplier_id?: string | null
          reorder_point: number
          supply_id?: string | null
          updated_at?: string | null
        }
        Update: {
          auto_approve_limit?: number | null
          created_at?: string | null
          created_by?: string | null
          economic_order_quantity?: number
          id?: string
          is_enabled?: boolean | null
          max_stock_level?: number | null
          preferred_supplier_id?: string | null
          reorder_point?: number
          supply_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "auto_replenishment_rules_preferred_supplier_id_fkey"
            columns: ["preferred_supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "auto_replenishment_rules_supply_id_fkey"
            columns: ["supply_id"]
            isOneToOne: true
            referencedRelation: "supplies"
            referencedColumns: ["id"]
          },
        ]
      }
      badges: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          name: string
          rarity: string | null
          slug: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          rarity?: string | null
          slug: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          rarity?: string | null
          slug?: string
        }
        Relationships: []
      }
      body_map_pain_regions: {
        Row: {
          body_region: string | null
          body_side: string | null
          created_at: string | null
          deleted_at: string | null
          id: string
          intensity: number
          is_active: boolean | null
          notes: string | null
          region_id: string
          session_id: string
          type: string | null
          updated_at: string | null
        }
        Insert: {
          body_region?: string | null
          body_side?: string | null
          created_at?: string | null
          deleted_at?: string | null
          id?: string
          intensity: number
          is_active?: boolean | null
          notes?: string | null
          region_id: string
          session_id: string
          type?: string | null
          updated_at?: string | null
        }
        Update: {
          body_region?: string | null
          body_side?: string | null
          created_at?: string | null
          deleted_at?: string | null
          id?: string
          intensity?: number
          is_active?: boolean | null
          notes?: string | null
          region_id?: string
          session_id?: string
          type?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "body_map_pain_regions_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "body_map_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      body_map_sessions: {
        Row: {
          appointment_id: string | null
          created_at: string | null
          deleted_at: string | null
          general_notes: string | null
          id: string
          pain_free: boolean | null
          patient_id: string
          session_date: string
          session_number: number
          therapist_id: string | null
          updated_at: string | null
        }
        Insert: {
          appointment_id?: string | null
          created_at?: string | null
          deleted_at?: string | null
          general_notes?: string | null
          id?: string
          pain_free?: boolean | null
          patient_id: string
          session_date?: string
          session_number: number
          therapist_id?: string | null
          updated_at?: string | null
        }
        Update: {
          appointment_id?: string | null
          created_at?: string | null
          deleted_at?: string | null
          general_notes?: string | null
          id?: string
          pain_free?: boolean | null
          patient_id?: string
          session_date?: string
          session_number?: number
          therapist_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "body_map_sessions_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "body_map_sessions_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patient_insights_summary"
            referencedColumns: ["patient_id"]
          },
          {
            foreignKeyName: "body_map_sessions_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "body_map_sessions_therapist_id_fkey"
            columns: ["therapist_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      clinical_material_categories: {
        Row: {
          color: string | null
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      clinical_materials: {
        Row: {
          category_id: string | null
          collaborators: string[] | null
          content: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          download_count: number | null
          edit_count: number | null
          file_type: string | null
          file_url: string | null
          id: string
          is_fillable: boolean | null
          last_edited_at: string | null
          name: string
          published_at: string | null
          status: string | null
          tags: string[] | null
          type: string
          updated_at: string | null
          updated_by: string | null
          version: number | null
        }
        Insert: {
          category_id?: string | null
          collaborators?: string[] | null
          content?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          download_count?: number | null
          edit_count?: number | null
          file_type?: string | null
          file_url?: string | null
          id?: string
          is_fillable?: boolean | null
          last_edited_at?: string | null
          name: string
          published_at?: string | null
          status?: string | null
          tags?: string[] | null
          type: string
          updated_at?: string | null
          updated_by?: string | null
          version?: number | null
        }
        Update: {
          category_id?: string | null
          collaborators?: string[] | null
          content?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          download_count?: number | null
          edit_count?: number | null
          file_type?: string | null
          file_url?: string | null
          id?: string
          is_fillable?: boolean | null
          last_edited_at?: string | null
          name?: string
          published_at?: string | null
          status?: string | null
          tags?: string[] | null
          type?: string
          updated_at?: string | null
          updated_by?: string | null
          version?: number | null
        }
        Relationships: []
      }
      conduct_templates: {
        Row: {
          assessment: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          is_template: boolean | null
          name: string
          objective: string | null
          patient_id: string | null
          plan: string | null
          source_session_date: string | null
          source_session_id: string | null
          subjective: string | null
          tests: Json | null
          times_used: number | null
        }
        Insert: {
          assessment?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_template?: boolean | null
          name: string
          objective?: string | null
          patient_id?: string | null
          plan?: string | null
          source_session_date?: string | null
          source_session_id?: string | null
          subjective?: string | null
          tests?: Json | null
          times_used?: number | null
        }
        Update: {
          assessment?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_template?: boolean | null
          name?: string
          objective?: string | null
          patient_id?: string | null
          plan?: string | null
          source_session_date?: string | null
          source_session_id?: string | null
          subjective?: string | null
          tests?: Json | null
          times_used?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "conduct_templates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conduct_templates_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patient_insights_summary"
            referencedColumns: ["patient_id"]
          },
          {
            foreignKeyName: "conduct_templates_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conduct_templates_source_session_id_fkey"
            columns: ["source_session_id"]
            isOneToOne: false
            referencedRelation: "session_evolutions"
            referencedColumns: ["id"]
          },
        ]
      }
      evolution_prescribed_exercises: {
        Row: {
          created_at: string
          evolution_id: string
          exercise_id: string
          hold_time_seconds: number | null
          id: string
          intensity: string | null
          notes: string | null
          pain_score: number | null
          performed: boolean | null
          position: number
          reps: number | null
          rest_time_seconds: number | null
          sets: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string
          evolution_id: string
          exercise_id: string
          hold_time_seconds?: number | null
          id?: string
          intensity?: string | null
          notes?: string | null
          pain_score?: number | null
          performed?: boolean | null
          position?: number
          reps?: number | null
          rest_time_seconds?: number | null
          sets?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string
          evolution_id?: string
          exercise_id?: string
          hold_time_seconds?: number | null
          id?: string
          intensity?: string | null
          notes?: string | null
          pain_score?: number | null
          performed?: boolean | null
          position?: number
          reps?: number | null
          rest_time_seconds?: number | null
          sets?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "evolution_prescribed_exercises_evolution_id_fkey"
            columns: ["evolution_id"]
            isOneToOne: false
            referencedRelation: "session_evolutions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evolution_prescribed_exercises_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
        ]
      }
      evolution_templates: {
        Row: {
          assessment_template: string | null
          conducts: Json | null
          created_at: string | null
          description: string | null
          exercises: Json | null
          id: string
          last_used_at: string | null
          name: string
          objective_template: string | null
          subjective_template: string | null
          therapist_id: string | null
          updated_at: string | null
          usage_count: number | null
        }
        Insert: {
          assessment_template?: string | null
          conducts?: Json | null
          created_at?: string | null
          description?: string | null
          exercises?: Json | null
          id?: string
          last_used_at?: string | null
          name: string
          objective_template?: string | null
          subjective_template?: string | null
          therapist_id?: string | null
          updated_at?: string | null
          usage_count?: number | null
        }
        Update: {
          assessment_template?: string | null
          conducts?: Json | null
          created_at?: string | null
          description?: string | null
          exercises?: Json | null
          id?: string
          last_used_at?: string | null
          name?: string
          objective_template?: string | null
          subjective_template?: string | null
          therapist_id?: string | null
          updated_at?: string | null
          usage_count?: number | null
        }
        Relationships: []
      }
      exercise_completions: {
        Row: {
          completed_at: string | null
          completed_date: string | null
          difficulty_level: number | null
          duration_seconds: number | null
          id: string
          notes: string | null
          pain_level: number | null
          patient_exercise_id: string
          patient_id: string
          reps_completed: number | null
          sets_completed: number | null
        }
        Insert: {
          completed_at?: string | null
          completed_date?: string | null
          difficulty_level?: number | null
          duration_seconds?: number | null
          id?: string
          notes?: string | null
          pain_level?: number | null
          patient_exercise_id: string
          patient_id: string
          reps_completed?: number | null
          sets_completed?: number | null
        }
        Update: {
          completed_at?: string | null
          completed_date?: string | null
          difficulty_level?: number | null
          duration_seconds?: number | null
          id?: string
          notes?: string | null
          pain_level?: number | null
          patient_exercise_id?: string
          patient_id?: string
          reps_completed?: number | null
          sets_completed?: number | null
        }
        Relationships: []
      }
      exercise_protocols: {
        Row: {
          category: string
          created_at: string | null
          created_by: string | null
          deleted_at: string | null
          description: string
          duration_weeks: number
          exercises: Json | null
          frequency_per_week: number
          id: string
          is_active: boolean | null
          name: string
          pathology: string
          phase: string | null
          updated_at: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          created_by?: string | null
          deleted_at?: string | null
          description: string
          duration_weeks?: number
          exercises?: Json | null
          frequency_per_week?: number
          id?: string
          is_active?: boolean | null
          name: string
          pathology: string
          phase?: string | null
          updated_at?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          created_by?: string | null
          deleted_at?: string | null
          description?: string
          duration_weeks?: number
          exercises?: Json | null
          frequency_per_week?: number
          id?: string
          is_active?: boolean | null
          name?: string
          pathology?: string
          phase?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "exercise_protocols_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      exercise_videos: {
        Row: {
          category: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          duration: number | null
          id: string
          is_active: boolean | null
          storage_path: string | null
          tags: string[] | null
          thumbnail_url: string | null
          title: string
          updated_at: string | null
          video_type: string | null
          video_url: string
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          duration?: number | null
          id?: string
          is_active?: boolean | null
          storage_path?: string | null
          tags?: string[] | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string | null
          video_type?: string | null
          video_url: string
        }
        Update: {
          category?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          duration?: number | null
          id?: string
          is_active?: boolean | null
          storage_path?: string | null
          tags?: string[] | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string | null
          video_type?: string | null
          video_url?: string
        }
        Relationships: []
      }
      exercises: {
        Row: {
          benefits: string[] | null
          body_parts: string[] | null
          category: string
          contraindications: string[] | null
          created_at: string | null
          created_by: string | null
          deleted_at: string | null
          description: string
          difficulty: number | null
          difficulty_level: string | null
          duration: number | null
          duration_minutes: number | null
          equipment: string[] | null
          id: string
          image_urls: string[] | null
          indications: string[] | null
          instructions: string[] | null
          is_active: boolean | null
          media: Json | null
          modifications: Json | null
          muscle_groups: string[] | null
          name: string
          precautions: string[] | null
          repetitions: number | null
          rest_time: number | null
          sets: number | null
          tags: string[] | null
          updated_at: string | null
          video_url: string | null
        }
        Insert: {
          benefits?: string[] | null
          body_parts?: string[] | null
          category: string
          contraindications?: string[] | null
          created_at?: string | null
          created_by?: string | null
          deleted_at?: string | null
          description: string
          difficulty?: number | null
          difficulty_level?: string | null
          duration?: number | null
          duration_minutes?: number | null
          equipment?: string[] | null
          id?: string
          image_urls?: string[] | null
          indications?: string[] | null
          instructions?: string[] | null
          is_active?: boolean | null
          media?: Json | null
          modifications?: Json | null
          muscle_groups?: string[] | null
          name: string
          precautions?: string[] | null
          repetitions?: number | null
          rest_time?: number | null
          sets?: number | null
          tags?: string[] | null
          updated_at?: string | null
          video_url?: string | null
        }
        Update: {
          benefits?: string[] | null
          body_parts?: string[] | null
          category?: string
          contraindications?: string[] | null
          created_at?: string | null
          created_by?: string | null
          deleted_at?: string | null
          description?: string
          difficulty?: number | null
          difficulty_level?: string | null
          duration?: number | null
          duration_minutes?: number | null
          equipment?: string[] | null
          id?: string
          image_urls?: string[] | null
          indications?: string[] | null
          instructions?: string[] | null
          is_active?: boolean | null
          media?: Json | null
          modifications?: Json | null
          muscle_groups?: string[] | null
          name?: string
          precautions?: string[] | null
          repetitions?: number | null
          rest_time?: number | null
          sets?: number | null
          tags?: string[] | null
          updated_at?: string | null
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "exercises_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      exercises_library: {
        Row: {
          category: string | null
          created_at: string | null
          description: string
          id: string
          is_active: boolean | null
          name: string
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description: string
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      expense_categories: {
        Row: {
          color: string | null
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          monthly_budget: number | null
          name: string
          updated_at: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          monthly_budget?: number | null
          name: string
          updated_at?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          monthly_budget?: number | null
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      financial_transactions: {
        Row: {
          amount: number
          appointment_id: string | null
          breakdown: Json | null
          category: string | null
          created_at: string | null
          created_by: string | null
          currency: string | null
          customer_id: string | null
          deleted_at: string | null
          description: string
          due_date: string | null
          id: string
          metadata: Json | null
          notes: string | null
          patient_id: string | null
          payment_date: string | null
          payment_method: string | null
          payment_status: string | null
          provider: string | null
          provider_transaction_id: string | null
          status: string | null
          therapist_id: string | null
          title: string | null
          transaction_type: string | null
          type: string
          updated_at: string | null
        }
        Insert: {
          amount: number
          appointment_id?: string | null
          breakdown?: Json | null
          category?: string | null
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          customer_id?: string | null
          deleted_at?: string | null
          description: string
          due_date?: string | null
          id?: string
          metadata?: Json | null
          notes?: string | null
          patient_id?: string | null
          payment_date?: string | null
          payment_method?: string | null
          payment_status?: string | null
          provider?: string | null
          provider_transaction_id?: string | null
          status?: string | null
          therapist_id?: string | null
          title?: string | null
          transaction_type?: string | null
          type: string
          updated_at?: string | null
        }
        Update: {
          amount?: number
          appointment_id?: string | null
          breakdown?: Json | null
          category?: string | null
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          customer_id?: string | null
          deleted_at?: string | null
          description?: string
          due_date?: string | null
          id?: string
          metadata?: Json | null
          notes?: string | null
          patient_id?: string | null
          payment_date?: string | null
          payment_method?: string | null
          payment_status?: string | null
          provider?: string | null
          provider_transaction_id?: string | null
          status?: string | null
          therapist_id?: string | null
          title?: string | null
          transaction_type?: string | null
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "financial_transactions_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financial_transactions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financial_transactions_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patient_insights_summary"
            referencedColumns: ["patient_id"]
          },
          {
            foreignKeyName: "financial_transactions_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financial_transactions_therapist_id_fkey"
            columns: ["therapist_id"]
            isOneToOne: false
            referencedRelation: "therapists"
            referencedColumns: ["id"]
          },
        ]
      }
      gamification_points: {
        Row: {
          created_at: string | null
          id: string
          patient_id: string
          points_earned: number
          points_type: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          patient_id: string
          points_earned: number
          points_type: string
        }
        Update: {
          created_at?: string | null
          id?: string
          patient_id?: string
          points_earned?: number
          points_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "gamification_points_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patient_insights_summary"
            referencedColumns: ["patient_id"]
          },
          {
            foreignKeyName: "gamification_points_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      knowledge_base: {
        Row: {
          author: string | null
          content: string
          created_at: string | null
          created_by: string | null
          embedding: string | null
          id: string
          metadata: Json | null
          search_vector: unknown
          source_title: string
          source_type: string | null
          source_url: string | null
          updated_at: string | null
        }
        Insert: {
          author?: string | null
          content: string
          created_at?: string | null
          created_by?: string | null
          embedding?: string | null
          id?: string
          metadata?: Json | null
          search_vector?: unknown
          source_title: string
          source_type?: string | null
          source_url?: string | null
          updated_at?: string | null
        }
        Update: {
          author?: string | null
          content?: string
          created_at?: string | null
          created_by?: string | null
          embedding?: string | null
          id?: string
          metadata?: Json | null
          search_vector?: unknown
          source_title?: string
          source_type?: string | null
          source_url?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      knowledge_base_queries: {
        Row: {
          avg_similarity: number | null
          created_at: string | null
          execution_time_ms: number | null
          id: string
          query_text: string
          results_count: number | null
          user_id: string | null
        }
        Insert: {
          avg_similarity?: number | null
          created_at?: string | null
          execution_time_ms?: number | null
          id?: string
          query_text: string
          results_count?: number | null
          user_id?: string | null
        }
        Update: {
          avg_similarity?: number | null
          created_at?: string | null
          execution_time_ms?: number | null
          id?: string
          query_text?: string
          results_count?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      mandatory_test_alerts: {
        Row: {
          completed_at: string | null
          completed_by: string | null
          created_at: string | null
          deleted_at: string | null
          description: string | null
          due_date: string | null
          frequency_type: string | null
          id: string
          instructions: string | null
          is_completed: boolean | null
          patient_id: string
          reminder_sent: boolean | null
          severity: string | null
          test_name: string
          test_type: string
          therapist_id: string | null
          updated_at: string | null
        }
        Insert: {
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string | null
          deleted_at?: string | null
          description?: string | null
          due_date?: string | null
          frequency_type?: string | null
          id?: string
          instructions?: string | null
          is_completed?: boolean | null
          patient_id: string
          reminder_sent?: boolean | null
          severity?: string | null
          test_name: string
          test_type: string
          therapist_id?: string | null
          updated_at?: string | null
        }
        Update: {
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string | null
          deleted_at?: string | null
          description?: string | null
          due_date?: string | null
          frequency_type?: string | null
          id?: string
          instructions?: string | null
          is_completed?: boolean | null
          patient_id?: string
          reminder_sent?: boolean | null
          severity?: string | null
          test_name?: string
          test_type?: string
          therapist_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mandatory_test_alerts_completed_by_fkey"
            columns: ["completed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mandatory_test_alerts_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patient_insights_summary"
            referencedColumns: ["patient_id"]
          },
          {
            foreignKeyName: "mandatory_test_alerts_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mandatory_test_alerts_therapist_id_fkey"
            columns: ["therapist_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      material_favorites: {
        Row: {
          created_at: string | null
          id: string
          material_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          material_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          material_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "material_favorites_material_id_fkey"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "clinical_materials"
            referencedColumns: ["id"]
          },
        ]
      }
      medical_insights: {
        Row: {
          data: Json | null
          description: string | null
          generated_at: string | null
          id: string
          patient_id: string | null
          severity: string | null
          suggested_text: string | null
          title: string
          type: string
        }
        Insert: {
          data?: Json | null
          description?: string | null
          generated_at?: string | null
          id?: string
          patient_id?: string | null
          severity?: string | null
          suggested_text?: string | null
          title: string
          type: string
        }
        Update: {
          data?: Json | null
          description?: string | null
          generated_at?: string | null
          id?: string
          patient_id?: string | null
          severity?: string | null
          suggested_text?: string | null
          title?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "medical_insights_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patient_insights_summary"
            referencedColumns: ["patient_id"]
          },
          {
            foreignKeyName: "medical_insights_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_logs: {
        Row: {
          channel: string
          created_at: string | null
          delivered_at: string | null
          error_message: string | null
          failed_at: string | null
          id: string
          notification_id: string | null
          provider: string | null
          provider_id: string | null
          provider_response: Json | null
          retry_count: number | null
          sent_at: string | null
          status: string
        }
        Insert: {
          channel: string
          created_at?: string | null
          delivered_at?: string | null
          error_message?: string | null
          failed_at?: string | null
          id?: string
          notification_id?: string | null
          provider?: string | null
          provider_id?: string | null
          provider_response?: Json | null
          retry_count?: number | null
          sent_at?: string | null
          status: string
        }
        Update: {
          channel?: string
          created_at?: string | null
          delivered_at?: string | null
          error_message?: string | null
          failed_at?: string | null
          id?: string
          notification_id?: string | null
          provider?: string | null
          provider_id?: string | null
          provider_response?: Json | null
          retry_count?: number | null
          sent_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_logs_notification_id_fkey"
            columns: ["notification_id"]
            isOneToOne: false
            referencedRelation: "notifications"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_schedules: {
        Row: {
          appointment_id: string
          created_at: string | null
          id: string
          metadata: Json | null
          notification_type: string
          scheduled_for: string
          sent: boolean
          sent_at: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          appointment_id: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          notification_type: string
          scheduled_for: string
          sent?: boolean
          sent_at?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          appointment_id?: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          notification_type?: string
          scheduled_for?: string
          sent?: boolean
          sent_at?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_schedules_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_templates: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          email_template: string | null
          id: string
          is_active: boolean | null
          name: string
          push_template: string | null
          sms_template: string | null
          subject_template: string
          type: string
          updated_at: string | null
          variables: string[] | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          email_template?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          push_template?: string | null
          sms_template?: string | null
          subject_template: string
          type: string
          updated_at?: string | null
          variables?: string[] | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          email_template?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          push_template?: string | null
          sms_template?: string | null
          subject_template?: string
          type?: string
          updated_at?: string | null
          variables?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "notification_templates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          action_label: string | null
          action_url: string | null
          created_at: string | null
          data: Json | null
          deleted_at: string | null
          expires_at: string | null
          id: string
          message: string
          metadata: Json | null
          read: boolean | null
          read_at: string | null
          sent_via: string[] | null
          title: string
          type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          action_label?: string | null
          action_url?: string | null
          created_at?: string | null
          data?: Json | null
          deleted_at?: string | null
          expires_at?: string | null
          id?: string
          message: string
          metadata?: Json | null
          read?: boolean | null
          read_at?: string | null
          sent_via?: string[] | null
          title: string
          type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          action_label?: string | null
          action_url?: string | null
          created_at?: string | null
          data?: Json | null
          deleted_at?: string | null
          expires_at?: string | null
          id?: string
          message?: string
          metadata?: Json | null
          read?: boolean | null
          read_at?: string | null
          sent_via?: string[] | null
          title?: string
          type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      pathologies: {
        Row: {
          created_at: string | null
          deleted_at: string | null
          description: string | null
          icd_code: string | null
          id: string
          is_active: boolean | null
          is_chronic: boolean | null
          medications: string[] | null
          name: string
          onset_date: string | null
          pathology_type: string | null
          patient_id: string
          severity: string | null
          treatment_plan: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          deleted_at?: string | null
          description?: string | null
          icd_code?: string | null
          id?: string
          is_active?: boolean | null
          is_chronic?: boolean | null
          medications?: string[] | null
          name: string
          onset_date?: string | null
          pathology_type?: string | null
          patient_id: string
          severity?: string | null
          treatment_plan?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          deleted_at?: string | null
          description?: string | null
          icd_code?: string | null
          id?: string
          is_active?: boolean | null
          is_chronic?: boolean | null
          medications?: string[] | null
          name?: string
          onset_date?: string | null
          pathology_type?: string | null
          patient_id?: string
          severity?: string | null
          treatment_plan?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pathologies_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patient_insights_summary"
            referencedColumns: ["patient_id"]
          },
          {
            foreignKeyName: "pathologies_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      patient_access_codes: {
        Row: {
          access_code: string
          created_at: string | null
          created_by: string | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          last_used_at: string | null
          patient_id: string
          use_count: number | null
        }
        Insert: {
          access_code: string
          created_at?: string | null
          created_by?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          last_used_at?: string | null
          patient_id: string
          use_count?: number | null
        }
        Update: {
          access_code?: string
          created_at?: string | null
          created_by?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          last_used_at?: string | null
          patient_id?: string
          use_count?: number | null
        }
        Relationships: []
      }
      patient_access_logs: {
        Row: {
          access_code_id: string | null
          access_type: string
          created_at: string | null
          device_info: Json | null
          error_message: string | null
          id: string
          ip_address: string | null
          patient_id: string
          success: boolean | null
          user_agent: string | null
        }
        Insert: {
          access_code_id?: string | null
          access_type: string
          created_at?: string | null
          device_info?: Json | null
          error_message?: string | null
          id?: string
          ip_address?: string | null
          patient_id: string
          success?: boolean | null
          user_agent?: string | null
        }
        Update: {
          access_code_id?: string | null
          access_type?: string
          created_at?: string | null
          device_info?: Json | null
          error_message?: string | null
          id?: string
          ip_address?: string | null
          patient_id?: string
          success?: boolean | null
          user_agent?: string | null
        }
        Relationships: []
      }
      patient_exercise_prescriptions: {
        Row: {
          completion_percentage: number | null
          created_at: string | null
          created_by: string | null
          deleted_at: string | null
          description: string | null
          end_date: string | null
          exercises: Json
          frequency_per_week: number | null
          id: string
          notes: string | null
          patient_feedback: string | null
          patient_id: string
          protocol_id: string | null
          sessions_completed: number | null
          start_date: string
          status: string | null
          therapist_id: string
          title: string
          total_sessions_planned: number | null
          updated_at: string | null
        }
        Insert: {
          completion_percentage?: number | null
          created_at?: string | null
          created_by?: string | null
          deleted_at?: string | null
          description?: string | null
          end_date?: string | null
          exercises?: Json
          frequency_per_week?: number | null
          id?: string
          notes?: string | null
          patient_feedback?: string | null
          patient_id: string
          protocol_id?: string | null
          sessions_completed?: number | null
          start_date: string
          status?: string | null
          therapist_id: string
          title: string
          total_sessions_planned?: number | null
          updated_at?: string | null
        }
        Update: {
          completion_percentage?: number | null
          created_at?: string | null
          created_by?: string | null
          deleted_at?: string | null
          description?: string | null
          end_date?: string | null
          exercises?: Json
          frequency_per_week?: number | null
          id?: string
          notes?: string | null
          patient_feedback?: string | null
          patient_id?: string
          protocol_id?: string | null
          sessions_completed?: number | null
          start_date?: string
          status?: string | null
          therapist_id?: string
          title?: string
          total_sessions_planned?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "patient_exercise_prescriptions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
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
            foreignKeyName: "patient_exercise_prescriptions_protocol_id_fkey"
            columns: ["protocol_id"]
            isOneToOne: false
            referencedRelation: "exercise_protocols"
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
      patient_exercises: {
        Row: {
          created_at: string | null
          description: string | null
          duration_seconds: number | null
          end_date: string | null
          exercise_name: string
          exercise_video_id: string | null
          frequency_per_week: number | null
          id: string
          instructions: string | null
          is_active: boolean | null
          notes: string | null
          patient_id: string
          prescribed_by: string
          reps: number | null
          rest_seconds: number | null
          sets: number | null
          start_date: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          duration_seconds?: number | null
          end_date?: string | null
          exercise_name: string
          exercise_video_id?: string | null
          frequency_per_week?: number | null
          id?: string
          instructions?: string | null
          is_active?: boolean | null
          notes?: string | null
          patient_id: string
          prescribed_by: string
          reps?: number | null
          rest_seconds?: number | null
          sets?: number | null
          start_date?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          duration_seconds?: number | null
          end_date?: string | null
          exercise_name?: string
          exercise_video_id?: string | null
          frequency_per_week?: number | null
          id?: string
          instructions?: string | null
          is_active?: boolean | null
          notes?: string | null
          patient_id?: string
          prescribed_by?: string
          reps?: number | null
          rest_seconds?: number | null
          sets?: number | null
          start_date?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      patient_goals: {
        Row: {
          created_at: string | null
          current_value: number | null
          deleted_at: string | null
          description: string | null
          goal_type: string | null
          id: string
          patient_id: string
          priority: string | null
          start_date: string | null
          status: string | null
          target_date: string | null
          target_value: number | null
          therapist_id: string | null
          title: string
          unit: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          current_value?: number | null
          deleted_at?: string | null
          description?: string | null
          goal_type?: string | null
          id?: string
          patient_id: string
          priority?: string | null
          start_date?: string | null
          status?: string | null
          target_date?: string | null
          target_value?: number | null
          therapist_id?: string | null
          title: string
          unit?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          current_value?: number | null
          deleted_at?: string | null
          description?: string | null
          goal_type?: string | null
          id?: string
          patient_id?: string
          priority?: string | null
          start_date?: string | null
          status?: string | null
          target_date?: string | null
          target_value?: number | null
          therapist_id?: string | null
          title?: string
          unit?: string | null
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
          {
            foreignKeyName: "patient_goals_therapist_id_fkey"
            columns: ["therapist_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      patient_messages: {
        Row: {
          archived_at: string | null
          attachments: Json | null
          created_at: string | null
          id: string
          is_archived: boolean | null
          is_read: boolean | null
          is_reply: boolean | null
          message: string
          message_type: string | null
          parent_message_id: string | null
          priority: string | null
          read_at: string | null
          recipient_id: string
          sender_id: string
          status: string | null
          subject: string | null
          thread_id: string | null
          updated_at: string | null
        }
        Insert: {
          archived_at?: string | null
          attachments?: Json | null
          created_at?: string | null
          id?: string
          is_archived?: boolean | null
          is_read?: boolean | null
          is_reply?: boolean | null
          message: string
          message_type?: string | null
          parent_message_id?: string | null
          priority?: string | null
          read_at?: string | null
          recipient_id: string
          sender_id: string
          status?: string | null
          subject?: string | null
          thread_id?: string | null
          updated_at?: string | null
        }
        Update: {
          archived_at?: string | null
          attachments?: Json | null
          created_at?: string | null
          id?: string
          is_archived?: boolean | null
          is_read?: boolean | null
          is_reply?: boolean | null
          message?: string
          message_type?: string | null
          parent_message_id?: string | null
          priority?: string | null
          read_at?: string | null
          recipient_id?: string
          sender_id?: string
          status?: string | null
          subject?: string | null
          thread_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "patient_messages_parent_message_id_fkey"
            columns: ["parent_message_id"]
            isOneToOne: false
            referencedRelation: "patient_messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_messages_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_messages_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "patient_messages"
            referencedColumns: ["id"]
          },
        ]
      }
      patient_stats: {
        Row: {
          completion_rate: number | null
          current_streak_days: number | null
          id: string
          last_exercise_completed_at: string | null
          last_login_at: string | null
          longest_streak_days: number | null
          patient_id: string
          sessions_attendance_rate: number | null
          total_exercises_assigned: number | null
          total_exercises_completed: number | null
          total_sessions_completed: number | null
          updated_at: string | null
        }
        Insert: {
          completion_rate?: number | null
          current_streak_days?: number | null
          id?: string
          last_exercise_completed_at?: string | null
          last_login_at?: string | null
          longest_streak_days?: number | null
          patient_id: string
          sessions_attendance_rate?: number | null
          total_exercises_assigned?: number | null
          total_exercises_completed?: number | null
          total_sessions_completed?: number | null
          updated_at?: string | null
        }
        Update: {
          completion_rate?: number | null
          current_streak_days?: number | null
          id?: string
          last_exercise_completed_at?: string | null
          last_login_at?: string | null
          longest_streak_days?: number | null
          patient_id?: string
          sessions_attendance_rate?: number | null
          total_exercises_assigned?: number | null
          total_exercises_completed?: number | null
          total_sessions_completed?: number | null
          updated_at?: string | null
        }
        Relationships: []
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
A new version of Supabase CLI is available: v2.58.5 (currently installed v2.51.0)
We recommend updating regularly for new features and bug fixes: https://supabase.com/docs/guides/cli/getting-started#updating-the-supabase-cli
