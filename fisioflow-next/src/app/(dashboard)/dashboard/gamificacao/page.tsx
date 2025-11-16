import { createClient } from '@/lib/supabase/server'
import { GamificationDashboard } from './_components/gamification-dashboard'

export default async function GamificacaoPage() {
  const supabase = await createClient()
  
  // Buscar dados de gamificação
  const { data: progresso } = await supabase
    .from('gamificacao_progresso')
    .select('*')
    .order('pontos', { ascending: false })
    .limit(10)

  const { data: conquistas } = await supabase
    .from('gamificacao_conquistas')
    .select('*')
    .order('pontos', { ascending: false })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Gamificação</h1>
        <p className="text-muted-foreground">
          Sistema de recompensas e conquistas para engajamento dos pacientes
        </p>
      </div>

      <GamificationDashboard
        progresso={progresso || []}
        conquistas={conquistas || []}
      />
    </div>
  )
}

