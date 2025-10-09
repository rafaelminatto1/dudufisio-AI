// pages/FreeVideoGeneratorPage.tsx
// Geração GRATUITA de vídeos + Criação/Vinculação de Exercícios
import React, { useState, useCallback } from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Film,
  Wand2,
  Sparkles,
  ExternalLink,
  Copy,
  CheckCircle,
  Upload,
  Plus,
  Link as LinkIcon,
  Zap,
  Gift,
  Star,
  TrendingUp
} from 'lucide-react';
import PageHeader from '../components/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import VideoUploader from '../components/video/VideoUploader';
import { freeVideoGeneratorService, FREE_VIDEO_TOOLS, VideoGenerationGuide } from '../services/ai/freeVideoGenerators';
import { SPORT_MODALITIES } from '../services/ai/soraService';
import { videoLibraryService } from '../services/videoLibraryService';
import { exerciseService } from '../services/exerciseService';
import { useToast } from '../contexts/ToastContext';

// Schema para criação de exercício com vídeo
const exerciseWithVideoSchema = z.object({
  action: z.enum(['create', 'link']),
  // Dados do vídeo
  exerciseName: z.string().min(3, "Mínimo 3 caracteres"),
  modality: z.string(),
  tool: z.enum(['capcut', 'canva', 'hyperAI', 'adobeFirefly']),
  additionalContext: z.string().optional(),
  // Dados do exercício (se criar novo)
  category: z.string().optional(),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  muscleGroups: z.string().optional(),
  equipment: z.string().optional(),
  // Dados do exercício existente (se vincular)
  existingExerciseId: z.string().optional(),
});

type FormValues = z.infer<typeof exerciseWithVideoSchema>;

