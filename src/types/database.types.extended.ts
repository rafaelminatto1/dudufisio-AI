/**
 * Tipos TypeScript COMPLEMENTARES - Gamification, Communications, Patient Portal
 * PARTE 2 das migrations do Supabase (005, 006, 007)
 */

import { Json } from './database.types';

// Tipos adicionais para complementar database.types.ts
export interface DatabaseExtended {
  public: {
    Tables: {
      // ========================================
      // GAMIFICATION SYSTEM (005)
      // ========================================
      gamification_points: {
        Row: {
          id: string;
          patient_id: string;
          points_earned: number;
          points_type: 'sessao' | 'meta' | 'exercicio' | 'feedback' | 'sem_faltas' | 'bonus' | 'outros';
          source_type: string | null;
          source_id: string | null;
          description: string;
          multiplier: number;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          patient_id: string;
          points_earned: number;
          points_type: 'sessao' | 'meta' | 'exercicio' | 'feedback' | 'sem_faltas' | 'bonus' | 'outros';
          source_type?: string | null;
          source_id?: string | null;
          description: string;
          multiplier?: number;
          metadata?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          patient_id?: string;
          points_earned?: number;
          points_type?: 'sessao' | 'meta' | 'exercicio' | 'feedback' | 'sem_faltas' | 'bonus' | 'outros';
          source_type?: string | null;
          source_id?: string | null;
          description?: string;
          multiplier?: number;
          metadata?: Json;
          created_at?: string;
        };
      };
      badges: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string;
          icon_url: string | null;
          icon_name: string | null;
          color: string;
          rarity: 'comum' | 'raro' | 'epico' | 'lendario';
          criteria: Json;
          points_reward: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description: string;
          icon_url?: string | null;
          icon_name?: string | null;
          color?: string;
          rarity?: 'comum' | 'raro' | 'epico' | 'lendario';
          criteria: Json;
          points_reward?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          description?: string;
          icon_url?: string | null;
          icon_name?: string | null;
          color?: string;
          rarity?: 'comum' | 'raro' | 'epico' | 'lendario';
          criteria?: Json;
          points_reward?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      patient_badges: {
        Row: {
          id: string;
          patient_id: string;
          badge_id: string;
          awarded_at: string;
          progress_at_award: Json | null;
          is_visible: boolean;
          is_featured: boolean;
        };
        Insert: {
          id?: string;
          patient_id: string;
          badge_id: string;
          awarded_at?: string;
          progress_at_award?: Json | null;
          is_visible?: boolean;
          is_featured?: boolean;
        };
        Update: {
          id?: string;
          patient_id?: string;
          badge_id?: string;
          awarded_at?: string;
          progress_at_award?: Json | null;
          is_visible?: boolean;
          is_featured?: boolean;
        };
      };
      achievements: {
        Row: {
          id: string;
          name: string;
          description: string;
          category: 'tratamento' | 'frequencia' | 'progresso' | 'social' | 'especial' | null;
          requirements: Json;
          xp_reward: number;
          badge_id: string | null;
          voucher_reward: string | null;
          icon_name: string | null;
          color: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description: string;
          category?: 'tratamento' | 'frequencia' | 'progresso' | 'social' | 'especial' | null;
          requirements: Json;
          xp_reward?: number;
          badge_id?: string | null;
          voucher_reward?: string | null;
          icon_name?: string | null;
          color?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string;
          category?: 'tratamento' | 'frequencia' | 'progresso' | 'social' | 'especial' | null;
          requirements?: Json;
          xp_reward?: number;
          badge_id?: string | null;
          voucher_reward?: string | null;
          icon_name?: string | null;
          color?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      patient_achievements: {
        Row: {
          id: string;
          patient_id: string;
          achievement_id: string;
          progress: Json;
          progress_percentage: number;
          completed: boolean;
          completed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          patient_id: string;
          achievement_id: string;
          progress?: Json;
          progress_percentage?: number;
          completed?: boolean;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          patient_id?: string;
          achievement_id?: string;
          progress?: Json;
          progress_percentage?: number;
          completed?: boolean;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      vouchers: {
        Row: {
          id: string;
          name: string;
          description: string;
          voucher_type: 'desconto_sessao' | 'sessao_gratis' | 'produto' | 'servico' | 'upgrade';
          xp_cost: number;
          discount_percentage: number | null;
          discount_amount: number | null;
          free_sessions: number | null;
          stock_quantity: number | null;
          max_per_patient: number;
          valid_from: string | null;
          valid_until: string | null;
          validity_days: number | null;
          restrictions: Json;
          image_url: string | null;
          color: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description: string;
          voucher_type: 'desconto_sessao' | 'sessao_gratis' | 'produto' | 'servico' | 'upgrade';
          xp_cost: number;
          discount_percentage?: number | null;
          discount_amount?: number | null;
          free_sessions?: number | null;
          stock_quantity?: number | null;
          max_per_patient?: number;
          valid_from?: string | null;
          valid_until?: string | null;
          validity_days?: number | null;
          restrictions?: Json;
          image_url?: string | null;
          color?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string;
          voucher_type?: 'desconto_sessao' | 'sessao_gratis' | 'produto' | 'servico' | 'upgrade';
          xp_cost?: number;
          discount_percentage?: number | null;
          discount_amount?: number | null;
          free_sessions?: number | null;
          stock_quantity?: number | null;
          max_per_patient?: number;
          valid_from?: string | null;
          valid_until?: string | null;
          validity_days?: number | null;
          restrictions?: Json;
          image_url?: string | null;
          color?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      voucher_redemptions: {
        Row: {
          id: string;
          voucher_id: string;
          patient_id: string;
          redeemed_at: string;
          xp_spent: number;
          status: 'disponivel' | 'usado' | 'expirado' | 'cancelado';
          used_at: string | null;
          expires_at: string | null;
          applied_to_appointment_id: string | null;
          applied_to_transaction_id: string | null;
          redemption_code: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          voucher_id: string;
          patient_id: string;
          redeemed_at?: string;
          xp_spent: number;
          status?: 'disponivel' | 'usado' | 'expirado' | 'cancelado';
          used_at?: string | null;
          expires_at?: string | null;
          applied_to_appointment_id?: string | null;
          applied_to_transaction_id?: string | null;
          redemption_code?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          voucher_id?: string;
          patient_id?: string;
          redeemed_at?: string;
          xp_spent?: number;
          status?: 'disponivel' | 'usado' | 'expirado' | 'cancelado';
          used_at?: string | null;
          expires_at?: string | null;
          applied_to_appointment_id?: string | null;
          applied_to_transaction_id?: string | null;
          redemption_code?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      leaderboard: {
        Row: {
          id: string;
          patient_id: string;
          period_type: 'semanal' | 'mensal' | 'anual' | 'all_time';
          period_start: string;
          period_end: string;
          total_xp: number;
          rank: number | null;
          badges_earned: number;
          achievements_completed: number;
          sessions_completed: number;
          goals_achieved: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          patient_id: string;
          period_type: 'semanal' | 'mensal' | 'anual' | 'all_time';
          period_start: string;
          period_end: string;
          total_xp?: number;
          rank?: number | null;
          badges_earned?: number;
          achievements_completed?: number;
          sessions_completed?: number;
          goals_achieved?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          patient_id?: string;
          period_type?: 'semanal' | 'mensal' | 'anual' | 'all_time';
          period_start?: string;
          period_end?: string;
          total_xp?: number;
          rank?: number | null;
          badges_earned?: number;
          achievements_completed?: number;
          sessions_completed?: number;
          goals_achieved?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      xp_levels: {
        Row: {
          level: number;
          xp_required: number;
          title: string | null;
          color: string;
          rewards: Json;
          created_at: string;
        };
        Insert: {
          level: number;
          xp_required: number;
          title?: string | null;
          color?: string;
          rewards?: Json;
          created_at?: string;
        };
        Update: {
          level?: number;
          xp_required?: number;
          title?: string | null;
          color?: string;
          rewards?: Json;
          created_at?: string;
        };
      };
      // ========================================
      // COMMUNICATIONS SYSTEM (006)
      // ========================================
      message_templates: {
        Row: {
          id: string;
          name: string;
          template_type: 'whatsapp' | 'email' | 'sms' | 'notificacao';
          category: 'agendamento' | 'lembrete' | 'confirmacao' | 'feedback' | 'marketing' | 'inatividade' | 'aniversario' | 'promocao' | null;
          subject: string | null;
          content: string;
          variables: string[];
          whatsapp_template_name: string | null;
          whatsapp_template_id: string | null;
          whatsapp_language: string;
          whatsapp_approved: boolean;
          is_active: boolean;
          times_sent: number;
          metadata: Json;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          template_type: 'whatsapp' | 'email' | 'sms' | 'notificacao';
          category?: 'agendamento' | 'lembrete' | 'confirmacao' | 'feedback' | 'marketing' | 'inatividade' | 'aniversario' | 'promocao' | null;
          subject?: string | null;
          content: string;
          variables?: string[];
          whatsapp_template_name?: string | null;
          whatsapp_template_id?: string | null;
          whatsapp_language?: string;
          whatsapp_approved?: boolean;
          is_active?: boolean;
          times_sent?: number;
          metadata?: Json;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          template_type?: 'whatsapp' | 'email' | 'sms' | 'notificacao';
          category?: 'agendamento' | 'lembrete' | 'confirmacao' | 'feedback' | 'marketing' | 'inatividade' | 'aniversario' | 'promocao' | null;
          subject?: string | null;
          content?: string;
          variables?: string[];
          whatsapp_template_name?: string | null;
          whatsapp_template_id?: string | null;
          whatsapp_language?: string;
          whatsapp_approved?: boolean;
          is_active?: boolean;
          times_sent?: number;
          metadata?: Json;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      whatsapp_messages: {
        Row: {
          id: string;
          patient_id: string | null;
          phone_number: string;
          message: string;
          template_id: string | null;
          whatsapp_message_id: string | null;
          whatsapp_conversation_id: string | null;
          status: 'pending' | 'sent' | 'delivered' | 'read' | 'failed';
          sent_at: string | null;
          delivered_at: string | null;
          read_at: string | null;
          failed_at: string | null;
          error_message: string | null;
          error_code: string | null;
          message_type: 'text' | 'template' | 'image' | 'document' | 'video';
          media_url: string | null;
          context_type: string | null;
          context_id: string | null;
          metadata: Json;
          sent_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          patient_id?: string | null;
          phone_number: string;
          message: string;
          template_id?: string | null;
          whatsapp_message_id?: string | null;
          whatsapp_conversation_id?: string | null;
          status?: 'pending' | 'sent' | 'delivered' | 'read' | 'failed';
          sent_at?: string | null;
          delivered_at?: string | null;
          read_at?: string | null;
          failed_at?: string | null;
          error_message?: string | null;
          error_code?: string | null;
          message_type?: 'text' | 'template' | 'image' | 'document' | 'video';
          media_url?: string | null;
          context_type?: string | null;
          context_id?: string | null;
          metadata?: Json;
          sent_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          patient_id?: string | null;
          phone_number?: string;
          message?: string;
          template_id?: string | null;
          whatsapp_message_id?: string | null;
          whatsapp_conversation_id?: string | null;
          status?: 'pending' | 'sent' | 'delivered' | 'read' | 'failed';
          sent_at?: string | null;
          delivered_at?: string | null;
          read_at?: string | null;
          failed_at?: string | null;
          error_message?: string | null;
          error_code?: string | null;
          message_type?: 'text' | 'template' | 'image' | 'document' | 'video';
          media_url?: string | null;
          context_type?: string | null;
          context_id?: string | null;
          metadata?: Json;
          sent_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      email_messages: {
        Row: {
          id: string;
          patient_id: string | null;
          email_address: string;
          subject: string;
          body_html: string;
          body_text: string | null;
          template_id: string | null;
          email_service_id: string | null;
          status: 'pending' | 'sent' | 'delivered' | 'opened' | 'clicked' | 'bounced' | 'failed';
          sent_at: string | null;
          delivered_at: string | null;
          opened_at: string | null;
          clicked_at: string | null;
          bounced_at: string | null;
          failed_at: string | null;
          error_message: string | null;
          attachments: Json;
          open_count: number;
          click_count: number;
          context_type: string | null;
          context_id: string | null;
          metadata: Json;
          sent_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          patient_id?: string | null;
          email_address: string;
          subject: string;
          body_html: string;
          body_text?: string | null;
          template_id?: string | null;
          email_service_id?: string | null;
          status?: 'pending' | 'sent' | 'delivered' | 'opened' | 'clicked' | 'bounced' | 'failed';
          sent_at?: string | null;
          delivered_at?: string | null;
          opened_at?: string | null;
          clicked_at?: string | null;
          bounced_at?: string | null;
          failed_at?: string | null;
          error_message?: string | null;
          attachments?: Json;
          open_count?: number;
          click_count?: number;
          context_type?: string | null;
          context_id?: string | null;
          metadata?: Json;
          sent_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          patient_id?: string | null;
          email_address?: string;
          subject?: string;
          body_html?: string;
          body_text?: string | null;
          template_id?: string | null;
          email_service_id?: string | null;
          status?: 'pending' | 'sent' | 'delivered' | 'opened' | 'clicked' | 'bounced' | 'failed';
          sent_at?: string | null;
          delivered_at?: string | null;
          opened_at?: string | null;
          clicked_at?: string | null;
          bounced_at?: string | null;
          failed_at?: string | null;
          error_message?: string | null;
          attachments?: Json;
          open_count?: number;
          click_count?: number;
          context_type?: string | null;
          context_id?: string | null;
          metadata?: Json;
          sent_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          message: string;
          notification_type: 'info' | 'success' | 'warning' | 'error' | 'appointment' | 'message' | 'achievement' | 'system' | null;
          read: boolean;
          read_at: string | null;
          action_url: string | null;
          action_label: string | null;
          context_type: string | null;
          context_id: string | null;
          priority: 'low' | 'normal' | 'high' | 'urgent';
          expires_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          message: string;
          notification_type?: 'info' | 'success' | 'warning' | 'error' | 'appointment' | 'message' | 'achievement' | 'system' | null;
          read?: boolean;
          read_at?: string | null;
          action_url?: string | null;
          action_label?: string | null;
          context_type?: string | null;
          context_id?: string | null;
          priority?: 'low' | 'normal' | 'high' | 'urgent';
          expires_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          message?: string;
          notification_type?: 'info' | 'success' | 'warning' | 'error' | 'appointment' | 'message' | 'achievement' | 'system' | null;
          read?: boolean;
          read_at?: string | null;
          action_url?: string | null;
          action_label?: string | null;
          context_type?: string | null;
          context_id?: string | null;
          priority?: 'low' | 'normal' | 'high' | 'urgent';
          expires_at?: string | null;
          created_at?: string;
        };
      };
      // CONTINUA NO PRÓXIMO ARQUIVO PARA 007_portal_patient...
    };
  };
}

