import { createServerComponentClient } from '~/lib/supabase/server';

export type AIProvider = 'openai' | 'anthropic' | 'groq' | 'gemini';
export type AIUseCase = 'soap_note' | 'exercise_suggestion' | 'treatment_plan' | 'patient_insight' | 'general';

export interface AIRequest {
  prompt: string;
  useCase: AIUseCase;
  provider?: AIProvider;
  maxTokens?: number;
  temperature?: number;
  context?: Record<string, any>;
}

export interface AIResponse {
  content: string;
  provider: AIProvider;
  tokensUsed?: number;
  model?: string;
  error?: string;
}

/**
 * Service orquestrador de IA - Integra múltiplos providers
 * Adaptado para Next.js App Router
 */
export class AIOrchestratorService {
  private static readonly DEFAULT_PROVIDER: AIProvider = 'openai';
  private static readonly FALLBACK_PROVIDERS: AIProvider[] = ['anthropic', 'groq'];

  /**
   * Gera resposta de IA usando o provider especificado ou padrão
   */
  static async generateResponse(request: AIRequest) {
    try {
      const provider = request.provider || this.DEFAULT_PROVIDER;
      
      // Tentar com provider principal
      const response = await this.callProvider(provider, request);
      
      if (response.error) {
        // Fallback para outros providers
        for (const fallbackProvider of this.FALLBACK_PROVIDERS) {
          if (fallbackProvider !== provider) {
            const fallbackResponse = await this.callProvider(fallbackProvider, request);
            if (!fallbackResponse.error) {
              return { data: fallbackResponse, error: null };
            }
          }
        }
        throw new Error(response.error);
      }

      // Log da requisição
      await this.logRequest(request, response);

      return { data: response, error: null };
    } catch (error) {
      console.error('Error generating AI response:', error);
      return { data: null, error };
    }
  }

  /**
   * Chama provider específico
   */
  private static async callProvider(provider: AIProvider, request: AIRequest): Promise<AIResponse> {
    switch (provider) {
      case 'openai':
        return await this.callOpenAI(request);
      case 'anthropic':
        return await this.callAnthropic(request);
      case 'groq':
        return await this.callGroq(request);
      case 'gemini':
        return await this.callGemini(request);
      default:
        throw new Error(`Provider ${provider} not supported`);
    }
  }

