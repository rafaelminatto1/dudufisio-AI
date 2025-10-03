/**
 * 🧠 AI Prompt Manager - Gerenciador de Prompts Especializados
 * 
 * Sistema centralizado para gerenciar os 8 prompts especializados:
 * 1. Análise de Casos Clínicos
 * 2. Prescrição de Exercícios
 * 3. Relatórios de Evolução
 * 4. Diagnóstico Diferencial
 * 5. Protocolos de Tratamento
 * 6. Análise de Efetividade
 * 7. Educação de Estagiários
 * 8. Comunicação com Pacientes
 */

import { Patient, Appointment, User } from '../../../types';

export interface PromptRequest {
  type: PromptType;
  context: PromptContext;
  data: any;
  preferences?: PromptPreferences;
  // Optional direct references for convenience
  patient?: Patient;
  appointment?: Appointment;
  therapist?: User;
}

export interface PromptResponse {
  content: string;
  confidence: number;
  reasoning: string[];
  suggestions: string[];
  metadata: PromptMetadata;
}

export interface PromptContext {
  patient?: Patient;
  appointment?: Appointment;
  therapist?: User;
  clinicalData?: any;
  sessionData?: any;
  treatmentHistory?: any;
}

export interface PromptPreferences {
  language: 'pt' | 'en' | 'es';
  detailLevel: 'basic' | 'intermediate' | 'advanced';
  format: 'text' | 'structured' | 'json';
  includeEvidence: boolean;
  includeRecommendations: boolean;
}

export interface PromptMetadata {
  promptVersion: string;
  processingTime: number;
  tokensUsed: number;
  modelUsed: string;
  timestamp: Date;
}

export type PromptType = 
  | 'clinical_analysis'
  | 'exercise_prescription'
  | 'evolution_report'
  | 'differential_diagnosis'
  | 'treatment_protocols'
  | 'effectiveness_analysis'
  | 'student_education'
  | 'patient_communication';

export class AIPromptManager {
  private prompts: Map<PromptType, PromptTemplate> = new Map();
  private strategies: Map<string, PromptStrategy> = new Map();
  
  constructor() {
    this.initializePrompts();
    this.initializeStrategies();
  }

  /**
   * Processar prompt especializado
   */
  async processPrompt(request: PromptRequest): Promise<PromptResponse> {
    try {
      console.log(`🧠 Processando prompt ${request.type}...`);
      
      const startTime = Date.now();
      
      // Obter template do prompt
      const template = this.prompts.get(request.type);
      if (!template) {
        throw new Error(`Prompt ${request.type} não encontrado`);
      }
      
      // Aplicar estratégias avançadas
      const enhancedPrompt = await this.applyAdvancedStrategies(template, request);
      
      // Processar com IA
      const response = await this.executePrompt(enhancedPrompt, request);
      
      // Calcular métricas
      const processingTime = Date.now() - startTime;
      const metadata: PromptMetadata = {
        promptVersion: template.version,
        processingTime,
        tokensUsed: this.estimateTokens(enhancedPrompt),
        modelUsed: 'gpt-4',
        timestamp: new Date()
      };
      
      console.log(`✅ Prompt ${request.type} processado em ${processingTime}ms`);
      
      return {
        ...response,
        metadata
      };
      
    } catch (error) {
      console.error(`❌ Erro ao processar prompt ${request.type}:`, error);
      throw error;
    }
  }

  /**
   * Processar múltiplos prompts
   */
  async processMultiplePrompts(requests: PromptRequest[]): Promise<PromptResponse[]> {
    const responses: PromptResponse[] = [];
    
    for (const request of requests) {
      try {
        const response = await this.processPrompt(request);
        responses.push(response);
      } catch (error) {
        console.warn(`⚠️ Erro ao processar prompt ${request.type}:`, error);
        // Continuar com próximos prompts
      }
    }
    
    return responses;
  }

  /**
   * Obter template de prompt
   */
  getPromptTemplate(type: PromptType): PromptTemplate | undefined {
    return this.prompts.get(type);
  }

  /**
   * Atualizar template de prompt
   */
  updatePromptTemplate(type: PromptType, template: PromptTemplate): void {
    this.prompts.set(type, template);
  }

