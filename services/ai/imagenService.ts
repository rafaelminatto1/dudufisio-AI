/**
 * Google Imagen 3 (Banana) Service
 * Serviço para geração de imagens usando Google Imagen 3 via Gemini API
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

// API Key - usar a key fornecida ou variável de ambiente
const API_KEY = process.env.VITE_IMAGEN_API_KEY || 
                process.env.VITE_GEMINI_API_KEY || 
                'AIzaSyDc5vZXFRAlU18dl1Bk9K2NT-BS8GmuLtM';

// Inicializar o cliente Gemini
const genAI = new GoogleGenerativeAI(API_KEY);

export interface ImageGenerationOptions {
  prompt: string;
  negativePrompt?: string;
  numberOfImages?: number;
  aspectRatio?: '1:1' | '16:9' | '9:16' | '4:3' | '3:4';
  outputFormat?: 'png' | 'jpeg';
  safetySettings?: 'strict' | 'moderate' | 'permissive';
}

export interface GeneratedImage {
  url: string;
  base64?: string;
  mimeType: string;
  prompt: string;
}

/**
 * Gera imagens usando Google Imagen 3
 * Nota: Esta é uma implementação preparada para quando a API Imagen 3 estiver disponível
 * Por enquanto, usaremos o Gemini para gerar descrições detalhadas que podem ser usadas
 * com outras ferramentas de geração de imagem ou como placeholder
 */
export class ImagenService {
  private model;

  constructor() {
    // Usar o modelo Gemini para auxiliar na geração de prompts otimizados
    this.model = genAI.getGenerativeModel({ model: 'gemini-pro' });
  }

  /**
   * Otimiza o prompt para geração de imagens médicas/fisioterapia
   */
  async optimizePrompt(userPrompt: string, context: string = 'fisioterapia'): Promise<string> {
    const promptOptimization = `
Você é um especialista em prompts para geração de imagens médicas e de fisioterapia.

Contexto: ${context}
Prompt do usuário: "${userPrompt}"

Crie um prompt DETALHADO e PROFISSIONAL para geração de imagem que:
1. Seja específico sobre anatomia, posicionamento e técnica
2. Inclua detalhes sobre iluminação (luz natural, profissional, clínica)
3. Especifique o estilo (fotorrealista, ilustração médica, diagrama)
4. Mencione o ambiente (clínica moderna, sala de fisioterapia)
5. Inclua detalhes técnicos relevantes
6. Seja apropriado para uso clínico/educacional
7. Evite elementos que possam ser considerados inapropriados

Responda APENAS com o prompt otimizado, sem explicações adicionais.
`;

    const result = await this.model.generateContent(promptOptimization);
    const response = await result.response;
    return response.text().trim();
  }

  /**
   * Gera uma descrição detalhada de imagem para exercícios de fisioterapia
   */
  async generateExerciseImagePrompt(exerciseName: string, bodyPart: string, difficulty: string): Promise<string> {
    const prompt = `
Crie um prompt detalhado para gerar uma imagem profissional de fisioterapia mostrando:

Exercício: ${exerciseName}
Parte do corpo: ${bodyPart}
Dificuldade: ${difficulty}

A imagem deve ser:
- Fotorrealista e profissional
- Em ambiente clínico limpo e moderno
- Com iluminação adequada (luz natural + iluminação clínica)
- Mostrando a posição correta do exercício
- Com foco na área trabalhada
- Incluindo equipamentos relevantes se aplicável
- Adequada para material educacional

Formato: Imagem horizontal (16:9), alta qualidade, fundo neutro ou clínico.
`;

    return await this.optimizePrompt(prompt, 'exercício de fisioterapia');
  }

  /**
   * Gera descrição de imagem para protocolo clínico
   */
  async generateProtocolImagePrompt(protocolName: string, specialty: string): Promise<string> {
    const prompt = `
Crie um prompt para gerar uma imagem ilustrativa de:

Protocolo: ${protocolName}
Especialidade: ${specialty}

A imagem deve representar:
- O conceito principal do protocolo
- Ambiente clínico profissional
- Equipamentos e recursos utilizados
- Abordagem moderna e científica
- Visual limpo e educacional
`;

    return await this.optimizePrompt(prompt, `protocolo clínico de ${specialty}`);
  }

  /**
   * Gera descrição de imagem para material educacional
   */
  async generateEducationalImagePrompt(topic: string, targetAudience: string): Promise<string> {
    const prompt = `
Crie um prompt para gerar uma imagem educacional sobre:

Tópico: ${topic}
Público-alvo: ${targetAudience}

A imagem deve ser:
- Informativa e clara
- Visualmente atraente
- Apropriada para o público-alvo
- Com elementos visuais que facilitem o aprendizado
- Estilo profissional mas acessível
`;

    return await this.optimizePrompt(prompt, 'material educacional de fisioterapia');
  }

