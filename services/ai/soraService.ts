/**
 * OpenAI Sora 2 Video Generation Service
 * Serviço para geração de vídeos usando OpenAI Sora 2
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

// API Keys
const OPENAI_API_KEY = process.env.VITE_OPENAI_API_KEY || '';
const GEMINI_API_KEY = process.env.VITE_GEMINI_API_KEY || 'AIzaSyDc5vZXFRAlU18dl1Bk9K2NT-BS8GmuLtM';

// Inicializar Gemini para otimização de prompts
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// Modalidades Esportivas
export const SPORT_MODALITIES = {
  jiujitsu: {
    id: 'jiujitsu',
    name: 'Jiu-Jitsu',
    category: 'Artes Marciais',
    equipment: ['Kimono', 'Tatame', 'Faixa'],
    environment: 'Tatame de artes marciais, ambiente profissional, boa iluminação',
    characteristics: 'Técnicas de solo, pegadas, finalizações, posições',
    colors: ['branco', 'azul', 'preto'],
  },
  muaythai: {
    id: 'muaythai',
    name: 'Muay Thai',
    category: 'Artes Marciais',
    equipment: ['Luvas', 'Protetor bucal', 'Caneleira', 'Ring'],
    environment: 'Ring de luta, academia de muay thai, iluminação dramática',
    characteristics: 'Golpes de punho, chutes, joelhadas, cotoveladas',
    colors: ['vermelho', 'azul', 'preto'],
  },
  crossfit: {
    id: 'crossfit',
    name: 'CrossFit',
    category: 'Fitness',
    equipment: ['Barra', 'Anilhas', 'Box', 'Corda'],
    environment: 'Box de CrossFit, equipamentos funcionais, industrial',
    characteristics: 'Alta intensidade, movimentos funcionais, variados',
    colors: ['preto', 'cinza', 'colorido'],
  },
  yoga: {
    id: 'yoga',
    name: 'Yoga',
    category: 'Bem-Estar',
    equipment: ['Tapete', 'Blocos', 'Cinta'],
    environment: 'Estúdio de yoga, luz natural, ambiente zen',
    characteristics: 'Posturas, respiração, meditação, fluidez',
    colors: ['branco', 'roxo', 'verde'],
  },
  pilates: {
    id: 'pilates',
    name: 'Pilates',
    category: 'Bem-Estar',
    equipment: ['Reformer', 'Cadillac', 'Barrel', 'Tapete'],
    environment: 'Estúdio de pilates, equipamentos específicos, clean',
    characteristics: 'Controle, precisão, fluidez, respiração',
    colors: ['branco', 'cinza', 'preto'],
  },
  natacao: {
    id: 'natacao',
    name: 'Natação',
    category: 'Aquáticos',
    equipment: ['Piscina', 'Touca', 'Óculos'],
    environment: 'Piscina olímpica, água cristalina, raias demarcadas',
    characteristics: 'Técnicas de nado, braçadas, pernadas',
    colors: ['azul', 'turquesa'],
  },
  corrida: {
    id: 'corrida',
    name: 'Corrida',
    category: 'Atletismo',
    equipment: ['Tênis', 'Pista'],
    environment: 'Pista de atletismo, parque, estrada',
    characteristics: 'Passada, ritmo, técnica de corrida',
    colors: ['variado'],
  },
  funcional: {
    id: 'funcional',
    name: 'Treinamento Funcional',
    category: 'Fitness',
    equipment: ['TRX', 'Kettlebell', 'Medicine Ball', 'Cones'],
    environment: 'Academia funcional, espaço amplo, diversos equipamentos',
    characteristics: 'Movimentos naturais, equilíbrio, coordenação',
    colors: ['preto', 'amarelo', 'colorido'],
  },
};

export interface VideoGenerationOptions {
  prompt: string;
  duration?: 5 | 10 | 20; // Duração em segundos
  aspectRatio?: '16:9' | '9:16' | '1:1' | '21:9';
  resolution?: '1080p' | '4k' | '720p';
  fps?: 24 | 30 | 60;
  style?: 'realistic' | 'cinematic' | 'documentary' | 'slow-motion';
  cameraMovement?: 'static' | 'pan' | 'zoom' | 'tracking' | 'orbit' | 'handheld';
  lighting?: 'natural' | 'studio' | 'dramatic' | 'soft' | 'golden-hour';
}

export interface GeneratedVideo {
  id: string;
  url: string;
  thumbnailUrl: string;
  prompt: string;
  optimizedPrompt: string;
  duration: number;
  aspectRatio: string;
  resolution: string;
  modality?: string;
  exercise?: string;
  tags: string[];
  createdAt: string;
  status: 'generating' | 'ready' | 'error';
  metadata: {
    fps: number;
    size: number;
    format: string;
  };
}

export interface VideoTemplate {
  id: string;
  name: string;
  description: string;
  modality: string;
  basePrompt: string;
  suggestedSettings: VideoGenerationOptions;
  examples: string[];
}

/**
 * Serviço de Geração de Vídeos com Sora 2
 */
