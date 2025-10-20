/**
 * Report Suggestions Service - Serviço de sugestões automáticas para relatórios
 * Gera métricas relevantes baseadas na patologia do paciente
 */

import { Patient, Pathology } from '../types';

export interface ReportSuggestion {
  metric: string;
  insight: string;
  relevance: 'high' | 'medium' | 'low';
  chartRecommendation?: {
    type: 'line' | 'bar' | 'area' | 'scatter';
    metrics: string[];
    annotations?: boolean;
  };
  normativeComparison?: {
    metric: string;
    expectedRange: [number, number];
    unit: string;
  };
}

// Regras de patologia para sugestões de métricas
const PATHOLOGY_RULES: Record<string, ReportSuggestion[]> = {
  'LCA': [
    {
      metric: 'kneeFlexion',
      insight: 'Amplitude de flexão do joelho é crítica para retorno funcional',
      relevance: 'high',
      chartRecommendation: {
        type: 'line',
        metrics: ['kneeFlexion'],
        annotations: true
      },
      normativeComparison: {
        metric: 'kneeFlexion',
        expectedRange: [0, 135],
        unit: 'graus'
      }
    },
    {
      metric: 'kneeExtension',
      insight: 'Extensão completa do joelho é essencial para marcha normal',
      relevance: 'high',
      chartRecommendation: {
        type: 'line',
        metrics: ['kneeExtension'],
        annotations: true
      },
      normativeComparison: {
        metric: 'kneeExtension',
        expectedRange: [-5, 0],
        unit: 'graus'
      }
    },
    {
      metric: 'quadricepsStrength',
      insight: 'Força do quadríceps é fundamental para estabilidade do joelho',
      relevance: 'high',
      chartRecommendation: {
        type: 'line',
        metrics: ['quadricepsStrength'],
        annotations: true
      },
      normativeComparison: {
        metric: 'quadricepsStrength',
        expectedRange: [70, 100],
        unit: '% do membro contralateral'
      }
    },
    {
      metric: 'yBalance',
      insight: 'Teste de equilíbrio Y-Balance avalia risco de nova lesão',
      relevance: 'medium',
      chartRecommendation: {
        type: 'bar',
        metrics: ['yBalance'],
        annotations: false
      }
    },
    {
      metric: 'painLevel',
      insight: 'Evolução da dor guia progressão do protocolo',
      relevance: 'high',
      chartRecommendation: {
        type: 'line',
        metrics: ['painLevel'],
        annotations: true
      }
    }
  ],
  'Lombalgia': [
    {
      metric: 'painLevel',
      insight: 'Evolução da dor lombar é o principal desfecho',
      relevance: 'high',
      chartRecommendation: {
        type: 'line',
        metrics: ['painLevel'],
        annotations: true
      }
    },
    {
      metric: 'schober',
      insight: 'Teste de Schober avalia flexibilidade da coluna lombar',
      relevance: 'high',
      chartRecommendation: {
        type: 'line',
        metrics: ['schober'],
        annotations: false
      },
      normativeComparison: {
        metric: 'schober',
        expectedRange: [4, 6],
        unit: 'cm'
      }
    },
    {
      metric: 'fingerFloor',
      insight: 'Distância dedo-chão avalia flexibilidade posterior',
      relevance: 'medium',
      chartRecommendation: {
        type: 'line',
        metrics: ['fingerFloor'],
        annotations: false
      },
      normativeComparison: {
        metric: 'fingerFloor',
        expectedRange: [0, 10],
        unit: 'cm'
      }
    },
    {
      metric: 'functionalCapacity',
      insight: 'Capacidade funcional reflete impacto na vida diária',
      relevance: 'high',
      chartRecommendation: {
        type: 'bar',
        metrics: ['functionalCapacity'],
        annotations: false
      }
    }
  ],
  'Ombro': [
    {
      metric: 'shoulderFlexion',
      insight: 'Flexão do ombro é essencial para atividades acima da cabeça',
      relevance: 'high',
      chartRecommendation: {
        type: 'line',
        metrics: ['shoulderFlexion'],
        annotations: true
      },
      normativeComparison: {
        metric: 'shoulderFlexion',
        expectedRange: [0, 180],
        unit: 'graus'
      }
    },
    {
      metric: 'shoulderAbduction',
      insight: 'Abdução do ombro avalia integridade do manguito rotador',
      relevance: 'high',
      chartRecommendation: {
        type: 'line',
        metrics: ['shoulderAbduction'],
        annotations: true
      },
      normativeComparison: {
        metric: 'shoulderAbduction',
        expectedRange: [0, 180],
        unit: 'graus'
      }
    },
    {
      metric: 'painLevel',
      insight: 'Dor no ombro limita funcionalidade',
      relevance: 'high',
      chartRecommendation: {
        type: 'line',
        metrics: ['painLevel'],
        annotations: true
      }
    }
  ],
  'Tornozelo': [
    {
      metric: 'ankleDorsiflexion',
      insight: 'Dorsiflexão do tornozelo é crítica para marcha',
      relevance: 'high',
      chartRecommendation: {
        type: 'line',
        metrics: ['ankleDorsiflexion'],
        annotations: true
      },
      normativeComparison: {
        metric: 'ankleDorsiflexion',
        expectedRange: [0, 20],
        unit: 'graus'
      }
    },
    {
      metric: 'anklePlantarflexion',
      insight: 'Flexão plantar do tornozelo para propulsão',
      relevance: 'medium',
      chartRecommendation: {
        type: 'line',
        metrics: ['anklePlantarflexion'],
        annotations: false
      },
      normativeComparison: {
        metric: 'anklePlantarflexion',
        expectedRange: [0, 50],
        unit: 'graus'
      }
    },
    {
      metric: 'balance',
      insight: 'Equilíbrio unipodal avalia estabilidade',
      relevance: 'high',
      chartRecommendation: {
        type: 'bar',
        metrics: ['balance'],
        annotations: false
      }
    }
  ]
};