  /**
   * Aplicar estratégias avançadas
   */
  private async applyAdvancedStrategies(
    template: PromptTemplate,
    request: PromptRequest
  ): Promise<string> {
    let enhancedPrompt = template.content;
    
    // Aplicar Chain-of-Thought
    if (template.strategies.includes('chain_of_thought')) {
      enhancedPrompt = await this.applyChainOfThought(enhancedPrompt, request);
    }
    
    // Aplicar Few-Shot Learning
    if (template.strategies.includes('few_shot_learning')) {
      enhancedPrompt = await this.applyFewShotLearning(enhancedPrompt, request);
    }
    
    // Aplicar Role-Playing
    if (template.strategies.includes('role_playing')) {
      enhancedPrompt = await this.applyRolePlaying(enhancedPrompt, request);
    }
    
    // Aplicar Structured Output
    if (template.strategies.includes('structured_output')) {
      enhancedPrompt = await this.applyStructuredOutput(enhancedPrompt, request);
    }
    
    // Aplicar Context Optimization
    if (template.strategies.includes('context_optimization')) {
      enhancedPrompt = await this.applyContextOptimization(enhancedPrompt, request);
    }
    
    return enhancedPrompt;
  }

  /**
   * Aplicar Chain-of-Thought
   */
  private async applyChainOfThought(prompt: string, request: PromptRequest): Promise<string> {
    const chainOfThoughtStrategy = this.strategies.get('chain_of_thought');
    if (!chainOfThoughtStrategy?.generateReasoningSteps) return prompt;

    const reasoningSteps = chainOfThoughtStrategy.generateReasoningSteps(request);

    return `${prompt}\n\n## Raciocínio Clínico Sistemático:\n${reasoningSteps.map((step, index) =>
      `${index + 1}. ${step}`
    ).join('\n')}\n\nBaseado neste raciocínio sistemático, forneça sua análise:`;
  }

  /**
   * Aplicar Few-Shot Learning
   */
  private async applyFewShotLearning(prompt: string, request: PromptRequest): Promise<string> {
    const fewShotStrategy = this.strategies.get('few_shot_learning');
    if (!fewShotStrategy?.generateExamples) return prompt;

    const examples = fewShotStrategy.generateExamples(request);

    return `${prompt}\n\n## Exemplos Contextualizados:\n${examples}\n\nCom base nestes exemplos, analise o caso atual:`;
  }

  /**
   * Aplicar Role-Playing
   */
  private async applyRolePlaying(prompt: string, request: PromptRequest): Promise<string> {
    const rolePlayingStrategy = this.strategies.get('role_playing');
    if (!rolePlayingStrategy?.generatePersona) return prompt;

    const persona = rolePlayingStrategy.generatePersona(request);

    return `Você é ${persona.name}, ${persona.description}.\n\n${prompt}\n\nResponda como ${persona.name}:`;
  }

  /**
   * Aplicar Structured Output
   */
  private async applyStructuredOutput(prompt: string, request: PromptRequest): Promise<string> {
    const structuredOutputStrategy = this.strategies.get('structured_output');
    if (!structuredOutputStrategy?.generateOutputFormat) return prompt;

    const outputFormat = structuredOutputStrategy.generateOutputFormat(request);

    return `${prompt}\n\n## Formato de Resposta:\nResponda no seguinte formato JSON:\n\`\`\`json\n${outputFormat}\n\`\`\``;
  }

  /**
   * Aplicar Context Optimization
   */
  private async applyContextOptimization(prompt: string, request: PromptRequest): Promise<string> {
    const contextOptimizationStrategy = this.strategies.get('context_optimization');
    if (!contextOptimizationStrategy?.optimizeContext) return prompt;

    const optimizedContext = contextOptimizationStrategy.optimizeContext(request);

    return `${optimizedContext}\n\n${prompt}`;
  }

  /**
   * Executar prompt com IA
   */
  private async executePrompt(prompt: string, request: PromptRequest): Promise<Omit<PromptResponse, 'metadata'>> {
    // Simular execução com IA (implementar integração real)
    const response = await this.simulateAIResponse(prompt, request);
    
    return {
      content: response.content,
      confidence: response.confidence,
      reasoning: response.reasoning,
      suggestions: response.suggestions
    };
  }

  /**
   * Simular resposta de IA (para desenvolvimento)
   */
  private async simulateAIResponse(prompt: string, request: PromptRequest): Promise<{
    content: string;
    confidence: number;
    reasoning: string[];
    suggestions: string[];
  }> {
    // Simular processamento
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const template = this.prompts.get(request.type);
    const baseResponse = template?.defaultResponse || 'Resposta gerada pela IA';
    
    return {
      content: baseResponse,
      confidence: 0.85,
      reasoning: ['Análise baseada em evidências científicas', 'Consideração de fatores clínicos'],
      suggestions: ['Sugestão 1', 'Sugestão 2', 'Sugestão 3']
    };
  }

  /**
   * Estimar tokens utilizados
   */
  private estimateTokens(text: string): number {
    // Estimativa simples: ~4 caracteres por token
    return Math.ceil(text.length / 4);
  }

