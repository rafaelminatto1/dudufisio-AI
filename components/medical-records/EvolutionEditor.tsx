/**
 * Componente: Editor de Evolução de Sessão
 * Editor integrado com mapa corporal para evoluções clínicas
 */

import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Input,
} from '@/components/ui/input';
import {
  Textarea,
} from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Button,
} from '@/components/ui/button';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Badge,
} from '@/components/ui/badge';
import {
  Progress,
} from '@/components/ui/progress';
import {
  Slider,
} from '@/components/ui/slider';
import {
  AlertCircle,
  CheckCircle,
  Save,
  Send,
  Activity,
  Target,
  Calendar,
  User,
  Heart,
  Brain,
  Bone,
  Lungs,
  Baby,
  Zap,
  Shield,
  Clock,
  AlertTriangle,
  Plus,
  Trash2,
  Edit,
  Eye,
  TrendingUp,
  TrendingDown,
  Minus,
  MapPin,
  PainChart
} from 'lucide-react';

// Schema de validação
const evolutionSchema = z.object({
  // Dados básicos
  patientId: z.string().min(1, 'ID do paciente é obrigatório'),
  sessionId: z.string().min(1, 'ID da sessão é obrigatório'),
  
  // Avaliação subjetiva
  subjectiveAssessment: z.string().min(20, 'Avaliação subjetiva deve ter pelo menos 20 caracteres'),
  painLevelBefore: z.number().min(0).max(10, 'Nível de dor deve ser entre 0 e 10'),
  painLevelAfter: z.number().min(0).max(10, 'Nível de dor deve ser entre 0 e 10'),
  
  // Avaliação objetiva
  objectiveFindings: z.string().min(20, 'Achados objetivos devem ter pelo menos 20 caracteres'),
  measurements: z.record(z.any()).optional(),
  
  // Intervenções
  techniquesApplied: z.array(z.object({
    name: z.string().min(1, 'Nome da técnica é obrigatório'),
    duration: z.string().min(1, 'Duração é obrigatória'),
    parameters: z.record(z.any()),
    response: z.string().min(1, 'Resposta é obrigatória')
  })).min(1, 'Pelo menos uma técnica deve ser aplicada'),
  
  exercisesPerformed: z.array(z.object({
    name: z.string().min(1, 'Nome do exercício é obrigatório'),
    description: z.string().min(1, 'Descrição é obrigatória'),
    repetitions: z.number().min(1, 'Repetições devem ser pelo menos 1'),
    sets: z.number().min(1, 'Séries devem ser pelo menos 1'),
    duration: z.string().optional(),
    instructions: z.string().min(1, 'Instruções são obrigatórias')
  })).optional(),
  
  equipmentUsed: z.array(z.string()).optional(),
  
  // Resposta do paciente
  patientResponse: z.string().min(10, 'Resposta do paciente deve ter pelo menos 10 caracteres'),
  adverseReactions: z.string().optional(),
  
  // Plano futuro
  nextSessionPlan: z.string().min(15, 'Plano para próxima sessão deve ter pelo menos 15 caracteres'),
  homeExercises: z.array(z.object({
    name: z.string().min(1, 'Nome do exercício é obrigatório'),
    description: z.string().min(1, 'Descrição é obrigatória'),
    repetitions: z.number().min(1, 'Repetições devem ser pelo menos 1'),
    sets: z.number().min(1, 'Séries devem ser pelo menos 1'),
    duration: z.string().optional(),
    instructions: z.string().min(1, 'Instruções são obrigatórias')
  })).optional(),
  
  recommendations: z.string().min(10, 'Recomendações devem ter pelo menos 10 caracteres'),
  
  // Mapa corporal
  bodyMapPoints: z.array(z.object({
    id: z.string(),
    x: z.number().min(0).max(1),
    y: z.number().min(0).max(1),
    painLevel: z.number().min(0).max(10),
    description: z.string().optional(),
    timestamp: z.date()
  })).optional()
});

type EvolutionFormData = z.infer<typeof evolutionSchema>;

interface EvolutionEditorProps {
  patientId: string;
  sessionId: string;
  onSave: (data: EvolutionFormData) => Promise<void>;
  onSaveDraft: (data: EvolutionFormData) => Promise<void>;
  onCancel: () => void;
  initialData?: Partial<EvolutionFormData>;
  isLoading?: boolean;
  previousEvolution?: EvolutionFormData;
}

