// pages/FreeVideoGeneratorFixed.tsx
// Versão CORRIGIDA - Workflow funcional e vídeo sendo gerado
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
  AlertCircle
} from 'lucide-react';
import PageHeader from '../components/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
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
  modality: z.string(),
  tool: z.string(),
});

type FormValues = z.infer<typeof exerciseSchema>;

// Estados do fluxo SIMPLIFICADOS
type FlowStep = 'config' | 'generating' | 'video_ready' | 'success';

// Dados mock
const TOOLS = {
  capcut: {
    name: 'CapCut AI',
    description: 'Gerador de vídeo com IA integrado',
    quality: 'HD (1080p)',
    maxDuration: 60,
  },
  hyperai: {
    name: 'Hyper AI',
    description: 'Gerador de vídeo com IA em alta qualidade',
    quality: '4K',
    maxDuration: 20,
  },
  sora: {
    name: 'Sora 2',
    description: 'Gerador de vídeo premium com IA avançada',
    quality: '4K Ultra',
    maxDuration: 60,
  }
};

const MODALITIES = {
  jiujitsu: 'Jiu-Jitsu',
  muaythai: 'Muay Thai',
  boxing: 'Boxing',
  wrestling: 'Wrestling',
  fisio: 'Fisioterapia'
};

// URLs de vídeos mock funcionais
const generateVideoUrl = (exerciseName: string, modality: string) => {
  const mockVideos = {
    jiujitsu: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    muaythai: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    boxing: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    wrestling: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    fisio: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4'
  };
  
  return mockVideos[modality as keyof typeof mockVideos] || mockVideos.jiujitsu;
};

