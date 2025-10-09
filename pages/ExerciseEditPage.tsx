/**
 * Página de Criação/Edição de Exercícios
 * Formulário completo e profissional para gerenciamento de exercícios
 */

import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useExercise } from '../contexts/ExerciseContext';
import { ExerciseFormSchema, ExerciseFormData } from '../schemas/exerciseValidation';
import { Exercise, ExerciseDifficulty, EquipmentType } from '../types/exercise';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Label } from '../components/ui/label';
import { Switch } from '../components/ui/switch';
import { Skeleton } from '../components/ui/skeleton';
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
  ArrowLeft,
  Save,
  X,
  Plus,
  Trash2,
  Info,
  Image,
  Video,
  Target,
  Dumbbell,
  AlertCircle,
} from 'lucide-react';

const ExerciseEditPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isNewExercise = !id || id === 'new';

  const {
    currentExercise,
    categories,
    getExercise,
    createExercise,
    updateExercise,
    getAllCategories,
    isLoading,
  } = useExercise();

  const [activeTab, setActiveTab] = useState('basic');
  const [newInstruction, setNewInstruction] = useState('');
  const [newTip, setNewTip] = useState('');
  const [newVariation, setNewVariation] = useState('');
  const [newContraindication, setNewContraindication] = useState('');
  const [newMuscle, setNewMuscle] = useState('');
  const [newSecondaryMuscle, setNewSecondaryMuscle] = useState('');
  const [newTag, setNewTag] = useState('');
  const [newKeyword, setNewKeyword] = useState('');
  const [newBodyPart, setNewBodyPart] = useState('');

  // Form
  const form = useForm<ExerciseFormData>({
    resolver: zodResolver(ExerciseFormSchema),
    defaultValues: {
      name: '',
      description: '',
      category: '',
      subcategory: '',
      targetMuscles: [],
      secondaryMuscles: [],
      equipment: ['none'],
      difficulty: 'beginner',
      instructions: [],
      tips: [],
      variations: [],
      contraindications: [],
      duration: undefined,
      sets: undefined,
      reps: undefined,
      weight: undefined,
      distance: undefined,
      restTime: undefined,
      imageUrl: '',
      videoUrl: '',
      thumbnailUrl: '',
      tags: [],
      keywords: [],
      bodyParts: [],
      source: 'user',
      sourceId: '',
      isCustom: true,
      isPublic: false,
      isActive: true,
      progressionLevel: 1,
      prerequisites: [],
    },
  });

  // Carregar dados
  useEffect(() => {
    getAllCategories();

    if (!isNewExercise && id) {
      getExercise(id);
    }
  }, [id, isNewExercise]);

  // Preencher formulário com dados do exercício
  useEffect(() => {
    if (currentExercise && !isNewExercise) {
      form.reset({
        name: currentExercise.name,
        description: currentExercise.description,
        category: currentExercise.category,
        subcategory: currentExercise.subcategory,
        targetMuscles: currentExercise.targetMuscles,
        secondaryMuscles: currentExercise.secondaryMuscles,
        equipment: currentExercise.equipment,
        difficulty: currentExercise.difficulty,
        instructions: currentExercise.instructions,
        tips: currentExercise.tips,
        variations: currentExercise.variations,
        contraindications: currentExercise.contraindications,
        duration: currentExercise.duration,
        sets: currentExercise.sets,
        reps: currentExercise.reps,
        weight: currentExercise.weight,
        distance: currentExercise.distance,
        restTime: currentExercise.restTime,
        imageUrl: currentExercise.imageUrl || '',
        videoUrl: currentExercise.videoUrl || '',
        thumbnailUrl: currentExercise.thumbnailUrl || '',
        tags: currentExercise.tags,
        keywords: currentExercise.keywords,
        bodyParts: currentExercise.bodyParts,
        source: currentExercise.source,
        sourceId: currentExercise.sourceId,
        isCustom: currentExercise.isCustom,
        isPublic: currentExercise.isPublic,
        isActive: currentExercise.isActive,
        progressionLevel: currentExercise.progressionLevel,
        prerequisites: currentExercise.prerequisites,
      });
    }
  }, [currentExercise, isNewExercise, form]);

  // Submit handler
  const onSubmit = async (data: ExerciseFormData) => {
    try {
      if (isNewExercise) {
        const newExercise = await createExercise(data);
        console.log('✅ Exercício criado:', newExercise);
        navigate('/exercises');
      } else if (id) {
        const updated = await updateExercise(id, data);
        console.log('✅ Exercício atualizado:', updated);
        navigate('/exercises');
      }
    } catch (error) {
      console.error('❌ Erro ao salvar exercício:', error);
    }
  };

  // Array handlers
  const addArrayItem = (field: keyof ExerciseFormData, value: string, setter: (val: string) => void) => {
    if (!value.trim()) return;
    
    const currentValues = form.getValues(field) as string[];
    form.setValue(field, [...currentValues, value.trim()] as any);
    setter('');
  };

  const removeArrayItem = (field: keyof ExerciseFormData, index: number) => {
    const currentValues = form.getValues(field) as string[];
    form.setValue(field, currentValues.filter((_, i) => i !== index) as any);
  };

  // Equipment handler
  const toggleEquipment = (equipment: EquipmentType) => {
    const currentEquipment = form.getValues('equipment');
    const newEquipment = currentEquipment.includes(equipment)
      ? currentEquipment.filter(eq => eq !== equipment)
      : [...currentEquipment, equipment];
    
    // Garantir pelo menos um equipamento
    if (newEquipment.length === 0) {
      newEquipment.push('none');
    }
    
    form.setValue('equipment', newEquipment);
  };

  if (isLoading && !isNewExercise) {
    return <ExerciseEditPageSkeleton />;
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/exercises')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {isNewExercise ? 'Novo Exercício' : currentExercise?.name}
            </h1>
            <p className="text-gray-500 mt-1">
              {isNewExercise
                ? 'Crie um novo exercício fisioterapêutico'
                : 'Edite as informações do exercício'}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate('/exercises')}>
            <X className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
          <Button onClick={form.handleSubmit(onSubmit)} disabled={isLoading}>
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? 'Salvando...' : 'Salvar Exercício'}
          </Button>
        </div>
      </div>

      {/* Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="basic">Básico</TabsTrigger>
              <TabsTrigger value="instructions">Instruções</TabsTrigger>
              <TabsTrigger value="parameters">Parâmetros</TabsTrigger>
              <TabsTrigger value="media">Mídia</TabsTrigger>
              <TabsTrigger value="advanced">Avançado</TabsTrigger>
            </TabsList>

            {/* Tab: Básico */}
            <TabsContent value="basic" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Informações Básicas</CardTitle>
                  <CardDescription>
                    Dados fundamentais do exercício
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Nome */}
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome do Exercício *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Ex: Agachamento Básico"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Descrição */}
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descrição *</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Descreva o exercício e seus benefícios..."
                            rows={4}
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Mínimo 10 caracteres, máximo 2000
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Categoria */}
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Categoria *</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione uma categoria" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categories.map((category) => (
                              <SelectItem key={category.id} value={category.id}>
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Subcategoria */}
                  <FormField
                    control={form.control}
                    name="subcategory"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subcategoria</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Ex: Membros Inferiores"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Dificuldade */}
                  <FormField
                    control={form.control}
                    name="difficulty"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Dificuldade *</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="beginner">Iniciante</SelectItem>
                            <SelectItem value="intermediate">Intermediário</SelectItem>
                            <SelectItem value="advanced">Avançado</SelectItem>
                            <SelectItem value="expert">Expert</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Equipamentos */}
                  <FormField
                    control={form.control}
                    name="equipment"
                    render={() => (
                      <FormItem>
                        <FormLabel>Equipamentos *</FormLabel>
                        <div className="grid grid-cols-3 gap-2">
                          {([
                            { value: 'none', label: 'Nenhum' },
                            { value: 'dumbbell', label: 'Halteres' },
                            { value: 'barbell', label: 'Barra' },
                            { value: 'resistance_band', label: 'Faixa Elástica' },
                            { value: 'stability_ball', label: 'Bola de Estabilidade' },
                            { value: 'mat', label: 'Tapete' },
                            { value: 'chair', label: 'Cadeira' },
                            { value: 'wall', label: 'Parede' },
                            { value: 'other', label: 'Outro' },
                          ] as const).map(({ value, label }) => (
                            <div
                              key={value}
                              className={`
                                p-3 border rounded-lg cursor-pointer transition-colors
                                ${form.watch('equipment').includes(value)
                                  ? 'border-primary bg-primary/10'
                                  : 'border-gray-200 hover:border-gray-300'
                                }
                              `}
                              onClick={() => toggleEquipment(value)}
                            >
                              <div className="text-sm font-medium">{label}</div>
                            </div>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Músculos Alvo */}
                  <FormField
                    control={form.control}
                    name="targetMuscles"
                    render={() => (
                      <FormItem>
                        <FormLabel>Músculos Alvo *</FormLabel>
                        <div className="flex gap-2">
                          <Input
                            placeholder="Ex: Quadríceps"
                            value={newMuscle}
                            onChange={(e) => setNewMuscle(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                addArrayItem('targetMuscles', newMuscle, setNewMuscle);
                              }
                            }}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => addArrayItem('targetMuscles', newMuscle, setNewMuscle)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {form.watch('targetMuscles').map((muscle, index) => (
                            <Badge key={index} variant="secondary" className="gap-1">
                              {muscle}
                              <button
                                type="button"
                                onClick={() => removeArrayItem('targetMuscles', index)}
                                className="ml-1 hover:text-red-600"
                                aria-label="Remover músculo alvo"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Músculos Secundários */}
                  <FormField
                    control={form.control}
                    name="secondaryMuscles"
                    render={() => (
                      <FormItem>
                        <FormLabel>Músculos Secundários</FormLabel>
                        <div className="flex gap-2">
                          <Input
                            placeholder="Ex: Isquiotibiais"
                            value={newSecondaryMuscle}
                            onChange={(e) => setNewSecondaryMuscle(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                addArrayItem('secondaryMuscles', newSecondaryMuscle, setNewSecondaryMuscle);
                              }
                            }}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => addArrayItem('secondaryMuscles', newSecondaryMuscle, setNewSecondaryMuscle)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {form.watch('secondaryMuscles').map((muscle, index) => (
                            <Badge key={index} variant="outline" className="gap-1">
                              {muscle}
                              <button
                                type="button"
                                onClick={() => removeArrayItem('secondaryMuscles', index)}
                                className="ml-1 hover:text-red-600"
                                aria-label="Remover músculo secundário"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab: Instruções */}
            <TabsContent value="instructions" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Instruções e Orientações</CardTitle>
                  <CardDescription>
                    Como executar o exercício corretamente
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Instruções */}
                  <FormField
                    control={form.control}
                    name="instructions"
                    render={() => (
                      <FormItem>
                        <FormLabel>Instruções Passo a Passo *</FormLabel>
                        <div className="flex gap-2">
                          <Textarea
                            placeholder="Ex: Fique em pé com os pés na largura dos ombros..."
                            value={newInstruction}
                            onChange={(e) => setNewInstruction(e.target.value)}
                            rows={2}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => addArrayItem('instructions', newInstruction, setNewInstruction)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="space-y-2 mt-4">
                          {form.watch('instructions').map((instruction, index) => (
                            <div key={index} className="flex gap-2 items-start p-3 bg-gray-50 rounded-lg">
                              <span className="font-bold text-primary">{index + 1}.</span>
                              <p className="flex-1 text-sm">{instruction}</p>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeArrayItem('instructions', index)}
                              >
                                <Trash2 className="h-4 w-4 text-red-600" />
                              </Button>
                            </div>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Dicas */}
                  <FormField
                    control={form.control}
                    name="tips"
                    render={() => (
                      <FormItem>
                        <FormLabel>Dicas Importantes</FormLabel>
                        <div className="flex gap-2">
                          <Input
                            placeholder="Ex: Mantenha os joelhos alinhados com os pés"
                            value={newTip}
                            onChange={(e) => setNewTip(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                addArrayItem('tips', newTip, setNewTip);
                              }
                            }}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => addArrayItem('tips', newTip, setNewTip)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="space-y-2 mt-2">
                          {form.watch('tips').map((tip, index) => (
                            <div key={index} className="flex gap-2 items-start p-2 bg-blue-50 rounded">
                              <Info className="h-4 w-4 text-blue-600 mt-0.5" />
                              <p className="flex-1 text-sm">{tip}</p>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeArrayItem('tips', index)}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Variações */}
                  <FormField
                    control={form.control}
                    name="variations"
                    render={() => (
                      <FormItem>
                        <FormLabel>Variações do Exercício</FormLabel>
                        <div className="flex gap-2">
                          <Input
                            placeholder="Ex: Agachamento com peso"
                            value={newVariation}
                            onChange={(e) => setNewVariation(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                addArrayItem('variations', newVariation, setNewVariation);
                              }
                            }}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => addArrayItem('variations', newVariation, setNewVariation)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {form.watch('variations').map((variation, index) => (
                            <Badge key={index} variant="secondary" className="gap-1">
                              {variation}
                              <button
                                type="button"
                                onClick={() => removeArrayItem('variations', index)}
                                className="ml-1 hover:text-red-600"
                                aria-label="Remover variação"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Contraindicações */}
                  <FormField
                    control={form.control}
                    name="contraindications"
                    render={() => (
                      <FormItem>
                        <FormLabel>Contraindicações</FormLabel>
                        <div className="flex gap-2">
                          <Input
                            placeholder="Ex: Lesão aguda no joelho"
                            value={newContraindication}
                            onChange={(e) => setNewContraindication(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                addArrayItem('contraindications', newContraindication, setNewContraindication);
                              }
                            }}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => addArrayItem('contraindications', newContraindication, setNewContraindication)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="space-y-2 mt-2">
                          {form.watch('contraindications').map((contraindication, index) => (
                            <div key={index} className="flex gap-2 items-start p-2 bg-red-50 rounded">
                              <AlertCircle className="h-4 w-4 text-red-600 mt-0.5" />
                              <p className="flex-1 text-sm">{contraindication}</p>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeArrayItem('contraindications', index)}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab: Parâmetros */}
            <TabsContent value="parameters" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Parâmetros de Execução</CardTitle>
                  <CardDescription>
                    Defina séries, repetições e outros parâmetros
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    {/* Duração */}
                    <FormField
                      control={form.control}
                      name="duration"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Duração (minutos)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="30"
                              {...field}
                              onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Séries */}
                    <FormField
                      control={form.control}
                      name="sets"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Séries</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="3"
                              {...field}
                              onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Repetições */}
                    <FormField
                      control={form.control}
                      name="reps"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Repetições</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="15"
                              {...field}
                              onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Peso */}
                    <FormField
                      control={form.control}
                      name="weight"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Peso (kg)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="5"
                              step="0.5"
                              {...field}
                              onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Distância */}
                    <FormField
                      control={form.control}
                      name="distance"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Distância (metros)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="100"
                              {...field}
                              onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Tempo de Descanso */}
                    <FormField
                      control={form.control}
                      name="restTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Descanso (segundos)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="60"
                              {...field}
                              onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
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

            {/* Tab: Mídia */}
            <TabsContent value="media" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Mídia e Recursos Visuais</CardTitle>
                  <CardDescription>
                    Adicione imagens e vídeos do exercício
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Imagem */}
                  <FormField
                    control={form.control}
                    name="imageUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>URL da Imagem</FormLabel>
                        <FormControl>
                          <div className="flex gap-2">
                            <Input
                              placeholder="https://exemplo.com/imagem.jpg"
                              {...field}
                            />
                            <Button type="button" variant="outline" size="icon">
                              <Image className="h-4 w-4" />
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Vídeo */}
                  <FormField
                    control={form.control}
                    name="videoUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>URL do Vídeo</FormLabel>
                        <FormControl>
                          <div className="flex gap-2">
                            <Input
                              placeholder="https://youtube.com/watch?v=..."
                              {...field}
                            />
                            <Button type="button" variant="outline" size="icon">
                              <Video className="h-4 w-4" />
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Miniatura */}
                  <FormField
                    control={form.control}
                    name="thumbnailUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>URL da Miniatura</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="https://exemplo.com/miniatura.jpg"
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

            {/* Tab: Avançado */}
            <TabsContent value="advanced" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Configurações Avançadas</CardTitle>
                  <CardDescription>
                    Tags, classificação e configurações adicionais
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Tags */}
                  <FormField
                    control={form.control}
                    name="tags"
                    render={() => (
                      <FormItem>
                        <FormLabel>Tags</FormLabel>
                        <div className="flex gap-2">
                          <Input
                            placeholder="Ex: membros inferiores"
                            value={newTag}
                            onChange={(e) => setNewTag(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                addArrayItem('tags', newTag, setNewTag);
                              }
                            }}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => addArrayItem('tags', newTag, setNewTag)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {form.watch('tags').map((tag, index) => (
                            <Badge key={index} className="gap-1">
                              #{tag}
                              <button
                                type="button"
                                onClick={() => removeArrayItem('tags', index)}
                                className="ml-1 hover:text-red-600"
                                aria-label="Remover tag"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Palavras-chave */}
                  <FormField
                    control={form.control}
                    name="keywords"
                    render={() => (
                      <FormItem>
                        <FormLabel>Palavras-chave (SEO)</FormLabel>
                        <div className="flex gap-2">
                          <Input
                            placeholder="Ex: squat, legs"
                            value={newKeyword}
                            onChange={(e) => setNewKeyword(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                addArrayItem('keywords', newKeyword, setNewKeyword);
                              }
                            }}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => addArrayItem('keywords', newKeyword, setNewKeyword)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {form.watch('keywords').map((keyword, index) => (
                            <Badge key={index} variant="outline" className="gap-1">
                              {keyword}
                              <button
                                type="button"
                                onClick={() => removeArrayItem('keywords', index)}
                                className="ml-1 hover:text-red-600"
                                aria-label="Remover palavra-chave"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Partes do Corpo */}
                  <FormField
                    control={form.control}
                    name="bodyParts"
                    render={() => (
                      <FormItem>
                        <FormLabel>Partes do Corpo</FormLabel>
                        <div className="flex gap-2">
                          <Input
                            placeholder="Ex: Pernas"
                            value={newBodyPart}
                            onChange={(e) => setNewBodyPart(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                addArrayItem('bodyParts', newBodyPart, setNewBodyPart);
                              }
                            }}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => addArrayItem('bodyParts', newBodyPart, setNewBodyPart)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {form.watch('bodyParts').map((part, index) => (
                            <Badge key={index} variant="secondary" className="gap-1">
                              {part}
                              <button
                                type="button"
                                onClick={() => removeArrayItem('bodyParts', index)}
                                className="ml-1 hover:text-red-600"
                                aria-label="Remover parte do corpo"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Nível de Progressão */}
                  <FormField
                    control={form.control}
                    name="progressionLevel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nível de Progressão (1-5)</FormLabel>
                        <Select
                          onValueChange={(value) => field.onChange(parseInt(value))}
                          value={field.value?.toString()}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="1">Nível 1</SelectItem>
                            <SelectItem value="2">Nível 2</SelectItem>
                            <SelectItem value="3">Nível 3</SelectItem>
                            <SelectItem value="4">Nível 4</SelectItem>
                            <SelectItem value="5">Nível 5</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Switches */}
                  <div className="space-y-4 pt-4 border-t">
                    <FormField
                      control={form.control}
                      name="isPublic"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <FormLabel>Exercício Público</FormLabel>
                            <FormDescription>
                              Disponível para outros profissionais
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="isActive"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <FormLabel>Exercício Ativo</FormLabel>
                            <FormDescription>
                              Exercício disponível para uso
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Action Buttons - Fixed at bottom */}
          <div className="sticky bottom-0 bg-white border-t pt-4 flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/exercises')}
              disabled={isLoading}
            >
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? 'Salvando...' : 'Salvar Exercício'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

// Skeleton Loading
const ExerciseEditPageSkeleton: React.FC = () => {
  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <div>
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>

      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default ExerciseEditPage;
