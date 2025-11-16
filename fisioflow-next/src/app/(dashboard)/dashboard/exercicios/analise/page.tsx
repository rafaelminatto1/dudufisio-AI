import { PoseAnalysisComponent } from './_components/pose-analysis'

export default function AnaliseExerciciosPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Análise de Movimento em Tempo Real
        </h1>
        <p className="text-muted-foreground">
          Use a câmera para analisar a execução de exercícios dos pacientes
        </p>
      </div>

      <PoseAnalysisComponent />
    </div>
  )
}

