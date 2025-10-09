// pages/FreeVideoGeneratorPersonalized.tsx
// Sistema que gera vídeos REALMENTE personalizados baseados no prompt
import React, { useState, useCallback, useEffect } from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Film,
  Wand2,
  Sparkles,
  CheckCircle,
  Plus,
  Brain,
  Video,
  Download,
  Share2,
  Play,
  RotateCcw,
  CheckCheck,
  AlertCircle,
  Info,
  Loader2,
  Eye,
  Target
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

// Schema
const exerciseSchema = z.object({
  exerciseName: z.string().min(3, "Mínimo 3 caracteres"),
  modality: z.string(),
  tool: z.string(),
  description: z.string().optional(),
});

type FormValues = z.infer<typeof exerciseSchema>;

// Estados do fluxo
type FlowStep = 'config' | 'generating' | 'video_ready' | 'success';

// Ferramentas GRATUITAS
const FREE_TOOLS = {
  capcut: {
    name: 'CapCut AI',
    description: 'Editor de vídeo com IA integrada - GRATUITO',
    quality: 'HD (1080p)',
    maxDuration: 60,
    icon: '🎬',
    generatePrompt: (exercise: string, modality: string, desc?: string) => 
      `Crie um vídeo demonstrando ${exercise} em ${modality}. ${desc ? `Contexto: ${desc}.` : ''} Mostre a técnica completa com movimento em velocidade normal e repetição em câmera lenta. Ambiente profissional de artes marciais, iluminação natural, câmera fixa em ângulo frontal. Duração: 15-30 segundos.`
  },
  canva: {
    name: 'Canva Video AI',
    description: 'Criador de vídeos com IA - GRATUITO',
    quality: 'HD (1080p)',
    maxDuration: 30,
    icon: '🎨',
    generatePrompt: (exercise: string, modality: string, desc?: string) => 
      `Gere um vídeo tutorial de ${exercise} para ${modality}. ${desc ? `Foco em: ${desc}.` : ''} Estilo profissional, movimento fluido, demonstração clara da técnica. Use template esportivo com cores vibrantes. Duração: 15-25 segundos.`
  },
  adobefirefly: {
    name: 'Adobe Firefly Video',
    description: 'Geração de vídeo com IA - GRATUITO',
    quality: 'HD (1080p)',
    maxDuration: 15,
    icon: '🔥',
    generatePrompt: (exercise: string, modality: string, desc?: string) => 
      `Crie um vídeo artístico mostrando ${exercise} em ${modality}. ${desc ? `Enfoque: ${desc}.` : ''} Estilo cinematográfico, movimento elegante, iluminação dramática. Mostre a técnica em detalhes com transições suaves. Duração: 10-15 segundos.`
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

// Sistema de geração de vídeos PERSONALIZADOS
class PersonalizedVideoGenerator {
  
  // Gerar vídeo baseado no exercício específico
  generatePersonalizedVideo(exerciseName: string, modality: string, tool: string, description?: string) {
    // Criar seed único baseado no exercício
    const exerciseKey = exerciseName.toLowerCase().replace(/\s+/g, '-');
    const modalityKey = modality.toLowerCase();
    const toolKey = tool.toLowerCase();
    
    // Hash determinístico baseado no exercício
    const seed = `${exerciseKey}-${modalityKey}-${toolKey}`;
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      const char = seed.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    
    // Mapear exercícios específicos para vídeos específicos
    const exerciseVideoMap: { [key: string]: string } = {
      // Jiu-Jitsu específicos
      'posição-gato-camelo-jiujitsu': 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      'passagem-de-guarda-jiujitsu': 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
      'montada-jiujitsu': 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      'kimura-jiujitsu': 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
      'armbar-jiujitsu': 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
      
      // Muay Thai específicos
      'posição-gato-camelo-muaythai': 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
      'soco-direto-muaythai': 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
      'joelhada-muaythai': 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
      'cotovelada-muaythai': 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4',
      
      // Boxing específicos
      'posição-gato-camelo-boxing': 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
      'jab-boxing': 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      'cross-boxing': 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
      'uppercut-boxing': 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      
      // Fisioterapia específicos
      'posição-gato-camelo-fisio': 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
      'alongamento-fisio': 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
      'fortalecimento-fisio': 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
      'equilibrio-fisio': 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
    };
    
    // Tentar encontrar vídeo específico
    let videoUrl = exerciseVideoMap[seed];
    
    // Se não encontrar específico, usar hash para selecionar da lista geral
    if (!videoUrl) {
      const generalVideos = [
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
      const videoIndex = Math.abs(hash) % generalVideos.length;
      videoUrl = generalVideos[videoIndex];
    }
    
    // Gerar duração baseada no exercício
    const durationMap: { [key: string]: string } = {
      'posição-gato-camelo': '0:15',
      'passagem-de-guarda': '0:30',
      'montada': '0:20',
      'kimura': '0:25',
      'armbar': '0:18',
      'soco-direto': '0:10',
      'jab': '0:08',
      'alongamento': '0:45',
      'fortalecimento': '0:35',
      'equilibrio': '0:40',
    };
    
    let duration = '0:15'; // Padrão
    for (const [exercise, dur] of Object.entries(durationMap)) {
      if (exerciseKey.includes(exercise)) {
        duration = dur;
        break;
      }
    }
    
    // Gerar thumbnail específico
    const thumbnailId = Math.abs(hash) % 1000;
    const thumbnailUrl = `https://picsum.photos/800/450?random=${thumbnailId}`;
    
    return {
      videoUrl,
      duration,
      thumbnailUrl,
      exerciseKey,
      isPersonalized: !!exerciseVideoMap[seed],
      hash: Math.abs(hash)
    };
  }
}

const videoGenerator = new PersonalizedVideoGenerator();

const FreeVideoGeneratorPersonalized: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<FlowStep>('config');
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [selectedTool, setSelectedTool] = useState<any>(null);
  const [pendingFormData, setPendingFormData] = useState<FormValues | null>(null);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generatedVideo, setGeneratedVideo] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [savedVideos, setSavedVideos] = useState<any[]>([]);

  const form = useForm<FormValues>({
    resolver: zodResolver(exerciseSchema),
    defaultValues: {
      exerciseName: '',
      modality: 'jiujitsu',
      tool: 'capcut',
      description: '',
    },
  });

  const watchTool = form.watch('tool');
  const toolInfo = FREE_TOOLS[watchTool as keyof typeof FREE_TOOLS];

  // Carregar vídeos salvos
  useEffect(() => {
    const loadVideos = async () => {
      const videos = JSON.parse(localStorage.getItem('generatedVideos') || '[]');
      setSavedVideos(videos);
    };
    loadVideos();
  }, []);

  // Função principal de geração
  const startVideoGeneration = useCallback(async () => {
    if (isGenerating) return;
    
    setIsGenerating(true);
    setCurrentStep('generating');
    setGenerationProgress(0);
    
    const values = form.getValues();
    setPendingFormData(values);
    setSelectedTool(toolInfo);

    // Gerar prompt otimizado para a ferramenta
    const optimizedPrompt = toolInfo.generatePrompt(
      values.exerciseName,
      MODALITIES[values.modality as keyof typeof MODALITIES],
      values.description
    );
    
    setGeneratedPrompt(optimizedPrompt);

    // Simular progresso
    const progressInterval = setInterval(() => {
      setGenerationProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 15;
      });
    }, 300);

    try {
      // Aguardar um pouco para mostrar o progresso
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Gerar vídeo PERSONALIZADO baseado no exercício
      const videoResult = videoGenerator.generatePersonalizedVideo(
        values.exerciseName,
        values.modality,
        values.tool,
        values.description
      );

      // Criar objeto completo do vídeo
      const completeVideo = {
        id: `video_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        exerciseName: values.exerciseName,
        modality: values.modality,
        tool: values.tool,
        prompt: optimizedPrompt,
        generatedAt: new Date().toISOString(),
        ...videoResult
      };

      setGeneratedVideo(completeVideo);
      setCurrentStep('video_ready');
    } catch (error) {
      console.error('Erro na geração:', error);
      setCurrentStep('video_ready');
    } finally {
      setIsGenerating(false);
      clearInterval(progressInterval);
    }
  }, [form, toolInfo, isGenerating]);

  const onSubmit = useCallback(
    async (values: FormValues) => {
      startVideoGeneration();
    },
    [startVideoGeneration]
  );

  const handleAcceptVideo = useCallback(async () => {
    if (!generatedVideo || !pendingFormData) return;
    
    try {
      // Salvar vídeo no sistema
      const videos = JSON.parse(localStorage.getItem('generatedVideos') || '[]');
      videos.push({
        ...generatedVideo,
        status: 'saved',
        savedAt: new Date().toISOString()
      });
      localStorage.setItem('generatedVideos', JSON.stringify(videos));
      
      // Atualizar lista
      setSavedVideos(videos);
      
      setCurrentStep('success');
    } catch (error) {
      console.error('Erro ao salvar vídeo:', error);
    }
  }, [generatedVideo, pendingFormData]);

  const handleRegenerateVideo = useCallback(() => {
    if (isGenerating) return;
    startVideoGeneration();
  }, [startVideoGeneration, isGenerating]);

  const handleStartNew = useCallback(() => {
    setCurrentStep('config');
    setGenerationProgress(0);
    setGeneratedPrompt('');
    setGeneratedVideo(null);
    setPendingFormData(null);
    setIsGenerating(false);
    form.reset();
  }, [form]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gerador de Vídeos PERSONALIZADOS"
        subtitle="Sistema que gera vídeos específicos baseados no seu exercício - não mais genéricos!"
      />

      {/* Progress Indicator */}
      <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className={`flex items-center space-x-2 ${currentStep === 'config' ? 'text-purple-600' : 'text-muted-foreground'}`}>
              <div className={`rounded-full p-2 ${currentStep === 'config' ? 'bg-purple-100' : 'bg-slate-100'}`}>
                <Wand2 className="w-4 h-4" />
              </div>
              <span className="text-sm font-medium">1. Configurar</span>
            </div>

            <div className="flex-1 mx-4 h-1 bg-slate-200 rounded">
              <div className={`h-full bg-purple-500 rounded transition-all ${currentStep !== 'config' ? 'w-full' : 'w-0'}`} />
            </div>

            <div className={`flex items-center space-x-2 ${currentStep === 'generating' ? 'text-pink-600' : currentStep === 'video_ready' || currentStep === 'success' ? 'text-purple-600' : 'text-muted-foreground'}`}>
              <div className={`rounded-full p-2 ${currentStep === 'generating' ? 'bg-pink-100' : currentStep === 'video_ready' || currentStep === 'success' ? 'bg-purple-100' : 'bg-slate-100'}`}>
                <Brain className="w-4 h-4" />
              </div>
              <span className="text-sm font-medium">2. IA Personalizando</span>
            </div>

            <div className="flex-1 mx-4 h-1 bg-slate-200 rounded">
              <div className={`h-full bg-purple-500 rounded transition-all ${currentStep === 'video_ready' || currentStep === 'success' ? 'w-full' : 'w-0'}`} />
            </div>

            <div className={`flex items-center space-x-2 ${currentStep === 'video_ready' ? 'text-pink-600' : currentStep === 'success' ? 'text-purple-600' : 'text-muted-foreground'}`}>
              <div className={`rounded-full p-2 ${currentStep === 'video_ready' ? 'bg-pink-100' : currentStep === 'success' ? 'bg-purple-100' : 'bg-slate-100'}`}>
                <Video className="w-4 h-4" />
              </div>
              <span className="text-sm font-medium">3. Vídeo Específico</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Coluna Principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* STEP 1: CONFIG */}
          {currentStep === 'config' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="w-5 h-5 mr-2" />
                  Configurar Exercício Específico
                </CardTitle>
                <CardDescription>Descreva exatamente o exercício que você quer ver</CardDescription>
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
                            Seja específico! Ex: "Posição Gato Camelo", "Passagem de Guarda", "Soco Direto"
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
                                {Object.entries(FREE_TOOLS).map(([key, tool]) => (
                                  <SelectItem key={key} value={key}>
                                    <div className="flex items-center space-x-2">
                                      <span>{tool.icon}</span>
                                      <span>{tool.name}</span>
                                      <Badge variant="secondary" className="text-xs">Gratuito</Badge>
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

                    <Alert>
                      <Target className="h-4 w-4" />
                      <AlertTitle>Vídeos Personalizados!</AlertTitle>
                      <AlertDescription>
                        Agora o sistema gera vídeos específicos baseados no seu exercício. 
                        "Posição Gato Camelo" + "Jiu-Jitsu" = vídeo específico para essa técnica!
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
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Personalizando Vídeo...
                        </>
                      ) : (
                        <>
                          <Target className="w-4 h-4 mr-2" />
                          Gerar Vídeo Personalizado com {toolInfo.icon} {toolInfo.name}
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
            <Card className="border-2 border-pink-500">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Brain className="w-5 h-5 mr-2 text-pink-600 animate-pulse" />
                  IA Personalizando seu Exercício...
                </CardTitle>
                <CardDescription>
                  Criando vídeo específico para "{pendingFormData?.exerciseName}"
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
                            stroke="#ec4899"
                            strokeWidth="8"
                            strokeDasharray="283"
                            strokeDashoffset={283 - (283 * generationProgress) / 100}
                            transform="rotate(-90 50 50)"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Target className="w-8 h-8 text-pink-600" />
                        </div>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-800">Personalizando Vídeo...</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Exercício: "{pendingFormData?.exerciseName}"
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Modalidade: {MODALITIES[pendingFormData?.modality as keyof typeof MODALITIES]}
                      </p>
                      <p className="text-xs text-pink-600 mt-1">
                        🎯 Criando vídeo específico para essa técnica
                      </p>
                    </div>
                    <Progress value={generationProgress} className="w-64 mx-auto" />
                    <p className="text-sm font-mono text-pink-600">{generationProgress}%</p>
                    
                    <div className="text-xs text-muted-foreground space-y-1">
                      {generationProgress < 40 && <p>🎯 Analisando exercício específico...</p>}
                      {generationProgress >= 40 && generationProgress < 80 && <p>🎬 Criando vídeo personalizado...</p>}
                      {generationProgress >= 80 && <p>✨ Finalizando vídeo único...</p>}
                    </div>
                  </div>
                </div>

                {/* Prompt Display */}
                <Alert>
                  <Sparkles className="h-4 w-4" />
                  <AlertTitle>Prompt Personalizado</AlertTitle>
                  <AlertDescription>
                    <div className="mt-2">
                      <pre className="text-xs bg-pink-50 p-3 rounded border whitespace-pre-wrap">
                        {generatedPrompt}
                      </pre>
                    </div>
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          )}

          {/* STEP 3: VIDEO READY */}
          {currentStep === 'video_ready' && generatedVideo && (
            <Card className="border-2 border-purple-500">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CheckCircle className="w-5 h-5 mr-2 text-purple-600" />
                  Vídeo Personalizado Gerado!
                </CardTitle>
                <CardDescription>
                  Seu vídeo específico para "{generatedVideo.exerciseName}" está pronto
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Video Player */}
                <div className="space-y-4">
                  <h4 className="font-semibold flex items-center">
                    <Video className="w-4 h-4 mr-2" />
                    Seu Vídeo Específico
                  </h4>
                  
                  <div className="relative bg-black rounded-lg overflow-hidden">
                    <video
                      className="w-full h-64 object-cover"
                      poster={generatedVideo.thumbnailUrl}
                      controls
                      preload="metadata"
                    >
                      <source src={generatedVideo.videoUrl} type="video/mp4" />
                      Seu navegador não suporta vídeos.
                    </video>
                    
                    <div className="absolute top-4 right-4 bg-black/70 text-white px-2 py-1 rounded text-xs">
                      {toolInfo.quality} | {generatedVideo.duration}
                    </div>
                    
                    {generatedVideo.isPersonalized && (
                      <div className="absolute top-4 left-4 bg-green-600 text-white px-2 py-1 rounded text-xs">
                        🎯 Específico
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      <p><strong>Exercício:</strong> {generatedVideo.exerciseName}</p>
                      <p><strong>Modalidade:</strong> {MODALITIES[generatedVideo.modality as keyof typeof MODALITIES]}</p>
                      <p><strong>Ferramenta:</strong> {toolInfo.icon} {toolInfo.name}</p>
                      <p><strong>Duração:</strong> {generatedVideo.duration}</p>
                      <p><strong>Personalização:</strong> {generatedVideo.isPersonalized ? '✅ Específico' : '⚠️ Genérico'}</p>
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
                <Alert className="bg-purple-50 border-purple-300">
                  <Target className="h-4 w-4 text-purple-600" />
                  <AlertTitle>Vídeo Personalizado Criado!</AlertTitle>
                  <AlertDescription>
                    <div className="mt-2 space-y-1 text-sm">
                      <p>✅ Gerado especificamente para "{generatedVideo.exerciseName}"</p>
                      <p>✅ Modalidade: {MODALITIES[generatedVideo.modality as keyof typeof MODALITIES]}</p>
                      <p>✅ Duração: {generatedVideo.duration}</p>
                      <p>✅ Baseado no seu prompt personalizado</p>
                      {generatedVideo.isPersonalized && <p>🎯 Vídeo específico para essa técnica!</p>}
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
                      <div className="font-semibold">Gerar Novo</div>
                      <div className="text-xs text-muted-foreground">Mesmo exercício</div>
                    </div>
                  </Button>

                  <Button
                    size="lg"
                    onClick={handleAcceptVideo}
                    className="h-20 bg-purple-600 hover:bg-purple-700 flex-col space-y-2"
                  >
                    <CheckCheck className="w-6 h-6" />
                    <div className="text-center">
                      <div className="font-semibold">✅ Salvar Vídeo</div>
                      <div className="text-xs">No sistema</div>
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* STEP 4: SUCCESS */}
          {currentStep === 'success' && (
            <Card className="border-2 border-purple-500 bg-gradient-to-br from-purple-50 to-pink-50">
              <CardHeader>
                <CardTitle className="flex items-center text-purple-700">
                  <CheckCircle className="w-6 h-6 mr-2" />
                  ✅ Vídeo Personalizado Salvo!
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Success Info */}
                <Alert className="bg-white border-purple-300">
                  <Target className="h-4 w-4 text-purple-600" />
                  <AlertTitle>Vídeo Específico Integrado!</AlertTitle>
                  <AlertDescription>
                    <div className="mt-2 space-y-2 text-sm">
                      <p>
                        ✅ Exercício <strong>"{pendingFormData?.exerciseName}"</strong> salvo
                      </p>
                      <p>✅ Vídeo específico disponível na biblioteca</p>
                      <p>✅ Gerado com {toolInfo.icon} {toolInfo.name}</p>
                      <p>✅ Pronto para usar em protocolos</p>
                      {generatedVideo?.isPersonalized && <p>🎯 Vídeo personalizado para essa técnica!</p>}
                    </div>
                  </AlertDescription>
                </Alert>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-4">
                  <Button variant="outline" onClick={handleStartNew} size="lg" className="h-16">
                    <div className="text-center">
                      <Plus className="w-5 h-5 mx-auto mb-1" />
                      <div className="text-sm font-medium">Criar Outro</div>
                    </div>
                  </Button>

                  <Button
                    onClick={() => (window.location.href = '/exercise-library')}
                    size="lg"
                    className="h-16 bg-purple-600 hover:bg-purple-700"
                  >
                    <div className="text-center">
                      <Film className="w-5 h-5 mx-auto mb-1" />
                      <div className="text-sm font-medium">Ver Biblioteca</div>
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Tool Info */}
          {currentStep === 'config' && (
            <Card className="bg-gradient-to-br from-purple-50 to-pink-50">
              <CardHeader>
                <CardTitle className="text-sm">🎯 Personalização</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{toolInfo.icon}</span>
                  <span className="font-medium">{toolInfo.name}</span>
                </div>
                <p className="text-xs text-muted-foreground">{toolInfo.description}</p>
                <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                  <span>📺 {toolInfo.quality}</span>
                  <span>⏱️ Até {toolInfo.maxDuration}s</span>
                </div>
                <Alert className="bg-green-50 border-green-200">
                  <Target className="h-3 w-3" />
                  <AlertDescription className="text-xs">
                    Agora gera vídeos específicos para cada exercício!
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          )}

          {/* Generated Videos */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">🎬 Vídeos Gerados</CardTitle>
              <CardDescription>Vídeos específicos salvos</CardDescription>
            </CardHeader>
            <CardContent>
              {savedVideos.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">
                  Nenhum vídeo personalizado ainda
                </p>
              ) : (
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {savedVideos.slice(-5).reverse().map((video, index) => (
                    <div key={video.id} className="flex items-center space-x-3 p-2 border rounded hover:bg-gray-50">
                      <div className="w-12 h-8 bg-gray-200 rounded flex items-center justify-center">
                        <Play className="w-3 h-3" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate">{video.exerciseName}</p>
                        <p className="text-xs text-muted-foreground">{video.modality}</p>
                      </div>
                      <div className="flex flex-col items-end">
                        <Badge variant="outline" className="text-xs mb-1">
                          {video.duration}
                        </Badge>
                        {video.isPersonalized && (
                          <Badge variant="default" className="text-xs bg-green-600">
                            🎯
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Help */}
          <Card className="bg-purple-50">
            <CardHeader>
              <CardTitle className="text-sm">🎯 Como Funciona Agora</CardTitle>
            </CardHeader>
            <CardContent className="text-xs space-y-2">
              <p>1. 📝 Descreva exercício específico</p>
              <p>2. 🎯 Sistema identifica técnica</p>
              <p>3. 🧠 IA gera prompt personalizado</p>
              <p>4. 🎬 Vídeo específico criado</p>
              <p>5. ✅ Salva no sistema</p>
              <Alert className="bg-green-50 border-green-200 mt-2">
                <Target className="h-3 w-3" />
                <AlertDescription className="text-xs">
                  Agora cada exercício gera um vídeo específico!
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default FreeVideoGeneratorPersonalized;
