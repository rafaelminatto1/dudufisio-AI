// XAI Service - Using OpenAI-compatible API
const xaiApiKey = import.meta.env.VITE_XAI_API_KEY;

export interface XAIChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface XAIChatResponse {
  choices: Array<{
    message: {
      role: string;
      content: string;
    };
  }>;
}

export const xaiService = {
  async chat(messages: XAIChatMessage[], model = 'grok-beta'): Promise<string> {
    if (!xaiApiKey) {
      throw new Error('XAI service not initialized. Check your API key.');
    }

    try {
      const response = await fetch('https://api.x.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${xaiApiKey}`,
        },
        body: JSON.stringify({
          model,
          messages,
          temperature: 0.7,
          max_tokens: 1024,
        }),
      });

      if (!response.ok) {
        throw new Error(`XAI API error: ${response.status} ${response.statusText}`);
      }

      const data: XAIChatResponse = await response.json();
      return data.choices[0]?.message?.content || '';
    } catch (error) {
      console.error('XAI API error:', error);
      throw new Error('Failed to get response from XAI API');
    }
  },

  async generateText(prompt: string, systemPrompt?: string): Promise<string> {
    const messages: XAIChatMessage[] = [];
    
    if (systemPrompt) {
      messages.push({ role: 'system', content: systemPrompt });
    }
    
    messages.push({ role: 'user', content: prompt });

    return this.chat(messages);
  },

  async analyzeText(text: string, analysisType: string): Promise<string> {
    const systemPrompt = `Você é um assistente especializado em análise de texto para fisioterapia. Analise o seguinte texto conforme solicitado: ${analysisType}`;
    return this.generateText(text, systemPrompt);
  },

  isAvailable(): boolean {
    return !!xaiApiKey;
  }
};

export default xaiService;
