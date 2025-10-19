import { supabase } from '../lib/supabaseClient';
import type {
  SessionObservation,
  PatientAssessment,
  MandatoryAssessment,
  ObservationFilters,
  AssessmentFilters,
  AssessmentChartData,
  AssessmentStatistics,
  EvolutionReportData
} from '../types';

/**
 * Serviço para gerenciamento de observações e avaliações de pacientes
 */

// ============================================================================
// OBSERVAÇÕES
// ============================================================================

/**
 * Adicionar nova observação
 */
export async function addObservation(
  patientId: string,
  data: Omit<SessionObservation, 'id' | 'authorId' | 'authorName' | 'createdAt' | 'updatedAt'>
): Promise<SessionObservation> {
  const { data: user } = await supabase.auth.getUser();
  
  if (!user?.user) {
    throw new Error('Usuário não autenticado');
  }

  const observationData = {
    patient_id: patientId,
    session_id: data.sessionId || null,
    author_id: user.user.id,
    author_name: user.user.user_metadata?.full_name || user.user.email || 'Usuário',
    observation_type: data.observationType,
    content: data.content,
    timing: data.timing,
    tags: data.tags || [],
    is_important: data.isImportant || false,
    is_pinned: data.isPinned || false
  };

  const { data: created, error } = await supabase
    .from('session_observations')
    .insert(observationData)
    .select()
    .single();

  if (error) {
    console.error('Erro ao adicionar observação:', error);
    throw new Error('Não foi possível adicionar a observação');
  }

  return mapObservationFromDb(created);
}

/**
 * Buscar observações do paciente com filtros
 */
export async function getPatientObservations(
  patientId: string,
  filters?: ObservationFilters
): Promise<SessionObservation[]> {
  let query = supabase
    .from('session_observations')
    .select('*')
    .eq('patient_id', patientId)
    .is('deleted_at', null);

  // Aplicar filtros
  if (filters?.type) {
    query = query.eq('observation_type', filters.type);
  }
  if (filters?.sessionId) {
    query = query.eq('session_id', filters.sessionId);
  }
  if (filters?.authorId) {
    query = query.eq('author_id', filters.authorId);
  }
  if (filters?.important !== undefined) {
    query = query.eq('is_important', filters.important);
  }
  if (filters?.dateFrom) {
    query = query.gte('created_at', filters.dateFrom);
  }
  if (filters?.dateTo) {
    query = query.lte('created_at', filters.dateTo);
  }
  if (filters?.tags && filters.tags.length > 0) {
    query = query.overlaps('tags', filters.tags);
  }

  query = query.order('created_at', { ascending: false });

  const { data, error } = await query;

  if (error) {
    console.error('Erro ao buscar observações:', error);
    throw new Error('Não foi possível carregar as observações');
  }

  return data.map(mapObservationFromDb);
}

/**
 * Atualizar observação
 */
export async function updateObservation(
  id: string,
  data: Partial<Pick<SessionObservation, 'content' | 'observationType' | 'tags' | 'isImportant' | 'isPinned'>>
): Promise<SessionObservation> {
  const updateData: any = {};

  if (data.content) updateData.content = data.content;
  if (data.observationType) updateData.observation_type = data.observationType;
  if (data.tags !== undefined) updateData.tags = data.tags;
  if (data.isImportant !== undefined) updateData.is_important = data.isImportant;
  if (data.isPinned !== undefined) updateData.is_pinned = data.isPinned;

  const { data: updated, error } = await supabase
    .from('session_observations')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Erro ao atualizar observação:', error);
    throw new Error('Não foi possível atualizar a observação');
  }

  return mapObservationFromDb(updated);
}

/**
 * Excluir observação (soft delete)
 */
export async function deleteObservation(id: string): Promise<void> {
  const { error } = await supabase
    .from('session_observations')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id);

  if (error) {
    console.error('Erro ao excluir observação:', error);
    throw new Error('Não foi possível excluir a observação');
  }
}

// ============================================================================
// AVALIAÇÕES/MEDIÇÕES
// ============================================================================

/**
 * Adicionar nova avaliação
 */
export async function addAssessment(
  patientId: string,
  data: Omit<PatientAssessment, 'id' | 'measuredBy' | 'measuredAt'>
): Promise<PatientAssessment> {
  const { data: user } = await supabase.auth.getUser();
  
  if (!user?.user) {
    throw new Error('Usuário não autenticado');
  }

  const assessmentData = {
    patient_id: patientId,
    session_id: data.sessionId || null,
    observation_id: data.observationId || null,
    template_id: data.templateId || null,
    field_name: data.fieldName,
    field_value: data.fieldValue,
    field_text: data.fieldText,
    unit: data.unit,
    assessment_timing: data.assessmentTiming,
    measured_by: user.user.id,
    notes: data.notes
  };

  const { data: created, error } = await supabase
    .from('patient_assessments')
    .insert(assessmentData)
    .select()
    .single();

  if (error) {
    console.error('Erro ao adicionar avaliação:', error);
    throw new Error('Não foi possível adicionar a avaliação');
  }

  return mapAssessmentFromDb(created);
}

