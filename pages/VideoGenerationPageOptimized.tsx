// pages/VideoGenerationPageOptimized.tsx
// Versão otimizada seguindo best practices do Shadcn-UI e React
import React, { useState, useEffect, useCallback, useMemo, useReducer } from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Video,
  Wand2,
  Download,
  Copy,
  Sparkles,
  Play,
  Film,
  Zap,
  CheckCircle,
  Loader2,
  Eye,
  Heart,
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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';
import { Skeleton } from '../components/ui/skeleton';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '../components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { soraService, SPORT_MODALITIES, GeneratedVideo } from '../services/ai/soraService';
import { videoLibraryService, VideoLibraryItem } from '../services/videoLibraryService';
import { useToast } from '../contexts/ToastContext';

// ============================================================================
// SCHEMAS & TYPES
// ============================================================================

const videoGenerationSchema = z.object({
  type: z.enum(['exercise', 'technique', 'series', 'demonstration']),
  name: z.string().min(3, "Mínimo 3 caracteres").max(100),
  modality: z.string(),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced', 'expert']),
  technique: z.string().optional(),
  position: z.string().optional(),
  duration: z.number().min(5).max(60).default(10),
  aspectRatio: z.enum(['16:9', '9:16', '1:1', '21:9']).default('16:9'),
  resolution: z.enum(['720p', '1080p', '4k']).default('1080p'),
});

type VideoFormValues = z.infer<typeof videoGenerationSchema>;

// ============================================================================
// CUSTOM HOOKS
// ============================================================================

function useVideoGeneration() {
  const [video, setVideo] = useState<GeneratedVideo | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const generate = useCallback(async (values: VideoFormValues) => {
    setIsGenerating(true);
    setError(null);
    try {
      const result = await soraService.generateVideoObject(
        values.type,
        {
          name: values.name,
          modality: values.modality,
          difficulty: values.difficulty,
          technique: values.technique,
          position: values.position,
          duration: values.duration,
        },
        {
          duration: values.duration,
          aspectRatio: values.aspectRatio,
          resolution: values.resolution,
        }
      );
      setVideo(result);
      return result;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const reset = useCallback(() => {
    setVideo(null);
    setError(null);
  }, []);

  return { video, isGenerating, error, generate, reset };
}

function useVideoLibrary() {
  const [library, setLibrary] = useState<VideoLibraryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadLibrary = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const videos = await videoLibraryService.listVideos({ isPublic: true });
      setLibrary(videos);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLibrary();
  }, [loadLibrary]);

  const likeVideo = useCallback(async (videoId: string) => {
    await videoLibraryService.likeVideo(videoId);
    await loadLibrary();
  }, [loadLibrary]);

  return { library, isLoading, error, loadLibrary, likeVideo };
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

const VideoGenerationForm = React.memo(({ 
  onGenerate, 
  isGenerating 
}: { 
  onGenerate: (values: VideoFormValues) => Promise<void>; 
  isGenerating: boolean 
}) => {
  const form = useForm<VideoFormValues>({
    resolver: zodResolver(videoGenerationSchema),
    defaultValues: {
      type: 'exercise',
      name: 'Agachamento Búlgaro',
      modality: 'funcional',
      difficulty: 'intermediate',
      duration: 10,
      aspectRatio: '16:9',
      resolution: '1080p',
    },
  });

  const watchType = form.watch('type');
  const watchModality = form.watch('modality');

  const modalityInfo = useMemo(
    () => SPORT_MODALITIES[watchModality as keyof typeof SPORT_MODALITIES],
    [watchModality]
  );

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onGenerate)} className="space-y-4">
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo de Vídeo</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="exercise">Exercício Individual</SelectItem>
                  <SelectItem value="technique">Técnica/Golpe</SelectItem>
                  <SelectItem value="series">Série de Exercícios</SelectItem>
                  <SelectItem value="demonstration">Demonstração Personalizada</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="modality"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Modalidade Esportiva</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a modalidade" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Object.entries(SPORT_MODALITIES).map(([key, modality]) => (
                    <SelectItem key={key} value={key}>
                      {modality.name} ({modality.category})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                Ambiente: {modalityInfo?.environment}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome do {watchType === 'technique' ? 'Técnica' : 'Exercício'}</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Agachamento Búlgaro" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {watchType === 'technique' && (
          <FormField
            control={form.control}
            name="technique"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Técnica/Golpe</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: Passagem de Guarda" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="difficulty"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Dificuldade</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="beginner">Iniciante</SelectItem>
                  <SelectItem value="intermediate">Intermediário</SelectItem>
                  <SelectItem value="advanced">Avançado</SelectItem>
                  <SelectItem value="expert">Especialista</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="duration"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Duração (s)</FormLabel>
                <Select onValueChange={(v) => field.onChange(parseInt(v))} defaultValue={field.value.toString()}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="5">5 segundos</SelectItem>
                    <SelectItem value="10">10 segundos</SelectItem>
                    <SelectItem value="20">20 segundos</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="aspectRatio"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Proporção</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="16:9">16:9 (Paisagem)</SelectItem>
                    <SelectItem value="9:16">9:16 (Vertical)</SelectItem>
                    <SelectItem value="1:1">1:1 (Quadrado)</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" disabled={isGenerating} className="w-full bg-purple-600 hover:bg-purple-700">
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
      </form>
    </Form>
  );
});