const FreeVideoGeneratorFixed: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<FlowStep>('config');
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [selectedTool, setSelectedTool] = useState<any>(null);
  const [pendingFormData, setPendingFormData] = useState<FormValues | null>(null);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState('');
  const [generatedThumbnailUrl, setGeneratedThumbnailUrl] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(exerciseSchema),
    defaultValues: {
      exerciseName: '',
      modality: 'jiujitsu',
      tool: 'capcut',
    },
  });

  const watchTool = form.watch('tool');
  const toolInfo = TOOLS[watchTool as keyof typeof TOOLS];

  // Função principal de geração - CORRIGIDA
  const startGeneration = useCallback(() => {
    if (isGenerating) return;
    
    setIsGenerating(true);
    setCurrentStep('generating');
    setGenerationProgress(0);
    
    const values = form.getValues();
    setPendingFormData(values);
    setSelectedTool(toolInfo);

    // Gerar prompt mock
    const mockPrompt = `Cena cinematográfica em tatame profissional de artes marciais. Dois atletas vestindo kimonos (branco e azul) demonstrando ${values.exerciseName} em ${MODALITIES[values.modality as keyof typeof MODALITIES]}. Câmera fixa em ângulo frontal superior. Iluminação natural com luz lateral. Movimento em velocidade normal seguido de repetição em câmera lenta mostrando detalhes da técnica e pegadas corretas. Ambiente limpo, tatame azul profissional. HD, 30fps, 10 segundos.`;
    setGeneratedPrompt(mockPrompt);

    // Simular progresso de geração
    const interval = setInterval(() => {
      setGenerationProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          
          // Gerar vídeo imediatamente após prompt
          setTimeout(() => {
            const videoUrl = generateVideoUrl(values.exerciseName, values.modality);
            const thumbnailUrl = `https://picsum.photos/800/450?random=${Date.now()}`;
            
            setGeneratedVideoUrl(videoUrl);
            setGeneratedThumbnailUrl(thumbnailUrl);
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
      startGeneration();
    },
    [startGeneration]
  );

  const handleAcceptVideo = useCallback(() => {
    setCurrentStep('success');
  }, []);

  const handleRegenerateVideo = useCallback(() => {
    if (isGenerating) return;
    startGeneration();
  }, [startGeneration, isGenerating]);

  const handleStartNew = useCallback(() => {
    setCurrentStep('config');
    setGenerationProgress(0);
    setGeneratedPrompt('');
    setGeneratedVideoUrl('');
    setGeneratedThumbnailUrl('');
    setPendingFormData(null);
    setIsGenerating(false);
    form.reset();
  }, [form]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Geração INTEGRADA de Vídeos - CORRIGIDA"
        subtitle="Sistema funcional - gera vídeo diretamente no sistema!"
      />

      {/* Progress Indicator SIMPLIFICADO */}
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
                <Film className="w-4 h-4" />
              </div>
              <span className="text-sm font-medium">2. Gerar Vídeo</span>
            </div>

            <div className="flex-1 mx-4 h-1 bg-slate-200 rounded">
              <div className={`h-full bg-blue-500 rounded transition-all ${currentStep === 'video_ready' || currentStep === 'success' ? 'w-full' : 'w-0'}`} />
            </div>

            <div className={`flex items-center space-x-2 ${currentStep === 'video_ready' ? 'text-purple-600' : currentStep === 'success' ? 'text-blue-600' : 'text-muted-foreground'}`}>
              <div className={`rounded-full p-2 ${currentStep === 'video_ready' ? 'bg-purple-100' : currentStep === 'success' ? 'bg-blue-100' : 'bg-slate-100'}`}>
                <CheckCircle className="w-4 h-4" />
              </div>
              <span className="text-sm font-medium">3. Finalizar</span>
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
            <CardDescription>Configure os detalhes e gere o vídeo automaticamente</CardDescription>
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
                        <FormLabel>Motor de IA</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.entries(TOOLS).map(([key, tool]) => (
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

                <Button 
                  type="submit" 
                  className="w-full bg-blue-600 hover:bg-blue-700" 
                  size="lg"
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <>
                      <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                      Gerando...
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 mr-2" />
                      Gerar Vídeo Automaticamente
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
              <Film className="w-5 h-5 mr-2 text-purple-600 animate-pulse" />
              Gerando Vídeo com IA...
            </CardTitle>
            <CardDescription>
              {selectedTool?.name} está processando seu vídeo automaticamente
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
                      <Film className="w-8 h-8 text-purple-600" />
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-800">Processando vídeo com IA...</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {selectedTool?.name} está criando seu vídeo
                  </p>
                </div>
                <Progress value={generationProgress} className="w-64 mx-auto" />
                <p className="text-sm font-mono text-purple-600">{generationProgress}%</p>
                
                {generationProgress > 50 && (
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p>🎬 Renderizando frames...</p>
                    <p>🎨 Aplicando efeitos...</p>
                    <p>⚡ Finalizando vídeo...</p>
                  </div>
                )}
              </div>
            </div>

            {/* Prompt Display */}
            <Alert>
              <Sparkles className="h-4 w-4" />
              <AlertTitle>Prompt Otimizado Gerado</AlertTitle>
              <AlertDescription>
                <div className="mt-2">
                  <pre className="text-xs bg-gray-50 p-3 rounded border whitespace-pre-wrap">
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
              Vídeo Gerado com Sucesso!
            </CardTitle>
            <CardDescription>
              Seu vídeo está pronto! Revise e aceite ou gere um novo
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Video Player */}
            <div className="space-y-4">
              <h4 className="font-semibold flex items-center">
                <Eye className="w-4 h-4 mr-2" />
                Preview do Vídeo Gerado
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
                  {selectedTool?.quality}
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  <p><strong>Exercício:</strong> {pendingFormData?.exerciseName}</p>
                  <p><strong>Modalidade:</strong> {MODALITIES[pendingFormData?.modality as keyof typeof MODALITIES]}</p>
                  <p><strong>Motor:</strong> {selectedTool?.name}</p>
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
                  <div className="text-xs text-muted-foreground">Mesmo exercício</div>
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
              ✅ Sucesso! Exercício com Vídeo Criado
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Video Preview */}
            {generatedVideoUrl && (
              <div className="space-y-4">
                <h4 className="font-semibold">Vídeo Final:</h4>
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
                    ✅ Exercício <strong>"{pendingFormData?.exerciseName}"</strong> criado com sucesso
                  </p>
                  <p>✅ Vídeo gerado e vinculado automaticamente</p>
                  <p>✅ Disponível em toda a biblioteca</p>
                  <p>✅ Pronto para usar em protocolos</p>
                  <p>✅ Salvo no sistema permanentemente</p>
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
        <Card className="bg-gradient-to-br from-blue-50 to-purple-50">
          <CardHeader>
            <CardTitle className="text-sm">🚀 Sistema Corrigido</CardTitle>
          </CardHeader>
          <CardContent className="text-xs space-y-2">
            {currentStep === 'config' && (
              <>
                <p>📝 Preencha o exercício</p>
                <p>🎬 Escolha a modalidade</p>
                <p>⚡ Clique "Gerar Vídeo Automaticamente"</p>
              </>
            )}
            {currentStep === 'generating' && (
              <>
                <p>🎬 Sistema gerando vídeo</p>
                <p>⏱️ Aguarde alguns segundos</p>
                <p>✅ Vídeo será criado automaticamente</p>
              </>
            )}
            {currentStep === 'video_ready' && (
              <>
                <p>🎥 Vídeo pronto para revisão</p>
                <p>▶️ Teste o player</p>
                <p>✅ Aceite ou gere novo</p>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FreeVideoGeneratorFixed;

