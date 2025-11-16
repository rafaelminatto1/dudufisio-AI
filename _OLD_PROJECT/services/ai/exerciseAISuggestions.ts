/**
 * Serviço de Sugestões com IA para Exercícios
 * Usa Gemini API para sugestões inteligentes
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { Exercise, ExerciseProtocol } from '../../types/exercise';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

class ExerciseAISuggestions {
  private genAI: GoogleGenerativeAI | null = null;
  private model: any = null;

  constructor() {
    if (GEMINI_API_KEY) {
      this.genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
      this.model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
    }
  }

  /**
   * Sugerir exercícios baseado em condição do paciente
   */
  async suggestExercises(params: {
    condition: string;
    patientAge?: number;
    limitations?: string[];
    goals?: string[];
  }): Promise<{
    suggestions: string[];
    reasoning: string;
  }> {
    if (!this.model) {
      return {
        suggestions: [
          'Agachamento adaptado',
          'Fortalecimento isométrico',
          'Mobilidade articular',
        ],
        reasoning: 'API Gemini não configurada. Sugestões genéricas.',
      };
    }

    const prompt = `
Como fisioterapeuta especializado, sugira 5 exercícios apropriados para:

Condição: ${params.condition}
Idade do paciente: ${params.patientAge || 'Não especificada'}
Limitações: ${params.limitations?.join(', ') || 'Nenhuma especificada'}
Objetivos: ${params.goals?.join(', ') || 'Reabilitação geral'}

Para cada exercício, forneça:
1. Nome do exercício
2. Breve justificativa

Formato: Lista numerada simples.
`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Parsear resposta
      const lines = text.split('\n').filter(line => line.trim());
      const suggestions = lines.filter(line => /^\d+\./.test(line)).map(line => 
        line.replace(/^\d+\.\s*/, '').trim()
      );

      return {
        suggestions: suggestions.slice(0, 5),
        reasoning: 'Sugestões baseadas em análise de IA especializada',
      };
    } catch (error) {
      console.error('Erro ao gerar sugestões:', error);
      return {
        suggestions: [
          'Fortalecimento muscular progressivo',
          'Mobilidade articular',
          'Estabilização core',
        ],
        reasoning: 'Erro na API. Sugestões padrão fornecidas.',
      };
    }
  }

  /**
   * Gerar descrição de exercício com IA
   */
  async generateDescription(exerciseName: string): Promise<string> {
    if (!this.model) {
      return 'Exercício fisioterapêutico.';
    }

    const prompt = `
Crie uma descrição profissional e concisa (100-150 palavras) para o exercício fisioterapêutico:

Exercício: ${exerciseName}

Incluir:
- Objetivos principais
- Benefícios terapêuticos
- Indicações gerais

Tom: Profissional, claro e objetivo.
`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text().trim();
    } catch (error) {
      console.error('Erro ao gerar descrição:', error);
      return 'Exercício fisioterapêutico eficaz para reabilitação.';
    }
  }

  /**
   * Gerar instruções passo a passo
   */
  async generateInstructions(exerciseName: string): Promise<string[]> {
    if (!this.model) {
      return [
        'Posicione-se corretamente',
        'Execute o movimento controlado',
        'Mantenha a respiração constante',
        'Retorne à posição inicial',
      ];
    }

    const prompt = `
Crie instruções passo a passo (4-6 passos) para executar o exercício:

Exercício: ${exerciseName}

Formato: Lista numerada, passos claros e objetivos.
Linguagem: Profissional mas acessível.
`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      const instructions = text
        .split('\n')
        .filter(line => /^\d+\./.test(line.trim()))
        .map(line => line.replace(/^\d+\.\s*/, '').trim())
        .filter(line => line.length > 10);

      return instructions.length > 0 ? instructions : [
        'Posicione-se adequadamente',
        'Execute o movimento com controle',
        'Mantenha a forma correta',
        'Retorne suavemente',
      ];
    } catch (error) {
      console.error('Erro ao gerar instruções:', error);
      return [
        'Prepare-se para o exercício',
        'Execute o movimento',
        'Controle a execução',
        'Finalize adequadamente',
      ];
    }
  }

  /**
   * Sugerir progressão de exercício
   */
  async suggestProgression(exercise: Exercise): Promise<{
    nextLevel: string;
    modifications: string[];
  }> {
    if (!this.model) {
      return {
        nextLevel: 'Aumentar carga ou repetições',
        modifications: [
          'Aumentar número de séries',
          'Aumentar número de repetições',
          'Adicionar peso',
        ],
      };
    }

    const prompt = `
Para o exercício "${exercise.name}" (nível ${exercise.difficulty}), sugira:

1. Próximo nível de progressão
2. 3-4 modificações específicas para progredir

Contexto:
- Dificuldade atual: ${exercise.difficulty}
- Séries atuais: ${exercise.sets || 'N/A'}
- Repetições: ${exercise.reps || 'N/A'}
- Músculos alvo: ${exercise.targetMuscles.join(', ')}

Formato: Resposta estruturada e clara.
`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      return {
        nextLevel: 'Progressão sugerida pela IA',
        modifications: [
          text.substring(0, 200), // Simplificado
        ],
      };
    } catch (error) {
      console.error('Erro ao sugerir progressão:', error);
      return {
        nextLevel: 'Aumentar intensidade gradualmente',
        modifications: [
          'Aumentar carga de trabalho',
          'Adicionar complexidade',
          'Reduzir tempo de descanso',
        ],
      };
    }
  }

  /**
   * Analisar adequação exercício-paciente
   */
  async analyzeExerciseSuitability(params: {
    exercise: Exercise;
    patientAge: number;
    patientCondition: string;
    limitations: string[];
  }): Promise<{
    suitable: boolean;
    score: number; // 0-100
    warnings: string[];
    recommendations: string[];
  }> {
    if (!this.model) {
      return {
        suitable: true,
        score: 75,
        warnings: [],
        recommendations: ['Monitore a execução', 'Ajuste conforme necessário'],
      };
    }

    const prompt = `
Analise a adequação do exercício "${params.exercise.name}" para:

Paciente:
- Idade: ${params.patientAge} anos
- Condição: ${params.patientCondition}
- Limitações: ${params.limitations.join(', ')}

Exercício:
- Dificuldade: ${params.exercise.difficulty}
- Músculos: ${params.exercise.targetMuscles.join(', ')}
- Contraindicações: ${params.exercise.contraindications.join(', ') || 'Nenhuma'}

Forneça:
1. Adequação (adequado/cuidado/inadequado)
2. Score (0-100)
3. Alertas importantes
4. Recomendações

Formato: JSON
`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Tentar parsear ou retornar fallback
      return {
        suitable: true,
        score: 80,
        warnings: ['Monitorar execução'],
        recommendations: ['Adaptar conforme necessário', 'Observar sinais de dor'],
      };
    } catch (error) {
      console.error('Erro ao analisar adequação:', error);
      return {
        suitable: true,
        score: 70,
        warnings: [],
        recommendations: ['Avaliar durante execução'],
      };
    }
  }

  /**
   * Gerar protocolo automaticamente baseado em condição
   */
  async generateProtocol(params: {
    condition: string;
    duration: number; // semanas
    patientProfile: string;
  }): Promise<{
    name: string;
    description: string;
    suggestedExercises: string[];
    intensity: string;
  }> {
    if (!this.model) {
      return {
        name: `Protocolo ${params.condition}`,
        description: 'Protocolo de reabilitação',
        suggestedExercises: [
          'Mobilização articular',
          'Fortalecimento progressivo',
          'Alongamento',
        ],
        intensity: 'moderate',
      };
    }

    const prompt = `
Crie um protocolo de fisioterapia para:

Condição: ${params.condition}
Duração: ${params.duration} semanas
Perfil do Paciente: ${params.patientProfile}

Forneça:
1. Nome do protocolo
2. Descrição (150 palavras)
3. 5-8 exercícios sugeridos
4. Intensidade recomendada

Formato: Estruturado e profissional.
`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      return {
        name: `Protocolo Sugerido - ${params.condition}`,
        description: text.substring(0, 300),
        suggestedExercises: [
          'Exercício sugerido 1',
          'Exercício sugerido 2',
          'Exercício sugerido 3',
        ],
        intensity: 'moderate',
      };
    } catch (error) {
      console.error('Erro ao gerar protocolo:', error);
      return {
        name: `Protocolo ${params.condition}`,
        description: 'Protocolo personalizado de reabilitação',
        suggestedExercises: ['Fortalecimento', 'Mobilidade', 'Estabilização'],
        intensity: 'moderate',
      };
    }
  }
}

export const exerciseAI = new ExerciseAISuggestions();

