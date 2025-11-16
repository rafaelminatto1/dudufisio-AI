import { useEffect, useState } from 'react';
import { fetchExercises, fetchProgress } from '../services/exercise.service';
import type { Exercise, ExerciseProgressPoint } from '../types';

export function useExercises() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [progress, setProgress] = useState<ExerciseProgressPoint[]>([]);
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      const [exerciseData, progressData] = await Promise.all([
        fetchExercises(),
        fetchProgress(),
      ]);
      setExercises(exerciseData);
      setProgress(progressData);
      setLoading(false);
    };

    run();
  }, []);

  return {
    exercises,
    progress,
    isLoading,
  };
}

