'use server';

import { createServerComponentClient } from '~/lib/supabase/server';
import { validateCPF } from '~/lib/utils/validation';
import { revalidatePath, revalidateTag } from 'next/cache';
import type { Database } from '~/types/database.types';
import { SupabaseClient } from '@supabase/supabase-js';

type PatientInsert = Database['public']['Tables']['patients']['Insert'];
type PatientUpdate = Database['public']['Tables']['patients']['Update'];

export interface CreatePatientData {
  full_name: string;
  email: string;
  phone: string;
  cpf?: string;
  birth_date: string;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  address?: {
    street?: string;
    number?: string;
    complement?: string;
    neighborhood?: string;
    city?: string;
    state?: string;
    zipcode?: string;
  };
  emergency_contact?: {
    name?: string;
    phone?: string;
    relationship?: string;
  };
  notes?: string;
}

export interface UpdatePatientData extends Partial<CreatePatientData> {
  id: string;
}

/**
 * Cria um novo paciente
 */
export async function createPatient(data: CreatePatientData) {
  const supabase = await createServerComponentClient();

  // Valida CPF se fornecido
  if (data.cpf) {
    const cleanCPF = data.cpf.replace(/\D/g, '');
    if (!validateCPF(cleanCPF)) {
      return { error: 'CPF inválido' };
    }

    // Verifica se CPF já existe
    const { data: existing } = await supabase
      .from('patients')
      .select('id')
      .eq('cpf', cleanCPF)
      .is('deleted_at', null)
      .single();

    if (existing) {
      return { error: 'CPF já cadastrado' };
    }
  }

  // Verifica se email já existe
  if (data.email) {
    const { data: existing } = await supabase
      .from('patients')
      .select('id')
      .eq('email', data.email)
      .is('deleted_at', null)
      .single();

    if (existing) {
      return { error: 'Email já cadastrado' };
    }
  }

  // Obtém usuário atual
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const patientData: PatientInsert = {
    full_name: data.full_name,
    email: data.email,
    phone: data.phone,
    // whatsapp: data.whatsapp || data.phone, // Campo não existe na tabela patients
    cpf: data.cpf?.replace(/\D/g, ''),
    birth_date: data.birth_date,
    gender: data.gender,
    // marital_status: data.marital_status, // Campo não existe na tabela patients
    // rg: data.rg, // Campo não existe na tabela patients
    address: data.address || {},
    // occupation: data.occupation, // Campo não existe na tabela patients
    emergency_contact: data.emergency_contact || {},
    // photo_url: data.photo_url, // Campo não existe na tabela patients
    // patient_origin: data.patient_origin, // Campo não existe na tabela patients
    notes: data.notes,
    created_by: user?.id,
  };

  const { data: patient, error } = await supabase
    .from('patients')
    .insert(patientData)
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/dashboard/pacientes');
  revalidateTag('patients');
  revalidateTag('patients:stats');
  return { data: patient };
}

/**
 * Atualiza um paciente existente
 */
export async function updatePatient(data: UpdatePatientData) {
  const supabase = await createServerComponentClient();

  // Valida CPF se fornecido
  if (data.cpf) {
    const cleanCPF = data.cpf.replace(/\D/g, '');
    if (!validateCPF(cleanCPF)) {
      return { error: 'CPF inválido' };
    }

    // Verifica se CPF já existe em outro paciente
    const { data: existing } = await supabase
      .from('patients')
      .select('id')
      .eq('cpf', cleanCPF)
      .neq('id', data.id)
      .is('deleted_at', null)
      .single();

    if (existing) {
      return { error: 'CPF já cadastrado para outro paciente' };
    }
  }

  // Obtém usuário atual
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const updateData: PatientUpdate = {
    full_name: data.full_name,
    email: data.email,
    phone: data.phone,
      // whatsapp: data.whatsapp, // Campo não existe na tabela patients
    cpf: data.cpf?.replace(/\D/g, ''),
    birth_date: data.birth_date,
    gender: data.gender,
    // marital_status: data.marital_status, // Campo não existe na tabela patients
    // rg: data.rg, // Campo não existe na tabela patients
    address: data.address,
    // occupation: data.occupation, // Campo não existe na tabela patients
    emergency_contact: data.emergency_contact,
    // photo_url: data.photo_url, // Campo não existe na tabela patients
    // patient_origin: data.patient_origin, // Campo não existe na tabela patients
    notes: data.notes,
    // updated_by: user?.id, // Campo não existe na tabela patients
  };

  const { data: patient, error } = await supabase
    .from('patients')
    .update(updateData)
    .eq('id', data.id)
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/dashboard/pacientes');
  revalidatePath(`/dashboard/pacientes/${data.id}`);
  revalidateTag('patients');
  revalidateTag(`patients:${data.id}`);
  revalidateTag('patients:stats');
  return { data: patient };
}

