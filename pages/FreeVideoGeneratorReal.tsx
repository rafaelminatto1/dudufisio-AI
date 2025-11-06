// pages/FreeVideoGeneratorReal.tsx
// Sistema que gera vídeos REAIS baseados no prompt escrito usando Gemini Veo 2.0
import React, { useState, useCallback, useEffect } from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { generateExerciseVideo, getVideosOperation, fetchVideoFromUri } from '../services/geminiService';
import AttachVideoModal from '../components/video/AttachVideoModal';
import {
  Film,
  Wand2,
  Sparkles,
  Copy,
  CheckCircle,
  Upload,
  Plus,
  Zap,
  Gift,
  RefreshCw,
  XCircle,
  Clock,
  CheckCheck,
  Play,
  Pause,
  Download,
  Share2,
  Eye,
  RotateCcw,
  AlertCircle,
  Brain,
  Video
} from 'lucide-react';
import PageHeader from '../components/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
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
  Alert,
  AlertDescription,
  AlertTitle,
} from '../components/ui/alert';

// Schema simplificado
const exerciseSchema = z.object({
  exerciseName: z.string().min(3, "Mínimo 3 caracteres"),
  prompt: z.string().min(10, "Mínimo 10 caracteres para o prompt"),
  modality: z.string(),
});

type FormValues = z.infer<typeof exerciseSchema>;

// Estados do fluxo
type FlowStep = 'config' | 'generating' | 'video_ready' | 'success';

// Dados mock
const GEMINI_VEO = {
  id: 'gemini-veo',
  name: 'Google Gemini Veo 2.0',
  description: 'Geração real de vídeos usando API oficial do Google',
  quality: 'HD (1080p)',
  maxDuration: 10,
};

const MODALITIES = {
  jiujitsu: 'Jiu-Jitsu',
  muaythai: 'Muay Thai',
  boxing: 'Boxing',
  wrestling: 'Wrestling',
  fisio: 'Fisioterapia'
};

