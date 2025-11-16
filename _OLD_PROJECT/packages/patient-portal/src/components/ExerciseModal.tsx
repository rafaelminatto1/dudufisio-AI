/**
 * Modal de Detalhes do Exercício com Vídeo
 * MoocaFisio - App para Pacientes
 */

import { useState } from 'react';
import { Exercise, completeExercise } from '../services/patientExerciseService';
import Button from './ui/Button';
import LoadingSpinner from './ui/LoadingSpinner';
import VideoPlayer from './VideoPlayer';
import { X, CheckCircle2, Repeat, Clock, AlertCircle } from 'lucide-react';
import { formatDuration } from '../lib/utils';

interface ExerciseModalProps {
  exercise: Exercise;
  onClose: () => void;
  onComplete: () => void;
}

export default function ExerciseModal({ exercise, onClose, onComplete }: ExerciseModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const handleComplete = async () => {
    if (exercise.completed) {
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      await completeExercise(exercise.id);
      onComplete();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao marcar como concluído');
    } finally {
      setLoading(false);
    }
  };
  
  // Click fora do modal para fechar
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };
  
  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-md overflow-y-auto"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto my-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-neutral-border px-lg py-md flex items-start justify-between z-10">
          <div className="flex-1 pr-md">
            <h2 className="text-h3 text-neutral-text font-semibold mb-xs">
              {exercise.name}
            </h2>
            {exercise.completed && (
              <div className="inline-flex items-center gap-xs text-success text-small font-medium">
                <CheckCircle2 className="w-4 h-4" />
                <span>Concluído hoje</span>
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-neutral-textSecondary hover:text-neutral-text transition-colors p-sm -mr-sm"
            aria-label="Fechar"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-lg">
          {/* Vídeo */}
          {exercise.video && (
            <div className="mb-lg">
              <VideoPlayer video={exercise.video} />
            </div>
          )}
          
          {/* Exercise Parameters */}
          <div className="grid grid-cols-3 gap-md mb-lg">
            <div className="bg-neutral-bgAlt p-md rounded-lg text-center">
              <div className="flex items-center justify-center gap-xs text-neutral-textSecondary mb-xs">
                <Repeat className="w-4 h-4" />
                <p className="text-small">Séries</p>
              </div>
              <p className="text-h3 text-neutral-text font-bold">
                {exercise.sets}
              </p>
            </div>
            
            <div className="bg-neutral-bgAlt p-md rounded-lg text-center">
              <div className="flex items-center justify-center gap-xs text-neutral-textSecondary mb-xs">
                <Repeat className="w-4 h-4" />
                <p className="text-small">Repetições</p>
              </div>
              <p className="text-h3 text-neutral-text font-bold">
                {exercise.reps}
              </p>
            </div>
            
            <div className="bg-neutral-bgAlt p-md rounded-lg text-center">
              <div className="flex items-center justify-center gap-xs text-neutral-textSecondary mb-xs">
                <Clock className="w-4 h-4" />
                <p className="text-small">Duração</p>
              </div>
              <p className="text-h3 text-neutral-text font-bold">
                {exercise.durationSeconds ? formatDuration(exercise.durationSeconds) : '-'}
              </p>
            </div>
          </div>
          
          {/* Rest Time */}
          {exercise.restSeconds && (
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-md mb-lg">
              <p className="text-small text-primary font-medium">
                💡 Descanso recomendado: {formatDuration(exercise.restSeconds)} entre as séries
              </p>
            </div>
          )}
          
          {/* Instructions */}
          {exercise.instructions && (
            <div className="mb-lg">
              <h3 className="text-h4 text-neutral-text font-semibold mb-sm flex items-center gap-sm">
                <AlertCircle className="w-5 h-5 text-primary" />
                Instruções
              </h3>
              <p className="text-body text-neutral-textSecondary whitespace-pre-line">
                {exercise.instructions}
              </p>
            </div>
          )}
          
          {/* Description */}
          {exercise.description && (
            <div className="mb-lg">
              <h3 className="text-h4 text-neutral-text font-semibold mb-sm">
                Sobre o Exercício
              </h3>
              <p className="text-body text-neutral-textSecondary">
                {exercise.description}
              </p>
            </div>
          )}
          
          {/* Notes */}
          {exercise.notes && (
            <div className="mb-lg">
              <h3 className="text-h4 text-neutral-text font-semibold mb-sm">
                Observações do Fisioterapeuta
              </h3>
              <div className="bg-secondary/5 border border-secondary/20 rounded-lg p-md">
                <p className="text-body text-neutral-text">
                  {exercise.notes}
                </p>
              </div>
            </div>
          )}
          
          {/* Error Message */}
          {error && (
            <div className="mb-lg bg-error-light text-error px-lg py-md rounded-lg text-small">
              {error}
            </div>
          )}
          
          {/* Action Buttons */}
          <div className="flex gap-md pt-lg border-t border-neutral-border">
            <Button
              variant="outline"
              size="lg"
              onClick={onClose}
              className="flex-1"
            >
              Fechar
            </Button>
            
            {!exercise.completed && (
              <Button
                variant="primary"
                size="lg"
                onClick={handleComplete}
                disabled={loading}
                className="flex-1"
              >
                {loading ? (
                  <span className="flex items-center gap-md">
                    <LoadingSpinner size="sm" className="border-white border-t-transparent" />
                    Marcando...
                  </span>
                ) : (
                  <span className="flex items-center gap-md">
                    <CheckCircle2 className="w-5 h-5" />
                    Marcar como Concluído
                  </span>
                )}
              </Button>
            )}
          </div>
          
          {/* Completion History */}
          {exercise.totalCompletions > 0 && (
            <div className="mt-lg pt-lg border-t border-neutral-border">
              <p className="text-small text-neutral-textSecondary text-center">
                Você já realizou este exercício {exercise.totalCompletions} vez{exercise.totalCompletions !== 1 ? 'es' : ''}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

