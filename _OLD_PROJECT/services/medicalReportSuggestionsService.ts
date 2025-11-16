import { MedicalInsight, Patient } from '../types';
import * as testEvolutionService from './testEvolutionService';
import * as sessionEvolutionService from './sessionEvolutionService';
import * as surgeryService from './surgeryService';
import * as patientGoalsService from './patientGoalsService';
import { logDataSource } from '../config/supabaseTablesConfig';

/**
 * Service para geração automática de insights e sugestões para relatórios médicos
 * Analisa evolução do paciente e gera texto para laudos
 * MODO HÍBRIDO: Pode cachear insights no Supabase
 */

// ============================================================================
// INSIGHT GENERATION
// ============================================================================

/**
 * Gera insights completos sobre a evolução do paciente
 */
export async function generateMedicalInsights(patientId: string): Promise<MedicalInsight[]> {
  try {
    const insights: MedicalInsight[] = [];

    // Insights de redução de dor
    const painInsights = await generatePainReductionInsights(patientId);
    insights.push(...painInsights);

    // Insights de melhora de amplitude
    const rangeInsights = await generateRangeImprovementInsights(patientId);
    insights.push(...rangeInsights);

    // Insights de ganho de força
    const strengthInsights = await generateStrengthGainInsights(patientId);
    insights.push(...strengthInsights);

    // Insights de progresso funcional
    const functionalInsights = await generateFunctionalProgressInsights(patientId);
    insights.push(...functionalInsights);

    // Marcos importantes
    const milestones = await generateMilestoneInsights(patientId);
    insights.push(...milestones);

    // Alertas relevantes
    const alerts = await generateAlertInsights(patientId);
    insights.push(...alerts);

    return insights.sort((a, b) => 
      new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime()
    );
  } catch (error) {
    console.error('Erro ao gerar insights médicos:', error);
    return [];
  }
}

/**
 * Gera insights sobre redução de dor
 */
async function generatePainReductionInsights(patientId: string): Promise<MedicalInsight[]> {
  try {
    const insights: MedicalInsight[] = [];
    const painData = await testEvolutionService.getTestEvolutionData(patientId, 'Escala de dor (EVA)');

    if (painData.length < 2) return insights;

    const firstValue = painData[0].value;
    const lastValue = painData[painData.length - 1].value;
    const improvement = firstValue - lastValue;
    const percentImprovement = firstValue > 0 ? (improvement / firstValue) * 100 : 0;

    if (improvement > 0) {
      const sessionCount = painData.length;
      
      insights.push({
        id: `insight_pain_${Date.now()}`,
        patientId,
        type: 'pain_reduction',
        title: 'Redução Significativa da Dor',
        description: `Paciente apresentou redução de ${improvement.toFixed(1)} pontos na escala de dor`,
        data: {
          metric: 'Dor (EVA)',
          initialValue: firstValue,
          currentValue: lastValue,
          improvement,
          percentImprovement,
          sessions: sessionCount,
          timeframe: `${sessionCount} sessões`,
        },
        severity: 'success',
        suggestedText: `O paciente apresentou evolução positiva quanto ao quadro álgico, com redução de ${improvement.toFixed(1)} pontos na Escala Visual Analógica (EVA), passando de ${firstValue}/10 na avaliação inicial para ${lastValue}/10 na sessão mais recente (${sessionCount} sessões realizadas). Esta redução de ${percentImprovement.toFixed(1)}% demonstra resposta adequada ao tratamento proposto.`,
        generatedAt: new Date().toISOString(),
      });
    }

    // Verificar se atingiu dor zero
    if (lastValue === 0 && firstValue > 0) {
      insights.push({
        id: `insight_pain_free_${Date.now()}`,
        patientId,
        type: 'milestone',
        title: 'Paciente Sem Dor',
        description: 'Paciente relata ausência completa de dor',
        data: {
          metric: 'Dor (EVA)',
          initialValue: firstValue,
          currentValue: 0,
          sessions: painData.length,
        },
        severity: 'success',
        suggestedText: `Importante destacar que o paciente evoluiu de um quadro álgico inicial de ${firstValue}/10 para ausência completa de dor (0/10), marco atingido após ${painData.length} sessões de fisioterapia.`,
        generatedAt: new Date().toISOString(),
      });
    }

    return insights;
  } catch (error) {
    console.error('Erro ao gerar insights de dor:', error);
    return [];
  }
}

