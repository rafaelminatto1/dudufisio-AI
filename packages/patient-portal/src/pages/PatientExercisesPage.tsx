/**
 * Página de Exercícios do Paciente
 * MoocaFisio - App para Pacientes
 */

import { useState, useEffect } from 'react';
import { getExercises, Exercise } from '../services/patientExerciseService';
import PatientLayout from '../components/PatientLayout';
import Card from '../components/ui/Card';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ExerciseCard from '../components/ExerciseCard';
import ExerciseModal from '../components/ExerciseModal';
import { Filter } from 'lucide-react';
import { cn } from '../lib/utils';

type FilterType = 'all' | 'pending' | 'completed';

export default function PatientExercisesPage() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  
  useEffect(() => {
    loadExercises();
  }, [filter]);
  
  const loadExercises = async () => {
    try {
      setLoading(true);
      const data = await getExercises(filter);
      setExercises(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar exercícios');
    } finally {
      setLoading(false);
    }
  };
  
  const handleExerciseComplete = () => {
    // Recarregar lista para atualizar status
    loadExercises();
    setSelectedExercise(null);
  };
  
  const filters: { value: FilterType; label: string }[] = [
    { value: 'all', label: 'Todos' },
    { value: 'pending', label: 'Pendentes' },
    { value: 'completed', label: 'Concluídos' },
  ];
  
  return (
    <PatientLayout>
      {/* Header */}
      <div className="mb-lg">
        <h1 className="text-h2 text-neutral-text mb-sm">
          Meus Exercícios
        </h1>
        <p className="text-body text-neutral-textSecondary">
          Exercícios prescritos pelo seu fisioterapeuta
        </p>
      </div>
      
      {/* Filters */}
      <div className="flex items-center gap-md mb-lg flex-wrap">
        <div className="flex items-center gap-sm text-neutral-textSecondary">
          <Filter className="w-5 h-5" />
          <span className="text-small font-medium">Filtrar:</span>
        </div>
        {filters.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={cn(
              'px-lg py-sm rounded-lg text-small font-medium transition-colors',
              filter === f.value
                ? 'bg-primary text-white'
                : 'bg-white text-neutral-text border border-neutral-border hover:bg-neutral-bgAlt'
            )}
          >
            {f.label}
          </button>
        ))}
      </div>
      
      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-2xl">
          <LoadingSpinner size="lg" />
        </div>
      )}
      
      {/* Error State */}
      {error && !loading && (
        <Card>
          <div className="text-center py-xl">
            <p className="text-body text-error mb-md">{error}</p>
            <button
              onClick={loadExercises}
              className="text-primary hover:underline"
            >
              Tentar novamente
            </button>
          </div>
        </Card>
      )}
      
      {/* Empty State */}
      {!loading && !error && exercises.length === 0 && (
        <Card>
          <div className="text-center py-2xl">
            <div className="w-16 h-16 bg-neutral-bgAlt rounded-full flex items-center justify-center mx-auto mb-md">
              <Filter className="w-8 h-8 text-neutral-textSecondary" />
            </div>
            <h3 className="text-h4 text-neutral-text mb-sm">
              Nenhum exercício encontrado
            </h3>
            <p className="text-body text-neutral-textSecondary mb-lg">
              {filter === 'pending'
                ? 'Você completou todos os exercícios! 🎉'
                : filter === 'completed'
                ? 'Você ainda não completou nenhum exercício.'
                : 'Você ainda não tem exercícios prescritos.'}
            </p>
            {filter !== 'all' && (
              <button
                onClick={() => setFilter('all')}
                className="text-primary hover:underline font-medium"
              >
                Ver todos os exercícios
              </button>
            )}
          </div>
        </Card>
      )}
      
      {/* Exercise Grid */}
      {!loading && !error && exercises.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg mb-lg">
            {exercises.map((exercise) => (
              <ExerciseCard
                key={exercise.id}
                exercise={exercise}
                onClick={() => setSelectedExercise(exercise)}
              />
            ))}
          </div>
          
          <div className="text-center text-small text-neutral-textSecondary">
            {exercises.length} exercício{exercises.length !== 1 ? 's' : ''} encontrado{exercises.length !== 1 ? 's' : ''}
          </div>
        </>
      )}
      
      {/* Exercise Modal */}
      {selectedExercise && (
        <ExerciseModal
          exercise={selectedExercise}
          onClose={() => setSelectedExercise(null)}
          onComplete={handleExerciseComplete}
        />
      )}
    </PatientLayout>
  );
}