/**
 * Gerar sugestões de relatório baseado na patologia do paciente
 */
export function generateReportSuggestions(
  patient: Patient,
  pathologies?: Pathology[]
): ReportSuggestion[] {
  // Se patologias não foram fornecidas, usar patologias do paciente
  const patientPathologies = pathologies || patient.pathologies || [];
  
  if (patientPathologies.length === 0) {
    return getGenericSuggestions();
  }

  // Buscar regras para cada patologia
  const suggestions: ReportSuggestion[] = [];
  const addedMetrics = new Set<string>();

  patientPathologies.forEach(pathology => {
    const pathologyName = pathology.name.toUpperCase();
    
    // Buscar regras exatas ou parciais
    const rules = PATHOLOGY_RULES[pathologyName] || 
                  Object.entries(PATHOLOGY_RULES).find(([key]) => 
                    pathologyName.includes(key) || key.includes(pathologyName)
                  )?.[1];

    if (rules) {
      rules.forEach(rule => {
        // Evitar duplicatas
        if (!addedMetrics.has(rule.metric)) {
          suggestions.push(rule);
          addedMetrics.add(rule.metric);
        }
      });
    }
  });

  // Se não encontrou regras específicas, usar sugestões genéricas
  if (suggestions.length === 0) {
    return getGenericSuggestions();
  }

  // Ordenar por relevância
  return suggestions.sort((a, b) => {
    const relevanceOrder = { high: 3, medium: 2, low: 1 };
    return relevanceOrder[b.relevance] - relevanceOrder[a.relevance];
  });
}

/**
 * Sugestões genéricas quando não há patologia específica
 */
function getGenericSuggestions(): ReportSuggestion[] {
  return [
    {
      metric: 'painLevel',
      insight: 'Evolução da dor é um desfecho importante',
      relevance: 'high',
      chartRecommendation: {
        type: 'line',
        metrics: ['painLevel'],
        annotations: true
      }
    },
    {
      metric: 'functionalCapacity',
      insight: 'Capacidade funcional reflete impacto do tratamento',
      relevance: 'high',
      chartRecommendation: {
        type: 'bar',
        metrics: ['functionalCapacity'],
        annotations: false
      }
    },
    {
      metric: 'sessionAttendance',
      insight: 'Frequência às sessões impacta resultados',
      relevance: 'medium',
      chartRecommendation: {
        type: 'bar',
        metrics: ['sessionAttendance'],
        annotations: false
      }
    }
  ];
}

