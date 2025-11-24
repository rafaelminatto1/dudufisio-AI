import { ExerciseLibrary } from '~/components/features/exercises/ExerciseLibrary';

export default function ExercisesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Biblioteca de Exercícios</h1>
        <p className="text-muted-foreground">
          Gerencie e prescreva exercícios para seus pacientes
        </p>
      </div>
      <ExerciseLibrary />
    </div>
  );
}

