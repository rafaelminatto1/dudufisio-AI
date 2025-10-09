// pages/SoraDirectGenerationPage.tsx
// Geração DIRETA de vídeos com Sora 2 dentro do sistema
import React, { useState, useEffect, useCallback } from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Film,
  Wand2,
  Sparkles,
  Loader2,
  CheckCircle,
  AlertCircle,
  Download,
  Eye,
  RefreshCw,
  Zap,
  Clock,
  Play
} from 'lucide-react';
import PageHeader from '../components/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';
import { Progress } from '../components/ui/progress';
import { Skeleton } from '../components/ui/skeleton';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import VideoPlayer from '../components/video/VideoPlayer';
import { soraApiService, SoraVideoResponse } from '../services/ai/soraApiService';
import { SPORT_MODALITIES } from '../services/ai/soraService';
import { videoLibraryService } from '../services/videoLibraryService';
import { useToast } from '../contexts/ToastContext';

// Schema de validação
const soraGenerationSchema = z.object({
  prompt: z.string().min(10, "Prompt deve ter no mínimo 10 caracteres").max(500, "Máximo 500 caracteres"),
  modality: z.string().optional(),
  exercise: z.string().optional(),
  duration: z.enum(['5', '10', '20']).default('10'),
  aspectRatio: z.enum(['16:9', '9:16', '1:1']).default('16:9'),
  quality: z.enum(['standard', 'hd', '4k']).default('hd'),
  autoOptimize: z.boolean().default(true),
});

type SoraFormValues = z.infer<typeof soraGenerationSchema>;

