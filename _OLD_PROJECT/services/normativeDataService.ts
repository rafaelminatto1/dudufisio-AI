/**
 * Normative Data Service - Serviço de dados normativos para comparação
 * Fornece valores de referência baseados em literatura científica
 */

export interface NormativeReference {
  metric: string;
  age: number;
  gender: 'M' | 'F';
  normValue: number;
  range: [number, number];  // [min, max]
  percentile?: number;
  source?: string;
  notes?: string;
}

export interface ComparisonResult {
  status: 'below' | 'normal' | 'above';
  percentile: number;
  interpretation: string;
  deviation: number; // Quanto desvia do valor normal
  recommendation?: string;
}

// Base de dados normativos (exemplos - expandir com dados reais da literatura)
const NORMATIVE_DATABASE: Record<string, NormativeReference[]> = {
  // Amplitude de Flexão do Joelho (Idade: 20-40 anos)
  kneeFlexion_20_40: [
    { metric: 'kneeFlexion', age: 25, gender: 'M', normValue: 135, range: [120, 150], source: 'Kendall et al., 2005' },
    { metric: 'kneeFlexion', age: 25, gender: 'F', normValue: 135, range: [120, 150], source: 'Kendall et al., 2005' },
    { metric: 'kneeFlexion', age: 35, gender: 'M', normValue: 130, range: [115, 145], source: 'Kendall et al., 2005' },
    { metric: 'kneeFlexion', age: 35, gender: 'F', normValue: 130, range: [115, 145], source: 'Kendall et al., 2005' }
  ],
  
  // Amplitude de Extensão do Joelho
  kneeExtension_20_40: [
    { metric: 'kneeExtension', age: 25, gender: 'M', normValue: 0, range: [-5, 0], source: 'Kendall et al., 2005' },
    { metric: 'kneeExtension', age: 25, gender: 'F', normValue: 0, range: [-5, 0], source: 'Kendall et al., 2005' }
  ],
  
  // Teste de Schober (Flexibilidade Lombar)
  schober_20_40: [
    { metric: 'schober', age: 25, gender: 'M', normValue: 5.0, range: [4.0, 6.0], source: 'Macrae & Wright, 1969' },
    { metric: 'schober', age: 25, gender: 'F', normValue: 5.5, range: [4.5, 6.5], source: 'Macrae & Wright, 1969' },
    { metric: 'schober', age: 35, gender: 'M', normValue: 4.5, range: [3.5, 5.5], source: 'Macrae & Wright, 1969' },
    { metric: 'schober', age: 35, gender: 'F', normValue: 5.0, range: [4.0, 6.0], source: 'Macrae & Wright, 1969' }
  ],
  
  // Distância Dedo-Chão
  fingerFloor_20_40: [
    { metric: 'fingerFloor', age: 25, gender: 'M', normValue: 2, range: [0, 10], source: 'Kendall et al., 2005' },
    { metric: 'fingerFloor', age: 25, gender: 'F', normValue: 0, range: [0, 8], source: 'Kendall et al., 2005' }
  ],
  
  // Flexão do Ombro
  shoulderFlexion_20_40: [
    { metric: 'shoulderFlexion', age: 25, gender: 'M', normValue: 180, range: [170, 180], source: 'Kendall et al., 2005' },
    { metric: 'shoulderFlexion', age: 25, gender: 'F', normValue: 180, range: [170, 180], source: 'Kendall et al., 2005' }
  ],
  
  // Dorsiflexão do Tornozelo
  ankleDorsiflexion_20_40: [
    { metric: 'ankleDorsiflexion', age: 25, gender: 'M', normValue: 15, range: [10, 20], source: 'Kendall et al., 2005' },
    { metric: 'ankleDorsiflexion', age: 25, gender: 'F', normValue: 15, range: [10, 20], source: 'Kendall et al., 2005' }
  ],
  
  // Força do Quadríceps (% do membro contralateral)
  quadricepsStrength: [
    { metric: 'quadricepsStrength', age: 25, gender: 'M', normValue: 85, range: [70, 100], source: 'Daniels & Worthingham, 2007' },
    { metric: 'quadricepsStrength', age: 25, gender: 'F', normValue: 85, range: [70, 100], source: 'Daniels & Worthingham, 2007' }
  ]
};

