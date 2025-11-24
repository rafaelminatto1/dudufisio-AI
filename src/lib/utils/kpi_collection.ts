// src/lib/utils/kpi_collection.ts
import { createClient } from '@supabase/supabase-js';

interface ConfirmationRateKPI {
  totalAppointments: number;
  confirmedAppointments: number;
  confirmationRate: number; // Em porcentagem
  timestamp: string;
}

interface CollectConfirmationRateResult {
  success: boolean;
  message: string;
  kpi?: ConfirmationRateKPI;
  error?: string;
}

export async function collectConfirmationRateKPI(): Promise<CollectConfirmationRateResult> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Credenciais do Supabase não configuradas');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Definir um período para a coleta, por exemplo, os últimos 7 dias
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Contar o total de agendamentos no período
    const { count: totalAppointments, error: totalError } = await supabase
      .from('appointments')
      .select('id', { count: 'exact' })
      .gte('start_time', sevenDaysAgo.toISOString());

    if (totalError) {
      console.error('[collectConfirmationRateKPI] Erro ao buscar total de agendamentos:', totalError.message);
      return { success: false, message: 'Erro ao buscar total de agendamentos.' };
    }

    // Contar agendamentos confirmados (assumindo um status 'confirmed' ou 'confirmed_via_whatsapp')
    const { count: confirmedAppointments, error: confirmedError } = await supabase
      .from('appointments')
      .select('id', { count: 'exact' })
      .gte('start_time', sevenDaysAgo.toISOString())
      .eq('status', 'confirmed'); // Ou outro status que indique confirmação

    if (confirmedError) {
      console.error('[collectConfirmationRateKPI] Erro ao buscar agendamentos confirmados:', confirmedError.message);
      return { success: false, message: 'Erro ao buscar agendamentos confirmados.' };
    }

    const confirmationRate =
      totalAppointments && totalAppointments > 0
        ? (confirmedAppointments || 0) / totalAppointments * 100
        : 0;

    const kpi: ConfirmationRateKPI = {
      totalAppointments: totalAppointments || 0,
      confirmedAppointments: confirmedAppointments || 0,
      confirmationRate: parseFloat(confirmationRate.toFixed(2)),
      timestamp: new Date().toISOString(),
    };

    // TODO: Armazenar este KPI em uma tabela de métricas no Supabase para histórico

    return {
      success: true,
      message: 'KPI de Taxa de Confirmação coletado com sucesso.',
      kpi: kpi,
    };
  } catch (error) {
    console.error('[collectConfirmationRateKPI] Erro fatal:', error);
    return {
      success: false,
      message: 'Ocorreu um erro inesperado ao coletar o KPI de Taxa de Confirmação.',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
