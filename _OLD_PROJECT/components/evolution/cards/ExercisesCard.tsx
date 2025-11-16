import React from 'react';
import { Dumbbell, PlayCircle, CheckCircle2 } from 'lucide-react';
import { ExercisePrescription } from '../../../types';
import CollapsibleCard from '../CollapsibleCard';

interface ExercisesCardProps {
  exercises: ExercisePrescription[];
  defaultExpanded?: boolean;
  onToggle?: (expanded: boolean) => void;
}

/**
 * Card com exercícios prescritos do plano de tratamento
 */
const ExercisesCard: React.FC<ExercisesCardProps> = ({
  exercises,
  defaultExpanded = false,
  onToggle,
}) => {
  return (
    <CollapsibleCard
      id="exercises"
      title={`Exercícios (${exercises.length})`}
      icon={<Dumbbell className="w-5 h-5" />}
      defaultExpanded={defaultExpanded}
      onToggle={onToggle}
    >
      {exercises.length === 0 ? (
        <div className="text-center py-6 text-slate-500 text-sm">
          <Dumbbell className="w-8 h-8 mx-auto mb-2 text-slate-300" />
          <p>Nenhum exercício prescrito</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-80 overflow-y-auto">
          {exercises.map((exercise, idx) => (
            <div
              key={exercise.id || idx}
              className="p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
            >
              {/* Cabeçalho do Exercício */}
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-start gap-2 flex-1">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-blue-700">
                      {idx + 1}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h5 className="text-sm font-medium text-slate-900">
                      {exercise.exerciseName}
                    </h5>
                  </div>
                </div>

                {/* Status Badge (pode ser implementado no futuro) */}
                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-md flex-shrink-0">
                  Ativo
                </span>
              </div>

              {/* Parâmetros do Exercício */}
              <div className="flex flex-wrap gap-2 text-xs">
                {/* Sets x Repetitions */}
                <div className="px-2 py-1 bg-blue-50 text-blue-700 rounded-md">
                  <strong>{exercise.sets}</strong> x{' '}
                  <strong>{exercise.repetitions}</strong>
                </div>

                {/* Resistance Level */}
                {exercise.resistanceLevel && (
                  <div className="px-2 py-1 bg-purple-50 text-purple-700 rounded-md">
                    {exercise.resistanceLevel}
                  </div>
                )}
              </div>

              {/* Progression Criteria */}
              {exercise.progressionCriteria && (
                <div className="mt-2 pt-2 border-t border-slate-200">
                  <p className="text-xs text-slate-600">
                    <strong className="text-slate-700">Progressão:</strong>{' '}
                    {exercise.progressionCriteria}
                  </p>
                </div>
              )}

              {/* Demonstration Video */}
              {exercise.demonstrationVideoUrl && (
                <button
                  onClick={() => window.open(exercise.demonstrationVideoUrl, '_blank')}
                  className="mt-2 w-full px-3 py-1.5 text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-md transition-colors flex items-center justify-center gap-1.5"
                >
                  <PlayCircle className="w-3.5 h-3.5" />
                  Ver Demonstração
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Summary Footer */}
      {exercises.length > 0 && (
        <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-xs">
          <span className="text-slate-600">Total de exercícios</span>
          <span className="font-semibold text-slate-900">{exercises.length}</span>
        </div>
      )}
    </CollapsibleCard>
  );
};

export default ExercisesCard;