const SoraDirectGenerationPage: React.FC = () => {
  const [generatedVideos, setGeneratedVideos] = useState<SoraVideoResponse[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<SoraVideoResponse | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [queueStats, setQueueStats] = useState<any>(null);
  const { showToast } = useToast();

  const form = useForm<SoraFormValues>({
    resolver: zodResolver(soraGenerationSchema),
    defaultValues: {
      prompt: '',
      modality: 'jiujitsu',
      exercise: '',
      duration: '10',
      aspectRatio: '16:9',
      quality: 'hd',
      autoOptimize: true,
    },
  });

  const watchModality = form.watch('modality');
  const watchAutoOptimize = form.watch('autoOptimize');

  // Load queue on mount
  useEffect(() => {
    loadQueue();
    const interval = setInterval(() => {
      updateQueueStatus();
    }, 2000); // Atualizar status a cada 2s

    return () => clearInterval(interval);
  }, []);

  const loadQueue = useCallback(async () => {
    const videos = await soraApiService.listQueuedVideos();
    setGeneratedVideos(videos);
    setQueueStats(soraApiService.getQueueStats());
  }, []);

  const updateQueueStatus = useCallback(async () => {
    const videos = await soraApiService.listQueuedVideos();
    setGeneratedVideos(videos);
    setQueueStats(soraApiService.getQueueStats());
  }, []);

  const onSubmit = useCallback(
    async (values: SoraFormValues) => {
      setIsGenerating(true);
      try {
        let finalPrompt = values.prompt;

        // Otimizar prompt se solicitado
        if (values.autoOptimize) {
          finalPrompt = await soraApiService.optimizePromptForSora(values.prompt, {
            modality: values.modality,
            exercise: values.exercise,
            duration: parseInt(values.duration),
          });
          showToast('Prompt otimizado!', 'success');
        }

        // Gerar vídeo
        const video = await soraApiService.generateVideoWithOptimization(values.prompt, {
          modality: values.modality,
          exercise: values.exercise,
          duration: parseInt(values.duration) as 5 | 10 | 20,
          aspectRatio: values.aspectRatio,
          quality: values.quality,
        });

        showToast('Vídeo adicionado à fila de processamento!', 'success');
        form.reset();
        await loadQueue();
      } catch (error) {
        showToast('Erro ao gerar vídeo', 'error');
      } finally {
        setIsGenerating(false);
      }
    },
    [form, loadQueue, showToast]
  );

  const handleSaveToLibrary = useCallback(
    async (video: SoraVideoResponse) => {
      if (!video.videoUrl) {
        showToast('Aguarde o vídeo ser gerado', 'warning');
        return;
      }

      try {
        await videoLibraryService.createVideo({
          url: video.videoUrl,
          thumbnailUrl: video.thumbnailUrl!,
          prompt: video.prompt,
          optimizedPrompt: video.prompt,
          duration: video.duration,
          aspectRatio: video.aspectRatio,
          resolution: '1080p',
          modality: 'generated',
          exercise: 'Sora 2 Generated',
          tags: ['sora2', 'ai-generated'],
          status: 'ready',
          metadata: { fps: 30, size: 0, format: 'mp4' },
          linkedExercises: [],
          category: 'AI Generated',
          difficulty: 'intermediate',
          isPublic: true,
          createdBy: 'sora-2-api',
        });

        showToast('Vídeo salvo na biblioteca!', 'success');
      } catch (error) {
        showToast('Erro ao salvar vídeo', 'error');
      }
    },
    [showToast]
  );

  const getStatusBadge = (status: SoraVideoResponse['status']) => {
    switch (status) {
      case 'queued':
        return <Badge variant="outline">🕐 Na fila</Badge>;
      case 'processing':
        return <Badge className="bg-blue-500">⚙️ Processando</Badge>;
      case 'completed':
        return <Badge className="bg-green-500">✅ Completo</Badge>;
      case 'failed':
        return <Badge variant="destructive">❌ Erro</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Geração Direta com Sora 2"
        subtitle="Gere vídeos profissionais DIRETO no sistema usando OpenAI Sora 2"
      />

      {/* Info Card */}
      <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
        <CardContent className="pt-6">
          <div className="flex items-start space-x-3">
            <Sparkles className="w-6 h-6 text-purple-600 mt-1" />
            <div>
              <h3 className="font-semibold text-purple-900 mb-2">✨ Geração Direta com IA</h3>
              <p className="text-sm text-purple-800 mb-2">
                Gere vídeos profissionais <strong>direto no sistema</strong> usando OpenAI Sora 2. 
                Prompts são otimizados automaticamente e vídeos processados em tempo real.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-purple-800">
                <div>✅ Otimização automática</div>
                <div>✅ Fila de processamento</div>
                <div>✅ Progress em tempo real</div>
                <div>✅ Salvar na biblioteca</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      {queueStats && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Total</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{queueStats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-blue-600">Na Fila</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{queueStats.queued}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-purple-600">Processando</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{queueStats.processing}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-green-600">Completos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{queueStats.completed}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-red-600">Erros</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{queueStats.failed}</div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Wand2 className="w-5 h-5 mr-2" />
                Gerar Vídeo com Sora 2
              </CardTitle>
              <CardDescription>
                Digite seu prompt e deixe a IA gerar o vídeo profissional
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="prompt"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Prompt do Vídeo</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder="Ex: Dois atletas de jiu-jitsu em um tatame profissional, demonstrando passagem de guarda fechada..."
                            className="min-h-[120px]"
                          />
                        </FormControl>
                        <FormDescription>
                          Descreva o vídeo que você quer gerar
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="modality"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Modalidade (Opcional)</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="">Nenhuma</SelectItem>
                              {Object.entries(SPORT_MODALITIES).map(([key, mod]) => (
                                <SelectItem key={key} value={key}>
                                  {mod.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormDescription className="text-xs">
                            {watchModality && SPORT_MODALITIES[watchModality as keyof typeof SPORT_MODALITIES]?.environment}
                          </FormDescription>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="exercise"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Exercício (Opcional)</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Ex: Passagem de Guarda" />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="duration"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Duração</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="5">5s</SelectItem>
                              <SelectItem value="10">10s</SelectItem>
                              <SelectItem value="20">20s</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="aspectRatio"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Proporção</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="16:9">16:9</SelectItem>
                              <SelectItem value="9:16">9:16</SelectItem>
                              <SelectItem value="1:1">1:1</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="quality"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Qualidade</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="standard">Standard</SelectItem>
                              <SelectItem value="hd">HD</SelectItem>
                              <SelectItem value="4k">4K</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="autoOptimize"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <input
                            type="checkbox"
                            checked={field.value}
                            onChange={field.onChange}
                            className="rounded"
                            title="Otimizar prompt automaticamente"
                          />
                        </FormControl>
                        <FormLabel className="!mt-0">
                          <Sparkles className="w-4 h-4 inline mr-1" />
                          Otimizar prompt automaticamente com Gemini
                        </FormLabel>
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    disabled={isGenerating}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Gerando Vídeo...
                      </>
                    ) : (
                      <>
                        <Film className="w-4 h-4 mr-2" />
                        Gerar com Sora 2
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        {/* Preview/Info */}
        <div>
          <Card className="bg-gradient-to-br from-purple-50 to-blue-50">
            <CardHeader>
              <CardTitle className="text-sm flex items-center">
                <Zap className="w-4 h-4 mr-2" />
                Como Funciona
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-start space-x-2">
                <div className="bg-purple-100 rounded-full p-1 mt-0.5">
                  <span className="text-xs font-bold text-purple-700">1</span>
                </div>
                <div>
                  <strong>Escreva o prompt</strong>
                  <p className="text-xs text-muted-foreground">Descreva o vídeo desejado</p>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <div className="bg-purple-100 rounded-full p-1 mt-0.5">
                  <span className="text-xs font-bold text-purple-700">2</span>
                </div>
                <div>
                  <strong>IA otimiza</strong>
                  <p className="text-xs text-muted-foreground">Gemini melhora o prompt</p>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <div className="bg-purple-100 rounded-full p-1 mt-0.5">
                  <span className="text-xs font-bold text-purple-700">3</span>
                </div>
                <div>
                  <strong>Sora 2 gera</strong>
                  <p className="text-xs text-muted-foreground">Vídeo processado em tempo real</p>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <div className="bg-purple-100 rounded-full p-1 mt-0.5">
                  <span className="text-xs font-bold text-purple-700">4</span>
                </div>
                <div>
                  <strong>Assista e salve</strong>
                  <p className="text-xs text-muted-foreground">Use direto no sistema</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Generated Videos Queue */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <Clock className="w-5 h-5 mr-2" />
              Fila de Processamento ({generatedVideos.length})
            </CardTitle>
            <Button variant="outline" size="sm" onClick={loadQueue}>
              <RefreshCw className="w-4 h-4 mr-1" />
              Atualizar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {generatedVideos.length === 0 ? (
            <div className="text-center text-muted-foreground py-12">
              <Film className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Nenhum vídeo na fila</p>
              <p className="text-sm mt-1">Gere seu primeiro vídeo acima!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {generatedVideos.map(video => (
                <Card key={video.id} className="overflow-hidden">
                  <CardContent className="pt-4">
                    <div className="flex items-start space-x-4">
                      {/* Thumbnail/Preview */}
                      <div className="w-32 h-18 bg-slate-900 rounded overflow-hidden flex-shrink-0 relative group">
                        {video.videoUrl ? (
                          <>
                            <img src={video.thumbnailUrl} alt={video.prompt} className="w-full h-full object-cover" />
                            <div
                              className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                              onClick={() => setSelectedVideo(video)}
                            >
                              <Play className="w-6 h-6 text-white" />
                            </div>
                          </>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Loader2 className="w-6 h-6 text-white animate-spin" />
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 space-y-2">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="text-sm font-medium line-clamp-2">{video.prompt}</p>
                            <div className="flex items-center space-x-2 mt-1">
                              {getStatusBadge(video.status)}
                              <Badge variant="outline" className="text-xs">
                                {video.duration}s
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {video.aspectRatio}
                              </Badge>
                            </div>
                          </div>
                        </div>

                        {/* Progress */}
                        {(video.status === 'queued' || video.status === 'processing') && (
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              <span>
                                {video.status === 'queued' ? 'Aguardando...' : 'Processando...'}
                              </span>
                              <span>{video.progress}%</span>
                            </div>
                            <Progress value={video.progress || 0} className="h-1" />
                          </div>
                        )}

                        {/* Actions */}
                        {video.status === 'completed' && (
                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline" onClick={() => setSelectedVideo(video)}>
                              <Eye className="w-4 h-4 mr-1" />
                              Assistir
                            </Button>
                            <Button size="sm" onClick={() => handleSaveToLibrary(video)}>
                              <Download className="w-4 h-4 mr-1" />
                              Salvar
                            </Button>
                          </div>
                        )}

                        {/* Error */}
                        {video.status === 'failed' && video.error && (
                          <Alert variant="destructive" className="py-2">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription className="text-xs">{video.error}</AlertDescription>
                          </Alert>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Video Player Dialog */}
      {selectedVideo && selectedVideo.videoUrl && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="font-semibold">{selectedVideo.prompt.substring(0, 60)}...</h3>
              <Button variant="ghost" onClick={() => setSelectedVideo(null)}>
                ✕
              </Button>
            </div>
            <div className="p-4">
              <VideoPlayer
                src={selectedVideo.videoUrl}
                thumbnail={selectedVideo.thumbnailUrl}
                title={selectedVideo.prompt}
                duration={selectedVideo.duration}
                controls
              />
            </div>
            <div className="p-4 border-t flex justify-between">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Badge>{selectedVideo.aspectRatio}</Badge>
                <Badge>{selectedVideo.duration}s</Badge>
                <span>Gerado em {new Date(selectedVideo.createdAt).toLocaleString('pt-BR')}</span>
              </div>
              <Button onClick={() => handleSaveToLibrary(selectedVideo)}>
                <Download className="w-4 h-4 mr-2" />
                Salvar na Biblioteca
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SoraDirectGenerationPage;
