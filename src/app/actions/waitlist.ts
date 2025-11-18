// src/app/actions/waitlist.ts
"use server";

import { createClient } from '@supabase/supabase-js';

interface AddPatientToWaitlistResult {
  success: boolean;
  message: string;
  waitlistEntryId?: string;
  error?: string;
}

export async function addPatientToWaitlist(
  patientId: string,
  priority: 'Urgente' | 'Alta' | 'Normal' = 'Normal'
): Promise<AddPatientToWaitlistResult> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Credenciais do Supabase não configuradas');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verificar se o paciente já está na lista de espera
    const { data: existingEntry, error: fetchError } = await supabase
      .from('waitlist')
      .select('id')
      .eq('patient_id', patientId)
      .eq('status', 'Ativo')
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 means no rows found
      console.error('[addPatientToWaitlist] Erro ao verificar paciente na lista de espera:', fetchError.message);
      return { success: false, message: 'Erro ao verificar lista de espera.' };
    }

    if (existingEntry) {
      return { success: false, message: 'Paciente já está na lista de espera ativa.' };
    }

    const { data, error: insertError } = await supabase
      .from('waitlist')
      .insert({ patient_id: patientId, priority, status: 'Ativo' })
      .select('id')
      .single();

    if (insertError) {
      console.error('[addPatientToWaitlist] Erro ao adicionar paciente à lista de espera:', insertError.message);
      return { success: false, message: 'Erro ao adicionar paciente à lista de espera.' };
    }

    return {
      success: true,
      message: 'Paciente adicionado à lista de espera com sucesso.',
      waitlistEntryId: data.id,
    };
  } catch (error) {
    console.error('[addPatientToWaitlist] Erro fatal:', error);
    return {
      success: false,
      message: 'Ocorreu um erro inesperado ao adicionar paciente à lista de espera.',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

interface ProcessPatientWaitlistResponseResult {
  success: boolean;
  message: string;
  error?: string;
}

export async function processPatientWaitlistResponse(
  waitlistEntryId: string,
  response: 'accept' | 'decline'
): Promise<ProcessPatientWaitlistResponseResult> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Credenciais do Supabase não configuradas');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: entry, error: fetchError } = await supabase
      .from('waitlist')
      .select('id, patient_id, status')
      .eq('id', waitlistEntryId)
      .single();

    if (fetchError) {
      console.error('[processPatientWaitlistResponse] Erro ao buscar entrada da lista de espera:', fetchError.message);
      return { success: false, message: 'Entrada da lista de espera não encontrada.' };
    }

    if (entry.status !== 'Notificado') {
      return { success: false, message: `Resposta inválida. Status atual: ${entry.status}.` };
    }

    if (response === 'accept') {
      // TODO: Lógica para agendar a consulta e remover da lista de espera
      // Por enquanto, apenas marca como preenchido
      const { error: updateError } = await supabase
        .from('waitlist')
        .update({ status: 'Preenchido' })
        .eq('id', waitlistEntryId);

      if (updateError) {
        console.error('[processPatientWaitlistResponse] Erro ao marcar entrada como preenchida:', updateError.message);
        return { success: false, message: 'Erro ao processar aceitação.' };
      }
      return { success: true, message: 'Vaga aceita e processada com sucesso.' };
    } else { // response === 'decline'
      // TODO: Lógica para oferecer a vaga ao próximo paciente
      const { error: updateError } = await supabase
        .from('waitlist')
        .update({ status: 'Expirado' }) // Marca como expirado para que o matching possa encontrar o próximo
        .eq('id', waitlistEntryId);

      if (updateError) {
        console.error('[processPatientWaitlistResponse] Erro ao marcar entrada como recusada:', updateError.message);
        return { success: false, message: 'Erro ao processar recusa.' };
      }
      return { success: true, message: 'Vaga recusada e processada com sucesso.' };
    }
  } catch (error) {
    console.error('[processPatientWaitlistResponse] Erro fatal:', error);
    return {
      success: false,
      message: 'Ocorreu um erro inesperado ao processar a resposta do paciente.',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
