// src/lib/utils/waitlist_matching.ts
import { createClient } from '@supabase/supabase-js';

interface MatchedPatient {
  patient_id: string;
  waitlist_entry_id: string;
  priority: string;
  phone: string;
  full_name: string;
}

interface MatchVacancyResult {
  success: boolean;
  message: string;
  matchedPatient?: MatchedPatient;
  error?: string;
}

/**
 * Tenta encontrar o melhor paciente na lista de espera para uma vaga recém-aberta.
 * A lógica atual seleciona o paciente com a maior prioridade.
 *
 * @param vacancyDetails - Detalhes da vaga, como ID do terapeuta e horário.
 * @returns Uma promessa que resolve para um objeto MatchVacancyResult.
 */
export async function matchVacancyToWaitlist(
  vacancyDetails: { therapist_id: string; start_time: string; end_time: string }
): Promise<MatchVacancyResult> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Credenciais do Supabase não configuradas');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // TODO: Refinar a lógica de busca para ser mais inteligente.
    // - Considerar a preferência de terapeuta do paciente.
    // - Considerar a disponibilidade de horário do paciente.
    // - Implementar um sistema de pontuação em vez de apenas pegar o primeiro.
    // - Adicionar um `JOIN` com uma tabela de preferências do paciente.

    // 1. Buscar pacientes ativos na lista de espera, ordenados por prioridade
    const { data: waitlistEntries, error: fetchError } = await supabase
      .from('waitlist')
      .select(`
        id,
        patient_id,
        priority,
        patients:patient_id (
          full_name,
          phone
        )
      `)
      .eq('status', 'Ativo')
      .order('priority', { ascending: false }) // 'Urgente' > 'Alta' > 'Normal'
      .limit(1); // Pega o paciente de maior prioridade

    if (fetchError) {
      console.error('[matchVacancyToWaitlist] Erro ao buscar lista de espera:', fetchError.message);
      return { success: false, message: 'Erro ao buscar lista de espera.' };
    }

    if (!waitlistEntries || waitlistEntries.length === 0) {
      console.log('[matchVacancyToWaitlist] Nenhum paciente ativo na lista de espera para matching.');
      return { success: true, message: 'Nenhum paciente ativo na lista de espera.' };
    }

    const candidate = waitlistEntries[0];
    // Acessa o paciente. A relação é 1:1, então esperamos um objeto.
    // Tratamos como se pudesse ser um array para segurança de tipo.
    const patient = Array.isArray(candidate.patients) ? candidate.patients[0] : candidate.patients;

    // Validação robusta dos dados do paciente
    if (!patient || !patient.phone || !patient.full_name) {
      console.warn(`[matchVacancyToWaitlist] Paciente ${candidate.patient_id} na lista de espera sem informações de contato. Pulando para o próximo.`);
      // TODO: Implementar lógica para pular para o próximo candidato na lista.
      // Atualmente, a função para aqui, mas o ideal seria tentar o próximo da fila.
      // Poderia também marcar esta entrada da lista de espera como 'requer_atencao'.
      return { success: false, message: 'Paciente na lista de espera sem informações de contato válidas.' };
    }

    // 2. Marcar o paciente como "Notificado" e definir expires_at
    // A validade de 2 horas é um bom padrão, mas poderia ser configurável.
    const expiresAt = new Date(new Date().getTime() + 2 * 60 * 60 * 1000); // 2 horas a partir de agora

    const { error: updateError } = await supabase
      .from('waitlist')
      .update({
        status: 'Notificado',
        notified_at: new Date().toISOString(),
        expires_at: expiresAt.toISOString()
      })
      .eq('id', candidate.id);

    if (updateError) {
      console.error('[matchVacancyToWaitlist] Erro ao atualizar status do paciente na lista de espera:', updateError.message);
      // TODO: Implementar uma política de retry ou notificar um administrador se esta atualização falhar,
      // pois pode levar a um estado inconsistente.
      return { success: false, message: 'Erro ao atualizar status do paciente na lista de espera.' };
    }

    const matchedPatient: MatchedPatient = {
      patient_id: candidate.patient_id,
      waitlist_entry_id: candidate.id,
      priority: candidate.priority,
      phone: patient.phone,
      full_name: patient.full_name,
    };

    console.log(`[matchVacancyToWaitlist] Paciente ${patient.full_name} notificado para a vaga. Entry ID: ${candidate.id}`);

    return {
      success: true,
      message: `Paciente ${patient.full_name} (${patient.phone}) notificado sobre a vaga.`,
      matchedPatient,
    };
  } catch (error) {
    console.error('[matchVacancyToWaitlist] Erro fatal:', error);
    return {
      success: false,
      message: 'Ocorreu um erro inesperado ao tentar combinar vaga com lista de espera.',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
