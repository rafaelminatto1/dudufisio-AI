// pages/VideoLibraryCompletePage.tsx
// Versão completa com todas as features avançadas
import React, { useState, useCallback, useMemo } from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Film,
  Upload,
  ListVideo,
  Search,
  Filter,
  Grid3x3,
  List,
  Plus,
  Play,
  Eye,
  Heart,
  Share2,
  MessageCircle
} from 'lucide-react';
import PageHeader from '../components/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';
import { Skeleton } from '../components/ui/skeleton';
import VideoPlayer from '../components/video/VideoPlayer';
import VideoUploader from '../components/video/VideoUploader';
import ShareButton from '../components/video/ShareButton';
import CommentSection from '../components/video/CommentSection';
import { videoLibraryService, VideoLibraryItem } from '../services/videoLibraryService';
import { playlistService, Playlist } from '../services/playlistService';
import { SPORT_MODALITIES } from '../services/ai/soraService';
import { useToast } from '../contexts/ToastContext';

// ============================================================================
// HOOKS
// ============================================================================

function useVideoLibraryComplete() {
  const [library, setLibrary] = useState<VideoLibraryItem[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [videos, playlistsData] = await Promise.all([
        videoLibraryService.listVideos({ isPublic: true }),
        playlistService.listPlaylists({ isPublic: true }),
      ]);
      setLibrary(videos);
      setPlaylists(playlistsData);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const likeVideo = useCallback(async (videoId: string) => {
    await videoLibraryService.likeVideo(videoId);
    await loadData();
  }, [loadData]);

  return { library, playlists, isLoading, error, loadData, likeVideo };
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

const VideoCard = React.memo(({
  video,
  onPlay,
  onLike,
}: {
  video: VideoLibraryItem;
  onPlay: (video: VideoLibraryItem) => void;
  onLike: (videoId: string) => void;
}) => {
  const modalityInfo = SPORT_MODALITIES[video.modality as keyof typeof SPORT_MODALITIES];

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow group">
      <div
        className="aspect-video bg-slate-900 relative cursor-pointer"
        onClick={() => onPlay(video)}
      >
        <img src={video.thumbnailUrl} alt={video.exercise} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="bg-white/90 rounded-full p-4">
            <Play className="w-8 h-8 text-black" />
          </div>
        </div>
        <div className="absolute top-2 right-2">
          <Badge variant="secondary">{video.duration}s</Badge>
        </div>
      </div>
      <CardContent className="pt-4">
        <h3 className="font-semibold mb-2">{video.exercise}</h3>
        <div className="flex flex-wrap gap-2 mb-3">
          <Badge variant="outline" className="text-xs">
            {modalityInfo?.name || video.modality}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {video.difficulty}
          </Badge>
        </div>
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center space-x-4">
            <button
              className="flex items-center hover:text-red-500 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                onLike(video.id);
              }}
              aria-label="Curtir vídeo"
            >
              <Heart className="w-4 h-4 mr-1" />
              {video.likes}
            </button>
            <div className="flex items-center">
              <Eye className="w-4 h-4 mr-1" />
              {video.views}
            </div>
            <div className="flex items-center">
              <MessageCircle className="w-4 h-4 mr-1" />
              0
            </div>
          </div>
          <ShareButton
            title={video.exercise}
            url={`/videos/${video.id}`}
            description={video.description}
            hashtags={video.tags}
            variant="ghost"
            size="icon"
          />
        </div>
      </CardContent>
    </Card>
  );
});