VideoGenerationForm.displayName = 'VideoGenerationForm';

const VideoPreview = React.memo(({ 
  video, 
  onSave, 
  onCopyPrompt, 
  onDownloadPrompt 
}: { 
  video: GeneratedVideo | null;
  onSave: () => void;
  onCopyPrompt: () => void;
  onDownloadPrompt: () => void;
}) => {
  if (!video) {
    return (
      <div className="aspect-video bg-slate-100 rounded-lg flex items-center justify-center text-slate-400">
        <div className="text-center">
          <Film className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Gere um vídeo para ver o preview</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="aspect-video bg-slate-900 rounded-lg overflow-hidden relative group">
        <img src={video.url} alt={video.exercise} className="w-full h-full object-cover" />
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button size="lg" variant="secondary" className="rounded-full">
            <Play className="w-6 h-6" />
          </Button>
        </div>
      </div>
      <div className="flex items-center space-x-2 text-sm">
        <Badge variant="outline">{video.modality}</Badge>
        <span>{video.duration}s</span>
        <span>{video.aspectRatio}</span>
        <span>{video.resolution}</span>
      </div>
      <div className="flex items-center text-sm text-green-600">
        <CheckCircle className="w-4 h-4 mr-1" />
        Vídeo gerado com sucesso
      </div>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={onCopyPrompt}>
          <Copy className="w-4 h-4 mr-1" />
          Copiar
        </Button>
        <Button variant="outline" size="sm" onClick={onDownloadPrompt}>
          <Download className="w-4 h-4 mr-1" />
          Exportar
        </Button>
        <Button size="sm" onClick={onSave}>
          <Plus className="w-4 h-4 mr-1" />
          Salvar
        </Button>
      </div>
    </div>
  );
});

VideoPreview.displayName = 'VideoPreview';

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const VideoGenerationPageOptimized: React.FC = () => {
  const [activeTab, setActiveTab] = useState('generate');
  const { showToast } = useToast();
  
  // Custom hooks
  const { video, isGenerating, error: genError, generate, reset } = useVideoGeneration();
  const { library, isLoading: libLoading, error: libError, loadLibrary, likeVideo } = useVideoLibrary();

  // Handlers
  const handleGenerate = useCallback(async (values: VideoFormValues) => {
    try {
      await generate(values);
      showToast('Vídeo gerado com sucesso!', 'success');
    } catch (err) {
      showToast('Erro ao gerar vídeo', 'error');
    }
  }, [generate, showToast]);

  const handleSaveToLibrary = useCallback(async () => {
    if (!video) return;
    try {
      await videoLibraryService.createVideo({
        ...video,
        linkedExercises: [],
        category: 'Exercícios',
        difficulty: 'intermediate',
        isPublic: true,
        createdBy: 'current-user',
      });
      showToast('Vídeo salvo na biblioteca!', 'success');
      await loadLibrary();
    } catch (err) {
      showToast('Erro ao salvar vídeo', 'error');
    }
  }, [video, loadLibrary, showToast]);

  const handleCopyPrompt = useCallback(() => {
    if (video) {
      navigator.clipboard.writeText(video.optimizedPrompt);
      showToast('Prompt copiado!', 'success');
    }
  }, [video, showToast]);

  const handleDownloadPrompt = useCallback(() => {
    if (!video) return;
    const exportData = soraService.exportPrompt(video);
    const blob = new Blob([exportData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `prompt-sora-2-${video.id}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Prompt exportado!', 'success');
  }, [video, showToast]);

  return (
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
              <p className="text-sm text-purple-800">
                Crie vídeos profissionais de exercícios e técnicas esportivas usando <strong>OpenAI Sora 2</strong>.
                Sistema integrado com validação robusta e melhores práticas do Shadcn-UI.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Alerts */}
      {genError && (
        <Alert variant="destructive">
          <AlertTitle>Erro na Geração</AlertTitle>
          <AlertDescription>{genError.message}</AlertDescription>
        </Alert>
      )}

      {libError && (
        <Alert variant="destructive">
          <AlertTitle>Erro ao Carregar Biblioteca</AlertTitle>
          <AlertDescription>{libError.message}</AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="generate">
            <Wand2 className="w-4 h-4 mr-2" />
            Gerar Vídeo
          </TabsTrigger>
          <TabsTrigger value="library">
            <Film className="w-4 h-4 mr-2" />
            Biblioteca
          </TabsTrigger>
        </TabsList>

        <TabsContent value="generate" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Configurar Geração</CardTitle>
                  <CardDescription>Preencha os campos para gerar seu vídeo</CardDescription>
                </CardHeader>
                <CardContent>
                  <VideoGenerationForm onGenerate={handleGenerate} isGenerating={isGenerating} />
                </CardContent>
              </Card>

              {video && (
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Sparkles className="w-5 h-5 mr-2 text-yellow-500" />
                      Prompt Otimizado
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-slate-50 p-4 rounded-lg max-h-64 overflow-y-auto">
                      <pre className="text-sm text-slate-700 whitespace-pre-wrap">{video.optimizedPrompt}</pre>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Preview do Vídeo</CardTitle>
                </CardHeader>
                <CardContent>
                  <VideoPreview
                    video={video}
                    onSave={handleSaveToLibrary}
                    onCopyPrompt={handleCopyPrompt}
                    onDownloadPrompt={handleDownloadPrompt}
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="library" className="mt-6">
          {libLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-12 w-full" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Skeleton className="h-64 w-full" />
                <Skeleton className="h-64 w-full" />
                <Skeleton className="h-64 w-full" />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {library.map(libraryVideo => (
                <Card key={libraryVideo.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="aspect-video bg-slate-900 relative group">
                    <img src={libraryVideo.thumbnailUrl} alt={libraryVideo.exercise} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Button size="lg" variant="secondary" className="rounded-full">
                        <Play className="w-6 h-6" />
                      </Button>
                    </div>
                  </div>
                  <CardContent className="pt-4">
                    <h3 className="font-semibold">{libraryVideo.exercise}</h3>
                    <div className="flex items-center space-x-3 mt-2 text-sm text-muted-foreground">
                      <button 
                        className="flex items-center hover:text-red-500" 
                        onClick={() => likeVideo(libraryVideo.id)}
                        aria-label="Curtir vídeo"
                      >
                        <Heart className="w-4 h-4 mr-1" />
                        {libraryVideo.likes}
                      </button>
                      <div className="flex items-center">
                        <Eye className="w-4 h-4 mr-1" />
                        {libraryVideo.views}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default VideoGenerationPageOptimized;
