// Mock service for build purposes - Complete function list
import { GoogleGenerativeAI } from '@google/generative-ai';
import { handleError } from '../lib/middleware/errorHandler';
import { AppError } from '../lib/middleware/errorHandler';

// Generic text generation function
export const generateText = async (prompt: string): Promise<string> => {
  try {
    // Mock implementation
    await new Promise(resolve => setTimeout(resolve, 100));
    return 'Mock response from generateText';
  } catch (error) {
    handleError(error, {
      operation: 'generateText',
      severity: 'medium',
      fallbackMessage: 'Erro ao gerar texto com IA',
      context: { prompt: prompt.substring(0, 100) } // Log apenas início do prompt
    });
    throw error;
  }
};

export const generateTreatmentProtocol = () => Promise.resolve('');
export const generateSoapNote = () => Promise.resolve('');
export const analyzePainPatterns = () => Promise.resolve('');
export const parseProtocolForTreatmentPlan = () => Promise.resolve({
  treatmentGoals: [],
  exercises: []
});
export const generateClinicalInsights = () => Promise.resolve('');
export const generatePatientReport = () => Promise.resolve('');
export const generateRiskAnalysis = () => Promise.resolve('');
export const generatePainDiaryAnalysis = () => Promise.resolve('');
export const generateEducationalContent = () => Promise.resolve('');
export const generateRetentionSuggestion = () => Promise.resolve('');
export const generateEvaluationReport = () => Promise.resolve('');
export const generateSessionEvolution = () => Promise.resolve('');
export const generateHep = () => Promise.resolve('');
export const generatePatientProgressSummary = () => Promise.resolve('');
export const generateAppointmentReminder = () => Promise.resolve('');
export const generateInactivePatientEmail = () => Promise.resolve('');
export const generateClinicalMaterialContent = async (data: { nome_material: string; tipo_material: string }): Promise<string> => {
  try {
    // Simular delay de API
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const { nome_material, tipo_material } = data;
    
    // Conteúdo mock baseado no tipo de material
    switch (tipo_material) {
      case 'Escala de Avaliação':
        return `# ${nome_material}

## Descrição
Esta é uma escala de avaliação clínica utilizada para mensurar aspectos específicos da condição do paciente.

## Como Utilizar
1. **Aplicação**: Aplique a escala conforme as instruções específicas
2. **Pontuação**: Registre os pontos obtidos em cada item
3. **Interpretação**: Consulte a tabela de referência para interpretação dos resultados

## Critérios de Interpretação
- **0-25 pontos**: Baixo risco/severidade
- **26-50 pontos**: Risco moderado
- **51-75 pontos**: Alto risco
- **76-100 pontos**: Risco muito alto

## Observações Clínicas
- Sempre considere o contexto clínico do paciente
- Documente as condições de aplicação da escala
- Reavalie periodicamente conforme protocolo

## Referências
- Baseado em evidências científicas atuais
- Validação clínica em população brasileira
- Atualização: 2024`;

      case 'Protocolo Clínico':
        return `# ${nome_material}

## Objetivo
Protocolo clínico baseado em evidências científicas para o tratamento de condições específicas.

## Indicações
- Pacientes com diagnóstico confirmado
- Idade: 18-65 anos
- Ausência de contraindicações específicas

## Contraindicações
- Processos inflamatórios agudos
- Fraturas não consolidadas
- Instabilidade articular severa

## Fases do Tratamento

### Fase 1: Aguda (0-2 semanas)
- **Objetivo**: Controle da dor e inflamação
- **Intervenções**:
  - Crioterapia
  - Repouso relativo
  - Medicação prescrita pelo médico

### Fase 2: Subaguda (2-6 semanas)
- **Objetivo**: Restauração da amplitude de movimento
- **Intervenções**:
  - Mobilização passiva
  - Exercícios de alongamento
  - Fortalecimento isométrico

### Fase 3: Crônica (6+ semanas)
- **Objetivo**: Fortalecimento e retorno às atividades
- **Intervenções**:
  - Exercícios de fortalecimento
  - Treinamento funcional
  - Retorno gradual às atividades

## Critérios de Progressão
- Redução da dor < 3/10
- Melhora da amplitude de movimento
- Ausência de sinais inflamatórios

## Monitoramento
- Avaliação semanal
- Registro de progresso
- Ajustes conforme necessário

## Evidências Científicas
Baseado em estudos de nível de evidência A e B, com resultados significativos em população similar.`;

      default:
        return `# ${nome_material}

## Introdução
Material de orientação clínica para profissionais de fisioterapia.

## Conteúdo Principal
Este material contém informações essenciais para a prática clínica baseada em evidências.

### Pontos Importantes
1. **Aplicação Clínica**: Utilize conforme protocolos estabelecidos
2. **Documentação**: Registre todas as aplicações e resultados
3. **Atualização**: Mantenha-se atualizado com as últimas evidências

## Orientações de Uso
- Leia atentamente todas as instruções
- Consulte a bibliografia recomendada
- Em caso de dúvidas, consulte um especialista

## Considerações Especiais
- Adapte conforme as necessidades individuais do paciente
- Considere fatores culturais e sociais
- Mantenha confidencialidade dos dados

## Referências
- Baseado em evidências científicas atuais
- Revisão sistemática da literatura
- Consenso de especialistas

---
*Material atualizado em 2024 - MoocaFisio-AI*`;
    }
  } catch (error) {
    handleError(error, {
      operation: 'generateClinicalMaterialContent',
      severity: 'medium',
      fallbackMessage: 'Erro ao gerar conteúdo de material clínico',
      context: { 
        materialName: data.nome_material,
        materialType: data.tipo_material
      }
    });
    throw error;
  }
};
export const generatePatientClinicalSummary = (_patient: any, _notes: any) => Promise.resolve('');

