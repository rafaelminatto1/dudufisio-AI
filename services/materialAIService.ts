import { GoogleGenerativeAI } from '@google/generative-ai';

interface AIGenerationOptions {
  tone?: 'formal' | 'informal' | 'técnico' | 'didático';
  length?: 'curto' | 'médio' | 'longo';
  includeReferences?: boolean;
  targetAudience?: 'profissionais' | 'pacientes' | 'estudantes';
}

interface AIGenerationResult {
  success: boolean;
  content?: string;
  suggestions?: string[];
  error?: string;
}

class MaterialAIService {
  private genAI: GoogleGenerativeAI | null = null;

  constructor() {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
    if (apiKey) {
      this.genAI = new GoogleGenerativeAI(apiKey);
    }
  }

  // Gerar conteúdo completo de material
  async generateMaterialContent(
    topic: string,
    category: string,
    options: AIGenerationOptions = {}
  ): Promise<AIGenerationResult> {
    if (!this.genAI) {
      return {
        success: false,
        error: 'API do Gemini não configurada. Configure VITE_GEMINI_API_KEY.',
      };
    }

    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });

      const prompt = this.buildMaterialPrompt(topic, category, options);
      const result = await model.generateContent(prompt);
      const content = result.response.text();

      return {
        success: true,
        content,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao gerar conteúdo',
      };
    }
  }

  // Expandir seção existente
  async expandSection(
    sectionTitle: string,
    currentContent: string,
    context: string
  ): Promise<AIGenerationResult> {
    if (!this.genAI) {
      return {
        success: false,
        error: 'API do Gemini não configurada.',
      };
    }

    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });

      const prompt = `
Você é um especialista em fisioterapia. Expanda a seguinte seção de um material clínico:

**Título da Seção:** ${sectionTitle}

**Conteúdo Atual:**
${currentContent}

**Contexto do Material:**
${context}

Expanda esta seção com informações detalhadas, baseadas em evidências científicas.
Mantenha o tom técnico mas acessível. Use formatação HTML para melhor apresentação.
`;

      const result = await model.generateContent(prompt);
      const content = result.response.text();

      return {
        success: true,
        content,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao expandir seção',
      };
    }
  }

  // Sugerir melhorias no conteúdo
  async suggestImprovements(content: string): Promise<AIGenerationResult> {
    if (!this.genAI) {
      return {
        success: false,
        error: 'API do Gemini não configurada.',
      };
    }

    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });

      const prompt = `
Analise o seguinte conteúdo de material clínico de fisioterapia e sugira melhorias:

${content}

Forneça sugestões específicas sobre:
1. Clareza e organização
2. Informações que podem ser adicionadas
3. Terminologia técnica
4. Estruturação do conteúdo
5. Referências ou evidências que poderiam ser incluídas

Liste as sugestões em formato de lista com marcadores.
`;

      const result = await model.generateContent(prompt);
      const suggestions = result.response.text();

      return {
        success: true,
        content: suggestions,
        suggestions: this.parseSuggestions(suggestions),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao gerar sugestões',
      };
    }
  }

  // Gerar resumo do conteúdo
  async generateSummary(content: string, maxLength: number = 200): Promise<AIGenerationResult> {
    if (!this.genAI) {
      return {
        success: false,
        error: 'API do Gemini não configurada.',
      };
    }

    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });

      const prompt = `
Crie um resumo conciso do seguinte material clínico em no máximo ${maxLength} palavras:

${content}

O resumo deve capturar os pontos principais e ser adequado para profissionais de saúde.
`;

      const result = await model.generateContent(prompt);
      const summary = result.response.text();

      return {
        success: true,
        content: summary,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao gerar resumo',
      };
    }
  }

  // Sugerir tags baseadas no conteúdo
  async suggestTags(content: string): Promise<string[]> {
    if (!this.genAI) {
      return [];
    }

    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });

      const prompt = `
Analise o seguinte conteúdo de material clínico e sugira 5-10 tags relevantes (palavras-chave):

${content}

Retorne apenas as tags separadas por vírgula, sem explicações.
`;

      const result = await model.generateContent(prompt);
      const tags = result.response.text()
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      return tags;
    } catch (error) {
      console.error('Erro ao sugerir tags:', error);
      return [];
    }
  }

  // Gerar título sugerido
  async suggestTitle(content: string): Promise<string | null> {
    if (!this.genAI) {
      return null;
    }

    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });

      const prompt = `
Baseado no seguinte conteúdo, sugira um título claro e descritivo para este material clínico:

${content.substring(0, 500)}...

Retorne apenas o título sugerido, sem explicações.
`;

      const result = await model.generateContent(prompt);
      const title = result.response.text().trim().replace(/^["']|["']$/g, '');

      return title;
    } catch (error) {
      console.error('Erro ao sugerir título:', error);
      return null;
    }
  }

  // Corrigir gramática e ortografia
  async correctGrammar(content: string): Promise<AIGenerationResult> {
    if (!this.genAI) {
      return {
        success: false,
        error: 'API do Gemini não configurada.',
      };
    }

    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });

      const prompt = `
Corrija possíveis erros de gramática e ortografia no seguinte texto, mantendo a formatação HTML:

${content}

Retorne o texto corrigido, preservando toda a formatação.
`;

      const result = await model.generateContent(prompt);
      const correctedContent = result.response.text();

      return {
        success: true,
        content: correctedContent,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao corrigir gramática',
      };
    }
  }

  // Traduzir conteúdo
  async translateContent(content: string, targetLanguage: string): Promise<AIGenerationResult> {
    if (!this.genAI) {
      return {
        success: false,
        error: 'API do Gemini não configurada.',
      };
    }

    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });

      const prompt = `
Traduza o seguinte conteúdo de material clínico para ${targetLanguage}, mantendo a formatação HTML e terminologia técnica apropriada:

${content}
`;

      const result = await model.generateContent(prompt);
      const translatedContent = result.response.text();

      return {
        success: true,
        content: translatedContent,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao traduzir conteúdo',
      };
    }
  }

  // Helpers privados

  private buildMaterialPrompt(
    topic: string,
    category: string,
    options: AIGenerationOptions
  ): string {
    const { tone = 'técnico', length = 'médio', includeReferences = true, targetAudience = 'profissionais' } = options;

    let lengthInstruction = '';
    if (length === 'curto') lengthInstruction = 'Seja conciso, aproximadamente 300-500 palavras.';
    else if (length === 'médio') lengthInstruction = 'Desenvolva o tema com detalhes, aproximadamente 800-1200 palavras.';
    else lengthInstruction = 'Crie um material extenso e completo, aproximadamente 1500-2500 palavras.';

    return `
Você é um fisioterapeuta especialista criando material clínico de alta qualidade.

**Tópico:** ${topic}
**Categoria:** ${category}
**Tom:** ${tone}
**Público-alvo:** ${targetAudience}

${lengthInstruction}

Estruture o conteúdo com:
1. Introdução clara
2. Desenvolvimento com subtítulos
3. Informações baseadas em evidências
4. Exemplos práticos quando aplicável
${includeReferences ? '5. Referências bibliográficas relevantes' : ''}

Use formatação HTML apropriada (h2, h3, p, ul, ol, strong, em) para melhor apresentação.
Mantenha o conteúdo profissional e cientificamente embasado.
`;
  }

  private parseSuggestions(text: string): string[] {
    // Extrair sugestões do texto
    const lines = text.split('\n');
    const suggestions = lines
      .filter(line => line.trim().startsWith('-') || line.trim().match(/^\d+\./))
      .map(line => line.replace(/^[-\d.]\s*/, '').trim())
      .filter(line => line.length > 0);

    return suggestions;
  }
}

export const materialAIService = new MaterialAIService();
export default materialAIService;

