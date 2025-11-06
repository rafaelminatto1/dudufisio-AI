/**
 * Página de Criação/Edição de Templates
 * Editor de templates de exercícios reutilizáveis
 */

import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ExerciseTemplateSchema } from '../schemas/exerciseValidation';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Switch } from '../components/ui/switch';
import { ExerciseSelector } from '../components/protocols/ExerciseSelector';
import { Exercise } from '../types/exercise';
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
} from 'lucide-react';

interface TemplateFormData {
  name: string;
  description: string;
  category: string;
  targetAudience: string[];
  duration: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  isPublic: boolean;
}

const TemplateEditPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isNewTemplate = !id || id === 'new';

  const [showExerciseSelector, setShowExerciseSelector] = useState(false);
  const [templateExercises, setTemplateExercises] = useState<any[]>([]);
  const [newAudience, setNewAudience] = useState('');

  const form = useForm<TemplateFormData>({
    defaultValues: {
      name: '',
      description: '',
      category: '',
      targetAudience: [],
      duration: 4,
      difficulty: 'beginner',
      isPublic: false,
    },
  });

  const handleAddExercises = (exercises: Exercise[]) => {
    const newExercises = exercises.map((ex, index) => ({
      exerciseId: ex.id,
      exercise: ex,
      order: templateExercises.length + index + 1,
      sets: ex.sets || 3,
      reps: ex.reps || 12,
      duration: ex.duration,
      weight: ex.weight,
      restTime: ex.restTime || 60,
      notes: '',
    }));

    setTemplateExercises([...templateExercises, ...newExercises]);
    setShowExerciseSelector(false);
  };

  const removeExercise = (index: number) => {
    const updated = templateExercises.filter((_, i) => i !== index);
    updated.forEach((ex, i) => {
      ex.order = i + 1;
    });
    setTemplateExercises(updated);
  };

  const addAudience = () => {
    if (newAudience.trim()) {
      form.setValue('targetAudience', [...form.getValues('targetAudience'), newAudience.trim()]);
      setNewAudience('');
    }
  };

  const removeAudience = (index: number) => {
    const current = form.getValues('targetAudience');
    form.setValue('targetAudience', current.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: TemplateFormData) => {
    if (templateExercises.length === 0) {
      alert('Adicione pelo menos um exercício ao template');
      return;
    }

    
    navigate('/templates');
  };

  return (
    <div className="p-lg space-y-xl max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-md">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/templates')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-neutral-text">
              {isNewTemplate ? 'Novo Template' : 'Editar Template'}
            </h1>
            <p className="text-gray-500 mt-xs">
              Crie templates reutilizáveis de exercícios
            </p>
          </div>
        </div>
        <div className="flex gap-sm">
          <Button variant="outline" onClick={() => navigate('/templates')}>
            <X className="h-4 w-4 mr-sm" />
            Cancelar
          </Button>
          <Button onClick={form.handleSubmit(onSubmit)}>
            <Save className="h-4 w-4 mr-sm" />
            Salvar Template
          </Button>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-xl">
          {/* Informações Básicas */}
          <Card>
            <CardHeader>
              <CardTitle>Informações do Template</CardTitle>
              <CardDescription>
                Dados fundamentais do template
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-md">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do Template *</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Programa Reabilitação Joelho" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Descreva o template e suas aplicações..."
                        rows={4}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-md">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Categoria *</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Reabilitação" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="difficulty"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dificuldade *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
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
              </div>

              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duração (semanas)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Público-Alvo */}
              <FormField
                control={form.control}
                name="targetAudience"
                render={() => (
                  <FormItem>
                    <FormLabel>Público-Alvo</FormLabel>
                    <div className="flex gap-sm">
                      <Input
                        placeholder="Ex: Pós-operatório, Idosos"
                        value={newAudience}
                        onChange={(e) => setNewAudience(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addAudience();
                          }
                        }}
                      />
                      <Button type="button" variant="outline" onClick={addAudience}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-sm mt-sm">
                      {form.watch('targetAudience').map((audience, index) => (
                        <Badge key={index} className="gap-1">
                          {audience}
                          <button
                            type="button"
                            onClick={() => removeAudience(index)}
                            className="ml-xs hover:text-error"
                            aria-label="Remover público"
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

              <FormField
                control={form.control}
                name="isPublic"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between border-t pt-4">
                    <div className="space-y-0.5">
                      <FormLabel>Template Público</FormLabel>
                      <FormDescription>
                        Disponível para outros profissionais
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Exercícios */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Exercícios do Template</CardTitle>
                  <CardDescription>
                    Adicione exercícios ao template
                  </CardDescription>
                </div>
                <Button
                  type="button"
                  onClick={() => setShowExerciseSelector(true)}
                >
                  <Plus className="h-4 w-4 mr-sm" />
                  Adicionar
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {templateExercises.length > 0 ? (
                <div className="space-y-sm">
                  {templateExercises.map((ex, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-md bg-neutral-bgAlt rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-sm">
                          <span className="font-bold text-primary">#{ex.order}</span>
                          <span className="font-medium">{ex.exercise.name}</span>
                        </div>
                        <div className="flex gap-md text-sm text-neutral-textSecondary mt-xs">
                          <span>{ex.sets} séries</span>
                          <span>{ex.reps} reps</span>
                          {ex.weight && <span>{ex.weight}kg</span>}
                        </div>
                      </div>
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
                  ))}
                </div>
              ) : (
                <div className="text-center py-3xl text-gray-500">
                  <p className="mb-sm">Nenhum exercício adicionado</p>
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
        </form>
      </Form>

      <ExerciseSelector
        open={showExerciseSelector}
        onClose={() => setShowExerciseSelector(false)}
        onSelect={handleAddExercises}
        selectedIds={templateExercises.map(te => te.exerciseId)}
      />
    </div>
  );
};

export default TemplateEditPage;