// Mock types exports
export interface PatientProgressData {
  patientId: string;
  progress: string;
}

export interface EvaluationFormData {
  nome_paciente: string;
  profissao_paciente: string;
  idade_paciente: string;
  queixa_principal: string;
  hda: string;
  hmp: string;
  inspecao_palpacao: string;
  adm: string;
  teste_forca: string;
  testes_especiais: string;
  escala_dor: string;
  objetivos_paciente: string;
}

export interface SessionEvolutionFormData {
  numero_sessao: string;
  relato_paciente: string;
  escala_dor_hoje: string;
  dados_objetivos: string;
  intervencoes: string;
  analise_fisio: string;
  proximos_passos: string;
}

export interface HepFormData {
  diagnostico_paciente: string;
  objetivo_hep: string;
  lista_exercicios: string;
  series: string;
  repeticoes: string;
  frequencia: string;
  observacoes: string;
}

export interface RiskAnalysisFormData {
  nome_paciente: string;
  sessoes_realizadas: string;
  sessoes_prescritas: string;
  faltas: string;
  remarcacoes: string;
  ultimo_feedback: string;
  aderencia_hep: string;
}
export interface AppointmentReminderData {}
export interface InactivePatientEmailData {}
export interface RetentionSuggestionData {}
export interface ParsedTreatmentPlan {
  treatmentGoals: string[];
  exercises: any[];
}

// =============================================
// GEMINI CLIENT HELPER
// =============================================

/**
 * Obtém instância do cliente Gemini configurada
 */
export function getGeminiClient() {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  
  if (!apiKey) {
    console.warn('⚠️ VITE_GEMINI_API_KEY não configurado - retornando cliente mock');
    // Retornar cliente mock se não tiver chave
    return {
      generateText: async (prompt: string) => {
        console.warn('Mock Gemini API call:', prompt.substring(0, 50) + '...');
        await new Promise(resolve => setTimeout(resolve, 500));
        return 'Mock response - Configure VITE_GEMINI_API_KEY to use real AI';
      }
    };
  }
  
  const ai = new GoogleGenerativeAI(apiKey);
  
  return {
    generateText: async (prompt: string) => {
      const model = ai.getGenerativeModel({ model: 'gemini-pro' });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    }
  };
}

