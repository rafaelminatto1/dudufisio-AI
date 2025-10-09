// pages/ImageGenerationDemoPage.tsx
import React, { useState } from 'react';
import {
  Image,
  Wand2,
  Download,
  Copy,
  Sparkles,
  Dumbbell,
  Activity,
  Heart,
  FileText,
  Zap,
  CheckCircle,
  Loader2
} from 'lucide-react';
import PageHeader from '../components/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { imagenService, FISIO_IMAGE_PRESETS } from '../services/ai/imagenService';
import { useToast } from '../contexts/ToastContext';
import DirectionProvider from '../components/providers/DirectionProvider';

const ImageGenerationDemoPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('exercise');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<any>(null);
  const [optimizedPrompt, setOptimizedPrompt] = useState('');
  const { showToast } = useToast();

  // Exercise generation state
  const [exerciseParams, setExerciseParams] = useState({
    name: 'Agachamento',
    bodyPart: 'Membros inferiores',
    difficulty: 'Intermediário'
  });

  // Protocol generation state
  const [protocolParams, setProtocolParams] = useState({
    name: 'Reabilitação Pós-Cirúrgica de Joelho',
    specialty: 'Pós-Operatória'
  });

  // Anatomy generation state
  const [anatomyParams, setAnatomyParams] = useState({
    bodyPart: 'Joelho',
    view: 'Vista anterior',
    annotations: true
  });

  // Educational generation state
  const [educationalParams, setEducationalParams] = useState({
    topic: 'Prevenção de Quedas em Idosos',
    audience: 'Pacientes e cuidadores'
  });

  // Custom prompt state
  const [customPrompt, setCustomPrompt] = useState('');

  const handleGenerateExercise = async () => {
    setIsGenerating(true);
    try {
      const image = await imagenService.generateImageObject('exercise', exerciseParams);
      setGeneratedImage(image);
      setOptimizedPrompt(image.prompt);
      showToast('Imagem de exercício gerada com sucesso!', 'success');
    } catch (error) {
      showToast('Erro ao gerar imagem', 'error');
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateProtocol = async () => {
    setIsGenerating(true);
    try {
      const image = await imagenService.generateImageObject('protocol', protocolParams);
      setGeneratedImage(image);
      setOptimizedPrompt(image.prompt);
      showToast('Imagem de protocolo gerada com sucesso!', 'success');
    } catch (error) {
      showToast('Erro ao gerar imagem', 'error');
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateAnatomy = async () => {
    setIsGenerating(true);
    try {
      const image = await imagenService.generateImageObject('anatomy', anatomyParams);
      setGeneratedImage(image);
      setOptimizedPrompt(image.prompt);
      showToast('Diagrama anatômico gerado com sucesso!', 'success');
    } catch (error) {
      showToast('Erro ao gerar imagem', 'error');
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateEducational = async () => {
    setIsGenerating(true);
    try {
      const image = await imagenService.generateImageObject('educational', educationalParams);
      setGeneratedImage(image);
      setOptimizedPrompt(image.prompt);
      showToast('Imagem educacional gerada com sucesso!', 'success');
    } catch (error) {
      showToast('Erro ao gerar imagem', 'error');
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleOptimizeCustomPrompt = async () => {
    if (!customPrompt.trim()) {
      showToast('Digite um prompt para otimizar', 'warning');
      return;
    }

    setIsGenerating(true);
    try {
      const optimized = await imagenService.optimizePrompt(customPrompt, 'fisioterapia');
      setOptimizedPrompt(optimized);
      showToast('Prompt otimizado com sucesso!', 'success');
    } catch (error) {
      showToast('Erro ao otimizar prompt', 'error');
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(optimizedPrompt);
    showToast('Prompt copiado para a área de transferência!', 'success');
  };

  const handleDownloadPrompt = () => {
    if (!generatedImage) return;

    const exportData = imagenService.exportPrompt(generatedImage);
    const blob = new Blob([exportData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'prompt-imagen-3.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Prompt exportado com sucesso!', 'success');
  };

  return (
    <DirectionProvider>
      <div className="space-y-6">
        <PageHeader
          title="Geração de Imagens - Google Banana (Imagen 3)"
          subtitle="Sistema de geração de imagens educacionais e clínicas para fisioterapia"
        />

      {/* Info Card */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-start space-x-3">
            <Sparkles className="w-6 h-6 text-blue-600 mt-1" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">Como Funciona</h3>
              <p className="text-sm text-blue-800 mb-3">
                Este sistema usa o <strong>Google Gemini</strong> para otimizar prompts específicos para fisioterapia,
                preparados para uso com <strong>Google Imagen 3 (Banana)</strong>.
              </p>
              <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                <li>Prompts otimizados automaticamente para contexto clínico</li>
                <li>Placeholders visuais enquanto aguarda integração com Imagen 3</li>
                <li>Exportação de prompts para uso externo</li>
                <li>Templates pré-configurados por especialidade</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Generation Options */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Wand2 className="w-5 h-5 mr-2" />
                Gerar Imagens
              </CardTitle>
              <CardDescription>
                Selecione o tipo de imagem e configure os parâmetros
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="exercise">
                    <Dumbbell className="w-4 h-4 mr-1" />
                    Exercício
                  </TabsTrigger>
                  <TabsTrigger value="protocol">
                    <FileText className="w-4 h-4 mr-1" />
                    Protocolo
                  </TabsTrigger>
                  <TabsTrigger value="anatomy">
                    <Activity className="w-4 h-4 mr-1" />
                    Anatomia
                  </TabsTrigger>
                  <TabsTrigger value="educational">
                    <Heart className="w-4 h-4 mr-1" />
                    Educacional
                  </TabsTrigger>
                  <TabsTrigger value="custom">
                    <Zap className="w-4 h-4 mr-1" />
                    Custom
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="exercise" className="space-y-4 mt-4">
                  <div>
                    <Label htmlFor="exercise-name">Nome do Exercício</Label>
                    <Input
                      id="exercise-name"
                      value={exerciseParams.name}
                      onChange={(e) => setExerciseParams({ ...exerciseParams, name: e.target.value })}
                      placeholder="Ex: Agachamento, Ponte de Glúteos"
                    />
                  </div>
                  <div>
                    <Label htmlFor="body-part">Parte do Corpo</Label>
                    <Input
                      id="body-part"
                      value={exerciseParams.bodyPart}
                      onChange={(e) => setExerciseParams({ ...exerciseParams, bodyPart: e.target.value })}
                      placeholder="Ex: Membros inferiores, Ombro"
                    />
                  </div>
                  <div>
                    <Label htmlFor="difficulty">Dificuldade</Label>
                    <select
                      id="difficulty"
                      title="Selecione a dificuldade"
                      className="w-full p-2 border rounded-md"
                      value={exerciseParams.difficulty}
                      onChange={(e) => setExerciseParams({ ...exerciseParams, difficulty: e.target.value })}
                    >
                      <option>Iniciante</option>
                      <option>Intermediário</option>
                      <option>Avançado</option>
                    </select>
                  </div>
                  <Button onClick={handleGenerateExercise} disabled={isGenerating} className="w-full">
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Gerando...
                      </>
                    ) : (
                      <>
                        <Image className="w-4 h-4 mr-2" />
                        Gerar Imagem de Exercício
                      </>
                    )}
                  </Button>
                </TabsContent>

                <TabsContent value="protocol" className="space-y-4 mt-4">
                  <div>
                    <Label htmlFor="protocol-name">Nome do Protocolo</Label>
                    <Input
                      id="protocol-name"
                      value={protocolParams.name}
                      onChange={(e) => setProtocolParams({ ...protocolParams, name: e.target.value })}
                      placeholder="Ex: Reabilitação Pós-Cirúrgica"
                    />
                  </div>
                  <div>
                    <Label htmlFor="specialty">Especialidade</Label>
                    <select
                      id="specialty"
                      title="Selecione a especialidade"
                      className="w-full p-2 border rounded-md"
                      value={protocolParams.specialty}
                      onChange={(e) => setProtocolParams({ ...protocolParams, specialty: e.target.value })}
                    >
                      <option>Esportiva</option>
                      <option>Pós-Operatória</option>
                      <option>Gerontológica</option>
                      <option>Neurológica</option>
                    </select>
                  </div>
                  <Button onClick={handleGenerateProtocol} disabled={isGenerating} className="w-full">
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Gerando...
                      </>
                    ) : (
                      <>
                        <Image className="w-4 h-4 mr-2" />
                        Gerar Imagem de Protocolo
                      </>
                    )}
                  </Button>
                </TabsContent>

                <TabsContent value="anatomy" className="space-y-4 mt-4">
                  <div>
                    <Label htmlFor="anatomy-part">Parte do Corpo</Label>
                    <Input
                      id="anatomy-part"
                      value={anatomyParams.bodyPart}
                      onChange={(e) => setAnatomyParams({ ...anatomyParams, bodyPart: e.target.value })}
                      placeholder="Ex: Joelho, Ombro, Coluna"
                    />
                  </div>
                  <div>
                    <Label htmlFor="anatomy-view">Vista</Label>
                    <select
                      id="anatomy-view"
                      title="Selecione a vista"
                      className="w-full p-2 border rounded-md"
                      value={anatomyParams.view}
                      onChange={(e) => setAnatomyParams({ ...anatomyParams, view: e.target.value })}
                    >
                      <option>Vista anterior</option>
                      <option>Vista posterior</option>
                      <option>Vista lateral</option>
                      <option>Vista medial</option>
                    </select>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      id="annotations"
                      type="checkbox"
                      title="Incluir anotações e legendas no diagrama"
                      checked={anatomyParams.annotations}
                      onChange={(e) => setAnatomyParams({ ...anatomyParams, annotations: e.target.checked })}
                      className="rounded"
                    />
                    <Label htmlFor="annotations">Incluir anotações e legendas</Label>
                  </div>
                  <Button onClick={handleGenerateAnatomy} disabled={isGenerating} className="w-full">
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Gerando...
                      </>
                    ) : (
                      <>
                        <Image className="w-4 h-4 mr-2" />
                        Gerar Diagrama Anatômico
                      </>
                    )}
                  </Button>
                </TabsContent>

                <TabsContent value="educational" className="space-y-4 mt-4">
                  <div>
                    <Label htmlFor="edu-topic">Tópico</Label>
                    <Input
                      id="edu-topic"
                      value={educationalParams.topic}
                      onChange={(e) => setEducationalParams({ ...educationalParams, topic: e.target.value })}
                      placeholder="Ex: Prevenção de Quedas"
                    />
                  </div>
                  <div>
                    <Label htmlFor="audience">Público-Alvo</Label>
                    <Input
                      id="audience"
                      value={educationalParams.audience}
                      onChange={(e) => setEducationalParams({ ...educationalParams, audience: e.target.value })}
                      placeholder="Ex: Pacientes e cuidadores"
                    />
                  </div>
                  <Button onClick={handleGenerateEducational} disabled={isGenerating} className="w-full">
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Gerando...
                      </>
                    ) : (
                      <>
                        <Image className="w-4 h-4 mr-2" />
                        Gerar Imagem Educacional
                      </>
                    )}
                  </Button>
                </TabsContent>

                <TabsContent value="custom" className="space-y-4 mt-4">
                  <div>
                    <Label htmlFor="custom-prompt">Seu Prompt</Label>
                    <textarea
                      id="custom-prompt"
                      title="Digite seu prompt personalizado"
                      className="w-full p-2 border rounded-md min-h-[120px]"
                      value={customPrompt}
                      onChange={(e) => setCustomPrompt(e.target.value)}
                      placeholder="Digite seu prompt personalizado aqui..."
                    />
                  </div>
                  <Button onClick={handleOptimizeCustomPrompt} disabled={isGenerating} className="w-full">
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Otimizando...
                      </>
                    ) : (
                      <>
                        <Wand2 className="w-4 h-4 mr-2" />
                        Otimizar Prompt
                      </>
                    )}
                  </Button>
                </TabsContent>
              </Tabs>
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
                  </div>
                </div>
                <CardDescription>
                  Use este prompt no Google AI Studio ou outras ferramentas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-slate-50 p-4 rounded-lg">
                  <pre className="text-sm text-slate-700 whitespace-pre-wrap">
                    {optimizedPrompt}
                  </pre>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Preview & Info */}
        <div className="space-y-6">
          {/* Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Image className="w-5 h-5 mr-2" />
                Preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              {generatedImage ? (
                <div className="space-y-3">
                  <img
                    src={generatedImage.url}
                    alt="Generated preview"
                    className="w-full rounded-lg border"
                  />
                  <div className="flex items-center text-sm text-green-600">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Imagem gerada com sucesso
                  </div>
                </div>
              ) : (
                <div className="aspect-video bg-slate-100 rounded-lg flex items-center justify-center text-slate-400">
                  <div className="text-center">
                    <Image className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Gere uma imagem para ver o preview</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Presets Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Presets por Especialidade</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="border-l-4 border-blue-500 pl-3">
                <h4 className="font-semibold text-sm">Esportiva</h4>
                <p className="text-xs text-muted-foreground">
                  {FISIO_IMAGE_PRESETS.esportiva.style}
                </p>
              </div>
              <div className="border-l-4 border-green-500 pl-3">
                <h4 className="font-semibold text-sm">Pós-Operatória</h4>
                <p className="text-xs text-muted-foreground">
                  {FISIO_IMAGE_PRESETS.posOperatoria.style}
                </p>
              </div>
              <div className="border-l-4 border-purple-500 pl-3">
                <h4 className="font-semibold text-sm">Gerontológica</h4>
                <p className="text-xs text-muted-foreground">
                  {FISIO_IMAGE_PRESETS.geriatrica.style}
                </p>
              </div>
              <div className="border-l-4 border-orange-500 pl-3">
                <h4 className="font-semibold text-sm">Anatomia</h4>
                <p className="text-xs text-muted-foreground">
                  {FISIO_IMAGE_PRESETS.anatomia.style}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* API Info */}
          <Card className="bg-yellow-50 border-yellow-200">
            <CardHeader>
              <CardTitle className="text-sm flex items-center">
                <Zap className="w-4 h-4 mr-2 text-yellow-600" />
                Integração Imagen 3
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-yellow-800 mb-3">
                API Key configurada: <Badge variant="outline" className="text-xs">AIzaSyD...uLtM</Badge>
              </p>
              <p className="text-xs text-yellow-800">
                Os prompts estão sendo otimizados e prontos para uso com a API Imagen 3 quando disponível.
                Por enquanto, são exibidos placeholders.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
    </DirectionProvider>
  );
};

export default ImageGenerationDemoPage;