  /**
   * Inicializar prompts especializados
   */
  private initializePrompts(): void {
    // Prompt 1: Análise de Casos Clínicos
    this.prompts.set('clinical_analysis', {
      id: 'clinical_analysis',
      name: 'Análise de Casos Clínicos',
      version: '1.0.0',
      description: 'Análise sistemática de casos clínicos com raciocínio clínico estruturado',
      strategies: ['chain_of_thought', 'role_playing', 'structured_output'],
      content: `Analise o seguinte caso clínico de forma sistemática e estruturada:

**Dados do Paciente:**
- Nome: {{patient.name}}
- Idade: {{patient.age}}
- Condição principal: {{clinicalData.condition}}
- Sintomas: {{clinicalData.symptoms}}
- Histórico médico: {{clinicalData.history}}

**Objetivo:** Fornecer análise clínica detalhada com diagnóstico diferencial e plano de tratamento.`,
      defaultResponse: 'Análise clínica detalhada será fornecida...',
      examples: []
    });

    // Prompt 2: Prescrição de Exercícios
    this.prompts.set('exercise_prescription', {
      id: 'exercise_prescription',
      name: 'Prescrição de Exercícios',
      version: '1.0.0',
      description: 'Prescrição personalizada de exercícios fisioterapêuticos',
      strategies: ['few_shot_learning', 'structured_output', 'context_optimization'],
      content: `Prescreva exercícios fisioterapêuticos personalizados para o paciente:

**Perfil do Paciente:**
- Condição: {{clinicalData.condition}}
- Limitações: {{clinicalData.limitations}}
- Objetivos: {{clinicalData.goals}}
- Equipamentos disponíveis: {{clinicalData.equipment}}

**Objetivo:** Criar protocolo de exercícios progressivo e personalizado.`,
      defaultResponse: 'Protocolo de exercícios será prescrito...',
      examples: []
    });

    // Prompt 3: Relatórios de Evolução
    this.prompts.set('evolution_report', {
      id: 'evolution_report',
      name: 'Relatórios de Evolução',
      version: '1.0.0',
      description: 'Geração de relatórios de evolução padronizados',
      strategies: ['structured_output', 'context_optimization'],
      content: `Gere relatório de evolução padronizado:

**Dados da Sessão:**
- Data: {{appointment.startTime}}
- Terapeuta: {{therapist.name}}
- Tipo de sessão: {{appointment.type}}
- Objetivos da sessão: {{sessionData.objectives}}
- Resultados obtidos: {{sessionData.results}}

**Objetivo:** Relatório estruturado seguindo padrões COFFITO.`,
      defaultResponse: 'Relatório de evolução será gerado...',
      examples: []
    });

    // Prompt 4: Diagnóstico Diferencial
    this.prompts.set('differential_diagnosis', {
      id: 'differential_diagnosis',
      name: 'Diagnóstico Diferencial',
      version: '1.0.0',
      description: 'Diagnóstico diferencial baseado em evidências',
      strategies: ['chain_of_thought', 'structured_output', 'role_playing'],
      content: `Realize diagnóstico diferencial sistemático:

**Apresentação Clínica:**
- Sintomas principais: {{clinicalData.mainSymptoms}}
- Sintomas secundários: {{clinicalData.secondarySymptoms}}
- Exame físico: {{clinicalData.physicalExam}}
- Testes realizados: {{clinicalData.tests}}

**Objetivo:** Diagnóstico diferencial com classificação GRADE.`,
      defaultResponse: 'Diagnóstico diferencial será realizado...',
      examples: []
    });

    // Prompt 5: Protocolos de Tratamento
    this.prompts.set('treatment_protocols', {
      id: 'treatment_protocols',
      name: 'Protocolos de Tratamento',
      version: '1.0.0',
      description: 'Desenvolvimento de protocolos baseados em evidências',
      strategies: ['few_shot_learning', 'structured_output', 'context_optimization'],
      content: `Desenvolva protocolo de tratamento baseado em evidências:

**Condição:**
- Diagnóstico: {{clinicalData.diagnosis}}
- Severidade: {{clinicalData.severity}}
- Fatores prognósticos: {{clinicalData.prognosticFactors}}
- Evidências disponíveis: {{clinicalData.evidence}}

**Objetivo:** Protocolo evidence-based com classificação GRADE.`,
      defaultResponse: 'Protocolo de tratamento será desenvolvido...',
      examples: []
    });

    // Prompt 6: Análise de Efetividade
    this.prompts.set('effectiveness_analysis', {
      id: 'effectiveness_analysis',
      name: 'Análise de Efetividade',
      version: '1.0.0',
      description: 'Análise estatística de efetividade de tratamentos',
      strategies: ['structured_output', 'context_optimization'],
      content: `Analise a efetividade do tratamento:

**Dados do Tratamento:**
- Protocolo utilizado: {{treatmentData.protocol}}
- Duração: {{treatmentData.duration}}
- Sessões realizadas: {{treatmentData.sessions}}
- Resultados obtidos: {{treatmentData.outcomes}}
- Métricas de progresso: {{treatmentData.metrics}}

**Objetivo:** Análise estatística com cálculo de NNT.`,
      defaultResponse: 'Análise de efetividade será realizada...',
      examples: []
    });

    // Prompt 7: Educação de Estagiários
    this.prompts.set('student_education', {
      id: 'student_education',
      name: 'Educação de Estagiários',
      version: '1.0.0',
      description: 'Educação estruturada para estagiários',
      strategies: ['chain_of_thought', 'role_playing', 'few_shot_learning'],
      content: `Eduque o estagiário sobre o caso:

**Caso Clínico:**
- Paciente: {{patient.name}}
- Condição: {{clinicalData.condition}}
- Nível do estagiário: {{studentData.level}}
- Objetivos de aprendizagem: {{studentData.learningObjectives}}

**Objetivo:** Educação progressiva com questionamento socrático.`,
      defaultResponse: 'Sessão educativa será conduzida...',
      examples: []
    });

    // Prompt 8: Comunicação com Pacientes
    this.prompts.set('patient_communication', {
      id: 'patient_communication',
      name: 'Comunicação com Pacientes',
      version: '1.0.0',
      description: 'Comunicação terapêutica centrada no paciente',
      strategies: ['role_playing', 'context_optimization'],
      content: `Comunique-se com o paciente de forma terapêutica:

**Perfil do Paciente:**
- Nome: {{patient.name}}
- Idade: {{patient.age}}
- Perfil de comunicação: {{patient.communicationProfile}}
- Preferências: {{patient.preferences}}
- Canal preferido: {{patient.preferredChannel}}

**Objetivo:** Comunicação empática e eficaz.`,
      defaultResponse: 'Comunicação será adaptada ao perfil do paciente...',
      examples: []
    });
  }