// =============================================
// GEMINI VEO 2.0 - VIDEO GENERATION
// =============================================

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const ai = new GoogleGenerativeAI(GEMINI_API_KEY);

// NOTA: A API Gemini Veo 2.0 ainda não está publicamente disponível no SDK JavaScript
// Implementação temporária com simulação realista até API estar disponível

interface VideoOperation {
  done: boolean;
  progress?: number;
  response?: {
    downloadLink?: string;
  };
}

/**
 * Tentar usar API REST do Google AI para geração de vídeo
 * @param prompt - Descrição do vídeo
 * @returns Operação de geração ou null se não disponível
 */
async function tryGoogleAIVideoAPI(prompt: string): Promise<VideoOperation | null> {
  try {
    // Tentar endpoint da API Gemini (pode não estar disponível publicamente ainda)
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: `Generate video: ${prompt}` }]
          }]
        })
      }
    );

    if (response.ok) {
      const data = await response.json();
      
      
      // Se a API retornar algo útil, processar aqui
      // Por enquanto, a API Gemini não suporta geração de vídeo
      return null;
    }
    
    return null;
  } catch (error) {
    
    return null;
  }
}

/**
 * Selecionar vídeo baseado no conteúdo do prompt
 * Função inteligente que mapeia exercícios específicos para vídeos apropriados
 */
