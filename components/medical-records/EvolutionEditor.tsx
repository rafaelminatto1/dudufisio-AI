/**
 * Componente: Editor de Evolução de Sessão
 * Editor integrado com mapa corporal para evoluções clínicas
 * Versão atualizada com funcionalidades avançadas
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
  FileText,
  Download,
  Dumbbell,
} from 'lucide-react';
import { MdHealthAndSafety, MdAssessment } from 'react-icons/md';
import { Conduct } from '../../types/conducts';
import { ConductForm } from '../evolution/ConductForm';
import { ConductList } from '../evolution/ConductList';
import { generatePlanText } from '../../lib/evolution/conductsFormatter';

// Novos imports para funcionalidades avançadas
import { SessionTimer, useSessionTimer } from '../evolution/SessionTimer';
import { PreviousSessionComparison } from '../evolution/PreviousSessionComparison';
import { ExerciseSelector } from '../evolution/ExerciseSelector';
import { PrescribedExerciseList } from '../evolution/PrescribedExerciseList';
import { PhotoUpload } from '../evolution/PhotoUpload';
import { TemplateSelector } from '../evolution/TemplateSelector';
import { TemplateSaveDialog } from '../evolution/TemplateSaveDialog';
import { PrescribedExercise, ProgressPhoto, Patient, Therapist } from '@/types';
import { downloadEvolutionPDF } from '@/services/pdf/evolutionReportService';
import { useToast } from '@/contexts/ToastContext';
import { useApp } from '@/contexts/AppContext';

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
  
  // Condutas estruturadas (novo sistema)
  conducts: z.array(z.object({
    id: z.string(),
    category: z.string(),
    name: z.string(),
    details: z.string().optional(),
    duration: z.string().optional(),
    equipment: z.string().optional(),
    notes: z.string().optional()
  })).optional(),
  
  planGeneralNotes: z.string().optional(),
  
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
  const { user } = useApp();
  const { showToast } = useToast();
  
  // Estados existentes
  const [currentTab, setCurrentTab] = useState('subjective');
  const [progress, setProgress] = useState(0);
  const [isDraft, setIsDraft] = useState(false);
  const [showBodyMap, setShowBodyMap] = useState(false);
  const [conducts, setConducts] = useState<Conduct[]>([]);
  const [showConductForm, setShowConductForm] = useState(false);
  
  // Novos estados para funcionalidades avançadas
  const [prescribedExercises, setPrescribedExercises] = useState<PrescribedExercise[]>([]);
  const [progressPhotos, setProgressPhotos] = useState<ProgressPhoto[]>([]);
  const [showExerciseSelector, setShowExerciseSelector] = useState(false);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [showTemplateSaveDialog, setShowTemplateSaveDialog] = useState(false);
  const { timerData, handleTimeUpdate } = useSessionTimer();

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
      conducts: [],
      planGeneralNotes: '',
      patientResponse: '',
      adverseReactions: '',
      nextSessionPlan: '',
      homeExercises: [],
      recommendations: '',
      bodyMapPoints: [],
      ...initialData
    }
  });

  // Inicializar conducts do initialData se existir
  React.useEffect(() => {
    if (initialData?.conducts) {
      setConducts(initialData.conducts as Conduct[]);
    }
  }, [initialData]);

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
      // Incluir todos os dados avançados no save
      const dataToSave = {
        ...watchedValues,
        conducts: conducts,
        prescribedExercises: prescribedExercises,
        progressPhotos: progressPhotos,
        sessionTimer: timerData.startTime ? {
          startTime: timerData.startTime.toISOString(),
          endTime: timerData.endTime?.toISOString(),
          duration: timerData.duration
        } : undefined
      };
      await onSave(dataToSave as any);
    } catch (error) {
      console.error('Error saving evolution:', error);
    }
  };

  const handleSaveDraft = async () => {
    try {
      setIsDraft(true);
      // Incluir todos os dados avançados no save draft
      const dataToSave = {
        ...watchedValues,
        conducts: conducts,
        prescribedExercises: prescribedExercises,
        progressPhotos: progressPhotos,
        sessionTimer: timerData.startTime ? {
          startTime: timerData.startTime.toISOString(),
          endTime: timerData.endTime?.toISOString(),
          duration: timerData.duration
        } : undefined
      };
      await onSaveDraft(dataToSave as any);
    } catch (error) {
      console.error('Error saving draft:', error);
    }
  };

  // Handler para aplicar template
  const handleApplyTemplate = (template: any) => {
    // Aplicar textos do template
    if (template.subjective_template) {
      form.setValue('subjectiveAssessment', template.subjective_template);
    }
    if (template.objective_template) {
      form.setValue('objectiveFindings', template.objective_template);
    }
    if (template.assessment_template) {
      // Assumindo que temos um campo assessment no form
    }
    
    // Aplicar conducts
    if (template.conducts && template.conducts.length > 0) {
      setConducts(template.conducts);
    }
    
    // Aplicar exercícios
    if (template.exercises && template.exercises.length > 0) {
      setPrescribedExercises(template.exercises);
    }
    
    setShowTemplateSelector(false);
    showToast('Template aplicado com sucesso!', 'success');
  };

  // Handler para exportar PDF
  const handleExportPDF = async () => {
    try {
      // Mock de dados do paciente e terapeuta - ajuste conforme sua implementação
      const patient: Patient = {
        id: patientId,
        name: 'Nome do Paciente',
        cpf: '',
        dateOfBirth: '',
      } as Patient;
      
      const therapist: Therapist = {
        id: user?.id || '',
        name: user?.fullName || 'Terapeuta',
        color: 'blue',
        avatarUrl: '',
      };

      const evolutionData: any = {
        ...watchedValues,
        conducts: conducts,
        sessionNumber: 1,
        sessionDate: new Date().toISOString(),
        therapistId: therapist.id,
        therapistName: therapist.name,
      };

      await downloadEvolutionPDF(patient, evolutionData, therapist, prescribedExercises);
      showToast('PDF exportado com sucesso!', 'success');
    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
      showToast('Erro ao exportar PDF', 'error');
    }
  };

  const handleAddConduct = (conduct: Conduct) => {
    setConducts([...conducts, conduct]);
    setShowConductForm(false);
  };

  const handleRemoveConduct = (id: string) => {
    setConducts(conducts.filter(c => c.id !== id));
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
    { id: 'conducts', label: 'P - Plano (Condutas)', icon: Zap },
    { id: 'exercises', label: 'Exercícios Prescritos', icon: Dumbbell },
    { id: 'response', label: 'Resposta + Fotos', icon: Heart },
    { id: 'planning', label: 'Planejamento', icon: Calendar }
  ];

  const painImprovement = watchedValues.painLevelBefore - watchedValues.painLevelAfter;
  const painImprovementPercentage = watchedValues.painLevelBefore > 0 
    ? (painImprovement / watchedValues.painLevelBefore) * 100 
    : 0;

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Coluna Principal (3/4) */}
        <div className="lg:col-span-3 space-y-6">
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
            
            <div className="flex items-center space-x-2">
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
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowTemplateSelector(true)}
                className="gap-2"
              >
                <FileText className="h-4 w-4" />
                Templates
              </Button>
              
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowBodyMap(!showBodyMap)}
                className="gap-2"
              >
                <MapPin className="h-4 w-4" />
                Mapa
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
              <MdAssessment className="h-5 w-5" />
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
            <TabsList className="grid w-full grid-cols-6">
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

                  <div>
                    <FormLabel>Medidas e Testes</FormLabel>
                    <Textarea
                      placeholder="Ex: Amplitude de movimento, força muscular, testes especiais..."
                      className="min-h-[80px]"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* P - Plano (Condutas Estruturadas) */}
            <TabsContent value="conducts" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Zap className="h-5 w-5" />
                      <span>P - Plano (Condutas Realizadas)</span>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowConductForm(!showConductForm)}
                      className="gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      {showConductForm ? 'Ocultar Formulário' : 'Adicionar Conduta'}
                    </Button>
                  </CardTitle>
                  <CardDescription>
                    Condutas e intervenções realizadas na sessão, organizadas por categoria
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Formulário de Adição */}
                  {showConductForm && (
                    <ConductForm 
                      onAdd={handleAddConduct}
                      onCancel={() => setShowConductForm(false)}
                    />
                  )}

                  {/* Lista de Condutas */}
                  <ConductList
                    conducts={conducts}
                    onRemove={handleRemoveConduct}
                  />

                  {/* Campo livre para observações gerais (opcional) */}
                  <div>
                    <FormField
                      control={form.control}
                      name="planGeneralNotes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Observações Gerais do Plano</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Observações adicionais sobre o plano de tratamento..."
                              rows={3}
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Campo livre para anotações adicionais que não se encaixam nas condutas estruturadas.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Exercícios Prescritos (Nova Tab) */}
            <TabsContent value="exercises" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Dumbbell className="h-5 w-5" />
                      <span>Exercícios Prescritos</span>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowExerciseSelector(!showExerciseSelector)}
                      className="gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      {showExerciseSelector ? 'Ocultar' : 'Adicionar Exercícios'}
                    </Button>
                  </CardTitle>
                  <CardDescription>
                    Selecione e prescreva exercícios da biblioteca com parâmetros específicos
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Seletor de exercícios */}
                  {showExerciseSelector && (
                    <ExerciseSelector
                      onSelect={setPrescribedExercises}
                      selectedExercises={prescribedExercises}
                    />
                  )}

                  {/* Lista de exercícios prescritos */}
                  <PrescribedExerciseList
                    exercises={prescribedExercises}
                    onUpdate={setPrescribedExercises}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Resposta do Paciente + Fotos */}
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

                  {/* Fotos de Progresso (Novo) */}
                  <div className="pt-4 border-t">
                    <PhotoUpload
                      patientId={patientId}
                      sessionId={sessionId}
                      photos={progressPhotos}
                      onPhotosChange={setProgressPhotos}
                    />
                  </div>
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
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pt-6 border-t gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancelar
            </Button>

            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowTemplateSaveDialog(true)}
                disabled={isLoading}
                className="gap-2"
              >
                <FileText className="h-4 w-4" />
                Salvar como Template
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={handleExportPDF}
                disabled={isLoading}
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                Exportar PDF
              </Button>

              <Button
                type="button"
                variant="secondary"
                onClick={handleSaveDraft}
                disabled={isLoading}
                className="gap-2"
              >
                <Save className="h-4 w-4" />
                Salvar Rascunho
              </Button>

              <Button
                type="submit"
                disabled={!isValid || isLoading}
                className="gap-2"
              >
                {isLoading ? (
                  <>
                    <Clock className="h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Finalizar Evolução
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </Form>
        </div>

        {/* Barra Lateral Direita (1/4) - Sticky */}
        <div className="lg:col-span-1 space-y-6 lg:sticky lg:top-6 lg:self-start">
          {/* Timer de Sessão */}
          <SessionTimer onTimeUpdate={handleTimeUpdate} autoStart={true} />

          {/* Comparação com Sessão Anterior */}
          <PreviousSessionComparison 
            patientId={patientId}
            currentPainLevel={watchedValues.painLevelAfter}
          />
        </div>
      </div>

      {/* Dialogs */}
      {showTemplateSelector && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Carregar Template</h2>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowTemplateSelector(false)}
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
              <TemplateSelector
                therapistId={user?.id || ''}
                onSelect={handleApplyTemplate}
                onCreateNew={() => {
                  setShowTemplateSelector(false);
                  setShowTemplateSaveDialog(true);
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Dialog para salvar template */}
      <TemplateSaveDialog
        open={showTemplateSaveDialog}
        onOpenChange={setShowTemplateSaveDialog}
        therapistId={user?.id || ''}
        templateData={{
          subjective_template: watchedValues.subjectiveAssessment,
          objective_template: watchedValues.objectiveFindings,
          assessment_template: '',
          conducts: conducts,
          exercises: prescribedExercises
        }}
        onSuccess={() => showToast('Template salvo com sucesso!', 'success')}
      />
    </div>
  );
}