/**
 * Deleta um paciente (soft delete)
 */
export async function deletePatient(id: string) {
  const supabase = await createServerComponentClient();

  const { error } = await supabase
    .from('patients')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/dashboard/pacientes');
  revalidateTag('patients');
  revalidateTag(`patients:${id}`);
  revalidateTag('patients:stats');
  return { success: true };
}

/**
 * Busca pacientes com filtros
 */
export async function getPatients(filters?: {
  search?: string;
  status?: string;
  limit?: number;
  offset?: number;
}) {
  const supabase = await createServerComponentClient();

  let query = supabase
    .from('patients')
    .select('*', { count: 'exact' })
    .is('deleted_at', null)
    .order('created_at', { ascending: false });

  if (filters?.search) {
    query = query.or(
      `full_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,phone.ilike.%${filters.search}%,cpf.ilike.%${filters.search}%`
    );
  }

  if (filters?.status) {
    query = query.eq('status', filters.status);
  }

  if (filters?.limit) {
    query = query.limit(filters.limit);
  }

  if (filters?.offset) {
    query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
  }

  const { data, error, count } = await query;

  if (error) {
    return { error: error.message };
  }

  return { data, count };
}

/**
 * Busca pacientes para autocomplete (busca rápida)
 */
export async function searchPatients(query: string, limit = 10) {
  const supabase = await createServerComponentClient();

  const { data, error } = await supabase
    .from('patients')
    .select('id, full_name, phone, email, cpf')
    .is('deleted_at', null)
    .or(
      `full_name.ilike.%${query}%,phone.ilike.%${query}%,email.ilike.%${query}%,cpf.ilike.%${query}%`
    )
    .limit(limit);

  if (error) {
    return { error: error.message, data: null };
  }

  return { data, error: null };
}

/**
 * Obtém um paciente por ID
 */
export async function getPatientById(id: string) {
  const supabase = await createServerComponentClient();

  const { data, error } = await supabase
    .from('patients')
    .select('*')
    .eq('id', id)
    .is('deleted_at', null)
    .single();

  if (error) {
    return { error: error.message };
  }

  return { data };
}

/**
 * Cria um link de pré-cadastro
 */
export async function createPreRegistrationToken(patientData: Partial<CreatePatientData>) {
  const supabase = await createServerComponentClient();

  // Gera token único usando timestamp + random
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 15);
  const token = `${timestamp}${random}`.substring(0, 32);

  const { data, error } = await supabase
    .from('patient_pre_registrations')
    .insert({
      token,
      full_name: patientData.full_name || '',
      email: patientData.email || '',
      phone: patientData.phone || '',
      cpf: patientData.cpf?.replace(/\D/g, ''),
      birth_date: patientData.birth_date,
      data: patientData,
    })
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  return { data };
}

/**
 * Valida token de pré-cadastro e completa o cadastro
 */
export async function completePreRegistration(token: string, additionalData: CreatePatientData) {
  const supabase = await createServerComponentClient();

  // Busca pré-cadastro
  const { data: preReg, error: preRegError } = await supabase
    .from('patient_pre_registrations')
    .select('*')
    .eq('token', token)
    .eq('status', 'pending')
    .single();

  if (preRegError || !preReg) {
    return { error: 'Token inválido ou expirado' };
  }

  const preRegData = preReg;

  // Verifica se expirou
  if (new Date(preRegData.expires_at) < new Date()) {
    await supabase
      .from('patient_pre_registrations')
      .update({ status: 'expired' })
      .eq('id', preRegData.id);

    return { error: 'Token expirado' };
  }

  // Cria paciente
  const result = await createPatient({
    ...(preRegData.data || {}),
    ...additionalData,
  });

  if (result.error) {
    return result;
  }

  // Atualiza pré-cadastro
  await supabase
    .from('patient_pre_registrations')
    .update({
      status: 'completed',
      patient_id: result.data?.id,
      completed_at: new Date().toISOString(),
    })
    .eq('id', preRegData.id);

  return result;
}