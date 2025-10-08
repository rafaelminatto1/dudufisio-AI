/**
 * 🤖 AI TOOLS SERVICE - DUDUFISIO-AI
 * 
 * Serviço centralizado para todas as ferramentas de IA do sistema.
 * Integra com múltiplos provedores de IA e fornece interfaces padronizadas.
 */

import { geminiService } from '../geminiService';
import { groqService } from '../groqService';
import { xaiService } from '../xaiService';

export interface AIProvider {
  name: string;
  available: boolean;
  models: string[];
  defaultModel: string;
}

export interface AIResponse {
  content: string;
  provider: string;
  model: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  metadata?: {
    confidence?: number;
    processingTime?: number;
    timestamp: string;
  };
}

export interface ReportGenerationData {
  patientName: string;
  diagnosis: string;
  sessionsCompleted: number;
  mainComplaints?: string;
  assessment?: string;
  treatmentGoals?: string;
  currentCondition?: string;
  recommendations?: string;
}

export interface EvolutionGenerationData {
  patientName: string;
  sessionNumber: number;
  painScale?: number;
  patientReport?: string;
  objectiveData?: string;
  interventions?: string;
  physioAnalysis?: string;
  nextSteps?: string;
  adherence?: string;
}

export interface HEPGenerationData {
  patientName: string;
  diagnosis: string;
  hepGoal?: string;
  exercises: {
    name: string;
    description: string;
    sets: string;
    repetitions: string;
    frequency: string;
    duration: string;
  }[];
  generalInstructions?: string;
  precautions?: string;
  progression?: string;
}

