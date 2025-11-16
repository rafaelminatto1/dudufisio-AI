// components/atendimento/context/ExercisesCard.tsx
import React from 'react';
import { Dumbbell, Clock, BarChart3 } from 'lucide-react';
import type { ExercisePrescription } from '../../../types';

interface ExercisesCardProps {
  exercises: ExercisePrescription[];
}

export const ExercisesCard: React.FC<ExercisesCardProps> = ({ exercises }) => {
  if (exercises.length === 0) {
    return (
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
          <Dumbbell className="w-4 h-4" />
          Exercícios Prescritos
        </h4>
        <div className="text-center py-6 text-sm text-slate-500">
          Nenhum exercício prescrito
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
        <Dumbbell className="w-4 h-4" />
        Exercícios ({exercises.length})
      </h4>

      <div className="space-y-2">
        {exercises.slice(0, 4).map((exercise) => (
          <div
            key={exercise.id}
            className="p-2 bg-slate-50 rounded border border-slate-200 hover:border-green-300 transition-colors"
          >
            <p className="text-xs font-medium text-slate-900 mb-1">
              {exercise.name}
            </p>

            <div className="flex items-center gap-3 text-xs text-slate-600">
              {exercise.sets && exercise.reps && (
                <div className="flex items-center gap-1">
                  <BarChart3 className="w-3 h-3" />
                  <span>{exercise.sets}x{exercise.reps}</span>
                </div>
              )}

              {exercise.duration && (
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{exercise.duration}</span>
                </div>
              )}
            </div>

            {exercise.instructions && (
              <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                {exercise.instructions}
              </p>
            )}
          </div>
        ))}

        {exercises.length > 4 && (
          <button className="w-full py-1.5 text-xs text-blue-600 hover:text-blue-700 font-medium">
            Ver todos ({exercises.length})
          </button>
        )}
      </div>
    </div>
  );
};
