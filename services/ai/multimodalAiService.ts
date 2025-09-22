import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/genai';
import { supabase } from '../../lib/supabase';

export interface AIAnalysisResult {
  summary: string;
  recommendations: string[];
  riskAssessment: {
    level: 'low' | 'medium' | 'high';
    factors: string[];
  };
  followUpQuestions: string[];
  confidence: number;
}

export interface ImageAnalysisResult extends AIAnalysisResult {
  anatomicalFindings: string[];
  postureAnalysis: string[];
  movementPatterns: string[];
  suggestedExercises: string[];
}

export interface VoiceAnalysisResult {
  transcript: string;
  emotionalState: {
    primary: string;
    confidence: number;
    indicators: string[];
  };
  painIndicators: {
    level: number; // 0-10
    location: string[];
    quality: string[];
  };
  keyPhrases: string[];
  urgencyLevel: 'low' | 'medium' | 'high';
}

export interface ClinicalDecisionSupport {
  diagnosis: {
    primary: string;
    differential: string[];
    confidence: number;
  };
  treatmentPlan: {
    immediate: string[];
    shortTerm: string[];
    longTerm: string[];
  };
  redFlags: string[];
  progressMarkers: string[];
  estimatedRecoveryTime: string;
}

class MultimodalAIService {
  private genAI: any;
  private model: any;
  private visionModel: any;

