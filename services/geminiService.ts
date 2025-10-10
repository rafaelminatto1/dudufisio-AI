// Mock service for build purposes - Complete function list
import { GoogleGenerativeAI } from '@google/generative-ai';
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

/**
 * Iniciar geração de vídeo com Gemini Veo 2.0
 * @param prompt - Descrição detalhada do vídeo desejado
 * @returns Operação de geração (para polling)
 */
export async function generateExerciseVideo(prompt: string) {
  try {
    const response = await ai.models.generateVideos({
      model: 'veo-2.0-generate-001',
      prompt: prompt
    });
    return response.operation;
  } catch (error) {
    console.error('Erro ao iniciar geração de vídeo:', error);
    throw new Error(`Falha ao iniciar geração: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
  }
}

/**
 * Verificar status da operação de geração de vídeo
 * @param operation - Objeto de operação retornado por generateExerciseVideo
 * @returns Status atualizado da operação
 */
export async function getVideosOperation(operation: any) {
  try {
    return await ai.operations.getVideosOperation({ operation });
  } catch (error) {
    console.error('Erro ao verificar status da operação:', error);
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
    // Adicionar API key à URL
    const url = `${uri}?key=${GEMINI_API_KEY}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const blob = await response.blob();
    
    if (blob.size === 0) {
      throw new Error('Vídeo retornado está vazio');
    }
    
    return blob;
  } catch (error) {
    console.error('Erro ao baixar vídeo:', error);
    throw new Error(`Falha ao baixar vídeo: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
  }
}