/**
 * Tipos Estendidos para Pacientes
 *
 * Este arquivo contém tipos que estendem o schema base do Supabase
 * para incluir propriedades que são usadas no código mas não estão
 * refletidas no schema gerado automaticamente.
 *
 * TODO: Atualizar schema do Supabase para incluir estas propriedades
 * e então este arquivo pode ser removido.
 */

import { Database, Json } from './database.types';

// Tipo base da tabela patients
export type PatientBase = Database['public']['Tables']['patients']['Row'];

// Endereço do paciente (armazenado como JSONB ou campos separados)
export interface PatientAddress extends Record<string, Json | undefined> {
  street?: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  zipcode?: string;
  country?: string;
}

// Contato de emergência
export interface EmergencyContact extends Record<string, Json | undefined> {
  name?: string;
  phone?: string;
  relationship?: string;
  email?: string;
}

// Tipo estendido com todas as propriedades usadas no código
export interface PatientExtended extends Omit<PatientBase, 'name' | 'status'> {
  // Informações Pessoais Adicionais
  full_name: string; // From patient_insights_summary view

  // Contatos Adicionais
  whatsapp?: string | null;            // Número do WhatsApp

  // Status
  status: 'active' | 'inactive' | 'archived' | 'ativo' | 'inativo' | null;

  // Campos que podem vir de joins ou computed
  age?: number | null;                 // Idade calculada
  last_appointment?: string | null;    // Data do último agendamento
  next_appointment?: string | null;    // Próximo agendamento
  total_sessions?: number | null;      // Total de sessões realizadas
}

// Type guards
export function isPatientExtended(patient: unknown): patient is PatientExtended {
  return (
    typeof patient === 'object' &&
    patient !== null &&
    'id' in patient &&
    'full_name' in patient // Changed 'name' to 'full_name'
  );
}

// Helper para converter PatientBase em PatientExtended de forma segura
export function toPatientExtended(patient: PatientBase | unknown): PatientExtended {
  if (!patient || typeof patient !== 'object') {
    throw new Error('Invalid patient object');
  }

  return patient as PatientExtended;
}

// Tipo para criação de paciente (Insert)
export type PatientInsert = Database['public']['Tables']['patients']['Insert'];

// Tipo para atualização de paciente (Update)
export type PatientUpdate = Database['public']['Tables']['patients']['Update'];

// Tipo para listagem de pacientes (pode incluir dados agregados)
export interface PatientListItem extends PatientExtended {
  appointment_count?: number;
  last_session_date?: string;
  therapist_name?: string;
}

// Tipo para detalhes completos do paciente (com relações)
export interface PatientDetails extends PatientExtended {
  appointments?: unknown[];     // TODO: Tipar appointments
  sessions?: unknown[];         // TODO: Tipar sessions
  goals?: unknown[];            // TODO: Tipar goals
  pathologies?: unknown[];      // TODO: Tipar pathologies
  surgeries?: unknown[];        // TODO: Tipar surgeries
}

// Export de tipos auxiliares
export type PatientStatus = NonNullable<PatientExtended['status']>;
// Removed PatientGender and MaritalStatus as they are no longer in PatientExtended
// export type PatientGender = NonNullable<PatientExtended['gender']>;
// export type MaritalStatus = NonNullable<PatientExtended['marital_status']>;
