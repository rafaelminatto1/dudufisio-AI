import { NextRequest } from 'next/server';
import { withAuth, successResponse, errorResponse, getQueryParams } from '~/lib/api/middleware';
import { getExecutiveKPIs } from '~/lib/actions/reports';

/**
 * GET /api/reports/[type] - Gera relatório específico
 *
 * Tipos disponíveis: financial, clinical, operational, executive
 *
 * Query params:
 * - start_date: string ISO date (opcional, padrão: 30 dias atrás)
 * - end_date: string ISO date (opcional, padrão: hoje)
 * - therapist_id: string UUID (filtro opcional)
 * - patient_id: string UUID (filtro opcional)
 *
 * Exemplos:
 * - /api/reports/financial?start_date=2025-01-01&end_date=2025-01-31
 * - /api/reports/clinical?therapist_id=123e4567-e89b-12d3-a456-426614174000
 * - /api/reports/operational
 * - /api/reports/executive
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ type: string }> }
) {
  const params = await context.params;
  return withAuth(async (req: NextRequest, { supabase }) => {
    const reportType = params.type;

  if (!reportType) {
    return errorResponse('Tipo de relatório é obrigatório', 400);
  }

  const validTypes = ['financial', 'clinical', 'operational', 'executive'];
  if (!validTypes.includes(reportType)) {
    return errorResponse(`Tipo de relatório inválido. Use: ${validTypes.join(', ')}`, 400);
  }

  const queryParams = getQueryParams(request);

  // Define período padrão (últimos 30 dias)
  let startDate = queryParams.start_date;
  let endDate = queryParams.end_date;

  if (!startDate) {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    startDate = thirtyDaysAgo.toISOString();
  }

  if (!endDate) {
    endDate = new Date().toISOString();
  }

  // Valida datas
  if (isNaN(new Date(startDate).getTime())) {
    return errorResponse('Data de início inválida', 400);
  }

  if (isNaN(new Date(endDate).getTime())) {
    return errorResponse('Data de término inválida', 400);
  }

  const filters = {
    therapist_id: queryParams.therapist_id,
    patient_id: queryParams.patient_id,
  };

  try {
    let reportData;

    switch (reportType) {
      case 'executive':
        const kpis = await getExecutiveKPIs();
        reportData = kpis.data;
        break;

      case 'financial':
        reportData = await generateFinancialReport(supabase, startDate, endDate, filters);
        break;

      case 'clinical':
        reportData = await generateClinicalReport(supabase, startDate, endDate, filters);
        break;

      case 'operational':
        reportData = await generateOperationalReport(supabase, startDate, endDate, filters);
        break;

      default:
        return errorResponse('Tipo de relatório não implementado', 501);
    }

    return successResponse({
      type: reportType,
      period: {
        start: startDate,
        end: endDate,
      },
      filters: filters,
      generated_at: new Date().toISOString(),
      data: reportData,
    });
  } catch (error: any) {
    console.error(`Error generating ${reportType} report:`, error);
    return errorResponse(error.message || 'Erro ao gerar relatório', 500);
  }
  })(request);
}

/**
 * Gera relatório financeiro
 */
async function generateFinancialReport(supabase: any, startDate: string, endDate: string, filters?: any) {
  // Receitas
  const { data: income } = await supabase
    .from('financial_transactions')
    .select('amount, created_at, description, category')
    .eq('type', 'income')
    .eq('status', 'completed')
    .gte('created_at', startDate)
    .lte('created_at', endDate);

  // Despesas
  const { data: expenses } = await supabase
    .from('financial_transactions')
    .select('amount, created_at, description, category')
    .eq('type', 'expense')
    .eq('status', 'completed')
    .gte('created_at', startDate)
    .lte('created_at', endDate);

  // Faturas
  const { data: invoices } = await supabase
    .from('invoices')
    .select('total_amount, status, due_date')
    .gte('created_at', startDate)
    .lte('created_at', endDate);

  const totalIncome = (income || []).reduce((sum: number, t: any) => sum + (t.amount || 0), 0);
  const totalExpenses = (expenses || []).reduce((sum: number, t: any) => sum + (t.amount || 0), 0);

  const paidInvoices = (invoices || []).filter((i: any) => i.status === 'paid');
  const pendingInvoices = (invoices || []).filter((i: any) => i.status === 'pending');
  const overdueInvoices = (invoices || []).filter(
    (i: any) => i.status === 'pending' && new Date(i.due_date) < new Date()
  );

  const totalPaid = paidInvoices.reduce((sum: number, i: any) => sum + (i.total_amount || 0), 0);
  const totalPending = pendingInvoices.reduce((sum: number, i: any) => sum + (i.total_amount || 0), 0);
  const totalOverdue = overdueInvoices.reduce((sum: number, i: any) => sum + (i.total_amount || 0), 0);

  return {
    summary: {
      total_income: totalIncome,
      total_expenses: totalExpenses,
      net_profit: totalIncome - totalExpenses,
      profit_margin: totalIncome > 0 ? Math.round(((totalIncome - totalExpenses) / totalIncome) * 100) : 0,
    },
    transactions: {
      income_count: income?.length || 0,
      expenses_count: expenses?.length || 0,
    },
    invoices: {
      total_count: invoices?.length || 0,
      paid_count: paidInvoices.length,
      pending_count: pendingInvoices.length,
      overdue_count: overdueInvoices.length,
      total_paid: totalPaid,
      total_pending: totalPending,
      total_overdue: totalOverdue,
    },
  };
}