/**
 * Gera insights sobre melhora de amplitude de movimento
 */
async function generateRangeImprovementInsights(patientId: string): Promise<MedicalInsight[]> {
  try {
    const insights: MedicalInsight[] = [];
    const testHistory = await testEvolutionService.getTestHistory(patientId);

    for (const [testName, data] of testHistory) {
      if (!testName.toLowerCase().includes('amplitude')) continue;
      if (data.length < 2) continue;

      const firstValue = data[0].value;
      const lastValue = data[data.length - 1].value;
      const improvement = lastValue - firstValue;
      const percentImprovement = firstValue > 0 ? (improvement / firstValue) * 100 : 0;

      if (improvement > 0) {
        insights.push({
          id: `insight_range_${Date.now()}_${testName}`,
          patientId,
          type: 'range_improvement',
          title: `Melhora de ${testName}`,
          description: `Ganho de ${improvement.toFixed(1)}° de amplitude`,
          data: {
            metric: testName,
            initialValue: firstValue,
            currentValue: lastValue,
            improvement,
            percentImprovement,
            sessions: data.length,
          },
          severity: 'success',
          suggestedText: `Observou-se ganho significativo de amplitude de movimento, com evolução de ${firstValue}° para ${lastValue}° (ganho de ${improvement.toFixed(1)}° - aumento de ${percentImprovement.toFixed(1)}%) ao longo de ${data.length} sessões.`,
          generatedAt: new Date().toISOString(),
        });
      }
    }

    return insights;
  } catch (error) {
    console.error('Erro ao gerar insights de amplitude:', error);
    return [];
  }
}

/**
 * Gera insights sobre ganho de força
 */
async function generateStrengthGainInsights(patientId: string): Promise<MedicalInsight[]> {
  try {
    const insights: MedicalInsight[] = [];
    const testHistory = await testEvolutionService.getTestHistory(patientId);

    for (const [testName, data] of testHistory) {
      if (!testName.toLowerCase().includes('força')) continue;
      if (data.length < 2) continue;

      const firstValue = data[0].value;
      const lastValue = data[data.length - 1].value;
      const improvement = lastValue - firstValue;

      if (improvement > 0) {
        insights.push({
          id: `insight_strength_${Date.now()}_${testName}`,
          patientId,
          type: 'strength_gain',
          title: `Ganho de Força Muscular`,
          description: `Evolução de grau ${firstValue} para grau ${lastValue}`,
          data: {
            metric: testName,
            initialValue: firstValue,
            currentValue: lastValue,
            improvement,
            sessions: data.length,
          },
          severity: 'success',
          suggestedText: `Teste de força muscular (${testName}) demonstrou evolução de grau ${firstValue}/5 na avaliação inicial para grau ${lastValue}/5 atual, evidenciando resposta positiva ao programa de fortalecimento implementado.`,
          generatedAt: new Date().toISOString(),
        });
      }
    }

    return insights;
  } catch (error) {
    console.error('Erro ao gerar insights de força:', error);
    return [];
  }
}

/**
 * Gera insights sobre progresso funcional
 */