export interface RiskAnalysisData {
  patientName: string;
  sessionsCompleted: number;
  sessionsPrescribed: number;
  absences: number;
  reschedules: number;
  lastFeedback?: string;
  hepAdherence?: string;
  painLevel?: number;
  functionalLimitation?: string;
  comorbidities?: string;
  medicationUse?: string;
  lifestyle?: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export class AIToolsService {
  private static instance: AIToolsService;
  private availableProviders: AIProvider[] = [];

  public static getInstance(): AIToolsService {
    if (!AIToolsService.instance) {
      AIToolsService.instance = new AIToolsService();
    }
    return AIToolsService.instance;
  }

  private constructor() {
    this.initializeProviders();
  }

  private initializeProviders() {
    this.availableProviders = [
      {
        name: 'gemini',
        available: true, // Verificar se API key está configurada
        models: ['gemini-pro', 'gemini-pro-vision'],
        defaultModel: 'gemini-pro'
      },
      {
        name: 'groq',
        available: groqService.isAvailable(),
        models: ['mixtral-8x7b-32768', 'llama2-70b-4096'],
        defaultModel: 'mixtral-8x7b-32768'
      },
      {
        name: 'xai',
        available: xaiService.isAvailable(),
        models: ['grok-beta'],
        defaultModel: 'grok-beta'
      }
    ];
  }

  public getAvailableProviders(): AIProvider[] {
    return this.availableProviders.filter(provider => provider.available);
  }

  public async generateReport(data: ReportGenerationData, provider: string = 'gemini'): Promise<AIResponse> {
    const prompt = this.buildReportPrompt(data);
    return this.callAI(prompt, provider, 'medical-report');
  }

  public async generateEvolution(data: EvolutionGenerationData, provider: string = 'gemini'): Promise<AIResponse> {
    const prompt = this.buildEvolutionPrompt(data);
    return this.callAI(prompt, provider, 'session-evolution');
  }

  public async generateHEP(data: HEPGenerationData, provider: string = 'gemini'): Promise<AIResponse> {
    const prompt = this.buildHEPPrompt(data);
    return this.callAI(prompt, provider, 'hep-generation');
  }

  public async analyzeRisk(data: RiskAnalysisData, provider: string = 'gemini'): Promise<AIResponse> {
    const prompt = this.buildRiskAnalysisPrompt(data);
    return this.callAI(prompt, provider, 'risk-analysis');
  }

  public async chatWithAI(messages: ChatMessage[], provider: string = 'gemini'): Promise<AIResponse> {
    const prompt = this.buildChatPrompt(messages);
    return this.callAI(prompt, provider, 'clinical-chat');
  }

  private async callAI(prompt: string, provider: string, context: string): Promise<AIResponse> {
    const startTime = Date.now();
    
    try {
      let content: string;
      let model: string;

      switch (provider) {
        case 'gemini':
          model = 'gemini-pro';
          content = await geminiService.generateText(prompt, this.getSystemPrompt(context));
          break;
        
        case 'groq':
          model = 'mixtral-8x7b-32768';
          content = await groqService.generateText(prompt, this.getSystemPrompt(context));
          break;
        
        case 'xai':
          model = 'grok-beta';
          content = await xaiService.generateText(prompt, this.getSystemPrompt(context));
          break;
        
        default:
          throw new Error(`Provedor de IA não suportado: ${provider}`);
      }

      const processingTime = Date.now() - startTime;

      return {
        content,
        provider,
        model,
        metadata: {
          processingTime,
          timestamp: new Date().toISOString()
        }
      };

    } catch (error) {
      console.error(`Erro ao chamar IA (${provider}):`, error);
      throw new Error(`Falha na geração de conteúdo: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  private getSystemPrompt(context: string): string {
    const basePrompt = `Você é um assistente especializado em fisioterapia e reabilitação. 
    Seu objetivo é ajudar fisioterapeutas com documentação clínica, análise de dados e suporte profissional.
    
    Diretrizes importantes:
    - Use linguagem técnica apropriada para fisioterapia
    - Mantenha foco na evidência científica
    - Considere as melhores práticas clínicas
    - Seja preciso e objetivo
    - Respeite normas éticas e de confidencialidade
    - Use terminologia adequada para documentação médica`;

    switch (context) {
      case 'medical-report':
        return `${basePrompt}
        
        Você está gerando um laudo fisioterapêutico. O documento deve:
        - Ser estruturado e profissional
        - Incluir todos os dados do paciente
        - Conter avaliação clínica detalhada
        - Apresentar objetivos claros
        - Incluir recomendações específicas
        - Seguir padrões de documentação médica`;

      case 'session-evolution':
        return `${basePrompt}
        
        Você está criando uma evolução de sessão. O documento deve:
        - Registrar progresso do paciente
        - Incluir dados objetivos e subjetivos
        - Documentar intervenções realizadas
        - Analisar resposta do paciente
        - Definir próximos passos
        - Manter continuidade do tratamento`;

      case 'hep-generation':
        return `${basePrompt}
        
        Você está criando um plano de exercícios domiciliares (HEP). O plano deve:
        - Ser específico para a condição do paciente
        - Incluir exercícios progressivos
        - Ter instruções claras e seguras
        - Considerar limitações do paciente
        - Incluir precauções necessárias
        - Definir critérios de progressão`;

      case 'risk-analysis':
        return `${basePrompt}
        
        Você está analisando riscos clínicos. A análise deve:
        - Identificar fatores de risco específicos
        - Quantificar níveis de risco
        - Propor estratégias de mitigação
        - Incluir recomendações práticas
        - Considerar evidências científicas
        - Ser acionável para o fisioterapeuta`;

      case 'clinical-chat':
        return `${basePrompt}
        
        Você está em uma conversa clínica. Seu papel é:
        - Responder dúvidas sobre fisioterapia
        - Sugerir técnicas e abordagens
        - Orientar sobre protocolos
        - Ajudar com decisões clínicas
        - Manter tom profissional mas acessível
        - Sempre recomendar consulta com especialista quando necessário`;

      default:
        return basePrompt;
    }
  }

  private buildReportPrompt(data: ReportGenerationData): string {
    return `Gere um laudo fisioterapêutico profissional com as seguintes informações:

DADOS DO PACIENTE:
- Nome: ${data.patientName}
- Diagnóstico: ${data.diagnosis}
- Sessões Realizadas: ${data.sessionsCompleted}

QUEIXA PRINCIPAL:
${data.mainComplaints || 'A ser preenchido'}

AVALIAÇÃO FISIOTERAPÊUTICA:
${data.assessment || 'A ser preenchido'}

OBJETIVOS DO TRATAMENTO:
${data.treatmentGoals || 'A ser preenchido'}

CONDIÇÃO ATUAL:
${data.currentCondition || 'A ser preenchido'}

RECOMENDAÇÕES:
${data.recommendations || 'A ser preenchido'}

Gere um laudo completo, estruturado e profissional seguindo padrões de documentação médica.`;
  }

  private buildEvolutionPrompt(data: EvolutionGenerationData): string {
    return `Gere uma evolução de sessão fisioterapêutica com as seguintes informações:

DADOS DA SESSÃO:
- Paciente: ${data.patientName}
- Sessão Número: ${data.sessionNumber}
- Escala de Dor: ${data.painScale || 'N/A'}/10

RELATO DO PACIENTE:
${data.patientReport || 'A ser preenchido'}

DADOS OBJETIVOS:
${data.objectiveData || 'A ser preenchido'}

INTERVENÇÕES REALIZADAS:
${data.interventions || 'A ser preenchido'}

ANÁLISE DO FISIOTERAPEUTA:
${data.physioAnalysis || 'A ser preenchido'}

ADERÊNCIA AO HEP:
${data.adherence || 'A ser preenchido'}

PRÓXIMOS PASSOS:
${data.nextSteps || 'A ser preenchido'}

Gere uma evolução completa, focando no progresso e nas mudanças observadas.`;
  }

  private buildHEPPrompt(data: HEPGenerationData): string {
    const exercisesList = data.exercises.map((ex, index) => `
${index + 1}. ${ex.name}
   - Descrição: ${ex.description}
   - Séries: ${ex.sets}
   - Repetições: ${ex.repetitions}
   - Frequência: ${ex.frequency}
   - Duração: ${ex.duration}`).join('\n');

    return `Gere um plano de exercícios domiciliares (HEP) com as seguintes informações:

DADOS DO PACIENTE:
- Nome: ${data.patientName}
- Diagnóstico: ${data.diagnosis}

OBJETIVO DO HEP:
${data.hepGoal || 'A ser definido'}

EXERCÍCIOS PRESCRITOS:
${exercisesList}

INSTRUÇÕES GERAIS:
${data.generalInstructions || 'A ser preenchido'}

PRECAUÇÕES:
${data.precautions || 'A ser preenchido'}

CRITÉRIOS DE PROGRESSÃO:
${data.progression || 'A ser definido'}

Gere um plano completo, seguro e específico para a condição do paciente.`;
  }

  private buildRiskAnalysisPrompt(data: RiskAnalysisData): string {
    return `Analise os fatores de risco para abandono do tratamento com base nos seguintes dados:

DADOS DO PACIENTE:
- Nome: ${data.patientName}
- Sessões Realizadas: ${data.sessionsCompleted}
- Sessões Prescritas: ${data.sessionsPrescribed}
- Faltas: ${data.absences}
- Remarcações: ${data.reschedules}

FATORES CLÍNICOS:
- Nível de Dor: ${data.painLevel || 'N/A'}/10
- Limitação Funcional: ${data.functionalLimitation || 'N/A'}
- Aderência ao HEP: ${data.hepAdherence || 'N/A'}
- Último Feedback: ${data.lastFeedback || 'N/A'}

FATORES SOCIAIS:
- Comorbidades: ${data.comorbidities || 'N/A'}
- Uso de Medicação: ${data.medicationUse || 'N/A'}
- Estilo de Vida: ${data.lifestyle || 'N/A'}

Analise os riscos e forneça:
1. Score de risco geral (0-100)
2. Fatores de risco identificados
3. Estratégias de mitigação
4. Recomendações específicas
5. Plano de ação
6. Próximos passos`;
  }

  private buildChatPrompt(messages: ChatMessage[]): string {
    const conversationHistory = messages
      .map(msg => `${msg.role === 'user' ? 'Paciente/Fisioterapeuta' : 'Assistente IA'}: ${msg.content}`)
      .join('\n\n');

    return `Baseado na conversa abaixo, forneça uma resposta útil e profissional:

${conversationHistory}

Responda como um assistente especializado em fisioterapia, mantendo tom profissional e oferecendo orientações baseadas em evidências científicas.`;
  }

  // Métodos de utilidade para métricas e analytics
  public async getUsageMetrics(): Promise<any> {
    // Mock de métricas - em produção viria do banco de dados
    return {
      totalRequests: 1247,
      successRate: 96.4,
      averageResponseTime: 2.8,
      mostUsedProvider: 'gemini',
      dailyUsage: {
        '2024-01-01': 45,
        '2024-01-02': 52,
        '2024-01-03': 38,
        // ... mais dados
      }
    };
  }

  public async logUsage(context: string, provider: string, success: boolean, responseTime: number): Promise<void> {
    // Em produção, salvaria no banco de dados
    console.log(`AI Usage Log: ${context} | ${provider} | Success: ${success} | Time: ${responseTime}ms`);
  }
}

// Exportar instância singleton
export const aiToolsService = AIToolsService.getInstance();
export default aiToolsService;