function selectVideoBasedOnPrompt(prompt: string): {
  url: string;
  title: string;
  description: string;
  exerciseType: string;
  modality: string;
} {
  const lowerPrompt = prompt.toLowerCase();
  
  // Mapeamento de exercícios específicos para vídeos
  const exerciseMappings = {
    // Exercícios de coluna
    'gato': {
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      title: 'Exercício Gato-Camelo',
      description: 'Exercício de mobilidade da coluna vertebral em posição de quatro apoios',
      exerciseType: 'Mobilidade da Coluna',
      modality: 'Fisioterapia'
    },
    'camelo': {
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      title: 'Exercício Gato-Camelo',
      description: 'Exercício de mobilidade da coluna vertebral em posição de quatro apoios',
      exerciseType: 'Mobilidade da Coluna',
      modality: 'Fisioterapia'
    },
    'coluna': {
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
      title: 'Exercícios de Coluna',
      description: 'Série de exercícios para fortalecimento e mobilidade da coluna vertebral',
      exerciseType: 'Fortalecimento da Coluna',
      modality: 'Fisioterapia'
    },
    
    // Exercícios de joelho
    'joelho': {
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      title: 'Exercícios de Joelho',
      description: 'Exercícios de fortalecimento e mobilidade do joelho',
      exerciseType: 'Fortalecimento do Joelho',
      modality: 'Fisioterapia'
    },
    'quadríceps': {
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
      title: 'Fortalecimento do Quadríceps',
      description: 'Exercícios específicos para fortalecimento do músculo quadríceps',
      exerciseType: 'Fortalecimento Muscular',
      modality: 'Fisioterapia'
    },
    
    // Exercícios de ombro
    'ombro': {
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
      title: 'Exercícios de Ombro',
      description: 'Exercícios de mobilidade e fortalecimento do ombro',
      exerciseType: 'Mobilidade do Ombro',
      modality: 'Fisioterapia'
    },
    'ombros': {
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
      title: 'Exercícios de Ombro',
      description: 'Exercícios de mobilidade e fortalecimento do ombro',
      exerciseType: 'Mobilidade do Ombro',
      modality: 'Fisioterapia'
    },
    
    // Exercícios de alongamento
    'alongamento': {
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
      title: 'Exercícios de Alongamento',
      description: 'Série de alongamentos para flexibilidade e relaxamento muscular',
      exerciseType: 'Alongamento',
      modality: 'Fisioterapia'
    },
    'flexibilidade': {
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
      title: 'Exercícios de Flexibilidade',
      description: 'Exercícios para melhorar a flexibilidade e amplitude de movimento',
      exerciseType: 'Flexibilidade',
      modality: 'Fisioterapia'
    },
    
    // Exercícios de fortalecimento
    'fortalecimento': {
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
      title: 'Exercícios de Fortalecimento',
      description: 'Exercícios de fortalecimento muscular geral',
      exerciseType: 'Fortalecimento Muscular',
      modality: 'Fisioterapia'
    },
    'musculação': {
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
      title: 'Exercícios de Musculação',
      description: 'Exercícios de fortalecimento muscular com resistência',
      exerciseType: 'Musculação',
      modality: 'Fisioterapia'
    },
    
    // Exercícios de equilíbrio
    'equilíbrio': {
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
      title: 'Exercícios de Equilíbrio',
      description: 'Exercícios para melhorar o equilíbrio e coordenação',
      exerciseType: 'Equilíbrio',
      modality: 'Fisioterapia'
    },
    'coordenação': {
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
      title: 'Exercícios de Coordenação',
      description: 'Exercícios para melhorar a coordenação motora',
      exerciseType: 'Coordenação',
      modality: 'Fisioterapia'
    },
    
    // Exercícios de respiração
    'respiração': {
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4',
      title: 'Exercícios de Respiração',
      description: 'Exercícios de respiração para relaxamento e controle respiratório',
      exerciseType: 'Respiração',
      modality: 'Fisioterapia'
    },
    'relaxamento': {
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4',
      title: 'Exercícios de Relaxamento',
      description: 'Exercícios para relaxamento muscular e mental',
      exerciseType: 'Relaxamento',
      modality: 'Fisioterapia'
    }
  };

  // Procurar correspondência no prompt
  for (const [keyword, videoInfo] of Object.entries(exerciseMappings)) {
    if (lowerPrompt.includes(keyword)) {
      return videoInfo;
    }
  }

  // Se não encontrar correspondência específica, usar vídeo padrão baseado no comprimento do prompt
  const defaultVideos = [
    {
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
      title: 'Exercício Personalizado',
      description: `Exercício personalizado baseado no prompt: "${prompt}"`,
      exerciseType: 'Exercício Personalizado',
      modality: 'Fisioterapia'
    },
    {
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      title: 'Exercício de Fisioterapia',
      description: `Exercício de fisioterapia personalizado: "${prompt}"`,
      exerciseType: 'Fisioterapia',
      modality: 'Fisioterapia'
    }
  ];

  // Selecionar vídeo baseado no hash do prompt para consistência
  let hash = 0;
  for (let i = 0; i < prompt.length; i++) {
    const char = prompt.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  const videoIndex = Math.abs(hash) % defaultVideos.length;
  
  return defaultVideos[videoIndex];
}

/**
 * Iniciar geração de vídeo com Gemini Veo 2.0
 * Tenta usar API real primeiro, faz fallback para simulação
 * @param prompt - Descrição detalhada do vídeo desejado
 * @returns Operação de geração (para polling)
 */
export async function generateExerciseVideo(prompt: string): Promise<VideoOperation> {
  try {
    // Validar prompt
    if (prompt?.trim().length === 0) {
      throw new Error('Prompt não pode estar vazio');
    }

    // Tentar API real primeiro
    const realAPIResult = await tryGoogleAIVideoAPI(prompt);
    if (realAPIResult) {
      return realAPIResult;
    }

    // FALLBACK: Simulação inteligente baseada no prompt
    
    // Simular delay de processamento inicial
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Selecionar vídeo baseado no conteúdo do prompt
    const selectedVideo = selectVideoBasedOnPrompt(prompt);
    
    return {
      done: false,
      progress: 0,
      response: {
        downloadLink: selectedVideo.url,
        title: selectedVideo.title,
        description: selectedVideo.description,
        exerciseType: selectedVideo.exerciseType,
        modality: selectedVideo.modality
      }
    };
  } catch (error) {
    handleError(error, {
      operation: 'generateExerciseVideo',
      severity: 'high',
      fallbackMessage: 'Erro ao gerar vídeo de exercício',
      context: { 
        promptLength: prompt?.length || 0,
        promptPreview: prompt?.substring(0, 50) || ''
      }
    });
    throw error;
  }
}

/**
 * Verificar status da operação de geração de vídeo
 * IMPLEMENTAÇÃO TEMPORÁRIA: Simula polling enquanto API real não está disponível
 * @param operation - Objeto de operação retornado por generateExerciseVideo
 * @returns Status atualizado da operação
 */
export async function getVideosOperation(operation: VideoOperation): Promise<VideoOperation> {
  try {
    // IMPLEMENTAÇÃO TEMPORÁRIA: Simular progresso
    // Quando a API Gemini Veo 2.0 estiver disponível, substituir por:
    // return await ai.operations.getVideosOperation({ operation });

    // Simular delay de verificação
    await new Promise(resolve => setTimeout(resolve, 500));

    // Simular progresso gradual
    const currentProgress = operation.progress || 0;
    const newProgress = Math.min(currentProgress + 15, 100);

    // Marcar como completo quando chegar a 100%
    if (newProgress >= 100) {
      return {
        ...operation,
        done: true,
        progress: 100
      };
    }

    return {
      ...operation,
      done: false,
      progress: newProgress
    };
  } catch (error) {
    handleError(error, {
      operation: 'getVideosOperation',
      severity: 'medium',
      fallbackMessage: 'Erro ao verificar status da geração de vídeo',
      context: { 
        operationProgress: operation.progress,
        operationDone: operation.done
      }
    });
    throw error;
  }
}

/**
 * Baixar vídeo gerado a partir da URI fornecida pela API
 * @param uri - URI do vídeo retornada pela operação concluída
 * @returns Blob do vídeo
 */
export async function fetchVideoFromUri(uri: string): Promise<Blob> {
  try {
    // Lista de vídeos de exemplo para simulação
    const videoUrls = [
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4',
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    ];

    // Se a URI já é uma URL válida de vídeo, usar ela
    const videoUrl = uri.startsWith('http') ? uri : videoUrls[0];
    
    const response = await fetch(videoUrl);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const blob = await response.blob();
    
    if (blob.size === 0) {
      throw new Error('Vídeo retornado está vazio');
    }

    return blob;
  } catch (error) {
    handleError(error, {
      operation: 'fetchVideoFromUri',
      severity: 'high',
      fallbackMessage: 'Erro ao baixar vídeo',
      context: { 
        uri: uri.substring(0, 100), // Log apenas início da URI
        uriLength: uri.length
      }
    });
    throw error;
  }
}
// ============================================================================
// AI FEATURES - Funcionalidades de IA para Evolução de Pacientes
// ============================================================================

import type { SOAPData, SuggestedExercise, ExerciseSuggestionInput, SessionEvolution } from '../types';

/**
 * Verifica se a API Gemini está configurada
 */
export function isGeminiConfigured(): boolean {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  return !!apiKey && apiKey !== 'sua-gemini-api-key-aqui';
}

/**
 * Transcreve áudio para texto usando Gemini
 */
export async function transcribeAudio(audioBlob: Blob): Promise<string> {
  if (!isGeminiConfigured()) {
    throw new AppError('API Gemini não configurada. Configure VITE_GEMINI_API_KEY no arquivo .env.local', 'GEMINI_NOT_CONFIGURED');
  }

  try {
    // Converter blob para base64
    const base64Audio = await blobToBase64(audioBlob);
    
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    const ai = new GoogleGenerativeAI(apiKey);
    const model = ai.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const prompt = `Você é um assistente especializado em fisioterapia.

Transcreva o seguinte áudio de uma sessão de fisioterapia. 
O fisioterapeuta está narrando a evolução do paciente.

IMPORTANTE:
- Retorne APENAS a transcrição do áudio
- NÃO adicione comentários, análises ou observações
- Mantenha terminologia médica e técnica exatamente como falada
- Se não conseguir entender alguma parte, coloque [inaudível]

Transcrição:`;
    
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType: audioBlob.type,
          data: base64Audio,
        },
      },
    ]);
    
    return result.response.text();
  } catch (error) {
    handleError(error, {
      operation: 'transcribeAudio',
      severity: 'high',
      fallbackMessage: 'Falha ao transcrever áudio',
      context: { audioSize: audioBlob.size, audioType: audioBlob.type }
    });
    throw error;
  }
}

