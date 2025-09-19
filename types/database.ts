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
      users: {
        Row: {
          id: string
          email: string
          full_name: string
          phone: string | null
          role: 'admin' | 'therapist' | 'receptionist' | 'patient'
          specialization: string | null
          professional_id: string | null
          active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name: string
          phone?: string | null
          role: 'admin' | 'therapist' | 'receptionist' | 'patient'
          specialization?: string | null
          professional_id?: string | null
          active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          phone?: string | null
          role?: 'admin' | 'therapist' | 'receptionist' | 'patient'
          specialization?: string | null
          professional_id?: string | null
          active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      patients: {
        Row: {
          id: string
          user_id: string | null
          full_name: string
          email: string
          phone: string
          cpf: string
          birth_date: string
          gender: 'male' | 'female' | 'other' | null
          address_street: string | null
          address_number: string | null
          address_complement: string | null
          address_neighborhood: string | null
          address_city: string | null
          address_state: string | null
          address_zip_code: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          emergency_contact_relationship: string | null
          medical_history: string[] | null
          allergies: string[] | null
          medications: string[] | null
          blood_type: string | null
          insurance_provider: string | null
          insurance_plan: string | null
          insurance_number: string | null
          insurance_validity: string | null
          occupation: string | null
          referred_by: string | null
          observations: string | null
          status: 'active' | 'inactive' | 'archived'
          created_at: string
          updated_at: string
          created_by: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          full_name: string
          email: string
          phone: string
          cpf: string
          birth_date: string
          gender?: 'male' | 'female' | 'other' | null
          address_street?: string | null
          address_number?: string | null
          address_complement?: string | null
          address_neighborhood?: string | null
          address_city?: string | null
          address_state?: string | null
          address_zip_code?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          emergency_contact_relationship?: string | null
          medical_history?: string[] | null
          allergies?: string[] | null
          medications?: string[] | null
          blood_type?: string | null
          insurance_provider?: string | null
          insurance_plan?: string | null
          insurance_number?: string | null
          insurance_validity?: string | null
          occupation?: string | null
          referred_by?: string | null
          observations?: string | null
          status?: 'active' | 'inactive' | 'archived'
          created_at?: string
          updated_at?: string
          created_by?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          full_name?: string
          email?: string
          phone?: string
          cpf?: string
          birth_date?: string
          gender?: 'male' | 'female' | 'other' | null
          address_street?: string | null
          address_number?: string | null
          address_complement?: string | null
          address_neighborhood?: string | null
          address_city?: string | null
          address_state?: string | null
          address_zip_code?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          emergency_contact_relationship?: string | null
          medical_history?: string[] | null
          allergies?: string[] | null
          medications?: string[] | null
          blood_type?: string | null
          insurance_provider?: string | null
          insurance_plan?: string | null
          insurance_number?: string | null
          insurance_validity?: string | null
          occupation?: string | null
          referred_by?: string | null
          observations?: string | null
          status?: 'active' | 'inactive' | 'archived'
          created_at?: string
          updated_at?: string
          created_by?: string | null
        }
      }
      appointments: {
        Row: {
          id: string
          patient_id: string
          therapist_id: string
          appointment_date: string
          start_time: string
          end_time: string
          appointment_type: 'evaluation' | 'session' | 'return' | 'group'
          room: string | null
          is_online: boolean
          online_link: string | null
          status: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show'
          chief_complaint: string | null
          notes: string | null
          cancelled_at: string | null
          cancellation_reason: string | null
          cancelled_by: string | null
          price: number | null
          insurance_covered: boolean
          insurance_authorization: string | null
          reminder_sent: boolean
          reminder_sent_at: string | null
          created_at: string
          updated_at: string
          created_by: string | null
        }
        Insert: {
          id?: string
          patient_id: string
          therapist_id: string
          appointment_date: string
          start_time: string
          end_time: string
          appointment_type: 'evaluation' | 'session' | 'return' | 'group'
          room?: string | null
          is_online?: boolean
          online_link?: string | null
          status?: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show'
          chief_complaint?: string | null
          notes?: string | null
          cancelled_at?: string | null
          cancellation_reason?: string | null
          cancelled_by?: string | null
          price?: number | null
          insurance_covered?: boolean
          insurance_authorization?: string | null
          reminder_sent?: boolean
          reminder_sent_at?: string | null
          created_at?: string
          updated_at?: string
          created_by?: string | null
        }
        Update: {
          id?: string
          patient_id?: string
          therapist_id?: string
          appointment_date?: string
          start_time?: string
          end_time?: string
          appointment_type?: 'evaluation' | 'session' | 'return' | 'group'
          room?: string | null
          is_online?: boolean
          online_link?: string | null
          status?: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show'
          chief_complaint?: string | null
          notes?: string | null
          cancelled_at?: string | null
          cancellation_reason?: string | null
          cancelled_by?: string | null
          price?: number | null
          insurance_covered?: boolean
          insurance_authorization?: string | null
          reminder_sent?: boolean
          reminder_sent_at?: string | null
          created_at?: string
          updated_at?: string
          created_by?: string | null
        }
      }
      sessions: {
        Row: {
          id: string
          appointment_id: string
          procedures_performed: string | null
          pain_level_before: number | null
          pain_level_after: number | null
          objective_assessment: string | null
          treatment_performed: string | null
          patient_response: string | null
          progress_notes: string | null
          next_session_notes: string | null
          exercises_prescribed: string | null
          homework: string | null
          range_of_motion: Json | null
          strength_tests: Json | null
          functional_tests: Json | null
          created_at: string
          updated_at: string
          created_by: string | null
        }
        Insert: {
          id?: string
          appointment_id: string
          procedures_performed?: string | null
          pain_level_before?: number | null
          pain_level_after?: number | null
          objective_assessment?: string | null
          treatment_performed?: string | null
          patient_response?: string | null
          progress_notes?: string | null
          next_session_notes?: string | null
          exercises_prescribed?: string | null
          homework?: string | null
          range_of_motion?: Json | null
          strength_tests?: Json | null
          functional_tests?: Json | null
          created_at?: string
          updated_at?: string
          created_by?: string | null
        }
        Update: {
          id?: string
          appointment_id?: string
          procedures_performed?: string | null
          pain_level_before?: number | null
          pain_level_after?: number | null
          objective_assessment?: string | null
          treatment_performed?: string | null
          patient_response?: string | null
          progress_notes?: string | null
          next_session_notes?: string | null
          exercises_prescribed?: string | null
          homework?: string | null
          range_of_motion?: Json | null
          strength_tests?: Json | null
          functional_tests?: Json | null
          created_at?: string
          updated_at?: string
          created_by?: string | null
        }
      }
      pain_points: {
        Row: {
          id: string
          patient_id: string
          body_region: string
          coordinates_x: number | null
          coordinates_y: number | null
          side: 'left' | 'right' | 'center' | 'bilateral' | null
          pain_intensity: number
          pain_type: string[] | null
          pain_characteristics: string[] | null
          description: string
          triggers: string[] | null
          relief_methods: string[] | null
          frequency: 'constant' | 'frequent' | 'occasional' | 'rare' | null
          duration: string | null
          start_date: string
          end_date: string | null
          status: 'active' | 'improving' | 'stable' | 'worsening' | 'resolved'
          notes: string | null
          related_diagnosis: string | null
          created_at: string
          updated_at: string
          created_by: string | null
        }
        Insert: {
          id?: string
          patient_id: string
          body_region: string
          coordinates_x?: number | null
          coordinates_y?: number | null
          side?: 'left' | 'right' | 'center' | 'bilateral' | null
          pain_intensity: number
          pain_type?: string[] | null
          pain_characteristics?: string[] | null
          description: string
          triggers?: string[] | null
          relief_methods?: string[] | null
          frequency?: 'constant' | 'frequent' | 'occasional' | 'rare' | null
          duration?: string | null
          start_date: string
          end_date?: string | null
          status?: 'active' | 'improving' | 'stable' | 'worsening' | 'resolved'
          notes?: string | null
          related_diagnosis?: string | null
          created_at?: string
          updated_at?: string
          created_by?: string | null
        }
        Update: {
          id?: string
          patient_id?: string
          body_region?: string
          coordinates_x?: number | null
          coordinates_y?: number | null
          side?: 'left' | 'right' | 'center' | 'bilateral' | null
          pain_intensity?: number
          pain_type?: string[] | null
          pain_characteristics?: string[] | null
          description?: string
          triggers?: string[] | null
          relief_methods?: string[] | null
          frequency?: 'constant' | 'frequent' | 'occasional' | 'rare' | null
          duration?: string | null
          start_date?: string
          end_date?: string | null
          status?: 'active' | 'improving' | 'stable' | 'worsening' | 'resolved'
          notes?: string | null
          related_diagnosis?: string | null
          created_at?: string
          updated_at?: string
          created_by?: string | null
        }
      }
      exercises: {
        Row: {
          id: string
          name: string
          description: string
          category: string
          difficulty_level: number | null
          video_url: string | null
          image_urls: string[] | null
          instructions: string
          contraindications: string | null
          equipment_needed: string[] | null
          default_sets: number
          default_repetitions: number | null
          default_duration_seconds: number | null
          default_rest_seconds: number
          tags: string[] | null
          target_muscles: string[] | null
          benefits: string[] | null
          created_at: string
          updated_at: string
          created_by: string | null
          active: boolean
          usage_count: number
          average_rating: number | null
        }
        Insert: {
          id?: string
          name: string
          description: string
          category: string
          difficulty_level?: number | null
          video_url?: string | null
          image_urls?: string[] | null
          instructions: string
          contraindications?: string | null
          equipment_needed?: string[] | null
          default_sets?: number
          default_repetitions?: number | null
          default_duration_seconds?: number | null
          default_rest_seconds?: number
          tags?: string[] | null
          target_muscles?: string[] | null
          benefits?: string[] | null
          created_at?: string
          updated_at?: string
          created_by?: string | null
          active?: boolean
          usage_count?: number
          average_rating?: number | null
        }
        Update: {
          id?: string
          name?: string
          description?: string
          category?: string
          difficulty_level?: number | null
          video_url?: string | null
          image_urls?: string[] | null
          instructions?: string
          contraindications?: string | null
          equipment_needed?: string[] | null
          default_sets?: number
          default_repetitions?: number | null
          default_duration_seconds?: number | null
          default_rest_seconds?: number
          tags?: string[] | null
          target_muscles?: string[] | null
          benefits?: string[] | null
          created_at?: string
          updated_at?: string
          created_by?: string | null
          active?: boolean
          usage_count?: number
          average_rating?: number | null
        }
      }
      financial_transactions: {
        Row: {
          id: string
          transaction_type: 'payment' | 'refund' | 'adjustment' | 'insurance_claim' | 'insurance_payment'
          amount: number
          currency: string
          description: string
          patient_id: string
          appointment_id: string | null
          invoice_id: string | null
          insurance_claim_id: string | null
          payment_method: 'cash' | 'credit_card' | 'debit_card' | 'pix' | 'bank_transfer' | 'check' | 'insurance' | 'voucher' | null
          payment_date: string | null
          due_date: string | null
          status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'refunded'
          reference_number: string | null
          receipt_number: string | null
          created_at: string
          updated_at: string
          created_by: string | null
          notes: string | null
          metadata: Json | null
        }
        Insert: {
          id?: string
          transaction_type: 'payment' | 'refund' | 'adjustment' | 'insurance_claim' | 'insurance_payment'
          amount: number
          currency?: string
          description: string
          patient_id: string
          appointment_id?: string | null
          invoice_id?: string | null
          insurance_claim_id?: string | null
          payment_method?: 'cash' | 'credit_card' | 'debit_card' | 'pix' | 'bank_transfer' | 'check' | 'insurance' | 'voucher' | null
          payment_date?: string | null
          due_date?: string | null
          status?: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'refunded'
          reference_number?: string | null
          receipt_number?: string | null
          created_at?: string
          updated_at?: string
          created_by?: string | null
          notes?: string | null
          metadata?: Json | null
        }
        Update: {
          id?: string
          transaction_type?: 'payment' | 'refund' | 'adjustment' | 'insurance_claim' | 'insurance_payment'
          amount?: number
          currency?: string
          description?: string
          patient_id?: string
          appointment_id?: string | null
          invoice_id?: string | null
          insurance_claim_id?: string | null
          payment_method?: 'cash' | 'credit_card' | 'debit_card' | 'pix' | 'bank_transfer' | 'check' | 'insurance' | 'voucher' | null
          payment_date?: string | null
          due_date?: string | null
          status?: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'refunded'
          reference_number?: string | null
          receipt_number?: string | null
          created_at?: string
          updated_at?: string
          created_by?: string | null
          notes?: string | null
          metadata?: Json | null
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string | null
          patient_id: string | null
          title: string
          message: string
          notification_type: 'appointment_reminder' | 'appointment_confirmation' | 'appointment_cancellation' | 'exercise_reminder' | 'payment_reminder' | 'system' | 'marketing'
          channel: 'email' | 'sms' | 'whatsapp' | 'push' | 'in_app' | null
          status: 'pending' | 'sent' | 'delivered' | 'failed' | 'cancelled'
          read: boolean
          appointment_id: string | null
          invoice_id: string | null
          scheduled_for: string | null
          sent_at: string | null
          delivered_at: string | null
          read_at: string | null
          created_at: string
          created_by: string | null
          metadata: Json | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          patient_id?: string | null
          title: string
          message: string
          notification_type: 'appointment_reminder' | 'appointment_confirmation' | 'appointment_cancellation' | 'exercise_reminder' | 'payment_reminder' | 'system' | 'marketing'
          channel?: 'email' | 'sms' | 'whatsapp' | 'push' | 'in_app' | null
          status?: 'pending' | 'sent' | 'delivered' | 'failed' | 'cancelled'
          read?: boolean
          appointment_id?: string | null
          invoice_id?: string | null
          scheduled_for?: string | null
          sent_at?: string | null
          delivered_at?: string | null
          read_at?: string | null
          created_at?: string
          created_by?: string | null
          metadata?: Json | null
        }
        Update: {
          id?: string
          user_id?: string | null
          patient_id?: string | null
          title?: string
          message?: string
          notification_type?: 'appointment_reminder' | 'appointment_confirmation' | 'appointment_cancellation' | 'exercise_reminder' | 'payment_reminder' | 'system' | 'marketing'
          channel?: 'email' | 'sms' | 'whatsapp' | 'push' | 'in_app' | null
          status?: 'pending' | 'sent' | 'delivered' | 'failed' | 'cancelled'
          read?: boolean
          appointment_id?: string | null
          invoice_id?: string | null
          scheduled_for?: string | null
          sent_at?: string | null
          delivered_at?: string | null
          read_at?: string | null
          created_at?: string
          created_by?: string | null
          metadata?: Json | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_age: {
        Args: {
          birth_date: string
        }
        Returns: number
      }
      check_appointment_conflict: {
        Args: {
          p_therapist_id: string
          p_date: string
          p_start_time: string
          p_end_time: string
          p_room?: string
          p_exclude_id?: string
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
      [_ in never]: never
    }
  }
}