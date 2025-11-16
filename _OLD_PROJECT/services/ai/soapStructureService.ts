/**
 * Serviço de Estruturação SOAP
 * Converte texto livre em formato SOAP estruturado usando IA
 */

import { structureToSOAP as geminiStructureToSOAP, isGeminiConfigured } from '../geminiService';
import type { SOAPData } from '../../types';

/**
 * Estrutura texto livre em formato SOAP
 * @param transcription - Texto transcrito ou digitado manualmente
 * @returns Dados estruturados em SOAP
 */
export async function structureToSOAP(transcription: string): Promise<SOAPData> {
  // Validar entrada
  if (!transcription || transcription.trim().length === 0) {
    throw new Error('Texto vazio não pode ser estruturado');
  }

  // Verificar se API está configurada
  if (!isGeminiConfigured()) {
    throw new Error('API Gemini não configurada');
  }

  // Validar tamanho mínimo
  if (transcription.trim().length < 50) {
    throw new Error('Texto muito curto para estruturação SOAP. Mínimo: 50 caracteres');
  }

  try {
    const soapData = await geminiStructureToSOAP(transcription);
    
    // Validar resultado
    validateSOAPData(soapData);
    
    return soapData;
  } catch (error) {
    console.error('Erro ao estruturar SOAP:', error);
    throw new Error('Falha ao estruturar evolução em formato SOAP. Tente novamente.');
  }
}

/**
 * Valida dados SOAP retornados
 */
function validateSOAPData(data: SOAPData): void {
  const requiredFields: (keyof SOAPData)[] = ['subjective', 'objective', 'assessment', 'plan'];
  
  for (const field of requiredFields) {
    if (!data[field] || data[field].trim().length === 0) {
      throw new Error(`Campo SOAP "${field}" está vazio ou inválido`);
    }
  }
}

/**
 * Pré-visualiza como o texto será estruturado (sem chamar IA)
 * Útil para mostrar ao usuário o que será enviado
 */
export function getPreviewInfo(transcription: string): {
  charCount: number;
  wordCount: number;
  estimatedTokens: number;
  canStructure: boolean;
  reason?: string;
} {
  const charCount = transcription.trim().length;
  const wordCount = transcription.trim().split(/\s+/).length;
  const estimatedTokens = Math.ceil(wordCount * 1.3); // Estimativa aproximada

  if (charCount === 0) {
    return {
      charCount,
      wordCount,
      estimatedTokens,
      canStructure: false,
      reason: 'Texto vazio',
    };
  }

  if (charCount < 50) {
    return {
      charCount,
      wordCount,
      estimatedTokens,
      canStructure: false,
      reason: 'Texto muito curto (mínimo 50 caracteres)',
    };
  }

  if (!isGeminiConfigured()) {
    return {
      charCount,
      wordCount,
      estimatedTokens,
      canStructure: false,
      reason: 'API Gemini não configurada',
    };
  }

  return {
    charCount,
    wordCount,
    estimatedTokens,
    canStructure: true,
  };
}

/**
 * Mescla SOAP existente com novo SOAP (útil para edição incremental)
 */
export function mergeSOAPData(existing: Partial<SOAPData>, newData: SOAPData): SOAPData {
  return {
    subjective: newData.subjective || existing.subjective || '',
    objective: newData.objective || existing.objective || '',
    assessment: newData.assessment || existing.assessment || '',
    plan: newData.plan || existing.plan || '',
  };
}