  /**
   * Gera múltiplos prompts para uma série de imagens
   */
  async generateImageSeries(
    baseTopic: string,
    variations: string[],
    context: string
  ): Promise<string[]> {
    const prompts: string[] = [];

    for (const variation of variations) {
      const prompt = await this.optimizePrompt(
        `${baseTopic} - ${variation}`,
        context
      );
      prompts.push(prompt);
    }

    return prompts;
  }

  /**
   * Gera prompt para anatomia/diagrama
   */
  async generateAnatomyImagePrompt(bodyPart: string, view: string, annotations: boolean): Promise<string> {
    const prompt = `
Crie um prompt para gerar um diagrama anatômico de:

Parte do corpo: ${bodyPart}
Vista: ${view}
Com anotações: ${annotations ? 'Sim' : 'Não'}

Características:
- Ilustração médica profissional
- Estilo anatômico preciso
- Cores apropriadas para identificação de estruturas
- Clareza visual
${annotations ? '- Legendas e anotações claras' : ''}
- Adequado para material educacional médico
`;

    return await this.optimizePrompt(prompt, 'diagrama anatômico');
  }

  /**
   * Cria um placeholder base64 enquanto a imagem real não está disponível
   */
  createPlaceholder(width: number = 800, height: number = 600, text: string = 'Imagem'): string {
    // Criar um SVG placeholder
    const svg = `
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="#f0f4f8"/>
  <text
    x="50%"
    y="50%"
    font-family="Arial, sans-serif"
    font-size="24"
    fill="#64748b"
    text-anchor="middle"
    dominant-baseline="middle"
  >${text}</text>
</svg>
    `.trim();

    // Converter para base64
    const base64 = btoa(svg);
    return `data:image/svg+xml;base64,${base64}`;
  }

  /**
   * Gera um objeto de imagem com prompt e placeholder
   */
  async generateImageObject(
    type: 'exercise' | 'protocol' | 'anatomy' | 'educational',
    params: any
  ): Promise<GeneratedImage> {
    let optimizedPrompt: string;

    switch (type) {
      case 'exercise':
        optimizedPrompt = await this.generateExerciseImagePrompt(
          params.name,
          params.bodyPart,
          params.difficulty
        );
        break;
      case 'protocol':
        optimizedPrompt = await this.generateProtocolImagePrompt(
          params.name,
          params.specialty
        );
        break;
      case 'anatomy':
        optimizedPrompt = await this.generateAnatomyImagePrompt(
          params.bodyPart,
          params.view,
          params.annotations
        );
        break;
      case 'educational':
        optimizedPrompt = await this.generateEducationalImagePrompt(
          params.topic,
          params.audience
        );
        break;
      default:
        optimizedPrompt = params.prompt;
    }

    // Criar placeholder enquanto não temos a API Imagen 3
    const placeholderText = params.name || params.topic || 'Imagem Fisioterapia';
    const base64 = this.createPlaceholder(800, 600, placeholderText);

    return {
      url: base64,
      base64,
      mimeType: 'image/svg+xml',
      prompt: optimizedPrompt,
    };
  }

  /**
   * Batch generation - gera múltiplas imagens
   */
  async generateBatch(requests: Array<{ type: string; params: any }>): Promise<GeneratedImage[]> {
    const images: GeneratedImage[] = [];

    for (const request of requests) {
      const image = await this.generateImageObject(
        request.type as any,
        request.params
      );
      images.push(image);
    }

    return images;
  }

  /**
   * Salva o prompt otimizado para uso futuro com Imagen 3 ou outras ferramentas
   */
  exportPrompt(image: GeneratedImage): string {
    return JSON.stringify(
      {
        prompt: image.prompt,
        timestamp: new Date().toISOString(),
        version: 'imagen-3-ready',
      },
      null,
      2
    );
  }
}

// Exportar instância singleton
export const imagenService = new ImagenService();

// Tipos de prompts pré-configurados para fisioterapia
export const FISIO_IMAGE_PRESETS = {
  esportiva: {
    style: 'fotorrealista, atlético, dinâmico',
    environment: 'centro de treinamento esportivo, equipamento profissional',
    lighting: 'luz natural, alta energia',
  },
  posOperatoria: {
    style: 'fotorrealista, cuidadoso, profissional',
    environment: 'clínica moderna, equipamento médico',
    lighting: 'iluminação clínica, ambiente calmo',
  },
  geriatrica: {
    style: 'fotorrealista, acolhedor, respeitoso',
    environment: 'sala de fisioterapia acessível, equipamento adaptado',
    lighting: 'luz suave e natural, ambiente confortável',
  },
  anatomia: {
    style: 'ilustração médica precisa, educacional',
    environment: 'fundo limpo e neutro',
    lighting: 'iluminação uniforme para clareza',
  },
};

export default imagenService;

