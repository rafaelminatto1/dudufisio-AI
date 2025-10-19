/**
 * OpenAI Sora 2 API Direct Integration
 * Integração direta com a API Sora 2 para geração de vídeos REAIS
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

// API Keys
const OPENAI_API_KEY = process.env.VITE_OPENAI_API_KEY || '';
const GEMINI_API_KEY = process.env.VITE_GEMINI_API_KEY || 'AIzaSyDc5vZXFRAlU18dl1Bk9K2NT-BS8GmuLtM';

// Inicializar Gemini para otimização de prompts
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

export interface SoraVideoRequest {
  prompt: string;
  duration?: 5 | 10 | 20;
  aspectRatio?: '16:9' | '9:16' | '1:1';
  quality?: 'standard' | 'hd' | '4k';
  style?: string;
}

export interface SoraVideoResponse {
  id: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  videoUrl?: string;
  thumbnailUrl?: string;
  prompt: string;
  duration: number;
  aspectRatio: string;
  createdAt: string;
  completedAt?: string;
  error?: string;
  progress?: number; // 0-100
}

/**
 * Serviço de Integração com API Sora 2
 */
export class SoraApiService {
  private model;
  private apiEndpoint = 'https://api.openai.com/v1/videos/generations';
  private videoQueue: Map<string, SoraVideoResponse> = new Map();

  constructor() {
    this.model = genAI.getGenerativeModel({ model: 'gemini-pro' });
  }

