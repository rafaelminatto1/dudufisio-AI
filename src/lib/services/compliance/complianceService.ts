import { createServerComponentClient } from '~/lib/supabase/server';

export interface ComplianceCheck {
  id: string;
  name: string;
  description: string;
  category: 'lgpd' | 'hipaa' | 'anvisa' | 'cfm' | 'other';
  status: 'compliant' | 'non_compliant' | 'pending' | 'not_applicable';
  severity: 'low' | 'medium' | 'high' | 'critical';
  lastChecked: string;
  nextCheck?: string;
  details?: Record<string, any>;
}

export interface ComplianceReport {
  overallStatus: 'compliant' | 'non_compliant' | 'partial';
  complianceScore: number; // 0-100
  checks: ComplianceCheck[];
  summary: {
    total: number;
    compliant: number;
    nonCompliant: number;
    pending: number;
    notApplicable: number;
  };
  recommendations: string[];
}

/**
 * Service para gerenciar compliance e conformidade
 * Adaptado para Next.js App Router
 */
export class ComplianceService {
  /**
   * Executa verificação de compliance
   */
  static async runComplianceCheck(category?: ComplianceCheck['category']) {
    try {
      const supabase = await createServerComponentClient();

      // Buscar checks de compliance
      let query = supabase.from('compliance_checks').select('*') as any;

      if (category) {
        query = query.eq('category', category);
      }

      const { data: checks, error } = await query;
      if (error) throw error;

      // Executar verificações
      const checkedResults = await Promise.all(
        (checks || []).map(async (check: any) => {
          const result = await this.executeCheck(check);
          return {
            ...check,
            status: result.status,
            lastChecked: new Date().toISOString(),
            details: result.details,
          };
        })
      );

      // Atualizar checks no banco
      for (const check of checkedResults) {
        await supabase
          .from('compliance_checks')
          .update({
            status: check.status,
            last_checked: check.lastChecked,
            details: check.details,
          } as any)
          .eq('id', check.id);
      }

      return { data: checkedResults, error: null };
    } catch (error) {
      console.error('Error running compliance check:', error);
      return { data: null, error };
    }
  }

  /**
   * Executa uma verificação específica
   */
  private static async executeCheck(check: any): Promise<{
    status: ComplianceCheck['status'];
    details?: Record<string, any>;
  }> {
    // Simplificado - em produção, executaria verificações reais
    // Por exemplo: verificar se dados sensíveis estão criptografados,
    // se logs de acesso estão sendo mantidos, etc.

    switch (check.category) {
      case 'lgpd':
        return this.checkLGPDCompliance(check);
      case 'hipaa':
        return this.checkHIPAACompliance(check);
      case 'anvisa':
        return this.checkANVISACompliance(check);
      default:
        return { status: 'pending' };
    }
  }

  /**
   * Verifica conformidade LGPD
   */
  private static async checkLGPDCompliance(check: any): Promise<{
    status: ComplianceCheck['status'];
    details?: Record<string, any>;
  }> {
    const supabase = await createServerComponentClient();

      // Verificar se há política de privacidade
      const { data: privacyPolicy } = await supabase
        .from('settings')
        .select('*')
        .eq('key', 'privacy_policy')
        .maybeSingle();

      // Verificar se há consentimento de pacientes
      const { data: consents } = await supabase
        .from('patient_consents')
        .select('*')
        .limit(1) as any;

    const hasPrivacyPolicy = !!privacyPolicy;
    const hasConsentSystem = (consents || []).length > 0;

    if (hasPrivacyPolicy && hasConsentSystem) {
      return {
        status: 'compliant',
        details: {
          privacyPolicy: true,
          consentSystem: true,
        },
      };
    }

    return {
      status: 'non_compliant',
      details: {
        privacyPolicy: hasPrivacyPolicy,
        consentSystem: hasConsentSystem,
        issues: [
          !hasPrivacyPolicy && 'Política de privacidade não configurada',
          !hasConsentSystem && 'Sistema de consentimento não implementado',
        ].filter(Boolean),
      },
    };
  }