/**
 * Gera relatório clínico
 */
async function generateClinicalReport(supabase: any, startDate: string, endDate: string, filters?: any) {
  let query = supabase
    .from('session_evolutions')
    .select('*')
    .gte('session_date', startDate)
    .lte('session_date', endDate);

  if (filters?.therapist_id) {
    query = query.eq('therapist_id', filters.therapist_id);
  }

  if (filters?.patient_id) {
    query = query.eq('patient_id', filters.patient_id);
  }

  const { data: sessions } = await query;

  // Calcula estatísticas de dor
  const painLevels = (sessions || [])
    .filter((s: any) => s.pain_level !== null && s.pain_level !== undefined)
    .map((s: any) => s.pain_level);

  const avgPainLevel =
    painLevels.length > 0 ? painLevels.reduce((a: number, b: number) => a + b, 0) / painLevels.length : 0;

  const maxPainLevel = painLevels.length > 0 ? Math.max(...painLevels) : 0;
  const minPainLevel = painLevels.length > 0 ? Math.min(...painLevels) : 0;

  // Sessões com documentação completa (SOAP)
  const sessionsWithSOAP = (sessions || []).filter(
    (s: any) => s.subjective && s.objective && s.assessment && s.plan
  );

  // Pacientes únicos atendidos
  const uniquePatients = new Set((sessions || []).map((s: any) => s.patient_id));

  return {
    summary: {
      total_sessions: sessions?.length || 0,
      unique_patients: uniquePatients.size,
      sessions_with_complete_soap: sessionsWithSOAP.length,
      documentation_rate: sessions?.length
        ? Math.round((sessionsWithSOAP.length / sessions.length) * 100)
        : 0,
    },
    pain_statistics: {
      average_pain_level: Math.round(avgPainLevel * 10) / 10,
      max_pain_level: maxPainLevel,
      min_pain_level: minPainLevel,
      sessions_with_pain_data: painLevels.length,
    },
    soap_completion: {
      with_subjective: (sessions || []).filter((s: any) => s.subjective).length,
      with_objective: (sessions || []).filter((s: any) => s.objective).length,
      with_assessment: (sessions || []).filter((s: any) => s.assessment).length,
      with_plan: (sessions || []).filter((s: any) => s.plan).length,
    },
  };
}

/**
 * Gera relatório operacional
 */
async function generateOperationalReport(supabase: any, startDate: string, endDate: string, filters?: any) {
  let query = supabase
    .from('appointments')
    .select('*')
    .gte('start_time', startDate)
    .lte('start_time', endDate);

  if (filters?.therapist_id) {
    query = query.eq('therapist_id', filters.therapist_id);
  }

  const { data: appointments } = await query;

  const total = appointments?.length || 0;
  const scheduled = appointments?.filter((a: any) => a.status === 'scheduled').length || 0;
  const confirmed = appointments?.filter((a: any) => a.status === 'confirmed').length || 0;
  const completed = appointments?.filter((a: any) => a.status === 'completed').length || 0;
  const cancelled = appointments?.filter((a: any) => a.status === 'cancelled').length || 0;
  const noShow = appointments?.filter((a: any) => a.status === 'no_show').length || 0;

  // Agrupa por fisioterapeuta (se não houver filtro)
  let therapistStats = [];
  if (!filters?.therapist_id) {
    const therapistGroups = (appointments || []).reduce((acc: any, apt: any) => {
      const tid = apt.therapist_id || 'unassigned';
      if (!acc[tid]) {
        acc[tid] = { total: 0, completed: 0, cancelled: 0, noShow: 0 };
      }
      acc[tid].total++;
      if (apt.status === 'completed') acc[tid].completed++;
      if (apt.status === 'cancelled') acc[tid].cancelled++;
      if (apt.status === 'no_show') acc[tid].noShow++;
      return acc;
    }, {});

    therapistStats = Object.entries(therapistGroups).map(([therapist_id, stats]: [string, any]) => ({
      therapist_id,
      ...stats,
      occupancy_rate: stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0,
    }));
  }

  return {
    summary: {
      total_appointments: total,
      scheduled: scheduled,
      confirmed: confirmed,
      completed: completed,
      cancelled: cancelled,
      no_show: noShow,
    },
    rates: {
      occupancy_rate: total > 0 ? Math.round((completed / total) * 100) : 0,
      no_show_rate: total > 0 ? Math.round((noShow / total) * 100) : 0,
      cancellation_rate: total > 0 ? Math.round((cancelled / total) * 100) : 0,
      completion_rate: total > 0 ? Math.round((completed / total) * 100) : 0,
    },
    by_therapist: therapistStats,
  };
}
