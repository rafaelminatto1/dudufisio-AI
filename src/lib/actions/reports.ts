'use server';

import { createServerComponentClient } from '~/lib/supabase/server';

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
  const { data: recentAppointments } = await supabase
    .from('appointments')
    .select('*')
    .gte('start_time', sevenDaysAgo.toISOString());

  const totalSlots = recentAppointments?.length || 0;
  const attendedSlots = recentAppointments?.filter((a: any) => a.status === 'completed').length || 0;
  const occupancy = totalSlots > 0 ? Math.round((attendedSlots / totalSlots) * 100) : 0;

  // Receita mensal
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const { data: recentPayments } = await supabase
    .from('financial_transactions')
    .select('amount')
    .eq('type', 'income')
    .eq('status', 'completed')
    .gte('created_at', thirtyDaysAgo.toISOString());

  const monthlyRevenue = (recentPayments || []).reduce((sum: number, p: any) => sum + (p.amount || 0), 0);

  // Taxa de no-show
  const noShowCount = recentAppointments?.filter((a: any) => a.status === 'no_show').length || 0;
  const noShowRate = totalSlots > 0 ? Math.round((noShowCount / totalSlots) * 100) : 0;

  // NPS (simplificado - buscar de pesquisas)
  const { data: npsSurveys } = await supabase
    .from('nps_surveys')
    .select('score')
    .not('score', 'is', null)
    .gte('created_at', thirtyDaysAgo.toISOString());

  const npsScores = (npsSurveys || []).map((s: any) => s.score || 0);
  const nps = npsScores.length > 0
    ? Math.round(npsScores.reduce((a: number, b: number) => a + b, 0) / npsScores.length)
    : 0;

  // Tratamentos ativos
  const { count: activeTreatments } = await supabase
    .from('treatments')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'ativo');

  // Sessões hoje
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const { count: sessionsToday } = await supabase
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