  /**
   * Chama OpenAI
   */
  private static async callOpenAI(request: AIRequest): Promise<AIResponse> {
    try {
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) {
        throw new Error('OpenAI API key not configured');
      }

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: this.getSystemPrompt(request.useCase),
            },
            {
              role: 'user',
              content: request.prompt,
            },
          ],
          max_tokens: request.maxTokens || 2000,
          temperature: request.temperature || 0.7,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error?.message || 'OpenAI API error');

      return {
        content: data.choices[0]?.message?.content || '',
        provider: 'openai',
        tokensUsed: data.usage?.total_tokens,
        model: data.model,
      };
    } catch (error: any) {
      return {
        content: '',
        provider: 'openai',
        error: error.message || 'OpenAI API error',
      };
    }
  }

  /**
   * Chama Anthropic (Claude)
   */
  private static async callAnthropic(request: AIRequest): Promise<AIResponse> {
    try {
      const apiKey = process.env.ANTHROPIC_API_KEY;
      if (!apiKey) {
        throw new Error('Anthropic API key not configured');
      }

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-3-opus-20240229',
          max_tokens: request.maxTokens || 2000,
          messages: [
            {
              role: 'user',
              content: request.prompt,
            },
          ],
          system: this.getSystemPrompt(request.useCase),
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error?.message || 'Anthropic API error');

      return {
        content: data.content[0]?.text || '',
        provider: 'anthropic',
        tokensUsed: data.usage?.input_tokens + data.usage?.output_tokens,
        model: data.model,
      };
    } catch (error: any) {
      return {
        content: '',
        provider: 'anthropic',
        error: error.message || 'Anthropic API error',
      };
    }
  }

  /**
   * Chama Groq
   */
  private static async callGroq(request: AIRequest): Promise<AIResponse> {
    try {
      const apiKey = process.env.GROQ_API_KEY;
      if (!apiKey) {
        throw new Error('Groq API key not configured');
      }

      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.1-70b-versatile',
          messages: [
            {
              role: 'system',
              content: this.getSystemPrompt(request.useCase),
            },
            {
              role: 'user',
              content: request.prompt,
            },
          ],
          max_tokens: request.maxTokens || 2000,
          temperature: request.temperature || 0.7,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error?.message || 'Groq API error');

      return {
        content: data.choices[0]?.message?.content || '',
        provider: 'groq',
        tokensUsed: data.usage?.total_tokens,
        model: data.model,
      };
    } catch (error: any) {
      return {
        content: '',
        provider: 'groq',
        error: error.message || 'Groq API error',
      };
    }
  }

  /**
   * Chama Gemini
   */
  private static async callGemini(request: AIRequest): Promise<AIResponse> {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error('Gemini API key not configured');
      }

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `${this.getSystemPrompt(request.useCase)}\n\n${request.prompt}`,
                  },
                ],
              },
            ],
          }),
        }
      );

      const data = await response.json();
      if (!response.ok) throw new Error(data.error?.message || 'Gemini API error');

      return {
        content: data.candidates[0]?.content?.parts[0]?.text || '',
        provider: 'gemini',
        model: 'gemini-pro',
      };
    } catch (error: any) {
      return {
        content: '',
        provider: 'gemini',
        error: error.message || 'Gemini API error',
      };
    }
  }

  /**
   * Obtém prompt do sistema baseado no caso de uso
   */
  private static getSystemPrompt(useCase: AIUseCase): string {
    const prompts = {
      soap_note: 'Você é um assistente especializado em fisioterapia. Ajude a estruturar notas SOAP (Subjetivo, Objetivo, Avaliação, Plano) de forma clara e profissional.',
      exercise_suggestion: 'Você é um especialista em exercícios de fisioterapia. Sugira exercícios apropriados baseados nas necessidades do paciente.',
      treatment_plan: 'Você é um fisioterapeuta experiente. Crie planos de tratamento detalhados e personalizados.',
      patient_insight: 'Você é um analista clínico. Forneça insights sobre a evolução e progresso dos pacientes.',
      general: 'Você é um assistente especializado em fisioterapia. Forneça respostas úteis e precisas.',
    };

    return prompts[useCase] || prompts.general;
  }

  /**
   * Loga requisição no banco de dados
   */
  private static async logRequest(request: AIRequest, response: AIResponse) {
    try {
      const supabase = await createServerComponentClient();
      await supabase.from('ai_requests').insert({
        prompt: request.prompt,
        use_case: request.useCase,
        provider: response.provider,
        response: response.content,
        tokens_used: response.tokensUsed,
        model: response.model,
        error: response.error,
      });
    } catch (error) {
      console.error('Error logging AI request:', error);
      // Não falhar se logging falhar
    }
  }

  /**
   * Gera nota SOAP usando IA
   */
  static async generateSOAPNote(params: {
    patientInfo: string;
    sessionNotes: string;
    previousNotes?: string;
  }) {
    const prompt = `Com base nas seguintes informações do paciente e da sessão, gere uma nota SOAP estruturada:

Informações do Paciente:
${params.patientInfo}

Notas da Sessão:
${params.sessionNotes}

${params.previousNotes ? `Notas Anteriores:\n${params.previousNotes}` : ''}

Gere uma nota SOAP completa e profissional.`;

    return this.generateResponse({
      prompt,
      useCase: 'soap_note',
    });
  }

  /**
   * Sugere exercícios usando IA
   */
  static async suggestExercises(params: {
    diagnosis: string;
    patientCondition: string;
    goals: string[];
  }) {
    const prompt = `Com base no diagnóstico "${params.diagnosis}" e na condição do paciente "${params.patientCondition}", sugira exercícios apropriados para alcançar os seguintes objetivos: ${params.goals.join(', ')}.

Forneça uma lista de exercícios com descrições, séries, repetições e precauções.`;

    return this.generateResponse({
      prompt,
      useCase: 'exercise_suggestion',
    });
  }
}

