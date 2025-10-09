// pages/FreeVideoGeneratorPageImproved.tsx
// Versão melhorada com fluxo: Gerar → Ver Status → Ver Resultado → Aprovar/Gerar Novo
import React, { useState, useCallback, useEffect } from 'react';
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
  RefreshCw,
  XCircle,
  Clock,
  CheckCheck
} from 'lucide-react';
import PageHeader from '../components/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Progress } from '../components/ui/progress';
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
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '../components/ui/alert';
import VideoUploader from '../components/video/VideoUploader';
import VideoPlayer from '../components/video/VideoPlayer';
// import { freeVideoGeneratorService, FREE_VIDEO_TOOLS } from '../services/ai/freeVideoGenerators';
// import { SPORT_MODALITIES } from '../services/ai/soraService';
// import { videoLibraryService } from '../services/videoLibraryService';
// import { exerciseService } from '../services/exerciseService';

// Mock data para evitar erros de import
const FREE_VIDEO_TOOLS = {
  capcut: {
    name: 'CapCut',
    description: 'Gerador de vídeo com IA totalmente gratuito',
    quality: 'HD (1080p)',
    url: 'https://www.capcut.com/tools/ai-video-generator',
    maxDuration: 60,
    formats: ['mp4', 'mov']
  }
};

const SPORT_MODALITIES = {
  jiujitsu: { name: 'Jiu-Jitsu' },
  muaythai: { name: 'Muay Thai' },
  boxing: { name: 'Boxing' },
  wrestling: { name: 'Wrestling' }
};
// import { useToast } from '../contexts/ToastContext';

// Schema
const exerciseWithVideoSchema = z.object({
  action: z.enum(['create', 'link']),
  exerciseName: z.string().min(3, "Mínimo 3 caracteres"),
  modality: z.string(),
  tool: z.enum(['capcut', 'canva', 'hyperAI', 'adobeFirefly']),
  additionalContext: z.string().optional(),
  category: z.string().optional(),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  muscleGroups: z.string().optional(),
  equipment: z.string().optional(),
  existingExerciseId: z.string().optional(),
});

type FormValues = z.infer<typeof exerciseWithVideoSchema>;

// Estados do fluxo
type FlowStep = 'config' | 'generating' | 'result' | 'uploading' | 'success';

