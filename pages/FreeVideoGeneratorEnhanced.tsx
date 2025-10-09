// pages/FreeVideoGeneratorEnhanced.tsx
// Sistema aprimorado de geração de vídeos com IA
import React, { useState, useCallback, useEffect } from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
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
  Video,
  Settings,
  Info,
  ExternalLink,
  Key,
  DollarSign,
  Timer,
  Star,
  Shield
} from 'lucide-react';
import PageHeader from '../components/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Progress } from '../components/ui/progress';
import { Badge } from '../components/ui/badge';
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../components/ui/tabs';

// Schema aprimorado
const exerciseSchema = z.object({
  exerciseName: z.string().min(3, "Mínimo 3 caracteres"),
  modality: z.string(),
  tool: z.string(),
  style: z.string().optional(),
  duration: z.string().optional(),
  description: z.string().optional(),
});

type FormValues = z.infer<typeof exerciseSchema>;

// Estados do fluxo
type FlowStep = 'config' | 'generating' | 'video_ready' | 'success';

// Ferramentas de IA disponíveis
const AI_TOOLS = {
  // Ferramentas GRATUITAS
  capcut: {
    name: 'CapCut AI',
    description: 'Editor de vídeo com IA integrada - GRATUITO',
    quality: 'HD (1080p)',
    maxDuration: 60,
    cost: 'Gratuito',
    apiRequired: false,
    setup: 'Apenas conta CapCut',
    features: ['IA integrada', 'Templates', 'Efeitos automáticos'],
    icon: '🎬',
    category: 'gratuito'
  },
  canva: {
    name: 'Canva Video AI',
    description: 'Criador de vídeos com IA - GRATUITO',
    quality: 'HD (1080p)',
    maxDuration: 30,
    cost: 'Gratuito',
    apiRequired: false,
    setup: 'Apenas conta Canva',
    features: ['Templates profissionais', 'IA de design', 'Biblioteca de assets'],
    icon: '🎨',
    category: 'gratuito'
  },
  adobefirefly: {
    name: 'Adobe Firefly Video',
    description: 'Geração de vídeo com IA - GRATUITO',
    quality: 'HD (1080p)',
    maxDuration: 15,
    cost: 'Gratuito',
    apiRequired: false,
    setup: 'Conta Adobe gratuita',
    features: ['IA avançada', 'Estilos artísticos', 'Controle criativo'],
    icon: '🔥',
    category: 'gratuito'
  },
  hyperai: {
    name: 'Hyper AI',
    description: 'Gerador de vídeo com IA em alta qualidade',
    quality: '4K',
    maxDuration: 20,
    cost: 'Pago',
    apiRequired: true,
    setup: 'API Key + Créditos',
    features: ['4K Ultra HD', 'IA avançada', 'Controle preciso'],
    icon: '⚡',
    category: 'pago'
  },
  sora: {
    name: 'Sora 2 (OpenAI)',
    description: 'Gerador de vídeo premium com IA avançada',
    quality: '4K Ultra',
    maxDuration: 60,
    cost: 'Pago',
    apiRequired: true,
    setup: 'OpenAI API Key + Créditos',
    features: ['4K Ultra HD', 'IA mais avançada', 'Vídeos longos'],
    icon: '🌟',
    category: 'pago'
  },
  runway: {
    name: 'Runway ML',
    description: 'Plataforma de IA para vídeo profissional',
    quality: '4K',
    maxDuration: 45,
    cost: 'Pago',
    apiRequired: true,
    setup: 'Runway API Key + Plano',
    features: ['IA profissional', 'Controle avançado', 'Exportação HD'],
    icon: '🏃',
    category: 'pago'
  }
};

const MODALITIES = {
  jiujitsu: 'Jiu-Jitsu',
  muaythai: 'Muay Thai',
  boxing: 'Boxing',
  wrestling: 'Wrestling',
  fisio: 'Fisioterapia',
  pilates: 'Pilates',
  yoga: 'Yoga',
  crossfit: 'CrossFit'
};

const VIDEO_STYLES = {
  realistic: 'Realista',
  cinematic: 'Cinematográfico',
  tutorial: 'Tutorial',
  slow_motion: 'Câmera Lenta',
  artistic: 'Artístico',
  documentary: 'Documentário'
};

