import {
  TestEvolutionData,
  TestResult,
  TestStatistics,
  AssessmentTestConfig,
  SessionEvolution,
} from '../types';
import * as patientService from './patientService';
import * as sessionEvolutionService from './sessionEvolutionService';
import { shouldUseSupabase, shouldFallbackToMock, logDataSource } from '../config/supabaseTablesConfig';

/**
 * Service para gerenciamento de evolução de testes ao longo das sessões
 * Fornece dados para gráficos, tabelas e estatísticas
 * MODO HÍBRIDO: Tenta Supabase primeiro, fallback para Mock
 */

// ============================================================================
// DATA RETRIEVAL
// ============================================================================

/**
 * Busca dados de evolução de um teste específico
 */
export async function getTestEvolutionData(
  patientId: string,
  testName: string
): Promise<TestEvolutionData[]> {
  try {
    const sessions = await sessionEvolutionService.getEvolutionsByPatientId(patientId);
    const evolutionData: TestEvolutionData[] = [];

    sessions.forEach((session, index) => {
      const testResults = session.testsPerformed.filter(
        t => t.testName.toLowerCase() === testName.toLowerCase()
      );

      testResults.forEach(test => {
        const previousSession = index > 0 ? sessions[index - 1] : null;
        const previousTest = previousSession?.testsPerformed.find(
          t => t.testName.toLowerCase() === testName.toLowerCase() && t.side === test.side
        );

        const variation = previousTest ? test.value - previousTest.value : 0;
        const percentChange = previousTest && previousTest.value !== 0
          ? ((test.value - previousTest.value) / previousTest.value) * 100
          : 0;

        evolutionData.push({
          sessionNumber: session.sessionNumber,
          sessionDate: session.sessionDate,
          testName: test.testName,
          value: test.value,
          unit: test.unit,
          side: test.side,
          variation,
          percentChange,
          notes: test.notes,
        });
      });
    });

    return evolutionData.sort((a, b) => a.sessionNumber - b.sessionNumber);
  } catch (error) {
    console.error('Erro ao buscar evolução do teste:', error);
    return [];
  }
}

/**
 * Busca histórico completo de todos os testes do paciente
 * Retorna um Map com testName como chave
 */
export async function getTestHistory(
  patientId: string
): Promise<Map<string, TestEvolutionData[]>> {
  try {
    const sessions = await sessionEvolutionService.getEvolutionsByPatientId(patientId);
    const testHistory = new Map<string, TestEvolutionData[]>();

    // Coletar todos os nomes de testes únicos
    const testNames = new Set<string>();
    sessions.forEach(session => {
      session.testsPerformed.forEach(test => {
        testNames.add(test.testName);
      });
    });

    // Buscar evolução de cada teste
    for (const testName of testNames) {
      const evolution = await getTestEvolutionData(patientId, testName);
      testHistory.set(testName, evolution);
    }

    return testHistory;
  } catch (error) {
    console.error('Erro ao buscar histórico de testes:', error);
    return new Map();
  }
}

/**
 * Adiciona resultado de teste a uma sessão
 */
