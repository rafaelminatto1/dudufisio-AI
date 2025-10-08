/**
 * Quality Assurance Service - Supabase Integration
 * Serviço de Garantia de Qualidade e Compliance
 */

import { supabase } from '../../lib/supabase';
import {
  ComplianceStandard,
  AuditLogEntry,
  QualityMetric,
  ComplianceStatus,
} from '../../types/qualityAssuranceTypes';

class QualityAssuranceServiceSupabase {
  /**
   * Verifica compliance de documentos clínicos
   */
  async checkDocumentCompliance(documentId: string): Promise<ComplianceStandard[]> {
    try {
      const { data, error } = await supabase
        .from('compliance_validations')
        .select('*')
        .eq('document_id', documentId)
        .order('validated_at', { ascending: false });

      if (error) throw error;

      return data.map(d => ({
        standardId: d.id,
        standardName: d.validation_type.toUpperCase(),
        category: this.mapValidationType(d.validation_type),
        requirements: d.violations || [],
        complianceLevel: d.is_valid ? 1.0 : 0.0,
        status: d.is_valid ? 'compliant' : 'non_compliant',
        lastAuditDate: new Date(d.validated_at),
        findings: d.violations || [],
        correctiveActions: !d.is_valid ? this.generateCorrectiveActions(d.violations) : [],
      }));
    } catch (error) {
      console.error('Erro ao verificar compliance:', error);
      throw error;
    }
  }

  /**
   * Busca logs de auditoria
   */
  async getAuditLogs(
    startDate?: Date,
    endDate?: Date,
    action?: string
  ): Promise<AuditLogEntry[]> {
    try {
      let query = supabase
        .from('audit_trail')
        .select(`
          *,
          users (full_name)
        `)
        .order('performed_at', { ascending: false });

      if (startDate) {
        query = query.gte('performed_at', startDate.toISOString());
      }

      if (endDate) {
        query = query.lte('performed_at', endDate.toISOString());
      }

      if (action) {
        query = query.eq('action', action);
      }

      const { data, error } = await query.limit(100);

      if (error) throw error;

      return data.map(d => ({
        entryId: d.id,
        timestamp: new Date(d.performed_at),
        action: d.action,
        entityType: 'document',
        entityId: d.document_id || '',
        userId: d.performed_by,
        userName: d.users?.full_name || 'Usuário',
        ipAddress: d.ip_address || '',
        userAgent: d.user_agent || '',
        changes: d.details || {},
        result: 'success',
      }));
    } catch (error) {
      console.error('Erro ao buscar logs de auditoria:', error);
      throw error;
    }
  }