VideoCard.displayName = 'VideoCard';

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const VideoLibraryCompletePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('library');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedVideo, setSelectedVideo] = useState<VideoLibraryItem | null>(null);
  const [filters, setFilters] = useState({ searchTerm: '', modality: '', difficulty: '' });
  const { showToast } = useToast();

  // Custom hooks
  const { library, playlists, isLoading, error, loadData, likeVideo } = useVideoLibraryComplete();

  // Load data on mount
  React.useEffect(() => {
    loadData();
  }, [loadData]);

  // Filtered library
  const filteredLibrary = useMemo(() => {
    let filtered = [...library];

    if (filters.modality) {
      filtered = filtered.filter(v => v.modality === filters.modality);
    }

    if (filters.difficulty) {
      filtered = filtered.filter(v => v.difficulty === filters.difficulty);
    }

    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(
        v =>
          v.exercise.toLowerCase().includes(searchLower) ||
          v.description?.toLowerCase().includes(searchLower) ||
          v.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }

    return filtered;
  }, [library, filters]);

  // Handlers
  const handlePlayVideo = useCallback((video: VideoLibraryItem) => {
    setSelectedVideo(video);
  }, []);

  const handleUploadComplete = useCallback(
    async (videoUrl: string, thumbnailUrl: string) => {
      showToast('Vídeo enviado com sucesso!', 'success');
      await loadData();
    },
    [showToast, loadData]
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Biblioteca Completa de Vídeos"
        subtitle="Sistema avançado com player, upload, playlists, comentários e compartilhamento"
      />

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertTitle>Erro</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Vídeos</CardTitle>
            <Film className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{library.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Playlists</CardTitle>
            <ListVideo className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{playlists.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Visualizações</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {library.reduce((sum, v) => sum + v.views, 0)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Curtidas</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {library.reduce((sum, v) => sum + v.likes, 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="library">Biblioteca</TabsTrigger>
          <TabsTrigger value="playlists">Playlists</TabsTrigger>
          <TabsTrigger value="upload">Upload</TabsTrigger>
        </TabsList>

        {/* LIBRARY TAB */}
        <TabsContent value="library" className="mt-6 space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input
                    placeholder="Buscar vídeos..."
                    value={filters.searchTerm}
                    onChange={e => setFilters({ ...filters, searchTerm: e.target.value })}
                  />
                  <select
                    title="Filtrar por modalidade"
                    className="p-2 border rounded-md"
                    value={filters.modality}
                    onChange={e => setFilters({ ...filters, modality: e.target.value })}
                  >
                    <option value="">Todas as modalidades</option>
                    {Object.entries(SPORT_MODALITIES).map(([key, modality]) => (
                      <option key={key} value={key}>
                        {modality.name}
                      </option>
                    ))}
                  </select>
                  <select
                    title="Filtrar por dificuldade"
                    className="p-2 border rounded-md"
                    value={filters.difficulty}
                    onChange={e => setFilters({ ...filters, difficulty: e.target.value })}
                  >
                    <option value="">Todas as dificuldades</option>
                    <option value="beginner">Iniciante</option>
                    <option value="intermediate">Intermediário</option>
                    <option value="advanced">Avançado</option>
                    <option value="expert">Especialista</option>
                  </select>
                </div>
                <div className="flex ml-4 space-x-2">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'outline'}
                    size="icon"
                    onClick={() => setViewMode('grid')}
                    aria-label="Visualização em grid"
                  >
                    <Grid3x3 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'outline'}
                    size="icon"
                    onClick={() => setViewMode('list')}
                    aria-label="Visualização em lista"
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Videos Grid/List */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Skeleton className="h-64" />
              <Skeleton className="h-64" />
              <Skeleton className="h-64" />
            </div>
          ) : (
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
              {filteredLibrary.map(video => (
                <VideoCard key={video.id} video={video} onPlay={handlePlayVideo} onLike={likeVideo} />
              ))}
            </div>
          )}
        </TabsContent>

        {/* PLAYLISTS TAB */}
        <TabsContent value="playlists" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {playlists.map(playlist => (
              <Card key={playlist.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">{playlist.name}</CardTitle>
                  <CardDescription>{playlist.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>{playlist.videoIds.length} vídeos</span>
                      <span>{Math.floor(playlist.duration / 60)}min</span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center">
                          <Eye className="w-4 h-4 mr-1" />
                          {playlist.views}
                        </div>
                        <div className="flex items-center">
                          <Heart className="w-4 h-4 mr-1" />
                          {playlist.likes}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* UPLOAD TAB */}
        <TabsContent value="upload" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Upload de Vídeos</CardTitle>
              <CardDescription>Envie seus próprios vídeos de exercícios e técnicas</CardDescription>
            </CardHeader>
            <CardContent>
              <VideoUploader onUploadComplete={handleUploadComplete} maxSize={500} maxDuration={60} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Video Player Dialog */}
      <Dialog open={!!selectedVideo} onOpenChange={open => !open && setSelectedVideo(null)}>
        <DialogContent className="max-w-6xl max-h-[95vh] p-0">
          {selectedVideo && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
              {/* Video Player */}
              <div className="lg:col-span-2 bg-black">
                <VideoPlayer
                  src={selectedVideo.url}
                  thumbnail={selectedVideo.thumbnailUrl}
                  title={selectedVideo.exercise}
                  duration={selectedVideo.duration}
                  controls
                  className="h-full min-h-[400px]"
                />
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-1 bg-white overflow-y-auto max-h-[95vh]">
                <div className="p-6 space-y-6">
                  {/* Title & Info */}
                  <div>
                    <h2 className="text-xl font-bold mb-2">{selectedVideo.exercise}</h2>
                    <p className="text-sm text-muted-foreground mb-3">{selectedVideo.description}</p>
                    <div className="flex flex-wrap gap-2">
                      <Badge>{SPORT_MODALITIES[selectedVideo.modality as keyof typeof SPORT_MODALITIES]?.name}</Badge>
                      <Badge variant="outline">{selectedVideo.difficulty}</Badge>
                      <Badge variant="outline">{selectedVideo.duration}s</Badge>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-4">
                      <button
                        className="flex items-center hover:text-red-500"
                        onClick={() => likeVideo(selectedVideo.id)}
                        aria-label="Curtir vídeo"
                      >
                        <Heart className="w-4 h-4 mr-1" />
                        {selectedVideo.likes}
                      </button>
                      <div className="flex items-center">
                        <Eye className="w-4 h-4 mr-1" />
                        {selectedVideo.views}
                      </div>
                    </div>
                    <ShareButton
                      title={selectedVideo.exercise}
                      url={`/videos/${selectedVideo.id}`}
                      description={selectedVideo.description}
                      hashtags={selectedVideo.tags}
                    />
                  </div>

                  {/* Comments Section */}
                  <CommentSection videoId={selectedVideo.id} />
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VideoLibraryCompletePage;