/**
 * Comparar valor do paciente com dados normativos
 */
export function compareToNormative(
  patientValue: number,
  metric: string,
  age: number,
  gender: 'M' | 'F'
): ComparisonResult {
  // Buscar dados normativos mais próximos da idade
  const ageKey = getAgeKey(age);
  const dataKey = `${metric}_${ageKey}`;
  
  const normativeData = NORMATIVE_DATABASE[dataKey] || 
                        NORMATIVE_DATABASE[`${metric}`] ||
                        [];

  if (normativeData.length === 0) {
    return {
      status: 'normal',
      percentile: 50,
      interpretation: 'Dados normativos não disponíveis para esta métrica',
      deviation: 0
    };
  }

  // Selecionar dados mais próximos da idade e gênero
  const closest = normativeData
    .filter(d => d.gender === gender)
    .sort((a, b) => Math.abs(a.age - age) - Math.abs(b.age - age))[0];

  if (!closest) {
    return {
      status: 'normal',
      percentile: 50,
      interpretation: 'Dados normativos não disponíveis para este perfil',
      deviation: 0
    };
  }

  const { range, normValue } = closest;

  // Determinar status
  let status: 'below' | 'normal' | 'above';
  if (patientValue < range[0]) {
    status = 'below';
  } else if (patientValue > range[1]) {
    status = 'above';
  } else {
    status = 'normal';
  }

  // Calcular percentil aproximado
  const percentile = calculatePercentile(patientValue, range, normValue);

  // Calcular desvio
  const deviation = ((patientValue - normValue) / normValue) * 100;

  // Gerar interpretação
  const interpretation = generateInterpretation(patientValue, range, normValue, status, metric);

  // Gerar recomendação
  const recommendation = generateRecommendation(status, deviation, metric);

  return {
    status,
    percentile,
    interpretation,
    deviation,
    recommendation
  };
}

/**
 * Obter dados normativos para uma métrica
 */
export function getNormativeData(
  metric: string,
  age: number,
  gender: 'M' | 'F'
): NormativeReference | null {
  const ageKey = getAgeKey(age);
  const dataKey = `${metric}_${ageKey}`;
  
  const normativeData = NORMATIVE_DATABASE[dataKey] || 
                        NORMATIVE_DATABASE[`${metric}`] ||
                        [];

  const closest = normativeData
    .filter(d => d.gender === gender)
    .sort((a, b) => Math.abs(a.age - age) - Math.abs(b.age - age))[0];

  return closest || null;
}

/**
 * Calcular percentil aproximado
 */
function calculatePercentile(
  value: number,
  range: [number, number],
  normValue: number
): number {
  const [min, max] = range;
  
  if (value < min) {
    // Abaixo do mínimo - percentil < 5
    return Math.max(0, ((value - min) / (min - normValue)) * 5);
  } else if (value > max) {
    // Acima do máximo - percentil > 95
    return Math.min(100, 95 + ((value - max) / (max - normValue)) * 5);
  } else {
    // Dentro da faixa normal - percentil entre 5 e 95
    return 5 + ((value - min) / (max - min)) * 90;
  }
}

/**
 * Gerar interpretação textual
 */
