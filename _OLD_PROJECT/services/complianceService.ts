/**
 * Compliance Service - Serviço para gerenciar conformidade de avaliações
 * Gerencia o registro de medições obrigatórias realizadas ou não
 */

import { supabase } from '../lib/supabaseClient';

export interface ComplianceLog {
  id: string;
  patientId: string;
  sessionId?: string;
  testConfigId?: string;
  testName: string;
  testType?: string;
  wasMeasured: boolean;
  skipReason?: string;
  measuredValue?: any;
  timing?: 'before' | 'during' | 'after' | 'independent';
  sessionNumber?: number;
  recordedAt: string;
  recordedBy: string;
  notes?: string;
  metadata?: any;
}

export interface CreateComplianceLogData {
  patientId: string;
  sessionId?: string;
  testConfigId?: string;
  testName: string;
  testType?: string;
  wasMeasured: boolean;
  skipReason?: string;
  measuredValue?: any;
  timing?: 'before' | 'during' | 'after' | 'independent';
  sessionNumber?: number;
  recordedBy: string;
  notes?: string;
  metadata?: any;
}

export interface ComplianceStats {
  totalRequired: number;
  totalMeasured: number;
  complianceRate: number;
  skippedTests: string[];
}

/**
 * Registrar uma entrada de conformidade
 */
export async function logCompliance(data: CreateComplianceLogData): Promise<ComplianceLog> {
  const { data: log, error } = await supabase
    .from('assessment_compliance_log')
    .insert({
      patient_id: data.patientId,
      session_id: data.sessionId,
      test_config_id: data.testConfigId,
      test_name: data.testName,
      test_type: data.testType,
      was_measured: data.wasMeasured,
      skip_reason: data.skipReason,
      measured_value: data.measuredValue,
      timing: data.timing,
      session_number: data.sessionNumber,
      recorded_by: data.recordedBy,
      notes: data.notes,
      metadata: data.metadata
    })
    .select()
    .single();

  if (error) {
    console.error('Erro ao registrar conformidade:', error);
    throw new Error(`Erro ao registrar conformidade: ${error.message}`);
  }

  return mapComplianceLogFromDb(log);
}

/**
 * Buscar logs de conformidade de um paciente
 */
export async function getPatientComplianceLogs(
  patientId: string,
  startDate?: Date,
  endDate?: Date
): Promise<ComplianceLog[]> {
  let query = supabase
    .from('assessment_compliance_log')
    .select('*')
    .eq('patient_id', patientId)
    .order('recorded_at', { ascending: false });

  if (startDate) {
    query = query.gte('recorded_at', startDate.toISOString());
  }

  if (endDate) {
    query = query.lte('recorded_at', endDate.toISOString());
  }

  const { data, error } = await query;

  if (error) {
    console.error('Erro ao buscar logs de conformidade:', error);
    throw new Error(`Erro ao buscar logs: ${error.message}`);
  }

  return data.map(mapComplianceLogFromDb);
}

/**
 * Calcular taxa de conformidade de um paciente
 */
export async function calculatePatientComplianceRate(
  patientId: string,
  startDate?: Date,
  endDate?: Date
): Promise<ComplianceStats> {
  const start = startDate?.toISOString() || null;
  const end = endDate?.toISOString() || null;

  const { data, error } = await supabase.rpc('calculate_patient_compliance_rate', {
    p_patient_id: patientId,
    p_start_date: start,
    p_end_date: end
  });

  if (error) {
    console.error('Erro ao calcular taxa de conformidade:', error);
    throw new Error(`Erro ao calcular conformidade: ${error.message}`);
  }

  if (!data || data.length === 0) {
    return {
      totalRequired: 0,
      totalMeasured: 0,
      complianceRate: 0,
      skippedTests: []
    };
  }

  return {
    totalRequired: data[0].total_required || 0,
    totalMeasured: data[0].total_measured || 0,
    complianceRate: data[0].compliance_rate || 0,
    skippedTests: data[0].skipped_tests || []
  };
}

/**
 * Buscar relatório de conformidade
 */
export async function getComplianceReport(
  startDate: Date,
  endDate: Date,
  testType?: string
): Promise<any[]> {
  const { data, error } = await supabase.rpc('get_compliance_report', {
    p_start_date: startDate.toISOString(),
    p_end_date: endDate.toISOString(),
    p_test_type: testType || null
  });

  if (error) {
    console.error('Erro ao buscar relatório de conformidade:', error);
    throw new Error(`Erro ao buscar relatório: ${error.message}`);
  }

  return data || [];
}

/**
 * Buscar resumo de conformidade (usando view)
 */
export async function getComplianceSummary(patientId: string): Promise<any[]> {
  const { data, error } = await supabase
    .from('v_assessment_compliance_summary')
    .select('*')
    .eq('patient_id', patientId)
    .order('compliance_rate', { ascending: true });

  if (error) {
    console.error('Erro ao buscar resumo de conformidade:', error);
    throw new Error(`Erro ao buscar resumo: ${error.message}`);
  }

  return data || [];
}

/**
 * Registrar não conformidade (quando profissional salva sem medir)
 */
export async function logNonCompliance(
  patientId: string,
  sessionId: string,
  tests: Array<{ testName: string; testType: string; testConfigId?: string }>,
  recordedBy: string,
  skipReason: string = 'Profissional optou por salvar sem realizar medição'
): Promise<void> {
  const logs = tests.map(test => ({
    patient_id: patientId,
    session_id: sessionId,
    test_config_id: test.testConfigId,
    test_name: test.testName,
    test_type: test.testType,
    was_measured: false,
    skip_reason: skipReason,
    timing: 'during' as const,
    recorded_by: recordedBy,
    notes: 'Medição não realizada - sessão salva sem conformidade'
  }));

  const { error } = await supabase
    .from('assessment_compliance_log')
    .insert(logs);

  if (error) {
    console.error('Erro ao registrar não conformidade:', error);
    throw new Error(`Erro ao registrar não conformidade: ${error.message}`);
  }
}

/**
 * Mapear dados do banco para interface
 */
function mapComplianceLogFromDb(data: any): ComplianceLog {
  return {
    id: data.id,
    patientId: data.patient_id,
    sessionId: data.session_id,
    testConfigId: data.test_config_id,
    testName: data.test_name,
    testType: data.test_type,
    wasMeasured: data.was_measured,
    skipReason: data.skip_reason,
    measuredValue: data.measured_value,
    timing: data.timing,
    sessionNumber: data.session_number,
    recordedAt: data.recorded_at,
    recordedBy: data.recorded_by,
    notes: data.notes,
    metadata: data.metadata
  };
}

/**
 * Exportar todas as funções
 */
export const complianceService = {
  logCompliance,
  getPatientComplianceLogs,
  calculatePatientComplianceRate,
  getComplianceReport,
  getComplianceSummary,
  logNonCompliance
};

export default complianceService;

