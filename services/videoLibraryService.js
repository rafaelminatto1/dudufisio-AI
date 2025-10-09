// services/videoLibraryService.ts
import { SPORT_MODALITIES } from './ai/soraService';
/**
 * Serviço de Biblioteca de Vídeos
 */
export class VideoLibraryService {
    constructor() {
        this.videos = new Map();
        this.exerciseVideoLinks = new Map(); // exerciseId -> videoIds[]
        this.initializeMockData();
    }
    /**
     * Inicializa dados mock para demonstração
     */
    initializeMockData() {
        // Adicionar alguns vídeos mock para cada modalidade
        const mockVideos = [
            {
                id: 'video-jiujitsu-001',
                exercise: 'Passagem de Guarda Fechada',
                modality: 'jiujitsu',
                category: 'Técnicas de Passagem',
                difficulty: 'intermediate',
                linkedExercises: ['exercise-001', 'exercise-002'],
                description: 'Técnica fundamental de passagem de guarda fechada',
                tags: ['jiujitsu', 'guarda', 'passagem', 'técnica'],
                views: 1250,
                likes: 89,
                downloadCount: 34,
                isPublic: true,
                createdBy: 'system',
            },
            {
                id: 'video-muaythai-001',
                exercise: 'Combinação Jab-Cross-Hook',
                modality: 'muaythai',
                category: 'Combinações de Golpes',
                difficulty: 'beginner',
                linkedExercises: ['exercise-003'],
                description: 'Combinação básica de socos no Muay Thai',
                tags: ['muaythai', 'socos', 'combinação', 'básico'],
                views: 890,
                likes: 67,
                downloadCount: 23,
                isPublic: true,
                createdBy: 'system',
            },
            {
                id: 'video-crossfit-001',
                exercise: 'Burpee com Box Jump',
                modality: 'crossfit',
                category: 'Exercícios Compostos',
                difficulty: 'advanced',
                linkedExercises: ['exercise-004'],
                description: 'Exercício de alta intensidade combinando burpee e box jump',
                tags: ['crossfit', 'burpee', 'box jump', 'cardio'],
                views: 2100,
                likes: 156,
                downloadCount: 78,
                isPublic: true,
                createdBy: 'system',
            },
        ];
        mockVideos.forEach(video => {
            const fullVideo = {
                ...video,
                id: video.id,
                url: `data:image/svg+xml;base64,placeholder`,
                thumbnailUrl: `data:image/svg+xml;base64,placeholder`,
                prompt: video.exercise || '',
                optimizedPrompt: '',
                duration: 10,
                aspectRatio: '16:9',
                resolution: '1080p',
                modality: video.modality,
                exercise: video.exercise,
                tags: video.tags || [],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                status: 'ready',
                metadata: { fps: 30, size: 0, format: 'mp4' },
                linkedExercises: video.linkedExercises || [],
                category: video.category,
                difficulty: video.difficulty,
                views: video.views || 0,
                likes: video.likes || 0,
                downloadCount: video.downloadCount || 0,
                isPublic: video.isPublic !== undefined ? video.isPublic : true,
                createdBy: video.createdBy || 'system',
            };
            this.videos.set(fullVideo.id, fullVideo);
            // Criar links exercício-vídeo
            fullVideo.linkedExercises.forEach(exerciseId => {
                const existingLinks = this.exerciseVideoLinks.get(exerciseId) || [];
                existingLinks.push(fullVideo.id);
                this.exerciseVideoLinks.set(exerciseId, existingLinks);
            });
        });
    }
    /**
     * Cria novo vídeo na biblioteca
     */
    async createVideo(video) {
        const newVideo = {
            ...video,
            id: `video-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            views: 0,
            likes: 0,
            downloadCount: 0,
        };
        this.videos.set(newVideo.id, newVideo);
        // Criar links com exercícios
        newVideo.linkedExercises.forEach(exerciseId => {
            const existingLinks = this.exerciseVideoLinks.get(exerciseId) || [];
            existingLinks.push(newVideo.id);
            this.exerciseVideoLinks.set(exerciseId, existingLinks);
        });
        return newVideo;
    }
    /**
     * Atualiza vídeo existente
     */
    async updateVideo(id, updates) {
        const video = this.videos.get(id);
        if (!video)
            return null;
        // Atualizar links de exercícios se mudaram
        if (updates.linkedExercises) {
            // Remover links antigos
            video.linkedExercises.forEach(exerciseId => {
                const links = this.exerciseVideoLinks.get(exerciseId) || [];
                this.exerciseVideoLinks.set(exerciseId, links.filter(vid => vid !== id));
            });
            // Adicionar novos links
            updates.linkedExercises.forEach(exerciseId => {
                const existingLinks = this.exerciseVideoLinks.get(exerciseId) || [];
                if (!existingLinks.includes(id)) {
                    existingLinks.push(id);
                    this.exerciseVideoLinks.set(exerciseId, existingLinks);
                }
            });
        }
        const updatedVideo = {
            ...video,
            ...updates,
            id: video.id,
            updatedAt: new Date().toISOString(),
        };
        this.videos.set(id, updatedVideo);
        return updatedVideo;
    }
    /**
     * Deleta vídeo
     */
    async deleteVideo(id) {
        const video = this.videos.get(id);
        if (!video)
            return false;
        // Remover links com exercícios
        video.linkedExercises.forEach(exerciseId => {
            const links = this.exerciseVideoLinks.get(exerciseId) || [];
            this.exerciseVideoLinks.set(exerciseId, links.filter(vid => vid !== id));
        });
        return this.videos.delete(id);
    }
    /**
     * Busca vídeo por ID
     */
    async getVideoById(id) {
        const video = this.videos.get(id);
        if (video) {
            // Incrementar views
            video.views++;
            this.videos.set(id, video);
        }
        return video || null;
    }
    /**
     * Lista todos os vídeos com filtros
     */
    async listVideos(filters) {
        let videos = Array.from(this.videos.values());
        // Aplicar filtros
        if (filters?.modality) {
            videos = videos.filter(v => v.modality === filters.modality);
        }
        if (filters?.category) {
            videos = videos.filter(v => v.category === filters.category);
        }
        if (filters?.difficulty) {
            videos = videos.filter(v => v.difficulty === filters.difficulty);
        }
        if (filters?.exerciseId) {
            videos = videos.filter(v => v.linkedExercises.includes(filters.exerciseId));
        }
        if (filters?.isPublic !== undefined) {
            videos = videos.filter(v => v.isPublic === filters.isPublic);
        }
        if (filters?.searchTerm) {
            const searchLower = filters.searchTerm.toLowerCase();
            videos = videos.filter(v => v.exercise.toLowerCase().includes(searchLower) ||
                v.description?.toLowerCase().includes(searchLower) ||
                v.category.toLowerCase().includes(searchLower) ||
                v.tags.some(tag => tag.toLowerCase().includes(searchLower)));
        }
        // Ordenação
        switch (filters?.sortBy) {
            case 'popular':
                videos.sort((a, b) => b.views - a.views);
                break;
            case 'liked':
                videos.sort((a, b) => b.likes - a.likes);
                break;
            case 'downloaded':
                videos.sort((a, b) => b.downloadCount - a.downloadCount);
                break;
            case 'recent':
            default:
                videos.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                break;
        }
        // Limitar resultados
        if (filters?.limit) {
            videos = videos.slice(0, filters.limit);
        }
        return videos;
    }
    /**
     * Busca vídeos por modalidade esportiva
     */
    async getVideosByModality(modality) {
        return this.listVideos({ modality, isPublic: true });
    }
    /**
     * Busca vídeos vinculados a um exercício
     */
    async getVideosByExercise(exerciseId) {
        const videoIds = this.exerciseVideoLinks.get(exerciseId) || [];
        return videoIds.map(id => this.videos.get(id)).filter(Boolean);
    }
    /**
     * Vincula vídeo a exercício
     */
    async linkVideoToExercise(videoId, exerciseId) {
        const video = this.videos.get(videoId);
        if (!video)
            return false;
        if (!video.linkedExercises.includes(exerciseId)) {
            video.linkedExercises.push(exerciseId);
            video.updatedAt = new Date().toISOString();
            this.videos.set(videoId, video);
            const existingLinks = this.exerciseVideoLinks.get(exerciseId) || [];
            existingLinks.push(videoId);
            this.exerciseVideoLinks.set(exerciseId, existingLinks);
        }
        return true;
    }
    /**
     * Desvincula vídeo de exercício
     */
    async unlinkVideoFromExercise(videoId, exerciseId) {
        const video = this.videos.get(videoId);
        if (!video)
            return false;
        video.linkedExercises = video.linkedExercises.filter(id => id !== exerciseId);
        video.updatedAt = new Date().toISOString();
        this.videos.set(videoId, video);
        const links = this.exerciseVideoLinks.get(exerciseId) || [];
        this.exerciseVideoLinks.set(exerciseId, links.filter(vid => vid !== videoId));
        return true;
    }
    /**
     * Incrementa likes
     */
    async likeVideo(videoId) {
        const video = this.videos.get(videoId);
        if (!video)
            return false;
        video.likes++;
        this.videos.set(videoId, video);
        return true;
    }
    /**
     * Incrementa downloads
     */
    async downloadVideo(videoId) {
        const video = this.videos.get(videoId);
        if (!video)
            return false;
        video.downloadCount++;
        this.videos.set(videoId, video);
        return true;
    }
    /**
     * Obtém estatísticas por modalidade
     */
    async getModalityStats(modality) {
        const videos = await this.getVideosByModality(modality);
        const totalViews = videos.reduce((sum, v) => sum + v.views, 0);
        const uniqueExercises = new Set(videos.flatMap(v => v.linkedExercises));
        const popularVideos = [...videos].sort((a, b) => b.views - a.views).slice(0, 5);
        const recentVideos = [...videos].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);
        return {
            modality,
            totalVideos: videos.length,
            totalExercises: uniqueExercises.size,
            totalViews,
            popularVideos,
            recentVideos,
        };
    }
    /**
     * Obtém estatísticas gerais
     */
    async getGeneralStats() {
        const allVideos = Array.from(this.videos.values());
        const modalitiesCount = Object.keys(SPORT_MODALITIES).reduce((acc, modality) => {
            acc[modality] = allVideos.filter(v => v.modality === modality).length;
            return acc;
        }, {});
        const categoriesCount = allVideos.reduce((acc, video) => {
            acc[video.category] = (acc[video.category] || 0) + 1;
            return acc;
        }, {});
        return {
            totalVideos: allVideos.length,
            totalViews: allVideos.reduce((sum, v) => sum + v.views, 0),
            totalLikes: allVideos.reduce((sum, v) => sum + v.likes, 0),
            totalDownloads: allVideos.reduce((sum, v) => sum + v.downloadCount, 0),
            modalitiesCount,
            categoriesCount,
            averageVideoLength: allVideos.reduce((sum, v) => sum + v.duration, 0) / allVideos.length || 0,
        };
    }
    /**
     * Busca vídeos populares
     */
    async getPopularVideos(limit = 10) {
        return this.listVideos({ sortBy: 'popular', limit, isPublic: true });
    }
    /**
     * Busca vídeos recentes
     */
    async getRecentVideos(limit = 10) {
        return this.listVideos({ sortBy: 'recent', limit, isPublic: true });
    }
    /**
     * Obtém categorias por modalidade
     */
    getCategoriesByModality(modality) {
        const videos = Array.from(this.videos.values()).filter(v => v.modality === modality);
        return [...new Set(videos.map(v => v.category))];
    }
}
// Exportar instância singleton
export const videoLibraryService = new VideoLibraryService();
export default videoLibraryService;