/**
 * Obter métricas relevantes para uma patologia específica
 */
export function getMetricsForPathology(pathologyName: string): string[] {
  const normalizedName = pathologyName.toUpperCase();
  const rules = PATHOLOGY_RULES[normalizedName] || 
                Object.entries(PATHOLOGY_RULES).find(([key]) => 
                  normalizedName.includes(key) || key.includes(normalizedName)
                )?.[1];

  return rules?.map(r => r.metric) || [];
}

/**
 * Obter comparação normativa para uma métrica
 */
export function getNormativeComparison(
  metric: string,
  pathologyName?: string
): ReportSuggestion['normativeComparison'] | null {
  const normalizedName = pathologyName?.toUpperCase() || '';
  const rules = PATHOLOGY_RULES[normalizedName] || 
                Object.entries(PATHOLOGY_RULES).find(([key]) => 
                  normalizedName.includes(key) || key.includes(normalizedName)
                )?.[1];

  const suggestion = rules?.find(r => r.metric === metric);
  return suggestion?.normativeComparison || null;
}

/**
 * Gerar insights automáticos baseados em dados do paciente
 */
export function generateInsights(
  patient: Patient,
  sessionData: any[]
): string[] {
  const insights: string[] = [];

  // Insight sobre tempo de tratamento
  if (patient.registration_date) {
    const daysInTreatment = Math.floor(
      (new Date().getTime() - new Date(patient.registration_date).getTime()) / 
      (1000 * 60 * 60 * 24)
    );
    
    if (daysInTreatment > 90) {
      insights.push(`Paciente em tratamento há ${daysInTreatment} dias - considerar reavaliação de objetivos`);
    }
  }

  // Insight sobre frequência
  if (sessionData.length > 0) {
    const avgDaysBetweenSessions = calculateAvgDaysBetweenSessions(sessionData);
    
    if (avgDaysBetweenSessions > 10) {
      insights.push(`Intervalo médio entre sessões: ${avgDaysBetweenSessions} dias - considerar aumentar frequência`);
    }
  }

  // Insight sobre cirurgias recentes
  if (patient.surgeries && patient.surgeries.length > 0) {
    const recentSurgery = patient.surgeries[0];
    const daysSinceSurgery = Math.floor(
      (new Date().getTime() - new Date(recentSurgery.date).getTime()) / 
      (1000 * 60 * 60 * 24)
    );
    
    if (daysSinceSurgery < 90) {
      insights.push(`Pós-operatório de ${recentSurgery.name} há ${daysSinceSurgery} dias - fase crítica de reabilitação`);
    }
  }

  // Insight sobre metas
  if (patient.goals && patient.goals.length > 0) {
    const activeGoals = patient.goals.filter(g => g.status === 'active');
    const nearDeadline = activeGoals.filter(g => {
      if (!g.targetDate) return false;
      const daysUntilDeadline = Math.floor(
        (new Date(g.targetDate).getTime() - new Date().getTime()) / 
        (1000 * 60 * 60 * 24)
      );
      return daysUntilDeadline < 30 && daysUntilDeadline > 0;
    });

    if (nearDeadline.length > 0) {
      insights.push(`${nearDeadline.length} meta(s) com prazo próximo - intensificar tratamento`);
    }
  }

  return insights;
}

/**
 * Calcular média de dias entre sessões
 */
function calculateAvgDaysBetweenSessions(sessionData: any[]): number {
  if (sessionData.length < 2) return 0;

  const sortedSessions = sessionData
    .map(s => new Date(s.date).getTime())
    .sort((a, b) => a - b);

  let totalDays = 0;
  for (let i = 1; i < sortedSessions.length; i++) {
    totalDays += (sortedSessions[i] - sortedSessions[i - 1]) / (1000 * 60 * 60 * 24);
  }

  return Math.floor(totalDays / (sortedSessions.length - 1));
}

export const reportSuggestionsService = {
  generateReportSuggestions,
  getMetricsForPathology,
  getNormativeComparison,
  generateInsights
};

export default reportSuggestionsService;

