/**
 * Componente: Formulário de Avaliação Inicial
 * Formulário dinâmico baseado em templates clínicos
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
  AlertCircle,
  CheckCircle,
  Save,
  Send,
  FileText,
  Stethoscope,
  Activity,
  Target,
  Calendar,
  User,
  Heart,
  Brain,
  Bone,
  // Lungs, // Substituído por MdLungs do react-icons
  Baby,
  Zap,
  Shield,
  Clock,
  AlertTriangle
} from 'lucide-react';
import { MdHealthAndSafety } from 'react-icons/md';

// Schema de validação
const assessmentSchema = z.object({
  // Dados do paciente
  patientId: z.string().min(1, 'ID do paciente é obrigatório'),
  
  // Queixa principal
  chiefComplaint: z.object({
    description: z.string().min(10, 'Descrição deve ter pelo menos 10 caracteres'),
    onset: z.date(),
    duration: z.string().min(1, 'Duração é obrigatória'),
    characteristics: z.object({
      location: z.array(z.string()).min(1, 'Localização é obrigatória'),
      quality: z.string().min(1, 'Qualidade da dor é obrigatória'),
      intensity: z.number().min(0).max(10, 'Intensidade deve ser entre 0 e 10'),
      frequency: z.string().min(1, 'Frequência é obrigatória'),
      pattern: z.string().min(1, 'Padrão é obrigatório')
    }),
    aggravatingFactors: z.array(z.string()),
    relievingFactors: z.array(z.string()),
    associatedSymptoms: z.array(z.string())
  }),

  // História clínica
  medicalHistory: z.object({
    pastMedicalHistory: z.array(z.string()),
    surgicalHistory: z.array(z.string()),
    medications: z.array(z.object({
      name: z.string(),
      dosage: z.string(),
      frequency: z.string(),
      indication: z.string(),
      startDate: z.date(),
      endDate: z.date().optional()
    })),
    allergies: z.array(z.object({
      allergen: z.string(),
      reaction: z.string(),
      severity: z.enum(['mild', 'moderate', 'severe'])
    })),
    familyHistory: z.array(z.string()),
    socialHistory: z.object({
      occupation: z.string(),
      lifestyle: z.array(z.string()),
      habits: z.array(z.string()),
      livingSituation: z.string()
    })
  }),

  // Exame físico
  physicalExam: z.object({
    vitalSigns: z.object({
      bloodPressure: z.string().optional(),
      heartRate: z.number().optional(),
      respiratoryRate: z.number().optional(),
      temperature: z.number().optional(),
      oxygenSaturation: z.number().optional()
    }),
    inspection: z.string().min(10, 'Inspeção deve ter pelo menos 10 caracteres'),
    palpation: z.string().min(10, 'Palpação deve ter pelo menos 10 caracteres'),
    rangeOfMotion: z.object({
      cervical: z.array(z.object({
        joint: z.string(),
        flexion: z.number().optional(),
        extension: z.number().optional(),
        rotation: z.number().optional(),
        notes: z.string().optional()
      })),
      thoracic: z.array(z.object({
        joint: z.string(),
        flexion: z.number().optional(),
        extension: z.number().optional(),
        rotation: z.number().optional(),
        notes: z.string().optional()
      })),
      lumbar: z.array(z.object({
        joint: z.string(),
        flexion: z.number().optional(),
        extension: z.number().optional(),
        rotation: z.number().optional(),
        notes: z.string().optional()
      })),
      upperExtremities: z.array(z.object({
        joint: z.string(),
        flexion: z.number().optional(),
        extension: z.number().optional(),
        abduction: z.number().optional(),
        adduction: z.number().optional(),
        rotation: z.number().optional(),
        notes: z.string().optional()
      })),
      lowerExtremities: z.array(z.object({
        joint: z.string(),
        flexion: z.number().optional(),
        extension: z.number().optional(),
        abduction: z.number().optional(),
        adduction: z.number().optional(),
        rotation: z.number().optional(),
        notes: z.string().optional()
      }))
    }),
    muscleStrength: z.object({
      cervical: z.array(z.object({
        muscle: z.string(),
        strength: z.number().min(0).max(5),
        notes: z.string().optional()
      })),
      upperExtremities: z.array(z.object({
        muscle: z.string(),
        strength: z.number().min(0).max(5),
        notes: z.string().optional()
      })),
      lowerExtremities: z.array(z.object({
        muscle: z.string(),
        strength: z.number().min(0).max(5),
        notes: z.string().optional()
      })),
      trunk: z.array(z.object({
        muscle: z.string(),
        strength: z.number().min(0).max(5),
        notes: z.string().optional()
      }))
    }),
    specialTests: z.array(z.object({
      name: z.string(),
      result: z.enum(['positive', 'negative', 'equivocal']),
      notes: z.string().optional()
    }))
  }),

  // Diagnóstico
  diagnosis: z.object({
    primaryDiagnosis: z.string().min(10, 'Diagnóstico principal é obrigatório'),
    secondaryDiagnoses: z.array(z.string()),
    severity: z.enum(['mild', 'moderate', 'severe']),
    prognosis: z.string().min(10, 'Prognóstico é obrigatório')
  }),

  // Plano de tratamento
  treatmentPlan: z.object({
    goals: z.array(z.object({
      description: z.string().min(10, 'Descrição da meta é obrigatória'),
      targetDate: z.date(),
      measurable: z.boolean(),
      priority: z.enum(['high', 'medium', 'low'])
    })).min(1, 'Pelo menos uma meta é obrigatória'),
    interventions: z.array(z.object({
      type: z.string(),
      description: z.string(),
      parameters: z.record(z.any()),
      duration: z.string(),
      frequency: z.string()
    })).min(1, 'Pelo menos uma intervenção é obrigatória'),
    frequency: z.string().min(1, 'Frequência é obrigatória'),
    duration: z.string().min(1, 'Duração é obrigatória'),
    expectedOutcomes: z.array(z.string()),
    contraindications: z.array(z.string())
  }),

  // Metadados
  specialty: z.enum([
    'physiotherapy',
    'occupational_therapy',
    'speech_therapy',
    'sports_physiotherapy',
    'neurological_physiotherapy',
    'orthopedic_physiotherapy',
    'respiratory_physiotherapy',
    'pediatric_physiotherapy'
  ])
});

type AssessmentFormData = z.infer<typeof assessmentSchema>;

interface AssessmentFormProps {
  patientId: string;
  specialty: string;
  onSave: (data: AssessmentFormData) => Promise<void>;
  onSaveDraft: (data: AssessmentFormData) => Promise<void>;
  onCancel: () => void;
  initialData?: Partial<AssessmentFormData>;
  isLoading?: boolean;
}

export function AssessmentForm({
  patientId,
  specialty,
  onSave,
  onSaveDraft,
  onCancel,
  initialData,
  isLoading = false
}: AssessmentFormProps) {
  const [currentTab, setCurrentTab] = useState('complaint');
  const [progress, setProgress] = useState(0);
  const [isDraft, setIsDraft] = useState(false);

  const form = useForm<AssessmentFormData>({
    resolver: zodResolver(assessmentSchema),
    defaultValues: {
      patientId,
      specialty: specialty as any,
      chiefComplaint: {
        description: '',
        onset: new Date(),
        duration: '',
        characteristics: {
          location: [],
          quality: '',
          intensity: 0,
          frequency: '',
          pattern: ''
        },
        aggravatingFactors: [],
        relievingFactors: [],
        associatedSymptoms: []
      },
      medicalHistory: {
        pastMedicalHistory: [],
        surgicalHistory: [],
        medications: [],
        allergies: [],
        familyHistory: [],
        socialHistory: {
          occupation: '',
          lifestyle: [],
          habits: [],
          livingSituation: ''
        }
      },
      physicalExam: {
        vitalSigns: {},
        inspection: '',
        palpation: '',
        rangeOfMotion: {
          cervical: [],
          thoracic: [],
          lumbar: [],
          upperExtremities: [],
          lowerExtremities: []
        },
        muscleStrength: {
          cervical: [],
          upperExtremities: [],
          lowerExtremities: [],
          trunk: []
        },
        specialTests: []
      },
      diagnosis: {
        primaryDiagnosis: '',
        secondaryDiagnoses: [],
        severity: 'mild',
        prognosis: ''
      },
      treatmentPlan: {
        goals: [],
        interventions: [],
        frequency: '',
        duration: '',
        expectedOutcomes: [],
        contraindications: []
      },
      ...initialData
    }
  });

  const { watch, formState: { errors, isValid } } = form;
  const watchedValues = watch();

  // Calcular progresso
  useEffect(() => {
    const totalFields = Object.keys(assessmentSchema.shape).length;
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
      console.error('Error saving assessment:', error);
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

  const tabs = [
    { id: 'complaint', label: 'Queixa Principal', icon: FileText },
    { id: 'history', label: 'História Clínica', icon: Stethoscope },
    { id: 'exam', label: 'Exame Físico', icon: Activity },
    { id: 'diagnosis', label: 'Diagnóstico', icon: Target },
    { id: 'treatment', label: 'Plano de Tratamento', icon: Calendar }
  ];

  const getSpecialtyIcon = (specialty: string) => {
    switch (specialty) {
      case 'physiotherapy': return Heart;
      case 'neurological_physiotherapy': return Brain;
      case 'orthopedic_physiotherapy': return Bone;
      case 'respiratory_physiotherapy': return MdHealthAndSafety;
      case 'pediatric_physiotherapy': return Baby;
      case 'sports_physiotherapy': return Zap;
      default: return Stethoscope;
    }
  };

  const SpecialtyIcon = getSpecialtyIcon(specialty);

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-blue-100 rounded-lg">
            <SpecialtyIcon className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Avaliação Inicial - {specialty.replace('_', ' ').toUpperCase()}
            </h1>
            <p className="text-gray-600">
              Paciente: {patientId}
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
          
          <div className="flex items-center space-x-2">
            <Shield className="h-4 w-4 text-green-600" />
            <span className="text-sm text-gray-600">LGPD Compliant</span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progresso da Avaliação</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </CardContent>
      </Card>

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

            {/* Queixa Principal */}
            <TabsContent value="complaint" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <FileText className="h-5 w-5" />
                    <span>Queixa Principal</span>
                  </CardTitle>
                  <CardDescription>
                    Descreva a queixa principal do paciente e características da dor
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="chiefComplaint.description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descrição da Queixa</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Descreva detalhadamente a queixa principal do paciente..."
                            className="min-h-[100px]"
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
                      name="chiefComplaint.onset"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Data de Início</FormLabel>
                          <FormControl>
                            <Input
                              type="date"
                              {...field}
                              value={field.value ? field.value.toISOString().split('T')[0] : ''}
                              onChange={(e) => field.onChange(new Date(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="chiefComplaint.duration"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Duração</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Ex: 2 semanas, 1 mês, 3 dias"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="chiefComplaint.characteristics.quality"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Qualidade da Dor</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione a qualidade" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="pontada">Pontada</SelectItem>
                              <SelectItem value="queimacao">Queimação</SelectItem>
                              <SelectItem value="peso">Peso</SelectItem>
                              <SelectItem value="aperto">Aperto</SelectItem>
                              <SelectItem value="latejante">Latejante</SelectItem>
                              <SelectItem value="fisgada">Fisgada</SelectItem>
                              <SelectItem value="rigidez">Rigidez</SelectItem>
                              <SelectItem value="formigamento">Formigamento</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="chiefComplaint.characteristics.intensity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Intensidade da Dor (0-10)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="0"
                              max="10"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* História Clínica */}
            <TabsContent value="history" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Stethoscope className="h-5 w-5" />
                    <span>História Clínica</span>
                  </CardTitle>
                  <CardDescription>
                    Informações sobre histórico médico, cirúrgico e medicamentos
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="medicalHistory.inspection"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>História Médica Passada</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Descreva doenças anteriores, hospitalizações, etc..."
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
                    name="medicalHistory.socialHistory.occupation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ocupação</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Profissão do paciente"
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

            {/* Exame Físico */}
            <TabsContent value="exam" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Activity className="h-5 w-5" />
                    <span>Exame Físico</span>
                  </CardTitle>
                  <CardDescription>
                    Avaliação física detalhada do paciente
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="physicalExam.inspection"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Inspeção</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Descreva os achados da inspeção..."
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
                    name="physicalExam.palpation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Palpação</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Descreva os achados da palpação..."
                            className="min-h-[100px]"
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

            {/* Diagnóstico */}
            <TabsContent value="diagnosis" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Target className="h-5 w-5" />
                    <span>Diagnóstico</span>
                  </CardTitle>
                  <CardDescription>
                    Diagnóstico fisioterapêutico e prognóstico
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="diagnosis.primaryDiagnosis"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Diagnóstico Principal</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Descreva o diagnóstico principal..."
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
                    name="diagnosis.severity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Gravidade</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione a gravidade" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="mild">Leve</SelectItem>
                            <SelectItem value="moderate">Moderada</SelectItem>
                            <SelectItem value="severe">Severa</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Plano de Tratamento */}
            <TabsContent value="treatment" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5" />
                    <span>Plano de Tratamento</span>
                  </CardTitle>
                  <CardDescription>
                    Metas, intervenções e cronograma do tratamento
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="treatmentPlan.frequency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Frequência</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Ex: 3x por semana, diário, etc..."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="treatmentPlan.duration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Duração</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Ex: 6 semanas, 3 meses, etc..."
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
                    <span>Finalizar Avaliação</span>
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

