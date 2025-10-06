export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      ai_predictions: {
        Row: {
          actual_value: number | null
          clinic_id: string | null
          confidence_score: number | null
          created_at: string
          factors: Json | null
          id: string
          metadata: Json | null
          predicted_value: number | null
          prediction_type: string
          target_date: string
          updated_at: string
        }
        Insert: {
          actual_value?: number | null
          clinic_id?: string | null
          confidence_score?: number | null
          created_at?: string
          factors?: Json | null
          id?: string
          metadata?: Json | null
          predicted_value?: number | null
          prediction_type: string
          target_date: string
          updated_at?: string
        }
        Update: {
          actual_value?: number | null
          clinic_id?: string | null
          confidence_score?: number | null
          created_at?: string
          factors?: Json | null
          id?: string
          metadata?: Json | null
          predicted_value?: number | null
          prediction_type?: string
          target_date?: string
          updated_at?: string
        }
        Relationships: []
      }
      alert_history: {
        Row: {
          action: string
          alert_id: string | null
          id: string
          metadata: Json | null
          notes: string | null
          performed_at: string | null
          performed_by: string | null
        }
        Insert: {
          action: string
          alert_id?: string | null
          id?: string
          metadata?: Json | null
          notes?: string | null
          performed_at?: string | null
          performed_by?: string | null
        }
        Update: {
          action?: string
          alert_id?: string | null
          id?: string
          metadata?: Json | null
          notes?: string | null
          performed_at?: string | null
          performed_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "alert_history_alert_id_fkey"
            columns: ["alert_id"]
            isOneToOne: false
            referencedRelation: "supply_alerts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alert_history_performed_by_fkey"
            columns: ["performed_by"]
            isOneToOne: false
            referencedRelation: "task_cost_analytics"
            referencedColumns: ["therapist_id"]
          },
          {
            foreignKeyName: "alert_history_performed_by_fkey"
            columns: ["performed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      appointments: {
        Row: {
          appointment_type: string | null
          cancellation_reason: string | null
          created_at: string | null
          end_time: string | null
          id: string
          metadata: Json | null
          notes: string | null
          patient_id: string | null
          payment_status: string | null
          price: number | null
          recurrence_rule: Json | null
          recurrence_template_id: string | null
          scheduled_at: string
          series_id: string | null
          start_time: string | null
          status: string | null
          therapist_id: string | null
          updated_at: string | null
          value: number | null
        }
        Insert: {
          appointment_type?: string | null
          cancellation_reason?: string | null
          created_at?: string | null
          end_time?: string | null
          id?: string
          metadata?: Json | null
          notes?: string | null
          patient_id?: string | null
          payment_status?: string | null
          price?: number | null
          recurrence_rule?: Json | null
          recurrence_template_id?: string | null
          scheduled_at: string
          series_id?: string | null
          start_time?: string | null
          status?: string | null
          therapist_id?: string | null
          updated_at?: string | null
          value?: number | null
        }
        Update: {
          appointment_type?: string | null
          cancellation_reason?: string | null
          created_at?: string | null
          end_time?: string | null
          id?: string
          metadata?: Json | null
          notes?: string | null
          patient_id?: string | null
          payment_status?: string | null
          price?: number | null
          recurrence_rule?: Json | null
          recurrence_template_id?: string | null
          scheduled_at?: string
          series_id?: string | null
          start_time?: string | null
          status?: string | null
          therapist_id?: string | null
          updated_at?: string | null
          value?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "appointments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patient_dashboard_view"
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
            foreignKeyName: "appointments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "task_cost_analytics"
            referencedColumns: ["patient_id"]
          },
          {
            foreignKeyName: "appointments_recurrence_template_id_fkey"
            columns: ["recurrence_template_id"]
            isOneToOne: false
            referencedRelation: "recurrence_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_therapist_id_fkey"
            columns: ["therapist_id"]
            isOneToOne: false
            referencedRelation: "task_cost_analytics"
            referencedColumns: ["therapist_id"]
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
      audit_trail: {
        Row: {
          action: string
          details: Json | null
          document_id: string | null
          id: string
          ip_address: unknown | null
          performed_at: string | null
          performed_by: string
          user_agent: string | null
        }
        Insert: {
          action: string
          details?: Json | null
          document_id?: string | null
          id?: string
          ip_address?: unknown | null
          performed_at?: string | null
          performed_by: string
          user_agent?: string | null
        }
        Update: {
          action?: string
          details?: Json | null
          document_id?: string | null
          id?: string
          ip_address?: unknown | null
          performed_at?: string | null
          performed_by?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_trail_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "clinical_documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_trail_performed_by_fkey"
            columns: ["performed_by"]
            isOneToOne: false
            referencedRelation: "task_cost_analytics"
            referencedColumns: ["therapist_id"]
          },
          {
            foreignKeyName: "audit_trail_performed_by_fkey"
            columns: ["performed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      auto_alert_rules: {
        Row: {
          conditions: Json
          created_at: string | null
          created_by: string | null
          escalation_rules: Json | null
          id: string
          is_active: boolean | null
          notification_channels: string[] | null
          rule_name: string
          rule_type: string
          severity: string | null
          updated_at: string | null
        }
        Insert: {
          conditions: Json
          created_at?: string | null
          created_by?: string | null
          escalation_rules?: Json | null
          id?: string
          is_active?: boolean | null
          notification_channels?: string[] | null
          rule_name: string
          rule_type: string
          severity?: string | null
          updated_at?: string | null
        }
        Update: {
          conditions?: Json
          created_at?: string | null
          created_by?: string | null
          escalation_rules?: Json | null
          id?: string
          is_active?: boolean | null
          notification_channels?: string[] | null
          rule_name?: string
          rule_type?: string
          severity?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "auto_alert_rules_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "task_cost_analytics"
            referencedColumns: ["therapist_id"]
          },
          {
            foreignKeyName: "auto_alert_rules_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      automation_executions: {
        Row: {
          actions_executed: number | null
          appointment_id: string | null
          created_at: string | null
          duration_ms: number | null
          error_details: Json | null
          error_message: string | null
          id: string
          messages_sent: number | null
          metadata: Json | null
          patient_id: string | null
          rule_id: string | null
          status: string
          trigger_event_data: Json | null
          triggered_at: string | null
        }
        Insert: {
          actions_executed?: number | null
          appointment_id?: string | null
          created_at?: string | null
          duration_ms?: number | null
          error_details?: Json | null
          error_message?: string | null
          id?: string
          messages_sent?: number | null
          metadata?: Json | null
          patient_id?: string | null
          rule_id?: string | null
          status: string
          trigger_event_data?: Json | null
          triggered_at?: string | null
        }
        Update: {
          actions_executed?: number | null
          appointment_id?: string | null
          created_at?: string | null
          duration_ms?: number | null
          error_details?: Json | null
          error_message?: string | null
          id?: string
          messages_sent?: number | null
          metadata?: Json | null
          patient_id?: string | null
          rule_id?: string | null
          status?: string
          trigger_event_data?: Json | null
          triggered_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "automation_executions_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "automation_executions_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patient_dashboard_view"
            referencedColumns: ["patient_id"]
          },
          {
            foreignKeyName: "automation_executions_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "automation_executions_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "task_cost_analytics"
            referencedColumns: ["patient_id"]
          },
          {
            foreignKeyName: "automation_executions_rule_id_fkey"
            columns: ["rule_id"]
            isOneToOne: false
            referencedRelation: "automation_rules"
            referencedColumns: ["id"]
          },
        ]
      }
      automation_rules: {
        Row: {
          actions: Json
          condition_operator: string | null
          conditions: Json | null
          created_at: string | null
          created_by: string | null
          description: string | null
          execution_count_today: number | null
          id: string
          is_active: boolean | null
          last_execution_date: string | null
          max_executions_per_day: number | null
          metadata: Json | null
          name: string
          priority: number | null
          trigger_config: Json
          trigger_type: Database["public"]["Enums"]["automation_trigger_type"]
          updated_at: string | null
        }
        Insert: {
          actions: Json
          condition_operator?: string | null
          conditions?: Json | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          execution_count_today?: number | null
          id?: string
          is_active?: boolean | null
          last_execution_date?: string | null
          max_executions_per_day?: number | null
          metadata?: Json | null
          name: string
          priority?: number | null
          trigger_config: Json
          trigger_type: Database["public"]["Enums"]["automation_trigger_type"]
          updated_at?: string | null
        }
        Update: {
          actions?: Json
          condition_operator?: string | null
          conditions?: Json | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          execution_count_today?: number | null
          id?: string
          is_active?: boolean | null
          last_execution_date?: string | null
          max_executions_per_day?: number | null
          metadata?: Json | null
          name?: string
          priority?: number | null
          trigger_config?: Json
          trigger_type?: Database["public"]["Enums"]["automation_trigger_type"]
          updated_at?: string | null
        }
        Relationships: []
      }
      body_map_assessments: {
        Row: {
          affected_areas: string[] | null
          assessment_date: string | null
          assessment_type: string | null
          auto_analysis: Json | null
          created_at: string | null
          id: string
          improvement_areas: string[] | null
          is_visible_to_patient: boolean | null
          new_pain_areas: string[] | null
          overall_rating: number | null
          pain_points: Json | null
          patient_id: string
          patient_notes: string | null
          session_id: string | null
          therapist_notes: string | null
          updated_at: string | null
          worsened_areas: string[] | null
        }
        Insert: {
          affected_areas?: string[] | null
          assessment_date?: string | null
          assessment_type?: string | null
          auto_analysis?: Json | null
          created_at?: string | null
          id?: string
          improvement_areas?: string[] | null
          is_visible_to_patient?: boolean | null
          new_pain_areas?: string[] | null
          overall_rating?: number | null
          pain_points?: Json | null
          patient_id: string
          patient_notes?: string | null
          session_id?: string | null
          therapist_notes?: string | null
          updated_at?: string | null
          worsened_areas?: string[] | null
        }
        Update: {
          affected_areas?: string[] | null
          assessment_date?: string | null
          assessment_type?: string | null
          auto_analysis?: Json | null
          created_at?: string | null
          id?: string
          improvement_areas?: string[] | null
          is_visible_to_patient?: boolean | null
          new_pain_areas?: string[] | null
          overall_rating?: number | null
          pain_points?: Json | null
          patient_id?: string
          patient_notes?: string | null
          session_id?: string | null
          therapist_notes?: string | null
          updated_at?: string | null
          worsened_areas?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "body_map_assessments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patient_dashboard_view"
            referencedColumns: ["patient_id"]
          },
          {
            foreignKeyName: "body_map_assessments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "body_map_assessments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "task_cost_analytics"
            referencedColumns: ["patient_id"]
          },
        ]
      }
      body_points: {
        Row: {
          body_region: Database["public"]["Enums"]["body_region"]
          body_side: Database["public"]["Enums"]["body_side"]
          coordinates: Json
          created_at: string
          created_by: string
          deleted_at: string | null
          deleted_by: string | null
          description: string
          id: string
          metadata: Json | null
          pain_level: number
          pain_type: Database["public"]["Enums"]["pain_type"]
          patient_id: string
          session_id: string | null
          symptoms: string[]
          updated_at: string
          version: number
        }
        Insert: {
          body_region: Database["public"]["Enums"]["body_region"]
          body_side: Database["public"]["Enums"]["body_side"]
          coordinates: Json
          created_at?: string
          created_by: string
          deleted_at?: string | null
          deleted_by?: string | null
          description: string
          id?: string
          metadata?: Json | null
          pain_level: number
          pain_type: Database["public"]["Enums"]["pain_type"]
          patient_id: string
          session_id?: string | null
          symptoms?: string[]
          updated_at?: string
          version?: number
        }
        Update: {
          body_region?: Database["public"]["Enums"]["body_region"]
          body_side?: Database["public"]["Enums"]["body_side"]
          coordinates?: Json
          created_at?: string
          created_by?: string
          deleted_at?: string | null
          deleted_by?: string | null
          description?: string
          id?: string
          metadata?: Json | null
          pain_level?: number
          pain_type?: Database["public"]["Enums"]["pain_type"]
          patient_id?: string
          session_id?: string | null
          symptoms?: string[]
          updated_at?: string
          version?: number
        }
        Relationships: []
      }
      calendar_integrations: {
        Row: {
          appointment_id: string
          attempts: number | null
          created_at: string | null
          error_message: string | null
          external_event_id: string | null
          id: string
          last_attempt_at: string | null
          metadata: Json | null
          patient_id: string
          provider: Database["public"]["Enums"]["calendar_provider"]
          status: Database["public"]["Enums"]["calendar_integration_status"]
          updated_at: string | null
        }
        Insert: {
          appointment_id: string
          attempts?: number | null
          created_at?: string | null
          error_message?: string | null
          external_event_id?: string | null
          id?: string
          last_attempt_at?: string | null
          metadata?: Json | null
          patient_id: string
          provider: Database["public"]["Enums"]["calendar_provider"]
          status?: Database["public"]["Enums"]["calendar_integration_status"]
          updated_at?: string | null
        }
        Update: {
          appointment_id?: string
          attempts?: number | null
          created_at?: string | null
          error_message?: string | null
          external_event_id?: string | null
          id?: string
          last_attempt_at?: string | null
          metadata?: Json | null
          patient_id?: string
          provider?: Database["public"]["Enums"]["calendar_provider"]
          status?: Database["public"]["Enums"]["calendar_integration_status"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "calendar_integrations_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calendar_integrations_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patient_dashboard_view"
            referencedColumns: ["patient_id"]
          },
          {
            foreignKeyName: "calendar_integrations_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calendar_integrations_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "task_cost_analytics"
            referencedColumns: ["patient_id"]
          },
        ]
      }
      calendar_metrics: {
        Row: {
          id: string
          metadata: Json | null
          metric_type: string
          metric_value: number
          provider: Database["public"]["Enums"]["calendar_provider"]
          recorded_at: string | null
        }
        Insert: {
          id?: string
          metadata?: Json | null
          metric_type: string
          metric_value: number
          provider: Database["public"]["Enums"]["calendar_provider"]
          recorded_at?: string | null
        }
        Update: {
          id?: string
          metadata?: Json | null
          metric_type?: string
          metric_value?: number
          provider?: Database["public"]["Enums"]["calendar_provider"]
          recorded_at?: string | null
        }
        Relationships: []
      }
      calendar_preferences: {
        Row: {
          auto_accept_invites: boolean | null
          created_at: string | null
          enable_reminders: boolean | null
          id: string
          language: string | null
          patient_id: string
          preferred_provider:
            | Database["public"]["Enums"]["calendar_provider"]
            | null
          reminder_times: number[] | null
          share_availability: boolean | null
          time_zone: string | null
          updated_at: string | null
        }
        Insert: {
          auto_accept_invites?: boolean | null
          created_at?: string | null
          enable_reminders?: boolean | null
          id?: string
          language?: string | null
          patient_id: string
          preferred_provider?:
            | Database["public"]["Enums"]["calendar_provider"]
            | null
          reminder_times?: number[] | null
          share_availability?: boolean | null
          time_zone?: string | null
          updated_at?: string | null
        }
        Update: {
          auto_accept_invites?: boolean | null
          created_at?: string | null
          enable_reminders?: boolean | null
          id?: string
          language?: string | null
          patient_id?: string
          preferred_provider?:
            | Database["public"]["Enums"]["calendar_provider"]
            | null
          reminder_times?: number[] | null
          share_availability?: boolean | null
          time_zone?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "calendar_preferences_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: true
            referencedRelation: "patient_dashboard_view"
            referencedColumns: ["patient_id"]
          },
          {
            foreignKeyName: "calendar_preferences_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: true
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calendar_preferences_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: true
            referencedRelation: "task_cost_analytics"
            referencedColumns: ["patient_id"]
          },
        ]
      }
      calendar_provider_configs: {
        Row: {
          config_data: Json
          created_at: string | null
          id: string
          is_active: boolean | null
          provider: Database["public"]["Enums"]["calendar_provider"]
          updated_at: string | null
        }
        Insert: {
          config_data: Json
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          provider: Database["public"]["Enums"]["calendar_provider"]
          updated_at?: string | null
        }
        Update: {
          config_data?: Json
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          provider?: Database["public"]["Enums"]["calendar_provider"]
          updated_at?: string | null
        }
        Relationships: []
      }
      calendar_queue_jobs: {
        Row: {
          appointment_id: string | null
          attempts: number | null
          completed_at: string | null
          created_at: string | null
          error_message: string | null
          id: string
          job_type: string
          max_attempts: number | null
          metadata: Json | null
          patient_email: string | null
          priority: number | null
          provider_preference:
            | Database["public"]["Enums"]["calendar_provider"]
            | null
          scheduled_for: string | null
          started_at: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          appointment_id?: string | null
          attempts?: number | null
          completed_at?: string | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          job_type: string
          max_attempts?: number | null
          metadata?: Json | null
          patient_email?: string | null
          priority?: number | null
          provider_preference?:
            | Database["public"]["Enums"]["calendar_provider"]
            | null
          scheduled_for?: string | null
          started_at?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          appointment_id?: string | null
          attempts?: number | null
          completed_at?: string | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          job_type?: string
          max_attempts?: number | null
          metadata?: Json | null
          patient_email?: string | null
          priority?: number | null
          provider_preference?:
            | Database["public"]["Enums"]["calendar_provider"]
            | null
          scheduled_for?: string | null
          started_at?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "calendar_queue_jobs_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
        ]
      }
      cash_flow_predictions: {
        Row: {
          actual_inflow: number | null
          actual_outflow: number | null
          clinic_id: string | null
          confidence_score: number | null
          created_at: string
          factors: Json | null
          id: string
          net_prediction: number | null
          predicted_inflow: number | null
          predicted_outflow: number | null
          prediction_date: string
          updated_at: string
        }
        Insert: {
          actual_inflow?: number | null
          actual_outflow?: number | null
          clinic_id?: string | null
          confidence_score?: number | null
          created_at?: string
          factors?: Json | null
          id?: string
          net_prediction?: number | null
          predicted_inflow?: number | null
          predicted_outflow?: number | null
          prediction_date: string
          updated_at?: string
        }
        Update: {
          actual_inflow?: number | null
          actual_outflow?: number | null
          clinic_id?: string | null
          confidence_score?: number | null
          created_at?: string
          factors?: Json | null
          id?: string
          net_prediction?: number | null
          predicted_inflow?: number | null
          predicted_outflow?: number | null
          prediction_date?: string
          updated_at?: string
        }
        Relationships: []
      }
      checkin_analytics_events: {
        Row: {
          created_at: string | null
          device_id: string | null
          duration_ms: number | null
          error_code: string | null
          error_message: string | null
          event_category: string
          event_data: Json | null
          event_type: string
          id: string
          ip_address: unknown | null
          patient_id: string | null
          session_id: string | null
          success: boolean | null
          user_agent: string | null
        }
        Insert: {
          created_at?: string | null
          device_id?: string | null
          duration_ms?: number | null
          error_code?: string | null
          error_message?: string | null
          event_category: string
          event_data?: Json | null
          event_type: string
          id?: string
          ip_address?: unknown | null
          patient_id?: string | null
          session_id?: string | null
          success?: boolean | null
          user_agent?: string | null
        }
        Update: {
          created_at?: string | null
          device_id?: string | null
          duration_ms?: number | null
          error_code?: string | null
          error_message?: string | null
          event_category?: string
          event_data?: Json | null
          event_type?: string
          id?: string
          ip_address?: unknown | null
          patient_id?: string | null
          session_id?: string | null
          success?: boolean | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "checkin_analytics_events_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patient_dashboard_view"
            referencedColumns: ["patient_id"]
          },
          {
            foreignKeyName: "checkin_analytics_events_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checkin_analytics_events_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "task_cost_analytics"
            referencedColumns: ["patient_id"]
          },
        ]
      }
      clinical_alerts: {
        Row: {
          alert_type: string
          assigned_to: string | null
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          metadata: Json | null
          patient_id: string | null
          recommendations: string | null
          resolved_at: string | null
          severity: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          alert_type: string
          assigned_to?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          metadata?: Json | null
          patient_id?: string | null
          recommendations?: string | null
          resolved_at?: string | null
          severity?: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          alert_type?: string
          assigned_to?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          metadata?: Json | null
          patient_id?: string | null
          recommendations?: string | null
          resolved_at?: string | null
          severity?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "clinical_alerts_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "task_cost_analytics"
            referencedColumns: ["therapist_id"]
          },
          {
            foreignKeyName: "clinical_alerts_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinical_alerts_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patient_dashboard_view"
            referencedColumns: ["patient_id"]
          },
          {
            foreignKeyName: "clinical_alerts_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinical_alerts_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "task_cost_analytics"
            referencedColumns: ["patient_id"]
          },
        ]
      }
      clinical_documents: {
        Row: {
          content: Json
          created_at: string | null
          created_by: string
          document_type: string
          id: string
          is_signed: boolean | null
          patient_id: string
          session_id: string | null
          signature_data: Json | null
          signed_at: string | null
          signed_by: string | null
          specialty: string
          status: string | null
          template_id: string | null
          updated_at: string | null
          updated_by: string | null
          version: number
        }
        Insert: {
          content: Json
          created_at?: string | null
          created_by: string
          document_type: string
          id?: string
          is_signed?: boolean | null
          patient_id: string
          session_id?: string | null
          signature_data?: Json | null
          signed_at?: string | null
          signed_by?: string | null
          specialty: string
          status?: string | null
          template_id?: string | null
          updated_at?: string | null
          updated_by?: string | null
          version?: number
        }
        Update: {
          content?: Json
          created_at?: string | null
          created_by?: string
          document_type?: string
          id?: string
          is_signed?: boolean | null
          patient_id?: string
          session_id?: string | null
          signature_data?: Json | null
          signed_at?: string | null
          signed_by?: string | null
          specialty?: string
          status?: string | null
          template_id?: string | null
          updated_at?: string | null
          updated_by?: string | null
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "clinical_documents_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "task_cost_analytics"
            referencedColumns: ["therapist_id"]
          },
          {
            foreignKeyName: "clinical_documents_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinical_documents_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patient_dashboard_view"
            referencedColumns: ["patient_id"]
          },
          {
            foreignKeyName: "clinical_documents_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinical_documents_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "task_cost_analytics"
            referencedColumns: ["patient_id"]
          },
          {
            foreignKeyName: "clinical_documents_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinical_documents_signed_by_fkey"
            columns: ["signed_by"]
            isOneToOne: false
            referencedRelation: "task_cost_analytics"
            referencedColumns: ["therapist_id"]
          },
          {
            foreignKeyName: "clinical_documents_signed_by_fkey"
            columns: ["signed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinical_documents_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "clinical_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinical_documents_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "task_cost_analytics"
            referencedColumns: ["therapist_id"]
          },
          {
            foreignKeyName: "clinical_documents_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      clinical_metrics: {
        Row: {
          benchmark_value: number | null
          clinic_id: string | null
          created_at: string
          id: string
          metadata: Json | null
          metric_name: string
          metric_type: string
          patient_count: number | null
          period_end: string
          period_start: string
          therapist_id: string | null
          treatment_type: string | null
          unit: string | null
          value: number
        }
        Insert: {
          benchmark_value?: number | null
          clinic_id?: string | null
          created_at?: string
          id?: string
          metadata?: Json | null
          metric_name: string
          metric_type: string
          patient_count?: number | null
          period_end: string
          period_start: string
          therapist_id?: string | null
          treatment_type?: string | null
          unit?: string | null
          value: number
        }
        Update: {
          benchmark_value?: number | null
          clinic_id?: string | null
          created_at?: string
          id?: string
          metadata?: Json | null
          metric_name?: string
          metric_type?: string
          patient_count?: number | null
          period_end?: string
          period_start?: string
          therapist_id?: string | null
          treatment_type?: string | null
          unit?: string | null
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "clinical_metrics_therapist_id_fkey"
            columns: ["therapist_id"]
            isOneToOne: false
            referencedRelation: "task_cost_analytics"
            referencedColumns: ["therapist_id"]
          },
          {
            foreignKeyName: "clinical_metrics_therapist_id_fkey"
            columns: ["therapist_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      clinical_templates: {
        Row: {
          active: boolean | null
          created_at: string | null
          created_by: string
          default_values: Json | null
          id: string
          name: string
          specialty: string
          template_schema: Json
          type: string
          validation_rules: Json | null
          version: number | null
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          created_by: string
          default_values?: Json | null
          id?: string
          name: string
          specialty: string
          template_schema: Json
          type: string
          validation_rules?: Json | null
          version?: number | null
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          created_by?: string
          default_values?: Json | null
          id?: string
          name?: string
          specialty?: string
          template_schema?: Json
          type?: string
          validation_rules?: Json | null
          version?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "clinical_templates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "task_cost_analytics"
            referencedColumns: ["therapist_id"]
          },
          {
            foreignKeyName: "clinical_templates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      communication_analytics: {
        Row: {
          average_delivery_time: number | null
          channel: Database["public"]["Enums"]["communication_channel"]
          click_through_rate: number | null
          conversion_rate: number | null
          cost_per_message: number | null
          created_at: string | null
          date: string
          delivery_rate: number | null
          id: string
          message_type: Database["public"]["Enums"]["message_type"] | null
          messages_delivered: number | null
          messages_failed: number | null
          messages_read: number | null
          messages_sent: number | null
          opt_out_rate: number | null
          read_rate: number | null
          total_cost: number | null
        }
        Insert: {
          average_delivery_time?: number | null
          channel: Database["public"]["Enums"]["communication_channel"]
          click_through_rate?: number | null
          conversion_rate?: number | null
          cost_per_message?: number | null
          created_at?: string | null
          date: string
          delivery_rate?: number | null
          id?: string
          message_type?: Database["public"]["Enums"]["message_type"] | null
          messages_delivered?: number | null
          messages_failed?: number | null
          messages_read?: number | null
          messages_sent?: number | null
          opt_out_rate?: number | null
          read_rate?: number | null
          total_cost?: number | null
        }
        Update: {
          average_delivery_time?: number | null
          channel?: Database["public"]["Enums"]["communication_channel"]
          click_through_rate?: number | null
          conversion_rate?: number | null
          cost_per_message?: number | null
          created_at?: string | null
          date?: string
          delivery_rate?: number | null
          id?: string
          message_type?: Database["public"]["Enums"]["message_type"] | null
          messages_delivered?: number | null
          messages_failed?: number | null
          messages_read?: number | null
          messages_sent?: number | null
          opt_out_rate?: number | null
          read_rate?: number | null
          total_cost?: number | null
        }
        Relationships: []
      }
      communication_opt_outs: {
        Row: {
          channel: Database["public"]["Enums"]["communication_channel"]
          id: string
          message_id: string | null
          metadata: Json | null
          opted_out_at: string | null
          patient_id: string | null
          reason: string | null
          recipient_id: string | null
        }
        Insert: {
          channel: Database["public"]["Enums"]["communication_channel"]
          id?: string
          message_id?: string | null
          metadata?: Json | null
          opted_out_at?: string | null
          patient_id?: string | null
          reason?: string | null
          recipient_id?: string | null
        }
        Update: {
          channel?: Database["public"]["Enums"]["communication_channel"]
          id?: string
          message_id?: string | null
          metadata?: Json | null
          opted_out_at?: string | null
          patient_id?: string | null
          reason?: string | null
          recipient_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "communication_opt_outs_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "communication_opt_outs_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patient_dashboard_view"
            referencedColumns: ["patient_id"]
          },
          {
            foreignKeyName: "communication_opt_outs_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "communication_opt_outs_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "task_cost_analytics"
            referencedColumns: ["patient_id"]
          },
          {
            foreignKeyName: "communication_opt_outs_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "communication_recipients"
            referencedColumns: ["id"]
          },
        ]
      }
      communication_preferences: {
        Row: {
          appointment_notifications: boolean | null
          birthday_messages: boolean | null
          created_at: string | null
          email_enabled: boolean | null
          id: string
          marketing_notifications: boolean | null
          max_messages_per_day: number | null
          max_messages_per_week: number | null
          metadata: Json | null
          patient_id: string | null
          payment_notifications: boolean | null
          preferred_days: number[] | null
          push_enabled: boolean | null
          quiet_hours_end: string | null
          quiet_hours_start: string | null
          reminder_notifications: boolean | null
          sms_enabled: boolean | null
          timezone: string | null
          updated_at: string | null
          whatsapp_enabled: boolean | null
        }
        Insert: {
          appointment_notifications?: boolean | null
          birthday_messages?: boolean | null
          created_at?: string | null
          email_enabled?: boolean | null
          id?: string
          marketing_notifications?: boolean | null
          max_messages_per_day?: number | null
          max_messages_per_week?: number | null
          metadata?: Json | null
          patient_id?: string | null
          payment_notifications?: boolean | null
          preferred_days?: number[] | null
          push_enabled?: boolean | null
          quiet_hours_end?: string | null
          quiet_hours_start?: string | null
          reminder_notifications?: boolean | null
          sms_enabled?: boolean | null
          timezone?: string | null
          updated_at?: string | null
          whatsapp_enabled?: boolean | null
        }
        Update: {
          appointment_notifications?: boolean | null
          birthday_messages?: boolean | null
          created_at?: string | null
          email_enabled?: boolean | null
          id?: string
          marketing_notifications?: boolean | null
          max_messages_per_day?: number | null
          max_messages_per_week?: number | null
          metadata?: Json | null
          patient_id?: string | null
          payment_notifications?: boolean | null
          preferred_days?: number[] | null
          push_enabled?: boolean | null
          quiet_hours_end?: string | null
          quiet_hours_start?: string | null
          reminder_notifications?: boolean | null
          sms_enabled?: boolean | null
          timezone?: string | null
          updated_at?: string | null
          whatsapp_enabled?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "communication_preferences_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: true
            referencedRelation: "patient_dashboard_view"
            referencedColumns: ["patient_id"]
          },
          {
            foreignKeyName: "communication_preferences_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: true
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "communication_preferences_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: true
            referencedRelation: "task_cost_analytics"
            referencedColumns: ["patient_id"]
          },
        ]
      }
      communication_recipients: {
        Row: {
          communication_preferences: Json | null
          created_at: string | null
          email: string | null
          id: string
          metadata: Json | null
          name: string
          opt_out_channels:
            | Database["public"]["Enums"]["communication_channel"][]
            | null
          patient_id: string | null
          phone: string | null
          preferred_channel:
            | Database["public"]["Enums"]["communication_channel"]
            | null
          preferred_locale: string | null
          push_token: string | null
          timezone: string | null
          updated_at: string | null
        }
        Insert: {
          communication_preferences?: Json | null
          created_at?: string | null
          email?: string | null
          id?: string
          metadata?: Json | null
          name: string
          opt_out_channels?:
            | Database["public"]["Enums"]["communication_channel"][]
            | null
          patient_id?: string | null
          phone?: string | null
          preferred_channel?:
            | Database["public"]["Enums"]["communication_channel"]
            | null
          preferred_locale?: string | null
          push_token?: string | null
          timezone?: string | null
          updated_at?: string | null
        }
        Update: {
          communication_preferences?: Json | null
          created_at?: string | null
          email?: string | null
          id?: string
          metadata?: Json | null
          name?: string
          opt_out_channels?:
            | Database["public"]["Enums"]["communication_channel"][]
            | null
          patient_id?: string | null
          phone?: string | null
          preferred_channel?:
            | Database["public"]["Enums"]["communication_channel"]
            | null
          preferred_locale?: string | null
          push_token?: string | null
          timezone?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "communication_recipients_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patient_dashboard_view"
            referencedColumns: ["patient_id"]
          },
          {
            foreignKeyName: "communication_recipients_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "communication_recipients_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "task_cost_analytics"
            referencedColumns: ["patient_id"]
          },
        ]
      }
      communication_webhooks: {
        Row: {
          channels:
            | Database["public"]["Enums"]["communication_channel"][]
            | null
          created_at: string | null
          events: string[]
          failed_deliveries: number | null
          headers: Json | null
          id: string
          is_active: boolean | null
          last_delivery_at: string | null
          metadata: Json | null
          name: string
          retry_attempts: number | null
          secret_token: string | null
          successful_deliveries: number | null
          timeout_ms: number | null
          total_deliveries: number | null
          updated_at: string | null
          url: string
          verify_ssl: boolean | null
        }
        Insert: {
          channels?:
            | Database["public"]["Enums"]["communication_channel"][]
            | null
          created_at?: string | null
          events: string[]
          failed_deliveries?: number | null
          headers?: Json | null
          id?: string
          is_active?: boolean | null
          last_delivery_at?: string | null
          metadata?: Json | null
          name: string
          retry_attempts?: number | null
          secret_token?: string | null
          successful_deliveries?: number | null
          timeout_ms?: number | null
          total_deliveries?: number | null
          updated_at?: string | null
          url: string
          verify_ssl?: boolean | null
        }
        Update: {
          channels?:
            | Database["public"]["Enums"]["communication_channel"][]
            | null
          created_at?: string | null
          events?: string[]
          failed_deliveries?: number | null
          headers?: Json | null
          id?: string
          is_active?: boolean | null
          last_delivery_at?: string | null
          metadata?: Json | null
          name?: string
          retry_attempts?: number | null
          secret_token?: string | null
          successful_deliveries?: number | null
          timeout_ms?: number | null
          total_deliveries?: number | null
          updated_at?: string | null
          url?: string
          verify_ssl?: boolean | null
        }
        Relationships: []
      }
      compliance_validations: {
        Row: {
          document_id: string
          id: string
          is_valid: boolean
          validated_at: string | null
          validated_by: string
          validation_type: string
          violations: Json | null
        }
        Insert: {
          document_id: string
          id?: string
          is_valid: boolean
          validated_at?: string | null
          validated_by: string
          validation_type: string
          violations?: Json | null
        }
        Update: {
          document_id?: string
          id?: string
          is_valid?: boolean
          validated_at?: string | null
          validated_by?: string
          validation_type?: string
          violations?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "compliance_validations_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "clinical_documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "compliance_validations_validated_by_fkey"
            columns: ["validated_by"]
            isOneToOne: false
            referencedRelation: "task_cost_analytics"
            referencedColumns: ["therapist_id"]
          },
          {
            foreignKeyName: "compliance_validations_validated_by_fkey"
            columns: ["validated_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      device_tokens: {
        Row: {
          app_version: string | null
          created_at: string | null
          device_model: string | null
          device_name: string | null
          id: string
          is_active: boolean | null
          last_used: string | null
          notification_preferences: Json | null
          notifications_enabled: boolean | null
          os_version: string | null
          patient_id: string
          platform: string
          registration_date: string | null
          token: string
          updated_at: string | null
        }
        Insert: {
          app_version?: string | null
          created_at?: string | null
          device_model?: string | null
          device_name?: string | null
          id?: string
          is_active?: boolean | null
          last_used?: string | null
          notification_preferences?: Json | null
          notifications_enabled?: boolean | null
          os_version?: string | null
          patient_id: string
          platform: string
          registration_date?: string | null
          token: string
          updated_at?: string | null
        }
        Update: {
          app_version?: string | null
          created_at?: string | null
          device_model?: string | null
          device_name?: string | null
          id?: string
          is_active?: boolean | null
          last_used?: string | null
          notification_preferences?: Json | null
          notifications_enabled?: boolean | null
          os_version?: string | null
          patient_id?: string
          platform?: string
          registration_date?: string | null
          token?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "device_tokens_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patient_dashboard_view"
            referencedColumns: ["patient_id"]
          },
          {
            foreignKeyName: "device_tokens_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "device_tokens_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "task_cost_analytics"
            referencedColumns: ["patient_id"]
          },
        ]
      }
      digital_certificates: {
        Row: {
          algorithm: string
          certificate_data: Json
          created_at: string | null
          created_by: string
          id: string
          is_active: boolean | null
          public_key: string
          user_id: string
          valid_from: string
          valid_until: string
        }
        Insert: {
          algorithm: string
          certificate_data: Json
          created_at?: string | null
          created_by: string
          id?: string
          is_active?: boolean | null
          public_key: string
          user_id: string
          valid_from: string
          valid_until: string
        }
        Update: {
          algorithm?: string
          certificate_data?: Json
          created_at?: string | null
          created_by?: string
          id?: string
          is_active?: boolean | null
          public_key?: string
          user_id?: string
          valid_from?: string
          valid_until?: string
        }
        Relationships: [
          {
            foreignKeyName: "digital_certificates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "task_cost_analytics"
            referencedColumns: ["therapist_id"]
          },
          {
            foreignKeyName: "digital_certificates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "digital_certificates_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "task_cost_analytics"
            referencedColumns: ["therapist_id"]
          },
          {
            foreignKeyName: "digital_certificates_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      digital_signatures: {
        Row: {
          certificate_id: string
          created_at: string | null
          document_id: string
          id: string
          signature_data: Json
          signed_at: string
          signed_by: string
          verification_status: string | null
        }
        Insert: {
          certificate_id: string
          created_at?: string | null
          document_id: string
          id?: string
          signature_data: Json
          signed_at: string
          signed_by: string
          verification_status?: string | null
        }
        Update: {
          certificate_id?: string
          created_at?: string | null
          document_id?: string
          id?: string
          signature_data?: Json
          signed_at?: string
          signed_by?: string
          verification_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "digital_signatures_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "clinical_documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "digital_signatures_signed_by_fkey"
            columns: ["signed_by"]
            isOneToOne: false
            referencedRelation: "task_cost_analytics"
            referencedColumns: ["therapist_id"]
          },
          {
            foreignKeyName: "digital_signatures_signed_by_fkey"
            columns: ["signed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      document_archives: {
        Row: {
          archive_location: string
          archived_at: string | null
          archived_by: string
          checksum: string
          document_id: string
          encryption_key: string
          expires_at: string
          id: string
          retention_policy: Json
        }
        Insert: {
          archive_location: string
          archived_at?: string | null
          archived_by: string
          checksum: string
          document_id: string
          encryption_key: string
          expires_at: string
          id?: string
          retention_policy: Json
        }
        Update: {
          archive_location?: string
          archived_at?: string | null
          archived_by?: string
          checksum?: string
          document_id?: string
          encryption_key?: string
          expires_at?: string
          id?: string
          retention_policy?: Json
        }
        Relationships: [
          {
            foreignKeyName: "document_archives_archived_by_fkey"
            columns: ["archived_by"]
            isOneToOne: false
            referencedRelation: "task_cost_analytics"
            referencedColumns: ["therapist_id"]
          },
          {
            foreignKeyName: "document_archives_archived_by_fkey"
            columns: ["archived_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_archives_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "clinical_documents"
            referencedColumns: ["id"]
          },
        ]
      }
      exercise_completions: {
        Row: {
          auto_generated_feedback: boolean | null
          completed_at: string | null
          completion_date: string | null
          created_at: string | null
          device_type: string | null
          difficulty_rating: number | null
          duration_seconds: number | null
          effort_level: number | null
          exercise_id: string
          form_rating: number | null
          id: string
          metadata: Json | null
          pain_level_after: number | null
          pain_level_before: number | null
          patient_id: string
          patient_notes: string | null
          reps_completed: number | null
          sets_completed: number | null
          tracking_method: string | null
          updated_at: string | null
        }
        Insert: {
          auto_generated_feedback?: boolean | null
          completed_at?: string | null
          completion_date?: string | null
          created_at?: string | null
          device_type?: string | null
          difficulty_rating?: number | null
          duration_seconds?: number | null
          effort_level?: number | null
          exercise_id: string
          form_rating?: number | null
          id?: string
          metadata?: Json | null
          pain_level_after?: number | null
          pain_level_before?: number | null
          patient_id: string
          patient_notes?: string | null
          reps_completed?: number | null
          sets_completed?: number | null
          tracking_method?: string | null
          updated_at?: string | null
        }
        Update: {
          auto_generated_feedback?: boolean | null
          completed_at?: string | null
          completion_date?: string | null
          created_at?: string | null
          device_type?: string | null
          difficulty_rating?: number | null
          duration_seconds?: number | null
          effort_level?: number | null
          exercise_id?: string
          form_rating?: number | null
          id?: string
          metadata?: Json | null
          pain_level_after?: number | null
          pain_level_before?: number | null
          patient_id?: string
          patient_notes?: string | null
          reps_completed?: number | null
          sets_completed?: number | null
          tracking_method?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "exercise_completions_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patient_dashboard_view"
            referencedColumns: ["patient_id"]
          },
          {
            foreignKeyName: "exercise_completions_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exercise_completions_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "task_cost_analytics"
            referencedColumns: ["patient_id"]
          },
        ]
      }
      exercise_protocols: {
        Row: {
          category: string
          created_at: string
          created_by: string | null
          description: string
          duration_weeks: number
          frequency_per_week: number
          id: string
          is_active: boolean
          name: string
          pathology: string
          phase: string
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          created_by?: string | null
          description: string
          duration_weeks: number
          frequency_per_week: number
          id?: string
          is_active?: boolean
          name: string
          pathology: string
          phase: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          created_by?: string | null
          description?: string
          duration_weeks?: number
          frequency_per_week?: number
          id?: string
          is_active?: boolean
          name?: string
          pathology?: string
          phase?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "exercise_protocols_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "task_cost_analytics"
            referencedColumns: ["therapist_id"]
          },
          {
            foreignKeyName: "exercise_protocols_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      exercises: {
        Row: {
          benefits: string[] | null
          category: string
          contraindications: string[] | null
          created_at: string | null
          created_by: string | null
          description: string | null
          difficulty_level: string | null
          duration_minutes: number | null
          equipment: string[] | null
          id: string
          image_urls: string[] | null
          instructions: string[] | null
          is_active: boolean | null
          muscle_groups: string[] | null
          name: string
          precautions: string[] | null
          repetitions: number | null
          sets: number | null
          tags: string[] | null
          updated_at: string | null
          video_url: string | null
        }
        Insert: {
          benefits?: string[] | null
          category: string
          contraindications?: string[] | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          difficulty_level?: string | null
          duration_minutes?: number | null
          equipment?: string[] | null
          id?: string
          image_urls?: string[] | null
          instructions?: string[] | null
          is_active?: boolean | null
          muscle_groups?: string[] | null
          name: string
          precautions?: string[] | null
          repetitions?: number | null
          sets?: number | null
          tags?: string[] | null
          updated_at?: string | null
          video_url?: string | null
        }
        Update: {
          benefits?: string[] | null
          category?: string
          contraindications?: string[] | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          difficulty_level?: string | null
          duration_minutes?: number | null
          equipment?: string[] | null
          id?: string
          image_urls?: string[] | null
          instructions?: string[] | null
          is_active?: boolean | null
          muscle_groups?: string[] | null
          name?: string
          precautions?: string[] | null
          repetitions?: number | null
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
            referencedRelation: "task_cost_analytics"
            referencedColumns: ["therapist_id"]
          },
          {
            foreignKeyName: "exercises_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      face_encodings: {
        Row: {
          checksum: string
          created_at: string | null
          encoding_data: string
          encryption_key_id: string
          enrolled_by: string | null
          enrollment_date: string | null
          enrollment_device: string | null
          last_used: string | null
          patient_id: string
          quality_score: number
          recognition_success_count: number | null
          salt: string
          updated_at: string | null
          usage_count: number | null
        }
        Insert: {
          checksum: string
          created_at?: string | null
          encoding_data: string
          encryption_key_id: string
          enrolled_by?: string | null
          enrollment_date?: string | null
          enrollment_device?: string | null
          last_used?: string | null
          patient_id: string
          quality_score: number
          recognition_success_count?: number | null
          salt: string
          updated_at?: string | null
          usage_count?: number | null
        }
        Update: {
          checksum?: string
          created_at?: string | null
          encoding_data?: string
          encryption_key_id?: string
          enrolled_by?: string | null
          enrollment_date?: string | null
          enrollment_device?: string | null
          last_used?: string | null
          patient_id?: string
          quality_score?: number
          recognition_success_count?: number | null
          salt?: string
          updated_at?: string | null
          usage_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "face_encodings_enrolled_by_fkey"
            columns: ["enrolled_by"]
            isOneToOne: false
            referencedRelation: "task_cost_analytics"
            referencedColumns: ["therapist_id"]
          },
          {
            foreignKeyName: "face_encodings_enrolled_by_fkey"
            columns: ["enrolled_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "face_encodings_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: true
            referencedRelation: "patient_dashboard_view"
            referencedColumns: ["patient_id"]
          },
          {
            foreignKeyName: "face_encodings_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: true
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "face_encodings_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: true
            referencedRelation: "task_cost_analytics"
            referencedColumns: ["patient_id"]
          },
        ]
      }
      financial_alerts: {
        Row: {
          alert_type: string
          amount: number | null
          appointment_id: string | null
          clinic_id: string | null
          created_at: string
          current_value: number | null
          description: string | null
          id: string
          metadata: Json | null
          patient_id: string | null
          resolved_at: string | null
          severity: string
          status: string
          threshold_value: number | null
          title: string
          updated_at: string
        }
        Insert: {
          alert_type: string
          amount?: number | null
          appointment_id?: string | null
          clinic_id?: string | null
          created_at?: string
          current_value?: number | null
          description?: string | null
          id?: string
          metadata?: Json | null
          patient_id?: string | null
          resolved_at?: string | null
          severity?: string
          status?: string
          threshold_value?: number | null
          title: string
          updated_at?: string
        }
        Update: {
          alert_type?: string
          amount?: number | null
          appointment_id?: string | null
          clinic_id?: string | null
          created_at?: string
          current_value?: number | null
          description?: string | null
          id?: string
          metadata?: Json | null
          patient_id?: string | null
          resolved_at?: string | null
          severity?: string
          status?: string
          threshold_value?: number | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "financial_alerts_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financial_alerts_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patient_dashboard_view"
            referencedColumns: ["patient_id"]
          },
          {
            foreignKeyName: "financial_alerts_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financial_alerts_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "task_cost_analytics"
            referencedColumns: ["patient_id"]
          },
        ]
      }
      financial_goals: {
        Row: {
          achieved_at: string | null
          clinic_id: string | null
          created_at: string
          created_by: string | null
          current_value: number | null
          description: string | null
          goal_type: string
          id: string
          metadata: Json | null
          period: string
          status: string
          target_date: string
          target_value: number
          title: string
          updated_at: string
        }
        Insert: {
          achieved_at?: string | null
          clinic_id?: string | null
          created_at?: string
          created_by?: string | null
          current_value?: number | null
          description?: string | null
          goal_type: string
          id?: string
          metadata?: Json | null
          period: string
          status?: string
          target_date: string
          target_value: number
          title: string
          updated_at?: string
        }
        Update: {
          achieved_at?: string | null
          clinic_id?: string | null
          created_at?: string
          created_by?: string | null
          current_value?: number | null
          description?: string | null
          goal_type?: string
          id?: string
          metadata?: Json | null
          period?: string
          status?: string
          target_date?: string
          target_value?: number
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "financial_goals_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "task_cost_analytics"
            referencedColumns: ["therapist_id"]
          },
          {
            foreignKeyName: "financial_goals_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      financial_transactions: {
        Row: {
          amount: number
          category: string
          clinic_id: string | null
          created_at: string | null
          currency: string
          description: string | null
          id: string
          metadata: Json | null
          reference_id: string | null
          reference_type: string | null
          type: string
          updated_at: string | null
        }
        Insert: {
          amount: number
          category: string
          clinic_id?: string | null
          created_at?: string | null
          currency?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          reference_id?: string | null
          reference_type?: string | null
          type: string
          updated_at?: string | null
        }
        Update: {
          amount?: number
          category?: string
          clinic_id?: string | null
          created_at?: string | null
          currency?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          reference_id?: string | null
          reference_type?: string | null
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      initial_assessments: {
        Row: {
          allergies: Json | null
          chief_complaint: string
          created_at: string | null
          created_by: string
          document_id: string
          functional_tests: Json | null
          id: string
          inspection_findings: string | null
          medical_history: Json
          medications: Json | null
          muscle_strength: Json | null
          neurological_exam: Json | null
          pain_characteristics: Json | null
          pain_onset: string | null
          palpation_findings: string | null
          patient_id: string
          physiotherapy_diagnosis: string
          prognosis: string | null
          range_of_motion: Json | null
          special_tests: Json | null
          surgical_history: Json | null
          treatment_goals: Json
          treatment_plan: string
          vital_signs: Json | null
        }
        Insert: {
          allergies?: Json | null
          chief_complaint: string
          created_at?: string | null
          created_by: string
          document_id: string
          functional_tests?: Json | null
          id?: string
          inspection_findings?: string | null
          medical_history?: Json
          medications?: Json | null
          muscle_strength?: Json | null
          neurological_exam?: Json | null
          pain_characteristics?: Json | null
          pain_onset?: string | null
          palpation_findings?: string | null
          patient_id: string
          physiotherapy_diagnosis: string
          prognosis?: string | null
          range_of_motion?: Json | null
          special_tests?: Json | null
          surgical_history?: Json | null
          treatment_goals?: Json
          treatment_plan: string
          vital_signs?: Json | null
        }
        Update: {
          allergies?: Json | null
          chief_complaint?: string
          created_at?: string | null
          created_by?: string
          document_id?: string
          functional_tests?: Json | null
          id?: string
          inspection_findings?: string | null
          medical_history?: Json
          medications?: Json | null
          muscle_strength?: Json | null
          neurological_exam?: Json | null
          pain_characteristics?: Json | null
          pain_onset?: string | null
          palpation_findings?: string | null
          patient_id?: string
          physiotherapy_diagnosis?: string
          prognosis?: string | null
          range_of_motion?: Json | null
          special_tests?: Json | null
          surgical_history?: Json | null
          treatment_goals?: Json
          treatment_plan?: string
          vital_signs?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "initial_assessments_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "task_cost_analytics"
            referencedColumns: ["therapist_id"]
          },
          {
            foreignKeyName: "initial_assessments_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "initial_assessments_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "clinical_documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "initial_assessments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patient_dashboard_view"
            referencedColumns: ["patient_id"]
          },
          {
            foreignKeyName: "initial_assessments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "initial_assessments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "task_cost_analytics"
            referencedColumns: ["patient_id"]
          },
        ]
      }
      message_delivery_attempts: {
        Row: {
          attempt_number: number
          attempted_at: string | null
          channel: Database["public"]["Enums"]["communication_channel"]
          cost: number | null
          created_at: string | null
          duration_ms: number | null
          error_code: string | null
          error_message: string | null
          external_id: string | null
          id: string
          message_id: string | null
          metadata: Json | null
          response_message: string | null
          retryable: boolean | null
          status_code: string | null
          success: boolean
        }
        Insert: {
          attempt_number: number
          attempted_at?: string | null
          channel: Database["public"]["Enums"]["communication_channel"]
          cost?: number | null
          created_at?: string | null
          duration_ms?: number | null
          error_code?: string | null
          error_message?: string | null
          external_id?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          response_message?: string | null
          retryable?: boolean | null
          status_code?: string | null
          success: boolean
        }
        Update: {
          attempt_number?: number
          attempted_at?: string | null
          channel?: Database["public"]["Enums"]["communication_channel"]
          cost?: number | null
          created_at?: string | null
          duration_ms?: number | null
          error_code?: string | null
          error_message?: string | null
          external_id?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          response_message?: string | null
          retryable?: boolean | null
          status_code?: string | null
          success?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "message_delivery_attempts_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      message_queue_jobs: {
        Row: {
          completed_at: string | null
          created_at: string | null
          error_message: string | null
          failed_at: string | null
          id: string
          job_id: string
          max_retries: number | null
          message_id: string | null
          metadata: Json | null
          priority: number | null
          progress: number | null
          queue_name: string
          result: Json | null
          retry_count: number | null
          scheduled_for: string | null
          started_at: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          error_message?: string | null
          failed_at?: string | null
          id?: string
          job_id: string
          max_retries?: number | null
          message_id?: string | null
          metadata?: Json | null
          priority?: number | null
          progress?: number | null
          queue_name: string
          result?: Json | null
          retry_count?: number | null
          scheduled_for?: string | null
          started_at?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          error_message?: string | null
          failed_at?: string | null
          id?: string
          job_id?: string
          max_retries?: number | null
          message_id?: string | null
          metadata?: Json | null
          priority?: number | null
          progress?: number | null
          queue_name?: string
          result?: Json | null
          retry_count?: number | null
          scheduled_for?: string | null
          started_at?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "message_queue_jobs_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      message_templates: {
        Row: {
          body: string
          category: Database["public"]["Enums"]["template_category"] | null
          created_at: string | null
          created_by: string | null
          email: string | null
          html: string | null
          id: string
          is_active: boolean | null
          locale: string | null
          metadata: Json | null
          name: string
          push: string | null
          sms: string | null
          subject: string | null
          type: Database["public"]["Enums"]["message_type"]
          updated_at: string | null
          variables: string[] | null
          version: number | null
          whatsapp: string | null
        }
        Insert: {
          body: string
          category?: Database["public"]["Enums"]["template_category"] | null
          created_at?: string | null
          created_by?: string | null
          email?: string | null
          html?: string | null
          id: string
          is_active?: boolean | null
          locale?: string | null
          metadata?: Json | null
          name: string
          push?: string | null
          sms?: string | null
          subject?: string | null
          type: Database["public"]["Enums"]["message_type"]
          updated_at?: string | null
          variables?: string[] | null
          version?: number | null
          whatsapp?: string | null
        }
        Update: {
          body?: string
          category?: Database["public"]["Enums"]["template_category"] | null
          created_at?: string | null
          created_by?: string | null
          email?: string | null
          html?: string | null
          id?: string
          is_active?: boolean | null
          locale?: string | null
          metadata?: Json | null
          name?: string
          push?: string | null
          sms?: string | null
          subject?: string | null
          type?: Database["public"]["Enums"]["message_type"]
          updated_at?: string | null
          variables?: string[] | null
          version?: number | null
          whatsapp?: string | null
        }
        Relationships: []
      }
      messages: {
        Row: {
          automation_rule_id: string | null
          body: string
          campaign_id: string | null
          channel: Database["public"]["Enums"]["communication_channel"]
          cost: number | null
          created_at: string | null
          delivered_at: string | null
          delivery_attempts: number | null
          error_code: string | null
          error_message: string | null
          external_message_id: string | null
          failed_at: string | null
          html_content: string | null
          id: string
          last_attempt_at: string | null
          metadata: Json | null
          patient_id: string | null
          priority: number | null
          read_at: string | null
          recipient_id: string | null
          scheduled_for: string | null
          sent_at: string | null
          status: Database["public"]["Enums"]["message_status"] | null
          subject: string | null
          template_id: string | null
          type: Database["public"]["Enums"]["message_type"]
          updated_at: string | null
        }
        Insert: {
          automation_rule_id?: string | null
          body: string
          campaign_id?: string | null
          channel: Database["public"]["Enums"]["communication_channel"]
          cost?: number | null
          created_at?: string | null
          delivered_at?: string | null
          delivery_attempts?: number | null
          error_code?: string | null
          error_message?: string | null
          external_message_id?: string | null
          failed_at?: string | null
          html_content?: string | null
          id?: string
          last_attempt_at?: string | null
          metadata?: Json | null
          patient_id?: string | null
          priority?: number | null
          read_at?: string | null
          recipient_id?: string | null
          scheduled_for?: string | null
          sent_at?: string | null
          status?: Database["public"]["Enums"]["message_status"] | null
          subject?: string | null
          template_id?: string | null
          type: Database["public"]["Enums"]["message_type"]
          updated_at?: string | null
        }
        Update: {
          automation_rule_id?: string | null
          body?: string
          campaign_id?: string | null
          channel?: Database["public"]["Enums"]["communication_channel"]
          cost?: number | null
          created_at?: string | null
          delivered_at?: string | null
          delivery_attempts?: number | null
          error_code?: string | null
          error_message?: string | null
          external_message_id?: string | null
          failed_at?: string | null
          html_content?: string | null
          id?: string
          last_attempt_at?: string | null
          metadata?: Json | null
          patient_id?: string | null
          priority?: number | null
          read_at?: string | null
          recipient_id?: string | null
          scheduled_for?: string | null
          sent_at?: string | null
          status?: Database["public"]["Enums"]["message_status"] | null
          subject?: string | null
          template_id?: string | null
          type?: Database["public"]["Enums"]["message_type"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patient_dashboard_view"
            referencedColumns: ["patient_id"]
          },
          {
            foreignKeyName: "messages_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "task_cost_analytics"
            referencedColumns: ["patient_id"]
          },
          {
            foreignKeyName: "messages_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "communication_recipients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "message_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_history: {
        Row: {
          body: string
          clicked: boolean | null
          clicked_time: string | null
          created_at: string | null
          data: Json | null
          delivered_time: string | null
          device_tokens: string[] | null
          error_message: string | null
          id: string
          opened: boolean | null
          opened_time: string | null
          patient_id: string
          platforms: string[] | null
          retry_count: number | null
          scheduled_time: string | null
          sent_time: string | null
          status: string | null
          title: string
          type: string
          updated_at: string | null
        }
        Insert: {
          body: string
          clicked?: boolean | null
          clicked_time?: string | null
          created_at?: string | null
          data?: Json | null
          delivered_time?: string | null
          device_tokens?: string[] | null
          error_message?: string | null
          id?: string
          opened?: boolean | null
          opened_time?: string | null
          patient_id: string
          platforms?: string[] | null
          retry_count?: number | null
          scheduled_time?: string | null
          sent_time?: string | null
          status?: string | null
          title: string
          type: string
          updated_at?: string | null
        }
        Update: {
          body?: string
          clicked?: boolean | null
          clicked_time?: string | null
          created_at?: string | null
          data?: Json | null
          delivered_time?: string | null
          device_tokens?: string[] | null
          error_message?: string | null
          id?: string
          opened?: boolean | null
          opened_time?: string | null
          patient_id?: string
          platforms?: string[] | null
          retry_count?: number | null
          scheduled_time?: string | null
          sent_time?: string | null
          status?: string | null
          title?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notification_history_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patient_dashboard_view"
            referencedColumns: ["patient_id"]
          },
          {
            foreignKeyName: "notification_history_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notification_history_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "task_cost_analytics"
            referencedColumns: ["patient_id"]
          },
        ]
      }
      notifications: {
        Row: {
          channel: string | null
          created_at: string | null
          expires_at: string | null
          id: string
          is_read: boolean | null
          is_sent: boolean | null
          message: string
          metadata: Json | null
          priority: string | null
          read_at: string | null
          related_entity_id: string | null
          related_entity_type: string | null
          sent_at: string | null
          title: string
          type: string
          user_id: string | null
        }
        Insert: {
          channel?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_read?: boolean | null
          is_sent?: boolean | null
          message: string
          metadata?: Json | null
          priority?: string | null
          read_at?: string | null
          related_entity_id?: string | null
          related_entity_type?: string | null
          sent_at?: string | null
          title: string
          type: string
          user_id?: string | null
        }
        Update: {
          channel?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_read?: boolean | null
          is_sent?: boolean | null
          message?: string
          metadata?: Json | null
          priority?: string | null
          read_at?: string | null
          related_entity_id?: string | null
          related_entity_type?: string | null
          sent_at?: string | null
          title?: string
          type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "task_cost_analytics"
            referencedColumns: ["therapist_id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      patient_checkins: {
        Row: {
          actual_wait_time: number | null
          appointment_id: string
          checkin_time: string | null
          created_at: string | null
          device_id: string
          estimated_wait_time: number | null
          face_encoding_used: boolean | null
          health_answers: Json | null
          health_risk_factors: string[] | null
          health_screening_passed: boolean | null
          id: string
          ip_address: unknown | null
          metadata: Json | null
          method: string
          patient_id: string
          photo_url: string | null
          queue_position: number | null
          recognition_confidence: number | null
          session_id: string | null
          status: string | null
          temperature: number | null
          updated_at: string | null
          user_agent: string | null
        }
        Insert: {
          actual_wait_time?: number | null
          appointment_id: string
          checkin_time?: string | null
          created_at?: string | null
          device_id: string
          estimated_wait_time?: number | null
          face_encoding_used?: boolean | null
          health_answers?: Json | null
          health_risk_factors?: string[] | null
          health_screening_passed?: boolean | null
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          method: string
          patient_id: string
          photo_url?: string | null
          queue_position?: number | null
          recognition_confidence?: number | null
          session_id?: string | null
          status?: string | null
          temperature?: number | null
          updated_at?: string | null
          user_agent?: string | null
        }
        Update: {
          actual_wait_time?: number | null
          appointment_id?: string
          checkin_time?: string | null
          created_at?: string | null
          device_id?: string
          estimated_wait_time?: number | null
          face_encoding_used?: boolean | null
          health_answers?: Json | null
          health_risk_factors?: string[] | null
          health_screening_passed?: boolean | null
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          method?: string
          patient_id?: string
          photo_url?: string | null
          queue_position?: number | null
          recognition_confidence?: number | null
          session_id?: string | null
          status?: string | null
          temperature?: number | null
          updated_at?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "patient_checkins_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_checkins_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patient_dashboard_view"
            referencedColumns: ["patient_id"]
          },
          {
            foreignKeyName: "patient_checkins_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_checkins_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "task_cost_analytics"
            referencedColumns: ["patient_id"]
          },
        ]
      }
      patient_exercise_executions: {
        Row: {
          completed: boolean
          created_at: string
          difficulty_rating: number | null
          duration_seconds_completed: number | null
          execution_date: string
          id: string
          notes: string | null
          pain_level_after: number | null
          pain_level_before: number | null
          patient_id: string
          perceived_exertion: number | null
          prescription_id: string
          repetitions_completed: number
          sets_completed: number
        }
        Insert: {
          completed?: boolean
          created_at?: string
          difficulty_rating?: number | null
          duration_seconds_completed?: number | null
          execution_date: string
          id?: string
          notes?: string | null
          pain_level_after?: number | null
          pain_level_before?: number | null
          patient_id: string
          perceived_exertion?: number | null
          prescription_id: string
          repetitions_completed?: number
          sets_completed?: number
        }
        Update: {
          completed?: boolean
          created_at?: string
          difficulty_rating?: number | null
          duration_seconds_completed?: number | null
          execution_date?: string
          id?: string
          notes?: string | null
          pain_level_after?: number | null
          pain_level_before?: number | null
          patient_id?: string
          perceived_exertion?: number | null
          prescription_id?: string
          repetitions_completed?: number
          sets_completed?: number
        }
        Relationships: [
          {
            foreignKeyName: "patient_exercise_executions_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patient_dashboard_view"
            referencedColumns: ["patient_id"]
          },
          {
            foreignKeyName: "patient_exercise_executions_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_exercise_executions_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "task_cost_analytics"
            referencedColumns: ["patient_id"]
          },
          {
            foreignKeyName: "patient_exercise_executions_prescription_id_fkey"
            columns: ["prescription_id"]
            isOneToOne: false
            referencedRelation: "patient_exercise_prescriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      patient_exercise_prescriptions: {
        Row: {
          created_at: string
          duration_seconds: number | null
          end_date: string | null
          exercise_id: string | null
          frequency_per_week: number
          id: string
          notes: string | null
          patient_id: string
          prescription_type: string
          protocol_id: string | null
          repetitions: number
          rest_seconds: number | null
          sets: number
          special_instructions: string | null
          start_date: string
          status: string
          therapist_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          duration_seconds?: number | null
          end_date?: string | null
          exercise_id?: string | null
          frequency_per_week: number
          id?: string
          notes?: string | null
          patient_id: string
          prescription_type?: string
          protocol_id?: string | null
          repetitions: number
          rest_seconds?: number | null
          sets: number
          special_instructions?: string | null
          start_date: string
          status?: string
          therapist_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          duration_seconds?: number | null
          end_date?: string | null
          exercise_id?: string | null
          frequency_per_week?: number
          id?: string
          notes?: string | null
          patient_id?: string
          prescription_type?: string
          protocol_id?: string | null
          repetitions?: number
          rest_seconds?: number | null
          sets?: number
          special_instructions?: string | null
          start_date?: string
          status?: string
          therapist_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "patient_exercise_prescriptions_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_exercise_prescriptions_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patient_dashboard_view"
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
            foreignKeyName: "patient_exercise_prescriptions_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "task_cost_analytics"
            referencedColumns: ["patient_id"]
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
            referencedRelation: "task_cost_analytics"
            referencedColumns: ["therapist_id"]
          },
          {
            foreignKeyName: "patient_exercise_prescriptions_therapist_id_fkey"
            columns: ["therapist_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      patient_insights: {
        Row: {
          confidence_score: number | null
          created_at: string
          description: string | null
          expires_at: string | null
          id: string
          insight_type: string
          metadata: Json | null
          patient_id: string
          priority: string
          recommendations: Json | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          confidence_score?: number | null
          created_at?: string
          description?: string | null
          expires_at?: string | null
          id?: string
          insight_type: string
          metadata?: Json | null
          patient_id: string
          priority?: string
          recommendations?: Json | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          confidence_score?: number | null
          created_at?: string
          description?: string | null
          expires_at?: string | null
          id?: string
          insight_type?: string
          metadata?: Json | null
          patient_id?: string
          priority?: string
          recommendations?: Json | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "patient_insights_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patient_dashboard_view"
            referencedColumns: ["patient_id"]
          },
          {
            foreignKeyName: "patient_insights_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_insights_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "task_cost_analytics"
            referencedColumns: ["patient_id"]
          },
        ]
      }
      patient_messages: {
        Row: {
          action_buttons: Json | null
          attachments: Json | null
          content: string
          created_at: string | null
          deep_link: string | null
          expires_at: string | null
          id: string
          is_read: boolean | null
          message_type: string
          notification_sent: boolean | null
          notification_sent_time: string | null
          parent_message_id: string | null
          patient_id: string
          priority: string | null
          read_time: string | null
          sender_id: string | null
          sender_name: string
          sender_type: string
          subject: string
          thread_id: string | null
          updated_at: string | null
        }
        Insert: {
          action_buttons?: Json | null
          attachments?: Json | null
          content: string
          created_at?: string | null
          deep_link?: string | null
          expires_at?: string | null
          id?: string
          is_read?: boolean | null
          message_type: string
          notification_sent?: boolean | null
          notification_sent_time?: string | null
          parent_message_id?: string | null
          patient_id: string
          priority?: string | null
          read_time?: string | null
          sender_id?: string | null
          sender_name: string
          sender_type: string
          subject: string
          thread_id?: string | null
          updated_at?: string | null
        }
        Update: {
          action_buttons?: Json | null
          attachments?: Json | null
          content?: string
          created_at?: string | null
          deep_link?: string | null
          expires_at?: string | null
          id?: string
          is_read?: boolean | null
          message_type?: string
          notification_sent?: boolean | null
          notification_sent_time?: string | null
          parent_message_id?: string | null
          patient_id?: string
          priority?: string | null
          read_time?: string | null
          sender_id?: string | null
          sender_name?: string
          sender_type?: string
          subject?: string
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
            foreignKeyName: "patient_messages_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patient_dashboard_view"
            referencedColumns: ["patient_id"]
          },
          {
            foreignKeyName: "patient_messages_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_messages_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "task_cost_analytics"
            referencedColumns: ["patient_id"]
          },
        ]
      }
      patient_portal_sessions: {
        Row: {
          created_at: string | null
          device_fingerprint: string | null
          device_info: Json | null
          expires_at: string
          failed_attempts: number | null
          id: string
          ip_address: unknown | null
          is_active: boolean | null
          last_activity: string | null
          locked_until: string | null
          login_method: string
          logout_reason: string | null
          logout_time: string | null
          patient_id: string
          refresh_token: string | null
          session_token: string
          two_factor_verified: boolean | null
          user_agent: string | null
        }
        Insert: {
          created_at?: string | null
          device_fingerprint?: string | null
          device_info?: Json | null
          expires_at: string
          failed_attempts?: number | null
          id?: string
          ip_address?: unknown | null
          is_active?: boolean | null
          last_activity?: string | null
          locked_until?: string | null
          login_method: string
          logout_reason?: string | null
          logout_time?: string | null
          patient_id: string
          refresh_token?: string | null
          session_token: string
          two_factor_verified?: boolean | null
          user_agent?: string | null
        }
        Update: {
          created_at?: string | null
          device_fingerprint?: string | null
          device_info?: Json | null
          expires_at?: string
          failed_attempts?: number | null
          id?: string
          ip_address?: unknown | null
          is_active?: boolean | null
          last_activity?: string | null
          locked_until?: string | null
          login_method?: string
          logout_reason?: string | null
          logout_time?: string | null
          patient_id?: string
          refresh_token?: string | null
          session_token?: string
          two_factor_verified?: boolean | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "patient_portal_sessions_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patient_dashboard_view"
            referencedColumns: ["patient_id"]
          },
          {
            foreignKeyName: "patient_portal_sessions_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_portal_sessions_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "task_cost_analytics"
            referencedColumns: ["patient_id"]
          },
        ]
      }
      patient_progress_snapshots: {
        Row: {
          achievements: string[] | null
          activity_level: number | null
          adherence_rate: number | null
          ai_analysis: Json | null
          challenges: string[] | null
          completed_exercises_last_week: number | null
          created_at: string | null
          functional_score: number | null
          goals_achieved: number | null
          goals_in_progress: number | null
          goals_total: number | null
          id: string
          mobility_improvement_percentage: number | null
          mobility_score: number | null
          mood_rating: number | null
          next_focus_areas: string[] | null
          overall_improvement_percentage: number | null
          pain_improvement_percentage: number | null
          pain_level: number | null
          patient_id: string
          prescribed_exercises: number | null
          progress_notes: string | null
          sleep_quality: number | null
          snapshot_date: string | null
          snapshot_type: string | null
          trend_analysis: Json | null
          updated_at: string | null
        }
        Insert: {
          achievements?: string[] | null
          activity_level?: number | null
          adherence_rate?: number | null
          ai_analysis?: Json | null
          challenges?: string[] | null
          completed_exercises_last_week?: number | null
          created_at?: string | null
          functional_score?: number | null
          goals_achieved?: number | null
          goals_in_progress?: number | null
          goals_total?: number | null
          id?: string
          mobility_improvement_percentage?: number | null
          mobility_score?: number | null
          mood_rating?: number | null
          next_focus_areas?: string[] | null
          overall_improvement_percentage?: number | null
          pain_improvement_percentage?: number | null
          pain_level?: number | null
          patient_id: string
          prescribed_exercises?: number | null
          progress_notes?: string | null
          sleep_quality?: number | null
          snapshot_date?: string | null
          snapshot_type?: string | null
          trend_analysis?: Json | null
          updated_at?: string | null
        }
        Update: {
          achievements?: string[] | null
          activity_level?: number | null
          adherence_rate?: number | null
          ai_analysis?: Json | null
          challenges?: string[] | null
          completed_exercises_last_week?: number | null
          created_at?: string | null
          functional_score?: number | null
          goals_achieved?: number | null
          goals_in_progress?: number | null
          goals_total?: number | null
          id?: string
          mobility_improvement_percentage?: number | null
          mobility_score?: number | null
          mood_rating?: number | null
          next_focus_areas?: string[] | null
          overall_improvement_percentage?: number | null
          pain_improvement_percentage?: number | null
          pain_level?: number | null
          patient_id?: string
          prescribed_exercises?: number | null
          progress_notes?: string | null
          sleep_quality?: number | null
          snapshot_date?: string | null
          snapshot_type?: string | null
          trend_analysis?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "patient_progress_snapshots_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patient_dashboard_view"
            referencedColumns: ["patient_id"]
          },
          {
            foreignKeyName: "patient_progress_snapshots_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_progress_snapshots_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "task_cost_analytics"
            referencedColumns: ["patient_id"]
          },
        ]
      }
      patient_segmentation: {
        Row: {
          assigned_date: string
          confidence_score: number | null
          created_at: string
          criteria: Json | null
          expires_date: string | null
          id: string
          metadata: Json | null
          patient_id: string
          segment_type: string
          segment_value: string
          updated_at: string
        }
        Insert: {
          assigned_date?: string
          confidence_score?: number | null
          created_at?: string
          criteria?: Json | null
          expires_date?: string | null
          id?: string
          metadata?: Json | null
          patient_id: string
          segment_type: string
          segment_value: string
          updated_at?: string
        }
        Update: {
          assigned_date?: string
          confidence_score?: number | null
          created_at?: string
          criteria?: Json | null
          expires_date?: string | null
          id?: string
          metadata?: Json | null
          patient_id?: string
          segment_type?: string
          segment_value?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "patient_segmentation_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patient_dashboard_view"
            referencedColumns: ["patient_id"]
          },
          {
            foreignKeyName: "patient_segmentation_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_segmentation_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "task_cost_analytics"
            referencedColumns: ["patient_id"]
          },
        ]
      }
      patients: {
        Row: {
          birth_date: string | null
          created_at: string | null
          created_by: string | null
          email: string | null
          id: string
          name: string
          phone: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          birth_date?: string | null
          created_at?: string | null
          created_by?: string | null
          email?: string | null
          id?: string
          name: string
          phone?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          birth_date?: string | null
          created_at?: string | null
          created_by?: string | null
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "patients_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "task_cost_analytics"
            referencedColumns: ["therapist_id"]
          },
          {
            foreignKeyName: "patients_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patients_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "task_cost_analytics"
            referencedColumns: ["therapist_id"]
          },
          {
            foreignKeyName: "patients_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_methods: {
        Row: {
          clinic_id: string | null
          created_at: string
          id: string
          is_active: boolean
          name: string
          processing_fee_fixed: number | null
          processing_fee_percentage: number | null
          provider: string | null
          settings: Json | null
          type: string
          updated_at: string
        }
        Insert: {
          clinic_id?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          processing_fee_fixed?: number | null
          processing_fee_percentage?: number | null
          provider?: string | null
          settings?: Json | null
          type: string
          updated_at?: string
        }
        Update: {
          clinic_id?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          processing_fee_fixed?: number | null
          processing_fee_percentage?: number | null
          provider?: string | null
          settings?: Json | null
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          appointment_id: string | null
          created_at: string | null
          currency: string
          description: string | null
          due_date: string | null
          gateway_provider: string
          gateway_transaction_id: string | null
          id: string
          metadata: Json | null
          net_amount: number | null
          paid_at: string | null
          patient_id: string | null
          payment_method: string
          payment_method_details: Json | null
          processing_fee: number | null
          status: string
          updated_at: string | null
        }
        Insert: {
          amount: number
          appointment_id?: string | null
          created_at?: string | null
          currency?: string
          description?: string | null
          due_date?: string | null
          gateway_provider?: string
          gateway_transaction_id?: string | null
          id?: string
          metadata?: Json | null
          net_amount?: number | null
          paid_at?: string | null
          patient_id?: string | null
          payment_method: string
          payment_method_details?: Json | null
          processing_fee?: number | null
          status?: string
          updated_at?: string | null
        }
        Update: {
          amount?: number
          appointment_id?: string | null
          created_at?: string | null
          currency?: string
          description?: string | null
          due_date?: string | null
          gateway_provider?: string
          gateway_transaction_id?: string | null
          id?: string
          metadata?: Json | null
          net_amount?: number | null
          paid_at?: string | null
          patient_id?: string | null
          payment_method?: string
          payment_method_details?: Json | null
          processing_fee?: number | null
          status?: string
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
            referencedRelation: "patient_dashboard_view"
            referencedColumns: ["patient_id"]
          },
          {
            foreignKeyName: "payments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "task_cost_analytics"
            referencedColumns: ["patient_id"]
          },
        ]
      }
      performance_metrics: {
        Row: {
          created_at: string | null
          id: string
          metric_category: string
          metric_name: string
          metric_unit: string | null
          metric_value: number | null
          period_end: string
          period_start: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          metric_category: string
          metric_name: string
          metric_unit?: string | null
          metric_value?: number | null
          period_end: string
          period_start: string
        }
        Update: {
          created_at?: string | null
          id?: string
          metric_category?: string
          metric_name?: string
          metric_unit?: string | null
          metric_value?: number | null
          period_end?: string
          period_start?: string
        }
        Relationships: []
      }
      protocol_exercises: {
        Row: {
          created_at: string
          duration_seconds: number | null
          exercise_id: string
          id: string
          notes: string | null
          order_position: number
          protocol_id: string
          repetitions: number
          rest_seconds: number | null
          sets: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          duration_seconds?: number | null
          exercise_id: string
          id?: string
          notes?: string | null
          order_position: number
          protocol_id: string
          repetitions: number
          rest_seconds?: number | null
          sets: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          duration_seconds?: number | null
          exercise_id?: string
          id?: string
          notes?: string | null
          order_position?: number
          protocol_id?: string
          repetitions?: number
          rest_seconds?: number | null
          sets?: number
          updated_at?: string
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
      purchase_order_items: {
        Row: {
          created_at: string | null
          id: string
          purchase_order_id: string | null
          quantity_received: number | null
          quantity_requested: number
          supply_id: string | null
          total_cost: number | null
          unit_cost: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          purchase_order_id?: string | null
          quantity_received?: number | null
          quantity_requested: number
          supply_id?: string | null
          total_cost?: number | null
          unit_cost?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          purchase_order_id?: string | null
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
          {
            foreignKeyName: "purchase_order_items_supply_id_fkey"
            columns: ["supply_id"]
            isOneToOne: false
            referencedRelation: "supply_consumption_analytics"
            referencedColumns: ["supply_id"]
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
            foreignKeyName: "purchase_orders_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "task_cost_analytics"
            referencedColumns: ["therapist_id"]
          },
          {
            foreignKeyName: "purchase_orders_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_orders_requested_by_fkey"
            columns: ["requested_by"]
            isOneToOne: false
            referencedRelation: "task_cost_analytics"
            referencedColumns: ["therapist_id"]
          },
          {
            foreignKeyName: "purchase_orders_requested_by_fkey"
            columns: ["requested_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_orders_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "supplier_performance_analytics"
            referencedColumns: ["supplier_id"]
          },
          {
            foreignKeyName: "purchase_orders_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      recurrence_templates: {
        Row: {
          clinic_id: string | null
          created_at: string
          created_by: string | null
          description: string | null
          duration_minutes: number
          id: string
          is_active: boolean
          recurrence_rule: Json
          therapist_id: string | null
          timezone: string
          title: string
          updated_at: string
        }
        Insert: {
          clinic_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          duration_minutes?: number
          id?: string
          is_active?: boolean
          recurrence_rule: Json
          therapist_id?: string | null
          timezone?: string
          title: string
          updated_at?: string
        }
        Update: {
          clinic_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          duration_minutes?: number
          id?: string
          is_active?: boolean
          recurrence_rule?: Json
          therapist_id?: string | null
          timezone?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "recurrence_templates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "task_cost_analytics"
            referencedColumns: ["therapist_id"]
          },
          {
            foreignKeyName: "recurrence_templates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recurrence_templates_therapist_id_fkey"
            columns: ["therapist_id"]
            isOneToOne: false
            referencedRelation: "task_cost_analytics"
            referencedColumns: ["therapist_id"]
          },
          {
            foreignKeyName: "recurrence_templates_therapist_id_fkey"
            columns: ["therapist_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      recurrent_payments: {
        Row: {
          amount: number
          clinic_id: string | null
          created_at: string
          description: string | null
          end_date: string | null
          frequency: string
          frequency_interval: number | null
          id: string
          metadata: Json | null
          next_payment_date: string | null
          patient_id: string
          payment_method_id: string | null
          start_date: string
          status: string
          updated_at: string
        }
        Insert: {
          amount: number
          clinic_id?: string | null
          created_at?: string
          description?: string | null
          end_date?: string | null
          frequency: string
          frequency_interval?: number | null
          id?: string
          metadata?: Json | null
          next_payment_date?: string | null
          patient_id: string
          payment_method_id?: string | null
          start_date: string
          status?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          clinic_id?: string | null
          created_at?: string
          description?: string | null
          end_date?: string | null
          frequency?: string
          frequency_interval?: number | null
          id?: string
          metadata?: Json | null
          next_payment_date?: string | null
          patient_id?: string
          payment_method_id?: string | null
          start_date?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "recurrent_payments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patient_dashboard_view"
            referencedColumns: ["patient_id"]
          },
          {
            foreignKeyName: "recurrent_payments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recurrent_payments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "task_cost_analytics"
            referencedColumns: ["patient_id"]
          },
          {
            foreignKeyName: "recurrent_payments_payment_method_id_fkey"
            columns: ["payment_method_id"]
            isOneToOne: false
            referencedRelation: "payment_methods"
            referencedColumns: ["id"]
          },
        ]
      }
      report_history: {
        Row: {
          completed_at: string | null
          created_at: string | null
          error_message: string | null
          file_path: string | null
          file_size: number | null
          id: string
          parameters: Json | null
          recipients: string[] | null
          report_name: string
          report_type: string
          scheduled_report_id: string | null
          started_at: string | null
          status: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          error_message?: string | null
          file_path?: string | null
          file_size?: number | null
          id?: string
          parameters?: Json | null
          recipients?: string[] | null
          report_name: string
          report_type: string
          scheduled_report_id?: string | null
          started_at?: string | null
          status: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          error_message?: string | null
          file_path?: string | null
          file_size?: number | null
          id?: string
          parameters?: Json | null
          recipients?: string[] | null
          report_name?: string
          report_type?: string
          scheduled_report_id?: string | null
          started_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "report_history_scheduled_report_id_fkey"
            columns: ["scheduled_report_id"]
            isOneToOne: false
            referencedRelation: "scheduled_reports"
            referencedColumns: ["id"]
          },
        ]
      }
      schedule_blocks: {
        Row: {
          block_type: string
          clinic_id: string | null
          created_at: string
          created_by: string | null
          end_at: string
          id: string
          reason: string | null
          recurrence_rule: Json | null
          start_at: string
          therapist_id: string | null
          updated_at: string
        }
        Insert: {
          block_type?: string
          clinic_id?: string | null
          created_at?: string
          created_by?: string | null
          end_at: string
          id?: string
          reason?: string | null
          recurrence_rule?: Json | null
          start_at: string
          therapist_id?: string | null
          updated_at?: string
        }
        Update: {
          block_type?: string
          clinic_id?: string | null
          created_at?: string
          created_by?: string | null
          end_at?: string
          id?: string
          reason?: string | null
          recurrence_rule?: Json | null
          start_at?: string
          therapist_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "schedule_blocks_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "task_cost_analytics"
            referencedColumns: ["therapist_id"]
          },
          {
            foreignKeyName: "schedule_blocks_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "schedule_blocks_therapist_id_fkey"
            columns: ["therapist_id"]
            isOneToOne: false
            referencedRelation: "task_cost_analytics"
            referencedColumns: ["therapist_id"]
          },
          {
            foreignKeyName: "schedule_blocks_therapist_id_fkey"
            columns: ["therapist_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      scheduled_alerts: {
        Row: {
          attempts: number | null
          created_at: string | null
          error_message: string | null
          id: string
          last_attempt_at: string | null
          max_attempts: number | null
          rule_id: string | null
          scheduled_for: string
          status: string | null
          supply_id: string | null
        }
        Insert: {
          attempts?: number | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          last_attempt_at?: string | null
          max_attempts?: number | null
          rule_id?: string | null
          scheduled_for: string
          status?: string | null
          supply_id?: string | null
        }
        Update: {
          attempts?: number | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          last_attempt_at?: string | null
          max_attempts?: number | null
          rule_id?: string | null
          scheduled_for?: string
          status?: string | null
          supply_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "scheduled_alerts_rule_id_fkey"
            columns: ["rule_id"]
            isOneToOne: false
            referencedRelation: "auto_alert_rules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scheduled_alerts_supply_id_fkey"
            columns: ["supply_id"]
            isOneToOne: false
            referencedRelation: "supplies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scheduled_alerts_supply_id_fkey"
            columns: ["supply_id"]
            isOneToOne: false
            referencedRelation: "supply_consumption_analytics"
            referencedColumns: ["supply_id"]
          },
        ]
      }
      scheduled_reports: {
        Row: {
          created_at: string | null
          created_by: string | null
          format: string | null
          id: string
          is_active: boolean | null
          last_run: string | null
          next_run: string | null
          parameters: Json | null
          recipients: string[]
          report_name: string
          report_type: string
          schedule_day: number | null
          schedule_time: string | null
          schedule_type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          format?: string | null
          id?: string
          is_active?: boolean | null
          last_run?: string | null
          next_run?: string | null
          parameters?: Json | null
          recipients: string[]
          report_name: string
          report_type: string
          schedule_day?: number | null
          schedule_time?: string | null
          schedule_type: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          format?: string | null
          id?: string
          is_active?: boolean | null
          last_run?: string | null
          next_run?: string | null
          parameters?: Json | null
          recipients?: string[]
          report_name?: string
          report_type?: string
          schedule_day?: number | null
          schedule_time?: string | null
          schedule_type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "scheduled_reports_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "task_cost_analytics"
            referencedColumns: ["therapist_id"]
          },
          {
            foreignKeyName: "scheduled_reports_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      scheduling_alerts: {
        Row: {
          alert_type: string
          appointment_id: string | null
          created_at: string
          expires_at: string | null
          id: string
          patient_id: string | null
          payload: Json
          resolved: boolean
          resolved_at: string | null
        }
        Insert: {
          alert_type: string
          appointment_id?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          patient_id?: string | null
          payload: Json
          resolved?: boolean
          resolved_at?: string | null
        }
        Update: {
          alert_type?: string
          appointment_id?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          patient_id?: string | null
          payload?: Json
          resolved?: boolean
          resolved_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "scheduling_alerts_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scheduling_alerts_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patient_dashboard_view"
            referencedColumns: ["patient_id"]
          },
          {
            foreignKeyName: "scheduling_alerts_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scheduling_alerts_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "task_cost_analytics"
            referencedColumns: ["patient_id"]
          },
        ]
      }
      session_evolutions: {
        Row: {
          adverse_reactions: string | null
          appointment_id: string
          body_map_points: Json | null
          created_at: string | null
          created_by: string
          document_id: string
          equipment_used: Json | null
          exercises_performed: Json | null
          home_exercises: Json | null
          id: string
          measurements: Json | null
          next_session_plan: string | null
          objective_findings: string | null
          pain_level_after: number | null
          pain_level_before: number | null
          patient_id: string
          patient_response: string | null
          recommendations: string | null
          subjective_assessment: string | null
          techniques_applied: Json
        }
        Insert: {
          adverse_reactions?: string | null
          appointment_id: string
          body_map_points?: Json | null
          created_at?: string | null
          created_by: string
          document_id: string
          equipment_used?: Json | null
          exercises_performed?: Json | null
          home_exercises?: Json | null
          id?: string
          measurements?: Json | null
          next_session_plan?: string | null
          objective_findings?: string | null
          pain_level_after?: number | null
          pain_level_before?: number | null
          patient_id: string
          patient_response?: string | null
          recommendations?: string | null
          subjective_assessment?: string | null
          techniques_applied?: Json
        }
        Update: {
          adverse_reactions?: string | null
          appointment_id?: string
          body_map_points?: Json | null
          created_at?: string | null
          created_by?: string
          document_id?: string
          equipment_used?: Json | null
          exercises_performed?: Json | null
          home_exercises?: Json | null
          id?: string
          measurements?: Json | null
          next_session_plan?: string | null
          objective_findings?: string | null
          pain_level_after?: number | null
          pain_level_before?: number | null
          patient_id?: string
          patient_response?: string | null
          recommendations?: string | null
          subjective_assessment?: string | null
          techniques_applied?: Json
        }
        Relationships: [
          {
            foreignKeyName: "session_evolutions_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "session_evolutions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "task_cost_analytics"
            referencedColumns: ["therapist_id"]
          },
          {
            foreignKeyName: "session_evolutions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "session_evolutions_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "clinical_documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "session_evolutions_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patient_dashboard_view"
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
            foreignKeyName: "session_evolutions_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "task_cost_analytics"
            referencedColumns: ["patient_id"]
          },
        ]
      }
      sessions: {
        Row: {
          appointment_id: string | null
          created_at: string | null
          duration_minutes: number | null
          end_time: string | null
          id: string
          metadata: Json | null
          notes: string | null
          patient_id: string | null
          recording_url: string | null
          session_type: string
          start_time: string | null
          status: string
          therapist_id: string | null
          updated_at: string | null
        }
        Insert: {
          appointment_id?: string | null
          created_at?: string | null
          duration_minutes?: number | null
          end_time?: string | null
          id?: string
          metadata?: Json | null
          notes?: string | null
          patient_id?: string | null
          recording_url?: string | null
          session_type?: string
          start_time?: string | null
          status?: string
          therapist_id?: string | null
          updated_at?: string | null
        }
        Update: {
          appointment_id?: string | null
          created_at?: string | null
          duration_minutes?: number | null
          end_time?: string | null
          id?: string
          metadata?: Json | null
          notes?: string | null
          patient_id?: string | null
          recording_url?: string | null
          session_type?: string
          start_time?: string | null
          status?: string
          therapist_id?: string | null
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
            referencedRelation: "patient_dashboard_view"
            referencedColumns: ["patient_id"]
          },
          {
            foreignKeyName: "sessions_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sessions_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "task_cost_analytics"
            referencedColumns: ["patient_id"]
          },
          {
            foreignKeyName: "sessions_therapist_id_fkey"
            columns: ["therapist_id"]
            isOneToOne: false
            referencedRelation: "task_cost_analytics"
            referencedColumns: ["therapist_id"]
          },
          {
            foreignKeyName: "sessions_therapist_id_fkey"
            columns: ["therapist_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_movements: {
        Row: {
          batch_number: string | null
          created_at: string | null
          expiration_date: string | null
          id: string
          moved_by: string | null
          movement_type: string
          patient_id: string | null
          quantity: number
          reason: string | null
          reference_document: string | null
          supply_id: string | null
          task_id: string | null
          total_cost: number | null
          unit_cost: number | null
        }
        Insert: {
          batch_number?: string | null
          created_at?: string | null
          expiration_date?: string | null
          id?: string
          moved_by?: string | null
          movement_type: string
          patient_id?: string | null
          quantity: number
          reason?: string | null
          reference_document?: string | null
          supply_id?: string | null
          task_id?: string | null
          total_cost?: number | null
          unit_cost?: number | null
        }
        Update: {
          batch_number?: string | null
          created_at?: string | null
          expiration_date?: string | null
          id?: string
          moved_by?: string | null
          movement_type?: string
          patient_id?: string | null
          quantity?: number
          reason?: string | null
          reference_document?: string | null
          supply_id?: string | null
          task_id?: string | null
          total_cost?: number | null
          unit_cost?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "stock_movements_moved_by_fkey"
            columns: ["moved_by"]
            isOneToOne: false
            referencedRelation: "task_cost_analytics"
            referencedColumns: ["therapist_id"]
          },
          {
            foreignKeyName: "stock_movements_moved_by_fkey"
            columns: ["moved_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_movements_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patient_dashboard_view"
            referencedColumns: ["patient_id"]
          },
          {
            foreignKeyName: "stock_movements_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_movements_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "task_cost_analytics"
            referencedColumns: ["patient_id"]
          },
          {
            foreignKeyName: "stock_movements_supply_id_fkey"
            columns: ["supply_id"]
            isOneToOne: false
            referencedRelation: "supplies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_movements_supply_id_fkey"
            columns: ["supply_id"]
            isOneToOne: false
            referencedRelation: "supply_consumption_analytics"
            referencedColumns: ["supply_id"]
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
          unit_of_measure: string
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
            foreignKeyName: "supplies_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "task_cost_analytics"
            referencedColumns: ["therapist_id"]
          },
          {
            foreignKeyName: "supplies_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supplies_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "supplier_performance_analytics"
            referencedColumns: ["supplier_id"]
          },
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
            foreignKeyName: "supply_alerts_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "task_cost_analytics"
            referencedColumns: ["therapist_id"]
          },
          {
            foreignKeyName: "supply_alerts_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supply_alerts_supply_id_fkey"
            columns: ["supply_id"]
            isOneToOne: false
            referencedRelation: "supplies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supply_alerts_supply_id_fkey"
            columns: ["supply_id"]
            isOneToOne: false
            referencedRelation: "supply_consumption_analytics"
            referencedColumns: ["supply_id"]
          },
        ]
      }
      task_costs: {
        Row: {
          calculated_at: string | null
          calculated_by: string | null
          id: string
          labor_cost: number | null
          overhead_cost: number | null
          task_id: string | null
          total_cost: number | null
          total_supply_cost: number | null
        }
        Insert: {
          calculated_at?: string | null
          calculated_by?: string | null
          id?: string
          labor_cost?: number | null
          overhead_cost?: number | null
          task_id?: string | null
          total_cost?: number | null
          total_supply_cost?: number | null
        }
        Update: {
          calculated_at?: string | null
          calculated_by?: string | null
          id?: string
          labor_cost?: number | null
          overhead_cost?: number | null
          task_id?: string | null
          total_cost?: number | null
          total_supply_cost?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "task_costs_calculated_by_fkey"
            columns: ["calculated_by"]
            isOneToOne: false
            referencedRelation: "task_cost_analytics"
            referencedColumns: ["therapist_id"]
          },
          {
            foreignKeyName: "task_costs_calculated_by_fkey"
            columns: ["calculated_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_costs_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "task_cost_analytics"
            referencedColumns: ["task_id"]
          },
          {
            foreignKeyName: "task_costs_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      task_supplies_used: {
        Row: {
          batch_number: string | null
          created_at: string | null
          expiration_date: string | null
          id: string
          notes: string | null
          patient_id: string | null
          quantity_used: number
          supply_id: string | null
          task_id: string | null
          total_cost: number | null
          unit_cost: number | null
          usage_date: string | null
          used_by: string | null
        }
        Insert: {
          batch_number?: string | null
          created_at?: string | null
          expiration_date?: string | null
          id?: string
          notes?: string | null
          patient_id?: string | null
          quantity_used: number
          supply_id?: string | null
          task_id?: string | null
          total_cost?: number | null
          unit_cost?: number | null
          usage_date?: string | null
          used_by?: string | null
        }
        Update: {
          batch_number?: string | null
          created_at?: string | null
          expiration_date?: string | null
          id?: string
          notes?: string | null
          patient_id?: string | null
          quantity_used?: number
          supply_id?: string | null
          task_id?: string | null
          total_cost?: number | null
          unit_cost?: number | null
          usage_date?: string | null
          used_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "task_supplies_used_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patient_dashboard_view"
            referencedColumns: ["patient_id"]
          },
          {
            foreignKeyName: "task_supplies_used_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_supplies_used_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "task_cost_analytics"
            referencedColumns: ["patient_id"]
          },
          {
            foreignKeyName: "task_supplies_used_supply_id_fkey"
            columns: ["supply_id"]
            isOneToOne: false
            referencedRelation: "supplies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_supplies_used_supply_id_fkey"
            columns: ["supply_id"]
            isOneToOne: false
            referencedRelation: "supply_consumption_analytics"
            referencedColumns: ["supply_id"]
          },
          {
            foreignKeyName: "task_supplies_used_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "task_cost_analytics"
            referencedColumns: ["task_id"]
          },
          {
            foreignKeyName: "task_supplies_used_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_supplies_used_used_by_fkey"
            columns: ["used_by"]
            isOneToOne: false
            referencedRelation: "task_cost_analytics"
            referencedColumns: ["therapist_id"]
          },
          {
            foreignKeyName: "task_supplies_used_used_by_fkey"
            columns: ["used_by"]
            isOneToOne: false
            referencedRelation: "users"
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
          is_active: boolean | null
          is_required: boolean | null
          notes: string | null
          supply_id: string | null
          task_type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          default_quantity?: number | null
          id?: string
          is_active?: boolean | null
          is_required?: boolean | null
          notes?: string | null
          supply_id?: string | null
          task_type: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          default_quantity?: number | null
          id?: string
          is_active?: boolean | null
          is_required?: boolean | null
          notes?: string | null
          supply_id?: string | null
          task_type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "task_type_supply_templates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "task_cost_analytics"
            referencedColumns: ["therapist_id"]
          },
          {
            foreignKeyName: "task_type_supply_templates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_type_supply_templates_supply_id_fkey"
            columns: ["supply_id"]
            isOneToOne: false
            referencedRelation: "supplies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_type_supply_templates_supply_id_fkey"
            columns: ["supply_id"]
            isOneToOne: false
            referencedRelation: "supply_consumption_analytics"
            referencedColumns: ["supply_id"]
          },
        ]
      }
      tasks: {
        Row: {
          actor_user_id: string | null
          actual_duration: number | null
          assigned_user_id: string | null
          created_at: string | null
          description: string | null
          due_date: string | null
          estimated_duration: number | null
          id: string
          is_active: boolean | null
          notes: string | null
          patient_id: string | null
          priority: string | null
          project_id: string | null
          status: string | null
          task_type: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          actor_user_id?: string | null
          actual_duration?: number | null
          assigned_user_id?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          estimated_duration?: number | null
          id?: string
          is_active?: boolean | null
          notes?: string | null
          patient_id?: string | null
          priority?: string | null
          project_id?: string | null
          status?: string | null
          task_type?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          actor_user_id?: string | null
          actual_duration?: number | null
          assigned_user_id?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          estimated_duration?: number | null
          id?: string
          is_active?: boolean | null
          notes?: string | null
          patient_id?: string | null
          priority?: string | null
          project_id?: string | null
          status?: string | null
          task_type?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tasks_actor_user_id_fkey"
            columns: ["actor_user_id"]
            isOneToOne: false
            referencedRelation: "task_cost_analytics"
            referencedColumns: ["therapist_id"]
          },
          {
            foreignKeyName: "tasks_actor_user_id_fkey"
            columns: ["actor_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_assigned_user_id_fkey"
            columns: ["assigned_user_id"]
            isOneToOne: false
            referencedRelation: "task_cost_analytics"
            referencedColumns: ["therapist_id"]
          },
          {
            foreignKeyName: "tasks_assigned_user_id_fkey"
            columns: ["assigned_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patient_dashboard_view"
            referencedColumns: ["patient_id"]
          },
          {
            foreignKeyName: "tasks_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "task_cost_analytics"
            referencedColumns: ["patient_id"]
          },
        ]
      }
      treatment_effectiveness: {
        Row: {
          created_at: string
          end_date: string | null
          final_pain_level: number | null
          id: string
          initial_pain_level: number | null
          metadata: Json | null
          notes: string | null
          outcome_score: number | null
          patient_id: string
          patient_satisfaction: number | null
          protocol_id: string | null
          sessions_completed: number | null
          sessions_planned: number | null
          start_date: string
          success_rate: number | null
          therapist_id: string | null
          treatment_type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          end_date?: string | null
          final_pain_level?: number | null
          id?: string
          initial_pain_level?: number | null
          metadata?: Json | null
          notes?: string | null
          outcome_score?: number | null
          patient_id: string
          patient_satisfaction?: number | null
          protocol_id?: string | null
          sessions_completed?: number | null
          sessions_planned?: number | null
          start_date: string
          success_rate?: number | null
          therapist_id?: string | null
          treatment_type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          end_date?: string | null
          final_pain_level?: number | null
          id?: string
          initial_pain_level?: number | null
          metadata?: Json | null
          notes?: string | null
          outcome_score?: number | null
          patient_id?: string
          patient_satisfaction?: number | null
          protocol_id?: string | null
          sessions_completed?: number | null
          sessions_planned?: number | null
          start_date?: string
          success_rate?: number | null
          therapist_id?: string | null
          treatment_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "treatment_effectiveness_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patient_dashboard_view"
            referencedColumns: ["patient_id"]
          },
          {
            foreignKeyName: "treatment_effectiveness_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "treatment_effectiveness_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "task_cost_analytics"
            referencedColumns: ["patient_id"]
          },
          {
            foreignKeyName: "treatment_effectiveness_therapist_id_fkey"
            columns: ["therapist_id"]
            isOneToOne: false
            referencedRelation: "task_cost_analytics"
            referencedColumns: ["therapist_id"]
          },
          {
            foreignKeyName: "treatment_effectiveness_therapist_id_fkey"
            columns: ["therapist_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      treatment_outcomes: {
        Row: {
          created_at: string
          created_by: string | null
          functional_score: number | null
          id: string
          measurement_date: string
          objective_measures: Json | null
          outcome_type: string
          pain_level: number | null
          patient_id: string
          patient_satisfaction: number | null
          quality_of_life_score: number | null
          range_of_motion: Json | null
          strength_assessment: Json | null
          therapist_notes: string | null
          treatment_effectiveness_id: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          functional_score?: number | null
          id?: string
          measurement_date: string
          objective_measures?: Json | null
          outcome_type: string
          pain_level?: number | null
          patient_id: string
          patient_satisfaction?: number | null
          quality_of_life_score?: number | null
          range_of_motion?: Json | null
          strength_assessment?: Json | null
          therapist_notes?: string | null
          treatment_effectiveness_id?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          functional_score?: number | null
          id?: string
          measurement_date?: string
          objective_measures?: Json | null
          outcome_type?: string
          pain_level?: number | null
          patient_id?: string
          patient_satisfaction?: number | null
          quality_of_life_score?: number | null
          range_of_motion?: Json | null
          strength_assessment?: Json | null
          therapist_notes?: string | null
          treatment_effectiveness_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "treatment_outcomes_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "task_cost_analytics"
            referencedColumns: ["therapist_id"]
          },
          {
            foreignKeyName: "treatment_outcomes_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "treatment_outcomes_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patient_dashboard_view"
            referencedColumns: ["patient_id"]
          },
          {
            foreignKeyName: "treatment_outcomes_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "treatment_outcomes_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "task_cost_analytics"
            referencedColumns: ["patient_id"]
          },
          {
            foreignKeyName: "treatment_outcomes_treatment_effectiveness_id_fkey"
            columns: ["treatment_effectiveness_id"]
            isOneToOne: false
            referencedRelation: "treatment_effectiveness"
            referencedColumns: ["id"]
          },
        ]
      }
      treatment_timeline: {
        Row: {
          appointment_id: string | null
          attachments: string[] | null
          created_at: string | null
          description: string | null
          event_date: string
          event_type: string
          exercise_id: string | null
          id: string
          importance_level: string | null
          is_visible_to_patient: boolean | null
          metadata: Json | null
          patient_id: string
          session_id: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          appointment_id?: string | null
          attachments?: string[] | null
          created_at?: string | null
          description?: string | null
          event_date: string
          event_type: string
          exercise_id?: string | null
          id?: string
          importance_level?: string | null
          is_visible_to_patient?: boolean | null
          metadata?: Json | null
          patient_id: string
          session_id?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          appointment_id?: string | null
          attachments?: string[] | null
          created_at?: string | null
          description?: string | null
          event_date?: string
          event_type?: string
          exercise_id?: string | null
          id?: string
          importance_level?: string | null
          is_visible_to_patient?: boolean | null
          metadata?: Json | null
          patient_id?: string
          session_id?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "treatment_timeline_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "treatment_timeline_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patient_dashboard_view"
            referencedColumns: ["patient_id"]
          },
          {
            foreignKeyName: "treatment_timeline_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "treatment_timeline_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "task_cost_analytics"
            referencedColumns: ["patient_id"]
          },
        ]
      }
      user_alert_preferences: {
        Row: {
          alert_type: string | null
          created_at: string | null
          id: string
          is_enabled: boolean | null
          notification_method: string | null
          user_id: string | null
        }
        Insert: {
          alert_type?: string | null
          created_at?: string | null
          id?: string
          is_enabled?: boolean | null
          notification_method?: string | null
          user_id?: string | null
        }
        Update: {
          alert_type?: string | null
          created_at?: string | null
          id?: string
          is_enabled?: boolean | null
          notification_method?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_alert_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "task_cost_analytics"
            referencedColumns: ["therapist_id"]
          },
          {
            foreignKeyName: "user_alert_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_notification_settings: {
        Row: {
          channel: string
          created_at: string | null
          frequency: string | null
          id: string
          is_enabled: boolean | null
          notification_type: string
          quiet_hours_end: string | null
          quiet_hours_start: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          channel: string
          created_at?: string | null
          frequency?: string | null
          id?: string
          is_enabled?: boolean | null
          notification_type: string
          quiet_hours_end?: string | null
          quiet_hours_start?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          channel?: string
          created_at?: string | null
          frequency?: string | null
          id?: string
          is_enabled?: boolean | null
          notification_type?: string
          quiet_hours_end?: string | null
          quiet_hours_start?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_notification_settings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "task_cost_analytics"
            referencedColumns: ["therapist_id"]
          },
          {
            foreignKeyName: "user_notification_settings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string
          id: string
          name: string
          phone: string | null
          role: string
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email: string
          id: string
          name: string
          phone?: string | null
          role: string
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          id?: string
          name?: string
          phone?: string | null
          role?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      users: {
        Row: {
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          is_active: boolean | null
          last_login_at: string | null
          permissions: Json | null
          profile_settings: Json | null
          role: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          full_name?: string | null
          id?: string
          is_active?: boolean | null
          last_login_at?: string | null
          permissions?: Json | null
          profile_settings?: Json | null
          role?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          is_active?: boolean | null
          last_login_at?: string | null
          permissions?: Json | null
          profile_settings?: Json | null
          role?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      waitlist_entries: {
        Row: {
          clinic_id: string | null
          created_at: string
          id: string
          last_notified_at: string | null
          no_show_risk: number | null
          notes: string | null
          patient_id: string
          preferred_days: number[] | null
          preferred_start_from: string | null
          preferred_start_to: string | null
          preferred_time_ranges: Json | null
          status: string
          therapist_id: string | null
          updated_at: string
          urgency: number | null
        }
        Insert: {
          clinic_id?: string | null
          created_at?: string
          id?: string
          last_notified_at?: string | null
          no_show_risk?: number | null
          notes?: string | null
          patient_id: string
          preferred_days?: number[] | null
          preferred_start_from?: string | null
          preferred_start_to?: string | null
          preferred_time_ranges?: Json | null
          status?: string
          therapist_id?: string | null
          updated_at?: string
          urgency?: number | null
        }
        Update: {
          clinic_id?: string | null
          created_at?: string
          id?: string
          last_notified_at?: string | null
          no_show_risk?: number | null
          notes?: string | null
          patient_id?: string
          preferred_days?: number[] | null
          preferred_start_from?: string | null
          preferred_start_to?: string | null
          preferred_time_ranges?: Json | null
          status?: string
          therapist_id?: string | null
          updated_at?: string
          urgency?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "waitlist_entries_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patient_dashboard_view"
            referencedColumns: ["patient_id"]
          },
          {
            foreignKeyName: "waitlist_entries_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "waitlist_entries_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "task_cost_analytics"
            referencedColumns: ["patient_id"]
          },
          {
            foreignKeyName: "waitlist_entries_therapist_id_fkey"
            columns: ["therapist_id"]
            isOneToOne: false
            referencedRelation: "task_cost_analytics"
            referencedColumns: ["therapist_id"]
          },
          {
            foreignKeyName: "waitlist_entries_therapist_id_fkey"
            columns: ["therapist_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      webhook_deliveries: {
        Row: {
          created_at: string | null
          delivered_at: string | null
          error_message: string | null
          event_type: string
          id: string
          message_id: string | null
          request_body: Json | null
          request_headers: Json | null
          request_method: string | null
          request_url: string
          response_body: string | null
          response_headers: Json | null
          response_status: number | null
          response_time_ms: number | null
          retry_count: number | null
          success: boolean
          webhook_id: string | null
        }
        Insert: {
          created_at?: string | null
          delivered_at?: string | null
          error_message?: string | null
          event_type: string
          id?: string
          message_id?: string | null
          request_body?: Json | null
          request_headers?: Json | null
          request_method?: string | null
          request_url: string
          response_body?: string | null
          response_headers?: Json | null
          response_status?: number | null
          response_time_ms?: number | null
          retry_count?: number | null
          success: boolean
          webhook_id?: string | null
        }
        Update: {
          created_at?: string | null
          delivered_at?: string | null
          error_message?: string | null
          event_type?: string
          id?: string
          message_id?: string | null
          request_body?: Json | null
          request_headers?: Json | null
          request_method?: string | null
          request_url?: string
          response_body?: string | null
          response_headers?: Json | null
          response_status?: number | null
          response_time_ms?: number | null
          retry_count?: number | null
          success?: boolean
          webhook_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "webhook_deliveries_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "webhook_deliveries_webhook_id_fkey"
            columns: ["webhook_id"]
            isOneToOne: false
            referencedRelation: "communication_webhooks"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      body_points_analytics: {
        Row: {
          aggregated_metadata: Json | null
          all_symptoms: string[] | null
          avg_pain_level: number | null
          body_region: Database["public"]["Enums"]["body_region"] | null
          body_side: Database["public"]["Enums"]["body_side"] | null
          date: string | null
          duration: unknown | null
          first_occurrence: string | null
          last_occurrence: string | null
          max_pain_level: number | null
          min_pain_level: number | null
          pain_std_dev: number | null
          pain_type: Database["public"]["Enums"]["pain_type"] | null
          patient_id: string | null
          point_count: number | null
          unique_symptoms_count: number | null
        }
        Relationships: []
      }
      body_points_performance_stats: {
        Row: {
          active_records: number | null
          avg_pain_level: number | null
          deleted_records: number | null
          records_last_24h: number | null
          records_last_7d: number | null
          table_name: string | null
          table_size: string | null
        }
        Relationships: []
      }
      checkin_analytics_summary: {
        Row: {
          avg_actual_wait: number | null
          avg_confidence: number | null
          avg_estimated_wait: number | null
          date: string | null
          face_recognition_count: number | null
          failed_checkins: number | null
          manual_search_count: number | null
          total_checkins: number | null
        }
        Relationships: []
      }
      communication_dashboard: {
        Row: {
          channel: Database["public"]["Enums"]["communication_channel"] | null
          date: string | null
          delivered_messages: number | null
          delivery_rate: number | null
          failed_messages: number | null
          message_type: Database["public"]["Enums"]["message_type"] | null
          read_messages: number | null
          read_rate: number | null
          total_messages: number | null
        }
        Relationships: []
      }
      index_usage_stats: {
        Row: {
          idx_scan: number | null
          idx_tup_fetch: number | null
          idx_tup_read: number | null
          indexname: unknown | null
          schemaname: unknown | null
          size: string | null
          tablename: unknown | null
        }
        Relationships: []
      }
      patient_dashboard_view: {
        Row: {
          last_checkin: Json | null
          latest_progress: Json | null
          name: string | null
          next_appointment: Json | null
          patient_id: string | null
          unread_messages_count: number | null
        }
        Insert: {
          last_checkin?: never
          latest_progress?: never
          name?: string | null
          next_appointment?: never
          patient_id?: string | null
          unread_messages_count?: never
        }
        Update: {
          last_checkin?: never
          latest_progress?: never
          name?: string | null
          next_appointment?: never
          patient_id?: string | null
          unread_messages_count?: never
        }
        Relationships: []
      }
      rls_policy_stats: {
        Row: {
          policies: string | null
          policy_count: number | null
          schemaname: unknown | null
          tablename: unknown | null
        }
        Relationships: []
      }
      supplier_performance_analytics: {
        Row: {
          active_products: number | null
          avg_delivery_days: number | null
          cancelled_orders: number | null
          completed_order_value: number | null
          completed_orders: number | null
          contact_person: string | null
          delivery_time_days: number | null
          email: string | null
          last_order_date: string | null
          overdue_orders: number | null
          performance_rating: string | null
          phone: string | null
          supplier_id: string | null
          supplier_name: string | null
          total_order_value: number | null
          total_orders: number | null
          total_products: number | null
        }
        Relationships: []
      }
      supply_consumption_analytics: {
        Row: {
          avg_daily_consumption_30d: number | null
          avg_monthly_consumption_90d: number | null
          category: string | null
          current_stock: number | null
          days_of_stock_remaining: number | null
          maximum_stock: number | null
          minimum_stock: number | null
          stock_status: string | null
          stock_turnover_30d: number | null
          supply_id: string | null
          supply_name: string | null
          total_consumed_30d: number | null
          total_cost_consumed: number | null
          unit_cost: number | null
          unit_of_measure: string | null
        }
        Relationships: []
      }
      task_cost_analytics: {
        Row: {
          actual_duration: number | null
          avg_cost_per_supply: number | null
          calculated_total_cost: number | null
          estimated_duration: number | null
          labor_cost: number | null
          overhead_cost: number | null
          patient_id: string | null
          patient_name: string | null
          supplies_used_count: number | null
          task_date: string | null
          task_id: string | null
          task_status: string | null
          task_title: string | null
          task_type: string | null
          therapist_id: string | null
          therapist_name: string | null
          total_quantity_used: number | null
          total_supply_cost: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      add_fk_indexes: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      analyze_query_performance: {
        Args: Record<PropertyKey, never>
        Returns: {
          calls: number
          mean_time: number
          query: string
          rows: number
          total_time: number
        }[]
      }
      calculate_exercise_adherence: {
        Args: { p_days?: number; p_patient_id: string }
        Returns: number
      }
      calculate_task_total_cost: {
        Args: { task_uuid: string }
        Returns: number
      }
      check_expiration_alerts: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      check_low_stock_alerts: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      check_overdue_orders: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      cleanup_old_calendar_jobs: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      cleanup_old_communication_data: {
        Args: { days_to_keep?: number }
        Returns: number
      }
      consolidate_rls_policies: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      create_notifications_for_alert: {
        Args: { alert_uuid: string }
        Returns: number
      }
      create_progress_snapshot: {
        Args: { p_patient_id: string }
        Returns: string
      }
      encrypt_face_encoding: {
        Args: {
          p_encoding_data: string
          p_encryption_key_id: string
          p_patient_id: string
        }
        Returns: string
      }
      find_unused_indexes: {
        Args: Record<PropertyKey, never>
        Returns: {
          indexdef: string
          indexname: string
          schemaname: string
          size_pretty: string
          tablename: string
        }[]
      }
      generate_document_hash: {
        Args: { document_content: Json }
        Returns: string
      }
      get_automation_stats: {
        Args: { end_date?: string; start_date?: string }
        Returns: {
          date: string
          executions: number
          messages_sent: number
          rule_name: string
          success_rate: number
        }[]
      }
      get_calendar_stats: {
        Args: { end_date?: string; start_date?: string }
        Returns: {
          avg_delivery_time: number
          provider_stats: Json
          success_rate: number
          total_invites_sent: number
        }[]
      }
      get_communication_metrics: {
        Args: {
          channel_filter?: Database["public"]["Enums"]["communication_channel"]
          end_date?: string
          start_date?: string
        }
        Returns: {
          channel: Database["public"]["Enums"]["communication_channel"]
          date: string
          delivery_rate: number
          total_cost: number
          total_delivered: number
          total_failed: number
          total_sent: number
        }[]
      }
      get_document_version_history: {
        Args: { doc_id: string }
        Returns: {
          created_at: string
          created_by: string
          is_signed: boolean
          version: number
        }[]
      }
      get_pain_evolution: {
        Args: { p_days_back?: number; p_patient_id: string }
        Returns: {
          avg_pain_level: number
          date: string
          max_pain_level: number
          min_pain_level: number
          point_count: number
        }[]
      }
      get_queue_stats: {
        Args: Record<PropertyKey, never>
        Returns: {
          avg_processing_time: number
          completed: number
          failed: number
          pending: number
          processing: number
        }[]
      }
      get_region_pain_distribution: {
        Args: { p_days_back?: number; p_patient_id: string }
        Returns: {
          avg_pain_level: number
          body_region: Database["public"]["Enums"]["body_region"]
          body_side: Database["public"]["Enums"]["body_side"]
          most_common_symptoms: string[]
          point_count: number
        }[]
      }
      get_unread_message_count: {
        Args: { p_patient_id: string }
        Returns: number
      }
      gtrgm_compress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_decompress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_options: {
        Args: { "": unknown }
        Returns: undefined
      }
      gtrgm_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      restore_body_point: {
        Args: { p_point_id: string }
        Returns: boolean
      }
      run_alert_checks: {
        Args: Record<PropertyKey, never>
        Returns: {
          alerts_created: number
          check_type: string
          execution_time: unknown
        }[]
      }
      set_limit: {
        Args: { "": number }
        Returns: number
      }
      show_limit: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      show_trgm: {
        Args: { "": string }
        Returns: string[]
      }
      soft_delete_body_point: {
        Args: { p_deleted_by?: string; p_point_id: string }
        Returns: boolean
      }
      validate_document_integrity: {
        Args: { doc_id: string; expected_hash: string }
        Returns: boolean
      }
    }
    Enums: {
      automation_action_type:
        | "send_message"
        | "schedule_message"
        | "update_patient"
        | "log_event"
        | "webhook"
        | "conditional"
        | "delay"
      automation_trigger_type: "appointment" | "patient" | "payment" | "system"
      body_region:
        | "cervical"
        | "thoracic"
        | "lumbar"
        | "sacral"
        | "shoulder"
        | "elbow"
        | "wrist"
        | "hip"
        | "knee"
        | "ankle"
        | "head"
        | "other"
      body_side: "front" | "back"
      calendar_integration_status:
        | "pending"
        | "sent"
        | "delivered"
        | "failed"
        | "cancelled"
      calendar_provider: "google" | "outlook" | "apple" | "ics"
      communication_channel: "email" | "sms" | "whatsapp" | "push"
      message_status:
        | "draft"
        | "queued"
        | "processing"
        | "sent"
        | "delivered"
        | "read"
        | "failed"
        | "cancelled"
        | "retry_scheduled"
      message_type:
        | "appointment_confirmation"
        | "appointment_reminder"
        | "appointment_cancellation"
        | "payment_reminder"
        | "welcome"
        | "birthday_wishes"
        | "treatment_completion"
        | "no_show_followup"
        | "generic"
      pain_type: "acute" | "chronic" | "intermittent" | "constant"
      reminder_method: "email" | "popup" | "sms"
      template_category:
        | "appointment"
        | "payment"
        | "marketing"
        | "system"
        | "general"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      automation_action_type: [
        "send_message",
        "schedule_message",
        "update_patient",
        "log_event",
        "webhook",
        "conditional",
        "delay",
      ],
      automation_trigger_type: ["appointment", "patient", "payment", "system"],
      body_region: [
        "cervical",
        "thoracic",
        "lumbar",
        "sacral",
        "shoulder",
        "elbow",
        "wrist",
        "hip",
        "knee",
        "ankle",
        "head",
        "other",
      ],
      body_side: ["front", "back"],
      calendar_integration_status: [
        "pending",
        "sent",
        "delivered",
        "failed",
        "cancelled",
      ],
      calendar_provider: ["google", "outlook", "apple", "ics"],
      communication_channel: ["email", "sms", "whatsapp", "push"],
      message_status: [
        "draft",
        "queued",
        "processing",
        "sent",
        "delivered",
        "read",
        "failed",
        "cancelled",
        "retry_scheduled",
      ],
      message_type: [
        "appointment_confirmation",
        "appointment_reminder",
        "appointment_cancellation",
        "payment_reminder",
        "welcome",
        "birthday_wishes",
        "treatment_completion",
        "no_show_followup",
        "generic",
      ],
      pain_type: ["acute", "chronic", "intermittent", "constant"],
      reminder_method: ["email", "popup", "sms"],
      template_category: [
        "appointment",
        "payment",
        "marketing",
        "system",
        "general",
      ],
    },
  },
} as const

