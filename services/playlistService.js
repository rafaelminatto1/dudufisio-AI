class PlaylistService {
    constructor() {
        this.playlists = new Map();
        this.initializeMockData();
    }
    initializeMockData() {
        const mockPlaylists = [
            {
                id: 'playlist-001',
                name: 'Fundamentos de Jiu-Jitsu',
                description: 'Série completa de técnicas fundamentais de Jiu-Jitsu para iniciantes',
                videoIds: ['video-jiujitsu-001'],
                modality: 'jiujitsu',
                category: 'Fundamentos',
                difficulty: 'beginner',
                createdBy: 'system',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                isPublic: true,
                views: 1520,
                likes: 128,
                duration: 120,
                tags: ['jiujitsu', 'fundamentos', 'iniciante'],
            },
            {
                id: 'playlist-002',
                name: 'WOD CrossFit - Semana 1',
                description: 'Treinos da semana 1 do programa de CrossFit',
                videoIds: ['video-crossfit-001'],
                modality: 'crossfit',
                category: 'WOD',
                difficulty: 'intermediate',
                createdBy: 'system',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                isPublic: true,
                views: 890,
                likes: 76,
                duration: 300,
                tags: ['crossfit', 'wod', 'cardio'],
            },
        ];
        mockPlaylists.forEach(playlist => {
            this.playlists.set(playlist.id, playlist);
        });
    }
    async createPlaylist(data) {
        const newPlaylist = {
            ...data,
            id: `playlist-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            views: 0,
            likes: 0,
            duration: 0, // Will be calculated
        };
        this.playlists.set(newPlaylist.id, newPlaylist);
        return newPlaylist;
    }
    async getPlaylist(id) {
        const playlist = this.playlists.get(id);
        if (playlist) {
            playlist.views++;
            this.playlists.set(id, playlist);
        }
        return playlist || null;
    }
    async listPlaylists(filters) {
        let playlists = Array.from(this.playlists.values());
        if (filters?.modality) {
            playlists = playlists.filter(p => p.modality === filters.modality);
        }
        if (filters?.category) {
            playlists = playlists.filter(p => p.category === filters.category);
        }
        if (filters?.difficulty) {
            playlists = playlists.filter(p => p.difficulty === filters.difficulty);
        }
        if (filters?.createdBy) {
            playlists = playlists.filter(p => p.createdBy === filters.createdBy);
        }
        if (filters?.isPublic !== undefined) {
            playlists = playlists.filter(p => p.isPublic === filters.isPublic);
        }
        if (filters?.searchTerm) {
            const searchLower = filters.searchTerm.toLowerCase();
            playlists = playlists.filter(p => p.name.toLowerCase().includes(searchLower) ||
                p.description.toLowerCase().includes(searchLower) ||
                p.tags.some(tag => tag.toLowerCase().includes(searchLower)));
        }
        return playlists.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    async updatePlaylist(id, updates) {
        const playlist = this.playlists.get(id);
        if (!playlist)
            return null;
        const updatedPlaylist = {
            ...playlist,
            ...updates,
            id: playlist.id,
            updatedAt: new Date().toISOString(),
        };
        this.playlists.set(id, updatedPlaylist);
        return updatedPlaylist;
    }
    async deletePlaylist(id) {
        return this.playlists.delete(id);
    }
    async addVideoToPlaylist(playlistId, videoId) {
        const playlist = this.playlists.get(playlistId);
        if (!playlist)
            return false;
        if (!playlist.videoIds.includes(videoId)) {
            playlist.videoIds.push(videoId);
            playlist.updatedAt = new Date().toISOString();
            this.playlists.set(playlistId, playlist);
        }
        return true;
    }
    async removeVideoFromPlaylist(playlistId, videoId) {
        const playlist = this.playlists.get(playlistId);
        if (!playlist)
            return false;
        playlist.videoIds = playlist.videoIds.filter(id => id !== videoId);
        playlist.updatedAt = new Date().toISOString();
        this.playlists.set(playlistId, playlist);
        return true;
    }
    async reorderPlaylistVideos(playlistId, videoIds) {
        const playlist = this.playlists.get(playlistId);
        if (!playlist)
            return false;
        playlist.videoIds = videoIds;
        playlist.updatedAt = new Date().toISOString();
        this.playlists.set(playlistId, playlist);
        return true;
    }
    async likePlaylist(playlistId) {
        const playlist = this.playlists.get(playlistId);
        if (!playlist)
            return false;
        playlist.likes++;
        this.playlists.set(playlistId, playlist);
        return true;
    }
    async getPopularPlaylists(limit = 10) {
        const playlists = Array.from(this.playlists.values())
            .filter(p => p.isPublic)
            .sort((a, b) => b.views - a.views)
            .slice(0, limit);
        return playlists;
    }
    async getPlaylistsByModality(modality) {
        return this.listPlaylists({ modality, isPublic: true });
    }
}
export const playlistService = new PlaylistService();
export default playlistService;
