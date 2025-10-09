// services/personalizedVideoCrudService.ts
// Serviço CRUD completo para vídeos personalizados
class PersonalizedVideoCrudService {
    constructor() {
        this.STORAGE_KEY = 'personalizedVideos';
        this.BACKUP_KEY = 'personalizedVideosBackup';
        this.STATS_KEY = 'videoStats';
    }
    // CREATE - Criar novo vídeo
    async createVideo(videoData) {
        try {
            const video = {
                ...videoData,
                id: this.generateId(),
                generatedAt: new Date().toISOString(),
                status: 'generated',
                hash: this.generateHash(videoData.exerciseName, videoData.modality, videoData.tool),
                views: 0,
                likes: 0,
                downloads: 0,
                integratedWithExercises: [],
                protocols: [],
                metadata: {
                    resolution: '1080p',
                    fps: 30,
                    codec: 'H.264',
                    ...videoData.metadata
                }
            };
            const videos = await this.getAllVideos();
            videos.push(video);
            await this.saveVideos(videos);
            // Atualizar estatísticas
            await this.updateStats();
            return video;
        }
        catch (error) {
            console.error('Erro ao criar vídeo:', error);
            throw error;
        }
    }
    // READ - Obter vídeo por ID
    async getVideoById(id) {
        try {
            const videos = await this.getAllVideos();
            return videos.find(video => video.id === id) || null;
        }
        catch (error) {
            console.error('Erro ao buscar vídeo:', error);
            return null;
        }
    }
    // READ - Obter todos os vídeos
    async getAllVideos() {
        try {
            const stored = localStorage.getItem(this.STORAGE_KEY);
            return stored ? JSON.parse(stored) : [];
        }
        catch (error) {
            console.error('Erro ao carregar vídeos:', error);
            return [];
        }
    }
    // READ - Buscar vídeos com filtros
    async searchVideos(filters = {}, sort = { field: 'generatedAt', direction: 'desc' }) {
        try {
            let videos = await this.getAllVideos();
            // Aplicar filtros
            if (filters.modality) {
                videos = videos.filter(video => video.modality === filters.modality);
            }
            if (filters.tool) {
                videos = videos.filter(video => video.tool === filters.tool);
            }
            if (filters.difficulty) {
                videos = videos.filter(video => video.difficulty === filters.difficulty);
            }
            if (filters.bodyParts && filters.bodyParts.length > 0) {
                videos = videos.filter(video => filters.bodyParts.some(part => video.bodyParts.includes(part)));
            }
            if (filters.equipment && filters.equipment.length > 0) {
                videos = videos.filter(video => filters.equipment.some(eq => video.equipment.includes(eq)));
            }
            if (filters.status) {
                videos = videos.filter(video => video.status === filters.status);
            }
            if (filters.search) {
                const searchTerm = filters.search.toLowerCase();
                videos = videos.filter(video => video.exerciseName.toLowerCase().includes(searchTerm) ||
                    video.description?.toLowerCase().includes(searchTerm) ||
                    video.tags.some(tag => tag.toLowerCase().includes(searchTerm)));
            }
            if (filters.dateRange) {
                const startDate = new Date(filters.dateRange.start);
                const endDate = new Date(filters.dateRange.end);
                videos = videos.filter(video => {
                    const videoDate = new Date(video.generatedAt);
                    return videoDate >= startDate && videoDate <= endDate;
                });
            }
            // Aplicar ordenação
            videos.sort((a, b) => {
                const aValue = a[sort.field];
                const bValue = b[sort.field];
                if (typeof aValue === 'string' && typeof bValue === 'string') {
                    return sort.direction === 'asc'
                        ? aValue.localeCompare(bValue)
                        : bValue.localeCompare(aValue);
                }
                if (typeof aValue === 'number' && typeof bValue === 'number') {
                    return sort.direction === 'asc' ? aValue - bValue : bValue - aValue;
                }
                return 0;
            });
            return videos;
        }
        catch (error) {
            console.error('Erro ao buscar vídeos:', error);
            return [];
        }
    }
    // UPDATE - Atualizar vídeo
    async updateVideo(id, updates) {
        try {
            const videos = await this.getAllVideos();
            const index = videos.findIndex(video => video.id === id);
            if (index === -1)
                return false;
            videos[index] = {
                ...videos[index],
                ...updates,
                lastModified: new Date().toISOString()
            };
            await this.saveVideos(videos);
            await this.updateStats();
            return true;
        }
        catch (error) {
            console.error('Erro ao atualizar vídeo:', error);
            return false;
        }
    }
    // UPDATE - Incrementar visualizações
    async incrementViews(id) {
        try {
            const video = await this.getVideoById(id);
            if (!video)
                return false;
            return await this.updateVideo(id, { views: video.views + 1 });
        }
        catch (error) {
            console.error('Erro ao incrementar visualizações:', error);
            return false;
        }
    }
    // UPDATE - Incrementar likes
    async incrementLikes(id) {
        try {
            const video = await this.getVideoById(id);
            if (!video)
                return false;
            return await this.updateVideo(id, { likes: video.likes + 1 });
        }
        catch (error) {
            console.error('Erro ao incrementar likes:', error);
            return false;
        }
    }
    // UPDATE - Incrementar downloads
    async incrementDownloads(id) {
        try {
            const video = await this.getVideoById(id);
            if (!video)
                return false;
            return await this.updateVideo(id, { downloads: video.downloads + 1 });
        }
        catch (error) {
            console.error('Erro ao incrementar downloads:', error);
            return false;
        }
    }
    // UPDATE - Integrar com exercício
    async integrateWithExercise(videoId, exerciseId) {
        try {
            const video = await this.getVideoById(videoId);
            if (!video)
                return false;
            const updatedExercises = [...video.integratedWithExercises];
            if (!updatedExercises.includes(exerciseId)) {
                updatedExercises.push(exerciseId);
            }
            return await this.updateVideo(videoId, {
                integratedWithExercises: updatedExercises,
                status: 'saved'
            });
        }
        catch (error) {
            console.error('Erro ao integrar com exercício:', error);
            return false;
        }
    }
    // UPDATE - Adicionar a protocolo
    async addToProtocol(videoId, protocolId) {
        try {
            const video = await this.getVideoById(videoId);
            if (!video)
                return false;
            const updatedProtocols = [...video.protocols];
            if (!updatedProtocols.includes(protocolId)) {
                updatedProtocols.push(protocolId);
            }
            return await this.updateVideo(videoId, { protocols: updatedProtocols });
        }
        catch (error) {
            console.error('Erro ao adicionar a protocolo:', error);
            return false;
        }
    }
    // DELETE - Deletar vídeo (soft delete)
    async deleteVideo(id, permanent = false) {
        try {
            if (permanent) {
                const videos = await this.getAllVideos();
                const filteredVideos = videos.filter(video => video.id !== id);
                await this.saveVideos(filteredVideos);
            }
            else {
                await this.updateVideo(id, { status: 'deleted' });
            }
            await this.updateStats();
            return true;
        }
        catch (error) {
            console.error('Erro ao deletar vídeo:', error);
            return false;
        }
    }
    // DELETE - Deletar múltiplos vídeos
    async deleteMultipleVideos(ids, permanent = false) {
        try {
            if (permanent) {
                const videos = await this.getAllVideos();
                const filteredVideos = videos.filter(video => !ids.includes(video.id));
                await this.saveVideos(filteredVideos);
            }
            else {
                for (const id of ids) {
                    await this.updateVideo(id, { status: 'deleted' });
                }
            }
            await this.updateStats();
            return true;
        }
        catch (error) {
            console.error('Erro ao deletar múltiplos vídeos:', error);
            return false;
        }
    }
    // RESTORE - Restaurar vídeo deletado
    async restoreVideo(id) {
        try {
            return await this.updateVideo(id, { status: 'saved' });
        }
        catch (error) {
            console.error('Erro ao restaurar vídeo:', error);
            return false;
        }
    }
    // ARCHIVE - Arquivar vídeo
    async archiveVideo(id) {
        try {
            return await this.updateVideo(id, { status: 'archived' });
        }
        catch (error) {
            console.error('Erro ao arquivar vídeo:', error);
            return false;
        }
    }
    // UNARCHIVE - Desarquivar vídeo
    async unarchiveVideo(id) {
        try {
            return await this.updateVideo(id, { status: 'saved' });
        }
        catch (error) {
            console.error('Erro ao desarquivar vídeo:', error);
            return false;
        }
    }
    // BULK UPDATE - Atualizar múltiplos vídeos
    async bulkUpdate(ids, updates) {
        try {
            for (const id of ids) {
                await this.updateVideo(id, updates);
            }
            return true;
        }
        catch (error) {
            console.error('Erro ao atualizar múltiplos vídeos:', error);
            return false;
        }
    }
    // DUPLICATE - Duplicar vídeo
    async duplicateVideo(id, newName) {
        try {
            const originalVideo = await this.getVideoById(id);
            if (!originalVideo)
                return null;
            const duplicatedVideo = {
                ...originalVideo,
                id: this.generateId(),
                exerciseName: newName || `${originalVideo.exerciseName} (Cópia)`,
                generatedAt: new Date().toISOString(),
                savedAt: new Date().toISOString(),
                lastModified: new Date().toISOString(),
                status: 'generated',
                views: 0,
                likes: 0,
                downloads: 0,
                integratedWithExercises: [],
                protocols: [],
                hash: this.generateHash(originalVideo.exerciseName, originalVideo.modality, originalVideo.tool)
            };
            const videos = await this.getAllVideos();
            videos.push(duplicatedVideo);
            await this.saveVideos(videos);
            await this.updateStats();
            return duplicatedVideo;
        }
        catch (error) {
            console.error('Erro ao duplicar vídeo:', error);
            return null;
        }
    }
    // STATS - Obter estatísticas
    async getStats() {
        try {
            const videos = await this.getAllVideos();
            const stats = {
                total: videos.length,
                byModality: {},
                byTool: {},
                byDifficulty: {},
                byStatus: {},
                totalViews: 0,
                totalLikes: 0,
                totalDownloads: 0,
                averageDuration: '0:00',
                mostPopular: [],
                recentlyGenerated: []
            };
            videos.forEach(video => {
                // Por modalidade
                stats.byModality[video.modality] = (stats.byModality[video.modality] || 0) + 1;
                // Por ferramenta
                stats.byTool[video.tool] = (stats.byTool[video.tool] || 0) + 1;
                // Por dificuldade
                stats.byDifficulty[video.difficulty] = (stats.byDifficulty[video.difficulty] || 0) + 1;
                // Por status
                stats.byStatus[video.status] = (stats.byStatus[video.status] || 0) + 1;
                // Totais
                stats.totalViews += video.views;
                stats.totalLikes += video.likes;
                stats.totalDownloads += video.downloads;
            });
            // Vídeos mais populares
            stats.mostPopular = [...videos]
                .sort((a, b) => (b.views + b.likes) - (a.views + a.likes))
                .slice(0, 5);
            // Vídeos gerados recentemente
            stats.recentlyGenerated = [...videos]
                .sort((a, b) => new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime())
                .slice(0, 5);
            // Duração média
            const totalSeconds = videos.reduce((acc, video) => {
                const [minutes, seconds] = video.duration.split(':').map(Number);
                return acc + (minutes * 60) + seconds;
            }, 0);
            if (videos.length > 0) {
                const avgSeconds = Math.round(totalSeconds / videos.length);
                const avgMinutes = Math.floor(avgSeconds / 60);
                const avgSecs = avgSeconds % 60;
                stats.averageDuration = `${avgMinutes}:${avgSecs.toString().padStart(2, '0')}`;
            }
            return stats;
        }
        catch (error) {
            console.error('Erro ao obter estatísticas:', error);
            return {
                total: 0,
                byModality: {},
                byTool: {},
                byDifficulty: {},
                byStatus: {},
                totalViews: 0,
                totalLikes: 0,
                totalDownloads: 0,
                averageDuration: '0:00',
                mostPopular: [],
                recentlyGenerated: []
            };
        }
    }
    // EXPORT - Exportar vídeos
    async exportVideos(format = 'json') {
        try {
            const videos = await this.getAllVideos();
            if (format === 'csv') {
                const headers = Object.keys(videos[0] || {});
                const csvContent = [
                    headers.join(','),
                    ...videos.map(video => headers.map(header => {
                        const value = video[header];
                        return typeof value === 'string' ? `"${value}"` : value;
                    }).join(','))
                ].join('\n');
                return csvContent;
            }
            return JSON.stringify(videos, null, 2);
        }
        catch (error) {
            console.error('Erro ao exportar vídeos:', error);
            return '';
        }
    }
    // IMPORT - Importar vídeos
    async importVideos(data, format = 'json') {
        try {
            let importedVideos;
            if (format === 'csv') {
                const lines = data.split('\n');
                const headers = lines[0].split(',').map(h => h.replace(/"/g, ''));
                importedVideos = lines.slice(1).map(line => {
                    const values = line.split(',');
                    const video = {};
                    headers.forEach((header, index) => {
                        video[header] = values[index]?.replace(/"/g, '') || '';
                    });
                    return video;
                });
            }
            else {
                importedVideos = JSON.parse(data);
            }
            const existingVideos = await this.getAllVideos();
            const allVideos = [...existingVideos, ...importedVideos];
            await this.saveVideos(allVideos);
            await this.updateStats();
            return true;
        }
        catch (error) {
            console.error('Erro ao importar vídeos:', error);
            return false;
        }
    }
    // BACKUP - Criar backup
    async createBackup() {
        try {
            const videos = await this.getAllVideos();
            const backup = {
                videos,
                timestamp: new Date().toISOString(),
                version: '1.0'
            };
            localStorage.setItem(this.BACKUP_KEY, JSON.stringify(backup));
            return true;
        }
        catch (error) {
            console.error('Erro ao criar backup:', error);
            return false;
        }
    }
    // RESTORE - Restaurar backup
    async restoreBackup() {
        try {
            const backupData = localStorage.getItem(this.BACKUP_KEY);
            if (!backupData)
                return false;
            const backup = JSON.parse(backupData);
            await this.saveVideos(backup.videos);
            await this.updateStats();
            return true;
        }
        catch (error) {
            console.error('Erro ao restaurar backup:', error);
            return false;
        }
    }
    // Métodos auxiliares
    generateId() {
        return `video_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    generateHash(exerciseName, modality, tool) {
        const seed = `${exerciseName.toLowerCase()}-${modality.toLowerCase()}-${tool.toLowerCase()}`;
        let hash = 0;
        for (let i = 0; i < seed.length; i++) {
            const char = seed.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return Math.abs(hash);
    }
    async saveVideos(videos) {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(videos));
    }
    async updateStats() {
        const stats = await this.getStats();
        localStorage.setItem(this.STATS_KEY, JSON.stringify(stats));
    }
}
export const personalizedVideoCrudService = new PersonalizedVideoCrudService();