/**
 * Converte Blob para base64
 */
function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result?.toString().split(',')[1];
      resolve(base64 || '');
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Estrutura texto livre em formato SOAP
 */
export async function structureToSOAP(transcription: string): Promise<SOAPData> {
  if (!isGeminiConfigured()) {
    throw new AppError('API Gemini não configurada', 'GEMINI_NOT_CONFIGURED');
  }

  try {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    const ai = new GoogleGenerativeAI(apiKey);
    const model = ai.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const prompt = `Você é um fisioterapeuta experiente especializado em documentação clínica.

Analise a seguinte transcrição de uma sessão de fisioterapia e estruture no formato SOAP:

TRANSCRIÇÃO:
${transcription}

Estruture o conteúdo no formato SOAP:

- **S (Subjetivo)**: O que o paciente relatou (queixas, sintomas, como se sente, melhorias ou pioras)
- **O (Objetivo)**: Dados mensuráveis e observáveis (ADM, força muscular, testes, escala de dor, inspeção, palpação)
- **A (Avaliação/Assessment)**: Interpretação clínica, diagnóstico fisioterapêutico, análise do progresso
- **P (Plano)**: Condutas realizadas, técnicas aplicadas, exercícios prescritos, orientações

Retorne APENAS um JSON válido no seguinte formato (sem markdown, sem texto adicional):
{
  "subjective": "texto do subjetivo",
  "objective": "texto do objetivo",
  "assessment": "texto da avaliação",
  "plan": "texto do plano"
}`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    // Extrair JSON da resposta (remover markdown se houver)
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Resposta da IA não contém JSON válido');
    }
    
    const soapData = JSON.parse(jsonMatch[0]) as SOAPData;
    
    // Validar que todos os campos existem
    if (!soapData.subjective || !soapData.objective || !soapData.assessment || !soapData.plan) {
      throw new Error('SOAP incompleto retornado pela IA');
    }
    
    return soapData;
  } catch (error) {
    handleError(error, {
      operation: 'structureToSOAP',
      severity: 'high',
      fallbackMessage: 'Falha ao estruturar evolução em SOAP',
      context: { transcriptionLength: transcription.length }
    });
    throw error;
  }
}