export class SoraService {
  private model;
  private videos: Map<string, GeneratedVideo> = new Map();

  constructor() {
    this.model = genAI.getGenerativeModel({ model: 'gemini-pro' });
  }

  /**
   * Otimiza o prompt para geração de vídeos de exercícios
   */
  async optimizeVideoPrompt(
    userPrompt: string,
    modality: string,
    exerciseType?: string,
    additionalContext?: string
  ): Promise<string> {
    const modalityInfo = SPORT_MODALITIES[modality as keyof typeof SPORT_MODALITIES];

    const optimizationPrompt = `
Você é um especialista em criação de prompts para geração de vídeos de exercícios físicos e modalidades esportivas.

Modalidade: ${modalityInfo?.name || modality}
Tipo de exercício: ${exerciseType || 'Geral'}
Prompt do usuário: "${userPrompt}"
Contexto adicional: ${additionalContext || 'N/A'}

Informações da modalidade:
- Categoria: ${modalityInfo?.category}
- Equipamentos: ${modalityInfo?.equipment.join(', ')}
- Ambiente: ${modalityInfo?.environment}
- Características: ${modalityInfo?.characteristics}
- Cores predominantes: ${modalityInfo?.colors.join(', ')}

Crie um prompt DETALHADO e CINEMATOGRÁFICO para geração de vídeo que:
1. Seja específico sobre a técnica, posicionamento e movimento
2. Inclua detalhes sobre o ambiente e cenário (${modalityInfo?.environment})
3. Especifique iluminação (profissional, natural, dramática)
4. Descreva o enquadramento da câmera (close-up, plano aberto, etc)
5. Inclua movimento de câmera se apropriado (pan, zoom, tracking)
6. Mencione equipamentos relevantes (${modalityInfo?.equipment.join(', ')})
7. Defina o estilo visual (realista, cinematográfico, slow-motion)
8. Seja apropriado para uso educacional e profissional
9. Inclua detalhes sobre vestimenta/uniforme (${modalityInfo?.colors.join(', ')})
10. Especifique a duração ideal da ação

Formato esperado:
- Estilo visual e cinematográfico
- Descrição do ambiente e cenário
- Descrição detalhada da ação/exercício/técnica
- Enquadramento e movimento de câmera
- Iluminação e atmosfera
- Detalhes técnicos específicos

Responda APENAS com o prompt otimizado, sem explicações adicionais.
`;

    const result = await this.model.generateContent(optimizationPrompt);
    const response = await result.response;
    return response.text().trim();
  }

  /**
   * Gera prompt específico para exercício de fisioterapia
   */
  async generateExerciseVideoPrompt(
    exerciseName: string,
    modality: string,
    difficulty: string,
    duration: number = 10
  ): Promise<string> {
    const modalityInfo = SPORT_MODALITIES[modality as keyof typeof SPORT_MODALITIES];

    const basePrompt = `
Crie um vídeo profissional de ${duration} segundos mostrando o exercício "${exerciseName}" 
no contexto de ${modalityInfo?.name || modality}.

Especificações:
- Ambiente: ${modalityInfo?.environment}
- Equipamentos: ${modalityInfo?.equipment.join(', ')}
- Nível: ${difficulty}
- Estilo: Profissional, educacional, cinematográfico
- Iluminação: Natural + iluminação profissional
- Câmera: Múltiplos ângulos (frontal, lateral, close-up)
- Demonstração: Clara, técnica correta, movimento completo
- Vestimenta: ${modalityInfo?.colors.join(' ou ')}
- Foco: Técnica, postura, execução correta
`;

    return await this.optimizeVideoPrompt(basePrompt, modality, exerciseName);
  }

