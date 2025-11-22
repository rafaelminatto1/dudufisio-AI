import { NextRequest } from 'next/server';
import { withAuth, successResponse, errorResponse } from '~/lib/api/middleware';
import { getExecutiveKPIs } from '~/lib/actions/reports';

/**
 * GET /api/reports - Lista relatórios disponíveis
 *
 * Retorna lista de tipos de relatórios que podem ser gerados
 */
export const GET = withAuth(async (request: NextRequest, { supabase }) => {
  const availableReports = [
    {
      type: 'financial',
      name: 'Relatório Financeiro',
      description: 'Receitas, despesas, fluxo de caixa e indicadores financeiros',
      endpoint: '/api/reports/financial',
    },
    {
      type: 'clinical',
      name: 'Relatório Clínico',
      description: 'Estatísticas de atendimentos, tratamentos e evoluções',
      endpoint: '/api/reports/clinical',
    },
    {
      type: 'operational',
      name: 'Relatório Operacional',
      description: 'Ocupação da agenda, taxa de no-show, KPIs operacionais',
      endpoint: '/api/reports/operational',
    },
    {
      type: 'executive',
      name: 'Dashboard Executivo',
      description: 'Visão geral dos principais indicadores do negócio',
      endpoint: '/api/reports/executive',
    },
  ];

  return successResponse({
    reports: availableReports,
    count: availableReports.length,
  });
});

/**
 * POST /api/reports - Gera relatório customizado
 *
 * Body:
 * {
 *   "type": "financial|clinical|operational|executive (required)",
 *   "start_date": "string ISO date (optional)",
 *   "end_date": "string ISO date (optional)",
 *   "format": "json|pdf|excel (optional, default: json)",
 *   "filters": {
 *     "therapist_id": "string UUID",
 *     "patient_id": "string UUID",
 *     // outros filtros específicos
 *   }
 * }
 */
export const POST = withAuth(async (request: NextRequest, { supabase }) => {
  try {
    const body = await request.json();

    if (!body.type) {
      return errorResponse('Tipo de relatório é obrigatório', 400);
    }

    const validTypes = ['financial', 'clinical', 'operational', 'executive'];
    if (!validTypes.includes(body.type)) {
      return errorResponse(
        `Tipo de relatório inválido. Use: ${validTypes.join(', ')}`,
        400
      );
    }

    const format = body.format || 'json';
    const validFormats = ['json', 'pdf', 'excel'];
    if (!validFormats.includes(format)) {
      return errorResponse(
        `Formato inválido. Use: ${validFormats.join(', ')}`,
        400
      );
    }

    // Valida datas se fornecidas
    let startDate = body.start_date;
    let endDate = body.end_date;

    if (startDate && isNaN(new Date(startDate).getTime())) {
      return errorResponse('Data de início inválida', 400);
    }

    if (endDate && isNaN(new Date(endDate).getTime())) {
      return errorResponse('Data de término inválida', 400);
    }

    // Se não fornecidas, usa últimos 30 dias
    if (!startDate) {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      startDate = thirtyDaysAgo.toISOString();
    }

    if (!endDate) {
      endDate = new Date().toISOString();
    }

    // Gera relatório baseado no tipo
    let reportData;

    switch (body.type) {
      case 'executive':
        const kpis = await getExecutiveKPIs();
        reportData = kpis.data;
        break;

      case 'financial':
        reportData = await generateFinancialReport(supabase, startDate, endDate, body.filters);
        break;

      case 'clinical':
        reportData = await generateClinicalReport(supabase, startDate, endDate, body.filters);
        break;

      case 'operational':
        reportData = await generateOperationalReport(supabase, startDate, endDate, body.filters);
        break;

      default:
        return errorResponse('Tipo de relatório não implementado', 501);
    }

    // TODO: Implementar exportação para PDF/Excel se format != 'json'
    if (format === 'pdf' || format === 'excel') {
      return successResponse({
        message: `Exportação para ${format.toUpperCase()} será implementada em breve`,
        data: reportData,
        format: 'json',
      });
    }

    return successResponse({
      type: body.type,
      period: {
        start: startDate,
        end: endDate,
      },
      generated_at: new Date().toISOString(),
      data: reportData,
    });
  } catch (error: any) {
    return errorResponse(error.message || 'Erro ao gerar relatório', 500);
  }
});

/**
 * Gera relatório financeiro
 */
async function generateFinancialReport(supabase: any, startDate: string, endDate: string, filters?: any) {
  // Receitas
  const { data: income } = await supabase
    .from('financial_transactions')
    .select('amount, created_at')
    .eq('type', 'income')
    .eq('status', 'completed')
    .gte('created_at', startDate)
    .lte('created_at', endDate);

  // Despesas
  const { data: expenses } = await supabase
    .from('financial_transactions')
    .select('amount, created_at')
    .eq('type', 'expense')
    .eq('status', 'completed')
    .gte('created_at', startDate)
    .lte('created_at', endDate);

  const totalIncome = (income || []).reduce((sum: number, t: any) => sum + (t.amount || 0), 0);
  const totalExpenses = (expenses || []).reduce((sum: number, t: any) => sum + (t.amount || 0), 0);

  return {
    total_income: totalIncome,
    total_expenses: totalExpenses,
    net_profit: totalIncome - totalExpenses,
    income_count: income?.length || 0,
    expenses_count: expenses?.length || 0,
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

  // Calcula média de dor
  const painLevels = (sessions || [])
    .filter((s: any) => s.pain_level !== null && s.pain_level !== undefined)
    .map((s: any) => s.pain_level);

  const avgPainLevel =
    painLevels.length > 0
      ? painLevels.reduce((a: number, b: number) => a + b, 0) / painLevels.length
      : 0;

  return {
    total_sessions: sessions?.length || 0,
    unique_patients: new Set((sessions || []).map((s: any) => s.patient_id)).size,
    average_pain_level: Math.round(avgPainLevel * 10) / 10,
    sessions_with_soap: (sessions || []).filter((s: any) => s.subjective || s.objective).length,
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
  const completed = appointments?.filter((a: any) => a.status === 'completed').length || 0;
  const cancelled = appointments?.filter((a: any) => a.status === 'cancelled').length || 0;
  const noShow = appointments?.filter((a: any) => a.status === 'no_show').length || 0;

  return {
    total_appointments: total,
    completed: completed,
    cancelled: cancelled,
    no_show: noShow,
    occupancy_rate: total > 0 ? Math.round((completed / total) * 100) : 0,
    no_show_rate: total > 0 ? Math.round((noShow / total) * 100) : 0,
    cancellation_rate: total > 0 ? Math.round((cancelled / total) * 100) : 0,
  };
}
