// services/videoIntegrationService.ts
// Serviço para integrar vídeos gerados com a biblioteca de exercícios

import { Exercise } from '../types/exercise';

export interface GeneratedVideo {
  id: string;
  exerciseName: string;
  modality: string;
  tool: string;
  videoUrl: string;
  duration: string;
  thumbnailUrl: string;
  prompt: string;
  generatedAt: string;
  status: 'generated' | 'saved' | 'integrated';
  integratedWithExercise?: string; // ID do exercício integrado
}

export interface VideoGenerationRequest {
  exerciseName: string;
  modality: string;
  tool: 'capcut' | 'canva' | 'adobefirefly';
  description?: string;
}

class VideoIntegrationService {
  private readonly STORAGE_KEY = 'generatedVideos';
  private readonly EXERCISE_INTEGRATION_KEY = 'exerciseVideoIntegration';

  // Gerar vídeo com ferramenta gratuita
  async generateVideo(request: VideoGenerationRequest): Promise<GeneratedVideo> {
    // Simular delay de geração baseado na ferramenta
    const delays = {
      capcut: 3000,
      canva: 4000,
      adobefirefly: 5000
    };
    
    await new Promise(resolve => setTimeout(resolve, delays[request.tool] + Math.random() * 2000));
    
    // Gerar vídeo único baseado no prompt
    const seed = `${request.exerciseName.toLowerCase()}-${request.modality}-${request.tool}-${Date.now()}`;
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      const char = seed.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    
    const videos = [
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4',
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    ];
    
    const durations = ['0:08', '0:10', '0:12', '0:15', '0:18', '0:20', '0:25', '0:30', '0:35', '0:40'];
    const videoIndex = Math.abs(hash) % videos.length;
    const durationIndex = Math.abs(hash) % durations.length;
    
    const generatedVideo: GeneratedVideo = {
      id: `video_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      exerciseName: request.exerciseName,
      modality: request.modality,
      tool: request.tool,
      videoUrl: videos[videoIndex],
      duration: durations[durationIndex],
      thumbnailUrl: `https://picsum.photos/800/450?random=${Math.abs(hash) % 1000}`,
      prompt: this.generateOptimizedPrompt(request),
      generatedAt: new Date().toISOString(),
      status: 'generated'
    };

    // Salvar automaticamente
    await this.saveGeneratedVideo(generatedVideo);
    
    return generatedVideo;
  }

  // Gerar prompt otimizado para cada ferramenta
  private generateOptimizedPrompt(request: VideoGenerationRequest): string {
    const toolPrompts = {
      capcut: `Crie um vídeo demonstrando ${request.exerciseName} em ${request.modality}. ${request.description ? `Contexto: ${request.description}.` : ''} Mostre a técnica completa com movimento em velocidade normal e repetição em câmera lenta. Ambiente profissional de artes marciais, iluminação natural, câmera fixa em ângulo frontal. Duração: 15-30 segundos.`,
      
      canva: `Gere um vídeo tutorial de ${request.exerciseName} para ${request.modality}. ${request.description ? `Foco em: ${request.description}.` : ''} Estilo profissional, movimento fluido, demonstração clara da técnica. Use template esportivo com cores vibrantes. Duração: 15-25 segundos.`,
      
      adobefirefly: `Crie um vídeo artístico mostrando ${request.exerciseName} em ${request.modality}. ${request.description ? `Enfoque: ${request.description}.` : ''} Estilo cinematográfico, movimento elegante, iluminação dramática. Mostre a técnica em detalhes com transições suaves. Duração: 10-15 segundos.`
    };

    return toolPrompts[request.tool];
  }

