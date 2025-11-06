/**
 * Página de Criação/Edição de Protocolos
 * Formulário completo para protocolos de exercícios
 */

import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useExercise } from '../contexts/ExerciseContext';
import { ExerciseProtocolSchema } from '../schemas/exerciseValidation';
import { ExerciseProtocol, ProtocolExercise, Exercise } from '../types/exercise';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
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
import { ExerciseSelector } from '../components/protocols/ExerciseSelector';
import { ProtocolPreview } from '../components/protocols/ProtocolPreview';
import {
  ArrowLeft,
  Save,
  X,
  Plus,
  Trash2,
  GripVertical,
  Edit2,
} from 'lucide-react';

interface ProtocolFormData {
  name: string;
  description: string;
  duration: number;
  frequency: number;
  intensity: 'low' | 'moderate' | 'high' | 'very_high';
  targetConditions: string[];
  isPublic: boolean;
  isActive: boolean;
}

const ProtocolEditPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isNewProtocol = !id || id === 'new';

  const {
    protocols,
    exercises: allExercises,
    createProtocol,
    updateProtocol,
    getAllProtocols,
    getAllExercises,
    isLoading,
  } = useExercise();

  const [activeTab, setActiveTab] = useState('basic');
  const [showExerciseSelector, setShowExerciseSelector] = useState(false);
  const [protocolExercises, setProtocolExercises] = useState<ProtocolExercise[]>([]);
  const [newCondition, setNewCondition] = useState('');
  const [editingExerciseIndex, setEditingExerciseIndex] = useState<number | null>(null);

  // Form
  const form = useForm<ProtocolFormData>({
    defaultValues: {
      name: '',
      description: '',
      duration: 4,
      frequency: 3,
      intensity: 'moderate',
      targetConditions: [],
      isPublic: false,
      isActive: true,
    },
  });

  // Carregar dados
  useEffect(() => {
    getAllProtocols();
    getAllExercises();

    if (!isNewProtocol && id) {
      const protocol = protocols.find(p => p.id === id);
      if (protocol) {
        form.reset({
          name: protocol.name,
          description: protocol.description,
          duration: protocol.duration,
          frequency: protocol.frequency,
          intensity: protocol.intensity,
          targetConditions: protocol.targetConditions,
          isPublic: protocol.isPublic,
          isActive: protocol.isActive,
        });
        setProtocolExercises(protocol.exercises);
      }
    }
  }, [id, isNewProtocol, protocols]);

  // Submit handler
  const onSubmit = async (data: ProtocolFormData) => {
    try {
      if (protocolExercises.length === 0) {
        alert('Adicione pelo menos um exercício ao protocolo');
        return;
      }

      const protocolData = {
        ...data,
        exercises: protocolExercises,
      };

      if (isNewProtocol) {
        const newProtocol = await createProtocol(protocolData);
        
        navigate('/protocols');
      } else if (id) {
        const updated = await updateProtocol(id, protocolData);
        
        navigate('/protocols');
      }
    } catch (error) {
      console.error('❌ Erro ao salvar protocolo:', error);
    }
  };

  // Exercise handlers
  const handleAddExercises = (exercises: Exercise[]) => {
    const newExercises: ProtocolExercise[] = exercises.map((ex, index) => ({
      exerciseId: ex.id,
      exercise: ex,
      order: protocolExercises.length + index + 1,
      sets: ex.sets || 3,
      reps: ex.reps || 12,
      duration: ex.duration,
      weight: ex.weight,
      restTime: ex.restTime || 60,
      notes: '',
      isOptional: false,
    }));

    setProtocolExercises([...protocolExercises, ...newExercises]);
    setShowExerciseSelector(false);
  };

  const removeExercise = (index: number) => {
    const updated = protocolExercises.filter((_, i) => i !== index);
    // Reordenar
    updated.forEach((ex, i) => {
      ex.order = i + 1;
    });
    setProtocolExercises(updated);
  };

  const updateExerciseConfig = (index: number, field: keyof ProtocolExercise, value: any) => {
    const updated = [...protocolExercises];
    updated[index] = { ...updated[index], [field]: value };
    setProtocolExercises(updated);
  };

  const moveExercise = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === protocolExercises.length - 1)
    ) {
      return;
    }

    const updated = [...protocolExercises];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [updated[index], updated[targetIndex]] = [updated[targetIndex], updated[index]];
    
    // Atualizar ordem
    updated.forEach((ex, i) => {
      ex.order = i + 1;
    });
    
    setProtocolExercises(updated);
  };

  const addCondition = () => {
    if (newCondition.trim()) {
      form.setValue('targetConditions', [...form.getValues('targetConditions'), newCondition.trim()]);
      setNewCondition('');
    }
  };

  const removeCondition = (index: number) => {
    const current = form.getValues('targetConditions');
    form.setValue('targetConditions', current.filter((_, i) => i !== index));
  };

  if (isLoading && !isNewProtocol) {
    return <ProtocolEditPageSkeleton />;
  }

  return (
    <div className="p-lg space-y-xl max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-md">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/protocols')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-neutral-text">
              {isNewProtocol ? 'Novo Protocolo' : 'Editar Protocolo'}
            </h1>
            <p className="text-gray-500 mt-xs">
              {isNewProtocol
                ? 'Crie um novo protocolo de exercícios'
                : 'Edite o protocolo de tratamento'}
            </p>
          </div>
        </div>
        <div className="flex gap-sm">
          <Button variant="outline" onClick={() => navigate('/protocols')}>
            <X className="h-4 w-4 mr-sm" />
            Cancelar
          </Button>
          <Button onClick={form.handleSubmit(onSubmit)} disabled={isLoading}>
            <Save className="h-4 w-4 mr-sm" />
            {isLoading ? 'Salvando...' : 'Salvar Protocolo'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg">
        {/* Formulário */}
        <div className="lg:col-span-2">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-xl">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="basic">Básico</TabsTrigger>
                  <TabsTrigger value="exercises">Exercícios ({protocolExercises.length})</TabsTrigger>
                  <TabsTrigger value="advanced">Avançado</TabsTrigger>
                </TabsList>

                {/* Tab: Básico */}
                <TabsContent value="basic" className="space-y-md">
                  <Card>
                    <CardHeader>
                      <CardTitle>Informações do Protocolo</CardTitle>
                      <CardDescription>
                        Dados fundamentais do protocolo de tratamento
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-md">
                      {/* Nome */}
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nome do Protocolo *</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Ex: Protocolo Pós-Operatório Joelho"
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
                                placeholder="Descreva o protocolo, objetivos e indicações..."
                                rows={4}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-2 gap-md">
                        {/* Duração */}
                        <FormField
                          control={form.control}
                          name="duration"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Duração (semanas) *</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  min={1}
                                  max={52}
                                  {...field}
                                  onChange={(e) => field.onChange(parseInt(e.target.value))}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Frequência */}
                        <FormField
                          control={form.control}
                          name="frequency"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Frequência (sessões/semana) *</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  min={1}
                                  max={7}
                                  {...field}
                                  onChange={(e) => field.onChange(parseInt(e.target.value))}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Intensidade */}
                      <FormField
                        control={form.control}
                        name="intensity"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Intensidade *</FormLabel>
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
                                <SelectItem value="low">Baixa</SelectItem>
                                <SelectItem value="moderate">Moderada</SelectItem>
                                <SelectItem value="high">Alta</SelectItem>
                                <SelectItem value="very_high">Muito Alta</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Tab: Exercícios */}
                <TabsContent value="exercises" className="space-y-md">
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle>Exercícios do Protocolo</CardTitle>
                          <CardDescription>
                            Adicione e configure os exercícios
                          </CardDescription>
                        </div>
                        <Button
                          type="button"
                          onClick={() => setShowExerciseSelector(true)}
                        >
                          <Plus className="h-4 w-4 mr-sm" />
                          Adicionar Exercícios
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {protocolExercises.length > 0 ? (
                        <div className="space-y-sm">
                          {protocolExercises.map((ex, index) => (
                            <Card key={index} className="p-md">
                              <div className="flex gap-md">
                                {/* Drag Handle */}
                                <div className="flex flex-col gap-1">
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => moveExercise(index, 'up')}
                                    disabled={index === 0}
                                  >
                                    ↑
                                  </Button>
                                  <GripVertical className="h-5 w-5 text-neutral-textTertiary" />
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => moveExercise(index, 'down')}
                                    disabled={index === protocolExercises.length - 1}
                                  >
                                    ↓
                                  </Button>
                                </div>

                                {/* Exercise Info */}
                                <div className="flex-1 space-y-sm">
                                  <div className="flex items-start justify-between">
                                    <div>
                                      <div className="flex items-center gap-sm">
                                        <span className="font-bold text-primary">#{ex.order}</span>
                                        <h4 className="font-medium">{ex.exercise?.name}</h4>
                                        {ex.isOptional && (
                                          <Badge variant="secondary" className="text-xs">
                                            Opcional
                                          </Badge>
                                        )}
                                      </div>
                                      <p className="text-sm text-neutral-textSecondary mt-xs">
                                        {ex.exercise?.description}
                                      </p>
                                    </div>
                                    <div className="flex gap-1">
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setEditingExerciseIndex(index)}
                                      >
                                        <Edit2 className="h-4 w-4" />
                                      </Button>
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => removeExercise(index)}
                                        className="text-error"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </div>

                                  {/* Configuração */}
                                  {editingExerciseIndex === index ? (
                                    <div className="grid grid-cols-3 gap-md p-md bg-neutral-bgAlt rounded-lg">
                                      <div>
                                        <label className="text-xs text-neutral-textSecondary">Séries</label>
                                        <Input
                                          type="number"
                                          min={1}
                                          value={ex.sets}
                                          onChange={(e) => updateExerciseConfig(index, 'sets', parseInt(e.target.value))}
                                          className="mt-xs"
                                        />
                                      </div>
                                      <div>
                                        <label className="text-xs text-neutral-textSecondary">Repetições</label>
                                        <Input
                                          type="number"
                                          min={1}
                                          value={ex.reps}
                                          onChange={(e) => updateExerciseConfig(index, 'reps', parseInt(e.target.value))}
                                          className="mt-xs"
                                        />
                                      </div>
                                      <div>
                                        <label className="text-xs text-neutral-textSecondary">Peso (kg)</label>
                                        <Input
                                          type="number"
                                          min={0}
                                          step={0.5}
                                          value={ex.weight || ''}
                                          onChange={(e) => updateExerciseConfig(index, 'weight', e.target.value ? parseFloat(e.target.value) : undefined)}
                                          className="mt-xs"
                                        />
                                      </div>
                                      <div>
                                        <label className="text-xs text-neutral-textSecondary">Duração (min)</label>
                                        <Input
                                          type="number"
                                          min={0}
                                          value={ex.duration || ''}
                                          onChange={(e) => updateExerciseConfig(index, 'duration', e.target.value ? parseInt(e.target.value) : undefined)}
                                          className="mt-xs"
                                        />
                                      </div>
                                      <div>
                                        <label className="text-xs text-neutral-textSecondary">Descanso (s)</label>
                                        <Input
                                          type="number"
                                          min={0}
                                          value={ex.restTime}
                                          onChange={(e) => updateExerciseConfig(index, 'restTime', parseInt(e.target.value))}
                                          className="mt-xs"
                                        />
                                      </div>
                                      <div className="flex items-end">
                                        <label className="flex items-center gap-sm cursor-pointer">
                                          <input
                                            type="checkbox"
                                            checked={ex.isOptional}
                                            onChange={(e) => updateExerciseConfig(index, 'isOptional', e.target.checked)}
                                            className="rounded"
                                          />
                                          <span className="text-xs">Opcional</span>
                                        </label>
                                      </div>
                                      <div className="col-span-3">
                                        <label className="text-xs text-neutral-textSecondary">Notas</label>
                                        <Textarea
                                          value={ex.notes}
                                          onChange={(e) => updateExerciseConfig(index, 'notes', e.target.value)}
                                          placeholder="Observações específicas..."
                                          rows={2}
                                          className="mt-xs"
                                        />
                                      </div>
                                      <div className="col-span-3 flex justify-end">
                                        <Button
                                          type="button"
                                          size="sm"
                                          onClick={() => setEditingExerciseIndex(null)}
                                        >
                                          Concluir Edição
                                        </Button>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="flex gap-md text-sm text-neutral-textSecondary">
                                      <span>{ex.sets} séries</span>
                                      <span>{ex.reps} reps</span>
                                      {ex.weight && <span>{ex.weight}kg</span>}
                                      {ex.duration && <span>{ex.duration}min</span>}
                                      {ex.restTime && <span>{ex.restTime}s descanso</span>}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </Card>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-12 text-gray-500">
                          <p className="mb-sm">Nenhum exercício adicionado ainda</p>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setShowExerciseSelector(true)}
                          >
                            <Plus className="h-4 w-4 mr-sm" />
                            Adicionar Exercícios
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Tab: Avançado */}
                <TabsContent value="advanced" className="space-y-md">
                  <Card>
                    <CardHeader>
                      <CardTitle>Configurações Avançadas</CardTitle>
                      <CardDescription>
                        Condições alvo e configurações adicionais
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-md">
                      {/* Condições Alvo */}
                      <FormField
                        control={form.control}
                        name="targetConditions"
                        render={() => (
                          <FormItem>
                            <FormLabel>Condições Alvo</FormLabel>
                            <div className="flex gap-sm">
                              <Input
                                placeholder="Ex: Pós-operatório LCA"
                                value={newCondition}
                                onChange={(e) => setNewCondition(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    addCondition();
                                  }
                                }}
                              />
                              <Button
                                type="button"
                                variant="outline"
                                onClick={addCondition}
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                            <div className="flex flex-wrap gap-sm mt-sm">
                              {form.watch('targetConditions').map((condition, index) => (
                                <Badge key={index} variant="secondary" className="gap-1">
                                  {condition}
                                  <button
                                    type="button"
                                    onClick={() => removeCondition(index)}
                                    className="ml-xs hover:text-error"
                                    aria-label="Remover condição"
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

                      {/* Switches */}
                      <div className="space-y-md pt-4 border-t">
                        <FormField
                          control={form.control}
                          name="isPublic"
                          render={({ field }) => (
                            <FormItem className="flex items-center justify-between">
                              <div className="space-y-0.5">
                                <FormLabel>Protocolo Público</FormLabel>
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
                                <FormLabel>Protocolo Ativo</FormLabel>
                                <FormDescription>
                                  Protocolo disponível para uso
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
            </form>
          </Form>
        </div>

        {/* Preview */}
        <div className="lg:col-span-1">
          <div className="sticky top-lg">
            <ProtocolPreview
              protocol={form.getValues()}
              exercises={protocolExercises}
            />
          </div>
        </div>
      </div>

      {/* Exercise Selector Modal */}
      <ExerciseSelector
        open={showExerciseSelector}
        onClose={() => setShowExerciseSelector(false)}
        onSelect={handleAddExercises}
        selectedIds={protocolExercises.map(pe => pe.exerciseId)}
      />
    </div>
  );
};

// Skeleton Loading
const ProtocolEditPageSkeleton: React.FC = () => {
  return (
    <div className="p-lg space-y-xl max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-md">
          <Skeleton className="h-10 w-10" />
          <div>
            <Skeleton className="h-8 w-64 mb-sm" />
            <Skeleton className="h-4 w-96" />
          </div>
        </div>
        <Skeleton className="h-10 w-32" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent className="space-y-md">
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-sm">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-1">
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    </div>
  );
};

export default ProtocolEditPage;

