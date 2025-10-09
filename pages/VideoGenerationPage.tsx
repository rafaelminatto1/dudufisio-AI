// pages/VideoGenerationPage.tsx
import React, { useState, useEffect } from 'react';
import {
  Video,
  Wand2,
  Download,
  Copy,
  Sparkles,
  Play,
  Pause,
  Film,
  Zap,
  CheckCircle,
  Loader2,
  Link as LinkIcon,
  Eye,
  Heart,
  Share2,
  Filter,
  Grid3x3,
  List,
  Plus
} from 'lucide-react';
import PageHeader from '../components/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { soraService, SPORT_MODALITIES, GeneratedVideo, VideoGenerationOptions } from '../services/ai/soraService';
import { videoLibraryService, VideoLibraryItem } from '../services/videoLibraryService';
import { useToast } from '../contexts/ToastContext';
import DirectionProvider from '../components/providers/DirectionProvider';

const VideoGenerationPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('generate');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedVideo, setGeneratedVideo] = useState<GeneratedVideo | null>(null);
  const [optimizedPrompt, setOptimizedPrompt] = useState('');
  const [library, setLibrary] = useState<VideoLibraryItem[]>([]);
  const [filteredLibrary, setFilteredLibrary] = useState<VideoLibraryItem[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const { showToast } = useToast();

  // Generation state
  const [genParams, setGenParams] = useState({
    type: 'exercise' as 'exercise' | 'technique' | 'series' | 'demonstration',
    name: 'Agachamento Búlgaro',
    modality: 'funcional',
    difficulty: 'intermediate' as 'beginner' | 'intermediate' | 'advanced' | 'expert',
    duration: 10,
    technique: '',
    position: '',
    demonstration: 'pair' as 'solo' | 'pair',
    exercises: [] as string[],
    customPrompt: '',
  });

  // Video options
  const [videoOptions, setVideoOptions] = useState<Partial<VideoGenerationOptions>>({
    duration: 10,
    aspectRatio: '16:9',
    resolution: '1080p',
    fps: 30,
    style: 'realistic',
    cameraMovement: 'tracking',
    lighting: 'natural',
  });

  // Filters
  const [filters, setFilters] = useState({
    modality: '',
    category: '',
    difficulty: '',
    searchTerm: '',
    sortBy: 'recent' as 'recent' | 'popular' | 'liked' | 'downloaded',
  });

  // Load library
  useEffect(() => {
    loadLibrary();
  }, []);

  // Apply filters
  useEffect(() => {
    applyFilters();
  }, [filters, library]);

  const loadLibrary = async () => {
    try {
      const videos = await videoLibraryService.listVideos({ isPublic: true });
      setLibrary(videos);
      setFilteredLibrary(videos);
    } catch (error) {
      console.error('Erro ao carregar biblioteca:', error);
    }
  };

  const applyFilters = async () => {
    try {
      const videos = await videoLibraryService.listVideos({
        modality: filters.modality || undefined,
        difficulty: filters.difficulty || undefined,
        searchTerm: filters.searchTerm || undefined,
        sortBy: filters.sortBy,
      });
      setFilteredLibrary(videos);
    } catch (error) {
      console.error('Erro ao filtrar:', error);
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      let video: GeneratedVideo;

      switch (genParams.type) {
        case 'exercise':
          video = await soraService.generateVideoObject(
            'exercise',
            {
              name: genParams.name,
              modality: genParams.modality,
              difficulty: genParams.difficulty,
              duration: videoOptions.duration,
            },
            videoOptions
          );
          break;

        case 'technique':
          video = await soraService.generateVideoObject(
            'technique',
            {
              technique: genParams.technique,
              modality: genParams.modality,
              position: genParams.position,
              demonstration: genParams.demonstration,
            },
            videoOptions
          );
          break;

        case 'series':
          video = await soraService.generateVideoObject(
            'series',
            {
              exercises: genParams.exercises,
              modality: genParams.modality,
              duration: videoOptions.duration,
            },
            videoOptions
          );
          break;

        case 'demonstration':
          video = await soraService.generateVideoObject(
            'demonstration',
            {
              prompt: genParams.customPrompt,
              modality: genParams.modality,
              name: genParams.name,
            },
            videoOptions
          );
          break;

        default:
          throw new Error('Tipo de vídeo inválido');
      }

      setGeneratedVideo(video);
      setOptimizedPrompt(video.optimizedPrompt);
      showToast('Vídeo gerado com sucesso!', 'success');
    } catch (error) {
      showToast('Erro ao gerar vídeo', 'error');
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveToLibrary = async () => {
    if (!generatedVideo) return;

    try {
      await videoLibraryService.createVideo({
        ...generatedVideo,
        linkedExercises: [],
        category: genParams.type === 'technique' ? 'Técnicas' : 'Exercícios',
        difficulty: genParams.difficulty,
        isPublic: true,
        createdBy: 'current-user',
        description: `Vídeo de ${genParams.name || genParams.technique}`,
      });

      showToast('Vídeo salvo na biblioteca!', 'success');
      loadLibrary();
    } catch (error) {
      showToast('Erro ao salvar vídeo', 'error');
    }
  };

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(optimizedPrompt);
    showToast('Prompt copiado!', 'success');
  };

  const handleDownloadPrompt = () => {
    if (!generatedVideo) return;

    const exportData = soraService.exportPrompt(generatedVideo);
    const blob = new Blob([exportData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `prompt-sora-2-${generatedVideo.id}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Prompt exportado!', 'success');
  };

  const handleLike = async (videoId: string) => {
    await videoLibraryService.likeVideo(videoId);
    loadLibrary();
  };

  const getModalityIcon = (modality: string) => {
    const modalityInfo = SPORT_MODALITIES[modality as keyof typeof SPORT_MODALITIES];
    return modalityInfo ? '🥋' : '🏃';
  };

  return (
    <DirectionProvider>
      <div className="space-y-6">
        <PageHeader
          title="Geração de Vídeos - OpenAI Sora 2"
          subtitle="Sistema completo de geração e gerenciamento de vídeos para exercícios e modalidades esportivas"
        />

        {/* Info Card */}
        <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
          <CardContent className="pt-6">
            <div className="flex items-start space-x-3">
              <Sparkles className="w-6 h-6 text-purple-600 mt-1" />
              <div>
                <h3 className="font-semibold text-purple-900 mb-2">Geração de Vídeos com IA</h3>
                <p className="text-sm text-purple-800 mb-3">
                  Crie vídeos profissionais de exercícios e técnicas esportivas usando <strong>OpenAI Sora 2</strong>.
                  Sistema integrado com biblioteca de exercícios e modalidades esportivas.
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-purple-800">
                  <div>✅ 8 modalidades esportivas</div>
                  <div>✅ Jiu-Jitsu, Muay Thai, CrossFit</div>
                  <div>✅ Yoga, Pilates, Natação</div>
                  <div>✅ CRUD completo de vídeos</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="generate">
              <Wand2 className="w-4 h-4 mr-2" />
              Gerar Vídeo
            </TabsTrigger>
            <TabsTrigger value="library">
              <Film className="w-4 h-4 mr-2" />
              Biblioteca
            </TabsTrigger>
            <TabsTrigger value="modalities">
              <Grid3x3 className="w-4 h-4 mr-2" />
              Modalidades
            </TabsTrigger>
          </TabsList>

          {/* GENERATE TAB */}
          <TabsContent value="generate" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Generation Options */}
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Wand2 className="w-5 h-5 mr-2" />
                      Configurar Geração
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Type Selection */}
                    <div>
                      <Label htmlFor="video-type">Tipo de Vídeo</Label>
                      <select
                        id="video-type"
                        title="Selecione o tipo de vídeo"
                        className="w-full mt-1 p-2 border rounded-md"
                        value={genParams.type}
                        onChange={e => setGenParams({ ...genParams, type: e.target.value as any })}
                      >
                        <option value="exercise">Exercício Individual</option>
                        <option value="technique">Técnica/Golpe</option>
                        <option value="series">Série de Exercícios</option>
                        <option value="demonstration">Demonstração Personalizada</option>
                      </select>
                    </div>

                    {/* Modality */}
                    <div>
                      <Label htmlFor="modality">Modalidade Esportiva</Label>
                      <select
                        id="modality"
                        title="Selecione a modalidade"
                        className="w-full mt-1 p-2 border rounded-md"
                        value={genParams.modality}
                        onChange={e => setGenParams({ ...genParams, modality: e.target.value })}
                      >
                        {Object.entries(SPORT_MODALITIES).map(([key, modality]) => (
                          <option key={key} value={key}>
                            {modality.name} ({modality.category})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Dynamic Fields Based on Type */}
                    {genParams.type === 'exercise' && (
                      <>
                        <div>
                          <Label htmlFor="exercise-name">Nome do Exercício</Label>
                          <Input
                            id="exercise-name"
                            value={genParams.name}
                            onChange={e => setGenParams({ ...genParams, name: e.target.value })}
                            placeholder="Ex: Agachamento Búlgaro"
                          />
                        </div>
                        <div>
                          <Label htmlFor="difficulty">Dificuldade</Label>
                          <select
                            id="difficulty"
                            title="Selecione a dificuldade"
                            className="w-full mt-1 p-2 border rounded-md"
                            value={genParams.difficulty}
                            onChange={e => setGenParams({ ...genParams, difficulty: e.target.value as any })}
                          >
                            <option value="beginner">Iniciante</option>
                            <option value="intermediate">Intermediário</option>
                            <option value="advanced">Avançado</option>
                            <option value="expert">Especialista</option>
                          </select>
                        </div>
                      </>
                    )}

                    {genParams.type === 'technique' && (
                      <>
                        <div>
                          <Label htmlFor="technique">Técnica/Golpe</Label>
                          <Input
                            id="technique"
                            value={genParams.technique}
                            onChange={e => setGenParams({ ...genParams, technique: e.target.value })}
                            placeholder="Ex: Passagem de Guarda"
                          />
                        </div>
                        <div>
                          <Label htmlFor="position">Posição Inicial</Label>
                          <Input
                            id="position"
                            value={genParams.position}
                            onChange={e => setGenParams({ ...genParams, position: e.target.value })}
                            placeholder="Ex: Guarda Fechada"
                          />
                        </div>
                      </>
                    )}

                    {/* Video Options */}
                    <div className="border-t pt-4">
                      <h4 className="font-semibold mb-3">Opções de Vídeo</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="duration">Duração (s)</Label>
                          <select
                            id="duration"
                            title="Duração do vídeo"
                            className="w-full mt-1 p-2 border rounded-md"
                            value={videoOptions.duration}
                            onChange={e => setVideoOptions({ ...videoOptions, duration: parseInt(e.target.value) as any })}
                          >
                            <option value={5}>5 segundos</option>
                            <option value={10}>10 segundos</option>
                            <option value={20}>20 segundos</option>
                          </select>
                        </div>
                        <div>
                          <Label htmlFor="aspect-ratio">Proporção</Label>
                          <select
                            id="aspect-ratio"
                            title="Proporção do vídeo"
                            className="w-full mt-1 p-2 border rounded-md"
                            value={videoOptions.aspectRatio}
                            onChange={e => setVideoOptions({ ...videoOptions, aspectRatio: e.target.value as any })}
                          >
                            <option value="16:9">16:9 (Paisagem)</option>
                            <option value="9:16">9:16 (Vertical)</option>
                            <option value="1:1">1:1 (Quadrado)</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <Button
                      onClick={handleGenerate}
                      disabled={isGenerating}
                      className="w-full bg-purple-600 hover:bg-purple-700"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Gerando Vídeo...
                        </>
                      ) : (
                        <>
                          <Film className="w-4 h-4 mr-2" />
                          Gerar Vídeo com Sora 2
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>

                {/* Prompt Display */}
                {optimizedPrompt && (
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center">
                          <Sparkles className="w-5 h-5 mr-2 text-yellow-500" />
                          Prompt Otimizado
                        </CardTitle>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm" onClick={handleCopyPrompt}>
                            <Copy className="w-4 h-4 mr-1" />
                            Copiar
                          </Button>
                          <Button variant="outline" size="sm" onClick={handleDownloadPrompt}>
                            <Download className="w-4 h-4 mr-1" />
                            Exportar
                          </Button>
                          <Button size="sm" onClick={handleSaveToLibrary}>
                            <Plus className="w-4 h-4 mr-1" />
                            Salvar na Biblioteca
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-slate-50 p-4 rounded-lg max-h-64 overflow-y-auto">
                        <pre className="text-sm text-slate-700 whitespace-pre-wrap">{optimizedPrompt}</pre>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Right Column - Preview */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Video className="w-5 h-5 mr-2" />
                      Preview do Vídeo
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {generatedVideo ? (
                      <div className="space-y-3">
                        <div className="aspect-video bg-slate-900 rounded-lg overflow-hidden relative group">
                          <img src={generatedVideo.url} alt={generatedVideo.exercise} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button size="lg" variant="secondary" className="rounded-full">
                              <Play className="w-6 h-6" />
                            </Button>
                          </div>
                        </div>
                        <div className="text-sm space-y-1">
                          <div className="font-semibold">{generatedVideo.exercise}</div>
                          <div className="flex items-center space-x-2 text-muted-foreground">
                            <Badge variant="outline">{generatedVideo.modality}</Badge>
                            <span>{generatedVideo.duration}s</span>
                            <span>{generatedVideo.aspectRatio}</span>
                            <span>{generatedVideo.resolution}</span>
                          </div>
                        </div>
                        <div className="flex items-center text-sm text-green-600">
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Vídeo gerado com sucesso
                        </div>
                      </div>
                    ) : (
                      <div className="aspect-video bg-slate-100 rounded-lg flex items-center justify-center text-slate-400">
                        <div className="text-center">
                          <Film className="w-12 h-12 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">Gere um vídeo para ver o preview</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Selected Modality Info */}
                <Card className="bg-gradient-to-br from-purple-50 to-blue-50">
                  <CardHeader>
                    <CardTitle className="text-sm">
                      {SPORT_MODALITIES[genParams.modality as keyof typeof SPORT_MODALITIES]?.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-xs space-y-2">
                    <div>
                      <strong>Categoria:</strong>{' '}
                      {SPORT_MODALITIES[genParams.modality as keyof typeof SPORT_MODALITIES]?.category}
                    </div>
                    <div>
                      <strong>Equipamentos:</strong>{' '}
                      {SPORT_MODALITIES[genParams.modality as keyof typeof SPORT_MODALITIES]?.equipment.join(', ')}
                    </div>
                    <div>
                      <strong>Ambiente:</strong>{' '}
                      {SPORT_MODALITIES[genParams.modality as keyof typeof SPORT_MODALITIES]?.environment}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* LIBRARY TAB */}
          <TabsContent value="library" className="mt-6">
            <div className="space-y-6">
              {/* Filters */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <Filter className="w-4 h-4" />
                      <h3 className="font-semibold">Filtros</h3>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant={viewMode === 'grid' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setViewMode('grid')}
                      >
                        <Grid3x3 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant={viewMode === 'list' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setViewMode('list')}
                      >
                        <List className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <Label htmlFor="filter-modality">Modalidade</Label>
                      <select
                        id="filter-modality"
                        title="Filtrar por modalidade"
                        className="w-full mt-1 p-2 border rounded-md text-sm"
                        value={filters.modality}
                        onChange={e => setFilters({ ...filters, modality: e.target.value })}
                      >
                        <option value="">Todas</option>
                        {Object.entries(SPORT_MODALITIES).map(([key, modality]) => (
                          <option key={key} value={key}>
                            {modality.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="filter-difficulty">Dificuldade</Label>
                      <select
                        id="filter-difficulty"
                        title="Filtrar por dificuldade"
                        className="w-full mt-1 p-2 border rounded-md text-sm"
                        value={filters.difficulty}
                        onChange={e => setFilters({ ...filters, difficulty: e.target.value })}
                      >
                        <option value="">Todas</option>
                        <option value="beginner">Iniciante</option>
                        <option value="intermediate">Intermediário</option>
                        <option value="advanced">Avançado</option>
                        <option value="expert">Especialista</option>
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="filter-sort">Ordenar Por</Label>
                      <select
                        id="filter-sort"
                        title="Ordenar vídeos"
                        className="w-full mt-1 p-2 border rounded-md text-sm"
                        value={filters.sortBy}
                        onChange={e => setFilters({ ...filters, sortBy: e.target.value as any })}
                      >
                        <option value="recent">Mais Recentes</option>
                        <option value="popular">Mais Populares</option>
                        <option value="liked">Mais Curtidos</option>
                        <option value="downloaded">Mais Baixados</option>
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="filter-search">Buscar</Label>
                      <Input
                        id="filter-search"
                        type="text"
                        placeholder="Buscar..."
                        className="mt-1"
                        value={filters.searchTerm}
                        onChange={e => setFilters({ ...filters, searchTerm: e.target.value })}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Video Grid/List */}
              <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
                {filteredLibrary.map(video => (
                  <Card key={video.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="aspect-video bg-slate-900 relative group">
                      <img src={video.thumbnailUrl} alt={video.exercise} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Button size="lg" variant="secondary" className="rounded-full">
                          <Play className="w-6 h-6" />
                        </Button>
                      </div>
                      <div className="absolute top-2 right-2">
                        <Badge variant="secondary">{video.duration}s</Badge>
                      </div>
                    </div>
                    <CardContent className="pt-4">
                      <div className="space-y-2">
                        <h3 className="font-semibold">{video.exercise}</h3>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="outline" className="text-xs">
                            {getModalityIcon(video.modality)} {SPORT_MODALITIES[video.modality as keyof typeof SPORT_MODALITIES]?.name}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {video.difficulty}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <div className="flex items-center space-x-3">
                            <button className="flex items-center hover:text-red-500" onClick={() => handleLike(video.id)}>
                              <Heart className="w-4 h-4 mr-1" />
                              {video.likes}
                            </button>
                            <div className="flex items-center">
                              <Eye className="w-4 h-4 mr-1" />
                              {video.views}
                            </div>
                            <div className="flex items-center">
                              <Download className="w-4 h-4 mr-1" />
                              {video.downloadCount}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* MODALITIES TAB */}
          <TabsContent value="modalities" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {Object.entries(SPORT_MODALITIES).map(([key, modality]) => (
                <Card key={key} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center justify-between">
                      <span>{modality.name}</span>
                      <Badge variant="secondary">{modality.category}</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm space-y-2">
                    <div>
                      <strong>Equipamentos:</strong>
                      <div className="text-xs text-muted-foreground">{modality.equipment.join(', ')}</div>
                    </div>
                    <div>
                      <strong>Cores:</strong>
                      <div className="flex gap-1 mt-1">
                        {modality.colors.map(color => (
                          <div key={color} className="w-4 h-4 rounded-full border" style={{ backgroundColor: color }} />
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DirectionProvider>
  );
};

export default VideoGenerationPage;