  /**
   * Calcula métricas de qualidade
   */
  async getQualityMetrics(
    startDate: Date,
    endDate: Date
  ): Promise<QualityMetric[]> {
    try {
      const metrics: QualityMetric[] = [];

      // Métrica 1: Taxa de documentação completa
      const { data: documents } = await supabase
        .from('clinical_documents')
        .select('status, is_signed')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

      if (documents) {
        const signed = documents.filter(d => d.is_signed).length;
        const total = documents.length;
        const documentationRate = total > 0 ? (signed / total) * 100 : 0;

        metrics.push({
          metricId: 'doc-completion',
          metricName: 'Taxa de Documentação Completa',
          category: 'documentation',
          currentValue: documentationRate,
          targetValue: 95,
          unit: '%',
          trend: 'stable',
          status: documentationRate >= 95 ? 'excellent' : 
                  documentationRate >= 80 ? 'good' : 
                  documentationRate >= 60 ? 'fair' : 'poor',
          period: { start: startDate, end: endDate },
          measuredAt: new Date(),
        });
      }

      // Métrica 2: Taxa de satisfação do paciente
      const { data: outcomes } = await supabase
        .from('treatment_outcomes')
        .select('patient_satisfaction')
        .gte('measurement_date', startDate.toISOString().split('T')[0])
        .lte('measurement_date', endDate.toISOString().split('T')[0])
        .not('patient_satisfaction', 'is', null);

      if (outcomes && outcomes.length > 0) {
        const avgSatisfaction = outcomes.reduce((sum, o) => 
          sum + (o.patient_satisfaction || 0), 0) / outcomes.length;

        metrics.push({
          metricId: 'patient-satisfaction',
          metricName: 'Satisfação do Paciente',
          category: 'patient_satisfaction',
          currentValue: avgSatisfaction,
          targetValue: 8.5,
          unit: '/10',
          trend: 'improving',
          status: avgSatisfaction >= 8.5 ? 'excellent' :
                  avgSatisfaction >= 7.5 ? 'good' :
                  avgSatisfaction >= 6.5 ? 'fair' : 'poor',
          period: { start: startDate, end: endDate },
          measuredAt: new Date(),
        });
      }

      // Métrica 3: Taxa de adesão ao tratamento
      const { data: appointments } = await supabase
        .from('appointments')
        .select('status')
        .gte('appointment_date', startDate.toISOString().split('T')[0])
        .lte('appointment_date', endDate.toISOString().split('T')[0]);

      if (appointments) {
        const completed = appointments.filter(a => a.status === 'completed').length;
        const total = appointments.length;
        const adherenceRate = total > 0 ? (completed / total) * 100 : 0;

        metrics.push({
          metricId: 'adherence-rate',
          metricName: 'Taxa de Adesão',
          category: 'treatment_adherence',
          currentValue: adherenceRate,
          targetValue: 85,
          unit: '%',
          trend: 'stable',
          status: adherenceRate >= 85 ? 'excellent' :
                  adherenceRate >= 75 ? 'good' :
                  adherenceRate >= 65 ? 'fair' : 'poor',
          period: { start: startDate, end: endDate },
          measuredAt: new Date(),
        });
      }

      // Métrica 4: Tempo médio de tratamento
      const { data: effectiveness } = await supabase
        .from('treatment_effectiveness')
        .select('start_date, end_date')
        .gte('start_date', startDate.toISOString().split('T')[0])
        .lte('end_date', endDate.toISOString().split('T')[0])
        .not('end_date', 'is', null);

      if (effectiveness && effectiveness.length > 0) {
        const avgDuration = effectiveness.reduce((sum, t) => {
          const start = new Date(t.start_date);
          const end = new Date(t.end_date);
          const days = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
          return sum + days;
        }, 0) / effectiveness.length;

        metrics.push({
          metricId: 'treatment-duration',
          metricName: 'Duração Média de Tratamento',
          category: 'treatment_effectiveness',
          currentValue: avgDuration,
          targetValue: 45,
          unit: 'dias',
          trend: 'stable',
          status: avgDuration <= 45 ? 'excellent' :
                  avgDuration <= 60 ? 'good' :
                  avgDuration <= 75 ? 'fair' : 'poor',
          period: { start: startDate, end: endDate },
          measuredAt: new Date(),
        });
      }

      return metrics;
    } catch (error) {
      console.error('Erro ao calcular métricas de qualidade:', error);
      throw error;
    }
  }

  /**
   * Gera relatório de compliance geral
   */
  async getComplianceReport(startDate: Date, endDate: Date): Promise<any> {
    try {
      const { data: validations, error } = await supabase
        .from('compliance_validations')
        .select('validation_type, is_valid, violations')
        .gte('validated_at', startDate.toISOString())
        .lte('validated_at', endDate.toISOString());

      if (error) throw error;

      // Calcular taxas de compliance por tipo
      const complianceByType = validations.reduce((acc, v) => {
        if (!acc[v.validation_type]) {
          acc[v.validation_type] = { total: 0, compliant: 0 };
        }
        acc[v.validation_type].total++;
        if (v.is_valid) acc[v.validation_type].compliant++;
        return acc;
      }, {} as Record<string, { total: number; compliant: number }>);

      const report = Object.entries(complianceByType).map(([type, stats]) => ({
        standard: type.toUpperCase(),
        complianceRate: (stats.compliant / stats.total) * 100,
        totalChecks: stats.total,
        passedChecks: stats.compliant,
        failedChecks: stats.total - stats.compliant,
      }));

      return {
        period: { start: startDate, end: endDate },
        overallCompliance: validations.filter(v => v.is_valid).length / validations.length * 100,
        byStandard: report,
        totalChecks: validations.length,
      };
    } catch (error) {
      console.error('Erro ao gerar relatório de compliance:', error);
      throw error;
    }
  }

  /**
   * Helpers privados
   */
  private mapValidationType(type: string): string {
    const mapping: Record<string, string> = {
      'cfm': 'regulatory',
      'coffito': 'regulatory',
      'lgpd': 'privacy',
      'fhir': 'technical',
    };
    return mapping[type.toLowerCase()] || 'regulatory';
  }

  private generateCorrectiveActions(violations: any[]): string[] {
    if (!violations || violations.length === 0) return [];

    return violations.map(v => 
      `Corrigir: ${JSON.stringify(v)}`
    );
  }
}

export const qualityAssuranceServiceSupabase = new QualityAssuranceServiceSupabase();