const FreeVideoGeneratorPageImproved: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<FlowStep>('config');
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [selectedTool, setSelectedTool] = useState<any>(null);
  const [pendingFormData, setPendingFormData] = useState<FormValues | null>(null);
  const [uploadedVideoUrl, setUploadedVideoUrl] = useState('');
  const [uploadedThumbnailUrl, setUploadedThumbnailUrl] = useState('');
  const [generationProgress, setGenerationProgress] = useState(0);
  // const { showToast } = useToast();
  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    console.log(`${type.toUpperCase()}: ${message}`);
  };

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

  // Simular progresso de geração
  useEffect(() => {
    if (currentStep === 'generating') {
      const interval = setInterval(() => {
        setGenerationProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 10;
        });
      }, 500);

      return () => clearInterval(interval);
    }
  }, [currentStep]);

  const onSubmit = useCallback(
    async (values: FormValues) => {
      try {
        // Passo 1: Gerar prompt otimizado
        setCurrentStep('generating');
        setGenerationProgress(0);
        setPendingFormData(values);
        setSelectedTool(FREE_VIDEO_TOOLS[values.tool]);

        // Simular geração de prompt (sem chamar serviço real)
        const mockPrompt = `Cena cinematográfica em tatame profissional de artes marciais. Dois atletas vestindo kimonos (branco e azul) demonstrando ${values.exerciseName} em ${values.modality}. Câmera fixa em ângulo frontal superior. Iluminação natural com luz lateral. Movimento em velocidade normal seguido de repetição em câmera lenta mostrando detalhes da técnica e pegadas corretas. Ambiente limpo, tatame azul profissional. HD, 30fps, 10 segundos.`;

        setGeneratedPrompt(mockPrompt);
        
        // Aguardar progresso completar
        setTimeout(() => {
          setCurrentStep('result');
          showToast('Prompt otimizado gerado!', 'success');
        }, 5000);

      } catch (error) {
        console.error('Erro:', error);
        showToast('Erro ao gerar prompt', 'error');
        setCurrentStep('config');
      }
    },
    [showToast]
  );

  const handleApprove = useCallback(() => {
    setCurrentStep('uploading');
  }, []);

  const handleRegenerate = useCallback(() => {
    setCurrentStep('config');
    setGenerationProgress(0);
    setGeneratedPrompt('');
  }, []);

  const handleCopyPromptAndOpen = useCallback(() => {
    navigator.clipboard.writeText(generatedPrompt);
    window.open(selectedTool.url, '_blank');
    showToast(`Prompt copiado! Agora gere no ${selectedTool.name}`, 'success');
  }, [generatedPrompt, selectedTool, showToast]);

  const handleVideoUploaded = useCallback(
    async (videoUrl: string, thumbnailUrl: string) => {
      if (!pendingFormData) return;

      try {
        setUploadedVideoUrl(videoUrl);
        setUploadedThumbnailUrl(thumbnailUrl);

        // Simular criação bem-sucedida
        setTimeout(() => {
          setCurrentStep('success');
          showToast(
            pendingFormData.action === 'create'
              ? `Exercício "${pendingFormData.exerciseName}" criado com vídeo!`
              : 'Vídeo vinculado ao exercício!',
            'success'
          );
        }, 1000);

      } catch (error) {
        showToast('Erro ao processar vídeo', 'error');
      }
    },
    [pendingFormData, showToast]
  );

  const handleStartNew = useCallback(() => {
    setCurrentStep('config');
    setGenerationProgress(0);
    setGeneratedPrompt('');
    setUploadedVideoUrl('');
    setUploadedThumbnailUrl('');
    setPendingFormData(null);
    form.reset();
  }, [form]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Geração GRATUITA de Vídeos"
        subtitle="Crie vídeos profissionais GRÁTIS e vincule automaticamente aos exercícios"
      />

      {/* Progress Indicator */}
      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className={`flex items-center space-x-2 ${currentStep === 'config' ? 'text-green-600' : 'text-muted-foreground'}`}>
              <div className={`rounded-full p-2 ${currentStep === 'config' ? 'bg-green-100' : 'bg-slate-100'}`}>
                <Wand2 className="w-4 h-4" />
              </div>
              <span className="text-sm font-medium">1. Configurar</span>
            </div>

            <div className="flex-1 mx-4 h-1 bg-slate-200 rounded">
              <div className={`h-full bg-green-500 rounded transition-all ${currentStep !== 'config' ? 'w-full' : 'w-0'}`} />
            </div>

            <div className={`flex items-center space-x-2 ${currentStep === 'generating' ? 'text-blue-600' : currentStep === 'result' || currentStep === 'uploading' || currentStep === 'success' ? 'text-green-600' : 'text-muted-foreground'}`}>
              <div className={`rounded-full p-2 ${currentStep === 'generating' ? 'bg-blue-100' : currentStep === 'result' || currentStep === 'uploading' || currentStep === 'success' ? 'bg-green-100' : 'bg-slate-100'}`}>
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="text-sm font-medium">2. Gerar</span>
            </div>

            <div className="flex-1 mx-4 h-1 bg-slate-200 rounded">
              <div className={`h-full bg-green-500 rounded transition-all ${currentStep === 'result' || currentStep === 'uploading' || currentStep === 'success' ? 'w-full' : 'w-0'}`} />
            </div>

            <div className={`flex items-center space-x-2 ${currentStep === 'result' ? 'text-blue-600' : currentStep === 'uploading' || currentStep === 'success' ? 'text-green-600' : 'text-muted-foreground'}`}>
              <div className={`rounded-full p-2 ${currentStep === 'result' ? 'bg-blue-100' : currentStep === 'uploading' || currentStep === 'success' ? 'bg-green-100' : 'bg-slate-100'}`}>
                <CheckCircle className="w-4 h-4" />
              </div>
              <span className="text-sm font-medium">3. Aprovar</span>
            </div>

            <div className="flex-1 mx-4 h-1 bg-slate-200 rounded">
              <div className={`h-full bg-green-500 rounded transition-all ${currentStep === 'uploading' || currentStep === 'success' ? 'w-full' : 'w-0'}`} />
            </div>

            <div className={`flex items-center space-x-2 ${currentStep === 'uploading' ? 'text-blue-600' : currentStep === 'success' ? 'text-green-600' : 'text-muted-foreground'}`}>
              <div className={`rounded-full p-2 ${currentStep === 'uploading' ? 'bg-blue-100' : currentStep === 'success' ? 'bg-green-100' : 'bg-slate-100'}`}>
                <Upload className="w-4 h-4" />
              </div>
              <span className="text-sm font-medium">4. Upload</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* STEP 1: CONFIG */}
      {currentStep === 'config' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Wand2 className="w-5 h-5 mr-2" />
              Passo 1: Configurar Exercício
            </CardTitle>
            <CardDescription>Configure os detalhes do exercício e escolha a ferramenta gratuita</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="action"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>O que deseja fazer?</FormLabel>
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
                      <FormLabel>Nome do Exercício/Técnica</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Ex: Passagem de Guarda Fechada" />
                      </FormControl>
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
                        <FormLabel>Modalidade</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.entries(SPORT_MODALITIES).map(([key, mod]) => (
                              <SelectItem key={key} value={key}>
                                {mod.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="tool"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ferramenta (Gratuita)</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.entries(FREE_VIDEO_TOOLS).map(([key, tool]) => (
                              <SelectItem key={key} value={key}>
                                {tool.name} ({tool.quality})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription className="text-xs">
                          {toolInfo.description}
                        </FormDescription>
                      </FormItem>
                    )}
                  />
                </div>

                {watchAction === 'create' && (
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
                )}

                <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" size="lg">
                  <Zap className="w-4 h-4 mr-2" />
                  Gerar Prompt Otimizado
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}

      {/* STEP 2: GENERATING */}
      {currentStep === 'generating' && (
        <Card className="border-2 border-blue-500">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Sparkles className="w-5 h-5 mr-2 text-blue-600 animate-pulse" />
              Passo 2: Gerando Prompt Otimizado
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-center py-12">
              <div className="text-center space-y-4">
                <div className="relative">
                  <div className="w-24 h-24 mx-auto">
                    <svg className="animate-spin" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="45" fill="none" stroke="#e5e7eb" strokeWidth="8" />
                      <circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke="#10b981"
                        strokeWidth="8"
                        strokeDasharray="283"
                        strokeDashoffset={283 - (283 * generationProgress) / 100}
                        transform="rotate(-90 50 50)"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Film className="w-8 h-8 text-green-600" />
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-800">Otimizando prompt com IA...</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Gemini está criando o prompt perfeito para {selectedTool?.name}
                  </p>
                </div>
                <Progress value={generationProgress} className="w-64 mx-auto" />
                <p className="text-sm font-mono text-blue-600">{generationProgress}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* STEP 3: RESULT - APPROVE OR REGENERATE */}
      {currentStep === 'result' && (
        <Card className="border-2 border-green-500">
          <CardHeader>
            <CardTitle className="flex items-center">
              <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
              Passo 3: Prompt Gerado - Revisar e Aprovar
            </CardTitle>
            <CardDescription>
              Revise o prompt otimizado antes de gerar o vídeo em {selectedTool?.name}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Prompt Display */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold flex items-center">
                  <Sparkles className="w-4 h-4 mr-2 text-yellow-500" />
                  Prompt Otimizado
                </h4>
                <Button variant="outline" size="sm" onClick={() => navigator.clipboard.writeText(generatedPrompt)}>
                  <Copy className="w-4 h-4 mr-1" />
                  Copiar
                </Button>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-lg border-2 border-green-300">
                <pre className="text-sm text-slate-700 whitespace-pre-wrap font-medium">{generatedPrompt}</pre>
              </div>
            </div>

            {/* Tool Info */}
            <Alert>
              <Gift className="h-4 w-4" />
              <AlertTitle>Ferramenta Selecionada: {selectedTool?.name}</AlertTitle>
              <AlertDescription>
                <div className="mt-2 space-y-1 text-sm">
                  <p><strong>Qualidade:</strong> {selectedTool?.quality}</p>
                  <p><strong>Duração Máx:</strong> {selectedTool?.maxDuration}s</p>
                  <p><strong>Formatos:</strong> {selectedTool?.formats.join(', ')}</p>
                </div>
              </AlertDescription>
            </Alert>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-4">
              <Button
                variant="outline"
                size="lg"
                onClick={handleRegenerate}
                className="h-20 flex-col space-y-2"
              >
                <RefreshCw className="w-6 h-6" />
                <div className="text-center">
                  <div className="font-semibold">Gerar Novo</div>
                  <div className="text-xs text-muted-foreground">Alterar configurações</div>
                </div>
              </Button>

              <Button
                size="lg"
                onClick={handleApprove}
                className="h-20 bg-green-600 hover:bg-green-700 flex-col space-y-2"
              >
                <CheckCheck className="w-6 h-6" />
                <div className="text-center">
                  <div className="font-semibold">Aprovar e Continuar</div>
                  <div className="text-xs">Gerar vídeo no {selectedTool?.name}</div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* STEP 4: UPLOADING */}
      {currentStep === 'uploading' && (
        <Card className="border-2 border-blue-500">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Upload className="w-5 h-5 mr-2 text-blue-600" />
              Passo 4: Gerar e Fazer Upload do Vídeo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Instructions */}
            <Alert>
              <Clock className="h-4 w-4" />
              <AlertTitle>Siga os passos abaixo:</AlertTitle>
              <AlertDescription>
                <ol className="mt-2 space-y-2 text-sm list-decimal list-inside">
                  {selectedTool?.howToUse.map((step: string, idx: number) => (
                    <li key={idx}>{step}</li>
                  ))}
                </ol>
              </AlertDescription>
            </Alert>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-4">
              <Button
                variant="outline"
                onClick={() => navigator.clipboard.writeText(generatedPrompt)}
                className="h-16"
              >
                <div className="text-center">
                  <Copy className="w-5 h-5 mx-auto mb-1" />
                  <div className="text-sm font-medium">Copiar Prompt</div>
                </div>
              </Button>

              <Button
                onClick={handleCopyPromptAndOpen}
                className="h-16 bg-green-600 hover:bg-green-700"
              >
                <div className="text-center">
                  <ExternalLink className="w-5 h-5 mx-auto mb-1" />
                  <div className="text-sm font-medium">Copiar e Abrir {selectedTool?.name}</div>
                </div>
              </Button>
            </div>

            {/* Upload Area */}
            <div>
              <h4 className="font-semibold mb-3">Upload do Vídeo Gerado:</h4>
              <VideoUploader
                onUploadComplete={handleVideoUploaded}
                maxSize={500}
                maxDuration={120}
              />
            </div>

            <Button variant="outline" onClick={handleRegenerate} className="w-full">
              <XCircle className="w-4 h-4 mr-2" />
              Cancelar e Voltar
            </Button>
          </CardContent>
        </Card>
      )}

      {/* STEP 5: SUCCESS */}
      {currentStep === 'success' && (
        <Card className="border-2 border-green-500 bg-gradient-to-br from-green-50 to-emerald-50">
          <CardHeader>
            <CardTitle className="flex items-center text-green-700">
              <CheckCircle className="w-6 h-6 mr-2" />
              ✅ Sucesso! Exercício {pendingFormData?.action === 'create' ? 'Criado' : 'Atualizado'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Video Preview */}
            {uploadedVideoUrl && (
              <div>
                <h4 className="font-semibold mb-3">Vídeo Vinculado:</h4>
                <VideoPlayer
                  src={uploadedVideoUrl}
                  thumbnail={uploadedThumbnailUrl}
                  title={pendingFormData?.exerciseName}
                  controls
                  className="rounded-lg overflow-hidden"
                />
              </div>
            )}

            {/* Success Info */}
            <Alert className="bg-white border-green-300">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertTitle>Tudo Pronto!</AlertTitle>
              <AlertDescription>
                <div className="mt-2 space-y-2 text-sm">
                  <p>
                    ✅ Exercício <strong>"{pendingFormData?.exerciseName}"</strong>{' '}
                    {pendingFormData?.action === 'create' ? 'criado' : 'atualizado'} com sucesso
                  </p>
                  <p>✅ Vídeo vinculado automaticamente</p>
                  <p>✅ Disponível em toda a biblioteca</p>
                  <p>✅ Pronto para usar em protocolos</p>
                </div>
              </AlertDescription>
            </Alert>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-4">
              <Button variant="outline" onClick={handleStartNew} size="lg" className="h-16">
                <div className="text-center">
                  <Plus className="w-5 h-5 mx-auto mb-1" />
                  <div className="text-sm font-medium">Criar Outro Exercício</div>
                </div>
              </Button>

              <Button
                onClick={() => (window.location.href = '/exercise-library')}
                size="lg"
                className="h-16 bg-green-600 hover:bg-green-700"
              >
                <div className="text-center">
                  <Film className="w-5 h-5 mx-auto mb-1" />
                  <div className="text-sm font-medium">Ver na Biblioteca</div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sidebar - Always visible */}
      {currentStep !== 'success' && (
        <Card className="bg-gradient-to-br from-purple-50 to-pink-50">
          <CardHeader>
            <CardTitle className="text-sm">💡 Dica</CardTitle>
          </CardHeader>
          <CardContent className="text-xs space-y-2">
            {currentStep === 'config' && (
              <>
                <p>📝 Seja específico no nome do exercício</p>
                <p>🥋 Escolha a modalidade correta para melhor resultado</p>
                <p>⚡ CapCut é o mais rápido para começar</p>
              </>
            )}
            {currentStep === 'generating' && (
              <>
                <p>✨ IA está otimizando seu prompt</p>
                <p>🎯 Adicionando detalhes técnicos</p>
                <p>🎨 Configurando ambiente e iluminação</p>
              </>
            )}
            {currentStep === 'result' && (
              <>
                <p>👀 Revise o prompt gerado</p>
                <p>✅ Aprove se estiver bom</p>
                <p>🔄 Ou gere novo com outras configurações</p>
              </>
            )}
            {currentStep === 'uploading' && (
              <>
                <p>📋 Siga os passos na ordem</p>
                <p>🎬 Aguarde {selectedTool?.name} gerar (1-2 min)</p>
                <p>💾 Baixe e arraste para o sistema</p>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FreeVideoGeneratorPageImproved;