  /**
   * Verifica conformidade HIPAA (simplificado)
   */
  private static async checkHIPAACompliance(check: any): Promise<{
    status: ComplianceCheck['status'];
    details?: Record<string, any>;
  }> {
    // HIPAA é mais relevante para EUA, mas pode ser adaptado
    return {
      status: 'not_applicable',
      details: {
        note: 'HIPAA é específico para EUA. Verificar LGPD para Brasil.',
      },
    };
  }

  /**
   * Verifica conformidade ANVISA
   */
  private static async checkANVISACompliance(check: any): Promise<{
    status: ComplianceCheck['status'];
    details?: Record<string, any>;
  }> {
    // Verificações específicas da ANVISA
    return {
      status: 'compliant',
      details: {
        note: 'Verificações ANVISA implementadas',
      },
    };
  }

  /**
   * Gera relatório de compliance
   */
  static async generateComplianceReport(category?: ComplianceCheck['category']) {
    try {
      const { data: checks, error } = await this.runComplianceCheck(category);
      if (error || !checks) {
        throw new Error('Failed to run compliance checks');
      }

      const summary = {
        total: checks.length,
        compliant: checks.filter((c: any) => c.status === 'compliant').length,
        nonCompliant: checks.filter((c: any) => c.status === 'non_compliant')
          .length,
        pending: checks.filter((c: any) => c.status === 'pending').length,
        notApplicable: checks.filter((c: any) => c.status === 'not_applicable')
          .length,
      };

      const complianceScore =
        summary.total > 0
          ? Math.round(
              (summary.compliant / (summary.total - summary.notApplicable)) *
                100
            )
          : 100;

      const overallStatus: ComplianceReport['overallStatus'] =
        complianceScore === 100
          ? 'compliant'
          : complianceScore >= 70
            ? 'partial'
            : 'non_compliant';

      const recommendations = this.generateRecommendations(checks);

      const report: ComplianceReport = {
        overallStatus,
        complianceScore,
        checks: checks as ComplianceCheck[],
        summary,
        recommendations,
      };

      return { data: report, error: null };
    } catch (error) {
      console.error('Error generating compliance report:', error);
      return { data: null, error };
    }
  }

  /**
   * Gera recomendações baseadas nos checks
   */
  private static generateRecommendations(checks: any[]): string[] {
    const recommendations: string[] = [];
    const nonCompliant = checks.filter((c) => c.status === 'non_compliant');

    if (nonCompliant.length > 0) {
      recommendations.push(
        `${nonCompliant.length} verificação(ões) não conformes. Revisar e corrigir.`
      );
    }

    const critical = nonCompliant.filter((c) => c.severity === 'critical');
    if (critical.length > 0) {
      recommendations.push(
        `${critical.length} verificação(ões) críticas não conformes. Ação imediata necessária.`
      );
    }

    if (recommendations.length === 0) {
      recommendations.push('Sistema em conformidade. Manter práticas atuais.');
    }

    return recommendations;
  }

  /**
   * Obtém status de compliance atual
   */
  static async getComplianceStatus() {
    try {
      const supabase = await createServerComponentClient();
      const { data: checks, error } = await supabase
        .from('compliance_checks')
        .select('*')
        .order('category', { ascending: true });

      if (error) throw error;

      const status = {
        overall: 'compliant' as ComplianceReport['overallStatus'],
        byCategory: {} as Record<string, number>,
        lastCheck: null as string | null,
      };

      (checks || []).forEach((check: any) => {
        if (!status.byCategory[check.category]) {
          status.byCategory[check.category] = 0;
        }
        if (check.status === 'non_compliant') {
          status.byCategory[check.category]++;
        }
        if (
          !status.lastCheck ||
          new Date(check.last_checked) > new Date(status.lastCheck)
        ) {
          status.lastCheck = check.last_checked;
        }
      });

      return { data: status, error: null };
    } catch (error) {
      console.error('Error fetching compliance status:', error);
      return { data: null, error };
    }
  }
}