/**
 * Adicionar múltiplas avaliações de uma vez
 */
export async function addMultipleAssessments(
  patientId: string,
  assessments: Omit<PatientAssessment, 'id' | 'patientId' | 'measuredBy' | 'measuredAt'>[]
): Promise<PatientAssessment[]> {
  const { data: user } = await supabase.auth.getUser();
  
  if (!user?.user) {
    throw new Error('Usuário não autenticado');
  }

  const assessmentsData = assessments.map(a => ({
    patient_id: patientId,
    session_id: a.sessionId || null,
    observation_id: a.observationId || null,
    template_id: a.templateId || null,
    field_name: a.fieldName,
    field_value: a.fieldValue,
    field_text: a.fieldText,
    unit: a.unit,
    assessment_timing: a.assessmentTiming,
    measured_by: user.user.id,
    notes: a.notes
  }));

  const { data: created, error } = await supabase
    .from('patient_assessments')
    .insert(assessmentsData)
    .select();

  if (error) {
    console.error('Erro ao adicionar avaliações:', error);
    throw new Error('Não foi possível adicionar as avaliações');
  }

  return created.map(mapAssessmentFromDb);
}

/**
 * Buscar histórico de avaliações
 */
export async function getAssessmentHistory(
  patientId: string,
  templateId?: string,
  filters?: AssessmentFilters
): Promise<PatientAssessment[]> {
  let query = supabase
    .from('patient_assessments')
    .select('*')
    .eq('patient_id', patientId)
    .is('deleted_at', null);

  if (templateId) {
    query = query.eq('template_id', templateId);
  }

  // Aplicar filtros
  if (filters?.fieldName) {
    query = query.eq('field_name', filters.fieldName);
  }
  if (filters?.timing) {
    query = query.eq('assessment_timing', filters.timing);
  }
  if (filters?.dateFrom) {
    query = query.gte('measured_at', filters.dateFrom);
  }
  if (filters?.dateTo) {
    query = query.lte('measured_at', filters.dateTo);
  }

  query = query.order('measured_at', { ascending: false });

  const { data, error } = await query;

  if (error) {
    console.error('Erro ao buscar histórico de avaliações:', error);
    throw new Error('Não foi possível carregar o histórico');
  }

  return data.map(mapAssessmentFromDb);
}

/**
 * Buscar dados para gráfico de evolução
 */
export async function getAssessmentChartData(
  patientId: string,
  fieldName: string,
  dateFrom?: string,
  dateTo?: string
): Promise<AssessmentChartData[]> {
  let query = supabase
    .from('patient_assessments')
    .select('measured_at, field_value, assessment_timing, notes')
    .eq('patient_id', patientId)
    .eq('field_name', fieldName)
    .is('deleted_at', null)
    .not('field_value', 'is', null);

  if (dateFrom) {
    query = query.gte('measured_at', dateFrom);
  }
  if (dateTo) {
    query = query.lte('measured_at', dateTo);
  }

  query = query.order('measured_at', { ascending: true });

  const { data, error } = await query;

  if (error) {
    console.error('Erro ao buscar dados do gráfico:', error);
    throw new Error('Não foi possível carregar os dados do gráfico');
  }

  return data.map((d, index) => ({
    date: d.measured_at,
    value: d.field_value,
    sessionNumber: index + 1,
    timing: d.assessment_timing,
    notes: d.notes
  }));
}

/**
 * Calcular estatísticas de uma avaliação
 */