  /**
   * Gera prompt para técnica de arte marcial (Jiu-Jitsu, Muay Thai, etc)
   */
  async generateMartialArtsTechniquePrompt(
    technique: string,
    modality: string,
    position?: string,
    demonstration: 'solo' | 'pair' = 'pair'
  ): Promise<string> {
    const modalityInfo = SPORT_MODALITIES[modality as keyof typeof SPORT_MODALITIES];

    const basePrompt = `
Vídeo cinematográfico de ${modality} - técnica: ${technique}

Setup:
- Local: ${modalityInfo?.environment}
- Praticantes: ${demonstration === 'pair' ? '2 atletas demonstrando' : '1 atleta demonstrando'}
- Posição inicial: ${position || 'Posição padrão'}
- Uniformes: Kimonos ${modalityInfo?.colors[0]} e ${modalityInfo?.colors[1]}
- Iluminação: Dramática, destacando movimento
- Câmera: Tracking shot acompanhando movimento
- Estilo: Cinematográfico, slow-motion nos momentos-chave
- Foco: Execução técnica perfeita, detalhes das pegadas/posições

Sequência:
1. Posição inicial (2s)
2. Execução da técnica em velocidade normal (4s)
3. Repetição em slow-motion destacando pontos-chave (4s)
`;

    return await this.optimizeVideoPrompt(basePrompt, modality, technique, demonstration);
  }

  /**
   * Gera prompt para série de exercícios
   */
  async generateWorkoutSeriesPrompt(
    exercises: string[],
    modality: string,
    duration: number = 20
  ): Promise<string> {
    const modalityInfo = SPORT_MODALITIES[modality as keyof typeof SPORT_MODALITIES];

    const basePrompt = `
Vídeo de sequência de treino de ${modality} - ${duration} segundos

Exercícios na sequência:
${exercises.map((ex, i) => `${i + 1}. ${ex}`).join('\n')}

Características:
- Ambiente: ${modalityInfo?.environment}
- Transições: Fluidas e dinâmicas
- Ritmo: Energético, motivacional
- Câmera: Múltiplos ângulos, cortes dinâmicos
- Música: [silêncio - será adicionada na pós-produção]
- Texto: Legendas com nome de cada exercício
- Estilo: Profissional, inspiracional
- Demonstração: Atleta executando com perfeição técnica
`;

    return await this.optimizeVideoPrompt(basePrompt, modality, exercises.join(', '));
  }