  // Salvar vídeo gerado
  async saveGeneratedVideo(video: GeneratedVideo): Promise<void> {
    const videos = await this.getAllGeneratedVideos();
    videos.push(video);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(videos));
  }

  // Obter todos os vídeos gerados
  async getAllGeneratedVideos(): Promise<GeneratedVideo[]> {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Erro ao carregar vídeos gerados:', error);
      return [];
    }
  }

  // Obter vídeo por ID
  async getVideoById(id: string): Promise<GeneratedVideo | null> {
    const videos = await this.getAllGeneratedVideos();
    return videos.find(video => video.id === id) || null;
  }

  // Integrar vídeo com exercício existente
  async integrateVideoWithExercise(videoId: string, exerciseId: string): Promise<boolean> {
    try {
      const video = await this.getVideoById(videoId);
      if (!video) return false;

      // Atualizar status do vídeo
      video.status = 'integrated';
      video.integratedWithExercise = exerciseId;
      await this.updateVideo(video);

      // Salvar integração
      const integrations = await this.getVideoIntegrations();
      integrations[videoId] = exerciseId;
      localStorage.setItem(this.EXERCISE_INTEGRATION_KEY, JSON.stringify(integrations));

      return true;
    } catch (error) {
      console.error('Erro ao integrar vídeo com exercício:', error);
      return false;
    }
  }

  // Atualizar vídeo
  private async updateVideo(updatedVideo: GeneratedVideo): Promise<void> {
    const videos = await this.getAllGeneratedVideos();
    const index = videos.findIndex(video => video.id === updatedVideo.id);
    if (index !== -1) {
      videos[index] = updatedVideo;
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(videos));
    }
  }

  // Obter integrações de vídeo
  async getVideoIntegrations(): Promise<{ [videoId: string]: string }> {
    try {
      const stored = localStorage.getItem(this.EXERCISE_INTEGRATION_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error('Erro ao carregar integrações:', error);
      return {};
    }
  }

  // Obter vídeos por exercício
  async getVideosByExercise(exerciseId: string): Promise<GeneratedVideo[]> {
    const integrations = await this.getVideoIntegrations();
    const videoIds = Object.keys(integrations).filter(videoId => integrations[videoId] === exerciseId);
    
    const videos = await this.getAllGeneratedVideos();
    return videos.filter(video => videoIds.includes(video.id));
  }

  // Obter vídeos por modalidade
  async getVideosByModality(modality: string): Promise<GeneratedVideo[]> {
    const videos = await this.getAllGeneratedVideos();
    return videos.filter(video => video.modality === modality);
  }

  // Obter vídeos por ferramenta
  async getVideosByTool(tool: string): Promise<GeneratedVideo[]> {
    const videos = await this.getAllGeneratedVideos();
    return videos.filter(video => video.tool === tool);
  }

  // Estatísticas
  async getVideoStats(): Promise<{
    total: number;
    byTool: { [tool: string]: number };
    byModality: { [modality: string]: number };
    byStatus: { [status: string]: number };
  }> {
    const videos = await this.getAllGeneratedVideos();
    
    const stats = {
      total: videos.length,
      byTool: {} as { [tool: string]: number },
      byModality: {} as { [modality: string]: number },
      byStatus: {} as { [status: string]: number }
    };

    videos.forEach(video => {
      // Por ferramenta
      stats.byTool[video.tool] = (stats.byTool[video.tool] || 0) + 1;
      
      // Por modalidade
      stats.byModality[video.modality] = (stats.byModality[video.modality] || 0) + 1;
      
      // Por status
      stats.byStatus[video.status] = (stats.byStatus[video.status] || 0) + 1;
    });

    return stats;
  }

  // Deletar vídeo
  async deleteVideo(videoId: string): Promise<boolean> {
    try {
      const videos = await this.getAllGeneratedVideos();
      const filteredVideos = videos.filter(video => video.id !== videoId);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filteredVideos));

      // Remover integração se existir
      const integrations = await this.getVideoIntegrations();
      if (integrations[videoId]) {
        delete integrations[videoId];
        localStorage.setItem(this.EXERCISE_INTEGRATION_KEY, JSON.stringify(integrations));
      }

      return true;
    } catch (error) {
      console.error('Erro ao deletar vídeo:', error);
      return false;
    }
  }

  // Buscar exercícios similares para sugestão de integração
  async findSimilarExercises(video: GeneratedVideo): Promise<Exercise[]> {
    // Esta função seria implementada com busca real na biblioteca de exercícios
    // Por enquanto, retorna array vazio
    return [];
  }

  // Exportar vídeos gerados
  async exportGeneratedVideos(): Promise<string> {
    const videos = await this.getAllGeneratedVideos();
    const integrations = await this.getVideoIntegrations();
    
    const exportData = {
      videos,
      integrations,
      exportedAt: new Date().toISOString(),
      version: '1.0'
    };

    return JSON.stringify(exportData, null, 2);
  }

  // Importar vídeos gerados
  async importGeneratedVideos(data: string): Promise<boolean> {
    try {
      const importData = JSON.parse(data);
      
      if (importData.videos && Array.isArray(importData.videos)) {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(importData.videos));
      }
      
      if (importData.integrations && typeof importData.integrations === 'object') {
        localStorage.setItem(this.EXERCISE_INTEGRATION_KEY, JSON.stringify(importData.integrations));
      }

      return true;
    } catch (error) {
      console.error('Erro ao importar vídeos:', error);
      return false;
    }
  }
}

export const videoIntegrationService = new VideoIntegrationService();