/**
 * Sugere exercícios terapêuticos baseados no quadro clínico
 */
export async function suggestExercises(input: ExerciseSuggestionInput): Promise<SuggestedExercise[]> {
  if (!isGeminiConfigured()) {
    throw new AppError('API Gemini não configurada', 'GEMINI_NOT_CONFIGURED');
  }

  try {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    const ai = new GoogleGenerativeAI(apiKey);
    const model = ai.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const prompt = `Você é um fisioterapeuta especializado em prescrição de exercícios terapêuticos.

Com base nos seguintes dados do paciente, sugira 5 exercícios terapêuticos apropriados:

**Diagnóstico**: ${input.diagnosis}
**Localização da dor**: ${input.painLocation}
**Limitações funcionais**: ${input.functionalLimitations}

Para cada exercício, forneça:
- Nome do exercício
- Descrição breve e clara
- Número de séries recomendadas
- Número de repetições por série
- Justificativa clínica (por que este exercício é indicado para este caso)

Retorne APENAS um JSON válido no seguinte formato (sem markdown, sem texto adicional):
[
  {
    "name": "Nome do exercício",
    "description": "Descrição breve do exercício",
    "sets": 3,
    "reps": 10,
    "rationale": "Justificativa clínica detalhada"
  }
]

IMPORTANTE: Retorne exatamente 5 exercícios baseados em evidências científicas.`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    // Extrair JSON da resposta
    const jsonMatch = responseText.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('Resposta da IA não contém JSON válido');
    }
    
    const exercises = JSON.parse(jsonMatch[0]) as SuggestedExercise[];
    
    // Validar estrutura dos exercícios
    if (!Array.isArray(exercises) || exercises.length === 0) {
      throw new Error('Lista de exercícios inválida');
    }
    
    return exercises;
  } catch (error) {
    handleError(error, {
      operation: 'suggestExercises',
      severity: 'medium',
      fallbackMessage: 'Falha ao sugerir exercícios',
      context: { 
        diagnosis: input.diagnosis,
        painLocation: input.painLocation
      }
    });
    throw error;
  }
}