export async function calculateAssessmentStatistics(
  patientId: string,
  fieldName: string
): Promise<AssessmentStatistics> {
  const { data, error } = await supabase
    .from('patient_assessments')
    .select('field_value, unit, measured_at')
    .eq('patient_id', patientId)
    .eq('field_name', fieldName)
    .is('deleted_at', null)
    .not('field_value', 'is', null)
    .order('measured_at', { ascending: true });

  if (error) {
    console.error('Erro ao calcular estatísticas:', error);
    throw new Error('Não foi possível calcular as estatísticas');
  }

  if (data?.length === 0) {
    return {
      fieldName,
      unit: undefined,
      count: 0,
      min: 0,
      max: 0,
      average: 0,
      latest: 0,
      percentChange: 0,
      trend: 'stable'
    };
  }

  const values = data.map(d => d.field_value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const average = values.reduce((a, b) => a + b, 0) / values.length;
  const latest = values[values.length - 1];
  const first = values[0];
  const percentChange = first !== 0 ? ((latest - first) / first) * 100 : 0;

  // Determinar trend (baseado nos últimos 3 valores se disponíveis)
  let trend: 'improving' | 'stable' | 'declining' = 'stable';
  if (values.length >= 3) {
    const lastThree = values.slice(-3);
    const isIncreasing = lastThree[2] > lastThree[0];
    const changePercent = Math.abs(((lastThree[2] - lastThree[0]) / lastThree[0]) * 100);
    
    if (changePercent > 5) {
      // Para métricas onde aumentar é bom (força, amplitude)
      trend = isIncreasing ? 'improving' : 'declining';
      
      // Para métricas onde diminuir é bom (dor, edema) - inverter lógica
      if (fieldName.toLowerCase().includes('dor') || fieldName.toLowerCase().includes('edema')) {
        trend = isIncreasing ? 'declining' : 'improving';
      }
    }
  }

  return {
    fieldName,
    unit: data[0].unit,
    count: data.length,
    min,
    max,
    average: Math.round(average * 100) / 100,
    latest,
    percentChange: Math.round(percentChange * 100) / 100,
    trend
  };
}

// ============================================================================
// TESTES OBRIGATÓRIOS
// ============================================================================

/**
 * Configurar teste obrigatório
 */
export async function configureMandatoryAssessment(
  patientId: string,
  config: Omit<MandatoryAssessment, 'id' | 'createdBy' | 'createdAt'>
): Promise<MandatoryAssessment> {
  const { data: user } = await supabase.auth.getUser();
  
  if (!user?.user) {
    throw new Error('Usuário não autenticado');
  }

  const configData = {
    patient_id: patientId,
    category_id: config.categoryId || null,
    template_id: config.templateId,
    frequency_type: config.frequencyType,
    frequency_value: config.frequencyValue,
    milestone_sessions: config.milestoneSessions,
    assessment_timing: config.assessmentTiming,
    is_active: config.isActive,
    start_date: config.startDate,
    end_date: config.endDate,
    created_by: user.user.id
  };

  const { data: created, error } = await supabase
    .from('mandatory_assessments')
    .insert(configData)
    .select()
    .single();

  if (error) {
    console.error('Erro ao configurar teste obrigatório:', error);
    throw new Error('Não foi possível configurar o teste obrigatório');
  }

  return mapMandatoryAssessmentFromDb(created);
}

/**
 * Buscar testes obrigatórios de um paciente
 */
export async function getMandatoryAssessments(
  patientId: string,
  activeOnly: boolean = true
): Promise<MandatoryAssessment[]> {
  let query = supabase
    .from('mandatory_assessments')
    .select('*')
    .eq('patient_id', patientId)
    .is('deleted_at', null);

  if (activeOnly) {
    query = query.eq('is_active', true);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Erro ao buscar testes obrigatórios:', error);
    throw new Error('Não foi possível carregar os testes obrigatórios');
  }

  return data.map(mapMandatoryAssessmentFromDb);
}

/**
 * Verificar testes pendentes para uma sessão
 */
export async function getMandatoryAssessmentsForSession(
  patientId: string,
  sessionNumber: number,
  timing: 'pre_session' | 'post_session' | 'mid_session' = 'pre_session'
): Promise<any[]> {
  const { data, error } = await supabase
    .rpc('get_pending_assessments_for_session', {
      p_patient_id: patientId,
      p_session_number: sessionNumber,
      p_timing: timing
    });

  if (error) {
    console.error('Erro ao buscar testes pendentes:', error);
    throw new Error('Não foi possível carregar os testes pendentes');
  }

  return data || [];
}

/**
 * Atualizar teste obrigatório
 */
export async function updateMandatoryAssessment(
  id: string,
  data: Partial<Omit<MandatoryAssessment, 'id' | 'patientId' | 'createdBy' | 'createdAt'>>
): Promise<MandatoryAssessment> {
  const updateData: any = {};

  if (data.frequencyType) updateData.frequency_type = data.frequencyType;
  if (data.frequencyValue !== undefined) updateData.frequency_value = data.frequencyValue;
  if (data.milestoneSessions) updateData.milestone_sessions = data.milestoneSessions;
  if (data.assessmentTiming) updateData.assessment_timing = data.assessmentTiming;
  if (data.isActive !== undefined) updateData.is_active = data.isActive;
  if (data.startDate !== undefined) updateData.start_date = data.startDate;
  if (data.endDate !== undefined) updateData.end_date = data.endDate;

  const { data: updated, error } = await supabase
    .from('mandatory_assessments')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Erro ao atualizar teste obrigatório:', error);
    throw new Error('Não foi possível atualizar o teste obrigatório');
  }

  return mapMandatoryAssessmentFromDb(updated);
}