export function EvolutionEditor({
  patientId,
  sessionId,
  onSave,
  onSaveDraft,
  onCancel,
  initialData,
  isLoading = false,
  previousEvolution
}: EvolutionEditorProps) {
  const [currentTab, setCurrentTab] = useState('subjective');
  const [progress, setProgress] = useState(0);
  const [isDraft, setIsDraft] = useState(false);
  const [showBodyMap, setShowBodyMap] = useState(false);

  const form = useForm<EvolutionFormData>({
    resolver: zodResolver(evolutionSchema),
    defaultValues: {
      patientId,
      sessionId,
      subjectiveAssessment: '',
      painLevelBefore: previousEvolution?.painLevelAfter || 0,
      painLevelAfter: 0,
      objectiveFindings: '',
      measurements: {},
      techniquesApplied: [],
      exercisesPerformed: [],
      equipmentUsed: [],
      patientResponse: '',
      adverseReactions: '',
      nextSessionPlan: '',
      homeExercises: [],
      recommendations: '',
      bodyMapPoints: [],
      ...initialData
    }
  });

  const { watch, formState: { errors, isValid } } = form;
  const watchedValues = watch();

  // Calcular progresso
  useEffect(() => {
    const totalFields = Object.keys(evolutionSchema.shape).length;
    const filledFields = Object.values(watchedValues).filter(value => 
      value !== undefined && value !== null && value !== ''
    ).length;
    setProgress((filledFields / totalFields) * 100);
  }, [watchedValues]);

  const handleSave = async () => {
    try {
      setIsDraft(false);
      await onSave(watchedValues);
    } catch (error) {
      console.error('Error saving evolution:', error);
    }
  };

  const handleSaveDraft = async () => {
    try {
      setIsDraft(true);
      await onSaveDraft(watchedValues);
    } catch (error) {
      console.error('Error saving draft:', error);
    }
  };

  const addTechnique = () => {
    const currentTechniques = form.getValues('techniquesApplied') || [];
    form.setValue('techniquesApplied', [
      ...currentTechniques,
      {
        name: '',
        duration: '',
        parameters: {},
        response: ''
      }
    ]);
  };

  const removeTechnique = (index: number) => {
    const currentTechniques = form.getValues('techniquesApplied') || [];
    form.setValue('techniquesApplied', currentTechniques.filter((_, i) => i !== index));
  };

  const addExercise = () => {
    const currentExercises = form.getValues('exercisesPerformed') || [];
    form.setValue('exercisesPerformed', [
      ...currentExercises,
      {
        name: '',
        description: '',
        repetitions: 1,
        sets: 1,
        instructions: ''
      }
    ]);
  };

  const removeExercise = (index: number) => {
    const currentExercises = form.getValues('exercisesPerformed') || [];
    form.setValue('exercisesPerformed', currentExercises.filter((_, i) => i !== index));
  };

  const addHomeExercise = () => {
    const currentHomeExercises = form.getValues('homeExercises') || [];
    form.setValue('homeExercises', [
      ...currentHomeExercises,
      {
        name: '',
        description: '',
        repetitions: 1,
        sets: 1,
        instructions: ''
      }
    ]);
  };

  const removeHomeExercise = (index: number) => {
    const currentHomeExercises = form.getValues('homeExercises') || [];
    form.setValue('homeExercises', currentHomeExercises.filter((_, i) => i !== index));
  };

  const tabs = [
    { id: 'subjective', label: 'Avaliação Subjetiva', icon: User },
    { id: 'objective', label: 'Avaliação Objetiva', icon: Activity },
    { id: 'interventions', label: 'Intervenções', icon: Target },
    { id: 'response', label: 'Resposta do Paciente', icon: Heart },
    { id: 'planning', label: 'Planejamento', icon: Calendar }
  ];

  const painImprovement = watchedValues.painLevelBefore - watchedValues.painLevelAfter;
  const painImprovementPercentage = watchedValues.painLevelBefore > 0 
    ? (painImprovement / watchedValues.painLevelBefore) * 100 
    : 0;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-green-100 rounded-lg">
            <Activity className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Evolução de Sessão
            </h1>
            <p className="text-gray-600">
              Paciente: {patientId} | Sessão: {sessionId}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <Badge variant={isValid ? "default" : "secondary"}>
            {isValid ? (
              <>
                <CheckCircle className="h-4 w-4 mr-1" />
                Completo
              </>
            ) : (
              <>
                <AlertCircle className="h-4 w-4 mr-1" />
                Incompleto
              </>
            )}
          </Badge>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowBodyMap(!showBodyMap)}
            className="flex items-center space-x-2"
          >
            <MapPin className="h-4 w-4" />
            <span>Mapa Corporal</span>
          </Button>
        </div>
      </div>

      {/* Progress Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progresso da Evolução</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Pain Level Comparison */}
      {watchedValues.painLevelBefore > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <PainChart className="h-5 w-5" />
              <span>Evolução da Dor</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {watchedValues.painLevelBefore}
                </div>
                <div className="text-sm text-gray-600">Antes</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {watchedValues.painLevelAfter}
                </div>
                <div className="text-sm text-gray-600">Depois</div>
              </div>
              
              <div className="text-center">
                <div className={`text-2xl font-bold flex items-center justify-center space-x-1 ${
                  painImprovement > 0 ? 'text-green-600' : 
                  painImprovement < 0 ? 'text-red-600' : 'text-gray-600'
                }`}>
                  {painImprovement > 0 ? (
                    <>
                      <TrendingDown className="h-5 w-5" />
                      <span>-{painImprovement}</span>
                    </>
                  ) : painImprovement < 0 ? (
                    <>
                      <TrendingUp className="h-5 w-5" />
                      <span>+{Math.abs(painImprovement)}</span>
                    </>
                  ) : (
                    <span>0</span>
                  )}
                </div>
                <div className="text-sm text-gray-600">
                  {painImprovementPercentage > 0 ? `${Math.round(painImprovementPercentage)}% melhora` : 
                   painImprovementPercentage < 0 ? `${Math.round(Math.abs(painImprovementPercentage))}% piora` : 
                   'Sem alteração'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSave)} className="space-y-6">
          <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <TabsTrigger key={tab.id} value={tab.id} className="flex items-center space-x-2">
                    <Icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {/* Avaliação Subjetiva */}
            <TabsContent value="subjective" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <User className="h-5 w-5" />
                    <span>Avaliação Subjetiva</span>
                  </CardTitle>
                  <CardDescription>
                    Como o paciente se sente e relata sua condição
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="subjectiveAssessment"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Relato do Paciente</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Descreva como o paciente se sente, queixas, melhorias, pioras..."
                            className="min-h-[120px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="painLevelBefore"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nível de Dor - Antes (0-10)</FormLabel>
                          <FormControl>
                            <div className="space-y-2">
                              <Slider
                                value={[field.value]}
                                onValueChange={(value) => field.onChange(value[0])}
                                max={10}
                                min={0}
                                step={1}
                                className="w-full"
                              />
                              <div className="text-center text-lg font-semibold">
                                {field.value}
                              </div>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="painLevelAfter"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nível de Dor - Depois (0-10)</FormLabel>
                          <FormControl>
                            <div className="space-y-2">
                              <Slider
                                value={[field.value]}
                                onValueChange={(value) => field.onChange(value[0])}
                                max={10}
                                min={0}
                                step={1}
                                className="w-full"
                              />
                              <div className="text-center text-lg font-semibold">
                                {field.value}
                              </div>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Avaliação Objetiva */}
            <TabsContent value="objective" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Activity className="h-5 w-5" />
                    <span>Avaliação Objetiva</span>
                  </CardTitle>
                  <CardDescription>
                    Achados objetivos da avaliação física
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="objectiveFindings"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Achados Objetivos</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Descreva os achados da avaliação física, testes, medidas..."
                            className="min-h-[120px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="measurements"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Medidas e Testes</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Ex: Amplitude de movimento, força muscular, testes especiais..."
                            className="min-h-[80px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Intervenções */}
            <TabsContent value="interventions" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Target className="h-5 w-5" />
                    <span>Intervenções Realizadas</span>
                  </CardTitle>
                  <CardDescription>
                    Técnicas e exercícios aplicados na sessão
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Técnicas Aplicadas */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold">Técnicas Aplicadas</h3>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addTechnique}
                        className="flex items-center space-x-2"
                      >
                        <Plus className="h-4 w-4" />
                        <span>Adicionar Técnica</span>
                      </Button>
                    </div>

                    <div className="space-y-4">
                      {watchedValues.techniquesApplied?.map((technique, index) => (
                        <Card key={index}>
                          <CardContent className="pt-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <FormField
                                control={form.control}
                                name={`techniquesApplied.${index}.name`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Nome da Técnica</FormLabel>
                                    <FormControl>
                                      <Input placeholder="Ex: Mobilização articular" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={form.control}
                                name={`techniquesApplied.${index}.duration`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Duração</FormLabel>
                                    <FormControl>
                                      <Input placeholder="Ex: 15 minutos" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={form.control}
                                name={`techniquesApplied.${index}.response`}
                                render={({ field }) => (
                                  <FormItem className="md:col-span-2">
                                    <FormLabel>Resposta</FormLabel>
                                    <FormControl>
                                      <Textarea
                                        placeholder="Como o paciente respondeu à técnica..."
                                        className="min-h-[60px]"
                                        {...field}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>

                            <div className="flex justify-end mt-4">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => removeTechnique(index)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4 mr-1" />
                                Remover
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>

                  {/* Exercícios Realizados */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold">Exercícios Realizados</h3>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addExercise}
                        className="flex items-center space-x-2"
                      >
                        <Plus className="h-4 w-4" />
                        <span>Adicionar Exercício</span>
                      </Button>
                    </div>

                    <div className="space-y-4">
                      {watchedValues.exercisesPerformed?.map((exercise, index) => (
                        <Card key={index}>
                          <CardContent className="pt-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <FormField
                                control={form.control}
                                name={`exercisesPerformed.${index}.name`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Nome do Exercício</FormLabel>
                                    <FormControl>
                                      <Input placeholder="Ex: Fortalecimento quadríceps" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={form.control}
                                name={`exercisesPerformed.${index}.repetitions`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Repetições</FormLabel>
                                    <FormControl>
                                      <Input
                                        type="number"
                                        min="1"
                                        {...field}
                                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={form.control}
                                name={`exercisesPerformed.${index}.sets`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Séries</FormLabel>
                                    <FormControl>
                                      <Input
                                        type="number"
                                        min="1"
                                        {...field}
                                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={form.control}
                                name={`exercisesPerformed.${index}.instructions`}
                                render={({ field }) => (
                                  <FormItem className="md:col-span-2">
                                    <FormLabel>Instruções</FormLabel>
                                    <FormControl>
                                      <Textarea
                                        placeholder="Instruções específicas do exercício..."
                                        className="min-h-[60px]"
                                        {...field}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>

                            <div className="flex justify-end mt-4">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => removeExercise(index)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4 mr-1" />
                                Remover
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Resposta do Paciente */}
            <TabsContent value="response" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Heart className="h-5 w-5" />
                    <span>Resposta do Paciente</span>
                  </CardTitle>
                  <CardDescription>
                    Como o paciente respondeu ao tratamento
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="patientResponse"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Resposta do Paciente</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Descreva como o paciente respondeu ao tratamento..."
                            className="min-h-[120px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="adverseReactions"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Reações Adversas (se houver)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Descreva qualquer reação adversa ou efeito colateral..."
                            className="min-h-[80px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Planejamento */}
            <TabsContent value="planning" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5" />
                    <span>Planejamento</span>
                  </CardTitle>
                  <CardDescription>
                    Plano para próxima sessão e exercícios domiciliares
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="nextSessionPlan"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Plano para Próxima Sessão</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Descreva o que será feito na próxima sessão..."
                            className="min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="recommendations"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Recomendações</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Recomendações gerais para o paciente..."
                            className="min-h-[80px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Exercícios Domiciliares */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold">Exercícios Domiciliares</h3>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addHomeExercise}
                        className="flex items-center space-x-2"
                      >
                        <Plus className="h-4 w-4" />
                        <span>Adicionar Exercício</span>
                      </Button>
                    </div>

                    <div className="space-y-4">
                      {watchedValues.homeExercises?.map((exercise, index) => (
                        <Card key={index}>
                          <CardContent className="pt-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <FormField
                                control={form.control}
                                name={`homeExercises.${index}.name`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Nome do Exercício</FormLabel>
                                    <FormControl>
                                      <Input placeholder="Ex: Alongamento isquiotibiais" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={form.control}
                                name={`homeExercises.${index}.repetitions`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Repetições</FormLabel>
                                    <FormControl>
                                      <Input
                                        type="number"
                                        min="1"
                                        {...field}
                                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={form.control}
                                name={`homeExercises.${index}.sets`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Séries</FormLabel>
                                    <FormControl>
                                      <Input
                                        type="number"
                                        min="1"
                                        {...field}
                                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={form.control}
                                name={`homeExercises.${index}.instructions`}
                                render={({ field }) => (
                                  <FormItem className="md:col-span-2">
                                    <FormLabel>Instruções</FormLabel>
                                    <FormControl>
                                      <Textarea
                                        placeholder="Instruções detalhadas para o paciente..."
                                        className="min-h-[60px]"
                                        {...field}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>

                            <div className="flex justify-end mt-4">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => removeHomeExercise(index)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4 mr-1" />
                                Remover
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Actions */}
          <div className="flex justify-between items-center pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancelar
            </Button>

            <div className="flex space-x-3">
              <Button
                type="button"
                variant="secondary"
                onClick={handleSaveDraft}
                disabled={isLoading}
                className="flex items-center space-x-2"
              >
                <Save className="h-4 w-4" />
                <span>Salvar Rascunho</span>
              </Button>

              <Button
                type="submit"
                disabled={!isValid || isLoading}
                className="flex items-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <Clock className="h-4 w-4 animate-spin" />
                    <span>Salvando...</span>
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    <span>Finalizar Evolução</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}