async function generateFunctionalProgressInsights(patientId: string): Promise<MedicalInsight[]> {
  try {
    const insights: MedicalInsight[] = [];
    const testHistory = await testEvolutionService.getTestHistory(patientId);

    for (const [testName, data] of testHistory) {
      if (!['funcional', 'marcha', 'equilíbrio'].some(term => 
        testName.toLowerCase().includes(term)
      )) continue;
      
      if (data.length < 2) continue;

      const firstValue = data[0].value;
      const lastValue = data[data.length - 1].value;
      const improvement = lastValue - firstValue;
      const percentImprovement = firstValue > 0 ? (improvement / firstValue) * 100 : 0;

      if (Math.abs(percentImprovement) > 10) {
        insights.push({
          id: `insight_functional_${Date.now()}_${testName}`,
          patientId,
          type: 'functional_progress',
          title: 'Progresso Funcional',
          description: `Melhora de ${percentImprovement.toFixed(1)}% em ${testName}`,
          data: {
            metric: testName,
            initialValue: firstValue,
            currentValue: lastValue,
            improvement,
            percentImprovement,
            sessions: data.length,
          },
          severity: percentImprovement > 0 ? 'success' : 'warning',
          suggestedText: `Testes funcionais (${testName}) indicam ${percentImprovement > 0 ? 'melhora' : 'declínio'} de ${Math.abs(percentImprovement).toFixed(1)}% no desempenho, ${percentImprovement > 0 ? 'refletindo ganhos' : 'necessitando ajustes'} na capacidade funcional do paciente.`,
          generatedAt: new Date().toISOString(),
        });
      }
    }

    return insights;
  } catch (error) {
    console.error('Erro ao gerar insights funcionais:', error);
    return [];
  }
}

/**
 * Gera insights sobre marcos importantes
 */
async function generateMilestoneInsights(patientId: string): Promise<MedicalInsight[]> {
  try {
    const insights: MedicalInsight[] = [];
    const sessions = await sessionEvolutionService.getEvolutionsByPatientId(patientId);

    // Marco: Retorno ao esporte
    const sportReturn = sessions.find(s =>
      s.notes?.toLowerCase().includes('retorno') && 
      s.notes?.toLowerCase().includes('esporte')
    );

    if (sportReturn) {
      insights.push({
        id: `insight_milestone_sport_${Date.now()}`,
        patientId,
        type: 'milestone',
        title: 'Retorno ao Esporte',
        description: `Paciente retornou às atividades esportivas na sessão ${sportReturn.sessionNumber}`,
        data: {
          sessions: sportReturn.sessionNumber,
          timeframe: new Date(sportReturn.sessionDate).toLocaleDateString('pt-BR'),
        },
        severity: 'success',
        suggestedText: `Paciente apresentou condições para retorno gradual às atividades esportivas a partir da ${sportReturn.sessionNumber}ª sessão (${new Date(sportReturn.sessionDate).toLocaleDateString('pt-BR')}), demonstrando recuperação funcional adequada e segura para progressão de carga.`,
        generatedAt: new Date().toISOString(),
      });
    }

    // Marco: Alta número de sessões
    if (sessions.length >= 20) {
      insights.push({
        id: `insight_milestone_sessions_${Date.now()}`,
        patientId,
        type: 'milestone',
        title: 'Tratamento Prolongado',
        description: `Paciente completou ${sessions.length} sessões de fisioterapia`,
        data: {
          sessions: sessions.length,
        },
        severity: 'info',
        suggestedText: `Paciente completou ${sessions.length} sessões de fisioterapia, demonstrando adesão ao tratamento proposto ao longo de ${Math.floor(sessions.length / 4)} meses.`,
        generatedAt: new Date().toISOString(),
      });
    }

    return insights;
  } catch (error) {
    console.error('Erro ao gerar insights de marcos:', error);
    return [];
  }
}

/**
 * Gera insights de alerta
 */
async function generateAlertInsights(patientId: string): Promise<MedicalInsight[]> {
  try {
    const insights: MedicalInsight[] = [];

    // Verificar cirurgias recentes
    const recentSurgeries = await surgeryService.getRecentSurgeries(patientId);
    if (recentSurgeries.length > 0) {
      const surgery = recentSurgeries[0];
      const info = surgeryService.formatSurgeryInfo(surgery);

      if (info.isCritical) {
        insights.push({
          id: `insight_alert_surgery_${Date.now()}`,
          patientId,
          type: 'alert',
          title: 'Período Pós-Operatório Crítico',
          description: `Paciente em pós-operatório recente de ${surgery.name}`,
          data: {
            timeframe: info.timeSince,
          },
          severity: 'warning',
          suggestedText: `Paciente encontra-se em período pós-operatório de ${surgery.name} (${info.timeSince}), fase crítica que requer monitoramento rigoroso e progressão cautelosa do tratamento.`,
          generatedAt: new Date().toISOString(),
        });
      }
    }

    return insights;
  } catch (error) {
    console.error('Erro ao gerar insights de alerta:', error);
    return [];
  }
}

