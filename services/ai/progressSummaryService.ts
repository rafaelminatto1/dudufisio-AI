/**
 * Serviço de Resumo de Progresso com IA
 * Gera resumos profissionais do progresso do paciente ao longo das sessões
 */

import { generateProgressSummary as geminiGenerateProgressSummary, isGeminiConfigured } from '../geminiService';
import type { SessionEvolution } from '../../types';

/**
 * Gera resumo profissional do progresso do paciente
 * @param evolutions - Lista de evoluções do paciente
 * @returns Resumo textual profissional
 */
export async function generateProgressSummary(evolutions: SessionEvolution[]): Promise<string> {
  // Validar entrada
  validateEvolutions(evolutions);

  // Verificar se API está configurada
  if (!isGeminiConfigured()) {
    throw new Error('API Gemini não configurada');
  }

  try {
    // Ordenar evoluções por data (mais antigas primeiro)
    const sortedEvolutions = [...evolutions].sort((a, b) => {
      return new Date(a.sessionDate).getTime() - new Date(b.sessionDate).getTime();
    });

    const summary = await geminiGenerateProgressSummary(sortedEvolutions);
    
    // Limpar e formatar o resumo
    const cleanedSummary = cleanSummary(summary);
    
    return cleanedSummary;
  } catch (error) {
    console.error('Erro ao gerar resumo de progresso:', error);
    throw new Error('Falha ao gerar resumo de progresso. Tente novamente.');
  }
}

/**
 * Valida lista de evoluções
 */
function validateEvolutions(evolutions: SessionEvolution[]): void {
  if (!evolutions || evolutions.length === 0) {
    throw new Error('Nenhuma evolução fornecida');
  }

  if (evolutions.length < 2) {
    throw new Error('Mínimo de 2 evoluções necessárias para gerar resumo');
  }
}

/**
 * Limpa e formata o resumo
 */
function cleanSummary(summary: string): string {
  return summary
    .trim()
    // Remover markdown se houver
    .replace(/^#+\s/gm, '')
    .replace(/\*\*/g, '')
    .replace(/\*/g, '')
    // Remover múltiplos espaços
    .replace(/\s+/g, ' ')
    // Normalizar quebras de linha
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * Gera estatísticas básicas das evoluções (útil para contexto adicional)
 */
export function getEvolutionStatistics(evolutions: SessionEvolution[]): {
  totalSessions: number;
  dateRange: { start: string; end: string };
  painReduction?: number;
  hasPainData: boolean;
} {
  if (evolutions.length === 0) {
    return {
      totalSessions: 0,
      dateRange: { start: '', end: '' },
      hasPainData: false,
    };
  }

  const sorted = [...evolutions].sort((a, b) => 
    new Date(a.sessionDate).getTime() - new Date(b.sessionDate).getTime()
  );

  const firstSession = sorted[0];
  const lastSession = sorted[sorted.length - 1];

  // Calcular redução de dor se disponível
  const firstPain = firstSession.painLevel;
  const lastPain = lastSession.painLevel;
  const hasPainData = firstPain !== undefined && lastPain !== undefined;
  const painReduction = hasPainData ? firstPain! - lastPain! : undefined;

  return {
    totalSessions: evolutions.length,
    dateRange: {
      start: new Date(firstSession.sessionDate).toLocaleDateString('pt-BR'),
      end: new Date(lastSession.sessionDate).toLocaleDateString('pt-BR'),
    },
    painReduction,
    hasPainData,
  };
}

/**
 * Gera um resumo curto (1-2 parágrafos) para visualização rápida
 */
export async function generateShortSummary(evolutions: SessionEvolution[]): Promise<string> {
  const fullSummary = await generateProgressSummary(evolutions);
  
  // Pegar apenas os dois primeiros parágrafos
  const paragraphs = fullSummary.split('\n\n');
  return paragraphs.slice(0, 2).join('\n\n');
}

/**
 * Formata resumo para exportação em PDF/documento
 */
export function formatSummaryForExport(summary: string, patientName: string): string {
  const today = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  return `RESUMO DE EVOLUÇÃO FISIOTERAPÊUTICA

Paciente: ${patientName}
Data do relatório: ${today}

${summary}

---
Relatório gerado automaticamente pelo MoocaFisio AI
`;
}

