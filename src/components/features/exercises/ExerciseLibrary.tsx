'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Badge } from '~/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select';
import { Plus, Search, Play, Image as ImageIcon } from 'lucide-react';
import { getExercises } from '~/lib/actions/exercises';
import { toast } from 'sonner';

interface Exercise {
  id: string;
  name: string;
  category: string;
  description?: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  equipment?: string[];
  video_url?: string;
  image_urls?: string[];
}

export function ExerciseLibrary() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');

  const loadExercises = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getExercises({
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
        difficulty: selectedDifficulty !== 'all' ? selectedDifficulty : undefined,
        search: searchQuery || undefined,
      });
      if (result.data) {
        setExercises(result.data as Exercise[]);
      }
    } catch (error) {
      toast.error('Erro ao carregar exercícios');
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, selectedDifficulty, searchQuery]);

  useEffect(() => {
    loadExercises();
  }, [loadExercises]);

  const filteredExercises = exercises.filter((exercise) => {
    if (searchQuery && !exercise.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  });

  const getDifficultyBadge = (difficulty: string) => {
    const variants = {
      beginner: 'default',
      intermediate: 'secondary',
      advanced: 'destructive',
    };
    return variants[difficulty as keyof typeof variants] || 'secondary';
  };

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Biblioteca de Exercícios</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar exercício..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="strengthening">Fortalecimento</SelectItem>
                <SelectItem value="stretching">Alongamento</SelectItem>
                <SelectItem value="mobility">Mobilidade</SelectItem>
                <SelectItem value="proprioception">Propriocepção</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Dificuldade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="beginner">Iniciante</SelectItem>
                <SelectItem value="intermediate">Intermediário</SelectItem>
                <SelectItem value="advanced">Avançado</SelectItem>
              </SelectContent>
            </Select>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Novo Exercício
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Grid de exercícios */}
      {loading ? (
        <div className="text-center py-8 text-muted-foreground">
          Carregando...
        </div>
      ) : filteredExercises.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          Nenhum exercício encontrado
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredExercises.map((exercise) => (
            <Card key={exercise.id} className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">{exercise.name}</CardTitle>
                  <Badge variant={getDifficultyBadge(exercise.difficulty) as any}>
                    {exercise.difficulty === 'beginner' ? 'Iniciante' : exercise.difficulty === 'intermediate' ? 'Intermediário' : 'Avançado'}
                  </Badge>
                </div>
                <Badge variant="outline">{exercise.category}</Badge>
              </CardHeader>
              <CardContent>
                {exercise.image_urls && exercise.image_urls.length > 0 ? (
                  <div className="relative h-32 mb-2 rounded overflow-hidden bg-muted">
                    <ImageIcon className="absolute inset-0 m-auto h-8 w-8 text-muted-foreground" />
                  </div>
                ) : (
                  <div className="h-32 mb-2 rounded bg-muted flex items-center justify-center">
                    <ImageIcon className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
                {exercise.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                    {exercise.description}
                  </p>
                )}
                {exercise.equipment && exercise.equipment.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {exercise.equipment.slice(0, 2).map((eq, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {eq}
                      </Badge>
                    ))}
                  </div>
                )}
                <div className="flex gap-2">
                  {exercise.video_url && (
                    <Button variant="outline" size="sm" className="flex-1">
                      <Play className="mr-2 h-4 w-4" />
                      Ver Vídeo
                    </Button>
                  )}
                  <Button variant="outline" size="sm" className="flex-1">
                    Prescrever
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