const FreeVideoGeneratorPage: React.FC = () => {
  const [guide, setGuide] = useState<VideoGenerationGuide | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [pendingExerciseData, setPendingExerciseData] = useState<any>(null);
  const [copiedStep, setCopiedStep] = useState<number | null>(null);
  const { showToast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(exerciseWithVideoSchema),
    defaultValues: {
      action: 'create',
      exerciseName: '',
      modality: 'jiujitsu',
      tool: 'capcut',
      difficulty: 'intermediate',
    },
  });

  const watchAction = form.watch('action');
  const watchTool = form.watch('tool');
  const watchModality = form.watch('modality');

  const toolInfo = FREE_VIDEO_TOOLS[watchTool];
  const modalityInfo = watchModality ? SPORT_MODALITIES[watchModality as keyof typeof SPORT_MODALITIES] : null;

  const onSubmit = useCallback(
    async (values: FormValues) => {
      setIsGenerating(true);
      try {
        // Gerar guia de vídeo
        const videoGuide = await freeVideoGeneratorService.generateVideoGuide(
          values.exerciseName,
          values.modality,
          values.tool,
          values.additionalContext
        );

        setGuide(videoGuide);
        setPendingExerciseData(values);
        showToast(`Guia gerado para ${videoGuide.tool}!`, 'success');
      } catch (error) {
        showToast('Erro ao gerar guia', 'error');
      } finally {
        setIsGenerating(false);
      }
    },
    [showToast]
  );

  const handleCopyPrompt = useCallback(() => {
    if (guide) {
      navigator.clipboard.writeText(guide.optimizedPrompt);
      showToast('Prompt copiado! Cole no ' + guide.tool, 'success');
    }
  }, [guide, showToast]);

  const handleCopyStep = useCallback(
    (step: string, index: number) => {
      navigator.clipboard.writeText(step);
      setCopiedStep(index);
      setTimeout(() => setCopiedStep(null), 2000);
    },
    []
  );

  const handleOpenTool = useCallback(() => {
    if (guide && toolInfo) {
      window.open(toolInfo.url, '_blank');
    }
  }, [guide, toolInfo]);

  const handleVideoUploaded = useCallback(
    async (videoUrl: string, thumbnailUrl: string) => {
      if (!pendingExerciseData) return;

      try {
        const values = pendingExerciseData;

        if (values.action === 'create') {
          // Criar novo exercício com vídeo
          const newExercise = await exerciseService.createExercise({
            name: values.exerciseName,
            description: `Exercício de ${values.modality} - ${values.exerciseName}`,
            category: values.category || 'Geral',
            muscle_groups: values.muscleGroups ? values.muscleGroups.split(',').map((m: string) => m.trim()) : [],
            equipment: values.equipment ? values.equipment.split(',').map((e: string) => e.trim()) : [],
            difficulty_level: values.difficulty || 'intermediate',
            instructions: [`Assista o vídeo demonstrativo para ver a técnica correta`],
            video_url: videoUrl,
            image_urls: [thumbnailUrl],
            tags: [values.modality, 'video', 'ai-generated'],
          });

          showToast(`Exercício "${values.exerciseName}" criado com vídeo!`, 'success');
        } else {
          // Vincular vídeo a exercício existente
          await exerciseService.updateExercise(values.existingExerciseId, {
            video_url: videoUrl,
            image_urls: [thumbnailUrl],
          });

          showToast('Vídeo vinculado ao exercício!', 'success');
        }

        // Salvar vídeo na biblioteca também
        await videoLibraryService.createVideo({
          url: videoUrl,
          thumbnailUrl,
          prompt: guide?.optimizedPrompt || values.exerciseName,
          optimizedPrompt: guide?.optimizedPrompt || values.exerciseName,
          duration: 10,
          aspectRatio: '16:9',
          resolution: '1080p',
          modality: values.modality,
          exercise: values.exerciseName,
          tags: [values.modality, 'free-tool', toolInfo.id],
          status: 'ready',
          metadata: { fps: 30, size: 0, format: 'mp4' },
          linkedExercises: values.action === 'link' && values.existingExerciseId ? [values.existingExerciseId] : [],
          category: 'User Generated',
          difficulty: values.difficulty || 'intermediate',
          isPublic: true,
          createdBy: 'user',
        });

        setShowUploadDialog(false);
        setPendingExerciseData(null);
        setGuide(null);
        form.reset();
      } catch (error) {
        showToast('Erro ao processar vídeo', 'error');
      }
    },
    [pendingExerciseData, guide, toolInfo, form, showToast]
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Geração GRATUITA de Vídeos"
        subtitle="Crie vídeos profissionais GRÁTIS com CapCut, Canva, Hyper AI ou Adobe Firefly e vincule automaticamente aos exercícios"
      />

      {/* Info Card */}
      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
        <CardContent className="pt-6">
          <div className="flex items-start space-x-3">
            <Gift className="w-6 h-6 text-green-600 mt-1" />
            <div>
              <h3 className="font-semibold text-green-900 mb-2">🎁 100% Gratuito!</h3>
              <p className="text-sm text-green-800 mb-3">
                Use ferramentas profissionais de geração de vídeos <strong>totalmente grátis</strong>!
                Sistema otimiza prompts e guia você passo a passo.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-green-800">
                <div>✅ CapCut - Fácil e rápido</div>
                <div>✅ Canva - Templates prontos</div>
                <div>✅ Hyper AI - Alta qualidade 4K</div>
                <div>✅ Adobe Firefly - Efeitos profissionais</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Wand2 className="w-5 h-5 mr-2" />
                Configurar Exercício e Vídeo
              </CardTitle>
              <CardDescription>Crie novo exercício ou vincule vídeo a exercício existente</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="action"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ação</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="create">
                              <div className="flex items-center">
                                <Plus className="w-4 h-4 mr-2" />
                                Criar Novo Exercício com Vídeo
                              </div>
                            </SelectItem>
                            <SelectItem value="link">
                              <div className="flex items-center">
                                <LinkIcon className="w-4 h-4 mr-2" />
                                Vincular Vídeo a Exercício Existente
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="exerciseName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome do Exercício</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Ex: Passagem de Guarda Fechada" />
                        </FormControl>
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
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.entries(SPORT_MODALITIES).map(([key, mod]) => (
                              <SelectItem key={key} value={key}>
                                {mod.name} ({mod.category})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription className="text-xs">
                          {modalityInfo?.environment}
                        </FormDescription>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="tool"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ferramenta de Geração (Gratuita)</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.entries(FREE_VIDEO_TOOLS).map(([key, tool]) => (
                              <SelectItem key={key} value={key}>
                                <div className="flex items-center justify-between w-full">
                                  <span>{tool.name}</span>
                                  <Badge variant="outline" className="ml-2 text-xs">
                                    {tool.quality}
                                  </Badge>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription className="text-xs">
                          {toolInfo.description} - Max: {toolInfo.maxDuration}s
                        </FormDescription>
                      </FormItem>
                    )}
                  />

                  {watchAction === 'create' && (
                    <>
                      <FormField
                        control={form.control}
                        name="difficulty"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Dificuldade</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="beginner">Iniciante</SelectItem>
                                <SelectItem value="intermediate">Intermediário</SelectItem>
                                <SelectItem value="advanced">Avançado</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="muscleGroups"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Grupos Musculares (separados por vírgula)</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Ex: Pernas, Core, Costas" />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </>
                  )}

                  <FormField
                    control={form.control}
                    name="additionalContext"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contexto Adicional (Opcional)</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder="Ex: Demonstração em câmera lenta, foco na técnica correta..."
                            className="min-h-[80px]"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <Button type="submit" disabled={isGenerating} className="w-full bg-green-600 hover:bg-green-700">
                    {isGenerating ? (
                      <>
                        <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                        Gerando Guia...
                      </>
                    ) : (
                      <>
                        <Wand2 className="w-4 h-4 mr-2" />
                        Gerar Guia de Vídeo Gratuito
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Generated Guide */}
          {guide && (
            <Card className="border-2 border-green-500">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center">
                    <Sparkles className="w-5 h-5 mr-2 text-yellow-500" />
                    Guia de Geração - {guide.tool}
                  </CardTitle>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={handleCopyPrompt}>
                      <Copy className="w-4 h-4 mr-1" />
                      Copiar Prompt
                    </Button>
                    <Button size="sm" onClick={handleOpenTool} className="bg-green-600 hover:bg-green-700">
                      <ExternalLink className="w-4 h-4 mr-1" />
                      Abrir {guide.tool}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Optimized Prompt */}
                <div>
                  <h4 className="font-semibold mb-2 flex items-center">
                    <Zap className="w-4 h-4 mr-2 text-yellow-500" />
                    Prompt Otimizado
                  </h4>
                  <div className="bg-slate-50 p-4 rounded-lg border-2 border-green-200">
                    <pre className="text-sm text-slate-700 whitespace-pre-wrap">{guide.optimizedPrompt}</pre>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    ✅ Otimizado especificamente para {guide.tool}
                  </p>
                </div>

                {/* Steps */}
                <div>
                  <h4 className="font-semibold mb-3 flex items-center">
                    <Film className="w-4 h-4 mr-2" />
                    Passo a Passo
                  </h4>
                  <div className="space-y-2">
                    {guide.steps.map((step, index) => (
                      <div
                        key={index}
                        className="flex items-start space-x-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors group"
                      >
                        <div className="bg-green-100 rounded-full p-2 flex-shrink-0">
                          <span className="text-xs font-bold text-green-700">{index + 1}</span>
                        </div>
                        <p className="text-sm flex-1 pt-1">{step}</p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopyStep(step, index)}
                          className="opacity-0 group-hover:opacity-100"
                          aria-label="Copiar passo"
                        >
                          {copiedStep === index ? (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Next Step */}
                <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4">
                  <h4 className="font-semibold text-green-900 mb-2">📥 Após Gerar o Vídeo:</h4>
                  <ol className="text-sm text-green-800 space-y-1 list-decimal list-inside">
                    <li>Baixe o vídeo do {guide.tool}</li>
                    <li>Clique no botão "Fazer Upload do Vídeo" abaixo</li>
                    <li>
                      {watchAction === 'create'
                        ? 'Sistema cria o exercício automaticamente'
                        : 'Sistema vincula ao exercício existente'}
                    </li>
                    <li>Vídeo estará disponível na biblioteca e no exercício!</li>
                  </ol>
                  <Button onClick={() => setShowUploadDialog(true)} className="w-full mt-4" size="lg">
                    <Upload className="w-4 h-4 mr-2" />
                    Fazer Upload do Vídeo Gerado
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar - Tools Info */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Ferramentas Gratuitas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {Object.entries(FREE_VIDEO_TOOLS).map(([key, tool]) => (
                <div key={key} className={`p-3 rounded-lg border-2 ${watchTool === key ? 'border-green-500 bg-green-50' : 'border-slate-200'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-sm">{tool.name}</h4>
                    <Badge variant="outline" className="text-xs">
                      {tool.quality}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">{tool.description}</p>
                  <div className="flex flex-wrap gap-1">
                    {tool.features.slice(0, 2).map((feature, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {toolInfo && (
            <Card className="bg-gradient-to-br from-green-50 to-emerald-50">
              <CardHeader>
                <CardTitle className="text-sm flex items-center">
                  <Star className="w-4 h-4 mr-2 text-yellow-500" />
                  {toolInfo.name} Selecionado
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xs space-y-2">
                <div>
                  <strong>Features:</strong> {toolInfo.features.join(', ')}
                </div>
                <div>
                  <strong>Qualidade:</strong> {toolInfo.quality}
                </div>
                <div>
                  <strong>Duração Máx:</strong> {toolInfo.maxDuration}s
                </div>
                <div>
                  <strong>Formatos:</strong> {toolInfo.formats.join(', ')}
                </div>
                {toolInfo.limitations && (
                  <div className="text-orange-600">
                    <strong>⚠️ Nota:</strong> {toolInfo.limitations}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Upload Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Upload do Vídeo Gerado</DialogTitle>
            <DialogDescription>
              Faça upload do vídeo que você gerou em {guide?.tool}
            </DialogDescription>
          </DialogHeader>
          <VideoUploader
            onUploadComplete={handleVideoUploaded}
            maxSize={500}
            maxDuration={120}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUploadDialog(false)}>
              Cancelar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FreeVideoGeneratorPage;