function generateInterpretation(
  value: number,
  range: [number, number],
  normValue: number,
  status: string,
  metric: string
): string {
  const [min, max] = range;

  switch (status) {
    case 'below':
      const belowPercent = ((normValue - value) / normValue) * 100;
      if (belowPercent > 30) {
        return `Valor significativamente abaixo da normalidade (${belowPercent.toFixed(0)}% abaixo). Requer atenção imediata.`;
      } else if (belowPercent > 15) {
        return `Valor abaixo da normalidade (${belowPercent.toFixed(0)}% abaixo). Considerar intervenção.`;
      } else {
        return `Valor ligeiramente abaixo da normalidade (${belowPercent.toFixed(0)}% abaixo).`;
      }
    
    case 'above':
      const abovePercent = ((value - normValue) / normValue) * 100;
      if (abovePercent > 30) {
        return `Valor significativamente acima da normalidade (${abovePercent.toFixed(0)}% acima). Verificar medição.`;
      } else if (abovePercent > 15) {
        return `Valor acima da normalidade (${abovePercent.toFixed(0)}% acima).`;
      } else {
        return `Valor ligeiramente acima da normalidade (${abovePercent.toFixed(0)}% acima).`;
      }
    
    case 'normal':
      return `Valor dentro da faixa de normalidade (${min}-${max}).`;
    
    default:
      return 'Valor dentro dos parâmetros esperados.';
  }
}

/**
 * Gerar recomendação baseada no status
 */
function generateRecommendation(
  status: string,
  deviation: number,
  metric: string
): string {
  switch (status) {
    case 'below':
      if (deviation < -30) {
        return `Intensificar tratamento para ${metric}. Considerar reavaliação do protocolo.`;
      } else if (deviation < -15) {
        return `Manter foco em exercícios para melhora de ${metric}.`;
      } else {
        return `Continuar tratamento com progressão gradual para ${metric}.`;
      }
    
    case 'above':
      return `Valor acima do normal. Verificar técnica de medição ou considerar hiperfrouxidão.`;
    
    case 'normal':
      return `Manter exercícios de manutenção para ${metric}.`;
    
    default:
      return '';
  }
}

/**
 * Obter chave de idade para busca
 */
function getAgeKey(age: number): string {
  if (age < 30) return '20_40';
  if (age < 50) return '30_50';
  if (age < 70) return '50_70';
  return '70_90';
}

/**
 * Obter percentil de múltiplas métricas
 */
export function compareMultipleMetrics(
  metrics: Array<{ name: string; value: number }>,
  age: number,
  gender: 'M' | 'F'
): Array<ComparisonResult & { metric: string }> {
  return metrics.map(m => ({
    ...compareToNormative(m.value, m.name, age, gender),
    metric: m.name
  }));
}

/**
 * Calcular escore de funcionalidade geral
 */
export function calculateOverallFunctionalityScore(
  comparisons: Array<ComparisonResult & { metric: string }>
): {
  score: number;
  level: 'excelente' | 'bom' | 'regular' | 'ruim';
  interpretation: string;
} {
  // Pesos para cada métrica (ajustar conforme relevância)
  const weights: Record<string, number> = {
    kneeFlexion: 0.3,
    kneeExtension: 0.2,
    quadricepsStrength: 0.3,
    painLevel: 0.2
  };

  let totalScore = 0;
  let totalWeight = 0;

  comparisons.forEach(comp => {
    const weight = weights[comp.metric] || 0.1;
    const metricScore = comp.percentile;
    totalScore += metricScore * weight;
    totalWeight += weight;
  });

  const finalScore = totalScore / totalWeight;

  let level: 'excelente' | 'bom' | 'regular' | 'ruim';
  let interpretation: string;

  if (finalScore >= 75) {
    level = 'excelente';
    interpretation = 'Funcionalidade excelente. Paciente próximo ou acima dos valores normativos.';
  } else if (finalScore >= 50) {
    level = 'bom';
    interpretation = 'Funcionalidade boa. Paciente dentro da faixa de normalidade.';
  } else if (finalScore >= 25) {
    level = 'regular';
    interpretation = 'Funcionalidade regular. Paciente abaixo dos valores normativos, mas com potencial de melhora.';
  } else {
    level = 'ruim';
    interpretation = 'Funcionalidade comprometida. Paciente significativamente abaixo dos valores normativos.';
  }

  return {
    score: finalScore,
    level,
    interpretation
  };
}

export const normativeDataService = {
  compareToNormative,
  getNormativeData,
  compareMultipleMetrics,
  calculateOverallFunctionalityScore
};

export default normativeDataService;