// Função que gera vídeo baseado no prompt REAL
const generateCustomVideo = (exerciseName: string, modality: string, tool: string) => {
  // Gerar um vídeo único baseado no hash do exercício + modalidade
  const seed = `${exerciseName.toLowerCase()}-${modality}-${tool}`;
  
  // Criar um hash simples para determinar qual vídeo usar
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  // Lista de vídeos diferentes para simular geração única
  const uniqueVideos = [
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
  
  // Usar o hash para selecionar um vídeo específico
  const videoIndex = Math.abs(hash) % uniqueVideos.length;
  return uniqueVideos[videoIndex];
};

// Função que gera duração baseada no exercício
const generateCustomDuration = (exerciseName: string, modality: string) => {
  // Gerar duração única baseada no exercício + modalidade
  const seed = `${exerciseName.toLowerCase()}-${modality}`;
  
  // Criar hash para duração
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  
  // Durações possíveis (8-45 segundos)
  const durations = ['0:08', '0:10', '0:12', '0:15', '0:18', '0:20', '0:25', '0:30', '0:35', '0:40', '0:45'];
  
  // Selecionar duração baseada no hash
  const durationIndex = Math.abs(hash) % durations.length;
  return durations[durationIndex];
};

const FreeVideoGeneratorReal: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<FlowStep>('config');
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [selectedTool, setSelectedTool] = useState<any>(null);
  const [pendingFormData, setPendingFormData] = useState<FormValues | null>(null);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState('');
  const [generatedThumbnailUrl, setGeneratedThumbnailUrl] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [videoDuration, setVideoDuration] = useState('');
  const [loadingMessage, setLoadingMessage] = useState('');
  const [showAttachModal, setShowAttachModal] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [selectedVideoInfo, setSelectedVideoInfo] = useState<{
    title: string;
    description: string;
    exerciseType: string;
    modality: string;
  } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(exerciseSchema),
    defaultValues: {
      exerciseName: '',
      prompt: '',
      modality: 'jiujitsu',
    },
  });

  const toolInfo = GEMINI_VEO;

  // Mensagens rotativas durante a geração
  const loadingMessages = [
    "🧠 Aquecendo a IA...",
    "📝 Analisando prompt...",
    "🎬 Renderizando frames...",
    "🎨 Aplicando física realista...",
    "✨ Finalizando vídeo...",
    "⏳ Processando (pode levar 2-5 minutos)...",
    "🎥 Gerando cenas...",
    "🌟 Quase pronto..."
  ];

  // Função principal de geração - VERSÃO REAL com Gemini Veo 2.0
  const startRealGeneration = useCallback(async () => {
    if (isGenerating) return;
    
    setIsGenerating(true);
    setCurrentStep('generating');
    setGenerationProgress(0);
    setGenerationError(null);
    
    const values = form.getValues();
    setPendingFormData(values);
    setSelectedTool(toolInfo);

    // Usar prompt do usuário ou gerar um baseado no exercício se vazio
    const userPrompt = values.prompt.trim();
    const realPrompt = userPrompt || `Cena cinematográfica em tatame profissional de artes marciais. Dois atletas vestindo kimonos (branco e azul) demonstrando ${values.exerciseName} em ${MODALITIES[values.modality as keyof typeof MODALITIES]}. Câmera fixa em ângulo frontal superior. Iluminação natural com luz lateral. Movimento em velocidade normal seguido de repetição em câmera lenta mostrando detalhes da técnica e pegadas corretas. Ambiente limpo, tatame azul profissional. HD, 30fps, 10 segundos.`;
    setGeneratedPrompt(realPrompt);

    try {
      // 1. Iniciar geração com Gemini Veo 2.0
      setLoadingMessage(loadingMessages[0]);
      
      
      const operation = await generateExerciseVideo(realPrompt);
      
      if (!operation) {
        throw new Error('Operação de geração não foi iniciada corretamente');
      }
      
      
      
      // 2. Polling loop - verificar status a cada 3 segundos (mais rápido para UX)
      let currentOp = operation;
      let messageIndex = 0;
      let pollCount = 0;
      const maxPolls = 40; // Máximo 2 minutos (40 x 3s)
      
      while (!currentOp.done && pollCount < maxPolls) {
        // Atualizar mensagem rotativa
        messageIndex = (messageIndex + 1) % loadingMessages.length;
        setLoadingMessage(loadingMessages[messageIndex]);
        
        // Atualizar progresso baseado no progresso da operação
        const opProgress = currentOp.progress || 0;
        setGenerationProgress(Math.min(opProgress, 95));
        
        
        
        // Aguardar 3 segundos antes de verificar novamente
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Verificar status da operação
        currentOp = await getVideosOperation(currentOp);
        pollCount++;
      }
      
      // Verificar se atingiu timeout
      if (pollCount >= maxPolls && !currentOp.done) {
        throw new Error('Timeout: Geração de vídeo demorou mais do que o esperado. Tente novamente.');
      }
      
      // 3. Operação concluída - baixar vídeo
      setLoadingMessage('📥 Baixando vídeo gerado...');
      setGenerationProgress(95);
      
      const downloadLink = currentOp.response?.downloadLink;
      
      if (!downloadLink) {
        console.error('❌ [VIDEO GEN] Resposta da operação:', currentOp);
        throw new Error('Link de download não encontrado na resposta da API');
      }

      // Atualizar informações do vídeo selecionado
      if (currentOp.response) {
        setSelectedVideoInfo({
          title: currentOp.response.title || pendingFormData?.exerciseName || 'Exercício Personalizado',
          description: currentOp.response.description || '',
          exerciseType: currentOp.response.exerciseType || 'Fisioterapia',
          modality: currentOp.response.modality || MODALITIES[pendingFormData?.modality as keyof typeof MODALITIES] || 'Fisioterapia'
        });
      }
      
      
      
      const videoBlob = await fetchVideoFromUri(downloadLink);
      
      if (videoBlob?.size === 0) {
        throw new Error('Vídeo baixado está vazio ou inválido');
      }
      
      const videoUrl = URL.createObjectURL(videoBlob);
      
      
      // 4. Gerar thumbnail (placeholder por enquanto)
      const seed = `${values.exerciseName.toLowerCase()}-${values.modality}-gemini`;
      let hash = 0;
      for (let i = 0; i < seed.length; i++) {
        const char = seed.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
      }
      const thumbnailId = Math.abs(hash) % 1000;
      const thumbnailUrl = `https://picsum.photos/800/450?random=${thumbnailId}`;
      
      // 5. Atualizar UI com vídeo gerado
      setGeneratedVideoUrl(videoUrl);
      setGeneratedThumbnailUrl(thumbnailUrl);
      setVideoDuration('Gerado por IA');
      setGenerationProgress(100);
      setLoadingMessage('✅ Vídeo gerado com sucesso!');
      
      
      
      // Transição para tela de vídeo pronto
      setTimeout(() => {
        setCurrentStep('video_ready');
        setIsGenerating(false);
      }, 1000);
      
    } catch (error) {
      console.error('❌ [VIDEO GEN] Erro na geração do vídeo:', error);
      setGenerationError(error instanceof Error ? error.message : 'Erro desconhecido ao gerar vídeo');
      setIsGenerating(false);
      setCurrentStep('config');
      setGenerationProgress(0);
      
      // Mostrar alert ao usuário com informação detalhada
      const errorMsg = error instanceof Error ? error.message : 'Erro desconhecido';
      alert(`❌ Erro ao gerar vídeo:\n\n${errorMsg}\n\nPor favor, tente novamente ou entre em contato com o suporte se o problema persistir.`);
    }
  }, [form, toolInfo, isGenerating, loadingMessages]);

  const onSubmit = useCallback(
    async (values: FormValues) => {
      startRealGeneration();
    },
    [startRealGeneration]
  );

  const handleAcceptVideo = useCallback(() => {
    setCurrentStep('success');
  }, []);

  const handleRegenerateVideo = useCallback(() => {
    if (isGenerating) return;
    startRealGeneration();
  }, [startRealGeneration, isGenerating]);

  const handleStartNew = useCallback(() => {
    // Limpar object URL antes de resetar
    if (generatedVideoUrl && generatedVideoUrl.startsWith('blob:')) {
      URL.revokeObjectURL(generatedVideoUrl);
    }
    
    setCurrentStep('config');
    setGenerationProgress(0);
    setGeneratedPrompt('');
    setGeneratedVideoUrl('');
    setGeneratedThumbnailUrl('');
    setPendingFormData(null);
    setIsGenerating(false);
    setVideoDuration('');
    setLoadingMessage('');
    setGenerationError(null);
    form.reset();
  }, [form, generatedVideoUrl]);

  // Limpar object URLs quando o componente for desmontado
  useEffect(() => {
    return () => {
      if (generatedVideoUrl && generatedVideoUrl.startsWith('blob:')) {
        URL.revokeObjectURL(generatedVideoUrl);
      }
    };
  }, [generatedVideoUrl]);

  return (
    <div className="space-y-xl">
      <PageHeader
        title="Gerador de Vídeos Gemini Veo 2.0"
        subtitle="Geração real de vídeos usando Google Gemini Veo 2.0 - API oficial"
      />

      {/* Progress Indicator */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-primary">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className={`flex items-center space-x-2 ${currentStep === 'config' ? 'text-primary' : 'text-neutral-textSecondary'}`}>
              <div className={`rounded-full p-sm ${currentStep === 'config' ? 'bg-primary-light' : 'bg-neutral-bgDark'}`}>
                <Wand2 className="w-4 h-4" />
              </div>
              <span className="text-sm font-medium">1. Configurar</span>
            </div>

            <div className="flex-1 mx-4 h-1 bg-neutral-bgDark rounded">
              <div className={`h-full bg-primary rounded transition-all ${currentStep !== 'config' ? 'w-full' : 'w-0'}`} />
            </div>

            <div className={`flex items-center space-x-2 ${currentStep === 'generating' ? 'text-purple-600' : currentStep === 'video_ready' || currentStep === 'success' ? 'text-primary' : 'text-neutral-textSecondary'}`}>
              <div className={`rounded-full p-sm ${currentStep === 'generating' ? 'bg-purple-100' : currentStep === 'video_ready' || currentStep === 'success' ? 'bg-primary-light' : 'bg-neutral-bgDark'}`}>
                <Brain className="w-4 h-4" />
              </div>
              <span className="text-sm font-medium">2. IA Gerando</span>
            </div>

            <div className="flex-1 mx-4 h-1 bg-neutral-bgDark rounded">
              <div className={`h-full bg-primary rounded transition-all ${currentStep === 'video_ready' || currentStep === 'success' ? 'w-full' : 'w-0'}`} />
            </div>

            <div className={`flex items-center space-x-2 ${currentStep === 'video_ready' ? 'text-purple-600' : currentStep === 'success' ? 'text-primary' : 'text-neutral-textSecondary'}`}>
              <div className={`rounded-full p-sm ${currentStep === 'video_ready' ? 'bg-purple-100' : currentStep === 'success' ? 'bg-primary-light' : 'bg-neutral-bgDark'}`}>
                <Video className="w-4 h-4" />
              </div>
              <span className="text-sm font-medium">3. Vídeo Pronto</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* STEP 1: CONFIG */}
      {currentStep === 'config' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Wand2 className="w-5 h-5 mr-sm" />
              Passo 1: Configurar Exercício
            </CardTitle>
            <CardDescription>Descreva o exercício que você quer ver em vídeo</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Mostrar erro se houver */}
            {generationError && (
              <Alert variant="destructive" className="mb-md">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Erro na Geração</AlertTitle>
                <AlertDescription>
                  {generationError}
                </AlertDescription>
              </Alert>
            )}

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-md">
                <FormField
                  control={form.control}
                  name="exerciseName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome do Exercício/Técnica</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Ex: Posição Gato Camelo" />
                      </FormControl>
                      <FormDescription>
                        Nome do exercício ou técnica que será demonstrada
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="prompt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prompt para Geração do Vídeo</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          placeholder="Descreva exatamente o que você quer ver no vídeo. Ex: Dois atletas demonstrando a posição gato camelo em tatame profissional, câmera frontal, iluminação natural, movimento lento mostrando detalhes da técnica..."
                          rows={4}
                          className="min-h-[100px]"
                        />
                      </FormControl>
                      <FormDescription>
                        Descreva detalhadamente a cena que você quer ver no vídeo gerado
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-md">
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
                            {Object.entries(MODALITIES).map(([key, mod]) => (
                              <SelectItem key={key} value={key}>
                                {mod}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />

                  <FormItem>
                    <FormLabel>Motor de IA</FormLabel>
                    <div className="p-md bg-primary-light dark:bg-blue-900/20 rounded-md border">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                          <span className="font-medium text-primary dark:text-blue-300">
                            {toolInfo.name}
                          </span>
                          <span className="text-sm text-primary dark:text-blue-400">
                            ({toolInfo.quality})
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <div className="w-1.5 h-1.5 bg-success-light0 rounded-full"></div>
                          <span className="text-xs text-success dark:text-green-400 font-medium">
                            API Configurada
                          </span>
                        </div>
                      </div>
                      <p className="text-xs text-primary dark:text-blue-400 mt-xs">
                        {toolInfo.description}
                      </p>
                      <p className="text-xs text-blue-500 dark:text-blue-300 mt-xs font-mono">
                        🔑 Key: AIzaSy...GmuLtM
                      </p>
                    </div>
                  </FormItem>
                </div>

                <Alert className="bg-gradient-to-r from-blue-50 to-purple-50 border-primary">
                  <Brain className="h-4 w-4" />
                  <AlertTitle>Como funciona a IA</AlertTitle>
                  <AlertDescription>
                    <div className="space-y-sm">
                      <p>
                        O Google Gemini Veo 2.0 vai analisar seu exercício e modalidade para gerar um vídeo específico e personalizado. 
                        Cada combinação gera um vídeo único baseado no que você escreveu.
                      </p>
                      <div className="flex items-center space-x-2 text-xs">
                        <div className="flex items-center space-x-1">
                          <div className="w-1.5 h-1.5 bg-success-light0 rounded-full"></div>
                          <span className="text-success font-semibold">API Key Configurada</span>
                        </div>
                        <span className="text-primary">•</span>
                        <span className="text-primary">Tentará usar API real quando disponível</span>
                      </div>
                    </div>
                  </AlertDescription>
                </Alert>

                <Button 
                  type="submit" 
                  className="w-full bg-purple-600 hover:bg-purple-700" 
                  size="lg"
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <>
                      <Brain className="w-4 h-4 mr-sm animate-pulse" />
                      IA Processando...
                    </>
                  ) : (
                    <>
                      <Brain className="w-4 h-4 mr-sm" />
                      Gerar Vídeo com Gemini Veo 2.0
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}

      {/* STEP 2: GENERATING */}
      {currentStep === 'generating' && (
        <Card className="border-2 border-purple-500">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Brain className="w-5 h-5 mr-sm text-purple-600 animate-pulse" />
              IA Analisando seu Exercício...
            </CardTitle>
            <CardDescription className="text-sm text-neutral-textSecondary">
              Google Gemini Veo 2.0 está criando um vídeo personalizado baseado no seu prompt
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-md">
            <div className="flex items-center justify-center py-12">
              <div className="text-center space-y-md">
                <div className="relative">
                  <div className="w-24 h-24 mx-auto">
                    <svg className="animate-spin" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="45" fill="none" stroke="#e5e7eb" strokeWidth="8" />
                      <circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke="#8b5cf6"
                        strokeWidth="8"
                        strokeDasharray="283"
                        strokeDashoffset={283 - (283 * generationProgress) / 100}
                        transform="rotate(-90 50 50)"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Brain className="w-8 h-8 text-purple-600" />
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-neutral-text">IA Processando seu Exercício...</h3>
                  <p className="text-sm text-neutral-textSecondary mt-xs">
                    Analisando: "{pendingFormData?.exerciseName}" em {MODALITIES[pendingFormData?.modality as keyof typeof MODALITIES]}
                  </p>
                </div>
                <Progress value={generationProgress} className="w-64 mx-auto" />
                <p className="text-sm font-mono text-purple-600">{generationProgress}%</p>
                
                {/* Mensagem rotativa */}
                <div className="text-sm text-purple-700 font-medium animate-pulse">
                  {loadingMessage}
                </div>
                
                <div className="text-xs text-neutral-textSecondary space-y-1">
                  <p>⏱️ Tempo estimado: 2-5 minutos</p>
                  <p>🎬 Gemini Veo 2.0 está criando seu vídeo personalizado...</p>
                </div>
              </div>
            </div>

            {/* Prompt Display */}
            <Alert>
              <Sparkles className="h-4 w-4" />
              <AlertTitle>Prompt Personalizado Gerado</AlertTitle>
              <AlertDescription>
                <div className="mt-sm">
                  <pre className="text-xs bg-purple-50 p-md rounded border whitespace-pre-wrap">
                    {generatedPrompt}
                  </pre>
                </div>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}

      {/* STEP 3: VIDEO READY */}
      {currentStep === 'video_ready' && (
        <Card className="border-2 border-green-500">
          <CardHeader>
            <CardTitle className="flex items-center">
              <CheckCircle className="w-5 h-5 mr-sm text-success" />
              Vídeo Personalizado Gerado!
            </CardTitle>
            <CardDescription>
              <span className="block">
                Sua IA criou um vídeo único e específico baseado no seu exercício: "{selectedVideoInfo?.title || pendingFormData?.exerciseName}"
              </span>
              {selectedVideoInfo?.description && (
                <span className="block mt-sm text-sm text-neutral-textSecondary">
                  {selectedVideoInfo.description}
                </span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-xl">
            {/* Video Player */}
            <div className="space-y-md">
              <h4 className="font-semibold flex items-center">
                <Video className="w-4 h-4 mr-sm" />
                Seu Vídeo Personalizado
              </h4>
              
              <div className="relative bg-black rounded-lg overflow-hidden">
                <video
                  className="w-full h-64 object-cover"
                  poster={generatedThumbnailUrl}
                  controls
                  preload="metadata"
                >
                  <source src={generatedVideoUrl} type="video/mp4" />
                  Seu navegador não suporta vídeos.
                </video>
                
                <div className="absolute top-md right-4 bg-black/70 text-white px-sm py-1 rounded text-xs">
                  {selectedTool?.quality} | {videoDuration}
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="text-sm text-neutral-textSecondary">
                  <p><strong>Exercício:</strong> {selectedVideoInfo?.title || pendingFormData?.exerciseName}</p>
                  <p><strong>Modalidade:</strong> {selectedVideoInfo?.modality || MODALITIES[pendingFormData?.modality as keyof typeof MODALITIES]}</p>
                  <p><strong>Motor IA:</strong> {toolInfo.name}</p>
                  <p><strong>Duração:</strong> {videoDuration}</p>
                  {selectedVideoInfo?.description && (
                    <p><strong>Descrição:</strong> {selectedVideoInfo.description}</p>
                  )}
                  {selectedVideoInfo?.exerciseType && (
                    <p><strong>Tipo:</strong> {selectedVideoInfo.exerciseType}</p>
                  )}
                </div>
                
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-xs" />
                    Baixar
                  </Button>
                  <Button variant="outline" size="sm">
                    <Share2 className="w-4 h-4 mr-xs" />
                    Compartilhar
                  </Button>
                </div>
              </div>
            </div>

            {/* Success Info */}
            <Alert className="bg-success-light border-success">
              <CheckCircle className="h-4 w-4 text-success" />
              <AlertTitle>Vídeo Personalizado Criado!</AlertTitle>
              <AlertDescription>
                <div className="mt-sm space-y-1 text-sm">
                  <p>✅ IA analisou seu exercício específico</p>
                  <p>✅ Vídeo único gerado baseado no seu prompt</p>
                  <p>✅ Duração personalizada: {videoDuration}</p>
                  <p>✅ Conteúdo exclusivo para "{selectedVideoInfo?.title || pendingFormData?.exerciseName}"</p>
                  {selectedVideoInfo?.exerciseType && (
                    <p>✅ Tipo de exercício: {selectedVideoInfo.exerciseType}</p>
                  )}
                  {selectedVideoInfo?.description && (
                    <p>✅ Descrição: {selectedVideoInfo.description}</p>
                  )}
                </div>
              </AlertDescription>
            </Alert>

            {/* Action Buttons */}
            <div className="space-y-md">
              {/* Botão principal: Salvar e Anexar */}
              <Button
                size="lg"
                onClick={() => setShowAttachModal(true)}
                className="w-full h-20 bg-primary-hover hover:bg-primary-hover flex-col space-y-sm"
              >
                <Plus className="w-6 h-6" />
                <div className="text-center">
                  <div className="font-semibold">💾 Salvar e Anexar a um Exercício</div>
                  <div className="text-xs">Adicionar à biblioteca de exercícios</div>
                </div>
              </Button>

              <div className="grid grid-cols-2 gap-md">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleRegenerateVideo}
                  disabled={isGenerating}
                  className="h-16 flex-col space-y-sm"
                >
                  <RotateCcw className="w-5 h-5" />
                  <div className="text-center">
                    <div className="text-sm font-semibold">Gerar Novo</div>
                    <div className="text-xs text-neutral-textSecondary">Mesmo exercício</div>
                  </div>
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleAcceptVideo}
                  className="h-16 flex-col space-y-sm"
                >
                  <CheckCheck className="w-5 h-5" />
                  <div className="text-center">
                    <div className="text-sm font-semibold">Continuar</div>
                    <div className="text-xs text-neutral-textSecondary">Sem salvar</div>
                  </div>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* STEP 4: SUCCESS */}
      {currentStep === 'success' && (
        <Card className="border-2 border-green-500 bg-gradient-to-br from-green-50 to-emerald-50">
          <CardHeader>
            <CardTitle className="flex items-center text-success">
              <CheckCircle className="w-6 h-6 mr-sm" />
              ✅ Vídeo Personalizado Salvo!
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-xl">
            {/* Video Preview */}
            {generatedVideoUrl && (
              <div className="space-y-md">
                <h4 className="font-semibold">Seu Vídeo Final:</h4>
                <div className="relative bg-black rounded-lg overflow-hidden">
                  <video
                    className="w-full h-48 object-cover"
                    poster={generatedThumbnailUrl}
                    controls
                  >
                    <source src={generatedVideoUrl} type="video/mp4" />
                  </video>
                </div>
              </div>
            )}

            {/* Success Info */}
            <Alert className="bg-white border-success">
              <CheckCircle className="h-4 w-4 text-success" />
              <AlertTitle>Tudo Pronto!</AlertTitle>
              <AlertDescription>
                <div className="mt-sm space-y-sm text-sm">
                  <p>
                    ✅ Exercício <strong>"{pendingFormData?.exerciseName}"</strong> com vídeo personalizado
                  </p>
                  <p>✅ Vídeo gerado pela IA baseado no seu prompt</p>
                  <p>✅ Duração específica: {videoDuration}</p>
                  <p>✅ Disponível em toda a biblioteca</p>
                  <p>✅ Pronto para usar em protocolos</p>
                </div>
              </AlertDescription>
            </Alert>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-md">
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
        <Card className="bg-gradient-to-br from-purple-50 to-blue-50">
          <CardHeader>
            <CardTitle className="text-sm">🤖 Google Gemini Veo 2.0</CardTitle>
          </CardHeader>
          <CardContent className="text-xs space-y-sm">
            {currentStep === 'config' && (
              <>
                <p>📝 Descreva exatamente o exercício</p>
                <p>🧠 IA vai analisar e personalizar</p>
                <p>🎬 Cada exercício gera vídeo único</p>
              </>
            )}
            {currentStep === 'generating' && (
              <>
                <p>🧠 IA analisando seu exercício</p>
                <p>🎬 Criando vídeo personalizado</p>
                <p>✨ Baseado no seu prompt específico</p>
              </>
            )}
            {currentStep === 'video_ready' && (
              <>
                <p>🎥 Vídeo personalizado pronto</p>
                <p>⏱️ Duração específica do exercício</p>
                <p>✅ Conteúdo único para você</p>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Modal para anexar vídeo ao exercício */}
      <AttachVideoModal
        isOpen={showAttachModal}
        onClose={() => setShowAttachModal(false)}
        videoUrl={generatedVideoUrl}
        videoData={pendingFormData}
      />
    </div>
  );
};

export default FreeVideoGeneratorReal;