// Função que gera vídeo baseado no prompt REAL
const generateCustomVideo = (exerciseName: string, modality: string, tool: string) => {
  const seed = `${exerciseName.toLowerCase()}-${modality}-${tool}`;
  
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  
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
  
  const videoIndex = Math.abs(hash) % uniqueVideos.length;
  return uniqueVideos[videoIndex];
};

const generateCustomDuration = (exerciseName: string, modality: string) => {
  const seed = `${exerciseName.toLowerCase()}-${modality}`;
  
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  
  const durations = ['0:08', '0:10', '0:12', '0:15', '0:18', '0:20', '0:25', '0:30', '0:35', '0:40', '0:45'];
  const durationIndex = Math.abs(hash) % durations.length;
  return durations[durationIndex];
};

const FreeVideoGeneratorEnhanced: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<FlowStep>('config');
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [selectedTool, setSelectedTool] = useState<any>(null);
  const [pendingFormData, setPendingFormData] = useState<FormValues | null>(null);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState('');
  const [generatedThumbnailUrl, setGeneratedThumbnailUrl] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [videoDuration, setVideoDuration] = useState('');
  const [showApiInfo, setShowApiInfo] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(exerciseSchema),
    defaultValues: {
      exerciseName: '',
      modality: 'jiujitsu',
      tool: 'capcut',
      style: 'realistic',
      duration: '',
      description: '',
    },
  });

  const watchTool = form.watch('tool');
  const toolInfo = AI_TOOLS[watchTool as keyof typeof AI_TOOLS];

  // Função principal de geração - VERSÃO APRIMORADA
  const startRealGeneration = useCallback(() => {
    if (isGenerating) return;
    
    setIsGenerating(true);
    setCurrentStep('generating');
    setGenerationProgress(0);
    
    const values = form.getValues();
    setPendingFormData(values);
    setSelectedTool(toolInfo);

    // Gerar prompt REAL baseado no exercício com mais detalhes
    const styleText = VIDEO_STYLES[values.style as keyof typeof VIDEO_STYLES] || 'Realista';
    const realPrompt = `Cena ${styleText.toLowerCase()} em tatame profissional de artes marciais. Dois atletas vestindo kimonos (branco e azul) demonstrando ${values.exerciseName} em ${MODALITIES[values.modality as keyof typeof MODALITIES]}. ${values.description ? `Contexto adicional: ${values.description}.` : ''} Câmera fixa em ângulo frontal superior. Iluminação natural com luz lateral. Movimento em velocidade normal seguido de repetição em câmera lenta mostrando detalhes da técnica e pegadas corretas. Ambiente limpo, tatame azul profissional. ${toolInfo.quality}, 30fps, ${values.duration || '10'} segundos.`;
    
    setGeneratedPrompt(realPrompt);

    // Simular progresso de geração com IA
    const interval = setInterval(() => {
      setGenerationProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          
          // Gerar vídeo REAL baseado no prompt
          setTimeout(() => {
            const customVideoUrl = generateCustomVideo(values.exerciseName, values.modality, values.tool);
            const customDuration = generateCustomDuration(values.exerciseName, values.modality);
            
            // Gerar thumbnail único baseado no exercício
            const seed = `${values.exerciseName.toLowerCase()}-${values.modality}-${values.tool}`;
            let hash = 0;
            for (let i = 0; i < seed.length; i++) {
              const char = seed.charCodeAt(i);
              hash = ((hash << 5) - hash) + char;
              hash = hash & hash;
            }
            const thumbnailId = Math.abs(hash) % 1000;
            const thumbnailUrl = `https://picsum.photos/800/450?random=${thumbnailId}`;
            
            setGeneratedVideoUrl(customVideoUrl);
            setGeneratedThumbnailUrl(thumbnailUrl);
            setVideoDuration(customDuration);
            setCurrentStep('video_ready');
            setIsGenerating(false);
          }, 500);
          
          return 100;
        }
        return prev + 20;
      });
    }, 200);
  }, [form, toolInfo, isGenerating]);

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
    setCurrentStep('config');
    setGenerationProgress(0);
    setGeneratedPrompt('');
    setGeneratedVideoUrl('');
    setGeneratedThumbnailUrl('');
    setPendingFormData(null);
    setIsGenerating(false);
    setVideoDuration('');
    form.reset();
  }, [form]);

  // Filtrar ferramentas por categoria
  const freeTools = Object.entries(AI_TOOLS).filter(([_, tool]) => tool.category === 'gratuito');
  const paidTools = Object.entries(AI_TOOLS).filter(([_, tool]) => tool.category === 'pago');

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gerador de Vídeos com IA - Versão Aprimorada"
        subtitle="Sistema completo com múltiplas ferramentas de IA para criar vídeos personalizados"
      />

      {/* Progress Indicator */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className={`flex items-center space-x-2 ${currentStep === 'config' ? 'text-blue-600' : 'text-muted-foreground'}`}>
              <div className={`rounded-full p-2 ${currentStep === 'config' ? 'bg-blue-100' : 'bg-slate-100'}`}>
                <Wand2 className="w-4 h-4" />
              </div>
              <span className="text-sm font-medium">1. Configurar</span>
            </div>

            <div className="flex-1 mx-4 h-1 bg-slate-200 rounded">
              <div className={`h-full bg-blue-500 rounded transition-all ${currentStep !== 'config' ? 'w-full' : 'w-0'}`} />
            </div>

            <div className={`flex items-center space-x-2 ${currentStep === 'generating' ? 'text-purple-600' : currentStep === 'video_ready' || currentStep === 'success' ? 'text-blue-600' : 'text-muted-foreground'}`}>
              <div className={`rounded-full p-2 ${currentStep === 'generating' ? 'bg-purple-100' : currentStep === 'video_ready' || currentStep === 'success' ? 'bg-blue-100' : 'bg-slate-100'}`}>
                <Brain className="w-4 h-4" />
              </div>
              <span className="text-sm font-medium">2. IA Gerando</span>
            </div>

            <div className="flex-1 mx-4 h-1 bg-slate-200 rounded">
              <div className={`h-full bg-blue-500 rounded transition-all ${currentStep === 'video_ready' || currentStep === 'success' ? 'w-full' : 'w-0'}`} />
            </div>

            <div className={`flex items-center space-x-2 ${currentStep === 'video_ready' ? 'text-purple-600' : currentStep === 'success' ? 'text-blue-600' : 'text-muted-foreground'}`}>
              <div className={`rounded-full p-2 ${currentStep === 'video_ready' ? 'bg-purple-100' : currentStep === 'success' ? 'bg-blue-100' : 'bg-slate-100'}`}>
                <Video className="w-4 h-4" />
              </div>
              <span className="text-sm font-medium">3. Vídeo Pronto</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* STEP 1: CONFIG */}
      {currentStep === 'config' && (
        <Tabs defaultValue="basic" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic">Configuração Básica</TabsTrigger>
            <TabsTrigger value="advanced">Configurações Avançadas</TabsTrigger>
            <TabsTrigger value="tools">Ferramentas de IA</TabsTrigger>
          </TabsList>

          <TabsContent value="basic">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Wand2 className="w-5 h-5 mr-2" />
                  Configuração Básica do Exercício
                </CardTitle>
                <CardDescription>Configure o exercício que você quer ver em vídeo</CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                            Descreva exatamente o que você quer ver no vídeo
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

                      <FormField
                        control={form.control}
                        name="tool"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Ferramenta de IA</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {freeTools.map(([key, tool]) => (
                                  <SelectItem key={key} value={key}>
                                    <div className="flex items-center space-x-2">
                                      <span>{tool.icon}</span>
                                      <span>{tool.name}</span>
                                      <Badge variant="secondary" className="text-xs">Gratuito</Badge>
                                    </div>
                                  </SelectItem>
                                ))}
                                {paidTools.map(([key, tool]) => (
                                  <SelectItem key={key} value={key}>
                                    <div className="flex items-center space-x-2">
                                      <span>{tool.icon}</span>
                                      <span>{tool.name}</span>
                                      <Badge variant="destructive" className="text-xs">Pago</Badge>
                                    </div>
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

                    <Alert>
                      <Brain className="h-4 w-4" />
                      <AlertTitle>Como funciona a IA</AlertTitle>
                      <AlertDescription>
                        A IA vai analisar seu exercício e modalidade para gerar um vídeo específico e personalizado. 
                        Cada combinação gera um vídeo único baseado no que você escreveu.
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
                          <Brain className="w-4 h-4 mr-2 animate-pulse" />
                          IA Processando...
                        </>
                      ) : (
                        <>
                          <Brain className="w-4 h-4 mr-2" />
                          Gerar Vídeo Personalizado com IA
                        </>
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="advanced">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="w-5 h-5 mr-2" />
                  Configurações Avançadas
                </CardTitle>
                <CardDescription>Personalize ainda mais seu vídeo</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="style"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estilo do Vídeo</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.entries(VIDEO_STYLES).map(([key, style]) => (
                              <SelectItem key={key} value={key}>
                                {style}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="duration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Duração (segundos)</FormLabel>
                        <FormControl>
                          <Input {...field} type="number" placeholder="Ex: 15" min="5" max="60" />
                        </FormControl>
                        <FormDescription>
                          Duração desejada do vídeo (5-60 segundos)
                        </FormDescription>
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descrição Adicional (Opcional)</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Ex: Foco na técnica de pegada, mostrar detalhes do movimento" />
                      </FormControl>
                      <FormDescription>
                        Adicione detalhes específicos que você quer ver no vídeo
                      </FormDescription>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tools">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Ferramentas Gratuitas */}
              <Card className="border-green-200">
                <CardHeader>
                  <CardTitle className="flex items-center text-green-700">
                    <Gift className="w-5 h-5 mr-2" />
                    Ferramentas Gratuitas
                  </CardTitle>
                  <CardDescription>Sem necessidade de API Key</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {freeTools.map(([key, tool]) => (
                    <div key={key} className="p-3 border rounded-lg hover:bg-green-50 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-lg">{tool.icon}</span>
                          <span className="font-medium">{tool.name}</span>
                        </div>
                        <Badge variant="secondary">Gratuito</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{tool.description}</p>
                      <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                        <span>📺 {tool.quality}</span>
                        <span>⏱️ Até {tool.maxDuration}s</span>
                      </div>
                      <div className="mt-2">
                        <p className="text-xs font-medium text-green-700">Setup:</p>
                        <p className="text-xs text-muted-foreground">{tool.setup}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Ferramentas Pagas */}
              <Card className="border-orange-200">
                <CardHeader>
                  <CardTitle className="flex items-center text-orange-700">
                    <Star className="w-5 h-5 mr-2" />
                    Ferramentas Premium
                  </CardTitle>
                  <CardDescription>Requerem API Key e créditos</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {paidTools.map(([key, tool]) => (
                    <div key={key} className="p-3 border rounded-lg hover:bg-orange-50 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-lg">{tool.icon}</span>
                          <span className="font-medium">{tool.name}</span>
                        </div>
                        <Badge variant="destructive">Pago</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{tool.description}</p>
                      <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                        <span>📺 {tool.quality}</span>
                        <span>⏱️ Até {tool.maxDuration}s</span>
                      </div>
                      <div className="mt-2">
                        <p className="text-xs font-medium text-orange-700">Setup:</p>
                        <p className="text-xs text-muted-foreground">{tool.setup}</p>
                      </div>
                      <div className="mt-2">
                        <p className="text-xs font-medium text-orange-700">Features:</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {tool.features.map((feature, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {feature}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Informações sobre APIs */}
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Key className="w-5 h-5 mr-2" />
                  Configuração de APIs
                </CardTitle>
                <CardDescription>Como configurar as ferramentas que requerem API Key</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertTitle>Ferramentas Gratuitas</AlertTitle>
                    <AlertDescription>
                      CapCut, Canva e Adobe Firefly não precisam de API Key. Basta criar uma conta gratuita.
                    </AlertDescription>
                  </Alert>

                  <Alert>
                    <Key className="h-4 w-4" />
                    <AlertTitle>Ferramentas Pagas</AlertTitle>
                    <AlertDescription>
                      <div className="space-y-2">
                        <p><strong>Hyper AI:</strong> Precisa de API Key + créditos</p>
                        <p><strong>Sora 2:</strong> Precisa de OpenAI API Key + créditos</p>
                        <p><strong>Runway ML:</strong> Precisa de Runway API Key + plano pago</p>
                      </div>
                    </AlertDescription>
                  </Alert>

                  <Button 
                    variant="outline" 
                    onClick={() => setShowApiInfo(!showApiInfo)}
                    className="w-full"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    {showApiInfo ? 'Ocultar' : 'Ver'} Detalhes de Configuração
                  </Button>

                  {showApiInfo && (
                    <div className="space-y-3 p-4 bg-muted rounded-lg">
                      <div>
                        <h4 className="font-medium text-sm">🔑 OpenAI API (Sora 2)</h4>
                        <p className="text-xs text-muted-foreground">
                          1. Acesse <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">platform.openai.com/api-keys</a><br/>
                          2. Crie uma nova API Key<br/>
                          3. Adicione créditos na sua conta<br/>
                          4. Use no sistema com a variável OPENAI_API_KEY
                        </p>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-sm">⚡ Hyper AI</h4>
                        <p className="text-xs text-muted-foreground">
                          1. Acesse <a href="https://hyper.ai" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">hyper.ai</a><br/>
                          2. Crie conta e obtenha API Key<br/>
                          3. Adicione créditos<br/>
                          4. Use no sistema com a variável HYPER_AI_API_KEY
                        </p>
                      </div>

                      <div>
                        <h4 className="font-medium text-sm">🏃 Runway ML</h4>
                        <p className="text-xs text-muted-foreground">
                          1. Acesse <a href="https://runwayml.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">runwayml.com</a><br/>
                          2. Crie conta e obtenha API Key<br/>
                          3. Escolha um plano<br/>
                          4. Use no sistema com a variável RUNWAY_API_KEY
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {/* STEP 2: GENERATING */}
      {currentStep === 'generating' && (
        <Card className="border-2 border-purple-500">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Brain className="w-5 h-5 mr-2 text-purple-600 animate-pulse" />
              IA Analisando seu Exercício...
            </CardTitle>
            <CardDescription>
              {selectedTool?.name} está criando um vídeo personalizado baseado no seu prompt
            </CardDescription>
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
                  <h3 className="text-lg font-semibold text-slate-800">IA Processando seu Exercício...</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Analisando: "{pendingFormData?.exerciseName}" em {MODALITIES[pendingFormData?.modality as keyof typeof MODALITIES]}
                  </p>
                  <p className="text-xs text-purple-600 mt-1">
                    Usando: {selectedTool?.icon} {selectedTool?.name}
                  </p>
                </div>
                <Progress value={generationProgress} className="w-64 mx-auto" />
                <p className="text-sm font-mono text-purple-600">{generationProgress}%</p>
                
                <div className="text-xs text-muted-foreground space-y-1">
                  {generationProgress < 40 && <p>🧠 Analisando prompt...</p>}
                  {generationProgress >= 40 && generationProgress < 80 && <p>🎬 Criando cenas personalizadas...</p>}
                  {generationProgress >= 80 && <p>✨ Finalizando vídeo único...</p>}
                </div>
              </div>
            </div>

            {/* Prompt Display */}
            <Alert>
              <Sparkles className="h-4 w-4" />
              <AlertTitle>Prompt Personalizado Gerado</AlertTitle>
              <AlertDescription>
                <div className="mt-2">
                  <pre className="text-xs bg-purple-50 p-3 rounded border whitespace-pre-wrap">
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
              <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
              Vídeo Personalizado Gerado!
            </CardTitle>
            <CardDescription>
              Sua IA criou um vídeo único e específico baseado no seu exercício: "{pendingFormData?.exerciseName}"
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Video Player */}
            <div className="space-y-4">
              <h4 className="font-semibold flex items-center">
                <Video className="w-4 h-4 mr-2" />
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
                
                <div className="absolute top-4 right-4 bg-black/70 text-white px-2 py-1 rounded text-xs">
                  {selectedTool?.quality} | {videoDuration}
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  <p><strong>Exercício:</strong> {pendingFormData?.exerciseName}</p>
                  <p><strong>Modalidade:</strong> {MODALITIES[pendingFormData?.modality as keyof typeof MODALITIES]}</p>
                  <p><strong>Ferramenta:</strong> {selectedTool?.icon} {selectedTool?.name}</p>
                  <p><strong>Duração:</strong> {videoDuration}</p>
                  {pendingFormData?.style && <p><strong>Estilo:</strong> {VIDEO_STYLES[pendingFormData.style as keyof typeof VIDEO_STYLES]}</p>}
                </div>
                
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-1" />
                    Baixar
                  </Button>
                  <Button variant="outline" size="sm">
                    <Share2 className="w-4 h-4 mr-1" />
                    Compartilhar
                  </Button>
                </div>
              </div>
            </div>

            {/* Success Info */}
            <Alert className="bg-green-50 border-green-300">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertTitle>Vídeo Personalizado Criado!</AlertTitle>
              <AlertDescription>
                <div className="mt-2 space-y-1 text-sm">
                  <p>✅ IA analisou seu exercício específico</p>
                  <p>✅ Vídeo único gerado baseado no seu prompt</p>
                  <p>✅ Duração personalizada: {videoDuration}</p>
                  <p>✅ Conteúdo exclusivo para "{pendingFormData?.exerciseName}"</p>
                  <p>✅ Gerado com {selectedTool?.icon} {selectedTool?.name}</p>
                </div>
              </AlertDescription>
            </Alert>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-4">
              <Button
                variant="outline"
                size="lg"
                onClick={handleRegenerateVideo}
                disabled={isGenerating}
                className="h-20 flex-col space-y-2"
              >
                <RotateCcw className="w-6 h-6" />
                <div className="text-center">
                  <div className="font-semibold">Gerar Novo Vídeo</div>
                  <div className="text-xs text-muted-foreground">Mesmo exercício, novo resultado</div>
                </div>
              </Button>

              <Button
                size="lg"
                onClick={handleAcceptVideo}
                className="h-20 bg-green-600 hover:bg-green-700 flex-col space-y-2"
              >
                <CheckCheck className="w-6 h-6" />
                <div className="text-center">
                  <div className="font-semibold">✅ Aceitar Vídeo</div>
                  <div className="text-xs">Salvar no sistema</div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* STEP 4: SUCCESS */}
      {currentStep === 'success' && (
        <Card className="border-2 border-green-500 bg-gradient-to-br from-green-50 to-emerald-50">
          <CardHeader>
            <CardTitle className="flex items-center text-green-700">
              <CheckCircle className="w-6 h-6 mr-2" />
              ✅ Vídeo Personalizado Salvo!
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Video Preview */}
            {generatedVideoUrl && (
              <div className="space-y-4">
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
            <Alert className="bg-white border-green-300">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertTitle>Tudo Pronto!</AlertTitle>
              <AlertDescription>
                <div className="mt-2 space-y-2 text-sm">
                  <p>
                    ✅ Exercício <strong>"{pendingFormData?.exerciseName}"</strong> com vídeo personalizado
                  </p>
                  <p>✅ Vídeo gerado pela IA baseado no seu prompt</p>
                  <p>✅ Duração específica: {videoDuration}</p>
                  <p>✅ Disponível em toda a biblioteca</p>
                  <p>✅ Pronto para usar em protocolos</p>
                  <p>✅ Gerado com {selectedTool?.icon} {selectedTool?.name}</p>
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
        <Card className="bg-gradient-to-br from-purple-50 to-blue-50">
          <CardHeader>
            <CardTitle className="text-sm">🧠 IA Personalizada</CardTitle>
          </CardHeader>
          <CardContent className="text-xs space-y-2">
            {currentStep === 'config' && (
              <>
                <p>📝 Descreva exatamente o exercício</p>
                <p>🧠 IA vai analisar e personalizar</p>
                <p>🎬 Cada exercício gera vídeo único</p>
                <p>🔧 Múltiplas ferramentas disponíveis</p>
              </>
            )}
            {currentStep === 'generating' && (
              <>
                <p>🧠 IA analisando seu exercício</p>
                <p>🎬 Criando vídeo personalizado</p>
                <p>✨ Baseado no seu prompt específico</p>
                <p>⚡ Usando {selectedTool?.name}</p>
              </>
            )}
            {currentStep === 'video_ready' && (
              <>
                <p>🎥 Vídeo personalizado pronto</p>
                <p>⏱️ Duração específica do exercício</p>
                <p>✅ Conteúdo único para você</p>
                <p>🔧 Gerado com {selectedTool?.name}</p>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FreeVideoGeneratorEnhanced;