export async function addTestResult(
  patientId: string,
  sessionId: string,
  result: Omit<TestResult, 'id' | 'assessedAt' | 'assessedBy'>
): Promise<void> {
  try {
    const session = await sessionEvolutionService.getSessionEvolution(sessionId);
    if (!session) {
      throw new Error(`Sessão ${sessionId} não encontrada`);
    }

    const newResult: TestResult = {
      ...result,
      id: `test_result_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      assessedAt: new Date().toISOString(),
    };

    const updatedTests = [...session.testsPerformed, newResult];

    await sessionEvolutionService.updateSessionEvolution(sessionId, {
      testsPerformed: updatedTests,
    });
  } catch (error) {
    console.error('Erro ao adicionar resultado de teste:', error);
    throw error;
  }
}

/**
 * Busca configurações de testes obrigatórios para uma sessão
 */
export async function getMandatoryTests(
  patientId: string,
  sessionNumber: number
): Promise<AssessmentTestConfig[]> {
  try {
    const patient = await patientService.getPatientById(patientId);
    if (!patient?.testConfigs) {
      return [];
    }

    const mandatoryTests = patient.testConfigs.filter(config => {
      if (!config.isMandatory || !config.frequencySessions) return false;

      // Verificar se é necessário realizar nesta sessão
      return sessionNumber % config.frequencySessions === 0;
    });

    return mandatoryTests;
  } catch (error) {
    console.error('Erro ao buscar testes obrigatórios:', error);
    return [];
  }
}

/**
 * Verifica se todos os testes obrigatórios foram realizados
 */
export async function checkMandatoryTestsCompleted(
  patientId: string,
  sessionId: string
): Promise<boolean> {
  try {
    const session = await sessionEvolutionService.getSessionEvolution(sessionId);
    if (!session) return false;

    const mandatoryTests = await getMandatoryTests(patientId, session.sessionNumber);
    
    if (mandatoryTests.length === 0) return true;

    // Verificar se todos foram realizados
    return mandatoryTests.every(config =>
      session.testsPerformed.some(test =>
        test.testName.toLowerCase() === config.testName.toLowerCase()
      )
    );
  } catch (error) {
    console.error('Erro ao verificar testes obrigatórios:', error);
    return false;
  }
}

/**
 * Calcula estatísticas de um teste específico
 */
export async function getTestStatistics(
  patientId: string,
  testName: string
): Promise<TestStatistics> {
  try {
    const evolutionData = await getTestEvolutionData(patientId, testName);

    if (evolutionData.length === 0) {
      throw new Error(`Nenhum dado encontrado para o teste ${testName}`);
    }

    const values = evolutionData.map(d => d.value);
    const firstValue = values[0];
    const lastValue = values[values.length - 1];
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    const averageValue = values.reduce((sum, val) => sum + val, 0) / values.length;
    const totalImprovement = lastValue - firstValue;
    const percentImprovement = firstValue !== 0 ? (totalImprovement / firstValue) * 100 : 0;

    // Determinar tendência
    let trend: 'improving' | 'stable' | 'declining' = 'stable';
    if (evolutionData.length >= 3) {
      const recent = values.slice(-3);
      const isImproving = recent[2] > recent[0];
      const isDeclining = recent[2] < recent[0];
      const change = Math.abs(recent[2] - recent[0]);
      const threshold = averageValue * 0.05; // 5% de mudança

      if (change > threshold) {
        trend = isImproving ? 'improving' : 'declining';
      }
    }

    return {
      testName: evolutionData[0].testName,
      unit: evolutionData[0].unit,
      totalMeasurements: evolutionData.length,
      firstValue,
      lastValue,
      minValue,
      maxValue,
      averageValue,
      totalImprovement,
      percentImprovement,
      trend,
      lastMeasuredAt: evolutionData[evolutionData.length - 1].sessionDate,
    };
  } catch (error) {
    console.error('Erro ao calcular estatísticas:', error);
    throw error;
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Formata dados para gráfico de linha/barras
 */
export function formatForChart(data: TestEvolutionData[]): {
  labels: string[];
  values: number[];
  sessionNumbers: number[];
} {
  return {
    labels: data.map(d => {
      const date = new Date(d.sessionDate);
      return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    }),
    values: data.map(d => d.value),
    sessionNumbers: data.map(d => d.sessionNumber),
  };
}

/**
 * Formata dados para tabela de evolução
 */
export function formatForTable(data: TestEvolutionData[]): Array<{
  sessao: number;
  data: string;
  valor: string;
  variacao: string;
  percentual: string;
  observacoes: string;
}> {
  return data.map(d => ({
    sessao: d.sessionNumber,
    data: new Date(d.sessionDate).toLocaleDateString('pt-BR'),
    valor: `${d.value} ${d.unit}${d.side ? ` (${d.side === 'left' ? 'E' : 'D'})` : ''}`,
    variacao: d.variation !== undefined
      ? `${d.variation > 0 ? '+' : ''}${d.variation.toFixed(1)} ${d.unit}`
      : '-',
    percentual: d.percentChange !== undefined
      ? `${d.percentChange > 0 ? '+' : ''}${d.percentChange.toFixed(1)}%`
      : '-',
    observacoes: d.notes || '-',
  }));
}

/**
 * Exporta dados para CSV
 */
export function exportToCSV(data: TestEvolutionData[], testName: string): string {
  const headers = ['Sessão', 'Data', 'Valor', 'Unidade', 'Lado', 'Variação', '% Mudança', 'Observações'];
  const rows = data.map(d => [
    d.sessionNumber,
    new Date(d.sessionDate).toLocaleDateString('pt-BR'),
    d.value,
    d.unit,
    d.side || '-',
    d.variation?.toFixed(2) || '-',
    d.percentChange?.toFixed(2) || '-',
    d.notes || '-',
  ]);

  const csvContent = [
    `"Evolução do Teste: ${testName}"`,
    `"Gerado em: ${new Date().toLocaleString('pt-BR')}"`,
    '',
    headers.map(h => `"${h}"`).join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
  ].join('\n');

  return csvContent;
}

/**
 * Compara bilateral (esquerda vs direita)
 */
export async function getBilateralComparison(
  patientId: string,
  testName: string
): Promise<{
  left: TestEvolutionData[];
  right: TestEvolutionData[];
  difference: number[];
}> {
  try {
    const allData = await getTestEvolutionData(patientId, testName);
    
    const left = allData.filter(d => d.side === 'left');
    const right = allData.filter(d => d.side === 'right');
    
    // Calcular diferença em cada sessão
    const difference: number[] = [];
    const maxLength = Math.min(left.length, right.length);
    
    for (let i = 0; i < maxLength; i++) {
      difference.push(Math.abs(left[i].value - right[i].value));
    }

    return { left, right, difference };
  } catch (error) {
    console.error('Erro ao comparar bilateral:', error);
    return { left: [], right: [], difference: [] };
  }
}

/**
 * Identifica testes com melhora significativa
 */
export async function getTestsWithSignificantImprovement(
  patientId: string,
  threshold = 10 // % de melhora
): Promise<TestStatistics[]> {
  try {
    const testHistory = await getTestHistory(patientId);
    const significantTests: TestStatistics[] = [];

    for (const [testName] of testHistory) {
      const stats = await getTestStatistics(patientId, testName);
      if (Math.abs(stats.percentImprovement) >= threshold) {
        significantTests.push(stats);
      }
    }

    return significantTests.sort((a, b) => 
      Math.abs(b.percentImprovement) - Math.abs(a.percentImprovement)
    );
  } catch (error) {
    console.error('Erro ao buscar testes com melhora significativa:', error);
    return [];
  }
}

/**
 * Sugestões de testes baseados nas patologias do paciente
 */
export async function suggestTestsForPatient(patientId: string): Promise<string[]> {
  try {
    const patient = await patientService.getPatientById(patientId);
    if (!patient?.pathologies) {
      return [];
    }

    const suggestions = new Set<string>();

    patient.pathologies.forEach(pathology => {
      const pathologyName = pathology.name.toLowerCase();

      if (pathologyName.includes('joelho') || pathologyName.includes('lca')) {
        suggestions.add('Amplitude de movimento do joelho');
        suggestions.add('Força do quadríceps');
        suggestions.add('Teste de Lachman');
        suggestions.add('Teste de gaveta anterior');
      }

      if (pathologyName.includes('ombro')) {
        suggestions.add('Amplitude de movimento do ombro');
        suggestions.add('Teste de Neer');
        suggestions.add('Teste de Hawkins');
      }

      if (pathologyName.includes('coluna') || pathologyName.includes('lombar')) {
        suggestions.add('Teste de Schober');
        suggestions.add('Teste de elevação da perna reta');
        suggestions.add('Amplitude de movimento da coluna');
      }

      // Testes gerais
      suggestions.add('Escala de dor (EVA)');
      suggestions.add('Força muscular');
      suggestions.add('Equilíbrio');
    });

    return Array.from(suggestions);
  } catch (error) {
    console.error('Erro ao sugerir testes:', error);
    return [];
  }
}