// ============================================================================
// REPORT GENERATION
// ============================================================================

/**
 * Gera relatório médico completo em texto
 */
export async function generateFullMedicalReport(patientId: string): Promise<string> {
  try {
    const insights = await generateMedicalInsights(patientId);
    const sessions = await sessionEvolutionService.getSessionSummary(patientId);

    const reportSections: string[] = [];

    // Cabeçalho
    reportSections.push('RELATÓRIO DE EVOLUÇÃO FISIOTERAPÊUTICA\n');
    reportSections.push(`Total de sessões realizadas: ${sessions.totalSessions}`);
    reportSections.push(`Período: ${sessions.firstSessionDate ? new Date(sessions.firstSessionDate).toLocaleDateString('pt-BR') : 'N/A'} a ${sessions.lastSessionDate ? new Date(sessions.lastSessionDate).toLocaleDateString('pt-BR') : 'N/A'}\n`);

    // Evolução clínica
    const successInsights = insights.filter(i => i.severity === 'success');
    if (successInsights.length > 0) {
      reportSections.push('EVOLUÇÃO CLÍNICA:');
      successInsights.forEach(insight => {
        if (insight.suggestedText) {
          reportSections.push(`- ${insight.suggestedText}`);
        }
      });
      reportSections.push('');
    }

    // Marcos importantes
    const milestones = insights.filter(i => i.type === 'milestone');
    if (milestones.length > 0) {
      reportSections.push('MARCOS IMPORTANTES:');
      milestones.forEach(insight => {
        if (insight.suggestedText) {
          reportSections.push(`- ${insight.suggestedText}`);
        }
      });
      reportSections.push('');
    }

    // Alertas
    const alerts = insights.filter(i => i.type === 'alert');
    if (alerts.length > 0) {
      reportSections.push('CONSIDERAÇÕES ESPECIAIS:');
      alerts.forEach(insight => {
        if (insight.suggestedText) {
          reportSections.push(`- ${insight.suggestedText}`);
        }
      });
      reportSections.push('');
    }

    return reportSections.join('\n');
  } catch (error) {
    console.error('Erro ao gerar relatório médico:', error);
    return 'Erro ao gerar relatório';
  }
}

/**
 * Gera resumo executivo curto
 */
export async function generateExecutiveSummary(patientId: string): Promise<string> {
  try {
    const insights = await generateMedicalInsights(patientId);
    const sessions = await sessionEvolutionService.getSessionSummary(patientId);

    const highlights: string[] = [];

    // Principais melhoras
    const topImprovements = insights
      .filter(i => i.severity === 'success' && i.data.percentImprovement)
      .sort((a, b) => (b.data.percentImprovement || 0) - (a.data.percentImprovement || 0))
      .slice(0, 3);

    topImprovements.forEach(insight => {
      highlights.push(`✓ ${insight.title}: ${insight.description}`);
    });

    // Resumo
    const summary = `
RESUMO EXECUTIVO

Paciente completou ${sessions.totalSessions} sessões de fisioterapia.

Principais Resultados:
${highlights.join('\n')}

Nível médio de dor: ${sessions.averagePainLevel}/10
    `.trim();

    return summary;
  } catch (error) {
    console.error('Erro ao gerar resumo executivo:', error);
    return 'Erro ao gerar resumo';
  }
}

/**
 * Exporta insights para formato estruturado (JSON)
 */
export function exportInsightsToJSON(insights: MedicalInsight[]): string {
  return JSON.stringify(insights, null, 2);
}

/**
 * Filtra insights por tipo
 */
export function filterInsightsByType(
  insights: MedicalInsight[],
  types: MedicalInsight['type'][]
): MedicalInsight[] {
  return insights.filter(i => types.includes(i.type));
}

/**
 * Filtra insights por severidade
 */
export function filterInsightsBySeverity(
  insights: MedicalInsight[],
  severities: MedicalInsight['severity'][]
): MedicalInsight[] {
  return insights.filter(i => i.severity && severities.includes(i.severity));
}