/**
 * Desativar teste obrigatório
 */
export async function deactivateMandatoryAssessment(id: string): Promise<void> {
  const { error } = await supabase
    .from('mandatory_assessments')
    .update({ is_active: false })
    .eq('id', id);

  if (error) {
    console.error('Erro ao desativar teste obrigatório:', error);
    throw new Error('Não foi possível desativar o teste obrigatório');
  }
}

// ============================================================================
// RELATÓRIOS
// ============================================================================

/**
 * Gerar relatório de evolução completo
 */
export async function generateEvolutionReport(
  patientId: string,
  startDate: string,
  endDate: string
): Promise<EvolutionReportData> {
  // Buscar todas as avaliações no período
  const assessments = await getAssessmentHistory(patientId, undefined, {
    dateFrom: startDate,
    dateTo: endDate
  });

  // Buscar observações no período
  const observations = await getPatientObservations(patientId, {
    dateFrom: startDate,
    dateTo: endDate
  });

  // Agrupar avaliações por campo e calcular estatísticas
  const fieldNames = [...new Set(assessments.map(a => a.fieldName))];
  const statisticsPromises = fieldNames.map(fieldName =>
    calculateAssessmentStatistics(patientId, fieldName)
  );
  const statistics = await Promise.all(statisticsPromises);

  // Buscar dados de gráfico para cada campo
  const chartDataPromises = fieldNames.map(fieldName =>
    getAssessmentChartData(patientId, fieldName, startDate, endDate)
  );
  const chartDataArrays = await Promise.all(chartDataPromises);
  const chartData = chartDataArrays.flat();

  // Contar sessões únicas
  const sessionIds = new Set(assessments.map(a => a.sessionId).filter(Boolean));
  const totalSessions = sessionIds.size;

  return {
    patientId,
    period: {
      start: startDate,
      end: endDate
    },
    assessments: chartData,
    statistics,
    observations,
    totalSessions
  };
}

// ============================================================================
// FUNÇÕES AUXILIARES - MAPEAMENTO
// ============================================================================

function mapObservationFromDb(data: any): SessionObservation {
  return {
    id: data.id,
    patientId: data.patient_id,
    sessionId: data.session_id,
    authorId: data.author_id,
    authorName: data.author_name,
    observationType: data.observation_type,
    content: data.content,
    timing: data.timing,
    tags: data.tags || [],
    isImportant: data.is_important,
    isPinned: data.is_pinned,
    createdAt: data.created_at,
    updatedAt: data.updated_at
  };
}

function mapAssessmentFromDb(data: any): PatientAssessment {
  return {
    id: data.id,
    patientId: data.patient_id,
    sessionId: data.session_id,
    observationId: data.observation_id,
    templateId: data.template_id,
    fieldName: data.field_name,
    fieldValue: data.field_value,
    fieldText: data.field_text,
    unit: data.unit,
    assessmentTiming: data.assessment_timing,
    measuredBy: data.measured_by,
    measuredAt: data.measured_at,
    notes: data.notes
  };
}

function mapMandatoryAssessmentFromDb(data: any): MandatoryAssessment {
  return {
    id: data.id,
    patientId: data.patient_id,
    categoryId: data.category_id,
    templateId: data.template_id,
    frequencyType: data.frequency_type,
    frequencyValue: data.frequency_value,
    milestoneSessions: data.milestone_sessions || [],
    assessmentTiming: data.assessment_timing || ['pre_session'],
    isActive: data.is_active,
    startDate: data.start_date,
    endDate: data.end_date,
    createdBy: data.created_by,
    createdAt: data.created_at
  };
}

// ============================================================================
// EXPORTS DEFAULT
// ============================================================================

export default {
  // Observações
  addObservation,
  getPatientObservations,
  updateObservation,
  deleteObservation,
  
  // Avaliações
  addAssessment,
  addMultipleAssessments,
  getAssessmentHistory,
  getAssessmentChartData,
  calculateAssessmentStatistics,
  
  // Testes Obrigatórios
  configureMandatoryAssessment,
  getMandatoryAssessments,
  getMandatoryAssessmentsForSession,
  updateMandatoryAssessment,
  deactivateMandatoryAssessment,
  
  // Relatórios
  generateEvolutionReport
};