  constructor() {
    const apiKey = (import.meta as any).env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('VITE_GEMINI_API_KEY não encontrada nas variáveis de ambiente');
    }

    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({
      model: 'gemini-pro',
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
      },
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
      ],
    });

    this.visionModel = this.genAI.getGenerativeModel({
      model: 'gemini-pro-vision',
      generationConfig: {
        temperature: 0.4,
        topK: 32,
        topP: 0.95,
        maxOutputTokens: 2048,
      },
    });
  }

  // Análise de imagens médicas (postura, movimento, raio-X, etc.)
  async analyzeImage(imageFile: File, analysisType: 'posture' | 'movement' | 'xray' | 'general'): Promise<ImageAnalysisResult> {
    try {
      const imageData = await this.fileToGenerativePart(imageFile);

      const prompts = {
        posture: `
          Analise esta imagem de postura corporal como um fisioterapeuta experiente.

          Avalie:
          1. Alinhamento postural geral
          2. Assimetrias visíveis
          3. Padrões de compensação
          4. Áreas de possível tensão ou fraqueza
          5. Desvios posturais específicos

          Forneça:
          - Análise detalhada da postura
          - Recomendações de exercícios específicos
          - Nível de prioridade para intervenção
          - Exercícios recomendados

          Formato da resposta em JSON:
          {
            "summary": "resumo geral da análise",
            "anatomicalFindings": ["achado1", "achado2"],
            "postureAnalysis": ["análise1", "análise2"],
            "recommendations": ["recomendação1", "recomendação2"],
            "suggestedExercises": ["exercício1", "exercício2"],
            "riskAssessment": {
              "level": "low|medium|high",
              "factors": ["fator1", "fator2"]
            },
            "followUpQuestions": ["pergunta1", "pergunta2"],
            "confidence": 0.85
          }
        `,
        movement: `
          Analise este vídeo/imagem de movimento como um especialista em análise biomecânica.

          Avalie:
          1. Qualidade do movimento
          2. Padrões compensatórios
          3. Amplitude de movimento
          4. Coordenação e timing
          5. Estabilidade articular

          Mesmo formato JSON da análise de postura.
        `,
        xray: `
          IMPORTANTE: Esta análise é apenas para apoio educacional e não substitui a interpretação médica profissional.

          Analise esta imagem radiológica focando em:
          1. Alinhamento ósseo
          2. Espaços articulares
          3. Densidade óssea aparente
          4. Estruturas de tecidos moles visíveis

          Mesmo formato JSON, com foco em achados radiológicos.
        `,
        general: `
          Analise esta imagem relacionada à fisioterapia e forneça insights relevantes.
          Mesmo formato JSON da análise de postura.
        `
      };

      const result = await this.visionModel.generateContent([
        prompts[analysisType],
        imageData
      ]);

      const response = await result.response;
      const text = response.text();

      // Parse JSON response
      try {
        return JSON.parse(text);
      } catch (parseError) {
        // Fallback if JSON parsing fails
        return {
          summary: text,
          anatomicalFindings: [],
          postureAnalysis: [],
          movementPatterns: [],
          recommendations: [],
          suggestedExercises: [],
          riskAssessment: { level: 'medium', factors: [] },
          followUpQuestions: [],
          confidence: 0.7
        };
      }
    } catch (error) {
      console.error('Erro na análise de imagem:', error);
      throw new Error('Falha na análise da imagem. Tente novamente.');
    }
  }

  // Análise de áudio/voz para detectar dor e estado emocional
  async analyzeVoice(audioText: string): Promise<VoiceAnalysisResult> {
    try {
      const prompt = `
        Analise este texto transcrito de áudio de um paciente de fisioterapia.

        Avalie:
        1. Indicadores de dor na fala (hesitação, pausas, expressões)
        2. Estado emocional (ansiedade, frustração, depressão, otimismo)
        3. Localização e qualidade da dor mencionada
        4. Nível de urgência baseado na descrição
        5. Frases-chave importantes

        Texto: "${audioText}"

        Responda em JSON:
        {
          "transcript": "texto original",
          "emotionalState": {
            "primary": "estado emocional principal",
            "confidence": 0.85,
            "indicators": ["indicador1", "indicador2"]
          },
          "painIndicators": {
            "level": 5,
            "location": ["local1", "local2"],
            "quality": ["qualidade1", "qualidade2"]
          },
          "keyPhrases": ["frase1", "frase2"],
          "urgencyLevel": "low|medium|high"
        }
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      return JSON.parse(text);
    } catch (error) {
      console.error('Erro na análise de voz:', error);
      throw new Error('Falha na análise de voz. Tente novamente.');
    }
  }

  // Sistema de apoio à decisão clínica
  async generateClinicalDecisionSupport(patientData: {
    symptoms: string[];
    history: string;
    currentCondition: string;
    previousTreatments: string[];
    goals: string[];
  }): Promise<ClinicalDecisionSupport> {
    try {
      const prompt = `
        Como um fisioterapeuta experiente, analise este caso clínico e forneça apoio à decisão.

        Dados do paciente:
        - Sintomas: ${patientData.symptoms.join(', ')}
        - Histórico: ${patientData.history}
        - Condição atual: ${patientData.currentCondition}
        - Tratamentos anteriores: ${patientData.previousTreatments.join(', ')}
        - Objetivos: ${patientData.goals.join(', ')}

        Forneça:
        1. Hipótese diagnóstica principal e diferenciais
        2. Plano de tratamento estruturado (imediato, curto e longo prazo)
        3. Sinais de alerta (red flags)
        4. Marcadores de progresso
        5. Estimativa de tempo de recuperação

        Responda em JSON:
        {
          "diagnosis": {
            "primary": "diagnóstico principal",
            "differential": ["diagnóstico1", "diagnóstico2"],
            "confidence": 0.85
          },
          "treatmentPlan": {
            "immediate": ["ação1", "ação2"],
            "shortTerm": ["objetivo1", "objetivo2"],
            "longTerm": ["meta1", "meta2"]
          },
          "redFlags": ["sinal1", "sinal2"],
          "progressMarkers": ["marcador1", "marcador2"],
          "estimatedRecoveryTime": "estimativa"
        }
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      return JSON.parse(text);
    } catch (error) {
      console.error('Erro no apoio à decisão clínica:', error);
      throw new Error('Falha no apoio à decisão clínica. Tente novamente.');
    }
  }

  // Geração de planos de exercícios personalizados
  async generatePersonalizedExercisePlan(patientProfile: {
    age: number;
    condition: string;
    limitations: string[];
    equipment: string[];
    experience: string;
    goals: string[];
    timeAvailable: number; // minutes per session
  }): Promise<{
    exercises: Array<{
      name: string;
      description: string;
      sets: number;
      reps: string;
      duration: string;
      intensity: string;
      modifications: string[];
      progressions: string[];
    }>;
    schedule: {
      frequency: string;
      duration: string;
      progression: string;
    };
    safetyGuidelines: string[];
    warningSign: string[];
  }> {
    try {
      const prompt = `
        Crie um plano de exercícios personalizado para este paciente:

        Perfil:
        - Idade: ${patientProfile.age} anos
        - Condição: ${patientProfile.condition}
        - Limitações: ${patientProfile.limitations.join(', ')}
        - Equipamentos disponíveis: ${patientProfile.equipment.join(', ')}
        - Experiência: ${patientProfile.experience}
        - Objetivos: ${patientProfile.goals.join(', ')}
        - Tempo disponível: ${patientProfile.timeAvailable} minutos por sessão

        Considere:
        1. Segurança e contraindcações
        2. Progressão gradual
        3. Exercícios funcionais
        4. Motivação e adesão
        5. Limitações de equipamento

        Formato JSON detalhado com exercícios específicos, progressões e orientações de segurança.
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      return JSON.parse(text);
    } catch (error) {
      console.error('Erro na geração de plano de exercícios:', error);
      throw new Error('Falha na geração do plano de exercícios. Tente novamente.');
    }
  }

  // Análise de progresso baseada em dados históricos
  async analyzeProgress(progressData: {
    sessions: Array<{
      date: string;
      painLevel: number;
      functionalScore: number;
      exercisesCompleted: string[];
      notes: string;
    }>;
    initialAssessment: any;
    currentAssessment: any;
  }): Promise<{
    progressSummary: string;
    improvements: string[];
    concerns: string[];
    recommendations: string[];
    nextSteps: string[];
    motivationalMessage: string;
  }> {
    try {
      const prompt = `
        Analise o progresso deste paciente baseado nos dados das sessões:

        Dados: ${JSON.stringify(progressData, null, 2)}

        Forneça análise completa do progresso, melhorias, preocupações e próximos passos.
        Inclua uma mensagem motivacional personalizada.

        Formato JSON com análise detalhada.
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      return JSON.parse(text);
    } catch (error) {
      console.error('Erro na análise de progresso:', error);
      throw new Error('Falha na análise de progresso. Tente novamente.');
    }
  }

  // Chatbot especializado em fisioterapia
  async chatWithAI(message: string, context: {
    patientId?: string;
    sessionHistory?: string[];
    currentTopic?: string;
  }): Promise<{
    response: string;
    suggestedActions: string[];
    followUpQuestions: string[];
    resources: Array<{
      title: string;
      url: string;
      type: 'article' | 'video' | 'exercise';
    }>;
  }> {
    try {
      const prompt = `
        Você é um assistente de IA especializado em fisioterapia. Responda à pergunta do usuário de forma profissional, empática e informativa.

        Mensagem: "${message}"
        Contexto: ${JSON.stringify(context)}

        Forneça:
        1. Resposta clara e útil
        2. Ações sugeridas
        3. Perguntas de acompanhamento
        4. Recursos relevantes

        IMPORTANTE: Sempre lembre que esta informação não substitui consulta médica profissional.

        Formato JSON estruturado.
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      return JSON.parse(text);
    } catch (error) {
      console.error('Erro no chat com IA:', error);
      throw new Error('Falha na conversa com IA. Tente novamente.');
    }
  }

  // Salvar análise no banco de dados
  async saveAnalysis(analysisData: {
    patientId: string;
    type: string;
    result: any;
    metadata?: any;
  }): Promise<void> {
    try {
      const { error } = await supabase
        .from('ai_analyses')
        .insert({
          patient_id: analysisData.patientId,
          analysis_type: analysisData.type,
          result: analysisData.result,
          metadata: analysisData.metadata,
          created_at: new Date().toISOString(),
        });

      if (error) throw error;
    } catch (error) {
      console.error('Erro ao salvar análise:', error);
      throw new Error('Falha ao salvar análise no banco de dados.');
    }
  }

  // Utilitário para converter arquivo em formato compatível com Gemini
  private async fileToGenerativePart(file: File): Promise<any> {
    const base64EncodedDataPromise = new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = (reader.result as string).split(',')[1];
        resolve(base64String);
      };
      reader.readAsDataURL(file);
    });

    return {
      inlineData: {
        data: await base64EncodedDataPromise,
        mimeType: file.type,
      },
    };
  }
}

// Export singleton instance
export const multimodalAI = new MultimodalAIService();
export default multimodalAI;