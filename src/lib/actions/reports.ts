'use server';

import { createServerComponentClient } from '~/lib/supabase/server';
import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '~/types/database.types';

/**
 * Busca KPIs executivos
 */
export async function getExecutiveKPIs() {
  const supabase = await createServerComponentClient();

  // Pacientes ativos
  const { count: activePatients } = await supabase
    .from('patients')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active');

  // Ocupação da agenda (últimos 7 dias)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const { data: recentAppointments } = await (supabase as SupabaseClient<Database>)
    .from('appointments')
    .select('*')
    .gte('start_time', sevenDaysAgo.toISOString());

  const totalSlots = recentAppointments?.length || 0;
  const attendedSlots = recentAppointments?.filter((a: Database['public']['Tables']['appointments']['Row']) => a.status === 'completed').length || 0;
  const occupancy = totalSlots > 0 ? Math.round((attendedSlots / totalSlots) * 100) : 0;

  // Receita mensal
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const { data: recentPayments } = await (supabase as SupabaseClient<Database>)
    .from('financial_transactions')
    .select('amount')
    .eq('type', 'income')
    .eq('status', 'completed')
    .gte('created_at', thirtyDaysAgo.toISOString());

  const monthlyRevenue = (recentPayments || []).reduce((sum: number, p: Database['public']['Tables']['financial_transactions']['Row']) => sum + (p.amount || 0), 0);

  // Taxa de no-show
  const noShowCount = recentAppointments?.filter((a: Database['public']['Tables']['appointments']['Row']) => a.status === 'no_show').length || 0;
  const noShowRate = totalSlots > 0 ? Math.round((noShowCount / totalSlots) * 100) : 0;

  // NPS (simplificado - buscar de pesquisas)
  const { data: npsSurveys } = await (supabase as SupabaseClient<Database>)
    .from('nps_surveys')
    .select('score')
    .not('score', 'is', null)
    .gte('created_at', thirtyDaysAgo.toISOString());

  const npsScores = (npsSurveys || []).map((s: Database['public']['Tables']['nps_surveys']['Row']) => s.score || 0);
  const nps = npsScores.length > 0
    ? Math.round(npsScores.reduce((a: number, b: number) => a + b, 0) / npsScores.length)
    : 0;

  // Tratamentos ativos
  const { count: activeTreatments } = await (supabase as SupabaseClient<Database>)
    .from('treatments')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'ativo');

  // Sessões hoje
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const { count: sessionsToday } = await (supabase as SupabaseClient<Database>)
    .from('session_evolutions')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', today.toISOString())
    .lt('created_at', tomorrow.toISOString());

  return {
    data: {
      active_patients: activePatients || 0,
      appointment_occupancy: occupancy,
      monthly_revenue: monthlyRevenue,
      no_show_rate: noShowRate,
      nps_score: nps,
      active_treatments: activeTreatments || 0,
      completed_sessions_today: sessionsToday || 0,
    },
    error: null,
  };
}