  /**
   * Inicializar estratégias avançadas
   */
  private initializeStrategies(): void {
    // Chain-of-Thought Strategy
    this.strategies.set('chain_of_thought', {
      name: 'Chain-of-Thought',
      description: 'Raciocínio clínico sistemático em etapas',
      generateReasoningSteps: (request: PromptRequest) => [
        'Identificar sintomas e sinais apresentados',
        'Analisar histórico médico e fatores de risco',
        'Considerar diagnósticos diferenciais',
        'Avaliar evidências e contra-indicações',
        'Formular conclusão baseada em evidências'
      ]
    });

    // Few-Shot Learning Strategy
    this.strategies.set('few_shot_learning', {
      name: 'Few-Shot Learning',
      description: 'Aprendizado com exemplos contextualizados',
      generateExamples: (request: PromptRequest) => [
        'Exemplo 1: Caso similar com resultado positivo',
        'Exemplo 2: Caso similar com complicações',
        'Exemplo 3: Caso similar com tratamento alternativo'
      ]
    });

    // Role-Playing Strategy
    this.strategies.set('role_playing', {
      name: 'Role-Playing',
      description: 'Personas específicas com expertise definida',
      generatePersona: (request: PromptRequest) => ({
        name: 'Dr. Experto em Fisioterapia',
        description: 'Especialista com 20 anos de experiência em fisioterapia ortopédica e neurológica'
      })
    });

    // Structured Output Strategy
    this.strategies.set('structured_output', {
      name: 'Structured Output',
      description: 'Formato JSON padronizado para documentação',
      generateOutputFormat: (request: PromptRequest) => `{
  "diagnosis": "string",
  "confidence": "number",
  "evidence": ["string"],
  "recommendations": ["string"],
  "followUp": "string"
}`
    });

    // Context Optimization Strategy
    this.strategies.set('context_optimization', {
      name: 'Context Optimization',
      description: 'Otimização de contexto para melhor aproveitamento',
      optimizeContext: (request: PromptRequest) => {
        const context = [];
        
        if (request.patient) {
          context.push(`Paciente: ${request.patient.name}, ${request.patient.age} anos`);
        }
        
        if (request.appointment) {
          context.push(`Sessão: ${request.appointment.type} em ${request.appointment.startTime}`);
        }
        
        if (request.therapist) {
          context.push(`Terapeuta: ${request.therapist.name}`);
        }
        
        return context.join('\n');
      }
    });
  }
}

// Interfaces auxiliares
interface PromptTemplate {
  id: string;
  name: string;
  version: string;
  description: string;
  strategies: string[];
  content: string;
  defaultResponse: string;
  examples: string[];
}

interface PromptStrategy {
  name: string;
  description: string;
  generateReasoningSteps?: (request: PromptRequest) => string[];
  generateExamples?: (request: PromptRequest) => string[];
  generatePersona?: (request: PromptRequest) => { name: string; description: string };
  generateOutputFormat?: (request: PromptRequest) => string;
  optimizeContext?: (request: PromptRequest) => string;
}
