/**
 * Componente Card de Exercício
 * MoocaFisio - App para Pacientes
 */

import { Exercise } from '../services/patientExerciseService';
import Card from './ui/Card';
import { CheckCircle2, Clock, Repeat } from 'lucide-react';
import { formatDuration } from '../lib/utils';

interface ExerciseCardProps {
  exercise: Exercise;
  onClick: () => void;
}

export default function ExerciseCard({ exercise, onClick }: ExerciseCardProps) {
  return (
    <Card hoverable onClick={onClick} className="relative">
      {/* Status Badge */}
      {exercise.completed && (
        <div className="absolute top-md right-md z-10">
          <div className="flex items-center gap-xs bg-success text-white px-md py-sm rounded-full text-small font-medium shadow-sm">
            <CheckCircle2 className="w-4 h-4" />
            <span>Concluído</span>
          </div>
        </div>
      )}
      
      {/* Thumbnail */}
      <div className="relative w-full h-48 bg-neutral-bgAlt rounded-lg overflow-hidden mb-md">
        {exercise.video?.thumbnailUrl ? (
          <img
            src={exercise.video.thumbnailUrl}
            alt={exercise.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg
              className="w-16 h-16 text-neutral-border"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        )}
        
        {/* Play overlay */}
        {exercise.video && (
          <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-primary ml-1"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
              </svg>
            </div>
          </div>
        )}
      </div>
      
      {/* Content */}
      <div>
        <h3 className="text-h4 text-neutral-text font-semibold mb-sm line-clamp-2">
          {exercise.name}
        </h3>
        
        {/* Exercise Details */}
        <div className="flex items-center gap-md text-small text-neutral-textSecondary mb-md">
          <div className="flex items-center gap-xs">
            <Repeat className="w-4 h-4" />
            <span>{exercise.sets}x{exercise.reps}</span>
          </div>
          {exercise.durationSeconds && (
            <>
              <span>•</span>
              <div className="flex items-center gap-xs">
                <Clock className="w-4 h-4" />
                <span>{formatDuration(exercise.durationSeconds)}</span>
              </div>
            </>
          )}
        </div>
        
        {/* Description */}
        {exercise.description && (
          <p className="text-body text-neutral-textSecondary line-clamp-2">
            {exercise.description}
          </p>
        )}
        
        {/* Completion Count */}
        {exercise.totalCompletions > 0 && (
          <div className="mt-md pt-md border-t border-neutral-border">
            <p className="text-small text-neutral-textSecondary">
              Realizado {exercise.totalCompletions}x
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}

