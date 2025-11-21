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

interface WaitlistEntry {
  id: string;
  patient_id: string;
  priority: string;
  status: string;
  added_at: string;
  notified_at: string | null;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
  patients: {
    full_name: string;
    phone: string;
  } | null;
}

interface GetWaitlistEntriesResult {
  success: boolean;
  message: string;
  entries?: WaitlistEntry[];
  error?: string;
}

export async function getWaitlistEntries(): Promise<GetWaitlistEntriesResult> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Credenciais do Supabase não configuradas');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data, error: fetchError } = await supabase
      .from('waitlist')
      .select(`
        id,
        patient_id,
        priority,
        status,
        added_at,
        notified_at,
        expires_at,
        created_at,
        updated_at,
        patients:patient_id (
          full_name,
          phone
        )
      `)
      .order('added_at', { ascending: true }); // Ordena os mais antigos primeiro

    if (fetchError) {
      console.error('[getWaitlistEntries] Erro ao buscar entradas da lista de espera:', fetchError.message);
      return { success: false, message: 'Erro ao buscar entradas da lista de espera.' };
    }

    // Transformar dados: patients pode vir como array, mas esperamos um objeto único
    const transformedEntries = (data || []).map((entry: any) => ({
      ...entry,
      patients: Array.isArray(entry.patients) 
        ? (entry.patients.length > 0 ? entry.patients[0] : null)
        : entry.patients,
    }));

    return {
      success: true,
      message: 'Lista de espera buscada com sucesso.',
      entries: transformedEntries,
    };
  } catch (error) {
    console.error('[getWaitlistEntries] Erro fatal:', error);
    return {
      success: false,
      message: 'Ocorreu um erro inesperado ao buscar a lista de espera.',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

interface WaitlistMetrics {
  totalActive: number;
  totalNotified: number;
  totalFilled: number;
  totalExpired: number;
  averageWaitTime?: string; // Exemplo: "2h 30m"
}

interface GetWaitlistMetricsResult {
  success: boolean;
  message: string;
  metrics?: WaitlistMetrics;
  error?: string;
}

export async function getWaitlistMetrics(): Promise<GetWaitlistMetricsResult> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Credenciais do Supabase não configuradas');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Contagem de entradas por status
    const { count: totalActive, error: activeError } = await supabase
      .from('waitlist')
      .select('id', { count: 'exact' })
      .eq('status', 'Ativo');

    const { count: totalNotified, error: notifiedError } = await supabase
      .from('waitlist')
      .select('id', { count: 'exact' })
      .eq('status', 'Notificado');
    
    const { count: totalFilled, error: filledError } = await supabase
      .from('waitlist')
      .select('id', { count: 'exact' })
      .eq('status', 'Preenchido');

    const { count: totalExpired, error: expiredError } = await supabase
      .from('waitlist')
      .select('id', { count: 'exact' })
      .eq('status', 'Expirado');

    if (activeError || notifiedError || filledError || expiredError) {
      console.error('[getWaitlistMetrics] Erro ao buscar contagens de métricas:', activeError || notifiedError || filledError || expiredError);
      return { success: false, message: 'Erro ao buscar métricas da lista de espera.' };
    }

    // TODO: Cálculo de tempo médio de espera (mais complexo, requer mais dados ou funções SQL)
    // Por enquanto, apenas um placeholder
    const averageWaitTime = "Não implementado";

    const metrics: WaitlistMetrics = {
      totalActive: totalActive || 0,
      totalNotified: totalNotified || 0,
      totalFilled: totalFilled || 0,
      totalExpired: totalExpired || 0,
      averageWaitTime: averageWaitTime,
    };

    return {
      success: true,
      message: 'Métricas da lista de espera buscadas com sucesso.',
      metrics: metrics,
    };
  } catch (error) {
    console.error('[getWaitlistMetrics] Erro fatal:', error);
    return {
      success: false,
      message: 'Ocorreu um erro inesperado ao buscar métricas da lista de espera.',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