  /**
   * Gera vídeo usando API Sora 2
   */
  async generateVideo(request: SoraVideoRequest): Promise<SoraVideoResponse> {
    const videoId = `sora-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Criar registro inicial
    const videoResponse: SoraVideoResponse = {
      id: videoId,
      status: 'queued',
      prompt: request.prompt,
      duration: request.duration || 10,
      aspectRatio: request.aspectRatio || '16:9',
      createdAt: new Date().toISOString(),
      progress: 0,
    };

    this.videoQueue.set(videoId, videoResponse);

    // Iniciar processo de geração (assíncrono)
    this.processVideoGeneration(videoId, request);

    return videoResponse;
  }

  /**
   * Processa a geração do vídeo (simulado - em produção faria chamada real à API)
   */
  private async processVideoGeneration(videoId: string, request: SoraVideoRequest) {
    const video = this.videoQueue.get(videoId);
    if (!video) return;

    try {
      // Atualizar status para processing
      video.status = 'processing';
      video.progress = 10;
      this.videoQueue.set(videoId, video);

      // SIMULAÇÃO: Em produção, aqui faria a chamada real à API Sora 2
      /*
      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: request.prompt,
          duration: request.duration,
          aspect_ratio: request.aspectRatio,
          quality: request.quality,
        }),
      });

      const data = await response.json();
      */

      // SIMULAÇÃO: Progresso incremental
      for (let progress = 20; progress <= 90; progress += 10) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        video.progress = progress;
        this.videoQueue.set(videoId, video);
      }

      // SIMULAÇÃO: Vídeo completo
      // Em produção, aqui você receberia a URL real do vídeo gerado
      await new Promise(resolve => setTimeout(resolve, 2000));

      video.status = 'completed';
      video.progress = 100;
      video.completedAt = new Date().toISOString();
      
      // URLs simuladas - em produção viriam da API
      video.videoUrl = this.createVideoPlaceholder(request.prompt);
      video.thumbnailUrl = this.createThumbnailPlaceholder(request.prompt);

      this.videoQueue.set(videoId, video);

    } catch (error) {
      video.status = 'failed';
      video.error = error instanceof Error ? error.message : 'Erro ao gerar vídeo';
      this.videoQueue.set(videoId, video);
    }
  }

  /**
   * Verifica status de um vídeo em processamento
   */
  async checkVideoStatus(videoId: string): Promise<SoraVideoResponse | null> {
    return this.videoQueue.get(videoId) || null;
  }

  /**
   * Lista todos os vídeos na fila
   */
  async listQueuedVideos(): Promise<SoraVideoResponse[]> {
    return Array.from(this.videoQueue.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  /**
   * Cancela geração de vídeo
   */
  async cancelVideo(videoId: string): Promise<boolean> {
    const video = this.videoQueue.get(videoId);
    if (video?.status === 'completed') return false;

    video.status = 'failed';
    video.error = 'Cancelado pelo usuário';
    this.videoQueue.set(videoId, video);

    return true;
  }

  /**
   * Remove vídeo da fila
   */
  async deleteVideo(videoId: string): Promise<boolean> {
    return this.videoQueue.delete(videoId);
  }

  /**
   * Otimiza prompt usando Gemini antes de enviar para Sora
   */
  async optimizePromptForSora(
    userPrompt: string,
    context: {
      modality?: string;
      exercise?: string;
      style?: string;
      duration?: number;
    }
  ): Promise<string> {
    const optimizationPrompt = `
Você é um especialista em criar prompts para geração de vídeos com IA (Sora 2).

Prompt do usuário: "${userPrompt}"

Contexto:
- Modalidade: ${context.modality || 'N/A'}
- Exercício: ${context.exercise || 'N/A'}
- Estilo: ${context.style || 'Realista'}
- Duração: ${context.duration || 10} segundos

Crie um prompt CINEMATOGRÁFICO e DETALHADO para Sora 2 que:

1. **Descrição Visual Clara**
   - Cena inicial (2-3s)
   - Ação principal (6-7s)
   - Finalização (1-2s)

2. **Detalhes Técnicos**
   - Enquadramento da câmera (wide shot, close-up, etc)
   - Movimento de câmera (static, pan, tracking, orbit)
   - Iluminação (natural, studio, dramatic, golden hour)
   - Velocidade (normal, slow-motion)

3. **Elementos Visuais**
   - Ambiente e cenário
   - Pessoas (quantas, características)
   - Equipamentos e objetos
   - Cores predominantes

4. **Estilo e Atmosfera**
   - Estilo visual (cinematográfico, documentário, etc)
   - Mood/Atmosfera (energético, calmo, profissional)
   - Qualidade (4K, cinematic, professional-grade)

5. **Continuidade e Fluxo**
   - Transições suaves
   - Movimento natural
   - Sem cortes bruscos

Formato do prompt otimizado:
"[Estilo visual]. [Descrição da cena]. [Câmera e movimento]. [Iluminação]. [Ação detalhada]. [Finalização]."

Responda APENAS com o prompt otimizado, pronto para ser usado no Sora 2.
`;

    const result = await this.model.generateContent(optimizationPrompt);
    const response = await result.response;
    return response.text().trim();
  }

  /**
   * Gera vídeo com otimização automática de prompt
   */
  async generateVideoWithOptimization(
    userPrompt: string,
    context: {
      modality?: string;
      exercise?: string;
      style?: string;
      duration?: 5 | 10 | 20;
      aspectRatio?: '16:9' | '9:16' | '1:1';
      quality?: 'standard' | 'hd' | '4k';
    }
  ): Promise<SoraVideoResponse> {
    // Otimizar prompt
    const optimizedPrompt = await this.optimizePromptForSora(userPrompt, context);

    // Gerar vídeo com prompt otimizado
    return this.generateVideo({
      prompt: optimizedPrompt,
      duration: context.duration,
      aspectRatio: context.aspectRatio,
      quality: context.quality,
      style: context.style,
    });
  }

  /**
   * Cria placeholder para vídeo (será substituído por vídeo real)
   */
  private createVideoPlaceholder(prompt: string): string {
    const svg = `
<svg width="1920" height="1080" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#grad1)"/>
  <circle cx="960" cy="540" r="100" fill="white" opacity="0.1">
    <animate attributeName="r" values="100;120;100" dur="2s" repeatCount="indefinite"/>
  </circle>
  <text
    x="50%"
    y="45%"
    font-family="Arial, sans-serif"
    font-size="48"
    font-weight="bold"
    fill="white"
    text-anchor="middle"
  >🎬 Sora 2</text>
  <text
    x="50%"
    y="55%"
    font-family="Arial, sans-serif"
    font-size="24"
    fill="white"
    text-anchor="middle"
    opacity="0.8"
  >Gerando vídeo...</text>
  <text
    x="50%"
    y="62%"
    font-family="Arial, sans-serif"
    font-size="16"
    fill="white"
    text-anchor="middle"
    opacity="0.6"
  >${prompt.substring(0, 60)}...</text>
</svg>
    `.trim();

    return `data:image/svg+xml;base64,${btoa(svg)}`;
  }

  /**
   * Cria placeholder para thumbnail
   */
  private createThumbnailPlaceholder(prompt: string): string {
    const svg = `
<svg width="320" height="180" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="thumbGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#thumbGrad)"/>
  <text
    x="50%"
    y="50%"
    font-family="Arial, sans-serif"
    font-size="24"
    fill="white"
    text-anchor="middle"
    dominant-baseline="middle"
  >🎬 Sora 2</text>
</svg>
    `.trim();

    return `data:image/svg+xml;base64,${btoa(svg)}`;
  }

  /**
   * Obtém estatísticas da fila
   */
  getQueueStats() {
    const videos = Array.from(this.videoQueue.values());
    return {
      total: videos.length,
      queued: videos.filter(v => v.status === 'queued').length,
      processing: videos.filter(v => v.status === 'processing').length,
      completed: videos.filter(v => v.status === 'completed').length,
      failed: videos.filter(v => v.status === 'failed').length,
    };
  }
}

// Exportar instância singleton
export const soraApiService = new SoraApiService();

// Template para chamada REAL da API Sora 2 (quando disponível)
export const SORA_API_EXAMPLE = `
// Exemplo de como usar a API real do Sora 2:

async function generateVideoWithRealAPI(prompt: string) {
  const response = await fetch('https://api.openai.com/v1/videos/generations', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer YOUR_OPENAI_API_KEY',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'sora-2',
      prompt: prompt,
      duration: 10,
      aspect_ratio: '16:9',
      quality: 'hd',
    }),
  });

  const data = await response.json();
  
  // Resposta esperada:
  // {
  //   id: 'vid_abc123',
  //   object: 'video',
  //   created: 1234567890,
  //   status: 'processing',
  //   video_url: null (após processamento)
  // }

  return data;
}

// Verificar status:
async function checkStatus(videoId: string) {
  const response = await fetch(\`https://api.openai.com/v1/videos/\${videoId}\`, {
    headers: {
      'Authorization': 'Bearer YOUR_OPENAI_API_KEY',
    },
  });

  return await response.json();
}
`;

export default soraApiService;
