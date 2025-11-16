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
      pacientes: {
        Row: {
          id: string
          nome: string
          email: string | null
          telefone: string | null
          cpf: string | null
          data_nascimento: string | null
          endereco: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          nome: string
          email?: string | null
          telefone?: string | null
          cpf?: string | null
          data_nascimento?: string | null
          endereco?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          nome?: string
          email?: string | null
          telefone?: string | null
          cpf?: string | null
          data_nascimento?: string | null
          endereco?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      // Adicionar mais tabelas conforme necessário
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