  /**
   * Cria objeto de vídeo com placeholder
   */
  async generateVideoObject(
    type: 'exercise' | 'technique' | 'series' | 'demonstration',
    params: any,
    options: Partial<VideoGenerationOptions> = {}
  ): Promise<GeneratedVideo> {
    let optimizedPrompt: string;

    // Gerar prompt otimizado baseado no tipo
    switch (type) {
      case 'exercise':
        optimizedPrompt = await this.generateExerciseVideoPrompt(
          params.name,
          params.modality,
          params.difficulty,
          params.duration || 10
        );
        break;

      case 'technique':
        optimizedPrompt = await this.generateMartialArtsTechniquePrompt(
          params.technique,
          params.modality,
          params.position,
          params.demonstration
        );
        break;

      case 'series':
        optimizedPrompt = await this.generateWorkoutSeriesPrompt(
          params.exercises,
          params.modality,
          params.duration || 20
        );
        break;

      case 'demonstration':
        optimizedPrompt = await this.optimizeVideoPrompt(
          params.prompt,
          params.modality,
          params.exerciseType,
          params.additionalContext
        );
        break;

      default:
        optimizedPrompt = params.prompt;
    }

    // Criar objeto de vídeo
    const videoId = `video-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const video: GeneratedVideo = {
      id: videoId,
      url: this.createVideoPlaceholder(params.name || params.technique || 'Video'),
      thumbnailUrl: this.createThumbnailPlaceholder(params.name || params.technique || 'Video'),
      prompt: params.prompt || params.name || params.technique,
      optimizedPrompt,
      duration: options.duration || params.duration || 10,
      aspectRatio: options.aspectRatio || '16:9',
      resolution: options.resolution || '1080p',
      modality: params.modality,
      exercise: params.name || params.technique,
      tags: params.tags || [params.modality, type],
      createdAt: new Date().toISOString(),
      status: 'ready', // Simulado - seria 'generating' em produção
      metadata: {
        fps: options.fps || 30,
        size: 0, // Placeholder
        format: 'mp4',
      },
    };

    this.videos.set(videoId, video);
    return video;
  }

  /**
   * Cria placeholder para vídeo (SVG animado)
   */
  private createVideoPlaceholder(text: string): string {
    const svg = `
<svg width="1920" height="1080" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="#1a1a2e"/>
  <circle cx="960" cy="540" r="80" fill="#16213e" opacity="0.5">
    <animate attributeName="r" values="80;100;80" dur="2s" repeatCount="indefinite"/>
  </circle>
  <text
    x="50%"
    y="45%"
    font-family="Arial, sans-serif"
    font-size="48"
    fill="#eaeaea"
    text-anchor="middle"
  >🎬 Vídeo: ${text}</text>
  <text
    x="50%"
    y="55%"
    font-family="Arial, sans-serif"
    font-size="24"
    fill="#a0a0a0"
    text-anchor="middle"
  >Gerando com Sora 2...</text>
</svg>
    `.trim();

    return `data:image/svg+xml;base64,${btoa(svg)}`;
  }

  /**
   * Cria placeholder para thumbnail
   */
  private createThumbnailPlaceholder(text: string): string {
    const svg = `
<svg width="320" height="180" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="#2a2a3e"/>
  <text
    x="50%"
    y="50%"
    font-family="Arial, sans-serif"
    font-size="18"
    fill="#ffffff"
    text-anchor="middle"
    dominant-baseline="middle"
  >🎬 ${text}</text>
</svg>
    `.trim();

    return `data:image/svg+xml;base64,${btoa(svg)}`;
  }

  /**
   * Lista vídeos gerados
   */
  async listVideos(filters?: {
    modality?: string;
    exercise?: string;
    status?: string;
  }): Promise<GeneratedVideo[]> {
    let videos = Array.from(this.videos.values());

    if (filters?.modality) {
      videos = videos.filter(v => v.modality === filters.modality);
    }

    if (filters?.exercise) {
      videos = videos.filter(v => v.exercise === filters.exercise);
    }

    if (filters?.status) {
      videos = videos.filter(v => v.status === filters.status);
    }

    return videos.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  /**
   * Obtém vídeo por ID
   */
  async getVideo(id: string): Promise<GeneratedVideo | null> {
    return this.videos.get(id) || null;
  }

  /**
   * Deleta vídeo
   */
  async deleteVideo(id: string): Promise<boolean> {
    return this.videos.delete(id);
  }

  /**
   * Exporta prompt otimizado
   */
  exportPrompt(video: GeneratedVideo): string {
    return JSON.stringify(
      {
        prompt: video.optimizedPrompt,
        modality: video.modality,
        exercise: video.exercise,
        duration: video.duration,
        aspectRatio: video.aspectRatio,
        resolution: video.resolution,
        timestamp: video.createdAt,
        version: 'sora-2-ready',
      },
      null,
      2
    );
  }

  /**
   * Gera batch de vídeos
   */
  async generateBatch(
    requests: Array<{ type: string; params: any; options?: Partial<VideoGenerationOptions> }>
  ): Promise<GeneratedVideo[]> {
    const videos: GeneratedVideo[] = [];

    for (const request of requests) {
      const video = await this.generateVideoObject(
        request.type as any,
        request.params,
        request.options
      );
      videos.push(video);
    }

    return videos;
  }
}

// Templates pré-configurados
export const VIDEO_TEMPLATES: VideoTemplate[] = [
  {
    id: 'jiujitsu-guard-pass',
    name: 'Passagem de Guarda - Jiu-Jitsu',
    description: 'Técnica de passagem de guarda fechada',
    modality: 'jiujitsu',
    basePrompt: 'Demonstração de passagem de guarda fechada em jiu-jitsu',
    suggestedSettings: {
      duration: 10,
      aspectRatio: '16:9',
      resolution: '1080p',
      fps: 30,
      style: 'cinematic',
      cameraMovement: 'tracking',
      lighting: 'dramatic',
    },
    examples: ['Passagem de guarda com pressão', 'Passagem de guarda em pé', 'Passagem de guarda por baixo'],
  },
  {
    id: 'muaythai-combo',
    name: 'Combinação de Golpes - Muay Thai',
    description: 'Sequência de golpes no saco de pancadas',
    modality: 'muaythai',
    basePrompt: 'Lutador de muay thai executando combinação de golpes',
    suggestedSettings: {
      duration: 10,
      aspectRatio: '16:9',
      resolution: '1080p',
      fps: 60,
      style: 'slow-motion',
      cameraMovement: 'static',
      lighting: 'dramatic',
    },
    examples: ['Jab-Cross-Hook', 'Low kick-Mid kick-High kick', 'Joelhada-Cotovelada'],
  },
  // Adicionar mais templates...
];

// Exportar instância singleton
export const soraService = new SoraService();

export default soraService;
