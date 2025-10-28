// AI Orchestrator Service - Gemini API Integration
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import { AIProvider, AIResponse, AIQueryLog } from '../../types';

// Rate limiting configuration
const RATE_LIMIT = {
  maxRequestsPerMinute: 10,
  requests: [] as number[],
};

// Check rate limit
function checkRateLimit(): boolean {
  const now = Date.now();
  const oneMinuteAgo = now - 60000;

  // Remove old requests
  RATE_LIMIT.requests = RATE_LIMIT.requests.filter(time => time > oneMinuteAgo);

  // Check if within limit
  if (RATE_LIMIT.requests.length >= RATE_LIMIT.maxRequestsPerMinute) {
    return false;
  }

  // Add current request
  RATE_LIMIT.requests.push(now);
  return true;
}

export class AiOrchestratorService {
  private genAI: GoogleGenerativeAI | null = null;
  private model: any = null;
  private queryHistory: AIQueryLog[] = [];

  constructor() {
    this.initializeGemini();
  }

  private initializeGemini() {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

    if (!apiKey || apiKey === 'your_gemini_api_key') {
      console.warn('⚠️ Gemini API key not configured. Using fallback mock responses.');
      return;
    }

    try {
      this.genAI = new GoogleGenerativeAI(apiKey);

      // Configure model with safety settings
      this.model = this.genAI.getGenerativeModel({
        model: 'gemini-pro',
        safetySettings: [
          {
            category: HarmCategory.HARM_CATEGORY_HARASSMENT,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
          },
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        },
      });

      console.log('✅ Gemini API initialized successfully');
    } catch (error) {
      console.error('❌ Error initializing Gemini API:', error);
      this.genAI = null;
      this.model = null;
    }
  }

  async query(prompt: string, provider?: string): Promise<AIResponse> {
    // Check rate limit
    if (!checkRateLimit()) {
      throw new Error('Rate limit exceeded. Please wait a moment before trying again.');
    }

    // Fallback to mock if Gemini not configured
    if (!this.model) {
      return this.getMockResponse(prompt, provider);
    }

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Log query
      this.logQuery(prompt, text, 'gemini');

      return {
        content: text,
        source: 'gemini',
      };
    } catch (error) {
      console.error('Error calling Gemini API:', error);

      // Fallback to mock on error
      return this.getMockResponse(prompt, provider);
    }
  }

  async getQueryHistory(): Promise<AIQueryLog[]> {
    return this.queryHistory.slice(-10); // Return last 10 queries
  }

  async getAvailableProviders(): Promise<AIProvider[]> {
    return this.model ? ['gemini' as AIProvider] : ['mock' as AIProvider];
  }

  async generateSoapNote(data: any): Promise<any> {
    const prompt = `
Como um assistente especializado em fisioterapia, gere uma nota SOAP completa baseada nos seguintes dados:

Subjetivo: ${data.subjective || 'Não informado'}
Objetivo: ${data.objective || 'Não informado'}
Dor (EVA): ${data.painScale !== undefined ? data.painScale + '/10' : 'Não informado'}
Pontos de Dor: ${data.painPoints && data.painPoints.length > 0 ? data.painPoints.join(', ') : 'Não informado'}

Forneça:
1. **Assessment (Avaliação)**: Análise clínica detalhada do quadro
2. **Plan (Plano)**: Plano de tratamento baseado em evidências

Retorne APENAS um objeto JSON válido no seguinte formato (sem markdown, sem texto adicional):
{
  "assessment": "texto da avaliação aqui",
  "plan": "texto do plano aqui"
}
`;

    try {
      const result = await this.query(prompt);

      // Try to parse JSON from response
      const text = result.content.trim();

      // Remove markdown code blocks if present
      const cleanedText = text.replace(/```json\s*|\s*```/g, '').trim();

      try {
        const parsed = JSON.parse(cleanedText);
        return parsed;
      } catch (parseError) {
        // If JSON parsing fails, try to extract content manually
        console.warn('Failed to parse JSON, using fallback extraction');

        return {
          assessment: this.extractSection(text, 'assessment') || 'Análise clínica pendente.',
          plan: this.extractSection(text, 'plan') || 'Plano de tratamento pendente.',
        };
      }
    } catch (error) {
      console.error('Error generating SOAP note:', error);
      throw error;
    }
  }

  async getResponse(prompt: string): Promise<any> {
    // Enhanced prompt for structured response
    const enhancedPrompt = `
${prompt}

IMPORTANTE: Retorne sua resposta como um objeto JSON válido no seguinte formato:
{
  "assessment": "texto da avaliação",
  "plan": "texto do plano",
  "alerts": [
    {
      "id": "1",
      "severity": "critical",
      "message": "mensagem do alerta",
      "recommendation": "recomendação específica"
    }
  ],
  "evidences": [
    {
      "title": "Título do estudo",
      "reference": "Autor et al., Ano"
    }
  ]
}

Certifique-se de que:
- Todos os textos estão em português brasileiro
- Os alertas têm severity: "critical", "important" ou "info"
- Inclua pelo menos 1-2 evidências científicas relevantes
- Retorne APENAS o JSON, sem markdown ou texto adicional
`;

    try {
      const result = await this.query(enhancedPrompt);
      const text = result.content.trim();

      // Remove markdown code blocks if present
      const cleanedText = text.replace(/```json\s*|\s*```/g, '').trim();

      try {
        return JSON.parse(cleanedText);
      } catch (parseError) {
        console.warn('Failed to parse structured response, using fallback');

        // Return fallback structure
        return {
          assessment: this.extractSection(text, 'assessment') ||
            'Análise clínica baseada nos dados coletados.',
          plan: this.extractSection(text, 'plan') ||
            'Plano de tratamento individualizado.',
          alerts: [],
          evidences: [],
        };
      }
    } catch (error) {
      console.error('Error getting AI response:', error);
      throw error;
    }
  }

  // Helper methods
  private getMockResponse(prompt: string, provider?: string): AIResponse {
    return {
      content: `Mock AI response for: ${prompt.slice(0, 50)}...`,
      source: provider || 'mock',
    };
  }

  private logQuery(prompt: string, response: string, source: string) {
    this.queryHistory.push({
      id: `${Date.now()}-${Math.random()}`,
      prompt: prompt.slice(0, 100) + '...',
      response: response.slice(0, 200) + '...',
      timestamp: new Date(),
      provider: source as AIProvider,
    });

    // Keep only last 50 queries
    if (this.queryHistory.length > 50) {
      this.queryHistory = this.queryHistory.slice(-50);
    }
  }

  private extractSection(text: string, section: string): string | null {
    // Try to extract specific section from text
    const patterns = [
      new RegExp(`"${section}":\\s*"([^"]*)"`, 'i'),
      new RegExp(`${section}:\\s*([^\\n]*?)(?:\\n|$)`, 'i'),
      new RegExp(`\\*\\*${section}\\*\\*:\\s*([^\\n]*?)(?:\\n|$)`, 'i'),
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }

    return null;
  }

  // Check if Gemini API is available
  isGeminiConfigured(): boolean {
    return this.model !== null;
  }

  // Get current provider
  getCurrentProvider(): string {
    return this.model ? 'gemini' : 'mock';
  }
}

export const aiOrchestratorService = new AiOrchestratorService();
