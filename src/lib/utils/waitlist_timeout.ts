// src/lib/utils/waitlist_timeout.ts
import { createClient } from '@supabase/supabase-js';

interface ProcessWaitlistTimeoutResult {
  success: boolean;
  message: string;
  processedCount?: number;
  error?: string;
}

export async function processWaitlistTimeouts(): Promise<ProcessWaitlistTimeoutResult> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Credenciais do Supabase não configuradas');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const now = new Date();

    // 1. Buscar entradas na lista de espera que foram notificadas e cujo expires_at já passou
    const { data: timedOutEntries, error: fetchError } = await supabase
      .from('waitlist')
      .select('id, patient_id, status, expires_at')
      .eq('status', 'Notificado')
      .lt('expires_at', now.toISOString());

    if (fetchError) {
      console.error('[processWaitlistTimeouts] Erro ao buscar entradas com timeout:', fetchError.message);
      return { success: false, message: 'Erro ao buscar entradas com timeout.' };
    }

    if (!timedOutEntries || timedOutEntries.length === 0) {
      return { success: true, message: 'Nenhuma entrada na lista de espera com timeout para processar.' };
    }

    console.log(`[processWaitlistTimeouts] Encontradas ${timedOutEntries.length} entradas com timeout.`);

    let processedCount = 0;
    for (const entry of timedOutEntries) {
      // 2. Marcar a entrada como "Expirado"
      const { error: updateError } = await supabase
        .from('waitlist')
        .update({ status: 'Expirado' })
        .eq('id', entry.id);

      if (updateError) {
        console.error(`[processWaitlistTimeouts] Erro ao marcar entrada ${entry.id} como expirada:`, updateError.message);
        // Continuar para a próxima entrada mesmo se houver erro em uma
      } else {
        processedCount++;
        console.log(`[processWaitlistTimeouts] Entrada ${entry.id} marcada como expirada.`);
        // TODO: Aqui você pode adicionar lógica para notificar o próximo paciente na lista de espera
        // ou para liberar a vaga novamente, dependendo da regra de negócio.
      }
    }

    return {
      success: true,
      message: `Processamento de timeouts concluído. ${processedCount} entradas expiradas.`,
      processedCount,
    };
  } catch (error) {
    console.error('[processWaitlistTimeouts] Erro fatal:', error);
    return {
      success: false,
      message: 'Ocorreu um erro inesperado ao processar timeouts da lista de espera.',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