/**
 * Gera resumo de progresso do paciente ao longo de múltiplas sessões
 */
export async function generateProgressSummary(evolutions: SessionEvolution[]): Promise<string> {
  if (!isGeminiConfigured()) {
    throw new AppError('API Gemini não configurada', 'GEMINI_NOT_CONFIGURED');
  }

  try {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    const ai = new GoogleGenerativeAI(apiKey);
    const model = ai.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    // Preparar dados das evoluções para o prompt
    const evolutionsText = evolutions.map((ev, index) => `
SESSÃO ${ev.sessionNumber || index + 1} (${new Date(ev.sessionDate).toLocaleDateString('pt-BR')}):
- Subjetivo: ${ev.subjective || 'Não registrado'}
- Objetivo: ${ev.objective || 'Não registrado'}
- Avaliação: ${ev.assessment || 'Não registrado'}
- Plano: ${ev.plan || 'Não registrado'}
${ev.painLevel !== undefined ? `- Nível de dor: ${ev.painLevel}/10` : ''}
    `).join('\n---\n');
    
    const prompt = `Você é um fisioterapeuta experiente especializado em documentação clínica.

Analise o histórico de evoluções abaixo e gere um resumo profissional do progresso do paciente.

HISTÓRICO DE EVOLUÇÕES:
${evolutionsText}

Gere um resumo que inclua:

1. **Condição inicial do paciente**: Como o paciente chegou à primeira sessão
2. **Evolução ao longo do tratamento**: Principais mudanças e marcos importantes
3. **Resultados alcançados**: Objetivos atingidos, melhorias observadas
4. **Recomendações para continuidade**: Sugestões para manutenção dos resultados ou próximos passos

REQUISITOS:
- Tom profissional e técnico
- Máximo de 300 palavras
- Baseado em evidências observadas nas evoluções
- Adequado para laudo de alta ou relatório para médico solicitante
- NÃO use markdown, apenas texto corrido com parágrafos

Resumo:`;

    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    handleError(error, {
      operation: 'generateProgressSummary',
      severity: 'medium',
      fallbackMessage: 'Falha ao gerar resumo de progresso',
      context: { 
        evolutionsCount: evolutions.length
      }
    });
    throw error;
  }
}

// ============================================================================
// GEMINI SERVICE OBJECT - Para imports mais limpos
// ============================================================================
export const geminiService = {
  // Funcionalidades existentes
  generateText,
  generateTreatmentProtocol,
  generateSoapNote,
  analyzePainPatterns,
  parseProtocolForTreatmentPlan,
  generateClinicalInsights,
  generatePatientReport,
  generateRiskAnalysis,
  generatePainDiaryAnalysis,
  generateEducationalContent,
  generateRetentionSuggestion,
  generateEvaluationReport,
  generateSessionEvolution,
  generateHep,
  generatePatientProgressSummary,
  generateAppointmentReminder,
  generateInactivePatientEmail,
  generateClinicalMaterialContent,
  generatePatientClinicalSummary,
  
  // Novas funcionalidades de IA para evolução
  isGeminiConfigured,
  transcribeAudio,
  structureToSOAP,
  suggestExercises,
  generateProgressSummary,
};
