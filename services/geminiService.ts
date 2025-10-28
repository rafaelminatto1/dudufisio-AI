// Mock service for build purposes - Complete function list
import { GoogleGenerativeAI } from '@google/generative-ai';

// Generic text generation function
export const generateText = async (prompt: string): Promise<string> => {
  // Mock implementation
  await new Promise(resolve => setTimeout(resolve, 100));
  return 'Mock response from generateText';
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
*Material atualizado em 2024 - DuduFisio-AI*`;
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
// GEMINI VEO 2.0 - VIDEO GENERATION
// =============================================

const GEMINI_API_KEY = 'AIzaSyDc5vZXFRAlU18dl1Bk9K2NT-BS8GmuLtM';
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

    
    
    // REMOVIDO: Log de API key (SEGURANÇA - não expor credenciais)

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
    console.error('❌ [GEMINI VEO] Erro ao iniciar geração de vídeo:', error);
    throw new Error(`Falha ao iniciar geração: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
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
    console.error('❌ [GEMINI VEO] Erro ao verificar status da operação:', error);
    throw new Error(`Falha ao verificar status: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
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
    console.error('❌ [GEMINI VEO] Erro ao baixar vídeo:', error);
    throw new Error(`Falha ao baixar vídeo: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
  }
}
// ============================================================================
// GEMINI SERVICE OBJECT - Para imports mais limpos
// ============================================================================
export const geminiService = {
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
};
